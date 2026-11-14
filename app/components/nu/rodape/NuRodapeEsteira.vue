<script setup lang="ts">
// A esteira de ativos do rodapé (13/11/2026; o dono: "deixe o footer mais
// bacana, talvez com uns carrosséis de ativos com a bandeirinha da aportou").
//
// Duas filas de ativos de verdade (content/rodape-ativos.ts) andando devagar
// em sentidos opostos, de beira a beira da tela: uma em cima e outra embaixo
// do que vier no slot, que é o wordmark gigante ("agora coloque 1 linha em
// cima outra em baixo da logo da aportou"). Sem título em cima ("pode remover
// isso": a faixa "O que a Aportou acompanha" com o botão de pausa saiu).
//
// Cada ativo vai DENTRO da bandeira da marca (o dono, vendo a primeira versão,
// com a bandeirinha espetada em cima do ícone: "queria que ficasse DENTRO da
// bandeira"): o recorte é o corte do "t" (o mesmo desenho do MarcaCorte),
// pintado com a cor do próprio ícone, e a marca do ativo fica junto do mastro,
// como o emblema de uma bandeira de verdade. Embaixo, o ticker.
//
// COMO A BANDEIRA SE PINTA sem saber a cor de cada empresa: o ícone entra como
// `border-image` com `fill`. O miolo dele fica no tamanho certo, encostado no
// mastro, na altura em que a faixa da bandeira é mais larga; e a beirada de 1
// unidade do ícone estica até cobrir o resto do pano. Como cada linha continua
// na cor em que o ícone acabou, não há emenda nem em ícone com degradê (a
// Petrobras, a PetroRio). Se o ícone não vier, o pano fica transparente e
// aparece o que está embaixo: a bandeira no cobalto, com a primeira letra do
// ticker. Por fora, um fio de 1px segura a silhueta das bandeiras escuras (a
// XP, a Apple), que sumiriam no carvão.
//
// Os ícones só são pedidos quando o rodapé chega perto da tela (`nre--perto`):
// imagem de CSS não tem `loading="lazy"`.
//
// É ornamento, não cotação:
//  - sem preço, sem variação e sem nome de empresa;
//  - sem link. O rodapé é o maior distribuidor de link interno do site e a
//    alocação dele é decisão de SEO (NuFooter.vue): 32 links novos em toda
//    página mudariam essa conta. Para virarem link, a decisão é do dono;
//  - fora da leitura de tela (aria-hidden), com uma frase no lugar.
//
// O MOVIMENTO é a exceção combinada à regra do contrato ("nada de animação
// infinita", docs/aportou/contrato.md, seção 5): o dono pediu carrosséis. Para
// custar pouco, ele só anima `transform`, para quando a esteira sai da tela
// (IntersectionObserver) e não existe com movimento reduzido (as filas ficam
// paradas). Uma volta dura --nu-dur-esteira. O botão de pausa não aparece mais
// na tela, mas continua existindo para quem navega pelo teclado: ele só fica
// visível com o foco (o que se mexe sozinho por mais de 5 segundos precisa de
// um jeito de parar: WCAG 2.2.2).
import { ATIVOS_DO_RODAPE, iconeDoAtivo } from '~/content/rodape-ativos'

/** a pessoa pausou no botão: vale até recarregar a página */
const pausada = ref(false)
/** a esteira está na tela? Fora dela o movimento para e não custa nada */
const aVista = ref(true)
/** a esteira está chegando (a umas duas telas)? Só aí os ícones são pedidos, e ficam */
const perto = ref(false)
const raiz = ref<HTMLElement | null>(null)
let olhos: IntersectionObserver[] = []
onMounted(() => {
  const el = raiz.value
  if (typeof IntersectionObserver === 'undefined' || !el) { perto.value = true; return }
  const naTela = new IntersectionObserver(([e]) => { aVista.value = !!e?.isIntersecting }, { rootMargin: '160px 0px' })
  const chegando = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { perto.value = true; chegando.disconnect() } }, { rootMargin: '1400px 0px' })
  naTela.observe(el)
  chegando.observe(el)
  olhos = [naTela, chegando]
})
onBeforeUnmount(() => { for (const o of olhos) o.disconnect() })
</script>

