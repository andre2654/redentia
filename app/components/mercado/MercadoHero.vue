<script setup lang="ts">
// Hero da home `/`: proposta de valor (coluna esquerda) + card branco à
// direita. AUTH-AWARE (home única, 2026-07-13): anônimo vê o card de captura
// de e-mail (navega pra /login?email=<valor>, sem POST — contrato PR1) e a
// animação "Redentia lendo o mercado" (NuMarketReading, PR-R2); logado vê,
// no MESMO card branco (mesma moldura, layout do hero intacto), o
// mini-dashboard "Sua carteira hoje" (refinamento do dono, 2026-07-13):
// grid 2×2 de mini-cards creme (número forte + label pequena), cada um
// ancorando na seção real da /carteira. Estados do card (diretriz nº1):
//  - dashboard  logado + Open Finance com dado → mini-cards; KPI ausente →
//               mini-card some (o grid absorve), nunca número inventado
//  - connect    logado sem Open Finance → convite compacto de conexão
//  - animação   anônimo (intacta) OU logado com resumo indisponível/vazio —
//               fallback honesto quando não há nada real pra mostrar
import type { CarteiraResumoVM } from '~/types/carteira'

const props = defineProps<{
  /** resumo da carteira (só logado; null = anônimo/indisponível) */
  resumo?: CarteiraResumoVM | null
}>()

const { isAuthenticated, firstName } = useAuthState()
const email = ref('')
function submit() {
  const v = email.value.trim()
  navigateTo(v ? `/login?email=${encodeURIComponent(v)}` : '/login')
}

// máscara global de valores (mesmo toggle-olho da /carteira — só o KPI monetário)
const { hidden } = useHiddenValues()

interface DashCard {
  key: string
  value: string
  label: string
  to: string
  tone?: 'amber' | 'green'
  pill?: string
  pillTone?: 'green' | 'amber'
  check?: boolean
}

// Âncoras = ids REAIS das seções do CarteiraContent (rail PR-R6): #raio-x,
// #renda-passiva, #movimentacoes. Cada KPI só existe no VM quando a seção
// correspondente também renderiza (mesmos builders) → âncora nunca aponta
// pro vazio.
const dashCards = computed<DashCard[]>(() => {
  const r = props.resumo
  if (!isAuthenticated.value || !r || r.state !== 'patrimonio') return []
  const cards: DashCard[] = []
  if (r.proventos12m) {
    cards.push({
      key: 'proventos',
      value: hidden.value ? 'R$ ••••' : r.proventos12m,
      label: 'Proventos · últimos 12 meses',
      to: '/carteira#renda-passiva',
    })
  }
  if (r.score) {
    cards.push({
      key: 'score',
      value: `${r.score.val}/100`,
      pill: r.score.band,
      pillTone: r.score.tone,
      label: 'Score da carteira',
      to: '/carteira#raio-x',
    })
  }
  if (r.movCount != null && r.movLabel) {
    cards.push({
      key: 'mov',
      value: String(r.movCount),
      label: `Movimentações · ${r.movLabel}`,
      to: '/carteira#movimentacoes',
    })
  }
  if (r.atencao != null) {
    cards.push(r.atencao > 0
      ? {
          key: 'atencao',
          value: String(r.atencao),
          tone: 'amber',
          label: r.atencao === 1 ? 'Ponto de atenção no Raio-X' : 'Pontos de atenção no Raio-X',
          to: '/carteira#raio-x',
        }
      : {
          key: 'atencao',
          value: '',
          check: true,
          tone: 'green',
          label: 'Nenhum ponto de atenção',
          to: '/carteira#raio-x',
        })
  }
  return cards
})

// logado sem Open Finance → o card vira o convite compacto (mesmo padrão da
// banda MercadoSuaCarteira)
const showConnect = computed(() =>
  isAuthenticated.value && props.resumo?.state === 'connect')

