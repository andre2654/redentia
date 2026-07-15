<script setup lang="ts">
// "Tesouro Direto": 1 card destaque azul (maior taxa do dia) + 3 cards de
// grupo (IPCA+/SELIC/Prefixado, 5 títulos cada). Valores exatos do design;
// dados de useNuTesouro (seed → GET /tesouro?indexer=).
const { highlight, groups, loading } = useNuTesouro()
</script>

<template>
  <section class="mts">
    <div class="mts__head">
      <NuSectionHeading eyebrow="Renda fixa pública">Tesouro Direto.</NuSectionHeading>
      <NuxtLink to="/ranking/tesouro-direto" class="mts__all">
        <span class="mts__all-label">Ver todos</span>
        <span class="mts__all-circle">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </span>
      </NuxtLink>
    </div>

    <div class="mts__grid">
      <div class="mts__hi">
        <span class="mts__hi-kicker">Maior taxa hoje</span>
        <template v-if="loading">
          <NuSkeleton tone="cream" variant="line" width="128px" height="22px" style="margin-top: 22px" />
          <NuSkeleton tone="cream" variant="line" width="88px" height="14px" style="margin-top: 8px" />
          <NuSkeleton tone="cream" variant="line" width="152px" height="38px" style="margin-top: 22px" />
          <div class="mts__hi-unit">ao ano</div>
          <NuSkeleton tone="cream" variant="line" width="158px" height="13px" style="margin-top: auto" />
        </template>
        <template v-else>
          <div class="mts__hi-name">{{ highlight.name }}</div>
          <div class="mts__hi-venc">{{ highlight.venc }}</div>
          <div class="mts__hi-rate">{{ highlight.rate }}</div>
          <div class="mts__hi-unit">ao ano</div>
          <div class="mts__hi-updated">{{ highlight.updated }}</div>
        </template>
      </div>

      <div v-for="i in (loading ? 3 : 0)" :key="`skg${i}`" class="mts__group">
        <div class="mts__group-head">
          <NuSkeleton variant="line" width="82px" height="19px" />
          <NuSkeleton variant="line" width="66px" height="24px" radius="pill" />
        </div>
        <div class="mts__rows">
          <div v-for="n in 5" :key="n" class="mts__row">
            <span class="mts__row-id">
              <NuSkeleton variant="line" width="92px" height="14px" />
              <NuSkeleton variant="line" width="62px" height="12px" style="margin-top: 3px" />
            </span>
            <NuSkeleton variant="line" width="74px" height="14px" radius="chip" />
          </div>
        </div>
      </div>
      <div v-for="g in (loading ? [] : groups)" :key="g.name" class="mts__group">
        <div class="mts__group-head">
          <span class="mts__group-name">{{ g.name }}</span>
          <span class="mts__group-count">{{ g.count }}</span>
        </div>
        <div class="mts__rows">
          <div v-for="r in g.rows" :key="r.name" class="mts__row">
            <span class="mts__row-id">
              <span class="mts__row-name">{{ r.name }}</span>
              <span class="mts__row-venc">{{ r.venc }}</span>
            </span>
            <span class="mts__row-rate">{{ r.rate }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mts { background: var(--nu-cream); padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.mts__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; flex-wrap: wrap; }
.mts__all { display: inline-flex; align-items: center; gap: 12px; flex-shrink: 0; transition: gap .2s; }
.mts__all:hover { gap: 16px; }
.mts__all-label { color: var(--nu-ink); font-size: 16px; font-weight: 800; }
.mts__all-circle {
  width: 44px; height: 44px; border-radius: 50%; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center;
}
.mts__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(265px, 1fr)); gap: 16px; margin-top: 40px; }
.mts__hi { background: var(--nu-blue); border-radius: var(--nu-r-card-lg); padding: 28px; display: flex; flex-direction: column; }
.mts__hi-kicker { color: var(--nu-white-75); font-size: 11.5px; font-weight: 800; letter-spacing: 1.3px; text-transform: uppercase; }
.mts__hi-name { color: var(--nu-white); font-size: 22px; font-weight: 800; letter-spacing: -.3px; margin-top: 22px; }
.mts__hi-venc { color: var(--nu-white-65); font-size: 14px; font-weight: 600; margin-top: 4px; }
.mts__hi-rate {
  color: var(--nu-white); font-size: clamp(30px, 2.6vw, 40px); font-weight: 800;
  letter-spacing: -1px; line-height: 1; margin-top: 22px; font-variant-numeric: tabular-nums;
}
.mts__hi-unit { color: var(--nu-white-65); font-size: 14.5px; font-weight: 600; margin-top: 6px; }
.mts__hi-updated { color: var(--nu-white-60); font-size: 13px; font-weight: 600; margin-top: auto; padding-top: 22px; }
.mts__group { background: var(--nu-white); border-radius: var(--nu-r-card-lg); padding: 26px; }
.mts__group-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.mts__group-name { color: var(--nu-ink); font-size: 19px; font-weight: 800; letter-spacing: -.2px; }
.mts__group-count {
  display: inline-flex; align-items: center; background: var(--nu-cream); color: var(--nu-gray);
  font-size: 12px; font-weight: 800; padding: 5px 12px; border-radius: var(--nu-r-pill); white-space: nowrap;
}
.mts__rows { margin-top: 10px; }
.mts__row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid var(--nu-cream-2); }
.mts__row-id { flex: 1; min-width: 0; overflow: hidden; }
.mts__row-name {
  display: block; color: var(--nu-ink); font-size: 14.5px; font-weight: 800;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.mts__row-venc { display: block; color: var(--nu-gray); font-size: 12px; font-weight: 600; margin-top: 1px; }
.mts__row-rate {
  color: var(--nu-ink); font-size: 14.5px; font-weight: 800; white-space: nowrap;
  font-variant-numeric: tabular-nums; flex-shrink: 0;
}
</style>
