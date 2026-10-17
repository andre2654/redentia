<script setup lang="ts">
// Custo por mil respostas em esferas (dono, 16/10: "gráficos mais imponentes e
// criativos", no estilo das bolhas com brilho). A área da esfera é proporcional
// ao custo, então "maior = mais caro" se lê sem eixo; a cor é a posição no
// placar geral (azul até o 3º, âmbar do 4º ao 6º, vermelho dali para baixo),
// então uma esfera pequena e azul é nota alta por pouco dinheiro. O preço vai
// numa pílula dentro da esfera, ou embaixo quando ela é pequena demais.
// Movimento: as esferas surgem em sequência ao entrar na tela.
const props = defineProps<{ points: { id: string; name: string; cost: number; rank: number }[] }>()
const { el, revealClass } = useReveal(0.15)

const max = computed(() => Math.max(...props.points.map((p) => p.cost), 0.0001))
const ordem = computed(() => [...props.points].sort((a, b) => b.cost - a.cost))
// diâmetro relativo (0 a 1) com área proporcional ao custo
const rel = (c: number) => Math.sqrt(c / max.value)
const tom = (rank: number) => (rank <= 3 ? 'b' : rank <= 6 ? 'a' : 'r')
const usd = (v: number) => `US$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
</script>

<template>
  <div ref="el" class="bbl" :class="revealClass">
    <div class="bbl__legend" aria-hidden="true">
      <span><i class="bbl__sw bbl__sw--b" />até o 3º no placar</span>
      <span><i class="bbl__sw bbl__sw--a" />4º a 6º</span>
      <span><i class="bbl__sw bbl__sw--r" />7º em diante</span>
      <span class="bbl__note">tamanho = custo</span>
    </div>
    <ul class="bbl__row">
      <li
        v-for="(p, i) in ordem" :key="p.id" class="bbl__item" :style="{ '--d': rel(p.cost), '--i': i }"
        :aria-label="`${p.name}: ${usd(p.cost)} por mil respostas, ${p.rank}º no placar geral`"
      >
        <span class="bbl__ball" :class="[`bbl__ball--${tom(p.rank)}`, { 'bbl__ball--sm': rel(p.cost) < 0.42 }]" aria-hidden="true">
          <span class="bbl__pill">{{ usd(p.cost) }}</span>
        </span>
        <span class="bbl__pill bbl__pill--out" aria-hidden="true">{{ usd(p.cost) }}</span>
        <span class="bbl__name" aria-hidden="true">{{ p.name }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.bbl { container-type: inline-size; --dmax: min(230px, 30cqi); }
.bbl__legend { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 18px; margin-bottom: 26px; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; }
.bbl__legend span { display: inline-flex; align-items: center; gap: 7px; }
.bbl__note { color: var(--nu-gray); font-size: var(--nu-fs-xs); }
.bbl__sw { width: 12px; height: 12px; border-radius: 50%; }

.bbl__row { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: center; gap: 22px 18px; }
.bbl__item { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.bbl__ball {
  width: max(44px, calc(var(--d) * var(--dmax))); aspect-ratio: 1; border-radius: 50%;
  display: grid; place-items: center; transition: transform .25s ease;
}
.bbl__item:hover .bbl__ball { transform: translateY(-4px) scale(1.03); }
/* brilho: luz no alto à esquerda, borda mais funda, sombra colorida embaixo */
.bbl__ball--b, .bbl__sw--b {
  background: radial-gradient(circle at 32% 28%, var(--nu-white) 0%, var(--nu-blue-soft) 16%, var(--nu-blue) 55%, var(--nu-blue-deep) 100%);
  box-shadow: 0 18px 40px var(--nu-blue-28);
}
.bbl__ball--a, .bbl__sw--a {
  background: radial-gradient(circle at 32% 28%, var(--nu-white) 0%, var(--nu-amber-soft) 16%, var(--nu-amber-fill) 58%, var(--nu-amber-text) 100%);
  box-shadow: 0 18px 40px var(--nu-amber-bg);
}
.bbl__ball--r, .bbl__sw--r {
  background: radial-gradient(circle at 32% 28%, var(--nu-white) 0%, var(--nu-red-soft) 16%, var(--nu-red) 58%, var(--nu-red-2) 100%);
  box-shadow: 0 18px 40px var(--nu-red-tint);
}
.bbl__sw { box-shadow: none; }

.bbl__pill {
  border-radius: var(--nu-r-pill); padding: 5px 10px; white-space: nowrap;
  background: var(--nu-navy); color: var(--nu-white); font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums;
}
.bbl__pill--out { display: none; }
.bbl__ball--sm .bbl__pill { display: none; }
.bbl__ball--sm + .bbl__pill--out { display: inline-block; }
.bbl__name { max-width: 130px; text-align: center; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; line-height: 1.25; }

/* entrada: as esferas surgem da maior para a menor */
.is-pending .bbl__ball { opacity: 0; transform: scale(.6); }
.is-in .bbl__ball { animation: bbl-in .6s cubic-bezier(.2, .8, .2, 1) backwards; animation-delay: calc(var(--i) * 80ms); }
@keyframes bbl-in { from { opacity: 0; transform: scale(.6); } to { opacity: 1; transform: scale(1); } }

@container (max-width: 560px) {
  .bbl { --dmax: 46cqi; }
  .bbl__row { gap: 18px 12px; }
  .bbl__name { font-size: var(--nu-fs-xs); max-width: 96px; }
}
</style>
