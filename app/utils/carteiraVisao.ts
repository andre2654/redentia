/**
 * As contas pequenas da /carteira nova (06/11/2026): o número brasileiro, a
 * data de quando cada fonte atualizou, a cobertura da vida. Puras, com teste.
 */
import type { AvisosVisao, CarteiraVisao, GravidadeAviso, PosicaoVisao, RendaVisao } from '~/types/carteiraVisao'

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const brl0 = (v: number) => `R$ ${nf0.format(Math.round(v))}`
export const brl2 = (v: number) => `R$ ${nf2.format(v)}`
/** 'R$ 204 mil' para valores grandes; 'R$ 9.800' abaixo de 10 mil. (O nome não é brlCurto: esse é o
 * das calculadoras, em calculadora-frase.ts, que diz 'mi' nos milhões; com dois brlCurto o auto-import
 * pegava este e as calculadoras mostravam 'R$ 11.390 mil'.) */
export function brlMil(v: number): string {
  if (Math.abs(v) >= 10_000) return `R$ ${nf0.format(Math.round(v / 1000))} mil`
  return brl0(v)
}
/** 37,3 → '37%'; abaixo de 10, uma casa ('6,0%' vira '6%') */
export function pctTxt(p: number): string {
  if (p > 0 && p < 1) return 'menos de 1%'
  if (p < 10) {
    const s = nf1.format(p)
    return `${s.endsWith(',0') ? s.slice(0, -2) : s}%`
  }
  return `${nf0.format(Math.round(p))}%`
}

