<script setup lang="ts">
/**
 * /business, direção 2 (?biz=2, 04/11/2026): A NOITE.
 *
 * Por quê: o produto principal hoje é a simulação de cenários sobre a carteira
 * ("CIO as a Service"), e a página de hoje só a mostra num cartão do scroll.
 * Aqui ela é o momento bonito da página: o escuro do herói da home e do
 * /benchmark-ia, e uma carteira de exemplo de R$ 1 milhão atravessando o
 * cenário estudado "Expansão fiscal pós-2026" em 2.000 caminhos (BizLeque),
 * com o resultado do motor de 04/11/2026 (content/business/exemplo-cenario.ts).
 * A carteira é rotulada como exemplo, o cenário diz de onde vem e a legenda
 * diz o que é do motor (as pontas) e o que é desenho (o trajeto dos fios).
 *
 * O resto vem calmo, no creme e no branco: o que mais a mesa recebe (a pauta,
 * o cliente conectado, o relatório), as três frases de segurança, o plano de
 * hoje (RbProva), o FAQ e o fecho de hoje (RbContato). O H1 é o mesmo da
 * página de hoje; muda o que vem embaixo dele.
 *
 * COPY: o cliente conectado leva "na implantação" (CV-19) e o relatório com a
 * marca é só para family office e gestora: assessor vinculado não envia
 * extrato de posição ao cliente (RCVM 178, art. 25, VII).
 */
import { EXEMPLO_CENARIO as X, choqueTxt, reaisCurto } from '~/content/business/exemplo-cenario'

const MAIS = [
  { quando: 'Antes da reunião', t: 'A conversa já chega pronta.', d: 'O que mudou desde a última conversa e o cenário que vale mostrar.' },
  { quando: 'Com o cliente dentro', t: 'A carteira dele, com o sim dele.', d: 'Ele conecta o banco por Open Finance e revoga quando quiser.', tag: 'na implantação' },
  { quando: 'Family office e gestora', t: 'O relatório com a marca da casa.', d: 'O cenário roda sobre a carteira do cliente, e o relatório sai com o seu nome.', tag: 'na implantação' },
]
const SEGURANCA = [
  { t: 'Só lê.', d: 'Nada compra, vende ou transfere.' },
  { t: 'Cliente só entra com o sim dele.', d: 'Cada leitura fica registrada.' },
  { t: 'A IA é a da sua casa.', d: 'O Claude ou o ChatGPT do escritório.' },
]
const faixa = `${reaisCurto(X.final.p10)} e ${reaisCurto(X.final.p90)}`
const de = reaisCurto(X.final.p10)
const ate = reaisCurto(X.final.p90)
const ctx = {
  leque: {
    id: 'business:leque', tipo: 'simulacao', rotulo: `Carteira de exemplo no cenário ${X.cenario}`,
    texto: `Carteira de exemplo de R$ 1 milhão (${X.posicoes.map((p) => `${p.ticker} ${p.peso}%`).join(', ')}) no cenário estudado ${X.cenario} (${X.choques.map((c) => `${c.nome} ${c.valor}`).join(', ')}), ${X.horizonte}, ${X.caminhos} caminhos, motor da Redentia em ${X.data}: em 80% dos caminhos termina entre ${faixa}, em reais de hoje. Choque por ativo: ${X.posicoes.map((p) => `${p.ticker} ${choqueTxt(p.choque)}`).join(', ')}.`,
  },
  mais: { id: 'business:mais', tipo: 'bloco', rotulo: 'O que a mesa recebe' },
  plano: { id: 'business:plano', tipo: 'bloco', rotulo: 'O plano do Redentia For Business' },
}
</script>

