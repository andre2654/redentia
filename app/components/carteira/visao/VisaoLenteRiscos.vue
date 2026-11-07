<script setup lang="ts">
// A lente Riscos (06/11/2026): o que move a carteira. Cada ativo mora no
// fator que mais o move (ticker_factor_tags, consertadas: AUPO11 é Selic, não
// juros longos), então os fatores somam 100%. O efeito de cada cenário vem do
// motor de simulação (ScenarioEngine). Abaixo, quem protege a carteira e quem
// anda junto, pela correlação de 1 ano calculada dos preços.
//
// É também a vitrine dos vetos: "quem protege" é exatamente o que o motor
// não sugere vender.
//
// 07/11, com a resposta real: cada fator tem o "Como calculei", com o método
// do efeito (`FatorVisao.metodo`: o motor de cenários ou a conta simples); o
// Tesouro entra pelo nome curto, sem a taxa; os pares do "Andam juntos" com nome
// comprido quebram a linha em vez de passar por cima do número; e sem fatores
// (o bloco que quebrou no servidor vem []) a lente diz que não abriu.
import type { CarteiraVisao } from '~/types/carteiraVisao'
import { brl0, nomeCurto, pctTxt } from '~/utils/carteiraVisao'

const props = defineProps<{ visao: CarteiraVisao }>()
const { mask } = useHiddenValues()

const COR: Record<string, string> = {
  juros: '#7C5FD6', selic: '#1E8A94', brasil: '#2F6AFF', petroleo: '#E07A3F', dolar: '#0E9E63', ouro: '#C9A227',
}
const fatores = computed(() => props.visao.fatores.map((f) => ({ ...f, cor: COR[f.chave] ?? '#8F86B8' })))
const nomeDe = (t: string) => props.visao.posicoes.find((p) => p.ticker === t)
const rotuloDe = (t: string) => { const p = nomeDe(t); return p?.classe === 'TREASURY' ? nomeCurto(p.nome).replace('Tesouro ', '') : t }
const frase = computed(() => {
  const f = fatores.value[0]
  return f ? `${pctTxt(f.pct)} do seu dinheiro depende de ${f.nome.toLowerCase()}.` : ''
})
const ativo = ref<string | null>(null)
// o "Como calculei" de um fator por vez
const comoAberto = ref<string | null>(null)
const alternarComo = (chave: string) => { comoAberto.value = comoAberto.value === chave ? null : chave }
const corr = (c: number) => (c < 0 ? `−${Math.abs(c).toFixed(2).replace('.', ',')}` : c.toFixed(2).replace('.', ','))
</script>

