<!--
  /admin/comunicacoes/new — type picker.

  Em vez de jogar o admin direto num form gigante, ele primeiro
  escolhe O QUE quer criar. Cada tipo tem um card grande com:
    - Icon + nome
    - Descricao do que faz
    - Quando usar (use case)
    - Mini preview animado de como vai parecer pro user
    - Posicao tipica

  Click cria draft (POST com title='Nova {tipo}') e redireciona pro
  editor com o tipo ja preenchido.
-->
<template>
  <NuxtLayout name="admin-panel">
    <div class="mx-auto flex max-w-6xl flex-col gap-8">
      <!-- Back -->
      <NuxtLink to="/admin/comunicacoes" class="back-link">
        <UIcon name="i-lucide-chevron-left" class="size-3.5" />
        Comunicações
      </NuxtLink>

      <!-- Header -->
      <header class="flex flex-col gap-2">
        <span class="eyebrow">Nova campanha</span>
        <h1 class="display-h1">
          O que você quer criar?
        </h1>
        <p class="lead">
          Escolha o formato. Cada tipo aparece em um lugar diferente da plataforma e tem um propósito específico.
        </p>
      </header>

      <!-- Type cards -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="t in types"
          :key="t.value"
          type="button"
          class="type-card"
          :disabled="creating === t.value"
          @click="onPick(t.value)"
        >
          <!-- Mini preview animado -->
          <div class="type-card__preview" :style="{ background: t.bgGradient }">
            <component :is="t.preview" />
          </div>

          <!-- Body -->
          <div class="type-card__body">
            <div class="type-card__head">
              <span class="type-card__icon" :style="{ background: `${t.color}1f`, color: t.color }">
                <UIcon :name="t.icon" class="size-4" />
              </span>
              <span class="type-card__title">{{ t.title }}</span>
            </div>
            <p class="type-card__desc">{{ t.description }}</p>
            <div class="type-card__use-case">
              <span class="type-card__use-case-label">Quando usar</span>
              <p class="type-card__use-case-text">{{ t.useCase }}</p>
            </div>
            <div class="type-card__cta">
              <UIcon
                v-if="creating === t.value"
                name="i-lucide-loader-2"
                class="size-3.5 motion-safe:animate-spin"
              />
              <UIcon v-else name="i-lucide-arrow-right" class="size-3.5 type-card__arrow" />
              {{ creating === t.value ? 'Criando...' : 'Criar ' + t.title.toLowerCase() }}
            </div>
          </div>
        </button>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { h } from 'vue'
import type { CommunicationType } from '~/services/communications'

definePageMeta({ middleware: ['admin-panel'] })

const router = useRouter()
const service = useAdminCommunicationsService()
const creating = ref<CommunicationType | null>(null)

// =================================================================
// Mini-previews (functional components inline pra cada tipo).
// Sao SVGs simples que dao a "vibe" do tipo sem renderizar o
// componente completo (que precisaria de muita prop fake).
// =================================================================

const PreviewBanner = () =>
  h('div', { class: 'preview-banner' }, [
    h('div', { class: 'preview-banner__bar' }, [
      h('div', { class: 'preview-banner__dot' }),
      h('div', { class: 'preview-banner__line preview-banner__line--w50' }),
      h('div', { class: 'preview-banner__cta' }),
    ]),
    h('div', { class: 'preview-banner__page' }),
  ])

const PreviewAnnouncement = () =>
  h('div', { class: 'preview-feed' }, [
    h('div', { class: 'preview-feed__row' }, [
      h('div', { class: 'preview-feed__pulse' }),
      h('div', { class: 'preview-feed__line preview-feed__line--w70' }),
    ]),
    h('div', { class: 'preview-feed__row' }, [
      h('div', { class: 'preview-feed__pulse preview-feed__pulse--small' }),
      h('div', { class: 'preview-feed__line preview-feed__line--w60' }),
    ]),
    h('div', { class: 'preview-feed__row' }, [
      h('div', { class: 'preview-feed__pulse preview-feed__pulse--small' }),
      h('div', { class: 'preview-feed__line preview-feed__line--w80' }),
    ]),
  ])

