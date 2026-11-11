<script setup lang="ts">
// /asset: "A noite" (03/11/2026), a direção que o dono escolheu entre três
// ("a 2"), com o refino que ele pediu no mesmo dia. O topo é o escuro do herói
// da home e do /benchmark-ia (o navy do rodapé descendo ao preto) no idioma do
// app Ações, "A bolsa no bolso" (TopoBolsa, a escolha do dono entre três topos
// em 03/11): o papel e as ações em botões redondos, o preço grande e fino que
// acompanha a mira, a linha de luz de borda a borda e o período embaixo. É o
// único momento brilhante da tela; o resto é calmo.
// Logo abaixo, os números do gráfico em fila e o resumo factual. Depois, uma
// barra que gruda com as seções, NA ORDEM em que a página desce: o ativo,
// indicadores, por dentro (ETF), proventos, análise, sobre, teses, notícias,
// cadeia, setor e perguntas. A barra encosta embaixo do header e da régua do
// mercado pela altura que os dois publicam (--nuh-h do useTopo, --nut-h do
// NuMarketTicker), sem px chutado.
// Tudo sai do servidor: o texto, os links, o FAQ (<details>). Ao rolar, o
// papel, o preço e a variação entram na barra que gruda, sem empurrar nada.
// Aportou (11/11/2026): a página trocou de roupa, não de conteúdo. O topo é
// creme, com o cartão carvão do gráfico (TopoBolsa); as bandas alternam o creme
// da página e a faixa quente (--nu-band) no lugar do branco e do creme; cada
// seção abre com o eyebrow da marca e o título em 800, alinhados à esquerda.
// A ordem das seções, os títulos, os textos e os links são os mesmos.
import type { AtivoDirecaoVM } from '~/composables/useAtivoDirecao'
import AcaoEtfXray from '~/components/acao/AcaoEtfXray.vue'
import AcaoFundInfo from '~/components/acao/AcaoFundInfo.vue'
import CadeiaRazao from '~/components/ativo/cadeia/CadeiaRazao.vue'
import TopoBolsa from '~/components/ativo/topo/TopoBolsa.vue'

const props = defineProps<{ vm: AtivoDirecaoVM }>()
const { v, a, t, contexto, contextoGrafico, tituloGrafico, legenda, linhas, cartoes, perguntas, perguntar, abrirCom, secoes, links, ir } = useAtivoDirecao(() => props.vm)
const atual = useSecaoAtual(() => secoes.value.map((s) => s.id), 220)
const tesesTitulo = computed(() => (a.value.theses.length === 1 ? `${t.value} faz parte de 1 tese.` : `${t.value} faz parte de ${a.value.theses.length} teses.`))
const rotulo = (id: string) => secoes.value.find((s) => s.id === id)?.rotulo ?? ''

// a alternância branco/creme das bandas, pela ordem do que a página tem (duas
// bandas da mesma cor seguidas viram uma só, com o dobro do respiro no meio).
// O resumo, logo depois do herói, é branco; o Raio-X de ETF traz duas bandas.
// As perguntas fecham SEMPRE em creme (o FAQ da /teses: cartões brancos na
// faixa creme). Quando a conta as pintaria de branco, elas ficam creme e se
// juntam à banda creme de antes (o mesmo caso das duas bandas seguidas); o
// topo, logo depois do resumo, não muda.
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
  out.perguntas = 'creme'
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

const heroi = ref<HTMLElement | null>(null)
const compacta = ref(false)
let obsHeroi: IntersectionObserver | null = null
onMounted(() => {
  if (!heroi.value) return
  // o preço saiu de baixo do header e da régua: a barra mostra o papel (só embeleza)
  obsHeroi = new IntersectionObserver(([e]) => { compacta.value = !!e && !e.isIntersecting && e.boundingClientRect.top < 0 }, { rootMargin: '-140px 0px 0px 0px', threshold: 0 })
  obsHeroi.observe(heroi.value)
})
onBeforeUnmount(() => obsHeroi?.disconnect())

