<script setup lang="ts">
/**
 * "O assistente" — o card do chat do Claude respondendo com a Redentia via MCP.
 *
 * Portado da landing prototipada (docs/redentia-business/revisoes/gen.py),
 * com as três lições que o protótipo pagou pra aprender:
 *
 *  1. REPOUSO = ESTADO FINAL. A primeira conversa completa está no markup que o
 *     SSR serve: sem JS, aba em segundo plano ou reduced-motion, o card já conta
 *     a história. O filme DESMONTA ao tocar — nunca "monta ao tocar", senão o
 *     estado sem JS é uma janela vazia.
 *  2. ANIMAÇÃO NÃO MUDA ALTURA. Quem sai de cena sai por visibilidade
 *     (classe .off), com o espaço reservado. Agora são DUAS conversas, e elas
 *     dividem a MESMA célula de grid (o truque do RbHero): a altura da janela é
 *     a da conversa maior e não pula na troca. E o keyframe do chip anima SÓ
 *     transform: com fill-mode both, opacity no keyframe mata a transition.
 *  3. FASE SE ENCADEIA AO FIM DA ANTERIOR. A resposta só entra quando a
 *     digitação TERMINA, não em timeout absoluto: aba em segundo plano
 *     estrangula setInterval pra ~1 tick/s e os relógios se atropelam.
 *
 * E UMA QUE FALTAVA (SC 2.2.2, nível A): o filme roda em loop por mais de 5 s,
 * então tem controle. As duas abas abaixo da janela são botões de verdade:
 * tocar em qualquer uma PARA o loop para sempre e mostra aquela conversa
 * inteira. É o mesmo contrato dos indicadores do RbHero.
 *
 * ⚠️ TROCA DE 11/10/2026. O card mostrava "Família Bittencourt, R$ 1.284.902.117
 * consolidados, conferido por Marina Duarte" vindo de get_portfolio, que é a
 * carteira PESSOAL do dono da chave e fica fora do plano de escritório (a chave
 * rdt_biz_ recebe recusa). O comprador repetia a pergunta na call e levava um
 * "não". Agora são os dois fluxos que vendem e que existem:
 *
 *  - CENÁRIO: carteira colada (serve à assessoria vinculada, que não compartilha
 *    carteira de cliente) rodada em simulate_scenario no cenário estudado
 *    expansao-fiscal-pos-2026, sem nome de candidato.
 *  - LISTA: list_news sobre três ativos de uma lista de mesa.
 *
 * ⚠️ OS NÚMEROS SÃO RESPOSTAS REAIS DO SERVIDOR, não invenção de copy:
 *  - cenário: MCP de produção em 12/10/2026, motor 3.4.1, R$ 1.000.000 em
 *    CDB pós 100% CDI 300k, PETR4 150k, VALE3 150k, IVVB11 150k, WEGE3 100k e
 *    LREN3 150k, 1 ano. final.p10 875.395 e p90 1.164.300 (reais de hoje; no 3.3.0 eram 844.897 e 1.123.605);
 *    LREN3 −30,37% (beta×IBOV −18,4 + consumo doméstico −12,0); IVVB11 +9,45%
 *    (dólar +4,5, exterior +6,0).
 *  - lista: list_news de 09/10/2026 (feed com a leitura da Redentia): JCP do
 *    SANB11 (R$ 0,401/unit, corte 20/10, pagamento a partir de 09/11), IVVB11
 *    no vermelho na semana com o dólar −4,44%, MRVE3 +22% com o caixa vindo da
 *    venda de Resia e Luggo.
 * A carteira foi escolhida SEM os ativos em que o conselho de produto de
 * 09/10/2026 achou carga errada no motor (Tesouro IPCA+ longo, FII de papel,
 * banco com `juros_sensitive`): a resposta da página é a que o comprador
 * reproduz na call. Quando o motor mudar de versão (conserto de IPCA+, FII de
 * papel e inflação do Focus), RODE DE NOVO a mesma carteira e troque os
 * números aqui, no aria-label e na legenda, que cita a data e a versão.
 *
 * Nunca invente nome de tool aqui: o comprador roda e confere.
 */
