<script setup lang="ts">
/**
 * "O que dá pra verificar" — a seção de segurança, em grade.
 *
 * GRADE DE CINCO CARDS (15/10/2026, pedido do dono). Até aqui era scroll
 * travado: coluna fixa com foto à esquerda e um passo de 76vh por fato à
 * direita. Custava ~4.100px no desktop (4,6 telas) e os passos fora de foco
 * ficavam a 38% de opacidade, cinza quase ilegível. Agora os cinco ficam à
 * vista juntos, todos em contraste pleno:
 *  - desktop largo: 3 + 2, numa grade de 6 trilhas em que cada card de cima
 *    ocupa duas e cada um de baixo ocupa três, para a grade fechar sem buraco;
 *  - tablet: 2 colunas, e o quinto ocupa a linha inteira;
 *  - celular: 1 coluna.
 * A foto (reuniao.webp) saiu junto: tinha rosto reconhecível e o direito de
 * imagem nunca foi confirmado, a mesma regra que a deixou fora do hero.
 *
 * A PEÇA DE CADA FATO, que antes vivia no card sobre a foto, entrou no próprio
 * card, compacta, logo acima do "Como conferir": é o pedaço do produto que o
 * comprador vai reconhecer quando abrir o painel ou o assistente. Do tablet
 * para cima; no celular ela sai, como a cena inteira já saía (ver o @media no
 * fim). A do fato da leitura deixou de ser a lista inteira das 15 ferramentas
 * (15 linhas não cabem num card de grade) e mostra só as que têm ressalva,
 * com o nome exato.
 *
 * ⚠️ REESCRITA EM 11/10/2026: SÓ O QUE É VERDADE HOJE E SE CONFERE.
 * O primeiro fato dizia que a carteira do cliente "só entra depois de um banco
 * separado do produto de pessoa física" e mandava o comprador "perguntar em que
 * banco a sua base vai morar e pedir a data". Isso era o plano (o `pg-biz`), não
 * o produto: o dado de cliente mora no mesmo PostgreSQL da Redentia, em tabelas
 * próprias (business_client_*), isolado por escritório NA APLICAÇÃO. Frase de
 * plano numa seção que promete "sobreviver a uma due diligence" é a primeira
 * coisa que um compliance de XP derruba. Cada fato abaixo foi conferido no
 * código em origin/main (Backend rodrigoborges/redentia-api e mcp-service
 * andre2654/redentia-mcp) no dia da troca:
 *
 *  chaves      BusinessAccount::DEFAULT_MAX_KEYS = 5; revogar grava revoked_at
 *              e desliga a chave (BusinessAccountController); o mcp-service
 *              guarda a validação por 60 s (auth.ts, TTL_MS), daí "em até um
 *              minuto".
 *  leitura     15 ferramentas em src/tools.ts; só create_client_invite escreve,
 *              e o convite não dá acesso a nada sem o consentimento.
 *  modelo      nenhuma chamada de LLM no mcp-service nem no caminho do motor
 *              (ScenarioEngineService: "Não há LLM em nenhum ponto do caminho").
 *  isolamento  BusinessClient::scopeVisibleTo filtra por business_account_id e
 *              pela chave (ou compartilhado); ClientAccess devolve o MESMO "não
 *              encontrado" para cliente de outra conta. Cada leitura grava
 *              portfolio_read / simulation_run com a chave e a hora, sem as
 *              posições (BusinessClientMcpController).
 *  aceite      business_client_consents guarda granted_at, terms_version,
 *              terms_sha256 e user_agent; revogar apaga as posições (purged no
 *              log); o consentimento vence em 12 meses (consent_months).
 *              ⚠️ O IP NÃO ESTÁ NA COPY DE PROPÓSITO: a coluna existe, mas só é
 *              gravada quando o Laravel consegue provar a origem
 *              (FrontOrigin::visitorIp), e isso depende da FRONT_SHARED_KEY nos
 *              dois lados. Em 11/10/2026 a prova deu negativo
 *              (x-ratelimit-limit 600 pelo proxy, e não 1200), então o IP sai
 *              nulo em produção. Configurada a chave, o IP pode voltar à frase.
 *  implantação clients_mode é ligado pela Redentia, conta a conta, por console
 *              (business:conta --clientes); o painel só lê on/off.
 *
 * O QUE O DECK DIZ E ESTA SEÇÃO CONTINUA NÃO REPETINDO, as três da lista de
 * afirmações falsas do parecer de compliance:
 *  - "Criptografia de ponta a ponta": TLS e disco cifrado não são E2E.
 *  - "Os dados nunca cruzam com terceiros": o modelo de IA do escritório recebe
 *    o resultado da ferramenta por definição, e o banco é um só.
 *  - "Tratando patrimônio como dados médicos": dado financeiro NÃO é dado
 *    sensível na LGPD (art. 5º, II). Erra pra cima na frente de quem lê contrato.
 *
 * O NOINDEX DA PÁGINA CONTINUA (pages/business/index.vue): era trava desta
 * seção enquanto ela afirmava o banco separado. A afirmação saiu; tirar o
 * noindex é decisão do dono, não desta copy.
 */