// A entrada das seções (contrato da Aportou, seção 5): o cabeçalho e o conteúdo
// sobem 10px com fade quando a seção chega perto da tela. Só embeleza: a classe
// só entra em seção que montou FORA da tela, com a aba visível e sem pedido de
// menos movimento; se o observador nunca disparar, o conteúdo já está lá.
const raiz = ref<HTMLElement | null>(null)
let obsSecoes: IntersectionObserver | null = null
onMounted(() => {
  const el = raiz.value
  if (!el || document.visibilityState !== 'visible' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  obsSecoes = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue
      e.target.classList.add('an--entra')
      obsSecoes?.unobserve(e.target)
    }
  }, { rootMargin: '0px 0px 12% 0px' })
  el.querySelectorAll<HTMLElement>(':scope > .an__sec, :scope > .an__embutida').forEach((sec) => {
    if (sec.getBoundingClientRect().top >= window.innerHeight) obsSecoes!.observe(sec)
  })
})
onBeforeUnmount(() => obsSecoes?.disconnect())
</script>

<template>
  <div ref="raiz" class="an">
    <div id="cotacao" class="an__ativo">
      <!-- ============ o topo: o papel, o preço e a linha de luz ============ -->
      <div ref="heroi">
        <TopoBolsa
          :a="a" :t="t" :series="v.series" :range="v.range" :range-loading="v.rangeLoading" :position="v.position"
          :renamed-from="v.renamedFrom" :seguivel="v.seguivel" :titulo-grafico="tituloGrafico" :legenda="legenda" :linhas="linhas"
          :perguntas="perguntas" :contexto="contexto" :contexto-grafico="contextoGrafico"
          @periodo="v.setRange" @perguntar="perguntar" @abrir="abrirCom()"
        />
      </div>

      <!-- o resumo factual: o que o gráfico e os números dizem, em palavras -->
      <section v-if="a.resumo" v-contexto-chat="{ id: `resumo:${t}`, tipo: 'secao', rotulo: rotuloComSobre('Resumo', t), texto: a.resumo.paragrafos.join('\n') }" class="an__sec an__sec--resumo" aria-label="Resumo do ativo">
        <!-- o resumo recolhido (o dono, 03/11): uma faixa de ponta a ponta, colada no céu;
             o texto dela alinha com o conteúdo do céu por dentro (AtivoResumo) -->
        <AtivoResumo :ticker="t" :resumo="a.resumo" />
      </section>
    </div>

    <!-- ============ a barra que gruda: as seções, na ordem da página ============ -->
    <nav v-if="secoes.length > 1" class="an__barra" :class="{ 'an__barra--compacta': compacta }" aria-label="Seções da página">
      <!-- a barra compacta do app: quando o topo sai da tela, o papel e o preço
           entram aqui, como o título grande do iOS que vira pequeno. Só no
           cliente e dentro da altura que a barra já tem: não empurra nada. -->
      <div v-if="compacta" class="an__ident">
        <b class="an__ident-t">{{ t }}</b>
        <span class="an__ident-p">{{ a.hero.priceFmt }}</span>
        <span v-if="a.hero.changeLine" class="an__ident-v" :class="`an__ident-v--${a.hero.dir}`">{{ a.hero.dir === 'down' ? '-' : '+' }}{{ a.hero.changeLine.match(/\(([^)]+)\)/)?.[1] ?? '' }}</span>
      </div>
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
        <NuEyebrow como="p" class="an__tipo">{{ rotulo('indicadores') }}</NuEyebrow>
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
        <NuEyebrow como="p" class="an__tipo">{{ rotulo('dividendos') }}</NuEyebrow>
        <h2 class="an__h2">{{ a.dividends.heading[0] }} {{ a.dividends.heading[1] }}</h2>
      </header>
      <div class="an__largo">
        <AtivoProventos
          :ticker="t" :dividends="a.dividends" :position="v.position" :simulador-href="a.simuladorHref"
          :quanto-rende-href="v.quantoRendeHref" :dividendos-href="v.dividendosHref"
        />
      </div>
    </section>

    <section v-if="a.ai" id="analise" v-contexto-chat="{ id: `analise:${t}`, tipo: 'grafico', rotulo: `O que a Aportou vê · ${t}` }" class="an__sec" :class="tom('analise')">
      <header class="an__cab">
        <NuEyebrow como="p" class="an__tipo">{{ rotulo('analise') }}</NuEyebrow>
        <h2 class="an__h2">O que a Aportou vê.</h2>
      </header>
      <div class="an__largo"><AtivoLeitura :ticker="t" :ai="a.ai" @conversar="abrirCom()" /></div>
    </section>

    <section v-if="a.editorial?.sections.length" id="sobre" class="an__sec" :class="tom('sobre')">
      <header class="an__cab an__cab--estreito">
        <NuEyebrow como="p" class="an__tipo">{{ rotulo('sobre') }}</NuEyebrow>
      </header>
      <div class="an__estreito"><AtivoProsa :ticker="t" :secoes="a.editorial.sections" /></div>
    </section>

    <section v-if="a.theses.length" id="teses" v-contexto-chat="{ id: `teses:${t}`, tipo: 'tese', rotulo: `Teses com ${t}`, texto: `${tesesTitulo}\n${a.theses.map((x) => `${x.title}: ${x.roleStrong}${x.roleRest}`).join('\n')}` }" class="an__sec" :class="tom('teses')">
      <header class="an__cab an__cab--estreito">
        <NuEyebrow como="p" class="an__tipo">Teses da Aportou</NuEyebrow>
        <h2 class="an__h2">{{ tesesTitulo }}</h2>
      </header>
      <div class="an__estreito"><AtivoTeses :theses="a.theses" /></div>
    </section>

    <section v-if="a.news" id="noticias" v-contexto-chat="{ id: `noticias:${t}`, tipo: 'noticia', rotulo: `Notícias de ${t}` }" class="an__sec" :class="tom('noticias')">
      <header class="an__cab an__cab--estreito">
        <NuEyebrow como="p" class="an__tipo">{{ rotulo('noticias') }}</NuEyebrow>
        <h2 class="an__h2">{{ t }} no noticiário.</h2>
        <p class="an__q">O que saiu sobre {{ t }}, com a variação do papel no dia de cada notícia.</p>
      </header>
      <div class="an__estreito"><AtivoNoticias :news="a.news" /></div>
    </section>

    <!-- a cadeia, "O razão" (a escolha do dono entre três, 03/11): uma linha por empresa -->
    <section v-if="a.cadeia" id="cadeia" class="an__embutida">
      <CadeiaRazao :cadeia="a.cadeia" :nome="a.name" :ticker="t" :tom="tons.cadeia" />
    </section>

    <section v-if="a.pares" id="setor" class="an__sec" :class="tom('setor')">
      <header class="an__cab">
        <NuEyebrow como="p" class="an__tipo">{{ rotulo('setor') }}</NuEyebrow>
        <h2 class="an__h2">Outras empresas do setor {{ a.pares.setor.nome.toLowerCase() }}.</h2>
      </header>
      <div class="an__largo"><AtivoPares :pares="a.pares" /></div>
    </section>

    <!-- as perguntas no idioma do FAQ da /teses: o H2 grande à esquerda, os cartões à direita -->
    <section id="perguntas" class="an__sec an__sec--fim an__sec--faq" :class="tom('perguntas')">
      <div class="an__faq">
        <AtivoPerguntas :ticker="t" :editorial="a.editorial" :resumo="a.resumo" @perguntar="abrirCom()" />
        <div class="an__faq-pe">
          <SeguirGancho v-if="v.seguivel" :atual="t" :surface="tons.perguntas === 'creme' ? 'cream' : 'white'" class="an__gancho" />
          <AtivoVejaTambem :links="links" class="an__veja" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.an {
  --g: clamp(20px, 5.5vw, 80px);
  /* a barra encosta embaixo do header (--nuh-h, useTopo) e da régua do
     mercado (--nut-h, NuMarketTicker): os dois publicam a altura no <html> */
  --cola: calc(var(--nuh-h, 72px) + var(--nut-h, 0px));
  --barra-h: 61px;
  --mola: cubic-bezier(.2, .8, .2, 1);
  --a-h2: var(--nu-fs-h3); --a-h2-peso: 800;
  /* a margem da coluna de 1240px (a do topo): a barra e as seções alinham nela */
  --lado: max(var(--g), calc((100% - 1240px) / 2));
  background: var(--nu-page);
}

