<script setup lang="ts">
/**
 * A /business nova, em três variações (05/11/2026, só no dev por ?biz=1|2|3).
 *
 * O dono mandou o print de uma landing do Redentia For Business ("vamos tentar
 * deixar mais nesse estilo, só que mais o nosso estilo"). O que o print tem e
 * vale nas três: a faixa do estudo (no layout), o hero centrado com dois CTAs,
 * a linha miúda de garantias e a seção "produto à esquerda, três benefícios à
 * direita". O resto da página (segurança, plano, FAQ e fecho) é o conteúdo de
 * hoje, no idioma de cada variação. Saem o Venn (RbDivisao) e o dia de mesa
 * (RbJornada): a fila de aprovação conta a mesma manhã numa tela só.
 *
 *  1 · SERIFA: a mais fiel ao print. Topo e hero navy com grade de pontos,
 *      título em serifa, botão lavanda; a fila é o cartão navy no branco.
 *  2 · A NOITE: a mais nossa. O céu do /benchmark-ia e da home, Jakarta leve
 *      com o degradê no título, botão branco; a fila nasce na linha de luz do
 *      horizonte, no vidro com a moldura iridescente (o momento assinatura).
 *  3 · CREME: o meio-termo. O creme e a Jakarta 800 do site com a estrutura do
 *      print; a nav em caixa alta e a fila navy subindo por cima do hero.
 *
 * SEO: um H1 só (o título do print), o FAQ inteiro no SSR com um FAQPage só
 * (RbFaq), o mesmo #contato (RbContato) e as âncoras do topo e do rodapé
 * (#agentes, #para-quem, #seguranca, #prova, #faq, #contato).
 * Densidade: o teto de ~650 palavras fora do FAQ (scripts/seo-paridade-business.mjs).
 */
import type { BizVariacao } from '~/composables/useBizVariacao'
import {
  BENEFICIOS, CTA_AGENDA, CTA_DEMO, HERO, INCLUI, LOGOS_CLIENTES, PARA_QUEM, SEGURANCA, precoDaMesa,
} from '~/content/business/landing'

const props = defineProps<{ v: BizVariacao }>()
const destinoCadastro = useDestinoCadastroBusiness()
const filaTema = computed(() => (props.v === '2' ? 'noite' : 'navy'))

/* ——— a calculadora do plano (a mesma conta de RbProva) ——— */
const MIN = 1
const MAX = 100
const pessoas = ref(5)
function definir(x: unknown) {
  const n = Math.round(Number(x))
  pessoas.value = Number.isFinite(n) ? Math.min(MAX, Math.max(MIN, n)) : MIN
}
const conta = computed(() => precoDaMesa(pessoas.value))
const brl = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
const contaTexto = computed(() => conta.value.linhas.filter((l) => l.qtd > 0).map((l) => `${l.qtd} × R$ ${brl(l.preco)}`).join(' + '))
const rotuloPessoas = (n: number) => `${n} ${n === 1 ? 'pessoa' : 'pessoas'}`
/* O ponto final do título fica num span: na Jakarta 800 com tracking negativo
   o ponto abre um vão ("dias ."), e o span o puxa de volta (ver .bzl-p). */
const semPonto = (t: string) => t.replace(/\.$/, '')
</script>

