<script setup lang="ts">
// As notícias do ativo nas direções do /asset: o destaque e as linhas do
// AcaoNews, com os mesmos links. `compacta` tira o resumo do destaque do
// tamanho de manchete (para caber num cartão). A variação ao lado de cada
// título é a do papel no dia da notícia (useAcao), não um efeito da notícia.
// Robustez (11/11/2026): a variação é o NuSelo (o do destaque no tamanho m, o
// das linhas no p); o "Ver todas as notícias" é o NuLinkSeta; o destaque e as
// linhas entram em cascata (v-revelar); o hover e a seta que chega nos tokens.
import type { AcaoNewsVM } from '~/types/acao'

withDefaults(defineProps<{ news: AcaoNewsVM; compacta?: boolean }>(), { compacta: false })
const tomDe = (dir: string) => (dir === 'down' ? 'vermelho' : dir === 'up' ? 'verde' : 'neutro')
</script>

<template>
  <div v-revelar="{ alvo: 'filhos' }" class="ano" :class="{ 'ano--compacta': compacta }">
    <NuxtLink
      v-contexto-chat="{ id: `noticia:${news.featured.href}`, tipo: 'noticia', rotulo: rotuloCurto(news.featured.title), texto: [news.featured.title, news.featured.dek, news.featured.source].filter(Boolean).join('\n') }"
      :to="news.featured.href" class="ano__dest"
    >
      <span class="ano__meta">
        <NuSelo v-if="news.featured.badge" :tom="tomDe(news.featured.badge.dir)">{{ news.featured.badge.text }}</NuSelo>
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
            <NuSelo v-if="n.ticker" :tom="tomDe(n.ticker.dir)" tamanho="p">{{ n.ticker.text }}</NuSelo>
          </span>
        </NuxtLink>
      </li>
    </ul>
    <p class="ano__todas"><NuLinkSeta to="/noticias" tom="tinta">Ver todas as notícias</NuLinkSeta></p>
  </div>
</template>

<style scoped>
.ano { position: relative; isolation: isolate; }
.ano__dest { position: relative; display: flex; flex-direction: column; gap: 10px; color: inherit; }
.ano__dest::before { inset: -12px -14px; }
.ano__meta { display: flex; align-items: center; gap: 8px 12px; flex-wrap: wrap; }
.ano__fonte { color: var(--nu-gray); font-size: 13px; font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); }
.ano__titulo { color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 1.1; text-wrap: balance; transition: color var(--nu-dur-media) var(--nu-ease-cor); }
.ano__dest:hover .ano__titulo { color: var(--nu-blue-text); }
.ano__dek {
  max-width: 64ch; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto); line-height: 1.55;
  /* o feed às vezes manda a matéria inteira no resumo: o texto todo fica no HTML, a tela mostra quatro linhas */
  display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
}
.ano--compacta .ano__titulo { font-size: var(--nu-fs-xl); }
.ano--compacta .ano__dek { font-size: var(--nu-fs-sm); -webkit-line-clamp: 3; }
.ano__linhas { list-style: none; margin: 24px 0 0; padding: 0; }
.ano__linha { position: relative; display: flex; flex-direction: column; gap: 6px; padding: 16px 32px 16px 0; border-top: 1px solid var(--nu-line-2); color: inherit; -webkit-tap-highlight-color: transparent; }
/* o hover: um fundo claro que vaza um pouco da coluna, a tinta azul e a seta que chega */
.ano__linha::before, .ano__dest::before {
  content: ''; position: absolute; inset: 2px -14px; z-index: -1; border-radius: var(--nu-r-chip); background: var(--nu-cream-2);
  opacity: 0; transition: opacity var(--nu-dur-media) var(--nu-ease-cor);
}
.ano__linha:hover::before, .ano__linha:focus-visible::before, .ano__dest:hover::before, .ano__dest:focus-visible::before { opacity: 1; }
.ano__linha:focus-visible, .ano__dest:focus-visible { outline: none; }
.ano__linha:active::before, .ano__dest:active::before { background: var(--nu-line-2); }
.ano__linha:focus-visible::before, .ano__dest:focus-visible::before { box-shadow: 0 0 0 3px var(--nu-blue); }
.ano__seta { position: absolute; right: 4px; top: 50%; color: var(--nu-blue-text); opacity: 0; transform: translate(-8px, -50%); transition: opacity var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-media) var(--nu-ease-saida); }
.ano__linha:hover .ano__seta, .ano__linha:focus-visible .ano__seta { opacity: 1; transform: translate(0, -50%); }
.ano__l-t { color: var(--nu-ink); font-size: 17px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); line-height: 1.35; transition: color var(--nu-dur-media) var(--nu-ease-cor); }
.ano__linha:hover .ano__l-t { color: var(--nu-blue-text); }
.ano__l-m { display: flex; gap: 8px 12px; align-items: center; flex-wrap: wrap; }
.ano__todas { margin: 16px 0 0; font-size: var(--nu-fs-md); }
@media (prefers-reduced-motion: reduce) { .ano__linha::before, .ano__dest::before, .ano__seta, .ano__titulo, .ano__l-t { transition: none; } }
</style>