<template>
  <div class="vlr">
    <template v-if="!fatores.length">
      <h3 class="vlr__frase">Os riscos não abriram agora.</h3>
      <p class="vlr__nota">A conta dos fatores falhou deste lado. As outras lentes e o resto da carteira estão certos.</p>
    </template>
    <template v-else>
    <h3 class="vlr__frase">{{ frase }}</h3>
    <p class="vlr__nota">Cada ativo conta no fator que mais o move. O efeito de cada cenário sai do motor de simulação da Redentia.</p>

    <div class="vlr__barra" role="img" :aria-label="fatores.map((f) => `${f.nome} ${pctTxt(f.pct)}`).join(', ')">
      <span
        v-for="f in fatores" :key="f.chave" class="vlr__seg" :class="{ 'vlr__seg--apagado': ativo && ativo !== f.chave }"
        :style="{ flexGrow: f.valor, background: f.cor }"
      />
    </div>

    <ul class="vlr__lista">
      <li
        v-for="f in fatores" :key="f.chave" class="vlr__linha" :class="{ 'vlr__linha--apagada': ativo && ativo !== f.chave }" tabindex="0"
        @pointerenter="ativo = f.chave" @pointerleave="ativo = null" @focus="ativo = f.chave" @blur="ativo = null"
      >
        <span class="vlr__ponto" :style="{ '--c': f.cor }" aria-hidden="true" />
        <span class="vlr__nome">
          <span class="vlr__nome-t">{{ f.nome }}</span>
          <span class="vlr__sub">{{ f.tickers.map(rotuloDe).join(', ') }}</span>
        </span>
        <span class="vlr__se">
          <span class="vlr__se-c">{{ f.seCenario }}</span>
          <span class="vlr__se-e" :class="`vlr__se-e--${f.efeitoDir}`">{{ mask(f.efeito) }}</span>
          <button
            v-if="f.metodo" type="button" class="vlr__como" :aria-expanded="comoAberto === f.chave" :aria-controls="`vlr-como-${f.chave}`"
            @click="alternarComo(f.chave)"
          >
            Como calculei
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </button>
        </span>
        <span class="vlr__valores">
          <span class="vlr__pct">{{ pctTxt(f.pct) }}</span>
          <span class="vlr__valor">{{ mask(brl0(f.valor)) }}</span>
        </span>
        <p v-if="comoAberto === f.chave" :id="`vlr-como-${f.chave}`" class="vlr__prova">{{ f.metodo }}</p>
      </li>
    </ul>
    </template>

    <div v-if="visao.protecoes.length || visao.juntos.length" class="vlr__duas">
      <div v-if="visao.protecoes.length">
        <h4 class="vlr__h4">Quem protege a carteira</h4>
        <p class="vlr__h4-s">Andam pouco ou ao contrário do resto. Por isso ficam de fora das trocas que o motor simula, mesmo os que pagam pouco provento.</p>
        <ul class="vlr__mini">
          <li v-for="p in visao.protecoes" :key="p.ticker">
            <NuxtLink :to="`/asset/${p.ticker}`" class="vlr__mini-t">{{ p.ticker }}</NuxtLink>
            <span class="vlr__mini-x">{{ p.porque }}</span>
            <span class="vlr__mini-c" :class="{ 'vlr__mini-c--neg': p.correlacao < 0 }" :title="'Correlação de 1 ano com o resto da carteira'">{{ corr(p.correlacao) }}</span>
          </li>
        </ul>
      </div>
      <div v-if="visao.juntos.length">
        <h4 class="vlr__h4">Andam juntos</h4>
        <p class="vlr__h4-s">Quando um cai, o outro tende a cair junto. Ter os dois quase não diversifica.</p>
        <ul class="vlr__mini vlr__mini--pares">
          <li v-for="j in visao.juntos" :key="`${j.a}-${j.b}`">
            <span class="vlr__mini-t">{{ j.a }} e {{ j.b }}</span>
            <span class="vlr__mini-x">{{ j.correlacao >= 0.9 ? 'Quase o mesmo ativo.' : j.correlacao >= 0.7 ? 'Muito parecidos.' : 'Parecidos.' }}</span>
            <span class="vlr__mini-c">{{ corr(j.correlacao) }}</span>
          </li>
        </ul>
      </div>
    </div>
    <p v-if="visao.protecoes.length || visao.juntos.length" class="vlr__fonte">Correlação de 1 ano, dos preços de fechamento. Vai de −1 (andam ao contrário) a 1 (andam iguais).</p>
  </div>
</template>

