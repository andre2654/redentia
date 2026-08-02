<script setup lang="ts">
/**
 * Hero da Redentia for Business — abre pela dor medida, não pela promessa.
 *
 * O número vem do MFO_Operational_Standard: o ciclo de ingestão e conferência
 * come até 15 dias do mês. NÃO é estatística de survey, é síntese de conversas
 * com gestores — por isso a procedência aparece na tela (regra de voz da casa:
 * nota de frescor e procedência sempre visível), em vez de o número flutuar
 * como se fosse dado público.
 *
 * O que o deck faz e esta seção NÃO faz: prometer os 10 dias. A recuperação é
 * o OBJETIVO da prova de conceito, medido no fechamento do cliente. A legenda
 * abaixo das barras diz isso com todas as letras.
 *
 * COPY REVISADA E APROVADA (2026-08-01, revisão de conversão):
 *  - H1 sem "Seu": o dono escolheu a versão que não afirma um fato sobre o
 *    leitor ("Fechar o mês leva 15 dias" é observação de mercado; "Seu
 *    fechamento leva" quebrava no primeiro segundo pra quem fecha em 8).
 *  - CTA específico: "Agendar o setup de 1 hora" diz o que a pessoa recebe e
 *    quanto custa em tempo. O genérico "Falar com a gente" fica no header.
 *  - A nota de procedência agora diz O QUE ela prova (os 15 dias), em vez de
 *    flutuar solta embaixo do botão.
 *
 * Direção visual (PLANO §6.1, "a mesma Redentia com menos manchas"):
 *  - banda creme, o piso da página; sem foto e sem gradiente
 *  - a comparação é UMA tinta em duas densidades, não duas cores semânticas:
 *    verde e vermelho saíram inteiros do B2B (um consolidado apurado às 07:12
 *    não carrega a alta de hoje)
 *  - o card separa por HAIRLINE, não por sombra, e usa raio de documento
 *    (16px) em vez dos 24-26px do app
 */
/**
 * O CARD É UM CALENDÁRIO, NÃO UM GRÁFICO (aprovado 2026-08-01): as barras de
 * comparação repetiam o 15/5 que o H1 acabou de dizer, dez centímetros ao
 * lado. Os 15 dias viram 15 quadradinhos em 3 linhas de 5 — três semanas
 * úteis, que é o que 15 dias de fechamento realmente são. A primeira semana
 * acesa é o fechamento; as duas apagadas são os 10 dias que VOLTAM pro
 * escritório. O card deixa de repetir o número e mostra a consequência dele.
 * ⚠️ Os números precisam bater com o H1 ("15 dias." / "levar 5."), que é
 * texto escrito à mão três linhas abaixo.
 */
const DIAS_TOTAL = 15
const DIAS_FECHAMENTO = 5
const DIAS_DEVOLVIDOS = DIAS_TOTAL - DIAS_FECHAMENTO
</script>

<template>
  <section id="gargalo" class="rbh0">
    <div class="rbh0__cols">
      <div class="rbh0__left">
        <span class="rbh0__eyebrow">O gargalo</span>
        <!-- quebra manual: a medida do título é decisão de composição, não do
             navegador (mesma razão do NuSectionHeading usar slot) -->
        <h1 class="rbh0__title">
          Fechar o mês leva<br>
          <span class="rbh0__num">15 dias.</span><br>
          <span class="rbh0__soft">Deveria levar 5.</span>
        </h1>
        <p class="rbh0__dek">
          Garimpar produto e normalizar planilha consome as horas mais caras do
          escritório. A Redentia assume esse meio do caminho: captura, normaliza,
          concilia. O mês volta fechado, com rastro até a fonte.
        </p>
        <a href="#contato" class="rbh0__cta">Agendar o setup de 1 hora</a>
        <p class="rbh0__source">
          Os 15 dias são o que ouvimos de dezenas de gestores e líderes de MFO
          em 2026.
        </p>
      </div>

      <div class="rbh0__right">
        <div class="rbh0__card">
          <span class="rbh0__card-label">Ciclo de fechamento · {{ DIAS_TOTAL }} dias úteis</span>

          <!-- 3 linhas de 5 = três semanas úteis. Decorativo: a legenda abaixo
               carrega a informação em texto de verdade. -->
          <div class="rbh0__cal" aria-hidden="true">
            <span
              v-for="d in DIAS_TOTAL" :key="d"
              class="rbh0__dia" :class="{ 'rbh0__dia--on': d <= DIAS_FECHAMENTO }"
            >{{ d }}</span>
          </div>

          <div class="rbh0__leg">
            <p class="rbh0__leg-item">
              <span class="rbh0__swatch rbh0__swatch--on" aria-hidden="true" />
              <strong>{{ DIAS_FECHAMENTO }} dias</strong>, o fechamento com a Redentia.
            </p>
            <p class="rbh0__leg-item">
              <span class="rbh0__swatch" aria-hidden="true" />
              <strong>{{ DIAS_DEVOLVIDOS }} dias</strong> de volta pro escritório.
            </p>
          </div>

          <p class="rbh0__caption">
            Os {{ DIAS_FECHAMENTO }} dias são a meta da prova de conceito, medida
            no seu próprio fechamento. Não é promessa de resultado.
          </p>
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
  align-items: center; flex-wrap: wrap;
}
/* Base 560px, não 490: é a largura mínima que o título pede no seu tamanho
   máximo (58px × ~9,4px de avanço por px de fonte = 547px). Com base menor as
   duas colunas se formavam cedo demais, a esquerda nascia com 496px e o
   título voltava a quebrar em 4 linhas por volta de 1000px de viewport. */
