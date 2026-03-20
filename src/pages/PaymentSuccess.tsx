import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useStore } from "@/contexts/StoreContext";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const { completePurchase } = useStore();

  // Parâmetros retornados pelo MercadoPago via back_url
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");
  const merchantOrderId = searchParams.get("merchant_order_id");

  // Limpa o carrinho ao confirmar o sucesso
  useEffect(() => {
    completePurchase();
  }, [completePurchase]);

  return (
    <main className="min-h-screen flex items-center justify-center px-8 py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="flex flex-col items-center text-center max-w-lg"
      >
        {/* Ícone decorativo */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-16 h-px bg-accent mb-12"
        />

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-display text-3xl md:text-5xl text-accent leading-relaxed mb-6"
        >
          Obrigado por fazer parte
          <br />
          da nossa história.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="font-body text-sm text-muted-foreground mb-10 leading-relaxed"
        >
          Seu presente foi confirmado com sucesso.
          <br />
          Ele fará parte dos nossos dias com muito amor.
        </motion.p>

        {/* Detalhes do pagamento (discretos) */}
        {paymentId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="font-body text-xs text-muted-foreground mb-10 space-y-1"
          >
            {paymentId && <p>Pagamento: {paymentId}</p>}
            {merchantOrderId && <p>Pedido: {merchantOrderId}</p>}
            {status && <p>Status: {status}</p>}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <Link
            to="/"
            className="font-body text-sm border border-border text-muted-foreground px-8 py-3 hover:border-foreground hover:text-foreground transition-all duration-500"
          >
            Ver mais presentes
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
