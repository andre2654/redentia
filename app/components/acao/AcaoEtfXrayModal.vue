<script setup lang="ts">
// Modal do raio-X de ETF — o detalhe que a Opção B tirou da página: carteira
// completa, exposição look-through (com "via NASD11"), correlação 90d/12m com
// matriz N×N, avisos anti-confusão e a ficha cadastral. Mesmo chrome do
// NuDayModal (Teleport, backdrop com blur, Escape/click fecham, scroll-lock,
// useModalA11y) — não reusa o componente em si porque aquele é um modal de
// TEXTO (blocos <p v-html>) e este carrega listas e tabela.
import type { AcaoEtfXrayVM, EtfXrayMatrix } from '~/types/acao'

const props = defineProps<{
  open: boolean
  ticker: string
  asOfLabel: string
  modal: AcaoEtfXrayVM['modal']
}>()

const emit = defineEmits<{ close: [] }>()

const cardRef = ref<HTMLElement | null>(null)
useModalA11y(cardRef, toRef(props, 'open'))
const titleId = useId()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

watch(() => props.open, (open) => {
  if (import.meta.server) return
  document.documentElement.style.overflow = open ? 'hidden' : ''
  if (open) {
    document.addEventListener('keydown', onKey)
    nextTick(() => cardRef.value?.focus())
  } else {
    document.removeEventListener('keydown', onKey)
  }
})

onBeforeUnmount(() => {
  if (import.meta.server) return
  document.removeEventListener('keydown', onKey)
  document.documentElement.style.overflow = ''
})

const period = ref<'12m' | '90d'>('12m')
const corrRows = computed(() => (period.value === '12m' ? props.modal.rows12 : props.modal.rows90))
const matrix = computed<EtfXrayMatrix | null>(() =>
  (period.value === '12m' ? props.modal.matrix12 : props.modal.matrix90),
)

const maxHoldingPct = computed(() => Math.max(1e-6, ...props.modal.holdings.map((h) => h.pct)))
const maxAssetPct = computed(() => Math.max(1e-6, ...props.modal.topAssets.map((h) => h.pct)))

/** Célula da matriz: verde/vermelho com alpha pela magnitude. */
function cellStyle(v: number | null): Record<string, string> {
  if (v == null) return { background: 'var(--nu-hm-empty)', color: 'var(--nu-gray)' }
  const alpha = 0.1 + 0.85 * Math.min(1, Math.abs(v))
  const rgb = v >= 0 ? 'var(--nu-hm-green-rgb)' : 'var(--nu-hm-red-rgb)'
  const ink = Math.abs(v) > 0.55 ? 'var(--nu-white)' : v >= 0 ? 'var(--nu-hm-green-ink)' : 'var(--nu-hm-red-ink)'
  return { background: `rgba(${rgb}, ${alpha})`, color: ink }
}

