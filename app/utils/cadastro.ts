/**
 * Cadastro sem muro (21/10/2026): no lugar de mandar o visitante para o
 * /login, sobe uma folha que mostra o que ele pediu já funcionando, cria a
 * conta com o código de 6 números e completa a ação sozinha (CadastroFolha).
 * O desenho aprovado está no canvas "Cadastro sem muro" do dono.
 *
 * Aqui ficam as partes puras, sem import do Nuxt, para o `node --test`
 * (tests/cadastro.test.ts): os textos de cada gesto e as contas dos gráficos.
 */

export type CadastroGesto = 'seguir' | 'resumo' | 'simulacao' | 'aposentadoria' | 'conta' | 'carteira' | 'pergunta'

export type CadastroIcone =
  | 'envelope' | 'jornal' | 'calendario' | 'relogio' | 'conversa'
  | 'carteira' | 'marcador' | 'ajuste' | 'brilho' | 'grafico' | 'historico' | 'cadeado'

export interface CadastroLinha {
  icone: CadastroIcone
  titulo: string
  texto: string
}

export interface CadastroTexto {
  titulo: string
  apoio: string
  /** três motivos no máximo: o que a conta dá para este gesto */
  linhas: CadastroLinha[]
  /** o botão diz a ação, não "criar conta" */
  botao: string
  /** o que a pessoa aceita ao confirmar, além de criar a conta */
  aceite: string
}

/**
 * Os textos da folha para cada gesto. O ticker vai sem artigo ("Siga WEGE3."): não sabemos o gênero do nome.
 * As calculadoras (a simulação de juros, a aposentadoria e as outras, pelo gesto
 * `conta`, que traz a pergunta pronta) usam o texto da folha que sobe depois de
 * mexer na conta (dono, 21/10/2026: "saiba como essa conta pode se adaptar à
 * sua vida com a Redentia"): guardar, conectar a carteira pelo Open Finance
 * (existe no /carteira) e perguntar à Redentia.
 */
