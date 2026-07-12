<script setup lang="ts">
// Hero das páginas legais/institucionais — banda creme, eyebrow azul, H1
// gigante (escala Nu, par do NuPageHero) e, quando a página tem data, uma
// linha "Atualizado em <data>". Anatomia compartilhada; as 6 páginas legais +
// metodologia usam o mesmo hero. Header/ticker vêm do layout default.
const props = defineProps<{
  eyebrow: string
  title: string
  /** ISO 'YYYY-MM-DD' (formata pra pt-BR) ou texto já pronto. Opcional. */
  updated?: string
}>()

// 'YYYY-MM-DD' → '5 de maio de 2026'. Qualquer outra string passa direto.
const updatedText = computed(() => {
  const v = props.updated
  if (!v) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v)
  if (!m) return v
  const [, y, mo, d] = m
  return `${Number(d)} de ${MONTH_LONG_PT[Number(mo) - 1]} de ${y}`
})
</script>

<template>
  <div class="lgh">
    <div class="lgh__inner">
      <div class="lgh__eyebrow">{{ eyebrow }}</div>
      <h1 class="lgh__title">{{ title }}</h1>
      <div v-if="updatedText" class="lgh__updated">Atualizado em {{ updatedText }}</div>
    </div>
  </div>
</template>

<style scoped>
.lgh {
  background: var(--nu-cream);
  padding: clamp(48px, 6.5vw, 88px) clamp(22px, 5.5vw, 80px) clamp(36px, 4.5vw, 56px);
  animation: nu-fade .5s ease both;
}
.lgh__inner { max-width: 920px; }
.lgh__eyebrow {
  color: var(--nu-blue); font-size: clamp(16px, 1.5vw, 19px); font-weight: 800;
  letter-spacing: -.2px;
}
.lgh__title {
  margin: 12px 0 0; color: var(--nu-ink);
  font-size: clamp(38px, 5.2vw, 68px); font-weight: 800;
  letter-spacing: -0.045em; line-height: 1.02;
}
.lgh__updated {
  margin-top: 20px; color: var(--nu-gray); font-size: 14.5px; font-weight: 600;
  font-variant-numeric: tabular-nums;
}
</style>
