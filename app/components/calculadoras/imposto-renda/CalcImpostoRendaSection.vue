<script setup lang="ts">
// Seção interativa da calculadora de IR sobre ações (saiu da página em
// 21/10/2026). Dono: "tem algumas que têm MUITA configuração, isso afasta
// usuário". Virou uma frase ("Em [setembro de 2026], vendi [R$ 50.000] em
// ações, com [R$ 5.000 de lucro]") com swing ou day trade em cima, no cartão
// CalcConta: o DARF fica ao lado do número, o prejuízo acumulado vai para as
// premissas, o "Salvar esta conta" fica à vista (antes esta calculadora não
// salvava) e a folha de cadastro sobe uma vez depois de mexer
// (useConviteDaConta).
// Matemática em utils/ir-acoes.ts. Veio do IncomeTax.vue antigo e foi
// corrigida em 15/10/2026 contra a fonte oficial: isenção ATÉ R$ 20 mil
// (inclusive), DARF 6015 para swing e day trade, vencimento no último dia
// ÚTIL do mês seguinte.
import { brl } from '~/components/calc/compound-math'
import { calcularIrAcoes, vencimentoDarf } from '~/utils/ir-acoes'

const props = defineProps<{ sectionId?: string }>()

const route = useRoute()

// ====================================================================
// Estado da calculadora — defaults espelham os placeholders da página
// antiga (vendas 50.000, lucro 5.000). Reativa, sem botão "Calcular IR".
// ====================================================================
const operationType = ref<'swing' | 'day'>('swing')
const month = ref(defaultMonth())
const totalSales = ref(50000)
const profitLoss = ref(5000)
const accumulatedLoss = ref(0)

// Default pro mês anterior ao corrente (mais útil pro caso de uso real,
// calcular o DARF do mês que acabou) — lógica portada do IncomeTax.vue.
function defaultMonth(): string {
  const now = new Date()
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const yyyy = prevMonth.getFullYear()
  const mm = String(prevMonth.getMonth() + 1).padStart(2, '0')
  return `${yyyy}-${mm}`
}

// ====================================================================
// Deep-link via query params — portado do IncomeTax.vue antigo. Cada
// cenário vira landing virtual indexável (?type=&sales=&profit=&loss=&month=).
// As contas salvas voltam com os params só em número: ?day=0|1 e
// ?month=AAAAMM.
// ====================================================================
function parseNumberParam(value: unknown): number | null {
  if (value === undefined || value === null) return null
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string' || raw.trim() === '') return null
  const num = Number(raw.replace(',', '.'))
  return Number.isFinite(num) ? num : null
}

function parseStringParam(value: unknown): string | null {
  if (value === undefined || value === null) return null
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string' || raw.trim() === '') return null
  return raw.trim()
}

/** "2026-09" ou 202609 (o mês das contas salvas) → "2026-09" */
function mesDoParam(m: string | number | null): string | null {
  if (m === null) return null
  const s = String(m)
  if (/^\d{4}-\d{2}$/.test(s)) return s
  if (/^\d{6}$/.test(s)) return `${s.slice(0, 4)}-${s.slice(4)}`
  return null
}

function applyQueryParams() {
  const q = route.query
  const type = parseStringParam(q.type)
  const day = parseNumberParam(q.day)
  const sales = parseNumberParam(q.sales)
  const profit = parseNumberParam(q.profit)
  const loss = parseNumberParam(q.loss)
  const m = mesDoParam(parseStringParam(q.month))

  if (type === 'swing' || type === 'day') operationType.value = type
  else if (day !== null) operationType.value = day ? 'day' : 'swing'
  if (sales !== null) totalSales.value = sales
  if (profit !== null) profitLoss.value = profit
  if (loss !== null) accumulatedLoss.value = loss
  if (m) month.value = m
}

applyQueryParams()

