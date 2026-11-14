// Os apps da Redentia e onde baixar cada um: a fonte única do herói da home
// (os aparelhos com o selo no hover) e da linha dos aparelhos da chamada
// (HomeChamada). Conferido na API de busca do iTunes em 02/11/2026: só o app
// do iPhone está publicado (id 6823992050, "Redentia: a bolsa contada",
// 1.0, Brasil). O do Mac e o do relógio (que vem dentro do app do iPhone 1.1)
// seguem na revisão da Apple.
//
// Quando a Apple aprovar, é uma linha só: pôr a URL no `loja` do aparelho.
// O selo dele vira link ("Baixar na App Store") e a linha da chamada passa a
// contar o aparelho como disponível, sem mexer em componente nenhum.

export type AparelhoRedentia = 'iphone' | 'mac' | 'watch'

export interface AppRedentia {
  /** como o aparelho aparece na frase: "no iPhone", "no Mac", "no Apple Watch" */
  nome: string
  /** a página do app na App Store; null = ainda não está na loja */
  loja: string | null
}

export const APPS_REDENTIA: Record<AparelhoRedentia, AppRedentia> = {
  iphone: { nome: 'iPhone', loja: 'https://apps.apple.com/br/app/id6823992050' },
  mac: { nome: 'Mac', loja: null }, // em revisão na Apple (02/11/2026)
  watch: { nome: 'Apple Watch', loja: null }, // vem no app do iPhone 1.1, em revisão (02/11/2026)
}

const ORDEM: AparelhoRedentia[] = ['iphone', 'mac', 'watch']

/** "a, b e c" */
function juntar(partes: string[]): string {
  if (partes.length <= 1) return partes[0] ?? ''
  return `${partes.slice(0, -1).join(', ')} e ${partes[partes.length - 1]}`
}

/**
 * A linha dos aparelhos, sempre verdadeira: o que já dá para usar e o que vem.
 * Hoje: "No site e no iPhone. Em breve no Mac e no Apple Watch."
 */
export function fraseDosApps(apps: Record<AparelhoRedentia, AppRedentia> = APPS_REDENTIA): string {
  const noAr = ORDEM.filter((a) => apps[a].loja).map((a) => `no ${apps[a].nome}`)
  const embreve = ORDEM.filter((a) => !apps[a].loja).map((a) => `no ${apps[a].nome}`)
  const hoje = `${juntar(['No site', ...noAr])}.`
  return embreve.length ? `${hoje} Em breve ${juntar(embreve)}.` : hoje
}

/** o selo que aparece sobre o aparelho: link para a loja ou "Em breve no …" */
export function seloDoApp(aparelho: AparelhoRedentia, apps: Record<AparelhoRedentia, AppRedentia> = APPS_REDENTIA): { rotulo: string; url: string | null } {
  const app = apps[aparelho]
  return app.loja ? { rotulo: 'Baixar na App Store', url: app.loja } : { rotulo: `Em breve no ${app.nome}`, url: null }
}

/** só o que ainda não está na loja: "Em breve no Mac e no Apple Watch"; null quando tudo já saiu */
export function emBreveDosApps(apps: Record<AparelhoRedentia, AppRedentia> = APPS_REDENTIA): string | null {
  const embreve = ORDEM.filter((a) => !apps[a].loja).map((a) => `no ${apps[a].nome}`)
  return embreve.length ? `Em breve ${juntar(embreve)}` : null
}
