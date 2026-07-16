<script setup lang="ts">
// Header Nu — fiel ao design (quadrado azul com a marca, nav de pills, busca
// circular; deslogado = Entrar/Criar conta; logado = pill IA + avatar).
// Contrato de UX: designs/Redentia {Mercado,Home} Nu.dc.html.
//
// UX do dono (2026-07-11):
// - STICKY top 0 (a faixa "Mercado agora" gruda logo abaixo via var --nuh-h)
// - ao rolar, o header ENCOLHE com animação suave (76px → 58px; itens junto)
// - mobile (≤760): nav e CTAs saem; ficam busca + avatar (logado) + hambúrguer
//   que abre um menu full-screen (itens grandes com chevron, ativo em azul,
//   CTAs de rodapé) — referência visual enviada pelo dono.
const { isAuthenticated, initial, clearSession } = useAuthState()
const route = useRoute()

// Estrutura de nav (direção do dono 2026-07-13): Início (a home única = o
// Mercado auth-aware) · Carteira (logado — página separada) · Teses ·
// Ferramentas (drawer: calculadoras + rankings) · Informações (drawer:
// guias + notícias). Mesma estrutura no menu mobile (grupos expansíveis).
interface NavChild { label: string; to: string }
interface NavItem { label: string; to?: string; children?: NavChild[]; authOnly?: boolean }

const NAV: NavItem[] = [
  { label: 'Início', to: '/' },
  { label: 'Carteira', to: '/carteira', authOnly: true },
  { label: 'Teses', to: '/teses' },
  {
    label: 'Ferramentas',
    children: [
      { label: 'Calculadoras', to: '/calculadoras' },
      { label: 'Rankings de Ações', to: '/rankings?classe=acoes' },
      { label: 'Rankings de FIIs', to: '/rankings?classe=fiis' },
      { label: 'Rankings de BDRs', to: '/rankings?classe=bdrs' },
      { label: 'Ranking de Renda Fixa', to: '/ranking/tesouro-direto' },
    ],
  },
  {
    label: 'Informações',
    children: [
      { label: 'Guias', to: '/guias' },
      { label: 'Notícias', to: '/noticias' },
      { label: 'Setores', to: '/setor' },
      { label: 'Glossário', to: '/glossario' },
    ],
  },
]
const nav = computed(() => NAV.filter((i) => !i.authOnly || isAuthenticated.value))

function isActive(to: string): boolean {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(`${to.split('/').slice(0, 2).join('/')}/`) && to !== '/'
}
// pai (drawer) ativo quando qualquer filho está ativo
function isParentActive(item: NavItem): boolean {
  if (item.to) return isActive(item.to)
  return (item.children ?? []).some((c) => isActive(c.to))
}

/* ——— drawers da nav (desktop) ———
   O painel é position:FIXED ancorado no botão (não absolute): a nav tem
   overflow-x:auto (scroll em telas estreitas) e um absolute lá dentro é
   CLIPADO pelo overflow — o drawer abria invisível. Fixed escapa do clip;
   fecha ao rolar (o header encolhe e a âncora muda). */
const openDrawer = ref<string | null>(null)
const drawerPos = ref({ left: 0, top: 0 })
function toggleDrawer(label: string, ev: MouseEvent) {
  if (openDrawer.value === label) {
    openDrawer.value = null
    return
  }
  const r = (ev.currentTarget as HTMLElement).getBoundingClientRect()
  drawerPos.value = {
    left: Math.max(8, Math.min(r.left, window.innerWidth - 246)), // clampa na borda
    top: r.bottom + 8,
  }
  openDrawer.value = label
}
function onNavDocClick(e: MouseEvent) {
  const nav = document.querySelector('.nuh__nav')
  if (nav && !nav.contains(e.target as Node)) openDrawer.value = null
}
function onNavKey(e: KeyboardEvent) {
  if (e.key === 'Escape') openDrawer.value = null
}
watch(openDrawer, (o) => {
  if (!import.meta.client) return
  if (o) {
    document.addEventListener('click', onNavDocClick, true)
    document.addEventListener('keydown', onNavKey)
  } else {
    document.removeEventListener('click', onNavDocClick, true)
    document.removeEventListener('keydown', onNavKey)
  }
})

