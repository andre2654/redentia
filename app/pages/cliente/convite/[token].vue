<script setup lang="ts">
/**
 * /cliente/convite/[token] — a porta do CLIENTE FINAL de um escritório.
 *
 * O escritório (pelo painel ou pelo assistente, com create_client_invite)
 * gera um link de uso único. Quem abre é o cliente: lê o termo inteiro, vê o
 * escopo, o escritório e o assessor, e decide. Sem o aceite dele, o link não
 * dá acesso a nada — é por isso que a copy de compliance pode dizer que o
 * convite é "um link inerte até o cliente consentir".
 *
 * Estados: carregando → inválido (por motivo) | consentimento → conectando →
 * pronto (com o link de gestão, mostrado uma vez).
 *
 * DEMONSTRAÇÃO (clients_mode = 'demo'): nenhuma conta do cliente é conectada
 * e nenhuma posição dele é lida (ficam o nome e a prova do aceite); o servidor gera uma carteira fictícia. A página
 * diz isso com todas as letras, ANTES do botão e depois do aceite. No modo
 * 'pluggy' (conexão real, ainda não implementada) o servidor responde 409
 * mode_unavailable e a página explica que a conexão não está disponível.
 *
 * 100% CLIENT, de propósito (molde: /business/convite/[token]): o token está
 * na URL e o link de gestão é segredo. O SSR renderiza só a casca
 * "abrindo o convite", sem fetch; o onMounted consulta o backend. A rota é
 * private/no-store, Referrer-Policy no-referrer e noindex/nofollow no
 * nuxt.config (/cliente/**). Nada do convite entra em useState.
 *
 * Contrato: SPEC Contrato C, rotas C5 e C6. O texto do termo vem do servidor
 * (versão `terms_version`) e é renderizado como TEXTO, nunca v-html.
 */
import type { ClientConsentResult, ClientInviteInfo } from '~/types/clientes'

definePageMeta({ layout: false })

usePageSeo({
  title: 'Convite do seu escritório · Redentia',
  description: 'Leia o termo e decida se o seu escritório pode acompanhar as suas posições de investimento.',
  path: '/cliente/convite',
  robots: 'noindex, nofollow',
})
useHead({
  titleTemplate: null,
  // Reforço do header Referrer-Policy (nuxt.config): o token está na URL e não
  // pode vazar para nenhum link externo que a pessoa clicar daqui.
  meta: [{ name: 'referrer', content: 'no-referrer' }],
})

const route = useRoute()
const { publicFetch } = useApi()

const token = computed(() => (typeof route.params.token === 'string' ? route.params.token : ''))

type Estado = 'carregando' | 'invalido' | 'consentimento' | 'conectando' | 'pronto'
const estado = ref<Estado>('carregando')
const motivo = ref<string>('not_found')
const info = ref<ClientInviteInfo | null>(null)
const aceito = ref(false)
const erro = ref<string | null>(null)
const manageUrl = ref<string | null>(null)
const demoConectado = ref(false)
const copiado = ref(false)

/** Frase completa com saída, por motivo de recusa do servidor. */
const MOTIVOS: Record<string, { titulo: string, texto: string }> = {
  used: {
    titulo: 'Este convite já foi usado.',
    texto: 'Cada link vale uma vez. Se foi você quem consentiu, use o link de gestão que apareceu na hora. Se não foi, avise o seu escritório.',
  },
  expired: {
    titulo: 'Este convite venceu.',
    texto: 'O link vale 7 dias. Peça um novo ao seu escritório, se ainda quiser conectar.',
  },
  revoked: {
    titulo: 'Este convite foi cancelado.',
    texto: 'O escritório cancelou o link. Se ainda faz sentido, peça um novo a quem te mandou.',
  },
  account_disabled: {
    titulo: 'O escritório não pode receber conexões agora.',
    texto: 'A conta do escritório na Redentia não está liberada para isso. Fale com quem te mandou o link.',
  },
  clients_disabled: {
    titulo: 'O escritório não pode receber conexões agora.',
    texto: 'O recurso de clientes não está ligado na conta do escritório. Fale com quem te mandou o link.',
  },
  mode_unavailable: {
    titulo: 'A conexão com a sua instituição ainda não está disponível.',
    texto: 'Nada foi conectado e nenhuma posição sua foi lida. Avise o seu escritório: o link vai funcionar quando a conexão estiver pronta.',
  },
  not_found: {
    titulo: 'Este link não abre.',
    texto: 'Confira se ele foi colado inteiro. Se veio do seu escritório, peça para mandar de novo.',
  },
  erro: {
    titulo: 'Não conseguimos abrir o convite agora.',
    texto: 'Tente de novo em instantes. Se seguir assim, escreva pra contato@redentia.com.',
  },
}

