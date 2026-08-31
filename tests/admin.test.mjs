import assert from "node:assert/strict";
import test from "node:test";
import { ADMIN_EMAILS, getAdminAuthFromRequest, isAdminEmail, normalizeAdminEmail } from "../shared/admin.js";

test("admin whitelist contains exactly four authorized emails", () => {
  assert.deepEqual([...ADMIN_EMAILS], [
    "phuong.dinh@vietmyssu.com",
    "oanh.tran@vietmyssu.com",
    "chinh.dang@vietmyssu.com",
    "thuhien.nguyen@vietmyssu.com",
  ]);
});

test("admin email matching is normalized", () => {
  assert.equal(normalizeAdminEmail(" PHUONG.DINH@VIETMYSSU.COM "), "phuong.dinh@vietmyssu.com");
  assert.equal(isAdminEmail(" PHUONG.DINH@VIETMYSSU.COM "), true);
  assert.equal(isAdminEmail("phuong.dinh@vietmyssu.com "), true);
});

test("non-whitelisted addresses are not admins", () => {
  for (const email of [
    "abc@vietmyssu.com",
    "admin@vietmyssu.com",
    "test@vietmyssu.com",
    "phuong.dinh2@vietmyssu.com",
    "phuong.dinh@gmail.com",
    "",
    null,
    undefined,
  ]) {
    assert.equal(isAdminEmail(email), false, String(email));
  }
});

test("backend request authorization accepts only exact normalized admin email", () => {
  assert.equal(getAdminAuthFromRequest({ headers: { "x-admin-email": " CHINH.DANG@VIETMYSSU.COM " } }).isAdmin, true);
  assert.equal(getAdminAuthFromRequest({ headers: { "x-admin-email": "abc@vietmyssu.com" } }).isAdmin, false);
  assert.equal(getAdminAuthFromRequest({ headers: {} }).isAdmin, false);
});
