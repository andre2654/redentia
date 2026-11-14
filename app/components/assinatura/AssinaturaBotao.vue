<script setup lang="ts">
// O botão "Começar 3 dias grátis" (31/10/2026), um só no site: no /assinar,
// no paywall da /carteira e na folha da conversa. Clique → useAssinatura
// .comecar() (login, Checkout, portal ou a própria carteira, conforme o
// estado). Enquanto o Checkout abre, o rótulo vira "Abrindo o pagamento" com
// os três pontos no círculo da seta (NuBotaoSeta, Aportou, 11/11/2026) e o
// clique trava.
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
  <NuBotaoSeta
    class="abt" :tamanho="tamanho === 'grande' ? 'g' : 'm'" :largo="largo" :loading="ocupado" @click="clicar"
  >{{ rotulo }}</NuBotaoSeta>
</template>

<style scoped>
/* a pílula é o NuBotaoSeta; aqui só o que é deste lugar: não encolhe na fila */
.abt { flex: none; }
</style>
