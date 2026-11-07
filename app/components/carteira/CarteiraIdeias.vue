<script setup lang="ts">
// As ideias da Redentia para a carteira (05/11/2026; o dono, olhando a
// /carteira: "tire, e deixe no lugar de 'Perguntar' ali um botão que abra um
// modal com as ideias de melhoria da carteira"). A barra "a Redentia
// encontrou", que ficava entre o topo e o "Daqui a 5 anos", saiu; o que ela
// mostrava mora aqui, num modal aberto pelo botão redondo do topo
// (TopoBotao, o mesmo de Esconder valores e Adicionar conta), com um selo da
// contagem quando há ponto de atenção de hoje.
//
// O modal segue o painel de provas do /asset (AcaoCadeiaDetalhe): Teleport
// para o body só depois do clique, foco preso e devolvido ao botão
// (useModalA11y), Esc e clique fora fecham, o <html> não rola atrás. No
// celular, folha que sobe do pé.
//
// O conteúdo é o mesmo da barra, já testado em utils/achadosDaCarteira.ts
// (montarAchados: os pontos de atenção do score de hoje, por gravidade): a
// assinatura "Redentia AI · olhou N ativos hoje às HH:MM", a contagem e as
// linhas (título e número de hoje à direita, o "Perguntar à Redentia" de cada
// uma) nos grupos "Pede atenção" / "Vai bem". Sem ponto de atenção, a linha
// calma. Abrir o chat daqui fecha o modal. A análise escrita pela IA e o
// "Pedir uma análise nova" (que pedia ao chat para reanalisar) saíram em
// 07/11/2026, com o Raio-X da carteira.
import type { CarteiraPosicaoMundo, CarteiraScoreVM } from '~/types/carteira'
import { achadosHtml, assinaturaDosAchados, montarAchados, oQueOlhou, resumoDosAchados, tituloDosAchados } from '~/utils/achadosDaCarteira'
import TopoBotao from '~/components/ativo/topo/TopoBotao.vue'

const props = defineProps<{
  raiox: CarteiraScoreVM | null
  posicoes: CarteiraPosicaoMundo[]
  olhadaEm: string | null
}>()

const vm = computed(() => montarAchados({ raiox: props.raiox, posicoes: props.posicoes, olhadaEm: props.olhadaEm }))
const cabeca = computed(() => tituloDosAchados(vm.value))
const assinatura = computed(() => assinaturaDosAchados(vm.value))

/** a contagem do título, sem a abertura (que vai na assinatura); o número não se separa da palavra dele */
const tituloEmPartes = computed(() => {
  const out: { texto: string; numero?: 'atencao'; cola?: string }[] = []
  let cola = false
  for (const p of cabeca.value.pedacos.slice(1)) {
    if (p.numero) { out.push({ ...p, cola: '' }); cola = true; continue }
    if (cola) {
      const m = p.texto.match(/^(\s*\S+)([\s\S]*)$/)
      out[out.length - 1]!.cola = m?.[1] ?? ''
      if (m?.[2]) out.push({ texto: m[2] })
      cola = false
      continue
    }
    out.push({ texto: out.length ? p.texto : p.texto.charAt(0).toUpperCase() + p.texto.slice(1) })
  }
  return out
})

/* ————— o valor em reais some com o olho fechado (o dos detalhes) ————— */
const { hidden } = useHiddenValues()
const semValor = (t: string) => (hidden.value ? t.replace(/R\$\s?[\d.,]+/g, 'R$ ••••') : t)
const html = computed(() => (vm.value.vazio ? '' : achadosHtml(vm.value, { olhou: false, mascarar: semValor })))

/* ————— o botão: o selo conta os pontos de atenção de hoje ————— */
const pontos = computed(() => vm.value.pontos)
const rotuloDoBotao = computed(() => (pontos.value
  ? `Ideias da Redentia para a carteira: ${pontos.value} ${pontos.value === 1 ? 'ponto pede' : 'pontos pedem'} atenção`
  : 'Ideias da Redentia para a carteira'))

