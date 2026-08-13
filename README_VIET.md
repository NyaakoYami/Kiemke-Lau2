# 📋 Kiemke-Lau2 - Hướng Dẫn Sử Dụng Phiên Bản Mới

## ✨ Tính Năng Mới Được Thêm

### 1. ➕ Thêm / Xoá Cabin

- **Thêm cabin**: Click nút `+` ở cạnh "Agent (STT ...)"
- **Xoá cabin**: Click nút `✕` ở góc phải của cabin muốn xoá
- **Di chuyển cabin**: (Sẽ được thêm trong tương lai)

### 2. 🎨 Chỉnh Màu Theo Team

- Click nút `🎨` trên mỗi cabin (Lead hoặc Agent)
- Chọn màu tương ứng với team:
  - 👤 **User** - Hồng
  - 📱 **Social** - Cam
  - 🏪 **Merchant** - Xanh nhạt
  - 🌙 **NightShift / Senior** - Vàng
  - 👨‍💼 **SPT / PT** - Tím
  - ❌ **Trống** - Xám
  - 💼 **Lead** - Xanh đậm

### 3. ☁️ Đồng Bộ Dữ Liệu Online

- Click nút `☁️ Đồng bộ Online` để lưu dữ liệu lên server
- Tất cả mọi người trên team sẽ thấy dữ liệu mới nhất
- Dữ liệu sẽ được lưu persistent (không bị mất khi tắt browser)

---

## 🚀 Setup Online Sync (Rất Quan Trọng!)

### Bước 1: Chọn Backend Lưu Trữ

#### **Cách 1: Supabase (Khuyên dùng) ⭐**

**Ưu điểm:**

- Free tier đủ mạnh
- Lưu persistent (không bị mất)
- Có realtime updates (tương lai)
- Dễ scale khi grow

**Setup:**

1. Đi tới https://supabase.com
2. Click `Sign Up` → tạo account
3. Tạo new project mới
4. Chọn database PostgreSQL
5. Chờ 1-2 phút project init

**6. Tạo Table:**
Vào `SQL Editor` → Paste đoạn này → Run:

