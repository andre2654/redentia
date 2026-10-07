<script setup lang="ts">
/**
 * /cliente/acesso/[token] — a página de gestão do CLIENTE FINAL, no mesmo
 * cartão do widget de conexão (ClienteConnect), sem voltar nem fechar.
 *
 * O link chega uma vez, na tela de sucesso do widget (/cliente/convite). Por
 * ele o cliente vê o status do acesso, a instituição que escolheu, o que o
 * escritório alcança, desde quando e até quando, e o registro de quem
 * consultou (sem as posições: o log do servidor nunca guarda carteira). E
 * revoga com um clique: o servidor apaga posições e conexões na hora e grava
 * a revogação no log (Contrato C, rotas C7 e C8).
 *
 * Revogar é irreversível, então o primeiro clique só ARMA o segundo, com
 * desarme sozinho em 5 s (mesmo padrão do revogar chave em /business/chaves).
 *
 * 100% CLIENT: o token de gestão está na URL e é segredo. SSR = casca com
 * skeleton; o fetch roda no onMounted. private/no-store, Referrer-Policy
 * no-referrer e noindex/nofollow vêm do nuxt.config (/cliente/**).
 */
import type { ClientAccessInfo } from '~/types/clientes'
import { instituicaoPorNome, type Instituicao } from '~/content/instituicoes'

definePageMeta({ layout: false })

usePageSeo({
  title: 'Seu acesso · Redentia',
  description: 'Veja quem acompanha as suas posições de investimento e revogue quando quiser.',
  path: '/cliente/acesso',
  robots: 'noindex, nofollow',
})
useHead({ titleTemplate: null, meta: [{ name: 'referrer', content: 'no-referrer' }] })

const route = useRoute()
const { publicFetch } = useApi()
const token = computed(() => (typeof route.params.token === 'string' ? route.params.token : ''))

type Estado = 'carregando' | 'invalido' | 'erro' | 'ok'
const estado = ref<Estado>('carregando')
const info = ref<ClientAccessInfo | null>(null)
const armado = ref(false)
const revogando = ref(false)
const erroAcao = ref<string | null>(null)

async function carregar() {
  estado.value = 'carregando'
  try {
    info.value = await publicFetch<ClientAccessInfo>(`/business/client-access/${token.value}`)
    estado.value = 'ok'
  }
  catch (e: unknown) {
    const st = (e as { response?: { status?: number } })?.response?.status
    estado.value = st === 404 ? 'invalido' : 'erro'
  }
}

// onMounted antes de qualquer await.
onMounted(() => {
  if (!CLIENT_TOKEN_RE.test(token.value)) {
    estado.value = 'invalido'
    return
  }
  carregar()
})

const escritorio = computed(() => {
  const o = info.value?.office
  if (!o) return null
  return typeof o === 'string' ? o : o.name
})
const ativo = computed(() => info.value?.status === 'active')

/** A instituição que a pessoa escolheu na conexão (o C7 manda o nome); sem logo, iniciais. */
const inst = computed<Instituicao | null>(() => {
  const nome = info.value?.institution
  if (!nome) return null
  return instituicaoPorNome(nome) ?? { slug: '', name: nome, logo: false, tipo: 'banco' }
})

const TITULO: Record<string, string> = {
  active: 'O acesso está ligado.',
  pending: 'O acesso ainda não foi ligado.',
  revoked: 'O acesso está revogado.',
  expired: 'O acesso venceu.',
}
const titulo = computed(() => TITULO[info.value?.status ?? ''] ?? 'O seu acesso.')

let armaTimer: ReturnType<typeof setTimeout> | undefined
async function revogar() {
  if (!ativo.value || revogando.value) return
  clearTimeout(armaTimer)
  if (!armado.value) {
    armado.value = true
    armaTimer = setTimeout(() => { armado.value = false }, 5000)
    return
  }
  armado.value = false
  revogando.value = true
  erroAcao.value = null
  try {
    await publicFetch<{ status: string }>(`/business/client-access/${token.value}/revoke`, { method: 'POST' })
    // Recarrega do servidor: o status e a linha nova do log vêm de lá, não
    // de uma suposição da tela.
    await carregar()
  }
  catch (e: unknown) {
    const msg = (e as { data?: { message?: string } })?.data?.message
    erroAcao.value = msg ?? 'Não deu para revogar agora. O acesso continua como estava. Tente de novo; se seguir assim, escreva pra contato@redentia.com.'
  }
  finally {
    revogando.value = false
  }
}
onBeforeUnmount(() => clearTimeout(armaTimer))
</script>

