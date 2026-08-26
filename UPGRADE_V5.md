# V5 — Cập nhật danh mục tài sản & UI/UX

## Danh mục tài sản chuẩn
1. Thùng máy
2. Màn 20"
3. Màn 24"
4. Chuột
5. Phím
6. Tai USB
7. Laptop + Sạc + Chuột
8. Laptop + Sạc + Chuột + Túi chống sốc

## Thay đổi dữ liệu
- `PC / Thùng máy` được đổi thành `Thùng máy` ở dashboard và floor breakdown.
- Laptop Lead được phân loại thành đúng 2 package cố định qua `laptop_package`.
- Floor breakdown đếm riêng hai package Laptop.
- Tổng tài sản tính mỗi Laptop package là một đơn vị tài sản, đồng thời các thiết bị có `_qty` vẫn cộng theo số lượng.
- Dữ liệu Laptop package cũ không hợp lệ được normalize về package mặc định.

## UI/UX
- Auth modal dùng `position: fixed`, hiển thị gần khu vực nút đăng nhập trên desktop và căn giữa trên mobile.
- Cabin quantity dùng layout grid chống tràn chữ/số lượng.
- Laptop selector chuyển thành control 2 hàng, full-width, không chồng cabin kế bên.
- Team color được giữ bằng `--team-color`, border/accent dùng trực tiếp màu Team; shadow được tint theo chính màu Team.
- Dashboard và floor report hỗ trợ label dài bằng wrapping responsive.
