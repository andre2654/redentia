/**
 * Guia: MCP para investimentos (o que é, como usar). Captura a intenção "MCP
 * investimentos", hoje poluída no SERP por fundos homônimos (FIDC MCP, Mindful
 * Capital). Explica o Model Context Protocol para o investidor brasileiro e
 * mostra o caminho prático via Redentia MCP. Conteúdo honesto, sem número
 * inventado. HTML dos blocos só usa <strong>.
 */
import type { GuideDoc } from '~/types/guias'

export const MCP_PARA_INVESTIMENTOS_GUIDE: GuideDoc = {
  slug: 'mcp-para-investimentos',
  tag: 'Guia Redentia',
  title: 'MCP para investimentos: o que é e como usar',
  dek: 'O padrão que conecta assistentes de IA aos seus dados financeiros, explicado sem jargão, com o caminho prático para usar na sua carteira da B3.',
  description:
    'O que é MCP (Model Context Protocol) e como usar para investimentos no Brasil. O padrão aberto que conecta o Claude e o Cursor à sua carteira da B3, cotações, teses e notícias, com acesso somente leitura via Redentia MCP.',
  summary:
    'MCP (Model Context Protocol) é o padrão aberto que conecta assistentes de IA a fontes de dados. Aplicado a investimentos, ele leva a sua carteira da B3, as cotações e as teses para dentro do Claude e do Cursor. Veja o que é e como usar.',
  minutes: 8,
  author: 'Equipe Redentia',
  datePublished: '2026-07-19',
  dateModified: '2026-07-19',
  updatedLine: 'Atualizado em 19 jul 2026 · 8 min de leitura',
  updatedShort: 'atualizado em jul 2026',
  sections: [
    {
      id: 'sec-1',
      title: 'O que é MCP',
      blocks: [
        {
          kind: 'p',
          html: 'MCP é a sigla de <strong>Model Context Protocol</strong>, um padrão aberto criado para conectar assistentes de IA a fontes de dados e ferramentas externas. Pense nele como uma tomada universal: em vez de cada aplicativo inventar a própria integração, todos falam a mesma língua, e a IA pluga em qualquer serviço que ofereça um servidor MCP.',
        },
        {
          kind: 'p',
          html: 'Uma nota para quem chegou aqui pesquisando: "MCP" também é nome de alguns fundos de investimento (como FIDCs) que não têm relação nenhuma com este assunto. Aqui, MCP é sempre o protocolo de IA.',
        },
      ],
    },
    {
      id: 'sec-2',
      title: 'Por que isso importa para quem investe',
      blocks: [
        {
          kind: 'p',
          html: 'Assistentes como o Claude e o ChatGPT são ótimos para explicar conceitos, mas não conhecem a SUA carteira. Eles não sabem quanto você tem em cada ativo, quanto recebeu de dividendos ou se está concentrado demais num setor. O MCP resolve exatamente essa lacuna: dá à IA acesso, com o seu consentimento, aos dados reais dos seus investimentos.',
        },
        {
          kind: 'p',
          html: 'Com um servidor MCP de investimentos conectado, a conversa muda de nível. Em vez de "em geral, diversificar é bom", a IA responde "a sua carteira tem <strong>18% em PETR4</strong>, que se aproxima do seu preço-teto". A diferença entre teoria e a sua realidade é o que o MCP entrega.',
        },
      ],
    },
    {
      id: 'sec-3',
      title: 'O que dá para fazer com o MCP da Redentia',
      blocks: [
        {
          kind: 'p',
          html: 'O Redentia MCP é o servidor oficial da Redentia nesse padrão. Ele expõe quatro tipos de dado, cada um com o próprio interruptor de permissão:',
        },
        {
          kind: 'checks',
          items: [
            'Carteira: posições, saldo e proventos da sua carteira real, conectada via Open Finance, somente leitura.',
            'Mercado: cotações e fundamentos de ações, FIIs e BDRs da B3, e o placar do dia.',
            'Teses: as teses de investimento da Redentia, com composição e convicção atualizadas.',
            'Notícias: notícias do mercado com a leitura da Redentia e os relatórios das teses.',
          ],
        },
        {
          kind: 'p',
          html: 'Com isso, perguntas que antes exigiam abrir três aplicativos viram uma frase: "compare a minha carteira com a tese Viver de dividendos", "quanto recebi de proventos este ano?", "saiu alguma notícia hoje sobre os meus ativos?".',
        },
      ],
    },
    {
      id: 'sec-4',
      title: 'Como começar',
      blocks: [
        {
          kind: 'steps',
          items: [
            'Crie uma conta na Redentia e conecte a sua carteira pelo Open Finance, a conexão regulada pelo Banco Central.',
            'Gere a sua chave gratuita do Redentia MCP em Configurações, na seção MCP.',
            'Escolha o seu assistente na página do MCP e cole a configuração pronta (Claude, Cursor, Raycast e outros clientes compatíveis).',
            'Comece a perguntar. A IA passa a responder com os seus dados reais, sem sair da conversa.',
          ],
        },
        {
          kind: 'p',
          html: 'Os blocos de configuração de cada cliente, com prints do passo a passo, ficam em <strong>redentia.com.br/mcp</strong>.',
        },
      ],
    },
    {
      id: 'sec-5',
      title: 'Segurança: o que o MCP pode e o que não pode',
      blocks: [
        {
          kind: 'p',
          html: 'O Redentia MCP é <strong>somente leitura</strong>. Ele responde consultas e não executa nenhuma ação: não existe ferramenta de compra, venda ou transferência. A IA enxerga os seus dados, mas não mexe no seu dinheiro.',
        },
        {
          kind: 'p',
          html: 'A carteira chega pelo Open Finance, com consentimento explícito e sem compartilhar senha. E você controla tudo pela chave: escopos individuais, revogação num clique e uma nova chave que invalida a anterior na hora. Se um dia quiser tirar a IA de perto dos dados, é um interruptor.',
        },
      ],
    },
  ],
  cta: {
    title: 'Experimente o MCP na sua carteira',
    subtitle: 'Gere a chave gratuita do Redentia MCP e conecte o seu assistente de IA aos seus dados da B3.',
    to: '/mcp',
  },
  faqTitle: 'Perguntas frequentes',
  faq: [
    {
      q: 'MCP é o mesmo que aquele fundo de investimento?',
      a: 'Não. Alguns fundos usam a sigla MCP no nome, mas não têm relação com o assunto. Aqui, MCP é o Model Context Protocol, o padrão aberto que conecta assistentes de IA a dados e ferramentas.',
    },
    {
      q: 'Preciso saber programar para usar?',
      a: 'Não. Você gera a chave em Configurações e cola um bloco de configuração pronto no seu assistente. A página do Redentia MCP tem o bloco de cada cliente, com prints, pronto para copiar.',
    },
    {
      q: 'Quanto custa o Redentia MCP?',
      a: 'A chave é gratuita. Basta ter uma conta na Redentia, conectar a carteira pelo Open Finance e gerar a chave.',
    },
    {
      q: 'Quais assistentes suportam MCP hoje?',
      a: 'Cursor, Claude Code e Raycast conectam direto com a chave; o Claude Desktop conecta pela ponte mcp-remote; no claude.ai web o campo de chave está em liberação gradual. No ChatGPT, conectores personalizados ainda exigem OAuth (no roadmap da Redentia).',
    },
    {
      q: 'A IA consegue movimentar a minha carteira?',
      a: 'Não. O acesso é somente leitura por design. O servidor não tem nenhuma ferramenta de compra, venda ou transferência.',
    },
  ],
  related: ['Como conectar sua carteira ao ChatGPT e ao Claude', 'Open Finance: sua carteira está espalhada?'],
}
