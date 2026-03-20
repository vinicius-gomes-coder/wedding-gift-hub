import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function PaymentPending() {
  const [searchParams] = useSearchParams();

  const paymentId = searchParams.get("payment_id");
  const paymentType = searchParams.get("payment_type");
  const merchantOrderId = searchParams.get("merchant_order_id");

  return (
    <main className="min-h-screen flex items-center justify-center px-8 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center text-center max-w-lg"
      >
        <div className="w-16 h-px bg-border mb-12" />

        <h2 className="font-display text-3xl md:text-5xl leading-relaxed mb-6">
          Pagamento em análise.
        </h2>

        <p className="font-body text-sm text-muted-foreground mb-6 leading-relaxed max-w-sm">
          {paymentType === "ticket" || paymentType === "bank_transfer" ? (
            <>
              Seu boleto ou código foi gerado. Assim que o pagamento for
              confirmado no ponto de pagamento, você receberá a notificação.
            </>
          ) : (
            <>
              Seu pagamento está sendo processado. Assim que aprovado, você
              receberá a confirmação.
            </>
          )}
        </p>

        <p className="font-body text-xs text-muted-foreground mb-10">
          Isso pode levar alguns instantes. Você pode fechar esta página.
        </p>

        {/* Detalhes */}
        {(paymentId || merchantOrderId) && (
          <div className="font-body text-xs text-muted-foreground mb-10 space-y-1">
            {paymentId && <p>Pagamento: {paymentId}</p>}
            {merchantOrderId && <p>Pedido: {merchantOrderId}</p>}
          </div>
        )}

        <Link
          to="/"
          className="font-body text-sm border border-border text-muted-foreground px-8 py-3 hover:border-foreground hover:text-foreground transition-all duration-500"
        >
          Voltar à lista de presentes
        </Link>
      </motion.div>
    </main>
  );
}
