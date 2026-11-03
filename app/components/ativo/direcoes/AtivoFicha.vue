<script setup lang="ts">
// /asset, direção 1: "A ficha" (protótipo de 03/11/2026, ?ativo=1). A página
// como um documento de consulta, na linguagem do /guias e da /teses: branco,
// títulos em peso leve, fios em vez de cartões. O topo responde as três
// perguntas lado a lado (o que é · como está hoje · o que se diz), e o corpo
// é uma coluna de leitura com o índice que gruda à esquerda (no celular, o
// índice vira uma fileira de atalhos). O momento bonito é um só: a linha azul
// do preço sobre o branco, com o IBOV tracejado por baixo.
// O conteúdo é o da página de hoje, inteiro e no HTML do servidor; o realce
// do índice (IntersectionObserver) só embeleza.
import type { AtivoDirecaoVM } from '~/composables/useAtivoDirecao'
import AcaoCadeia from '~/components/acao/AcaoCadeia.vue'
import AcaoEtfXray from '~/components/acao/AcaoEtfXray.vue'
import AcaoFundInfo from '~/components/acao/AcaoFundInfo.vue'

const props = defineProps<{ vm: AtivoDirecaoVM }>()
const { v, a, t, contexto, contextoGrafico, tituloGrafico, legenda, linhas, cartoes, perguntas, perguntar, abrirCom, oQueE, extremos, secoes, links, ir } = useAtivoDirecao(() => props.vm)
const atual = useSecaoAtual(() => secoes.value.map((s) => s.id))
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const moeda = computed(() => (a.value.hero.priceFmt.startsWith('US$') ? 'US$' : 'R$'))
const tesesTitulo = computed(() => (a.value.theses.length === 1 ? `${t.value} faz parte de 1 tese.` : `${t.value} faz parte de ${a.value.theses.length} teses.`))
const logoFalhou = ref(false)
const rotulo = (id: string) => secoes.value.find((s) => s.id === id)?.rotulo ?? ''
</script>

