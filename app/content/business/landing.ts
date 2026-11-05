/**
 * O conteúdo da /business (05/11/2026). O dono mandou o print de uma landing
 * do Redentia For Business ("mais nesse estilo, só que mais o nosso"), viu três
 * variações e escolheu a 1, a Serifa: "eu gostei do 1, mas depois do hero
 * dedique aqueles scrolls personalizados para explicar melhor esses pontos".
 * Os pontos são os quatro itens da fila de aprovação (FILA), e cada um ganhou
 * um passo do scroll travado (PASSOS, em components/business/nova/BizPassos.vue).
 * Sem import de valor do Nuxt: os testes importam direto.
 *
 * ⚠️ A COPY É A DO PRINT, que é a direção do dono (o produto que vem aí), mas
 * parte dela ainda não tem lastro no produto de hoje. A lista "a confirmar com
 * o dono" está no fim deste arquivo, e nada dela vai para produção sem o sim dele.
 *
 * O ELENCO. A fila e os passos usam o elenco da conta interna das calls de
 * venda (Backend: database/data/business/elenco-calls.json e config/
 * business_clients.php, chave demo), para os nomes e os valores baterem com a
 * carteira que o prospect vê na demonstração:
 *   Mariana Ribeiro Costa · Nubank · moderado · ~R$ 525 mil (14 posições:
 *     1 Selic, 1 IPCA, 3 FIIs, 7 ações e 2 ETFs, profiles.moderado)
 *   Helena Duarte Campos · Bradesco · conservador · R$ 1.284.330
 *   Lucas Bastos Rezende · Itaú · arrojado · R$ 842.615 (60% em ações)
 *   Carolina Prado Vieira · XP · dolarizado · R$ 2.317.940
 *   Família Azevedo · BTG · family office · R$ 23.618.450 (cerca de 33
 *     posições, 5 delas em BDR, profiles.familyoffice)
 *   Eduardo Sales Pacheco e Juliana Mota Santana (painel), Fernando Albuquerque
 *   Lima (convite pendente, não entra na conta)
 * São sete carteiras conectadas. A casa da cena custodia no BTG, então "fora
 * do escritório" são as quatro de pessoa física com valor no elenco em outros
 * bancos: 525 + 1.284 + 843 + 2.318 = R$ 4,97 mi. O perfil dolarizado da
 * Carolina põe 75% em ETF internacional, BDR e exportadora (30 + 20 + 25).
 * Os números da fila SAEM das listas dos passos (CLIENTES_FORA, CARTEIRAS), e
 * o teste confere que as duas telas contam a mesma coisa. Nada aqui diz
 * "demonstração".
 */

export const ESTUDO = {
  titulo: 'Wealth 2030',
  frase: '10 teses sobre o futuro do wealth no Brasil.',
  acao: 'Baixar o estudo',
  // o PDF do dono (WEALTH-2030.pdf, "distribuição livre", 27 páginas), copiado em 05/11/2026
  href: '/estudos/wealth-2030.pdf',
} as const

/** A nav do topo da /business: cada uma é um id das seções da página. */
export const NAV_BIZ_NOVA = [
  { label: 'Agentes', to: '/business#agentes' },
  { label: 'Para quem', to: '/business#para-quem' },
  { label: 'Segurança', to: '/business#seguranca' },
  { label: 'Preço', to: '/business#prova' },
] as const

export const CTA_DEMO = 'Testar com carteira demo'
export const CTA_AGENDA = 'Agendar 1 hora'

export const HERO = {
  // a quebra fica com o ponto: duas frases, duas linhas no desktop
  titulo: ['Feche o mês em 5 dias.', 'Encontre a captação fora do escritório.'],
  apoio: 'Agentes que consolidam as carteiras dos seus clientes pelo Open Finance e deixam fechamento, reunião e resposta prontos para você aprovar.',
  garantias: ['Só leitura', 'O cliente revoga quando quiser', 'Garantia de 30 dias'],
  // a frase do CV-19: não sai enquanto o Open Finance do escritório for ligado conta a conta
  implantacao: 'Conexão habilitada escritório a escritório, na implantação.',
} as const

/**
 * Os logos de clientes da faixa do hero. VAZIO DE PROPÓSITO: o print tinha
 * "[LOGO ALLEZ] [LOGO ONE]..." e nenhum cliente autorizou logo. Com a lista
 * vazia a faixa não renderiza; quando o dono mandar os arquivos (SVG em
 * public/clientes/), cada um entra aqui e a faixa aparece sozinha.
 */
export const LOGOS_CLIENTES: { nome: string; src: string; largura: number }[] = []

