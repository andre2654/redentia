<script setup lang="ts">
// A folha da conversa (31/10/2026): a IA é paga, e quem tenta mandar uma
// mensagem sem assinatura vê esta folha em vez do envio — embaixo no celular,
// no meio da tela no computador. Um próximo passo só: "Conectar carteira", que
// leva ao /assinar e ao quiz (desde 01/11/2026 a entrada não fala de preço:
// ele aparece no fim do quiz, antes de qualquer pagamento). Quem abre é useAssinatura().gate (o useNuChat.send chama
// garantirAcesso('chat') antes de gastar IA). Acessibilidade do NuDayModal:
// useModalA11y (Tab preso + foco devolvido), Escape fecha, rolagem travada.

const { gate, fecharGate } = useAssinatura()
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
            quanto rende, o que pesa mais.
          </p>

          <NuxtLink to="/assinar" class="ags__conectar" @click="fecharGate">
            Conectar carteira
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </NuxtLink>
          <p class="ags__letra">Seis perguntas, um minuto. Só leitura, pelo Open Finance.</p>
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
.ags__fechar:focus-visible, .ags__conectar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.ags__marca {
  width: 64px; height: 64px; border-radius: 50%;
  background: var(--nu-navy); color: var(--nu-cream-text);
  display: inline-flex; align-items: center; justify-content: center;
}
.ags__miolo { fill: var(--nu-navy); }
.ags__titulo { margin: 22px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
.ags__texto { margin: 12px 0 24px; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }
.ags__letra { margin: 14px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.ags__conectar {
  display: inline-flex; align-items: center; justify-content: center; gap: 11px; width: 100%; min-height: 56px; margin-top: 8px;
  border-radius: var(--nu-r-pill); background: var(--nu-blue); color: var(--nu-white); font-size: var(--nu-fs-lg); font-weight: 800;
  transition: background .2s;
}
.ags__conectar:hover { background: var(--nu-blue-hover); color: var(--nu-white); }

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
