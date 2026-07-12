<script setup lang="ts">
// Hero 'Sua carteira' (design Carteira Nu): eyebrow azul, patrimônio gigante
// fit-text (padrão do HomeHero — useFitText compartilhado) + botão-olho,
// pill do dia, '6 ativos · atualizado agora', 3 stats e CTAs; card branco
// 'Alocação por classe' à direita (barra stacked 14px + legenda).
// ESTADOS (Diretriz nº1): 'patrimonio' = números reais · 'connect' = o hero
// VIRA a experiência de conexão (CarteiraConnect protagonista + card de
// benefícios no lugar da alocação — sem número inventado).
import type { CarteiraAllocationVM, CarteiraHeroVM } from '~/types/carteira'

const props = defineProps<{ hero: CarteiraHeroVM; allocation: CarteiraAllocationVM[] }>()
const emit = defineEmits<{ (e: 'connected'): void }>()
const { hidden } = useHiddenValues()

const patrimonio = computed(() =>
  props.hero.patrimonio ? (hidden.value ? 'R$ ••••••' : props.hero.patrimonio) : null)
const hojeTxt = computed(() =>
  props.hero.hojeTxt ? (hidden.value ? '+R$ •• hoje' : props.hero.hojeTxt) : null)

const { el: valueEl } = useFitText(patrimonio)

// máscara das stats ('+R$ ••' / 'R$ ••' — padrão do design)
function statValue(s: CarteiraHeroVM['stats'][number]): string {
  if (!hidden.value) return s.value
  if (s.value.startsWith('+')) return '+R$ ••'
  if (s.value.startsWith('−') || s.value.startsWith('-')) return '−R$ ••'
  return 'R$ ••'
}
</script>

