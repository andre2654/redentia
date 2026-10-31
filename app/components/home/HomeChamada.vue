<script setup lang="ts">
// A chamada única da home (31/10/2026). Pedido do dono: "no mesmo CTA falar
// que tem IA, que testamos os cenários, que pegamos a carteira do cara em
// qualquer um dos bancos (e usar a imagem dos bancos) e mostrar que tem app
// iPhone, Mac e Watch". Um botão só, com os logos dos bancos dentro dele (a
// carteira vem de qualquer banco), o rótulo "Conectar carteira" (troca do
// dono no mesmo dia; a IA fica na linha de apoio do herói), a letra miúda com o
// preço do plano e o Open Finance, e a linha dos aparelhos.
//
// Destino: /assinar, a página do plano único (R$ 19,99 por mês, 3 dias
// grátis com cartão). Ela vale para logado e deslogado: quem ainda não tem
// conta vê o preço antes de dar o e-mail, e a conta nasce no passo de assinar.
// Mandar o visitante primeiro para o /login esconderia o preço atrás de um
// cadastro, que é o contrário do que a Apple faria.
//
// Os apps NÃO estão na App Store (recusa de 23/10/2026: a conta precisa ser
// de organização). Por isso a linha diz "em breve" e não tem link nenhum.
// Quando sair, a linha vira o selo da loja.
withDefaults(defineProps<{
  /** 'claro' no creme (o herói); 'escuro' sobre o navy (o fecho da página) */
  tom?: 'claro' | 'escuro'
  /** centraliza a letra miúda embaixo do botão */
  centro?: boolean
}>(), { tom: 'claro', centro: true })

// os logos que o site já tem (public/icons), os mesmos da CarteiraMontagem
const BANCOS = [
  { nome: 'Nubank', logo: '/icons/logo-nubank.webp' },
  { nome: 'Itaú', logo: '/icons/logo-itau.webp' },
  { nome: 'Inter', logo: '/icons/logo-inter.webp' },
  { nome: 'Bradesco', logo: '/icons/logo-bradesco.webp' },
  { nome: 'Santander', logo: '/icons/logo-santander.webp' },
]
</script>

<template>
  <div class="hch" :class="[`hch--${tom}`, { 'hch--centro': centro }]">
    <NuxtLink to="/assinar" class="hch__botao">
      <span class="hch__bancos" aria-hidden="true">
        <img
          v-for="(b, i) in BANCOS" :key="b.nome" :src="b.logo" alt="" width="34" height="34"
          class="hch__banco" :class="{ 'hch__banco--extra': i >= 3 }" :style="{ zIndex: BANCOS.length - i }"
        >
      </span>
      <span class="hch__rotulo">Conectar carteira</span>
      <svg class="hch__seta" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
    </NuxtLink>

    <p class="hch__letra">
      <strong>3 dias grátis, depois R$ 19,99 por mês.</strong>
      Qualquer banco ou corretora, pelo Open Finance.
    </p>

    <p class="hch__apps">
      <span class="hch__glifos" aria-hidden="true">
        <!-- iPhone, Mac e Apple Watch em traço, sem a marca da Apple -->
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="6.5" y="2.5" width="11" height="19" rx="2.6" /><path d="M10.5 5.5h3" /></svg>
        <svg width="18" height="16" viewBox="0 0 26 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="18" height="12.5" rx="1.8" /><path d="M1.5 20h23" /></svg>
        <svg width="14" height="16" viewBox="0 0 20 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5.5" width="13" height="13" rx="3.6" /><path d="M6.5 5.5l.8-3h5.4l.8 3M6.5 18.5l.8 3h5.4l.8-3" /></svg>
      </span>
      Hoje no site. Em breve no iPhone, no Mac e no Apple&nbsp;Watch.
    </p>
  </div>
</template>

<style scoped>
.hch { display: flex; flex-direction: column; align-items: flex-start; }
.hch--centro { align-items: center; text-align: center; }

/* o botão: azul, alto, com os bancos empilhados à esquerda */
.hch__botao {
  display: inline-flex; align-items: center; gap: 14px; min-height: 64px; max-width: 100%;
  padding: 10px 26px 10px 12px; border-radius: var(--nu-r-pill);
  background: var(--nu-blue); color: var(--nu-white);
  font-size: var(--nu-fs-lg); font-weight: 700; line-height: 1.2;
  box-shadow: var(--nu-home-sombra-botao);
  transition: background .2s ease, transform .2s ease, box-shadow .25s ease;
}
.hch__botao:hover { background: var(--nu-blue-hover); color: var(--nu-white); transform: translateY(-2px); }
.hch__botao:active { transform: translateY(0); }
.hch__botao:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 4px; }
.hch--escuro .hch__botao:focus-visible { outline-color: var(--nu-white); }
.hch__seta { flex: none; transition: transform .2s ease; }
.hch__botao:hover .hch__seta { transform: translateX(3px); }

.hch__bancos { display: inline-flex; flex: none; }
.hch__banco {
  position: relative; width: 34px; height: 34px; border-radius: 50%; object-fit: cover;
  box-shadow: 0 0 0 2.5px var(--nu-blue); background: var(--nu-white);
}
.hch__banco + .hch__banco { margin-left: -9px; }
.hch__rotulo { white-space: nowrap; }

/* a letra miúda: o preço primeiro, depois de onde vem a carteira */
.hch__letra {
  margin: 18px 0 0; max-width: 64ch; color: var(--nu-gray-2);
  font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; text-wrap: balance;
}
.hch__letra strong { color: var(--nu-ink); font-weight: 700; }
.hch__apps {
  display: inline-flex; align-items: center; gap: 10px; margin: 10px 0 0;
  color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.4;
}
.hch__glifos { display: inline-flex; align-items: center; gap: 6px; color: var(--nu-ink); }

/* sobre o navy */
.hch--escuro .hch__botao { background: var(--nu-white); color: var(--nu-blue-text); box-shadow: var(--nu-home-sombra-botao-escuro); }
.hch--escuro .hch__botao:hover { background: var(--nu-cream); color: var(--nu-blue-hover); }
.hch--escuro .hch__banco { box-shadow: 0 0 0 2.5px var(--nu-white); }
.hch--escuro .hch__letra, .hch--escuro .hch__apps { color: var(--nu-white-85); }
.hch--escuro .hch__letra strong, .hch--escuro .hch__glifos { color: var(--nu-white); }

@media (max-width: 560px) {
  .hch { align-self: stretch; }
  .hch__botao { width: 100%; justify-content: center; gap: 12px; padding: 10px 20px 10px 10px; font-size: var(--nu-fs-md); }
  .hch__banco--extra { display: none; }
  .hch__banco { width: 30px; height: 30px; }
  /* o preço numa linha, o banco na outra; os aparelhos em cima da frase deles */
  .hch__letra strong { display: block; }
  .hch__apps { flex-direction: column; gap: 6px; }
  .hch:not(.hch--centro) .hch__apps { align-items: flex-start; }
}
@media (prefers-reduced-motion: reduce) {
  .hch__botao, .hch__seta { transition: none; }
}
</style>
