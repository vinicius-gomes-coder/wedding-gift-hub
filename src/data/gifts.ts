// ─── Tipos ────────────────────────────────────────────────────────────────────
// As categorias agora são derivadas dinamicamente do banco.
// O tipo Category aceita qualquer string para não engessar caso novas
// categorias sejam adicionadas no Supabase sem alterar o código.
export type Category = string;

export interface Gift {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string; // URL resolvida pelo mapa abaixo (import do asset)
}

// ─── Mapa de imagens ──────────────────────────────────────────────────────────
// O Vite só resolve imports estáticos em tempo de build.
// Por isso mantemos aqui os imports e fazemos o mapeamento
// filename (string do banco) → URL do asset resolvida.
import jogojantar1      from "@/assets/jogo-jantar-1.jpeg";
import jogojantar2      from "@/assets/jogo-jantar-2.jpeg";
import talher           from "@/assets/conjunto-talher.jpeg";
import tacasobremesa    from "@/assets/conjunto-taça-sobremesa.jpeg";
import mesaposta        from "@/assets/conjunto-mesa-posta.jpeg";
import hermetico1       from "@/assets/potes-hermeticos-1.jpeg";
import hermetico2       from "@/assets/potes-hermeticos-2.jpeg";
import copos            from "@/assets/kit-copos.jpeg";
import panificadora     from "@/assets/panificadora.jpeg";
import toalhamesa       from "@/assets/toalha-mesa.jpeg";
import passadeira       from "@/assets/tapete-passadeira.jpeg";
import caminhomesa      from "@/assets/caminho-mesa.jpeg";
import jogobanho        from "@/assets/jogo-banho.jpeg";
import jogolencol1      from "@/assets/jogo-lencol-1.jpeg";
import jogolencol2      from "@/assets/jogo-lencol-2.jpeg";
import kitcamacompleto  from "@/assets/kit-cama-completo.jpeg";
import kitferramenta    from "@/assets/kit-ferramenta.jpeg";
import furadeira        from "@/assets/furadeira.jpeg";
import kitfacas         from "@/assets/kit-facas.jpeg";
import kitpanelas       from "@/assets/kit-panelas-ceramica.jpeg";
import geladeira        from "@/assets/geladeira.jpeg";
import roboaspirador    from "@/assets/robo-aspirador.jpeg";
import panelapressao    from "@/assets/panela-pressao.png";
import capamaquina      from "@/assets/capa-maquina.jpeg";
import varal            from "@/assets/varal-chao.jpeg";
import batedeira        from "@/assets/batedeira.jpeg";

// Mapa: nome do arquivo (igual ao salvo no banco) → URL resolvida pelo Vite
export const IMAGE_MAP: Record<string, string> = {
  "jogo-jantar-1.jpeg":         jogojantar1,
  "jogo-jantar-2.jpeg":         jogojantar2,
  "conjunto-talher.jpeg":       talher,
  "conjunto-taça-sobremesa.jpeg": tacasobremesa,
  "conjunto-mesa-posta.jpeg":   mesaposta,
  "potes-hermeticos-1.jpeg":    hermetico1,
  "potes-hermeticos-2.jpeg":    hermetico2,
  "kit-copos.jpeg":             copos,
  "panificadora.jpeg":          panificadora,
  "toalha-mesa.jpeg":           toalhamesa,
  "tapete-passadeira.jpeg":     passadeira,
  "caminho-mesa.jpeg":          caminhomesa,
  "jogo-banho.jpeg":            jogobanho,
  "jogo-lencol-1.jpeg":         jogolencol1,
  "jogo-lencol-2.jpeg":         jogolencol2,
  "kit-cama-completo.jpeg":     kitcamacompleto,
  "kit-ferramenta.jpeg":        kitferramenta,
  "furadeira.jpeg":             furadeira,
  "kit-facas.jpeg":             kitfacas,
  "kit-panelas-ceramica.jpeg":  kitpanelas,
  "geladeira.jpeg":             geladeira,
  "robo-aspirador.jpeg":        roboaspirador,
  "panela-pressao.png":         panelapressao,
  "capa-maquina.jpeg":          capamaquina,
  "varal-chao.jpeg":            varal,
  "batedeira.jpeg":             batedeira,
};

// Retorna a URL do asset a partir do nome do arquivo salvo no banco.
// Se o arquivo não for encontrado, retorna uma string vazia (evita crash).
export function resolveImage(filename: string): string {
  return IMAGE_MAP[filename] ?? "";
}