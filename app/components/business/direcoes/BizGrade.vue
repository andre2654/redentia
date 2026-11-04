<script setup lang="ts">
/**
 * /business, direção 3 (?biz=3, 04/11/2026): A GRADE, POR TIPO DE CASA.
 *
 * Por quê: quem compra são dois perfis com regras opostas, e a página de hoje
 * fala com os dois ao mesmo tempo. O assessor ligado a XP ou BTG não pode
 * compartilhar carteira de cliente (RCVM 178, art. 25, VII: não envia extrato
 * de posição) e quer saber o que funciona sem o cliente; o family office e a
 * gestora querem o cliente dentro. Aqui a página é a linguagem da /teses
 * (TesesGrade): um cartão por coisa que a mesa recebe, cada um com um pedaço
 * da tela de verdade na capa, e uma barra que gruda com o tipo de casa. Escolher
 * "Assessor ligado a XP ou BTG" apaga os dois cartões que dependem do cliente
 * conectado e diz por quê; nada some do HTML (os seis cartões e as três notas
 * vêm no SSR, a escolha só muda a opacidade e qual nota aparece).
 *
 * Os dados das capas são os de RbJornadaCard (15/10/2026, datados) e o do
 * cenário é o do motor de 04/11/2026 (content/business/exemplo-cenario.ts).
 * Sem valor em reais no cartão do cliente: como no hero, a contagem de posições
 * e a divisão por classe descrevem a tela, não um patrimônio.
 */
import { EXEMPLO_CENARIO as X, reaisCurto } from '~/content/business/exemplo-cenario'

type Casa = 'todas' | 'vinculado' | 'fo'
const CASAS: { id: Casa; rotulo: string; nota: string }[] = [
  { id: 'todas', rotulo: 'Toda mesa', nota: 'Seis coisas que a mesa recebe no Claude ou no ChatGPT que já usa.' },
  { id: 'vinculado', rotulo: 'Assessor ligado a XP ou BTG', nota: 'Sem dado de cliente: a carteira entra colada, sem nome, e não fica salva na conta.' },
  { id: 'fo', rotulo: 'Family office e gestora', nota: 'Com o cliente dentro, pelo Open Finance e com o consentimento dele.' },
]
const casa = ref<Casa>('todas')

const CARTOES = [
  { id: 'cenario', quando: 'Quando o cliente liga', nome: 'E se o fiscal piorar?', frase: 'Cole a carteira e veja a faixa do patrimônio em 2.000 caminhos.', pe: `motor em ${X.data.slice(0, 5)}`, soCliente: false },
  { id: 'lista', quando: 'Antes do pregão', nome: 'O que mudou na sua lista.', frase: 'Até 50 ativos com preço, notícia e data-com, numa pergunta.', pe: '15/10', soCliente: false },
  { id: 'porque', quando: 'No meio do dia', nome: 'Por que o ativo mexeu.', frase: 'A notícia, a hora e o que muda para quem tem o papel.', pe: '15/10, 11:16', soCliente: false },
  { id: 'reuniao', quando: 'Antes da reunião', nome: 'A conversa já chega pronta.', frase: 'O que mudou desde a última conversa e o cenário que vale mostrar.', pe: '', soCliente: false },
  { id: 'cliente', quando: 'Com o cliente dentro', nome: 'A carteira do cliente, com o sim dele.', frase: 'Ele conecta o banco por Open Finance e revoga quando quiser.', pe: 'na implantação', soCliente: true },
  { id: 'relatorio', quando: 'Depois da reunião', nome: 'O relatório com a marca da casa.', frase: 'O cenário sobre a carteira do cliente, com o nome do escritório.', pe: 'na implantação', soCliente: true },
] as const

const apagado = (c: (typeof CARTOES)[number]) => casa.value === 'vinculado' && c.soCliente

