<script setup lang="ts">
// Tipo 2 dos achados, "O diagnóstico em números" (05/11/2026, no dev por
// ?achados=2). Nasce de duas peças aprovadas: a grade de indicadores do /asset
// (AtivoIndicadores: o rótulo cinza, o número grande em 600 tabular, o hover
// que acende o rótulo em azul e apaga os vizinhos) e a faixa de três números
// da HomeAgora (o fio fino em cima de cada número, o fundo leve e a seta que
// surgem no hover). É o Raio-X trazido para cima: uma casa por dimensão, com
// o veredito curto do agente embaixo. O tom fica só no pontinho, ao lado do
// estado em palavras; nunca cartão colorido. Em cima, o veredito de uma linha
// ("Dois pontos pedem atenção."); embaixo, numa linha discreta, o que veio da
// análise escrita (a antiga com a data e os dias). Cada casa e cada item da
// linha abre o painel do chat com a pergunta dele.
import type { AchadosVM } from '~/utils/achadosDaCarteira'
import type { RaioXMetricVM } from '~/types/carteira'
import { minuscula, numerosDoDiagnostico, oQueOlhei, vereditoDosAchados } from '~/utils/achadosNaTela'

const props = defineProps<{ vm: AchadosVM; metricas: RaioXMetricVM[]; selo: string | null; acoes: string[]; mascarar: (t: string) => string }>()
const emit = defineEmits<{ perguntar: [string]; agir: [string] }>()

const numeros = computed(() => numerosDoDiagnostico(props.vm, props.metricas, props.mascarar))
const veredito = computed(() => vereditoDosAchados(props.vm))
/** o que não é número: da análise de hoje (raro) e da antiga, cada um com a sua data */
const daAnalise = computed(() => {
  const fora = props.vm.itens.filter((a) => a.origem === 'analise')
  const hoje = fora.filter((a) => !a.antigo)
  const antigos = fora.filter((a) => a.antigo)
  const a = props.vm.analise
  return [
    ...(hoje.length ? [{ k: 'hoje', rotulo: a ? `Da análise de ${a.data}` : 'Da análise', itens: hoje }] : []),
    ...(antigos.length && a ? [{ k: 'antiga', rotulo: `Da análise de ${a.data}, há ${a.dias} dias`, itens: antigos }] : []),
  ]
})
const aceso = ref<number | null>(null)
</script>

<template>
  <div class="can">
    <div class="can__topo">
      <span class="can__assinatura"><img src="/logo-azul.svg" alt="" width="14" height="14">Redentia AI</span>
      <span class="can__olhou">{{ oQueOlhei(vm) }}</span>
      <span v-if="selo" class="can__selo">{{ selo }}</span>
    </div>
    <h2 class="can__veredito">{{ veredito }}</h2>

    <ul v-if="numeros.length" class="can__grade" @mouseleave="aceso = null">
      <li v-for="(n, i) in numeros" :key="n.label" class="can__casa-li">
        <button
          type="button" class="can__casa" :class="[`can__casa--${n.tom}`, { 'can__casa--on': aceso === i, 'can__casa--recua': aceso != null && aceso !== i }]"
          data-hover data-pergunta :aria-label="`${n.label}: ${n.antes ?? ''} ${n.n}${n.depois ?? ''}, ${n.estado}. ${n.veredito} Perguntar à Redentia.`"
          @mouseenter="aceso = i" @focus="aceso = i" @blur="aceso = null" @click="emit('perguntar', n.pergunta)"
        >
          <span class="can__rotulo"><span class="can__ponto" aria-hidden="true" />{{ n.label }}<span class="can__estado"><span class="can__ponto-sep">· </span>{{ n.estado }}</span></span>
          <span class="can__numero"><span v-if="n.antes" class="can__mini">{{ n.antes }}</span>{{ n.n }}<span v-if="n.depois" class="can__mini">{{ n.depois }}</span></span>
          <span class="can__veredito-curto">{{ n.veredito }}</span>
          <span class="can__nota">{{ n.nota }}</span>
        </button>
      </li>
    </ul>

    <div v-if="daAnalise.length" class="can__analise">
      <p v-for="g in daAnalise" :key="g.k" class="can__linha" :class="{ 'can__linha--antiga': g.k === 'antiga' }">
        <span class="can__linha-r">{{ g.rotulo }}:</span>
        <button v-for="a in g.itens" :key="a.id" type="button" class="can__item" data-pergunta @click="emit('perguntar', a.pergunta)">{{ minuscula(a.titulo) }}</button>
      </p>
    </div>

    <AtivoPerguntaChips :perguntas="acoes" tom="claro" :rotulo="null" class="can__acoes" @perguntar="emit('agir', $event)" />
  </div>
</template>

