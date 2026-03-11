import { useStore } from "@/contexts/StoreContext";
import GiftCard from "@/components/GiftCard";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const { gifts, selectedCategory } = useStore();

  const filtered = selectedCategory
    ? gifts.filter((g) => g.category === selectedCategory)
    : gifts;

  return (
    <main className="min-h-screen pt-28 pb-20 px-8 md:px-16 lg:px-24">
      <div className="max-w-6xl mx-auto">
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

        {filtered.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-display text-2xl text-muted-foreground text-center py-20"
          >
            Todos os presentes desta categoria já foram escolhidos.
          </motion.p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory || "all"}
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
    </main>
  );
};

export default Index;
