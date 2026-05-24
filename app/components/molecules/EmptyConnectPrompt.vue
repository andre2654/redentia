<!--
  MoleculesEmptyConnectPrompt — empty state editorial das telas que dependem
  de positions reais (/wallet, /wallet/hoje, /wallet/resultado). DNA quiet v3:
  eyebrow + headline italic + lead + 2 CTAs (primario solido + secundario ghost).

  Use props pra customizar o copy por tela. Os CTAs sao fixos porque a acao
  primaria (conectar Open Finance) e secundaria (importar via chat) sao iguais
  em todas as telas que precisam de positions.

  Props:
    - eyebrow: tag do topo (ex: "/ Hoje", "Carteira vazia", "Resultado vazio")
    - title: texto principal do headline (sem o pedaco italic)
    - titleEm: pedaco italic do headline (com o ponto final tipico do brand)
    - lead: paragrafo explicando POR QUE precisa conectar
-->
<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  titleEm: string
  lead: string
}>()
</script>

<template>
  <section class="ecp">
    <div class="ecp-inner">
      <p class="calc-eyebrow">{{ eyebrow }}</p>
      <h1 class="ecp-title">
        {{ title }} <em class="calc-italic">{{ titleEm }}</em>
      </h1>
      <p class="ecp-lead">{{ lead }}</p>
      <div class="ecp-ctas">
        <NuxtLink to="/settings/integracoes" class="ecp-btn">
          <UIcon name="i-lucide-link-2" class="size-4" />
          <span>Conectar Open Finance</span>
          <UIcon name="i-lucide-arrow-right" class="size-4 ecp-btn-arrow" />
        </NuxtLink>
        <NuxtLink to="/help?intent=import-portfolio" class="ecp-btn ecp-btn--ghost">
          <UIcon name="i-lucide-message-square" class="size-4" />
          <span>Importar via chat</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ecp { max-width: 720px; margin: 0 auto; padding: 80px 24px; }
.ecp-inner { display: flex; flex-direction: column; gap: 16px; text-align: left; }

.ecp-title {
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 300;
  color: var(--text-heading);
  margin: 8px 0 0;
  letter-spacing: -0.025em;
  line-height: 1.15;
}

.ecp-lead {
  font-size: 16px;
  color: var(--text-body);
  margin: 12px 0 24px;
  line-height: 1.6;
  max-width: 56ch;
}

.ecp-ctas { display: flex; flex-wrap: wrap; gap: 12px; }

.ecp-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px 8px 14px;
  background: var(--text-heading);
  border: 1px solid var(--text-heading);
  border-radius: 999px;
  color: var(--bg-base);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.005em;
  transition: all 200ms ease-out;
}
.ecp-btn :deep(*) { color: var(--bg-base); flex-shrink: 0; transition: transform 200ms; }
.ecp-btn:hover {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
  color: var(--text-on-primary);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--brand-primary) 60%, transparent);
}
.ecp-btn:hover :deep(*) { color: var(--text-on-primary); }
.ecp-btn:hover .ecp-btn-arrow { transform: translateX(3px); }
.ecp-btn-arrow { opacity: 0.75; }
.ecp-btn:hover .ecp-btn-arrow { opacity: 1; }

.ecp-btn.ecp-btn--ghost {
  background: transparent;
  border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);
  color: var(--brand-primary);
}
.ecp-btn.ecp-btn--ghost :deep(*) { color: var(--brand-primary); }
.ecp-btn.ecp-btn--ghost:hover {
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
  border-color: var(--brand-primary);
  color: var(--brand-primary);
  box-shadow: none;
}
.ecp-btn.ecp-btn--ghost:hover :deep(*) { color: var(--brand-primary); }
</style>
