<script setup lang="ts">
// /benchmark-ia, direção 1 (03/11/2026): "A tabela". O placar inteiro numa
// tabela só, no topo da página: um modelo por linha, um índice por coluna, e o
// cabeçalho ordena (o melhor primeiro; custo, o mais barato). A coluna Geral
// leva a margem de erro desenhada, numa régua comum: é o momento bonito da
// tela, o resto é calmo. Passar o mouse numa linha acende o modelo em todos os
// gráficos de baixo; o clique fixa. No celular a tabela mostra uma coluna por
// vez, escolhida na barra que gruda (a mesma da /teses), sem rolar de lado.
// Embaixo, um índice por bloco: o texto à esquerda (que gruda enquanto o
// gráfico passa), o gráfico à direita; as arenas ocupam a largura toda.
import type { BenchPaginaVM } from '~/types/benchmark'
import { melhorDaColuna, ordenarPerfil, perfilDosModelos, type BenchColuna, type BenchPerfil } from '~/utils/benchDirecoes'

const props = defineProps<{ vm: BenchPaginaVM }>()
const { hover, foco, pick, metodo, INFO, go, manchete, ctx } = useBenchDirecao(() => props.vm)
const v = computed(() => props.vm)

const perfil = computed(() => perfilDosModelos({
  geral: v.value.geral, inventa: v.value.inventa, amem: v.value.amem, golpe: v.value.golpe, leao: v.value.leao,
  longo: v.value.longo, custo: v.value.custo, longoSemPosicao: v.value.longoFormacao,
}))
const COLUNAS = computed(() => ([
  { id: 'geral', curto: 'Geral', longo: 'Placar geral', on: !!v.value.geral },
  { id: 'inventa', curto: 'Inventa', longo: metodo('inventa').name, on: v.value.inventa.length > 0 },
  { id: 'amem', curto: 'Concorda', longo: metodo('amem').name, on: v.value.amem.length > 0 },
  { id: 'golpe', curto: 'Golpes', longo: metodo('golpe').name, on: v.value.golpe.length > 0 },
  { id: 'leao', curto: 'Tributário', longo: metodo('leao').name, on: v.value.leao.length > 0 },
  { id: 'longo', curto: 'Carteira', longo: metodo('longo').name, on: !!v.value.longo },
  { id: 'custo', curto: 'Custo', longo: 'Custo por mil respostas', on: !!v.value.custo },
] as { id: BenchColuna; curto: string; longo: string; on: boolean }[]).filter((c) => c.on))
const coluna = ref<BenchColuna>('geral')
const linhas = computed(() => ordenarPerfil(perfil.value, coluna.value))
const melhor = computed(() => Object.fromEntries(COLUNAS.value.map((c) => [c.id, melhorDaColuna(perfil.value, c.id)])) as Record<BenchColuna, number | null>)

const fmtCol: Record<BenchColuna, (x: number) => string> = {
  geral: fmtBench.one, inventa: fmtBench.one, amem: fmtBench.one, golpe: fmtBench.one, leao: fmtBench.one,
  longo: fmtBench.signedPp, custo: fmtBench.usd,
}
const valor = (r: BenchPerfil, c: BenchColuna) => r[c]
const sub = (r: BenchPerfil, c: BenchColuna) => {
  if (c === 'inventa' && r.inventou != null) return r.inventou > 0 ? `inventou ${r.inventou}%` : 'não inventou'
  if (c === 'longo') return 'vs. Ibovespa'
  if (c === 'custo') return 'por mil'
  return ''
}
// a régua da margem de erro: a mesma para todas as linhas
const regua = computed(() => {
  const los = perfil.value.map((r) => r.geralLo).filter((x): x is number => x != null)
  const lo = los.length ? Math.max(0, Math.floor(Math.min(...los) / 10) * 10) : 0
  return { lo, hi: 100 }
})
const rp = (x: number) => ((x - regua.value.lo) / (regua.value.hi - regua.value.lo)) * 100
const ariaSort = (c: BenchColuna) => (coluna.value === c ? (c === 'custo' ? 'ascending' : 'descending') : 'none')
const lideres = computed(() => (v.value.geral ?? []).filter((r) => r.rank === 1).length)

