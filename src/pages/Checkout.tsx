import { useState, useEffect, useCallback, useRef } from "react";
import { useStore } from "@/contexts/StoreContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";

type PaymentMethod = "pix" | "card";

const PIX_EXPIRATION_SECONDS = 10 * 60; // 10 minutes

export default function Checkout() {
  const { cart, cartTotal, completePurchase } = useStore();
  const navigate = useNavigate();

  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // PIX state
  const [pixCode, setPixCode] = useState("");
  const [pixQrCodeBase64, setPixQrCodeBase64] = useState("");
  const [pixPaymentId, setPixPaymentId] = useState<number | null>(null);
  const [pixLoading, setPixLoading] = useState(false);
  const [pixError, setPixError] = useState("");
  const [pixExpired, setPixExpired] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(PIX_EXPIRATION_SECONDS);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Card state
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [installments, setInstallments] = useState(1);
  const [cardProcessing, setCardProcessing] = useState(false);
  const [cardError, setCardError] = useState("");

  useEffect(() => {
    if (cart.length === 0 && !confirmed) {
      navigate("/");
    }
  }, [cart, confirmed, navigate]);

  // Create PIX payment when method is selected
  const createPixPayment = useCallback(async () => {
    setPixLoading(true);
    setPixError("");
    setPixExpired(false);
    setRemainingSeconds(PIX_EXPIRATION_SECONDS);

    try {
      const { data, error } = await supabase.functions.invoke("create-pix-payment", {
        body: {
          amount: cartTotal,
          items: cart.map((item) => ({
            title: item.gift.name,
            unit_price: item.gift.price,
            quantity: 1,
          })),
        },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setPixCode(data.qr_code || "");
      setPixQrCodeBase64(data.qr_code_base64 || "");
      setPixPaymentId(data.payment_id);
    } catch (err: any) {
      setPixError(err.message || "Erro ao gerar pagamento PIX. Tente novamente.");
    } finally {
      setPixLoading(false);
    }
  }, [cartTotal, cart]);

  useEffect(() => {
    if (method === "pix" && !confirmed) {
      createPixPayment();
    }
  }, [method, confirmed, createPixPayment]);

  // Countdown timer
  useEffect(() => {
    if (method !== "pix" || confirmed || pixExpired || !pixPaymentId) return;
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
  }, [method, confirmed, pixExpired, pixPaymentId]);

  // Poll payment status every 5 seconds
  useEffect(() => {
    if (!pixPaymentId || confirmed || pixExpired || method !== "pix") return;

    pollingRef.current = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke("check-payment-status", {
          body: { payment_id: pixPaymentId },
        });

        if (error) return;

        if (data?.status === "approved") {
          setConfirmed(true);
          completePurchase();
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch {
        // silently retry
      }
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [pixPaymentId, confirmed, pixExpired, method, completePurchase]);

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardError("");
    setCardProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          amount: cartTotal,
          installments,
          card: {
            holderName: cardName,
            number: cardNumber.replace(/\s/g, ""),
            expiry: cardExpiry,
            cvv: cardCvv,
          },
          items: cart.map((item) => ({
            title: item.gift.name,
            unit_price: item.gift.price,
            quantity: 1,
          })),
        },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setConfirmed(true);
      completePurchase();
    } catch (err: any) {
      setCardError(err.message || "Erro ao processar pagamento. Tente novamente.");
    } finally {
      setCardProcessing(false);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
  };

  const maxInstallments = Math.min(12, Math.floor(cartTotal / 50) || 1);
  const installmentOptions = Array.from({ length: maxInstallments }, (_, i) => i + 1);

  if (cart.length === 0 && !confirmed) return null;

  return (
    <main className="min-h-screen flex items-center justify-center px-8 py-24">
      <AnimatePresence mode="wait">
        {confirmed ? (
          <motion.div
            key="thanks"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex flex-col items-center text-center"
          >
            <h2 className="font-display text-3xl md:text-5xl text-accent leading-relaxed">
              Obrigado por fazer parte
              <br />
              da nossa história.
            </h2>
          </motion.div>
        ) : !method ? (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center max-w-md w-full"
          >
            <h2 className="font-display text-2xl md:text-3xl mb-2">Como deseja presentear?</h2>
            <p className="font-body text-sm text-muted-foreground mb-10">
              R$ {cartTotal.toLocaleString("pt-BR")}
            </p>

            <div className="flex flex-col gap-4 w-full max-w-xs">
              <button
                onClick={() => setMethod("pix")}
                className="font-body text-sm border border-foreground text-foreground px-6 py-4 hover:bg-foreground hover:text-background transition-all duration-500"
              >
                Pix
              </button>
              <button
                onClick={() => setMethod("card")}
                className="font-body text-sm border border-foreground text-foreground px-6 py-4 hover:bg-foreground hover:text-background transition-all duration-500"
              >
                Cartão de Crédito
              </button>
            </div>
          </motion.div>
        ) : method === "pix" ? (
          <motion.div
            key="pix"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center max-w-md"
          >
            <button
              onClick={() => setMethod(null)}
              className="font-body text-xs text-muted-foreground mb-8 hover:text-foreground transition-colors self-start"
            >
              ← Voltar
            </button>

            {pixLoading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-64 h-64 border-2 border-border flex items-center justify-center">
                  <p className="font-body text-sm text-muted-foreground animate-pulse">
                    Gerando QR Code...
                  </p>
                </div>
              </div>
            ) : pixError ? (
              <div className="flex flex-col items-center gap-4">
                <p className="font-body text-sm text-destructive">{pixError}</p>
                <button
                  onClick={createPixPayment}
                  className="font-body text-sm border border-foreground text-foreground px-6 py-3 hover:bg-foreground hover:text-background transition-all duration-500"
                >
                  Tentar novamente
                </button>
              </div>
            ) : pixExpired ? (
              <div className="flex flex-col items-center gap-4">
                <h2 className="font-display text-2xl md:text-3xl mb-2">Código expirado</h2>
                <p className="font-body text-sm text-muted-foreground">
                  O código PIX expirou após 10 minutos.
                </p>
                <button
                  onClick={createPixPayment}
                  className="font-body text-sm border border-foreground text-foreground px-6 py-3 hover:bg-foreground hover:text-background transition-all duration-500"
                >
                  Gerar novo código
                </button>
              </div>
            ) : (
              <>
                <div className="w-64 h-64 border-2 border-foreground p-4 mb-8 bg-white flex items-center justify-center">
                  {pixQrCodeBase64 ? (
                    <img
                      src={`data:image/png;base64,${pixQrCodeBase64}`}
                      alt="QR Code PIX"
                      className="w-full h-full object-contain"
                    />
                  ) : pixCode ? (
                    <QRCodeSVG value={pixCode} size={224} />
                  ) : null}
                </div>

                <h2 className="font-display text-2xl md:text-3xl mb-4">Aguardando o gesto.</h2>

                <p className="font-body text-sm text-muted-foreground mb-2">
                  R$ {cartTotal.toLocaleString("pt-BR")}
                </p>

                <p className={`font-body text-xs mb-8 ${remainingSeconds <= 60 ? "text-destructive" : "text-muted-foreground"}`}>
                  Expira em {formatTime(remainingSeconds)}
                </p>

                <div className="w-full mb-6">
                  <p className="font-body text-xs text-muted-foreground mb-2">Código Pix Copia e Cola:</p>
                  <div
                    className="font-body text-xs bg-secondary p-3 break-all cursor-pointer select-all border border-border"
                    onClick={handleCopyPix}
                  >
                    {pixCode}
                  </div>
                  <button
                    onClick={handleCopyPix}
                    className="font-body text-xs text-muted-foreground mt-2 hover:text-foreground transition-colors"
                  >
                    Copiar código
                  </button>
                </div>

                <p className="font-body text-xs text-muted-foreground animate-pulse">
                  Aguardando confirmação do pagamento...
                </p>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center max-w-md w-full"
          >
            <button
              onClick={() => setMethod(null)}
              className="font-body text-xs text-muted-foreground mb-8 hover:text-foreground transition-colors self-start"
            >
              ← Voltar
            </button>

            <h2 className="font-display text-2xl md:text-3xl mb-2 text-center">Cartão de Crédito</h2>
            <p className="font-body text-sm text-muted-foreground mb-8 text-center">
              R$ {cartTotal.toLocaleString("pt-BR")}
            </p>

            <form onSubmit={handleCardSubmit} className="w-full space-y-5">
              <div>
                <label className="font-body text-xs text-muted-foreground block mb-1.5">
                  Nome no cartão
                </label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full font-body text-sm border border-border bg-transparent px-4 py-3 focus:outline-none focus:border-foreground transition-colors"
                  placeholder="Como aparece no cartão"
                />
              </div>

              <div>
                <label className="font-body text-xs text-muted-foreground block mb-1.5">
                  Número do cartão
                </label>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  className="w-full font-body text-sm border border-border bg-transparent px-4 py-3 focus:outline-none focus:border-foreground transition-colors"
                  placeholder="0000 0000 0000 0000"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="font-body text-xs text-muted-foreground block mb-1.5">
                    Validade
                  </label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    className="w-full font-body text-sm border border-border bg-transparent px-4 py-3 focus:outline-none focus:border-foreground transition-colors"
                    placeholder="MM/AA"
                  />
                </div>
                <div className="flex-1">
                  <label className="font-body text-xs text-muted-foreground block mb-1.5">
                    CVV
                  </label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="w-full font-body text-sm border border-border bg-transparent px-4 py-3 focus:outline-none focus:border-foreground transition-colors"
                    placeholder="000"
                  />
                </div>
              </div>

              <div>
                <label className="font-body text-xs text-muted-foreground block mb-1.5">
                  Parcelas
                </label>
                <select
                  value={installments}
                  onChange={(e) => setInstallments(Number(e.target.value))}
                  className="w-full font-body text-sm border border-border bg-transparent px-4 py-3 focus:outline-none focus:border-foreground transition-colors appearance-none"
                >
                  {installmentOptions.map((n) => (
                    <option key={n} value={n}>
                      {n}x de R$ {(cartTotal / n).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      {n === 1 ? " (à vista)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {cardError && (
                <p className="font-body text-xs text-destructive">{cardError}</p>
              )}

              <button
                type="submit"
                disabled={cardProcessing}
                className="w-full font-body text-sm border border-foreground text-foreground px-6 py-4 hover:bg-foreground hover:text-background transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cardProcessing ? "Processando..." : "Pagar"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
