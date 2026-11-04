<script setup lang="ts">
// ESBOÇO 4 de 4 para o lugar dos anéis (03/11/2026, ?aneis=4 no dev): o
// placar. A ideia 4 do pedido era a linha do dia (você e o Ibovespa desde a
// abertura), mas a home não tem a série intradiária da carteira: só a do
// Ibovespa (useBolsaDoDia, o pregão minuto a minuto da B3). Sem inventar dado,
// sai um placar tipográfico: os dois números grandes lado a lado, você em rosa
// ou verde, a bolsa em branco, com a seta do sentido; embaixo, uma barra
// dividida, o cabo de guerra do dia: o corte sai do meio para o lado de quem
// foi melhor, na raiz da diferença (0,02 p.p. já empurra o corte; 2 p.p. ou
// mais leva a barra toda), e o número em p.p. fica sob o corte. O provento é a
// linha de baixo, com a moeda que acende verde (utils/placarDoDia.ts).
import { pctComSinal } from '~/utils/diaDaCarteira'
import { diferencaEmPP, pesoDaDiferenca, ppComSinal, quemNaFrente } from '~/utils/placarDoDia'

const props = withDefaults(defineProps<{
  voce: number | null
  bolsa: number | null
  provento?: boolean
  proventoSub?: string | null
  esmaecido?: boolean
  carregando?: boolean
}>(), { provento: false, proventoSub: null, esmaecido: false, carregando: false })

const tom = (v: number | null) => (v == null || Math.abs(v) < 0.005 ? 'neutro' : v < 0 ? 'queda' : 'alta')
const diferenca = computed(() => diferencaEmPP(props.voce, props.bolsa))
const frente = computed(() => quemNaFrente(props.voce, props.bolsa))
/** onde fica o corte da barra, de 0 a 100 (50 = empate; você à esquerda) */
const corte = computed(() => 50 + pesoDaDiferenca(diferenca.value) * 50)

const montado = ref(false)
onMounted(() => { requestAnimationFrame(() => { montado.value = true }) })
const visivel = computed(() => montado.value && !props.carregando)

const foco = ref<'voce' | 'bolsa' | 'provento' | null>(null)
const apagado = (c: 'voce' | 'bolsa' | 'provento') => foco.value != null && foco.value !== c

const falado = computed(() => {
  const p = (v: number | null) => (v == null ? 'sem dado' : `${v < 0 ? 'menos ' : ''}${Math.abs(v).toFixed(2).replace('.', ',')}%`)
  const q = frente.value ? `, ${frente.value.lider === 'empate' ? 'empatado com a bolsa' : `${frente.value.numero} ${frente.value.relacao}`}` : ''
  return `Você ${p(props.voce)}, bolsa ${p(props.bolsa)}${q}, ${props.provento ? 'caiu provento' : 'sem provento'}.`
})
</script>