<template>
  <div class="bzl" :class="`bzl--${v}`">
    <!-- ================= o hero ================= -->
    <section class="bzh" aria-labelledby="bzh-titulo">
      <div class="bzh__fundo" aria-hidden="true" />
      <div class="bzh__in">
        <p class="bzh__olho">
          <img v-if="v === '2'" src="/logo-branca.svg" alt="" width="18" height="18">
          Redentia For Business
        </p>
        <!-- o espaço entre os dois spans é o que separa as frases quando a
             quebra do desktop some (a lição do "clientecom" do RbHero) -->
        <h1 id="bzh-titulo" class="bzh__titulo">
          <span class="bzh__l1">{{ semPonto(HERO.titulo[0]) }}<span class="bzl-p">.</span></span> <span class="bzh__l2">{{ semPonto(HERO.titulo[1]) }}<span class="bzl-p">.</span></span>
        </h1>
        <p class="bzh__apoio">{{ HERO.apoio }}</p>
        <div class="bzh__ctas">
          <NuxtLink :to="destinoCadastro" class="bzb bzb--cheio">{{ CTA_DEMO }}</NuxtLink>
          <a href="#contato" class="bzb bzb--contorno">{{ CTA_AGENDA }}</a>
        </div>
        <ul class="bzh__garantias">
          <li v-for="g in HERO.garantias" :key="g">{{ g }}</li>
        </ul>
        <p class="bzh__impl">{{ HERO.implantacao }}</p>
        <!-- oculta até o dono mandar os logos autorizados (LOGOS_CLIENTES) -->
        <ul v-if="LOGOS_CLIENTES.length" class="bzh__logos" aria-label="Escritórios que usam a Redentia">
          <li v-for="l in LOGOS_CLIENTES" :key="l.nome"><img :src="l.src" :alt="l.nome" :width="l.largura" height="28" loading="lazy"></li>
        </ul>
      </div>
    </section>

    <!-- ================= o produto: a fila e os três benefícios ================= -->
    <section id="agentes" class="bzp" aria-labelledby="bzp-titulo">
      <div v-if="v === '2'" class="bzp__horizonte" aria-hidden="true" />
      <div class="bzp__in">
        <div class="bzp__fila"><BizFila :tema="filaTema" /></div>
        <div class="bzp__lado">
          <h2 id="bzp-titulo" class="bzl-olho">Agentes</h2>
          <ul class="bzp__bens">
            <li v-for="b in BENEFICIOS" :key="b.id" class="bzp__bem">
              <span class="bzp__ic" aria-hidden="true">
                <svg v-if="b.icone === 'calendario'" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="7" width="22" height="20" rx="4" /><path d="M5 13h22M11 4v5M21 4v5" /><path d="M11.5 20l3 3 6-6.5" /></svg>
                <svg v-else-if="b.icone === 'bancos'" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l12-7 12 7" /><path d="M7 12v10M12.5 12v10M19.5 12v10M25 12v10" /><path d="M4 26h24" /><circle cx="16" cy="9.2" r="1" /></svg>
                <svg v-else viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 23c3-1 4-7 6.5-7s1 6 3.5 6 2.5-4 4.5-4 1.5 2.5 3 2.5c1 0 2-.6 3.5-1.5" /><path d="M5 27h22" /><path d="M20.5 5.5l4 4L13 21l-5 1 1-5z" /></svg>
              </span>
              <p class="bzp__txt">{{ b.texto }}</p>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ================= para quem ================= -->
    <section id="para-quem" class="bzq" aria-labelledby="bzq-titulo">
      <h2 id="bzq-titulo" class="bzl-olho">Para quem</h2>
      <ul class="bzq__lista">
        <li v-for="(p, i) in PARA_QUEM" :key="p.id" class="bzq__item">
          <span class="bzq__n" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
          <h3 class="bzq__nome">{{ p.nome }}</h3>
          <p class="bzq__linha">{{ p.linha }}</p>
        </li>
      </ul>
    </section>

    <!-- ================= segurança ================= -->
    <section id="seguranca" class="bzs" aria-labelledby="bzs-titulo">
      <header class="bzl-cab">
        <p class="bzl-olho">Segurança</p>
        <h2 id="bzs-titulo" class="bzl-h2">Seu compliance pergunta<span class="bzl-p">.</span> <br class="bzl-br">A gente mostra<span class="bzl-p">.</span></h2>
      </header>
      <ol class="bzs__cards">
        <li v-for="(c, i) in SEGURANCA" :key="c.id" class="bzs__card">
          <div class="bzs__visual" aria-hidden="true">
            <div v-if="c.id === 'le'" class="bzs__acoes">
              <span class="bzs__acao bzs__acao--sim">Ler</span><span class="bzs__acao">Comprar</span><span class="bzs__acao">Vender</span><span class="bzs__acao">Transferir</span>
            </div>
            <div v-else-if="c.id === 'sim'" class="bzs__aceite">
              <span class="bzs__ok"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
              <span class="bzs__aceite-txt"><strong>Autorizado pelo cliente</strong><span>até 07/10/2027</span></span>
              <span class="bzs__revogar">Revogar</span>
            </div>
            <div v-else class="bzs__ias"><span class="bzs__ia">Claude</span><span class="bzs__ia">ChatGPT</span></div>
          </div>
          <div class="bzs__corpo">
            <span class="bzs__n">{{ String(i + 1).padStart(2, '0') }}</span>
            <h3 class="bzs__t">{{ c.t }}</h3>
            <p class="bzs__d">{{ c.d }}</p>
          </div>
        </li>
      </ol>
    </section>

    <!-- ================= o plano ================= -->
    <section id="prova" class="bzr" aria-labelledby="bzr-titulo">
      <header class="bzl-cab">
        <p class="bzl-olho">Preço</p>
        <h2 id="bzr-titulo" class="bzl-h2">Sem produto pra empurrar<span class="bzl-p">.</span></h2>
        <p class="bzl-dek">O preço é por pessoa da mesa e não muda com o que o seu cliente compra.</p>
      </header>
      <div class="bzr__cards">
        <div class="bzr__card">
          <span id="bzr-calc" class="bzr__nome">Redentia For Business</span>
          <p class="bzr__preco" aria-live="polite" aria-atomic="true">
            <span class="bzr__moeda">R$</span><span class="bzr__valor">{{ brl(conta.total) }}</span><span class="bzr__per">/mês</span>
          </p>
          <p class="bzr__conta">{{ rotuloPessoas(pessoas) }} · {{ contaTexto }}</p>
          <div class="bzr__controle" role="group" aria-labelledby="bzr-calc">
            <button type="button" class="bzr__passo" :disabled="pessoas <= MIN" aria-label="Uma pessoa a menos" @click="definir(pessoas - 1)">−</button>
            <input
              class="bzr__range" type="range" :min="MIN" :max="MAX" step="1" :value="pessoas" aria-label="Pessoas na mesa"
              :aria-valuetext="`${rotuloPessoas(pessoas)}, R$ ${brl(conta.total)} por mês`" @input="definir(($event.target as HTMLInputElement).value)"
            >
            <button type="button" class="bzr__passo" :disabled="pessoas >= MAX" aria-label="Uma pessoa a mais" @click="definir(pessoas + 1)">+</button>
          </div>
          <ul class="bzr__faixas" aria-label="Preço por pessoa, por faixa">
            <li v-for="l in conta.linhas" :key="l.rotulo" class="bzr__faixa" :class="{ 'bzr__faixa--on': l.qtd > 0 }">
              <span>{{ l.rotulo }}</span><strong>R$ {{ brl(l.preco) }}</strong>
            </li>
          </ul>
          <ul class="bzr__inclui">
            <li v-for="item in INCLUI" :key="item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              {{ item }}
            </li>
          </ul>
          <NuxtLink :to="destinoCadastro" class="bzb bzb--cheio bzr__cta">{{ CTA_DEMO }}</NuxtLink>
          <p class="bzr__fino">Prazo mínimo de 3 meses, depois mês a mês. Reajuste anual pelo IPCA.</p>
        </div>

        <div class="bzr__card bzr__card--escuro">
          <span class="bzr__nome">Family office e gestora</span>
          <p class="bzr__titulo">Com o cliente dentro<span class="bzl-p">.</span></p>
          <p class="bzr__status"><span class="bzr__ponto" aria-hidden="true" />Habilitada escritório a escritório, na implantação.</p>
          <p class="bzr__texto">A carteira de cada cliente conectada por Open Finance, com o consentimento dele. O cenário roda sobre ela, e o relatório sai com a marca da casa.</p>
          <a href="#contato" class="bzb bzb--contorno bzr__cta">{{ CTA_AGENDA }}</a>
        </div>
      </div>
    </section>

    <div class="bzf"><RbFaq /></div>
    <div class="bzc"><RbContato /></div>
  </div>
