<script setup lang="ts">
// Gancho do primeiro uso (card NÃO-modal): "Siga 3 ativos e receba um resumo
// deles no fim de cada pregão, por e-mail." Regras de quem vê, chips e
// conclusão no useSeguirGancho. Aparece no hero do /asset (creme → card
// branco) e na faixa "Seus ativos" da home (branco → card creme): a cor do
// card é escolhida pela SUPERFÍCIE onde ele pousa (regra 2 do design system).
//
// Client-only por construção: a fase nasce 'oculto' no SSR e na hidratação,
// e só vira 'ativo' depois do /auth/me e do GET /watchlist no mount.
// A classe raiz `.sgg` é o sinal que o NuMcpPromo lê pra não abrir por cima.
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
      </span>
      {{ pronto }}
    </p>
  </section>
</template>

<style scoped>
.sgg {
  border-radius: var(--nu-r-card); padding: clamp(20px, 3vw, 28px);
  max-width: 760px; animation: nu-fade .5s ease both;
}
/* card sobre creme é branco; sobre branco é creme (regra 2) */
.sgg--on-cream { background: var(--nu-white); margin-top: 32px; }
.sgg--on-white { background: var(--nu-cream); }

.sgg__head { display: flex; align-items: flex-start; gap: 14px; }
.sgg__icon {
  width: 36px; height: 36px; flex-shrink: 0; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--nu-blue-bg); color: var(--nu-blue);
}
.sgg__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(17px, 1.6vw, 20px);
  font-weight: 800; letter-spacing: -.2px; line-height: 1.35; padding-top: 5px;
}

.sgg__chips { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
.sgg__chip {
  display: inline-flex; align-items: center; gap: 7px; border: none; cursor: pointer;
  border-radius: var(--nu-r-pill); padding: 11px 16px; font-size: 15px; font-weight: 800;
  font-variant-numeric: tabular-nums; color: var(--nu-ink);
  transition: background .2s, color .2s, transform .15s;
}
.sgg--on-cream .sgg__chip { background: var(--nu-cream); }
.sgg--on-white .sgg__chip { background: var(--nu-white); }
.sgg__chip:hover { transform: translateY(-2px); }
.sgg .sgg__chip--on { background: var(--nu-blue-bg); color: var(--nu-blue); }
.sgg__chip[aria-busy='true'] { cursor: progress; }
.sgg__chip:focus-visible, .sgg__later:focus-visible { outline: 3px solid var(--nu-blue-30); outline-offset: 2px; }

.sgg__err { margin: 14px 0 0; color: var(--nu-red-2); font-size: 14.5px; font-weight: 600; line-height: 1.5; }

.sgg__foot { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 20px; flex-wrap: wrap; }
.sgg__prog { display: inline-flex; align-items: center; gap: 6px; }
.sgg__seg { width: 30px; height: 6px; border-radius: var(--nu-r-pill); background: var(--nu-cream-3); transition: background .2s; }
.sgg--on-white .sgg__seg { background: var(--nu-sand-2); }
.sgg .sgg__seg--on { background: var(--nu-blue); }
.sgg__count { margin-left: 6px; color: var(--nu-gray); font-size: 14px; font-weight: 800; font-variant-numeric: tabular-nums; }
.sgg__later {
  background: none; border: none; cursor: pointer; padding: 8px 4px;
  color: var(--nu-gray); font-size: 14.5px; font-weight: 700;
}
.sgg__later:hover { color: var(--nu-ink); text-decoration: underline; }

.sgg__done { display: flex; align-items: center; gap: 12px; margin: 0; color: var(--nu-ink); font-size: clamp(16px, 1.5vw, 18px); font-weight: 800; line-height: 1.4; }
.sgg__check {
  width: 32px; height: 32px; flex-shrink: 0; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--nu-green-bg); color: var(--nu-green-2);
}
</style>