interface Trecho { t: string, b?: boolean }
interface Cena {
  id: string
  aba: string
  q: string
  anexo?: string
  tool: string
  fetchMeio: string
  fetchFim: string
  /** três frases; `fonte` pinta a frase de cinza (a ressalva, não o fato) */
  ans: { trechos: Trecho[], fonte?: boolean }[]
}

const CENAS: Cena[] = [
  {
    id: 'cenario',
    aba: 'Cenário na carteira',
    q: 'Como fica esta carteira se o fiscal piorar depois da eleição?',
    // \u00a0: "R$ 1 milhão" não pode quebrar no meio (a 375px quebrava em "R$ 1 / milhão")
    anexo: 'Carteira colada · 6 ativos · R$\u00a01\u00a0milhão',
    tool: 'simulate_scenario',
    fetchMeio: 'Rodando 2.000 caminhos em Expansão fiscal pós-2026…',
    fetchFim: 'Cenário estudado pela Redentia, com fontes · 1 ano',
    ans: [
      { trechos: [{ t: 'Em 80% dos caminhos, a carteira termina o ano entre ' }, { t: 'R$\u00a0875\u00a0mil e R$\u00a01,16\u00a0milhão', b: true }, { t: ', em reais de hoje. ' }] },
      { trechos: [{ t: 'Pesa mais ' }, { t: 'LREN3 (−30%)', b: true }, { t: ', pelo índice e pelo consumo doméstico; segura ' }, { t: 'IVVB11 (+9%)', b: true }, { t: ', com dólar e exterior. ' }] },
      { trechos: [{ t: 'Faixa com premissas abertas, não promessa de retorno.' }], fonte: true },
    ],
  },
  {
    id: 'lista',
    aba: 'O que mudou na lista',
    q: 'O que mudou na minha lista? SANB11, IVVB11 e MRVE3',
    tool: 'list_news',
    fetchMeio: 'Lendo as notícias dos 3 ativos…',
    fetchFim: 'Notícias de 09.10 com a leitura da Redentia',
    ans: [
      { trechos: [{ t: 'SANB11', b: true }, { t: ' aprovou JCP de R$ 0,401 por unit: corte em 20/10, pagamento a partir de 09/11. ' }] },
      { trechos: [{ t: 'IVVB11', b: true }, { t: ' fecha a semana no vermelho em reais: o dólar caiu 4,4%, mais que a alta do S&P 500. ' }] },
      { trechos: [{ t: 'MRVE3', b: true }, { t: ' subiu 22% com venda recorde, mas o caixa veio da venda de ativos.' }] },
    ],
  },
]

// repouso = quadro final da primeira conversa (o que o SSR serve)
const cena = ref(0)
const typed = ref('')
const digitando = ref(false)
const userIn = ref(true)
const toolOn = ref(true)
const toolLive = ref(false)
const buscando = ref(false)      // true = pontinhos; false = check
const fetchOn = ref(true)
const fetchFinal = ref(true)     // false = texto de "buscando"
const ansN = ref(3)              // quantas frases da resposta estão visíveis
const sendPress = ref(false)
const cur = ref({ left: '40%', top: '80%', scale: 1, gone: true })
/** true depois que a pessoa tocou numa aba: o loop morre e não volta. */
const parado = ref(false)

let timers: ReturnType<typeof setTimeout>[] = []
let typer: ReturnType<typeof setInterval> | null = null
function later(ms: number, fn: () => void) { timers.push(setTimeout(fn, ms)) }
function stopTyper() { if (typer) { clearInterval(typer); typer = null } }
function clearAll() { timers.forEach(clearTimeout); timers = []; stopTyper() }

