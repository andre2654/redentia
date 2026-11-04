<script setup lang="ts">
/**
 * /business, direção 3 (?biz=3, 04/11/2026): A DEMO ROLÁVEL.
 *
 * A página é o produto em uso: rolar faz a reunião da Mariana acontecer no
 * assistente da mesa. À esquerda, quatro capítulos curtos (Consolida, Explica,
 * Testa, Entrega); à direita, uma conversa só, alta, com a barra do assistente
 * presa no topo e a caixa de pergunta presa embaixo, e cada turno ao lado do
 * seu capítulo. É a "demo interativa" da Brex levada ao limite: quase nenhum
 * parágrafo, a interface ocupa a página.
 *
 * NADA FICA ESCONDIDO ESPERANDO A ROLAGEM. A conversa inteira está no HTML do
 * servidor, cada turno na sua linha da grade (sem uma segunda cópia para o
 * celular). A rolagem só faz cada turno tocar uma vez quando chega: a carteira
 * consolida, a resposta surge palavra por palavra, a faixa do cenário se abre,
 * o relatório sai (useBizEntrada). Sem JS, numa aba em segundo plano ou com
 * menos movimento, a conversa está lá, pronta. No celular a grade vira uma
 * coluna e cada turno ganha a própria moldura.
 *
 * Dado de exemplo rotulado (a carteira de R$ 1 milhão), o pregão de 03/11/2026
 * e o motor de 04/11/2026 (content/business/exemplo-cenario.ts). O fecho do
 * relatório repete a linha de entrega do roteiro de get_client_report: "Revise
 * antes de enviar: o que chega ao cliente é responsabilidade do escritório."
 */
import { EXEMPLO_PREGAO as P, diaTxt } from '~/content/business/exemplo-cenario'

const t1 = useBizEntrada({ limiar: 0.3 })
const t2 = useBizEntrada({ limiar: 0.4 })
const t3 = useBizEntrada({ limiar: 0.3 })
const t4 = useBizEntrada({ limiar: 0.3 })
const LEITURA = P.porque.leitura

const CAPITULOS = [
  { n: '01', t: 'Consolida.', d: 'O cliente conectou o banco. A carteira chega inteira, com o pregão de ontem.', e: t1 },
  { n: '02', t: 'Explica.', d: 'Por que mexeu, com a notícia, a hora e a leitura da casa.', e: t2 },
  { n: '03', t: 'Testa.', d: 'E se o fiscal piorar? A carteira em 2.000 caminhos, em segundos.', e: t3 },
  { n: '04', t: 'Entrega.', d: 'O relatório sai com a marca da casa, para revisar antes de enviar.', tag: 'na implantação', e: t4 },
] as const

const SEGURANCA = [
  { t: 'Só lê.', d: 'Nada compra, vende ou transfere.' },
  { t: 'Cliente só entra com o sim dele.', d: 'Cada leitura fica registrada.' },
  { t: 'A IA é a da sua casa.', d: 'O Claude ou o ChatGPT do escritório.' },
]
const ctx = (id: string, rotulo: string) => ({ id: `business:${id}`, tipo: 'bloco', rotulo })
</script>

