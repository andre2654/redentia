<script setup lang="ts">
// "Minhas simulações" — o bloco de salvar/reabrir simulação das calculadoras
// (decisão do dono, 24/08: dar utilidade de conta à maior porta de entrada).
//
// Deslogado, o botão é a PONTE de conversão: estaciona a simulação no
// localStorage, manda pro /login com redirect de volta pra ESTA simulação
// (params na query — a calculadora já reidrata por deep-link) e, ao voltar
// autenticado, salva sozinho. A pessoa não perde o que estava fazendo.
//
// Genérico por props: qualquer calculadora com params de deep-link usa.
import type { SimulationVM } from '~/composables/useSimulations'

const props = defineProps<{
  calculator: string
  /** params ATUAIS dos sliders — o que o salvar grava e o deep-link aceita */
  params: Record<string, number>
  /** rótulo pronto pra gravar (a calculadora sabe descrever seus campos) */
  label: string
  /** snapshot de resultado pra lista (ex.: { total, aportado, juros }) */
  result?: Record<string, number>
  /** formata o número-destaque da lista (ex.: brl) */
  formatValue?: (v: number) => string
}>()
const emit = defineEmits<{ apply: [params: Record<string, number>] }>()

const { isAuthenticated } = useAuthState()
const route = useRoute()
const sims = useSimulations(props.calculator)

const savedNow = ref(false)
onMounted(async () => {
  if (!isAuthenticated.value) return
  const savedPending = await sims.savePending()
  await sims.hydrate()
  if (savedPending) savedNow.value = true
})
watch(isAuthenticated, (v) => {
  if (v) void sims.hydrate()
  else sims.items.value = []
})

function deepLink(): string {
  const q = Object.entries(props.params)
    .filter(([, v]) => Number.isFinite(v))
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
  return q ? `${route.path}?${q}` : route.path
}

async function onSave() {
  if (!isAuthenticated.value) {
    sims.stashPending({ label: props.label, params: props.params, result: props.result })
    await navigateTo(`/login?redirect=${encodeURIComponent(deepLink())}`)
    return
  }
  const ok = await sims.save({ label: props.label, params: props.params, result: props.result })
  if (ok) savedNow.value = true
}

function highlightValue(s: SimulationVM): string | null {
  const v = s.result?.total
  if (v === undefined || v === null || !Number.isFinite(v)) return null
  return props.formatValue ? props.formatValue(v) : String(v)
}
function dateTxt(s: SimulationVM): string {
  if (!s.created_at) return ''
  const d = new Date(s.created_at.replace(' ', 'T'))
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}
</script>

<template>
  <div class="css">
    <div class="css__actionrow">
      <button type="button" class="css__save" :disabled="sims.busy.value" @click="onSave">
        {{ sims.busy.value ? 'Salvando…' : (savedNow ? 'Simulação salva' : 'Salvar esta simulação') }}
      </button>
      <span v-if="!isAuthenticated" class="css__hint">Entre com seu e-mail e ela fica guardada na sua conta — grátis.</span>
      <span v-else-if="savedNow" class="css__hint css__hint--ok">Guardada em Minhas simulações, aqui embaixo.</span>
    </div>
    <p v-if="sims.error.value" class="css__error">{{ sims.error.value }}</p>

    <div v-if="isAuthenticated && sims.items.value.length" class="css__list">
      <p class="css__list-title">Minhas simulações</p>
      <div
        v-for="s in sims.items.value" :key="s.id"
        class="css__row" :class="{ 'css__row--hot': s.id === sims.lastSavedId.value }"
      >
        <button type="button" class="css__row-main" :disabled="sims.busy.value" @click="emit('apply', s.params)">
          <span class="css__row-label">{{ s.label }}</span>
          <span class="css__row-meta">
            <template v-if="highlightValue(s)">{{ highlightValue(s) }} · </template>{{ dateTxt(s) }}
          </span>
        </button>
        <button type="button" class="css__row-del" aria-label="Apagar simulação" :disabled="sims.busy.value" @click="sims.remove(s.id)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.css { margin-top: 18px; }
.css__actionrow { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.css__save {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 11px 20px; border: 2px solid var(--nu-blue); border-radius: var(--nu-r-pill);
  background: transparent; color: var(--nu-blue);
  font-size: 14.5px; font-weight: 800; cursor: pointer; font-family: inherit;
  transition: background .2s;
}
.css__save:hover { background: var(--nu-blue-tint-2); }
.css__save:disabled { opacity: 0.6; cursor: default; }
.css__hint { color: var(--nu-gray); font-size: 13px; font-weight: 600; }
.css__hint--ok { color: var(--nu-green-2); }
.css__error { margin: 10px 0 0; color: var(--nu-red); font-size: 13.5px; font-weight: 700; }

.css__list { margin-top: 16px; }
.css__list-title {
  margin: 0 0 8px; color: var(--nu-gray-2); font-size: 12px; font-weight: 800;
  letter-spacing: 0.08em; text-transform: uppercase;
}
.css__row {
  display: flex; align-items: center; gap: 6px;
  border-radius: var(--nu-r-chip); transition: background .15s;
}
.css__row:hover, .css__row--hot { background: var(--nu-cream); }
.css__row-main {
  flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px;
  text-align: left; padding: 9px 12px; border: none; background: transparent;
  cursor: pointer; font-family: inherit;
}
.css__row-label { color: var(--nu-ink); font-size: 14px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.css__row-meta { color: var(--nu-gray); font-size: 12.5px; font-weight: 600; font-variant-numeric: tabular-nums; }
.css__row-del {
  width: 32px; height: 32px; flex-shrink: 0; border: none; border-radius: 50%;
  background: transparent; color: var(--nu-gray); cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: background .15s, color .15s;
}
.css__row-del:hover { background: var(--nu-red-tint); color: var(--nu-red); }
</style>