/** O estado de cada conversa: a ativa segue o filme; a outra fica inteira, mas invisível (reserva a altura). */
function estado(i: number) {
  if (i !== cena.value) {
    return { userIn: true, toolOn: true, toolLive: false, buscando: false, fetchOn: true, fetchFinal: true, ansN: 3 }
  }
  return {
    userIn: userIn.value, toolOn: toolOn.value, toolLive: toolLive.value, buscando: buscando.value,
    fetchOn: fetchOn.value, fetchFinal: fetchFinal.value, ansN: ansN.value,
  }
}

function type(q: string, done: () => void) {
  let i = 0
  stopTyper()
  digitando.value = true
  typer = setInterval(() => {
    i++
    typed.value = q.slice(0, i)
    if (i >= q.length) { stopTyper(); digitando.value = false; done() }
  }, 44)
}

function play(i: number) {
  clearAll()
  cena.value = i
  typed.value = ''
  userIn.value = false; toolOn.value = false; ansN.value = 0
  fetchOn.value = false; buscando.value = true; fetchFinal.value = false
  cur.value = { left: '40%', top: '80%', scale: 1, gone: false }
  later(700, () => type(CENAS[i]!.q, () => afterTyping(i)))
}

function afterTyping(i: number) {
  later(400, () => { cur.value = { ...cur.value, left: '91%', top: '87%' } })
  later(1300, () => { cur.value = { ...cur.value, scale: .82 }; sendPress.value = true })
  later(1600, () => { sendPress.value = false; stopTyper(); typed.value = ''; userIn.value = true })
  later(2200, () => {
    toolOn.value = true; toolLive.value = true
    fetchOn.value = true; fetchFinal.value = false
    cur.value = { ...cur.value, gone: true }
  })
  later(4100, () => {
    toolLive.value = false; buscando.value = false
    fetchFinal.value = true; ansN.value = 1
  })
  later(4700, () => { ansN.value = 2 })
  later(5400, () => { ansN.value = 3 })
  later(11000, () => play((i + 1) % CENAS.length))
}

/* Tocar numa aba é assumir o controle: o loop morre e a conversa escolhida
   aparece inteira, sem filme (quem escolheu quer ler, não assistir). */
function mostrar(i: number) {
  parado.value = true
  clearAll()
  cena.value = i
  typed.value = ''; digitando.value = false; sendPress.value = false
  userIn.value = true; toolOn.value = true; toolLive.value = false; buscando.value = false
  fetchOn.value = true; fetchFinal.value = true; ansN.value = 3
  cur.value = { ...cur.value, gone: true }
}

