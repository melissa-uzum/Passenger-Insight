import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();

const DEMO = process.env.DEMO_MODE === "1" || process.env.DEMO_INCIDENTS === "1";

const ORIGIN_ENV = process.env.CORS_ORIGIN || "*";
const corsOrigin = ORIGIN_ENV === "*" ? true : ORIGIN_ENV;

app.use(
  cors({
    origin: corsOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    maxAge: 86400,
  })
);
app.options("*", cors({ origin: corsOrigin }));

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";
  if (!token) return res.status(401).json({ message: "Missing token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

if (DEMO) {
  app.get("/api/health", (_req, res) => res.json({ ok: true, demo: true }));

  app.get("/api/stations", (_req, res) =>
    res.json({
      data: [
        { id: 1, code: "ARN-T1", name: "Arlanda Terminal 1" },
        { id: 2, code: "ARN-T5", name: "Arlanda Terminal 5" },
        { id: 3, code: "CST", name: "Stockholm C" },
        { id: 4, code: "KST", name: "Kungsholmen Security Transit" },
      ],
      demo: true,
    })
  );

  app.get("/api/flows/latest", (_req, res) =>
    res.json({
      data: [
        { name: "Arlanda Terminal 1", in_total: 120, out_total: 95 },
        { name: "Arlanda Terminal 5", in_total: 380, out_total: 260 },
        { name: "Stockholm C", in_total: 240, out_total: 220 },
        { name: "Kungsholmen Security Transit", in_total: 48, out_total: 22 },
      ],
      demo: true,
    })
  );

  app.get("/api/flows/history", (_req, res) => {
    const now = Date.now();
    const hours = Array.from({ length: 12 }, (_, i) => new Date(now - i * 3600e3));
    const data = [];
    for (const h of hours) {
      data.push({
        station_id: 1,
        name: "Arlanda Terminal 1",
        bucket: h.toISOString(),
        in_sum: Math.floor(Math.random() * 100),
        out_sum: Math.floor(Math.random() * 80),
      });
    }
    res.json({ data, demo: true });
  });

  app.get("/api/incidents", (_req, res) =>
    res.json({
      data: [
        { severity: "info", message: "Deploy v0.1.0 completed" },
        { severity: "warning", message: "High inbound at ARN-T5 last hour" },
      ],
      demo: true,
    })
  );
} else {
  app.get("/api/health", (_req, res) => res.status(500).json({ message: "No DB configured" }));
}

app.get("/api/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.write(`event: ping\ndata: "ok"\n\n`);
});

const port = process.env.PORT || 1337;
app.listen(port, () => console.log(`PI backend listening on :${port} (demo=${DEMO})`));

export default app;
