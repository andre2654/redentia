/**
 * O quiz do "Conectar carteira" (pedido do dono, 31/10/2026): em vez de o
 * topo do /assinar e do paywall dizer o preço, o botão abre seis perguntas
 * rápidas sobre como a pessoa investe, e só no fim aparece o que a Redentia
 * faz por ela e o preço de lançamento. É o funil de quiz dos apps de
 * assinatura (Noom, Babbel, Fastic), curto: seis perguntas, duas telas de
 * respiro, a montagem e o resultado.
 *
 * Regras da casa:
 *  - nada de suitability: o quiz não recomenda investimento nenhum, só diz
 *    o que a Redentia vai fazer com a carteira da pessoa (os avisos, os
 *    cenários, os proventos, a IA). Tudo o que o resultado promete existe;
 *  - o preço é "de lançamento", sem prazo nem contador (decisão do dono,
 *    31/10: escassez que não é real é propaganda enganosa, CDC art. 37);
 *  - as respostas ficam no navegador: viram só o resultado da tela e os
 *    eventos do quiz (sem as respostas em si).
 */

export type IdPergunta = 'investe' | 'bancos' | 'frequencia' | 'preocupa' | 'queda' | 'quer'

export interface Opcao {
  id: string
  t: string
  /** uma linha embaixo do título da opção */
  d?: string
  /** o desenho da opção (AssinaturaQuizIcone) */
  icone?: string
}

export interface Pergunta {
  id: IdPergunta
  titulo: string
  sub?: string
  multipla?: boolean
  /** 'bancos' mostra os logos das instituições em vez da lista */
  forma?: 'lista' | 'bancos' | 'grade'
  opcoes: Opcao[]
}

/** Os bancos da pergunta 2: os mesmos da carteira vazia. */
export const BANCOS_DO_QUIZ = ['nubank', 'itau', 'bradesco', 'bb', 'santander', 'inter', 'xp', 'btg', 'c6', 'rico'] as const

export const PERGUNTAS: Pergunta[] = [
  {
    id: 'investe',
    titulo: 'Você já investe?',
    forma: 'grade',
    opcoes: [
      { id: 'anos', t: 'Sim, há anos', icone: 'arvore' },
      { id: 'pouco', t: 'Comecei há pouco', icone: 'broto' },
      { id: 'nao', t: 'Ainda não, quero começar', icone: 'semente' },
    ],
  },
  {
    id: 'bancos',
    titulo: 'Onde estão os seus investimentos?',
    sub: 'Pode marcar mais de um.',
    multipla: true,
    forma: 'bancos',
    opcoes: [
      ...BANCOS_DO_QUIZ.map((slug) => ({ id: slug, t: slug })),
      { id: 'outro', t: 'Outro banco' },
      { id: 'nenhum', t: 'Ainda em nenhum' },
    ],
  },
  {
    id: 'frequencia',
    titulo: 'Com que frequência você olha a sua carteira?',
    opcoes: [
      { id: 'dia', t: 'Todo dia', icone: 'sol' },
      { id: 'semana', t: 'Uma vez por semana', icone: 'calendario' },
      { id: 'lembro', t: 'Só quando eu lembro', icone: 'nuvem' },
      { id: 'nunca', t: 'Quase nunca', icone: 'lua' },
    ],
  },
  {
    id: 'preocupa',
    titulo: 'O que mais te preocupa?',
    sub: 'Pode marcar mais de um.',
    multipla: true,
    opcoes: [
      { id: 'queda', t: 'Uma queda forte da bolsa', icone: 'queda' },
      { id: 'indo', t: 'Não saber se estou indo bem', icone: 'bussola' },
      { id: 'proventos', t: 'Perder a data de um provento', icone: 'moeda' },
      { id: 'espalhado', t: 'Dinheiro espalhado em vários bancos', icone: 'pecas' },
    ],
  },
  {
    id: 'queda',
    titulo: 'Se a bolsa caísse 20% amanhã, você saberia quanto a sua carteira perderia?',
    opcoes: [
      { id: 'sim', t: 'Sim, na hora', icone: 'certo' },
      { id: 'mais-ou-menos', t: 'Mais ou menos', icone: 'talvez' },
      { id: 'nao', t: 'Não faço ideia', icone: 'pergunta' },
    ],
  },
  {
    id: 'quer',
    titulo: 'O que você quer da sua carteira nos próximos anos?',
    opcoes: [
      { id: 'crescer', t: 'Que ela cresça', icone: 'sobe' },
      { id: 'renda', t: 'Uma renda todo mês', icone: 'moeda' },
      { id: 'proteger', t: 'Proteger o que eu tenho', icone: 'escudo' },
      { id: 'nao-sei', t: 'Ainda não sei', icone: 'bussola' },
    ],
  },
]

