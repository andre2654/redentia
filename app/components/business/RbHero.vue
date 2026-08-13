<script setup lang="ts">
/**
 * Hero da Redentia for Business.
 *
 * ESTRUTURA (direção do dono 2026-08-13, olhando a Decade): split de duas
 * metades. A esquerda é TEXTO SIMPLES, no formato da Decade — manchete, uma
 * frase, um botão, e nada mais. A direita é um PAINEL QUE CICLA: o fundo e o
 * card mudam juntos, um par por vez.
 *
 * ⚠️ O FUNDO É COR POR ENQUANTO, E ISSO É PROVISÓRIO. O dono vai fornecer as
 * imagens. Quando elas chegarem, cada slide troca `bg` por uma imagem e o card
 * continua exatamente como está: ele já é branco opaco, que é o que sobrevive
 * a fundo claro e a fundo escuro sem virar vidro ilegível.
 *
 * O QUE SAIU DA ESQUERDA, e é o pedido de "mais simples": o eyebrow "O gargalo"
 * e a nota de procedência solta embaixo do botão. A procedência NÃO sumiu, ela
 * foi para dentro do card que carrega o número (regra de voz da casa: nota de
 * frescor e procedência sempre visível, colada no dado que ela qualifica).
 *
 * TRÊS LIÇÕES HERDADAS DO RbAssistente, que já pagou por elas:
 *  1. REPOUSO = ESTADO FINAL. O primeiro slide está no markup que o SSR serve.
 *     Sem JS, aba em segundo plano ou reduced-motion, o painel já conta a
 *     história inteira. O filme não monta ao tocar, ele só avança.
 *  2. ANIMAÇÃO NÃO MUDA ALTURA. Os três cards ocupam a MESMA célula de grid
 *     (grid-area: 1/1), então a altura do painel é a do maior card e nunca
 *     oscila durante a troca. Quem sai sai por opacidade.
 *  3. reduced-motion é checado À MÃO, porque o timer é JS e o @media global do
 *     base.css só congela CSS.
 *
 * E UMA QUE O PAINEL DE REVISÃO COBROU DO RbAssistente E AQUI JÁ NASCE FEITA:
 * o autoplay tem CONTROLE. Os três indicadores são botões de verdade, e tocar
 * em qualquer um PARA a rotação para sempre. Sem isso, é conteúdo em movimento
 * acima de cinco segundos sem mecanismo de parar, que é falha de SC 2.2.2
 * Nível A, e prefers-reduced-motion não satisfaz esse critério (ele exige
 * controle no conteúdo, para quem não configurou preferência de sistema).
 */

/**
 * ⚠️ NADA AQUI É NÚMERO DE CLIENTE. Os três cards são conceituais: descrevem o
 * que o trabalho FAZ, não resultado que alguém obteve. É deliberado, e a razão
 * está registrada na revisão de 2026-08-13: um número de patrimônio inventado
 * obrigaria uma legenda "valores fictícios" dentro da primeira dobra, e aviso
 * de ficção acima da dobra é PERDA de credibilidade, não ganho — é a página
 * avisando, no primeiro segundo, que o que você está vendo não aconteceu.
 * Se um cliente autorizar print de tela real um dia, ESTES cards saem.
 */
const DIAS_TOTAL = 15
const DIAS_FECHAMENTO = 5

/* CADA CARD É UM NÚMERO SÓ, e os três juntos são o funil inteiro: o que você
   ganha, o que você paga, o que você faz agora. Essa é a razão de eles serem
   pequenos (direção do dono 2026-08-13, "cards BEM menores e mais diretos e
   mais importantes para CTA"): card que explica compete com a coluna de texto;
   card que afirma um número empurra para o botão.
   Anatomia, na ordem: rótulo pequeno, NÚMERO grande, uma linha de qualificação.
   É a mesma anatomia dos cards da Decade, e é o único gesto dela que atravessa
   o nosso sistema sem foto, sem serifa e sem inventar dado. */
