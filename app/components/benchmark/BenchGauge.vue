<script setup lang="ts">
// Concorda com tudo? num medidor grande (dono, 16/10: escolheu o "medidor
// grande", no estilo do "SUMMARY" do exemplo). O arco é a média dos modelos: azul
// em degradê é o quanto seguraram o investidor no plano ruim, âmbar é "no muro" e
// vermelho é "concordou", na ordem, da esquerda para a direita. No meio, quantos
// concordaram com algum plano ruim. Embaixo, um selo por modelo: check verde para
// quem segurou tudo, âmbar para quem ficou no muro, vermelho para quem concordou.
// Movimento: o arco se fecha da esquerda e os selos entram em seguida.
const props = defineProps<{
  rows: { id: string; name: string; rank: number; value: number; good: number; mid?: number; bad: number }[]
}>()
const { el, revealClass } = useReveal(0.2)
const gid = useId()

const n = computed(() => props.rows.length || 1)
const media = (f: (r: (typeof props.rows)[number]) => number) => props.rows.reduce((a, r) => a + f(r), 0) / n.value
const good = computed(() => media((r) => r.good))
const mid = computed(() => media((r) => r.mid ?? 0))
const bad = computed(() => media((r) => r.bad))
const concordaram = computed(() => props.rows.filter((r) => r.bad > 0).length)

// arco de 180° (da esquerda para a direita), raio 170, centro em (200, 205)
const ARCO = 'M 30 205 A 170 170 0 0 1 370 205'
// marcas em volta do arco, de 2 em 2%: a cada 10% uma marca maior
const marcas = computed(() => Array.from({ length: 51 }, (_, k) => {
  const a = Math.PI - (k / 50) * Math.PI
  const grande = k % 5 === 0
  const r1 = 192
  const r2 = grande ? 204 : 199
  return { x1: 200 + r1 * Math.cos(a), y1: 205 - r1 * Math.sin(a), x2: 200 + r2 * Math.cos(a), y2: 205 - r2 * Math.sin(a), grande }
}))
const estado = (r: (typeof props.rows)[number]) => (r.bad > 0 ? 'b' : (r.mid ?? 0) > 0 ? 'm' : 'g')
const pct1 = (v: number) => fmtBench.pct(v)
</script>

