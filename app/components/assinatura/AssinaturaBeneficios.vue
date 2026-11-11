<script setup lang="ts">
// "O que vem na assinatura." (31/10/2026): as quatro coisas que a pessoa
// ganha. No mesmo dia o dono pediu os cartões no formato da home ("é mais
// bonito"): o mesmo esqueleto do HomeComoFunciona — a tela preta do app no
// alto, o título curto e duas linhas —, com um quarto cartão para a IA.
//  1. Todos os bancos numa tela (o print da /carteira de verdade, desde 01/11/2026:
//     os logos dos bancos já estão na seção dos bancos logo abaixo);
//  2. Testa 2.000 futuros (o HomeLeque);
//  3. Responde com os seus números (uma conversa de exemplo, sem número);
//  4. Chama só quando importa (os dois estados do Agora).
// Nada aqui recomenda: a IA explica a carteira, não diz o que comprar.
// Logo depois, "deixe maior": dois por linha, as telas maiores, e no fim o
// "Conectar carteira" (todas as seções do /assinar terminam nele).
withDefaults(defineProps<{ titulo?: boolean; conectar?: boolean }>(), { titulo: true, conectar: false })

</script>

<template>
  <section class="abn" aria-labelledby="abn-titulo">
    <NuEyebrow v-if="titulo">O que vem na assinatura</NuEyebrow>
    <h2 v-if="titulo" id="abn-titulo" class="abn__titulo">O que a Aportou <br>faz por você.</h2>
    <p v-if="titulo" class="abn__dek">Quatro coisas, todos os dias, sem você precisar abrir planilha nenhuma.</p>
    <h2 v-else id="abn-titulo" class="abn__sr">O que a Aportou faz por você</h2>

    <div class="abn__grade">
      <article class="abn__cartao">
        <!-- a tela de verdade da /carteira (print do 01/11/2026, valor escondido pelo olho), marcada como exemplo -->
        <div class="abn__tela abn__tela--print">
          <span class="abn__exemplo">Exemplo</span>
          <img src="/assinatura/carteira-exemplo.png" alt="Exemplo da carteira na Aportou: Tudo normal. Na sexta, sua carteira caiu 0,62%; a bolsa, 0,75%. Contas no Itaú e na XP." width="1200" height="608" loading="lazy" class="abn__print">
        </div>
        <h3 class="abn__nome">Todos os bancos, numa tela.</h3>
        <p class="abn__texto">A carteira inteira somada, com uma frase que diz se está tudo normal. Abriu, soube.</p>
      </article>

      <article class="abn__cartao">
        <div class="abn__tela abn__tela--leque">
          <p class="abn__tela-rotulo">Daqui a 5 anos</p>
          <HomeLeque tom="carvao" />
          <p class="abn__tela-pe">2.000 cenários possíveis</p>
        </div>
        <h3 class="abn__nome">Testa 2.000 futuros.</h3>
        <p class="abn__texto">A sua carteira nos próximos cinco anos, em dinheiro de hoje: o caminho pessimista, o do meio e o otimista.</p>
      </article>

      <article class="abn__cartao">
        <div class="abn__tela abn__tela--conversa">
          <p class="abn__fala abn__fala--voce">Por que a minha carteira caiu hoje?</p>
          <div class="abn__resposta">
            <span class="abn__marca" aria-hidden="true"><MarcaCorte :largura="15" cor="var(--nu-blue-on-dark)" /></span>
            <p class="abn__fala">Os bancos puxaram. Eles são a maior parte da sua carteira, e caíram mais que a bolsa.</p>
          </div>
        </div>
        <h3 class="abn__nome">Responde com os seus números.</h3>
        <p class="abn__texto">Pergunte por que caiu, quanto rende ou o que pesa mais. A IA lê a sua carteira, não a média do mercado.</p>
      </article>

      <article class="abn__cartao">
        <div class="abn__tela abn__tela--estados">
          <div class="abn__estado">
            <span class="abn__estado-rotulo abn__estado-rotulo--verde">Bolsa aberta</span>
            <span class="abn__estado-frase">Tudo normal.</span>
          </div>
          <div class="abn__estado abn__estado--aviso">
            <span class="abn__estado-rotulo abn__estado-rotulo--ambar">Algo pede você</span>
            <span class="abn__estado-frase">Um ativo passou do seu alerta.</span>
          </div>
        </div>
        <h3 class="abn__nome">Chama só quando importa.</h3>
        <p class="abn__texto">Abra e saiba numa frase se está tudo normal. Quando algo pede você, ela avisa na hora. No resto do tempo, silêncio.</p>
      </article>
    </div>

    <div v-if="conectar" class="abn__acao">
      <AssinaturaConectar origem="beneficios" />
    </div>
  </section>
