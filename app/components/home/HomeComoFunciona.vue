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
// Cada cartão tem o mesmo esqueleto: a tela preta do app no alto, o título e
// duas linhas. Sem botão: a ação da página é uma só, a do herói e a do fecho.
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
    <div class="hcf__cabeca">
      <h2 id="hcf-titulo" class="hcf__titulo">Você não precisa<br> acompanhar tudo.</h2>
      <p class="hcf__dek">A Redentia acompanha por você. Ela faz três coisas, e faz todo dia.</p>
    </div>

    <div class="hcf__grade">
      <article class="hcf__cartao">
        <div class="hcf__tela hcf__tela--bancos">
          <ul class="hcf__bancos">
            <li v-for="b in BANCOS" :key="b.nome">
              <img :src="b.logo" alt="" width="52" height="52" loading="lazy">
              <span>{{ b.nome }}</span>
            </li>
            <li class="hcf__mais"><b>+110</b><span>bancos e corretoras</span></li>
          </ul>
        </div>
        <h3 class="hcf__nome">Junta os seus bancos.</h3>
        <p class="hcf__texto">Você conecta uma vez pelo Open Finance e a carteira inteira chega sozinha. Só leitura: a Redentia nunca move o seu dinheiro nem vê a sua senha.</p>
      </article>

      <article class="hcf__cartao">
        <div class="hcf__tela hcf__tela--leque">
          <p class="hcf__tela-rotulo">Daqui a 5 anos</p>
          <HomeLeque />
          <p class="hcf__tela-pe">2.000 cenários possíveis</p>
        </div>
        <h3 class="hcf__nome">Testa 2.000 futuros.</h3>
        <p class="hcf__texto">A IA simula a sua carteira nos próximos cinco anos, em dinheiro de hoje, e mostra o caminho pessimista, o do meio e o otimista. Aí você sabe se ela é boa.</p>
      </article>

      <article class="hcf__cartao">
        <div class="hcf__tela hcf__tela--estados">
          <div class="hcf__estado">
            <span class="hcf__estado-rotulo hcf__estado-rotulo--verde">Bolsa aberta</span>
            <span class="hcf__estado-frase">Tudo normal.</span>
            <span class="hcf__estado-sub">Estamos analisando tudo para você.</span>
          </div>
          <div class="hcf__estado hcf__estado--aviso">
            <span class="hcf__estado-rotulo hcf__estado-rotulo--ambar">Algo pede você</span>
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
.hcf { background: var(--nu-white); padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.hcf__cabeca { max-width: 760px; }
.hcf__titulo { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.04em; line-height: 1.02; }
.hcf__dek { margin: 20px 0 0; max-width: 640px; color: var(--nu-gray); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.55; }

.hcf__grade {
  display: grid; gap: 18px; margin-top: clamp(40px, 4.5vw, 56px);
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
}
.hcf__cartao { display: flex; flex-direction: column; padding: 14px 14px 30px; border-radius: var(--nu-r-card-lg); background: var(--nu-cream); }

/* a tela preta do app no alto de cada cartão, sempre da mesma altura */
.hcf__tela {
  position: relative; display: flex; flex-direction: column; justify-content: center;
  aspect-ratio: 16 / 12; overflow: hidden; border-radius: 18px; background: var(--nu-agora-bg); color: var(--nu-agora-texto);
}
.hcf__nome { margin: 26px 16px 0; color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.03em; line-height: 1.15; }
.hcf__texto { margin: 10px 16px 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }

/* 1 · os bancos */
.hcf__bancos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px 8px; margin: 0; padding: 0 18px; list-style: none; }
.hcf__bancos li { display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 0; }
.hcf__bancos img { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; }
.hcf__bancos span { color: var(--nu-agora-sub); font-size: var(--nu-fs-xs); font-weight: 700; text-align: center; }
.hcf__mais b {
  display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%;
  background: var(--nu-agora-pilula); color: var(--nu-agora-texto); font-size: var(--nu-fs-sm); font-weight: 800; font-variant-numeric: tabular-nums;
}

/* 2 · o leque */
.hcf__tela--leque { justify-content: space-between; padding: 16px 0 12px; }
.hcf__tela-rotulo { margin: 0 18px; color: var(--nu-agora-azul); font-size: var(--nu-fs-sm); font-weight: 700; }
.hcf__tela-pe { margin: 0 18px; color: var(--nu-agora-sub); font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums; }
.hcf__tela--leque :deep(.hlq) { aspect-ratio: auto; flex: 1; min-height: 0; margin: 6px 0; }

/* 3 · os dois estados */
.hcf__tela--estados { gap: 12px; padding: 18px; justify-content: center; }
.hcf__estado { display: flex; flex-direction: column; gap: 4px; padding: 16px 18px; border-radius: 14px; background: var(--nu-agora-cartao); }
.hcf__estado--aviso { box-shadow: inset 0 0 0 1.5px var(--nu-agora-ambar); }
.hcf__estado-rotulo { font-size: var(--nu-fs-sm); font-weight: 700; }
.hcf__estado-rotulo--verde { color: var(--nu-agora-verde); }
.hcf__estado-rotulo--ambar { color: var(--nu-agora-ambar); }
.hcf__estado-frase { color: var(--nu-agora-texto); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.02em; line-height: 1.2; }
.hcf__estado-sub { color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 500; }

@media (max-width: 760px) {
  .hcf__titulo br { display: none; }
}
</style>
