import type { RankingCopy } from '~/types/rankings'

const copy: RankingCopy = {
  answerFirst: '',
  educationalSections: [
    {
      h2: 'O que é Lucro Líquido?',
      paragraphs: [
        'Lucro líquido é o resultado final do exercício depois de todas as despesas operacionais, financeiras, impostos e participações de minoritários. É o último número do DRE e a base pra calcular dividendos, lucro por ação (LPA) e ROE.',
        'No ranking usamos lucro líquido TTM (últimos 12 meses) pra suavizar sazonalidade e itens não recorrentes. Isso dá uma visão mais limpa da capacidade operacional da empresa de gerar valor pros acionistas.',
      ],
    },
    {
      h2: 'Como interpretar o ranking',
      paragraphs: [
        'Liderança consistente costuma ficar com bancos (Itaú, Bradesco, BB), Petrobras (cíclico ao petróleo) e Vale (cíclico ao minério). Entre as 50 maiores, encontramos seguradoras, energia, varejo, bebidas e indústria, mostrando diversidade setorial.',
        'Lucro alto sozinho não garante boa ação. Empresa com lucro de R$ 30 bilhões mas market cap de R$ 600 bilhões tem P/L de 20 (caro). Já lucro de R$ 5 bilhões com market cap de R$ 30 bilhões dá P/L de 6 (barato). Sempre cruze com market cap e P/L pra ver se o preço acompanha o tamanho do lucro.',
      ],
    },
    {
      h2: 'Limitações',
      paragraphs: [
        'Lucro pode ser inflado por itens não recorrentes (venda de ativos, créditos fiscais). Sempre olhe lucro recorrente vs lucro contábil no release. Investidor profissional foca no recorrente pra projetar capacidade de pagamento futura.',
        'Lucro contábil também pode divergir bastante de geração de caixa. Empresa com lucro alto mas capex alto e provisões pode estar queimando caixa enquanto o DRE diz que está indo bem. Cruze sempre com fluxo de caixa operacional e livre.',
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
      q: 'Qual empresa lucra mais no Brasil?',
      a: 'Tipicamente alterna entre Petrobras (em ciclos de petróleo alto) e Itaú Unibanco (estabilidade bancária). Em 2022-2023, a Petrobras chegou a R$ 180 bilhões de lucro anual, recorde absoluto da bolsa brasileira. Itaú gira na faixa de R$ 35-45 bilhões anuais, com crescimento mais previsível.',
    },
    {
      q: 'Lucro recorrente ou lucro contábil?',
      a: 'Pra projetar capacidade futura, foque no lucro recorrente (sem itens extraordinários). Pra calcular dividendos, use o lucro contábil (que é a base legal). Empresas costumam divulgar os dois no release trimestral. Diferenças grandes entre os dois exigem investigação.',
    },
    {
      q: 'Lucro por ação (LPA) ou lucro líquido total?',
      a: 'Pra comparar o tamanho da empresa, use lucro líquido total. Pra valuation por ação, use LPA (lucro líquido dividido pelo número de ações). Recompras de ações reduzem o número de ações em circulação e aumentam o LPA mesmo sem mudança no lucro total, sinal positivo pro acionista remanescente.',
    },
    {
      q: 'Como o lucro influencia dividendos?',
      a: 'Empresas distribuem uma parcela do lucro como dividendo (payout). No Brasil, payout entre 25-50 por cento é comum pra ações, e 95 por cento obrigatório pra FIIs. Bancos como BBAS3 e BBSE3 pagam acima de 60 por cento por terem caixa de sobra. Lucro estável + payout alto = dividendo previsível.',
    },
  ],
}

export default copy
