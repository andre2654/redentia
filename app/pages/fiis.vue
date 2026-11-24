<script setup lang="ts">
// /fiis — hub de fundos imobiliários. Os rankings só de FIIs ficam em
// /rankings/fiis. O filtro do hub continua em /rankings?classe=fiis. Os números desta página só existem se o ranking de
// dividend yield devolver cotação e data de pregão; sem isso, a lista some.
import type { LinhaFii } from '~/utils/graficos'
import {
  FIIS_DESCRIPTION,
  FIIS_FAQ,
  FIIS_H1,
  FIIS_PATH,
  FIIS_SUBTITLE,
  FIIS_TIPOS,
  FIIS_TITLE,
} from '~/content/seo/fiis-hub'
import { listaDeFiis } from '~/utils/fiisLista'

const { data: lista } = await useAsyncData('fiis-hub-lista', async () => {
  try {
    const resp = await $fetch<{ data?: LinhaFii[] }>(
      '/api/backend/rankings/top-dividend-yield?type=REIT&limit=100&min_cap=0',
      { headers: { Accept: 'application/json' }, timeout: 8000 },
    )
    return listaDeFiis(resp?.data ?? [])
  } catch {
    return listaDeFiis(null)
  }
}, { default: () => listaDeFiis(null) })

const itens = computed(() => lista.value?.itens ?? [])
const fonte = computed(() => lista.value?.fonte ?? '')

usePageSeo({
  title: FIIS_TITLE,
  description: FIIS_DESCRIPTION,
  path: FIIS_PATH,
  dateModified: computed(() => lista.value?.dataIso ?? null),
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Fundos imobiliários', path: FIIS_PATH },
  ],
})
</script>