const nfCell = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="axm" @click="emit('close')">
      <div ref="cardRef" class="axm__card" role="dialog" aria-modal="true" :aria-labelledby="titleId" tabindex="-1" @click.stop>
        <div class="axm__head">
          <div>
            <div class="axm__eyebrow">Raio-X do ETF · Redentia</div>
            <h4 :id="titleId" class="axm__title">{{ ticker }} por dentro</h4>
            <div class="axm__date">{{ asOfLabel }}</div>
          </div>
          <button type="button" class="axm__close" aria-label="Fechar" @click="emit('close')">✕</button>
        </div>

        <div v-if="modal.warnings.length" class="axm__warnings">
          <div v-for="w in modal.warnings" :key="w" class="axm__warning">{{ w }}</div>
        </div>

        <div class="axm__divider" />

        <div v-if="modal.sectorBar.length || modal.topAssets.length" class="axm__block">
          <div class="axm__lbl">No fim, onde seu dinheiro está</div>
          <template v-if="modal.sectorBar.length">
            <div class="axm__bar">
              <span v-for="s in modal.sectorBar" :key="s.label" class="axm__bar-seg" :style="{ width: `${s.pct}%`, background: s.color }" />
            </div>
            <div class="axm__legend">
              <span v-for="s in modal.sectorBar" :key="s.label" class="axm__legend-item">
                <span class="axm__legend-dot" :style="{ background: s.color }" />{{ s.label }} <b>{{ s.pctLabel }}</b>
              </span>
            </div>
          </template>
          <div v-if="modal.topAssets.length" class="axm__rows">
            <div v-for="a in modal.topAssets" :key="a.rank" class="axm__row">
              <span class="axm__row-rank">{{ a.rank }}</span>
              <span class="axm__row-name">
                <b v-if="a.ticker">{{ a.ticker }}</b>
                <span class="axm__row-sub">{{ a.name }}</span>
                <span v-for="v in a.via" :key="v" class="axm__via">via {{ v }}</span>
              </span>
              <span class="axm__row-bar"><span class="axm__row-fill axm__row-fill--exp" :style="{ width: `${(a.pct / maxAssetPct) * 100}%` }" /></span>
              <span class="axm__row-pct">{{ a.pctLabel }}</span>
            </div>
          </div>
        </div>

        <div v-if="corrRows.length || matrix" class="axm__block">
          <div class="axm__corr-head">
            <div class="axm__lbl">Com o que ele se move</div>
            <div class="axm__toggle">
              <button type="button" class="axm__toggle-btn" :class="{ 'axm__toggle-btn--on': period === '12m' }" @click="period = '12m'">12 meses</button>
              <button type="button" class="axm__toggle-btn" :class="{ 'axm__toggle-btn--on': period === '90d' }" @click="period = '90d'">90 dias</button>
            </div>
          </div>
          <div v-if="corrRows.length" class="axm__corr">
            <div v-for="r in corrRows" :key="r.symbol" class="axm__corr-row">
              <span class="axm__corr-sym">{{ r.symbol }}</span>
              <span class="axm__corr-track">
                <span class="axm__corr-mid" />
                <span class="axm__corr-fill" :class="{ 'axm__corr-fill--neg': r.neg }" :style="r.neg ? { right: '50%', width: `${r.magPct / 2}%` } : { left: '50%', width: `${r.magPct / 2}%` }" />
              </span>
              <span class="axm__corr-val" :class="{ 'axm__corr-val--neg': r.neg }">{{ r.corrLabel }}</span>
              <NuTagPill :tag="r.tag" />
            </div>
          </div>
          <div v-if="matrix" class="axm__matrix-scroll">
            <table class="axm__matrix">
              <thead>
                <tr>
                  <th />
                  <th v-for="s in matrix.symbols" :key="s">{{ s }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in matrix.matrix" :key="matrix.symbols[i]">
                  <th>{{ matrix.symbols[i] }}</th>
                  <td v-for="(v, j) in row" :key="j" :style="cellStyle(v)">{{ v == null ? '—' : nfCell.format(v) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="modal.holdings.length" class="axm__block">
          <div class="axm__lbl">Todas as {{ modal.holdings.length }} posições</div>
          <div class="axm__rows">
            <component
              :is="h.ticker ? 'a' : 'div'"
              v-for="h in modal.holdings"
              :key="h.rank"
              v-bind="h.ticker ? { href: `/asset/${h.ticker}` } : {}"
              class="axm__row"
              :class="{ 'axm__row--link': h.ticker }"
            >
              <span class="axm__row-rank">{{ h.rank }}</span>
              <span class="axm__row-name">
                <b v-if="h.ticker">{{ h.ticker }}</b>
                <span class="axm__row-sub">{{ h.ticker && h.name === h.ticker ? h.typeLabel : h.name }}</span>
              </span>
              <span class="axm__row-type">{{ h.typeLabel }}</span>
              <span class="axm__row-bar"><span class="axm__row-fill" :style="{ width: `${(h.pct / maxHoldingPct) * 100}%` }" /></span>
              <span class="axm__row-pct">{{ h.pctLabel }}</span>
            </component>
          </div>
        </div>

        <div v-if="modal.fundInfoRows.length" class="axm__block">
          <div class="axm__lbl">Ficha do fundo</div>
          <NuStatList :rows="modal.fundInfoRows" />
        </div>

        <div class="axm__foot">
          <button type="button" class="axm__done" @click="emit('close')">Fechar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.axm {
  position: fixed; inset: 0; z-index: 9999;
  background: var(--nu-day-backdrop);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 32px;
  animation: axmfade .18s ease;
}
.axm__card {
  width: min(760px, 94vw); max-height: 88vh; overflow: auto;
  background: var(--nu-day-card); border-radius: var(--nu-r-card-lg);
  padding: 40px 42px 38px; box-shadow: var(--nu-shadow-day-modal);
  animation: axmrise .24s cubic-bezier(.2, .8, .2, 1);
}
.axm__card:focus { outline: none; }
.axm__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
.axm__eyebrow { color: var(--nu-blue); font-size: 12px; font-weight: 800; letter-spacing: 1.6px; text-transform: uppercase; }
.axm__title { margin: 9px 0 0; color: var(--nu-ink); font-size: 28px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; }
.axm__date { margin-top: 7px; color: var(--nu-gray); font-size: 14px; font-weight: 700; }
.axm__close {
  flex: 0 0 auto; width: 40px; height: 40px; border-radius: 50%; border: none;
  background: var(--nu-day-close); color: var(--nu-ink); font-size: 16px; font-weight: 800;
  cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .2s;
}
.axm__close:hover { background: var(--nu-day-close-hover); }
.axm__divider { height: 1px; background: var(--nu-day-divider); margin: 24px 0; }

.axm__warnings { margin-top: 20px; display: flex; flex-direction: column; gap: 8px; }
.axm__warning {
  background: var(--nu-amber-bg); color: var(--nu-amber-text);
  font-size: 13.5px; font-weight: 700; line-height: 1.5; padding: 11px 16px; border-radius: 14px;
}

.axm__block { margin-top: 26px; }
.axm__lbl { color: var(--nu-gray); font-size: 12px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; }

.axm__bar { display: flex; height: 12px; border-radius: var(--nu-r-pill); overflow: hidden; gap: 3px; margin-top: 14px; }
.axm__bar-seg { height: 100%; }
.axm__legend { display: flex; flex-wrap: wrap; gap: 6px 18px; margin-top: 12px; }
.axm__legend-item { display: inline-flex; align-items: center; gap: 7px; color: var(--nu-gray-2); font-size: 13px; font-weight: 600; }
.axm__legend-item b { color: var(--nu-ink); font-weight: 800; font-variant-numeric: tabular-nums; }
.axm__legend-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }

.axm__rows { margin-top: 10px; }
.axm__row { display: flex; align-items: center; gap: 12px; padding: 9px 0; border-top: 1px solid var(--nu-day-divider); text-decoration: none; }
.axm__row--link:hover .axm__row-name b { color: var(--nu-blue); }
.axm__row-rank { color: var(--nu-gray); font-size: 12.5px; font-weight: 800; width: 24px; flex-shrink: 0; font-variant-numeric: tabular-nums; }
.axm__row-name { flex: 1.3; min-width: 0; display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.axm__row-name b { color: var(--nu-ink); font-size: 14.5px; font-weight: 800; transition: color .15s; }
.axm__row-sub { color: var(--nu-gray); font-size: 12.5px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
.axm__via {
  background: var(--nu-sand-2); color: var(--nu-gray-tag); font-size: 11px; font-weight: 800;
  padding: 2px 8px; border-radius: var(--nu-r-pill); white-space: nowrap;
}
.axm__row-type { color: var(--nu-gray); font-size: 12px; font-weight: 700; width: 104px; flex-shrink: 0; }
.axm__row-bar { flex: 1; height: 5px; background: var(--nu-sand-2); border-radius: var(--nu-r-pill); overflow: hidden; min-width: 56px; }
.axm__row-fill { display: block; height: 100%; background: var(--nu-blue); border-radius: var(--nu-r-pill); }
.axm__row-fill--exp { background: var(--nu-alloc-fixed); }
.axm__row-pct { color: var(--nu-ink); font-size: 13.5px; font-weight: 800; min-width: 58px; text-align: right; font-variant-numeric: tabular-nums; }

.axm__corr-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.axm__toggle { display: inline-flex; background: var(--nu-cream); border-radius: var(--nu-r-pill); padding: 3px; }
.axm__toggle-btn {
  border: none; font-family: inherit; background: transparent; color: var(--nu-gray);
  font-size: 12.5px; font-weight: 800; padding: 7px 14px; border-radius: var(--nu-r-pill); cursor: pointer;
}
.axm__toggle-btn--on { background: var(--nu-ink); color: var(--nu-white); }

.axm__corr { margin-top: 12px; }
.axm__corr-row { display: flex; align-items: center; gap: 13px; padding: 9px 0; border-top: 1px solid var(--nu-day-divider); }
.axm__corr-sym { color: var(--nu-ink); font-size: 13.5px; font-weight: 800; width: 68px; flex-shrink: 0; }
.axm__corr-track { position: relative; flex: 1; height: 8px; background: var(--nu-sand-2); border-radius: var(--nu-r-pill); }
.axm__corr-mid { position: absolute; left: 50%; top: -3px; bottom: -3px; width: 2px; background: var(--nu-sand); border-radius: 1px; }
.axm__corr-fill { position: absolute; top: 0; bottom: 0; background: var(--nu-green); border-radius: var(--nu-r-pill); }
.axm__corr-fill--neg { background: var(--nu-red); }
.axm__corr-val { color: var(--nu-ink); font-size: 13px; font-weight: 800; width: 46px; text-align: right; font-variant-numeric: tabular-nums; }
.axm__corr-val--neg { color: var(--nu-red); }

.axm__matrix-scroll { overflow-x: auto; margin-top: 14px; }
.axm__matrix { border-collapse: separate; border-spacing: 3px; min-width: 560px; }
.axm__matrix th { color: var(--nu-gray); font-size: 11px; font-weight: 800; text-align: center; padding: 5px 6px; white-space: nowrap; }
.axm__matrix tbody th { text-align: right; }
.axm__matrix td {
  font-size: 11.5px; font-weight: 800; text-align: center; padding: 8px 6px;
  border-radius: 8px; font-variant-numeric: tabular-nums; min-width: 50px;
}

.axm__foot { display: flex; justify-content: flex-end; margin-top: 28px; }
.axm__done {
  background: var(--nu-ink); color: var(--nu-white); border: none; border-radius: var(--nu-r-pill);
  padding: 12px 22px; font-size: 14.5px; font-weight: 800; cursor: pointer; transition: background .2s;
}
.axm__done:hover { background: var(--nu-ink-hover); }

@keyframes axmfade { from { opacity: 0; } to { opacity: 1; } }
@keyframes axmrise { from { opacity: 0; transform: translateY(14px) scale(.98); } to { opacity: 1; transform: none; } }

@media (max-width: 760px) {
  .axm { padding: 16px; }
  .axm__card { padding: 28px 22px 26px; }
  .axm__row-type { display: none; }
}
</style>
