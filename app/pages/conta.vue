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

// Deep-link de seção (/conta#mcp etc., usado pelo modal do MCP e por URLs
// compartilhadas): o scrollBehavior do router não resolve aqui porque as
// seções hidratam depois do mount (a altura acima do alvo muda). Rola no
// próximo tick e re-ancora uma vez após a hidratação dos cards; scrollIntoView
// respeita o scroll-margin-top das seções (header sticky).
const route = useRoute()
function scrollToHash() {
  const id = route.hash?.slice(1)
  if (!id) return
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' }), 450)
}
onMounted(() => nextTick(scrollToHash))
watch(() => route.hash, () => nextTick(scrollToHash))

usePageSeo({
  title: 'Configurações',
  description: `Gerencie seu perfil, notificações, conexões de Open Finance e a segurança da sua conta ${MARCA.nome}.`,
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="conta">
    <header class="conta__top">
      <div class="conta__id">
        <span class="conta__avatar" aria-hidden="true">{{ initial }}</span>
        <div class="conta__idtext">
          <NuEyebrow class="conta__eyebrow">Sua conta</NuEyebrow>
          <h1 class="conta__name">{{ name }}</h1>
          <span v-if="email" class="conta__email">{{ email }}</span>
        </div>
      </div>
      <button type="button" class="conta__logout" @click="logout">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
        <span class="conta__logout-txt">Sair</span>
      </button>
    </header>

    <div class="conta__cols">
      <ContaSidebar class="conta__nav" />

      <div class="conta__panel">
        <section id="perfil" class="conta__sec">
          <ContaPerfil />
        </section>
        <section id="assinatura" class="conta__sec">
          <ContaAssinatura />
        </section>
        <section id="notificacoes" class="conta__sec">
          <ContaNotificacoes />
        </section>
        <section id="open-finance" class="conta__sec">
          <ContaOpenFinance />
        </section>
        <section id="mcp" class="conta__sec">
          <ContaMcp />
        </section>
        <section id="seguranca" class="conta__sec">
          <ContaSeguranca />
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Aportou (11/11/2026): a página no creme da marca, o eyebrow com o corte, o
   nome em 800 e o "Sair" na pílula de contorno. A estrutura é a de sempre. */
.conta {
  background: var(--nu-page);
  min-height: 100vh;
  padding: clamp(28px, 5vw, 64px) max(clamp(20px, 5.5vw, 80px), calc((100% - 1240px) / 2)) clamp(60px, 8vw, 110px);
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
.conta__eyebrow { margin-bottom: 10px; }
.conta__name {
  margin: 0; color: var(--nu-ink);
  font-size: var(--nu-fs-h2-sm); font-weight: 800; letter-spacing: -.035em; line-height: 1.02;
  overflow-wrap: anywhere;
}
.conta__email { display: block; margin-top: 6px; color: var(--nu-gray); font-size: clamp(14px, 1.5vw, 17px); font-weight: 500; overflow-wrap: anywhere; }
.conta__logout {
  flex-shrink: 0; display: inline-flex; align-items: center; gap: 9px; min-height: 48px;
  background: var(--nu-white); color: var(--nu-ink); border: none; cursor: pointer;
  box-shadow: inset 0 0 0 1.5px var(--nu-ink);
  border-radius: var(--nu-r-pill); padding: 0 22px;
  font-family: var(--nu-font); font-size: var(--nu-fs-md); font-weight: 700;
  transition: background .2s, transform .15s cubic-bezier(.2, .8, .2, 1);
}
.conta__logout:hover { background: var(--nu-row-hover); }
.conta__logout:active { transform: scale(.98); }
.conta__logout svg { transition: transform .2s; }
.conta__logout:hover svg { transform: translateX(3px); }

.conta__cols { display: flex; gap: clamp(20px, 3vw, 40px); align-items: flex-start; margin-top: clamp(28px, 4vw, 48px); }
/* o menu cola abaixo do topo + a faixa do mercado (100px), com folga */
.conta__nav { flex: 0 0 clamp(210px, 22vw, 264px); position: sticky; top: 124px; }
.conta__panel { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: clamp(18px, 2.6vw, 28px); }
/* âncora do scrollspy: compensa o header + faixa "Mercado agora" sticky */
.conta__sec { scroll-margin-top: 124px; animation: nu-fade .5s ease both; }
.conta__sec:nth-child(2) { animation-delay: 60ms; }
.conta__sec:nth-child(3) { animation-delay: 120ms; }
.conta__sec:nth-child(n+4) { animation-delay: 180ms; }

@media (max-width: 860px) {
  .conta__cols { flex-direction: column; }
  /* a faixa de atalhos vai de ponta a ponta (os cartões passavam pelos lados dela) e leva um fio embaixo */
  .conta__nav {
    position: sticky; top: 76px; z-index: 2; flex-basis: auto; align-self: stretch;
    margin: 0 calc(-1 * clamp(20px, 5.5vw, 80px)); padding: 10px clamp(20px, 5.5vw, 80px);
    background: var(--nu-page); box-shadow: 0 1.5px 0 var(--nu-line-2);
  }
  .conta__sec { scroll-margin-top: 148px; }
  /* em coluna, o align-items: flex-start deixava o painel na largura do conteúdo: um e-mail comprido
     (o "Na sua caixa · …" do resumo diário, que é nowrap) o esticava para fora da tela e cortava os interruptores */
  .conta__panel { align-self: stretch; width: 100%; }
}
/* no celular o "Sair" fica na linha do nome, só com o ícone (o rótulo segue para o leitor de tela) */
@media (max-width: 520px) {
  .conta__top { flex-wrap: nowrap; align-items: flex-start; }
  .conta__logout { width: 48px; padding: 0; justify-content: center; }
  .conta__logout-txt { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
}
@media (prefers-reduced-motion: reduce) {
  .conta__logout svg { transition: none; }
}
</style>
