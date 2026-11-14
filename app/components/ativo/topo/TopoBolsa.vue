<script setup lang="ts">
// O topo do /asset. Nasceu "A bolsa no bolso" (03/11/2026, a escolha do dono
// entre três topos com cara de app): um céu escuro de borda a borda, o preço
// fino e grande. Em 11/11/2026 a Redentia de investidor virou APORTOU e o topo
// trocou de roupa, sem trocar de conteúdo (docs/aportou/contrato.md, o
// meio-termo): a página é creme; o papel leva o código numa etiqueta carvão; a
// cotação é o número-herói em 800, com o "R$" pequeno e elevado; a variação do
// dia é um selo de raio 8 (verde ou vermelho); e o gráfico mora no cartão
// carvão com a faixa da marca (NuFaixaMarca), o rótulo do período na aba e o
// seletor à direita dela. Os números em fila viraram o cartão creme de dados.
// No desktop são duas colunas (o papel e o preço à esquerda, o cartão do
// gráfico à direita); a ordem no HTML é a mesma de antes.
// O que NÃO mudou: o H1 (mesmo texto, mesmo nível), o H2 do gráfico (agora o
// rótulo da faixa, sem o ponto final), o preço que acompanha a mira quando o
// dedo (ou o mouse) passa no gráfico, os números, as perguntas prontas e o
// link do simulador. O céu escuro continua existindo no topo da /carteira
// (CarteiraAgora), que segue usando topo-noite.css; este componente tem o
// estilo próprio desde a troca.
// A linha se desenhando é Web Animations, uma vez no mount, só com a aba
// visível, o gráfico na tela e sem pedido de menos movimento (a lição do
// /benchmark-ia: nada espera o observador para existir).
// Robustez (11/11/2026): o código, a bolsa, a posição e a variação do dia são
// o NuSelo da base (a variação no tamanho do herói); o topo entra em cascata
// de 60ms na curva e no tempo dos tokens; o número grande e o maior da legenda
// no peso de exibição; os números do gráfico em fileiras de rótulo em cima e
// valor embaixo (o rótulo não quebra mais ao lado do valor); e o simulador é
// o link com seta (NuLinkSeta). A linha se desenha no tempo dos tokens.
// Pelo maximizar da janelinha (12/11/2026): a capa (EspiarCapa) já mostrou o
// nome, o preço, as ações e o cartão no lugar deles, com a linha se
// desenhando; a página que chega por baixo dela não refaz a entrada desses
// blocos nem o desenho (capaDoMaximizar), e a troca é só o fade da capa. Os
// números e o pé, que a capa não tem, entram como sempre. Só no cliente: o
// HTML do servidor é o mesmo.
import type { AcaoPayload, AcaoRange, AcaoSeriesPair, AcaoStatRow } from '~/types/acao'
import type { AcaoPosition } from '~/composables/useAcao'
import type { LeituraDoGrafico, LegendaItem } from '~/utils/ativoDirecoes'
import type { ValorContextoChat } from '~/utils/contexto-chat-registro'
import { PERIODOS_DO_GRAFICO as PERIODOS } from '~/composables/useAtivoDirecao'
import TopoAcoes from './TopoAcoes.vue'
import TopoPreco from './TopoPreco.vue'

const props = defineProps<{
  a: AcaoPayload
  t: string
  series: AcaoSeriesPair | null
  range: AcaoRange
  rangeLoading: boolean
  position: AcaoPosition | null
  renamedFrom: string | null
  seguivel: boolean
  tituloGrafico: string
  legenda: LegendaItem[]
  linhas: AcaoStatRow[]
  perguntas: string[]
  /** o ativo e o gráfico como contexto do chat (v-contexto-chat) */
  contexto: ValorContextoChat
  contextoGrafico: ValorContextoChat
}>()
const emit = defineEmits<{ periodo: [AcaoRange]; perguntar: [string]; abrir: [] }>()
// o seletor do período (NuTrilho, PERIODOS_DO_GRAFICO): '12M' à vista, '12 meses' para o leitor de tela
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const leitura = ref<LeituraDoGrafico | null>(null)
const logoFalhou = ref(false)
const preco = computed(() => leitura.value?.preco ?? props.a.hero.priceFmt)
// "R$ 45,36" → a moeda pequena e elevada + o número (o TopoPreco anima só as casas)
const partes = computed(() => {
  const m = preco.value.match(/^([A-Z]{0,2}\$)\s*(.+)$/)
  return m ? { moeda: m[1]!, numero: m[2]! } : { moeda: '', numero: preco.value }
})
// o nome sem o código: o código vai na etiqueta carvão ao lado
const nome = computed(() => props.a.hero.companyLine.replace(` · ${props.t}`, ''))
// o rótulo da faixa da marca: o título do gráfico sem o ponto final (vai em caixa alta)
const rotuloFaixa = computed(() => props.tituloGrafico.replace(/\.$/, ''))
// o tom do selo pela direção (sem direção, o selo neutro)
const tomDe = (dir: string | null | undefined) => (dir === 'down' ? 'vermelho' : dir === 'up' ? 'verde' : 'neutro')

