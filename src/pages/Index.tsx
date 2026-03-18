import { useState, useMemo, useEffect } from "react";
import { useStore } from "@/contexts/StoreContext";
import GiftCard from "@/components/GiftCard";
import GiftFilters from "@/components/GiftFilters";
import { motion, AnimatePresence } from "framer-motion";
import { initialGifts, type Category } from "@/data/gifts";

const MAX_PRICE = Math.ceil(Math.max(...initialGifts.map((g) => g.price)));

const Index = () => {
  const { gifts, selectedCategory, setSelectedCategory } = useStore();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  // Reset filters on mount (page refresh or navigation)
  useEffect(() => {
    setPriceRange([0, MAX_PRICE]);
    setSelectedCategories([]);
    setSelectedCategory(null);
  }, [setSelectedCategory]);

  const handleCategoryToggle = (cat: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const filtered = useMemo(() => {
    let result = gifts;

    // Apply category from header overlay
    if (selectedCategory) {
      result = result.filter((g) => g.category === selectedCategory);
    }

    // Apply checkbox categories (only when no overlay category is active)
    if (!selectedCategory && selectedCategories.length > 0) {
      result = result.filter((g) => selectedCategories.includes(g.category));
    }

    // Apply price range
    result = result.filter(
      (g) => g.price >= priceRange[0] && g.price <= priceRange[1]
    );

    return result;
  }, [gifts, selectedCategory, selectedCategories, priceRange]);

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
            <p className="font-display text-xl text-muted-foreground">{selectedCategory}</p>
          )}
        </motion.div>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar Filters */}
          <div className="w-full md:w-64 shrink-0">
            <GiftFilters
              priceRange={priceRange}
              maxPrice={MAX_PRICE}
              onPriceChange={setPriceRange}
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
              showCategoryFilter={!selectedCategory}
            />
          </div>

          {/* Gift Grid */}
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
                  key={`${selectedCategory || "all"}-${selectedCategories.join(",")}-${priceRange.join("-")}`}
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
