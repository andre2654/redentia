<script setup lang="ts">
// "O que sustenta — e o que ameaça" (design): banda azul com 3 cards
// #2456C9 radius 26 — 'A FAVOR' (bullets com check verde), 'SINAL DE RISCO'
// (bullets com triangle-alert âmbar) e 'RISCO CENTRAL' (título grande +
// parágrafo + footer 'Monitorado na revalidação diária' colado embaixo).
// Cards sem conteúdo somem (auto-fit reacomoda).
//
// PAYWALL (dono 2026-07-14): pro ANÔNIMO o conteúdo (a favor / sinal / risco
// central) entra embaçado — o título fica nítido pra dar o gancho, o miolo
// fica atrás do cadastro (o gate da avaliação por ativo é a chamada). Logado
// vê tudo. O texto continua no HTML (blur é só visual → SEO preservado).
import type { TeseDriversVM } from '~/types/tese'

defineProps<{ drivers: TeseDriversVM }>()

const { isAuthenticated } = useAuthState()
</script>

<template>
  <section class="tdr">
    <NuSectionHeading dark>O que sustenta<br>e o que ameaça.</NuSectionHeading>
    <div
      class="tdr__grid"
      :class="{ 'tdr__grid--locked': !isAuthenticated }"
      :aria-hidden="!isAuthenticated || undefined"
    >
      <div v-if="drivers.favor.length" class="tdr__card">
        <span class="tdr__lbl tdr__lbl--favor">A favor</span>
        <div class="tdr__list">
          <span v-for="(b, i) in drivers.favor" :key="i" class="tdr__item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="tdr__icon tdr__icon--check"><path d="M20 6L9 17l-5-5" /></svg>
            <span class="tdr__item-txt">{{ b }}</span>
          </span>
        </div>
      </div>
      <div v-if="drivers.sinal.length" class="tdr__card">
        <span class="tdr__lbl tdr__lbl--sinal">Sinal de risco</span>
        <div class="tdr__list">
          <span v-for="(b, i) in drivers.sinal" :key="i" class="tdr__item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="tdr__icon tdr__icon--alert"><path d="M12 9v4M12 17h.01M10.3 3.9L2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
            <span class="tdr__item-txt">{{ b }}</span>
          </span>
        </div>
      </div>
      <div v-if="drivers.risco" class="tdr__card tdr__card--risco">
        <span class="tdr__lbl tdr__lbl--risco">Risco central</span>
        <div class="tdr__risco-title">{{ drivers.risco.title }}</div>
        <div class="tdr__risco-body">{{ drivers.risco.body }}</div>
        <div class="tdr__risco-foot">
          <span class="tdr__dot" />
          <span class="tdr__foot-txt">Monitorado na revalidação diária</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tdr {
  background: var(--nu-blue);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.tdr__grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px; margin-top: 40px;
}
/* embaçado (anônimo): conteúdo tease não-interativo, atrás do cadastro */
.tdr__grid--locked { filter: blur(7px); opacity: .55; pointer-events: none; user-select: none; }
.tdr__card { background: var(--nu-blue-deep); border-radius: var(--nu-r-card-lg); padding: 28px; }
.tdr__card--risco { display: flex; flex-direction: column; }
.tdr__lbl { font-size: 12.5px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; }
.tdr__lbl--favor { color: var(--nu-green-soft); }
.tdr__lbl--sinal { color: var(--nu-amber-soft); }
.tdr__lbl--risco { color: var(--nu-red-soft); }
.tdr__list { display: flex; flex-direction: column; gap: 13px; margin-top: 18px; }
.tdr__item { display: flex; align-items: flex-start; gap: 10px; }
.tdr__icon { flex-shrink: 0; margin-top: 3px; }
.tdr__icon--check { stroke: var(--nu-green-soft); }
.tdr__icon--alert { stroke: var(--nu-amber-soft); }
.tdr__item-txt { color: var(--nu-cream-text-88); font-size: 15px; font-weight: 500; line-height: 1.55; }
.tdr__risco-title {
  color: var(--nu-cream-text); font-size: clamp(20px, 1.9vw, 24px); font-weight: 800;
  letter-spacing: -.3px; line-height: 1.3; margin-top: 18px;
}
.tdr__risco-body { color: var(--nu-cream-text-78); font-size: 15px; font-weight: 500; line-height: 1.6; margin-top: 12px; }
.tdr__risco-foot {
  display: inline-flex; align-items: center; gap: 8px;
  border-top: 1px solid var(--nu-cream-text-16); margin-top: auto; padding-top: 16px;
}
.tdr__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--nu-red-soft); }
.tdr__foot-txt { color: var(--nu-cream-text-65); font-size: 13px; font-weight: 700; }
</style>
