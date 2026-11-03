<script setup lang="ts">
// /asset, direção 3: "O painel" (protótipo de 03/11/2026, ?ativo=3). A página
// inteira numa grade de cartões sobre o creme, a linguagem da /teses ("A
// grade"): cada cartão responde uma pergunta e tem o seu título de hoje (o
// preço, o gráfico, o noticiário, os números, os proventos, a análise, as
// teses, o setor, cada parte do editorial, as perguntas). A primeira fileira
// responde de uma vez o que é e como está hoje: a ficha com o preço e, ao
// lado, o cartão navy do gráfico, o único momento bonito (e o único cartão com
// sombra). No celular a grade vira um feed, na mesma ordem.
// Sem card dentro de card: dentro dos cartões são linhas e fios. O Raio-X de
// ETF e a cadeia de fornecimento, que já têm cartões próprios, entram como
// faixas inteiras entre as fileiras, não dentro de um cartão.
import type { AtivoDirecaoVM } from '~/composables/useAtivoDirecao'
import AcaoCadeia from '~/components/acao/AcaoCadeia.vue'
import AcaoEtfXray from '~/components/acao/AcaoEtfXray.vue'
import AcaoFundInfo from '~/components/acao/AcaoFundInfo.vue'

const props = defineProps<{ vm: AtivoDirecaoVM }>()
const { v, a, t, contexto, contextoGrafico, tituloGrafico, legenda, linhas, cartoes, perguntas, perguntar, abrirCom, oQueE, links } = useAtivoDirecao(() => props.vm)
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const tesesTitulo = computed(() => (a.value.theses.length === 1 ? `${t.value} faz parte de 1 tese.` : `${t.value} faz parte de ${a.value.theses.length} teses.`))
const logoFalhou = ref(false)
const temNumeros = computed(() => cartoes.value.length > 0)
const secoesEditorial = computed(() => a.value.editorial?.sections ?? [])
</script>

