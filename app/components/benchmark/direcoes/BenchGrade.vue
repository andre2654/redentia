<script setup lang="ts">
// /benchmark-ia, direção 3 (03/11/2026): "A grade". A linguagem da /teses e do
// /guias, que o dono aprovou: a abertura em branco, uma barra que gruda com os
// filtros (todos, laboratórios, arenas) e o "Destacar", e um cartão por
// índice, cada um com a pergunta, o número da manchete e as dez IAs numa lista
// curta. O Placar geral é o cartão largo, o único no navy: o momento bonito; o
// resto é calmo, cartão branco com anel. Escolher uma IA (no menu da barra ou
// clicando numa linha) acende o modelo em todos os cartões. No celular, um
// feed vertical, com os filtros rolando de lado. Os gráficos grandes (a linha
// da Carteira, o mapa do tributário) ficam de fora: o cartão diz o placar, o
// "i" diz como ler.
import type { BenchChartInfo, BenchIndexId, BenchPaginaVM } from '~/types/benchmark'
import type { Leitura } from '~/content/benchmark-ia/leituras'

const props = defineProps<{ vm: BenchPaginaVM }>()
const { hover, fixo, foco, pick, metodo, INFO, go, manchete, parcialAgora, ctx } = useBenchDirecao(() => props.vm)
const v = computed(() => props.vm)

type Tipo = 'todos' | 'laboratorio' | 'arena'
type Linha = { id: string; name: string; rank?: number; tied?: boolean; value: number; lo?: number; hi?: number; parts?: number[]; extra?: string }
interface Cartao {
  id: BenchIndexId | 'custo'
  tipo: 'laboratorio' | 'arena' | 'conta'
  rotuloTipo: string
  titulo: string
  pergunta: string
  sub: string
  info: BenchChartInfo
  leitura?: Leitura
  rows: Linha[]
  format?: (x: number) => string
  numerado: boolean
  min?: number
  max?: number
  eixo?: boolean
  rotulo: string
  legenda?: { label: string; tom: 'bom' | 'meio' | 'ruim' }[]
  nota?: string
}

