<script setup lang="ts">
// Raio-X de ETF — layout "duas bandas finas" (Opção B, escolhida pelo dono em
// 19/08/2026 no canvas de variantes). Anatomia das outras seções da página:
// H2 2 linhas à esquerda + conteúdo à direita, uma banda por assunto:
//   Banda 1 (branca) "Dentro do ETF."     — barra por tipo + top-5 posições
//   Banda 2 (creme)  "O custo e o movimento." — cards de custo (com o número
//     sentível de "10 anos"), taxa-sobre-taxa quando existe, correlação 12m
// O detalhe completo (carteira inteira, exposição look-through com "via",
// matriz 90d/12m, ficha cadastral, avisos) abre no AcaoEtfXrayModal — mesma
// decisão do Diário da tese: a página é o gancho, o modal é a leitura.
// as_of da CVM sempre visível; carteira >3 meses ganha badge de staleness.
import type { AcaoEtfXrayVM } from '~/types/acao'

defineProps<{ ticker: string; xray: AcaoEtfXrayVM }>()

const open = ref(false)
</script>

<template>
  <div>
    <section class="axb axb--white">
      <div class="axb__cols">
        <div class="axb__left">
          <h2 class="axb__title">Dentro<br>do ETF.</h2>
          <div class="axb__sub">{{ xray.subLine }}</div>
          <div class="axb__badges">
            <NuBadge variant="black" size="card">{{ xray.asOfLabel }}</NuBadge>
            <NuBadge v-if="xray.stale" variant="neutral" size="card">Mais de 3 meses</NuBadge>
          </div>
        </div>

        <div class="axb__content">
          <div v-if="xray.compBar.length" class="axb__bar">
            <span v-for="s in xray.compBar" :key="s.label" class="axb__bar-seg" :style="{ width: `${s.pct}%`, background: s.color }" />
          </div>
          <div v-if="xray.compBar.length" class="axb__legend">
            <span v-for="s in xray.compBar" :key="s.label" class="axb__legend-item">
              <span class="axb__legend-dot" :style="{ background: s.color }" />{{ s.label }} <b>{{ s.pctLabel }}</b>
            </span>
          </div>

          <div class="axb__rows">
            <component
              :is="h.ticker ? 'a' : 'div'"
              v-for="h in xray.top"
              :key="h.rank"
              v-bind="h.ticker ? { href: `/asset/${h.ticker}` } : {}"
              class="axb__row"
              :class="{ 'axb__row--link': h.ticker }"
            >
              <span class="axb__row-rank">{{ h.rank }}</span>
              <span class="axb__row-name">
                <b v-if="h.ticker">{{ h.ticker }}</b>
                <span class="axb__row-sub">{{ h.name }}</span>
              </span>
              <span class="axb__row-bar"><span class="axb__row-fill" :style="{ width: `${(h.pct / Math.max(xray.top[0]?.pct ?? 1, 0.01)) * 100}%` }" /></span>
              <span class="axb__row-pct">{{ h.pctLabel }}</span>
              <span v-if="h.ticker" class="axb__go" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
              </span>
            </component>
          </div>

          <div class="axb__foot">
            <span v-if="xray.moreCount > 0" class="axb__more-label">+ {{ xray.moreCount }} posições menores</span>
            <button type="button" class="axb__link" @click="open = true">
              Ver a carteira completa
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section v-if="xray.feeCards.length || xray.pageCorr.length" class="axb axb--cream">
      <div class="axb__cols">
        <div class="axb__left">
          <h2 class="axb__title">O custo e<br>o movimento.</h2>
          <div class="axb__sub">A taxa que sai da cota todo dia, e o que o fundo realmente diversifica.</div>
        </div>

        <div class="axb__content">
          <div v-if="xray.feeCards.length" class="axb__cards">
            <div v-for="c in xray.feeCards" :key="c.label" class="axb__card">
              <div class="axb__card-label">{{ c.label }}</div>
              <div class="axb__card-value">{{ c.value }}</div>
              <NuTagPill v-if="c.tag" :tag="c.tag" block />
              <div v-if="c.label.startsWith('Em 10 anos')" class="axb__card-note">só de taxa, sem juros compostos</div>
            </div>
          </div>

          <template v-if="xray.feeNested.length">
            <div class="axb__lbl">Taxa sobre taxa: os fundos investidos</div>
            <NuStatList :rows="xray.feeNested" />
          </template>
          <p v-if="xray.feeNote" class="axb__note">{{ xray.feeNote }}</p>

          <template v-if="xray.pageCorr.length">
            <div class="axb__lbl">Correlação · 12 meses</div>
            <div class="axb__corr">
              <div v-for="r in xray.pageCorr" :key="r.symbol" class="axb__corr-row">
                <span class="axb__corr-sym">{{ r.symbol }}</span>
                <span class="axb__corr-track">
                  <span class="axb__corr-mid" />
                  <span class="axb__corr-fill" :class="{ 'axb__corr-fill--neg': r.neg }" :style="r.neg ? { right: '50%', width: `${r.magPct / 2}%` } : { left: '50%', width: `${r.magPct / 2}%` }" />
                </span>
                <span class="axb__corr-val" :class="{ 'axb__corr-val--neg': r.neg }">{{ r.corrLabel }}</span>
                <NuTagPill :tag="r.tag" />
              </div>
            </div>
            <button type="button" class="axb__link axb__link--sm" @click="open = true">
              Matriz completa e exposição por setor
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
            </button>
          </template>
        </div>
      </div>
    </section>

    <AcaoEtfXrayModal :open="open" :ticker="ticker" :as-of-label="xray.asOfLabel" :modal="xray.modal" @close="open = false" />
  </div>
