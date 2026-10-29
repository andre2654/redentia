<script setup lang="ts">
/**
 * Hero da Redentia for Business.
 *
 * "CONSOLIDE A CARTEIRA DO SEU CLIENTE COM 1 CLIQUE" (direção do dono,
 * 15/10/2026, com o pedido "mostre umas animações"). O hero deixou de vender o
 * preparo do dia ("O mercado de hoje, antes da sua reunião", que continua no
 * scroll) e passou a vender a conexão do cliente. A esquerda segue o formato da
 * Decade: título, uma frase, o botão e uma linha ao lado dele. A direita segue
 * sendo foto com um card de produto, e o card agora é uma ANIMAÇÃO que conta o
 * "1 clique" na tela de Clientes do escritório, com as palavras da tela de
 * verdade (/business/clientes):
 *   1. o cursor clica em "Criar e gerar link" (o único gesto do assessor);
 *   2. o cliente conecta XP, BTG e Nubank pelo Open Finance;
 *   3. a carteira chega consolidada: 14 posições e a divisão por classe.
 *
 * ⚠️ O QUE SEGURA A PROMESSA EM PÉ:
 *  - "1 clique" é o do assessor: o convite sai de um botão. O resto é o
 *    cliente autorizando no banco dele, e a frase de apoio diz isso.
 *  - Um cliente pode ter mais de uma conexão (BusinessClient::connections, e o
 *    ClientPortfolioReader soma as posições de todas). Por isso três bancos.
 *  - A conexão é ligada pela Redentia conta a conta, e o contrato do Open
 *    Finance para escritório ainda não foi assinado. Por isso a linha ao lado
 *    do botão diz "habilitada escritório a escritório, na implantação" (a frase
 *    do CV-19). Enquanto for assim, ela não sai daqui.
 *  - Sem valor em reais no card: patrimônio inventado no hero pediria legenda
 *    de "valores criados" (revisão de 13/08/2026). Ficam a contagem de posições
 *    e a divisão por classe, que descrevem a tela, não um cliente.
 *  - Mariana Ribeiro Costa é o mesmo nome do card 05 do scroll (RbJornadaCard).
 *
 * TRÊS LIÇÕES QUE O HERO ANTERIOR JÁ TINHA PAGO, e que valem aqui:
 *  1. REPOUSO = ESTADO FINAL. O SSR serve a carteira já consolidada. Sem JS,
 *     com aba em segundo plano ou com reduced-motion, o card já conta a
 *     história inteira. No navegador, o card fica parado no final por alguns
 *     segundos e só então recomeça do clique.
 *  2. ANIMAÇÃO NÃO MUDA ALTURA. Tudo existe no DOM desde o início; as fases só
 *     mexem em opacidade e transform, então o card não pula.
 *  3. reduced-motion é checado À MÃO, porque o relógio das fases é JS e o
 *     @media global do base.css só congela CSS.
 * E o CONTROLE: a animação repete a cada ~11 s, então tem botão de pausar
 * (SC 2.2.2, Nível A: movimento acima de 5 s, em paralelo com outro conteúdo).
 */

/* As fases, na ordem, com quanto cada uma dura. O card lê só `fase`. */
const FASES = [
  { id: 'inicio', ms: 1100 }, // o card reacende no botão "Criar e gerar link"
  { id: 'mira', ms: 650 }, // o cursor chega ao botão
  { id: 'clique', ms: 260 }, // o botão afunda
  { id: 'link', ms: 650 }, // "Link enviado"
  { id: 'banco1', ms: 480 }, // XP conectando
  { id: 'banco2', ms: 480 }, // XP ok, BTG conectando
  { id: 'banco3', ms: 480 }, // BTG ok, Nubank conectando
  { id: 'bancos', ms: 420 }, // Nubank ok
  { id: 'consolidada', ms: 5200 }, // a carteira inteira, parada
  { id: 'saida', ms: 420 }, // o card apaga inteiro (o miolo reseta escondido)
] as const
const F = Object.fromEntries(FASES.map((f, i) => [f.id, i])) as Record<(typeof FASES)[number]['id'], number>

