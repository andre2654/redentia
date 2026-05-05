<!--
  MoleculesRaioXSimulationModal — HARD GATE modal apos a pessoa gerar
  o demo do Raio-X. Bloqueia o resultado ate o cadastro.

  Por que mudou (2026-05-04):
    - Versao anterior tinha 2 CTAs (cadastro + "continuar pro demo"). 90%+
      das pessoas clicavam "continuar", viam o produto inteiro de graca e
      sumiam. CR/LPV ficava em 0.9%.
    - Novo padrao seguindo Acorns/Wealthfront/Empower: pessoa fez o quiz
      (5 perguntas + sunk cost) ou escolheu o demo, modal sobe rapido,
      cadastro vira pre-requisito pra ver o Raio-X completo.
    - Pos-cadastro, parent navega pra /wallet (com tickers do quiz/demo
      passados via sessionStorage pra montagem da carteira REAL).

  Flow:
    1) Modal abre 1.5s apos resultado renderizar (tempo do "wow" inicial)
    2) Esc/backdrop click NAO fecham (hard gate)
    3) Botao primary → /auth/register?next=/wallet&from=raiox
    4) Botao secundario "Voltar pro inicio" → emit close (parent navega
       pra /raio-x sem tickers, pra pessoa nao ficar presa)

  Compatibilidade:
    - Mantem props (open, tickers) e emits (confirm, close) com mesma
      assinatura. Parent (raio-x.vue) trata close pra resetar a URL.
-->
<script setup lang="ts">
const props = defineProps<{
  open: boolean
  /** Tickers selected by the user — shown in the modal as "N ativos" preview. */
  tickers: string[]
}>()

defineEmits<{
  /** Mantido por contrato com parent. Hard gate eterno nao usa. */
  confirm: []
  close: []
}>()

// HARD GATE: Esc nao fecha. Pessoa cadastra OU fecha a aba.
function onKeydown(_e: KeyboardEvent) {
  // No-op intencional.
}

// Body scroll lock while open.
watch(() => props.open, (next) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = next ? 'hidden' : ''
})
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="raio-x-modal">
      <div
        v-if="open"
        class="raio-x-sim"
        role="dialog"
        aria-modal="true"
        aria-labelledby="raio-x-sim-title"
        @keydown="onKeydown"
      >
        <!-- Backdrop sem onclick: hard gate nao deixa fechar por click fora.
             Mantemos o div pro overlay visual + bloqueio de scroll/click
             do conteudo por tras (z-index do dialog vence). -->
        <div class="raio-x-sim__backdrop" aria-hidden="true" />

        <div class="raio-x-sim__dialog">
          <!-- HARD GATE ABSOLUTO: sem botao de fechar, sem voltar, sem X.
               Backdrop nao clica. Esc nao fecha. Pessoa OU cadastra OU
               fecha a aba. O resultado do Raio-X fica visivel POR TRAS
               do modal, blureado, criando o efeito de "produto premium
               por tras do paywall" (mesmo padrao usado por NYT, FT,
               Stripe Atlas, etc). Reduz friccao percebida (pessoa ja
               viu o que tem) ao mesmo tempo que protege o produto
               (nao consegue interagir sem cadastrar). -->
          <header class="raio-x-sim__header">
            <div class="raio-x-sim__brand-mark">
              <UIcon name="i-lucide-radar" class="size-5" aria-hidden="true" />
            </div>
            <p class="raio-x-sim__eyebrow">SEU RAIO-X ESTÁ PRONTO</p>
            <h2 id="raio-x-sim-title" class="raio-x-sim__title">
              Crie sua conta pra ver
            </h2>
            <p class="raio-x-sim__intro">
              Análise dos {{ tickers.length }} {{ tickers.length === 1 ? 'ativo' : 'ativos' }}
              da sua carteira: Score, riscos, eventos, alocação por setor e
              acompanhamento contínuo. Tudo gratuito.
            </p>
          </header>

          <!-- Form de auth via componente compartilhado MoleculesAuthFormCard.
               Mesmo componente usado em /auth/register e /auth/login pra DRY.
               pixel-context="raio_x_gate" diferencia tracking dos outros
               surfaces no Events Manager. -->
          <div class="raio-x-sim__form-wrap">
            <MoleculesAuthFormCard
              mode="register"
              redirect-to="/wallet?from=raiox"
              pixel-context="raio_x_gate"
            />
            <p class="raio-x-sim__footer-note">
              <UIcon name="i-lucide-shield-check" class="size-3.5" aria-hidden="true" />
              Sem cartão. Sem cobrança. 100% gratuito.
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.raio-x-sim {
  position: fixed;
  inset: 0;
  z-index: 9100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  pointer-events: none;
}

