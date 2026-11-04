<script setup lang="ts">
/**
 * /business, direção 1 (?biz=1, 04/11/2026): A TELA PRIMEIRO, na gramática da
 * Brex. O dono recusou as três primeiras ("parece site, não produto", "ficou
 * parecida com a atual") e deu a Brex e a Decade de referência. Da Brex:
 *  - o hero escuro com a tela grande do produto de verdade sangrando pela
 *    borda, uma segunda tela por cima e etiquetas flutuando;
 *  - títulos curtos e fortes, de duas a cinco palavras;
 *  - linhas que alternam escuro e claro, cada uma com uma tela no lugar do
 *    parágrafo, e a interface ocupando mais área que o texto;
 *  - a faixa de números grandes.
 *
 * AS TELAS SÃO AS DO PRODUTO, recortadas fiéis (components/business/telas): o
 * painel de Clientes do escritório, as telas do Redentia MCP no assistente
 * (a carteira e o cenário), a resposta do "por que mexeu" com a leitura da
 * casa e a capa do relatório "Carta do private". Todo dado de exemplo leva o
 * rótulo "Exemplo"; os números de mercado são do pregão de 03/11/2026 e do
 * motor de 04/11/2026 (content/business/exemplo-cenario.ts).
 *
 * MOVIMENTO SÓ DO PRODUTO FUNCIONANDO, uma vez (useBizEntrada): a carteira
 * consolida e o registro de acesso chega no hero; o leque se varre; a resposta
 * surge palavra por palavra; o relatório sai. Tudo sai pronto do servidor.
 */
import { EXEMPLO_CENARIO as X, EXEMPLO_PREGAO as P, diaTxt } from '~/content/business/exemplo-cenario'

const hero = useBizEntrada({ atraso: 500, limiar: 0.2 })
const leque = useBizEntrada({ limiar: 0.3 })
const conversa = useBizEntrada({ limiar: 0.4 })
const relatorio = useBizEntrada({ limiar: 0.4 })

const LEITURA = P.porque.leitura
const NUMEROS = [
  { n: '2.000', r: 'caminhos em cada cenário' },
  { n: '50', r: 'ativos numa pergunta' },
  { n: '12', r: 'meses de consentimento, revogável' },
  { n: '0', r: 'ordens: a Redentia só lê' },
]
const SEGURANCA = [
  { t: 'Só lê.', d: 'Nada compra, vende ou transfere.' },
  { t: 'Cliente só entra com o sim dele.', d: 'Cada leitura fica registrada.' },
  { t: 'A IA é a da sua casa.', d: 'O Claude ou o ChatGPT do escritório.' },
]
const ctx = {
  hero: { id: 'business:hero', tipo: 'bloco', rotulo: 'Clientes do escritório e a carteira do cliente' },
  leque: { id: 'business:cenario', tipo: 'simulacao', rotulo: `Carteira de exemplo no cenário ${X.cenario}` },
  conversa: { id: 'business:porque', tipo: 'noticia', rotulo: `Por que a PETR4 caiu ${diaTxt(P.porque.variacao)}` },
  relatorio: { id: 'business:relatorio', tipo: 'bloco', rotulo: 'O relatório com a marca do escritório' },
  seg: { id: 'business:seguranca', tipo: 'bloco', rotulo: 'Segurança do Redentia For Business' },
}
</script>