/* A RÉGUA É A MESMA GRAMÁTICA NOS TRÊS, e os traços acesos são LITERALMENTE o
   número do card: 10 de 15 dias, 5 de 5 chaves, 1 de 8 horas. Não é enfeite e
   não é gráfico de dado inventado — é o próprio número desenhado. Se o número
   mudar, `on` muda junto, senão a régua mente em silêncio. */
/* A FOTO É FUNDO, NÃO ASSUNTO, e por isso ela não tem alt: quem enxerga vê um
   escritório em preto e branco, quem escuta não perde nada, porque o card na
   frente carrega a informação inteira. alt="" é o certo aqui, e é o mesmo que o
   RbAssistente já faz com o logo do Claude.
   Escolha das três: `lounge` não tem rosto legível, `anotando` mostra mãos, e
   em `sala-vidro` a grade da janela e a granulação cobrem os rostos. As outras
   duas de docs/redentia-business/hero-fontes/ (`mesa` e `reuniao`) têm gente
   reconhecível e ficam fora até alguém confirmar direito de imagem. */
const SLIDES = [
  {
    id: 'devolve', bg: 'var(--nu-navy)', foto: '/business-hero/lounge.webp',
    rotulo: 'O que volta pro escritório',
    valor: `${DIAS_TOTAL - DIAS_FECHAMENTO} dias`,
    sub: `por mês. O fechamento cai de ${DIAS_TOTAL} para ${DIAS_FECHAMENTO}.`,
    ticks: { total: DIAS_TOTAL, on: DIAS_TOTAL - DIAS_FECHAMENTO },
    legenda: 'dias úteis de um mês',
    nota: `Os ${DIAS_TOTAL} dias são o que ouvimos de dezenas de gestores e líderes de MFO em 2026. Os ${DIAS_FECHAMENTO} são a meta que medimos no seu fechamento, não promessa de resultado.`,
  },
  {
    id: 'preco', bg: 'var(--nu-orb-deep)', foto: '/business-hero/anotando.webp',
    rotulo: 'O plano',
    valor: 'R$ 2.500',
    sub: 'por mês, por escritório. Mensal, sem contrato anual.',
    ticks: { total: 5, on: 5 },
    legenda: 'chaves nomeadas, sem custo por assento',
    nota: 'Se o número não aparecer, você cancela no mês seguinte, não em dois anos.',
  },
  {
    id: 'setup', bg: 'var(--nu-navy-2)', foto: '/business-hero/sala-vidro.webp',
    rotulo: 'Para começar',
    valor: '1 hora',
    sub: 'Uma reunião técnica, não uma apresentação comercial.',
    ticks: { total: 8, on: 1 },
    legenda: 'de um dia de trabalho',
    nota: 'Sai dela o cronograma, ou a conclusão de que ainda não é hora.',
  },
] as const

/* A primeira foto é o LCP da página: antes de existir imagem aqui, o LCP era um
   nó de texto a 0 KB de rede. O preload no <head> tira a descoberta dela do fim
   do parse de CSS e JS, e é o que evita que trazer fotografia custe segundos.
   Só a PRIMEIRA: as outras duas são lazy e não disputam a dobra. */
useHead({
  link: [{ rel: 'preload', as: 'image', href: '/business-hero/lounge.webp', fetchpriority: 'high' }],
})

const atual = ref(0)
/* `anterior` existe só para o card que ACABOU de sair receber a animação de
   saída. Começa null de propósito: no primeiro render nenhum card sai, então a
   pilha nasce parada e o SSR serve o estado final, não o meio de um filme. */
const anterior = ref<number | null>(null)
let timer: ReturnType<typeof setInterval> | null = null

function parar() {
  if (timer) { clearInterval(timer); timer = null }
}

function vaiPara(i: number) {
  if (i === atual.value) return
  anterior.value = atual.value
  atual.value = i
}

/* Tocar num indicador não é só navegar: é assumir o controle. O autoplay morre
   e não volta, que é o comportamento que a pessoa espera de quem interveio, e é
   o que satisfaz a SC 2.2.2 (mecanismo de parar movimento acima de 5s). */
