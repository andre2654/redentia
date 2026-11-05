<script setup lang="ts">
// Variação 3 da "Na cadeia" (CarteiraCadeia): a lista narrada. Uma frase por
// ligação, com a sua empresa de sujeito ("A Vale compra diesel da Petrobras.
// Você tem as duas."), e ao lado o mini-diagrama: as duas logos e a seta de
// quem vende para quem compra. Primeiro as ligações dentro da carteira; depois
// as de fora, as compartilhadas com a frase delas ("3 das suas empresas
// compram da Petrobras"). Embaixo de cada frase, o valor como a empresa
// informou e as provas. As linhas surgem uma a uma quando entram na tela.
import { fraseDaCarteira, valorEmLinha, type CadeiaDaCarteira, type LigacaoDaCadeia } from '~/utils/cadeiaDaCarteira'

const props = defineProps<{
  vm: CadeiaDaCarteira
  tickerDe: Record<string, string>
  modo: 'parado' | 'esperando' | 'revelando'
}>()
const emit = defineEmits<{ abrir: [id: string] }>()

const minhas = computed(() => props.vm.empresas.map((e) => e.raiz))
const tk = (r: string) => props.tickerDe[r] ?? r
const daCarteira = (r: string) => minhas.value.includes(r)

type Grupo = { chave: string; titulo: string | null; ligacoes: LigacaoDaCadeia[] }
const fora = computed<Grupo[]>(() => props.vm.externas.map((x) => {
  const compram = x.ligacoes.filter((l) => l.vende === x.raiz).length
  const vendem = x.ligacoes.length - compram
  const k = x.empresas.length
  const titulo = x.compartilhada
    ? compram >= vendem ? `${k} das suas empresas compram da ${x.nome}.` : `${k} das suas empresas vendem para a ${x.nome}.`
    : null
  return { chave: x.raiz, titulo, ligacoes: x.ligacoes }
}))
const curto = (s: string | null, n: number) => (!s ? '' : s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s)
</script>

<template>
  <div class="ccn" :class="`ccn--${modo}`">
    <ol v-if="vm.internas.length" class="ccn__lista">
      <li v-for="(l, i) in vm.internas" :key="l.id" class="ccn__item ccn__item--int" :style="{ '--i': i }">
        <div class="ccn__par" aria-hidden="true">
          <NuAssetLogo :ticker="tk(l.vende)" :letter="tk(l.vende).charAt(0)" tile-bg="var(--nu-tile-blue-bg)" tile-fg="var(--nu-blue-deep)" :size="44" :radius="12" />
          <span class="ccn__fio ccn__fio--int">
            <span class="ccn__fio-oque">{{ curto(l.oQue, 26) }}</span>
            <svg width="100%" height="12" viewBox="0 0 100 12" preserveAspectRatio="none"><path d="M2 6H96" /></svg>
            <svg class="ccn__fio-ponta" width="10" height="12" viewBox="0 0 10 12"><path d="M2 1.5 8 6l-6 4.5" /></svg>
            <span class="ccn__fio-luz" />
          </span>
          <NuAssetLogo :ticker="tk(l.compra)" :letter="tk(l.compra).charAt(0)" tile-bg="var(--nu-tile-blue-bg)" tile-fg="var(--nu-blue-deep)" :size="44" :radius="12" />
        </div>
        <div class="ccn__txt">
          <p class="ccn__frase">{{ fraseDaCarteira(l, vm.nomes, minhas) }} <span class="ccn__duas">Você tem as duas.</span></p>
          <p class="ccn__valor">
            {{ valorEmLinha(l, vm.nomes) }}
            · <button type="button" class="ccn__provas" @click="emit('abrir', l.id)">ver as provas</button>
          </p>
        </div>
      </li>
    </ol>

    <template v-if="fora.length">
      <h3 class="ccn__sub">{{ vm.internas.length ? 'E fora da carteira' : 'Fora da carteira' }}</h3>
      <ol class="ccn__lista">
        <li v-for="(g, gi) in fora" :key="g.chave" class="ccn__grupo" :style="{ '--i': vm.internas.length + gi }">
          <p v-if="g.titulo" class="ccn__grupo-frase">{{ g.titulo }}</p>
          <div v-for="l in g.ligacoes" :key="l.id" class="ccn__item">
            <div class="ccn__par ccn__par--fora" aria-hidden="true">
              <span class="ccn__logo" :class="{ 'ccn__logo--fora': !daCarteira(l.vende) }">
                <NuAssetLogo :ticker="tk(l.vende)" :letter="tk(l.vende).charAt(0)" :tile-bg="daCarteira(l.vende) ? 'var(--nu-tile-blue-bg)' : 'var(--nu-cream)'" :tile-fg="daCarteira(l.vende) ? 'var(--nu-blue-deep)' : 'var(--nu-gray)'" :size="34" :radius="9" />
              </span>
              <span class="ccn__fio">
                <svg width="100%" height="12" viewBox="0 0 100 12" preserveAspectRatio="none"><path d="M2 6H96" /></svg>
                <svg class="ccn__fio-ponta" width="10" height="12" viewBox="0 0 10 12"><path d="M2 1.5 8 6l-6 4.5" /></svg>
              </span>
              <span class="ccn__logo" :class="{ 'ccn__logo--fora': !daCarteira(l.compra) }">
                <NuAssetLogo :ticker="tk(l.compra)" :letter="tk(l.compra).charAt(0)" :tile-bg="daCarteira(l.compra) ? 'var(--nu-tile-blue-bg)' : 'var(--nu-cream)'" :tile-fg="daCarteira(l.compra) ? 'var(--nu-blue-deep)' : 'var(--nu-gray)'" :size="34" :radius="9" />
              </span>
            </div>
            <div class="ccn__txt">
              <p class="ccn__frase ccn__frase--fora">{{ fraseDaCarteira(l, vm.nomes, minhas) }}</p>
              <p class="ccn__valor">
                {{ valorEmLinha(l, vm.nomes) }}
                · <button type="button" class="ccn__provas" @click="emit('abrir', l.id)">ver as provas</button>
              </p>
            </div>
          </div>
        </li>
      </ol>
    </template>
  </div>
