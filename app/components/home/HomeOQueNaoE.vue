<script setup lang="ts">
// "O que a Aportou não é." (11/11/2026): a peça do quadro Home que entra na
// home de verdade, logo depois do "como funciona". É o posicionamento da marca
// (contrato, seção 1: não é corretora, não é guru, não diz "compre" nem
// "venda") e o cartão "SEUS DADOS", na faixa da marca (NuFaixaMarca), sobre a
// sálvia.
//
// Só entra aqui o que o site já sustenta em outro lugar:
//  - Open Finance regulado pelo Banco Central, só leitura, sem ver a senha do
//    banco e sem vender dado: o FAQ da home (useMercado, MERCADO_FAQS) e o
//    cartão "Só leitura" do /assinar (AssinaturaBancos);
//  - desconectar o banco quando quiser: o botão "Desconectar" da conta
//    (ContaOpenFinance).
// O quadro dizia "Você apaga a conta quando quiser". O site não tem esse
// caminho (não há exclusão de conta em /conta, e a Política de Privacidade não
// descreve o pedido), então a linha ficou de fora; no lugar dela, o que existe:
// desconectar o banco. O "Não é guru" do quadro falava em "carteira
// recomendada"; aqui ficou só o que o site garante (não vende curso nem sala
// de sinais, e não promete ganho: "Simulações não garantem resultado").
const { el: secao, revealClass } = useReveal(0.25, { soEmbeleza: true })

const NAO_E = [
  { t: 'Não é corretora.', d: 'Seu dinheiro continua onde está. A Aportou só lê a sua carteira.' },
  { t: 'Não é guru.', d: 'Não vende curso nem sala de sinais, e não promete ganho.' },
  { t: 'Não diz “compre” nem “venda”.', d: 'Mostra o dado, explica o que ele significa, e a decisão é sua.' },
] as const
</script>

<template>
  <section ref="secao" class="hne" :class="revealClass" aria-labelledby="hne-titulo">
    <MarcaCorte class="hne__corte nu-corte-fundo" :largura="760" cor="var(--nu-ink)" />
    <div class="hne__texto">
      <NuEyebrow como="p" sobre="salvia" class="hne__eyebrow">Sem letra miúda</NuEyebrow>
      <h2 id="hne-titulo" class="hne__titulo">O que a Aportou não é.</h2>
      <ul class="hne__lista">
        <li v-for="x in NAO_E" :key="x.t" class="hne__item">
          <span class="hne__x" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </span>
          <span class="hne__frase">
            <strong>{{ x.t }}</strong>
            <span>{{ x.d }}</span>
          </span>
        </li>
      </ul>
    </div>

    <NuFaixaMarca rotulo="Seus dados" como="h3" class="hne__dados">
      <ul class="hne__checks">
        <li><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg><span>Conexão por <strong>Open Finance</strong>, o sistema regulado pelo Banco Central.</span></li>
        <li><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg><span>Acesso <strong>somente leitura</strong>: a Aportou não move o seu dinheiro nem vê a senha do banco.</span></li>
        <li><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg><span>Seus dados <strong>não são vendidos</strong>.</span></li>
        <li><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg><span>Você <strong>desconecta o banco</strong> quando quiser.</span></li>
      </ul>
    </NuFaixaMarca>
  </section>
</template>

<style scoped>
/* a faixa sálvia: o texto é carvão (7,5:1 sobre ela); cinza não lê aqui */
.hne {
  position: relative; isolation: isolate; overflow: hidden;
  display: flex; flex-wrap: wrap; align-items: flex-start; gap: 48px 64px;
  padding: clamp(64px, 7vw, 100px) max(32px, calc((100% - 1240px) / 2));
  background: var(--nu-sage); color: var(--nu-ink);
}
/* o corte do "t", gigante e quase apagado, no canto de cima */
/* posição e tamanho são da classe global .nu-corte-fundo (sempre no canto de cima à esquerda) */
.hne__corte { z-index: -1; opacity: .07; }
.hne__texto { flex: 1.2 1 460px; min-width: 0; }
.hne__eyebrow { color: var(--nu-ink); }
.hne__titulo { margin: 18px 0 0; font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.03em; line-height: 1.02; }
.hne__lista { list-style: none; margin: 30px 0 0; padding: 0; display: flex; flex-direction: column; gap: 22px; }
.hne__item { display: flex; align-items: flex-start; gap: 16px; }
.hne__x {
  flex: none; display: grid; place-items: center; width: 36px; height: 36px; margin-top: 2px;
  border-radius: 50%; background: var(--nu-ink); color: var(--nu-white);
}
.hne__frase { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.hne__frase strong { font-size: clamp(22px, 2.2vw, 28px); font-weight: 800; letter-spacing: -0.02em; line-height: 1.15; }
.hne__frase span { color: var(--nu-ink); font-size: 17px; font-weight: 500; line-height: 1.45; }

/* o cartão carvão com a faixa da marca */
.hne__dados { flex: 1 1 380px; min-width: 0; margin-top: 26px; }
.hne__checks {
  list-style: none; margin: 0; padding: 36px clamp(20px, 2.6vw, 32px) clamp(24px, 2.6vw, 32px);
  display: flex; flex-direction: column; gap: 16px;
}
.hne__checks li { display: flex; align-items: flex-start; gap: 12px; color: var(--nu-on-dark); font-size: 17px; font-weight: 500; line-height: 1.4; }
.hne__checks svg { flex: none; color: var(--nu-green-soft); }
.hne__checks strong { color: var(--nu-white); font-weight: 700; }

/* entrada: o texto, as três linhas em cascata e o cartão subindo */
.hne.is-in .hne__eyebrow, .hne.is-in .hne__titulo, .hne.is-in .hne__item { animation: nu-fade .5s ease backwards; }
.hne.is-in .hne__item:nth-child(1) { animation-delay: .06s; }
.hne.is-in .hne__item:nth-child(2) { animation-delay: .12s; }
.hne.is-in .hne__item:nth-child(3) { animation-delay: .18s; }
.hne.is-in .hne__dados { animation: nu-subir .5s cubic-bezier(.2, .8, .2, 1) .12s backwards; }

@media (max-width: 760px) {
  .hne { padding-inline: 20px; gap: 32px; }
  .hne__dados { margin-top: 0; }
  /* no celular o corte gigante vira uma parede no meio da faixa: sai */
  .hne__corte { --corte-l: 300px; }
}
</style>
