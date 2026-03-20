import "dotenv/config";
import express from "express";
import cors from "cors";
import paymentsRouter from "./routes/payments.js";

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8080";

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:5173", "http://localhost:8080"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// ─── Rotas ────────────────────────────────────────────────────────────────────
app.use("/api/payments", paymentsRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Rota não encontrada
app.use((_req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

// ─── Iniciar servidor ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);

  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    console.warn(
      "⚠️  ATENÇÃO: MERCADOPAGO_ACCESS_TOKEN não configurado! Crie o arquivo .env"
    );
  }
});
