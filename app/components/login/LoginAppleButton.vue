<script setup lang="ts">
// 'Continuar com a Apple' — a pílula ao lado da do Google,
// com o popup do Sign in with Apple JS no clique (useAppleAuth). Sem
// NUXT_PUBLIC_APPLE_CLIENT_ID no ambiente, não renderiza nada; quem fecha o
// popup não vê erro.
// `tom` (04/11/2026): 'preto' é o padrão (a folha de cadastro e o quiz);
// 'contorno' é o estilo "white with outline" do guia da Apple, o do /login.
import type { AppleCredencial } from '~/composables/useAppleAuth'
import { appleCancelado } from '~/composables/useAppleAuth'

const props = defineProps<{ disabled?: boolean; tom?: 'preto' | 'contorno' }>()
const emit = defineEmits<{ credential: [cred: AppleCredencial]; error: [message: string] }>()

const { entrar, clientId } = useAppleAuth()
const abrindo = ref(false)
// só no dev, para ver a tela sem o client id no ambiente: ?entrar-marcas=1
// desenha a pílula, que não faz nada no clique
const amostra = import.meta.dev && useRoute().query['entrar-marcas'] === '1'

async function clicar() {
  if (props.disabled || abrindo.value || (amostra && !clientId)) return
  abrindo.value = true
  try {
    emit('credential', await entrar())
  }
  catch (e) {
    if (!appleCancelado(e)) emit('error', 'Não foi possível entrar com a Apple. Tente novamente.')
  }
  finally {
    abrindo.value = false
  }
}
</script>

<template>
  <div v-if="clientId || amostra" class="lab" :class="{ 'lab--busy': props.disabled || abrindo, 'lab--contorno': tom === 'contorno' }">
    <!-- a pílula preta do guia da Apple: maçã e texto em branco -->
    <button type="button" class="lab__pilula" @click="clicar">
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M16.37 12.62c-.02-2.33 1.9-3.45 1.99-3.5-1.08-1.59-2.77-1.8-3.37-1.83-1.43-.15-2.8.84-3.53.84-.73 0-1.85-.82-3.04-.8-1.56.02-3.01.91-3.81 2.31-1.63 2.82-.42 6.99 1.17 9.28.78 1.12 1.7 2.38 2.91 2.33 1.17-.05 1.61-.75 3.02-.75 1.41 0 1.81.75 3.04.73 1.26-.02 2.05-1.14 2.82-2.27.89-1.3 1.25-2.56 1.27-2.62-.03-.01-2.44-.94-2.47-3.72zM14.05 5.78c.64-.78 1.08-1.86.96-2.94-.93.04-2.05.62-2.72 1.4-.6.69-1.12 1.79-.98 2.85 1.04.08 2.1-.53 2.74-1.31z" />
      </svg>
      <span>{{ abrindo ? 'Abrindo a Apple…' : 'Continuar com a Apple' }}</span>
    </button>
  </div>
</template>

<style scoped>
.lab--busy { pointer-events: none; opacity: .6; }
.lab__pilula {
  display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; min-height: 52px;
  padding: 0 20px; border: 0; border-radius: var(--nu-r-pill);
  /* preto e branco do guia da Apple, não são tokens do tema */
  background: #000000; color: #FFFFFF;
  font-family: inherit; font-size: var(--nu-fs-md); font-weight: 700; cursor: pointer; transition: background .2s;
}
.lab__pilula:hover { background: #1D1D1F; }
.lab__pilula:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }
.lab__pilula svg { margin-top: -2px; }
.lab--contorno .lab__pilula { background: #FFFFFF; color: #000000; box-shadow: inset 0 0 0 1px #000000; }
.lab--contorno .lab__pilula:hover { background: #F5F5F7; }
</style>