<template>
  <div class="bzn">
    <section id="gargalo" class="bzn-ceu">
      <div class="bzn-ceu__luz" aria-hidden="true" />
      <div class="bzn-ceu__texto">
        <p class="bzn-ceu__produto"><img src="/logo-branca.svg" alt="" width="20" height="20">Redentia For Business</p>
        <h1 class="bzn-ceu__titulo">Consolide a carteira do seu cliente com 1 clique.</h1>
        <p class="bzn-ceu__dek">Depois, desenhe um choque e veja a carteira em 2.000 caminhos, antes da reunião.</p>
        <div class="bzn-ceu__acao">
          <a href="#contato" class="bzn__cta">Agendar 1 hora com a gente</a>
          <span class="bzn-ceu__status">Conexão habilitada escritório a escritório, na implantação.</span>
        </div>
      </div>

      <!-- o momento bonito: a carteira de exemplo atravessando o cenário -->
      <div v-contexto-chat="ctx.leque" class="bzn-palco">
        <div class="bzn-palco__topo">
          <p class="bzn-palco__rot">Carteira de exemplo · R$ 1 milhão · {{ X.horizonte }}</p>
          <ul class="bzn-palco__choques" :aria-label="`Cenário ${X.cenario}`">
            <li class="bzn-palco__cen">{{ X.cenario }}</li>
            <li v-for="c in X.choques" :key="c.nome">{{ c.nome }} <b>{{ c.valor }}</b></li>
          </ul>
        </div>
        <div class="bzn-palco__corpo">
          <ul class="bzn-palco__cart" aria-label="As posições e o choque de cada uma">
            <li v-for="p in X.posicoes" :key="p.ticker">
              <span class="bzn-palco__tk">{{ p.ticker }}</span>
              <span class="bzn-palco__peso">{{ p.peso }}%</span>
              <span class="bzn-palco__ch" :class="p.choque > 0 ? 'bzn-palco__ch--pos' : p.choque < 0 ? 'bzn-palco__ch--neg' : ''">{{ choqueTxt(p.choque) }}</span>
            </li>
          </ul>
          <BizLeque class="bzn-palco__leque" />
        </div>
        <p class="bzn-palco__frase">Em 80% dos caminhos, ela termina entre <b>{{ de }}</b> e <b>{{ ate }}</b>, em reais de hoje.</p>
        <p class="bzn-palco__nota">
          Cenário estudado pela Redentia, com fontes. Motor da Redentia em {{ X.data }}: as pontas são do motor, o trajeto
          dos fios é desenhado. Projeção com premissas abertas, não previsão nem recomendação.
        </p>
      </div>
    </section>

    <section id="divisao" v-contexto-chat="ctx.mais" class="bzn-mais">
      <h2 class="bzn__h2">O assessor decide.<br>A Redentia prepara.</h2>
      <ol class="bzn-mais__lista">
        <li v-for="m in MAIS" :key="m.t" class="bzn-mais__item">
          <span class="bzn-mais__quando">{{ m.quando }}</span>
          <h3 class="bzn-mais__t">{{ m.t }}</h3>
          <p class="bzn-mais__d">{{ m.d }} <span v-if="m.tag" class="bzn-mais__tag">{{ m.tag }}</span></p>
        </li>
      </ol>
      <div id="seguranca" class="bzn-seg">
        <h2 class="bzn-seg__titulo">Seu compliance pergunta. A gente mostra.</h2>
        <ul class="bzn-seg__lista">
          <li v-for="s in SEGURANCA" :key="s.t"><b>{{ s.t }}</b> {{ s.d }}</li>
        </ul>
      </div>
    </section>

    <div v-contexto-chat="ctx.plano"><RbProva /></div>
    <BizFaq />
    <RbContato />
  </div>
</template>

<style scoped>
.bzn { --g: clamp(22px, 5.5vw, 80px); --sombra: 0 0 0 1px rgba(12, 21, 36, .07), 0 30px 70px -28px rgba(12, 21, 36, .42); }
.bzn__cta {
  display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 26px;
  border-radius: var(--nu-r-pill); background: var(--nu-blue); color: var(--nu-white);
  font-size: var(--nu-fs-md); font-weight: 700; box-shadow: var(--nu-home-sombra-botao); transition: background .2s;
}
.bzn__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.bzn__cta:focus-visible { outline: 2px solid var(--nu-white); outline-offset: 3px; }
.bzn__h2 { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 500; letter-spacing: -0.05em; line-height: 1.02; }