<template>
  <div class="ap">
    <div class="ap__grade">
      <!-- ============ 1ª fileira: a ficha e o gráfico ============ -->
      <section v-contexto-chat="contexto" class="ap__c ap__c--ficha" aria-labelledby="ap-h1">
        <p v-if="v.renamedFrom" class="ap__trocou">{{ v.renamedFrom }} agora negocia como {{ t }}.</p>
        <div class="ap__id">
          <img v-if="a.hero.logo && !logoFalhou" :src="a.hero.logo" alt="" width="22" height="22" class="ap__logo" @error="logoFalhou = true">
          <p class="ap__empresa">{{ a.hero.companyLine }}</p>
          <span class="ap__bolsa">{{ a.hero.exchangeLabel || 'B3' }}</span>
          <span v-if="v.position" class="ap__posicao">Na sua carteira · {{ nf0.format(v.position.qty) }} {{ v.position.qty === 1 ? 'cota' : 'cotas' }}</span>
        </div>
        <h1 v-if="a.resumo" id="ap-h1" class="ap__h1">{{ a.resumo.h1 }}</h1>
        <p class="ap__preco">{{ a.hero.priceFmt }}</p>
        <p class="ap__dia">
          <span v-if="a.hero.changeLine" class="ap__delta" :class="`ap__delta--${a.hero.dir}`">
            <svg width="10" height="10" viewBox="0 0 10 10" :class="{ 'ap__tri--baixo': a.hero.dir === 'down' }" aria-hidden="true"><path d="M5 1.5l3.5 6H1.5z" fill="currentColor" /></svg>{{ a.hero.changeLine }}
          </span>
          <span v-if="a.hero.metaLine" class="ap__meta">{{ a.hero.metaLine }}</span>
        </p>
        <p v-if="oQueE" class="ap__oque">{{ oQueE }}</p>
        <div class="ap__botoes">
          <SeguirAtivo v-if="v.seguivel" :ticker="t" :path="`/asset/${t}`" />
          <NuxtLink to="/" class="ap__carteira">Adicionar à carteira</NuxtLink>
        </div>
      </section>

      <section v-if="v.series" id="cotacao" v-contexto-chat="contextoGrafico" class="ap__c ap__c--grafico">
        <div class="ap__g-cab">
          <h2 class="ap__h2 ap__h2--claro">{{ tituloGrafico }}</h2>
          <AtivoPeriodo :model-value="v.range" :disabled="v.rangeLoading" tom="escuro" @update:model-value="v.setRange" />
        </div>
        <p v-if="legenda.length" class="ap__legenda">
          <span v-for="l in legenda" :key="l.rotulo" class="ap__leg">
            <i class="ap__leg-traco" :class="{ 'ap__leg-traco--ibov': l.rotulo === 'IBOV' }" aria-hidden="true" />{{ l.rotulo }}
            <b :class="l.dir ? `ap__leg--${l.dir}` : ''">{{ l.pct }}</b>
          </span>
        </p>
        <div class="ap__grafico">
          <AtivoGrafico :ativo="v.series.asset" :ibov="v.series.ibov" :ticker="t" :atual="a.hero.priceFmt" tom="escuro" :carregando="v.rangeLoading" />
        </div>
        <dl v-if="linhas.length" class="ap__nums">
          <div v-for="r in linhas" :key="r.l" v-contexto-chat="{ id: `linha:${t}:${r.l}`, tipo: 'grafico', rotulo: rotuloComSobre(r.l, t), texto: `${r.l} (${t}): ${r.v}` }" class="ap__num">
            <dt>{{ r.l }}</dt><dd>{{ r.v }}</dd>
          </div>
        </dl>
        <p v-if="a.simuladorHref" class="ap__sim">
          <NuxtLink :to="a.simuladorHref" class="ap__sim-link">Simulador de ações</NuxtLink>
          <span>Quanto {{ t }} teria rendido com dividendos reinvestidos, no histórico real da B3.</span>
        </p>
      </section>

      <!-- ============ 2ª fileira: o por quê (o noticiário e as perguntas) e o resumo ============ -->
      <section v-if="a.news" id="noticias" v-contexto-chat="{ id: `noticias:${t}`, tipo: 'noticia', rotulo: `Notícias de ${t}` }" class="ap__c ap__c--12 ap__c--hoje">
        <div class="ap__hoje-cab">
          <div>
            <p class="ap__r">Hoje</p>
            <h2 class="ap__h2">{{ t }} no noticiário.</h2>
          </div>
          <AtivoPerguntaChips :perguntas="perguntas" rotulo="Pergunte à Redentia" class="ap__chips" @perguntar="perguntar" />
        </div>
        <AtivoNoticias :news="a.news" compacta class="ap__corpo ap__noticias" />
      </section>

      <section v-if="a.resumo || !a.news" class="ap__c ap__c--12">
        <p class="ap__r">Em resumo</p>
        <AtivoPerguntaChips v-if="!a.news" :perguntas="perguntas" :rotulo="null" class="ap__chips" @perguntar="perguntar" />
        <div v-if="a.resumo" v-contexto-chat="{ id: `resumo:${t}`, tipo: 'secao', rotulo: rotuloComSobre('Resumo', t), texto: a.resumo.paragrafos.join('\n') }" class="ap__resumo">
          <p v-for="(p, i) in a.resumo.paragrafos" :key="i">{{ p }}</p>
          <p class="ap__aviso">{{ a.resumo.aviso }}</p>
        </div>
      </section>

      <!-- ============ 3ª fileira: os números e os proventos ============ -->
      <section v-if="temNumeros" id="indicadores" v-contexto-chat="{ id: `fundamentos:${t}`, tipo: 'grafico', rotulo: rotuloComSobre('Fundamentos', t) }" class="ap__c" :class="a.dividends ? 'ap__c--6' : 'ap__c--12'">
        <p class="ap__r">{{ a.kind === 'fii' ? 'O fundo' : 'A empresa' }}</p>
        <h2 class="ap__h2">{{ a.fundHeading[0] }} {{ a.fundHeading[1] }}</h2>
        <p class="ap__dek">{{ a.fundSub }}</p>
        <AtivoIndicadores :perfil="a.perfil" :cartoes="cartoes" forma="tabela" class="ap__corpo" />
      </section>

      <section v-if="a.dividends" id="dividendos" class="ap__c ap__c--prov" :class="temNumeros ? 'ap__c--6' : 'ap__c--12'">
        <p class="ap__r">Proventos</p>
        <h2 class="ap__h2">{{ a.dividends.heading[0] }} {{ a.dividends.heading[1] }}</h2>
        <AtivoProventos
          :ticker="t" :dividends="a.dividends" :position="v.position" :simulador-href="a.simuladorHref"
          :quanto-rende-href="v.quantoRendeHref" :dividendos-href="v.dividendosHref" :forma="temNumeros ? 'pilha' : 'lado'" class="ap__corpo"
        />
      </section>
    </div>

    <!-- o ETF já tem cartões próprios: faixa inteira, fora da grade -->
    <section v-if="a.etfXray || a.fundInfo" id="carteira" class="ap__faixa">
      <AcaoEtfXray v-if="a.etfXray" :ticker="t" :xray="a.etfXray" />
      <AcaoFundInfo v-else-if="a.fundInfo" :info="a.fundInfo" />
    </section>

    <div class="ap__grade">
      <section v-if="a.ai" id="analise" v-contexto-chat="{ id: `analise:${t}`, tipo: 'grafico', rotulo: `O que a Redentia vê · ${t}` }" class="ap__c ap__c--12">
        <p class="ap__r">Análise</p>
        <h2 class="ap__h2">O que a Redentia vê.</h2>
        <AtivoLeitura :ticker="t" :ai="a.ai" class="ap__corpo" @conversar="abrirCom()" />
      </section>

      <section v-if="a.theses.length" id="teses" v-contexto-chat="{ id: `teses:${t}`, tipo: 'tese', rotulo: `Teses com ${t}`, texto: `${tesesTitulo}\n${a.theses.map((x) => `${x.title}: ${x.roleStrong}${x.roleRest}`).join('\n')}` }" class="ap__c" :class="a.pares ? 'ap__c--6' : 'ap__c--12'">
        <p class="ap__r">Teses Redentia</p>
        <h2 class="ap__h2">{{ tesesTitulo }}</h2>
        <AtivoTeses :theses="a.theses" class="ap__corpo" />
      </section>

      <section v-if="a.pares" id="setor" class="ap__c" :class="a.theses.length ? 'ap__c--6' : 'ap__c--12'">
        <p class="ap__r">Setor</p>
        <h2 class="ap__h2">Outras empresas do setor {{ a.pares.setor.nome.toLowerCase() }}.</h2>
        <AtivoPares :pares="a.pares" :colunas="a.theses.length ? 2 : 3" class="ap__corpo" />
      </section>

      <!-- ============ a leitura: um cartão por parte do editorial ============ -->
      <section v-if="secoesEditorial.length" id="sobre" class="ap__c ap__c--12 ap__c--prosa">
        <p class="ap__r">Sobre</p>
        <AtivoProsa :ticker="t" :secoes="secoesEditorial.slice(0, 1)" class="ap__prosa ap__prosa--larga" />
      </section>
      <!-- as outras partes em colunas (alvenaria): cada cartão na altura do próprio texto, sem vazio no pé -->
      <div v-if="secoesEditorial.length > 1" class="ap__c--12 ap__colunas">
        <section v-for="s in secoesEditorial.slice(1)" :key="s.id" class="ap__c ap__c--prosa">
          <p class="ap__r">Leitura</p>
          <AtivoProsa :ticker="t" :secoes="[s]" class="ap__prosa" />
        </section>
      </div>
    </div>

    <section v-if="a.cadeia" id="cadeia" class="ap__faixa">
      <AcaoCadeia :cadeia="a.cadeia" :nome="a.name" :ticker="t" />
    </section>

    <div class="ap__grade ap__grade--fim">
      <section id="perguntas" class="ap__c ap__c--12">
        <AtivoPerguntas :ticker="t" :editorial="a.editorial" :resumo="a.resumo" class="ap__faq" />
      </section>
      <div class="ap__c--12 ap__solto">
        <SeguirGancho v-if="v.seguivel" :atual="t" surface="cream" />
        <AtivoVejaTambem :links="links" />
        <NuAcompanheAndre lugar="asset" class="ap__andre" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.ap {
  --g: clamp(16px, 4vw, 64px); --gap: clamp(12px, 1.4vw, 18px);
  --a-h2: var(--nu-fs-2xl); --a-h2-peso: 600;
  background: var(--nu-cream); padding: clamp(20px, 2.6vw, 36px) 0 0; animation: nu-fade .5s ease both;
}
.ap__grade { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: var(--gap); padding: 0 var(--g); }
.ap__grade + .ap__grade, .ap__faixa + .ap__grade { margin-top: var(--gap); }
.ap__grade--fim { padding-bottom: clamp(28px, 3vw, 44px); }
.ap__c {
  grid-column: span 12; min-width: 0; padding: clamp(22px, 2.2vw, 32px); border-radius: var(--nu-r-card);
  background: var(--nu-white); box-shadow: 0 0 0 1px var(--nu-navy-06);
  scroll-margin-top: calc(var(--nuh-h, 72px) + 56px);
}
.ap__c--ficha { grid-column: span 5; display: flex; flex-direction: column; align-items: flex-start; box-shadow: 0 0 0 1px var(--nu-navy-06), var(--nu-shadow-card); }
.ap__c--grafico { grid-column: span 7; background: var(--nu-navy); color: var(--nu-cream-text); box-shadow: 0 0 0 1px var(--nu-navy-06), var(--nu-shadow-card); }
.ap__c--5 { grid-column: span 5; }
.ap__c--6 { grid-column: span 6; }
.ap__c--7 { grid-column: span 7; }
.ap__c--12 { grid-column: span 12; }

