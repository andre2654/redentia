<!--
  MoleculesOnboardingNameModal — modal hard-block pos-magic-link.

  QUANDO ABRE:
  - Apos login via magic link, se o user nao tem nome OU se URL tem
    `?onboarding=true`. BLOQUEIA o resto da app ate o nome ser
    preenchido — nao tem skip, nao fecha pelo backdrop, nao fecha
    com Esc.

  USADO EM:
  - default.vue (layout authenticated) — mount global se onboarding=true
  - /wallet (?onboarding=true)

  COMPORTAMENTO:
  - Mostra 1 campo "Como podemos te chamar?"
  - Submit → PUT /auth/profile { name } → fecha
  - Sem skip — usuario tem que preencher pra continuar
  - Apos submit, remove `?onboarding=true` da URL

  POR QUE NAO PEDE NOME NO SIGNUP:
  Magic link puro = 1 campo (email). Pedir nome no signup tira o ganho
  do passwordless. Padrao Linear/Cal.com/Notion: pega nome DEPOIS do
  primeiro login, quando user ja viu valor.

  POR QUE NAO TEM "AGORA NAO":
  Sem nome, varios componentes do shell ficam num estado intermediario
  (sidebar de patrimonio, header personalizado, emails de reset). Em
  vez de tratar todos os casos `name=null`, tratamos um so: bloqueia
  ate preencher. Single source of truth.
-->
<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  /** Modal fechado apos submit bem-sucedido. Parent remove ?onboarding= da URL. */
  close: []
}>()

const authStore = useAuthStore()
const { updateProfile } = useAuthService()

const name = ref('')
const submitting = ref(false)
const error = ref('')

const canSubmit = computed(() => name.value.trim().length >= 2 && !submitting.value)

async function save() {
  if (!canSubmit.value) return
  submitting.value = true
  error.value = ''

  try {
    await updateProfile({ name: name.value.trim() })
    await authStore.fetchProfile()
    emit('close')
  }
  catch (err: unknown) {
    const apiError = err as { data?: { message?: string } }
    error.value = apiError?.data?.message
      || (err instanceof Error ? err.message : 'Não foi possível salvar. Tente novamente.')
  }
  finally {
    submitting.value = false
  }
}

// Body scroll lock while open
watch(() => props.open, (next) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = next ? 'hidden' : ''
})

// Bloqueia Escape — modal e hard-block, fechar com Esc deixaria o
// usuario num estado sem nome (que e exatamente o que estamos
// evitando). Soft-cancel a tecla; nao previne se o foco ja saiu
// do modal por algum motivo (failsafe).
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) {
    e.preventDefault()
    e.stopPropagation()
  }
}

watch(() => props.open, (next) => {
  if (typeof document === 'undefined') return
  if (next) {
    document.addEventListener('keydown', onKeydown, { capture: true })
  } else {
    document.removeEventListener('keydown', onKeydown, { capture: true })
  }
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', onKeydown, { capture: true })
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="onb-modal">
      <div
        v-if="open"
        class="onb"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onb-title"
      >
        <div class="onb__backdrop" aria-hidden="true" />

        <div class="onb__card">
          <div class="onb__icon" aria-hidden="true">
            <UIcon name="i-lucide-user" class="size-7" />
          </div>

          <h2 id="onb-title" class="onb__title">
            Como podemos te chamar?
          </h2>
          <p class="onb__subtitle">
            Pra deixar sua experiência na Redent.IA mais pessoal.
          </p>

          <form class="onb__form" novalidate @submit.prevent="save">
            <input
              v-model="name"
              type="text"
              class="onb__input"
              placeholder="Seu nome"
              autocomplete="name"
              autofocus
              required
            >

            <p v-if="error" class="onb__error" role="alert">
              {{ error }}
            </p>

            <button
              type="submit"
              class="onb__btn-primary"
              :disabled="!canSubmit"
            >
              <UIcon
                v-if="submitting"
                name="i-lucide-loader-2"
                class="size-4 motion-safe:animate-spin"
                aria-hidden="true"
              />
              <span>{{ submitting ? 'Salvando…' : 'Continuar' }}</span>
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.onb {
  position: fixed;
  inset: 0;
  z-index: 9050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.onb__backdrop {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--bg-base) 75%, rgba(0, 0, 0, 0.65));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.onb__card {
  position: relative;
  width: 100%;
  max-width: 420px;
  padding: 32px 24px;
  border-radius: 18px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  text-align: center;
  box-shadow:
    0 32px 80px -24px color-mix(in srgb, var(--brand-primary) 28%, transparent),
    0 16px 40px -12px rgba(0, 0, 0, 0.32);
}

.onb__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
  margin-bottom: 12px;
}

.onb__title {
  font-family: var(--brand-font);
  font-size: 22px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--text-heading);
  margin: 0 0 6px;
}

.onb__subtitle {
  font-size: 13px;
  line-height: 1.45;
  color: var(--text-muted);
  margin: 0 0 20px;
}

.onb__form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.onb__input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1.5px solid var(--border-subtle);
  background: var(--bg-base);
  color: var(--text-heading);
  font-family: var(--brand-font);
  /* 16px font-size previne auto-zoom no Safari iOS */
  font-size: 16px;
  letter-spacing: -0.005em;
  transition: border-color 150ms, box-shadow 150ms;
}

.onb__input::placeholder {
  color: var(--text-muted);
  opacity: 0.7;
}

.onb__input:focus {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 22%, transparent);
}

.onb__error {
  font-size: 12px;
  line-height: 1.4;
  color: var(--brand-negative, #dc2626);
  background: color-mix(in srgb, var(--brand-negative, #dc2626) 8%, transparent);
  padding: 8px 10px;
  border-radius: 8px;
  margin: 0;
  text-align: left;
}

.onb__btn-primary {
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

.onb__btn-primary:hover:not(:disabled) {
  filter: brightness(0.94);
  transform: translateY(-1px);
}

.onb__btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.onb__btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  filter: grayscale(0.3);
  box-shadow: none;
}

/* Transitions */
.onb-modal-enter-active,
.onb-modal-leave-active {
  transition: opacity 220ms ease;
}
.onb-modal-enter-active .onb__card,
.onb-modal-leave-active .onb__card {
  transition: transform 240ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
.onb-modal-enter-from,
.onb-modal-leave-to {
  opacity: 0;
}
.onb-modal-enter-from .onb__card,
.onb-modal-leave-to .onb__card {
  transform: translateY(20px);
}

@media (prefers-reduced-motion: reduce) {
  .onb-modal-enter-active,
  .onb-modal-leave-active,
  .onb-modal-enter-active .onb__card,
  .onb-modal-leave-active .onb__card {
    transition: none;
  }
}
</style>
