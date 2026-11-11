<script setup lang="ts">
// O paywall da /carteira (31/10/2026): a tela INTEIRA de carteira é paga, e
// quem está logado sem assinatura vê isto no lugar dela — calmo, bonito e com
// um próximo passo só ("Começar 3 dias grátis"). Mesmo conteúdo do /assinar
// (AssinaturaVitrine + Beneficios), com a frase da carteira. O "Como funciona o
// teste" saiu (pedido do dono, 31/10/2026): o preço e o teste ficam no fim do quiz.
// Cobrança pendente → o botão leva ao portal (trocar o cartão), não a um
// Checkout novo.
defineProps<{ pendente?: boolean }>()
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
          Todos os bancos somados, 2.000 cenários e uma IA que responde com os seus
          números.
        </template>
      </template>
    </AssinaturaVitrine>

    <div class="apw__beneficios">
      <AssinaturaBeneficios :conectar="!pendente" />
    </div>

    <!-- as seções que prendem até conectar: cada uma termina no "Conectar carteira" (o quiz) -->
    <template v-if="!pendente">
      <AssinaturaBancos />
      <AssinaturaAntesDepois />
      <AssinaturaMcp />
      <AssinaturaPerguntas />
      <AssinaturaFecho />
    </template>
  </div>
</template>

<style scoped>
.apw__beneficios { background: var(--nu-page); padding: clamp(64px, 7vw, 100px) max(clamp(20px, 5.5vw, 80px), calc((100% - 1240px) / 2)); }
</style>
