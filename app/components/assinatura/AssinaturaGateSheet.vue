<script setup lang="ts">
// A folha da conversa (31/10/2026): a IA é paga, e quem tenta mandar uma
// mensagem sem assinatura vê esta folha em vez do envio — embaixo no celular,
// no meio da tela no computador. Um próximo passo só: "Começar 3 dias grátis"
// (o mesmo AssinaturaBotao do /assinar) e, para quem quer ler antes, o link
// para o /assinar. Quem abre é useAssinatura().gate (o useNuChat.send chama
// garantirAcesso('chat') antes de gastar IA). Acessibilidade do NuDayModal:
// useModalA11y (Tab preso + foco devolvido), Escape fecha, rolagem travada.
import { DIAS_GRATIS, PRECO_MENSAL } from '~/utils/assinatura'

const { gate, fecharGate, erro, primeiraAssinatura } = useAssinatura()
const aberta = computed(() => gate.value === 'chat')

const cardRef = ref<HTMLElement | null>(null)
useModalA11y(cardRef, aberta)
const tituloId = useId()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') fecharGate()
}
watch(aberta, (open) => {
  if (import.meta.server) return
  document.documentElement.style.overflow = open ? 'hidden' : ''
  if (open) document.addEventListener('keydown', onKey)
  else document.removeEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  if (import.meta.server) return
  document.removeEventListener('keydown', onKey)
  document.documentElement.style.overflow = ''
  fecharGate()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="ags">
      <div v-if="aberta" class="ags" @click="fecharGate">
        <div
          ref="cardRef"
          class="ags__card"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="tituloId"
          tabindex="-1"
          @click.stop
        >
          <button type="button" class="ags__fechar" aria-label="Fechar" @click="fecharGate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>

          <span class="ags__marca" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24"><path d="M12 2.5 21.5 12 12 21.5 2.5 12Z" fill="currentColor" /><path d="M12 8.2 15.8 12 12 15.8 8.2 12Z" class="ags__miolo" /></svg>
          </span>
          <h2 :id="tituloId" class="ags__titulo">A conversa é de quem assina.</h2>
          <p class="ags__texto">
            A Redentia lê a sua carteira e responde com os seus números: por que caiu,
            quanto rende, o que mudar.
            <template v-if="primeiraAssinatura">Comece com {{ DIAS_GRATIS }} dias grátis.</template>
          </p>

          <AssinaturaBotao largo />
          <p v-if="erro" class="ags__erro" role="alert">{{ erro }}</p>
          <p v-if="primeiraAssinatura" class="ags__letra">{{ DIAS_GRATIS }} dias grátis na primeira assinatura, depois {{ PRECO_MENSAL }} por mês. Cancelou nos {{ DIAS_GRATIS }} dias, não paga nada.</p>
          <p v-else class="ags__letra">{{ PRECO_MENSAL }} por mês. Cancele quando quiser, em Configurações.</p>
          <NuxtLink to="/assinar" class="ags__link" @click="fecharGate">Ver tudo o que vem na assinatura</NuxtLink>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.ags {
  position: fixed; inset: 0; z-index: 50;
  background: var(--nu-day-backdrop); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 22px;
}
.ags__card {
  position: relative; width: min(480px, 100%);
  background: var(--nu-white); border-radius: var(--nu-r-card-lg);
  padding: 40px 32px 30px; box-shadow: var(--nu-shadow-day-modal);
  display: flex; flex-direction: column; align-items: center; text-align: center;
  outline: none;
}
.ags__fechar {
  position: absolute; top: 16px; right: 16px; width: 40px; height: 40px; border-radius: 50%;
  border: none; cursor: pointer; background: var(--nu-day-close); color: var(--nu-ink);
  display: inline-flex; align-items: center; justify-content: center; transition: background .2s;
}
.ags__fechar:hover { background: var(--nu-day-close-hover); }
.ags__fechar:focus-visible, .ags__link:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.ags__marca {
  width: 64px; height: 64px; border-radius: 50%;
  background: var(--nu-navy); color: var(--nu-cream-text);
  display: inline-flex; align-items: center; justify-content: center;
}
.ags__miolo { fill: var(--nu-navy); }
.ags__titulo { margin: 22px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
.ags__texto { margin: 12px 0 24px; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }
.ags__erro { margin: 12px 0 0; color: var(--nu-red-text); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.ags__letra { margin: 14px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.ags__link { margin-top: 18px; color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 700; padding: 6px; }
.ags__link:hover { color: var(--nu-blue-hover); }

.ags-enter-active, .ags-leave-active { transition: opacity .22s ease; }
.ags-enter-active .ags__card, .ags-leave-active .ags__card { transition: transform .26s cubic-bezier(.2, .8, .2, 1); }
.ags-enter-from, .ags-leave-to { opacity: 0; }
.ags-enter-from .ags__card, .ags-leave-to .ags__card { transform: translateY(16px) scale(.98); }

/* celular: folha que sobe da borda de baixo */
@media (max-width: 760px) {
  .ags { align-items: flex-end; padding: 0; }
  .ags__card { width: 100%; border-radius: var(--nu-r-card-lg) var(--nu-r-card-lg) 0 0; padding: 36px 22px calc(24px + env(safe-area-inset-bottom)); }
  .ags-enter-from .ags__card, .ags-leave-to .ags__card { transform: translateY(100%); }
}
</style>
