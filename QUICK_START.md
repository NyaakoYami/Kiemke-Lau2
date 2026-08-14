## ⚡ QUICK START - Bắt Đầu Ngay

### 🎯 Những Gì Bạn Cần Làm Ngay

#### 1️⃣ **Setup Git (5 phút)**

```bash
cd c:\Users\Yami\Desktop\Kiemke-Lau2

# Khởi tạo Git
git init
git add .
git commit -m "🎉 New features: add/remove cabin, custom colors, online sync"
```

#### 2️⃣ **Tạo GitHub Repo (2 phút)**

- Đi: https://github.com/new
- Tên: `kiemke-lau2`
- Public (có thể private cũng được)
- Copy URL repo

#### 3️⃣ **Push Lên GitHub (2 phút)**

```bash
git remote add origin https://github.com/YOUR_USERNAME/kiemke-lau2.git
git branch -M main
git push -u origin main
```

#### 4️⃣ **Deploy Vercel (5 phút)**

- Đi: https://vercel.com/new
- Import repo từ GitHub
- Click Deploy
- Xong! URL sẽ là: `https://kiemke-lau2.vercel.app`

---

### ✨ Tính Năng Mới Trong App

| Feature        | Cách Dùng                     | Icon |
| -------------- | ----------------------------- | ---- |
| Thêm cabin     | Click `+` ở "Agent (STT ...)" | ➕   |
| Xoá cabin      | Click `✕` ở cabin             | ❌   |
| Chỉnh màu      | Click `🎨` ở cabin            | 🎨   |
| Đồng bộ online | Click `☁️ Đồng bộ Online`     | ☁️   |
| Chỉnh tên      | Click tên cabin               | ✏️   |
| Chỉnh STT      | Click "STT xxx"               | 🔢   |

---

### 📚 Tài Liệu (Nên Đọc)

| File                  | Mục Đích                         |
| --------------------- | -------------------------------- |
| `README_VIET.md`      | 📖 Hướng dẫn sử dụng chi tiết    |
| `DEPLOYMENT_GUIDE.md` | 🚀 Hướng dẫn deploy & setup sync |
| `CHANGELOG.md`        | 📝 Danh sách features & fixes    |

---

### 🔄 Online Sync Setup (Quan Trọng!)

**Chọn 1 cách:**

#### **A. Supabase (Recommended) ⭐**

1. https://supabase.com → Sign up
2. Create project PostgreSQL
3. Chạy SQL:

```sql
CREATE TABLE inventory_sync (
  id BIGSERIAL PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
INSERT INTO inventory_sync (data) VALUES ('{}');
```

4. Copy API URL + anon key
5. Thêm vào `index.html` line ~1100:

```javascript
const SUPABASE_URL = "https://xxxx.supabase.co";
const SUPABASE_KEY = "eyJhb...";
const SYNC_ENDPOINT = "supabase";
```

6. Git push

#### **B. npoint.io (Fastest) 🟢**

1. https://npoint.io
2. Paste:

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

3. Copy URL
4. Thêm vào `index.html`:

```javascript
const NPOINT_URL = "https://npoint.io/xxxxx";
const SYNC_ENDPOINT = "npoint";
```

5. Git push

---

### ✅ Testing Checklist

Trước khi deploy:

```bash
# 1. Test local
node server.js
# Mở: http://localhost:3000

# 2. Kiểm tra features:
□ Thêm cabin (+)
□ Xoá cabin (✕)
□ Chỉnh màu (🎨)
□ Chỉnh STT (click STT)
□ Chỉnh tên (click tên)
□ Xuất JSON (💾)
□ Nhập JSON (📂)
□ Sync Online (☁️)
□ Refresh page → dữ liệu vẫn có

# 3. Deploy
git push origin main
```

---

### 🎯 Hàng Ngày

**Workflow cho team:**

1. Mở https://kiemke-lau2.vercel.app
2. Kiểm kê (tick checkboxes, đổi tên, ...)
3. Chỉnh màu nếu cần
4. Thêm/xoá cabin nếu cần
5. Click `☁️ Đồng bộ Online`
6. Team khác refresh → thấy dữ liệu mới

---

### 🆘 Gặp Problem?

| Vấn Đề                  | Cách Fix                                           |
| ----------------------- | -------------------------------------------------- |
| Sync không hoạt động    | Check console (F12), verify Supabase/npoint config |
| Dữ liệu mất sau refresh | Check localStorage (F12 → Application)             |
| Deploy fail             | Check Vercel logs, verify all files are in repo    |
| Màu không lưu           | Clear cache, export/import JSON, reset browser     |

---

### 📞 Chia Sẻ Với Team

Gửi cái này cho team:

```
🎉 Kiemke-Lau2 v2.0 Ready!

Các tính năng mới:
✅ Thêm/xoá cabin
✅ Chỉnh màu theo team
✅ Đồng bộ online (mọi người cùng xem)

URL: https://kiemke-lau2.vercel.app

Hướng dẫn: Xem file README_VIET.md

Workflow:
1. Làm việc
2. Click "Đồng bộ Online" khi xong
3. Mọi người refresh → xem dữ liệu mới
```

---

### 🚀 Next Steps

**Prioritize:**

1. ✅ Deploy lên Vercel (ngay hôm nay)
2. ✅ Setup Supabase/npoint (hôm nay)
3. ⏳ Train team cách dùng (ngày mai)
4. ⏳ Export data weekly (hàng tuần)

---

**You're all set! Let's go! 🚀**

Questions? Check `README_VIET.md` or `DEPLOYMENT_GUIDE.md`
