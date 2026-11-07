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
 * Uma página só, navy contínuo. Azul só como acento. O cartão de fatos
 * é creme. Plus Jakarta, a fonte do site. O header claro é o do site.
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
  { id: 'decisao', titulo: 'Decisão', texto: 'Você é sócio, diretor ou C\u2011level. A mesa é para quem constrói, não para quem está começando.' },
  { id: 'troca', titulo: 'Troca', texto: 'Você chega para somar, não para vender.' },
]

const fotos = [
  { src: '/img/jantar/mesa-posta.webp', alt: 'Mesa posta em restaurante, imagem ilustrativa' },
  { src: '/img/jantar/pratos.webp', alt: 'Pratos servidos, imagem ilustrativa' },
  { src: '/img/jantar/vinho.webp', alt: 'Vinho sendo servido em uma taça, imagem ilustrativa' },
  { src: '/img/jantar/tacas.webp', alt: 'Taças de cristal e talheres sobre linho, imagem ilustrativa' },
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
        <img src="/logo-branca.svg" alt="" width="12" height="12" class="jt__gem">
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
          <h2 id="jt-formato" class="jt__painel-titulo">O formato</h2>
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

    <section id="curadoria" class="jt__sec" aria-labelledby="jt-curadoria-titulo">
      <p class="jt__eyebrow">Curadoria</p>
      <div class="jt__split">
        <h2 id="jt-curadoria-titulo">Nem todo mundo senta nesta mesa.</h2>
        <p class="jt__lead">A cadeira não se compra. Se conquista pela trajetória.</p>
      </div>
      <div class="jt__cols">
        <article v-for="card in curadoria" :key="card.id" class="jt__col">
          <h3>{{ card.titulo }}</h3>
          <p>{{ card.texto }}</p>
        </article>
      </div>
    </section>

    <section id="mesa" class="jt__sec" aria-labelledby="jt-mesa-titulo">
      <div class="jt__split">
        <h2 id="jt-mesa-titulo">Não é evento.<br>É uma mesa fechada.</h2>
        <p class="jt__lead">
          O que acontece ao redor da mesa é o que importa: conversa franca sobre IA no wealth, operação, consolidação patrimonial e o que vem pela frente. Sem palco, sem crachá, sem apresentação de slides.
        </p>
      </div>
      <figure class="jt__galeria">
        <figcaption>Imagem ilustrativa.</figcaption>
        <ul class="jt__fotos">
          <li v-for="foto in fotos" :key="foto.src">
            <img :src="foto.src" :alt="foto.alt" width="960" height="720" loading="lazy" decoding="async">
          </li>
        </ul>
      </figure>
      <p class="jt__eyebrow jt__pauta">Na pauta</p>
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

<style scoped>
.jt {
  --jt-navy: #0c1524;
  --jt-blue: #2f6aff;
  --jt-cream: #f5f1ea;
  --jt-muted: rgba(245, 241, 234, 0.72);
  --jt-line: rgba(245, 241, 234, 0.16);
  background: var(--jt-navy);
  color: var(--jt-cream);
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
  gap: 6px 20px;
  padding: 11px 24px;
  background: var(--jt-blue);
  color: #fff;
  text-align: center;
}
.jt__ticker-text {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 10px;
  margin: 0;
  min-width: 0;
  max-width: min(980px, 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.45;
}
.jt__ticker-frase { min-width: 0; }
.jt__gem { width: 12px; height: 12px; flex-shrink: 0; margin-top: 4px; display: block; }
.jt__ticker-cta {
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.4;
  padding: 4px 2px;
  white-space: nowrap;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.jt__ticker-cta:hover,
.jt__ticker-cta:focus-visible { color: #fff; }

.jt__hero,
.jt__sec,
.jt__fecho {
  padding: clamp(64px, 7.5vw, 104px) clamp(20px, 4vw, 48px);
}
.jt__hero {
  padding-top: clamp(44px, 5vw, 72px);
  padding-bottom: clamp(52px, 6vw, 84px);
}
.jt__hero-grid,
.jt__split,
.jt__cols,
.jt__temas,
.jt__pauta,
.jt__galeria,
.jt__fecho-in {
  max-width: 1160px;
  margin-left: auto;
  margin-right: auto;
}
.jt__hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(300px, 0.85fr);
  gap: clamp(40px, 5vw, 88px);
  align-items: center;
}
.jt h1,
.jt h2 {
  margin: 0;
  font-family: var(--nu-font);
  font-weight: 800;
  letter-spacing: -0.045em;
  line-height: 1.02;
}
.jt h1 {
  max-width: 13em;
  font-size: clamp(2.45rem, 3.9vw, 3.7rem);
}
.jt__em { color: var(--jt-blue); }
.jt__apoio {
  margin: 20px 0 0;
  max-width: 18em;
  color: var(--jt-cream);
  font-size: clamp(1.35rem, 2vw, 1.7rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.25;
}
.jt__lead {
  margin: 22px 0 0;
  max-width: 38rem;
  color: var(--jt-muted);
  font-size: 1.05rem;
  font-weight: 500;
  line-height: 1.6;
}
.jt__list {
  list-style: none;
  margin: 32px 0 0;
  padding: 26px 0 0;
  border-top: 1px solid var(--jt-line);
  display: grid;
  gap: 16px;
}
.jt__list li {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  font-size: 1.02rem;
  font-weight: 500;
  line-height: 1.45;
}
.jt__check { color: var(--jt-blue); margin-top: 2px; }
.jt__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 28px;
  min-height: 54px;
  padding: 15px 28px;
  border-radius: 999px;
  background: #f5f1ea;
  color: #0c1524;
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1;
}
.jt__cta:hover,
.jt__cta:focus-visible { background: #fff; color: #0c1524; }
.jt a:focus-visible {
  outline: 2px solid var(--jt-cream);
  outline-offset: 3px;
}
.jt__cta:focus-visible { outline-color: var(--jt-blue); }

.jt__painel {
  background: var(--jt-cream);
  color: var(--jt-navy);
  border-radius: 28px;
  padding: clamp(28px, 3vw, 40px);
}
.jt__painel-titulo {
  margin: 0 0 6px;
  color: var(--jt-navy);
  font-family: var(--nu-font);
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.2;
}
.jt__dl { margin: 0; }
.jt__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px 20px;
  align-items: center;
  padding: 18px 0;
  border-top: 1px solid rgba(12, 21, 36, 0.1);
}
.jt__row dt { margin: 0; min-width: 0; }
.jt__row-k {
  display: block;
  color: var(--jt-navy);
  font-size: 1rem;
  font-weight: 700;
}
.jt__row-n {
  display: block;
  margin-top: 3px;
  color: rgba(12, 21, 36, 0.62);
  font-size: 0.92rem;
  font-weight: 500;
  line-height: 1.35;
}
.jt__row dd {
  margin: 0;
  color: var(--jt-navy);
  font-family: var(--nu-font);
  font-size: clamp(1.45rem, 1.8vw, 1.85rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.05;
  text-align: right;
  white-space: nowrap;
}

.jt__sec { border-top: 1px solid var(--jt-line); }
.jt__eyebrow {
  margin: 0 0 18px;
  color: var(--jt-blue);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.jt h2 { font-size: clamp(2.4rem, 4.2vw, 3.7rem); max-width: 11em; }
.jt__split {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: clamp(24px, 4vw, 64px);
  align-items: end;
}
.jt__split .jt__lead { margin-top: 0; margin-bottom: 6px; }
.jt__cols {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: clamp(48px, 6vw, 72px);
  border-top: 1px solid var(--jt-line);
}
.jt__col {
  min-width: 0;
  padding: 28px 36px 4px 0;
  border-right: 1px solid var(--jt-line);
}
.jt__col:last-child { border-right: 0; padding-right: 0; }
.jt__col:not(:first-child) { padding-left: 36px; }
.jt__col h3 {
  margin: 0;
  color: var(--jt-blue);
  font-family: var(--nu-font);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.jt__col p {
  margin: 14px 0 0;
  color: var(--jt-cream);
  font-size: clamp(1.2rem, 1.5vw, 1.45rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.3;
}
.jt__galeria { margin: clamp(40px, 5vw, 64px) auto 0; }
.jt__galeria figcaption {
  margin: 0 0 14px;
  color: var(--jt-muted);
  font-size: 0.95rem;
  font-weight: 600;
}
.jt__fotos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.jt__fotos li { min-width: 0; }
.jt__fotos img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 18px;
}
.jt__pauta { margin-top: clamp(56px, 7vw, 88px); }
.jt__temas {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid var(--jt-line);
}
.jt__temas li {
  min-width: 0;
  padding: 22px 32px 22px 0;
  border-bottom: 1px solid var(--jt-line);
}
.jt__temas li:nth-child(odd) { border-right: 1px solid var(--jt-line); padding-right: 32px; }
.jt__temas li:nth-child(even) { padding-left: 32px; }
.jt__tema-nome {
  margin: 0;
  font-size: clamp(1.2rem, 1.6vw, 1.45rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.25;
}
.jt__tema-linha {
  margin: 6px 0 0;
  color: var(--jt-muted);
  font-size: 0.98rem;
  font-weight: 500;
}

.jt__fecho {
  border-top: 1px solid var(--jt-line);
  text-align: center;
}
.jt__fecho-in { max-width: 760px; }
.jt__fecho .jt__eyebrow { margin-bottom: 16px; }
.jt__fecho h2 { max-width: none; font-size: clamp(2.6rem, 5vw, 4rem); }
.jt__fecho .jt__lead { margin-left: auto; margin-right: auto; }
.jt__fecho .jt__cta { margin-top: 32px; }
.jt__fine {
  margin: 22px auto 0;
  max-width: 34rem;
  color: var(--jt-muted);
  font-size: 0.98rem;
  font-weight: 500;
  line-height: 1.55;
}

@media (max-width: 960px) {
  .jt__hero-grid,
  .jt__split,
  .jt__cols { grid-template-columns: 1fr; }
  .jt__split { align-items: start; }
  .jt h1,
  .jt h2,
  .jt__apoio { max-width: none; }
  .jt__col,
  .jt__col:not(:first-child),
  .jt__col:last-child {
    padding: 26px 0;
    border-right: 0;
    border-bottom: 1px solid var(--jt-line);
  }
  .jt__col:last-child { border-bottom: 0; }
}
@media (max-width: 760px) {
  .jt__ticker-text { font-size: 13.5px; }
  .jt__cta { width: 100%; }
  .jt__fotos {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
  }
  .jt__fotos li {
    flex: 0 0 78%;
    scroll-snap-align: start;
  }
  .jt__temas { grid-template-columns: 1fr; }
  .jt__temas li,
  .jt__temas li:nth-child(odd),
  .jt__temas li:nth-child(even) {
    padding: 20px 0;
    border-right: 0;
  }
}
</style>