const BANCOS = [
  { sigla: 'XP', nome: 'XP Investimentos', posicoes: 6 },
  { sigla: 'BTG', nome: 'BTG Pactual', posicoes: 5 },
  { sigla: 'Nu', nome: 'Nubank', posicoes: 3 },
] as const
const TOTAL_POSICOES = BANCOS.reduce((s, b) => s + b.posicoes, 0)

/* A divisão por classe da carteira consolidada. As cores são as de alocação do
   app (tokens.css), as mesmas da /carteira. */
const CLASSES = [
  { nome: 'Renda fixa', pct: 46, cor: 'var(--nu-alloc-fixed)', frase: 'em renda fixa' },
  { nome: 'Ações', pct: 28, cor: 'var(--nu-alloc-stock)', frase: 'em ações' },
  { nome: 'FIIs', pct: 16, cor: 'var(--nu-alloc-fii)', frase: 'em FIIs' },
  { nome: 'Exterior', pct: 10, cor: 'var(--nu-class-etf)', frase: 'no exterior' },
] as const

/* Quem não enxerga o card ouve a história inteira de uma vez. */
const DESCRICAO = `Na tela de Clientes do escritório, um clique em Criar e gerar link. O cliente conecta ${BANCOS.map(b => b.nome).join(', ').replace(/, ([^,]*)$/, ' e $1')} pelo Open Finance, e a carteira de Mariana Ribeiro Costa chega consolidada, com ${TOTAL_POSICOES} posições: ${CLASSES.map(c => `${c.pct}% ${c.frase}`).join(', ').replace(/, ([^,]*)$/, ' e $1')}.`

/* A foto do painel é o LCP da página. O preload tira a descoberta dela do fim
   do parse de CSS e JS. */
useHead({
  link: [{ rel: 'preload', as: 'image', href: '/business-hero/lounge.webp', fetchpriority: 'high' }],
})

// SSR e reduced-motion: o estado final (lição 1)
const fase = ref<number>(F.consolidada)
const posicoes = ref<number>(TOTAL_POSICOES)
const pausado = ref(false)
const anima = ref(false) // só vira true no navegador, sem reduced-motion

let timer: ReturnType<typeof setTimeout> | null = null
let raf = 0
/* Sobe a cada ciclo. Um quadro antigo, já agendado, não escreve por cima
   do ciclo novo: o cancelAnimationFrame perde a corrida se o callback já
   entrou na fila. */
let geracao = 0

function cancelarQuadro() {
  geracao++
  if (raf) { cancelAnimationFrame(raf); raf = 0 }
}
function limpar() {
  if (timer) { clearTimeout(timer); timer = null }
  cancelarQuadro()
}

/* A contagem de posições sobe de 0 a 14 quando a carteira consolida: é o
   número que rola do card da Decade, no nosso tamanho.

   O carimbo do requestAnimationFrame pode vir ATRÁS de performance.now():
   um quadro no Chrome (o card pisca "-1") e segundos inteiros com tempo
   virtual, quando o quadro trava e o timer segue. A curva `1-(1-t)**3` não
   tem piso, então esse atraso vira "-8911 posições" e, no ciclo seguinte,
   "-198424". O quadro não termina (t fica negativo, logo < 1) e o ciclo
   novo não cancelava o anterior. Cada ciclo cancela o quadro e o timer de
   antes, recomeça do zero e prende o número entre 0 e 14. */
