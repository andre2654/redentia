<script setup lang="ts">
// A volta do Checkout (/carteira?assinatura=ok, 31/10/2026). O webhook da
// Stripe pode chegar alguns segundos depois da pessoa, então são três fases:
//  - 'confirmando': a tela inteira, calma — "Seu teste de 3 dias começou." e o
//    brilho do "Estamos abrindo a sua carteira." enquanto o /me/entitlements é
//    relido (useAssinatura.aguardarConfirmacao);
//  - 'demorando': o webhook não chegou nas tentativas — frase honesta e
//    "Atualizar" (relê de novo);
//  - 'pronta': uma faixa curta no topo da carteira, com a data da primeira
//    cobrança, e "Entendi".
import type { EntitlementsApi } from '~/types/assinatura'
import { PRECO_MENSAL, dataDaPrimeiraCobranca, dataPorExtenso } from '~/utils/assinatura'

const props = defineProps<{ fase: 'confirmando' | 'demorando' | 'pronta'; ent: EntitlementsApi | null }>()
const emit = defineEmits<{ (e: 'fechar'): void; (e: 'tentar'): void }>()

const fimDoTeste = computed(() => dataPorExtenso(props.ent?.subscription?.trial_ends_at) ?? dataDaPrimeiraCobranca())
const emTeste = computed(() => (props.ent?.subscription?.status ?? 'trialing') === 'trialing')
</script>

<template>
  <section v-if="fase !== 'pronta'" class="abv" aria-live="polite">
    <span class="abv__estado"><span class="abv__ponto" aria-hidden="true" />Assinatura Redentia</span>
    <h1 class="abv__titulo">Sua assinatura <br>começou.</h1>
    <p v-if="fase === 'confirmando'" class="abv__linha abv__linha--analisando">Estamos abrindo a sua carteira.</p>
    <template v-else>
      <p class="abv__linha">
        A confirmação do cartão ainda não chegou. Costuma levar alguns segundos, e
        nada foi cobrado agora.
      </p>
      <button type="button" class="abv__tentar" @click="emit('tentar')">Atualizar</button>
    </template>
  </section>

  <section v-else class="abf" role="status">
    <span class="abf__check" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7" /></svg>
    </span>
    <span class="abf__texto">
      <strong>{{ emTeste ? 'Seu teste de 3 dias começou.' : 'Sua assinatura está ativa.' }}</strong>
      <span v-if="emTeste">Tudo liberado até {{ fimDoTeste }}. A primeira cobrança, de {{ PRECO_MENSAL }}, é nesse dia.</span>
      <span v-else>Tudo liberado: a carteira, os cenários e a IA.</span>
    </span>
    <button type="button" class="abf__ok" @click="emit('fechar')">Entendi</button>
  </section>
</template>

<style scoped>
.abv {
  background: var(--nu-cream);
  min-height: clamp(520px, calc(100svh - 150px), 760px);
  padding: clamp(56px, 8vw, 112px) clamp(22px, 5.5vw, 80px);
  display: flex; flex-direction: column; justify-content: center; align-items: flex-start;
  animation: nu-fade .5s ease both;
}
.abv__estado { display: inline-flex; align-items: center; gap: 9px; color: var(--nu-green-text); font-size: var(--nu-fs-md); font-weight: 700; }
.abv__ponto { width: 9px; height: 9px; border-radius: 50%; background: var(--nu-green); box-shadow: 0 0 0 4px var(--nu-green-tint); }
.abv__titulo { margin: 18px 0 0; color: var(--nu-ink); font-size: clamp(52px, 8.4vw, 120px); font-weight: 800; letter-spacing: -0.05em; line-height: 0.96; }
.abv__linha { margin: clamp(16px, 2vw, 24px) 0 0; max-width: 620px; color: var(--nu-gray-2); font-size: clamp(18px, 2vw, 24px); font-weight: 500; line-height: 1.45; }
.abv__linha--analisando {
  background: linear-gradient(100deg, var(--nu-gray-2) 0%, var(--nu-gray-2) 38%, var(--nu-sand) 50%, var(--nu-gray-2) 62%, var(--nu-gray-2) 100%);
  background-size: 250% 100%;
  -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: abv-brilho 2.6s linear 8 both;
}
@keyframes abv-brilho { from { background-position: 100% 0; } to { background-position: 0% 0; } }
.abv__tentar {
  margin-top: 26px; border: none; cursor: pointer; font-family: inherit;
  background: var(--nu-ink); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 14px 26px; font-size: var(--nu-fs-md); font-weight: 700;
  transition: background .2s;
}
.abv__tentar:hover { background: var(--nu-ink-hover); }
.abv__tentar:focus-visible, .abf__ok:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

.abf {
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
  background: var(--nu-green-bg);
  padding: 18px clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.abf__check {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  background: var(--nu-green); color: var(--nu-white);
  display: inline-flex; align-items: center; justify-content: center;
}
.abf__texto { flex: 1; min-width: min(260px, 100%); display: flex; flex-direction: column; gap: 2px; color: var(--nu-green-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.45; }
.abf__texto strong { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; }
.abf__ok {
  border: none; cursor: pointer; font-family: inherit;
  background: var(--nu-white); color: var(--nu-ink);
  border-radius: var(--nu-r-pill); padding: 11px 20px; font-size: var(--nu-fs-sm); font-weight: 700;
  transition: transform .15s;
}
.abf__ok:hover { transform: translateY(-1px); }

@media (max-width: 760px) {
  .abv__titulo br { display: none; }
}
</style>
