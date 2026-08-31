import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getAdminAuthFromRequest } from "./shared/admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const DIST_DIR = path.resolve(__dirname, "dist");
const API_PATH = "/api/sync";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function safeFilePath(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }

  const relative = decoded.replace(/^\/+/, "");
  const filePath = path.resolve(DIST_DIR, relative);
  if (filePath !== DIST_DIR && !filePath.startsWith(DIST_DIR + path.sep)) {
    return null;
  }
  return filePath;
}

function serveFile(req, res, filePath) {
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Not found");
    }

    const ext = path.extname(filePath).toLowerCase();
    const headers = {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
    };

    res.writeHead(200, headers);
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
}

function handleSync(req, res) {
  if (req.method === "GET") {
    return sendJson(res, 200, {
      success: true,
      data: {
        inventoryState: {},
        customNames: {},
        customColors: {},
        laneSttRanges: {},
        customStts: {},
      },
      timestamp: new Date().toISOString(),
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST, OPTIONS");
    return sendJson(res, 405, { success: false, error: "Method not allowed" });
  }

  if (!getAdminAuthFromRequest(req).isAdmin) {
    return sendJson(res, 403, { success: false, error: "Admin authorization required" });
  }

  let body = "";
  req.setEncoding("utf8");
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 5 * 1024 * 1024) req.destroy();
  });
  req.on("end", () => {
    try {
      const data = JSON.parse(body || "{}");
      console.log("Sync received:", Object.keys(data));
      sendJson(res, 200, {
        success: true,
        message: "Data saved (local test only)",
        timestamp: new Date().toISOString(),
      });
    } catch {
      sendJson(res, 400, { success: false, error: "Invalid JSON" });
    }
  });
}

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const requestPath = requestUrl.pathname;

  // API must be handled before the static-file fallback.
  if (requestPath === API_PATH) return handleSync(req, res);

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Not found");
  }

  if (!fs.existsSync(DIST_DIR)) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Build directory not found. Run npm run build first.");
  }

  let filePath = safeFilePath(requestPath);
  if (!filePath) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Bad request");
  }

  // SPA fallback: unknown browser routes receive index.html.
  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) return serveFile(req, res, filePath);
    serveFile(req, res, path.join(DIST_DIR, "index.html"));
  });
});

server.listen(PORT, () => {
  console.log(`Kiemke-Lau2 running at http://localhost:${PORT}`);
});
