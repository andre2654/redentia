<!--
  MoleculesWalletEmptyState — empty state da /wallet quando o user nao
  tem positions nem conexoes Pluggy. Hierarquia clara:

  HERO (icone + h1 + subline)
  -> CTA primario: Conectar Open Finance (Pluggy widget)
  -> Selo de seguranca + chips de instituicoes
  -> Divider "ou"
  -> CTA secundario: Importar XLSX
  -> CTA terciario: Adicionar manualmente (link-style)

  EMITS:
    - upload-xlsx: caller deve abrir um file picker / link pro chat
    - add-manual: caller deve navegar pra /wallet/manual ou abrir modal
    - connected({ itemId }): vem do PluggyConnectButton, parent decide
      o que fazer (refresh /wallet ou navegar pra /wallet/integracoes)

  POR QUE NAO TEM SLOT PRO PLUGGY:
    O componente compoe diretamente <MoleculesPluggyConnectButton/>, ja
    que o desejo do empty state e empurrar pro Pluggy primeiro. Se o
    parent quiser variar isso, basta nao usar o WalletEmptyState — usa
    o PluggyConnectButton sozinho.
-->
<script setup lang="ts">
defineEmits<{
  /** User clicou no botao "Importar planilha". */
  'upload-xlsx': []
  /** User clicou em "Adicionar manualmente". */
  'add-manual': []
  /** Pluggy retornou com sucesso. Parent decide redirecionar/refresh. */
  'connected': [{ itemId: string }]
}>()
</script>

<template>
  <div class="empty-state">
    <!-- Hero icon (briefcase, amber, large) -->
    <div class="empty-state__icon" aria-hidden="true">
      <UIcon name="i-lucide-briefcase" class="size-9" />
    </div>

    <header class="empty-state__header">
      <span class="empty-state__eyebrow">Carteira</span>
      <h1 class="empty-state__title">
        Vamos cadastrar sua carteira
      </h1>
      <p class="empty-state__subtitle">
        Conecte direto da sua corretora pelo Open Finance ou importe uma planilha.
        A gente sincroniza tudo, calcula seu Raio-X e mantém atualizado sozinho.
      </p>
    </header>

    <!-- CTA primario: Pluggy / Open Finance -->
    <div class="empty-state__primary">
      <MoleculesPluggyConnectButton
        variant="primary"
        @connected="(payload) => $emit('connected', payload)"
      />
    </div>

    <!-- Divider "ou" -->
    <div class="empty-state__divider" role="presentation">
      <span class="empty-state__divider-line" />
      <span class="empty-state__divider-label">ou</span>
      <span class="empty-state__divider-line" />
    </div>

    <!-- CTAs secundarios -->
    <div class="empty-state__secondary">
      <button
        type="button"
        class="empty-state__btn-secondary"
        @click="$emit('upload-xlsx')"
      >
        <UIcon name="i-lucide-file-spreadsheet" class="size-4" aria-hidden="true" />
        <span>Importar planilha XLSX/CSV</span>
      </button>

      <button
        type="button"
        class="empty-state__btn-tertiary"
        @click="$emit('add-manual')"
      >
        <UIcon name="i-lucide-pencil-line" class="size-3.5" aria-hidden="true" />
        <span>Adicionar manualmente</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding: 56px 20px 64px;
  width: 100%;
  max-width: 540px;
  margin: 0 auto;
  text-align: center;
}

/* ============ HERO ICON ============ */
.empty-state__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 22px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
  margin-bottom: 6px;
  box-shadow:
    0 18px 36px -16px color-mix(in srgb, var(--brand-primary) 32%, transparent),
    inset 0 0 0 1px color-mix(in srgb, var(--brand-primary) 22%, transparent);
}

/* ============ HEADER ============ */
.empty-state__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-width: 480px;
}

.empty-state__eyebrow {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--brand-primary);
}

.empty-state__title {
  font-family: var(--brand-font);
  font-weight: 300;
  font-size: clamp(28px, 4vw, 38px);
  line-height: 1.08;
  letter-spacing: -0.025em;
  color: var(--text-heading);
  margin: 0;
}

.empty-state__subtitle {
  font-size: 15px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
  margin: 0;
  max-width: 440px;
}

/* ============ PRIMARY CTA WRAPPER ============ */
.empty-state__primary {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 380px;
  margin-top: 4px;
}

/* ============ DIVIDER "ou" ============ */
.empty-state__divider {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 320px;
  margin: 6px 0 2px;
}

.empty-state__divider-line {
  flex: 1;
  height: 1px;
  background: color-mix(in srgb, var(--brand-border) 50%, transparent);
}

.empty-state__divider-label {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

/* ============ SECONDARY CTAS ============ */
.empty-state__secondary {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 380px;
}

.empty-state__btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 14px;
  font-family: var(--brand-font);
  cursor: pointer;
  background: var(--bg-elevated, transparent);
  color: var(--brand-text);
  border: 1.5px solid color-mix(in srgb, var(--brand-border) 60%, transparent);
  transition: border-color 180ms, background-color 180ms, transform 120ms;
  letter-spacing: -0.005em;
  width: 100%;
}

.empty-state__btn-secondary:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 5%, transparent);
  transform: translateY(-1px);
}

.empty-state__btn-secondary:active {
  transform: translateY(0);
}

.empty-state__btn-tertiary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: 0;
  background: transparent;
  font-family: var(--brand-font);
  font-size: 13px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  cursor: pointer;
  transition: color 150ms;
}

.empty-state__btn-tertiary:hover {
  color: var(--brand-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: color-mix(in srgb, var(--brand-primary) 45%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .empty-state__btn-secondary {
    transition: none;
  }
  .empty-state__btn-secondary:hover,
  .empty-state__btn-secondary:active {
    transform: none;
  }
}
</style>
