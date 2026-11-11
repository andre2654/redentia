<script setup lang="ts">
/**
 * /calculadora/preco-teto/{metodo} — uma página por MÉTODO de valuation.
 * A rota [metodo].vue despacha: slug de método cai aqui; ticker cai em
 * CalcPrecoTetoTicker.vue. A matemática vem de ~/utils/preco-teto.
 * Aportou, 11/11/2026: a conta entrou no padrão das outras calculadoras
 * (CalcConta + a frase com os valores nos selos, CalcNumero, CalcBarras). Os
 * rótulos de antes são o título do painel de cada selo e seguem no HTML do
 * servidor em "Os dados desta conta". Fórmula, valores padrão e textos iguais.
 */
import { PRECO_TETO_METODOS, PRECO_TETO_METODO_SLUGS } from '~/content/calculadoras/preco-teto-metodos'
import { priceByMethod, metrics } from '~/utils/preco-teto'

const { slug } = defineProps<{ slug: string }>()
const m = PRECO_TETO_METODOS[slug]!

const CONTENT_VERSION = '2026-08-03'
const lastUpdatedISO = new Date(CONTENT_VERSION).toISOString().slice(0, 10)
const lastUpdatedText = new Date(CONTENT_VERSION).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

/* ————— calculadora focada no método ————— */
// Defaults = o mesmo exemplo ITUB4 da página-mãe, pra os dois números baterem
// quando o usuário navega de uma pra outra.
const price = ref(28)
const lpa = ref(3.5)
const vpa = ref(18)
const dividend = ref(1.8)
const sectorPL = ref(10)
const growth = ref(0)

const usa = (campo: string) => m.inputs.includes(campo as (typeof m.inputs)[number])
// na frase, o último dado entra com "e"; os outros, com vírgula
const liga = (campo: string) => (m.inputs[m.inputs.length - 1] === campo ? ' e ' : ', ')

const resultado = computed(() => {
  const teto = priceByMethod(m.id, {
    price: price.value,
    lpa: lpa.value,
    vpa: vpa.value,
    dividend: dividend.value,
    sectorPL: sectorPL.value,
    dividendGrowth: growth.value / 100,
  })
  return metrics(teto, price.value)
})

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number.isFinite(v) ? v : 0)
const pct = (v: number) => `${(v * 100).toFixed(1).replace('.', ',')}%`
const num = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
const tomDoSelo = { ok: 'ok', neutro: 'azul', alerta: 'falta' } as const

// o desenho: o preço atual de referência e o preço teto contra ele (a mesma régua da página-mãe)
const barras = computed(() => {
  const r = resultado.value
  const cabe = price.value > 0 && r.fairPrice > 0
  // as duas barras na mesma escala, a do maior dos dois valores (como na página-mãe)
  const maior = Math.max(price.value, r.fairPrice, 0.01)
  const largura = (v: number) => `${Math.max(2, Math.min(100, (v / maior) * 100)).toFixed(1)}%`
  return [
    { rotulo: 'Preço atual', valor: brl(price.value), largura: cabe ? largura(price.value) : '100%', tom: 'preco' as const },
    { rotulo: 'Preço teto', valor: brl(r.fairPrice), largura: cabe ? largura(r.fairPrice) : null },
  ]
})

const veredito = computed(() => {
  const r = resultado.value
  if (!(r.fairPrice > 0) || !(price.value > 0)) return null
  if (r.ratio < 0.8) return { rotulo: 'Barato', tom: 'ok' as const, texto: `Negocia ${pct(Math.abs(r.margin))} abaixo do preço teto por este método.` }
  if (r.ratio <= 1) return { rotulo: 'Justo', tom: 'neutro' as const, texto: 'Está próximo do preço teto, sem margem de segurança relevante.' }
  return { rotulo: 'Caro', tom: 'alerta' as const, texto: `Negocia ${pct(Math.abs(r.margin))} acima do preço teto por este método.` }
})

/** Os outros métodos, pra cross-link (é o que faz o cluster existir como cluster). */
const outros = PRECO_TETO_METODO_SLUGS.filter((s) => s !== slug).map((s) => PRECO_TETO_METODOS[s]!)

usePageSeo({
  title: m.metaTitle,
  description: m.metaDescription,
  path: `/calculadora/preco-teto/${slug}`,
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadoras' },
    { name: 'Preço Teto', path: '/calculadora/preco-teto' },
    { name: m.h1, path: `/calculadora/preco-teto/${slug}` },
  ],
  structuredData: [
    {
      '@type': 'WebApplication',
      name: m.metaTitle,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      dateModified: lastUpdatedISO,
      description: m.metaDescription,
    },
  ],
})
</script>

