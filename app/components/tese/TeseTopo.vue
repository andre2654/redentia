<script setup lang="ts">
// O topo da tese (11/11/2026, docs/aportou/tese.md): "Qual é a ideia e como
// ela vai?". Creme, em duas colunas no computador, como o topo do /asset:
//  - à esquerda o eyebrow com o corte (o link de volta para /teses e o tema),
//    o H1 (o mesmo texto de antes), a frase da tese como lead, a linha de
//    selos de raio 8 (convicção em azul, retorno em verde ou vermelho pelo
//    sinal, ativos em carvão, a última revalidação em contorno) e as ações;
//  - à direita o cartão carvão com a faixa da marca, "A TESE DESDE <mês/ano>",
//    com o número grande da tese, o do Ibovespa ao lado e o gráfico de
//    desempenho que a tela já tinha (mesma série, mesmos números).
// A imagem de capa saiu do topo (fica nos cartões da /teses). Tudo o que era
// dito na seção "A tese em números" continua aqui: os dois retornos na
// legenda, convicção e ativos nos selos, lançamento e fontes no pé do cartão.
import type { TeseHeroVM, TeseNumbersVM } from '~/types/tese'

const props = defineProps<{
  hero: TeseHeroVM
  numbers: TeseNumbersVM | null
  slug: string
  /** 'set 2025' — o mês do lançamento */
  launchLabel: string | null
  following: boolean
  pending: boolean
}>()
const emit = defineEmits<{ acompanhar: []; perguntar: [] }>()

const titulo = computed(() => `${props.hero.titlePre}${props.hero.titleHi}${props.hero.titlePost}`)
// 'set 2025' → 'set/2025' (o selo e a aba da faixa)
const desde = computed(() => props.launchLabel?.trim().replace(/\s+/, '/') ?? '')

// os selos dizem o mesmo que os badges de antes, na voz da Aportou
const seloConviccao = computed(() => props.hero.convBadge?.replace('/100', ' de 100') ?? null)
const seloRetorno = computed(() => {
  const s = props.hero.sinceBadge
  if (!s) return null
  return { texto: desde.value ? s.replace('desde o lançamento', `desde ${desde.value}`) : s, queda: /^[-−]/.test(s.trim()) }
})

// as linhas de "A tese em números": as duas primeiras viram a legenda do
// gráfico; convicção e ativos já estão nos selos; o resto vai ao pé do cartão
const linha = (rotulo: string) => props.numbers?.stats.find((r) => r.l === rotulo) ?? null
const daTese = computed(() => linha('Desde o lançamento'))
const doIbov = computed(() => linha('IBOV no período'))
const pe = computed(() => (props.numbers?.stats ?? []).filter((r) => !['Desde o lançamento', 'IBOV no período', 'Convicção', 'Ativos'].includes(r.l)))
const queda = computed(() => /^[-−]/.test(daTese.value?.v ?? ''))
const rotuloFaixa = computed(() => (desde.value ? `A tese desde ${desde.value}` : 'A tese desde o lançamento'))
</script>

<template>
  <section
    v-contexto-chat="{ id: `tese:${slug}`, tipo: 'tese', rotulo: rotuloCurto(`Tese · ${titulo}`.replace(/\s+/g, ' ')) }"
    class="tto" :class="{ 'tto--so': !numbers }" aria-labelledby="tto-h1"
  >
    <div class="tto__grade">
      <div class="tto__texto">
        <p class="nu-eyebrow tto__eyebrow">
          <MarcaCorte />
          <span><NuxtLink to="/teses" class="tto__volta">Teses</NuxtLink><span aria-hidden="true"> · </span>{{ hero.cat }}</span>
        </p>
        <h1 id="tto-h1" class="tto__h1">{{ hero.titlePre }}<span v-if="hero.titleHi" class="tto__hi">{{ hero.titleHi }}</span>{{ hero.titlePost }}</h1>
        <p class="tto__lead">{{ hero.subtitle }}</p>
        <div class="tto__selos">
          <NuSelo v-if="seloConviccao" tom="azul">{{ seloConviccao }}</NuSelo>
          <NuSelo v-if="seloRetorno" :tom="seloRetorno.queda ? 'vermelho' : 'verde'">{{ seloRetorno.texto }}</NuSelo>
          <NuSelo tom="carvao">{{ hero.ativosBadge }}</NuSelo>
          <NuSelo v-if="hero.revalBadge" tom="contorno">{{ hero.revalBadge }}</NuSelo>
        </div>
        <div class="tto__acoes">
          <NuBotaoSeta
            :variante="following ? 'contorno' : 'azul'" tamanho="m" :aria-pressed="following" :aria-busy="pending || undefined"
            @click="emit('acompanhar')"
          >{{ following ? 'Acompanhando' : 'Acompanhar esta tese' }}</NuBotaoSeta>
          <button type="button" class="tto__ia" @click="emit('perguntar')">
            <MarcaCorte :largura="20" cor="var(--nu-blue-on-dark)" />Perguntar à IA
          </button>
        </div>
      </div>

      <div v-if="numbers" class="tto__palco">
        <NuFaixaMarca :rotulo="rotuloFaixa" :altura="56" class="tto__cartao">
          <p class="tto__legenda">
            <span v-if="daTese" class="tto__leg tto__leg--1">
              <b :class="queda ? 'tto__leg--down' : 'tto__leg--up'">{{ daTese.v }}</b>
              <span class="tto__leg-r"><i class="tto__traco" aria-hidden="true" />Tese</span>
            </span>
            <span v-if="doIbov" class="tto__leg">
              <b>{{ doIbov.v }}</b>
              <span class="tto__leg-r"><i class="tto__traco tto__traco--ibov" aria-hidden="true" />IBOV</span>
            </span>
          </p>
          <div class="tto__grafico">
            <NuPerformanceChart
              :series="numbers.chart.series"
              :benchmark="numbers.chart.benchmark"
              :labels="numbers.chart.labels"
              :pill-value="numbers.chart.pillValue"
              benchmark-name="IBOV"
              pill-label="Tese hoje"
            />
          </div>
          <dl v-if="pe.length" class="tto__pe">
            <div v-for="r in pe" :key="r.l" class="tto__pe-i"><dt>{{ r.l }}</dt><dd>{{ r.v }}</dd></div>
          </dl>
        </NuFaixaMarca>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tto {
  --g: clamp(20px, 4vw, 56px);
  padding: clamp(32px, 4vw, 60px) var(--g) clamp(40px, 4.6vw, 68px);
  background: var(--nu-page); color: var(--nu-ink);
}
.tto__grade { max-width: 1240px; margin: 0 auto; display: grid; grid-template-columns: minmax(0, 1fr); row-gap: clamp(28px, 3.4vw, 40px); }
.tto__texto { min-width: 0; animation: nu-fade .5s ease both; }

