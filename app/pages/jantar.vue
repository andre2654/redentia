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
 * Identidade desta página: a campanha v3. Navy #0c1524, azul #2f6aff,
 * creme #f5f1ea, Plus Jakarta Sans. O losango é o logo oficial do site.
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
        <img src="/logo-branca.svg" alt="" width="14" height="14" class="jt__gem">
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
            <img src="/logo-branca.svg" alt="" width="28" height="28" class="jt__mark">
            <span>Redentia</span>
            <span class="jt__kicker">Edição inaugural</span>
          </p>
          <h1 id="jt-hero-titulo">O jantar dos <span class="jt__em">CEOs</span> de assessorias, family offices e gestoras.</h1>
          <p class="jt__apoio">A próxima mesa já está posta. Reserve sua cadeira.</p>
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
            <img src="/logo-azul.svg" alt="" width="18" height="18" class="jt__mark jt__mark--sm">
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

    <section id="curadoria" class="jt__bloco jt__bloco--creme" aria-labelledby="jt-curadoria-titulo">
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

    <section id="mesa" class="jt__bloco jt__bloco--azul" aria-labelledby="jt-mesa-titulo">
      <div class="jt__split">
        <h2 id="jt-mesa-titulo">Não é evento. <span class="jt__em-ink">É uma mesa fechada.</span></h2>
        <p class="jt__lead">
          O que acontece ao redor da mesa é o que importa: conversa franca sobre IA no wealth, operação, consolidação patrimonial e o que vem pela frente. Sem palco, sem crachá, sem apresentação de slides.
        </p>
      </div>
      <div class="jt__pauta-card">
        <p class="jt__pauta">Na pauta</p>
        <ul class="jt__temas">
          <li v-for="tema in temas" :key="tema.nome">
            <p class="jt__tema-nome">{{ tema.nome }}</p>
            <p class="jt__tema-linha">{{ tema.linha }}</p>
          </li>
        </ul>
      </div>
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

<style scoped>
.jt {
  --jt-navy: #0c1524;
  --jt-blue: #2f6aff;
  --jt-cream: #f5f1ea;
  --jt-ink: #f5f1ea;
  --jt-muted: rgba(245, 241, 234, 0.78);
  --jt-line: rgba(245, 241, 234, 0.16);
  --jt-navy-ink: #0c1524;
  --jt-navy-muted: rgba(12, 21, 36, 0.68);
  background: var(--jt-navy);
  color: var(--jt-ink);
  font-family: var(--nu-font);
  font-weight: 500;
  line-height: 1.5;
  overflow-x: clip;
}
.jt ::selection { background: var(--jt-blue); color: #fff; }

.jt__ticker {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px 22px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--jt-line);
  background: var(--jt-navy);
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
}
.jt__ticker-frase { min-width: 0; }
.jt__gem { width: 14px; height: 14px; flex-shrink: 0; margin-top: 3px; display: block; }
.jt__ticker-cta {
  color: var(--jt-ink);
  font-size: 13.5px;
  font-weight: 800;
  line-height: 1.4;
  padding: 6px 2px;
  white-space: nowrap;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.jt__ticker-cta:hover,
.jt__ticker-cta:focus-visible { color: #fff; }

.jt__hero,
.jt__bloco,
.jt__fecho { padding: clamp(56px, 8vw, 112px) clamp(20px, 4vw, 40px); }
.jt__hero {
  padding-top: clamp(36px, 5vw, 72px);
  position: relative;
  background: var(--jt-navy);
}
.jt__hero::before {
  content: '';
  position: absolute;
  right: max(0px, calc(50% - 720px));
  top: 20px;
  width: min(560px, 48vw);
  height: min(560px, 48vw);
  background: radial-gradient(circle, rgba(47, 106, 255, 0.28), transparent 68%);
  pointer-events: none;
}
.jt__hero-grid,
.jt__split,
.jt__cards,
.jt__pauta-card,
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
  font-weight: 700;
  letter-spacing: -0.02em;
}
.jt__mark { width: 28px; height: 28px; display: block; flex-shrink: 0; }
.jt__mark--sm { width: 18px; height: 18px; }
.jt__kicker {
  margin-left: 4px;
  padding: 5px 12px;
  border: 1.5px solid rgba(245, 241, 234, 0.7);
  border-radius: 999px;
  color: var(--jt-cream);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.jt h1,
.jt h2,
.jt__apoio,
.jt__painel-titulo,
.jt__row dd,
.jt__tema-nome,
.jt__card h3 {
  font-family: var(--nu-font);
  letter-spacing: -0.035em;
}
.jt h1 {
  margin: 0;
  max-width: 16em;
  color: var(--jt-cream);
  font-size: clamp(2.15rem, 3.7vw, 3.45rem);
  font-weight: 800;
  line-height: 1.05;
}
.jt__em { color: var(--jt-blue); }
.jt__apoio {
  margin: 18px 0 0;
  max-width: 22em;
  color: var(--jt-cream);
  font-size: clamp(1.25rem, 1.8vw, 1.55rem);
  font-weight: 700;
  line-height: 1.25;
}
.jt h2 {
  margin: 0;
  font-size: clamp(2rem, 3.5vw, 3.15rem);
  font-weight: 800;
  line-height: 1.08;
}
.jt__lead {
  margin: 18px 0 0;
  max-width: 40rem;
  color: var(--jt-muted);
  font-size: clamp(1.02rem, 1.25vw, 1.12rem);
  font-weight: 500;
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
  font-weight: 500;
  line-height: 1.4;
}
.jt__check { color: var(--jt-blue); margin-top: 1px; }
.jt__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 32px;
  min-height: 52px;
  padding: 14px 26px;
  border-radius: 999px;
  background: var(--jt-blue);
  color: #fff;
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1;
}
.jt__cta:hover,
.jt__cta:focus-visible { background: #2258db; color: #fff; }
.jt a:focus-visible {
  outline: 2px solid var(--jt-cream);
  outline-offset: 3px;
}

.jt__painel {
  background: var(--jt-cream);
  color: var(--jt-navy-ink);
  border-radius: 28px;
  padding: clamp(22px, 3vw, 32px);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
}
.jt__painel-titulo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 8px;
  color: var(--jt-navy-ink);
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.2;
}
.jt__dl { margin: 0; }
.jt__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px 18px;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid rgba(12, 21, 36, 0.12);
}
.jt__row dt { margin: 0; min-width: 0; }
.jt__row-k { display: block; font-size: 1rem; font-weight: 700; }
.jt__row-n { display: block; margin-top: 2px; color: var(--jt-navy-muted); font-size: 0.92rem; font-weight: 500; line-height: 1.35; }
.jt__row dd {
  margin: 0;
  color: var(--jt-navy-ink);
  font-size: clamp(1.55rem, 2vw, 2.05rem);
  font-weight: 800;
  line-height: 1.05;
  text-align: right;
  white-space: nowrap;
}

