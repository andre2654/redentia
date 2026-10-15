<script setup lang="ts">
/**
 * "O que dá pra verificar" — a seção de scroll travado.
 *
 * VOLTOU EM 15/10/2026. O PR #64 trocou esta seção por uma grade de cinco
 * cards (a auditoria visual reclamou do comprimento e do cinza dos passos fora
 * de foco), e o dono pediu de volta: o scroll travado é o gesto da Decade que
 * ele quer na página. Voltou igual, com três ajustes: a foto (a antiga tinha
 * rostos reconhecíveis e saiu do public/), a escala tipográfica nova e o passo
 * fora de foco um pouco menos apagado.
 *
 * MECÂNICA (direção do dono 2026-08-13): a coluna da esquerda fica FIXA e a
 * direita rola. A cada passo que entra em cena, o texto da direita avança e a
 * cena da esquerda troca junto: fundo geométrico e o artefato de produto.
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

/* As ferramentas listadas são as que EXISTEM no mcp-service, com o nome exato.
   Nunca invente nome de tool aqui: o comprador roda e confere. get_portfolio
   existe mas está FORA do escopo do plano de escritório (é a carteira PESSOAL
   do dono da chave), e é por isso que ela aparece marcada, não escondida.
   As quatro do escopo `clientes` só existem na chave de uma conta com o
   recurso habilitado (liberado pela Redentia, escritório a escritório).
   create_client_invite é a ÚNICA que escreve: cria um link inerte, que não dá
   acesso a nada até o cliente consentir. */
const TOOLS = [
  'get_quote', 'get_quotes', 'search_assets', 'get_market_snapshot', 'list_news',
  'get_thesis', 'list_theses', 'get_daily_briefing', 'get_etf_composition',
  'list_scenarios', 'simulate_scenario',
]
const TOOLS_CLIENTES = ['list_clients', 'create_client_invite', 'get_client_portfolio', 'simulate_client_scenario']

const FATOS = [
  {
    id: 'chaves',
    rotulo: 'Chave nomeada, revogável pela casa',
    texto: 'O escritório tem uma conta com uma chave por pessoa, cada uma com o nome de quem usa. Quem administra a conta liga, desliga e revoga qualquer uma delas sem depender da pessoa, e derrubar uma não derruba as outras. A revogada para de responder em até um minuto.',
    verifica: 'Gere duas chaves, revogue uma e veja a outra continuar respondendo.',
  },
  {
    id: 'leitura',
    rotulo: 'Leitura, com uma exceção declarada',
    texto: 'Das 15 ferramentas do servidor, 14 só leem. A exceção é create_client_invite, que cria um link de convite: sem o aceite do cliente, ele não dá acesso a nada. Não existe ferramenta de compra, de venda, de transferência nem de alteração de dado.',
    verifica: 'Peça a lista de ferramentas ao seu assistente e leia os nomes.',
  },
  {
    id: 'modelo',
    rotulo: 'O modelo é seu',
    texto: 'A Redentia não coloca modelo de IA próprio no caminho do seu dado e não treina nada com ele. Quando o time pergunta, quem responde é o Claude ou o ChatGPT do escritório, sob o contrato que a casa já tem com eles e com o registro de uso dela.',
    verifica: 'Olhe a fatura do seu provedor de IA: a chamada é sua, não nossa.',
  },
  {
    id: 'clientes',
    rotulo: 'Cada escritório vê só os próprios clientes',
    texto: 'Cada cliente pertence a um escritório, e dentro dele só a chave responsável o enxerga, a menos que a casa o compartilhe com todas. O servidor confere conta, chave e consentimento antes de cada leitura, e responde igual para cliente de outro escritório e para cliente que não existe. Cada leitura de carteira e cada cenário rodado sobre ela ficam registrados com a chave e a hora, sem as posições.',
    verifica: 'No painel de clientes, abra um cliente: o registro de acesso lista cada leitura, com a chave e a hora.',
  },
  {
    id: 'aceite',
    rotulo: 'O aceite do cliente fica provado',
    texto: 'O consentimento guarda a data, a versão do termo, o hash do texto que o cliente leu e o navegador usado. Vale 12 meses; o cliente revoga quando quiser, pelo próprio link, e com a revogação as posições são apagadas. A conexão com a instituição do cliente é habilitada escritório a escritório, na implantação.',
    verifica: 'O cliente recebe um link de gestão: ali ele vê o registro de acesso e revoga sem falar com ninguém.',
  },
] as const

