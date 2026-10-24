<script setup lang="ts">
/**
 * O topo do painel (banda creme): à esquerda o herói, as perguntas da semana,
 * e a frase que diz se a casa está usando; à direita, o cartão da conta com
 * os números de apoio. Responde a primeira pergunta do dono ao abrir: "a
 * equipe está usando?".
 *
 * O uso real é `calls` (business_key_usage), não `last_used_at`: este sobe com
 * a reconexão do conector, sem ninguém perguntar nada.
 */
import type { BusinessAccountStatus } from '~/composables/useBusinessAccount'
import type { BusinessClientsList } from '~/types/clientes'

const props = defineProps<{
  conta: BusinessAccountStatus
  janela: number
  clientes: BusinessClientsList | null
}>()

defineEmits<{ (e: 'conectar'): void, (e: 'gerar'): void }>()

const num = (n: number | null | undefined) => (n ?? 0).toLocaleString('pt-BR')

/** Os últimos 7 dias da série (a série vem do mais antigo para o mais novo). */
const semana = computed(() => (props.conta.usage.days ?? []).slice(-7).reduce((s, d) => s + d.calls, 0))
const chavesAtivas = computed(() => props.conta.keys.filter(k => k.enabled))
const usaram = computed(() => chavesAtivas.value.filter(k => k.calls_period > 0).length)
const recusas = computed(() => props.conta.usage.denials ?? 0)
const conectados = computed(() => (props.clientes?.clients ?? []).filter(c => c.status === 'active').length)
const clientesLigado = computed(() => (props.conta.clients_mode ?? 'off') !== 'off')

/**
 * O herói: número e unidade separados, como o resto do site mostra número.
 * O número entra contando (0,7 s), menos para quem pede menos movimento.
 */
