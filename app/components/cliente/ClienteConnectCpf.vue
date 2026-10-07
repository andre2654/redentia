<script setup lang="ts">
/**
 * Passo 3 — o CPF do titular, como o Open Finance pede antes de levar ao
 * banco (Pluggy: "Conecte a sua conta" com a instituição escolhida e o campo
 * CPF). Máscara 000.000.000-00, validação dos dígitos verificadores e erro
 * inline.
 *
 * O CPF NÃO SAI DO NAVEGADOR: fica num ref deste componente, não é emitido,
 * não vai em requisição nenhuma e morre quando o passo troca. Nunca pede
 * senha, agência, conta ou token: isso é do banco, no ambiente do banco.
 */
import type { Instituicao } from '~/content/instituicoes'

defineProps<{ inst: Instituicao }>()
const emit = defineEmits<{ continuar: [], trocar: [] }>()

const cpf = ref('')
const erro = ref<string | null>(null)
const completo = computed(() => cpfDigitos(cpf.value).length === 11)
const inputRef = ref<HTMLInputElement | null>(null)
const hintId = useId()
const erroId = useId()

function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  const next = mascararCpf(el.value)
  // reflete a máscara no DOM mesmo quando o valor não muda (letra digitada)
  if (el.value !== next) el.value = next
  cpf.value = next
  if (erro.value) erro.value = null
}

function enviar() {
  if (!cpfValido(cpf.value)) {
    erro.value = completo.value
      ? 'Este CPF não é válido. Confira os dígitos e tente de novo.'
      : 'Informe os 11 dígitos do CPF.'
    inputRef.value?.focus()
    return
  }
  cpf.value = ''
  emit('continuar')
}

onBeforeUnmount(() => { cpf.value = '' })
</script>

<template>
  <section class="ccc">
    <h1 data-cc-titulo tabindex="-1" class="ccc__h1">Informe o CPF do titular da conta no {{ inst.name }}</h1>

    <div class="ccc__inst">
      <ClienteInstLogo :inst="inst" :size="32" />
      <span class="ccc__inst-n">{{ inst.name }}</span>
      <button type="button" class="ccc__trocar" @click="emit('trocar')">Trocar</button>
    </div>

    <form class="ccc__form" novalidate @submit.prevent="enviar">
      <label class="ccc__campo" :class="{ 'ccc__campo--erro': erro }">
        <span class="ccc__label">CPF</span>
        <input
          ref="inputRef"
          :value="cpf"
          type="text"
          class="ccc__input"
          inputmode="numeric"
          autocomplete="off"
          placeholder="000.000.000-00"
          maxlength="14"
          name="cpf-titular"
          data-clarity-mask="true"
          :aria-invalid="erro ? 'true' : undefined"
          :aria-describedby="erro ? `${erroId} ${hintId}` : hintId"
          @input="onInput"
        >
      </label>
      <p v-if="erro" :id="erroId" class="ccc__erro" role="alert">{{ erro }}</p>
      <p :id="hintId" class="ccc__hint">O CPF não sai deste aparelho.</p>

      <footer class="ccc__foot">
        <ClienteConnectButton type="submit" :disabled="!completo">Continuar</ClienteConnectButton>
      </footer>
    </form>
  </section>
</template>

<style scoped>
.ccc { flex: 1 1 auto; display: flex; flex-direction: column; }
.ccc__h1 { margin: 0; color: var(--nu-ink); font-size: 17px; font-weight: 800; letter-spacing: -.02em; line-height: 1.3; outline: none; }

.ccc__inst {
  margin-top: 16px; display: flex; align-items: center; gap: 12px; padding: 10px 12px;
  border-radius: 12px; background: var(--nu-cream);
}
.ccc__inst-n { flex: 1 1 auto; min-width: 0; color: var(--nu-ink); font-size: 14.5px; font-weight: 700; }
.ccc__trocar {
  padding: 6px 10px; border: none; border-radius: 8px; background: none; color: var(--nu-blue);
  font-family: inherit; font-size: 13px; font-weight: 800; cursor: pointer; transition: background .2s;
}
.ccc__trocar:hover { background: var(--nu-blue-tint-2); }
.ccc__trocar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 1px; }

.ccc__form { flex: 1 1 auto; display: flex; flex-direction: column; margin-top: 20px; }
.ccc__campo {
  display: flex; flex-direction: column; gap: 6px; padding: 10px 14px 8px;
  border: 1.5px solid var(--nu-cream-line); border-radius: 12px; background: var(--nu-white);
  transition: border-color .2s;
}
.ccc__campo:focus-within { border-color: var(--nu-blue); }
.ccc__campo--erro { border-color: var(--nu-red-2); }
.ccc__label { color: var(--nu-gray); font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; }
.ccc__input {
  width: 100%; border: none; padding: 0; background: none; color: var(--nu-ink); outline: none;
  font-size: 20px; font-weight: 700; letter-spacing: .02em; font-variant-numeric: tabular-nums;
}
.ccc__input::placeholder { color: var(--nu-placeholder); font-weight: 600; }
.ccc__erro { margin: 8px 2px 0; color: var(--nu-red-2); font-size: 13px; font-weight: 700; line-height: 1.45; }
.ccc__hint { margin: 10px 2px 0; color: var(--nu-gray); font-size: 12.5px; font-weight: 500; line-height: 1.5; }
.ccc__foot { margin-top: auto; padding-top: 22px; }
</style>
