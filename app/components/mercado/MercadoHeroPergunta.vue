<script setup lang="ts">
// Hero da home para quem não está logado, como a Apple faria (dono, 20/10:
// "se inspire na APPLE, como ela teria esse hero?"). Ordem de página de produto:
// o nome (Redentia AI), o título e uma linha de apoio; embaixo, o "produto" em
// si: uma barra de pergunta com o brilho iridescente girando na borda (a
// linguagem da Apple para IA) e a resposta surgindo palavra por palavra.
// O par "Começar grátis" / "Ver como funciona" e a linha "Grátis para começar ·
// sem cartão de crédito" saíram em 21/10, a pedido do dono: a barra é a chamada
// e o header já tem "Criar conta grátis".
// As perguntas se escrevem sozinhas e as respostas saem de dado de verdade: a
// maior alta da bolsa vem dos movers do dia (a mesma fonte do /mercado), a dos
// juros compostos é conta exata e a do dividend yield é definição. Sem frase
// inventada sobre o mercado.
// A barra funciona: clicar para a demonstração, e o que a pessoa digitar vai
// para /busca?q=, que pede o login e depois envia a pergunta ao chat sozinho.
// Movimento reduzido: sem digitação nem giro, a primeira pergunta já respondida.
import { marketFetchMovers } from '~/services/market'

interface Par { q: string; a: string }

const brl0 = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
// R$ 500 por mês, 120 meses, 1% ao mês: valor futuro de uma série de aportes
const futuro = 500 * ((1.01 ** 120 - 1) / 0.01)
const FIXOS: Par[] = [
  { q: 'Quanto rendem R$ 500 por mês em 10 anos?', a: `A 1% ao mês, viram ${brl0.format(futuro)}. Você põe R$ 60 mil; os juros fazem o resto.` },
  { q: 'O que é dividend yield?', a: 'É quanto a ação pagou em proventos nos últimos 12 meses, dividido pelo preço. Um DY de 8% devolve R$ 8 por ano a cada R$ 100.' },
]

// nome da B3 em campo fixo ("MAGAZ LUIZA ON NM") vira "Magaz Luiza"
const nomeLimpo = (raw: string | null | undefined, ticker: string) => {
  const base = (raw ?? '').slice(0, 12).replace(/\s+/g, ' ').trim()
  return base ? base.toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase()) : ticker
}

const pares = ref<Par[]>([...FIXOS])
const i = ref(0)
const digitado = ref(FIXOS[0]!.q)
const fase = ref<'digitando' | 'pensando' | 'respondendo' | 'lendo' | 'apagando'>('lendo')
const resposta = computed(() => pares.value[i.value]?.a ?? '')
const palavras = computed(() => resposta.value.split(' '))
// a pessoa clicou: a demonstração para e a barra vira campo de verdade
const texto = ref('')
const usando = ref(false)
const campo = ref<HTMLInputElement | null>(null)

let timer: ReturnType<typeof setTimeout> | null = null
const esperar = (ms: number) => new Promise<void>((ok) => { timer = setTimeout(ok, ms) })
let vivo = true

async function ciclo() {
  while (vivo && !usando.value) {
    const par = pares.value[i.value]!
    fase.value = 'digitando'
    digitado.value = ''
    for (const ch of par.q) {
      if (!vivo || usando.value) return
      digitado.value += ch
      await esperar(ch === ' ' ? 55 : 34)
    }
    fase.value = 'pensando'
    await esperar(900)
    fase.value = 'respondendo'
    await esperar(palavras.value.length * 55 + 500)
    fase.value = 'lendo'
    await esperar(3400)
    fase.value = 'apagando'
    await esperar(450)
    i.value = (i.value + 1) % pares.value.length
  }
}

onMounted(async () => {
  const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  try {
    const r = await marketFetchMovers('stocks', 'top')
    const t = r?.data?.[0]
    if (t?.ticker && t.change_percent != null && t.change_percent > 0) {
      const tk = t.ticker.toUpperCase()
      pares.value = [{ q: 'Qual ação mais subiu na bolsa?', a: `${nomeLimpo(t.name, tk)} (${tk}), com +${nf2.format(t.change_percent)}% no último pregão. A maior alta da bolsa.` }, ...FIXOS]
    }
  } catch { /* fica com as respostas fixas */ }
  if (calmo) {
    i.value = 0
    digitado.value = pares.value[0]!.q
    return
  }
  ciclo()
})
onBeforeUnmount(() => { vivo = false; if (timer) clearTimeout(timer) })

function usar() {
  if (usando.value) return
  usando.value = true
  if (timer) clearTimeout(timer)
  nextTick(() => campo.value?.focus())
}
function enviar() {
  const q = texto.value.trim()
  if (!usando.value) { usar(); return }
  if (!q) { campo.value?.focus(); return }
  navigateTo(`/busca?q=${encodeURIComponent(q)}`)
}
</script>