/* ————— o modal ————— */
const aberto = ref(false)
const cardRef = ref<HTMLElement | null>(null)
useModalA11y(cardRef, aberto)
const idTitulo = useId()
function abrirModal() { aberto.value = true }
function fechar() { aberto.value = false }
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') fechar()
}
watch(aberto, (o) => {
  if (import.meta.server) return
  document.documentElement.style.overflow = o ? 'hidden' : ''
  if (o) {
    document.addEventListener('keydown', onKey)
    nextTick(() => cardRef.value?.focus())
  } else {
    document.removeEventListener('keydown', onKey)
  }
})
onBeforeUnmount(() => {
  if (import.meta.server) return
  document.removeEventListener('keydown', onKey)
  document.documentElement.style.overflow = ''
})

/* ————— as ações: o chip de pergunta do /asset ————— */
const painel = useChatPainel()
const acoes = ['Perguntar à Redentia']
const contexto = computed(() => ({
  id: 'carteira:achados',
  tipo: 'carteira',
  rotulo: 'O que a Redentia encontrou',
  texto: [
    vm.value.vazio
      ? `A Redentia olhou ${oQueOlhou(vm.value) ?? 'a carteira'} (${vm.value.olhouEm ?? 'hoje'}) e não encontrou nada que peça atenção.`
      : `A Redentia olhou ${oQueOlhou(vm.value) ?? 'a carteira'} (${vm.value.olhouEm ?? 'hoje'}) e encontrou ${resumoDosAchados(vm.value)}.`,
    ...vm.value.itens.map((a) => `${a.selo}: ${a.titulo}${a.texto ? ` — ${semValor(a.texto)}` : ''}`),
  ].join('\n'),
}))
/** abrir o chat daqui fecha o modal primeiro (o foco volta ao botão, e o painel o toma) */
function abrirChat(pergunta?: string) {
  fechar()
  painel.abrir(pergunta, [contexto.value])
}
/* o "Perguntar à Redentia" de cada linha (um botão no miolo, ligado pelo data-achado) */
function aoClicarNoMiolo(e: MouseEvent) {
  const b = (e.target as HTMLElement | null)?.closest<HTMLElement>('.cah__perg')
  const a = b?.dataset.achado ? vm.value.itens.find((x) => x.id === b.dataset.achado) : undefined
  if (!a) return
  e.preventDefault()
  abrirChat(semValor(a.pergunta))
}
</script>

<template>
  <TopoBotao
    rotulo="Ideias" :aria-label="rotuloDoBotao" :title="rotuloDoBotao" aria-haspopup="dialog" :aria-expanded="aberto"
    class="cid__b" @click="abrirModal"
  >
    <img src="/logo-azul.svg" alt="" width="16" height="16" class="cid__logo">
    <span v-if="pontos" class="cid__selo">{{ pontos }}</span>
  </TopoBotao>

  <Teleport to="body">
    <div v-if="aberto" class="cid" @click="fechar">
      <div
        ref="cardRef" v-contexto-chat="contexto" class="cid__card cah" role="dialog" aria-modal="true" :aria-labelledby="idTitulo"
        tabindex="-1" data-clarity-mask="true" @click.stop="aoClicarNoMiolo"
      >
        <span class="cid__alca" aria-hidden="true" />
        <div class="cid__cab">
          <p class="cid__assinatura">
            <span class="cid__marca"><img src="/logo-azul.svg" alt="" width="14" height="14">Redentia AI</span>
            <span class="cid__olhou">{{ assinatura }}</span>
          </p>
          <button type="button" class="cid__fechar" aria-label="Fechar" @click="fechar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <h2 :id="idTitulo" class="cid__h2">
          <template v-if="vm.vazio">Nada pede atenção agora</template>
          <template v-for="(p, i) in tituloEmPartes" v-else :key="i">
            <span v-if="p.numero" class="cah__cola"><span class="cah__n" :class="`cah__n--${p.numero}`">{{ p.texto }}</span>{{ p.cola }}</span>
            <template v-else>{{ p.texto }}</template>
          </template>
        </h2>

        <!-- sem nada a apontar, a linha calma é o título e o corpo some -->
        <!-- eslint-disable-next-line vue/no-v-html — achadosHtml escapa tudo antes -->
        <div v-if="html" class="cid__corpo" v-html="html" />

        <div class="cid__pe">
          <AtivoPerguntaChips :perguntas="acoes" tom="claro" :rotulo="null" @perguntar="abrirChat()" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ——— o botão do topo: o losango da marca e o selo da contagem ——— */
