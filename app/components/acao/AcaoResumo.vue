<script setup lang="ts">
/**
 * Resumo factual do ativo, no HTML do SSR.
 *
 * O texto vem de app/utils/assetResumo.ts, montado com o que o useAcao já
 * buscou. Perguntas e respostas ficam visíveis (não é accordion): o JSON-LD
 * FAQPage só sai quando `schema` é true e há itens, e o texto do schema é o
 * mesmo da tela. Quando o editorial já emite um FAQPage, a página passa
 * schema=false para não duplicar o bloco.
 */
import type { AcaoResumoVM } from '~/utils/assetResumo'

const props = withDefaults(defineProps<{ resumo: AcaoResumoVM; schema?: boolean }>(), { schema: true })

if (props.schema && props.resumo.faq.length) useFaqSchema(props.resumo.faq)
</script>

<template>
  <section class="ars" aria-labelledby="ars-h1">
    <div class="ars__wrap">
      <h1 id="ars-h1" class="ars__h1">{{ resumo.h1 }}</h1>
      <p v-for="(p, i) in resumo.paragrafos" :key="i" class="ars__p">{{ p }}</p>

      <nav v-if="resumo.links.length" class="ars__nav" aria-label="Páginas relacionadas a este ativo">
        <p class="ars__kicker">Veja também</p>
        <ul class="ars__links">
          <li v-for="link in resumo.links" :key="link.href">
            <NuxtLink :to="link.href">{{ link.label }}</NuxtLink>
          </li>
        </ul>
      </nav>

      <div v-if="resumo.faq.length" class="ars__faq">
        <h2 class="ars__h2">{{ resumo.faqTitulo }}</h2>
        <article v-for="item in resumo.faq" :key="item.q" class="ars__qa">
          <h3 class="ars__q">{{ item.q }}</h3>
          <p class="ars__a">{{ item.a }}</p>
        </article>
      </div>

      <p class="ars__aviso">{{ resumo.aviso }}</p>
    </div>
  </section>
</template>

<style scoped>
.ars {
  background: var(--nu-cream);
  padding: 8px clamp(22px, 5.5vw, 80px) clamp(48px, 6vw, 80px);
}
.ars__wrap { max-width: 68ch; }
.ars__h1 {
  margin: 0;
  color: var(--nu-ink);
  font-size: clamp(28px, 3.2vw, 40px);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
  text-wrap: balance;
}
.ars__p {
  margin: 16px 0 0;
  color: var(--nu-gray);
  font-size: var(--nu-fs-lg);
  font-weight: 500;
  line-height: 1.65;
}
.ars__nav { margin-top: 28px; }
.ars__kicker {
  margin: 0;
  color: var(--nu-gray);
  font-size: var(--nu-fs-xs);
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.ars__links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
}
.ars__links a {
  color: var(--nu-blue-text);
  font-size: var(--nu-fs-md);
  font-weight: 800;
  line-height: 1.35;
}
.ars__links a:hover { color: var(--nu-blue-hover); }
.ars__faq { margin-top: clamp(36px, 5vw, 56px); }
.ars__h2 {
  margin: 0;
  color: var(--nu-ink);
  font-size: var(--nu-fs-h3);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
}
.ars__qa { margin-top: 22px; }
.ars__q {
  margin: 0;
  color: var(--nu-ink);
  font-size: var(--nu-fs-xl);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.3;
}
.ars__a {
  margin: 8px 0 0;
  color: var(--nu-gray);
  font-size: var(--nu-fs-md);
  font-weight: 500;
  line-height: 1.65;
}
.ars__aviso {
  margin: 28px 0 0;
  color: var(--nu-gray);
  font-size: var(--nu-fs-sm);
  font-weight: 600;
  line-height: 1.5;
}
</style>
