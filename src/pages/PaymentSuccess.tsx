import { useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useStore } from "@/contexts/StoreContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const BUYER_SESSION_KEY = "wedding_buyer_info";
const CART_SESSION_KEY = "wedding_cart_snapshot";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const { completePurchase } = useStore();
  const notifiedRef = useRef(false); // evita disparar duas vezes em StrictMode

  const paymentId = searchParams.get("payment_id");
  const merchantOrderId = searchParams.get("merchant_order_id");

  useEffect(() => {
    if (notifiedRef.current) return;
    notifiedRef.current = true;

    completePurchase();

    // Recupera dados salvos antes do redirect do cartão
    const rawBuyer = sessionStorage.getItem(BUYER_SESSION_KEY);
    const rawCart = sessionStorage.getItem(CART_SESSION_KEY);

    if (!rawBuyer || !rawCart) return; // PIX já enviou a notificação via polling

    try {
      const buyer = JSON.parse(rawBuyer);
      const items = JSON.parse(rawCart);
      const total = items.reduce(
        (sum: number, item: { unit_price: number; quantity: number }) =>
          sum + item.unit_price * item.quantity,
        0,
      );

      fetch(`${API_BASE_URL}/api/payments/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyer, items, total, paymentMethod: "card" }),
      }).catch(() => {
        console.warn("Falha ao enviar notificação de e-mail.");
      });

      // Limpa sessionStorage após usar
      sessionStorage.removeItem(BUYER_SESSION_KEY);
      sessionStorage.removeItem(CART_SESSION_KEY);
    } catch {
      console.warn("Erro ao processar dados do comprador.");
    }
  }, [completePurchase]);

  return (
    <main className="min-h-screen flex items-center justify-center px-8 py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="flex flex-col items-center text-center max-w-lg"
      >
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
          className="font-body text-sm text-muted-foreground mb-4 leading-relaxed"
        >
          Seu presente foi confirmado com sucesso.
          <br />
          Ele fará parte dos nossos dias com muito amor.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.75 }}
          className="font-body text-xs text-muted-foreground mb-10"
        >
          Enviamos um e-mail de confirmação para você.
        </motion.p>

        {paymentId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="font-body text-xs text-muted-foreground mb-10 space-y-1"
          >
            <p>Pagamento: {paymentId}</p>
            {merchantOrderId && <p>Pedido: {merchantOrderId}</p>}
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
