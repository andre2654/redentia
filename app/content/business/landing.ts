/**
 * O conteúdo da /business nova (05/11/2026), em três variações no dev
 * (?biz=1|2|3, ver pages/business/index.vue). O dono mandou o print de uma
 * landing do Redentia For Business e pediu "mais nesse estilo (só que mais o
 * nosso estilo)". As três variações leem DAQUI, para a escolha ser de desenho e
 * não de texto. Sem import de valor do Nuxt: os testes importam direto.
 *
 * ⚠️ A COPY É A DO PRINT, que é a direção do dono, mas parte dela ainda não tem
 * lastro no produto. A lista "a confirmar com o dono" está em A_CONFIRMAR, no
 * fim deste arquivo, e nada dela vai para produção sem o sim dele.
 *
 * A FILA DE APROVAÇÃO usa o elenco da conta interna das calls de venda
 * (Backend: database/data/business/elenco-calls.json e config/
 * business_clients.php, chave demo), para os nomes e os valores baterem com a
 * carteira que o prospect vê na demonstração:
 *   Mariana Ribeiro Costa · Nubank · moderado · ~R$ 525 mil
 *   Helena Duarte Campos · Bradesco · conservador · R$ 1.284.330
 *   Lucas Bastos Rezende · Itaú · arrojado · R$ 842.615
 *   Carolina Prado Vieira · XP · dolarizado · R$ 2.317.940
 *   Família Azevedo · BTG · family office · R$ 23.618.450
 *   Eduardo Sales Pacheco e Juliana Mota Santana (painel), Fernando Albuquerque
 *   Lima (convite pendente)
 * São sete carteiras conectadas. A casa da cena custodia no BTG, então "fora
 * do escritório" são as quatro de pessoa física com valor no elenco em outros
 * bancos: 525 + 1.284 + 843 + 2.318 = R$ 4,97 mi, que vira "R$ 4,9 mi" (o
 * elenco avisa que o total real fica um pouco abaixo do alvo). O perfil
 * dolarizado da Carolina põe 75% em ETF internacional, BDR e exportadora
 * (30 + 20 + 25, profiles.dolarizado). Nada aqui diz "demonstração".
 */

export const ESTUDO = {
  titulo: 'Wealth 2030',
  frase: '10 teses sobre o futuro do wealth no Brasil.',
  acao: 'Baixar o estudo',
  // o PDF do dono (WEALTH-2030.pdf, "distribuição livre", 27 páginas), copiado em 05/11/2026
  href: '/estudos/wealth-2030.pdf',
} as const

/** A nav do topo nas variações: cada uma é um id das seções da página nova. */
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

export interface ItemDaFila {
  id: 'captacao' | 'fechamento' | 'reuniao' | 'atendimento'
  tipo: string
  etapa?: string
  titulo: string
  linha?: string
  feito?: number
  total?: number
  acao: string
}

export const FILA: { rotulo: string; quando: string; itens: ItemDaFila[] } = {
  rotulo: 'Fila de aprovação',
  // quinta, 05/11/2026: com Finados na segunda, é o 3º dia útil de novembro
  quando: 'Quinta, 8h02',
  itens: [
    {
      id: 'captacao', tipo: 'Captação',
      titulo: 'R$ 4,9 mi fora do escritório, em 4 clientes',
      linha: 'Maior: R$ 2,3 mi da Carolina na XP, 75% ligado ao dólar.',
      acao: 'Ver clientes',
    },
    {
      id: 'fechamento', tipo: 'Fechamento de outubro', etapa: 'Dia 3 de 5',
      titulo: 'carteiras conciliadas', feito: 6, total: 7,
      acao: 'Revisar',
    },
    {
      id: 'reuniao', tipo: 'Reunião',
      titulo: 'Mariana, amanhã às 10h',
      linha: 'Pauta pronta',
      acao: 'Abrir pauta',
    },
    {
      id: 'atendimento', tipo: 'Atendimento',
      titulo: '“Por que caiu?”',
      linha: 'Lucas · resposta para aprovar',
      acao: 'Aprovar',
    },
  ],
}

/** O que a fila conta, para quem não enxerga o desenho. */
export function descricaoDaFila(): string {
  const [c, f, r, a] = FILA.itens
  return `${FILA.rotulo}, ${FILA.quando}, ${FILA.itens.length} prontos. ${c.tipo}: ${c.titulo}. ${c.linha} ${f.tipo}, ${f.etapa!.toLowerCase()}: ${f.feito} de ${f.total} ${f.titulo}. ${r.tipo}: ${r.titulo}, ${r.linha!.toLowerCase()}. ${a.tipo}: ${a.titulo}, ${a.linha}.`
}

