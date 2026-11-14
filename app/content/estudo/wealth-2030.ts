/**
 * WEALTH 2030 — só o que o estudo traz.
 * Cada número visível mora num bloco com fonte (a que o documento nomeia).
 * Parágrafos não carregam dígito: o que é cifra entra em numero, nota ou citação.
 * Sem dizer o tamanho do arquivo. Sem recomendação de investimento. Sem cliente nomeado.
 */

export const WEALTH_PDF_PATH = '/estudo/wealth-2030.pdf'
export const WEALTH_PAGE_PATH = '/estudo/wealth-2030'
export const WEALTH_ORG_ID = 'https://www.redentia.com.br/#organization'
/** Colofão: levantamento encerrado em 13/08/2026. Edição de agosto de 2026. */
export const WEALTH_DATE_PUBLISHED = '2026-08-13'

export const WEALTH_DESCRIPTION =
  'Estudo independente sobre o futuro das assessorias, family offices e da gestão de patrimônio no Brasil. Não é recomendação de investimento.'

export const WEALTH_2030_PAGINA = {
  path: WEALTH_PAGE_PATH,
  title: 'WEALTH 2030',
  description: WEALTH_DESCRIPTION,
  lastmod: WEALTH_DATE_PUBLISHED,
}

export type Direcao = 'alta' | 'baixa' | 'nivel'

export interface Numero {
  valor: string
  /** Variação impressa junto do nível. A cor de alta ou queda vale para ela, não para o nível. */
  variacao?: string
  rotulo: string
  fonte: string
  secao: string
  direcao: Direcao
}

export interface Citacao {
  texto: string
  atribuicao: string
}

export interface BlocoParagrafos { tipo: 'p'; paragrafos: string[] }
export interface BlocoNumeros { tipo: 'numeros'; itens: Numero[] }
export interface BlocoCitacao { tipo: 'citacao'; citacao: Citacao }
export interface BlocoNota { tipo: 'nota'; texto: string; fonte: string }
export interface BlocoLista { tipo: 'lista'; itens: string[] }

export type Bloco = BlocoParagrafos | BlocoNumeros | BlocoCitacao | BlocoNota | BlocoLista

export interface Secao {
  id: string
  toc: string
  kicker: string
  titulo: string
  /** Obrigatória quando o título traz dígito. */
  tituloFonte?: string
  blocos: Bloco[]
}

export interface EstudoWealth {
  path: string
  pdfPath: string
  titulo: string
  titleSeo: string
  description: string
  dek: string
  eyebrow: string
  autor: string
  metaLinha: string
  aviso: string
  download: string
  datePublished: string
  breadcrumbs: { label: string; to: string }[]
  secoes: Secao[]
}

const n = (
  valor: string,
  rotulo: string,
  fonte: string,
  secao: string,
  direcao: Direcao,
  variacao?: string,
): Numero => ({ valor, rotulo, fonte, secao, direcao, ...(variacao ? { variacao } : {}) })

