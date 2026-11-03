<script setup lang="ts">
// /asset: "A noite" (03/11/2026), a direção que o dono escolheu entre três
// ("a 2"), com o refino que ele pediu no mesmo dia. O topo é o escuro do herói
// da home e do /benchmark-ia (o navy do rodapé descendo ao preto): o nome, o
// H1, o preço em peso leve, as perguntas prontas e, atravessando o herói, o
// preço do período como uma linha de luz que acende até o ponto de hoje, com o
// IBOV apagado por baixo. É o único momento brilhante da tela; o resto é calmo.
// O gráfico se lê com a mira e mede entre dois pontos (AtivoGrafico).
// Logo abaixo, os números do gráfico em fila e o resumo factual. Depois, uma
// barra que gruda com as seções, NA ORDEM em que a página desce: o ativo,
// indicadores, por dentro (ETF), proventos, análise, sobre, teses, notícias,
// cadeia, setor e perguntas. A barra encosta embaixo do header e da régua do
// mercado pela altura que os dois publicam (--nuh-h do useTopo, --nut-h do
// NuMarketTicker), sem px chutado.
// Tudo sai do servidor: o texto, os links, o FAQ (<details>). A linha se
// desenhando é Web Animations, uma vez no mount, só com a aba visível, o herói
// na tela e sem pedido de menos movimento (a lição do /benchmark-ia: nada
// espera o observador para existir).
import type { AtivoDirecaoVM } from '~/composables/useAtivoDirecao'
import AcaoCadeia from '~/components/acao/AcaoCadeia.vue'
import AcaoEtfXray from '~/components/acao/AcaoEtfXray.vue'
import AcaoFundInfo from '~/components/acao/AcaoFundInfo.vue'

const props = defineProps<{ vm: AtivoDirecaoVM }>()
const { v, a, t, contexto, contextoGrafico, tituloGrafico, legenda, linhas, cartoes, perguntas, perguntar, abrirCom, secoes, links, ir } = useAtivoDirecao(() => props.vm)
const atual = useSecaoAtual(() => secoes.value.map((s) => s.id), 220)
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const tesesTitulo = computed(() => (a.value.theses.length === 1 ? `${t.value} faz parte de 1 tese.` : `${t.value} faz parte de ${a.value.theses.length} teses.`))
const logoFalhou = ref(false)
const rotulo = (id: string) => secoes.value.find((s) => s.id === id)?.rotulo ?? ''

// a alternância branco/creme das bandas, pela ordem do que a página tem (duas
// bandas da mesma cor seguidas viram uma só, com o dobro do respiro no meio).
// O resumo, logo depois do herói, é branco; o Raio-X de ETF traz duas bandas.
const tons = computed(() => {
  const ids: Array<[string, number]> = []
  if (cartoes.value.length) ids.push(['indicadores', 1])
  if (a.value.etfXray) ids.push(['carteira', a.value.etfXray.feeCards.length || a.value.etfXray.pageCorr.length ? 2 : 1])
  else if (a.value.fundInfo) ids.push(['carteira', 1])
  if (a.value.dividends) ids.push(['dividendos', 1])
  if (a.value.ai) ids.push(['analise', 1])
  if (a.value.editorial?.sections.length) ids.push(['sobre', 1])
  if (a.value.theses.length) ids.push(['teses', 1])
  if (a.value.news) ids.push(['noticias', 1])
  if (a.value.cadeia) ids.push(['cadeia', 1])
  if (a.value.pares) ids.push(['setor', 1])
  ids.push(['perguntas', 1])
  const out: Record<string, 'branco' | 'creme'> = {}
  let creme = !!a.value.resumo
  for (const [id, n] of ids) {
    out[id] = creme ? 'creme' : 'branco'
    if (n % 2 === 1) creme = !creme
  }
  return out
})
const tom = (id: string) => (tons.value[id] === 'creme' ? 'an__sec--creme' : '')

// no celular a fileira rola de lado: a pílula da seção atual vem para a vista
const fileira = ref<HTMLElement | null>(null)
watch(atual, (id) => {
  const ul = fileira.value
  const chip = id ? ul?.querySelector<HTMLElement>(`a[href="#${id}"]`) : null
  if (!ul || !chip || ul.scrollWidth <= ul.clientWidth) return
  const alvo = chip.offsetLeft - (ul.clientWidth - chip.offsetWidth) / 2
  const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ul.scrollTo({ left: Math.max(0, alvo), behavior: calmo ? 'auto' : 'smooth' })
})

