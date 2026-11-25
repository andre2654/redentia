<script setup lang="ts">
// A ajuda depois da conexão que falhou no banco (24/11/2026): "quer que a gente
// te chame no WhatsApp para resolver?". Um clique para quem já tem celular na
// conta; quem não tem informa o número. Herda a cor do texto de quem a hospeda
// (a carteira clara e a faixa escura da CarteiraAgora).
import type { FalhaDeConexaoApi } from '~/services/carteira'
import { formatarCelular } from '~/utils/assinatura'

const props = defineProps<{
  falha: FalhaDeConexaoApi | null
  pedir: (celular?: string) => Promise<string | null>
}>()

const pedindoNumero = ref(false)
const celular = ref('')
const enviando = ref(false)
const erro = ref<string | null>(null)

const pedido = computed(() => !!props.falha?.contato_pedido)

async function chamar() {
  if (enviando.value) return
  if (!props.falha?.tem_celular && !pedindoNumero.value) {
    pedindoNumero.value = true
    return
  }
  erro.value = null
  enviando.value = true
  const codigo = await props.pedir(pedindoNumero.value ? celular.value : undefined)
  enviando.value = false
  if (codigo === 'celular_invalido') erro.value = 'Confira o número: DDD e os nove dígitos.'
  else if (codigo) erro.value = 'Não conseguimos registrar o pedido agora. Tente de novo em instantes.'
}
</script>

<template>
  <div v-if="falha" class="cac">
    <p v-if="pedido" class="cac__ok" role="status">Combinado. A gente te chama no WhatsApp para resolver isso com você.</p>
    <template v-else>
      <form v-if="pedindoNumero" class="cac__form" @submit.prevent="chamar">
        <label class="cac__rotulo" for="cac-celular">Seu WhatsApp</label>
        <input
          id="cac-celular"
          class="cac__campo"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          placeholder="(11) 98888-0000"
          :value="celular"
          @input="celular = formatarCelular(($event.target as HTMLInputElement).value)"
        >
        <button type="submit" class="cac__link" :disabled="enviando">{{ enviando ? 'Enviando…' : 'Pedir contato' }}</button>
      </form>
      <button v-else type="button" class="cac__link" :disabled="enviando" @click="chamar">
        {{ enviando ? 'Enviando…' : 'Quer que a gente te chame no WhatsApp para resolver?' }}
      </button>
      <p v-if="erro" class="cac__erro" role="alert">{{ erro }}</p>
    </template>
  </div>
</template>

<style scoped>
.cac { display: flex; flex-direction: column; gap: 8px; flex-basis: 100%; max-width: 460px; font-size: var(--nu-fs-sm); line-height: 1.5; }
.cac__link { align-self: flex-start; padding: 0; border: 0; background: none; color: inherit; font: inherit; font-weight: var(--nu-w-forte, 600); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; min-height: 32px; }
.cac__link:hover { opacity: 0.8; }
.cac__link:disabled { opacity: 0.6; cursor: default; }
.cac__link:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; border-radius: 4px; }
.cac__form { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; }
.cac__rotulo { flex-basis: 100%; font-weight: var(--nu-w-texto); }
.cac__campo { width: 180px; min-height: 40px; padding: 0 12px; border: 1px solid currentColor; border-radius: 10px; background: transparent; color: inherit; font: inherit; }
.cac__campo:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
.cac__ok, .cac__erro { margin: 0; font-weight: var(--nu-w-texto); }
</style>
