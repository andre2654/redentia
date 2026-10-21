<script setup lang="ts">
// A carteira se montando (21/10/2026): a miniatura do /carteira de verdade
// (eyebrow "Sua carteira", o patrimônio, a alocação por classe e as contas
// por instituição) chegando banco a banco. Cada instituição entra com o que
// tem, o total conta até a nova soma, a barra de alocação enche e, no fim,
// chega o "+R$ 412 hoje". Os números são de exemplo, coerentes entre si
// (as quatro contas somam o total, as classes somam as contas).
//   tom 'claro'  → cartão branco, na banda azul da home (MercadoCarteiraConectada)
//   tom 'escuro' → direto sobre o navy, no herói da folha de cadastro
//   modo 'rolagem' → monta uma vez, quando aparece na tela
//   modo 'laco'    → monta, segura e recomeça (o laço de 9 s das folhas)
// O estado base é o quadro final: sem JavaScript, com movimento reduzido e no
// HTML do servidor a carteira já aparece montada.
const props = withDefaults(defineProps<{
  tom?: 'claro' | 'escuro'
  modo?: 'rolagem' | 'laco'
  /** para no quadro final (a folha depois do cadastro) */
  parada?: boolean
}>(), { tom: 'claro', modo: 'rolagem', parada: false })

// as classes e as cores são as do /carteira (CLASS_COLOR em utils/portfolio.ts)
type Classe = 'rf' | 'acoes' | 'fiis' | 'etfs'
const CLASSES: { id: Classe; nome: string }[] = [
  { id: 'rf', nome: 'Renda Fixa' },
  { id: 'acoes', nome: 'Ações' },
  { id: 'fiis', nome: 'FIIs' },
  { id: 'etfs', nome: 'ETFs' },
]
const CONTAS: { nome: string; logo: string; o: string; classes: Partial<Record<Classe, number>> }[] = [
  { nome: 'Nubank', logo: '/icons/logo-nubank.webp', o: 'Caixinhas e CDB', classes: { rf: 48210 } },
  { nome: 'Inter', logo: '/icons/logo-inter.webp', o: 'Ações e FIIs', classes: { acoes: 45000, fiis: 17530 } },
  { nome: 'Itaú', logo: '/icons/logo-itau.webp', o: 'BOVA11 e IVVB11', classes: { etfs: 30110 } },
  { nome: 'Bradesco', logo: '/icons/logo-bradesco.webp', o: 'Tesouro Direto', classes: { rf: 42570 } },
]
const somaDe = (c: Partial<Record<Classe, number>>) => Object.values(c).reduce((a, b) => a + (b ?? 0), 0)
const valores = CONTAS.map((c) => somaDe(c.classes))
const TOTAL = valores.reduce((a, b) => a + b, 0)
const HOJE = '+R$ 412 hoje'

const brl = (v: number) => 'R$ ' + Math.round(v).toLocaleString('pt-BR')

/* ——— a montagem ——— */
const chegaram = ref(CONTAS.length) // base: tudo montado
const mostrado = ref(TOTAL)
const raiz = ref<HTMLElement | null>(null)

// a alocação acumulada das contas que já chegaram, sobre o total final (a barra enche)
const alocacao = computed(() => CLASSES.map((cl) => {
  const v = CONTAS.slice(0, chegaram.value).reduce((a, c) => a + (c.classes[cl.id] ?? 0), 0)
  return { ...cl, pct: (v / TOTAL) * 100 }
}))
const pctFinal = Object.fromEntries(CLASSES.map((cl) => [cl.id, Math.round((CONTAS.reduce((a, c) => a + (c.classes[cl.id] ?? 0), 0) / TOTAL) * 100)])) as Record<Classe, number>
const pronta = computed(() => chegaram.value >= CONTAS.length)

let relogios: ReturnType<typeof setTimeout>[] = []
let quadro = 0
function limpar() {
  relogios.forEach(clearTimeout)
  relogios = []
  cancelAnimationFrame(quadro)
}
// o total conta da soma anterior até a nova, em 520 ms
function contar(de: number, ate: number) {
  cancelAnimationFrame(quadro)
  const inicio = performance.now()
  const passo = (agora: number) => {
    const f = Math.min(1, (agora - inicio) / 520)
    const e = 1 - Math.pow(1 - f, 3)
    mostrado.value = de + (ate - de) * e
    if (f < 1) quadro = requestAnimationFrame(passo)
  }
  quadro = requestAnimationFrame(passo)
}
function montar() {
  limpar()
  chegaram.value = 0
  mostrado.value = 0
  CONTAS.forEach((_, i) => {
    relogios.push(setTimeout(() => {
      const antes = valores.slice(0, i).reduce((a, b) => a + b, 0)
      chegaram.value = i + 1
      contar(antes, antes + valores[i]!)
    }, 420 + i * 560))
  })
  if (props.modo === 'laco') relogios.push(setTimeout(montar, 9000))
}

