<script setup lang="ts">
// As ações que flutuam em volta do hero da home (dono, 23/10/2026: "umas tags
// meio que voando na hero, dos ativos e da variação atual, com a logo bem
// arredondada"). Seis nomes conhecidos, cada um com a logo redonda e a
// variação do dia, levando à página do ativo. O dado vem de /api/hero-ativos,
// cacheado no servidor e com a mesma fonte da página do ativo. Sem dado,
// nenhuma plaquinha.
// A partir de 1200px elas ficam nas laterais, longe do título, do apoio, da
// barra e da resposta, em profundidades diferentes. Abaixo disso não sobra
// lateral: quatro descem para baixo da resposta, soltas. Ali o espaço fica
// reservado desde o primeiro quadro, senão a página pularia quando elas
// chegam. Movimento reduzido: paradas.
interface Ativo { ticker: string; pct: number }

const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const ativos = ref<Ativo[]>([])

onMounted(async () => {
  try {
    const r = await $fetch<{ data?: Ativo[] }>('/api/hero-ativos')
    ativos.value = (r?.data ?? []).filter((a) => a?.ticker && Number.isFinite(a.pct)).slice(0, 6)
  } catch { /* sem plaquinhas */ }
})

const pct = (n: number) => `${n > 0 ? '+' : ''}${nf2.format(n)}%`
const dir = (n: number) => (n > 0 ? 'up' : n < 0 ? 'down' : 'flat')
</script>

<template>
  <div class="mha">
    <NuxtLink
      v-for="(a, k) in ativos" :key="a.ticker" :to="`/asset/${a.ticker}`"
      class="mha__tag" :class="`mha__tag--${k + 1}`" :style="{ '--k': k }"
      :aria-label="`${a.ticker}, ${pct(a.pct)} no dia`"
    >
      <span class="mha__pilula">
        <NuAssetLogo :ticker="a.ticker" :letter="a.ticker.charAt(0)" tile-bg="var(--nu-tile-blue-bg)" tile-fg="var(--nu-blue-deep)" :size="34" :radius="17" />
        <span class="mha__tk">{{ a.ticker }}</span>
        <span class="mha__pct" :class="`mha__pct--${dir(a.pct)}`">{{ pct(a.pct) }}</span>
      </span>
    </NuxtLink>
  </div>
</template>

<style scoped>
/* a camada cobre o hero inteiro e só as plaquinhas recebem clique */
.mha { position: absolute; inset: 0; pointer-events: none; }
.mha__tag {
  position: absolute; left: calc(50% + var(--dx)); top: var(--y); translate: -50% -50%; rotate: var(--r); scale: var(--s, 1);
  pointer-events: auto; border-radius: var(--nu-r-pill); text-decoration: none;
  transition: scale .3s cubic-bezier(.22, 1, .36, 1);
  animation: mha-entra 1s cubic-bezier(.22, 1, .36, 1) backwards; animation-delay: calc(.45s + var(--k) * 90ms);
}
/* três de cada lado, em alturas e profundidades diferentes (--s: as menores
   parecem mais longe). Os --dx deixam ~24px até o texto e até a borda da tela */
.mha__tag--1 { --dx: calc(-1 * min(37vw, 560px)); --y: 20%; --r: -6deg; --t: 7s; }
.mha__tag--2 { --dx: calc(-1 * min(36vw, 610px)); --y: 50%; --r: 4deg; --t: 8.4s; --s: .92; }
.mha__tag--3 { --dx: calc(-1 * min(37vw, 540px)); --y: 86%; --r: -3deg; --t: 7.6s; --s: .88; }
.mha__tag--4 { --dx: min(39vw, 570px); --y: 17%; --r: 5deg; --t: 8s; --s: .94; }
.mha__tag--5 { --dx: min(37vw, 620px); --y: 47%; --r: -4deg; --t: 7.2s; --s: .88; }
.mha__tag--6 { --dx: min(36vw, 530px); --y: 85%; --r: 3deg; --t: 9s; }

