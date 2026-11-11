<script setup lang="ts">
// O estado de uma lista de mercado que não veio (robustez, 11/11/2026): vazia
// (o filtro não tem dado) ou com erro (o servidor não respondeu). Uma frase que
// diz o que houve, a linha de apoio e o próximo passo no slot `acao` (um
// NuLinkSeta: "Tentar de novo", "Ver a lista completa"): nenhuma tela sem
// saída. Mora no lugar da tabela, no mesmo cartão branco dela.
//   <MercadoEstado tipo="erro" titulo="Dados indisponíveis agora.">
//     O conteúdo abaixo continua valendo.
//     <template #acao><NuLinkSeta @click="tentar">Tentar de novo</NuLinkSeta></template>
//   </MercadoEstado>
withDefaults(defineProps<{ tipo?: 'vazio' | 'erro'; titulo: string }>(), { tipo: 'vazio' })
</script>

<template>
  <div class="mes" :class="`mes--${tipo}`" :role="tipo === 'erro' ? 'alert' : 'status'">
    <span class="mes__icone" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false">
        <template v-if="tipo === 'erro'"><path d="M12 8v4.5" /><path d="M12 16h.01" /><circle cx="12" cy="12" r="8.5" /></template>
        <template v-else><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></template>
      </svg>
    </span>
    <p class="mes__titulo">{{ titulo }}</p>
    <p v-if="$slots.default" class="mes__texto"><slot /></p>
    <div v-if="$slots.acao" class="mes__acao"><slot name="acao" /></div>
  </div>
</template>

<style scoped>
/* o cartão branco da tabela, sem a tabela: o conteúdo no centro, com folga */
.mes {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: clamp(40px, 5vw, 56px) clamp(24px, 4vw, 40px);
  background: var(--nu-white); border-radius: var(--nu-r-card); box-shadow: var(--nu-shadow-quente);
}
.mes__icone {
  display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%;
  background: var(--nu-cream-2); color: var(--nu-ink);
}
.mes--erro .mes__icone { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
.mes__icone svg { width: 20px; height: 20px; }
.mes__titulo { margin: 16px 0 0; max-width: 44ch; color: var(--nu-ink); font-size: 17px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); line-height: 1.4; }
.mes__texto { margin: 6px 0 0; max-width: 52ch; color: var(--nu-gray); font-size: 14.5px; font-weight: var(--nu-w-texto); line-height: 1.5; }
.mes__acao { margin-top: 16px; font-size: 15px; }
</style>
