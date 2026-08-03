/**
 * FAQ da Redentia for Business — 29 perguntas em 5 grupos.
 *
 * A copy veio da landing prototipada em docs/redentia-business/ e passou por
 * três rodadas de revisão adversarial (docs/redentia-business/revisoes/), com
 * as afirmações de capacidade checadas contra o código: infraestrutura por
 * whois, modelo de chave do MCP no McpKeyController, e o cache de 60s que faz
 * a revogação valer "em até um minuto", não no ato. NÃO "melhore" resposta sem
 * reler as rodadas — várias frases estão assim porque a versão bonita era
 * falsa (console de administrador, dado no Brasil, "nenhum modelo recebe o
 * dado"). Os grupos vêm da landing e hoje NÃO são renderizados: o RbFaq
 * espelha o FAQ da home, que é um accordion único, e achata com flatMap. A
 * estrutura fica porque é a ordem editorial das perguntas.
 */
import type { NuFaqItem } from '~/types/market'

export interface RbFaqGrupo {
  grupo: string
  itens: NuFaqItem[]
}

export const RB_FAQ: RbFaqGrupo[] = [
  {
    grupo: 'O que é e como entra',
    itens: [
      {
        q: 'O que é o MCP da Redentia?',
        a: 'É o servidor oficial da Redentia no Model Context Protocol. Com ele, o assistente de IA que a sua casa já usa passa a responder sobre o mercado brasileiro com dado real, em vez de dado genérico ou inventado: cotações, comparações de fundos, teses e notícias. A consulta às carteiras consolidadas dos seus clientes é o que a implantação constrói.',
      },
      {
        q: 'O que é MCP?',
        a: 'MCP, ou Model Context Protocol, é um padrão aberto criado pela Anthropic em 2024. Ele padroniza a conversa entre um assistente de IA e uma fonte de dados, sem integração sob medida para cada combinação.',
      },
      {
        q: 'Preciso trocar de sistema para usar?',
        a: 'Não. Você não abre a Redentia, você pergunta de dentro do assistente que já usa. O escritório gera as chaves e distribui, e a partir daí a conversa acontece onde o time já trabalha.',
      },
      {
        q: 'Quais assistentes funcionam hoje?',
        a: 'Claude Desktop, Claude Code e Cursor conectam com a chave. O Claude Desktop usa a ponte mcp-remote, porque a configuração dele é local. Claude Code e Cursor aceitam o cabeçalho de autorização direto.',
      },
      {
        q: 'Funciona no ChatGPT?',
        a: 'Ainda não. Conector personalizado no ChatGPT exige OAuth 2.1, que não existe no nosso servidor hoje e está no roteiro. Se a sua casa usa ChatGPT Enterprise, isso é uma pergunta de qualificação antes de começarmos, não uma surpresa depois.',
      },
      {
        q: 'Como eu conecto ao Claude Desktop?',
        a: 'Você gera a chave, copia o bloco de configuração da página de documentação e cola no arquivo de configuração do Claude. São três linhas e a conexão vale na hora. A chave em claro aparece uma única vez.',
      },
    ],
  },
  {
    grupo: 'O que a IA pode e não pode fazer',
    itens: [
      {
        q: 'A IA pode movimentar patrimônio?',
        a: 'Não. O acesso é somente leitura por desenho: as ferramentas respondem consultas e não executam nenhuma ação. Não existe ferramenta de compra, de venda, de transferência ou de alteração de dado.',
      },
      {
        q: 'A IA pode administrar acessos?',
        a: 'Não, e isso é deliberado. Ligar, desligar e revogar uma chave só acontece no painel do escritório, por quem entrou com login. Assim uma instrução escondida dentro de uma notícia ou de um extrato nunca consegue virar uma mudança de acesso. Escopo não é configurável no plano para escritórios: ele é fixo, e é o catálogo de mercado.',
      },
    ],
  },
  {
    grupo: 'O dado',
    itens: [
      {
        q: 'De onde vem o dado das carteiras?',
        a: 'Do Open Finance, a conexão regulada pelo Banco Central, e de arquivos de extrato do custodiante quando o Open Finance não cobre. Nos dois caminhos o acesso é somente leitura, e o payload original fica guardado.',
      },
      {
        q: 'Quais instituições estão cobertas?',
        a: 'As instituições brasileiras alcançáveis por Open Finance, que hoje passam de duzentas entre bancos e corretoras, incluindo XP, BTG, Itaú, Bradesco, Santander, Nubank e Inter.',
      },
      {
        q: 'Vocês cobrem offshore?',
        a: 'Não. Banco privado internacional, fundo exclusivo, previdência, FIP e imóvel estão fora do escopo atual, e isso precisa ser dito na primeira conversa. Se boa parte do patrimônio das suas famílias mora nessas classes, o ganho é menor do que parece.',
      },
      {
        q: 'O valor da posição é o do custodiante ou vocês remarcam?',
        a: 'É o que o custodiante reportou. A Redentia consolida, normaliza e concilia, e não faz marcação própria de renda fixa. Se a sua casa remarca com curva própria hoje, isso continua sendo trabalho seu.',
      },
      {
        q: 'Como eu sei de onde veio um número?',
        a: 'Cada valor guarda a origem: a instituição, o documento, a data e a regra de normalização que o transformou. A trilha até a linha do extrato é o que estamos construindo para ser clicável de dentro do assistente.',
      },
      {
        q: 'E se o número não bater com o extrato?',
        a: 'A divergência aparece como exceção aberta, e enquanto ela existir o aviso viaja junto com o número, nunca o número limpo. O fechamento que trava o mês até a exceção ser resolvida ou justificada ainda não existe e é construído na implantação, junto com a sua casa.',
      },
      {
        q: 'Quem confere o fechamento?',
        a: 'Uma pessoa da sua casa. O registro de quem conferiu, quando e quantas exceções foram justificadas entra junto com a trilha de auditoria, que ainda não existe.',
      },
    ],
  },
  {
    grupo: 'Segurança, LGPD e responsabilidade',
    itens: [
      {
        q: 'Onde os dados ficam armazenados?',
        a: 'O plano de produto prevê banco separado para o dado de escritório, com isolamento por organização aplicado no próprio banco, e essa separação é pré-requisito para dado real de escritório entrar. A região de hospedagem e a matriz de subprocessadores entram no contrato e são fechadas na reunião técnica.',
      },
      {
        q: 'Algum modelo de IA treina com os dados dos meus clientes?',
        a: 'A Redentia não treina modelo nenhum com o dado dos seus clientes, e não coloca modelo próprio no caminho. O dado trafega para o modelo que a sua casa escolheu, rodando na sua conta do Claude ou do Cursor, sob o contrato que você já assinou com eles, e é lá que a política de treino é definida. Nós entregamos o dado, não escolhemos nem hospedamos o modelo.',
      },
      {
        q: 'Quem na minha equipe vê o quê?',
        a: 'Hoje o escritório tem uma conta com até cinco chaves nomeadas, e todas enxergam a mesma coisa: o catálogo de mercado. Escopo diferente por pessoa ou por família ainda não existe, e é parte do que a implantação constrói. O que já dá para separar é quem usa qual chave, porque o painel mostra o uso de cada uma. Vale saber que o painel abre com um login só, o de quem criou a conta: assento por pessoa e segundo administrador ainda não existem.',
      },
      {
        q: 'Quantas chaves o escritório tem, e quem cria?',
        a: 'Até cinco chaves ativas por escritório, criadas no painel da conta por quem administra a casa. Cada uma leva um nome, seu ou da mesa, e o painel mostra quanto cada chave usou hoje e nos últimos trinta dias. Chave revogada libera a vaga, e o uso dela continua no histórico.',
      },
      {
        q: 'Existe limite de uso?',
        a: 'Sim, e ele é do escritório inteiro, não de cada chave: cinco mil chamadas por dia e cento e vinte por minuto, somando as cinco. É uso justo, dimensionado para uma mesa trabalhando o dia todo, e o painel mostra quanto foi consumido. Se a sua casa precisa de mais, isso se resolve em conversa, não em surpresa no meio do mês.',
      },
      {
        q: 'Como eu revogo o acesso de quem saiu?',
        a: 'No painel do escritório: quem criou a conta revoga a chave daquela pessoa, sem depender dela. As outras chaves continuam funcionando, e o uso da revogada fica no histórico. A chave revogada para de valer em até um minuto, não no ato, porque o servidor guarda a validação por sessenta segundos. Como o painel abre com um login só, mantenha esse login com alguém que fica na casa.',
      },
      {
        q: 'Existe trilha de auditoria?',
        a: 'É um item do MVP e ainda não existe. Quando existir, registra cada chamada com quem, quando, qual ferramenta, quais argumentos, qual cliente e qual resultado, com exportação pelo próprio cliente e retenção declarada.',
      },
      {
        q: 'A Redentia é controladora ou operadora dos dados?',
        a: 'Operadora, nos termos da LGPD. Quem determina a finalidade do tratamento é o seu escritório, e o contrato prevê anexo de proteção de dados, matriz de subprocessadores e notificação de incidente.',
      },
      {
        q: 'A Redentia faz recomendação de investimento?',
        a: 'Não. A Redentia é fornecedora de software: entrega dado, cálculo e formatação. A opinião, a adequação e a recomendação são do seu escritório, que é registrado para isso. Nada sai para o cliente final sem ação de alguém da sua casa.',
      },
      {
        q: 'O relatório sai com a minha marca?',
        a: 'Sim, com a ressalva de que a geração do PDF ainda não existe e é uma das entregas da implantação. Logo, cor, CNPJ e domínio do escritório, sem nenhuma menção à Redentia, e o rodapé traz de quantas contas veio, de quantas instituições, quem conferiu e quando.',
      },
      {
        q: 'A carta do gestor é escrita por IA?',
        a: 'Não. O texto de convicção é escrito pelo gestor, e isso é decisão de risco regulatório, não limitação técnica. Quem escreve o relatório de análise é quem exerce a atividade regulada.',
      },
    ],
  },
  {
    grupo: 'Comercial',
    itens: [
      {
        q: 'Quanto custa?',
        a: 'R$ 2.500 por mês por escritório, com até cinco chaves para o time, sem custo por assento. O plano é mensal, sem contrato anual.',
      },
      {
        q: 'Como funciona a implantação?',
        a: 'Uma reunião técnica de uma hora mapeia as fontes de dado da casa e escolhemos juntos por onde começar. A conexão dos assistentes leva minutos; o que leva tempo é o dado, e a implantação é acompanhada por gente da Redentia.',
      },
      {
        q: 'Em quanto tempo eu começo a usar?',
        a: 'A conexão de um assistente leva minutos. O que leva tempo é a implantação do dado, que depende de quais custodiantes a sua casa usa e de quanto histórico precisa entrar.',
      },
      {
        q: 'Quantos escritórios vocês atendem por trimestre?',
        a: 'Cinco, e o limite é de atendimento, não de marketing. A implantação é acompanhada de perto e nós preferimos entregar bem para poucos a mal para muitos.',
      },
      {
        q: 'O que acontece com os meus dados se eu cancelar?',
        a: 'Você recebe o livro consolidado exportado e depois o dado é eliminado, com comprovação escrita e prazo definido em contrato. Exportar antes de destruir é parte do procedimento, não um favor.',
      },
    ],
  },
]
