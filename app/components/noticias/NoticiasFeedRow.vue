<script setup lang="ts">
// Linha do feed de notícias. 2ª rodada da Aportou (11/11/2026): o feed virou
// uma LISTA DE LEITURA. A primeira notícia abre a lista em destaque (imagem
// larga ao lado, título de cartão); as demais são linhas com fio: a imagem (ou
// o placeholder da marca, NuNewsImage) pequena à esquerda, o veículo, a data, o
// título em até três linhas, a leitura da IA e os selos dos tickers. No celular
// a imagem vira uma miniatura ao lado do título e o resto ocupa a largura.
// O conteúdo, o link e a ordem são os de antes.
// NÃO confundir com NuNewsRow (linha compacta do /mercado e /asset).
import type { NoticiasItem } from '~/types/noticias'

defineProps<{ item: NoticiasItem; naCarteira: boolean; destaque?: boolean }>()

// Imagem quebrada/ausente degrada pro fallback único do NuNewsImage
// (o wordmark apagado + aviso), sem vazar ícone partido do browser.
</script>

<template>
  <article v-contexto-chat="{ id: `noticia:${item.id}`, tipo: 'noticia', rotulo: rotuloCurto(item.titulo) }" class="nfr" :class="{ 'nfr--destaque': destaque }">
    <NuNewsImage :src="item.image" :alt="item.titulo" class="nfr__media" />
    <div class="nfr__content">
      <div class="nfr__meta">
        <span class="nfr__veiculo">{{ item.veiculo }}</span>
        <span class="nfr__dot" aria-hidden="true">·</span>
        <span class="nfr__tempo">{{ item.tempo }}</span>
        <span v-if="naCarteira" class="nfr__badge">Na sua carteira</span>
      </div>
      <a v-if="item.url" :href="item.url" target="_blank" rel="noopener" class="nfr__title">{{ item.titulo }}</a>
      <span v-else class="nfr__title">{{ item.titulo }}</span>
      <!-- a leitura vem da API: o nome da marca troca só na exibição -->
      <NuAtlasTake v-if="item.leitura" :text="marcaNoTexto(item.leitura)" class="nfr__take" />
      <div v-if="item.tickers.length" class="nfr__chips">
        <NuTickerChip v-for="k in item.tickers" :key="k.ticker" :ticker="k.ticker" :dir="k.dir" />
      </div>
    </div>
  </article>
</template>

<style scoped>
/* ——— a linha da lista ——— */
.nfr {
  display: grid; grid-template-columns: clamp(180px, 19vw, 248px) minmax(0, 1fr); column-gap: clamp(20px, 2.6vw, 36px);
  align-items: start; padding: clamp(24px, 2.8vw, 34px) 0; border-top: 1.5px solid var(--nu-line-2);
}
/* sizing/radius do slot de imagem; miolo (img/fallback) = NuNewsImage */
.nfr__media { aspect-ratio: 3 / 2; border-radius: var(--nu-r-tile); }
.nfr__media :deep(.nni__msg) { font-size: 12px; }
.nfr__content { min-width: 0; }
.nfr__meta { display: flex; align-items: center; gap: 4px 10px; flex-wrap: wrap; }
.nfr__veiculo { color: var(--nu-ink); font-size: 13.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
.nfr__dot { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 700; }
.nfr__tempo { color: var(--nu-gray); font-size: 14.5px; font-weight: 600; }
.nfr__badge {
  display: inline-flex; align-items: center; min-height: 26px; background: var(--nu-blue-bg); color: var(--nu-blue-text);
  font-size: 13.5px; font-weight: 700; padding: 0 9px; border-radius: var(--nu-r-tag);
}
.nfr__title {
  color: var(--nu-ink); font-size: clamp(21px, 2vw, 27px);
  font-weight: 800; letter-spacing: -0.025em; line-height: 1.14; margin-top: 10px; text-wrap: balance;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
  transition: color .2s;
}
.nfr__title:hover { color: var(--nu-blue-text); }
.nfr__take { margin-top: 16px; max-width: 78ch; }
.nfr__chips { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 14px; }

/* ——— a primeira: destaque, com a imagem larga ao lado ——— */
.nfr--destaque { grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); column-gap: clamp(24px, 3.5vw, 56px); align-items: center; border-top: 0; padding-top: 0; padding-bottom: clamp(32px, 3.6vw, 48px); }
.nfr--destaque .nfr__media { aspect-ratio: auto; min-height: clamp(240px, 26vw, 360px); border-radius: var(--nu-r-card); }
.nfr--destaque .nfr__media :deep(.nni__msg) { font-size: var(--nu-fs-dense); }
.nfr--destaque .nfr__title { font-size: var(--nu-fs-h3); line-height: 1.06; margin-top: 14px; }
.nfr--destaque .nfr__take { margin-top: 22px; }
.nfr--destaque .nfr__chips { margin-top: 18px; }

/* ——— celular: a miniatura ao lado do título; a leitura e os selos na largura toda ——— */
@media (max-width: 720px) {
  .nfr { grid-template-columns: minmax(0, 1fr) 92px; column-gap: 14px; row-gap: 0; }
  .nfr__content { display: contents; }
  .nfr__meta { grid-column: 1; grid-row: 1; align-self: end; }
  .nfr__title { grid-column: 1; grid-row: 2; margin-top: 8px; font-size: 20px; -webkit-line-clamp: 4; }
  .nfr__media { grid-column: 2; grid-row: 1 / span 2; align-self: start; aspect-ratio: 1; border-radius: var(--nu-r-chip); }
  .nfr__media :deep(.nni__msg) { display: none; }
  .nfr__media :deep(.nni__logo) { max-width: 76%; }
  .nfr__take, .nfr__chips { grid-column: 1 / -1; }
  /* o destaque empilha: a imagem em cima, larga */
  .nfr--destaque { grid-template-columns: minmax(0, 1fr); }
  .nfr--destaque .nfr__media { grid-column: 1; grid-row: 1; aspect-ratio: 16 / 9; min-height: 0; border-radius: var(--nu-r-panel); margin-bottom: 18px; }
  .nfr--destaque .nfr__media :deep(.nni__msg) { display: block; }
  .nfr--destaque .nfr__media :deep(.nni__logo) { max-width: 46%; }
  .nfr--destaque .nfr__meta { grid-row: 2; }
  .nfr--destaque .nfr__title { grid-row: 3; font-size: clamp(24px, 6.6vw, 30px); }
}
@media (prefers-reduced-motion: reduce) { .nfr__title { transition: none; } }
</style>
