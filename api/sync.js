import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL");
}

if (!supabaseKey) {
  throw new Error("Missing SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("inventory_sync")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase GET error:", error);

        return res.status(500).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        data,
      });
    }

    if (req.method === "POST") {
      const payload = req.body;

      if (!payload || typeof payload !== "object") {
        return res.status(400).json({
          success: false,
          error: "Invalid request body",
        });
      }

      const { data, error } = await supabase
        .from("inventory_sync")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("Supabase POST error:", error);

        return res.status(500).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        data,
      });
    }

    res.setHeader("Allow", ["GET", "POST"]);

    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  } catch (error) {
    console.error("API error:", error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
