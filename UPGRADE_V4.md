# Upgrade V4 — Cabin UX & Floor Asset Reporting

## Cabin UI/UX
- Removed the visible drag-handle icon from every cabin card.
- Admin mode supports press-and-hold directly on the cabin card to reposition it.
- Added touch/pointer long-press interaction plus native HTML5 drag fallback for desktop.
- Added drag source / drop target motion states and team-color visual accents.
- Existing cabin controls (Team picker, checklist, quantities, inline editing, QA actions) remain isolated from drag initiation.

## Floor Breakdown
- Removed the `Tổng chỗ` dashboard card.
- Removed percentage completion display from floor breakdown.
- Reworked each floor card into an asset report containing:
  - Tổng cabin
  - Cabin đã kiểm
  - Cabin còn lại
  - Tổng tài sản
  - PC / Thùng máy
  - Màn 20"
  - Màn 24"
  - Phím
  - Chuột
  - Tai USB
  - Laptop
- Progress bar remains as a visual checked-cabin indicator and displays `đã kiểm / tổng cabin`, without a percentage.

## Authentication
- Admin login input no longer shows the domain hint `ten@vietmyssu.com`.
- Neutral placeholder: `Email công ty`.
- Existing `@vietmyssu.com` validation and Read-only/Admin session logic are unchanged.

## Preserved
- Laptop Lead: two fixed package options.
- Supabase sync.
- LocalStorage draft persistence.
- JSON import/export.
- Team management and Team color coding.
- Poppins typography.
- Heroicons SVG implementation.
