import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const PIX_EXPIRATION_SECONDS = 10 * 60;

type Step = "form" | "loading" | "pix" | "success" | "error";

interface BuyerInfo {
  name: string;
  email: string;
  message: string;
  amount: string; // string para controle do input, convertido para number ao enviar
}

export default function CustomPix() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [buyer, setBuyer] = useState<BuyerInfo>({
    name: "",
    email: "",
    message: "",
    amount: "",
  });
  const [buyerErrors, setBuyerErrors] = useState<
    Partial<Record<keyof BuyerInfo, string>>
  >({});

  const [pixCode, setPixCode] = useState("");
  const [pixQrCodeBase64, setPixQrCodeBase64] = useState("");
  const [pixPaymentId, setPixPaymentId] = useState<number | null>(null);
  const [pixExpired, setPixExpired] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(
    PIX_EXPIRATION_SECONDS,
  );
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Limpa polling ao desmontar
  useEffect(
    () => () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    },
    [],
  );

  // ── Validação ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errors: Partial<Record<keyof BuyerInfo, string>> = {};
    const amount = parseFloat(buyer.amount.replace(",", "."));

    if (!buyer.name.trim()) errors.name = "Informe seu nome";

    if (!buyer.email.trim()) {
      errors.email = "Informe seu e-mail";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email)) {
      errors.email = "E-mail inválido";
    }

    if (!buyer.amount.trim()) {
      errors.amount = "Informe o valor";
    } else if (isNaN(amount) || amount < 1) {
      errors.amount = "Valor mínimo de R$ 1,00";
    }

    setBuyerErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Gerar PIX ─────────────────────────────────────────────────────────────
  const createPixPayment = useCallback(async () => {
    setPixExpired(false);
    setRemainingSeconds(PIX_EXPIRATION_SECONDS);
    if (pollingRef.current) clearInterval(pollingRef.current);

    const amount = parseFloat(buyer.amount.replace(",", "."));

    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/pix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          payer_email: buyer.email,
          items: [
            {
              title: "Contribuição para os noivos",
              unit_price: amount,
              quantity: 1,
            },
          ],
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
  }, [buyer]);

  const handleSubmit = async () => {
    if (!validate()) return;
    setStep("loading");
    await createPixPayment();
  };

  // ── Contador regressivo ───────────────────────────────────────────────────
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

  // ── Polling de confirmação ────────────────────────────────────────────────
  useEffect(() => {
    if (step !== "pix" || !pixPaymentId || pixExpired) return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/payments/status/${pixPaymentId}`,
        );
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "approved") {
          clearInterval(pollingRef.current!);

          // Notifica backend para enviar os e-mails
          const amount = parseFloat(buyer.amount.replace(",", "."));
          await fetch(`${API_BASE_URL}/api/payments/notify-custom`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              buyer: {
                name: buyer.name,
                email: buyer.email,
                message: buyer.message,
              },
              amount,
            }),
          }).catch(() => {});

          setStep("success");
        }
      } catch {
        /* silencia erros de rede */
      }
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [step, pixPaymentId, pixExpired, buyer]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const formatBRL = (value: string) => {
    const num = parseFloat(value.replace(",", "."));
    return isNaN(num)
      ? ""
      : num.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  };

  const handleCopyPix = () => navigator.clipboard.writeText(pixCode);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen pt-28 pb-20 px-8 md:px-16 lg:px-24">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h1 className="font-display text-4xl md:text-5xl mb-3">
            Contribuição Especial
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            Envie qualquer valor via PIX diretamente para os noivos.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── Formulário ── */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-col gap-6 max-w-sm">
                {/* Valor */}
                <div>
                  <label className="font-body text-xs text-muted-foreground block mb-1.5 tracking-widest uppercase">
                    Valor *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-body text-sm text-muted-foreground">
                      R$
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={buyer.amount}
                      onChange={(e) =>
                        setBuyer((b) => ({ ...b, amount: e.target.value }))
                      }
                      placeholder="0,00"
                      className={`w-full font-body text-sm border bg-transparent pl-10 pr-4 py-3 outline-none focus:border-foreground transition-colors duration-300 placeholder:text-muted-foreground/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                        buyerErrors.amount
                          ? "border-destructive"
                          : "border-border"
                      }`}
                    />
                  </div>
                  {buyerErrors.amount && (
                    <p className="font-body text-xs text-destructive mt-1">
                      {buyerErrors.amount}
                    </p>
                  )}
                </div>

                {/* Nome */}
                <div>
                  <label className="font-body text-xs text-muted-foreground block mb-1.5 tracking-widest uppercase">
                    Seu nome *
                  </label>
                  <input
                    type="text"
                    value={buyer.name}
                    onChange={(e) =>
                      setBuyer((b) => ({ ...b, name: e.target.value }))
                    }
                    placeholder="Nome completo"
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
                    Seu e-mail *
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
                  onClick={() => navigate("/")}
                  className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  className="font-body text-sm bg-primary text-primary-foreground px-10 py-3.5 hover:opacity-90 transition-opacity duration-500 sm:ml-auto"
                >
                  Gerar PIX
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Carregando ── */}
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
                Gerando código PIX...
              </p>
            </motion.div>
          )}

          {/* ── PIX ── */}
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
                      R$ {formatBRL(buyer.amount)}
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
                onClick={() => {
                  setStep("form");
                  if (pollingRef.current) clearInterval(pollingRef.current);
                }}
                className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Voltar
              </button>
            </motion.div>
          )}

          {/* ── Sucesso ── */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="flex flex-col items-center text-center py-12"
            >
              <div className="w-16 h-px bg-accent mb-12" />

              <h2 className="font-display text-3xl md:text-5xl text-accent leading-relaxed mb-6">
                Obrigado por fazer parte
                <br />
                da nossa história.
              </h2>

              <p className="font-body text-sm text-muted-foreground mb-4 leading-relaxed">
                Sua contribuição de{" "}
                <span className="text-foreground font-medium">
                  R$ {formatBRL(buyer.amount)}
                </span>{" "}
                foi confirmada com sucesso.
              </p>
              <p className="font-body text-xs text-muted-foreground mb-12">
                Enviamos um e-mail de confirmação para você.
              </p>

              <button
                onClick={() => navigate("/")}
                className="font-body text-sm border border-border text-muted-foreground px-8 py-3 hover:border-foreground hover:text-foreground transition-all duration-500"
              >
                Ver lista de presentes
              </button>
            </motion.div>
          )}

          {/* ── Erro ── */}
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
                onClick={() => setStep("form")}
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
