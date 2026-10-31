<script setup lang="ts">
// "O que vem na assinatura." (31/10/2026): as quatro coisas que a pessoa
// ganha. No mesmo dia o dono pediu os cartões no formato da home ("é mais
// bonito"): o mesmo esqueleto do HomeComoFunciona — a tela preta do app no
// alto, o título curto e duas linhas —, com um quarto cartão para a IA.
//  1. Junta os bancos (os logos reais de public/icons, os mesmos da home);
//  2. Testa 2.000 futuros (o HomeLeque);
//  3. Responde com os seus números (uma conversa de exemplo, sem número);
//  4. Chama só quando importa (os dois estados do Agora).
// Nada aqui recomenda: a IA explica a carteira, não diz o que comprar.
withDefaults(defineProps<{ titulo?: boolean }>(), { titulo: true })

const BANCOS = [
  { nome: 'Nubank', logo: '/icons/logo-nubank.webp' },
  { nome: 'Itaú', logo: '/icons/logo-itau.webp' },
  { nome: 'Inter', logo: '/icons/logo-inter.webp' },
  { nome: 'Bradesco', logo: '/icons/logo-bradesco.webp' },
  { nome: 'Santander', logo: '/icons/logo-santander.webp' },
]
</script>

<template>
  <section class="abn" aria-labelledby="abn-titulo">
    <h2 v-if="titulo" id="abn-titulo" class="abn__titulo">O que vem <br>na assinatura.</h2>
    <h2 v-else id="abn-titulo" class="abn__sr">O que vem na assinatura</h2>

    <div class="abn__grade">
      <article class="abn__cartao">
        <div class="abn__tela">
          <ul class="abn__bancos">
            <li v-for="b in BANCOS" :key="b.nome">
              <img :src="b.logo" alt="" width="48" height="48" loading="lazy">
              <span>{{ b.nome }}</span>
            </li>
            <li class="abn__mais"><b>+110</b><span>bancos e corretoras</span></li>
          </ul>
        </div>
        <h3 class="abn__nome">Junta os seus bancos.</h3>
        <p class="abn__texto">Você conecta uma vez pelo Open Finance e a carteira inteira chega sozinha. Só leitura: a Redentia nunca move o seu dinheiro.</p>
      </article>

      <article class="abn__cartao">
        <div class="abn__tela abn__tela--leque">
          <p class="abn__tela-rotulo">Daqui a 5 anos</p>
          <HomeLeque />
          <p class="abn__tela-pe">2.000 cenários possíveis</p>
        </div>
        <h3 class="abn__nome">Testa 2.000 futuros.</h3>
        <p class="abn__texto">A sua carteira nos próximos cinco anos, em dinheiro de hoje: o caminho pessimista, o do meio e o otimista.</p>
      </article>

      <article class="abn__cartao">
        <div class="abn__tela abn__tela--conversa">
          <p class="abn__fala abn__fala--voce">Por que a minha carteira caiu hoje?</p>
          <div class="abn__resposta">
            <span class="abn__marca" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24"><path d="M12 2.5 21.5 12 12 21.5 2.5 12Z" fill="currentColor" /></svg>
            </span>
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
  </section>
</template>

<style scoped>
.abn__titulo { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.04em; line-height: 1.02; }
.abn__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

.abn__grade {
  display: grid; gap: 18px; margin-top: clamp(36px, 4.5vw, 56px);
  grid-template-columns: repeat(auto-fit, minmax(min(270px, 100%), 1fr));
}
.abn__cartao { display: flex; flex-direction: column; padding: 14px 14px 28px; border-radius: var(--nu-r-card-lg); background: var(--nu-cream); }

/* a tela preta do app no alto de cada cartão, sempre da mesma altura */
.abn__tela {
  position: relative; display: flex; flex-direction: column; justify-content: center;
  aspect-ratio: 16 / 13; overflow: hidden; border-radius: 18px; background: var(--nu-agora-bg); color: var(--nu-agora-texto);
}
.abn__nome { margin: 24px 14px 0; color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.03em; line-height: 1.15; }
.abn__texto { margin: 10px 14px 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }

/* 1 · os bancos */
.abn__bancos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px 6px; margin: 0; padding: 0 14px; list-style: none; }
.abn__bancos li { display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 0; }
.abn__bancos img { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
.abn__bancos span { color: var(--nu-agora-sub); font-size: var(--nu-fs-xs); font-weight: 700; text-align: center; }
.abn__mais b {
  display: grid; place-items: center; width: 48px; height: 48px; border-radius: 50%;
  background: var(--nu-agora-pilula); color: var(--nu-agora-texto); font-size: var(--nu-fs-sm); font-weight: 800; font-variant-numeric: tabular-nums;
}

/* 2 · o leque */
.abn__tela--leque { justify-content: space-between; padding: 16px 0 12px; }
.abn__tela-rotulo { margin: 0 16px; color: var(--nu-agora-azul); font-size: var(--nu-fs-sm); font-weight: 700; }
.abn__tela-pe { margin: 0 16px; color: var(--nu-agora-sub); font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums; }
.abn__tela--leque :deep(.hlq) { aspect-ratio: auto; flex: 1; min-height: 0; margin: 6px 0; }

/* 3 · a conversa */
.abn__tela--conversa { gap: 12px; padding: 18px; }
.abn__fala { margin: 0; padding: 12px 14px; border-radius: 16px; background: var(--nu-agora-cartao); color: var(--nu-agora-texto); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.45; }
.abn__fala--voce { align-self: flex-end; max-width: 82%; background: var(--nu-blue); color: var(--nu-white); font-weight: 700; border-bottom-right-radius: 6px; }
.abn__resposta { display: flex; align-items: flex-end; gap: 8px; max-width: 92%; }
.abn__resposta .abn__fala { border-bottom-left-radius: 6px; }
.abn__marca { display: grid; place-items: center; width: 26px; height: 26px; flex-shrink: 0; border-radius: 8px; background: var(--nu-agora-pilula); color: var(--nu-agora-azul); }

/* 4 · os dois estados */
.abn__tela--estados { gap: 12px; padding: 16px; }
.abn__estado { display: flex; flex-direction: column; gap: 4px; padding: 14px 16px; border-radius: 14px; background: var(--nu-agora-cartao); }
.abn__estado--aviso { box-shadow: inset 0 0 0 1.5px var(--nu-agora-ambar); }
.abn__estado-rotulo { font-size: var(--nu-fs-sm); font-weight: 700; }
.abn__estado-rotulo--verde { color: var(--nu-agora-verde); }
.abn__estado-rotulo--ambar { color: var(--nu-agora-ambar); }
.abn__estado-frase { color: var(--nu-agora-texto); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -0.02em; line-height: 1.2; }

@media (max-width: 760px) {
  .abn__titulo :deep(br), .abn__titulo br { display: none; }
}
</style>
