<script setup lang="ts">
/**
 * /business/convite/[token] — a porta de quem recebeu um convite de chave.
 *
 * POR QUE EXISTE: a conta de escritório é de UM login (o sócio), mas quem usa
 * a chave é a mesa. Sem isto, ou o sócio gera e manda o segredo por chat, ou
 * cada pessoa cria conta na Redentia. Aqui a pessoa abre o link, dá o nome,
 * recebe a chave UMA vez e cai no mesmo wizard de conexão do painel. Sem
 * conta, sem senha, sem o sócio presente.
 *
 * MESMA CASCA DO /business/cadastro (NuAuthLayout + RbAuthAside): é a mesma
 * família de tela, "alguém chegando ao escritório", e as duas envelhecem
 * juntas em vez de divergir.
 *
 * 100% CLIENT, de propósito: o token está na URL e a chave é segredo. O SSR
 * renderiza só a casca "abrindo o convite" (sem fetch, sem hydration
 * mismatch) e o onMounted consulta o backend. A rota é private/no-store no
 * nuxt.config, e a página é noindex/nofollow.
 *
 * O backend decide tudo (uso único, validade, conta liberada, teto, rótulo
 * repetido): a tela só traduz o código de recusa pra frase com saída.
 */
definePageMeta({ layout: false })

usePageSeo({
  title: 'Convite · Redentia For Business',
  description: 'Gere a sua chave MCP do escritório com o convite que você recebeu.',
  path: '/business/convite',
  robots: 'noindex, nofollow',
})
useHead({ titleTemplate: null })

const route = useRoute()
const { publicFetch } = useApi()

const token = computed(() => (typeof route.params.token === 'string' ? route.params.token : ''))

type Estado = 'carregando' | 'invalido' | 'form' | 'pronto'
const estado = ref<Estado>('carregando')
const motivo = ref<string>('not_found')
const empresa = ref<string | null>(null)
const nome = ref('')
const enviando = ref(false)
const erro = ref<string | null>(null)
const chave = ref<string | null>(null)
const copiado = ref(false)
const conexaoAberta = ref(false)

/** Frase completa com instrução de saída, por código de recusa do servidor. */
const MOTIVOS: Record<string, { titulo: string, texto: string }> = {
  used: {
    titulo: 'Este convite já foi usado.',
    texto: 'Cada link gera uma chave, uma vez só. Se não foi você, avise quem te mandou e peça outro.',
  },
  expired: {
    titulo: 'Este convite venceu.',
    texto: 'O link vale 7 dias. Peça um novo a quem te mandou.',
  },
  account_disabled: {
    titulo: 'A conta do escritório ainda não está liberada.',
    texto: 'Assim que estiver, o mesmo link volta a valer dentro da validade. Fale com quem te mandou.',
  },
  max_keys: {
    titulo: 'O escritório está com todas as chaves em uso.',
    texto: 'Quem te mandou o link precisa liberar uma vaga no painel: revogar uma chave ou pedir mais chaves.',
  },
  not_found: {
    titulo: 'Este link não abre.',
    texto: 'Confira se ele foi colado inteiro. Se veio de alguém do escritório, peça para mandar de novo.',
  },
  erro: {
    titulo: 'Não conseguimos abrir o convite agora.',
    texto: 'Tente de novo em instantes. Se seguir assim, escreva pra contato@redentia.com.',
  },
}

interface ConviteInfo { company_name: string, label: string | null, valid: boolean, reason: string | null }
interface Resgate { key: string, label: string, company_name: string }

onMounted(async () => {
  if (!/^[a-f0-9]{48}$/.test(token.value)) {
    motivo.value = 'not_found'
    estado.value = 'invalido'
    return
  }
  try {
    const r = await publicFetch<ConviteInfo>(`/business/invites/${token.value}`)
    empresa.value = r.company_name
    nome.value = r.label ?? ''
    if (!r.valid) {
      motivo.value = r.reason && MOTIVOS[r.reason] ? r.reason : 'erro'
      estado.value = 'invalido'
      return
    }
    estado.value = 'form'
  }
  catch (e: unknown) {
    const st = (e as { response?: { status?: number } })?.response?.status
    motivo.value = st === 404 ? 'not_found' : 'erro'
    estado.value = 'invalido'
  }
})

const pronto = computed(() => {
  const n = nome.value.trim().length
  return n >= 2 && n <= 40
})

