<script setup lang="ts">
/**
 * Uma página do relatório "Carta do private" (o roteiro de get_client_report,
 * mcp-service/src/relatorio.ts): fundo branco, títulos em marinho, azul só nos
 * destaques, verde e vermelho só nos números, tabelas com linhas finas e o
 * rodapé discreto "dados e cenários Redentia". Quem monta o documento é o
 * assistente do escritório, e a marca é a da casa ("Se o assessor informar
 * nome, cor e logo do escritório, use a marca dele"), por isso o canto de cima
 * é o lugar da marca, não um logo inventado.
 *
 * `pagina`:
 *  - 'capa' (página 1): cliente, data dos preços, patrimônio, alocação por
 *    classe e os três destaques (maior posição, maior alta e maior queda do dia);
 *  - 'cenarios' (página 3): a faixa do pessimista ao otimista em reais de hoje,
 *    o meio, quanto cada ponta é em relação a hoje e quem mais sente o choque,
 *    com o porquê em uma linha (resumido do `why` do motor), e o aviso.
 * Dado: a carteira de exemplo, o pregão de 03/11/2026 e o motor de 04/11/2026.
 * `tocar` faz a folha sair, uma vez.
 */
import { EXEMPLO_CENARIO as X, EXEMPLO_PREGAO as P, choqueTxt, diaTxt, reaisCurto } from '~/content/business/exemplo-cenario'

withDefaults(defineProps<{ tocar?: boolean; pagina?: 'capa' | 'cenarios' }>(), { tocar: false, pagina: 'capa' })

const CLASSES = [
  { nome: 'Ações', peso: 45, tom: 'var(--nu-tela-marinho)' },
  { nome: 'Renda fixa', peso: 30, tom: 'var(--nu-blue-deep)' },
  { nome: 'ETFs', peso: 15, tom: 'var(--nu-blue)' },
  { nome: 'FIIs', peso: 10, tom: 'var(--nu-blue-soft)' },
]
const comDia = P.posicoes.filter((p) => p.dia != null) as { ticker: string; dia: number }[]
const alta = comDia.reduce((a, b) => (b.dia > a.dia ? b : a))
const queda = comDia.reduce((a, b) => (b.dia < a.dia ? b : a))
const f = X.final
const vs = (v: number) => {
  const p = ((v - X.inicio) / X.inicio) * 100
  return `${p > 0 ? '+' : '−'}${Math.abs(p).toFixed(1).replace('.', ',')}%`
}
/* o porquê, resumido do `why` que o motor devolveu em 04/11/2026 */
const SENTEM = [
  { tk: 'LREN3', ch: -30.8, por: 'Ibovespa e consumo doméstico' },
  { tk: 'ITUB4', ch: -21.9, por: 'acompanha o Ibovespa' },
  { tk: 'IVVB11', ch: 9.9, por: 'dólar alto e exterior' },
]
</script>

<template>
  <div class="btr" :class="{ 'btr--tocar': tocar }">
    <div class="btr__topo">
      <span class="btr__marca">A marca do escritório</span>
      <span class="btr__data">{{ pagina === 'capa' ? `Preços de ${P.data}` : `Página 3 · ${X.data}` }}</span>
    </div>

    <template v-if="pagina === 'capa'">
      <p class="btr__tipo">Carta do private</p>
      <p class="btr__cliente">Mariana Ribeiro Costa</p>
      <p class="btr__rot">Patrimônio</p>
      <p class="btr__pat">R$ 1.000.000,00</p>
      <div class="btr__barra"><span v-for="c in CLASSES" :key="c.nome" :style="{ flexGrow: c.peso, background: c.tom }" /></div>
      <div class="btr__classes"><span v-for="c in CLASSES" :key="c.nome"><i :style="{ background: c.tom }" />{{ c.nome }} {{ c.peso }}%</span></div>
      <div class="btr__dest">
        <div><small>Maior posição</small><b>Tesouro Selic</b><em>30%</em></div>
        <div><small>Maior alta do dia</small><b>{{ alta.ticker }}</b><em class="btr__alta">{{ diaTxt(alta.dia) }}</em></div>
        <div><small>Maior queda do dia</small><b>{{ queda.ticker }}</b><em class="btr__queda">{{ diaTxt(queda.dia) }}</em></div>
      </div>
    </template>

    <template v-else>
      <p class="btr__tipo">Cenários para 12 meses</p>
      <p class="btr__cliente">{{ X.cenario }}</p>
      <div class="btr__pontas">
        <div><small>Pessimista</small><b>{{ reaisCurto(f.p10) }}</b><em>{{ vs(f.p10) }}</em></div>
        <div><small>Meio</small><b>{{ reaisCurto(f.p50) }}</b><em>{{ vs(f.p50) }}</em></div>
        <div><small>Otimista</small><b>{{ reaisCurto(f.p90) }}</b><em>{{ vs(f.p90) }}</em></div>
      </div>
      <table class="btr__tab">
        <tbody>
          <tr v-for="s in SENTEM" :key="s.tk"><th>{{ s.tk }}</th><td>{{ s.por }}</td><td :class="s.ch > 0 ? 'btr__alta' : 'btr__queda'">{{ choqueTxt(s.ch) }}</td></tr>
        </tbody>
      </table>
    </template>

    <p class="btr__pe">dados e cenários Redentia</p>
  </div>
