<script setup lang="ts">
/**
 * O plano nas direções da /business (?biz=1|2|3, 04/11/2026). Os mesmos fatos
 * do RbProva (o contrato de 13/10/2026, cláusula 4): o preço por pessoa da
 * mesa em quatro faixas, progressivo como o imposto de renda; prazo mínimo de
 * 3 meses, depois mês a mês; reajuste anual pelo IPCA; garantia de 30 dias. A
 * conta da faixa é a mesma (10 pessoas = R$ 5.000, 25 = R$ 9.500, 50 =
 * R$ 14.500). Mudou o contrato, muda aqui, no RbProva e no faq.ts.
 *
 * Desenho de página de preço de produto: o número grande que responde à
 * régua, as quatro faixas e, ao lado, o cartão escuro de quem traz o cliente
 * para dentro (Clientes do escritório segue "na implantação", CV-19). Menos
 * texto que o RbProva: a lista do que inclui fica em quatro linhas.
 */
const FAIXAS = [
  { de: 1, ate: 10, preco: 500, rotulo: '1ª a 10ª' },
  { de: 11, ate: 25, preco: 300, rotulo: '11ª a 25ª' },
  { de: 26, ate: 50, preco: 200, rotulo: '26ª a 50ª' },
  { de: 51, ate: Infinity, preco: 150, rotulo: '51ª ou mais' },
] as const
const INCLUI = ['Um acesso por pessoa', 'Funciona sem dado de cliente', 'Garantia de 30 dias']

withDefaults(defineProps<{ escuro?: boolean }>(), { escuro: false })
const pessoas = ref(5)
const definir = (v: unknown) => { const n = Math.round(Number(v)); pessoas.value = Number.isFinite(n) ? Math.min(100, Math.max(1, n)) : 1 }
const linhas = computed(() => FAIXAS.map((f) => ({ ...f, qtd: Math.max(0, Math.min(pessoas.value, f.ate) - (f.de - 1)) })))
const total = computed(() => linhas.value.reduce((s, l) => s + l.qtd * l.preco, 0))
const brl = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
const CTX = { id: 'business:plano', tipo: 'bloco', rotulo: 'O plano do Redentia For Business' }
</script>

<template>
  <section id="prova" v-contexto-chat="CTX" class="bzp" :class="{ 'bzp--escuro': escuro }">
    <h2 class="bzp__titulo">Preço por pessoa.<br>Sem produto pra empurrar.</h2>
    <div class="bzp__grade">
      <div class="bzp__card">
        <p class="bzp__nome">Redentia For Business</p>
        <p class="bzp__preco" aria-live="polite"><span class="bzp__moeda">R$</span>{{ brl(total) }}<span class="bzp__mes">/mês</span></p>
        <label class="bzp__regua">
          <span class="bzp__regua-r"><b>{{ pessoas }}</b> {{ pessoas === 1 ? 'pessoa' : 'pessoas' }} na mesa</span>
          <input type="range" min="1" max="100" step="1" :value="pessoas" :aria-valuetext="`${pessoas} pessoas, R$ ${brl(total)} por mês`" @input="definir(($event.target as HTMLInputElement).value)">
        </label>
        <ul class="bzp__faixas" aria-label="Preço por pessoa, por faixa">
          <li v-for="l in linhas" :key="l.rotulo" :class="{ 'bzp__faixa--on': l.qtd > 0 }"><span>{{ l.rotulo }}</span><b>R$ {{ brl(l.preco) }}</b></li>
        </ul>
        <ul class="bzp__inclui">
          <li v-for="i in INCLUI" :key="i">{{ i }}</li>
        </ul>
        <a href="#contato" class="bzp__cta">Agendar 1 hora com a gente</a>
        <p class="bzp__fino">Prazo mínimo de 3 meses, depois mês a mês. Reajuste anual pelo IPCA.</p>
      </div>
      <div class="bzp__card bzp__card--navy">
        <p class="bzp__nome">Family office e gestora</p>
        <p class="bzp__h3">Com o cliente dentro.</p>
        <p class="bzp__status"><i aria-hidden="true" />Habilitada escritório a escritório, na implantação.</p>
        <p class="bzp__texto">A carteira de cada cliente pelo Open Finance e o relatório com a marca da casa.</p>
        <a href="#contato" class="bzp__cta bzp__cta--contorno">Falar com a gente</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.bzp { scroll-margin-top: calc(var(--nuh-h, 72px) + 24px); padding: clamp(72px, 9vw, 128px) clamp(22px, 5.5vw, 80px); background: var(--nu-white); }
