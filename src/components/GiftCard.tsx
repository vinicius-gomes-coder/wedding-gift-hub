import { motion } from "framer-motion";
import { useStore } from "@/contexts/StoreContext";
import type { Gift } from "@/data/gifts";
import { toast } from "sonner";

interface GiftCardProps {
  gift: Gift;
  index: number;
}

export default function GiftCard({ gift, index }: GiftCardProps) {
  const { addToCart, cart } = useStore();
  const isInCart = cart.some((item) => item.gift.id === gift.id);

  const handleAdd = () => {
    addToCart(gift);
    toast("Presente adicionado", {
      description: gift.name,
      style: { color: "hsl(42, 42%, 54%)" },
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.15 }}
      className="group"
    >
      <div className="aspect-square overflow-hidden border border-border mb-6">
        <img
          src={gift.image}
          alt={gift.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <h3 className="font-display text-xl md:text-2xl mb-2">{gift.name}</h3>
      <p className="font-body text-sm text-muted-foreground mb-3 leading-relaxed">
        {gift.description}
      </p>
      <div className="flex items-center justify-between">
        <span className="font-body text-base font-semibold">
          R$ {gift.price.toLocaleString("pt-BR")}
        </span>
        <button
          onClick={handleAdd}
          disabled={isInCart}
          className={`font-body text-sm px-5 py-2 border transition-all duration-500 ${
            isInCart
              ? "border-border text-muted-foreground cursor-default"
              : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          }`}
        >
          {isInCart ? "No carrinho" : "Adicionar"}
        </button>
      </div>
    </motion.article>
  );
}
