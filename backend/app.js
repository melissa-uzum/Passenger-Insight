import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";

import healthRouter from "./routes/health.js";
import stationsRouter from "./routes/stations.js";
import flowsRouter from "./routes/flows.js";
import incidentsRouter from "./routes/incidents.js";
import authRouter from "./routes/auth.js";

const app = express();

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

export const pool = await mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "passenger",
  waitForConnections: true,
  connectionLimit: 10,
});

const sseClients = new Set();
function sseBroadcast(event, payload) {
  const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of sseClients) {
    try { res.write(data); } catch {}
  }
}
app.set("sseBroadcast", sseBroadcast);

app.get("/api/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
  res.write(`event: ping\ndata: "ok"\n\n`);
  sseClients.add(res);
  req.on("close", () => sseClients.delete(res));
});

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

app.use((req, _res, next) => {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";
  if (token) {
    try { req.user = jwt.verify(token, JWT_SECRET); } catch {}
  }
  next();
});

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

app.use("/api/auth", authRouter);
app.use("/api/health", healthRouter);
app.use("/api/stations", stationsRouter);

app.use("/api/flows", (req, _res, next) => { req.requireAuth = requireAuth; next(); }, flowsRouter);
app.use("/api/incidents", (req, _res, next) => { req.requireAuth = requireAuth; next(); }, incidentsRouter);

const port = 1337;
app.listen(port, () => console.log(`PI backend listening on :${port}`));
