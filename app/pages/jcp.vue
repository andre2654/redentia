<script setup lang="ts">
// /jcp — o que é juros sobre capital próprio. Header, footer e fonte vêm do
// layout. A alíquota é a de /quanto-rende. Empresas só entram com aviso e data
// já lidos na base da B3 (GET /api/jcp). Sem essa leitura, a lista fica vazia.
import {
  JCP_DESCRIPTION,
  JCP_FAQ,
  JCP_H1,
  JCP_LEAD,
  JCP_LINKS,
  JCP_PATH,
  JCP_PUBLICADO,
  JCP_TITLE,
  REGRA_DIVIDENDO,
  REGRA_JCP,
  TEXTO_ALIQUOTA_JCP,
} from '~/content/jcp'
import { NOTA_CVM } from '~/utils/agendaDividendos'
import { FONTE_PAGADORES_JCP, respostaVaziaPagadores, type RespostaPagadoresJcp } from '~/utils/jcpPagadores'

const { data } = await useAsyncData('jcp-pagadores', () =>
  $fetch<RespostaPagadoresJcp>('/api/jcp').catch(() => respostaVaziaPagadores(false)),
)

const resposta = computed(() => data.value ?? respostaVaziaPagadores(false))

usePageSeo({
  title: JCP_TITLE,
  description: JCP_DESCRIPTION,
  path: JCP_PATH,
  structuredData: [{
    '@type': 'Article',
    headline: JCP_TITLE,
    description: JCP_DESCRIPTION,
    datePublished: JCP_PUBLICADO,
    dateModified: JCP_PUBLICADO,
    author: { '@type': 'Organization', name: MARCA.nome },
    inLanguage: 'pt-BR',
  }],
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Juros sobre capital próprio', path: JCP_PATH },
  ],
})
</script>

<template>
  <div>
    <header class="jcp__topo">
      <NuEyebrow como="p">Proventos</NuEyebrow>
      <h1 class="jcp__h1">{{ JCP_H1 }}</h1>
      <p class="jcp__lead">{{ JCP_LEAD }}</p>
    </header>

    <CalcBand tone="cream" title="O que é.">
      <div class="jcp__prose">
        <p>
          Os juros sobre capital próprio são uma forma de a companhia remunerar quem tem a ação, em dinheiro, como os <NuxtLink to="/glossario/dividendos">dividendos</NuxtLink>.
          Os dois são <NuxtLink to="/glossario/proventos">proventos</NuxtLink>. O nome muda a regra do imposto, não o fato de o aviso sair na B3 com data com e data de pagamento.
        </p>
        <p>
          O verbete do <NuxtLink to="/glossario/jscp">glossário</NuxtLink> resume o instrumento. Aqui ficam a redação legal já usada no site, as datas do aviso e o caminho do informe de rendimentos.
        </p>
      </div>
    </CalcBand>

    <CalcBand tone="white" title="A diferença para o dividendo.">
      <div class="jcp__prose">
        <p>
          Dividendo e JCP não seguem a mesma retenção. O texto abaixo é a redação já publicada no site, com os links para o Planalto.
        </p>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p v-html="REGRA_DIVIDENDO" />
      </div>
    </CalcBand>

    <CalcBand tone="cream" title="A retenção de 17,5%.">
      <div class="jcp__prose">
        <p>{{ TEXTO_ALIQUOTA_JCP }}</p>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p v-html="REGRA_JCP" />
        <p>
          A <NuxtLink to="/calculadora/imposto-renda">calculadora de imposto de renda</NuxtLink> descreve a mesma retenção. Ela não calcula um líquido por investidor e não projeta resultado.
        </p>
      </div>
    </CalcBand>

    <CalcBand tone="white" title="Data com e data ex.">
      <div class="jcp__prose">
        <p>
          O JCP percorre as mesmas datas de qualquer provento anunciado no Brasil. Quem decide o direito é o fechamento da data com. A data ex é o pregão seguinte, e nele o papel negocia sem aquele direito. A data de pagamento é o dia em que o valor cai na conta da corretora. Ela não muda quem tem direito.
        </p>
        <p>
          A data ex não é um campo do aviso: quando o calendário de negociação da B3 está no site, o dia mostrado é o pregão seguinte à data com. Sem esse calendário, a página diz só que é o pregão seguinte. O <NuxtLink to="/guias/data-com-e-data-ex">guia de data com e data ex</NuxtLink> descreve a sequência inteira.
        </p>
      </div>
    </CalcBand>

    <CalcBand tone="cream" title="No informe de rendimentos.">
      <div class="jcp__prose">
        <p>
          O IR do JCP já sai retido, e o valor ainda entra na declaração anual, na ficha de rendimentos sujeitos à tributação exclusiva. É a mesma ressalva do verbete de JCP no glossário.
        </p>
        <p>
          Cada corretora e cada banco disponibiliza um informe de rendimentos anual, com posições, proventos e impostos retidos. O informe da fonte pagadora documenta a origem daquele pagamento. O <NuxtLink to="/guias/como-declarar-investimentos-no-ir">guia de como declarar investimentos no IR</NuxtLink> reúne o roteiro da declaração.
        </p>
      </div>
    </CalcBand>

    <CalcBand tone="white" title="Avisos de JCP com data.">
      <template #dek>
        <p>{{ resposta.fonte || FONTE_PAGADORES_JCP }}</p>
      </template>
      <p v-if="!resposta.ok" class="jcp__aviso">A leitura dos avisos não carregou. Nenhum ticker foi colocado no lugar.</p>
      <p v-else-if="!resposta.pagadores.length" class="jcp__aviso">Não há aviso de JCP com data de pagamento nesta leitura da base da B3.</p>
      <ul v-else class="jcp__lista">
        <li v-for="p in resposta.pagadores" :key="`${p.ticker}-${p.pagamento}`" class="jcp__item">
          <NuxtLink :to="p.href" class="jcp__ticker">{{ p.ticker }}</NuxtLink>
          <p v-if="p.nome && p.nome !== p.ticker" class="jcp__nome">{{ p.nome }}</p>
          <p class="jcp__datas">{{ p.rotulo }}. Pagamento em {{ p.pagamentoTexto }}<template v-if="p.dataComTexto">. Data com em {{ p.dataComTexto }}</template>. Data ex: {{ p.dataExTexto }}.</p>
        </li>
      </ul>
      <p class="jcp__nota jcp__nota--lista">{{ resposta.nota || NOTA_CVM }}</p>
    </CalcBand>

    <CalcSplit tone="cream" wide>
      <template #title>Perguntas frequentes.</template>
      <NuFaqAccordion :items="JCP_FAQ" />
    </CalcSplit>

    <CalcBand tone="white" title="Continue a leitura.">
      <div class="jcp__cards">
        <NuxtLink v-for="link in JCP_LINKS" :key="link.to" :to="link.to" class="jcp__card">
          <h3 class="jcp__card-titulo">{{ link.titulo }}</h3>
          <p class="jcp__card-p">{{ link.texto }}</p>
          <span class="jcp__ir">Abrir<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg></span>
        </NuxtLink>
      </div>
    </CalcBand>
  </div>