/* vidro claro sobre o creme, com a sombra levemente azulada da barra */
.mha__pilula {
  display: inline-flex; align-items: center; gap: 10px; padding: 6px 16px 6px 6px; border-radius: inherit;
  background: color-mix(in srgb, var(--nu-white) 80%, transparent);
  border: 1px solid color-mix(in srgb, var(--nu-white) 92%, transparent);
  box-shadow:
    0 1px 2px color-mix(in srgb, var(--nu-ink) 6%, transparent),
    0 12px 32px -10px color-mix(in srgb, var(--nu-blue) 26%, transparent),
    0 22px 44px -22px color-mix(in srgb, var(--nu-ink) 22%, transparent);
  backdrop-filter: blur(14px) saturate(1.4); -webkit-backdrop-filter: blur(14px) saturate(1.4);
  white-space: nowrap; transition: box-shadow .3s ease;
  animation: mha-flutua var(--t, 8s) ease-in-out infinite; animation-delay: calc(var(--k) * -1.7s);
}
/* a logo redonda, com um aro fino para as de fundo branco */
.mha__pilula :deep(.nal) { box-shadow: 0 0 0 1px color-mix(in srgb, var(--nu-ink) 8%, transparent); }
.mha__tk { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; letter-spacing: -0.01em; }
.mha__pct { font-size: var(--nu-fs-md); font-weight: 700; font-variant-numeric: tabular-nums; }
.mha__pct--up { color: var(--nu-green); }
.mha__pct--down { color: var(--nu-red); }
.mha__pct--flat { color: var(--nu-gray); }

.mha__tag:hover { scale: calc(var(--s, 1) * 1.06); }
.mha__tag:hover .mha__pilula {
  animation-play-state: paused;
  box-shadow: 0 1px 2px color-mix(in srgb, var(--nu-ink) 6%, transparent), 0 18px 40px -10px color-mix(in srgb, var(--nu-blue) 34%, transparent);
}
.mha__tag:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }

@keyframes mha-entra { from { opacity: 0; scale: .8; filter: blur(8px); } }
@keyframes mha-flutua {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-9px) rotate(1.5deg); }
}

/* até 1279px a resposta chega perto das laterais: as duas do pé saem */
@media (max-width: 1279px) {
  .mha__tag--3, .mha__tag--6 { display: none; }
}
/* sem lateral livre: quatro descem para baixo da resposta, numa fileira solta
   (duas fileiras no celular). O espaço fica reservado mesmo antes do dado */
@media (max-width: 1199px) {
  .mha {
    position: static; display: grid; grid-template-columns: repeat(4, auto); justify-content: center; align-items: center;
    gap: 18px 14px; min-height: 64px; margin-top: 6px; pointer-events: auto;
  }
  .mha__tag { position: relative; left: auto; top: auto; translate: var(--ox, 0) var(--oy, 0); scale: 1; }
  .mha__tag:hover { scale: 1.06; }
  .mha__tag--3, .mha__tag--6 { display: none; }
  .mha__tag--1 { --oy: 0; --r: -4deg; }
  .mha__tag--2 { --oy: 8px; --r: 3deg; }
  .mha__tag--4 { --oy: -2px; --r: 4deg; }
  .mha__tag--5 { --oy: 6px; --r: -3deg; }
}
@media (max-width: 859px) {
  .mha__pilula { gap: 8px; padding: 4px 12px 4px 4px; }
  .mha__tk, .mha__pct { font-size: var(--nu-fs-sm); }
  .mha__pilula :deep(.nal) { width: 28px !important; height: 28px !important; }
}
/* duas fileiras desencontradas, como tijolos: a de cima puxa para a esquerda,
   a de baixo para a direita, sem apertar o vão entre as duas de cada fileira */
@media (max-width: 719px) {
  .mha { grid-template-columns: repeat(2, auto); min-height: 116px; }
  .mha__tag--1, .mha__tag--2 { --ox: -8px; }
  .mha__tag--4, .mha__tag--5 { --ox: 8px; }
}
/* celular estreito (320px): duas só, uma embaixo da outra */
@media (max-width: 359px) {
  .mha { grid-template-columns: auto; min-height: 98px; }
  .mha__tag--4, .mha__tag--5 { display: none; }
  .mha__tag--1 { --ox: -22px; }
  .mha__tag--2 { --ox: 22px; }
}

@media (prefers-reduced-motion: reduce) {
  .mha__tag, .mha__pilula { animation: none; }
}
</style>