const PreviewCta = () =>
  h('div', { class: 'preview-cta' }, [
    h('div', { class: 'preview-cta__card' }, [
      h('div', { class: 'preview-cta__line preview-cta__line--w70' }),
      h('div', { class: 'preview-cta__line preview-cta__line--w50' }),
      h('div', { class: 'preview-cta__btn' }),
    ]),
  ])

const PreviewModal = () =>
  h('div', { class: 'preview-modal' }, [
    h('div', { class: 'preview-modal__backdrop' }),
    h('div', { class: 'preview-modal__card' }, [
      h('div', { class: 'preview-modal__line preview-modal__line--w60' }),
      h('div', { class: 'preview-modal__line preview-modal__line--w90' }),
      h('div', { class: 'preview-modal__btn' }),
    ]),
  ])

const PreviewPoll = () =>
  h('div', { class: 'preview-poll' }, [
    h('div', { class: 'preview-poll__line preview-poll__line--w70' }),
    h('div', { class: 'preview-poll__opt preview-poll__opt--active' }, [
      h('div', { class: 'preview-poll__opt-fill', style: { width: '70%' } }),
    ]),
    h('div', { class: 'preview-poll__opt' }, [
      h('div', { class: 'preview-poll__opt-fill', style: { width: '30%' } }),
    ]),
    h('div', { class: 'preview-poll__opt' }, [
      h('div', { class: 'preview-poll__opt-fill', style: { width: '15%' } }),
    ]),
  ])

const PreviewNotification = () =>
  h('div', { class: 'preview-notification' }, [
    h('div', { class: 'preview-notification__bell' }, [
      h('div', { class: 'preview-notification__badge' }),
    ]),
    h('div', { class: 'preview-notification__drawer' }, [
      h('div', { class: 'preview-notification__item preview-notification__item--unread' }, [
        h('div', { class: 'preview-notification__dot' }),
        h('div', { class: 'preview-notification__line preview-notification__line--w70' }),
      ]),
      h('div', { class: 'preview-notification__item' }, [
        h('div', { class: 'preview-notification__line preview-notification__line--w60' }),
      ]),
    ]),
  ])

const PreviewEmail = () =>
  h('div', { class: 'preview-email' }, [
    h('div', { class: 'preview-email__envelope' }, [
      h('div', { class: 'preview-email__line preview-email__line--w50' }),
      h('div', { class: 'preview-email__line preview-email__line--w80' }),
      h('div', { class: 'preview-email__line preview-email__line--w70' }),
      h('div', { class: 'preview-email__line preview-email__line--w60' }),
    ]),
  ])

// =================================================================
// Lista de tipos
// =================================================================
interface TypeOption {
  value: CommunicationType
  title: string
  icon: string
  color: string
  bgGradient: string
  description: string
  useCase: string
  preview: () => any
}