/* ——— o céu: o mesmo do herói "A noite" da home ——— */
.bzn-ceu {
  scroll-margin-top: var(--nuh-h, 76px);
  position: relative; isolation: isolate; overflow: hidden;
  display: flex; flex-direction: column; align-items: center;
  padding: clamp(48px, 5.4vw, 80px) var(--g) clamp(56px, 6vw, 96px);
  background: var(--nu-agora-bg); color: var(--nu-agora-texto);
}
.bzn-ceu__luz {
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background:
    radial-gradient(60% 38% at 50% 0%, color-mix(in srgb, var(--nu-blue) 16%, transparent), transparent),
    linear-gradient(180deg, var(--nu-navy) 0%, color-mix(in srgb, var(--nu-navy) 55%, var(--nu-agora-bg)) 46%, var(--nu-agora-bg) 80%);
}
.bzn-ceu__texto { display: flex; flex-direction: column; align-items: center; text-align: center; max-width: 1000px; }
.bzn-ceu__produto { display: inline-flex; align-items: center; gap: 8px; margin: 0; color: var(--nu-agora-texto); font-size: var(--nu-fs-lg); font-weight: 700; letter-spacing: -0.02em; }
.bzn-ceu__titulo { margin: 16px 0 0; max-width: 17ch; color: var(--nu-agora-texto); font-size: clamp(36px, 5vw, 72px); font-weight: 500; letter-spacing: -0.055em; line-height: 1.02; }
.bzn-ceu__dek { margin: 18px 0 0; max-width: 46ch; color: var(--nu-agora-sub); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; }
.bzn-ceu__acao { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: clamp(24px, 2.6vw, 32px); }
.bzn-ceu__status { color: var(--nu-cream-text-55); font-size: var(--nu-fs-sm); font-weight: 500; }
.bzn-ceu__dek, .bzn-ceu__acao { animation: bzn-entra 1s cubic-bezier(.2, .8, .2, 1) backwards; }
.bzn-ceu__dek { animation-delay: .08s; }
.bzn-ceu__acao { animation-delay: .16s; }
@keyframes bzn-entra { from { opacity: 0; filter: blur(8px); transform: translateY(14px); } }

/* ——— o palco: o leque ——— */
.bzn-palco {
  width: min(1120px, 100%); margin-top: clamp(44px, 5vw, 72px);
  padding: clamp(22px, 3vw, 40px); border-radius: var(--nu-r-card-lg);
  background: var(--nu-agora-cartao); box-shadow: 0 0 0 1px var(--nu-agora-linha), 0 40px 120px -40px color-mix(in srgb, var(--nu-blue) 40%, transparent);
  animation: bzn-sobe 1.1s cubic-bezier(.2, .8, .2, 1) .2s backwards;
}
@keyframes bzn-sobe { from { transform: translateY(28px); opacity: 0; } }
.bzn-palco__topo { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 24px; }
.bzn-palco__rot { margin: 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums; }
.bzn-palco__choques { display: flex; flex-wrap: wrap; gap: 8px; margin: 0; padding: 0; list-style: none; }
.bzn-palco__choques li {
  display: inline-flex; align-items: center; gap: 6px; min-height: 32px; padding: 0 12px; border-radius: var(--nu-r-pill);
  background: var(--nu-agora-pilula); color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums;
}
.bzn-palco__choques b { color: var(--nu-agora-texto); font-weight: 700; }
.bzn-palco__choques .bzn-palco__cen { background: var(--nu-agora-texto); color: var(--nu-ink); }
.bzn-palco__corpo { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: clamp(20px, 3vw, 44px); align-items: center; margin-top: clamp(22px, 2.6vw, 32px); }
.bzn-palco__cart { margin: 0; padding: 0; list-style: none; font-variant-numeric: tabular-nums; }
.bzn-palco__cart li { display: grid; grid-template-columns: 1fr auto 64px; gap: 10px; align-items: baseline; padding: 10px 0; border-top: 1px solid var(--nu-agora-linha); }
.bzn-palco__cart li:first-child { border-top: 0; }
.bzn-palco__tk { color: var(--nu-agora-texto); font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap; }
.bzn-palco__peso { color: var(--nu-agora-sub); font-size: var(--nu-fs-dense); font-weight: 500; }
.bzn-palco__ch { color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 700; text-align: right; }
.bzn-palco__ch--pos { color: var(--nu-green-soft); }
.bzn-palco__ch--neg { color: var(--nu-red-soft); }
.bzn-palco__frase { margin: clamp(24px, 3vw, 36px) 0 0; max-width: 30ch; color: var(--nu-agora-sub); font-size: var(--nu-fs-h3); font-weight: 500; letter-spacing: -0.035em; line-height: 1.18; }
.bzn-palco__frase b { color: var(--nu-agora-texto); font-weight: 500; font-variant-numeric: tabular-nums; white-space: nowrap; }
.bzn-palco__nota { margin: 14px 0 0; max-width: 78ch; color: var(--nu-cream-text-45); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.55; }
@media (max-width: 860px) {
  .bzn-palco__corpo { grid-template-columns: 1fr; }
  .bzn-palco__cart { display: grid; grid-template-columns: 1fr 1fr; column-gap: 20px; order: 2; }
  .bzn-palco__cart li:nth-child(2) { border-top: 0; }
}
@media (max-width: 560px) {
  .bzn-ceu__titulo { font-size: clamp(32px, 9vw, 40px); }
  .bzn-ceu__acao, .bzn__cta { align-self: stretch; }
  .bzn-ceu__status { text-align: center; }
  .bzn-palco__cart { grid-template-columns: 1fr; }
  .bzn-palco__cart li:nth-child(2) { border-top: 1px solid var(--nu-agora-linha); }
  .bzn-palco__frase { font-size: var(--nu-fs-2xl); }
}

