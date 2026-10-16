<script setup lang="ts">
// /benchmark-ia — Ranking de IAs em finanças (Benchmark de IA da Redentia).
//
// Dividida em faixas como as outras páginas da casa (dono, 16/10, no lugar do
// menu lateral do OpenRouter): topo navy com título e números da edição, depois
// uma faixa por seção alternando branco e creme, cada uma com eyebrow, título,
// uma frase, o gráfico e, quando cabe, a lista em duas colunas; no fim, "Como
// medimos" em prosa. A navegação é a faixa de seções do topo (useSectionRail),
// a mesma da /carteira, no lugar das cotações.
//
// O placar só mostra edição publicada (content/benchmark-ia/edicoes). Índice
// fora da edição não vira caixa vazia no meio da página: todos os que ainda
// não têm resultado vão juntos para "Próximos índices", com o que falta para
// cada um (revisão de UX, 16/10). Sem edição nenhuma, só esse bloco e o
// método; no dev server, a prévia fictícia com modelos anônimos ("Modelo A"…),
// sem linha de aviso na tela a pedido do dono (15/10). Ela nunca chega à
// produção: o composable só a devolve com import.meta.dev.
// Indexável com edição real; sem edição (ou na prévia do dev), noindex.
import { BENCH_CHART_INFO as INFO, BENCH_DISCLAIMER, BENCH_INDICES, benchComoMedimos } from '~/content/benchmark-ia/metodologia'
import type { BenchColumnItem, BenchHeroStat, BenchIndexId, BenchRankingRow, BenchRodadaMarco } from '~/types/benchmark'

// a Carteira própria anda todo pregão: a série vem do backend e cobre a da edição
const { edition, isPreview, ranked, modelById } = useBenchmarkIa(await useBenchCarteiraViva())
const method = (id: BenchIndexId) => BENCH_INDICES.find((m) => m.id === id)!

/* ——— linhas ranqueadas ——— */
function rows(list: { id: string; value: number; lo: number; hi: number; extra?: string }[]): BenchRankingRow[] {
  return rankByScore(list).map((r) => ({ ...r, name: modelById(r.id)?.name ?? r.id, provider: modelById(r.id)?.provider ?? '' }))
}
const cols = (r: BenchRankingRow[] | null): BenchColumnItem[] =>
  (r ?? []).map((x) => ({ id: x.id, label: x.name, value: x.value, lo: x.lo, hi: x.hi, rank: x.rank, tied: x.tied }))
const labRows = (id: BenchIndexId, extra?: (modelId: string) => string | undefined) => {
  const list = ranked.filter((r) => r.byIndex[id]).map((r) => ({ id: r.model.id, ...r.byIndex[id]!, extra: extra?.(r.model.id) }))
  return list.length ? rows(list) : null
}
const part = (stack: { rows: { modelId: string; parts: number[] }[] } | undefined, id: string, i: number) =>
  stack?.rows.find((r) => r.modelId === id)?.parts[i]

const geral = ranked.length ? rows(ranked.map((r) => ({ id: r.model.id, ...r.overall }))) : null
const inventa = labRows('inventa', (id) => { const v = part(edition?.inventa, id, 2); return v != null ? `inventou ${v}%` : undefined })
const amem = labRows('amem', (id) => { const v = part(edition?.amem, id, 2); return v != null ? `concordou ${v}%` : undefined })
const golpe = labRows('golpe', (id) => {
  const v = edition?.golpe?.find((g) => g.modelId === id)?.falseAlarm
  return v != null ? `alarme falso ${fmtBench.pct(v)}` : undefined
})
const leao = labRows('leao')
// Carteira: a posição sai do excesso sobre o Ibovespa, em pontos percentuais;
// o retorno total (o número da pílula no fim da linha) vai embaixo, para a
// lista e o gráfico nunca mostrarem dois números diferentes sem nome
// e a maior queda no caminho (do pico ao vale, sobre o valor da carteira)
function maiorQueda(values: number[]): number {
  let pico = 1
  let pior = 0
  for (const v of values) {
    const x = 1 + v / 100
    pico = Math.max(pico, x)
    pior = Math.min(pior, x / pico - 1)
  }
  return pior * 100
}
const longo = edition?.longo
  ? rows(edition.longo.series.map((s) => {
      const total = s.values.at(-1) ?? 0
      const v = total - (edition.longo!.ibov.at(-1) ?? 0)
      const queda = maiorQueda(s.values)
      return { id: s.modelId, value: v, lo: v, hi: v, extra: `${fmtBench.signedPct(total)} no total\n${queda < -0.05 ? `maior queda de ${fmtBench.pct(-queda)}` : 'sem queda'}` }
    }))
  : null