<template>
  <div class="af">
    <!-- ============ o topo: as três respostas ============ -->
    <header v-contexto-chat="contexto" class="af__topo">
      <p v-if="v.renamedFrom" class="af__trocou">{{ v.renamedFrom }} agora negocia como {{ t }}.</p>
      <div class="af__id">
        <img v-if="a.hero.logo && !logoFalhou" :src="a.hero.logo" alt="" width="24" height="24" class="af__logo" @error="logoFalhou = true">
        <p class="af__empresa">{{ a.hero.companyLine }}</p>
        <span class="af__bolsa">{{ a.hero.exchangeLabel || 'B3' }}</span>
        <span v-if="v.position" class="af__posicao">Na sua carteira · {{ nf0.format(v.position.qty) }} {{ v.position.qty === 1 ? 'cota' : 'cotas' }}</span>
      </div>
      <h1 v-if="a.resumo" class="af__h1">{{ a.resumo.h1 }}</h1>

      <dl class="af__resp">
        <div v-if="oQueE" class="af__r">
          <dt>O que é</dt>
          <dd class="af__r-texto">{{ oQueE }}</dd>
        </div>
        <div class="af__r">
          <dt>Como está hoje</dt>
          <dd>
            <span class="af__preco">{{ a.hero.priceFmt }}</span>
            <span v-if="a.hero.changeLine" class="af__dia" :class="`af__dia--${a.hero.dir}`">
              <svg width="10" height="10" viewBox="0 0 10 10" :class="{ 'af__tri--baixo': a.hero.dir === 'down' }" aria-hidden="true"><path d="M5 1.5l3.5 6H1.5z" fill="currentColor" /></svg>{{ a.hero.changeLine }}
            </span>
            <span v-if="a.hero.metaLine" class="af__meta">{{ a.hero.metaLine }}</span>
          </dd>
        </div>
        <div v-if="a.news || extremos" class="af__r">
          <dt>{{ a.news ? 'No noticiário' : 'Em 12 meses' }}</dt>
          <dd v-if="a.news">
            <NuxtLink :to="a.news.featured.href" class="af__manchete">{{ a.news.featured.title }}</NuxtLink>
            <span class="af__meta">{{ a.news.featured.source }}</span>
          </dd>
          <dd v-else-if="extremos" class="af__r-texto">
            Mínima de {{ moeda }} {{ nf2.format(extremos.min.v) }} em {{ dataDoPonto(extremos.min.t) }} e máxima de {{ moeda }} {{ nf2.format(extremos.max.v) }} em {{ dataDoPonto(extremos.max.t) }}.
          </dd>
        </div>
      </dl>

      <div class="af__acoes">
        <div class="af__botoes">
          <SeguirAtivo v-if="v.seguivel" :ticker="t" :path="`/asset/${t}`" />
          <NuxtLink to="/" class="af__carteira">Adicionar à carteira</NuxtLink>
        </div>
        <AtivoPerguntaChips :perguntas="perguntas" rotulo="Pergunte à Redentia sobre este ativo" @perguntar="perguntar" />
      </div>
    </header>

    <!-- ============ o corpo: índice + coluna de leitura ============ -->
    <div class="af__corpo">
      <aside class="af__lado">
        <nav class="af__indice" aria-label="Nesta página">
          <p class="af__indice-r">Nesta página</p>
          <ul>
            <li v-for="s in secoes" :key="s.id">
              <a :href="`#${s.id}`" :class="{ 'af__indice--on': atual === s.id }" :aria-current="atual === s.id ? 'true' : undefined" @click.prevent="ir(s.id)">{{ s.rotulo }}</a>
            </li>
          </ul>
        </nav>
        <!-- o gancho do Seguir nasce no cliente: aqui, ao lado, ele não empurra a leitura -->
        <SeguirGancho v-if="v.seguivel" :atual="t" surface="white" class="af__gancho" />
      </aside>

      <div class="af__miolo">
        <section v-if="v.series" id="cotacao" v-contexto-chat="contextoGrafico" class="af__sec">
          <div class="af__cab af__cab--linha">
            <div>
              <p class="af__tipo">{{ rotulo('cotacao') }}</p>
              <h2 class="af__h2">{{ tituloGrafico }}</h2>
            </div>
            <AtivoPeriodo :model-value="v.range" :disabled="v.rangeLoading" @update:model-value="v.setRange" />
          </div>
          <p v-if="legenda.length" class="af__legenda">
            <span v-for="l in legenda" :key="l.rotulo" class="af__leg">
              <i class="af__leg-traco" :class="{ 'af__leg-traco--ibov': l.rotulo === 'IBOV' }" aria-hidden="true" />{{ l.rotulo }}
              <b :class="l.dir ? `af__leg--${l.dir}` : ''">{{ l.pct }}</b>
            </span>
          </p>
          <div class="af__grafico">
            <AtivoGrafico :ativo="v.series.asset" :ibov="v.series.ibov" :ticker="t" :atual="a.hero.priceFmt" :carregando="v.rangeLoading" marcas-fora />
          </div>
          <dl v-if="linhas.length" class="af__linhas">
            <div v-for="r in linhas" :key="r.l" v-contexto-chat="{ id: `linha:${t}:${r.l}`, tipo: 'grafico', rotulo: rotuloComSobre(r.l, t), texto: `${r.l} (${t}): ${r.v}` }" class="af__linha">
              <dt>{{ r.l }}</dt><dd>{{ r.v }}</dd>
            </div>
          </dl>
          <p v-if="a.simuladorHref" class="af__sim">
            <NuxtLink :to="a.simuladorHref" class="af__link">Simulador de ações</NuxtLink>
            <span>Quanto {{ t }} teria rendido com dividendos reinvestidos, no histórico real da B3.</span>
          </p>
          <div v-if="a.resumo" v-contexto-chat="{ id: `resumo:${t}`, tipo: 'secao', rotulo: rotuloComSobre('Resumo', t), texto: a.resumo.paragrafos.join('\n') }" class="af__resumo">
            <p v-for="(p, i) in a.resumo.paragrafos" :key="i">{{ p }}</p>
            <p class="af__aviso">{{ a.resumo.aviso }}</p>
          </div>
        </section>

        <section v-if="cartoes.length" id="indicadores" v-contexto-chat="{ id: `fundamentos:${t}`, tipo: 'grafico', rotulo: rotuloComSobre('Fundamentos', t) }" class="af__sec">
          <div class="af__cab">
            <p class="af__tipo">{{ rotulo('indicadores') }}</p>
            <h2 class="af__h2">{{ a.fundHeading[0] }} {{ a.fundHeading[1] }}</h2>
            <p class="af__dek">{{ a.fundSub }}</p>
          </div>
          <AtivoIndicadores :perfil="a.perfil" :cartoes="cartoes" forma="tabela" />
        </section>

        <section v-if="a.etfXray || a.fundInfo" id="carteira" class="af__sec af__sec--embutida">
          <AcaoEtfXray v-if="a.etfXray" :ticker="t" :xray="a.etfXray" />
          <AcaoFundInfo v-else-if="a.fundInfo" :info="a.fundInfo" />
        </section>

        <section v-if="a.dividends" id="dividendos" class="af__sec">
          <div class="af__cab">
            <p class="af__tipo">{{ rotulo('dividendos') }}</p>
            <h2 class="af__h2">{{ a.dividends.heading[0] }} {{ a.dividends.heading[1] }}</h2>
          </div>
          <AtivoProventos
            :ticker="t" :dividends="a.dividends" :position="v.position" :simulador-href="a.simuladorHref"
            :quanto-rende-href="v.quantoRendeHref" :dividendos-href="v.dividendosHref"
          />
        </section>

        <section v-if="a.ai" id="analise" v-contexto-chat="{ id: `analise:${t}`, tipo: 'grafico', rotulo: `O que a Redentia vê · ${t}` }" class="af__sec">
          <div class="af__cab">
            <p class="af__tipo">{{ rotulo('analise') }}</p>
            <h2 class="af__h2">O que a Redentia vê.</h2>
          </div>
          <AtivoLeitura :ticker="t" :ai="a.ai" @conversar="abrirCom()" />
        </section>

        <section v-if="a.editorial?.sections.length" id="sobre" class="af__sec af__sec--prosa">
          <p class="af__tipo">{{ rotulo('sobre') }}</p>
          <AtivoProsa :ticker="t" :secoes="a.editorial.sections" />
        </section>

        <section v-if="a.theses.length" id="teses" v-contexto-chat="{ id: `teses:${t}`, tipo: 'tese', rotulo: `Teses com ${t}`, texto: `${tesesTitulo}\n${a.theses.map((x) => `${x.title}: ${x.roleStrong}${x.roleRest}`).join('\n')}` }" class="af__sec">
          <div class="af__cab">
            <p class="af__tipo">Teses Redentia</p>
            <h2 class="af__h2">{{ tesesTitulo }}</h2>
          </div>
          <AtivoTeses :theses="a.theses" />
        </section>

        <section v-if="a.news" id="noticias" v-contexto-chat="{ id: `noticias:${t}`, tipo: 'noticia', rotulo: `Notícias de ${t}` }" class="af__sec">
          <div class="af__cab">
            <p class="af__tipo">{{ rotulo('noticias') }}</p>
            <h2 class="af__h2">{{ t }} no noticiário.</h2>
          </div>
          <AtivoNoticias :news="a.news" />
        </section>

        <section v-if="a.cadeia" id="cadeia" class="af__sec af__sec--embutida">
          <AcaoCadeia :cadeia="a.cadeia" :nome="a.name" :ticker="t" />
        </section>

        <section v-if="a.pares" id="setor" class="af__sec">
          <div class="af__cab">
            <p class="af__tipo">{{ rotulo('setor') }}</p>
            <h2 class="af__h2">Outras empresas do setor {{ a.pares.setor.nome.toLowerCase() }}.</h2>
          </div>
          <AtivoPares :pares="a.pares" />
        </section>

        <section id="perguntas" class="af__sec">
          <AtivoPerguntas :ticker="t" :editorial="a.editorial" :resumo="a.resumo" />
          <AtivoVejaTambem :links="links" class="af__veja" />
          <NuAcompanheAndre lugar="asset" class="af__andre" />
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.af {
  --g: clamp(22px, 5.5vw, 80px);
  --a-h2: var(--nu-fs-h2-sm); --a-h2-peso: 500;
  background: var(--nu-white); animation: nu-fade .5s ease both;
}

