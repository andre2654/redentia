<script setup lang="ts">
// Conta de /calculadora/ir-dividendos-jcp. A matemática está em
// utils/ir-dividendos-jcp.ts e repete a regra já publicada em /quanto-rende:
// dividendo com retenção de 10% sobre o total quando a mesma empresa paga
// mais de R$ 50.000 no mês, e JCP a 17,5% (TEXTO_ALIQUOTA_JCP).
import { dataCurtaAgenda } from '~/utils/agendaDividendos'
import { MONTH_LONG_PT, spISODate } from '~/utils/format'
import {
  URL_LC_224,
  URL_LEI_15270,
  calcularIrProventos,
  contasDoMes,
  type AvisoParaConta,
} from '~/utils/ir-dividendos-jcp'
import { nomeDaEmpresa } from '~/utils/nomeB3'
import { parseProventos } from '~/utils/proventos'
import { dinheiroFmt, qtdFmt } from '~/utils/quanto-rende'
import { symbolShape } from '~/utils/tickerClass'
import { TEXTO_ALIQUOTA_JCP } from '~/utils/dividendosBlocos'

const props = defineProps<{ sectionId?: string }>()
const route = useRoute()

const hoje = spISODate()
const dividendos = ref(1000)
const jcp = ref(500)
const qtd = ref(0)
const mes = ref(hoje.slice(0, 7))
const ticker = ref('')
const tickerTexto = ref('')
const nome = ref('')
const tipoAtivo = ref('')
const avisos = ref<AvisoParaConta[]>([])
const estado = ref<'idle' | 'lendo' | 'ok' | 'vazio' | 'erro' | 'formato'>('idle')
const travado = ref(false)
let aplicando = false
let ignorarDestrava = false

const nfInteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

