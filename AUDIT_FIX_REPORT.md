# Full Audit & Fix Report — Kiemke-Lau2

## Root Cause

### Word Highlighter / tabWordHighlighter.js
The uploaded codebase does not contain `tabWordHighlighter.js`, `wordsManager.js`, `setLoopConfig`, or `getGroupsForUrl`.
The only `performanceSetting` reference is the app-state normalizer in `src/App.jsx`, which already creates:
`{ enabled: false, items: [] }` when missing or invalid.

The reported stack traces use `chrome-extension://fgmbnmjmbjenlhbefngfibmjkpbcljaj/...`, proving those exceptions originate in an installed Chrome extension, not this React application. There is no project-side root cause to patch without the extension source.

### Cabin Drag & Drop
The root cause was the reorder index calculation in `commitSeatMove()`.
The previous implementation decremented the target index when source and target were in the same array and `source.sIdx < target.sIdx`. That makes an adjacent drop such as A -> B resolve back to A, B, so the visual drag occurs but the data order appears unchanged.

The source was also read from React state during `onDrop`, while the active native/pointer drag session already had a stable source in `pointerDragRef`. The drop path now uses the drag-session source first, avoiding stale-state timing.

### Admin Authorization
The previous implementation accepted every `@vietmyssu.com` address. The backend had no authorization check on POST at all.

Authorization is now centralized in `shared/admin.js` and uses the exact four-email whitelist. `/api/sync` rejects unauthorized POST requests with HTTP 403.

### Auth State / Async State
The admin role was stored in independent booleans. It is now represented by an explicit auth state:
- `loading`
- `authenticated + admin`
- `unauthenticated + non-admin`

Admin session email is revalidated against the whitelist on page load and stored only in `sessionStorage`; app state/localStorage is never trusted as a role source.

Cloud hydration now records a local revision before the request. If a local edit occurs while the cloud GET is in flight, the stale cloud response is not allowed to overwrite the newer local state.

## Files Changed

- `src/App.jsx` — centralized admin authorization usage, auth-state hydration, cloud hydration race protection, stable drag source, corrected reorder commit.
- `shared/admin.js` — single source of truth for admin whitelist/normalization/request authorization.
- `shared/reorder.js` — reusable reorder primitive.
- `api/sync.js` — backend authorization for cloud writes.
- `server.js` — local API authorization and corrected ESM-compatible Node entrypoint.
- `tests/admin.test.mjs` — whitelist and request authorization tests.
- `tests/reorder.test.mjs` — reorder boundary/cross-array tests.
- `package.json` — added `test` and `start` scripts.
- `SUPABASE_FIX.md` — documents the new server-side authorization boundary.

## Security

Only the four whitelisted email strings can be authorized by the application's current email-based authorization layer.

Important limitation: the existing application has no identity provider. An email-only modal cannot prove that the person actually owns the email address. The backend now rejects non-whitelisted identities, but production-grade identity assurance requires Supabase Auth/Google/OTP/password authentication and server-side JWT verification before applying the same whitelist.

## Validation

PASS:
- Admin whitelist exactness
- Email normalization
- Non-admin rejection
- Backend authorization helper
- A -> B
- B -> A
- A -> D
- D -> A
- A -> middle
- Cross-array move
- Node syntax checks for backend/shared JS

Not verifiable in this environment:
- Vite production build
- ESLint
- Browser-level drag/drop interaction
- Live Supabase persistence
- Chrome extension errors

`npm ci` could not complete in the execution environment, leaving Vite/ESLint binaries unavailable. The test suite itself runs successfully with Node's built-in test runner: 10/10 passed.

## Word Highlighter Console Errors

These cannot honestly be marked fixed because the relevant source files are not part of the uploaded project. The app code contains no implementation of those extension functions. The external extension must be updated/disabled or its own source audited separately.