<template>
  <ClienteConnect :passo="estado" rotulo="Gestão do acesso">
    <section class="cla">
      <template v-if="estado === 'carregando'">
        <span class="cla__sr" role="status">Abrindo.</span>
        <div class="cla__skel" aria-hidden="true">
          <NuSkeleton variant="text" :lines="2" last-width="60%" />
          <NuSkeleton variant="block" height="120px" radius="12px" />
          <NuSkeleton variant="text" :lines="4" />
        </div>
      </template>

      <template v-else-if="estado === 'invalido'">
        <div class="cla__glifo cla__glifo--alerta" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
        </div>
        <h1 data-cc-titulo tabindex="-1" class="cla__h1 cla__h1--centro">Este link não abre.</h1>
        <p class="cla__p cla__p--centro" role="alert">
          Confira se ele foi colado inteiro, exatamente como apareceu depois da sua conexão.
          Se perdeu o link, peça ao seu escritório para revogar o acesso pelo painel deles.
        </p>
      </template>

      <template v-else-if="estado === 'erro'">
        <div class="cla__glifo cla__glifo--alerta" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
        </div>
        <h1 data-cc-titulo tabindex="-1" class="cla__h1 cla__h1--centro">Não conseguimos abrir agora.</h1>
        <p class="cla__p cla__p--centro" role="alert">Tente de novo em instantes. Se seguir assim, escreva pra contato@redentia.com.</p>
        <footer class="cla__foot">
          <ClienteConnectButton @click="carregar">Tentar de novo</ClienteConnectButton>
        </footer>
      </template>

      <template v-else-if="info">
        <div class="cla__topo">
          <ClienteInstLogo v-if="inst" :inst="inst" :size="44" />
          <div class="cla__topo-t">
            <h1 data-cc-titulo tabindex="-1" class="cla__h1">{{ titulo }}</h1>
            <p v-if="inst" class="cla__inst">{{ inst.name }}</p>
          </div>
        </div>

        <dl class="cla__ficha">
          <div v-if="escritorio"><dt>Escritório</dt><dd>{{ escritorio }}</dd></div>
          <div v-if="info.advisor_label"><dt>Assessor</dt><dd>{{ info.advisor_label }}</dd></div>
          <div v-if="info.scope?.length">
            <dt>O que o escritório vê</dt>
            <dd>
              <ul class="cla__escopo">
                <li v-for="s in info.scope" :key="s">{{ clientScopeLabel(s) }}</li>
              </ul>
            </dd>
          </div>
          <div v-if="info.since"><dt>Desde</dt><dd class="cla__num">{{ dataCurta(info.since) }}</dd></div>
          <div v-if="!ativo && info.revoked_at"><dt>Revogado em</dt><dd class="cla__num">{{ dataCurta(info.revoked_at) }}</dd></div>
          <div v-else-if="info.until"><dt>{{ ativo ? 'Vale até' : 'Até' }}</dt><dd class="cla__num">{{ dataCurta(info.until) }}</dd></div>
        </dl>

        <div v-if="ativo" class="cla__revogar">
          <ClienteConnectButton variant="danger" :armado="armado" :loading="revogando" @click="revogar">
            {{ revogando ? 'Revogando…' : armado ? 'Confirmar: revogar agora' : 'Revogar acesso' }}
          </ClienteConnectButton>
          <p class="cla__hint">
            {{ armado
              ? 'Clique de novo em até 5 segundos para confirmar. O escritório perde o acesso e as posições guardadas na Redentia são apagadas na hora.'
              : 'É de graça e vale na hora: o escritório perde o acesso e as posições guardadas na Redentia são apagadas. O que ele já consultou no assistente de IA dele não é apagado pela Redentia; peça isso ao escritório.' }}
          </p>
          <p v-if="erroAcao" class="cla__erro" role="alert">{{ erroAcao }}</p>
        </div>

        <h2 class="cla__h2">Quem consultou e quando</h2>
        <p v-if="!info.log?.length" class="cla__vazio">Ainda não há registro de acesso.</p>
        <ol v-else class="cla__log">
          <li v-for="(l, i) in info.log" :key="i" class="cla__log-i">
            <span class="cla__log-a">{{ clientActionLabel(l.action) }}</span>
            <span class="cla__log-m">{{ clientActorLabel(l.actor, true) }}<template v-if="l.at"> · <span class="cla__num">{{ dataHora(l.at) }}</span></template></span>
          </li>
        </ol>
        <p class="cla__nota">
          Mostra os 20 registros mais recentes. O registro nunca guarda as suas posições; a prova do aceite (data, IP e navegador)
          fica guardada pelo prazo descrito no termo.
        </p>
      </template>
    </section>
  </ClienteConnect>
