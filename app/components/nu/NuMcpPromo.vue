<script setup lang="ts">
// NuMcpPromo — modal de anúncio do Redentia MCP (design do dono, foto de
// referência). Montado 1x no layout default → aparece pra TODO usuário
// (logado e anônimo) 5s depois de entrar na plataforma. Fechar (X / "Agora
// não" / Escape / clique fora) OU "Ativar agora" grava em localStorage e
// nunca mais exibe. "Ativar agora": logado → /conta (card MCP); anônimo →
// /login (com redirect pro card). Segue a base dos modais Nu (NuAmountModal):
// Teleport pro body, scrim + blur, scroll-lock, animações, SSR-safe.
const { isAuthenticated } = useAuthState()
const route = useRoute()

const STORAGE_KEY = 'redentia_mcp_promo_v1'
const DELAY_MS = 5000
const RETRY_MS = 15000

const open = ref(false)
const cardRef = ref<HTMLElement | null>(null)
useModalA11y(cardRef, open) // trap de Tab + restauração de foco
let timer: ReturnType<typeof setTimeout> | undefined

// Não atropela o usuário: adia se outro modal Nu está aberto (dia/briefing/
// aporte — 2 overlays juntos = Escape ambíguo e scrim dobrado) ou se ele está
// DENTRO do chat (/busca?chat=1). Re-tenta até a via estar livre.
function busyContext(): boolean {
  if (document.querySelector('.ndm, .nbm, .nam')) return true
  if (route.path === '/busca' && route.query.chat) return true
  return false
}

function lockScroll(on: boolean) {
  document.documentElement.style.overflow = on ? 'hidden' : ''
}

function alreadyDismissed(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
}

function markDismissed() {
  try { localStorage.setItem(STORAGE_KEY, '1') } catch { /* storage bloqueado: só não persiste */ }
}

// CAPTURE phase + stopPropagation: os outros modais Nu ouvem Escape no bubble
// do document — sem isso, um Escape fecharia o promo E outro modal junto
// (e queimaria o one-shot sem o usuário nem ler). O promo consome a tecla.
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.stopPropagation()
    close()
  }
}

// Fechar (qualquer caminho) = grava e não exibe de novo (regra do dono).
function close() {
  markDismissed()
  open.value = false
  lockScroll(false)
  document.removeEventListener('keydown', onKey, true)
}

function activate() {
  markDismissed()
  open.value = false
  lockScroll(false)
  document.removeEventListener('keydown', onKey, true)
  // /conta usa âncoras de seção (#mcp) com scrollspy — ?section= não existe.
  navigateTo(
    isAuthenticated.value
      ? '/conta#mcp'
      : `/login?redirect=${encodeURIComponent('/conta#mcp')}`,
  )
}

function tryOpen() {
  if (alreadyDismissed()) return
  if (busyContext()) {
    timer = setTimeout(tryOpen, RETRY_MS)
    return
  }
  open.value = true
  lockScroll(true)
  document.addEventListener('keydown', onKey, true)
  // foco inicial no card (padrão da casa: NuDayModal/NuBriefingModal)
  nextTick(() => cardRef.value?.focus())
}

onMounted(() => {
  if (alreadyDismissed()) return
  timer = setTimeout(tryOpen, DELAY_MS)
})

onBeforeUnmount(() => {
  clearTimeout(timer)
  if (import.meta.server) return
  document.removeEventListener('keydown', onKey, true)
  lockScroll(false)
})

