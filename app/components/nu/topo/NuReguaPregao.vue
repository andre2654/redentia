<script setup lang="ts">
// O pregão do dia numa faixa: a cena do fechamento desenhada no nível da barra
// das ações (12/11/2026; o dono, depois da régua do relógio: "ficou ótimo, agora
// faça esse depois do fechamento de um jeito bacana"). A irmã da régua do
// relógio (NuReguaRelogio): a mesma altura (28px; 22 no celular), o mesmo raio,
// os fios da cor da página e a ponta à direita.
// Aqui a janela vai das 10h ao fechamento e o desenho é o perfil do dia
// (utils/reguaDaBolsa.ts, faixaDoPregao): a área entre o Ibovespa e o
// fechamento de ontem, minuto a minuto, na areia do "não andou"; para baixo de
// ontem, a queda; para cima, a alta; mais forte quanto mais longe (a cor do
// índice, cheia aos 2%), com a linha do pregão no tom forte por cima. O perfil
// toma a altura toda da faixa. Cada hora cheia tem um fio leve, sem número:
// escritos dentro, a linha do pregão passava por cima deles. Na ponta, os pontos do
// fechamento na cor do dia. A cada entrada da cena o dia se
// redesenha das 10h ao fechamento, e a ponta acende por último. Decorativa: a
// frase ao lado diz o fechamento (aria-hidden). Movimento reduzido: sem redesenho.
import type { FaixaDoPregao } from '~/utils/reguaDaBolsa'

defineProps<{
  faixa: FaixaDoPregao
  /** a cena está em cena: o dia se redesenha a cada entrada */
  ativa: boolean
}>()

// os degradês e os recortes do SVG precisam de um id só deles (a vitrine tem várias faixas).
// No SVG, as medidas que mudam vão com .attr: na hidratação o Vue 3.5 tenta gravar o que é
// dinâmico como propriedade do elemento, e y, y1 e height de um SVG só têm leitura (o aviso
// "Failed setting prop" na vitrine, que renderiza no servidor).
const id = `nrd-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
</script>

<template>
  <span class="nrd" :class="{ 'nrd--ativa': ativa }" aria-hidden="true">
    <span class="nrd__trilho">
      <span class="nrd__mapa">
        <svg class="nrd__desenho" viewBox="0 0 1000 100" preserveAspectRatio="none" focusable="false">
          <defs>
            <!-- a cor cresce com a distância do fechamento de ontem: do claro, nele, ao tom do extremo do dia -->
            <linearGradient :id="`${id}-q`" gradientUnits="userSpaceOnUse" x1="0" :y1.attr="faixa.base" x2="0" y2="100">
              <stop offset="0" class="nrd__claro nrd__claro--queda" /><stop offset="1" :style="{ stopColor: faixa.corQueda ?? undefined }" />
            </linearGradient>
            <linearGradient :id="`${id}-a`" gradientUnits="userSpaceOnUse" x1="0" :y1.attr="faixa.base" x2="0" y2="0">
              <stop offset="0" class="nrd__claro nrd__claro--alta" /><stop offset="1" :style="{ stopColor: faixa.corAlta ?? undefined }" />
            </linearGradient>
            <clipPath :id="`${id}-cq`"><rect x="0" :y.attr="faixa.base" width="1000" :height.attr="100 - faixa.base" /></clipPath>
            <clipPath :id="`${id}-ca`"><rect x="0" y="0" width="1000" :height.attr="faixa.base" /></clipPath>
          </defs>
          <g v-if="faixa.corQueda" :clip-path="`url(#${id}-cq)`">
            <path :d="faixa.area" :fill="`url(#${id}-q)`" />
            <path :d="faixa.linha" class="nrd__linha nrd__linha--queda" />
          </g>
          <g v-if="faixa.corAlta" :clip-path="`url(#${id}-ca)`">
            <path :d="faixa.area" :fill="`url(#${id}-a)`" />
            <path :d="faixa.linha" class="nrd__linha nrd__linha--alta" />
          </g>
          <!-- o fechamento de ontem, quando o dia passou pelos dois lados dele -->
          <line v-if="faixa.base > 0.5 && faixa.base < 99.5" x1="0" x2="1000" :y1.attr="faixa.base" :y2.attr="faixa.base" class="nrd__ontem" />
        </svg>
        <i v-for="x in faixa.horas" :key="x" class="nrd__hora" :style="{ left: `${(x * 100).toFixed(3)}%` }" />
      </span>
    </span>
    <span class="nrd__ponta" :class="{ 'nrd__ponta--clara': faixa.ponta.tinta === 'clara' }" :style="{ backgroundColor: faixa.ponta.fundo }"><b>{{ faixa.ponta.rotulo }}</b></span>
  </span>
</template>

<style scoped>
.nrd {
  --nrd-raio: var(--nu-r-tag-p);
  position: relative; flex: 1 1 auto; min-width: 48px; height: 28px; display: flex;
  font-size: var(--nu-fs-xs); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-texto); line-height: 1;
  font-variant-numeric: tabular-nums; white-space: nowrap; user-select: none;
}
.nrd__trilho { position: relative; flex: 1 1 auto; min-width: 0; }
/* a faixa: a areia do "não andou", onde o dia não chegou */
.nrd__mapa { position: absolute; inset: 0; overflow: hidden; border-radius: var(--nrd-raio) 0 0 var(--nrd-raio); background: var(--nu-mapa-zero); }

