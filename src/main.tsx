import { createRoot } from "react-dom/client";
import { initMercadoPago } from "@mercadopago/sdk-react";
import App from "./App.tsx";
import "./index.css";

// Inicializa o SDK do MercadoPago com a Public Key.
// Esta chave é pública e segura para uso no frontend.
// Configure VITE_MP_PUBLIC_KEY no arquivo .env do projeto.
initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY || "", {
  locale: "pt-BR",
});

createRoot(document.getElementById("root")!).render(<App />);