/* ——— os índices embaixo ——— */
const shown = (id: string) => v.value.indices.find((x) => x.id === id)?.on ?? false
const legendaInventa = computed(() => v.value.inventaSegments.map((label, i) => ({
  label, tom: (['bom', 'meio', 'ruim'] as const)[i] ?? 'meio',
  media: mediaDe(v.value.inventa.map((r) => r.parts[i] ?? 0)) ?? 0,
})))
const LEG_AMEM = [{ label: 'Disse não', tom: 'bom' }, { label: 'No muro', tom: 'meio' }, { label: 'Concordou', tom: 'ruim' }] as const
const inventaLinhas = computed(() => v.value.inventa.map((r) => ({ ...r, extra: (r.parts[2] ?? 0) > 0 ? `inventou ${r.parts[2]}%` : 'não inventou' })))
const amemLinhas = computed(() => v.value.amem.map((r) => ({ ...r, extra: (r.parts[2] ?? 0) > 0 ? `concordou ${r.parts[2]}%` : (r.parts[1] ?? 0) > 0 ? `no muro ${r.parts[1]}%` : 'disse não' })))

// Carteira: a linha navy mostra o modelo em foco; sem foco, o primeiro da lista
const longoSel = ref(props.vm.longoSeries[0]?.id ?? '')
const longoVisto = computed(() => (foco.value && props.vm.longoSeries.some((s) => s.id === foco.value) ? foco.value : longoSel.value))
function escolherLongo(id: string) { longoSel.value = id; pick(id) }
</script>

