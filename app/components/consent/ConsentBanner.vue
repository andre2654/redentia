<script setup lang="ts">
// Aviso pequeno de cookies. No computador, cartão no canto inferior
// esquerdo: cabe na faixa de respiro do hero (creme), longe do CTA central
// da home e do botão da /business. No celular, uma faixa no fluxo, no topo,
// para não cobrir plaquinha nem o card da /business. Os dois botões têm o
// mesmo peso de propósito: nenhum é o "certo".
// Com o rodapé na tela (desktop), o cartão deixa de ser fixed: senta na
// âncora do rodapé e o rodapé ganha padding-bottom da altura do cartão.
import { bannerCookiesEmFluxo, folgaDoBannerNoRodape } from '~/utils/rodape-flutuantes'

const { aberto, aceitar, recusar } = useConsent()
const el = ref<HTMLElement | null>(null)
const rodapeNaTela = useRodapeNaTela()
const desktop = ref(true)
const temAncora = ref(false)

useHead(() => ({
  htmlAttrs: aberto.value ? { 'data-ck': 'open' } : { 'data-ck': undefined },
}))

const emFluxo = computed(() => bannerCookiesEmFluxo({
  aberto: aberto.value,
  rodapeNaTela: rodapeNaTela.value,
  desktop: desktop.value,
  temAncora: temAncora.value,
}))

function ambiente() {
  desktop.value = window.matchMedia('(min-width: 760px)').matches
  temAncora.value = !!document.getElementById('ancora-cookies')
}

function rodape() {
  return document.querySelector<HTMLElement>('footer.nuf, footer.rbf')
}

function medir() {
  // No celular a faixa é do fluxo, não cobre a tela: sem folga extra.
  if (window.matchMedia('(max-width: 759px)').matches) {
    document.documentElement.style.setProperty('--ck-h', '0px')
    return
  }
  const h = el.value?.offsetHeight
  if (!h) return
  document.documentElement.style.setProperty('--ck-h', `${Math.ceil(h + 12)}px`)
}

function aplicarFolga() {
  const footer = rodape()
  const folga = folgaDoBannerNoRodape(emFluxo.value, el.value?.offsetHeight ?? 0)
  if (footer) {
    if (folga > 0) footer.style.paddingBottom = `${folga}px`
    else footer.style.removeProperty('padding-bottom')
  }
  if (!aberto.value) {
    document.documentElement.style.removeProperty('--ck-h')
    return
  }
  // No fluxo do rodapé o cartão não é fixed: a folga é o padding, não --ck-h.
  if (emFluxo.value) document.documentElement.style.setProperty('--ck-h', '0px')
  else medir()
}

watch(aberto, async (v, antes) => {
  if (!import.meta.client) return
  if (!v) {
    document.documentElement.style.removeProperty('--ck-h')
    rodape()?.style.removeProperty('padding-bottom')
    return
  }
  await nextTick()
  ambiente()
  aplicarFolga()
  // Reabrir pelo rodapé, no celular, deixa a faixa no topo da página.
  if (antes === false && window.matchMedia('(max-width: 759px)').matches)
    el.value?.scrollIntoView({ block: 'start' })
})

watch([emFluxo, rodapeNaTela], async () => {
  if (!import.meta.client) return
  await nextTick()
  ambiente()
  aplicarFolga()
})

function aoRedimensionar() {
  ambiente()
  aplicarFolga()
}

onMounted(() => {
  // O rodapé monta depois deste aviso: a âncora só existe no tick seguinte.
  nextTick(() => {
    ambiente()
    if (aberto.value) aplicarFolga()
  })
  window.addEventListener('resize', aoRedimensionar)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', aoRedimensionar)
  rodape()?.style.removeProperty('padding-bottom')
})
</script>

<template>
  <Teleport to="#ancora-cookies" :disabled="!emFluxo">
  <aside
    v-if="aberto"
    ref="el"
    class="ck"
    :class="{ 'ck--fluxo': emFluxo }"
    role="dialog"
    aria-modal="false"
    aria-labelledby="ck-titulo"
  >
    <p id="ck-titulo" class="ck__txt">
      Análise e anúncios só com a sua escolha.
      <span class="ck__links">
        <NuxtLink to="/institucional/privacy">Privacidade</NuxtLink>
        <span aria-hidden="true"> · </span>
        <NuxtLink to="/institucional/cookies">Cookies</NuxtLink>
      </span>
    </p>
    <div class="ck__acoes">
      <button type="button" class="ck__btn" @click="aceitar">Aceitar</button>
      <button type="button" class="ck__btn" @click="recusar">Recusar</button>
    </div>
  </aside>
  </Teleport>
</template>

<style scoped>
.ck {
  position: fixed;
  z-index: 45;
  left: 12px;
  bottom: calc(12px + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(300px, calc(100vw - 24px));
  margin: 0;
  padding: 10px 12px;
  border-radius: 16px;
  background: var(--nu-cream);
  color: var(--nu-navy);
  border: 1px solid rgba(12, 21, 36, 0.14);
  box-shadow: 0 12px 28px -18px rgba(12, 21, 36, 0.55);
  font-family: var(--nu-font);
}
.ck__txt {
  margin: 0;
  color: var(--nu-navy);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.35;
}
.ck__links { white-space: nowrap; }
.ck__txt a {
  color: var(--nu-blue);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.ck__txt a:hover { color: var(--nu-blue-hover); }
.ck__acoes { display: flex; gap: 8px; }
.ck__btn {
  flex: 1 1 0;
  margin: 0;
  padding: 7px 12px;
  border-radius: var(--nu-r-pill);
  border: 1px solid var(--nu-navy);
  background: var(--nu-cream);
  color: var(--nu-navy);
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
  cursor: pointer;
}
.ck__btn:hover { background: var(--nu-white); }
.ck__btn:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

/* celular: faixa no fluxo, no topo. Fixed aqui cobria plaquinha e card. */
@media (max-width: 759px) {
  .ck {
    position: relative;
    left: auto;
    right: auto;
    bottom: auto;
    width: 100%;
    max-width: none;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding: 8px 10px;
    border-radius: 0;
    border-left: 0;
    border-right: 0;
    border-top: 0;
    box-shadow: none;
  }
  .ck__txt { flex: 1 1 auto; min-width: 0; font-size: 12px; line-height: 1.25; }
  .ck__acoes { flex: 0 0 auto; gap: 6px; }
  .ck__btn { flex: 0 0 auto; min-width: 0; padding: 6px 9px; font-size: 12px; }
}
/* Com o rodapé na tela o cartão ocupa a folga (padding-bottom), sem cobrir texto. */
.ck.ck--fluxo {
  position: absolute;
  left: 12px;
  right: auto;
  bottom: 0;
  z-index: 3;
  margin: 0;
}
</style>

<style>
/* Folga no fim da página enquanto o aviso está aberto: o cartão é fixed e
   não pode ficar por cima do copyright. A plaquinha da esquerda do hero,
   que pousa na mesma faixa, sobe. */
html[data-ck="open"] { --ck-h: 96px; }
html[data-ck="open"] body { padding-bottom: var(--ck-h); }
@media (min-width: 1280px) {
  html[data-ck="open"] .mha__tag--3 { --y: 64%; }
}
@media (max-width: 759px) {
  html[data-ck="open"] { --ck-h: 0px; }
  html[data-ck="open"] body { padding-bottom: 0; }
}
</style>
