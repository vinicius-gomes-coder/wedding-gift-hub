const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

// ─── Enviar via API REST do Brevo ─────────────────────────────────────────────
async function sendEmail({ to, toName, subject, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("BREVO_API_KEY não configurada no .env");

  const senderEmail = process.env.EMAIL_FROM_ADDRESS;
  const senderName  = process.env.EMAIL_FROM_NAME || "Lista de Presentes";
  if (!senderEmail) throw new Error("EMAIL_FROM_ADDRESS não configurada no .env");

  const response = await fetch(BREVO_API_URL, {
    method:  "POST",
    headers: {
      "accept":       "application/json",
      "content-type": "application/json",
      "api-key":      apiKey,
    },
    body: JSON.stringify({
      sender:      { name: senderName, email: senderEmail },
      to:          [{ email: to, name: toName || to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `Brevo API error ${response.status}: ${err.message || JSON.stringify(err)}`
    );
  }

  return response.json();
}

// ─── Formatar valor em BRL ────────────────────────────────────────────────────
function formatBRL(value) {
  return `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

// ─── Templates HTML ───────────────────────────────────────────────────────────
function coupleHtml({ buyer, items, total, paymentMethod }) {
  const methodLabel = paymentMethod === "pix" ? "PIX" : "Cartão de Crédito";
  const rows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e8e6e0;font-family:'Georgia',serif;font-size:15px;color:#3d3d3d;">${i.title}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e8e6e0;font-family:'Georgia',serif;font-size:15px;color:#3d3d3d;text-align:right;">${formatBRL(i.unit_price)}</td>
      </tr>`
    )
    .join("");

  const messageBlock = buyer.message
    ? `<div style="background:#f9f8f5;border-left:3px solid #b89b5d;padding:20px 24px;margin-bottom:32px;">
         <p style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:11px;color:#999;letter-spacing:2px;text-transform:uppercase;">Mensagem</p>
         <p style="margin:0;font-family:'Georgia',serif;font-size:16px;color:#3d3d3d;font-style:italic;line-height:1.7;">"${buyer.message}"</p>
       </div>`
    : "";

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f2;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f2;padding:40px 20px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;max-width:560px;width:100%;">
      <tr><td style="background:#7d8a68;padding:36px 40px;text-align:center;">
        <p style="margin:0 0 6px 0;font-family:'Georgia',serif;font-size:13px;color:#d4c9a8;letter-spacing:3px;text-transform:uppercase;">Lista de Presentes</p>
        <h1 style="margin:0;font-family:'Georgia',serif;font-size:28px;font-weight:400;color:#fff;">Eduarda &amp; Vinicius</h1>
      </td></tr>
      <tr><td style="padding:40px 40px 24px 40px;">
        <p style="margin:0 0 24px 0;font-family:'Georgia',serif;font-size:20px;color:#3d3d3d;">Vocês receberam um presente! 🎁</p>
        <p style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:14px;color:#666;line-height:1.6;"><strong style="color:#3d3d3d;">${buyer.name}</strong> escolheu presenteá-los com carinho.</p>
        <p style="margin:0 0 32px 0;font-family:Arial,sans-serif;font-size:14px;color:#666;">Contato: <a href="mailto:${buyer.email}" style="color:#7d8a68;">${buyer.email}</a></p>
        ${messageBlock}
        <p style="margin:0 0 12px 0;font-family:Arial,sans-serif;font-size:11px;color:#999;letter-spacing:2px;text-transform:uppercase;">Presentes escolhidos</p>
        <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
          <tr>
            <td style="font-family:'Georgia',serif;font-size:16px;color:#3d3d3d;padding-top:16px;">Total</td>
            <td style="font-family:'Georgia',serif;font-size:18px;color:#3d3d3d;text-align:right;padding-top:16px;font-weight:bold;">${formatBRL(total)}</td>
          </tr>
          <tr><td colspan="2" style="font-family:Arial,sans-serif;font-size:12px;color:#999;padding-top:8px;">Pago via ${methodLabel}</td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:24px 40px;border-top:1px solid #e8e6e0;text-align:center;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#999;">Lista de Presentes — Eduarda &amp; Vinicius</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function buyerHtml({ buyer, items, total, paymentMethod }) {
  const methodLabel = paymentMethod === "pix" ? "PIX" : "Cartão de Crédito";
  const rows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e8e6e0;font-family:'Georgia',serif;font-size:15px;color:#3d3d3d;">${i.title}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e8e6e0;font-family:'Georgia',serif;font-size:15px;color:#3d3d3d;text-align:right;">${formatBRL(i.unit_price)}</td>
      </tr>`
    )
    .join("");

  const messageBlock = buyer.message
    ? `<div style="background:#f9f8f5;border-left:3px solid #b89b5d;padding:20px 24px;margin-top:32px;">
         <p style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:11px;color:#999;letter-spacing:2px;text-transform:uppercase;">Sua mensagem</p>
         <p style="margin:0;font-family:'Georgia',serif;font-size:16px;color:#3d3d3d;font-style:italic;line-height:1.7;">"${buyer.message}"</p>
       </div>`
    : "";

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f2;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f2;padding:40px 20px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;max-width:560px;width:100%;">
      <tr><td style="background:#7d8a68;padding:36px 40px;text-align:center;">
        <p style="margin:0 0 6px 0;font-family:'Georgia',serif;font-size:13px;color:#d4c9a8;letter-spacing:3px;text-transform:uppercase;">Lista de Presentes</p>
        <h1 style="margin:0;font-family:'Georgia',serif;font-size:28px;font-weight:400;color:#fff;">Eduarda &amp; Vinicius</h1>
      </td></tr>
      <tr><td style="padding:40px 40px 24px 40px;">
        <p style="margin:0 0 16px 0;font-family:'Georgia',serif;font-size:20px;color:#3d3d3d;">Obrigado, ${buyer.name}!</p>
        <p style="margin:0 0 32px 0;font-family:Arial,sans-serif;font-size:14px;color:#666;line-height:1.7;">Seu presente foi confirmado com sucesso. Eduarda e Vinicius vão adorar!</p>
        <p style="margin:0 0 12px 0;font-family:Arial,sans-serif;font-size:11px;color:#999;letter-spacing:2px;text-transform:uppercase;">Você presenteou com</p>
        <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
          <tr>
            <td style="font-family:'Georgia',serif;font-size:16px;color:#3d3d3d;padding-top:16px;">Total</td>
            <td style="font-family:'Georgia',serif;font-size:18px;color:#3d3d3d;text-align:right;padding-top:16px;font-weight:bold;">${formatBRL(total)}</td>
          </tr>
          <tr><td colspan="2" style="font-family:Arial,sans-serif;font-size:12px;color:#999;padding-top:8px;">Pago via ${methodLabel}</td></tr>
        </table>
        ${messageBlock}
      </td></tr>
      <tr><td style="padding:24px 40px;border-top:1px solid #e8e6e0;text-align:center;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#999;">Lista de Presentes — Eduarda &amp; Vinicius</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function coupleCustomHtml({ buyer, amount }) {
  const messageBlock = buyer.message
    ? `<div style="background:#f9f8f5;border-left:3px solid #b89b5d;padding:20px 24px;margin-bottom:32px;">
         <p style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:11px;color:#999;letter-spacing:2px;text-transform:uppercase;">Mensagem</p>
         <p style="margin:0;font-family:'Georgia',serif;font-size:16px;color:#3d3d3d;font-style:italic;line-height:1.7;">"${buyer.message}"</p>
       </div>`
    : "";

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f2;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f2;padding:40px 20px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;max-width:560px;width:100%;">
      <tr><td style="background:#7d8a68;padding:36px 40px;text-align:center;">
        <p style="margin:0 0 6px 0;font-family:'Georgia',serif;font-size:13px;color:#d4c9a8;letter-spacing:3px;text-transform:uppercase;">Lista de Presentes</p>
        <h1 style="margin:0;font-family:'Georgia',serif;font-size:28px;font-weight:400;color:#fff;">Eduarda &amp; Vinicius</h1>
      </td></tr>
      <tr><td style="padding:40px 40px 24px 40px;">
        <p style="margin:0 0 24px 0;font-family:'Georgia',serif;font-size:20px;color:#3d3d3d;">Vocês receberam uma contribuição! 🎁</p>
        <p style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:14px;color:#666;line-height:1.6;"><strong style="color:#3d3d3d;">${buyer.name}</strong> enviou uma contribuição especial.</p>
        <p style="margin:0 0 32px 0;font-family:Arial,sans-serif;font-size:14px;color:#666;">Contato: <a href="mailto:${buyer.email}" style="color:#7d8a68;">${buyer.email}</a></p>
        ${messageBlock}
        <div style="background:#f9f8f5;padding:24px;text-align:center;">
          <p style="margin:0 0 6px 0;font-family:Arial,sans-serif;font-size:11px;color:#999;letter-spacing:2px;text-transform:uppercase;">Valor enviado</p>
          <p style="margin:0;font-family:'Georgia',serif;font-size:32px;color:#3d3d3d;">R$ ${Number(amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          <p style="margin:8px 0 0 0;font-family:Arial,sans-serif;font-size:12px;color:#999;">via PIX</p>
        </div>
      </td></tr>
      <tr><td style="padding:24px 40px;border-top:1px solid #e8e6e0;text-align:center;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#999;">Lista de Presentes — Eduarda &amp; Vinicius</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function buyerCustomHtml({ buyer, amount }) {
  const messageBlock = buyer.message
    ? `<div style="background:#f9f8f5;border-left:3px solid #b89b5d;padding:20px 24px;">
         <p style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:11px;color:#999;letter-spacing:2px;text-transform:uppercase;">Sua mensagem</p>
         <p style="margin:0;font-family:'Georgia',serif;font-size:16px;color:#3d3d3d;font-style:italic;line-height:1.7;">"${buyer.message}"</p>
       </div>`
    : "";

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f2;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f2;padding:40px 20px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;max-width:560px;width:100%;">
      <tr><td style="background:#7d8a68;padding:36px 40px;text-align:center;">
        <p style="margin:0 0 6px 0;font-family:'Georgia',serif;font-size:13px;color:#d4c9a8;letter-spacing:3px;text-transform:uppercase;">Lista de Presentes</p>
        <h1 style="margin:0;font-family:'Georgia',serif;font-size:28px;font-weight:400;color:#fff;">Eduarda &amp; Vinicius</h1>
      </td></tr>
      <tr><td style="padding:40px 40px 24px 40px;">
        <p style="margin:0 0 16px 0;font-family:'Georgia',serif;font-size:20px;color:#3d3d3d;">Obrigado, ${buyer.name}!</p>
        <p style="margin:0 0 32px 0;font-family:Arial,sans-serif;font-size:14px;color:#666;line-height:1.7;">Sua contribuição foi confirmada com sucesso. Eduarda e Vinicius vão adorar!</p>
        <div style="background:#f9f8f5;padding:24px;text-align:center;margin-bottom:32px;">
          <p style="margin:0 0 6px 0;font-family:Arial,sans-serif;font-size:11px;color:#999;letter-spacing:2px;text-transform:uppercase;">Valor enviado</p>
          <p style="margin:0;font-family:'Georgia',serif;font-size:32px;color:#3d3d3d;">R$ ${Number(amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          <p style="margin:8px 0 0 0;font-family:Arial,sans-serif;font-size:12px;color:#999;">via PIX</p>
        </div>
        ${messageBlock}
      </td></tr>
      <tr><td style="padding:24px 40px;border-top:1px solid #e8e6e0;text-align:center;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#999;">Lista de Presentes — Eduarda &amp; Vinicius</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

// ─── Exports ──────────────────────────────────────────────────────────────────
export async function sendPurchaseEmails({ buyer, items, total, paymentMethod }) {
  const coupleEmail = process.env.COUPLE_EMAIL;
  if (!coupleEmail) throw new Error("COUPLE_EMAIL não configurado no .env");

  await Promise.all([
    sendEmail({
      to:      coupleEmail,
      toName:  "Eduarda & Vinicius",
      subject: `💝 ${buyer.name} enviou um presente!`,
      html:    coupleHtml({ buyer, items, total, paymentMethod }),
    }),
    sendEmail({
      to:      buyer.email,
      toName:  buyer.name,
      subject: "Seu presente foi confirmado ✨",
      html:    buyerHtml({ buyer, items, total, paymentMethod }),
    }),
  ]);

  console.log(`✅  E-mails enviados → noivos (${coupleEmail}) e comprador (${buyer.email})`);
}

export async function sendCustomPixEmails({ buyer, amount }) {
  const coupleEmail = process.env.COUPLE_EMAIL;
  if (!coupleEmail) throw new Error("COUPLE_EMAIL não configurado no .env");

  await Promise.all([
    sendEmail({
      to:      coupleEmail,
      toName:  "Eduarda & Vinicius",
      subject: `💝 ${buyer.name} enviou uma contribuição!`,
      html:    coupleCustomHtml({ buyer, amount }),
    }),
    sendEmail({
      to:      buyer.email,
      toName:  buyer.name,
      subject: "Sua contribuição foi confirmada ✨",
      html:    buyerCustomHtml({ buyer, amount }),
    }),
  ]);

  console.log(`✅  E-mails de contribuição enviados → noivos (${coupleEmail}) e comprador (${buyer.email})`);
}