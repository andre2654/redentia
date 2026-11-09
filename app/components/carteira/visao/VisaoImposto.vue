<script setup lang="ts">
// "Imposto do mês" (07/11/2026; plano, Parte 4.5): a seção depois de "Quanto
// ele te paga", no idioma dela (eyebrow azul, a frase grande, a nota cinza, as
// listas de borda fina, a fileira de meses).
//  - a frase do mês: quanto ainda cabe vender sem imposto, ou "sem imposto";
//  - uma linha por grupo: ações contra os R$ 20 mil isentos; FII e ETF com o
//    lucro e a fatia do imposto; renda fixa, retida na fonte; "Custo
//    desconhecido" em âmbar quando falta o preço médio;
//  - o DARF do mês, quando houver (código 6015, último dia útil do mês seguinte);
//  - os últimos 12 meses, cada um com o selo; o clique abre as operações;
//  - a regra e a fonte no pé.
// Tudo vem calculado do backend (GET /me/carteira/visao → imposto); as frases
// saem de utils/impostoVisao.ts. Com a conexão parada, o mês atual espera: o
// histórico fica, porque o passado não depende do dado de hoje.
// 07/11, com a resposta real: a linha de cada grupo é a nota do backend (a
// explicação do mês, com os números), e não mais a frase da tela repetida antes
// dela; a operação sem quantidade (direito de subscrição) mostra só o valor.
import type { ImpostoVisao, MesHistorico, PosicaoVisao, SeloImposto } from '~/types/carteiraVisao'
import { SELO, diaMes, fraseDoMes, gruposDoMes, linhaDoGrupo, linhaDosPrejuizos, partesDosPrejuizos, linhaDoMesAnterior, mascararNota, mesCurto, mesEAno, mesesEmOrdem, nomeDoMes, quantidadeDaOperacao, textoDoGrupo, vendasNaBolsa } from '~/utils/impostoVisao'
import { brl0, brl2 } from '~/utils/carteiraVisao'

// as posições: os grupos que a pessoa tem e não vendeu no mês também aparecem, com a regra de cada um
const props = defineProps<{ imposto: ImpostoVisao; dadosDe: string | null; posicoes?: PosicaoVisao[] }>()
const { mask, hidden } = useHiddenValues()
const fmt = (v: number) => mask(brl0(v))
const daNota = (t: string) => (hidden.value ? mascararNota(t) : t)

const atual = computed(() => props.imposto.mesAtual)
const nome = computed(() => nomeDoMes(atual.value.mes))
const frase = computed(() => (props.dadosDe ? `O imposto de ${nome.value} espera a conexão voltar.` : fraseDoMes(atual.value, fmt)))
// 08/11, o dono pediu menos texto: o mês anterior só aparece quando pede ação (o DARF a pagar, ou
// o custo que falta); "outubro ficou isento, com R$ 8 em vendas" era ruído
const sub = computed(() => {
  if (props.dadosDe) return `Os dados são de ${props.dadosDe}: as vendas depois disso ainda não chegaram.`
  const ma = props.imposto.mesAnterior
  const pedeAcao = (ma.darf.valor ?? 0) > 0 || ma.grupos.some((g) => g.vendido > 0 && !g.custoConhecido && g.impostoEstimado == null && g.grupo !== 'cripto')
  return pedeAcao ? linhaDoMesAnterior(ma, fmt) : ''
})
const grupos = computed(() => (props.dadosDe ? [] : gruposDoMes(atual.value, props.posicoes ?? []).map((g) => {
  const l = linhaDoGrupo(g, atual.value.mes, fmt)
  // ações sem venda: a barra e o "R$ 20 mil livres" já dizem tudo, a frase repetia
  return { g, l, texto: g.grupo === 'acoes' && g.vendido <= 0 ? '' : textoDoGrupo(g, l, fmt, daNota) }
})))
// 08/11, o dono pediu mais "clean": o grupo que teve venda (e as ações, pela isenção) fica na linha
// inteira; o que não teve vira um bloco pequeno, lado a lado, com a regra em poucas palavras
const completos = computed(() => grupos.value.filter(({ g }) => g.grupo === 'acoes' || g.vendido > 0))
const compactos = computed(() => grupos.value.filter(({ g }) => !(g.grupo === 'acoes' || g.vendido > 0)))
const partesPrej = computed(() => (props.dadosDe ? [] : partesDosPrejuizos(atual.value)))
const ressalvaPrej = computed(() => props.imposto.historico.some((h) => h.selo === 'custo_desconhecido'))
// os grupos sem venda numa linha só: 'FII e ETF sem vendas no mês. Renda fixa com o imposto retido na fonte.'
const resto = computed(() => {
  const nomes = compactos.value.filter(({ g }) => g.grupo !== 'rf').map(({ l }) => l.nome)
  const partes: string[] = []
  if (nomes.length) partes.push(`${nomes.length > 1 ? `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}` : nomes[0]} sem vendas no mês.`)
  if (compactos.value.some(({ g }) => g.grupo === 'rf')) partes.push('Renda fixa com o imposto retido na fonte.')
  return partes.join(' ')
})
const prejuizos = computed(() => (props.dadosDe ? '' : linhaDosPrejuizos(atual.value, fmt, props.imposto.historico.some((h) => h.selo === 'custo_desconhecido'))))
const darf = computed(() => {
  const d = atual.value.darf
  return !props.dadosDe && d.valor != null && d.valor > 0 && d.vence ? { valor: d.valor, vence: d.vence, codigo: d.codigo } : null
})

