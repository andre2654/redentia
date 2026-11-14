<script setup lang="ts">
// /tesouro — hub do Tesouro Direto (70 títulos). Anatomia na linguagem Nu:
// hero (NuPageHero) → toolbar (contador + o trilho por indexador, reativo a
// ?indexer=) → TesouroTable (linha → /tesouro/{slug}) → answer-first
// → split educacional curto → ferramentas relacionadas → CTA.
//
// SEO indexável: SSR-first (a tabela completa sai no HTML da 1ª resposta),
// canonical /tesouro, BreadcrumbList + ItemList (top 10 → /tesouro/{slug}).
// Degrade honesto: backend fora → estado "indisponível agora" e o conteúdo
// educacional continua servido (o SEO não morre com o backend).
// routeRules '/tesouro' já cacheia 600s+swr no nuxt.config.
import type { TesouroIndexerFilter } from '~/types/tesouro'

const { rows, count, pending, unavailable, empty, activeIndexer, setIndexer } = useTesouroHub()
const { isAuthenticated } = useAuthState() // CTA final só pra visitante deslogado

/* pills ↔ ?indexer= (labels humanas, URL na língua da API) */
const FILTERS = Object.entries(TESOURO_FILTER_LABELS) as [TesouroIndexerFilter, string][]
const pillItems = FILTERS.map(([, label]) => ({ valor: label, rotulo: label }))
const activePill = computed(() => TESOURO_FILTER_LABELS[activeIndexer.value])
function onPill(label: string) {
  const found = FILTERS.find(([, l]) => l === label)
  if (found) setIndexer(found[0])
}

/* ————— estados da lista (robustez, 11/11/2026) ————— */
// o esqueleto só na primeira chegada; numa troca de indexador fica a lista de antes, esmaecida
const chegando = computed(() => pending.value && !count.value)
/** erro: pede a lista de novo (o mesmo pedido do useTesouroHub, pela chave dele) */
function tentarDeNovo() { void refreshNuxtData('tesouro-hub') }

/* ————— SEO ————— */
// ItemList reativo (mesmo padrão do /ranking/[slug]: usePageSeo serializa no
// setup, antes das rows resolverem — o computed garante o ItemList no SSR).
const itemListScript = computed(() => {
  const top = rows.value.slice(0, 10)
  if (!top.length) return []
  return [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Tesouro Direto - títulos disponíveis',
      numberOfItems: top.length,
      itemListElement: top.map((row, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: row.name,
        url: `/tesouro/${row.slug}`,
      })),
    }),
  }]
})
useHead({ script: itemListScript })

usePageSeo({
  title: 'Tesouro Direto hoje: taxas de todos os títulos',
  description:
    'Taxas e preços de todos os títulos do Tesouro Direto hoje: Tesouro IPCA+, Prefixado, Selic e Renda+. Vencimento, preço de compra e histórico de cada título, atualizados diariamente.',
  path: '/tesouro',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Tesouro Direto', path: '/tesouro' },
  ],
  structuredData: [
    {
      '@type': 'WebApplication',
      name: `Tesouro Direto hoje - ${MARCA.nome}`,
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Taxas do Tesouro Direto',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      description: 'Todas as taxas do Tesouro Direto em uma tabela, com filtro por indexador e página de detalhe por título.',
    },
  ],
})
</script>