/** 'hoje, 9h12' · 'ontem, 18h40' · '16/07' */
export function quandoAtualizou(iso: string, agora = new Date()): string {
  const d = new Date(iso)
  const dia = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const dias = Math.round((dia(agora) - dia(d)) / 86_400_000)
  const hora = `${d.getHours()}h${String(d.getMinutes()).padStart(2, '0')}`
  if (dias === 0) return `hoje, ${hora}`
  if (dias === 1) return `ontem, ${hora}`
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** quanto da vida a renda que caiu na conta paga (0-100), ou null sem gasto (ou sem a renda) */
export function cobertura(r: RendaVisao | null): number | null {
  if (!r?.gastoMedio) return null
  return (r.caiu / r.gastoMedio) * 100
}

const PESO: Record<GravidadeAviso, number> = { alta: 0, media: 1, info: 2, bom: 3 }
/** os avisos em grupos: pede atenção (alta, média) e bom saber (info, bom) */
export function gruposDeAvisos(a: AvisosVisao, resolvidos: Set<string>) {
  const vivos = a.itens.filter((x) => !resolvidos.has(x.id)).sort((x, y) => PESO[x.gravidade] - PESO[y.gravidade])
  return {
    atencao: vivos.filter((x) => x.gravidade === 'alta' || x.gravidade === 'media'),
    saber: vivos.filter((x) => x.gravidade === 'info' || x.gravidade === 'bom'),
    resolvidos: a.itens.filter((x) => resolvidos.has(x.id)),
  }
}

/** o título do modal: '2 pedem atenção e 3 são bom saber' · 'Tudo normal. Sigo de olho.' */
export function tituloDosAvisos(atencao: number, saber: number): string {
  if (!atencao && !saber) return 'Tudo normal. Sigo de olho.'
  if (!atencao) return saber === 1 ? 'Tudo normal. Uma coisa boa de saber.' : `Tudo normal. ${saber} coisas boas de saber.`
  return atencao === 1 ? 'Uma coisa pede a sua atenção.' : `${atencao} coisas pedem a sua atenção.`
}

/**
 * Os avisos do dia saem quando a bolsa abre (10/11/2026, o dono: "libere os
 * avisos só quando a bolsa abrir"). Em dia de pregão, antes das 10h, a conta
 * do motor ainda é a de ontem: o topo mostra o esqueleto no lugar da resposta.
 * Em dia sem pregão a bolsa não abre, e os avisos seguem à mostra.
 */
export function avisosLiberados(estado: 'aberta' | 'fechada' | 'antes' | 'sem-pregao'): boolean {
  return estado !== 'antes'
}

/**
 * O que os avisos retidos esperam, numa frase: o preço do último pregão, a
 * conexão, ou os dois. Era "Outros 1 avisos esperam a conexão voltar. Com dado
 * de , eu prefiro não arriscar.", sempre culpando a conexão. Sem `por` (resposta
 * antiga), vale a conexão. '' sem retidos.
 */
export function textoDosRetidos(retidos: number, por?: { precos: number; conexao: number } | null, dadosDe?: string | null): string {
  if (!retidos) return ''
  const quantos = retidos === 1 ? 'Mais 1 aviso' : `Mais ${retidos} avisos`
  const precos = por?.precos ?? 0
  const conexao = por ? por.conexao : retidos
  if (precos && !conexao) return `${quantos} a caminho: falta chegar o preço do último pregão para eu fechar a conta.`
  if (precos && conexao) return `${quantos} a caminho: faltam a conexão atualizar e o preço do último pregão chegar.`
  return `${quantos} a caminho: ${retidos === 1 ? 'espera' : 'esperam'} a conexão atualizar${dadosDe ? ` (o dado é de ${dadosDe})` : ''}.`
}

/**
 * O nome sem o complemento que o backend põe depois do ' · ' ('Tesouro IPCA+
 * 2050 · IPCA + 6,97%' → 'Tesouro IPCA+ 2050'): para frase e lista curta. A
 * lista de Ativos mostra o nome inteiro, com a taxa.
 */
export function nomeCurto(nome: string): string {
  return nome.split(' · ')[0]!.trim() || nome
}

/** como a posição entra numa frase: o título do Tesouro pelo nome curto, o resto pelo ticker */
export function rotuloDaPosicao(p: Pick<PosicaoVisao, 'ticker' | 'nome' | 'classe'>): string {
  return p.classe === 'TREASURY' && p.nome ? nomeCurto(p.nome) : p.ticker
}

/**
 * Renda fixa pelo que o ativo É, não pelo invólucro (07/11, revisão do dono):
 * o AUPO11 é um ETF, mas rende o CDI, e para quem investe é caixa. Tesouro, CDB
 * e o ETF que mora no fator Selic ou juros (LFT, IPCA+) contam como renda fixa,
 * o mesmo critério do imposto (o backend põe esses ETFs no grupo `rf`) e do
 * "No mundo". O FII com fator juros continua FII.
 */
const FATOR_DE_RENDA_FIXA = new Set(['selic', 'juros'])
export function ehRendaFixa(p: Pick<PosicaoVisao, 'classe' | 'fator'>): boolean {
  if (p.classe === 'TREASURY' || p.classe === 'FIXED_INCOME') return true
  return p.classe === 'ETF' && FATOR_DE_RENDA_FIXA.has(p.fator)
}

/** o grupo da lente Ativos: 'RF' para a renda fixa (inclusive o ETF de CDI), senão a classe */
export function grupoDaPosicao(p: Pick<PosicaoVisao, 'classe' | 'fator'>): string {
  return ehRendaFixa(p) ? 'RF' : p.classe
}

/** os grupos da lente Ativos: o nome no título e o nome dentro da frase */
export const GRUPOS_DA_CARTEIRA: Record<string, { nome: string; naFrase: string; cor: string }> = {
  RF: { nome: 'Renda fixa', naFrase: 'renda fixa', cor: 'var(--nu-alloc-fixed)' },
  STOCK: { nome: 'Ações', naFrase: 'ações', cor: 'var(--nu-alloc-stock)' },
  REIT: { nome: 'FIIs', naFrase: 'FIIs', cor: 'var(--nu-alloc-fii)' },
  ETF: { nome: 'ETFs', naFrase: 'ETFs', cor: 'var(--nu-class-etf)' },
  BDR: { nome: 'BDRs', naFrase: 'BDRs', cor: 'var(--nu-class-etf)' },
  CRYPTO: { nome: 'Cripto', naFrase: 'cripto', cor: 'var(--nu-gray)' },
}

/** 'a', 'a e b', 'a, b e c' */
function juntar(partes: string[]): string {
  return partes.length <= 1 ? (partes[0] ?? '') : `${partes.slice(0, -1).join(', ')} e ${partes[partes.length - 1]}`
}

/**
 * A frase grande da lente Ativos. Peso demais num ativo só é o que a pessoa
 * precisa ver primeiro, mas só na renda variável: um terço num fundo de CDI é
 * caixa, não risco (a revisão do dono achou "um terço num só: o AUPO11"
 * estranho, e o relatório dizia "maior posição: 4,6%" ao mesmo tempo). Sem
 * concentração, a frase diz como o dinheiro se divide, pelas maiores classes.
 */
export function fraseDosAtivos(posicoes: Pick<PosicaoVisao, 'ticker' | 'nome' | 'classe' | 'fator' | 'valor'>[], patrimonio: number): string {
  const n = posicoes.length
  if (!n || patrimonio <= 0) return ''
  const maiorRv = [...posicoes].filter((p) => !ehRendaFixa(p)).sort((a, b) => b.valor - a.valor)[0]
  const pm = maiorRv ? (maiorRv.valor / patrimonio) * 100 : 0
  if (maiorRv && pm >= 25) return `${n} ativos, e ${pm >= 30 && pm < 37 ? 'um terço' : pctTxt(pm)} num só: o ${rotuloDaPosicao(maiorRv)}.`
  const porGrupo = new Map<string, number>()
  for (const p of posicoes) porGrupo.set(grupoDaPosicao(p), (porGrupo.get(grupoDaPosicao(p)) ?? 0) + p.valor)
  const partes = [...porGrupo.entries()]
    .sort((a, b) => b[1] - a[1])
    .filter(([, v]) => (v / patrimonio) * 100 >= 5)
    .slice(0, 3)
    .map(([g, v]) => `${pctTxt((v / patrimonio) * 100)} em ${GRUPOS_DA_CARTEIRA[g]?.naFrase ?? g.toLowerCase()}`)
  return partes.length ? `${n} ativos: ${juntar(partes)}.` : `${n} ativos.`
}

/** 'caiu R$ 6.645' sem quebrar a linha entre o R$ e o número (o texto do backend vem com espaço comum) */
export function semQuebraNoReal(t: string): string {
  return t.replace(/R\$ (?=[\d•])/g, 'R$\u00a0')
}

/** a soma das posições bate com o patrimônio (a regra que o backend garante) */
export function confereComOTopo(v: CarteiraVisao): boolean {
  const soma = v.posicoes.reduce((s, p) => s + p.valor, 0)
  return Math.abs(soma - v.patrimonio) < 0.5
}

/** a flag do servidor (`carteira.visao_usuarios`) deixou a pessoa de fora: 404 `{ error: 'visao_desligada' }` */
export function visaoDesligada(status: number | undefined, corpo: unknown): boolean {
  return status === 404 && (corpo as { error?: unknown } | null | undefined)?.error === 'visao_desligada'
}

/* ————— a marca nos textos da API (11/11/2026) —————
 * Os avisos, as ideias, o "Como calculei" e as notas chegam prontos do backend,
 * que serve também o app (ainda Redentia): lá o texto não muda. No site, a
 * resposta passa por aqui UMA vez, no ponto em que vira estado da tela
 * (useCarteiraVisao, useCarteiraRelatorio, useCarteiraFuturo), e todo texto
 * sai com a marca do site ("Simulação da Aportou", "tese da Aportou",
 * "Aportou Score"). Só exibição: nenhum número, chave ou conta muda.
 * A troca do nome em si é o `marcaNoTexto` (utils/marcaNoTexto.ts), que quem
 * chama passa como `marca`: este arquivo segue sem importar nada. */

/** a troca do nome num texto: o `marcaNoTexto` */
type Marca = (texto: string) => string

/** o que identifica e não se lê: o valor fica como veio (o PATCH do "Já sei" usa o `id`; o tópico dos canais, o `detector`) */
const NAO_E_TEXTO = new Set(['id', 'detector', 'chave', 'ticker', 'tickers', 'slug', 'url', 'href', 'link', 'logo'])
/** endereço, âncora, rota, e-mail ou alvo de lente (o `alvo` da ação "ver"): não é frase */
const ENDERECO = /^(?:https?:\/\/|mailto:|\/|#|lente:)/i
/** o botão da IA no site diz "Perguntar à IA" (docs/aportou/decisoes.md), não "Perguntar à Aportou" */
const PERGUNTAR = /(?<![\w-])Perguntar à Redentia(?: AI)?(?![\w@-]|\.[A-Za-z]|\s+(?:For\s+)?Business)/g

/** um texto da API com a marca do site */
export function textoComMarca(t: string, marca: Marca): string {
  if (!t.includes('edentia') && !t.includes('EDENTIA')) return t
  if (ENDERECO.test(t)) return t
  return marca(t.replace(PERGUNTAR, 'Perguntar à IA'))
}

/**
 * Percorre a resposta e devolve outra igual, com a marca do site em todo valor
 * de TEXTO. Não toca em chave, número, booleano, null, lista de números (as
 * séries e os caminhos passam direto), endereço, nem no valor das chaves de
 * NAO_E_TEXTO. Código em minúsculas ('redentia_score', '/ranking/redentia-score')
 * o marcaNoTexto já não troca.
 * Não muda o que recebeu: o trecho sem troca volta o MESMO objeto.
 */
export function marcaNaResposta<T>(valor: T, marca: Marca): T {
  return percorrer(valor, null, marca) as T
}
function percorrer(v: unknown, chave: string | null, marca: Marca): unknown {
  if (typeof v === 'string') return chave && NAO_E_TEXTO.has(chave) ? v : textoComMarca(v, marca)
  if (v === null || typeof v !== 'object') return v
  if (chave && NAO_E_TEXTO.has(chave)) return v
  if (Array.isArray(v)) {
    // série, caminho, lista de pesos: nada a ler
    if (typeof v[0] === 'number') return v
    let mudou = false
    const saida = v.map((x) => {
      const y = percorrer(x, chave, marca)
      if (y !== x) mudou = true
      return y
    })
    return mudou ? saida : v
  }
  // só objeto simples (o JSON da resposta): Date, Map e afins passam como vieram
  const proto = Object.getPrototypeOf(v)
  if (proto !== Object.prototype && proto !== null) return v
  let saida: Record<string, unknown> | null = null
  for (const [k, x] of Object.entries(v as Record<string, unknown>)) {
    const y = percorrer(x, k, marca)
    if (y !== x) (saida ??= { ...(v as Record<string, unknown>) })[k] = y
  }
  return saida ?? v
}