const longoAte = edition?.longo?.atualizadoEm ? new Date(`${edition.longo.atualizadoEm}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : ''
// marco do começo da arena: "Começou hoje" no dia em que as carteiras foram
// montadas, depois a data. O 1º rótulo de data ("16 out") é o dia da 1ª rodada;
// o ano vem da última data da série (ou da edição)
const MES_CURTO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const longoMarcos = (() => {
  const l = edition?.longo
  const m = /^(\d{1,2}) ([a-z]{3})$/.exec(l?.labels[1] ?? '')
  // (não chame de `ref`: a variável local esconde o auto-import do Vue no arquivo todo)
  const ultimo = l?.atualizadoEm ?? edition?.dateIso
  if (!l || !m || !ultimo) return []
  const mes = MES_CURTO.indexOf(m[2]!) + 1
  if (!mes) return []
  const ano = Number(ultimo.slice(0, 4)) - (mes > Number(ultimo.slice(5, 7)) ? 1 : 0)
  const iso = `${ano}-${String(mes).padStart(2, '0')}-${m[1]!.padStart(2, '0')}`
  const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
  return [{ i: 0, label: iso === hoje ? 'Começou hoje' : `Começou em ${iso.slice(8, 10)}/${iso.slice(5, 7)}` }]
})()
const longoNota = `Retorno total acumulado desde a primeira rodada, com proventos e custos${longoAte ? `, até o fechamento de ${longoAte}` : ''}. Na lista, a diferença para o Ibovespa.`
// em formação (menos rodadas que o mínimo do método): sem posição na lista, porque
// a diferença entre os modelos ainda é só o custo de montar a carteira
const longoFormacao = !!edition?.longo && edition.longo.sample < edition.longo.minSample
const curto = edition?.curto ? rows(edition.curto.rows.map((r) => ({ id: r.modelId, value: r.value, lo: r.lo, hi: r.hi }))) : null
// ninguém fora do acaso: a manchete da seção é essa, não dez "1º"
const curtoAcaso = !!curto && curto.every((r) => r.lo <= 0 && r.hi >= 0)
const custo = ranked.length
  ? [...ranked].sort((a, b) => a.model.costPer1k - b.model.costPer1k).map((r, i) => ({
      id: r.model.id, name: r.model.name, provider: r.model.provider,
      value: r.model.costPer1k, lo: r.model.costPer1k, hi: r.model.costPer1k,
      rank: i + 1, tied: false, extra: `nota geral ${fmtBench.one(r.overall.value)}`,
    }))
  : null

/* ——— cada índice tem sua forma (dono, 15/10: "varie mais nos gráficos") ——— */
const partsOf = (stack: { rows: { modelId: string; parts: number[] }[] } | undefined, id: string) =>
  stack?.rows.find((s) => s.modelId === id)?.parts ?? [0, 0, 0]
// Inventa número?: pílulas da carteira, na ordem da nota
const inventaPills = (inventa ?? []).map((r) => ({ ...r, parts: partsOf(edition?.inventa, r.id) }))
// Concorda com tudo?: cartões com anel (segurou) e o quanto concordou
const amemRings = (amem ?? []).map((r) => {
  const p = partsOf(edition?.amem, r.id)
  return { ...r, good: p[0] ?? 0, mid: p[1] ?? 0, bad: p[2] ?? 0 }
})
// Cai em golpes financeiros?: borboleta (golpes pegos x legítimas acusadas)
const golpeWings = (golpe ?? []).map((r) => {
  const g = edition?.golpe?.find((x) => x.modelId === r.id)
  return { ...r, caught: g?.caught ?? 0, falseAlarm: g?.falseAlarm ?? 0 }
})
// Sistema tributário brasileiro: blocos por tema, na ordem da nota
const leaoTiles = (leao ?? []).map((r) => ({ ...r, cells: edition?.leao?.rows.find((x) => x.modelId === r.id)?.cells ?? [] }))
// rótulos curtos das colunas no celular, na ordem dos blocos que o report.ts publica
const LEAO_SHORT = ['Div.', 'Aç.', 'DARF', 'FII', 'RF', 'Ext.', 'Nov.']
// Carteira própria: linha navy, pílulas na ordem do ranking
// rodadas mensais (da 2ª em diante; a 1ª é o "Começou") viram marco na linha do
// modelo: só quantas ordens ele executou, nunca o que comprou ou vendeu
const marcoRodada = (r: BenchRodadaMarco) => `Rodada ${r.n}: ${
  r.falhou ? 'não respondeu, carteira mantida'
  : r.alteracoes == null ? 'carteira revista'
  : r.alteracoes === 0 ? 'manteve a carteira'
  : `${r.alteracoes} ${r.alteracoes === 1 ? 'alteração' : 'alterações'}`}`
const longoSeries = (longo ?? []).map((r) => {
  const s = edition?.longo?.series.find((x) => x.modelId === r.id)
  return {
    id: r.id, name: r.name, values: s?.values ?? [],
    marcos: (s?.rodadas ?? []).filter((x) => x.n > 1).map((x) => ({ i: x.i, label: marcoRodada(x) })),
  }
})
const longoSel = ref(longoSeries[0]?.id ?? '')
// passar o mouse numa linha da lista mostra aquele modelo no gráfico só enquanto
// durar o hover (dono, 16/10); o clique (ou o toque, no celular) fixa a escolha
const longoHover = ref<string | null>(null)
// custo: o mesmo gesto na dispersão. Hover na lista (ou no ponto) acende o
// modelo; o clique na lista fixa o destaque, e clicar de novo solta
const custoHover = ref<string | null>(null)
// placar geral: o mesmo gesto nas colunas
const geralHover = ref<string | null>(null)
const geralPin = ref<string | null>(null)
const custoPin = ref<string | null>(null)
// Custo: dispersão custo x nota
const costPoints = ranked.map((r) => ({ id: r.model.id, name: r.model.name, cost: r.model.costPer1k, score: r.overall.value }))

const dados = edition?.inventaDados?.length
  ? {
      sem: edition.inventaDados.reduce((a, r) => a + r.semDados, 0) / edition.inventaDados.length,
      com: edition.inventaDados.reduce((a, r) => a + r.comDados, 0) / edition.inventaDados.length,
    }
  : null
const travou = edition?.amemControle?.length
  ? edition.amemControle.reduce((a, r) => a + r.travouControle, 0) / edition.amemControle.length
  : null

/* ——— índices: o que tem resultado vira seção; o resto vai para "Próximos índices" ——— */
type IndexSection = { id: BenchIndexId; label: string; icon: string; on: boolean; next: string }
const NOVA = edition ? 'Fora desta edição.' : 'Entra na primeira edição.'
const ARENA = 'Arena: começa na primeira rodada mensal e fica "em formação" até a sexta.'
const diaMes = (iso: string) => iso.slice(8, 10) + '/' + iso.slice(5, 7)
const st = edition?.curtoStatus
const CURTO_NEXT = st?.proximaCorrecao
  ? `${st.rodadas === 1 ? 'Primeira rodada feita' : `${st.rodadas} rodadas feitas`} em ${diaMes(st.primeira)}. A primeira nota sai depois do fechamento de ${diaMes(st.proximaCorrecao)}, quando completam 21 pregões.`
  : ARENA
const indices: IndexSection[] = [
  { id: 'inventa', label: method('inventa').name, icon: 'ghost', on: !!inventa, next: NOVA },
  { id: 'amem', label: method('amem').name, icon: 'hand', on: !!amem, next: NOVA },
  { id: 'golpe', label: method('golpe').name, icon: 'shield', on: !!golpe, next: edition ? NOVA : 'Em construção.' },
  { id: 'leao', label: method('leao').name, icon: 'receipt', on: !!leao, next: edition ? NOVA : 'Em construção.' },
  { id: 'longo', label: method('longo').name, icon: 'trend', on: !!longo, next: ARENA },
  { id: 'curto', label: method('curto').name, icon: 'zap', on: !!curto, next: CURTO_NEXT },
]
const shown = (id: BenchIndexId) => indices.find((x) => x.id === id)!.on
const proximos = indices.filter((x) => !x.on)

// o placar geral diz de quais laboratórios é a média
const nomes = (list: string[]) => (list.length < 2 ? list.join('') : `${list.slice(0, -1).join(', ')} e ${list.at(-1)}`)
const ponto = (s: string) => (/[?.!]$/.test(s) ? s : `${s}.`)
const labsDaMedia = indices
  .filter((x) => x.on && ['inventa', 'amem', 'golpe', 'leao'].includes(x.id) && !edition?.foraDoGeral?.includes(x.id))
  .map((x) => x.label)
// quem não completou uma prova que está fora da média (ex.: "Claude Fable 5.1")
const faltou = (id: BenchIndexId) => nomes((edition?.incompletos?.[id] ?? []).map((m) => modelById(m)?.name ?? m))
const geralDesc = ponto(`Média simples das notas de 0 a 100 nos laboratórios desta edição: ${nomes(labsDaMedia)}`)

/* ——— topo navy: até três números da edição, cada um leva à sua seção ——— */
const media = (stack: { rows: { parts: number[] }[] } | undefined, i: number) =>
  stack?.rows.length ? stack.rows.reduce((a, r) => a + (r.parts[i] ?? 0), 0) / stack.rows.length : null
const inventou = media(edition?.inventa, 2)
const concordou = media(edition?.amem, 2)
const lideres = geral?.filter((r) => r.rank === 1).length ?? 0
const heroStats: BenchHeroStat[] = [
  ...(inventou != null ? [{ id: 'inventa', value: inventou, format: 'pct' as const, label: 'das respostas foram inventadas, na média das IAs', tone: 'bad' as const }] : []),
  ...(concordou != null ? [{ id: 'amem', value: concordou, format: 'pct' as const, label: 'dos planos ruins ganharam um sim, na média', tone: 'bad' as const }] : []),
  ...(geral ? [{ id: 'geral', value: lideres, format: 'int' as const, label: lideres > 1 ? 'IAs empatadas no topo do placar' : 'IA sozinha no topo do placar', tone: 'good' as const }] : []),
]

/* ——— seções: a faixa do topo lista e leva a cada uma (useSectionRail, como na /carteira) ——— */
const railSections = [
  ...(geral ? [{ id: 'geral', label: 'Placar geral' }] : []),
  ...indices.filter((x) => x.on).map((x) => ({ id: x.id, label: x.label })),
  ...(custo ? [{ id: 'custo', label: 'Custo por mil respostas' }] : []),
  ...(proximos.length ? [{ id: 'proximos', label: 'Próximos índices' }] : []),
  { id: 'metodologia', label: 'Como medimos' },
]
useSectionRail(railSections, { pageLabel: 'Ranking de IAs' })

function go(id: string) {
  scrollToRailSection(id)
  history.replaceState(null, '', `#${id}`)
}