function invalido(m: string) {
  motivo.value = MOTIVOS[m] ? m : 'erro'
  estado.value = 'invalido'
}

// onMounted registrado ANTES de qualquer await (o await mora dentro dele).
onMounted(async () => {
  if (!CLIENT_TOKEN_RE.test(token.value)) return invalido('not_found')
  try {
    const r = await publicFetch<ClientInviteInfo>(`/business/client-invites/${token.value}`)
    info.value = r
    if (!r.valid) return invalido(r.reason ?? 'erro')
    // Conexão real (Pluggy) ainda não existe: melhor dizer agora do que deixar
    // a pessoa ler o termo inteiro e levar o 409 no botão.
    if (r.mode === 'pluggy') return invalido('mode_unavailable')
    if (r.mode !== 'demo') return invalido('clients_disabled')
    estado.value = 'consentimento'
  }
  catch (e: unknown) {
    const st = (e as { response?: { status?: number } })?.response?.status
    invalido(st === 404 ? 'not_found' : 'erro')
  }
})

const escritorio = computed(() => info.value?.office?.name ?? null)
const ehDemo = computed(() => info.value?.mode === 'demo')

async function consentir() {
  if (!aceito.value || !info.value || estado.value === 'conectando') return
  erro.value = null
  estado.value = 'conectando'
  try {
    const r = await publicFetch<ClientConsentResult>(`/business/client-invites/${token.value}/consent`, {
      method: 'POST',
      // o hash do texto MOSTRADO: se o termo mudou entre abrir e aceitar
      // (outra chave, outro nome do escritório), o servidor recusa com 409
      body: { accept: true, terms_version: info.value.terms_version, terms_sha256: info.value.terms_sha256 },
    })
    manageUrl.value = r.manage_url ?? null
    demoConectado.value = Boolean(r.demo)
    estado.value = 'pronto'
  }
  catch (e: unknown) {
    const err = e as { response?: { status?: number }, data?: { error?: string, message?: string, reason?: string | null } }
    const st = err.response?.status
    const code = err.data?.error ?? ''
    // 410 invite_invalid {reason} = link usado/vencido/cancelado: não adianta tentar de novo.
    const recusa = motivoDaRecusaDoConsentimento(st, err.data)
    if (recusa) return invalido(recusa)
    if (MOTIVOS[code] && code !== 'erro') return invalido(code)
    // Termo mudou entre abrir e aceitar: a pessoa precisa ler o novo.
    estado.value = 'consentimento'
    erro.value = err.data?.message
      ?? ({
        terms_outdated: 'O termo foi atualizado enquanto você lia. Recarregue a página para ler a versão nova antes de aceitar.',
        terms_version: 'O termo foi atualizado enquanto você lia. Recarregue a página para ler a versão nova antes de aceitar.',
        rate_limited: 'Muitas tentativas seguidas. Espere um minuto e tente de novo.',
      }[code] ?? 'Não deu para registrar o seu consentimento agora. Nada foi conectado. Tente de novo; se seguir assim, escreva pra contato@redentia.com.')
  }
}

let copiaTimer: ReturnType<typeof setTimeout> | undefined
async function copiar() {
  if (!manageUrl.value) return
  try { await navigator.clipboard?.writeText(manageUrl.value) }
  catch { /* clipboard bloqueado: o link segue na tela para copiar à mão */ }
  copiado.value = true
  clearTimeout(copiaTimer)
  copiaTimer = setTimeout(() => { copiado.value = false }, 1600)
}
onBeforeUnmount(() => clearTimeout(copiaTimer))
</script>