const ativo = ref(0)
const passos = ref<HTMLElement[]>([])
let io: IntersectionObserver | null = null
/* ⚠️ O ÍNDICE MORA NUM MAPA, NÃO NUM indexOf DO ARRAY DE REF.
   `ref="passos"` num v-for é RECRIADO a cada re-render, e trocar `ativo`
   dispara re-render: o callback do observer chegava a rodar com o array vazio,
   `indexOf` devolvia -1 e o passo simplesmente não avançava. O sintoma era
   assimétrico e por isso enganava: descendo funcionava, subindo travava no
   último. O mapa é montado uma vez e não depende do ciclo de render. */
const indicePorEl = new WeakMap<Element, number>()

/* IntersectionObserver e não listener de scroll: a regra da casa é um motor de
   scroll só (useNuScrollFrame), e a forma de respeitar isso aqui é não abrir um
   segundo. O IO roda fora da main thread e não concorre com ele.
   rootMargin recorta a viewport numa faixa central: o passo vira ativo quando
   cruza o meio da tela, que é onde a coluna fixa está olhando. */
onMounted(() => {
  passos.value.forEach((el, i) => { if (el) indicePorEl.set(el, i) })
  io = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue
        const i = indicePorEl.get(e.target)
        if (i !== undefined) ativo.value = i
      }
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
  )
  passos.value.forEach((p) => p && io!.observe(p))
})
onBeforeUnmount(() => { io?.disconnect(); io = null })

/* ——— o mouse: paralaxe curta do fundo geométrico ———
   Só desktop com ponteiro fino, e checa reduced-motion à mão porque é JS (o
   @media global do base.css só congela CSS). rAF-throttled e com cleanup, pelo
   mesmo motivo que o motor de scroll da casa é assim. */
const cena = ref<HTMLElement | null>(null)
const par = ref({ x: 0, y: 0 })
let raf = 0
let alvo = { x: 0, y: 0 }

function moveu(ev: PointerEvent) {
  const el = cena.value
  if (!el) return
  const b = el.getBoundingClientRect()
  alvo = {
    x: ((ev.clientX - b.left) / b.width - 0.5) * 2,
    y: ((ev.clientY - b.top) / b.height - 0.5) * 2,
  }
  if (!raf) raf = requestAnimationFrame(aplica)
}
function aplica() {
  raf = 0
  par.value = alvo
}
function saiu() { alvo = { x: 0, y: 0 }; if (!raf) raf = requestAnimationFrame(aplica) }

