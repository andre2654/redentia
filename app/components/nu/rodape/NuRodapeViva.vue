<script setup lang="ts">
// Rodapé, direção 3 "Viva" (protótipo de 02/11/2026, ?rodape=3 no dev). A
// página fecha com o pregão numa frase só, grande, e o título da Redentia
// responde a ela: "Na sexta, o Ibovespa fechou em 167.921 pontos, −0,75%."
// e, embaixo, "Seja qual for a sua meta, a Redentia tem um caminho." Só
// tipografia: a frase em dois pesos (o começo leve, o número em 800), a
// variação na cor do sentido (par -soft, sobre navy) e o enredo do dia
// ("Quinta queda seguida.") apagado ao lado.
//
// O dado é o da home (server/api/bolsa-do-dia, cacheado 2 min): se a home já
// buscou, reusa a chave 'bolsa-do-dia'; senão busca no cliente, depois de
// montar (o rodapé está em toda página e não pode segurar o SSR). Enquanto
// carrega, esqueleto na forma da frase; sem o Ibovespa, a frase some e fica o
// título. Com o pregão aberto, o ponto pulsa e a frase se atualiza a cada 2
// min. As frases saem de utils/rodapeViva.ts (testadas em tests/rodape-viva).
//
// A pergunta embaixo ("Por que o Ibovespa caiu na sexta?") vai para a barra
// da Redentia, que mora logo abaixo do rodapé: o fim da página puxa a conversa.
import type { BolsaDoDia } from '~/utils/bolsaDoDia'
import { estadoDoPregao } from '~/utils/pregao'
import { fraseDoPregao } from '~/utils/rodapeViva'

const { perguntar } = useChatPainel()
const { data: daHome } = useNuxtData<BolsaDoDia>('bolsa-do-dia')
const { el, revealClass } = useReveal(0.2)

const bolsa = ref<BolsaDoDia | null>(null)
const carregando = ref(true)
const agora = ref(Date.now())
let relogio: ReturnType<typeof setInterval> | null = null

async function buscar() {
  try {
    bolsa.value = await $fetch<BolsaDoDia>('/api/bolsa-do-dia')
  } catch {
    // sem dado, sem frase: o título fica sozinho
    if (!bolsa.value) bolsa.value = null
  } finally {
    carregando.value = false
  }
}

onMounted(() => {
  agora.value = Date.now()
  if (daHome.value?.ibov) { bolsa.value = daHome.value; carregando.value = false } else void buscar()
  relogio = setInterval(() => {
    agora.value = Date.now()
    if (estado.value === 'aberta' && document.visibilityState === 'visible') void buscar()
  }, 120_000)
})
onBeforeUnmount(() => { if (relogio) clearInterval(relogio) })

const estado = computed(() => estadoDoPregao(new Date(agora.value)).estado)
const frase = computed(() => fraseDoPregao(bolsa.value, estado.value, new Date(agora.value)))
</script>

<template>
  <div ref="el" data-banda="viva" class="nrv" :class="revealClass">
    <div class="nrv__luz" aria-hidden="true" />

    <div v-if="carregando" class="nrv__pregao" aria-hidden="true">
      <NuSkeleton tone="navy" variant="line" width="min(340px, 70%)" height="14px" />
      <div class="nrv__esq-frase">
        <NuSkeleton tone="navy" variant="block" width="min(820px, 92%)" height="0.78em" radius="chip" />
        <NuSkeleton tone="navy" variant="block" width="min(1040px, 100%)" height="0.78em" radius="chip" />
      </div>
    </div>
    <div v-else-if="frase" class="nrv__pregao nrv__pregao--pronto" aria-live="polite">
      <p class="nrv__sobre">
        <span v-if="frase.aoVivo" class="nrv__vivo" aria-hidden="true" />
        {{ frase.sobrelinha }}
      </p>
      <p class="nrv__frase">
        <span class="nrv__abre">{{ frase.abertura }}</span>
        {{ ' ' }}<span class="nrv__num">{{ frase.pontos }}</span>,
        <span class="nrv__num" :class="`nrv__pct--${frase.sentido}`">{{ frase.variacao }}</span>.<template v-if="frase.enredo">
          {{ ' ' }}<span class="nrv__enredo">{{ frase.enredo }}</span></template>
      </p>
    </div>

    <div class="nrv__fecho">
      <h2 class="nrv__titulo">Seja qual for a sua meta,<br> a Redentia tem um caminho.</h2>
      <button v-if="frase" type="button" class="nrv__pergunta" @click="perguntar(frase.pergunta)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" /></svg>
        <span>{{ frase.pergunta }}</span>
      </button>
    </div>

    <div class="nrv__base"><slot name="base" /></div>
  </div>
