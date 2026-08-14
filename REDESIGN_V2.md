# Kiểm Kê Lầu 2 — Redesign V2

## UX
- Desktop: Team Control Center cố định bên trái (~25%), khu vực cabin bên phải (~75%).
- Mobile: Team Control Center chuyển thành bottom sheet, mở bằng FAB "Quản lý Team".
- Cabin grid giữ thao tác kéo-thả và cuộn ngang trên màn hình nhỏ.
- Team được quản lý bằng palette màu định sẵn; đổi màu Team cập nhật toàn bộ cabin đang dùng Team đó.
- Bổ sung xoá Team; cabin của Team bị xoá được chuyển về `Trống`.

## Dropdown clipping fix
Menu chọn Team của cabin/dãy được render bằng `ReactDOM.createPortal(..., document.body)`.
Điều này tách menu khỏi stacking context/overflow của CSS Grid và tránh bị cabin hoặc lane kế bên che khuất.

## Source
- React 19 + Vite
- PrimeReact / PrimeFlex / PrimeIcons
- Supabase sync và JSON import/export được giữ nguyên.
