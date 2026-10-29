<script setup lang="ts">
// Aviso pequeno de cookies. Faixa no fluxo, logo abaixo do header (ou no
// topo, nas páginas sem layout): não cobre o header do ativo nem títulos
// que passam pelo canto da tela. Os dois botões têm o mesmo peso de
// propósito: nenhum é o "certo".
// Se um dia o aviso voltar a sentar na âncora do rodapé, a folga
// (padding-bottom) continua sendo a altura do cartão.
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
  // A faixa é do fluxo (não fixed): não reserva altura no fim da tela.
  document.documentElement.style.setProperty('--ck-h', '0px')
}

function aplicarFolga() {
  const footer = rodape()
  // Só a folga de verdade quando o aviso está na âncora do rodapé.
  const noRodape = !!el.value?.closest('#ancora-cookies')
  const folga = folgaDoBannerNoRodape(emFluxo.value && noRodape, el.value?.offsetHeight ?? 0)
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
</template>

<style scoped>
.ck {
  position: relative;
  z-index: 1;
  left: auto;
  right: auto;
  bottom: auto;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: 8px 10px;
  width: 100%;
  max-width: 100%;
  margin: 0;
  box-sizing: border-box;
  padding: 8px 12px;
  border-radius: 0;
  background: var(--nu-cream);
  color: var(--nu-navy);
  border: 0;
  border-bottom: 1px solid rgba(12, 21, 36, 0.14);
  box-shadow: none;
  font-family: var(--nu-font);
}
.ck__txt {
  flex: 1 1 12rem;
  min-width: 0;
  margin: 0;
  color: var(--nu-navy);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.35;
  overflow-wrap: anywhere;
}
.ck__links { white-space: normal; }
.ck__txt a {
  color: var(--nu-blue);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.ck__txt a:hover { color: var(--nu-blue-hover); }
.ck__acoes { display: flex; flex-wrap: wrap; gap: 8px; flex: 0 0 auto; }
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

@media (max-width: 759px) {
  .ck { padding: 8px 10px; }
  .ck__txt { font-size: 12px; line-height: 1.25; }
  .ck__acoes { gap: 6px; }
  .ck__btn { padding: 6px 9px; font-size: 12px; }
}
/* No fluxo do rodapé o cartão também não sai do documento: a folga, se
   houver, é o padding-bottom do rodapé, não um fixed por cima do texto. */
.ck.ck--fluxo {
  position: relative;
  left: auto;
  right: auto;
  bottom: auto;
}
</style>

<style>
/* A faixa empurra o conteúdo; não cobre o fim da página. --ck-h fica 0
   para o convite da newsletter não subir por um cartão que não está no canto. */
html[data-ck="open"] { --ck-h: 0px; }
html[data-ck="open"] body { padding-bottom: var(--ck-h); }
</style>
