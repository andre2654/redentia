<script setup lang="ts">
// O herói de quem chega sem conta (11/11/2026, o terceiro). O dono, olhando o
// palco com o Mac, o relógio e o iPhone: "precisamos pensar em uma hero melhor
// (que não fale de apps e tals mas que seja boa para trabalhar como CTA)".
//
// Uma promessa, uma ação e a prova dela, nessa ordem:
//  - a promessa é a frase de sempre (o H1 não muda: "Simulamos a sua carteira
//    em 2.000 cenários para ver se ela é boa."), com o número em cobalto;
//  - a ação é uma só, a chamada com os bancos dentro do botão (HomeChamada),
//    sem a linha dos aparelhos; "Ver como funciona" é link, não botão;
//  - embaixo do botão, o que tira o medo de apertar (só leitura, mais de 100
//    bancos, um aviso no dia em que importa), com as frases que o site já usa
//    na régua do /assinar;
//  - a prova é o próprio teste: o leque dos 2.000 caminhos se desenha ao
//    chegar (HomeLeque, a ilustração do método, sem R$ de ninguém), dentro do
//    cartão com a faixa da marca. O cartão inteiro leva ao mesmo lugar do botão.
//
// Saíram os três aparelhos, o reflexo, os selos da loja e a linha "No site e
// no iPhone": o que a pessoa compra é o teste, não o app. As imagens de
// public/img/home ficam no repositório (o /assinar ainda usa).
//
// Promessa, ação e prova cabem na primeira dobra (1440×900): texto à esquerda,
// o cartão à direita; no celular, um embaixo do outro. Dois tons, para o dono
// escolher olhando (só no dev, ?hero=escuro):
//   claro (padrão)  o creme da página, como o quadro Home do canvas;
//   escuro          o carvão do palco de antes, com o mesmo desenho.
const route = useRoute()
const claro = computed(() => !(import.meta.dev && route.query.hero === 'escuro'))

// o que tira o medo de apertar: frases que o site já afirma (NuMarketTicker, a régua do /assinar)
const GARANTIAS = ['Só leitura: ninguém mexe no seu dinheiro', 'Mais de 100 bancos e corretoras', 'Um aviso no dia em que importa']
</script>

<template>
  <section class="hhv" :class="claro ? 'hhv--claro' : 'hhv--palco'" aria-labelledby="hhv-titulo">
    <div class="hhv__in">
      <div class="hhv__texto">
        <NuEyebrow :sobre="claro ? 'claro' : 'escuro'" class="hhv__eyebrow">Uma IA do seu lado</NuEyebrow>
        <h1 id="hhv-titulo" class="hhv__titulo">Simulamos a sua carteira em <span class="hhv__num">2.000 cenários</span> para ver se ela é boa.</h1>
        <p class="hhv__dek">Você conecta o banco uma vez. A IA testa a carteira nos próximos cinco anos, vigia todo dia e só chama quando algo pede você.</p>
        <div class="hhv__acao">
          <HomeChamada :tom="claro ? 'claro' : 'escuro'" :centro="false" sem-apps class="hhv__chamada" />
          <a href="#hcf-titulo" class="hhv__como">Ver como funciona</a>
        </div>
        <ul class="hhv__garantias">
          <li v-for="g in GARANTIAS" :key="g">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            {{ g }}
          </li>
        </ul>
      </div>

      <NuxtLink to="/assinar?quiz=1&de=home-leque" class="hhv__prova" aria-label="Conectar a carteira e ver o teste dos 2.000 cenários">
        <NuFaixaMarca rotulo="Daqui a 5 anos" como="p" class="hhv__cartao">
          <HomeLeque tom="carvao" class="hhv__leque" />
          <p class="hhv__pe">
            <span class="hhv__selo"><strong>2.000</strong> futuros testados para cada carteira</span>
            <span class="hhv__nota">Ilustração do método. O resultado da sua carteira aparece depois de conectar.</span>
          </p>
        </NuFaixaMarca>
      </NuxtLink>
    </div>
    <div v-if="!claro" class="hhv__horizonte" aria-hidden="true" />
  </section>
</template>

<style scoped>
.hhv {
  --g: max(clamp(20px, 5.5vw, 80px), calc((100% - 1240px) / 2));
  position: relative; isolation: isolate; overflow: hidden;
  padding: clamp(44px, 5.4vw, 84px) var(--g) clamp(56px, 6vw, 96px);
}
.hhv__in { display: flex; flex-wrap: wrap; align-items: center; gap: 48px 64px; }
.hhv__texto { flex: 1.1 1 480px; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; }
.hhv__titulo {
  margin: 20px 0 0; max-width: 15ch;
  font-size: clamp(38px, 5vw, 76px); font-weight: 800; letter-spacing: -0.04em; line-height: .98; text-wrap: balance;
}
.hhv__dek { margin: 22px 0 0; max-width: 54ch; font-size: clamp(17px, 1.5vw, 21px); font-weight: 500; line-height: 1.45; text-wrap: pretty; }
.hhv__acao { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 14px 28px; margin-top: 30px; }
.hhv__como {
  min-height: 62px; display: inline-flex; align-items: center; font-size: 17px; font-weight: 700;
  text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; transition: opacity .2s;
}
.hhv__como:hover { opacity: .75; }
.hhv__garantias { list-style: none; margin: 22px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px 24px; font-size: 15.5px; font-weight: 600; }
.hhv__garantias li { display: inline-flex; align-items: center; gap: 8px; }
.hhv__garantias svg { flex: none; }

