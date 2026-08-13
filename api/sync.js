/**
 * Vercel Serverless Function - Sync Data Online
 * Endpoint: /api/sync
 *
 * Methods:
 * - GET: Load data
 * - POST: Save data
 */

let globalData = {
  inventoryState: {},
  customNames: {},
  customColors: {},
  laneSttRanges: {},
  customStts: {},
  lastUpdate: new Date().toISOString(),
};

export default function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "GET") {
    // Load data from server
    return res.status(200).json({
      success: true,
      data: globalData,
      timestamp: new Date().toISOString(),
    });
  }

  if (req.method === "POST") {
    // Save data to server
    const {
      inventoryState,
      customNames,
      customColors,
      laneSttRanges,
      customStts,
    } = req.body;

    if (inventoryState) globalData.inventoryState = inventoryState;
    if (customNames) globalData.customNames = customNames;
    if (customColors) globalData.customColors = customColors;
    if (laneSttRanges) globalData.laneSttRanges = laneSttRanges;
    if (customStts) globalData.customStts = customStts;
    globalData.lastUpdate = new Date().toISOString();

    return res.status(200).json({
      success: true,
      message: "Data saved successfully",
      timestamp: globalData.lastUpdate,
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
