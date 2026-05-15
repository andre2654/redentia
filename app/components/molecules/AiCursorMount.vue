<script setup lang="ts">
/**
 * AiCursorMount
 *
 * Mount global do "ask anywhere" — instancia uma única vez em app.vue.
 * Lê `useState('ai-cursor:enabled')` setado pelo plugin client-only
 * `plugins/ai-cursor.client.ts` (false em SSR, true em desktop com mouse).
 *
 * Pula a rota `/lab/ai-cursor` pra não conflitar com a instância sandbox
 * que aquela página gerencia sozinha (com sliders/debug).
 *
 * No confirm: persiste contexto em sessionStorage e navega pro /help
 * com `?from=cursor`. A página /help vai ler e injetar como mensagem
 * inicial (próxima etapa, fora do escopo deste mount).
 */

const enabled = useState<boolean>('ai-cursor:enabled', () => false)
const route = useRoute()
const router = useRouter()

const skipRoute = computed(() => route.path.startsWith('/lab/ai-cursor'))
const active = computed(() => enabled.value && !skipRoute.value)

const cursor = useAiCursor({
  enabled: active,
  onConfirm: (ctx) => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('aiCursorCtx', JSON.stringify(ctx))
      }
      catch {
        // sessionStorage indisponível (modo privado em alguns browsers)
      }
    }
    router.push(`/help?from=cursor&ts=${Date.now()}`)
  },
})
</script>

<template>
  <AtomsAiCursorOverlay
    v-if="active"
    :visible="cursor.visible.value"
    :x="cursor.x.value"
    :y="cursor.y.value"
    :progress="cursor.progress.value"
    :phase="cursor.phase.value"
    :teaser="cursor.teaser.value"
    :breadcrumb="cursor.breadcrumb.value"
    @confirm="cursor.confirm()"
    @dismiss="cursor.dismiss()"
  />
</template>
