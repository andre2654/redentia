<script setup lang="ts">
// "Minhas simulações" — salvar/reabrir simulação de calculadora, em DUAS
// peças com um estado só (useSimulations compartilha por calculadora):
//
//   variant="action"  → a pill de salvar no CABEÇALHO do painel de resultado
//                       (a ação orbita o que está sendo salvo, sem peso
//                       vertical). Deslogado, é a ponte de conversão:
//                       estaciona a simulação, /login com redirect de volta
//                       pro deep-link dela, salva sozinho na volta.
//   variant="list"    → faixa de chips sob a calculadora inteira, na mesma
//                       linguagem dos "cenários populares" que a página já
//                       ensina: clicou, os sliders assumem. × apaga.
//
// Revisão de UX do dono (24/08): a v1 empilhava tudo no rodapé do painel de
// resultado e ficava espremida — esta é a arrumação.
import type { SimulationVM } from '~/composables/useSimulations'

const props = defineProps<{
  variant: 'action' | 'list'
  calculator: string
  /** params ATUAIS dos sliders — o que o salvar grava e o deep-link aceita */
  params?: Record<string, number>
  /** rótulo pronto pra gravar (a calculadora sabe descrever seus campos) */
  label?: string
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
  if (props.variant === 'action') {
    const savedPending = await sims.savePending()
    if (savedPending) savedNow.value = true
  }
  await sims.hydrate()
})
watch(isAuthenticated, (v) => {
  if (v) void sims.hydrate()
})

function deepLink(): string {
  const q = Object.entries(props.params ?? {})
    .filter(([, v]) => Number.isFinite(v))
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
  return q ? `${route.path}?${q}` : route.path
}

async function onSave() {
  if (!props.params || !props.label) return
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
</script>

<template>
  <!-- ——— a pill no cabeçalho do resultado ——— -->
  <div v-if="variant === 'action'" class="csa">
    <button
      type="button" class="csa__btn" :class="{ 'csa__btn--saved': savedNow }"
      :disabled="sims.busy.value"
      :title="isAuthenticated ? 'Salvar esta simulação na sua conta' : 'Crie sua conta grátis e esta simulação fica guardada'"
      @click="onSave"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" :fill="savedNow ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
      {{ sims.busy.value ? 'Salvando…' : (savedNow ? 'Salva' : 'Salvar') }}
    </button>
    <p v-if="!isAuthenticated" class="csa__hint">Grátis — entra com seu e-mail e ela fica na sua conta.</p>
    <p v-if="sims.error.value" class="csa__error">{{ sims.error.value }}</p>
  </div>

  <!-- ——— a faixa de chips sob a calculadora ——— -->
  <div v-else-if="isAuthenticated && sims.items.value.length" class="csl">
    <span class="csl__title">Minhas simulações</span>
    <div class="csl__chips">
      <span
        v-for="s in sims.items.value" :key="s.id"
        class="csl__chip" :class="{ 'csl__chip--hot': s.id === sims.lastSavedId.value }"
      >
        <button type="button" class="csl__chip-main" :disabled="sims.busy.value" @click="emit('apply', s.params)">
          <span class="csl__chip-label">{{ s.label }}</span>
          <span v-if="highlightValue(s)" class="csl__chip-value">{{ highlightValue(s) }}</span>
        </button>
        <button type="button" class="csl__chip-del" aria-label="Apagar simulação" :disabled="sims.busy.value" @click="sims.remove(s.id)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </span>
    </div>
  </div>
</template>

<style scoped>
/* ——— action (cabeçalho do resultado) ——— */
.csa { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
.csa__btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 8px 15px; border: 1.5px solid var(--nu-blue); border-radius: var(--nu-r-pill);
  background: transparent; color: var(--nu-blue);
  font-size: 13.5px; font-weight: 800; cursor: pointer; font-family: inherit;
  white-space: nowrap; transition: background .2s, color .2s;
}
.csa__btn:hover { background: var(--nu-blue-tint-2); }
.csa__btn:disabled { opacity: 0.6; cursor: default; }
.csa__btn--saved { background: var(--nu-blue-tint); border-color: transparent; }
.csa__hint { margin: 0; color: var(--nu-gray); font-size: 12px; font-weight: 600; text-align: right; max-width: 240px; }
.csa__error { margin: 0; color: var(--nu-red); font-size: 12.5px; font-weight: 700; text-align: right; max-width: 260px; }

/* ——— list (faixa de chips) ——— */
.csl { display: flex; flex-direction: column; gap: 10px; margin-top: 34px; }
.csl__title {
  color: var(--nu-gray-2); font-size: 12px; font-weight: 800;
  letter-spacing: 0.08em; text-transform: uppercase;
}
.csl__chips { display: flex; flex-wrap: wrap; gap: 8px; }
.csl__chip {
  display: inline-flex; align-items: center;
  background: var(--nu-white); border: 1.5px solid var(--nu-cream-2);
  border-radius: var(--nu-r-pill); padding: 0 4px 0 0;
  transition: border-color .15s, transform .15s;
}
.csl__chip:hover { border-color: var(--nu-blue); transform: translateY(-1px); }
.csl__chip--hot { border-color: var(--nu-blue); background: var(--nu-blue-tint-2); }
.csl__chip-main {
  display: inline-flex; align-items: baseline; gap: 8px; min-width: 0;
  padding: 9px 2px 9px 15px; border: none; background: transparent;
  cursor: pointer; font-family: inherit;
}
.csl__chip-label {
  color: var(--nu-ink); font-size: 13.5px; font-weight: 700;
  max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.csl__chip-value { color: var(--nu-blue); font-size: 13px; font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap; }
.csl__chip-del {
  width: 28px; height: 28px; flex-shrink: 0; margin-left: 2px;
  border: none; border-radius: 50%; background: transparent; color: var(--nu-gray);
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  transition: background .15s, color .15s;
}
.csl__chip-del:hover { background: var(--nu-red-tint); color: var(--nu-red); }

@media (max-width: 760px) {
  .csa { align-items: flex-start; }
  .csa__hint, .csa__error { text-align: left; }
  .csl__chip-label { max-width: 200px; }
}
</style>
