<script setup lang="ts">
// "O dia no mercado." (design Home Nu): briefing editorial do Atlas — byline,
// headline, stat-pills (só as com dado real), 2 parágrafos abertos +
// expansão, botão preto de toggle + outline 'Perguntar sobre o pregão'.
// O pai só renderiza a seção quando há briefing (VM null = seção some);
// briefing de outro dia chega com byline honesta ('O fechamento de DD/MM…').
// Parágrafos usam v-html: escapados no useHome (briefingHtml de utils/format).
import type { HomeBriefingVM } from '~/types/home'

const props = defineProps<{ briefing: HomeBriefingVM }>()
const expanded = ref(false)
const hasExtra = computed(() => props.briefing.extraParagraphs.length > 0)
</script>

<template>
  <section class="hbf">
    <div class="hbf__head">
      <div>
        <h2 class="hbf__title">O dia no mercado.</h2>
        <div class="hbf__sub">{{ briefing.byline }}</div>
      </div>
    </div>

    <div class="hbf__body">
      <div class="hbf__headline">{{ briefing.headline }}</div>

      <div v-if="briefing.pills.length" class="hbf__pills">
        <span v-for="p in briefing.pills" :key="p.label" class="hbf__pill">
          <span class="hbf__pill-label">{{ p.label }}</span>
          <span v-if="p.value" class="hbf__pill-value">{{ p.value }}</span>
          <span v-if="p.delta" class="hbf__pill-delta" :class="`hbf__pill-delta--${p.dir}`">{{ p.dir === 'down' ? '▼' : '▲' }} {{ p.delta }}</span>
        </span>
      </div>

      <div class="hbf__text">
        <!-- eslint-disable-next-line vue/no-v-html — conteúdo escapado no useHome -->
        <p v-for="(p, i) in briefing.paragraphs" :key="i" class="hbf__p" :class="{ 'hbf__p--lead': i === 0 }" v-html="p" />
        <template v-if="expanded">
          <!-- eslint-disable-next-line vue/no-v-html — conteúdo escapado no useHome -->
          <p v-for="(p, i) in briefing.extraParagraphs" :key="`x${i}`" class="hbf__p" v-html="p" />
        </template>

        <div class="hbf__actions">
          <button v-if="hasExtra" type="button" class="hbf__toggle" @click="expanded = !expanded">
            {{ expanded ? 'Recolher briefing' : 'Ler o briefing completo' }}
          </button>
          <NuxtLink to="/busca" class="hbf__ask">Perguntar sobre o pregão</NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hbf { background: var(--nu-white); padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.hbf__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; flex-wrap: wrap; }
.hbf__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(38px, 4.8vw, 62px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.hbf__sub { color: var(--nu-gray); font-size: 16px; font-weight: 600; margin-top: 14px; }
.hbf__body { margin-top: clamp(30px, 4vw, 48px); max-width: 1000px; }
.hbf__headline {
  color: var(--nu-ink); font-size: clamp(24px, 2.9vw, 40px); font-weight: 800;
  letter-spacing: -0.03em; line-height: 1.14; text-wrap: pretty;
}
.hbf__pills { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 26px; }
.hbf__pill {
  display: inline-flex; align-items: baseline; gap: 8px; background: var(--nu-cream);
  border-radius: var(--nu-r-pill); padding: 10px 16px;
}
.hbf__pill-label { color: var(--nu-gray); font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
.hbf__pill-value { color: var(--nu-ink); font-size: 13.5px; font-weight: 800; font-variant-numeric: tabular-nums; }
.hbf__pill-delta { font-size: 13px; font-weight: 800; font-variant-numeric: tabular-nums; }
.hbf__pill-delta--up { color: var(--nu-green-2); }
.hbf__pill-delta--down { color: var(--nu-red-2); }
.hbf__text { max-width: 840px; }
.hbf__p {
  margin: 18px 0 0; color: var(--nu-gray-3); font-size: clamp(15.5px, 1.45vw, 17.5px);
  font-weight: 500; line-height: 1.78; text-wrap: pretty;
}
.hbf__p--lead {
  margin: 28px 0 0; color: var(--nu-ink); font-size: clamp(16.5px, 1.55vw, 19px);
  font-weight: 600; line-height: 1.75;
}
.hbf__p :deep(strong) { color: var(--nu-ink); font-weight: 800; }
.hbf__actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 28px; }
.hbf__toggle {
  background: var(--nu-ink); color: var(--nu-cream-text); border: none;
  border-radius: var(--nu-r-pill); padding: 14px 26px; font-size: 14.5px; font-weight: 800;
  cursor: pointer; transition: background .2s;
}
.hbf__toggle:hover { background: var(--nu-ink-hover); }
.hbf__ask {
  display: inline-flex; align-items: center; background: transparent; color: var(--nu-ink);
  border: 1.5px solid var(--nu-ink-30); border-radius: var(--nu-r-pill); padding: 12.5px 24px;
  font-size: 14.5px; font-weight: 800; transition: border-color .2s, background .2s;
}
.hbf__ask:hover { border-color: var(--nu-ink); background: var(--nu-ink-04); color: var(--nu-ink); }
</style>