const paralaxeLigada = ref(false)
onMounted(() => {
  paralaxeLigada.value =
    !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches &&
    !!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches
})
onBeforeUnmount(() => { if (raf) cancelAnimationFrame(raf); raf = 0 })
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

    <div class="rbsg__palco">
      <!-- ——— esquerda: fica ——— -->
      <div class="rbsg__fixa">
        <div
          ref="cena" class="rbsg__cena"
          :style="paralaxeLigada ? { '--px': par.x, '--py': par.y } : undefined"
          @pointermove="paralaxeLigada && moveu($event)"
          @pointerleave="paralaxeLigada && saiu()"
        >
          <!-- A foto ocupa a coluna inteira e o card assenta em cima dela
               (direção do dono 2026-08-13, no lugar dos fundos geométricos).
               alt="" porque é fundo, não assunto: o card na frente carrega a
               informação toda, e quem escuta não perde nada.
               `lazy` de propósito, ao contrário da foto do hero: esta seção só
               aparece depois de duas dobras de rolagem, então ela não é
               candidata a LCP e não deve competir com quem é. -->
          <!-- anotando.webp: mãos assinando, sem rosto. A reuniao.webp, que
               ficava aqui, tinha rostos reconhecíveis e direito de imagem
               pendente, e saiu do public/ em 15/10/2026. -->
          <img
            src="/business-hero/anotando.webp" alt="" class="rbsg__foto"
            width="620" height="620" loading="lazy" decoding="async" fetchpriority="low"
          >
          <span class="rbsg__scrim" aria-hidden="true" />

          <!-- o artefato: uma peça pequena do produto por fato -->
          <div class="rbsg__cards">
            <div v-for="(f, i) in FATOS" :key="f.id" class="rbsg__card" :class="{ 'rbsg__card--on': i === ativo }" :inert="i !== ativo">
              <span class="rbsg__card-label">{{ f.rotulo }}</span>

              <dl v-if="f.id === 'chaves'" class="rbsg__linhas">
                <div><dt>mesa</dt><dd>ativa</dd></div>
                <div><dt>alocação</dt><dd>ativa</dd></div>
                <div><dt>backoffice</dt><dd class="rbsg__off">revogada</dd></div>
              </dl>

              <ul v-else-if="f.id === 'leitura'" class="rbsg__tools">
                <li v-for="t in TOOLS" :key="t">{{ t }}</li>
                <li v-for="t in TOOLS_CLIENTES" :key="t">{{ t }} <span class="rbsg__tag">{{ t === 'create_client_invite' ? 'só o link' : 'conta habilitada' }}</span></li>
                <li class="rbsg__tool-fora">get_portfolio <span class="rbsg__tag">fora do plano</span></li>
              </ul>

              <dl v-else-if="f.id === 'modelo'" class="rbsg__linhas">
                <div><dt>a chave</dt><dd>sua</dd></div>
                <div><dt>o assistente</dt><dd>seu</dd></div>
                <div><dt>a fatura do modelo</dt><dd>sua</dd></div>
              </dl>

              <!-- Os rótulos vêm do painel (utils/clientes.ts, ACTION_LABEL),
                   encurtados para caber, para o comprador reconhecer a peça
                   quando abrir o registro de acesso de um cliente. -->
              <dl v-else-if="f.id === 'clientes'" class="rbsg__linhas">
                <div><dt>mesa · 14:02</dt><dd>Carteira consultada</dd></div>
                <div><dt>mesa · 14:03</dt><dd>Simulação de cenário</dd></div>
                <div><dt>outra conta</dt><dd class="rbsg__nada">não encontrado</dd></div>
              </dl>

              <dl v-else class="rbsg__linhas">
                <div><dt>data e hora</dt><dd>registradas</dd></div>
                <div><dt>versão do termo</dt><dd>registrada</dd></div>
                <div><dt>hash do texto</dt><dd>sha256</dd></div>
                <div><dt>navegador</dt><dd>registrado</dd></div>
                <div><dt>validade</dt><dd>12 meses</dd></div>
              </dl>

              <p class="rbsg__verifica">{{ f.verifica }}</p>
            </div>
          </div>
        </div>

        <!-- posição na sequência, e é controle: clicar leva ao passo -->
        <div class="rbsg__nav" role="group" aria-label="Ir para uma das cinco verificações">
          <button
            v-for="(f, i) in FATOS" :key="f.id" type="button"
            class="rbsg__dot" :class="{ 'rbsg__dot--on': i === ativo }" :aria-pressed="i === ativo"
            @click="passos[i]?.scrollIntoView({ block: 'center' })"
          >
            <span class="rbsg__dot-hit" aria-hidden="true" />
            <span class="rbsg__sr">{{ f.rotulo }}</span>
          </button>
        </div>
      </div>

      <!-- ——— direita: rola ——— -->
      <ol class="rbsg__trilha">
        <li v-for="(f, i) in FATOS" :key="f.id" ref="passos" class="rbsg__passo" :class="{ 'rbsg__passo--on': i === ativo }">
          <span class="rbsg__n">{{ String(i + 1).padStart(2, '0') }}</span>
          <h3 class="rbsg__rotulo">{{ f.rotulo }}</h3>
          <p class="rbsg__texto">{{ f.texto }}</p>
          <p class="rbsg__como"><strong>Como conferir.</strong> {{ f.verifica }}</p>
        </li>
      </ol>
    </div>
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

.rbsg__palco {
  margin-top: clamp(44px, 5vw, 68px);
  display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px, 5vw, 76px);
  align-items: start;
}

/* ——— a coluna que fica ——— */
/* FULL-BLEED DE VERDADE: encosta na borda esquerda da viewport e vai do fio de
   baixo do header até o fim da tela, sem folga em lugar nenhum.
   `top` e `height` leem --nuh-h, que o RbHeader publica no <html> e que muda
   76→58 no scroll. Com um valor fixo aqui, a cena ou passaria por baixo do
   header encolhido ou deixaria uma faixa de creme aparecendo em cima.
   O margin-left negativo cancela o gutter da section, que é a mesma técnica do
   painel do hero, só que para o outro lado. */