const palco = ref<HTMLElement | null>(null)
// chegou por baixo da capa do maximizar: ela já fez a entrada e o desenho
const daCapa = import.meta.client && capaDoMaximizar()
onMounted(() => {
  const el = palco.value
  if (daCapa || !el || document.visibilityState !== 'visible' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const r = el.getBoundingClientRect()
  if (r.top >= window.innerHeight || r.bottom <= 0) return
  // a curva e os tempos vêm dos tokens (var() não vale numa Web Animation: lê o valor calculado)
  const css = getComputedStyle(document.documentElement)
  const ms = (nome: string, padrao: number) => parseFloat(css.getPropertyValue(nome)) || padrao
  const curva = css.getPropertyValue('--nu-ease-saida').trim() || 'ease-out'
  const desenho = ms('--nu-dur-entrada', 720) * 2
  el.querySelector('.agr__svg')?.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: desenho, delay: 120, easing: curva, fill: 'backwards' })
  el.querySelectorAll('.agr__fim, .agr__hoje').forEach((x) => x.animate([{ opacity: 0, translate: '0 4px' }, { opacity: 1, translate: '0 0' }], { duration: ms('--nu-dur-lenta', 520), delay: desenho - 160, easing: curva, fill: 'backwards' }))
})
</script>

<template>
  <section v-contexto-chat="contexto" class="tbo" :class="{ 'tbo--da-capa': daCapa }" aria-labelledby="tbo-h1">
    <p v-if="renamedFrom" class="tbo__trocou">{{ renamedFrom }} agora negocia como {{ t }}.</p>
    <div class="tbo__grade">
      <div class="tbo__id">
        <img v-if="a.hero.logo && !logoFalhou" :src="a.hero.logo" alt="" width="40" height="40" class="tbo__logo" @error="logoFalhou = true">
        <div class="tbo__quem">
          <p class="tbo__empresa">
            <span class="tbo__nome">{{ nome }}</span>
            <NuSelo tom="carvao">{{ t }}</NuSelo>
            <NuSelo tom="contorno">{{ a.hero.exchangeLabel || 'B3' }}</NuSelo>
          </p>
          <h1 v-if="a.resumo" id="tbo-h1" class="tbo__h1">{{ a.resumo.h1 }}</h1>
        </div>
        <NuSelo v-if="position" tom="azul" ponto>Na sua carteira · {{ nf0.format(position.qty) }} {{ position.qty === 1 ? 'cota' : 'cotas' }}</NuSelo>
      </div>

      <div class="tbo__preco-linha">
        <p class="tbo__preco" :class="{ 'tbo__preco--longo': partes.numero.length > 8 }">
          <span v-if="partes.moeda" class="tbo__moeda">{{ partes.moeda }}</span><TopoPreco :valor="partes.numero" />
        </p>
        <p class="tbo__dia">
          <template v-if="leitura">
            <NuSelo :tom="tomDe(leitura.dir)" class="tbo__selo">{{ leitura.medida ? `${leitura.delta} (${leitura.var})` : leitura.var }}</NuSelo>
            <span class="tbo__meta">{{ leitura.medida ? `de ${leitura.de} a ${leitura.data}` : `em ${leitura.data}, desde o início do período` }}</span>
          </template>
          <template v-else>
            <NuSelo v-if="a.hero.changeLine" :tom="tomDe(a.hero.dir)" class="tbo__selo" :class="{ 'tbo__selo--queda': a.hero.dir === 'down' }">
              <svg class="tbo__seta" width="11" height="10" viewBox="0 0 11 10" aria-hidden="true"><path d="M5.5 0 11 10H0Z" /></svg>{{ a.hero.changeLine }}
            </NuSelo>
            <span v-if="a.hero.metaLine" class="tbo__meta">{{ a.hero.metaLine }}</span>
          </template>
        </p>
      </div>

      <TopoAcoes :ticker="t" :seguivel="seguivel" tom="claro" class="tbo__acoes" @perguntar="emit('abrir')" />

      <div v-if="series" ref="palco" v-contexto-chat="contextoGrafico" class="tbo__palco">
        <NuFaixaMarca :rotulo="rotuloFaixa" :altura="56" class="tbo__cartao">
          <template #acoes>
            <NuTrilho :opcoes="PERIODOS" :model-value="range" :ocupado="rangeLoading" tom="escuro" tamanho="p" rotulo="Período do gráfico" class="tbo__seg" @update:model-value="emit('periodo', $event)" />
          </template>
          <p v-if="legenda.length" class="tbo__legenda">
            <span v-for="(l, i) in legenda" :key="l.rotulo" class="tbo__leg" :class="{ 'tbo__leg--1': i === 0 }">
              <b :class="l.dir ? `tbo__leg--${l.dir}` : ''">{{ l.pct }}</b>
              <span class="tbo__leg-r"><i class="tbo__traco" :class="{ 'tbo__traco--ibov': l.rotulo === 'IBOV' }" aria-hidden="true" />{{ l.rotulo }}</span>
            </span>
          </p>
          <div class="tbo__grafico">
            <AtivoGrafico :ativo="series.asset" :ibov="series.ibov" :ticker="t" :atual="a.hero.priceFmt" :rotulo="tituloGrafico" tom="luz" :carregando="rangeLoading" @leitura="leitura = $event" />
          </div>
          <NuTrilho :opcoes="PERIODOS" :model-value="range" :ocupado="rangeLoading" tom="escuro" largo rotulo="Período do gráfico" class="tbo__periodo" @update:model-value="emit('periodo', $event)" />
          <p class="tbo__uso" aria-hidden="true">Passe o cursor para ler um dia; arraste para medir entre dois.</p>
        </NuFaixaMarca>
      </div>

      <dl v-if="linhas.length" class="tbo__nums">
        <div v-for="r in linhas" :key="r.l" v-contexto-chat="{ id: `linha:${t}:${r.l}`, tipo: 'grafico', rotulo: rotuloComSobre(r.l, t), texto: `${r.l} (${t}): ${r.v}` }" class="tbo__num">
          <dt>{{ r.l }}</dt><dd>{{ r.v }}</dd>
        </div>
      </dl>
      <div class="tbo__pe">
        <AtivoPerguntaChips :perguntas="perguntas" tom="claro" :rotulo="null" @perguntar="emit('perguntar', $event)" />
        <p v-if="a.simuladorHref" class="tbo__sim">
          <NuLinkSeta :to="a.simuladorHref" tom="tinta">Simulador de ações</NuLinkSeta>
          <span class="tbo__sim-t">Quanto {{ t }} teria rendido com dividendos reinvestidos, no histórico real da B3.</span>
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* O topo creme da Aportou (11/11/2026). O céu escuro de antes ficou em
   topo-noite.css, que a /carteira ainda usa. */
