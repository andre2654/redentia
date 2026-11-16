import type { RankingCopy } from '~/types/rankings'

const copy: RankingCopy = {
  answerFirst: '',
  educationalSections: [
    {
      h2: 'O que mostra esse ranking?',
      paragraphs: [
        'Lista as 50 ações com maior queda nos últimos 12 meses na B3. A queda pode coincidir com um problema no negócio ou com um turnaround em curso. A lista não distingue os dois casos.',
        'Quedas de 50 por cento ou mais em 12 meses geralmente indicam mudança estrutural: perda de market share, problema regulatório, escândalo de governança, virada de ciclo setorial. Algumas dessas vão se recuperar, outras vão continuar caindo. A diferença está na qualidade dos fundamentos remanescentes.',
      ],
    },
    {
      h2: 'Como interpretar o ranking',
      paragraphs: [
        'Estratégia contrarian: comprar ações em forte queda apostando em recuperação. Funciona quando a queda foi por motivo temporário e os fundamentos seguem sólidos. Não funciona quando a queda foi por motivo estrutural permanente. A diferenciação exige análise profunda do release trimestral, contexto setorial e qualidade da gestão.',
        'Use o ranking como ponto de partida pra investigar. Se uma ação caiu 60 por cento, pergunte: a queda de receita foi proporcional, a margem se manteve, o endividamento aumentou, houve mudança de gestão, o setor inteiro caiu (problema macro) ou só essa empresa (problema específico).',
      ],
    },
    {
      h2: 'Atenção',
      paragraphs: [
        'Ação que caiu 50 por cento pode cair mais 50 por cento. Sem catalisador de virada (resultados melhorando, nova gestão, mudança regulatória), a queda sozinha não descreve a distância até uma fórmula. A lista ordena a variação.',
        'Diversificação importa muito em estratégia contrarian. Se você comprar 5 ações em forte queda, é normal que 2-3 continuem caindo e 2-3 se recuperem. O erro é colocar tudo em uma só esperando recuperação certeira. Espalhe risco pra ter chance de capturar os turnarounds que de fato acontecem.',
      ],
    },
  ],
  crossLinks: [
    { title: 'Calculadora de Preço Teto', desc: 'Calcule o preço teto de uma ação pelas fórmulas de Graham e Bazin.', href: '/calculadora/preco-teto' },
    { title: 'Calculadora de Dividend Yield', desc: 'Simule o DY real de qualquer ação ou FII.', href: '/calculadora/dividend-yield' },
    { title: 'Simulador de Ações', desc: 'Projete retorno total de uma carteira ao longo do tempo.', href: '/calculadora/acoes' },
    { title: 'Outros rankings', desc: 'Veja todos os rankings disponíveis na Aportou.', href: '/rankings' },
  ],
  faqItems: [
    {
      q: 'Comprar ações em queda funciona?',
      a: 'Funciona se você acertar o fundo e a tese de virada. Erra se comprar e a queda continuar. Estatisticamente, ações em queda forte tendem a continuar caindo no curto prazo (momentum negativo) e podem reverter no médio-longo prazo (12-24 meses) se houver recuperação fundamentalista.',
    },
    {
      q: 'O que faz uma ação cair 50 por cento ou mais em 12 meses?',
      a: 'Combinação de motivos: queda de lucro real (problema operacional), mudança de regulação (perda de margem), perda de competitividade (concorrente novo), escândalo de governança (perda de confiança), virada de ciclo (commodities, juros, política). Investigar a causa principal é o passo um.',
    },
    {
      q: 'Como diferenciar turnaround real de armadilha?',
      a: 'Turnaround real geralmente vem com nova gestão, plano claro de reestruturação, primeiros sinais de melhora operacional (margem subindo, dívida controlada). Armadilha mantém os mesmos problemas trimestre após trimestre sem catalisador de virada. Leia 4-6 releases trimestrais antes de investir em uma situação especial.',
    },
    {
      q: 'Vale a pena comprar bancos quando estão em forte queda?',
      a: 'Bancos brasileiros costumam cair em ciclos de Selic alta (margem cai), aumento de inadimplência (provisões sobem) ou choque macro (Brasil instável). O histórico mostra recuperações depois de ciclos de 2-3 anos, e também mostra ciclos que demoram. A lista só ordena a queda.',
    },
  ],
}

export default copy