</template>

<style scoped>
.abn__titulo { margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.03em; line-height: 1.02; }
.abn__dek { margin: 18px 0 0; max-width: 560px; color: var(--nu-gray-3); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; }
.abn__acao { display: flex; justify-content: center; margin-top: clamp(36px, 4.4vw, 56px); }
.abn__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

.abn__grade {
  display: grid; gap: clamp(16px, 1.8vw, 24px); margin-top: clamp(36px, 4.5vw, 56px);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.abn__cartao {
  display: flex; flex-direction: column; padding: 14px 14px 34px; border-radius: var(--nu-r-card-lg); background: var(--nu-card); box-shadow: var(--nu-shadow-quente);
  animation: nu-fade .5s ease backwards;
}
.abn__cartao:nth-child(2) { animation-delay: 60ms; }
.abn__cartao:nth-child(3) { animation-delay: 120ms; }
.abn__cartao:nth-child(4) { animation-delay: 180ms; }

/* a tela preta do app no alto de cada cartão, sempre da mesma altura */
.abn__tela {
  position: relative; display: flex; flex-direction: column; justify-content: center;
  aspect-ratio: 16 / 10; overflow: hidden; border-radius: 22px; background: var(--nu-ink); color: var(--nu-white);
}
.abn__nome { margin: 28px 18px 0; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.025em; line-height: 1.05; }
.abn__texto { margin: 12px 18px 0; max-width: 52ch; color: var(--nu-gray-3); font-size: 17px; font-weight: 500; line-height: 1.5; }

/* 1 · o print da carteira, numa janela creme sobre o preto */
.abn__tela--print { padding: clamp(16px, 2.4vw, 28px); }
.abn__print { display: block; width: 100%; height: auto; border-radius: 14px; background: var(--nu-cream); }
.abn__exemplo {
  position: absolute; top: 12px; right: 12px; z-index: 1; padding: 4px 10px; border-radius: var(--nu-r-tag);
  background: var(--nu-dark-chip); color: var(--nu-on-dark); font-size: 13.5px; font-weight: 700;
}

/* 2 · o leque */
.abn__tela--leque { justify-content: space-between; padding: 16px 0 12px; }
.abn__tela-rotulo { margin: 0 16px; color: var(--nu-blue-on-dark); font-size: var(--nu-fs-sm); font-weight: 700; }
.abn__tela-pe { margin: 0 16px; color: var(--nu-on-dark-2); font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums; }
.abn__tela--leque :deep(.hlq) { aspect-ratio: auto; flex: 1; min-height: 0; margin: 6px 0; }

/* 3 · a conversa */
.abn__tela--conversa { gap: 14px; padding: clamp(18px, 2.4vw, 32px); }
.abn__fala { margin: 0; padding: 14px 16px; border-radius: 18px; background: var(--nu-dark-chip); color: var(--nu-white); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.45; }
.abn__fala--voce { align-self: flex-end; max-width: 82%; background: var(--nu-blue); color: var(--nu-white); font-weight: 700; border-bottom-right-radius: 6px; }
.abn__resposta { display: flex; align-items: flex-end; gap: 8px; max-width: 92%; }
.abn__resposta .abn__fala { border-bottom-left-radius: 6px; }
.abn__marca { display: grid; place-items: center; width: 28px; height: 28px; flex-shrink: 0; border-radius: var(--nu-r-tag); background: var(--nu-dark-chip); box-shadow: inset 0 0 0 1px var(--nu-dark-chip-line); }

/* 4 · os dois estados */
.abn__tela--estados { gap: 14px; padding: clamp(18px, 2.4vw, 32px); }
.abn__estado { display: flex; flex-direction: column; gap: 4px; padding: 14px 16px; border-radius: var(--nu-r-tile); background: var(--nu-dark-chip); }
.abn__estado--aviso { box-shadow: inset 0 0 0 1.5px var(--nu-amber); }
.abn__estado-rotulo { font-size: var(--nu-fs-sm); font-weight: 700; }
.abn__estado-rotulo--verde { color: var(--nu-green-soft); }
.abn__estado-rotulo--ambar { color: var(--nu-amber-soft); }
.abn__estado-frase { color: var(--nu-white); font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.02em; line-height: 1.2; }

@media (max-width: 860px) {
  .abn__grade { grid-template-columns: minmax(0, 1fr); }
  .abn__tela { aspect-ratio: 16 / 12; }
}
@media (max-width: 760px) {
  .abn__titulo br { display: none; }
}
@media (prefers-reduced-motion: reduce) { .abn__cartao { animation: none; } }
</style>
