<script setup lang="ts">
/**
 * A tela "Carteira do cliente" do Redentia MCP (mcp-service, src/apps/
 * carteira.html), recortada fiel para a /business: a marca, o rótulo azul, o
 * patrimônio grande com os centavos menores, a frase do dia, "Onde está o
 * dinheiro" (a barra por classe nos azuis da marca) e "As posições hoje" com a
 * pílula cheia do dia. É a tela que aparece no assistente quando o escritório
 * pede a carteira de um cliente conectado.
 *
 * O dado é a carteira de exemplo de R$ 1 milhão (content/business/
 * exemplo-cenario.ts) com o pregão de 03/11/2026 de verdade. O rótulo diz que
 * é exemplo. `tocar` (useBizEntrada) faz a carteira consolidar uma vez: a
 * barra cresce por classe e as posições entram em cascata.
 */
import { EXEMPLO_CENARIO as X, EXEMPLO_PREGAO as P, diaTxt } from '~/content/business/exemplo-cenario'

const props = withDefaults(defineProps<{ tocar?: boolean; linhas?: number; rotulo?: string }>(), { tocar: false, linhas: 5, rotulo: 'Carteira de exemplo · Open Finance' })

/* os pesos da carteira de exemplo, por classe (como o motor classifica) */
const CLASSES = [
  { nome: 'Ações', peso: 45, tom: 'var(--nu-tela-marinho)' },
  { nome: 'Renda fixa', peso: 30, tom: 'var(--nu-blue-deep)' },
  { nome: 'ETFs', peso: 15, tom: 'var(--nu-blue)' },
  { nome: 'FIIs', peso: 10, tom: 'var(--nu-blue-soft)' },
]
const peso = (t: string) => X.posicoes.find((p) => p.ticker === t)?.peso ?? 0
const POSICOES = P.posicoes.map((p) => ({ ...p, peso: peso(p.ticker), valor: (peso(p.ticker) / 100) * X.inicio }))
  .sort((a, b) => b.peso - a.peso)
