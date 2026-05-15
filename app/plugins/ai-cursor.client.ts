/**
 * ai-cursor.client.ts
 *
 * Decide se a feature "ask anywhere" deve estar ativa.
 * Setea `useState('ai-cursor:enabled')` que o `<MoleculesAiCursorMount>`
 * (montado em app.vue) lê pra renderizar (ou não) o overlay global.
 *
 * Combina DOIS gates (AND):
 *   1. Capability do device:
 *      - Pointer fine (mouse/trackpad, não touch)
 *      - Suporte a hover (não touch-only)
 *      - Largura ≥ 1024px (descarta tablets em portrait)
 *   2. Preferência explícita do usuário (`interfaceStore.aiCursorEnabled`,
 *      persistida em localStorage via pinia-persistedstate). Default true
 *      mas o toggle vive em /settings.
 *
 * Reage a mudanças de matchMedia (mouse conectado/desconectado, resize)
 * E a mudanças do store (toggle no /settings) pra ligar/desligar
 * imediatamente sem reload.
 *
 * Roda APENAS no client (`.client.ts`). No SSR, `enabled` permanece
 * false e o overlay não chega a montar — overhead zero pro HTML.
 */
export default defineNuxtPlugin(() => {
  const enabled = useState<boolean>('ai-cursor:enabled', () => false)

  if (typeof window === 'undefined') return

  const store = useInterfaceStore()
  const mqHover = window.matchMedia('(hover: hover) and (pointer: fine)')
  const mqWide = window.matchMedia('(min-width: 1024px)')

  function evaluate() {
    const hasCapability = mqHover.matches && mqWide.matches
    enabled.value = hasCapability && store.aiCursorEnabled
  }

  evaluate()

  // matchMedia.addEventListener é o substituto moderno do addListener depreciado
  mqHover.addEventListener('change', evaluate)
  mqWide.addEventListener('change', evaluate)

  // Reage ao toggle do usuário em /settings sem reload
  store.$subscribe(() => evaluate())
})