/* ——— menu de conta (avatar logado) ———
   Mesma mecânica dos drawers da nav: painel position:fixed ancorado no
   getBoundingClientRect do avatar, fecha com click-fora/Escape/scroll.
   Itens: Minha carteira · Sair (encerra a sessão e volta pra raiz, que sem
   sessão renderiza o conteúdo público). */
const ACCOUNT_W = 230 // = min-width do .nuh__drawer (alinha a borda direita no avatar)
const accountOpen = ref(false)
const accountPos = ref({ left: 0, top: 0 })
function toggleAccount(ev: MouseEvent) {
  if (accountOpen.value) {
    accountOpen.value = false
    return
  }
  const r = (ev.currentTarget as HTMLElement).getBoundingClientRect()
  accountPos.value = {
    left: Math.max(8, Math.min(r.right - ACCOUNT_W, window.innerWidth - ACCOUNT_W - 8)),
    top: r.bottom + 8,
  }
  accountOpen.value = true
}
function onAccountDocClick(e: MouseEvent) {
  const wrap = document.querySelector('.nuh__account')
  if (wrap && !wrap.contains(e.target as Node)) accountOpen.value = false
}
function onAccountKey(e: KeyboardEvent) {
  if (e.key === 'Escape') accountOpen.value = false
}
watch(accountOpen, (o) => {
  if (!import.meta.client) return
  if (o) {
    document.addEventListener('click', onAccountDocClick, true)
    document.addEventListener('keydown', onAccountKey)
  } else {
    document.removeEventListener('click', onAccountDocClick, true)
    document.removeEventListener('keydown', onAccountKey)
  }
})
async function logout() {
  accountOpen.value = false
  toggleMenu(false)
  clearSession()
  await navigateTo('/')
}

/* ——— shrink on scroll (com HISTERESE) ———
   Limiar único oscilava na fronteira: encolher tira 18px de altura do header,
   o conteúdo sobe, o scroll re-cruza o limiar → estica → desce de novo → pumping
   ("quase pra cima" ficava bugado). Dois limiares com vão (56px) MAIOR que o
   delta de altura (18px): encolhe só passando de 72, volta só abaixo de 16 —
   nenhuma mudança de altura consegue cruzar os dois ao mesmo tempo. */
const SHRINK_AT = 72
const GROW_AT = 16
const shrunk = ref(false)
let raf = 0
function onScroll() {
  if (raf) return
  raf = requestAnimationFrame(() => {
    raf = 0
    const y = window.scrollY
    if (!shrunk.value && y > SHRINK_AT) shrunk.value = true
    else if (shrunk.value && y < GROW_AT) shrunk.value = false
    if (openDrawer.value) openDrawer.value = null // painel é fixed: a âncora se move ao rolar
    if (accountOpen.value) accountOpen.value = false // idem
  })
}
// A faixa do ticker (irmã no layout) lê --nuh-h pra grudar logo abaixo;
// a var vive no <html> pra atravessar os escopos. Fallback SSR: 76px.
watch(shrunk, (s) => {
  document.documentElement.style.setProperty('--nuh-h', s ? '58px' : '76px')
})

/* ——— menu mobile ——— */
const menuOpen = ref(false)
const menuGroup = ref<string | null>(null) // grupo expandido (Ferramentas/Informações)
const menuRef = ref<HTMLElement | null>(null)
// a11y do overlay full-screen: trap de Tab + restauração de foco pro hambúrguer
// (antes o Tab vazava pra página atrás e o Esc não fechava nada).
useModalA11y(menuRef, menuOpen)
function onMenuKey(e: KeyboardEvent) {
  if (e.key === 'Escape') toggleMenu(false)
}
function toggleMenu(open: boolean) {
  menuOpen.value = open
  if (!open) menuGroup.value = null
  if (import.meta.client) {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    if (open) document.addEventListener('keydown', onMenuKey)
    else document.removeEventListener('keydown', onMenuKey)
  }
}
watch(() => route.fullPath, () => { toggleMenu(false); openDrawer.value = null; accountOpen.value = false })