/* ——— a barra que gruda: encosta na régua, creme da página quase opaco ——— */
.an__barra {
  position: sticky; top: var(--cola); z-index: 30;
  background: color-mix(in srgb, var(--nu-page) 94%, transparent);
  -webkit-backdrop-filter: saturate(1.4) blur(16px); backdrop-filter: saturate(1.4) blur(16px);
  border-top: 1.5px solid var(--nu-line-2); border-bottom: 1.5px solid var(--nu-line-2);
  /* o mesmo passo da régua e do header quando o header encolhe */
  transition: top .32s cubic-bezier(.2, .8, .2, 1);
  /* compacta: o papel à esquerda, as seções à direita */
  display: flex; align-items: center;
}
.an__barra .an__chips { flex: 1; min-width: 0; }
.an__ident { display: flex; align-items: center; gap: 10px; flex-shrink: 0; padding-left: var(--lado); animation: an-ident .22s ease both; font-variant-numeric: tabular-nums; white-space: nowrap; }
@keyframes an-ident { from { opacity: 0; transform: translateY(4px); } }
/* o papel na barra: a etiqueta carvão da marca */
.an__ident-t { display: inline-flex; align-items: center; height: 26px; padding: 0 9px; border-radius: var(--nu-r-tag); background: var(--nu-ink); color: var(--nu-white); font-size: var(--nu-fs-sm); font-weight: 800; letter-spacing: 0.04em; }
.an__ident-p { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; }
.an__ident-v { font-size: var(--nu-fs-sm); font-weight: 700; }
.an__ident-v--up { color: var(--nu-green-text); }
.an__ident-v--down { color: var(--nu-red-text); }
.an__barra--compacta .an__chip--ativo { display: none; }
/* compacta, a fileira que rola some num degradê junto do papel (não corta seco) */
.an__barra--compacta .an__chips { padding-left: 16px; -webkit-mask-image: linear-gradient(90deg, transparent 6px, var(--nu-ink) 22px); mask-image: linear-gradient(90deg, transparent 6px, var(--nu-ink) 22px); }
.an__chips { list-style: none; margin: 0; padding: 8px var(--lado); display: flex; align-items: center; gap: 6px; overflow-x: auto; scrollbar-width: none; }
.an__chips::-webkit-scrollbar { display: none; }
.an__chip {
  display: inline-flex; align-items: center; min-height: 44px; padding: 0 16px; border-radius: var(--nu-r-pill); white-space: nowrap;
  background: transparent; color: var(--nu-gray-3); font-size: 14.5px; font-weight: 600;
  transition: background .2s ease, color .2s ease, transform .15s var(--mola);
}
.an__chip--ativo { font-weight: 800; }
.an__chip:hover { background: var(--nu-cream-2); color: var(--nu-ink); }
.an__chip:active { transform: scale(.97); }
.an__chip--on, .an__chip--on:hover { background: var(--nu-ink); color: var(--nu-white); font-weight: 700; }

