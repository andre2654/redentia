<script setup lang="ts">
// O número da conta, no slot "resultado" do CalcConta (21/10/2026): a legenda
// ("Aos 60 anos, você terá"), o número grande, o selo e a linha que explica.
// Era o mesmo CSS repetido em cada calculadora na frase.
// Aportou (11/11/2026): o número em 800 troca com um fade curto quando a
// conta muda (o :key remonta só o texto do número); o selo é o selo dos
// quadros (raio 8, fundo claro com a letra da mesma família).
// Robustez (11/11/2026): o número CONTA até o valor novo (--nu-dur-lenta na
// --nu-ease-saida, calc-movimento.ts) em vez de remontar a cada passo do
// trilho (que o deixava piscando apagado enquanto se arrastava). Quando não
// dá para contar ("R$ 980 mil" → "R$ 1,02 mi", ou um texto), ele troca com um
// fade de --nu-dur-media. Os algarismos são tabulares: as casas não dançam.
// O que se vê contando é aria-hidden; o leitor de tela recebe só o valor
// final, numa cópia escondida (as duas só existem depois de montar: o HTML do
// servidor tem o número uma vez). O selo é o NuSelo (azul: fato; verde: chega
// lá; vermelho: não chega), que quebra a linha quando o texto é longo.
import { contaveis, curvaDoToken, duracaoDoToken, escreverNoTexto, lerNumeroDoTexto, movimentoReduzido } from './calc-movimento'

const props = withDefaults(defineProps<{
  legenda: string
  valor: string
  /** colado no número, menor ("/mês") */
  unidade?: string
  selo?: string
  /** azul: um fato da conta; ok: chega lá; falta: não chega */
  tom?: 'azul' | 'ok' | 'falta'
  explica?: string
}>(), { tom: 'azul' })

const TOM_DO_SELO = { azul: 'azul', ok: 'verde', falta: 'vermelho' } as const

const exibido = ref(props.valor)
const troca = ref(0)
const montado = ref(false)
let quadro = 0
onMounted(() => { montado.value = true })
onBeforeUnmount(() => { if (quadro) cancelAnimationFrame(quadro) })

watch(() => props.valor, (novo) => {
  if (import.meta.server) return
  if (quadro) cancelAnimationFrame(quadro)
  quadro = 0
  const de = lerNumeroDoTexto(exibido.value)
  const para = lerNumeroDoTexto(novo)
  if (movimentoReduzido() || !contaveis(de, para) || de.valor === para!.valor) {
    if (!contaveis(de, para) && novo !== exibido.value) troca.value++
    exibido.value = novo
    return
  }
  const inicio = de.valor
  const fim = para!.valor
  const duracao = duracaoDoToken('--nu-dur-lenta', 520)
  const curva = curvaDoToken('--nu-ease-saida', [0.16, 1, 0.3, 1])
  const t0 = performance.now()
  const passo = (agora: number) => {
    const t = Math.min(1, (agora - t0) / duracao)
    if (t >= 1) {
      exibido.value = novo
      quadro = 0
      return
    }
    exibido.value = escreverNoTexto(para!, inicio + (fim - inicio) * curva(t))
    quadro = requestAnimationFrame(passo)
  }
  quadro = requestAnimationFrame(passo)
})
</script>

<template>
  <div v-contexto-chat="{ id: `conta:${legenda}`, tipo: 'grafico', rotulo: rotuloCurto(legenda.replace(/[,:]\s*$/, ''), 30), texto: [`${legenda} ${valor}${unidade ?? ''}`, selo, explica].filter(Boolean).join('\n') }" class="cnu">
    <p class="cnu__legenda">{{ legenda }}</p>
    <p class="cnu__valor"><span :key="troca" class="cnu__troca" :class="{ 'cnu__troca--fade': troca > 0 }" :aria-hidden="montado || undefined">{{ exibido }}</span><span v-if="montado" class="nu-sr">{{ valor }}</span><span v-if="unidade" class="cnu__unidade">{{ unidade }}</span></p>
    <NuSelo v-if="selo" class="cnu__selo" :tom="TOM_DO_SELO[tom]">{{ selo }}</NuSelo>
    <p v-if="explica" class="cnu__explica">{{ explica }}</p>
    <slot />
  </div>
</template>

<style scoped>
.cnu__legenda { margin: 0; color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); }
.cnu__valor {
  margin: 8px 0 0; color: var(--nu-ink); font-size: clamp(46px, 5.2vw, 68px); font-weight: var(--nu-w-display);
  letter-spacing: var(--nu-ls-display); line-height: 1; font-variant-numeric: tabular-nums;
}
.cnu__troca { display: inline-block; }
/* a troca que não dá para contar: um fade curto, sem pulo */
.cnu__troca--fade { animation: nu-fade var(--nu-dur-media) var(--nu-ease-saida) both; }
.cnu__unidade { margin-left: 4px; color: var(--nu-gray); font-size: var(--nu-fs-h3); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-titulo); }
/* o NuSelo quebra a linha quando o texto é longo (no celular) */
.cnu__selo {
  margin-top: 16px; max-width: 100%; height: auto; min-height: 28px; padding-block: 5px;
  line-height: 1.3; white-space: normal;
  animation: nu-fade var(--nu-dur-media) var(--nu-ease-saida) both;
}
.cnu__explica { margin: 14px 0 0; max-width: 470px; color: var(--nu-gray); font-size: 14.5px; font-weight: var(--nu-w-texto); line-height: 1.5; }
</style>