<template>
  <div class="fiis">
    <NuPageHero eyebrow="Fundos imobiliários" :subtitle="FIIS_SUBTITLE">
      <template #title>{{ FIIS_H1 }}</template>
      <div class="fiis__atalhos">
        <NuLinkSeta to="/rankings/fiis">Rankings de FIIs</NuLinkSeta>
        <NuLinkSeta to="/calculadora/dividend-yield">Calculadora de dividend yield</NuLinkSeta>
        <NuLinkSeta to="/calculadora/imposto-renda">Calculadora de IR</NuLinkSeta>
      </div>
    </NuPageHero>

    <CalcBand tone="white" title="O que é um FII.">
      <div v-revelar class="fiis__prosa">
        <p>
          Fundo de investimento imobiliário é um condomínio: várias pessoas aplicam juntas em imóveis ou em títulos ligados ao setor. A cota negocia na B3 como um papel, e quem a tem recebe a parte que lhe cabe da renda distribuída. Comprar a cota não é comprar o prédio, nem trava o dinheiro do jeito que um imóvel físico trava.
        </p>
        <p>
          A <a href="https://www.planalto.gov.br/ccivil_03/leis/l8668.htm" target="_blank" rel="noopener noreferrer">Lei 8.668/1993</a> é a lei que disciplina esse fundo. O preço da cota muda no pregão. Receber rendimento e ver a cota cair no mesmo mês são coisas que acontecem juntas. O verbete do <NuxtLink to="/glossario/fii">glossário</NuxtLink> conta a mesma definição, em formato de dicionário.
        </p>
      </div>
    </CalcBand>

    <CalcBand tone="cream" title="Quatro tipos.">
      <template #dek>
        <p>O tipo diz de onde vem a renda. Não diz qual fundo cabe na sua carteira.</p>
      </template>
      <div v-revelar="{ alvo: 'filhos', passo: 60 }" class="fiis__tipos">
        <article v-for="tipo in FIIS_TIPOS" :key="tipo.id" class="fiis__tipo">
          <h3>{{ tipo.titulo }}</h3>
          <p>{{ tipo.texto }}</p>
        </article>
      </div>
    </CalcBand>

    <CalcBand tone="white" title="Como o rendimento funciona.">
      <div v-revelar class="fiis__prosa">
        <p>
          No tijolo, o fundo aluga o imóvel e distribui o que sobra depois dos custos. No papel, distribui os juros dos títulos. No híbrido, as duas fontes entram. No fundo de fundos, a renda é a que os outros FIIs distribuíram, menos a taxa desta camada.
        </p>
        <p>
          A Lei 8.668/1993 exige a distribuição de no mínimo 95% dos lucros auferidos, apurados pelo regime de caixa, com base em balanço ou balancete semestral encerrado em 30 de junho e em 31 de dezembro. A obrigação é semestral. Pagar todo mês é o que a maior parte dos fundos faz, não um dever de calendário, e o valor de um mês não promete o do seguinte. Amortização devolve capital e não é rendimento. O <NuxtLink to="/guias/data-com-e-data-ex">guia de data com e data ex</NuxtLink> separa essas datas.
        </p>
      </div>
    </CalcBand>

    <CalcBand tone="cream" title="Isenção de IR para a pessoa física.">
      <div v-revelar class="fiis__prosa">
        <p>
          Pelo <a href="https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l11033compilado.htm" target="_blank" rel="noopener noreferrer">art. 3º, III, da Lei 11.033/2004</a>, o rendimento distribuído por fundo de investimento imobiliário com cotas admitidas à negociação exclusivamente em bolsa ou mercado de balcão organizado é isento de IR na fonte e na declaração da pessoa física.
        </p>
        <p>
          O § 1º, I, exige no mínimo 100 cotistas, na redação da <a href="https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14754.htm" target="_blank" rel="noopener noreferrer">Lei 14.754/2023</a>. O § 1º, II, na redação da <a href="https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14130.htm" target="_blank" rel="noopener noreferrer">Lei 14.130/2021</a>, não dá o benefício a quem tem 10% ou mais das cotas ou dos rendimentos do fundo.
        </p>
        <p>
          O ganho na alienação ou no resgate da cota paga IR de 20%, pelo <a href="https://www.planalto.gov.br/ccivil_03/leis/l8668.htm" target="_blank" rel="noopener noreferrer">art. 18 da Lei 8.668/1993</a>, com a redação da Lei 9.779/1999. Não há, nessa venda, a faixa de isenção de R$ 20 mil que vale para ações. A <NuxtLink to="/calculadora/imposto-renda">calculadora de imposto de renda</NuxtLink> trata do ganho em ações; a regra do FII é esta daqui.
        </p>
      </div>
    </CalcBand>

    <CalcBand tone="white" title="Fundos com dividend yield publicado.">
      <template #dek>
        <p>Até doze fundos, na ordem do indicador, do maior para o menor. DY acima de 50% fica de fora, o mesmo corte do ranking. A ordem não é indicação de compra.</p>
      </template>
      <p v-if="fonte" class="fiis__fonte">{{ fonte }} Não é recomendação.</p>
      <ol v-if="itens.length" class="fiis__lista">
        <li v-for="item in itens" :key="item.ticker" class="fiis__item">
          <div class="fiis__quem">
            <NuxtLink :to="`/asset/${item.ticker}`" class="fiis__nome">
              <NuAssetLogo :ticker="item.ticker" :letter="item.ticker.charAt(0)" tile-bg="var(--nu-cream-2)" tile-fg="var(--nu-ink)" :size="36" :radius="10" />
              <span>
                <span class="fiis__ticker">{{ item.ticker }}</span>
                <span class="fiis__empresa">{{ item.nome }}</span>
              </span>
            </NuxtLink>
          </div>
          <dl class="fiis__nums">
            <div>
              <dt>DY 12 meses</dt>
              <dd>{{ item.dy }}</dd>
            </div>
            <div>
              <dt>Cotação</dt>
              <dd>{{ item.preco }}</dd>
            </div>
            <div>
              <dt>Pregão</dt>
              <dd>{{ item.data }}</dd>
            </div>
          </dl>
          <nav class="fiis__ir" :aria-label="`Páginas de ${item.ticker}`">
            <NuxtLink :to="`/dividendos/${item.ticker}`">Dividendos</NuxtLink>
            <NuxtLink :to="`/quanto-rende/${item.ticker}`">Quanto rende</NuxtLink>
            <NuxtLink :to="`/asset/${item.ticker}`">Ativo</NuxtLink>
          </nav>
        </li>
      </ol>
      <p v-else class="fiis__vazio">Os números deste recorte não estão disponíveis agora. As páginas de cada fundo seguem no ranking e na busca.</p>
      <p class="fiis__mais">
        <NuLinkSeta to="/ranking/maiores-dividend-yield?type=fiis">Abrir o ranking de dividend yield</NuLinkSeta>
      </p>
    </CalcBand>

    <CalcBand tone="cream" title="Contas e leituras.">
      <div v-revelar="{ alvo: 'filhos' }" class="fiis__cards">
        <NuxtLink to="/calculadora/dividend-yield" class="fiis__card">
          <h3>Calculadora de dividend yield</h3>
          <p>A conta do rendimento sobre o preço. O resultado é uma conta, não uma previsão.</p>
        </NuxtLink>
        <NuxtLink to="/calculadora/imposto-renda" class="fiis__card">
          <h3>Calculadora de imposto de renda</h3>
          <p>Swing trade, day trade e a faixa das ações. A regra do FII está na seção acima.</p>
        </NuxtLink>
        <NuxtLink to="/calculadoras" class="fiis__card">
          <h3>Todas as calculadoras</h3>
          <p>Juros compostos, preço teto e as outras contas abertas do site.</p>
        </NuxtLink>
        <NuxtLink to="/guias/melhores-fiis-2026" class="fiis__card">
          <h3>Como ler um FII</h3>
          <p>O guia explica critérios. Não entrega uma lista de cotas para comprar.</p>
        </NuxtLink>
        <NuxtLink to="/graficos#fiis" class="fiis__card">
          <h3>Gráfico de DY</h3>
          <p>O mesmo recorte de fundos imobiliários, em barras, com a data do pregão.</p>
        </NuxtLink>
        <NuxtLink to="/rankings/fiis" class="fiis__card">
          <h3>Rankings de FIIs</h3>
          <p>Dividend yield de 12 meses e volume do pregão, só de fundos imobiliários, com a data do dado.</p>
        </NuxtLink>
      </div>
    </CalcBand>

    <CalcBand tone="white" title="Perguntas frequentes.">
      <div class="fiis__faq">
        <NuFaqAccordion :items="FIIS_FAQ" />
      </div>
    </CalcBand>
  </div>