const palco = ref<HTMLElement | null>(null)
onMounted(() => {
  const el = palco.value
  if (!el || document.visibilityState !== 'visible' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const r = el.getBoundingClientRect()
  if (r.top >= window.innerHeight || r.bottom <= 0) return
  const curva = 'cubic-bezier(.2, .8, .2, 1)'
  el.querySelector('.agr__svg')?.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 1400, delay: 150, easing: curva, fill: 'backwards' })
  el.querySelectorAll('.agr__fim, .agr__hoje').forEach((x) => x.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 1350, easing: 'ease', fill: 'backwards' }))
  el.querySelector('.an__horizonte')?.animate([{ opacity: 0.2, transform: 'scaleX(.5)' }, { opacity: 1, transform: 'none' }], { duration: 1400, easing: curva, fill: 'backwards' })
})
</script>

<template>
  <div class="an">
    <div id="cotacao" class="an__ativo">
      <!-- ============ o céu: o preço e a linha de luz ============ -->
      <section v-contexto-chat="contexto" class="an__ceu" aria-labelledby="an-h1">
        <div class="an__luz" aria-hidden="true" />
        <div class="an__texto">
          <p v-if="v.renamedFrom" class="an__trocou">{{ v.renamedFrom }} agora negocia como {{ t }}.</p>
          <div class="an__produto">
            <img v-if="a.hero.logo && !logoFalhou" :src="a.hero.logo" alt="" width="22" height="22" class="an__logo" @error="logoFalhou = true">
            <p class="an__empresa">{{ a.hero.companyLine }}</p>
            <span class="an__bolsa">{{ a.hero.exchangeLabel || 'B3' }}</span>
            <span v-if="v.position" class="an__posicao">Na sua carteira · {{ nf0.format(v.position.qty) }} {{ v.position.qty === 1 ? 'cota' : 'cotas' }}</span>
          </div>
          <h1 v-if="a.resumo" id="an-h1" class="an__h1">{{ a.resumo.h1 }}</h1>
          <p class="an__preco">{{ a.hero.priceFmt }}</p>
          <p class="an__dia">
            <span v-if="a.hero.changeLine" class="an__delta" :class="`an__delta--${a.hero.dir}`">
              <svg width="10" height="10" viewBox="0 0 10 10" :class="{ 'an__tri--baixo': a.hero.dir === 'down' }" aria-hidden="true"><path d="M5 1.5l3.5 6H1.5z" fill="currentColor" /></svg>{{ a.hero.changeLine }}
            </span>
            <span v-if="a.hero.metaLine" class="an__meta">{{ a.hero.metaLine }}</span>
          </p>
          <div class="an__botoes">
            <SeguirAtivo v-if="v.seguivel" :ticker="t" :path="`/asset/${t}`" />
            <NuxtLink to="/" class="an__carteira">Adicionar à carteira</NuxtLink>
          </div>
          <!-- no lugar do "Perguntar à Redentia AI" (repetia a barra do rodapé):
               perguntas sobre ESTE ativo, que abrem o painel com ele anexado -->
          <AtivoPerguntaChips :perguntas="perguntas" tom="escuro" :rotulo="null" class="an__perguntas" @perguntar="perguntar" />
        </div>

        <div v-if="v.series" ref="palco" v-contexto-chat="contextoGrafico" class="an__palco">
          <div class="an__palco-cab">
            <h2 class="an__h2-ceu">{{ tituloGrafico }}</h2>
            <p v-if="legenda.length" class="an__legenda">
              <span v-for="l in legenda" :key="l.rotulo" class="an__leg">
                <i class="an__leg-traco" :class="{ 'an__leg-traco--ibov': l.rotulo === 'IBOV' }" aria-hidden="true" />{{ l.rotulo }}
                <b :class="l.dir ? `an__leg--${l.dir}` : ''">{{ l.pct }}</b>
              </span>
            </p>
            <AtivoPeriodo :model-value="v.range" :disabled="v.rangeLoading" tom="escuro" @update:model-value="v.setRange" />
          </div>
          <div class="an__grafico">
            <AtivoGrafico
              :ativo="v.series.asset" :ibov="v.series.ibov" :ticker="t" :atual="a.hero.priceFmt" :rotulo="tituloGrafico"
              tom="luz" :carregando="v.rangeLoading" marcas-fora
            />
          </div>
          <div class="an__horizonte" aria-hidden="true" />
          <p class="an__dica-uso" aria-hidden="true">Passe o cursor para ler um dia; arraste para medir entre dois.</p>
        </div>

        <dl v-if="linhas.length" class="an__nums">
          <div v-for="r in linhas" :key="r.l" v-contexto-chat="{ id: `linha:${t}:${r.l}`, tipo: 'grafico', rotulo: rotuloComSobre(r.l, t), texto: `${r.l} (${t}): ${r.v}` }" class="an__num">
            <dd class="an__num-v">{{ r.v }}</dd>
            <dt class="an__num-r">{{ r.l }}</dt>
          </div>
        </dl>
        <p v-if="a.simuladorHref" class="an__sim">
          <NuxtLink :to="a.simuladorHref" class="an__sim-link">Simulador de ações</NuxtLink>
          <span>Quanto {{ t }} teria rendido com dividendos reinvestidos, no histórico real da B3.</span>
        </p>
      </section>

      <!-- o resumo factual: o que o gráfico e os números dizem, em palavras -->
      <section v-if="a.resumo" v-contexto-chat="{ id: `resumo:${t}`, tipo: 'secao', rotulo: rotuloComSobre('Resumo', t), texto: a.resumo.paragrafos.join('\n') }" class="an__sec an__sec--resumo" aria-label="Resumo do ativo">
        <div class="an__estreito an__resumo">
          <p v-for="(p, i) in a.resumo.paragrafos" :key="i">{{ p }}</p>
          <p class="an__aviso">{{ a.resumo.aviso }}</p>
        </div>
      </section>
    </div>

    <!-- ============ a barra que gruda: as seções, na ordem da página ============ -->
    <nav v-if="secoes.length > 1" class="an__barra" aria-label="Seções da página">
      <ul ref="fileira" class="an__chips">
        <li v-for="s in secoes" :key="s.id">
          <a
            :href="`#${s.id}`" class="an__chip" :class="{ 'an__chip--on': atual === s.id, 'an__chip--ativo': s.id === 'cotacao' }"
            :aria-current="atual === s.id ? 'true' : undefined" @click.prevent="ir(s.id)"
          >{{ s.id === 'cotacao' ? t : s.rotulo }}</a>
        </li>
      </ul>
    </nav>

    <section v-if="cartoes.length" id="indicadores" v-contexto-chat="{ id: `fundamentos:${t}`, tipo: 'grafico', rotulo: rotuloComSobre('Fundamentos', t) }" class="an__sec" :class="tom('indicadores')">
      <header class="an__cab">
        <p class="an__tipo">{{ rotulo('indicadores') }}</p>
        <h2 class="an__h2">{{ a.fundHeading[0] }} {{ a.fundHeading[1] }}</h2>
        <p class="an__q">{{ a.fundSub }}</p>
      </header>
      <div class="an__largo"><AtivoIndicadores :perfil="a.perfil" :cartoes="cartoes" forma="grade" class="an__ind" /></div>
    </section>

    <section v-if="a.etfXray || a.fundInfo" id="carteira" class="an__embutida" :class="{ 'an__embutida--inverte': tons.carteira === 'creme' }">
      <AcaoEtfXray v-if="a.etfXray" :ticker="t" :xray="a.etfXray" />
      <AcaoFundInfo v-else-if="a.fundInfo" :info="a.fundInfo" />
    </section>

    <section v-if="a.dividends" id="dividendos" class="an__sec" :class="tom('dividendos')">
      <header class="an__cab">
        <p class="an__tipo">{{ rotulo('dividendos') }}</p>
        <h2 class="an__h2">{{ a.dividends.heading[0] }} {{ a.dividends.heading[1] }}</h2>
      </header>
      <div class="an__largo">
        <AtivoProventos
          :ticker="t" :dividends="a.dividends" :position="v.position" :simulador-href="a.simuladorHref"
          :quanto-rende-href="v.quantoRendeHref" :dividendos-href="v.dividendosHref"
        />
      </div>
    </section>

    <section v-if="a.ai" id="analise" v-contexto-chat="{ id: `analise:${t}`, tipo: 'grafico', rotulo: `O que a Redentia vê · ${t}` }" class="an__sec" :class="tom('analise')">
      <header class="an__cab">
        <p class="an__tipo">{{ rotulo('analise') }}</p>
        <h2 class="an__h2">O que a Redentia vê.</h2>
      </header>
      <div class="an__largo"><AtivoLeitura :ticker="t" :ai="a.ai" @conversar="abrirCom()" /></div>
    </section>

    <section v-if="a.editorial?.sections.length" id="sobre" class="an__sec" :class="tom('sobre')">
      <header class="an__cab">
        <p class="an__tipo">{{ rotulo('sobre') }}</p>
      </header>
      <div class="an__estreito"><AtivoProsa :ticker="t" :secoes="a.editorial.sections" /></div>
    </section>

    <section v-if="a.theses.length" id="teses" v-contexto-chat="{ id: `teses:${t}`, tipo: 'tese', rotulo: `Teses com ${t}`, texto: `${tesesTitulo}\n${a.theses.map((x) => `${x.title}: ${x.roleStrong}${x.roleRest}`).join('\n')}` }" class="an__sec" :class="tom('teses')">
      <header class="an__cab">
        <p class="an__tipo">Teses Redentia</p>
        <h2 class="an__h2">{{ tesesTitulo }}</h2>
      </header>
      <div class="an__estreito"><AtivoTeses :theses="a.theses" /></div>
    </section>

    <section v-if="a.news" id="noticias" v-contexto-chat="{ id: `noticias:${t}`, tipo: 'noticia', rotulo: `Notícias de ${t}` }" class="an__sec" :class="tom('noticias')">
      <header class="an__cab">
        <p class="an__tipo">{{ rotulo('noticias') }}</p>
        <h2 class="an__h2">{{ t }} no noticiário.</h2>
        <p class="an__q">O que saiu sobre {{ t }}, com a variação do papel no dia de cada notícia.</p>
      </header>
      <div class="an__estreito"><AtivoNoticias :news="a.news" /></div>
    </section>

    <section v-if="a.cadeia" id="cadeia" class="an__embutida" :class="{ 'an__embutida--branca': tons.cadeia === 'branco' }">
      <AcaoCadeia :cadeia="a.cadeia" :nome="a.name" :ticker="t" />
    </section>

    <section v-if="a.pares" id="setor" class="an__sec" :class="tom('setor')">
      <header class="an__cab">
        <p class="an__tipo">{{ rotulo('setor') }}</p>
        <h2 class="an__h2">Outras empresas do setor {{ a.pares.setor.nome.toLowerCase() }}.</h2>
      </header>
      <div class="an__largo"><AtivoPares :pares="a.pares" /></div>
    </section>

    <section id="perguntas" class="an__sec an__sec--fim" :class="tom('perguntas')">
      <div class="an__estreito">
        <AtivoPerguntas :ticker="t" :editorial="a.editorial" :resumo="a.resumo" />
        <SeguirGancho v-if="v.seguivel" :atual="t" :surface="tons.perguntas === 'creme' ? 'cream' : 'white'" class="an__gancho" />
        <AtivoVejaTambem :links="links" class="an__veja" />
        <NuAcompanheAndre lugar="asset" class="an__andre" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.an {
  --g: clamp(22px, 5.5vw, 80px);
  /* a barra encosta embaixo do header (--nuh-h, useTopo) e da régua do
     mercado (--nut-h, NuMarketTicker): os dois publicam a altura no <html> */
  --cola: calc(var(--nuh-h, 72px) + var(--nut-h, 0px));
  --barra-h: 57px;
  --mola: cubic-bezier(.34, 1.56, .64, 1);
  --a-h2: var(--nu-fs-h3); --a-h2-peso: 600;
  background: var(--nu-white);
}

