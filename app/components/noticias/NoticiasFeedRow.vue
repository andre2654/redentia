<script setup lang="ts">
// Linha do feed de notícias: imagem (radius 28, min-height clamp) + coluna de
// conteúdo (meta → título-link → leitura do Atlas → chips de ticker), com
// direção ALTERNADA par/ímpar via prop `reverse` — o índice é o da lista
// FILTRADA, como no mock. Valores exatos do design (Redentia Noticias Nu.dc.html).
// NÃO confundir com NuNewsRow (linha compacta do /mercado e /asset).
import type { NoticiasItem } from '~/types/noticias'

defineProps<{ item: NoticiasItem; reverse: boolean; naCarteira: boolean }>()

// Imagem quebrada não pode vazar ícone partido — degrada pro bloco creme
// (o mesmo placeholder do image-slot do design).
const imgFailed = ref(false)
</script>

<template>
  <article class="nfr" :class="{ 'nfr--reverse': reverse }">
    <div class="nfr__media">
      <img
        v-if="item.image && !imgFailed"
        :src="item.image" :alt="item.titulo" class="nfr__img"
        loading="lazy" @error="imgFailed = true"
      >
    </div>
    <div class="nfr__content">
      <div class="nfr__meta">
        <span class="nfr__veiculo">{{ item.veiculo }}</span>
        <span class="nfr__dot">·</span>
        <span class="nfr__tempo">{{ item.tempo }}</span>
        <span v-if="naCarteira" class="nfr__badge">Na sua carteira</span>
      </div>
      <a v-if="item.url" :href="item.url" target="_blank" rel="noopener" class="nfr__title">{{ item.titulo }}</a>
      <span v-else class="nfr__title">{{ item.titulo }}</span>
      <NuAtlasTake v-if="item.leitura" :text="item.leitura" class="nfr__take" />
      <div v-if="item.tickers.length" class="nfr__chips">
        <NuTickerChip v-for="k in item.tickers" :key="k.ticker" :ticker="k.ticker" :dir="k.dir" />
      </div>
    </div>
  </article>
</template>

<style scoped>
.nfr {
  display: flex; flex-direction: row; align-items: center;
  gap: clamp(22px, 3.5vw, 56px); flex-wrap: wrap;
}
.nfr--reverse { flex-direction: row-reverse; }
.nfr__media {
  flex: 1 1 320px; min-width: min(300px, 100%); position: relative;
  min-height: clamp(240px, 26vw, 380px); border-radius: 28px; overflow: hidden;
  background: var(--nu-cream);
}
.nfr__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.nfr__content { flex: 1.1 1 340px; min-width: min(300px, 100%); }
.nfr__meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.nfr__veiculo { color: var(--nu-ink); font-size: 14.5px; font-weight: 800; }
.nfr__dot { color: var(--nu-sand); font-size: 13px; font-weight: 700; }
.nfr__tempo { color: var(--nu-gray); font-size: 14px; font-weight: 600; }
.nfr__badge {
  display: inline-flex; align-items: center; background: var(--nu-blue-tint); color: var(--nu-blue);
  font-size: 11.5px; font-weight: 800; padding: 4px 11px; border-radius: var(--nu-r-pill);
}
.nfr__title {
  display: block; color: var(--nu-ink); font-size: clamp(24px, 2.8vw, 38px);
  font-weight: 800; letter-spacing: -0.03em; line-height: 1.14; margin-top: 14px;
  transition: color .2s;
}
.nfr__title:hover { color: var(--nu-blue); }
.nfr__take { margin-top: 22px; }
.nfr__chips { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 18px; }
</style>
