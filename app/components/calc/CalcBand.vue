<script setup lang="ts">
// PR10 — banda full-bleed com TÍTULO CENTRAL, anatomia (a) do design
// (Redentia Calculadoras Nu.dc.html, seção "Como funcionam os juros
// compostos"): fundo alterna creme/branco, h2 centrado clamp(32px,4vw,54px),
// conteúdo abaixo (card branco/creme, grid de tiles, tabela…) via slot.
// titleTag configurável pra preservar a hierarquia semântica do texto SEO
// antigo (um h3 do conteúdo pode ser título visual de banda sem virar h2).
defineProps<{
  tone?: 'cream' | 'white'
  title?: string
  titleTag?: 'h2' | 'h3'
  /** eyebrow curto acima do título (ex.: 'Transparência total' na
   *  metodologia do redentia-score — texto visível da página antiga). */
  kicker?: string
  /** banda-statement (só título, sem conteúdo): padding reduzido pra não
   *  virar um vão gigante — usada quando o h2 do SEO antigo era órfão */
  tight?: boolean
}>()
</script>

<template>
  <section class="cbd" :class="{ 'cbd--cream': tone === 'cream', 'cbd--tight': tight }">
    <p v-if="kicker" class="cbd__kicker">{{ kicker }}</p>
    <component :is="titleTag ?? 'h2'" v-if="title || $slots.title" class="cbd__title">
      <slot name="title">{{ title }}</slot>
    </component>
    <div v-if="$slots.dek" class="cbd__dek"><slot name="dek" /></div>
    <slot />
  </section>
</template>

<style scoped>
.cbd {
  background: var(--nu-white);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.cbd--cream { background: var(--nu-cream); }
.cbd--tight { padding-top: clamp(36px, 5vw, 60px); padding-bottom: clamp(36px, 5vw, 60px); }
.cbd__kicker {
  margin: 0 auto 14px; max-width: 980px; text-align: center;
  color: var(--nu-blue); font-size: 12px; font-weight: 800;
  text-transform: uppercase; letter-spacing: .14em;
}
.cbd__title {
  margin: 0 auto; max-width: 980px;
  color: var(--nu-ink); font-size: clamp(32px, 4vw, 54px); font-weight: 800;
  letter-spacing: -0.04em; line-height: 1.06; text-align: center;
}
.cbd__dek {
  margin: 18px auto 0; max-width: 680px; text-align: center;
  color: var(--nu-gray-2); font-size: 17px; font-weight: 500; line-height: 1.65;
}
.cbd__dek :deep(p) { margin: 0; }
</style>
