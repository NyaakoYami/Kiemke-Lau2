/* global process */
import { createClient } from "@supabase/supabase-js";
import { getAdminAuthFromRequest } from "../shared/admin.js";

// Khởi tạo client "lười": nếu thiếu biến môi trường, trước đây module throw ngay
// khi import -> Vercel trả về trang lỗi 500 không phải JSON và frontend chỉ thấy
// "HTTP 500". Giờ mọi lỗi cấu hình đều trả JSON có thông báo rõ ràng.
let cachedClient = null;

function getSupabase() {
  const url = (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const key = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

  if (!url) throw new ConfigError("Thiếu biến môi trường SUPABASE_URL trên Vercel.");
  if (!key) throw new ConfigError("Thiếu biến môi trường SUPABASE_SECRET_KEY trên Vercel.");
  if (!/^https:\/\/.+/i.test(url)) {
    throw new ConfigError(`SUPABASE_URL không hợp lệ ("${url}"). Phải có dạng https://<project-ref>.supabase.co`);
  }

  if (!cachedClient) {
    cachedClient = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return cachedClient;
}

class ConfigError extends Error {}

function supabaseHost() {
  try {
    return new URL((process.env.SUPABASE_URL || "").trim()).host;
  } catch {
    return "(không đọc được SUPABASE_URL)";
  }
}

// supabase-js không throw khi mất mạng mà trả về { error: { message: "TypeError: fetch failed" } }.
// Dịch các lỗi đó sang thông báo người dùng hiểu được.
function describeSupabaseError(error) {
  const raw = `${error?.message || ""} ${error?.details || ""} ${error?.hint || ""}`;

  if (/ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(raw)) {
    return {
      status: 502,
      message: `Không tìm thấy máy chủ Supabase "${supabaseHost()}". Project Supabase có thể đã bị xoá/tạm dừng hoặc SUPABASE_URL sai.`,
    };
  }
  if (/fetch failed|ECONNREFUSED|ECONNRESET|ETIMEDOUT|network/i.test(raw)) {
    return {
      status: 502,
      message: `Không kết nối được tới Supabase "${supabaseHost()}". Kiểm tra project Supabase còn hoạt động (không bị Paused) và SUPABASE_URL đúng.`,
    };
  }
  if (/Invalid API key|JWT|apikey/i.test(raw)) {
    return { status: 500, message: "SUPABASE_SECRET_KEY không hợp lệ hoặc đã bị thu hồi." };
  }
  if (error?.code === "42P01" || /relation .* does not exist|Could not find the table/i.test(raw)) {
    return {
      status: 500,
      message: "Chưa có bảng inventory_sync. Hãy chạy file supabase/inventory_sync.sql trong Supabase SQL Editor.",
    };
  }
  return { status: 500, message: error?.message || "Lỗi Supabase không xác định" };
}

function sendError(res, status, message) {
  return res.status(status).json({ success: false, error: message });
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  let supabase;
  try {
    supabase = getSupabase();
  } catch (error) {
    console.error("Supabase config error:", error);
    return sendError(res, 500, error.message);
  }

  try {
    if (req.method === "GET") {
      // Bảng inventory_sync chỉ có đúng 1 dòng (id = 1) chứa toàn bộ state.
      const { data: row, error } = await supabase
        .from("inventory_sync")
        .select("data, updated_at")
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        console.error("Supabase GET error:", error);
        const { status, message } = describeSupabaseError(error);
        return sendError(res, status, message);
      }

      return res.status(200).json({
        success: true,
        data: row?.data ?? {},
        updatedAt: row?.updated_at ?? null,
      });
    }

    if (req.method === "POST") {
      const { isAdmin } = getAdminAuthFromRequest(req);
      if (!isAdmin) return sendError(res, 403, "Cần quyền Admin để lưu Cloud.");

      let payload = req.body;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch {
          return sendError(res, 400, "Body JSON không hợp lệ");
        }
      }

      const state = payload?.data;
      if (!state || typeof state !== "object" || Array.isArray(state) || !Array.isArray(state.floors)) {
        return sendError(res, 400, "Dữ liệu gửi lên không đúng định dạng kiểm kê (thiếu floors).");
      }

      // upsert id = 1: luôn ghi đè đúng 1 dòng duy nhất.
      const { data, error } = await supabase
        .from("inventory_sync")
        .upsert(
          { id: 1, data: state, updated_at: new Date().toISOString() },
          { onConflict: "id" },
        )
        .select("updated_at")
        .single();

      if (error) {
        console.error("Supabase POST error:", error);
        const { status, message } = describeSupabaseError(error);
        return sendError(res, status, message);
      }

      return res.status(200).json({ success: true, updatedAt: data.updated_at });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return sendError(res, 405, "Method not allowed");
  } catch (error) {
    console.error("API error:", error);
    const { status, message } = describeSupabaseError(error);
    return sendError(res, status, message);
  }
}