</template>

<style scoped>
.fiis { background: var(--nu-page); overflow-wrap: break-word; }
.fiis__atalhos { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 4px 28px; max-width: 720px; }
.fiis__atalhos :deep(.nls) { margin: 0; }
.fiis__prosa { max-width: 72ch; margin: clamp(28px, 3vw, 40px) auto 0; }
.fiis__prosa p {
  margin: 0 0 16px; color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-texto);
  letter-spacing: var(--nu-ls-texto); line-height: 1.6;
}
.fiis__prosa p:last-child { margin-bottom: 0; }
.fiis__prosa a {
  color: var(--nu-blue-text); font-weight: var(--nu-w-medio); text-decoration: underline;
  text-underline-offset: 3px; text-decoration-thickness: 1.5px;
  text-decoration-color: color-mix(in srgb, currentColor 35%, transparent);
}
.fiis__prosa a:hover { text-decoration-color: currentColor; }

.fiis__tipos {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px;
  margin-top: clamp(28px, 3vw, 40px);
}
.fiis__tipo {
  min-width: 0; background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 24px;
  box-shadow: var(--nu-shadow-branco);
}
.fiis__tipo h3 {
  margin: 0; color: var(--nu-ink); font-size: clamp(18px, 1.5vw, 22px); font-weight: var(--nu-w-forte);
  letter-spacing: var(--nu-ls-titulo); line-height: 1.2;
}
.fiis__tipo p {
  margin: 10px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.55;
}

