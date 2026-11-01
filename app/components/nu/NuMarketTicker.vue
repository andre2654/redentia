<script setup lang="ts">
// Faixa "Mercado agora" — presente em todas as telas dos designs.
// Dados via useMarketTicker (skeleton → hidrata real). Sem dado real a faixa
// NÃO é desenhada: até 2026-08-29 ela degradava pra um seed de cotações do
// design e mostrava número inventado sob o carimbo "B3" em todas as telas.
// Ajustes do dono do design (2026-07-11): a faixa é STICKY no topo ao rolar,
// e as cotações giram num marquee contínuo e lento (pausa no hover;
// prefers-reduced-motion desliga). Loop sem emenda: o track duplica os itens
// e anima -50% da própria largura.
const { items, loading } = useMarketTicker()

// No /assinar (pedido do dono, 31/10/2026: "algo que ajude a vender"), a
// faixa troca as cotações pelo que a pessoa ganha ao conectar, girando do
// mesmo jeito, e o canto direito abre o quiz. Tudo o que está aqui existe.
const route = useRoute()
const vendendo = computed(() => route.path === '/assinar')
const VENDAS = [
  'Nubank, Itaú, XP e mais de 100 bancos e corretoras',
  'Todos os seus investimentos numa tela só',
  '2.000 cenários dos próximos 5 anos',
  'Um aviso no dia em que importa',
  'Uma IA que responde com os seus números',
  'Só leitura: ninguém mexe no seu dinheiro',
  'Regulado pelo Banco Central',
  'Cancele quando quiser',
]
const quiz = useQuizAssinatura()

// larguras variadas pros bares do skeleton (parece uma faixa de cotações)
const SK_WIDTHS = [64, 90, 74, 104, 88, 70, 96, 78]
</script>

<template>
  <!-- items vazio = hidratou e nada real chegou: a faixa some (some, não
       mente). loading ainda true = skeleton, o estado normal do SSR. -->
  <!-- no /assinar: o que vem ao conectar -->
  <div v-if="vendendo" class="nut-wrap">
    <div class="nut">
      <span class="nut__label">Ao conectar</span>
      <div class="nut__marquee">
        <div class="nut__track">
          <div v-for="half in 2" :key="half" class="nut__group" :aria-hidden="half === 2 || undefined">
            <span v-for="v in VENDAS" :key="`${half}-${v}`" class="nut__item">
              <svg class="nut__visto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              <span class="nut__value">{{ v }}</span>
            </span>
          </div>
        </div>
      </div>
      <button type="button" class="nut__conectar" aria-haspopup="dialog" @click="quiz.abrir('faixa')">
        Conectar carteira
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </button>
    </div>
  </div>
  <div v-else-if="loading || items.length" class="nut-wrap">
    <div class="nut">
      <span class="nut__label">Mercado agora</span>
      <div class="nut__marquee">
        <!-- skeleton: barras estáticas enquanto as cotações reais carregam (sem seed falso) -->
        <div v-if="loading" class="nut__sk">
          <NuSkeleton v-for="(w, i) in SK_WIDTHS" :key="i" variant="line" :width="`${w}px`" height="15px" radius="pill" />
        </div>
        <div v-else class="nut__track">
          <div v-for="half in 2" :key="half" class="nut__group" :aria-hidden="half === 2 || undefined">
            <span v-for="t in items" :key="`${half}-${t.n}`" class="nut__item">
              <span class="nut__name">{{ t.n }}</span>
              <span class="nut__value">{{ t.v }}</span>
              <span v-if="t.pct" class="nut__pct" :class="t.dir === 'down' ? 'nut__pct--down' : 'nut__pct--up'">{{ t.pct }}</span>
            </span>
          </div>
        </div>
      </div>
      <span class="nut__note" data-nu-hide>B3 · dados com atraso de 15 min</span>
    </div>
  </div>
</template>

<style scoped>
.nut-wrap {
  background: var(--nu-cream);
  /* gruda ABAIXO do header sticky (UX do dono 2026-07-11): --nuh-h vive no
     <html>, setada pelo NuHeader (76px normal, 58px encolhido). */
  position: sticky; top: var(--nuh-h, 76px); z-index: 40;
  transition: top .28s ease;
}
.nut { display: flex; align-items: center; gap: 26px; padding: 14px 22px; }
.nut__label { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; white-space: nowrap; flex-shrink: 0; }
.nut__marquee { flex: 1; min-width: 0; overflow: hidden; }
.nut__sk { display: flex; align-items: center; gap: 26px; }
.nut__track { display: inline-flex; width: max-content; animation: nut-scroll 55s linear infinite; }
.nut__marquee:hover .nut__track { animation-play-state: paused; }
.nut__group { display: inline-flex; align-items: center; gap: 26px; padding-right: 26px; }
@keyframes nut-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.nut__item { display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0; }
.nut__name { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap; }
.nut__value { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; }
.nut__pct { font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; }
.nut__pct--up { color: var(--nu-green-text); }
.nut__pct--down { color: var(--nu-red-text); }
.nut__visto { color: var(--nu-green); flex-shrink: 0; }
.nut__conectar {
  display: inline-flex; align-items: center; gap: 7px; flex-shrink: 0; padding: 8px 14px; border: 0; border-radius: var(--nu-r-pill);
  background: var(--nu-blue); color: var(--nu-white); font-family: inherit; font-size: var(--nu-fs-sm); font-weight: 800; cursor: pointer;
  transition: background .2s;
}
.nut__conectar:hover { background: var(--nu-blue-hover); }
.nut__conectar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.nut__note { color: var(--nu-gray); font-size: var(--nu-fs-dense); white-space: nowrap; flex-shrink: 0; }

/* no celular a faixa de venda fica só com os itens e o botão */
@media (max-width: 560px) {
  .nut:has(.nut__conectar) .nut__label { display: none; }
  .nut:has(.nut__conectar) { gap: 14px; padding: 10px 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .nut__track { animation: none; }
}
</style>
