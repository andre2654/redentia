<script setup lang="ts">
// Grid "Sua jornada com mais vantagens" (banda azul, 4 cards --nu-teses-benefit,
// auto-fit 4/2/1 colunas) — contrato: Redentia Teses Nu.dc.html, âncora #explorar.
// Conteúdo 100% estático (copy verbatim do design).
</script>

<template>
  <section id="explorar" class="tvt">
    <h2 class="tvt__title">Sua jornada com mais vantagens</h2>
    <div class="tvt__grid">
      <div class="tvt__card">
        <svg class="tvt__icon" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="2.5" /><path d="M2.5 10h19" /><path d="M6 14.5h4" /></svg>
        <h3 class="tvt__h3">Carteira pronta</h3>
        <p class="tvt__p">Invista na tese inteira com um toque: a Redentia monta a carteira com o peso de cada ação por você.</p>
      </div>
      <div class="tvt__card">
        <svg class="tvt__icon" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4l1.7 4.8L17.5 10.5l-4.8 1.7L11 17l-1.7-4.8L4.5 10.5l4.8-1.7L11 4z" /><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z" /></svg>
        <h3 class="tvt__h3">Redentia AI</h3>
        <p class="tvt__p">Um assessor 24 horas que leu as centenas de fontes de cada tese e responde qualquer dúvida em segundos.</p>
      </div>
      <div class="tvt__card">
        <svg class="tvt__icon" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" /></svg>
        <h3 class="tvt__h3">Sempre revalidada</h3>
        <p class="tvt__p">A cada balanço ou notícia, a IA revê a convicção da tese e avisa você quando os fatos mudam.</p>
      </div>
      <div class="tvt__card">
        <svg class="tvt__icon" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="2.5" width="16" height="19" rx="2.5" /><path d="M8 7h8" /><path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" /></svg>
        <h3 class="tvt__h3">Ferramentas grátis</h3>
        <p class="tvt__p">Preço teto, juros compostos e renda passiva: simule seus investimentos em segundos, sem pagar nada.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tvt {
  background: var(--nu-blue);
  padding: clamp(56px, 7vw, 96px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both; scroll-margin-top: 70px;
}
.tvt__title {
  margin: 0 auto; max-width: 900px; text-align: center; color: var(--nu-white);
  font-size: clamp(34px, 5vw, 64px); font-weight: 800; letter-spacing: -0.045em; line-height: 1.04;
}
.tvt__grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: clamp(16px, 1.5vw, 22px); margin-top: clamp(40px, 5vw, 64px);
}
.tvt__card {
  background: var(--nu-teses-benefit); border-radius: 20px;
  padding: clamp(26px, 2.2vw, 34px); display: flex; flex-direction: column;
}
.tvt__icon { flex-shrink: 0; }
.tvt__h3 { margin: 22px 0 0; color: var(--nu-white); font-size: clamp(21px, 1.9vw, 25px); font-weight: 800; letter-spacing: -.3px; line-height: 1.15; }
.tvt__p { margin: 14px 0 0; color: var(--nu-white-72); font-size: 16px; font-weight: 500; line-height: 1.55; }
</style>
