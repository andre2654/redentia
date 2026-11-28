<script setup lang="ts">
// /tesouro/tesouro-reserva — guia do Tesouro Reserva (intenção informacional).
// A página de taxa e preço continua em /tesouro/tesouro-reserva-2036.
// Selic e CDI vêm de /api/quanto-rende/taxas. Sem a série, a simulação some
// e o texto do produto permanece. Não recomenda título nem instituição.
import {
  FONTE_B3,
  FONTE_BCB,
  FONTE_IOF,
  FONTE_IR,
  FONTE_POUPANCA,
  FONTE_POUPANCA_BASE,
  FONTE_POUPANCA_IR,
  FONTE_TESOURO_DIRETO,
  FONTE_TESOURO_NACIONAL,
  ROTULO_SIMULACAO,
  TESOURO_RESERVA_DESCRIPTION,
  TESOURO_RESERVA_FAQ,
  TESOURO_RESERVA_H1,
  TESOURO_RESERVA_PATH,
  TESOURO_RESERVA_TITLE,
  TESOURO_RESERVA_TITULO_PATH,
  TESOURO_RESERVA_VENCIMENTO,
} from '~/content/seo/tesouro-reserva'
import type { TaxasQuantoRendeValor } from '~/utils/quanto-rende-valor'
import {
  aliquotaCurta,
  dataModificadaTaxas,
  periodoPoupanca,
  taxaFmt,
} from '~/utils/quanto-rende-valor'
import { diaCurto, dinheiroFmt } from '~/utils/quanto-rende'
import { linhasTesouroReserva, regraPoupancaTexto } from '~/utils/tesouro-reserva'

const { data: taxas } = await useAsyncData(
  'quanto-rende-taxas',
  () => $fetch<TaxasQuantoRendeValor>('/api/quanto-rende/taxas').catch(() => null),
)

const linhas = computed(() => (taxas.value ? linhasTesouroReserva(taxas.value) : null))
const regraPoupanca = computed(() => (
  taxas.value
    ? regraPoupancaTexto(taxas.value)
    : 'Com a meta da Selic acima de 8,5% ao ano, a remuneração adicional da poupança é 0,5% ao mês mais a TR. Igual ou abaixo de 8,5% ao ano, é 70% da meta mensalizada mais a TR.'
))

const trilha = [
  { name: 'Início', path: '/' },
  { name: 'Tesouro Direto', path: '/tesouro' },
  { name: 'Tesouro Reserva', path: TESOURO_RESERVA_PATH },
]

const vejaTambem = [
  { href: TESOURO_RESERVA_TITULO_PATH, label: 'Taxa e preço de hoje' },
  { href: '/tesouro', label: 'Tesouro Direto hoje' },
  { href: '/quanto-rende/1-mil', label: 'Quanto rende R$ 1 mil' },
  { href: '/quanto-rende/10-mil', label: 'Quanto rende R$ 10 mil' },
  { href: '/quanto-rende/100-mil', label: 'Quanto rende R$ 100 mil' },
  { href: '/ranking/tesouro-direto', label: 'Ranking do Tesouro Direto' },
]

usePageSeo({
  title: TESOURO_RESERVA_TITLE,
  description: TESOURO_RESERVA_DESCRIPTION,
  path: TESOURO_RESERVA_PATH,
  dateModified: computed(() => (taxas.value ? dataModificadaTaxas(taxas.value) : null)),
  breadcrumbs: trilha,
})

function liquidoDeIr(bruto: number, imposto: number): number {
  return bruto - imposto
}
</script>

