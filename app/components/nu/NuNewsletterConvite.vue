<script setup lang="ts">
// O convite de O mercado da semana: um cartão pequeno no canto da tela (no
// celular, uma faixa fina embaixo que abre o formulário no toque). Pedido do
// dono em 21/10/2026 ("talvez até como um modal"), no formato que não repete o
// NuMcpPromo, removido em 15/10 por abrir 5 s depois da chegada e cobrir a
// calculadora:
//  - abre por interesse, nunca na chegada: depois de 12 s no site, quando a
//    pessoa rolou além de 60% da página ou, no computador, quando o mouse sai
//    pela barra de abas;
//  - não escurece a página, não trava a rolagem e não puxa o foco;
//  - só para quem não tem conta; uma vez por sessão; fechou, some por 30 dias;
//    assinou, some de vez;
//  - fica fora da preço teto, do /guias e das páginas de conta (as regras de
//    página estão em utils/newsletter-lugares.ts).
// É o banner pequeno que o Google recomenda no lugar do diálogo que cobre o
// conteúdo, e a newsletter é um dos usos que ele cita
// (developers.google.com/search/docs/appearance/avoid-intrusive-interstitials).
import { CONTA_CONVITE_VISTO } from '~/composables/useConviteDaConta'
import { NEWSLETTER_ASSINOU } from '~/composables/useNewsletter'
import { conviteForaDaPagina, convitePausado, fracaoLida } from '~/utils/newsletter-lugares'

const { isAuthenticated } = useAuthState()
// a folha de cadastro vem antes: com ela aberta, ou depois de a folha de uma
// calculadora subir nesta visita, o convite da newsletter espera a próxima
const folhaCadastro = useCadastroFolha()
const route = useRoute()
const ligada = useRuntimeConfig().public.newsletterLigada === true

/** nunca antes disso desde a chegada ao site */
const ESPERA_MS = 12_000
const FECHOU = 'nu:newsletter-convite-fechou'
const VISTO = 'nu:newsletter-convite-visto'

const aberto = ref(false)
/** no celular o convite nasce como faixa fina e abre o formulário no toque */
const expandido = ref(true)
const cardRef = ref<HTMLElement | null>(null)
let chegada = 0
let quadro = 0
let espera: ReturnType<typeof setTimeout> | undefined
let fechaDepois: ReturnType<typeof setTimeout> | undefined

function ler(chave: string, sessao = false): string | null {
  try {
    return (sessao ? sessionStorage : localStorage).getItem(chave)
  }
  catch {
    return null
  }
}
function gravar(chave: string, valor: string, sessao = false) {
  try {
    (sessao ? sessionStorage : localStorage).setItem(chave, valor)
  }
  catch { /* modo privado: vale só nesta visita */ }
}

function pode(): boolean {
  return ligada
    && !isAuthenticated.value
    && !folhaCadastro.aberta.value
    && !ler(CONTA_CONVITE_VISTO, true)
    && !conviteForaDaPagina(route.path)
    && !ler(NEWSLETTER_ASSINOU)
    && !ler(VISTO, true)
    && !convitePausado(Number(ler(FECHOU)) || null, Date.now())
}

function abrir() {
  if (aberto.value || Date.now() - chegada < ESPERA_MS || !pode()) return
  expandido.value = !window.matchMedia('(max-width: 760px)').matches
  aberto.value = true
  gravar(VISTO, '1', true)
  desligar()
}

// Rolagem de verdade além de 60% da página: em página curta, que cabe na
// tela, o convite não abre sozinho.
function medir() {
  quadro = 0
  if (aberto.value || isAuthenticated.value || window.scrollY < 200) return
  const main = document.querySelector('main')
  if (!main) return
  const r = main.getBoundingClientRect()
  if (fracaoLida(r.top, r.height, window.innerHeight) >= 0.6) abrir()
}
function aoRolar() {
  if (!quadro) quadro = requestAnimationFrame(medir)
}
// No computador, o mouse saindo pela barra de abas.
function aoSair(e: MouseEvent) {
  if (!e.relatedTarget && e.clientY <= 0) abrir()
}
function ligar() {
  window.addEventListener('scroll', aoRolar, { passive: true })
  document.documentElement.addEventListener('mouseleave', aoSair)
  // quem passou dos 60% antes dos 12 s é conferido quando a espera acaba
  espera = setTimeout(medir, ESPERA_MS)
}
function desligar() {
  window.removeEventListener('scroll', aoRolar)
  document.documentElement.removeEventListener('mouseleave', aoSair)
  clearTimeout(espera)
  cancelAnimationFrame(quadro)
  quadro = 0
}