onMounted(() => {
  // regra 11: animação disparada por JS checa reduced-motion à mão
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  later(2600, () => { if (!parado.value) play(0) })
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
            Você pergunta no Claude ou no ChatGPT que a mesa já usa, e a resposta
            chega com a fonte: <strong>a faixa do cenário, o porquê de cada ativo
            e a data de cada notícia</strong>.
          </template>
        </NuSectionHeading>
        <p class="rbas__nota">
          O claude.ai e o ChatGPT conectam pela chave com um clique em
          Autorizar; Claude Desktop, Claude Code e Cursor, pela configuração.
          Cada pessoa usa a chave que o escritório gerou pra ela. A carteira do
          cenário vem colada na conversa, em valores ou em pesos, sem nome e
          sem ficar salva na conta; ou vem de um cliente conectado, com o
          consentimento dele, quando o escritório tem Clientes do escritório. E o
          <NuxtLink to="/business/skills" class="rbas__nota-link">pack de skills</NuxtLink>
          já sai pronto pra mesa usar.
        </p>
      </div>

      <div class="rbas__right">
        <div
          class="rbas__card"
          role="img"
          aria-label="Duas conversas dentro do Claude. Na primeira, a pergunta sobre como uma
            carteira colada de R$ 1 milhão fica se o fiscal piorar depois da eleição aciona a
            ferramenta redentia simulate_scenario: em 80% dos caminhos a carteira termina o ano
            entre R$ 875 mil e R$ 1,16 milhão, em reais de hoje; LREN3 cai 30% e IVVB11 sobe 9%.
            Na segunda, a pergunta sobre o que mudou em SANB11, IVVB11 e MRVE3 aciona list_news:
            o Santander aprovou JCP com corte em 20/10, o IVVB11 fecha a semana no vermelho em
            reais com o dólar 4,4% mais baixo, e MRVE3 subiu 22% com o caixa vindo da venda de ativos."
        >
          <div class="rbas__bar">
            <span class="rbas__dots"><i /><i /><i /></span>
            <span class="rbas__app">
              <img src="/icons/logo-claude.webp" alt="" width="18" height="18" class="rbas__applogo">
              Claude
            </span>
            <span class="rbas__model">Sonnet</span>
          </div>

          <!-- As duas conversas na MESMA célula (lição nº 2): a altura é a da
               maior e não oscila na troca. A inativa fica inteira e invisível. -->
          <div class="rbas__thread">
            <div
              v-for="(c, i) in CENAS" :key="c.id"
              class="rbas__cena" :class="{ 'rbas__cena--off': i !== cena }"
            >
              <div class="rbas__user" :class="{ 'rbas__user--in': estado(i).userIn }">
                {{ c.q }}
                <span v-if="c.anexo" class="rbas__anexo">{{ c.anexo }}</span>
              </div>

              <span class="rbas__tool" :class="{ off: !estado(i).toolOn, 'rbas__tool--live': estado(i).toolLive }">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2l10 10-10 10L2 12z" fill="currentColor" />
                </svg>
                redentia · {{ c.tool }}
                <span v-show="estado(i).buscando" class="rbas__dot3"><i /><i /><i /></span>
                <svg
                  v-show="!estado(i).buscando" width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="3.4" stroke-linecap="round"
                  stroke-linejoin="round" aria-hidden="true"
                ><path d="M4.5 12.5l5 5 10-11" /></svg>
              </span>

              <p class="rbas__fetch" :class="{ off: !estado(i).fetchOn }">{{ estado(i).fetchFinal ? c.fetchFim : c.fetchMeio }}</p>

              <p class="rbas__ans">
                <span
                  v-for="(f, n) in c.ans" :key="n"
                  :class="{ off: estado(i).ansN < n + 1, rbas__src: f.fonte }"
                ><template v-for="(tr, k) in f.trechos" :key="k"><strong v-if="tr.b">{{ tr.t }}</strong><template v-else>{{ tr.t }}</template></template></span>
              </p>
            </div>
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

        <!-- Controle real, não enfeite: tocar numa aba encerra o loop. Fica
             FORA do role="img" do card, senão o leitor de tela não alcança. -->
        <div class="rbas__abas" role="group" aria-label="Escolher a conversa">
          <button
            v-for="(c, i) in CENAS" :key="c.id" type="button"
            class="rbas__aba" :class="{ 'rbas__aba--on': i === cena }"
            :aria-pressed="i === cena" @click="mostrar(i)"
          >
            {{ c.aba }}
          </button>
        </div>
        <p class="rbas__legenda">
          Respostas do servidor da Redentia: o cenário rodou em 12/10/2026, no
          motor 3.4.1, e as notícias são de 09/10/2026. A carteira e a lista
          foram montadas para esta página.
        </p>
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
  color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.6;
}
.rbas__nota-link { color: var(--nu-blue); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
.rbas__nota-link:hover { color: var(--nu-blue-hover); }

/* ——— o artefato: a janela do assistente. Hairline, não sombra. ——— */
.rbas__card {
  position: relative; width: min(468px, 100%); margin-left: auto;
  background: var(--nu-white); border: 1px solid var(--nu-ink-14);
  border-radius: 16px; min-height: clamp(300px, 26vw, 328px);
  display: flex; flex-direction: column; overflow: hidden;
}
.rbas__legenda {
  margin: 10px 0 0; width: min(468px, 100%); margin-left: auto;
  color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; line-height: 1.5; text-align: left;
}
/* As abas: controle segmentado sob a janela, com alvo de 44px. Contorno, não
   chapado: o azul chapado da página já está gasto no header e no card do plano. */
.rbas__abas {
  display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0 0;
  width: min(468px, 100%); margin-left: auto;
}
.rbas__aba {
  appearance: none; cursor: pointer; font-family: inherit;
  min-height: 44px; padding: 10px 16px; border-radius: 10px;
  background: var(--nu-white); color: var(--nu-gray-2);
  border: 1px solid var(--nu-ink-14);
  font-size: var(--nu-fs-sm); font-weight: 700; transition: background .2s, color .2s, border-color .2s;
}
.rbas__aba:hover { color: var(--nu-ink); border-color: var(--nu-ink); }
.rbas__aba--on { background: var(--nu-ink); color: var(--nu-white); border-color: var(--nu-ink); }
.rbas__aba--on:hover { color: var(--nu-white); }
.rbas__aba:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }

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
  color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700;
}
.rbas__applogo { width: 18px; height: 18px; border-radius: 4px; display: block; }
.rbas__model {
  margin-left: auto; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700;
  padding: 4px 10px; border-radius: 5px; box-shadow: inset 0 0 0 1px var(--nu-ink-14);
}

