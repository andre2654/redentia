<script setup lang="ts">
/**
 * /business/cadastro — a porta de entrada da conta do escritório.
 *
 * SÓ O LOGIN MORA AQUI. O cadastro da empresa em si (o nome do escritório) é
 * a primeira tela do /business/chaves, e a divisão é deliberada: pedir e-mail
 * e nome do escritório na mesma tela obrigaria a segurar o nome durante todo
 * o vaivém do código de acesso, e um refresh no meio perderia o que a pessoa
 * digitou. Aqui: identidade. Lá dentro: a empresa.
 *
 * SEM AUTH PRÓPRIA, de propósito: é o handoff documentado do /login (?email=
 * pré-preenche, ?redirect= traz de volta) — o mesmo padrão da
 * NuNewsletterBand e do hero do /mercado. Reimplementar PIN/WhatsApp/Google
 * aqui seria duplicar 400 linhas delicadas.
 *
 * Quem já está logado não vê form: middleware manda direto pra /business/chaves
 * (mesmo gesto do /login). Por variar por cookie, a rota é private/no-store no
 * nuxt.config.
 */
definePageMeta({
  layout: 'business',
  middleware: [
    () => {
      const token = useCookie<string | null>('nu:token')
      if (!token.value) return
      return navigateTo('/business/chaves', { replace: true })
    },
  ],
})

usePageSeo({
  title: 'Ativar acesso · Redentia For Business',
  description: 'Crie a conta e gere a chave MCP do seu escritório na Redentia For Business.',
  path: '/business/cadastro',
  robots: 'noindex, follow',
})
useHead({ titleTemplate: null })

const email = ref('')
const ready = computed(() => /.+@.+\..+/.test(email.value))

function seguir() {
  if (!ready.value) return
  navigateTo(`/login?email=${encodeURIComponent(email.value.trim())}&redirect=${encodeURIComponent('/business/chaves')}`)
}

const PASSOS = [
  { t: 'Acesso', d: 'Você entra com o e-mail do trabalho. Sem senha: o código chega na hora.' },
  { t: 'Escritório', d: 'Dá o nome da casa. A conta fica registrada e é liberada quando o contrato fecha.' },
  { t: 'Chaves', d: 'Até cinco, cada uma com nome. A chave aparece uma vez, e o painel mostra o uso de todas.' },
  { t: 'Conexão', d: 'Claude Desktop, Claude Code ou Cursor: cola a configuração e pergunta. O guia mostra os três.' },
]
</script>

<template>
  <section class="rbcd">
    <div class="rbcd__cols">
      <div class="rbcd__intro">
        <NuSectionHeading eyebrow="Ativar acesso">
          Uma conta<br>para a casa.
          <template #dek>
            O escritório tem uma conta só, e dentro dela até cinco chaves
            nomeadas: <strong>uma por pessoa ou por mesa, cada uma revogável
            sem derrubar as outras</strong>. Comece pelo seu e-mail do trabalho.
          </template>
        </NuSectionHeading>

        <form class="rbcd__form" @submit.prevent="seguir">
          <label class="rbcd__label" for="rbcd-email">Seu e-mail do trabalho</label>
          <div class="rbcd__row">
            <input
              id="rbcd-email"
              v-model="email"
              type="email"
              name="email"
              autocomplete="email"
              placeholder="voce@escritorio.com.br"
              class="rbcd__input"
            >
            <button type="submit" class="rbcd__cta" :disabled="!ready">
              Continuar
            </button>
          </div>
          <p class="rbcd__help">
            Você recebe um código de acesso e volta direto pro painel do
            escritório, onde dá o nome da casa e gera as chaves. Já tem conta?
            O mesmo caminho entra.
          </p>
        </form>

        <p class="rbcd__nota">
          Ainda não fechou com a gente? Pode criar a conta agora: ela fica
          registrada e é liberada no
          <a href="/business#contato" class="rbcd__link">setup de 1 hora</a>.
          Cadastrar não cobra nada e não libera nada sozinho.
        </p>
      </div>

      <div class="rbcd__aside">
        <span class="rbcd__aside-label">O caminho inteiro</span>
        <ol class="rbcd__passos">
          <li v-for="(p, i) in PASSOS" :key="p.t" class="rbcd__passo">
            <span class="rbcd__num">{{ String(i + 1).padStart(2, '0') }}</span>
            <div>
              <h3 class="rbcd__passo-t">{{ p.t }}</h3>
              <p class="rbcd__passo-d">{{ p.d }}</p>
            </div>
          </li>
        </ol>
        <p class="rbcd__aside-nota">
          Guia de conexão completo em
          <NuxtLink to="/business/comecar" class="rbcd__link">/business/comecar</NuxtLink>.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rbcd {
  background: var(--nu-cream);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
  min-height: 60vh;
}
.rbcd__cols {
  display: flex; gap: clamp(32px, 5vw, 76px);
  align-items: flex-start; flex-wrap: wrap;
}
.rbcd__intro { flex: 1.15 1 460px; min-width: min(300px, 100%); }
.rbcd__aside { flex: 1 1 380px; min-width: min(300px, 100%); }

