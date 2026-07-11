<script setup lang="ts">
// "A leitura do dia": briefing editorial diário do Atlas — manchete, stat
// pills, 2 parágrafos abertos + bloco expansível (parágrafos extras e card
// takeaway navy) e CTAs. Valores exatos do design; dados de useNuBriefing
// (seed rico do mock → hidrata GET /briefing/today; pills viram dados reais).
// Parágrafos usam v-html: o seed traz os links inline do design e a hidratação
// escapa o texto da API (esc() no composable) antes de virar HTML.
const { briefing } = useNuBriefing()
const expanded = ref(false)

const hasExtra = computed(() => briefing.value.extraParagraphs.length > 0 || briefing.value.takeaway !== null)
</script>

<template>
  <section class="mbf">
    <div class="mbf__head">
      <div>
        <h2 class="mbf__title">A leitura do dia.</h2>
        <div class="mbf__sub">{{ briefing.metaLine }}</div>
      </div>
    </div>

    <div class="mbf__body">
      <div class="mbf__headline">{{ briefing.headline }}</div>
      <div v-if="briefing.dek" class="mbf__dek">{{ briefing.dek }}</div>

      <div v-if="briefing.pills.length" class="mbf__pills">
        <span v-for="p in briefing.pills" :key="p.label" class="mbf__pill">
          <span class="mbf__pill-label">{{ p.label }}</span>
          <span v-if="p.value" class="mbf__pill-value">{{ p.value }}</span>
          <span v-if="p.delta" class="mbf__pill-delta" :class="`mbf__pill-delta--${p.dir}`">{{ p.dir === 'down' ? '▼' : '▲' }} {{ p.delta }}</span>
        </span>
      </div>

      <div class="mbf__text">
        <!-- eslint-disable-next-line vue/no-v-html — conteúdo escapado no composable -->
        <p v-for="(p, i) in briefing.paragraphs" :key="i" class="mbf__p" :class="{ 'mbf__p--lead': i === 0 }" v-html="p" />
        <template v-if="expanded">
          <!-- eslint-disable-next-line vue/no-v-html — conteúdo escapado no composable -->
          <p v-for="(p, i) in briefing.extraParagraphs" :key="`x${i}`" class="mbf__p" v-html="p" />
          <div v-if="briefing.takeaway" class="mbf__takeaway">
            <div class="mbf__takeaway-kicker">{{ briefing.takeaway.kicker }}</div>
            <!-- eslint-disable-next-line vue/no-v-html — conteúdo escapado no composable -->
            <p class="mbf__takeaway-p" v-html="briefing.takeaway.html" />
          </div>
        </template>

        <div class="mbf__actions">
          <button v-if="hasExtra" type="button" class="mbf__toggle" @click="expanded = !expanded">
            {{ expanded ? 'Recolher briefing' : 'Ler o briefing completo' }}
          </button>
          <NuxtLink to="/login" class="mbf__cta">Receber o briefing diário — grátis</NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mbf { background: var(--nu-cream); padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.mbf__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; flex-wrap: wrap; }
.mbf__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(38px, 4.8vw, 62px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.mbf__sub { color: var(--nu-gray); font-size: 16px; font-weight: 600; margin-top: 14px; }
.mbf__body { margin-top: clamp(30px, 4vw, 48px); max-width: 1000px; }
.mbf__headline {
  color: var(--nu-ink); font-size: clamp(24px, 2.9vw, 40px); font-weight: 800;
  letter-spacing: -0.03em; line-height: 1.14; text-wrap: pretty;
}
.mbf__dek {
  color: var(--nu-gray-2); font-size: clamp(16.5px, 1.6vw, 19px); font-weight: 600;
  line-height: 1.55; margin-top: 12px; max-width: 760px;
}
.mbf__pills { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 26px; }
.mbf__pill {
  display: inline-flex; align-items: baseline; gap: 8px; background: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 10px 16px;
}
.mbf__pill-label { color: var(--nu-gray); font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
.mbf__pill-value { color: var(--nu-ink); font-size: 13.5px; font-weight: 800; font-variant-numeric: tabular-nums; }
.mbf__pill-delta { font-size: 13px; font-weight: 800; font-variant-numeric: tabular-nums; }
.mbf__pill-delta--up { color: var(--nu-green-2); }
.mbf__pill-delta--down { color: var(--nu-red-2); }
.mbf__text { max-width: 840px; }
.mbf__p {
  margin: 18px 0 0; color: var(--nu-gray-3); font-size: clamp(15.5px, 1.45vw, 17.5px);
  font-weight: 500; line-height: 1.78; text-wrap: pretty;
}
.mbf__p--lead {
  margin: 28px 0 0; color: var(--nu-ink); font-size: clamp(16.5px, 1.55vw, 19px);
  font-weight: 600; line-height: 1.75;
}
.mbf__p :deep(a) { color: var(--nu-blue-deep); font-weight: 800; text-decoration: none; border-bottom: 2px solid var(--nu-blue-30); }
.mbf__p :deep(strong) { color: var(--nu-ink); font-weight: 800; }
.mbf__takeaway { background: var(--nu-navy); border-radius: var(--nu-r-card); padding: clamp(22px, 2.6vw, 30px); margin-top: 26px; }
.mbf__takeaway-kicker { color: var(--nu-blue-soft); font-size: 12px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; }
.mbf__takeaway-p {
  margin: 12px 0 0; color: var(--nu-cream-text-92); font-size: clamp(15.5px, 1.5vw, 17.5px);
  font-weight: 500; line-height: 1.75; text-wrap: pretty;
}
.mbf__takeaway-p :deep(a) { color: var(--nu-blue-soft); font-weight: 800; text-decoration: none; border-bottom: 2px solid var(--nu-blue-soft-35); }
.mbf__actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 28px; }
.mbf__toggle {
  background: transparent; color: var(--nu-ink); border: 1.5px solid var(--nu-ink-30);
  border-radius: var(--nu-r-pill); padding: 12.5px 24px; font-size: 14.5px; font-weight: 800;
  cursor: pointer; transition: border-color .2s, background .2s;
}
.mbf__toggle:hover { border-color: var(--nu-ink); background: var(--nu-ink-04); }
.mbf__cta {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 14px 26px; font-size: 14.5px; font-weight: 800; transition: background .2s;
}
.mbf__cta:hover { background: var(--nu-blue-hover-3); color: var(--nu-white); }
</style>