// docText nasce em '1.240' (readN=0 → 1240+0, SSR-safe) e é espelhado pelo
// NuMarketReading via emit `doc` durante a animação (client).
const docText = ref('1.240')

// Eyebrow do logado = a data de hoje por extenso ("sábado, 13 de julho de
// 2026" — direção do dono). timeZone fixo em SP: o server roda em UTC e sem
// isso o SSR renderizava a data de AMANHÃ entre ~21h e meia-noite BRT
// (mismatch de hidratação por ~3h/dia).
const hojeExtenso = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  timeZone: 'America/Sao_Paulo',
}).format(new Date())
</script>

<template>
  <section class="mh">
    <div class="mh__cols">
      <div class="mh__left">
        <!-- logado vê a data de hoje; anônimo, a proposta de valor -->
        <div class="mh__eyebrow">{{ isAuthenticated ? hojeExtenso : 'O mercado, traduzido por IA' }}</div>
        <!-- logado: saudação com o primeiro nome (cookie nu:name, SSR sem
             flash; sem nome conhecido cai em "Olá." até o plugin hidratar) -->
        <h1 v-if="isAuthenticated" class="mh__title">Olá{{ firstName ? `, ${firstName}` : '' }}.</h1>
        <h1 v-else class="mh__title">Invista com uma<br>IA do seu lado.</h1>
        <div class="mh__dek">Análise fundamentalista pronta, alertas do que afeta a sua carteira e respostas na hora. Sem planilha, sem economês.</div>
        <!-- anônimo: captura de e-mail · logado: boas-vindas + CTA pra carteira -->
        <form v-if="!isAuthenticated" class="mh__card" @submit.prevent="submit">
          <div class="mh__card-title">Crie sua conta e comece agora</div>
          <input v-model="email" type="email" placeholder="Digite seu e-mail" class="mh__input" autocomplete="email">
          <button type="submit" class="mh__cta">
            Começar grátis<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
          </button>
          <div class="mh__micro">Grátis para começar · sem cartão de crédito</div>
        </form>
        <div v-else class="mh__welcome">
          <div class="mh__welcome-text">Bem-vindo de volta. O mercado de hoje já foi lido, e a sua carteira está a um clique.</div>
          <NuxtLink to="/carteira" class="mh__cta mh__cta--pill">
            Ver minha carteira<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
          </NuxtLink>
        </div>
      </div>

      <div class="mh__right">
        <div class="mh__anim">
          <!-- logado com dado: mini-dashboard "Sua carteira hoje" (2×2) -->
          <template v-if="dashCards.length">
            <div class="mh__anim-top">
              <div class="mh__anim-label">
                <span class="mh__anim-dot" aria-hidden="true" />
                <span class="mh__anim-title">Sua carteira hoje</span>
              </div>
            </div>
            <div class="mh__dash">
              <NuxtLink
                v-for="c in dashCards" :key="c.key" :to="c.to"
                class="mh__dcard"
              >
                <span class="mh__dcard-top">
                  <span v-if="c.check" class="mh__dcard-check" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11" /></svg>
                  </span>
                  <span v-else class="mh__dcard-value" :class="c.tone ? `mh__dcard-value--${c.tone}` : ''">{{ c.value }}</span>
                  <span v-if="c.pill" class="mh__dcard-pill" :class="`mh__dcard-pill--${c.pillTone}`">{{ c.pill }}</span>
                </span>
                <span class="mh__dcard-label" :class="{ 'mh__dcard-label--green': c.check }">{{ c.label }}</span>
              </NuxtLink>
            </div>
          </template>

          <!-- logado sem Open Finance: convite compacto (padrão MercadoSuaCarteira) -->
          <div v-else-if="showConnect" class="mh__dconnect">
            <div class="mh__dconnect-title">Conecte sua carteira.</div>
            <div class="mh__dconnect-dek">Conecte contas de qualquer banco ou corretora e a Redentia importa seus ativos automaticamente, sem planilha.</div>
            <NuxtLink to="/carteira" class="mh__cta mh__cta--pill">
              Conectar minha carteira<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
            </NuxtLink>
          </div>

          <!-- anônimo (intacto) OU logado com resumo indisponível: a animação -->
          <template v-else>
            <div class="mh__anim-top">
              <div class="mh__anim-label">
                <span class="mh__anim-dot" aria-hidden="true" />
                <span class="mh__anim-title">Redentia lendo o mercado</span>
              </div>
              <p class="mh__anim-docs">{{ docText }} documentos analisados</p>
            </div>
            <div class="mh__anim-mid">
              <NuMarketReading theme="light" @doc="docText = $event" />
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mh {
  --mh-pad: clamp(22px, 5.5vw, 80px);
  background: var(--nu-cream);
  padding: clamp(64px, 9vw, 120px) var(--mh-pad) clamp(60px, 8vw, 100px);
  animation: nu-fade .5s ease both;
}
.mh__cols { display: flex; gap: clamp(28px, 5vw, 72px); align-items: stretch; flex-wrap: wrap; }
.mh__left {
  flex: 1.1 1 460px; min-width: min(320px, 100%);
  display: flex; flex-direction: column; justify-content: center;
}
.mh__eyebrow { color: var(--nu-blue); font-size: clamp(17px, 1.6vw, 21px); font-weight: 800; letter-spacing: -.2px; }
.mh__title {
  margin: 16px 0 0; color: var(--nu-ink);
  font-size: clamp(44px, 5.4vw, 84px); font-weight: 800; letter-spacing: -0.045em; line-height: 1.0;
}
.mh__dek {
  color: var(--nu-gray); font-size: clamp(17px, 1.8vw, 21px); font-weight: 600;
  line-height: 1.55; margin-top: 24px; max-width: 640px;
}
.mh__card {
  background: var(--nu-white); border-radius: var(--nu-r-card); padding: 26px;
  max-width: 480px; margin-top: 44px; box-shadow: var(--nu-shadow-card);
}
.mh__card-title { color: var(--nu-ink); font-size: 17px; font-weight: 800; }
.mh__input {
  width: 100%; background: var(--nu-cream); border: none; outline: none;
  border-radius: var(--nu-r-input); padding: 16px 18px; color: var(--nu-ink);
  font-size: 16px; font-weight: 600; margin-top: 16px;
}
.mh__cta {
  display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%;
  background: var(--nu-blue); color: var(--nu-white); border: none; cursor: pointer;
  border-radius: var(--nu-r-pill); padding: 16px 24px; font-size: 16.5px; font-weight: 800;
  margin-top: 12px; transition: background .2s;
}
.mh__cta:hover { background: var(--nu-blue-hover); }
.mh__micro { color: var(--nu-gray); font-size: 13px; font-weight: 600; margin-top: 14px; }

