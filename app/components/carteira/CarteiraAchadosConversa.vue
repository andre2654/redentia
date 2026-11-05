<script setup lang="ts">
// Tipo 3 dos achados, "A Redentia quer conversar" (05/11/2026, no dev por
// ?achados=3). Chat-first, e o mais curto dos três. Nasce das perguntas que
// abrem o chat no /asset (AtivoPerguntaChips: a pílula branca com o losango
// azul) e da barra do chat (ChatBarra/ChatPilula: a moldura iridescente). O
// agente transforma cada achado numa pergunta que ele oferece; a primeira, a
// que mais pesa, vai na barra; as outras, nos chips de baixo. Clicar abre o
// painel com a pergunta do achado (na voz da pessoa).
// O brilho é o da barra do rodapé, mas PARADO: o anel só gira e a luz só
// respira enquanto o mouse está em cima ou o foco está nela. A página já tem o
// seu momento assinatura (o leque de "Daqui a 5 anos"); aqui nada fica em loop.
import type { AchadosVM } from '~/utils/achadosDaCarteira'
import type { RaioXMetricVM } from '~/types/carteira'
import { oQueOlhei, perguntasDoAgente, vereditoDosAchados } from '~/utils/achadosNaTela'

const props = defineProps<{ vm: AchadosVM; metricas: RaioXMetricVM[]; selo: string | null; acoes: string[]; mascarar: (t: string) => string; perguntar: string }>()
const emit = defineEmits<{ perguntar: [string]; agir: [string] }>()

const perguntas = computed(() => perguntasDoAgente(props.vm, props.metricas, props.mascarar))
// sem achado nenhum (nem o que vai bem), a barra fica: abre o chat com os achados anexados
const principal = computed(() => perguntas.value[0] ?? { id: 'livre', oferta: 'Quer perguntar algo da sua carteira?', pergunta: '', tom: 'ok' as const })
const outras = computed(() => perguntas.value.slice(1))
/** os chips: as outras perguntas e, no fim, as ações (sem o "Perguntar" genérico: a barra já é ele) */
const chips = computed(() => [...outras.value.map((p) => p.oferta), ...props.acoes.filter((q) => q !== props.perguntar)])
function aoEscolher(q: string) {
  const p = outras.value.find((x) => x.oferta === q)
  if (p) emit('perguntar', p.pergunta)
  else emit('agir', q)
}
const aceso = ref(false)
</script>

<template>
  <div class="cac">
    <p class="cac__fala">
      <span class="cac__assinatura"><img src="/logo-azul.svg" alt="" width="14" height="14">Redentia AI</span>
      <span class="cac__olhou">{{ oQueOlhei(vm) }} {{ vereditoDosAchados(vm) }}</span>
      <span v-if="selo" class="cac__selo">{{ selo }}</span>
    </p>

    <ChatPilula class="cac__pilula" :class="{ 'cac__pilula--viva': aceso }" :aceso="aceso">
      <button
        type="button" class="cac__barra" data-hover data-pergunta
        @mouseenter="aceso = true" @mouseleave="aceso = false" @focus="aceso = true" @blur="aceso = false"
        @click="principal.pergunta ? emit('perguntar', principal.pergunta) : emit('agir', perguntar)"
      >
        <img src="/logo-azul.svg" alt="" width="20" height="20" class="cac__marca">
        <span class="cac__oferta">{{ principal.oferta }}</span>
        <span class="cac__ir" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
        </span>
      </button>
    </ChatPilula>

    <AtivoPerguntaChips :perguntas="chips" tom="claro" :rotulo="outras.length ? 'Ou pergunte' : null" class="cac__chips" @perguntar="aoEscolher" />
  </div>
</template>

<style scoped>
.cac { --m: max(var(--g, 22px), calc((100% - 1180px) / 2)); padding: clamp(24px, 3vw, 36px) var(--m) 0; }
.cac__fala { display: flex; align-items: center; gap: 8px 14px; flex-wrap: wrap; margin: 0; }
.cac__assinatura {
  display: inline-flex; align-items: center; gap: 7px; height: 28px; padding: 0 12px 0 9px; border-radius: var(--nu-r-pill);
  background: var(--nu-cream); color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap;
}
.cac__olhou { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 600; letter-spacing: -0.01em; font-variant-numeric: tabular-nums; }
.cac__selo { margin-left: auto; color: var(--nu-amber-text); font-size: var(--nu-fs-sm); font-weight: 600; }

/* a barra: a moldura do chat, parada até a mão chegar */
.cac__pilula { --cpi-raio: 30px; margin-top: 18px; max-width: 880px; }
.cac__pilula :deep(.cpi__anel::before), .cac__pilula :deep(.cpi__brilho) { animation-play-state: paused; }
.cac__pilula--viva :deep(.cpi__anel::before), .cac__pilula--viva :deep(.cpi__brilho) { animation-play-state: running; }
.cac__barra {
  display: flex; align-items: center; gap: 14px; width: 100%; min-height: 60px; padding: 10px 10px 10px 20px; border: 0; border-radius: 28px;
  background: transparent; color: var(--nu-ink); font: inherit; text-align: left; cursor: pointer;
}
.cac__barra:focus-visible { outline: none; }
.cac__marca { flex-shrink: 0; display: block; }
.cac__oferta { flex: 1; min-width: 0; font-size: var(--nu-fs-lg); font-weight: 600; line-height: 1.4; letter-spacing: -0.01em; font-variant-numeric: tabular-nums; text-wrap: pretty; }
.cac__ir {
  flex-shrink: 0; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%;
  background: var(--nu-ink); color: var(--nu-white); transition: transform .45s cubic-bezier(.34, 1.56, .64, 1), background .2s ease;
}
.cac__barra:hover .cac__ir, .cac__barra:focus-visible .cac__ir { background: var(--nu-blue); transform: translateX(2px); }
.cac__barra:active .cac__ir { transform: scale(.94); }

.cac__chips { margin-top: 18px; }

@media (max-width: 640px) {
  .cac__olhou { font-size: var(--nu-fs-md); flex-basis: 100%; }
  .cac__selo { margin-left: 0; }
  .cac__barra { align-items: flex-start; padding: 14px 12px 14px 16px; gap: 12px; }
  .cac__marca { margin-top: 3px; }
  .cac__oferta { font-size: var(--nu-fs-md); }
  .cac__ir { width: 36px; height: 36px; align-self: center; }
}
@media (prefers-reduced-motion: reduce) {
  .cac__ir { transition: none; }
  .cac__barra:hover .cac__ir, .cac__barra:active .cac__ir { transform: none; }
}
</style>
