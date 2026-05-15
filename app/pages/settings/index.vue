<!--
  /settings — surface autenticada de configuracoes da conta.

  Padrao visual segue o mesmo da /settings/integracoes:
    - hero com eyebrow + H1 (font-light, clamp(28-36)) + subtitle
    - blocos por secao com eyebrow proprio + titulo
    - cards usando tokens var(--brand-*) (anti-flash em SSR)
    - max-width 980px, padding 24px, gap 24-28px

  Secoes:
    1. Perfil (nome / telefone / senha)
    2. Vinculo com assessor (se nao for advisor)
    3. Conta de assessor (codigo / virar assessor)
    4. Integracoes Open Finance (link pra /settings/integracoes)

  SEO:
    noindex,nofollow — pagina autenticada.
-->
<template>
  <NuxtLayout title="Configurações">
    <div class="set-page">
      <!-- Hero header -->
      <header class="set-header">
        <span class="set-eyebrow">Sua conta</span>
        <h1 class="set-title">Configurações</h1>
        <p class="set-subtitle">
          Gerencie seu perfil, sua segurança de acesso, vínculos com assessores e
          integrações da carteira em um único lugar.
        </p>
        <div class="set-trust">
          <span class="set-trust__item">
            <UIcon name="i-lucide-shield-check" class="size-3.5" aria-hidden="true" />
            Dados criptografados
          </span>
          <span class="set-trust__dot" aria-hidden="true">·</span>
          <span class="set-trust__item">
            <UIcon name="i-lucide-lock" class="size-3.5" aria-hidden="true" />
            Senha sob seu controle
          </span>
          <span class="set-trust__dot" aria-hidden="true">·</span>
          <span class="set-trust__item">
            <UIcon name="i-lucide-user-check" class="size-3.5" aria-hidden="true" />
            Vínculos rastreáveis
          </span>
        </div>
      </header>

      <!-- Perfil -->
      <section class="set-section">
        <div class="set-section__head">
          <span class="set-section__eyebrow">Perfil</span>
          <h2 class="set-section__title">Suas informações</h2>
          <p class="set-section__subtitle">
            Nome de exibição, contato e credenciais de acesso.
          </p>
        </div>
        <div class="set-card">
          <MoleculesSettingsProfile />
        </div>
      </section>

      <!-- Vínculo com assessor (apenas para investidores) -->
      <section v-if="authStore.me?.role !== 'advisor'" class="set-section">
        <div class="set-section__head">
          <span class="set-section__eyebrow">Vínculos</span>
          <h2 class="set-section__title">Assessor de investimentos</h2>
          <p class="set-section__subtitle">
            Tem o código do seu assessor? Vincule a conta para que ele possa te acompanhar.
          </p>
        </div>
        <div class="set-card">
          <MoleculesSettingsAttachAdvisor />
        </div>
      </section>

      <!-- Conta de assessor -->
      <section class="set-section">
        <div class="set-section__head">
          <span class="set-section__eyebrow">Profissional</span>
          <h2 class="set-section__title">
            {{ isAdvisor ? 'Sua conta de assessor' : 'Tornar-me assessor' }}
          </h2>
          <p class="set-section__subtitle">
            {{
              isAdvisor
                ? 'Compartilhe seu código com investidores e gerencie aprovações na área do assessor.'
                : 'Vire assessor, receba investidores vinculados e acompanhe carteiras na área profissional.'
            }}
          </p>
        </div>
        <div class="set-card">
          <MoleculesSettingsBecomeAdvisor />
        </div>
      </section>

      <!-- Plano (assinatura) — só renderiza se tenant tem billing on -->
      <section v-if="showBillingSection" class="set-section">
        <div class="set-section__head">
          <span class="set-section__eyebrow">Assinatura</span>
          <h2 class="set-section__title">Seu plano</h2>
          <p class="set-section__subtitle">
            <template v-if="planLabel">
              Você está no plano <strong>{{ planLabel }}</strong><template v-if="trialDaysLabel"> · {{ trialDaysLabel }}</template>.
            </template>
            <template v-else>
              Você ainda não tem uma assinatura ativa.
            </template>
          </p>
        </div>
        <NuxtLink to="/settings/gerenciar-plano" class="set-link-card">
          <span class="set-link-card__icon" aria-hidden="true">
            <UIcon name="i-lucide-credit-card" class="size-5" />
          </span>
          <span class="set-link-card__copy">
            <span class="set-link-card__title">
              <template v-if="planLabel">Gerenciar plano</template>
              <template v-else>Escolher um plano</template>
            </span>
            <span class="set-link-card__subtitle">
              <template v-if="planLabel">
                Trocar de plano, atualizar pagamento, baixar recibos ou cancelar assinatura.
              </template>
              <template v-else>
                Veja os planos Pro e Max e comece com 7 dias grátis no Pro.
              </template>
            </span>
          </span>
          <UIcon name="i-lucide-arrow-right" class="set-link-card__arrow" aria-hidden="true" />
        </NuxtLink>
      </section>

      <!-- Integrações Open Finance (link para /settings/integracoes) -->
      <section class="set-section">
        <div class="set-section__head">
          <span class="set-section__eyebrow">Open Finance</span>
          <h2 class="set-section__title">Integrações bancárias</h2>
          <p class="set-section__subtitle">
            Conecte corretoras e bancos para sincronização automática da carteira.
          </p>
        </div>
        <NuxtLink to="/settings/integracoes" class="set-link-card">
          <span class="set-link-card__icon" aria-hidden="true">
            <UIcon name="i-lucide-link-2" class="size-5" />
          </span>
          <span class="set-link-card__copy">
            <span class="set-link-card__title">Gerenciar integrações</span>
            <span class="set-link-card__subtitle">
              Conecte ou desconecte corretoras via Open Finance. Suas credenciais nunca
              passam pela Redentia, tudo regulado pelo Banco Central.
            </span>
          </span>
          <UIcon name="i-lucide-arrow-right" class="set-link-card__arrow" aria-hidden="true" />
        </NuxtLink>
      </section>

      <!-- Preferências da plataforma -->
      <section class="set-section">
        <div class="set-section__head">
          <span class="set-section__eyebrow">Preferências</span>
          <h2 class="set-section__title">Plataforma</h2>
          <p class="set-section__subtitle">
            Comportamento da interface. Mudanças aplicam na hora.
          </p>
        </div>
        <div class="set-card set-pref-card">
          <button
            type="button"
            class="set-pref"
            role="switch"
            :aria-checked="interfaceStore.aiCursorEnabled"
            @click="interfaceStore.toggleAiCursor()"
          >
            <span class="set-pref__icon" aria-hidden="true">
              <UIcon name="i-lucide-mouse-pointer-2" class="size-5" />
            </span>
            <span class="set-pref__copy">
              <span class="set-pref__title">Assistente de cursor</span>
              <span class="set-pref__desc">
                Pare o mouse sobre qualquer parte da plataforma por 1 segundo
                pra abrir um chat contextual. Funciona só em desktop.
              </span>
            </span>
            <span
              class="set-pref__toggle"
              :data-on="interfaceStore.aiCursorEnabled"
              aria-hidden="true"
            >
              <span class="set-pref__toggle-thumb" />
            </span>
          </button>
        </div>
      </section>

      <!-- Sair (sessão) -->
      <section class="set-section">
        <div class="set-section__head">
          <span class="set-section__eyebrow">Sessão</span>
          <h2 class="set-section__title">Encerrar sessão</h2>
          <p class="set-section__subtitle">
            Faz logout neste dispositivo. Você pode entrar novamente a qualquer momento.
          </p>
        </div>
        <div class="set-card set-card--quiet">
          <button type="button" class="set-logout" @click="onLogout">
            <UIcon name="i-lucide-log-out" class="size-4" aria-hidden="true" />
            <span>Sair da conta</span>
          </button>
        </div>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  hideInstallAppBanner: true,
})

