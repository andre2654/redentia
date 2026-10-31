<script setup lang="ts">
// /quanto-rende/{TICKER} — proventos dos últimos 12 meses aplicados a um valor.
// Mesmas fontes de /dividendos. Sem renda em 12 meses: 404 (noindex no error.vue).
// O valor padrão é R$ 1.000; o campo recalcula no cliente. Canonical sem query.

const TICKER_RE = /^[A-Z][A-Z0-9]{3}\d{1,2}$/

definePageMeta({
  middleware: [
    (to) => {
      const raw = String(to.params.ticker ?? '')
      const upper = raw.toUpperCase()
      if (!TICKER_RE.test(upper)) {
        return abortNavigation(createError({ statusCode: 404, statusMessage: 'Ativo não encontrado' }))
      }
      if (raw !== upper) {
        return navigateTo({ path: `/quanto-rende/${upper}`, query: to.query, hash: to.hash }, { redirectCode: 301, replace: true })
      }
    },
  ],
})

const route = useRoute()
const ticker = String(route.params.ticker ?? '').toUpperCase()
const { data, error } = await useQuantoRende(ticker)

const renamedTo = renamedTargetOfError(error.value)
if (renamedTo) {
  const pagina = renamedRotaOfError(error.value) === 'asset' ? 'asset' : 'quanto-rende'
  await navigateTo(
    { path: `/${pagina}/${renamedTo}`, query: { ...route.query, de: ticker } },
    { redirectCode: 301, replace: true },
  )
} else if (error.value || !data.value) {
  const err = error.value as { statusCode?: number, statusMessage?: string, data?: unknown } | null
  const status = err?.statusCode
  if (status === 410) {
    throw createError({
      statusCode: 410,
      statusMessage: err?.statusMessage || delistedMessage(ticker, null),
      data: err?.data ?? { ticker, delistedAt: null },
      fatal: true,
    })
  }
  throw createError({
    statusCode: status === 404 ? 404 : 503,
    statusMessage: status === 404
      ? (err?.statusMessage || `Sem proventos em 12 meses para ${ticker}`)
      : 'Dados temporariamente indisponíveis',
    fatal: true,
  })
}

const qr = computed(() => data.value!)
const renamedFrom = data.value ? await useRenamedFrom(ticker) : computed(() => null)
const valor = ref(VALOR_PADRAO)

const conta = computed(() => quantoRendeProventos(valor.value, qr.value.preco, qr.value.proventoPorUnidade))

const cards = computed(() => {
  const c = conta.value
  const u = qr.value
  if (!c) return []
  return [
    {
      rotulo: `Quantidade a ${dinheiroFmt(u.preco)}`,
      valor: `${qtdFmt(c.quantidade)} ${u.unidadePlural}`,
      fonte: u.fontePreco,
    },
    {
      rotulo: 'Proventos em 12 meses',
      valor: dinheiroFmt(c.proventos),
      fonte: u.fonteProventos,
    },
    {
      rotulo: 'Rendimento sobre o valor',
      valor: rendimentoFmt(c.rendimentoPct),
      fonte: u.dyOficial != null && u.dyMatchesSum && u.fonteDy
        ? `${u.fonteProventos} ${u.fonteDy}`
        : `${u.fonteProventos} ${u.fontePreco}`,
    },
  ]
})

const notaInteiras = computed(() => {
  const c = conta.value
  const u = qr.value
  if (!c) return ''
  if (c.inteiras <= 0) {
    return `Este valor não compra uma ${u.unidade} inteira a ${dinheiroFmt(u.preco)}. Os três números são a parte proporcional do valor. Na B3 a negociação é por unidade inteira.`
  }
  if (c.sobra <= 0) {
    return `O valor fecha em ${c.inteiras} ${c.inteiras === 1 ? u.unidade : u.unidadePlural} inteiras. ${u.fontePreco}`
  }
  const palavra = c.inteiras === 1 ? u.unidade : u.unidadePlural
  return `Na B3 a negociação é por unidade inteira. Cabem ${c.inteiras} ${palavra} (${dinheiroFmt(c.inteiras * u.preco)}), e sobram ${dinheiroFmt(c.sobra)}. Essas unidades teriam recebido ${dinheiroFmt(c.proventosInteiras)}. Os três números acima aplicam o valor inteiro, na proporção do preço. ${u.fontePreco}`
})

const notaDy = computed(() => {
  const u = qr.value
  const c = conta.value
  if (!c || u.dyOficial == null || !u.fonteDy) return ''
  if (u.dyMatchesSum) {
    return `Esse percentual fecha com o dividend yield oficial de 12 meses, ${rendimentoFmt(u.dyOficial)}. ${u.fonteDy}`
  }
  return `O dividend yield oficial de 12 meses é ${rendimentoFmt(u.dyOficial)}. ${u.fonteDy} A soma dos pagamentos, como foram pagos, dá ${rendimentoFmt(c.rendimentoPct)} sobre a cotação. Os números acima usam essa soma. A causa do afastamento varia, e a página não escolhe uma.`
})

const notaCapital = computed(() => {
  const u = qr.value
  if (!(u.cap12 > 0)) return ''
  return `No mesmo período houve ${dinheiroFmt(u.cap12)} por ${u.unidade} em amortização. Amortização devolve capital e fica fora desta conta. ${u.fonteProventos}`
})

const kind = computed(() => (qr.value.isFii ? 'rendimentos' : 'proventos'))