.fiis__fonte, .fiis__vazio {
  max-width: 72ch; margin: clamp(24px, 3vw, 32px) auto 0; color: var(--nu-gray-3);
  font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.55;
}
.fiis__lista { list-style: none; margin: 20px auto 0; padding: 0; max-width: 980px; display: flex; flex-direction: column; gap: 12px; }
.fiis__item {
  display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 12px 20px;
  align-items: center; min-width: 0; background: var(--nu-card); border-radius: var(--nu-r-panel);
  padding: 16px 18px; box-shadow: var(--nu-shadow-quente);
}
.fiis__quem { min-width: 0; }
.fiis__nome {
  display: flex; align-items: center; gap: 12px; min-width: 0; color: var(--nu-ink); text-decoration: none;
}
.fiis__nome > span { display: flex; flex-direction: column; min-width: 0; }
.fiis__ticker { color: var(--nu-ink); font-size: 15px; font-weight: var(--nu-w-forte); letter-spacing: 0.04em; }
.fiis__empresa {
  color: var(--nu-gray-3); font-size: 13.5px; font-weight: var(--nu-w-texto); line-height: 1.35;
  overflow-wrap: anywhere;
}
.fiis__nome:hover .fiis__ticker { color: var(--nu-blue-text); }
.fiis__nome:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; border-radius: 8px; }
.fiis__nums { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px 12px; margin: 0; }
.fiis__nums div { min-width: 0; }
.fiis__nums dt { color: var(--nu-gray); font-size: 12px; font-weight: var(--nu-w-texto); line-height: 1.3; }
.fiis__nums dd {
  margin: 2px 0 0; color: var(--nu-ink); font-size: 15px; font-weight: var(--nu-w-medio);
  font-variant-numeric: tabular-nums; line-height: 1.3; overflow-wrap: anywhere;
}
.fiis__ir { display: flex; flex-wrap: wrap; gap: 8px 16px; grid-column: 1 / -1; }
.fiis__ir a {
  color: var(--nu-blue-text); font-size: 14px; font-weight: var(--nu-w-medio); text-decoration: underline;
  text-underline-offset: 3px; line-height: 1.4;
}
.fiis__ir a:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.fiis__mais { max-width: 980px; margin: 20px auto 0; }

.fiis__cards {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px;
  margin-top: clamp(28px, 3vw, 40px);
}
.fiis__card {
  display: flex; flex-direction: column; gap: 8px; min-width: 0; background: var(--nu-white);
  border-radius: var(--nu-r-panel); padding: 24px; box-shadow: var(--nu-shadow-branco); text-decoration: none;
  transition: transform var(--nu-dur-media) var(--nu-ease-saida), box-shadow var(--nu-dur-media) var(--nu-ease-saida);
}
.fiis__card h3 {
  margin: 0; color: var(--nu-ink); font-size: clamp(17px, 1.4vw, 20px); font-weight: var(--nu-w-forte);
  letter-spacing: var(--nu-ls-titulo); line-height: 1.25;
}
.fiis__card p { margin: 0; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.5; }
.fiis__card:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.fiis__card:hover h3 { color: var(--nu-blue-text); }
.fiis__card:active { transform: scale(.995); }
.fiis__card:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.fiis__faq { max-width: 760px; margin: clamp(8px, 2vw, 16px) auto 0; }

@media (max-width: 900px) {
  .fiis__tipos, .fiis__cards { grid-template-columns: 1fr; }
  .fiis__item { grid-template-columns: 1fr; }
}
@media (hover: hover) {
  .fiis__prosa a { transition: text-decoration-color var(--nu-dur-media) var(--nu-ease-cor); }
}
@media (prefers-reduced-motion: reduce) {
  .fiis__card { transition: none; }
  .fiis__card:hover, .fiis__card:active { transform: none; }
}
</style>
