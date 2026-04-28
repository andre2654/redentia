export default defineAppConfig({
  ui: {
    avatar: {
      slots: {
        root: 'rounded-[6px] bg-[var(--brand-surface-hover)]',
        fallback: 'text-[var(--brand-text-muted)]',
      },
    },
    button: {
      // QUIET defaults — radii conservadores 6px, weight 500, focus ring amber.
      // O `text-[#1A0A2E]` no primary garante contraste >= 7:1 sobre amber em
      // qualquer tenant (independe de mode). Hover usa filter brightness em vez
      // de opacity para manter saturacao da marca.
      slots: {
        base: 'rounded-[6px] font-medium transition-all duration-200 focus-visible:outline-none active:translate-y-px',
      },
      compoundVariants: [
        {
          color: 'primary',
          variant: 'solid',
          class: {
            base: 'bg-primary text-[#1A0A2E] hover:brightness-90 active:brightness-90 disabled:bg-primary disabled:opacity-50 aria-disabled:bg-primary focus-visible:shadow-[var(--shadow-ring-focus)]',
          },
        },
        {
          color: 'primary',
          variant: 'outline',
          class: {
            base: 'bg-transparent text-[var(--text-heading)] border border-[var(--border-default)] hover:border-primary hover:bg-[color-mix(in_srgb,var(--brand-primary)_6%,transparent)] focus-visible:shadow-[var(--shadow-ring-focus)]',
          },
        },
        {
          color: 'primary',
          variant: 'ghost',
          class: {
            base: 'bg-transparent text-primary hover:bg-[color-mix(in_srgb,var(--brand-primary)_8%,transparent)] focus-visible:shadow-[var(--shadow-ring-focus)]',
          },
        },
        {
          color: 'secondary',
          variant: 'solid',
          class: {
            base: 'bg-secondary text-[var(--brand-background)] hover:brightness-90 active:brightness-90 disabled:bg-secondary aria-disabled:bg-secondary focus-visible:shadow-[var(--shadow-ring-focus)]',
          },
        },
        {
          color: 'tertiary',
          variant: 'solid',
          class: {
            base: 'bg-tertiary text-[var(--brand-text)] hover:brightness-110 active:brightness-110 disabled:bg-tertiary aria-disabled:bg-tertiary focus-visible:shadow-[var(--shadow-ring-focus)]',
          },
        },
        {
          color: 'neutral',
          variant: 'outline',
          class: {
            base: 'bg-transparent text-[var(--text-heading)] border border-[var(--border-default)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-overlay)] focus-visible:shadow-[var(--shadow-ring-focus)]',
          },
        },
        {
          color: 'neutral',
          variant: 'ghost',
          class: {
            base: 'bg-transparent text-[var(--text-body)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-heading)] focus-visible:shadow-[var(--shadow-ring-focus)]',
          },
        },
      ],
    },
    input: {
      // QUIET: rounded-md (6px), border-default amber-tinted, focus traz
      // ring com tint amber em vez de outline neutro. Placeholder usa
      // text-muted (mais sutil que body).
      slots: {
        base: 'w-full rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-heading)] placeholder:text-[var(--text-muted)] transition-all duration-150 focus:outline-none focus:border-primary focus:shadow-[var(--shadow-ring-focus)] disabled:cursor-not-allowed disabled:opacity-50',
      },
      variants: {
        variant: {
          soft: 'bg-[var(--bg-input)] border border-[var(--border-default)] hover:border-[var(--border-strong)]',
          outline: 'bg-transparent border border-[var(--border-default)] hover:border-[var(--border-strong)]',
          subtle: 'bg-[var(--bg-overlay)] border border-transparent hover:border-[var(--border-subtle)]',
          ghost: 'bg-transparent border border-transparent hover:bg-[var(--bg-overlay)]',
        },
      },
      defaultVariants: {
        variant: 'soft',
        color: 'neutral',
      },
    },
    textarea: {
      // QUIET: mesmos tokens do input. Mantem coerencia formal.
      slots: {
        base: 'w-full rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-heading)] placeholder:text-[var(--text-muted)] transition-all duration-150 focus:outline-none focus:border-primary focus:shadow-[var(--shadow-ring-focus)] disabled:cursor-not-allowed disabled:opacity-50',
      },
      variants: {
        variant: {
          soft: 'bg-[var(--bg-input)] border border-[var(--border-default)] hover:border-[var(--border-strong)]',
          outline: 'bg-transparent border border-[var(--border-default)] hover:border-[var(--border-strong)]',
          subtle: 'bg-[var(--bg-overlay)] border border-transparent hover:border-[var(--border-subtle)]',
          ghost: 'bg-transparent border border-transparent hover:bg-[var(--bg-overlay)]',
        },
      },
      defaultVariants: {
        variant: 'soft',
        color: 'neutral',
      },
    },
    inputNumber: {
      // QUIET + tabular-nums automatico para qualquer numero financeiro.
      slots: {
        base: 'w-full rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-heading)] tabular-nums placeholder:text-[var(--text-muted)] transition-all duration-150 focus:outline-none focus:border-primary focus:shadow-[var(--shadow-ring-focus)] disabled:cursor-not-allowed disabled:opacity-50',
      },
      variants: {
        variant: {
          soft: 'bg-[var(--bg-input)] border border-[var(--border-default)] hover:border-[var(--border-strong)]',
          outline: 'bg-transparent border border-[var(--border-default)] hover:border-[var(--border-strong)]',
        },
      },
      defaultVariants: {
        variant: 'soft',
        color: 'neutral',
      },
    },
    card: {
      // QUIET card default — drop-in para qualquer UCard. Tokens semanticos
      // do plugin/brand.ts (light: sombra amber-tinted, dark: elevacao via
      // border + bg-elevated).
      slots: {
        root: 'bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[8px] shadow-[var(--shadow-card)] transition-all duration-200',
        header: 'p-6 border-b border-[var(--border-subtle)]',
        body: 'p-6',
        footer: 'p-6 border-t border-[var(--border-subtle)]',
      },
    },
    badge: {
      // QUIET badge — radii 4px, weight 500, letter-spacing 0.02em.
      // Cores resolvidas via color-mix do brand var.
      slots: {
        base: 'rounded-[4px] font-medium tracking-wide',
      },
    },
    switch: {
      slots: {
        root: 'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        thumb: 'pointer-events-none block h-4 w-4 rounded-full bg-[var(--brand-background)] shadow-lg ring-0 transition-transform',
      },
      variants: {
        checked: {
          true: {
            root: 'bg-secondary',
            thumb: 'translate-x-4',
          },
          false: {
            root: 'bg-[var(--brand-neutral)]',
            thumb: 'translate-x-0',
          },
        },
      },
    },
  },
})