<template>
  <div class="bxb">
    <!-- ——— o hero: a tela é a protagonista ——— -->
    <section id="gargalo" v-contexto-chat="ctx.hero" class="bxb-hero">
      <div class="bxb-hero__luz" aria-hidden="true" />
      <div class="bxb-hero__texto">
        <p class="bxb-hero__produto">Redentia For Business</p>
        <h1 class="bxb-hero__titulo">Consolide a carteira do seu cliente com 1 clique.</h1>
        <p class="bxb-hero__dek">O cliente autoriza pelo Open Finance. A carteira, o cenário e o relatório chegam no assistente da sua mesa.</p>
        <div class="bxb-hero__acao">
          <a href="#contato" class="bxb__cta">Agendar 1 hora com a gente</a>
          <span class="bxb-hero__status">Conexão habilitada escritório a escritório, na implantação.</span>
        </div>
      </div>
      <div :ref="(e) => (hero.el.value = e as HTMLElement)" class="bxb-hero__palco">
        <BizJanela class="bxb-hero__painel" endereco="redentia.com.br/business/clientes" escuro>
          <BizTelaClientes etapa="cliente" :tocar="hero.tocar.value" />
        </BizJanela>
        <BizJanela class="bxb-hero__assist" tipo="assistente" escuro>
          <BizTelaCarteira :linhas="3" :tocar="hero.tocar.value" />
        </BizJanela>
        <span class="bxb-hero__eti bxb-hero__eti--a" aria-hidden="true"><i />Com o sim do cliente</span>
        <span class="bxb-hero__eti bxb-hero__eti--b" aria-hidden="true"><i />Só leitura</span>
      </div>
    </section>

    <!-- ——— o produto, tela por tela ——— -->
    <section id="produto" class="bxb-prod">
      <header class="bxb-prod__cab">
        <h2 class="bxb__h2">A reunião começa pronta.</h2>
        <p class="bxb__dek">Tudo no Claude ou no ChatGPT que o escritório já usa.</p>
      </header>

      <div v-contexto-chat="ctx.leque" class="bxb-linha bxb-linha--escura">
        <div class="bxb-linha__texto">
          <h3 class="bxb__h3">Um choque.<br>2.000 caminhos.</h3>
          <p class="bxb__p">Desenhe o cenário e veja onde a carteira pode terminar em um ano, sem nome de cliente.</p>
          <ul class="bxb-linha__chips" :aria-label="`Cenário ${X.cenario}`">
            <li v-for="c in X.choques" :key="c.nome">{{ c.nome }} <b>{{ c.valor }}</b></li>
          </ul>
        </div>
        <div :ref="(e) => (leque.el.value = e as HTMLElement)" class="bxb-linha__tela bxb-linha__tela--leque">
          <BizLeque :tocar="leque.tocar.value" />
        </div>
      </div>

      <div v-contexto-chat="ctx.conversa" class="bxb-linha bxb-linha--inversa">
        <div class="bxb-linha__texto">
          <h3 class="bxb__h3">Por que mexeu,<br>com fonte.</h3>
          <p class="bxb__p">O assistente responde com a notícia, a hora e a leitura da casa.</p>
        </div>
        <div :ref="(e) => (conversa.el.value = e as HTMLElement)" class="bxb-linha__tela bxb-linha__tela--tinta">
          <BizJanela tipo="assistente" composer rotulo="Pregão de 03/11">
            <BizConversa
              :pergunta="`Por que a PETR4 caiu ${diaTxt(P.porque.variacao)} ontem?`" :resposta="LEITURA"
              :fonte="`Leitura da Redentia · ${P.porque.fonte}, ${P.porque.hora}`" :tocar="conversa.tocar.value"
            />
          </BizJanela>
        </div>
      </div>

      <div v-contexto-chat="ctx.relatorio" class="bxb-linha">
        <div class="bxb-linha__texto">
          <h3 class="bxb__h3">O relatório com<br>a sua marca.</h3>
          <p class="bxb__p">Para family office e gestora: a carteira, os cenários e o mercado do dia, prontos para revisar. <span class="bxb__tag">na implantação</span></p>
        </div>
        <div :ref="(e) => (relatorio.el.value = e as HTMLElement)" class="bxb-linha__tela bxb-linha__tela--creme">
          <BizTelaRelatorio :tocar="relatorio.tocar.value" />
        </div>
      </div>
    </section>

    <!-- ——— os números ——— -->
    <section class="bxb-num" aria-label="Em números">
      <div v-for="n in NUMEROS" :key="n.r" class="bxb-num__item">
        <span class="bxb-num__n">{{ n.n }}</span>
        <span class="bxb-num__r">{{ n.r }}</span>
      </div>
    </section>

    <!-- ——— segurança, no escuro ——— -->
    <section id="seguranca" v-contexto-chat="ctx.seg" class="bxb-seg">
      <h2 class="bxb__h2 bxb__h2--claro">Seu compliance pergunta.<br>A gente mostra.</h2>
      <ul class="bxb-seg__lista">
        <li v-for="s in SEGURANCA" :key="s.t"><b>{{ s.t }}</b><span>{{ s.d }}</span></li>
      </ul>
    </section>

    <BizPlano />
    <BizFaq />
    <RbContato />
  </div>