.tbo {
  --g: clamp(20px, 4vw, 56px);
  padding: clamp(28px, 3.4vw, 48px) var(--g) clamp(28px, 3.4vw, 48px);
  background: var(--nu-page); color: var(--nu-ink);
}
.tbo__trocou { max-width: 1240px; margin: 0 auto 16px; color: var(--nu-gray); font-size: 13.5px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); }
.tbo__grade {
  max-width: 1240px; margin: 0 auto; display: grid; grid-template-columns: minmax(0, 1fr);
  grid-template-areas: "id" "preco" "acoes" "palco" "nums" "pe"; row-gap: clamp(20px, 2.4vw, 28px);
}
/* a entrada do topo: cada bloco sobe com fade, em cascata de 60ms (tokens de entrada) */
.tbo__id, .tbo__preco-linha, .tbo__acoes, .tbo__palco, .tbo__nums, .tbo__pe { animation: nu-fade var(--nu-dur-entrada) var(--nu-ease-saida) both; }
/* por baixo da capa do maximizar: o que ela já mostrou fica parado no lugar (a troca é o fade dela) */
.tbo--da-capa .tbo__id, .tbo--da-capa .tbo__preco-linha, .tbo--da-capa .tbo__acoes, .tbo--da-capa .tbo__palco { animation: none; }
.tbo__id { grid-area: id; display: flex; align-items: center; gap: 12px 14px; flex-wrap: wrap; min-width: 0; }
.tbo__logo { width: 40px; height: 40px; border-radius: var(--nu-r-chip); background: var(--nu-white); object-fit: cover; box-shadow: var(--nu-shadow-branco); }
.tbo__quem { min-width: 0; }
.tbo__empresa { margin: 0; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.tbo__nome { margin-right: 4px; font-size: clamp(24px, 2.6vw, 34px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); line-height: 1.1; }
.tbo__h1 { margin: 8px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.4; }

/* a cotação: o número-herói da marca, com a moeda pequena e elevada */
.tbo__preco-linha { grid-area: preco; animation-delay: var(--nu-passo-cascata); }
.tbo__preco { margin: 0; display: flex; align-items: flex-start; gap: .08em; font-size: clamp(64px, 17vw, 132px); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: .92; }
.tbo__preco--longo { font-size: clamp(44px, 11.5vw, 92px); }
/* cada casa do TopoPreco corta o que sai da caixa (é o que esconde o dígito que troca); com a
   letra apertada do número-herói o desenho passa da caixa: a folga volta por dentro */
.tbo__preco :deep(.tpr__casa) { padding: .1em .05em; margin: -.1em -.05em; }
.tbo__moeda { margin-top: .16em; font-size: .36em; letter-spacing: var(--nu-ls-titulo); line-height: 1; }
.tbo__dia { display: flex; align-items: center; gap: 8px 12px; flex-wrap: wrap; min-height: 36px; margin: 16px 0 0; font-variant-numeric: tabular-nums; }
/* a variação do dia: o NuSelo verde ou vermelho no tamanho do herói (a classe vence a caixa do selo) */
.tbo__selo { height: 36px; padding: 0 12px; gap: 8px; font-size: var(--nu-fs-md); }
.tbo__seta { flex: none; fill: currentColor; }
.tbo__selo--queda .tbo__seta { transform: rotate(180deg); }
.tbo__meta { color: var(--nu-gray); font-size: 13.5px; font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); }