function numParam(value: unknown): number | null {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string' || raw.trim() === '') return null
  const n = Number(raw.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function txtParam(value: unknown): string {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === 'string' ? raw.trim() : ''
}

function lerQuery() {
  const q = route.query
  const tem = q.dividendos != null || q.jcp != null || q.ticker != null || q.qtd != null || q.mes != null
  if (!tem) return
  const d = numParam(q.dividendos)
  const j = numParam(q.jcp)
  const quantidade = numParam(q.qtd)
  const m = txtParam(q.mes)
  const t = txtParam(q.ticker).toUpperCase().replace(/[^A-Z0-9]/g, '')
  travado.value = d != null || j != null
  ignorarDestrava = true
  aplicando = true
  if (d != null && d >= 0) dividendos.value = d
  if (j != null && j >= 0) jcp.value = j
  if (quantidade != null && quantidade >= 0) qtd.value = quantidade
  if (/^\d{4}-\d{2}$/.test(m)) mes.value = m
  if (q.ticker != null) {
    tickerTexto.value = t
    ticker.value = symbolShape(t) === 'b3' ? t : ''
    if (t && symbolShape(t) !== 'b3') estado.value = 'formato'
  }
  aplicando = false
  ignorarDestrava = false
}

lerQuery()

const atalhosDividendo = [
  { label: 'R$ 1 mil', value: 1000 },
  { label: 'R$ 10 mil', value: 10000 },
  { label: 'R$ 50 mil', value: 50000 },
  { label: 'R$ 60 mil', value: 60000 },
]
const atalhosJcp = [
  { label: 'R$ 0', value: 0 },
  { label: 'R$ 500', value: 500 },
  { label: 'R$ 1 mil', value: 1000 },
  { label: 'R$ 5 mil', value: 5000 },
]
const atalhosQtd = [1, 100, 1000, 10000].map((v) => ({ label: nfInteiro.format(v), value: v }))

const mesesOpcoes = computed(() => {
  const [y, m] = hoje.split('-').map(Number)
  const lista: { value: string; label: string }[] = []
  for (let k = -6; k <= 18; k++) {
    const d = new Date(Date.UTC(y!, (m! - 1) - k, 1))
    const value = d.toISOString().slice(0, 7)
    lista.push({ value, label: `${MONTH_LONG_PT[d.getUTCMonth()]} de ${d.getUTCFullYear()}` })
  }
  if (!lista.some((o) => o.value === mes.value) && /^\d{4}-\d{2}$/.test(mes.value)) {
    const [ano, mm] = mes.value.split('-').map(Number)
    lista.unshift({ value: mes.value, label: `${MONTH_LONG_PT[(mm ?? 1) - 1] ?? mes.value} de ${ano}` })
  }
  return lista
})

const mesLabel = computed(() => mesesOpcoes.value.find((o) => o.value === mes.value)?.label ?? mes.value)
const contaMes = computed(() => contasDoMes(avisos.value, mes.value, qtd.value))
const resultado = computed(() => calcularIrProventos(dividendos.value, jcp.value))
const dividendosHref = computed(() => `/dividendos/${ticker.value || 'PETR4'}`)
const link = computed(() => {
  const p = new URLSearchParams()
  p.set('dividendos', String(dividendos.value))
  p.set('jcp', String(jcp.value))
  if (ticker.value) {
    p.set('ticker', ticker.value)
    p.set('mes', mes.value)
  }
  if (qtd.value > 0) p.set('qtd', String(qtd.value))
  return `/calculadora/ir-dividendos-jcp?${p.toString()}`
})

const foraDaSoma = computed(() => contaMes.value.linhas.some((l) => !l.entraNaConta))
const bloqueado = computed(() => tipoAtivo.value === 'BDR' || tipoAtivo.value === 'REIT')

function aplicarPrefill() {
  if (travado.value || !ticker.value || qtd.value <= 0 || bloqueado.value) return
  if (!contaMes.value.linhas.some((l) => l.classe === 'dividendo' || l.classe === 'jcp')) return
  aplicando = true
  dividendos.value = contaMes.value.dividendos
  jcp.value = contaMes.value.jcp
  aplicando = false
}

watch([dividendos, jcp], () => {
  if (!aplicando) travado.value = true
})
watch([ticker, mes, qtd], () => {
  if (ignorarDestrava || aplicando) return
  travado.value = false
})
watch([ticker, mes, qtd, avisos, tipoAtivo], () => {
  aplicarPrefill()
})

watch(() => route.query, () => {
  lerQuery()
  if (import.meta.client) {
    nextTick(() => document.getElementById(props.sectionId ?? 'ir-dividendos')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
})

async function carregar(t: string) {
  estado.value = 'lendo'
  nome.value = ''
  tipoAtivo.value = ''
  try {
    const [perfil, corpo] = await Promise.all([
      $fetch<any>(`/api/backend/tickers/${t}`).catch(() => null),
      $fetch<any>(`/api/backend/dividends/${t}`).catch(() => null),
    ])
    if (!corpo) {
      avisos.value = []
      estado.value = 'erro'
      return
    }
    const bruto = perfil?.data?.name
    nome.value = typeof bruto === 'string' && bruto.trim() ? nomeDaEmpresa(bruto) : ''
    tipoAtivo.value = String(perfil?.data?.type ?? '').toUpperCase()
    const lista = parseProventos(Array.isArray(corpo?.data) ? corpo.data : Array.isArray(corpo) ? corpo : [])
    const mapped = lista.map((r) => ({
      pagamento: r.payDate,
      dataCom: r.date,
      label: r.label,
      rate: r.rate,
    }))
    estado.value = mapped.length ? 'ok' : 'vazio'
    avisos.value = mapped
  } catch {
    avisos.value = []
    estado.value = 'erro'
  }
}

function confirmarTicker() {
  const t = tickerTexto.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  tickerTexto.value = t
  if (!t) {
    ticker.value = ''
    nome.value = ''
    tipoAtivo.value = ''
    avisos.value = []
    estado.value = 'idle'
    return
  }
  if (symbolShape(t) !== 'b3') {
    ticker.value = ''
    avisos.value = []
    estado.value = 'formato'
    return
  }
  avisos.value = []
  nome.value = ''
  tipoAtivo.value = ''
  if (ticker.value === t) {
    if (import.meta.client) void carregar(t)
    return
  }
  ticker.value = t
}

watch(ticker, (t) => {
  if (!t) return
  if (import.meta.server) return
  void carregar(t)
})
onMounted(() => {
  if (ticker.value) void carregar(ticker.value)
})

function linhaValor(l: { rate: number; valor: number | null; entraNaConta: boolean }): string {
  const porAcao = `R$ ${qtdFmt(l.rate)}`
  if (!l.entraNaConta || l.valor == null) return `${porAcao} por ação · fora da soma`
  return `${porAcao} × ${nfInteiro.format(qtd.value)} = ${dinheiroFmt(l.valor)}`
}

function linhaQuando(l: { pagamento: string; dataCom: string }): string {
  if (l.pagamento) return `pagamento ${dataCurtaAgenda(l.pagamento)}`
  return l.dataCom ? `pagamento a definir · data com ${dataCurtaAgenda(l.dataCom)}` : 'sem data'
}
</script>

<template>
  <CalcConta :section-id="sectionId ?? 'ir-dividendos'">
    <template #title>IR sobre dividendos e JCP</template>
    <template #frase>
      <CalcFrase>
        Recebi <CalcFraseCampo
          v-model="dividendos" rotulo="Dividendos recebidos no mês, de uma mesma empresa" :min="0" :max="200000" :passo="100" livre :casas="2"
          :texto="dinheiroFmt(dividendos)" prefixo="R$" :atalhos="atalhosDividendo"
        /> em dividendos e <CalcFraseCampo
          v-model="jcp" rotulo="JCP recebido no mês, bruto, de uma mesma empresa" :min="0" :max="100000" :passo="50" livre :casas="2"
          :texto="dinheiroFmt(jcp)" prefixo="R$" :atalhos="atalhosJcp"
        /> em JCP de uma mesma empresa em <CalcFraseOpcao v-model="mes" rotulo="Mês do pagamento" :opcoes="mesesOpcoes" />.
      </CalcFrase>
    </template>

    <template #resultado>
      <CalcNumero
        legenda="Líquido no mês, desta empresa"
        :valor="dinheiroFmt(resultado.liquido)"
        :selo="resultado.dividendos.acimaDoLimite ? '10% sobre o total dos dividendos' : 'Dividendos sem retenção'"
        :tom="resultado.dividendos.acimaDoLimite ? 'falta' : 'ok'"
      />
    </template>

    <template #grafico>
      <div class="irj__quadro">
        <h3 class="irj__quadro-titulo">O que fica e o que é retido</h3>
        <div class="irj__dupla">
          <dl class="irj__campos">
            <div class="irj__campo irj__campo--nome"><dt>Dividendos</dt><dd /></div>
            <div class="irj__campo"><dt>Bruto</dt><dd>{{ dinheiroFmt(resultado.dividendos.bruto) }}</dd></div>
            <div class="irj__campo"><dt>Retenção</dt><dd>{{ dinheiroFmt(resultado.dividendos.retencao) }}</dd></div>
            <div class="irj__campo"><dt>Líquido</dt><dd>{{ dinheiroFmt(resultado.dividendos.liquido) }}</dd></div>
          </dl>
          <dl class="irj__campos">
            <div class="irj__campo irj__campo--nome"><dt>JCP</dt><dd>17,5%</dd></div>
            <div class="irj__campo"><dt>Bruto</dt><dd>{{ dinheiroFmt(resultado.jcp.bruto) }}</dd></div>
            <div class="irj__campo"><dt>Retenção</dt><dd>{{ dinheiroFmt(resultado.jcp.retencao) }}</dd></div>
            <div class="irj__campo"><dt>Líquido</dt><dd>{{ dinheiroFmt(resultado.jcp.liquido) }}</dd></div>
          </dl>
        </div>
      </div>
    </template>

    <template #depois>
      <p v-if="resultado.dividendos.acimaDoLimite" class="irj__nota irj__nota--solta">
        Os 10% incidem sobre o total do mês, não só sobre o que passou de R$ 50.000.
        <template v-if="resultado.dividendos.liquido < 50000"> O líquido dos dividendos fica abaixo de quem recebeu R$ 50.000.</template>
      </p>
      <p v-else class="irj__nota irj__nota--solta">Até R$ 50.000 da mesma empresa no mês, o dividendo segue sem retenção. O JCP tem 17,5% sobre o valor pago.</p>
      <p class="irj__preencher">
        Para preencher com os avisos da base, use <CalcFraseCampo
          v-model="qtd" rotulo="Quantidade de ações" :min="0" :max="100000" :passo="1" livre
          :texto="nfInteiro.format(qtd)" :atalhos="atalhosQtd"
        /> ações de <input
          v-model="tickerTexto" class="irj__ticker" maxlength="6" autocapitalize="characters" autocomplete="off" spellcheck="false"
          aria-label="Ticker, opcional" placeholder="PETR4" @change="confirmarTicker" @keydown.enter.prevent="confirmarTicker"
        >. O valor do aviso é por ação. A quantidade multiplica.
      </p>
      <p class="irj__legal">Conteúdo educativo. Não é consultoria tributária e não é recomendação de investimento, de compra, de venda ou de como declarar.</p>

      <div v-if="ticker" class="irj__base">
        <h3 class="irj__base-titulo">
          Avisos de {{ ticker }}<template v-if="nome"> ({{ nome }})</template> em {{ mesLabel }}
        </h3>
        <p v-if="estado === 'lendo'" class="irj__nota">Lendo os avisos da base.</p>
        <p v-else-if="estado === 'erro'" class="irj__nota">Não deu para ler os avisos desta base agora. Informe os valores recebidos.</p>
        <p v-else-if="estado === 'vazio'" class="irj__nota">Não há provento com data nesta base para {{ ticker }}.</p>
        <p v-else-if="estado === 'formato'" class="irj__nota">Esse código não tem o formato de um ticker da B3.</p>
        <template v-else-if="estado === 'ok'">
          <p v-if="bloqueado" class="irj__nota">
            <template v-if="tipoAtivo === 'REIT'">Rendimento de FII segue outro regime e não entra nesta conta de dividendo.</template>
            <template v-else>Esta página não calcula imposto sobre BDR.</template>
            Os valores do aviso ficam na lista. A conta de cima usa o que você informar.
          </p>
          <p v-else-if="qtd <= 0" class="irj__nota">Informe a quantidade de ações para preencher os valores recebidos com o aviso vezes a quantidade.</p>
          <p v-else-if="!contaMes.linhas.length" class="irj__nota">Não há pagamento de {{ ticker }} em {{ mesLabel }} nesta base.</p>
          <ul v-if="contaMes.linhas.length" class="irj__avisos">
            <li v-for="(l, i) in contaMes.linhas" :key="`${l.pagamento}-${l.dataCom}-${l.rotulo}-${i}`" class="irj__aviso">
              <span class="irj__aviso-nome">{{ l.rotulo }} · {{ linhaQuando(l) }}</span>
              <span class="irj__aviso-valor">{{ linhaValor(l) }}</span>
            </li>
          </ul>
          <p v-if="foraDaSoma && !bloqueado" class="irj__nota">Aviso misto, rendimento, amortização ou pagamento a definir aparece na lista e não entra na soma. O misto não separa dividendo e JCP.</p>
        </template>
      </div>
      <p v-else-if="estado === 'formato'" class="irj__nota irj__nota--solta">Esse código não tem o formato de um ticker da B3.</p>

      <div class="irj__links">
        <NuxtLink to="/jcp" class="irj__link">
          <span class="irj__link-titulo">JCP</span>
          <span class="irj__link-texto">O que são os juros sobre capital próprio e por que o imposto já sai na fonte.</span>
        </NuxtLink>
        <NuxtLink :to="dividendosHref" class="irj__link">
          <span class="irj__link-titulo">Dividendos de {{ ticker || 'PETR4' }}</span>
          <span class="irj__link-texto">Histórico, data com e o valor por ação na página de proventos.</span>
        </NuxtLink>
        <NuxtLink to="/calculadora/imposto-renda" class="irj__link">
          <span class="irj__link-titulo">IR sobre ações</span>
          <span class="irj__link-texto">Swing trade, day trade e o DARF da venda. Outra conta, outra regra.</span>
        </NuxtLink>
      </div>
      <p class="irj__fontes">
        {{ TEXTO_ALIQUOTA_JCP }}
        Fonte:
        <a :href="URL_LC_224" target="_blank" rel="noopener noreferrer">Lei Complementar 224/2025</a>
        e
        <a :href="URL_LEI_15270" target="_blank" rel="noopener noreferrer">Lei 15.270/2025</a>.
      </p>
    </template>
  </CalcConta>
</template>

<style scoped>
.irj__ticker {
  display: inline-block; width: 7.2ch; max-width: 100%; margin: 0 0.08em;
  padding: 0 0.2em 0.08em; border: 0; border-radius: 0.36em;
  color: var(--nu-blue-text); background: var(--nu-blue-bg);
  font: inherit; letter-spacing: inherit; text-transform: uppercase; text-align: center;
  box-shadow: inset 0 -1.5px 0 color-mix(in srgb, var(--nu-blue) 62%, transparent);
}
.irj__ticker:focus { outline: 3px solid var(--nu-blue); outline-offset: 2px; }
.irj__ticker::placeholder { color: color-mix(in srgb, var(--nu-blue-text) 45%, transparent); text-transform: none; }

.irj__quadro { padding: 12px 12px 10px; border-radius: var(--nu-r-panel); background: var(--nu-band); }
.irj__quadro-titulo { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: var(--nu-w-forte); letter-spacing: -0.02em; }
.irj__dupla { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; margin-top: 10px; }
.irj__campos { margin: 0; padding: 2px 12px; border-radius: var(--nu-r-tile); background: var(--nu-white); }
.irj__campo { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 8px; padding: 5px 0; border-top: 1px dashed var(--nu-line); }
.irj__campo dt, .irj__campo dd { min-width: 0; }
.irj__campo:first-child { border-top: 0; }
.irj__campo dt { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); }
.irj__campo dd { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-forte); text-align: right; font-variant-numeric: tabular-nums; }
.irj__campo--nome dt { color: var(--nu-ink); font-weight: var(--nu-w-forte); }
.irj__campo--total {
  margin-top: 8px; padding: 2px 2px 0; border-top: 0;
  color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: var(--nu-w-forte);
}
.irj__campo--total strong { font-variant-numeric: tabular-nums; }
.irj__nota { margin: 12px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-texto); line-height: 1.55; }
.irj__nota--solta { margin-top: 18px; }
.irj__preencher {
  margin: 0 0 14px; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-display);
  letter-spacing: var(--nu-ls-titulo); line-height: 1.7;
}
.irj__legal {
  margin: 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.55;
}

