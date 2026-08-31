export const ADMIN_EMAILS = Object.freeze([
  "phuong.dinh@vietmyssu.com",
  "oanh.tran@vietmyssu.com",
  "chinh.dang@vietmyssu.com",
  "thuhien.nguyen@vietmyssu.com",
]);

export function normalizeAdminEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export function isAdminEmail(email) {
  return ADMIN_EMAILS.includes(normalizeAdminEmail(email));
}

export function getAdminAuthFromRequest(req) {
  const rawEmail = req?.headers?.["x-admin-email"] ?? req?.headers?.["X-Admin-Email"];
  const email = normalizeAdminEmail(Array.isArray(rawEmail) ? rawEmail[0] : rawEmail);
  return {
    email,
    isAdmin: isAdminEmail(email),
  };
}
