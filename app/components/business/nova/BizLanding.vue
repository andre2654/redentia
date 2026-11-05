<script setup lang="ts">
/**
 * A /business (05/11/2026). O dono mandou o print de uma landing do Redentia
 * For Business ("vamos tentar deixar mais nesse estilo, só que mais o nosso
 * estilo"), viu três variações no dev e escolheu a 1, a SERIFA, a mais fiel ao
 * print: topo e hero navy com grade de pontos, título em serifa, botão lavanda
 * e a fila de aprovação no cartão navy. As outras duas (A noite e Creme) saíram;
 * estão no commit c7608d09.
 *
 * O pedido junto com a escolha: "depois do hero dedique aqueles scrolls
 * personalizados para explicar melhor esses pontos". Por isso, logo depois da
 * fila, vem o scroll travado (BizPassos), um passo por item da fila, e o botão
 * de cada item rola até o passo dele.
 *
 * Ordem das bandas: hero navy → a fila e os três benefícios (branco) → os
 * quatro passos (navy, a foto presa) → para quem (creme) → segurança (branco)
 * → preço (navy) → FAQ (branco) → o fecho.
 *
 * SEO: um H1 só (o título do print), o FAQ inteiro no SSR com um FAQPage só
 * (RbFaq), o mesmo #contato (RbContato) e as âncoras do topo e do rodapé
 * (#agentes, #para-quem, #seguranca, #prova, #faq, #contato).
 * Densidade: o teto de ~650 palavras fora do FAQ (scripts/seo-paridade-business.mjs).
 */
import {
  CTA_AGENDA, CTA_DEMO, HERO, LOGOS_CLIENTES, PARA_QUEM, SEGURANCA, precoDaMesa,
} from '~/content/business/landing'

const destinoCadastro = useDestinoCadastroBusiness()

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
  <div class="bzl">
    <!-- ================= o hero ================= -->
    <section class="bzh" aria-labelledby="bzh-titulo">
      <div class="bzh__fundo" aria-hidden="true" />
      <div class="bzh__in">
        <p class="bzh__olho">Redentia For Business</p>
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

    <!-- ================= o produto: a fila de aprovação =================
         Os três benefícios do print saíram em 05/11/2026: os quatro passos logo
         abaixo explicam os mesmos pontos, um por tela, e o teto de palavras não
         comportava os dois. -->
    <section id="agentes" class="bzp" aria-labelledby="bzp-titulo">
      <div class="bzp__in">
        <h2 id="bzp-titulo" class="bzl-olho">Agentes</h2>
        <div class="bzp__fila"><BizFila /></div>
      </div>
    </section>

    <!-- ================= os quatro pontos da fila, um por tela ================= -->
    <BizPassos />

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
        <p class="bzl-dek">Por pessoa da mesa, não pelo que o cliente compra.</p>
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
          <NuxtLink :to="destinoCadastro" class="bzb bzb--cheio bzr__cta">{{ CTA_DEMO }}</NuxtLink>
          <!-- prazo mínimo e reajuste moram no FAQ ("Tem fidelidade?", "Quanto custa?") -->
          <a href="#contato" class="bzr__mais">{{ CTA_AGENDA }}</a>
        </div>
      </div>
    </section>

    <div class="bzf"><RbFaq /></div>
    <div class="bzc"><RbContato /></div>
  </div>
</template>

<style scoped>
/* =====================================================================
   BASE: a estrutura. A tinta, a serifa e os fundos da Serifa estão no bloco
   do fim do arquivo.
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

/* ——— o produto: a fila, sozinha e no centro ——— */
.bzp { position: relative; padding: clamp(56px, 7vw, 104px) var(--g); }
.bzp__in { display: flex; flex-direction: column; align-items: center; gap: 22px; max-width: 1180px; margin: 0 auto; }
.bzp__fila { width: 100%; max-width: 580px; }

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
.bzr__cards { margin: clamp(36px, 4.4vw, 56px) auto 0; max-width: 520px; }
.bzr__card { display: flex; flex-direction: column; padding: clamp(24px, 3vw, 36px); border-radius: var(--nu-r-card-lg); background: var(--nu-white); box-shadow: var(--sombra); }
.bzr__nome { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 700; }
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
.bzr__cta { margin-top: 26px; align-self: stretch; }
.bzr__mais { align-self: center; margin-top: 14px; padding: 10px 6px; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1px; }
.bzr__mais:hover { color: var(--nu-blue-text); }
.bzr__mais:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; border-radius: 4px; }