.jt__bloco--creme {
  background: var(--jt-cream);
  color: var(--jt-navy-ink);
}
.jt__bloco--creme .jt__eyebrow { color: var(--jt-blue); }
.jt__bloco--creme .jt__lead { color: var(--jt-navy-muted); }
.jt__bloco--azul {
  background: var(--jt-blue);
  color: #fff;
}
.jt__bloco--azul .jt__lead { color: rgba(255, 255, 255, 0.88); }
.jt__bloco--azul .jt__em-ink { color: var(--jt-navy); }
.jt__eyebrow {
  margin: 0 0 16px;
  color: var(--jt-cream);
  font-size: 12px;
  font-weight: 800;
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
  background: var(--jt-navy);
  color: var(--jt-cream);
  border-radius: 20px;
}
.jt__card h3 {
  margin: 0;
  color: var(--jt-cream);
  font-size: 1.55rem;
  font-weight: 800;
  line-height: 1.15;
}
.jt__card p {
  margin: 12px 0 0;
  color: var(--jt-muted);
  font-size: 1.02rem;
  font-weight: 500;
  line-height: 1.5;
}
.jt__pauta-card {
  margin-top: clamp(36px, 5vw, 56px);
  background: var(--jt-cream);
  color: var(--jt-navy-ink);
  border-radius: 28px;
  padding: clamp(22px, 3vw, 36px);
}
.jt__pauta {
  margin: 0;
  color: var(--jt-blue);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.jt__temas {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.jt__temas li {
  min-width: 0;
  padding: 18px 28px 18px 0;
  border-bottom: 1px solid rgba(12, 21, 36, 0.12);
}
.jt__temas li:nth-child(odd) {
  padding-right: 32px;
  border-right: 1px solid rgba(12, 21, 36, 0.12);
}
.jt__temas li:nth-child(even) { padding-left: 32px; padding-right: 0; }
.jt__tema-nome {
  margin: 0;
  color: var(--jt-navy-ink);
  font-size: clamp(1.25rem, 1.8vw, 1.5rem);
  font-weight: 800;
  line-height: 1.2;
}
.jt__tema-linha {
  margin: 6px 0 0;
  color: var(--jt-navy-muted);
  font-size: 0.98rem;
  font-weight: 500;
}

.jt__fecho {
  background: var(--jt-navy);
  text-align: center;
}
.jt__fecho-in { max-width: 720px; }
.jt__fecho .jt__lead { margin-left: auto; margin-right: auto; }
.jt__fecho .jt__cta { margin-top: 28px; }
.jt__fine {
  margin: 22px auto 0;
  max-width: 36rem;
  color: var(--jt-muted);
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.5;
}

@media (max-width: 960px) {
  .jt__hero::before { display: none; }
  .jt__hero-grid,
  .jt__split,
  .jt__cards { grid-template-columns: 1fr; }
  .jt__split { align-items: start; }
  .jt h1,
  .jt__apoio { max-width: none; }
  .jt__painel { max-width: 560px; }
}
@media (max-width: 760px) {
  .jt__ticker-text { font-size: 13px; }
  .jt__cta { width: 100%; }
  .jt__temas { grid-template-columns: 1fr; }
  .jt__temas li,
  .jt__temas li:nth-child(odd),
  .jt__temas li:nth-child(even) {
    padding: 18px 0;
    border-right: 0;
  }
  .jt__card h3 { font-size: 1.4rem; }
}
</style>
