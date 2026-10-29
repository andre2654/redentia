<script setup lang="ts">
// Onboarding — decisão do dono (24/08): TODO usuário logado sem
// `investor_goal` vê as duas perguntas antes de seguir (o gate vale pra conta
// nova E pra base antiga; 427 de 428 usuários estavam sem a resposta porque o
// fluxo novo nunca perguntou). Dá para dispensar com Esc, clique no fundo ou
// no X: a resposta não é gravada, e o modal não volta nesta visita. Também
// não abre por cima do "Pronto" da newsletter (useNewsletter segura o gate
// até a próxima navegação ou carga).
//
// Desenho que torna o bloqueio aceitável: 2 perguntas, 1 toque cada, e a
// resposta MUDA a tela final (CTA por objetivo) — setup, não censo. O passo 3
// é dispensável ("Ficar por aqui").
//
// Mecânica: gate por sessão em useState — 1 GET /auth/me por sessão decide
// (investor_goal vazio → abre). Salva via PUT /auth/profile (endpoint e
// colunas já existiam; enum de experiência é o do backend: iniciante/
// intermediario/avancado). Erro de rede não bloqueia navegação à toa: sem
// resposta do /me, o modal NÃO abre (na dúvida, não pune o usuário).
// /login fica de fora (a sessão nasce lá; o modal pega na primeira página).
//
// BUSINESS fica de fora (dono, 24/08): o onboarding é de INVESTIDOR e a
// pergunta não faz sentido pra quem veio pro produto de escritório. Duas
// camadas: (1) em /business/* o gate nem roda (visitante ou não — a rota
// watcher pega quando ele sair de lá); (2) usuário DONO de conta business
// (GET /me/business → has_account, o 1:1 de business_accounts) nunca vê,
// em página nenhuma.
import type { BusinessAccountStatus } from '~/composables/useBusinessAccount'
import { NEWSLETTER_SEGURA_ONBOARDING } from '~/utils/newsletter-inscricao'

const { isAuthenticated, firstName } = useAuthState()
const { authFetch } = useApi()
// /auth/me dividido com o gancho do "Seguir" e o plugin auth-user: 1 GET por
// sessão por carga de página, não um por consumidor (useMeCliente).
const meCliente = useMeCliente()
const route = useRoute()

// as perguntas ficam em utils/onboarding.ts: a folha de cadastro faz as mesmas
const GOALS = ONBOARDING_OBJETIVOS
const EXPS = ONBOARDING_EXPERIENCIAS
// tela final por objetivo — a resposta precisa mudar o que vem depois,
// senão o usuário aprende que o modal era burocracia
const DONE: Record<string, { line: string; cta: string; to: string }> = {
  'acompanhar-carteira': { line: 'A página da carteira mostra o dia do seu dinheiro — conecte seus investimentos e a Redentia lê o resto.', cta: 'Ir pra minha carteira', to: '/carteira' },
  'decidir-aportes': { line: 'Comece pelas teses vivas da casa — cada uma com convicção, estudos diários e catalisadores.', cta: 'Ver as teses', to: '/teses' },
  'aprender': { line: 'A trilha começa no primeiro aporte e vai até o raio-x de ETF, passo a passo.', cta: 'Começar pelos guias', to: '/guias' },
  'ferramentas': { line: 'Juros compostos, preço-teto, aposentadoria — as contas prontas pra usar agora.', cta: 'Abrir as calculadoras', to: '/calculadoras' },
}

const gate = useState<'unknown' | 'needed' | 'done'>('nu:onb-gate', () => 'unknown')
const seguraNewsletter = useState(NEWSLETTER_SEGURA_ONBOARDING, () => 0)
const dispensado = useState('nu:onb-dispensado', () => false)
// A folha de cadastro (CadastroFolha, 21/10/2026) faz as mesmas perguntas no
// fim do cadastro: enquanto ela está aberta, este modal não abre por cima.
// Se a pessoa fechar a folha antes de responder, o gate volta a valer aqui.
const naFolha = useState<boolean>('nu:onb-na-folha', () => false)
const open = ref(false)
const step = ref<1 | 2 | 3>(1)
const goal = ref<string | null>(null)
const saving = ref(false)
const saveError = ref('')

const cardRef = ref<HTMLElement | null>(null)
useModalA11y(cardRef, open)

function podeAbrir() {
  return gate.value === 'needed' && seguraNewsletter.value === 0 && !dispensado.value
}
function dispensar() {
  dispensado.value = true
  open.value = false
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') dispensar()
}
watch(open, (o) => {
  if (!import.meta.client) return
  document.documentElement.style.overflow = o ? 'hidden' : ''
  if (o) document.addEventListener('keydown', onKey)
  else document.removeEventListener('keydown', onKey)
})
watch(seguraNewsletter, (n) => {
  if (n > 0) open.value = false
})
onBeforeUnmount(() => {
  if (!import.meta.client) return
  document.removeEventListener('keydown', onKey)
  document.documentElement.style.overflow = ''
})

