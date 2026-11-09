<script setup lang="ts">
// O painel de preview da nav do header: a lista à esquerda e a vinheta
// à direita (a referência do dono de 20/08, a mesma do NuHeader), com o hover
// em cada item trocando a vinheta. Vai para o <body> e é position: fixed (ver
// useTopo).
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
  background: var(--nu-white); border: 1px solid var(--nu-navy-06); border-radius: var(--nu-r-panel);
  box-shadow: 0 24px 54px -22px rgba(12, 21, 36, 0.32), 0 2px 8px rgba(12, 21, 36, 0.06);
  animation: ntg-entra .22s cubic-bezier(.2, .8, .2, 1) both; transform-origin: top left;
}
@keyframes ntg-entra { from { opacity: 0; transform: translateY(-4px) scale(.985); } to { opacity: 1; transform: none; } }
.ntg__lista { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; padding: 4px; }
.ntg__item { display: flex; flex-direction: column; gap: 3px; padding: 11px 14px; border-radius: 14px; transition: background .15s; }
.ntg__item--quente { background: var(--nu-ink-04); }
.ntg__item:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: -2px; }
.ntg__rotulo { display: inline-flex; align-items: center; gap: 8px; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 800; }
.ntg__item--ativo .ntg__rotulo { color: var(--nu-blue-text); }
.ntg__tag {
  padding: 2px 7px; border-radius: var(--nu-r-pill); background: var(--nu-blue-tint); color: var(--nu-blue-text);
  font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
}
.ntg__desc { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; line-height: 1.4; }
.ntg__vista { width: 400px; min-height: 280px; flex-shrink: 0; border-radius: var(--nu-r-tile); background: var(--nu-cream); position: relative; overflow: hidden; }
.ntgv-enter-active { transition: opacity .3s ease, transform .3s ease; }
.ntgv-leave-active { transition: opacity .16s ease; }
.ntgv-enter-from { opacity: 0; transform: translateY(8px) scale(.985); }
.ntgv-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) { .ntg { animation: none; } }
</style>