function ir(i: number) {
  parar()
  vaiPara(i)
}

onMounted(() => {
  // regra 11: animação disparada por JS checa reduced-motion à mão
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  timer = setInterval(() => vaiPara((atual.value + 1) % SLIDES.length), 5200)
})
onBeforeUnmount(parar)
</script>

<template>
  <section id="gargalo" class="rbh0">
    <div class="rbh0__cols">
      <div class="rbh0__left">
        <!-- quebra manual: a medida do título é decisão de composição, não do
             navegador (mesma razão do NuSectionHeading usar slot) -->
        <h1 class="rbh0__title">
          Entregamos os dados<br>
          que o seu escritório precisa.
        </h1>
        <p class="rbh0__dek">
          A infraestrutura de dados para escritórios que consolidam patrimônio
          de famílias. A Redentia captura, normaliza e concilia, e o mês volta
          fechado com rastro até a fonte.
        </p>
        <a href="#contato" class="rbh0__cta">Agendar o setup de 1 hora</a>
      </div>

      <div class="rbh0__right" :style="{ background: SLIDES[atual]!.bg }">
        <!-- As fotos vivem atrás de tudo e trocam junto com o card. São <img> e
             não background-image de propósito: só assim dá para pedir
             fetchpriority na primeira (que é candidata a LCP) e lazy nas outras.
             O precedente ruim da casa é NuCtaPhoto, que serve 1,2 MB por
             background inline, sem srcset, sem loading e sem fetchpriority. -->
        <div class="rbh0__fotos" aria-hidden="true">
          <img
            v-for="(s, i) in SLIDES" :key="s.id" :src="s.foto" alt=""
            class="rbh0__foto" :class="{ 'rbh0__foto--on': i === atual }"
            width="620" height="620" decoding="async"
            :loading="i === 0 ? 'eager' : 'lazy'"
            :fetchpriority="i === 0 ? 'high' : 'low'"
          >
          <span class="rbh0__scrim" />
        </div>

        <div class="rbh0__stack">
          <!-- Os três ocupam a mesma célula: a altura é a do maior e não oscila.
               `inert` tira do teclado e do leitor de tela o que está invisível. -->
          <div
            v-for="(s, i) in SLIDES" :key="s.id"
            class="rbh0__card"
            :class="{ 'rbh0__card--on': i === atual, 'rbh0__card--saiu': i === anterior && i !== atual }"
            :inert="i !== atual"
          >
            <span class="rbh0__card-label">{{ s.rotulo }}</span>
            <p class="rbh0__valor">{{ s.valor }}</p>
            <p class="rbh0__sub">{{ s.sub }}</p>

            <!-- A régua é decorativa: o valor acima e a legenda abaixo já
                 carregam a mesma informação em texto de verdade. -->
            <div class="rbh0__regua" aria-hidden="true">
              <span
                v-for="d in s.ticks.total" :key="d"
                class="rbh0__tick" :class="{ 'rbh0__tick--on': d <= s.ticks.on }"
              />
            </div>
            <p class="rbh0__regua-leg">
              <strong>{{ s.ticks.on }}</strong> de {{ s.ticks.total }} {{ s.legenda }}
            </p>

            <p class="rbh0__nota">{{ s.nota }}</p>
          </div>
        </div>

        <!-- Controle real, não enfeite: tocar em qualquer um encerra a rotação. -->
        <div class="rbh0__nav" role="group" aria-label="Escolher o que o painel mostra">
          <button
            v-for="(s, i) in SLIDES" :key="s.id"
            type="button" class="rbh0__dot" :class="{ 'rbh0__dot--on': i === atual }"
            :aria-pressed="i === atual" @click="ir(i)"
          >
            <span class="rbh0__dot-hit" aria-hidden="true" />
            <span class="rbh0__sr">{{ s.rotulo }}</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rbh0 {
  scroll-margin-top: calc(var(--nuh-h, 76px) + 24px);
  background: var(--nu-cream);
  padding: clamp(56px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.rbh0__cols {
  display: flex; gap: clamp(32px, 5vw, 76px);
  align-items: stretch; flex-wrap: wrap;
}
/* Base 560px, não 490: é a largura mínima que o título pede no seu tamanho
   máximo. Com base menor as duas colunas se formavam cedo demais e o título
   voltava a quebrar em 4 linhas por volta de 1000px de viewport. */
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
  display: flex; flex-direction: column; justify-content: center;
  /* Assimétrico de propósito: a borda DIREITA encara a viewport e paga o gutter
     canônico inteiro; a ESQUERDA encara a coluna de texto, que já traz o gap do
     flex, então pagar o gutter de novo ali roubava 32px do card sem separar nada. */
  padding: clamp(32px, 4vw, 56px) clamp(22px, 5.5vw, 80px) clamp(32px, 4vw, 56px) clamp(24px, 3vw, 44px);
  /* A cor continua trocando junto com o card e NÃO é redundante com a foto: ela
     é o que se vê enquanto a imagem carrega, e é o que sobra se a rede falhar.
     Cada slide tem a cor mais próxima da sua foto, então a troca não pisca. */
  transition: background .55s ease;
  position: relative; isolation: isolate; overflow: clip;
}

/* ——— as fotos ——— */
.rbh0__fotos { position: absolute; inset: 0; z-index: -1; }
.rbh0__foto {
  position: absolute; inset: 0;
  width: 100%; height: 100%; object-fit: cover; object-position: center;
  opacity: 0; transition: opacity .55s ease;
}
.rbh0__foto--on { opacity: 1; }
/* O scrim existe para o card branco não disputar com a foto, e ele é navy e não
   preto: a banda continua sendo "o outro lado" da página mesmo com imagem em
   cima. Mais denso à direita, onde o card assenta. */
.rbh0__scrim {
  position: absolute; inset: 0;
  background: linear-gradient(105deg, rgba(12, 21, 36, .12) 0%, rgba(12, 21, 36, .30) 55%, rgba(12, 21, 36, .44) 100%);
}
/* FULL-BLEED GOVERNA A TINTA, O GUTTER GOVERNA O TEXTO. A regra 3 do design
   system ("gutter sempre") protege a LEITURA, não a pintura: o painel sangra
   até a borda, e o conteúdo dentro dele mantém o mesmo gutter canônico.

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
   Conferido no browser: 1076 e 1071 lado a lado, 900 quebrado.
   Se mexer em qualquer uma das quatro constantes, refaça a conta e reteste. */
@media (min-width: 1072px) {
  .rbh0__right {
    margin-right: calc(-1 * clamp(22px, 5.5vw, 80px));
    margin-block: calc(-1 * clamp(56px, 8vw, 104px));
  }
}
/* Abaixo do ponto de quebra o painel é banda horizontal e sangra dos dois lados. */
@media (max-width: 1071.98px) {
  .rbh0__right { margin-inline: calc(-1 * clamp(22px, 5.5vw, 80px)); }
}

/* Medido no browser a 320px (piso da SC 1.4.10, e o que 400% de zoom num monitor
   de 1280 produz): a linha mais longa cabe na coluna e a quebra manual de 2
   linhas se mantém. Não baixe o mínimo "por segurança". */
.rbh0__title {
  margin: 0; color: var(--nu-ink);
  font-size: clamp(30px, 7.4vw, 54px); font-weight: 800;
  letter-spacing: -0.045em; line-height: 1.05;
}
.rbh0__dek {
  margin: 26px 0 0; max-width: 52ch; color: var(--nu-gray);
  font-size: clamp(16px, 1.7vw, 19px); font-weight: 600; line-height: 1.6;
}
/* O ÚNICO BOTÃO SÓLIDO DA PRIMEIRA DOBRA, e ele é quase preto.
   1. Branco sobre --nu-blue dá 4,4988:1 e REPROVA AA a 16,5px/800 (o limiar de
      bold large text é 18,667px). Sobre --nu-ink dá 19,78:1.
   2. O CTA do header aponta para o MESMO #contato. Dois botões chapados para o
      mesmo destino é indecisão, não reforço: o do header virou contorno.
   Raio 12px e não 999px: o PLANO §6.1 já mandava "raio de documento 16/12/10/6/3"
   desde o início, e o botão da Decade, medido no screenshot, não é pílula. */
.rbh0__cta {
  align-self: flex-start;
  display: inline-flex; align-items: center; margin: 32px 0 0;
  background: var(--nu-ink); color: var(--nu-white);
  border-radius: 12px; padding: 16px 28px; min-height: 44px;
  font-size: 16.5px; font-weight: 800; transition: background .2s;
}
.rbh0__cta:hover { background: var(--nu-ink-hover); color: var(--nu-white); }
.rbh0__cta:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }

/* ——— o painel que cicla ——— */
/* Os três cards na MESMA célula: a altura é a do maior e nunca oscila.
   O teto de 460px é para a banda quebrada: sem ele o card esticava para 824px a
   900 de viewport e o calendário de 340px nadava dentro dele. */
.rbh0__stack { display: grid; width: 100%; max-width: 460px; margin-inline: auto; }
.rbh0__card {
  grid-area: 1 / 1;
  background: var(--nu-white); border: 1px solid var(--nu-cream-line);
  border-radius: 16px; padding: clamp(24px, 3vw, 34px);
  display: flex; flex-direction: column;
  opacity: 0; visibility: hidden;
}
/* DESLIZE, NÃO CROSSFADE. Com fade puro na mesma duração os dois cards ficam a
   ~50% de opacidade no meio da troca e os DOIS textos aparecem sobrepostos,
   ilegíveis (visto em screenshot). Deslizando em direções opostas eles se
   AFASTAM, então o momento de sobreposição lê como movimento e não como mancha.
   O de fora sai mais rápido do que o de dentro entra: quem chega manda. */
.rbh0__card--on {
  opacity: 1; visibility: visible;
  animation: rbh0-entra .46s cubic-bezier(.22, .8, .24, 1) .24s both;
}
.rbh0__card--saiu {
  visibility: visible;
  animation: rbh0-sai .28s cubic-bezier(.4, 0, 1, 1) both;
}
/* Aqui animar opacity NO KEYFRAME é seguro porque não existe transition nestas
   propriedades. Se alguém acrescentar uma, leia a lição nº2 do RbAssistente
   antes: com fill-mode both, o keyframe vira dono da propriedade e mata a
   transition em silêncio. */