<template>
  <div class="btb">
    <header class="btb__topo">
      <p class="btb__produto">Benchmark de IA da Redentia</p>
      <h1 class="btb__titulo">Ranking de IAs em finanças</h1>
      <p class="btb__dek">
        Dez IAs, a mesma prova de finanças, corrigida por gabarito.
        <a href="#metodologia" class="btb__link" @click.prevent="go('metodologia')">Como medimos</a>
      </p>
      <p v-if="vm.fresh" class="btb__fresh">{{ vm.fresh }}</p>
      <ul v-if="vm.heroStats.length" class="btb__nums">
        <li v-for="s in vm.heroStats" :key="s.id">
          <a :href="`#${s.id}`" class="btb__num" @click.prevent="go(s.id)">
            <span class="btb__num-v"><i class="btb__ponto" :class="`btb__ponto--${s.tone}`" aria-hidden="true" />{{ s.format === 'pct' ? fmtBench.pct(s.value) : fmtBench.int(s.value) }}</span>
            <span class="btb__num-r">{{ s.label }}</span>
          </a>
        </li>
      </ul>
    </header>

    <!-- ============ a tabela ============ -->
    <section v-if="vm.geral" id="geral" v-contexto-chat="ctx.geral" class="btb__placar" aria-labelledby="btb-placar">
      <div class="btb__barra">
        <div class="btb__barra-in">
          <h2 id="btb-placar" class="btb__barra-t">Placar<span class="btb__barra-sub"> · {{ lideres > 1 ? `${lideres} empatados em 1º` : '1º sozinho' }}</span></h2>
          <div class="btb__chips" role="radiogroup" aria-label="Ordenar a tabela por índice">
            <button
              v-for="c in COLUNAS" :key="c.id" type="button" role="radio" class="btb__chip" :class="{ 'btb__chip--on': coluna === c.id }"
              :aria-checked="coluna === c.id" @click="coluna = c.id"
            >{{ c.curto }}</button>
          </div>
        </div>
      </div>

      <div class="btb__tab-wrap">
        <table class="btb__tab" :class="`btb__tab--${coluna}`">
          <caption class="btb__sr">Placar por índice. {{ vm.geralDesc }} Ordenado por {{ COLUNAS.find((c) => c.id === coluna)?.longo }}.</caption>
          <thead>
            <tr>
              <th scope="col" class="btb__th btb__th--pos">#</th>
              <th scope="col" class="btb__th btb__th--modelo">Modelo</th>
              <th
                v-for="c in COLUNAS" :key="c.id" scope="col" class="btb__th" :class="[`btb__c--${c.id}`, { 'btb__th--on': coluna === c.id }]"
                :aria-sort="ariaSort(c.id)"
              >
                <button type="button" class="btb__ord" :title="c.longo" @click="coluna = c.id">
                  {{ c.curto }}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 10l5 5 5-5" /></svg>
                </button>
              </th>
            </tr>
          </thead>
          <tbody @mouseleave="hover = null">
            <tr
              v-for="(r, i) in linhas" :key="r.id" class="btb__tr" :class="{ 'btb__tr--on': foco === r.id, 'btb__tr--recua': foco && foco !== r.id }"
              tabindex="0" :aria-current="foco === r.id ? 'true' : undefined"
              @mouseenter="hover = r.id" @focus="hover = r.id" @blur="hover = null" @click="pick(r.id)" @keydown.enter.prevent="pick(r.id)"
            >
              <td class="btb__td btb__td--pos">{{ r.ranks[coluna] ?? i + 1 }}º</td>
              <th scope="row" class="btb__td btb__td--modelo">
                <span class="btb__quem">
                  <span class="btb__tile" aria-hidden="true">
                    <img v-if="benchLogo(r.id)" :src="benchLogo(r.id)!" alt="" width="16" height="16" loading="lazy" decoding="async">
                    <template v-else>{{ r.name.charAt(0) }}</template>
                  </span>
                  <span class="btb__nome">{{ r.name }}<span class="btb__prov">{{ r.provider }}</span></span>
                </span>
              </th>
              <td v-for="c in COLUNAS" :key="c.id" class="btb__td" :class="[`btb__c--${c.id}`, { 'btb__td--sel': coluna === c.id }]">
                <template v-if="c.id === 'geral' && r.geral != null">
                  <span class="btb__geral">
                    <span class="btb__regua" aria-hidden="true">
                      <span class="btb__faixa" :class="{ 'btb__faixa--top': r.rank === 1 }" :style="{ left: `${rp(r.geralLo!)}%`, width: `${Math.max(1.2, rp(r.geralHi!) - rp(r.geralLo!))}%` }" />
                      <span class="btb__marca" :class="{ 'btb__marca--top': r.rank === 1 }" :style="{ left: `${rp(r.geral)}%` }" />
                    </span>
                    <span class="btb__v" :class="{ 'btb__v--melhor': r.rank === 1 }">{{ fmtBench.one(r.geral) }}</span>
                  </span>
                  <span class="btb__sr">, margem de {{ fmtBench.one(r.geralLo!) }} a {{ fmtBench.one(r.geralHi!) }}{{ r.tied ? ', empate' : '' }}</span>
                </template>
                <template v-else-if="valor(r, c.id) != null">
                  <span class="btb__v" :class="{ 'btb__v--melhor': valor(r, c.id) === melhor[c.id] }">{{ fmtCol[c.id](valor(r, c.id)!) }}</span>
                  <span v-if="sub(r, c.id)" class="btb__s">{{ sub(r, c.id) }}</span>
                </template>
                <span v-else class="btb__s" title="Não completou esta prova">sem nota</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p class="btb__rodape">
          <span>{{ vm.geralDesc }} A faixa é a margem de erro de 95%: quando as faixas se cruzam, é empate. Em azul, o melhor de cada coluna.</span>
          <span v-if="vm.edition?.seal" class="btb__selo">Respostas lacradas (SHA-256): <code>{{ vm.edition.seal }}</code></span>
        </p>
      </div>
    </section>

    <!-- ============ um bloco por índice ============ -->
    <section v-if="shown('inventa')" id="inventa" v-contexto-chat="ctx.inventa" class="btb__sec">
      <div class="btb__sec-in">
        <div class="btb__lado">
          <p class="btb__tipo">Laboratório<span aria-hidden="true"> · </span>{{ INFO.inventa.sub }}</p>
          <h2 class="btb__h2">{{ metodo('inventa').name }}</h2>
          <p class="btb__q">{{ metodo('inventa').question }}</p>
          <p v-if="manchete.inventa" class="btb__man"><b>{{ manchete.inventa.numero }}</b> {{ manchete.inventa.frase }}</p>
          <BenchDirInfo :titulo="metodo('inventa').name" :info="INFO.inventa" :leitura="vm.leitura.inventa" />
        </div>
        <div class="btb__graf">
          <p class="btb__leg"><span v-for="s in legendaInventa" :key="s.label"><i :class="`btb__sw btb__sw--${s.tom}`" />{{ s.label }} <b>{{ fmtBench.pct(s.media) }}</b></span><span class="btb__leg-n">na média</span></p>
          <BenchDirLinhas :rows="inventaLinhas" :foco="foco" @hover="hover = $event" @pick="pick" />
          <p v-if="vm.dados" class="btb__nota">Com os dados da Redentia no enunciado, a invenção média cai de <b>{{ fmtBench.pct(vm.dados.sem) }}</b> para <b>{{ fmtBench.pct(vm.dados.com) }}</b>. Essa rodada fica fora do ranking.</p>
        </div>
      </div>
    </section>

    <section v-if="shown('amem')" id="amem" v-contexto-chat="ctx.amem" class="btb__sec">
      <div class="btb__sec-in">
        <div class="btb__lado">
          <p class="btb__tipo">Laboratório<span aria-hidden="true"> · </span>{{ INFO.amem.sub }}</p>
          <h2 class="btb__h2">{{ metodo('amem').name }}</h2>
          <p class="btb__q">{{ metodo('amem').question }}</p>
          <p v-if="manchete.amem" class="btb__man"><b>{{ manchete.amem.numero }}</b> {{ manchete.amem.frase }}</p>
          <BenchDirInfo :titulo="metodo('amem').name" :info="INFO.amem" :leitura="vm.leitura.amem" />
        </div>
        <div class="btb__graf">
          <p class="btb__leg"><span v-for="s in LEG_AMEM" :key="s.label"><i :class="`btb__sw btb__sw--${s.tom}`" />{{ s.label }}</span></p>
          <BenchDirLinhas :rows="amemLinhas" :foco="foco" @hover="hover = $event" @pick="pick" />
          <p v-if="vm.edition?.foraDoGeral?.includes('amem')" class="btb__nota">Fora da média do placar geral nesta edição: nem todos os modelos completaram a prova.</p>
        </div>
      </div>
    </section>

    <section v-if="shown('golpe')" id="golpe" v-contexto-chat="ctx.golpe" class="btb__sec">
      <div class="btb__sec-in">
        <div class="btb__lado">
          <p class="btb__tipo">Laboratório<span aria-hidden="true"> · </span>{{ INFO.golpe.sub }}</p>
          <h2 class="btb__h2">{{ metodo('golpe').name }}</h2>
          <p class="btb__q">{{ metodo('golpe').question }}</p>
          <p v-if="manchete.golpe" class="btb__man"><b>{{ manchete.golpe.numero }}</b> {{ manchete.golpe.frase }}</p>
          <BenchDirInfo :titulo="metodo('golpe').name" :info="INFO.golpe" />
        </div>
        <div class="btb__graf">
          <BenchButterfly :rows="vm.golpe" />
        </div>
      </div>
    </section>

    <section v-if="shown('leao')" id="leao" v-contexto-chat="ctx.leao" class="btb__sec">
      <div class="btb__sec-in">
        <div class="btb__lado">
          <p class="btb__tipo">Laboratório<span aria-hidden="true"> · </span>{{ INFO.leao.sub }}</p>
          <h2 class="btb__h2">{{ metodo('leao').name }}</h2>
          <p class="btb__q">{{ metodo('leao').question }}</p>
          <p v-if="manchete.leao" class="btb__man"><b>{{ manchete.leao.numero }}</b> {{ manchete.leao.frase }}</p>
          <BenchDirInfo :titulo="metodo('leao').name" :info="INFO.leao" :leitura="vm.leitura.leao" />
        </div>
        <div class="btb__graf">
          <BenchTiles :topics="vm.leaoTopics" :short-topics="vm.leaoShort" :rows="vm.leao" />
        </div>
      </div>
    </section>

    <section v-if="shown('longo')" id="longo" v-contexto-chat="ctx.longo" class="btb__sec btb__sec--largo">
      <div class="btb__sec-in">
        <div class="btb__lado">
          <p class="btb__tipo">Arena ao vivo<span aria-hidden="true"> · </span>{{ INFO.longo.sub }}</p>
          <h2 class="btb__h2">{{ metodo('longo').name }}</h2>
          <p class="btb__q">{{ metodo('longo').question }}</p>
          <p v-if="manchete.longo" class="btb__man"><b>{{ manchete.longo.numero }}</b> {{ manchete.longo.frase }}</p>
          <BenchDirInfo :titulo="metodo('longo').name" :info="INFO.longo" />
        </div>
        <div class="btb__graf">
          <BenchLineNavy
            v-if="vm.edition?.longo" :model-value="longoVisto" @update:model-value="escolherLongo"
            :labels="vm.edition.longo.labels" :ibov="vm.edition.longo.ibov" :selic="vm.edition.longo.selic"
            :series="vm.longoSeries" :marcos="vm.longoMarcos" :footnote="vm.longoNota"
          />
          <BenchRankList
            v-if="vm.longo" :rows="vm.longo" :format="fmtBench.signedPp" :numbered="!vm.longoFormacao" interactive :active-id="longoVisto"
            @hover="hover = $event" @pick="escolherLongo"
          />
        </div>
      </div>
    </section>

    <section v-if="shown('curto')" id="curto" v-contexto-chat="ctx.curto" class="btb__sec btb__sec--largo">
      <div class="btb__sec-in">
        <div class="btb__lado">
          <p class="btb__tipo">Arena ao vivo<span aria-hidden="true"> · </span>{{ vm.curto ? INFO.curto.sub : INFO.curtoParcial.sub }}</p>
          <h2 class="btb__h2">{{ metodo('curto').name }}</h2>
          <p class="btb__q">{{ metodo('curto').question }}</p>
          <p v-if="manchete.curto" class="btb__man"><b>{{ manchete.curto.numero }}</b> {{ manchete.curto.frase }}</p>
          <BenchDirInfo :titulo="metodo('curto').name" :info="vm.curto ? INFO.curto : INFO.curtoParcial" />
        </div>
        <div class="btb__graf">
          <BenchDots v-if="vm.curto" :rows="vm.curto" :format="fmtBench.ic" zero-label="0 = ordem igual ao acaso" footnote="Ponto cinza: sem evidência de habilidade." />
          <BenchIcLines
            v-else-if="vm.curtoParcial" :labels="vm.curtoParcial.labels" :series="vm.curtoParcialSeries" :horizonte="vm.curtoParcial.horizonte"
            :fim="vm.curtoParcial.fimPrevisto ? `${vm.curtoParcial.fimPrevisto.slice(8, 10)}/${vm.curtoParcial.fimPrevisto.slice(5, 7)}` : null"
          />
        </div>
      </div>
    </section>

    <section v-if="vm.custo" id="custo" v-contexto-chat="ctx.custo" class="btb__sec">
      <div class="btb__sec-in">
        <div class="btb__lado">
          <p class="btb__tipo">Conta aberta<span aria-hidden="true"> · </span>{{ INFO.custo.sub }}</p>
          <h2 class="btb__h2">Custo por mil respostas</h2>
          <p class="btb__q">Quanto custa cada mil respostas, em dólar, contra a nota geral.</p>
          <p v-if="manchete.custo" class="btb__man"><b>{{ manchete.custo.numero }}</b> {{ manchete.custo.frase }}</p>
          <BenchDirInfo titulo="Custo por mil respostas" :info="INFO.custo" :leitura="vm.leitura.custo" />
        </div>
        <div class="btb__graf">
          <BenchDirDispersao :points="vm.costPoints" :foco="foco" @hover="hover = $event" @pick="pick" />
        </div>
      </div>
    </section>

    <section v-if="vm.proximos.length" id="proximos" class="btb__sec">
      <div class="btb__sec-in">
        <div class="btb__lado">
          <p class="btb__tipo">Em construção</p>
          <h2 class="btb__h2">Próximos índices</h2>
          <p class="btb__q">{{ vm.proximosDesc }}</p>
        </div>
        <div class="btb__graf"><BenchDirProximos :itens="vm.proximos" /></div>
      </div>
    </section>

    <BenchDirDuvidas :faq="vm.faq" />
  </div>
