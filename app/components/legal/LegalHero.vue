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
      <NuEyebrow como="div">{{ eyebrow }}</NuEyebrow>
      <h1 class="lgh__title">{{ title }}</h1>
      <div v-if="updatedText" class="lgh__updated">Atualizado em {{ updatedText }}</div>
    </div>
  </div>
</template>

<style scoped>
/* Na Aportou (11/11/2026) o herói senta no creme da página, como o NuPageHero:
   eyebrow com o corte, H1 em 800 com a entrelinha apertada e um fio de 1,5px
   separando do documento.
   Robustez (11/11/2026): a coluna do site (--nu-coluna), a entrada em token
   (520ms na curva de saída) e a data como legenda (500, cinza, tabular). */
.lgh {
  background: var(--nu-page);
  padding: clamp(48px, 6.5vw, 88px) var(--nu-coluna) clamp(32px, 4vw, 48px);
  border-bottom: 1px solid var(--nu-line-2);
  animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) both;
}
.lgh__inner { max-width: 920px; }
.lgh__title {
  margin: 18px 0 0; color: var(--nu-ink);
  font-size: clamp(40px, 5.5vw, 76px); font-weight: var(--nu-w-display);
  letter-spacing: var(--nu-ls-display); line-height: .98; text-wrap: balance;
}
.lgh__updated {
  margin-top: 20px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto);
  font-variant-numeric: tabular-nums;
}
@media (prefers-reduced-motion: reduce) { .lgh { animation: none; } }
</style>