async function check() {
  // Folha de cadastro, visitante, /login e /business: o modal não abre.
  if (naFolha.value || !isAuthenticated.value || onboardingForaDaRota(route.path)) {
    open.value = false
    return
  }
  if (gate.value !== 'unknown') {
    open.value = podeAbrir()
    return
  }
  try {
    // null = sem resposta (rede ou token morto) → mesma saída do catch
    const me = await meCliente.load()
    if (!me?.user || me.user.investor_goal) {
      gate.value = 'done'
    } else {
      // sem resposta de investidor: só abre se NÃO for conta de escritório
      const biz = await authFetch<BusinessAccountStatus>('/me/business', {}, { redirectOnAuthError: false })
      gate.value = biz?.has_account ? 'done' : 'needed'
    }
  } catch {
    gate.value = 'done' // sem resposta do servidor, não bloqueia o app
  }
  open.value = podeAbrir()
}
onMounted(() => {
  void check()
  // Registrado no mount, não no setup: no HIT da borda a sessão é assumida
  // logo antes deste onMounted (app.vue), e um watcher do setup veria essa
  // virada como login e chamaria o /auth/me pela 2ª vez.
  watch(isAuthenticated, (v) => {
    if (v) {
      gate.value = 'unknown'
      void check()
    } else {
      open.value = false
    }
  })
})
// quem ENTROU por /login ou /business/* (gate nem rodou) é avaliado ao
// navegar pra qualquer outra página
watch(() => route.path, () => {
  if (seguraNewsletter.value > 0) {
    open.value = false
    return
  }
  if (dispensado.value) return
  // Sempre check(): /login, /business e a folha de cadastro continuam de fora.
  // O ramo que fazia open = true pulava essas exceções.
  if (gate.value === 'unknown') void check()
  else void check()
})
// a folha de cadastro fechou: respondeu lá (gate 'done') ou saiu antes (vale aqui)
watch(naFolha, (v) => {
  if (!v && isAuthenticated.value) void check()
})