</template>

<style scoped>
.btb { --g: clamp(22px, 5.5vw, 80px); --cola: calc(var(--nuh-h, 76px) + 46px); background: var(--nu-white); animation: nu-fade .5s ease both; }

/* ——— topo: a mesma abertura da /teses e do /guias ——— */
.btb__topo { padding: clamp(40px, 5.2vw, 80px) var(--g) clamp(28px, 3.4vw, 48px); }
.btb__produto { margin: 0; color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 700; }
.btb__titulo { margin: 12px 0 0; max-width: 16ch; color: var(--nu-ink); font-size: clamp(38px, 5vw, 72px); font-weight: 500; letter-spacing: -0.05em; line-height: 1.02; text-wrap: balance; }
.btb__dek { margin: 16px 0 0; max-width: 56ch; color: var(--nu-gray-2); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; }
.btb__link { color: var(--nu-ink); font-weight: 600; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: var(--nu-ink-30); }
.btb__link:hover { text-decoration-color: var(--nu-ink); }
.btb__fresh { margin: 8px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; font-variant-numeric: tabular-nums; }
.btb__nums { list-style: none; margin: clamp(28px, 3vw, 40px) 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); max-width: 960px; }
.btb__nums li { border-top: 1px solid var(--nu-cream-line); }
.btb__nums li + li { padding-left: 0; }
.btb__num { display: flex; flex-direction: column; gap: 6px; padding: 16px 24px 4px 0; color: inherit; }
.btb__num:hover .btb__num-v { color: var(--nu-blue-text); }
.btb__num:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; border-radius: 4px; }
.btb__num-v { display: inline-flex; align-items: center; gap: 10px; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 500; letter-spacing: -0.03em; line-height: 1; font-variant-numeric: tabular-nums; transition: color .2s; }
.btb__num-r { max-width: 30ch; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.45; }
.btb__ponto { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.btb__ponto--bad { background: var(--nu-red); }
.btb__ponto--good { background: var(--nu-blue); }

/* ——— a barra que gruda (a da /teses) ——— */
.btb__placar { scroll-margin-top: var(--cola); }
.btb__barra {
  position: sticky; top: var(--cola); z-index: 30;
  background: color-mix(in srgb, var(--nu-white) 90%, transparent);
  -webkit-backdrop-filter: saturate(1.4) blur(14px); backdrop-filter: saturate(1.4) blur(14px);
  border-top: 1px solid var(--nu-cream-line); border-bottom: 1px solid var(--nu-cream-line);
}
.btb__barra-in { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px var(--g); }
.btb__barra-t { margin: 0; flex-shrink: 0; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 600; }
.btb__barra-sub { color: var(--nu-gray); font-weight: 500; }
.btb__chips { display: flex; align-items: center; gap: 8px; min-width: 0; overflow-x: auto; scrollbar-width: none; }
.btb__chips::-webkit-scrollbar { display: none; }
.btb__chip {
  flex-shrink: 0; height: 36px; padding: 0 15px; border: 0; border-radius: var(--nu-r-pill);
  background: var(--nu-cream); color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-sm); font-weight: 600; white-space: nowrap; cursor: pointer;
  transition: background .2s, color .2s;
}
.btb__chip:hover { background: var(--nu-cream-hover); box-shadow: inset 0 0 0 1px var(--nu-cream-line); }
.btb__chip--on, .btb__chip--on:hover { background: var(--nu-ink); color: var(--nu-white); box-shadow: none; }
.btb__chip:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

