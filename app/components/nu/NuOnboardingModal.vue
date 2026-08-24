<script setup lang="ts">
// Onboarding obrigatório — decisão do dono (24/08): TODO usuário logado sem
// `investor_goal` responde antes de seguir, sem exceção e sem botão de
// fechar (o gate vale pra conta nova E pra base antiga; 427 de 428 usuários
// estavam sem a resposta porque o fluxo novo nunca perguntou).
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
import type { MeResponse } from '~/types/auth'

const { isAuthenticated, firstName } = useAuthState()
const { authFetch } = useApi()
const route = useRoute()

interface Opt { value: string; label: string; desc: string }
const GOALS: Opt[] = [
  { value: 'acompanhar-carteira', label: 'Acompanhar minha carteira', desc: 'Seu patrimônio, o dia e o porquê de cada movimento.' },
  { value: 'decidir-aportes', label: 'Decidir meus próximos aportes', desc: 'Teses, rankings e comparativos com dados.' },
  { value: 'aprender', label: 'Aprender a investir', desc: 'Guias passo a passo e o glossário em português claro.' },
  { value: 'ferramentas', label: 'Usar as ferramentas', desc: 'Calculadoras, raio-x de ETF e o MCP pra usar com IA.' },
]
const EXPS: Opt[] = [
  { value: 'iniciante', label: 'Estou começando', desc: 'Explica tudo, sem pressa.' },
  { value: 'intermediario', label: 'Já invisto', desc: 'Direto ao ponto, com contexto.' },
  { value: 'avancado', label: 'Invisto há anos', desc: 'Só o dado e a leitura.' },
]
// tela final por objetivo — a resposta precisa mudar o que vem depois,
// senão o usuário aprende que o modal era burocracia
const DONE: Record<string, { line: string; cta: string; to: string }> = {
  'acompanhar-carteira': { line: 'A página da carteira mostra o dia do seu dinheiro — conecte seus investimentos e a Redentia lê o resto.', cta: 'Ir pra minha carteira', to: '/carteira' },
  'decidir-aportes': { line: 'Comece pelas teses vivas da casa — cada uma com convicção, estudos diários e catalisadores.', cta: 'Ver as teses', to: '/teses' },
  'aprender': { line: 'A trilha começa no primeiro aporte e vai até o raio-x de ETF, passo a passo.', cta: 'Começar pelos guias', to: '/guias' },
  'ferramentas': { line: 'Juros compostos, preço-teto, aposentadoria — as contas prontas pra usar agora.', cta: 'Abrir as calculadoras', to: '/calculadoras' },
}

const gate = useState<'unknown' | 'needed' | 'done'>('nu:onb-gate', () => 'unknown')
const open = ref(false)
const step = ref<1 | 2 | 3>(1)
const goal = ref<string | null>(null)
const saving = ref(false)
const saveError = ref('')

const cardRef = ref<HTMLElement | null>(null)
useModalA11y(cardRef, open)
watch(open, (o) => {
  if (import.meta.client) document.documentElement.style.overflow = o ? 'hidden' : ''
})