<template>
  <div class="ptm">
    <!-- Answer-first: a resposta ANTES da ferramenta. É o bloco desenhado pra
         featured snippet e pra citação por LLM, e é o que a mãe não tem por
         método. -->
    <section class="ptm__hero">
      <NuxtLink to="/calculadora/preco-teto" class="ptm__back">← Calculadora de preço teto</NuxtLink>
      <h1 class="ptm__h1">{{ m.h1 }}</h1>
      <p class="ptm__lead">{{ m.answerFirst }}</p>
      <div class="ptm__formula">{{ m.formula }}</div>
    </section>

    <CalcConta section-id="calcular">
      <template #title>Calcular</template>
      <template #frase>
        <CalcFrase>
          A ação custa <CalcFraseCampo v-model="price" livre :casas="2" rotulo="Preço atual (R$)" :min="0" :max="150" :passo="0.5" :texto="brl(price)" prefixo="R$" /><template v-if="usa('lpa')">{{ liga('lpa') }}lucra <CalcFraseCampo v-model="lpa" livre :casas="2" rotulo="LPA, lucro por ação (R$)" :min="0" :max="20" :passo="0.1" :texto="brl(lpa)" prefixo="R$" /> por ação (LPA)</template><template v-if="usa('vpa')">{{ liga('vpa') }}tem <CalcFraseCampo v-model="vpa" livre :casas="2" rotulo="VPA, valor patrimonial (R$)" :min="0" :max="60" :passo="0.5" :texto="brl(vpa)" prefixo="R$" /> de valor patrimonial (VPA)</template><template v-if="usa('dividend')">{{ liga('dividend') }}pagou <CalcFraseCampo v-model="dividend" livre :casas="2" rotulo="Dividendo 12 meses (R$/ação)" :min="0" :max="10" :passo="0.1" :texto="brl(dividend)" prefixo="R$" /> de dividendo por ação em 12 meses</template><template v-if="usa('sectorPL')">{{ liga('sectorPL') }}o P/L médio do setor é <CalcFraseCampo v-model="sectorPL" livre :casas="2" rotulo="P/L médio do setor" :min="0" :max="30" :passo="0.5" :texto="num(sectorPL)" /></template><template v-if="usa('growth')">{{ liga('growth') }}o dividendo cresce <CalcFraseCampo v-model="growth" livre :casas="2" rotulo="Crescimento do dividendo (% a.a.)" :min="-10" :max="20" :passo="0.5" :texto="`${num(growth)}%`" sufixo="% a.a." /> ao ano</template>.
        </CalcFrase>
        <!-- os rótulos de sempre, no HTML do servidor -->
        <CalcPremissas class="ptm__dados" nome="Os dados desta conta">
          <template #resumo>
            <span v-if="usa('price')" class="ptm__dado">Preço atual (R$) <b>{{ brl(price) }}</b></span>
            <span v-if="usa('lpa')" class="ptm__dado">LPA, lucro por ação (R$) <b>{{ brl(lpa) }}</b></span>
            <span v-if="usa('vpa')" class="ptm__dado">VPA, valor patrimonial (R$) <b>{{ brl(vpa) }}</b></span>
            <span v-if="usa('dividend')" class="ptm__dado">Dividendo 12 meses (R$/ação) <b>{{ brl(dividend) }}</b></span>
            <span v-if="usa('sectorPL')" class="ptm__dado">P/L médio do setor <b>{{ num(sectorPL) }}</b></span>
            <span v-if="usa('growth')" class="ptm__dado">Crescimento do dividendo (% a.a.) <b>{{ num(growth) }}%</b></span>
          </template>
        </CalcPremissas>
      </template>
      <template #resultado>
        <CalcNumero
          legenda="Preço teto" :valor="brl(resultado.fairPrice)"
          :selo="veredito?.rotulo" :tom="veredito ? tomDoSelo[veredito.tom] : 'azul'" :explica="veredito?.texto"
        />
      </template>
      <template #grafico>
        <CalcBarras :itens="barras" />
      </template>
      <template #depois>
        <p class="ptm__cross">
          Quer os quatro métodos lado a lado, com consenso e busca por ticker?
          <NuxtLink to="/calculadora/preco-teto">Use a calculadora completa</NuxtLink>.
          O passo a passo das cinco fórmulas está no
          <NuxtLink to="/guias/como-calcular-preco-teto">guia de como calcular preço teto</NuxtLink>.
        </p>
      </template>
    </CalcConta>

    <section class="ptm__body">
      <article v-for="s in m.sections" :key="s.h2" class="ptm__block">
        <h2 class="ptm__h2">{{ s.h2 }}</h2>
        <p v-for="(p, i) in s.body" :key="i" class="ptm__p">{{ p }}</p>
      </article>

      <div class="ptm__exemplo">
        <h2 class="ptm__h2">{{ m.exemplo.titulo }}</h2>
        <ul class="ptm__exemplo-list">
          <li v-for="(l, i) in m.exemplo.linhas" :key="i">{{ l }}</li>
        </ul>
      </div>
    </section>

    <section class="ptm__faq">
      <h2 class="ptm__h2">Perguntas frequentes</h2>
      <NuFaqAccordion :items="m.faq.map((f) => ({ q: f.q, a: f.a }))" surface="white" />
    </section>

    <section class="ptm__outros">
      <h2 class="ptm__h2">Os outros métodos</h2>
      <div class="ptm__outros-grid">
        <NuxtLink v-for="o in outros" :key="o.slug" :to="`/calculadora/preco-teto/${o.slug}`" class="ptm__card">
          <span class="ptm__card-title">{{ o.h1 }}</span>
          <span class="ptm__card-formula">{{ o.formula }}</span>
        </NuxtLink>
      </div>
      <p class="ptm__updated">Atualizado em {{ lastUpdatedText }}</p>
    </section>
  </div>
