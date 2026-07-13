import type { RankingCopy } from '~/types/rankings'

const copy: RankingCopy = {
  answerFirst: '',
  educationalSections: [
    {
      h2: 'Por que ausência de prejuízo importa?',
      paragraphs: [
        'Empresa que mantém lucro positivo por 5+ anos seguidos atravessou pelo menos um ciclo econômico difícil sem ficar no vermelho. Isso é um filtro de qualidade poderoso: separa negócios resilientes (modelo de receita previsível, baixa alavancagem operacional, gestão prudente) de negócios voláteis que oscilam entre lucro e prejuízo conforme o vento muda.',
        'Pra investidor de buy and hold, essa consistência reduz drasticamente o risco. Quando uma empresa nunca teve prejuízo nos últimos 5-10 anos, a chance de ter prejuízo no próximo é estatisticamente menor que de uma empresa cíclica. Não elimina o risco (qualquer empresa pode ter ano ruim), mas inclina a probabilidade pro lado favorável.',
      ],
    },
    {
      h2: 'Setores típicos que aparecem',
      paragraphs: [
        'Bancos e seguradoras dominam por modelo de receita estável (juros, prêmios, taxas). Utilities (energia, saneamento) também aparecem com frequência por contratos de longo prazo regulados. Bolsas (B3SA3) e marketplaces consolidados costumam estar na lista por modelo capital-light com receita recorrente.',
        'Já varejo, construção, commodities e empresas cíclicas raramente aparecem. Vale e Petrobras tem histórico de prejuízo em ciclos ruins de minério ou petróleo, mesmo sendo gigantes. Pra carteira defensiva (aposentadoria, renda passiva), priorize ativos deste ranking sobre empresas cíclicas.',
      ],
    },
    {
      h2: 'Limitações',
      paragraphs: [
        'Lucro positivo não significa lucro suficiente. Empresa pode ter lucro irrisório em relação ao patrimônio (ROE baixo) e ainda assim aparecer no ranking. Sempre cruze com ROE e crescimento de lucro pra distinguir empresa "estável boa" de empresa "estável medíocre". O ideal é ausência de prejuízo + ROE acima de 15 por cento.',
        'Histórico passado não garante futuro. Empresa pode ter mantido lucro por 10 anos e ter prejuízo no 11º por mudança regulatória, choque setorial ou má gestão. Use este ranking como filtro de triagem, depois faça análise atual da tese (margens, dívida, contexto setorial) antes de decidir entrar.',
      ],
    },
  ],
  crossLinks: [
    {
      title: 'Calculadora de Preço Teto',
      desc: 'Calcule o preço justo de uma ação por Graham e Bazin.',
      href: '/calculadora/preco-teto',
    },
    {
      title: 'Calculadora de Dividend Yield',
      desc: 'Simule o DY real de qualquer ação ou FII.',
      href: '/calculadora/dividend-yield',
    },
    {
      title: 'Buy and Hold (Score)',
      desc: 'Ranking de qualidade combinado pra estratégia de longo prazo.',
      href: '/ranking/buy-and-hold',
    },
    {
      title: 'Outros rankings',
      desc: 'Veja todos os rankings disponíveis na Redentia.',
      href: '/rankings',
    },
  ],
  faqItems: [
    {
      q: 'Por que algumas empresas nunca têm prejuízo?',
      a: 'Geralmente é combinação de: modelo de receita previsível (contratos, recorrência, regulação), baixa alavancagem operacional (custos variáveis em vez de fixos), gestão financeira prudente (caixa alto, dívida baixa), setor com barreiras de entrada (bancos, utilities reguladas). Quando esses pilares estão presentes, a empresa absorve choques sem ficar no vermelho.',
    },
    {
      q: 'Vale a pena pagar mais caro por empresa que nunca teve prejuízo?',
      a: 'Sim, e o mercado costuma cobrar premium por isso. Empresas resilientes negociam P/L acima da média do setor justamente por ter risco menor. Pra investidor de buy and hold ou aposentadoria, esse premium se justifica. Pra investidor focado em retorno máximo, o premium reduz upside.',
    },
    {
      q: 'Como combinar este ranking com Buy and Hold?',
      a: 'Empresas que aparecem nos dois rankings são as candidatas mais sólidas pra carteira de longo prazo. Aqui você filtra resiliência (sem prejuízo). No Buy and Hold, filtra qualidade (ROE alto, dividendo consistente, dívida controlada). Interseção das duas listas é o universo de "core positions" defensivas.',
    },
    {
      q: 'Esse ranking funciona pra FIIs?',
      a: 'FIIs distribuem rendimentos mensais (não tem conceito clássico de prejuízo), então o ranking foca em ações e ETFs. Pra FIIs, o equivalente é checar histórico de distribuição: FIIs que pagaram rendimento todos os meses por 5+ anos sem interrupção tem mesmo perfil de resiliência.',
    },
    {
      q: 'Como saber se uma empresa pode ter prejuízo no futuro?',
      a: 'Sinais de alerta: queda consecutiva de margem, dívida crescendo mais que EBITDA, perda de market share, mudança regulatória adversa, troca frequente de gestão, queda de demanda estrutural no setor. Acompanhe releases trimestrais e revise a tese se vários sinais aparecerem juntos.',
    },
  ],
}

export default copy
