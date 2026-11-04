<script setup lang="ts">
/**
 * O FAQ das três direções da /business (?biz=1|2|3), no idioma do FAQ da
 * /teses ("Ficou com alguma dúvida?", pages/teses.vue): banda creme, o título
 * em peso leve à esquerda e as perguntas em cartões brancos à direita.
 *
 * Os 30 itens de content/business/faq.ts continuam em grupos, que viram os
 * chips da barra da /teses (TesesGrade) em vez das abas verticais do RbFaq.
 * Tudo segue no HTML do servidor: cada grupo é um painel com v-show, e o
 * NuFaqAccordion também usa v-show nas respostas. O JSON-LD FAQPage sai UMA
 * vez, com as 30 na ordem do arquivo, igual ao RbFaq (o mesmo bloco que o
 * Google lê hoje).
 *
 * `tom="escuro"` é o da direção 2: a banda vira navy e os cartões ficam
 * brancos por cima.
 */
import { RB_FAQ } from '~/content/business/faq'

withDefaults(defineProps<{ tom?: 'creme' | 'escuro' }>(), { tom: 'creme' })

useFaqSchema(RB_FAQ.flatMap((g) => g.itens))

const ativo = ref(0)
const uid = useId()
const CONTEXTO = { id: 'business:faq', tipo: 'faq', rotulo: 'Perguntas do Redentia For Business' }
</script>

<template>
  <section id="faq" v-contexto-chat="CONTEXTO" class="bzf" :class="`bzf--${tom}`">
    <div class="bzf__cols">
      <div class="bzf__left">
        <h2 class="bzf__titulo">Ficou com alguma<br>dúvida?</h2>
        <p class="bzf__copy">O que o seu compliance costuma perguntar, com a resposta inteira.</p>
        <div class="bzf__chips" role="group" aria-label="Assunto das perguntas">
          <button
            v-for="(g, i) in RB_FAQ" :key="g.grupo" type="button"
            class="bzf__chip" :class="{ 'bzf__chip--on': i === ativo }"
            :aria-pressed="i === ativo" :aria-controls="`${uid}-p${i}`" @click="ativo = i"
          >
            {{ g.grupo }}<span class="bzf__chip-n">{{ g.itens.length }}</span>
          </button>
        </div>
        <a href="#contato" class="bzf__cta">Falar com a gente</a>
      </div>
      <div class="bzf__right">
        <div v-for="(g, i) in RB_FAQ" v-show="i === ativo" :id="`${uid}-p${i}`" :key="g.grupo">
          <h3 class="bzf__grupo">{{ g.grupo }}</h3>
          <NuFaqAccordion :items="g.itens" :default-open="-1" surface="white" :schema="false" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.bzf {
  scroll-margin-top: calc(var(--nuh-h, 76px) + 24px);
  background: var(--nu-cream);
  padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px);
}
.bzf__cols { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.bzf__left { flex: 1 1 300px; min-width: min(280px, 100%); }
@media (min-width: 960px) and (min-height: 700px) {
  .bzf__left { position: sticky; top: calc(var(--nuh-h, 76px) + 24px); }
}
.bzf__titulo {
  margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h2);
  font-weight: 500; letter-spacing: -0.045em; line-height: 1.02;
}
.bzf__copy { margin: 22px 0 0; max-width: 420px; color: var(--nu-gray-2); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.6; }
.bzf__chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 28px; max-width: 460px; }
.bzf__chip {
  display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 16px; border: 0;
  border-radius: var(--nu-r-pill); background: var(--nu-white); color: var(--nu-ink);
  font: inherit; font-size: var(--nu-fs-sm); font-weight: 600; text-align: left; cursor: pointer;
  box-shadow: inset 0 0 0 1px var(--nu-cream-line); transition: background .2s, color .2s, box-shadow .2s;
}
.bzf__chip:hover { box-shadow: inset 0 0 0 1px var(--nu-ink-30); }
.bzf__chip--on, .bzf__chip--on:hover { background: var(--nu-ink); color: var(--nu-white); box-shadow: none; }
.bzf__chip:focus-visible, .bzf__cta:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.bzf__chip-n { color: var(--nu-gray); font-weight: 700; font-variant-numeric: tabular-nums; }
.bzf__chip--on .bzf__chip-n { color: var(--nu-cream-text-60); }
.bzf__cta {
  display: inline-flex; align-items: center; height: 44px; padding: 0 22px; margin-top: 28px;
  border-radius: var(--nu-r-pill); box-shadow: inset 0 0 0 1px var(--nu-ink-16);
  color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; transition: background .2s, box-shadow .2s;
}
.bzf__cta:hover { background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-ink-30); color: var(--nu-ink); }
.bzf__right { flex: 1.6 1 480px; min-width: min(340px, 100%); }
/* o nome do grupo fica como título para quem navega por títulos; à vista, o chip já diz */
.bzf__grupo { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

/* ——— escuro (direção 2) ——— */
.bzf--escuro { background: var(--nu-navy); }
.bzf--escuro .bzf__titulo { color: var(--nu-cream-text); }
.bzf--escuro .bzf__copy { color: var(--nu-cream-text-70); }
.bzf--escuro .bzf__chip { background: transparent; color: var(--nu-cream-text); box-shadow: inset 0 0 0 1px var(--nu-cream-text-18); }
.bzf--escuro .bzf__chip:hover { box-shadow: inset 0 0 0 1px var(--nu-cream-text-45); }
.bzf--escuro .bzf__chip-n { color: var(--nu-cream-text-55); }
.bzf--escuro .bzf__chip--on, .bzf--escuro .bzf__chip--on:hover { background: var(--nu-cream); color: var(--nu-ink); box-shadow: none; }
.bzf--escuro .bzf__chip--on .bzf__chip-n { color: var(--nu-gray); }
.bzf--escuro .bzf__cta { color: var(--nu-cream-text); box-shadow: inset 0 0 0 1px var(--nu-cream-text-40); }
.bzf--escuro .bzf__cta:hover { background: var(--nu-cream-text-08); color: var(--nu-white); }
.bzf--escuro .bzf__chip:focus-visible, .bzf--escuro .bzf__cta:focus-visible { outline-color: var(--nu-blue-soft); }
</style>
