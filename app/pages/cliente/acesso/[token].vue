<script setup lang="ts">
/**
 * /cliente/acesso/[token] — a página de gestão do CLIENTE FINAL.
 *
 * O link chega uma vez, na tela de "pronto" do consentimento
 * (/cliente/convite/[token]). Por ele o cliente vê o status do acesso, o que
 * o escritório alcança, desde quando e até quando, e o registro de quem
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
  <NuAuthLayout logo-to="/">
    <template #aside>Você decide quem acompanha<br>a sua carteira. E desliga quando quiser.</template>

    <div class="cla">
      <span class="cla__eyebrow">Seu acesso</span>

      <template v-if="estado === 'carregando'">
        <h1 class="cla__h1">Abrindo.</h1>
        <div class="cla__skel">
          <NuSkeleton variant="text" :lines="2" />
          <NuSkeleton variant="block" height="140px" radius="card" />
          <NuSkeleton variant="text" :lines="4" />
        </div>
      </template>

      <template v-else-if="estado === 'invalido'">
        <h1 class="cla__h1">Este link não abre.</h1>
        <p class="cla__sub" role="alert">
          Confira se ele foi colado inteiro, exatamente como apareceu depois do seu consentimento.
          Se perdeu o link, peça ao seu escritório para revogar o acesso pelo painel deles.
        </p>
      </template>

      <template v-else-if="estado === 'erro'">
        <h1 class="cla__h1">Não conseguimos abrir agora.</h1>
        <p class="cla__sub" role="alert">Tente de novo em instantes. Se seguir assim, escreva pra contato@redentia.com.</p>
        <button type="button" class="cla__retry" @click="carregar">Tentar de novo</button>
      </template>

      <template v-else-if="info">
        <h1 class="cla__h1">{{ titulo }}</h1>
        <p v-if="info.demo" class="cla__demo" role="note">
          <strong>Demonstração.</strong> Nenhuma conta sua foi conectada e nenhum dado seu foi lido: o escritório vê uma carteira fictícia, gerada pela Redentia.
        </p>

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
          <div v-if="info.until"><dt>{{ ativo ? 'Vale até' : 'Até' }}</dt><dd class="cla__num">{{ dataCurta(info.until) }}</dd></div>
        </dl>

        <div v-if="ativo" class="cla__revogar">
          <button type="button" class="cla__btn" :class="{ 'cla__btn--armado': armado }" :disabled="revogando" @click="revogar">
            {{ revogando ? 'Revogando…' : armado ? 'Confirmar: revogar agora' : 'Revogar acesso' }}
          </button>
          <p class="cla__hint">
            {{ armado
              ? 'Clique de novo em até 5 segundos para confirmar. O escritório perde o acesso e as posições são apagadas na hora.'
              : 'É de graça e vale na hora: o escritório perde o acesso e as posições guardadas são apagadas.' }}
          </p>
          <p v-if="erroAcao" class="cla__erro" role="alert">{{ erroAcao }}</p>
        </div>

        <h2 class="cla__h2">Quem consultou e quando</h2>
        <p v-if="!info.log?.length" class="cla__vazio">Ainda não há registro de acesso.</p>
        <ol v-else class="cla__log">
          <li v-for="(l, i) in info.log" :key="i" class="cla__log-i">
            <span class="cla__log-a">{{ clientActionLabel(l.action, info.demo) }}</span>
            <span class="cla__log-m">{{ clientActorLabel(l.actor, true) }}<template v-if="l.at"> · <span class="cla__num">{{ dataHora(l.at) }}</span></template></span>
          </li>
        </ol>
        <p class="cla__nota">Mostra os 20 registros mais recentes. O registro nunca guarda as suas posições.</p>
      </template>
    </div>
  </NuAuthLayout>
</template>

<style scoped>
.cla { animation: nu-fade .5s ease both; }
.cla__eyebrow { display: block; color: var(--nu-blue); font-size: 14.5px; font-weight: 800; letter-spacing: -.01em; }
.cla__h1 {
  margin: 10px 0 0; color: var(--nu-ink);
  font-size: clamp(30px, 3.2vw, 42px); font-weight: 800; letter-spacing: -.04em; line-height: 1.05; text-wrap: balance;
}
.cla__sub { margin: 16px 0 0; color: var(--nu-gray-2); font-size: 16px; font-weight: 500; line-height: 1.6; }
.cla__skel { margin-top: clamp(28px, 4vh, 44px); display: flex; flex-direction: column; gap: 18px; }

.cla__retry {
  margin-top: 22px; min-height: 44px; padding: 0 24px; border: none; cursor: pointer;
  background: var(--nu-blue); color: var(--nu-white); border-radius: var(--nu-r-pill);
  font-size: 15px; font-weight: 800; font-family: inherit;
}
.cla__retry:focus-visible { outline: 2px solid var(--nu-ink); outline-offset: 2px; }

.cla__demo {
  margin: 20px 0 0; padding: 16px 18px; border-radius: var(--nu-r-card);
  background: var(--nu-cream); border: 1.5px solid var(--nu-cream-line);
  color: var(--nu-ink); font-size: 14.5px; font-weight: 500; line-height: 1.55;
}
.cla__demo strong { font-weight: 800; }

.cla__ficha { margin: 24px 0 0; display: flex; flex-direction: column; gap: 12px; }
.cla__ficha > div { display: flex; flex-direction: column; gap: 3px; }
.cla__ficha dt { color: var(--nu-gray); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; }
.cla__ficha dd { margin: 0; color: var(--nu-ink); font-size: 15px; font-weight: 700; line-height: 1.5; }
.cla__escopo { margin: 0; padding: 0; list-style: none; }
.cla__escopo li { font-weight: 600; }
.cla__num { font-variant-numeric: tabular-nums; }

.cla__revogar { margin-top: 28px; }
.cla__btn {
  min-height: 48px; padding: 0 26px; cursor: pointer; font-family: inherit;
  background: var(--nu-white); color: var(--nu-red-2); border: 1.5px solid var(--nu-red-2);
  border-radius: var(--nu-r-pill); font-size: 15.5px; font-weight: 800; transition: background .2s, color .2s;
}
.cla__btn--armado { background: var(--nu-red-2); color: var(--nu-white); }
.cla__btn:disabled { opacity: .6; cursor: default; }
.cla__btn:focus-visible { outline: 2px solid var(--nu-ink); outline-offset: 2px; }
.cla__hint { margin: 10px 0 0; color: var(--nu-gray); font-size: 13.5px; font-weight: 600; line-height: 1.55; }
.cla__erro { margin: 10px 0 0; color: var(--nu-ink); font-size: 14px; font-weight: 700; line-height: 1.55; }

.cla__h2 { margin: 34px 0 0; color: var(--nu-ink); font-size: 18px; font-weight: 800; letter-spacing: -.02em; }
.cla__vazio { margin: 10px 0 0; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; }
.cla__log { list-style: none; margin: 12px 0 0; padding: 0; }
.cla__log-i { display: flex; flex-direction: column; gap: 2px; padding: 11px 0; border-top: 1px solid var(--nu-cream-line); }
.cla__log-a { color: var(--nu-ink); font-size: 14.5px; font-weight: 700; }
.cla__log-m { color: var(--nu-gray); font-size: 13px; font-weight: 600; }
.cla__nota { margin: 14px 0 0; color: var(--nu-gray); font-size: 12.5px; font-weight: 500; line-height: 1.55; }
</style>
