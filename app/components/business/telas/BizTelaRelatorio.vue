<script setup lang="ts">
/**
 * A capa do relatório "Carta do private" (o roteiro de get_client_report,
 * mcp-service/src/relatorio.ts): fundo branco, títulos em marinho, azul só nos
 * destaques, verde e vermelho só nos números; na capa, o cliente, a data dos
 * preços, o patrimônio, a alocação por classe, três destaques (maior posição,
 * maior alta e maior queda do dia) e, na página dos cenários, a faixa de cada
 * um. Quem monta o documento é o assistente do escritório; a marca é a da
 * casa ("Se o assessor informar nome, cor e logo do escritório, use a marca
 * dele"), por isso o canto de cima é o lugar da marca, não um logo inventado.
 *
 * Dado: a carteira de exemplo e o pregão de 03/11/2026; o cenário é o do motor
 * de 04/11/2026. `tocar` faz a folha sair uma vez (sobe e assenta) e a segunda
 * folha deslizar por trás.
 */
import { EXEMPLO_CENARIO as X, EXEMPLO_PREGAO as P, diaTxt, reaisCurto } from '~/content/business/exemplo-cenario'

withDefaults(defineProps<{ tocar?: boolean }>(), { tocar: false })

const CLASSES = [
  { nome: 'Ações', peso: 45, tom: 'var(--nu-tela-marinho)' },
  { nome: 'Renda fixa', peso: 30, tom: 'var(--nu-blue-deep)' },
  { nome: 'ETFs', peso: 15, tom: 'var(--nu-blue)' },
  { nome: 'FIIs', peso: 10, tom: 'var(--nu-blue-soft)' },
]
const comDia = P.posicoes.filter((p) => p.dia != null) as { ticker: string; dia: number }[]
const alta = comDia.reduce((a, b) => (b.dia > a.dia ? b : a))
const queda = comDia.reduce((a, b) => (b.dia < a.dia ? b : a))
</script>

<template>
  <div class="btr" :class="{ 'btr--tocar': tocar }">
    <div class="btr__folha btr__folha--tras" aria-hidden="true">
      <p class="btr__sec">Cenários para 12 meses</p>
      <p class="btr__cen">{{ X.cenario }}</p>
      <p class="btr__faixa">{{ reaisCurto(X.final.p10) }} a {{ reaisCurto(X.final.p90) }}</p>
    </div>
    <div class="btr__folha">
      <div class="btr__topo">
        <span class="btr__marca">A marca do escritório</span>
        <span class="btr__data">Preços de {{ P.data }}</span>
      </div>
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
      <p class="btr__pe">dados e cenários Redentia</p>
    </div>
  </div>
</template>

<style scoped>
.btr { position: relative; padding: 18px 26px 10px 0; font-variant-numeric: tabular-nums; }
.btr__folha {
  position: relative; padding: 26px 26px 18px; border-radius: 10px; background: var(--nu-white); color: var(--nu-ink);
  box-shadow: 0 0 0 1px rgba(12, 21, 36, .08), 0 30px 60px -30px rgba(12, 21, 36, .45);
}
.btr__folha--tras { position: absolute; inset: 0 0 26px 26px; transform: rotate(2.5deg); background: var(--nu-white); }
.btr__sec { margin: 0; color: var(--nu-tela-marinho); font-size: var(--nu-fs-xs); font-weight: 800; text-align: right; }
.btr__cen, .btr__faixa { margin: 4px 0 0; color: var(--nu-tela-apoio); font-size: var(--nu-fs-xs); font-weight: 600; text-align: right; }
.btr__topo { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-bottom: 14px; border-bottom: 1px solid var(--nu-tela-linha); }
.btr__marca { padding: 6px 12px; border-radius: 8px; box-shadow: inset 0 0 0 1px var(--nu-tela-linha); color: var(--nu-tela-apoio); font-size: var(--nu-fs-xs); font-weight: 700; }
.btr__data { color: var(--nu-tela-apoio); font-size: var(--nu-fs-xs); font-weight: 500; }
.btr__tipo { margin: 18px 0 0; color: var(--nu-blue); font-size: var(--nu-fs-xs); font-weight: 700; }
.btr__cliente { margin: 2px 0 0; color: var(--nu-tela-marinho); font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.03em; }
.btr__rot { margin: 14px 0 0; color: var(--nu-tela-apoio); font-size: var(--nu-fs-xs); font-weight: 600; }
.btr__pat { margin: 0; color: var(--nu-tela-marinho); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.02em; }
.btr__barra { display: flex; gap: 2px; height: 8px; margin-top: 12px; }
.btr__barra span { flex-basis: 0; border-radius: 2px; }
.btr__classes { display: flex; flex-wrap: wrap; gap: 4px 12px; margin-top: 8px; color: var(--nu-tela-apoio); font-size: var(--nu-fs-xs); font-weight: 500; }
.btr__classes span { display: inline-flex; align-items: center; gap: 5px; }
.btr__classes i { width: 7px; height: 7px; border-radius: 2px; }
.btr__dest { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--nu-tela-linha); }
.btr__dest small { display: block; color: var(--nu-tela-apoio); font-size: var(--nu-fs-xs); font-weight: 500; }
.btr__dest b { display: block; margin-top: 2px; color: var(--nu-tela-marinho); font-size: var(--nu-fs-sm); font-weight: 800; }
.btr__dest em { display: block; font-style: normal; font-size: var(--nu-fs-sm); font-weight: 700; color: var(--nu-tela-apoio); }
.btr__alta { color: var(--nu-tela-alta) !important; }
.btr__queda { color: var(--nu-tela-queda) !important; }
.btr__pe { margin: 16px 0 0; color: var(--nu-tela-nota); font-size: var(--nu-fs-xs); font-weight: 500; text-align: right; }
/* a folha sai, uma vez */
.btr--tocar .btr__folha:not(.btr__folha--tras) { animation: btr-sai .9s cubic-bezier(.2, .8, .2, 1) backwards .2s; }
.btr--tocar .btr__folha--tras { animation: btr-tras 1s cubic-bezier(.2, .8, .2, 1) backwards .7s; }
@keyframes btr-sai { from { opacity: 0; transform: translateY(28px) scale(.97); } }
@keyframes btr-tras { from { opacity: 0; transform: rotate(0deg) translateX(-20px); } }
@media (prefers-reduced-motion: reduce) { .btr * { animation: none !important; } }
</style>
