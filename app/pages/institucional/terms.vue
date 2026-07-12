<script setup lang="ts">
// /institucional/terms — Termos de Uso (portado VERBATIM de
// Frontend/app/pages/institucional/terms.vue). Placeholders resolvidos:
// brand.name = "Redentia", brand.name.toUpperCase() = "REDENTIA",
// brand.email = suporte@redentia.com.br, brand.url = redentia.com.br.
// Path e SEO preservados de propósito (mesma URL). Segue o GABARITO das
// páginas legais Nu (ver institucional/privacy.vue): árvore tipada
// LegalDocData renderizada por LegalHero + LegalDoc. Nada hardcodado em componente.
import type { LegalDocData } from '~/types/legal'

const doc: LegalDocData = {
  eyebrow: 'Jurídico',
  title: 'Termos e políticas',
  intro: [
    { kind: 'p', text: [
      { text: 'Estes Termos e Condições de Uso e Serviços ("Termos de Uso"), juntamente com a Política de Privacidade, descrevem os termos e condições aplicáveis aos serviços prestados pela ' },
      { text: 'Redentia', bold: true },
      { text: ' por meio da Plataforma.' },
    ] },
    { kind: 'p', text: [
      { text: 'POR FAVOR, LEIA COM ATENÇÃO ESTES TERMOS DE USO.', bold: true },
      { text: ' Eles abrangem informações relevantes sobre o serviço prestados pela ' },
      { text: 'Redentia', bold: true },
      { text: ' por meio da Plataforma, tais como:' },
    ] },
    { kind: 'list', items: [
      { text: [{ text: 'Detalhamento dos serviços prestados pela ' }, { text: 'Redentia', bold: true }] },
      { text: 'Detalhamento sobre a proteção de Dados Pessoais' },
      { text: [{ text: 'Todas as demais informações necessárias concernentes à ' }, { text: 'Redentia', bold: true }, { text: ', à Plataforma e ao Usuário' }] },
    ] },
    { kind: 'p', text: 'Ao marcar a opção referente à concordância e aceitação destes Termos de Uso você está anuindo com todas as suas condições e com a Política de Privacidade. Caso não esteja de acordo, não será possível utilizar a Plataforma, pois a sua utilização precede a aceitação integral a estes Termos de Uso, assim como a Política de Privacidade.' },
  ],
  sections: [
    {
      id: 'definicoes',
      title: 'Definições',
      blocks: [
        { kind: 'list', items: [
          { text: [{ text: '"Cadastro"', bold: true }, { text: ' – significa o cadastro do Usuário feito no Site para ter acesso aos Conteúdos da Carteira.' }] },
          { text: [{ text: '"Chat"', bold: true }, { text: ' – significa o chat que se encontra na Plataforma para atendimento ao público.' }] },
          { text: [{ text: '"Código de Defesa do Consumidor"', bold: true }, { text: ' – significa a Lei nº 8.078, de 11 de setembro de 1990, conforme alterada.' }] },
          { text: [{ text: '"Conta de Usuário"', bold: true }, { text: ' – significa a conta de Usuário criada após a realização do Cadastro.' }] },
          { text: [{ text: '"Conteúdo da Carteira"', bold: true }, { text: ' – tem o significado que lhe é atribuído no item I.' }] },
          { text: [{ text: '"Conteúdos Financeiros"', bold: true }, { text: ' – tem o significado que lhe é atribuído no item I.' }] },
          { text: [{ text: '"Conteúdos Redentia"', bold: true }, { text: ' – significa o Conteúdo da Carteira em conjunto com o Conteúdo Financeiro e com todo e qualquer outro conteúdo disponibilizado pela ' }, { text: 'Redentia', bold: true }, { text: ' em sua Plataforma.' }] },
          { text: [{ text: '"CPF/ME"', bold: true }, { text: ' - significa Cadastro da Pessoa Física do Ministério da Economia.' }] },
          { text: [{ text: '"Dados Pessoais"', bold: true }, { text: ' – significa toda informação relacionada a pessoa natural identificada ou identificável, nos termos da LGPD.' }] },
          { text: [{ text: '"Direito de Propriedade Intelectual"', bold: true }, { text: ' – tem o significado que lhe é atribuído no item VIII.' }] },
          { text: [{ text: '"Leis Aplicáveis"', bold: true }, { text: ' - significa a LGPD e todas as leis, estatutos, normas e regulamentos promulgados por autoridade governamental.' }] },
          { text: [{ text: '"Lei nº 9.609"', bold: true }, { text: ' – significa a Lei nº 9.609, de 19 de fevereiro de 1998, conforme alterada.' }] },
          { text: [{ text: '"Lei nº 9.610"', bold: true }, { text: ' – significa a Lei nº 9.610, de 19 de fevereiro de 1998, conforme alterada.' }] },
          { text: [{ text: '"LGPD"', bold: true }, { text: ' – significa a Lei nº 13.709, de 14 de agosto de 2018, conforme alterada.' }] },
          { text: [{ text: '"Plano"', bold: true }, { text: ' – significa cada um dos planos de assinatura de serviços pagos oferecidos na Plataforma pela ' }, { text: 'Redentia', bold: true }, { text: '.' }] },
          { text: [{ text: '"Plataforma"', bold: true }, { text: ' – significa o Site, bem como os seus diversos ambientes que o Usuário terá acesso após o Cadastro ou contratação de um Plano.' }] },
          { text: [{ text: '"Política de Privacidade"', bold: true }, { text: ' – significa a política de privacidade da ' }, { text: 'Redentia', bold: true }, { text: ' prevista em seu Site.' }] },
          { text: [{ text: '"Site"', bold: true }, { text: ' – significa o endereço da rede mundial de computadores denominado ' }, { text: 'redentia.com.br', href: 'https://redentia.com.br', external: true }, { text: '.' }] },
          { text: [{ text: '"Redentia"', bold: true }, { text: ' – significa a empresa responsável pela prestação dos serviços.' }] },
          { text: [{ text: '"Termos de Uso"', bold: true }, { text: ' – significa estes Termos e Condições de Uso e Serviços.' }] },
          { text: [{ text: '"Usuário"', bold: true }, { text: ' – significa toda pessoa física ou jurídica que acessa a Plataforma.' }] },
        ] },
      ],
    },
    {
      id: 'informacoes-preliminares',
      title: 'Informações Preliminares',
      blocks: [
        { kind: 'p', text: [
          { text: 'ESTE É UM CONTRATO FIRMADO ENTRE VOCÊ (de agora em diante denominado como usuário) E A REDENTIA. ESTE TERMO DE USO REGE O USO DA PLATAFORMA. CASO VOCÊ NÃO CONCORDE COM ESTES TERMOS DE USO, OU PARTE DELES, VOCÊ NÃO DEVE UTILIZAR A PLATAFORMA.', bold: true },
        ] },
        { kind: 'p', text: 'VOCÊ RECONHECE QUE ANALISOU E ACEITOU OS TERMOS DE USO. LEIA-OS ATENTAMENTE POIS O USO DA PLATAFORMA SIGNIFICA QUE VOCÊ ACEITOU TODAS AS DISPOSIÇÕES DESTES TERMOS DE USO E CONCORDA EM CUMPRI-LOS.' },
        { kind: 'p', text: [
          { text: 'Para todos os fins de direito, a ' },
          { text: 'Redentia', bold: true },
          { text: ' informa que o tratamento de todos os Dados Pessoais coletados pela ' },
          { text: 'Redentia', bold: true },
          { text: ' é feito de acordo com as diretrizes e princípios da LGPD. Para mais informações, acesse a nossa Política de Privacidade.' },
        ] },
      ],
    },
    {
      id: 'o-que-e',
      title: 'I – O que é a Redentia?',
      blocks: [
        { kind: 'p', text: [
          { text: 'A ' },
          { text: 'Redentia', bold: true },
          { text: ' é uma empresa que desenvolveu a Plataforma para ser uma ferramenta simplificada com proposta educativa de formação de investidores e que, para tanto:' },
        ] },
        { kind: 'list', items: [
          { text: 'Consolida informações publicamente disponibilizadas pelo mercado financeiro e de capitais sobre empresas de capital aberto e fundos de investimentos ("Conteúdos Financeiros")' },
          { text: 'Consolida informações sobre a própria carteira de investimentos do Usuário ("Conteúdos da Carteira")' },
        ] },
        { kind: 'p', text: [
          { text: 'Alguns dos Conteúdos serão livremente disponibilizados pela ' },
          { text: 'Redentia', bold: true },
          { text: ', enquanto outros deverão ser contratados separadamente, conforme ofertas de serviços anunciadas pela ' },
          { text: 'Redentia', bold: true },
          { text: '.' },
        ] },
        { kind: 'p', text: [
          { text: 'A Plataforma, o aplicativo e os Conteúdos ' },
          { text: 'Redentia', bold: true },
          { text: ' só podem ser utilizados por pessoas físicas e jurídicas legalmente capazes. Assim, ao utilizar a Plataforma, o aplicativo e os Conteúdos ' },
          { text: 'Redentia', bold: true },
          { text: ' você declara e garante, por meio destes Termos de Uso, sob as penas da lei, estar em plena capacidade civil.' },
        ] },
        { kind: 'p', text: [
          { text: 'Os Conteúdos ' },
          { text: 'Redentia', bold: true },
          { text: ' não representam oferta de negociação de valores mobiliários ou outros instrumentos financeiros e têm como único propósito fomentar a educação financeira dos Usuários, bem como não constituem qualquer forma de recomendação de investimento.' },
        ] },
      ],
    },
    {
      id: 'conteudos-financeiros',
      title: 'II – Conteúdos Financeiros',
      blocks: [
        { kind: 'p', text: 'Na Plataforma, sem necessidade de realização de Cadastro, o Usuário terá acesso aos Conteúdos Financeiros, dentre os quais são contempladas, por exemplo, em relação a tesouro direto, empresas de capital aberto e a fundos de investimento, conforme o caso, informações e/ou dados sobre:' },
        { kind: 'list', items: [
          { text: 'Preço de mercado' },
          { text: 'Indicadores financeiros (preço sobre lucro, preço sobre valor patrimonial, preço sobre EBTIDA, dívida líquida sobre patrimônio líquido, margem bruta, ROE, ROIC, dentre outros)' },
          { text: 'Preço do aluguel de ativos' },
          { text: 'Datas e valores da distribuição de dividendos' },
          { text: 'Posições acionárias relevantes da empresa' },
          { text: 'Endividamento' },
          { text: 'Demonstrações de resultado do exercício' },
          { text: 'Fluxo de caixa' },
          { text: 'Balanço patrimonial' },
          { text: 'Comunicados públicos aos acionistas e quotistas' },
        ] },
        { kind: 'p', text: 'Os Conteúdos Financeiros disponibilizados ao Usuário são obtidos a partir de relatórios públicos das empresas listadas, instituições oficiais de registro, controle e fiscalização dos valores mobiliários, periódicos e outras fontes confiáveis e comuns aos operadores do mercado de capitais.' },
        { kind: 'p', text: [
          { text: 'A ' },
          { text: 'Redentia', bold: true },
          { text: ' não se responsabiliza pela veracidade, exatidão ou integralidade de quaisquer destas informações que serão utilizadas para elaboração do Conteúdo Financeiro. A ' },
          { text: 'Redentia', bold: true },
          { text: ' não se obriga e não se responsabiliza pela acurácia dos Conteúdos Financeiros, de modo que os Conteúdos Financeiros poderão conter erros, omissões e inexatidão de informação.' },
        ] },
      ],
    },
    {
      id: 'conteudos-carteira',
      title: 'III – Conteúdos da Carteira',
      blocks: [
        { kind: 'p', text: 'A partir da realização do Cadastro, o Usuário poderá ter acesso aos Conteúdos da Carteira. Nessa medida, o Usuário terá acesso, com base nas informações por ele fornecidas a conteúdos consolidados de sua carteira de investimento, o que inclui, por exemplo:' },
        { kind: 'list', items: [
          { text: 'Diferentes formas de visualização (gráficos e textos) dos seus investimentos' },
          { text: 'Rentabilidade de sua carteira' },
          { text: 'Preço-médio de seus ativos' },
        ] },
        { kind: 'p', text: 'Em resumo, é disponibilizado, por meio da Plataforma, formas de o Usuário melhor visualizar suas carteiras de investimentos, bem como seu desempenho. Os Conteúdos da Carteira poderão ser pagos ou gratuitos, conforme informações contidas no Site ou aplicativo.' },
        { kind: 'p', text: [
          { text: 'Para fins de inserção das informações sobre sua carteira de investimentos, o Usuário poderá utilizar o seu login e senha do CEI (Canal Eletrônico do Investidor), com o que, caso assim o faça, desde já concorda com o compartilhamento de seus dados contidos no CEI à ' },
          { text: 'Redentia', bold: true },
          { text: ' e à Plataforma e/ou aplicativo.' },
        ] },
        { kind: 'p', text: 'Caso o usuário opte pela inserção das informações mediante integração com sua corretora, ele desde já concorda com o compartilhamento de seus dados de acesso à mesma, assim como os dados contidos, por exemplo:' },
        { kind: 'list', items: [
          { text: 'Saldo de conta' },
          { text: 'Posições de investimentos' },
          { text: 'Movimentações financeiras e investimentos' },
          { text: 'Perfil de investidor' },
          { text: 'Transações' },
        ] },
        { kind: 'p', text: 'Ao utilizar o CEI e o Novo Portal da B3 para atualização de sua carteira, o Usuário concorda que estará sujeito às limitações deste portal, que só resgata o histórico de transações do usuário de 18 meses, portanto deverá cadastrar manualmente todas as operações realizadas anteriormente, a fim de ter as informações relativas a sua carteira, como preço médio e rentabilidade, calculadas.' },
        { kind: 'p', text: [
          { text: 'Todos os Dados Pessoais referentes aos Conteúdos da Carteira serão protegidos pela ' },
          { text: 'Redentia', bold: true },
          { text: ' nos termos da LGPD.' },
        ] },
      ],
    },
    {
      id: 'cadastro',
      title: 'IV – Cadastro na Plataforma',
      blocks: [
        { kind: 'p', text: 'Para o acesso aos Conteúdos da Carteira, o Usuário deverá realizar o Cadastro. O Cadastro será feito pelo Usuário no Site, com o correto preenchimento da ficha de cadastro e fornecimento dos dados solicitados, bem como a escolha de uma senha que será utilizada para o login na Plataforma.' },
        { kind: 'p', text: 'Para facilitar, o Usuário poderá, a seu exclusivo critério, utilizar o mesmo cadastro de sua conta nos serviços da gmail, com o que, caso assim o faça, desde já concorda com o compartilhamento de conta para fins de acesso.' },
        { kind: 'p', text: [
          { text: 'Ao realizar o Cadastro, a ' },
          { text: 'Redentia', bold: true },
          { text: ' concede uma licença temporária, não-exclusiva e intransferível para o Usuário acessar as funcionalidades da Plataforma relacionadas aos determinados Conteúdos da Carteira, sem prejuízo de eventual necessidade de contratação de Plano.' },
        ] },
        { kind: 'p', text: [
          { text: 'O Cadastro é individual e intransferível, assim como seu login e senha, que deverão ser guardados em local seguro. Ao realizar o Cadastro, você expressamente concorda em receber comunicações por meio de sua Conta de Usuário ou por outros meios, inclusive por e-mail, para o qual a ' },
          { text: 'Redentia', bold: true },
          { text: ' poderá enviar ofertas ou qualquer outra atividade que considere pertinentes ao Usuário.' },
        ] },
        { kind: 'p', text: 'São fornecidas informações pelo Usuário no âmbito do Cadastro, tais como:' },
        { kind: 'list', items: [
          { text: 'Nome completo' },
          { text: 'Endereço de e-mail' },
          { text: 'Número do Cadastro da Pessoa Física do Ministério da Economia (CPF/ME) ao se realizar a conexão com o CEI e o Novo Portal de B3' },
        ] },
        { kind: 'p', text: [
          { text: 'Todos os Dados Pessoais referentes ao Cadastro serão protegidos pela ' },
          { text: 'Redentia', bold: true },
          { text: ' nos termos da LGPD.' },
        ] },
      ],
    },
    {
      id: 'planos',
      title: 'V – Planos da Redentia',
      blocks: [
        { kind: 'p', text: [
          { text: 'Os Conteúdos ' },
          { text: 'Redentia', bold: true },
          { text: ' poderão ser gratuitos (disponibilizados ao público no geral, mediante Cadastro ou não) e pagos (cujo acesso é permitido mediante contratação de Plano), conforme ofertas de serviços anunciadas no Site ou aplicativo, que indicarão as condições gerais de acesso, além do preço e forma de pagamento.' },
        ] },
        { kind: 'p', text: [
          { text: 'Em caso de opção por Conteúdos ' },
          { text: 'Redentia', bold: true },
          { text: ' pagos, os Usuários poderão selecionar uma ou mais opções de Planos disponíveis para a contratação de Conteúdos ' },
          { text: 'Redentia', bold: true },
          { text: '. Antes de contratar o Plano selecionado, a ' },
          { text: 'Redentia', bold: true },
          { text: ' sugere que o Usuário avalie qual Plano mais se adequa às suas necessidades.' },
        ] },
        { kind: 'p', text: [
          { text: 'O acesso ao Conteúdos ' },
          { text: 'Redentia', bold: true },
          { text: ' contratados será sempre mediante fornecimento do login e senha, após comprovação de pagamento. Para obtenção da nota fiscal, o Usuário deve contatar a ' },
          { text: 'Redentia', bold: true },
          { text: ' por meio do e-mail ' },
          { text: 'suporte@redentia.com.br', href: 'mailto:suporte@redentia.com.br' },
          { text: ' e solicitar sua emissão.' },
        ] },
      ],
    },
    {
      id: 'renovacao-cancelamento',
      title: 'VI – Renovação e Cancelamento',
      blocks: [
        { kind: 'subsection', id: 'renovacao-automatica', title: 'Renovação Automática', blocks: [
          { kind: 'p', text: [
            { text: 'Para conveniência de nossos Usuários, todos os Planos poderão ser renovados de forma automática, mesmo após o término do período vigente. A ' },
            { text: 'Redentia', bold: true },
            { text: ' enviará comunicação por e-mail ao Usuário, para informar sobre a data de encerramento dos Planos contratados e sua renovação por igual período.' },
          ] },
          { kind: 'p', text: 'Caso o Usuário tenha não tenha interesse na renovação, bastará entrar em contato nos demais canais de atendimento disponibilizados. Na renovação automática o valor a ser pago na renovação será de acordo com o preço de vigência do Plano escolhido na primeira compra.' },
        ] },
        { kind: 'subsection', id: 'cancelamento-redentia', title: 'Cancelamento pela Redentia', blocks: [
          { kind: 'p', text: [
            { text: 'Com o objetivo de resguardar a Plataforma, bem como a segurança de todos os demais Usuários, a ' },
            { text: 'Redentia', bold: true },
            { text: ' reserva-se ao direito de providenciar, de forma imediata, a seu exclusivo critério e sem qualquer tipo de reembolso, o cancelamento do Plano contratado pelo Usuário que tenha violado os Termos de Uso e a Política de Privacidade.' },
          ] },
        ] },
        { kind: 'subsection', id: 'cancelamento-usuario', title: 'Cancelamento pelo Usuário', blocks: [
          { kind: 'p', text: [
            { text: 'A qualquer momento, o Usuário poderá solicitar a verificação de um possível cancelamento de seu Cadastro e de seu Plano. Para isso, deverá enviar um e-mail com a solicitação para ' },
            { text: 'suporte@redentia.com.br', href: 'mailto:suporte@redentia.com.br' },
            { text: ' ou acionar pelos canais de atendimento descritos na Plataforma.' },
          ] },
          { kind: 'p', text: [
            { text: 'Para cancelamentos realizados em até 7 (sete) dias da aquisição, renovação ou alteração do Plano, a ' },
            { text: 'Redentia', bold: true },
            { text: ' reembolsará integralmente o valor pago pelo Usuário, de acordo com o Código de Defesa do Consumidor.' },
          ] },
        ] },
      ],
    },
    {
      id: 'remuneracao',
      title: 'VII – Remuneração da Redentia',
      blocks: [
        { kind: 'p', text: [
          { text: 'No caso da contratação de um Plano, o Usuário pagará à ' },
          { text: 'Redentia', bold: true },
          { text: ' a quantia descrita no Site ou aplicativo, com as condições e forma de pagamento lá previstas.' },
        ] },
        { kind: 'p', text: [
          { text: 'Na eventualidade de ocorrer atraso de pagamento, independentemente das demais cominações de direito, o Usuário se obriga a pagar à ' },
          { text: 'Redentia', bold: true },
          { text: ':' },
        ] },
        { kind: 'list', items: [
          { text: 'Multa de 2% (dois por cento) sobre o valor em atraso' },
          { text: 'Juros de mora de 1% (um por cento) ao mês' },
          { text: 'Correção monetária calculada com base na variação IGP-M' },
        ] },
      ],
    },
    {
      id: 'declaracoes-usuario',
      title: 'VIII – Declarações do Usuário',
      blocks: [
        { kind: 'p', text: [
          { text: 'Mediante utilização da Plataforma e/ou do aplicativo, o Usuário declara e garante à ' },
          { text: 'Redentia', bold: true },
          { text: ' que:' },
        ] },
        { kind: 'list', items: [
          { text: [{ text: 'Está ciente e de acordo com a forma de cálculo e pagamento de remuneração da ' }, { text: 'Redentia', bold: true }, { text: ', no caso da contratação de Plano' }] },
          { text: 'Está ciente de que é de sua exclusiva responsabilidade a devida contabilização dos investimentos e a inclusão das informações referentes aos investimentos em suas declarações anuais de imposto de renda' },
          { text: [{ text: 'Está ciente de que a ' }, { text: 'Redentia', bold: true }, { text: ' não se responsabiliza por decorrências negativas do Usuário em razão da utilização dos Conteúdos ' }, { text: 'Redentia', bold: true }] },
          { text: 'Possui plena capacidade civil' },
          { text: [{ text: 'Está ciente e de acordo que os Conteúdos ' }, { text: 'Redentia', bold: true }, { text: ' não promovem qualquer garantia de sucesso ao Usuário, inclusive no âmbito de seus investimentos' }] },
          { text: [{ text: 'Está ciente e de acordo que as informações dos Conteúdos ' }, { text: 'Redentia', bold: true }, { text: ' não devem servir como único embasamento para decisões de investimento do Usuário e não refletem qualquer forma de recomendação de investimento' }] },
          { text: [{ text: 'Está ciente que o tratamento de todos os Dados Pessoais coletados pela ' }, { text: 'Redentia', bold: true }, { text: ' é feito de acordo com as diretrizes e princípios da LGPD' }] },
          { text: [{ text: 'Está ciente e de acordo em receber comunicações da ' }, { text: 'Redentia', bold: true }, { text: ', pelos meios de comunicação fornecidos pelo Usuário à ' }, { text: 'Redentia', bold: true }] },
          { text: 'Está ciente e de acordo com os termos de uso da B3 S.A. – Brasil, Bolsa e Balcão' },
        ] },
      ],
    },
    {
      id: 'obrigacoes-usuario',
      title: 'IX – Obrigações do Usuário',
      blocks: [
        { kind: 'p', text: [
          { text: 'Ao acessar a Plataforma e/ou do aplicativo da ' },
          { text: 'Redentia', bold: true },
          { text: ', cada Usuário compromete-se a:' },
        ] },
        { kind: 'list', items: [
          { text: [{ text: 'Fornecer à ' }, { text: 'Redentia', bold: true }, { text: ' as informações solicitadas para o bom andamento da prestação dos serviços' }] },
          { text: 'Não criar ou utilizar mais do que 1 (um) perfil para utilizar a Plataforma' },
          { text: 'Não utilizar identificação de um terceiro ou permitir que terceiros utilizem sua identificação para acessar a Plataforma' },
          { text: [{ text: 'Respeitar todos os Conteúdos ' }, { text: 'Redentia', bold: true }, { text: ', incluindo, mas não se limitando em matéria de direito da propriedade intelectual e direitos autorais' }] },
          { text: 'Não interferir, de qualquer forma, no funcionamento da Plataforma' },
          { text: [{ text: 'Não burlar qualquer tecnologia usada pela ' }, { text: 'Redentia', bold: true }, { text: ' para proteger os Conteúdos ' }, { text: 'Redentia', bold: true }] },
          { text: [{ text: 'Não modificar, ampliar, decompilar, reduzir, e/ou adaptar os Conteúdos ' }, { text: 'Redentia', bold: true }] },
          { text: 'Não copiar, não criar banco de dados, não reproduzir ou adaptar quaisquer informações a que tiver acesso' },
          { text: 'Não disseminar vírus ou código de computador malicioso' },
          { text: 'Não violar qualquer legislação nacional ou internacional' },
          { text: 'Não praticar atos contrários à moral e aos bons costumes' },
          { text: 'Respeitar a Política de Privacidade' },
          { text: 'Se encarregar dos tributos que recaiam sobre os investimentos que integram a carteira do Usuário' },
        ] },
      ],
    },
    {
      id: 'obrigacoes-redentia',
      title: 'X – Obrigações da Redentia',
      blocks: [
        { kind: 'p', text: [
          { text: 'A ' },
          { text: 'Redentia', bold: true },
          { text: ', por sua vez, tem as seguintes obrigações, sem prejuízo de outras previstas nestes Termos de Uso:' },
        ] },
        { kind: 'list', items: [
          { text: 'Exercer suas atividades com boa fé, transparência, diligência e lealdade em relação ao Usuário' },
          { text: 'Atender às normas, políticas e regulamentações vigentes, referentes aos serviços prestados no âmbito da Plataforma' },
          { text: 'Acatar ordens judiciais emitidas por autoridade competente' },
          { text: 'Envidar os melhores esforços para prestação dos serviços previstos na Plataforma' },
        ] },
      ],
    },
    {
      id: 'isencao-garantias',
      title: 'XI – Isenção de Garantias e Limitações de Responsabilidade',
      blocks: [
        { kind: 'p', text: [
          { text: 'A ' },
          { text: 'Redentia', bold: true },
          { text: ' não oferece qualquer garantia vinculada à Plataforma, ao seu aplicativo e aos Conteúdos ' },
          { text: 'Redentia', bold: true },
          { text: ' e a sua utilização, não sendo responsável por quaisquer prejuízos ou perdas que resultem de seu uso.' },
        ] },
        { kind: 'p', text: [
          { text: 'A utilização da Plataforma, do aplicativo e dos Conteúdos ' },
          { text: 'Redentia', bold: true },
          { text: ' é feita sob inteira responsabilidade do Usuário, que deverá utilizar seus próprios conhecimentos e técnicas para decidir sobre seus investimentos.' },
        ] },
        { kind: 'p', text: 'Os Conteúdos Financeiros não caracterizam serviço de consultoria ou aconselhamento de valores mobiliários e, portanto, não implicam em recomendações de qualquer espécie, principalmente quanto à indicação de investimento, rentabilidade, adequação ou risco de um produto.' },
      ],
    },
    {
      id: 'propriedade-intelectual',
      title: 'XII – Propriedade Intelectual',
      blocks: [
        { kind: 'p', text: [
          { text: 'É vedada a reprodução e distribuição, no todo ou em parte, a qualquer terceiro, sem prévia e expressa autorização da ' },
          { text: 'Redentia', bold: true },
          { text: ', de seus Conteúdos ' },
          { text: 'Redentia', bold: true },
          { text: ' disponibilizados ao Usuário.' },
        ] },
        { kind: 'p', text: [
          { text: 'Os Conteúdos ' },
          { text: 'Redentia', bold: true },
          { text: ', dentre os quais incluem, sem limitação:' },
        ] },
        { kind: 'list', items: [
          { text: 'Relatórios' },
          { text: 'Vídeos' },
          { text: 'Textos' },
          { text: 'Gráficos' },
          { text: 'Imagens' },
          { text: 'Fotos' },
          { text: 'Ilustrações' },
          { text: 'Marcas comerciais' },
          { text: 'Nomes comerciais' },
          { text: 'Marcas de serviço' },
          { text: 'Logotipos' },
          { text: 'Informações' },
          { text: 'Código-fonte' },
          { text: 'Layouts' },
          { text: 'Software' },
          { text: 'Know-how' },
        ] },
        { kind: 'p', text: [
          { text: 'Todos são protegidos por direito de propriedade intelectual ("Direito de Propriedade Intelectual"). Todos os Direitos de Propriedade Intelectual conferidos aos Conteúdos ' },
          { text: 'Redentia', bold: true },
          { text: ' são de titularidade da ' },
          { text: 'Redentia', bold: true },
          { text: '.' },
        ] },
      ],
    },
    {
      id: 'confidencialidade',
      title: 'XIII – Confidencialidade',
      blocks: [
        { kind: 'p', text: [
          { text: 'A ' },
          { text: 'Redentia', bold: true },
          { text: ' e os Usuários comprometem-se em manter sob sigilo as informações decorrentes da outra parte, seja por meio escrito ou verbal, obrigando-se, ainda, envidar seus melhores esforços para que os seus colaboradores assumam a obrigação de confidencialidade estabelecida no presente Termos de Uso.' },
        ] },
        { kind: 'p', text: [
          { text: 'A ' },
          { text: 'Redentia', bold: true },
          { text: ' declara e garante que emprega medidas de segurança, técnicas, físicas e organizacionais, aptas a proteger os Dados Pessoais, inclusive de acessos não-autorizados e de situações acidentais ou ilícitas de perda, destruição, alteração, comunicação ou de qualquer forma de tratamento inadequado ou ilícito.' },
        ] },
      ],
    },
    {
      id: 'disposicoes-gerais',
      title: 'XIV – Disposições Gerais',
      blocks: [
        { kind: 'list', items: [
          { text: 'O Usuário não poderá ceder ou transferir a qualquer terceiro, total ou parcialmente, seus direitos e obrigações decorrentes destes Termos de Uso' },
          { text: [{ text: 'Por medidas de segurança, a ' }, { text: 'Redentia', bold: true }, { text: ' poderá restringir o acesso aos Conteúdos ' }, { text: 'Redentia', bold: true }, { text: ' em mais de 2 (dois) dispositivos que estejam sendo usados simultaneamente' }] },
          { text: [{ text: 'O Usuário que infringir os presentes Termos de Uso será responsabilizado pelos danos e prejuízos de qualquer natureza que a ' }, { text: 'Redentia', bold: true }, { text: ' venha a sofrer' }] },
          { text: [{ text: 'O conteúdo destes Termos de Uso poderá ser atualizado, e modificado, a qualquer tempo e conforme a melhor conveniência da ' }, { text: 'Redentia', bold: true }] },
          { text: 'Fica eleito o Foro da Comarca de São Paulo, Estado de São Paulo, como o único competente para dirimir quaisquer controvérsias decorrentes deste instrumento' },
        ] },
      ],
    },
  ],
}

usePageSeo({
  // title BARE: o app.vue já sufixa "· Redentia" em todo title (house style Nu).
  // A página antiga era "Termos de Uso | Redentia" — mesmas palavras.
  title: 'Termos de Uso',
  description: 'Conheça os direitos e deveres ao utilizar a plataforma Redentia, incluindo regras de serviço e proteção de dados.',
  path: '/institucional/terms',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Termos de uso', path: '/institucional/terms' },
  ],
})
</script>

<template>
  <div>
    <LegalHero :eyebrow="doc.eyebrow" :title="doc.title" :updated="doc.updated" />
    <LegalDoc :intro="doc.intro" :sections="doc.sections" toc />
  </div>
</template>
