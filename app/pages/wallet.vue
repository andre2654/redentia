<template>
  <NuxtLayout title="Sua carteira">
    <div class="flex h-full flex-col justify-between">
      <div class="flex flex-col gap-5 border-b p-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <h2 class="text-[18px] font-bold">Sua carteira</h2>
          <div class="flex items-center gap-2">
            <input
              ref="fileInputRef"
              type="file"
              accept=".xlsx"
              class="hidden"
              @change="onFileSelected"
            >
            <UButton
              color="primary"
              size="lg"
              icon="i-lucide-upload"
              :loading="uploading"
              label="Importar carteira"
              @click="fileInputRef?.click()"
            />
          </div>
        </div>
        <p class="text-[13px] text-white/60">
          O upload substitui todas as posições anteriores. Use uma planilha no formato da sua corretora (colunas: Código de Negociação, Quantidade, Preço de Fechamento).
        </p>

        <div v-if="loading" class="flex justify-center py-12">
          <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-secondary" />
        </div>
        <div v-else-if="!positions.length" class="rounded-xl border border-white/10 bg-white/5 px-6 py-12 text-center">
          <p class="text-white/70">Nenhuma posição. Importe uma planilha XLSX no formato da sua corretora.</p>
          <UButton
            color="primary"
            size="lg"
            class="mt-4"
            icon="i-lucide-upload"
            label="Importar carteira"
            @click="fileInputRef?.click()"
          />
        </div>
        <div v-else class="flex flex-col gap-4">
          <div class="overflow-x-auto rounded-xl border border-white/10">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-white/10 bg-white/5">
                <tr>
                  <th class="px-4 py-3 font-medium text-white">Ticker</th>
                  <th class="px-4 py-3 font-medium text-white">Quantidade</th>
                  <th class="px-4 py-3 font-medium text-white">Preço médio</th>
                  <th class="px-4 py-3 font-medium text-white">Valor total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/10">
                <tr v-for="p in positions" :key="p.ticker" class="text-white/90">
                  <td class="px-4 py-3 font-medium">{{ p.ticker }}</td>
                  <td class="px-4 py-3">{{ formatNumber(p.quantity) }}</td>
                  <td class="px-4 py-3">{{ formatBRL(p.average_price) }}</td>
                  <td class="px-4 py-3">{{ formatBRL(p.quantity * p.average_price) }}</td>
                </tr>
              </tbody>
              <tfoot class="border-t border-white/10 bg-white/5 font-medium">
                <tr>
                  <td colspan="3" class="px-4 py-3 text-white">Total</td>
                  <td class="px-4 py-3 text-white">{{ formatBRL(totalValue) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
      <template v-if="positions.length">
        <div class="flex flex-col gap-8 border-b p-6">
          <h2 class="text-[18px] font-bold">Composição</h2>
          <div v-if="compositionLoading" class="flex justify-center py-8">
            <UIcon name="i-lucide-loader-2" class="h-6 w-6 animate-spin text-secondary" />
          </div>
          <div v-else class="flex items-center justify-center gap-7 max-lg:flex-col">
            <AtomsGraphBar
              class="max-sm:max-w-[300px]"
              :portfolio-data="compositionChartData"
            />
            <hr class="border-x max-lg:w-[200px] lg:h-[200px]">
            <AtomsGraphBar
              class="max-sm:max-w-[300px]"
              :portfolio-data="compositionChartData"
            />
          </div>
        </div>
        <div class="mt-12 flex flex-col items-center gap-12">
          <AtomsAiInsight
            :title="compositionInsight?.title"
            :message="compositionInsight?.message"
          />
          <MoleculesChat class="w-full bg-white/10" />
        </div>
      </template>
      <div v-else-if="!loading" class="mt-12 flex flex-col items-center gap-12">
        <MoleculesChat class="w-full bg-white/10" />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { PortfolioComposition } from '~/services/portfolio'

const { getPositions, getComposition, uploadPositions } = usePortfolioService()
const positions = ref<Array<{ ticker: string; quantity: number; average_price: number }>>([])
const loading = ref(true)
const uploading = ref(false)
const compositionLoading = ref(false)
const composition = ref<PortfolioComposition | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

async function load() {
  loading.value = true
  try {
    const resp = await getPositions()
    positions.value = resp.positions ?? []
  } catch {
    positions.value = []
  } finally {
    loading.value = false
  }
}

async function loadComposition() {
  if (!positions.value.length) {
    composition.value = null
    return
  }
  compositionLoading.value = true
  try {
    composition.value = await getComposition()
  } catch {
    composition.value = null
  } finally {
    compositionLoading.value = false
  }
}

const compositionChartData = computed(() => {
  if (!composition.value?.sectors?.length) return []
  return composition.value.sectors.map((s) => ({
    label: s.label,
    actual: s.actualPercent,
    ideal: s.idealPercent,
  }))
})

const compositionInsight = computed(() => composition.value?.insight ?? null)

async function loadAll() {
  await load()
  await loadComposition()
}

onMounted(loadAll)

const totalValue = computed(() =>
  positions.value.reduce((s, p) => s + p.quantity * p.average_price, 0)
)

function formatBRL(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 4 }).format(n)
}

async function onFileSelected(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const { parsePortfolioXlsx } = await import('~/utils/parsePortfolioXlsx')
    const parsed = await parsePortfolioXlsx(file)
    if (!parsed.length) {
      showErrorNotification('Planilha vazia', 'Nenhuma posição válida encontrada.')
      return
    }
    await uploadPositions(parsed)
    showSuccessNotification('Carteira importada', `${parsed.length} posições importadas.`)
    await loadAll()
  } catch (e: any) {
    showErrorNotification('Erro ao importar', e?.message ?? e?.data?.message ?? 'Verifique o formato da planilha.')
  } finally {
    uploading.value = false
    input.value = ''
  }
}
</script>