const apps = [
  { name: 'Claude', logo: '/icons/logo-claude.webp' },
  { name: 'ChatGPT', logo: '/icons/logo-chatgpt.webp' },
  { name: 'Cursor', logo: '/icons/logo-cursor.webp' },
  { name: 'Raycast', logo: '/icons/logo-raycast.webp' },
]
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="mpr" @click="close">
      <div ref="cardRef" class="mpr__card" role="dialog" aria-modal="true" aria-labelledby="mpr-title" tabindex="-1" @click.stop>
        <div class="mpr__glow" aria-hidden="true" />

        <!-- topo: badge + fechar -->
        <div class="mpr__top">
          <span class="mpr__badge"><span class="mpr__badge-dot" />Novidade · Grátis</span>
          <button type="button" class="mpr__close" aria-label="Fechar" @click="close">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19" /></svg>
          </button>
        </div>

        <!-- ícone de conexão: Redentia ··· Claude -->
        <div class="mpr__conn" aria-hidden="true">
          <span class="mpr__tile mpr__tile--redentia"><img src="/logo-branca.svg" alt="" class="mpr__tile-img mpr__tile-img--r"></span>
          <span class="mpr__dots"><span /><span /><span /></span>
          <span class="mpr__tile mpr__tile--app"><img src="/icons/logo-claude.webp" alt="" class="mpr__tile-img"></span>
        </div>

        <h2 id="mpr-title" class="mpr__title">Sua carteira agora<br>fala com a sua IA</h2>
        <p class="mpr__desc">Chegou o <strong>Redentia MCP</strong>. Pergunte sobre seus investimentos direto no Claude, ChatGPT ou Cursor, e receba respostas com <strong>os seus dados reais</strong>, não genéricos.</p>

        <!-- mock de conversa (fiel à foto) -->
        <div class="mpr__chat">
          <div class="mpr__chat-head">
            <span class="mpr__chat-ava"><img src="/icons/logo-claude.webp" alt="" class="mpr__chat-ava-img"></span>
            <span class="mpr__chat-name">Claude</span>
            <span class="mpr__chat-model">Sonnet 4.5</span>
          </div>
          <div class="mpr__chat-user">Como está a minha carteira hoje?</div>
          <div class="mpr__chat-ai">
            <span class="mpr__chat-ava mpr__chat-ava--sm"><img src="/icons/logo-claude.webp" alt="" class="mpr__chat-ava-img"></span>
            <div class="mpr__chat-col">
              <span class="mpr__tool">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M8 7v13M16 7v13M4 20h16" /></svg>
                redentia · <span class="mpr__tool-fn">get_portfolio</span>
              </span>
              <p class="mpr__chat-txt">Você tem <strong>R$ 84.732</strong>, alta de <strong class="mpr__up">+0,91%</strong> hoje. O maior peso é <strong>PETR4 (18%)</strong>, que se aproxima do seu preço-teto de R$ 42.</p>
            </div>
          </div>
          <div class="mpr__chat-dots" aria-hidden="true"><span /><span /><span class="mpr__chat-dot--on" /></div>
        </div>

        <!-- apps -->
        <div class="mpr__apps">
          <span v-for="a in apps" :key="a.name" class="mpr__app">
            <span class="mpr__app-ic"><img :src="a.logo" :alt="a.name" class="mpr__app-img" width="20" height="20"></span>{{ a.name }}
          </span>
        </div>

        <!-- ações -->
        <div class="mpr__foot">
          <button type="button" class="mpr__cta" @click="activate">
            Ativar agora
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
          </button>
          <button type="button" class="mpr__later" @click="close">Agora não</button>
        </div>
        <p class="mpr__secure">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /></svg>
          100% seguro e criptografado.
        </p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.mpr {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(9, 18, 40, 0.6);
  backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px; animation: mprfade .2s ease;
}
.mpr__card {
  position: relative; overflow: hidden;
  width: min(430px, 100%); max-height: calc(100vh - 40px); overflow-y: auto;
  border-radius: 30px; padding: clamp(24px, 4vw, 32px);
  background: linear-gradient(158deg, #2451CC 0%, #2E64EA 45%, #3A73FF 100%);
  box-shadow: 0 40px 110px rgba(9, 18, 40, 0.55);
  animation: mprrise .28s cubic-bezier(.2, .8, .2, 1);
}
.mpr__glow {
  position: absolute; top: -110px; right: -90px; width: 300px; height: 300px; border-radius: 50%;
  background: radial-gradient(circle, rgba(143, 240, 181, .22) 0%, rgba(143, 240, 181, 0) 70%); pointer-events: none;
}

/* topo */
.mpr__top { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.mpr__badge {
  display: inline-flex; align-items: center; gap: 9px;
  background: rgba(255, 255, 255, .16); color: #fff;
  font-size: 12px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase;
  padding: 8px 15px; border-radius: 999px;
}
.mpr__badge-dot { width: 8px; height: 8px; border-radius: 50%; background: #46E08A; box-shadow: 0 0 0 4px rgba(70, 224, 138, .22); }
.mpr__close {
  flex-shrink: 0; width: 40px; height: 40px; border-radius: 50%; border: none;
  background: rgba(255, 255, 255, .14); color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: background .2s;
}
.mpr__close:hover { background: rgba(255, 255, 255, .26); }

/* ícone de conexão */
.mpr__conn { position: relative; display: flex; align-items: center; gap: 14px; margin-top: 22px; }
.mpr__tile {
  width: 62px; height: 62px; border-radius: 18px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.mpr__tile--redentia { background: rgba(255, 255, 255, .14); border: 1px solid rgba(255, 255, 255, .18); }
.mpr__tile--app { background: #fff; box-shadow: 0 12px 26px -8px rgba(9, 18, 40, .5); }
.mpr__tile-img { width: 34px; height: 34px; object-fit: contain; display: block; }
.mpr__tile-img--r { width: 30px; height: 30px; }
.mpr__dots { display: inline-flex; align-items: center; gap: 6px; }
.mpr__dots span { width: 6px; height: 6px; border-radius: 50%; background: rgba(255, 255, 255, .5); }

/* headline + descrição */
.mpr__title {
  position: relative; margin: 22px 0 0; color: #fff;
  font-size: clamp(30px, 6.5vw, 40px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.04;
}
.mpr__desc {
  position: relative; margin: 16px 0 0; color: rgba(245, 241, 234, .82);
  font-size: 15.5px; font-weight: 500; line-height: 1.55;
}
.mpr__desc strong { color: #fff; font-weight: 800; }

/* mock de conversa */
.mpr__chat {
  position: relative; margin-top: 22px; background: #F4F0E8; border-radius: 20px;
  padding: 16px 16px 14px;
}
.mpr__chat-head { display: flex; align-items: center; gap: 9px; padding-bottom: 12px; border-bottom: 1px solid rgba(12, 21, 36, .07); }
.mpr__chat-ava { width: 26px; height: 26px; border-radius: 8px; flex-shrink: 0; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 1px 4px rgba(12,21,36,.12); }
.mpr__chat-ava--sm { width: 26px; height: 26px; margin-top: 1px; }
.mpr__chat-ava-img { width: 100%; height: 100%; object-fit: contain; padding: 3px; display: block; }
.mpr__chat-name { color: var(--nu-ink); font-size: 14px; font-weight: 800; }
.mpr__chat-model { margin-left: auto; background: rgba(12, 21, 36, .06); color: var(--nu-gray); font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 999px; }
.mpr__chat-user {
  margin: 14px 0 0 auto; width: fit-content; max-width: 82%;
  background: #E6E1D6; color: var(--nu-ink); font-size: 14px; font-weight: 600; line-height: 1.4;
  padding: 10px 15px; border-radius: 15px 15px 4px 15px;
}
.mpr__chat-ai { display: flex; gap: 10px; margin-top: 14px; }
.mpr__chat-col { flex: 1; min-width: 0; }
.mpr__tool {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(47, 107, 255, .1); color: var(--nu-blue);
  font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
.mpr__tool-fn { font-weight: 800; }
.mpr__chat-txt { margin: 9px 0 0; color: var(--nu-ink); font-size: 14px; font-weight: 500; line-height: 1.5; }
.mpr__chat-txt strong { font-weight: 800; }
.mpr__up { color: var(--nu-green-2); }
.mpr__chat-dots { display: flex; justify-content: center; gap: 6px; margin-top: 12px; }
.mpr__chat-dots span { width: 6px; height: 6px; border-radius: 50%; background: rgba(12, 21, 36, .16); }
.mpr__chat-dot--on { background: #D97757 !important; }

/* apps */
.mpr__apps { position: relative; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 20px; }
.mpr__app {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255, 255, 255, .12); color: #fff; font-size: 13px; font-weight: 700;
  padding: 8px 13px 8px 8px; border-radius: 11px;
}
.mpr__app-ic { width: 22px; height: 22px; border-radius: 6px; background: #fff; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.mpr__app-img { width: 100%; height: 100%; object-fit: contain; padding: 3px; display: block; }

/* ações */
.mpr__foot { position: relative; display: flex; align-items: center; gap: 8px; margin-top: 24px; }
.mpr__cta {
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 9px;
  background: #fff; color: var(--nu-blue); border: none; border-radius: 999px;
  padding: 17px 26px; font-size: 16px; font-weight: 800; font-family: inherit; cursor: pointer;
  transition: transform .15s, box-shadow .2s;
}
.mpr__cta:hover { transform: translateY(-1px); box-shadow: 0 14px 30px -12px rgba(9, 18, 40, .5); }
.mpr__later {
  flex-shrink: 0; background: transparent; border: none; color: rgba(245, 241, 234, .78);
  font-size: 15px; font-weight: 800; font-family: inherit; cursor: pointer; padding: 14px 16px;
  transition: color .2s;
}
.mpr__later:hover { color: #fff; }
.mpr__secure {
  position: relative; display: flex; align-items: center; justify-content: center; gap: 7px;
  margin: 16px 0 0; color: rgba(245, 241, 234, .55); font-size: 12.5px; font-weight: 600;
}

@keyframes mprfade { from { opacity: 0; } to { opacity: 1; } }
@keyframes mprrise { from { opacity: 0; transform: translateY(18px) scale(.97); } to { opacity: 1; transform: none; } }

@media (max-width: 760px) {
  .mpr { padding: 16px; align-items: flex-end; }
  .mpr__card { width: 100%; border-radius: 26px; }
  .mpr__foot { flex-wrap: wrap-reverse; }
  .mpr__cta { flex: 1 1 100%; }
  .mpr__later { flex: 1 1 100%; padding: 12px; }
}
</style>