/* ————— os últimos 12 meses ————— */
const meses = computed(() => mesesEmOrdem(props.imposto.historico))
// as barras contam só as vendas da bolsa (vendasNaBolsa): a renda fixa sai com o imposto retido
const maxVendas = computed(() => Math.max(1, ...meses.value.map((m) => vendasNaBolsa(m))))
const altura = (m: MesHistorico) => (vendasNaBolsa(m) > 0 ? Math.max(6, (vendasNaBolsa(m) / maxVendas.value) * 100) : 0)
const ORDEM_SELO: SeloImposto[] = ['isento', 'pago', 'a_conferir', 'custo_desconhecido', 'sem_venda']
const legenda = computed(() => ORDEM_SELO.filter((s) => meses.value.some((m) => m.selo === s)))
const aberto = ref<string | null>(null)
function abrirMes(m: MesHistorico) {
  if (!m.operacoes.length) return
  aberto.value = aberto.value === m.mes ? null : m.mes
}
const mesAberto = computed(() => meses.value.find((m) => m.mes === aberto.value) ?? null)
const capMes = (mes: string) => { const t = mesEAno(mes); return t.charAt(0).toUpperCase() + t.slice(1) }
const rotuloDoMes = (m: MesHistorico) => `${capMes(m.mes)}: ${SELO[m.selo].toLowerCase()}${vendasNaBolsa(m) ? `, ${fmt(vendasNaBolsa(m))} em vendas na bolsa` : ''}${m.operacoes.length ? '' : ', sem operações'}`
const fmtData = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`
/** a linha de baixo da operação: a quantidade (quando diz algo) e o nome */
const subDaOperacao = (o: MesHistorico['operacoes'][number]) =>
  [quantidadeDaOperacao(o), o.nome && o.nome !== o.ticker ? o.nome : null].filter(Boolean).join(' · ')
</script>

<template>
  <section class="vim" aria-labelledby="vim-titulo" data-clarity-mask="true">
    <span class="vim__eyebrow">Imposto do mês</span>
    <h2 id="vim-titulo" class="vim__frase">{{ frase }}</h2>
    <p v-if="sub" class="vim__sub">{{ sub }}</p>

    <!-- o mês atual, um grupo por linha -->
    <ul v-if="completos.length" class="vim__grupos">
      <li v-for="{ g, l, texto } in completos" :key="g.grupo" class="vim__grupo">
        <div class="vim__g-cab">
          <span class="vim__g-n">{{ l.nome }}<span v-if="l.semCusto" class="vim__tag">Custo desconhecido</span></span>
          <span class="vim__g-v">{{ l.direita }}</span>
        </div>
        <div
          v-if="l.barra?.tipo === 'isencao'" class="vim__trilho" role="img"
          :aria-label="`${l.nome}: ${fmt(g.vendido)} vendidos de ${brl0(g.isencao ?? 0)} isentos no mês`"
        >
          <span class="vim__vendido" :class="{ 'vim__vendido--passou': l.barra.passou }" :style="{ width: `${l.barra.pct}%` }" />
          <!-- o que ainda cabe sem imposto: sem venda, a barra inteira é o espaço livre (vazia, parecia quebrada) -->
          <span v-if="!l.barra.passou" class="vim__cabe" />
        </div>
        <div
          v-else-if="l.barra?.tipo === 'lucro'" class="vim__trilho" role="img"
          :aria-label="`${l.nome}: do lucro de ${fmt(g.lucro ?? 0)}, ${Math.round(l.barra.impostoPct)}% vão para o imposto`"
        >
          <span class="vim__imposto" :style="{ width: `${l.barra.impostoPct}%` }" />
          <span class="vim__fica" />
        </div>
        <p v-if="texto" class="vim__g-x">{{ texto }}</p>
      </li>
    </ul>

    <!-- os grupos sem venda no mês, numa linha; a alíquota de cada um mora no "Como funciona" -->
    <p v-if="resto" class="vim__resto">{{ resto }}</p>

    <!-- o prejuízo que sobra para abater, numa linha (a ressalva mora no "Como funciona") -->
    <p v-if="partesPrej.length" class="vim__prej" :aria-label="prejuizos">
      <span class="vim__prej-t">Prejuízo estimado para abater</span>
      <template v-for="(p, i) in partesPrej" :key="p.rotulo"><span v-if="i" class="vim__prej-s" aria-hidden="true">·</span><b>{{ fmt(p.valor) }}</b> {{ p.rotulo }}</template>
    </p>

    <p v-if="darf" class="vim__darf">
      <span class="vim__darf-t">DARF de {{ nome }}</span>
      <span class="vim__darf-v">{{ mask(brl2(darf.valor)) }}</span>
      <span class="vim__darf-d">vence em {{ diaMes(darf.vence) }}, código {{ darf.codigo }}</span>
    </p>

    <!-- os últimos 12 meses, com o selo -->
    <h3 class="vim__h3">Vendas na bolsa, mês a mês</h3>
    <ol class="vim__meses">
      <li v-for="m in meses" :key="m.mes">
        <button
          type="button" class="vim__mes" :class="[`vim__mes--${m.selo}`, { 'vim__mes--on': aberto === m.mes }]"
          :disabled="!m.operacoes.length" :aria-expanded="m.operacoes.length ? aberto === m.mes : undefined"
          :aria-controls="m.operacoes.length ? 'vim-ops' : undefined" :aria-label="rotuloDoMes(m)" :title="rotuloDoMes(m)" @click="abrirMes(m)"
        >
          <!-- sem o valor em cima de cada barra (eram 12 rótulos): ele aparece ao passar o mouse e no mês aberto -->
          <span class="vim__mes-b"><i :style="{ height: `${altura(m)}%` }" /></span>
          <span class="vim__mes-n">{{ mesCurto(m.mes) }}</span>
        </button>
      </li>
    </ol>
    <ul class="vim__legenda" aria-label="Os selos">
      <li v-for="s in legenda.filter((x) => x !== 'sem_venda')" :key="s"><i class="vim__k" :class="`vim__k--${s}`" aria-hidden="true" />{{ SELO[s] }}</li>
    </ul>

    <div v-if="mesAberto" id="vim-ops" class="vim__ops">
      <p class="vim__ops-t">{{ capMes(mesAberto.mes) }} <span>· {{ SELO[mesAberto.selo] }}{{ vendasNaBolsa(mesAberto) ? ` · ${fmt(vendasNaBolsa(mesAberto))} em vendas na bolsa` : '' }}</span></p>
      <ul class="vim__ops-l">
        <!-- a mesma venda pode vir duas vezes no dia (TAEE11 em 27/05): a chave leva a posição -->
        <li v-for="(o, i) in mesAberto.operacoes" :key="`${o.data}-${o.ticker}-${o.lado}-${i}`">
          <span class="vim__op-d">{{ fmtData(o.data) }}</span>
          <span class="vim__op-t">
            <span class="vim__op-tk">{{ o.ticker }}<span class="vim__lado" :class="`vim__lado--${o.lado}`">{{ o.lado === 'venda' ? 'Venda' : 'Compra' }}</span></span>
            <span v-if="subDaOperacao(o)" class="vim__op-q">{{ subDaOperacao(o) }}</span>
          </span>
          <span class="vim__op-v">{{ mask(brl2(o.valor)) }}</span>
        </li>
      </ul>
    </div>

  </section>
</template>

<style scoped>
.vim { background: var(--nu-white); padding: clamp(56px, 7.5vw, 96px) clamp(22px, 5.5vw, 80px); scroll-margin-top: calc(var(--nuh-h, 76px) + 56px); }
.vim__eyebrow { color: var(--nu-blue-text); font-size: var(--nu-fs-eyebrow); font-weight: 800; }
.vim__frase { margin: 12px 0 0; max-width: 860px; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm); font-weight: 800; letter-spacing: -0.035em; line-height: 1.08; font-variant-numeric: tabular-nums; text-wrap: balance; }
.vim__sub { margin: 14px 0 0; max-width: 760px; color: var(--nu-ink-75); font-size: var(--nu-fs-lg); font-weight: 600; line-height: 1.45; font-variant-numeric: tabular-nums; }

/* ——— o mês atual, por grupo ——— */
.vim__grupos { list-style: none; margin: clamp(26px, 3.4vw, 40px) 0 0; padding: 0; max-width: 1100px; }
.vim__grupo { padding: 16px 0; border-top: 1px solid var(--nu-cream-line); }
.vim__grupo:first-child { border-top: 0; padding-top: 0; }
.vim__g-cab { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 4px 16px; }
.vim__g-n { display: inline-flex; align-items: center; flex-wrap: wrap; gap: 6px 10px; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -0.01em; }
.vim__g-v { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
.vim__tag { display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: var(--nu-r-pill); background: var(--nu-amber-bg); color: var(--nu-amber-text); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: 0; }
.vim__trilho { display: flex; gap: 2px; height: 12px; margin-top: 10px; border-radius: 6px; background: var(--nu-cream); box-shadow: inset 0 0 0 1px var(--nu-cream-line); overflow: hidden; }
.vim__vendido { background: var(--nu-blue); border-radius: 6px; transform-origin: left; animation: vim-cresce .9s cubic-bezier(.22, 1, .36, 1) .1s both; }
.vim__vendido--passou { background: var(--nu-amber-fill); }
.vim__cabe { flex: 1; min-width: 0; background: var(--nu-green-bg); border-radius: 6px; }
/* os grupos sem venda: blocos pequenos, lado a lado */
.vim__resto { max-width: 1100px; margin: 18px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
/* o prejuízo para abater: um número por balde */
.vim__prej { max-width: 1100px; margin: 8px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.6; font-variant-numeric: tabular-nums; }
.vim__prej-t { margin-right: 8px; color: var(--nu-ink); font-weight: 700; }
.vim__prej b { color: var(--nu-ink); font-weight: 700; }
.vim__prej-s { margin: 0 8px; color: var(--nu-gray); }
.vim__imposto { background: var(--nu-amber-fill); border-radius: 6px 3px 3px 6px; transform-origin: left; animation: vim-cresce .9s cubic-bezier(.22, 1, .36, 1) .1s both; }
.vim__fica { flex: 1; background: color-mix(in srgb, var(--nu-blue) 35%, transparent); border-radius: 3px 6px 6px 3px; transform-origin: left; animation: vim-cresce .9s cubic-bezier(.22, 1, .36, 1) .3s both; }
@keyframes vim-cresce { from { transform: scaleX(0); } }
.vim__g-x { margin: 8px 0 0; max-width: 76ch; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; font-variant-numeric: tabular-nums; }

.vim__darf {
  display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px 14px; max-width: 1100px; box-sizing: border-box; margin: 8px 0 0; padding: 14px 18px;
  border-radius: var(--nu-r-input); background: var(--nu-cream); font-variant-numeric: tabular-nums;
}
.vim__darf-t { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; }
.vim__darf-v { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; }
.vim__darf-d { color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 600; }

/* ——— os últimos 12 meses: a fileira do "mês a mês" de Quanto ele te paga ——— */
.vim__h3 { margin: clamp(36px, 4.4vw, 52px) 0 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.02em; }
.vim__h3-s { margin: 6px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); line-height: 1.45; }
.vim__meses { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 6px; list-style: none; margin: 14px 0 0; padding: 0; max-width: 1100px; }
.vim__mes {
  display: grid; grid-template-rows: 92px auto; gap: 6px; width: 100%; padding: 8px 2px 0; border: 0; border-radius: 12px;
  background: transparent; font: inherit; text-align: center; cursor: pointer; transition: background .2s;
}
.vim__mes:disabled { cursor: default; }
.vim__mes:not(:disabled):hover { background: var(--nu-cream-hover); }
.vim__mes--on, .vim__mes--on:not(:disabled):hover { background: var(--nu-cream); }
.vim__mes:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.vim__mes-v { color: var(--nu-gray-3); font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
.vim__mes-b { display: flex; align-items: flex-end; justify-content: center; }
.vim__mes-b i { display: block; width: min(30px, 64%); border-radius: 4px 4px 0 0; }
.vim__mes-n { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600; border-top: 1px solid var(--nu-cream-line); padding: 6px 0 8px; }
.vim__mes--on .vim__mes-n, .vim__mes--on .vim__mes-v { color: var(--nu-ink); }
.vim__mes--isento .vim__mes-b i, .vim__k--isento { background: var(--nu-green); }
.vim__mes--pago .vim__mes-b i, .vim__k--pago { background: var(--nu-blue); }
.vim__mes--a_conferir .vim__mes-b i, .vim__k--a_conferir { background: var(--nu-amber-fill); }
/* custo desconhecido: listrado, para a cor não ser a única pista */
.vim__mes--custo_desconhecido .vim__mes-b i, .vim__k--custo_desconhecido { background: repeating-linear-gradient(135deg, var(--nu-amber-fill) 0 3px, color-mix(in srgb, var(--nu-amber-fill) 30%, transparent) 3px 6px); }
.vim__k--sem_venda { background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-cream-line); }
.vim__legenda { display: flex; flex-wrap: wrap; gap: 6px 20px; list-style: none; margin: 12px 0 0; padding: 0; }
.vim__legenda li { display: inline-flex; align-items: center; gap: 8px; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 600; }
.vim__k { width: 10px; height: 10px; border-radius: 3px; }

.vim__ops { max-width: 1100px; margin-top: 18px; padding: 16px 20px 6px; border-radius: var(--nu-r-tile); background: var(--nu-cream); animation: vim-fade .25s ease both; }
@keyframes vim-fade { from { opacity: 0; transform: translateY(4px); } }
.vim__ops-t { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; font-variant-numeric: tabular-nums; }
.vim__ops-t span { color: var(--nu-gray-3); font-weight: 600; }
.vim__ops-l { list-style: none; margin: 8px 0 0; padding: 0; }
.vim__ops-l li { display: grid; grid-template-columns: 52px minmax(0, 1fr) auto; align-items: baseline; gap: 12px; padding: 10px 0; border-top: 1px solid var(--nu-cream-line); font-size: var(--nu-fs-md); }
.vim__op-d { color: var(--nu-gray); font-weight: 700; font-variant-numeric: tabular-nums; }
.vim__op-t { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.vim__op-tk { display: inline-flex; align-items: center; gap: 8px; color: var(--nu-ink); font-weight: 800; }
.vim__op-q { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.45; font-variant-numeric: tabular-nums; }
.vim__op-v { color: var(--nu-ink); font-weight: 700; font-variant-numeric: tabular-nums; text-align: right; white-space: nowrap; }
.vim__lado { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: var(--nu-r-pill); font-size: var(--nu-fs-xs); font-weight: 700; }
.vim__lado--venda { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
.vim__lado--compra { background: var(--nu-blue-tint); color: var(--nu-blue-text); }


@media (max-width: 640px) {
  .vim__meses { grid-template-columns: repeat(6, minmax(0, 1fr)); row-gap: 10px; }
  .vim__mes { grid-template-rows: 64px auto; }
  .vim__ops { padding: 14px 14px 4px; }
  .vim__ops-l li { grid-template-columns: 44px minmax(0, 1fr) auto; gap: 10px; }
}
@media (prefers-reduced-motion: reduce) {
  .vim__vendido, .vim__imposto, .vim__fica, .vim__ops { animation: none; }
  .vim__mes { transition: none; }
}
</style>