async function gerar() {
  if (!pronto.value || enviando.value) return
  enviando.value = true
  erro.value = null
  try {
    const r = await publicFetch<Resgate>(`/business/invites/${token.value}/redeem`, {
      method: 'POST',
      body: { label: nome.value.trim() },
    })
    chave.value = r.key
    nome.value = r.label
    estado.value = 'pronto'
    // O wizard abre com a chave já interpolada, como no painel: o próximo
    // passo da pessoa é conectar, não ler.
    await nextTick()
    conexaoAberta.value = true
  }
  catch (e: unknown) {
    const err = e as { data?: { error?: string, message?: string } }
    const code = err.data?.error ?? ''
    if (code === 'invite_invalid') {
      motivo.value = 'used'
      estado.value = 'invalido'
      return
    }
    erro.value = err.data?.message ?? ({
      max_keys: MOTIVOS.max_keys!.texto,
      account_disabled: MOTIVOS.account_disabled!.texto,
      label_taken: 'Já existe uma chave com esse nome no escritório. Use outro.',
    }[code] ?? 'Não deu para gerar a chave agora. Tente de novo; se seguir assim, escreva pra contato@redentia.com.')
  }
  finally {
    enviando.value = false
  }
}

let copiaTimer: ReturnType<typeof setTimeout> | undefined
async function copiar() {
  if (!chave.value) return
  try { await navigator.clipboard?.writeText(chave.value) }
  catch { /* clipboard bloqueado */ }
  copiado.value = true
  clearTimeout(copiaTimer)
  copiaTimer = setTimeout(() => { copiado.value = false }, 1600)
}
onBeforeUnmount(() => clearTimeout(copiaTimer))
</script>

<template>
  <NuAuthLayout logo-to="/business">
    <template #panel>
      <RbAuthAside />
    </template>

    <div class="rbcv">
      <span class="rbcv__eyebrow">Redentia For Business</span>

      <!-- abrindo: a forma do que vem, sem spinner -->
      <template v-if="estado === 'carregando'">
        <h1 class="rbcv__h1">Abrindo o convite.</h1>
        <div class="rbcv__skel">
          <NuSkeleton variant="text" :lines="2" />
          <NuSkeleton variant="block" height="44px" radius="input" />
        </div>
      </template>

      <template v-else-if="estado === 'invalido'">
        <h1 class="rbcv__h1">{{ MOTIVOS[motivo]?.titulo }}</h1>
        <p class="rbcv__sub" role="alert">{{ MOTIVOS[motivo]?.texto }}</p>
        <NuInlineTextToggle
          class="rbcv__footer"
          label="Você é quem administra a conta?"
          cta="Ir para o painel"
          @click="navigateTo('/business/chaves')"
        />
      </template>

      <template v-else-if="estado === 'form'">
        <h1 class="rbcv__h1">{{ empresa }} te chamou.</h1>
        <p class="rbcv__sub">
          Dê o nome que vai identificar a sua chave no painel do escritório e ela sai na hora.
          Sem senha, sem conta.
        </p>

        <form @submit.prevent="gerar">
          <div class="rbcv__label">
            <NuFieldLabel label="Seu nome, ou o da sua mesa" help="É como a chave aparece no painel de uso do escritório." />
          </div>
          <NuUnderlineInput
            v-model="nome"
            type="text"
            name="nome"
            placeholder="Ana, ou Mesa de renda variável"
            autocomplete="name"
          />
          <p v-if="erro" class="rbcv__erro" role="alert">{{ erro }}</p>
          <NuPillButton class="rbcv__cta" type="submit" :disabled="!pronto" :loading="enviando">
            Gerar minha chave
          </NuPillButton>
        </form>

        <NuTextDivider class="rbcv__divider" label="depois" />

        <ol class="rbcv__passos">
          <li v-for="(p, i) in [
            'A chave aparece uma vez. Copie na hora.',
            'Crie o conector no Claude ou no ChatGPT com a URL da Redentia.',
            'Cole a chave na tela de autorização. Pronto.',
          ]" :key="i" class="rbcv__passo">
            <span class="rbcv__n">{{ i + 1 }}</span>
            <span>{{ p }}</span>
          </li>
        </ol>

        <p class="rbcv__nota">
          O acesso é somente leitura: mercado, teses e notícias. O escritório vê o uso da sua
          chave e pode revogá-la quando quiser.
        </p>
      </template>

      <template v-else>
        <h1 class="rbcv__h1">Sua chave está pronta.</h1>
        <p class="rbcv__sub">
          Ela aparece uma vez só. Copie agora e guarde num lugar seguro; se perder, peça outro convite.
        </p>

        <div class="rbcv__secret" role="status">
          <span class="rbcv__secret-l">Chave de {{ nome }} · {{ empresa }}</span>
          <code class="rbcv__code">{{ chave }}</code>
          <div class="rbcv__acoes">
            <button type="button" class="rbcv__copy" @click="copiar">
              {{ copiado ? 'Copiada' : 'Copiar' }}
            </button>
            <button type="button" class="rbcv__how" @click="conexaoAberta = true">Como conectar</button>
          </div>
        </div>

        <p class="rbcv__nota">
          Somente leitura: mercado, teses e notícias. O escritório pode revogar a chave a qualquer momento.
        </p>
      </template>
    </div>

    <RbConexaoModal :open="conexaoAberta" :plain-key="chave" @close="conexaoAberta = false" @gerar="conexaoAberta = false" />
  </NuAuthLayout>
