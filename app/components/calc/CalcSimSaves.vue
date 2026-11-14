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
//
// Robustez (11/11/2026): o botão responde na hora e não muda de largura. Os
// três rótulos ("Salvar esta conta", "Salvando…", "Conta salva") moram na
// mesma célula e trocam com fade; o botão tem a largura do maior (no HTML do
// servidor só o primeiro existe). O marcador se preenche ao salvar. O modal
// entra com o véu da base (--nu-veu) e o cartão subindo, e sai pelo inverso.
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
// os rótulos que trocam só existem depois de montar (o HTML do servidor tem o primeiro)
const montado = ref(false)
const estadoDoBotao = computed(() => (sims.busy.value ? 'salvando' : savedNow.value ? 'salva' : 'salvar'))
onMounted(async () => {
  montado.value = true
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
        type="button" class="csv__btn" :class="[`csv__btn--${estadoDoBotao}`, { 'csv__btn--saved': savedNow }]"
        :disabled="sims.busy.value" :aria-busy="sims.busy.value || undefined" @click="pedir('botao')"
      >
        <svg class="csv__marca" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
        <span class="csv__rotulos">
          <span class="csv__rotulo" :class="{ 'csv__rotulo--on': estadoDoBotao === 'salvar' }" :aria-hidden="estadoDoBotao !== 'salvar' || undefined">Salvar esta conta</span>
          <template v-if="montado">
            <span class="csv__rotulo" :class="{ 'csv__rotulo--on': estadoDoBotao === 'salvando' }" :aria-hidden="estadoDoBotao !== 'salvando' || undefined">Salvando…</span>
            <span class="csv__rotulo" :class="{ 'csv__rotulo--on': estadoDoBotao === 'salva' }" :aria-hidden="estadoDoBotao !== 'salva' || undefined">Conta salva</span>
          </template>
        </span>
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
      <Transition name="cshm">
      <div v-if="open" class="cshm" role="presentation" @click.self="open = false">
        <div
          ref="cardRef" class="cshm__card" role="dialog" aria-modal="true"
          aria-labelledby="cshm-title" tabindex="-1"
        >
          <div class="cshm__head">
            <div>
              <p class="cshm__eyebrow nu-eyebrow"><MarcaCorte /><span>Histórico</span></p>
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
      </Transition>
    </Teleport>
  </template>
</template>

<style scoped>
/* ——— save (ao lado do resultado) ——— */
.csv { display: flex; flex-direction: column; gap: 8px; }
.csv__botoes { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
/* o botão do cartão: 48px (o "m" do NuBotaoSeta), a largura do maior rótulo */
.csv__btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 9px; height: 48px;
  padding: 0 22px 0 20px; border: 0; border-radius: var(--nu-r-pill);
  background: var(--nu-blue); color: var(--nu-white); white-space: nowrap;
  font-size: 15.5px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); cursor: pointer; font-family: inherit;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.csv__btn:hover { background: var(--nu-blue-hover); }
.csv__btn:active { transform: scale(.98); }
.csv__btn:disabled { cursor: default; }
.csv__btn--salvando { background: color-mix(in srgb, var(--nu-blue) 82%, var(--nu-white)); }
.csv__btn--saved, .csv__btn--saved:hover { background: var(--nu-blue-bg); color: var(--nu-blue-text); }
.csv__btn:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 2px; }
/* o marcador se preenche quando a conta fica salva, com um assentar curto */
.csv__marca { flex: none; }
.csv__marca path { fill: transparent; transition: fill var(--nu-dur-media) var(--nu-ease-cor); }
.csv__btn--saved .csv__marca { animation: csv-assenta var(--nu-dur-lenta) var(--nu-ease-saida) both; }
.csv__btn--saved .csv__marca path { fill: currentColor; }
@keyframes csv-assenta { from { transform: scale(.82); } }
/* os rótulos na mesma célula: a largura é a do maior e a troca é um fade */
.csv__rotulos { display: inline-grid; }
/* quem sai some rápido; quem entra vem logo depois (sem as duas palavras uma sobre a outra) */
.csv__rotulo {
  grid-area: 1 / 1; text-align: center; opacity: 0; visibility: hidden; transform: translateY(-3px);
  transition: opacity var(--nu-dur-rapida) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-cor), visibility 0s linear var(--nu-dur-rapida);
}
.csv__rotulo--on {
  opacity: 1; visibility: visible; transform: none;
  transition: opacity var(--nu-dur-media) var(--nu-ease-saida) var(--nu-dur-rapida), transform var(--nu-dur-media) var(--nu-ease-saida) var(--nu-dur-rapida), visibility 0s;
}
.csv__hint { margin: 0; padding-left: 4px; color: var(--nu-gray); font-size: 13.5px; font-weight: var(--nu-w-texto); }
.csv__error { margin: 0; color: var(--nu-red-text); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-medio); }
/* no celular o salvar vive numa barra fina grudada no pé da tela: uma linha só */
@media (max-width: 900px) {
  .csv__botoes { flex-wrap: nowrap; }
  .csv__btn { flex: 1 1 auto; }
  .csv__hint { display: none; }
}