export const WEALTH_2030: EstudoWealth = {
  path: WEALTH_PAGE_PATH,
  pdfPath: WEALTH_PDF_PATH,
  titulo: 'WEALTH 2030',
  titleSeo: 'WEALTH 2030: o futuro das assessorias',
  description: WEALTH_DESCRIPTION,
  dek: 'O futuro das assessorias, family offices e gestão de patrimônio no Brasil.',
  eyebrow: 'Estudo independente · distribuição livre',
  autor: 'Redentia',
  metaLinha: 'Edição 01 · agosto de 2026. Levantamento encerrado em 13/08/2026. Fonte: capa e colofão do estudo.',
  aviso: 'Este texto segue o estudo. Não é recomendação de investimento, não indica compra, venda ou manutenção de valor mobiliário e não substitui o documento. Onde a evidência é fraca ou autorrelatada, está dito.',
  download: 'Baixar o PDF do estudo',
  datePublished: WEALTH_DATE_PUBLISHED,
  breadcrumbs: [
    { label: 'Início', to: '/' },
    { label: 'WEALTH 2030', to: WEALTH_PAGE_PATH },
  ],
  secoes: [
    {
      id: 'abertura',
      toc: 'Abertura',
      kicker: 'Abertura',
      titulo: 'Isto não é uma previsão.',
      blocos: [
        {
          tipo: 'p',
          paragrafos: [
            'É a descrição de uma coisa que já começou e ainda não foi nomeada.',
            'O wealth management brasileiro passou uma década crescendo por adição: mais assessores, mais escritórios, mais custódia, mais produto. O estudo descreve o fim desse ciclo. Não porque o mercado encolheu. Porque a variável que sustentava o crescimento parou de responder: o headcount, o fee e a permanência do cliente se descolaram da custódia.',
            'O documento reúne dados públicos verificáveis, das fontes que nomeia na abertura, e conversas de profundidade com profissionais brasileiros do setor. As teses, diz o texto, não são opiniões. São o que sobra quando as duas camadas se cruzam.',
            'Escreve para sócios e diretores de assessorias e consultorias, gestores de patrimônio, family offices e times de produto de plataformas. Quem decide onde o tempo da operação é gasto. A instrução de leitura do próprio estudo: todo número tem fonte nomeada. Onde a evidência é fraca ou inexistente, isso é dito.',
          ],
        },
        {
          tipo: 'nota',
          texto: 'As conversas de profundidade foram conduzidas entre junho e julho de 2026. As fontes públicas nomeadas na abertura são ANBIMA, CVM, ANCORD, B3, Banco Central, Deloitte, McKinsey, Capgemini, EY, BCG, UBS e Vanguard.',
          fonte: 'Abertura do estudo.',
        },
      ],
    },
    {
      id: 'panorama',
      toc: 'Panorama',
      kicker: 'Panorama',
      titulo: 'O crescimento parou de vir do lugar de onde vinha.',
      blocos: [
        {
          tipo: 'p',
          paragrafos: [
            'Os quatro indicadores que sustentaram a expansão do canal de distribuição entre o meio da década passada e o ano anterior ao fechamento do estudo — custódia, headcount, fee e retenção — se descolaram. A custódia continua subindo. Os outros três, não.',
            'O que ainda cresce, na leitura do estudo, é o substrato: há mais dinheiro, mais investidores e mais patrimônio para servir do que em qualquer momento anterior da série. O que parou foi a conversão desse substrato em receita por profissional.',
          ],
        },
        {
          tipo: 'numeros',
          itens: [
            n(
              'R$ 8,5 tri',
              'Investimentos de pessoa física no Brasil.',
              'ANBIMA, dezembro de 2025. Apêndice: “Investimento dos brasileiros cresce 15,5% e atinge R$ 8,5 trilhões em 2025”, fevereiro de 2026.',
              'Panorama · O estado do setor',
              'alta',
              '+15,5%',
            ),
            n(
              '+21,2%',
              'Varejo alta renda. R$ 3,13 tri. Maior alta do ano, no quadro do panorama.',
              'Panorama do estudo, no mesmo bloco do estoque de pessoa física. O quadro não nomeia outra instituição além da ANBIMA já citada para o agregado.',
              'Panorama · O estado do setor',
              'alta',
            ),
            n(
              '+2,8%',
              'Assessores vinculados, em doze meses.',
              'ANCORD, junho de 2026. Panorama do estudo.',
              'Panorama · O estado do setor',
              'alta',
            ),
            n(
              '+21,4%',
              'Consultores pessoa física na CVM, de abril de 2025 a março de 2026.',
              'Registro CVM. Panorama do estudo.',
              'Panorama · O estado do setor',
              'alta',
            ),
            n(
              '0,62%',
              'Fee médio sobre o AuM. Era 0,78% no início de 2025. A leitura do panorama registra queda de 16 pontos-base em um ano.',
              'Panorama do estudo (fee médio sobre AuM) e leitura dos oito números.',
              'Panorama · O estado do setor',
              'baixa',
            ),
            n(
              '28 meses',
              'Tempo de vida do cliente. Era 43 meses. Queda de 35%.',
              'Panorama do estudo. Apêndice: AAWZ Partners, Relatório Setorial Anual 2026 (lifetime).',
              'Panorama · O estado do setor',
              'baixa',
            ),
            n(
              '~70%',
              'Tempo do advisor em back-office. 30% com o cliente.',
              'Deloitte. Panorama do estudo e tese 01.',
              'Panorama · O estado do setor',
              'nivel',
            ),
            n(
              '6%',
              'Firmas com IA agêntica, contra 73% que usam IA de alguma forma.',
              'Deloitte Insights, Financial Services Predictions 2026. Panorama e tese 02.',
              'Panorama · O estado do setor',
              'nivel',
            ),
          ],
        },
      ],
    },
    {
      id: 'leitura',
      toc: 'A leitura',
      kicker: 'A leitura',
      titulo: 'O substrato cresce. A captura, não.',
      blocos: [
        {
          tipo: 'p',
          paragrafos: [
            'Quando o substrato cresce e a capacidade de capturá-lo estagna, o gargalo deixou de ser comercial e passou a ser operacional. É por isso, diz o estudo, que o texto começa pelo tempo, e não pela tecnologia.',
            'O que virou foi preço e retenção ao mesmo tempo. O que migrou foi o profissional: as consultorias registradas cresceram mais que as assessorias, com gente vindo diretamente da assessoria, e uma parte dos assessores ouvidos declara interesse em mudar de modelo.',
          ],
        },
        {
          tipo: 'numeros',
          itens: [
            n(
              'R$ 3,03 tri',
              'Custódia de renda fixa na B3, em dezembro de 2025.',
              'B3, dezembro de 2025. Apêndice: B3 / Bora Investir, base de investidores e custódia, dez/2025.',
              'Panorama · A leitura dos oito números',
              'nivel',
            ),
            n(
              '105,1 mi',
              'CPFs na base registrada. A própria B3 explica o salto pela inclusão de contas remuneradas e aplicações automáticas. Mede bancarização, não sofisticação.',
              'B3, dezembro de 2025. Leitura do panorama.',
              'Panorama · A leitura dos oito números',
              'nivel',
            ),
            n(
              'US$ 9 tri',
              'Fortuna a ser herdada no Brasil. Segundo país do mundo. Próximas duas décadas.',
              'UBS, Global Wealth Report 2025. Apêndice: transferência de riqueza no Brasil. Leitura do panorama.',
              'Panorama · A leitura dos oito números',
              'nivel',
            ),
            n(
              '+91%',
              'M&A entre escritórios em 2025, sobre 2024.',
              'Panorama do estudo. Apêndice: AAWZ Partners, Relatório Setorial Anual 2026 (M&A).',
              'Panorama · A leitura dos oito números',
              'alta',
            ),
            n(
              '85%',
              'Mortalidade das novas consultorias nos dois primeiros anos. O fechamento diz que as causas são comerciais e de escala, não tecnológicas.',
              'Panorama do estudo e seção “O que este estudo não diz”. O quadro não nomeia uma instituição.',
              'Panorama · A leitura dos oito números',
              'nivel',
            ),
            n(
              '66%',
              'Crescimento das consultorias registradas na CVM entre 2023 e 2025, contra 10% das assessorias.',
              'Leitura do panorama, como escrita. O parágrafo não nomeia a publicação.',
              'Panorama · A leitura dos oito números',
              'alta',
            ),
            n(
              '~93',
              'Novos consultores por mês. Um quarto deles vindo diretamente da assessoria.',
              'Leitura do panorama, como escrita. O parágrafo não nomeia a publicação.',
              'Panorama · A leitura dos oito números',
              'nivel',
            ),
            n(
              '53%',
              'Dos assessores ouvidos declaram interesse em migrar de modelo.',
              'Leitura do panorama, como escrita. O parágrafo não nomeia a publicação.',
              'Panorama · A leitura dos oito números',
              'nivel',
            ),
            n(
              '0,55%',
              'Prática de fee concentrada perto desse nível, líquido de rebates, contra 1% a 1,5% cinco anos atrás.',
              'Leitura do panorama: levantamento independente sobre R$ 100 bilhões em cerca de 15 mil carteiras. Apêndice: SmartBrain / CVM via Funds Society, maio de 2026. Amostra: cerca de R$ 100 bi em cerca de 15.000 carteiras, 43 empresas.',
              'Panorama · A leitura dos oito números',
              'baixa',
            ),
            n(
              '−1%',
              'Base ativa registrada na CVM. O apêndice registra 26.211 e contrasta com 27.203 credenciados na ANCORD em junho de 2026. Credenciado, vinculado e ativo não são o mesmo universo.',
              'Abertura do estudo e apêndice, conflitos de fonte declarados (registro CVM e ANCORD).',
              'Panorama · A leitura dos oito números',
              'baixa',
            ),
          ],
        },
      ],
    },
    {
      id: 'tese-01',
      toc: 'O tempo',
      kicker: 'O tempo',
      titulo: 'O assessor não vai desaparecer. O operacional vai.',
      blocos: [
        {
          tipo: 'p',
          paragrafos: [
            'A discussão sobre inteligência artificial substituir o assessor está mal formulada. O trabalho que a automação elimina não é o de aconselhar. É o de descobrir onde o dinheiro está.',
            'Quase ninguém no mercado brasileiro mede, num relatório só, quanto tempo uma operação de wealth gasta apenas para saber, com confiança, qual é a posição atual de cada cliente. O número está distribuído entre pessoas. A Deloitte quantificou a versão global do problema. Em campo, a descrição do ciclo é mais reveladora que o percentual: até um ponto do mês a equipe alimenta posições; no trecho seguinte, confere; a reunião com o cliente só acontece na segunda quinzena. Metade do mês acontece antes de qualquer conversa de investimento.',
            'O que quebra o ciclo não é a complexidade da análise. É o dado. Uma corretora deixa de enviar parte da posição, o patrimônio oscila sem explicação, e alguém para tudo para descobrir se o cliente sacou ou se o arquivo veio incompleto.',
          ],
        },
        {
          tipo: 'citacao',
          citacao: {
            texto: 'Gente perde quinze dias por mês. Poderia estar perdendo cinco.',
            atribuicao: 'Diretor técnico · consultoria fee-based multi-banco · jul/2026. Tese 01.',
          },
        },
        {
          tipo: 'nota',
          texto: 'O quadro do ciclo, em dias corridos, vai do dia 01 ao dia 10 (alimentar posição), do dia 10 ao dia 15 (conferir) e do dia 15 ao dia 30 (reuniões e decisão). 50% do mês acontece antes de qualquer conversa de investimento. Entrevista de campo, jul/2026. Ciclo autorrelatado, N = 1 operação.',
          fonte: 'Tese 01, quadro “Onde vai o mês de uma operação de wealth”.',
        },
        {
          tipo: 'p',
          paragrafos: [
            'A conta que um sócio faz não é sobre software. É sobre alocação de hora. A mesma pessoa, no mesmo dia, executa tarefas cujo valor econômico o estudo separa por uma ordem de grandeza. Não existe decisão de compra de tecnologia nesse mercado que não seja, no fundo, uma tentativa de mover horas de uma faixa para a outra.',
            'O teto de atendimento existe, e o BCG argumenta que ele não é operacional, é cognitivo: aproxima-se do número de relacionamentos significativos que uma pessoa consegue manter. O gargalo não é falta de gente. É falta de contexto disponível na hora certa.',
          ],
        },
        {
          tipo: 'citacao',
          citacao: {
            texto: 'No final da conta a nossa conta é hora. Cada hora que você me libera de operacional é uma hora que eu tenho pra estar na rua prospectando.',
            atribuicao: 'Sócio · assessoria ligada a grande plataforma · ~600 grupos de clientes · jul/2026. Tese 01.',
          },
        },
        {
          tipo: 'numeros',
          itens: [
            n(
              'R$ 500–1.000',
              'A hora diante do cliente. Estimativa da própria operação.',
              'Tese 01, economia da hora. Estimativa da operação entrevistada.',
              'Tese 01 · O tempo',
              'nivel',
            ),
            n(
              'R$ 20–50',
              'A hora conferindo extrato ou montando relatório.',
              'Tese 01, economia da hora. Estimativa da operação entrevistada.',
              'Tese 01 · O tempo',
              'nivel',
            ),
            n(
              '130–150',
              'Clientes por assessor. Benchmark americano. Teto acomodável de 200. O BCG argumenta que o teto é cognitivo, não operacional.',
              'Tese 01. Apêndice: WealthManagement.com, carga de clientes por assessor, julho de 2026. BCG, “AI and the New Economics of Wealth Management”, 2026.',
              'Tese 01 · O tempo',
              'nivel',
            ),
            n(
              '25% a 50%',
              'Do tempo do assessor que a IA agêntica pode liberar até 2032, na projeção da Deloitte. Ganho acumulado de produtividade de cerca de 32% em operações iniciantes e de até cerca de 103% em operações desenhadas em torno de IA.',
              'Deloitte. Tese 01, “O que isso significa para 2030”. Apêndice: Deloitte Insights, Financial Services Predictions 2026.',
              'Tese 01 · O tempo',
              'nivel',
            ),
            n(
              '3% a 5%',
              'De produtividade ao ano, segundo a McKinsey, quando se automatizam tarefas isoladas sem redesenhar o fluxo.',
              'McKinsey, citada na tese 01. Apêndice: McKinsey, “US wealth management in 2035”, 2025, e The State of AI.',
              'Tese 01 · O tempo',
              'nivel',
            ),
          ],
        },
        {
          tipo: 'nota',
          texto: 'A conclusão da tese: a ferramenta que economiza duas horas por semana não muda nada. A que devolve quinze dias por mês muda a estrutura de custo de uma empresa inteira. A variável não é o modelo de IA. É a arquitetura da operação.',
          fonte: 'Tese 01, “O que isso significa para 2030”.',
        },
      ],
    },
    {
      id: 'tese-02',
      toc: 'Contexto',
      kicker: 'Contexto',
      titulo: 'IA não é o diferencial. Contexto é.',
      blocos: [
        {
          tipo: 'p',
          paragrafos: [
            'Todo mundo tem acesso ao mesmo modelo. Ninguém tem acesso à mesma carteira, ao mesmo histórico tributário e à mesma conversa da última reunião. É aí que o valor se acumula.',
            'A adoção é quase universal. A utilidade, não. Um modelo de linguagem só é útil na medida em que recebe o contexto certo. Sem a carteira real, o histórico tributário, o mandato e a decisão do trimestre passado, ele produz respostas que parecem corretas. Em finanças, diz o estudo, isso é pior do que uma resposta errada.',
          ],
        },
        {
          tipo: 'numeros',
          itens: [
            n(
              '5%',
              'Das firmas de advisory têm IA integrada entre sistemas. O funil da Deloitte, em 2026: 73% usam IA de alguma forma e 6% usam ferramentas agênticas.',
              'Deloitte Insights, Financial Services Predictions 2026. Tese 02, “O funil que ninguém mostra”.',
              'Tese 02 · Contexto',
              'nivel',
            ),
            n(
              '41,7%',
              'Acurácia do melhor modelo no TaxCalcBench, benchmark de declaração fiscal completa e correta. Os melhores modelos acertam menos da metade dos casos. O estudo lê isso como falta de acesso estruturado à regra e ao histórico daquele contribuinte, não como falha de raciocínio.',
              'TaxCalcBench (Column Tax / Filed), 2025. Tese 02. Apêndice.',
              'Tese 02 · Contexto',
              'nivel',
            ),
            n(
              '66%',
              'Dos wealth managers citaram alucinação e imprecisão entre as preocupações. 95% da amostra já tinha três ou mais casos de uso de IA generativa em produção. Pesquisa da EY com cem gestoras de patrimônio e de ativos.',
              'EY, GenAI in Wealth & Asset Management Survey, março de 2025 (n = 100). Tese 02.',
              'Tese 02 · Contexto',
              'nivel',
            ),
            n(
              '32%',
              'A barreira mais citada por assessores na Accenture não foi o modelo. Foi confiabilidade de dados.',
              'Accenture, “Powering Wealth Management with Generative AI”, 2025 (n = 500 advisors). Tese 02.',
              'Tese 02 · Contexto',
              'nivel',
            ),
          ],
        },
        {
          tipo: 'citacao',
          citacao: {
            texto: 'Prompt engineering controla o estilo. Context engineering controla a substância. Soar certo não é a mesma coisa que estar certo.',
            atribuicao: 'Moody’s · “Beyond prompts: why enterprise AI demands context engineering” · set/2025. Tese 02.',
          },
        },
        {
          tipo: 'p',
          paragrafos: [
            'Numa operação entrevistada, uma funcionalidade de IA embarcada numa ferramenta de consolidação recomendou reduzir uma posição. Em termos absolutos, o rendimento ficava abaixo do referencial. O ativo era isento de imposto de renda. No bolso do cliente, o líquido equivalia a um rendimento bruto acima do referencial, e era uma das melhores posições da carteira. A IA não errou a matemática. Ela não tinha o contexto tributário.',
            'Uma recomendação errada por falta de contexto não custa uma correção. Custa a confiança de que qualquer recomendação futura possa ser aceita sem verificação manual. Isso devolve ao humano o trabalho que a ferramenta prometia eliminar.',
          ],
        },
        {
          tipo: 'numeros',
          itens: [
            n(
              '93% do CDI',
              'Rendimento da posição que a ferramenta sugeriu reduzir. Por ser isenta de imposto de renda, equivalia a aproximadamente 110% do CDI bruto.',
              'Tese 02, caso de campo. Operação entrevistada. Autorrelato.',
              'Tese 02 · Contexto',
              'nivel',
            ),
            n(
              '93%',
              'Dos assessores, numa pesquisa com 300 profissionais americanos, exigem palavra final sobre o output da IA. Apenas 8% aceitam rebalancear a carteira sem revisão humana.',
              'Tese 02. Apêndice: Advisor360°, 2026 Connected Wealth Report (n = 300 advisors).',
              'Tese 02 · Contexto',
              'nivel',
            ),
            n(
              '97%',
              'Das firmas ainda segmentam clientes primordialmente por faixa de patrimônio, segundo a Capgemini. É o mínimo que um modelo precisa e o máximo que a maioria consegue oferecer.',
              'Capgemini. Tese 02 e tese 04. Apêndice: World Wealth Report 2026.',
              'Tese 02 · Contexto',
              'nivel',
            ),
            n(
              '56%',
              'Dos relationship managers dizem que suas firmas não têm as ferramentas necessárias para a próxima geração de clientes de alto patrimônio. Cerca de 25% planejam trocar de firma ou abrir o próprio negócio.',
              'Capgemini. Tese 02. Apêndice: World Wealth Report 2026 (n = 6.510 HNWIs, 1.317 RMs, 144 executivos) e “Capturing HNWI loyalty across generations”, maio de 2026.',
              'Tese 02 · Contexto',
              'nivel',
            ),
          ],
        },
        {
          tipo: 'citacao',
          citacao: {
            texto: 'O problema aqui é a padronização. Hoje eu uso de um jeito, o outro lá usa do outro. Não é linear as respostas.',
            atribuicao: 'Sócio · assessoria ligada a grande plataforma · jul/2026. Tese 02.',
          },
        },
        {
          tipo: 'p',
          paragrafos: [
            'Uma operação de conselho vende consistência. Se dois assessores da mesma casa produzem diagnósticos diferentes para carteiras equivalentes porque escreveram prompts diferentes, a IA não aumentou a capacidade da firma. Aumentou o risco dela. Usar IA é individual, informal e não auditável. Ter IA, no argumento do estudo, significa que o contexto está disponível de forma idêntica para qualquer pessoa da operação, e que a resposta é a mesma independentemente de quem pergunta.',
          ],
        },
      ],
    },
    {
      id: 'tese-03',
      toc: 'Interface',
      kicker: 'Interface',
      titulo: 'A próxima geração de wealth não vai trabalhar em dashboards.',
      blocos: [
        {
          tipo: 'p',
          paragrafos: [
            'Dashboard é tecnologia de escassez: quando processar dados era caro, mostrava-se tudo e o humano procurava. Essa restrição acabou. O dashboard responde “como está” para quem já sabe o que procurar. Não responde o que mudou, o que isso significa para este cliente nem o que fazer agora.',
            'Em campo, profissionais abrem dois ou três relatórios ao mesmo tempo e reconstroem mentalmente a visão que nenhum sistema entrega. O trabalho real é a síntese que vem depois, feita à mão, por alguém cuja hora o estudo já precificou na tese do tempo. O dashboard não eliminou o trabalho. Terceirizou-o para o cérebro do usuário e chamou isso de visualização.',
          ],
        },
        {
          tipo: 'citacao',
          citacao: {
            texto: 'Eu tenho que olhar dois relatórios distintos e imaginar como seria isso junto.',
            atribuicao: 'Sócio · multi-family office em transição para gestora CVM · jul/2026. Tese 03.',
          },
        },
        {
          tipo: 'nota',
          texto: 'O quadro do deslocamento da interface descreve três gerações. A planilha, até hoje, responde “quanto tem?” e o trabalho acontece na cabeça do operador. O dashboard, de 2015 a 2026, responde “como está?” e o trabalho fica na leitura e na síntese do usuário. O agente, de 2026 em diante, responderia “o que mudou e o que fazer?”, com o trabalho no sistema, sob revisão. A síntese do estudo avisa: a linha do agente é projeção, não estado atual de mercado.',
          fonte: 'Tese 03, quadro “O deslocamento da interface · 2015 → 2030”.',
        },
        {
          tipo: 'numeros',
          itens: [
            n(
              '98%',
              'Dos times de assessores do Morgan Stanley usavam o assistente interno, segundo o que a casa reportou em 2024. Um assessor descreveu a ferramenta de anotação como meia hora por reunião economizada.',
              'Morgan Stanley, press releases sobre AI @ Morgan Stanley Assistant e Debrief, 2024. Tese 03. Apêndice.',
              'Tese 03 · Interface',
              'nivel',
            ),
            n(
              '95%',
              'Mais rápido: assessores do JPMorgan encontram informação até esse patamar, no que a casa reportou em 2025. A projeção citada é expansão de 50% na carteira por assessor em três a cinco anos.',
              'Reuters, JPMorgan Coach AI, maio de 2025. Tese 03. Apêndice.',
              'Tese 03 · Interface',
              'alta',
            ),
            n(
              '40%',
              'Mais de 40% dos projetos vendidos como agente serão cancelados até o fim de 2027, na projeção do Gartner. A tese 08 acrescenta que apenas cerca de 130 fornecedores, entre milhares, são realmente agênticos.',
              'Gartner, previsões sobre IA agêntica, junho de 2025. Tese 03 e tese 08. Apêndice.',
              'Tese 03 · Interface',
              'nivel',
            ),
          ],
        },
        {
          tipo: 'p',
          paragrafos: [
            'Nenhum desses ganhos, diz o estudo, veio de um painel melhor. A direção do movimento não está em disputa. Está em execução nas maiores instituições. A ressalva fica de pé: a maior parte do que hoje se vende como agente ainda é interface nova sobre arquitetura antiga.',
          ],
        },
      ],
    },
    {
      id: 'tese-04',
      toc: 'O cliente',
      kicker: 'O cliente',
      titulo: 'O cliente não quer mais informação. Quer interpretação.',
      blocos: [
        {
          tipo: 'p',
          paragrafos: [
            'Informação virou commodity gratuita e abundante. O que continua escasso, e o que o cliente continua pagando, é alguém que diga o que aquilo significa para a vida dele. A pergunta que um cliente faz não é qual foi a rentabilidade. É uma versão de: não entregou nos últimos meses, o que dá para mexer? A diferença entre as duas é a diferença entre um relatório e um serviço.',
            'Simular cenário de rebalanceamento antes de uma conversa é a atividade de maior valor percebido pelo cliente e, ao mesmo tempo, uma das que mais consome tempo. É trabalho de conselho travado por trabalho de dado.',
          ],
        },
        {
          tipo: 'citacao',
          citacao: {
            texto: 'Vou ter que simular antes pra fazer, né?',
            atribuicao: 'Diretor técnico · consultoria fee-based multi-banco · jul/2026. Tese 04.',
          },
        },
        {
          tipo: 'numeros',
          itens: [
            n(
              '10% a 20%',
              'Do tempo de um profissional em épocas de rebalanceamento, gasto em simular cenário antes da conversa, segundo uma das operações entrevistadas.',
              'Tese 04. Entrevista de campo. Autorrelato de uma operação.',
              'Tese 04 · O cliente',
              'nivel',
            ),
            n(
              '17%',
              'Dos HNWIs relatam experiência fluida e personalizada. No mesmo quadro, 97% das firmas ainda segmentam clientes só por faixa de patrimônio.',
              'Capgemini World Wealth Report 2026 e “Capturing HNWI loyalty across generations”, maio de 2026. Pesquisa com 6.510 HNWIs e 144 executivos em 10 mercados. Tese 04.',
              'Tese 04 · O cliente',
              'nivel',
            ),
            n(
              '81%',
              'Dos herdeiros de alto patrimônio planejam trocar a firma dos pais. 46% deles citam a falta dos canais digitais preferidos. O motivo mais citado não é performance nem preço.',
              'Capgemini, mesmas fontes da tese 04. O país da transferência de US$ 9 tri é o do UBS Global Wealth Report 2025, já citado na leitura do panorama.',
              'Tese 04 · O cliente',
              'nivel',
            ),
            n(
              '73%',
              'Dos investidores usam IA para explorar decisões financeiras. 86% entre a Gen Z e 82% entre quem tem mais de US$ 2 milhões. Apenas 12% citam a IA como o fator mais influente na última decisão. Nos Estados Unidos, 7%.',
              'HSBC com Ipsos, “The Trust Threshold”, início de 2026. N = 9.993 investidores em dez países. Tese 04.',
              'Tese 04 · O cliente',
              'nivel',
            ),
            n(
              '37%',
              'Apontam um profissional como fator mais influente na decisão final. 62% o citam como principal fonte de ideias. 50% preferem modelo híbrido. Entre a Gen Z, 56%. 80% valorizam a tranquilização. 72% valorizam expertise estratégica.',
              'HSBC / Ipsos, 2026, mesma pesquisa da tese 04.',
              'Tese 04 · O cliente',
              'nivel',
            ),
            n(
              '~3%',
              'Em retorno líquido: o valor do bom aconselhamento, na medida da Vanguard ao longo de uma década. A gestora ressalva que o ganho não se realiza de forma anual e regular. O componente mais valioso, 150 pontos-base, é behavioral coaching.',
              'Vanguard, Advisor’s Alpha. Tese 04. Apêndice.',
              'Tese 04 · O cliente',
              'nivel',
            ),
            n(
              '1,82%',
              'Ao ano, por outro caminho (decisões de planejamento, ordem de saque e alocação de riqueza total), na conta da Morningstar. O estudo equivale isso a 29% a mais de renda na aposentadoria.',
              'Morningstar, Gamma (Blanchett e Kaplan). Tese 04. Apêndice.',
              'Tese 04 · O cliente',
              'nivel',
            ),
            n(
              '88%',
              'Dos clientes com assessor humano relatam paz de espírito, contra 69% entre os atendidos por serviço digital. A redução de emoções negativas é de 79% contra 57%.',
              'Vanguard, “The emotional and time value of advice”, 2025 (n = 12.443). Tese 04. Apêndice.',
              'Tese 04 · O cliente',
              'nivel',
            ),
            n(
              '14%',
              'Da Gen Z procuraria um profissional como primeira fonte de conselho financeiro, contra 39% dos boomers. 76% busca conselho online ou em redes sociais. A demanda por aconselhamento holístico saltou de 29% para 52% entre 2018 e 2023.',
              'McKinsey, citada na tese 04. Apêndice: “US wealth management in 2035”, 2025.',
              'Tese 04 · O cliente',
              'nivel',
            ),
          ],
        },
        {
          tipo: 'citacao',
          citacao: {
            texto: 'Clientes usam cada vez mais IA para explorar suas opções, mas na hora de decidir eles valorizam julgamento, contexto e responsabilidade vindos de um assessor em quem confiam.',
            atribuicao: 'Barry O\'Byrne · CEO, International Wealth & Premier Banking, HSBC · jun/2026. Tese 04.',
          },
        },
        {
          tipo: 'citacao',
          citacao: {
            texto: 'Tudo que eu busco são soluções que me liberem tempo de operacional e me coloquem mais tempo cara a cara com o meu cliente.',
            atribuicao: 'Sócio · assessoria ligada a grande plataforma · jul/2026. Tese 04.',
          },
        },
        {
          tipo: 'p',
          paragrafos: [
            'O que o cliente compra do humano não é cálculo. É julgamento sob incerteza e responsabilidade por ele. A próxima geração, na leitura da McKinsey que o estudo reproduz, não rejeita o conselho. Rejeita o formato em que ele é entregue.',
          ],
        },
      ],
    },
    {
      id: 'tese-05',
      toc: 'Research',
      kicker: 'Research',
      titulo: 'Carteiras recomendadas ficam menos importantes. Teses ficam mais.',
      blocos: [
        {
          tipo: 'p',
          paragrafos: [
            'A carteira recomendada é um produto de distribuição em massa numa indústria que está se movendo para o oposto disso. Dois estudos brasileiros com dados abertos testaram a mesma pergunta: carteiras recomendadas por corretoras batem o mercado? As respostas convergem, e não são as que o material de marketing sugere.',
            'Isso não significa que research não tem valor. Significa que a carteira recomendada, como produto padronizado distribuído para milhares de perfis diferentes, não gera alfa estatisticamente detectável, e que o mercado precifica isso. O estudo descreve o research de varejo perdendo independência, a receita e a base de um player listado caindo, e corretoras distribuindo research de graça como isca de captação. O player não é nomeado no trecho.',
          ],
        },
        {
          tipo: 'numeros',
          itens: [
            n(
              '−4,8% a +3,7%',
              'Alfas de Jensen de 40 carteiras recomendadas de cinco instituições (XP, BTG, Itaú BBA, Santander e Ágora/Bradesco), contra o Ibovespa. Não se rejeitou a hipótese nula de alfa igual a zero. O Sharpe também não foi estatisticamente diferente de zero. Período 2020–2024.',
              'Sperry e Silva, 28º SemeAd (USP e UTFPR). Tese 05. Apêndice.',
              'Tese 05 · Research',
              'nivel',
            ),
            n(
              '28,6%',
              'De 14 carteiras recomendadas por corretoras brasileiras superaram a Selic no período completo, e 42,9% superaram o Ibovespa. Antes da pandemia, 85,7% e 64,3%. Período 2019–2022.',
              'Faveri e Netto (CEAVI/UDESC), Revista de Contabilidade e Controladoria (UFPR). Tese 05. Apêndice.',
              'Tese 05 · Research',
              'nivel',
            ),
            n(
              '−28,3%',
              'Queda de receita do player listado do setor no terceiro trimestre de 2023, contra o ano anterior. A base de assinantes caiu 11,6%. A margem bruta caiu de 39,1% para 24,4%.',
              'Tese 05, como escrita. O trecho não nomeia o player.',
              'Tese 05 · Research',
              'baixa',
            ),
          ],
        },
        {
          tipo: 'citacao',
          citacao: {
            texto: 'Tudo que você estudou na virada do ano foi tudo perdido. Você teve que tomar uma decisão no meio do caminho, ainda com guerra.',
            atribuicao: 'Diretor técnico · consultoria fee-based multi-banco · jul/2026. Tese 05.',
          },
        },
        {
          tipo: 'citacao',
          citacao: {
            texto: 'Os bancos montam fundos espelho, e não são todos os bancos que têm toda a grade. Tem que cadastrar essa grade de cada instituição e começar a comparar.',
            atribuicao: 'Diretor técnico · consultoria fee-based · tese 05.',
          },
        },
        {
          tipo: 'nota',
          texto: 'Uma frase de campo resume o incentivo: “essas são as dores hoje porque tem uma assimetria de informação ainda.” Research distribuído em massa, diz o estudo, não existe para reduzir assimetria. Existe para gerar giro. Quando a assimetria cai, o produto perde função.',
          fonte: 'Tese 05, “A assimetria que sustenta o modelo”.',
        },
        {
          tipo: 'p',
          paragrafos: [
            'O processo oficial de alocação é anual, estruturado e documentado. O processo real, descrito por quem executa, é outro. Quando o cenário vira duas vezes no mesmo ano, o valor não está na carteira publicada em janeiro. Está na capacidade de reavaliar rápido, com o patrimônio real do cliente na frente, e de explicar a mudança sem parecer improviso. Isso é tese. Não é carteira.',
            'O quadro da tese classifica acesso a produto e research de carteira recomendada como commodity. Uma resolução da CVM acabou com a exclusividade obrigatória, e multi-corretora virou padrão. Consolidação de posição está se comoditizando. Tese, enquadramento e execução sob restrição real seguem escassos. A implicação que o estudo tira: o material que uma assessoria publica não vai ser uma lista de ativos. Vai ser o registro auditável de como ela pensa.',
          ],
        },
        {
          tipo: 'nota',
          texto: 'O quadro está datado em 2026. A norma citada é a Resolução CVM 178/2023. A implicação prática que o estudo escreve vale para 2030.',
          fonte: 'Tese 05, quadro de camadas e fechamento do capítulo.',
        },
      ],
    },
    {
      id: 'tese-06',
      toc: 'Family offices',
      kicker: 'Family offices',
      titulo: 'O family office que continuar dependendo de planilhas vai pagar caro.',
      blocos: [
        {
          tipo: 'p',
          paragrafos: [
            'Não pelo custo do software. Pelo custo de ter a estrutura patrimonial de uma família inteira dependendo da memória de uma pessoa.',
            'O segmento cresceu e barateou o ticket de entrada. Não barateou a operação. O patrimônio do cliente brasileiro não está numa classe só. Está espalhado, e boa parte dele nem é financeiro: imóveis, participações, holding, offshore, ilíquidos. No sistema de uma das operações, imóveis não são rastreados. A parte não financeira vive em planilha, pasta, e-mail ou na cabeça de alguém.',
          ],
        },
        {
          tipo: 'citacao',
          citacao: {
            texto: 'O perfil do brasileiro é imobilizado. Você tem que olhar o patrimônio como um todo, né?',
            atribuicao: 'Diretor técnico · consultoria fee-based multi-banco · jul/2026. Tese 06.',
          },
        },
        {
          tipo: 'numeros',
          itens: [
            n(
              '146',
              'Family e multifamily offices no Brasil em 2023. Eram 80 em 2020. Patrimônio sob gestão de R$ 263 bilhões para R$ 457,7 bilhões.',
              'ANBIMA, via Capital Aberto. Tese 06. Apêndice: family offices no Brasil, 2020–2023. Dado consolidado mais recente citado no estudo.',
              'Tese 06 · Family offices',
              'alta',
            ),
            n(
              'R$ 1 mi',
              'Ou menos: ticket mínimo de um multifamily office, vindo de R$ 10–15 milhões.',
              'Tese 06, como escrita.',
              'Tese 06 · Family offices',
              'baixa',
            ),
            n(
              '35%',
              'Dos family offices no mundo têm plano de sucessão definido para a própria estrutura. 27% educam a próxima geração de forma estruturada. Patrimônio familiar médio da amostra: US$ 2,7 bilhões.',
              'UBS Global Family Office Report 2026. Apêndice: 307 family offices, mais de 30 mercados. Tese 06.',
              'Tese 06 · Family offices',
              'nivel',
            ),
            n(
              '8.030',
              'Single family offices no mundo, alta de 31% sobre 2019, com US$ 3,1 trilhões sob gestão. Projeção: 10.720 até 2030, com US$ 5,4 trilhões. A América do Sul responde por 190.',
              'Deloitte Private, “Defining the Family Office Landscape”, 2024 e projeção 2030. Tese 06. Apêndice.',
              'Tese 06 · Family offices',
              'alta',
              '+31%',
            ),
            n(
              '95%',
              'Da receita consumida por folha num family office entrevistado, com cerca de R$ 400 milhões sob gestão, entre oito e nove famílias, e take rate estimado em 0,4% ao ano.',
              'Tese 06, “A conta que não fecha”. Autorrelato da operação entrevistada.',
              'Tese 06 · Family offices',
              'nivel',
            ),
            n(
              '5 a 15 dias',
              'Para consolidar um cliente novo, em todas as instituições. Documento de preparação de reunião: até 1,5 dia por cliente. Relatório final: 1 a 2 dias por cliente. Ciclo mensal de ingestão e conferência: 15 dias.',
              'Entrevistas de campo, junho a julho de 2026. Valores autorrelatados por 3 operações. Tese 06.',
              'Tese 06 · Family offices',
              'nivel',
            ),
            n(
              '~50%',
              'De dependência de Excel em times investment-led, no dado global mais próximo. O estudo avisa: a amostra é de clientes de software, enviesada por definição. Não existe pesquisa brasileira que meça quantos family offices dependem de planilha. Trata-se como padrão observado em campo, não como estatística.',
              'Tese 06, nota de honestidade.',
              'Tese 06 · Family offices',
              'nivel',
            ),
          ],
        },
        {
          tipo: 'nota',
          texto: 'O estudo faz a conta da linha do meio: um documento de preparação de até um dia e meio, numa carteira de cem a cento e cinquenta clientes atendidos uma vez por ano, ocupa quinze a vinte dias por mês de um profissional em tempo integral. O relatório final consome outros dez a vinte. Dobrar a frequência de contato, que é o que o cliente pede, faz a conta deixar de caber no calendário.',
          fonte: 'Tese 06, a partir do ciclo autorrelatado.',
        },
        {
          tipo: 'p',
          paragrafos: [
            'A planilha, na leitura do estudo, não é um problema de eficiência. É um problema de governança. Quando a visão consolidada existe apenas no arquivo de uma pessoa, a operação tem risco de pessoa-chave sobre o ativo mais sensível que administra, e não tem trilha de auditoria de como cada número chegou ali. Quando a operação inteira depende de trabalho manual, revisar custa exatamente o mesmo que fazer.',
          ],
        },
      ],
    },
    {
      id: 'tese-07',
      toc: 'Infraestrutura',
      kicker: 'Infraestrutura',
      titulo: 'A consolidação patrimonial vai deixar de ser diferencial e virar infraestrutura.',
      blocos: [
        {
          tipo: 'p',
          paragrafos: [
            'Quando todas as soluções entregam o mesmo resultado, o resultado deixa de ser produto. Vira insumo, e o valor migra uma camada acima. A frase mais direta, diz o estudo, não veio de um analista. Veio do fundador de uma das maiores plataformas de consolidação do Brasil, sobre o próprio produto.',
          ],
        },
        {
          tipo: 'citacao',
          citacao: {
            texto: 'em termos de consolidação, o resultado de todas as soluções é o mesmo.',
            atribuicao: 'Fundador de uma das maiores plataformas de consolidação do Brasil, sobre o próprio produto. Tese 07. O estudo liga a frase a quem tem R$ 210 bilhões em 300 mil carteiras na plataforma.',
          },
        },
        {
          tipo: 'citacao',
          citacao: {
            texto: 'hoje cada banco tem a sua integração. Quando o Open Finance começar a funcionar, vai ser tudo padronizado.',
            atribuicao: 'Mesma fala, tese 07, sobre por que o processo ainda é caro.',
          },
        },
        {
          tipo: 'numeros',
          itens: [
            n(
              'R$ 210 bi',
              'SmartBrain: 300 mil ou mais carteiras, 450 ou mais clientes, 300 mil extratos por dia. US$ 10 milhões do inovaBra Ventures (Bradesco). Mira aquisições.',
              'Tese 07, quadro de plataformas e movimento de consolidação.',
              'Tese 07 · Infraestrutura',
              'nivel',
            ),
            n(
              '70 mil+',
              'Usuários da Comdinheiro, com 1 milhão ou mais de consultas por mês. Adquirida pela Nelogica em fevereiro de 2022.',
              'Tese 07, quadro de plataformas. Apêndice: BM&C News, Nelogica/Comdinheiro, fev/2022.',
              'Tese 07 · Infraestrutura',
              'nivel',
            ),
            n(
              'R$ 72 mi',
              'Valor pelo qual o BTG adquiriu a Kinvo em março de 2021. A Kinvo tinha 700 mil ou mais usuários e R$ 100 bi ou mais cadastrados.',
              'Tese 07, quadro de plataformas. Apêndice: Seu Dinheiro, BTG/Kinvo, mar/2021.',
              'Tese 07 · Infraestrutura',
              'nivel',
            ),
            n(
              'R$ 100 mi',
              'Captados pelo Gorila (Iporanga, Ribbit, monashees). 100 escritórios e 500 mil usuários de varejo.',
              'Tese 07, quadro de plataformas. Apêndice: NeoFeed, Gorila.',
              'Tese 07 · Infraestrutura',
              'nivel',
            ),
            n(
              '400+',
              'Clientes da BRITech em 22 países. Três aquisições: Atatika, Cyrnel e ABS.',
              'Tese 07, quadro de plataformas. Apêndice: Finsiders Brasil.',
              'Tese 07 · Infraestrutura',
              'nivel',
            ),
            n(
              'R$ 300 bi+',
              'Sob custódia na Vórtx. R$ 190 milhões da FTV Capital e aporte na Investtools.',
              'Tese 07, quadro de plataformas. Apêndice: Finsiders Brasil.',
              'Tese 07 · Infraestrutura',
              'nivel',
            ),
            n(
              '154 mi',
              'Consentimentos ativos de Open Finance em fevereiro de 2026. Mais de 100 milhões de clientes conectados. O apêndice registra também 128 milhões em janeiro de 2026, em fonte diferente.',
              'Tese 07. Apêndice: Open Finance Brasil / Banco Central via Finsiders, e conflitos de fonte (128 milhões em jan/2026 e 154 milhões em fev/2026).',
              'Tese 07 · Infraestrutura',
              'nivel',
            ),
            n(
              '29×',
              'Crescimento da camada de dados de investimentos no ano encerrado em dezembro de 2024, até 1,81 bilhão de chamadas de API. A participação saiu de 1% para 17% do ecossistema. A camada está no ar desde outubro de 2023. Renda fixa bancária é 75% do volume.',
              'Open Finance Brasil / análise BIP, via Finsiders. Tese 07, quadro de dezembro de 2023 a dezembro de 2024.',
              'Tese 07 · Infraestrutura',
              'alta',
            ),
            n(
              '76,8%',
              'Dos brasileiros conhecem o Open Finance. Apenas 37,1% autorizaram compartilhamento. Menos de 10% dos consentimentos ativos envolvem pessoa jurídica. O estudo situa o Brasil à frente de 78 países com regulação.',
              'Tese 07, citando o Banco Central no desafio de converter conhecimento em uso.',
              'Tese 07 · Infraestrutura',
              'nivel',
            ),
          ],
        },
        {
          tipo: 'citacao',
          citacao: {
            texto: 'Você precisa de uma API pra navegar lá dentro. E [a plataforma] não dá essa API.',
            atribuicao: 'Sócio · assessoria · jul/2026. Tese 07. A coleta segue manual mesmo numa operação com centenas de grupos e uma equipe de vinte e duas pessoas.',
          },
        },
        {
          tipo: 'citacao',
          citacao: {
            texto: 'Renda fixa via Open Finance é horrível. São IDs que não dizem respeito a nada.',
            atribuicao: 'Equipe técnica · operação de integração de dados · jul/2026. Tese 07.',
          },
        },
        {
          tipo: 'p',
          paragrafos: [
            'O padrão existe, mas a identificação de ativos de renda fixa exige uma camada própria de de-para. Justamente a classe que representa a maior parte do que trafega. O resultado, na frase do capítulo, é um paradoxo: a infraestrutura de compartilhamento mais ampla do mundo está de pé, e o profissional que mais precisaria dela ainda faz login manual.',
            'Uma operação entrevistada usava uma ferramenta de consolidação que foi comprada por um banco e retirada do mercado. O relatório mensal voltou a ser feito à mão. Para quem vende, aquisição é validação. Para quem usa, é risco de descontinuidade.',
            'A conclusão do capítulo: consolidar patrimônio deixa de ser um produto que alguém vende e passa a ser uma expectativa, como extrato bancário e nota de corretagem. O diferencial estará no que se faz com o dado depois de consolidado.',
          ],
        },
        {
          tipo: 'nota',
          texto: 'O estudo data essa conclusão em 2030.',
          fonte: 'Tese 07, fechamento do capítulo.',
        },
      ],
    },
    {
      id: 'tese-08',
      toc: 'Protocolo',
      kicker: 'Protocolo',
      titulo: 'MCP e agentes: a nova camada de infraestrutura financeira.',
      blocos: [
        {
          tipo: 'p',
          paragrafos: [
            'Nos últimos vinte meses um protocolo saiu do zero e virou padrão de fato para conectar modelos de IA a sistemas reais. O setor financeiro brasileiro, diz o estudo, ainda não reagiu.',
            'Uma integração tradicional conecta sistema a sistema: alguém escreve o código, define os campos e mantém o contrato. Um servidor MCP expõe capacidades para que um agente as descubra e use, sem que ninguém tenha antecipado a pergunta. É a diferença, na imagem do estudo, entre construir uma esteira e construir uma porta.',
          ],
        },
        {
          tipo: 'nota',
          texto: 'O Model Context Protocol foi lançado pela Anthropic em novembro de 2024. A OpenAI adotou em março de 2025. O Google DeepMind, em abril. Em dezembro de 2025 o protocolo foi doado à Agentic AI Foundation, sob a Linux Foundation, cofundada com Block e OpenAI, com apoio de AWS, Google, Microsoft, Cloudflare, GitHub e Bloomberg.',
          fonte: 'Tese 08. Apêndice: Anthropic / Linux Foundation, 2024–2026.',
        },
        {
          tipo: 'numeros',
          itens: [
            n(
              '~97 mi',
              'Downloads mensais dos SDKs, Python e TypeScript.',
              'Anthropic, dezembro de 2025. Tese 08.',
              'Tese 08 · Protocolo',
              'nivel',
            ),
            n(
              '10.000+',
              'Servidores MCP públicos.',
              'Anthropic, dezembro de 2025. Tese 08.',
              'Tese 08 · Protocolo',
              'nivel',
            ),
            n(
              '15.926',
              'Repositórios no GitHub com o tópico mcp-server.',
              'GitHub API, maio de 2026. Tese 08. Apêndice.',
              'Tese 08 · Protocolo',
              'nivel',
            ),
            n(
              '41%',
              'Das organizações com MCP em produção. A nota do quadro é 29% mais 12% em uso amplo.',
              'Stacklok, 2026. Tese 08. Apêndice.',
              'Tese 08 · Protocolo',
              'nivel',
            ),
            n(
              '0',
              'Casos públicos de gestor de patrimônio expondo dados via MCP, no Brasil ou no mundo, no levantamento do estudo. O mapa cita Griffin (Reino Unido, 2025, beta), Grasshopper Bank (EUA, agosto de 2025, leitura), Coinbase (setembro de 2025, leitura e escrita), Nymbus (abril de 2026, 19 ferramentas de core banking) e Visa (março de 2026, 21 parceiros emissores em teste na Europa).',
              'Open Banking Tracker. Levantamento conduzido em agosto de 2026. Tese 08. Apêndice.',
              'Tese 08 · Protocolo',
              'nivel',
            ),
            n(
              'R$ 4 mil',
              'Por mês, por uma ferramenta de dados, achado caro demais por uma operação que administra centenas de milhões. O terminal profissional que a mesma operação gostaria de ter custa cerca de US$ 2.500 por mês. Ferramentas de IA para assessores nos EUA cobram cerca de US$ 100 por usuário por mês. A outra âncora é a hora do assessor na rua, a R$ 500.',
              'Tese 08, “A economia da decisão de compra”.',
              'Tese 08 · Protocolo',
              'nivel',
            ),
          ],
        },
        {
          tipo: 'citacao',
          citacao: {
            texto: 'Todo mundo está tentando criar a sua própria solução, nem que seja caseira.',
            atribuicao: 'Síntese de devolutiva com sócios de MFO e assessoria · jul/2026. Tese 08.',
          },
        },
        {
          tipo: 'p',
          paragrafos: [
            'Nas operações entrevistadas, o estudo descreve transcrição integral de reuniões para o CRM, vertical de tecnologia própria, ferramenta contratada fora e duas tentativas de um escritório de contabilidade de holdings. A contradição que o texto destaca: o responsável por uma consultoria de cinco pessoas respondeu que não tem massa crítica para automatizar nada. Quem tem engenheiro constrói. Quem não tem, espera, e enquanto espera continua no ciclo manual da primeira tese.',
            'O quadro da tese compara o modelo atual com o modelo agêntico. No atual, o acesso ao dado é login, download e planilha. A pergunta é humana, uma por vez. O desvio aparece no fechamento do mês. O custo do cliente seguinte é quase linear. O diferencial é ter o dado. No modelo agêntico, a capacidade fica exposta, o agente pergunta sob supervisão, o desvio aparece quando ocorre, o custo do cliente seguinte tende a zero na camada de dado, e o diferencial passa a ser contexto e julgamento.',
            'A ressalva está no mesmo capítulo: a distância entre o protocolo existir e uma assessoria brasileira colher valor dele ainda se mede em anos, não em trimestres.',
          ],
        },
      ],
    },
    {
      id: 'tese-09',
      toc: 'O sinal',
      kicker: 'O sinal',
      titulo: 'Por que a Decade é um sinal de mudança, não apenas mais uma fintech.',
      blocos: [
        {
          tipo: 'p',
          paragrafos: [
            'O que importa, diz o estudo, não é o produto. É o que a rodada revela sobre onde o capital global acha que o valor vai se acumular no wealth brasileiro. Nenhuma parte do capítulo é endosso.',
            'Os fundadores explicam parte do cheque, não a tese. Vitor Olivier entrou no Nubank como engenheiro inicial e saiu como CTO após doze anos. Felipe Meneses foi o primeiro brasileiro Thiel Fellow e fundou a Hyperplane, depois adquirida pelo Nubank. A tese, no texto, está no que a empresa escolheu não ser: não é custodiante e é agnóstica de plataforma; não é robo-advisor puro e tem consultor humano sênior por WhatsApp e vídeo; não cobra sobre patrimônio no produto de entrada; não nasceu para o topo da pirâmide.',
          ],
        },
        {
          tipo: 'nota',
          texto: 'As plataformas nomeadas na integração são BTG, XP, Genial e C6. A Hyperplane foi adquirida pelo Nubank em 2024.',
          fonte: 'Tese 09, o que a Decade não é.',
        },
        {
          tipo: 'numeros',
          itens: [
            n(
              'US$ 85 mi',
              'Rodada seed anunciada com a saída de stealth em 4 de agosto de 2026. Cerca de R$ 440 milhões. Descrita como a maior seed já levantada por uma startup latino-americana. Greenoaks liderou, com Benchmark, Diffusion, Atlantico e Norte Ventures. A rodada havia sido fechada em setembro de 2025 e ficou onze meses em silêncio.',
              'Tese 09. Apêndice: Business Wire, Bloomberg Línea, InfoMoney, Fintech Global, The Next Web e Brazil Journal, agosto de 2026.',
              'Tese 09 · O sinal',
              'nivel',
            ),
            n(
              '26',
              'Funcionários no anúncio. 8 executivos, com passagem por Nubank, XP e BTG.',
              'Tese 09, quadro do anúncio.',
              'Tese 09 · O sinal',
              'nivel',
            ),
            n(
              'R$ 200/mês',
              'Preço ao cliente no plano anual, com consultor dedicado. O produto lançado ao público estava em beta, com lista de espera. O premium existe, mas só por convite.',
              'Tese 09, preço ao cliente no plano anual.',
              'Tese 09 · O sinal',
              'nivel',
            ),
          ],
        },
        {
          tipo: 'citacao',
          citacao: {
            texto: 'Serviços financeiros são complexos por design e frequentemente monetizados através da assimetria de informação. A IA colapsa essa assimetria.',
            atribuicao: 'Felipe Meneses · cofundador e head de IA, Decade · ago/2026. Tese 09.',
          },
        },
        {
          tipo: 'p',
          paragrafos: [
            'Três leituras. Capital de primeira linha global precificou o wealth management brasileiro como um mercado de tecnologia, não de distribuição. A empresa levantou o maior seed da região antes de abrir o produto ao público: o que foi financiado não é tração, é a tese de que servir patrimônio com contexto em escala é um problema resolvível agora. E a Decade não compete por produto nem por taxa. Compete por atenção e confiança do cliente final.',
          ],
        },
        {
          tipo: 'nota',
          texto: 'O contraponto que o estudo pede para ser justo: a imprensa internacional registrou ceticismo (“é muita promessa para quem parte do zero”) e o modelo humano-mais-IA “ainda precisa provar que bate um robo-advisor mais barato”. O valuation não foi divulgado e não deve ser estimado. A gestora ainda está em credenciamento na CVM. O AUM atual é descrito apenas como “alguns bilhões de reais” em carteiras experimentais da rede próxima aos fundadores. Nada disso invalida o sinal. Separa sinal de resultado. Circulou que a rodada seria a estreia da Benchmark no Brasil. Não é: a gestora investiu no Peixe Urbano em janeiro de 2011. Nenhuma fala de sócio da Benchmark sobre a tese; as falas de investidor no material oficial são da Greenoaks.',
          fonte: 'Tese 09, “O contraponto, para ser justo” e “A correção que vale fazer”.',
        },
        {
          tipo: 'numeros',
          itens: [
            n(
              '4',
              'Sistemas de IA para wealth lançados pelo Citi, com rollout global, no mesmo momento em que a Decade era anunciada.',
              'Tese 09. Apêndice: Let’s Money, 2026.',
              'Tese 09 · O sinal',
              'nivel',
            ),
            n(
              '50%',
              'Redução do trabalho administrativo dos assessores, reportada pelo CIBC. BTG, C6 e Santander já testam copilotos há cerca de dois anos.',
              'Tese 09. Apêndice: Let’s Money, 2026.',
              'Tese 09 · O sinal',
              'baixa',
            ),
            n(
              '12 mil',
              'Agentes em produção no Banco do Brasil, no relato que o estudo reproduz.',
              'Tese 09. Apêndice: Let’s Money, 2026.',
              'Tese 09 · O sinal',
              'nivel',
            ),
          ],
        },
        {
          tipo: 'p',
          paragrafos: [
            'A leitura que o estudo defende não é “chegou um concorrente”. É que o mercado inteiro está sendo reorganizado em torno da mesma variável ao mesmo tempo. A Decade é a evidência mais cara e mais recente disso.',
          ],
        },
      ],
    },
    {
      id: 'tese-10',
      toc: 'O desenho',
      kicker: 'O desenho',
      titulo: 'Como será uma assessoria de investimentos em 2030.',
      tituloFonte: 'Título da tese 10, como no sumário.',
      blocos: [
        {
          tipo: 'p',
          paragrafos: [
            'Não é uma previsão de ficção. É a extrapolação de movimentos que já têm data, número e nome, aplicados a uma operação brasileira de porte médio. O estudo pede para considerar uma operação real, das melhores no modelo atual: crescimento por indicação e sem compra de lead. E descreve o que muda.',
            'O ciclo de dados deixa de ser uma quinzena de ingestão e passa a ser contínuo: o desvio chega ao humano. A preparação da reunião deixa de levar até um dia e meio e passa a minutos, com o material gerado do contexto e revisado, não montado. O teto de clientes por profissional se desloca, e o limite volta a ser relacional. O fee tende a predominar, com fee médio menor, e o volume compensa a taxa. A consolidação deixa de ser produto e vira infraestrutura. A carteira recomendada deixa de ser o entregável e vira insumo. O que se vende passa a ser julgamento sob restrição real, com memória e auditoria. Onde o profissional passa o dia se inverte em relação ao back-office. É a única mudança, diz o estudo, que paga todas as outras.',
          ],
        },
        {
          tipo: 'numeros',
          itens: [
            n(
              '22',
              'Pessoas na operação usada como exemplo. 12 comerciais. Cerca de 600 grupos de clientes. 30% da custódia já em fee fixo, com meta de 80%.',
              'Tese 10, operação real descrita no capítulo. A tese 07 cita a mesma equipe de vinte e duas pessoas.',
              'Tese 10 · O desenho',
              'nivel',
            ),
            n(
              '21%',
              'Pouco mais de 21% da custódia da maior plataforma já em fee fixo, no quadro que compara 2026 e 2030. O modelo de 2026 ainda é comissionado na maior parte.',
              'Tese 10, quadro “Operação em 2026 / operação em 2030”.',
              'Tese 10 · O desenho',
              'nivel',
            ),
            n(
              'US$ 10–35 tri',
              'De capacidade adicional de AuM global até 2032, na estimativa da Deloitte, se a reorganização do tempo acontecer. A conta que fecha no capítulo repete a queda do fee (de 0,78% para 0,62%) e a do lifetime (de 43 para 28 meses) e aponta três saídas: cobrar mais, o que o mercado não deixa; atender mais clientes com a mesma estrutura; ou atender melhor para reter mais tempo.',
              'Deloitte, tese 10, “A conta que fecha”. Os níveis de fee e de lifetime estão no panorama, com as fontes já citadas.',
              'Tese 10 · O desenho',
              'nivel',
            ),
            n(
              '21',
              'Deals em 2025, com múltiplos de 5 a 7 vezes o EBITDA para operações acima de R$ 5 bilhões. É o tipo plataforma: escala, marca, capital e infraestrutura própria.',
              'Tese 10. Apêndice: AAWZ Partners, Relatório Setorial Anual 2026 (M&A e múltiplos). A alta de 91% também está no panorama.',
              'Tese 10 · O desenho',
              'alta',
              '+91%',
            ),
            n(
              '~30',
              'Mandatos de M&A mapeados na praça em meados de 2025. O estudo localiza aí boa parte da faixa do meio sem diferencial: grande demais para ser artesanal, pequeno demais para diluir custo.',
              'NeoFeed, “Os M&As das assessorias voltaram e há quase 30 mandatos na praça”, agosto de 2025. Tese 10. Apêndice.',
              'Tese 10 · O desenho',
              'nivel',
            ),
          ],
        },
        {
          tipo: 'p',
          paragrafos: [
            'A consolidação não vai matar os pequenos. Vai matar os médios sem tese. O estudo descreve três tipos que continuam: a plataforma, que vence por custo de servir; a boutique com tese, pequena, cara e específica, que usa infraestrutura de terceiro e concentra o time no julgamento; e o meio sem diferencial, onde a compressão de fee e o encurtamento do lifetime doem primeiro.',
          ],
        },
        {
          tipo: 'lista',
          itens: [
            'Meça o ciclo antes de comprar qualquer coisa. Quantos dias por mês a operação gasta entre receber o dado e confiar nele.',
            'Separe custo de software de custo de hora. A pergunta não é quanto custa. É quantas horas devolve e para qual faixa de valor elas voltam.',
            'Trate contexto como ativo, não como conhecimento tácito. Se mandato, restrição tributária, histórico de decisão e a última reunião só existem na cabeça do profissional, ele sai com o ativo.',
            'Padronize antes de escalar IA. Se dois profissionais da mesma casa produzem diagnósticos diferentes para carteiras equivalentes, o problema não é o modelo.',
            'Escolha a camada em que a operação quer ser insubstituível. Sobra tese, relação e execução sob restrição real. Nenhuma das três escala sem devolver tempo primeiro.',
          ],
        },
        {
          tipo: 'p',
          paragrafos: [
            'Nenhum dos cinco pontos, diz o estudo, é sobre comprar software. Quatro são decisões de gestão que uma operação pode tomar na semana seguinte, sem orçamento. O quinto é posicionamento, e é o único que não dá para adiar até o horizonte do estudo, porque as camadas estão sendo ocupadas agora.',
          ],
        },
      ],
    },
    {
      id: 'limites',
      toc: 'O que não diz',
      kicker: 'Limites',
      titulo: 'O que este estudo não diz.',
      blocos: [
        {
          tipo: 'p',
          paragrafos: [
            'Não diz que a inteligência artificial vai reduzir o headcount no wealth brasileiro. Não há evidência disso, e as operações entrevistadas descrevem escassez, não excesso de gente. Não diz que quem não adotar tecnologia vai quebrar no horizonte do título. A mortalidade das novas consultorias, já citada no panorama, tem causas comerciais e de escala, não tecnológicas. E não diz que existe uma ferramenta que resolve isso. Diz que a variável que separa as operações mudou, e que ela agora é o tempo.',
            'A camada de campo é qualitativa e de amostra pequena. Não é estatisticamente representativa do mercado brasileiro e não deve ser lida como tal. A função dela é dar textura ao que os dados públicos mostram em agregado. Número que vem só de campo está identificado como autorrelato e não é extrapolado para o setor. Nenhuma tese se sustenta apenas nessa camada.',
          ],
        },
        {
          tipo: 'lista',
          itens: [
            'Que percentual dos family offices brasileiros ainda depende de planilha.',
            'Quantos investidores seguem a carteira recomendada que recebem.',
            'Qual o AuC e o ticket médio por assessor no Brasil.',
            'Quantos escritórios de assessoria existem de fato. A ANCORD divulga pessoas físicas, não pessoa jurídica.',
            'Quais múltiplos foram efetivamente pagos nos M&As. Quase nenhum divulgou valor.',
            'Qual o custo operacional real de um family office brasileiro.',
            'Qual a taxa de adoção de IA no wealth brasileiro, com metodologia comparável às pesquisas internacionais.',
            'Se existe algum gestor de patrimônio, no mundo, expondo dados via MCP.',
            'Qual o valuation da Decade. Não foi divulgado.',
            'Qual o status, na Câmara, do projeto de lei de inteligência artificial que o apêndice deixa em aberto.',
          ],
        },
        {
          tipo: 'nota',
          texto: 'A lista acima é do apêndice, como pergunta em aberto. O PL 2338/2023 foi aprovado no Senado em dezembro de 2024. O status na Câmara, o estudo diz que não se sabe. Rankings de AuC de assessorias são autodeclarados. O levantamento de fontes foi conduzido em agosto de 2026.',
          fonte: 'Apêndice A, metodologia e limites, e apêndice de conflitos de fonte.',
        },
      ],
    },
    {
      id: 'fechamento',
      toc: 'Fechamento',
      kicker: 'Fechamento',
      titulo: 'A pergunta não é se a IA vai entrar no wealth management.',
      blocos: [
        {
          tipo: 'p',
          paragrafos: [
            'É se ela vai entrar primeiro na sua empresa ou na do seu concorrente. Essa distância entre quem usa IA e quem usa agentes é, no fechamento, o campo inteiro onde a competição dos próximos quatro anos vai ser decidida. Ela não se fecha comprando ferramenta. Fecha-se reorganizando a operação em torno de onde o tempo do time realmente vai.',
          ],
        },
        {
          tipo: 'numeros',
          itens: [
            n(
              '67 pontos',
              'A distância, em 2026, entre as firmas de advisory que usam IA (73%) e as que usam agentes (6%).',
              'Fechamento do estudo, a partir de Deloitte Insights, Financial Services Predictions 2026. Os dois percentuais estão no panorama e na tese 02.',
              'Fechamento',
              'nivel',
            ),
          ],
        },
        {
          tipo: 'citacao',
          citacao: {
            texto: 'Gente perde quinze dias por mês. Poderia estar perdendo cinco.',
            atribuicao: 'Entrevista de campo · julho de 2026. Fechamento.',
          },
        },
        {
          tipo: 'p',
          paragrafos: [
            'Este estudo foi produzido pela Redentia, que constrói infraestrutura de contexto para operações de wealth management no Brasil: consolidação de posição em múltiplas instituições, memória de cliente e uma camada de agentes que devolve ao profissional o tempo hoje gasto antes de qualquer conversa acontecer.',
            'O documento pede para ser citado, impresso e distribuído livremente, inclusive dentro da operação, com a atribuição mantida. Se algum número estiver errado, o texto pede para ser avisado: será atualizado.',
          ],
        },
      ],
    },
  ],
}

