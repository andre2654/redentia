/**
 * Copy do /ranking/maiores-valor-mercado — EXEMPLAR do port (referência dos
 * outros 21). Texto VERBATIM da Redentia antiga
 * (Frontend/app/pages/ranking/[slug].vue, entrada 'maiores-valor-mercado'),
 * na MESMA ordem de tags. Única alteração permitida: " — " → vírgula.
 * Links re-mapeados: /asset/<t> → /acao/<t> · /auth/register → /login ·
 * /ranking (hub) → /rankings · /calculadora/* mantém.
 */
import type { RankingCopy } from '~/types/rankings'

const copy: RankingCopy = {
  answerFirst:
    'Valor de mercado (market cap) é o valor total que o mercado atribui a uma empresa = preço da ação × quantidade total de ações em circulação. Blue chips brasileiras têm market cap acima de R$ 50 bilhões (Petrobras, Vale, Itaú, Ambev, Bradesco), mid caps ficam entre R$ 5 bi e R$ 50 bi, e small caps abaixo de R$ 5 bi. Este ranking lista as 50 maiores empresas da B3 por capitalização.',

  educationalSections: [
    {
      h2: 'O que é Valor de Mercado (Market Cap)?',
      paragraphs: [
        'Valor de mercado, ou market cap, é o valor total que o mercado atribui a uma empresa listada na bolsa. A conta é simples: preço atual da ação multiplicado pela quantidade total de ações em circulação. Uma empresa com 1 bilhão de ações cotadas a R$ 30 tem valor de mercado de R$ 30 bilhões.',
        'O market cap é o jeito mais rápido de comparar o tamanho de empresas listadas e definir em qual segmento elas se encaixam. No Brasil, blue chips são as empresas com market cap acima de R$ 50 bilhões (Petrobras, Vale, Itaú, Ambev, Bradesco), mid caps ficam entre R$ 5 bilhões e R$ 50 bilhões, e small caps abaixo de R$ 5 bilhões.',
      ],
    },
    {
      h2: 'Como interpretar o ranking',
      paragraphs: [
        'Empresas no topo do ranking tendem a ser mais líquidas (volume de negociação alto), com cobertura mais ampla de analistas e menos volatilidade que small caps. Isso facilita entrada e saída sem mexer muito no preço, vantagem importante pra quem trabalha com posições maiores.',
        'Por outro lado, blue chips raramente entregam crescimento explosivo. Um banco que vale R$ 300 bilhões precisa criar muito valor pra dobrar de tamanho, enquanto uma small cap de R$ 1 bilhão pode dobrar com uma única boa execução. Isso se reflete em retornos esperados: blue chips são previsíveis, small caps oscilam mais.',
      ],
    },
    {
      h2: 'Limitações do market cap como métrica única',
      paragraphs: [
        'O market cap mostra tamanho, não qualidade. Uma empresa pode ser gigantesca e ainda assim ter resultado operacional ruim (margem comprimida, dívida alta, ROE baixo). Por isso, sempre cruze esse ranking com indicadores fundamentalistas: P/L, dividend yield, ROE e margem líquida (todos exibidos nas outras páginas de ranking).',
        'Outra limitação: o market cap não captura o valor da empresa do ponto de vista de quem compra a empresa inteira. Pra essa análise, use o EV (Enterprise Value), que soma a dívida líquida ao market cap. Empresas muito alavancadas tem EV bem maior que market cap, sinal de risco escondido.',
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
      title: 'Simulador de Ações',
      desc: 'Projete retorno total de uma carteira ao longo do tempo.',
      href: '/calculadora/acoes',
    },
    {
      title: 'Outros rankings',
      desc: 'Veja todos os rankings disponíveis na Redentia.',
      href: '/rankings',
    },
  ],

  faqItems: [
    {
      q: 'Qual é a maior empresa da bolsa brasileira em valor de mercado?',
      a: 'Em 2026, as três maiores empresas por market cap na B3 alternam entre Petrobras (PETR4), Vale (VALE3) e Itaú Unibanco (ITUB4), com valor de mercado tipicamente acima de R$ 400 bilhões cada uma. A ordenação varia conforme o preço do petróleo (Petrobras), do minério de ferro (Vale) e os resultados trimestrais dos bancos.',
    },
    {
      q: 'O que é blue chip e como diferenciar de small cap?',
      a: 'Blue chip é uma empresa grande, líquida e com resultado consolidado, geralmente com market cap acima de R$ 50 bilhões. Small cap tem market cap abaixo de R$ 5 bilhões e tende a ser mais volátil, menos líquida e com cobertura limitada de analistas. Mid caps ficam entre os dois, R$ 5-50 bilhões.',
    },
    {
      q: 'Vale a pena investir só nas maiores empresas?',
      a: 'Investir só em blue chips dá previsibilidade e liquidez, mas limita o potencial de crescimento. A literatura de mercado mostra que small caps superam blue chips no longo prazo, com mais volatilidade no caminho. O ideal é uma mistura conforme seu perfil: investidor conservador com 70-80% em blue chips, agressivo com 30-40% em small e mid caps.',
    },
    {
      q: 'Como o market cap muda ao longo do tempo?',
      a: 'O market cap muda diariamente porque o preço da ação muda. Mudanças na quantidade de ações (recompras, emissões, splits, bonificações) também afetam, mas são eventos pontuais. Acompanhar o ranking ao longo do tempo mostra quem está ganhando relevância no mercado e quem está perdendo.',
    },
  ],
}

export default copy
