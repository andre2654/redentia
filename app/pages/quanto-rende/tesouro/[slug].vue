<script setup lang="ts">
// /quanto-rende/tesouro/{slug} — a taxa que /tesouro já mostra, aplicada a um
// valor. Bruto e, quando a conta fecha, líquido de IR pela tabela regressiva
// já descrita no site. Sem inflação futura inventada e sem líquido de cupom.

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,80}$/

definePageMeta({
  middleware: [
    (to) => {
      const raw = String(to.params.slug ?? '')
      const lower = raw.toLowerCase()
      if (!SLUG_RE.test(lower)) {
        return abortNavigation(createError({ statusCode: 404, statusMessage: 'Título não encontrado' }))
      }
      if (raw !== lower) {
        return navigateTo(`/quanto-rende/tesouro/${lower}`, { redirectCode: 301, replace: true })
      }
    },
  ],
})

const slug = String(useRoute().params.slug ?? '').toLowerCase()
const { data, error } = await useQuantoRendeTesouro(slug)

if (error.value || !data.value) {
  const status = (error.value as { statusCode?: number } | null)?.statusCode
  throw createError({
    statusCode: status === 404 ? 404 : 503,
    statusMessage: status === 404 ? 'Título não encontrado' : 'Dados temporariamente indisponíveis',
    fatal: true,
  })
}

const titulo = computed(() => data.value!)
const valor = ref(VALOR_PADRAO)
const classe = computed(() => classeDeTesouro({
  slug: titulo.value.slug,
  name: titulo.value.nome,
  indexer: titulo.value.indexer,
}))
const indice = computed(() => indiceDeClasse(titulo.value.indexer))

const conta = computed(() => {
  const c = classe.value
  if (!c) return null
  return contaTesouro({
    classe: c,
    valor: valor.value,
    taxaPct: titulo.value.taxaPct,
    selicPct: titulo.value.selicPct,
    spreadPct: titulo.value.spreadPct,
    hoje: titulo.value.hoje,
    vencimento: titulo.value.vencimento,
    anoConversao: titulo.value.anoConversao,
  })
})

const cards = computed(() => {
  const c = conta.value
  const u = titulo.value
  if (!c) return []
  const taxa: { rotulo: string; valor: string; fonte: string } = {
    rotulo: 'Taxa usada',
    valor: rendimentoFmt(c.taxaPct),
    fonte: c.tipo === 'selic' && u.fonteReferencia ? `${u.fonteTaxa} ${u.fonteReferencia}` : u.fonteTaxa,
  }
  if (c.liquido != null && c.montante != null && c.ganho != null && c.imposto != null && c.aliquota != null) {
    const prazo = c.tipo === 'selic' ? 'em 365 dias, se a taxa ficasse parada' : 'no vencimento'
    return [
      taxa,
      { rotulo: `Bruto ${prazo}`, valor: dinheiroFmt(c.montante), fonte: u.fonteTaxa },
      { rotulo: 'Rendimento bruto', valor: dinheiroFmt(c.ganho), fonte: u.fonteTaxa },
      { rotulo: `IR (${aliquotaFmt(c.aliquota)})`, valor: dinheiroFmt(c.imposto), fonte: 'Tabela regressiva de renda fixa já descrita nas páginas de Tesouro. Incide sobre o rendimento.' },
      { rotulo: 'Líquido de IR', valor: dinheiroFmt(c.liquido), fonte: u.fonteTaxa },
    ]
  }
  if (c.ganhoReal != null) {
    return [
      taxa,
      {
        rotulo: indice.value ? `Ganho real acima do ${indice.value}` : 'Ganho real',
        valor: dinheiroFmt(c.ganhoReal),
        fonte: `${u.fonteTaxa} Não é um valor nominal em reais: a correção pelo índice do período não está nesta conta.`,
      },
    ]
  }
  return [taxa]
})

const formula = computed(() => {
  const c = conta.value
  if (!c) return ''
  if (c.tipo === 'selic') {
    return `A ilustração usa um ano de 365 dias: montante = valor × (1 + taxa de hoje) ^ (365 ÷ 365). A Selic muda. Este número não é o valor no vencimento${titulo.value.vencimentoFmt ? `, marcado para ${titulo.value.vencimentoFmt}` : ''}.`
  }
  if (c.fase === 'conversao') {
    const n = c.parcelas === 60 ? '60 parcelas, cerca de 5 anos' : '240 parcelas, cerca de 20 anos'
    return `O ano no nome (${c.anoConversao}) é o ano em que os pagamentos começam, não um vencimento com valor único. A fase de conversão paga ${n}. A API não traz o valor da parcela, então a página não projeta um número mensal.`
  }
  if (c.fase === 'acumulacao' && c.dias != null && c.anoConversao != null) {
    return `Até 1º de janeiro de ${c.anoConversao} são ${c.dias} dias corridos. Ganho real = valor × ((1 + taxa) ^ (${c.dias} ÷ 365) − 1), acima do IPCA. Não é o bolo em reais no fim, e não é a soma das parcelas.`
  }
  if (c.dias == null) return ''
  const base = `Até ${titulo.value.vencimentoFmt || 'o vencimento'} são ${c.dias} dias corridos. Montante = valor × (1 + taxa) ^ (${c.dias} ÷ 365).`
  if (c.tipo === 'cupom-prefixado' || c.tipo === 'indice-cupom') {
    return `${base} O título paga juros semestrais. Esse montante só vale se os juros forem reinvestidos à mesma taxa. A agenda de cupons não vem na API, então não há um líquido único: cada pagamento usa a alíquota do prazo desde a compra.`
  }
  if (c.tipo === 'indice') {
    return `${base} A taxa é real, acima do ${indice.value || 'índice'}. O resultado é poder de compra, não reais nominais. O IR incide sobre o rendimento nominal, que inclui a correção pelo índice. Sem o índice do período, o líquido em reais não fecha.`
  }
  if (c.aliquota != null && c.liquido != null) {
    return `${base} IR = rendimento × ${aliquotaFmt(c.aliquota)}. Líquido = montante − IR. O imposto incide sobre o rendimento, não sobre o valor aplicado.`
  }
  return base
})