export type Respostas = Partial<Record<IdPergunta, string[]>>

/** Os passos do quiz, na ordem: as perguntas com os dois respiros no meio. */
export type Passo =
  | { tipo: 'pergunta'; pergunta: Pergunta }
  | { tipo: 'respiro'; id: 'avisos' | 'cenarios' }
  | { tipo: 'conta' }
  | { tipo: 'montando' }
  | { tipo: 'resultado' }

export const PASSOS: Passo[] = [
  { tipo: 'pergunta', pergunta: PERGUNTAS[0]! },
  { tipo: 'pergunta', pergunta: PERGUNTAS[1]! },
  { tipo: 'pergunta', pergunta: PERGUNTAS[2]! },
  { tipo: 'respiro', id: 'avisos' },
  { tipo: 'pergunta', pergunta: PERGUNTAS[3]! },
  { tipo: 'pergunta', pergunta: PERGUNTAS[4]! },
  { tipo: 'respiro', id: 'cenarios' },
  { tipo: 'pergunta', pergunta: PERGUNTAS[5]! },
  { tipo: 'montando' },
  { tipo: 'resultado' },
]

/**
 * Os passos para quem chega sem conta (pedido do dono, 01/11/2026, na revisão
 * do funil): o e-mail vem ANTES do resultado ("para onde mandamos o seu
 * plano?"), com o mesmo código de 6 números do /login. Quem desiste no preço
 * já é uma conta (recebe os e-mails de boas-vindas) e o botão do fim vai
 * direto ao pagamento. Quem já está logado não vê esse passo.
 */
export function passosDoQuiz(comConta: boolean): Passo[] {
  if (!comConta) return PASSOS
  const i = PASSOS.findIndex((p) => p.tipo === 'montando')
  return [...PASSOS.slice(0, i), { tipo: 'conta' }, ...PASSOS.slice(i)]
}

/** "Nubank", "Nubank e XP", "Nubank, Itaú e XP". */
export function listaEmPalavras(nomes: string[]): string {
  if (nomes.length <= 1) return nomes[0] ?? ''
  return `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`
}

/**
 * Marcar "Ainda em nenhum" desmarca os bancos, e marcar um banco desmarca o
 * "nenhum": as duas coisas não convivem.
 */
export function alternarBanco(marcados: string[], id: string): string[] {
  if (marcados.includes(id)) return marcados.filter((x) => x !== id)
  if (id === 'nenhum') return ['nenhum']
  return [...marcados.filter((x) => x !== 'nenhum'), id]
}

/** A frase do primeiro respiro, de acordo com o quanto a pessoa olha a carteira. */
export function fraseDosAvisos(r: Respostas): { titulo: string; texto: string } {
  const f = r.frequencia?.[0]
  if (f === 'dia') {
    return {
      titulo: 'Você olha todo dia. A Redentia também.',
      texto: 'E só te chama quando algo pede você. No resto do tempo, silêncio.',
    }
  }
  return {
    titulo: 'Você não precisa olhar todo dia.',
    texto: 'A Redentia olha a sua carteira por você e só te chama quando algo pede você.',
  }
}

/** A frase do segundo respiro, de acordo com a resposta da queda de 20%. */
export function fraseDosCenarios(r: Respostas): { titulo: string; texto: string } {
  const q = r.queda?.[0]
  if (q === 'sim') {
    return {
      titulo: 'Agora imagine 2.000 quedas e altas.',
      texto: 'A Redentia testa a sua carteira em 2.000 cenários dos próximos 5 anos: o otimista, o meio e o pessimista.',
    }
  }
  return {
    titulo: q === 'nao' ? 'Quase ninguém sabe. A Redentia te mostra.' : 'A Redentia tira o "mais ou menos".',
    texto: 'Ela testa a sua carteira em 2.000 cenários dos próximos 5 anos: o otimista, o meio e o pessimista.',
  }
}