</template>

<style scoped>
/* =====================================================================
   BASE (as três variações). Cada variação troca a tinta, a fonte do título e
   os fundos nos blocos do fim do arquivo; a estrutura é a mesma.
   ===================================================================== */
.bzl {
  --g: clamp(16px, 5.5vw, 80px);
  --serifa: 'New York', ui-serif, 'Iowan Old Style', Georgia, 'Times New Roman', serif;
  --curva: cubic-bezier(.2, .8, .2, 1);
  --sombra: 0 0 0 1px rgba(12, 21, 36, .07), 0 24px 60px -30px rgba(12, 21, 36, .18);
  background: var(--nu-white);
}
section { scroll-margin-top: calc(var(--nuh-h, 72px) + 16px); }

/* ——— rótulo, título e apoio de seção ——— */
.bzl-olho { margin: 0; font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--nu-blue-text); }
.bzl-cab { display: flex; flex-direction: column; align-items: center; text-align: center; max-width: 760px; margin: 0 auto; }
.bzl-h2 { margin: 14px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.04em; line-height: 1.04; text-wrap: balance; }
.bzl-dek { margin: 16px 0 0; max-width: 46ch; color: var(--nu-gray-2); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.55; text-wrap: balance; }

/* ——— botões ——— */
.bzb {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 52px; padding: 0 26px; border-radius: var(--nu-r-pill);
  font-size: var(--nu-fs-md); font-weight: 700; letter-spacing: -0.005em; white-space: nowrap;
  transition: background .2s ease, color .2s ease, box-shadow .2s ease, transform .2s var(--curva);
}
.bzb:hover { transform: translateY(-1px); }
.bzb:active { transform: translateY(1px); }
.bzb:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }

/* ——— o hero ——— */
.bzh { position: relative; isolation: isolate; overflow: hidden; padding: clamp(64px, 9vw, 128px) var(--g) clamp(56px, 7vw, 96px); text-align: center; }
.bzh__fundo { position: absolute; inset: 0; z-index: -1; pointer-events: none; }
.bzh__in { display: flex; flex-direction: column; align-items: center; max-width: 1120px; margin: 0 auto; }
.bzh__olho { display: inline-flex; align-items: center; gap: 8px; margin: 0; font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
.bzh__titulo { margin: 22px 0 0; max-width: 20ch; text-wrap: balance; }
.bzh__l1, .bzh__l2 { display: block; }
.bzh__apoio { margin: 26px 0 0; max-width: 56ch; font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.55; text-wrap: balance; }
.bzh__ctas { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 36px; }
.bzh__garantias { list-style: none; margin: 26px 0 0; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 0; font-size: var(--nu-fs-sm); font-weight: 500; }
.bzh__garantias li { display: inline-flex; align-items: center; }
.bzh__garantias li + li::before { content: '·'; margin: 0 10px; opacity: .6; }
.bzh__impl { margin: 8px 0 0; font-size: var(--nu-fs-xs); font-weight: 500; }
.bzh__logos { list-style: none; margin: clamp(40px, 5vw, 64px) 0 0; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 28px 48px; opacity: .7; }
.bzh__logos img { height: 28px; width: auto; filter: grayscale(1) brightness(2); }

/* a entrada do hero: cada linha sobe e sai do desfoque, em sequência de 100 ms */
.bzh__olho, .bzh__l1, .bzh__l2, .bzh__apoio, .bzh__ctas, .bzh__garantias, .bzh__impl { animation: bzh-sobe 1s var(--curva) both; }
.bzh__l1 { animation-delay: .08s; }
.bzh__l2 { animation-delay: .18s; }
.bzh__apoio { animation-delay: .3s; }
.bzh__ctas { animation-delay: .4s; }
.bzh__garantias, .bzh__impl { animation-delay: .5s; }
@keyframes bzh-sobe { from { opacity: 0; transform: translateY(12px); filter: blur(8px); } to { opacity: 1; transform: none; filter: none; } }

/* ——— o produto ——— */
.bzp { position: relative; padding: clamp(64px, 8vw, 120px) var(--g); }
.bzp__in { display: grid; grid-template-columns: minmax(0, 1fr); gap: clamp(40px, 5vw, 80px); max-width: 1180px; margin: 0 auto; align-items: center; }
.bzp__fila { width: 100%; max-width: 560px; margin: 0 auto; }
.bzp__bens { list-style: none; margin: 22px 0 0; padding: 0; }
.bzp__bem { display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: 18px; align-items: start; padding: 24px 0; border-top: 1px solid var(--nu-cream-line); transition: transform .3s var(--curva); }
.bzp__bem:last-child { border-bottom: 1px solid var(--nu-cream-line); }
.bzp__bem:hover { transform: translateX(4px); }
.bzp__ic { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 14px; color: var(--nu-blue-text); background: var(--nu-blue-tint-2); transition: background .2s, color .2s; }
.bzp__ic svg { width: 26px; height: 26px; }
.bzp__bem:hover .bzp__ic { background: var(--nu-blue); color: var(--nu-white); }
.bzp__txt { margin: 0; padding-top: 2px; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 600; letter-spacing: -0.015em; line-height: 1.38; text-wrap: pretty; }
@media (min-width: 960px) {
  .bzp__in { grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); }
  .bzp__fila { margin: 0; }
}