// Cenário clicado na própria página: re-aplica params e leva o usuário
// pra calculadora (mesmo comportamento da página antiga).
watch(
  () => route.query,
  () => {
    applyQueryParams()
    if (typeof window !== 'undefined') {
      nextTick(() => document.getElementById(props.sectionId ?? 'ir')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  },
  { deep: true },
)

// ====================================================================
// Matemática — utils/ir-acoes.ts (regras e fontes no cabeçalho de lá).
// ====================================================================
const results = computed(() => ({
  ...calcularIrAcoes({
    tipo: operationType.value,
    vendas: totalSales.value,
    lucro: profitLoss.value,
    prejuizoAcumulado: accumulatedLoss.value,
  }),
  dueDate: formatDueDate(month.value),
}))

// Vencimento: último dia útil do mês seguinte, já antecipado quando o fim do
// mês cai em fim de semana ou feriado bancário.
function formatDueDate(monthStr: string): string {
  const iso = monthStr ? vencimentoDarf(monthStr) : null
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
function formatMonth(monthStr: string): string {
  if (!monthStr) return '—'
  const [year, m] = monthStr.split('-')
  return `${MESES[parseInt(m as string) - 1]}/${year}`
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

/* ——— a frase (21/10/2026) ——— */
const CAMINHO = '/calculadora/imposto-renda'
const tipoOpcoes = [
  { value: 'swing' as const, label: 'Swing trade' },
  { value: 'day' as const, label: 'Day trade' },
]
const salesPresets = [
  { label: 'R$ 15 mil', value: 15000 },
  { label: 'R$ 20 mil', value: 20000 },
  { label: 'R$ 25 mil', value: 25000 },
  { label: 'R$ 50 mil', value: 50000 },
]
const resultadoAtalho = [-2000, 1000, 5000, 10000].map((v) => ({ label: v < 0 ? `−${brl(-v)}` : brl(v), value: v }))
const resultadoTxt = computed(() => (profitLoss.value < 0 ? `${brl(-profitLoss.value)} de prejuízo` : `${brl(profitLoss.value)} de lucro`))

// os meses do campo: os dois últimos anos até o mês corrente, do mais novo ao mais velho
// (e o do link, se vier de mais longe)
const mesesOpcoes = computed(() => {
  const hoje = new Date()
  const lista: { value: string; label: string }[] = []
  for (let k = 0; k <= 24; k++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - k, 1)
    const v = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    lista.push({ value: v, label: `${MESES[d.getMonth()]!.toLowerCase()} de ${d.getFullYear()}` })
  }
  if (!lista.some((o) => o.value === month.value)) {
    const [y, m] = month.value.split('-')
    lista.push({ value: month.value, label: `${MESES[parseInt(m as string) - 1]?.toLowerCase()} de ${y}` })
  }
  return lista
})

const numero = computed(() => {
  const r = results.value
  const swing = operationType.value === 'swing'
  if (r.exempt) {
    return {
      selo: '✓ Isento de IR',
      tom: 'ok' as const,
      explica: 'Vendas totais de até R$ 20.000 no mês. Você está isento de pagar imposto sobre este lucro, mas ainda precisa declarar no IRPF anual.',
    }
  }
  if (profitLoss.value <= 0) {
    return {
      selo: '✓ Nada a pagar este mês',
      tom: 'ok' as const,
      explica: swing ? `${r.message} O prejuízo a compensar passa a ${formatCurrency(r.newAccumulatedLoss)}.` : `${r.message}.`,
    }
  }
  if (r.taxDue === 0) {
    return { selo: '✓ Lucro compensado', tom: 'ok' as const, explica: `${r.message}. Sobram ${formatCurrency(r.newAccumulatedLoss)} de prejuízo para os próximos meses.` }
  }
  const compensou = r.compensatedLoss > 0 ? `, depois de compensar ${formatCurrency(r.compensatedLoss)} de prejuízo` : ''
  return {
    selo: `DARF ${r.darfCode} até ${r.dueDate}`,
    tom: 'azul' as const,
    explica: swing
      ? `${r.taxRate}% sobre o lucro de ${formatCurrency(profitLoss.value)}${compensou}. As vendas passaram de R$ 20 mil no mês, então não há isenção.`
      : `${r.taxRate}% sobre o lucro de ${formatCurrency(profitLoss.value)}. Em day trade não há isenção: todo lucro é tributado.`,
  }
})

const ese = computed(() => {
  const r = results.value
  if (profitLoss.value <= 0) return []
  const swing = operationType.value === 'swing'
  const outro = calcularIrAcoes({
    tipo: swing ? 'day' : 'swing',
    vendas: totalSales.value,
    lucro: profitLoss.value,
    prejuizoAcumulado: swing ? 0 : accumulatedLoss.value,
  })
  const itens = [{ texto: swing ? 'Se fosse day trade' : 'Se fosse swing trade', valor: outro.exempt ? 'isento' : formatCurrency(outro.taxDue) }]
  if (swing && !r.exempt) itens.unshift({ texto: 'Vendendo até R$ 20 mil no mês', valor: 'isento' })
  return itens
})

/* ——— salvar, compartilhar e reabrir ——— */
// os params salvos são só números: day=0|1 e o mês como AAAAMM
const simParams = computed<Record<string, number>>(() => ({
  day: operationType.value === 'day' ? 1 : 0,
  sales: totalSales.value,
  profit: profitLoss.value,
  loss: accumulatedLoss.value,
  month: Number(month.value.replace('-', '')),
}))
const simLabel = computed(() => `${formatMonth(month.value)} · ${operationType.value === 'day' ? 'day trade' : 'swing trade'} · vendas de ${brlCurto(totalSales.value)}, ${resultadoTxt.value}`)
const simResult = computed<Record<string, number>>(() => ({ total: Math.round(results.value.taxDue * 100) / 100 }))
const link = computed(() => `${CAMINHO}?type=${operationType.value}&sales=${totalSales.value}&profit=${profitLoss.value}&loss=${accumulatedLoss.value}&month=${month.value}`)
const folhaConta = computed(() => ({
  gesto: 'conta' as const,
  rotulo: `IR de ${formatMonth(month.value)}, ${operationType.value === 'day' ? 'day trade' : 'swing trade'}`,
  valor: formatCurrency(results.value.taxDue),
  selo: numero.value.selo,
  pergunta: '“Como declaro essas vendas no IRPF?”',
}))
function aplicar(p: Record<string, number>) {
  if (Number.isFinite(p.day)) operationType.value = p.day ? 'day' : 'swing'
  if (Number.isFinite(p.sales)) totalSales.value = p.sales!
  if (Number.isFinite(p.profit)) profitLoss.value = p.profit!
  if (Number.isFinite(p.loss)) accumulatedLoss.value = p.loss!
  const m = mesDoParam(Number.isFinite(p.month) ? p.month! : null)
  if (m) month.value = m
}

// depois de mexer na conta, a folha sobe sozinha uma vez (useConviteDaConta)
const salvar = ref<{ pedir: (origem?: 'botao' | 'convite') => Promise<void> } | null>(null)
useConviteDaConta('imposto-renda', () => JSON.stringify(simParams.value), () => {
  void salvar.value?.pedir('convite')
})

const lossTxt = computed(() => brl(accumulatedLoss.value))
</script>

<template>
  <CalcConta :section-id="sectionId ?? 'ir'">
    <template #title><slot name="title">IR sobre ações</slot></template>
    <template #topo>
      <CalcSimSaves variant="history" calculator="imposto-renda" :format-value="formatCurrency" @apply="aplicar" />
    </template>
    <template #frase>
      <CalcEscolha v-model="operationType" rotulo="Tipo de operação" :opcoes="tipoOpcoes" class="irs__tipo" />
      <CalcFrase>
        Em <CalcFraseOpcao v-model="month" rotulo="Mês de referência" :opcoes="mesesOpcoes" />, vendi <CalcFraseCampo
          v-model="totalSales" rotulo="Total de vendas no mês" :min="0" :max="200000" :passo="500"
          :texto="brl(totalSales)" prefixo="R$" :atalhos="salesPresets"
        /> em ações, com <CalcFraseCampo
          v-model="profitLoss" rotulo="Lucro ou prejuízo no mês (prejuízo é negativo)" :min="-20000" :max="50000" :passo="250"
          :texto="resultadoTxt" prefixo="R$" :atalhos="resultadoAtalho"
        />.
      </CalcFrase>
    </template>

    <template #resultado>
      <CalcNumero legenda="Imposto de renda devido" :valor="formatCurrency(results.taxDue)" v-bind="numero" />
    </template>

    <template #acoes>
      <CalcSimSaves
        ref="salvar" variant="save" calculator="imposto-renda" :caminho="CAMINHO"
        :params="simParams" :label="simLabel" :result="simResult" :folha="folhaConta"
      >
        <CalcCompartilhar :link="link" titulo="O meu IR do mês, na Redentia" />
      </CalcSimSaves>
    </template>

    <template #grafico>
      <!-- o DARF ao lado do número; sem imposto, o lembrete da declaração -->
      <div class="irs__darf" :class="{ 'irs__darf--zero': results.taxDue === 0 }">
        <h3 class="irs__darf-titulo">{{ results.taxDue > 0 ? 'Informações do DARF' : 'Sem DARF este mês' }}</h3>
        <dl class="irs__campos">
          <div class="irs__campo">
            <dt>Código DARF</dt>
            <dd>{{ results.taxDue > 0 ? results.darfCode : '—' }}</dd>
          </div>
          <div class="irs__campo">
            <dt>Vencimento</dt>
            <dd>{{ results.taxDue > 0 ? results.dueDate : '—' }}</dd>
          </div>
          <div class="irs__campo">
            <dt>Valor a Pagar</dt>
            <dd class="irs__campo-valor">{{ formatCurrency(results.taxDue) }}</dd>
          </div>
          <div class="irs__campo">
            <dt>Período de Apuração</dt>
            <dd>{{ formatMonth(month) }}</dd>
          </div>
          <template v-if="operationType === 'swing' && results.compensatedLoss > 0">
            <div class="irs__campo">
              <dt>Prejuízo compensado</dt>
              <dd>{{ formatCurrency(results.compensatedLoss) }}</dd>
            </div>
            <div class="irs__campo">
              <dt>Novo saldo de prejuízo</dt>
              <dd>{{ formatCurrency(results.newAccumulatedLoss) }}</dd>
            </div>
          </template>
        </dl>
        <p v-if="results.taxDue > 0" class="irs__como">
          <strong>Como pagar:</strong> Acesse o site da Receita Federal ou seu banco, gere o DARF com o código {{ results.darfCode }}, preencha o valor de {{ formatCurrency(results.taxDue) }} e efetue o pagamento até {{ results.dueDate }}.
        </p>
        <p v-else class="irs__como">Declare todas as operações no IRPF anual, mesmo as isentas.</p>
      </div>
    </template>

    <template v-if="operationType === 'swing'" #premissas>
      <CalcPremissas :resumo="`prejuízo acumulado de meses anteriores: ${lossTxt}`" @restaurar="accumulatedLoss = 0">
        <div class="cpr-item">
          <CalcSliderField v-model="accumulatedLoss" label="Prejuízos Acumulados (R$)" :min="0" :max="30000" :step="250" :value-text="lossTxt" />
          <p class="irs__dica">Prejuízo de swing trade de meses anteriores abate o lucro deste mês antes do imposto. Ele não vence.</p>
        </div>
      </CalcPremissas>
    </template>

    <template #depois>
      <CalcEse
        :itens="ese"
        aviso="Atenção: O não pagamento do IR resulta em multa de 0,33% por dia (até 20%) + juros Selic. Declare todas as operações no IRPF anual, mesmo as isentas."
      >
        <div class="irs__regras">
          <h3 class="irs__regras-titulo">Como funciona o IR sobre ações</h3>
          <div class="irs__regras-grade">
            <div>
              <p class="irs__regra-titulo">Swing Trade (acima de 20k/mês)</p>
              <p class="irs__regra-texto">Alíquota de 15% sobre o lucro. Isenção para vendas até R$ 20.000/mês. Prejuízos podem ser compensados nos meses seguintes.</p>
            </div>
            <div>
              <p class="irs__regra-titulo">Day Trade</p>
              <p class="irs__regra-texto">Alíquota de 20% sobre o lucro, sem isenção. Todo lucro é tributado, independente do valor de vendas.</p>
            </div>
            <div>
              <p class="irs__regra-titulo">Vencimento</p>
              <p class="irs__regra-texto">DARF deve ser pago até o último dia útil do mês seguinte ao das operações.</p>
            </div>
          </div>
        </div>
      </CalcEse>
    </template>
  </CalcConta>
</template>

<style scoped>
.irs__tipo { margin-bottom: 18px; }
.irs__dica { margin: 10px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; line-height: 1.5; }

/* o DARF, como um comprovante, na coluna do gráfico: rótulo à esquerda, valor à direita */
.irs__darf { padding: 20px 22px; border-radius: 24px; background: var(--nu-cream); }
.irs__darf-titulo { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -0.02em; }
.irs__darf--zero .irs__darf-titulo { color: var(--nu-green); }
.irs__campos { margin: 12px 0 0; padding: 2px 16px; border-radius: 16px; background: var(--nu-white); }
.irs__campo { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; padding: 10px 0; border-top: 1.5px dashed var(--nu-cream-2); }
.irs__campo:first-child { border-top: 0; }
.irs__campo dt { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.irs__campo dd { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; text-align: right; font-variant-numeric: tabular-nums; }
.irs__campo-valor { color: var(--nu-blue) !important; }
.irs__como { margin: 12px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-dense); font-weight: 500; line-height: 1.55; }
.irs__como strong { color: var(--nu-ink); font-weight: 800; }

/* as regras, embaixo das cápsulas */
.irs__regras { max-width: 1080px; margin: clamp(28px, 3.4vw, 40px) auto 0; }
.irs__regras-titulo { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.02em; text-align: center; }
.irs__regras-grade { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr)); gap: 10px; margin-top: 18px; }
.irs__regras-grade > div { padding: 18px 20px; border-radius: 20px; background: var(--nu-white); }
.irs__regra-titulo { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; }
.irs__regra-texto { margin: 6px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.6; }
</style>