<template>
  <div ref="raiz" class="nre" :class="{ 'nre--parada': pausada || !aVista, 'nre--perto': perto }">
    <p class="nu-sr">Ações, fundos imobiliários, ETFs e BDRs negociados na B3.</p>
    <button type="button" class="nre__pausa" :aria-pressed="pausada" @click="pausada = !pausada">Pausar o movimento dos ativos</button>

    <template v-for="(fila, k) in ATIVOS_DO_RODAPE" :key="k">
      <!-- entre a fila de cima e a de baixo, o que o rodapé puser aqui: o wordmark gigante -->
      <slot v-if="k === 1" />
      <div class="nre__fila" :class="{ 'nre__fila--volta': k % 2 === 1 }" aria-hidden="true">
        <div class="nre__trilho">
          <!-- a fila duas vezes: quando a primeira metade sai, a segunda está no lugar dela (a volta não tem emenda) -->
          <span v-for="(t, i) in [...fila, ...fila]" :key="`${t}-${i}`" class="nre__item">
            <span class="nre__bandeira">
              <span class="nre__reserva">{{ t.slice(0, 1) }}</span>
              <span class="nre__pano" :style="{ '--nre-icone': `url(${iconeDoAtivo(t)})` }" />
            </span>
            <span class="nre__ticker">{{ t }}</span>
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.nre { position: relative; display: flex; flex-direction: column; }
/* o botão de pausa só aparece com o foco do teclado, no canto de cima da esteira */
.nre__pausa {
  position: absolute; z-index: 2; left: var(--nu-coluna); top: 0; min-height: 44px; padding: 0 18px;
  border: 1px solid var(--nu-dark-chip-line); border-radius: var(--nu-r-pill); background: var(--nu-dark-chip);
  color: var(--nu-white); font: inherit; font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); cursor: pointer;
}
.nre__pausa:not(:focus-visible) { width: 1px; height: 1px; min-height: 0; margin: -1px; padding: 0; border: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.nre__pausa:focus-visible { outline: 3px solid var(--nu-blue-on-dark); outline-offset: 2px; }

/* cada fila vai de beira a beira; as pontas somem no carvão */
.nre__fila {
  display: flex; overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, var(--nu-ink) 7%, var(--nu-ink) 93%, transparent);
  mask-image: linear-gradient(90deg, transparent, var(--nu-ink) 7%, var(--nu-ink) 93%, transparent);
}
.nre__trilho {
  flex: none; display: flex; align-items: flex-start; width: max-content;
  animation: nre-anda var(--nu-dur-esteira) linear infinite; will-change: transform;
}
/* a de baixo anda para o outro lado, num passo um pouco diferente (as duas não marcham juntas) */
.nre__fila--volta .nre__trilho { animation-direction: reverse; animation-duration: calc(var(--nu-dur-esteira) * 1.18); }
.nre--parada .nre__trilho { animation-play-state: paused; }
/* cada item leva a própria folga à direita (não `gap`): as duas metades têm a mesma largura e −50% fecha a volta */
@keyframes nre-anda { to { transform: translate3d(-50%, 0, 0); } }

/* um ativo: a bandeira (o corte do "t", 65 por 52) e o ticker embaixo, junto do mastro */
.nre__item {
  --nre-l: clamp(104px, 8.2vw, 132px);
  /* o recorte da bandeira: o desenho do MarcaCorte, esticado na caixa */
  --nre-corte: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 -8 65 52' preserveAspectRatio='none'%3E%3Cpath d='M0 44 V0 H36 C48 0 58 -2 64 -8 C66 8 58 23 40 23 H25 C11 23 2 31 0 44 Z'/%3E%3C/svg%3E");
  flex: none; display: inline-flex; flex-direction: column; gap: 8px; margin-inline-end: calc(var(--nre-l) * .3);
}
/* por fora, o fio de 1px: a mesma silhueta numa cor que separa do carvão */
.nre__bandeira {
  position: relative; display: block; width: var(--nre-l); aspect-ratio: 65 / 52; background: var(--nu-dark-chip-line);
  -webkit-mask: var(--nre-corte) center / 100% 100% no-repeat; mask: var(--nre-corte) center / 100% 100% no-repeat;
}
.nre__reserva, .nre__pano {
  position: absolute; inset: 1px; box-sizing: border-box;
  -webkit-mask: var(--nre-corte) center / 100% 100% no-repeat; mask: var(--nre-corte) center / 100% 100% no-repeat;
}
/* a reserva, por baixo: sem o ícone, a bandeira é a da marca, com a primeira letra do ticker */
.nre__reserva {
  padding: calc(var(--nre-l) * .21) 0 0 calc(var(--nre-l) * .15); background: var(--nu-blue);
  color: var(--nu-white); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-forte); line-height: 1;
}
/* o pano: o miolo do ícone num quadrado de 54% da largura, junto do mastro (5% da esquerda, 4% do alto), e a beirada
   dele esticada pelas quatro bordas até cobrir a bandeira. Sem o ícone, as bordas são transparentes */
.nre__pano {
  border-style: solid; border-color: transparent;
  border-width: calc(var(--nre-l) * .04) calc(var(--nre-l) * .41 - 2px) calc(var(--nre-l) * .22 - 2px) calc(var(--nre-l) * .05);
}
.nre--perto .nre__pano { border-image: var(--nre-icone) 1 fill stretch; }
.nre__ticker {
  color: var(--nu-on-dark); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-forte); letter-spacing: 0.06em; line-height: 1;
  font-variant-numeric: tabular-nums; white-space: nowrap;
}

@container rodape (max-width: 640px) {
  /* no celular o wordmark tem a largura da tela e uns 80px de altura: as bandeiras encolhem para ele seguir sendo o maior */
  .nre__item { --nre-l: 76px; gap: 6px; }
  .nre__ticker { font-size: var(--nu-fs-xs); }
}
@media (prefers-reduced-motion: reduce) {
  /* sem movimento: as filas ficam paradas no começo, e não há o que pausar */
  .nre__trilho { animation: none; }
  .nre__pausa { display: none; }
}
</style>