.tto__eyebrow { margin: 0; }
.tto__volta {
  /* a área de toque tem 44px sem mexer na linha do eyebrow */
  display: inline-block; padding: 14px 0; margin: -14px 0;
  color: inherit; text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1.5px;
  text-decoration-color: var(--nu-line); transition: text-decoration-color .2s ease, color .2s ease;
}
.tto__volta:hover { color: var(--nu-blue-text); text-decoration-color: currentColor; }
.tto__h1 {
  margin: 20px 0 0; font-size: clamp(42px, 5vw, 72px); font-weight: var(--nu-w-display);
  letter-spacing: -0.035em; line-height: .98; text-wrap: balance;
}
.tto__hi { color: var(--nu-blue-text); }
.tto__lead {
  margin: 20px 0 0; max-width: 34ch; color: var(--nu-gray-3);
  font-size: clamp(18px, 1.5vw, 21px); font-weight: 500; line-height: 1.45; text-wrap: pretty;
}
.tto__selos { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 26px; }
.tto__acoes { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 28px; }
/* a pílula carvão da IA, com o corte */
.tto__ia {
  display: inline-flex; align-items: center; gap: 10px; min-height: 52px; padding: 0 24px; border: 0; border-radius: var(--nu-r-pill);
  background: var(--nu-ink); color: var(--nu-white); font: inherit; font-size: 16.5px; font-weight: var(--nu-w-medio); white-space: nowrap; cursor: pointer;
  transition: background .2s, transform .15s var(--nu-ease-saida);
}
.tto__ia:hover { background: var(--nu-ink-hover); }
.tto__ia:active { transform: scale(.98); }

/* o cartão do gráfico: carvão, com a faixa da marca */
.tto__palco { min-width: 0; animation: nu-fade .5s ease .1s both; }
.tto__cartao { --pad: clamp(18px, 2.2vw, 30px); padding-bottom: clamp(16px, 2vw, 22px); overflow: hidden; }
.tto__legenda { display: flex; align-items: baseline; gap: 6px 28px; flex-wrap: wrap; margin: clamp(18px, 2vw, 26px) var(--pad) 0; }
.tto__leg { display: inline-flex; align-items: baseline; gap: 10px; }
.tto__leg b { color: var(--nu-white); font-size: clamp(20px, 2vw, 26px); font-weight: var(--nu-w-forte); letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.tto__leg--1 b { font-size: clamp(38px, 4.4vw, 58px); letter-spacing: -0.04em; line-height: 1; }
.tto__leg b.tto__leg--up { color: var(--nu-green-soft); }
.tto__leg b.tto__leg--down { color: var(--nu-red-soft); }
.tto__leg-r { display: inline-flex; align-items: center; gap: 7px; color: var(--nu-on-dark-2); font-size: var(--nu-fs-sm); font-weight: 600; }
.tto__traco { width: 16px; height: 3px; border-radius: 2px; background: var(--nu-blue-on-dark); }
.tto__traco--ibov { height: 0; border-radius: 0; background: none; border-top: 2px dashed var(--nu-on-dark-2); }
.tto__grafico { position: relative; height: clamp(220px, 23vw, 320px); margin-top: 14px; }
.tto__pe {
  display: flex; flex-wrap: wrap; gap: 4px 28px; margin: 16px var(--pad) 0; padding-top: 14px;
  border-top: 1px solid var(--nu-dark-line);
}
.tto__pe-i { display: inline-flex; align-items: baseline; gap: 8px; }
.tto__pe dt { color: var(--nu-on-dark-2); font-size: var(--nu-fs-sm); font-weight: 500; }
.tto__pe dd { margin: 0; color: var(--nu-white); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums; }

/* duas colunas: a ideia à esquerda, o cartão do gráfico à direita */
@media (min-width: 1080px) {
  .tto__grade { grid-template-columns: minmax(0, .86fr) minmax(0, 1.14fr); column-gap: clamp(36px, 4.4vw, 72px); align-items: center; }
  .tto__grafico { height: clamp(260px, 24vw, 340px); }
  /* sem série de desempenho o topo é uma coluna só, larga */
  .tto--so .tto__grade { grid-template-columns: minmax(0, 1fr); }
  .tto--so .tto__h1 { max-width: 16ch; }
  .tto--so .tto__lead { max-width: 52ch; }
}
@media (max-width: 480px) {
  .tto__acoes { flex-direction: column; align-items: stretch; }
  .tto__acoes :deep(.nbs) { display: flex; width: 100%; }
  .tto__ia { justify-content: center; }
}
@media (prefers-reduced-motion: reduce) {
  .tto__texto, .tto__palco { animation: none; }
  .tto__ia { transition: none; }
}
</style>