</template>

<style scoped>
.bxb { --g: clamp(22px, 5.5vw, 80px); background: var(--nu-white); }
.bxb__cta {
  display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 26px;
  border-radius: var(--nu-r-pill); background: var(--nu-blue); color: var(--nu-white);
  font-size: var(--nu-fs-md); font-weight: 700; box-shadow: var(--nu-home-sombra-botao); transition: background .2s;
}
.bxb__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.bxb__cta:focus-visible { outline: 2px solid var(--nu-white); outline-offset: 3px; }
.bxb__h2 { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.05em; line-height: 1.02; }
.bxb__h2--claro { color: var(--nu-agora-texto); }
.bxb__dek { margin: 14px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; }
.bxb__h3 { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm); font-weight: 800; letter-spacing: -0.045em; line-height: 1.04; }
.bxb__p { margin: 16px 0 0; max-width: 38ch; color: var(--nu-gray-2); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.55; }
.bxb__tag { display: inline-block; margin-left: 4px; padding: 2px 9px; border-radius: var(--nu-r-pill); background: var(--nu-cream); color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; vertical-align: 2px; white-space: nowrap; }

/* ——— hero ——— */
.bxb-hero {
  position: relative; isolation: isolate; overflow: hidden;
  display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); align-items: center; gap: clamp(24px, 4vw, 64px);
  min-height: min(calc(100svh - var(--nuh-h, 72px)), 860px);
  padding: clamp(48px, 6vw, 88px) 0 clamp(48px, 6vw, 88px) var(--g);
  background: var(--nu-agora-bg); color: var(--nu-agora-texto);
}
.bxb-hero__luz {
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background:
    radial-gradient(55% 60% at 78% 50%, color-mix(in srgb, var(--nu-blue) 30%, transparent), transparent 70%),
    linear-gradient(160deg, var(--nu-navy) 0%, var(--nu-agora-bg) 70%);
}
.bxb-hero__produto { margin: 0; color: var(--nu-blue-soft); font-size: var(--nu-fs-md); font-weight: 700; }
.bxb-hero__titulo { margin: 14px 0 0; max-width: 13ch; color: var(--nu-agora-texto); font-size: clamp(40px, 4.7vw, 68px); font-weight: 800; letter-spacing: -0.055em; line-height: 1; }
.bxb-hero__dek { margin: 20px 0 0; max-width: 40ch; color: var(--nu-agora-sub); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; }
.bxb-hero__acao { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; margin-top: 28px; }
.bxb-hero__status { color: var(--nu-cream-text-55); font-size: var(--nu-fs-sm); font-weight: 500; }
.bxb-hero__palco { position: relative; min-height: 600px; }
.bxb-hero__painel { position: absolute; top: 0; left: 0; width: 760px; }
.bxb-hero__assist { position: absolute; left: -56px; top: 250px; width: 330px; }
.bxb-hero__eti {
  position: absolute; z-index: 2; display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 14px;
  border-radius: var(--nu-r-pill); background: color-mix(in srgb, var(--nu-navy) 70%, transparent);
  -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
  box-shadow: inset 0 0 0 1px var(--nu-white-18); color: var(--nu-agora-texto); font-size: var(--nu-fs-sm); font-weight: 600; white-space: nowrap;
}
.bxb-hero__eti i { width: 7px; height: 7px; border-radius: 50%; background: var(--nu-green-soft); }
.bxb-hero__eti--a { left: 310px; top: 470px; }
.bxb-hero__eti--b { left: 520px; top: 470px; }
.bxb-hero__eti--b i { background: var(--nu-blue-soft); }

