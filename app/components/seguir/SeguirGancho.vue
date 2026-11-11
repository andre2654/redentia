<script setup lang="ts">
// Gancho do primeiro uso (card NÃO-modal): "Siga 3 ativos e receba um resumo
// deles no fim de cada pregão, por e-mail." Regras de quem vê, chips e
// conclusão no useSeguirGancho. Aparece no hero do /asset (creme → card
// branco) e na faixa "Seus ativos" da home (branco → card creme): a cor do
// card é escolhida pela SUPERFÍCIE onde ele pousa (regra 2 do design system).
//
// Client-only por construção: a fase nasce 'oculto' no SSR e na hidratação,
// e só vira 'ativo' depois do /auth/me e do GET /watchlist no mount.
//
// Robustez (11/11/2026, docs/aportou/robustez.md): o cartão chega com a entrada
// do sistema (720 ms, --nu-ease-saida); o chip sob o ponteiro escurece um tom e
// sobe 2 px, apertado afunda; o "Agora não" ganha o sublinhado que aparece (o
// do NuLinkSeta, sem seta: é dispensar, não ir); o check do "Pronto" pousa e se
// desenha nas curvas do sistema. Durações e curvas só por token.
const props = defineProps<{
  /** ticker da página (/asset) — vira o primeiro chip */
  atual?: string | null
  /** superfície onde o card pousa */
  surface: 'cream' | 'white'
}>()

const emit = defineEmits<{ visivel: [boolean] }>()

const { fase, chips, progresso, meta, comEmail, erro, quando, dispensar, alternar, isFollowing, isPending } =
  useSeguirGancho(() => props.atual)

watch(() => fase.value !== 'oculto', (v) => emit('visivel', v), { immediate: true })

const titulo = computed(() => (comEmail.value
  ? 'Siga 3 ativos e receba um resumo deles no fim de cada pregão, por e-mail.'
  : 'Siga 3 ativos e acompanhe a cotação deles na sua página inicial.'))
const pronto = computed(() => (comEmail.value
  ? `Pronto: você recebe o resumo ${quando.value}`
  : 'Pronto: seus ativos estão na sua página inicial'))
</script>

<template>
  <section
    v-if="fase !== 'oculto'" class="sgg" :class="`sgg--on-${props.surface}`"
    aria-label="Siga 3 ativos"
  >
    <template v-if="fase === 'ativo'">
      <div class="sgg__head">
        <span class="sgg__icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.3l2.63 5.52 6.07.77-4.45 4.2 1.13 6.02L12 16.9l-5.38 2.91 1.13-6.02-4.45-4.2 6.07-.77z" /></svg>
        </span>
        <p class="sgg__title">{{ titulo }}</p>
      </div>

      <div class="sgg__chips">
        <button
          v-for="t in chips" :key="t" type="button" class="sgg__chip"
          :class="{ 'sgg__chip--on': isFollowing(t) }"
          :aria-pressed="isFollowing(t)" :aria-busy="isPending(t) || undefined"
          :aria-label="isFollowing(t) ? `Deixar de seguir ${t}` : `Seguir ${t}`"
          @click="alternar(t)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" :fill="isFollowing(t) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.3l2.63 5.52 6.07.77-4.45 4.2 1.13 6.02L12 16.9l-5.38 2.91 1.13-6.02-4.45-4.2 6.07-.77z" /></svg>
          {{ t }}
        </button>
      </div>

      <p v-if="erro" class="sgg__err" role="alert">{{ erro }}</p>

      <div class="sgg__foot">
        <div
          class="sgg__prog" role="progressbar" :aria-valuemin="0" :aria-valuemax="meta"
          :aria-valuenow="progresso" :aria-label="`${progresso} de ${meta} ativos seguidos`"
        >
          <span v-for="i in meta" :key="i" class="sgg__seg" :class="{ 'sgg__seg--on': i <= progresso }" />
          <span class="sgg__count">{{ progresso }}/{{ meta }}</span>
        </div>
        <button type="button" class="sgg__later" @click="dispensar">Agora não</button>
      </div>
    </template>

    <p v-else class="sgg__done" role="status">
      <span class="sgg__check" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path pathLength="1" d="M4 12l5 5L20 6" /></svg>
      </span>
      {{ pronto }}
    </p>
  </section>
</template>

<style scoped>
.sgg {
  border-radius: var(--nu-r-card); padding: clamp(24px, 3vw, 32px);
  max-width: 760px; animation: nu-fade var(--nu-dur-entrada) var(--nu-ease-saida) both;
}
/* sobre o painel creme o cartão é branco; sobre a página, é o cartão creme da marca */
.sgg--on-cream { background: var(--nu-white); margin-top: 32px; box-shadow: var(--nu-shadow-branco); }
.sgg--on-white { background: var(--nu-band); box-shadow: var(--nu-shadow-quente); }