.ap__r { margin: 0; color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 700; }
.ap__h2 { margin: 6px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 600; letter-spacing: -0.03em; line-height: 1.15; text-wrap: balance; }
.ap__h2--claro { margin: 0; color: var(--nu-cream-text); }
.ap__dek { margin: 6px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.ap__corpo { margin-top: 20px; }

/* ——— a ficha ——— */
.ap__trocou { margin: 0 0 14px; padding: 6px 12px; border-radius: var(--nu-r-pill); background: var(--nu-sand-2); color: var(--nu-gray-tag); font-size: var(--nu-fs-sm); font-weight: 700; }
.ap__id { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; min-height: 26px; }
.ap__logo { width: 22px; height: 22px; border-radius: 50%; object-fit: cover; }
.ap__empresa { margin: 0; color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 700; }
.ap__bolsa { display: inline-flex; align-items: center; height: 24px; padding: 0 9px; border-radius: var(--nu-r-pill); box-shadow: inset 0 0 0 1px var(--nu-cream-line); color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; }
.ap__posicao { display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: var(--nu-r-pill); background: var(--nu-blue-tint); color: var(--nu-blue-text); font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums; }
.ap__h1 { margin: 12px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 600; letter-spacing: -0.03em; line-height: 1.15; text-wrap: balance; }
.ap__preco { margin: 22px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-hero); font-weight: 500; letter-spacing: -0.05em; line-height: 1; font-variant-numeric: tabular-nums; }
.ap__dia { display: flex; align-items: center; gap: 8px 12px; flex-wrap: wrap; margin: 14px 0 20px; }
.ap__delta { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 11px; border-radius: var(--nu-r-pill); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.ap__delta--up { background: var(--nu-green-bg); color: var(--nu-green-2); }
.ap__delta--down { background: var(--nu-red-tint); color: var(--nu-red-2); }
.ap__tri--baixo { transform: rotate(180deg); }
.ap__meta { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; font-variant-numeric: tabular-nums; }
.ap__oque { margin: auto 0 0; padding-top: 16px; border-top: 1px solid var(--nu-cream-line); color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; }
.ap__botoes { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 20px; }
.ap__botoes :deep(.nfb) { height: 44px; padding: 0 18px; font-size: var(--nu-fs-sm); font-weight: 700; background: var(--nu-ink); color: var(--nu-white); }
.ap__botoes :deep(.nfb--on) { background: var(--nu-blue-bg); color: var(--nu-blue-text); }
.ap__carteira { display: inline-flex; align-items: center; height: 44px; padding: 0 18px; border-radius: var(--nu-r-pill); background: var(--nu-cream); color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; transition: background .2s; }
.ap__carteira:hover { background: var(--nu-cream-hover); color: var(--nu-ink); }

/* ——— o gráfico: o cartão navy ——— */
.ap__g-cab { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.ap__legenda { display: flex; flex-wrap: wrap; gap: 6px 20px; margin: 10px 0 0; }
.ap__leg { display: inline-flex; align-items: center; gap: 8px; color: var(--nu-cream-text-60); font-size: var(--nu-fs-sm); font-weight: 600; }
.ap__leg b { color: var(--nu-cream-text); font-size: var(--nu-fs-lg); font-weight: 600; font-variant-numeric: tabular-nums; }
.ap__leg b.ap__leg--up { color: var(--nu-green-soft); }
.ap__leg b.ap__leg--down { color: var(--nu-red-soft); }
.ap__leg-traco { width: 16px; height: 2px; border-radius: 1px; background: var(--nu-blue-soft); }
.ap__leg-traco--ibov { background: repeating-linear-gradient(90deg, var(--nu-cream-text-35) 0 3px, transparent 3px 7px); }
.ap__grafico { position: relative; height: clamp(200px, 20vw, 280px); margin-top: 14px; }
.ap__nums { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 130px), 1fr)); gap: 0 18px; margin: 18px 0 0; }
.ap__num { display: flex; flex-direction: column; gap: 3px; padding: 10px 0; border-top: 1px solid var(--nu-cream-text-14); }
.ap__num dt { color: var(--nu-cream-text-60); font-size: var(--nu-fs-xs); font-weight: 600; }
.ap__num dd { margin: 0; color: var(--nu-cream-text); font-size: var(--nu-fs-md); font-weight: 600; font-variant-numeric: tabular-nums; }
.ap__sim { display: flex; align-items: baseline; gap: 4px 10px; flex-wrap: wrap; margin: 12px 0 0; color: var(--nu-cream-text-60); font-size: var(--nu-fs-sm); font-weight: 500; }
.ap__sim-link { color: var(--nu-cream-text); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: var(--nu-cream-text-35); }
.ap__sim-link:hover { color: var(--nu-cream-text); text-decoration-color: var(--nu-cream-text); }