<template>
  <div>
    <!-- ============ Hero (h1 + lead + filtro por indexador) ============ -->
    <NuPageHero
      eyebrow="Renda fixa"
      subtitle="As taxas e os preços de todos os títulos públicos, atualizados diariamente com os dados do Tesouro Nacional. Clique em um título pra ver o histórico completo."
    >
      <template #title>Tesouro Direto<br>hoje.</template>
    </NuPageHero>

    <!-- ============ Toolbar + tabela ============ -->
    <section class="tsh__body">
      <header class="tsh__toolbar">
        <div class="tsh__toolbar-meta">
          <NuEyebrow como="p">Lista completa</NuEyebrow>
          <!-- enquanto a lista chega, o número é um traço; sem lista (erro, vazio), a linha sai: quem explica é o estado -->
          <p v-if="chegando || count" class="tsh__toolbar-count"><NuSkeleton v-if="chegando" inline variant="line" width="40px" height="20px" radius="pill" /><template v-else>{{ count }}</template> {{ count === 1 ? 'título' : 'títulos' }} · ordenados por vencimento</p>
        </div>
        <!-- o filtro por indexador: o trilho das páginas de mercado (segura a escolha enquanto a lista chega) -->
        <NuTrilho :opcoes="pillItems" :model-value="activePill" :ocupado="pending" rotulo="Filtrar por indexador" @update:model-value="onPill" />
      </header>

      <!-- a troca de estado entra num fade curto (o que sai, sai na hora) -->
      <Transition name="tsh-troca">
        <!-- loading é sempre esqueleto (contrato da Aportou): a forma da tabela -->
        <MercadoEsqueleto v-if="chegando" key="esqueleto" :colunas="4" :posicao="false" :logo="false" rotulo="Carregando as taxas" />
        <MercadoEstado v-else-if="unavailable" key="erro" tipo="erro" titulo="Taxas indisponíveis agora.">
          O conteúdo abaixo continua valendo.
          <template #acao><NuLinkSeta @click="tentarDeNovo">Tentar de novo</NuLinkSeta></template>
        </MercadoEstado>
        <MercadoEstado v-else-if="empty" key="vazio" titulo="Nenhum título nesse filtro no momento.">
          <template #acao><NuLinkSeta @click="setIndexer('todos')">Ver todos os títulos</NuLinkSeta></template>
        </MercadoEstado>
        <TesouroTable v-else key="tabela" :rows="rows" :ocupada="pending" />
      </Transition>

      <p v-revelar class="tsh__answer">
        O Tesouro Direto é o programa de venda de títulos públicos pra pessoas físicas. Cada título tem uma taxa
        própria: os indexados ao IPCA pagam a inflação mais um juro real, os prefixados travam uma taxa nominal
        conhecida na compra e os atrelados à Selic acompanham a taxa básica de juros. A tabela acima mostra a taxa,
        o vencimento e o preço de compra de cada título disponível hoje.
      </p>
    </section>

    <!-- ============ Educacional curto ============ -->
    <CalcSplit tone="white">
      <template #title>Como ler as taxas do Tesouro Direto</template>
      <div class="tsh__prose">
        <p>
          <strong>Tesouro IPCA+</strong> rende a inflação oficial mais um juro real fixo (ex.: IPCA + 8,43% ao ano).
          É a taxa que protege o poder de compra: quem leva até o vencimento ganha acima da inflação, aconteça o que
          acontecer com ela.
        </p>
        <p>
          <strong>Tesouro Prefixado</strong> trava uma taxa nominal na compra: você sabe hoje exatamente quanto
          resgata no vencimento. Rende mais que os pós-fixados quando os juros caem, e menos quando sobem.
        </p>
        <p>
          <strong>Tesouro Selic</strong> acompanha a taxa básica de juros dia a dia. É o título que menos oscila
          antes do vencimento, por isso costuma ser usado como reserva de liquidez e de emergência.
        </p>
        <p>
          Antes do vencimento, o preço de qualquer título prefixado ou IPCA+ oscila com a marcação a mercado. A taxa
          da tabela é garantida pra quem carrega o título até a data de vencimento.
        </p>
      </div>
    </CalcSplit>

    <!-- ============ Ferramentas relacionadas ============ -->
    <CalcBand tone="cream" title="Ferramentas relacionadas">
      <div v-revelar="{ alvo: 'filhos', passo: 60 }" class="tsh__grid-cards">
        <NuxtLink to="/ranking/tesouro-direto" class="tsh__card-link">
          <h3 class="tsh__card-link-title">Ranking do Tesouro Direto</h3>
          <p class="tsh__card-link-desc">Os títulos ordenados pela maior taxa de hoje, em uma lista só.</p>
          <span class="tsh__card-link-ir">Abrir<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" /></svg></span>
        </NuxtLink>
        <NuxtLink to="/calculadora/juros-compostos" class="tsh__card-link">
          <h3 class="tsh__card-link-title">Calculadora de juros compostos</h3>
          <p class="tsh__card-link-desc">Simule quanto rende um aporte mensal na taxa do título que você escolher.</p>
          <span class="tsh__card-link-ir">Abrir<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" /></svg></span>
        </NuxtLink>
      </div>
    </CalcBand>

    <!-- ============ Fecho (só deslogado): o painel azul da marca, com o corte de fundo ============ -->
    <MercadoFecho
      v-if="!isAuthenticated" eyebrow="Sua carteira" fundo="faixa"
      :primary="{ label: 'Criar conta grátis', to: '/login' }"
      :secondary="{ label: 'Ver rankings', to: '/rankings' }"
    >
      <template #title>Acompanhe a renda fixa na sua carteira</template>
      <template #subtitle>Cadastre-se e veja renda fixa, ações e FIIs em uma carteira só, com análises automáticas e dados atualizados diariamente.</template>
    </MercadoFecho>
  </div>
