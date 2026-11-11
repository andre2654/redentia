<script setup lang="ts">
// A chamada única da home (31/10/2026). Pedido do dono: "no mesmo CTA falar
// que tem IA, que testamos os cenários, que pegamos a carteira do cara em
// qualquer um dos bancos (e usar a imagem dos bancos) e mostrar que tem app
// iPhone, Mac e Watch". Um botão só, com os logos dos bancos dentro dele (a
// carteira vem de qualquer banco), o rótulo "Conectar carteira" (troca do
// dono no mesmo dia; a IA fica na linha de apoio do herói), a letra miúda com o
// Open Finance e a linha dos aparelhos. Sem preço desde 01/11/2026 (decisão do
// dono: a entrada não fala de preço; ele aparece no fim do quiz do /assinar).
//
// Destino: /assinar, a página do plano único (R$ 19,99 por mês, 3 dias
// grátis com cartão). Ela vale para logado e deslogado: quem ainda não tem
// conta vê o preço antes de dar o e-mail, e a conta nasce no passo de assinar.
// Mandar o visitante primeiro para o /login esconderia o preço atrás de um
// cadastro, que é o contrário do que a Apple faria.
//
// Aportou (11/11/2026): o botão é a pílula da marca, com a seta no círculo
// (NuBotaoSeta), e os logos dos bancos seguem dentro dela, à esquerda do
// rótulo. Sobre o creme ele é cobalto; sobre o carvão do herói e sobre o painel
// azul do fecho, creme com o círculo carvão. O rótulo e o destino não mudam.
//
// A linha dos aparelhos sai de utils/appsRedentia.ts, a fonte única do que
// já está na App Store (02/11/2026: só o iPhone; Mac e relógio em revisão).
// O link da loja fica nos aparelhos do herói (HomeHeroVisitante), não aqui:
// a ação desta chamada é uma só, conectar a carteira.
//
// Robustez (11/11/2026): a pílula perdeu o brilho cobalto de 40 px que tinha
// embaixo (no creme ele era a sombra mais forte da página, e o NuBotaoSeta não
// tem sombra em nenhum outro lugar do site: a mesma peça, a mesma cara). A
// letra miúda vai a 14 px, no peso de texto e a 16 px do botão.
import { fraseDosApps } from '~/utils/appsRedentia'
withDefaults(defineProps<{
  /** 'claro' sobre o creme (o topo de quem tem conta); 'escuro' sobre o carvão do herói e o azul do fecho */
  tom?: 'claro' | 'escuro'
  /** centraliza a letra miúda embaixo do botão */
  centro?: boolean
  /** quem já conectou o banco não lê "Conectar carteira": o passo dele é assinar */
  rotulo?: string
  /** 'calmo': a pílula de 52 px com os bancos menores (o herói do visitante);
   *  'grande' é a de 62 px */
  porte?: 'grande' | 'calmo'
  /** sem a linha dos aparelhos (o herói do visitante desde 11/11/2026: a entrada não fala de app) */
  semApps?: boolean
}>(), { tom: 'claro', centro: true, rotulo: 'Conectar carteira', porte: 'grande' })

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
  <div class="hch" :class="[`hch--${tom}`, `hch--${porte}`, { 'hch--centro': centro }]">
    <NuBotaoSeta to="/assinar?quiz=1&de=home" :variante="tom === 'escuro' ? 'creme' : 'azul'" :tamanho="porte === 'calmo' ? 'm' : 'g'" class="hch__botao">
      <!-- os logos entram pelo slot `antes` do NuBotaoSeta: ficam dentro da pílula, antes do rótulo -->
      <template #antes>
        <span class="hch__bancos" aria-hidden="true">
          <img
            v-for="(b, i) in BANCOS" :key="b.nome" :src="b.logo" alt="" width="36" height="36"
            class="hch__banco" :class="{ 'hch__banco--extra': i >= 3 }" :style="{ zIndex: BANCOS.length - i }"
          >
        </span>
      </template>
      {{ rotulo }}
    </NuBotaoSeta>

    <p class="hch__letra">
      <strong>Qualquer banco ou corretora.</strong>
      Pelo Open Finance, só leitura.
    </p>

    <p v-if="!semApps" class="hch__apps">
      <span class="hch__glifos" aria-hidden="true">
        <!-- iPhone, Mac e Apple Watch em traço, sem a marca da Apple -->
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="6.5" y="2.5" width="11" height="19" rx="2.6" /><path d="M10.5 5.5h3" /></svg>
        <svg width="18" height="16" viewBox="0 0 26 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="18" height="12.5" rx="1.8" /><path d="M1.5 20h23" /></svg>
        <svg width="14" height="16" viewBox="0 0 20 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5.5" width="13" height="13" rx="3.6" /><path d="M6.5 5.5l.8-3h5.4l.8 3M6.5 18.5l.8 3h5.4l.8-3" /></svg>
      </span>
      {{ fraseDosApps() }}
    </p>
  </div>
