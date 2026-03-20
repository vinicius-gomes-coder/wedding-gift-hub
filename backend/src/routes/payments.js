import { Router } from "express";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

const router = Router();

// Inicializa o SDK do Mercado Pago com o Access Token (conforme documentação)
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

// ─── POST /api/payments/preference ───────────────────────────────────────────
// Cria preferência para Checkout Pro (cartão, débito, etc.)
router.post("/preference", async (req, res) => {
  try {
    const { items, payer_email } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Campo 'items' é obrigatório e deve ser um array não vazio",
      });
    }

    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return res.status(500).json({
        error: "MERCADOPAGO_ACCESS_TOKEN não configurado. Verifique o arquivo .env",
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";

    // auto_return só funciona com URLs públicas.
    // O MercadoPago rejeita a preferência quando back_urls.success é localhost.
    const isLocalhost =
      frontendUrl.includes("localhost") || frontendUrl.includes("127.0.0.1");

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: items.map((item, index) => ({
          id: String(index + 1),
          title: String(item.title),
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.unit_price),
          currency_id: "BRL",
        })),

        payer: {
          email: payer_email || "convidado@casamento.com",
        },

        back_urls: {
          success: `${frontendUrl}/pagamento/sucesso`,
          failure: `${frontendUrl}/pagamento/erro`,
          pending: `${frontendUrl}/pagamento/pendente`,
        },

        // Redireciona automaticamente quando aprovado — apenas em produção
        ...(!isLocalhost && { auto_return: "approved" }),

        external_reference: `wedding-gift-${Date.now()}`,
      },
    });

    console.log(`✅  Preferência criada: ${result.id}`);

    return res.status(201).json({
      preference_id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    });
  } catch (err) {
    console.error("Erro ao criar preferência:", err);
    const message =
      err?.cause?.message ||
      err?.message ||
      "Erro ao criar preferência de pagamento. Tente novamente.";
    return res.status(500).json({ error: message });
  }
});

// ─── POST /api/payments/pix ───────────────────────────────────────────────────
// Cria pagamento PIX e retorna QR Code + código copia-e-cola
router.post("/pix", async (req, res) => {
  try {
    const { amount, items, payer_email } = req.body;

    if (!amount || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Campos 'amount' e 'items' são obrigatórios",
      });
    }

    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return res.status(500).json({
        error: "MERCADOPAGO_ACCESS_TOKEN não configurado. Verifique o arquivo .env",
      });
    }

    // PIX expira em 10 minutos
    const expirationDate = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const payment = new Payment(client);

    const result = await payment.create({
      body: {
        transaction_amount: Number(amount),
        payment_method_id: "pix",
        description: "Presente de Casamento",
        date_of_expiration: expirationDate,
        payer: {
          email: payer_email || "convidado@casamento.com",
        },
        additional_info: {
          items: items.map((item, index) => ({
            id: String(index + 1),
            title: String(item.title),
            quantity: Number(item.quantity) || 1,
            unit_price: Number(item.unit_price),
          })),
        },
      },
      requestOptions: {
        idempotencyKey: crypto.randomUUID(),
      },
    });

    const transactionData = result.point_of_interaction?.transaction_data;

    console.log(`✅  PIX criado: ${result.id} | status: ${result.status}`);

    return res.status(201).json({
      payment_id: result.id,
      status: result.status,
      qr_code: transactionData?.qr_code || "",
      qr_code_base64: transactionData?.qr_code_base64 || "",
      expiration: expirationDate,
    });
  } catch (err) {
    console.error("Erro ao criar pagamento PIX:", err);
    const message =
      err?.cause?.message ||
      err?.message ||
      "Erro ao gerar pagamento PIX. Tente novamente.";
    return res.status(500).json({ error: message });
  }
});

// ─── GET /api/payments/status/:paymentId ─────────────────────────────────────
// Consulta o status de um pagamento PIX pelo ID (usado para polling)
router.get("/status/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId || isNaN(Number(paymentId))) {
      return res.status(400).json({ error: "ID de pagamento inválido" });
    }

    const payment = new Payment(client);
    const result = await payment.get({ id: Number(paymentId) });

    return res.status(200).json({
      status: result.status,
      status_detail: result.status_detail,
    });
  } catch (err) {
    console.error("Erro ao consultar status:", err);
    const message =
      err?.cause?.message ||
      err?.message ||
      "Erro ao verificar status do pagamento.";
    return res.status(500).json({ error: message });
  }
});

export default router;