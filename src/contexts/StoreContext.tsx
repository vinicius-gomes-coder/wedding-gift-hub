import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "@/data/supabaseClient";
import { resolveImage, type Gift, type Category } from "@/data/gifts";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface CartItem {
  gift: Gift;
}

interface StoreContextType {
  gifts: Gift[];
  categories: Category[];
  cart: CartItem[];
  selectedCategory: Category | null;
  showCategories: boolean;
  loading: boolean;
  error: string | null;
  addToCart: (gift: Gift) => void;
  removeFromCart: (giftId: string) => void;
  setSelectedCategory: (cat: Category | null) => void;
  setShowCategories: (show: boolean) => void;
  completePurchase: () => void;
  cartTotal: number;
}

// ─── Row do Supabase (snake_case) ─────────────────────────────────────────────
interface GiftRow {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  sort_order: number;
}

const CART_STORAGE_KEY = "wedding_cart";

function saveCart(cart: CartItem[]) {
  // Salva apenas os dados necessários (sem a URL da imagem que muda por build)
  const toSave = cart.map((item) => ({
    id: item.gift.id,
    name: item.gift.name,
    description: item.gift.description,
    price: item.gift.price,
    category: item.gift.category,
    image: item.gift.image,
  }));
  sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(toSave));
}

function loadCart(): CartItem[] {
  try {
    const raw = sessionStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Gift[];
    return parsed.map((gift) => ({ gift }));
  } catch {
    return [];
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>(loadCart); // restaura do sessionStorage
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [showCategories, setShowCategories] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Busca os presentes no Supabase ao montar ──────────────────────────────
  useEffect(() => {
    async function fetchGifts() {
      setLoading(true);
      setError(null);

      const { data, error: sbError } = await supabase
        .from("gifts")
        .select("*")
        .eq("available", true)
        .order("sort_order", { ascending: true });

      if (sbError) {
        console.error("Erro ao buscar presentes:", sbError.message);
        setError("Não foi possível carregar os presentes. Tente novamente.");
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as GiftRow[];

      const mappedGifts: Gift[] = rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        price: Number(row.price),
        category: row.category,
        image: resolveImage(row.image),
      }));

      const uniqueCategories: Category[] = [];
      for (const g of mappedGifts) {
        if (!uniqueCategories.includes(g.category)) {
          uniqueCategories.push(g.category);
        }
      }

      // Reconcilia o carrinho restaurado com os dados frescos do banco:
      // atualiza a URL da imagem (pode mudar entre builds) e remove itens
      // que entre o redirecionamento já foram comprados por outra pessoa.
      const availableIds = new Set(mappedGifts.map((g) => g.id));
      setCart((prevCart) => {
        const reconciledCart = prevCart
          .filter((item) => availableIds.has(item.gift.id))
          .map((item) => {
            const fresh = mappedGifts.find((g) => g.id === item.gift.id);
            return fresh ? { gift: fresh } : item;
          });
        saveCart(reconciledCart);
        return reconciledCart;
      });

      setGifts(mappedGifts);
      setCategories(uniqueCategories);
      setLoading(false);
    }

    fetchGifts();
  }, []);

  // ── Persiste o carrinho no sessionStorage a cada mudança ──────────────────
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  // ── Ações do carrinho ─────────────────────────────────────────────────────
  const addToCart = useCallback((gift: Gift) => {
    setCart((prev) => {
      if (prev.some((item) => item.gift.id === gift.id)) return prev;
      return [...prev, { gift }];
    });
  }, []);

  const removeFromCart = useCallback((giftId: string) => {
    setCart((prev) => prev.filter((item) => item.gift.id !== giftId));
  }, []);

  // ── Confirma compra ───────────────────────────────────────────────────────
  const completePurchase = useCallback(async () => {
    const purchasedIds = cart.map((item) => item.gift.id);

    setGifts((prev) => prev.filter((g) => !purchasedIds.includes(g.id)));
    setCart([]);
    sessionStorage.removeItem(CART_STORAGE_KEY);

    const { error: sbError } = await supabase
      .from("gifts")
      .update({ available: false })
      .in("id", purchasedIds);

    if (sbError) {
      console.error(
        "Aviso: não foi possível marcar presentes como comprados:",
        sbError.message,
      );
    }
  }, [cart]);

  const cartTotal = cart.reduce((sum, item) => sum + item.gift.price, 0);

  return (
    <StoreContext.Provider
      value={{
        gifts,
        categories,
        cart,
        selectedCategory,
        showCategories,
        loading,
        error,
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