function contar() {
  cancelarQuadro()
  const minha = geracao
  const inicio = performance.now()
  const dur = 650
  const passo = (agora: number) => {
    if (minha !== geracao) return
    const peloRelogio = performance.now() - inicio
    const peloQuadro = agora - inicio
    const decorrido = Math.min(dur, Math.max(0, peloRelogio, peloQuadro))
    const t = decorrido / dur
    const n = Math.round(TOTAL_POSICOES * (1 - (1 - t) ** 3))
    posicoes.value = Math.min(TOTAL_POSICOES, Math.max(0, n))
    if (t < 1) raf = requestAnimationFrame(passo)
    else raf = 0
  }
  posicoes.value = 0
  raf = requestAnimationFrame(passo)
}

function agendar(ms: number) {
  if (timer) clearTimeout(timer)
  timer = setTimeout(avancar, ms)
}
function avancar() {
  /* Fim do compasso consolidado: solta a contagem que ainda estiver no ar
     e repousa no 14, que é o estado final do ciclo (a saída apaga o card
     inteiro em cima dele). */
  if (fase.value === F.consolidada) {
    cancelarQuadro()
    posicoes.value = TOTAL_POSICOES
  }
  fase.value = (fase.value + 1) % FASES.length
  if (fase.value === F.consolidada) contar()
  agendar(FASES[fase.value]!.ms)
}

function alternar() {
  pausado.value = !pausado.value
  if (pausado.value) limpar()
  else agendar(FASES[fase.value]!.ms)
}

/* Aba escondida não gasta relógio, e volta de onde parou. A pausa da pessoa
   manda: aba que volta não despausa quem pausou. */
function visibilidade() {
  if (document.hidden) limpar()
  else if (anima.value && !pausado.value && !timer) agendar(FASES[fase.value]!.ms)
}

onMounted(() => {
  // regra 11: animação disparada por JS checa reduced-motion à mão
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  anima.value = true
  // o card nasce no final (SSR) e fica parado um pouco antes de recomeçar
  agendar(2600)
  document.addEventListener('visibilitychange', visibilidade)
})
onBeforeUnmount(() => {
  limpar()
  document.removeEventListener('visibilitychange', visibilidade)
})

/* Na SAÍDA o miolo continua no estado final e quem apaga é o card inteiro
   (.rbh0c--saindo). O miolo só volta ao começo na fase seguinte, com o card
   ainda apagado: sem isso, botão, pílula e barra trocavam à vista, com dois
   textos sobrepostos por meio segundo (visto em quadro a quadro). */
const saindo = computed(() => fase.value === F.saida)
const noClique = computed(() => fase.value === F.clique)
const linkEnviado = computed(() => fase.value >= F.link)
const cursorVisivel = computed(() => fase.value === F.mira || fase.value === F.clique)
/** O banco i aparece na fase banco(i+1) e ganha o check na seguinte. */
const bancoVisivel = (i: number) => fase.value >= F.banco1 + i
const bancoOk = (i: number) => fase.value >= F.banco1 + i + 1
const consolidada = computed(() => fase.value >= F.consolidada)
const estado = computed(() => {
  if (consolidada.value) return 'consolidada'
  if (linkEnviado.value) return 'conectando'
  return 'convite'
})
</script>

