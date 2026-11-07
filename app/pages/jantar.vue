<script setup lang="ts">
/**
 * Redentia Wealth Intelligence Dinner — /jantar (07/11/2026).
 *
 * Fatos travados: 10 cadeiras, uma mesa, São Paulo, dezembro (data a
 * combinar), conversa de 20 minutos, R$ 600 só depois da aprovação.
 * Sem formulário e sem número inventado. O texto público não atribui
 * o jantar a uma pessoa.
 * Cada CTA abre o WhatsApp, numa aba nova.
 *
 * Cor e tipo desta página apenas: fundo #0A0D0C, acento #3DDC97, texto
 * #F2F1EC, título em Noto Serif Display, corpo em Inter. O resto do site
 * segue creme, azul e Plus Jakarta.
 */
const fila = 'https://wa.me/5511951495841?text=Oi%20Andr%C3%A9%2C%20quero%20saber%20mais%20sobre%20o%20Redentia%20Wealth%20Intelligence%20Dinner'

const descricao = 'Mesa fechada em São Paulo, dezembro, data a combinar. 10 cadeiras, uma mesa, nenhuma palestra. Convite sob curadoria. Jantar a R$ 600, só após a aprovação.'

definePageMeta({ layout: 'jantar' })

usePageSeo({
  title: 'Redentia Wealth Intelligence Dinner',
  description: descricao,
  path: '/jantar',
})
// O título já traz a marca. O sufixo global repetiria "Redentia".
useHead({
  titleTemplate: null,
  bodyAttrs: { class: 'pagina-jantar' },
  link: [
    { rel: 'preload', href: '/fonts/noto-serif-display-latin.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
    { rel: 'preload', href: '/fonts/inter-latin.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
  ],
})

const criterios = [
  '10 cadeiras, uma mesa, nenhuma palestra',
  'Sócios, diretores e C-level de assessorias, family offices, bancos e gestoras',
  'Participação mediante conversa de 20 minutos',
  'Jantar completo, R$\u00A0600, pago somente após a aprovação',
]

const painel = [
  { rotulo: 'Lugares', nota: 'todos na mesma mesa', valor: '10' },
  { rotulo: 'Palestras', nota: 'sem palco e sem plateia', valor: 'Nenhuma' },
  { rotulo: 'Onde', nota: '', valor: 'São Paulo' },
  { rotulo: 'Quando', nota: 'data a combinar', valor: 'Dezembro' },
  { rotulo: 'Jantar', nota: 'pago somente após a aprovação', valor: 'R$\u00A0600' },
]

const curadoria = [
  { id: 'operacao', titulo: 'Operação', texto: 'Você já corre assessoria, family office, banco ou gestora.' },
  { id: 'decisao', titulo: 'Decisão', texto: 'Você é sócio, diretor ou C-level. A mesa é para quem constrói, não para quem está começando.' },
  { id: 'troca', titulo: 'Troca', texto: 'Você chega para somar, não para vender.' },
]

const temas = [
  { nome: 'IA no Wealth Management', linha: 'o que já muda no dia a dia' },
  { nome: 'Operação', linha: 'processos, times e escala' },
  { nome: 'Consolidação patrimonial', linha: 'a visão do patrimônio inteiro' },
  { nome: 'Futuro das assessorias', linha: 'o que vem nos próximos anos' },
]
</script>

<template>
  <div class="jt">
    <div class="jt__ticker">
      <p class="jt__ticker-text">
        <span class="jt__gem" aria-hidden="true" />
        <span class="jt__ticker-frase">Mesa fechada. Convite sob curadoria. Conversa entre quem decide. Poucas cadeiras, nenhuma por acaso.</span>
      </p>
      <a class="jt__ticker-cta" :href="fila" target="_blank" rel="noopener noreferrer">
        Entrar na fila
        <span aria-hidden="true">→</span>
      </a>
    </div>

    <section class="jt__hero" aria-labelledby="jt-hero-titulo">
      <div class="jt__hero-grid">
        <div class="jt__hero-copy">
          <p class="jt__brand">
            <span class="jt__mark" aria-hidden="true" />
            <span>Redentia</span>
            <span class="jt__kicker">Edição inaugural</span>
          </p>
          <h1 id="jt-hero-titulo">A próxima mesa já está posta. Reserve sua cadeira.</h1>
          <p class="jt__lead">
            Entre na fila e sente com quem está construindo o wealth no Brasil. A aprovação é por curadoria; a data vem depois dela. São Paulo · dezembro, data a combinar.
          </p>
          <ul class="jt__list">
            <li v-for="item in criterios" :key="item">
              <svg class="jt__check" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
                <path d="M4.5 10.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span>{{ item }}</span>
            </li>
          </ul>
          <a class="jt__cta" :href="fila" target="_blank" rel="noopener noreferrer">
            Entrar na fila
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <aside class="jt__painel" aria-labelledby="jt-formato">
          <h2 id="jt-formato" class="jt__painel-titulo">
            <span class="jt__mark jt__mark--sm" aria-hidden="true" />
            O formato
          </h2>
          <dl class="jt__dl">
            <div v-for="item in painel" :key="item.rotulo" class="jt__row">
              <dt>
                <span class="jt__row-k">{{ item.rotulo }}</span>
                <span v-if="item.nota" class="jt__row-n">{{ item.nota }}</span>
              </dt>
              <dd>{{ item.valor }}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>

    <section id="curadoria" class="jt__bloco" aria-labelledby="jt-curadoria-titulo">
      <p class="jt__eyebrow">Curadoria</p>
      <div class="jt__split">
        <h2 id="jt-curadoria-titulo">Nem todo mundo senta nesta mesa.</h2>
        <p class="jt__lead">A cadeira não se compra. Se conquista pela trajetória.</p>
      </div>
      <div class="jt__cards">
        <article v-for="card in curadoria" :key="card.id" class="jt__card">
          <h3>{{ card.titulo }}</h3>
          <p>{{ card.texto }}</p>
        </article>
      </div>
    </section>

    <section id="mesa" class="jt__bloco jt__bloco--mesa" aria-labelledby="jt-mesa-titulo">
      <div class="jt__split">
        <h2 id="jt-mesa-titulo">Não é evento. É uma mesa fechada.</h2>
        <p class="jt__lead">
          O que acontece ao redor da mesa é o que importa: conversa franca sobre IA no wealth, operação, consolidação patrimonial e o que vem pela frente. Sem palco, sem crachá, sem apresentação de slides.
        </p>
      </div>
      <p class="jt__pauta">Na pauta</p>
      <ul class="jt__temas">
        <li v-for="tema in temas" :key="tema.nome">
          <p class="jt__tema-nome">{{ tema.nome }}</p>
          <p class="jt__tema-linha">{{ tema.linha }}</p>
        </li>
      </ul>
    </section>

    <section class="jt__fecho" aria-labelledby="jt-fecho-titulo">
      <div class="jt__fecho-in">
        <p class="jt__eyebrow">São Paulo · dezembro</p>
        <h2 id="jt-fecho-titulo">Reserve sua cadeira.</h2>
        <p class="jt__lead">Entre na fila. A aprovação é por curadoria; a data vem depois dela.</p>
        <a class="jt__cta" :href="fila" target="_blank" rel="noopener noreferrer">
          Entrar na fila
          <span aria-hidden="true">→</span>
        </a>
        <p class="jt__fine">
          10 cadeiras, uma mesa. Conversa de 20 minutos. Jantar completo, R$&nbsp;600, pago somente após a aprovação.
        </p>
      </div>
    </section>
  </div>
</template>

<style>
/* Latin variável, auto-hospedado. Só esta página usa as famílias. */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url('/fonts/inter-latin.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: 'Noto Serif Display';
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url('/fonts/noto-serif-display-latin.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
body.pagina-jantar { background: #0A0D0C; }
</style>

<style scoped>
.jt {
  --jt-bg: #0A0D0C;
  --jt-ink: #F2F1EC;
  --jt-accent: #3DDC97;
  --jt-muted: rgba(242, 241, 236, 0.74);
  --jt-line: rgba(242, 241, 236, 0.14);
  --jt-card: #121816;
  --jt-serif: 'Noto Serif Display', Georgia, 'Times New Roman', serif;
  --jt-sans: Inter, 'Plus Jakarta Sans', system-ui, sans-serif;
  background: var(--jt-bg);
  color: var(--jt-ink);
  font-family: var(--jt-sans);
  font-weight: 400;
  line-height: 1.5;
  overflow-x: clip;
}
.jt ::selection { background: var(--jt-accent); color: var(--jt-bg); }

.jt__ticker {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px 22px;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(61, 220, 151, 0.45);
  background: #0E1211;
  text-align: center;
}
.jt__ticker-text {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 10px;
  margin: 0;
  min-width: 0;
  max-width: min(920px, 100%);
  color: var(--jt-ink);
  font-size: 13.5px;
  line-height: 1.45;
  letter-spacing: 0.01em;
}
.jt__ticker-frase { min-width: 0; }
.jt__gem,
.jt__mark {
  flex-shrink: 0;
  background: var(--jt-accent);
  -webkit-mask: url('/logo-branca.svg') center / contain no-repeat;
  mask: url('/logo-branca.svg') center / contain no-repeat;
}
.jt__gem { width: 11px; height: 11px; }
.jt__mark { width: 26px; height: 26px; }
.jt__mark--sm { width: 16px; height: 16px; }
.jt__ticker-cta {
  color: var(--jt-accent);
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: 0.01em;
  padding: 6px 2px;
  white-space: nowrap;
}
.jt__ticker-cta:hover,
.jt__ticker-cta:focus-visible { color: var(--jt-accent); text-decoration: underline; text-underline-offset: 3px; }

.jt__hero,
.jt__bloco,
.jt__fecho { padding: clamp(56px, 8vw, 112px) clamp(20px, 4vw, 40px); }
.jt__hero { padding-top: clamp(40px, 6vw, 84px); position: relative; }
.jt__hero::before {
  content: '';
  position: absolute;
  right: max(0px, calc(50% - 720px));
  top: 40px;
  width: min(520px, 46vw);
  height: min(520px, 46vw);
  background: radial-gradient(circle, rgba(61, 220, 151, 0.16), transparent 68%);
  pointer-events: none;
}
.jt__hero-grid,
.jt__split,
.jt__cards,
.jt__temas,
.jt__fecho-in { position: relative; z-index: 1; }
.jt__hero-grid,
.jt__fecho-in,
.jt__bloco > * { max-width: 1180px; margin-left: auto; margin-right: auto; }

.jt__hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(280px, 0.88fr);
  gap: clamp(32px, 4vw, 72px);
  align-items: center;
}
.jt__brand {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 12px;
  margin: 0 0 22px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.jt__kicker {
  margin-left: 4px;
  padding: 4px 10px;
  border: 1px solid rgba(61, 220, 151, 0.55);
  border-radius: 999px;
  color: var(--jt-accent);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.jt h1,
.jt h2,
.jt__painel-titulo,
.jt__row dd,
.jt__tema-nome {
  font-family: var(--jt-serif);
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.08;
}
.jt h1 {
  margin: 0;
  font-size: clamp(2.55rem, 4.6vw, 4.5rem);
  max-width: min(14ch, 100%);
}
.jt h2 { margin: 0; font-size: clamp(2rem, 3.6vw, 3.35rem); }
.jt__lead {
  margin: 22px 0 0;
  max-width: 46rem;
  color: var(--jt-muted);
  font-size: clamp(1.02rem, 1.3vw, 1.15rem);
  line-height: 1.55;
}
.jt__list {
  list-style: none;
  margin: 28px 0 0;
  padding: 0;
  display: grid;
  gap: 14px;
}
.jt__list li {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  font-size: 1.02rem;
  line-height: 1.4;
}
.jt__check { color: var(--jt-accent); margin-top: 1px; }
.jt__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 32px;
  min-height: 52px;
  padding: 14px 26px;
  border-radius: 999px;
  background: var(--jt-accent);
  color: var(--jt-bg);
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1;
}
.jt__cta:hover,
.jt__cta:focus-visible { background: #62e4ad; color: var(--jt-bg); }
.jt a:focus-visible {
  outline: 2px solid var(--jt-accent);
  outline-offset: 3px;
}
.jt__cta:focus-visible { outline-color: var(--jt-ink); }

.jt__painel {
  background: var(--jt-card);
  border: 1px solid rgba(61, 220, 151, 0.38);
  border-radius: 28px;
  padding: clamp(22px, 3vw, 32px);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
}
.jt__painel-titulo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 8px;
  font-size: 1.35rem;
}
.jt__dl { margin: 0; }
.jt__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px 18px;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid var(--jt-line);
}
.jt__row dt { margin: 0; min-width: 0; }
.jt__row-k { display: block; font-size: 1rem; font-weight: 600; }
.jt__row-n { display: block; margin-top: 2px; color: var(--jt-muted); font-size: 0.92rem; line-height: 1.35; }
.jt__row dd {
  margin: 0;
  font-size: clamp(1.7rem, 2.2vw, 2.25rem);
  text-align: right;
  white-space: nowrap;
}

.jt__bloco { border-top: 1px solid var(--jt-line); }
.jt__eyebrow {
  margin: 0 0 16px;
  color: var(--jt-accent);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.jt__split {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: clamp(20px, 4vw, 56px);
  align-items: end;
}
.jt__split .jt__lead { margin-top: 0; }
.jt__cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: clamp(36px, 5vw, 56px);
}
.jt__card {
  margin: 0;
  padding: 26px 24px 28px;
  background: var(--jt-card);
  border: 1px solid var(--jt-line);
  border-top: 2px solid var(--jt-accent);
  border-radius: 18px;
}
.jt__card h3 {
  margin: 0;
  font-family: var(--jt-serif);
  font-size: 1.7rem;
  font-weight: 500;
  letter-spacing: -0.02em;
}
.jt__card p {
  margin: 12px 0 0;
  color: var(--jt-muted);
  font-size: 1.02rem;
  line-height: 1.5;
}
.jt__pauta {
  margin: clamp(36px, 5vw, 52px) 0 0;
  color: var(--jt-accent);
  font-family: var(--jt-sans);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.jt__temas {
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid var(--jt-line);
}
.jt__temas li {
  min-width: 0;
  padding: 22px 28px 22px 0;
  border-bottom: 1px solid var(--jt-line);
}
.jt__temas li:nth-child(odd) {
  padding-right: 32px;
  border-right: 1px solid var(--jt-line);
}
.jt__temas li:nth-child(even) { padding-left: 32px; padding-right: 0; }
.jt__tema-nome { margin: 0; font-size: clamp(1.35rem, 2vw, 1.7rem); }
.jt__tema-linha { margin: 6px 0 0; color: var(--jt-muted); font-size: 0.98rem; }

.jt__fecho { border-top: 1px solid var(--jt-line); text-align: center; }
.jt__fecho-in { max-width: 720px; }
.jt__fecho .jt__lead { margin-left: auto; margin-right: auto; }
.jt__fecho .jt__cta { margin-top: 28px; }
.jt__fine {
  margin: 22px auto 0;
  max-width: 36rem;
  color: var(--jt-muted);
  font-size: 0.95rem;
  line-height: 1.5;
}

@media (max-width: 960px) {
  .jt__hero::before { display: none; }
  .jt__hero-grid,
  .jt__split,
  .jt__cards { grid-template-columns: 1fr; }
  .jt__split { align-items: start; }
  .jt h1 { max-width: 16ch; }
  .jt__painel { max-width: 560px; }
}
@media (max-width: 760px) {
  .jt__ticker-text { font-size: 13px; text-align: left; }
  .jt__cta { width: 100%; }
  .jt__temas { grid-template-columns: 1fr; }
  .jt__temas li,
  .jt__temas li:nth-child(odd),
  .jt__temas li:nth-child(even) {
    padding: 20px 0;
    border-right: 0;
  }
  .jt__card h3 { font-size: 1.5rem; }
}
</style>