@media (min-width: 768px) {
  .raio-x-sim {
    padding: 40px 24px;
  }
}

/* HARD GATE backdrop: blur forte + tint amber sutil pra dar "cara" de
   produto premium por tras do paywall. pointer-events:none garante que
   nao da pra clicar pra fechar (parent fica visivel mas inerte). */
.raio-x-sim__backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 70% at 50% 30%, color-mix(in srgb, var(--brand-primary) 12%, transparent), transparent 60%),
    color-mix(in srgb, var(--bg-base) 78%, rgba(0, 0, 0, 0.6));
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  border: 0;
  pointer-events: none;
}

.raio-x-sim__dialog {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 440px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  box-shadow:
    0 32px 80px -24px color-mix(in srgb, var(--brand-primary) 32%, transparent),
    0 16px 40px -12px rgba(0, 0, 0, 0.32);
  pointer-events: auto;
  overflow: hidden;
}

/* Header com brand mark + eyebrow + título + intro */
.raio-x-sim__header {
  padding: 28px 24px 20px;
  text-align: left;
  border-bottom: 1px solid var(--border-subtle);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--brand-primary) 5%, transparent) 0%,
    transparent 100%
  );
}

.raio-x-sim__brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-primary) 15%, transparent);
  color: var(--brand-primary);
  margin-bottom: 12px;
}

.raio-x-sim__eyebrow {
  font-family: var(--brand-font);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--brand-primary);
  margin: 0 0 6px;
}

.raio-x-sim__title {
  font-family: var(--brand-font);
  font-size: 22px;
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--text-heading);
  margin: 0 0 8px;
}

@media (min-width: 768px) {
  .raio-x-sim__title { font-size: 24px; }
}

.raio-x-sim__intro {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-body);
  margin: 0;
}

/* Wrapper do form (componente compartilhado AuthFormCard). Padding
   externo posiciona o card visualmente no modal. */
.raio-x-sim__form-wrap {
  padding: 20px 24px 24px;
}

.raio-x-sim__footer-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11px;
  line-height: 1.4;
  color: var(--text-muted);
  text-align: center;
  margin: 12px 0 0;
}

/* Transitions */
.raio-x-modal-enter-active,
.raio-x-modal-leave-active {
  transition: opacity 220ms ease;
}
.raio-x-modal-enter-active .raio-x-sim__dialog,
.raio-x-modal-leave-active .raio-x-sim__dialog {
  transition: transform 240ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
.raio-x-modal-enter-from,
.raio-x-modal-leave-to {
  opacity: 0;
}
.raio-x-modal-enter-from .raio-x-sim__dialog,
.raio-x-modal-leave-to .raio-x-sim__dialog {
  transform: translateY(20px);
}

@media (prefers-reduced-motion: reduce) {
  .raio-x-modal-enter-active,
  .raio-x-modal-leave-active,
  .raio-x-modal-enter-active .raio-x-sim__dialog,
  .raio-x-modal-leave-active .raio-x-sim__dialog {
    transition: none;
  }
}
</style>