/* bloco compacto de boas-vindas (logado) — ocupa o slot do card de signup */
.mh__welcome {
  background: var(--nu-white); border-radius: var(--nu-r-card); padding: 26px;
  max-width: 480px; margin-top: 44px; box-shadow: var(--nu-shadow-card);
}
.mh__welcome-text { color: var(--nu-ink); font-size: 17px; font-weight: 700; line-height: 1.5; }
.mh__cta--pill {
  display: inline-flex; width: auto; margin-top: 18px; padding: 14px 28px;
  border-radius: var(--nu-r-pill);
}
.mh__cta--pill:hover { color: var(--nu-white); }

/* card branco de leitura (substitui o orb + float cards) */
.mh__right { flex: 1 1 400px; min-width: min(320px, 100%); display: flex; }
.mh__anim {
  position: relative; flex: 1;
  background: var(--nu-white);
  border: 1px solid var(--nu-navy-06);
  border-radius: var(--nu-r-card-lg);
  box-shadow: var(--nu-shadow-read-card);
  overflow: hidden;
  display: flex; flex-direction: column;
  min-height: 400px;
}
.mh__anim-top { display: flex; flex-direction: column; gap: 8px; padding: 28px 30px 0; }
.mh__anim-label { display: inline-flex; align-items: center; gap: 12px; }
.mh__anim-dot {
  width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0;
  background: var(--nu-blue);
  animation: mh-read-pulse 1.5s ease-in-out infinite;
}
.mh__anim-title {
  color: var(--nu-ink);
  font-size: clamp(22px, 2.4vw, 30px); font-weight: 800;
  letter-spacing: -0.025em; line-height: 1.04;
}
.mh__anim-docs {
  margin: 0; padding-left: 24px;
  color: var(--nu-gray);
  font-size: clamp(13px, 1.4vw, 15.5px); font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.mh__anim-mid {
  /* NÃO posicionar: o overlay do brand do NuMarketReading precisa ancorar no
     .mh__anim (o card) pra cobrir o card inteiro no morph — ver contrato lá. */
  flex: 1; display: flex; align-items: center;
  padding: clamp(20px, 2.6vw, 32px) clamp(24px, 3vw, 34px) clamp(28px, 3.4vw, 38px);
}
@keyframes mh-read-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: .5; }
}

