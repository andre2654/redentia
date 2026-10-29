<script setup lang="ts">
// O número da conta, no slot "resultado" do CalcConta (21/10/2026): a legenda
// ("Aos 60 anos, você terá"), o número grande, o selo e a linha que explica.
// Era o mesmo CSS repetido em cada calculadora na frase.
withDefaults(defineProps<{
  legenda: string
  valor: string
  /** colado no número, menor ("/mês") */
  unidade?: string
  selo?: string
  /** azul: um fato da conta; ok: chega lá; falta: não chega */
  tom?: 'azul' | 'ok' | 'falta'
  explica?: string
}>(), { tom: 'azul' })
</script>

<template>
  <div class="cnu">
    <p class="cnu__legenda">{{ legenda }}</p>
    <p class="cnu__valor">{{ valor }}<span v-if="unidade" class="cnu__unidade">{{ unidade }}</span></p>
    <span v-if="selo" class="cnu__selo" :class="`cnu__selo--${tom}`">{{ selo }}</span>
    <p v-if="explica" class="cnu__explica">{{ explica }}</p>
    <slot />
  </div>
</template>

<style scoped>
.cnu__legenda { margin: 0; color: var(--nu-gray-2); font-size: var(--nu-fs-lg); font-weight: 500; }
.cnu__valor {
  margin: 4px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800;
  letter-spacing: -0.05em; line-height: 1; font-variant-numeric: tabular-nums;
}
.cnu__unidade { margin-left: 4px; color: var(--nu-gray-2); font-size: var(--nu-fs-h3); font-weight: 700; letter-spacing: -0.02em; }
.cnu__selo {
  display: inline-flex; margin-top: 16px; padding: 7px 14px; border-radius: var(--nu-r-pill);
  font-size: var(--nu-fs-sm); font-weight: 700;
}
.cnu__selo--azul { background: var(--nu-blue-tint); color: var(--nu-blue-text); }
.cnu__selo--ok { background: color-mix(in srgb, var(--nu-green) 12%, var(--nu-white)); color: var(--nu-green-text); }
.cnu__selo--falta { background: color-mix(in srgb, var(--nu-red) 10%, var(--nu-white)); color: var(--nu-red-text); }
.cnu__explica { margin: 14px 0 0; max-width: 470px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; }
</style>