const LISTA = [
  { t: 'PETR4', p: '57,77', v: '−0,59%' },
  { t: 'VALE3', p: '66,55', v: '−0,25%' },
  { t: 'ITUB4', p: '48,93', v: '−0,10%' },
]
const CLASSES = [
  { nome: 'Renda fixa', pct: 46, cor: 'var(--nu-alloc-fixed)' },
  { nome: 'Ações', pct: 28, cor: 'var(--nu-alloc-stock)' },
  { nome: 'FIIs', pct: 16, cor: 'var(--nu-alloc-fii)' },
  { nome: 'Exterior', pct: 10, cor: 'var(--nu-class-etf)' },
]
/* a régua do cenário: onde R$ 1 milhão cai entre o p05 e o p95 do motor */
const lo = X.final.p05
const hi = X.final.p95
const pos = (v: number) => `${(((v - lo) / (hi - lo)) * 100).toFixed(1)}%`

const SEGURANCA = [
  { t: 'Só lê.', d: 'Nada compra, vende ou transfere.' },
  { t: 'Cliente só entra com o sim dele.', d: 'Cada leitura fica registrada.' },
  { t: 'A IA é a da sua casa.', d: 'O Claude ou o ChatGPT do escritório.' },
]

const ctx = (c: (typeof CARTOES)[number]) => ({ id: `business:${c.id}`, tipo: 'bloco', rotulo: c.nome })
const ctxSeg = { id: 'business:seguranca', tipo: 'bloco', rotulo: 'Segurança do Redentia For Business' }
const ctxPlano = { id: 'business:plano', tipo: 'bloco', rotulo: 'O plano do Redentia For Business' }
</script>

