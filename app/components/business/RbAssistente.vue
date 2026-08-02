<script setup lang="ts">
/**
 * "O assistente" — o card do chat do Claude buscando o consolidado via MCP.
 *
 * Portado da landing prototipada (docs/redentia-business/revisoes/gen.py),
 * com as três lições que o protótipo pagou pra aprender:
 *
 *  1. REPOUSO = ESTADO FINAL. A conversa completa está no markup que o SSR
 *     serve: sem JS, aba em segundo plano ou reduced-motion, o card já conta
 *     a história. O filme DESMONTA ao tocar — nunca "monta ao tocar", senão o
 *     estado sem JS é uma janela vazia.
 *  2. ANIMAÇÃO NÃO MUDA ALTURA. Quem sai de cena sai por visibilidade
 *     (classe .off), com o espaço reservado — o card não pula no meio do
 *     filme. E o keyframe do chip anima SÓ transform: com fill-mode both,
 *     opacity no keyframe vira dona da propriedade e mata a transition.
 *  3. FASE SE ENCADEIA AO FIM DA ANTERIOR. A resposta só entra quando a
 *     digitação TERMINA, não em timeout absoluto: aba em segundo plano
 *     estrangula setInterval pra ~1 tick/s e os relógios se atropelam.
 *
 * Os números são os mesmos do exemplo fictício de toda a página B2B (Família
 * Bittencourt, R$ 1.284.902.117, Marina Duarte) — se mudar aqui, mudou no
 * aria-label também, que é a alternativa textual INTEIRA do card (role="img").
 *
 * COPY REVISADA E APROVADA (2026-08-01, revisão de conversão): o fecho da
 * resposta perdeu o bis de "7 contas em 4 instituições" (a linha de metadados
 * já diz isso a 60px, e no repouso as duas apareciam juntas), a nota trocou a
 * tripla vírgula por "e", e ganhou a frase de amplitude (o assistente
 * responde pelo mercado inteiro, não só pela carteira — capacidade real do
 * MCP, já no ar).
 */
const Q = 'Como está a carteira da Família Bittencourt?'
const FETCH_FIM = '7 contas em 4 instituições · apurado 05.08 às 07:12'
const FETCH_MEIO = 'Buscando na Redentia, cliente familia-bittencourt…'

// repouso = quadro final (o que o SSR serve)
const typed = ref('')
const digitando = ref(false)
const userIn = ref(true)
const toolOn = ref(true)
const toolLive = ref(false)
const buscando = ref(false)      // true = pontinhos; false = check
const fetchOn = ref(true)
const fetchText = ref(FETCH_FIM)
const ansN = ref(3)              // quantas frases da resposta estão visíveis
const sendPress = ref(false)
const cur = ref({ left: '40%', top: '80%', scale: 1, gone: true })

let timers: ReturnType<typeof setTimeout>[] = []
let typer: ReturnType<typeof setInterval> | null = null
function later(ms: number, fn: () => void) { timers.push(setTimeout(fn, ms)) }
function stopTyper() { if (typer) { clearInterval(typer); typer = null } }
function clearAll() { timers.forEach(clearTimeout); timers = []; stopTyper() }

function type(done: () => void) {
  let i = 0
  stopTyper()
  digitando.value = true
  typer = setInterval(() => {
    i++
    typed.value = Q.slice(0, i)
    if (i >= Q.length) { stopTyper(); digitando.value = false; done() }
  }, 44)
}

function play() {
  clearAll()
  typed.value = ''
  userIn.value = false; toolOn.value = false; ansN.value = 0
  fetchOn.value = false; buscando.value = true
  cur.value = { left: '40%', top: '80%', scale: 1, gone: false }
  later(700, () => type(afterTyping))
}

function afterTyping() {
  later(400, () => { cur.value = { ...cur.value, left: '91%', top: '87%' } })
  later(1300, () => { cur.value = { ...cur.value, scale: .82 }; sendPress.value = true })
  later(1600, () => { sendPress.value = false; stopTyper(); typed.value = ''; userIn.value = true })
  later(2200, () => {
    toolOn.value = true; toolLive.value = true
    fetchOn.value = true; fetchText.value = FETCH_MEIO
    cur.value = { ...cur.value, gone: true }
  })
  later(4100, () => {
    toolLive.value = false; buscando.value = false
    fetchText.value = FETCH_FIM; ansN.value = 1
  })
  later(4700, () => { ansN.value = 2 })
  later(5400, () => { ansN.value = 3 })
  later(9600, play)
}

onMounted(() => {
  // regra 11: animação disparada por JS checa reduced-motion à mão
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  later(2600, play)
})
onBeforeUnmount(clearAll)
</script>

