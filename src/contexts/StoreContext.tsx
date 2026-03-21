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
  image: string; // nome do arquivo, ex: "jogo-jantar-1.jpeg"
  available: boolean;
  sort_order: number;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
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
        .eq("available", true) // traz apenas os disponíveis
        .order("sort_order", { ascending: true });

      if (sbError) {
        console.error("Erro ao buscar presentes:", sbError.message);
        setError("Não foi possível carregar os presentes. Tente novamente.");
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as GiftRow[];

      // Converte cada row: resolve o filename do banco para a URL do asset local
      const mappedGifts: Gift[] = rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        price: Number(row.price),
        category: row.category,
        image: resolveImage(row.image),
      }));

      // Categorias únicas na ordem em que aparecem (mantém a ordenação do banco)
      const uniqueCategories: Category[] = [];
      for (const g of mappedGifts) {
        if (!uniqueCategories.includes(g.category)) {
          uniqueCategories.push(g.category);
        }
      }

      setGifts(mappedGifts);
      setCategories(uniqueCategories);
      setLoading(false);
    }

    fetchGifts();
  }, []);

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

  // ── Confirma compra: remove do estado local + marca como unavailable no banco
  const completePurchase = useCallback(async () => {
    const purchasedIds = cart.map((item) => item.gift.id);

    // Otimista: atualiza UI imediatamente
    setGifts((prev) => prev.filter((g) => !purchasedIds.includes(g.id)));
    setCart([]);

    // Persiste no banco (best-effort — não bloqueia o usuário se falhar)
    const { error: sbError } = await supabase
      .from("gifts")
      .update({ available: false })
      .in("id", purchasedIds);

    if (sbError) {
      console.error(
        "Aviso: não foi possível marcar os presentes como comprados no banco:",
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