<template>
  <div class="bzg">
    <header id="gargalo" class="bzg-topo">
      <p class="bzg-topo__produto">Redentia For Business</p>
      <h1 class="bzg-topo__titulo">Consolide a carteira do seu cliente com 1 clique.</h1>
      <div class="bzg-topo__pe">
        <p class="bzg-topo__dek">E o mercado de hoje pronto antes da reunião, no Claude ou no ChatGPT da sua mesa.</p>
        <div class="bzg-topo__acao">
          <a href="#contato" class="bzg__cta">Agendar 1 hora com a gente</a>
          <span class="bzg-topo__status">Conexão habilitada escritório a escritório, na implantação.</span>
        </div>
      </div>
    </header>

    <!-- a barra que gruda: o tipo de casa -->
    <div class="bzg-barra">
      <div class="bzg-barra__in">
        <span class="bzg-barra__r" id="bzg-casa">Para quem</span>
        <div class="bzg-barra__chips" role="radiogroup" aria-labelledby="bzg-casa">
          <button
            v-for="c in CASAS" :key="c.id" type="button" role="radio" class="bzg-barra__chip"
            :class="{ 'bzg-barra__chip--on': casa === c.id }" :aria-checked="casa === c.id" @click="casa = c.id"
          >
            {{ c.rotulo }}
          </button>
        </div>
      </div>
    </div>

    <div id="dia" class="bzg-corpo">
      <p v-for="c in CASAS" v-show="casa === c.id" :key="c.id" class="bzg-corpo__nota" aria-live="polite">{{ c.nota }}</p>

      <ul class="bzg-grade">
        <li v-for="c in CARTOES" :key="c.id">
          <article v-contexto-chat="ctx(c)" class="bzg-c" :class="{ 'bzg-c--apagado': apagado(c) }">
            <div class="bzg-c__capa" :class="{ 'bzg-c__capa--navy': c.id === 'cenario' || c.id === 'relatorio' }" aria-hidden="true">
              <!-- o cenário: a faixa do motor numa régua -->
              <div v-if="c.id === 'cenario'" class="bzg-k">
                <span class="bzg-k__rot">{{ X.cenario }} · 1 ano</span>
                <span class="bzg-k__faixa">{{ reaisCurto(X.final.p10) }} a {{ reaisCurto(X.final.p90) }}</span>
                <span class="bzg-k__regua">
                  <span class="bzg-k__80" :style="{ left: pos(X.final.p10), right: `calc(100% - ${pos(X.final.p90)})` }" />
                  <span class="bzg-k__hoje" :style="{ left: pos(X.inicio) }" />
                </span>
                <span class="bzg-k__leg">em 80% dos caminhos · carteira de exemplo de R$ 1 milhão</span>
              </div>
              <ul v-else-if="c.id === 'lista'" class="bzg-l">
                <li v-for="r in LISTA" :key="r.t"><b>{{ r.t }}</b><span>R$ {{ r.p }}</span><em>{{ r.v }}</em></li>
                <li><b>HGLG11</b><span class="bzg-l__ev">paga R$ 1,17 hoje</span></li>
              </ul>
              <div v-else-if="c.id === 'porque'" class="bzg-p">
                <span class="bzg-p__rot">VALE3 · por que caiu</span>
                <span class="bzg-p__head">−1,06% às 11h10, com o minério em queda</span>
                <span class="bzg-p__src">Valor Investe · leitura da Redentia</span>
              </div>
              <ol v-else-if="c.id === 'reuniao'" class="bzg-r">
                <li>O que mudou desde a última conversa</li>
                <li>Os FIIs que pagam esta semana</li>
                <li>A carteira no cenário fiscal</li>
              </ol>
              <div v-else-if="c.id === 'cliente'" class="bzg-cl">
                <span class="bzg-cl__topo"><b>Mariana Ribeiro Costa</b><span>14 posições</span></span>
                <span class="bzg-cl__barra"><span v-for="k in CLASSES" :key="k.nome" :style="{ flexBasis: `${k.pct}%`, background: k.cor }" /></span>
                <span class="bzg-cl__leg"><span v-for="k in CLASSES" :key="k.nome"><i :style="{ background: k.cor }" />{{ k.nome }} {{ k.pct }}%</span></span>
              </div>
              <div v-else class="bzg-doc">
                <span class="bzg-doc__marca">A marca do escritório</span>
                <span class="bzg-doc__t">Mariana · a carteira no cenário fiscal</span>
                <span class="bzg-doc__linhas"><i /><i /><i /></span>
              </div>
            </div>
            <div class="bzg-c__corpo">
              <span class="bzg-c__quando">{{ c.quando }}</span>
              <h2 class="bzg-c__nome">{{ c.nome }}</h2>
              <p class="bzg-c__frase">{{ c.frase }}</p>
              <span class="bzg-c__pe">
                <span class="bzg-c__para" :class="{ 'bzg-c__para--fo': c.soCliente }">{{ c.soCliente ? 'Family office e gestora' : 'Toda mesa' }}</span>
                <span v-if="c.pe" class="bzg-c__data">{{ c.pe }}</span>
              </span>
            </div>
          </article>
        </li>
      </ul>
    </div>

    <section id="seguranca" v-contexto-chat="ctxSeg" class="bzg-seg">
      <h2 class="bzg-seg__titulo">Seu compliance pergunta.<br>A gente mostra.</h2>
      <ul class="bzg-seg__lista">
        <li v-for="(s, i) in SEGURANCA" :key="s.t">
          <span class="bzg-seg__n">{{ String(i + 1).padStart(2, '0') }}</span>
          <b>{{ s.t }}</b>
          <span>{{ s.d }}</span>
        </li>
      </ul>
    </section>

    <div v-contexto-chat="ctxPlano"><RbProva /></div>
    <BizFaq />
    <RbContato />
  </div>
</template>

