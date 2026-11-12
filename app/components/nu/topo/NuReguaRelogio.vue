<script setup lang="ts">
// A régua do relógio: a contagem para a abertura desenhada no nível da barra das
// ações (12/11/2026; o dono, vendo a linha fina que enchia: "conseguimos
// melhorar isso?", "faça algo mais visual, tipo no nível da barra ali"). Uma
// faixa da altura da barra (28px; 22 no celular) com a janela de tempo que
// termina na abertura, em pedaços (utils/reguaDaBolsa.ts, reguaDoRelogio):
//  - o que já passou fica na areia do "não andou" (--nu-mapa-zero), com os
//    horários em cinza;
//  - o que falta vai do azul claro ao cobalto, mais forte perto da abertura,
//    com os horários em carvão (a rampa para em 78%, onde o carvão ainda passa
//    de 4,5:1; o teste confere);
//  - na ponta, o pedaço cobalto cheio com a hora ("10h") ou o dia ("seg") em
//    branco.
// Os horários vão escritos dentro, como os tickers na barra, cada um com um fio
// da cor da página no começo; os outros pedaços têm um fio mais leve, e a faixa
// lê como uma régua. A agulha é agora: dois entalhes, em cima e embaixo. A areia
// é uma camada por cima, cortada na agulha (clip-path), então um horário
// atravessado por ela se lê inteiro, metade cinza, metade carvão. A janela dá
// zoom conforme a abertura chega (12 h, 3 h, 1 h, 15 min) e a troca de escala é
// um fade no lugar. A cada entrada da
// cena o trecho que falta acende em direção à ponta (a cascata da barra). Nos
// últimos 10 minutos (`vivo`) a agulha respira. Decorativa: a frase ao lado diz
// o mesmo (aria-hidden). Movimento reduzido: sem cascata, sem respirar, a
// agulha anda sem transição.
import type { ReguaDoRelogio } from '~/utils/reguaDaBolsa'

defineProps<{
  regua: ReguaDoRelogio
  /** a ponta: a hora da abertura ("10h") ou o dia dela ("seg") */
  ponta: string
  /** a cena está em cena: a cascata recomeça a cada entrada */
  ativa: boolean
  /** os últimos 10 minutos: a agulha respira */
  vivo: boolean
}>()
</script>

<template>
  <span class="nrr" :class="{ 'nrr--ativa': ativa, 'nrr--vivo': vivo }" aria-hidden="true">
    <span class="nrr__trilho">
      <Transition name="nrr-zoom">
        <span :key="regua.escala" class="nrr__janela">
          <span class="nrr__mapa">
            <!-- o que falta: os pedaços, do azul claro ao cobalto, e os horários em carvão -->
            <span class="nrr__cores">
              <i v-for="(p, i) in regua.pedacos" :key="i" class="nrr__pedaco" :style="{ flexGrow: p.largura, '--f': `${(p.forca * 100).toFixed(1)}%`, '--x': p.x.toFixed(4) }" />
            </span>
            <span v-for="m in regua.marcas" :key="`f-${m.rotulo}`" class="nrr__marca" :class="{ 'nrr__marca--borda': m.x === 0 }" :style="{ left: `${(m.x * 100).toFixed(3)}%` }"><b>{{ m.rotulo }}</b></span>
            <!-- o que passou: a areia por cima, cortada na agulha, com os mesmos horários em cinza -->
            <span class="nrr__passou" :style="{ clipPath: `inset(-1px ${((1 - regua.agulha) * 100).toFixed(3)}% -1px -1px)` }">
              <span v-for="m in regua.marcas" :key="`p-${m.rotulo}`" class="nrr__marca" :class="{ 'nrr__marca--borda': m.x === 0 }" :style="{ left: `${(m.x * 100).toFixed(3)}%` }"><b>{{ m.rotulo }}</b></span>
            </span>
            <!-- os traços da régua: um fio leve no começo de cada pedaço, por cima das duas camadas -->
            <span class="nrr__fios">
              <i v-for="(p, i) in regua.pedacos" :key="i" class="nrr__fio" :style="{ flexGrow: p.largura }" />
            </span>
          </span>
          <span class="nrr__agulha" :style="{ transform: `translateX(${(regua.agulha * 100).toFixed(3)}%)` }"><i /></span>
        </span>
      </Transition>
    </span>
    <span class="nrr__ponta"><b>{{ ponta }}</b></span>
  </span>
</template>

<style scoped>
.nrr {
  --nrr-raio: var(--nu-r-tag-p);
  position: relative; flex: 1 1 auto; min-width: 48px; height: 28px; display: flex;
  font-size: var(--nu-fs-xs); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-texto); line-height: 1;
  font-variant-numeric: tabular-nums; white-space: nowrap; user-select: none;
}
.nrr__trilho { position: relative; flex: 1 1 auto; min-width: 0; container-type: inline-size; }
.nrr__janela { position: absolute; inset: 0; }
.nrr__mapa { position: absolute; inset: 0; overflow: hidden; border-radius: var(--nrr-raio) 0 0 var(--nrr-raio); }

