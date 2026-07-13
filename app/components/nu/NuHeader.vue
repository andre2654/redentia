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
const { isAuthenticated, initial } = useAuthState()
const route = useRoute()

const NAV_ANON = [
  { label: 'Mercado', to: '/mercado' },
  { label: 'Ações', to: '/acao/PETR4' },
  { label: 'Notícias', to: '/noticias' },
  { label: 'Guias', to: '/guias' },
  { label: 'Calculadoras', to: '/calculadoras' },
]
const NAV_AUTH = [
  { label: 'Início', to: '/' },
  { label: 'Ações', to: '/acao/PETR4' },
  { label: 'Carteira', to: '/carteira' },
  { label: 'Notícias', to: '/noticias' },
  { label: 'Mercado', to: '/mercado' },
  { label: 'Guias', to: '/guias' },
  { label: 'Calculadoras', to: '/calculadoras' },
]
const nav = computed(() => (isAuthenticated.value ? NAV_AUTH : NAV_ANON))

function isActive(to: string): boolean {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(`${to.split('/').slice(0, 2).join('/')}/`) && to !== '/'
}

/* ——— shrink on scroll ——— */
const shrunk = ref(false)
let raf = 0
function onScroll() {
  if (raf) return
  raf = requestAnimationFrame(() => {
    raf = 0
    shrunk.value = window.scrollY > 12
  })
}
// A faixa do ticker (irmã no layout) lê --nuh-h pra grudar logo abaixo;
// a var vive no <html> pra atravessar os escopos. Fallback SSR: 76px.
watch(shrunk, (s) => {
  document.documentElement.style.setProperty('--nuh-h', s ? '58px' : '76px')
})

/* ——— menu mobile ——— */
const menuOpen = ref(false)
function toggleMenu(open: boolean) {
  menuOpen.value = open
  document.documentElement.style.overflow = open ? 'hidden' : ''
}
watch(() => route.fullPath, () => toggleMenu(false))

// (o banner contextual de seções — "Carteira · 6 seções" — vive no
//  NuSectionRail, que já aparece em todos os breakpoints; nada aqui.)

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  if (raf) cancelAnimationFrame(raf)
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <div class="nuh-wrap" :class="{ 'nuh-wrap--shrunk': shrunk }">
    <div class="nuh">
      <NuxtLink :to="isAuthenticated ? '/' : '/mercado'" class="nuh__brand" aria-label="Redentia">
        <img src="/logo-branca.svg" alt="Redentia" class="nuh__logo">
      </NuxtLink>

      <nav class="nuh__nav" data-nu-nav>
        <NuxtLink
          v-for="item in nav" :key="item.to" :to="item.to"
          class="nuh__navitem" :class="{ 'nuh__navitem--active': isActive(item.to) }"
        >{{ item.label }}</NuxtLink>
      </nav>

      <div class="nuh__right" :class="{ 'nuh__right--auth': isAuthenticated }">
        <NuxtLink to="/busca" class="nuh__search" aria-label="Buscar">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#0A0A0C" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" /></svg>
        </NuxtLink>

        <template v-if="isAuthenticated">
          <NuxtLink to="/busca" class="nuh__ai nuh__desktop-only">
            <span>Pergunte à Redentia AI</span>
          </NuxtLink>
          <span class="nuh__avatar">{{ initial }}</span>
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
      <div v-if="menuOpen" class="num">
        <div class="num__top">
          <NuxtLink :to="isAuthenticated ? '/' : '/mercado'" class="num__brand" aria-label="Redentia" @click="toggleMenu(false)">
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
          <NuxtLink
            v-for="item in nav" :key="item.to" :to="item.to"
            class="num__item" :class="{ 'num__item--active': isActive(item.to) }"
            @click="toggleMenu(false)"
          >
            <span>{{ item.label }}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="isActive(item.to) ? 'var(--nu-blue)' : '#0A0A0C'" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </NuxtLink>

        </nav>

        <div class="num__ctas">
          <template v-if="isAuthenticated">
            <NuxtLink to="/carteira" class="num__cta-outline" @click="toggleMenu(false)">Minha carteira</NuxtLink>
            <NuxtLink to="/busca" class="num__cta" @click="toggleMenu(false)">Pergunte à Redentia AI</NuxtLink>
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
.nuh__avatar {
  width: 42px; height: 42px; border-radius: 50%; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center;
  color: var(--nu-white); font-size: 14.5px; font-weight: 700;
  transition: width .28s ease, height .28s ease;
}
.nuh-wrap--shrunk .nuh__avatar { width: 36px; height: 36px; }
.nuh__burger {
  display: none; width: 42px; height: 42px; border: none; background: transparent;
  align-items: center; justify-content: center; cursor: pointer; border-radius: 50%;
}

/* ——— mobile: só busca + avatar + hambúrguer (referência do dono) ——— */
@media (max-width: 760px) {
  .nuh__nav { display: none; }
  .nuh__desktop-only { display: none; }
  .nuh__burger { display: flex; }
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

</style>