<template>
  <div class="trv">
    <NuPageHero
      eyebrow="Renda fixa"
      subtitle="Guia do Tesouro Reserva: o que o título faz, o imposto, a liquidez e uma simulação com a Selic de hoje. A taxa e o preço do dia ficam na página do título."
    >
      <template #trilha><NuTrilha :crumbs="trilha" /></template>
      <template #title>{{ TESOURO_RESERVA_H1 }}</template>
      <div class="trv__atalhos">
        <NuLinkSeta :to="TESOURO_RESERVA_TITULO_PATH">Taxa e preço de hoje</NuLinkSeta>
        <NuLinkSeta to="/tesouro">Todos os títulos</NuLinkSeta>
        <NuLinkSeta to="/quanto-rende/10-mil">Quanto rende R$ 10 mil</NuLinkSeta>
      </div>
    </NuPageHero>

    <CalcBand tone="white" title="O que é.">
      <div class="trv__prosa">
        <p>
          O Tesouro Reserva é um título público federal do programa Tesouro Direto, emitido pelo Tesouro Nacional.
          A remuneração é 100% da Selic. O mínimo para aplicar e para resgatar é R$ 1,00.
        </p>
        <p>
          Fonte:
          <a :href="FONTE_TESOURO_DIRETO" target="_blank" rel="noopener noreferrer">Tesouro Direto, página do Tesouro Reserva</a>.
          A B3 Educação descreve o mesmo rendimento, de 100% da Selic, e o piso de R$ 1.
        </p>
      </div>
    </CalcBand>

    <CalcBand tone="cream" title="Como funciona.">
      <div class="trv__prosa">
        <p>
          Aplicação e resgate funcionam praticamente 24 horas por dia, 7 dias por semana, inclusive à noite, em fins de semana e feriados.
          As operações ficam indisponíveis diariamente entre 0h e 1h. O resgate é imediato.
          A B3 Educação descreve o crédito do resgate via Pix.
        </p>
        <p>
          Não há marcação a mercado. A B3 Educação diz que o saldo não apresenta oscilação negativa por esse motivo e que o valor exibido corresponde ao disponível para resgate.
          O rendimento ocorre todo dia útil, a partir do dia útil seguinte à aplicação.
          O Tesouro Direto descreve o início como o primeiro dia útil.
        </p>
        <p>
          O título listado vence em {{ TESOURO_RESERVA_VENCIMENTO }}.
          A data e a taxa do dia estão na <NuxtLink :to="TESOURO_RESERVA_TITULO_PATH">página do título</NuxtLink>, com os dados do Tesouro Nacional.
        </p>
        <p>
          Fontes:
          <a :href="FONTE_TESOURO_DIRETO" target="_blank" rel="noopener noreferrer">Tesouro Direto</a>,
          <a :href="FONTE_B3" target="_blank" rel="noopener noreferrer">B3 Educação</a>
          e o
          <a :href="FONTE_TESOURO_NACIONAL" target="_blank" rel="noopener noreferrer">anúncio do Tesouro Nacional, da B3 e do Banco do Brasil</a>.
        </p>
      </div>
    </CalcBand>

    <CalcBand tone="white" title="Tem imposto de renda?">
      <div class="trv__prosa">
        <p>
          Sim. O IR incide sobre o rendimento, não sobre o valor aplicado, pela tabela regressiva de renda fixa.
          O Tesouro Direto confirma que o Reserva segue essa tabela. A cobrança é no resgate ou no vencimento.
        </p>
        <ul class="trv__lista">
          <li>22,5% até 180 dias</li>
          <li>20% de 181 a 360 dias</li>
          <li>17,5% de 361 a 720 dias</li>
          <li>15% acima de 720 dias</li>
        </ul>
        <p>
          A faixa é a do
          <a :href="FONTE_IR" target="_blank" rel="noopener noreferrer">art. 1º da Lei 11.033/2004</a>,
          a mesma já usada nas simulações deste site.
          A B3 Educação resume os extremos: 22,5% até 180 dias e 15% acima de 720 dias.
        </p>
        <p>
          O IOF só entra se o resgate ocorrer nos primeiros 30 dias, segundo o Tesouro Direto.
          A tabela é a do
          <a :href="FONTE_IOF" target="_blank" rel="noopener noreferrer">anexo do art. 32 do Decreto 6.306/2007</a>.
          A simulação de 12 meses desta página não desconta IOF.
        </p>
        <p>
          A taxa de custódia da B3 é de 0,20% ao ano, isenta para valores de até R$ 10.000,00, segundo o Tesouro Direto.
          A B3 Educação detalha a isenção: até R$ 10 mil por CPF não há cobrança; acima disso, a taxa incide só sobre a parcela excedente.
        </p>
      </div>
    </CalcBand>

    <CalcBand tone="cream" title="Como aplicar.">
      <div class="trv__prosa">
        <p>
          O caminho abaixo é o que o site do Tesouro Direto descreve. Esta página não reproduz telas de aplicativo.
        </p>
        <ol class="trv__passos">
          <li>A simulação pode ser feita no site do Tesouro Direto.</li>
          <li>Para investir, o site direciona à plataforma da instituição parceira.</li>
          <li>A aplicação descrita lá é escolher o valor e finalizar a operação.</li>
          <li>O rendimento começa no dia útil seguinte à aplicação, todo dia útil.</li>
        </ol>
        <p>
          O título está, segundo o Tesouro Direto, inicialmente disponível pelo Banco do Brasil.
          O mesmo site informa que outras instituições ainda não ofertam o título e que, neste primeiro momento, quem não tem conta na instituição parceira precisa abrir uma para concluir.
          Esta página não indica instituição.
        </p>
        <p>
          Fonte:
          <a :href="FONTE_TESOURO_DIRETO" target="_blank" rel="noopener noreferrer">perguntas do Tesouro Direto sobre o Tesouro Reserva</a>.
        </p>
      </div>
    </CalcBand>

    <CalcBand tone="white" title="Quanto rende em 12 meses.">
      <template #dek>
        <p>
          {{ ROTULO_SIMULACAO }}.
          A conta repete a Selic efetiva de hoje por 365 dias corridos. A taxa muda. Não descreve o rendimento futuro.
        </p>
      </template>

      <p v-if="!linhas" class="trv__prosa">
        A Selic e o CDI do Banco Central não estão disponíveis nesta leitura. Os valores em reais ficam de fora até a série voltar.
      </p>

      <div v-else class="trv__valores">
        <article v-for="linha in linhas" :key="linha.entrada.slug" class="trv__valor">
          <h3>
            <NuxtLink :to="linha.href">{{ linha.entrada.nome }}</NuxtLink>
          </h3>
          <p class="trv__liq">{{ dinheiroFmt(liquidoDeIr(linha.reserva.montante, linha.reserva.imposto)) }}</p>
          <p class="trv__miudo">
            Líquido de IR ({{ aliquotaCurta(linha.reserva.aliquota) }}) em 365 dias.
            Bruto {{ dinheiroFmt(linha.reserva.montante) }}.
            IR {{ dinheiroFmt(linha.reserva.imposto) }}.
          </p>
          <p v-if="linha.reserva.custodia > 0.004" class="trv__miudo">
            Custódia desta conta: {{ dinheiroFmt(linha.reserva.custodia) }}.
            Depois de IR e custódia: {{ dinheiroFmt(linha.reserva.liquido) }}.
          </p>
          <p v-else class="trv__miudo">Custódia desta conta: zero, dentro da isenção de até R$ 10.000.</p>
        </article>
      </div>

      <div v-if="taxas && linhas" class="trv__prosa">
        <p>
          Selic efetiva {{ taxaFmt(taxas.selicAnual) }} ao ano, série {{ taxas.selicSerie }} do SGS, referência {{ diaCurto(taxas.selicData) }}.
          CDI {{ taxaFmt(taxas.cdiAnual) }} ao ano, série {{ taxas.cdiSerie }}, referência {{ diaCurto(taxas.cdiData) }}.
          Poupança {{ taxaFmt(taxas.poupancaMensal) }} ao mês, série 195, período {{ periodoPoupanca(taxas) }}.
          Fonte: <a :href="FONTE_BCB" target="_blank" rel="noopener noreferrer">Banco Central do Brasil</a>.
        </p>
        <p>
          O líquido de IR desconta a alíquota sobre o rendimento. Em 365 dias a faixa é 17,5%, porque o prazo cai entre 361 e 720 dias.
          A custódia, quando existe, aparece em linha separada: é a diferença entre render a Selic cheia e render a Selic menos 0,20 ponto percentual ao ano só na parcela acima de R$ 10.000, a mesma conta já publicada em
          <NuxtLink to="/quanto-rende/10-mil">quanto rende</NuxtLink>.
          O IR não abate essa custódia da base. A conta não usa dias úteis, não atrasa o primeiro dia útil e não projeta a Selic.
        </p>
      </div>

      <CtaConectarCarteira
        titulo="Compare com o que a sua carteira rendeu"
        corpo="Esta página simula a Selic de hoje. Conecte a carteira pelo Open Finance (só leitura) para ver o que os seus investimentos fizeram, com os seus números."
        to="/assinar?quiz=1&de=tesouro-reserva"
      />
    </CalcBand>

    <CalcBand tone="cream" title="Comparação com poupança, Tesouro Selic e CDB.">
      <template #dek>
        <p>
          Os quatro números usam as taxas de hoje do Banco Central, no mesmo prazo de 365 dias.
          Nenhum nomeia banco ou caixinha. Não é ranking e não é recomendação.
        </p>
      </template>
      <div class="trv__prosa">
        <p>
          <strong>Poupança.</strong>
          {{ regraPoupanca }}
          O número, quando a série responde, é o rendimento publicado na série 195, já com a TR do período.
          <a :href="FONTE_POUPANCA_BASE" target="_blank" rel="noopener noreferrer">Art. 12 da Lei 8.177/1991</a>,
          com a redação da
          <a :href="FONTE_POUPANCA" target="_blank" rel="noopener noreferrer">Lei 12.703/2012</a>.
          Para pessoa física, a isenção de IR está no
          <a :href="FONTE_POUPANCA_IR" target="_blank" rel="noopener noreferrer">art. 68, III, da Lei 8.981/1995</a>.
        </p>
        <p>
          <strong>Tesouro Selic.</strong>
          A linha usa a Selic efetiva, não a meta do Copom e não o spread que o Tesouro Direto publica para cada vencimento.
          A custódia segue a mesma conta de 0,20% ao ano só acima de R$ 10.000.
        </p>
        <p>
          <strong>CDB a 100% do CDI.</strong>
          A linha descreve a taxa de 100% do CDI, com o IR da renda fixa. Não indica emissor. Não há custódia da B3 nesta conta.
        </p>
        <p>
          <strong>Tesouro Reserva.</strong>
          A regra do produto é 100% da Selic. A simulação usa a mesma Selic efetiva. Por isso o número pode coincidir com a linha do Tesouro Selic: os dois não incluem spread de vencimento.
        </p>
      </div>

      <div v-if="linhas" class="trv__valores">
        <article v-for="linha in linhas" :key="`cmp-${linha.entrada.slug}`" class="trv__valor">
          <h3>
            <NuxtLink :to="linha.href">{{ linha.entrada.nome }}</NuxtLink>
          </h3>
          <dl>
            <div>
              <dt>Tesouro Reserva</dt>
              <dd>
                <span class="trv__liq trv__liq--menor">{{ dinheiroFmt(liquidoDeIr(linha.reserva.montante, linha.reserva.imposto)) }}</span>
                <span class="trv__miudo">Líquido de IR. Bruto {{ dinheiroFmt(linha.reserva.montante) }}.</span>
              </dd>
            </div>
            <div>
              <dt>Poupança</dt>
              <dd>
                <span class="trv__liq trv__liq--menor">{{ dinheiroFmt(linha.poupanca.liquido) }}</span>
                <span class="trv__miudo">Doze períodos da série 195. IR isento nesta simulação.</span>
              </dd>
            </div>
            <div>
              <dt>Tesouro Selic</dt>
              <dd>
                <span class="trv__liq trv__liq--menor">{{ dinheiroFmt(liquidoDeIr(linha.selic.montante, linha.selic.imposto)) }}</span>
                <span class="trv__miudo">Líquido de IR. Bruto {{ dinheiroFmt(linha.selic.montante) }}.</span>
              </dd>
            </div>
            <div>
              <dt>CDB a 100% do CDI</dt>
              <dd>
                <span class="trv__liq trv__liq--menor">{{ dinheiroFmt(liquidoDeIr(linha.cdi.montante, linha.cdi.imposto)) }}</span>
                <span class="trv__miudo">Líquido de IR. Bruto {{ dinheiroFmt(linha.cdi.montante) }}. Sem emissor.</span>
              </dd>
            </div>
          </dl>
        </article>
      </div>
    </CalcBand>

    <CalcBand tone="white" title="Diferenças para o Tesouro Selic.">
      <div class="trv__prosa">
        <p>
          O anúncio do Tesouro Nacional contrasta os dois títulos: ao contrário do Tesouro Selic, o Tesouro Reserva não tem marcação a mercado.
          A B3 Educação descreve o saldo do Reserva sem oscilação negativa por marcação a mercado.
          O preço do dia de cada Tesouro Selic está na página daquele vencimento, em
          <NuxtLink to="/tesouro">Tesouro Direto hoje</NuxtLink>.
        </p>
        <p>
          O Reserva opera praticamente 24 horas, 7 dias por semana, com a janela diária de 0h a 1h em que as operações ficam indisponíveis.
          O resgate do Reserva é imediato, com crédito via Pix segundo a B3 Educação.
          O mínimo do Reserva é R$ 1,00 para aplicar e para resgatar. O mínimo dos demais títulos é o do programa, na página de cada vencimento.
        </p>
        <p>
          A remuneração publicada para o Reserva é 100% da Selic.
          O Tesouro Selic acompanha a Selic e pode ter um spread no vencimento; esse spread não entra na simulação desta página.
          A taxa do dia do Reserva está em
          <NuxtLink :to="TESOURO_RESERVA_TITULO_PATH">Tesouro Reserva 2036</NuxtLink>.
        </p>
      </div>
    </CalcBand>

    <CalcBand tone="cream" title="Perguntas frequentes.">
      <div class="trv__faq">
        <NuFaqAccordion :items="TESOURO_RESERVA_FAQ" />
      </div>
    </CalcBand>

    <NuVejaTambem :links="vejaTambem" />
  </div>
