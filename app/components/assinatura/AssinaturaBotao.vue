<script setup lang="ts">
// O botão "Começar 3 dias grátis" (31/10/2026), um só no site: no /assinar,
// no paywall da /carteira e na folha da conversa. Clique → useAssinatura
// .comecar() (login, Checkout, portal ou a própria carteira, conforme o
// estado). Enquanto o Checkout abre, o rótulo vira "Abrindo o pagamento" com
// o giro DENTRO do botão (a regra do esqueleto vale para conteúdo; ação
// mostra o andamento no próprio botão) e o clique trava.
const props = withDefaults(defineProps<{
  /** 'pendente' leva ao portal para atualizar o cartão */
  modo?: 'comecar' | 'pendente'
  tamanho?: 'grande' | 'medio'
  largo?: boolean
}>(), { modo: 'comecar', tamanho: 'grande', largo: false })

const { abrindo, abrindoPortal, comecar, gerenciar, primeiraAssinatura } = useAssinatura()
const quiz = useQuizAssinatura()

const ocupado = computed(() => (props.modo === 'pendente' ? abrindoPortal.value : abrindo.value))
const rotulo = computed(() => {
  if (props.modo === 'pendente') return ocupado.value ? 'Abrindo o portal' : 'Atualizar o pagamento'
  if (ocupado.value) return 'Abrindo o pagamento'
  // o teste é só da primeira assinatura: quem já assinou não lê promessa de dias grátis
  return primeiraAssinatura.value ? 'Começar 3 dias grátis' : 'Assinar por R$ 19,99/mês'
})

function clicar() {
  if (ocupado.value) return
  if (props.modo === 'pendente') return void gerenciar()
  // sem CPF na conta: o quiz abre no passo dos dados (desde 01/11/2026 o CPF é obrigatório)
  void comecar().then((r) => { if (r === 'dados') void quiz.abrirNosDados('botao') })
}
</script>

<template>
  <button
    type="button"
    class="abt"
    :class="[`abt--${tamanho}`, { 'abt--largo': largo, 'abt--ocupado': ocupado }]"
    :aria-busy="ocupado"
    :disabled="ocupado"
    @click="clicar"
  >
    <span v-if="ocupado" class="abt__giro" aria-hidden="true" />
    {{ rotulo }}
    <svg v-if="!ocupado" class="abt__seta" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  </button>
</template>

<style scoped>
.abt {
  display: inline-flex; align-items: center; justify-content: center; gap: 11px;
  background: var(--nu-blue); color: var(--nu-white);
  border: none; border-radius: var(--nu-r-pill); cursor: pointer; font-family: inherit; font-weight: 800;
  transition: background .2s, transform .15s, box-shadow .2s;
  box-shadow: 0 18px 36px -18px var(--nu-blue-30);
}
.abt--grande { padding: 19px 32px; font-size: var(--nu-fs-lg); min-height: 60px; }
.abt--medio { padding: 15px 26px; font-size: var(--nu-fs-md); min-height: 52px; }
.abt--largo { width: 100%; }
.abt:hover:not(:disabled) { background: var(--nu-blue-hover); transform: translateY(-2px); }
.abt:active:not(:disabled) { transform: translateY(1px); }
.abt:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }
.abt--ocupado { cursor: progress; opacity: .92; }
.abt__seta { transition: transform .2s; }
.abt:hover .abt__seta { transform: translateX(3px); }
.abt__giro {
  width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0;
  border: 2.5px solid var(--nu-white-35); border-top-color: var(--nu-white);
  animation: abt-giro .8s linear infinite;
}
@keyframes abt-giro { to { transform: rotate(360deg); } }
</style>