/* o perfil do dia, na altura toda da faixa */
.nrd__desenho { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.nrd__claro--queda { stop-color: var(--nu-mapa-queda-claro); }
.nrd__claro--alta { stop-color: var(--nu-mapa-alta-claro); }
.nrd__linha { fill: none; stroke-width: 1.5; stroke-linejoin: round; stroke-linecap: round; vector-effect: non-scaling-stroke; }
.nrd__linha--queda { stroke: var(--nu-mapa-queda); }
.nrd__linha--alta { stroke: var(--nu-mapa-alta); }
.nrd__ontem { stroke: color-mix(in srgb, var(--nu-ink) 28%, transparent); stroke-width: 1; vector-effect: non-scaling-stroke; }

/* as horas cheias: um fio leve da cor da página em cada uma */
.nrd__hora { position: absolute; top: 0; bottom: 0; width: 1px; background: color-mix(in srgb, var(--nu-page) 55%, transparent); }

/* a ponta: os pontos do fechamento, na cor do dia */
.nrd__ponta {
  flex: none; min-width: 52px; padding: 0 12px; display: grid; place-items: center;
  border-left: 1px solid var(--nu-page); border-radius: 0 var(--nrd-raio) var(--nrd-raio) 0;
  background: var(--nu-mapa-zero); color: var(--nu-ink);
}
.nrd__ponta--clara { color: var(--nu-white); }
.nrd__ponta b { font-weight: inherit; }

/* a cada entrada da cena: o dia se redesenha das 10h ao fechamento e a ponta acende por último */
.nrd--ativa .nrd__desenho { animation: nrd-desenha calc(var(--nu-dur-entrada) * 1.5) var(--nu-ease-cor) both; }
.nrd--ativa .nrd__ponta { animation: nrd-acende-ponta var(--nu-dur-media) var(--nu-ease-saida) calc(var(--nu-dur-entrada) * 1.25) both; }
@keyframes nrd-desenha { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes nrd-acende-ponta { from { background-color: var(--nu-mapa-zero); color: transparent; } }

@media (max-width: 640px) {
  .nrd { height: 22px; min-width: 40px; }
  .nrd__ponta { min-width: 40px; padding: 0 8px; }
}
@media (prefers-reduced-motion: reduce) {
  .nrd--ativa .nrd__desenho, .nrd--ativa .nrd__ponta { animation: none; }
}
</style>