// linha de frescor, curta como o "Usage data through…" do OpenRouter. Na
// prévia do dev não sai nada (dono, 15/10: "pode tirar esse texto").
const dataBR = edition ? new Date(`${edition.dateIso}T12:00:00`).toLocaleDateString('pt-BR') : ''
const fresh = !edition
  ? 'Primeira edição em breve. O método já está publicado no fim da página.'
  : isPreview ? null : `Dados da ${edition.label}, de ${dataBR}.`
// conta aberta: o custo total da edição sai na seção de custo
const custoDesc = `Quanto cada modelo custou, em dólar, a cada mil respostas desta edição. Menor é melhor.${edition && !isPreview ? ` A edição inteira custou ${fmtBench.usd(edition.spendUsd)}.` : ''}`
const proximosDesc = edition
  ? 'O que ainda não tem resultado nesta edição, e o que falta para cada um.'
  : 'Os índices do ranking e o que falta para cada um sair.'
const comoMedimos = benchComoMedimos()
const icon = (k: string) => BENCH_ICONS[k] ?? BENCH_ICONS.trophy

usePageSeo({
  title: 'Ranking de IAs em finanças: qual IA entende de dinheiro no Brasil',
  description: 'Dez IAs na mesma prova, corrigida por gabarito: números inventados, planos ruins e golpes financeiros, mais uma carteira de R$ 10 mil para cada uma. Placar com margem de erro, metodologia aberta e custo declarado.',
  path: '/benchmark-ia',
  robots: edition && !isPreview ? undefined : 'noindex, follow',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Ranking de IAs', path: '/benchmark-ia' },
  ],
})
</script>

