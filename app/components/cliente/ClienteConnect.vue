<script setup lang="ts">
/**
 * A casca do widget de conexão do cliente final, no molde do Pluggy Connect
 * (medidas e comportamento em scratchpad pluggy-ref/NOTAS.md):
 *
 *  - desktop: cartão branco de 408 px, altura fixa (o conteúdo rola dentro),
 *    centrado sobre fundo escuro, com o bloco de logo da Redentia no canto;
 *  - mobile (≤ 500 px, o mesmo corte do SDK): tela cheia, sem raio nem sombra;
 *  - cabeçalho: voltar | "Conexão via Open Finance" | fechar;
 *  - cada passo entra com um fade curto; o foco vai para o título do passo
 *    (marcado com `data-cc-titulo`) a cada troca, e Escape fecha quando o
 *    fechar está disponível.
 *
 * Sem marca, logo ou nome do Pluggy de propósito: a marca da casa é a da
 * Redentia, e o fluxo em que o servidor gera a carteira não passa pelo Pluggy.
 *
 * Quem decide o que entra no cartão (passo, estado de link, página de gestão)
 * é a página: este componente só cuida do chrome e da acessibilidade.
 */
withDefaults(defineProps<{
  /** chave do conteúdo atual: muda → transição + foco no título */
  passo: string
  podeVoltar?: boolean
  podeFechar?: boolean
  rotulo?: string
}>(), { podeVoltar: false, podeFechar: false, rotulo: 'Conexão via Open Finance' })

const emit = defineEmits<{ voltar: [], fechar: [] }>()

const bodyRef = ref<HTMLElement | null>(null)

function focarTitulo() {
  const body = bodyRef.value
  if (!body) return
  body.scrollTo({ top: 0 })
  const t = body.querySelector<HTMLElement>('[data-cc-titulo]')
  t?.focus({ preventScroll: true })
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('fechar')
}
</script>

<template>
  <div class="cc">
    <div class="cc__marca"><NuLogoBlock to="/" /></div>

    <div class="cc__card" role="dialog" aria-modal="true" :aria-label="rotulo" @keydown="podeFechar ? onKey($event) : undefined">
      <header class="cc__head">
        <button v-if="podeVoltar" type="button" class="cc__icon" aria-label="Voltar" @click="emit('voltar')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <span v-else class="cc__icon cc__icon--vazio" aria-hidden="true" />

        <div class="cc__centro">
          <span class="cc__rotulo">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2.5" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
            {{ rotulo }}
          </span>
        </div>

        <button v-if="podeFechar" type="button" class="cc__icon" aria-label="Fechar" @click="emit('fechar')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <span v-else class="cc__icon cc__icon--vazio" aria-hidden="true" />
      </header>

      <div ref="bodyRef" class="cc__body">
        <Transition name="cc-passo" mode="out-in" @after-enter="focarTitulo">
          <div :key="passo" class="cc__passo">
            <slot />
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cc {
  position: relative; min-height: 100vh; min-height: 100dvh;
  display: flex; align-items: center; justify-content: center;
  padding: 28px clamp(22px, 5.5vw, 80px);
  /* o fundo escurecido do overlay, na cor da casa */
  background: radial-gradient(120% 100% at 78% 0%, var(--nu-orb-deep) 0%, var(--nu-orb-black) 72%);
}
.cc__marca { position: absolute; top: 0; left: 0; }

.cc__card {
  position: relative; width: 408px; max-width: 100%;
  height: min(680px, calc(100vh - 56px)); min-height: 520px;
  display: flex; flex-direction: column;
  background: var(--nu-white); border-radius: 18px; box-shadow: var(--nu-shadow-float);
  overflow: hidden; outline: none;
  animation: cc-entrar .32s cubic-bezier(.2, .8, .2, 1) both;
}
@keyframes cc-entrar { from { opacity: 0; transform: translateY(12px) scale(.985); } to { opacity: 1; transform: none; } }

.cc__head {
  flex: 0 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 12px 12px 10px; border-bottom: 1px solid var(--nu-cream-2);
}
.cc__icon {
  width: 36px; height: 36px; flex-shrink: 0; border: none; border-radius: 10px; background: transparent;
  color: var(--nu-ink); display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
  transition: background .2s;
}
.cc__icon:hover { background: var(--nu-cream); }
.cc__icon:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.cc__icon--vazio { visibility: hidden; pointer-events: none; }

.cc__centro { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 0; text-align: center; }
.cc__rotulo {
  display: inline-flex; align-items: center; gap: 6px; color: var(--nu-gray);
  font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .9px; white-space: nowrap;
}

.cc__body { flex: 1 1 auto; min-height: 0; overflow-y: auto; -webkit-overflow-scrolling: touch; }
.cc__passo { min-height: 100%; display: flex; flex-direction: column; padding: 22px 24px 24px; }

.cc-passo-enter-active { transition: opacity .22s ease, transform .22s ease; }
.cc-passo-leave-active { transition: opacity .14s ease; }
.cc-passo-enter-from { opacity: 0; transform: translateY(8px); }
.cc-passo-leave-to { opacity: 0; }

/* o mesmo corte do SDK do Pluggy: abaixo de 500 px o widget é tela cheia */
@media (max-width: 500px) {
  .cc { padding: 0; align-items: stretch; }
  .cc__marca { display: none; }
  .cc__card { width: 100%; height: 100vh; height: 100dvh; min-height: 100dvh; border-radius: 0; box-shadow: none; animation: none; }
  .cc__head { padding-top: max(12px, env(safe-area-inset-top)); }
  .cc__passo { padding: 20px 20px calc(20px + env(safe-area-inset-bottom)); }
}
</style>