<style scoped>
.bzg { --g: clamp(22px, 5.5vw, 80px); --sombra: 0 0 0 1px rgba(12, 21, 36, .07), 0 30px 70px -28px rgba(12, 21, 36, .42); background: var(--nu-white); }
.bzg__cta {
  display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 26px;
  border-radius: var(--nu-r-pill); background: var(--nu-blue); color: var(--nu-white);
  font-size: var(--nu-fs-md); font-weight: 700; box-shadow: var(--nu-home-sombra-botao); transition: background .2s;
}
.bzg__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.bzg__cta:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }

/* ——— o topo: o da /teses ——— */
.bzg-topo { padding: clamp(40px, 5.2vw, 80px) var(--g) clamp(28px, 3.4vw, 48px); }
.bzg-topo__produto { margin: 0; color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 700; }
.bzg-topo__titulo { margin: 12px 0 0; max-width: 18ch; color: var(--nu-ink); font-size: clamp(38px, 5.4vw, 80px); font-weight: 500; letter-spacing: -0.055em; line-height: 1.01; }
.bzg-topo__pe { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 20px 48px; margin-top: clamp(18px, 2vw, 28px); }
.bzg-topo__dek { margin: 0; max-width: 46ch; color: var(--nu-gray-2); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; }
.bzg-topo__acao { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; }
.bzg-topo__status { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.bzg-topo__pe { animation: nu-fade .6s cubic-bezier(.2, .8, .2, 1) .1s backwards; }

/* ——— a barra ——— */
.bzg-barra {
  position: sticky; top: var(--nuh-h, 76px); z-index: 30;
  background: color-mix(in srgb, var(--nu-white) 90%, transparent);
  -webkit-backdrop-filter: saturate(1.4) blur(14px); backdrop-filter: saturate(1.4) blur(14px);
  border-top: 1px solid var(--nu-cream-line); border-bottom: 1px solid var(--nu-cream-line);
}
.bzg-barra__in { display: flex; align-items: center; gap: 14px; padding: 12px var(--g); }
.bzg-barra__r { flex-shrink: 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; }
.bzg-barra__chips { display: flex; gap: 8px; min-width: 0; overflow-x: auto; scrollbar-width: none; }
.bzg-barra__chip {
  flex-shrink: 0; height: 38px; padding: 0 16px; border: 0; border-radius: var(--nu-r-pill);
  background: var(--nu-cream); color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-sm); font-weight: 600; white-space: nowrap;
  cursor: pointer; transition: background .2s, color .2s;
}
.bzg-barra__chip:hover { background: var(--nu-cream-hover); box-shadow: inset 0 0 0 1px var(--nu-cream-line); }
.bzg-barra__chip--on, .bzg-barra__chip--on:hover { background: var(--nu-ink); color: var(--nu-white); box-shadow: none; }
.bzg-barra__chip:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

/* ——— a grade ——— */
.bzg-corpo { scroll-margin-top: calc(var(--nuh-h, 76px) + 64px); padding: 20px var(--g) clamp(64px, 8vw, 112px); }
.bzg-corpo__nota { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; }
.bzg-grade {
  list-style: none; margin: 16px 0 0; padding: 0;
  --gap: clamp(16px, 1.8vw, 24px);
  display: grid; gap: var(--gap);
  grid-template-columns: repeat(auto-fill, minmax(min(100%, max(280px, calc((100% - 2 * var(--gap)) / 3))), 1fr));
}
.bzg-c {
  display: flex; flex-direction: column; height: 100%; border-radius: var(--nu-r-card); overflow: hidden;
  background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-cream-line);
  transition: transform .2s, box-shadow .2s, opacity .3s;
}
.bzg-c:hover { transform: translateY(-2px); box-shadow: inset 0 0 0 1px var(--nu-cream-line), var(--nu-shadow-card); }
.bzg-c--apagado { opacity: .38; }
.bzg-c--apagado:hover { transform: none; }
.bzg-c__capa { aspect-ratio: 16 / 9; display: grid; place-items: center; padding: 22px; background: var(--nu-cream); }
.bzg-c__capa--navy { background: var(--nu-navy); color: var(--nu-cream-text); }
.bzg-c__corpo { flex: 1; display: flex; flex-direction: column; padding: 20px 22px; }
.bzg-c__quando { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; }
.bzg-c__nome { margin: 10px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 600; letter-spacing: -0.03em; line-height: 1.18; }
.bzg-c__frase { margin: 8px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; }
.bzg-c__pe { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: auto; padding-top: 16px; border-top: 1px solid var(--nu-cream-line); }
.bzg-c__frase { margin-bottom: 18px; }
.bzg-c__para { display: inline-flex; align-items: center; gap: 7px; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 600; }
.bzg-c__para::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: var(--nu-blue); }
.bzg-c__para--fo::before { background: var(--nu-alloc-fii); }
.bzg-c__data { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; font-variant-numeric: tabular-nums; }