.cid__b :deep(.tac__c) { position: relative; }
.cid__logo { filter: brightness(0) invert(1); }
.cid__selo {
  position: absolute; top: -3px; right: -5px; display: grid; place-items: center; min-width: 19px; height: 19px; padding: 0 5px;
  border-radius: var(--nu-r-pill); background: var(--nu-amber-fill); color: var(--nu-navy);
  font-size: var(--nu-fs-xs); font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1;
  box-shadow: 0 0 0 2px var(--nu-navy);
}

/* ——— o modal: o painel de provas do /asset (AcaoCadeiaDetalhe) ——— */
.cid {
  position: fixed; inset: 0; z-index: 9999;
  background: var(--nu-day-backdrop);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 32px;
  animation: cidfade .18s ease;
}
.cid__card {
  position: relative; isolation: isolate;
  width: min(720px, 92vw); max-height: 86vh; overflow: auto; box-sizing: border-box; overscroll-behavior: contain;
  background: var(--nu-day-card); border-radius: var(--nu-r-card-lg);
  padding: 32px 40px 28px; box-shadow: var(--nu-shadow-day-modal);
  animation: cidrise .24s cubic-bezier(.2, .8, .2, 1);
}
.cid__card:focus { outline: none; }
.cid__alca { display: none; }
.cid__cab { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.cid__assinatura { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 10px; margin: 0; min-width: 0; }
.cid__marca {
  display: inline-flex; align-items: center; gap: 7px; height: 28px; padding: 0 12px 0 9px; border-radius: var(--nu-r-pill);
  background: var(--nu-cream); color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap;
}
.cid__olhou { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums; }
.cid__fechar {
  flex: 0 0 auto; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; border: none;
  background: var(--nu-day-close); color: var(--nu-ink); cursor: pointer; transition: background .2s;
}
.cid__fechar:hover { background: var(--nu-day-close-hover); }
.cid__fechar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.cid__h2 { margin: 20px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; line-height: 1.15; text-wrap: pretty; }
.cid__corpo { margin-top: 8px; }
.cid__pe { margin-top: 22px; padding-top: 18px; border-top: 1px solid var(--nu-day-divider); }

/* a contagem do título: os números em destaque, no tom do que contam */
.cah__n {
  display: inline-grid; place-items: center; min-width: 1.4em; height: 1.4em; padding: 0 .36em; margin: 0 .06em 0 0;
  border-radius: var(--nu-r-pill); font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1; vertical-align: .06em;
}
.cah__cola { white-space: nowrap; }
.cah__n--atencao { background: var(--nu-amber-bg); color: var(--nu-amber-text); }

/* ——— as linhas: o acabamento que o dono preferiu (o idioma dos indicadores do /asset) ——— */
.cah :deep(.cah__frase) { margin: 14px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.6; }
.cah :deep(.cah__cols) { display: grid; grid-template-columns: minmax(0, 1fr); gap: 4px; }
.cah :deep(.cah__grupo) { display: flex; align-items: baseline; gap: 8px; margin: 18px 0 4px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 700; }
.cah :deep(.cah__lista) { list-style: none; margin: 0; padding: 0; }
.cah :deep(.cah__item) {
  position: relative; margin: 0 0 -1px; padding: 14px 0 8px;
  border-top: 1px solid var(--nu-cream-line); border-bottom: 1px solid var(--nu-cream-line);
}
.cah :deep(.cah__item::before) {
  content: ''; position: absolute; inset: 0 -12px; z-index: -1; border-radius: 12px;
  background: var(--nu-ink-04); opacity: 0; transition: opacity .2s ease;
}
.cah :deep(.cah__item:hover::before), .cah :deep(.cah__item:focus-within::before) { opacity: 1; }
.cah :deep(.cah__linha) { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin: 0; }
.cah :deep(.cah__t) {
  display: inline-flex; align-items: baseline; gap: 10px; min-width: 0;
  color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; line-height: 1.4;
}
/* o marcador: a cor da gravidade, sempre ao lado de um rótulo (o grupo, o "Vale olhar") */
.cah :deep(.cah__t::before) { content: ''; flex-shrink: 0; width: 8px; height: 8px; border-radius: 50%; background: var(--nu-gray); transform: translateY(-1px); }
.cah :deep(.cah__item--alta .cah__t::before) { background: var(--nu-red-text); }
.cah :deep(.cah__item--media .cah__t::before) { background: var(--nu-amber); }
.cah :deep(.cah__item--forca .cah__t::before) { background: var(--nu-green); }
.cah :deep(.cah__v) { flex-shrink: 0; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 600; font-variant-numeric: tabular-nums; text-align: right; white-space: nowrap; }
.cah :deep(.cah__x) { margin: 4px 0 0 18px; max-width: 72ch; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; font-variant-numeric: tabular-nums; }
.cah :deep(.cah__pe) { display: flex; align-items: center; justify-content: space-between; gap: 4px 16px; flex-wrap: wrap; min-height: 30px; margin: 2px 0 0 18px; }
/* o "Perguntar à Redentia" da linha: surge no hover e no foco */
.cah :deep(.cah__perg) {
  display: inline-flex; align-items: center; gap: 6px; margin-left: auto; padding: 4px 0; border: 0; background: none; cursor: pointer;
  color: var(--nu-blue-text); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap;
  opacity: 0; transform: translateX(-4px); transition: opacity .2s ease, transform .25s cubic-bezier(.22, 1, .36, 1), gap .2s ease, color .2s ease;
}
.cah :deep(.cah__perg::after) {
  content: ''; width: 13px; height: 13px; background: currentColor;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12h13M12 5l7 7-7 7'/%3E%3C/svg%3E") center / contain no-repeat;
}
.cah :deep(.cah__item:hover .cah__perg), .cah :deep(.cah__item:focus-within .cah__perg) { opacity: 1; transform: none; }
.cah :deep(.cah__perg:hover) { gap: 10px; color: var(--nu-blue-hover); }
.cah :deep(.cah__perg:focus-visible) { outline: 2px solid var(--nu-blue); outline-offset: 2px; border-radius: 4px; }
/* sem hover (toque) ou na tela estreita: o "Perguntar" fica à vista */
@media (hover: none), (max-width: 640px) {
  .cah :deep(.cah__perg) { opacity: 1; transform: none; }
}

@keyframes cidfade { from { opacity: 0; } to { opacity: 1; } }
@keyframes cidrise { from { opacity: 0; transform: translateY(14px) scale(.98); } to { opacity: 1; transform: none; } }
@keyframes cidsobe { from { transform: translateY(100%); } to { transform: none; } }

/* ——— no celular: a folha que sobe do pé ——— */
@media (max-width: 640px) {
  .cid { padding: 0; align-items: flex-end; }
  .cid__card {
    width: 100%; max-height: 90vh; max-height: 90dvh; border-radius: var(--nu-r-card-lg) var(--nu-r-card-lg) 0 0;
    padding: 12px 20px calc(20px + env(safe-area-inset-bottom));
    animation: cidsobe .32s cubic-bezier(.2, .8, .2, 1);
  }
  .cid__alca { display: block; width: 40px; height: 4px; margin: 0 auto 14px; border-radius: 2px; background: var(--nu-cream-line); }
  .cid__h2 { margin-top: 16px; font-size: var(--nu-fs-2xl); }
  .cah :deep(.cah__pe) { min-height: 26px; }
  .cah :deep(.cah__perg) { font-size: var(--nu-fs-dense); font-weight: 600; }
}
@media (prefers-reduced-motion: reduce) {
  .cid, .cid__card { animation: none; }
  .cah :deep(.cah__perg), .cah :deep(.cah__item::before) { transition: none; }
}
</style>