export function relatorioJsonLd(origin: string): Record<string, unknown> {
  const base = origin.replace(/\/$/, '')
  const url = `${base}${WEALTH_2030.path}`
  const pdf = `${base}${WEALTH_2030.pdfPath}`
  const arquivo = {
    '@type': 'MediaObject',
    contentUrl: pdf,
    encodingFormat: 'application/pdf',
    name: WEALTH_2030.titulo,
    inLanguage: 'pt-BR',
  }
  return {
    '@type': 'Report',
    name: WEALTH_2030.titulo,
    description: WEALTH_2030.description,
    url,
    inLanguage: 'pt-BR',
    datePublished: WEALTH_2030.datePublished,
    author: { '@id': WEALTH_ORG_ID },
    publisher: { '@id': WEALTH_ORG_ID },
    associatedMedia: arquivo,
    encoding: {
      '@type': 'MediaObject',
      contentUrl: pdf,
      encodingFormat: 'application/pdf',
    },
  }
}

export function numerosDoEstudo(doc: EstudoWealth = WEALTH_2030): Numero[] {
  return doc.secoes.flatMap((secao) =>
    secao.blocos.flatMap((bloco) => (bloco.tipo === 'numeros' ? bloco.itens : [])),
  )
}

export function paragrafosDoEstudo(doc: EstudoWealth = WEALTH_2030): string[] {
  return doc.secoes.flatMap((secao) =>
    secao.blocos.flatMap((bloco) => (bloco.tipo === 'p' ? bloco.paragrafos : [])),
  )
}

export function notasDoEstudo(doc: EstudoWealth = WEALTH_2030): { texto: string; fonte: string }[] {
  return doc.secoes.flatMap((secao) =>
    secao.blocos.flatMap((bloco) => (bloco.tipo === 'nota' ? [{ texto: bloco.texto, fonte: bloco.fonte }] : [])),
  )
}

export function citacoesDoEstudo(doc: EstudoWealth = WEALTH_2030): Citacao[] {
  return doc.secoes.flatMap((secao) =>
    secao.blocos.flatMap((bloco) => (bloco.tipo === 'citacao' ? [bloco.citacao] : [])),
  )
}

export function itensDeLista(doc: EstudoWealth = WEALTH_2030): string[] {
  return doc.secoes.flatMap((secao) =>
    secao.blocos.flatMap((bloco) => (bloco.tipo === 'lista' ? bloco.itens : [])),
  )
}
