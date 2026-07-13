import type { RankingCopy } from '~/types/rankings'

const copy: RankingCopy = {
  answerFirst: '',
  educationalSections: [
    {
      h2: 'O que é CAGR de receita?',
      paragraphs: [
        'CAGR (Compound Annual Growth Rate) é a taxa anual composta de crescimento, métrica que mostra o ritmo médio de expansão de uma variável (receita, lucro, patrimônio) num período de vários anos. A fórmula é simples: pegue o valor final, divida pelo valor inicial, eleve à potência de 1 dividido pelo número de anos e subtraia 1.',
        'No ranking, calculamos o CAGR da receita líquida dos últimos 5 anos a partir dos balanços anuais oficiais. Empresa que faturou R$ 10 bilhões em 2020 e R$ 20 bilhões em 2025 tem CAGR de aproximadamente 14,9 por cento ao ano. Isso suaviza ruídos de um ano específico e mostra tendência estrutural de expansão.',
      ],
    },
    {
      h2: 'Por que crescimento de receita importa?',
      paragraphs: [
        'Crescimento de receita é o motor primário de criação de valor. Sem novas vendas, não há mais lucro pra distribuir, não há mais caixa pra reinvestir e não há aumento de market share. Empresas com CAGR alto tendem a multiplicar valor de mercado no longo prazo, mesmo que o múltiplo (P/L, P/VPA) se mantenha estável.',
        'Investidores de growth investing buscam exatamente isso: empresas que crescem receita acima da média do setor, ganhando espaço de concorrentes. CAGR de 15 por cento ao ano sustentado por uma década dobra a receita aproximadamente a cada 5 anos, efeito de composição que muda escala da empresa por completo.',
      ],
    },
    {
      h2: 'Limitações: alto crescimento nem sempre vira lucro',
      paragraphs: [
        'Crescimento de receita não garante criação de valor. Empresa pode crescer 30 por cento ao ano queimando caixa, oferecendo descontos agressivos ou expandindo via aquisições caras sem sinergia. Sempre cruze CAGR de receita com margem líquida e ROE: o ideal é receita E margem subindo juntas.',
        'Outro ponto: empresas em fase inicial (small caps, tech) costumam crescer rapidamente da base baixa, mas desaceleram conforme amadurecem. CAGR de 30 por cento por 5 anos seguidos é raríssimo e geralmente envolve setores cíclicos, fusões ou efeito base. Use o ranking pra triagem, depois investigue qualidade do crescimento.',
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
      title: 'Simulador de Ações',
      desc: 'Projete retorno total de uma carteira ao longo do tempo.',
      href: '/calculadora/acoes',
    },
    {
      title: 'Maiores Receitas',
      desc: 'Ranking pelo tamanho absoluto da receita anual.',
      href: '/ranking/maiores-receitas',
    },
    {
      title: 'Outros rankings',
      desc: 'Veja todos os rankings disponíveis na Redentia.',
      href: '/rankings',
    },
  ],
  faqItems: [
    {
      q: 'O que é CAGR e como é calculado?',
      a: 'CAGR (Compound Annual Growth Rate) é a taxa anual composta de crescimento. Fórmula: (valor_final / valor_inicial)^(1/n_anos) - 1. Exemplo: empresa que faturou R$ 10 bi em 2020 e R$ 20 bi em 2025 (5 anos) tem CAGR de aproximadamente 14,87 por cento. Mostra ritmo médio anual de crescimento, suavizando volatilidade de cada ano.',
    },
    {
      q: 'Qual é uma boa taxa de crescimento de receita?',
      a: 'Depende muito do setor. Em geral, no Brasil, CAGR acima de 10 por cento ao ano já é considerado bom (acima da inflação histórica). Acima de 15 por cento sinaliza crescimento forte. Acima de 25 por cento é excepcional e geralmente vem com volatilidade. Em setores maduros (utilities, bancos), 5-8 por cento já é satisfatório.',
    },
    {
      q: 'Crescimento alto sempre é positivo?',
      a: 'Não automaticamente. Crescimento via aquisições caras pode destruir valor mesmo aumentando receita. Crescimento via descontos agressivos comprime margem e pode levar a prejuízo. Sempre cruze CAGR de receita com margem líquida estável ou crescente. O ideal é receita E rentabilidade subindo juntas, sinal de modelo escalável.',
    },
    {
      q: 'Como comparar empresas de setores diferentes?',
      a: 'Comparação justa só dentro do mesmo setor. Empresa de tecnologia crescendo 25 por cento ao ano é normal; banco crescendo 25 por cento ao ano é excepcional. Use os pares setoriais como benchmark. Cruze também com crescimento do PIB e do setor pra identificar quem está ganhando market share.',
    },
    {
      q: 'CAGR de 5 anos ou de 10 anos, qual é melhor?',
      a: 'CAGR de 5 anos mostra a fase atual da empresa (mais relevante pra decisão de hoje). CAGR de 10 anos mostra resiliência ao ciclo (atravessa pelo menos uma crise). Use 5 anos pra ranking comparativo e 10 anos pra validar consistência de longo prazo. Empresa boa tem CAGR positivo nos dois períodos.',
    },
  ],
}

export default copy
