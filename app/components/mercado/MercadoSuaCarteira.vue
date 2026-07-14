<script setup lang="ts">
// "Sua carteira" — banda azul da home logada (rework do dono, 2026-07-13):
// o card "Maiores posições" MORREU; a seção agora é o VALOR TOTAL da carteira
// CENTRALIZADO (número hero mascarável + variação do dia embaixo) e uma
// fileira de ATALHOS (pills clicáveis, centradas, 2 colunas no mobile) pras
// seções REAIS da /carteira (ids do rail PR-R6: #posicoes/#raio-x/
// #movimentacoes — âncoras conferidas no CarteiraContent).
// ESTADOS (diretriz nº1, sem número inventado):
//  - 'patrimonio'  valor + variação (se o /today respondeu) + atalhos;
//                  "Ver extrato" só com movimentações reais; o pill de
//                  atenção mostra a contagem REAL do Raio-X (0 → estado
//                  positivo verde, sem ação; raio-x indisponível → some)
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

// Atalhos que levam ao CHAT (direção do dono, 2026-07-13; MESMO fluxo do
// CarteiraHero via useAporteChat):
//  - "Novo aporte"        → abre o NuAmountModal (valor em R$) → confirma →
//                           /busca?chat=1&q=... com o valor na pergunta.
//  - "Rebalancear carteira" → link direto pro chat (SEM modal), pergunta pronta.
// Ambos só aparecem quando a carteira TEM dado (score != null é o proxy de que
// as seções da /carteira existem — mesmos builders; guarda o edge transiente
// de value_now>0 com positions vazias). "Ver extrato" segue apontando pra
// âncora real da /carteira (só com movimentações reais).
const { aporteOpen, openAporte, closeAporte, confirmAporte, rebalanceHref } = useAporteChat()
</script>

<template>
  <section class="msc">
    <!-- conectado: patrimônio centralizado + atalhos -->
    <div v-if="resumo.state === 'patrimonio'" class="msc__center">
      <div class="msc__eyebrow">Sua carteira</div>
      <div class="msc__value">{{ patrimonio }}</div>
      <div v-if="hojeTxt" class="msc__hoje" :class="`msc__hoje--${resumo.hojeDir}`">
        <svg width="11" height="11" viewBox="0 0 10 10" :class="{ 'msc__tri--down': resumo.hojeDir === 'down' }"><path d="M5 1.5l3.5 6H1.5z" fill="currentColor" /></svg>
        {{ hojeTxt }}
      </div>

      <div class="msc__atalhos">
        <template v-if="resumo.score != null">
          <button type="button" class="msc__atalho" @click="openAporte">Novo aporte</button>
          <NuxtLink :to="rebalanceHref" class="msc__atalho">Rebalancear carteira</NuxtLink>
        </template>
        <NuxtLink v-if="resumo.movCount != null" to="/carteira#movimentacoes" class="msc__atalho">
          Ver extrato
        </NuxtLink>
        <!-- contagem REAL do Raio-X: >0 → ação; 0 → estado positivo (sem ação,
             lê melhor que um link pra "resolver" o que não existe) -->
        <NuxtLink
          v-if="resumo.atencao != null && resumo.atencao > 0"
          to="/carteira#raio-x" class="msc__atalho msc__atalho--warn"
        >
          Resolver pontos de atenção ({{ resumo.atencao }})
        </NuxtLink>
        <div v-else-if="resumo.atencao === 0" class="msc__atalho msc__atalho--ok">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 12.5l5 5 10-11" /></svg>
          Nenhum ponto de atenção
        </div>
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

    <!-- Novo aporte: pergunta o valor e leva pro chat (logado-only: o atalho
         só existe no estado 'patrimonio', que já é logado com carteira) -->
    <NuAmountModal :open="aporteOpen" @close="closeAporte" @confirm="confirmAporte" />
  </section>
</template>

<style scoped>
.msc { background: var(--nu-blue); padding: clamp(48px, 6.5vw, 84px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }

/* ——— estado conectado (centralizado) ——— */
.msc__center { display: flex; flex-direction: column; align-items: center; text-align: center; }
.msc__eyebrow { color: var(--nu-cream-text-82); font-size: clamp(16px, 1.5vw, 19px); font-weight: 800; letter-spacing: -.2px; }
.msc__value {
  color: var(--nu-cream-text); font-size: clamp(44px, 5.4vw, 76px);
  font-weight: 800; letter-spacing: -0.045em; line-height: 1.02;
  font-variant-numeric: tabular-nums; margin-top: 12px;
}
.msc__hoje {
  display: inline-flex; align-items: center; gap: 7px; margin-top: 14px;
  font-size: 16px; font-weight: 800; font-variant-numeric: tabular-nums;
}
.msc__hoje--up { color: var(--nu-green-soft); }
.msc__hoje--down { color: var(--nu-red-soft); }
.msc__tri--down { transform: rotate(180deg); }

/* ——— atalhos (pills centradas; 2 colunas no mobile) ——— */
.msc__atalhos {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 12px;
  margin-top: clamp(28px, 3.4vw, 40px);
}
.msc__atalho {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  background: var(--nu-cream); color: var(--nu-blue);
  border: none; border-radius: var(--nu-r-pill); padding: 14px 26px;
  font-size: 15.5px; font-weight: 800; white-space: nowrap; font-family: inherit;
  transition: transform .15s, background .2s;
}
button.msc__atalho { cursor: pointer; }
a.msc__atalho:hover, button.msc__atalho:hover { background: var(--nu-white); color: var(--nu-blue); transform: translateY(-2px); }
.msc__atalho--warn { color: var(--nu-amber-text); }
a.msc__atalho--warn:hover { color: var(--nu-amber-text); }
.msc__atalho--ok { color: var(--nu-green-2); cursor: default; }

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
  .msc__atalhos { display: grid; grid-template-columns: repeat(2, 1fr); width: 100%; }
  .msc__atalho { white-space: normal; padding: 14px 16px; text-align: center; }
  .msc__connect-cta { width: 100%; justify-content: center; }
}
</style>
