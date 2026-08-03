<script setup lang="ts">
/**
 * /business/chaves — a conta B2B mínima (PR-F do MVP): a chave MCP da pessoa,
 * com a moldura do escritório em vez do chrome de investidor do /conta.
 *
 * REUSO, NÃO REESCRITA: toda a lógica é o useMcp que o /conta já usa (uma
 * implementação por responsabilidade). O que muda é a apresentação:
 *  - sem os 4 toggles de escopo do B2C; aqui os escopos são FATOS do plano
 *    (mercado, teses e notícias incluídos; carteira segue o plano da conta).
 *  - tier e quota SÓ aparecem quando o backend devolver `tier` no /me/mcp
 *    (PR-A do plano). Antes disso a página não afirma limite nenhum, porque
 *    limite não aplicado é promessa falsa. O cast opcional abaixo é o gancho.
 *
 * Autenticada: mesma guarda do /conta (nu:token → /login?redirect=). A rota é
 * private/no-store no nuxt.config.
 */
import type { McpStatus } from '~/composables/useMcp'

definePageMeta({
  layout: 'business',
  middleware: [
    (to) => {
      const token = useCookie<string | null>('nu:token')
      if (!token.value) {
        return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`, { replace: true })
      }
    },
  ],
})

usePageSeo({
  title: 'Chaves · Redentia For Business',
  description: 'Gere e gerencie a sua chave MCP da Redentia For Business.',
  path: '/business/chaves',
  robots: 'noindex, follow',
})
useHead({ titleTemplate: null })

// tier chega quando o backend do MVP (PR-A) subir; antes, a página fica muda
type BizStatus = McpStatus & { tier?: 'b2c' | 'biz' }
const { status, plainKey, loading, busy, hydrate, rotate, setEnabled } = useMcp()
const biz = computed(() => (status.value as BizStatus | null)?.tier === 'biz')
const temTier = computed(() => Boolean((status.value as BizStatus | null)?.tier))

const erro = ref<string | null>(null)
const copiado = ref(false)

onMounted(async () => {
  try {
    await hydrate()
  } catch {
    erro.value = 'Não conseguimos carregar a sua chave agora. Recarregue a página; se seguir assim, escreva pra contato@redentia.com.'
  }
})

async function agir(fn: () => Promise<unknown>) {
  erro.value = null
  try {
    await fn()
  } catch {
    erro.value = 'A ação não completou. Tente de novo; se seguir assim, escreva pra contato@redentia.com.'
  }
}

let copiaTimer: ReturnType<typeof setTimeout> | undefined
async function copiar() {
  if (!plainKey.value) return
  try { await navigator.clipboard?.writeText(plainKey.value) } catch { /* clipboard bloqueado */ }
  copiado.value = true
  clearTimeout(copiaTimer)
  copiaTimer = setTimeout(() => { copiado.value = false }, 1600)
}
onBeforeUnmount(() => clearTimeout(copiaTimer))

const ultimoUso = computed(() => {
  const d = status.value?.last_used_at
  if (!d) return 'nunca usada'
  return `último uso em ${new Date(d).toLocaleDateString('pt-BR')}`
})
</script>

<template>
  <section class="rbch">
    <div class="rbch__cols">
      <div class="rbch__intro">
        <NuSectionHeading eyebrow="Suas chaves">
          A chave é sua,<br>não do escritório.
          <template #dek>
            Uma chave por pessoa: quem sai tem a própria chave desligada
            <strong>sem derrubar o resto do time</strong>. Ela dá acesso de
            leitura ao catálogo, e aparece em claro uma única vez.
          </template>
        </NuSectionHeading>

        <dl class="rbch__fatos">
          <div class="rbch__fato">
            <dt>Incluído</dt>
            <dd>Mercado, teses e notícias: cotações, busca de ativos, resumo do dia e briefing.</dd>
          </div>
          <div v-if="biz" class="rbch__fato">
            <dt>Carteira</dt>
            <dd>Desligada no plano para escritórios. O catálogo B2B não acessa dado de carteira.</dd>
          </div>
          <div v-if="temTier" class="rbch__fato">
            <dt>Plano</dt>
            <dd>{{ biz ? 'Escritório: 5.000 chamadas por dia por chave.' : 'Gratuito: 50 chamadas por dia. Plano de escritório se ativa no setup.' }}</dd>
          </div>
          <div class="rbch__fato">
            <dt>Revogação</dt>
            <dd>Desligar vale em até um minuto. Gerar uma nova invalida a anterior no mesmo prazo.</dd>
          </div>
        </dl>
      </div>

      <div class="rbch__right">
        <div class="rbch__card">
          <span class="rbch__card-label">Sua chave MCP</span>

          <NuSkeleton v-if="loading" :lines="3" />

          <template v-else-if="status">
            <template v-if="status.has_key">
              <div v-if="plainKey" class="rbch__plain">
                <code class="rbch__code">{{ plainKey }}</code>
                <button type="button" class="rbch__copy" @click="copiar">
                  {{ copiado ? 'Copiada' : 'Copiar' }}
                </button>
                <p class="rbch__warn">Guarde agora: ela não aparece de novo. Pra ver outra, gere uma nova.</p>
              </div>
              <div v-else class="rbch__masked">
                <code class="rbch__code">{{ status.key_masked }}</code>
                <p class="rbch__meta">{{ status.enabled ? 'Ligada' : 'Desligada' }} · {{ ultimoUso }}</p>
              </div>

              <div class="rbch__acoes">
                <button type="button" class="rbch__btn" :disabled="busy" @click="agir(() => setEnabled(!status!.enabled))">
                  {{ busy ? 'Um instante…' : status.enabled ? 'Desligar' : 'Ligar' }}
                </button>
                <button type="button" class="rbch__btn rbch__btn--ghost" :disabled="busy" @click="agir(rotate)">
                  {{ busy ? 'Um instante…' : 'Gerar nova chave' }}
                </button>
              </div>
            </template>

            <template v-else>
              <p class="rbch__vazio">
                Você ainda não tem chave. Ela é gerada uma vez, é individual, e
                dá acesso somente leitura.
              </p>
              <button type="button" class="rbch__btn rbch__btn--cheio" :disabled="busy" @click="agir(rotate)">
                {{ busy ? 'Gerando…' : 'Gerar minha chave' }}
              </button>
            </template>
          </template>

          <p v-if="erro" class="rbch__erro">{{ erro }}</p>

          <p class="rbch__next">
            Com a chave em mãos:
            <NuxtLink to="/business/comecar" class="rbch__link">conectar ao seu assistente</NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rbch {
  background: var(--nu-cream);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
  min-height: 60vh;
}
.rbch__cols { display: flex; gap: clamp(32px, 5vw, 76px); align-items: flex-start; flex-wrap: wrap; }
.rbch__intro { flex: 1 1 460px; min-width: min(300px, 100%); }
.rbch__right { flex: 1 1 420px; min-width: min(300px, 100%); }

.rbch__fatos { margin: clamp(28px, 3.5vw, 40px) 0 0; max-width: 540px; }
.rbch__fato { display: grid; grid-template-columns: 110px 1fr; gap: 16px; padding: 15px 0; border-top: 1px solid var(--nu-cream-line); }
.rbch__fato dt { color: var(--nu-gray); font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; padding-top: 3px; }
.rbch__fato dd { margin: 0; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.6; font-variant-numeric: tabular-nums; }

/* o artefato: hairline, raio de documento */
.rbch__card { background: var(--nu-white); border: 1px solid var(--nu-cream-line); border-radius: 16px; padding: clamp(24px, 3vw, 34px); }
.rbch__card-label { display: block; color: var(--nu-gray); font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.4px; margin-bottom: 18px; }

.rbch__code {
  display: block; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13.5px; color: var(--nu-ink); word-break: break-all; line-height: 1.5;
  background: var(--nu-cream); border-radius: 10px; padding: 12px 14px;
}
.rbch__plain .rbch__code { border: 1px solid var(--nu-blue-soft); }
.rbch__copy {
  margin-top: 10px; border: none; cursor: pointer;
  background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 9px 18px; font-size: 13.5px; font-weight: 800; font-family: inherit;
  transition: background .2s;
}
.rbch__copy:hover { background: var(--nu-blue-hover); }
.rbch__warn { margin: 12px 0 0; color: var(--nu-gray-2); font-size: 13px; font-weight: 600; line-height: 1.55; }
.rbch__meta { margin: 10px 0 0; color: var(--nu-gray); font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }

.rbch__acoes { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 18px; }
.rbch__btn {
  border: 1px solid var(--nu-cream-line); cursor: pointer;
  background: var(--nu-cream); color: var(--nu-ink);
  border-radius: var(--nu-r-pill); padding: 11px 20px; font-size: 14px; font-weight: 800; font-family: inherit;
  transition: background .2s, opacity .2s;
}
.rbch__btn:hover { background: var(--nu-cream-4, var(--nu-cream)); }
.rbch__btn:disabled { opacity: .5; cursor: default; }
.rbch__btn--ghost { background: transparent; }
.rbch__btn--cheio { background: var(--nu-blue); border-color: var(--nu-blue); color: var(--nu-white); }
.rbch__btn--cheio:hover { background: var(--nu-blue-hover); }
.rbch__btn:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

.rbch__vazio { margin: 0 0 16px; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.6; }
.rbch__erro { margin: 16px 0 0; color: var(--nu-ink); font-size: 13.5px; font-weight: 600; line-height: 1.55; border-top: 1px solid var(--nu-cream-line); padding-top: 14px; }
.rbch__next { margin: 20px 0 0; padding-top: 16px; border-top: 1px solid var(--nu-cream-line); color: var(--nu-gray); font-size: 13.5px; font-weight: 500; }
.rbch__link { color: var(--nu-blue); font-weight: 700; }
.rbch__link:hover { color: var(--nu-blue-hover); }
</style>
