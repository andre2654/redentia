<script setup lang="ts">
// "Você não precisa acompanhar tudo." (31/10/2026): as três coisas que a
// assinatura faz, uma por cartão, no lugar das três seções que saíram ("Seus
// bancos. Uma carteira.", a faixa das teses e o herói da pergunta). É a prova
// da chamada do herói: o que acontece depois do botão.
//  1. Junta os bancos (os logos reais de public/icons, os mesmos do botão);
//  2. Testa 2.000 futuros (o leque, o momento assinatura da página);
//  3. Chama só quando importa (os dois estados do Agora: "Tudo normal." e o
//     aviso âmbar de quando um ativo passa do alerta).
// A copy vem das promessas da entrada do app (IPhoneAgoraEntrada: "Uma
// pergunta só", "Eu só chamo quando importa", "O que a Redentia vai ver").
// Cada cartão tem o mesmo esqueleto: a tela do app no alto, o título e duas
// linhas. Sem botão: a ação da página é uma só, a do herói e a do fecho.
//
// Aportou (11/11/2026): a seção é creme (a página), abre com o eyebrow da
// marca, os cartões são o cartão creme do contrato (faixa quente, raio 28, a
// sombra de fio) e a tela de cada um é carvão, não mais o preto do app (o
// preto puro ficou só no palco dos aparelhos do herói). Os rótulos de estado
// viram selos de raio 8. Entrada: os cartões sobem em cascata de 60 ms quando
// a seção chega perto da tela (useReveal, soEmbeleza: nada fica invisível).
const { el: secao, revealClass } = useReveal(0.25, { soEmbeleza: true })
const BANCOS = [
  { nome: 'Nubank', logo: '/icons/logo-nubank.webp' },
  { nome: 'Itaú', logo: '/icons/logo-itau.webp' },
  { nome: 'Inter', logo: '/icons/logo-inter.webp' },
  { nome: 'Bradesco', logo: '/icons/logo-bradesco.webp' },
  { nome: 'Santander', logo: '/icons/logo-santander.webp' },
]
</script>

<template>
  <section ref="secao" class="hcf" :class="revealClass" aria-labelledby="hcf-titulo">
    <div class="hcf__cabeca">
      <NuEyebrow como="p">Como funciona</NuEyebrow>
      <h2 id="hcf-titulo" class="hcf__titulo">Você não precisa<br> acompanhar tudo.</h2>
      <p class="hcf__dek">A Aportou acompanha por você. Ela faz três coisas, e faz todo dia.</p>
    </div>

    <div class="hcf__grade">
      <article class="hcf__cartao">
        <div class="hcf__tela hcf__tela--bancos">
          <ul class="hcf__bancos">
            <li v-for="b in BANCOS" :key="b.nome">
              <img :src="b.logo" alt="" width="52" height="52" loading="lazy">
              <span>{{ b.nome }}</span>
            </li>
            <li class="hcf__mais"><b>+100</b><span>bancos e corretoras</span></li>
          </ul>
        </div>
        <h3 class="hcf__nome">Junta os seus bancos.</h3>
        <p class="hcf__texto">Você conecta uma vez pelo Open Finance e a carteira inteira chega sozinha. Só leitura: a Aportou nunca move o seu dinheiro nem vê a sua senha.</p>
      </article>

      <article class="hcf__cartao">
        <div class="hcf__tela hcf__tela--leque">
          <p class="hcf__tela-rotulo">Daqui a 5 anos</p>
          <HomeLeque tom="carvao" />
          <p class="hcf__tela-pe">2.000 cenários possíveis</p>
        </div>
        <h3 class="hcf__nome">Testa 2.000 futuros.</h3>
        <p class="hcf__texto">A IA simula a sua carteira nos próximos cinco anos, em dinheiro de hoje, e mostra o caminho pessimista, o do meio e o otimista. Aí você sabe se ela é boa.</p>
      </article>

      <article class="hcf__cartao">
        <div class="hcf__tela hcf__tela--estados">
          <div class="hcf__estado">
            <span class="hcf__selo hcf__selo--verde">Bolsa aberta</span>
            <span class="hcf__estado-frase">Tudo normal.</span>
            <span class="hcf__estado-sub">Estamos analisando tudo para você.</span>
          </div>
          <div class="hcf__estado hcf__estado--aviso">
            <span class="hcf__selo hcf__selo--ambar">Algo pede você</span>
            <span class="hcf__estado-frase">Um ativo passou do seu alerta.</span>
          </div>
        </div>
        <h3 class="hcf__nome">Chama só quando importa.</h3>
        <p class="hcf__texto">Abra e saiba numa frase se está tudo normal. Quando um ativo passa do alerta que você escolheu, ela avisa na hora. No resto do tempo, silêncio.</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