<template>
  <NuAuthLayout logo-to="/">
    <template #panel><ClienteAside /></template>

    <div class="clc">
      <span class="clc__eyebrow">Convite do seu escritório</span>

      <!-- abrindo: a forma do que vem, sem spinner -->
      <template v-if="estado === 'carregando'">
        <h1 class="clc__h1">Abrindo o convite.</h1>
        <div class="clc__skel">
          <NuSkeleton variant="text" :lines="2" />
          <NuSkeleton variant="block" height="180px" radius="card" />
          <NuSkeleton variant="block" height="52px" radius="pill" />
        </div>
      </template>

      <template v-else-if="estado === 'invalido'">
        <h1 class="clc__h1">{{ MOTIVOS[motivo]?.titulo }}</h1>
        <p class="clc__sub" role="alert">{{ MOTIVOS[motivo]?.texto }}</p>
      </template>

      <template v-else-if="(estado === 'consentimento' || estado === 'conectando') && info">
        <h1 class="clc__h1">
          <template v-if="escritorio">{{ escritorio }} quer acompanhar os seus investimentos.</template>
          <template v-else>O seu escritório quer acompanhar os seus investimentos.</template>
        </h1>
        <p class="clc__sub">
          <template v-if="info.client_name">{{ info.client_name }}, leia</template><template v-else>Leia</template>
          o termo abaixo e decida. Sem o seu aceite, este link não dá acesso a nada.
        </p>

        <p v-if="ehDemo" class="clc__demo" role="note">
          <strong>Isto é uma demonstração: nenhuma conta sua será conectada e nenhuma posição sua será lida.</strong>
          Ficam registrados só o seu nome, como o escritório o cadastrou, e a prova do aceite (data, IP e navegador).
          Se você aceitar, a Redentia gera uma carteira fictícia para o escritório testar o fluxo.
        </p>

        <dl class="clc__ficha">
          <div v-if="escritorio"><dt>Escritório</dt><dd>{{ escritorio }}</dd></div>
          <div v-if="info.advisor_label"><dt>Assessor</dt><dd>{{ info.advisor_label }}</dd></div>
          <div v-if="info.scope?.length">
            <dt>O que o escritório vê</dt>
            <dd>
              <ul class="clc__escopo">
                <li v-for="s in info.scope" :key="s">{{ clientScopeLabel(s) }}</li>
              </ul>
            </dd>
          </div>
          <div v-if="info.expires_at"><dt>Este convite vale até</dt><dd class="clc__num">{{ dataCurta(info.expires_at) }}</dd></div>
        </dl>

        <div class="clc__termo-h">
          <span>Termo de consentimento</span>
          <span class="clc__termo-v">versão {{ info.terms_version }}</span>
        </div>
        <div class="clc__termo" tabindex="0" role="region" aria-label="Termo de consentimento completo">{{ info.terms_text }}</div>

        <label class="clc__aceite">
          <input v-model="aceito" type="checkbox" class="clc__check" :disabled="estado === 'conectando'">
          <span>Li o termo inteiro e consinto. Sei que posso revogar quando quiser, de graça, pelo link que aparece depois do aceite.</span>
        </label>

        <p v-if="erro" class="clc__erro" role="alert">{{ erro }}</p>

        <template v-if="estado === 'conectando'">
          <div class="clc__conectando" role="status">
            <span class="clc__conectando-t">{{ ehDemo ? 'Gerando a carteira de demonstração.' : 'Conectando.' }}</span>
            <NuSkeleton variant="block" height="52px" radius="pill" />
          </div>
        </template>
        <NuPillButton v-else class="clc__cta" :disabled="!aceito" @click="consentir">
          {{ ehDemo ? 'Consentir e gerar a demonstração' : 'Consentir' }}
        </NuPillButton>
      </template>

      <template v-else-if="estado === 'pronto'">
        <h1 class="clc__h1">{{ demoConectado ? 'Pronto. A demonstração está ligada.' : 'Pronto. O acesso está ligado.' }}</h1>
        <p class="clc__sub">
          <template v-if="demoConectado">
            {{ escritorio ?? 'O escritório' }} vê agora uma carteira fictícia, gerada pela Redentia. Nenhuma conta sua foi conectada e nenhuma posição sua foi lida.
          </template>
          <template v-else>
            {{ escritorio ?? 'O escritório' }} passa a ver as suas posições de investimento, nos termos que você aceitou.
          </template>
        </p>

        <div v-if="manageUrl" class="clc__secret" role="status">
          <span class="clc__secret-l">Seu link de gestão</span>
          <code class="clc__code" data-clarity-mask="true">{{ manageUrl }}</code>
          <div class="clc__acoes">
            <button type="button" class="clc__copy" @click="copiar">{{ copiado ? 'Copiado' : 'Copiar link' }}</button>
            <a :href="manageUrl" class="clc__how" rel="noreferrer">Abrir</a>
          </div>
        </div>
        <p class="clc__nota">
          Guarde este link agora: ele não aparece de novo. É por ele que você vê quem consultou e quando,
          e revoga o acesso com um clique, a qualquer momento.
        </p>
      </template>
    </div>
  </NuAuthLayout>
</template>

<style scoped>
/* Mesmo ritmo vertical do /business/convite (rbcv__*), que espelha o /login. */
.clc { animation: nu-fade .5s ease both; }

.clc__eyebrow { display: block; color: var(--nu-blue); font-size: 14.5px; font-weight: 800; letter-spacing: -.01em; }
.clc__h1 {
  margin: 10px 0 0; color: var(--nu-ink);
  font-size: clamp(28px, 3.1vw, 40px); font-weight: 800; letter-spacing: -.04em; line-height: 1.06;
  text-wrap: balance;
}
.clc__sub { margin: 16px 0 0; color: var(--nu-gray-2); font-size: 16px; font-weight: 500; line-height: 1.6; }