export interface ItemDoResultado { id: string; titulo: string; texto: string }

/**
 * O resultado: o que a Redentia vai fazer com a carteira DESTA pessoa, de três
 * a quatro itens, cada um ligado a uma resposta. Só promete o que existe.
 */
export function resultadoDoQuiz(r: Respostas, nomeDoBanco: (slug: string) => string = (s) => s): ItemDoResultado[] {
  const itens: ItemDoResultado[] = []
  const add = (it: ItemDoResultado) => { if (!itens.some((x) => x.id === it.id)) itens.push(it) }

  // os bancos
  const bancos = (r.bancos ?? []).filter((b) => b !== 'nenhum' && b !== 'outro')
  if (bancos.length) {
    const nomes = bancos.slice(0, 3).map(nomeDoBanco)
    const resto = bancos.length - nomes.length
    add({
      id: 'bancos',
      titulo: resto > 0
        ? `${nomes.join(', ')} e mais ${resto}, num lugar só`
        : bancos.length > 1 ? `${listaEmPalavras(nomes)}, num lugar só` : `Seu ${nomes[0]}, lido sozinho`,
      texto: 'A Redentia lê os seus investimentos pelo Open Finance, sem planilha e sem digitar nada.',
    })
  }
  else if (r.bancos?.includes('outro')) {
    add({ id: 'bancos', titulo: 'Os seus bancos, num lugar só', texto: 'A Redentia lê os seus investimentos pelo Open Finance, sem planilha e sem digitar nada.' })
  }
  else if (r.investe?.[0] === 'nao' || r.bancos?.includes('nenhum')) {
    add({ id: 'bancos', titulo: 'A carteira nasce aqui', texto: 'Quando você fizer o primeiro investimento, a Redentia passa a acompanhar desde o primeiro real.' })
  }

  // o que preocupa
  const preocupa = r.preocupa ?? []
  if (preocupa.includes('queda')) add({ id: 'aviso', titulo: 'Um aviso no dia em que importar', texto: 'Quando a sua carteira se mexe mais que a bolsa, você fica sabendo, com o porquê.' })
  if (preocupa.includes('indo')) add({ id: 'frase', titulo: 'Uma frase por dia', texto: '"Tudo normal" ou o que mudou na sua carteira, comparada com a bolsa.' })
  if (preocupa.includes('proventos')) add({ id: 'proventos', titulo: 'Os proventos com data e valor', texto: 'Os dividendos e rendimentos que vão cair na sua conta, antes de caírem.' })
  if (preocupa.includes('espalhado') && !itens.some((x) => x.id === 'bancos')) add({ id: 'bancos', titulo: 'Todos os bancos somados', texto: 'Uma carteira só, com tudo o que você tem em cada instituição.' })

  // a queda de 20%
  if (r.queda?.[0] !== 'sim' || itens.length < 3) {
    add({ id: 'cenarios', titulo: 'Os 2.000 cenários dos próximos 5 anos', texto: 'O otimista, o meio e o pessimista da sua carteira, em dinheiro de hoje.' })
  }

  // o que quer
  const quer = r.quer?.[0]
  if (quer === 'renda') add({ id: 'proventos', titulo: 'Quanto a carteira te paga', texto: 'Os proventos de cada mês, os que já caíram e os que vêm.' })
  else if (quer === 'proteger') add({ id: 'aviso', titulo: 'Um aviso no dia em que importar', texto: 'Quando a sua carteira se mexe mais que a bolsa, você fica sabendo, com o porquê.' })

  // a IA fecha a lista quando ainda cabe
  add({ id: 'ia', titulo: 'Uma IA que responde com os seus números', texto: 'Pergunte por que caiu, quanto rende, o que pesa mais. Ela lê a sua carteira.' })

  return itens.slice(0, 4)
}

/** O título do resultado. */
export function tituloDoResultado(r: Respostas, nome?: string | null): string {
  const primeiro = (nome ?? '').trim().split(/\s+/)[0]
  const quem = primeiro ? `, ${primeiro}` : ''
  return r.investe?.[0] === 'nao' ? `Tudo pronto para começar${quem}.` : `O seu plano está pronto${quem}.`
}