/* a moldura da marca: creme da página, contêiner de 1.240 px */
.hcf { background: var(--nu-page); padding: clamp(64px, 7vw, 100px) max(32px, calc((100% - 1240px) / 2)); }
.hcf__cabeca { max-width: 760px; }
.hcf__titulo { margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: var(--nu-w-display); letter-spacing: -0.03em; line-height: 1.02; }
.hcf__dek { margin: 20px 0 0; max-width: 620px; color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: 500; line-height: 1.45; text-wrap: pretty; }

.hcf__grade {
  display: grid; gap: 18px; margin-top: clamp(36px, 4vw, 44px);
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
}
/* o cartão creme do contrato: faixa quente, raio 28, a sombra de fio */
.hcf__cartao {
  display: flex; flex-direction: column; padding: 14px 14px 30px;
  border-radius: var(--nu-r-card); background: var(--nu-band); box-shadow: var(--nu-shadow-quente);
}

/* a tela do app no alto de cada cartão, sempre da mesma altura: carvão */
.hcf__tela {
  position: relative; display: flex; flex-direction: column; justify-content: center;
  aspect-ratio: 16 / 12; overflow: hidden; border-radius: 18px; background: var(--nu-ink); color: var(--nu-white);
}
.hcf__nome { margin: 26px 16px 0; color: var(--nu-ink); font-size: clamp(22px, 2vw, 26px); font-weight: var(--nu-w-forte); letter-spacing: -0.025em; line-height: 1.1; }
.hcf__texto { margin: 10px 16px 0; color: var(--nu-gray-3); font-size: 16.5px; font-weight: 500; line-height: 1.5; }

/* 1 · os bancos */
.hcf__bancos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px 8px; margin: 0; padding: 0 18px; list-style: none; }
.hcf__bancos li { display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 0; }
.hcf__bancos img { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; }
.hcf__bancos span { color: var(--nu-on-dark); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-medio); text-align: center; }
.hcf__mais b {
  display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%;
  background: var(--nu-dark-chip); box-shadow: inset 0 0 0 1px var(--nu-dark-chip-line);
  color: var(--nu-white); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-forte); font-variant-numeric: tabular-nums;
}

/* 2 · o leque */
.hcf__tela--leque { justify-content: space-between; padding: 16px 0 12px; }
.hcf__tela-rotulo { margin: 0 18px; color: var(--nu-blue-soft); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.hcf__tela-pe { margin: 0 18px; color: var(--nu-on-dark-2); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums; }
.hcf__tela--leque :deep(.hlq) { aspect-ratio: auto; flex: 1; min-height: 0; margin: 6px 0; }

/* 3 · os dois estados, com o selo de raio 8 da marca */
.hcf__tela--estados { gap: 12px; padding: 18px; justify-content: center; }
.hcf__estado { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding: 16px 18px; border-radius: 16px; background: var(--nu-dark-chip); }
.hcf__estado--aviso { box-shadow: inset 0 0 0 1.5px var(--nu-amber); }
.hcf__selo { padding: 3px 9px; border-radius: var(--nu-r-tag); font-size: 13.5px; font-weight: var(--nu-w-medio); line-height: 1.4; }
.hcf__selo--verde { background: color-mix(in srgb, var(--nu-green-soft) 16%, transparent); color: var(--nu-green-soft); }
.hcf__selo--ambar { background: color-mix(in srgb, var(--nu-amber) 20%, transparent); color: var(--nu-amber-soft); }
.hcf__estado-frase { color: var(--nu-white); font-size: var(--nu-fs-xl); font-weight: var(--nu-w-forte); letter-spacing: -0.02em; line-height: 1.2; }
.hcf__estado-sub { color: var(--nu-on-dark-2); font-size: var(--nu-fs-sm); font-weight: 500; }

/* entrada: o cabeçalho e depois os três cartões, em cascata de 60 ms */
.hcf.is-in .hcf__cabeca, .hcf.is-in .hcf__cartao { animation: nu-fade .5s ease backwards; }
.hcf.is-in .hcf__cartao:nth-child(1) { animation-delay: .06s; }
.hcf.is-in .hcf__cartao:nth-child(2) { animation-delay: .12s; }
.hcf.is-in .hcf__cartao:nth-child(3) { animation-delay: .18s; }

@media (max-width: 760px) {
  .hcf { padding-inline: 20px; }
  .hcf__titulo br { display: none; }
}
</style>
