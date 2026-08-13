<script setup lang="ts">
/**
 * "A divisão do trabalho" — a seção logo abaixo do hero.
 *
 * SUBSTITUI O RbComoFunciona (direção do dono 2026-08-13, olhando a seção
 * pós-hero da Decade: "ela n faz sentido"). O diagnóstico aceito tem duas
 * partes:
 *
 *  1. O hero MUDOU. Ele dizia "Fechar o mês leva 15 dias. Deveria levar 5", e
 *     "Do arquivo ao mês fechado" era o mecanismo que resolvia aquilo. O hero
 *     novo já afirma a entrega, então a seção seguinte repetia "a gente faz o
 *     trabalho" em vez de avançar.
 *  2. A seção pós-hero da Decade NÃO É PROCESSO, É POSICIONAMENTO. Ela não
 *     explica como funciona, ela responde a um medo ("se eu usar IA, perco o
 *     humano?") e diz o que o produto é. A nossa pulava direto pro encanamento,
 *     explicando o COMO antes de o leitor saber o que ele mantém.
 *
 * O MEDO DO COMPRADOR DE MFO NÃO É HUMANO CONTRA IA. É "o que sobra pro meu
 * time?" e "eu continuo dono da relação com a família?". Esta seção responde
 * essas duas, e o mecanismo do Venn é o mesmo: duas coisas que se encontram.
 *
 * ⚠️ A TESE JÁ ESTAVA NA PÁGINA, NA FORMA ERRADA. O dek do RbComoFunciona dizia
 * "Três passos, e o escritório só participa do primeiro. Dali em diante o
 * trabalho é nosso". Isso é estrutura, não legenda. Esta seção promove aquela
 * frase a forma. Os três passos não se perderam: viraram a coluna da direita.
 *
 * ⚠️ RbComoFunciona.vue CONTINUA NO REPO E NÃO É MAIS USADO por página nenhuma.
 * Não apaguei porque este diretório NÃO é repositório git e a exclusão seria
 * irreversível. Se for apagar, confira antes que nada mais o importa.
 *
 * O QUE FICA MARCADO COMO FUTURO, e por quê: conciliação e rastro estão em
 * construção, e o FAQ já diz isso com todas as letras ("A trilha até a linha do
 * extrato é o que estamos construindo", "O fechamento que trava o mês ainda não
 * existe e é construído na implantação"). Marcar aqui é o enquadramento da casa
 * virando forma: a página vende construção conjunta, e numa venda dessas a lista
 * do que falta é a especificação, não a confissão. Se um dia existirem, tire a
 * etiqueta nos DOIS lugares, aqui e no faq.ts.
 */
const ESCRITORIO = [
  'A relação com a família',
  'O julgamento de alocação',
  'A decisão de investir, ou de não investir',
  'A palavra final sobre cada número',
]

const REDENTIA = [
  { t: 'Captura o arquivo do custodiante', futuro: false },
  { t: 'Normaliza cada linha em posição', futuro: false },
  { t: 'Concilia o que não bate', futuro: true },
  { t: 'Guarda o rastro até a origem', futuro: true },
]

/* id derivado, nunca literal: dois SVG com o mesmo id de pattern na mesma página
   fazem o segundo resolver no primeiro, e o app já pagou por isso (§14.18). */
const uid = useId()
const hachura = `rbdv-hachura-${uid}`
</script>

<template>
  <section id="divisao" class="rbdv">
    <div class="rbdv__head">
      <NuSectionHeading eyebrow="A divisão do trabalho">
        O escritório decide.<br>A Redentia carrega.
        <template #dek>
          O que o seu escritório faz de mais caro não é montar planilha. A
          Redentia assume o meio do caminho, e <strong>o que exige julgamento
          continua com quem tem o relacionamento</strong>.
        </template>
      </NuSectionHeading>
    </div>

    <div class="rbdv__quadro">
      <div class="rbdv__col">
        <h3 class="rbdv__col-titulo">O escritório</h3>
        <ul class="rbdv__lista">
          <li v-for="t in ESCRITORIO" :key="t" class="rbdv__item">{{ t }}</li>
        </ul>
      </div>

      <!-- 100% DECORATIVO (direção do dono 2026-08-13: tirar o texto do meio).
           O desenho não carrega informação nenhuma sozinho, e não precisa: o que
           os dois lados produzem juntos já está dito no título da seção. Por
           isso a coluna inteira é aria-hidden e some no empilhado, em vez de
           virar um bloco vazio com fio em cima. -->
      <div class="rbdv__meio" aria-hidden="true">
        <!-- GEOMETRIA MEDIDA, não estimada. A primeira tentativa tinha r=100 com
             centros a 60 de distância: a sobreposição comia 80% de cada círculo
             e o desenho lia como UM círculo hachurado, não como dois que se
             encontram. Com r=88 e centros a 72 a lente fica com 104 de largura,
             que é onde o texto cabe, e cada círculo mantém metade de si de fora.
             Os pontos de interseção saem de x=130 e y=120±sqrt(88²-36²)=±80,3. -->
        <svg class="rbdv__venn" viewBox="0 0 260 240" fill="none" aria-hidden="true">
          <defs>
            <pattern :id="hachura" width="4" height="4" patternUnits="userSpaceOnUse">
              <line x1="2" y1="0" x2="2" y2="4" stroke="var(--nu-blue-deep)" stroke-width="1.1" />
            </pattern>
          </defs>
          <circle cx="94" cy="120" r="88" stroke="var(--nu-cream-2)" stroke-width="1" />
          <circle cx="166" cy="120" r="88" stroke="var(--nu-cream-2)" stroke-width="1" />
          <path
            d="M130,39.7 A88,88 0 0,1 130,200.3 A88,88 0 0,1 130,39.7"
            :fill="`url(#${hachura})`" fill-opacity=".2"
            stroke="var(--nu-cream-2)" stroke-width="1"
          />
        </svg>
      </div>

      <div class="rbdv__col rbdv__col--dir">
        <h3 class="rbdv__col-titulo">A Redentia</h3>
        <ul class="rbdv__lista">
          <li v-for="r in REDENTIA" :key="r.t" class="rbdv__item">
            {{ r.t }}
            <span v-if="r.futuro" class="rbdv__tag">na implantação</span>
          </li>
        </ul>
      </div>
    </div>

    <p class="rbdv__rodape">
      Os dois últimos ainda não existem e são construídos com você, no seu
      próprio fechamento. A lista inteira do que falta está no
      <a href="#faq">FAQ desta página</a>.
    </p>

    <a href="#contato" class="rbdv__cta">
      Começar pelo setup de 1 hora
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
    </a>
  </section>
