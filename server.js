// Node.js server for local testing and serving built/static files
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

// Determine static build path or fallback to root
const DIST_DIR = path.join(__dirname, "kiem-ke-app", "dist");
const ROOT_DIR = __dirname;

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Helper to serve file
  const serveFile = (filePath, defaultContentType = "text/html") => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      let contentType = defaultContentType;
      if (ext === ".js") contentType = "application/javascript";
      else if (ext === ".css") contentType = "text/css";
      else if (ext === ".json") contentType = "application/json";
      else if (ext === ".svg") contentType = "image/svg+xml";

      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    });
  };

  // Serve static files
  if (req.method === "GET") {
    let requestPath = req.url.split("?")[0];
    if (requestPath === "/") requestPath = "/index.html";

    // Try dist directory first, then root directory
    const distPath = path.join(DIST_DIR, requestPath);
    if (fs.existsSync(distPath) && fs.statSync(distPath).isFile()) {
      return serveFile(distPath);
    }

    const rootPath = path.join(ROOT_DIR, requestPath);
    if (fs.existsSync(rootPath) && fs.statSync(rootPath).isFile()) {
      return serveFile(rootPath);
    }

    // Fallback to dist index.html or root index.html
    const fallbackDist = path.join(DIST_DIR, "index.html");
    if (fs.existsSync(fallbackDist)) {
      return serveFile(fallbackDist);
    }
    const fallbackRoot = path.join(ROOT_DIR, "index.html");
    return serveFile(fallbackRoot);
  }

  // Handle API requests
  if (req.url === "/api/sync") {
    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        try {
          const data = JSON.parse(body);
          console.log("✅ Sync received:", Object.keys(data));
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: true,
              message: "Data saved (local test only)",
              timestamp: new Date().toISOString(),
            }),
          );
        } catch (e) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "Invalid JSON" }));
        }
      });
      return;
    }

    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          data: {
            inventoryState: {},
            customNames: {},
            customColors: {},
            laneSttRanges: {},
            customStts: {},
          },
          timestamp: new Date().toISOString(),
        }),
      );
      return;
    }
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════╗
  ║ 🎉 Kiemke-Lau2 Local Test Server ║
  ╚═══════════════════════════════════╝

  🌐 Open: http://localhost:${PORT}
  
  Press Ctrl+C to stop.
  `);
});