<style scoped>
.vlr__frase { margin: 0; max-width: 860px; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm); font-weight: 800; letter-spacing: -0.035em; line-height: 1.08; text-wrap: balance; }
.vlr__nota { margin: 16px 0 0; max-width: 620px; color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; }
.vlr__barra { display: flex; gap: 2px; height: 14px; margin-top: clamp(26px, 3.4vw, 40px); }
.vlr__seg { flex-basis: 0; min-width: 4px; border-radius: 4px; transition: opacity .25s; }
.vlr__seg--apagado { opacity: .3; }
.vlr__lista { list-style: none; margin: clamp(14px, 2vw, 22px) 0 0; padding: 0; }
.vlr__linha {
  display: grid; grid-template-columns: 12px minmax(0, 1.1fr) minmax(0, 1fr) auto; align-items: center; gap: 16px;
  padding: 16px 10px; margin: 0 -10px; border-radius: var(--nu-r-chip); border-top: 1px solid var(--nu-cream-2); transition: background .18s, opacity .25s; outline: none;
}
.vlr__linha:first-child { border-top: none; }
.vlr__linha:hover { background: var(--nu-row-hover); }
.vlr__linha:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.vlr__linha--apagada { opacity: .5; }
.vlr__ponto { width: 12px; height: 12px; border-radius: 50%; background: var(--c); box-shadow: 0 0 0 4px color-mix(in srgb, var(--c) 16%, transparent); }
.vlr__nome { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.vlr__nome-t { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -0.01em; }
.vlr__sub { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vlr__se { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.vlr__se-c { color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 500; }
.vlr__se-e { font-size: var(--nu-fs-md); font-weight: 700; font-variant-numeric: tabular-nums; }
.vlr__se-e--down { color: var(--nu-red-text); }
.vlr__se-e--up { color: var(--nu-green-text, var(--nu-green)); }
.vlr__valores { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
.vlr__como { display: inline-flex; align-items: center; gap: 4px; align-self: flex-start; margin-top: 2px; padding: 2px 0; border: 0; background: none; cursor: pointer; color: var(--nu-blue-text); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap; }
.vlr__como svg { transition: transform .2s; }
.vlr__como[aria-expanded='true'] svg { transform: rotate(180deg); }
.vlr__como:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; border-radius: 4px; }
.vlr__prova { grid-column: 2 / -1; margin: 4px 0 0; padding: 12px 14px; max-width: 80ch; border-radius: 12px; background: var(--nu-cream); color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; animation: nu-fade .2s ease both; }
.vlr__pct { color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; font-variant-numeric: tabular-nums; }
.vlr__valor { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums; }

.vlr__duas { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px clamp(28px, 4vw, 64px); margin-top: clamp(32px, 4vw, 52px); padding-top: clamp(24px, 3vw, 36px); border-top: 1px solid var(--nu-cream-line); }
.vlr__h4 { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.02em; }
.vlr__h4-s { margin: 6px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.vlr__mini { list-style: none; margin: 12px 0 0; padding: 0; }
.vlr__mini li { display: grid; grid-template-columns: minmax(84px, auto) minmax(0, 1fr) auto; align-items: baseline; gap: 12px; padding: 11px 0; border-top: 1px solid var(--nu-cream-2); }
/* os pares têm nome comprido (dois títulos do Tesouro): o nome na linha de cima, a frase e o número embaixo */
.vlr__mini--pares li { grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: 't c' 'x x'; row-gap: 2px; }
.vlr__mini--pares .vlr__mini-t { grid-area: t; }
.vlr__mini--pares .vlr__mini-x { grid-area: x; }
.vlr__mini--pares .vlr__mini-c { grid-area: c; }
.vlr__mini-t { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; text-decoration: none; }
a.vlr__mini-t:hover { color: var(--nu-blue-text); }
.vlr__mini-x { color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.45; }
.vlr__mini-c { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; font-variant-numeric: tabular-nums; }
.vlr__mini-c--neg { color: var(--nu-green-text, var(--nu-green)); }
.vlr__fonte { margin: 18px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; }

@media (max-width: 900px) {
  .vlr__linha { grid-template-columns: 12px minmax(0, 1fr) auto; }
  .vlr__se { grid-column: 2 / -1; grid-row: 2; }
  .vlr__prova { grid-row: 3; }
  .vlr__duas { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 480px) {
  /* quem protege: o ticker em cima, a frase e o número embaixo (a frase não cabe em 3 colunas) */
  .vlr__mini li { grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: 't c' 'x x'; row-gap: 2px; }
  .vlr__mini-t { grid-area: t; }
  .vlr__mini-x { grid-area: x; }
  .vlr__mini-c { grid-area: c; }
}
@media (prefers-reduced-motion: reduce) {
  .vlr__prova { animation: none; }
  .vlr__como svg { transition: none; }
}
</style>
