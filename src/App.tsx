import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "@/contexts/StoreContext";
import Header from "@/components/Header";
import CategoryOverlay from "@/components/CategoryOverlay";
import Index from "./pages/Index";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CustomPix from "./pages/CustomPix";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import PaymentPending from "./pages/PaymentPending";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <StoreProvider>
      <TooltipProvider>
        <Sonner />
        <Header />
        <CategoryOverlay />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/carrinho" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/contribuicao" element={<CustomPix />} />

          {/* Rotas de retorno do Checkout Pro */}
          <Route path="/pagamento/sucesso" element={<PaymentSuccess />} />
          <Route path="/pagamento/erro" element={<PaymentFailure />} />
          <Route path="/pagamento/pendente" element={<PaymentPending />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </StoreProvider>
  </BrowserRouter>
);

export default App;