const types: TypeOption[] = [
  {
    value: 'banner',
    title: 'Banner',
    icon: 'i-lucide-flag',
    color: '#3b82f6',
    bgGradient: 'linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0.04) 100%)',
    description: 'Faixa fina sticky no topo da plataforma.',
    useCase: 'Manutenções programadas, novidades importantes, avisos urgentes que precisam de atenção mas não devem bloquear o uso.',
    preview: PreviewBanner,
  },
  {
    value: 'announcement',
    title: 'Comunicado',
    icon: 'i-lucide-megaphone',
    color: '#8b5cf6',
    bgGradient: 'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.04) 100%)',
    description: 'Item no feed colapsável de novidades.',
    useCase: 'Releases de features, posts editoriais, conteúdo que vale a pena divulgar mas o usuário pode ler quando quiser.',
    preview: PreviewAnnouncement,
  },
  {
    value: 'cta',
    title: 'CTA contextual',
    icon: 'i-lucide-mouse-pointer-click',
    color: 'var(--brand-warning)',
    bgGradient: 'linear-gradient(135deg, color-mix(in srgb, var(--brand-warning) 18%, transparent) 0%, color-mix(in srgb, var(--brand-warning) 4%, transparent) 100%)',
    description: 'Card com chamada pra ação em pontos estratégicos.',
    useCase: 'Conversão de feature, promoções, upgrade pra MAX, convite pra conectar Open Finance, ações que aumentam engajamento.',
    preview: PreviewCta,
  },
  {
    value: 'modal',
    title: 'Modal',
    icon: 'i-lucide-square-stack',
    color: '#06b6d4',
    bgGradient: 'linear-gradient(135deg, rgba(6,182,212,0.18) 0%, rgba(6,182,212,0.04) 100%)',
    description: 'Popup centralizado com overlay.',
    useCase: 'Anúncios importantes que merecem interromper o fluxo, onboarding, mudanças de termos, comemorações.',
    preview: PreviewModal,
  },
  {
    value: 'poll',
    title: 'Enquete',
    icon: 'i-lucide-bar-chart-3',
    color: '#ec4899',
    bgGradient: 'linear-gradient(135deg, rgba(236,72,153,0.18) 0%, rgba(236,72,153,0.04) 100%)',
    description: 'Modal com opções pra usuário votar.',
    useCase: 'Pesquisa de produto ("qual feature falta?"), priorização, NPS, feedback rápido. Resultado agregado fica disponível.',
    preview: PreviewPoll,
  },
  {
    value: 'notification',
    title: 'Notificação',
    icon: 'i-lucide-bell',
    color: '#a855f7',
    bgGradient: 'linear-gradient(135deg, rgba(168,85,247,0.18) 0%, rgba(168,85,247,0.04) 100%)',
    description: 'Aparece num inbox/sino com badge de unread.',
    useCase: 'Avisos personalizados pra um user ou lista (suporte, alerta de carteira, lembrete de tarefa). Não interrompe, o usuário lê quando quiser.',
    preview: PreviewNotification,
  },
  {
    value: 'email',
    title: 'Email broadcast',
    icon: 'i-lucide-mail',
    color: 'var(--brand-positive)',
    bgGradient: 'linear-gradient(135deg, color-mix(in srgb, var(--brand-positive) 18%, transparent) 0%, color-mix(in srgb, var(--brand-positive) 4%, transparent) 100%)',
    description: 'Email enviado pra inbox dos usuários.',
    useCase: 'Newsletter mensal, anúncios fora da plataforma, lembretes de tarefas, recapturar usuários inativos.',
    preview: PreviewEmail,
  },
]

// =================================================================
// Pick handler — cria draft e redireciona pro editor
// =================================================================
async function onPick(type: CommunicationType) {
  if (creating.value) return
  creating.value = type
  try {
    const created = await service.create({
      type,
      status: 'draft',
      title: defaultTitle(type),
      // placement default por tipo (depois admin pode mudar)
      placement: defaultPlacement(type),
      target_audience: 'authenticated',
      dismissible: true,
      poll_options: type === 'poll'
        ? [
            { id: 'opt-1', label: 'Opção 1' },
            { id: 'opt-2', label: 'Opção 2' },
          ]
        : null,
    })
    router.push(`/admin/comunicacoes/${created.id}`)
  } catch (e: any) {
    showErrorNotification('Erro', e?.data?.message ?? 'Falha ao criar rascunho')
    creating.value = null
  }
}

function defaultTitle(type: CommunicationType): string {
  return ({
    banner: 'Novo banner',
    announcement: 'Novo comunicado',
    cta: 'Nova chamada',
    modal: 'Novo modal',
    poll: 'Nova enquete',
    email: 'Novo email',
    notification: 'Nova notificação',
  } as const)[type]
}

function defaultPlacement(type: CommunicationType) {
  return ({
    banner: 'top',
    announcement: 'feed',
    cta: 'wallet-hero',
    modal: 'modal',
    poll: 'modal',
    email: null,
    notification: 'inbox',
  } as const)[type]
}
</script>