</template>

<style scoped>
.axb { padding: clamp(56px, 7vw, 92px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.axb--white { background: var(--nu-white); }
.axb--cream { background: var(--nu-cream); }
.axb__cols { display: flex; gap: clamp(28px, 5vw, 76px); align-items: flex-start; flex-wrap: wrap; }
.axb__left { flex: 1 1 300px; min-width: min(280px, 100%); display: flex; flex-direction: column; gap: 20px; align-items: flex-start; }
.axb__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(38px, 4.8vw, 58px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.axb__sub { color: var(--nu-gray); font-size: 16.5px; font-weight: 600; line-height: 1.5; }
.axb__badges { display: flex; gap: 8px; flex-wrap: wrap; }
.axb__content { flex: 1.35 1 420px; min-width: min(340px, 100%); }

.axb__bar { display: flex; height: 12px; border-radius: var(--nu-r-pill); overflow: hidden; gap: 3px; }
.axb__bar-seg { height: 100%; }
.axb__legend { display: flex; flex-wrap: wrap; gap: 8px 20px; margin-top: 12px; }
.axb__legend-item { display: inline-flex; align-items: center; gap: 7px; color: var(--nu-gray-2); font-size: 13.5px; font-weight: 600; }
.axb__legend-item b { color: var(--nu-ink); font-weight: 800; font-variant-numeric: tabular-nums; }
.axb__legend-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }

.axb__rows { margin-top: 14px; }
.axb__row { display: flex; align-items: center; gap: 14px; padding: 11px 0; border-top: 1.5px solid var(--nu-cream-2); text-decoration: none; }
.axb__row--link:hover .axb__row-name b { color: var(--nu-blue); }
.axb__row-rank { color: var(--nu-gray); font-size: 13px; font-weight: 800; width: 22px; flex-shrink: 0; font-variant-numeric: tabular-nums; }
.axb__row-name { flex: 1.1; min-width: 0; display: flex; align-items: baseline; gap: 9px; }
.axb__row-name b { color: var(--nu-ink); font-size: 15.5px; font-weight: 800; transition: color .15s; }
.axb__row-sub { color: var(--nu-gray); font-size: 13.5px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.axb__row-bar { flex: 1; height: 6px; background: var(--nu-cream-2); border-radius: var(--nu-r-pill); overflow: hidden; min-width: 70px; }
.axb__row-fill { display: block; height: 100%; background: var(--nu-blue); border-radius: var(--nu-r-pill); }
.axb__row-pct { color: var(--nu-ink); font-size: 14.5px; font-weight: 800; min-width: 60px; text-align: right; font-variant-numeric: tabular-nums; }
/* botão azul da Redentia (mesmo dos movers da home): a linha leva pro ativo */
.axb__go {
  width: 30px; height: 30px; flex-shrink: 0; border-radius: 50%; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center; transition: background .16s;
}
.axb__row--link:hover .axb__go { background: var(--nu-blue-hover); }

.axb__foot { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 16px; flex-wrap: wrap; }
.axb__more-label { color: var(--nu-gray); font-size: 13.5px; font-weight: 600; }
.axb__link {
  display: inline-flex; align-items: center; gap: 8px; border: none; background: transparent;
  font-family: inherit; color: var(--nu-blue); font-size: 14px; font-weight: 800; cursor: pointer; padding: 0;
}
.axb__link:hover { color: var(--nu-blue-2, #1E4FD6); }
.axb__link--sm { margin-top: 16px; }

.axb__cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr)); gap: 14px; }
.axb__card { background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 22px; transition: transform .15s; }
.axb__card:hover { transform: translateY(-2px); }
.axb__card-label { color: var(--nu-gray); font-size: 13.5px; font-weight: 700; }
.axb__card-value { color: var(--nu-ink); font-size: clamp(24px, 2.1vw, 30px); font-weight: 800; letter-spacing: -1px; margin-top: 10px; font-variant-numeric: tabular-nums; }
.axb__card-note { color: var(--nu-gray); font-size: 12.5px; font-weight: 600; margin-top: 10px; }

.axb__lbl { color: var(--nu-gray); font-size: 12.5px; font-weight: 800; letter-spacing: 1.3px; text-transform: uppercase; margin-top: 26px; }
.axb__note { color: var(--nu-gray); font-size: 13.5px; font-weight: 600; line-height: 1.55; margin: 12px 0 0; max-width: 620px; }

.axb__corr { margin-top: 6px; }
.axb__corr-row { display: flex; align-items: center; gap: 15px; padding: 11px 0; border-top: 1.5px solid var(--nu-cream-line, #E7E0D2); }
.axb__corr-sym { color: var(--nu-ink); font-size: 14.5px; font-weight: 800; width: 74px; flex-shrink: 0; }
.axb__corr-track { position: relative; flex: 1; height: 9px; background: var(--nu-sand-2); border-radius: var(--nu-r-pill); }
.axb__corr-mid { position: absolute; left: 50%; top: -3px; bottom: -3px; width: 2px; background: var(--nu-sand); border-radius: 1px; }
.axb__corr-fill { position: absolute; top: 0; bottom: 0; background: var(--nu-green); border-radius: var(--nu-r-pill); }
.axb__corr-fill--neg { background: var(--nu-red); }
.axb__corr-val { color: var(--nu-ink); font-size: 14px; font-weight: 800; width: 48px; text-align: right; font-variant-numeric: tabular-nums; }
.axb__corr-val--neg { color: var(--nu-red); }

@media (max-width: 700px) {
  .axb__row-bar { min-width: 46px; }
}
</style>