/** Uma linha da peça: rótulo em monoespaçada e o estado, como o painel mostra. */
interface Linha {
  k: string
  v: string
  /** 'off' = riscado (chave revogada); 'nada' = a recusa, em cinza */
  tom?: 'off' | 'nada'
}
interface Fato {
  id: string
  rotulo: string
  texto: string
  verifica: string
  peca: Linha[]
}

/* As ferramentas citadas na peça da leitura EXISTEM no mcp-service, com o nome
   exato. Nunca invente nome de tool aqui: o comprador roda e confere.
   create_client_invite é a ÚNICA que escreve: cria um link inerte, que não dá
   acesso a nada até o cliente consentir. As quatro do escopo `clientes` só
   existem na chave de uma conta com o recurso habilitado (liberado pela
   Redentia, escritório a escritório), e get_portfolio existe mas está FORA do
   plano de escritório (é a carteira PESSOAL do dono da chave), por isso
   aparece marcada, não escondida. */
const FATOS: Fato[] = [
  {
    id: 'chaves',
    rotulo: 'Chave nomeada, revogável pela casa',
    texto: 'O escritório tem uma conta com uma chave por pessoa, cada uma com o nome de quem usa. Quem administra a conta liga, desliga e revoga qualquer uma delas sem depender da pessoa, e derrubar uma não derruba as outras. A revogada para de responder em até um minuto.',
    verifica: 'Gere duas chaves, revogue uma e veja a outra continuar respondendo.',
    peca: [
      { k: 'mesa', v: 'ativa' },
      { k: 'alocação', v: 'ativa' },
      { k: 'backoffice', v: 'revogada', tom: 'off' },
    ],
  },
  {
    id: 'leitura',
    rotulo: 'Leitura, com uma exceção declarada',
    texto: 'Das 15 ferramentas do servidor, 14 só leem. A exceção é create_client_invite, que cria um link de convite: sem o aceite do cliente, ele não dá acesso a nada. Não existe ferramenta de compra, de venda, de transferência nem de alteração de dado.',
    verifica: 'Peça a lista de ferramentas ao seu assistente e leia os nomes.',
    peca: [
      { k: 'create_client_invite', v: 'só o link' },
      { k: 'get_client_portfolio', v: 'conta habilitada' },
      { k: 'get_portfolio', v: 'fora do plano', tom: 'nada' },
    ],
  },
  {
    id: 'modelo',
    rotulo: 'O modelo é seu',
    texto: 'A Redentia não coloca modelo de IA próprio no caminho do seu dado e não treina nada com ele. Quando o time pergunta, quem responde é o Claude ou o ChatGPT do escritório, sob o contrato que a casa já tem com eles e com o registro de uso dela.',
    verifica: 'Olhe a fatura do seu provedor de IA: a chamada é sua, não nossa.',
    peca: [
      { k: 'a chave', v: 'sua' },
      { k: 'o assistente', v: 'seu' },
      { k: 'a fatura do modelo', v: 'sua' },
    ],
  },
  {
    id: 'clientes',
    rotulo: 'Cada escritório vê só os próprios clientes',
    texto: 'Cada cliente pertence a um escritório, e dentro dele só a chave responsável o enxerga, a menos que a casa o compartilhe com todas. O servidor confere conta, chave e consentimento antes de cada leitura, e responde igual para cliente de outro escritório e para cliente que não existe. Cada leitura de carteira e cada cenário rodado sobre ela ficam registrados com a chave e a hora, sem as posições.',
    verifica: 'No painel de clientes, abra um cliente: o registro de acesso lista cada leitura, com a chave e a hora.',
    /* Os rótulos vêm do painel (utils/clientes.ts, ACTION_LABEL), encurtados
       para caber, para o comprador reconhecer a peça quando abrir o registro
       de acesso de um cliente. */
    peca: [
      { k: 'mesa · 14:02', v: 'Carteira consultada' },
      { k: 'mesa · 14:03', v: 'Simulação de cenário' },
      { k: 'outra conta', v: 'não encontrado', tom: 'nada' },
    ],
  },
  {
    id: 'aceite',
    rotulo: 'O aceite do cliente fica provado',
    texto: 'O consentimento guarda a data, a versão do termo, o hash do texto que o cliente leu e o navegador usado. Vale 12 meses; o cliente revoga quando quiser, pelo próprio link, e com a revogação as posições são apagadas. A conexão com a instituição do cliente é habilitada escritório a escritório, na implantação.',
    verifica: 'O cliente recebe um link de gestão: ali ele vê o registro de acesso e revoga sem falar com ninguém.',
    peca: [
      { k: 'data e hora', v: 'registradas' },
      { k: 'versão do termo', v: 'registrada' },
      { k: 'hash do texto', v: 'sha256' },
      { k: 'navegador', v: 'registrado' },
      { k: 'validade', v: '12 meses' },
    ],
  },
]
</script>

