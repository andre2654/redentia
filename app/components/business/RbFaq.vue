<script setup lang="ts">
/**
 * FAQ da Redentia for Business.
 *
 * POR ASSUNTO, EM ABAS (15/10/2026, pedido do dono). Até aqui era o espelho do
 * FAQ da home (direção de 2026-08-01): as 30 perguntas num accordion só, que
 * ocupava ~5 telas no celular, e no desktop a coluna da esquerda ficava vazia
 * por 3 telas enquanto a lista descia. Agora:
 *  - os grupos de content/business/faq.ts são abas (tablist/tab/tabpanel,
 *    setas, Home e End, foco visível), começando no primeiro;
 *  - TODAS as perguntas continuam no HTML: cada aba tem o seu NuFaqAccordion
 *    num painel com v-show, não v-if, então o SSR serve as 30;
 *  - o JSON-LD FAQPage sai UMA vez daqui, com as 30 (useFaqSchema), e os
 *    accordions vão com schema=false: senão seriam cinco blocos FAQPage;
 *  - no desktop a coluna da esquerda (título, CTA e abas) fica sticky
 *    enquanto a lista rola.
 *
 * AS ABAS SÃO UMA LISTA VERTICAL, e não uma fileira de pílulas: o nome de um
 * grupo é frase ("Segurança, LGPD e responsabilidade"), e cinco delas lado a
 * lado não cabem nem na coluna da direita do desktop (~740px) nem no celular,
 * onde virariam uma faixa com rolagem lateral escondendo três das cinco.
 */
import { RB_FAQ } from '~/content/business/faq'

useFaqSchema(RB_FAQ.flatMap((g) => g.itens))

// id derivado, nunca literal (mesma regra do RbDivisao)
const uid = useId()
const abaId = (i: number) => `${uid}-aba-${i}`
const painelId = (i: number) => `${uid}-painel-${i}`

const ativa = ref(0)
const lista = ref<HTMLElement | null>(null)

/* No desktop a aba é sticky e a lista pode estar rolada lá embaixo quando a
   pessoa troca de assunto: se o topo do painel novo ficou acima da dobra, ele
   volta para baixo do header. No celular as abas ficam logo acima do painel,
   então o topo já está na tela e nada rola. Scroll suave só sem
   reduced-motion (regra 11: JS checa à mão). */
function trazerPainel() {
  const el = lista.value
  if (!el) return
  const header = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nuh-h')) || 76
  const folga = header + 24
  const topo = el.getBoundingClientRect().top
  if (topo >= folga) return
  const suave = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: window.scrollY + topo - folga, behavior: suave ? 'smooth' : 'auto' })
}

function selecionar(i: number, focar = false) {
  const n = RB_FAQ.length
  ativa.value = ((i % n) + n) % n
  // foco pelo id, não por ref de v-for (o array de ref é refeito a cada render)
  if (focar) document.getElementById(abaId(ativa.value))?.focus()
  nextTick(trazerPainel)
}

/* Teclado do padrão de abas (WAI-ARIA APG), com ativação automática: a seta
   já troca o painel, que existe pronto no DOM. A lista é vertical, mas as
   quatro setas andam, para ninguém precisar adivinhar a orientação. */
function teclado(e: KeyboardEvent, i: number) {
  const alvo: Record<string, number> = {
    ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1,
    Home: 0, End: RB_FAQ.length - 1,
  }
  const destino = alvo[e.key]
  if (destino === undefined) return
  e.preventDefault()
  selecionar(destino, true)
}
</script>

<template>
  <!-- id="faq": a CTA da coluna esquerda ancora no topo da própria seção,
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

        <div class="rbfq__abas" role="tablist" aria-label="Assuntos das perguntas frequentes" aria-orientation="vertical">
          <button
            v-for="(g, i) in RB_FAQ" :id="abaId(i)" :key="g.grupo"
            type="button" role="tab" class="rbfq__aba" :class="{ 'rbfq__aba--on': i === ativa }"
            :aria-selected="i === ativa" :aria-controls="painelId(i)" :tabindex="i === ativa ? 0 : -1"
            @click="selecionar(i)" @keydown="teclado($event, i)"
          >
            <span>{{ g.grupo }}</span>
            <!-- quantas perguntas o assunto tem; quem usa leitor de tela
                 ouve a contagem ao entrar no painel -->
            <span class="rbfq__qtd" aria-hidden="true">{{ g.itens.length }}</span>
          </button>
        </div>
      </div>

      <div ref="lista" class="rbfq__right">
        <div
          v-for="(g, i) in RB_FAQ" v-show="i === ativa" :id="painelId(i)" :key="g.grupo"
          role="tabpanel" :aria-labelledby="abaId(i)"
        >
          <NuFaqAccordion :items="g.itens" :schema="false" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rbfq {
  scroll-margin-top: calc(var(--nuh-h, 76px) + 24px);
  background: var(--nu-white);
  padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.rbfq__cols { display: grid; grid-template-columns: minmax(0, 1fr); gap: clamp(32px, 5vw, 80px); }
.rbfq__copy { color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.6; margin-top: 24px; max-width: 420px; }

/* O CTA principal da página inteira tem um estilo só (o do RbProva): azul,
   pílula, 16px. */
.rbfq__cta {
  display: inline-flex; align-items: center; margin-top: 32px;
  background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 16px 26px;
  font-size: var(--nu-fs-md); font-weight: 800; transition: background .2s;
}
.rbfq__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.rbfq__cta:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }

/* ——— as abas ———
   Trilho creme com os segmentos dentro: lê como UM controle, e o creme rima
   com os cards do accordion ao lado. */
.rbfq__abas {
  display: flex; flex-direction: column; gap: 4px; margin-top: 24px; max-width: 420px;
  padding: 4px; background: var(--nu-cream); border-radius: 16px;
}
.rbfq__aba {
  appearance: none; border: 0; cursor: pointer; font-family: inherit; text-align: left;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  width: 100%; min-height: 44px; padding: 8px 16px; border-radius: 12px;
  background: transparent; color: var(--nu-gray-2);
  font-size: var(--nu-fs-md); font-weight: 700; line-height: 1.3;
  transition: background .2s, color .2s;
}
.rbfq__aba:hover { background: var(--nu-white); color: var(--nu-ink); }
.rbfq__aba:active { transform: translateY(1px); }
/* aba ativa = a mesma pele das abas do RbAssistente: tinta cheia */
.rbfq__aba--on, .rbfq__aba--on:hover { background: var(--nu-ink); color: var(--nu-white); }
.rbfq__aba:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.rbfq__qtd {
  flex-shrink: 0; color: var(--nu-gray);
  font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums;
}
.rbfq__aba--on .rbfq__qtd { color: var(--nu-white-75); }

/* Lado a lado a partir de 960px. A coluna da esquerda acompanha a lista
   (sticky), com o header encolhido (--nuh-h) e 24px de folga. Ela mede
   ~620px; numa tela com menos de 700px de altura ela não caberia inteira
   enquanto gruda, e a última aba sumiria embaixo, então ali ela só rola. */
@media (min-width: 960px) {
  .rbfq__cols { grid-template-columns: minmax(300px, 1fr) minmax(0, 1.6fr); align-items: start; }
}
@media (min-width: 960px) and (min-height: 700px) {
  .rbfq__left { position: sticky; top: calc(var(--nuh-h, 76px) + 24px); }
}
</style>
