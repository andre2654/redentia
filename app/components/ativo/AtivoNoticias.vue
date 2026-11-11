<script setup lang="ts">
// As notícias do ativo nas direções do /asset: o destaque e as linhas do
// AcaoNews, com os mesmos links. `compacta` tira o resumo do destaque do
// tamanho de manchete (para caber num cartão). A variação ao lado de cada
// título é a do papel no dia da notícia (useAcao), não um efeito da notícia.
import type { AcaoNewsVM } from '~/types/acao'

withDefaults(defineProps<{ news: AcaoNewsVM; compacta?: boolean }>(), { compacta: false })
</script>

<template>
  <div class="ano" :class="{ 'ano--compacta': compacta }">
    <NuxtLink
      v-contexto-chat="{ id: `noticia:${news.featured.href}`, tipo: 'noticia', rotulo: rotuloCurto(news.featured.title), texto: [news.featured.title, news.featured.dek, news.featured.source].filter(Boolean).join('\n') }"
      :to="news.featured.href" class="ano__dest"
    >
      <span class="ano__meta">
        <span v-if="news.featured.badge" class="ano__pct" :class="`ano__pct--${news.featured.badge.dir}`">{{ news.featured.badge.text }}</span>
        <span class="ano__fonte">{{ news.featured.source }}</span>
      </span>
      <span class="ano__titulo">{{ news.featured.title }}</span>
      <span v-if="news.featured.dek" class="ano__dek">{{ news.featured.dek }}</span>
    </NuxtLink>
    <ul v-if="news.rows.length" class="ano__linhas">
      <li v-for="(n, i) in news.rows" :key="i">
        <NuxtLink v-contexto-chat="{ id: `noticia:${n.href}`, tipo: 'noticia', rotulo: rotuloCurto(n.title), texto: `${n.title} (${n.source})` }" :to="n.href" class="ano__linha">
          <span class="ano__l-t">{{ n.title }}</span>
          <svg class="ano__seta" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
          <span class="ano__l-m">
            <span class="ano__fonte">{{ n.source }}</span>
            <span v-if="n.ticker" class="ano__pct ano__pct--texto" :class="`ano__pct--${n.ticker.dir}`">{{ n.ticker.text }}</span>
          </span>
        </NuxtLink>
      </li>
    </ul>
    <NuxtLink to="/noticias" class="ano__todas">
      Ver todas as notícias
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
    </NuxtLink>
  </div>
</template>

<style scoped>
.ano { position: relative; isolation: isolate; }
.ano__dest { position: relative; display: flex; flex-direction: column; gap: 10px; color: inherit; }
.ano__dest::before { inset: -12px -14px; }
.ano__meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.ano__pct { display: inline-flex; align-items: center; min-height: 26px; padding: 0 9px; border-radius: var(--nu-r-tag); font-size: 13.5px; font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums; }
.ano__pct--up { background: var(--nu-green-bg); color: var(--nu-green-text); }
.ano__pct--down { background: var(--nu-red-bg); color: var(--nu-red-text); }
.ano__pct--texto { min-height: 0; padding: 0; background: none; }
.ano__pct--texto.ano__pct--up { color: var(--nu-green-text); }
.ano__pct--texto.ano__pct--down { color: var(--nu-red-text); }
.ano__fonte { color: var(--nu-gray); font-size: 13.5px; font-weight: 600; }
.ano__titulo { color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: var(--nu-w-display); letter-spacing: -0.025em; line-height: 1.1; text-wrap: balance; transition: color .2s; }
.ano__dest:hover .ano__titulo { color: var(--nu-blue-text); }
.ano__dek {
  max-width: 64ch; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55;
  /* o feed às vezes manda a matéria inteira no resumo: o texto todo fica no HTML, a tela mostra quatro linhas */
  display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
}
.ano--compacta .ano__titulo { font-size: var(--nu-fs-xl); }
.ano--compacta .ano__dek { font-size: var(--nu-fs-sm); -webkit-line-clamp: 3; }
.ano__linhas { list-style: none; margin: 22px 0 0; padding: 0; }
.ano__linha { position: relative; display: flex; flex-direction: column; gap: 4px; padding: 16px 32px 16px 0; border-top: 1px solid var(--nu-line-2); color: inherit; }
/* o hover: um fundo claro que vaza um pouco da coluna, a tinta azul e a seta que chega */
.ano__linha::before, .ano__dest::before {
  content: ''; position: absolute; inset: 2px -14px; z-index: -1; border-radius: 14px; background: var(--nu-cream-2);
  opacity: 0; transition: opacity .2s ease;
}
.ano__linha:hover::before, .ano__linha:focus-visible::before, .ano__dest:hover::before, .ano__dest:focus-visible::before { opacity: 1; }
.ano__linha:focus-visible, .ano__dest:focus-visible { outline: none; }
.ano__seta { position: absolute; right: 4px; top: 50%; color: var(--nu-blue-text); opacity: 0; transform: translate(-8px, -50%); transition: opacity .2s ease, transform .25s var(--nu-ease-saida); }
.ano__linha:hover .ano__seta, .ano__linha:focus-visible .ano__seta { opacity: 1; transform: translate(0, -50%); }
.ano__l-t { color: var(--nu-ink); font-size: 17px; font-weight: var(--nu-w-medio); line-height: 1.35; transition: color .2s; }
.ano__linha:hover .ano__l-t { color: var(--nu-blue-text); }
.ano__l-m { display: flex; gap: 10px; align-items: baseline; }
.ano__todas { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; margin-top: 12px; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio); text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1.5px; text-decoration-color: var(--nu-line); }
.ano__todas svg { transition: transform .2s ease; }
.ano__todas:hover { color: var(--nu-blue-text); text-decoration-color: currentColor; }
.ano__todas:hover svg { transform: translateX(3px); }
@media (prefers-reduced-motion: reduce) { .ano__linha::before, .ano__dest::before, .ano__seta, .ano__todas svg, .ano__titulo, .ano__l-t { transition: none; } }
</style>
