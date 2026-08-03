<script setup lang="ts">
/**
 * /business/chaves — o painel da conta de escritório.
 *
 * MUDANÇA DE MODELO (direção do dono 2026-08-03): era uma chave por pessoa,
 * reaproveitando o `mcp_keys` do B2C. Virou UMA CONTA por escritório, com até
 * cinco chaves rotuladas e o uso de todas num lugar só. O motivo é o cliente:
 * a casa distribui credencial pra mesa e quer olhar o consumo junto, não
 * pedir pra cada sócio abrir conta de investidor.
 *
 * A tela tem QUATRO estados, e cada um existe por um motivo:
 *  1. sem conta  → o cadastro (só o nome do escritório; o login já aconteceu)
 *  2. bloqueada  → conta criada e ainda não liberada. Diz isso com todas as
 *                  letras em vez de mostrar um botão que erraria: a liberação
 *                  é comercial e manual enquanto não há cobrança automática.
 *  3. liberada   → métricas, chaves e o gerador
 *  4. lotada     → o gerador some ao bater no teto (que o servidor confere
 *                  de novo; botão escondido não é controle de acesso)
 *
 * Autenticada: mesma guarda do /conta (nu:token → /login?redirect=). A rota é
 * private/no-store no nuxt.config.
 */
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
  description: 'Gere as chaves MCP do seu escritório e acompanhe o uso.',
  path: '/business/chaves',
  robots: 'noindex, follow',
})
useHead({ titleTemplate: null })

const { status, plainKey, loading, busy, hydrate, createAccount, createKey, setKeyEnabled, renameKey, revokeKey } = useBusinessAccount()

const erro = ref<string | null>(null)
const copiado = ref(false)
const nomeEmpresa = ref('')
const rotulo = ref('')
const confirmando = ref<number | null>(null)
const renomeando = ref<number | null>(null)
const novoRotulo = ref('')
const segredoEl = ref<HTMLElement | null>(null)

async function carregar() {
  erro.value = null
  try {
    await hydrate()
  }
  catch (e: unknown) {
    // 401 é sessão expirada: o authFetch já está navegando pro /login, e
    // pintar "escreva pra contato@redentia.com" numa página sendo desmontada
    // transformaria expiração de token em chamado de suporte.
    if ((e as { response?: { status?: number } })?.response?.status === 401) return
    erro.value = 'Não conseguimos carregar a conta agora. Tente de novo; se seguir assim, escreva pra contato@redentia.com.'
  }
}

onMounted(carregar)

/**
 * Toda ação passa por aqui: limpa o erro anterior e traduz a falha pro que a
 * pessoa pode fazer a respeito. Os códigos vêm do controller; qualquer outra
 * coisa cai na mensagem genérica com o caminho de suporte.
 */
async function agir(fn: () => Promise<unknown>) {
  erro.value = null
  try {
    await fn()
  }
  catch (e: unknown) {
    const data = (e as { data?: { error?: string, message?: string } })?.data
    erro.value = data?.message
      ?? ({
        max_keys: 'O escritório já está com o número máximo de chaves ativas. Revogue uma antes de gerar outra.',
        account_disabled: 'A conta ainda não foi liberada. Fale com a gente em contato@redentia.com.',
        label_taken: 'Já existe uma chave ativa com esse nome.',
        // 404 do servidor: a chave saiu por baixo (outra aba, outro
        // dispositivo). "Tente de novo" seria conselho que falha pra sempre.
        not_found: 'Essa chave não existe mais. Atualize a página para ver a lista atual.',
        no_account: 'A conta do escritório não foi encontrada. Atualize a página.',
      }[data?.error ?? ''] ?? 'A ação não completou. Tente de novo; se seguir assim, escreva pra contato@redentia.com.')
  }
}

async function cadastrar() {
  if (busy.value || nomeEmpresa.value.trim().length < 2) return
  await agir(() => createAccount(nomeEmpresa.value.trim()))
}

