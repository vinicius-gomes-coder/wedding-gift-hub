import { useState, useEffect, useCallback, useRef } from "react";
import { useStore } from "@/contexts/StoreContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Wallet } from "@mercadopago/sdk-react";
import { QRCodeSVG } from "qrcode.react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const PIX_EXPIRATION_SECONDS = 10 * 60;

type Step =
  | "summary" // resumo do carrinho
  | "buyer" // nome, e-mail e mensagem
  | "method" // escolha: PIX ou Cartão
  | "loading" // aguardando resposta do backend
  | "pix" // QR code PIX
  | "wallet" // Wallet Brick (cartão/Checkout Pro)
  | "error"; // erro genérico

type PaymentMethod = "pix" | "card";

interface BuyerInfo {
  name: string;
  email: string;
  message: string;
}

// Chave usada para persistir dados do comprador entre o redirect do cartão
const BUYER_SESSION_KEY = "wedding_buyer_info";
const CART_SESSION_KEY = "wedding_cart_snapshot";

export default function Checkout() {
  const { cart, cartTotal, completePurchase } = useStore();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("summary");
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Dados do comprador
  const [buyer, setBuyer] = useState<BuyerInfo>({
    name: "",
    email: "",
    message: "",
  });
  const [buyerErrors, setBuyerErrors] = useState<Partial<BuyerInfo>>({});

  // Estado Checkout Pro (cartão)
  const [preferenceId, setPreferenceId] = useState<string | null>(null);

  // Estado PIX
  const [pixCode, setPixCode] = useState("");
  const [pixQrCodeBase64, setPixQrCodeBase64] = useState("");
  const [pixPaymentId, setPixPaymentId] = useState<number | null>(null);
  const [pixExpired, setPixExpired] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(
    PIX_EXPIRATION_SECONDS,
  );
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Redireciona se carrinho vazio
  useEffect(() => {
    if (cart.length === 0) navigate("/");
  }, [cart, navigate]);

  // Limpa polling ao desmontar
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // ── Validação do formulário de comprador ──────────────────────────────────
  const validateBuyer = (): boolean => {
    const errors: Partial<BuyerInfo> = {};

    if (!buyer.name.trim()) errors.name = "Informe seu nome";

    if (!buyer.email.trim()) {
      errors.email = "Informe seu e-mail";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email)) {
      errors.email = "E-mail inválido";
    }

    setBuyerErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBuyerContinue = () => {
    if (!validateBuyer()) return;

    // Persiste no sessionStorage para sobreviver ao redirect do cartão
    sessionStorage.setItem(BUYER_SESSION_KEY, JSON.stringify(buyer));
    sessionStorage.setItem(
      CART_SESSION_KEY,
      JSON.stringify(
        cart.map((item) => ({
          title: item.gift.name,
          unit_price: item.gift.price,
          quantity: 1,
        })),
      ),
    );

    setStep("method");
  };

  // ── Selecionar método e chamar o backend ──────────────────────────────────
  const handleSelectMethod = async (selected: PaymentMethod) => {
    setMethod(selected);
    setStep("loading");
    setErrorMessage("");

    if (selected === "card") {
      await createPreference();
    } else {
      await createPixPayment();
    }
  };

  // ── Checkout Pro (cartão) ─────────────────────────────────────────────────
  const createPreference = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/preference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payer_email: buyer.email,
          items: cart.map((item) => ({
            title: item.gift.name,
            unit_price: item.gift.price,
            quantity: 1,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Erro ao iniciar pagamento");

      setPreferenceId(data.preference_id);
      setStep("wallet");
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Erro ao conectar com o servidor.",
      );
      setStep("error");
    }
  };

  // ── PIX ───────────────────────────────────────────────────────────────────
  const createPixPayment = useCallback(async () => {
    setPixExpired(false);
    setRemainingSeconds(PIX_EXPIRATION_SECONDS);
    if (pollingRef.current) clearInterval(pollingRef.current);

    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/pix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: cartTotal,
          payer_email: buyer.email,
          items: cart.map((item) => ({
            title: item.gift.name,
            unit_price: item.gift.price,
            quantity: 1,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao gerar PIX");

      setPixCode(data.qr_code || "");
      setPixQrCodeBase64(data.qr_code_base64 || "");
      setPixPaymentId(data.payment_id);
      setStep("pix");
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Erro ao gerar pagamento PIX.",
      );
      setStep("error");
    }
  }, [cart, cartTotal, buyer.email]);

  // ── Notificar backend → dispara e-mails ───────────────────────────────────
  const sendNotification = useCallback(
    async (paymentMethod: PaymentMethod, buyerData: BuyerInfo) => {
      try {
        await fetch(`${API_BASE_URL}/api/payments/notify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buyer: buyerData,
            items: cart.map((item) => ({
              title: item.gift.name,
              unit_price: item.gift.price,
              quantity: 1,
            })),
            total: cartTotal,
            paymentMethod,
          }),
        });
      } catch {
        // E-mail falhou mas pagamento foi confirmado — não bloqueia o fluxo
        console.warn("Falha ao enviar notificação de e-mail.");
      }
    },
    [cart, cartTotal],
  );

  // Contador regressivo do PIX
  useEffect(() => {
    if (step !== "pix" || pixExpired || !pixPaymentId) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setPixExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, pixExpired, pixPaymentId]);

  // Polling de status do PIX a cada 5 segundos
  useEffect(() => {
    if (step !== "pix" || !pixPaymentId || pixExpired) return;

    pollingRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/payments/status/${pixPaymentId}`,
        );
        if (!response.ok) return;

        const data = await response.json();

        if (data.status === "approved") {
          clearInterval(pollingRef.current!);
          await sendNotification("pix", buyer);
          completePurchase();
          navigate("/pagamento/sucesso");
        }
      } catch {
        // Silencia erros de rede e tenta novamente
      }
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [
    step,
    pixPaymentId,
    pixExpired,
    completePurchase,
    navigate,
    sendNotification,
    buyer,
  ]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
  };

  const handleBack = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setStep("method");
    setMethod(null);
    setPixCode("");
    setPixQrCodeBase64("");
    setPixPaymentId(null);
    setPreferenceId(null);
    setPixExpired(false);
    setRemainingSeconds(PIX_EXPIRATION_SECONDS);
  };

  if (cart.length === 0) return null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen pt-28 pb-20 px-8 md:px-16 lg:px-24">
      <div className="max-w-2xl mx-auto">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="font-display text-4xl md:text-5xl mb-16"
        >
          Finalizar Compra
        </motion.h1>

        <AnimatePresence mode="wait">
          {/* ── 1. Resumo do pedido ── */}
          {step === "summary" && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-10">
                {cart.map((item) => (
                  <div
                    key={item.gift.id}
                    className="flex items-center gap-5 py-5 border-b border-border"
                  >
                    <div className="w-16 h-16 flex-shrink-0 border border-border overflow-hidden">
                      <img
                        src={item.gift.image}
                        alt={item.gift.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-lg leading-tight">
                        {item.gift.name}
                      </p>
                      <p className="font-body text-sm text-muted-foreground mt-0.5">
                        {item.gift.category}
                      </p>
                    </div>
                    <span className="font-body text-sm font-medium flex-shrink-0">
                      R${" "}
                      {item.gift.price.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mb-12">
                <span className="font-display text-xl text-muted-foreground">
                  Total
                </span>
                <span className="font-display text-2xl">
                  R${" "}
                  {cartTotal.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={() => navigate("/carrinho")}
                  className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Voltar ao carrinho
                </button>
                <button
                  onClick={() => setStep("buyer")}
                  className="font-body text-sm bg-primary text-primary-foreground px-10 py-3.5 hover:opacity-90 transition-opacity duration-500 ml-auto"
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          )}

          {/* ── 2. Dados do comprador ── */}
          {step === "buyer" && (
            <motion.div
              key="buyer"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-2xl mb-2">
                Quem está presenteando?
              </h2>
              <p className="font-body text-sm text-muted-foreground mb-10">
                Seus dados serão usados para confirmar a compra e enviar uma
                mensagem aos noivos.
              </p>

              <div className="flex flex-col gap-6 max-w-sm">
                {/* Nome */}
                <div>
                  <label className="font-body text-xs text-muted-foreground block mb-1.5 tracking-widest uppercase">
                    Nome completo *
                  </label>
                  <input
                    type="text"
                    value={buyer.name}
                    onChange={(e) =>
                      setBuyer((b) => ({ ...b, name: e.target.value }))
                    }
                    placeholder="Seu nome"
                    className={`w-full font-body text-sm border bg-transparent px-4 py-3 outline-none focus:border-foreground transition-colors duration-300 placeholder:text-muted-foreground/50 ${
                      buyerErrors.name ? "border-destructive" : "border-border"
                    }`}
                  />
                  {buyerErrors.name && (
                    <p className="font-body text-xs text-destructive mt-1">
                      {buyerErrors.name}
                    </p>
                  )}
                </div>

                {/* E-mail */}
                <div>
                  <label className="font-body text-xs text-muted-foreground block mb-1.5 tracking-widest uppercase">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    value={buyer.email}
                    onChange={(e) =>
                      setBuyer((b) => ({ ...b, email: e.target.value }))
                    }
                    placeholder="seu@email.com"
                    className={`w-full font-body text-sm border bg-transparent px-4 py-3 outline-none focus:border-foreground transition-colors duration-300 placeholder:text-muted-foreground/50 ${
                      buyerErrors.email ? "border-destructive" : "border-border"
                    }`}
                  />
                  {buyerErrors.email && (
                    <p className="font-body text-xs text-destructive mt-1">
                      {buyerErrors.email}
                    </p>
                  )}
                </div>

                {/* Mensagem */}
                <div>
                  <label className="font-body text-xs text-muted-foreground block mb-1.5 tracking-widest uppercase">
                    Mensagem para os noivos{" "}
                    <span className="normal-case">(opcional)</span>
                  </label>
                  <textarea
                    value={buyer.message}
                    onChange={(e) =>
                      setBuyer((b) => ({ ...b, message: e.target.value }))
                    }
                    placeholder="Escreva uma mensagem especial para Eduarda e Vinicius..."
                    rows={4}
                    className="w-full font-body text-sm border border-border bg-transparent px-4 py-3 outline-none focus:border-foreground transition-colors duration-300 placeholder:text-muted-foreground/50 resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
                <button
                  onClick={() => setStep("summary")}
                  className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Voltar ao resumo
                </button>
                <button
                  onClick={handleBuyerContinue}
                  className="font-body text-sm bg-primary text-primary-foreground px-10 py-3.5 hover:opacity-90 transition-opacity duration-500 sm:ml-auto"
                >
                  Ir para o pagamento
                </button>
              </div>
            </motion.div>
          )}

          {/* ── 3. Escolha do método ── */}
          {step === "method" && (
            <motion.div
              key="method"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-between mb-12 pb-6 border-b border-border">
                <span className="font-display text-lg text-muted-foreground">
                  {cart.length} {cart.length === 1 ? "presente" : "presentes"}
                </span>
                <span className="font-display text-2xl">
                  R${" "}
                  {cartTotal.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <h2 className="font-display text-2xl mb-8">
                Como deseja presentear?
              </h2>

              <div className="flex flex-col gap-4 max-w-sm">
                <button
                  onClick={() => handleSelectMethod("pix")}
                  className="group flex items-center gap-4 border border-border px-6 py-5 hover:border-foreground transition-all duration-500 text-left"
                >
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center border border-border group-hover:border-foreground transition-colors duration-500">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-display text-lg">PIX</p>
                    <p className="font-body text-xs text-muted-foreground">
                      Pagamento instantâneo
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectMethod("card")}
                  className="group flex items-center gap-4 border border-border px-6 py-5 hover:border-foreground transition-all duration-500 text-left"
                >
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center border border-border group-hover:border-foreground transition-colors duration-500">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-display text-lg">Cartão de Crédito</p>
                    <p className="font-body text-xs text-muted-foreground">
                      Via Mercado Pago — em até 12x
                    </p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setStep("buyer")}
                className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors mt-8 block"
              >
                ← Voltar
              </button>
            </motion.div>
          )}

          {/* ── 4. Carregando ── */}
          {step === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-24 gap-4"
            >
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="font-body text-sm text-muted-foreground">
                {method === "pix"
                  ? "Gerando código PIX..."
                  : "Preparando o pagamento..."}
              </p>
            </motion.div>
          )}

          {/* ── 5. PIX ── */}
          {step === "pix" && (
            <motion.div
              key="pix"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center"
            >
              {pixExpired ? (
                <div className="flex flex-col items-center gap-6 py-12 text-center">
                  <h2 className="font-display text-2xl">Código expirado.</h2>
                  <p className="font-body text-sm text-muted-foreground">
                    O código PIX expirou após 10 minutos.
                  </p>
                  <button
                    onClick={createPixPayment}
                    className="font-body text-sm border border-foreground text-foreground px-8 py-3 hover:bg-foreground hover:text-background transition-all duration-500"
                  >
                    Gerar novo código
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between w-full mb-8 pb-5 border-b border-border">
                    <span className="font-display text-lg text-muted-foreground">
                      PIX
                    </span>
                    <span className="font-display text-2xl">
                      R${" "}
                      {cartTotal.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="w-56 h-56 border-2 border-foreground p-3 mb-6 bg-white flex items-center justify-center">
                    {pixQrCodeBase64 ? (
                      <img
                        src={`data:image/png;base64,${pixQrCodeBase64}`}
                        alt="QR Code PIX"
                        className="w-full h-full object-contain"
                      />
                    ) : pixCode ? (
                      <QRCodeSVG value={pixCode} size={200} />
                    ) : null}
                  </div>

                  <p
                    className={`font-body text-xs mb-6 tabular-nums ${
                      remainingSeconds <= 60
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    Expira em {formatTime(remainingSeconds)}
                  </p>

                  <div className="w-full max-w-sm mb-2">
                    <p className="font-body text-xs text-muted-foreground mb-2">
                      Pix Copia e Cola
                    </p>
                    <div
                      onClick={handleCopyPix}
                      className="font-body text-xs bg-secondary border border-border p-3 break-all cursor-pointer select-all leading-relaxed"
                    >
                      {pixCode}
                    </div>
                  </div>
                  <button
                    onClick={handleCopyPix}
                    className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
                  >
                    Copiar código
                  </button>

                  <p className="font-body text-xs text-muted-foreground animate-pulse mb-8">
                    Aguardando confirmação do pagamento...
                  </p>
                </>
              )}

              <button
                onClick={handleBack}
                className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Voltar
              </button>
            </motion.div>
          )}

          {/* ── 6. Wallet Brick (cartão) ── */}
          {step === "wallet" && preferenceId && (
            <motion.div
              key="wallet"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-between mb-8 pb-5 border-b border-border">
                <span className="font-display text-lg text-muted-foreground">
                  {cart.length} {cart.length === 1 ? "presente" : "presentes"}
                </span>
                <span className="font-display text-2xl">
                  R${" "}
                  {cartTotal.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <p className="font-body text-sm text-muted-foreground mb-6">
                Clique no botão abaixo para concluir o pagamento com segurança
                pelo Mercado Pago.
              </p>

              <Wallet initialization={{ preferenceId, redirectMode: "self" }} />

              <button
                onClick={handleBack}
                className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors mt-6 block"
              >
                ← Voltar
              </button>
            </motion.div>
          )}

          {/* ── 7. Erro ── */}
          {step === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-20 gap-6 text-center"
            >
              <p className="font-display text-2xl text-destructive">
                Ops, algo deu errado.
              </p>
              <p className="font-body text-sm text-muted-foreground max-w-sm">
                {errorMessage}
              </p>
              <button
                onClick={handleBack}
                className="font-body text-sm border border-foreground text-foreground px-8 py-3 hover:bg-foreground hover:text-background transition-all duration-500"
              >
                Tentar novamente
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
