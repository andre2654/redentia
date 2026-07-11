<script setup lang="ts">
// Header Nu — fiel ao design (76px, quadrado azul com a marca, nav de pills,
// busca circular; deslogado = Entrar/Criar conta; logado = pill IA + avatar).
// Contrato de UX: designs/Redentia {Mercado,Home} Nu.dc.html.
const { isAuthenticated, initial } = useAuthState()
const route = useRoute()

const NAV_ANON = [
  { label: 'Mercado', to: '/mercado' },
  { label: 'Ações', to: '/acao/PETR4' },
  { label: 'Notícias', to: '/noticias' },
  { label: 'Calculadoras', to: '/calculadoras' },
]
const NAV_AUTH = [
  { label: 'Início', to: '/' },
  { label: 'Ações', to: '/acao/PETR4' },
  { label: 'Carteira', to: '/carteira' },
  { label: 'Notícias', to: '/noticias' },
  { label: 'Mercado', to: '/mercado' },
  { label: 'Calculadoras', to: '/calculadoras' },
]
const nav = computed(() => (isAuthenticated.value ? NAV_AUTH : NAV_ANON))

function isActive(to: string): boolean {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(`${to.split('/').slice(0, 2).join('/')}/`) && to !== '/'
}
</script>

<template>
  <div class="nuh-wrap">
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
          <NuxtLink to="/busca" class="nuh__ai">
            <span data-nu-pill-label>Pergunte à Redentia AI</span>
            <span style="display:none;" data-nu-show-mobile>IA</span>
          </NuxtLink>
          <span class="nuh__avatar">{{ initial }}</span>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="nuh__enter" data-nu-hide>Entrar</NuxtLink>
          <NuxtLink to="/login" class="nuh__cta">Criar conta grátis</NuxtLink>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nuh-wrap { background: var(--nu-white); }
.nuh { display: flex; align-items: center; gap: 8px; height: 76px; padding-right: 20px; }
.nuh__brand {
  width: 76px; height: 76px; flex-shrink: 0; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center;
}
.nuh__logo { width: 34px; height: 34px; display: block; object-fit: contain; }
.nuh__nav {
  display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0;
  overflow-x: auto; padding: 0 14px;
}
.nuh__navitem {
  padding: 10px 14px; color: var(--nu-ink); font-size: 16px; font-weight: 700;
  white-space: nowrap; border-radius: var(--nu-r-chip); transition: background .2s;
}
.nuh__navitem:hover { background: var(--nu-cream-hover); }
.nuh__navitem--active { color: var(--nu-blue); background: var(--nu-blue-tint); }
.nuh__navitem--active:hover { background: var(--nu-blue-tint); }
.nuh__right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.nuh__right--auth { gap: 14px; }
.nuh__search {
  width: 42px; height: 42px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; transition: background .2s;
}
.nuh__search:hover { background: var(--nu-cream-hover); }
.nuh__enter {
  display: inline-flex; align-items: center; background: transparent; color: var(--nu-blue);
  border: 2px solid var(--nu-blue); border-radius: var(--nu-r-pill); padding: 10px 22px;
  font-size: 15.5px; font-weight: 700; white-space: nowrap; transition: background .2s;
}
.nuh__enter:hover { background: var(--nu-blue-tint-2); color: var(--nu-blue); }
.nuh__cta {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 12px 22px;
  font-size: 15.5px; font-weight: 700; white-space: nowrap; transition: background .2s;
}
.nuh__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.nuh__ai {
  display: inline-flex; align-items: center; gap: 9px; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 12px 22px;
  font-size: 15.5px; font-weight: 700; white-space: nowrap; transition: background .2s;
}
.nuh__ai:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.nuh__avatar {
  width: 42px; height: 42px; border-radius: 50%; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center;
  color: var(--nu-white); font-size: 14.5px; font-weight: 700;
}
</style>
