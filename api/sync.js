import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_SECRET_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (!supabase) {
    return res.status(500).json({
      success: false,
      error:
        "Supabase server environment variables are missing. Configure SUPABASE_URL and SUPABASE_SECRET_KEY in Vercel.",
    });
  }

  try {
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("inventory_sync")
        .select("data, updated_at")
        .eq("id", 1)
        .maybeSingle();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data?.data ?? null,
        updatedAt: data?.updated_at ?? null,
      });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const inventoryData = body?.data;

      if (!inventoryData || typeof inventoryData !== "object") {
        return res.status(400).json({
          success: false,
          error: "Missing or invalid data payload.",
        });
      }

      const { data, error } = await supabase
        .from("inventory_sync")
        .upsert(
          {
            id: 1,
            data: inventoryData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        )
        .select("updated_at")
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: "Data saved successfully",
        updatedAt: data.updated_at,
      });
    }

    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  } catch (error) {
    console.error("Supabase sync error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Supabase request failed",
    });
  }
}