if (data.value) {
  usePageSeo({
    title: titulo.value.seo.title,
    description: titulo.value.seo.description,
    path: `/quanto-rende/tesouro/${slug}`,
    dateModified: titulo.value.dataDate,
    breadcrumbs: [
      { name: 'Início', path: '/' },
      { name: 'Tesouro Direto', path: '/tesouro' },
      { name: titulo.value.nome, path: `/tesouro/${slug}` },
      { name: 'Quanto rende', path: `/quanto-rende/tesouro/${slug}` },
    ],
  })
}
</script>

<template>
  <div v-if="data && conta">
    <NuPageHero
      eyebrow="Tesouro Direto"
      :subtitle="`Taxa de hoje: ${titulo.taxaRotulo}. ${titulo.fonteTaxa}`"
    >
      <template #title>Quanto rende o {{ titulo.nome }}.</template>
    </NuPageHero>

    <CalcBand tone="white" title="Aplique um valor.">
      <template #dek>
        <p>O padrão é R$ 1.000. A conta usa a taxa anual do título e o prazo em dias corridos dividido por 365. Não é o preço unitário.</p>
      </template>
      <QuantoRendePainel v-model="valor" :cards="cards" aviso="A conta descreve a taxa de hoje. Não é recomendação de compra ou venda.">
        <p>{{ formula }}</p>
        <p v-if="titulo.precoCompraFmt">
          O preço unitário de compra é {{ titulo.precoCompraFmt }}. Ele não entra nesta conta. {{ titulo.fonteTaxa }}
        </p>
        <p v-if="titulo.referenciaFmt && titulo.referenciaRotulo && conta.tipo !== 'selic'">
          {{ titulo.referenciaRotulo }}: {{ titulo.referenciaFmt }}. A página não projeta esse índice para a frente. {{ titulo.fonteReferencia }}
        </p>
        <p v-if="conta.aliquota && conta.dias != null && conta.dias <= 30">
          Neste prazo também incide IOF. A tabela diária não está calculada aqui, então o líquido, quando aparece, é só depois do IR.
        </p>
        <p v-else-if="conta.liquido != null">
          IOF só existe nos primeiros 30 dias. Este prazo passa disso. A custódia da B3 não entra na conta.
        </p>
        <p v-else>
          A custódia da B3 não entra na conta. A tabela regressiva de IR está descrita nas páginas de Tesouro: 22,5% até 180 dias, 20% até 360, 17,5% até 720 e 15% acima de 720, sobre o rendimento.
        </p>
      </QuantoRendePainel>
    </CalcBand>

    <CalcSplit tone="cream" wide>
      <template #title>Perguntas sobre este título.</template>
      <p class="qrt__nota">As respostas usam R$ 1.000. O campo acima recalcula os números.</p>
      <NuFaqAccordion :items="titulo.faq" surface="white" />
    </CalcSplit>

    <CalcBand tone="white" title="Continue a leitura.">
      <div class="qrt__links">
        <NuxtLink :to="`/tesouro/${slug}`" class="qrt__link">
          <h3>{{ titulo.nome }}</h3>
          <p>Taxa, preço de compra e de venda, e o histórico do título.</p>
        </NuxtLink>
        <NuxtLink to="/tesouro" class="qrt__link">
          <h3>Tesouro Direto hoje</h3>
          <p>As taxas de todos os títulos, da mesma fonte.</p>
        </NuxtLink>
      </div>
    </CalcBand>
  </div>
</template>

<style scoped>
.qrt__nota {
  margin: 0 0 16px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5;
}
.qrt__links {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 16px; margin-top: clamp(28px, 4vw, 40px); max-width: 880px; margin-left: auto; margin-right: auto;
}
.qrt__link {
  background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 22px 24px;
  display: flex; flex-direction: column; gap: 6px; min-width: 0;
}
.qrt__link h3 {
  margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -.2px;
  overflow-wrap: anywhere;
}
.qrt__link p {
  margin: 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55;
}
</style>
