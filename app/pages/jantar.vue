<script setup lang="ts">
/**
 * Redentia Wealth Intelligence Dinner — /jantar.
 *
 * Fatos travados: 10 cadeiras, uma mesa, São Paulo, dezembro (data a
 * combinar), conversa de 20 minutos, R$ 600 só depois da aprovação.
 * Sem formulário e sem número inventado. O texto público não atribui
 * o jantar a uma pessoa. As fotos são natureza-morta, imagem ilustrativa.
 * Cada “Entrar na fila” abre o WhatsApp, numa aba nova.
 */
import { jsonLdJantar } from '~/utils/jsonld-paginas'

const fila = 'https://wa.me/5511951495841?text=Oi%20Andr%C3%A9%2C%20quero%20saber%20mais%20sobre%20o%20Redentia%20Wealth%20Intelligence%20Dinner'

const descricao = 'Mesa fechada em São Paulo, dezembro, data a combinar. 10 cadeiras, uma mesa, nenhuma palestra. Convite sob curadoria. Jantar a R$ 600, só após a aprovação.'

definePageMeta({ layout: 'jantar' })

usePageSeo({
  title: 'Redentia Wealth Intelligence Dinner',
  description: descricao,
  path: '/jantar',
  structuredData: jsonLdJantar,
})
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

const curadoria = [
  { id: 'operacao', titulo: 'Operação', texto: 'Você já corre assessoria, family office, banco ou gestora.', linha: '' },
  { id: 'decisao', titulo: 'Decisão', texto: 'Você é sócio, diretor ou C\u2011level.', linha: 'A mesa é para quem constrói, não para quem está começando.' },
  { id: 'troca', titulo: 'Troca', texto: 'Você chega para somar, não para vender.', linha: '' },
]

const fotos = [
  { src: '/img/jantar/mesa-posta.webp', alt: 'Mesa posta em restaurante, imagem ilustrativa', encaixe: 'a' },
  { src: '/img/jantar/pratos.webp', alt: 'Pratos de alta gastronomia, imagem ilustrativa', encaixe: 'b' },
  { src: '/img/jantar/vinho.webp', alt: 'Vinho sendo servido, imagem ilustrativa', encaixe: 'c' },
  { src: '/img/jantar/tacas.webp', alt: 'Taças e talheres, imagem ilustrativa', encaixe: 'd' },
]
</script>

