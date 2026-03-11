import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!MERCADOPAGO_ACCESS_TOKEN) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN is not configured');
    }

    const { amount, installments, card, items } = await req.json();

    if (!amount || !card || !items) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create payment via MercadoPago API
    const [expiryMonth, expiryYear] = card.expiry.split('/');

    const paymentBody = {
      transaction_amount: amount,
      installments: installments || 1,
      payment_method_id: 'master', // Will be auto-detected by MP
      description: 'Presente de Casamento',
      payer: {
        email: 'guest@wedding.com',
      },
      additional_info: {
        items: items.map((item: any) => ({
          id: '1',
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      },
      card: {
        card_number: card.number,
        cardholder: {
          name: card.holderName,
        },
        expiration_month: parseInt(expiryMonth, 10),
        expiration_year: 2000 + parseInt(expiryYear, 10),
        security_code: card.cvv,
      },
    };

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify(paymentBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('MercadoPago error:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: data.message || 'Erro ao processar pagamento' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (data.status === 'approved') {
      return new Response(
        JSON.stringify({ success: true, status: data.status, id: data.id }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        error: `Pagamento ${data.status}: ${data.status_detail || 'Verifique os dados do cartão'}`,
        status: data.status,
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Payment processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
