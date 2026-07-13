<script setup lang="ts">
// "Sua carteira" compacta — a conveniência da home única (dono, 2026-07-13):
// pro LOGADO, esta seção entra no slot da banda azul de marketing
// (MercadoCarteiraConectada, que é só pra anônimo). Mesma banda azul do
// design pra manter o ritmo visual da página.
// ESTADOS (Diretriz nº1, sem número inventado):
//  - 'patrimonio'  patrimônio total + variação do dia (se o /today respondeu)
//                  + 3 maiores posições + link "Ver carteira completa"
//  - 'connect'     sem Open Finance → convite compacto de conexão → /carteira
// (dado indisponível não chega aqui — o MercadoContent nem renderiza a seção)
import type { CarteiraResumoVM } from '~/types/carteira'

const props = defineProps<{ resumo: CarteiraResumoVM }>()

// máscara global de valores (mesmo toggle-olho da /carteira)
const { hidden } = useHiddenValues()
const patrimonio = computed(() =>
  props.resumo.patrimonio ? (hidden.value ? 'R$ ••••••' : props.resumo.patrimonio) : null)
const hojeTxt = computed(() =>
  props.resumo.hojeTxt ? (hidden.value ? '+R$ •• hoje' : props.resumo.hojeTxt) : null)
const maskVal = (v: string) => (hidden.value ? 'R$ ••••' : v)

// linha vira link só quando há página do ativo (equity) — padrão da /carteira
const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <section class="msc">
    <!-- conectado: resumo compacto -->
    <div v-if="resumo.state === 'patrimonio'" class="msc__cols">
      <div class="msc__left">
        <div class="msc__eyebrow">Sua carteira</div>
        <div class="msc__value">{{ patrimonio }}</div>
        <div v-if="hojeTxt" class="msc__hoje" :class="`msc__hoje--${resumo.hojeDir}`">
          <svg width="11" height="11" viewBox="0 0 10 10" :class="{ 'msc__tri--down': resumo.hojeDir === 'down' }"><path d="M5 1.5l3.5 6H1.5z" fill="currentColor" /></svg>
          {{ hojeTxt }}
        </div>
        <NuxtLink to="/carteira" class="msc__all">
          <span class="msc__all-circle">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--nu-blue)" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </span>
          <span class="msc__all-label">Ver carteira completa</span>
        </NuxtLink>
      </div>

      <div v-if="resumo.top.length" class="msc__card">
        <div class="msc__card-title">Maiores posições</div>
        <component
          :is="p.href ? NuxtLink : 'div'"
          v-for="p in resumo.top" :key="p.ticker"
          :to="p.href ?? undefined" class="msc__row"
        >
          <span class="msc__tile" :style="{ background: p.tileBg, color: p.tileFg }">{{ p.letter }}</span>
          <span class="msc__ticker">{{ p.label }}</span>
          <span class="msc__val">{{ maskVal(p.val) }}</span>
        </component>
      </div>
    </div>

    <!-- sem Open Finance: convite compacto -->
    <div v-else class="msc__connect">
      <div class="msc__connect-main">
        <h2 class="msc__connect-title">Conecte sua carteira.</h2>
        <div class="msc__connect-dek">Conecte contas de qualquer banco ou corretora e a Redentia importa seus ativos automaticamente, sem planilha.</div>
      </div>
      <NuxtLink to="/carteira" class="msc__connect-cta">
        Conectar minha carteira<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.msc { background: var(--nu-blue); padding: clamp(48px, 6.5vw, 84px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }

/* ——— estado conectado ——— */
.msc__cols { display: flex; gap: clamp(32px, 5vw, 80px); align-items: center; flex-wrap: wrap; }
.msc__left { flex: 1 1 360px; min-width: min(300px, 100%); }
.msc__eyebrow { color: var(--nu-cream-text-82); font-size: clamp(16px, 1.5vw, 19px); font-weight: 800; letter-spacing: -.2px; }
.msc__value {
  color: var(--nu-cream-text); font-size: clamp(40px, 4.6vw, 64px);
  font-weight: 800; letter-spacing: -0.045em; line-height: 1.02;
  font-variant-numeric: tabular-nums; margin-top: 10px;
}
.msc__hoje {
  display: inline-flex; align-items: center; gap: 7px; margin-top: 14px;
  font-size: 16px; font-weight: 800; font-variant-numeric: tabular-nums;
}
.msc__hoje--up { color: var(--nu-green-soft); }
.msc__hoje--down { color: var(--nu-red-soft); }
.msc__tri--down { transform: rotate(180deg); }
.msc__all { display: inline-flex; align-items: center; gap: 14px; margin-top: 28px; transition: gap .2s; }
.msc__all:hover { gap: 19px; }
.msc__all-circle {
  width: 46px; height: 46px; border-radius: 50%; background: var(--nu-cream);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.msc__all-label { color: var(--nu-cream-text); font-size: 17px; font-weight: 800; }

.msc__card {
  flex: 1 1 380px; min-width: min(320px, 100%);
  background: var(--nu-white); border-radius: var(--nu-r-card-lg);
  padding: 24px 26px; box-shadow: var(--nu-shadow-card);
}
.msc__card-title { color: var(--nu-gray); font-size: 14px; font-weight: 800; letter-spacing: .2px; }
.msc__row {
  display: flex; align-items: center; gap: 14px; padding: 14px 10px; margin: 0 -10px;
  border-top: 1.5px solid var(--nu-cream-2); border-radius: var(--nu-r-card);
  transition: background .16s;
}
.msc__card > .msc__row:first-of-type { border-top: none; margin-top: 8px; }
a.msc__row:hover { background: var(--nu-cream); }
.msc__tile {
  width: 40px; height: 40px; border-radius: var(--nu-r-tile); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 800;
}
.msc__ticker {
  flex: 1; min-width: 0; color: var(--nu-ink); font-size: 16px; font-weight: 800;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.msc__val { color: var(--nu-ink); font-size: 15.5px; font-weight: 800; font-variant-numeric: tabular-nums; }

/* ——— convite compacto (sem Open Finance) ——— */
.msc__connect { display: flex; align-items: center; justify-content: space-between; gap: clamp(24px, 4vw, 60px); flex-wrap: wrap; }
.msc__connect-main { flex: 1 1 380px; min-width: min(300px, 100%); }
.msc__connect-title {
  margin: 0; color: var(--nu-cream-text); font-size: clamp(34px, 4vw, 54px);
  font-weight: 800; letter-spacing: -0.045em; line-height: 1.02;
}
.msc__connect-dek {
  color: var(--nu-cream-text-82); font-size: clamp(16px, 1.6vw, 19px); font-weight: 500;
  line-height: 1.6; margin-top: 16px; max-width: 520px;
}
.msc__connect-cta {
  display: inline-flex; align-items: center; gap: 10px; background: var(--nu-cream);
  color: var(--nu-blue); border-radius: var(--nu-r-pill); padding: 16px 34px;
  font-size: 16.5px; font-weight: 800; flex-shrink: 0;
  transition: transform .15s, background .2s;
}
.msc__connect-cta:hover { background: var(--nu-white); color: var(--nu-blue); transform: translateY(-2px); }

@media (max-width: 760px) {
  .msc__connect-cta { width: 100%; justify-content: center; }
}
</style>
