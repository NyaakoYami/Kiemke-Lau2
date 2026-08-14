## 🚀 Hướng Dẫn Deploy Lên Vercel

### Tóm Tắt Những Gì Đã Được Thêm Mới

✅ **Thêm/Xoá Cabin**

- Nút `+` để thêm cabin
- Nút `✕` để xoá cabin
- Dễ dàng quản lý số lượng cabin

✅ **Chỉnh Màu Theo Team**

- Nút `🎨` trên mỗi cabin
- Chọn màu cho từng team
- Lưu màu tùy chỉnh

✅ **Đồng Bộ Dữ Liệu Online**

- Nút `☁️ Đồng bộ Online`
- Mọi người trên team cùng nhìn thấy dữ liệu
- Dữ Liệu lưu persistent (không bị mất)

✅ **Hỗ Trợ Thêm/Bớt/Di Chuyển Cabin**

- Thêm: Click `+` ở label Agent
- Xoá: Click `✕` ở cabin
- Rename: Click vào tên cabin để sửa
- Chỉnh STT: Click vào "STT xxx" để edit

---

### 📋 Các File Được Tạo/Sửa

| File                   | Ghi Chú                                 |
| ---------------------- | --------------------------------------- |
| `index.html`           | ✏️ Thêm features mới + styling          |
| `api/sync.js`          | ✨ Serverless function để lưu/load data |
| `server.js`            | 🧪 Local test server (không cần deploy) |
| `vercel.json`          | ⚙️ Config cho Vercel                    |
| `README_VIET.md`       | 📖 Hướng dẫn sử dụng chi tiết           |
| `ONLINE_SYNC_SETUP.md` | 🔧 Hướng dẫn setup online sync          |

---

### 🎯 Các Bước Deploy

#### **Bước 1: Chuẩn Bị Git Repository**

```bash
# Nếu chưa có Git
cd c:\Users\Yami\Desktop\Kiemke-Lau2
git init

# Thêm tất cả file
git add .

# Commit lần đầu
git commit -m "🎉 Initial commit - Add add/remove cabins, custom colors, online sync"
```

#### **Bước 2: Push Lên GitHub**

```bash
# Tạo repo mới trên GitHub.com
# Tên: kiemke-lau2
# Public (để Vercel có thể access)

# Sau đó chạy:
git remote add origin https://github.com/YOUR_USERNAME/kiemke-lau2.git
git branch -M main
git push -u origin main
```

#### **Bước 3: Deploy Lên Vercel**

1. Đi tới https://vercel.com
2. Đăng nhập (hoặc sign up với GitHub)
3. Click `Add New` → `Project`
4. Chọn repo `kiemke-lau2`
5. Settings:
   - Framework Preset: `Other` (static)
   - Build Command: (trống)
   - Output Directory: `.` (root)
   - Environment Variables: (nếu dùng Supabase)
6. Click `Deploy`
7. Chờ deploy xong (1-2 phút)
8. Domain sẽ được tạo tự động (ví dụ: `kiemke-lau2.vercel.app`)

---

### 🔧 Setup Online Sync (Rất Quan Trọng!)

**Chọn 1 trong 2 cách:**

#### **Cách A: Supabase (Persistent, Khuyên Dùng) ⭐**

1. https://supabase.com → Sign up
2. Create project
3. Chạy SQL này:

```sql
CREATE TABLE inventory_sync (
  id BIGSERIAL PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
INSERT INTO inventory_sync (data) VALUES ('{}');
```

4. Copy API URL + anon key
5. Update trong `index.html`:

```javascript
// Tìm dòng này (khoảng line 1100):
const SYNC_ENDPOINT = "/api/sync";

// Thay bằng:
const SUPABASE_URL = "https://xxxx.supabase.co";
const SUPABASE_KEY = "eyJhb...";
const SYNC_ENDPOINT = "supabase";
```

6. Git push → Vercel tự deploy lại

#### **Cách B: npoint.io (Nhanh nhất, Không Cần Setup)**

1. https://npoint.io
2. Paste JSON:

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

3. Copy URL nhận được
4. Update trong `index.html`:

```javascript
// Thay:
const SYNC_ENDPOINT = "/api/sync";
// Thành:
const NPOINT_URL = "https://npoint.io/xxxxx";
const SYNC_ENDPOINT = "npoint";
```

---

### ✅ Testing Trước Deploy

Chạy local server để test:

```bash
# Terminal 1: Chạy server
cd c:\Users\Yami\Desktop\Kiemke-Lau2
node server.js

# Mở browser: http://localhost:3000
```

**Kiểm tra:**

- [ ] Thêm cabin: Click `+` ở "Agent (STT ...)"
- [ ] Xoá cabin: Click `✕` ở cabin
- [ ] Chỉnh màu: Click `🎨`
- [ ] Chỉnh STT: Click "STT xxx"
- [ ] Chỉnh tên: Click tên cabin
- [ ] Local save: Refresh page, dữ liệu vẫn còn
- [ ] Sync: Click `☁️ Đồng bộ Online`
- [ ] Export: `💾 Xuất JSON`
- [ ] Import: `📂 Nhập JSON`

---

### 📲 Sau Khi Deploy

**URL:** https://kiemke-lau2.vercel.app

**Chia sẻ cho team:**

- Share URL trên group chat
- Hướng dẫn team đọc `README_VIET.md`
- Train team cách sử dụng:
  1. Làm việc local
  2. Ấn Sync Online khi xong
  3. Team khác refresh để xem dữ liệu mới

---

### 🔄 Auto-Deploy (Optional)

Mỗi lần push lên GitHub → Vercel tự động deploy:

```bash
# Sửa gì, rồi:
git add .
git commit -m "Update features"
git push origin main

# Vercel tự động deploy
```

---

### 🆘 Troubleshooting

**Deploy fail?**

- Check Vercel logs: https://vercel.com/dashboard
- Kiểm tra repo có tất cả file không
- Verify GitHub connection

**Sync không hoạt động?**

- Check console: F12 → Console
- Verify Supabase credentials nếu dùng
- Test local trước

**Data bị mất?**

- localStorage data được giữ (F12 → Application → LocalStorage)
- Xuất JSON để backup: `💾 Xuất JSON`

---

### 📞 Hỗ Trợ

Nếu cần help:

1. Check `README_VIET.md`
2. Xem console errors (F12)
3. Xoá localStorage test lại
4. Verify all environment variables

---

**Happy deployments! 🚀**