/* ——— o topo ——— */
.af__topo { padding: clamp(40px, 5.2vw, 76px) var(--g) clamp(32px, 4vw, 52px); border-bottom: 1px solid var(--nu-cream-line); }
.af__trocou { display: inline-flex; margin: 0 0 16px; padding: 6px 12px; border-radius: var(--nu-r-pill); background: var(--nu-sand-2); color: var(--nu-gray-tag); font-size: var(--nu-fs-sm); font-weight: 700; }
.af__id { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; min-height: 28px; }
.af__logo { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; }
.af__empresa { margin: 0; color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 700; }
.af__bolsa { display: inline-flex; align-items: center; height: 24px; padding: 0 9px; border-radius: var(--nu-r-pill); box-shadow: inset 0 0 0 1px var(--nu-cream-line); color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; }
.af__posicao { display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: var(--nu-r-pill); background: var(--nu-blue-tint); color: var(--nu-blue-text); font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums; }
.af__h1 { margin: 14px 0 0; max-width: 20ch; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 500; letter-spacing: -0.05em; line-height: 1.03; text-wrap: balance; }

.af__resp { display: grid; grid-template-columns: 1.2fr 1fr 1.2fr; gap: 0; margin: clamp(28px, 3.4vw, 44px) 0 0; }
.af__r { padding: 18px 28px 4px 0; border-top: 1px solid var(--nu-cream-line); }
.af__r + .af__r { padding-left: 28px; border-left: 1px solid var(--nu-cream-line); }
.af__r dt { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.af__r dd { margin: 10px 0 0; display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }
.af__r-texto { color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }
.af__preco { color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 600; letter-spacing: -0.03em; line-height: 1; font-variant-numeric: tabular-nums; }
.af__dia { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 11px; border-radius: var(--nu-r-pill); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.af__dia--up { background: var(--nu-green-bg); color: var(--nu-green-2); }
.af__dia--down { background: var(--nu-red-tint); color: var(--nu-red-2); }
.af__tri--baixo { transform: rotate(180deg); }
.af__meta { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; font-variant-numeric: tabular-nums; }
.af__manchete { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 600; letter-spacing: -0.01em; line-height: 1.35; transition: color .2s; }
.af__manchete:hover { color: var(--nu-blue-text); }

.af__acoes { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px 32px; flex-wrap: wrap; margin-top: 28px; }
.af__botoes { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; position: relative; }
.af__botoes :deep(.nfb) { height: 44px; padding: 0 18px; font-size: var(--nu-fs-sm); font-weight: 700; background: var(--nu-ink); color: var(--nu-white); }
.af__botoes :deep(.nfb--on) { background: var(--nu-blue-bg); color: var(--nu-blue-text); }
.af__carteira { display: inline-flex; align-items: center; height: 44px; padding: 0 18px; border-radius: var(--nu-r-pill); background: var(--nu-cream); color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; transition: background .2s; }
.af__carteira:hover { background: var(--nu-cream-hover); color: var(--nu-ink); }

/* ——— o corpo ——— */
.af__corpo { display: grid; grid-template-columns: 200px minmax(0, 1fr); gap: clamp(32px, 4vw, 72px); padding: 0 var(--g); }
.af__lado { position: relative; }
.af__indice { position: sticky; top: calc(var(--nuh-h, 72px) + 64px); padding-top: clamp(40px, 5vw, 64px); }
.af__indice-r { margin: 0 0 10px; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.af__indice ul { list-style: none; margin: 0; padding: 0; border-left: 1px solid var(--nu-cream-line); }
.af__indice a { display: block; margin-left: -1px; padding: 7px 0 7px 14px; border-left: 2px solid transparent; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; transition: color .2s, border-color .2s; }
.af__indice a:hover { color: var(--nu-ink); }
.af__indice .af__indice--on { border-left-color: var(--nu-blue); color: var(--nu-ink); font-weight: 700; }
.af__gancho { margin-top: 28px; }

.af__miolo { min-width: 0; max-width: 920px; }
.af__sec { padding: clamp(40px, 5vw, 64px) 0; border-top: 1px solid var(--nu-cream-line); scroll-margin-top: calc(var(--nuh-h, 72px) + 56px); }
.af__sec:first-child { border-top: 0; }
.af__cab { margin-bottom: 24px; }
.af__cab--linha { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.af__tipo { margin: 0; color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 700; }
.af__h2 { margin: 8px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm); font-weight: 500; letter-spacing: -0.045em; line-height: 1.06; text-wrap: balance; }
.af__dek { margin: 10px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; }
.af__sec--prosa .af__tipo { margin-bottom: 8px; }
.af__sec--prosa { max-width: 68ch; }

.af__legenda { display: flex; flex-wrap: wrap; gap: 8px 24px; margin: 0 0 12px; }
.af__leg { display: inline-flex; align-items: center; gap: 8px; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 600; }
.af__leg b { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 600; font-variant-numeric: tabular-nums; }
.af__leg b.af__leg--up { color: var(--nu-green-text); }
.af__leg b.af__leg--down { color: var(--nu-red-text); }
.af__leg-traco { width: 16px; height: 2px; border-radius: 1px; background: var(--nu-blue); }
.af__leg-traco--ibov { background: repeating-linear-gradient(90deg, var(--nu-sand) 0 3px, transparent 3px 7px); }
.af__grafico { position: relative; height: clamp(240px, 26vw, 340px); margin: 8px 0 0 58px; }

.af__linhas { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); gap: 0 32px; margin: 32px 0 0; }
.af__linha { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 12px 0; border-top: 1px solid var(--nu-cream-line); }
.af__linha dt { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; }
.af__linha dd { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 600; font-variant-numeric: tabular-nums; }
.af__sim { display: flex; align-items: baseline; gap: 6px 12px; flex-wrap: wrap; margin: 18px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.af__link { color: var(--nu-blue-text); font-weight: 700; }
.af__link:hover { color: var(--nu-blue-hover); }
.af__resumo { max-width: 68ch; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--nu-cream-line); }
.af__resumo p { margin: 0 0 14px; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.7; }
.af__resumo .af__aviso { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; }

/* AcaoEtfXray e AcaoCadeia vêm prontos: aqui perdem a banda e o respiro deles */
.af__sec--embutida { padding-top: 0; padding-bottom: 0; }
.af__sec--embutida :deep(.axb), .af__sec--embutida :deep(.acd), .af__sec--embutida :deep(.afi) { background: transparent; padding: clamp(40px, 5vw, 64px) 0; animation: none; }
.af__sec--embutida :deep(.axb + .axb) { border-top: 1px solid var(--nu-cream-line); }
.af__sec--embutida :deep(.axb__card) { background: var(--nu-white); box-shadow: 0 0 0 1px var(--nu-cream-line); }
.af__sec--embutida :deep(.axb__title), .af__sec--embutida :deep(.acd__title), .af__sec--embutida :deep(.afi__title) { font-size: var(--nu-fs-h2-sm); font-weight: 500; letter-spacing: -0.045em; }

.af__veja { margin-top: 40px; }
.af .af__andre { margin: 24px 0 0; padding: 0; }

/* ——— tablet e celular: o índice vira uma fileira de atalhos no alto ——— */
@media (max-width: 1100px) {
  .af__corpo { grid-template-columns: minmax(0, 1fr); gap: 0; }
  .af__indice { position: static; padding-top: 20px; }
  .af__indice ul { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; border-left: 0; padding-bottom: 4px; }
  .af__indice ul::-webkit-scrollbar { display: none; }
  .af__indice a { margin: 0; padding: 0 14px; height: 36px; display: inline-flex; align-items: center; white-space: nowrap; border: 0; border-radius: var(--nu-r-pill); background: var(--nu-cream); color: var(--nu-ink); font-weight: 600; }
  .af__indice .af__indice--on { background: var(--nu-ink); color: var(--nu-white); }
  .af__indice-r { display: none; }
  .af__gancho { margin-top: 16px; }
  .af__resp { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .af__r:nth-child(3) { grid-column: 1 / -1; padding-left: 0; border-left: 0; }
}
@media (max-width: 640px) {
  .af__resp { grid-template-columns: minmax(0, 1fr); }
  .af__r, .af__r + .af__r { padding: 16px 0 4px; border-left: 0; }
  .af__grafico { margin-left: 48px; height: 220px; }
}
@media (prefers-reduced-motion: reduce) { .af { animation: none; } .af__indice a, .af__manchete { transition: none; } }
</style>