</template>

<style scoped>
/* Aportou (11/11/2026): o corpo corre sobre o creme da página, a tabela é um
   cartão branco; mesma família do /ranking. O conteúdo é o de antes.
   Robustez (11/11/2026): a margem é a da coluna (--nu-coluna), o movimento e a
   cor por token; a lista tem esqueleto com a forma dela, vazio e erro com o
   próximo passo, e a troca de indexador deixa a lista de antes esmaecida. */
.tsh__body {
  background: var(--nu-page);
  padding: 0 var(--nu-coluna) clamp(72px, 8vw, 128px);
  display: flex; flex-direction: column; gap: 24px;
  animation: nu-fade var(--nu-dur-entrada) var(--nu-ease-saida) 60ms both;
}
.tsh__toolbar { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.tsh__toolbar-meta { display: flex; flex-direction: column; gap: 8px; }
.tsh__toolbar-count {
  margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: var(--nu-w-forte);
  font-variant-numeric: tabular-nums; letter-spacing: var(--nu-ls-titulo); line-height: 1.1;
}
/* a troca de estado (esqueleto → tabela, erro → tabela) entra num fade curto */
.tsh-troca-enter-active { animation: nu-surgir var(--nu-dur-media) var(--nu-ease-cor); }
.tsh__answer {
  margin: 8px 0 0; max-width: 76ch;
  color: var(--nu-gray-3); font-size: clamp(16px, 1.4vw, 18px); font-weight: var(--nu-w-texto); line-height: 1.6;
}

/* ——— prosa educacional (mesma família das calculadoras/rankings) ——— */
.tsh__prose p {
  margin: 0 0 16px; color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-texto); line-height: 1.6;
}
.tsh__prose p:last-child { margin-bottom: 0; }
.tsh__prose strong { color: var(--nu-ink); font-weight: var(--nu-w-forte); }

/* ——— ferramentas relacionadas: o cartão inteiro é o clique ——— */
.tsh__grid-cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: 16px; margin-top: clamp(32px, 4vw, 48px);
  max-width: 980px; margin-left: auto; margin-right: auto;
}
.tsh__card-link {
  background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 24px 24px 20px; box-shadow: var(--nu-shadow-branco);
  display: flex; flex-direction: column; gap: 8px; -webkit-tap-highlight-color: transparent;
  transition: transform var(--nu-dur-media) var(--nu-ease-saida), box-shadow var(--nu-dur-media) var(--nu-ease-saida);
}
.tsh__card-link:active { transform: scale(.995); transition-duration: var(--nu-dur-rapida); }
.tsh__card-link:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.tsh__card-link-title { margin: 0; color: var(--nu-ink); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); transition: color var(--nu-dur-rapida) var(--nu-ease-cor); }
.tsh__card-link-desc { margin: 0; color: var(--nu-gray-3); font-size: 14.5px; font-weight: var(--nu-w-texto); line-height: 1.5; }
/* o "Abrir →" fala como o NuLinkSeta (o cartão já é o link) */
.tsh__card-link-ir {
  display: inline-flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 8px;
  color: var(--nu-blue-text); font-size: 14.5px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto);
}
.tsh__card-link-ir svg { width: 16px; height: 16px; flex: none; transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
@media (hover: hover) {
  .tsh__card-link:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
  .tsh__card-link:hover .tsh__card-link-title { color: var(--nu-blue-text); }
  .tsh__card-link:hover .tsh__card-link-ir svg { transform: translateX(3px); }
}
@media (prefers-reduced-motion: reduce) {
  .tsh__card-link:hover, .tsh__card-link:active, .tsh__card-link:hover .tsh__card-link-ir svg { transform: none; }
}
</style>
