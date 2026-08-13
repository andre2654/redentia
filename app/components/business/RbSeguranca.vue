<script setup lang="ts">
/**
 * "O que dá pra verificar" — a seção de scroll travado.
 *
 * MECÂNICA (direção do dono 2026-08-13): a coluna da esquerda fica FIXA e a
 * direita rola. A cada passo que entra em cena, o texto da direita avança e a
 * cena da esquerda troca junto: fundo geométrico e o artefato de produto.
 *
 * ⚠️ TRAVA DE PUBLICAÇÃO, HERDADA E AINDA VÁLIDA: esta seção descreve a
 * arquitetura decidida no PLANO-REDENTIA-FOR-BUSINESS e parte dela ainda NÃO
 * EXISTE. O `pg-biz` é o PR5. Tirar o noindex antes disso continua decisão do
 * dono, não desta copy.
 *
 * ⚠️ DUAS AFIRMAÇÕES FORAM CORRIGIDAS AQUI, e não por gosto:
 *
 *  FATO 3 dizia "A integração lê a sua base e gera relatório". Falso nas DUAS
 *  metades hoje: o escopo do plano de escritório é ['mercado','teses','news']
 *  (BusinessKey.php:42), sem carteira, então a chave não alcança base nenhuma
 *  do escritório; e a geração de PDF não existe, coisa que o FAQ desta mesma
 *  página admite (faq.ts:139). Era a única das quatro afirmações NÃO marcada
 *  como futura e simplesmente falsa, dentro de um bloco cujo dek promete
 *  "sobreviver a uma due diligence". Virou o que é verificável: as oito
 *  ferramentas do servidor são todas de leitura, e os nomes estão na tela.
 *
 *  FATO 4 dizia "não coloca modelo de IA nenhum no caminho do seu dado". O
 *  PLANO §5.2 proíbe essa frase com todas as letras, porque em MCP o resultado
 *  da tool entra no contexto do modelo POR DEFINIÇÃO, e prescreve "modelo
 *  PRÓPRIO". O FAQ já usava a versão certa (faq.ts:107); a seção de segurança
 *  tinha perdido a palavra. Uma palavra é a diferença entre verdadeiro e falso.
 *
 * O QUE O DECK DIZ E ESTA SEÇÃO CONTINUA NÃO REPETINDO, as três da lista de
 * afirmações falsas do parecer de compliance:
 *  - "Criptografia de ponta a ponta": TLS e disco cifrado não são E2E.
 *  - "Os dados nunca cruzam com terceiros": hoje são 8 de 72 tabelas com tenant
 *    num banco único.
 *  - "Tratando patrimônio como dados médicos": dado financeiro NÃO é dado
 *    sensível na LGPD (art. 5º, II). Erra pra cima na frente de quem lê contrato.
 */

/* As oito ferramentas são as que EXISTEM no mcp-service, com o nome exato.
   Nunca invente nome de tool aqui: o comprador roda e confere. get_portfolio
   existe mas está FORA do escopo do plano de escritório, e é por isso que ela
   aparece marcada, não escondida. */
const TOOLS = [
  'get_quote', 'search_assets', 'get_market_snapshot', 'list_news',
  'get_thesis', 'list_theses', 'get_daily_briefing',
]

const FATOS = [
  {
    id: 'banco',
    rotulo: 'Banco separado',
    texto: 'Os dados do seu escritório entram em banco separado do produto de pessoa física, com o isolamento entre organizações aplicado no próprio banco. É pré-requisito para dado real de escritório entrar, não um upgrade vendido depois.',
    verifica: 'Pergunte na reunião em que banco a sua base vai morar, e peça a data.',
  },
  {
    id: 'chaves',
    rotulo: 'Chave nomeada, revogável pela casa',
    texto: 'O escritório tem uma conta com até cinco chaves, cada uma com o nome de quem usa. Quem criou a conta liga, desliga e revoga qualquer uma delas sem depender da pessoa, e derrubar uma não derruba as outras.',
    verifica: 'Gere duas chaves, revogue uma, e veja a outra continuar respondendo.',
  },
  {
    id: 'leitura',
    rotulo: 'Somente leitura',
    texto: 'Todas as ferramentas do servidor são de leitura. Não existe ferramenta de compra, de venda, de transferência nem de correção de lançamento. O que entra na sua base continua entrando por você.',
    verifica: 'Peça a lista de ferramentas ao seu assistente e leia os nomes.',
  },
  {
    id: 'modelo',
    rotulo: 'O modelo é seu',
    texto: 'A Redentia não coloca modelo próprio no caminho do seu dado, e não treina nada com ele. Quando o seu time pergunta pelo assistente, o modelo é o seu, rodando sob o seu contrato, com o seu registro de uso.',
    verifica: 'Olhe a fatura do seu provedor de IA: a chamada é sua, não nossa.',
  },
] as const

const ativo = ref(0)
const passos = ref<HTMLElement[]>([])
let io: IntersectionObserver | null = null

/* IntersectionObserver e não listener de scroll: a regra da casa é um motor de
   scroll só (useNuScrollFrame), e a forma de respeitar isso aqui é não abrir um
   segundo. O IO roda fora da main thread e não concorre com ele.
   rootMargin recorta a viewport numa faixa central: o passo vira ativo quando
   cruza o meio da tela, que é onde a coluna fixa está olhando. */