export const BENEFICIOS = [
  { id: 'mes', icone: 'calendario', texto: 'Feche o mês em dias, não semanas, com cada número apontando para o extrato de origem' },
  { id: 'captacao', icone: 'bancos', texto: 'Veja o patrimônio que o cliente tem em outros bancos e transforme isso em captação' },
  { id: 'reuniao', icone: 'assinatura', texto: 'Chegue à reunião e responda o cliente com tudo pronto, sem deixar de assinar a recomendação' },
] as const

/**
 * Para quem. Os dois perfis de comprador que a página já tinha (os cards do
 * plano, RbProva) mais a consultoria, que o topo de pages/business/index.vue
 * já lista. A linha da assessoria é a da RCVM 178, art. 25, VII: funciona sem
 * dado de cliente.
 */
export const PARA_QUEM = [
  { id: 'assessoria', nome: 'Assessoria', linha: 'Funciona sem dado de cliente: o mercado e o cenário chegam prontos para a mesa.' },
  { id: 'family', nome: 'Family office', linha: 'A carteira de cada família, consolidada com o aceite dela.' },
  { id: 'gestora', nome: 'Gestora e consultoria', linha: 'O cenário roda sobre a carteira, e o relatório sai com a sua marca.' },
] as const

/** Segurança: as três frases de RbSeguranca (conferidas no código em 11/10/2026). */
export const SEGURANCA = [
  { id: 'le', t: 'Só lê.', d: 'Nada compra, vende ou transfere. A única ação é o convite ao cliente, que não abre nada sem o aceite dele.' },
  { id: 'sim', t: 'Cliente só entra com o sim dele.', d: 'O aceite e cada leitura da carteira ficam registrados. Ele revoga quando quiser, e as posições são apagadas.' },
  { id: 'ia', t: 'A IA é a da sua casa.', d: 'Quem responde é o Claude ou o ChatGPT do escritório, no contrato que vocês já têm. A Redentia não treina modelo com o seu dado.' },
] as const

/** O preço por pessoa, em faixas progressivas (contrato de 13/10/2026; o mesmo de RbProva). */
export const FAIXAS = [
  { de: 1, ate: 10, preco: 500, rotulo: '1ª a 10ª' },
  { de: 11, ate: 25, preco: 300, rotulo: '11ª a 25ª' },
  { de: 26, ate: 50, preco: 200, rotulo: '26ª a 50ª' },
  { de: 51, ate: Infinity, preco: 150, rotulo: '51ª ou mais' },
] as const

export const INCLUI = [
  'Um acesso por pessoa da mesa',
  'Cenários para toda a mesa',
  'Sete rotinas prontas no Claude',
  'Funciona sem dado de cliente',
  'Garantia de 30 dias',
] as const

/** Total do mês para `n` pessoas, faixa a faixa (10 = 5.000; 25 = 9.500; 50 = 14.500). */
export function precoDaMesa(n: number): { total: number; linhas: { rotulo: string; preco: number; qtd: number }[] } {
  const linhas = FAIXAS.map((f) => ({ rotulo: f.rotulo, preco: f.preco, qtd: Math.max(0, Math.min(n, f.ate) - (f.de - 1)) }))
  return { total: linhas.reduce((s, l) => s + l.qtd * l.preco, 0), linhas }
}

/*
 * A CONFIRMAR COM O DONO antes de qualquer variação ir para produção (cada
 * frase do print, ou da fila, que hoje não tem lastro ou precisa da palavra dele):
 *  - Feche o mês em 5 dias / dia 3 de 5: a revisão do FAQ de 11/10 tirou as respostas de fechamento e conciliação porque o produto não as entregava; as movimentações entraram em 29/10 (contrato da One), mas não há fechamento medido.
 *  - carteiras conciliadas / cada número apontando para o extrato de origem: não existe conciliação nem procedência por número no produto hoje.
 *  - Agentes e a fila de aprovação: o produto é o MCP dentro do Claude ou do ChatGPT; não há tela de fila nem agente que roda sozinho.
 *  - Captação fora do escritório: a leitura por instituição existe (uma conexão por banco), mas não há tela que some o patrimônio fora da casa.
 *  - Testar com carteira demo: leva ao /business/cadastro, como o Entrar; conta nova é externa e não ganha a carteira gerada (só conta interna tem demo).
 *  - Agendar 1 hora: não há link de agenda; leva ao formulário #contato, que responde por e-mail.
 *  - Garantia de 30 dias: tem lastro (contrato de 13/10 e FAQ "Quanto custa?"), mas o hero de hoje trocou a garantia pela frase de implantação; as duas ficaram.
 *  - Valores em reais na fila: a revisão de 13/08 tirou patrimônio do hero de hoje; aqui são os do elenco das calls.
 *  - Logos de clientes: a faixa existe e está oculta até chegarem os arquivos e a autorização de cada cliente.
 *  - H1: muda de "Consolide a carteira do seu cliente com 1 clique." para o título do print.
 *  - O PDF do Wealth 2030 passa a ser público em /estudos/wealth-2030.pdf (o documento diz "distribuição livre").
 */