/* o que falta: do azul claro ao cobalto (a mistura em oklab, como a paleta da barra) */
.nrr__cores { position: absolute; inset: 0; display: flex; }
.nrr__pedaco {
  flex: 0 1 0; min-width: 0;
  background-color: color-mix(in oklab, var(--nu-blue) var(--f, 50%), var(--nu-blue-pale));
}
/* o que passou: a areia do "não andou", por cima, até a agulha */
.nrr__passou {
  position: absolute; inset: 0; background: var(--nu-mapa-zero); color: var(--nu-gray);
  transition: clip-path calc(var(--nu-dur-lenta) * 2) linear;
}

/* os traços da régua: um fio leve da cor da página no começo de cada pedaço (o do horário escrito é cheio) */
.nrr__fios { position: absolute; inset: 0; display: flex; pointer-events: none; }
.nrr__fio { flex: 0 1 0; min-width: 0; border-left: 1px solid color-mix(in srgb, var(--nu-page) 55%, transparent); }
.nrr__fio:first-child { border-left: 0; }

/* os horários: no começo do pedaço deles, depois de um fio da cor da página */
.nrr__marca {
  position: absolute; top: 0; bottom: 0; display: flex; align-items: center; padding-left: 6px;
  border-left: 1px solid var(--nu-page); color: var(--nu-ink);
}
.nrr__passou .nrr__marca { color: inherit; }
.nrr__marca--borda { border-left-color: transparent; padding-left: 8px; }
.nrr__marca b { font-weight: inherit; }
/* trilho estreito (o celular, a coluna apertada): ficam só os fios */
@container (max-width: 260px) { .nrr__marca b { display: none; } }

/* a ponta: a abertura, no cobalto cheio */
.nrr__ponta {
  flex: none; min-width: 52px; padding: 0 12px; display: grid; place-items: center;
  border-left: 1px solid var(--nu-page); border-radius: 0 var(--nrr-raio) var(--nrr-raio) 0;
  background: var(--nu-blue); color: var(--nu-white);
}
.nrr__ponta b { font-weight: inherit; }

/* a agulha: agora. Dois entalhes carvão, em cima e embaixo, que passam 3px da faixa (como o contorno do
   pedaço aceso da barra) e entram 5px nela; o meio fica livre, e um horário atravessado por ela se lê
   inteiro, metade cinza na areia, metade carvão no azul */
.nrr__agulha { position: absolute; inset: 0; pointer-events: none; transition: transform calc(var(--nu-dur-lenta) * 2) linear; }
.nrr__agulha i { position: absolute; left: 0; top: -3px; bottom: -3px; width: 2px; margin-left: -1px; }
.nrr__agulha i::before, .nrr__agulha i::after {
  content: ''; position: absolute; left: 0; width: 100%; height: 8px; border-radius: var(--nu-r-pill);
  background: var(--nu-ink); box-shadow: 0 0 0 1.5px var(--nu-page);
}
.nrr__agulha i::before { top: 0; }
.nrr__agulha i::after { bottom: 0; }
/* os últimos 10 minutos: a agulha respira (só com a cena em cena) */
.nrr--ativa.nrr--vivo .nrr__agulha i { animation: nrr-respira calc(var(--nu-dur-respiro) * 2) var(--nu-ease-cor) infinite; }
@keyframes nrr-respira { 50% { opacity: .3; } }

/* a cada entrada da cena: o trecho que falta acende em direção à ponta, e a ponta por último */
.nrr--ativa .nrr__pedaco {
  animation: nrr-acende var(--nu-dur-media) var(--nu-ease-saida) both;
  animation-delay: calc(var(--x, 0) * var(--nu-dur-lenta));
}
.nrr--ativa .nrr__ponta { animation: nrr-acende-ponta var(--nu-dur-media) var(--nu-ease-saida) var(--nu-dur-lenta) both; }
.nrr--ativa:not(.nrr--vivo) .nrr__agulha i { animation: nu-surgir var(--nu-dur-media) var(--nu-ease-cor) both; }
@keyframes nrr-acende { from { background-color: var(--nu-mapa-zero); } }
@keyframes nrr-acende-ponta { from { background-color: var(--nu-mapa-zero); color: transparent; } }

/* a troca de escala (o zoom): uma some e a outra aparece, no lugar */
.nrr-zoom-enter-active, .nrr-zoom-leave-active { transition: opacity var(--nu-dur-lenta) var(--nu-ease-cor); }
.nrr-zoom-enter-from, .nrr-zoom-leave-to { opacity: 0; }

@media (max-width: 640px) {
  .nrr { height: 22px; min-width: 40px; }
  .nrr__ponta { min-width: 40px; padding: 0 8px; }
}
@media (prefers-reduced-motion: reduce) {
  .nrr--ativa .nrr__pedaco, .nrr--ativa .nrr__ponta, .nrr--ativa .nrr__agulha i, .nrr--ativa.nrr--vivo .nrr__agulha i { animation: none; }
  .nrr__passou, .nrr__agulha, .nrr-zoom-enter-active, .nrr-zoom-leave-active { transition: none; }
}
</style>