/* ——— o que mais a mesa recebe, e a segurança ——— */
.bzn-mais { scroll-margin-top: calc(var(--nuh-h, 76px) + 24px); background: var(--nu-cream); padding: clamp(72px, 9vw, 128px) var(--g); }
.bzn-mais__lista { margin: clamp(40px, 5vw, 64px) 0 0; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(16px, 2vw, 24px); }
.bzn-mais__item { padding: clamp(22px, 2.6vw, 30px); border-radius: var(--nu-r-card); background: var(--nu-white); box-shadow: var(--sombra); }
.bzn-mais__quando { color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 700; }
.bzn-mais__t { margin: 10px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 500; letter-spacing: -0.03em; line-height: 1.18; }
.bzn-mais__d { margin: 10px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }
.bzn-mais__tag { display: inline-block; margin-left: 4px; padding: 2px 9px; border-radius: var(--nu-r-pill); background: var(--nu-cream); color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; white-space: nowrap; }
.bzn-seg { scroll-margin-top: calc(var(--nuh-h, 76px) + 24px); display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr); gap: clamp(20px, 4vw, 64px); align-items: start; margin-top: clamp(56px, 7vw, 96px); padding-top: clamp(28px, 3vw, 40px); border-top: 1px solid var(--nu-cream-line); }
.bzn-seg__titulo { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 500; letter-spacing: -0.035em; line-height: 1.12; }
.bzn-seg__lista { margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.bzn-seg__lista li { color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; }
.bzn-seg__lista b { display: block; margin-bottom: 4px; color: var(--nu-ink); font-weight: 700; }
@media (max-width: 960px) {
  .bzn-mais__lista, .bzn-seg, .bzn-seg__lista { grid-template-columns: 1fr; }
}

/* ——— o plano de hoje, no branco e no idioma novo ——— */
.bzn :deep(.rbpv) { background: var(--nu-white); }
.bzn :deep(.rbpv .nsh__title) { font-weight: 500; letter-spacing: -0.05em; }
.bzn :deep(.rbpv__card) { border: 0; border-radius: var(--nu-r-card); box-shadow: var(--sombra); }
.bzn :deep(.rbpv__card--navy) { background: var(--nu-agora-bg); box-shadow: 0 0 0 1px var(--nu-agora-linha), 0 30px 70px -28px rgba(12, 21, 36, .6); }
.bzn :deep(.rbpv__titulo), .bzn :deep(.rbpv__valor) { font-weight: 500; letter-spacing: -0.05em; }
.bzn :deep(.rbpv__cta) { font-weight: 700; }
.bzn :deep(.rbct) { background: var(--nu-white); }
.bzn :deep(.rbct__titulo) { font-weight: 500; letter-spacing: -0.05em; }
.bzn :deep(.rbct__card) { border-radius: var(--nu-r-card); box-shadow: var(--sombra); }

@media (prefers-reduced-motion: reduce) {
  .bzn-ceu__produto, .bzn-ceu__titulo, .bzn-ceu__dek, .bzn-ceu__acao, .bzn-palco { animation: none; }
}
</style>
