# Kiemke-Lau2 - Fixed

Đã sửa:
- Đồng bộ thư mục `dist` ở root với bản build mới nhất trong `kiem-ke-app/dist`.
- Sửa `server.js` để `/api/sync` được xử lý trước static fallback.
- Thêm hỗ trợ GET/HEAD và MIME type cho asset.
- Chặn path traversal khi serve file.
- Sửa script `build` để build xong copy đúng một lần sang root `dist`.
- Giữ nguyên React ErrorBoundary, Supabase và giao diện hiện tại.

Chạy local:
1. `npm run build`
2. `npm start`
3. Mở `http://localhost:3000`
