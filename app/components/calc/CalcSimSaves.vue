<script setup lang="ts">
// "Minhas simulações" — salvar/reabrir simulação de calculadora, em DUAS
// peças com um estado só (useSimulations compartilha por calculadora):
//
//   variant="save"     → botão no PÉ do card de controles (embaixo dos
//                        sliders — a direção do dono, 24/08: a ação mora
//                        onde a pessoa mexe). Deslogado é a ponte de
//                        conversão: estaciona a simulação, /login com
//                        redirect de volta pro deep-link dela e salva
//                        sozinho na volta.
//   variant="history"  → botão discreto ao lado do TÍTULO da seção que abre
//                        um modal com o histórico: clicar numa simulação
//                        aplica nos sliders e fecha; × apaga. Só aparece
//                        logado e com itens.
//
// O modal segue o padrão da casa (Teleport + useModalA11y + Esc/scrim/X) —
// este é dismissível, ao contrário do onboarding.
import type { SimulationVM } from '~/composables/useSimulations'

const props = defineProps<{
  variant: 'save' | 'history'
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
  if (props.variant === 'save') {
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

/* ——— modal do histórico ——— */
const open = ref(false)
const cardRef = ref<HTMLElement | null>(null)
useModalA11y(cardRef, open)
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}
watch(open, (o) => {
  if (!import.meta.client) return
  document.documentElement.style.overflow = o ? 'hidden' : ''
  if (o) document.addEventListener('keydown', onKey)
  else document.removeEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  if (import.meta.client) {
    document.removeEventListener('keydown', onKey)
    if (open.value) document.documentElement.style.overflow = ''
  }
})

function applyAndClose(s: SimulationVM) {
  emit('apply', s.params)
  open.value = false
}

function highlightValue(s: SimulationVM): string | null {
  const v = s.result?.total
  if (v === undefined || v === null || !Number.isFinite(v)) return null
  return props.formatValue ? props.formatValue(v) : String(v)
}
function dateTxt(s: SimulationVM): string {
  if (!s.created_at) return ''
  const d = new Date(s.created_at.replace(' ', 'T'))
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}
</script>

<template>
  <!-- ——— botão de salvar no pé do card de controles ——— -->
  <div v-if="variant === 'save'" class="csv">
    <button
      type="button" class="csv__btn" :class="{ 'csv__btn--saved': savedNow }"
      :disabled="sims.busy.value" @click="onSave"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" :fill="savedNow ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
      {{ sims.busy.value ? 'Salvando…' : (savedNow ? 'Simulação salva' : 'Salvar esta simulação') }}
    </button>
    <p v-if="!isAuthenticated" class="csv__hint">Grátis — entra com seu e-mail e ela fica na sua conta.</p>
    <p v-if="sims.error.value" class="csv__error">{{ sims.error.value }}</p>
  </div>

  <!-- ——— botão "Histórico" ao lado do título + modal ——— -->
  <template v-else>
    <button
      v-if="isAuthenticated && sims.items.value.length"
      type="button" class="csh-btn" @click="open = true"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
      Histórico
      <span class="csh-btn__count">{{ sims.items.value.length }}</span>
    </button>

    <Teleport to="body">
      <div v-if="open" class="cshm" role="presentation" @click.self="open = false">
        <div
          ref="cardRef" class="cshm__card" role="dialog" aria-modal="true"
          aria-labelledby="cshm-title" tabindex="-1"
        >
          <div class="cshm__head">
            <div>
              <p class="cshm__eyebrow">Histórico</p>
              <h2 id="cshm-title" class="cshm__title">Minhas simulações</h2>
            </div>
            <button type="button" class="cshm__close" aria-label="Fechar" @click="open = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>

          <div v-if="sims.items.value.length" class="cshm__list">
            <div
              v-for="s in sims.items.value" :key="s.id"
              class="cshm__row" :class="{ 'cshm__row--hot': s.id === sims.lastSavedId.value }"
            >
              <button type="button" class="cshm__row-main" :disabled="sims.busy.value" @click="applyAndClose(s)">
                <span class="cshm__row-label">{{ s.label }}</span>
                <span class="cshm__row-meta">
                  <template v-if="highlightValue(s)"><strong>{{ highlightValue(s) }}</strong> · </template>salva em {{ dateTxt(s) }}
                </span>
              </button>
              <button type="button" class="cshm__row-del" aria-label="Apagar simulação" :disabled="sims.busy.value" @click="sims.remove(s.id)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
          </div>
          <p v-else class="cshm__empty">Nada por aqui — salve uma simulação e ela fica guardada nesta lista.</p>
          <p v-if="sims.error.value" class="cshm__error">{{ sims.error.value }}</p>

          <p class="cshm__foot">Clique numa simulação pra carregar os valores na calculadora.</p>
        </div>
      </div>
    </Teleport>
  </template>
</template>

<style scoped>
/* ——— save (pé do card de controles) ——— */
.csv { margin-top: 30px; display: flex; flex-direction: column; gap: 7px; }
.csv__btn {
  display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
  padding: 13px 20px; border: 2px solid var(--nu-blue); border-radius: var(--nu-r-pill);
  background: transparent; color: var(--nu-blue);
  font-size: 15px; font-weight: 800; cursor: pointer; font-family: inherit;
  transition: background .2s;
}
.csv__btn:hover { background: var(--nu-blue-tint-2); }
.csv__btn:disabled { opacity: 0.6; cursor: default; }
.csv__btn--saved { background: var(--nu-blue-tint); border-color: transparent; }
.csv__hint { margin: 0; color: var(--nu-gray); font-size: 12.5px; font-weight: 600; text-align: center; }
.csv__error { margin: 0; color: var(--nu-red); font-size: 13px; font-weight: 700; text-align: center; }

/* ——— botão histórico (ao lado do título da seção) ——— */
.csh-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 16px; border: 1.5px solid var(--nu-cream-2); border-radius: var(--nu-r-pill);
  background: var(--nu-white); color: var(--nu-gray-2);
  font-size: 13.5px; font-weight: 800; cursor: pointer; font-family: inherit;
  white-space: nowrap; transition: border-color .15s, color .15s;
}
.csh-btn:hover { border-color: var(--nu-blue); color: var(--nu-blue); }
.csh-btn__count {
  min-width: 20px; height: 20px; padding: 0 6px; border-radius: var(--nu-r-pill);
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--nu-blue-tint); color: var(--nu-blue);
  font-size: 11.5px; font-weight: 800; font-variant-numeric: tabular-nums;
}

