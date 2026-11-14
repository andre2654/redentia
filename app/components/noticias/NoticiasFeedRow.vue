<script setup lang="ts">
// Linha do feed de notícias. 2ª rodada da Aportou (11/11/2026): o feed virou
// uma LISTA DE LEITURA. A primeira notícia abre a lista em destaque (imagem
// larga ao lado, título de cartão); as demais são linhas com fio: a imagem (ou
// o placeholder da marca, NuNewsImage) pequena à esquerda, o veículo, a data, o
// título em até três linhas, a leitura da IA e os selos dos tickers. No celular
// a imagem vira uma miniatura ao lado do título e o resto ocupa a largura.
// O conteúdo, o link e a ordem são os de antes.
// NÃO confundir com NuNewsRow (linha compacta do /mercado e /asset).
//
// Robustez (11/11/2026): leitura calma, à Rogo e à Legora. Muito ar entre as
// linhas; a fonte e a data discretas (caixa baixa, 13,5px, cinza), o título é
// o que se lê primeiro; a leitura da IA deixa de ser uma caixa em cada linha
// e vira uma nota com o fio à esquerda (o rótulo da marca continua); "Na sua
// carteira" é o NuSelo. O título é o link (abre o veículo em outra aba): sob
// o ponteiro fica cobalto e a seta diagonal aparece; apertado, esmaece; o anel
// de foco abraça o título. A imagem do destaque cresce 2% sob o ponteiro.
import type { NoticiasItem } from '~/types/noticias'

defineProps<{ item: NoticiasItem; naCarteira: boolean; destaque?: boolean }>()

// Imagem quebrada/ausente degrada pro fallback único do NuNewsImage
// (o wordmark apagado + aviso), sem vazar ícone partido do browser.
</script>

<template>
  <article v-contexto-chat="{ id: `noticia:${item.id}`, tipo: 'noticia', rotulo: rotuloCurto(item.titulo) }" class="nfr" :class="{ 'nfr--destaque': destaque }">
    <NuNewsImage :src="item.image" :alt="item.titulo" class="nfr__media" />
    <div class="nfr__content">
      <p class="nfr__meta">
        <span class="nfr__veiculo">{{ item.veiculo }}</span>
        <span class="nfr__dot" aria-hidden="true">·</span>
        <span class="nfr__tempo">{{ item.tempo }}</span>
        <NuSelo v-if="naCarteira" tom="azul" tamanho="p" class="nfr__badge">Na sua carteira</NuSelo>
      </p>
      <a v-if="item.url" :href="item.url" target="_blank" rel="noopener" class="nfr__title">
        <span class="nfr__title-t">{{ item.titulo }}</span>
        <svg class="nfr__fora" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8.5 7H17v8.5" /></svg>
        <span class="nu-sr">(abre em outra aba)</span>
      </a>
      <span v-else class="nfr__title"><span class="nfr__title-t">{{ item.titulo }}</span></span>
      <!-- a leitura vem da API: o nome da marca troca só na exibição -->
      <NuAtlasTake v-if="item.leitura" :text="marcaNoTexto(item.leitura)" class="nfr__take" />
      <div v-if="item.tickers.length" class="nfr__chips">
        <NuTickerChip v-for="k in item.tickers" :key="k.ticker" :ticker="k.ticker" :dir="k.dir" />
      </div>
    </div>
  </article>
</template>

<style scoped>
/* ——— a linha da lista: muito ar, um fio de 1px entre uma e outra ——— */
.nfr {
  display: grid; grid-template-columns: clamp(180px, 19vw, 240px) minmax(0, 1fr); column-gap: clamp(24px, 3vw, 40px);
  align-items: start; padding: clamp(32px, 3.4vw, 48px) 0; border-top: 1px solid var(--nu-line-2);
}
/* sizing/radius do slot de imagem; miolo (img/fallback) = NuNewsImage */
.nfr__media { aspect-ratio: 3 / 2; border-radius: var(--nu-r-tile); overflow: hidden; }
.nfr__media :deep(.nni__msg) { font-size: 12px; }
.nfr__content { min-width: 0; max-width: 760px; }
/* a fonte e a data: discretas, em caixa baixa */
.nfr__meta { display: flex; align-items: center; gap: 4px 8px; flex-wrap: wrap; margin: 0; min-height: 22px; }
.nfr__veiculo { color: var(--nu-gray-3); font-size: 13.5px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); }
.nfr__dot { color: var(--nu-gray); font-size: 13.5px; }
.nfr__tempo { color: var(--nu-gray); font-size: 13.5px; font-weight: var(--nu-w-texto); font-variant-numeric: tabular-nums; }
.nfr__badge { margin-left: 4px; }

/* o título é o link: cobalto sob o ponteiro, a seta de "abre fora" aparece */
.nfr__title {
  position: relative; display: block; margin-top: 12px; color: var(--nu-ink); text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}
