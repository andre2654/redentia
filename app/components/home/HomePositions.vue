<script setup lang="ts">
// "Suas posições." (design Home Nu): 2 colunas — esquerda com h2, resumo,
// barra de alocação empilhada por classe + legenda e 'Gerenciar carteira';
// direita com cards de posição (tile colorido, ticker, empresa · cotas,
// peso, valor, var% do dia, seta azul).
// ESTADOS: 'full' | 'empty' (card de conexão na linguagem do design — a
// seção nunca quebra) | parcial (sem /portfolio/today → var% do dia some).
// Respeita o modo "valores ocultos" (valores → 'R$ ••••').
import type { HomePositionsVM } from '~/types/home'

defineProps<{ positions: HomePositionsVM }>()
const { hidden } = useHiddenValues()

// Logos REAIS dos ativos (UX do dono 2026-07-11): mesma fonte que a tabela
// `tickers` do backend usa (icons.brapi.dev). Falhou/404 → volta pro tile de
// letra colorido (o design original) via mapa `failed`.
const failed = reactive<Record<string, boolean>>({})
const logoUrl = (t: string) => `https://icons.brapi.dev/icons/${encodeURIComponent(t.toUpperCase())}.svg`
</script>

<template>
  <section class="hps">
    <div class="hps__cols">
      <div class="hps__left">
        <h2 class="hps__title">Suas<br>posições.</h2>

        <template v-if="positions.state === 'full'">
          <div class="hps__summary">{{ positions.summary }}</div>
          <div v-if="positions.allocation.length" class="hps__aloc">
            <div class="hps__aloc-bar">
              <span
                v-for="a in positions.allocation" :key="a.name" class="hps__aloc-seg"
                :style="{ width: `${a.pctNum}%`, background: a.color }"
              />
            </div>
            <div class="hps__aloc-legend">
              <div v-for="a in positions.allocation" :key="a.name" class="hps__aloc-row">
                <span class="hps__aloc-dot" :style="{ background: a.color }" />
                <span class="hps__aloc-name">{{ a.name }}</span>
                <span class="hps__aloc-val">{{ hidden ? 'R$ ••••' : a.val }}</span>
                <span class="hps__aloc-pct">{{ a.pct }}</span>
              </div>
            </div>
          </div>
          <NuxtLink to="/carteira" class="hps__manage">Gerenciar carteira</NuxtLink>
        </template>

        <div v-else class="hps__summary">Nenhuma carteira conectada ainda.</div>
      </div>

      <div class="hps__right">
        <template v-if="positions.state === 'full'">
          <NuxtLink v-for="p in positions.rows" :key="p.ticker" :to="p.href" class="hps__card">
            <span
              class="hps__tile"
              :style="failed[p.ticker] ? { background: p.tileBg, color: p.tileFg } : undefined"
            >
              <img
                v-if="!failed[p.ticker]" :src="logoUrl(p.ticker)" :alt="p.ticker"
                class="hps__tile-img" loading="lazy" @error="failed[p.ticker] = true"
              >
              <template v-else>{{ p.letter }}</template>
            </span>
            <span class="hps__main">
              <span class="hps__ticker">{{ p.ticker }}</span>
              <span class="hps__sub">{{ p.sub }}</span>
            </span>
            <span v-if="p.peso" data-nu-hide class="hps__peso-col">
              <span class="hps__peso">{{ p.peso }} da carteira</span>
            </span>
            <span class="hps__nums">
              <span class="hps__valor">{{ hidden ? 'R$ ••••' : p.valor }}</span>
              <span v-if="p.pct" class="hps__pct" :class="`hps__pct--${p.dir}`">{{ p.pct }}</span>
            </span>
            <span class="hps__arrow">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </span>
          </NuxtLink>
        </template>

        <!-- vazio: card de conexão (empty-state elegante, nunca card quebrado) -->
        <div v-else class="hps__connect">
          <div class="hps__connect-title">Conecte sua corretora pelo Open Finance</div>
          <div class="hps__connect-desc">
            Suas ações, FIIs e Tesouro aparecem aqui automaticamente — leitura
            regulada pelo Banco Central, sem acesso a movimentações. Também dá
            pra importar o extrato da B3.
          </div>
          <NuxtLink to="/carteira" class="hps__connect-cta">Conectar carteira</NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hps { background: var(--nu-white); padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.hps__cols { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.hps__left { flex: 1 1 320px; min-width: min(300px, 100%); }
.hps__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(38px, 4.8vw, 62px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.hps__summary { color: var(--nu-gray); font-size: 17px; font-weight: 600; line-height: 1.5; margin-top: 22px; }
.hps__aloc { margin-top: 30px; }
.hps__aloc-bar { display: flex; height: 14px; border-radius: var(--nu-r-pill); overflow: hidden; gap: 3px; }
.hps__aloc-seg { height: 100%; }
.hps__aloc-legend { margin-top: 14px; }
.hps__aloc-row { display: flex; align-items: center; gap: 11px; padding: 10px 0; border-top: 1px solid var(--nu-cream-2); }
.hps__aloc-dot { width: 11px; height: 11px; border-radius: 4px; flex-shrink: 0; }
.hps__aloc-name { flex: 1; color: var(--nu-ink); font-size: 15px; font-weight: 700; }
.hps__aloc-val { color: var(--nu-gray); font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
.hps__aloc-pct { color: var(--nu-ink); font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; min-width: 44px; text-align: right; }
.hps__manage {
  display: inline-flex; align-items: center; gap: 10px; background: transparent; color: var(--nu-blue);
  border: 2px solid var(--nu-blue); border-radius: var(--nu-r-pill); padding: 14px 26px;
  font-size: 16px; font-weight: 700; margin-top: 30px; transition: background .2s;
}
.hps__manage:hover { background: var(--nu-blue-tint-2); color: var(--nu-blue); }
.hps__right { flex: 1.5 1 480px; min-width: min(340px, 100%); display: flex; flex-direction: column; gap: 14px; }
.hps__card {
  display: flex; align-items: center; gap: 18px; background: var(--nu-cream);
  border-radius: var(--nu-r-card); padding: 22px 24px; cursor: pointer;
  transition: background .2s, transform .15s;
}
.hps__card:hover { background: var(--nu-cream-4); transform: translateY(-2px); }
.hps__tile {
  width: 52px; height: 52px; flex-shrink: 0; border-radius: var(--nu-r-tile);
  display: flex; align-items: center; justify-content: center; font-size: 19px; font-weight: 800;
  overflow: hidden; background: var(--nu-cream);
}
.hps__tile-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.hps__main { flex: 1; min-width: 0; overflow: hidden; }
.hps__ticker { display: block; color: var(--nu-ink); font-size: 19px; font-weight: 800; white-space: nowrap; }
.hps__sub {
  display: block; color: var(--nu-gray); font-size: 14px; font-weight: 600; margin-top: 3px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.hps__peso-col { text-align: right; flex-shrink: 0; }
.hps__peso { display: block; color: var(--nu-gray); font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; }
.hps__nums { text-align: right; flex-shrink: 0; }
.hps__valor { display: block; color: var(--nu-ink); font-size: 18px; font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap; }
.hps__pct { display: block; font-size: 13.5px; font-weight: 800; margin-top: 3px; white-space: nowrap; font-variant-numeric: tabular-nums; }
.hps__pct--up { color: var(--nu-green-2); }
.hps__pct--down { color: var(--nu-red-2); }
.hps__arrow {
  width: 46px; height: 46px; flex-shrink: 0; border-radius: 50%; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center;
}
.hps__connect { background: var(--nu-cream); border-radius: var(--nu-r-card); padding: clamp(26px, 3vw, 36px); }
.hps__connect-title { color: var(--nu-ink); font-size: clamp(20px, 1.9vw, 24px); font-weight: 800; letter-spacing: -.3px; }
.hps__connect-desc { color: var(--nu-gray-2); font-size: 15.5px; font-weight: 500; line-height: 1.6; margin-top: 12px; max-width: 520px; }
.hps__connect-cta {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 14px 26px; font-size: 15.5px; font-weight: 800;
  margin-top: 22px; transition: background .2s;
}
.hps__connect-cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
</style>
