<script setup lang="ts">
/**
 * "Como funciona" — o fluxo do fechamento em três passos.
 *
 * DUAS TESES, NÃO TRÊS (direção do dono 2026-07-30). O deck vende a pirâmide
 * Fundação / Motor / Ponta, mas o MVP cortou o Motor (curadoria e simulação).
 * A página fala só do que existe: os passos 1 e 2 são a Fundação (captura e
 * consolidação) e o 3 é a Ponta (o relatório com a marca do escritório).
 * Simulação não é mencionada em lugar nenhum, então não há o que desfazer na
 * reunião.
 *
 * COMPONENTE REUSADO, NÃO REESCRITO: a timeline é o `NuStepsTimeline` do app
 * (trilho com fill azul que acompanha o scroll, numeração 01/02/03 tabular).
 * A regra da casa é uma implementação por responsabilidade — e a auditoria do
 * frontend achou 15 arquivos que recopiaram o CSS do NuSectionHeading em vez
 * de usá-lo. Aqui os dois compartilhados são usados de verdade.
 *
 * O QUE A COPY NÃO DIZ, DE PROPÓSITO: o deck promete "o fim do download manual
 * de extratos". Isso é linguagem de Pluggy, e o MVP é ARQUIVO DO CUSTODIANTE
 * PRIMEIRO. Enquanto a conexão automática não existir, quem manda o arquivo é
 * o escritório, e a página diz exatamente isso.
 */
const PASSOS = [
  '<strong>Captura.</strong> Você manda o arquivo do custodiante do jeito que ele exporta. A Redentia lê o formato dele, e não o contrário: nada de virar planilha intermediária antes de entrar.',
  '<strong>Conciliação.</strong> Cada linha vira posição normalizada por uma regra reaproveitável: escrita uma vez, passa a valer pro portfólio inteiro. Todo valor consolidado guarda o rastro até a linha do documento de origem.',
  '<strong>Relatório.</strong> O mês fechado sai com a marca do escritório, pronto pra reunião com a família. A tecnologia não aparece em lugar nenhum.',
]
</script>

<template>
  <section id="como-funciona" class="rbcf">
    <div class="rbcf__cols">
      <div class="rbcf__intro">
        <!-- Título curto de propósito: o h2 do NuSectionHeading vai a 62px e a
             coluna tem ~590px, então cada linha precisa caber em ~18 caracteres.
             "custodiante" saiu daqui e vive no dek e no passo 01 — encurtar a
             copy é mais barato que recopiar o CSS do componente compartilhado. -->
        <NuSectionHeading eyebrow="Como funciona">
          Do arquivo<br>ao mês fechado.
          <template #dek>
            Três passos, e o escritório só participa do primeiro. O resto é a
            Redentia trabalhando com <strong>rastro até a fonte</strong>, porque
            um número que ninguém consegue explicar não fecha nada.
          </template>
        </NuSectionHeading>
      </div>

      <div class="rbcf__steps">
        <NuStepsTimeline :steps="PASSOS" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.rbcf {
  scroll-margin-top: calc(var(--nuh-h, 76px) + 24px);
  background: var(--nu-white);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
/* Duas colunas com a narrativa à esquerda e o dado à direita — o layout
   canônico de seção do app. A base de 480px na esquerda é a largura em que o
   h2 do NuSectionHeading (clamp até 62px) ainda cabe sem quebrar feio. */
.rbcf__cols {
  display: flex; gap: clamp(32px, 5vw, 76px);
  align-items: flex-start; flex-wrap: wrap;
}
.rbcf__intro { flex: 1 1 480px; min-width: min(300px, 100%); }
.rbcf__steps { flex: 1.15 1 460px; min-width: min(300px, 100%); }
</style>
