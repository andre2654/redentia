export default defineAppConfig({
  ui: {
    avatar: {
      slots: {
        root: 'rounded-[6px] bg-[#D9D9D9]',
        fallback: 'text-black',
      },
    },
    button: {
      compoundVariants: [
        {
          color: 'primary',
          variant: 'solid',
          class: {
            base: 'bg-primary text-black hover:bg-primary/75 active:bg-primary/75 disabled:bg-primary aria-disabled:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          },
        },
        {
          color: 'secondary',
          variant: 'solid',
          class: {
            base: 'bg-secondary text-black hover:bg-secondary/75 active:bg-secondary/75 disabled:bg-secondary aria-disabled:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary',
          },
        },
        {
          color: 'tertiary',
          variant: 'solid',
          class: {
            base: 'bg-tertiary text-white hover:bg-tertiary/75 active:bg-tertiary/75 disabled:bg-tertiary aria-disabled:bg-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary',
          },
        },
      ],
    },
    input: {
      slots: {
        base: 'w-full rounded border border-transparent bg-[var(--brand-input-bg)] text-white placeholder:text-gray-500 focus:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-60 transition-colors',
      },
      variants: {
        variant: {
          soft: 'text-white bg-[var(--brand-input-bg)] border border-[var(--brand-input-border)] hover:bg-[var(--brand-input-bg-hover)] focus:bg-[var(--brand-input-bg-hover)]',
          outline: 'text-white bg-[var(--brand-input-bg)] border border-[var(--brand-input-border)] hover:bg-[var(--brand-input-bg-hover)] focus:bg-[var(--brand-input-bg-hover)]',
          subtle: 'text-white bg-[var(--brand-input-bg)] ring ring-inset ring-[var(--brand-input-border)]',
          ghost: 'text-white bg-transparent border border-[var(--brand-input-border)] hover:bg-[var(--brand-input-bg-hover)] focus:bg-[var(--brand-input-bg-hover)]',
        },
      },
      defaultVariants: {
        variant: 'soft',
        color: 'neutral',
      },
    },
    textarea: {
      slots: {
        base: 'w-full rounded border border-transparent bg-[var(--brand-input-bg)] text-white placeholder:text-gray-500 focus:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-60 transition-colors',
      },
      variants: {
        variant: {
          soft: 'text-white bg-[var(--brand-input-bg)] border border-[var(--brand-input-border)] hover:bg-[var(--brand-input-bg-hover)] focus:bg-[var(--brand-input-bg-hover)]',
          outline: 'text-white bg-[var(--brand-input-bg)] border border-[var(--brand-input-border)] hover:bg-[var(--brand-input-bg-hover)] focus:bg-[var(--brand-input-bg-hover)]',
          subtle: 'text-white bg-[var(--brand-input-bg)] ring ring-inset ring-[var(--brand-input-border)]',
          ghost: 'text-white bg-transparent border border-[var(--brand-input-border)] hover:bg-[var(--brand-input-bg-hover)] focus:bg-[var(--brand-input-bg-hover)]',
        },
      },
      defaultVariants: {
        variant: 'soft',
        color: 'neutral',
      },
    },
    inputNumber: {
      slots: {
        base: 'w-full rounded border border-transparent bg-[var(--brand-input-bg)] text-white placeholder:text-gray-500 focus:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-60 transition-colors',
      },
      variants: {
        variant: {
          soft: 'text-white bg-[var(--brand-input-bg)] border border-[var(--brand-input-border)] hover:bg-[var(--brand-input-bg-hover)] focus:bg-[var(--brand-input-bg-hover)]',
          outline: 'text-white bg-[var(--brand-input-bg)] border border-[var(--brand-input-border)] hover:bg-[var(--brand-input-bg-hover)] focus:bg-[var(--brand-input-bg-hover)]',
        },
      },
      defaultVariants: {
        variant: 'soft',
        color: 'neutral',
      },
    },
    switch: {
      slots: {
        root: 'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        thumb: 'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform',
      },
      variants: {
        checked: {
          true: {
            root: 'bg-secondary',
            thumb: 'translate-x-4',
          },
          false: {
            root: 'bg-gray-600',
            thumb: 'translate-x-0',
          },
        },
      },
    },
  },
})