/* ——— o resto ——— */
.ap__chips { margin-top: 14px; }
.ap__chips :deep(.apc__q) { background: var(--nu-cream); box-shadow: none; }
.ap__chips :deep(.apc__q:hover) { box-shadow: 0 0 0 1px var(--nu-blue-30); }
.ap__resumo { margin-top: 12px; columns: 2; column-gap: clamp(28px, 3vw, 48px); }
.ap__resumo p { break-inside: avoid; }
/* o noticiário em duas colunas: o destaque à esquerda, as linhas à direita */
.ap__hoje-cab { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px 32px; flex-wrap: wrap; }
.ap__hoje-cab .ap__chips { margin-top: 0; }
.ap__noticias { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 0 clamp(28px, 3vw, 48px); align-items: start; }
.ap__noticias :deep(.ano__dest) { grid-row: span 2; }
.ap__noticias :deep(.ano__linhas) { margin-top: 0; }
.ap__noticias :deep(.ano__linhas li:first-child .ano__linha) { border-top: 0; padding-top: 0; }
.ap__resumo p { margin: 0 0 12px; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.65; }
.ap__resumo .ap__aviso { margin: 0; color: var(--nu-gray); font-weight: 600; }
.ap__c--prosa .ap__prosa { margin-top: 6px; }
.ap__colunas { columns: 2; column-gap: var(--gap); }
.ap__colunas > .ap__c { display: block; break-inside: avoid; margin-bottom: var(--gap); }
.ap__colunas > .ap__c:last-child { margin-bottom: 0; }
/* os proventos esticam as barras até o pé do cartão (o vizinho, os números, é mais alto) */
.ap__c--prov { display: flex; flex-direction: column; }
.ap__c--prov > :deep(.apv--pilha) { flex: 1; grid-template-rows: auto 1fr; }
.ap__c--prov :deep(.apv--pilha .apv__barras) { display: flex; flex-direction: column; }
.ap__c--prov :deep(.apv--pilha .apv__cols) { flex: 1; height: auto; min-height: 220px; }
.ap__prosa :deep(.aps__p) { font-size: var(--nu-fs-md); }
.ap__prosa--larga { column-count: 2; column-gap: clamp(28px, 3vw, 48px); }
.ap__prosa--larga :deep(.aps__h2) { column-span: all; }
.ap__prosa--larga :deep(.aps__p:first-of-type) { margin-top: 12px; }
.ap__prosa--larga :deep(.aps__p) { break-inside: avoid; }
.ap__faq :deep(.apg__h2) { font-size: var(--nu-fs-2xl); font-weight: 600; letter-spacing: -0.03em; }