<template>
  <figure
    class="hpl" :class="{ 'hpl--esmaecido': esmaecido, 'hpl--carregando': carregando, 'hpl--visivel': visivel }"
    @mouseleave="foco = null"
  >
    <figcaption class="hpl__sr">{{ falado }}</figcaption>

    <NuxtLink to="/carteira" class="hpl__link">
      <!-- os dois números -->
      <div class="hpl__placar">
        <div
          v-if="carregando || voce != null"
          class="hpl__lado" :class="[`hpl__lado--${tom(voce)}`, { 'hpl__lado--apagado': apagado('voce') }]"
          @mouseenter="foco = 'voce'"
        >
          <span class="hpl__quem">você</span>
          <NuSkeleton v-if="carregando" tone="navy" variant="line" width="min(220px, 100%)" height="44px" radius="chip" />
          <span v-else class="hpl__num">
            <svg v-if="tom(voce) !== 'neutro'" class="hpl__seta" viewBox="0 0 24 24" aria-hidden="true"><path :d="voce! < 0 ? 'M12 19V5M6 13l6 6 6-6' : 'M12 5v14M6 11l6-6 6 6'" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" /></svg>
            {{ pctComSinal(voce!) }}
          </span>
        </div>
        <div
          v-if="carregando || bolsa != null"
          class="hpl__lado hpl__lado--bolsa" :class="{ 'hpl__lado--apagado': apagado('bolsa'), 'hpl__lado--so': !carregando && voce == null }"
          @mouseenter="foco = 'bolsa'"
        >
          <span class="hpl__quem">bolsa</span>
          <NuSkeleton v-if="carregando" tone="navy" variant="line" width="min(220px, 100%)" height="44px" radius="chip" />
          <span v-else class="hpl__num">
            <svg v-if="tom(bolsa) !== 'neutro'" class="hpl__seta" viewBox="0 0 24 24" aria-hidden="true"><path :d="bolsa! < 0 ? 'M12 19V5M6 13l6 6 6-6' : 'M12 5v14M6 11l6-6 6 6'" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" /></svg>
            {{ pctComSinal(bolsa!) }}
          </span>
        </div>
      </div>

      <!-- a barra dividida: quem foi melhor e por quanto -->
      <div v-if="carregando || frente" class="hpl__cabo" :class="`hpl__cabo--${tom(voce)}`">
        <div class="hpl__barra">
          <span class="hpl__meio" />
          <template v-if="!carregando">
            <span class="hpl__parte hpl__parte--voce" :class="{ 'hpl__parte--apagada': apagado('voce') }" :style="{ width: `${visivel ? corte : 50}%` }" @mouseenter="foco = 'voce'" />
            <span class="hpl__parte hpl__parte--bolsa" :class="{ 'hpl__parte--apagada': apagado('bolsa') }" :style="{ width: `${visivel ? 100 - corte : 50}%` }" @mouseenter="foco = 'bolsa'" />
            <!-- o pedaço que o líder tomou do outro: do meio até o corte, aceso -->
            <span
              class="hpl__ganho" :class="`hpl__ganho--${frente?.lider ?? 'empate'}`"
              :style="{ left: `${Math.min(50, visivel ? corte : 50)}%`, width: `${Math.abs((visivel ? corte : 50) - 50)}%` }"
            />
          </template>
        </div>
        <div v-if="!carregando && frente" class="hpl__dif">
          <strong class="hpl__pp">{{ ppComSinal(diferenca!) }}</strong>
          <span class="hpl__relacao">{{ frente.lider === 'empate' ? 'empatado com a bolsa' : frente.relacao }}</span>
        </div>
        <NuSkeleton v-else-if="carregando" tone="navy" variant="line" width="160px" height="16px" radius="chip" class="hpl__esq-dif" />
      </div>
    </NuxtLink>

    <!-- o provento -->
    <NuxtLink
      to="/carteira#renda-passiva" class="hpl__provento" :class="{ 'hpl__provento--caiu': provento && !carregando, 'hpl__lado--apagado': apagado('provento') }"
      @mouseenter="foco = 'provento'"
    >
      <span class="hpl__moeda">{{ carregando ? '' : '$' }}</span>
      <NuSkeleton v-if="carregando" tone="navy" variant="line" width="150px" height="14px" radius="chip" />
      <span v-else><strong>provento</strong><template v-if="proventoSub"> · {{ proventoSub }}</template></span>
    </NuxtLink>
  </figure>
</template>

<style scoped>
.hpl { position: relative; margin: 0; width: 100%; container-type: inline-size; display: flex; flex-direction: column; gap: clamp(22px, 3vw, 34px); color: var(--nu-agora-texto); }
.hpl__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.hpl__link { display: flex; flex-direction: column; gap: clamp(22px, 3vw, 34px); color: inherit; }
.hpl__link:hover { color: inherit; }
.hpl__link:focus-visible, .hpl__provento:focus-visible { outline: 2px solid var(--nu-agora-azul); outline-offset: 4px; border-radius: var(--nu-r-chip); }

/* os dois números, lado a lado */
.hpl__placar { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; }
.hpl__lado { min-width: 0; display: flex; flex-direction: column; gap: 6px; transition: opacity .15s ease; }
.hpl__lado--bolsa { align-items: flex-end; text-align: right; color: var(--nu-agora-texto); }
.hpl__lado--so { grid-column: 1 / -1; align-items: flex-start; text-align: left; }
.hpl__lado--queda { color: var(--nu-agora-vermelho); }
.hpl__lado--alta { color: var(--nu-agora-verde); }
.hpl__lado--apagado { opacity: .32; }
.hpl__quem { font-size: var(--nu-fs-md); font-weight: 800; }
.hpl__num {
  display: inline-flex; align-items: center; gap: .12em; white-space: nowrap;
  /* no quadro estreito (375) os dois números não cabem no h2: 10% da largura do quadro */
  font-size: min(var(--nu-fs-h2), 10cqi); font-weight: 800; letter-spacing: -0.04em; line-height: 1; font-variant-numeric: tabular-nums;
}
.hpl__seta { width: .62em; height: .62em; flex: none; }

