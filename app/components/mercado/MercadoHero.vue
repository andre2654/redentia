<script setup lang="ts">
// Hero do /mercado: proposta de valor + captura de e-mail (coluna esquerda) +
// card branco de leitura "Redentia lendo o mercado" (NuMarketReading tema light,
// PR-R2 — substitui o orb + 3 float cards).
// Form de e-mail: navega pra /login?email=<valor> (sem POST — contrato PR1).
const email = ref('')
function submit() {
  const v = email.value.trim()
  navigateTo(v ? `/login?email=${encodeURIComponent(v)}` : '/login')
}

// docText nasce em '1.240' (readN=0 → 1240+0, SSR-safe) e é espelhado pelo
// NuMarketReading via emit `doc` durante a animação (client).
const docText = ref('1.240')
</script>

<template>
  <section class="mh">
    <div class="mh__cols">
      <div class="mh__left">
        <div class="mh__eyebrow">O mercado, traduzido por IA</div>
        <h1 class="mh__title">Invista com uma<br>IA do seu lado.</h1>
        <div class="mh__dek">Análise fundamentalista pronta, alertas do que afeta a sua carteira e respostas na hora — sem planilha, sem economês.</div>
        <form class="mh__card" @submit.prevent="submit">
          <div class="mh__card-title">Crie sua conta e comece agora</div>
          <input v-model="email" type="email" placeholder="Digite seu e-mail" class="mh__input" autocomplete="email">
          <button type="submit" class="mh__cta">
            Começar grátis<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
          </button>
          <div class="mh__micro">Grátis para começar · sem cartão de crédito</div>
        </form>
      </div>

      <div class="mh__right">
        <div class="mh__anim">
          <div class="mh__anim-top">
            <div class="mh__anim-label">
              <span class="mh__anim-dot" aria-hidden="true" />
              <span class="mh__anim-title">Redentia lendo o mercado</span>
            </div>
            <p class="mh__anim-docs">{{ docText }} documentos analisados</p>
          </div>
          <div class="mh__anim-mid">
            <NuMarketReading theme="light" @doc="docText = $event" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mh {
  --mh-pad: clamp(22px, 5.5vw, 80px);
  background: var(--nu-cream);
  padding: clamp(64px, 9vw, 120px) var(--mh-pad) clamp(60px, 8vw, 100px);
  animation: nu-fade .5s ease both;
}
.mh__cols { display: flex; gap: clamp(28px, 5vw, 72px); align-items: stretch; flex-wrap: wrap; }
.mh__left {
  flex: 1.1 1 460px; min-width: min(320px, 100%);
  display: flex; flex-direction: column; justify-content: center;
}
.mh__eyebrow { color: var(--nu-blue); font-size: clamp(17px, 1.6vw, 21px); font-weight: 800; letter-spacing: -.2px; }
.mh__title {
  margin: 16px 0 0; color: var(--nu-ink);
  font-size: clamp(44px, 5.4vw, 84px); font-weight: 800; letter-spacing: -0.045em; line-height: 1.0;
}
.mh__dek {
  color: var(--nu-gray); font-size: clamp(17px, 1.8vw, 21px); font-weight: 600;
  line-height: 1.55; margin-top: 24px; max-width: 640px;
}
.mh__card {
  background: var(--nu-white); border-radius: var(--nu-r-card); padding: 26px;
  max-width: 480px; margin-top: 44px; box-shadow: var(--nu-shadow-card);
}
.mh__card-title { color: var(--nu-ink); font-size: 17px; font-weight: 800; }
.mh__input {
  width: 100%; background: var(--nu-cream); border: none; outline: none;
  border-radius: var(--nu-r-input); padding: 16px 18px; color: var(--nu-ink);
  font-size: 16px; font-weight: 600; margin-top: 16px;
}
.mh__cta {
  display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%;
  background: var(--nu-blue); color: var(--nu-white); border: none; cursor: pointer;
  border-radius: var(--nu-r-pill); padding: 16px 24px; font-size: 16.5px; font-weight: 800;
  margin-top: 12px; transition: background .2s;
}
.mh__cta:hover { background: var(--nu-blue-hover); }
.mh__micro { color: var(--nu-gray); font-size: 13px; font-weight: 600; margin-top: 14px; }

/* card branco de leitura (substitui o orb + float cards) */
.mh__right { flex: 1 1 400px; min-width: min(320px, 100%); display: flex; }
.mh__anim {
  position: relative; flex: 1;
  background: var(--nu-white);
  border: 1px solid var(--nu-navy-06);
  border-radius: var(--nu-r-card-lg);
  box-shadow: var(--nu-shadow-read-card);
  overflow: hidden;
  display: flex; flex-direction: column;
  min-height: 400px;
}
.mh__anim-top { display: flex; flex-direction: column; gap: 8px; padding: 28px 30px 0; }
.mh__anim-label { display: inline-flex; align-items: center; gap: 12px; }
.mh__anim-dot {
  width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0;
  background: var(--nu-blue);
  animation: mh-read-pulse 1.5s ease-in-out infinite;
}
.mh__anim-title {
  color: var(--nu-ink);
  font-size: clamp(22px, 2.4vw, 30px); font-weight: 800;
  letter-spacing: -0.025em; line-height: 1.04;
}
.mh__anim-docs {
  margin: 0; padding-left: 24px;
  color: var(--nu-gray);
  font-size: clamp(13px, 1.4vw, 15.5px); font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.mh__anim-mid {
  /* NÃO posicionar: o overlay do brand do NuMarketReading precisa ancorar no
     .mh__anim (o card) pra cobrir o card inteiro no morph — ver contrato lá. */
  flex: 1; display: flex; align-items: center;
  padding: clamp(20px, 2.6vw, 32px) clamp(24px, 3vw, 34px) clamp(28px, 3.4vw, 38px);
}
@keyframes mh-read-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: .5; }
}

/* Mobile: o card encosta full-bleed (como o orb fazia antes) e ganha respiro. */
@media (max-width: 760px) {
  .mh { padding-bottom: 0; }
  .mh__right { margin-inline: calc(var(--mh-pad) * -1); }
  .mh__anim { border-radius: 0; border-left: none; border-right: none; min-height: 440px; }
}
</style>
