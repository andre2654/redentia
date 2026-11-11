<script setup lang="ts">
// O número da conta, no slot "resultado" do CalcConta (21/10/2026): a legenda
// ("Aos 60 anos, você terá"), o número grande, o selo e a linha que explica.
// Era o mesmo CSS repetido em cada calculadora na frase.
// Aportou (11/11/2026): o número em 800 troca com um fade curto quando a
// conta muda (o :key remonta só o texto do número); o selo é o selo dos
// quadros (raio 8, fundo claro com a letra da mesma família).
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
  <div v-contexto-chat="{ id: `conta:${legenda}`, tipo: 'grafico', rotulo: rotuloCurto(legenda.replace(/[,:]\s*$/, ''), 30), texto: [`${legenda} ${valor}${unidade ?? ''}`, selo, explica].filter(Boolean).join('\n') }" class="cnu">
    <p class="cnu__legenda">{{ legenda }}</p>
    <p class="cnu__valor"><span :key="valor" class="cnu__troca">{{ valor }}</span><span v-if="unidade" class="cnu__unidade">{{ unidade }}</span></p>
    <span v-if="selo" class="cnu__selo" :class="`cnu__selo--${tom}`">{{ selo }}</span>
    <p v-if="explica" class="cnu__explica">{{ explica }}</p>
    <slot />
  </div>
</template>

<style scoped>
.cnu__legenda { margin: 0; color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: 500; }
.cnu__valor {
  margin: 6px 0 0; color: var(--nu-ink); font-size: clamp(46px, 5.2vw, 68px); font-weight: 800;
  letter-spacing: -0.035em; line-height: 1; font-variant-numeric: tabular-nums;
}
/* o número que muda: fade de 0,2s a cada conta nova */
.cnu__troca { display: inline-block; animation: cnu-troca .2s ease both; }
@keyframes cnu-troca { from { opacity: .35; transform: translateY(3px); } }
.cnu__unidade { margin-left: 4px; color: var(--nu-gray); font-size: var(--nu-fs-h3); font-weight: 700; letter-spacing: -0.02em; }
.cnu__selo {
  display: inline-flex; margin-top: 16px; padding: 6px 11px; border-radius: var(--nu-r-tag);
  font-size: var(--nu-fs-sm); font-weight: 700; animation: nu-fade .3s ease both;
}
.cnu__selo--azul { background: var(--nu-blue-bg); color: var(--nu-blue-text); }
.cnu__selo--ok { background: var(--nu-green-bg); color: var(--nu-green-text); }
.cnu__selo--falta { background: var(--nu-red-bg); color: var(--nu-red-text); }
.cnu__explica { margin: 14px 0 0; max-width: 470px; color: var(--nu-gray); font-size: 14.5px; font-weight: 500; line-height: 1.5; }
@media (prefers-reduced-motion: reduce) { .cnu__troca, .cnu__selo { animation: none; } }
</style>