function pickGoal(v: string) {
  goal.value = v
  step.value = 2
}
async function pickExp(v: string) {
  if (saving.value) return
  saving.value = true
  saveError.value = ''
  try {
    await authFetch('/auth/profile', {
      method: 'PUT',
      body: { investor_goal: goal.value, investor_experience: v },
    })
    gate.value = 'done'
    step.value = 3
  } catch {
    saveError.value = 'Não conseguimos salvar agora. Confira sua conexão e toque de novo na opção.'
  } finally {
    saving.value = false
  }
}
const done = computed(() => DONE[goal.value ?? ''] ?? DONE['acompanhar-carteira']!)
async function finish(navigate: boolean) {
  open.value = false
  if (navigate) await navigateTo(done.value.to)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="nob" role="presentation" @click.self="dispensar">
      <div
        ref="cardRef" class="nob__card" role="dialog" aria-modal="true"
        aria-labelledby="nob-title" tabindex="-1"
      >
        <button type="button" class="nob__x" aria-label="Fechar" @click="dispensar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <p class="nob__eyebrow">Sua Redentia</p>

        <template v-if="step === 1">
          <h2 id="nob-title" class="nob__title">O que te trouxe aqui?</h2>
          <p class="nob__dek">Uma resposta — a Redentia se organiza em volta dela.</p>
          <div class="nob__opts">
            <button v-for="o in GOALS" :key="o.value" type="button" class="nob__opt" @click="pickGoal(o.value)">
              <span class="nob__opt-label">{{ o.label }}</span>
              <span class="nob__opt-desc">{{ o.desc }}</span>
            </button>
          </div>
        </template>

        <template v-else-if="step === 2">
          <h2 id="nob-title" class="nob__title">Qual sua experiência com investimentos?</h2>
          <p class="nob__dek">Ajusta o tom das explicações.</p>
          <div class="nob__opts">
            <button
              v-for="o in EXPS" :key="o.value" type="button" class="nob__opt"
              :disabled="saving" @click="pickExp(o.value)"
            >
              <span class="nob__opt-label">{{ saving ? 'Salvando…' : o.label }}</span>
              <span class="nob__opt-desc">{{ o.desc }}</span>
            </button>
          </div>
          <p v-if="saveError" class="nob__error">{{ saveError }}</p>
          <button type="button" class="nob__back" :disabled="saving" @click="step = 1">Voltar</button>
        </template>

        <template v-else>
          <h2 id="nob-title" class="nob__title">Pronto{{ firstName ? `, ${firstName}` : '' }}.</h2>
          <p class="nob__dek nob__dek--done">{{ done.line }}</p>
          <div class="nob__ctas">
            <button type="button" class="nob__cta" @click="finish(true)">{{ done.cta }}</button>
            <button type="button" class="nob__ghost" @click="finish(false)">Ficar por aqui</button>
          </div>
        </template>

        <div v-if="step < 3" class="nob__dots" aria-hidden="true">
          <i :class="{ 'nob__dot--on': step === 1 }" class="nob__dot" />
          <i :class="{ 'nob__dot--on': step === 2 }" class="nob__dot" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.nob {
  /* acima dos modais Nu (9999: dia, briefing, aporte, raio-X do ETF): é o
     gate obrigatório, então cobre qualquer um que abra junto com ele */
  position: fixed; inset: 0; z-index: 10000;
  display: flex; align-items: center; justify-content: center;
  padding: 18px;
  background: var(--nu-day-backdrop);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  animation: nu-fade .25s ease both;
}
.nob__card {
  position: relative;
  width: min(600px, 100%); max-height: calc(100dvh - 36px); overflow-y: auto;
  background: var(--nu-day-card); border-radius: var(--nu-r-card-lg);
  padding: 40px 42px 34px; box-shadow: var(--nu-shadow-day-modal);
  outline: none; animation: nu-fade .3s ease both;
}
.nob__x {
  position: absolute; top: 16px; right: 16px; z-index: 1;
  width: 40px; height: 40px; border-radius: 50%; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  background: var(--nu-cream-2); color: var(--nu-navy); font-family: inherit;
  transition: background .15s;
}
.nob__x:hover { background: var(--nu-cream-hover); }
.nob__x:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.nob__eyebrow { margin: 0; padding-right: 48px; color: var(--nu-blue-text); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase; }
.nob__title { margin: 9px 0 0; padding-right: 48px; color: var(--nu-ink); font-size: clamp(24px, 3.4vw, 30px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; }
.nob__dek { margin: 8px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.45; }
.nob__dek--done { font-size: var(--nu-fs-lg); }

.nob__opts { margin-top: 22px; display: flex; flex-direction: column; gap: 10px; }
.nob__opt {
  display: flex; flex-direction: column; gap: 3px; text-align: left;
  padding: 15px 18px; border: 1.5px solid var(--nu-cream-2); border-radius: var(--nu-r-tile);
  background: var(--nu-white); cursor: pointer; font-family: inherit;
  transition: border-color .15s, background .15s, transform .15s;
}
.nob__opt:hover { border-color: var(--nu-blue); background: var(--nu-blue-tint-2); transform: translateY(-1px); }
.nob__opt:disabled { opacity: 0.6; cursor: default; transform: none; }
.nob__opt-label { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; letter-spacing: -0.01em; }
.nob__opt-desc { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }

.nob__error { margin: 14px 0 0; color: var(--nu-red-text); font-size: var(--nu-fs-sm); font-weight: 700; }
.nob__back {
  margin-top: 16px; align-self: flex-start; border: none; background: transparent;
  padding: 4px 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 700;
  cursor: pointer; font-family: inherit;
}
.nob__back:hover { color: var(--nu-ink); }

.nob__ctas { margin-top: 24px; display: flex; flex-direction: column; gap: 10px; }
.nob__cta {
  display: flex; align-items: center; justify-content: center;
  padding: 15px 24px; border: none; border-radius: var(--nu-r-pill);
  background: var(--nu-blue); color: var(--nu-white);
  font-size: var(--nu-fs-md); font-weight: 800; cursor: pointer; font-family: inherit;
  transition: background .2s;
}
.nob__cta:hover { background: var(--nu-blue-hover); }
.nob__ghost {
  display: flex; align-items: center; justify-content: center;
  padding: 12px 24px; border: none; border-radius: var(--nu-r-pill);
  background: transparent; color: var(--nu-gray-2);
  font-size: var(--nu-fs-sm); font-weight: 700; cursor: pointer; font-family: inherit;
  transition: background .15s;
}
.nob__ghost:hover { background: var(--nu-cream-hover); color: var(--nu-ink); }

.nob__dots { margin-top: 24px; display: flex; gap: 6px; justify-content: center; }
.nob__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--nu-cream-3); }
.nob__dot--on { background: var(--nu-blue); }

@media (max-width: 760px) {
  .nob { padding: 12px; align-items: flex-end; }
  .nob__card { padding: 28px 22px 24px; border-radius: var(--nu-r-card); }
  .nob__x { top: 12px; right: 12px; }
}
</style>