<template>
  <section class="chr">
    <div class="chr__cols">
      <div class="chr__main">
        <div class="chr__eyebrow">Sua carteira</div>

        <template v-if="hero.state === 'patrimonio'">
          <div class="chr__row">
            <h1 ref="valueEl" class="chr__value chr__value--fit">{{ patrimonio }}</h1>
            <NuEyeButton class="chr__eye" />
          </div>
          <div class="chr__meta">
            <span v-if="hojeTxt" class="chr__badge" :class="`chr__badge--${hero.hojeDir}`">
              <svg width="11" height="11" viewBox="0 0 10 10" :class="{ 'chr__tri--down': hero.hojeDir === 'down' }"><path d="M5 1.5l3.5 6H1.5z" fill="currentColor" /></svg>
              {{ hojeTxt }}
            </span>
            <span v-if="hero.metaLine" class="chr__meta-line">{{ hero.metaLine }}</span>
          </div>
          <div v-if="hero.stats.length" class="chr__stats">
            <span v-for="s in hero.stats" :key="s.label">
              <span class="chr__stat-label">{{ s.label }}</span>
              <span class="chr__stat-value" :class="`chr__stat-value--${s.tone}`">{{ statValue(s) }}</span>
            </span>
          </div>
          <div class="chr__ctas">
            <NuxtLink to="/busca" class="chr__cta">Novo aporte</NuxtLink>
            <NuxtLink to="/busca" class="chr__cta-outline">Rebalancear com a IA</NuxtLink>
          </div>
        </template>

        <template v-else>
          <h1 class="chr__value chr__value--connect">Conecte<br>sua carteira.</h1>
          <div class="chr__connect-sub">
            Traga suas posições pelo Open Finance — leitura automática regulada
            pelo Banco Central, sem acesso a movimentações. Patrimônio,
            proventos, movimentações e o Raio-X da IA aparecem aqui.
          </div>
          <div class="chr__ctas">
            <CarteiraConnect @connected="emit('connected')" />
            <NuxtLink to="/mercado" class="chr__cta-outline">Explorar o mercado</NuxtLink>
          </div>
        </template>
      </div>

      <div class="chr__aside">
        <!-- card de alocação (cheio) -->
        <div v-if="hero.state === 'patrimonio' && allocation.length" class="chr__card">
          <div class="chr__card-head">
            <span class="chr__card-title">Alocação por classe</span>
            <span class="chr__card-count">{{ allocation.length }} {{ allocation.length === 1 ? 'classe' : 'classes' }}</span>
          </div>
          <div class="chr__bar">
            <span
              v-for="a in allocation" :key="a.name" class="chr__bar-seg"
              :style="{ width: `${a.pctNum}%`, background: a.color }"
            />
          </div>
          <div class="chr__legend">
            <div v-for="a in allocation" :key="a.name" class="chr__legend-row">
              <span class="chr__legend-dot" :style="{ background: a.color }" />
              <span class="chr__legend-name">{{ a.name }}</span>
              <span class="chr__legend-val">{{ hidden ? 'R$ ••••' : a.val }}</span>
              <span class="chr__legend-pct">{{ a.pct }}</span>
            </div>
          </div>
        </div>

        <!-- vazio: o que aparece quando conectar (linguagem do design, sem números) -->
        <div v-else-if="hero.state === 'connect'" class="chr__card">
          <div class="chr__card-head">
            <span class="chr__card-title">O que aparece aqui</span>
          </div>
          <NuCheckList
            :items="[
              '<strong>Patrimônio consolidado</strong> — ações, FIIs, Tesouro e cripto num número só',
              '<strong>Renda passiva</strong> — proventos por mês e a agenda dos próximos pagamentos',
              '<strong>Raio-X da carteira</strong> — diagnóstico de diversificação, risco, renda e qualidade',
              '<strong>P&amp;L mês a mês</strong> — seu retorno mensal, com proventos',
            ]"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.chr {
  background: var(--nu-cream);
  padding: clamp(56px, 8vw, 104px) clamp(22px, 5.5vw, 80px) clamp(56px, 7vw, 88px);
  animation: nu-fade .5s ease both;
}
.chr__cols { display: flex; gap: clamp(28px, 5vw, 72px); align-items: center; flex-wrap: wrap; }
.chr__main { flex: 1.2 1 460px; min-width: min(320px, 100%); }
.chr__eyebrow { color: var(--nu-blue); font-size: clamp(17px, 1.6vw, 21px); font-weight: 800; letter-spacing: -.2px; }
.chr__row { display: flex; align-items: flex-end; gap: 20px; margin-top: 14px; }
.chr__value {
  margin: 0; color: var(--nu-ink); font-size: clamp(50px, 7vw, 96px);
  font-weight: 800; letter-spacing: -0.045em; line-height: 0.98;
  font-variant-numeric: tabular-nums;
}
.chr__value--fit { flex: 0 1 auto; min-width: 0; white-space: nowrap; overflow: hidden; }
.chr__value--connect { margin-top: 14px; }
.chr__eye { margin-bottom: 6px; width: 46px; height: 46px; }
.chr__meta { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-top: 24px; }
.chr__badge {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 15px; font-weight: 800; padding: 9px 17px;
  border-radius: var(--nu-r-pill); font-variant-numeric: tabular-nums;
}
.chr__badge--up { background: var(--nu-green-bg); color: var(--nu-green-2); }
.chr__badge--down { background: var(--nu-red-pill-bg); color: var(--nu-red-2); }
.chr__tri--down { transform: rotate(180deg); }
.chr__meta-line { color: var(--nu-gray); font-size: 15px; font-weight: 600; }
.chr__stats { display: flex; align-items: center; gap: clamp(22px, 3vw, 40px); flex-wrap: wrap; margin-top: 28px; }
.chr__stat-label { display: block; color: var(--nu-gray); font-size: 14px; font-weight: 700; }
.chr__stat-value {
  display: block; font-size: 22px; font-weight: 800; margin-top: 4px;
  font-variant-numeric: tabular-nums;
}
.chr__stat-value--green { color: var(--nu-green-2); }
.chr__stat-value--red { color: var(--nu-red-2); }
.chr__stat-value--ink { color: var(--nu-ink); }
.chr__connect-sub {
  color: var(--nu-gray-2); font-size: clamp(16px, 1.7vw, 19px); font-weight: 600;
  line-height: 1.55; margin-top: 18px; max-width: 640px;
}
.chr__ctas { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-top: 38px; }
.chr__cta {
  display: inline-flex; align-items: center; gap: 10px; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 16px 28px; font-size: 16.5px; font-weight: 700;
  transition: background .2s, transform .15s;
}
.chr__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); transform: translateY(-2px); }
.chr__cta-outline {
  display: inline-flex; align-items: center; gap: 10px; background: transparent; color: var(--nu-blue);
  border: 2px solid var(--nu-blue); border-radius: var(--nu-r-pill); padding: 14px 26px;
  font-size: 16.5px; font-weight: 700; transition: background .2s;
}
.chr__cta-outline:hover { background: var(--nu-blue-tint-2); color: var(--nu-blue); }
.chr__aside { flex: 1 1 380px; min-width: min(320px, 100%); max-width: 520px; }
.chr__card { background: var(--nu-white); border-radius: var(--nu-r-card); padding: 28px; box-shadow: var(--nu-shadow-card); }
.chr__card-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.chr__card-title { color: var(--nu-ink); font-size: 18px; font-weight: 800; }
.chr__card-count { color: var(--nu-gray); font-size: 13px; font-weight: 600; }
.chr__bar { display: flex; height: 14px; border-radius: var(--nu-r-pill); overflow: hidden; gap: 3px; margin-top: 22px; }
.chr__bar-seg { height: 100%; }
.chr__legend { margin-top: 16px; }
.chr__legend-row { display: flex; align-items: center; gap: 11px; padding: 11px 0; border-top: 1px solid var(--nu-cream-2); }
.chr__legend-dot { width: 11px; height: 11px; border-radius: 4px; flex-shrink: 0; }
.chr__legend-name { flex: 1; color: var(--nu-ink); font-size: 15px; font-weight: 700; }
.chr__legend-val { color: var(--nu-gray); font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
.chr__legend-pct { color: var(--nu-ink); font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; min-width: 44px; text-align: right; }
</style>
