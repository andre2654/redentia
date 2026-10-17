<script setup lang="ts">
// Seção do /benchmark-ia no padrão das páginas da Redentia (dono, 16/10: "as
// páginas aqui são divididas assim e eu gosto", como a /business): faixa de
// largura inteira, fundo alternando branco e creme, cabeçalho NuSectionHeading
// (eyebrow azul, título 800, linha de apoio) e o conteúdo embaixo.
// Nas faixas creme, os gráficos trocam a superfície creme por branco
// (--b-surface / --b-surface-hi), para trilho e cartão não sumirem no fundo.
// A navegação entre seções é a faixa do topo (useSectionRail, na página); o
// scroll-margin compensa header + faixa, como na /carteira.
//
// `info`: botão "i" no canto superior direito da seção (dono, 16/10), que abre
// o modal da casa (NuDayModal, o mesmo de "O dia no mercado") explicando o
// gráfico. Fica na linha do título, não em cima do gráfico: vários gráficos já
// usam esse canto (legenda do Inventa, rótulo dos golpes).
//
// `leitura`: botão "Leitura" com o selo da Redentia, ao lado do "i" (dono,
// 16/10: a opinião da casa fica atrás de um toque, a seção fica limpa). Abre o
// mesmo modal: o número grande no título, a frase e o dado por trás.
import type { BenchChartInfo } from '~/types/benchmark'
import type { Leitura } from '~/content/benchmark-ia/leituras'
import type { NuDayBlock } from '~/types/market'

const props = defineProps<{ id: string; title: string; desc?: string; eyebrow?: string; info?: BenchChartInfo; leitura?: Leitura }>()

const open = ref(false)
const openLeitura = ref(false)
const CORES = ['var(--nu-blue)', 'var(--nu-green-2)', 'var(--nu-amber-text)']
// o modal usa v-html: o texto é constante nossa, mas escapa mesmo assim
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const blocks = computed<NuDayBlock[]>(() =>
  (props.info?.blocos ?? []).map((b, i) => ({ label: b.rotulo, color: CORES[i % CORES.length]!, html: esc(b.texto) })))
const blocksLeitura = computed<NuDayBlock[]>(() => (props.leitura
  ? [
      { label: 'A leitura', color: CORES[0]!, html: esc(`${props.leitura.numero} ${props.leitura.frase}`) },
      ...(props.leitura.detalhe ? [{ label: 'O detalhe', color: CORES[1]!, html: esc(props.leitura.detalhe) }] : []),
    ]
  : []))
</script>

<template>
  <section :id="id" class="bse">
    <div class="bse__in">
      <div class="bse__head">
        <NuSectionHeading :eyebrow="eyebrow">
          {{ title }}
          <template v-if="desc" #dek>{{ desc }}</template>
        </NuSectionHeading>
        <div v-if="info || leitura" class="bse__acts">
        <button
          v-if="leitura" type="button" class="bse__leitura" :aria-label="`Leitura da Redentia: ${title}`" aria-haspopup="dialog"
          @click="openLeitura = true"
        >
          <span class="bse__badge" aria-hidden="true"><img src="/logo-branca.svg" alt="" width="12" height="12"></span>
          <span class="bse__leitura-txt">Leitura</span>
        </button>
        <button
          v-if="info" type="button" class="bse__info" :aria-label="`Como ler: ${info.titulo}`" aria-haspopup="dialog"
          @click="open = true"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.6v.01" stroke-width="2.4" />
          </svg>
        </button>
        </div>
      </div>
      <div class="bse__body"><slot /></div>
    </div>
    <NuDayModal
      v-if="info" :open="open" eyebrow="Como ler" :title="info.titulo" :date-line="info.sub" :blocks="blocks"
      @close="open = false"
    />
    <NuDayModal
      v-if="leitura" :open="openLeitura" eyebrow="Leitura da Redentia" :title="leitura.numero" :date-line="title" :blocks="blocksLeitura"
      @close="openLeitura = false"
    />
  </section>
</template>

<style scoped>
.bse {
  scroll-margin-top: calc(var(--nuh-h, 76px) + 56px);
  background: var(--nu-white);
  padding: clamp(56px, 7vw, 96px) clamp(22px, 5.5vw, 80px);
}
.bse:nth-of-type(even) { background: var(--nu-cream); --b-surface: var(--nu-white); --b-surface-hi: var(--nu-cream); }
.bse__in { max-width: 1240px; margin: 0 auto; }
.bse__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
.bse__head > :first-child { min-width: 0; }
.bse__body { margin-top: clamp(28px, 3.4vw, 44px); }

/* "i": mesmo círculo do fechar do modal; na faixa creme fica branco */
.bse__info {
  flex: 0 0 auto; width: 40px; height: 40px; margin-top: 2px; border-radius: 50%; border: none; cursor: pointer;
  display: grid; place-items: center;
  background: var(--b-surface, var(--nu-day-close)); color: var(--nu-ink);
  box-shadow: inset 0 0 0 1px var(--nu-cream-2);
  transition: background .2s, color .2s, transform .2s;
}
.bse__info:hover { color: var(--nu-blue); transform: translateY(-1px); }
.bse__acts { flex: 0 0 auto; display: flex; align-items: center; gap: 8px; }
/* "Leitura": pílula da mesma altura e superfície do "i", com o selo da marca */
.bse__leitura {
  height: 40px; margin-top: 2px; padding: 0 14px 0 8px; border: none; border-radius: var(--nu-r-pill); cursor: pointer;
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--b-surface, var(--nu-day-close)); color: var(--nu-ink);
  box-shadow: inset 0 0 0 1px var(--nu-cream-2);
  font-family: inherit; font-size: var(--nu-fs-sm); font-weight: 700;
  transition: background .2s, color .2s, transform .2s;
}
.bse__leitura:hover { color: var(--nu-blue); transform: translateY(-1px); }
.bse__leitura:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.bse__badge {
  width: 24px; height: 24px; border-radius: 50%; background: var(--nu-blue);
  display: inline-flex; align-items: center; justify-content: center;
}
.bse__badge img { width: 12px; height: 12px; display: block; object-fit: contain; }
/* celular: só o selo, num círculo do tamanho do "i", para não espremer o título */
@media (max-width: 640px) {
  .bse__leitura { width: 40px; padding: 0; justify-content: center; }
  .bse__leitura-txt { display: none; }
  /* os botões sobem para a linha do eyebrow (curta) e o título fica com a largura toda */
  .bse__head { position: relative; display: block; }
  .bse__acts { position: absolute; top: -8px; right: 0; }
}
.bse__info:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
</style>