/* Os tempos são passagem de bastão, e a conta está aqui para ninguém "suavizar"
   igualando as durações depois: o de fora leva .28s e o de dentro só começa em
   .24s, então a janela em que os dois aparecem é de .04s. Com durações iguais e
   sem delay a sobreposição vai a ~.25s, os dois textos ficam a meia opacidade
   um por cima do outro e o resultado lê como borrão, não como slide. Verificado
   em screenshot nas duas versões. */
@keyframes rbh0-entra {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: none; }
}
@keyframes rbh0-sai {
  from { opacity: 1; transform: none; }
  to { opacity: 0; transform: translateX(-40px); }
}

.rbh0__card-label {
  display: block; color: var(--nu-gray); font-size: 11.5px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 1.4px;
}

/* o número é a peça: tabular porque é número, e o app inteiro trata número assim */
.rbh0__valor {
  margin: 10px 0 0; color: var(--nu-ink);
  font-size: clamp(38px, 3.6vw, 46px); font-weight: 800;
  letter-spacing: -0.04em; line-height: 1; font-variant-numeric: tabular-nums;
}
.rbh0__sub {
  margin: 10px 0 0; color: var(--nu-gray-2);
  font-size: 14.5px; font-weight: 600; line-height: 1.5;
}

/* A régua: os traços acesos são o número do card, desenhado. blue-deep e não
   blue porque a rodada 1 da landing já tinha decidido #2456C9 por medição e o
   código no ar nunca obedeceu. Os apagados usam --nu-ink-45 (3,15:1 sobre
   branco) e não --nu-cream-line (1,31:1), porque o traço apagado CARREGA
   informação (é o resto), não é moldura, então vale o piso de 3:1 da SC 1.4.11.
   `gap` em % e não em px: com 5, 8 e 15 traços na mesma largura, um gap fixo
   come 56px do card de 15 e 16px do card de 5, e as três réguas deixam de
   parecer a mesma peça. */
