<script setup lang="ts">
/**
 * Passo 5 — "aguardando sua autorização no banco": o logo da instituição com
 * o anel girando (o pré-loader do Pluggy é um anel de .6 s linear) e um
 * pulso suave. No fluxo real a tela fica assim enquanto a pessoa autoriza no
 * pop-up do banco; no demo ela avança sozinha em alguns segundos (o selo
 * do cabeçalho já diz que é demonstração). "Já autorizei" é o atalho.
 * Região aria-live para o leitor de tela acompanhar.
 */
import type { Instituicao } from '~/content/instituicoes'

defineProps<{ inst: Instituicao }>()
const emit = defineEmits<{ autorizei: [] }>()
</script>

<template>
  <section class="cca" aria-live="polite">
    <div class="cca__orbita" aria-hidden="true">
      <span class="cca__pulso" />
      <span class="cca__anel" />
      <ClienteInstLogo :inst="inst" :size="56" />
    </div>

    <h1 data-cc-titulo tabindex="-1" class="cca__h1">Aguardando sua autorização no {{ inst.name }}…</h1>
    <p class="cca__p">
      Conclua a autorização na janela do {{ inst.name }}. Esta tela avança sozinha assim que a instituição responder.
    </p>
    <footer class="cca__foot">
      <ClienteConnectButton variant="ghost" @click="emit('autorizei')">Já autorizei</ClienteConnectButton>
    </footer>
  </section>
</template>

<style scoped>
.cca { flex: 1 1 auto; display: flex; flex-direction: column; align-items: center; text-align: center; }
.cca__orbita { position: relative; width: 104px; height: 104px; margin-top: 26px; display: flex; align-items: center; justify-content: center; }
.cca__pulso {
  position: absolute; inset: 0; border-radius: 50%; background: var(--nu-blue-tint);
  animation: cca-pulso 1.8s ease-out infinite;
}
.cca__anel {
  position: absolute; inset: 10px; border-radius: 50%;
  border: 3px solid var(--nu-cream-2); border-top-color: var(--nu-blue);
  animation: cca-gira .8s linear infinite;
}
@keyframes cca-gira { to { transform: rotate(360deg); } }
@keyframes cca-pulso { 0% { transform: scale(.8); opacity: .9; } 100% { transform: scale(1.25); opacity: 0; } }

.cca__h1 { margin: 24px 0 0; color: var(--nu-ink); font-size: 18px; font-weight: 800; letter-spacing: -.025em; line-height: 1.28; text-wrap: balance; outline: none; }
.cca__p { margin: 10px 0 0; color: var(--nu-gray-2); font-size: 13.5px; font-weight: 500; line-height: 1.5; }
.cca__foot { width: 100%; margin-top: auto; padding-top: 22px; }
</style>