onMounted(() => {
  io = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue
        const i = passos.value.indexOf(e.target as HTMLElement)
        if (i >= 0) ativo.value = i
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
          Quatro afirmações que sobrevivem a uma <strong>due diligence</strong>,
          porque cada uma se checa olhando a arquitetura ou rodando um teste.
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
          <img
            src="/business-hero/reuniao.webp" alt="" class="rbsg__foto"
            width="620" height="620" loading="lazy" decoding="async" fetchpriority="low"
          >
          <span class="rbsg__scrim" aria-hidden="true" />

          <!-- o artefato: uma peça pequena do produto por fato -->
          <div class="rbsg__cards">
            <div v-for="(f, i) in FATOS" :key="f.id" class="rbsg__card" :class="{ 'rbsg__card--on': i === ativo }" :inert="i !== ativo">
              <span class="rbsg__card-label">{{ f.rotulo }}</span>

              <dl v-if="f.id === 'banco'" class="rbsg__linhas">
                <div><dt>pg-app</dt><dd>pessoa física</dd></div>
                <div><dt>pg-biz</dt><dd>escritórios <span class="rbsg__tag">no PR5</span></dd></div>
              </dl>

              <dl v-else-if="f.id === 'chaves'" class="rbsg__linhas">
                <div><dt>mesa</dt><dd>ativa</dd></div>
                <div><dt>alocação</dt><dd>ativa</dd></div>
                <div><dt>backoffice</dt><dd class="rbsg__off">revogada</dd></div>
              </dl>

              <ul v-else-if="f.id === 'leitura'" class="rbsg__tools">
                <li v-for="t in TOOLS" :key="t">{{ t }}</li>
                <li class="rbsg__tool-fora">get_portfolio <span class="rbsg__tag">fora do plano</span></li>
              </ul>

              <dl v-else class="rbsg__linhas">
                <div><dt>a chave</dt><dd>sua</dd></div>
                <div><dt>o assistente</dt><dd>seu</dd></div>
                <div><dt>a fatura do modelo</dt><dd>sua</dd></div>
              </dl>

              <p class="rbsg__verifica">{{ f.verifica }}</p>
            </div>
          </div>
        </div>

        <!-- posição na sequência, e é controle: clicar leva ao passo -->
        <div class="rbsg__nav" role="group" aria-label="Ir para uma das quatro verificações">
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
.rbsg__card {
  grid-area: 1 / 1;
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
  display: block; color: var(--nu-gray); font-size: 11px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 1.3px; line-height: 1.4;
}

.rbsg__linhas { margin: 16px 0 0; }
.rbsg__linhas > div {
  display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
  padding: 11px 0; border-top: 1px solid var(--nu-cream-line);
}
.rbsg__linhas dt {
  color: var(--nu-gray-2); font-size: 13px; font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.rbsg__linhas dd { margin: 0; color: var(--nu-ink); font-size: 13.5px; font-weight: 800; }
.rbsg__off { color: var(--nu-gray) !important; text-decoration: line-through; }

.rbsg__tools {
  margin: 14px 0 0; padding: 0; list-style: none;
  display: flex; flex-direction: column; gap: 5px;
}
.rbsg__tools li {
  color: var(--nu-gray-2); font-size: 12px; font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.rbsg__tool-fora { color: var(--nu-gray) !important; }

.rbsg__tag {
  display: inline-block; margin-left: 6px; padding: 2px 6px; border-radius: 4px;
  background: var(--nu-cream); color: var(--nu-gray);
  font-family: var(--nu-font); font-size: 10px; font-weight: 800;
  text-transform: uppercase; letter-spacing: .5px;
}

.rbsg__verifica {
  margin: 16px 0 0; padding-top: 14px; border-top: 1px solid var(--nu-cream-line);
  color: var(--nu-gray); font-size: 12.5px; font-weight: 600; line-height: 1.5;
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
.rbsg__trilha { margin: 0; padding: 0; list-style: none; }
/* A altura de cada passo é o que dá curso ao scroll travado. 76vh e não 100:
   com 100 o último passo precisa da tela inteira e a seção passa a terminar com
   um vão morto embaixo da cena. */
.rbsg__passo {
  min-height: 76vh; display: flex; flex-direction: column; justify-content: center;
  max-width: 46ch;
}
.rbsg__n {
  display: block; color: var(--nu-blue-deep); font-size: 13px; font-weight: 800;
  font-variant-numeric: tabular-nums; letter-spacing: 1px;
}
.rbsg__rotulo {
  margin: 12px 0 0; color: var(--nu-ink);
  font-size: clamp(22px, 2.4vw, 30px); font-weight: 800; letter-spacing: -0.025em; line-height: 1.15;
}
.rbsg__texto {
  margin: 16px 0 0; color: var(--nu-gray-2);
  font-size: clamp(15.5px, 1.5vw, 17px); font-weight: 500; line-height: 1.65;
}
.rbsg__como {
  margin: 18px 0 0; padding-top: 16px; border-top: 1px solid var(--nu-cream-line);
  color: var(--nu-gray); font-size: 13.5px; font-weight: 600; line-height: 1.55;
}
.rbsg__como strong { color: var(--nu-ink); font-weight: 800; }
/* O passo fora de foco apaga, mas não some: quem lê rápido continua vendo os
   quatro, e quem está no meio sabe onde está. */
.rbsg__passo { opacity: .38; transition: opacity .4s ease; }
.rbsg__passo--on { opacity: 1; }

/* ——— empilhado: sem travar nada ———
   Scroll travado no celular é o pior lugar pra ele: a tela é curta, a cena
   comeria metade dela e o polegar disputa com o sticky. Vira lista simples, com
   os quatro passos abertos e sem apagar nenhum.
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
