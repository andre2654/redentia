<!--
  MoleculesPhoneGateModal — gate de telefone que aparece quando o
  usuario tenta acessar o chat (/help) sem ter cadastrado um numero.

  Por que existe: o produto vai exigir confirmacao via WhatsApp pra
  liberar acesso ao chat (anti-fraude + canal de alertas). Em vez de
  bloquear na pagina toda, abrimos um modal in-place que coleta o
  numero e fecha quando o usuario salva — depois disso ele continua
  no /help normalmente.

  UX:
    - Aparece automaticamente quando o componente monta com
      `:open="true"`. Sem botao de fechar (gate obrigatorio); o user
      sai voltando pelo browser ou clicando em outro link da sidebar.
    - Input com mascara `+55 (##) # ####-####` (mesma usada em
      /settings).
    - Submit chama updateProfile e fecha. Backend ja aceita celular
      via /auth/profile PUT (services/auth.ts updateProfile).
    - Mensagem-chave: "Vamos enviar um codigo no WhatsApp pra
      confirmar". O envio real do codigo vira numa proxima iteracao;
      por agora salvar o numero ja e suficiente pro gate.
-->
<script setup lang="ts">
// vMaska e auto-resolvido via Vue 3 quando importado no `<script setup>`.
// Sem esse import, o `v-maska="'+55 (##) # ####-####'"` no template
// vira no-op (input fica sem mascara).
import { vMaska } from 'maska/vue'

const props = withDefaults(defineProps<{
  open: boolean
}>(), {
  open: false,
})

const emit = defineEmits<{
  close: []
  /** Disparado depois que o numero salva com sucesso. */
  saved: []
}>()

const authStore = useAuthStore()
const { updateProfile } = useAuthService()

const celular = ref('')
const submitting = ref(false)
const errorMsg = ref<string | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)

watch(() => props.open, (next) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = next ? 'hidden' : ''
  if (next) {
    nextTick(() => inputEl.value?.focus())
  }
})
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})

async function onSubmit() {
  errorMsg.value = null
  const cleaned = celular.value.replace(/\D/g, '')
  if (cleaned.length < 10) {
    errorMsg.value = 'Digite o número completo, com DDD.'
    return
  }
  submitting.value = true
  try {
    const normalized = '+' + cleaned
    const resp = (await updateProfile({ celular: normalized })) as {
      user?: { id?: string | number; name?: string; email?: string; celular?: string }
      data?: { user?: unknown }
    }
    const user = resp?.user ?? (resp as any)?.data?.user
    if (user) authStore.setMeFromUser(user as any)
    emit('saved')
    emit('close')
  }
  catch (e: any) {
    const msg = e?.data?.message ?? e?.message ?? 'Não foi possível salvar o telefone agora.'
    errorMsg.value = String(msg)
  }
  finally {
    submitting.value = false
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !submitting.value) {
    e.preventDefault()
    onSubmit()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="phone-gate">
      <div
        v-if="open"
        class="phone-gate"
        role="dialog"
        aria-modal="true"
        aria-labelledby="phone-gate-title"
        @keydown="onKeydown"
      >
        <div class="phone-gate__backdrop" aria-hidden="true" />

        <div class="phone-gate__dialog">
          <!-- WhatsApp icon — usa o lucide message-circle pra ficar
               sutil. Coloquei um glow amber atrás pra dar peso visual
               sem ficar carnavalesco. -->
          <div class="phone-gate__icon-wrap" aria-hidden="true">
            <span class="phone-gate__icon-glow" />
            <UIcon name="i-lucide-message-circle" class="phone-gate__icon size-7" />
          </div>

          <p class="phone-gate__eyebrow">CONFIRMAÇÃO POR WHATSAPP</p>
          <h2 id="phone-gate-title" class="phone-gate__title">
            Antes de abrir o chat, confirme seu número.
          </h2>
          <p class="phone-gate__lead">
            Vamos enviar um código pelo <strong>WhatsApp</strong> pra confirmar que é você. Isso libera o chat e ativa alertas críticos da sua carteira.
          </p>

          <form class="phone-gate__form" @submit.prevent="onSubmit">
            <label class="phone-gate__label" for="phone-gate-input">Seu WhatsApp</label>
            <input
              id="phone-gate-input"
              ref="inputEl"
              v-model="celular"
              v-maska="'+55 (##) # ####-####'"
              type="tel"
              autocomplete="tel"
              inputmode="tel"
              placeholder="+55 (00) 0 0000-0000"
              class="phone-gate__input"
              :disabled="submitting"
            >
            <p v-if="errorMsg" class="phone-gate__error">{{ errorMsg }}</p>

            <button
              type="submit"
              class="phone-gate__submit"
              :disabled="submitting || celular.replace(/\D/g, '').length < 10"
            >
              <UIcon v-if="submitting" name="i-lucide-loader-2" class="size-4 animate-spin" aria-hidden="true" />
              <UIcon v-else name="i-lucide-sparkles" class="size-4" aria-hidden="true" />
              <span>{{ submitting ? 'Salvando…' : 'Continuar para o chat' }}</span>
            </button>
          </form>

          <p class="phone-gate__fineprint">
            Seu número é privado. Usamos só para confirmar acesso e enviar alertas que você ativar.
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.phone-gate {
  position: fixed;
  inset: 0;
  z-index: 9200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.phone-gate__backdrop {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--bg-base) 65%, rgba(0, 0, 0, 0.55));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.phone-gate__dialog {
  position: relative;
  width: 100%;
  max-width: 460px;
  padding: 32px 28px 24px;
  border-radius: 18px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-elevated);
  box-shadow:
    0 32px 80px -24px color-mix(in srgb, var(--brand-primary) 28%, transparent),
    0 16px 40px -12px rgba(0, 0, 0, 0.32);
  text-align: center;
}

.phone-gate__icon-wrap {
  position: relative;
  width: 56px;
  height: 56px;
  margin: 0 auto 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.phone-gate__icon-glow {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 28%, transparent) 0%, transparent 70%);
  filter: blur(8px);
}

