<script setup lang="ts">
// "Outras empresas do setor energia." (20/10/2026): as maiores ações do mesmo
// setor por valor de mercado e o link pro /setor/{slug}. Fecha a página antes
// do rodapé, em creme (a banda de notícias acima é branca). Quem entra e por
// quê está em app/utils/paresDoSetor.ts; o bloco só existe com 3 pares ou mais.
import type { AcaoParesVM } from '~/types/acao'

// `tone="white"`: quando a cadeia de fornecimento (AcaoCadeia, creme) vem logo
// acima, a banda vira branca e o cartão creme — duas bandas creme seguidas
// virariam uma só, com o dobro do respiro no meio.
const props = withDefaults(defineProps<{ pares: AcaoParesVM; tone?: 'cream' | 'white' }>(), { tone: 'cream' })
const setor = computed(() => props.pares.setor.nome.toLowerCase())
</script>

<template>
  <section class="apr" :class="{ 'apr--white': tone === 'white' }">
    <h2 class="apr__title">Outras empresas do setor {{ setor }}.</h2>
    <ul class="apr__grid">
      <li v-for="p in pares.itens" :key="p.ticker">
        <NuxtLink :to="`/asset/${p.ticker}`" class="apr__card">
          <NuAssetLogo :ticker="p.ticker" :letter="p.ticker.charAt(0)" tile-bg="var(--nu-tile-blue-bg)" tile-fg="var(--nu-blue-deep)" :size="40" :radius="12" />
          <span class="apr__id">
            <span class="apr__ticker">{{ p.ticker }}</span>
            <span class="apr__nome">{{ p.nome }}</span>
          </span>
        </NuxtLink>
      </li>
    </ul>
    <NuxtLink :to="pares.setor.href" class="apr__all">
      <span class="apr__all-circle">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
      </span>
      <span class="apr__all-label">Ver o setor {{ setor }} completo</span>
    </NuxtLink>
  </section>
</template>

<style scoped>
.apr {
  background: var(--nu-cream);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.apr__title {
  margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.06;
}
/* 3 colunas: os 6 pares fecham em 3 + 3 */
.apr__grid {
  list-style: none; margin: 36px 0 0; padding: 0;
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px;
}
@media (max-width: 960px) { .apr__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.apr__card {
  display: flex; align-items: center; gap: 14px;
  background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 18px 20px;
  transition: transform .18s, box-shadow .2s;
}
.apr__card:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.apr--white { background: var(--nu-white); }
.apr--white .apr__card { background: var(--nu-cream); }
.apr__id { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.apr__ticker { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -.2px; }
.apr__nome {
  color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.apr__all { display: inline-flex; align-items: center; gap: 14px; margin-top: 36px; transition: gap .2s; }
.apr__all:hover { gap: 19px; }
.apr__all-circle {
  width: 52px; height: 52px; border-radius: 50%; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.apr__all-label { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; }
@media (max-width: 560px) {
  .apr__grid { grid-template-columns: 1fr; gap: 10px; margin-top: 28px; }
  .apr__card { padding: 14px 16px; }
}
</style>