/* ——— cada seção: o eyebrow e o título à esquerda, o conteúdo embaixo ——— */
.an__sec { scroll-margin-top: calc(var(--cola) + var(--barra-h)); padding: clamp(64px, 7vw, 100px) var(--g); }
#cotacao { scroll-margin-top: var(--cola); }
/* a entrada: o cabeçalho e, 60ms depois, o conteúdo (só com a classe do observador) */
.an__sec.an--entra > *, .an__embutida.an--entra > * { animation: nu-fade .5s ease backwards; }
.an__sec.an--entra > :nth-child(2) { animation-delay: 60ms; }
/* a segunda cor da alternância: a faixa quente (era o creme sobre o branco) */
.an__sec--creme { background: var(--nu-band); }
/* o resumo mora logo abaixo do topo, na mesma coluna dele */
.an__sec--resumo { padding: 0 clamp(20px, 4vw, 56px) clamp(36px, 4.4vw, 56px); }
.an__sec--fim { padding-bottom: clamp(40px, 5vw, 64px); }
.an__cab { display: flex; flex-direction: column; align-items: flex-start; max-width: 1240px; margin: 0 auto; }
.an__cab--estreito { max-width: 760px; }
.an__h2 { margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm); font-weight: 800; letter-spacing: -0.03em; line-height: 1.04; text-wrap: balance; }
.an__q { margin: 14px 0 0; max-width: 60ch; color: var(--nu-gray-3); font-size: clamp(16px, 1.4vw, 18px); font-weight: 500; line-height: 1.5; }
.an__estreito { max-width: 760px; margin: clamp(28px, 3.4vw, 40px) auto 0; }
.an__largo { max-width: 1240px; margin: clamp(28px, 3.4vw, 40px) auto 0; }
/* sem título, só o eyebrow (a prosa "Sobre" traz os próprios H2): menos respiro */
.an__cab:not(:has(.an__h2)) + .an__estreito { margin-top: 22px; }
.an__sec--creme .an__ind :deep(.ain__dim) { background: var(--nu-white); }
.an__sec--creme :deep(.avt__lista a) { background: var(--nu-white); }

