<script setup lang="ts">
// PROTÓTIPO /simulacao — painel de premissas ABERTO por padrão + disclaimer.
// Compliance estrutural do plano: premissa explícita é o que separa simulação
// de promessa. No real, tudo aqui vem do payload do motor.
import type { SimResult } from './simMock'
import { fmtBRLFull } from './simMock'

defineProps<{ assumptions: SimResult['assumptions'] }>()
const fmt = fmtBRLFull
</script>

<template>
  <div class="sas">
    <div class="sas__grid">
      <div class="sas__item"><span class="sas__k">Ponto de partida</span><span class="sas__v">{{ fmt(assumptions.anchor) }} <em>em {{ assumptions.anchorDate }}</em></span></div>
      <div class="sas__item"><span class="sas__k">Beta da carteira</span><span class="sas__v">{{ assumptions.beta.toLocaleString('pt-BR') }} <em>vs IBOV</em></span></div>
      <div class="sas__item"><span class="sas__k">Âncora de retorno</span><span class="sas__v">CDI {{ assumptions.cdiPct.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) }}% + prêmio {{ assumptions.erpPp.toLocaleString('pt-BR') }} p.p. <em>× beta</em></span></div>
      <div class="sas__item"><span class="sas__k">Volatilidade</span><span class="sas__v">{{ assumptions.volPct.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) }}% a.a. <em>IBOV 5 anos, bootstrap em blocos</em></span></div>
      <div class="sas__item"><span class="sas__k">Caminhos simulados</span><span class="sas__v">{{ assumptions.paths.toLocaleString('pt-BR') }} <em>passo mensal</em></span></div>
      <div class="sas__item"><span class="sas__k">Choque do cenário</span><span class="sas__v">sobreposto ao índice <em>profundidade, duração e recuperação explícitas</em></span></div>
    </div>
    <p class="sas__disclaimer">
      Simulação hipotética com premissas explícitas, sobre dados ilustrativos deste
      protótipo. Não é previsão, não é recomendação e não é promessa de rentabilidade —
      a decisão é sempre sua.
    </p>
  </div>
</template>

<style scoped>
.sas__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr)); gap: 12px; }
.sas__item {
  background: var(--nu-white); border-radius: var(--nu-r-tile);
  padding: 15px 17px; display: flex; flex-direction: column; gap: 4px;
}
.sas__k { color: var(--nu-gray); font-size: 11.5px; font-weight: 800; letter-spacing: 0.07em; text-transform: uppercase; }
.sas__v { color: var(--nu-ink); font-size: 15.5px; font-weight: 800; font-variant-numeric: tabular-nums; }
.sas__v em { display: block; color: var(--nu-gray); font-size: 12px; font-weight: 600; font-style: normal; margin-top: 1px; }
.sas__disclaimer {
  margin: 18px 0 0; color: var(--nu-gray-2); font-size: 13.5px; font-weight: 600;
  line-height: 1.55; border-left: 3px solid var(--nu-sand); padding-left: 14px;
}
</style>