/* ——— modal ——— */
.cshm {
  position: fixed; inset: 0; z-index: 120;
  display: flex; align-items: center; justify-content: center; padding: 18px;
  background: var(--nu-day-backdrop);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  animation: nu-fade .22s ease both;
}
.cshm__card {
  width: min(560px, 100%); max-height: calc(100dvh - 36px); overflow-y: auto;
  background: var(--nu-day-card); border-radius: var(--nu-r-card-lg);
  padding: 32px 34px 26px; box-shadow: var(--nu-shadow-day-modal);
  outline: none; animation: nu-fade .28s ease both;
}
.cshm__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.cshm__eyebrow { margin: 0; color: var(--nu-blue); font-size: 12px; font-weight: 800; letter-spacing: 1.6px; text-transform: uppercase; }
.cshm__title { margin: 7px 0 0; color: var(--nu-ink); font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
.cshm__close {
  width: 38px; height: 38px; flex-shrink: 0; border: none; border-radius: 50%;
  background: var(--nu-cream); color: var(--nu-ink); cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.cshm__close:hover { background: var(--nu-cream-hover); }

.cshm__list { margin-top: 20px; display: flex; flex-direction: column; gap: 4px; }
.cshm__row { display: flex; align-items: center; gap: 6px; border-radius: var(--nu-r-chip); transition: background .15s; }
.cshm__row:hover, .cshm__row--hot { background: var(--nu-cream); }
.cshm__row-main {
  flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;
  text-align: left; padding: 11px 14px; border: none; background: transparent;
  cursor: pointer; font-family: inherit;
}
.cshm__row-label { color: var(--nu-ink); font-size: 15px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cshm__row-meta { color: var(--nu-gray); font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
.cshm__row-meta strong { color: var(--nu-blue); font-weight: 800; }
.cshm__row-del {
  width: 34px; height: 34px; flex-shrink: 0; margin-right: 6px;
  border: none; border-radius: 50%; background: transparent; color: var(--nu-gray);
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  transition: background .15s, color .15s;
}
.cshm__row-del:hover { background: var(--nu-red-tint); color: var(--nu-red); }
.cshm__empty { margin: 22px 0 0; color: var(--nu-gray-2); font-size: 15px; font-weight: 500; }
.cshm__error { margin: 12px 0 0; color: var(--nu-red); font-size: 13.5px; font-weight: 700; }
.cshm__foot { margin: 18px 0 0; color: var(--nu-gray); font-size: 12.5px; font-weight: 600; }

@media (max-width: 760px) {
  .cshm { padding: 12px; align-items: flex-end; }
  .cshm__card { padding: 24px 20px 20px; border-radius: var(--nu-r-card); }
}
</style>
