<script setup lang="ts">
/**
 * "Um dia de mesa com a Redentia" — o scroll travado da página.
 *
 * O GESTO É O DA DECADE (direção do dono, 13/08 e de novo em 15/10/2026): a
 * coluna da esquerda fica FIXA, com foto e um card do produto, e a direita
 * rola, um momento por vez. Até 15/10 este gesto contava a SEGURANÇA ("O que dá
 * pra verificar"); o dono achou a página técnica demais e pediu para o scroll
 * vender o produto, como na Decade, que usa o mesmo gesto para a jornada do
 * cliente. As provas de segurança viraram um bloco curto (RbSeguranca) e o FAQ.
 *
 * CADA MOMENTO É ALGO QUE ACONTECE COM O ASSESSOR, não uma ferramenta. Nada de
 * "chave", "servidor" ou nome de tool aqui: isso mora no FAQ. E nada que o
 * produto não faça hoje:
 *  lista      get_quotes: até 50 ativos, preço, variação, notícia com leitura,
 *             data-com e pagamento (mcp-service 0.6.0)
 *  porque     list_news com a leitura editorial da casa
 *  cenario    simulate_scenario sobre carteira colada em pesos, sem nome e sem
 *             ficar salva na conta (no_cache na chave de escritório)
 *  reuniao    o comando preparar-reuniao; o PDF com a marca é a skill
 *             redentia-relatorio-cliente, e assessoria vinculada NÃO envia
 *             extrato de posição ao cliente (RCVM 178, art. 25, VII), por isso
 *             o relatório é dito só para family office e gestora
 *  cliente    Clientes do escritório, ligado pela Redentia conta a conta: a
 *             etiqueta "na implantação" não sai daqui enquanto for assim
 *
 * A mecânica (IntersectionObserver, mapa de índice, folga do sticky) é a mesma
 * do scroll que esta seção substitui; os comentários de lá valem aqui.
 */
type IdCard = 'lista' | 'porque' | 'cenario' | 'reuniao' | 'cliente'
const MOMENTOS: { id: IdCard; quando: string; titulo: string; texto: string; tag?: string }[] = [
  {
    id: 'lista',
    quando: 'Antes do pregão',
    titulo: 'O que mudou na sua lista.',
    texto: 'Uma pergunta e a lista inteira volta respondida: preço, variação, a notícia com a leitura da Redentia, data-com e pagamento. Até 50 ativos de uma vez, antes do primeiro telefonema.',
  },
  {
    id: 'porque',
    quando: 'No meio do dia',
    titulo: 'Por que o ativo mexeu.',
    texto: 'Quando um papel da carteira dispara ou derrete, a resposta vem com a notícia, a hora e o que muda para quem tem o ativo, em três frases que você repete ao cliente.',
  },
  {
    id: 'cenario',
    quando: 'Quando o cliente liga',
    titulo: 'E se o fiscal piorar depois da eleição?',
    texto: 'Cole a carteira em pesos, sem nome, e coloque contra o medo da vez: eleição, Selic, dólar, uma crise como a de 2020. Sai a faixa do patrimônio em um ano e quem mais sente o choque.',
  },
  {
    id: 'reuniao',
    quando: 'Antes da reunião',
    titulo: 'A conversa já chega pronta.',
    texto: 'Um comando monta a pauta: o que mudou desde a última conversa, os pontos de atenção e o cenário que vale mostrar. Family office e gestora levam também o relatório em PDF com a marca da casa.',
  },
  {
    id: 'cliente',
    quando: 'Com o cliente dentro',
    titulo: 'A carteira do cliente, com o sim dele.',
    texto: 'O cliente conecta o banco ou a corretora por Open Finance, autoriza e revoga quando quiser. A carteira chega atualizada, e cada leitura do escritório fica registrada.',
    tag: 'na implantação',
  },
]

const ativo = ref(0)
const passos = ref<HTMLElement[]>([])
let io: IntersectionObserver | null = null
const indicePorEl = new WeakMap<Element, number>()