.nfr__title-t {
  font-size: clamp(20px, 1.8vw, 24px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); line-height: 1.25; text-wrap: pretty;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
  transition: color var(--nu-dur-media) var(--nu-ease-cor);
}
.nfr__fora {
  position: absolute; right: 0; top: 4px; color: var(--nu-blue-text); opacity: 0; transform: translate(-3px, 3px);
  transition: opacity var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-media) var(--nu-ease-saida);
}
a.nfr__title { padding-right: 28px; }
a.nfr__title:hover { color: var(--nu-ink); }
a.nfr__title:hover .nfr__title-t { color: var(--nu-blue-text); }
a.nfr__title:hover .nfr__fora { opacity: 1; transform: none; }
a.nfr__title:active { opacity: .72; }
a.nfr__title:focus-visible { outline-offset: 4px; border-radius: 6px; }

/* a leitura da IA: uma nota com o fio à esquerda, não uma caixa em cada linha */
.nfr .nfr__take {
  margin-top: 16px; padding: 2px 0 2px 16px; border-radius: 0;
  background: none; box-shadow: inset 1px 0 0 var(--nu-line);
}
.nfr .nfr__take :deep(.nat__body) { margin-top: 8px; line-height: 1.6; }
.nfr__chips { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 16px; }

/* ——— a primeira: destaque, com a imagem larga ao lado ——— */
.nfr--destaque { grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); column-gap: clamp(24px, 3.5vw, 56px); align-items: center; border-top: 0; padding-top: 0; padding-bottom: clamp(40px, 4vw, 56px); }
.nfr--destaque .nfr__media { aspect-ratio: auto; min-height: clamp(240px, 26vw, 360px); border-radius: var(--nu-r-card); }
.nfr--destaque .nfr__media :deep(img) { transition: transform var(--nu-dur-lenta) var(--nu-ease-saida); }
.nfr--destaque:hover .nfr__media :deep(img) { transform: scale(1.02); }
.nfr--destaque .nfr__media :deep(.nni__msg) { font-size: var(--nu-fs-dense); }
.nfr--destaque .nfr__title { margin-top: 16px; }
.nfr--destaque .nfr__title-t { font-size: var(--nu-fs-h3); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-titulo); line-height: 1.08; -webkit-line-clamp: 4; }
.nfr--destaque a.nfr__title { padding-right: 32px; }
.nfr--destaque .nfr__fora { top: 8px; }
.nfr--destaque .nfr__take { margin-top: 24px; }
.nfr--destaque .nfr__chips { margin-top: 20px; }

/* ——— celular: a miniatura ao lado do título; a leitura e os selos na largura toda ——— */
@media (max-width: 720px) {
  .nfr { grid-template-columns: minmax(0, 1fr) 92px; column-gap: 16px; row-gap: 0; padding: 28px 0; }
  .nfr__content { display: contents; }
  .nfr__meta { grid-column: 1; grid-row: 1; align-self: end; }
  .nfr__title { grid-column: 1; grid-row: 2; margin-top: 8px; }
  .nfr__title-t { font-size: 19px; -webkit-line-clamp: 4; }
  /* no celular não há ponteiro: a seta de "abre fora" sai e o título usa a largura */
  a.nfr__title { padding-right: 0; }
  .nfr__fora { display: none; }
  .nfr__media { grid-column: 2; grid-row: 1 / span 2; align-self: start; aspect-ratio: 1; border-radius: var(--nu-r-chip); }
  .nfr__media :deep(.nni__msg) { display: none; }
  .nfr__media :deep(.nni__logo) { max-width: 76%; }
  .nfr__take, .nfr__chips { grid-column: 1 / -1; }
  /* o destaque empilha: a imagem em cima, larga */
  .nfr--destaque { grid-template-columns: minmax(0, 1fr); padding-top: 0; }
  .nfr--destaque .nfr__media { grid-column: 1; grid-row: 1; aspect-ratio: 16 / 9; min-height: 0; border-radius: var(--nu-r-panel); margin-bottom: 20px; }
  .nfr--destaque .nfr__media :deep(.nni__msg) { display: block; }
  .nfr--destaque .nfr__media :deep(.nni__logo) { max-width: 46%; }
  .nfr--destaque .nfr__meta { grid-row: 2; }
  .nfr--destaque .nfr__title { grid-row: 3; }
  .nfr--destaque .nfr__title-t { font-size: clamp(24px, 6.6vw, 30px); }
}
@media (prefers-reduced-motion: reduce) {
  .nfr__title-t, .nfr__fora, .nfr--destaque .nfr__media :deep(img) { transition: none; }
  .nfr--destaque:hover .nfr__media :deep(img) { transform: none; }
}
</style>
