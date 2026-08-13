/\*\*

- Kiemke-Lau2 - Setup Guide for Online Sync
-
- Giải pháp đơn giản nhất để lưu dữ liệu online:
- Sử dụng npoint.io (không cần authentication, free)
-
- HƯỚNG DẪN:
- =========
-
- 1.  Đầu tiên, truy cập https://npoint.io
-
- 2.  Tạo một JSON document mới:
- ```json

  ```
- {
-      "inventoryState": {},
-      "customNames": {},
-      "customColors": {},
-      "laneSttRanges": {},
-      "customStts": {},
-      "lastUpdate": "2026-08-13T00:00:00Z"
- }
- ```

  ```
-
- 3.  Sao chép URL nhận được (ví dụ: https://npoint.io/xxxxxxx)
-
- 4.  Dán URL này vào biến NPOINT_URL trong file index.html
- - Tìm dòng: const NPOINT_URL = 'YOUR_NPOINT_URL_HERE';
- - Thay thế bằng URL thực của bạn
-
- 5.  Lưu file và deploy lên Vercel
-
-
- CÁCH KHÁC (Nếu muốn persistent storage):
- ==========================================
-
- Sử dụng Supabase PostgreSQL (free tier):
- - https://supabase.com
- - Tạo project
- - Tạo table "inventory_sync"
- - Config API URL và key
-
-
- Cách hoạt động:
- ===============
- - Mỗi lần người dùng ấn "Đồng bộ Online"
- - Dữ liệu sẽ được gửi lên npoint.io
- - Mọi người truy cập lại trang sẽ tải dữ liệu mới nhất
- - Tất cả mọi người trên team cùng nhìn thấy dữ liệu
- \*/

// Hướng dẫn tạo Supabase integration:
const SUPABASE_SETUP = `

1. Đi tới https://supabase.com
2. Tạo account và project mới
3. Vào SQL Editor, chạy:

CREATE TABLE inventory_sync (
id BIGSERIAL PRIMARY KEY,
data JSONB NOT NULL,
updated_at TIMESTAMP DEFAULT NOW(),
updated_by TEXT
);

4. Lấy API URL và anon key từ Settings > API
5. Update SUPABASE_CONFIG trong index.html
   `;

// Hoặc dùng Google Sheets API (advanced)
const GOOGLE_SHEETS_SETUP = `

1. Create Google Sheet
2. Enable Sheets API
3. Create service account
4. Share sheet with service account email
5. Use googleapis npm package to sync
   `;

console.log('📖 Setup Guide loaded. Choose one method above.');
