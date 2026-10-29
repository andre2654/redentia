<script setup lang="ts">
// Painel de uma ligação da cadeia de fornecimento (abre ao clicar na etiqueta
// do grafo: o valor ou "Indisponível"). Nos nós de resto ("Outros clientes",
// "Restante do custo") mostra a conta — total da DFP − listadas = resto. Mostra o que circula inteiro, cada
// valor com quem o informou e as provas — o trecho literal do documento, a
// data e o link. Sem valor, diz isso com todas as letras: a ligação existe
// pelas provas, o número é que nenhuma fonte deu.
//
// Chrome copiado do NuDayModal: Teleport pro body só depois do clique (nada
// no SSR), trap de Tab + foco devolvido (useModalA11y), Escape, clique fora e
// scroll-lock do <html>. Componente burro: o VM vem pronto do useAcao.
import type { AcaoCadeiaDetalheVM } from '~/types/acao'

const props = defineProps<{ detalhe: AcaoCadeiaDetalheVM | null }>()
const emit = defineEmits<{ close: [] }>()

const open = computed(() => props.detalhe !== null)
const cardRef = ref<HTMLElement | null>(null)
useModalA11y(cardRef, open)
const titleId = useId()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
watch(open, (o) => {
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
</script>

<template>
  <Teleport to="body">
    <div v-if="detalhe" class="acx" @click="emit('close')">
      <div
        ref="cardRef"
        class="acx__card"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
        @click.stop
      >
        <div class="acx__head">
          <div>
            <div class="acx__eyebrow">Cadeia de fornecimento</div>
            <h4 :id="titleId" class="acx__title">{{ detalhe.titulo }}</h4>
            <p v-if="detalhe.oQue" class="acx__oque">{{ detalhe.oQue }}</p>
          </div>
          <button type="button" class="acx__close" aria-label="Fechar" @click="emit('close')">✕</button>
        </div>

        <div class="acx__divider" />

        <div class="acx__label">Valor</div>
        <!-- nó de resto: a conta que dá o número, com a fonte do total -->
        <template v-if="detalhe.conta">
          <ol class="acx__conta">
            <li v-for="(c, i) in detalhe.conta" :key="i" :class="{ 'acx__conta--total': c.sinal === '=' }">
              <span class="acx__sinal">{{ c.sinal }}</span>
              <span class="acx__crot">{{ c.rotulo }}</span>
              <span class="acx__cval">{{ c.valor }}</span>
            </li>
          </ol>
          <p v-if="detalhe.nota" class="acx__nota">{{ detalhe.nota }}</p>
          <p v-if="detalhe.fonteConta" class="acx__nota">
            Fonte do total:
            <a :href="detalhe.fonteConta.url" target="_blank" rel="noopener noreferrer" class="acx__link acx__link--inline">{{ detalhe.fonteConta.rotulo }} ↗</a>
          </p>
        </template>
        <ul v-else-if="detalhe.valores.length" class="acx__valores">
          <li v-for="(v, i) in detalhe.valores" :key="i">
            <span class="acx__num">{{ v.valor }}</span>
            <span class="acx__quando">{{ v.quando }}</span>
            <span v-if="v.por" class="acx__por">{{ v.por }}</span>
          </li>
        </ul>
        <p v-else class="acx__indisp">
          <span class="acx__num">Indisponível</span>
          <span class="acx__por">Nenhuma das fontes diz quanto. A ligação está provada pelos documentos abaixo; o valor não é estimado.</span>
        </p>

        <div v-if="detalhe.provas.length" class="acx__label acx__label--provas">{{ detalhe.provas.length > 1 ? 'Provas' : 'Prova' }}</div>
        <ol v-if="detalhe.provas.length" class="acx__provas">
          <li v-for="(p, i) in detalhe.provas" :key="i" class="acx__prova">
            <div class="acx__meta">
              <span class="acx__fonte">{{ p.fonte }}</span>
              <span v-if="p.data"> · {{ p.data }}</span>
              <span v-if="p.por"> · da {{ p.por }}</span>
            </div>
            <blockquote class="acx__trecho">
              “{{ p.trecho }}”
              <span v-if="p.emIngles" class="acx__lang">trecho original, em inglês</span>
            </blockquote>
            <div class="acx__rodape">
              <span v-if="p.valor" class="acx__pvalor">{{ p.valor }}</span>
              <a :href="p.url" target="_blank" rel="noopener noreferrer" class="acx__link">Abrir documento ↗</a>
            </div>
          </li>
        </ol>

        <div class="acx__foot">
          <button type="button" class="acx__done" @click="emit('close')">Fechar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.acx {
  position: fixed; inset: 0; z-index: 9999;
  background: var(--nu-day-backdrop);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 32px;
  animation: acxfade .18s ease;
}
.acx__card {
  width: min(680px, 92vw); max-height: 86vh; overflow: auto; box-sizing: border-box;
  background: var(--nu-day-card); border-radius: var(--nu-r-card-lg);
  padding: 40px 44px 36px; box-shadow: var(--nu-shadow-day-modal);
  animation: acxrise .24s cubic-bezier(.2, .8, .2, 1);
}
.acx__card:focus { outline: none; }
.acx__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
.acx__eyebrow { color: var(--nu-blue-text); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase; }
.acx__title { margin: 9px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; line-height: 1.08; }
.acx__oque { margin: 8px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.45; }
.acx__close {
  flex: 0 0 auto; width: 40px; height: 40px; border-radius: 50%; border: none;
  background: var(--nu-day-close); color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800;
  cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .2s;
}
.acx__close:hover { background: var(--nu-day-close-hover); }
.acx__divider { height: 1px; background: var(--nu-day-divider); margin: 24px 0; }

.acx__label { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }
.acx__label--provas { margin-top: 28px; }

.acx__valores { list-style: none; margin: 10px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.acx__valores li, .acx__indisp { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; }
.acx__indisp { margin: 10px 0 0; }
.acx__num { color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.acx__quando { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; }
.acx__por { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.acx__indisp .acx__por { flex-basis: 100%; }

.acx__conta { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.acx__conta li { display: grid; grid-template-columns: 18px minmax(0, 1fr) auto; align-items: baseline; gap: 8px; }
.acx__sinal { color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 700; }
.acx__crot { color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; }
.acx__cval { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; text-align: right; }
.acx__conta--total { margin-top: 4px; padding-top: 10px; border-top: 1px solid var(--nu-day-divider); }
.acx__conta--total .acx__crot { color: var(--nu-ink); font-weight: 700; }
.acx__conta--total .acx__cval { font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.02em; }
.acx__nota { margin: 12px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.acx__link--inline { margin-left: 0; }
.acx__provas { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.acx__prova { background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 16px 18px; }
.acx__meta { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; }
.acx__fonte { color: var(--nu-ink); font-weight: 700; }
.acx__trecho {
  margin: 10px 0 0; padding: 0 0 0 12px; border-left: 2px solid var(--nu-navy-14);
  color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55;
  overflow-wrap: anywhere;
}
.acx__lang { display: block; margin-top: 6px; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; }
.acx__rodape { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 16px; margin-top: 12px; }
.acx__pvalor { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.acx__link { margin-left: auto; color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 700; }
.acx__link:hover { text-decoration: underline; }

.acx__foot { display: flex; justify-content: flex-end; margin-top: 26px; }
.acx__done {
  background: var(--nu-ink); color: var(--nu-white); border: none; border-radius: var(--nu-r-pill);
  padding: 13px 24px; font-size: var(--nu-fs-md); font-weight: 800; cursor: pointer; transition: background .2s;
}
.acx__done:hover { background: var(--nu-ink-hover); }
@keyframes acxfade { from { opacity: 0; } to { opacity: 1; } }
@keyframes acxrise { from { opacity: 0; transform: translateY(14px) scale(.98); } to { opacity: 1; transform: none; } }
@media (max-width: 760px) {
  .acx { padding: 14px; align-items: flex-end; }
  .acx__card { width: 100%; max-height: 88vh; padding: 28px 22px 24px; }
}
@media (prefers-reduced-motion: reduce) {
  .acx, .acx__card { animation: none; }
}
</style>