/* ——— o produto ——— */
.bxb-prod { scroll-margin-top: calc(var(--nuh-h, 72px) + 24px); padding: clamp(80px, 10vw, 140px) var(--g) clamp(40px, 5vw, 64px); }
.bxb-prod__cab { text-align: center; max-width: 760px; margin: 0 auto clamp(48px, 6vw, 88px); }
.bxb-linha {
  display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); gap: clamp(28px, 5vw, 80px); align-items: center;
  max-width: 1240px; margin: 0 auto clamp(64px, 8vw, 120px);
}
.bxb-linha--inversa .bxb-linha__texto { order: 2; }
.bxb-linha:last-child { margin-bottom: 0; }
.bxb-linha__tela { border-radius: var(--nu-r-card-lg); padding: clamp(24px, 3.4vw, 48px); overflow: hidden; }
.bxb-linha__tela--tinta { background: var(--nu-blue-bg); }
.bxb-linha__tela--creme { background: var(--nu-cream); padding-bottom: clamp(16px, 2vw, 28px); }
.bxb-linha--escura {
  max-width: none; margin-inline: calc(-1 * var(--g)); padding: clamp(56px, 7vw, 104px) var(--g);
  background: var(--nu-agora-bg);
}
.bxb-linha--escura > * { max-width: 100%; }
.bxb-linha--escura .bxb__h3 { color: var(--nu-agora-texto); }
.bxb-linha--escura .bxb__p { color: var(--nu-agora-sub); }
.bxb-linha__tela--leque { padding: clamp(24px, 3vw, 40px) clamp(20px, 3vw, 40px); background: var(--nu-agora-cartao); box-shadow: 0 0 0 1px var(--nu-agora-linha); }
.bxb-linha__chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 22px 0 0; padding: 0; list-style: none; }
.bxb-linha__chips li { display: inline-flex; gap: 6px; height: 34px; align-items: center; padding: 0 14px; border-radius: var(--nu-r-pill); background: var(--nu-agora-pilula); color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums; }
.bxb-linha__chips b { color: var(--nu-agora-texto); font-weight: 700; }

/* ——— números ——— */
.bxb-num { display: grid; grid-template-columns: repeat(4, 1fr); gap: clamp(16px, 3vw, 40px); padding: clamp(56px, 7vw, 96px) var(--g); border-top: 1px solid var(--nu-cream-line); }
.bxb-num__item { display: flex; flex-direction: column; gap: 8px; }
.bxb-num__n { color: var(--nu-blue-text); font-size: clamp(44px, 5vw, 72px); font-weight: 800; letter-spacing: -0.05em; line-height: 1; font-variant-numeric: tabular-nums; }
.bxb-num__r { color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.4; }

/* ——— segurança ——— */
.bxb-seg { scroll-margin-top: calc(var(--nuh-h, 72px) + 24px); padding: clamp(72px, 9vw, 128px) var(--g); background: var(--nu-navy); }
.bxb-seg__lista { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(20px, 3vw, 48px); margin: clamp(40px, 5vw, 64px) 0 0; padding: 0; list-style: none; }
.bxb-seg__lista li { display: flex; flex-direction: column; gap: 8px; padding-top: 20px; border-top: 1px solid var(--nu-cream-text-18); }
.bxb-seg__lista b { color: var(--nu-cream-text); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.035em; line-height: 1.1; }
.bxb-seg__lista span { color: var(--nu-cream-text-70); font-size: var(--nu-fs-md); font-weight: 500; }

:deep(.rbct__titulo) { font-weight: 800; letter-spacing: -0.05em; }

@media (max-width: 1100px) {
  .bxb-hero { grid-template-columns: 1fr; padding-right: var(--g); }
  .bxb-hero__palco { min-height: 0; display: flex; flex-direction: column; gap: 16px; }
  .bxb-hero__painel { display: none; }
  .bxb-hero__assist { position: relative; left: auto; top: auto; width: min(420px, 100%); margin: 0 auto; }
  .bxb-hero__eti { display: none; }
}
@media (max-width: 900px) {
  .bxb-linha, .bxb-linha--inversa { grid-template-columns: 1fr; }
  .bxb-linha--inversa .bxb-linha__texto { order: 0; }
  .bxb-num { grid-template-columns: 1fr 1fr; }
  .bxb-seg__lista { grid-template-columns: 1fr; }
}
@media (max-width: 560px) {
  .bxb-hero__acao, .bxb__cta { align-self: stretch; }
  .bxb-linha__tela { padding: 16px; border-radius: var(--nu-r-card); }
  .bxb-linha__tela--leque { padding: 18px 14px; }
}
</style>