onMounted(() => {
  passos.value.forEach((el, i) => { if (el) indicePorEl.set(el, i) })
  io = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue
        const i = indicePorEl.get(e.target)
        if (i !== undefined) ativo.value = i
      }
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
  )
  passos.value.forEach((p) => p && io!.observe(p))
})
onBeforeUnmount(() => { io?.disconnect(); io = null })
</script>

<template>
  <section id="dia" class="rbjn">
    <div class="rbjn__head">
      <NuSectionHeading eyebrow="Um dia de mesa">
        Do pregão à reunião,<br>com a Redentia junto.
        <template #dek>
          Cinco momentos em que a Redentia trabalha pela sua mesa. Você pergunta
          como perguntaria a um colega; a resposta chega com <strong>número, fonte
          e data</strong>.
        </template>
      </NuSectionHeading>
    </div>

    <div class="rbjn__palco">
      <!-- ——— esquerda: fica ——— -->
      <div class="rbjn__fixa">
        <div class="rbjn__cena">
          <!-- anotando.webp: mãos e papel, sem rosto (a única foto da casa sem
               rosto reconhecível que conversa com "preparar a reunião").
               lazy: a seção está duas dobras abaixo e não disputa o LCP. -->
          <img
            src="/business-hero/anotando.webp" alt="" class="rbjn__foto"
            width="620" height="620" loading="lazy" decoding="async" fetchpriority="low"
          >
          <span class="rbjn__scrim" aria-hidden="true" />
          <div class="rbjn__cards">
            <div
              v-for="(m, i) in MOMENTOS" :key="m.id"
              class="rbjn__card" :class="{ 'rbjn__card--on': i === ativo }" :inert="i !== ativo"
            >
              <RbJornadaCard :id="m.id" />
            </div>
          </div>
        </div>

        <div class="rbjn__nav" role="group" aria-label="Ir para um dos cinco momentos">
          <button
            v-for="(m, i) in MOMENTOS" :key="m.id" type="button"
            class="rbjn__dot" :class="{ 'rbjn__dot--on': i === ativo }" :aria-pressed="i === ativo"
            @click="passos[i]?.scrollIntoView({ block: 'center' })"
          >
            <span class="rbjn__dot-hit" aria-hidden="true" />
            <span class="rbjn__sr">{{ m.titulo }}</span>
          </button>
        </div>
      </div>

      <!-- ——— direita: rola ——— -->
      <ol class="rbjn__trilha">
        <li v-for="(m, i) in MOMENTOS" :key="m.id" ref="passos" class="rbjn__passo" :class="{ 'rbjn__passo--on': i === ativo }">
          <span class="rbjn__n">{{ String(i + 1).padStart(2, '0') }} · {{ m.quando }}</span>
          <h3 class="rbjn__titulo">{{ m.titulo }}</h3>
          <p class="rbjn__texto">
            {{ m.texto }}
            <span v-if="m.tag" class="rbjn__tag">{{ m.tag }}</span>
          </p>
          <!-- no celular a cena some e o card entra no próprio passo -->
          <div class="rbjn__card-inline" aria-hidden="true">
            <RbJornadaCard :id="m.id" />
          </div>
        </li>
      </ol>
    </div>

    <p class="rbjn__legenda">
      Dados dos cards: Redentia, 15/10/2026. O cenário rodou em 12/10/2026, no
      motor de projeções da casa, sobre uma carteira de R$ 1 milhão colada em pesos.
    </p>
  </section>
</template>

<style scoped>
.rbjn {
  scroll-margin-top: calc(var(--nuh-h, 76px) + 24px);
  background: var(--nu-cream);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.rbjn__head { max-width: 820px; margin-inline: auto; text-align: center; }
.rbjn__head :deep(.nsh__dek) { margin-inline: auto; }

.rbjn__palco {
  margin-top: clamp(44px, 5vw, 68px);
  display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px, 5vw, 76px);
  align-items: start;
}

