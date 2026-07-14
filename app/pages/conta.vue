<script setup lang="ts">
// /conta — Configurações (PR1). Contrato de UX: mockups Claude Design. UMA
// página só: cabeçalho da conta (avatar + nome + email + Sair) + duas colunas —
// sidebar de ATALHOS DE SCROLL (scrollspy) à esquerda e TODAS as seções
// empilhadas à direita (direção do dono 2026-07-14: a sidebar não troca
// conteúdo, só rola até a seção). Auth OBRIGATÓRIA (mesmo padrão da /carteira):
// anônimo → /login?redirect. noindex + private/no-store (routeRules).
//
// Cada seção tem id (âncora do scrollspy) + scroll-margin-top pro header sticky.
// Hoje só Perfil é real; Notificações/Open Finance/MCP/Segurança são placeholder
// e serão trocados pelos componentes reais nos PRs 2-5.
definePageMeta({
  middleware: [
    (to) => {
      const token = useCookie<string | null>('nu:token')
      if (!token.value) {
        return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`, { replace: true })
      }
    },
  ],
})

const { initial, displayName, clearSession } = useAuthState()
const { data: me } = await useMe()

const u = computed(() => me.value?.user ?? null)
const name = computed(() => u.value?.name || displayName.value || 'Sua conta')
const email = computed(() => u.value?.email || '')

async function logout() {
  clearSession()
  await navigateTo('/')
}

usePageSeo({
  title: 'Configurações',
  description: 'Gerencie seu perfil, notificações, conexões de Open Finance e a segurança da sua conta Redentia.',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="conta">
    <header class="conta__top">
      <div class="conta__id">
        <span class="conta__avatar" aria-hidden="true">{{ initial }}</span>
        <div class="conta__idtext">
          <h1 class="conta__name">{{ name }}</h1>
          <span v-if="email" class="conta__email">{{ email }}</span>
        </div>
      </div>
      <button type="button" class="conta__logout" @click="logout">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
        Sair
      </button>
    </header>

    <div class="conta__cols">
      <ContaSidebar class="conta__nav" />

      <div class="conta__panel">
        <section id="perfil" class="conta__sec">
          <ContaPerfil />
        </section>
        <section id="notificacoes" class="conta__sec">
          <ContaNotificacoes />
        </section>
        <section id="open-finance" class="conta__sec">
          <ContaOpenFinance />
        </section>
        <section id="mcp" class="conta__sec">
          <ContaPlaceholder
            title="Redentia MCP"
            subtitle="Conecte sua carteira e as teses ao seu assistente de IA."
            note="Pergunte sobre seus investimentos direto no Claude, ChatGPT ou Cursor. Chega em breve."
          />
        </section>
        <section id="seguranca" class="conta__sec">
          <ContaSeguranca />
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.conta {
  background: var(--nu-cream);
  min-height: 100vh;
  padding: clamp(28px, 5vw, 64px) clamp(18px, 5.5vw, 80px) clamp(60px, 8vw, 110px);
  animation: nu-fade .5s ease both;
}
.conta__top { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
.conta__id { display: flex; align-items: center; gap: clamp(16px, 2vw, 24px); min-width: 0; }
.conta__avatar {
  flex-shrink: 0; width: clamp(56px, 7vw, 76px); height: clamp(56px, 7vw, 76px);
  border-radius: 50%; background: var(--nu-blue); color: var(--nu-white);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: clamp(24px, 3vw, 32px); font-weight: 800;
}
.conta__idtext { min-width: 0; }
.conta__name {
  margin: 0; color: var(--nu-ink);
  font-size: clamp(28px, 4vw, 46px); font-weight: 800; letter-spacing: -.03em; line-height: 1.05;
}
.conta__email { color: var(--nu-gray-2); font-size: clamp(14px, 1.5vw, 17px); font-weight: 500; }
.conta__logout {
  flex-shrink: 0; display: inline-flex; align-items: center; gap: 9px;
  background: var(--nu-white); color: var(--nu-ink); border: none; cursor: pointer;
  border-radius: var(--nu-r-pill); padding: 12px 22px;
  font-family: var(--nu-font); font-size: 15px; font-weight: 800; transition: background .18s;
}
.conta__logout:hover { background: var(--nu-cream-hover); }

.conta__cols { display: flex; gap: clamp(20px, 3vw, 40px); align-items: flex-start; margin-top: clamp(28px, 4vw, 48px); }
.conta__nav { flex: 0 0 clamp(210px, 22vw, 264px); position: sticky; top: 96px; }
.conta__panel { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: clamp(18px, 2.6vw, 28px); }
/* âncora do scrollspy: compensa o header + faixa "Mercado agora" sticky */
.conta__sec { scroll-margin-top: 112px; }

@media (max-width: 860px) {
  .conta__cols { flex-direction: column; }
  .conta__nav { position: sticky; top: 84px; z-index: 2; flex-basis: auto; width: 100%; background: var(--nu-cream); padding: 8px 0; }
}
</style>
