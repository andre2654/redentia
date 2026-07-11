<script setup lang="ts">
// Hero do /mercado: proposta de valor + captura de e-mail + painel do orb com
// 3 float cards (cotação, Redentia Score, notícia). Valores exatos do design.
// Form de e-mail: navega pra /login?email=<valor> (sem POST — contrato PR1).
const { cards } = useNuHeroCards()
const { featured, loaded: newsLoaded } = useNuNews()

const email = ref('')
function submit() {
  const v = email.value.trim()
  navigateTo(v ? `/login?email=${encodeURIComponent(v)}` : '/login')
}

// Card 3 ("Notícia agora"): manchete real quando o feed hidrata; senão o seed.
const newsTitle = computed(() => (newsLoaded.value ? featured.value.title : cards.value.newsTitle))
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
        <div class="mh__panel">
          <MercadoOrb />
        </div>
        <div class="mh__float mh__float--quote">
          <div class="mh__float-card">
            <div class="mh__float-label">{{ cards.quoteLabel }}</div>
            <div class="mh__quote-row">
              <span class="mh__price">{{ cards.price }}</span>
              <span class="mh__pill" :class="`mh__pill--${cards.dir}`">{{ cards.pct }}</span>
            </div>
          </div>
        </div>
        <div class="mh__float mh__float--score">
          <div class="mh__float-card mh__float-card--score">
            <div class="mh__float-label">Redentia Score</div>
            <div class="mh__score-row">
              <span class="mh__score">{{ cards.score }}</span>
              <span class="mh__score-max">/100</span>
            </div>
            <div class="mh__bar"><div class="mh__bar-fill" :style="{ width: `${cards.score}%` }" /></div>
          </div>
        </div>
        <div class="mh__float mh__float--news">
          <div class="mh__float-card mh__float-card--news">
            <div class="mh__float-label mh__float-label--dot"><span class="mh__dot" />Notícia agora</div>
            <div class="mh__news-title">{{ newsTitle }}</div>
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

.mh__right { flex: 1 1 380px; min-width: min(300px, 100%); position: relative; min-height: 500px; }
.mh__panel {
  position: absolute; inset: 0; border-radius: var(--nu-r-card-lg); overflow: hidden;
  background: radial-gradient(130% 130% at 72% 28%, var(--nu-orb-deep) 0%, var(--nu-orb-black) 72%);
}
.mh__float { position: absolute; z-index: 2; }
.mh__float--quote { top: -20px; left: -24px; animation: nu-bob 5.5s ease-in-out infinite alternate; }
.mh__float--score { top: 36%; right: -26px; animation: nu-bob 6.5s ease-in-out infinite alternate; animation-delay: 1.2s; }
.mh__float--news { bottom: -24px; left: 8%; animation: nu-bob 7s ease-in-out infinite alternate; animation-delay: 2.4s; }
.mh__float-card { background: var(--nu-white); border-radius: 20px; padding: 18px 22px; box-shadow: var(--nu-shadow-float); }
.mh__float-card--score { min-width: 174px; }
.mh__float-card--news { padding: 16px 20px; max-width: 250px; }
.mh__float-label {
  color: var(--nu-gray); font-size: 11.5px; font-weight: 800;
  letter-spacing: 1px; text-transform: uppercase;
}
.mh__float-label--dot { display: inline-flex; align-items: center; gap: 7px; }
.mh__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--nu-red); }
.mh__quote-row { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
.mh__price {
  color: var(--nu-ink); font-size: 27px; font-weight: 800; letter-spacing: -.5px;
  font-variant-numeric: tabular-nums;
}
.mh__pill {
  display: inline-flex; align-items: center; font-size: 12.5px; font-weight: 800;
  padding: 4px 11px; border-radius: var(--nu-r-pill);
}
.mh__pill--up { background: var(--nu-green-bg); color: var(--nu-green-2); }
.mh__pill--down { background: var(--nu-red-tint); color: var(--nu-red-2); }
.mh__score-row { display: flex; align-items: flex-end; gap: 6px; margin-top: 8px; }
.mh__score {
  color: var(--nu-blue); font-size: 30px; font-weight: 800; letter-spacing: -1px;
  line-height: .9; font-variant-numeric: tabular-nums;
}
.mh__score-max { color: var(--nu-gray); font-size: 14px; font-weight: 700; }
.mh__bar { height: 7px; border-radius: var(--nu-r-pill); background: var(--nu-score-track); overflow: hidden; margin-top: 12px; }
.mh__bar-fill { height: 100%; border-radius: var(--nu-r-pill); background: var(--nu-blue); }
.mh__news-title { color: var(--nu-ink); font-size: 15px; font-weight: 700; line-height: 1.4; margin-top: 8px; }

/* Mobile (ajustes do dono do design, 2026-07-11): o painel do orb vira
   full-bleed sem arredondamento, e os float cards ficam minimalistas e
   reposicionados PARA DENTRO do painel (nada estoura o viewport). */
@media (max-width: 760px) {
  /* painel full-bleed encosta direto na próxima seção (sem respiro creme) */
  .mh { padding-bottom: 0; }
  .mh__right { margin-inline: calc(var(--mh-pad) * -1); min-height: 460px; }
  .mh__panel { border-radius: 0; }

  .mh__float--quote { top: 14px; left: 14px; }
  .mh__float--score { top: 38%; right: 14px; }
  .mh__float--news { bottom: 14px; left: 14px; }

  .mh__float-card {
    padding: 10px 14px; border-radius: 14px;
    box-shadow: 0 12px 30px -18px rgba(5, 10, 25, 0.45);
  }
  .mh__float-card--score { min-width: 132px; }
  .mh__float-card--news { padding: 10px 14px; max-width: 220px; }
  .mh__float-label { font-size: 10px; letter-spacing: .8px; }
  .mh__quote-row { gap: 8px; margin-top: 5px; }
  .mh__price { font-size: 19px; }
  .mh__pill { font-size: 11px; padding: 3px 8px; }
  .mh__score-row { margin-top: 5px; }
  .mh__score { font-size: 22px; }
  .mh__score-max { font-size: 12px; }
  .mh__bar { height: 5px; margin-top: 8px; }
  .mh__news-title {
    font-size: 13px; margin-top: 6px;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
}
</style>
