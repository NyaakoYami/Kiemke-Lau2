import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const TABLE = "inventory_sync";
const ROW_ID = 1;
const MAX_BODY_BYTES = 5 * 1024 * 1024;

function sendJson(res, status, payload) {
  // Supports both Vercel's res.status().json() and Node/Vite's native ServerResponse.
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(status).json(payload);
  }

  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(body);
}

function readBody(req) {
  if (req.body !== undefined) {
    return Promise.resolve(
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body,
    );
  }

  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding?.("utf8");
    req.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
        reject(new Error("Payload too large (maximum 5 MB)."));
        req.destroy?.();
      }
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
    req.on("error", reject);
  });
}

function setCommonHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
}

export default async function handler(req, res) {
  setCommonHeaders(res);

  if (req.method === "OPTIONS") {
    if (typeof res.status === "function") return res.status(204).end();
    res.statusCode = 204;
    return res.end();
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    return sendJson(res, 500, {
      success: false,
      error:
        "Supabase server environment variables are missing. Configure SUPABASE_URL and SUPABASE_SECRET_KEY.",
    });
  }

  try {
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from(TABLE)
        .select("data, updated_at, updated_by")
        .eq("id", ROW_ID)
        .maybeSingle();

      if (error) throw error;

      return sendJson(res, 200, {
        success: true,
        data: data?.data ?? null,
        updatedAt: data?.updated_at ?? null,
        updatedBy: data?.updated_by ?? null,
      });
    }

    if (req.method === "POST") {
      const body = await readBody(req);
      const inventoryData = body?.data;

      if (
        !inventoryData ||
        typeof inventoryData !== "object" ||
        Array.isArray(inventoryData)
      ) {
        return sendJson(res, 400, {
          success: false,
          error: "Missing or invalid data payload.",
        });
      }

      const updatedBy =
        typeof body?.updatedBy === "string" && body.updatedBy.trim()
          ? body.updatedBy.trim().slice(0, 120)
          : null;

      const { data, error } = await supabase
        .from(TABLE)
        .upsert(
          {
            id: ROW_ID,
            data: inventoryData,
            updated_at: new Date().toISOString(),
            updated_by: updatedBy,
          },
          { onConflict: "id" },
        )
        .select("updated_at, updated_by")
        .single();

      if (error) throw error;

      return sendJson(res, 200, {
        success: true,
        message: "Data saved successfully",
        updatedAt: data.updated_at,
        updatedBy: data.updated_by,
      });
    }

    res.setHeader("Allow", "GET, POST, OPTIONS");
    return sendJson(res, 405, {
      success: false,
      error: "Method not allowed",
    });
  } catch (error) {
    console.error("Supabase sync error:", error);
    return sendJson(res, 500, {
      success: false,
      error: error?.message || "Supabase request failed",
      code: error?.code || null,
      hint: error?.hint || null,
    });
  }
}