<template>
  <section id="gargalo" class="rbh0">
    <div class="rbh0__cols">
      <div class="rbh0__left">
        <!-- quebra manual no desktop (a medida do título é composição); no
             celular ela some e o text-wrap: balance do base.css equilibra.
             ⚠️ O espaço ANTES de cada <br> é o que separa as palavras quando o
             <br> some: o Vue apaga o espaço entre <br> e <span> que tem quebra
             de linha, e o celular mostrava "clientecom". -->
        <h1 class="rbh0__title">
          Consolide a carteira <br class="rbh0__br">
          do seu cliente <br class="rbh0__br">
          <span class="rbh0__destaque">com 1 clique.</span>
        </h1>
        <p class="rbh0__dek">
          O cliente autoriza pelo Open Finance e as posições dos bancos dele
          chegam juntas, no Claude ou no ChatGPT da sua mesa.
        </p>
        <div class="rbh0__acao">
          <a href="#contato" class="rbh0__cta">Agendar 1 hora com a gente</a>
          <span class="rbh0__status">Conexão habilitada escritório a escritório, na implantação.</span>
        </div>
      </div>

      <div class="rbh0__right">
        <!-- A foto é fundo, não assunto (alt=""): o card na frente carrega a
             informação. `lounge` não tem rosto legível. -->
        <div class="rbh0__fotos" aria-hidden="true">
          <img
            src="/business-hero/lounge.webp" alt="" class="rbh0__foto"
            width="620" height="620" decoding="async" loading="eager" fetchpriority="high"
          >
          <span class="rbh0__scrim" />
        </div>

        <!-- O card é uma imagem para o leitor de tela (role="img" com a
             história inteira no rótulo); o que se mexe dentro dele é aria-hidden. -->
        <div class="rbh0c" :class="{ 'rbh0c--saindo': saindo }" role="img" :aria-label="DESCRICAO">
          <div class="rbh0c__dentro" aria-hidden="true">
            <div class="rbh0c__topo">
              <span class="rbh0c__label">Clientes do escritório</span>
              <span class="rbh0c__estado">
                <span class="rbh0c__pilula" :class="{ 'rbh0c__pilula--on': estado === 'convite' }">Novo convite</span>
                <span class="rbh0c__pilula" :class="{ 'rbh0c__pilula--on': estado === 'conectando' }">Conectando</span>
                <span class="rbh0c__pilula rbh0c__pilula--ok" :class="{ 'rbh0c__pilula--on': estado === 'consolidada' }">Consolidada</span>
              </span>
            </div>

            <div class="rbh0c__cliente">
              <span class="rbh0c__avatar">MR</span>
              <span class="rbh0c__nome">Mariana Ribeiro Costa</span>
            </div>

            <!-- o "1 clique": o botão de verdade da tela de Clientes -->
            <div class="rbh0c__botao-area">
              <span class="rbh0c__botao" :class="{ 'rbh0c__botao--clique': noClique, 'rbh0c__botao--enviado': linkEnviado }">
                <span class="rbh0c__botao-txt rbh0c__botao-txt--a">Criar e gerar link</span>
                <span class="rbh0c__botao-txt rbh0c__botao-txt--b">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                  Link enviado
                </span>
              </span>
              <svg
                class="rbh0c__cursor" :class="{ 'rbh0c__cursor--on': cursorVisivel, 'rbh0c__cursor--clique': noClique }"
                width="22" height="22" viewBox="0 0 24 24"
              >
                <path d="M5 3l14 7.5-6.2 1.6L10 18.5z" fill="var(--nu-ink)" stroke="var(--nu-white)" stroke-width="1.6" stroke-linejoin="round" />
              </svg>
            </div>

            <ul class="rbh0c__bancos">
              <li
                v-for="(b, i) in BANCOS" :key="b.sigla"
                class="rbh0c__banco" :class="{ 'rbh0c__banco--on': bancoVisivel(i), 'rbh0c__banco--ok': bancoOk(i) }"
              >
                <span class="rbh0c__fantasma" />
                <span class="rbh0c__sigla">{{ b.sigla }}</span>
                <span class="rbh0c__banco-nome">{{ b.nome }}</span>
                <span class="rbh0c__banco-pos">{{ b.posicoes }} posições</span>
                <span class="rbh0c__marca">
                  <span class="rbh0c__gira" />
                  <svg class="rbh0c__check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                </span>
              </li>
            </ul>

            <div class="rbh0c__total" :class="{ 'rbh0c__total--on': consolidada }">
              <div class="rbh0c__total-topo">
                <span class="rbh0c__total-titulo">Carteira consolidada</span>
                <span class="rbh0c__total-n"><strong>{{ posicoes }}</strong> posições</span>
              </div>
              <div class="rbh0c__barra">
                <span
                  v-for="(c, i) in CLASSES" :key="c.nome" class="rbh0c__seg"
                  :style="{ flexBasis: `${c.pct}%`, background: c.cor, transitionDelay: consolidada ? `${120 + i * 110}ms` : '0ms' }"
                />
              </div>
              <ul class="rbh0c__legenda">
                <li v-for="c in CLASSES" :key="c.nome">
                  <span class="rbh0c__ponto" :style="{ background: c.cor }" />{{ c.nome }} <strong>{{ c.pct }}%</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Controle real (SC 2.2.2): só existe quando a animação roda. -->
        <button
          v-if="anima" type="button" class="rbh0__pausa"
          :aria-label="pausado ? 'Continuar a animação' : 'Pausar a animação'" @click="alternar"
        >
          <svg v-if="pausado" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" /></svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5.5" y="4.5" width="4.5" height="15" rx="1" /><rect x="14" y="4.5" width="4.5" height="15" rx="1" /></svg>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rbh0 {
  scroll-margin-top: calc(var(--nuh-h, 76px) + 24px);
  background: var(--nu-cream);
  padding: clamp(56px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
}
.rbh0__cols {
  display: flex; gap: clamp(32px, 5vw, 76px);
  align-items: stretch; flex-wrap: wrap;
}
/* Base 560px, não 490: é a largura mínima que o título pede no seu tamanho
   máximo. Com base menor as duas colunas se formavam cedo demais. */
.rbh0__left {
  flex: 1.35 1 560px; min-width: min(300px, 100%);
  display: flex; flex-direction: column; justify-content: center;
}
/* A proporção 1.35/1 FICA, e ela dá uma coluna escura de ~35%, não metade. É
   deliberado: 50/50 com card branco flutuando em cima é a silhueta da Decade
   com a foto trocada por preenchimento, e o que separa adaptação de pastiche
   aqui é justamente a assimetria. Não "conserte" para 1/1. */
.rbh0__right {
  flex: 1 1 340px; min-width: min(300px, 100%);
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  /* Assimétrico de propósito: a borda DIREITA encara a viewport e paga o gutter
     canônico inteiro; a ESQUERDA encara a coluna de texto, que já traz o gap do
     flex. */
  padding: clamp(32px, 4vw, 56px) clamp(22px, 5.5vw, 80px) clamp(32px, 4vw, 56px) clamp(24px, 3vw, 44px);
  /* navy é o que se vê enquanto a foto carrega, e o que sobra se a rede falhar */
  background: var(--nu-navy);
  position: relative; isolation: isolate; overflow: clip;
}

/* ——— a foto ——— */
.rbh0__fotos { position: absolute; inset: 0; z-index: -1; }
.rbh0__foto {
  position: absolute; inset: 0;
  width: 100%; height: 100%; object-fit: cover; object-position: center;
}
/* O scrim existe para o card branco não disputar com a foto, e ele é navy e não
   preto: a banda continua sendo "o outro lado" da página mesmo com imagem em
   cima. Mais denso à direita, onde o card assenta. */
.rbh0__scrim {
  position: absolute; inset: 0;
  background: linear-gradient(105deg, rgba(12, 21, 36, .16) 0%, rgba(12, 21, 36, .34) 55%, rgba(12, 21, 36, .48) 100%);
}
/* FULL-BLEED GOVERNA A TINTA, O GUTTER GOVERNA O TEXTO. O painel sangra até a
   borda, e o conteúdo dentro dele mantém o mesmo gutter canônico.

   ⚠️ 1072px NÃO é escolha, é o ponto de quebra do flex, e os DOIS lados desta
   media query precisam cair nele: se um deles errar, o painel ganha margem
   negativa enquanto ainda está lado a lado e invade a coluna de texto (medido:
   5px de sobreposição quando isto esteve em 1080).

   A quebra é decidida pelo FLEX-BASIS, não pelo tamanho encolhido: com
   flex-wrap, os itens são distribuídos em linhas pelo tamanho hipotético e só
   depois encolhem dentro da linha. Então flex-shrink NÃO adia a quebra.
     560 + 340 + gap > vw - 2*gutter
     gap = clamp(32px,5vw,76px), gutter = clamp(22px,5.5vw,80px)
     900 + 0,05vw > 0,89vw  →  vw < 1071,4
   Se mexer em qualquer uma das quatro constantes, refaça a conta e reteste. */
@media (min-width: 1072px) {
  .rbh0__right {
    margin-right: calc(-1 * clamp(22px, 5.5vw, 80px));
    margin-block: calc(-1 * clamp(56px, 8vw, 104px));
  }
  /* UMA TELA, COMO A DECADE: lado a lado, o hero ocupa a dobra inteira e o
     Venn começa na rolagem. O teto de 860px segura monitor alto. */
  .rbh0 {
    min-height: min(calc(100svh - var(--nuh-h, 76px)), 860px);
    display: flex; flex-direction: column;
  }
  .rbh0__cols { flex: 1; }
}
/* Abaixo do ponto de quebra o painel é banda horizontal e sangra dos dois lados. */
@media (max-width: 1071.98px) {
  .rbh0__right { margin-inline: calc(-1 * clamp(22px, 5.5vw, 80px)); }
}

/* ——— a coluna de texto ———
   Entrada em cascata no carregamento: título, frase e ação sobem um depois do
   outro. É CSS puro (sem JS), curto (.6s) e o reduced-motion do base.css o
   zera. */
.rbh0__title, .rbh0__dek, .rbh0__acao { animation: rbh0-sobe .6s cubic-bezier(.22, .8, .24, 1) both; }
.rbh0__dek { animation-delay: .12s; }
.rbh0__acao { animation-delay: .22s; }
@keyframes rbh0-sobe {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}

.rbh0__title {
  margin: 0; color: var(--nu-ink);
  font-size: var(--nu-fs-h2); font-weight: 800;
  letter-spacing: -0.045em; line-height: 1.05;
}
/* "com 1 clique." em azul: é a promessa, e texto grande (800, ≥38px) passa o
   piso de 3:1 com folga sobre o creme. */
.rbh0__destaque { color: var(--nu-blue-text); white-space: nowrap; }
.rbh0__dek {
  margin: 26px 0 0; max-width: 50ch; color: var(--nu-gray);
  font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.6;
}
/* A linha de ação é a da Decade: o botão e, ao lado, a condição ("30-day
   trial period after invitation" lá; o estado da conexão aqui, que é a frase
   do CV-19 e não sai enquanto a conexão for ligada conta a conta). */
.rbh0__acao { display: flex; align-items: center; flex-wrap: wrap; gap: 14px 20px; margin: 32px 0 0; }
.rbh0__status { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.45; text-wrap: balance; }
/* O único botão sólido da primeira dobra, azul como todo CTA principal da
   página. ⚠️ Branco sobre --nu-blue: se for corrigir contraste, corrija no
   token (tokens.css), não aqui. O CTA do header aponta para o mesmo #contato
   e continua de contorno. */
.rbh0__cta {
  display: inline-flex; align-items: center;
  background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 16px 26px; min-height: 44px;
  font-size: var(--nu-fs-md); font-weight: 800; transition: background .2s;
}
.rbh0__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.rbh0__cta:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }

