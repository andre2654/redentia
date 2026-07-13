<script setup lang="ts">
// Miolo da home `/` (PR1; home única desde 2026-07-13, direção do dono): o
// MERCADO é a página inicial pros DOIS casos e este componente é AUTH-AWARE —
// anônimo vê o conteúdo público exatamente como no contrato
// (designs-v2/Redentia Mercado Nu.dc.html), logado vê as MESMAS seções com
// variações por conveniência:
//  - hero sem form de signup (bloco de boas-vindas + CTA pra /carteira) e o
//    card branco da direita vira o mini-dashboard "Sua carteira hoje"
//    (variações dentro do MercadoHero, que recebe o resumo via prop)
//  - banda azul de marketing "Sua carteira, conectada." → vira "Sua carteira"
//    (MercadoSuaCarteira: patrimônio centralizado + atalhos pra /carteira;
//    sem Open Finance → convite de conexão; resumo indisponível → a banda
//    some — nunca número inventado)
//  - CTA dos movers pra criar conta → "Acompanhe estes ativos na sua
//    carteira" (dentro do MercadoMovers)
//  - CTA final de signup (NuCtaPhoto) some (padrão do /tesouro)
// FAQ, Explore, teses, dia no mercado, tesouro, notícias e blog ficam pros
// dois. Ordem do design (refresh PR-R5): hero → carteira → teses → O mercado
// hoje → explore → O dia no mercado → tesouro → notícias → blog → FAQ → CTA.
// SEO fica na página (index.vue) — head único, não varia por auth.
const { isAuthenticated, clearSession } = useAuthState()

// resumo da carteira (só logado; anônimo não dispara fetch — o composable
// devolve null sem token). Token morto (401/403) → limpa a sessão AQUI e a
// página inteira degrada pro conteúdo anônimo na mesma resposta SSR — o
// conteúdo público É a resposta certa pra `/` sem sessão (padrão documentado).
const resumoData = isAuthenticated.value ? await useCarteiraResumo() : null
if (resumoData?.data.value?.unauthenticated) {
  clearSession() // Set-Cookie de limpeza sai na própria resposta SSR
}
const resumo = computed(() =>
  resumoData?.data.value && !resumoData.data.value.unauthenticated ? resumoData.data.value : null)

const { featured, rows } = useNuNews()

// "O dia no mercado" (PR-R4): o briefing do Atlas (sempre com seed → a seção
// nunca some no /mercado) mapeado nos 4 tópicos da seção-gatilho + modal.
const { briefing } = useNuBriefing()
const dayTopics = computed(() => dayTopicsFromNuBriefing(briefing.value))

const guiaRef = ref<HTMLElement | null>(null)
function guiaScroll(d: number) {
  guiaRef.value?.scrollBy({ left: d * 392, behavior: 'smooth' })
}
</script>

<template>
  <div>
    <!-- o hero recebe o resumo pro mini-dashboard "Sua carteira hoje" no card
         branco da direita (logado); anônimo/indisponível → animação intacta -->
    <MercadoHero :resumo="resumo" />

    <!-- anônimo: banda de marketing do Open Finance · logado: patrimônio
         centralizado + atalhos pra /carteira (ou convite de conexão);
         resumo indisponível → nada -->
    <MercadoCarteiraConectada v-if="!isAuthenticated" />
    <MercadoSuaCarteira v-else-if="resumo" :resumo="resumo" />

    <NuTeseStrip />

    <MercadoMovers />

    <!-- Explore por onde começar -->
    <section class="mex">
      <div class="mex__cols">
        <div class="mex__left">
          <NuSectionHeading>Explore por<br>onde começar.</NuSectionHeading>
          <div class="mex__sub">Conteúdo aberto, não precisa de conta.</div>
        </div>
        <div class="mex__rows">
          <NuxtLink v-for="ex in MERCADO_EXPLORE" :key="ex.t" :to="ex.href" class="mex__row">
            <span class="mex__row-main">
              <span class="mex__row-title">{{ ex.t }}</span>
              <span class="mex__row-desc">{{ ex.d }}</span>
            </span>
            <span class="mex__row-circle">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <NuDaySection tone="mercado" :meta-line="briefing.metaLine" :topics="dayTopics" />

    <MercadoTesouro />

    <!-- Notícias do mercado -->
    <section class="mnw">
      <NuSectionHeading>Notícias do<br>mercado.</NuSectionHeading>
      <div class="mnw__featured">
        <NuNewsFeatured :item="featured" />
      </div>
      <div class="mnw__rows">
        <NuNewsRow v-for="(n, i) in rows" :key="i" :item="n" />
      </div>
      <NuxtLink to="/noticias" class="mnw__all">
        <span class="mnw__all-circle">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </span>
        <span class="mnw__all-label">Ver todas as notícias</span>
      </NuxtLink>
    </section>

    <!-- Blog / Guias (carrossel horizontal que sangra à direita) -->
    <section class="mbg">
      <div class="mbg__cols">
        <div class="mbg__left">
          <h2 class="mbg__title">Explore mais no blog da Redentia</h2>
          <NuxtLink to="/guias" class="mbg__cta">
            Ir para o Blog<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M8 7h9v9" /></svg>
          </NuxtLink>
        </div>
        <div class="mbg__right">
          <div ref="guiaRef" class="mbg__track">
            <NuGuideCard v-for="gc in MERCADO_GUIDES" :key="gc.title" :card="gc" />
          </div>
          <div class="mbg__nav">
            <button type="button" class="mbg__nav-btn" aria-label="Anterior" @click="guiaScroll(-1)">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
            <button type="button" class="mbg__nav-btn" aria-label="Próximo" @click="guiaScroll(1)">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ (id="faq": a CTA da coluna esquerda ancora no próprio accordion) -->
    <section id="faq" class="mfq">
      <div class="mfq__cols">
        <div class="mfq__left">
          <NuSectionHeading>Ficou com alguma<br>dúvida?</NuSectionHeading>
          <div class="mfq__copy">Encontre respostas para as principais dúvidas sobre produtos e serviços da Redentia.</div>
          <a href="#faq" class="mfq__cta">Confira perguntas frequentes</a>
        </div>
        <div class="mfq__right">
          <NuFaqAccordion :items="MERCADO_FAQS" />
        </div>
      </div>
    </section>

    <!-- CTA final de signup (NuCtaPhoto — implementação única do padrão; foto
         default /img/mercado/cta-pessoas.webp): só pra visitante deslogado,
         mesmo padrão do /tesouro -->
    <NuCtaPhoto
      v-if="!isAuthenticated"
      :primary="{ label: 'Criar conta grátis', to: '/login' }"
      :secondary="{ label: 'Falar com a Redentia AI', to: '/busca' }"
    >
      <template #title>Pronto para investir<br>com uma IA do seu lado?</template>
      <template #subtitle>Crie sua conta em menos de 2 minutos: grátis, sem cartão.</template>
    </NuCtaPhoto>
  </div>
