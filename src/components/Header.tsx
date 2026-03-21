import { Link } from "react-router-dom";
import { useStore } from "@/contexts/StoreContext";
import logoEv from "@/assets/logo-ev.png";

export default function Header() {
  const { cart, setShowCategories, showCategories, setSelectedCategory } =
    useStore();

  const handleLogoClick = () => {
    setSelectedCategory(null);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm">
      <nav className="flex items-center justify-between px-8 md:px-16 py-6">
        <Link
          to="/"
          onClick={handleLogoClick}
          className="font-display text-2xl md:text-3xl tracking-wide text-foreground"
        >
          Eduarda & Vinicius
        </Link>
        <img src={logoEv} alt="E & V" className="h-16 w-auto" />

        <div className="flex items-center gap-8 md:gap-12 font-display text-lg">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="text-foreground hover:text-primary transition-colors duration-500"
          >
            Categorias
          </button>
          <Link
            to="/carrinho"
            className="text-foreground hover:text-primary transition-colors duration-500"
          >
            Carrinho{cart.length > 0 && ` (${cart.length})`}
          </Link>
        </div>
      </nav>
    </header>
  );
}
