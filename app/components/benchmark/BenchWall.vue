<script setup lang="ts">
// Concorda com tudo? como um muro de verdade (dono, 16/10: "crie um murinho mesmo
// ... e algum design que apareça o que é concordar e não"). À esquerda, quem disse
// não ao plano ruim; à direita, quem disse sim; sentados em cima do muro, quem
// ficou em cima do muro em parte dos casos, com o quanto numa etiqueta. Cada
// modelo aparece uma vez, no pior lugar em que esteve: quem concordou alguma vez
// vai para o "sim", quem só ficou no muro senta no muro, o resto fica no "não".
// O lado vazio diz sozinho que ninguém concordou.
// Movimento: os modelos descem para o lugar deles ao entrar na tela.
const props = defineProps<{
  rows: { id: string; name: string; good: number; mid?: number; bad: number }[]
}>()
const { el, revealClass } = useReveal(0.2)

const sim = computed(() => props.rows.filter((r) => r.bad > 0))
const muro = computed(() => props.rows.filter((r) => r.bad === 0 && (r.mid ?? 0) > 0))
const nao = computed(() => props.rows.filter((r) => r.bad === 0 && !((r.mid ?? 0) > 0)))
const pct = (v: number) => `${Math.round(v)}%`

// tijolos do muro (viewBox 160 × 132): fileiras de 13 de altura, desencontradas
const TIJOLOS = (() => {
  const out: { x: number; y: number; w: number; t: number }[] = []
  for (let row = 0; row < 8; row++) {
    const y = 132 - (row + 1) * 16.5
    const off = row % 2 ? -17 : 0
    for (let x = off; x < 160; x += 34) {
      const x0 = Math.max(0, x)
      const x1 = Math.min(160, x + 31)
      if (x1 - x0 > 4) out.push({ x: x0, y, w: x1 - x0, t: (((row * 7 + Math.round(x)) % 3) + 3) % 3 })
    }
  }
  return out
})()
</script>

<template>
  <div ref="el" class="bwl" :class="revealClass" role="img" :aria-label="`Disseram não ao plano ruim: ${nao.map((r) => r.name).join(', ') || 'nenhum'}. Ficaram em cima do muro às vezes: ${muro.map((r) => `${r.name} (${pct(r.mid ?? 0)})`).join(', ') || 'nenhum'}. Disseram sim: ${sim.map((r) => `${r.name} (${pct(r.bad)})`).join(', ') || 'nenhum'}.`">
    <div class="bwl__scene" aria-hidden="true">
      <!-- lado do não -->
      <div class="bwl__side bwl__side--nao">
        <div class="bwl__head">
          <span class="bwl__icon bwl__icon--nao"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
          <span class="bwl__title">Não</span>
          <span class="bwl__count">{{ nao.length }}</span>
        </div>
        <ul class="bwl__crowd">
          <li v-for="(r, i) in nao" :key="r.id" class="bwl__ia" :style="{ '--i': i }">
            <span class="bwl__face"><img v-if="benchLogo(r.id)" :src="benchLogo(r.id)!" alt="" width="24" height="24" loading="lazy" decoding="async"></span>
            <span class="bwl__name">{{ r.name }}</span>
          </li>
        </ul>
      </div>

      <!-- o muro, com quem sentou nele -->
      <div class="bwl__mid">
        <div class="bwl__head bwl__head--muro">
          <span class="bwl__icon bwl__icon--muro"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 12h12" /></svg></span>
          <span class="bwl__title">No muro</span>
        </div>
        <ul class="bwl__sitters">
          <li v-for="(r, i) in muro" :key="r.id" class="bwl__ia bwl__ia--sit" :style="{ '--i': i + nao.length }">
            <span class="bwl__tag bwl__tag--muro">{{ pct(r.mid ?? 0) }}</span>
            <span class="bwl__name">{{ r.name }}</span>
            <span class="bwl__face"><img v-if="benchLogo(r.id)" :src="benchLogo(r.id)!" alt="" width="24" height="24" loading="lazy" decoding="async"></span>
          </li>
        </ul>
        <svg viewBox="0 0 160 132" class="bwl__wall" preserveAspectRatio="none">
          <rect v-for="(t, k) in TIJOLOS" :key="k" :x="t.x" :y="t.y" :width="t.w" height="13" rx="2.5" class="bwl__brick" :class="`bwl__brick--${t.t}`" />
        </svg>
      </div>

      <!-- lado do sim -->
      <div class="bwl__side bwl__side--sim">
        <div class="bwl__head">
          <span class="bwl__icon bwl__icon--sim"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg></span>
          <span class="bwl__title">Sim</span>
          <span class="bwl__count">{{ sim.length }}</span>
        </div>
        <ul v-if="sim.length" class="bwl__crowd">
          <li v-for="(r, i) in sim" :key="r.id" class="bwl__ia" :style="{ '--i': i + nao.length + muro.length }">
            <span class="bwl__tag bwl__tag--sim">{{ pct(r.bad) }}</span>
            <span class="bwl__face"><img v-if="benchLogo(r.id)" :src="benchLogo(r.id)!" alt="" width="24" height="24" loading="lazy" decoding="async"></span>
            <span class="bwl__name">{{ r.name }}</span>
          </li>
        </ul>
        <div v-else class="bwl__empty">Ninguém</div>
      </div>
    </div>
    <div class="bwl__ground" aria-hidden="true" />
  </div>
</template>

<style scoped>
.bwl { container-type: inline-size; }
.bwl__scene { display: grid; grid-template-columns: minmax(0, 1fr) 190px minmax(0, 1fr); align-items: end; gap: clamp(14px, 3cqi, 36px); min-height: 340px; }

