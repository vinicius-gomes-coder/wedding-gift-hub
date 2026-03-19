import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    const { amount, items, payer_email } = await req.json();

    if (!amount || !items) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Set expiration to 10 minutes from now
    const expirationDate = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const paymentBody = {
      transaction_amount: amount,
      payment_method_id: 'pix',
      description: 'Presente de Casamento',
      date_of_expiration: expirationDate,
      payer: {
        email: payer_email || 'convidado@casamento.com',
      },
      additional_info: {
        items: items.map((item: any, index: number) => ({
          id: String(index + 1),
          title: item.title,
          quantity: item.quantity || 1,
          unit_price: item.unit_price,
        })),
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
      console.error('MercadoPago PIX error:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: data.message || 'Erro ao gerar pagamento PIX' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const transactionData = data.point_of_interaction?.transaction_data;

    return new Response(
      JSON.stringify({
        payment_id: data.id,
        status: data.status,
        qr_code: transactionData?.qr_code || '',
        qr_code_base64: transactionData?.qr_code_base64 || '',
        expiration: expirationDate,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('PIX payment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
