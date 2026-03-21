import nodemailer from "nodemailer";

// ─── Criar transporter ────────────────────────────────────────────────────────
function createTransporter() {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error(
      "Configurações de e-mail ausentes. Verifique EMAIL_HOST, EMAIL_USER e EMAIL_PASS no .env"
    );
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT) || 587,
    secure: Number(EMAIL_PORT) === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
}

// ─── Formatar valor em BRL ────────────────────────────────────────────────────
function formatBRL(value) {
  return `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

// ─── Template: e-mail para os noivos ─────────────────────────────────────────
function buildCoupleEmail({ buyer, items, total, paymentMethod }) {
  const methodLabel = paymentMethod === "pix" ? "PIX" : "Cartão de Crédito";
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid #e8e6e0; font-family:'Georgia',serif; font-size:15px; color:#3d3d3d;">
          ${item.title}
        </td>
        <td style="padding:10px 0; border-bottom:1px solid #e8e6e0; font-family:'Georgia',serif; font-size:15px; color:#3d3d3d; text-align:right;">
          ${formatBRL(item.unit_price)}
        </td>
      </tr>`
    )
    .join("");

  return {
    subject: `💝 ${buyer.name} enviou um presente!`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0; padding:0; background:#f4f4f2;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f2; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff; max-width:560px; width:100%;">

          <!-- Cabeçalho -->
          <tr>
            <td style="background:#7d8a68; padding:36px 40px; text-align:center;">
              <p style="margin:0 0 6px 0; font-family:'Georgia',serif; font-size:13px; color:#d4c9a8; letter-spacing:3px; text-transform:uppercase;">Lista de Presentes</p>
              <h1 style="margin:0; font-family:'Georgia',serif; font-size:28px; font-weight:400; color:#ffffff;">
                Eduarda &amp; Vinicius
              </h1>
            </td>
          </tr>

          <!-- Corpo -->
          <tr>
            <td style="padding:40px 40px 24px 40px;">
              <p style="margin:0 0 24px 0; font-family:'Georgia',serif; font-size:20px; color:#3d3d3d;">
                Vocês receberam um presente! 🎁
              </p>
              <p style="margin:0 0 8px 0; font-family:Arial,sans-serif; font-size:14px; color:#666; line-height:1.6;">
                <strong style="color:#3d3d3d;">${buyer.name}</strong> escolheu presenteá-los com carinho.
              </p>
              <p style="margin:0 0 32px 0; font-family:Arial,sans-serif; font-size:14px; color:#666;">
                Contato: <a href="mailto:${buyer.email}" style="color:#7d8a68;">${buyer.email}</a>
              </p>

              ${
                buyer.message
                  ? `
              <!-- Mensagem -->
              <div style="background:#f9f8f5; border-left:3px solid #b89b5d; padding:20px 24px; margin-bottom:32px;">
                <p style="margin:0 0 8px 0; font-family:Arial,sans-serif; font-size:11px; color:#999; letter-spacing:2px; text-transform:uppercase;">Mensagem</p>
                <p style="margin:0; font-family:'Georgia',serif; font-size:16px; color:#3d3d3d; font-style:italic; line-height:1.7;">
                  "${buyer.message}"
                </p>
              </div>`
                  : ""
              }

              <!-- Itens -->
              <p style="margin:0 0 12px 0; font-family:Arial,sans-serif; font-size:11px; color:#999; letter-spacing:2px; text-transform:uppercase;">Presentes escolhidos</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
              </table>

              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                <tr>
                  <td style="font-family:'Georgia',serif; font-size:16px; color:#3d3d3d; padding-top:16px;">Total</td>
                  <td style="font-family:'Georgia',serif; font-size:18px; color:#3d3d3d; text-align:right; padding-top:16px; font-weight:bold;">
                    ${formatBRL(total)}
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="font-family:Arial,sans-serif; font-size:12px; color:#999; padding-top:8px;">
                    Pago via ${methodLabel}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="padding:24px 40px; border-top:1px solid #e8e6e0; text-align:center;">
              <p style="margin:0; font-family:Arial,sans-serif; font-size:12px; color:#999;">
                Lista de Presentes — Eduarda &amp; Vinicius
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}

