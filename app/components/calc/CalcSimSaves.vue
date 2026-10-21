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
import type { CadastroContexto } from '~/composables/useCadastroFolha'
import type { SimulationVM } from '~/composables/useSimulations'

const props = defineProps<{
  variant: 'save' | 'history'
  calculator: string
  /** params ATUAIS dos sliders — o que o salvar grava e o deep-link aceita */
  params?: Record<string, number>
  /** os params em texto, que vão junto (os tickers do simulador de ações) */
  textos?: Record<string, string>
  /** rótulo pronto pra gravar (a calculadora sabe descrever seus campos) */
  label?: string
  /** snapshot de resultado pra lista (ex.: { total, aportado, juros }) */
  result?: Record<string, number>
  /** formata o número-destaque da lista (ex.: brl) */
  formatValue?: (v: number) => string
  /** no lugar do formatValue, quando a unidade muda com a conta (o dividend yield: % ou R$, pelo modo) */
  formatResult?: (result: Record<string, number>) => string | null
  /** sem conta: a folha de cadastro que sobe, com o herói desta conta; sem ela, vai para o /login */
  folha?: CadastroContexto
  /** o caminho que reabre a conta (as páginas de cenário reabrem na calculadora principal) */
  caminho?: string
}>()
const emit = defineEmits<{
  apply: [params: Record<string, number>]
  /** os params em texto da conta reaberta, depois do `apply` */
  applyTextos: [textos: Record<string, string>]
}>()

const { isAuthenticated } = useAuthState()
const route = useRoute()
const sims = useSimulations(props.calculator)
const folha = useCadastroFolha()

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
  const base = props.caminho ?? route.path
  const q = [
    ...Object.entries(props.params ?? {}).filter(([, v]) => Number.isFinite(v)),
    ...Object.entries(props.textos ?? {}).filter(([, v]) => v !== ''),
  ]
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
  return q ? `${base}?${q}` : base
}

/**
 * Salvar a conta. Sem conta (21/10/2026), a folha de cadastro sobe com o
 * herói desta conta (o `folha` que a calculadora passa); confirmado o código,
 * a conta é salva. Pelo botão, ela também fica estacionada, para quem prefere
 * entrar pelo /login (Google, celular) achá-la salva na volta. Pelo convite
 * que sobe sozinho (useConviteDaConta) nada fica estacionado: quem não pediu
 * para salvar não ganha uma conta salva de surpresa ao entrar mais tarde.
 */
async function pedir(origem: 'botao' | 'convite' = 'botao') {
  if (!props.params || !props.label) return
  const sim = { label: props.label, params: { ...props.params, ...props.textos }, result: props.result }
  if (isAuthenticated.value) {
    const ok = await sims.save(sim)
    if (ok) savedNow.value = true
    return
  }
  if (origem === 'botao') sims.stashPending(sim)
  if (props.folha) {
    folha.abrir(props.folha, async () => {
      const ok = origem === 'botao' ? await sims.savePending() : await sims.save(sim)
      if (ok) savedNow.value = true
      return ok
    }, deepLink())
    return
  }
  if (origem === 'botao') await navigateTo(`/login?redirect=${encodeURIComponent(deepLink())}`)
}
defineExpose({ pedir })
// mexeu na conta depois de salvar: o botão volta a oferecer o salvar
watch(() => JSON.stringify([props.params ?? {}, props.textos ?? {}]), () => { savedNow.value = false })

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
  const numeros: Record<string, number> = {}
  const textos: Record<string, string> = {}
  for (const [k, v] of Object.entries(s.params)) {
    if (typeof v === 'string') textos[k] = v
    else numeros[k] = v
  }
  emit('apply', numeros)
  if (Object.keys(textos).length) emit('applyTextos', textos)
  open.value = false
}