/* o cabo de guerra */
.hpl__cabo { display: flex; flex-direction: column; gap: 12px; }
.hpl__barra { position: relative; display: flex; height: 12px; border-radius: var(--nu-r-pill); background: var(--nu-agora-pilula); overflow: hidden; }
.hpl__meio { position: absolute; left: 50%; top: -6px; bottom: -6px; width: 2px; margin-left: -1px; background: var(--nu-agora-bg); z-index: 1; }
.hpl__parte { height: 100%; transition: width 1s cubic-bezier(.22, 1, .36, 1) .2s, opacity .15s ease; }
.hpl__parte--voce { background: var(--nu-agora-texto); }
.hpl__cabo--queda .hpl__parte--voce { background: var(--nu-agora-vermelho); }
.hpl__cabo--alta .hpl__parte--voce { background: var(--nu-agora-verde); }
.hpl__parte--voce, .hpl__parte--bolsa { opacity: .42; }
.hpl__parte--bolsa { background: var(--nu-agora-texto); border-left: 2px solid var(--nu-agora-bg); }
.hpl__ganho { position: absolute; top: 0; bottom: 0; transition: left 1s cubic-bezier(.22, 1, .36, 1) .2s, width 1s cubic-bezier(.22, 1, .36, 1) .2s; }
.hpl__ganho--bolsa { background: var(--nu-agora-texto); }
.hpl__ganho--voce { background: var(--nu-agora-texto); }
.hpl__cabo--queda .hpl__ganho--voce { background: var(--nu-agora-vermelho); }
.hpl__cabo--alta .hpl__ganho--voce { background: var(--nu-agora-verde); }
.hpl__parte--apagada { opacity: .15; }
/* o número da diferença, embaixo da barra, no centro (o empate) */
.hpl__dif {
  align-self: center; display: flex; align-items: baseline; gap: 8px; white-space: nowrap;
  transition: opacity .3s ease .9s; opacity: 0;
}
.hpl--visivel .hpl__dif { opacity: 1; }
.hpl__pp { font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.hpl__relacao { color: var(--nu-agora-sub); font-size: var(--nu-fs-md); font-weight: 700; }
.hpl__esq-dif { align-self: center; }

/* o provento */
.hpl__provento {
  align-self: flex-start; display: inline-flex; align-items: center; gap: 10px; color: var(--nu-agora-sub);
  font-size: var(--nu-fs-md); font-weight: 700; transition: opacity .15s ease;
}
.hpl__provento strong { color: var(--nu-agora-verde); font-weight: 800; }
.hpl__provento:hover { color: var(--nu-agora-sub); }
.hpl__moeda {
  display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%;
  border: 1.6px solid color-mix(in srgb, var(--nu-agora-verde) 55%, transparent); color: var(--nu-agora-verde);
  font-size: var(--nu-fs-xs); font-weight: 800;
}
.hpl__provento--caiu .hpl__moeda { background: var(--nu-agora-verde); border-color: var(--nu-agora-verde); color: var(--nu-agora-bg); box-shadow: 0 0 16px -2px var(--nu-agora-verde); }
.hpl--carregando .hpl__moeda { border-color: var(--nu-agora-linha); }

/* a chegada: os números sobem um pouco e aparecem; a barra sai do meio até o corte */
.hpl__num { opacity: 0; transform: translateY(6px); transition: opacity .4s ease, transform .5s cubic-bezier(.22, 1, .36, 1); }
.hpl--visivel .hpl__num { opacity: 1; transform: none; }

/* antes da abertura: o pregão anterior, esmaecido */
.hpl--esmaecido .hpl__num, .hpl--esmaecido .hpl__barra, .hpl--esmaecido .hpl__dif { opacity: .55; }

@media (prefers-reduced-motion: reduce) {
  .hpl__num, .hpl__parte, .hpl__ganho, .hpl__dif, .hpl__lado, .hpl__provento { transition: none !important; }
}
</style>
