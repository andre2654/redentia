<script setup lang="ts">
/**
 * FAQ da Redentia for Business.
 *
 * ESPELHO DO FAQ DA HOME (direção do dono 2026-08-01: "olha como é o faq da
 * home e faça IGUAL"): o bloco é o `mfq` do MercadoContent, verbatim — duas
 * colunas, "Ficou com alguma dúvida?" à esquerda com a pílula azul ancorando
 * no próprio accordion, e UM NuFaqAccordion à direita com a primeira resposta
 * aberta. Sem grupos, sem rótulo, sem variante: o que muda da home é só a
 * copy da esquerda e os itens.
 *
 * O JSON-LD FAQPage sai do próprio NuFaqAccordion (uma instância = um bloco,
 * como em toda página do app). A copy das 29 respostas vive em
 * content/business/faq.ts, com a procedência documentada lá.
 */
import { RB_FAQ } from '~/content/business/faq'

const ITENS = RB_FAQ.flatMap((g) => g.itens)
</script>

<template>
  <!-- id="faq": a CTA da coluna esquerda ancora no próprio accordion,
       mesmo truque da home -->
  <section id="faq" class="rbfq">
    <div class="rbfq__cols">
      <div class="rbfq__left">
        <NuSectionHeading>Ficou com alguma<br>dúvida?</NuSectionHeading>
        <div class="rbfq__copy">
          Encontre respostas para as principais dúvidas sobre a Redentia
          For Business.
        </div>
        <a href="#faq" class="rbfq__cta">Confira perguntas frequentes</a>
      </div>
      <div class="rbfq__right">
        <NuFaqAccordion :items="ITENS" />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* clonado do .mfq do MercadoContent (o FAQ da home), só com o scroll-margin
   que as seções do business já usam para âncora não parar sob o header */
.rbfq {
  scroll-margin-top: calc(var(--nuh-h, 76px) + 24px);
  background: var(--nu-white);
  padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.rbfq__cols { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.rbfq__left { flex: 1 1 300px; min-width: min(280px, 100%); }
.rbfq__copy { color: var(--nu-gray-2); font-size: 17px; font-weight: 500; line-height: 1.6; margin-top: 22px; max-width: 420px; }
.rbfq__cta {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 26px; font-size: 16px; font-weight: 700;
  margin-top: 30px; transition: background .2s;
}
.rbfq__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.rbfq__cta:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }
.rbfq__right { flex: 1.6 1 480px; min-width: min(340px, 100%); }
</style>
