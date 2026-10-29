<script setup lang="ts">
// Hero do ativo (design Acoes Nu): badges (nome·ticker azul, pill outline B3 —
// ou o rótulo do VM: cripto usa 'CRIPTO' + logo redondo do backend —, pill de
// posição na carteira — AUTH-ONLY, anônimo nunca vê), preço H1 gigante
// tabular-nums, pill de variação do dia com triângulo (verde/vermelha), linha
// de fechamento anterior e CTAs primária + outline.
import type { AcaoHeroVM } from '~/types/acao'
import type { AcaoPosition } from '~/composables/useAcao'

// "Seguir" (29/09/2026): estrela na fileira de CTAs (SeguirAtivo) e, abaixo
// dela, o gancho do primeiro uso (SeguirGancho) — os dois client-only, o SSR
// sai igual pra logado e anônimo (página cacheada na borda). O mount grava o
// ativo em "vistos por último" (localStorage), que vira chip do gancho.
// `renamedFrom`: faixa discreta no destino do 301 de código trocado.
//
// `seguivel`: só o que existe em `tickers` pode ser seguido. A watchlist do
// Backend recusa o resto (POST → 422 "Não encontramos o ativo BTC."), e a
// cripto mora em outra tabela: GET /tickers/BTC e /tickers/ETH dão 404, contra
// 200 em AAPL (US_STOCK), AAPL34 (BDR), HGLG11 (REIT), BOVA11 e IVVB11 (ETF),
// conferido na API pública em 29/09/2026. Cripto fica sem estrela, sem gancho
// e fora dos "vistos" (senão vira chip que falha em outra página).
const props = defineProps<{ hero: AcaoHeroVM; position: AcaoPosition | null; renamedFrom?: string | null; seguivel: boolean }>()

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const logoFailed = ref(false)

onMounted(() => {
  if (props.seguivel) registrarAtivoVisto(props.hero.ticker)
})
</script>

<template>
  <section class="ahr">
    <p v-if="renamedFrom" class="ahr__renamed">{{ renamedFrom }} agora negocia como {{ hero.ticker }}.</p>
    <div class="ahr__badges">
      <img v-if="hero.logo && !logoFailed" :src="hero.logo" alt="" class="ahr__logo" @error="logoFailed = true">
      <!-- O H1 da página é o do AcaoResumo (nome, ticker e setor). Aqui o
           nome continua na fileira de badges, com a mesma classe de antes:
           o preço não volta a ser o título que o Google lia. -->
      <p class="ahr__company">{{ hero.companyLine }}</p>
      <span class="ahr__exchange">{{ hero.exchangeLabel || 'B3' }}</span>
      <span v-if="position" class="ahr__position">Na sua carteira · {{ nf0.format(position.qty) }} {{ position.qty === 1 ? 'cota' : 'cotas' }}</span>
    </div>
    <div class="ahr__price">{{ hero.priceFmt }}</div>
    <div class="ahr__variation">
      <span v-if="hero.changeLine" class="ahr__delta" :class="`ahr__delta--${hero.dir}`">
        <svg width="11" height="11" viewBox="0 0 10 10" class="ahr__tri" :class="{ 'ahr__tri--down': hero.dir === 'down' }"><path d="M5 1.5l3.5 6H1.5z" fill="currentColor" /></svg>{{ hero.changeLine }}
      </span>
      <span v-if="hero.metaLine" class="ahr__meta">{{ hero.metaLine }}</span>
    </div>
    <div class="ahr__ctas">
      <NuxtLink to="/busca" class="ahr__primary">Perguntar à Redentia AI</NuxtLink>
      <SeguirAtivo v-if="seguivel" :ticker="hero.ticker" :path="`/asset/${hero.ticker}`" />
      <NuxtLink to="/" class="ahr__outline">Adicionar à carteira</NuxtLink>
    </div>
    <SeguirGancho v-if="seguivel" :atual="hero.ticker" surface="cream" />
  </section>
</template>

<style scoped>
.ahr {
  background: var(--nu-cream);
  /* O resumo factual continua nesta faixa creme: o fundo do hero encolhe
     para o título não ficar num vazio. */
  padding: clamp(56px, 8vw, 104px) clamp(22px, 5.5vw, 80px) clamp(20px, 3vw, 32px);
  animation: nu-fade .5s ease both;
}
.ahr__renamed {
  display: flex; width: fit-content; max-width: 100%; margin: 0 0 18px; padding: 7px 14px; border-radius: var(--nu-r-pill);
  background: var(--nu-sand-2); color: var(--nu-gray-tag); font-size: var(--nu-fs-sm); font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.ahr__badges { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.ahr__logo {
  width: 30px; height: 30px; border-radius: 50%; object-fit: cover; display: block;
  background: var(--nu-white); flex-shrink: 0;
}
/* margin: 0 explícito — o UA aplica margem de bloco em <p>,
   o que quebraria o alinhamento da linha de badges (flex). */
.ahr__company { margin: 0; color: var(--nu-blue-text); font-size: clamp(17px, 1.6vw, 21px); font-weight: 800; letter-spacing: -.2px; }
.ahr__exchange {
  display: inline-flex; align-items: center; border: 2px solid var(--nu-ink-14);
  color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 700; padding: 5px 13px;
  border-radius: var(--nu-r-pill);
}
.ahr__position {
  display: inline-flex; align-items: center; background: var(--nu-blue-tint); color: var(--nu-blue-text);
  font-size: var(--nu-fs-dense); font-weight: 700; padding: 7px 15px; border-radius: var(--nu-r-pill);
  font-variant-numeric: tabular-nums;
}
.ahr__price {
  margin: 14px 0 0; color: var(--nu-ink); font-size: clamp(54px, 8.5vw, 106px);
  font-weight: 800; letter-spacing: -0.045em; line-height: 0.98; font-variant-numeric: tabular-nums;
}
.ahr__variation { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-top: 26px; }
.ahr__delta {
  display: inline-flex; align-items: center; gap: 7px; font-size: var(--nu-fs-md); font-weight: 800;
  padding: 9px 18px; border-radius: var(--nu-r-pill); font-variant-numeric: tabular-nums;
}
.ahr__delta--up { background: var(--nu-green-bg); color: var(--nu-green-2); }
.ahr__delta--down { background: var(--nu-red-tint); color: var(--nu-red-2); }
.ahr__tri { display: block; }
.ahr__tri--down { transform: rotate(180deg); }
.ahr__meta { color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 500; }
.ahr__ctas { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-top: 44px; }
.ahr__primary {
  display: inline-flex; align-items: center; gap: 10px; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 17px 30px; font-size: var(--nu-fs-lg); font-weight: 700;
  transition: background .2s, transform .15s;
}
.ahr__primary:hover { background: var(--nu-blue-hover); color: var(--nu-white); transform: translateY(-2px); }
.ahr__outline {
  display: inline-flex; align-items: center; gap: 10px; background: transparent; color: var(--nu-blue-text);
  border: 2px solid var(--nu-blue); border-radius: var(--nu-r-pill); padding: 15px 28px;
  font-size: var(--nu-fs-lg); font-weight: 700; transition: background .2s;
}
.ahr__outline:hover { background: var(--nu-blue-tint-2); color: var(--nu-blue-text); }
</style>
