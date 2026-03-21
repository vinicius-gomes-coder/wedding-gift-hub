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
import jogotoalhas      from "@/assets/jogo-toalhas.jpeg";
import coberdrom        from "@/assets/coberdrom.jpeg";
import espelho          from "@/assets/espelho.jpeg";
import spraydesamassar  from "@/assets/spray-desamassar.jpeg";
import escorredor       from "@/assets/escorredor.jpeg";
import grill            from "@/assets/grill.jpeg";
import portaazeite      from "@/assets/porta-azeite.jpeg";
import tapetebanheiro   from "@/assets/tapete-banheiro.jpeg";
import suporteovos      from "@/assets/suporte-ovos.jpeg";
import toalhasbanho     from "@/assets/toalhas-banho.jpeg";
import aparelhojantar   from "@/assets/aparelho-jantar.jpeg";
import organizadoresgeladeira    from "@/assets/organizadores-geladeira.jpeg";
import chaleiraeletrica from "@/assets/chaleira-eletrica.jpeg";
import lixeirainteligente from "@/assets/lixeira-inteligente.jpeg";
import portapao         from "@/assets/porta-pao.jpeg";
import boleira          from "@/assets/boleira.jpeg";
import mantaqueen       from "@/assets/manta-queen.jpeg";
import varalchaoandar   from "@/assets/varal-chao-andar.jpeg";
import cacarola         from "@/assets/cacarola.jpeg";
import hermetico3       from "@/assets/potes-hermeticos-3.jpeg";
import edredomqeen      from "@/assets/edredom-queen.jpeg";
import tabuacorte       from "@/assets/tabua-corte.jpeg";
import tacasvidro       from "@/assets/tacas-vidro.jpeg";
import dispenser        from "@/assets/dispenser-lavanderia.jpeg";
import impressora       from "@/assets/impressora-etiqueta.jpeg";
import hermeticos4      from "@/assets/potes-hermeticos-4.jpeg";
import tacassobremesa   from "@/assets/tacas-sobremesa.jpeg";
import travessavidro    from "@/assets/travessa-vidro.jpeg";
import tapetezigzag     from "@/assets/tapete-zigzag.jpeg";
import organizadores    from "@/assets/organizadores.jpeg";
import raqueteeletrica  from "@/assets/raquete-eletrica.jpeg";
import panelaarrozeletrica from "@/assets/panela-arroz-eletrica.jpeg";
import tabuapassar      from "@/assets/tabua-passar-roupa.jpeg";

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
  "jogo-toalhas.jpeg":          jogotoalhas,
  "coberdrom.jpeg":             coberdrom,
  "espelho.jpeg":               espelho,
  "spray-desamassar.jpeg":      spraydesamassar,
  "escorredor.jpeg":            escorredor,
  "grill.jpeg":                 grill,
  "porta-azeite.jpeg":          portaazeite,
  "tapete-banheiro.jpeg":       tapetebanheiro,
  "suporte-ovos.jpeg":          suporteovos,
  "toalhas-banho.jpeg":         toalhasbanho,
  "aparelho-jantar.jpeg":       aparelhojantar,
  "organizadores-geladeira.jpeg": organizadoresgeladeira,
  "chaleira-eletrica.jpeg":      chaleiraeletrica,
  "lixeira-inteligente.jpeg":   lixeirainteligente,
  "porta-pao.jpeg":             portapao,
  "boleira.jpeg":              boleira,
  "manta-queen.jpeg":          mantaqueen,
  "varal-chao-andar.jpeg":      varalchaoandar,
  "cacarola.jpeg":             cacarola,
  "potes-hermeticos-3.jpeg":    hermetico3,
  "edredom-queen.jpeg":        edredomqeen,
  "tabua-corte.jpeg":          tabuacorte,
  "tacas-vidro.jpeg":          tacasvidro,
  "dispenser-lavanderia.jpeg":   dispenser,
  "impressora-etiqueta.jpeg":    impressora,
  "potes-hermeticos-4.jpeg":    hermeticos4,
  "tacas-sobremesa.jpeg":      tacassobremesa,
  "travessa-vidro.jpeg":       travessavidro,
  "tapete-zigzag.jpeg":        tapetezigzag,
  "organizadores.jpeg":        organizadores,
  "raquete-eletrica.jpeg":     raqueteeletrica,
  "panela-arroz-eletrica.jpeg": panelaarrozeletrica,
  "tabua-passar-roupa.jpeg":         tabuapassar
};

// Retorna a URL do asset a partir do nome do arquivo salvo no banco.
// Se o arquivo não for encontrado, retorna uma string vazia (evita crash).
export function resolveImage(filename: string): string {
  return IMAGE_MAP[filename] ?? "";
}