</template>

<style scoped>
.trv { background: var(--nu-page); overflow-wrap: break-word; max-width: 100%; min-width: 0; }
.trv :deep(.nph__title),
.trv :deep(.nph__sub) { overflow-wrap: break-word; max-width: 100%; }
.trv__atalhos { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 4px 28px; max-width: 720px; }
.trv__atalhos :deep(.nls) { margin: 0; }
.trv__prosa {
  max-width: 72ch;
  margin: clamp(24px, 3vw, 32px) auto 0;
  color: var(--nu-gray-3);
  font-size: var(--nu-fs-md);
  font-weight: var(--nu-w-texto);
  line-height: 1.55;
}
.trv__prosa p { margin: 0 0 16px; }
.trv__prosa p:last-child { margin-bottom: 0; }
.trv__prosa a,
.trv__valor a {
  color: var(--nu-blue-text);
  font-weight: var(--nu-w-forte);
  text-decoration: underline;
  text-underline-offset: 0.15em;
}
.trv__lista,
.trv__passos {
  max-width: 72ch;
  margin: 0 auto 16px;
  padding: 0 0 0 1.25rem;
  color: var(--nu-gray-3);
  font-size: var(--nu-fs-md);
  line-height: 1.55;
}
.trv__lista li,
.trv__passos li { margin: 0 0 8px; }
.trv__valores {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  max-width: 980px;
  margin: clamp(24px, 3vw, 32px) auto 0;
  min-width: 0;
}
.trv__valor {
  min-width: 0;
  max-width: 100%;
  background: var(--nu-card);
  border-radius: var(--nu-r-panel);
  padding: 20px;
  box-shadow: var(--nu-shadow-quente);
}
.trv__valor h3 {
  margin: 0;
  color: var(--nu-ink);
  font-size: clamp(18px, 1.5vw, 21px);
  font-weight: var(--nu-w-forte);
  letter-spacing: var(--nu-ls-titulo);
  overflow-wrap: anywhere;
}
.trv__liq {
  margin: 12px 0 0;
  color: var(--nu-ink);
  font-size: clamp(28px, 4vw, 36px);
  font-weight: var(--nu-w-display);
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.trv__liq--menor { font-size: 18px; letter-spacing: -0.02em; }
.trv__miudo {
  margin: 6px 0 0;
  color: var(--nu-gray-2);
  font-size: 13px;
  font-weight: var(--nu-w-texto);
  line-height: 1.45;
  overflow-wrap: anywhere;
}
.trv__valor dl { margin: 12px 0 0; }
.trv__valor dl > div {
  display: grid;
  grid-template-columns: minmax(0, 8.5rem) minmax(0, 1fr);
  gap: 8px 12px;
  padding: 10px 0;
  border-top: 1px solid var(--nu-line);
}
.trv__valor dt {
  margin: 0;
  color: var(--nu-gray-2);
  font-size: 13px;
  font-weight: var(--nu-w-medio);
  overflow-wrap: anywhere;
}
.trv__valor dd { margin: 0; min-width: 0; }
.trv__faq { max-width: 760px; margin: clamp(24px, 3vw, 32px) auto 0; }
@media (min-width: 900px) {
  .trv__valores { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 389px) {
  .trv__valor dl > div { grid-template-columns: minmax(0, 1fr); }
}
</style>
