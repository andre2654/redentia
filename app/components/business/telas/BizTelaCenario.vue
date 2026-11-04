<script setup lang="ts">
/**
 * A tela "Cenário na carteira" do Redentia MCP (mcp-service, src/apps/
 * cenario.html), recortada fiel: o rótulo azul com a origem do cenário, o nome
 * do cenário grande, a frase com a faixa, "Onde ela pode terminar" (o trilho
 * do p05 ao p95, a banda do p10 ao p90, o meio e o hoje), as três pontas e "O
 * que mais pesa" com a pílula do choque. O botão do fim é o "Texto para o
 * cliente" da tela de verdade.
 *
 * O dado é a rodada do motor de 04/11/2026 sobre a carteira de exemplo
 * (content/business/exemplo-cenario.ts). `tocar` abre a faixa uma vez: a banda
 * sai do meio para as pontas e as pílulas entram.
 */
import { EXEMPLO_CENARIO as X, choqueTxt, reaisCurto } from '~/content/business/exemplo-cenario'

withDefaults(defineProps<{ tocar?: boolean; pesos?: number; botao?: boolean }>(), { tocar: false, pesos: 3, botao: true })

const f = X.final
const hoje = X.inicio
const lo = Math.min(f.p05, hoje)
const hi = Math.max(f.p95, hoje)
const x = (v: number) => `${(((v - lo) / (hi - lo)) * 100).toFixed(2)}%`
const vsHoje = (v: number) => {
  const p = ((v - hoje) / hoje) * 100
  return `${p > 0 ? '+' : p < 0 ? '−' : ''}${Math.abs(p).toFixed(1).replace('.', ',')}%`
}
/* o que mais pesa: peso × choque, do pior para o melhor (a ordem da tela) */
const PESAM = [...X.posicoes].filter((p) => p.choque !== 0).sort((a, b) => a.peso * a.choque - b.peso * b.choque)
const NOME: Record<string, string> = { ITUB4: 'Itaú Unibanco', IVVB11: 'iShares S&P 500', PETR4: 'Petrobras', VALE3: 'Vale', HGLG11: 'Pátria Log', LREN3: 'Lojas Renner' }
</script>

<template>
  <div class="bce" :class="{ 'bce--tocar': tocar }">
    <header class="bce__abertura">
      <img src="/logo-azul.svg" alt="" width="28" height="28" class="bce__marca">
      <p class="bce__rotulo">Carteira de exemplo · cenário estudado</p>
      <p class="bce__h1">{{ X.cenario }}</p>
      <p class="bce__frase">Em 1 ano, em 80% das simulações a carteira termina entre {{ reaisCurto(f.p10) }} e {{ reaisCurto(f.p90) }}, em reais de hoje.</p>
    </header>

    <p class="bce__h2">Onde ela pode terminar</p>
    <div class="bce__bloco">
      <div class="bce__faixa">
        <div class="bce__trilho" />
        <div class="bce__banda" :style="{ left: x(f.p10), width: `calc(${x(f.p90)} - ${x(f.p10)})` }" />
        <div class="bce__meio" :style="{ left: x(f.p50) }" />
        <div class="bce__hoje" :style="{ left: x(hoje) }"><span>hoje</span></div>
      </div>
      <div class="bce__pontas">
        <div><small>Pessimista</small><b>{{ reaisCurto(f.p10) }}</b><em>{{ vsHoje(f.p10) }}</em></div>
        <div><small>Meio</small><b>{{ reaisCurto(f.p50) }}</b><em>{{ vsHoje(f.p50) }}</em></div>
        <div><small>Otimista</small><b>{{ reaisCurto(f.p90) }}</b><em>{{ vsHoje(f.p90) }}</em></div>
      </div>
    </div>

    <template v-if="pesos">
      <p class="bce__h2">O que mais pesa</p>
      <div class="bce__bloco">
        <div v-for="(p, i) in PESAM.slice(0, pesos)" :key="p.ticker" class="bce__linha" :style="{ '--i': i }">
          <div class="bce__esq">
            <div class="bce__tk">{{ p.ticker }}</div>
            <div class="bce__nm">{{ NOME[p.ticker] }} · {{ p.peso }}% da carteira</div>
          </div>
          <span class="bce__pilula" :class="p.choque > 0 ? 'bce__pilula--alta' : 'bce__pilula--queda'">{{ choqueTxt(p.choque) }}</span>
        </div>
      </div>
    </template>

    <div v-if="botao" class="bce__fecho"><span class="bce__botao">Texto para o cliente</span></div>
  </div>