export function textoDoGesto(
  gesto: CadastroGesto,
  dados: { ticker?: string; minutos?: number | null; aposentaAos?: number; mensal?: number; pergunta?: string } = {},
): CadastroTexto {
  if (gesto === 'seguir') {
    const t = (dados.ticker ?? '').toUpperCase()
    return {
      titulo: `Siga ${t}.`,
      apoio: 'A Redentia acompanha o papel por você e conta o que mudou.',
      linhas: [
        { icone: 'envelope', titulo: 'Um resumo às 19h', texto: 'No fim do pregão, só com os ativos que você segue.' },
        { icone: 'jornal', titulo: 'O porquê de cada movimento', texto: `A notícia que mexeu em ${t}, lida pela Redentia.` },
        { icone: 'calendario', titulo: 'Data-com e pagamento', texto: `Os dividendos de ${t} avisados antes da data.` },
      ],
      botao: `Seguir ${t}`,
      aceite: 'Ao confirmar, você cria sua conta grátis e passa a receber o resumo das 19h dos ativos que segue.',
    }
  }
  if (gesto === 'resumo') {
    const min = dados.minutos && dados.minutos > 0 ? dados.minutos : null
    return {
      titulo: 'O mercado de ontem, às 7h30.',
      apoio: min ? `${min === 1 ? 'Um minuto' : `${extenso(min)} minutos`} de leitura antes de o pregão abrir.` : 'Uma leitura curta antes de o pregão abrir.',
      linhas: [
        { icone: 'relogio', titulo: 'Todo dia útil, às 7h30', texto: 'Antes da abertura, com o fechamento de ontem.' },
        { icone: 'conversa', titulo: 'No WhatsApp ou no e-mail', texto: 'Você escolhe o canal e troca quando quiser.' },
        { icone: 'carteira', titulo: 'Com a sua carteira', texto: 'Conecte e o resumo passa a falar do seu dinheiro.' },
      ],
      botao: 'Receber às 7h30',
      aceite: 'Ao confirmar, você cria sua conta grátis e passa a receber o resumo diário. Cancele quando quiser.',
    }
  }
  // conectar a carteira (banda da home, 21/10/2026): o que o /carteira dá de verdade,
  // e a objeção de quem conecta o banco respondida com a promessa dele
  if (gesto === 'carteira') {
    return {
      titulo: 'Junte seus bancos numa carteira só.',
      apoio: 'Crie a conta grátis e autorize no app do seu banco, pelo Open Finance.',
      linhas: [
        { icone: 'carteira', titulo: 'Tudo num lugar só', texto: 'Ações, FIIs, renda fixa e ETFs de mais de 110 bancos e corretoras.' },
        { icone: 'cadeado', titulo: 'Só leitura', texto: 'Regulado pelo Banco Central. A Redentia não movimenta o seu dinheiro.' },
        { icone: 'relogio', titulo: 'O resumo fala da sua carteira', texto: 'Às 7h30, o que mexeu no que é seu.' },
      ],
      botao: 'Conectar minha carteira',
      aceite: 'Ao confirmar, você cria sua conta grátis na Redentia.',
    }
  }
  if (gesto === 'simulacao' || gesto === 'aposentadoria' || gesto === 'conta') {
    const pergunta = gesto === 'conta'
      ? (dados.pergunta || '“Como chego lá mais rápido?”')
      : gesto === 'aposentadoria'
        ? (dados.aposentaAos && dados.aposentaAos > 32 ? `“E se eu me aposentar aos ${dados.aposentaAos - 2}?”` : '“E se eu me aposentar mais cedo?”')
        : (dados.mensal && dados.mensal > 0 ? `“E se eu guardar ${brlInteiro(dados.mensal * 2)} por mês?”` : '“Quanto preciso guardar por mês?”')
    return {
      titulo: 'Essa conta pode virar o seu plano.',
      apoio: 'Guarde a conta e veja como ela se adapta à sua vida, com os seus números de verdade.',
      linhas: [
        { icone: 'marcador', titulo: 'Guarde esta conta', texto: 'Reabra e ajuste quando a vida mudar.' },
        { icone: 'carteira', titulo: 'Conecte a sua carteira', texto: 'Pelo Open Finance, o seu patrimônio de verdade ao lado da conta.' },
        { icone: 'conversa', titulo: 'Pergunte à Redentia', texto: `${pergunta}, com os seus números.` },
      ],
      botao: 'Guardar a minha conta',
      aceite: 'Ao confirmar, você cria sua conta grátis na Redentia.',
    }
  }
  return {
    titulo: 'Sua pergunta está guardada.',
    apoio: 'Entre de graça e a Redentia responde na hora, em português.',
    linhas: [
      { icone: 'conversa', titulo: 'Pergunte o que quiser', texto: 'Ações, FIIs, dividendos e a sua carteira.' },
      { icone: 'grafico', titulo: 'Com os dados do pregão', texto: 'A resposta usa as cotações e as notícias do dia.' },
      { icone: 'historico', titulo: 'Fica no seu histórico', texto: 'Retome a conversa quando quiser.' },
    ],
    botao: 'Ver a resposta',
    aceite: 'Ao confirmar, você cria sua conta grátis na Redentia.',
  }
}