/* as capas: pedaços da tela, desenhados chapados (sem cartão dentro do cartão) */
.bzg-k { width: 100%; display: flex; flex-direction: column; gap: 8px; font-variant-numeric: tabular-nums; }
.bzg-k__rot { color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 700; }
.bzg-k__faixa { color: var(--nu-cream-text); font-size: var(--nu-fs-2xl); font-weight: 500; letter-spacing: -0.03em; }
.bzg-k__regua { position: relative; height: 10px; margin-top: 6px; border-radius: 5px; background: var(--nu-cream-text-10); }
.bzg-k__80 { position: absolute; top: 0; bottom: 0; border-radius: 5px; background: var(--nu-cream-text-45); }
.bzg-k__hoje { position: absolute; top: -4px; bottom: -4px; width: 2px; margin-left: -1px; background: var(--nu-white); box-shadow: 0 0 10px var(--nu-blue-soft); }
.bzg-k__leg { color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 500; }
.bzg-l { width: 100%; margin: 0; padding: 0; list-style: none; font-variant-numeric: tabular-nums; }
.bzg-l li { display: grid; grid-template-columns: 1fr auto 64px; gap: 10px; padding: 7px 0; border-top: 1px solid var(--nu-cream-line); font-size: var(--nu-fs-sm); }
.bzg-l li:first-child { border-top: 0; }
.bzg-l b { color: var(--nu-ink); font-weight: 700; }
.bzg-l span { color: var(--nu-gray-2); font-weight: 500; text-align: right; }
.bzg-l em { color: var(--nu-red-text); font-style: normal; font-weight: 700; text-align: right; }
.bzg-l .bzg-l__ev { grid-column: 2 / -1; color: var(--nu-gray-2); font-weight: 700; }
.bzg-p { width: 100%; display: flex; flex-direction: column; gap: 8px; }
.bzg-p__rot { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; }
.bzg-p__head { color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 600; letter-spacing: -0.02em; line-height: 1.3; }
.bzg-p__src { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; }
.bzg-r { width: 100%; margin: 0; padding-left: 22px; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.45; }
.bzg-r li { padding: 6px 0; }
.bzg-r li::marker { color: var(--nu-blue-text); font-weight: 700; }
.bzg-cl { width: 100%; display: flex; flex-direction: column; gap: 12px; }
.bzg-cl__topo { display: flex; justify-content: space-between; gap: 10px; font-size: var(--nu-fs-sm); }
.bzg-cl__topo b { color: var(--nu-ink); font-weight: 700; }
.bzg-cl__topo span { color: var(--nu-gray); font-weight: 500; font-variant-numeric: tabular-nums; }
.bzg-cl__barra { display: flex; gap: 3px; height: 12px; }
.bzg-cl__barra span { border-radius: 3px; }
.bzg-cl__leg { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; color: var(--nu-gray-2); font-size: var(--nu-fs-xs); font-weight: 500; font-variant-numeric: tabular-nums; }
.bzg-cl__leg span { display: flex; align-items: center; gap: 6px; }
.bzg-cl__leg i { width: 8px; height: 8px; border-radius: 2px; }
.bzg-doc { width: 100%; display: flex; flex-direction: column; gap: 10px; }
.bzg-doc__marca { align-self: flex-start; padding: 4px 10px; border-radius: var(--nu-r-pill); box-shadow: inset 0 0 0 1px var(--nu-cream-text-35); color: var(--nu-cream-text-70); font-size: var(--nu-fs-xs); font-weight: 700; }
.bzg-doc__t { color: var(--nu-cream-text); font-size: var(--nu-fs-lg); font-weight: 600; letter-spacing: -0.02em; }
.bzg-doc__linhas { display: flex; flex-direction: column; gap: 7px; }
.bzg-doc__linhas i { height: 6px; border-radius: 3px; background: var(--nu-cream-text-14); }
.bzg-doc__linhas i:nth-child(2) { width: 86%; }
.bzg-doc__linhas i:nth-child(3) { width: 62%; }

