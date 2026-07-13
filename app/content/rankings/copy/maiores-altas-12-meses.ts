import type { RankingCopy } from '~/types/rankings'

const copy: RankingCopy = {
  answerFirst: '',
  educationalSections: [
    {
      h2: 'O que mostra esse ranking?',
      paragraphs: [
        'Lista as 50 ações e FIIs com maior valorização nos últimos 12 meses. É um ranking de performance simples mas poderoso, mostra quem ganhou momentum ao longo do ano. Ações no topo costumam refletir crescimento de lucro, melhora setorial, mudança regulatória favorável ou simplesmente entrada de fluxo institucional concentrada.',
        'Diferente do ranking mensal, o de 12 meses suaviza ruído de curto prazo. Uma ação que subiu 200 por cento em 30 dias pode ter sido pump especulativo. Uma ação que subiu 200 por cento em 12 meses tem mais chance de refletir mudança estrutural na empresa ou no setor.',
      ],
    },
    {
      h2: 'Como interpretar o ranking',
      paragraphs: [
        'Estratégia momentum: comprar ações que subiram muito no último ano com aposta de continuidade. Funciona bem em mercados com tendência clara, mas perigoso em viradas de ciclo. Backtests mostram que ações com forte momentum tendem a manter alta por 3-12 meses adicionais antes de retornar à média.',
        'Estratégia value contrarian: olhar a lista e EVITAR as primeiras posições, assumindo que a alta já precificou todo o bom da empresa e o risco de correção é alto. Mais prudente pra investidor de longo prazo, mas perde algumas das melhores oportunidades de continuação de alta.',
      ],
    },
    {
      h2: 'Limitações',
      paragraphs: [
        'Performance passada não garante performance futura. Ações que dobram em 12 meses podem cair 30-50 por cento no ano seguinte por reversão à média. Sempre cruze com fundamentos atuais (P/L, ROE, margem) pra ver se a alta foi sustentada por melhora operacional ou apenas expansão de múltiplo.',
        'Cuidado com small caps com pump artificial. Ações de baixa capitalização e baixa liquidez podem subir muito por movimentação concentrada de poucos players. Confira sempre o volume médio diário e a quantidade de cotistas antes de entrar em altas espetaculares.',
      ],
    },
  ],
  crossLinks: [
    { title: 'Calculadora de Preço Teto', desc: 'Calcule o preço justo de uma ação por Graham e Bazin.', href: '/calculadora/preco-teto' },
    { title: 'Calculadora de Dividend Yield', desc: 'Simule o DY real de qualquer ação ou FII.', href: '/calculadora/dividend-yield' },
    { title: 'Simulador de Ações', desc: 'Projete retorno total de uma carteira ao longo do tempo.', href: '/calculadora/acoes' },
    { title: 'Outros rankings', desc: 'Veja todos os rankings disponíveis na Redentia.', href: '/rankings' },
  ],
  faqItems: [
    {
      q: 'Comprar ações em alta funciona?',
      a: 'A estratégia momentum tem evidência acadêmica de funcionar no curto-médio prazo (3-12 meses). Mas tem volatilidade alta, pode dar prejuízos significativos em viradas de ciclo. Não recomendado como estratégia única, melhor combinar com filtros de qualidade e disciplina de stop loss.',
    },
    {
      q: 'O que faz uma ação subir muito em 12 meses?',
      a: 'Combinação de fatores: lucro crescendo acima do mercado, expansão de múltiplo (mercado paga mais por cada real de lucro), notícias positivas (aquisição, expansão, prêmio), mudança setorial (ciclo de commodities, política favorável), entrada de fluxo institucional. O melhor cenário combina lucro real + reconhecimento do mercado.',
    },
    {
      q: 'Como saber se uma alta vai continuar?',
      a: 'Não há fórmula garantida, mas indicadores ajudam: lucro crescendo no mesmo ritmo do preço (múltiplo estável), volume crescente em alta (confirmação institucional), ausência de divergências técnicas (preço subindo com força reduzindo). Cruze sempre com a tese fundamentalista da empresa.',
    },
    {
      q: 'Vale a pena vender ações em alta?',
      a: 'Depende da tese e do horizonte. Pra investidor buy and hold com tese sólida, mexer em alta tira você do composto de longo prazo. Pra investidor mais ativo, realização parcial (vender uma parte) em altas grandes faz sentido pra colher ganho e equilibrar risco. A regra de ouro é não deixar emoção decidir.',
    },
  ],
}

export default copy