usePageSeo({
  title: 'Configurações | Redentia',
  description: 'Gerencie seu perfil, segurança, vínculos com assessores e integrações Open Finance.',
  path: '/settings',
  robots: 'noindex,nofollow',
})

const authStore = useAuthStore()
const interfaceStore = useInterfaceStore()
const router = useRouter()
const ent = useEntitlements()

const isAdvisor = computed(() => authStore.me?.role === 'advisor')

// ===== Billing summary =====
// Renderiza so se tenant tem billing.enabled=true. Em tenants
// gratuitos (white-label sem cobranca), a section some.
onMounted(() => {
  ent.refresh()
})

const showBillingSection = computed(() => ent.isBillingEnabled())

const planLabel = computed(() => {
  const slug = ent.planSlug()
  if (!slug || slug === 'unlimited') return null
  return slug.charAt(0).toUpperCase() + slug.slice(1)
})

const trialDaysLabel = computed(() => {
  if (ent.subscriptionStatus() !== 'trialing') return null
  const days = ent.trialDaysRemaining()
  if (days === null) return null
  if (days <= 0) return 'trial expira hoje'
  if (days === 1) return '1 dia restante de trial'
  return `${days} dias restantes de trial`
})

async function onLogout() {
  try {
    await authStore.logout()
  } catch (e) {
    // logout local mesmo se backend falhar
    console.warn('[settings] logout error', e)
  }
  await router.push('/login')
}
</script>

<style scoped>
.set-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 24px 24px 64px;
  width: 100%;
}