// (o banner contextual de seções — "Carteira · 6 seções" — vive no
//  NuSectionRail, que já aparece em todos os breakpoints; nada aqui.)

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  if (raf) cancelAnimationFrame(raf)
  document.removeEventListener('click', onNavDocClick, true)
  document.removeEventListener('keydown', onNavKey)
  document.removeEventListener('click', onAccountDocClick, true)
  document.removeEventListener('keydown', onAccountKey)
  document.removeEventListener('keydown', onMenuKey)
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <div class="nuh-wrap" :class="{ 'nuh-wrap--shrunk': shrunk }">
    <div class="nuh">
      <NuxtLink to="/" class="nuh__brand" aria-label="Redentia">
        <img src="/logo-branca.svg" alt="Redentia" class="nuh__logo">
      </NuxtLink>

      <nav class="nuh__nav" data-nu-nav>
        <template v-for="item in nav" :key="item.label">
          <!-- link direto -->
          <NuxtLink
            v-if="item.to" :to="item.to"
            class="nuh__navitem" :class="{ 'nuh__navitem--active': isActive(item.to) }"
          >{{ item.label }}</NuxtLink>

          <!-- drawer (Ferramentas / Informações) -->
          <div v-else class="nuh__drawer-wrap">
            <button
              type="button" class="nuh__navitem nuh__navitem--drawer"
              :class="{ 'nuh__navitem--active': isParentActive(item), 'nuh__navitem--open': openDrawer === item.label }"
              :aria-expanded="openDrawer === item.label" aria-haspopup="menu"
              @click="toggleDrawer(item.label, $event)"
            >
              {{ item.label }}
              <svg class="nuh__drawer-chev" :class="{ 'nuh__drawer-chev--open': openDrawer === item.label }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg>
            </button>
            <div
              v-if="openDrawer === item.label" class="nuh__drawer" role="menu"
              :style="{ left: `${drawerPos.left}px`, top: `${drawerPos.top}px` }"
            >
              <NuxtLink
                v-for="c in item.children" :key="c.to" :to="c.to" role="menuitem"
                class="nuh__drawer-item" :class="{ 'nuh__drawer-item--active': isActive(c.to) }"
                @click="openDrawer = null"
              >{{ c.label }}</NuxtLink>
            </div>
          </div>
        </template>
      </nav>

      <div class="nuh__right" :class="{ 'nuh__right--auth': isAuthenticated }">
        <NuxtLink to="/busca" class="nuh__search" aria-label="Buscar">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#0A0A0C" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" /></svg>
        </NuxtLink>

        <template v-if="isAuthenticated">
          <NuxtLink to="/busca" class="nuh__ai nuh__desktop-only">
            <span>Pergunte à Redentia AI</span>
          </NuxtLink>
          <div class="nuh__account">
            <button
              type="button" class="nuh__avatar" aria-label="Conta"
              :aria-expanded="accountOpen" aria-haspopup="menu"
              @click="toggleAccount"
            >{{ initial }}</button>
            <div
              v-if="accountOpen" class="nuh__drawer" role="menu"
              :style="{ left: `${accountPos.left}px`, top: `${accountPos.top}px` }"
            >
              <NuxtLink to="/carteira" role="menuitem" class="nuh__drawer-item" @click="accountOpen = false">Minha carteira</NuxtLink>
              <NuxtLink to="/conta" role="menuitem" class="nuh__drawer-item" @click="accountOpen = false">Configurações</NuxtLink>
              <div class="nuh__account-div" role="separator" />
              <button type="button" role="menuitem" class="nuh__drawer-item nuh__drawer-item--danger" @click="logout">Sair</button>
            </div>
          </div>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="nuh__enter nuh__desktop-only">Entrar</NuxtLink>
          <NuxtLink to="/login" class="nuh__cta nuh__desktop-only">Criar conta grátis</NuxtLink>
        </template>

        <button type="button" class="nuh__burger" aria-label="Abrir menu" :aria-expanded="menuOpen" @click="toggleMenu(true)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A0A0C" stroke-width="2.4" stroke-linecap="round"><path d="M4 9h16M4 15h16" /></svg>
        </button>
      </div>
    </div>

    <!-- menu mobile full-screen (referência do dono) -->
    <Teleport to="body">
      <div v-if="menuOpen" ref="menuRef" class="num" role="dialog" aria-modal="true" aria-label="Menu" tabindex="-1">
        <div class="num__top">
          <NuxtLink to="/" class="num__brand" aria-label="Redentia" @click="toggleMenu(false)">
            <img src="/logo-branca.svg" alt="Redentia" class="num__logo">
          </NuxtLink>
          <div class="num__top-right">
            <NuxtLink to="/busca" class="num__icon" aria-label="Buscar" @click="toggleMenu(false)">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A0A0C" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" /></svg>
            </NuxtLink>
            <button type="button" class="num__icon" aria-label="Fechar menu" @click="toggleMenu(false)">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A0A0C" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
        </div>

        <nav class="num__list">
          <template v-for="item in nav" :key="item.label">
            <!-- link direto -->
            <NuxtLink
              v-if="item.to" :to="item.to"
              class="num__item" :class="{ 'num__item--active': isActive(item.to) }"
              @click="toggleMenu(false)"
            >
              <span>{{ item.label }}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="isActive(item.to) ? 'var(--nu-blue)' : '#0A0A0C'" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </NuxtLink>

            <!-- grupo expansível (Ferramentas / Informações) -->
            <div v-else class="num__group">
              <button
                type="button" class="num__item num__item--group"
                :class="{ 'num__item--active': isParentActive(item) }"
                :aria-expanded="menuGroup === item.label"
                @click="menuGroup = menuGroup === item.label ? null : item.label"
              >
                <span>{{ item.label }}</span>
                <svg class="num__group-chev" :class="{ 'num__group-chev--open': menuGroup === item.label }" width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="isParentActive(item) ? 'var(--nu-blue)' : '#0A0A0C'" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              <div v-if="menuGroup === item.label" class="num__sublist">
                <NuxtLink
                  v-for="c in item.children" :key="c.to" :to="c.to"
                  class="num__subitem" :class="{ 'num__subitem--active': isActive(c.to) }"
                  @click="toggleMenu(false)"
                >
                  <span>{{ c.label }}</span>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
                </NuxtLink>
              </div>
            </div>
          </template>
        </nav>

        <div class="num__ctas">
          <template v-if="isAuthenticated">
            <NuxtLink to="/carteira" class="num__cta-outline" @click="toggleMenu(false)">Minha carteira</NuxtLink>
            <NuxtLink to="/conta" class="num__cta-outline" @click="toggleMenu(false)">Configurações</NuxtLink>
            <NuxtLink to="/busca" class="num__cta" @click="toggleMenu(false)">Pergunte à Redentia AI</NuxtLink>
            <button type="button" class="num__logout" @click="logout">Sair</button>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="num__cta-outline" @click="toggleMenu(false)">Entrar</NuxtLink>
            <NuxtLink to="/login" class="num__cta" @click="toggleMenu(false)">Criar conta grátis</NuxtLink>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.nuh-wrap {
  background: var(--nu-white);
  position: sticky; top: 0; z-index: 50;
}
/* alturas/tamanhos animam juntos no shrink (UX do dono) */
.nuh { display: flex; align-items: center; gap: 8px; height: 76px; padding-right: 20px; transition: height .28s ease; }
.nuh-wrap--shrunk .nuh { height: 58px; }
.nuh__brand {
  width: 76px; height: 76px; flex-shrink: 0; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center;
  transition: width .28s ease, height .28s ease;
}
.nuh-wrap--shrunk .nuh__brand { width: 58px; height: 58px; }
.nuh__logo { width: 34px; height: 34px; display: block; object-fit: contain; transition: width .28s ease, height .28s ease; }
.nuh-wrap--shrunk .nuh__logo { width: 27px; height: 27px; }
.nuh__nav {
  display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0;
  overflow-x: auto; padding: 0 14px;
}
.nuh__navitem {
  padding: 10px 14px; color: var(--nu-ink); font-size: 16px; font-weight: 700;
  white-space: nowrap; border-radius: var(--nu-r-chip);
  transition: background .2s, font-size .28s ease, padding .28s ease;
}
.nuh-wrap--shrunk .nuh__navitem { font-size: 14.5px; padding: 8px 12px; }
.nuh__navitem:hover { background: var(--nu-cream-hover); }
.nuh__navitem--active { color: var(--nu-blue); background: var(--nu-blue-tint); }
.nuh__navitem--active:hover { background: var(--nu-blue-tint); }

