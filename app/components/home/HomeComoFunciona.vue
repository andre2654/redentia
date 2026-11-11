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
// viram selos de raio 8.
//
// Robustez (11/11/2026, docs/aportou/robustez.md): a entrada é o v-revelar (o
// cabeçalho e os três cartões em cascata de 60 ms, 720 ms na --nu-ease-saida;
// nada fica escondido no HTML); os selos dos estados são o NuSelo (com o
// ponto); a tela de cada cartão tem o raio concêntrico (28 de fora − 12 de
// respiro = 16); o aviso âmbar ganhou o fio de 1 px; a seção respira no ritmo
// do sistema (72 a 128 px) e usa a coluna de 1.240 (--nu-coluna).
const BANCOS = [
  { nome: 'Nubank', logo: '/icons/logo-nubank.webp' },
  { nome: 'Itaú', logo: '/icons/logo-itau.webp' },
  { nome: 'Inter', logo: '/icons/logo-inter.webp' },
  { nome: 'Bradesco', logo: '/icons/logo-bradesco.webp' },
  { nome: 'Santander', logo: '/icons/logo-santander.webp' },
]
</script>

<template>
  <section class="hcf" aria-labelledby="hcf-titulo">
    <div v-revelar="{ alvo: 'filhos' }" class="hcf__cabeca">
      <NuEyebrow como="p">Como funciona</NuEyebrow>
      <h2 id="hcf-titulo" class="hcf__titulo">Você não precisa<br> acompanhar tudo.</h2>
      <p class="hcf__dek">A Aportou acompanha por você. Ela faz três coisas, e faz todo dia.</p>
    </div>

    <div v-revelar="{ alvo: 'filhos' }" class="hcf__grade">
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
            <NuSelo tom="verde" sobre="escuro" ponto>Bolsa aberta</NuSelo>
            <span class="hcf__estado-frase">Tudo normal.</span>
            <span class="hcf__estado-sub">Estamos analisando tudo para você.</span>
          </div>
          <div class="hcf__estado hcf__estado--aviso">
            <NuSelo tom="ambar" sobre="escuro" ponto>Algo pede você</NuSelo>
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
/* a moldura da marca: creme da página, a coluna de 1.240 px, o ritmo de seção do sistema */
.hcf { background: var(--nu-page); padding: clamp(72px, 8vw, 128px) var(--nu-coluna); }
.hcf__cabeca { max-width: 760px; }
.hcf__titulo { margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 1.02; }
.hcf__dek { margin: 20px 0 0; max-width: 620px; color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.45; text-wrap: pretty; }

.hcf__grade {
  display: grid; gap: 16px; margin-top: clamp(40px, 4.4vw, 56px);
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
}
/* o cartão creme do contrato: faixa quente, raio 28, a sombra de fio */
.hcf__cartao {
  display: flex; flex-direction: column; padding: 12px 12px 32px;
  border-radius: var(--nu-r-card); background: var(--nu-band); box-shadow: var(--nu-shadow-quente);
}

/* a tela do app no alto de cada cartão, sempre da mesma altura: carvão, com o
   raio concêntrico (o do cartão menos o respiro de 12 px) */
.hcf__tela {
  position: relative; display: flex; flex-direction: column; justify-content: center;
  aspect-ratio: 16 / 12; overflow: hidden; border-radius: calc(var(--nu-r-card) - 12px); background: var(--nu-ink); color: var(--nu-white);
}
.hcf__nome { margin: 24px 20px 0; color: var(--nu-ink); font-size: clamp(22px, 2vw, 26px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); line-height: 1.1; }
.hcf__texto { margin: 12px 20px 0; color: var(--nu-gray-3); font-size: 16.5px; font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.5; }

/* 1 · os bancos */
.hcf__bancos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px 8px; margin: 0; padding: 0 18px; list-style: none; }
.hcf__bancos li { display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 0; }
.hcf__bancos img { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; }
.hcf__bancos span { color: var(--nu-on-dark); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); text-align: center; }
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

/* 3 · os dois estados, com o selo da marca (NuSelo, com o ponto); o cartão de
   dentro tem raio de chip (a tela tem 16 e o respiro é de 16) */
.hcf__tela--estados { gap: 12px; padding: 16px; justify-content: center; }
.hcf__estado { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; padding: 16px; border-radius: var(--nu-r-chip); background: var(--nu-dark-chip); }
.hcf__estado--aviso { box-shadow: inset 0 0 0 1px var(--nu-amber); }
.hcf__estado-frase { color: var(--nu-white); font-size: var(--nu-fs-xl); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); line-height: 1.2; }
.hcf__estado-sub { margin-top: -4px; color: var(--nu-on-dark-2); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); }

@media (max-width: 760px) {
  .hcf__titulo br { display: none; }
}
</style>
