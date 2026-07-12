<script setup lang="ts">
// Formulário de contato da página /institucional/contact — portado da página
// antiga (Frontend/app/pages/institucional/contact.vue), reflowado no design Nu
// (campos boxed brancos, borda creme, foco azul, tokens --nu-*). Labels,
// placeholders, opções de assunto, textos de erro e do botão/sucesso são
// VERBATIM da página antiga (acentos restaurados).
//
// SEM BACKEND (a página antiga só simulava o envio com um setTimeout + toast).
// Para o submit NÃO quebrar, o destino é um `mailto:` pré-preenchido para
// suporte@redentia.com.br (mesmo endereço de suporte do design). Ao concluir,
// mostramos o painel de sucesso VERBATIM ("Mensagem enviada com sucesso!" /
// "Retornaremos seu contato em breve.").
const props = withDefaults(defineProps<{ supportEmail?: string }>(), {
  supportEmail: 'suporte@redentia.com.br',
})

// Assuntos VERBATIM da página antiga (label + value).
const subjectOptions = [
  { label: 'Suporte técnico', value: 'suporte' },
  { label: 'Dúvidas sobre planos', value: 'planos' },
  { label: 'Problemas de conexão', value: 'conexao' },
  { label: 'Sugestões de melhoria', value: 'sugestoes' },
  { label: 'Parcerias comerciais', value: 'parcerias' },
  { label: 'Outros assuntos', value: 'outros' },
]

const state = reactive({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  acceptTerms: false,
})

const errors = reactive<Record<string, string>>({})
const submitting = ref(false)
const done = ref(false)

// Máscara BR do telefone (mesma lógica do NuUnderlineInput do app).
function fmtPhone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}
function onPhone(e: Event) {
  const el = e.target as HTMLInputElement
  state.phone = fmtPhone(el.value)
}

// Validação com as MESMAS regras/mensagens (VERBATIM) do zod da página antiga.
function validate(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (state.name.trim().length < 2)
    errors.name = 'Nome deve ter pelo menos 2 caracteres'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim()))
    errors.email = 'Email inválido'
  if (!state.subject) errors.subject = 'Selecione um assunto'
  if (state.message.trim().length < 10)
    errors.message = 'Mensagem deve ter pelo menos 10 caracteres'
  if (!state.acceptTerms)
    errors.acceptTerms = 'Você deve aceitar os termos para continuar'
  return Object.keys(errors).length === 0
}

function mailtoHref(): string {
  const opt = subjectOptions.find((o) => o.value === state.subject)
  const subject = `[Contato Redentia] ${opt?.label ?? 'Contato'}`
  const lines = [
    `Nome: ${state.name}`,
    `Email: ${state.email}`,
    state.phone ? `Telefone: ${state.phone}` : '',
    '',
    state.message,
  ].filter((l) => l !== '')
  return `mailto:${props.supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`
}

function onSubmit() {
  if (!validate()) return
  submitting.value = true
  // Abre o cliente de e-mail do usuário com a mensagem pré-preenchida.
  // Não navega a página — apenas dispara o handler mailto.
  if (import.meta.client) window.location.href = mailtoHref()
  submitting.value = false
  done.value = true
}
</script>

<template>
  <div class="ctf">
    <!-- Painel de sucesso VERBATIM (substitui o toast da página antiga) -->
    <div v-if="done" class="ctf__done" role="status">
      <div class="ctf__done-title">Mensagem enviada com sucesso!</div>
      <div class="ctf__done-sub">Retornaremos seu contato em breve.</div>
    </div>

    <form v-else class="ctf__form" novalidate @submit.prevent="onSubmit">
      <!-- Nome -->
      <div class="ctf__field">
        <label class="ctf__label" for="ctf-name">Nome completo *</label>
        <input
          id="ctf-name"
          v-model="state.name"
          type="text"
          name="name"
          class="ctf__input"
          :class="{ 'ctf__input--err': errors.name }"
          placeholder="Seu nome completo"
          autocomplete="name"
        >
        <p v-if="errors.name" class="ctf__err">{{ errors.name }}</p>
      </div>

      <!-- Email -->
      <div class="ctf__field">
        <label class="ctf__label" for="ctf-email">Email *</label>
        <input
          id="ctf-email"
          v-model="state.email"
          type="email"
          name="email"
          class="ctf__input"
          :class="{ 'ctf__input--err': errors.email }"
          placeholder="seu@email.com"
          autocomplete="email"
        >
        <p v-if="errors.email" class="ctf__err">{{ errors.email }}</p>
      </div>

      <!-- Telefone -->
      <div class="ctf__field">
        <label class="ctf__label" for="ctf-phone">Telefone</label>
        <input
          id="ctf-phone"
          :value="state.phone"
          type="tel"
          name="phone"
          inputmode="numeric"
          class="ctf__input ctf__input--tabular"
          placeholder="(11) 99999-9999"
          autocomplete="tel"
          @input="onPhone"
        >
      </div>

      <!-- Assunto -->
      <div class="ctf__field">
        <label class="ctf__label" for="ctf-subject">Assunto *</label>
        <div class="ctf__select-wrap">
          <select
            id="ctf-subject"
            v-model="state.subject"
            name="subject"
            class="ctf__input ctf__select"
            :class="{ 'ctf__input--err': errors.subject, 'ctf__select--empty': !state.subject }"
          >
            <option value="" disabled>Selecione o assunto</option>
            <option v-for="o in subjectOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
          <svg class="ctf__chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
        <p v-if="errors.subject" class="ctf__err">{{ errors.subject }}</p>
      </div>

      <!-- Mensagem -->
      <div class="ctf__field">
        <label class="ctf__label" for="ctf-message">Mensagem *</label>
        <textarea
          id="ctf-message"
          v-model="state.message"
          name="message"
          rows="5"
          class="ctf__input ctf__textarea"
          :class="{ 'ctf__input--err': errors.message }"
          placeholder="Descreva sua dúvida, sugestão ou como podemos ajudá-lo..."
        />
        <p v-if="errors.message" class="ctf__err">{{ errors.message }}</p>
      </div>

      <!-- Aceite dos termos -->
      <div class="ctf__field">
        <label class="ctf__check">
          <input v-model="state.acceptTerms" type="checkbox" name="acceptTerms" class="ctf__checkbox">
          <span class="ctf__check-text">
            Ao enviar esta mensagem, você concorda com nossos
            <NuxtLink to="/institucional/terms" class="ctf__link">Termos de Serviço</NuxtLink>
            e
            <NuxtLink to="/institucional/privacy" class="ctf__link">Política de Privacidade</NuxtLink>
            *
          </span>
        </label>
        <p v-if="errors.acceptTerms" class="ctf__err">{{ errors.acceptTerms }}</p>
      </div>

      <button type="submit" class="ctf__submit" :disabled="submitting">
        <span v-if="!submitting">Enviar mensagem</span>
        <span v-else>Enviando...</span>
      </button>
    </form>
  </div>