<style scoped>
.eyebrow {
  font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace;
  font-feature-settings: 'tnum' 1;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--brand-primary);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  width: fit-content;
  transition: color 150ms;
}
.back-link:hover { color: color-mix(in srgb, var(--brand-text) 85%, transparent); }

.display-h1 {
  font-family: var(--brand-font);
  font-weight: 300;
  font-size: clamp(28px, 4vw, 36px);
  line-height: 1.05;
  letter-spacing: -0.025em;
  color: color-mix(in srgb, var(--brand-text) 95%, transparent);
  margin: 0;
}

.lead {
  margin: 0;
  max-width: 620px;
  font-size: 14px;
  line-height: 1.6;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

/* ============ TYPE CARD ============ */
.type-card {
  display: flex;
  flex-direction: column;
  text-align: left;
  background: color-mix(in srgb, var(--brand-text) 2%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 200ms, transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 200ms;
}

.type-card:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--brand-text) 18%, transparent);
  transform: translateY(-3px);
  box-shadow: 0 18px 38px -18px rgba(0, 0, 0, 0.5);
}

.type-card:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.type-card:hover:not(:disabled) .type-card__arrow {
  transform: translateX(3px);
}

/* Mini-preview area */
.type-card__preview {
  height: 110px;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
}

/* Body */
.type-card__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 18px 14px;
}

.type-card__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.type-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 7px;
}

.type-card__title {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.012em;
  color: color-mix(in srgb, var(--brand-text) 95%, transparent);
}

.type-card__desc {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
}

.type-card__use-case {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 9px 11px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  border: 1px dashed color-mix(in srgb, var(--brand-text) 8%, transparent);
}

.type-card__use-case-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}

.type-card__use-case-text {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
}

.type-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--brand-primary);
}

.type-card__arrow {
  transition: transform 220ms;
}

/* ============ PREVIEW: BANNER ============ */
:deep(.preview-banner) {
  position: relative;
  height: 100%;
  padding: 8px;
}
:deep(.preview-banner__bar) {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 9px;
  border-radius: 6px;
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.15) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  margin-bottom: 8px;
  animation: slide-in 0.6s ease-out;
}
:deep(.preview-banner__dot) {
  width: 6px; height: 6px; border-radius: 999px; background: #3b82f6;
  flex-shrink: 0;
}
:deep(.preview-banner__line) {
  height: 5px; border-radius: 2px; background: color-mix(in srgb, var(--brand-text) 40%, transparent);
  flex: 1;
}
:deep(.preview-banner__line--w50) { max-width: 50%; }
:deep(.preview-banner__cta) {
  width: 28px; height: 12px; border-radius: 3px;
  background: #3b82f6;
  flex-shrink: 0;
}
:deep(.preview-banner__page) {
  height: 50px; border-radius: 5px;
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
}

@keyframes slide-in {
  0% { transform: translateY(-100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

/* ============ PREVIEW: ANNOUNCEMENT ============ */
:deep(.preview-feed) {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  height: 100%;
  justify-content: center;
}
:deep(.preview-feed__row) {
  display: flex;
  align-items: center;
  gap: 8px;
}
:deep(.preview-feed__pulse) {
  width: 8px; height: 8px; border-radius: 999px;
  background: #8b5cf6;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15);
  animation: feed-pulse 2s ease-in-out infinite;
  flex-shrink: 0;
}
:deep(.preview-feed__pulse--small) {
  background: rgba(139, 92, 246, 0.35);
  box-shadow: none;
  animation: none;
}
:deep(.preview-feed__line) {
  height: 6px; border-radius: 2px;
  background: color-mix(in srgb, var(--brand-text) 18%, transparent);
  flex: 1;
}
:deep(.preview-feed__line--w70) { max-width: 70%; }
:deep(.preview-feed__line--w60) { max-width: 60%; }
:deep(.preview-feed__line--w80) { max-width: 80%; }
@keyframes feed-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.85); }
}