<template>
  <div class="bxm">
    <section id="gargalo" class="bxm-hero">
      <div class="bxm-hero__luz" aria-hidden="true" />
      <p class="bxm-hero__produto"><img src="/logo-branca.svg" alt="" width="20" height="20">Redentia For Business</p>
      <h1 class="bxm-hero__titulo">Consolide a carteira do seu cliente com 1 clique.</h1>
      <p class="bxm-hero__dek">Role a página: a reunião acontece no assistente da sua mesa.</p>
      <div class="bxm-hero__acao">
        <a href="#contato" class="bxm__cta">Agendar 1 hora com a gente</a>
        <span class="bxm-hero__status">Conexão habilitada escritório a escritório, na implantação.</span>
      </div>
      <span class="bxm-hero__seta" aria-hidden="true" />
    </section>

    <section id="produto" class="bxm-demo" aria-label="A reunião, no assistente da mesa">
      <div class="bxm-demo__grade">
        <!-- a moldura da conversa: o fundo, a barra presa no topo e a caixa presa embaixo -->
        <div class="bxm-demo__fundo" aria-hidden="true" />
        <div class="bxm-demo__cromo" aria-hidden="true">
          <div class="bxm-demo__barra">
            <span class="bxm-demo__pontos"><i /><i /><i /></span>
            <span class="bxm-demo__quem"><img src="/logo-azul.svg" alt="" width="14" height="14">Assistente da mesa</span>
            <span class="bxm-demo__rot">Exemplo</span>
          </div>
          <div class="bxm-demo__vao" />
          <div class="bxm-demo__composer"><span>Pergunte ao assistente do escritório</span><i /></div>
        </div>

        <template v-for="(c, i) in CAPITULOS" :key="c.n">
          <div v-contexto-chat="ctx(`demo-${c.n}`, c.t)" class="bxm-cap" :style="{ gridRow: i + 1 }">
            <div class="bxm-cap__in">
              <span class="bxm-cap__n">{{ c.n }}</span>
              <h2 class="bxm-cap__t">{{ c.t }}</h2>
              <p class="bxm-cap__d">{{ c.d }} <span v-if="'tag' in c" class="bxm__tag">{{ c.tag }}</span></p>
            </div>
          </div>
          <div :ref="(el) => (c.e.el.value = el as HTMLElement)" class="bxm-turno" :class="{ 'bxm-turno--primeiro': i === 0 }" :style="{ gridRow: i + 1 }">
            <BizConversa v-if="c.n === '01'" pergunta="Consolida a carteira da Mariana." :tocar="c.e.tocar.value">
              <BizTelaCarteira :linhas="4" :tocar="c.e.tocar.value" />
            </BizConversa>
            <BizConversa
              v-else-if="c.n === '02'" :pergunta="`Por que a PETR4 caiu ${diaTxt(P.porque.variacao)} ontem?`" :resposta="LEITURA"
              :fonte="`Leitura da Redentia · ${P.porque.fonte}, ${P.porque.hora}`" :tocar="c.e.tocar.value"
            />
            <BizConversa v-else-if="c.n === '03'" pergunta="E se o fiscal piorar depois da eleição?" :tocar="c.e.tocar.value">
              <BizTelaCenario :pesos="2" :tocar="c.e.tocar.value" />
            </BizConversa>
            <BizConversa
              v-else pergunta="Monta o relatório para a reunião de quinta."
              resposta="Relatório pronto, no modelo Carta do private. Revise antes de enviar: o que chega ao cliente é responsabilidade do escritório."
              :tocar="c.e.tocar.value"
            >
              <div class="bxm-turno__folha"><BizTelaRelatorio :tocar="c.e.tocar.value" /></div>
            </BizConversa>
          </div>
        </template>
      </div>
    </section>

    <section id="seguranca" v-contexto-chat="ctx('seguranca', 'Segurança do Redentia For Business')" class="bxm-seg">
      <h2 class="bxm__h2">Seu compliance pergunta.<br>A gente mostra.</h2>
      <ul class="bxm-seg__lista">
        <li v-for="s in SEGURANCA" :key="s.t"><b>{{ s.t }}</b><span>{{ s.d }}</span></li>
      </ul>
    </section>

    <BizPlano />
    <BizFaq />
    <RbContato />
  </div>
</template>

<style scoped>
.bxm { --g: clamp(22px, 5.5vw, 80px); --topo: calc(var(--nuh-h, 72px) + 20px); background: var(--nu-white); }
.bxm__cta {
  display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 26px;
  border-radius: var(--nu-r-pill); background: var(--nu-blue); color: var(--nu-white);
  font-size: var(--nu-fs-md); font-weight: 700; box-shadow: var(--nu-home-sombra-botao); transition: background .2s;
}
.bxm__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.bxm__cta:focus-visible { outline: 2px solid var(--nu-white); outline-offset: 3px; }
.bxm__h2 { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.05em; line-height: 1.02; }
.bxm__tag { display: inline-block; margin-left: 4px; padding: 2px 9px; border-radius: var(--nu-r-pill); background: var(--nu-agora-pilula); color: var(--nu-agora-sub); font-size: var(--nu-fs-xs); font-weight: 700; vertical-align: 2px; white-space: nowrap; }

/* ——— hero ——— */
.bxm-hero {
  position: relative; isolation: isolate; overflow: hidden;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: clamp(64px, 8vw, 128px) var(--g) clamp(56px, 6vw, 88px);
  background: var(--nu-agora-bg); color: var(--nu-agora-texto);
}
.bxm-hero__luz {
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: radial-gradient(60% 50% at 50% 0%, color-mix(in srgb, var(--nu-blue) 22%, transparent), transparent), linear-gradient(180deg, var(--nu-navy), var(--nu-agora-bg) 75%);
}
.bxm-hero__produto { display: inline-flex; align-items: center; gap: 8px; margin: 0; color: var(--nu-agora-texto); font-size: var(--nu-fs-lg); font-weight: 700; letter-spacing: -0.02em; }
.bxm-hero__titulo { margin: 18px 0 0; max-width: 16ch; color: var(--nu-agora-texto); font-size: clamp(40px, 5.4vw, 80px); font-weight: 800; letter-spacing: -0.055em; line-height: 1; }
.bxm-hero__dek { margin: 20px 0 0; max-width: 40ch; color: var(--nu-agora-sub); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; }
.bxm-hero__acao { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 30px; }
.bxm-hero__status { color: var(--nu-cream-text-55); font-size: var(--nu-fs-sm); font-weight: 500; }
.bxm-hero__seta { width: 2px; height: 56px; margin-top: 44px; border-radius: 1px; background: linear-gradient(180deg, var(--nu-cream-text-45), transparent); }