const mostrado = ref(0)
const contando = ref(false)
onMounted(() => {
  const alvo = semana.value
  if (!alvo || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  contando.value = true
  const t0 = performance.now()
  const passo = (t: number) => {
    const p = Math.min(1, (t - t0) / 700)
    mostrado.value = Math.round(alvo * (1 - (1 - p) ** 3))
    if (p < 1) requestAnimationFrame(passo)
    else contando.value = false
  }
  requestAnimationFrame(passo)
})
const heroi = computed(() => {
  if (semana.value > 0) return { n: num(contando.value ? mostrado.value : semana.value), un: semana.value === 1 ? 'pergunta esta semana' : 'perguntas esta semana' }
  return null
})
const frasePronta = computed(() => {
  if ((props.conta.usage.calls ?? 0) > 0) return 'Uma semana sem perguntas.'
  return props.conta.keys.length ? 'Tudo pronto para a primeira pergunta.' : 'Comece pela primeira chave.'
})

const frase = computed(() => {
  if (!props.conta.keys.length) {
    return 'Gere uma chave com o nome de quem vai usar, conecte ao assistente e cole uma das frases abaixo.'
  }
  if ((props.conta.usage.calls ?? 0) === 0) {
    return 'As chaves estão prontas e ninguém perguntou ainda. Conecte o assistente e cole uma das frases abaixo.'
  }
  // "Chaves", não "pessoas": uma chave pode ser de uma mesa inteira.
  const ativas = chavesAtivas.value.length
  const uso = `${usaram.value} de ${ativas} ${ativas === 1 ? 'chave foi usada' : 'chaves foram usadas'} nos últimos ${props.janela} dias`
  const negativas = recusas.value
    ? `, e ${num(recusas.value)} ${recusas.value === 1 ? 'pedido foi recusado' : 'pedidos foram recusados'}.`
    : ', sem nenhum pedido recusado.'
  return uso + negativas
})
</script>

<template>
  <RbPainelSecao tom="creme">
    <div class="rbpt">
      <div class="rbpt__main">
        <span class="rbpt__eyebrow"><span data-clarity-mask="true">{{ conta.company_name }}</span> · painel do escritório</span>
        <h1 v-if="heroi" class="rbpt__num">{{ heroi.n }} <span class="rbpt__un">{{ heroi.un }}</span></h1>
        <h1 v-else class="rbpt__frase-h">{{ frasePronta }}</h1>
        <p class="rbpt__frase">{{ frase }}</p>
        <div class="rbpt__acoes">
          <button type="button" class="rbpt__btn" @click="$emit('conectar')">Conectar um assistente</button>
          <button type="button" class="rbpt__btn rbpt__btn--claro" @click="$emit('gerar')">Gerar uma chave</button>
        </div>
      </div>

      <aside class="rbpt__cartao" aria-label="A conta em números">
        <div class="rbpt__linha">
          <span class="rbpt__rot">Em {{ janela }} dias</span>
          <span class="rbpt__val">{{ num(conta.usage.calls) }} <small>{{ conta.usage.calls === 1 ? 'pergunta' : 'perguntas' }}</small></span>
        </div>
        <div class="rbpt__linha">
          <span class="rbpt__rot">Chaves</span>
          <span class="rbpt__val">{{ conta.keys.length }} <small>de {{ conta.max_keys }}</small></span>
        </div>
        <div v-if="clientesLigado" class="rbpt__linha">
          <span class="rbpt__rot">Clientes conectados</span>
          <span class="rbpt__val">{{ conectados }}</span>
        </div>
        <div class="rbpt__linha">
          <span class="rbpt__rot">Limite</span>
          <span class="rbpt__val">{{ num(conta.quota.minute) }} <small>por minuto</small></span>
        </div>
      </aside>
    </div>
  </RbPainelSecao>
</template>

<style scoped>
.rbpt { display: flex; gap: clamp(28px, 5vw, 72px); align-items: center; flex-wrap: wrap; animation: nu-fade .5s ease both; }
.rbpt__main { flex: 1.2 1 460px; min-width: min(320px, 100%); }
.rbpt__eyebrow { display: block; color: var(--nu-blue); font-size: var(--nu-fs-eyebrow); font-weight: 800; letter-spacing: -.2px; }
.rbpt__num {
  margin: 14px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-hero); font-weight: 800;
  letter-spacing: -.045em; line-height: .98; font-variant-numeric: tabular-nums;
}
.rbpt__un { display: block; margin-top: 10px; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -.03em; line-height: 1.1; }
.rbpt__frase-h { margin: 14px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -.04em; line-height: 1.02; }
.rbpt__frase { margin: 20px 0 0; max-width: 34ch; color: var(--nu-gray); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; }
.rbpt__acoes { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 30px; }
.rbpt__btn {
  min-height: 52px; padding: 0 28px; border: 0; border-radius: var(--nu-r-pill); cursor: pointer;
  background: var(--nu-blue); color: var(--nu-white); font: inherit; font-size: var(--nu-fs-md); font-weight: 800;
  transition: background .2s, transform .15s;
}
.rbpt__btn:hover { background: var(--nu-blue-hover); }
.rbpt__btn:active { transform: scale(.98); }
.rbpt__btn--claro { background: var(--nu-white); color: var(--nu-ink); }
.rbpt__btn--claro:hover { background: var(--nu-sand-2); }
.rbpt__btn:focus-visible { outline: 3px solid var(--nu-blue-30); outline-offset: 3px; }

.rbpt__cartao {
  flex: 1 1 340px; min-width: min(300px, 100%); max-width: 460px;
  background: var(--nu-white); border-radius: var(--nu-r-card); box-shadow: var(--nu-shadow-card); padding: 8px 28px;
}
.rbpt__linha { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; padding: 20px 0; border-top: 1px solid var(--nu-sand-2); }
.rbpt__linha:first-child { border-top: 0; }
.rbpt__rot { color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 500; }
.rbpt__val { color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.rbpt__val small { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; letter-spacing: 0; }

.rbpt__cartao { transition: box-shadow .25s ease; }
.rbpt__cartao:hover { box-shadow: 0 30px 70px -30px rgba(12, 21, 36, 0.28); }
</style>