function fechar() {
  aberto.value = false
  clearTimeout(fechaDepois)
  gravar(FECHOU, String(Date.now()))
}
function assinou() {
  // a confirmação fica uns segundos na tela e o cartão sai sozinho
  fechaDepois = setTimeout(() => {
    aberto.value = false
  }, 8000)
}
async function expandir() {
  expandido.value = true
  await nextTick()
  cardRef.value?.querySelector<HTMLInputElement>('input[type=email]')?.focus()
}

onMounted(() => {
  chegada = Date.now()
  if (ligada) ligar()
})
onBeforeUnmount(() => {
  desligar()
  clearTimeout(fechaDepois)
})
// foi para uma página de fora (login, preço teto...) com o convite aberto
watch(() => route.path, (p) => {
  if (aberto.value && conviteForaDaPagina(p)) aberto.value = false
})
</script>

<template>
  <Transition name="nnc">
    <div
      v-if="aberto" ref="cardRef" class="nnc" :class="{ 'nnc--fino': !expandido }"
      role="dialog" aria-labelledby="nnc-titulo" @keydown.esc="fechar"
    >
      <template v-if="expandido">
        <p class="nnc__eyebrow">Newsletter grátis</p>
        <h2 id="nnc-titulo" class="nnc__titulo">O mercado da semana, toda sexta.</h2>
        <p class="nnc__sub">O Ibovespa da semana, as notícias que mexeram nele e os proventos da semana que vem.</p>
        <NuNewsletterForm class="nnc__form" origem="convite" @assinou="assinou" />
      </template>
      <template v-else>
        <p id="nnc-titulo" class="nnc__fino"><strong>O mercado da semana</strong><span>Toda sexta no seu e-mail</span></p>
        <button type="button" class="nnc__abrir" @click="expandir">Assinar</button>
      </template>
      <button type="button" class="nnc__fechar" aria-label="Fechar" @click="fechar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>
  </Transition>
</template>

<style scoped>
/* abaixo dos painéis do header (60) e dos modais (9999+): o convite nunca
   fica por cima de algo que a pessoa abriu */
.nnc {
  position: fixed; right: 24px; bottom: 24px; z-index: 50;
  width: min(392px, calc(100vw - 48px));
  padding: 26px 26px 22px;
  border-radius: var(--nu-r-card);
  /* o brilho do herói dos e-mails: o convite tem a cara do e-mail que promete */
  background: var(--nu-navy) url('/email/brilho.jpg') center top / cover no-repeat;
  box-shadow: var(--nu-shadow-float);
  color: var(--nu-cream-text);
}
.nnc__eyebrow {
  margin: 0; padding-right: 40px; color: var(--nu-blue-soft);
  font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase;
}
.nnc__titulo {
  margin: 8px 0 0; padding-right: 24px; color: var(--nu-cream-text);
  font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.03em; line-height: 1.12;
}
.nnc__sub { margin: 10px 0 0; color: var(--nu-cream-text-70); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.nnc__form { margin-top: 18px; }
.nnc__fechar {
  position: absolute; top: 14px; right: 14px; flex: none;
  width: 32px; height: 32px; border-radius: 50%; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  background: var(--nu-cream-text-10); color: var(--nu-cream-text-78);
  transition: background .2s, color .2s;
}
.nnc__fechar:hover { background: var(--nu-cream-text-18); color: var(--nu-white); }
.nnc__fechar:focus-visible, .nnc__abrir:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }

/* celular: a faixa fina, com o formulário a um toque */
.nnc--fino {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 8px 8px 20px; border-radius: var(--nu-r-pill);
}
.nnc--fino .nnc__fechar { position: static; }
.nnc__fino { flex: 1; min-width: 0; margin: 0; display: flex; flex-direction: column; gap: 1px; line-height: 1.3; }
.nnc__fino strong { color: var(--nu-cream-text); font-size: var(--nu-fs-sm); font-weight: 700; }
.nnc__fino span { color: var(--nu-cream-text-70); font-size: var(--nu-fs-xs); font-weight: 500; }
.nnc__abrir {
  flex: none; background: var(--nu-blue); color: var(--nu-white); border: none;
  border-radius: var(--nu-r-pill); padding: 11px 18px;
  font-size: var(--nu-fs-sm); font-weight: 800; cursor: pointer; white-space: nowrap; transition: background .2s;
}
.nnc__abrir:hover { background: var(--nu-blue-hover); }

@media (max-width: 760px) {
  .nnc { left: 12px; right: 12px; bottom: calc(12px + env(safe-area-inset-bottom)); width: auto; padding: 22px 18px 18px; }
  .nnc--fino { padding: 8px 8px 8px 20px; }
}

.nnc-enter-active, .nnc-leave-active { transition: opacity .3s ease, transform .3s cubic-bezier(.2, .8, .2, 1); }
.nnc-enter-from, .nnc-leave-to { opacity: 0; transform: translateY(16px); }
@media (prefers-reduced-motion: reduce) {
  .nnc-enter-from, .nnc-leave-to { transform: none; }
}
</style>
