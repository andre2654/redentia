<script setup lang="ts">
// O painel de preview da nav do header: a lista à esquerda e a vinheta
// à direita (a referência do dono de 20/08, a mesma do NuHeader), com o hover
// em cada item trocando a vinheta. Vai para o <body> e é position: fixed (ver
// useTopo).
// APORTOU (11/11/2026): cartão creme com fio de 1,5px; o painel surge e o miolo
// sobe (nu-surgir / nu-subir), sem mexer a caixa (o ponteiro não perde o painel).
// ROBUSTEZ (11/11/2026): o painel fica montado e a transição mora aqui dentro
// (o NuHeader passa `item`, o rótulo do grupo aberto, ou null). Entra na curva
// de saída (opacidade em --nu-dur-media, 8px de subida em --nu-dur-lenta) e sai
// mais rápido (--nu-dur-rapida). Trocar de grupo troca o painel inteiro (a
// chave é o item): o de antes some rápido enquanto o novo chega do gatilho
// dele. A sombra é a de painel (--nu-shadow-float), o raio de dentro é o de
// fora menos o respiro (22 − 10 = 12) e o item sob o ponteiro mostra a seta.
import type { NavChild } from '~/utils/topo'
import { rotaAtiva } from '~/utils/topo'

const props = defineProps<{ item: string | null; filhos: NavChild[]; left: number; top: number; quente: NavChild | null }>()
const emit = defineEmits<{ quente: [NavChild]; entra: []; sai: []; fechar: []; tecla: [KeyboardEvent] }>()
const route = useRoute()
const ativo = (to: string) => rotaAtiva(route.path, to)
const unico = computed(() => props.filhos.length === 1)
/** o painel que está saindo deixa de contar como painel (teclado e clique fora só veem o novo) */
function soltar(el: Element) { el.removeAttribute('data-topo-painel') }
</script>

<template>
  <Teleport to="body">
    <Transition name="ntg" @before-leave="soltar">
      <div
        v-if="item" :key="item"
        class="ntg" :class="{ 'ntg--unico': unico }" role="menu" data-topo-painel @keydown="emit('tecla', $event)"
        :style="{ left: `${left}px`, top: `${top}px` }"
        @mouseenter="emit('entra')" @mouseleave="emit('sai')"
      >
        <div class="ntg__lista">
          <NuxtLink
            v-for="c in filhos" :key="c.to" :to="c.to" role="menuitem" class="ntg__item"
            :class="{ 'ntg__item--quente': quente?.to === c.to, 'ntg__item--ativo': ativo(c.to) }"
            @mouseenter="emit('quente', c)" @focus="emit('quente', c)" @click="emit('fechar')"
          >
            <span class="ntg__rotulo">{{ c.label }}<span v-if="c.tag" class="ntg__tag">{{ c.tag }}</span><svg class="ntg__seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" /></svg></span>
            <span class="ntg__desc">{{ c.desc }}</span>
          </NuxtLink>
        </div>
        <div class="ntg__vista" aria-hidden="true">
          <Transition name="ntgv">
            <NuNavVignette :key="quente?.vig ?? ''" :name="quente?.vig ?? ''" />
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.ntg {
  position: fixed; z-index: 60; width: 700px; padding: 10px;
  display: flex; align-items: stretch; gap: 10px;
  background: var(--nu-page); border-radius: var(--nu-r-panel);
  box-shadow: var(--nu-shadow-float);
  transform-origin: 48px 0;
}
.ntg__lista { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
/* um item só (Teses, Carteira): o item fica no meio da altura da vinheta, sem um vão embaixo */
.ntg--unico .ntg__lista { justify-content: center; }
.ntg__item {
  position: relative; display: flex; flex-direction: column; gap: 3px; padding: 12px 14px; border-radius: var(--nu-r-chip);
  transition: background-color var(--nu-dur-rapida) var(--nu-ease-cor);
}
.ntg__item--quente { background: var(--nu-band); }
.ntg__item:active { background: var(--nu-cream-2); }
.ntg__item:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: -3px; }
.ntg__rotulo {
  display: flex; align-items: center; gap: 8px; color: var(--nu-ink);
  font-size: 15px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto);
}
.ntg__item--ativo .ntg__rotulo { color: var(--nu-blue-text); }
.ntg__tag {
  padding: 3px 8px; border-radius: var(--nu-r-tag-p); background: var(--nu-blue-bg); color: var(--nu-blue-text);
  font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); letter-spacing: 0.06em; text-transform: uppercase;
}
.ntg__desc { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.4; }
/* o item sob o ponteiro mostra a seta (o que é clicável parece clicável) */
.ntg__seta {
  flex: none; width: 16px; height: 16px; margin-left: auto; color: var(--nu-ink);
  opacity: 0; transform: translateX(-4px);
  transition: opacity var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-media) var(--nu-ease-saida);
}
.ntg__item--quente .ntg__seta { opacity: 1; transform: none; }
.ntg__vista { width: 400px; min-height: 280px; flex-shrink: 0; border-radius: var(--nu-r-chip); background: var(--nu-band); position: relative; overflow: hidden; }

/* a entrada: a caixa surge e sobe 8px do gatilho; a vinheta chega 60ms depois */
.ntg-enter-active { transition: opacity var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-lenta) var(--nu-ease-saida); }
.ntg-enter-active .ntg__vista { animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) var(--nu-passo-cascata) both; }
.ntg-enter-from { opacity: 0; transform: translateY(8px) scale(.985); }
/* a saída: mais rápida, sem pegar o ponteiro no caminho */
.ntg-leave-active { pointer-events: none; transition: opacity var(--nu-dur-rapida) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-cor); }
.ntg-leave-to { opacity: 0; transform: translateY(4px); }

/* a troca de vinheta dentro do painel */
.ntgv-enter-active { transition: opacity var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-media) var(--nu-ease-saida); }
.ntgv-leave-active { transition: opacity var(--nu-dur-rapida) var(--nu-ease-cor); }
.ntgv-enter-from { opacity: 0; transform: translateY(8px) scale(.985); }
.ntgv-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .ntg-enter-active, .ntg-leave-active, .ntgv-enter-active, .ntgv-leave-active, .ntg__seta { transition: none; }
  .ntg-enter-active .ntg__vista { animation: none; }
}
</style>
