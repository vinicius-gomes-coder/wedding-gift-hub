import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/contexts/StoreContext";
import { CATEGORIES } from "@/data/gifts";

export default function CategoryOverlay() {
  const { showCategories, setShowCategories, setSelectedCategory, selectedCategory } = useStore();

  const handleSelect = (cat: typeof CATEGORIES[number] | null) => {
    setSelectedCategory(cat);
    setShowCategories(false);
  };

  return (
    <AnimatePresence>
      {showCategories && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-40 bg-background flex flex-col items-center justify-center"
        >
          <div className="flex flex-col items-center gap-8">
            <button
              onClick={() => handleSelect(null)}
              className={`font-display text-3xl md:text-5xl transition-colors duration-500 ${
                selectedCategory === null ? "text-primary" : "text-foreground hover:text-primary"
              }`}
            >
              Todos os Presentes
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleSelect(cat)}
                className={`font-display text-3xl md:text-5xl transition-colors duration-500 ${
                  selectedCategory === cat ? "text-primary" : "text-foreground hover:text-primary"
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
