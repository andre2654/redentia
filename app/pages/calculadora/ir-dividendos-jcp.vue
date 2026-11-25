<script setup lang="ts">
// /calculadora/ir-dividendos-jcp — líquido de dividendos e de JCP.
// A conta reusa a regra já publicada em /quanto-rende (art. 6º-A da Lei
// 9.250/1995, incluído pela Lei 15.270/2025) e TEXTO_ALIQUOTA_JCP (LC 224/2025).
// A calculadora de /calculadora/imposto-renda segue sendo a da venda de ações.
import { TEXTO_ALIQUOTA_JCP } from '~/utils/dividendosBlocos'
import { URL_LC_224, URL_LEI_15270 } from '~/utils/impostoRendaPagina'

const CONTENT_VERSION = '2026-11-24'
const lastUpdated = new Date(`${CONTENT_VERSION}T12:00:00Z`)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' })

const faqItems = [
  {
    q: 'Quando o dividendo tem retenção de IR?',
    a: 'Quando uma mesma empresa paga a uma mesma pessoa física mais de R$ 50.000 em lucros e dividendos num mesmo mês, desde janeiro de 2026. A retenção é de 10% sobre o total pago no mês, não só sobre o que excedeu. Até R$ 50.000, não há retenção. A base é o art. 6º-A da Lei 9.250/1995, incluído pelo art. 2º da Lei 15.270/2025.',
  },
  {
    q: 'O JCP paga 17,5% sobre o valor todo?',
    a: `${TEXTO_ALIQUOTA_JCP} Não há a faixa de R$ 50.000 do dividendo: a retenção incide sobre o valor pago.`,
  },
  {
    q: 'R$ 50.000 exatos têm retenção?',
    a: 'Não. A retenção só começa no montante superior a R$ 50.000. Em R$ 50.000 o dividendo segue sem retenção. Um real acima faz os 10% incidirem sobre o total do mês.',
  },
  {
    q: 'Esta conta substitui um contador?',
    a: 'Não. É uma conta educativa de uma empresa e um mês. Não é consultoria tributária e não é recomendação. A tributação mínima anual de quem recebe mais de R$ 600 mil no ano não entra aqui.',
  },
]

usePageSeo({
  title: 'Imposto sobre dividendos e JCP em 2026',
  description:
    'Calcule o líquido de dividendos e JCP em 2026. Acima de R$ 50 mil no mês, a mesma empresa retém 10% sobre o total. No JCP, a retenção é de 17,5%. Grátis.',
  path: '/calculadora/ir-dividendos-jcp',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadoras' },
    { name: 'IR dividendos e JCP', path: '/calculadora/ir-dividendos-jcp' },
  ],
  structuredData: [
    {
      '@type': 'WebApplication',
      name: 'Calculadora de IR sobre dividendos e JCP',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      dateModified: `${CONTENT_VERSION}T12:00:00Z`,
      description:
        'Calcula o líquido de dividendos e de JCP de uma mesma empresa num mesmo mês, com a retenção de 10% sobre o total acima de R$ 50.000 e a retenção de 17,5% no JCP.',
      featureList: [
        'Retenção de dividendos acima de R$ 50.000 no mês',
        'JCP líquido com retenção de 17,5%',
        'Preenchimento opcional com avisos de proventos da B3',
      ],
    },
  ],
})
</script>

