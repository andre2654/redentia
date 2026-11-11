<script setup lang="ts">
// O painel de preview da nav do header: a lista à esquerda e a vinheta
// à direita (a referência do dono de 20/08, a mesma do NuHeader), com o hover
// em cada item trocando a vinheta. Vai para o <body> e é position: fixed (ver
// useTopo).
// APORTOU (11/11/2026): cartão creme com fio de 1,5px; o painel surge e o miolo
// sobe (nu-surgir / nu-subir), sem mexer a caixa (o ponteiro não perde o painel).
import type { NavChild } from '~/utils/topo'
import { rotaAtiva } from '~/utils/topo'

const props = defineProps<{ filhos: NavChild[]; left: number; top: number; quente: NavChild | null }>()
const emit = defineEmits<{ quente: [NavChild]; entra: []; sai: []; fechar: []; tecla: [KeyboardEvent] }>()
const route = useRoute()
const ativo = (to: string) => rotaAtiva(route.path, to)
const unico = computed(() => props.filhos.length === 1)
</script>

<template>
  <Teleport to="body">
    <div
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
          <span class="ntg__rotulo">{{ c.label }}<span v-if="c.tag" class="ntg__tag">{{ c.tag }}</span></span>
          <span class="ntg__desc">{{ c.desc }}</span>
        </NuxtLink>
      </div>
      <div class="ntg__vista" aria-hidden="true">
        <Transition name="ntgv">
          <NuNavVignette :key="quente?.vig ?? ''" :name="quente?.vig ?? ''" />
        </Transition>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.ntg {
  position: fixed; z-index: 60; width: 700px; padding: 8px;
  display: flex; align-items: stretch; gap: 8px;
  background: var(--nu-page); border-radius: var(--nu-r-panel);
  box-shadow: 0 0 0 1.5px var(--nu-line-2), var(--nu-shadow-card);
  animation: nu-surgir .2s ease both;
}
.ntg__lista { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; padding: 4px; animation: nu-subir .32s cubic-bezier(.2, .8, .2, 1) both; }
.ntg__item { display: flex; flex-direction: column; gap: 3px; padding: 12px 14px; border-radius: var(--nu-r-tile); transition: background .15s; }
.ntg__item--quente { background: var(--nu-band); }
.ntg__item:focus-visible { outline-offset: -3px; }
.ntg__rotulo { display: inline-flex; align-items: center; gap: 8px; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; }
.ntg__item--ativo .ntg__rotulo { color: var(--nu-blue-text); }
.ntg__tag {
  padding: 3px 8px; border-radius: var(--nu-r-tag); background: var(--nu-blue-bg); color: var(--nu-blue-text);
  font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
}
.ntg__desc { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.4; }
.ntg__vista { width: 400px; min-height: 280px; flex-shrink: 0; border-radius: var(--nu-r-tile); background: var(--nu-band); position: relative; overflow: hidden; animation: nu-subir .32s cubic-bezier(.2, .8, .2, 1) .04s both; }
.ntgv-enter-active { transition: opacity .3s ease, transform .3s ease; }
.ntgv-leave-active { transition: opacity .16s ease; }
.ntgv-enter-from { opacity: 0; transform: translateY(8px) scale(.985); }
.ntgv-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) { .ntg, .ntg__lista, .ntg__vista { animation: none; } }
</style>