.phone-gate__icon {
  position: relative;
  color: var(--brand-primary);
}

.phone-gate__eyebrow {
  font-family: var(--brand-font);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--brand-primary);
  margin-bottom: 8px;
}

.phone-gate__title {
  font-size: 24px;
  font-weight: 300;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--text-heading);
  margin-bottom: 10px;
}

.phone-gate__lead {
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-body);
  margin-bottom: 22px;
}

.phone-gate__lead strong {
  color: var(--text-heading);
  font-weight: 600;
}

.phone-gate__form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
  margin-bottom: 16px;
}

.phone-gate__label {
  font-family: var(--brand-font);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.phone-gate__input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-base);
  color: var(--text-heading);
  font-size: 15px;
  font-family: var(--brand-font);
  outline: none;
  transition: border-color 160ms, box-shadow 160ms;
}

.phone-gate__input:focus {
  border-color: var(--brand-primary);
  box-shadow: var(--shadow-ring-focus);
}

.phone-gate__input::placeholder {
  color: var(--text-muted);
}

.phone-gate__input:disabled {
  opacity: 0.6;
}

.phone-gate__error {
  font-size: 12px;
  color: var(--brand-negative);
  margin: -2px 0 0;
}

.phone-gate__submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 6px;
  padding: 13px 20px;
  border-radius: 999px;
  border: 0;
  background: var(--brand-primary);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  font-family: var(--brand-font);
  cursor: pointer;
  transition: filter 180ms, transform 120ms, box-shadow 180ms;
  box-shadow: 0 8px 22px -10px color-mix(in srgb, var(--brand-primary) 55%, transparent);
}

.phone-gate__submit:hover:not(:disabled) {
  filter: brightness(0.94);
  transform: translateY(-1px);
}

.phone-gate__submit:active:not(:disabled) {
  transform: translateY(0);
}

.phone-gate__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.phone-gate__fineprint {
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-muted);
}

/* Transitions */
.phone-gate-enter-active,
.phone-gate-leave-active {
  transition: opacity 220ms ease;
}
.phone-gate-enter-active .phone-gate__dialog,
.phone-gate-leave-active .phone-gate__dialog {
  transition: transform 240ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
.phone-gate-enter-from,
.phone-gate-leave-to {
  opacity: 0;
}
.phone-gate-enter-from .phone-gate__dialog,
.phone-gate-leave-to .phone-gate__dialog {
  transform: translateY(20px);
}

@media (prefers-reduced-motion: reduce) {
  .phone-gate-enter-active,
  .phone-gate-leave-active,
  .phone-gate-enter-active .phone-gate__dialog,
  .phone-gate-leave-active .phone-gate__dialog {
    transition: none;
  }
}
</style>