<template>
  <div>
    <CalcTopo desc="Uma mesma empresa, num mesmo mês. Acima de R$ 50 mil, os 10% incidem sobre o total. O JCP sai com 17,5% retidos.">
      Quanto sobra de dividendos e JCP?
    </CalcTopo>

    <CalcIrDividendosJcpSection section-id="ir-dividendos" />

    <CalcMetaStrip
      label="Calculadora · IR dividendos e JCP"
      :chips="['Educativo', 'Uma empresa, um mês', 'JCP a 17,5%', 'Dividendos acima de R$ 50 mil']"
      :updated="lastUpdatedText"
    />

    <CalcBand v-revelar tone="cream" title="Exemplos da mesma regra">
      <template #dek>
        <p>Cada exemplo é o que uma mesma empresa pagou a uma mesma pessoa no mês. Outra empresa tem outro limite.</p>
      </template>
      <div class="irj-page__scenarios">
        <NuxtLink to="/calculadora/ir-dividendos-jcp?dividendos=1000&jcp=500" class="irj-page__scenario">
          <span class="irj-page__scenario-label">R$ 1.000 e JCP de R$ 500</span>
          <span class="irj-page__scenario-sub">Dividendo sem retenção, JCP com 17,5%</span>
        </NuxtLink>
        <NuxtLink to="/calculadora/ir-dividendos-jcp?dividendos=50000&jcp=0" class="irj-page__scenario">
          <span class="irj-page__scenario-label">R$ 50.000 exatos</span>
          <span class="irj-page__scenario-sub">No limite: dividendo sem retenção</span>
        </NuxtLink>
        <NuxtLink to="/calculadora/ir-dividendos-jcp?dividendos=60000&jcp=0" class="irj-page__scenario">
          <span class="irj-page__scenario-label">R$ 60.000 em dividendos</span>
          <span class="irj-page__scenario-sub">10% sobre o total, R$ 6.000 retidos</span>
        </NuxtLink>
        <NuxtLink to="/calculadora/ir-dividendos-jcp?dividendos=50000.01&jcp=0" class="irj-page__scenario">
          <span class="irj-page__scenario-label">Um real acima do limite</span>
          <span class="irj-page__scenario-sub">Os 10% passam a incidir sobre o total</span>
        </NuxtLink>
      </div>
    </CalcBand>

    <CalcSplit v-revelar tone="white">
      <template #title>De onde vem a conta</template>
      <div class="irj-page__prose">
        <p>
          Pelo <a :href="URL_LEI_15270" target="_blank" rel="noopener noreferrer">art. 6º-A da Lei 9.250/1995, incluído pelo art. 2º da Lei 15.270/2025</a>,
          há retenção na fonte de 10% sobre o total do valor pago quando o montante que uma mesma pessoa jurídica paga a uma mesma pessoa física residente no Brasil, num mesmo mês, é superior a R$ 50.000.
          O caput fixa esse marco a partir de janeiro de 2026. O art. 8º da Lei 15.270/2025 produz efeitos a partir de 1º de janeiro de 2026.
          Até R$ 50.000, o dividendo segue sem retenção. A alíquota não incide só sobre o excedente.
        </p>
        <p>
          {{ TEXTO_ALIQUOTA_JCP }}
          A redação está no <a :href="URL_LC_224" target="_blank" rel="noopener noreferrer">art. 8º da Lei Complementar 224/2025</a>,
          que altera o § 2º do art. 9º da Lei 9.249/1995. O art. 14, III, da lei complementar produz efeitos a partir de 1º de janeiro de 2026 para esse dispositivo.
          Não há a faixa mensal de R$ 50.000: a retenção incide sobre o valor pago.
        </p>
        <p>
          A soma é de uma empresa e de um mês. Receber de várias companhias não junta os limites.
          Rendimento de FII e provento de BDR ficam de fora: a página de <NuxtLink to="/quanto-rende/PETR4">quanto rende</NuxtLink> já separa esses regimes.
          A tributação mínima anual de quem recebe mais de R$ 600 mil no ano também não entra nesta conta.
        </p>
        <p>Conteúdo educativo. Não é consultoria tributária e não é recomendação de investimento, de compra, de venda ou de como declarar.</p>
      </div>
    </CalcSplit>

    <CalcSplit v-revelar tone="cream" wide>
      <template #title>Perguntas sobre o imposto</template>
      <NuFaqAccordion :items="faqItems" />
    </CalcSplit>

    <CalcBand v-revelar tone="white" title="Continue a leitura">
      <div class="irj-page__links">
        <NuxtLink to="/jcp" class="irj-page__link">
          <h3>JCP</h3>
          <p>Juros sobre capital próprio, a retenção na fonte e a diferença para o dividendo.</p>
        </NuxtLink>
        <NuxtLink to="/dividendos/PETR4" class="irj-page__link">
          <h3>Dividendos de PETR4</h3>
          <p>Histórico, data com e valor por ação. O ticker da conta troca este caminho.</p>
        </NuxtLink>
        <NuxtLink to="/calculadora/imposto-renda" class="irj-page__link">
          <h3>IR sobre a venda de ações</h3>
          <p>Swing trade, day trade e o DARF. Não calcula a retenção de dividendo e JCP.</p>
        </NuxtLink>
      </div>
    </CalcBand>
  </div>
</template>

<style scoped>
.irj-page__scenarios {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr));
  gap: 10px; margin-top: clamp(24px, 3.5vw, 36px);
}
.irj-page__scenario {
  background: var(--nu-white); box-shadow: var(--nu-shadow-branco); border-radius: var(--nu-r-tile); padding: 16px 18px;
  display: flex; flex-direction: column; gap: 3px; min-width: 0;
  transition: transform var(--nu-dur-media) var(--nu-ease-saida);
}
.irj-page__scenario:hover { transform: translateY(-2px); }
.irj-page__scenario:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.irj-page__scenario-label { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.irj-page__scenario-sub { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-texto); line-height: 1.4; }
.irj-page__prose { max-width: 72ch; }
.irj-page__prose p { margin: 0 0 16px; color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-texto); line-height: 1.6; }
.irj-page__prose p:last-child { margin-bottom: 0; }
.irj-page__prose a { color: var(--nu-blue-text); font-weight: var(--nu-w-medio); text-decoration: underline; text-underline-offset: 3px; }
.irj-page__links {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr));
  gap: 16px; margin-top: clamp(24px, 3.5vw, 36px);
}
.irj-page__link {
  display: flex; flex-direction: column; gap: 6px; min-width: 0;
  background: var(--nu-white); box-shadow: var(--nu-shadow-branco); border-radius: var(--nu-r-panel); padding: 22px;
  transition: transform var(--nu-dur-media) var(--nu-ease-saida);
}
.irj-page__link:hover { transform: translateY(-2px); }
.irj-page__link:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.irj-page__link h3 { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-forte); }
.irj-page__link p { margin: 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.5; }
</style>
