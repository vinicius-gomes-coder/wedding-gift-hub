import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";

const statusDetailMessages: Record<string, string> = {
  cc_rejected_insufficient_amount: "Saldo insuficiente no cartão.",
  cc_rejected_bad_filled_card_number: "Número do cartão incorreto.",
  cc_rejected_bad_filled_date: "Data de validade incorreta.",
  cc_rejected_bad_filled_security_code: "Código de segurança incorreto.",
  cc_rejected_call_for_authorize:
    "O banco solicitou que você autorize o pagamento.",
  cc_rejected_card_disabled:
    "Cartão desativado. Entre em contato com seu banco.",
  cc_rejected_duplicated_payment: "Pagamento duplicado detectado.",
  cc_rejected_high_risk:
    "Pagamento recusado por segurança. Tente outro cartão.",
};

export default function PaymentFailure() {
  const [searchParams] = useSearchParams();

  const paymentId = searchParams.get("payment_id");
  const statusDetail = searchParams.get("collection_status") || "";
  const merchantOrderId = searchParams.get("merchant_order_id");

  // Quando o usuário clica "Voltar à loja" no MP sem pagar,
  // todos os parâmetros chegam como "null" (string) ou vazios.
  const abandoned =
    (!paymentId || paymentId === "null") &&
    (!statusDetail || statusDetail === "null");

  if (abandoned) {
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
            Seu carrinho ainda
            <br />
            está te esperando.
          </h2>

          <p className="font-body text-sm text-muted-foreground mb-10 leading-relaxed">
            Você voltou sem concluir o pagamento.
            <br />
            Seus presentes continuam reservados no carrinho.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/checkout"
              className="font-body text-sm bg-primary text-primary-foreground px-8 py-3 hover:opacity-90 transition-opacity duration-500"
            >
              Voltar ao pagamento
            </Link>
            <Link
              to="/"
              className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver lista de presentes
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  const friendlyMessage =
    statusDetailMessages[statusDetail] ||
    "O pagamento não foi aprovado. Verifique os dados e tente novamente.";

  return (
    <main className="min-h-screen flex items-center justify-center px-8 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center text-center max-w-lg"
      >
        <div className="w-16 h-px bg-destructive/40 mb-12" />

        <h2 className="font-display text-3xl md:text-5xl leading-relaxed mb-6">
          Não conseguimos
          <br />
          processar o pagamento.
        </h2>

        <p className="font-body text-sm text-muted-foreground mb-10 leading-relaxed max-w-sm">
          {friendlyMessage}
        </p>

        {(paymentId || merchantOrderId) && (
          <div className="font-body text-xs text-muted-foreground mb-10 space-y-1">
            {paymentId && paymentId !== "null" && <p>Pagamento: {paymentId}</p>}
            {merchantOrderId && merchantOrderId !== "null" && (
              <p>Pedido: {merchantOrderId}</p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/checkout"
            className="font-body text-sm bg-primary text-primary-foreground px-8 py-3 hover:opacity-90 transition-opacity duration-500"
          >
            Tentar novamente
          </Link>
          <Link
            to="/"
            className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Voltar à lista
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