.irj__base { margin-top: 22px; }
.irj__base-titulo { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-forte); letter-spacing: -0.02em; }
.irj__avisos { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.irj__aviso {
  display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 4px 16px;
  padding: 12px 14px; border-radius: var(--nu-r-tile); background: var(--nu-white); box-shadow: var(--nu-shadow-branco);
}
.irj__aviso-nome { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-forte); min-width: 0; }
.irj__aviso-valor { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); font-variant-numeric: tabular-nums; }

.irj__links {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr));
  gap: 12px; margin-top: 22px;
}
.irj__link {
  display: flex; flex-direction: column; gap: 4px; min-width: 0;
  padding: 16px 18px; border-radius: var(--nu-r-tile); background: var(--nu-white); box-shadow: var(--nu-shadow-branco);
  transition: transform var(--nu-dur-media) var(--nu-ease-saida);
}
.irj__link:hover { transform: translateY(-2px); }
.irj__link:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.irj__link-titulo { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: var(--nu-w-forte); }
.irj__link-texto { color: var(--nu-gray-2); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-texto); line-height: 1.45; }
.irj__fontes { margin: 16px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.55; }
.irj__fontes a { color: var(--nu-blue-text); font-weight: var(--nu-w-medio); text-decoration: underline; text-underline-offset: 3px; }

@media (max-width: 640px) {
  .irj__quadro { padding: 16px; }
  .irj__campos { padding: 2px 12px; }
  .irj__campo { gap: 10px; }
  .irj__aviso-valor { text-align: left; }
}
</style>