/* a prova: o cartão com a faixa da marca e o leque se desenhando */
.hhv__prova { flex: 1 1 440px; display: block; min-width: 0; color: inherit; border-radius: var(--nu-r-card-lg); transition: transform .3s cubic-bezier(.2, .8, .2, 1); }
.hhv__prova:hover { transform: translateY(-3px); color: inherit; }
.hhv__cartao { display: flex; flex-direction: column; border-radius: var(--nu-r-card-lg); }
.hhv__leque { display: block; width: 100%; height: clamp(240px, 26vw, 340px); margin-top: 6px; }
.hhv__pe { margin: 0; padding: 4px clamp(20px, 2.6vw, 32px) clamp(20px, 2.4vw, 28px); display: flex; flex-wrap: wrap; align-items: center; gap: 10px 20px; }
.hhv__selo { display: inline-flex; align-items: center; gap: 8px; padding: 9px 17px; border-radius: var(--nu-r-pill); background: var(--nu-blue); color: var(--nu-white); font-size: 15px; font-weight: 500; white-space: nowrap; }
.hhv__selo strong { font-size: 16px; font-weight: 800; }
.hhv__nota { color: var(--nu-on-dark-2); font-size: 13.5px; font-weight: 500; line-height: 1.4; }

/* ——— claro: o creme da página ——— */
.hhv--claro { background: var(--nu-page); color: var(--nu-ink); }
.hhv--claro .hhv__num { color: var(--nu-blue); }
.hhv--claro .hhv__dek, .hhv--claro .hhv__garantias { color: var(--nu-gray-3); }
.hhv--claro .hhv__garantias svg { color: var(--nu-green-text); }

/* ——— escuro: o carvão do palco de antes ——— */
.hhv--palco { background: var(--nu-ink); color: var(--nu-white); }
.hhv--palco::before {
  content: ''; position: absolute; z-index: -1; inset: 0;
  background:
    radial-gradient(60% 70% at 18% 0%, color-mix(in srgb, var(--nu-blue) 24%, transparent), transparent 70%),
    linear-gradient(180deg, transparent 55%, color-mix(in srgb, var(--nu-agora-bg) 55%, transparent));
}
.hhv--palco .hhv__titulo { color: var(--nu-creme); }
.hhv--palco .hhv__num { color: var(--nu-blue-on-dark); }
.hhv--palco .hhv__dek, .hhv--palco .hhv__garantias { color: var(--nu-on-dark); }
.hhv--palco .hhv__garantias svg { color: var(--nu-green-soft); }
.hhv--palco .hhv__chamada :deep(.hch__letra) { color: var(--nu-on-dark); }
.hhv--palco .hhv__chamada :deep(.hch__letra strong) { color: var(--nu-white); }
/* o cartão sobre o carvão: um tom acima, com fio, para não se confundir com o fundo */
.hhv--palco .hhv__cartao { background: var(--nu-dark-chip); box-shadow: 0 0 0 1px var(--nu-dark-line), 0 40px 80px -30px color-mix(in srgb, var(--nu-agora-bg) 80%, transparent); }
/* a linha de luz do horizonte, nas cores do anel */
.hhv__horizonte { position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: var(--nu-anel); opacity: .55; }

.hhv__como:focus-visible, .hhv__prova:focus-visible { outline: 3px solid var(--nu-blue-on-dark); outline-offset: 4px; }
.hhv--claro .hhv__como:focus-visible, .hhv--claro .hhv__prova:focus-visible { outline-color: var(--nu-blue); }

@media (max-width: 640px) {
  .hhv { padding-top: 32px; }
  .hhv__titulo { margin-top: 16px; }
  .hhv__acao { gap: 4px 28px; align-self: stretch; }
  .hhv__chamada { align-self: stretch; }
  .hhv__como { min-height: 44px; }
  .hhv__garantias { flex-direction: column; gap: 8px; }
  .hhv__leque { height: 240px; }
  .hhv__nota { flex-basis: 100%; }
}
@media (prefers-reduced-motion: reduce) { .hhv__prova { transition: none; } .hhv__prova:hover { transform: none; } }
</style>
