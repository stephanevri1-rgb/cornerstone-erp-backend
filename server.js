import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || "3000");

const DB = {
  call_logs: [], call_tasks: [], users: [], messages: [],
  sales_records: [], visitors: [], appointments: [], learners: [],
  invoices: [], quotes: [], products: [], customers: [],
  suppliers: [], attendance_records: [], leave_requests: [],
  meetings: [], journal_entries: [], gl_accounts: [],
  bank_accounts: [], vat_entries: [], bank_statements: [],
  criminal_records: [], psychometry_results: [],
  interview_evaluations: [], "business-settings": [],
};

function createId() { return Date.now() + Math.floor(Math.random() * 1000); }

const app = new Hono();

app.use("*", async (c, next) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (c.req.method === "OPTIONS") return c.text("", 204);
  await next();
});

app.get("/api/health", (c) => c.json({ success: true, status: "ok", timestamp: new Date().toISOString() }));

Object.keys(DB).forEach((table) => {
  const store = DB[table];
  app.get(`/api/${table}`, (c) => c.json({ data: store, success: true }));
  app.post(`/api/${table}`, async (c) => {
    try {
      const body = await c.req.json();
      const item = { id: createId(), ...body, createdAt: new Date().toISOString() };
      store.push(item);
      return c.json({ success: true, data: item }, 201);
    } catch { return c.json({ success: false, error: "Invalid JSON" }, 400); }
  });
  app.get(`/api/${table}/:id`, (c) => {
    const item = store.find((s) => String(s.id) === c.req.param("id"));
    return item ? c.json({ data: item, success: true }) : c.json({ error: "Not found" }, 404);
  });
  app.patch(`/api/${table}/:id`, async (c) => {
    try {
      const idx = store.findIndex((s) => String(s.id) === c.req.param("id"));
      if (idx === -1) return c.json({ error: "Not found" }, 404);
      store[idx] = { ...store[idx], ...await c.req.json() };
      return c.json({ success: true, data: store[idx] });
    } catch { return c.json({ success: false, error: "Invalid JSON" }, 400); }
  });
  app.delete(`/api/${table}/:id`, (c) => {
    const idx = store.findIndex((s) => String(s.id) === c.req.param("id"));
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    store.splice(idx, 1);
    return c.json({ success: true });
  });
});

app.get("/api/psychometric_assessments", (c) => c.json({ data: DB.psychometry_results, success: true }));
app.post("/api/psychometric_assessments", async (c) => {
  try {
    const item = { id: createId(), ...await c.req.json(), createdAt: new Date().toISOString() };
    DB.psychometry_results.push(item);
    return c.json({ success: true, data: item }, 201);
  } catch { return c.json({ success: false, error: "Invalid JSON" }, 400); }
});

const publicDir = path.join(__dirname, "public");
if (fs.existsSync(publicDir)) {
  app.use("*", serveStatic({ root: "./public" }));
  app.notFound((c) => {
    const accept = c.req.header("accept") ?? "";
    if (accept.includes("text/html") || !c.req.path.startsWith("/api")) {
      const indexPath = path.join(publicDir, "index.html");
      if (fs.existsSync(indexPath)) return c.html(fs.readFileSync(indexPath, "utf-8"));
    }
    return c.json({ error: "Not Found" }, 404);
  });
}

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Cornerstone ERP running on http://localhost:${PORT}/`);
});
