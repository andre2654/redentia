/**
 * FAQ da Redentia for Business — 30 perguntas em 5 grupos.
 *
 * A copy veio da landing prototipada em docs/redentia-business/ e passou por
 * três rodadas de revisão adversarial (docs/redentia-business/revisoes/), com
 * as afirmações de capacidade checadas contra o código: infraestrutura por
 * whois, modelo de chave do MCP no McpKeyController, e o cache de 60s que faz
 * a revogação valer "em até um minuto", não no ato. NÃO "melhore" resposta sem
 * reler as rodadas — várias frases estão assim porque a versão bonita era
 * falsa (console de administrador, dado no Brasil, "nenhum modelo recebe o
 * dado"). Os grupos vêm da landing e, desde 15/10/2026, são as abas do RbFaq
 * (uma aba por grupo, na ordem daqui): o `grupo` é o rótulo da aba, então
 * nome curto, sem ponto final, e um grupo novo vira uma aba nova.
 *
 * REVISÃO DE 11/10/2026 (o que está no ar, para as calls de venda). Saíram as
 * respostas da tese de consolidação, que o produto não entrega: "o valor é o
 * do custodiante", "a divergência vira exceção aberta", "quem confere o
 * fechamento", "você recebe o livro consolidado exportado", "atendemos cinco
 * escritórios por trimestre" e o "banco separado" da pergunta de
 * armazenamento. Cada resposta nova foi conferida no código em origin/main
 * (Backend e mcp-service) no mesmo dia:
 *  - carteira colada não é gravada em conta: ScenarioSimulationController::
 *    mcpSimulate não persiste, e o log do mcp-service guarda o nome da
 *    ferramenta, não os argumentos (tools.ts, função log). MAS o resultado do
 *    motor, com ticker e valor, fica no cache do Laravel (ScenarioEngineService
 *    ::run, chave = hash do pedido, sem chave nem conta, TTL 30 min; produção
 *    usa CACHE_STORE=file). Só a carteira de cliente (C4) passa no_cache. Daí
 *    a resposta dizer "cache técnico, sem nome e sem chave", e não "nada fica
 *    guardado" (revisão de 11/10/2026). Se o mcp-service passar no_cache também
 *    no simulate_scenario, a frase pode ficar mais curta;
 *  - classes da carteira conectada: enum asset_class de
 *    business_client_positions (STOCK, REIT, ETF, BDR, TREASURY, CRYPTO);
 *  - instituições: config/business_clients.php `institutions`;
 *  - consentimento: business_client_consents (granted_at, terms_version,
 *    terms_sha256, user_agent; o IP só quando a origem é provada, ver
 *    RbSeguranca), 12 meses (consent_months), revogação apaga as posições;
 *  - controlador e operador: o próprio termo (cláusula 1);
 *  - relatório: a skill redentia-relatorio-cliente (skills-pack/).
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
        a: 'É o servidor oficial da Redentia no Model Context Protocol. Com ele, o assistente de IA que a sua casa já usa passa a responder sobre o mercado brasileiro com dado real, em vez de dado genérico ou inventado: cotações, notícias com a leitura da Redentia, teses, comparação de fundos e cenários e projeções sobre uma carteira. A carteira de um cliente só entra com o consentimento do próprio cliente, pelo recurso Clientes do escritório, liberado por convite, escritório a escritório.',
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
        a: 'O claude.ai conecta como conector personalizado: você cola a URL do servidor, clica em Connect e autoriza com a chave do escritório, sem editar arquivo. O ChatGPT conecta pelo modo desenvolvedor da OpenAI, do mesmo jeito: URL, OAuth e a chave na página de autorização. Claude Desktop, Claude Code e Cursor conectam com a chave no cabeçalho, e o Desktop usa a ponte mcp-remote porque a configuração dele é local.',
      },
      {
        q: 'Funciona no ChatGPT?',
        a: 'Funciona, pelo modo desenvolvedor da OpenAI (Settings → Apps & Connectors → Advanced → Developer mode, em plano pago): você cria o conector com a URL do servidor, escolhe OAuth, e autoriza com a chave do escritório na página da Redentia. O passo a passo abre no painel de chaves junto com a chave.',
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
        a: 'Não. As ferramentas respondem consultas e não executam nenhuma ação sobre patrimônio. Todas são de leitura, menos create_client_invite, que só cria um link inerte até o cliente consentir. Não existe ferramenta de compra, de venda, de transferência ou de alteração de dado.',
      },
      {
        q: 'A IA pode administrar acessos?',
        a: 'Não, e isso é deliberado. Ligar, desligar e revogar uma chave só acontece no painel do escritório, por quem entrou com login. Assim uma instrução escondida dentro de uma notícia ou de um extrato nunca consegue virar uma mudança de acesso. O mais perto disso que a IA chega é o convite de cliente: create_client_invite gera um link inerte, que não dá acesso a nada até o próprio cliente ler o termo e consentir. Um link novo para o mesmo cliente cancela o link pendente anterior. Revogar um acesso já dado é do cliente, pelo link dele, ou do escritório, no painel; nenhuma ferramenta da IA revoga ou reatribui. Escopo não é configurável no plano para escritórios: ele é fixo, e é o catálogo de mercado mais os cenários.',
      },
      {
        q: 'A Redentia prevê o mercado?',
        a: 'Não. Ela mostra a faixa do que pode acontecer com uma carteira num cenário, da ponta de baixo (p10) à de cima (p90), em reais de hoje e com as premissas abertas. Cenário estudado pela Redentia vem com fontes; cenário montado na hora, na conversa, vem rotulado como montado na hora, sem precedente histórico que o ancore. É uma faixa, não um ponto: não promete retorno nem aposta num resultado único.',
      },
    ],
  },
  {
    grupo: 'Cenários e carteiras',
    itens: [
      {
        q: 'Preciso conectar cliente para rodar um cenário?',
        a: 'Não. Cole a carteira na conversa, em valores ou em pesos, sem nome de cliente, e o motor devolve a faixa do patrimônio e o choque de cada ativo com o porquê. A carteira colada não fica salva na conta do escritório: o servidor registra que a ferramenta foi chamada, por qual chave e quando, não o que entrou nela. O cálculo fica num cache técnico, sem nome e sem chave, só para a mesma pergunta não rodar de novo. É o caminho de quem é assessor vinculado e não compartilha carteira de cliente fora da corretora.',
      },
      {
        q: 'De onde vem a carteira de um cliente conectado?',
        a: 'Do Open Finance, a conexão regulada pelo Banco Central, autorizada pelo próprio cliente num link que o escritório manda. O acesso é de leitura e cobre posições de investimento: ação, FII, ETF, BDR, Tesouro Direto e cripto. Saldo de conta corrente, cartão e extrato de transações não entram.',
      },
      {
        q: 'Quais instituições o cliente consegue conectar?',
        a: 'Na tela de conexão o cliente escolhe o banco ou a corretora numa lista com as principais do país, entre elas XP Investimentos, BTG Pactual, Itaú, Bradesco, Santander, Banco do Brasil, Nubank e Inter. A conexão com a instituição do cliente é habilitada escritório a escritório, na implantação.',
      },
      {
        q: 'Vocês cobrem offshore?',
        a: 'Não. Banco privado internacional, fundo exclusivo, previdência, FIP e imóvel estão fora do escopo, e isso precisa ser dito na primeira conversa. Se boa parte do patrimônio dos seus clientes mora nessas classes, o ganho é menor do que parece.',
      },
      {
        q: 'Como eu sei de onde veio um número?',
        a: 'Toda resposta diz a data do dado e de onde ele veio: a cotação com a data do preço, a notícia com a fonte e a data, e o cenário com a origem (estudado pela Redentia, com fontes, ou montado na hora) e as premissas que o motor usou.',
      },
    ],
  },
  {
    grupo: 'Segurança, LGPD e responsabilidade',
    itens: [
      {
        q: 'Onde os dados dos clientes ficam armazenados?',
        a: 'No banco de dados da Redentia, em tabelas exclusivas do recurso Clientes do escritório, sem cruzar com o cadastro de pessoa física. A separação entre escritórios é feita pela aplicação: antes de cada leitura, o servidor confere a conta, a chave e o consentimento, e responde igual para cliente de outro escritório e para cliente que não existe. Do cliente ficam o nome que o escritório cadastra, as posições enquanto o consentimento vale e a prova do aceite (data, versão do termo, hash do texto aceito e navegador). Revogado ou vencido o consentimento, as posições são apagadas. A região de hospedagem e a lista de subprocessadores entram no contrato.',
      },
      {
        q: 'Algum modelo de IA treina com os dados dos meus clientes?',
        a: 'A Redentia não treina modelo nenhum com o dado dos seus clientes, e não coloca modelo próprio no caminho. O dado trafega para o modelo que a sua casa escolheu, rodando na sua conta do Claude, do ChatGPT ou do Cursor, sob o contrato que você já assinou com eles, e é lá que a política de treino é definida. Nós entregamos o dado, não escolhemos nem hospedamos o modelo.',
      },
      {
        q: 'Quem na minha equipe vê o quê?',
        a: 'Hoje o escritório tem uma conta com uma chave nomeada por pessoa, e todas enxergam o mesmo catálogo: mercado, teses, notícias e cenários. Em Clientes do escritório, cada chave vê os clientes que ela convidou; quem administra a conta vê todos, reatribui e pode compartilhar um cliente com o escritório inteiro. Escopo diferente por pessoa ou por cliente, fora isso, ainda não existe. O que já dá para separar é quem usa qual chave, porque o painel mostra o uso de cada uma. Vale saber que o painel abre com um login só, o de quem criou a conta: assento por pessoa e segundo administrador ainda não existem.',
      },
      {
        q: 'Quantas chaves o escritório tem, e quem cria?',
        a: 'Quantas a casa contratar, uma por pessoa. O escritório começa com uma e ativa ou desativa chaves quando quiser; a mensalidade conta as chaves ativas no início de cada mês. Elas são criadas no painel da conta por quem administra a casa. Cada uma leva um nome, seu ou da mesa, e o painel mostra quanto cada chave usou hoje e nos últimos trinta dias. Chave revogada libera a vaga, e o uso dela continua no histórico.',
      },
      {
        q: 'Existe limite de uso?',
        a: 'Sim, e ele é do escritório inteiro, não de cada chave: trezentas chamadas por minuto, somando todas as chaves, sem teto diário. As duas simulações (simulate_scenario e simulate_client_scenario) têm um sub-limite próprio de vinte por minuto para o escritório, porque cada uma é cálculo pesado, e elas contam também no limite geral. O motor também tem um teto compartilhado entre todos os usuários; em pico, uma simulação pode pedir para esperar alguns segundos mesmo abaixo de vinte. É uso justo, dimensionado para uma mesa trabalhando o dia todo, e o painel mostra quanto foi consumido. Se a sua casa precisa de mais, isso se resolve em conversa, não em surpresa no meio do mês.',
      },
      {
        q: 'Como eu revogo o acesso de quem saiu?',
        a: 'No painel do escritório: quem criou a conta revoga a chave daquela pessoa, sem depender dela. As outras chaves continuam funcionando, e o uso da revogada fica no histórico. A chave revogada para de valer em até um minuto, não no ato, porque o servidor guarda a validação por sessenta segundos. Como o painel abre com um login só, mantenha esse login com alguém que fica na casa.',
      },
      {
        q: 'Existe trilha de auditoria?',
        a: 'Em parte. Para Clientes do escritório ela já existe: cada convite, consentimento, leitura de carteira, simulação e revogação fica registrado com a chave e a data, sem as posições, e o cliente vê o próprio registro pelo link de gestão. A trilha de toda chamada, com argumentos, resultado, exportação e retenção declarada, ainda não existe.',
      },
      {
        q: 'A Redentia é controladora ou operadora dos dados?',
        a: 'Operadora, nos termos da LGPD. Quem determina a finalidade do tratamento é o seu escritório, e o termo que o cliente aceita diz isso com todas as letras: o controlador é o escritório que mandou o convite, e a Redentia guarda e processa os dados em nome dele e segundo as instruções dele.',
      },
      {
        q: 'A Redentia faz recomendação de investimento?',
        a: 'Não. A Redentia é fornecedora de software: entrega dado, cálculo e formatação. Cenários e projeções são faixa estatística com premissas abertas, não promessa de retorno. A opinião, a adequação e a recomendação são do seu escritório, que é registrado para isso. Nada sai para o cliente final sem ação de alguém da sua casa.',
      },
      {
        q: 'O relatório sai com a minha marca?',
        a: 'Sai. A skill de relatório gera o PDF dentro do Claude, a partir da carteira de um cliente conectado, dos cenários e do mercado do dia, e o modelo aceita o logo, as cores e o tom do escritório. Ela descreve a carteira e os cenários e não recomenda compra, venda nem peso. Precisa de execução de código, que no claude.ai e no Claude Desktop já vem ligada. Se a sua casa é assessoria vinculada, leia antes a RCVM 178: o art. 25, VII, veda ao assessor enviar ao cliente extrato com posições.',
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
        a: 'Por chave ativa, em faixas: R$ 500 por chave da 1ª à 10ª, R$ 300 da 11ª à 25ª, R$ 200 da 26ª à 50ª e R$ 150 a partir da 51ª. Cada chave paga o preço da faixa em que cai, então 10 chaves custam R$ 5.000 por mês, 25 custam R$ 9.500 e 50 custam R$ 14.500. O pagamento é mensal e antecipado, por boleto ou Pix, com vencimento no dia 10 e nota fiscal, e os preços são reajustados uma vez por ano pelo IPCA. A calculadora da seção O plano faz a conta para o tamanho da sua mesa.',
      },
      {
        q: 'Tem fidelidade?',
        a: 'Três meses de prazo mínimo, contados da ativação da primeira chave; depois, o contrato renova mês a mês, e qualquer lado encerra com 30 dias de aviso, sem multa. E tem garantia: se a casa cancelar nos primeiros 30 dias, devolvemos tudo o que foi pago e o restante do prazo mínimo não é cobrado.',
      },
      {
        q: 'Como funciona a implantação?',
        a: 'Uma reunião técnica de uma hora: conectamos o assistente de cada chave, instalamos as skills e rodamos uma carteira de vocês num cenário. Clientes do escritório, quando entra, é ligado depois, escritório a escritório, com gente da Redentia acompanhando.',
      },
      {
        q: 'Em quanto tempo eu começo a usar?',
        a: 'No dia em que a conta é liberada. A chave conecta em minutos, e mercado, notícias e cenários respondem na hora. Clientes do escritório depende da implantação.',
      },
      {
        q: 'O que acontece com os meus dados se eu cancelar?',
        a: 'As chaves param de responder e os clientes conectados deixam de ser lidos. As posições dos clientes são apagadas quando o acesso termina; a prova do aceite e o registro de acesso ficam guardados, sem posição, pelo prazo que o termo informa ao cliente.',
      },
    ],
  },
]