const shown = (id: string) => v.value.indices.find((x) => x.id === id)?.on ?? false
const cartoes = computed<Cartao[]>(() => {
  const x = v.value
  const out: Cartao[] = []
  const lab = (id: BenchIndexId) => ({ id, tipo: 'laboratorio' as const, rotuloTipo: 'Laboratório', titulo: metodo(id).name, pergunta: metodo(id).question })
  if (shown('inventa')) out.push({
    ...lab('inventa'), sub: INFO.inventa.sub, info: INFO.inventa, leitura: x.leitura.inventa, numerado: true, rotulo: 'nota',
    rows: x.inventa.map((r) => ({ ...r, extra: (r.parts[2] ?? 0) > 0 ? `inventou ${r.parts[2]}%` : 'não inventou' })),
    legenda: x.inventaSegments.map((label, i) => ({ label, tom: (['bom', 'meio', 'ruim'] as const)[i] ?? 'meio' })),
    nota: x.dados ? `Com os dados da Redentia no enunciado, a invenção média cai de ${fmtBench.pct(x.dados.sem)} para ${fmtBench.pct(x.dados.com)} (fora do ranking).` : undefined,
  })
  if (shown('amem')) out.push({
    ...lab('amem'), sub: INFO.amem.sub, info: INFO.amem, leitura: x.leitura.amem, numerado: true, rotulo: 'nota',
    rows: x.amem.map((r) => ({ ...r, extra: (r.parts[2] ?? 0) > 0 ? `concordou ${r.parts[2]}%` : (r.parts[1] ?? 0) > 0 ? `no muro ${r.parts[1]}%` : 'disse não' })),
    legenda: [{ label: 'Disse não', tom: 'bom' }, { label: 'No muro', tom: 'meio' }, { label: 'Concordou', tom: 'ruim' }],
    nota: x.edition?.foraDoGeral?.includes('amem') ? 'Fora da média do placar geral nesta edição: nem todos completaram a prova.' : undefined,
  })
  if (shown('golpe')) out.push({
    // a régua começa em 50: chamar tudo de golpe já tira 50 (está no "i")
    ...lab('golpe'), sub: INFO.golpe.sub, info: INFO.golpe, numerado: true, rotulo: 'nota', min: 50, max: 100, eixo: true,
    rows: x.golpe.map((r) => ({ ...r, extra: `pegou ${fmtBench.pct(r.caught)}${r.falseAlarm > 0 ? ` · acusou ${fmtBench.pct(r.falseAlarm)}` : ''}` })),
  })
  if (shown('leao')) out.push({
    ...lab('leao'), sub: INFO.leao.sub, info: INFO.leao, leitura: x.leitura.leao, numerado: true, rotulo: 'nota',
    rows: x.leao.map((r) => {
      const min = Math.min(...r.cells)
      const k = r.cells.indexOf(min)
      return { ...r, extra: min < 100 ? `pior tema: ${x.leaoShort[k] ?? x.leaoTopics[k] ?? ''} ${min}%` : 'acertou todos os temas' }
    }),
  })
  if (shown('longo') && x.longo) out.push({
    id: 'longo', tipo: 'arena', rotuloTipo: 'Arena ao vivo', titulo: metodo('longo').name, pergunta: metodo('longo').question,
    sub: INFO.longo.sub, info: INFO.longo, numerado: !x.longoFormacao, rotulo: 'diferença para o Ibovespa', format: fmtBench.signedPp,
    rows: x.longo.map((r) => ({ ...r, extra: (r.extra ?? '').split('\n')[0] })),
    nota: x.longoNota || undefined,
  })
  if (shown('curto')) {
    const parcial = !x.curto && !!x.curtoParcial
    out.push({
      id: 'curto', tipo: 'arena', rotuloTipo: 'Arena ao vivo', titulo: metodo('curto').name, pergunta: metodo('curto').question,
      sub: parcial ? INFO.curtoParcial.sub : INFO.curto.sub, info: parcial ? INFO.curtoParcial : INFO.curto,
      // em formação não há posição: a lista vai em ordem alfabética
      numerado: !parcial, rotulo: 'IC de Spearman', format: fmtBench.ic, min: parcial ? -1 : undefined, max: parcial ? 1 : undefined,
      rows: x.curto ?? parcialAgora.value,
      nota: parcial ? 'Zero é o mesmo que sortear a ordem. Sem posição até a nota oficial.' : (x.curtoHeadline ?? undefined),
    })
  }
  if (x.custo) out.push({
    id: 'custo', tipo: 'conta', rotuloTipo: 'Conta aberta', titulo: 'Custo por mil respostas', pergunta: 'Quanto custa cada mil respostas, em dólar. Menor é melhor.',
    sub: INFO.custo.sub, info: INFO.custo, leitura: x.leitura.custo, numerado: false, rotulo: 'custo por mil respostas', format: fmtBench.usd,
    nota: 'O custo depende do tamanho das respostas e do raciocínio de cada modelo nestas provas. Em outro uso, a conta muda.',
    min: 0, max: Math.max(...x.custo.map((r) => r.value)), rows: x.custo,
  })
  return out
})

const tipo = ref<Tipo>('todos')
const contagem = computed(() => ({
  todos: cartoes.value.length + (v.value.geral ? 1 : 0),
  laboratorio: cartoes.value.filter((c) => c.tipo === 'laboratorio').length,
  arena: cartoes.value.filter((c) => c.tipo === 'arena').length,
}))
const TIPOS: { id: Tipo; rotulo: string }[] = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'laboratorio', rotulo: 'Laboratórios' },
  { id: 'arena', rotulo: 'Arenas ao vivo' },
]
const visiveis = computed(() => cartoes.value.filter((c) => tipo.value === 'todos' || c.tipo === tipo.value))
const mostraPlacar = computed(() => !!v.value.geral && tipo.value === 'todos')
const mostraProximos = computed(() => v.value.proximos.length > 0 && tipo.value === 'todos')

