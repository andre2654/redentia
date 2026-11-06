<script setup lang="ts">
// SÓ NO DEV (06/11/2026): a /carteira nova inteira, sem sessão, com o mock de
// app/dev/carteiraVisaoMock.ts. Serve para desenhar e tirar print sem entrar
// na conta de ninguém. Na /carteira de verdade, com sessão, o dev mostra a
// mesma tela (CarteiraContent → CarteiraVisao); ?visao=antiga volta à antiga.
// O topo daqui também é mock: uma curva de 12 meses que termina no patrimônio
// do mock, e um Ibovespa sintético. ?cenario=normal|calmo|velho|semgasto.
// Fora do `nuxi dev` a rota nem existe (pages/dev/ sai no nuxt.config).
import type { CarteiraPayload } from '~/types/carteira'
import type { SeriesPoint } from '~/types/acao'
import { visaoMock } from '~/dev/carteiraVisaoMock'
import { brl2 } from '~/utils/carteiraVisao'
import CarteiraVisao from '~/components/carteira/visao/CarteiraVisao.vue'

definePageMeta({
  middleware: [() => {
    if (!import.meta.dev) return abortNavigation(createError({ statusCode: 404, statusMessage: 'Página não encontrada' }))
  }],
})
useSeoMeta({ title: 'Carteira nova (dev)', robots: 'noindex, nofollow' })

/** uma curva que anda sem saltar e termina em `fim` (semente fixa: o print não muda) */
function serie(dias: number, inicio: number, fim: number, ruido: number, semente: number): SeriesPoint[] {
  let s = semente
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647 - 0.5 }
  const bruto: number[] = []
  let x = 0
  for (let i = 0; i <= dias; i++) { x += rnd() * ruido; bruto.push(x) }
  const out: SeriesPoint[] = []
  const hoje = new Date()
  for (let i = 0; i <= dias; i++) {
    const t = i / dias
    const desvio = bruto[i]! - bruto[dias]! * t
    const d = new Date(hoje)
    d.setDate(d.getDate() - (dias - i))
    out.push({ t: d.toISOString().slice(0, 10), v: (inicio + (fim - inicio) * t) * (1 + desvio) })
  }
  return out
}

const v = visaoMock('normal')
const pontos = serie(365, v.patrimonio / 1.071, v.patrimonio, 0.006, 7)
const ibov = serie(365, 128000, 141200, 0.009, 11)
const payload = {
  hero: { state: 'patrimonio', patrimonio: brl2(v.patrimonio), stats: [
    { label: 'Rendimento em 12 meses', value: '+R$ 42.770 (+7,1%)', tone: 'green' },
    { label: 'Proventos em 12 meses', value: 'R$ 12.940', tone: 'ink' },
  ] },
  agora: {
    priceDate: new Date().toISOString().slice(0, 10), carteiraPct: -0.31, bolsaPct: -0.52, diaValor: '−R$ 2.005,60', diaPct: '−0,31%', diaDir: 'down',
    alerta: null, patrimonio: brl2(v.patrimonio), ativos: `${v.posicoes.length} ativos`, atualizado: null, provento: false, proventoDoDia: null,
  },
  allocation: [], groups: [], positionsSub: null, raiox: null, income: null, movements: null, heatmap: null,
  chart: { points: pontos, collecting: false, currentLabel: brl2(v.patrimonio), ibov12m: ibov, cdiRate: 14.9 },
} as unknown as CarteiraPayload
</script>

<template>
  <CarteiraVisao :payload="payload" />
</template>