<style scoped>
.can { --m: max(var(--g, 22px), calc((100% - 1180px) / 2)); --mola: cubic-bezier(.34, 1.56, .64, 1); padding: clamp(28px, 3.4vw, 44px) var(--m) 0; }
.can__topo { display: flex; align-items: center; gap: 8px 14px; flex-wrap: wrap; }
.can__assinatura {
  display: inline-flex; align-items: center; gap: 7px; height: 28px; padding: 0 12px 0 9px; border-radius: var(--nu-r-pill);
  background: var(--nu-cream); color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap;
}
.can__olhou { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; font-variant-numeric: tabular-nums; }
.can__selo { margin-left: auto; color: var(--nu-amber-text); font-size: var(--nu-fs-sm); font-weight: 600; }
/* o veredito da HomeAgora, no claro */
.can__veredito { margin: 14px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 700; letter-spacing: -0.02em; line-height: 1.2; text-wrap: balance; }

/* a grade: o fio em cima de cada número (a faixa da HomeAgora), sem cartão */
.can__grade { list-style: none; margin: clamp(20px, 2.4vw, 28px) 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr)); gap: 0 clamp(12px, 2vw, 28px); }
.can__casa-li { display: flex; border-top: 1px solid var(--nu-cream-line); }
.can__casa {
  position: relative; flex: 1; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; margin: 6px -12px 0; padding: 12px 12px 16px;
  border: 0; border-radius: 14px; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer;
  transition: background .2s ease, opacity .22s ease, transform .45s var(--mola);
}
/* a seta que surge no hover (o fato da HomeAgora) */
.can__casa::after {
  content: '→'; position: absolute; right: 14px; top: 14px; color: var(--nu-blue-text);
  font-size: var(--nu-fs-md); font-weight: 700; opacity: 0; transform: translateX(-4px); transition: opacity .2s ease, transform .2s ease;
}
.can__casa--on { background: var(--nu-ink-04); }
.can__casa--on::after { opacity: 1; transform: none; }
.can__casa--recua { opacity: .62; }
.can__casa:active { transform: scale(.98); }
.can__casa:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.can__rotulo { display: inline-flex; align-items: center; gap: 8px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; transition: color .2s ease; }
.can__casa--on .can__rotulo { color: var(--nu-blue-text); }
.can__estado { margin-left: -2px; font-weight: 500; }
.can__ponto { width: 8px; height: 8px; border-radius: 50%; background: var(--nu-green); }
.can__casa--atencao .can__ponto { background: var(--nu-amber); }
.can__numero { display: inline-flex; align-items: baseline; gap: 6px; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm); font-weight: 600; letter-spacing: -0.035em; line-height: 1.05; font-variant-numeric: tabular-nums; }
.can__mini { color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 500; letter-spacing: 0; }
.can__veredito-curto { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 600; line-height: 1.35; }
.can__nota { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; font-variant-numeric: tabular-nums; text-wrap: pretty; }

/* a linha da análise: discreta, cada item um link */
.can__analise { margin-top: 18px; display: flex; flex-direction: column; gap: 6px; }
.can__linha { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 0; margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.6; }
.can__linha-r { margin-right: 8px; font-weight: 600; }
.can__item + .can__item::before { content: '·'; display: inline-block; margin: 0 10px; color: var(--nu-gray); text-decoration: none; }
.can__item {
  display: inline; padding: 0; border: 0; background: none; cursor: pointer; font: inherit; color: var(--nu-gray-2); font-weight: 600;
  text-decoration: underline; text-decoration-color: var(--nu-cream-line); text-underline-offset: .22em; transition: color .2s ease, text-decoration-color .2s ease;
}
.can__item:hover { color: var(--nu-blue-text); text-decoration-color: currentColor; }
.can__item:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; border-radius: 3px; }
.can__acoes { margin-top: 22px; }

/* no celular: duas casas por linha, o número um pouco menor, a nota escondida (o chat a tem) */
@media (max-width: 640px) {
  .can__grade { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 14px; }
  /* número ímpar de casas: a última ocupa a linha (nada de buraco à direita) */
  .can__casa-li:last-child:nth-child(odd) { grid-column: 1 / -1; }
  .can__linha { flex-direction: column; align-items: flex-start; }
  .can__item + .can__item::before { content: none; }
  .can__casa { margin: 4px -8px 0; padding: 10px 8px 14px; }
  .can__casa::after { right: 8px; top: 10px; }
  .can__numero { font-size: var(--nu-fs-h3); }
  .can__rotulo { flex-wrap: wrap; gap: 0 8px; font-size: var(--nu-fs-dense); }
  .can__estado { flex-basis: 100%; margin-left: 16px; }
  .can__ponto-sep { display: none; }
  .can__veredito-curto { font-size: var(--nu-fs-sm); }
  .can__nota { display: none; }
  .can__selo { margin-left: 0; flex-basis: 100%; }
}
@media (hover: none) { .can__casa::after { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .can__casa, .can__casa::after, .can__rotulo, .can__item { transition: none; }
  .can__casa:active { transform: none; }
}
</style>