<template>
  <section id="assistente" class="rbas">
    <div class="rbas__cols">
      <div class="rbas__intro">
        <NuSectionHeading eyebrow="O assistente">
          Você não abre<br>a Redentia.
          <template #dek>
            Você pergunta. O consolidado responde de dentro do assistente que o
            seu time já usa, e a resposta carrega o rastro:
            <strong>de quantas contas veio e quem conferiu</strong>.
          </template>
        </NuSectionHeading>
        <p class="rbas__nota">
          Claude Desktop, Claude Code e Cursor conectam hoje, cada pessoa com a
          própria chave e somente leitura. No ChatGPT ainda não. As mesmas
          chaves respondem pelo mercado brasileiro inteiro, não só pela carteira.
        </p>
      </div>

      <div class="rbas__right">
        <div
          class="rbas__card"
          role="img"
          aria-label="Dentro do Claude, a pergunta sobre a carteira de um cliente aciona a
            ferramenta redentia book_get_positions e recebe R$ 1.284.902.117 consolidados,
            maior peso em renda fixa, 46%, a partir de 7 contas em 4 instituições,
            conferido por Marina Duarte em 05.08."
        >
          <div class="rbas__bar">
            <span class="rbas__dots"><i /><i /><i /></span>
            <span class="rbas__app">
              <img src="/icons/logo-claude.webp" alt="" width="18" height="18" class="rbas__applogo">
              Claude
            </span>
            <span class="rbas__model">Sonnet</span>
          </div>

          <div class="rbas__thread">
            <div class="rbas__user" :class="{ 'rbas__user--in': userIn }">{{ Q }}</div>

            <span class="rbas__tool" :class="{ off: !toolOn, 'rbas__tool--live': toolLive }">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2l10 10-10 10L2 12z" fill="currentColor" />
              </svg>
              redentia · book_get_positions
              <span v-show="buscando" class="rbas__dot3"><i /><i /><i /></span>
              <svg
                v-show="!buscando" width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="3.4" stroke-linecap="round"
                stroke-linejoin="round" aria-hidden="true"
              ><path d="M4.5 12.5l5 5 10-11" /></svg>
            </span>

            <p class="rbas__fetch" :class="{ off: !fetchOn }">{{ fetchText }}</p>

            <p class="rbas__ans">
              <span :class="{ off: ansN < 1 }">A Família Bittencourt tem <strong>R$&nbsp;1.284.902.117</strong> consolidados. </span>
              <span :class="{ off: ansN < 2 }">O maior peso é <strong>renda fixa (46%)</strong>. </span>
              <span class="rbas__src" :class="{ off: ansN < 3 }">Conferido por Marina Duarte em 05.08.</span>
            </p>
          </div>

          <div class="rbas__in">
            <span class="rbas__txt">
              <template v-if="typed">{{ typed }}<span v-if="digitando" class="rbas__car" /></template>
              <span v-else class="rbas__ph">Pergunte qualquer coisa…</span>
            </span>
            <span class="rbas__send" :class="{ 'rbas__send--press': sendPress }">
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
              ><path d="M12 19V5M5 12l7-7 7 7" /></svg>
            </span>
          </div>

          <svg
            class="rbas__cur" :class="{ 'rbas__cur--gone': cur.gone }"
            :style="{ left: cur.left, top: cur.top, transform: `scale(${cur.scale})` }"
            width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"
          >
            <path
              d="M5 3l14 8-6.5 1.5L9 19z" fill="var(--nu-ink)"
              stroke="var(--nu-white)" stroke-width="1.6" stroke-linejoin="round"
            />
          </svg>
        </div>
        <p class="rbas__legenda">Exemplo. Escritório, nomes e números são fictícios.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rbas {
  scroll-margin-top: calc(var(--nuh-h, 76px) + 24px);
  background: var(--nu-white);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.rbas__cols {
  display: flex; gap: clamp(32px, 5vw, 76px);
  align-items: center; flex-wrap: wrap;
}
.rbas__intro { flex: 1 1 460px; min-width: min(300px, 100%); }
.rbas__right { flex: 1 1 420px; min-width: min(300px, 100%); }
.rbas__nota {
  margin: clamp(24px, 3vw, 34px) 0 0; max-width: 480px;
  color: var(--nu-gray); font-size: 14.5px; font-weight: 600; line-height: 1.6;
}

/* ——— o artefato: a janela do assistente. Hairline, não sombra. ——— */
.rbas__card {
  position: relative; width: min(468px, 100%); margin-left: auto;
  background: var(--nu-white); border: 1px solid var(--nu-ink-14);
  border-radius: 16px; min-height: clamp(300px, 26vw, 328px);
  display: flex; flex-direction: column; overflow: hidden;
}
.rbas__legenda {
  margin: 12px 0 0; width: min(468px, 100%); margin-left: auto;
  color: var(--nu-gray); font-size: 12.5px; font-weight: 600; text-align: left;
}

.rbas__bar {
  display: flex; align-items: center; gap: 10px; padding: 13px 16px;
  background: var(--nu-cream); border-bottom: 1px solid var(--nu-ink-14);
}
.rbas__dots { display: flex; gap: 5px; }
.rbas__dots i {
  width: 9px; height: 9px; border-radius: 50%;
  box-shadow: inset 0 0 0 1px var(--nu-ink-14);
}
.rbas__app {
  display: inline-flex; align-items: center; gap: 7px;
  color: var(--nu-ink); font-size: 13.5px; font-weight: 800;
}
.rbas__applogo { width: 18px; height: 18px; border-radius: 4px; display: block; }
.rbas__model {
  margin-left: auto; color: var(--nu-gray); font-size: 11px; font-weight: 800;
  padding: 4px 10px; border-radius: 5px; box-shadow: inset 0 0 0 1px var(--nu-ink-14);
}

/* a conversa cresce de baixo pra cima, ancorada no campo, como em qualquer
   assistente — sem isso o quadro vazio do filme deixa um buraco no topo */
.rbas__thread {
  flex: 1; padding: 18px 16px 8px;
  display: flex; flex-direction: column; justify-content: flex-end; gap: 12px;
}

/* fora de cena mas ocupando o lugar (lição nº 2 do cabeçalho) */
.off { visibility: hidden; opacity: 0; }
.rbas__tool, .rbas__fetch, .rbas__ans span { transition: opacity .32s ease; }

.rbas__user {
  align-self: flex-end; max-width: 86%;
  color: var(--nu-ink); font-size: 13.5px; font-weight: 600; line-height: 1.45;
  padding: 10px 14px; border-radius: 10px 10px 3px 10px;
  box-shadow: inset 0 0 0 1px var(--nu-ink-14);
  opacity: 0; transform: translateY(6px);
  transition: opacity .3s ease, transform .35s cubic-bezier(.34, 1.4, .6, 1);
}
.rbas__user--in { opacity: 1; transform: none; }

.rbas__tool {
  display: inline-flex; align-items: center; gap: 7px; align-self: flex-start;
  color: var(--nu-blue-deep);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px; font-weight: 700; padding: 7px 12px; border-radius: 6px;
  border: 1px solid var(--nu-blue-soft);
  animation: rbas-pop .35s cubic-bezier(.34, 1.4, .6, 1) both;
}
/* pulso do "buscando": verde-soft do sistema no lugar do rgba hardcoded do
   protótipo. Morre quando o check entra. */
.rbas__tool--live { animation: rbas-pop .35s cubic-bezier(.34, 1.4, .6, 1) both, rbas-pulse 1.1s ease-out .3s infinite; }
/* SÓ transform (lição nº 2): opacity aqui + fill-mode both = transition morta */
@keyframes rbas-pop { from { transform: translateY(6px) scale(.9); } }
@keyframes rbas-pulse {
  from { box-shadow: 0 0 0 0 var(--nu-green-soft-35); }
  to { box-shadow: 0 0 0 10px transparent; }
}
.rbas__dot3 { display: inline-flex; gap: 3px; }
.rbas__dot3 i {
  width: 4px; height: 4px; border-radius: 50%; background: currentColor;
  animation: rbas-blink 1s ease-in-out infinite;
}
.rbas__dot3 i:nth-child(2) { animation-delay: .18s; }
.rbas__dot3 i:nth-child(3) { animation-delay: .36s; }
@keyframes rbas-blink { 50% { opacity: .25; } }

.rbas__fetch { margin: -4px 0 0; color: var(--nu-gray); font-size: 12px; font-weight: 600; }
.rbas__ans { margin: 0; color: var(--nu-ink); font-size: 13.5px; font-weight: 500; line-height: 1.55; }
.rbas__ans strong { font-weight: 800; font-variant-numeric: tabular-nums; }
.rbas__src { color: var(--nu-gray); }

.rbas__in {
  display: flex; align-items: center; gap: 10px; margin: 10px 14px 14px;
  border-radius: 10px; box-shadow: inset 0 0 0 1px var(--nu-ink-14);
  padding: 11px 8px 11px 16px; min-height: 42px;
}
.rbas__txt {
  flex: 1; color: var(--nu-ink); font-size: 13px; font-weight: 600;
  white-space: nowrap; overflow: hidden;
}
.rbas__ph { color: var(--nu-gray); font-weight: 500; }
.rbas__car {
  display: inline-block; width: 2px; height: 1em; background: var(--nu-blue);
  vertical-align: text-bottom; margin-left: 1px;
  animation: rbas-caret .8s step-end infinite;
}
@keyframes rbas-caret { 50% { opacity: 0; } }
.rbas__send {
  width: 30px; height: 30px; flex: none; border-radius: 7px;
  background: var(--nu-blue); color: var(--nu-white);
  display: grid; place-items: center; transition: transform .15s ease;
}
.rbas__send--press { transform: scale(.85); }

.rbas__cur {
  position: absolute; z-index: 3;
  transition: left .95s cubic-bezier(.45, 0, .2, 1), top .95s cubic-bezier(.45, 0, .2, 1),
    transform .16s ease, opacity .4s ease;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, .3));
}
.rbas__cur--gone { opacity: 0; }

@media (max-width: 760px) {
  .rbas__card, .rbas__legenda { margin-left: 0; }
}
</style>