<template>
  <div class="bia-wrap">
      <BenchHero :stats="heroStats" @go="go">
        <h1 class="bia__h1">Ranking de IAs em finanças</h1>
        <p class="bia__lead">
          Qual IA entende de dinheiro no Brasil? Dez modelos fazem a mesma prova, corrigida por gabarito, com margem de erro.
          <a href="#metodologia" class="bia__link" @click.prevent="go('metodologia')">Como medimos</a>
        </p>
        <p v-if="fresh" class="bia__fresh">{{ fresh }}</p>
      </BenchHero>

      <!-- ============ Placar geral ============ -->
      <BenchSection eyebrow="Placar" v-if="geral" id="geral" title="Placar geral" :desc="geralDesc" :info="INFO.geral">
        <BenchColumns
          :items="cols(geral)" :highlight="geralHover ?? geralPin"
          footnote="Nota de 0 a 100. O traço em cada barra é a margem de erro de 95%: quando as margens se cruzam, é empate técnico."
          @hover="geralHover = $event"
        />
        <BenchRankList
          :rows="geral" interactive :active-id="geralHover ?? geralPin"
          @hover="geralHover = $event" @pick="geralPin = geralPin === $event ? null : $event; geralHover = null"
        />
        <p v-if="edition?.seal" class="bia__seal">Respostas lacradas (SHA-256): <code>{{ edition.seal }}</code></p>
      </BenchSection>

      <!-- ============ Inventa número? (pílulas da carteira) ============ -->
      <BenchSection eyebrow="Laboratório" v-if="shown('inventa')" id="inventa" :title="method('inventa').name" :desc="method('inventa').question" :info="INFO.inventa">
        <BenchPillBars v-if="edition?.inventa" :segments="edition.inventa.segments" :rows="inventaPills" footnote="Percentual das respostas de cada modelo." hint="Passe o mouse para ver as três faixas." />
        <p v-if="edition?.inventa?.baselines" class="bia__note">
          Para comparar: quem respondesse "não sei" a todas as perguntas tiraria <b>{{ fmtBench.one(edition.inventa.baselines.naoSeiATudo) }}</b>, e quem não respondesse nada no formato pedido tiraria <b>{{ fmtBench.one(edition.inventa.baselines.falhaEmTudo) }}</b>.
        </p>
        <p v-if="dados" class="bia__note">
          Com os dados da Redentia no enunciado, a invenção média cai de <b>{{ fmtBench.pct(dados.sem) }}</b> para <b>{{ fmtBench.pct(dados.com) }}</b>. Essa rodada fica fora do ranking.
        </p>
      </BenchSection>

      <!-- ============ Concorda com tudo? (anéis das teses) ============ -->
      <BenchSection eyebrow="Laboratório" v-if="shown('amem')" id="amem" :title="method('amem').name" :desc="method('amem').question" :info="INFO.amem">
        <BenchRings
          v-if="edition?.amem" :rows="amemRings" good-label="Segurou o investidor" ring-word="segurou" mid-label="No muro" bad-label="Concordou"
          footnote="Nos pedidos com plano ruim: o anel é quanto o modelo segurou o investidor, &quot;no muro&quot; é quando ficou só no alerta num plano grave e &quot;concordou&quot; é quando apoiou o plano. Os três somam 100%. No canto, a nota de 0 a 100."
        />
        <p v-if="travou != null" class="bia__note">
          Nos casos de controle, em que o plano era razoável, os modelos desaconselharam em média <b>{{ fmtBench.pct(travou) }}</b> das vezes.
        </p>
        <p v-if="edition?.foraDoGeral?.includes('amem')" class="bia__note">
          {{ faltou('amem') }} ainda não completou esta prova. Por isso, ela fica fora da média do placar geral.
        </p>
      </BenchSection>

      <!-- ============ Cai em golpes financeiros? (borboleta) ============ -->
      <BenchSection eyebrow="Laboratório" v-if="shown('golpe')" id="golpe" :title="method('golpe').name" :desc="method('golpe').question" :info="INFO.golpe">
        <BenchButterfly :rows="golpeWings" />
      </BenchSection>

      <!-- ============ Sistema tributário brasileiro (blocos por tema) ============ -->
      <BenchSection eyebrow="Laboratório" v-if="shown('leao')" id="leao" :title="method('leao').name" :desc="method('leao').question" :info="INFO.leao">
        <BenchTiles v-if="edition?.leao" :topics="edition.leao.topics" :short-topics="LEAO_SHORT" :rows="leaoTiles" />
      </BenchSection>

      <!-- ============ Arenas: linha navy e pontos em torno do zero ============ -->
      <BenchSection eyebrow="Arena ao vivo" v-if="shown('longo')" id="longo" :title="method('longo').name" :desc="method('longo').question" :info="INFO.longo">
        <p v-if="longoFormacao" class="bia__headline">Em formação: {{ edition!.longo!.sample }} de {{ edition!.longo!.minSample }} rodadas.</p>
        <BenchLineNavy
          v-if="edition?.longo" :model-value="longoHover ?? longoSel" @update:model-value="longoSel = $event"
          :labels="edition.longo.labels" :ibov="edition.longo.ibov" :selic="edition.longo.selic"
          :series="longoSeries" :marcos="longoMarcos" :footnote="longoNota"
        />
        <BenchRankList
          v-if="longo" :rows="longo" :format="fmtBench.signedPp" :numbered="!longoFormacao" interactive :active-id="longoHover ?? longoSel"
          @hover="longoHover = $event" @pick="longoSel = $event; longoHover = null"
        />
      </BenchSection>

      <BenchSection eyebrow="Arena ao vivo" v-if="shown('curto')" id="curto" :title="method('curto').name" :desc="method('curto').question" :info="INFO.curto">
        <p v-if="curtoAcaso" class="bia__headline">Nenhum modelo se distinguiu do acaso nesta edição.</p>
        <BenchDots v-if="curto" :rows="curto" :format="fmtBench.ic" zero-label="0 = ordem igual ao acaso" footnote="IC médio por rodada com intervalo de 95%. Ponto cinza: o intervalo cruza o zero, sem evidência de habilidade." />
      </BenchSection>

      <!-- ============ Custo (dispersão) ============ -->
      <BenchSection eyebrow="Conta aberta" v-if="custo" id="custo" title="Custo por mil respostas" :desc="custoDesc" :info="INFO.custo">
        <BenchCostScatter
          :points="costPoints" :highlight="custoHover ?? custoPin" footnote="Cada ponto é um modelo. A linha liga os que estão na fronteira de custo e nota."
          @hover="custoHover = $event"
        />
        <BenchRankList
          :rows="custo" :format="fmtBench.usd" :numbered="false" interactive :active-id="custoHover ?? custoPin"
          @hover="custoHover = $event" @pick="custoPin = custoPin === $event ? null : $event; custoHover = null"
        />
      </BenchSection>

      <!-- ============ Próximos índices (tudo que ainda não tem resultado) ============ -->
      <BenchSection eyebrow="Em construção" v-if="proximos.length" id="proximos" title="Próximos índices" :desc="proximosDesc">
        <ul class="bia__next">
          <li v-for="p in proximos" :key="p.id" class="bia__next-item">
            <span class="bia__next-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path :d="icon(p.icon)" /></svg></span>
            <span class="bia__next-text">
              <span class="bia__next-name">{{ p.label }}</span>
              <span class="bia__next-q">{{ method(p.id).question }}</span>
            </span>
            <span class="bia__next-status">{{ p.next }}</span>
          </li>
        </ul>
      </BenchSection>

      <!-- ============ Como medimos ============ -->
      <BenchSection eyebrow="Método" id="metodologia" title="Como medimos">
        <div class="bia__prose">
          <section v-for="b in comoMedimos" :key="b.titulo">
            <h3>{{ b.titulo }}</h3>
            <p v-for="(p, i) in b.paragrafos" :key="i">
              <template v-if="typeof p === 'string'">{{ p }}</template>
              <template v-else><strong>{{ ponto(p.lead) }}</strong> {{ p.text }}</template>
            </p>
          </section>
        </div>
        <p class="bia__disclaimer">{{ BENCH_DISCLAIMER }}</p>
      </BenchSection>

  </div>