.sgg__head { display: flex; align-items: flex-start; gap: 14px; }
.sgg__icon {
  width: 38px; height: 38px; flex-shrink: 0; border-radius: var(--nu-r-chip);
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--nu-blue-bg); color: var(--nu-blue);
}
.sgg__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(17px, 1.6vw, 20px);
  font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); line-height: 1.3; padding-top: 6px;
}

.sgg__chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 24px; }
.sgg__chip {
  display: inline-flex; align-items: center; gap: 8px; border: none; cursor: pointer;
  border-radius: var(--nu-r-pill); min-height: 44px; padding: 0 16px; font-size: 15px; font-weight: var(--nu-w-forte); letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums; color: var(--nu-ink); -webkit-tap-highlight-color: transparent;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), color var(--nu-dur-media) var(--nu-ease-cor),
    transform var(--nu-dur-media) var(--nu-ease-saida), box-shadow var(--nu-dur-media) var(--nu-ease-saida);
}
.sgg--on-cream .sgg__chip { background: var(--nu-cream-2); }
/* o chip branco sobre o cartão quente: a sombra de cartão branco */
.sgg--on-white .sgg__chip { background: var(--nu-white); box-shadow: var(--nu-shadow-branco); }
/* sob o ponteiro, o chip escurece um tom e sobe 2 px */
.sgg--on-cream .sgg__chip:hover { background: color-mix(in srgb, var(--nu-ink) 6%, var(--nu-cream-2)); }
.sgg--on-white .sgg__chip:hover { box-shadow: var(--nu-shadow-card); }
.sgg__chip:hover { transform: translateY(-2px); }
.sgg .sgg__chip--on { background: var(--nu-blue-bg); color: var(--nu-blue-text); }
.sgg .sgg__chip--on:hover { background: color-mix(in srgb, var(--nu-blue) 18%, var(--nu-blue-bg)); }
.sgg__chip[aria-busy='true'] { cursor: progress; }
.sgg__chip:active { transform: scale(.97); transition-duration: var(--nu-dur-rapida); }
.sgg__chip:focus-visible, .sgg__later:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 2px; }

.sgg__err { margin: 16px 0 0; color: var(--nu-red-text); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.5; }

.sgg__foot { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 24px; flex-wrap: wrap; }
.sgg__prog { display: inline-flex; align-items: center; gap: 6px; }
.sgg__seg { width: 30px; height: 6px; border-radius: var(--nu-r-pill); background: var(--nu-line-2); transition: background-color var(--nu-dur-lenta) var(--nu-ease-cor); }
.sgg--on-white .sgg__seg { background: var(--nu-line); }
.sgg .sgg__seg--on { background: var(--nu-blue); }
.sgg__count { margin-left: 6px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums; }
/* "Agora não": dispensar, não ir; o sublinhado aparece como o do NuLinkSeta */
.sgg__later {
  background: none; border: none; cursor: pointer; min-height: 44px; padding: 0 4px;
  color: var(--nu-gray-3); font-family: inherit; font-size: 15px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto);
  text-decoration-line: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; text-decoration-color: transparent;
  transition: color var(--nu-dur-media) var(--nu-ease-cor), text-decoration-color var(--nu-dur-media) var(--nu-ease-cor);
  -webkit-tap-highlight-color: transparent;
}
.sgg__later:hover { color: var(--nu-ink); text-decoration-color: currentColor; }
.sgg__later:active { opacity: .72; }

.sgg__done { display: flex; align-items: center; gap: 12px; margin: 0; color: var(--nu-ink); font-size: clamp(16px, 1.5vw, 18px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-texto); line-height: 1.4; }
.sgg__check {
  width: 32px; height: 32px; flex-shrink: 0; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--nu-green-bg); color: var(--nu-green-text);
  animation: sgg-pousa var(--nu-dur-lenta) var(--nu-ease-saida) backwards;
}
/* o check se desenha, uma vez */
.sgg__check path { stroke-dasharray: 1; animation: sgg-desenha var(--nu-dur-lenta) var(--nu-ease-troca) 200ms backwards; }
@keyframes sgg-pousa { from { opacity: 0; transform: scale(.6); } }
@keyframes sgg-desenha { from { stroke-dashoffset: 1; } }
@media (prefers-reduced-motion: reduce) { .sgg, .sgg__check, .sgg__check path { animation: none; } .sgg__chip { transition: none; } }
</style>