/* ——— o menu "Destacar" ——— */
const modelos = computed(() => (v.value.geral ?? v.value.custo ?? []).map((r) => ({ id: r.id, name: r.name })))
const escolha = computed({
  get: () => fixo.value ?? '',
  set: (id: string) => { fixo.value = id || null; hover.value = null },
})
const lideres = computed(() => (v.value.geral ?? []).filter((r) => r.rank === 1).length)
// o placar em duas colunas (1º a 5º, 6º a 10º), como a lista da página de hoje
const metades = computed(() => {
  const g = v.value.geral ?? []
  const m = Math.ceil(g.length / 2)
  return [g.slice(0, m), g.slice(m)].filter((x) => x.length)
})
const piso = computed(() => {
  const los = (v.value.geral ?? []).map((r) => r.lo)
  return los.length ? Math.max(0, Math.floor(Math.min(...los) / 10) * 10) : 0
})
</script>

<template>
  <div class="bgr">
    <header class="bgr__topo">
      <p class="bgr__produto">Benchmark de IA da Redentia</p>
      <h1 class="bgr__titulo">Ranking de IAs em finanças</h1>
      <p class="bgr__dek">
        Dez IAs, a mesma prova de finanças, corrigida por gabarito.
        <a href="#metodologia" class="bgr__link" @click.prevent="go('metodologia')">Como medimos</a>
      </p>
    </header>

    <div class="bgr__barra">
      <div class="bgr__barra-in">
        <div class="bgr__chips" role="group" aria-label="Filtrar índices">
          <button
            v-for="o in TIPOS" :key="o.id" type="button" class="bgr__chip" :class="{ 'bgr__chip--on': tipo === o.id }"
            :aria-pressed="tipo === o.id" @click="tipo = o.id"
          >{{ o.rotulo }}<span class="bgr__chip-n">{{ contagem[o.id] }}</span></button>
        </div>
        <label v-if="modelos.length" class="bgr__select">
          <span class="bgr__select-r">Destacar</span>
          <select v-model="escolha">
            <option value="">Nenhuma IA</option>
            <option v-for="m in modelos" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </label>
      </div>
    </div>

    <p class="bgr__conta" aria-live="polite">
      {{ tipo === 'todos' ? `${contagem.todos} quadros` : `${visiveis.length} de ${contagem.todos} quadros` }}<span v-if="vm.fresh" class="bgr__conta-rev"> · {{ vm.fresh.replace(/\.$/, '') }}</span>
    </p>

    <ul class="bgr__grade">
      <!-- ============ Placar geral: o cartão largo, no navy ============ -->
      <li v-if="mostraPlacar && vm.geral" class="bgr__item bgr__item--largo">
        <article id="geral" v-contexto-chat="ctx.geral" class="bgr__cartao bgr__cartao--navy" aria-labelledby="bgr-geral">
          <div class="bgr__cab">
            <p class="bgr__tipo">Placar<span aria-hidden="true"> · </span>{{ INFO.geral.sub }}</p>
            <BenchDirInfo titulo="Placar geral" :info="INFO.geral" tom="escuro" />
          </div>
          <h2 id="bgr-geral" class="bgr__nome">Placar geral</h2>
          <p class="bgr__perg">{{ vm.geralDesc }}</p>
          <div class="bgr__corpo-largo">
            <p v-if="manchete.geral" class="bgr__man"><b>{{ manchete.geral.numero }}</b>{{ manchete.geral.frase }}</p>
            <ul v-if="vm.heroStats.length" class="bgr__nums">
              <li v-for="s in vm.heroStats.filter((x) => x.id !== 'geral')" :key="s.id">
                <a :href="`#${s.id}`" class="bgr__num" @click.prevent="go(s.id)">
                  <span class="bgr__num-v"><i :class="`bgr__ponto bgr__ponto--${s.tone}`" aria-hidden="true" />{{ s.format === 'pct' ? fmtBench.pct(s.value) : fmtBench.int(s.value) }}</span>
                  <span class="bgr__num-r">{{ s.label }}</span>
                </a>
              </li>
            </ul>
            <div class="bgr__lista">
              <BenchDirLinhas
                v-for="(metade, k) in metades" :key="k" :rows="metade" tom="escuro" :min="piso" :max="100" eixo
                :foco="foco" @hover="hover = $event" @pick="pick"
              />
            </div>
          </div>
          <p class="bgr__pe bgr__pe--navy">{{ lideres > 1 ? `As margens de erro dos ${lideres} primeiros se cruzam: é empate técnico.` : 'O traço em cada barra é a margem de erro de 95%.' }}</p>
        </article>
      </li>

      <!-- ============ um cartão por índice ============ -->
      <li v-for="c in visiveis" :key="c.id" class="bgr__item" :class="{ 'bgr__item--largo': c.id === 'custo' }">
        <article :id="c.id" v-contexto-chat="ctx[c.id]" class="bgr__cartao" :aria-labelledby="`bgr-${c.id}`">
          <div class="bgr__cab">
            <p class="bgr__tipo">{{ c.rotuloTipo }}</p>
            <BenchDirInfo :titulo="c.titulo" :info="c.info" :leitura="c.leitura" />
          </div>
          <h2 :id="`bgr-${c.id}`" class="bgr__nome">{{ c.titulo }}</h2>
          <p class="bgr__perg">{{ c.pergunta }}</p>
          <p v-if="manchete[c.id]" class="bgr__man"><b>{{ manchete[c.id]!.numero }}</b>{{ manchete[c.id]!.frase }}</p>
          <p v-if="c.legenda" class="bgr__leg"><span v-for="s in c.legenda" :key="s.label"><i :class="`bgr__sw bgr__sw--${s.tom}`" />{{ s.label }}</span></p>
          <!-- o custo fecha a grade na largura toda, com a dispersão custo × nota -->
          <BenchDirDispersao v-if="c.id === 'custo'" class="bgr__disp" :points="vm.costPoints" :foco="foco" @hover="hover = $event" @pick="pick" />
          <BenchDirLinhas
            v-else class="bgr__linhas" :rows="c.rows" densa :numerado="c.numerado" :format="c.format" :min="c.min" :max="c.max" :eixo="c.eixo"
            :rotulo="c.rotulo" :foco="foco" @hover="hover = $event" @pick="pick"
          />
          <p class="bgr__pe">{{ c.nota ?? c.sub }}</p>
        </article>
      </li>

      <!-- ============ o que ainda não tem nota ============ -->
      <li v-if="mostraProximos" class="bgr__item" :class="{ 'bgr__item--largo': !vm.geral }">
        <article id="proximos" class="bgr__cartao bgr__cartao--quieto" aria-labelledby="bgr-proximos">
          <p class="bgr__tipo">Em construção</p>
          <h2 id="bgr-proximos" class="bgr__nome">Próximos índices</h2>
          <p class="bgr__perg">{{ vm.proximosDesc }}</p>
          <BenchDirProximos class="bgr__prox" :itens="vm.proximos" />
        </article>
      </li>
    </ul>
    <div class="bgr__fim">
      <p v-if="vm.edition?.seal" class="bgr__selo">Respostas lacradas (SHA-256): <code>{{ vm.edition.seal }}</code></p>
    </div>

    <BenchDirDuvidas :faq="vm.faq" />
  </div>