.rbcd__form { margin-top: clamp(28px, 3.5vw, 40px); max-width: 560px; }
.rbcd__label {
  display: block; color: var(--nu-gray); font-size: 11.5px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 1.4px; margin-bottom: 10px;
}
.rbcd__row { display: flex; gap: 10px; flex-wrap: wrap; }
.rbcd__input {
  flex: 1 1 260px; min-width: min(240px, 100%);
  background: var(--nu-white); border: 1px solid var(--nu-cream-line);
  border-radius: 14px; padding: 15px 18px;
  color: var(--nu-ink); font-size: 16px; font-weight: 600; font-family: inherit;
}
.rbcd__input::placeholder { color: var(--nu-gray); font-weight: 500; }
.rbcd__input:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 1px; }
.rbcd__cta {
  flex-shrink: 0; border: none; cursor: pointer;
  background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 26px;
  font-size: 16px; font-weight: 800; font-family: inherit; transition: background .2s, opacity .2s;
}
.rbcd__cta:disabled { opacity: .45; cursor: default; }
.rbcd__cta:not(:disabled):hover { background: var(--nu-blue-hover); }
.rbcd__cta:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }
.rbcd__help { margin: 14px 0 0; color: var(--nu-gray); font-size: 13.5px; font-weight: 500; line-height: 1.6; max-width: 480px; }

.rbcd__nota {
  margin: clamp(28px, 3.5vw, 40px) 0 0; padding-top: 22px;
  border-top: 1px solid var(--nu-cream-line);
  color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.65; max-width: 520px;
}
.rbcd__link { color: var(--nu-blue); font-weight: 700; }
.rbcd__link:hover { color: var(--nu-blue-hover); }

.rbcd__aside-label {
  display: block; color: var(--nu-gray); font-size: 11.5px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 1.4px;
}
.rbcd__passos { margin: 22px 0 0; padding: 0; list-style: none; }
.rbcd__passo {
  display: flex; gap: 18px; align-items: flex-start;
  padding: 18px 0; border-top: 1px solid var(--nu-cream-line);
}
.rbcd__num {
  color: var(--nu-blue); font-size: 14px; font-weight: 800;
  font-variant-numeric: tabular-nums; flex-shrink: 0; padding-top: 2px;
}
.rbcd__passo-t { margin: 0; color: var(--nu-ink); font-size: 17px; font-weight: 800; letter-spacing: -0.02em; }
.rbcd__passo-d { margin: 6px 0 0; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.6; }
.rbcd__aside-nota { margin: 20px 0 0; color: var(--nu-gray); font-size: 13.5px; font-weight: 500; }
</style>