<template>
  <section id="seguranca" class="rbsg">
    <div class="rbsg__head">
      <NuSectionHeading eyebrow="Segurança">
        O que dá<br>pra verificar.
        <template #dek>
          Cinco afirmações que sobrevivem a uma <strong>due diligence</strong>,
          porque cada uma se confere no painel, no assistente ou na fatura.
          Nenhuma delas é selo ou adjetivo.
        </template>
      </NuSectionHeading>
    </div>

    <!-- role="list": o Safari tira a semântica de lista de <ol> sem marcador -->
    <ol class="rbsg__grade" role="list">
      <li v-for="(f, i) in FATOS" :key="f.id" class="rbsg__card">
        <div class="rbsg__topo">
          <span class="rbsg__n" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
          <h3 class="rbsg__rotulo">{{ f.rotulo }}</h3>
        </div>
        <p class="rbsg__texto">{{ f.texto }}</p>

        <!-- O pé (peça + como conferir) desce até a base do card: na mesma
             linha da grade os cards têm a mesma altura, e assim as peças e os
             "Como conferir" ficam alinhados entre si. -->
        <div class="rbsg__pe">
          <dl class="rbsg__peca">
            <div v-for="l in f.peca" :key="l.k">
              <dt>{{ l.k }}</dt>
              <dd :class="l.tom && `rbsg__${l.tom}`">{{ l.v }}</dd>
            </div>
          </dl>
          <p class="rbsg__como"><strong>Como conferir.</strong> {{ f.verifica }}</p>
        </div>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.rbsg {
  scroll-margin-top: calc(var(--nuh-h, 76px) + 24px);
  background: var(--nu-cream);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
/* Centrado, como o da RbDivisao: as duas seções que falam do arranjo inteiro
   abrem centradas, e as que narram um passo abrem à esquerda. */
.rbsg__head { max-width: 820px; margin-inline: auto; text-align: center; }
.rbsg__head :deep(.nsh__dek) { margin-inline: auto; }

/* Teto de 1280px: acima disso os cards só esticariam a linha de texto. */
.rbsg__grade {
  list-style: none; padding: 0;
  margin: clamp(48px, 5vw, 64px) auto 0; max-width: 1280px;
  display: grid; grid-template-columns: minmax(0, 1fr); gap: clamp(16px, 2vw, 24px);
}

/* Card sobre creme é branco (regra 2 do sistema); fio, não sombra, e raio de
   documento, como o quadro da RbDivisao. */
.rbsg__card {
  display: flex; flex-direction: column; gap: 16px; min-width: 0;
  background: var(--nu-white); border: 1px solid var(--nu-cream-line);
  border-radius: 16px; padding: clamp(20px, 2.4vw, 32px);
}
.rbsg__topo { display: flex; flex-direction: column; gap: 8px; }
.rbsg__n {
  color: var(--nu-blue-deep); font-size: var(--nu-fs-sm); font-weight: 700;
  font-variant-numeric: tabular-nums; letter-spacing: 1px;
}
.rbsg__rotulo {
  margin: 0; color: var(--nu-ink);
  font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.02em; line-height: 1.25;
}
/* Corpo em --nu-gray-2 sobre branco: 7,7:1. */
.rbsg__texto {
  margin: 0; color: var(--nu-gray-2);
  font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.6;
}

.rbsg__pe { margin-top: auto; display: flex; flex-direction: column; gap: 16px; }

/* A peça: o pedaço do painel, numa placa creme dentro do card branco. */
.rbsg__peca { margin: 0; padding: 4px 16px; background: var(--nu-cream); border-radius: 12px; }
.rbsg__peca > div {
  display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between;
  gap: 4px 12px; padding: 8px 0;
}
.rbsg__peca > div + div { border-top: 1px solid var(--nu-cream-line); }
.rbsg__peca dt {
  color: var(--nu-gray-2); font-size: var(--nu-fs-dense); font-weight: 500;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
/* margin-left auto: quando a linha não cabe (card estreito, celular de 320px)
   o estado desce e continua encostado à direita, como na linha inteira */
.rbsg__peca dd { margin: 0 0 0 auto; color: var(--nu-ink); font-size: var(--nu-fs-dense); font-weight: 700; }
/* --nu-gray sobre creme dá 4,97:1: o estado apagado continua legível. */
.rbsg__peca .rbsg__off { color: var(--nu-gray); text-decoration: line-through; }
/* a recusa não é um estado riscado (como a chave revogada): é a resposta */
.rbsg__peca .rbsg__nada { color: var(--nu-gray); }

/* --nu-gray sobre branco: 5,6:1. */
.rbsg__como {
  margin: 0; padding-top: 16px; border-top: 1px solid var(--nu-cream-line);
  color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55;
}
.rbsg__como strong { color: var(--nu-ink); font-weight: 700; }

/* No celular a peça sai, como saía a cena inteira antes: o texto e o "Como
   conferir" já carregam a afirmação, e as peças somavam ~680px (a seção ia de
   2.556px para 3.232px numa tela de 390). Do tablet para cima elas cabem. */
@media (max-width: 759.98px) {
  .rbsg__peca { display: none; }
}

/* tablet: duas colunas, e o quinto fecha a grade ocupando a linha inteira */
@media (min-width: 760px) {
  .rbsg__grade { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .rbsg__card:last-child { grid-column: 1 / -1; }
}
/* desktop largo: 3 + 2 em 6 trilhas. 1200px é onde o card de cima ainda dá
   ~35 caracteres por linha de texto; abaixo disso, três colunas apertam. */
@media (min-width: 1200px) {
  .rbsg__grade { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .rbsg__card { grid-column: span 2; }
  .rbsg__card:nth-child(n + 4) { grid-column: span 3; }
}
</style>
