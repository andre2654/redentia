<script setup lang="ts">
// Faixa azul full-bleed de captura de e-mail: headline 2 linhas à esquerda,
// input-pílula branco com botão azul embutido à direita. Valores exatos do
// design (Redentia Guias Nu.dc.html).
// Assina de verdade desde 21/10/2026 (antes o submit só levava ao /login): a
// inscrição é a mesma da preço teto (useNewsletter). Anônimo manda o e-mail e
// confirma o código, que cria a conta; logado com e-mail confirmado assina com
// um clique, com o e-mail da conta no lugar do campo. A página é cacheada na
// borda: o estado da conta só existe depois do mount.
defineProps<{ subtitle: string; placeholder: string; cta: string }>()

const { isAuthenticated } = useAuthState()
const nl = useNewsletter()
const { pronto, emailDaConta, assinante, etapa, emailPendente, enviando, erro, confirmacao, legal } = nl
const email = ref('')
const codigo = ref('')
/** isca para robô: gente não vê nem preenche */
const isca = ref('')
</script>

<template>
  <section class="nnb">
    <div class="nnb__cols">
      <div class="nnb__left">
        <h2 class="nnb__title"><slot name="title" /></h2>
        <div class="nnb__sub">{{ subtitle }}</div>
      </div>
      <div class="nnb__right">
        <p v-if="etapa === 'ok'" class="nnb__ok" role="status">{{ confirmacao }}</p>
        <p v-else-if="assinante" class="nnb__ok" role="status">Você já recebe O mercado da semana{{ emailDaConta ? ` em ${emailDaConta}` : '' }}, toda sexta.</p>
        <template v-else-if="isAuthenticated && !pronto" />

        <template v-else-if="isAuthenticated && emailDaConta && etapa === 'email'">
          <div class="nnb__pill">
            <span class="nnb__conta">{{ emailDaConta }}</span>
            <button type="button" class="nnb__cta" :disabled="enviando" @click="nl.assinarComConta()">{{ enviando ? 'Assinando…' : cta }}</button>
          </div>
          <p class="nnb__legal">{{ legal }} <NuxtLink to="/institucional/privacy">Privacidade</NuxtLink>.</p>
        </template>

        <form v-else-if="etapa === 'email'" @submit.prevent="nl.pedirCodigo(email, isca)">
          <div class="nnb__pill">
            <input v-model="email" type="email" required :placeholder="placeholder" class="nnb__input" autocomplete="email" inputmode="email" aria-label="Seu e-mail">
            <button type="submit" class="nnb__cta" :disabled="enviando">{{ enviando ? 'Enviando…' : cta }}</button>
          </div>
          <input v-model="isca" type="text" name="site" tabindex="-1" autocomplete="off" aria-hidden="true" class="nnb__isca">
          <p class="nnb__legal">{{ legal }} <NuxtLink to="/institucional/privacy">Privacidade</NuxtLink>.</p>
        </form>

        <form v-else @submit.prevent="nl.confirmarCodigo(codigo)">
          <p class="nnb__passo">Mandamos um código para {{ emailPendente }}. Ele vale 10 minutos.</p>
          <div class="nnb__pill">
            <input v-model="codigo" type="text" required inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="Código de 6 dígitos" aria-label="Código" class="nnb__input">
            <button type="submit" class="nnb__cta" :disabled="enviando">{{ enviando ? 'Confirmando…' : 'Confirmar' }}</button>
          </div>
          <button type="button" class="nnb__trocar" @click="nl.trocarEmail()">Trocar o e-mail</button>
        </form>
        <p v-if="erro" class="nnb__erro" role="alert">{{ erro }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.nnb {
  background: var(--nu-blue);
  padding: clamp(56px, 7.5vw, 96px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.nnb__cols { display: flex; gap: clamp(28px, 5vw, 72px); align-items: center; flex-wrap: wrap; }
.nnb__left { flex: 1.4 1 380px; min-width: min(300px, 100%); }
.nnb__title {
  margin: 0; color: var(--nu-cream-text);
  font-size: clamp(34px, 4.2vw, 56px); font-weight: 800;
  letter-spacing: -0.04em; line-height: 1.05;
}
.nnb__sub { color: var(--nu-cream-text-70); font-size: var(--nu-fs-lg); font-weight: 500; margin-top: 16px; }
.nnb__right { position: relative; flex: 1 1 340px; min-width: min(300px, 100%); }
.nnb__pill {
  display: flex; gap: 10px; background: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 7px 7px 7px 24px; align-items: center;
}
.nnb__input {
  flex: 1; min-width: 0; background: transparent; border: none; outline: none;
  color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 500; padding: 10px 0;
}
.nnb__conta {
  flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 500; padding: 10px 0;
}
.nnb__cta {
  background: var(--nu-blue); color: var(--nu-white); border: none;
  border-radius: var(--nu-r-pill); padding: 13px 24px; font-size: var(--nu-fs-md); font-weight: 800;
  cursor: pointer; white-space: nowrap; transition: background .2s;
}
.nnb__cta:hover { background: var(--nu-blue-hover); }
.nnb__cta:disabled { opacity: .6; cursor: default; }
.nnb__legal { margin: 12px 0 0; color: var(--nu-cream-text-70); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.5; }
.nnb__legal a { color: inherit; text-decoration: underline; }
.nnb__passo { margin: 0 0 12px; color: var(--nu-cream-text); font-size: var(--nu-fs-md); font-weight: 500; }
.nnb__ok { margin: 0; color: var(--nu-cream-text); font-size: var(--nu-fs-lg); font-weight: 700; line-height: 1.45; }
.nnb__erro { margin: 12px 0 0; color: var(--nu-white); font-size: var(--nu-fs-sm); font-weight: 700; }
.nnb__trocar {
  margin: 10px 0 0; padding: 0; background: none; border: none; cursor: pointer;
  color: var(--nu-cream-text-70); font-size: var(--nu-fs-xs); font-weight: 700; text-decoration: underline;
}
.nnb__isca { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
</style>
