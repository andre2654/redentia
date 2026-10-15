<script setup lang="ts">
/**
 * "Para quem é" — a seção logo abaixo do hero.
 *
 * ESTRUTURA HERDADA DA "DIVISÃO DO TRABALHO" (direção do dono 2026-08-13,
 * olhando a seção pós-hero da Decade): cabeçalho centrado, duas colunas que se
 * encontram e um Venn decorativo no meio. A seção pós-hero da Decade não é
 * processo, é posicionamento: responde a um medo e diz o que o produto é.
 *
 * O CONTEÚDO MUDOU EM 11/10/2026, e o medo também. A versão anterior falava
 * com quem consolida patrimônio de famílias ("Captura o arquivo do custodiante",
 * "Concilia o que não bate"), que é a Tese 1 e não é o que está no ar. Quem
 * entra nas calls agora são dois compradores com regras opostas:
 *
 *  1. ASSESSORIA VINCULADA (XP, BTG). Não pode compartilhar carteira de cliente
 *     fora da plataforma da corretora, e a RCVM 178, art. 25, VII, veda ao
 *     assessor "confeccionar e enviar para os clientes extratos contendo
 *     informações sobre as operações realizadas ou posições em aberto". O medo
 *     é "isso vai me pôr em problema com o compliance da XP". A resposta é o
 *     caminho sem dado de cliente: lista, notícia e cenário sobre carteira
 *     colada, sem nome e sem ficar salva na conta do escritório.
 *  2. FAMILY OFFICE E GESTORA. Querem o cliente dentro. O medo é "o dado do
 *     meu cliente vai parar onde?". A resposta é o consentimento do próprio
 *     cliente, o registro de cada leitura e o relatório com a marca da casa.
 *
 * O Venn agora são os DOIS COMPRADORES, e a lente é o núcleo que os dois usam
 * (mercado, notícias, cenários). Continua 100% decorativo: o título já diz.
 *
 * ⚠️ O QUE CADA LINHA AFIRMA FOI CONFERIDO NO CÓDIGO (Backend e mcp-service,
 * origin/main de 11/10/2026): a carteira colada vai ao motor sem nome e não é
 * gravada em conta nenhuma (mcpSimulate não persiste, e o log do mcp-service
 * guarda o nome da ferramenta, não os argumentos). ⚠️ "Nada guardado" é FALSO:
 * o ScenarioEngineService põe o resultado (com ticker e valor) no cache de 30
 * min do Laravel, por hash do pedido e sem chave; só a carteira de cliente
 * (C4) passa no_cache. Por isso a linha diz "sem ficar salva na conta", e não
 * "sem nada guardado" (revisão de 11/10/2026). Cada leitura de
 * cliente grava `portfolio_read`/`simulation_run` no business_client_access_log;
 * o relatório em PDF é a skill redentia-relatorio-cliente, que roda no Claude.
 * A conexão de cliente por Open Finance leva a etiqueta "na implantação" porque
 * é ligada pela Redentia conta a conta (business:conta --clientes), não no
 * cadastro. Se isso mudar, a etiqueta sai aqui e no faq.ts.
 */
const ASSESSORIA = [
  { t: 'O que mudou hoje nos ativos da sua lista, com a leitura da Redentia', tag: '' },
  { t: 'Cenário sobre uma carteira colada em pesos, sem nome de cliente e sem ficar salva na conta do escritório', tag: '' },
  { t: 'Por que um ativo subiu ou caiu, com a notícia e a data', tag: '' },
  { t: 'Nada que vire extrato de posição para o cliente, o que a RCVM 178 veda ao assessor', tag: '' },
]

const FAMILY = [
  { t: 'Clientes conectados por Open Finance, cada um com o próprio consentimento', tag: 'na implantação' },
  { t: 'Cenário sobre a carteira conectada do cliente, com o porquê de cada ativo', tag: '' },
  { t: 'Relatório em PDF com a marca do escritório, gerado no Claude', tag: '' },
  { t: 'Cada leitura registrada, à vista do escritório e do cliente', tag: '' },
]

/* id derivado, nunca literal: dois SVG com o mesmo id de pattern na mesma página
   fazem o segundo resolver no primeiro, e o app já pagou por isso (§14.18). */
const uid = useId()
const hachura = `rbdv-hachura-${uid}`
</script>

<template>
  <section id="divisao" class="rbdv">
    <div class="rbdv__head">
      <NuSectionHeading eyebrow="Para quem é">
        O mesmo assistente.<br>Duas regras do jogo.
        <template #dek>
          Assessoria vinculada não tira carteira de cliente da corretora. Family
          office e gestora querem o cliente dentro. <strong>A Redentia atende
          os dois sem pedir que ninguém quebre a própria regra.</strong>
        </template>
      </NuSectionHeading>
    </div>

    <div class="rbdv__quadro">
      <div class="rbdv__col">
        <h3 class="rbdv__col-titulo">Assessoria ligada a XP ou BTG</h3>
        <ul class="rbdv__lista">
          <li v-for="r in ASSESSORIA" :key="r.t" class="rbdv__item">
            {{ r.t }}
            <span v-if="r.tag" class="rbdv__tag">{{ r.tag }}</span>
          </li>
        </ul>
      </div>

      <!-- 100% DECORATIVO (direção do dono 2026-08-13: tirar o texto do meio).
           Os dois círculos são os dois compradores e a lente é o que os dois
           usam igual; o título da seção já diz isso. Por isso a coluna inteira
           é aria-hidden e some no empilhado, em vez de virar um bloco vazio. -->
      <div class="rbdv__meio" aria-hidden="true">
        <!-- GEOMETRIA MEDIDA, não estimada. A primeira tentativa tinha r=100 com
             centros a 60 de distância: a sobreposição comia 80% de cada círculo
             e o desenho lia como UM círculo hachurado, não como dois que se
             encontram. Com r=88 e centros a 72 a lente fica com 104 de largura,
             e cada círculo mantém metade de si de fora.
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
        <h3 class="rbdv__col-titulo">Family office e gestora</h3>
        <ul class="rbdv__lista">
          <li v-for="r in FAMILY" :key="r.t" class="rbdv__item">
            {{ r.t }}
            <span v-if="r.tag" class="rbdv__tag">{{ r.tag }}</span>
          </li>
        </ul>
      </div>
    </div>

    <p class="rbdv__rodape">
      Mercado, notícias e cenários respondem no primeiro dia, em qualquer
      chave da casa. A conexão com a instituição do cliente é liberada
      escritório a escritório, na implantação. O detalhe está no
      <a href="#faq">FAQ desta página</a>.
    </p>

    <a href="#contato" class="rbdv__cta">Começar pelo setup de 1 hora</a>
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

/* CTA principal com o estilo único da página (o do RbProva: azul, pílula,
   16px). Era link de texto até 15/10/2026, quando o dono pediu uma cor e um
   estilo só para todo CTA principal. */
.rbdv__cta {
  display: flex; width: fit-content; align-items: center; justify-content: center;
  margin: 32px auto 0; min-height: 44px;
  background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 16px 26px;
  font-size: 16px; font-weight: 800; text-align: center; transition: background .2s;
}
.rbdv__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
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
