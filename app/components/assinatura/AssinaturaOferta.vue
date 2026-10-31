<script setup lang="ts">
// A oferta (31/10/2026): o preço, o teste, o botão e a letra miúda honesta.
// Uma implementação para o /assinar e o paywall da /carteira. A data da
// primeira cobrança é a de hoje + 3 dias (o teste da Stripe), dita por extenso.
import { DIAS_GRATIS, PRECO_MENSAL, dataDaPrimeiraCobranca } from '~/utils/assinatura'

const props = withDefaults(defineProps<{
  modo?: 'comecar' | 'pendente'
  /** voltou do Checkout sem assinar (?cancelado=1) */
  cancelado?: boolean
  /** no fundo azul-marinho (o topo do /assinar e do paywall) */
  escuro?: boolean
}>(), { modo: 'comecar', cancelado: false, escuro: false })

const { erro, erroPortal, primeiraAssinatura } = useAssinatura()
// o passo a passo embaixo do botão: deslogado está no 1 (a conta), logado no 2
const { isAuthenticated } = useAuthState()
const primeira = dataDaPrimeiraCobranca()
const erroVisivel = computed(() => (props.modo === 'pendente' ? erroPortal.value : erro.value))
</script>

<template>
  <div class="aof" :class="{ 'aof--escuro': escuro }">
    <div v-if="modo === 'comecar'" class="aof__preco">
      <span class="aof__valor">{{ PRECO_MENSAL }}</span>
      <span class="aof__mes">por mês</span>
      <span v-if="primeiraAssinatura" class="aof__selo">{{ DIAS_GRATIS }} dias grátis</span>
    </div>

    <p v-if="cancelado && modo === 'comecar'" class="aof__cancelado" role="status">
      Tudo bem: nada foi cobrado. Quando quiser, é só começar de novo.
    </p>

    <div class="aof__acao">
      <AssinaturaBotao :modo="modo" />
    </div>

    <p v-if="erroVisivel" class="aof__erro" role="alert">{{ erroVisivel }}</p>

    <AssinaturaJornada
      v-if="modo === 'comecar'" class="aof__jornada"
      :passo="isAuthenticated ? 2 : 1" :primeira-assinatura="primeiraAssinatura" compacto :escuro="escuro"
    />

    <p v-if="modo === 'comecar' && primeiraAssinatura" class="aof__letra">
      Na primeira assinatura, cadastre o cartão e não pague nada por {{ DIAS_GRATIS }}
      dias. A primeira cobrança, de {{ PRECO_MENSAL }}, é no 4º dia ({{ primeira }}).
      Cancele quando quiser, em Configurações: cancelou antes, não paga nada.
    </p>
    <p v-else-if="modo === 'comecar'" class="aof__letra">
      A cobrança de {{ PRECO_MENSAL }} é hoje, no cartão, e depois uma vez por mês.
      Cancele quando quiser, em Configurações.
    </p>
    <p v-else class="aof__letra">
      O cartão é trocado no portal seguro da Stripe. Assim que a cobrança passa,
      a carteira volta na hora.
    </p>
  </div>
</template>

<style scoped>
.aof { display: flex; flex-direction: column; align-items: flex-start; }
.aof__preco { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.aof__valor { color: var(--nu-ink); font-size: clamp(40px, 4.6vw, 56px); font-weight: 800; letter-spacing: -0.04em; font-variant-numeric: tabular-nums; line-height: 1; }
.aof__mes { color: var(--nu-gray-2); font-size: var(--nu-fs-lg); font-weight: 700; }
.aof__selo {
  align-self: center; margin-left: 4px;
  background: var(--nu-green-bg); color: var(--nu-green-2);
  border-radius: var(--nu-r-pill); padding: 7px 14px; font-size: var(--nu-fs-sm); font-weight: 800;
}
.aof__cancelado {
  margin: 18px 0 0; padding: 12px 16px; border-radius: var(--nu-r-chip);
  background: var(--nu-white); color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5;
  box-shadow: var(--nu-shadow-pos-nav);
}
.aof__acao { margin-top: clamp(22px, 3vw, 30px); }
.aof__erro { margin: 14px 0 0; max-width: 460px; color: var(--nu-red-text); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.aof__letra { margin: 16px 0 0; max-width: 480px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; }
.aof__jornada { margin-top: 18px; max-width: 560px; }

/* no azul-marinho: os textos em creme, o selo verde sobre o escuro */
.aof--escuro .aof__valor { color: var(--nu-cream-text); }
.aof--escuro .aof__mes { color: var(--nu-cream-text-70); }
.aof--escuro .aof__selo { background: color-mix(in srgb, var(--nu-green-soft) 16%, transparent); color: var(--nu-green-soft); }
.aof--escuro .aof__letra { color: var(--nu-cream-text-55); }
.aof--escuro .aof__erro { color: var(--nu-red-soft); }
</style>