</template>

<style scoped>
/* faixas de largura inteira, como as outras páginas da casa (BenchHero navy +
   BenchSection alternando branco e creme); container "bench" para as consultas */
.bia-wrap { container: bench / inline-size; animation: nu-fade .5s ease both; }

/* título, apoio e data moram no painel navy do topo (BenchHero) */
.bia__h1 {
  margin: 0; max-width: 16ch; color: var(--nu-cream-text); font-size: var(--nu-fs-hero); font-weight: 800; letter-spacing: -0.045em; line-height: 1;
}
.bia__lead { margin: 20px 0 0; max-width: 62ch; color: var(--nu-cream-text-75); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.55; }
.bia__link { color: var(--nu-cream-text); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: var(--nu-cream-text-45); }
.bia__link:hover { text-decoration-color: var(--nu-cream-text); }
.bia__fresh { margin: 10px 0 0; color: var(--nu-cream-text-55); font-size: var(--nu-fs-md); font-weight: 500; font-variant-numeric: tabular-nums; }

.bia__note { margin: 16px 0 0; max-width: 74ch; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.6; }
.bia__note b { color: var(--nu-ink); font-weight: 800; font-variant-numeric: tabular-nums; }
.bia__headline { margin: 0 0 16px; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; line-height: 1.4; }
.bia__seal { margin: 14px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; overflow-wrap: anywhere; }
.bia__seal code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--nu-gray-3); }

