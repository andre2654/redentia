<script setup lang="ts">
// 'Continuar com o Google' — a linha custom do design + o Google Identity
// Services REAL (mesma troca id_token → POST /auth/google do Frontend
// atual, GoogleAuthBlock.vue).
//
// Como o GIS só emite id_token pelo botão oficial (iframe) e o design pede
// um list-button próprio, usamos o padrão overlay: o botão oficial é
// renderizado INVISÍVEL (opacity ~0) por cima da linha custom e esticado
// via transform pra cobrir toda a área clicável — o clique real cai no
// iframe do Google, o visual é 1:1 com o .dc.html.
//
// Degradação documentada (nunca botão morto):
//  - sem NUXT_PUBLIC_GOOGLE_CLIENT_ID no ambiente → não renderiza NADA.
//    Pra ligar: (1) setar a env com o client OAuth Web público (o mesmo que
//    o Frontend usa em runtimeConfig.public.googleClientId) e (2) autorizar
//    as origens do Nu (http://localhost:3460, alias Vercel, domínio final)
//    em "Authorized JavaScript origins" no console Google — sem a origem
//    autorizada o GIS recusa o render.
//  - SDK falhou ao carregar/renderizar → o componente se esconde sozinho.
import type { CSSProperties } from 'vue'

const props = defineProps<{
  /** trava a interação enquanto o pai troca o id_token pelo token sanctum */
  disabled?: boolean
}>()
const emit = defineEmits<{ credential: [idToken: string]; error: [message: string] }>()

const { renderButton, clientId } = useGoogleAuth()

const rowRef = ref<HTMLElement | null>(null)
const hostRef = ref<HTMLElement | null>(null)
const failed = ref(false)
const overlayStyle = ref<CSSProperties>({})
const available = computed(() => !!clientId && !failed.value)

// O GIS aceita só width fixa (máx. 400px) e altura 40px; a linha custom é
// fluida. O scale estica o iframe invisível até as bordas da linha pra não
// sobrar zona morta de clique.
const GIS_WIDTH = 400
const GIS_HEIGHT = 40
function fitOverlay() {
  const row = rowRef.value
  if (!row) return
  const r = row.getBoundingClientRect()
  overlayStyle.value = {
    transform: `scale(${r.width / GIS_WIDTH}, ${r.height / GIS_HEIGHT})`,
  }
}
let onResize: (() => void) | null = null

onMounted(async () => {
  if (!clientId || !hostRef.value) return
  fitOverlay()
  onResize = fitOverlay
  window.addEventListener('resize', onResize)
  try {
    // renderButton resolve a cada credencial completada; o loop re-renderiza
    // o botão pra permitir nova tentativa se a troca no backend falhar.
    while (true) {
      const idToken = await renderButton(hostRef.value, {
        text: 'continue_with',
        width: GIS_WIDTH,
      })
      emit('credential', idToken)
    }
  } catch (e) {
    // Script bloqueado / origem não autorizada — some em vez de botão morto.
    failed.value = true
    if (import.meta.dev) console.warn('[LoginGoogleButton] GIS indisponível:', e)
  }
})

onBeforeUnmount(() => {
  if (onResize) window.removeEventListener('resize', onResize)
})
</script>

<template>
  <div
    v-if="available"
    ref="rowRef"
    class="lgb"
    :class="{ 'lgb--busy': props.disabled }"
  >
    <!-- Camada visual (contrato do design) — a interação real é do iframe -->
    <NuListActionButton label="Continuar com o Google" tabindex="-1" aria-hidden="true">
      <template #icon>
        <!-- Logo oficial 4 cores do design; fills fixos por guideline de
             marca do Google (não são tokens do tema) -->
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.2 5.2C36.9 40.4 44 35 44 24c0-1.3-.1-2.6-.4-3.9z" />
        </svg>
      </template>
    </NuListActionButton>
    <!-- Botão oficial do GIS, invisível e esticado sobre a linha -->
    <div ref="hostRef" class="lgb__gis" :style="overlayStyle" />
  </div>
</template>

<style scoped>
.lgb { position: relative; }
.lgb--busy { pointer-events: none; }
.lgb__gis {
  position: absolute; top: 0; left: 0;
  width: 400px; height: 40px;
  transform-origin: 0 0;
  opacity: 0.001;
  overflow: hidden;
}
</style>
