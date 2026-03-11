import { useState, useEffect } from "react";
import { useStore } from "@/contexts/StoreContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

function generatePixCode(amount: number): string {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 32; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `00020126580014BR.GOV.BCB.PIX0136${code}5204000053039865802BR5913CASAMENTO6014SAO PAULO62070503***6304${amount}`;
}

export default function Checkout() {
  const { cart, cartTotal, completePurchase } = useStore();
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [pixCode, setPixCode] = useState("");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (cart.length === 0 && !confirmed) {
      navigate("/");
    }
  }, [cart, confirmed, navigate]);

  useEffect(() => {
    setPixCode(generatePixCode(cartTotal));
  }, [cartTotal]);

  useEffect(() => {
    if (confirmed) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [confirmed]);

  const handleConfirm = () => {
    setConfirmed(true);
    completePurchase();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  if (cart.length === 0 && !confirmed) return null;

  return (
    <main className="min-h-screen flex items-center justify-center px-8">
      <AnimatePresence mode="wait">
        {!confirmed ? (
          <motion.div
            key="pix"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center max-w-md"
          >
            {/* QR Code placeholder - a stylized representation */}
            <div className="w-64 h-64 border-2 border-foreground p-4 mb-8">
              <div className="w-full h-full bg-foreground/5 flex items-center justify-center">
                <div className="grid grid-cols-8 grid-rows-8 gap-[2px] w-48 h-48">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`${
                        Math.random() > 0.45 ? "bg-foreground" : "bg-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <h2 className="font-display text-2xl md:text-3xl mb-4">Aguardando o gesto.</h2>

            <p className="font-body text-sm text-muted-foreground mb-2">
              R$ {cartTotal.toLocaleString("pt-BR")}
            </p>

            <p className="font-body text-xs text-muted-foreground mb-8">
              {formatTime(seconds)}
            </p>

            <div className="w-full mb-6">
              <p className="font-body text-xs text-muted-foreground mb-2">Código Pix Copia e Cola:</p>
              <div
                className="font-body text-xs bg-secondary p-3 break-all cursor-pointer select-all border border-border"
                onClick={() => {
                  navigator.clipboard.writeText(pixCode);
                }}
              >
                {pixCode}
              </div>
            </div>

            {/* Simulated confirm button for demo */}
            <button
              onClick={handleConfirm}
              className="font-body text-sm border border-primary text-primary px-6 py-3 hover:bg-primary hover:text-primary-foreground transition-all duration-500"
            >
              Simular confirmação do pagamento
            </button>
          </motion.div>
        ) : (
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
        )}
      </AnimatePresence>
    </main>
  );
}
