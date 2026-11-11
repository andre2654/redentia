<script setup lang="ts">
// "Compartilhar" das calculadoras na frase (21/10/2026): o link da conta com
// os valores na URL, a mesma que o salvar grava e a calculadora reabre. No
// celular usa o compartilhar do sistema; no computador copia o link.
// Robustez (11/11/2026): o retorno é na hora e sem pulo. Os dois rótulos e os
// dois ícones (a seta e o check) moram na mesma célula e trocam com fade; o
// botão tem a largura do maior. O "Link copiado" fica verde e volta sozinho.
const props = defineProps<{
  /** caminho com os parâmetros da conta ("/calculadora/aposentadoria?age=35…") */
  link: string
  titulo: string
}>()

const copiado = ref(false)
// o segundo rótulo só existe depois de montar (o HTML do servidor tem "Compartilhar")
const montado = ref(false)
onMounted(() => { montado.value = true })
let volta: ReturnType<typeof setTimeout> | null = null

async function compartilhar() {
  const url = new URL(props.link, window.location.origin).href
  const toque = window.matchMedia('(pointer: coarse)').matches
  if (toque && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: props.titulo, url })
      return
    }
    catch (e) {
      // quem fecha o painel do sistema não quer o link copiado
      if ((e as DOMException)?.name === 'AbortError') return
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    copiado.value = true
    if (volta) clearTimeout(volta)
    volta = setTimeout(() => { copiado.value = false }, 2200)
  }
  catch { /* sem a área de transferência, o link segue na barra do navegador */ }
}
onBeforeUnmount(() => { if (volta) clearTimeout(volta) })
</script>

<template>
  <button type="button" class="ccp" :class="{ 'ccp--feito': copiado }" :aria-label="copiado ? 'Link copiado' : 'Compartilhar'" @click="compartilhar">
    <span class="ccp__icones" aria-hidden="true">
      <svg class="ccp__icone" :class="{ 'ccp__icone--on': !copiado }" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7 8l5-5 5 5" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /></svg>
      <svg class="ccp__icone" :class="{ 'ccp__icone--on': copiado }" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
    </span>
    <span class="ccp__texto" aria-hidden="true">
      <span class="ccp__rotulo" :class="{ 'ccp__rotulo--on': !copiado }">Compartilhar</span>
      <span v-if="montado" class="ccp__rotulo" :class="{ 'ccp__rotulo--on': copiado }">Link copiado</span>
    </span>
  </button>
</template>

<style scoped>
/* a segunda ação do cartão: o contorno carvão de 1,5px (sinal de interação), 48px como o salvar */
.ccp {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 48px; padding: 0 20px;
  border: 0; border-radius: var(--nu-r-pill); cursor: pointer; white-space: nowrap;
  background: var(--nu-white); color: var(--nu-ink); box-shadow: inset 0 0 0 1.5px var(--nu-ink);
  font: inherit; font-size: 15.5px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto);
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), box-shadow var(--nu-dur-media) var(--nu-ease-cor), color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.ccp:hover { background: var(--nu-row-hover); }
.ccp:active { transform: scale(.98); }
.ccp--feito, .ccp--feito:hover { color: var(--nu-green-text); background: var(--nu-white); box-shadow: inset 0 0 0 1.5px var(--nu-green-text); }
.ccp:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 2px; }
/* os ícones e os rótulos na mesma célula: troca com fade, sem mudar a largura */
.ccp__icones, .ccp__texto { display: inline-grid; }
/* quem sai some rápido; quem entra vem logo depois (sem as duas palavras uma sobre a outra) */
.ccp__icone, .ccp__rotulo {
  grid-area: 1 / 1; opacity: 0; visibility: hidden;
  transition: opacity var(--nu-dur-rapida) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-cor), visibility 0s linear var(--nu-dur-rapida);
}
.ccp__icone { transform: scale(.8); }
.ccp__rotulo { text-align: center; transform: translateY(-3px); }
.ccp__icone--on, .ccp__rotulo--on {
  opacity: 1; visibility: visible; transform: none;
  transition: opacity var(--nu-dur-media) var(--nu-ease-saida) var(--nu-dur-rapida), transform var(--nu-dur-media) var(--nu-ease-saida) var(--nu-dur-rapida), visibility 0s;
}
/* na barra do celular, só o ícone ao lado do salvar */
@media (max-width: 900px) {
  .ccp { flex: none; width: 48px; padding: 0; }
  .ccp__texto { display: none; }
}
</style>
