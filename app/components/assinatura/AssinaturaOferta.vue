<script setup lang="ts">
// A oferta (31/10/2026): o preço, o teste, o botão e a letra miúda honesta.
// No mesmo dia o dono trocou o topo pelo funil de quiz: quem ainda vai
// começar vê só "Conectar carteira", que abre o AssinaturaQuiz; o preço de
// lançamento e o teste aparecem no fim dele, antes de qualquer pagamento.
// Quem está com a cobrança pendente segue vendo o botão do portal.
// Uma implementação para o /assinar e o paywall da /carteira.

const props = withDefaults(defineProps<{
  modo?: 'comecar' | 'pendente'
  /** voltou do Checkout sem assinar (?cancelado=1) */
  cancelado?: boolean
  /** no fundo azul-marinho (o topo do /assinar e do paywall) */
  escuro?: boolean
}>(), { modo: 'comecar', cancelado: false, escuro: false })

const { erro, erroPortal } = useAssinatura()
const erroVisivel = computed(() => (props.modo === 'pendente' ? erroPortal.value : erro.value))
const quiz = useQuizAssinatura()
// o que tira o medo de conectar, em três toques
const SELOS = ['Leva 1 minuto', 'Regulado pelo Banco Central', 'Só leitura']
</script>

<template>
  <div class="aof" :class="{ 'aof--escuro': escuro }">
    <p v-if="cancelado && modo === 'comecar'" class="aof__cancelado" role="status">
      Tudo bem: nada foi cobrado. Quando quiser, é só começar de novo.
    </p>

    <!-- quem vai começar: o quiz (o preço vem no fim dele) -->
    <template v-if="modo === 'comecar'">
      <div class="aof__acao">
        <button type="button" class="aof__conectar" aria-haspopup="dialog" @click="quiz.abrir('oferta')">
          Conectar carteira
          <svg class="aof__seta" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </div>
      <ul class="aof__selos">
        <li v-for="s in SELOS" :key="s">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          {{ s }}
        </li>
      </ul>
      <p v-if="erroVisivel" class="aof__erro" role="alert">{{ erroVisivel }}</p>
    </template>

    <!-- cobrança pendente: o portal da Stripe, como antes -->
    <template v-else>
      <div class="aof__acao">
        <AssinaturaBotao :modo="modo" />
      </div>
      <p v-if="erroVisivel" class="aof__erro" role="alert">{{ erroVisivel }}</p>
      <p class="aof__letra">
        O cartão é trocado no portal seguro da Stripe. Assim que a cobrança passa,
        a carteira volta na hora.
      </p>
    </template>
  </div>
</template>

<style scoped>
.aof { display: flex; flex-direction: column; align-items: flex-start; }
.aof__cancelado {
  margin: 18px 0 0; padding: 12px 16px; border-radius: var(--nu-r-chip);
  background: var(--nu-white); color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5;
  box-shadow: var(--nu-shadow-pos-nav);
}
.aof__acao { margin-top: clamp(4px, 1vw, 8px); }
.aof__erro { margin: 14px 0 0; max-width: 460px; color: var(--nu-red-text); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.aof__letra { margin: 16px 0 0; max-width: 480px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; }
.aof__conectar {
  display: inline-flex; align-items: center; justify-content: center; gap: 11px; padding: 19px 34px; min-height: 60px;
  border: none; border-radius: var(--nu-r-pill); background: var(--nu-blue); color: var(--nu-white); cursor: pointer;
  font-family: inherit; font-size: var(--nu-fs-lg); font-weight: 800;
  box-shadow: 0 18px 36px -18px var(--nu-blue-30); transition: background .2s, transform .15s;
}
.aof__conectar:hover { background: var(--nu-blue-hover); transform: translateY(-2px); }
.aof__conectar:active { transform: translateY(1px); }
.aof__conectar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }
.aof__seta { transition: transform .2s; }
.aof__conectar:hover .aof__seta { transform: translateX(3px); }
.aof__selos { list-style: none; margin: 18px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px 18px; }
.aof__selos li { display: inline-flex; align-items: center; gap: 6px; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 700; }
.aof__selos svg { color: var(--nu-green); }
.aof--escuro .aof__selos li { color: var(--nu-cream-text-70); }
.aof--escuro .aof__selos svg { color: var(--nu-green-soft); }

/* no azul-marinho: os textos em creme */
.aof--escuro .aof__letra { color: var(--nu-cream-text-55); }
.aof--escuro .aof__erro { color: var(--nu-red-soft); }
</style>