if (data.value) {
  usePageSeo({
    title: qr.value.seo.title,
    description: qr.value.seo.description,
    path: `/quanto-rende/${ticker}`,
    dateModified: qr.value.dataDate,
    breadcrumbs: [
      { name: 'Início', path: '/' },
      { name: ticker, path: `/asset/${ticker}` },
      { name: 'Quanto rende', path: `/quanto-rende/${ticker}` },
    ],
  })
}
</script>

<template>
  <div v-if="data">
    <NuPageHero :eyebrow="`${qr.nome} · ${ticker}`" :subtitle="`Os ${kind} dos últimos 12 meses aplicados a um valor, no preço de hoje.`">
      <template #title>Quanto rende {{ ticker }}.</template>
      <p v-if="renamedFrom" class="qr-page__renamed">{{ renamedFrom }} agora negocia como {{ ticker }}.</p>
    </NuPageHero>

    <CalcBand tone="white" title="Aplique um valor.">
      <template #dek>
        <p>
          O padrão é R$ 1.000. A quantidade é o valor dividido pela cotação. Os proventos são essa quantidade vezes o que {{ ticker }} pagou por {{ qr.unidade }} nos últimos 12 meses. O percentual é essa soma dividida pelo valor.
        </p>
      </template>
      <QuantoRendePainel v-model="valor" :cards="cards" aviso="Rentabilidade passada não garante rentabilidade futura.">
        <p>{{ notaInteiras }}</p>
        <p v-if="notaDy">{{ notaDy }}</p>
        <p v-if="notaCapital">{{ notaCapital }}</p>
        <p>Não é recomendação de compra ou venda.</p>
      </QuantoRendePainel>
    </CalcBand>

    <CalcBand tone="cream" title="Como a conta é feita.">
      <div class="qr-page__prose">
        <p>
          Entram só proventos de renda com data com entre {{ diaCurto(qr.hoje) }} e um ano antes, as duas pontas inclusas. Foram {{ qr.count12 }} {{ qr.isFii ? (qr.count12 === 1 ? 'rendimento' : 'rendimentos') : qr.count12 === 1 ? 'provento' : 'proventos' }} no período, {{ dinheiroFmt(qr.proventoPorUnidade) }} por {{ qr.unidade }}. {{ qr.fonteProventos }}
        </p>
        <p>
          A cotação é {{ dinheiroFmt(qr.preco) }}. {{ qr.fontePreco }} A fração de {{ qr.unidade }} mostra a parte proporcional do valor. Quem compra na B3 compra unidade inteira, e a nota acima separa o que cabe inteiro do que sobra.
        </p>
        <p v-if="qr.isFii">
          Rendimentos de FII são isentos de IR para pessoa física quando o fundo é negociado em bolsa, tem pelo menos 100 cotistas e o investidor tem menos de 10% das cotas. A conta mostra o valor bruto informado à B3. Ganho na venda da cota paga 20%.
        </p>
        <p v-else-if="qr.isBdr">
          O dividendo de BDR não tem a isenção do dividendo de ação brasileira. O valor por BDR já chega depois do imposto retido no país de origem. A conta usa o número informado à B3, sem um líquido adicional calculado aqui.
        </p>
        <p v-else>
          Os valores são brutos, como informados à B3. Dividendo de ação é isento para pessoa física até R$ 50 mil por mês da mesma empresa. Acima disso, desde 2026, a empresa retém 10% sobre o total do mês. JCP tem 17,5% retidos na fonte. A soma não separa um líquido por investidor.
        </p>
      </div>
    </CalcBand>

    <CalcSplit tone="white" wide>
      <template #title>Perguntas sobre quanto rende {{ ticker }}.</template>
      <p class="qr-page__faq-nota">As respostas usam R$ 1.000. O campo acima recalcula os três números.</p>
      <NuFaqAccordion :items="qr.faq" />
    </CalcSplit>

    <CalcBand tone="cream" title="Continue a leitura.">
      <div class="qr-page__links">
        <NuxtLink :to="`/dividendos/${ticker}`" class="qr-page__link">
          <h3>Dividendos de {{ ticker }}</h3>
          <p>Histórico, datas e o dividend yield na página de proventos.</p>
        </NuxtLink>
        <NuxtLink :to="`/asset/${ticker}`" class="qr-page__link">
          <h3>Página de {{ ticker }}</h3>
          <p>Cotação, fundamentos e o histórico de proventos no ativo.</p>
        </NuxtLink>
      </div>
    </CalcBand>
  </div>
</template>

<style scoped>
.qr-page__renamed {
  display: flex; width: fit-content; max-width: 100%; margin: 0 0 18px; padding: 7px 14px;
  border-radius: var(--nu-r-pill); background: var(--nu-sand-2); color: var(--nu-gray-tag);
  font-size: var(--nu-fs-sm); font-weight: 700;
}
.qr-page__prose { max-width: 72ch; margin: clamp(24px, 3vw, 36px) auto 0; }
.qr-page__prose p {
  margin: 0 0 16px; color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.7;
}
.qr-page__prose p:last-child { margin-bottom: 0; }
.qr-page__faq-nota {
  margin: 0 0 16px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5;
}
.qr-page__links {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 16px; margin-top: clamp(28px, 4vw, 40px); max-width: 880px; margin-left: auto; margin-right: auto;
}
.qr-page__link {
  background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 22px 24px;
  display: flex; flex-direction: column; gap: 6px; min-width: 0;
}
.qr-page__link h3 {
  margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -.2px;
  overflow-wrap: anywhere;
}
.qr-page__link p {
  margin: 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55;
}
</style>
