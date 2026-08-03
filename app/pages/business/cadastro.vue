<script setup lang="ts">
/**
 * /business/cadastro — a porta de entrada da conta do escritório.
 *
 * MESMA CASCA DO /login (direção do dono 2026-08-03: "deixe parecida com a
 * nossa tela de /login, com uma pegada mais B2B, talvez mudando o card animado
 * à direita"). Reusa o `NuAuthLayout` inteiro: split-screen, logo flush no
 * topo, miolo centralizado a 440px, painel dark à direita que some em 1020px.
 * Reusa também os mesmos componentes de formulário do login (`NuFieldLabel`,
 * `NuUnderlineInput`, `NuPillButton`, `NuTextDivider`, `NuInlineTextToggle`),
 * então as duas telas envelhecem juntas em vez de divergirem.
 *
 * O QUE MUDA É O PAINEL DA DIREITA: no login é a orbe "Redentia lendo o
 * mercado", que fala com o investidor. Aqui é o `RbAuthAside`, com a mesa do
 * escritório perguntando. Entrou pelo slot `panel` que o layout ganhou, o que
 * deixa o /login intocado.
 *
 * SEM AUTH PRÓPRIA, de propósito: é o handoff documentado do /login (?email=
 * pré-preenche, ?redirect= traz de volta). Reimplementar PIN, WhatsApp e
 * Google aqui seria duplicar 400 linhas delicadas, e é a razão de esta tela
 * pedir só o e-mail.
 *
 * O NOME DO ESCRITÓRIO NÃO É PEDIDO AQUI, e isso é escolha: ele viria antes do
 * código de acesso e se perderia no vaivém do login. Ele é a primeira tela do
 * /business/chaves, depois que a sessão existe.
 *
 * Quem já está logado não vê form: o middleware manda direto pro painel. Por
 * variar por cookie, a rota é private/no-store no nuxt.config.
 */
definePageMeta({
  layout: false,
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
  description: 'Crie a conta do seu escritório e gere as chaves MCP da Redentia.',
  path: '/business/cadastro',
  robots: 'noindex, follow',
})
useHead({ titleTemplate: null })

const route = useRoute()
const email = ref(typeof route.query.email === 'string' ? route.query.email.trim() : '')
const enviando = ref(false)

const pronto = computed(() => /.+@.+\..+/.test(email.value.trim()))

function seguir() {
  if (!pronto.value || enviando.value) return
  enviando.value = true
  // O /login é quem manda o código e cria a sessão; ?redirect= devolve a
  // pessoa no painel do escritório, que é onde o cadastro de fato acontece.
  navigateTo(`/login?email=${encodeURIComponent(email.value.trim())}&redirect=${encodeURIComponent('/business/chaves')}`)
}
</script>

<template>
  <NuAuthLayout logo-to="/business">
    <template #panel>
      <RbAuthAside />
    </template>

    <div class="rbcd">
      <span class="rbcd__eyebrow">Redentia For Business</span>
      <h1 class="rbcd__h1">A conta é do escritório.</h1>
      <p class="rbcd__sub">
        Uma conta para a casa inteira, com até cinco chaves nomeadas e o uso de
        todas no mesmo painel. Comece pelo seu e-mail do trabalho.
      </p>

      <form @submit.prevent="seguir">
        <div class="rbcd__label">
          <NuFieldLabel label="Seu e-mail do trabalho" help="Você recebe um código de acesso. Não existe senha." />
        </div>
        <NuUnderlineInput
          v-model="email"
          type="email"
          name="email"
          placeholder="voce@escritorio.com.br"
          autocomplete="email"
        />
        <NuPillButton class="rbcd__cta" type="submit" :disabled="!pronto" :loading="enviando">
          Continuar
        </NuPillButton>
      </form>

      <NuTextDivider class="rbcd__divider" label="depois" />

      <ol class="rbcd__passos">
        <li v-for="(p, i) in [
          'Você dá o nome do escritório no painel.',
          'A conta é liberada quando o contrato fecha.',
          'As chaves saem na hora, uma por pessoa ou por mesa.',
        ]" :key="i" class="rbcd__passo">
          <span class="rbcd__n">{{ i + 1 }}</span>
          <span>{{ p }}</span>
        </li>
      </ol>

      <p class="rbcd__nota">
        Cadastrar não cobra nada e não libera nada sozinho. Uma conta por
        escritório: se alguém da casa já criou, peça a sua chave para essa pessoa.
      </p>

      <NuInlineTextToggle
        class="rbcd__footer"
        label="Procurando a Redentia para investir?"
        cta="Ir para o app"
        @click="navigateTo('/')"
      />
    </div>
  </NuAuthLayout>
</template>

<style scoped>
/* Espelha o ritmo vertical do /login (lg__*): mesmos clamps de respiro, pra
   as duas telas ficarem alinhadas quando abertas lado a lado. */
.rbcd { animation: nu-fade .5s ease both; }

.rbcd__eyebrow { display: block; color: var(--nu-blue); font-size: 14.5px; font-weight: 800; letter-spacing: -.01em; }
.rbcd__h1 {
  margin: 10px 0 0; color: var(--nu-ink);
  font-size: clamp(32px, 3.4vw, 44px); font-weight: 800; letter-spacing: -.04em; line-height: 1.05;
}
.rbcd__sub { margin: 16px 0 0; color: var(--nu-gray-2); font-size: 16px; font-weight: 500; line-height: 1.6; }

.rbcd__label { margin-top: clamp(28px, 4vh, 44px); }
.rbcd__cta { margin-top: clamp(32px, 4.5vh, 48px); }
.rbcd__divider { margin-top: 30px; }

/* os três passos: é o que a pessoa precisa saber ANTES de entregar o e-mail,
   e por isso vive acima da dobra em vez de virar nota de rodapé */
.rbcd__passos { list-style: none; margin: 24px 0 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.rbcd__passo { display: flex; align-items: flex-start; gap: 12px; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 600; line-height: 1.5; }
.rbcd__n {
  width: 22px; height: 22px; flex-shrink: 0; margin-top: 1px;
  display: flex; align-items: center; justify-content: center;
  background: var(--nu-tile-blue-bg); color: var(--nu-blue); border-radius: 7px;
  font-size: 12px; font-weight: 800; font-variant-numeric: tabular-nums;
}

.rbcd__nota { margin: 26px 0 0; color: var(--nu-gray); font-size: 13.5px; font-weight: 500; line-height: 1.6; }
.rbcd__footer { margin-top: clamp(28px, 4vh, 44px); }
</style>