</template>

<style scoped>
/* Espelha o ritmo vertical do /business/cadastro (rbcd__*), que espelha o do
   /login: as três telas ficam alinhadas quando abertas lado a lado. */
.rbcv { animation: nu-fade .5s ease both; }

.rbcv__eyebrow { display: block; color: var(--nu-blue); font-size: 14.5px; font-weight: 800; letter-spacing: -.01em; }
.rbcv__h1 {
  margin: 10px 0 0; color: var(--nu-ink);
  font-size: clamp(32px, 3.4vw, 44px); font-weight: 800; letter-spacing: -.04em; line-height: 1.05;
}
.rbcv__sub { margin: 16px 0 0; color: var(--nu-gray-2); font-size: 16px; font-weight: 500; line-height: 1.6; }

.rbcv__skel { margin-top: clamp(28px, 4vh, 44px); display: flex; flex-direction: column; gap: 18px; }

.rbcv__label { margin-top: clamp(28px, 4vh, 44px); }
.rbcv__erro { margin: 14px 0 0; color: var(--nu-ink); font-size: 14px; font-weight: 700; line-height: 1.55; }
.rbcv__cta { margin-top: clamp(32px, 4.5vh, 48px); }
.rbcv__divider { margin-top: 30px; }

.rbcv__passos { list-style: none; margin: 24px 0 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.rbcv__passo { display: flex; align-items: flex-start; gap: 12px; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 600; line-height: 1.5; }
.rbcv__n {
  width: 22px; height: 22px; flex-shrink: 0; margin-top: 1px;
  display: flex; align-items: center; justify-content: center;
  background: var(--nu-tile-blue-bg); color: var(--nu-blue); border-radius: 7px;
  font-size: 12px; font-weight: 800; font-variant-numeric: tabular-nums;
}

.rbcv__nota { margin: 26px 0 0; color: var(--nu-gray); font-size: 13.5px; font-weight: 500; line-height: 1.6; }
.rbcv__footer { margin-top: clamp(28px, 4vh, 44px); }

/* o segredo: o mesmo artefato navy do painel (RbKeysTable .rbkc__secret) */
.rbcv__secret {
  margin-top: clamp(28px, 4vh, 44px);
  background: var(--nu-navy); border-radius: var(--nu-r-card-lg); padding: clamp(22px, 3vw, 30px);
  box-shadow: var(--nu-shadow-card); animation: nu-fade .45s ease both;
}
.rbcv__secret-l { display: block; color: var(--nu-cream-text-50); font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; }
.rbcv__code {
  display: block; margin-top: 14px;
  background: var(--nu-navy-2); border: 1px solid var(--nu-cream-text-12); border-radius: var(--nu-r-input);
  padding: 16px 18px; color: var(--nu-cream-text);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13.5px; line-height: 1.5; word-break: break-all;
}
.rbcv__acoes { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
.rbcv__copy {
  min-height: 44px; padding: 0 22px; border: none; cursor: pointer;
  background: var(--nu-blue); color: var(--nu-white); border-radius: var(--nu-r-pill);
  font-size: 14px; font-weight: 800; font-family: inherit; transition: background .2s;
}
.rbcv__copy:hover { background: var(--nu-blue-hover); }
.rbcv__copy:focus-visible { outline: 2px solid var(--nu-cream-text); outline-offset: 2px; }
.rbcv__how {
  min-height: 44px; padding: 0 22px; cursor: pointer;
  background: transparent; border: 1.5px solid var(--nu-cream-text-22); color: var(--nu-cream-text);
  border-radius: var(--nu-r-pill); font-size: 14px; font-weight: 800; font-family: inherit;
  transition: background .2s;
}
.rbcv__how:hover { background: var(--nu-cream-text-12); }
.rbcv__how:focus-visible { outline: 2px solid var(--nu-cream-text); outline-offset: 2px; }
</style>
