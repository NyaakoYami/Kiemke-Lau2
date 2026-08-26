# Kiemke Lầu 2/3 — UI/UX & Access Upgrade V3

## Implemented
- Read-only by default on every fresh page load.
- Admin/Edit mode opened by a valid `@vietmyssu.com` email; no password field.
- All data mutation paths are guarded at function level, in addition to disabled edit controls.
- Floor Breakdown dashboard with cabin, checked cabin, completion, total assets and laptop counts per floor.
- Lead Laptop classification is fixed to:
  - Laptop + Sạc + Chuột
  - Laptop + Sạc + Chuột + Túi chống sốc
- Poppins typography via Google Fonts.
- Added inline Heroicons-style SVG icons for the new access/dashboard layer.
- Responsive dashboard treatment for desktop/tablet/mobile.
- Existing Supabase sync, local draft, JSON import/export and Team portal behavior preserved.
- TeamGridMenu remains module-scoped and portal-based; selection continues through its explicit `onClick` callback.

## Important security note
The requested login is intentionally only a client-side format gate. Any person who knows/enters a syntactically valid `@vietmyssu.com` address can open Edit mode. This is not secure authentication. Real authorization must be enforced server-side/Supabase RLS if Edit access needs to be restricted to verified company identities.

## `.agent`
The supplied ZIP does not contain an `.agent` directory or `.agent` rules file, so there were no project-local `.agent` instructions available to apply.