/* ============ PREVIEW: CTA ============ */
:deep(.preview-cta) {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}
:deep(.preview-cta__card) {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 11px 13px;
  border-radius: 9px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--brand-warning) 22%, transparent) 0%, color-mix(in srgb, var(--brand-warning) 4%, transparent) 100%);
  border: 1px solid color-mix(in srgb, var(--brand-warning) 40%, transparent);
}
:deep(.preview-cta__line) {
  height: 6px; border-radius: 2px;
  background: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
:deep(.preview-cta__line--w70) { max-width: 70%; }
:deep(.preview-cta__line--w50) { max-width: 50%; }
:deep(.preview-cta__btn) {
  width: 70px; height: 18px; border-radius: 5px;
  background: linear-gradient(135deg, var(--brand-warning) 0%, #fbbf24 100%);
  margin-top: 2px;
  align-self: flex-start;
}

/* ============ PREVIEW: MODAL ============ */
:deep(.preview-modal) {
  height: 100%;
  position: relative;
  overflow: hidden;
}
:deep(.preview-modal__backdrop) {
  position: absolute; inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
}
:deep(.preview-modal__card) {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 11px 13px;
  border-radius: 8px;
  background: rgba(40, 44, 52, 0.95);
  border: 1px solid rgba(6, 182, 212, 0.4);
  animation: modal-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
:deep(.preview-modal__line) {
  height: 5px; border-radius: 2px;
  background: color-mix(in srgb, var(--brand-text) 40%, transparent);
}
:deep(.preview-modal__line--w60) { max-width: 60%; }
:deep(.preview-modal__line--w90) { max-width: 90%; }
:deep(.preview-modal__btn) {
  width: 50px; height: 16px; border-radius: 4px;
  background: #06b6d4;
  margin-top: 3px;
  align-self: flex-start;
}
@keyframes modal-pop {
  0% { transform: translate(-50%, -50%) scale(0.85); opacity: 0; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

/* ============ PREVIEW: POLL ============ */
:deep(.preview-poll) {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  height: 100%;
  justify-content: center;
}
:deep(.preview-poll__line) {
  height: 6px; border-radius: 2px;
  background: color-mix(in srgb, var(--brand-text) 40%, transparent);
  margin-bottom: 4px;
}
:deep(.preview-poll__line--w70) { max-width: 70%; }
:deep(.preview-poll__opt) {
  height: 14px; border-radius: 4px;
  background: rgba(236, 72, 153, 0.1);
  border: 1px solid rgba(236, 72, 153, 0.3);
  position: relative;
  overflow: hidden;
}
:deep(.preview-poll__opt-fill) {
  position: absolute; left: 0; top: 0; bottom: 0;
  background: linear-gradient(90deg, rgba(236, 72, 153, 0.4) 0%, rgba(236, 72, 153, 0.7) 100%);
  border-radius: 4px;
  animation: poll-grow 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
:deep(.preview-poll__opt--active) {
  border-color: rgba(236, 72, 153, 0.65);
}
@keyframes poll-grow {
  0% { width: 0 !important; }
}

/* ============ PREVIEW: EMAIL ============ */
:deep(.preview-email) {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
}
:deep(.preview-email__envelope) {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 5px;
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-positive) 30%, transparent);
  position: relative;
}
:deep(.preview-email__envelope::before) {
  content: '';
  position: absolute;
  top: -1px; left: -1px;
  width: 36px; height: 12px;
  background: color-mix(in srgb, var(--brand-positive) 60%, transparent);
  border-top-left-radius: 5px;
}
:deep(.preview-email__line) {
  height: 5px; border-radius: 2px;
  background: color-mix(in srgb, var(--brand-text) 25%, transparent);
}
:deep(.preview-email__line--w50) { max-width: 50%; }
:deep(.preview-email__line--w80) { max-width: 80%; }
:deep(.preview-email__line--w70) { max-width: 70%; }
:deep(.preview-email__line--w60) { max-width: 60%; }
</style>