</template>

<style scoped>
.bgr { --g: clamp(22px, 5.5vw, 80px); --cola: calc(var(--nuh-h, 76px) + 46px); background: var(--nu-white); animation: nu-fade .5s ease both; }

.bgr__topo { padding: clamp(40px, 5.2vw, 80px) var(--g) clamp(24px, 3vw, 40px); }
.bgr__produto { margin: 0; color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 700; }
.bgr__titulo { margin: 12px 0 0; max-width: 16ch; color: var(--nu-ink); font-size: clamp(38px, 5vw, 72px); font-weight: 500; letter-spacing: -0.05em; line-height: 1.02; text-wrap: balance; }
.bgr__dek { margin: 16px 0 0; max-width: 56ch; color: var(--nu-gray-2); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; }
.bgr__link { color: var(--nu-ink); font-weight: 600; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: var(--nu-ink-30); }
.bgr__link:hover { text-decoration-color: var(--nu-ink); }

/* ——— a barra (a mesma da /teses) ——— */
.bgr__barra {
  position: sticky; top: var(--cola); z-index: 30;
  background: color-mix(in srgb, var(--nu-white) 90%, transparent);
  -webkit-backdrop-filter: saturate(1.4) blur(14px); backdrop-filter: saturate(1.4) blur(14px);
  border-top: 1px solid var(--nu-cream-line); border-bottom: 1px solid var(--nu-cream-line);
}
.bgr__barra-in { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px var(--g); }
.bgr__chips { display: flex; align-items: center; gap: 8px; min-width: 0; overflow-x: auto; scrollbar-width: none; }
.bgr__chips::-webkit-scrollbar { display: none; }
.bgr__chip {
  display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0; height: 38px; padding: 0 16px; border: 0; border-radius: var(--nu-r-pill);
  background: var(--nu-cream); color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-sm); font-weight: 600; white-space: nowrap; cursor: pointer;
  transition: background .2s, color .2s;
}
.bgr__chip:hover { background: var(--nu-cream-hover); box-shadow: inset 0 0 0 1px var(--nu-cream-line); }
.bgr__chip--on, .bgr__chip--on:hover { background: var(--nu-ink); color: var(--nu-white); box-shadow: none; }
.bgr__chip:focus-visible, .bgr__select select:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.bgr__chip-n { color: var(--nu-gray); font-weight: 700; font-variant-numeric: tabular-nums; }
.bgr__chip--on .bgr__chip-n { color: var(--nu-cream-text-60); }
.bgr__select { position: relative; display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.bgr__select-r { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; }
.bgr__select select {
  appearance: none; height: 38px; max-width: 220px; padding: 0 34px 0 16px; border: 0; border-radius: var(--nu-r-pill);
  background: var(--nu-cream); color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-sm); font-weight: 600; cursor: pointer;
}
.bgr__select::after {
  content: ''; position: absolute; right: 15px; top: 50%; width: 7px; height: 7px; margin-top: -6px; pointer-events: none;
  border-right: 1.6px solid var(--nu-ink); border-bottom: 1.6px solid var(--nu-ink); transform: rotate(45deg);
}

