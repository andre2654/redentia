<!--
  MoleculesPluggyConnectButton — botao reutilizavel pra abrir o widget
  Pluggy Connect (Open Finance regulado pelo BC). Wrap visual em torno
  de `usePluggyWidget().openWidget()`.

  USADO EM:
    - MoleculesWalletEmptyState (CTA primario do empty state)
    - /wallet/integracoes (botao "Conectar nova conta" + reauth)
    - /wallet (banner contextual quando user tem positions sem conexao)

  COMPORTAMENTO:
    1. onClick -> usePluggyWidget().openWidget(...)
    2. onSuccess do Pluggy -> emit('connected', { itemId })
    3. onError -> showErrorNotification toast
    4. Enquanto carrega SDK ou token: spinner inline + disabled state

  VISUAL (variant primary):
    - Botao amber grande com icone link-2
    - Selo de seguranca abaixo (regulado BC + nao guardamos credencial)
    - Row de chips com instituicoes suportadas (compact=false)

  VISUAL (variant secondary):
    - Botao outline (border + brand text), mesmo padding e icone
    - Sem selo nem chips

  Por que NAO usar `brand.colors.X` em :style:
    SSR-side o brand.ts vai como literal estatico, ai no client o
    composable useBrand resolve baseado no host/tenant. Se o template
    le `brand.colors.X` no setup-time pra inline-style, pode dar flash
    de cor errada (default Redentia) antes do tenant correto chegar.
    Usar `var(--brand-X)` resolve no CSS engine do navegador, sempre
    coerente com o tenant ja injetado pelo plugins/brand.ts.
-->
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** primary = botao amber forte. secondary = outline mais discreto. */
    variant?: 'primary' | 'secondary'
    /** Texto do botao. Default "Conectar via Open Finance". */
    label?: string
    /** Render compacto: sem selo de seguranca + sem chips de instituicoes. */
    compact?: boolean
    /** itemId pra fluxo de reauth (LOGIN_ERROR / WAITING_USER_INPUT). */
    itemId?: string
  }>(),
  {
    variant: 'primary',
    label: 'Conectar via Open Finance',
    compact: false,
    itemId: undefined,
  },
)

const emit = defineEmits<{
  /** Pluggy retornou com sucesso e o item ja foi registrado no backend. */
  connected: [{ itemId: string }]
  /** O widget fechou sem sucesso (user cancelou). */
  cancelled: []
  /** Algum erro no SDK/token/widget. Toast ja foi disparado. */
  error: [unknown]
}>()

const { openWidget, isLoading } = usePluggyWidget()

// 8 instituicoes suportadas pelo Pluggy/Open Finance que mais aparecem
// em carteira de investidor PF brasileiro. Como ainda nao temos os
// SVG/PNG hospedados no nosso CDN, renderiza como chips de texto curtos
// (4 letras). Quando os assets chegarem, basta trocar pra <img>.
const INSTITUTIONS = [
  { name: 'XP', short: 'XP' },
  { name: 'BTG Pactual', short: 'BTG' },
  { name: 'Itaú', short: 'ITAU' },
  { name: 'Inter', short: 'INTER' },
  { name: 'Nubank', short: 'NU' },
  { name: 'Toro', short: 'TORO' },
  { name: 'Rico', short: 'RICO' },
  { name: 'Banco do Brasil', short: 'BB' },
] as const

async function handleClick() {
  if (isLoading.value) return

  await openWidget({
    itemId: props.itemId,
    onSuccess: ({ item }) => {
      emit('connected', { itemId: item.id })
    },
    onError: (err) => {
      // err pode ser um objeto Pluggy ou Error nativo. Pegamos a
      // mensagem mais util pra mostrar pro user; o stack vai pro
      // console pelo composable.
      const msg
        = (err as { message?: string })?.message
        || 'Tente novamente em alguns instantes.'
      showErrorNotification('Não foi possível conectar', msg)
      emit('error', err)
    },
    onClose: () => {
      emit('cancelled')
    },
  })
}
</script>