<template>
  <div class="jt">
    <div class="jt__ticker">
      <span class="jt__diamond" aria-hidden="true" />
      <p class="jt__ticker-frase">Mesa fechada. Convite sob curadoria. Conversa entre quem decide. Poucas cadeiras, nenhuma por acaso.</p>
      <a class="jt__ticker-cta" :href="fila" target="_blank" rel="noopener noreferrer">Entrar na fila →</a>
    </div>

    <section class="jt__hero" aria-labelledby="jt-hero-titulo">
      <div class="jt__hero-grid">
        <div>
          <h1 id="jt-hero-titulo">O jantar dos <span class="jt__em">CEOs</span> de assessorias, family offices e gestoras.</h1>
          <p class="jt__apoio">A próxima mesa já está posta. Reserve sua cadeira.</p>
          <p class="jt__lead">
            Entre na fila e sente com quem está construindo o wealth no Brasil. A aprovação é por curadoria; a data vem depois dela. São Paulo · dezembro, data a combinar.
          </p>
          <ul class="jt__list">
            <li v-for="item in criterios" :key="item">
              <span class="jt__ok" aria-hidden="true">✓</span>
              <span>{{ item }}</span>
            </li>
          </ul>
          <a class="jt__pill" :href="fila" target="_blank" rel="noopener noreferrer">
            Entrar na fila
            <span aria-hidden="true">→</span>
          </a>
        </div>
        <div>
          <div class="jt__mosaic">
            <figure v-for="foto in fotos" :key="foto.src" :class="`jt__mosaic-${foto.encaixe}`">
              <img :src="foto.src" :alt="foto.alt" width="960" height="720" decoding="async">
            </figure>
          </div>
          <p class="jt__nota">Imagem ilustrativa.</p>
        </div>
      </div>
    </section>

    <section id="curadoria" class="jt__sec" aria-labelledby="jt-curadoria-titulo">
      <div class="jt__split">
        <div>
          <p class="jt__kicker">Curadoria</p>
          <h2 id="jt-curadoria-titulo">Nem todo mundo senta nesta mesa.</h2>
        </div>
        <p class="jt__aside">A cadeira não se compra. Se conquista pela trajetória.</p>
      </div>
      <div class="jt__cols">
        <article v-for="card in curadoria" :key="card.id" class="jt__col">
          <h3>{{ card.titulo }}</h3>
          <p class="jt__col-big">{{ card.texto }}</p>
          <p v-if="card.linha" class="jt__col-small">{{ card.linha }}</p>
        </article>
      </div>
    </section>

    <section id="mesa" class="jt__sec" aria-labelledby="jt-mesa-titulo">
      <div class="jt__split">
        <div>
          <p class="jt__kicker">Redentia</p>
          <h2 id="jt-mesa-titulo">Não é evento. É uma mesa fechada.</h2>
        </div>
        <p class="jt__aside">
          O que acontece ao redor da mesa é o que importa: conversa franca sobre IA no wealth, operação, consolidação patrimonial e o que vem pela frente. Sem palco, sem crachá, sem apresentação de slides.
        </p>
      </div>
      <ul class="jt__faixa">
        <li v-for="foto in fotos.slice(0, 3)" :key="`faixa-${foto.src}`">
          <img :src="foto.src" :alt="foto.alt" width="960" height="720" loading="lazy" decoding="async">
        </li>
      </ul>
      <p class="jt__nota">Imagem ilustrativa.</p>
    </section>

    <section class="jt__fecho" aria-labelledby="jt-fecho-titulo">
      <p class="jt__meta">São Paulo · dezembro</p>
      <h2 id="jt-fecho-titulo">Reserve sua cadeira.</h2>
      <p class="jt__lead">Entre na fila. A aprovação é por curadoria; a data vem depois dela.</p>
      <a class="jt__pill" :href="fila" target="_blank" rel="noopener noreferrer">
        Entrar na fila
        <span aria-hidden="true">→</span>
      </a>
      <p class="jt__fine">
        10 cadeiras, uma mesa. Conversa de 20 minutos. Jantar completo, R$&nbsp;600, pago somente após a aprovação.
      </p>
    </section>
  </div>
</template>