/* AcaoEtfXray e AcaoFundInfo vêm prontos (as bandas deles); aqui o título no
   peso da página, a cor na alternância e o cartão que sobe. A cadeia
   (CadeiaRazao) já recebe o tom da alternância. */
.an__embutida { scroll-margin-top: calc(var(--cola) + var(--barra-h) - 20px); }
.an__embutida :deep(.axb__title), .an__embutida :deep(.afi__title) { font-size: var(--nu-fs-h2-sm); font-weight: 800; letter-spacing: -0.03em; }
.an__embutida--inverte :deep(.axb--white), .an__embutida--inverte :deep(.afi) { background: var(--nu-band); }
.an__embutida--inverte :deep(.axb--cream) { background: var(--nu-page); }
.an__embutida :deep(.axb__row) { transition: background .2s ease; border-radius: 8px; }
.an__embutida :deep(.axb__row--link:hover) { background: var(--nu-cream-2); }
.an__embutida :deep(.axb__card) { transition: transform .25s var(--mola), box-shadow .25s var(--mola); }
.an__embutida :deep(.axb__card:hover) { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }

/* a faixa do FAQ: a largura do /teses (sem o miolo de 760px), o gancho e o
   "veja também" embaixo das duas colunas */
.an__sec--faq { padding-top: clamp(64px, 8.5vw, 110px); }
.an__faq { max-width: 1240px; margin: 0 auto; }
.an__faq-pe { margin-top: clamp(48px, 6vw, 80px); }
/* colada numa banda da mesma cor (a conta pintaria as perguntas da cor da
   página): um fio no lugar do segundo respiro */
.an__sec--creme + .an__sec--faq, .an__embutida:has(.crz--creme) + .an__sec--faq { padding-top: 0; }
.an__sec--creme + .an__sec--faq .an__faq, .an__embutida:has(.crz--creme) + .an__sec--faq .an__faq { padding-top: clamp(56px, 7vw, 96px); border-top: 1.5px solid var(--nu-line); }
.an__veja { margin-top: 40px; }

@media (max-width: 680px) {
  .an { --barra-h: 57px; }
  .an__chips { padding: 6px var(--lado); }
  /* no celular o papel encolhe, mas o preço fica: ticker, preço e variação */
  .an__ident { gap: 6px; }
  .an__ident-p { font-size: var(--nu-fs-sm); }
  .an__ident-v { font-size: var(--nu-fs-xs); }
}
@media (prefers-reduced-motion: reduce) {
  .an__ident, .an__sec.an--entra > *, .an__embutida.an--entra > * { animation: none; }
  .an__chip, .an__barra,
  .an__embutida :deep(.axb__card) { transition: none; }
  .an__chip:active,
  .an__embutida :deep(.axb__card:hover) { transform: none; }
}
</style>