<template>
  <div class="pluggy-cta" :class="{ 'pluggy-cta--compact': compact }">
    <button
      type="button"
      class="pluggy-cta__btn"
      :class="[
        variant === 'primary' ? 'pluggy-cta__btn--primary' : 'pluggy-cta__btn--secondary',
      ]"
      :disabled="isLoading"
      @click="handleClick"
    >
      <UIcon
        v-if="isLoading"
        name="i-lucide-loader-2"
        class="size-4 motion-safe:animate-spin"
        aria-hidden="true"
      />
      <UIcon
        v-else
        name="i-lucide-link-2"
        class="size-4"
        aria-hidden="true"
      />
      <span>{{ isLoading ? 'Abrindo...' : label }}</span>
      <UIcon
        v-if="!isLoading"
        name="i-lucide-arrow-up-right"
        class="size-3.5 opacity-80"
        aria-hidden="true"
      />
    </button>

    <!-- Selo de confianca + chips de instituicoes. So aparece no modo
         nao-compacto, pra abertura full do empty state e da landing
         de integracoes. Em barras/linhas inline (banner do /wallet),
         o caller passa compact=true e fica so o botao. -->
    <template v-if="!compact">
      <p class="pluggy-cta__trust">
        <UIcon
          name="i-lucide-shield-check"
          class="size-3.5"
          aria-hidden="true"
        />
        <span>
          Suas credenciais nunca passam pela Redentia. Regulado pelo Banco Central.
        </span>
      </p>

      <ul class="pluggy-cta__institutions" aria-label="Instituições suportadas">
        <li
          v-for="inst in INSTITUTIONS"
          :key="inst.short"
          class="pluggy-cta__chip"
          :title="inst.name"
        >
          {{ inst.short }}
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped>
.pluggy-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.pluggy-cta--compact {
  display: inline-flex;
  width: auto;
  gap: 0;
}

/* ============ BUTTON ============ */
.pluggy-cta__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 22px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14.5px;
  cursor: pointer;
  font-family: var(--brand-font);
  transition: filter 180ms, transform 120ms, box-shadow 180ms, opacity 180ms,
    background-color 180ms, border-color 180ms;
  letter-spacing: -0.005em;
  white-space: nowrap;
}

.pluggy-cta--compact .pluggy-cta__btn {
  padding: 10px 16px;
  font-size: 13px;
  border-radius: 10px;
}

.pluggy-cta__btn--primary {
  border: 0;
  background: var(--brand-primary);
  color: var(--brand-background, #fff);
  box-shadow:
    0 12px 24px -10px color-mix(in srgb, var(--brand-primary) 65%, transparent),
    0 4px 10px -6px rgba(0, 0, 0, 0.1);
}

.pluggy-cta__btn--primary:hover:not(:disabled) {
  filter: brightness(0.95);
  transform: translateY(-1px);
  box-shadow:
    0 16px 30px -10px color-mix(in srgb, var(--brand-primary) 70%, transparent),
    0 6px 14px -8px rgba(0, 0, 0, 0.14);
}

.pluggy-cta__btn--primary:active:not(:disabled) {
  transform: translateY(0);
}

.pluggy-cta__btn--secondary {
  background: transparent;
  color: var(--brand-text);
  border: 1.5px solid color-mix(in srgb, var(--brand-border) 60%, transparent);
}

.pluggy-cta__btn--secondary:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 5%, transparent);
  transform: translateY(-1px);
}

.pluggy-cta__btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  filter: grayscale(0.2);
}

/* ============ TRUST LINE ============ */
.pluggy-cta__trust {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  text-align: center;
  max-width: 360px;
}

.pluggy-cta__trust svg,
.pluggy-cta__trust .iconify {
  color: var(--brand-positive, #10b981);
  flex-shrink: 0;
}

/* ============ INSTITUTION CHIPS ============ */
.pluggy-cta__institutions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pluggy-cta__chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-border) 45%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .pluggy-cta__btn {
    transition: none;
  }
  .pluggy-cta__btn:hover,
  .pluggy-cta__btn:active {
    transform: none;
  }
}
</style>