.bwl__side { align-self: stretch; display: flex; flex-direction: column; border-radius: var(--nu-r-tile) var(--nu-r-tile) 0 0; padding: 18px 18px 22px; }
.bwl__side--nao { background: linear-gradient(180deg, var(--nu-blue-tint-2), var(--nu-blue-tint)); }
.bwl__side--sim { background: linear-gradient(180deg, var(--nu-red-soft-16), var(--nu-red-tint)); }
.bwl__head { display: flex; align-items: center; gap: 9px; min-height: 40px; }
.bwl__icon { width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; color: var(--nu-white); }
.bwl__icon svg { width: 15px; height: 15px; }
.bwl__icon--nao { background: var(--nu-green); }
.bwl__icon--sim { background: var(--nu-red); }
.bwl__icon--muro { background: var(--nu-amber-fill); }
.bwl__title { color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.02em; }
.bwl__count { margin-left: auto; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.bwl__side--sim .bwl__count { color: var(--nu-red-2); }

.bwl__crowd { list-style: none; margin: auto 0 0; padding: 18px 0 0; display: flex; flex-wrap: wrap; align-content: flex-end; gap: 14px 10px; }
.bwl__ia { position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px; width: 76px; }
.bwl__face {
  width: 48px; height: 48px; border-radius: 50%; display: grid; place-items: center;
  background: var(--nu-white); box-shadow: 0 6px 16px var(--nu-navy-09), inset 0 0 0 1px var(--nu-cream-2);
}
.bwl__face img { width: 24px; height: 24px; display: block; object-fit: contain; }
.bwl__name { text-align: center; color: var(--nu-ink); font-size: var(--nu-fs-xs); font-weight: 700; line-height: 1.2; }
.bwl__tag { padding: 2px 8px; border-radius: var(--nu-r-pill); font-size: var(--nu-fs-xs); font-weight: 800; font-variant-numeric: tabular-nums; }
.bwl__tag--muro { background: var(--nu-amber-fill); color: var(--nu-ink); }
.bwl__tag--sim { background: var(--nu-red); color: var(--nu-white); }
.bwl__empty {
  margin: auto auto 6px; width: 120px; height: 120px; border-radius: 50%; display: grid; place-items: center;
  border: 2px dashed var(--nu-red-soft); color: var(--nu-red-2); font-size: var(--nu-fs-md); font-weight: 800;
}

/* o muro: tijolos âmbar desencontrados, quem ficou em cima senta na borda */
.bwl__mid { position: relative; align-self: stretch; display: flex; flex-direction: column; align-items: center; padding-top: 18px; }
.bwl__head--muro { justify-content: center; }
.bwl__head--muro .bwl__title { color: var(--nu-amber-text); }
.bwl__sitters { list-style: none; margin: auto 0 -10px; padding: 18px 0 0; display: flex; justify-content: center; align-items: flex-end; gap: 6px; position: relative; z-index: 1; }
.bwl__ia--sit { width: 84px; }
.bwl__wall { display: block; width: 100%; height: 150px; filter: drop-shadow(0 -4px 12px var(--nu-amber-bg)); }
.bwl__brick--0 { fill: var(--nu-amber-fill); }
.bwl__brick--1 { fill: color-mix(in srgb, var(--nu-amber-fill) 70%, var(--nu-amber-soft)); }
.bwl__brick--2 { fill: color-mix(in srgb, var(--nu-amber-fill) 82%, var(--nu-amber-text)); }

.bwl__ground { height: 3px; border-radius: 2px; background: var(--nu-navy-09); margin-top: -1px; }

/* entrada: os modelos descem para o lugar deles */
.is-pending .bwl__ia { opacity: 0; transform: translateY(-18px); }
.is-in .bwl__ia { transition: opacity .45s ease, transform .55s cubic-bezier(.2, .9, .3, 1.2); transition-delay: calc(var(--i) * 70ms); }
.is-pending .bwl__wall { opacity: 0; transform: translateY(10px); }
.is-in .bwl__wall { transition: opacity .5s ease, transform .5s ease; }

@container (max-width: 640px) {
  .bwl__scene { grid-template-columns: minmax(0, 1fr) 118px minmax(0, 1fr); gap: 6px; min-height: 0; }
  .bwl__side { padding: 12px 8px 14px; }
  .bwl__mid { padding-top: 12px; }
  .bwl__head { gap: 6px; min-height: 28px; }
  .bwl__title { font-size: var(--nu-fs-md); }
  .bwl__count { font-size: var(--nu-fs-xl); }
  .bwl__icon { width: 22px; height: 22px; flex-shrink: 0; }
  .bwl__icon svg { width: 12px; height: 12px; }
  .bwl__crowd { flex-direction: column; flex-wrap: nowrap; align-items: stretch; gap: 8px; padding-top: 14px; }
  .bwl__crowd .bwl__ia { flex-direction: row; flex-wrap: wrap; width: auto; gap: 4px 6px; }
  .bwl__crowd .bwl__name { flex: 1; min-width: 0; text-align: left; }
  .bwl__crowd .bwl__tag { order: 3; }
  .bwl__face { width: 30px; height: 30px; flex-shrink: 0; box-shadow: 0 3px 10px var(--nu-navy-09), inset 0 0 0 1px var(--nu-cream-2); }
  .bwl__face img { width: 16px; height: 16px; }
  .bwl__sitters { gap: 2px; padding-top: 14px; }
  .bwl__ia--sit { width: 58px; gap: 4px; }
  .bwl__wall { height: 96px; }
  .bwl__empty { width: 78px; height: 78px; font-size: var(--nu-fs-sm); }
}
</style>