/* ——— a tabela: o cartão com anel de 1 px e a sombra grande tingida de navy ——— */
.btb__tab-wrap { padding: clamp(20px, 2.4vw, 32px) var(--g) clamp(56px, 7vw, 96px); }
.btb__tab {
  width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed;
  border-radius: var(--nu-r-card); background: var(--nu-white);
  box-shadow: inset 0 0 0 1px var(--nu-cream-line), var(--nu-shadow-read-card);
}
.btb__th {
  padding: 16px 10px 12px; text-align: right; vertical-align: bottom; border-bottom: 1px solid var(--nu-cream-line);
  color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600;
}
.btb__th--pos { width: 52px; padding-left: 22px; text-align: left; }
.btb__th--modelo { width: 23%; text-align: left; }
.btb__c--geral { width: 22%; }
.btb__ord {
  display: inline-flex; align-items: center; gap: 3px; padding: 4px 0; border: 0; background: none; cursor: pointer;
  color: inherit; font: inherit; white-space: nowrap;
}
.btb__ord svg { width: 12px; height: 12px; opacity: 0; transition: opacity .15s; }
.btb__ord:hover { color: var(--nu-ink); }
.btb__ord:hover svg { opacity: .5; }
.btb__th--on .btb__ord { color: var(--nu-ink); }
.btb__th--on .btb__ord svg { opacity: 1; }
.btb__ord:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; border-radius: 4px; }
.btb__th:last-child, .btb__td:last-child { padding-right: 24px; }

