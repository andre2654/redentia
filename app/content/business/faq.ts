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
        a: 'É o servidor oficial da Redentia no Model Context Protocol. Com ele, o assistente de IA que a sua casa já usa passa a responder sobre dados do mercado brasileiro e sobre as carteiras dos seus clientes com dado real, em vez de dado genérico ou inventado.',
      },
      {
        q: 'O que é MCP?',
        a: 'MCP, ou Model Context Protocol, é um padrão aberto criado pela Anthropic em 2024. Ele padroniza a conversa entre um assistente de IA e uma fonte de dados, sem integração sob medida para cada combinação.',
      },
      {
        q: 'Preciso trocar de sistema para usar?',
        a: 'Não. Você não abre a Redentia, você pergunta de dentro do assistente que já usa. Cada pessoa da casa recebe uma chave, e a partir daí a conversa acontece onde o time já trabalha.',
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
        a: 'Não, e isso é deliberado. Ligar, desligar, rotacionar e mudar o escopo de uma chave só acontece na área autenticada da Redentia, por quem é dono dela. Assim uma instrução escondida dentro de uma notícia ou de um extrato nunca consegue virar uma mudança de acesso.',
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
        a: 'A divergência aparece como exceção aberta, e enquanto ela existir o aviso viaja junto com o número, nunca o número limpo. O fechamento que trava o mês até a exceção ser resolvida ou justificada ainda não existe e é parte do que a prova de conceito constrói.',
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
        a: 'O plano de produto prevê banco separado para o dado de escritório, com isolamento por organização aplicado no próprio banco, e essa separação é pré-requisito para a primeira prova de conceito com dado real. A região de hospedagem e a matriz de subprocessadores entram no contrato e são fechadas na reunião técnica.',
      },
      {
        q: 'Algum modelo de IA treina com os dados dos meus clientes?',
        a: 'A Redentia não treina modelo nenhum com o dado dos seus clientes, e não coloca modelo próprio no caminho. O dado trafega para o modelo que a sua casa escolheu, rodando na sua conta do Claude ou do Cursor, sob o contrato que você já assinou com eles, e é lá que a política de treino é definida. Nós entregamos o dado, não escolhemos nem hospedamos o modelo.',
      },
      {
        q: 'Quem na minha equipe vê o quê?',
        a: 'A intenção é escopo por pessoa e por família, com chave individual e validade obrigatória. Hoje o produto ainda não tem organização nem assento, a chave é uma por pessoa física, e isso é parte do que a prova de conceito constrói.',
      },
      {
        q: 'Como eu revogo o acesso de quem saiu?',
        a: 'Hoje, com a própria pessoa: cada uma gera, desliga e rotaciona a chave dela na área autenticada da Redentia. A revogação por um administrador da casa, sem depender de quem saiu, depende do modelo de organização, que ainda não existe e é uma das entregas da prova de conceito. Vale saber também que a chave revogada para de valer em até um minuto, não no ato, porque o servidor guarda a validação por sessenta segundos.',
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
        a: 'Sim, com a ressalva de que a geração do PDF ainda não existe e é uma das entregas da prova de conceito. Logo, cor, CNPJ e domínio do escritório, sem nenhuma menção à Redentia, e o rodapé traz de quantas contas veio, de quantas instituições, quem conferiu e quando.',
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
        a: 'A prova de conceito custa R$ 2.500 por mês, por sessenta a noventa dias. Depois dela os planos são Starter, Growth e Enterprise, e o valor pago vira crédito integral na conversão.',
      },
      {
        q: 'Como funciona a prova de conceito?',
        a: 'Uma reunião técnica de uma hora mapeia as fontes de dado, escolhemos juntos uma tese operacional para atacar primeiro, e o ciclo roda em sessenta a noventa dias com critério de sucesso escrito antes de começar.',
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