/* ——— para quem ——— */
.bzq { padding: clamp(56px, 7vw, 104px) var(--g); text-align: center; }
.bzq__lista { list-style: none; margin: clamp(28px, 3.4vw, 44px) auto 0; padding: 0; max-width: 1180px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 0 clamp(20px, 3vw, 48px); text-align: left; }
.bzq__item { padding: 22px 0 24px; border-top: 1px solid var(--nu-cream-line); transition: border-color .2s; }
.bzq__item:hover { border-top-color: var(--nu-ink); }
.bzq__n { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums; }
.bzq__nome { margin: 10px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
.bzq__linha { margin: 10px 0 0; max-width: 34ch; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }
@media (min-width: 760px) { .bzq__lista { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

/* ——— segurança ——— */
.bzs { padding: clamp(64px, 8vw, 120px) var(--g); }
.bzs__cards { list-style: none; margin: clamp(36px, 4.4vw, 56px) auto 0; padding: 0; max-width: 1180px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; }
@media (min-width: 900px) { .bzs__cards { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; } }
.bzs__card { display: flex; flex-direction: column; border-radius: var(--nu-r-card); overflow: clip; background: var(--nu-white); box-shadow: var(--sombra); transition: transform .35s var(--curva), box-shadow .35s var(--curva); }
.bzs__card:hover { transform: translateY(-3px); box-shadow: 0 0 0 1px rgba(12, 21, 36, .08), 0 34px 70px -32px rgba(12, 21, 36, .28); }
.bzs__visual { height: 132px; padding: 0 20px; display: grid; place-items: center; background: var(--nu-cream); }
.bzs__corpo { padding: clamp(20px, 2.4vw, 28px); }
.bzs__n { color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.bzs__t { margin: 8px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.015em; line-height: 1.25; }
.bzs__d { margin: 8px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }
.bzs__acoes { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.bzs__acao { padding: 6px 12px; border-radius: var(--nu-r-pill); border: 1px solid var(--nu-ink-14); background: var(--nu-white); color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 700; text-decoration: line-through; text-decoration-thickness: 1.5px; }
.bzs__acao--sim { border-color: var(--nu-blue); background: var(--nu-blue); color: var(--nu-white); text-decoration: none; }
.bzs__aceite { width: 100%; max-width: 320px; padding: 12px 14px; border-radius: 14px; background: var(--nu-white); box-shadow: 0 0 0 1px var(--nu-cream-line); display: flex; align-items: center; gap: 12px; text-align: left; }
.bzs__ok { flex: none; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; background: var(--nu-green-bg); color: var(--nu-green-text); }
.bzs__aceite-txt { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.bzs__aceite-txt strong { color: var(--nu-ink); font-size: var(--nu-fs-dense); font-weight: 700; }
.bzs__aceite-txt span { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; }
.bzs__revogar { margin-left: auto; flex: none; padding: 5px 10px; border-radius: var(--nu-r-pill); box-shadow: inset 0 0 0 1px var(--nu-ink-14); color: var(--nu-red-text); font-size: var(--nu-fs-xs); font-weight: 700; }
.bzs__ias { display: flex; gap: 10px; }
.bzs__ia { padding: 10px 18px; border-radius: 14px; background: var(--nu-white); box-shadow: 0 0 0 1px var(--nu-cream-line); color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; letter-spacing: -0.01em; }

/* ——— o plano ——— */
.bzr { padding: clamp(64px, 8vw, 120px) var(--g); background: var(--nu-cream); }
.bzr__cards { margin: clamp(36px, 4.4vw, 56px) auto 0; max-width: 980px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; align-items: stretch; }
@media (min-width: 860px) { .bzr__cards { grid-template-columns: 1fr 1fr; gap: 20px; } }
.bzr__card { display: flex; flex-direction: column; padding: clamp(24px, 3vw, 36px); border-radius: var(--nu-r-card-lg); background: var(--nu-white); box-shadow: var(--sombra); }
.bzr__card--escuro { background: var(--nu-navy); color: var(--nu-cream-text); box-shadow: 0 30px 64px -30px rgba(12, 21, 36, .5); }
.bzr__nome { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 700; }
.bzr__card--escuro .bzr__nome { color: var(--nu-cream-text-70); }
.bzr__preco { display: flex; align-items: baseline; gap: 4px; margin: 14px 0 0; color: var(--nu-ink); font-variant-numeric: tabular-nums; }
.bzr__moeda { font-size: var(--nu-fs-xl); font-weight: 700; }
.bzr__valor { font-size: clamp(44px, 5vw, 60px); font-weight: 800; letter-spacing: -0.04em; line-height: 1; }
.bzr__per { color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 600; }
.bzr__conta { margin: 8px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; font-variant-numeric: tabular-nums; }
.bzr__controle { display: flex; align-items: center; gap: 12px; margin-top: 20px; }
.bzr__passo { flex: none; width: 44px; height: 44px; border: 0; border-radius: 50%; background: var(--nu-cream); color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-xl); font-weight: 700; cursor: pointer; transition: background .2s; }
.bzr__passo:hover:not(:disabled) { background: var(--nu-cream-4); }
.bzr__passo:disabled { opacity: .4; cursor: default; }
.bzr__passo:focus-visible, .bzr__range:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.bzr__range { flex: 1; min-width: 0; accent-color: var(--nu-blue); height: 44px; cursor: pointer; }
.bzr__faixas { list-style: none; margin: 18px 0 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
.bzr__faixa { display: flex; flex-direction: column; gap: 2px; padding: 9px 10px; border-radius: 12px; background: var(--nu-cream); color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600; transition: background .2s, color .2s; }
.bzr__faixa strong { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 800; font-variant-numeric: tabular-nums; }
.bzr__faixa--on { background: var(--nu-ink); color: var(--nu-white-75); }
.bzr__faixa--on strong { color: var(--nu-white); }
.bzr__inclui { list-style: none; margin: 20px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; }
.bzr__inclui li { display: flex; align-items: center; gap: 10px; }
.bzr__inclui svg { flex: none; color: var(--nu-green-text); }
.bzr__cta { margin-top: 26px; align-self: stretch; }
.bzr__fino { margin: 12px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; text-align: center; }
.bzr__titulo { margin: 14px 0 0; font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
.bzr__status { display: flex; align-items: center; gap: 8px; margin: 14px 0 0; color: var(--nu-cream-text-70); font-size: var(--nu-fs-sm); font-weight: 600; }
.bzr__ponto { width: 7px; height: 7px; border-radius: 50%; background: var(--nu-amber); flex: none; }
.bzr__texto { margin: 16px 0 0; color: var(--nu-cream-text-78); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.6; }
.bzr__card--escuro .bzr__cta { margin-top: auto; }
.bzr__card--escuro .bzr__texto { margin-bottom: 28px; }

/* ——— FAQ e fecho: os componentes de hoje, com a tinta da variação ——— */
.bzf :deep(.rbfq) { animation: none; }
/* o vão do ponto da Jakarta pesada (só nos títulos 800 da variação 3) */
.bzl--3 .bzh__titulo .bzl-p, .bzl--3 .bzl-h2 .bzl-p, .bzl--3 .bzr__titulo .bzl-p { margin-left: -0.09em; }
/* o botão de contorno sobre o cartão escuro do plano */
.bzl .bzr__card--escuro .bzb--contorno, .bzl .bzr__card--escuro .bzb--contorno:hover { color: var(--nu-cream-text); box-shadow: inset 0 0 0 1px var(--nu-cream-text-35); background: transparent; }
.bzl .bzr__card--escuro .bzb--contorno:hover { background: var(--nu-white-14); box-shadow: inset 0 0 0 1px var(--nu-cream-text); }

@media (max-width: 640px) {
  .bzh__ctas { flex-direction: column; align-self: stretch; }
  .bzb { width: 100%; }
  .bzh__garantias { flex-direction: column; align-items: center; gap: 4px; }
  .bzh__garantias li + li::before { display: none; }
  .bzl-br { display: none; }
  .bzr__faixas { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .bzp__txt { font-size: var(--nu-fs-lg); }
}

/* =====================================================================
   1 · SERIFA — a mais fiel ao print
   ===================================================================== */
.bzl--1 .bzh { background: var(--nu-navy); color: var(--nu-cream-text); }
.bzl--1 .bzh__fundo {
  /* a grade de pontos do print, apagando para as bordas */
  background-image: radial-gradient(var(--nu-biz-ponto) 1.1px, transparent 1.4px);
  background-size: 22px 22px; background-position: center top;
  -webkit-mask-image: radial-gradient(ellipse 75% 70% at 50% 40%, #000 30%, transparent 85%);
  mask-image: radial-gradient(ellipse 75% 70% at 50% 40%, #000 30%, transparent 85%);
}
.bzl--1 .bzh::after {
  /* a luz azul que sobe do pé do hero */
  content: ''; position: absolute; left: 50%; bottom: -30%; width: 90%; height: 70%; transform: translateX(-50%); z-index: -1; pointer-events: none;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--nu-blue) 22%, transparent), transparent);
}
.bzl--1 .bzh__olho { color: var(--nu-biz-lavanda); }
.bzl--1 .bzh__titulo { font-family: var(--serifa); font-weight: 400; font-size: clamp(40px, 6.4vw, 92px); letter-spacing: -0.02em; line-height: 1.04; color: var(--nu-cream-text); max-width: 19ch; }
.bzl--1 .bzh__l2 { color: var(--nu-cream-text-70); font-style: italic; }
.bzl--1 .bzh__apoio { color: var(--nu-cream-text-78); }
.bzl--1 .bzb--cheio { background: var(--nu-biz-lavanda); color: var(--nu-navy); box-shadow: 0 10px 30px -12px rgba(195, 203, 255, .55); }
.bzl--1 .bzb--cheio:hover { background: var(--nu-biz-lavanda-hover); color: var(--nu-navy); }
.bzl--1 .bzb--contorno { color: var(--nu-cream-text); box-shadow: inset 0 0 0 1px var(--nu-cream-text-35); }
.bzl--1 .bzb--contorno:hover { box-shadow: inset 0 0 0 1px var(--nu-cream-text); background: var(--nu-white-14); color: var(--nu-cream-text); }
.bzl--1 .bzh__garantias { color: var(--nu-cream-text-70); }
.bzl--1 .bzh__impl { color: var(--nu-cream-text-55); }
.bzl--1 .bzl-olho { color: var(--nu-blue-text); }
.bzl--1 .bzl-h2, .bzl--1 .bzq__nome, .bzl--1 .bzr__titulo { font-family: var(--serifa); font-weight: 400; letter-spacing: -0.02em; }
.bzl--1 .bzp__txt { font-family: var(--serifa); font-weight: 400; font-size: clamp(20px, 1.9vw, 25px); letter-spacing: -0.01em; line-height: 1.3; }
.bzl--1 .bzp__ic { background: transparent; color: var(--nu-navy); box-shadow: inset 0 0 0 1px var(--nu-cream-line); }
.bzl--1 .bzp__bem:hover .bzp__ic { background: var(--nu-navy); color: var(--nu-cream-text); box-shadow: none; }
.bzl--1 .bzq { background: var(--nu-cream); }
.bzl--1 .bzq__item:hover { border-top-color: var(--nu-navy); }
.bzl--1 .bzs__card { box-shadow: 0 0 0 1px var(--nu-cream-line); }
.bzl--1 .bzr { background: var(--nu-navy); position: relative; isolation: isolate; }
.bzl--1 .bzr::before {
  content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background-image: radial-gradient(var(--nu-biz-ponto) 1.1px, transparent 1.4px); background-size: 22px 22px;
  -webkit-mask-image: linear-gradient(180deg, #000, transparent 70%); mask-image: linear-gradient(180deg, #000, transparent 70%);
}
.bzl--1 .bzr .bzl-olho { color: var(--nu-biz-lavanda); }
.bzl--1 .bzr .bzl-h2 { color: var(--nu-cream-text); }
.bzl--1 .bzr .bzl-dek { color: var(--nu-cream-text-70); }
.bzl--1 .bzr__card--escuro { background: var(--nu-navy-2); box-shadow: 0 0 0 1px var(--nu-white-14); }
.bzl--1 .bzr__card .bzb--cheio { background: var(--nu-navy); color: var(--nu-cream-text); }
.bzl--1 .bzr__card .bzb--cheio:hover { background: var(--nu-navy-3); }
.bzl--1 .bzr__card--escuro .bzb--contorno { color: var(--nu-cream-text); box-shadow: inset 0 0 0 1px var(--nu-cream-text-35); }
.bzl--1 .bzr__card--escuro .bzb--contorno:hover { background: var(--nu-white-14); }
.bzl--1 .bzf :deep(.nsh__title), .bzl--1 .bzc :deep(.rbct__titulo) { font-family: var(--serifa); font-weight: 400; letter-spacing: -0.02em; }

/* =====================================================================
   2 · A NOITE — a mais nossa (o céu do /benchmark-ia e da home)
   ===================================================================== */
.bzl--2 .bzh, .bzl--2 .bzp { background: var(--nu-agora-bg); color: var(--nu-agora-texto); }
.bzl--2 .bzh { padding-bottom: clamp(40px, 5vw, 72px); }
.bzl--2 .bzh__fundo {
  background:
    radial-gradient(60% 42% at 50% 0%, color-mix(in srgb, var(--nu-blue) 18%, transparent), transparent),
    linear-gradient(180deg, var(--nu-navy) 0%, color-mix(in srgb, var(--nu-navy) 55%, var(--nu-agora-bg)) 52%, var(--nu-agora-bg) 100%);
}
.bzl--2 .bzh__olho { color: var(--nu-agora-texto); font-size: var(--nu-fs-lg); font-weight: 700; letter-spacing: -0.02em; text-transform: none; }
.bzl--2 .bzh__titulo {
  font-size: clamp(38px, 5.6vw, 80px); font-weight: 500; letter-spacing: -0.05em; line-height: 1.03; max-width: 18ch;
  color: var(--nu-agora-texto);
  background: linear-gradient(180deg, var(--nu-agora-texto) 40%, var(--nu-cream-text-60) 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.bzl--2 .bzh__apoio { color: var(--nu-agora-sub); }
.bzl--2 .bzb--cheio { background: var(--nu-agora-texto); color: var(--nu-ink); }
.bzl--2 .bzb--cheio:hover { background: var(--nu-white); color: var(--nu-ink); box-shadow: 0 0 0 6px var(--nu-white-14); }
.bzl--2 .bzb--contorno { color: var(--nu-agora-texto); background: var(--nu-agora-pilula); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); }
.bzl--2 .bzb--contorno:hover { background: var(--nu-white-18); color: var(--nu-agora-texto); }
.bzl--2 .bzb:focus-visible { outline-color: var(--nu-white); }
.bzl--2 .bzh__garantias { color: var(--nu-agora-sub); }
.bzl--2 .bzh__impl { color: var(--nu-cream-text-50); }
/* a fila nasce na linha de luz do horizonte */
.bzl--2 .bzp { padding-top: clamp(56px, 6vw, 88px); overflow: hidden; isolation: isolate; }
.bzl--2 .bzp__horizonte {
  position: absolute; left: -10%; right: -10%; top: 0; height: 2px; pointer-events: none; z-index: -1;
  background: linear-gradient(90deg, transparent 4%, var(--nu-chat-luz-1) 24%, var(--nu-white-60) 50%, var(--nu-chat-luz-3) 76%, transparent 96%);
  box-shadow: 0 0 18px 3px var(--nu-chat-luz-1), 0 0 60px 14px var(--nu-chat-luz-2); border-radius: 50%;
}
.bzl--2 .bzp::after {
  content: ''; position: absolute; left: 50%; top: 0; width: 80%; height: 60%; transform: translateX(-50%); z-index: -2; pointer-events: none;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--nu-serie-5) 12%, transparent), transparent);
}
.bzl--2 .bzp .bzl-olho { color: var(--nu-agora-sub); }
.bzl--2 .bzp__bem { border-color: var(--nu-agora-linha); }
.bzl--2 .bzp__bem:last-child { border-bottom-color: var(--nu-agora-linha); }
.bzl--2 .bzp__txt { color: var(--nu-agora-texto); font-weight: 500; }
.bzl--2 .bzp__ic { background: var(--nu-agora-pilula); color: var(--nu-agora-texto); }
.bzl--2 .bzp__bem:hover .bzp__ic { background: var(--nu-agora-texto); color: var(--nu-ink); }
.bzl--2 .bzl-olho { color: var(--nu-blue-text); font-size: var(--nu-fs-sm); letter-spacing: 0; text-transform: none; }
.bzl--2 .bzl-h2, .bzl--2 .bzq__nome, .bzl--2 .bzr__titulo, .bzl--2 .bzs__t { font-weight: 500; letter-spacing: -0.045em; }
.bzl--2 .bzl-h2 { font-size: var(--nu-fs-h2-sm); }
.bzl--2 .bzq { text-align: center; }
.bzl--2 .bzq__lista { text-align: center; }
.bzl--2 .bzq__item { border-top: 0; padding: 8px 12px; }
.bzl--2 .bzq__linha { margin-inline: auto; }
.bzl--2 .bzq__n { display: none; }
.bzl--2 .bzs { padding-top: clamp(32px, 4vw, 64px); }
.bzl--2 .bzs__visual { background: var(--nu-agora-bg); }
.bzl--2 .bzs__acao { background: transparent; border-color: var(--nu-white-18); color: var(--nu-agora-sub); }
.bzl--2 .bzs__acao--sim { background: var(--nu-agora-texto); border-color: var(--nu-agora-texto); color: var(--nu-ink); }
.bzl--2 .bzs__aceite, .bzl--2 .bzs__ia { background: var(--nu-agora-cartao); box-shadow: 0 0 0 1px var(--nu-agora-linha); color: var(--nu-agora-texto); }
.bzl--2 .bzs__aceite-txt strong { color: var(--nu-agora-texto); }
.bzl--2 .bzs__aceite-txt span { color: var(--nu-agora-sub); }
.bzl--2 .bzs__ok { background: color-mix(in srgb, var(--nu-agora-verde) 18%, transparent); color: var(--nu-agora-verde); }
.bzl--2 .bzs__revogar { color: var(--nu-red-soft); box-shadow: inset 0 0 0 1px var(--nu-white-18); }
.bzl--2 .bzr { background: var(--nu-white); }
.bzl--2 .bzr__card--escuro { background: var(--nu-agora-bg); }
.bzl--2 .bzr__card .bzb--cheio { background: var(--nu-ink); color: var(--nu-white); }
.bzl--2 .bzr__card .bzb--cheio:hover { background: var(--nu-ink-75); color: var(--nu-white); box-shadow: none; }
.bzl--2 .bzr__card--escuro .bzb--contorno { background: var(--nu-agora-pilula); color: var(--nu-agora-texto); }
.bzl--2 .bzr__ponto { background: var(--nu-agora-ambar); }
.bzl--2 .bzf :deep(.nsh__title), .bzl--2 .bzc :deep(.rbct__titulo) { font-weight: 500; letter-spacing: -0.045em; }
.bzl--2 .bzc :deep(.rbct) { background: var(--nu-white); }

/* =====================================================================
   3 · CREME — o meio-termo (o site de hoje com a estrutura do print)
   ===================================================================== */
.bzl--3 .bzh { background: var(--nu-cream); color: var(--nu-ink); padding-bottom: clamp(140px, 16vw, 220px); }
.bzl--3 .bzh__fundo {
  background-image: radial-gradient(var(--nu-ink-14) 1px, transparent 1.3px); background-size: 24px 24px; background-position: center top;
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 35%, #000 20%, transparent 80%);
  mask-image: radial-gradient(ellipse 70% 60% at 50% 35%, #000 20%, transparent 80%);
  opacity: .7;
}
.bzl--3 .bzh__olho { color: var(--nu-blue-text); }
.bzl--3 .bzh__titulo { font-size: clamp(40px, 6vw, 84px); font-weight: 800; letter-spacing: -0.05em; line-height: 1.02; color: var(--nu-ink); max-width: 18ch; }
.bzl--3 .bzh__l2 { color: var(--nu-blue-text); }
.bzl--3 .bzh__apoio { color: var(--nu-gray-2); }
.bzl--3 .bzb--cheio { background: var(--nu-blue); color: var(--nu-white); box-shadow: 0 14px 30px -14px rgba(47, 106, 255, .6); }
.bzl--3 .bzb--cheio:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.bzl--3 .bzb--contorno { color: var(--nu-ink); box-shadow: inset 0 0 0 1.5px var(--nu-ink); }
.bzl--3 .bzb--contorno:hover { background: var(--nu-ink); color: var(--nu-white); }
.bzl--3 .bzh__garantias { color: var(--nu-gray-2); }
.bzl--3 .bzh__impl { color: var(--nu-gray); }
/* a fila sobe por cima do fim do hero: o produto é o que liga as duas bandas */
.bzl--3 .bzp { padding-top: 0; }
.bzl--3 .bzp__in { align-items: start; }
.bzl--3 .bzp__fila { margin-top: calc(-1 * clamp(100px, 12vw, 170px)); position: relative; z-index: 1; }
.bzl--3 .bzp__lado { padding-top: clamp(0px, 2vw, 28px); }
.bzl--3 .bzr { background: var(--nu-cream); }
.bzl--3 .bzq { background: var(--nu-white); }
@media (min-width: 960px) { .bzl--3 .bzp__lado { padding-top: clamp(20px, 3vw, 48px); } }

@media (prefers-reduced-motion: reduce) {
  .bzh__olho, .bzh__l1, .bzh__l2, .bzh__apoio, .bzh__ctas, .bzh__garantias, .bzh__impl { animation: none; }
  .bzb, .bzp__bem, .bzs__card { transition: none; }
  .bzb:hover, .bzp__bem:hover, .bzs__card:hover { transform: none; }
}
</style>
