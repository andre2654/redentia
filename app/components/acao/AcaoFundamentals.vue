<script setup lang="ts">
// Seção "Os números da empresa" (design Acoes Nu): 2 colunas — esquerda com
// H2 + subtítulo + perfil qualitativo (5 dimensões com NuTagPill), direita com
// grid auto-fit de NuMetricCard intercalado com NuAiInsightCard (posições 4 e
// 9, como o splice do design). Seção some sem fundamentos.
import type { AcaoFundCard, AcaoPerfilRow } from '~/types/acao'

defineProps<{
  heading: [string, string]
  perfil: AcaoPerfilRow[]
  fcards: AcaoFundCard[]
}>()
</script>

<template>
  <section v-if="fcards.length" class="afd">
    <div class="afd__cols">
      <div class="afd__left">
        <h2 class="afd__title">{{ heading[0] }}<br>{{ heading[1] }}</h2>
        <div class="afd__sub">Últimos 12 meses · dados da B3 e balanços</div>
        <div v-if="perfil.length" class="afd__perfil">
          <div v-for="p in perfil" :key="p.name" class="afd__dim">
            <span class="afd__dim-name">{{ p.name }}</span>
            <NuTagPill :tag="p.tag" />
          </div>
        </div>
      </div>
      <div class="afd__grid">
        <template v-for="(c, i) in fcards" :key="i">
          <NuAiInsightCard v-if="c.kind === 'insight'" :card="c" />
          <NuMetricCard v-else :card="c" />
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.afd {
  background: var(--nu-white);
  padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.afd__cols { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.afd__left { flex: 1 1 300px; min-width: min(280px, 100%); }
.afd__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(38px, 4.8vw, 62px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.afd__sub { color: var(--nu-gray); font-size: 17px; font-weight: 600; line-height: 1.5; margin-top: 22px; }
.afd__perfil { margin-top: 26px; }
.afd__dim {
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
  padding: 13px 0; border-top: 1px solid var(--nu-cream-2);
}
.afd__dim-name { color: var(--nu-ink); font-size: 16px; font-weight: 700; }
.afd__grid {
  flex: 1.6 1 480px; min-width: min(340px, 100%);
  display: grid; grid-template-columns: repeat(auto-fit, minmax(215px, 1fr)); gap: 14px;
}
</style>
