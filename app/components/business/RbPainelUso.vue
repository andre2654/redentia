<script setup lang="ts">
/**
 * O uso dos últimos 30 dias (banda navy): uma barra por dia. Só aparece com
 * uso (gráfico vazio é moldura, não informação). O dek é também a
 * alternativa em texto do gráfico.
 */
import type { BusinessAccountStatus } from '~/composables/useBusinessAccount'

const props = defineProps<{ conta: BusinessAccountStatus, janela: number, resumo: string }>()

const dias = computed(() => props.conta.usage.days ?? [])
const topo = computed(() => Math.max(1, ...dias.value.map(d => d.calls)))
const total = computed(() => props.conta.usage.calls ?? 0)
const dataCurta = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
const diaSemana = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long' })
const plural = (n: number) => `${n.toLocaleString('pt-BR')} ${n === 1 ? 'pergunta' : 'perguntas'}`

/**
 * A barra sob o mouse mostra a dica com o dia e o número. Só no mouse, de
 * propósito: 30 barras focáveis seriam 30 paradas de Tab, e quem usa teclado
 * ou leitor de tela recebe o mesmo conteúdo no resumo em texto (o dek).
 */
const ativa = ref<number | null>(null)
const ultima = computed(() => dias.value.length - 1)
</script>

<template>
  <RbPainelSecao
    tom="navy"
    eyebrow="Uso"
    :titulo="`${total.toLocaleString('pt-BR')} ${total === 1 ? 'pergunta' : 'perguntas'} em ${janela} dias.`"
    :dek="resumo"
  >
    <div class="rbpu" role="img" :aria-label="resumo">
      <div class="rbpu__barras" @mouseleave="ativa = null">
        <span
          v-for="(d, i) in dias"
          :key="d.day"
          class="rbpu__col"
          :class="{ 'rbpu__col--ativa': ativa === i, 'rbpu__col--hoje': i === ultima }"
          :style="{ '--h': `${Math.max(3, (d.calls / topo) * 100)}%` }"
          @mouseenter="ativa = i"
        >
          <span class="rbpu__barra" :class="{ 'rbpu__barra--zero': !d.calls }" />
          <span v-if="ativa === i" class="rbpu__dica" :class="{ 'rbpu__dica--esq': i > dias.length - 4, 'rbpu__dica--dir': i < 3 }" aria-hidden="true">
            <b>{{ plural(d.calls) }}</b>
            <span>{{ i === ultima ? 'hoje' : `${diaSemana(d.day)}, ${dataCurta(d.day)}` }}</span>
          </span>
        </span>
      </div>
      <div v-if="dias.length" class="rbpu__eixo">
        <span>{{ dataCurta(dias[0]!.day) }}</span>
        <span>hoje</span>
      </div>
    </div>
  </RbPainelSecao>
</template>

<style scoped>
.rbpu { padding: 28px 28px 20px; border-radius: var(--nu-r-card); background: var(--rbp-painel); }
.rbpu__barras { display: flex; align-items: flex-end; gap: 5px; height: 180px; }
.rbpu__col { position: relative; flex: 1; min-width: 3px; height: 100%; display: flex; align-items: flex-end; }
.rbpu__barra { width: 100%; height: var(--h); border-radius: 5px 5px 2px 2px; background: var(--nu-blue-soft); transition: background .15s, opacity .15s; }
.rbpu__barras:hover .rbpu__barra:not(.rbpu__barra--zero) { opacity: .45; }
.rbpu__col--ativa .rbpu__barra, .rbpu__barras:hover .rbpu__col--ativa .rbpu__barra { opacity: 1; background: var(--nu-white); }
.rbpu__col--hoje .rbpu__barra:not(.rbpu__barra--zero) { background: var(--nu-blue); }
.rbpu__dica {
  /* nasce logo acima da barra, não no topo da coluna */
  position: absolute; bottom: calc(var(--h) + 10px); left: 50%; transform: translateX(-50%); z-index: 2;
  display: grid; gap: 2px; min-width: 128px; padding: 10px 12px; border-radius: 12px; text-align: left; white-space: nowrap;
  background: var(--nu-white); color: var(--nu-ink); box-shadow: var(--nu-shadow-float); pointer-events: none;
  animation: rbpu-dica .15s ease both;
}
.rbpu__dica b { font-size: var(--nu-fs-sm); font-weight: 800; }
.rbpu__dica span { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; }
.rbpu__dica--esq { left: auto; right: 0; transform: none; }
.rbpu__dica--dir { left: 0; transform: none; }
@keyframes rbpu-dica { from { opacity: 0; margin-bottom: -4px; } }
@media (prefers-reduced-motion: reduce) { .rbpu__dica { animation: none; } }
.rbpu__barra--zero { background: var(--rbp-linha); }
.rbpu__eixo { display: flex; justify-content: space-between; margin-top: 12px; color: var(--nu-cream-text-60); font-size: var(--nu-fs-xs); font-weight: 500; }
@media (max-width: 560px) { .rbpu { padding: 20px 16px 14px; } .rbpu__barras { gap: 3px; height: 140px; } }
</style>