const EXTENSO = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez']
function extenso(n: number): string {
  const t = EXTENSO[n] ?? String(n)
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/* ————— números ————— */

const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const brl0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

/** "+7,78%" / "−5,17%" (sinal de menos de verdade, como nos e-mails). */
export function pctTexto(v: number): string {
  const s = nf2.format(Math.abs(v))
  return v > 0 ? `+${s}%` : v < 0 ? `−${s}%` : `${s}%`
}

/** "R$ 103.926" */
export function brlInteiro(v: number): string {
  return `R$ ${brl0.format(Math.round(v))}`
}

/** "R$ 46,27" */
export function brlCentavos(v: number): string {
  return `R$ ${nf2.format(v)}`
}

/* ————— textos que vêm da API ————— */

/** A primeira frase de um texto (até o primeiro ". "), com o ponto. */
export function primeiraFrase(texto: string | null | undefined): string | null {
  const t = (texto ?? '').replace(/\s+/g, ' ').trim()
  if (!t) return null
  const i = t.search(/[.!?](\s|$)/)
  return i >= 0 ? t.slice(0, i + 1) : t
}

/**
 * O porquê do movimento a partir do título da notícia: tira o "(WEGE3)" que
 * repete o papel e corta em ~110 caracteres sem quebrar palavra.
 */
export function motivoCurto(titulo: string | null | undefined, ticker: string, max = 110): string | null {
  let t = (titulo ?? '').replace(/\s+/g, ' ').trim()
  if (!t) return null
  const tk = ticker.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (tk) t = t.replace(new RegExp(`\\s*\\(${tk}\\)`, 'gi'), '')
  if (t.length <= max) return t
  const corte = t.slice(0, max + 1).replace(/\s+\S*$/, '')
  return `${corte.replace(/[,;:.\s]+$/, '')}…`
}

/**
 * A manchete cita outro papel? "Petrobras, WEG (WEGE3) e Cosan (CSAN3) são
 * alguns dos destaques desta quarta-feira" (21/10) é resumo do dia, não o
 * porquê da Petrobras. PETR3 numa manchete da PETR4 é a mesma empresa.
 */
export function citaOutroPapel(titulo: string, ticker: string): boolean {
  const raiz = ticker.toUpperCase().slice(0, 4)
  return (titulo.toUpperCase().match(/\b[A-Z]{4}\d{1,2}\b/g) ?? []).some((c) => c.slice(0, 4) !== raiz)
}

/**
 * "hoje" quando o pregão do dia já abriu (dia útil, a partir das 10h de
 * Brasília); antes disso e no fim de semana, a variação e a maior alta são as
 * do último pregão. Feriado da B3 passa por dia útil.
 */
export function quandoDoPregao(agora: Date = new Date()): 'hoje' | 'no último pregão' {
  const brasilia = new Date(agora.getTime() - 3 * 3_600_000)
  const dia = brasilia.getUTCDay()
  const minutos = brasilia.getUTCHours() * 60 + brasilia.getUTCMinutes()
  return dia >= 1 && dia <= 5 && minutos >= 600 ? 'hoje' : 'no último pregão'
}

/* ————— gráficos ————— */

type Ponto = [number, number]

function comprimento(pts: Ponto[]): number {
  let s = 0
  for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i]![0] - pts[i - 1]![0], pts[i]![1] - pts[i - 1]![1])
  return s
}

function caminho(pts: Ponto[]): string {
  return 'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L')
}

export interface LinhaDoMes {
  /** a linha até o fechamento de ontem */
  corpo: string
  /** o último trecho: de ontem para hoje */
  queda: string
  /** a linha inteira fechada na base, para o preenchimento */
  area: string
  /** altura do fechamento de ontem (o pontilhado) */
  ontemY: number
  /** o ponto de hoje */
  fim: Ponto
  comprimentoCorpo: number
  comprimentoQueda: number
  /** hoje fechou acima de ontem */
  subiu: boolean
}

/**
 * A linha do último mês de um ativo, numa caixa W×H com margem M: o corpo até
 * ontem e o trecho de hoje separados, para o de hoje ter cor própria. Com
 * menos de 3 preços válidos não há o que desenhar.
 */
