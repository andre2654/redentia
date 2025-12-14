export default defineAppConfig({
  ui: {
    colors: {
      primary: '#b9ecc1',
      secondary: '#a7d6ff',
      tertiary: '#042f54',
    },
    avatar: {
      slots: {
        root: 'rounded-[6px] bg-[#D9D9D9]',
        fallback: 'text-black',
      },
    },
    input: {
      slots: {
        base: 'w-full rounded border border-transparent bg-[#05070b] text-white placeholder:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 disabled:cursor-not-allowed disabled:opacity-60 transition-colors',
      },
      variants: {
        variant: {
          soft: 'text-white bg-[#05070b] border border-gray-800 hover:bg-[#070b12] focus:bg-[#070b12] focus:border-secondary/70',
          outline: 'text-white bg-[#05070b] border border-gray-800 hover:bg-[#070b12] focus:bg-[#070b12] focus:border-secondary/70',
          subtle: 'text-white bg-[#05070b] ring ring-inset ring-gray-800 focus:ring-secondary/70',
          ghost: 'text-white bg-transparent border border-gray-800 hover:bg-[#070b12] focus:bg-[#070b12] focus:border-secondary/70',
        },
      },
      defaultVariants: {
        variant: 'soft',
        color: 'neutral',
      },
    },
    inputNumber: {
      slots: {
        base: 'w-full rounded border border-transparent bg-[#05070b] text-white placeholder:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 disabled:cursor-not-allowed disabled:opacity-60 transition-colors',
      },
      variants: {
        variant: {
          soft: 'text-white bg-[#05070b] border border-gray-800 hover:bg-[#070b12] focus:bg-[#070b12] focus:border-secondary/70',
          outline: 'text-white bg-[#05070b] border border-gray-800 hover:bg-[#070b12] focus:bg-[#070b12] focus:border-secondary/70',
        },
      },
      defaultVariants: {
        variant: 'soft',
        color: 'neutral',
      },
    },
  },
})