<template>
  <section class="mhp">
    <div class="mhp__aura" aria-hidden="true" />

    <p class="mhp__produto"><img src="/logo-azul.svg" alt="" width="20" height="20">Redentia AI</p>
    <h1 class="mhp__titulo">Invista com uma IA <br>do seu lado.</h1>
    <p class="mhp__dek">Pergunte qualquer coisa sobre ações, FIIs e a sua carteira. A resposta vem em português, na hora.</p>

    <!-- o produto: a barra de pergunta com o brilho na borda -->
    <form class="mhp__barra" :class="[`mhp__barra--${fase}`, { 'mhp__barra--usando': usando }]" @submit.prevent="enviar" @click="usar">
      <span class="mhp__anel" aria-hidden="true" />
      <span class="mhp__brilho" aria-hidden="true" />
      <span class="mhp__fundo">
        <img src="/logo-azul.svg" alt="" width="22" height="22" class="mhp__marca">
        <input
          ref="campo" v-model="texto" class="mhp__campo" type="text" enterkeyhint="send"
          :placeholder="usando ? 'Pergunte à Redentia' : ''" aria-label="Pergunte à Redentia" @focus="usar"
        >
        <span v-if="!usando" class="mhp__demo" aria-hidden="true">{{ digitado }}<i class="mhp__cursor" /></span>
        <button type="submit" class="mhp__enviar" aria-label="Perguntar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
        </button>
      </span>
    </form>

    <div class="mhp__resposta" :class="`mhp__resposta--${fase}`" aria-live="polite">
      <span v-if="fase === 'pensando'" class="mhp__pensando" aria-label="Pensando"><i /><i /><i /></span>
      <p v-else-if="!usando && fase !== 'digitando'" :key="i" class="mhp__texto">
        <!-- o espaço fica fora da palavra: é ele que deixa a frase quebrar linha -->
        <template v-for="(w, k) in palavras" :key="k"><span class="mhp__palavra" :style="{ '--k': k }">{{ w }}</span>{{ ' ' }}</template>
      </p>
      <p v-if="usando" class="mhp__dica">Escreva a sua pergunta e aperte Enter. Para ver a resposta, entre ou crie a sua conta grátis.</p>
    </div>
  </section>
</template>

<style scoped>
.mhp {
  position: relative; isolation: isolate; display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: clamp(44px, 5.5vw, 84px) var(--nu-gutter, 22px) clamp(48px, 6vw, 88px);
  background: var(--nu-cream); overflow: hidden;
}
/* luz suave atrás da barra, como a da Apple Intelligence */
.mhp__aura {
  position: absolute; z-index: -1; left: 50%; top: 58%; width: min(980px, 120vw); height: 420px; transform: translate(-50%, -50%);
  background:
    radial-gradient(closest-side at 35% 55%, color-mix(in srgb, var(--nu-blue) 22%, transparent), transparent),
    radial-gradient(closest-side at 62% 45%, color-mix(in srgb, var(--nu-serie-5) 20%, transparent), transparent),
    radial-gradient(closest-side at 78% 62%, color-mix(in srgb, var(--nu-serie-4) 12%, transparent), transparent);
  filter: blur(30px); pointer-events: none;
}
.mhp__produto { display: inline-flex; align-items: center; gap: 8px; margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 700; }
.mhp__titulo {
  margin: 14px 0 0; color: var(--nu-ink); font-size: clamp(44px, 6vw, 86px); font-weight: 800;
  letter-spacing: -0.05em; line-height: .98; text-wrap: balance;
}
.mhp__dek { margin: 20px 0 0; max-width: 44ch; color: var(--nu-gray-2); font-size: var(--nu-fs-xl); font-weight: 500; line-height: 1.45; }

