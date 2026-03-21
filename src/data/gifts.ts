import jogojantar1 from "@/assets/jogo-jantar-1.jpeg";
import jogojantar2 from "@/assets/jogo-jantar-2.jpeg";
import talher from "@/assets/conjunto-talher.jpeg";
import tacasobremesa from "@/assets/conjunto-taça-sobremesa.jpeg";
import mesaposta from "@/assets/conjunto-mesa-posta.jpeg";
import hermetico1 from "@/assets/potes-hermeticos-1.jpeg";
import hermetico2 from "@/assets/potes-hermeticos-2.jpeg";
import copos from "@/assets/kit-copos.jpeg";
import panificadora from "@/assets/panificadora.jpeg";
import toalhamesa from "@/assets/toalha-mesa.jpeg";
import passadeira from "@/assets/tapete-passadeira.jpeg";
import caminhomesa from "@/assets/caminho-mesa.jpeg";
import jogobanho from "@/assets/jogo-banho.jpeg";
import jogolencol1 from "@/assets/jogo-lencol-1.jpeg";
import jogolencol2 from "@/assets/jogo-lencol-2.jpeg";
import kitcamacompleto from "@/assets/kit-cama-completo.jpeg";
import kitferramenta from "@/assets/kit-ferramenta.jpeg";
import furadeira from "@/assets/furadeira.jpeg";
import kitfacas from "@/assets/kit-facas.jpeg";
import kitpanelasceramica from "@/assets/kit-panelas-ceramica.jpeg";
import geladeira from "@/assets/geladeira.jpeg";
import roboaspirador from "@/assets/robo-aspirador.jpeg";
import panelapressao from "@/assets/panela-pressao.png";
import capamaquina from "@/assets/capa-maquina.jpeg";
import varal from "@/assets/varal-chao.jpeg";
import batedeira from "@/assets/batedeira.jpeg";

export type Category = "Casa" | "Eletrônicos & Eletrodomésticos" | "Cozinha" | "Quarto & Banho" | "Ferramentas";

export interface Gift {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
}

export const CATEGORIES: Category[] = ["Casa", "Eletrônicos & Eletrodomésticos", "Cozinha", "Quarto & Banho", "Ferramentas"];