// ─── Template: e-mail para o comprador ───────────────────────────────────────
function buildBuyerEmail({ buyer, items, total, paymentMethod }) {
  const methodLabel = paymentMethod === "pix" ? "PIX" : "Cartão de Crédito";
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid #e8e6e0; font-family:'Georgia',serif; font-size:15px; color:#3d3d3d;">
          ${item.title}
        </td>
        <td style="padding:10px 0; border-bottom:1px solid #e8e6e0; font-family:'Georgia',serif; font-size:15px; color:#3d3d3d; text-align:right;">
          ${formatBRL(item.unit_price)}
        </td>
      </tr>`
    )
    .join("");

  return {
    subject: "Seu presente foi confirmado ✨",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0; padding:0; background:#f4f4f2;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f2; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff; max-width:560px; width:100%;">

          <!-- Cabeçalho -->
          <tr>
            <td style="background:#7d8a68; padding:36px 40px; text-align:center;">
              <p style="margin:0 0 6px 0; font-family:'Georgia',serif; font-size:13px; color:#d4c9a8; letter-spacing:3px; text-transform:uppercase;">Lista de Presentes</p>
              <h1 style="margin:0; font-family:'Georgia',serif; font-size:28px; font-weight:400; color:#ffffff;">
                Eduarda &amp; Vinicius
              </h1>
            </td>
          </tr>

          <!-- Corpo -->
          <tr>
            <td style="padding:40px 40px 24px 40px;">
              <p style="margin:0 0 16px 0; font-family:'Georgia',serif; font-size:20px; color:#3d3d3d;">
                Obrigado, ${buyer.name}!
              </p>
              <p style="margin:0 0 32px 0; font-family:Arial,sans-serif; font-size:14px; color:#666; line-height:1.7;">
                Seu presente foi confirmado com sucesso. Eduarda e Vinicius vão adorar!
              </p>

              <!-- Itens -->
              <p style="margin:0 0 12px 0; font-family:Arial,sans-serif; font-size:11px; color:#999; letter-spacing:2px; text-transform:uppercase;">Você presenteou com</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
              </table>

              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                <tr>
                  <td style="font-family:'Georgia',serif; font-size:16px; color:#3d3d3d; padding-top:16px;">Total</td>
                  <td style="font-family:'Georgia',serif; font-size:18px; color:#3d3d3d; text-align:right; padding-top:16px; font-weight:bold;">
                    ${formatBRL(total)}
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="font-family:Arial,sans-serif; font-size:12px; color:#999; padding-top:8px;">
                    Pago via ${methodLabel}
                  </td>
                </tr>
              </table>

              ${
                buyer.message
                  ? `
              <div style="background:#f9f8f5; border-left:3px solid #b89b5d; padding:20px 24px; margin-top:32px;">
                <p style="margin:0 0 8px 0; font-family:Arial,sans-serif; font-size:11px; color:#999; letter-spacing:2px; text-transform:uppercase;">Sua mensagem</p>
                <p style="margin:0; font-family:'Georgia',serif; font-size:16px; color:#3d3d3d; font-style:italic; line-height:1.7;">
                  "${buyer.message}"
                </p>
              </div>`
                  : ""
              }
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="padding:24px 40px; border-top:1px solid #e8e6e0; text-align:center;">
              <p style="margin:0; font-family:Arial,sans-serif; font-size:12px; color:#999;">
                Lista de Presentes — Eduarda &amp; Vinicius
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}

// ─── Enviar e-mails ───────────────────────────────────────────────────────────
export async function sendPurchaseEmails({ buyer, items, total, paymentMethod }) {
  const transporter = createTransporter();
  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const coupleEmail = process.env.COUPLE_EMAIL;

  if (!coupleEmail) {
    throw new Error("COUPLE_EMAIL não configurado no .env");
  }

  const coupleTemplate = buildCoupleEmail({ buyer, items, total, paymentMethod });
  const buyerTemplate = buildBuyerEmail({ buyer, items, total, paymentMethod });

  // Envia os dois e-mails em paralelo
  await Promise.all([
    transporter.sendMail({
      from: fromAddress,
      to: coupleEmail,
      subject: coupleTemplate.subject,
      html: coupleTemplate.html,
    }),
    transporter.sendMail({
      from: fromAddress,
      to: buyer.email,
      subject: buyerTemplate.subject,
      html: buyerTemplate.html,
    }),
  ]);

  console.log(`✅  E-mails enviados → noivos (${coupleEmail}) e comprador (${buyer.email})`);
}