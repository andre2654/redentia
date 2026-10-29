<script setup lang="ts">
// O formulário de O mercado da semana sobre fundo azul ou navy: a pílula
// branca com o botão azul, o aviso de consentimento e os passos do
// useNewsletter (anônimo: e-mail → código → conta e inscrição; logado com
// e-mail confirmado: um clique). Saiu da faixa do /guias em 21/10/2026 para
// servir também ao rodapé e ao convite do canto (NuNewsletterConvite).
import type { OrigemNewsletter } from '~/composables/useNewsletter'

const props = withDefaults(defineProps<{
  placeholder?: string
  cta?: string
  /** de onde veio a inscrição: consent_source do PUT e o evento do GA4 */
  origem?: OrigemNewsletter
}>(), { placeholder: 'Seu melhor e-mail', cta: 'Assinar', origem: 'bloco' })
const emit = defineEmits<{ assinou: [] }>()

const { isAuthenticated } = useAuthState()
const nl = useNewsletter(props.origem)
const { pronto, emailDaConta, assinante, etapa, emailPendente, enviando, erro, confirmacao, legal } = nl
const email = ref('')
const codigo = ref('')
/** isca para robô: gente não vê nem preenche */
const isca = ref('')

watch(etapa, (v) => {
  if (v === 'ok') emit('assinou')
})
</script>

<template>
  <div class="nnf">
    <p v-if="etapa === 'ok'" class="nnf__ok" role="status">{{ confirmacao }}</p>
    <p v-else-if="assinante" class="nnf__ok" role="status">Você já recebe O mercado da semana{{ emailDaConta ? ` em ${emailDaConta}` : '' }}, toda sexta.</p>
    <template v-else-if="isAuthenticated && !pronto" />

    <template v-else-if="isAuthenticated && emailDaConta && etapa === 'email'">
      <div class="nnf__pill">
        <span class="nnf__conta">{{ emailDaConta }}</span>
        <button type="button" class="nnf__cta" :disabled="enviando" @click="nl.assinarComConta()">{{ enviando ? 'Assinando…' : cta }}</button>
      </div>
      <p class="nnf__legal">{{ legal }} <NuxtLink to="/institucional/privacy">Privacidade</NuxtLink>.</p>
    </template>

    <form v-else-if="etapa === 'email'" @submit.prevent="nl.pedirCodigo(email, isca)">
      <div class="nnf__pill">
        <input v-model="email" type="email" required :placeholder="placeholder" class="nnf__input" autocomplete="email" inputmode="email" aria-label="Seu e-mail">
        <button type="submit" class="nnf__cta" :disabled="enviando">{{ enviando ? 'Enviando…' : cta }}</button>
      </div>
      <input v-model="isca" type="text" name="site" tabindex="-1" autocomplete="off" aria-hidden="true" class="nnf__isca">
      <p class="nnf__legal">{{ legal }} <NuxtLink to="/institucional/privacy">Privacidade</NuxtLink>.</p>
    </form>

    <form v-else @submit.prevent="nl.confirmarCodigo(codigo)">
      <p class="nnf__passo">Mandamos um código para {{ emailPendente }}. Ele vale 10 minutos.</p>
      <div class="nnf__pill">
        <input v-model="codigo" type="text" required inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="Código de 6 dígitos" aria-label="Código" class="nnf__input">
        <button type="submit" class="nnf__cta" :disabled="enviando">{{ enviando ? 'Confirmando…' : 'Confirmar' }}</button>
      </div>
      <button type="button" class="nnf__trocar" @click="nl.trocarEmail()">Trocar o e-mail</button>
    </form>
    <p v-if="erro" class="nnf__erro" role="alert">{{ erro }}</p>
  </div>
</template>

<style scoped>
.nnf { position: relative; }
.nnf__pill {
  display: flex; gap: 10px; background: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 7px 7px 7px 24px; align-items: center;
}
.nnf__input {
  flex: 1; min-width: 0; background: transparent; border: none; outline: none;
  color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 500; padding: 10px 0;
}
.nnf__conta {
  flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 500; padding: 10px 0;
}
.nnf__cta {
  background: var(--nu-blue); color: var(--nu-white); border: none;
  border-radius: var(--nu-r-pill); padding: 13px 24px; font-size: var(--nu-fs-md); font-weight: 800;
  cursor: pointer; white-space: nowrap; transition: background .2s;
}
.nnf__cta:hover { background: var(--nu-blue-hover); }
.nnf__cta:disabled { opacity: .6; cursor: default; }
.nnf__legal { margin: 12px 0 0; color: var(--nu-cream-text-70); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.5; }
.nnf__legal a { color: inherit; text-decoration: underline; }
.nnf__passo { margin: 0 0 12px; color: var(--nu-cream-text); font-size: var(--nu-fs-md); font-weight: 500; }
.nnf__ok { margin: 0; color: var(--nu-cream-text); font-size: var(--nu-fs-lg); font-weight: 700; line-height: 1.45; }
.nnf__erro { margin: 12px 0 0; color: var(--nu-white); font-size: var(--nu-fs-sm); font-weight: 700; }
.nnf__trocar {
  margin: 10px 0 0; padding: 0; background: none; border: none; cursor: pointer;
  color: var(--nu-cream-text-70); font-size: var(--nu-fs-xs); font-weight: 700; text-decoration: underline;
}
.nnf__isca { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
</style>