export const initialGifts: Gift[] = [
  {
    id: "0",
    name: "Presente Teste",
    description: "Presente de teste",
    price: 0.01,
    category: "Cozinha",
    image: jogojantar1,
  },
  {
    id: "1",
    name: "Jogo de Jantar ",
    description: "Conjunto completo com 30 peças em porcelana branca.",
    price: 490,
    category: "Cozinha",
    image: jogojantar1,
  },
  {
    id: "2",
    name: "Aparelho de Jantar 20 Peças ",
    description: "Conjunto completo com 20 peças estampadas.",
    price: 299.90,
    category: "Cozinha",
    image: jogojantar2,
  },
  {
    id: "3",
    name: "Conjunto de Talheres de Aço Inox",
    description: "Conjunto em aço inoxidavel com 42 peças.",
    price: 199.90,
    category: "Cozinha",
    image: talher,
  },
  {
    id: "4",
    name: "Conjunto de Taças de Sobremesa",
    description: "Conjunto de 6 taças para sobremesa em vidro temperado.",
    price: 79.90,
    category: "Cozinha",
    image: tacasobremesa,
  },
  {
    id: "5",
    name: "Conjunto Mesa Posta",
    description: "Conjunto em vidro com 6 peças para mesa posta elegante.",
    price: 349,
    category: "Cozinha",
    image: mesaposta,
  },
  {
    id: "6",
    name: "Kit Potes Herméticos Para Condimentos",
    description: "Conjunto de potes herméticos em bambu.",
    price: 199,
    category: "Cozinha",
    image: hermetico1,
  },
  {
    id: "7",
    name: "Kit Potes Hermeticos",
    description: "Conjunto de potes herméticos em vidro.",
    price: 199,
    category: "Cozinha",
    image: hermetico2,
  },
  {
    id: "8",
    name: "Kit Copos",
    description: "Conjunto de copos em vidro.",
    price: 69.90,
    category: "Cozinha",
    image: copos,
  },
  {
    id: "9",
    name: "Panificadora Automática",
    description: "Máquina automática para preparo de pães e massas.",
    price: 490,
    category: "Eletrônicos & Eletrodomésticos",
    image: panificadora,
  },
  {
    id: "10",
    name: "Toalha de Mesa Bordada",
    description: "Toalha bordada para mesa na cor creme.",
    price: 99.90 ,
    category: "Casa",
    image: toalhamesa,
  },
  {
    id: "11",
    name: "Tapete Passadeira",
    description: "Tapete passadeira na cor marrom e creme.",
    price: 99.90 ,
    category: "Casa",
    image: passadeira,
  },
  {
    id: "12",
    name: "Caminho de Mesa Bordado",
    description: "Caminho de mesa bordado na cor creme.",
    price: 79.90 ,
    category: "Casa",
    image: caminhomesa,
  },
  {
    id: "13",
    name: "Jogo de Toalhas",
    description: "Conjunto de 4 toalhas para banho",
    price: 249.90 ,
    category: "Quarto & Banho",
    image: jogobanho,
  },
  {
    id: "14",
    name: "Jogo de Lençol Queen Azul Estampado",
    description: "Conjunto de lençóis com 4 itens para cama queen.",
    price: 299.90 ,
    category: "Quarto & Banho",
    image: jogolencol1,
  },
  {
    id: "15",
    name: "Jogo de Lençol Queen Cinza e Branco Estampado",
    description: "Conjunto de lençóis com 4 itens para cama queen.",
    price: 299.90 ,
    category: "Quarto & Banho",
    image: jogolencol2,
  },
  {
    id: "16",
    name: "Kit Completo Cama Queen",
    description: "Conjunto completo 9 peças (kit cobre leito, edredom e jogo de lençol 180 fios em algodão) para cama queen.",
    price: 499.90 ,
    category: "Quarto & Banho",
    image: kitcamacompleto,
  },
  {
    id: "17",
    name: "Jogo de Ferramentas Completo 169 Peças",
    description: "Conjunto de ferramentas com parafusadeira para uso doméstico.",
    price: 249.90 ,
    category: "Ferramentas",
    image: kitferramenta,
  },
  {
    id: "18",
    name: "Furadeira de Impacto",
    description: "Furadeira de impacto para uso doméstico.",
    price: 249.90 ,
    category: "Ferramentas",
    image: furadeira,
  },
  {
    id: "19",
    name: "Conjunto de Facas",
    description: "Conjunto de 5 facas para cozinha.",
    price: 89.90 ,
    category: "Cozinha",
    image: kitfacas,
  },
  {
    id: "20",
    name: "Conjunto de Panelas Ceramica",
    description: "Conjunto de panelas revestidas em cerâmica para cozinha.",
    price: 599.90 ,
    category: "Cozinha",
    image: kitpanelasceramica,
  },
  {
    id: "21",
    name: "Geladeira 2 Portas Inox",
    description: "Geladeira com 2 portas em aço inox.",
    price: 5499.90 ,
    category: "Eletrônicos & Eletrodomésticos",
    image: geladeira,
  },
  {
    id: "22",
    name: "Robô Aspirador Inteligente",
    description: "Robô aspirador 4 em 1 que varre, aspira e passa pano umido ou seco.",
    price: 1499.90 ,
    category: "Eletrônicos & Eletrodomésticos",
    image: roboaspirador,
  },
  {
    id: "23",
    name: "Panela de Pressão Ceramica",
    description: "Panela de pressão revestida em cerâmica para cozinha.",
    price: 239.90 ,
    category: "Cozinha",
    image: panelapressao,
  },
  {
    id: "24",
    name: "Capa para Maquina de Lavar",
    description: "Capa impermeável com zíper, para máquina de lavar em tecido resistente.",
    price: 39.90 ,
    category: "Casa",
    image: capamaquina,
  },
  {
    id: "25",
    name: "Varal de Chão Dobrável",
    description: "Varal de chão dobrável para uso doméstico.",
    price: 99.90 ,
    category: "Casa",
    image: varal,
  },
  {
    id: "26",
    name: "Batedeira",
    description: "Batedeira elétrica, 3 velocidades.",
    price: 89.90 ,
    category: "Eletrônicos & Eletrodomésticos",
    image: batedeira,
  },
];
