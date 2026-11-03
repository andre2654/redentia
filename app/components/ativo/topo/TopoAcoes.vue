<script setup lang="ts">
// As ações do topo do ativo como botões-ícone redondos, com rótulo embaixo e
// dica no hover (?topo-ativo=1|2|3, 03/11/2026): Seguir (a mesma lógica da
// estrela de hoje, useSeguirAtivo), Adicionar à carteira (o mesmo link),
// Compartilhar (a folha do sistema; sem ela, copia o link) e Perguntar (abre o
// painel do chat com o ativo anexado). Mola só no toque.
const props = withDefaults(defineProps<{
  ticker: string
  seguivel: boolean
  tom?: 'escuro' | 'claro'
  /** sem rótulo embaixo: só o círculo (a barra compacta) */
  compacto?: boolean
}>(), { tom: 'escuro', compacto: false })
const emit = defineEmits<{ perguntar: [] }>()

const caminho = computed(() => `/asset/${props.ticker}`)
const { following, pending, toggle, feedback } = useSeguirAtivo(() => props.ticker, caminho)
const copiado = ref(false)
async function compartilhar() {
  const url = `${window.location.origin}${caminho.value}`
  try {
    if (navigator.share) { await navigator.share({ title: `${props.ticker} · Redentia`, url }); return }
    await navigator.clipboard.writeText(url)
    copiado.value = true
    setTimeout(() => { copiado.value = false }, 1800)
  } catch { /* a pessoa fechou a folha */ }
}
</script>

<template>
  <div class="tac" :class="[`tac--${tom}`, { 'tac--compacto': compacto }]">
    <button
      v-if="seguivel" type="button" class="tac__b" :class="{ 'tac__b--on': following }" :aria-pressed="following" :aria-busy="pending || undefined"
      :title="following ? 'Deixar de seguir' : 'Seguir'" @click="toggle"
    >
      <span class="tac__c" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" :fill="following ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.3l2.63 5.52 6.07.77-4.45 4.2 1.13 6.02L12 16.9l-5.38 2.91 1.13-6.02-4.45-4.2 6.07-.77z" /></svg>
      </span>
      <span class="tac__r">{{ following ? 'Seguindo' : 'Seguir' }}</span>
    </button>
    <NuxtLink to="/" class="tac__b" title="Adicionar à carteira">
      <span class="tac__c" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
      </span>
      <span class="tac__r">Adicionar à carteira</span>
    </NuxtLink>
    <button type="button" class="tac__b" title="Compartilhar" @click="compartilhar">
      <span class="tac__c" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></svg>
      </span>
      <span class="tac__r">{{ copiado ? 'Link copiado' : 'Compartilhar' }}</span>
    </button>
    <button type="button" class="tac__b" title="Perguntar à Redentia sobre este ativo" @click="emit('perguntar')">
      <span class="tac__c" aria-hidden="true">
        <img src="/logo-azul.svg" alt="" width="16" height="16" class="tac__logo">
      </span>
      <span class="tac__r">Perguntar</span>
    </button>
    <p class="tac__msg" :class="{ 'tac__msg--on': !!feedback }" aria-live="polite">{{ feedback?.text ?? '' }}</p>
  </div>
</template>

<style scoped>
.tac { --mola: cubic-bezier(.34, 1.56, .64, 1); position: relative; display: flex; align-items: flex-start; gap: 14px; }
.tac__b {
  display: flex; flex-direction: column; align-items: center; gap: 6px; width: 64px; padding: 0; border: 0; background: none;
  font: inherit; color: inherit; cursor: pointer; text-align: center;
}
.tac__b:focus-visible { outline: none; }
.tac__b:focus-visible .tac__c { box-shadow: 0 0 0 2px var(--nu-blue-soft); }
.tac__c {
  display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%;
  transition: background .2s ease, color .2s ease, transform .45s var(--mola), box-shadow .2s ease;
}
.tac__b:hover .tac__c { transform: translateY(-2px); }
.tac__b:active .tac__c { transform: scale(.92); }
.tac__r { font-size: var(--nu-fs-xs); font-weight: 600; line-height: 1.25; }
.tac--escuro .tac__c { background: var(--nu-agora-pilula); color: var(--nu-agora-texto); box-shadow: inset 0 0 0 1px var(--nu-agora-linha); }
.tac--escuro .tac__b:hover .tac__c { background: var(--nu-white-18); }
.tac--escuro .tac__r { color: var(--nu-agora-sub); }
.tac--escuro .tac__b--on .tac__c { background: var(--nu-green-soft); color: var(--nu-navy); box-shadow: none; }
.tac--escuro .tac__logo { filter: brightness(0) invert(1); }
.tac--claro .tac__c { background: var(--nu-cream); color: var(--nu-ink); }
.tac--claro .tac__b:hover .tac__c { background: var(--nu-white); box-shadow: 0 0 0 1px var(--nu-navy-06), var(--nu-shadow-card); }
.tac--claro .tac__r { color: var(--nu-gray-2); }
.tac--claro .tac__b--on .tac__c { background: var(--nu-blue-bg); color: var(--nu-blue-text); }
.tac--compacto { gap: 6px; }
.tac--compacto .tac__b { width: auto; }
.tac--compacto .tac__c { width: 36px; height: 36px; }
.tac--compacto .tac__r { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.tac__msg { position: absolute; top: 100%; left: 0; margin: 6px 0 0; font-size: var(--nu-fs-xs); font-weight: 600; opacity: 0; transition: opacity .2s ease; white-space: nowrap; }
.tac--escuro .tac__msg { color: var(--nu-agora-sub); }
.tac__msg--on { opacity: 1; }
@media (prefers-reduced-motion: reduce) {
  .tac__c, .tac__msg { transition: none; }
  .tac__b:hover .tac__c, .tac__b:active .tac__c { transform: none; }
}
</style>
