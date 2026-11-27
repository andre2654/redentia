<script setup lang="ts">
// /quanto-rende/{valor} — simulação de um valor em reais. A taxa vem do SGS.
// Sem taxa crível a página responde 503. Não recomenda produto e não promete retorno.
import type { TaxasQuantoRendeValor, ValorQuantoRende } from '~/utils/quanto-rende-valor'
import {
  LIMIAR_POUPANCA_SELIC,
  aliquotaCurta,
  celulaDe,
  dataModificadaTaxas,
  faqQuantoRendeValor,
  periodoPoupanca,
  seoQuantoRendeValor,
  simularQuantoRendeValor,
  taxaFmt,
  vizinhosQuantoRende,
} from '~/utils/quanto-rende-valor'
import { diaCurto, dinheiroFmt } from '~/utils/quanto-rende'

const props = defineProps<{ entrada: ValorQuantoRende }>()

const { data: taxas, error } = await useAsyncData(
  'quanto-rende-taxas',
  () => $fetch<TaxasQuantoRendeValor>('/api/quanto-rende/taxas'),
)

if (error.value || !taxas.value) {
  throw createError({
    statusCode: 503,
    statusMessage: 'Taxas temporariamente indisponíveis',
    fatal: true,
  })
}

const tx = taxas.value
const sim = simularQuantoRendeValor(props.entrada.reais, tx)
if (!sim) {
  throw createError({
    statusCode: 503,
    statusMessage: 'Taxas temporariamente indisponíveis',
    fatal: true,
  })
}

const seo = seoQuantoRendeValor(props.entrada)
const faq = faqQuantoRendeValor(props.entrada, tx, sim)
const vizinhos = vizinhosQuantoRende(props.entrada.slug)
const trilha = [
  { name: 'Início', path: '/' },
  { name: 'Calculadoras', path: '/calculadoras' },
  { name: `Quanto rende ${props.entrada.nome}`, path: `/quanto-rende/${props.entrada.slug}` },
]

usePageSeo({
  title: seo.title,
  description: seo.description,
  path: `/quanto-rende/${props.entrada.slug}`,
  dateModified: dataModificadaTaxas(tx),
  breadcrumbs: trilha,
})

const mes = celulaDe(sim, 'cdi-100', '1m')
const ano = celulaDe(sim, 'cdi-100', '1a')
const poupAno = celulaDe(sim, 'poupanca', '1a')
const selicAno = celulaDe(sim, 'tesouro-selic', '1a')
const cdi110 = sim.cenarios.find((c) => c.id === 'cdi-110')
const cdi115 = sim.cenarios.find((c) => c.id === 'cdi-115')
const ano110 = celulaDe(sim, 'cdi-110', '1a')
const ano115 = celulaDe(sim, 'cdi-115', '1a')
const horizontes = sim.cenarios[0]?.celulas.map((c) => c.horizonte) ?? []

const regraPoupanca = computed(() => {
  if (tx.selicMeta == null || !tx.selicMetaData) {
    return 'A remuneração adicional é 0,5% ao mês mais a TR quando a meta da Selic ao ano é superior a 8,5%, e 70% da meta mensalizada mais a TR nos demais casos.'
  }
  const ramo = tx.selicMeta > LIMIAR_POUPANCA_SELIC
    ? 'acima de 8,5% ao ano, a remuneração adicional é 0,5% ao mês mais a TR'
    : 'igual ou abaixo de 8,5% ao ano, a remuneração adicional é 70% da meta da Selic mensalizada mais a TR'
  return `A meta da Selic está em ${taxaFmt(tx.selicMeta)} ao ano (série 432, ${diaCurto(tx.selicMetaData)}). ${ramo.charAt(0).toUpperCase()}${ramo.slice(1)}.`
})

const calculadora = `/calculadora/juros-compostos?initial=${props.entrada.reais}&monthly=0`
</script>