.bgr__conta { margin: 0; padding: 20px var(--g) 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums; }

/* ——— a grade: três colunas no largo, duas no tablet, uma no celular ——— */
.bgr__grade {
  --gap: clamp(16px, 1.8vw, 24px);
  list-style: none; margin: 16px 0 0; padding: 0 var(--g);
  display: grid; gap: var(--gap); grid-auto-flow: dense;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, max(320px, calc((100% - 2 * var(--gap)) / 3))), 1fr));
}
.bgr__item { min-width: 0; }
.bgr__item--largo { grid-column: 1 / -1; }
.bgr__cartao {
  scroll-margin-top: calc(var(--cola) + 72px);
  display: flex; flex-direction: column; height: 100%; padding: 22px 22px 18px; border-radius: var(--nu-r-card);
  background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-cream-line);
}
.bgr__cartao--quieto { background: var(--nu-white); }
.bgr__cab { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 34px; }
.bgr__tipo { margin: 0; min-width: 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; }
.bgr__nome { margin: 10px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 600; letter-spacing: -0.03em; line-height: 1.18; text-wrap: balance; }
.bgr__perg { margin: 8px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; }
.bgr__man { display: flex; flex-direction: column; gap: 6px; margin: 18px 0 0; padding-top: 16px; border-top: 1px solid var(--nu-cream-line); color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.45; }
.bgr__man b { color: var(--nu-ink); font-size: clamp(30px, 2.6vw, 36px); font-weight: 500; letter-spacing: -0.04em; line-height: 1; font-variant-numeric: tabular-nums; }
.bgr__leg { display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 16px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600; }
.bgr__leg span { display: inline-flex; align-items: center; gap: 6px; }
.bgr__sw { width: 8px; height: 8px; border-radius: 50%; }
.bgr__sw--bom { background: var(--nu-blue); }
.bgr__sw--meio { background: var(--nu-sand); }
.bgr__sw--ruim { background: var(--nu-red); }
.bgr__linhas { margin-top: 12px; }
.bgr__leg + .bgr__linhas { margin-top: 8px; }
.bgr__pe { margin: auto 0 0; padding-top: 14px; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.5; }
.bgr__prox { margin-top: 12px; }
.bgr__disp { margin-top: 20px; }

