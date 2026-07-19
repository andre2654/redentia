/**
 * Guia: como conectar a carteira de investimentos ao ChatGPT / Claude (Brasil).
 * Captura a intenção "conectar carteira ao ChatGPT" (VAZIA no SERP BR, 2026:
 * o ChatGPT Finances da OpenAI é só EUA/Plaid). Conteúdo honesto (nenhum
 * número inventado), ancorado na página /mcp e no Open Finance. Ângulo:
 * a alternativa brasileira via Redentia MCP. HTML dos blocos só usa <strong>.
 */
import type { GuideDoc } from '~/types/guias'

export const CONECTAR_CARTEIRA_AO_CHATGPT_GUIDE: GuideDoc = {
  slug: 'conectar-carteira-ao-chatgpt',
  tag: 'Guia Redentia',
  title: 'Como conectar sua carteira ao ChatGPT e ao Claude',
  dek: 'A IA responde sobre finanças em geral, mas não sabe da sua carteira. Veja como dar a ela os seus dados reais da B3, no Brasil, com acesso somente leitura.',
  description:
    'Como conectar sua carteira de investimentos ao ChatGPT, ao Claude e ao Cursor no Brasil. O ChatGPT Finances da OpenAI é só nos EUA; o caminho brasileiro é o Open Finance com o Redentia MCP, grátis e somente leitura.',
  summary:
    'A IA não conhece a sua carteira. O ChatGPT Finances da OpenAI existe, mas só nos EUA. No Brasil, o caminho é o Open Finance com o Redentia MCP: sua carteira da B3 dentro do Claude, do ChatGPT ou do Cursor, grátis e somente leitura.',
  minutes: 9,
  author: 'Equipe Redentia',
  datePublished: '2026-07-19',
  dateModified: '2026-07-19',
  updatedLine: 'Atualizado em 19 jul 2026 · 9 min de leitura',
  updatedShort: 'atualizado em jul 2026',
  sections: [
    {
      id: 'sec-1',
      title: 'Por que a IA não sabe da sua carteira',
      blocks: [
        {
          kind: 'p',
          html: 'Você pergunta ao ChatGPT "a minha carteira está bem diversificada?" e ele responde com teoria: fala de setores, de percentuais ideais, de não colocar tudo num ativo só. Útil, mas genérico. Ele não sabe que você tem <strong>PETR4, VALE3 e um FII de logística</strong>, porque ninguém deu esses dados a ele.',
        },
        {
          kind: 'p',
          html: 'Um modelo de linguagem só conhece o que veio no treino e o que você digita na conversa. A sua carteira não está em nenhum dos dois. Para a IA responder sobre os SEUS investimentos, ela precisa de uma ponte até os seus dados, e é isso que este guia resolve.',
        },
      ],
    },
    {
      id: 'sec-2',
      title: 'O ChatGPT Finances existe, mas é só nos Estados Unidos',
      blocks: [
        {
          kind: 'p',
          html: 'A OpenAI lançou o ChatGPT com conexão a contas financeiras, mas ele funciona via <strong>Plaid</strong>, o agregador americano, e cobre bancos e corretoras dos Estados Unidos. Ele não conecta a sua conta na XP, no Nubank ou no Itaú.',
        },
        {
          kind: 'p',
          html: 'Ou seja: a resposta que aparece quando você pesquisa "conectar carteira ao ChatGPT" quase sempre é sobre um recurso que não funciona para o investidor brasileiro. A boa notícia é que o Brasil tem a própria infraestrutura para isso, e ela é aberta e regulada.',
        },
      ],
    },
    {
      id: 'sec-3',
      title: 'O caminho brasileiro: Open Finance mais MCP',
      blocks: [
        {
          kind: 'p',
          html: 'A ponte no Brasil tem duas partes. A primeira é o <strong>Open Finance</strong>, o sistema do Banco Central que deixa você compartilhar suas posições de qualquer corretora ou banco com o seu consentimento, somente leitura, sem entregar senha. A Redentia usa o Open Finance para consolidar a sua carteira da B3.',
        },
        {
          kind: 'p',
          html: 'A segunda parte é o <strong>MCP (Model Context Protocol)</strong>, o padrão aberto que conecta assistentes de IA a fontes de dados externas. O Redentia MCP é o servidor oficial da Redentia nesse padrão: com ele, o Claude, o Cursor e outros clientes compatíveis passam a responder com a sua carteira, cotações da B3, teses e notícias.',
        },
        {
          kind: 'stats',
          items: [
            { value: 'Grátis', label: 'a chave de acesso' },
            { value: 'Só leitura', label: 'a IA nunca compra ou vende' },
            { value: '1 clique', label: 'para revogar quando quiser' },
          ],
        },
      ],
    },
    {
      id: 'sec-4',
      title: 'Como conectar, passo a passo',
      blocks: [
        {
          kind: 'steps',
          items: [
            'Conecte a sua carteira na Redentia pelo Open Finance (escolhe a corretora, autoriza o compartilhamento, pronto).',
            'Gere a sua chave gratuita do Redentia MCP em Configurações, na seção MCP. Ela aparece uma única vez, copie na hora.',
            'Cole a configuração no seu assistente. Cada um tem o seu formato, e todos estão prontos para copiar na página do Redentia MCP.',
            'Pergunte: "como está a minha carteira hoje?" e a resposta vem com os seus números reais.',
          ],
        },
        {
          kind: 'p',
          html: 'A página com os blocos de configuração de cada assistente, com prints, fica em <strong>redentia.com.br/mcp</strong>. Lá você escolhe o seu cliente e segue as instruções específicas dele.',
        },
      ],
    },
    {
      id: 'sec-5',
      title: 'Quais assistentes funcionam hoje',
      blocks: [
        {
          kind: 'checks',
          items: [
            'Cursor, Claude Code e Raycast conectam direto com a chave, sem passo extra.',
            'Claude Desktop conecta pela ponte mcp-remote (instruções na página do MCP).',
            'No claude.ai (web), o campo de chave está em liberação gradual pela Anthropic.',
            'No ChatGPT, conectores personalizados exigem autenticação OAuth, que está no roadmap da Redentia. Enquanto isso, a Redentia AI dentro da plataforma responde as mesmas perguntas com os seus dados.',
          ],
        },
        {
          kind: 'p',
          html: 'Vale a honestidade: se o seu único assistente é o ChatGPT web, o caminho por chave ainda não está aberto lá. Mas se você usa Claude, Cursor ou Raycast, funciona hoje, e a própria Redentia AI cobre o caso do ChatGPT enquanto o OAuth não chega.',
        },
      ],
    },
    {
      id: 'sec-6',
      title: 'É seguro? A IA pode mexer no meu dinheiro?',
      blocks: [
        {
          kind: 'p',
          html: 'Não. O acesso é <strong>somente leitura por design</strong>: o Redentia MCP responde consultas (posições, proventos, cotações, teses, notícias) e não executa nenhuma ação. Não existe ferramenta de compra, venda ou transferência. A IA enxerga a carteira, mas não toca nela.',
        },
        {
          kind: 'p',
          html: 'Você também controla o escopo: pode liberar só o mercado e as teses e deixar a carteira de fora, ou desligar tudo num clique. E a chave é revogável a qualquer momento, gerar uma nova invalida a anterior na hora.',
        },
      ],
    },
  ],
  cta: {
    title: 'Coloque a sua carteira dentro da sua IA',
    subtitle: 'Gere a chave gratuita do Redentia MCP e conecte ao Claude, ao Cursor ou ao Raycast em dois minutos.',
    to: '/mcp',
  },
  faqTitle: 'Perguntas frequentes',
  faq: [
    {
      q: 'O ChatGPT consegue ver a minha carteira brasileira?',
      a: 'Pelo recurso oficial da OpenAI, não: o ChatGPT Finances funciona via Plaid e cobre instituições dos Estados Unidos. No Brasil, o caminho é o Open Finance com o Redentia MCP. No ChatGPT web, o conector por chave ainda depende de OAuth (no roadmap da Redentia); no Claude, no Cursor e no Raycast já funciona hoje.',
    },
    {
      q: 'Preciso pagar alguma coisa?',
      a: 'Não. A chave do Redentia MCP é gratuita: basta ter uma conta na Redentia, conectar a carteira pelo Open Finance e gerar a chave em Configurações.',
    },
    {
      q: 'A IA pode comprar ou vender por mim?',
      a: 'Não. O acesso é somente leitura: a IA consulta posições, proventos, cotações, teses e notícias, mas não executa nenhuma ordem. Não existe ferramenta de escrita no servidor.',
    },
    {
      q: 'Como eu desconecto?',
      a: 'Em Configurações, na seção MCP: desligue o interruptor para suspender na hora, gere uma nova chave (a antiga morre no ato) ou desligue escopos individuais, como a carteira, mantendo o resto.',
    },
    {
      q: 'Que dados a IA passa a acessar?',
      a: 'Só o que a sua chave permitir, por escopo: carteira (posições, saldo e proventos, somente leitura), mercado (cotações e fundamentos da B3), teses da Redentia e notícias com a análise da Redentia. Cada escopo tem o próprio interruptor.',
    },
  ],
  related: ['Open Finance: sua carteira está espalhada?', 'Como montar uma carteira de investimentos'],
}