/* ——— a demo ——— */
.bxm-demo { scroll-margin-top: var(--nuh-h, 72px); padding: 0 var(--g) clamp(64px, 8vw, 112px); background: var(--nu-agora-bg); }
.bxm-demo__grade { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); column-gap: clamp(32px, 5vw, 88px); max-width: 1240px; margin: 0 auto; }
.bxm-demo__fundo, .bxm-demo__cromo { grid-column: 2; grid-row: 1 / span 4; }
.bxm-demo__fundo { border-radius: var(--nu-r-card-lg); background: var(--nu-white); box-shadow: 0 0 0 1px var(--nu-white-14), 0 60px 140px -50px color-mix(in srgb, var(--nu-blue) 55%, transparent); }
.bxm-demo__cromo { position: relative; z-index: 3; display: flex; flex-direction: column; pointer-events: none; }
.bxm-demo__barra {
  position: sticky; top: var(--nuh-h, 72px); display: flex; align-items: center; gap: 12px; height: 48px; padding: 0 18px;
  border-radius: var(--nu-r-card-lg) var(--nu-r-card-lg) 0 0; background: color-mix(in srgb, var(--nu-tela-bloco) 92%, transparent);
  -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); border-bottom: 1px solid var(--nu-tela-linha);
}
.bxm-demo__pontos { display: flex; gap: 6px; }
.bxm-demo__pontos i { width: 10px; height: 10px; border-radius: 50%; background: var(--nu-tela-linha); }
.bxm-demo__quem { flex: 1; display: inline-flex; align-items: center; gap: 7px; color: var(--nu-ink); font-size: var(--nu-fs-dense); font-weight: 700; }
.bxm-demo__rot { padding: 2px 9px; border-radius: var(--nu-r-pill); background: var(--nu-white); color: var(--nu-tela-apoio); font-size: var(--nu-fs-xs); font-weight: 700; box-shadow: inset 0 0 0 1px var(--nu-tela-linha); }
.bxm-demo__vao { flex: 1; }
.bxm-demo__composer {
  position: sticky; bottom: 20px; display: flex; align-items: center; gap: 12px; height: 50px; margin: 0 18px 18px; padding: 0 8px 0 18px;
  border-radius: var(--nu-r-pill); background: var(--nu-tela-bloco); box-shadow: 0 10px 30px -12px rgba(12, 21, 36, .3);
  color: var(--nu-tela-nota); font-size: var(--nu-fs-sm); font-weight: 500;
}
.bxm-demo__composer span { flex: 1; }
.bxm-demo__composer i { width: 32px; height: 32px; border-radius: 50%; background: var(--nu-blue); }

.bxm-cap { grid-column: 1; }
.bxm-cap__in { position: sticky; top: calc(50vh - 60px); padding: 40px 0; }
.bxm-cap__n { color: var(--nu-blue-soft); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.bxm-cap__t { margin: 10px 0 0; color: var(--nu-agora-texto); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.05em; line-height: 1; }
.bxm-cap__d { margin: 16px 0 0; max-width: 30ch; color: var(--nu-agora-sub); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.5; }
.bxm-turno { grid-column: 2; position: relative; z-index: 2; align-self: start; padding: 48px clamp(16px, 3vw, 48px); min-height: 70vh; }
.bxm-turno :deep(.bcv) { max-width: 560px; margin: 0 auto; }
.bxm-turno__folha { padding: 16px; background: var(--nu-tela-bloco); }
.bxm-turno--primeiro { padding-top: 96px; }
.bxm-turno:last-of-type { padding-bottom: 110px; }

/* ——— segurança ——— */
.bxm-seg { scroll-margin-top: calc(var(--nuh-h, 72px) + 24px); padding: clamp(72px, 9vw, 128px) var(--g); background: var(--nu-white); }
.bxm-seg__lista { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(20px, 3vw, 48px); margin: clamp(40px, 5vw, 64px) 0 0; padding: 0; list-style: none; }
.bxm-seg__lista li { display: flex; flex-direction: column; gap: 8px; padding-top: 20px; border-top: 2px solid var(--nu-ink); }
.bxm-seg__lista b { color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.035em; line-height: 1.1; }
.bxm-seg__lista span { color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; }
:deep(.bzp__titulo) { font-weight: 800; }
:deep(.rbct__titulo) { font-weight: 800; letter-spacing: -0.05em; }

@media (max-width: 960px) {
  .bxm-demo { padding-top: 8px; }
  .bxm-demo__grade { grid-template-columns: 1fr; }
  .bxm-demo__fundo, .bxm-demo__cromo { display: none; }
  .bxm-cap, .bxm-turno { grid-column: 1; grid-row: auto !important; }
  .bxm-cap { min-height: 0; }
  .bxm-cap__in { position: static; padding: 48px 0 20px; }
  .bxm-turno { padding: 0; min-height: 0; border-radius: var(--nu-r-card); background: var(--nu-white); overflow: hidden; }
  .bxm-turno--primeiro { padding-top: 0; }
  .bxm-seg__lista { grid-template-columns: 1fr; }
}
</style>
