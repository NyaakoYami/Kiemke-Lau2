import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL");
}

if (!supabaseSecretKey) {
  throw new Error("Missing SUPABASE_SECRET_KEY");
}

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      // Bảng inventory_sync chỉ có đúng 1 dòng (id = 1) chứa toàn bộ state.
      // Trước đây code select("*") toàn bảng và order theo cột "created_at"
      // (cột này KHÔNG tồn tại trong schema, chỉ có "updated_at") -> Supabase
      // trả lỗi hoặc trả về một MẢNG nhiều dòng thay vì 1 object, khiến
      // frontend không bao giờ đọc được data.floors và luôn rơi về dữ liệu mặc định.
      const { data: row, error } = await supabase
        .from("inventory_sync")
        .select("data, updated_at")
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        console.error("Supabase GET error:", error);

        return res.status(500).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        data: row?.data ?? {},
        updatedAt: row?.updated_at ?? null,
      });
    }

    if (req.method === "POST") {
      let payload = req.body;

      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch {
          return res.status(400).json({
            success: false,
            error: "Invalid JSON body",
          });
        }
      }

      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return res.status(400).json({
          success: false,
          error: "Invalid request body",
        });
      }

      // payload = { data: appState }. Trước đây code dùng .insert() nên MỖI LẦN
      // bấm "Lưu Cloud" lại tạo thêm 1 dòng mới trong bảng, không bao giờ ghi đè
      // dòng cũ -> dữ liệu cũ/mới lẫn lộn và không đồng bộ 2 chiều được.
      // Dùng .upsert() với id cố định = 1 để luôn cập nhật đúng 1 dòng duy nhất.
      const { data, error } = await supabase
        .from("inventory_sync")
        .upsert(
          {
            id: 1,
            data: payload.data ?? payload,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        )
        .select("data, updated_at")
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
        data: data.data,
        updatedAt: data.updated_at,
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
