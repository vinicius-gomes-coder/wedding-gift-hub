# Backend — Lista de Presentes de Casamento

Backend Node.js com Express e SDK oficial do MercadoPago para processar
pagamentos PIX e cartão de crédito.

## Pré-requisitos

- Node.js 18+
- Conta no [MercadoPago Developers](https://www.mercadopago.com.br/developers)

## Instalação

```bash
cd backend
npm install
```

## Configuração

1. Crie o arquivo de variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```

2. Preencha o `.env` com seu Access Token do MercadoPago:
   ```
   MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxxxxxx   # sandbox
   # ou
   MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxx # produção
   ```
   Encontre seu token em: https://www.mercadopago.com.br/developers/panel/app

## Executar

```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Produção
npm start
```

O servidor sobe em `http://localhost:3001` por padrão.

## Endpoints

| Método | Rota                              | Descrição                        |
|--------|-----------------------------------|----------------------------------|
| GET    | `/health`                         | Health check                     |
| POST   | `/api/payments/pix`               | Cria pagamento PIX               |
| GET    | `/api/payments/status/:paymentId` | Verifica status do pagamento     |
| POST   | `/api/payments/card`              | Processa pagamento com cartão    |

### POST `/api/payments/pix`

**Body:**
```json
{
  "amount": 299.90,
  "items": [
    { "title": "Jogo de Jantar", "unit_price": 299.90, "quantity": 1 }
  ],
  "payer_email": "convidado@email.com"
}
```

**Resposta:**
```json
{
  "payment_id": 123456789,
  "status": "pending",
  "qr_code": "00020126580014...",
  "qr_code_base64": "iVBORw0KGgo...",
  "expiration": "2024-01-01T12:10:00.000Z"
}
```

### GET `/api/payments/status/:paymentId`

**Resposta:**
```json
{
  "status": "approved",
  "status_detail": "accredited"
}
```

### POST `/api/payments/card`

**Recomendado para produção — com token gerado no frontend:**
```json
{
  "amount": 299.90,
  "token": "ff8080814c11e237014c1ff593b57b4d",
  "installments": 3,
  "card": {
    "payment_method_id": "visa",
    "payer_email": "convidado@email.com"
  },
  "items": [
    { "title": "Jogo de Jantar", "unit_price": 299.90, "quantity": 1 }
  ]
}
```

**Para testes/sandbox — com dados brutos do cartão:**
```json
{
  "amount": 299.90,
  "installments": 1,
  "card": {
    "holderName": "APRO",
    "number": "5031 4332 1540 6351",
    "expiry": "11/25",
    "cvv": "123"
  },
  "items": [
    { "title": "Jogo de Jantar", "unit_price": 299.90, "quantity": 1 }
  ]
}
```

> **Cartões de teste do MercadoPago:**
> https://www.mercadopago.com.br/developers/pt/docs/your-integrations/test/cards

## Produção — Tokenização de Cartão no Frontend

Para conformidade com PCI-DSS, em produção os dados do cartão **nunca devem**
trafegar pelo seu servidor. Use o SDK JS do MercadoPago para gerar um token
no navegador do usuário:

```html
<script src="https://sdk.mercadopago.com/js/v2"></script>
```

```js
const mp = new MercadoPago('SUA_PUBLIC_KEY');
const cardForm = mp.cardForm({
  amount: String(total),
  form: { ... },
  callbacks: {
    onFormMounted: (error) => { ... },
    onSubmit: async (event) => {
      event.preventDefault();
      const { token, payment_method_id, installments, issuerId } =
        mp.cardForm().getCardFormData();

      // Envie o token para o backend, nunca os dados do cartão
      await fetch('/api/payments/card', {
        method: 'POST',
        body: JSON.stringify({ token, payment_method_id, installments, ... })
      });
    }
  }
});
```

Consulte a documentação completa em:
https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/card/integrate-via-cardform
