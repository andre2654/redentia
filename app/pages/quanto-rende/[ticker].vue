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
          Os valores são brutos, como informados à B3.
          Pelo <a href="https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l11033compilado.htm" target="_blank" rel="noopener noreferrer">art. 3º, III, da Lei 11.033/2004</a>, o rendimento distribuído por fundo de investimento imobiliário com cotas admitidas à negociação exclusivamente em bolsa ou mercado de balcão organizado é isento de IR na fonte e na declaração da pessoa física.
          O § 1º, I, exige no mínimo 100 cotistas, na redação da <a href="https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14754.htm" target="_blank" rel="noopener noreferrer">Lei 14.754/2023</a>, e o § 1º, II, na redação da <a href="https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14130.htm" target="_blank" rel="noopener noreferrer">Lei 14.130/2021</a>, não dá o benefício a quem tem 10% ou mais das cotas ou dos rendimentos do fundo.
          O ganho na alienação ou no resgate da cota paga IR de 20%, pelo <a href="https://www.planalto.gov.br/ccivil_03/leis/l8668.htm" target="_blank" rel="noopener noreferrer">art. 18 da Lei 8.668/1993</a>, com a redação da Lei 9.779/1999.
        </p>
        <p v-else-if="qr.isBdr">
          A conta usa o valor por BDR informado à B3 e não calcula imposto em cima dele.
        </p>
        <p v-else>
          Os valores são brutos, como informados à B3.
          Pelo <a href="https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15270.htm" target="_blank" rel="noopener noreferrer">art. 10 da Lei 9.249/1995, na redação da Lei 15.270/2025</a>, o lucro ou dividendo pago por pessoa jurídica tributada pelo lucro real, presumido ou arbitrado não fica sujeito a IR na fonte nem entra na base do beneficiário domiciliado no País, ressalvados os arts. 6º-A e 16-A da Lei 9.250/1995.
          O <a href="https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15270.htm" target="_blank" rel="noopener noreferrer">art. 6º-A da Lei 9.250/1995, incluído pelo art. 2º da Lei 15.270/2025</a>, manda reter 10% sobre o total do mês quando uma mesma pessoa jurídica paga a uma mesma pessoa física residente mais de R$ 50.000 em lucros e dividendos nesse mês, a partir de janeiro de 2026.
          JCP tem IR na fonte de 17,5% na data do pagamento ou do crédito, pelo § 2º do art. 9º da Lei 9.249/1995, com a redação do <a href="https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp224.htm" target="_blank" rel="noopener noreferrer">art. 8º da Lei Complementar 224/2025</a>, com efeitos a partir de 1º de janeiro de 2026 (art. 14, III).
          A soma desta página não separa um líquido por investidor.
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
.qr-page__prose a { color: var(--nu-blue-text); font-weight: 700; text-decoration: underline; text-underline-offset: 2px; }
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
