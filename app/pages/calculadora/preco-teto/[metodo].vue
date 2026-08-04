<script setup lang="ts">
/**
 * /calculadora/preco-teto/{metodo} — uma página por MÉTODO de valuation.
 *
 * A rota irmã /calculadora/preco-teto (index.vue) continua sendo a calculadora
 * completa, com os 4 métodos lado a lado e o consenso. Ela responde ao núcleo
 * genérico da consulta ("calculadora preço teto", 2.665 impressões, CTR 22,51%)
 * e NÃO deve ser tocada: é 49,7% dos cliques do site inteiro.
 *
 * Estas páginas atacam o que a mãe não consegue responder com profundidade:
 * "preço teto bazin" (1.042 impr), "como calcular o preço teto" (1.662),
 * "preço teto graham" (106), "preço teto projetivo" (153). Método vale 15,6x
 * mais impressão que ticker nesse cluster, e 249x mais clique.
 *
 * A matemática vem de ~/utils/preco-teto (compartilhada com a index) — nunca
 * reimplementar fórmula aqui.
 */
import { PRECO_TETO_METODOS, PRECO_TETO_METODO_SLUGS } from '~/content/calculadoras/preco-teto-metodos'
import { priceByMethod, metrics } from '~/utils/preco-teto'

definePageMeta({
  validate: (route) => PRECO_TETO_METODO_SLUGS.includes(String(route.params.metodo)),
})

const route = useRoute()
const slug = String(route.params.metodo)
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

    <section class="ptm__calc" id="calcular">
      <h2 class="ptm__h2">Calcular</h2>
      <div class="ptm__inputs">
        <label v-if="usa('price')" class="ptm__field">
          <span>Preço atual (R$)</span>
          <input v-model.number="price" type="number" min="0" step="0.01" inputmode="decimal">
        </label>
        <label v-if="usa('lpa')" class="ptm__field">
          <span>LPA, lucro por ação (R$)</span>
          <input v-model.number="lpa" type="number" min="0" step="0.01" inputmode="decimal">
        </label>
        <label v-if="usa('vpa')" class="ptm__field">
          <span>VPA, valor patrimonial (R$)</span>
          <input v-model.number="vpa" type="number" min="0" step="0.01" inputmode="decimal">
        </label>
        <label v-if="usa('dividend')" class="ptm__field">
          <span>Dividendo 12 meses (R$/ação)</span>
          <input v-model.number="dividend" type="number" min="0" step="0.01" inputmode="decimal">
        </label>
        <label v-if="usa('sectorPL')" class="ptm__field">
          <span>P/L médio do setor</span>
          <input v-model.number="sectorPL" type="number" min="0" step="0.1" inputmode="decimal">
        </label>
        <label v-if="usa('growth')" class="ptm__field">
          <span>Crescimento do dividendo (% a.a.)</span>
          <input v-model.number="growth" type="number" step="0.5" inputmode="decimal">
        </label>
      </div>

      <div class="ptm__out">
        <div class="ptm__out-label">Preço teto</div>
        <div class="ptm__out-value">{{ brl(resultado.fairPrice) }}</div>
        <div v-if="veredito" class="ptm__verdict" :class="`ptm__verdict--${veredito.tom}`">
          <strong>{{ veredito.rotulo }}.</strong> {{ veredito.texto }}
        </div>
      </div>

      <p class="ptm__cross">
        Quer os quatro métodos lado a lado, com consenso e busca por ticker?
        <NuxtLink to="/calculadora/preco-teto">Use a calculadora completa</NuxtLink>.
      </p>
    </section>

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
.ptm__hero, .ptm__calc, .ptm__body, .ptm__faq, .ptm__outros {
  padding: clamp(48px, 6vw, 88px) clamp(22px, 5.5vw, 80px);
}
.ptm__hero { background: var(--nu-cream); }
.ptm__calc { background: var(--nu-white); }
.ptm__body { background: var(--nu-cream); }
.ptm__faq { background: var(--nu-white); }
.ptm__outros { background: var(--nu-cream); }