.bzp__titulo { margin: 0 auto; max-width: 18ch; text-align: center; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.05em; line-height: 1.02; }
.bzp__grade { display: grid; grid-template-columns: 1.15fr 1fr; gap: clamp(16px, 2vw, 24px); max-width: 1000px; margin: clamp(40px, 5vw, 64px) auto 0; }
.bzp__card { display: flex; flex-direction: column; padding: clamp(24px, 3vw, 36px); border-radius: var(--nu-r-card); background: var(--nu-white); box-shadow: 0 0 0 1px rgba(12, 21, 36, .08), 0 30px 70px -32px rgba(12, 21, 36, .4); }
.bzp__nome { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 700; }
.bzp__preco { margin: 10px 0 0; display: flex; align-items: baseline; gap: 4px; color: var(--nu-ink); font-size: clamp(48px, 5.4vw, 72px); font-weight: 800; letter-spacing: -0.05em; line-height: 1; font-variant-numeric: tabular-nums; }
.bzp__moeda { font-size: .42em; letter-spacing: -0.02em; }
.bzp__mes { margin-left: 4px; color: var(--nu-gray); font-size: var(--nu-fs-lg); font-weight: 700; letter-spacing: 0; }
.bzp__regua { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
.bzp__regua-r { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; font-variant-numeric: tabular-nums; }
.bzp__regua-r b { color: var(--nu-ink); font-weight: 800; }
.bzp__regua input { width: 100%; margin: 0; accent-color: var(--nu-blue); cursor: pointer; }
.bzp__regua input:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 4px; }
.bzp__faixas { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin: 18px 0 0; padding: 0; list-style: none; font-variant-numeric: tabular-nums; }
.bzp__faixas li { display: flex; flex-direction: column; gap: 2px; padding: 10px; border-radius: var(--nu-r-chip); background: var(--nu-cream); color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; transition: background .2s, color .2s; }
.bzp__faixas b { font-size: var(--nu-fs-sm); font-weight: 700; }
.bzp__faixas .bzp__faixa--on { background: var(--nu-ink); color: var(--nu-cream-text-70); }
.bzp__faixas .bzp__faixa--on b { color: var(--nu-white); }
.bzp__inclui { display: grid; grid-template-columns: 1fr; gap: 8px 16px; margin: 20px 0 0; padding: 0; list-style: none; }
.bzp__inclui li { position: relative; padding-left: 18px; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.4; }
.bzp__inclui li::before { content: ''; position: absolute; left: 0; top: .45em; width: 8px; height: 8px; border-radius: 50%; background: var(--nu-blue); }
.bzp__cta { display: flex; align-items: center; justify-content: center; min-height: 48px; margin-top: 24px; border-radius: var(--nu-r-pill); background: var(--nu-blue); color: var(--nu-white); font-size: var(--nu-fs-md); font-weight: 700; transition: background .2s; }
.bzp__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.bzp__cta:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }
.bzp__fino { margin: 12px 0 0; text-align: center; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; }
.bzp__card--navy { background: var(--nu-navy); box-shadow: 0 30px 70px -32px rgba(12, 21, 36, .6); }
.bzp__card--navy .bzp__nome { color: var(--nu-cream-text-70); }
.bzp__h3 { margin: 12px 0 0; color: var(--nu-cream-text); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.04em; line-height: 1.08; }
.bzp__status { display: flex; align-items: flex-start; gap: 8px; margin: 14px 0 0; color: var(--nu-cream-text-70); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.bzp__status i { flex: none; width: 7px; height: 7px; margin-top: 7px; border-radius: 50%; background: var(--nu-blue-soft); }
.bzp__texto { margin: 18px 0 0; color: var(--nu-cream-text-80); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }
.bzp__cta--contorno { margin-top: auto; background: transparent; color: var(--nu-cream-text); box-shadow: inset 0 0 0 1px var(--nu-cream-text-40); }
.bzp__card--navy .bzp__texto { margin-bottom: 24px; }
.bzp__cta--contorno:hover { background: var(--nu-cream-text-08); color: var(--nu-white); }
.bzp--escuro { background: var(--nu-agora-bg); }
.bzp--escuro .bzp__titulo { color: var(--nu-agora-texto); }
@media (max-width: 820px) { .bzp__grade { grid-template-columns: 1fr; max-width: 520px; } }
@media (max-width: 420px) { .bzp__faixas, .bzp__inclui { grid-template-columns: 1fr 1fr; } .bzp__inclui { grid-template-columns: 1fr; } }
</style>
