<script setup lang="ts">
// Hero do ativo (design Acoes Nu): badges (nome·ticker azul, pill outline B3,
// pill de posição na carteira — AUTH-ONLY, anônimo nunca vê), preço H1 gigante
// tabular-nums, pill de variação do dia com triângulo (verde/vermelha), linha
// de fechamento anterior e CTAs primária + outline.
import type { AcaoHeroVM } from '~/types/acao'
import type { AcaoPosition } from '~/composables/useAcao'

defineProps<{ hero: AcaoHeroVM; position: AcaoPosition | null }>()

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
</script>

<template>
  <section class="ahr">
    <div class="ahr__badges">
      <span class="ahr__company">{{ hero.companyLine }}</span>
      <span class="ahr__exchange">B3</span>
      <span v-if="position" class="ahr__position">Na sua carteira · {{ nf0.format(position.qty) }} {{ position.qty === 1 ? 'cota' : 'cotas' }}</span>
    </div>
    <h1 class="ahr__price">{{ hero.priceFmt }}</h1>
    <div class="ahr__variation">
      <span v-if="hero.changeLine" class="ahr__delta" :class="`ahr__delta--${hero.dir}`">
        <svg width="11" height="11" viewBox="0 0 10 10" class="ahr__tri" :class="{ 'ahr__tri--down': hero.dir === 'down' }"><path d="M5 1.5l3.5 6H1.5z" fill="currentColor" /></svg>{{ hero.changeLine }}
      </span>
      <span v-if="hero.metaLine" class="ahr__meta">{{ hero.metaLine }}</span>
    </div>
    <div class="ahr__ctas">
      <NuxtLink to="/busca" class="ahr__primary">Perguntar à Redentia AI</NuxtLink>
      <NuxtLink to="/carteira" class="ahr__outline">Adicionar à carteira</NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.ahr {
  background: var(--nu-cream);
  padding: clamp(56px, 8vw, 104px) clamp(22px, 5.5vw, 80px) clamp(56px, 7vw, 88px);
  animation: nu-fade .5s ease both;
}
.ahr__badges { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.ahr__company { color: var(--nu-blue); font-size: clamp(17px, 1.6vw, 21px); font-weight: 800; letter-spacing: -.2px; }
.ahr__exchange {
  display: inline-flex; align-items: center; border: 2px solid var(--nu-ink-14);
  color: var(--nu-gray); font-size: 13px; font-weight: 800; padding: 5px 13px;
  border-radius: var(--nu-r-pill);
}
.ahr__position {
  display: inline-flex; align-items: center; background: var(--nu-blue-tint); color: var(--nu-blue);
  font-size: 13px; font-weight: 800; padding: 7px 15px; border-radius: var(--nu-r-pill);
  font-variant-numeric: tabular-nums;
}
.ahr__price {
  margin: 14px 0 0; color: var(--nu-ink); font-size: clamp(54px, 8.5vw, 106px);
  font-weight: 800; letter-spacing: -0.045em; line-height: 0.98; font-variant-numeric: tabular-nums;
}
.ahr__variation { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-top: 26px; }
.ahr__delta {
  display: inline-flex; align-items: center; gap: 7px; font-size: 15.5px; font-weight: 800;
  padding: 9px 18px; border-radius: var(--nu-r-pill); font-variant-numeric: tabular-nums;
}
.ahr__delta--up { background: var(--nu-green-bg); color: var(--nu-green-2); }
.ahr__delta--down { background: var(--nu-red-tint); color: var(--nu-red-2); }
.ahr__tri { display: block; }
.ahr__tri--down { transform: rotate(180deg); }
.ahr__meta { color: var(--nu-gray); font-size: 15.5px; font-weight: 600; }
.ahr__ctas { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-top: 44px; }
.ahr__primary {
  display: inline-flex; align-items: center; gap: 10px; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 17px 30px; font-size: 17px; font-weight: 700;
  transition: background .2s, transform .15s;
}
.ahr__primary:hover { background: var(--nu-blue-hover); color: var(--nu-white); transform: translateY(-2px); }
.ahr__outline {
  display: inline-flex; align-items: center; gap: 10px; background: transparent; color: var(--nu-blue);
  border: 2px solid var(--nu-blue); border-radius: var(--nu-r-pill); padding: 15px 28px;
  font-size: 17px; font-weight: 700; transition: background .2s;
}
.ahr__outline:hover { background: var(--nu-blue-tint-2); color: var(--nu-blue); }
</style>