.tbo__acoes { grid-area: acoes; animation-delay: calc(var(--nu-passo-cascata) * 2); }

/* o cartão do gráfico: carvão, com a faixa da marca e o período à direita dela */
.tbo__palco { grid-area: palco; min-width: 0; animation-delay: calc(var(--nu-passo-cascata) * 2); }
.tbo__cartao { --pad: clamp(18px, 2.2vw, 30px); padding-bottom: clamp(16px, 2vw, 24px); }
/* o período (NuTrilho escuro, a pílula creme que desliza) centrado na altura da aba de 56px */
.tbo__cartao :deep(.nfm__acoes) { padding: 6px 10px 0 0; }
.tbo__legenda { display: flex; align-items: baseline; gap: 6px 28px; flex-wrap: wrap; margin: clamp(18px, 2vw, 26px) var(--pad) 0; }
.tbo__leg { display: inline-flex; align-items: baseline; gap: 10px; }
.tbo__leg b { color: var(--nu-white); font-size: clamp(20px, 2vw, 26px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); font-variant-numeric: tabular-nums; }
/* o número grande da legenda é número-herói: peso de exibição */
.tbo__leg--1 b { font-size: clamp(38px, 4.4vw, 58px); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 1; }
.tbo__leg b.tbo__leg--up { color: var(--nu-green-soft); }
.tbo__leg b.tbo__leg--down { color: var(--nu-red-soft); }
.tbo__leg-r { display: inline-flex; align-items: center; gap: 8px; color: var(--nu-on-dark-2); font-size: 13.5px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); }
.tbo__traco { width: 14px; height: 2px; border-radius: 1px; background: var(--nu-blue-on-dark); }
.tbo__traco--ibov { background: repeating-linear-gradient(90deg, var(--nu-white-35) 0 3px, transparent 3px 7px); }
/* o gráfico vai de beira a beira do cartão; o ponto de hoje, o halo e o rótulo
   recuam (no mínimo 44px), os rótulos das marcas começam na margem do texto */
