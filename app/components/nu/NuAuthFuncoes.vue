<script setup lang="ts">
// O lado direito do /login e do cadastro (dono, 21/10/2026: "no login e no
// registro, tente mostrar essas outras features também"). As quatro coisas que
// a conta abre se revezam, cada uma com o herói da folha de cadastro e com dado
// de verdade: a pergunta respondida (a maior alta do dia), a linha do mês da
// mesma ação com o porquê, o céu das 7h30 com a frase do resumo e a bola de
// neve dos juros compostos. Uma legenda curta e os pontos de progresso, como
// nas páginas de produto da Apple. Os pontos trocam de cena e param o rodízio.
import type { DadosAtivo, DadosMaiorAlta, DadosResumo } from '~/composables/useCadastroDados'

const dados = useCadastroDados()

const CENAS = [
  { titulo: 'Pergunte o que quiser.', linha: 'A Redentia responde em português, com os dados do pregão.' },
  { titulo: 'Saiba por que a sua ação se mexeu.', linha: 'Siga um ativo e receba o porquê de cada movimento.' },
  { titulo: 'O mercado de ontem, às 7h30.', linha: 'No WhatsApp ou no e-mail, antes de o pregão abrir.' },
  { titulo: 'Guarde as suas contas.', linha: 'As simulações ficam na sua conta, prontas para reabrir.' },
] as const

// a conta de exemplo é a do canvas: R$ 500 por mês, 10 anos, CDI de 10,75% a.a.
const CONTA = { inicial: 0, mensal: 500, taxa: 10.75, anos: 10 }

const cena = ref(0)
const alta = ref<DadosMaiorAlta | null>(null)
const ativo = ref<DadosAtivo | null>(null)
const resumo = ref<DadosResumo | null>(null)

// "hoje" só com o pregão do dia aberto; antes das 10h e no fim de semana, "no último pregão"
const quando = quandoDoPregao()
const pergunta = computed(() => (alta.value ? `Qual ação mais subiu ${quando}?` : 'Quanto rendem R$ 500 por mês em 10 anos?'))
const resposta = computed(() => (alta.value
  ? `${alta.value.nome} (${alta.value.ticker}), com ${pctTexto(alta.value.variacao)} ${quando}. A maior alta da bolsa.`
  : `A 10,75% ao ano, viram ${brlInteiro(totalJuros(CONTA))}. Você põe R$ 60 mil; os juros fazem o resto.`))

// 6 s por cena: em modo painel os heróis contam a história nesse tempo, uma
// vez, e param no quadro final. Mudou aqui, mude o --*-ciclo deles.
let relogio: ReturnType<typeof setInterval> | null = null
function rodar() {
  relogio = setInterval(() => { cena.value = (cena.value + 1) % CENAS.length }, 6000)
}
function irPara(i: number) {
  cena.value = i
  if (relogio) clearInterval(relogio)
  relogio = null
}

onMounted(async () => {
  rodar()
  const [a, r] = await Promise.all([dados.maiorAlta(), dados.resumo()])
  alta.value = a
  resumo.value = r
  // a linha do mês é da mesma ação da pergunta quando ela tem o porquê do dia.
  // A maior alta costuma ser papel pequeno, sem notícia própria (LUPA3 em
  // 21/10), e a cena promete o porquê: aí tenta Petrobras e Vale, uma de cada
  // vez. Nenhuma com notícia, fica a primeira, só com a variação.
  const candidatos = [...new Set([a?.ticker, 'PETR4', 'VALE3'].filter((t): t is string => !!t))]
  let primeira: DadosAtivo | null = null
  for (const t of candidatos) {
    const d = await dados.ativo(t)
    primeira ??= d
    if (d.motivo) {
      ativo.value = d
      return
    }
  }
  ativo.value = primeira
})
onBeforeUnmount(() => { if (relogio) clearInterval(relogio) })
</script>

<template>
  <div class="naf">
    <div class="naf__palco">
      <Transition name="naf-cena" mode="out-in">
        <CadastroHeroiPergunta v-if="cena === 0" key="pergunta" painel :pergunta="pergunta" :resposta="resposta" />
        <CadastroHeroiAtivo v-else-if="cena === 1" key="ativo" painel :dados="ativo" />
        <CadastroHeroiResumo v-else-if="cena === 2" key="resumo" painel :frase="resumo?.frase ?? null" />
        <CadastroHeroiSimulacao v-else key="simulacao" painel :conta="CONTA" />
      </Transition>
    </div>
    <div class="naf__legenda" aria-live="polite">
      <div class="naf__titulo">{{ CENAS[cena]!.titulo }}</div>
      <div class="naf__linha">{{ CENAS[cena]!.linha }}</div>
    </div>
    <div class="naf__pontos">
      <button
        v-for="(c, i) in CENAS" :key="c.titulo" type="button" class="naf__ponto" :class="{ 'naf__ponto--on': i === cena }"
        :aria-label="`Ver: ${c.titulo}`" :aria-pressed="i === cena" @click="irPara(i)"
      />
    </div>
  </div>
</template>

<style scoped>
.naf { width: 100%; max-width: 456px; }
.naf__palco { min-height: 300px; display: flex; flex-direction: column; justify-content: center; }
.naf__legenda { margin-top: 30px; }
.naf__titulo { color: var(--nu-cream-text); font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.03em; line-height: 1.15; }
.naf__linha { margin-top: 8px; color: var(--nu-cream-text-70); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; }
.naf__pontos { display: flex; gap: 8px; margin-top: 22px; }
.naf__ponto {
  width: 8px; height: 8px; padding: 0; border: 0; border-radius: var(--nu-r-pill); cursor: pointer;
  background: var(--nu-cream-text-30); transition: width .3s ease, background .3s ease;
}
.naf__ponto--on { width: 26px; background: var(--nu-cream-text); }
.naf__ponto:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 3px; }
.naf-cena-enter-active, .naf-cena-leave-active { transition: opacity .45s ease, transform .45s cubic-bezier(.2, .8, .2, 1); }
.naf-cena-enter-from { opacity: 0; transform: translateY(10px); }
.naf-cena-leave-to { opacity: 0; transform: translateY(-6px); }
@media (prefers-reduced-motion: reduce) {
  .naf-cena-enter-active, .naf-cena-leave-active, .naf__ponto { transition: none; }
}
</style>