</template>

<style scoped>
.bce { padding: 26px 22px 22px; color: var(--nu-ink); font-variant-numeric: tabular-nums; }
.bce__abertura { text-align: center; }
.bce__marca { display: block; margin: 0 auto; }
.bce__rotulo { margin: 18px 0 0; color: var(--nu-blue); font-size: var(--nu-fs-sm); font-weight: 700; }
.bce__h1 { margin: 4px auto 0; max-width: 14ch; font-size: clamp(28px, 2.8vw, 38px); font-weight: 800; letter-spacing: -0.045em; line-height: 1.06; text-wrap: balance; }
.bce__frase { margin: 10px auto 0; max-width: 32ch; color: var(--nu-tela-apoio); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.45; text-wrap: balance; }
.bce__h2 { margin: 22px 0 10px; font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -0.03em; }
.bce__bloco { padding: 4px 18px; border-radius: var(--nu-r-panel); background: var(--nu-tela-bloco); }
.bce__faixa { position: relative; height: 56px; margin: 18px 4px 0; }
.bce__trilho { position: absolute; left: 0; right: 0; top: 24px; height: 8px; border-radius: 4px; background: var(--nu-tela-neutro); }
.bce__banda { position: absolute; top: 19px; height: 18px; border-radius: 9px; background: color-mix(in srgb, var(--nu-blue) 26%, transparent); }
.bce__meio { position: absolute; top: 15px; width: 4px; height: 26px; margin-left: -2px; border-radius: 2px; background: var(--nu-blue); }
.bce__hoje { position: absolute; top: 2px; bottom: 2px; width: 2px; margin-left: -1px; background: var(--nu-ink); }
.bce__hoje span { position: absolute; top: -4px; left: 7px; color: var(--nu-tela-apoio); font-size: var(--nu-fs-xs); font-weight: 500; white-space: nowrap; }
.bce__pontas { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 10px 0 16px; text-align: center; }
.bce__pontas div:first-child { text-align: left; }
.bce__pontas div:last-child { text-align: right; }
.bce__pontas small { display: block; color: var(--nu-tela-apoio); font-size: var(--nu-fs-xs); font-weight: 500; }
.bce__pontas b { display: block; font-size: var(--nu-fs-md); font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
.bce__pontas em { display: block; color: var(--nu-tela-apoio); font-size: var(--nu-fs-xs); font-style: normal; font-weight: 500; }
.bce__linha { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid var(--nu-tela-linha); }
.bce__linha:first-child { border-top: 0; }
.bce__esq { flex: 1; min-width: 0; }
.bce__tk { font-size: var(--nu-fs-md); font-weight: 700; letter-spacing: -0.015em; }
.bce__nm { color: var(--nu-tela-apoio); font-size: var(--nu-fs-dense); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bce__pilula {
  display: inline-flex; align-items: center; justify-content: center; min-width: 70px; height: 26px; padding: 0 10px;
  border-radius: var(--nu-r-pill); color: var(--nu-white); font-size: var(--nu-fs-dense); font-weight: 700;
}
.bce__pilula--alta { background: var(--nu-tela-alta); }
.bce__pilula--queda { background: var(--nu-tela-queda); }
.bce__fecho { margin-top: 20px; text-align: center; }
.bce__botao { display: inline-flex; align-items: center; height: 44px; padding: 0 28px; border-radius: var(--nu-r-pill); background: var(--nu-blue); color: var(--nu-white); font-size: var(--nu-fs-md); font-weight: 600; }

/* abrir a faixa, uma vez: a banda sai do meio, as pontas e as pílulas chegam */
.bce--tocar .bce__banda { animation: bce-abre 1s cubic-bezier(.2, .8, .2, 1) backwards .3s; transform-origin: 42% 50%; }
.bce--tocar .bce__meio, .bce--tocar .bce__hoje { animation: bce-entra .4s ease backwards .2s; }
.bce--tocar .bce__pontas > div { animation: bce-entra .5s cubic-bezier(.2, .8, .2, 1) backwards 1s; }
.bce--tocar .bce__linha { animation: bce-entra .5s cubic-bezier(.2, .8, .2, 1) backwards; animation-delay: calc(1.1s + var(--i) * 100ms); }
@keyframes bce-abre { from { transform: scaleX(.04); opacity: .3; } }
@keyframes bce-entra { from { opacity: 0; transform: translateY(6px); } }
@media (prefers-reduced-motion: reduce) { .bce * { animation: none !important; } }
</style>
