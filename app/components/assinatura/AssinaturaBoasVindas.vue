<script setup lang="ts">
// A volta do Checkout (/carteira?assinatura=ok, 31/10/2026). O webhook da
// Stripe pode chegar alguns segundos depois da pessoa, então são três fases:
//  - 'confirmando': a tela inteira, calma — "Seu teste de 3 dias começou." e o
//    brilho do "Estamos abrindo a sua carteira." enquanto o /me/entitlements é
//    relido (useAssinatura.aguardarConfirmacao);
//  - 'demorando': o webhook não chegou nas tentativas — frase honesta e
//    "Atualizar" (relê de novo);
//  - 'pronta': uma faixa curta no topo da carteira, com a data da primeira
//    cobrança, e "Entendi". Sem banco conectado ainda, a faixa aponta o último
//    passo (o Open Finance, logo embaixo), e a tela de espera mostra o passo a
//    passo da assinatura com os dois primeiros feitos (AssinaturaJornada).
import type { EntitlementsApi } from '~/types/assinatura'
import { PRECO_MENSAL, dataDaPrimeiraCobranca, dataPorExtenso } from '~/utils/assinatura'

const props = defineProps<{ fase: 'confirmando' | 'demorando' | 'pronta'; ent: EntitlementsApi | null; semCarteira?: boolean }>()
const emit = defineEmits<{ (e: 'fechar'): void; (e: 'tentar'): void }>()

const fimDoTeste = computed(() => dataPorExtenso(props.ent?.subscription?.trial_ends_at) ?? dataDaPrimeiraCobranca())
const emTeste = computed(() => (props.ent?.subscription?.status ?? 'trialing') === 'trialing')
</script>

<template>
  <section v-if="fase !== 'pronta'" class="abv" aria-live="polite">
    <NuEyebrow>Assinatura {{ MARCA.nome }}</NuEyebrow>
    <h1 class="abv__titulo">Sua assinatura <br>começou.</h1>
    <p v-if="fase === 'confirmando'" class="abv__linha abv__linha--analisando">Estamos abrindo a sua carteira.</p>
    <template v-else>
      <p class="abv__linha">
        A confirmação do cartão ainda não chegou. Costuma levar alguns segundos, e
        nada foi cobrado agora.
      </p>
      <NuBotaoSeta class="abv__tentar" variante="carvao" tamanho="m" @click="emit('tentar')">Atualizar</NuBotaoSeta>
    </template>
    <AssinaturaJornada class="abv__jornada" :passo="3" />
  </section>

  <section v-else class="abf" role="status">
    <span class="abf__check" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7" /></svg>
    </span>
    <span class="abf__texto">
      <strong>{{ emTeste ? 'Seu teste de 3 dias começou.' : 'Sua assinatura está ativa.' }}</strong>
      <span v-if="emTeste">Tudo liberado até {{ fimDoTeste }}. A primeira cobrança, de {{ PRECO_MENSAL }}, é nesse dia.</span>
      <span v-else>Tudo liberado: a carteira, os cenários e a IA.</span>
      <span v-if="semCarteira" class="abf__falta">Agora, o último passo: conecte o seu banco aqui embaixo.</span>
    </span>
    <button type="button" class="abf__ok" @click="emit('fechar')">Entendi</button>
  </section>
</template>

<style scoped>
.abv {
  background: var(--nu-page);
  min-height: clamp(520px, calc(100svh - 150px), 760px);
  padding: clamp(56px, 8vw, 112px) max(clamp(22px, 5.5vw, 80px), calc((100% - 1240px) / 2));
  display: flex; flex-direction: column; justify-content: center; align-items: flex-start;
  animation: nu-fade .5s ease both;
}
.abv__titulo { margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-hero-xl); font-weight: 800; letter-spacing: -0.04em; line-height: 0.96; }
.abv__linha { margin: clamp(16px, 2vw, 24px) 0 0; max-width: 620px; color: var(--nu-gray-2); font-size: clamp(18px, 2vw, 24px); font-weight: 500; line-height: 1.45; }
.abv__linha--analisando {
  background: linear-gradient(100deg, var(--nu-gray-2) 0%, var(--nu-gray-2) 38%, var(--nu-sand) 50%, var(--nu-gray-2) 62%, var(--nu-gray-2) 100%);
  background-size: 250% 100%;
  -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: abv-brilho 2.6s linear 8 both;
}
@keyframes abv-brilho { from { background-position: 100% 0; } to { background-position: 0% 0; } }
.abv__tentar { margin-top: 26px; }

.abf {
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
  background: var(--nu-green-bg);
  padding: 18px max(clamp(22px, 5.5vw, 80px), calc((100% - 1240px) / 2));
  animation: nu-fade .5s ease both;
}
.abf__check {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  background: var(--nu-green); color: var(--nu-white);
  display: inline-flex; align-items: center; justify-content: center;
}
.abf__texto { flex: 1; min-width: min(260px, 100%); display: flex; flex-direction: column; gap: 2px; color: var(--nu-green-text); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.45; }
.abf__texto strong { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; }
.abf__ok {
  border: none; cursor: pointer; font-family: inherit;
  background: var(--nu-white); color: var(--nu-ink);
  border-radius: var(--nu-r-pill); min-height: 44px; padding: 0 22px; font-size: 15px; font-weight: 700;
  box-shadow: inset 0 0 0 1.5px var(--nu-ink); transition: background .2s, transform .15s cubic-bezier(.2, .8, .2, 1);
}
.abf__ok:hover { background: var(--nu-row-hover); }
.abf__ok:active { transform: scale(.98); }

@media (max-width: 760px) {
  .abv__titulo br { display: none; }
}
.abv__jornada { margin-top: clamp(32px, 4vw, 48px); width: min(760px, 100%); }
.abf__falta { color: var(--nu-blue-text); font-weight: 700; }
</style>