</template>

<style scoped>
.ctf { animation: nu-fade .5s ease both; }
.ctf__form { display: flex; flex-direction: column; gap: 20px; }

.ctf__field { display: flex; flex-direction: column; gap: 8px; }
.ctf__label { color: var(--nu-gray-2); font-size: 14px; font-weight: 700; letter-spacing: -.1px; }

.ctf__input {
  width: 100%; background: var(--nu-white);
  border: 1.5px solid var(--nu-cream-2); border-radius: var(--nu-r-input);
  outline: none; padding: 13px 16px; color: var(--nu-ink);
  font-family: var(--nu-font); font-size: 16px; font-weight: 500; line-height: 1.4;
  transition: border-color .2s, box-shadow .2s;
}
.ctf__input::placeholder { color: var(--nu-placeholder); font-weight: 500; }
.ctf__input:focus { border-color: var(--nu-blue); box-shadow: 0 0 0 3px var(--nu-blue-tint); }
.ctf__input--tabular { font-variant-numeric: tabular-nums; }
.ctf__input--err { border-color: var(--nu-red); }
.ctf__input--err:focus { box-shadow: 0 0 0 3px var(--nu-red-tint); }

.ctf__textarea { resize: vertical; min-height: 120px; }

.ctf__select-wrap { position: relative; }
.ctf__select {
  appearance: none; -webkit-appearance: none; -moz-appearance: none;
  padding-right: 44px; cursor: pointer;
}
.ctf__select--empty { color: var(--nu-placeholder); }
.ctf__chev {
  position: absolute; right: 15px; top: 50%; transform: translateY(-50%);
  color: var(--nu-gray); pointer-events: none;
}

.ctf__check { display: flex; align-items: flex-start; gap: 12px; cursor: pointer; }
.ctf__checkbox {
  appearance: auto; width: 18px; height: 18px; margin-top: 2px; flex-shrink: 0;
  accent-color: var(--nu-blue); cursor: pointer;
}
.ctf__check-text { color: var(--nu-gray-3); font-size: 14px; font-weight: 500; line-height: 1.55; }
.ctf__link {
  color: var(--nu-blue); text-decoration: underline;
  text-underline-offset: 2px; text-decoration-thickness: 1px; transition: color .2s;
}
.ctf__link:hover { color: var(--nu-blue-hover); }

.ctf__submit {
  margin-top: 4px; background: var(--nu-blue); color: var(--nu-white);
  border: none; border-radius: var(--nu-r-input); padding: 15px 24px;
  font-family: var(--nu-font); font-size: 16px; font-weight: 800; letter-spacing: -.1px;
  cursor: pointer; transition: background .2s;
}
.ctf__submit:hover { background: var(--nu-blue-hover); }
.ctf__submit:disabled { opacity: .7; cursor: default; }

.ctf__err { color: var(--nu-red); font-size: 13px; font-weight: 600; }

.ctf__done {
  background: var(--nu-green-soft); border-radius: var(--nu-r-panel);
  padding: 28px 30px; text-align: center;
}
.ctf__done-title { color: var(--nu-ink); font-size: 19px; font-weight: 800; letter-spacing: -.2px; }
.ctf__done-sub { margin-top: 6px; color: var(--nu-ink-75); font-size: 15px; font-weight: 500; }

@media (max-width: 760px) {
  .ctf__input { font-size: 16px; }
}
</style>