</template>

<style scoped>
.jcp__topo {
  background: var(--nu-page); color: var(--nu-ink);
  padding: clamp(40px, 4.6vw, 72px) var(--nu-coluna) clamp(28px, 4vw, 48px);
}
.jcp__h1 {
  margin: 16px 0 0; max-width: 16ch;
  font-size: clamp(40px, 4.8vw, 68px); font-weight: var(--nu-w-display);
  letter-spacing: var(--nu-ls-display); line-height: .98; text-wrap: balance;
}
.jcp__lead {
  margin: 20px 0 0; max-width: 52ch; color: var(--nu-gray-3);
  font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-texto);
  letter-spacing: var(--nu-ls-texto); line-height: 1.45; text-wrap: pretty;
}
.jcp__nota { margin: 16px 0 0; max-width: 62ch; color: var(--nu-gray); font-size: 14px; line-height: 1.5; }
.jcp__nota--lista { margin: 20px auto 0; text-align: center; }

.jcp__prose { max-width: 72ch; margin: clamp(24px, 3vw, 36px) auto 0; }
.jcp__prose p {
  margin: 0 0 16px; color: var(--nu-gray-3); font-size: var(--nu-fs-lg);
  font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.6;
}
.jcp__prose p:last-child { margin-bottom: 0; }
.jcp__prose :deep(a) {
  color: var(--nu-blue-text); font-weight: var(--nu-w-medio); text-decoration: underline;
  text-underline-offset: 3px; text-decoration-thickness: 1.5px;
  text-decoration-color: color-mix(in srgb, currentColor 35%, transparent);
}

.jcp__aviso { max-width: 68ch; margin: 20px auto 0; text-align: center; color: var(--nu-gray-3); font-size: var(--nu-fs-md); line-height: 1.5; }
.jcp__lista {
  display: grid; grid-template-columns: 1fr; gap: 12px;
  max-width: 1080px; margin: clamp(28px, 4vw, 40px) auto 0; padding: 0; list-style: none;
}
.jcp__item {
  min-width: 0; background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 18px 20px;
  box-shadow: var(--nu-shadow-branco);
}
.jcp__ticker {
  color: var(--nu-ink); font-size: clamp(18px, 1.6vw, 22px); font-weight: var(--nu-w-forte);
  letter-spacing: var(--nu-ls-titulo); text-decoration: none;
}
.jcp__ticker:hover { color: var(--nu-blue-text); }
.jcp__ticker:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.jcp__nome { margin: 4px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio); line-height: 1.3; }
.jcp__datas { margin: 8px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); line-height: 1.45; }

.jcp__cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr));
  gap: 16px; max-width: 1080px; margin: clamp(28px, 4vw, 40px) auto 0;
}
.jcp__card {
  display: flex; flex-direction: column; gap: 8px; min-width: 0;
  background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 22px;
  box-shadow: var(--nu-shadow-branco); text-decoration: none; color: inherit;
  transition: transform var(--nu-dur-media) var(--nu-ease-saida), box-shadow var(--nu-dur-media) var(--nu-ease-saida);
}
.jcp__card:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.jcp__card:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.jcp__card-titulo { margin: 0; color: var(--nu-ink); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); }
.jcp__card:hover .jcp__card-titulo { color: var(--nu-blue-text); }
.jcp__card-p { margin: 0; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); line-height: 1.5; }
.jcp__ir { display: inline-flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 12px; color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.jcp__card:hover .jcp__ir svg { transform: translateX(3px); }
.jcp__ir svg { transition: transform var(--nu-dur-media) var(--nu-ease-saida); }

@media (min-width: 760px) {
  .jcp__lista { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 760px) {
  .jcp__h1 { max-width: none; }
  .jcp__card { padding: 18px; }
}
@media (prefers-reduced-motion: reduce) {
  .jcp__card, .jcp__ir svg { transition: none; }
  .jcp__card:hover, .jcp__card:hover .jcp__ir svg { transform: none; }
}
</style>