/* ——— botão histórico (ao lado do título da seção) ——— */
.csh-btn {
  display: inline-flex; align-items: center; gap: 7px;
  min-height: 44px; padding: 0 16px; border: 1px solid var(--nu-line); border-radius: var(--nu-r-pill);
  background: var(--nu-white); color: var(--nu-gray-3);
  font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); cursor: pointer; font-family: inherit;
  white-space: nowrap;
  transition: border-color var(--nu-dur-media) var(--nu-ease-cor), color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.csh-btn:hover { border-color: var(--nu-blue); color: var(--nu-blue-text); }
.csh-btn:active { transform: scale(.98); }
.csh-btn__count {
  min-width: 22px; height: 22px; padding: 0 6px; border-radius: var(--nu-r-tag);
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--nu-blue-bg); color: var(--nu-blue-text);
  font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums;
}

/* ——— modal: o véu da base, o cartão sobe; sai pelo inverso, mais rápido ——— */
.cshm {
  position: fixed; inset: 0; z-index: 120;
  display: flex; align-items: center; justify-content: center; padding: 18px;
  background: var(--nu-veu);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
}
.cshm-enter-active { transition: opacity var(--nu-dur-lenta) var(--nu-ease-cor); }
.cshm-leave-active { transition: opacity var(--nu-dur-rapida) var(--nu-ease-cor); }
.cshm-enter-from, .cshm-leave-to { opacity: 0; }
.cshm-enter-active .cshm__card { transition: opacity var(--nu-dur-lenta) var(--nu-ease-saida), transform var(--nu-dur-lenta) var(--nu-ease-saida); }
.cshm-leave-active .cshm__card { transition: opacity var(--nu-dur-rapida) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-cor); }
.cshm-enter-from .cshm__card, .cshm-leave-to .cshm__card { opacity: 0; transform: translateY(16px) scale(.985); }
.cshm__card {
  width: min(560px, 100%); max-height: calc(100dvh - 36px); overflow-y: auto;
  background: var(--nu-day-card); border-radius: var(--nu-r-card-lg);
  padding: 32px 32px 24px; box-shadow: var(--nu-shadow-float);
  outline: none;
}
.cshm__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.cshm__title { margin: 12px 0 0; color: var(--nu-ink); font-size: clamp(26px, 2.8vw, 34px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); line-height: 1.05; }
.cshm__close {
  width: 44px; height: 44px; flex-shrink: 0; border: none; border-radius: 50%;
  background: var(--nu-cream-2); color: var(--nu-ink); cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.cshm__close:hover { background: var(--nu-line-2); }
.cshm__close:active { transform: scale(.94); }

.cshm__list { margin-top: 24px; display: flex; flex-direction: column; border-bottom: 1px solid var(--nu-line-2); }
.cshm__row { display: flex; align-items: center; gap: 6px; border-top: 1px solid var(--nu-line-2); transition: background-color var(--nu-dur-media) var(--nu-ease-cor); }
.cshm__row:hover, .cshm__row--hot { background: var(--nu-cream-2); }
.cshm__row-main {
  flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;
  text-align: left; padding: 12px 14px; border: none; background: transparent;
  cursor: pointer; font-family: inherit;
}
.cshm__row-label { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cshm__row-meta { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-texto); font-variant-numeric: tabular-nums; }
.cshm__row-meta strong { color: var(--nu-ink); font-weight: var(--nu-w-forte); }
.cshm__row-del {
  width: 44px; height: 44px; flex-shrink: 0; margin-right: 2px;
  border: none; border-radius: 50%; background: transparent; color: var(--nu-gray);
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), color var(--nu-dur-media) var(--nu-ease-cor);
}
.cshm__row-del:hover { background: var(--nu-red-bg); color: var(--nu-red-text); }
.cshm__empty { margin: 24px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto); }
.cshm__error { margin: 12px 0 0; color: var(--nu-red-text); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.cshm__foot { margin: 16px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-texto); }

@media (max-width: 760px) {
  .cshm { padding: 12px; align-items: flex-end; }
  .cshm__card { padding: 24px 20px 20px; border-radius: var(--nu-r-card); }
}
</style>
