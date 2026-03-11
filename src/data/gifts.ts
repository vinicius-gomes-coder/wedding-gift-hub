import dinnerware from "@/assets/gift-dinnerware.jpg";
import coffeemaker from "@/assets/gift-coffeemaker.jpg";
import bedding from "@/assets/gift-bedding.jpg";
import vacuum from "@/assets/gift-vacuum.jpg";
import wineglasses from "@/assets/gift-wineglasses.jpg";
import towels from "@/assets/gift-towels.jpg";
import speaker from "@/assets/gift-speaker.jpg";
import cookware from "@/assets/gift-cookware.jpg";

export type Category = "Casa" | "Eletrônicos" | "Cozinha" | "Quarto & Banho";

export interface Gift {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
}

export const CATEGORIES: Category[] = ["Casa", "Eletrônicos", "Cozinha", "Quarto & Banho"];

export const initialGifts: Gift[] = [
  {
    id: "1",
    name: "Aparelho de Jantar em Porcelana",
    description: "Conjunto completo com 42 peças em porcelana branca.",
    price: 890,
    category: "Cozinha",
    image: dinnerware,
  },
  {
    id: "2",
    name: "Cafeteira Expresso",
    description: "Máquina de café expresso automática com moedor integrado.",
    price: 1250,
    category: "Eletrônicos",
    image: coffeemaker,
  },
  {
    id: "3",
    name: "Jogo de Cama em Linho",
    description: "Conjunto king size em linho egípcio, 400 fios.",
    price: 1480,
    category: "Quarto & Banho",
    image: bedding,
  },
  {
    id: "4",
    name: "Aspirador Robô",
    description: "Robô aspirador com mapeamento inteligente e controle por aplicativo.",
    price: 2200,
    category: "Eletrônicos",
    image: vacuum,
  },
  {
    id: "5",
    name: "Taças de Cristal",
    description: "Par de taças para vinho em cristal artesanal boêmio.",
    price: 420,
    category: "Casa",
    image: wineglasses,
  },
  {
    id: "6",
    name: "Jogo de Toalhas",
    description: "Conjunto de banho em algodão egípcio, 6 peças.",
    price: 380,
    category: "Quarto & Banho",
    image: towels,
  },
  {
    id: "7",
    name: "Caixa de Som Portátil",
    description: "Alto-falante sem fio com som de alta fidelidade.",
    price: 650,
    category: "Eletrônicos",
    image: speaker,
  },
  {
    id: "8",
    name: "Jogo de Panelas Inox",
    description: "Conjunto de 5 panelas em aço inoxidável tripla camada.",
    price: 1100,
    category: "Cozinha",
    image: cookware,
  },
];
