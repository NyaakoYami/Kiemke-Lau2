# V7 — Operations Dashboard UI/UX Redesign

## Thay đổi chính

### Overview
- Chia thống kê thành 2 nhóm: **Thiết bị cố định** và **Laptop di động**.
- Thiết bị cố định hiển thị theo grid 3 cột trên desktop (2 hàng), responsive xuống 2/1 cột.
- Laptop được tách thành nhóm riêng, label dài tự xuống dòng.

### Floor Breakdown
- Bỏ thanh tiến trình và phần trăm.
- Chỉ hiển thị 4 chỉ số cabin:
  - Tổng cabin Agent.
  - Cabin Agent = Agent có Team khác `Full` và `Trống`.
  - Cabin còn lại = Agent thuộc Team `Full`.
  - Cabin trống = Agent thuộc Team `Trống`.
- Có tab nổi bật để chuyển nhanh `Tất cả / Lầu 2 / Lầu 3`.
- Chi tiết 8 danh mục thiết bị vẫn được giữ nguyên bên dưới.

### Filters & Actions
- Tách khu vực **Bộ lọc dữ liệu** khỏi **Thao tác hệ thống**.
- Toolbar được thiết kế dạng sticky trên desktop để thao tác Reset / JSON / Cloud luôn dễ tiếp cận.
- Mobile tự chuyển thành layout dọc.

### Agent Cabin List
- Agent sử dụng compact card grid thay cho danh sách dọc quá dài.
- Badge trạng thái `Đủ bộ / Đang kiểm / Chưa kiểm` được nhấn mạnh.
- Vùng quantity nhỏ gọn nhưng tách biệt khỏi asset label.
- Label dài tự wrap, không che số lượng.

## Logic được giữ nguyên
- Read-only mặc định / Admin mode.
- Email `@vietmyssu.com`.
- Supabase Sync.
- LocalStorage.
- JSON Import / Export.
- Team Color Coding.
- Laptop với 2 cấu hình bắt buộc.
- Poppins + Heroicons SVG.