</template>

<style scoped>
/* ——— Explore ——— */
.mex { background: var(--nu-white); padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.mex__cols { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.mex__left { flex: 1 1 300px; min-width: min(280px, 100%); }
.mex__sub { color: var(--nu-gray); font-size: 17px; font-weight: 600; line-height: 1.5; margin-top: 22px; }
.mex__rows { flex: 1.5 1 480px; min-width: min(340px, 100%); display: flex; flex-direction: column; gap: 14px; }
.mex__row {
  display: flex; align-items: center; gap: 18px; background: var(--nu-cream);
  border-radius: var(--nu-r-card); padding: 24px 26px; cursor: pointer;
  transition: background .2s, transform .15s;
}
.mex__row:hover { background: var(--nu-cream-4); transform: translateY(-2px); }
.mex__row-main { flex: 1; min-width: 0; }
.mex__row-title { display: block; color: var(--nu-ink); font-size: 20px; font-weight: 800; letter-spacing: -.3px; }
.mex__row-desc { display: block; color: var(--nu-gray); font-size: 15px; font-weight: 600; line-height: 1.5; margin-top: 6px; }
.mex__row-circle {
  width: 46px; height: 46px; flex-shrink: 0; border-radius: 50%; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center;
}

/* ——— Notícias ——— */
.mnw { background: var(--nu-white); padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.mnw__featured { margin-top: 44px; }
.mnw__rows { margin-top: 38px; }
.mnw__all { display: inline-flex; align-items: center; gap: 14px; margin-top: 36px; transition: gap .2s; }
.mnw__all:hover { gap: 19px; }
.mnw__all-circle {
  width: 52px; height: 52px; border-radius: 50%; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.mnw__all-label { color: var(--nu-ink); font-size: 18px; font-weight: 800; }

/* ——— Blog / Guias ——— */
.mbg {
  background: var(--nu-cream);
  padding: clamp(60px, 8vw, 104px) 0 clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.mbg__cols { display: flex; gap: clamp(28px, 4vw, 60px); align-items: center; flex-wrap: wrap; }
.mbg__left { flex: 0 1 360px; min-width: min(280px, 100%); padding-right: 22px; }
.mbg__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(38px, 4.6vw, 58px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.06; max-width: 360px;
}
.mbg__cta {
  display: inline-flex; align-items: center; gap: 9px; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 26px; font-size: 16px; font-weight: 700;
  margin-top: 30px; transition: background .2s;
}
.mbg__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.mbg__right { flex: 1 1 480px; min-width: min(320px, 100%); }
.mbg__track { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 6px 22px 6px 2px; }
.mbg__nav { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; padding-right: clamp(22px, 5.5vw, 80px); }
.mbg__nav-btn {
  width: 46px; height: 46px; border-radius: 50%; background: var(--nu-blue); border: none;
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .2s;
}
.mbg__nav-btn:hover { background: var(--nu-blue-hover); }

/* ——— FAQ ——— */
.mfq { background: var(--nu-white); padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.mfq__cols { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.mfq__left { flex: 1 1 300px; min-width: min(280px, 100%); }
.mfq__copy { color: var(--nu-gray-2); font-size: 17px; font-weight: 500; line-height: 1.6; margin-top: 22px; max-width: 420px; }
.mfq__cta {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 26px; font-size: 16px; font-weight: 700;
  margin-top: 30px; transition: background .2s;
}
.mfq__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.mfq__right { flex: 1.6 1 480px; min-width: min(340px, 100%); }

/* (CTA final extraída pro NuCtaPhoto — estilos vivem lá) */
</style>
