<script setup lang="ts">
// Formulário de contato da página /institucional/contact — portado da página
// antiga (Frontend/app/pages/institucional/contact.vue), reflowado no design Nu
// (campos boxed brancos, borda creme, foco azul, tokens --nu-*). Labels,
// placeholders, opções de assunto e textos de erro são VERBATIM da página
// antiga (acentos restaurados). O botão e o painel pós-clique não: dizem que
// o app de e-mail abre com a mensagem pronta, sem afirmar que ela foi enviada.
//
// SEM BACKEND (a página antiga só simulava o envio com um setTimeout + toast).
// Para o submit NÃO quebrar, o destino é um `mailto:` pré-preenchido para
// relacionamento@redentia.com.br (mesmo endereço de suporte do design). Não há envio
// real: o botão avisa que vai abrir o app de e-mail, e o painel depois do
// clique confirma só isso — nunca que a mensagem foi enviada.
const props = withDefaults(defineProps<{ supportEmail?: string }>(), {
  supportEmail: 'relacionamento@redentia.com.br',
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
  const subject = `[Contato ${MARCA.nome}] ${opt?.label ?? 'Contato'}`
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
  // Não navega a página — apenas dispara o handler mailto. O painel seguinte
  // só confirma que o e-mail foi aberto; o envio acontece no app de e-mail.
  if (import.meta.client) window.location.href = mailtoHref()
  submitting.value = false
  done.value = true
}
</script>

<template>
  <div class="ctf">
    <!-- Painel pós-clique: o mailto abriu; a mensagem ainda não foi enviada. -->
    <div v-if="done" class="ctf__done" role="status">
      <div class="ctf__done-title">Abrimos o seu e-mail com a mensagem pronta.</div>
      <div class="ctf__done-sub">É só enviar por lá.</div>
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
          placeholder="Descreva sua dúvida, sugestão ou como podemos ajudar"
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

      <NuBotaoSeta type="submit" class="ctf__submit" tamanho="m" largo :loading="submitting">
        Abrir o app de e-mail com a mensagem pronta
      </NuBotaoSeta>
    </form>
  </div>
</template>

<style scoped>
/* O formulário no padrão de campo da Aportou (11/11/2026): cartão creme com a
   sombra quente, campo branco de 56px com borda de 1,5px e raio 16, rótulo de
   15px em 700 acima, anel cobalto de 3px no foco, e a pílula da seta no envio.
   Robustez (11/11/2026): o campo tem os quatro estados (repouso, ponteiro com a
   borda mais escura, foco com o anel, erro com a mensagem que entra num fade);
   tudo em token. */
.ctf {
  background: var(--nu-card); border-radius: var(--nu-r-card); box-shadow: var(--nu-shadow-quente);
  padding: clamp(24px, 3vw, 40px);
  animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) both;
}
.ctf__form { display: flex; flex-direction: column; gap: 22px; }

.ctf__field { display: flex; flex-direction: column; gap: 8px; }
.ctf__label { color: var(--nu-ink); font-size: 15px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); }

.ctf__input {
  width: 100%; min-height: 56px; background: var(--nu-white);
  border: 1.5px solid var(--nu-borda-campo); border-radius: var(--nu-r-input);
  outline: none; padding: 14px 16px; color: var(--nu-ink);
  font-family: var(--nu-font); font-size: 17px; font-weight: var(--nu-w-texto); line-height: 1.4;
  transition: border-color var(--nu-dur-media) var(--nu-ease-cor);
}
.ctf__input:hover:not(:focus) { border-color: var(--nu-borda-campo-hover); }
.ctf__input::placeholder { color: var(--nu-placeholder); font-weight: var(--nu-w-texto); }
.ctf__input:focus, .ctf__input:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 1px; border-color: var(--nu-blue); }
.ctf__input--tabular { font-variant-numeric: tabular-nums; }
.ctf__input--err { border-color: var(--nu-red); }
.ctf__input--err:focus, .ctf__input--err:focus-visible { outline-color: var(--nu-red); border-color: var(--nu-red); }

.ctf__textarea { resize: vertical; min-height: 140px; }

.ctf__select-wrap { position: relative; }
.ctf__select {
  appearance: none; -webkit-appearance: none; -moz-appearance: none;
  padding-right: 48px; cursor: pointer;
}
.ctf__select--empty { color: var(--nu-placeholder); }
.ctf__chev {
  position: absolute; right: 17px; top: 50%; transform: translateY(-50%);
  color: var(--nu-ink); pointer-events: none;
}

.ctf__check { display: flex; align-items: flex-start; gap: 12px; min-height: 44px; cursor: pointer; }
.ctf__checkbox {
  appearance: auto; width: 22px; height: 22px; margin-top: 1px; flex-shrink: 0;
  accent-color: var(--nu-blue); cursor: pointer;
}
.ctf__check-text { color: var(--nu-gray-3); font-size: 15.5px; font-weight: var(--nu-w-texto); line-height: 1.5; }
.ctf__link {
  color: var(--nu-blue-text); font-weight: var(--nu-w-medio); text-decoration: underline;
  text-underline-offset: 3px; text-decoration-thickness: 1.5px; text-decoration-color: var(--nu-blue-soft);
  transition: color var(--nu-dur-media) var(--nu-ease-cor), text-decoration-color var(--nu-dur-media) var(--nu-ease-cor);
}
.ctf__link:hover { color: var(--nu-blue-hover); text-decoration-color: currentColor; }

.ctf__submit { margin-top: 4px; white-space: normal; text-align: left; }

.ctf__err { margin: 0; color: var(--nu-red-text); font-size: 13.5px; font-weight: var(--nu-w-medio); animation: nu-fade var(--nu-dur-media) var(--nu-ease-saida) both; }

.ctf__done { text-align: center; padding: 8px 0; animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) both; }
.ctf__done-title { color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); line-height: 1.15; }
.ctf__done-sub { margin-top: 8px; color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-texto); }
@media (prefers-reduced-motion: reduce) { .ctf, .ctf__done, .ctf__err { animation: none; } }
</style>