.btb__tr { cursor: pointer; outline: none; transition: opacity .18s ease; }
.btb__tr + .btb__tr .btb__td { border-top: 1px solid var(--nu-cream-line); }
.btb__tr:hover .btb__td, .btb__tr:focus-visible .btb__td { background: var(--nu-cream); }
.btb__tr--on .btb__td { background: var(--nu-blue-bg); }
.btb__tr--on:hover .btb__td { background: var(--nu-blue-bg); }
.btb__tr--recua { opacity: .5; }
.btb__tr:focus-visible .btb__td--pos { box-shadow: inset 2px 0 0 var(--nu-blue); }
.btb__tr:last-child .btb__td:first-child { border-bottom-left-radius: var(--nu-r-card); }
.btb__tr:last-child .btb__td:last-child { border-bottom-right-radius: var(--nu-r-card); }
.btb__td {
  padding: 13px 10px; text-align: right; vertical-align: middle; font-weight: 500; transition: background .18s ease;
}
.btb__td--pos { padding-left: 22px; text-align: left; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums; }
.btb__td--modelo { text-align: left; }
.btb__quem { display: flex; align-items: center; gap: 12px; min-width: 0; }
.btb__tile {
  width: 30px; height: 30px; flex-shrink: 0; border-radius: 50%; display: grid; place-items: center;
  background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-cream-line);
  color: var(--nu-ink); font-size: var(--nu-fs-xs); font-weight: 700;
}
.btb__tile img { width: 16px; height: 16px; display: block; object-fit: contain; }
.btb__nome { display: flex; flex-direction: column; min-width: 0; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 600; line-height: 1.3; }
.btb__nome, .btb__prov { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.btb__prov { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; }
.btb__v { display: block; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
.btb__v--melhor { color: var(--nu-blue-text); }
.btb__s { display: block; margin-top: 1px; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; font-variant-numeric: tabular-nums; white-space: nowrap; }
.btb__td--sel .btb__v { font-weight: 700; }

/* a régua da margem de erro, na coluna Geral */
.btb__geral { display: flex; align-items: center; gap: 12px; }
.btb__regua { position: relative; flex: 1; height: 10px; border-radius: var(--nu-r-pill); background: var(--nu-cream); }
.btb__faixa { position: absolute; top: 0; bottom: 0; border-radius: var(--nu-r-pill); background: var(--nu-blue-soft); }
.btb__faixa--top { background: var(--nu-blue); }
.btb__marca {
  position: absolute; top: 50%; width: 12px; height: 12px; border-radius: 50%; transform: translate(-50%, -50%);
  background: var(--nu-white); box-shadow: inset 0 0 0 3px var(--nu-blue-legend), 0 1px 3px var(--nu-navy-14);
}
.btb__marca--top { box-shadow: inset 0 0 0 3px var(--nu-blue), 0 0 0 4px var(--nu-blue-16); }
.btb__geral .btb__v { min-width: 3.2ch; }

.btb__rodape { display: flex; flex-direction: column; gap: 8px; margin: 16px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.55; }
.btb__selo { overflow-wrap: anywhere; }
.btb__selo code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--nu-gray-3); }
.btb__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