.clc__skel { margin-top: clamp(28px, 4vh, 44px); display: flex; flex-direction: column; gap: 18px; }

.clc__demo {
  margin: 22px 0 0; padding: 16px 18px; border-radius: var(--nu-r-card);
  background: var(--nu-cream); border: 1.5px solid var(--nu-cream-line);
  color: var(--nu-ink); font-size: 14.5px; font-weight: 500; line-height: 1.55;
}
.clc__demo strong { display: block; margin-bottom: 4px; font-weight: 800; }

.clc__ficha { margin: 24px 0 0; display: flex; flex-direction: column; gap: 12px; }
.clc__ficha > div { display: flex; flex-direction: column; gap: 3px; }
.clc__ficha dt { color: var(--nu-gray); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; }
.clc__ficha dd { margin: 0; color: var(--nu-ink); font-size: 15px; font-weight: 700; line-height: 1.5; }
.clc__num { font-variant-numeric: tabular-nums; }
.clc__escopo { margin: 0; padding: 0; list-style: none; }
.clc__escopo li { font-weight: 600; }

.clc__termo-h {
  margin-top: 26px; display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap;
  color: var(--nu-ink); font-size: 14px; font-weight: 800;
}
.clc__termo-v { color: var(--nu-gray); font-size: 12.5px; font-weight: 700; font-variant-numeric: tabular-nums; }
.clc__termo {
  margin-top: 10px; max-height: 260px; overflow-y: auto; white-space: pre-wrap; overflow-wrap: anywhere;
  padding: 16px 18px; border-radius: var(--nu-r-input); background: var(--nu-cream); border: 1px solid var(--nu-cream-line);
  color: var(--nu-gray-2); font-size: 13.5px; font-weight: 500; line-height: 1.6;
}
.clc__termo:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

.clc__aceite {
  margin-top: 20px; display: flex; align-items: flex-start; gap: 12px; cursor: pointer;
  color: var(--nu-ink); font-size: 14.5px; font-weight: 600; line-height: 1.5;
}
.clc__check { width: 20px; height: 20px; margin: 1px 0 0; flex-shrink: 0; accent-color: var(--nu-blue); cursor: pointer; }

.clc__erro { margin: 14px 0 0; color: var(--nu-ink); font-size: 14px; font-weight: 700; line-height: 1.55; }
.clc__cta { margin-top: 24px; }
.clc__conectando { margin-top: 24px; display: flex; flex-direction: column; gap: 12px; }
.clc__conectando-t { color: var(--nu-gray-2); font-size: 14.5px; font-weight: 700; }

/* o segredo: o mesmo artefato navy do convite de chave */
.clc__secret {
  margin-top: clamp(28px, 4vh, 40px);
  background: var(--nu-navy); border-radius: var(--nu-r-card-lg); padding: clamp(22px, 3vw, 30px);
  box-shadow: var(--nu-shadow-card); animation: nu-fade .45s ease both;
}
.clc__secret-l { display: block; color: var(--nu-cream-text-50); font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; }
.clc__code {
  display: block; margin-top: 14px;
  background: var(--nu-navy-2); border: 1px solid var(--nu-cream-text-12); border-radius: var(--nu-r-input);
  padding: 16px 18px; color: var(--nu-cream-text);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px; line-height: 1.5; word-break: break-all;
}
.clc__acoes { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
.clc__copy {
  min-height: 44px; padding: 0 22px; border: none; cursor: pointer;
  background: var(--nu-blue); color: var(--nu-white); border-radius: var(--nu-r-pill);
  font-size: 14px; font-weight: 800; font-family: inherit; transition: background .2s;
}
.clc__copy:hover { background: var(--nu-blue-hover); }
.clc__copy:focus-visible { outline: 2px solid var(--nu-cream-text); outline-offset: 2px; }
.clc__how {
  min-height: 44px; padding: 0 22px; display: inline-flex; align-items: center;
  background: transparent; border: 1.5px solid var(--nu-cream-text-22); color: var(--nu-cream-text);
  border-radius: var(--nu-r-pill); font-size: 14px; font-weight: 800; transition: background .2s;
}
.clc__how:hover { background: var(--nu-cream-text-12); color: var(--nu-cream-text); }
.clc__how:focus-visible { outline: 2px solid var(--nu-cream-text); outline-offset: 2px; }

.clc__nota { margin: 20px 0 0; color: var(--nu-gray); font-size: 13.5px; font-weight: 500; line-height: 1.6; }
</style>