async function gerar() {
  if (busy.value || rotulo.value.trim().length < 2) return
  await agir(async () => {
    await createKey(rotulo.value.trim())
    rotulo.value = ''
  })
  // A chave em claro nasce no TOPO do card e o formulário fica no fim: sem
  // isto ela podia aparecer fora da viewport, no único momento em que existe.
  await nextTick()
  segredoEl.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

/**
 * Revogar é irreversível, então o primeiro clique só arma o segundo. O
 * desarme automático importa tanto quanto o armar: o botão armado fica no
 * mesmo lugar do normal, e sem prazo um clique esquecido vira uma revogação
 * acidental cinco minutos depois.
 */
let armaTimer: ReturnType<typeof setTimeout> | undefined
async function revogar(id: number) {
  clearTimeout(armaTimer)
  if (confirmando.value !== id) {
    confirmando.value = id
    armaTimer = setTimeout(() => { confirmando.value = null }, 5000)
    return
  }
  confirmando.value = null
  await agir(() => revokeKey(id))
}

function abrirRename(id: number, atual: string) {
  confirmando.value = null
  renomeando.value = id
  novoRotulo.value = atual
}

async function salvarRename(id: number) {
  const l = novoRotulo.value.trim()
  if (busy.value || l.length < 2) return
  await agir(() => renameKey(id, l))
  if (!erro.value) renomeando.value = null
}

let copiaTimer: ReturnType<typeof setTimeout> | undefined
async function copiar() {
  if (!plainKey.value) return
  try { await navigator.clipboard?.writeText(plainKey.value) }
  catch { /* clipboard bloqueado */ }
  copiado.value = true
  clearTimeout(copiaTimer)
  copiaTimer = setTimeout(() => { copiado.value = false }, 1600)
}
onBeforeUnmount(() => {
  clearTimeout(copiaTimer)
  clearTimeout(armaTimer)
})

const conta = computed(() => status.value)
const restantes = computed(() => conta.value?.remaining_keys ?? 0)
const janela = computed(() => conta.value?.usage.window_days ?? 30)

const num = (n: number | null | undefined) => (n ?? 0).toLocaleString('pt-BR')

/**
 * As barras do gráfico. A altura é relativa ao maior dia da janela, com piso
 * de 2% pra um dia de uso baixo não sumir e virar "não usou". Dia zerado fica
 * em zero mesmo: sem uso é sem barra.
 */
const barras = computed(() => {
  const dias = conta.value?.usage.days ?? []
  const teto = Math.max(1, ...dias.map(d => d.calls))
  return dias.map(d => ({
    ...d,
    alt: d.calls === 0 ? 0 : Math.max(2, Math.round((d.calls / teto) * 100)),
    rotulo: new Date(`${d.day}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
  }))
})
const semUso = computed(() => barras.value.every(b => b.calls === 0))

/** A alternativa textual do gráfico, e a legenda que o vidente também lê. */
const resumoGrafico = computed(() => {
  const bs = barras.value
  if (!bs.length) return ''
  const pico = bs.reduce((a, b) => (b.calls > a.calls ? b : a))
  const ativos = bs.filter(b => b.calls > 0).length
  return `Uso por dia nos últimos ${janela.value} dias: ${num(conta.value?.usage.calls)} chamadas `
    + `em ${ativos} ${ativos === 1 ? 'dia' : 'dias'}. Maior dia: ${pico.rotulo}, com ${num(pico.calls)}.`
})

function quando(iso: string | null) {
  if (!iso) return 'nunca'
  return new Date(iso).toLocaleDateString('pt-BR')
}
</script>

<template>
  <section class="rbch">
    <NuSkeleton v-if="loading" :lines="6" />

    <template v-else-if="conta">
      <!-- 1. sem conta: o cadastro do escritório -->
      <div v-if="!conta.has_account" class="rbch__cols">
        <div class="rbch__intro">
          <NuSectionHeading eyebrow="Cadastro">
            A conta é do<br>escritório.
            <template #dek>
              Uma conta para a casa inteira, com até {{ conta.max_keys }} chaves
              nomeadas e o uso de todas no mesmo painel. Comece pelo nome do
              escritório.
            </template>
          </NuSectionHeading>
        </div>
        <div class="rbch__right">
          <form class="rbch__card" @submit.prevent="cadastrar">
            <label for="rbch-empresa" class="rbch__card-label">Nome do escritório</label>
            <input
              id="rbch-empresa"
              v-model="nomeEmpresa"
              type="text"
              name="company"
              maxlength="120"
              placeholder="Escritório Exemplo Investimentos"
              class="rbch__input"
            >
            <button type="submit" class="rbch__btn rbch__btn--cheio" :disabled="busy || nomeEmpresa.trim().length < 2">
              {{ busy ? 'Criando…' : 'Criar a conta' }}
            </button>
            <p v-if="erro" class="rbch__erro" role="alert">{{ erro }}</p>
            <p class="rbch__next">
              Uma conta por escritório: se alguém da casa já criou, peça pra
              essa pessoa gerar a sua chave em vez de abrir outra. A conta é
              liberada quando o contrato fecha, no
              <NuxtLink to="/business#contato" class="rbch__link">setup de 1 hora</NuxtLink>.
            </p>
          </form>
        </div>
      </div>

      <!-- 2. conta criada, ainda não liberada -->
      <div v-else-if="!conta.enabled" class="rbch__cols">
        <div class="rbch__intro">
          <NuSectionHeading eyebrow="Conta criada">
            {{ conta.company_name }}
            <template #dek>
              A conta está registrada e <strong>ainda não foi liberada</strong>.
              A liberação acontece quando o contrato fecha, e é aí que as chaves
              passam a existir. Nada aqui cobra nada sozinho.
            </template>
          </NuSectionHeading>
        </div>
        <div class="rbch__right">
          <div class="rbch__card">
            <span class="rbch__card-label">Próximo passo</span>
            <p class="rbch__vazio">
              Agende o setup de 1 hora e a gente libera a conta na hora. Se você
              já falou com a gente, escreva pra
              <a href="mailto:contato@redentia.com" class="rbch__link">contato@redentia.com</a>
              que liberamos hoje.
            </p>
            <NuxtLink to="/business#contato" class="rbch__btn rbch__btn--cheio">
              Agendar o setup
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- 3. conta liberada: métricas, chaves e o gerador -->
      <template v-else>
        <header class="rbch__topo">
          <div>
            <span class="rbch__eyebrow">Conta do escritório</span>
            <h1 class="rbch__h1">{{ conta.company_name }}</h1>
          </div>
          <span class="rbch__chip">Plano ativo</span>
        </header>

        <dl class="rbch__kpis">
          <div class="rbch__kpi">
            <dt>Chamadas hoje</dt>
            <dd>{{ num(conta.usage.calls_today) }}<span class="rbch__kpi-de"> de {{ num(conta.quota.day) }}</span></dd>
          </div>
          <div class="rbch__kpi">
            <dt>Últimos {{ janela }} dias</dt>
            <dd>{{ num(conta.usage.calls) }}</dd>
          </div>
          <div class="rbch__kpi">
            <dt>Chaves ativas</dt>
            <dd>{{ conta.keys.length }}<span class="rbch__kpi-de"> de {{ conta.max_keys }}</span></dd>
          </div>
          <div class="rbch__kpi">
            <dt>Recusas em {{ janela }} dias</dt>
            <dd>{{ num(conta.usage.denials) }}</dd>
            <p class="rbch__kpi-nota">Pedidos fora do plano ou acima do limite. Muitas seguidas costumam ser agente mal configurado.</p>
          </div>
        </dl>

        <figure class="rbch__grafico">
          <div class="rbch__grafico-topo">
            <span class="rbch__card-label">Uso por dia</span>
            <span class="rbch__grafico-nota">
              A quota de {{ num(conta.quota.day) }} chamadas por dia é do escritório inteiro, não de cada chave.
            </span>
          </div>
          <div v-if="semUso" class="rbch__sem-uso">
            Nenhuma chamada nos últimos {{ janela }} dias. O número aparece aqui
            no minuto seguinte ao primeiro uso.
          </div>
          <template v-else>
            <!-- role=img + aria-label: 30 divs com `title` não são anunciados
                 por leitor de tela nem alcançáveis no toque. -->
            <div class="rbch__barras" role="img" :aria-label="resumoGrafico">
              <div
                v-for="b in barras"
                :key="b.day"
                class="rbch__barra"
                :title="`${b.rotulo}: ${num(b.calls)} chamadas`"
              >
                <span class="rbch__barra-fill" :style="{ height: `${b.alt}%` }" />
              </div>
            </div>
            <div class="rbch__eixo">
              <span>{{ barras[0]?.rotulo }}</span>
              <span>{{ barras[barras.length - 1]?.rotulo }}</span>
            </div>
            <!-- a mesma frase que o leitor de tela recebe, visível: nas barras
                 finas do celular ela é a única leitura possível do gráfico -->
            <figcaption class="rbch__legenda">{{ resumoGrafico }}</figcaption>
          </template>
        </figure>

        <div class="rbch__chaves">
          <span class="rbch__card-label">Chaves</span>

          <div v-if="plainKey" ref="segredoEl" class="rbch__plain" role="status">
            <code class="rbch__code">{{ plainKey }}</code>
            <button type="button" class="rbch__copy" @click="copiar">
              {{ copiado ? 'Copiada' : 'Copiar' }}
            </button>
            <p class="rbch__warn">Guarde agora: ela não aparece de novo. Se perder, revogue essa e gere outra.</p>
          </div>

          <p v-if="!conta.keys.length" class="rbch__vazio">
            Nenhuma chave ainda. Gere a primeira com o nome de quem vai usar, ou
            da mesa: o rótulo é o que faz o painel de uso servir pra alguma coisa.
          </p>

          <ul v-else class="rbch__lista">
            <li v-for="k in conta.keys" :key="k.id" class="rbch__item">
              <div class="rbch__item-id">
                <form v-if="renomeando === k.id" class="rbch__rename" @submit.prevent="salvarRename(k.id)">
                  <label :for="`rbch-rn-${k.id}`" class="rbch__sr">Novo nome da chave</label>
                  <input :id="`rbch-rn-${k.id}`" v-model="novoRotulo" type="text" maxlength="40" class="rbch__input rbch__input--mini">
                  <button type="submit" class="rbch__mini" :disabled="busy || novoRotulo.trim().length < 2">Salvar</button>
                  <button type="button" class="rbch__mini" @click="renomeando = null">Cancelar</button>
                </form>
                <template v-else>
                  <strong class="rbch__item-nome">{{ k.label }}</strong>
                  <code class="rbch__item-cod">{{ k.masked }}</code>
                </template>
              </div>
              <div class="rbch__item-uso">
                <span>{{ num(k.calls_today) }} hoje</span>
                <span class="rbch__item-sep">·</span>
                <span>{{ num(k.calls_period) }} em {{ janela }} dias</span>
                <span class="rbch__item-sep">·</span>
                <!-- o último uso continua visível na chave desligada: é a
                     informação que decide se ela vai ser revogada -->
                <span>último uso {{ quando(k.last_used_at) }}</span>
                <template v-if="!k.enabled">
                  <span class="rbch__item-sep">·</span>
                  <strong>desligada</strong>
                </template>
              </div>
              <div class="rbch__item-acoes">
                <button type="button" class="rbch__mini" :disabled="busy" @click="abrirRename(k.id, k.label)">
                  Renomear
                </button>
                <button type="button" class="rbch__mini" :disabled="busy" @click="agir(() => setKeyEnabled(k.id, !k.enabled))">
                  {{ k.enabled ? 'Desligar' : 'Ligar' }}
                </button>
                <button
                  type="button"
                  class="rbch__mini"
                  :class="{ 'rbch__mini--perigo': confirmando === k.id }"
                  :disabled="busy"
                  @click="revogar(k.id)"
                >
                  {{ confirmando === k.id ? 'Confirmar' : 'Revogar' }}
                </button>
              </div>
            </li>
          </ul>

          <form v-if="restantes > 0" class="rbch__nova" @submit.prevent="gerar">
            <label for="rbch-rotulo" class="rbch__sr">Nome da chave nova</label>
            <input
              id="rbch-rotulo"
              v-model="rotulo"
              type="text"
              name="label"
              maxlength="40"
              placeholder="Mesa, Análise, nome de quem vai usar…"
              class="rbch__input rbch__input--linha"
            >
            <button type="submit" class="rbch__btn rbch__btn--cheio" :disabled="busy || rotulo.trim().length < 2">
              {{ busy ? 'Gerando…' : 'Gerar chave' }}
            </button>
            <span class="rbch__resta">{{ restantes }} de {{ conta.max_keys }} disponíveis</span>
          </form>
          <p v-else class="rbch__resta rbch__resta--cheio">
            O escritório está com as {{ conta.max_keys }} chaves em uso. Revogue
            uma para gerar outra, ou fale com a gente se a casa precisa de mais.
          </p>

          <p v-if="erro" class="rbch__erro" role="alert">{{ erro }}</p>
        </div>

        <dl class="rbch__fatos">
          <div class="rbch__fato">
            <dt>Incluído</dt>
            <dd>Mercado, teses e notícias: cotações, busca de ativos, resumo do dia e briefing.</dd>
          </div>
          <div class="rbch__fato">
            <dt>Carteira</dt>
            <dd>Fora do plano para escritórios. O servidor recusa dado de carteira nessas chaves, não é uma configuração.</dd>
          </div>
          <div class="rbch__fato">
            <dt>Revogação</dt>
            <dd>Desligar ou revogar vale em até um minuto. A chave revogada some do painel e o uso dela fica no histórico.</dd>
          </div>
          <div class="rbch__fato">
            <dt>Sobre o número</dt>
            <dd>O uso é contado para o escritório se enxergar, não para cobrar. Um reinício do serviço pode perder até um minuto de contagem.</dd>
          </div>
        </dl>

        <p class="rbch__next">
          Com a chave em mãos:
          <NuxtLink to="/business/comecar" class="rbch__link">conectar ao seu assistente</NuxtLink>
        </p>
      </template>
    </template>

    <div v-else class="rbch__falha">
      <p class="rbch__erro" role="alert">
        {{ erro ?? 'Não conseguimos carregar a conta agora.' }}
      </p>
      <button type="button" class="rbch__btn rbch__btn--cheio" :disabled="loading" @click="carregar">
        Tentar de novo
      </button>
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

/* ——— estados 1 e 2: duas colunas, igual ao resto do business ——— */
.rbch__cols { display: flex; gap: clamp(32px, 5vw, 76px); align-items: flex-start; flex-wrap: wrap; }
.rbch__intro { flex: 1 1 460px; min-width: min(300px, 100%); }
.rbch__right { flex: 1 1 420px; min-width: min(300px, 100%); }

/* ——— estado 3: o painel ——— */
.rbch__topo {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 20px; flex-wrap: wrap; max-width: 1100px;
}
.rbch__eyebrow {
  display: block; color: var(--nu-gray); font-size: 11.5px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 1.4px;
}
.rbch__h1 {
  margin: 8px 0 0; color: var(--nu-ink);
  font-size: clamp(30px, 4.2vw, 46px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.05;
}
.rbch__chip {
  background: var(--nu-white); color: var(--nu-blue);
  border: 1px solid var(--nu-cream-line);
  border-radius: var(--nu-r-pill); padding: 7px 15px;
  font-size: 12.5px; font-weight: 800; white-space: nowrap;
}

.rbch__kpis {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1px; background: var(--nu-cream-line);
  border: 1px solid var(--nu-cream-line); border-radius: 16px; overflow: hidden;
  margin: clamp(28px, 3.5vw, 40px) 0 0; max-width: 1100px;
}
.rbch__kpi { background: var(--nu-white); padding: 20px 22px; }
.rbch__kpi dt {
  color: var(--nu-gray); font-size: 11.5px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 1.2px;
}
.rbch__kpi dd {
  margin: 8px 0 0; color: var(--nu-ink);
  font-size: 28px; font-weight: 800; letter-spacing: -0.03em; font-variant-numeric: tabular-nums;
}
.rbch__kpi-de { color: var(--nu-gray); font-size: 15px; font-weight: 700; letter-spacing: 0; }

/* ——— o gráfico: barras em CSS, sem SVG e sem biblioteca ——— */
.rbch__grafico {
  background: var(--nu-white); border: 1px solid var(--nu-cream-line);
  border-radius: 16px; padding: clamp(20px, 2.6vw, 28px);
  margin: 20px 0 0; max-width: 1100px;
}
.rbch__grafico-topo { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; align-items: baseline; }
.rbch__grafico-nota { color: var(--nu-gray); font-size: 13px; font-weight: 500; }
.rbch__barras { display: flex; align-items: flex-end; gap: 3px; height: 120px; margin-top: 20px; }
.rbch__barra { flex: 1 1 0; min-width: 0; height: 100%; display: flex; align-items: flex-end; }
.rbch__barra-fill {
  display: block; width: 100%;
  background: var(--nu-blue); border-radius: 3px 3px 0 0;
  transition: height .3s ease;
}
.rbch__sem-uso { margin-top: 16px; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.6; }
.rbch__eixo {
  display: flex; justify-content: space-between; margin-top: 8px;
  color: var(--nu-gray); font-size: 11.5px; font-weight: 700; font-variant-numeric: tabular-nums;
}
.rbch__legenda {
  margin: 12px 0 0; padding-top: 12px; border-top: 1px solid var(--nu-cream-line);
  color: var(--nu-gray-2); font-size: 13.5px; font-weight: 500; line-height: 1.55;
}

.rbch__kpi-nota { margin: 8px 0 0; color: var(--nu-gray); font-size: 12px; font-weight: 500; line-height: 1.45; }

.rbch__rename { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.rbch__input--mini {
  flex: 1 1 180px; width: auto; min-width: min(160px, 100%); margin-bottom: 0;
  padding: 10px 12px; font-size: 15px;
}

/* visível só pro leitor de tela: rótulo de input que a tela já explica */
.rbch__sr {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}

.rbch__falha { max-width: 560px; }
.rbch__falha .rbch__erro { border-top: none; padding-top: 0; margin-bottom: 16px; }

/* ——— as chaves ——— */
.rbch__chaves {
  background: var(--nu-white); border: 1px solid var(--nu-cream-line);
  border-radius: 16px; padding: clamp(20px, 2.6vw, 28px);
  margin: 20px 0 0; max-width: 1100px;
}
.rbch__lista { list-style: none; margin: 16px 0 0; padding: 0; }
.rbch__item {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; flex-wrap: wrap;
  padding: 16px 0; border-top: 1px solid var(--nu-cream-line);
}
.rbch__item-id { flex: 1 1 220px; min-width: 0; }
.rbch__item-nome { display: block; color: var(--nu-ink); font-size: 16px; font-weight: 800; letter-spacing: -0.02em; }
.rbch__item-cod {
  display: block; margin-top: 3px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px; color: var(--nu-gray);
}
.rbch__item-uso {
  flex: 1 1 260px; color: var(--nu-gray-2); font-size: 13.5px; font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.rbch__item-sep { color: var(--nu-cream-line); margin: 0 6px; }
.rbch__item-acoes { display: flex; gap: 8px; flex-shrink: 0; }
/* min-height 44: os dois botões de cada chave eram alvos de ~34px, e um
   deles revoga. Abaixo de 44 o dedo erra, e errar aqui custa uma credencial. */
.rbch__mini {
  border: 1px solid var(--nu-cream-line); cursor: pointer;
  background: var(--nu-cream); color: var(--nu-ink);
  border-radius: var(--nu-r-pill); padding: 8px 15px; min-height: 44px;
  font-size: 13px; font-weight: 800; font-family: inherit;
  transition: background .2s, color .2s, opacity .2s;
}
.rbch__mini:hover { background: var(--nu-white); }
.rbch__mini:disabled { opacity: .5; cursor: default; }
/* o segundo clique é o que revoga: o botão muda de cara antes de fazer */
.rbch__mini--perigo { background: var(--nu-ink); border-color: var(--nu-ink); color: var(--nu-white); }
.rbch__mini:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

.rbch__nova {
  display: flex; gap: 10px; flex-wrap: wrap; align-items: center;
  margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--nu-cream-line);
}
.rbch__resta { color: var(--nu-gray); font-size: 13px; font-weight: 600; }
.rbch__resta--cheio {
  margin: 20px 0 0; padding-top: 20px; border-top: 1px solid var(--nu-cream-line);
  color: var(--nu-gray-2); font-size: 14px; font-weight: 500; line-height: 1.6;
}

/* ——— compartilhado ——— */
.rbch__card { background: var(--nu-white); border: 1px solid var(--nu-cream-line); border-radius: 16px; padding: clamp(24px, 3vw, 34px); }
.rbch__card-label { display: block; color: var(--nu-gray); font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.4px; }
.rbch__card .rbch__card-label { margin-bottom: 18px; }

.rbch__input {
  display: block; width: 100%;
  background: var(--nu-cream); border: 1px solid var(--nu-cream-line);
  border-radius: 12px; padding: 14px 16px;
  color: var(--nu-ink); font-size: 16px; font-weight: 600; font-family: inherit;
  margin-bottom: 14px;
}
.rbch__input--linha { flex: 1 1 240px; width: auto; min-width: min(240px, 100%); margin-bottom: 0; }
.rbch__input::placeholder { color: var(--nu-gray); font-weight: 500; }
.rbch__input:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 1px; }

.rbch__code {
  display: block; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13.5px; color: var(--nu-ink); word-break: break-all; line-height: 1.5;
  background: var(--nu-cream); border-radius: 10px; padding: 12px 14px;
}
.rbch__plain { margin-top: 16px; }
.rbch__plain .rbch__code { border: 1px solid var(--nu-blue-soft); }
.rbch__copy {
  margin-top: 10px; border: none; cursor: pointer; min-height: 44px;
  background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 9px 20px; font-size: 13.5px; font-weight: 800; font-family: inherit;
  transition: background .2s;
}
.rbch__copy:hover { background: var(--nu-blue-hover); }
/* sem borda, então sem o anel do foco herdado: no botão que copia a chave */
.rbch__copy:focus-visible { outline: 2px solid var(--nu-ink); outline-offset: 2px; }
.rbch__warn { margin: 12px 0 0; color: var(--nu-gray-2); font-size: 13px; font-weight: 600; line-height: 1.55; }

.rbch__btn {
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid var(--nu-cream-line); cursor: pointer;
  background: var(--nu-cream); color: var(--nu-ink);
  border-radius: var(--nu-r-pill); padding: 12px 22px; font-size: 15px; font-weight: 800; font-family: inherit;
  transition: background .2s, opacity .2s;
}
.rbch__btn:disabled { opacity: .5; cursor: default; }
.rbch__btn--cheio { background: var(--nu-blue); border-color: var(--nu-blue); color: var(--nu-white); }
.rbch__btn--cheio:not(:disabled):hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.rbch__btn:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

.rbch__fatos { margin: 20px 0 0; max-width: 1100px; }
.rbch__fato { display: grid; grid-template-columns: 130px 1fr; gap: 16px; padding: 15px 0; border-top: 1px solid var(--nu-cream-line); }
.rbch__fato dt { color: var(--nu-gray); font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; padding-top: 3px; }
.rbch__fato dd { margin: 0; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.6; }

.rbch__vazio { margin: 0 0 16px; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.6; }
.rbch__erro { margin: 16px 0 0; color: var(--nu-ink); font-size: 13.5px; font-weight: 600; line-height: 1.55; border-top: 1px solid var(--nu-cream-line); padding-top: 14px; }
.rbch__next { margin: 20px 0 0; color: var(--nu-gray); font-size: 13.5px; font-weight: 500; }
.rbch__card .rbch__next { padding-top: 16px; border-top: 1px solid var(--nu-cream-line); }
.rbch__link { color: var(--nu-blue); font-weight: 700; }
.rbch__link:hover { color: var(--nu-blue-hover); }

@media (max-width: 620px) {
  .rbch__fato { grid-template-columns: 1fr; gap: 6px; }
  /* a linha já ocupa a largura toda; os botões crescem junto em vez de ficar
     três pílulas apertadas à esquerda, que é onde o dedo erra o Revogar */
  .rbch__item-acoes { width: 100%; }
  .rbch__item-acoes .rbch__mini { flex: 1 1 0; }
  .rbch__barras { height: 90px; gap: 2px; }
}
</style>