</template>

<style scoped>
.ccn { --ease: cubic-bezier(.22, 1, .36, 1); max-width: 920px; }
.ccn__lista { list-style: none; margin: 0; padding: 0; }
.ccn__item {
  display: grid; grid-template-columns: 240px minmax(0, 1fr); align-items: center; gap: 28px;
  padding: 18px 12px; margin: 0 -12px; border-radius: var(--nu-r-tile);
  border-top: 1px solid var(--nu-cream-2); transition: background .18s;
}
.ccn__lista > li:first-child > .ccn__item:first-child, .ccn__lista > .ccn__item:first-child { border-top: none; }
.ccn__item:hover { background: var(--nu-row-hover); }
.ccn__item--int { padding: 24px 12px; }

.ccn__par { display: flex; align-items: center; gap: 8px; }
.ccn__fio { position: relative; flex: 1; min-width: 40px; display: flex; align-items: center; color: color-mix(in srgb, var(--nu-navy) 30%, transparent); }
.ccn__fio svg { display: block; }
.ccn__fio path { fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
.ccn__fio-ponta { flex-shrink: 0; margin-left: -6px; }
.ccn__fio--int { color: #2F6AFF; }
.ccn__fio--int path { stroke-width: 2.4; }
.ccn__fio-oque {
  position: absolute; left: 50%; bottom: calc(50% + 8px); transform: translateX(-50%); white-space: nowrap;
  color: var(--nu-blue-text); font-size: var(--nu-fs-xs); font-weight: 700;
}
/* a luz que percorre o fio uma vez, quando a linha entra */
.ccn__fio-luz {
  position: absolute; top: 50%; left: 0; width: 22px; height: 6px; margin-top: -3px; border-radius: 6px; opacity: 0; pointer-events: none;
  background: radial-gradient(closest-side, #fff, color-mix(in srgb, #2F6AFF 40%, transparent) 60%, transparent);
}
.ccn__logo { display: inline-flex; border-radius: 27%; }
.ccn__logo--fora { opacity: .6; filter: saturate(.55); }
.ccn__item:hover .ccn__logo--fora { opacity: 1; filter: none; }
.ccn__par :deep(img), .ccn__par > :first-child, .ccn__par > :last-child { box-shadow: 0 0 0 1px var(--nu-navy-06), 0 12px 26px -14px rgba(12, 21, 36, .35); border-radius: 27%; }

.ccn__txt { min-width: 0; display: flex; flex-direction: column; gap: 5px; }
.ccn__frase { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.02em; line-height: 1.25; text-wrap: balance; }
.ccn__frase--fora { font-size: var(--nu-fs-lg); font-weight: 700; letter-spacing: -0.01em; }
.ccn__duas { color: var(--nu-blue-text); }
.ccn__valor { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.45; font-variant-numeric: tabular-nums; }
.ccn__provas { padding: 0; border: 0; background: none; font: inherit; color: var(--nu-blue-text); font-weight: 700; cursor: pointer; }
.ccn__provas:hover { color: var(--nu-blue-hover); }
.ccn__provas:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; border-radius: 4px; }

.ccn__sub { margin: clamp(28px, 3.4vw, 44px) 0 6px; color: var(--nu-ink-75); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -0.01em; }
.ccn__grupo { border-top: 1px solid var(--nu-cream-2); }
.ccn__grupo:first-child { border-top: none; }
.ccn__grupo .ccn__item { border-top: none; }
.ccn__grupo-frase { margin: 16px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.02em; }

/* ——— a entrada: cada linha surge do desfoque, uma depois da outra ——— */
.ccn--esperando .ccn__item, .ccn--esperando .ccn__grupo, .ccn--esperando .ccn__sub { opacity: 0; }
.ccn--revelando .ccn__lista > li { animation: ccn-surge .6s var(--ease) both; animation-delay: calc(var(--i) * 110ms + 380ms); }
.ccn--revelando .ccn__sub { animation: ccn-surge .6s var(--ease) .5s both; }
.ccn--revelando .ccn__fio-luz { animation: ccn-luz 1.3s cubic-bezier(.45, 0, .25, 1) both; animation-delay: calc(var(--i) * 110ms + 900ms); }
@keyframes ccn-surge { from { opacity: 0; filter: blur(8px); transform: translateY(8px); } }
@keyframes ccn-luz { 0% { left: 0; opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { left: calc(100% - 22px); opacity: 0; } }

@media (max-width: 600px) {
  .ccn__item { grid-template-columns: minmax(0, 1fr); gap: 12px; padding: 16px 10px; margin: 0 -10px; }
  .ccn__par { max-width: 220px; }
  .ccn__frase { font-size: var(--nu-fs-lg); }
  .ccn__frase--fora { font-size: var(--nu-fs-md); }
  .ccn__grupo-frase { font-size: var(--nu-fs-lg); }
}
@media (prefers-reduced-motion: reduce) {
  .ccn--revelando .ccn__lista > li, .ccn--revelando .ccn__sub, .ccn--revelando .ccn__fio-luz { animation: none; }
}
</style>
