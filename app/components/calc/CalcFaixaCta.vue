<script setup lang="ts">
// A faixa do fim das calculadoras, de ponta a ponta da tela (dono, 21/10/2026:
// "nas telas da calculadora deixe esse card ocupando toda a largura" e "deixe
// esse CTA mais impressionante"). Antes era um cartão azul de 1080 px dentro
// da última faixa de texto, repetido em cada página com o próprio CSS.
// Agora é uma faixa no azul da Redentia (o dono testou o fundo escuro e pediu
// o azul de volta), com luz branca e azul-clara que se mexe devagar atrás do
// título, o botão principal em branco e, embaixo, quatro cápsulas de vidro com
// o que a conta dá. Tudo isso existe: contas guardadas, o resumo das 7h30, a
// carteira pelo Open Finance (no /carteira) e o chat. A preço-teto segue com o
// cartão dela (veto do dono).
// Aportou (11/11/2026): a faixa virou o PAINEL AZUL da marca, o mesmo do fecho
// da home: o gradiente cobalto, raio 40, pousado sobre o creme da página e
// ocupando a largura inteira do conteúdo, com o corte gigante branco a 8% no
// canto (no lugar das três luzes que andavam sem parar: a marca só tem
// animação infinita no anel do input e no esqueleto), o título em 800, a
// chamada principal na pílula com a seta no círculo e as cápsulas como chips
// sobre o azul.
// Ela aparece duas vezes nas calculadoras: compacta, logo depois da conta e das
// tags ("coloque uma seção CTA abaixo dos cards das calculadoras, abaixo das
// tags"), e inteira no fim da página.
// Robustez (11/11/2026): uma chamada só no painel. A principal segue na
// pílula creme com a seta (NuBotaoSeta); a segunda virou o link com seta da
// base (NuLinkSeta claro), em vez de uma segunda pílula ao lado. A entrada é o
// v-revelar (título, texto, ações e cápsulas em cascata de 60ms), que nunca
// esconde nada: antes a faixa ficava invisível esperando o observador (e
// saía vazia na impressão e na foto da página inteira).
defineProps<{
  titulo: string
  texto: string
  /** o botão branco, o principal */
  primario: { label: string; to: string }
  /** a segunda chamada: o link com seta, em branco */
  secundario: { label: string; to: string }
  /** a versão do meio da página, logo depois da conta e das tags: menos alta */
  compacta?: boolean
}>()

const BENEFICIOS = [
  { texto: 'Contas guardadas', d: ['M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4-6.5 4v-16a1 1 0 0 1 1-1z'] },
  { texto: 'Resumo das 7h30', d: ['M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17z', 'M12 7.5V12l3 2'] },
  { texto: 'Carteira conectada', d: ['M12 3.5a8.5 8.5 0 1 0 8.5 8.5H12z', 'M15 3.8A8.5 8.5 0 0 1 20.2 9H15z'] },
  { texto: 'Pergunte à IA', d: ['M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.1A8 8 0 1 1 20 12z'] },
]
</script>

<template>
  <section class="cft" :class="{ 'cft--compacta': compacta }">
    <div class="cft__painel">
    <MarcaCorte class="cft__corte nu-corte-fundo" :largura="compacta ? 460 : 620" cor="var(--nu-white)" />
    <div v-revelar="{ alvo: 'filhos', passo: 60 }" class="cft__miolo">
      <h2 class="cft__titulo">{{ titulo }}</h2>
      <p class="cft__texto">{{ texto }}</p>
      <div class="cft__acoes">
        <NuBotaoSeta :to="primario.to" variante="creme">{{ primario.label }}</NuBotaoSeta>
        <NuLinkSeta :to="secundario.to" tom="claro" class="cft__link">{{ secundario.label }}</NuLinkSeta>
      </div>
      <ul class="cft__beneficios" aria-label="O que a conta dá">
        <li v-for="b in BENEFICIOS" :key="b.texto" class="cft__beneficio">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path v-for="d in b.d" :key="d" :d="d" /></svg>
          {{ b.texto }}
        </li>
      </ul>
    </div>
    </div>
  </section>
</template>

<style scoped>
.cft { background: var(--nu-page); padding: clamp(28px, 4vw, 56px) max(clamp(12px, 5.5vw, 80px), calc((100% - 1240px) / 2)) clamp(56px, 7vw, 96px); }
.cft--compacta { padding-top: 0; }
/* o painel azul do contrato */
.cft__painel {
  position: relative; isolation: isolate; overflow: hidden; text-align: center;
  padding: clamp(56px, 8vw, 112px) clamp(22px, 5vw, 64px) clamp(48px, 7vw, 96px);
  border-radius: var(--nu-r-secao); background: var(--nu-grad-cobalto); color: var(--nu-white);
}

/* a do meio da página (logo depois da conta e das tags): menos alta, título um tom abaixo */
.cft--compacta .cft__painel { padding: clamp(44px, 5.4vw, 76px) clamp(22px, 5vw, 64px) clamp(40px, 5vw, 68px); }
.cft--compacta .cft__titulo { font-size: var(--nu-fs-h2-sm); }
.cft--compacta .cft__beneficios { margin-top: 32px; }

/* o corte do "t" da marca, gigante e quase transparente, no canto de baixo */
.cft__corte { position: absolute; right: -110px; bottom: -70px; z-index: -1; opacity: .08; pointer-events: none; }
.cft--compacta .cft__corte { right: -80px; bottom: -60px; }

.cft__miolo { position: relative; max-width: 980px; margin: 0 auto; }
.cft__titulo {
  margin: 0 auto; max-width: 900px; color: var(--nu-white);
  font-size: var(--nu-fs-h2); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 1.02; text-wrap: balance;
}
.cft__texto {
  margin: 18px auto 0; max-width: 560px; color: var(--nu-blue-on-blue);
  font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-texto); line-height: 1.45; text-wrap: balance;
}
.cft__acoes { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 16px 28px; margin-top: 40px; }
/* a segunda chamada: o link com seta, em branco, no tamanho da letra do botão */
.cft__link { font-size: 17px; }
.cft__acoes :focus-visible { outline: 3px solid var(--nu-white); outline-offset: 3px; }
/* o anel do link com seta é desenhado no ::after: sobre o azul, branco */
.cft__acoes :deep(.nls:focus-visible::after) { outline-color: var(--nu-white); }

/* o que a conta dá: chips sobre o azul */
.cft__beneficios { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin: 40px 0 0; padding: 0; list-style: none; }
.cft__beneficio {
  display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 16px; border-radius: var(--nu-r-pill);
  background: var(--nu-white-14); box-shadow: inset 0 0 0 1px var(--nu-white-30);
  color: var(--nu-white); font-size: 14.5px; font-weight: var(--nu-w-medio); white-space: nowrap;
}
.cft__beneficio svg { color: var(--nu-white); opacity: .9; }

@media (max-width: 640px) {
  .cft__painel { text-align: left; border-radius: var(--nu-r-card); }
  .cft__titulo, .cft__texto { margin-left: 0; }
  .cft__acoes, .cft__beneficios { justify-content: flex-start; }
  .cft__acoes { flex-direction: column; align-items: stretch; gap: 12px; }
  .cft__acoes .cft__link { align-self: flex-start; }
  .cft__beneficios { gap: 8px; margin-top: 32px; }
  .cft__beneficio { min-height: 36px; padding: 0 12px; gap: 6px; font-size: var(--nu-fs-dense); }
  .cft__corte, .cft--compacta .cft__corte { right: -260px; }
}
</style>