</template>

<style scoped>
.ptm__hero, .ptm__body, .ptm__faq, .ptm__outros {
  padding: clamp(48px, 6vw, 88px) clamp(22px, 5.5vw, 80px);
}
/* Aportou (11/11/2026), só cor: sem faixa branca de ponta a ponta. O topo e a
   conta ficam no creme da página; as faixas alternam com o creme de faixa. */
.ptm__hero { background: var(--nu-page); padding-bottom: 0; }
.ptm__body { background: var(--nu-band); }
.ptm__faq { background: var(--nu-page); }
.ptm__outros { background: var(--nu-band); }

.ptm__back { color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 700; }
.ptm__h1 {
  margin: 18px 0 0; color: var(--nu-ink); font-size: clamp(34px, 4.6vw, 58px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.04; max-width: 20ch;
}
.ptm__lead {
  margin: 22px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-lg);
  font-weight: 500; line-height: 1.6; max-width: 68ch;
}
.ptm__formula {
  display: inline-block; margin-top: 26px; padding: 14px 20px;
  background: var(--nu-band); border-radius: var(--nu-r-tile);
  color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800;
}
.ptm__h2 {
  margin: 0; color: var(--nu-ink); font-size: clamp(24px, 2.8vw, 34px);
  font-weight: 800; letter-spacing: -0.03em; line-height: 1.12;
}
/* a linha dos dados: cada dado é um bloco que não se parte */
.ptm__dados { margin-top: 16px; }
.ptm__dado { display: inline-block; white-space: nowrap; }
.ptm__dado b { color: var(--nu-ink); font-weight: 800; font-variant-numeric: tabular-nums; }
.ptm__dado:not(:last-child)::after { content: '·'; margin: 0 9px; color: var(--nu-gray); }
@media (max-width: 640px) {
  .ptm__dado { display: block; }
  .ptm__dado:not(:last-child)::after { content: none; }
}
.ptm__cross { margin: 0 auto; max-width: 760px; color: var(--nu-gray); font-size: 14.5px; font-weight: 500; line-height: 1.5; text-align: center; }
.ptm__cross a { color: var(--nu-blue-text); font-weight: 800; }

.ptm__block { max-width: 68ch; }
.ptm__block + .ptm__block { margin-top: clamp(38px, 4.5vw, 60px); }
.ptm__p { color: var(--nu-gray); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.65; margin: 16px 0 0; }
.ptm__exemplo { max-width: 68ch; margin-top: clamp(44px, 5vw, 68px); }
.ptm__exemplo-list {
  margin: 20px 0 0; padding: 22px 26px; list-style: none;
  background: var(--nu-white); border-radius: var(--nu-r-panel);
  display: flex; flex-direction: column; gap: 11px;
}
.ptm__exemplo-list li {
  color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 500;
  font-variant-numeric: tabular-nums;
}
.ptm__faq .ptm__h2 { margin-bottom: 24px; }
.ptm__outros-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px; margin-top: 24px;
}
.ptm__card {
  display: flex; flex-direction: column; gap: 9px; padding: 22px;
  background: var(--nu-white); border-radius: var(--nu-r-panel);
  transition: transform .25s cubic-bezier(.2, .8, .2, 1), box-shadow .25s cubic-bezier(.2, .8, .2, 1);
}
.ptm__card:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.ptm__card-title { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; line-height: 1.25; }
.ptm__card-formula { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.ptm__updated { margin: clamp(36px, 4vw, 56px) 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; opacity: .8; }
</style>