/* a barra: anel iridescente girando (camada composta), brilho difuso atrás, fundo branco */
.mhp__barra {
  position: relative; width: min(760px, 100%); height: 76px; margin-top: clamp(40px, 4.5vw, 60px);
  border-radius: var(--nu-r-pill); cursor: text;
}
.mhp__anel { position: absolute; inset: 0; border-radius: inherit; overflow: hidden; }
.mhp__anel::before {
  content: ''; position: absolute; left: 50%; top: 50%; width: 140%; aspect-ratio: 1; transform: translate(-50%, -50%) rotate(0deg);
  background: conic-gradient(from 0deg, var(--nu-blue), var(--nu-serie-5), var(--nu-serie-4), var(--nu-serie-2), var(--nu-serie-6), var(--nu-blue));
  animation: mhp-gira 7s linear infinite;
}
.mhp__brilho {
  position: absolute; inset: -10px; z-index: -1; border-radius: inherit; filter: blur(22px); opacity: .5;
  background: linear-gradient(90deg, var(--nu-blue), var(--nu-serie-5), var(--nu-serie-4), var(--nu-serie-2));
  animation: mhp-respira 5s ease-in-out infinite;
}
.mhp__fundo {
  position: absolute; inset: 2.5px; display: flex; align-items: center; gap: 14px; padding: 0 12px 0 24px;
  border-radius: inherit; background: var(--nu-white);
}
.mhp__marca { flex-shrink: 0; }
.mhp__campo {
  flex: 1; min-width: 0; height: 100%; border: 0; outline: 0; background: transparent; font: inherit;
  color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 500;
}
.mhp__campo::placeholder { color: var(--nu-gray); }
.mhp__demo {
  position: absolute; left: 60px; right: 76px; top: 50%; transform: translateY(-50%); text-align: left; pointer-events: none;
  color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.mhp__cursor { display: inline-block; width: 2px; height: 1.15em; margin-left: 2px; vertical-align: -0.18em; background: var(--nu-blue); animation: mhp-pisca 1s steps(1) infinite; }
.mhp__barra--lendo .mhp__cursor, .mhp__barra--respondendo .mhp__cursor { opacity: 0; animation: none; }
.mhp__enviar {
  flex-shrink: 0; width: 50px; height: 50px; border: 0; border-radius: 50%; cursor: pointer; display: grid; place-items: center;
  background: var(--nu-ink); color: var(--nu-white); transition: transform .2s ease, background .2s ease;
}
.mhp__barra--pensando .mhp__enviar { background: var(--nu-blue); animation: mhp-pulso 0.9s ease-in-out infinite; }
.mhp__enviar:hover { transform: scale(1.05); }
.mhp__barra:focus-within .mhp__brilho { opacity: .75; }

/* a resposta: palavra por palavra, com desfoque saindo */
.mhp__resposta { min-height: 76px; width: min(680px, 100%); margin-top: 24px; }
.mhp__texto { margin: 0; color: var(--nu-ink); font-size: clamp(20px, 2vw, 26px); font-weight: 700; letter-spacing: -0.02em; line-height: 1.35; text-wrap: balance; }
.mhp__palavra { display: inline-block; animation: mhp-palavra .5s cubic-bezier(.22, 1, .36, 1) backwards; animation-delay: calc(var(--k) * 55ms); }
.mhp__resposta--apagando .mhp__texto { opacity: 0; filter: blur(6px); transition: opacity .4s ease, filter .4s ease; }
.mhp__pensando { display: inline-flex; gap: 6px; padding-top: 10px; }
.mhp__pensando i { width: 8px; height: 8px; border-radius: 50%; background: var(--nu-blue); animation: mhp-ponto 1s ease-in-out infinite; }
.mhp__pensando i:nth-child(2) { animation-delay: .15s; }
.mhp__pensando i:nth-child(3) { animation-delay: .3s; }
.mhp__dica { margin: 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; }

@keyframes mhp-gira { to { transform: translate(-50%, -50%) rotate(360deg); } }
@keyframes mhp-respira { 50% { opacity: .3; } }
@keyframes mhp-pisca { 50% { opacity: 0; } }
@keyframes mhp-pulso { 50% { transform: scale(.92); } }
@keyframes mhp-ponto { 50% { transform: translateY(-4px); opacity: .5; } }
@keyframes mhp-palavra { from { opacity: 0; filter: blur(8px); transform: translateY(6px); } }

/* entrada da página: título e apoio sobem saindo do desfoque */
.mhp__produto, .mhp__titulo, .mhp__dek, .mhp__barra { animation: mhp-entra .9s cubic-bezier(.22, 1, .36, 1) backwards; }
.mhp__titulo { animation-delay: .08s; }
.mhp__dek { animation-delay: .18s; }
.mhp__barra { animation-delay: .32s; }
@keyframes mhp-entra { from { opacity: 0; filter: blur(10px); transform: translateY(14px); } }

@media (prefers-reduced-motion: reduce) {
  .mhp__anel::before, .mhp__brilho, .mhp__cursor, .mhp__palavra, .mhp__produto, .mhp__titulo, .mhp__dek, .mhp__barra { animation: none; }
}
@media (max-width: 640px) {
  .mhp__titulo br { display: none; }
  .mhp__barra { height: 72px; }
  /* a pergunta pode ocupar duas linhas: cortada com reticências ela perdia o sentido */
  .mhp__demo { white-space: normal; line-height: 1.25; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .mhp__fundo { gap: 10px; padding: 0 8px 0 16px; }
  .mhp__campo, .mhp__demo { font-size: var(--nu-fs-md); }
  .mhp__demo { left: 48px; right: 60px; }
  .mhp__enviar { width: 44px; height: 44px; }
  .mhp__resposta { min-height: 120px; }
}
</style>