async function check() {
  if (!isAuthenticated.value || route.path === '/login') return
  if (gate.value !== 'unknown') {
    open.value = gate.value === 'needed'
    return
  }
  try {
    const me = await authFetch<MeResponse>('/auth/me', {}, { redirectOnAuthError: false })
    gate.value = me?.user && !me.user.investor_goal ? 'needed' : 'done'
  } catch {
    gate.value = 'done' // sem resposta do servidor, não bloqueia o app
  }
  open.value = gate.value === 'needed'
}
onMounted(check)
watch(isAuthenticated, (v) => {
  if (v) {
    gate.value = 'unknown'
    void check()
  } else {
    open.value = false
  }
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
    <div v-if="open" class="nob" role="presentation">
      <div
        ref="cardRef" class="nob__card" role="dialog" aria-modal="true"
        aria-labelledby="nob-title" tabindex="-1"
      >
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
  /* acima do NuMcpPromo (9999): se o promo abrir primeiro (fetch do /me
     lento), o onboarding ainda cobre — e o promo re-tenta depois (.nob no
     busyContext dele) */
  position: fixed; inset: 0; z-index: 10000;
  display: flex; align-items: center; justify-content: center;
  padding: 18px;
  background: var(--nu-day-backdrop);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  animation: nu-fade .25s ease both;
}
.nob__card {
  width: min(600px, 100%); max-height: calc(100dvh - 36px); overflow-y: auto;
  background: var(--nu-day-card); border-radius: var(--nu-r-card-lg);
  padding: 40px 42px 34px; box-shadow: var(--nu-shadow-day-modal);
  outline: none; animation: nu-fade .3s ease both;
}
.nob__eyebrow { margin: 0; color: var(--nu-blue); font-size: 12px; font-weight: 800; letter-spacing: 1.6px; text-transform: uppercase; }
.nob__title { margin: 9px 0 0; color: var(--nu-ink); font-size: clamp(24px, 3.4vw, 30px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; }
.nob__dek { margin: 8px 0 0; color: var(--nu-gray-2); font-size: 15.5px; font-weight: 500; line-height: 1.45; }
.nob__dek--done { font-size: 17px; }

.nob__opts { margin-top: 22px; display: flex; flex-direction: column; gap: 10px; }
.nob__opt {
  display: flex; flex-direction: column; gap: 3px; text-align: left;
  padding: 15px 18px; border: 1.5px solid var(--nu-cream-2); border-radius: var(--nu-r-tile);
  background: var(--nu-white); cursor: pointer; font-family: inherit;
  transition: border-color .15s, background .15s, transform .15s;
}
.nob__opt:hover { border-color: var(--nu-blue); background: var(--nu-blue-tint-2); transform: translateY(-1px); }
.nob__opt:disabled { opacity: 0.6; cursor: default; transform: none; }
.nob__opt-label { color: var(--nu-ink); font-size: 16.5px; font-weight: 800; letter-spacing: -0.01em; }
.nob__opt-desc { color: var(--nu-gray); font-size: 13.5px; font-weight: 500; }

.nob__error { margin: 14px 0 0; color: var(--nu-red); font-size: 14px; font-weight: 700; }
.nob__back {
  margin-top: 16px; align-self: flex-start; border: none; background: transparent;
  padding: 4px 0; color: var(--nu-gray); font-size: 14px; font-weight: 700;
  cursor: pointer; font-family: inherit;
}
.nob__back:hover { color: var(--nu-ink); }

.nob__ctas { margin-top: 24px; display: flex; flex-direction: column; gap: 10px; }
.nob__cta {
  display: flex; align-items: center; justify-content: center;
  padding: 15px 24px; border: none; border-radius: var(--nu-r-pill);
  background: var(--nu-blue); color: var(--nu-white);
  font-size: 16px; font-weight: 800; cursor: pointer; font-family: inherit;
  transition: background .2s;
}
.nob__cta:hover { background: var(--nu-blue-hover); }
.nob__ghost {
  display: flex; align-items: center; justify-content: center;
  padding: 12px 24px; border: none; border-radius: var(--nu-r-pill);
  background: transparent; color: var(--nu-gray-2);
  font-size: 14.5px; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: background .15s;
}
.nob__ghost:hover { background: var(--nu-cream-hover); color: var(--nu-ink); }

.nob__dots { margin-top: 24px; display: flex; gap: 6px; justify-content: center; }
.nob__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--nu-cream-3); }
.nob__dot--on { background: var(--nu-blue); }

@media (max-width: 760px) {
  .nob { padding: 12px; align-items: flex-end; }
  .nob__card { padding: 28px 22px 24px; border-radius: var(--nu-r-card); }
}
</style>
