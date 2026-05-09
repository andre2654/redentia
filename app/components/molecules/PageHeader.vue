<!--
  MoleculesPageHeader — header editorial padrao para pages de listagem,
  calculadoras, rankings, guias, glossario.

  PADRAO UNICO. Substitui ~30 reescritas inline divergentes (cada cluster
  tinha sua propria estetica de hero). Garante:

  - h1 sempre clamp(28-36px), font-light, color text-heading, letter-spacing -0.7px
  - Icon ou em "circle" (48px com bg tinted) ou "inline" (32px ao lado do h1)
  - Eyebrow opcional (.eyebrow class do main.css, amber primary)
  - Back-link opcional ("Todos os rankings" / "Todas as calculadoras")
  - Description com max-w-2xl pra leitura confortavel
  - Chips opcionais ("100% gratuito · Calculo instantaneo")
  - Meta opcional ("Ultima atualizacao: X")

  Brand-safe: zero hex hardcoded. Tudo via CSS vars.

  Usos minimos:

    Ranking:
      <MoleculesPageHeader
        :back-link="{ to: '/ranking', label: 'Todos os rankings' }"
        icon="i-lucide-trending-up"
        icon-style="circle"
        icon-color="positive"
        eyebrow="Ranking"
        title="Maiores Altas do Mês"
        description="As 50 ações que mais subiram nos últimos 30 dias na B3."
      />

    Calculadora:
      <MoleculesPageHeader
        :back-link="{ to: '/calculadora', label: 'Todas as calculadoras' }"
        icon="i-lucide-trending-up"
        title="Calculadora de Juros Compostos"
        description="..."
        :chips="[
          { icon: 'i-lucide-check-circle', label: '100% gratuito', color: 'positive' },
          { icon: 'i-lucide-zap', label: 'Cálculo instantâneo' },
        ]"
        :meta="`Última atualização: ${lastUpdatedText}`"
      />

    Guia:
      <MoleculesPageHeader
        icon="i-lucide-rocket"
        title="Small Caps: Guia Completo"
        description="..."
      />
-->
<template>
  <header class="page-header">
    <NuxtLink
      v-if="backLink"
      :to="backLink.to"
      class="page-header__back"
    >
      <UIcon name="i-lucide-chevron-left" class="size-3" aria-hidden="true" />
      {{ backLink.label }}
    </NuxtLink>

    <div class="page-header__row">
      <template v-if="icon">
        <div
          v-if="iconStyle === 'circle'"
          class="page-header__icon-bubble"
          :style="bubbleStyle"
        >
          <UIcon
            :name="icon"
            class="size-6"
            :style="{ color: iconCssColor }"
            aria-hidden="true"
          />
        </div>
        <UIcon
          v-else
          :name="icon"
          class="page-header__icon-inline"
          :style="{ color: iconCssColor }"
          aria-hidden="true"
        />
      </template>

      <div class="page-header__title-block">
        <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
        <h1 class="page-header__title">{{ title }}</h1>
      </div>
    </div>

    <p v-if="description" class="page-header__description">
      <slot name="description">{{ description }}</slot>
    </p>

    <ul v-if="chips && chips.length" class="page-header__chips" role="list">
      <li
        v-for="(chip, idx) in chips"
        :key="idx"
        class="page-header__chip"
      >
        <UIcon
          v-if="chip.icon"
          :name="chip.icon"
          class="size-4"
          :style="{ color: chipColor(chip.color) }"
          aria-hidden="true"
        />
        <span>{{ chip.label }}</span>
      </li>
    </ul>

    <p v-if="meta" class="page-header__meta">
      {{ meta }}
    </p>
  </header>
</template>

<script setup lang="ts">
type IconColor = 'primary' | 'positive' | 'negative' | 'secondary'

interface Chip {
  icon?: string
  label: string
  color?: IconColor
}

const props = withDefaults(
  defineProps<{
    /** Lucide icon name (ex: 'i-lucide-trending-up'). Opcional — guias longos podem omitir. */
    icon?: string
    /** Estilo do icone: 'circle' (48px com bubble tinted, padrao rankings) ou 'inline' (32px direto, padrao calculators/guias) */
    iconStyle?: 'circle' | 'inline'
    /** Cor semantica do icone. Default: 'primary' (amber) */
    iconColor?: IconColor
    /** Eyebrow UPPERCASE acima do h1 (ex: 'Ranking', 'Calculadora') */
    eyebrow?: string
    /** Titulo h1 */
    title: string
    /** Paragrafo de descricao abaixo do h1 (max-w-2xl) */
    description?: string
    /** Link de breadcrumb tipo "Todos os rankings" */
    backLink?: { to: string; label: string }
    /** Chips de feature ("100% gratuito · Calculo instantaneo") */
    chips?: Chip[]
    /** Texto pequeno extra ("Ultima atualizacao: X") */
    meta?: string
  }>(),
  {
    iconStyle: 'inline',
    iconColor: 'primary',
  }
)

const iconCssColor = computed(() => `var(--brand-${props.iconColor})`)

const bubbleStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${iconCssColor.value} 14%, transparent)`,
}))

function chipColor(color?: IconColor) {
  if (!color) return 'var(--brand-primary)'
  return `var(--brand-${color})`
}
</script>

<style scoped>
.page-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.page-header__back {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-muted, var(--brand-text-muted));
  text-decoration: none;
  transition: opacity 200ms ease-out;
  align-self: flex-start;
}
.page-header__back:hover {
  opacity: 0.8;
}

.page-header__row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-header__icon-bubble {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 8px;
  flex-shrink: 0;
}

.page-header__icon-inline {
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
}

.page-header__title-block {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

/* h1 padronizado: clamp 28-36px, font-light, letter-spacing -0.7px,
   color text-heading. Reset global ja aplica weight 300 + color, mas
   adicionamos clamp + letter-spacing especificos do hero editorial. */
.page-header__title {
  font-size: clamp(28px, 4vw, 36px);
  line-height: 1.05;
  letter-spacing: -0.018em;
  color: var(--text-heading, var(--brand-text));
  font-weight: 300;
  margin: 0;
}

.page-header__description {
  max-width: 42rem; /* ~672px = max-w-2xl */
  font-size: 1rem;
  line-height: 1.55;
  color: var(--text-body, var(--brand-text-muted));
  margin: 0;
}
@media (min-width: 768px) {
  .page-header__description {
    font-size: 1.0625rem;
  }
}

.page-header__chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-body, var(--brand-text-muted));
}

.page-header__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
.page-header__chip + .page-header__chip::before {
  content: "·";
  margin-right: 0.5rem;
  color: var(--text-muted, var(--brand-text-muted));
}

.page-header__meta {
  font-size: 0.6875rem;
  color: var(--text-muted, var(--brand-text-muted));
  margin: 0;
}
</style>