<style scoped>
.jt {
  --jt-navy: #0c1524;
  --jt-blue: #2f6aff;
  --jt-cream: #f5f1ea;
  --jt-muted: rgba(245, 241, 234, 0.62);
  --jt-line: rgba(245, 241, 234, 0.14);
  color: var(--jt-cream);
  font-family: var(--nu-font);
  font-weight: 500;
  line-height: 1.5;
}
.jt ::selection { background: var(--jt-blue); color: #fff; }

.jt__ticker {
  background: var(--jt-blue);
  color: #fff;
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 24px;
  font-size: 13.5px;
  font-weight: 500;
}
.jt__diamond {
  width: 7px;
  height: 7px;
  background: #fff;
  transform: rotate(45deg);
  flex: 0 0 7px;
}
.jt__ticker-frase { margin: 0; }
.jt__ticker-cta { color: #fff; font-weight: 700; white-space: nowrap; }
.jt__ticker-cta:hover,
.jt__ticker-cta:focus-visible { color: #fff; text-decoration: underline; }

.jt__hero,
.jt__sec,
.jt__fecho {
  width: min(1120px, calc(100% - 80px));
  margin: 0 auto;
}
.jt__hero { padding: 88px 0 100px; }
.jt__hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
}
.jt h1,
.jt h2 {
  margin: 0;
  font-family: var(--nu-font);
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 1.04;
}
.jt h1 { font-size: 56px; max-width: 14ch; }
.jt__em { color: var(--jt-blue); }
.jt__apoio {
  margin: 22px 0 0;
  max-width: 22ch;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.3;
}
.jt__lead {
  margin: 18px 0 0;
  max-width: 42ch;
  font-size: 16px;
  line-height: 1.55;
  color: var(--jt-muted);
}
.jt__list {
  list-style: none;
  margin: 28px 0 0;
  padding: 22px 0 0;
  border-top: 1px solid var(--jt-line);
  display: grid;
  gap: 10px;
}
.jt__list li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  font-size: 15px;
  line-height: 1.45;
  color: rgba(245, 241, 234, 0.88);
}
.jt__ok { color: var(--jt-blue); font-weight: 700; line-height: 1.45; }
.jt__pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 32px;
  background: #f5f1ea;
  color: #0c1524;
  border-radius: 999px;
  padding: 11px 20px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.jt__pill:hover,
.jt__pill:focus-visible { background: #fff; color: #0c1524; }
.jt a:focus-visible { outline: 2px solid var(--jt-cream); outline-offset: 3px; }
.jt__pill:focus-visible { outline-color: var(--jt-blue); }

.jt__mosaic {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.jt__mosaic figure { margin: 0; overflow: hidden; border-radius: 6px; }
.jt__mosaic img { width: 100%; height: 100%; object-fit: cover; display: block; }
.jt__mosaic-a,
.jt__mosaic-b { height: 210px; }
.jt__mosaic-c,
.jt__mosaic-d { height: 252px; }
.jt__mosaic-d { margin-top: -42px; }
.jt__nota { margin: 16px 0 0; font-size: 12px; color: rgba(245, 241, 234, 0.45); }

.jt__sec { padding: 96px 0; }
.jt__kicker {
  margin: 0 0 14px;
  color: var(--jt-blue);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.jt__split {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 48px;
  align-items: end;
  margin-bottom: 56px;
}
.jt h2 { font-size: 56px; line-height: 1.05; max-width: 14ch; }
.jt__aside {
  margin: 0 0 6px;
  max-width: 38ch;
  font-size: 16px;
  line-height: 1.55;
  color: var(--jt-muted);
}
.jt__cols {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  border-top: 1px solid var(--jt-line);
}
.jt__col { min-width: 0; padding: 28px 28px 8px 0; border-right: 1px solid var(--jt-line); }
.jt__col:last-child { border-right: 0; padding-right: 0; }
.jt__col + .jt__col { padding-left: 28px; }
.jt__col h3 {
  margin: 0 0 10px;
  color: var(--jt-blue);
  font-family: var(--nu-font);
  font-size: 13px;
  font-weight: 600;
}
.jt__col-big {
  margin: 0;
  font-size: 24px;
  line-height: 1.25;
  letter-spacing: -0.03em;
  font-weight: 600;
}
.jt__col-small {
  margin: 10px 0 0;
  font-size: 15px;
  line-height: 1.5;
  color: var(--jt-muted);
}

.jt__faixa {
  list-style: none;
  display: flex;
  gap: 14px;
  margin: 0;
  padding: 0;
}
.jt__faixa li {
  flex: 1 1 0;
  min-width: 0;
  height: 240px;
  overflow: hidden;
  border-radius: 14px;
}
.jt__faixa img { width: 100%; height: 100%; object-fit: cover; display: block; }
.jt__faixa + .jt__nota { margin-top: 14px; font-size: 13px; }

.jt__fecho { padding: 80px 0 120px; text-align: left; }
.jt__meta { margin: 0 0 16px; color: var(--jt-muted); font-size: 14px; }
.jt__fecho h2 { max-width: none; font-size: 64px; }
.jt__fecho .jt__lead { max-width: 46ch; }
.jt__fine {
  margin: 22px 0 0;
  max-width: 36rem;
  color: var(--jt-muted);
  font-size: 15px;
  line-height: 1.5;
}

@media (max-width: 900px) {
  .jt__hero,
  .jt__sec,
  .jt__fecho { width: calc(100% - 40px); }
  .jt__hero { padding: 48px 0 64px; }
  .jt__hero-grid,
  .jt__split,
  .jt__cols { grid-template-columns: 1fr; gap: 28px; }
  .jt h1,
  .jt h2 { font-size: 40px; max-width: none; }
  .jt__fecho h2 { font-size: 40px; }
  .jt__split { margin-bottom: 28px; align-items: start; }
  .jt__mosaic-a,
  .jt__mosaic-b,
  .jt__mosaic-c,
  .jt__mosaic-d { height: 160px; }
  .jt__mosaic-d { margin-top: 0; }
  .jt__col,
  .jt__col + .jt__col {
    padding: 22px 0;
    border-right: 0;
    border-bottom: 1px solid var(--jt-line);
  }
  .jt__col:last-child { border-bottom: 0; }
  .jt__faixa { overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x mandatory; }
  .jt__faixa li { flex: 0 0 78%; height: 210px; scroll-snap-align: start; }
  .jt__sec { padding: 64px 0; }
}
@media (max-width: 720px) {
  .jt__ticker { flex-wrap: wrap; justify-content: flex-start; text-align: left; gap: 8px; }
  .jt__ticker-cta { width: 100%; }
  .jt__pill { width: 100%; justify-content: center; }
}
</style>
