import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { initialGifts, type Gift, type Category } from "@/data/gifts";

interface CartItem {
  gift: Gift;
}

interface StoreContextType {
  gifts: Gift[];
  cart: CartItem[];
  selectedCategory: Category | null;
  showCategories: boolean;
  addToCart: (gift: Gift) => void;
  removeFromCart: (giftId: string) => void;
  setSelectedCategory: (cat: Category | null) => void;
  setShowCategories: (show: boolean) => void;
  completePurchase: () => void;
  cartTotal: number;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [gifts, setGifts] = useState<Gift[]>(initialGifts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCategories, setShowCategories] = useState(false);

  const addToCart = useCallback((gift: Gift) => {
    setCart((prev) => {
      if (prev.some((item) => item.gift.id === gift.id)) return prev;
      return [...prev, { gift }];
    });
  }, []);

  const removeFromCart = useCallback((giftId: string) => {
    setCart((prev) => prev.filter((item) => item.gift.id !== giftId));
  }, []);

  const completePurchase = useCallback(() => {
    const purchasedIds = cart.map((item) => item.gift.id);
    setGifts((prev) => prev.filter((g) => !purchasedIds.includes(g.id)));
    setCart([]);
  }, [cart]);

  const cartTotal = cart.reduce((sum, item) => sum + item.gift.price, 0);

  return (
    <StoreContext.Provider
      value={{
        gifts,
        cart,
        selectedCategory,
        showCategories,
        addToCart,
        removeFromCart,
        setSelectedCategory,
        setShowCategories,
        completePurchase,
        cartTotal,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