</template>

<style scoped>
.cla { flex: 1 1 auto; display: flex; flex-direction: column; }
.cla__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.cla__skel { display: flex; flex-direction: column; gap: 16px; }

.cla__glifo {
  width: 52px; height: 52px; margin: 26px auto 0; border-radius: 16px; background: var(--nu-cream); color: var(--nu-gray-2);
  display: flex; align-items: center; justify-content: center;
}
.cla__glifo--alerta { background: var(--nu-amber-bg); color: var(--nu-amber-text); }

.cla__topo { display: flex; align-items: center; gap: 14px; }
.cla__topo-t { min-width: 0; }
.cla__h1 { margin: 0; color: var(--nu-ink); font-size: 19px; font-weight: 800; letter-spacing: -.03em; line-height: 1.2; outline: none; }
.cla__h1--centro { margin-top: 18px; text-align: center; text-wrap: balance; }
.cla__inst { margin: 3px 0 0; color: var(--nu-gray); font-size: 13px; font-weight: 700; }
.cla__p { margin: 10px 0 0; color: var(--nu-gray-2); font-size: 14px; font-weight: 500; line-height: 1.55; }
.cla__p--centro { text-align: center; }
.cla__foot { margin-top: auto; padding-top: 22px; }

.cla__ficha { margin: 18px 0 0; display: flex; flex-direction: column; gap: 11px; }
.cla__ficha > div { display: flex; flex-direction: column; gap: 2px; }
.cla__ficha dt { color: var(--nu-gray); font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; }
.cla__ficha dd { margin: 0; color: var(--nu-ink); font-size: 14px; font-weight: 700; line-height: 1.5; }
.cla__escopo { margin: 0; padding: 0; list-style: none; }
.cla__escopo li { font-weight: 600; }
.cla__num { font-variant-numeric: tabular-nums; }

.cla__revogar { margin-top: 20px; }
.cla__hint { margin: 10px 0 0; color: var(--nu-gray); font-size: 12.5px; font-weight: 600; line-height: 1.5; }
.cla__erro { margin: 10px 0 0; color: var(--nu-ink); font-size: 13.5px; font-weight: 700; line-height: 1.5; }

.cla__h2 { margin: 26px 0 0; color: var(--nu-ink); font-size: 15px; font-weight: 800; letter-spacing: -.02em; }
.cla__vazio { margin: 8px 0 0; color: var(--nu-gray-2); font-size: 13.5px; font-weight: 500; }
.cla__log { list-style: none; margin: 8px 0 0; padding: 0; }
.cla__log-i { display: flex; flex-direction: column; gap: 2px; padding: 10px 0; border-top: 1px solid var(--nu-cream-2); }
.cla__log-a { color: var(--nu-ink); font-size: 13.5px; font-weight: 700; }
.cla__log-m { color: var(--nu-gray); font-size: 12.5px; font-weight: 600; }
.cla__nota { margin: 12px 0 0; color: var(--nu-gray); font-size: 12px; font-weight: 500; line-height: 1.5; }
</style>