export function linhaDoMes(precos: Array<number | null | undefined>, W = 456, H = 96, M = 6): LinhaDoMes | null {
  const vs = precos.filter((v): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0)
  if (vs.length < 3) return null
  const lo = Math.min(...vs)
  const hi = Math.max(...vs)
  const faixa = hi - lo || 1
  const pts: Ponto[] = vs.map((v, i) => [M + (i * (W - 2 * M)) / (vs.length - 1), M + ((hi - v) * (H - 2 * M)) / faixa])
  const corpo = pts.slice(0, -1)
  const ultimo = pts.slice(-2)
  const fim = pts[pts.length - 1]!
  return {
    corpo: caminho(corpo),
    queda: caminho(ultimo),
    area: `${caminho(pts)} L${fim[0].toFixed(1)} ${H} L${pts[0]![0].toFixed(1)} ${H} Z`,
    ontemY: Number(pts[pts.length - 2]![1].toFixed(1)),
    fim: [Number(fim[0].toFixed(1)), Number(fim[1].toFixed(1))],
    comprimentoCorpo: Math.ceil(comprimento(corpo)),
    comprimentoQueda: Math.ceil(comprimento(ultimo)),
    subiu: vs[vs.length - 1]! >= vs[vs.length - 2]!,
  }
}

export interface ContaJuros {
  inicial: number
  mensal: number
  /** % ao ano */
  taxa: number
  anos: number
}

/** A mesma conta da calculadora (components/calc/compound-math.ts): taxa anual → mensal equivalente. */
export function totalJuros({ inicial, mensal, taxa, anos }: ContaJuros, meses = anos * 12): number {
  const im = Math.pow(1 + taxa / 100, 1 / 12) - 1
  const f = Math.pow(1 + im, meses)
  return im > 0 ? inicial * f + (mensal * (f - 1)) / im : inicial + mensal * meses
}

export interface CurvaJuros {
  /** a curva do total, mês a mês (de 4 em 4) */
  d: string
  area: string
  /** a reta do que a pessoa aportou */
  aporte: string
  pontos: Ponto[]
  total: number
  aportado: number
  /** o fim da reta do aporte, para o rótulo */
  fimAporte: Ponto
}

export function curvaJuros(c: ContaJuros, W = 456, H = 120, M = 10): CurvaJuros | null {
  const meses = Math.round(c.anos * 12)
  if (!(meses > 0)) return null
  const total = totalJuros(c, meses)
  const aportado = c.inicial + c.mensal * meses
  if (!(total > 0)) return null
  const xy = (k: number, v: number): Ponto => [M + (k * (W - 2 * M)) / meses, H - M - (v * (H - 2 * M)) / total]
  const passo = Math.max(1, Math.round(meses / 30))
  const pontos: Ponto[] = []
  for (let k = 0; k <= meses; k += passo) pontos.push(xy(k, totalJuros(c, k)))
  if (pontos[pontos.length - 1]![0] < W - M - 0.01) pontos.push(xy(meses, total))
  const a0 = xy(0, c.inicial)
  const a1 = xy(meses, aportado)
  const fim = pontos[pontos.length - 1]!
  return {
    d: caminho(pontos),
    area: `${caminho(pontos)} L${fim[0].toFixed(1)} ${H} L${pontos[0]![0].toFixed(1)} ${H} Z`,
    aporte: caminho([a0, a1]),
    pontos,
    total,
    aportado,
    fimAporte: [Number(a1[0].toFixed(1)), Number(a1[1].toFixed(1))],
  }
}

/** O ponto a uma fração p (0 a 1) do comprimento de uma polilinha: por onde a bola de neve rola. */
export function pontoNaPolilinha(pts: Ponto[], p: number): Ponto {
  if (!pts.length) return [0, 0]
  const alvo = comprimento(pts) * Math.min(1, Math.max(0, p))
  let andado = 0
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!
    const b = pts[i]!
    const seg = Math.hypot(b[0] - a[0], b[1] - a[1])
    if (andado + seg >= alvo) {
      const t = seg ? (alvo - andado) / seg : 0
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
    }
    andado += seg
  }
  return pts[pts.length - 1]!
}
