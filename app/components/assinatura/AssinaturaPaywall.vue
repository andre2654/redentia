<script setup lang="ts">
// O paywall da /carteira (31/10/2026): a tela INTEIRA de carteira é paga, e
// quem está logado sem assinatura vê isto no lugar dela — calmo, bonito e com
// um próximo passo só ("Começar 3 dias grátis"). Mesmo conteúdo do /assinar
// (AssinaturaVitrine + Beneficios + ComoFunciona), com a frase da carteira.
// Cobrança pendente → o botão leva ao portal (trocar o cartão), não a um
// Checkout novo.
defineProps<{ pendente?: boolean }>()
const { primeiraAssinatura } = useAssinatura()
</script>

<template>
  <div class="apw">
    <AssinaturaVitrine
      :eyebrow="pendente ? 'Pagamento pendente' : 'Sua carteira'"
      :modo="pendente ? 'pendente' : 'comecar'"
    >
      <template #titulo>
        <template v-if="pendente">A cobrança <br>não passou.</template>
        <template v-else>Sua carteira, <br>em uma frase.</template>
      </template>
      <template #dek>
        <template v-if="pendente">
          Sua carteira está pausada até o cartão ser atualizado. Atualize e ela volta
          na hora, com os cenários e a IA.
        </template>
        <template v-else>
          Abra e saiba se está tudo normal. Embaixo, o que você tem em qualquer banco,
          os 2.000 cenários dos próximos 5 anos e a IA que responde com os seus números.
        </template>
      </template>
    </AssinaturaVitrine>

    <div class="apw__beneficios">
      <AssinaturaBeneficios />
    </div>

    <AssinaturaComoFunciona v-if="!pendente && primeiraAssinatura" />
  </div>
</template>

<style scoped>
.apw__beneficios { background: var(--nu-white); padding: clamp(56px, 7.5vw, 96px) clamp(22px, 5.5vw, 80px); }
</style>