<template>
  <div class="qrv">
    <NuPageHero
      eyebrow="Renda fixa"
      :subtitle="`Simulação de ${entrada.nome} com a taxa de hoje do Banco Central, no CDI, na poupança e no Tesouro Selic.`"
    >
      <template #trilha><NuTrilha :crumbs="trilha" /></template>
      <template #title>Quanto rende {{ entrada.nome }}.</template>
    </NuPageHero>

    <CalcBand tone="white" title="Por mês e por ano.">
      <template #dek>
        <p>
          Os números abaixo repetem a taxa vigente pelo prazo. A taxa muda. Não é garantia de retorno futuro e não é recomendação de compra ou venda.
        </p>
      </template>
      <div v-if="mes && ano && poupAno && selicAno" class="qrv__destaques">
        <article class="qrv__destaque">
          <h3>100% do CDI em 1 mês</h3>
          <p class="qrv__numero">{{ dinheiroFmt(mes.liquido) }}</p>
          <p>Líquido de IR ({{ aliquotaCurta(mes.aliquota) }}) em 30 dias. Bruto {{ dinheiroFmt(mes.montante) }}.</p>
        </article>
        <article class="qrv__destaque">
          <h3>100% do CDI em 1 ano</h3>
          <p class="qrv__numero">{{ dinheiroFmt(ano.liquido) }}</p>
          <p>Líquido de IR ({{ aliquotaCurta(ano.aliquota) }}) em 365 dias. Bruto {{ dinheiroFmt(ano.montante) }}.</p>
        </article>
        <article class="qrv__destaque">
          <h3>Poupança em 1 ano</h3>
          <p class="qrv__numero">{{ dinheiroFmt(poupAno.liquido) }}</p>
          <p>Doze períodos da série 195, isenta de IR para pessoa física nesta simulação.</p>
        </article>
        <article class="qrv__destaque">
          <h3>Tesouro Selic em 1 ano</h3>
          <p class="qrv__numero">{{ dinheiroFmt(selicAno.liquido) }}</p>
          <p>Líquido de IR e da custódia da B3. Bruto {{ dinheiroFmt(selicAno.montante) }}.</p>
        </article>
      </div>
      <p class="qrv__fonte">
        CDI {{ taxaFmt(tx.cdiAnual) }} ao ano, série {{ tx.cdiSerie }} do SGS, referência {{ diaCurto(tx.cdiData) }}.
        Selic efetiva {{ taxaFmt(tx.selicAnual) }} ao ano, série {{ tx.selicSerie }}, {{ diaCurto(tx.selicData) }}.
        Poupança {{ taxaFmt(tx.poupancaMensal) }} ao mês, série 195, período {{ periodoPoupanca(tx) }}.
        Fonte: <a href="https://www.bcb.gov.br" target="_blank" rel="noopener noreferrer">Banco Central do Brasil</a>.
      </p>
      <CtaConectarCarteira
        titulo="Compare com o que a sua carteira rendeu"
        corpo="Esta página simula as taxas de hoje do Banco Central. Conecte a carteira pelo Open Finance (só leitura) para ver o que os seus investimentos fizeram, com os seus números."
        to="/assinar?quiz=1&de=quanto-rende"
      />
    </CalcBand>

    <CalcBand tone="cream" title="100% do CDI, 110% e 115% do CDI.">
      <template #dek>
        <p>
          100% do CDI é a taxa do CDI. 105%, 110%, 115% e 120% multiplicam o CDI ao dia. CDB e outras aplicações pós-fixadas costumam contratar um percentual assim. A linha descreve a taxa, não um emissor.
        </p>
      </template>
      <div v-if="ano && ano110 && ano115 && cdi110 && cdi115" class="qrv__prosa">
        <p>
          Em 1 ano, {{ entrada.nome }} em 100% do CDI ({{ taxaFmt(tx.cdiAnual) }} ao ano) ficam em {{ dinheiroFmt(ano.liquido) }} líquidos.
          Em 110% do CDI ({{ cdi110.taxaRotulo }}), o líquido é {{ dinheiroFmt(ano110.liquido) }}.
          Em 115% do CDI ({{ cdi115.taxaRotulo }}), o líquido é {{ dinheiroFmt(ano115.liquido) }}.
          O IR desses prazos de 365 dias é {{ aliquotaCurta(ano.aliquota) }}, sobre o rendimento.
        </p>
      </div>
    </CalcBand>

    <CalcBand tone="white" title="Poupança e Tesouro Selic.">
      <div class="qrv__prosa">
        <p>
          <strong>Poupança.</strong>
          {{ regraPoupanca }}
          O número da tabela é o rendimento que o Banco Central publicou na série 195, já com a TR do período, não uma TR estimada.
          <a href="https://www.planalto.gov.br/ccivil_03/leis/l8177.htm" target="_blank" rel="noopener noreferrer">Art. 12 da Lei 8.177/1991</a>,
          com a redação da <a href="https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12703.htm" target="_blank" rel="noopener noreferrer">Lei 12.703/2012</a>.
          A isenção de IR da pessoa física está no <a href="https://www.planalto.gov.br/ccivil_03/leis/l8981.htm" target="_blank" rel="noopener noreferrer">art. 68, III, da Lei 8.981/1995</a>.
        </p>
        <p>
          <strong>Tesouro Selic.</strong>
          A simulação usa a Selic efetiva, não a meta do Copom e não o spread que o Tesouro Direto publica para cada vencimento.
          A custódia da B3 é 0,20% ao ano e, no Tesouro Selic, só incide sobre o que passar de R$ 10.000 por CPF.
          Até R$ 10.000, a custódia desta conta é zero.
          A taxa do agente de custódia não entra: cada instituição define a sua.
          <a href="https://www.b3.com.br/pt_br/produtos-e-servicos/tarifas/tarifas-de-tesouro-direto/" target="_blank" rel="noopener noreferrer">Tarifas do Tesouro Direto na B3</a>.
        </p>
      </div>
    </CalcBand>

    <CalcBand tone="cream" title="Bruto, IR e líquido.">
      <template #dek>
        <p>
          Cada célula mostra o líquido. Por baixo, o bruto e o imposto. No Tesouro Selic, o líquido também desconta a custódia.
        </p>
      </template>

      <div class="qrv__cards">
        <article v-for="c in sim.cenarios" :key="c.id" class="qrv__card">
          <h3>{{ c.rotulo }}</h3>
          <p class="qrv__taxa">{{ c.taxaRotulo }}</p>
          <dl>
            <div v-for="cel in c.celulas" :key="cel.horizonte.id">
              <dt>{{ cel.horizonte.rotulo }}</dt>
              <dd>
                <span class="qrv__liq">{{ dinheiroFmt(cel.liquido) }}</span>
                <span class="qrv__miudo">
                  Bruto {{ dinheiroFmt(cel.montante) }}
                  <template v-if="c.irIsento"> · IR isento</template>
                  <template v-else> · IR {{ aliquotaCurta(cel.aliquota) }} {{ dinheiroFmt(cel.imposto) }}</template>
                  <template v-if="cel.custodia > 0.004"> · custódia {{ dinheiroFmt(cel.custodia) }}</template>
                </span>
              </dd>
            </div>
          </dl>
        </article>
      </div>

      <div class="qrv__tabela">
        <table>
          <caption>Líquido de {{ entrada.nome }} por cenário e prazo. O bruto e o IR estão na segunda linha de cada célula.</caption>
          <thead>
            <tr>
              <th scope="col">Cenário</th>
              <th v-for="h in horizontes" :key="h.id" scope="col">{{ h.rotulo }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in sim.cenarios" :key="c.id">
              <th scope="row">
                {{ c.rotulo }}
                <span>{{ c.taxaRotulo }}</span>
              </th>
              <td v-for="cel in c.celulas" :key="cel.horizonte.id">
                <span class="qrv__liq">{{ dinheiroFmt(cel.liquido) }}</span>
                <span class="qrv__miudo">
                  Bruto {{ dinheiroFmt(cel.montante) }}
                  <template v-if="c.irIsento"> · isento</template>
                  <template v-else> · IR {{ dinheiroFmt(cel.imposto) }}</template>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </CalcBand>

    <CalcBand tone="white" title="Como a simulação é feita.">
      <div class="qrv__prosa">
        <p>
          É uma simulação com a taxa vigente. Não descreve um contrato, não projeta a Selic e não é garantia de retorno futuro.
        </p>
        <p>
          No CDI e no Tesouro Selic, montante = valor × (1 + taxa anual) ^ (dias corridos ÷ 365).
          Um mês são 30 dias, seis meses são 180, um ano são 365, dois anos são 730 e cinco anos são 1.825.
          O IR da renda fixa, pelo <a href="https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l11033compilado.htm" target="_blank" rel="noopener noreferrer">art. 1º da Lei 11.033/2004</a>,
          é 22,5% até 180 dias, 20% de 181 a 360, 17,5% de 361 a 720 e 15% acima de 720. Incide sobre o rendimento, não sobre o valor aplicado.
        </p>
        <p>
          <template v-if="tx.cdiPeloDiario">
            O percentual do CDI parte da série 12, a taxa ao dia. 110% do CDI é (1 + taxa ao dia × 1,10) ^ 252 − 1, arredondado em 2 casas, a mesma base da série 4389.
          </template>
          <template v-else>
            A série diária do CDI não entrou nesta leitura. O percentual multiplica a taxa anual publicada.
          </template>
          O site não tem o calendário de dias úteis. Por isso o prazo da conta é em dias corridos, não em pregões.
        </p>
        <p>
          A poupança não rende por dia. Ela credita no aniversário do depósito, sobre o menor saldo do período. Um mês, aqui, é um período da série 195. Seis meses são seis períodos, e assim por diante. Sacar antes do aniversário não recebe o rendimento daquele período.
        </p>
        <p>
          No 30º dia, a alíquota do IOF do anexo do <a href="https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2007/decreto/d6306.htm" target="_blank" rel="noopener noreferrer">art. 32 do Decreto 6.306/2007</a> é zero.
          O menor prazo desta página é 30 dias, então a simulação não desconta IOF. Um resgate antes disso a página não calcula.
        </p>
        <p>
          A custódia do Tesouro Selic nesta conta é a diferença entre render a Selic cheia e render a Selic menos 0,20 ponto percentual ao ano só na parcela acima de R$ 10.000. O IR não abate essa custódia da base. A marcação a mercado de uma venda antecipada não entra.
        </p>
      </div>
    </CalcBand>

    <CalcSplit tone="cream" wide>
      <template #title>Perguntas sobre {{ entrada.nome }}.</template>
      <NuFaqAccordion :items="faq" surface="white" />
    </CalcSplit>

    <CalcBand tone="white" title="Outros valores.">
      <div v-revelar="{ alvo: 'filhos' }" class="qrv__links">
        <NuxtLink v-for="v in vizinhos" :key="v.slug" :to="`/quanto-rende/${v.slug}`" class="qrv__link">
          <h3>Quanto rende {{ v.nome }}</h3>
          <p>A mesma simulação, com o CDI, a poupança e o Tesouro Selic.</p>
          <span class="qrv__ir">Abrir<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg></span>
        </NuxtLink>
        <NuxtLink :to="calculadora" class="qrv__link">
          <h3>Juros compostos</h3>
          <p>A calculadora abre com {{ entrada.nome }} e sem aporte mensal. A taxa fica a seu cargo.</p>
          <span class="qrv__ir">Abrir<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg></span>
        </NuxtLink>
        <NuxtLink to="/tesouro" class="qrv__link">
          <h3>Tesouro Direto hoje</h3>
          <p>A taxa de cada título, com o spread do dia, em outra página.</p>
          <span class="qrv__ir">Abrir<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg></span>
        </NuxtLink>
      </div>
    </CalcBand>
  </div>
</template>

<style scoped>
.qrv__destaques {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-top: clamp(28px, 4vw, 40px);
}
.qrv__destaque {
  min-width: 0;
  background: var(--nu-white);
  border-radius: var(--nu-r-panel);
  padding: 20px;
  box-shadow: var(--nu-shadow-branco);
}
.qrv__destaque h3 {
  margin: 0;
  color: var(--nu-gray-2);
  font-size: var(--nu-fs-sm);
  font-weight: var(--nu-w-medio);
  letter-spacing: 0.01em;
}
.qrv__numero {
  margin: 8px 0 0;
  color: var(--nu-ink);
  font-size: clamp(26px, 4vw, 34px);
  font-weight: var(--nu-w-display);
  letter-spacing: var(--nu-ls-titulo);
  line-height: 1.1;
  overflow-wrap: anywhere;
}
.qrv__destaque p:last-child {
  margin: 8px 0 0;
  color: var(--nu-gray-3);
  font-size: var(--nu-fs-sm);
  font-weight: var(--nu-w-texto);
  line-height: 1.45;
}
.qrv__fonte {
  margin: 20px 0 0;
  max-width: 78ch;
  color: var(--nu-gray-2);
  font-size: var(--nu-fs-sm);
  font-weight: var(--nu-w-texto);
  line-height: 1.55;
  overflow-wrap: anywhere;
}
.qrv__fonte a,
.qrv__prosa a {
  color: var(--nu-blue-text);
  font-weight: var(--nu-w-medio);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1.5px;
  text-decoration-color: color-mix(in srgb, currentColor 35%, transparent);
}
.qrv__prosa {
  max-width: 72ch;
  margin: clamp(24px, 3vw, 36px) auto 0;
}
.qrv__prosa p {
  margin: 0 0 16px;
  color: var(--nu-gray-3);
  font-size: var(--nu-fs-lg);
  font-weight: var(--nu-w-texto);
  letter-spacing: var(--nu-ls-texto);
  line-height: 1.6;
}
.qrv__prosa p:last-child { margin-bottom: 0; }
.qrv__prosa strong { color: var(--nu-ink); font-weight: var(--nu-w-forte); }

.qrv__cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-top: clamp(28px, 4vw, 40px);
}
.qrv__card {
  min-width: 0;
  background: var(--nu-white);
  border-radius: var(--nu-r-panel);
  padding: 18px 16px;
  box-shadow: var(--nu-shadow-branco);
}
.qrv__card h3 {
  margin: 0;
  color: var(--nu-ink);
  font-size: 18px;
  font-weight: var(--nu-w-forte);
  letter-spacing: var(--nu-ls-titulo);
}
.qrv__taxa {
  margin: 4px 0 12px;
  color: var(--nu-gray-2);
  font-size: 13px;
  font-weight: var(--nu-w-medio);
}
.qrv__card dl { margin: 0; }
.qrv__card dl > div {
  display: grid;
  grid-template-columns: minmax(4.5rem, 6.5rem) minmax(0, 1fr);
  gap: 8px 12px;
  padding: 10px 0;
  border-top: 1px solid var(--nu-line);
}
.qrv__card dt {
  margin: 0;
  color: var(--nu-gray-2);
  font-size: 13px;
  font-weight: var(--nu-w-medio);
}
.qrv__card dd { margin: 0; min-width: 0; }
.qrv__liq {
  display: block;
  color: var(--nu-ink);
  font-size: 16px;
  font-weight: var(--nu-w-forte);
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.qrv__miudo {
  display: block;
  margin-top: 2px;
  color: var(--nu-gray-2);
  font-size: 12.5px;
  font-weight: var(--nu-w-texto);
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.qrv__tabela { display: none; }

.qrv__links {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-top: clamp(28px, 4vw, 40px);
}
.qrv__link {
  min-width: 0;
  background: var(--nu-white);
  border-radius: var(--nu-r-panel);
  padding: 22px;
  box-shadow: var(--nu-shadow-branco);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform var(--nu-dur-media) var(--nu-ease-saida), box-shadow var(--nu-dur-media) var(--nu-ease-saida);
}
.qrv__link:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.qrv__link:hover h3 { color: var(--nu-blue-text); }
.qrv__link:active { transform: scale(.995); }
.qrv__link:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.qrv__link h3 {
  margin: 0;
  color: var(--nu-ink);
  font-size: clamp(18px, 1.5vw, 21px);
  font-weight: var(--nu-w-forte);
  letter-spacing: var(--nu-ls-titulo);
  overflow-wrap: anywhere;
}
.qrv__link p {
  margin: 0;
  color: var(--nu-gray-3);
  font-size: var(--nu-fs-sm);
  line-height: 1.5;
}
.qrv__ir {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
  padding-top: 8px;
  color: var(--nu-blue-text);
  font-size: var(--nu-fs-sm);
  font-weight: var(--nu-w-medio);
}

@media (min-width: 720px) {
  .qrv__destaques { grid-template-columns: 1fr 1fr; }
  .qrv__links { grid-template-columns: 1fr 1fr; }
}
@media (min-width: 960px) {
  .qrv__cards { display: none; }
  .qrv__tabela {
    display: block;
    margin-top: clamp(28px, 4vw, 40px);
    max-width: 100%;
    overflow-x: clip;
  }
  .qrv__tabela table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
    background: var(--nu-white);
    border-radius: var(--nu-r-panel);
    box-shadow: var(--nu-shadow-branco);
  }
  .qrv__tabela caption {
    caption-side: bottom;
    padding: 12px 4px 0;
    color: var(--nu-gray-2);
    font-size: 13px;
    text-align: left;
    line-height: 1.45;
  }
  .qrv__tabela th,
  .qrv__tabela td {
    padding: 12px 10px;
    border-bottom: 1px solid var(--nu-line);
    vertical-align: top;
    text-align: left;
    overflow-wrap: anywhere;
  }
  .qrv__tabela thead th {
    color: var(--nu-gray-2);
    font-size: 12.5px;
    font-weight: var(--nu-w-medio);
  }
  .qrv__tabela tbody th {
    color: var(--nu-ink);
    font-size: 14px;
    font-weight: var(--nu-w-forte);
  }
  .qrv__tabela tbody th span {
    display: block;
    margin-top: 2px;
    color: var(--nu-gray-2);
    font-size: 12px;
    font-weight: var(--nu-w-texto);
  }
  .qrv__tabela .qrv__liq { font-size: 14px; }
}
@media (min-width: 1100px) {
  .qrv__destaques { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@media (prefers-reduced-motion: reduce) {
  .qrv__link { transition: none; }
  .qrv__link:hover, .qrv__link:active { transform: none; }
}
</style>