/* coluna que fica: full-bleed à esquerda, do fio do header ao fim da tela */
.rbjn__fixa {
  position: sticky; top: var(--nuh-h, 76px);
  height: calc(100vh - var(--nuh-h, 76px));
  margin-left: calc(-1 * clamp(22px, 5.5vw, 80px));
}
.rbjn__cena {
  position: relative; width: 100%; height: 100%;
  display: grid; place-items: center;
  background: var(--nu-navy); overflow: clip;
}
.rbjn__foto { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; }
.rbjn__scrim {
  position: absolute; inset: 0;
  background: linear-gradient(160deg, rgba(12, 21, 36, .30) 0%, rgba(12, 21, 36, .52) 52%, rgba(12, 21, 36, .68) 100%);
}
.rbjn__cards { position: relative; display: grid; width: min(360px, 84%); }
/* os cinco cards dividem a célula; centrados, cada um tem a própria altura */
.rbjn__card { grid-area: 1 / 1; align-self: center; opacity: 0; visibility: hidden; }
.rbjn__card--on {
  opacity: 1; visibility: visible;
  animation: rbjn-entra .42s cubic-bezier(.22, .8, .24, 1) .2s both;
}
@keyframes rbjn-entra {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
}

.rbjn__nav {
  position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
  display: flex; justify-content: center; gap: 4px; z-index: 2;
}
.rbjn__dot {
  appearance: none; background: none; border: 0; cursor: pointer;
  padding: 19px 0; width: 40px; min-height: 44px; display: flex; align-items: center;
}
.rbjn__dot-hit { display: block; width: 100%; height: 3px; border-radius: 2px; background: var(--nu-cream-text-35); transition: background .2s; }
.rbjn__dot--on .rbjn__dot-hit { background: var(--nu-cream-text); }
.rbjn__dot:hover .rbjn__dot-hit { background: var(--nu-cream-text-70); }
.rbjn__dot:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }
.rbjn__sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

/* coluna que rola; a folga de baixo mantém o sticky grudado até o último passo */
.rbjn__trilha { margin: 0; padding: 0 0 16vh; list-style: none; }
.rbjn__passo {
  min-height: 76vh; display: flex; flex-direction: column; justify-content: center;
  max-width: 46ch; opacity: .45; transition: opacity .4s ease;
}
.rbjn__passo--on { opacity: 1; }
.rbjn__n {
  display: block; color: var(--nu-blue-deep); font-size: var(--nu-fs-sm); font-weight: 700;
  font-variant-numeric: tabular-nums; letter-spacing: .4px;
}
.rbjn__titulo {
  margin: 12px 0 0; color: var(--nu-ink);
  font-size: var(--nu-fs-h2-sm); font-weight: 800; letter-spacing: -0.03em; line-height: 1.08;
}
.rbjn__texto {
  margin: 16px 0 0; color: var(--nu-gray-2);
  font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.6;
}
.rbjn__tag {
  display: inline-block; margin-left: 6px; vertical-align: 2px;
  padding: 3px 8px; border-radius: 5px; background: var(--nu-white);
  color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700;
  text-transform: uppercase; letter-spacing: .6px; white-space: nowrap;
}
.rbjn__card-inline { display: none; }

.rbjn__legenda {
  margin: clamp(20px, 3vw, 32px) auto 0; max-width: 640px; text-align: center;
  color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.6;
}

/* empilhado: sem sticky; o card entra dentro do próprio passo */
@media (max-width: 900px) {
  .rbjn__palco { grid-template-columns: 1fr; gap: 0; }
  .rbjn__fixa { display: none; }
  .rbjn__passo {
    min-height: 0; opacity: 1; max-width: none;
    padding: clamp(26px, 4vw, 34px) 0; border-top: 1px solid var(--nu-cream-line);
  }
  .rbjn__card-inline { display: block; margin-top: 20px; }
}
</style>