/* ——— FAQ e fecho: os componentes de antes, com a tinta da Serifa ——— */
.bzf :deep(.rbfq) { animation: none; }

@media (max-width: 640px) {
  .bzh__ctas { flex-direction: column; align-self: stretch; }
  .bzb { width: 100%; }
  .bzh__garantias { flex-direction: column; align-items: center; gap: 4px; }
  .bzh__garantias li + li::before { display: none; }
  .bzl-br { display: none; }
  .bzr__faixas { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

/* =====================================================================
   A SERIFA (a variação 1, a escolhida): a tinta, a serifa e os fundos
   ===================================================================== */
.bzl .bzh { background: var(--nu-navy); color: var(--nu-cream-text); }
.bzl .bzh__fundo {
  /* a grade de pontos do print, apagando para as bordas */
  background-image: radial-gradient(var(--nu-biz-ponto) 1.1px, transparent 1.4px);
  background-size: 22px 22px; background-position: center top;
  -webkit-mask-image: radial-gradient(ellipse 75% 70% at 50% 40%, #000 30%, transparent 85%);
  mask-image: radial-gradient(ellipse 75% 70% at 50% 40%, #000 30%, transparent 85%);
}
.bzl .bzh::after {
  /* a luz azul que sobe do pé do hero */
  content: ''; position: absolute; left: 50%; bottom: -30%; width: 90%; height: 70%; transform: translateX(-50%); z-index: -1; pointer-events: none;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--nu-blue) 22%, transparent), transparent);
}
.bzl .bzh__olho { color: var(--nu-biz-lavanda); }
.bzl .bzh__titulo { font-family: var(--serifa); font-weight: 400; font-size: clamp(40px, 6.4vw, 92px); letter-spacing: -0.02em; line-height: 1.04; color: var(--nu-cream-text); max-width: 19ch; }
.bzl .bzh__l2 { color: var(--nu-cream-text-70); font-style: italic; }
.bzl .bzh__apoio { color: var(--nu-cream-text-78); }
.bzl .bzb--cheio { background: var(--nu-biz-lavanda); color: var(--nu-navy); box-shadow: 0 10px 30px -12px rgba(195, 203, 255, .55); }
.bzl .bzb--cheio:hover { background: var(--nu-biz-lavanda-hover); color: var(--nu-navy); }
.bzl .bzb--contorno { color: var(--nu-cream-text); box-shadow: inset 0 0 0 1px var(--nu-cream-text-35); }
.bzl .bzb--contorno:hover { box-shadow: inset 0 0 0 1px var(--nu-cream-text); background: var(--nu-white-14); color: var(--nu-cream-text); }
.bzl .bzh__garantias { color: var(--nu-cream-text-70); }
.bzl .bzh__impl { color: var(--nu-cream-text-55); }
.bzl .bzl-olho { color: var(--nu-blue-text); }
.bzl .bzl-h2, .bzl .bzq__nome { font-family: var(--serifa); font-weight: 400; letter-spacing: -0.02em; }
.bzl .bzq { background: var(--nu-cream); }
.bzl .bzq__item:hover { border-top-color: var(--nu-navy); }
.bzl .bzs__card { box-shadow: 0 0 0 1px var(--nu-cream-line); }
.bzl .bzr { background: var(--nu-navy); position: relative; isolation: isolate; }
.bzl .bzr::before {
  content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background-image: radial-gradient(var(--nu-biz-ponto) 1.1px, transparent 1.4px); background-size: 22px 22px;
  -webkit-mask-image: linear-gradient(180deg, #000, transparent 70%); mask-image: linear-gradient(180deg, #000, transparent 70%);
}
.bzl .bzr .bzl-olho { color: var(--nu-biz-lavanda); }
.bzl .bzr .bzl-h2 { color: var(--nu-cream-text); }
.bzl .bzr .bzl-dek { color: var(--nu-cream-text-70); }
.bzl .bzr__card .bzb--cheio { background: var(--nu-navy); color: var(--nu-cream-text); }
.bzl .bzr__card .bzb--cheio:hover { background: var(--nu-navy-3); }
.bzl .bzf :deep(.nsh__title), .bzl .bzc :deep(.rbct__titulo) { font-family: var(--serifa); font-weight: 400; letter-spacing: -0.02em; }

@media (prefers-reduced-motion: reduce) {
  .bzh__olho, .bzh__l1, .bzh__l2, .bzh__apoio, .bzh__ctas, .bzh__garantias, .bzh__impl { animation: none; }
  .bzb, .bzs__card { transition: none; }
  .bzb:hover, .bzs__card:hover { transform: none; }
}
</style>