</template>

<style scoped>
.rbdv {
  scroll-margin-top: calc(var(--nuh-h, 76px) + 24px);
  background: var(--nu-white);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
/* Cabeçalho centralizado, que é o que a seção pós-hero pede: ela é declaração,
   não narrativa de duas colunas. É também o único cabeçalho centrado da página,
   e é assim de propósito, porque é a única seção que fala do arranjo inteiro. */
.rbdv__head { max-width: 760px; margin-inline: auto; text-align: center; }
.rbdv__head :deep(.nsh__dek) { margin-inline: auto; }

/* O quadro é o contêiner do diagrama: fio, não sombra, e raio de documento. */
.rbdv__quadro {
  margin: clamp(44px, 5vw, 66px) auto 0; max-width: 1180px;
  border: 1px solid var(--nu-cream-line); border-radius: 16px;
  padding: clamp(28px, 4vw, 56px) clamp(22px, 3vw, 48px);
  display: grid; align-items: center;
  grid-template-columns: 1fr minmax(200px, 260px) 1fr;
  gap: clamp(18px, 2.5vw, 40px);
}

.rbdv__col-titulo {
  margin: 0; color: var(--nu-ink);
  font-size: 16px; font-weight: 800; letter-spacing: -0.01em;
}
.rbdv__lista { margin: 22px 0 0; padding: 0; list-style: none; }
/* Fio entre linhas: é a régua de documento que o B2B usa em vez de card. */
.rbdv__item {
  padding: 15px 0; border-top: 1px solid var(--nu-cream-line);
  color: var(--nu-gray-2); font-size: 15.5px; font-weight: 500; line-height: 1.5;
}
/* A coluna da direita espelha: o texto encosta no centro, como os dois lados de
   um encontro. É a única inversão de alinhamento da página. */
.rbdv__col--dir { text-align: right; }

.rbdv__tag {
  display: inline-block; margin-left: 8px; vertical-align: 1px;
  padding: 3px 8px; border-radius: 5px;
  background: var(--nu-cream); color: var(--nu-gray);
  font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .6px;
  white-space: nowrap;
}

.rbdv__meio { display: grid; place-items: center; min-height: 240px; }
.rbdv__venn { width: 100%; height: 100%; }

.rbdv__rodape {
  margin: clamp(26px, 3vw, 34px) auto 0; max-width: 640px; text-align: center;
  color: var(--nu-gray); font-size: 13.5px; font-weight: 600; line-height: 1.6;
}
.rbdv__rodape a { color: var(--nu-blue-deep); text-decoration: underline; text-underline-offset: 3px; }
.rbdv__rodape a:hover { color: var(--nu-blue-hover); }
.rbdv__rodape a:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }

/* link de texto, não terceira mancha de tinta chapada */
.rbdv__cta {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  margin: 26px auto 0; min-height: 44px;
  color: var(--nu-blue-deep); font-size: 15.5px; font-weight: 800; transition: color .2s;
}
.rbdv__cta svg { transition: transform .2s; }
.rbdv__cta:hover { color: var(--nu-blue-hover); }
.rbdv__cta:hover svg { transform: translateX(3px); }
.rbdv__cta:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }

/* Empilhado o desenho SOME por inteiro, e não vira uma faixa entre as listas:
   dois círculos que se cruzam descrevem duas coisas LADO A LADO, e empilhados
   eles não descrevem mais nada. Sobrariam como 240px de enfeite no caminho de
   quem está rolando no celular. */
@media (max-width: 900px) {
  .rbdv__quadro { grid-template-columns: 1fr; gap: 30px; }
  .rbdv__col--dir { text-align: left; }
  .rbdv__meio { display: none; }
}
</style>
