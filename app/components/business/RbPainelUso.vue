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
</script>

<template>
  <RbPainelSecao
    tom="navy"
    eyebrow="Uso"
    :titulo="`${total.toLocaleString('pt-BR')} ${total === 1 ? 'pergunta' : 'perguntas'} em ${janela} dias.`"
    :dek="resumo"
  >
    <div class="rbpu" role="img" :aria-label="resumo">
      <div class="rbpu__barras">
        <span
          v-for="d in dias"
          :key="d.day"
          class="rbpu__barra"
          :class="{ 'rbpu__barra--zero': !d.calls }"
          :style="{ height: `${Math.max(3, (d.calls / topo) * 100)}%` }"
          :title="`${dataCurta(d.day)}: ${d.calls.toLocaleString('pt-BR')} ${d.calls === 1 ? 'pergunta' : 'perguntas'}`"
        />
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
.rbpu__barra { flex: 1; min-width: 3px; border-radius: 5px 5px 2px 2px; background: var(--nu-blue-soft); }
.rbpu__barra--zero { background: var(--rbp-linha); }
.rbpu__eixo { display: flex; justify-content: space-between; margin-top: 12px; color: var(--nu-cream-text-60); font-size: var(--nu-fs-xs); font-weight: 500; }
@media (max-width: 560px) { .rbpu { padding: 20px 16px 14px; } .rbpu__barras { gap: 3px; height: 140px; } }
</style>
