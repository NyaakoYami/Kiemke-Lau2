// Simple Node.js server for local testing
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

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

  // Serve static files
  if (req.method === "GET") {
    if (req.url === "/" || req.url === "/index.html") {
      const filePath = path.join(__dirname, "index.html");
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(data);
      });
      return;
    }

    // 404 for other GET requests
    res.writeHead(404);
    res.end("Not found");
    return;
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
              message: "Data saved (local test only - data not persisted)",
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
  
  ℹ️  Note: This is for local testing only.
     Data will NOT be persisted to disk.
  
  Press Ctrl+C to stop.
  `);
});