</template>

<style scoped>
.nrv {
  --g: clamp(22px, 5.5vw, 80px);
  position: relative; isolation: isolate;
  padding-top: clamp(56px, 7vw, 104px);
}
.nrv__luz {
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: radial-gradient(48% 46% at 12% 36%, color-mix(in srgb, var(--nu-blue) 16%, transparent) 0%, transparent 100%);
}
.nrv__pregao { padding: 0 var(--g); }
.nrv__esq-frase { display: flex; flex-direction: column; gap: 0.24em; margin-top: 28px; font-size: clamp(36px, 6.4vw, 100px); }

.nrv__sobre {
  display: flex; align-items: center; gap: 10px; margin: 0;
  color: var(--nu-cream-text-55); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums;
}
.nrv__vivo {
  width: 8px; height: 8px; border-radius: 50%; background: var(--nu-green-soft);
  box-shadow: 0 0 0 0 var(--nu-green-soft-35); animation: nrv-vivo 2s ease-out infinite;
}
@keyframes nrv-vivo { 70% { box-shadow: 0 0 0 9px transparent; } 100% { box-shadow: 0 0 0 0 transparent; } }

.nrv__frase {
  margin: 22px 0 0; max-width: 20ch;
  color: var(--nu-cream-text); font-size: clamp(36px, 6.4vw, 100px); font-weight: 800; letter-spacing: -0.05em; line-height: 1.02;
  text-wrap: balance;
}
.nrv__abre { font-weight: 500; color: var(--nu-cream-text-60); }
.nrv__num { font-variant-numeric: tabular-nums; white-space: nowrap; }
.nrv__pct--queda { color: var(--nu-red-soft); }
.nrv__pct--alta { color: var(--nu-green-soft); }
.nrv__enredo { display: block; font-weight: 500; color: var(--nu-cream-text-35); }

.nrv__fecho {
  display: flex; align-items: flex-end; justify-content: space-between; gap: 24px 48px; flex-wrap: wrap;
  margin: clamp(56px, 7vw, 104px) var(--g) 0; padding-top: clamp(28px, 3vw, 40px);
  border-top: 1px solid var(--nu-cream-text-14);
}
.nrv__titulo {
  margin: 0; color: var(--nu-cream-text);
  font-size: var(--nu-fs-h3); font-weight: 700; letter-spacing: -0.03em; line-height: 1.14; text-wrap: balance;
}
.nrv__pergunta {
  display: inline-flex; align-items: center; gap: 10px; min-height: 44px; padding: 10px 20px 10px 16px; cursor: pointer;
  border: 1px solid var(--nu-cream-text-22); border-radius: var(--nu-r-pill); background: transparent;
  color: var(--nu-cream-text); font: inherit; font-size: var(--nu-fs-md); font-weight: 600; text-align: left;
  transition: background .2s, border-color .2s, transform .2s;
}
.nrv__pergunta svg { color: var(--nu-blue-soft); flex: none; }
.nrv__pergunta:hover { background: var(--nu-navy-2); border-color: var(--nu-cream-text-45); transform: translateY(-2px); }
.nrv__pergunta:active { transform: translateY(1px); }
.nrv__pergunta:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 3px; }

.nrv__base { margin-top: clamp(48px, 5vw, 72px); }

/* a frase chega do desfoque quando o dado chega (ou quando a banda entra na tela) */
.nrv__pregao--pronto { animation: nrv-chega .9s cubic-bezier(.2, .8, .2, 1) both; }
.is-pending .nrv__pregao--pronto { animation: none; opacity: 0; }
.is-in .nrv__pregao--pronto { animation: nrv-chega .9s cubic-bezier(.2, .8, .2, 1) both; }
@keyframes nrv-chega { from { opacity: 0; filter: blur(12px); transform: translateY(10px); } }
@media (prefers-reduced-motion: reduce) { .nrv__pregao--pronto, .is-in .nrv__pregao--pronto { animation: none; } .nrv__vivo { animation: none; } }
</style>
