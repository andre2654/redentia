<script setup lang="ts">
// Banner promo "A Redentia AI explica cada tese pra você" (banda azul do
// /teses — contrato: Redentia Teses Nu.dc.html, §slot 'teses-promo-ai').
// Imagem real quando existir em public/teses/promo-ai.webp (ver README da
// pasta); o @error some com o <img> e fica o fundo --nu-blue-hover, que é o
// fallback do próprio design (#2258DB).
const photoFailed = ref(false)
</script>

<template>
  <section class="tab">
    <div class="tab__cols">
      <div class="tab__media" role="img" aria-label="Redentia AI explicando uma tese">
        <!-- :src dinâmico (não estático) — senão o Vite tenta resolver o asset
             em build e falha enquanto o arquivo não existe em public/ -->
        <img
          v-show="!photoFailed" :src="'/teses/promo-ai.webp'" alt=""
          class="tab__img" loading="lazy" @error="photoFailed = true"
        >
      </div>
      <div class="tab__text">
        <h2 class="tab__title">A Redentia AI explica<br>cada tese pra você</h2>
        <p class="tab__p">Ela leu as centenas de fontes por trás de cada tese e responde em segundos: por que a ideia existe, quais ações entram e o que pode dar errado. Um analista ao seu lado, 24 horas por dia.</p>
        <NuxtLink to="/busca" class="tab__cta">
          Conhecer a Redentia AI<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tab { background: var(--nu-blue); padding: clamp(48px, 6vw, 84px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.tab__cols { display: flex; gap: clamp(32px, 5vw, 72px); align-items: center; flex-wrap: wrap; }
.tab__media {
  flex: 0 1 420px; min-width: min(280px, 100%); position: relative;
  height: clamp(260px, 26vw, 360px); border-radius: 18px; overflow: hidden;
  background: var(--nu-blue-hover);
}
.tab__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.tab__text { flex: 1 1 440px; min-width: min(300px, 100%); }
.tab__title { margin: 0; color: var(--nu-white); font-size: clamp(34px, 4.6vw, 60px); font-weight: 800; letter-spacing: -0.045em; line-height: 1.04; }
.tab__p { color: var(--nu-white-85); font-size: clamp(16px, 1.7vw, 20px); font-weight: 500; line-height: 1.55; margin: 22px 0 0; max-width: 520px; }
.tab__cta {
  display: inline-flex; align-items: center; gap: 9px; background: transparent; color: var(--nu-white);
  border: 2px solid var(--nu-white-85); border-radius: var(--nu-r-pill); padding: 15px 30px;
  font-size: 16.5px; font-weight: 800; margin-top: clamp(26px, 3vw, 36px); transition: background .2s;
}
.tab__cta:hover { background: var(--nu-white-14); color: var(--nu-white); }
</style>