const visiveis = computed(() => POSICOES.slice(0, props.linhas))
const subiram = P.posicoes.filter((p) => (p.dia ?? 0) > 0).length
const cairam = P.posicoes.filter((p) => (p.dia ?? 0) < 0).length
const brl0 = (v: number) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`
const tom = (v: number | null) => (v == null ? 'neutra' : v > 0 ? 'alta' : v < 0 ? 'queda' : 'neutra')
</script>

<template>
  <div class="btc" :class="{ 'btc--tocar': tocar }">
    <header class="btc__abertura">
      <img src="/logo-azul.svg" alt="" width="28" height="28" class="btc__marca">
      <p class="btc__rotulo">{{ rotulo }}</p>
      <p class="btc__h1">R$ 1.000.000<span>,00</span></p>
      <p class="btc__frase">No pregão de {{ P.data.slice(0, 5) }}, {{ subiram }} ativos subiram e {{ cairam }} caíram.</p>
    </header>

    <p class="btc__h2">Onde está o dinheiro</p>
    <div class="btc__bloco">
      <div class="btc__barra">
        <span v-for="(c, i) in CLASSES" :key="c.nome" :style="{ flexGrow: c.peso, background: c.tom, '--i': i }" />
      </div>
      <div class="btc__classes">
        <div v-for="c in CLASSES" :key="c.nome"><i :style="{ background: c.tom }" /><span>{{ c.nome }}</span><b>{{ c.peso }}%</b></div>
      </div>
    </div>

    <p class="btc__h2">As posições hoje</p>
    <div class="btc__bloco">
      <div v-for="(p, i) in visiveis" :key="p.ticker" class="btc__linha" :style="{ '--i': i }">
        <div class="btc__esq">
          <div class="btc__tk">{{ p.ticker }}</div>
          <div class="btc__nm">{{ p.nome }} · {{ p.peso }}%</div>
        </div>
        <span class="btc__valor">{{ brl0(p.valor) }}</span>
        <span class="btc__pilula" :class="`btc__pilula--${tom(p.dia)}`">{{ p.dia == null ? '—' : diaTxt(p.dia) }}</span>
      </div>
      <div class="btc__mais">Ver as {{ POSICOES.length }} posições</div>
    </div>
  </div>
</template>

<style scoped>
.btc { padding: 26px 22px 22px; color: var(--nu-ink); font-variant-numeric: tabular-nums; }
.btc__abertura { text-align: center; }
.btc__marca { display: block; margin: 0 auto; }
.btc__rotulo { margin: 18px 0 0; color: var(--nu-blue); font-size: var(--nu-fs-sm); font-weight: 700; }
.btc__h1 { margin: 4px 0 0; font-size: clamp(30px, 3vw, 40px); font-weight: 800; letter-spacing: -0.045em; line-height: 1.05; }
.btc__h1 span { color: var(--nu-tela-nota); font-size: .6em; font-weight: 700; letter-spacing: -0.02em; }
.btc__frase { margin: 8px auto 0; max-width: 30ch; color: var(--nu-tela-apoio); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.45; }
.btc__h2 { margin: 22px 0 10px; font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -0.03em; }
.btc__bloco { padding: 4px 18px; border-radius: var(--nu-r-panel); background: var(--nu-tela-bloco); }
.btc__barra { display: flex; gap: 3px; height: 12px; margin: 16px 0 12px; }
.btc__barra span { flex-basis: 0; border-radius: 4px; transform-origin: left center; }
.btc__classes { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; padding-bottom: 14px; font-size: var(--nu-fs-dense); }
.btc__classes div { display: flex; align-items: center; gap: 7px; }
.btc__classes i { width: 9px; height: 9px; border-radius: 3px; flex-shrink: 0; }
.btc__classes span { color: var(--nu-tela-apoio); font-weight: 500; }
.btc__classes b { margin-left: auto; font-weight: 700; }
.btc__linha { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid var(--nu-tela-linha); }
.btc__linha:first-child { border-top: 0; }
.btc__esq { flex: 1; min-width: 0; }
.btc__tk { font-size: var(--nu-fs-md); font-weight: 700; letter-spacing: -0.015em; }
.btc__nm { color: var(--nu-tela-apoio); font-size: var(--nu-fs-dense); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.btc__valor { font-size: var(--nu-fs-sm); font-weight: 500; white-space: nowrap; }
.btc__pilula {
  display: inline-flex; align-items: center; justify-content: center; min-width: 70px; height: 26px; padding: 0 10px;
  border-radius: var(--nu-r-pill); color: var(--nu-white); font-size: var(--nu-fs-dense); font-weight: 700; white-space: nowrap;
}
.btc__pilula--alta { background: var(--nu-tela-alta); }
.btc__pilula--queda { background: var(--nu-tela-queda); }
.btc__pilula--neutra { background: var(--nu-tela-neutro); color: var(--nu-ink); }
.btc__mais { padding: 12px 0; border-top: 1px solid var(--nu-tela-linha); color: var(--nu-blue); font-size: var(--nu-fs-sm); font-weight: 600; }

/* consolidar, uma vez: a barra cresce classe a classe e as posições chegam */
.btc--tocar .btc__barra span { animation: btc-cresce .7s cubic-bezier(.2, .8, .2, 1) backwards; animation-delay: calc(250ms + var(--i) * 120ms); }
.btc--tocar .btc__linha { animation: btc-entra .5s cubic-bezier(.2, .8, .2, 1) backwards; animation-delay: calc(500ms + var(--i) * 90ms); }
.btc--tocar .btc__h1 { animation: btc-entra .6s cubic-bezier(.2, .8, .2, 1) backwards .1s; }
@keyframes btc-cresce { from { transform: scaleX(0); } }
@keyframes btc-entra { from { opacity: 0; transform: translateY(8px); } }
@media (max-width: 420px) { .btc__valor { display: none; } }
@media (prefers-reduced-motion: reduce) { .btc * { animation: none !important; } }
</style>
