<!--
  MoleculesRaioXSoftGate — soft gate compacto com email signup.

  ESTRATEGIA (atualizada 2026-05-05):
  Versao anterior tinha preview blureado de KPIs/calendar/events embaixo.
  Mas agora que /raio-x mostra de graca: Hero + AI Insights + Asset Deep
  Dive, o preview ficou REDUNDANTE (nao havia "mais conteudo escondido"
  pra teasear). Reduzido pra um card focado no email form.

  USADO EM:
  /raio-x?tickers=... apos AI Insights + Asset Deep Dive, antes do
  Assessor CTA. So renderiza pra usuario nao-autenticado.

  EMAIL SIGNUP (passwordless):
  - 1 input (email) + botao "Continuar"
  - Submit chama magicLinkRequest com redirect_to="/wallet?from=raiox"
  - Apos email enviado, mostra "Verifique seu email"
  - User clica no link -> /auth/magic-link/verify -> /wallet?onboarding=true
-->
<script setup lang="ts">
import type { PortfolioReport } from '~/composables/usePortfolioScore'

defineProps<{
  report: PortfolioReport
}>()

const brand = useBrand()
const { magicLinkRequest } = useAuthService()
const { track } = useMetaPixel()

// ============ STATE ============
const email = ref('')
const submitting = ref(false)
const formError = ref('')
const linkSent = ref(false)
const resendCooldown = ref(0)
let cooldownTimer: ReturnType<typeof setInterval> | null = null

const canSubmit = computed(
  () => email.value.trim().includes('@')
    && email.value.trim().length > 4
    && !submitting.value,
)

function startCooldown(seconds = 30) {
  resendCooldown.value = seconds
  if (cooldownTimer) clearInterval(cooldownTimer)
  cooldownTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 1000)
}

onBeforeUnmount(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})

// ============ MAGIC LINK REQUEST ============
async function handleSubmit() {
  if (!canSubmit.value) return
  submitting.value = true
  formError.value = ''

  try {
    await magicLinkRequest({
      email: email.value.trim().toLowerCase(),
      redirect_to: '/wallet?from=raiox',
    })

    track('Lead', {
      content_name: 'Raio-X Soft Gate Magic Link',
      content_category: 'raio_x_soft_gate',
      currency: 'BRL',
      value: 5,
    })

    linkSent.value = true
    startCooldown(30)
  }
  catch (err: unknown) {
    const apiError = err as { data?: { message?: string } }
    formError.value
      = apiError?.data?.message
      || (err instanceof Error ? err.message : 'Erro ao enviar link. Tente novamente.')
  }
  finally {
    submitting.value = false
  }
}

async function resendLink() {
  if (resendCooldown.value > 0) return
  await handleSubmit()
}
</script>

<template>
  <section class="rx-gate">
    <!-- Estado 1: form de email -->
    <div v-if="!linkSent" class="rx-gate__card">
      <div class="rx-gate__icon" aria-hidden="true">
        <UIcon
          name="i-lucide-lock-keyhole-open"
          class="size-7"
          :style="{ color: brand.colors.primary }"
        />
      </div>

      <h3 class="rx-gate__title">
        Cadastra grátis pra acompanhar tudo
      </h3>
      <p class="rx-gate__subtitle">
        Sem senha. Sem cartão. Só email.
      </p>

      <ul class="rx-gate__bullets">
        <li>
          <UIcon name="i-lucide-check" class="size-4" :style="{ color: brand.colors.primary }" />
          Sua carteira monitorada todos os dias
        </li>
        <li>
          <UIcon name="i-lucide-check" class="size-4" :style="{ color: brand.colors.primary }" />
          Alertas de mudanças nos seus ativos
        </li>
        <li>
          <UIcon name="i-lucide-check" class="size-4" :style="{ color: brand.colors.primary }" />
          Acesso à plataforma completa
        </li>
      </ul>

      <form class="rx-gate__form" novalidate @submit.prevent="handleSubmit">
        <input
          v-model="email"
          type="email"
          class="rx-gate__input"
          placeholder="voce@exemplo.com"
          autocomplete="email"
          inputmode="email"
          spellcheck="false"
          autocapitalize="none"
          required
        >
        <button
          type="submit"
          class="rx-gate__submit"
          :disabled="!canSubmit"
        >
          <UIcon
            v-if="submitting"
            name="i-lucide-loader-2"
            class="size-4 motion-safe:animate-spin"
            aria-hidden="true"
          />
          <span>{{ submitting ? 'Enviando…' : 'Continuar' }}</span>
          <UIcon
            v-if="!submitting"
            name="i-lucide-arrow-right"
            class="size-4"
            aria-hidden="true"
          />
        </button>
      </form>

      <p v-if="formError" class="rx-gate__error" role="alert">
        {{ formError }}
      </p>

      <p class="rx-gate__legal">
        Te mandamos um link mágico. Sem senha pra criar.
      </p>
    </div>

    <!-- Estado 2: link enviado -->
    <div v-else class="rx-gate__card">
      <div class="rx-gate__icon" aria-hidden="true">
        <UIcon
          name="i-lucide-mail-check"
          class="size-7"
          :style="{ color: brand.colors.primary }"
        />
      </div>

      <h3 class="rx-gate__title">
        Link enviado pro seu e-mail
      </h3>
      <p class="rx-gate__subtitle">
        Mandamos um link de acesso pra <strong>{{ email }}</strong>
      </p>

      <ul class="rx-gate__bullets rx-gate__bullets--hints">
        <li>
          <UIcon name="i-lucide-clock" class="size-4" :style="{ color: brand.colors.primary }" />
          O link expira em 15 minutos
        </li>
        <li>
          <UIcon name="i-lucide-search" class="size-4" :style="{ color: brand.colors.primary }" />
          Não chegou? Verifique a pasta de spam
        </li>
      </ul>

      <button
        type="button"
        class="rx-gate__submit rx-gate__submit--ghost"
        :disabled="resendCooldown > 0 || submitting"
        @click="resendLink"
      >
        <UIcon name="i-lucide-rotate-cw" class="size-4" aria-hidden="true" />
        <span>
          {{ resendCooldown > 0 ? `Reenviar em ${resendCooldown}s` : 'Reenviar link' }}
        </span>
      </button>

      <button
        type="button"
        class="rx-gate__back-link"
        @click="linkSent = false"
      >
        Usar outro e-mail
      </button>
    </div>
  </section>