/* ——— o céu: o mesmo do herói "A noite" da home ——— */
.an__ceu {
  position: relative; isolation: isolate; overflow: hidden;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: clamp(44px, 5vw, 72px) var(--g) clamp(40px, 4.4vw, 64px);
  background: var(--nu-agora-bg); color: var(--nu-agora-texto);
}
.an__luz {
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background:
    radial-gradient(60% 38% at 50% 0%, color-mix(in srgb, var(--nu-blue) 16%, transparent), transparent),
    linear-gradient(180deg, var(--nu-navy) 0%, color-mix(in srgb, var(--nu-navy) 55%, var(--nu-agora-bg)) 46%, var(--nu-agora-bg) 80%);
}
.an__texto { display: flex; flex-direction: column; align-items: center; max-width: 1000px; }
.an__trocou { margin: 0 0 16px; padding: 6px 12px; border-radius: var(--nu-r-pill); background: var(--nu-agora-pilula); color: var(--nu-agora-texto); font-size: var(--nu-fs-sm); font-weight: 600; }
.an__produto { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; min-height: 26px; }
.an__logo { width: 22px; height: 22px; border-radius: 50%; object-fit: cover; background: var(--nu-white); }
.an__empresa { margin: 0; color: var(--nu-agora-texto); font-size: var(--nu-fs-lg); font-weight: 700; letter-spacing: -0.02em; }
.an__bolsa { display: inline-flex; align-items: center; height: 24px; padding: 0 9px; border-radius: var(--nu-r-pill); box-shadow: inset 0 0 0 1px var(--nu-agora-linha); color: var(--nu-agora-sub); font-size: var(--nu-fs-xs); font-weight: 700; }
.an__posicao { display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: var(--nu-r-pill); background: var(--nu-agora-pilula); color: var(--nu-agora-texto); font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums; }
.an__h1 { margin: 14px 0 0; max-width: 22ch; color: var(--nu-agora-sub); font-size: var(--nu-fs-h3); font-weight: 500; letter-spacing: -0.03em; line-height: 1.15; text-wrap: balance; }
.an__preco { margin: 10px 0 0; color: var(--nu-agora-texto); font-size: var(--nu-fs-hero); font-weight: 500; letter-spacing: -0.05em; line-height: 1; font-variant-numeric: tabular-nums; }
.an__dia { display: flex; align-items: center; justify-content: center; gap: 8px 14px; flex-wrap: wrap; margin: 18px 0 0; }
.an__delta { display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 12px; border-radius: var(--nu-r-pill); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.an__delta--up { background: var(--nu-green-soft-16); color: var(--nu-green-soft); }
.an__delta--down { background: var(--nu-red-soft-16); color: var(--nu-red-soft); }
.an__tri--baixo { transform: rotate(180deg); }
.an__meta { color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 500; font-variant-numeric: tabular-nums; }
.an__botoes { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; margin-top: 24px; }
.an__botoes :deep(.nfb) {
  height: 44px; padding: 0 20px; font-size: var(--nu-fs-sm); font-weight: 700; background: var(--nu-agora-texto); color: var(--nu-agora-bg);
  transition: background .2s ease, box-shadow .2s ease, transform .45s var(--mola);
}
.an__botoes :deep(.nfb:hover) { transform: translateY(-2px); box-shadow: 0 0 0 1px var(--nu-white-35), var(--nu-home-sombra-botao-escuro); }
.an__botoes :deep(.nfb:active) { transform: scale(.97); }
.an__botoes :deep(.nfb--on) { background: var(--nu-green-soft); color: var(--nu-navy); }
.an__botoes :deep(.sga__msg--on) { color: var(--nu-agora-sub); }
.an__carteira {
  display: inline-flex; align-items: center; height: 44px; padding: 0 20px; border-radius: var(--nu-r-pill); box-shadow: inset 0 0 0 1px var(--nu-cream-text-40);
  color: var(--nu-agora-texto); font-size: var(--nu-fs-sm); font-weight: 700;
  transition: background .2s ease, box-shadow .2s ease, transform .45s var(--mola);
}
.an__carteira:hover { background: var(--nu-agora-pilula); color: var(--nu-agora-texto); box-shadow: inset 0 0 0 1px var(--nu-cream-text-80); transform: translateY(-2px); }
.an__carteira:active { transform: scale(.97); }
.an__perguntas { margin-top: 22px; }
.an__perguntas :deep(.apc__lista) { justify-content: center; }

.an__palco { position: relative; width: min(1180px, 100%); margin-top: clamp(36px, 4vw, 56px); }
.an__palco-cab { display: flex; align-items: center; justify-content: space-between; gap: 12px 24px; flex-wrap: wrap; text-align: left; }
.an__h2-ceu { margin: 0; color: var(--nu-agora-texto); font-size: var(--nu-fs-xl); font-weight: 600; letter-spacing: -0.02em; }
.an__legenda { display: flex; flex-wrap: wrap; gap: 6px 20px; margin: 0; margin-right: auto; }
.an__leg { display: inline-flex; align-items: center; gap: 8px; color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 600; }
.an__leg b { color: var(--nu-agora-texto); font-size: var(--nu-fs-md); font-weight: 600; font-variant-numeric: tabular-nums; }
.an__leg b.an__leg--up { color: var(--nu-green-soft); }
.an__leg b.an__leg--down { color: var(--nu-red-soft); }
.an__leg-traco { width: 16px; height: 2px; border-radius: 1px; background: var(--nu-blue-soft); }
.an__leg-traco--ibov { background: repeating-linear-gradient(90deg, var(--nu-white-35) 0 3px, transparent 3px 7px); }
.an__grafico { position: relative; height: clamp(220px, 24vw, 330px); margin: 30px 0 0 48px; }
/* a linha de luz do horizonte: o brilho da barra da Redentia (o do herói da home) */
.an__horizonte {
  height: 2px; margin: 0 -12%; pointer-events: none; border-radius: 50%;
  background: linear-gradient(90deg, transparent 4%, var(--nu-chat-luz-1) 24%, var(--nu-white-60) 50%, var(--nu-chat-luz-3) 76%, transparent 96%);
  box-shadow: 0 0 18px 3px var(--nu-chat-luz-1), 0 0 60px 14px var(--nu-chat-luz-2);
}
.an__dica-uso { margin: 14px 0 0; color: var(--nu-cream-text-50); font-size: var(--nu-fs-xs); font-weight: 500; }
@media (hover: none) { .an__dica-uso { display: none; } }

.an__nums { width: min(1180px, 100%); margin: clamp(24px, 2.6vw, 36px) 0 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap: 0 24px; text-align: left; }
.an__num { position: relative; display: flex; flex-direction: column-reverse; justify-content: flex-end; gap: 6px; padding: 16px 0 4px; border-top: 1px solid var(--nu-agora-linha); transition: border-color .2s ease; }
.an__num:hover { border-top-color: var(--nu-blue-soft); }
.an__num-v { margin: 0; color: var(--nu-agora-texto); font-size: var(--nu-fs-2xl); font-weight: 500; letter-spacing: -0.03em; line-height: 1; font-variant-numeric: tabular-nums; transition: color .2s ease; }
.an__num:hover .an__num-v { color: var(--nu-blue-soft); }
.an__num-r { color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 500; }
.an__sim { display: flex; justify-content: center; align-items: baseline; gap: 6px 12px; flex-wrap: wrap; margin: 24px 0 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 500; }
.an__sim-link { color: var(--nu-agora-texto); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: var(--nu-white-35); transition: text-decoration-color .2s ease; }
.an__sim-link:hover { color: var(--nu-agora-texto); text-decoration-color: var(--nu-agora-texto); }

/* ——— a barra que gruda: encosta na régua, fundo de vidro quase opaco ——— */
.an__barra {
  position: sticky; top: var(--cola); z-index: 30;
  background: color-mix(in srgb, var(--nu-white) 94%, transparent);
  -webkit-backdrop-filter: saturate(1.4) blur(16px); backdrop-filter: saturate(1.4) blur(16px);
  border-bottom: 1px solid var(--nu-cream-line);
  /* o mesmo passo da régua e do header quando o header encolhe */
  transition: top .32s cubic-bezier(.2, .8, .2, 1);
}
.an__chips { list-style: none; margin: 0; padding: 10px var(--g); display: flex; align-items: center; gap: 8px; overflow-x: auto; scrollbar-width: none; }
.an__chips::-webkit-scrollbar { display: none; }
.an__chip {
  display: inline-flex; align-items: center; height: 36px; padding: 0 14px; border-radius: var(--nu-r-pill); white-space: nowrap;
  background: var(--nu-cream); color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 600;
  transition: background .2s ease, color .2s ease, box-shadow .2s ease, transform .45s var(--mola);
}
.an__chip--ativo { font-weight: 800; }
.an__chip:hover { background: var(--nu-white); color: var(--nu-ink); box-shadow: 0 0 0 1px var(--nu-navy-06), 0 10px 22px -14px var(--nu-navy-55); transform: translateY(-1px); }
.an__chip:active { transform: scale(.96); }
.an__chip--on, .an__chip--on:hover { background: var(--nu-ink); color: var(--nu-white); box-shadow: none; }
.an__chip:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

/* ——— cada seção: cabeçalho centrado, conteúdo embaixo ——— */
.an__sec { scroll-margin-top: calc(var(--cola) + var(--barra-h)); padding: clamp(56px, 7vw, 96px) var(--g); }
#cotacao { scroll-margin-top: var(--cola); }
.an__sec--creme { background: var(--nu-cream); }
.an__sec--resumo { padding-top: clamp(40px, 5vw, 64px); padding-bottom: clamp(40px, 5vw, 64px); }
.an__sec--fim { padding-bottom: clamp(40px, 5vw, 64px); }
.an__cab { display: flex; flex-direction: column; align-items: center; text-align: center; max-width: 720px; margin: 0 auto; }
.an__tipo { margin: 0; color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 700; }
.an__h2 { margin: 10px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm); font-weight: 500; letter-spacing: -0.045em; line-height: 1.05; text-wrap: balance; }
.an__q { margin: 12px 0 0; max-width: 52ch; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; text-wrap: balance; }
.an__estreito { max-width: 760px; margin: clamp(28px, 3.4vw, 40px) auto 0; }
.an__sec--resumo .an__estreito { margin-top: 0; }
.an__largo { max-width: 1080px; margin: clamp(28px, 3.4vw, 44px) auto 0; }
.an__resumo p { margin: 0 0 14px; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.7; }
.an__resumo .an__aviso { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; }
.an__sec--creme .an__ind :deep(.ain__dim) { background: var(--nu-white); }
.an__sec--creme :deep(.apg__mais), .an__sec--creme :deep(.avt__lista a), .an__sec--creme :deep(.apv__cta:not(.apv__cta--1)) { background: var(--nu-white); }