</template>

<style scoped>
.btr {
  padding: 28px 28px 18px; border-radius: 6px; background: var(--nu-white); color: var(--nu-ink); font-variant-numeric: tabular-nums;
  box-shadow: 0 0 0 1px rgba(12, 21, 36, .08), 0 40px 80px -40px rgba(12, 21, 36, .5);
}
.btr__topo { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-bottom: 14px; border-bottom: 1px solid var(--nu-tela-linha); }
.btr__marca { padding: 6px 12px; border-radius: 8px; box-shadow: inset 0 0 0 1px var(--nu-tela-linha); color: var(--nu-tela-apoio); font-size: var(--nu-fs-xs); font-weight: 700; }
.btr__data { color: var(--nu-tela-apoio); font-size: var(--nu-fs-xs); font-weight: 500; }
.btr__tipo { margin: 20px 0 0; color: var(--nu-blue); font-size: var(--nu-fs-xs); font-weight: 700; }
.btr__cliente { margin: 2px 0 0; color: var(--nu-tela-marinho); font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.03em; line-height: 1.15; }
.btr__rot { margin: 16px 0 0; color: var(--nu-tela-apoio); font-size: var(--nu-fs-xs); font-weight: 600; }
.btr__pat { margin: 0; color: var(--nu-tela-marinho); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.02em; }
.btr__barra { display: flex; gap: 2px; height: 8px; margin-top: 12px; }
.btr__barra span { flex-basis: 0; border-radius: 2px; }
.btr__classes { display: flex; flex-wrap: wrap; gap: 4px 12px; margin-top: 8px; color: var(--nu-tela-apoio); font-size: var(--nu-fs-xs); font-weight: 500; }
.btr__classes span { display: inline-flex; align-items: center; gap: 5px; }
.btr__classes i { width: 7px; height: 7px; border-radius: 2px; }
.btr__dest, .btr__pontas { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 18px; padding-top: 12px; border-top: 1px solid var(--nu-tela-linha); }
.btr__dest small, .btr__pontas small { display: block; color: var(--nu-tela-apoio); font-size: var(--nu-fs-xs); font-weight: 500; }
.btr__dest b, .btr__pontas b { display: block; margin-top: 2px; color: var(--nu-tela-marinho); font-size: var(--nu-fs-sm); font-weight: 800; white-space: nowrap; }
.btr__dest em, .btr__pontas em { display: block; font-style: normal; font-size: var(--nu-fs-sm); font-weight: 700; color: var(--nu-tela-apoio); }
.btr__tab { width: 100%; margin-top: 16px; border-collapse: collapse; font-size: var(--nu-fs-dense); }
.btr__tab th, .btr__tab td { padding: 9px 0; border-top: 1px solid var(--nu-tela-linha); text-align: left; }
.btr__tab th { color: var(--nu-tela-marinho); font-weight: 800; }
.btr__tab td { color: var(--nu-tela-apoio); font-weight: 500; }
.btr__tab td:last-child { text-align: right; font-weight: 700; }
.btr .btr__alta { color: var(--nu-tela-alta); }
.btr .btr__queda { color: var(--nu-tela-queda); }
.btr__pe { margin: 18px 0 0; color: var(--nu-tela-nota); font-size: var(--nu-fs-xs); font-weight: 500; text-align: right; }
.btr--tocar { animation: btr-sai .9s cubic-bezier(.2, .8, .2, 1) backwards .2s; }
@keyframes btr-sai { from { opacity: 0; transform: translateY(32px) scale(.97); } }
@media (prefers-reduced-motion: reduce) { .btr { animation: none !important; } }
</style>