</template>

<style scoped>
.rx-gate {
  display: flex;
  justify-content: center;
  padding: 32px 0;
}

.rx-gate__card {
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 36px 32px;
  border-radius: 22px;
  background: var(--bg-elevated);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 22%, var(--border-subtle));
  box-shadow:
    0 32px 80px -28px color-mix(in srgb, var(--brand-primary) 28%, transparent),
    0 12px 32px -16px rgba(0, 0, 0, 0.18);
}

.rx-gate__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  margin-bottom: 14px;
}

.rx-gate__title {
  font-family: var(--brand-font);
  font-size: 22px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--text-heading);
  margin: 0 0 6px;
  text-wrap: balance;
}

@media (min-width: 768px) {
  .rx-gate__title { font-size: 26px; }
}

.rx-gate__subtitle {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-muted);
  margin: 0 0 20px;
}

.rx-gate__subtitle strong {
  color: var(--text-heading);
  font-weight: 600;
}

.rx-gate__bullets {
  list-style: none;
  margin: 0 0 22px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 360px;
  text-align: left;
}

.rx-gate__bullets li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  line-height: 1.45;
  color: var(--text-body);
}

.rx-gate__bullets--hints li {
  color: var(--text-muted);
}

.rx-gate__bullets li :first-child {
  flex-shrink: 0;
  margin-top: 2px;
}

.rx-gate__form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

@media (min-width: 600px) {
  .rx-gate__form {
    flex-direction: row;
  }
  .rx-gate__form .rx-gate__input { flex: 1; }
}

.rx-gate__input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1.5px solid var(--border-subtle);
  background: var(--bg-base);
  color: var(--text-heading);
  font-family: var(--brand-font);
  /* 16px previne auto-zoom no Safari iOS */
  font-size: 16px;
  letter-spacing: -0.005em;
  transition: border-color 150ms, box-shadow 150ms;
}

.rx-gate__input::placeholder {
  color: var(--text-muted);
  opacity: 0.7;
}

.rx-gate__input:focus {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 22%, transparent);
}

.rx-gate__submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 22px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: 0;
  font-family: var(--brand-font);
  background: var(--brand-primary);
  color: #fff;
  transition: filter 180ms, transform 120ms, opacity 180ms;
  box-shadow: 0 8px 22px -10px color-mix(in srgb, var(--brand-primary) 55%, transparent);
}

.rx-gate__submit:hover:not(:disabled) {
  filter: brightness(0.94);
  transform: translateY(-1px);
}

.rx-gate__submit:active:not(:disabled) {
  transform: translateY(0);
}

.rx-gate__submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  filter: grayscale(0.3);
}

.rx-gate__submit--ghost {
  background: transparent;
  color: var(--brand-primary);
  border: 1.5px solid color-mix(in srgb, var(--brand-primary) 35%, transparent);
  box-shadow: none;
  width: 100%;
}

.rx-gate__submit--ghost:hover:not(:disabled) {
  background: color-mix(in srgb, var(--brand-primary) 6%, transparent);
  border-color: var(--brand-primary);
}

.rx-gate__error {
  font-size: 12px;
  color: var(--brand-negative, #dc2626);
  background: color-mix(in srgb, var(--brand-negative, #dc2626) 8%, transparent);
  padding: 8px 10px;
  border-radius: 8px;
  margin: 12px 0 0;
  text-align: left;
  width: 100%;
}

.rx-gate__legal {
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-muted);
  margin: 14px 0 0;
}

.rx-gate__back-link {
  background: transparent;
  border: 0;
  cursor: pointer;
  padding: 8px;
  font-family: var(--brand-font);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  transition: color 150ms;
  margin-top: 8px;
}

.rx-gate__back-link:hover {
  color: var(--text-heading);
}
</style>