/* AcaoEtfXray e AcaoCadeia vêm prontos (as bandas deles); aqui o título no peso
   da página, a cor na alternância e o hover com mola e anel */
.an__embutida { scroll-margin-top: calc(var(--cola) + var(--barra-h) - 20px); }
.an__embutida :deep(.axb__title), .an__embutida :deep(.acd__title), .an__embutida :deep(.afi__title) { font-size: var(--nu-fs-h2-sm); font-weight: 500; letter-spacing: -0.045em; }
.an__embutida--inverte :deep(.axb--white), .an__embutida--inverte :deep(.afi) { background: var(--nu-cream); }
.an__embutida--inverte :deep(.axb--cream) { background: var(--nu-white); }
.an__embutida--inverte :deep(.axb--cream .axb__card) { background: var(--nu-cream); }
.an__embutida--branca :deep(.acd) { background: var(--nu-white); }
.an__embutida--branca :deep(.acd__no:not(.acd__no--resto)) { background: var(--nu-cream); }
.an__embutida :deep(.acd__no) { transition: transform .45s var(--mola), box-shadow .22s ease; }
.an__embutida :deep(.acd__no:not(.acd__no--resto):hover) { transform: translateY(-3px); box-shadow: 0 0 0 1px var(--nu-navy-06), var(--nu-shadow-card); }
.an__embutida :deep(.acd__no:hover .acd__ticker) { color: var(--nu-blue-text); }
.an__embutida :deep(.acd__ticker) { transition: color .2s ease; }
.an__embutida :deep(.axb__row) { transition: background .2s ease; border-radius: 8px; }
.an__embutida :deep(.axb__row--link:hover) { background: var(--nu-ink-04); }
.an__embutida :deep(.axb__card) { transition: transform .45s var(--mola), box-shadow .22s ease; }
.an__embutida :deep(.axb__card:hover) { transform: translateY(-3px); box-shadow: 0 0 0 1px var(--nu-navy-06), var(--nu-shadow-card); }

.an__gancho { margin-top: 32px; }
.an__veja { margin-top: 40px; }
.an .an__andre { margin: 24px 0 0; padding: 0; background: transparent; }

@media (max-width: 680px) {
  .an { --barra-h: 53px; }
  .an__palco-cab { justify-content: flex-start; }
  .an__horizonte { margin: 0 -24px; }
  .an__nums { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 16px; }
  .an__chips { padding: 8px var(--g); }
}
@media (prefers-reduced-motion: reduce) {
  .an__chip, .an__carteira, .an__barra, .an__num, .an__num-v, .an__botoes :deep(.nfb),
  .an__embutida :deep(.acd__no), .an__embutida :deep(.axb__card) { transition: none; }
  .an__chip:hover, .an__chip:active, .an__carteira:hover, .an__carteira:active, .an__botoes :deep(.nfb:hover),
  .an__embutida :deep(.acd__no:hover), .an__embutida :deep(.axb__card:hover) { transform: none; }
}
</style>