/* ============ HEADER ============ */
.set-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 18px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 40%, transparent);
}

.set-eyebrow {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--brand-primary);
}

.set-title {
  font-family: var(--brand-font);
  font-weight: 300;
  font-size: clamp(28px, 4vw, 36px);
  line-height: 1.05;
  letter-spacing: -0.025em;
  color: var(--text-heading, var(--brand-text));
  margin: 0;
}

.set-subtitle {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  max-width: 620px;
}

.set-trust {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  font-size: 11.5px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.set-trust__item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.set-trust__dot {
  opacity: 0.5;
}

/* ============ SECTION ============ */
.set-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.set-section__head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 2px;
}

.set-section__eyebrow {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.set-section__title {
  font-family: var(--brand-font);
  font-weight: 400;
  font-size: 17px;
  line-height: 1.25;
  letter-spacing: -0.012em;
  color: var(--brand-text);
  margin: 0;
}

.set-section__subtitle {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

/* ============ CARD ============ */
.set-card {
  border-radius: 22px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
  background: color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background));
  overflow: hidden;
  transition: border-color 180ms;
}

.set-card:hover {
  border-color: color-mix(in srgb, var(--brand-border) 70%, transparent);
}

.set-card--quiet {
  background: color-mix(in srgb, var(--brand-surface) 35%, var(--brand-background));
}

/* ============ LINK CARD (integrações) ============ */
.set-link-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 22px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
  background: color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background));
  text-decoration: none;
  color: inherit;
  transition: border-color 180ms, transform 120ms, background 180ms;
}

.set-link-card:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 45%, transparent);
  background: color-mix(in srgb, var(--brand-surface) 65%, var(--brand-background));
  transform: translateY(-1px);
}

.set-link-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  color: var(--brand-primary);
  flex-shrink: 0;
}

.set-link-card__copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.set-link-card__title {
  font-size: 14px;
  font-weight: 500;
  color: var(--brand-text);
  letter-spacing: -0.005em;
}

.set-link-card__subtitle {
  font-size: 12.5px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

.set-link-card__arrow {
  width: 16px;
  height: 16px;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  flex-shrink: 0;
  transition: transform 180ms, color 180ms;
}

.set-link-card:hover .set-link-card__arrow {
  color: var(--brand-primary);
  transform: translateX(2px);
}

/* ============ PREFERÊNCIA TOGGLE ============ */
.set-pref-card {
  padding: 0;
}
.set-pref {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 18px 20px;
  background: transparent;
  border: none;
  border-radius: inherit;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  color: inherit;
  transition: background 150ms ease-out;
}
.set-pref:hover {
  background: var(--bg-overlay);
}
.set-pref:focus-visible {
  outline: none;
  box-shadow: var(--shadow-ring-focus);
}
.set-pref__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  color: var(--brand-primary);
  flex-shrink: 0;
}
.set-pref__copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}
.set-pref__title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-heading);
  letter-spacing: -0.005em;
}
.set-pref__desc {
  font-size: 12px;
  line-height: 1.45;
  color: var(--text-muted);
}
.set-pref__toggle {
  position: relative;
  width: 38px;
  height: 22px;
  border-radius: 9999px;
  background: var(--bg-overlay);
  border: 1px solid var(--border-default);
  flex-shrink: 0;
  transition: background 200ms ease-out, border-color 200ms ease-out;
}
.set-pref__toggle[data-on='true'] {
  background: color-mix(in srgb, var(--brand-primary) 70%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 80%, transparent);
}
.set-pref__toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background: var(--bg-elevated);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.set-pref__toggle[data-on='true'] .set-pref__toggle-thumb {
  transform: translateX(16px);
  background: #fff;
}

/* ============ LOGOUT ============ */
.set-logout {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  margin: 18px;
  border-radius: 11px;
  border: 1px solid color-mix(in srgb, var(--brand-negative, #dc2626) 35%, transparent);
  background: color-mix(in srgb, var(--brand-negative, #dc2626) 6%, transparent);
  color: var(--brand-negative, #dc2626);
  font-family: var(--brand-font);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.005em;
  cursor: pointer;
  transition: background 180ms, border-color 180ms, transform 120ms;
}

.set-logout:hover {
  background: color-mix(in srgb, var(--brand-negative, #dc2626) 12%, transparent);
  border-color: color-mix(in srgb, var(--brand-negative, #dc2626) 55%, transparent);
  transform: translateY(-1px);
}

/* ============ MOBILE ============ */
@media (max-width: 640px) {
  .set-page {
    padding: 16px 14px 56px;
    gap: 22px;
  }

  .set-link-card {
    padding: 14px 16px;
  }

  .set-link-card__icon {
    width: 36px;
    height: 36px;
  }
}
</style>