export type IdDoPasso = 'captacao' | 'fechamento' | 'reuniao' | 'atendimento'

/** "R$ 4,97 mi" e "R$ 843 mil": o jeito curto da fila e dos passos. */
export function reaisCurtos(n: number): string {
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(2).replace('.', ',')} mi`
  return `R$ ${Math.round(n / 1000)} mil`
}

/* ——— 01 · captação: o patrimônio dos clientes fora do escritório ——— */
export interface ClienteFora { nome: string; banco: string; slug: string; valor: number; nota?: string }
/** Do maior para o menor; o primeiro é o destaque do passo e a linha da fila. */
export const CLIENTES_FORA: ClienteFora[] = [
  { nome: 'Carolina Prado Vieira', banco: 'XP', slug: 'xp', valor: 2_317_940, nota: '75% ligado ao dólar' },
  { nome: 'Helena Duarte Campos', banco: 'Bradesco', slug: 'bradesco', valor: 1_284_330 },
  { nome: 'Lucas Bastos Rezende', banco: 'Itaú', slug: 'itau', valor: 842_615 },
  { nome: 'Mariana Ribeiro Costa', banco: 'Nubank', slug: 'nubank', valor: 525_000 },
]
export const totalFora = (): number => CLIENTES_FORA.reduce((s, c) => s + c.valor, 0)

/* ——— 02 · fechamento: as sete carteiras, uma ainda sem fechar ——— */
export interface CarteiraDoMes { nome: string; ok: boolean; motivo?: string }
export const CARTEIRAS: CarteiraDoMes[] = [
  { nome: 'Carolina Prado Vieira', ok: true },
  { nome: 'Eduardo Sales Pacheco', ok: true },
  { nome: 'Helena Duarte Campos', ok: true },
  { nome: 'Juliana Mota Santana', ok: true },
  { nome: 'Lucas Bastos Rezende', ok: true },
  { nome: 'Mariana Ribeiro Costa', ok: true },
  // os 5 BDRs são os do perfil familyoffice; o atraso do extrato é a cena (A_CONFIRMAR)
  { nome: 'Família Azevedo', ok: false, motivo: 'Faltam os 5 BDRs no extrato de 31/10 do BTG.' },
]
export const FECHAMENTO = { mes: 'outubro', dia: 3, dias: 5 } as const

/* ——— 03 · reunião: a pauta da Mariana ——— */
export const PAUTA = {
  cliente: 'Mariana Ribeiro Costa',
  // a fila é de quinta, 05/11: "amanhã às 10h" é sexta
  quando: 'Sexta, 10h',
  perfil: 'Nubank · moderado · 14 posições',
  itens: [
    'O que mudou nas 14 posições em outubro',
    'Os 3 FIIs e os proventos de novembro',
    'A carteira no cenário de expansão fiscal',
  ],
} as const

/* ——— 04 · atendimento: a pergunta do Lucas e a resposta rascunhada ——— */
export const ATENDIMENTO = {
  cliente: 'Lucas Bastos Rezende',
  banco: 'Itaú',
  pergunta: 'Por que caiu?',
  // os 60% são o miolo de ações do perfil arrojado (profiles.arrojado)
  resposta: 'Oi, Lucas. A queda veio das ações, que são 60% da sua carteira, num dia de bolsa em baixa. O plano segue o mesmo, e te mostro o detalhe na próxima conversa.',
} as const

export interface ItemDaFila {
  id: IdDoPasso
  tipo: string
  etapa?: string
  titulo: string
  linha?: string
  feito?: number
  total?: number
  acao: string
}

const maior = CLIENTES_FORA[0]!
const primeiroNome = (n: string) => n.split(' ')[0]

export const FILA: { rotulo: string; quando: string; itens: ItemDaFila[] } = {
  rotulo: 'Fila de aprovação',
  // quinta, 05/11/2026: com Finados na segunda, é o 3º dia útil de novembro
  quando: 'Quinta, 8h02',
  itens: [
    {
      id: 'captacao', tipo: 'Captação',
      titulo: `${reaisCurtos(totalFora())} fora do escritório, em ${CLIENTES_FORA.length} clientes`,
      linha: `Maior: ${reaisCurtos(maior.valor)} da ${primeiroNome(maior.nome)} na ${maior.banco}, ${maior.nota}.`,
      acao: 'Ver clientes',
    },
    {
      id: 'fechamento', tipo: `Fechamento de ${FECHAMENTO.mes}`, etapa: `Dia ${FECHAMENTO.dia} de ${FECHAMENTO.dias}`,
      titulo: 'carteiras conciliadas', feito: CARTEIRAS.filter((c) => c.ok).length, total: CARTEIRAS.length,
      acao: 'Revisar',
    },
    {
      id: 'reuniao', tipo: 'Reunião',
      titulo: `${primeiroNome(PAUTA.cliente)}, amanhã às 10h`,
      linha: 'Pauta pronta',
      acao: 'Abrir pauta',
    },
    {
      id: 'atendimento', tipo: 'Atendimento',
      titulo: `“${ATENDIMENTO.pergunta}”`,
      linha: `${primeiroNome(ATENDIMENTO.cliente)} · resposta para aprovar`,
      acao: 'Aprovar',
    },
  ],
}

/**
 * Os quatro passos do scroll travado, um por item da fila e na mesma ordem
 * (o botão de cada item da fila rola até o passo dele). Densidade da página:
 * rótulo, título de uma linha e UMA frase de apoio; o resto é o visual.
 */
export interface Passo { id: IdDoPasso; rotulo: string; titulo: string; apoio: string }
export const PASSOS: Passo[] = [
  {
    id: 'captacao', rotulo: 'Captação', titulo: 'O patrimônio lá fora.',
    apoio: 'Cada banco que o cliente conecta entra na soma, e o que está fora do escritório aparece por cliente e por banco.',
  },
  {
    id: 'fechamento', rotulo: 'Fechamento', titulo: 'Cada carteira, conferida.',
    apoio: 'As posições batem com o extrato de cada banco, e a carteira que não fecha chega com o motivo.',
  },
  {
    id: 'reuniao', rotulo: 'Reunião', titulo: 'A pauta chega pronta.',
    apoio: 'Na véspera, o agente junta o que mudou na carteira, os proventos do mês e o cenário que vale mostrar.',
  },
  {
    id: 'atendimento', rotulo: 'Atendimento', titulo: 'Você revisa e assina.',
    apoio: 'A pergunta do cliente chega com a resposta escrita sobre a carteira dele, e ela só sai depois que você aprova.',
  },
]

/**
 * A conversa da variação 3 dos passos (?passos=3, só no dev; BizPassosConversa).
 * É a mais honesta com o produto de hoje: a Redentia dentro do assistente de IA
 * da mesa (o MCP), e é o assessor quem pergunta. Por isso o apoio de cada passo
 * troca o "o agente faz sozinho" por "você pede": mesma extensão, uma frase só.
 * O nome do assistente fica genérico ("seu assistente de IA") até o dono dizer
 * se pode escrever Claude. `fez` é a linha do que ela leu antes de responder
 * (sem nome de ferramenta: a regra da página é nada de termo técnico fora do FAQ).
 */
export interface TrocaDaConversa { pergunta: string; fez: string; resposta: string; apoio: string }
export const ASSISTENTE = { nome: 'Seu assistente de IA', conectada: 'Redentia conectada', campo: 'Pergunte sobre seus clientes' } as const
export const CONVERSA: Record<IdDoPasso, TrocaDaConversa> = {
  captacao: {
    pergunta: 'Quanto dos meus clientes está fora do escritório?',
    fez: `Somou ${CLIENTES_FORA.length} carteiras`,
    resposta: `${reaisCurtos(totalFora())}, em ${CLIENTES_FORA.length} clientes. A maior está na ${maior.banco}.`,
    apoio: 'Você pergunta, e ela soma o que cada cliente tem em cada banco conectado.',
  },
  fechamento: {
    pergunta: `Fecha ${FECHAMENTO.mes} para mim.`,
    fez: `Conferiu as ${CARTEIRAS.length} carteiras`,
    resposta: `${CARTEIRAS.filter((c) => c.ok).length} de ${CARTEIRAS.length} fecharam. Falta uma:`,
    apoio: 'Ela confere carteira por carteira e diz qual não fechou, com o motivo de cada uma.',
  },
  reuniao: {
    pergunta: `Prepara a reunião da ${primeiroNome(PAUTA.cliente)}.`,
    fez: `Leu a carteira da ${primeiroNome(PAUTA.cliente)}`,
    resposta: 'A pauta de sexta, às 10h:',
    apoio: 'Na véspera, você pede, e ela junta o que mudou na carteira, os proventos e o cenário que vale mostrar.',
  },
  atendimento: {
    pergunta: `O ${primeiroNome(ATENDIMENTO.cliente)} perguntou por que caiu.`,
    fez: `Leu a carteira do ${primeiroNome(ATENDIMENTO.cliente)} e o pregão`,
    resposta: 'Um rascunho, para você revisar antes de enviar:',
    apoio: 'Ela escreve a resposta sobre a carteira do cliente, e nada sai sem você ler e enviar.',
  },
}

/**
 * Para quem. Os dois perfis de comprador da página de antes (os cards do
 * plano do RbProva) mais a consultoria. A linha da assessoria é a da RCVM 178,
 * art. 25, VII: funciona sem dado de cliente. Uma linha curta por perfil desde
 * 05/11/2026, para os passos caberem no teto de palavras.
 */
export const PARA_QUEM = [
  { id: 'assessoria', nome: 'Assessoria', linha: 'Funciona sem dado de cliente.' },
  { id: 'family', nome: 'Family office', linha: 'Cada família consolidada, com o aceite dela.' },
  { id: 'gestora', nome: 'Gestora e consultoria', linha: 'O relatório sai com a sua marca.' },
] as const

/**
 * Segurança: as três frases do RbSeguranca de antes (conferidas no código em
 * 11/10/2026), encurtadas em 05/11/2026 sem trocar o que afirmam. O detalhe (o
 * convite como única escrita, a prova do aceite, o contrato do provedor de IA)
 * mora no FAQ.
 */
export const SEGURANCA = [
  { id: 'le', t: 'Só lê.', d: 'Nada compra, vende ou transfere.' },
  { id: 'sim', t: 'Cliente só entra com o sim dele.', d: 'O aceite fica registrado, e ele revoga quando quiser.' },
  { id: 'ia', t: 'A IA é a da sua casa.', d: 'A Redentia não treina modelo com o seu dado.' },
] as const

/** O preço por pessoa, em faixas progressivas (contrato de 13/10/2026; o mesmo do RbProva de antes). */
export const FAIXAS = [
  { de: 1, ate: 10, preco: 500, rotulo: '1ª a 10ª' },
  { de: 11, ate: 25, preco: 300, rotulo: '11ª a 25ª' },
  { de: 26, ate: 50, preco: 200, rotulo: '26ª a 50ª' },
  { de: 51, ate: Infinity, preco: 150, rotulo: '51ª ou mais' },
] as const

/** Total do mês para `n` pessoas, faixa a faixa (10 = 5.000; 25 = 9.500; 50 = 14.500). */
export function precoDaMesa(n: number): { total: number; linhas: { rotulo: string; preco: number; qtd: number }[] } {
  const linhas = FAIXAS.map((f) => ({ rotulo: f.rotulo, preco: f.preco, qtd: Math.max(0, Math.min(n, f.ate) - (f.de - 1)) }))
  return { total: linhas.reduce((s, l) => s + l.qtd * l.preco, 0), linhas }
}

/*
 * A CONFIRMAR COM O DONO antes de a página ir para produção (cada frase do
 * print, da fila ou dos passos que hoje não tem lastro no produto ou precisa da
 * palavra dele). Atualizada em 05/11/2026, com os quatro passos:
 *  - Feche o mês em 5 dias / dia 3 de 5: a revisão do FAQ de 11/10 tirou as respostas de fechamento e conciliação porque o produto não as entregava; as movimentações entraram em 29/10 (contrato da One), mas não há fechamento medido.
 *  - Carteiras conciliadas e o passo 02 ("As posições batem com o extrato de cada banco, e a carteira que não fecha chega com o motivo"): não existe conciliação contra extrato no produto hoje.
 *  - O motivo da carteira que falta ("Faltam os 5 BDRs no extrato de 31/10 do BTG", Família Azevedo): é a cena. Os 5 BDRs são os do perfil familyoffice, mas o elenco não tem extrato atrasado.
 *  - Agentes e a fila de aprovação: o produto é o MCP dentro do Claude ou do ChatGPT; não há tela de fila nem agente que roda sozinho. Os passos 03 ("Na véspera, o agente junta...") e 04 dizem que o agente trabalha sem ser chamado.
 *  - Captação fora do escritório e o passo 01 ("Cada banco que o cliente conecta entra na soma... por cliente e por banco"): a leitura por instituição existe (uma conexão por banco), mas não há tela que some o patrimônio fora da casa.
 *  - R$ 4,97 mi na fila: o print dizia "R$ 4,9 mi", mas a lista do passo 01 soma 4,97 (2,32 + 1,28 + 0,84 + 0,53) e "4,9" seria arredondar para baixo. Trocado para a fila e o passo baterem; se ele preferir o número redondo, é mudar o valor da Mariana no elenco, não o texto.
 *  - Reunião ("Mariana, amanhã às 10h", "Sexta, 10h"): não há agenda ligada ao produto; a pauta existe como o comando preparar-reuniao, chamado pelo assessor. Os três itens da pauta são os temas que esse comando cobre, sem número.
 *  - Atendimento (passo 04): não há canal que traga a pergunta do cliente (WhatsApp, e-mail) nem botão de aprovar e enviar. O rascunho para o Lucas ("num dia de bolsa em baixa") é a cena, não um pregão real; os 60% em ações são os do perfil arrojado.
 *  - Nomes e valores do elenco nos passos (os quatro clientes com o patrimônio por banco, as sete carteiras): a revisão de 13/08 tirou patrimônio do hero de então; aqui são os do elenco das calls, e nada diz "demonstração".
 *  - Testar com carteira demo: leva ao /business/cadastro, como o Entrar; conta nova é externa e não ganha a carteira gerada (só conta interna tem demo).
 *  - Agendar 1 hora: não há link de agenda; leva ao formulário #contato, que responde por e-mail.
 *  - Garantia de 30 dias: tem lastro (contrato de 13/10 e FAQ "Quanto custa?"); ficou só no hero, junto com a frase da implantação.
 *  - Cortes pelo teto de ~650 palavras (05/11): saíram os três benefícios ao lado da fila (os passos contam os mesmos pontos), o card escuro de family office e gestora (fica o "Agendar 1 hora" no card do preço e a linha em Para quem), a lista do que o plano inclui e a linha de prazo e IPCA (as duas no FAQ "Quanto custa?" e "Tem fidelidade?"); Para quem e Segurança ficaram com uma linha curta por item.
 *  - Logos de clientes: a faixa existe e está oculta até chegarem os arquivos e a autorização de cada cliente.
 *  - H1: muda de "Consolide a carteira do seu cliente com 1 clique." para o título do print (o dono já sabe). A meta description segue a de antes.
 *  - O PDF do Wealth 2030 passa a ser público em /estudos/wealth-2030.pdf (o documento diz "distribuição livre").
 *  - A página é indexável desde 20/10, e a regra de lá era "frase nova aqui precisa ser verdade hoje": esta é a direção do produto que vem aí, então não sobe para a main sem o sim do dono, item a item.
 *
 * AS TRÊS VARIAÇÕES DOS PASSOS (?passos=1|2|3, só no dev, 05/11/2026). Cada uma afirma coisas diferentes:
 *  - 1 · A câmera dentro do produto: desenha uma tela que não existe, a "Mesa" do Redentia For Business (a fila na lateral e as quatro áreas, com Editar e Aprovar). Afirma tudo o que a fila já afirma e mais: que há um app próprio com essa tela. O produto de hoje é o MCP no assistente de IA.
 *  - 2 · O caminho do dinheiro: a leitura banco a banco tem lastro (cada conexão é uma instituição, com o aceite do cliente). Sem lastro: a linha do BTG que para em âmbar e a nota "5 BDRs sem extrato" (a cena da Família Azevedo, como no passo 02), e a soma "fora do escritório" como saída pronta. Os apoios dos passos são os de hoje, com "o agente junta" no 03.
 *  - 3 · Ao vivo na sua IA: é o produto de hoje (o assessor pergunta; a Redentia responde dentro do assistente). DEIXA DE AFIRMAR: agente que roda sozinho e "na véspera" sem ser chamado (o apoio vira "você pede"), a tela de fila, o botão Aprovar e o envio ao cliente (vira um rascunho com "Copiar"; "nada sai sem você ler e enviar"), e a pergunta que "chega" de um canal (é o assessor quem conta: "O Lucas perguntou por que caiu"). TEM LASTRO: ler as carteiras consentidas com a instituição de cada uma (list_clients, get_client_portfolio), somar o que está fora do BTG na conversa, ler o pregão (get_market_snapshot), a pauta (o comando preparar-reuniao) e o texto para o cliente (a skill redentia-por-que-moveu). AINDA SEM LASTRO: "Fecha outubro para mim", "Conferiu as 7 carteiras" e "6 de 7 fecharam" (não há conciliação contra extrato), o motivo dos 5 BDRs (a cena) e o rascunho "num dia de bolsa em baixa" (a cena, não um pregão real). A PERGUNTAR: se a janela pode dizer "Claude" (hoje diz "Seu assistente de IA"), e se a linha "Redentia conectada" pode ficar.
 *  - Nas três: os números são os da fila (R$ 4,97 mi em 4 clientes, 6 de 7, sexta às 10h, a pergunta do Lucas), e nada diz "demonstração". As palavras fora do FAQ ficam em 636 (1), 544 (2) e 643 (3); hoje são 647.
 */