.ptm__back { color: var(--nu-blue); font-size: 15px; font-weight: 700; }
.ptm__h1 {
  margin: 18px 0 0; color: var(--nu-ink); font-size: clamp(34px, 4.6vw, 58px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.04; max-width: 20ch;
}
.ptm__lead {
  margin: 22px 0 0; color: var(--nu-gray); font-size: 18px;
  font-weight: 500; line-height: 1.6; max-width: 68ch;
}
.ptm__formula {
  display: inline-block; margin-top: 26px; padding: 14px 20px;
  background: var(--nu-white); border-radius: var(--nu-r-card, 14px);
  color: var(--nu-ink); font-size: 16px; font-weight: 800;
}
.ptm__h2 {
  margin: 0; color: var(--nu-ink); font-size: clamp(24px, 2.8vw, 34px);
  font-weight: 800; letter-spacing: -0.03em; line-height: 1.12;
}
.ptm__inputs {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 18px; margin-top: 26px; max-width: 780px;
}
.ptm__field { display: flex; flex-direction: column; gap: 8px; }
.ptm__field span { color: var(--nu-gray); font-size: 14px; font-weight: 700; }
.ptm__field input {
  padding: 13px 15px; border: 2px solid var(--nu-cream); border-radius: 12px;
  background: var(--nu-cream); color: var(--nu-ink); font-size: 17px; font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.ptm__field input:focus { outline: 2px solid var(--nu-blue); outline-offset: 1px; }
.ptm__out { margin-top: 32px; }
.ptm__out-label { color: var(--nu-gray); font-size: 14px; font-weight: 700; }
.ptm__out-value {
  color: var(--nu-ink); font-size: clamp(44px, 6vw, 72px); font-weight: 800;
  letter-spacing: -0.04em; line-height: 1; margin-top: 8px; font-variant-numeric: tabular-nums;
}
.ptm__verdict {
  display: inline-block; margin-top: 18px; padding: 12px 18px; border-radius: 999px;
  font-size: 15px; font-weight: 700;
}
.ptm__verdict--ok { background: var(--nu-green-soft, #e6f6ec); color: var(--nu-green, #147a3d); }
.ptm__verdict--neutro { background: var(--nu-blue-tint, #eaf1ff); color: var(--nu-blue); }
.ptm__verdict--alerta { background: #fdecec; color: #b3261e; }
.ptm__cross { margin: 28px 0 0; color: var(--nu-gray); font-size: 16px; font-weight: 600; }
.ptm__cross a { color: var(--nu-blue); font-weight: 800; }

.ptm__block { max-width: 68ch; }
.ptm__block + .ptm__block { margin-top: clamp(38px, 4.5vw, 60px); }
.ptm__p { color: var(--nu-gray); font-size: 17px; font-weight: 500; line-height: 1.65; margin: 16px 0 0; }
.ptm__exemplo { max-width: 68ch; margin-top: clamp(44px, 5vw, 68px); }
.ptm__exemplo-list {
  margin: 20px 0 0; padding: 22px 26px; list-style: none;
  background: var(--nu-white); border-radius: var(--nu-r-card-lg, 18px);
  display: flex; flex-direction: column; gap: 11px;
}
.ptm__exemplo-list li {
  color: var(--nu-ink); font-size: 16px; font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.ptm__faq .ptm__h2 { margin-bottom: 24px; }
.ptm__outros-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px; margin-top: 24px;
}
.ptm__card {
  display: flex; flex-direction: column; gap: 9px; padding: 22px;
  background: var(--nu-white); border-radius: var(--nu-r-card-lg, 18px);
  transition: transform .2s;
}
.ptm__card:hover { transform: translateY(-2px); }
.ptm__card-title { color: var(--nu-ink); font-size: 17px; font-weight: 800; line-height: 1.25; }
.ptm__card-formula { color: var(--nu-gray); font-size: 14px; font-weight: 600; }
.ptm__updated { margin: clamp(36px, 4vw, 56px) 0 0; color: var(--nu-gray); font-size: 14px; font-weight: 600; opacity: .8; }
</style>