/* ——— mini-dashboard "Sua carteira hoje" (logado, mesma moldura do card) ——— */
.mh__dash {
  flex: 1; display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 12px; align-content: stretch;
  padding: clamp(20px, 2.6vw, 28px) clamp(24px, 3vw, 30px) clamp(24px, 3vw, 30px);
}
.mh__dcard {
  display: flex; flex-direction: column; justify-content: center; gap: 10px;
  background: var(--nu-cream); border-radius: var(--nu-r-panel);
  padding: clamp(16px, 1.8vw, 22px) clamp(16px, 1.9vw, 24px); min-height: 108px;
  transition: background .2s, transform .15s;
}
.mh__dcard:hover { background: var(--nu-cream-4); transform: translateY(-2px); }
.mh__dcard-top { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.mh__dcard-value {
  color: var(--nu-ink); font-size: clamp(24px, 2.2vw, 32px); font-weight: 800;
  letter-spacing: -.6px; line-height: 1; font-variant-numeric: tabular-nums;
}
.mh__dcard-value--amber { color: var(--nu-amber-text); }
.mh__dcard-value--green { color: var(--nu-green-2); }
.mh__dcard-check {
  width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
  background: var(--nu-green-bg); color: var(--nu-green-2);
  display: flex; align-items: center; justify-content: center;
}
.mh__dcard-pill {
  display: inline-flex; align-items: center; font-size: 12px; font-weight: 800;
  padding: 4px 11px; border-radius: var(--nu-r-pill); white-space: nowrap;
}
.mh__dcard-pill--green { background: var(--nu-green-bg); color: var(--nu-green-2); }
.mh__dcard-pill--amber { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
.mh__dcard-label { color: var(--nu-gray); font-size: 13px; font-weight: 700; line-height: 1.4; }
.mh__dcard-label--green { color: var(--nu-green-2); }

/* ——— convite compacto (logado sem Open Finance) ——— */
.mh__dconnect {
  flex: 1; display: flex; flex-direction: column; justify-content: center;
  padding: clamp(24px, 3vw, 34px) clamp(24px, 3.2vw, 36px);
}
.mh__dconnect-title {
  color: var(--nu-ink); font-size: clamp(26px, 2.6vw, 34px); font-weight: 800;
  letter-spacing: -0.035em; line-height: 1.05;
}
.mh__dconnect-dek {
  color: var(--nu-gray); font-size: 15.5px; font-weight: 600; line-height: 1.55;
  margin-top: 14px; max-width: 400px;
}

/* Mobile: o card encosta full-bleed (como o orb fazia antes) e ganha respiro. */
@media (max-width: 760px) {
  .mh { padding-bottom: 0; }
  .mh__right { margin-inline: calc(var(--mh-pad) * -1); }
  .mh__anim { border-radius: 0; border-left: none; border-right: none; min-height: 440px; }
}
</style>
