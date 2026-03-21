import { useState, useMemo } from "react";
import { useStore } from "@/contexts/StoreContext";
import GiftCard from "@/components/GiftCard";
import GiftFilters from "@/components/GiftFilters";
import { motion, AnimatePresence } from "framer-motion";
import type { Category } from "@/data/gifts";

const Index = () => {
  const { gifts, categories, selectedCategory, loading, error } = useStore();

  // MAX_PRICE derivado dos gifts do banco (recalcula quando gifts muda)
  const maxPrice = useMemo(
    () =>
      gifts.length > 0
        ? Math.ceil(Math.max(...gifts.map((g) => g.price)))
        : 1000,
    [gifts],
  );

  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  // Usa maxPrice como valor inicial do slider assim que os dados chegam
  const effectivePriceMax = priceMax ?? maxPrice;

  const handleCategoryToggle = (cat: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const filtered = useMemo(() => {
    let result = gifts;

    if (selectedCategory) {
      result = result.filter((g) => g.category === selectedCategory);
    }

    if (!selectedCategory && selectedCategories.length > 0) {
      result = result.filter((g) => selectedCategories.includes(g.category));
    }

    result = result.filter((g) => g.price <= effectivePriceMax);

    return result;
  }, [gifts, selectedCategory, selectedCategories, effectivePriceMax]);

  // ── Estados de carregamento e erro ───────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-body text-sm text-muted-foreground">
            Carregando presentes...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="font-display text-2xl text-destructive">
            Ops, algo deu errado.
          </p>
          <p className="font-body text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="font-body text-sm border border-foreground px-8 py-3 hover:bg-foreground hover:text-background transition-all duration-500"
          >
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  // ── Render principal ──────────────────────────────────────────────────────
  return (
    <main className="min-h-screen pt-28 pb-20 px-8 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-16 md:mb-24"
        >
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4">
            Lista de Presentes
          </h1>
          {selectedCategory && (
            <p className="font-display text-xl text-muted-foreground">
              {selectedCategory}
            </p>
          )}
        </motion.div>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <GiftFilters
              categories={categories}
              priceMax={effectivePriceMax}
              maxPrice={maxPrice}
              onPriceChange={setPriceMax}
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
              showCategoryFilter={!selectedCategory}
            />
          </div>

          {/* Grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-display text-2xl text-muted-foreground text-center py-20"
              >
                Nenhum presente encontrado com os filtros selecionados.
              </motion.p>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedCategory || "all"}-${selectedCategories.join(",")}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16"
                >
                  {filtered.map((gift, i) => (
                    <GiftCard key={gift.id} gift={gift} index={i} />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Index;