.rbh0__left { flex: 1.35 1 560px; min-width: min(300px, 100%); }
.rbh0__right { flex: 1 1 340px; min-width: min(300px, 100%); }

.rbh0__eyebrow {
  display: block; color: var(--nu-blue); font-size: 11.5px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 1.5px;
}
/* A escala inteira é ditada pela linha mais longa, "Fechar o mês leva" (17
   caracteres): se ela não couber na coluna, "leva" cai sozinha e a quebra
   manual das 3 linhas perde o sentido. Medido no canvas em cada largura, não
   estimado — a 38px o texto pedia 358px numa coluna de 331 no iPhone, e a
   72-88px do hero do app ele estoura a coluna de 690px do desktop, porque
   aqui o título divide a dobra com o card. */
.rbh0__title {
  margin: 14px 0 0; color: var(--nu-ink);
  font-size: clamp(30px, 8.5vw, 58px); font-weight: 800;
  letter-spacing: -0.045em; line-height: 1.03;
}
/* tabular porque é número em manchete: o app inteiro trata número assim */
.rbh0__num { font-variant-numeric: tabular-nums; }
/* o alvo entra apagado: o contraste de peso conta a história sem gastar cor */
.rbh0__soft { color: var(--nu-gray-2); font-variant-numeric: tabular-nums; }

.rbh0__dek {
  margin: 24px 0 0; max-width: 560px; color: var(--nu-gray);
  font-size: clamp(16px, 1.7vw, 19px); font-weight: 600; line-height: 1.6;
}
.rbh0__cta {
  display: inline-flex; align-items: center; margin: 30px 0 0;
  background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 16px 28px;
  font-size: 16.5px; font-weight: 800; transition: background .2s;
}
.rbh0__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.rbh0__cta:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }
.rbh0__source {
  margin: 22px 0 0; max-width: 460px; color: var(--nu-gray);
  font-size: 13px; font-weight: 600; line-height: 1.5;
}

/* ——— card da comparação: hairline no lugar da sombra, raio de documento ——— */
.rbh0__card {
  background: var(--nu-white); border: 1px solid var(--nu-cream-line);
  border-radius: 16px; padding: clamp(24px, 3vw, 34px);
}
.rbh0__card-label {
  display: block; color: var(--nu-gray); font-size: 11.5px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 1.4px;
}
/* o calendário: 5 colunas (a semana útil) × 3 linhas. Raio 4px, quadrado de
   documento, não pílula — é o detalhe que separa o B2B do app. */
.rbh0__cal {
  margin-top: 24px; max-width: 340px;
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 7px;
}
.rbh0__dia {
  aspect-ratio: 1.15; border-radius: 4px;
  display: grid; place-items: center;
  border: 1px solid var(--nu-cream-line);
  color: var(--nu-gray); font-size: 12.5px; font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.rbh0__dia--on { background: var(--nu-blue); border-color: var(--nu-blue); color: var(--nu-white); }

.rbh0__leg { margin-top: 22px; display: flex; flex-direction: column; gap: 8px; }
.rbh0__leg-item {
  margin: 0; display: flex; align-items: center; gap: 10px;
  color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500;
}
.rbh0__leg-item strong { color: var(--nu-ink); font-weight: 800; font-variant-numeric: tabular-nums; }
.rbh0__swatch {
  width: 13px; height: 13px; flex-shrink: 0; border-radius: 3px;
  border: 1px solid var(--nu-cream-line);
}
.rbh0__swatch--on { background: var(--nu-blue); border-color: var(--nu-blue); }

.rbh0__caption {
  margin: 24px 0 0; padding-top: 20px; border-top: 1px solid var(--nu-cream-line);
  color: var(--nu-gray); font-size: 13px; font-weight: 600; line-height: 1.55;
}

@media (max-width: 760px) {
  .rbh0__cols { gap: 34px; }
  .rbh0__cta { width: 100%; justify-content: center; }
}
</style>