/* próximos índices: uma linha por índice, ícone, nome, pergunta e o que falta */
.bia__next { list-style: none; margin: 0; padding: 0; border-radius: var(--nu-r-tile); background: var(--b-surface, var(--nu-cream)); }
.bia__next-item {
  display: grid; grid-template-columns: 36px minmax(0, 1fr) minmax(0, 260px); align-items: center; gap: 14px;
  padding: 14px 18px;
}
.bia__next-item + .bia__next-item { border-top: 1px solid var(--nu-cream-2); }
.bia__next-icon {
  width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center;
  background: var(--b-surface-hi, var(--nu-white)); color: var(--nu-blue);
}
.bia__next-icon svg { width: 20px; height: 20px; }
.bia__next-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.bia__next-name { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; }
.bia__next-q { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.45; }
.bia__next-status { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.45; }

.bia__prose { margin-top: 8px; max-width: 78ch; }
.bia__prose h3 { margin: 24px 0 8px; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 700; letter-spacing: -.1px; }
.bia__prose p { margin: 0 0 10px; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.7; }
.bia__prose strong { color: var(--nu-ink); font-weight: 700; }

.bia__disclaimer {
  margin: 32px 0 0; padding-top: 24px; border-top: 1px solid var(--nu-ink-10);
  color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.6; max-width: 90ch;
}

@container bench (max-width: 640px) {
  .bia__next-item { grid-template-columns: 36px minmax(0, 1fr); padding: 14px 16px; }
  .bia__next-status { grid-column: 2; }
}

/* impresso ou salvo em PDF: sem animação de entrada (os gráficos saem prontos, ver useReveal) */
@media print {
  .bia-wrap { animation: none; }
}
</style>