.rbsg__fixa {
  position: sticky; top: var(--nuh-h, 76px);
  height: calc(100vh - var(--nuh-h, 76px));
  margin-left: calc(-1 * clamp(22px, 5.5vw, 80px));
}
/* Sem raio: peça que encosta na borda da viewport com canto arredondado lê como
   card que vazou, não como banda. É a mesma decisão do quadrado do header. */
.rbsg__cena {
  position: relative; width: 100%; height: 100%;
  display: grid; place-items: center;
  background: var(--nu-navy); overflow: clip;
}

/* scale(1.06) é o que dá curso à paralaxe sem descolar a borda: a imagem move
   até 10px e continua cobrindo. Sem isso aparece uma fresta na quina oposta. */
.rbsg__foto {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; object-position: center;
  transform: scale(1.06) translate3d(calc(var(--px, 0) * -10px), calc(var(--py, 0) * -10px), 0);
  transition: transform .5s cubic-bezier(.22, .8, .24, 1);
}
/* Navy e não preto: a peça continua sendo "o outro lado" da página mesmo com
   imagem. Denso o bastante para o card branco assentar sem competir. */
.rbsg__scrim {
  position: absolute; inset: 0;
  background: linear-gradient(160deg, rgba(12, 21, 36, .30) 0%, rgba(12, 21, 36, .52) 52%, rgba(12, 21, 36, .68) 100%);
}

.rbsg__cards { position: relative; display: grid; width: min(340px, 82%); }
/* align-self: os cinco cards dividem a mesma célula, e sem isto todos esticavam
   até a altura do maior (o das 15 ferramentas): o card de chaves ficava com um
   vão branco embaixo. Centrado, cada um tem a altura do próprio conteúdo. */
.rbsg__card {
  grid-area: 1 / 1; align-self: center;
  background: var(--nu-white); border: 1px solid var(--nu-cream-line);
  border-radius: 14px; padding: 22px;
  opacity: 0; visibility: hidden;
}
/* passagem de bastão, o mesmo idioma do painel do hero: quem sai leva .24s e
   quem entra só começa depois, então os dois nunca aparecem sobrepostos */
.rbsg__card--on {
  opacity: 1; visibility: visible;
  animation: rbsg-entra .42s cubic-bezier(.22, .8, .24, 1) .2s both;
}
@keyframes rbsg-entra {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
}
.rbsg__card-label {
  display: block; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700;
  text-transform: uppercase; letter-spacing: 1.3px; line-height: 1.4;
}

