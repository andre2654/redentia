<script setup lang="ts">
/**
 * "Como funciona" — a seção logo abaixo do hero.
 *
 * MUDOU EM 15/10/2026 (direção do dono, olhando a Decade de novo): o Venn deixou
 * de ser os dois COMPRADORES e virou o par da Decade, humano x IA: o assessor
 * (relação, julgamento, assinatura) e a Redentia (ler, testar, explicar,
 * preparar). Os dois compradores foram para o bloco curto RbRegras. O rodapé
 * técnico e o CTA repetido saíram: a página tem CTA no hero e no plano.
 * Cada linha da Redentia é verdade hoje: leitura editorial contínua (Atlas),
 * cenário em segundos (simulate_scenario), o `why` por ativo com a fonte, e o
 * comando preparar-reuniao. O texto abaixo deste parágrafo é o histórico.
 *
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
/* ENXUGADO EM 15/10/2026, à noite: linhas de 3 a 6 palavras, como as da
   Decade ("Acts with responsibility", "Monitors markets and portfolios 24/7"),
   e o título sozinho, sem eyebrow nem dek. O detalhe de cada linha está no
   scroll logo abaixo. */
const ASSESSOR = [
  'Conhece o cliente pelo nome',
  'Decide o que cabe em cada perfil',
  'Segura a conversa na queda',
  'Assina a recomendação',
]

const REDENTIA = [
  'Lê o mercado o dia inteiro',
  'Testa a carteira em segundos',
  'Explica cada movimento, com fonte',
  'Deixa a pauta da reunião pronta',
]

/* id derivado, nunca literal: dois SVG com o mesmo id de pattern na mesma página
   fazem o segundo resolver no primeiro, e o app já pagou por isso (§14.18). */
const uid = useId()
const hachura = `rbdv-hachura-${uid}`
const esmaece = `rbdv-esmaece-${uid}`
const mascara = `rbdv-mascara-${uid}`
</script>

<template>
  <section id="divisao" class="rbdv">
    <div class="rbdv__head">
      <NuSectionHeading>
        O assessor decide.<br>A Redentia prepara.
      </NuSectionHeading>
    </div>

    <div class="rbdv__quadro">
      <div class="rbdv__col">
        <h3 class="rbdv__col-titulo">O assessor</h3>
        <ul class="rbdv__lista">
          <li v-for="r in ASSESSOR" :key="r" class="rbdv__item">{{ r }}</li>
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
        <!-- TRAÇO VISÍVEL (15/10/2026). Os círculos eram --nu-cream-2 sobre branco
             e a hachura tinha 20% de opacidade: na auditoria o desenho lia como
             vazio. Agora o traço é --nu-sand e a lente é hachura em tinta que
             esmaece do centro para as bordas, que é o gesto da lente da Decade
             adaptado ao fundo claro (lá é traço claro sobre preto). -->
        <svg class="rbdv__venn" viewBox="0 0 260 240" fill="none" aria-hidden="true">
          <defs>
            <pattern :id="hachura" width="4" height="4" patternUnits="userSpaceOnUse">
              <line x1="2" y1="0" x2="2" y2="4" stroke="var(--nu-ink)" stroke-width="1" />
            </pattern>
            <radialGradient :id="esmaece" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stop-color="var(--nu-white)" stop-opacity="1" />
              <stop offset="100%" stop-color="var(--nu-white)" stop-opacity=".12" />
            </radialGradient>
            <mask :id="mascara" maskContentUnits="userSpaceOnUse">
              <path d="M130,39.7 A88,88 0 0,1 130,200.3 A88,88 0 0,1 130,39.7" :fill="`url(#${esmaece})`" />
            </mask>
          </defs>
          <circle cx="94" cy="120" r="88" stroke="var(--nu-sand)" stroke-width="1.2" />
          <circle cx="166" cy="120" r="88" stroke="var(--nu-sand)" stroke-width="1.2" />
          <path
            d="M130,39.7 A88,88 0 0,1 130,200.3 A88,88 0 0,1 130,39.7"
            :fill="`url(#${hachura})`" fill-opacity=".55" :mask="`url(#${mascara})`"
          />
        </svg>
      </div>

      <div class="rbdv__col rbdv__col--dir">
        <h3 class="rbdv__col-titulo">A Redentia</h3>
        <ul class="rbdv__lista">
          <li v-for="r in REDENTIA" :key="r" class="rbdv__item">{{ r }}</li>
        </ul>
      </div>
    </div>


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

/* O quadro é o contêiner do diagrama: fio, não sombra, e raio de documento. */
.rbdv__quadro {
  margin: clamp(44px, 5vw, 66px) auto 0; max-width: 1180px;
  border: 1px solid var(--nu-cream-line); border-radius: 16px;
  padding: clamp(28px, 4vw, 56px) clamp(22px, 3vw, 48px);
  display: grid; align-items: center;
  grid-template-columns: 1fr minmax(200px, 260px) 1fr;
  gap: clamp(18px, 2.5vw, 40px);
}

/* As duas colunas começam no topo (o Venn, no meio, centraliza sozinho): com
   align-items: center as listas de alturas diferentes desalinhavam os títulos. */
.rbdv__col { align-self: start; }
.rbdv__col-titulo {
  margin: 0; color: var(--nu-ink);
  font-size: var(--nu-fs-md); font-weight: 800; letter-spacing: -0.01em;
}
.rbdv__lista { margin: 22px 0 0; padding: 0; list-style: none; }
/* Fio entre linhas: é a régua de documento que o B2B usa em vez de card. */
.rbdv__item {
  padding: 15px 0; border-top: 1px solid var(--nu-cream-line);
  color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5;
}
/* A coluna da direita espelha: o texto encosta no centro, como os dois lados de
   um encontro. É a única inversão de alinhamento da página. */
.rbdv__col--dir { text-align: right; }


.rbdv__meio { display: grid; place-items: center; min-height: 240px; }
.rbdv__venn { width: 100%; height: 100%; }



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
