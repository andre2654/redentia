<script setup lang="ts">
// Sidebar de /conta = ATALHOS DE SCROLL (scrollspy), não abas (direção do dono
// 2026-07-14). Uma página só com todas as seções empilhadas à direita; clicar
// rola até a seção e o item ativo acende conforme o scroll — mesma mecânica do
// NuTocSidebar (useNuScrollFrame + getBoundingClientRect < 40% do viewport).
// Visual (Aportou, 11/11/2026): ícone + label; o item ativo é a pílula carvão
// (o mesmo gesto das abas da marca), com o ícone no cobalto que lê sobre escuro.
const items = [
  { id: 'perfil', label: 'Perfil', icon: 'user' },
  { id: 'assinatura', label: 'Assinatura', icon: 'card' },
  { id: 'notificacoes', label: 'Notificações', icon: 'bell' },
  { id: 'open-finance', label: 'Open Finance', icon: 'link' },
  { id: 'mcp', label: 'Aportou MCP', icon: 'mcp' },
  { id: 'seguranca', label: 'Segurança', icon: 'shield' },
] as const

const ICON: Record<string, string[]> = {
  user: ['M20 21a8 8 0 0 0-16 0', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'],
  card: ['M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z', 'M3 10h18', 'M7 15h3'],
  bell: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'],
  link: ['M9 17H7A5 5 0 0 1 7 7h2', 'M15 7h2a5 5 0 0 1 0 10h-2', 'M8 12h8'],
  mcp: ['M12 3v18', 'M3 12h18', 'M5.6 5.6l12.8 12.8', 'M18.4 5.6 5.6 18.4'],
  shield: ['M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3Z'],
}

const active = ref(0)
// No celular os atalhos são uma faixa que rola de lado: quando a seção muda, a
// pílula ativa vem para o meio da faixa (antes ela ficava fora da tela a partir
// de "Notificações"). Só mexe na rolagem horizontal da faixa, nunca na da página.
const nav = ref<HTMLElement | null>(null)
watch(active, (i) => {
  const el = nav.value
  if (!el || el.scrollWidth <= el.clientWidth) return
  const item = el.children[i] as HTMLElement | undefined
  if (!item) return
  const alvo = item.offsetLeft - (el.clientWidth - item.offsetWidth) / 2
  const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollTo({ left: Math.max(0, alvo), behavior: suave ? 'smooth' : 'auto' })
})
useNuScrollFrame(() => {
  const vh = window.innerHeight || 800
  let idx = 0
  items.forEach((it, i) => {
    const el = document.getElementById(it.id)
    if (el && el.getBoundingClientRect().top < vh * 0.4) idx = i
  })
  active.value = idx
})

// clique = rola suave até a seção (respeita scroll-margin-top do header sticky)
// + atualiza o hash pra deep-link, sem o "pulo" seco da âncora nativa.
function go(e: MouseEvent, id: string) {
  e.preventDefault()
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  if (typeof history !== 'undefined') history.replaceState(null, '', '#' + id)
}
</script>

<template>
  <nav ref="nav" class="csb" aria-label="Seções da conta">
    <a
      v-for="(it, i) in items"
      :key="it.id"
      :href="'#' + it.id"
      class="csb__item"
      :class="{ 'csb__item--active': active === i }"
      :aria-current="active === i ? 'true' : undefined"
      @click="go($event, it.id)"
    >
      <svg class="csb__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path v-for="d in ICON[it.icon]" :key="d" :d="d" />
      </svg>
      <span>{{ it.label }}</span>
    </a>
  </nav>
</template>

<style scoped>
.csb { display: flex; flex-direction: column; gap: 4px; }
.csb__item {
  display: flex; align-items: center; gap: 13px; min-height: 48px;
  padding: 0 18px; border-radius: var(--nu-r-pill);
  color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio);
  transition: background .2s, color .2s;
}
.csb__item:hover { color: var(--nu-ink); background: var(--nu-cream-2); }
.csb__item--active,
.csb__item--active:hover { background: var(--nu-ink); color: var(--nu-white); }
.csb__icon { flex-shrink: 0; color: var(--nu-gray); transition: color .2s, transform .2s; }
.csb__item:hover .csb__icon { color: var(--nu-blue); transform: translateX(2px); }
.csb__item--active .csb__icon,
.csb__item--active:hover .csb__icon { color: var(--nu-blue-on-dark); transform: none; }

@media (max-width: 860px) {
  .csb { flex-direction: row; overflow-x: auto; gap: 8px; scrollbar-width: none; overscroll-behavior-x: contain; }
  .csb::-webkit-scrollbar { display: none; }
  .csb__item { flex-shrink: 0; min-height: 44px; padding: 0 16px; background: var(--nu-cream-2); }
  .csb__item--active, .csb__item--active:hover { background: var(--nu-ink); }
}
@media (prefers-reduced-motion: reduce) {
  .csb__icon { transition: none; }
}
</style>