</template>

<style scoped>
.hch { display: flex; flex-direction: column; align-items: flex-start; }
.hch--centro { align-items: center; text-align: center; }

/* o botão: a pílula da marca (NuBotaoSeta), com os bancos empilhados antes do
   rótulo (o slot `antes`) e a seta no círculo à direita. Com os logos, o recuo
   da esquerda é o do círculo da direita, para a pílula ficar simétrica */
.hch .hch__botao { max-width: 100%; padding-left: 10px; gap: 14px; }
/* o rótulo encosta nos logos; a folga vai toda para antes do círculo */
.hch .hch__botao :deep(.nbs__txt) { margin-right: auto; padding-right: 4px; }
.hch--escuro .hch__botao:focus-visible { outline-color: var(--nu-white); }
.hch__bancos { display: inline-flex; flex: none; }
.hch__banco {
  position: relative; width: 36px; height: 36px; border-radius: 50%; object-fit: cover;
  /* o anel de cada logo é a cor da pílula (a variável é do NuBotaoSeta) */
  box-shadow: 0 0 0 2.5px var(--nbs-bg, var(--nu-blue)); background: var(--nu-white);
}
.hch__banco + .hch__banco { margin-left: -10px; }

/* a letra miúda: de onde vem a carteira (sem preço desde 01/11/2026) */
.hch__letra {
  margin: 16px 0 0; max-width: 64ch; color: var(--nu-gray);
  font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.55; text-wrap: balance;
}
.hch__letra strong { color: var(--nu-ink); font-weight: var(--nu-w-medio); }
.hch__apps {
  display: inline-flex; align-items: center; gap: 10px; margin: 8px 0 0;
  color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.4;
}
.hch__glifos { display: inline-flex; align-items: center; gap: 6px; color: var(--nu-ink); }

/* sobre o carvão do herói e sobre o azul do fecho */
.hch--escuro .hch__letra, .hch--escuro .hch__apps { color: var(--nu-blue-on-blue); }
.hch--escuro .hch__letra strong, .hch--escuro .hch__glifos { color: var(--nu-white); }

/* porte calmo (o herói do visitante): a pílula de 52 px, os bancos de 30 px */
.hch--calmo .hch__botao { padding-left: 8px; gap: 12px; }
.hch--calmo .hch__banco { width: 30px; height: 30px; box-shadow: 0 0 0 2px var(--nbs-bg, var(--nu-blue)); }
.hch--calmo .hch__banco + .hch__banco { margin-left: -8px; }
.hch--calmo .hch__apps { margin-top: 8px; }

/* a linha dos aparelhos fica só no computador (pedido do dono, 01/11/2026):
   no celular e no tablet ela só empurrava os aparelhos para baixo */
@media (max-width: 1023px) {
  .hch__apps { display: none; }
}
@media (max-width: 560px) {
  .hch { align-self: stretch; }
  .hch .hch__botao { display: flex; width: 100%; }
  .hch__banco--extra { display: none; }
  .hch__banco, .hch--calmo .hch__banco { width: 30px; height: 30px; }
  /* a frase em negrito numa linha, o Open Finance na outra */
  .hch__letra strong { display: block; }
}
</style>