/* a conversa cresce de baixo pra cima, ancorada no campo, como em qualquer
   assistente — sem isso o quadro vazio do filme deixa um buraco no topo */
.rbas__thread {
  flex: 1; padding: 18px 16px 8px;
  display: grid;
}
/* as duas conversas na mesma célula; cada uma ancora no pé, como o thread fazia */
.rbas__cena {
  grid-area: 1 / 1;
  display: flex; flex-direction: column; justify-content: flex-end; gap: 12px;
}
.rbas__cena--off { visibility: hidden; }

/* fora de cena mas ocupando o lugar (lição nº 2 do cabeçalho) */
.off { visibility: hidden; opacity: 0; }
.rbas__tool, .rbas__fetch, .rbas__ans span { transition: opacity .32s ease; }

.rbas__user {
  align-self: flex-end; max-width: 86%;
  color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.45;
  padding: 10px 14px; border-radius: 10px 10px 3px 10px;
  box-shadow: inset 0 0 0 1px var(--nu-ink-14);
  opacity: 0; transform: translateY(6px);
  transition: opacity .3s ease, transform .35s cubic-bezier(.34, 1.4, .6, 1);
}
.rbas__user--in { opacity: 1; transform: none; }
/* a carteira colada: um anexo dentro da bolha, não uma segunda mensagem */
.rbas__anexo {
  display: block; margin-top: 8px; padding: 6px 10px; border-radius: 7px;
  background: var(--nu-cream); color: var(--nu-gray-2);
  font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums;
}

.rbas__tool {
  display: inline-flex; align-items: center; gap: 7px; align-self: flex-start;
  color: var(--nu-blue-deep);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: var(--nu-fs-xs); font-weight: 700; padding: 7px 12px; border-radius: 6px;
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

.rbas__fetch { margin: -4px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; }
.rbas__ans { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; }
.rbas__ans strong { font-weight: 800; font-variant-numeric: tabular-nums; }
.rbas__src { color: var(--nu-gray); }

.rbas__in {
  display: flex; align-items: center; gap: 10px; margin: 10px 14px 14px;
  border-radius: 10px; box-shadow: inset 0 0 0 1px var(--nu-ink-14);
  padding: 11px 8px 11px 16px; min-height: 42px;
}
.rbas__txt {
  flex: 1; color: var(--nu-ink); font-size: var(--nu-fs-dense); font-weight: 500;
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
  .rbas__card, .rbas__legenda, .rbas__abas { margin-left: 0; }
  /* a 375px as duas abas não cabem lado a lado no tamanho do desktop e cada
     uma caía numa linha; dividindo a largura, o rótulo quebra dentro do botão */
  .rbas__abas { flex-wrap: nowrap; }
  .rbas__aba { flex: 1 1 0; padding: 9px 10px; font-size: var(--nu-fs-dense); line-height: 1.25; }
}
</style>