.ap__faixa { margin-top: var(--gap); }
.ap__faixa :deep(.axb__title), .ap__faixa :deep(.acd__title), .ap__faixa :deep(.afi__title) { font-size: var(--nu-fs-h2-sm); font-weight: 600; letter-spacing: -0.04em; }
.ap__faixa :deep(.acd) { background: var(--nu-white); }
.ap__solto { display: flex; flex-direction: column; gap: 24px; padding: 12px 0 0; }
.ap .ap__andre { margin: 0; padding: 0; background: transparent; }

/* ——— tablet: duas colunas; celular: o feed ——— */
@media (max-width: 1100px) {
  .ap__c--ficha, .ap__c--grafico, .ap__c--5, .ap__c--7 { grid-column: span 12; }
  .ap__oque { margin-top: 20px; }
}
@media (max-width: 860px) {
  .ap__c--6 { grid-column: span 12; }
  .ap__prosa--larga { column-count: 1; }
  .ap__colunas, .ap__resumo { columns: 1; }
  .ap__noticias { grid-template-columns: minmax(0, 1fr); }
  .ap__noticias :deep(.ano__linhas) { margin-top: 20px; }
  .ap__noticias :deep(.ano__linhas li:first-child .ano__linha) { border-top: 1px solid var(--nu-cream-line); padding-top: 14px; }
}
@media (prefers-reduced-motion: reduce) { .ap { animation: none; } .ap__carteira { transition: none; } }
</style>