/* ——— drawers da nav (Ferramentas / Informações) ——— */
.nuh__drawer-wrap { position: relative; flex-shrink: 0; }
.nuh__navitem--drawer {
  display: inline-flex; align-items: center; gap: 6px;
  border: none; background: transparent; cursor: pointer; font-family: inherit;
}
.nuh__navitem--open { background: var(--nu-cream-hover); }
.nuh__drawer-chev { transition: transform .2s ease; }
.nuh__drawer-chev--open { transform: rotate(180deg); }
.nuh__drawer {
  /* fixed (não absolute): escapa do overflow-x:auto da nav — ver nota no script */
  position: fixed; z-index: 60;
  min-width: 230px; padding: 8px;
  background: var(--nu-white); border-radius: var(--nu-r-tile);
  box-shadow: 0 24px 54px -22px rgba(12, 21, 36, 0.35), 0 2px 8px rgba(12, 21, 36, 0.08);
  display: flex; flex-direction: column; gap: 2px;
  animation: nu-fade .16s ease both;
}
.nuh__drawer-item {
  display: block; padding: 11px 14px; border-radius: 10px;
  color: var(--nu-ink); font-size: 15px; font-weight: 700; white-space: nowrap;
  transition: background .15s;
}
.nuh__drawer-item:hover { background: var(--nu-cream-hover); color: var(--nu-ink); }
.nuh__drawer-item--active { color: var(--nu-blue); background: var(--nu-blue-tint); }
.nuh__right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.nuh__right--auth { gap: 14px; }
.nuh__search {
  width: 42px; height: 42px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: background .2s, width .28s ease, height .28s ease;
}
.nuh-wrap--shrunk .nuh__search { width: 36px; height: 36px; }
.nuh__search:hover { background: var(--nu-cream-hover); }
.nuh__enter {
  display: inline-flex; align-items: center; background: transparent; color: var(--nu-blue);
  border: 2px solid var(--nu-blue); border-radius: var(--nu-r-pill); padding: 10px 22px;
  font-size: 15.5px; font-weight: 700; white-space: nowrap;
  transition: background .2s, padding .28s ease, font-size .28s ease;
}
.nuh-wrap--shrunk .nuh__enter { padding: 7px 18px; font-size: 14.5px; }
.nuh__enter:hover { background: var(--nu-blue-tint-2); color: var(--nu-blue); }
.nuh__cta {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 12px 22px;
  font-size: 15.5px; font-weight: 700; white-space: nowrap;
  transition: background .2s, padding .28s ease, font-size .28s ease;
}
.nuh-wrap--shrunk .nuh__cta { padding: 9px 18px; font-size: 14.5px; }
.nuh__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.nuh__ai {
  display: inline-flex; align-items: center; gap: 9px; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 12px 22px;
  font-size: 15.5px; font-weight: 700; white-space: nowrap;
  transition: background .2s, padding .28s ease, font-size .28s ease;
}
.nuh-wrap--shrunk .nuh__ai { padding: 9px 18px; font-size: 14.5px; }
.nuh__ai:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.nuh__account { position: relative; flex-shrink: 0; display: flex; }
.nuh__avatar {
  width: 42px; height: 42px; border-radius: 50%; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center;
  border: none; padding: 0; cursor: pointer; font-family: inherit;
  color: var(--nu-white); font-size: 14.5px; font-weight: 700;
  transition: background .2s, width .28s ease, height .28s ease;
}
.nuh__avatar:hover { background: var(--nu-blue-hover); }
.nuh-wrap--shrunk .nuh__avatar { width: 36px; height: 36px; }
/* menu de conta: reusa o painel .nuh__drawer; só o divisor e o "Sair" são novos */
.nuh__account-div { height: 1.5px; background: var(--nu-cream-2); margin: 4px 6px; }
.nuh__drawer-item--danger {
  width: 100%; text-align: left; border: none; background: transparent;
  cursor: pointer; font-family: inherit; color: var(--nu-red);
}
.nuh__drawer-item--danger:hover { background: var(--nu-red-tint); color: var(--nu-red-2); }
.nuh__burger {
  display: none; width: 42px; height: 42px; border: none; background: transparent;
  align-items: center; justify-content: center; cursor: pointer; border-radius: 50%;
}