/* ——— o card animado ———
   Tudo existe no DOM desde o início e as fases só mexem em opacidade e
   transform (lição 2): a altura do card nunca muda. */
.rbh0c {
  width: 100%; max-width: 380px;
  background: var(--nu-white); border: 1px solid var(--nu-cream-line);
  border-radius: 16px; padding: clamp(20px, 2.4vw, 26px);
  box-shadow: 0 18px 50px rgba(12, 21, 36, .28);
  animation: rbh0-sobe .7s cubic-bezier(.22, .8, .24, 1) .18s both;
}
/* Apaga rápido e reacende com atraso: o atraso cobre as transições do miolo
   voltando ao começo (a mais longa é a da barra, .55s). */
.rbh0c__dentro { transition: opacity .3s ease .5s; }
.rbh0c--saindo .rbh0c__dentro { opacity: 0; transition-delay: 0s; }
.rbh0c__topo { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.rbh0c__label {
  color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700;
  text-transform: uppercase; letter-spacing: 1.2px;
}
/* As três pílulas de estado dividem a mesma célula e trocam por opacidade. */
.rbh0c__estado { display: grid; justify-items: end; }
.rbh0c__pilula {
  grid-area: 1 / 1; padding: 3px 9px; border-radius: var(--nu-r-pill);
  background: var(--nu-cream); color: var(--nu-gray-2);
  font-size: var(--nu-fs-xs); font-weight: 700; white-space: nowrap;
  opacity: 0; transition: opacity .3s ease;
}
.rbh0c__pilula--ok { background: var(--nu-green-bg); color: var(--nu-green-text); }
.rbh0c__pilula--on { opacity: 1; }

.rbh0c__cliente { display: flex; align-items: center; gap: 10px; margin-top: 14px; }
.rbh0c__avatar {
  flex: none; width: 32px; height: 32px; border-radius: 50%;
  display: grid; place-items: center; background: var(--nu-navy); color: var(--nu-cream-text);
  font-size: var(--nu-fs-xs); font-weight: 800; letter-spacing: .4px;
}
.rbh0c__nome { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; letter-spacing: -0.01em; }

/* O botão é desenho, não controle: é a tela de Clientes, encolhida. */
.rbh0c__botao-area { position: relative; margin-top: 16px; }
.rbh0c__botao {
  display: grid; place-items: center; height: 40px; border-radius: 10px;
  background: var(--nu-ink); color: var(--nu-white);
  font-size: var(--nu-fs-sm); font-weight: 800;
  transition: transform .14s ease, background .3s ease;
}
.rbh0c__botao--clique { transform: scale(.96); background: var(--nu-ink-75); }
.rbh0c__botao--enviado { background: var(--nu-green-bg); color: var(--nu-green-text); }
.rbh0c__botao-txt {
  grid-area: 1 / 1; display: inline-flex; align-items: center; gap: 6px;
  transition: opacity .25s ease, transform .25s ease;
}
.rbh0c__botao-txt--b { opacity: 0; transform: translateY(6px); }
.rbh0c__botao--enviado .rbh0c__botao-txt--a { opacity: 0; transform: translateY(-6px); }
.rbh0c__botao--enviado .rbh0c__botao-txt--b { opacity: 1; transform: none; }

/* O cursor sai de baixo à direita e para no meio do botão. */
.rbh0c__cursor {
  position: absolute; left: 68%; top: 18px; pointer-events: none;
  opacity: 0; transform: translate(70px, 60px);
  transition: opacity .3s ease, transform .6s cubic-bezier(.22, .8, .24, 1);
  filter: drop-shadow(0 2px 3px rgba(12, 21, 36, .35));
}
.rbh0c__cursor--on { opacity: 1; transform: none; }
.rbh0c__cursor--clique { transform: scale(.82); transition-duration: .3s, .12s; }

/* Os bancos entram um por um; o anel gira enquanto conecta e vira check.
   A LINHA existe desde o começo, com um esqueleto no lugar: antes do clique o
   card mostra a tela esperando o cliente, não um vão branco. */
.rbh0c__bancos { margin: 16px 0 0; padding: 0; list-style: none; }
.rbh0c__banco {
  position: relative;
  display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: 10px;
  padding: 9px 0; border-top: 1px solid var(--nu-cream-line);
}
.rbh0c__banco > :not(.rbh0c__fantasma) {
  opacity: 0; transform: translateY(6px);
  transition: opacity .35s ease, transform .35s cubic-bezier(.22, .8, .24, 1);
}
.rbh0c__banco--on > :not(.rbh0c__fantasma) { opacity: 1; transform: none; }
.rbh0c__fantasma {
  position: absolute; left: 0; top: 50%; width: 62%; height: 10px; margin-top: -5px;
  border-radius: 5px; background: var(--nu-cream); transition: opacity .3s ease;
}
.rbh0c__banco--on .rbh0c__fantasma { opacity: 0; }
.rbh0c__sigla {
  width: 28px; height: 28px; border-radius: 8px; display: grid; place-items: center;
  background: var(--nu-cream); color: var(--nu-ink); font-size: var(--nu-fs-xs); font-weight: 800;
}
.rbh0c__banco-nome { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; min-width: 0; }
.rbh0c__banco-pos { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; white-space: nowrap; }
.rbh0c__marca { width: 18px; height: 18px; display: grid; place-items: center; }
.rbh0c__gira, .rbh0c__check { grid-area: 1 / 1; transition: opacity .2s ease; }
.rbh0c__gira {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid var(--nu-ink-14); border-top-color: var(--nu-blue);
  animation: rbh0-gira .8s linear infinite;
}
.rbh0c__check { opacity: 0; color: var(--nu-green); }
.rbh0c__banco--ok .rbh0c__gira { opacity: 0; animation: none; }
.rbh0c__banco--ok .rbh0c__check { opacity: 1; }
@keyframes rbh0-gira { to { transform: rotate(360deg); } }

/* A carteira consolidada: a barra cresce da esquerda, segmento a segmento. */
.rbh0c__total { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--nu-cream-line); }
/* O título fica; a contagem e a legenda chegam junto com a barra. */
.rbh0c__total-n, .rbh0c__legenda { opacity: 0; transition: opacity .4s ease; }
.rbh0c__total--on .rbh0c__total-n, .rbh0c__total--on .rbh0c__legenda { opacity: 1; }
.rbh0c__total-topo { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.rbh0c__total-titulo { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 800; }
.rbh0c__total-n { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; font-variant-numeric: tabular-nums; }
.rbh0c__total-n strong { color: var(--nu-ink); font-weight: 800; }
.rbh0c__barra { display: flex; gap: 3px; height: 10px; margin-top: 10px; border-radius: 3px; background: var(--nu-cream); }
.rbh0c__seg {
  border-radius: 3px; transform: scaleX(0); transform-origin: left center;
  transition: transform .55s cubic-bezier(.22, .8, .24, 1);
}
.rbh0c__total--on .rbh0c__seg { transform: none; }
.rbh0c__legenda {
  margin: 10px 0 0; padding: 0; list-style: none;
  display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px;
  color: var(--nu-gray-2); font-size: var(--nu-fs-xs); font-weight: 500;
}
.rbh0c__legenda li { display: flex; align-items: center; gap: 6px; }
.rbh0c__legenda strong { margin-left: auto; color: var(--nu-ink); font-weight: 700; font-variant-numeric: tabular-nums; }
.rbh0c__ponto { width: 8px; height: 8px; border-radius: 2px; flex: none; }

/* ——— pausar ——— */
.rbh0__pausa {
  margin-top: 16px; width: 44px; height: 44px; border-radius: 50%;
  display: grid; place-items: center; cursor: pointer;
  border: 1px solid var(--nu-cream-text-35); background: rgba(12, 21, 36, .35);
  color: var(--nu-cream-text); transition: background .2s, border-color .2s;
}
.rbh0__pausa:hover { background: rgba(12, 21, 36, .6); border-color: var(--nu-cream-text-70); }
.rbh0__pausa:active { transform: translateY(1px); }
.rbh0__pausa:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }

@media (max-width: 760px) {
  .rbh0__cols { gap: 34px; }
  .rbh0__cta { width: 100%; justify-content: center; }
  .rbh0__acao { flex-direction: column; align-items: stretch; gap: 12px; }
  .rbh0__status { max-width: none; text-align: center; }
  /* A quebra manual do título é do desktop; no celular o balance equilibra. */
  .rbh0__br { display: none; }
}
</style>