.tbo__grafico {
  position: relative; height: clamp(220px, 23vw, 320px); margin-top: 14px;
  --agr-esq: var(--pad); --agr-dir: max(var(--pad), 44px); --agr-rotulo-esq: var(--pad);
  --agr-hoje-bg: var(--nu-creme); --agr-hoje-fg: var(--nu-ink); --agr-hoje-sub: var(--nu-gray);
}
/* no celular o período desce para baixo do gráfico, largo */
.tbo__periodo { display: none; margin: 16px var(--pad) 0; }
.tbo__uso { margin: 12px var(--pad) 0; color: var(--nu-on-dark-2); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); }
@media (hover: none) { .tbo__uso { display: none; } }

/* os números do gráfico: o cartão creme de dados, com fios de 1px. Cada número
   é uma fileira de rótulo pequeno em cima e valor embaixo (como no celular):
   em duas colunas, o rótulo comprido ("Valor de Mercado") não quebra mais ao
   lado do valor */
.tbo__nums {
  grid-area: nums; margin: 0; padding: 0 24px; border-radius: var(--nu-r-panel); overflow: hidden;
  background: var(--nu-card); box-shadow: var(--nu-shadow-quente);
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr)); column-gap: 32px;
  animation-delay: calc(var(--nu-passo-cascata) * 3);
}
/* o fio fica em cima de cada fileira; o da primeira some no corte do cartão */
.tbo__num { display: flex; flex-direction: column; gap: 4px; min-width: 0; margin-top: -1px; padding: 14px 0 15px; border-top: 1px solid var(--nu-line-2); }
.tbo__num dt { color: var(--nu-gray); font-size: 13px; font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.3; }
.tbo__num dd { margin: 0; color: var(--nu-ink); font-size: 17px; font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); line-height: 1.25; font-variant-numeric: tabular-nums; white-space: nowrap; }

.tbo__pe { grid-area: pe; display: flex; justify-content: space-between; align-items: center; gap: 16px 32px; flex-wrap: wrap; animation-delay: calc(var(--nu-passo-cascata) * 4); }
.tbo__sim { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.5; }
.tbo__sim-t { margin-left: 10px; }

/* duas colunas: o papel e o preço à esquerda, o cartão do gráfico à direita */
@media (min-width: 1080px) {
  .tbo__grade {
    grid-template-columns: minmax(0, .82fr) minmax(0, 1.18fr); column-gap: clamp(36px, 4.4vw, 72px);
    grid-template-areas: "id palco" "preco palco" "acoes palco" "nums palco" "pe pe"; grid-template-rows: auto auto auto 1fr auto;
  }
  .tbo__preco { font-size: clamp(84px, 8.4vw, 132px); }
  .tbo__preco--longo { font-size: clamp(52px, 5.2vw, 84px); }
  /* três colunas: o cartão fica baixo e termina junto com o do gráfico; com quatro números, duas */
  .tbo__nums { align-self: end; grid-template-columns: repeat(3, minmax(0, 1fr)); column-gap: 24px; }
  .tbo__nums:has(> :nth-child(4):last-child), .tbo__nums:not(:has(> :nth-child(3))) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .tbo__grafico { height: clamp(260px, 25vw, 372px); }
}
@media (max-width: 760px) {
  /* no celular o período desce para baixo do gráfico, largo, como era */
  .tbo__cartao :deep(.nfm__acoes) { display: none; }
  .tbo__periodo { display: flex; }
}
@media (max-width: 480px) {
  .tbo__nums { grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 16px; padding: 0 20px; }
}
@media (prefers-reduced-motion: reduce) {
  .tbo__id, .tbo__preco-linha, .tbo__acoes, .tbo__palco, .tbo__nums, .tbo__pe { animation: none; }
}
</style>