/* ——— segurança ——— */
.bzg-seg {
  scroll-margin-top: calc(var(--nuh-h, 76px) + 24px);
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr); gap: clamp(28px, 5vw, 80px); align-items: start;
  padding: clamp(64px, 8vw, 112px) var(--g); background: var(--nu-cream);
}
.bzg-seg__titulo { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm); font-weight: 500; letter-spacing: -0.045em; line-height: 1.05; }
.bzg-seg__lista { margin: 0; padding: 0; list-style: none; }
.bzg-seg__lista li {
  display: grid; grid-template-columns: 40px minmax(0, 1fr) minmax(0, 1.2fr); gap: 16px; align-items: baseline;
  padding: 20px 0; border-top: 1px solid var(--nu-cream-line);
  color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5;
}
.bzg-seg__lista li:last-child { border-bottom: 1px solid var(--nu-cream-line); }
.bzg-seg__n { color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.bzg-seg__lista b { color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 600; letter-spacing: -0.02em; }

@media (max-width: 900px) {
  .bzg-seg { grid-template-columns: 1fr; }
  .bzg-seg__lista li { grid-template-columns: 32px minmax(0, 1fr); }
  .bzg-seg__lista li > span:last-child { grid-column: 2; }
  .bzg-barra__in { padding: 10px 0 10px var(--g); }
  .bzg-barra__r { display: none; }
  .bzg-barra__chips { padding-right: var(--g); }
  .bzg-c__nome { font-size: var(--nu-fs-xl); }
}
@media (max-width: 560px) {
  .bzg-topo__acao, .bzg__cta { align-self: stretch; }
  .bzg-c__capa { aspect-ratio: auto; min-height: 168px; }
}

/* ——— o plano de hoje, no branco e no idioma novo ——— */
.bzg :deep(.rbpv) { background: var(--nu-white); }
.bzg :deep(.rbpv .nsh__title) { font-weight: 500; letter-spacing: -0.05em; }
.bzg :deep(.rbpv__card) { border: 0; border-radius: var(--nu-r-card); box-shadow: var(--sombra); }
.bzg :deep(.rbpv__card--navy) { box-shadow: 0 0 0 1px var(--nu-navy), 0 30px 70px -28px rgba(12, 21, 36, .6); }
.bzg :deep(.rbpv__titulo), .bzg :deep(.rbpv__valor) { font-weight: 500; letter-spacing: -0.05em; }
.bzg :deep(.rbpv__cta) { font-weight: 700; }
.bzg :deep(.rbct) { background: var(--nu-white); }
.bzg :deep(.rbct__titulo) { font-weight: 500; letter-spacing: -0.05em; }
.bzg :deep(.rbct__card) { border-radius: var(--nu-r-card); box-shadow: var(--sombra); }

@media (prefers-reduced-motion: reduce) {
  .bzg-topo__pe { animation: none; }
  .bzg-c { transition: opacity .2s; }
  .bzg-c:hover { transform: none; }
}
</style>