<template>
  <div ref="el" class="bga" :class="revealClass">
    <div class="bga__top">
      <div class="bga__gauge">
        <svg viewBox="0 0 400 220" class="bga__svg" role="img" :aria-label="`${concordaram} de ${rows.length} modelos concordaram com algum plano ruim. Na média, seguraram ${pct1(good)}.`">
          <defs>
            <linearGradient :id="`${gid}-g`" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" class="bga__stop-a" />
              <stop offset="1" class="bga__stop-b" />
            </linearGradient>
          </defs>
          <line v-for="(m, k) in marcas" :key="k" :x1="m.x1" :y1="m.y1" :x2="m.x2" :y2="m.y2" class="bga__tick" :class="{ 'bga__tick--big': m.grande }" />
          <path :d="ARCO" class="bga__track" fill="none" />
          <path :d="ARCO" pathLength="100" class="bga__seg bga__seg--g" :stroke="`url(#${gid}-g)`" fill="none" :style="{ '--len': good, '--ini': 0 }" />
          <path v-if="mid > 0" :d="ARCO" pathLength="100" class="bga__seg bga__seg--m" fill="none" :style="{ '--len': mid, '--ini': good }" />
          <path v-if="bad > 0" :d="ARCO" pathLength="100" class="bga__seg bga__seg--b" fill="none" :style="{ '--len': bad, '--ini': good + mid }" />
        </svg>
        <div class="bga__center" aria-hidden="true">
          <span class="bga__num">{{ concordaram }} <small>de {{ rows.length }}</small></span>
          <span class="bga__cap">concordaram com o plano ruim</span>
        </div>
      </div>
      <dl class="bga__stats">
        <div><dt><i class="bga__sw bga__sw--g" />Segurou</dt><dd>{{ pct1(good) }}</dd></div>
        <div><dt><i class="bga__sw bga__sw--m" />No muro</dt><dd>{{ pct1(mid) }}</dd></div>
        <div><dt><i class="bga__sw bga__sw--b" />Concordou</dt><dd>{{ pct1(bad) }}</dd></div>
      </dl>
    </div>

    <ul class="bga__chips">
      <li
        v-for="(r, i) in rows" :key="r.id" class="bga__chip" :class="`bga__chip--${estado(r)}`" :style="{ '--i': i }"
        :aria-label="`${r.name}: segurou ${Math.round(r.good)}%${(r.mid ?? 0) > 0 ? `, no muro ${Math.round(r.mid!)}%` : ''}${r.bad > 0 ? `, concordou ${Math.round(r.bad)}%` : ''}`"
      >
        <span class="bga__tile" aria-hidden="true"><img v-if="benchLogo(r.id)" :src="benchLogo(r.id)!" alt="" width="16" height="16" loading="lazy" decoding="async"></span>
        <span class="bga__name" aria-hidden="true">{{ r.name }}</span>
        <span v-if="estado(r) === 'g'" class="bga__ok" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </span>
        <span v-else class="bga__tag" aria-hidden="true">{{ estado(r) === 'b' ? `concordou ${Math.round(r.bad)}%` : `no muro ${Math.round(r.mid ?? 0)}%` }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.bga { container-type: inline-size; }
.bga__top { display: flex; flex-direction: column; align-items: center; }
.bga__gauge { position: relative; width: min(560px, 100%); }
.bga__svg { display: block; width: 100%; height: auto; overflow: visible; }
.bga__stop-a { stop-color: var(--nu-blue-soft); }
.bga__stop-b { stop-color: var(--nu-blue); }
.bga__tick { stroke: var(--nu-navy-14); stroke-width: 1.5; stroke-linecap: round; }
.bga__tick--big { stroke: var(--nu-navy-55); stroke-width: 2; }
.bga__track { stroke: var(--nu-navy-06); stroke-width: 26; stroke-linecap: round; }
.bga__seg { stroke-width: 26; stroke-linecap: round; stroke-dasharray: calc(var(--len) * 1px) 200px; stroke-dashoffset: calc(var(--ini) * -1px); }
.bga__seg--g { filter: drop-shadow(0 6px 14px var(--nu-blue-28)); }
.bga__seg--m { stroke: var(--nu-amber-fill); }
.bga__seg--b { stroke: var(--nu-red); }
.bga__center {
  position: absolute; left: 0; right: 0; bottom: 4%; display: flex; flex-direction: column; align-items: center; text-align: center; pointer-events: none;
}
.bga__num { color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.04em; line-height: 1; font-variant-numeric: tabular-nums; }
.bga__num small { color: var(--nu-gray); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; }
.bga__cap { margin-top: 8px; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 700; }

.bga__stats { display: flex; gap: clamp(20px, 6cqi, 56px); margin: 22px 0 0; }
.bga__stats div { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.bga__stats dt { display: inline-flex; align-items: center; gap: 7px; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; }
.bga__stats dd { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; font-variant-numeric: tabular-nums; }
.bga__sw { width: 10px; height: 10px; border-radius: 50%; }
.bga__sw--g { background: var(--nu-blue); }
.bga__sw--m { background: var(--nu-amber-fill); }
.bga__sw--b { background: var(--nu-red); }

.bga__chips { list-style: none; margin: clamp(28px, 4cqi, 40px) 0 0; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.bga__chip {
  display: inline-flex; align-items: center; gap: 9px; padding: 7px 8px 7px 7px; border-radius: var(--nu-r-pill);
  background: var(--b-surface, var(--nu-cream)); box-shadow: inset 0 0 0 1px var(--nu-cream-2);
}
.bga__chip--m { box-shadow: inset 0 0 0 1.5px var(--nu-amber-fill); background: var(--nu-amber-bg); }
.bga__chip--b { box-shadow: inset 0 0 0 1.5px var(--nu-red); background: var(--nu-red-bg); }
.bga__tile {
  width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center;
  background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-cream-2);
}
.bga__tile img { width: 16px; height: 16px; display: block; object-fit: contain; }
.bga__name { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap; }
.bga__ok { width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; background: var(--nu-green); color: var(--nu-white); }
.bga__ok svg { width: 14px; height: 14px; }
.bga__tag { padding: 3px 9px; border-radius: var(--nu-r-pill); font-size: var(--nu-fs-xs); font-weight: 800; white-space: nowrap; }
.bga__chip--m .bga__tag { background: var(--nu-amber-fill); color: var(--nu-ink); }
.bga__chip--b .bga__tag { background: var(--nu-red); color: var(--nu-white); }

/* entrada: o arco se fecha da esquerda; os selos entram em seguida */
.is-pending .bga__seg { stroke-dasharray: 0px 200px; }
.is-in .bga__seg { transition: stroke-dasharray 1.2s cubic-bezier(.2, .8, .2, 1); }
.is-pending .bga__chip { opacity: 0; transform: translateY(8px); }
.is-in .bga__chip { transition: opacity .4s ease, transform .4s ease; transition-delay: calc(.5s + var(--i) * 60ms); }

@container (max-width: 520px) {
  .bga__stats { gap: 18px; }
  .bga__stats dd { font-size: var(--nu-fs-lg); }
  .bga__cap { font-size: var(--nu-fs-xs); }
}
</style>