````sql
CREATE TABLE inventory_sync (
  id BIGSERIAL PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()

- Vào `Settings` → `API`
- Copy: `Project URL` (ví dụ: https://xxxx.supabase.co)
- Copy: `anon public` key
- Lưu 2 giá trị này

**8. Update index.html:**
Tìm dòng này (gần cuối file):

```javascript
const SYNC_ENDPOINT = "/api/sync";
````

Thay bằng:

```javascript
const SUPABASE_URL = "https://xxxx.supabase.co"; // Thay xxxx
const SUPABASE_KEY = "eyJhb..."; // Paste key của bạn
const SYNC_ENDPOINT = "supabase"; // Đánh dấu dùng Supabase
```

---

#### **Cách 2: npoint.io (Nhanh nhất, không cần setup) 🟢**

**Ưu điểm:**

- Không cần setup account
- Instant lấy URL
- Đơn giản nhất

**Setup:**

1. Đi tới https://npoint.io
2. Paste JSON này vào:

```json
{
  "inventoryState": {},
  "customNames": {},
  "customColors": {},
  "laneSttRanges": {},
  "customStts": {},
  "lastUpdate": "2026-08-13T00:00:00Z"
}
```

3. Click `Create Bin`
4. Copy URL nhận được (ví dụ: `https://npoint.io/xxxxxxx`)
5. Dán vào index.html tìm:

```javascript
const NPOINT_URL = "YOUR_NPOINT_URL_HERE";
```

---

### Bước 2: Deploy lên Vercel

1. Đã có repo GitHub của project này chưa?
   - Nếu chưa: `git init` → `git add .` → `git commit -m "Initial"`

2. Push lên GitHub:

```bash
git remote add origin https://github.com/YOUR_USERNAME/kiemke-lau2.git
git branch -M main
git push -u origin main
```

3. Vào vercel.com → Import project từ GitHub
4. Chọn repo `kiemke-lau2`
5. Deploy (Vercel tự detect settings)

6. Sau khi deploy xong:
   - Vào Settings → Environment Variables
   - Thêm:
     - Key: `SUPABASE_URL`, Value: `https://xxxx.supabase.co`
     - Key: `SUPABASE_KEY`, Value: (paste key)
   - Redeploy

7. Done! Truy cập https://kiemke-lau2.vercel.app

---

## 💾 Cách Sử Dụng

### Lưu Dữ Liệu Local (Mặc định)

- Mỗi thay đổi sẽ tự lưu vào localStorage
- Dữ liệu sẽ được giữ ngay cả khi tắt browser
- **Chỉ có máy này thấy**

### Đồng Bộ Online

1. Làm xong công việc → Click `☁️ Đồng bộ Online`
2. Mọi người refresh lại trang sẽ thấy dữ liệu mới
3. **Tất cả team thấy dữ liệu**

### Xuất / Nhập JSON

- **Xuất JSON**: Lưu file backup của dữ liệu
- **Nhập JSON**: Khôi phục từ file cũ (nếu cần)

---

## 🎯 Quy Trình Làm Việc

### Hàng Ngày:

1. Mở trang web https://kiemke-lau2.vercel.app
2. Thực hiện kiểm kê:
   - ✅ Tích checkbox items (Thùng, Màn, Chuột, Phím, Tai nghe)
   - 📝 Sửa tên cabin nếu cần
   - 🎨 Chỉnh màu theo team nếu thay đổi
   - ➕ Thêm cabin nếu cần
   - ➖ Xoá cabin rỗng
3. Khi hoàn thành → Click `☁️ Đồng bộ Online`
4. **Tất cả mọi người đều thấy dữ liệu mới!**

### Cuối Tháng:

- Xuất Excel `📊 Xuất Excel` để tạo báo cáo
- Xuất JSON `💾 Xuất JSON` để backup

---

## 🆘 Troubleshooting

### Nút Đồng bộ không hoạt động

- **Kiểm tra**: Đã setup Supabase/npoint chưa?
- **Kiểm tra**: Đã paste URL/Key vào code chưa?
- **Kiểm tra**: Có lỗi network không? (F12 → Console)

### Dữ liệu không được lưu

- **Cách 1**: Xoá localStorage trong DevTools
  - F12 → Application → LocalStorage → xoá `inventoryData2Floors_v2`
  - Refresh trang
- **Cách 2**: Nhập JSON cũ: `📂 Nhập JSON`

### Mấy người edit cùng lúc

- **Hiện tại**: Không support real-time
- **Cách làm**: Một người edit xong → Đồng bộ → Người khác refresh
- **Tương lai**: Sẽ thêm real-time sync với Supabase

---

## 📊 Dữ Liệu Được Lưu

| Field            | Mô Tả                                   |
| ---------------- | --------------------------------------- |
| `inventoryState` | Checkbox items (Thùng, Màn, Chuột, ...) |
| `customNames`    | Tên cabin được sửa lại                  |
| `customColors`   | Màu cabin được chỉnh                    |
| `laneSttRanges`  | Khoảng STT của từng dãy                 |
| `customStts`     | STT riêng cho từng cabin                |

---

## 🔒 Bảo Mật

- **Local**: Dữ liệu được lưu trên máy (không up lên đâu nếu không ấn Sync)
- **Online**: Dữ liệu sync lên server công khai (nếu ai biết URL cũng có thể xem)
- **Authentication**: Chưa có authentication (tương lai sẽ thêm)

**Khuyến cáo:** Không chia sẻ URL Supabase/npoint công khai!

---

## 📱 Mobile Support

✅ Trang web hoàn toàn responsive, dùng được trên:

- Desktop
- Tablet
- Mobile phone

---

## ❓ Câu Hỏi Thường Gặp

**Q: Dữ liệu lưu ở đâu?**
A: Local (localStorage) + Server tuỳ chọn (Supabase/npoint)

**Q: Có mất dữ liệu khi tắt browser?**
A: Không, dữ liệu local sẽ được giữ lại

**Q: Realtime sync được không?**
A: Hiện tại chưa, cần ấn nút Sync

**Q: Có API để integrate không?**
A: Có, `/api/sync` endpoint (đang dev)

---

## 📞 Support

Nếu có vấn đề:

1. Check console (F12)
2. Xoá localStorage thử lại
3. Backup JSON rồi reset all
4. Deploy lại từ GitHub

---

**Last Updated:** 2026-08-13