.rbsg__linhas { margin: 16px 0 0; }
.rbsg__linhas > div {
  display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
  padding: 11px 0; border-top: 1px solid var(--nu-cream-line);
}
.rbsg__linhas dt {
  color: var(--nu-gray-2); font-size: var(--nu-fs-dense); font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.rbsg__linhas dd { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; }
.rbsg__off { color: var(--nu-gray) !important; text-decoration: line-through; }
/* a recusa não é um estado riscado (como a chave revogada): é a resposta */
.rbsg__nada { color: var(--nu-gray) !important; }

/* Duas colunas quando cabe: com cenários e clientes a lista passou de 9 para
   15 nomes, e numa coluna só ela estourava a altura do card. */
.rbsg__tools {
  margin: 14px 0 0; padding: 0; list-style: none;
  display: grid; grid-template-columns: repeat(auto-fill, minmax(min(190px, 100%), 1fr)); gap: 5px 14px;
}
.rbsg__tools li {
  color: var(--nu-gray-2); font-size: var(--nu-fs-xs); font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.rbsg__tool-fora { color: var(--nu-gray) !important; }

.rbsg__tag {
  display: inline-block; margin-left: 6px; padding: 2px 6px; border-radius: 4px;
  background: var(--nu-cream); color: var(--nu-gray);
  font-family: var(--nu-font); font-size: var(--nu-fs-xs); font-weight: 700;
  text-transform: uppercase; letter-spacing: .5px;
}

.rbsg__verifica {
  margin: 16px 0 0; padding-top: 14px; border-top: 1px solid var(--nu-cream-line);
  color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; line-height: 1.5;
}

/* Dentro da cena, no pé: com a cena ocupando a viewport inteira, os passadores
   fora dela ficariam abaixo da dobra e não seriam alcançáveis. */
.rbsg__nav {
  position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
  display: flex; justify-content: center; gap: 4px; z-index: 2;
}
.rbsg__dot {
  appearance: none; background: none; border: 0; cursor: pointer;
  padding: 19px 0; width: 40px; min-height: 44px; display: flex; align-items: center;
}
/* Par de cor de SUPERFÍCIE ESCURA, não o de claro: os passadores passaram a
   viver sobre a foto com scrim navy. --nu-ink-14 ali é invisível, e o anel de
   foco vira --nu-blue-soft, que é a convenção que RbProva, RbFooter e
   RbCapacidade já escreveram para foco sobre navy. */
.rbsg__dot-hit { display: block; width: 100%; height: 3px; border-radius: 2px; background: var(--nu-cream-text-35); transition: background .2s; }
.rbsg__dot--on .rbsg__dot-hit { background: var(--nu-cream-text); }
.rbsg__dot:hover .rbsg__dot-hit { background: var(--nu-cream-text-70); }
.rbsg__dot:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }
.rbsg__sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

/* ——— a coluna que rola ——— */
/* O padding-bottom NÃO é respiro, é o que mantém o sticky grudado até o fim.
   A conta: a cena tem (100vh - nuh) de altura e o sticky solta quando o scroll
   passa de (fim da trilha - altura da cena). Centralizar o último passo exige
   rolar até ((N - 0,5) x 76vh - 50vh) do topo da trilha; sem folga isso cai
   DEPOIS do ponto de soltura e a cena sobe junto com a página no último passo
   (medido com 4 passos: topo em -50px em vez de 58). A folga mínima sai 12vh
   e NÃO depende de N (o N cancela na conta), então os 5 passos de 11/10/2026
   cabem nos mesmos 16vh. */
.rbsg__trilha { margin: 0; padding: 0 0 16vh; list-style: none; }
/* A altura de cada passo é o que dá curso ao scroll travado. 76vh e não 100:
   com 100 o último passo precisa da tela inteira e a seção passa a terminar com
   um vão morto embaixo da cena. */
.rbsg__passo {
  min-height: 76vh; display: flex; flex-direction: column; justify-content: center;
  max-width: 46ch;
}
.rbsg__n {
  display: block; color: var(--nu-blue-deep); font-size: var(--nu-fs-dense); font-weight: 700;
  font-variant-numeric: tabular-nums; letter-spacing: 1px;
}
.rbsg__rotulo {
  margin: 12px 0 0; color: var(--nu-ink);
  font-size: var(--nu-fs-h2-sm); font-weight: 800; letter-spacing: -0.03em; line-height: 1.08;
}
.rbsg__texto {
  margin: 16px 0 0; color: var(--nu-gray-2);
  font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.6;
}
.rbsg__como {
  margin: 18px 0 0; padding-top: 16px; border-top: 1px solid var(--nu-cream-line);
  color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55;
}
.rbsg__como strong { color: var(--nu-ink); font-weight: 800; }
/* O passo fora de foco apaga, mas não some: quem lê rápido continua vendo os
   cinco, e quem está no meio sabe onde está. */
.rbsg__passo { opacity: .45; transition: opacity .4s ease; }
.rbsg__passo--on { opacity: 1; }

/* ——— empilhado: sem travar nada ———
   Scroll travado no celular é o pior lugar pra ele: a tela é curta, a cena
   comeria metade dela e o polegar disputa com o sticky. Vira lista simples, com
   os cinco passos abertos e sem apagar nenhum.
   ⚠️ A CENA SOME INTEIRA no celular, e com ela os artefatos (a lista de tools, o
   estado das chaves). É perda real e consciente: o texto de cada passo carrega a
   afirmação e o "como conferir", que é o que precisa sobreviver. Se um dia
   valer a pena, o caminho é a cena entrar DENTRO de cada passo, não voltar a
   ficar fixa. */
@media (max-width: 900px) {
  .rbsg__palco { grid-template-columns: 1fr; gap: 0; }
  .rbsg__fixa { display: none; }
  .rbsg__passo {
    min-height: 0; opacity: 1;
    padding: clamp(26px, 4vw, 34px) 0; border-top: 1px solid var(--nu-cream-line);
    max-width: none;
  }
}
</style>
