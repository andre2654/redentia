import type { RankingCopy } from '~/types/rankings'

const copy: RankingCopy = {
  answerFirst: '',
  educationalSections: [
    {
      h2: 'O que mostra esse ranking?',
      paragraphs: [
        'Lista as 50 empresas com maior posição de caixa e equivalentes (caixa, aplicações de curto prazo, títulos liquidez imediata). É uma fotografia da saúde financeira de curto prazo: empresas com muito caixa têm flexibilidade pra investir, fazer aquisições, distribuir dividendos extraordinários ou simplesmente atravessar crises sem problema.',
        'Bancos dominam o ranking por natureza do negócio (depósitos viram caixa). Petrobras e Vale aparecem em ciclos de commodity alto (caixa acumulado em ciclo). Empresas como Itaúsa, B3 e Ambev costumam estar no topo por modelo capital-light que gera caixa em excesso constantemente.',
      ],
    },
    {
      h2: 'Como interpretar o ranking',
      paragraphs: [
        'Caixa alto pode ser bom (flexibilidade) ou ruim (gestão sem ideia do que fazer com o dinheiro). Empresa com R$ 50 bilhões em caixa e ROE de 10 por cento está deixando de gerar valor, esse caixa parado rende menos que o custo de capital. Pra investidor, o ideal é caixa suficiente pra resiliência mais distribuição do excesso via dividendos ou recompras.',
        'Cruze com endividamento. Empresa pode ter R$ 30 bilhões em caixa MAS R$ 80 bilhões em dívida, dívida líquida de R$ 50 bilhões. Posição absoluta de caixa não diz nada sem o contexto da dívida bruta. O indicador mais limpo é dívida líquida (caixa menos dívida) ou dívida líquida sobre EBITDA.',
      ],
    },
    {
      h2: 'Limitações',
      paragraphs: [
        'Bancos sempre vão dominar o ranking porque a natureza do negócio exige caixa elevado (depósitos a vista, regulamentação Basileia, liquidez bancária). Comparar caixa de banco com caixa de uma siderúrgica não faz muito sentido, sempre olhe dentro do mesmo setor.',
        'Caixa pode ser inflado por venda recente de ativos, captação de dívida ou IPO. Sempre olhe a evolução do caixa nos últimos 4 trimestres pra entender se é estrutural (geração operacional) ou eventual (entrada pontual de recursos).',
      ],
    },
  ],
  crossLinks: [
    { title: 'Simulador de Ações', desc: 'Projete retorno total de uma carteira ao longo do tempo.', href: '/calculadora/acoes' },
    { title: 'Calculadora de Preço Teto', desc: 'Calcule o preço justo de uma ação por Graham e Bazin.', href: '/calculadora/preco-teto' },
    { title: 'Calculadora de Dividend Yield', desc: 'Simule o DY real de qualquer ação ou FII.', href: '/calculadora/dividend-yield' },
    { title: 'Outros rankings', desc: 'Veja todos os rankings disponíveis na Redentia.', href: '/rankings' },
  ],
  faqItems: [
    {
      q: 'Por que ter muito caixa pode ser ruim?',
      a: 'Caixa rende muito pouco (próximo da Selic), normalmente abaixo do retorno esperado dos acionistas. Empresa que acumula caixa sem aplicar destrói valor (custo de oportunidade). O ideal é distribuir o excesso via dividendos ou recomprar ações próprias. Caixa parado por anos sinaliza falta de visão estratégica.',
    },
    {
      q: 'Empresa com muito caixa paga mais dividendos?',
      a: 'Geralmente sim, mas não automaticamente. Depende da política de payout. Empresas como BBSE3 e Itaúsa distribuem o caixa excedente via dividendos. Outras (como algumas tech) mantêm caixa pra aquisições futuras. Olhe o histórico de pagamento e o discurso da gestão pra projetar.',
    },
    {
      q: 'Caixa ou dívida líquida, qual é mais importante?',
      a: 'Dívida líquida (caixa menos dívida bruta) é a métrica mais limpa de saúde financeira. Caixa sozinho pode mascarar endividamento. Empresa com R$ 10 bilhões em caixa e zero dívida tem dívida líquida negativa de R$ 10 bilhões (excelente). Empresa com R$ 10 bilhões em caixa e R$ 40 bilhões em dívida tem dívida líquida positiva de R$ 30 bilhões (alavancada).',
    },
    {
      q: 'Vale buscar empresas com muito caixa em crise?',
      a: 'Sim, porque tem mais chance de atravessar crise sem problema, sem precisar emitir ações ou tomar dívida cara. Em momentos de pânico de mercado, empresas com balanço sólido (caixa alto, dívida baixa) caem menos e se recuperam mais rápido. Pesquisa acadêmica confirma esse efeito de "flight to quality".',
    },
  ],
}

export default copy