/* ——— mobile: só busca + avatar + hambúrguer (referência do dono) ——— */
@media (max-width: 760px) {
  .nuh__nav { display: none; }
  .nuh__desktop-only { display: none; }
  .nuh__burger { display: flex; }
  /* a nav (display:none) era o espaçador flex — empurra os ícones pra direita */
  .nuh__right { margin-left: auto; }
}

/* ——— menu full-screen ——— */
.num {
  position: fixed; inset: 0; z-index: 100; background: var(--nu-white);
  display: flex; flex-direction: column; animation: nu-fade .25s ease both;
}
.num__top { display: flex; align-items: center; justify-content: space-between; height: 76px; padding-right: 20px; }
.num__brand {
  width: 76px; height: 76px; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center;
}
.num__logo { width: 34px; height: 34px; display: block; object-fit: contain; }
.num__top-right { display: flex; align-items: center; gap: 10px; }
.num__icon {
  width: 42px; height: 42px; border-radius: 50%; border: none; background: transparent;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.num__list { flex: 1; overflow-y: auto; padding: 26px 24px 12px; display: flex; flex-direction: column; }
.num__item {
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
  padding: 19px 4px; color: var(--nu-ink); font-size: 27px; font-weight: 800;
  letter-spacing: -0.03em;
}
.num__item--active { color: var(--nu-blue); }
.num__item--group { width: 100%; border: none; background: transparent; cursor: pointer; font-family: inherit; text-align: left; }
.num__group-chev { transition: transform .22s ease; }
.num__group-chev--open { transform: rotate(180deg); }
.num__sublist { display: flex; flex-direction: column; padding: 0 0 8px; }
.num__subitem {
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
  padding: 13px 4px 13px 18px; color: var(--nu-gray-2); font-size: 18px; font-weight: 700;
}
.num__subitem svg { color: var(--nu-gray); flex-shrink: 0; }
.num__subitem--active { color: var(--nu-blue); }
.num__subitem--active svg { color: var(--nu-blue); }
.num__ctas {
  padding: 18px 24px calc(24px + env(safe-area-inset-bottom, 0px));
  border-top: 1.5px solid var(--nu-cream-2);
  display: flex; flex-direction: column; gap: 12px;
}
.num__cta {
  display: flex; align-items: center; justify-content: center; background: var(--nu-blue);
  color: var(--nu-white); border-radius: var(--nu-r-pill); padding: 17px 24px;
  font-size: 16.5px; font-weight: 800;
}
.num__cta-outline {
  display: flex; align-items: center; justify-content: center; background: transparent;
  color: var(--nu-blue); border: 2px solid var(--nu-blue); border-radius: var(--nu-r-pill);
  padding: 15px 24px; font-size: 16.5px; font-weight: 800;
}
.num__logout {
  display: flex; align-items: center; justify-content: center; background: transparent;
  border: none; cursor: pointer; font-family: inherit;
  color: var(--nu-red); border-radius: var(--nu-r-pill);
  padding: 13px 24px; font-size: 15.5px; font-weight: 800;
}
.num__logout:hover { background: var(--nu-red-tint); }

</style>
