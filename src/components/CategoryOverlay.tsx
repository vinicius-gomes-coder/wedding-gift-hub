import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useStore } from "@/contexts/StoreContext";

export default function CategoryOverlay() {
  const {
    categories,
    showCategories,
    setShowCategories,
    setSelectedCategory,
    selectedCategory,
  } = useStore();

  const navigate = useNavigate();
  const location = useLocation();

  const handleSelect = (cat: string | null) => {
    setSelectedCategory(cat);
    setShowCategories(false);
    // Se não estiver na página inicial, redireciona para lá com a categoria selecionada
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  return (
    <AnimatePresence>
      {showCategories && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-40
          pt-24 bg-background flex flex-col items-center justify-center"
        >
          <div className="flex flex-col items-center gap-8">
            <button
              onClick={() => handleSelect(null)}
              className={`font-display text-3xl md:text-5xl transition-colors duration-500 ${
                selectedCategory === null
                  ? "text-primary"
                  : "text-foreground hover:text-primary"
              }`}
            >
              Todos os Presentes
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleSelect(cat)}
                className={`font-display text-3xl md:text-5xl transition-colors duration-500 ${
                  selectedCategory === cat
                    ? "text-primary"
                    : "text-foreground hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