function highlightValue(s: SimulationVM): string | null {
  if (props.formatResult && s.result) return props.formatResult(s.result)
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
  <!-- ——— "Salvar esta conta", à vista ao lado do resultado (o slot põe o Compartilhar ao lado) ——— -->
  <div v-if="variant === 'save'" class="csv">
    <div class="csv__botoes">
      <button
        type="button" class="csv__btn" :class="{ 'csv__btn--saved': savedNow }"
        :disabled="sims.busy.value" @click="pedir('botao')"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" :fill="savedNow ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
        {{ sims.busy.value ? 'Salvando…' : (savedNow ? 'Conta salva' : 'Salvar esta conta') }}
      </button>
      <slot />
    </div>
    <p v-if="!isAuthenticated" class="csv__hint">Grátis. Fica salva para você reabrir quando quiser.</p>
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
/* ——— save (ao lado do resultado) ——— */
.csv { display: flex; flex-direction: column; gap: 8px; }
.csv__botoes { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.csv__btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 9px; height: 52px;
  padding: 0 24px; border: 0; border-radius: var(--nu-r-pill);
  background: var(--nu-blue); color: var(--nu-white); white-space: nowrap;
  font-size: var(--nu-fs-md); font-weight: 700; cursor: pointer; font-family: inherit;
  transition: background .2s, transform .18s;
}
.csv__btn:hover { background: var(--nu-blue-hover); }
.csv__btn:active { transform: scale(.98); }
.csv__btn:disabled { opacity: 0.6; cursor: default; }
.csv__btn--saved { background: var(--nu-blue-tint); color: var(--nu-blue); }
.csv__btn--saved:hover { background: var(--nu-blue-tint); }
.csv__btn:focus-visible { outline: 3px solid color-mix(in srgb, var(--nu-blue) 45%, transparent); outline-offset: 2px; }
.csv__hint { margin: 0; padding-left: 4px; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; }
.csv__error { margin: 0; color: var(--nu-red); font-size: var(--nu-fs-dense); font-weight: 700; }
/* no celular o salvar vive numa barra fina grudada no pé da tela: uma linha só */
@media (max-width: 900px) {
  .csv__botoes { flex-wrap: nowrap; }
  .csv__btn { flex: 1 1 auto; }
  .csv__hint { display: none; }
}

/* ——— botão histórico (ao lado do título da seção) ——— */
.csh-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 16px; border: 1.5px solid var(--nu-cream-2); border-radius: var(--nu-r-pill);
  background: var(--nu-white); color: var(--nu-gray-2);
  font-size: var(--nu-fs-sm); font-weight: 700; cursor: pointer; font-family: inherit;
  white-space: nowrap; transition: border-color .15s, color .15s;
}
.csh-btn:hover { border-color: var(--nu-blue); color: var(--nu-blue); }
.csh-btn__count {
  min-width: 20px; height: 20px; padding: 0 6px; border-radius: var(--nu-r-pill);
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--nu-blue-tint); color: var(--nu-blue);
  font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums;
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
.cshm__eyebrow { margin: 0; color: var(--nu-blue); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase; }
.cshm__title { margin: 7px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.02em; }
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
.cshm__row-label { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cshm__row-meta { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; font-variant-numeric: tabular-nums; }
.cshm__row-meta strong { color: var(--nu-blue); font-weight: 800; }
.cshm__row-del {
  width: 34px; height: 34px; flex-shrink: 0; margin-right: 6px;
  border: none; border-radius: 50%; background: transparent; color: var(--nu-gray);
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  transition: background .15s, color .15s;
}
.cshm__row-del:hover { background: var(--nu-red-tint); color: var(--nu-red); }
.cshm__empty { margin: 22px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; }
.cshm__error { margin: 12px 0 0; color: var(--nu-red); font-size: var(--nu-fs-sm); font-weight: 700; }
.cshm__foot { margin: 18px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; }

@media (max-width: 760px) {
  .cshm { padding: 12px; align-items: flex-end; }
  .cshm__card { padding: 24px 20px 20px; border-radius: var(--nu-r-card); }
}
</style>