let olho: IntersectionObserver | null = null
onMounted(() => {
  if (props.parada || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (props.modo === 'laco') return montar()
  const el = raiz.value
  if (!el || !('IntersectionObserver' in window)) return
  olho = new IntersectionObserver((vistos) => {
    if (!vistos.some((v) => v.isIntersecting)) return
    olho?.disconnect()
    montar()
  }, { threshold: 0.45 })
  // só esconde para montar se ainda não está na tela (quem já vê a carteira pronta não a vê sumir)
  if (el.getBoundingClientRect().top > window.innerHeight * 0.8) {
    chegaram.value = 0
    mostrado.value = 0
  }
  olho.observe(el)
})
watch(() => props.parada, (p) => {
  if (!p) return
  limpar()
  chegaram.value = CONTAS.length
  mostrado.value = TOTAL
})
onBeforeUnmount(() => {
  limpar()
  olho?.disconnect()
})
</script>

<template>
  <div ref="raiz" class="cmo" :class="[`cmo--${tom}`, { 'cmo--pronta': pronta, 'cmo--laco': modo === 'laco' && !parada }]" aria-hidden="true">
    <div class="cmo__topo">
      <span class="cmo__eyebrow">Sua carteira</span>
      <span class="cmo__meta">{{ chegaram }} {{ chegaram === 1 ? 'instituição' : 'instituições' }}</span>
    </div>
    <div class="cmo__valor">{{ brl(mostrado) }}</div>
    <span class="cmo__hoje">
      <svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 1.5l3.5 6H1.5z" fill="currentColor" /></svg>
      {{ HOJE }}
    </span>

    <div class="cmo__barra">
      <span
        v-for="cl in alocacao" :key="cl.id"
        class="cmo__fatia" :class="`cmo__fatia--${cl.id}`" :style="{ width: `${cl.pct}%` }"
      />
    </div>
    <ul class="cmo__legenda">
      <li v-for="cl in CLASSES" :key="cl.id"><span class="cmo__ponto" :class="`cmo__fatia--${cl.id}`" />{{ cl.nome }} <b>{{ pctFinal[cl.id] }}%</b></li>
    </ul>

    <ul class="cmo__contas">
      <li v-for="(c, i) in CONTAS" :key="c.nome" class="cmo__conta" :class="{ 'cmo__conta--fora': i >= chegaram }">
        <img :src="c.logo" alt="" class="cmo__logo" width="34" height="34" loading="lazy">
        <span class="cmo__nome">{{ c.nome }}<small>{{ c.o }}</small></span>
        <span class="cmo__quanto">{{ brl(valores[i]!) }}</span>
      </li>
    </ul>
    <p class="cmo__mais">e mais de 110 bancos e corretoras pelo Open Finance</p>
  </div>
</template>

<style scoped>
/* ——— cartão branco (a banda azul da home) ——— */
.cmo {
  --cmo-texto: var(--nu-ink); --cmo-sub: var(--nu-gray); --cmo-linha: var(--nu-cream-2); --cmo-trilho: var(--nu-cream);
  position: relative; padding: 26px 28px 20px; border-radius: 28px; background: var(--nu-white); color: var(--cmo-texto);
  box-shadow: 0 40px 90px -40px rgba(8, 16, 48, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.6);
}
.cmo__topo { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.cmo__eyebrow { color: var(--nu-blue); font-size: var(--nu-fs-sm); font-weight: 700; }
.cmo__meta { color: var(--cmo-sub); font-size: var(--nu-fs-dense); font-weight: 500; font-variant-numeric: tabular-nums; }
/* um tom abaixo do título da banda: a frase manda, a carteira prova */
.cmo__valor {
  margin-top: 6px; font-size: var(--nu-fs-h2-sm); font-weight: 800; letter-spacing: -0.05em; line-height: 1;
  font-variant-numeric: tabular-nums;
}
.cmo__hoje {
  display: inline-flex; align-items: center; gap: 6px; margin-top: 12px; padding: 6px 12px; border-radius: var(--nu-r-pill);
  background: var(--nu-green-bg); color: var(--nu-green); font-size: var(--nu-fs-dense); font-weight: 700; font-variant-numeric: tabular-nums;
  transition: opacity .4s ease, transform .5s cubic-bezier(.2, .8, .2, 1);
}
.cmo:not(.cmo--pronta) .cmo__hoje { opacity: 0; transform: translateY(6px); }

/* a alocação: as fatias crescem conforme as contas chegam; o trilho é o que falta */
.cmo__barra { display: flex; gap: 3px; height: 12px; margin-top: 22px; border-radius: 999px; background: var(--cmo-trilho); overflow: hidden; }
.cmo__fatia { display: block; height: 100%; border-radius: 999px; transition: width .6s cubic-bezier(.22, 1, .36, 1); }
.cmo__fatia--rf { background: var(--nu-alloc-fixed); }
.cmo__fatia--acoes { background: var(--nu-alloc-stock); }
.cmo__fatia--fiis { background: var(--nu-alloc-fii); }
.cmo__fatia--etfs { background: var(--nu-class-etf); }
.cmo__legenda { display: flex; flex-wrap: wrap; gap: 6px 16px; margin: 12px 0 0; padding: 0; list-style: none; }
.cmo__legenda li { display: inline-flex; align-items: center; gap: 6px; color: var(--cmo-sub); font-size: var(--nu-fs-dense); font-weight: 500; }
.cmo__legenda b { color: var(--cmo-texto); font-weight: 700; font-variant-numeric: tabular-nums; }
.cmo__ponto { width: 8px; height: 8px; border-radius: 50%; }

/* as contas, uma a uma */
.cmo__contas { margin: 18px 0 0; padding: 0; list-style: none; border-top: 1px solid var(--cmo-linha); }
.cmo__conta {
  display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 12px; padding: 11px 0;
  border-bottom: 1px solid var(--cmo-linha);
  transition: opacity .45s ease, transform .55s cubic-bezier(.22, 1, .36, 1), filter .45s ease;
}
.cmo__conta--fora { opacity: 0; transform: translateX(-18px); filter: blur(4px); }
.cmo__logo { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; box-shadow: 0 0 0 1px rgba(10, 10, 12, 0.06); }
.cmo__nome { display: flex; flex-direction: column; min-width: 0; font-size: var(--nu-fs-sm); font-weight: 700; }
.cmo__nome small { color: var(--cmo-sub); font-size: var(--nu-fs-dense); font-weight: 500; }
.cmo__quanto { font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.cmo__mais { margin: 12px 0 0; color: var(--cmo-sub); font-size: var(--nu-fs-dense); font-weight: 500; text-align: center; }

/* ——— sobre o navy (o herói da folha): sem cartão, as contas em duas colunas ——— */
.cmo--escuro {
  --cmo-texto: var(--nu-cream-text); --cmo-sub: var(--nu-cream-text-60); --cmo-linha: rgba(245, 241, 234, 0.12); --cmo-trilho: rgba(245, 241, 234, 0.1);
  padding: 0; border-radius: 0; background: none; box-shadow: none;
}
.cmo--escuro .cmo__eyebrow { color: var(--nu-blue-soft); }
.cmo--escuro .cmo__valor { font-size: var(--nu-fs-h3); letter-spacing: -0.04em; }
.cmo--escuro .cmo__hoje { margin-top: 8px; background: rgba(143, 240, 181, 0.16); color: var(--nu-green-soft); }
.cmo--escuro .cmo__barra { margin-top: 16px; height: 10px; }
.cmo--escuro .cmo__legenda { display: none; }
.cmo--escuro .cmo__contas { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 14px; margin-top: 14px; border-top: 0; }
.cmo--escuro .cmo__conta { grid-template-columns: auto 1fr; gap: 8px; padding: 0; border: 0; }
.cmo--escuro .cmo__logo { grid-row: span 2; width: 26px; height: 26px; }
.cmo--escuro .cmo__nome { font-size: var(--nu-fs-dense); }
.cmo--escuro .cmo__nome small { display: none; }
.cmo--escuro .cmo__quanto { grid-column: 2; margin-top: -4px; color: var(--cmo-sub); font-size: var(--nu-fs-xs); font-weight: 700; }
.cmo--escuro .cmo__mais { display: none; }

/* no laço da folha, a carteira apaga antes de recomeçar (a volta não salta) */
.cmo--laco { animation: cmo-volta 9s ease infinite; }
@keyframes cmo-volta { 0%, 92% { opacity: 1; } 97% { opacity: 0; } 100% { opacity: 1; } }

@media (max-width: 640px) {
  .cmo:not(.cmo--escuro) { padding: 22px 20px 18px; border-radius: 24px; }
}
@media (prefers-reduced-motion: reduce) {
  .cmo__conta, .cmo__fatia, .cmo__hoje { transition: none; }
  .cmo--laco { animation: none; }
}
</style>
