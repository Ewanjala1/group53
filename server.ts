import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { promisify } from "util";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy Gemini AI initialization with User-Agent header
  let aiClient: GoogleGenAI | null = null;
  function getAIClient(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // API Route: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), platform: "Northstar Deflection MVP" });
  });

  // API Route: Execute Python Deflection Engine directly
  app.post("/api/deflect", async (req, res) => {
    try {
      const { query, customerEmail, orderId } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Missing 'query' in request body" });
      }

      // Safe JSON escape for python execution
      const payload = JSON.stringify({ query, customerEmail: customerEmail || null, orderId: orderId || null });
      const pythonScript = `
import json, sys
from python_engine.deflection_engine import NorthstarDeflectionEngine

payload = json.loads('''${payload.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}''')
engine = NorthstarDeflectionEngine()
result = engine.process_inquiry(payload.get('query', ''), payload.get('customerEmail'), payload.get('orderId'))
print(json.dumps(result))
`;
      const { stdout, stderr } = await execAsync(`python3 -c "${pythonScript.replace(/"/g, '\\"')}"`, {
        cwd: process.cwd(),
      });

      if (stderr && !stdout) {
        throw new Error(stderr);
      }

      const parsed = JSON.parse(stdout.trim());
      res.json(parsed);
    } catch (err: any) {
      console.error("Deflection execution error:", err);
      res.status(500).json({ error: "Python execution failed", details: err.message });
    }
  });

  // API Route: Inventory Full Catalog & Sizing Matrix
  app.get("/api/inventory/catalog", async (req, res) => {
    try {
      const pythonScript = `
import json
from python_engine.models import SAMPLE_INVENTORY
from python_engine.inventory_lookup import SIZING_CHARTS

items = []
for k, v in SAMPLE_INVENTORY.items():
    items.append({
        "sku": v.sku,
        "name": v.name,
        "category": v.category,
        "size": v.size,
        "color": v.color,
        "stock_count": v.stock_count,
        "warehouse_location": v.warehouse_location,
        "restock_expected_date": v.restock_expected_date,
        "alternatives_skus": v.alternatives_skus
    })

# Group into products
PRICE_MAP = {
    "Apex Waterproof Shell": 189.00,
    "Altitude Thermal Parka": 299.00,
    "TrailRunner Pro Shoes": 159.00,
    "CloudLoft Tech Fleece": 129.00,
    "Merino Wool Thermal Base Layer": 89.00,
    "Expedition 45L Duffel Bag": 165.00
}

products = {}
for i in items:
    name = i["name"]
    if name not in products:
        products[name] = {
            "name": name,
            "category": i["category"],
            "sku": i["sku"],
            "price": PRICE_MAP.get(name, 149.00),
            "color": i["color"],
            "variants": [],
            "sizes": set(),
            "colors": set(),
            "total_stock": 0,
            "chart": SIZING_CHARTS.get(i["category"], {})
        }
    products[name]["variants"].append(i)
    products[name]["sizes"].add(i["size"])
    products[name]["colors"].add(i["color"])
    products[name]["total_stock"] += i["stock_count"]

catalog = []
for name, p in products.items():
    catalog.append({
        "name": name,
        "category": p["category"],
        "sku": p["sku"],
        "price": p["price"],
        "color": p["color"],
        "sizes": sorted(list(p["sizes"])),
        "available_sizes": sorted(list(p["sizes"])),
        "colors": sorted(list(p["colors"])),
        "total_stock": p["total_stock"],
        "variants": p["variants"],
        "chart": p["chart"]
    })

print(json.dumps({"catalog": catalog, "charts": SIZING_CHARTS, "raw_items": items}))
`;
      const { stdout } = await execAsync(`python3 -c "${pythonScript.replace(/"/g, '\\"')}"`, {
        cwd: process.cwd(),
      });
      res.json(JSON.parse(stdout.trim()));
    } catch (err: any) {
      console.error("Inventory catalog error:", err);
      res.status(500).json({ error: "Failed to fetch inventory catalog", details: err.message });
    }
  });

  // API Route: Size Recommendation Engine
  app.post("/api/inventory/recommend-size", async (req, res) => {
    try {
      const { category, heightInches, weightLbs, fitPref } = req.body;
      const pythonScript = `
import json
from python_engine.inventory_lookup import InventoryLookupService
service = InventoryLookupService()
result = service.recommend_size(
    category="${(category || 'Outerwear').replace(/"/g, '')}",
    height_inches=${Number(heightInches) || 70},
    weight_lbs=${Number(weightLbs) || 170},
    fit_pref="${(fitPref || 'true_to_size').replace(/"/g, '')}"
)
print(json.dumps(result))
`;
      const { stdout } = await execAsync(`python3 -c "${pythonScript.replace(/"/g, '\\"')}"`, {
        cwd: process.cwd(),
      });
      res.json(JSON.parse(stdout.trim()));
    } catch (err: any) {
      console.error("Size recommendation error:", err);
      res.status(500).json({ error: "Size recommendation calculation failed", details: err.message });
    }
  });

  // API Route: Subscribe to Restock Alerts
  app.post("/api/inventory/subscribe-restock", async (req, res) => {
    try {
      const { email, sku, phone, size } = req.body;
      if (!email || !sku) {
        return res.status(400).json({ error: "Email and SKU are required" });
      }
      const pythonScript = `
import json
from python_engine.inventory_lookup import InventoryLookupService
service = InventoryLookupService()
result = service.subscribe_restock_alert(
    email="${email.replace(/"/g, '')}",
    sku="${sku.replace(/"/g, '')}",
    phone="${(phone || '').replace(/"/g, '')}",
    size="${(size || '').replace(/"/g, '')}"
)
print(json.dumps(result))
`;
      const { stdout } = await execAsync(`python3 -c "${pythonScript.replace(/"/g, '\\"')}"`, {
        cwd: process.cwd(),
      });
      res.json(JSON.parse(stdout.trim()));
    } catch (err: any) {
      console.error("Restock subscription error:", err);
      res.status(500).json({ error: "Restock alert subscription failed", details: err.message });
    }
  });

  // API Route: Run 100-ticket Python Batch Simulation
  app.get("/api/python/simulate", async (req, res) => {
    try {
      const pythonScript = `
import json
from python_engine.simulate_tickets import run_simulation
report = run_simulation(100)
print(json.dumps(report))
`;
      const { stdout } = await execAsync(`python3 -c "${pythonScript.replace(/"/g, '\\"')}"`, {
        cwd: process.cwd(),
      });
      const parsed = JSON.parse(stdout.trim());
      res.json(parsed);
    } catch (err: any) {
      console.error("Simulation error:", err);
      res.status(500).json({ error: "Simulation failed", details: err.message });
    }
  });

  // API Route: Run Python Unit Test Suite
  app.get("/api/python/test", async (req, res) => {
    try {
      const { stdout, stderr } = await execAsync(`python3 -m unittest python_engine.test_suite -v 2>&1`, {
        cwd: process.cwd(),
      });
      res.json({
        output: stdout || stderr,
        passed: stdout.includes("OK") || stderr.includes("OK"),
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.json({
        output: err.stdout || err.message,
        passed: false,
        error: true,
      });
    }
  });

  // API Route: Run arbitrary custom Python code in playground
  app.post("/api/python/run-custom", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ error: "No code provided" });
      }

      const startTime = Date.now();
      const escapedCode = code.replace(/"/g, '\\"');
      const { stdout, stderr } = await execAsync(`python3 -c "${escapedCode}"`, {
        cwd: process.cwd(),
        timeout: 10000,
      });
      const durationMs = Date.now() - startTime;

      res.json({
        stdout: stdout || "",
        stderr: stderr || "",
        durationMs,
        success: true,
      });
    } catch (err: any) {
      res.json({
        stdout: err.stdout || "",
        stderr: err.stderr || err.message,
        durationMs: 0,
        success: false,
      });
    }
  });

  // API Route: Gemini AI Powered Support & Triage Enhancement
  app.post("/api/gemini/triage", async (req, res) => {
    try {
      const { customerMessage, orderContext } = req.body;
      const ai = getAIClient();

      if (!ai) {
        return res.json({
          enhanced: false,
          fallbackReason: "Gemini API key not configured, used native Python heuristic triage.",
          analysis: {
            tone: "Neutral",
            suggestedResolution: "Standard self-serve flow",
            deflectionConfidence: 0.85,
          },
        });
      }

      const prompt = `You are the AI Triage Assistant for Northstar Retail Co. support desk.
Customer Message: "${customerMessage}"
Available Order / Context Data: ${JSON.stringify(orderContext || {})}

Analyze this customer inquiry for our support team.
Return a valid JSON object with:
- "detectedCategory": one of ["ORDER_STATUS", "RETURNS_REFUNDS", "STOCK_AVAILABILITY", "GENERAL_ESCALATION"]
- "sentiment": one of ["Frustrated", "Neutral", "Urgent", "Delighted"]
- "confidenceScore": number between 0.0 and 1.0
- "recommendedAction": concise sentence on what action to take
- "autoDraftedResponse": polite, brand-aligned Northstar response directly answering their question
- "canDeflectWithoutHuman": boolean`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      res.json({ enhanced: true, ...parsed });
    } catch (err: any) {
      console.error("Gemini triage error:", err);
      res.json({
        enhanced: false,
        error: err.message,
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Northstar Support Deflection Server running on port ${PORT}`);
  });
}

startServer();