.rbh0__regua { margin-top: 20px; display: flex; gap: 1.4%; }
.rbh0__tick {
  flex: 1; height: 8px; border-radius: 2px;
  background: var(--nu-ink-14); transform-origin: left center;
}
.rbh0__tick--on { background: var(--nu-blue-deep); }
/* A régua se desenha da esquerda TODA VEZ que o card entra, e não uma vez no
   mount: por isso o seletor pende de --on, que é a classe que vai e volta.
   O delay de .12s deixa o card assentar antes de o número se desenhar. */
.rbh0__card--on .rbh0__tick {
  animation: rbh0-tick .55s cubic-bezier(.22, .8, .24, 1) .12s both;
}
@keyframes rbh0-tick { from { transform: scaleX(0); } to { transform: scaleX(1); } }

.rbh0__regua-leg {
  margin: 10px 0 0; color: var(--nu-gray);
  font-size: 12.5px; font-weight: 600; font-variant-numeric: tabular-nums;
}
.rbh0__regua-leg strong { color: var(--nu-ink); font-weight: 800; }

/* margin-top: auto ancora a nota no PÉ do card. Como os três dividem a mesma
   célula de grid, a altura é a do maior, e sem isso os menores sobrariam com um
   vão branco embaixo. Ancorando, os três ficam compostos de topo a base sem que
   nenhum mude de altura. */
.rbh0__nota {
  margin: 22px 0 0; margin-top: auto; padding-top: 18px;
  border-top: 1px solid var(--nu-cream-line);
  color: var(--nu-gray); font-size: 12.5px; font-weight: 600; line-height: 1.5;
}

/* ——— os indicadores, que são controle e não enfeite ——— */
/* Centrados sob o card e com a MESMA caixa dele (460px, margin-inline auto),
   para que o eixo dos passadores seja o eixo do card e não o do painel — os
   dois não coincidem, porque o painel tem padding assimétrico. */
.rbh0__nav {
  display: flex; justify-content: center; gap: 4px; margin-top: 20px;
  width: 100%; max-width: 460px; margin-inline: auto;
}
/* O botão é fino na tela e tem 44px de alvo: o traço é o filho pintado, e o
   `padding` do pai carrega a área tocável, que é o mesmo idioma que o resto da
   superfície usa (min-height: 44px aparece 9 vezes em app/). */
.rbh0__dot {
  appearance: none; background: none; border: 0; cursor: pointer;
  padding: 19px 0; width: 44px; min-height: 44px;
  display: flex; align-items: center;
}
.rbh0__dot-hit {
  display: block; width: 100%; height: 3px; border-radius: 2px;
  background: var(--nu-cream-text-35); transition: background .2s;
}
.rbh0__dot--on .rbh0__dot-hit { background: var(--nu-cream-text); }
.rbh0__dot:hover .rbh0__dot-hit { background: var(--nu-cream-text-70); }
.rbh0__dot:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }
/* texto só para leitor de tela: o traço não tem nome sem ele */
.rbh0__sr {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}

@media (max-width: 760px) {
  .rbh0__cols { gap: 34px; }
  .rbh0__cta { width: 100%; justify-content: center; }
  /* O card encolheu e a reordenação que existia aqui deixou de ser necessária:
     antes o calendário de 3 linhas empurrava a legenda para y=889 com a dobra em
     812, e a legenda precisava subir na frente. Agora rótulo, número e linha de
     qualificação cabem juntos acima da dobra, e a régua é decorativa. */
  .rbh0__nota { padding-top: 16px; }
}
</style>
