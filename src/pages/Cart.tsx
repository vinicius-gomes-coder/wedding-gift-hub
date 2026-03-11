import { Link } from "react-router-dom";
import { useStore } from "@/contexts/StoreContext";
import { motion } from "framer-motion";

export default function Cart() {
  const { cart, removeFromCart, cartTotal } = useStore();

  return (
    <main className="min-h-screen pt-28 pb-20 px-8 md:px-16 lg:px-24">
      <div className="max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="font-display text-4xl md:text-5xl mb-16"
        >
          Carrinho
        </motion.h1>

        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="font-display text-2xl text-muted-foreground mb-8">
              Nenhum presente selecionado.
            </p>
            <Link
              to="/"
              className="font-body text-sm border border-primary text-primary px-6 py-3 hover:bg-primary hover:text-primary-foreground transition-all duration-500"
            >
              Ver presentes
            </Link>
          </motion.div>
        ) : (
          <div>
            {cart.map((item, i) => (
              <motion.div
                key={item.gift.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="flex items-center gap-6 py-8 border-b border-border"
              >
                <div className="w-20 h-20 md:w-28 md:h-28 flex-shrink-0 border border-border overflow-hidden">
                  <img
                    src={item.gift.image}
                    alt={item.gift.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg md:text-xl">{item.gift.name}</h3>
                  <p className="font-body text-sm text-muted-foreground mt-1">
                    R$ {item.gift.price.toLocaleString("pt-BR")}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.gift.id)}
                  className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors duration-500 flex-shrink-0"
                >
                  Remover
                </button>
              </motion.div>
            ))}

            <div className="mt-12 flex flex-col items-end gap-6">
              <div className="font-display text-2xl">
                Total: R$ {cartTotal.toLocaleString("pt-BR")}
              </div>
              <Link
                to="/checkout"
                className="font-body text-sm bg-primary text-primary-foreground px-8 py-3 hover:opacity-90 transition-opacity duration-500"
              >
                Finalizar Compra
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