/* o cartão do placar: navy, o anel claro e a sombra grande tingida de navy */
.bgr__cartao--navy {
  padding: 26px 28px 22px; background: var(--nu-navy); color: var(--nu-cream-text);
  box-shadow: inset 0 0 0 1px var(--nu-cream-text-10), var(--nu-shadow-read-card);
}
.bgr__cartao--navy .bgr__tipo { color: var(--nu-cream-text-55); }
.bgr__cartao--navy .bgr__nome { color: var(--nu-cream-text); font-size: var(--nu-fs-h3); font-weight: 500; letter-spacing: -0.04em; }
.bgr__cartao--navy .bgr__perg { color: var(--nu-cream-text-70); }
.bgr__corpo-largo { display: grid; grid-template-columns: minmax(220px, 1fr) minmax(0, 3.2fr); gap: 8px clamp(28px, 3vw, 48px); align-items: start; margin-top: 18px; padding-top: 18px; border-top: 1px solid var(--nu-cream-text-12); }
.bgr__cartao--navy .bgr__man { grid-column: 1; margin: 0; padding: 0; border: 0; color: var(--nu-cream-text-70); }
.bgr__cartao--navy .bgr__man b { color: var(--nu-cream-text); font-size: clamp(44px, 4.4vw, 64px); letter-spacing: -0.05em; }
.bgr__nums { grid-column: 1; list-style: none; margin: 16px 0 0; padding: 0; }
.bgr__nums li { border-top: 1px solid var(--nu-cream-text-12); }
.bgr__num { display: flex; flex-direction: column; gap: 4px; padding: 12px 0; color: inherit; }
.bgr__num:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; border-radius: 4px; }
.bgr__num-v { display: inline-flex; align-items: center; gap: 8px; color: var(--nu-cream-text); font-size: var(--nu-fs-xl); font-weight: 500; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; transition: color .2s; }
.bgr__num:hover .bgr__num-v { color: var(--nu-blue-soft); }
.bgr__num-r { color: var(--nu-cream-text-60); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.45; }
.bgr__ponto { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.bgr__ponto--bad { background: var(--nu-red-soft); }
.bgr__ponto--good { background: var(--nu-blue-soft); }
.bgr__lista { grid-column: 2; grid-row: 1 / span 3; min-width: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 clamp(24px, 3vw, 48px); }
.bgr__pe--navy { color: var(--nu-cream-text-55); }

.bgr__fim { padding: 20px var(--g) clamp(56px, 7vw, 96px); }
.bgr__selo { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; overflow-wrap: anywhere; }
.bgr__selo code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--nu-gray-3); }

@media (max-width: 1180px) {
  .bgr__corpo-largo { grid-template-columns: minmax(0, 1fr); }
  .bgr__lista { grid-column: 1; grid-row: auto; margin-top: 12px; }
  .bgr__nums { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: 0 20px; }
}
@media (max-width: 900px) {
  .bgr__lista { grid-template-columns: minmax(0, 1fr); }
  .bgr__lista > :first-child :deep(.bdl__eixo) { display: none; }
}
@media (max-width: 640px) { .bgr { --cola: calc(var(--nuh-h, 58px) + 46px); } }
@media (max-width: 900px) {
  .bgr__barra-in { padding: 10px 0 10px var(--g); gap: 10px; }
  .bgr__chips { flex: 1; padding-right: 4px; }
  .bgr__chip { height: 36px; padding: 0 14px; }
  .bgr__select-r { display: none; }
  .bgr__select { margin-right: var(--g); }
  .bgr__select select { height: 36px; max-width: 150px; }
  .bgr__nome { font-size: var(--nu-fs-xl); }
}
@media (max-width: 560px) {
  .bgr__conta-rev { display: none; }
  .bgr__cartao { padding: 20px 18px 16px; }
  .bgr__cartao--navy { padding: 22px 18px 18px; }
}
@media (prefers-reduced-motion: reduce) {
  .bgr, .bgr__chip { animation: none; transition: none; }
}
</style>