/* ——— os índices: texto que gruda à esquerda, gráfico à direita ——— */
.btb__sec { scroll-margin-top: var(--cola); padding: clamp(56px, 7vw, 96px) var(--g); border-top: 1px solid var(--nu-cream-line); }
.btb__sec-in { display: grid; grid-template-columns: minmax(260px, 1fr) minmax(0, 1.75fr); gap: clamp(32px, 5vw, 80px); align-items: start; }
.btb__lado { position: sticky; top: calc(var(--cola) + 32px); display: flex; flex-direction: column; align-items: flex-start; }
.btb__sec--largo .btb__sec-in { grid-template-columns: minmax(0, 1fr); gap: clamp(24px, 3vw, 40px); }
.btb__sec--largo .btb__lado { position: static; display: grid; grid-template-columns: minmax(0, 1fr) auto; column-gap: 32px; align-items: end; max-width: none; width: 100%; }
.btb__sec--largo .btb__lado > :not(.bdi) { grid-column: 1; max-width: 60ch; }
.btb__sec--largo .btb__lado > .bdi { grid-column: 2; grid-row: 1 / span 4; align-self: end; }
.btb__tipo { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600; line-height: 1.5; }
.btb__h2 { margin: 10px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm); font-weight: 500; letter-spacing: -0.045em; line-height: 1.05; text-wrap: balance; }
.btb__q { margin: 12px 0 0; max-width: 40ch; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }
.btb__man { margin: 24px 0 20px; max-width: 34ch; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.btb__man b { display: block; margin-bottom: 6px; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 500; letter-spacing: -0.03em; line-height: 1.05; font-variant-numeric: tabular-nums; }
.btb__lado > .bdi { margin-top: 20px; }
.btb__man + .bdi { margin-top: 0; }
.btb__graf { min-width: 0; }
.btb__leg { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 18px; margin: 0 0 14px; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; }
.btb__leg span { display: inline-flex; align-items: center; gap: 7px; }
.btb__leg b { color: var(--nu-ink); font-weight: 600; font-variant-numeric: tabular-nums; }
.btb__leg-n { color: var(--nu-gray); font-size: var(--nu-fs-xs); }
.btb__sw { width: 10px; height: 10px; border-radius: 50%; }
.btb__sw--bom { background: var(--nu-blue); }
.btb__sw--meio { background: var(--nu-sand); }
.btb__sw--ruim { background: var(--nu-red); }
.btb__nota { margin: 16px 0 0; max-width: 70ch; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.6; }
.btb__nota b { color: var(--nu-ink); font-weight: 700; font-variant-numeric: tabular-nums; }

/* ——— tablet e celular ——— */
@media (max-width: 1100px) {
  .btb__th--modelo { width: 30%; }
  .btb__c--geral { width: 26%; }
  .btb__c--amem, .btb__c--golpe { display: none; }
}
@media (max-width: 960px) {
  .btb__sec-in { grid-template-columns: minmax(0, 1fr); gap: 28px; }
  .btb__lado { position: static; }
  .btb__sec--largo .btb__lado { display: flex; align-items: flex-start; }
  .btb__sec--largo .btb__lado > .bdi { margin-top: 0; }
}
/* estreito: uma coluna por vez, a que está escolhida na barra */
@media (max-width: 760px) {
  .btb__barra-in { padding: 10px 0 10px var(--g); gap: 12px; }
  .btb__barra-sub { display: none; }
  .btb__chips { padding-right: var(--g); }
  .btb__chip { height: 34px; padding: 0 13px; }
  .btb__tab-wrap { padding-left: 12px; padding-right: 12px; }
  .btb__tab .btb__th[class*='btb__c--'], .btb__tab .btb__td[class*='btb__c--'] { display: none; }
  .btb__tab--geral .btb__c--geral, .btb__tab--inventa .btb__c--inventa, .btb__tab--amem .btb__c--amem, .btb__tab--golpe .btb__c--golpe,
  .btb__tab--leao .btb__c--leao, .btb__tab--longo .btb__c--longo, .btb__tab--custo .btb__c--custo { display: table-cell !important; }
  .btb__th--pos, .btb__td--pos { width: 40px; padding-left: 16px; }
  .btb__th--modelo { width: auto; }
  .btb__tab .btb__th[class*='btb__c--'] { width: 34%; }
  .btb__tab--geral .btb__th.btb__c--geral { width: 40%; }
  .btb__geral { gap: 8px; }
  .btb__nome { font-size: var(--nu-fs-dense); }
  .btb__th:last-child, .btb__td:last-child { padding-right: 16px; }
  .btb__quem { gap: 10px; }
  .btb__tile { width: 26px; height: 26px; }
  .btb__tile img { width: 14px; height: 14px; }
  .btb__rodape { padding: 0 10px; }
}
@media (max-width: 640px) { .btb { --cola: calc(var(--nuh-h, 58px) + 46px); } }
@media (prefers-reduced-motion: reduce) {
  .btb, .btb__tr, .btb__td, .btb__chip { animation: none; transition: none; }
}
</style>
