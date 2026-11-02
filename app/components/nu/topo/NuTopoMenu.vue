<script setup lang="ts">
// O menu do celular e do tablet nos topos novos. Três formas, uma por direção:
// - 'cartao': um cartão de vidro que cai do topo, com a página desfocada atrás;
// - 'folha': a folha do iOS que sobe do pé, com a alça;
// - 'tela': a tela inteira, branca, com a lista em tipo grande e fios.
// O conteúdo é o mesmo: a nav (grupos abrem no lugar), o mercado (slot) e as
// chamadas da conta. Tab preso e foco de volta no hambúrguer (useModalA11y);
// Escape e o fundo fecham.
import type { NavItem } from '~/utils/topo'
import { grupoAtivo, rotaAtiva } from '~/utils/topo'

const props = defineProps<{ aberto: boolean; forma: 'cartao' | 'folha' | 'tela'; nav: NavItem[]; logado: boolean }>()
const emit = defineEmits<{ fechar: []; sair: [] }>()
const route = useRoute()
const ativo = (to: string) => rotaAtiva(route.path, to)
const paiAtivo = (i: NavItem) => grupoAtivo(route.path, i)

const caixa = ref<HTMLElement | null>(null)
const aberto = computed(() => props.aberto)
useModalA11y(caixa, aberto)
const grupo = ref<string | null>(null)
watch(aberto, (a) => { if (!a) grupo.value = null })

function tecla(e: KeyboardEvent) { if (e.key === 'Escape') emit('fechar') }
watch(aberto, (a) => {
  if (!import.meta.client) return
  if (a) document.addEventListener('keydown', tecla)
  else document.removeEventListener('keydown', tecla)
})
onBeforeUnmount(() => { if (import.meta.client) document.removeEventListener('keydown', tecla) })
</script>

<template>
  <Teleport to="body">
    <Transition :name="`ntn-${forma}`">
      <div v-if="aberto" class="ntn" :class="`ntn--${forma}`">
        <div class="ntn__fundo" aria-hidden="true" @click="emit('fechar')" />
        <div ref="caixa" class="ntn__caixa" role="dialog" aria-modal="true" aria-label="Menu" tabindex="-1">
          <div v-if="forma === 'folha'" class="ntn__alca" aria-hidden="true" />
          <div class="ntn__topo">
            <NuTopoMarca @click="emit('fechar')" />
            <button type="button" class="ntn__fechar" aria-label="Fechar menu" @click="emit('fechar')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>

          <div class="ntn__rolo">
            <NuxtLink to="/busca" class="ntn__busca" @click="emit('fechar')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" /></svg>
              Buscar ativo, tese ou guia
            </NuxtLink>

            <nav class="ntn__lista" aria-label="Principal">
              <template v-for="item in nav" :key="item.label">
                <NuxtLink
                  v-if="item.to" :to="item.to" class="ntn__item" :class="{ 'ntn__item--ativo': ativo(item.to) }"
                  :aria-current="ativo(item.to) ? 'page' : undefined" @click="emit('fechar')"
                >
                  {{ item.label }}
                </NuxtLink>
                <div v-else class="ntn__grupo" :class="{ 'ntn__grupo--aberto': grupo === item.label }">
                  <button
                    type="button" class="ntn__item ntn__item--grupo" :class="{ 'ntn__item--ativo': paiAtivo(item) }"
                    :aria-expanded="grupo === item.label" @click="grupo = grupo === item.label ? null : item.label"
                  >
                    {{ item.label }}
                    <svg class="ntn__chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                  </button>
                  <div class="ntn__sub" :inert="grupo !== item.label || undefined">
                    <div class="ntn__sub-dentro">
                      <NuxtLink
                        v-for="c in item.children" :key="c.to" :to="c.to" class="ntn__subitem"
                        :class="{ 'ntn__subitem--ativo': ativo(c.to) }" @click="emit('fechar')"
                      >
                        {{ c.label }}<span v-if="c.tag" class="ntn__tag">{{ c.tag }}</span>
                      </NuxtLink>
                    </div>
                  </div>
                </div>
              </template>
            </nav>

            <div v-if="$slots.mercado" class="ntn__mercado"><slot name="mercado" /></div>
          </div>

          <div class="ntn__pe">
            <template v-if="logado">
              <NuxtLink to="/carteira" class="ntn__cta ntn__cta--cheio" @click="emit('fechar')">Minha carteira</NuxtLink>
              <div class="ntn__linha">
                <NuxtLink to="/conta" class="ntn__cta" @click="emit('fechar')">Configurações</NuxtLink>
                <button type="button" class="ntn__cta ntn__cta--sair" @click="emit('sair')">Sair</button>
              </div>
            </template>
            <template v-else>
              <NuxtLink to="/assinar?quiz=1&de=menu" class="ntn__cta ntn__cta--cheio" @click="emit('fechar')">Conectar carteira</NuxtLink>
              <NuxtLink to="/login" class="ntn__cta" @click="emit('fechar')">Entrar</NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.ntn { position: fixed; inset: 0; z-index: 100; }
.ntn__fundo { position: absolute; inset: 0; background: var(--nu-veil); }
.ntn__caixa {
  position: absolute; display: flex; flex-direction: column; background: var(--nu-white); outline: none;
  overflow: hidden;
}
.ntn__topo { display: flex; align-items: center; justify-content: space-between; padding: 14px 14px 6px 20px; flex-shrink: 0; }
.ntn__fechar {
  width: 40px; height: 40px; border: 0; border-radius: 50%; background: var(--nu-ink-04); color: var(--nu-ink);
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .15s;
}
.ntn__fechar:hover { background: var(--nu-ink-10); }
.ntn__fechar:focus-visible, .ntn__item:focus-visible, .ntn__subitem:focus-visible, .ntn__cta:focus-visible, .ntn__busca:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.ntn__rolo { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 8px 20px 8px; }
.ntn__busca {
  display: flex; align-items: center; gap: 10px; height: 46px; padding: 0 16px; margin: 4px 0 10px;
  border-radius: var(--nu-r-pill); background: var(--nu-cream); color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 500;
}
.ntn__lista { display: flex; flex-direction: column; }
.ntn__item {
  display: flex; align-items: center; justify-content: space-between; width: 100%; min-height: 52px; padding: 0 2px;
  border: 0; background: transparent; font-family: inherit; text-align: left; cursor: pointer;
  color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.02em;
}
.ntn__item--ativo { color: var(--nu-blue-text); }
.ntn__chev { color: var(--nu-gray); transition: transform .28s cubic-bezier(.2, .8, .2, 1); }
.ntn__grupo--aberto .ntn__chev { transform: rotate(180deg); }
/* o grupo abre no lugar: a altura anima de 0 ao conteúdo (grid 0fr → 1fr) */
.ntn__sub { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .3s cubic-bezier(.2, .8, .2, 1); }
.ntn__grupo--aberto .ntn__sub { grid-template-rows: 1fr; }
.ntn__sub-dentro { min-height: 0; overflow: hidden; display: flex; flex-direction: column; }
.ntn__grupo--aberto .ntn__sub-dentro { padding-bottom: 8px; }
.ntn__subitem {
  display: flex; align-items: center; gap: 8px; min-height: 42px; padding: 0 2px 0 14px;
  color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 700;
}
.ntn__subitem--ativo { color: var(--nu-blue-text); }
.ntn__tag {
  padding: 2px 7px; border-radius: var(--nu-r-pill); background: var(--nu-blue-tint); color: var(--nu-blue-text);
  font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
}
.ntn__mercado { margin: 14px 0 6px; padding: 14px 14px 12px; border-radius: var(--nu-r-tile); background: var(--nu-cream); }
.ntn__pe { flex-shrink: 0; display: flex; flex-direction: column; gap: 10px; padding: 12px 20px calc(16px + env(safe-area-inset-bottom, 0px)); }
.ntn__linha { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ntn__cta {
  display: flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 20px;
  border: 0; border-radius: var(--nu-r-pill); background: var(--nu-ink-04); color: var(--nu-ink);
  font-family: inherit; font-size: var(--nu-fs-md); font-weight: 800; cursor: pointer;
}
.ntn__cta--cheio { background: var(--nu-blue); color: var(--nu-white); }
.ntn__cta--sair { color: var(--nu-red-text); }

/* ——— cartão de vidro (direção 1) ——— */
.ntn--cartao .ntn__fundo { background: var(--nu-ink-14); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
.ntn--cartao .ntn__caixa {
  top: 8px; left: 8px; right: 8px; max-height: calc(100dvh - 16px);
  border-radius: 28px; background: var(--nu-white-90);
  backdrop-filter: blur(28px) saturate(1.8); -webkit-backdrop-filter: blur(28px) saturate(1.8);
  box-shadow: 0 30px 64px -24px rgba(12, 21, 36, 0.4); border: 1px solid var(--nu-white-60);
  transform-origin: top right;
}
.ntn--cartao .ntn__mercado { background: var(--nu-ink-04); }
@media (min-width: 640px) { .ntn--cartao .ntn__caixa { left: auto; width: 420px; } }
.ntn-cartao-enter-active, .ntn-cartao-leave-active { transition: opacity .24s ease; }
.ntn-cartao-enter-active .ntn__caixa, .ntn-cartao-leave-active .ntn__caixa { transition: transform .32s cubic-bezier(.2, .8, .2, 1), opacity .24s ease; }
.ntn-cartao-enter-from, .ntn-cartao-leave-to { opacity: 0; }
.ntn-cartao-enter-from .ntn__caixa, .ntn-cartao-leave-to .ntn__caixa { transform: translateY(-10px) scale(.96); opacity: 0; }

/* ——— folha do iOS (direção 2) ——— */
.ntn--folha .ntn__caixa {
  left: 0; right: 0; bottom: 0; max-height: 90dvh; border-radius: 28px 28px 0 0;
  box-shadow: 0 -20px 60px -20px rgba(12, 21, 36, 0.35);
}
@media (min-width: 640px) { .ntn--folha .ntn__caixa { left: 50%; right: auto; width: 560px; margin-left: -280px; } }
.ntn__alca { width: 38px; height: 5px; margin: 8px auto 0; border-radius: 3px; background: var(--nu-ink-14); flex-shrink: 0; }
.ntn--folha .ntn__topo { padding-top: 8px; }
.ntn-folha-enter-active, .ntn-folha-leave-active { transition: opacity .3s ease; }
.ntn-folha-enter-active .ntn__caixa, .ntn-folha-leave-active .ntn__caixa { transition: transform .38s cubic-bezier(.2, .8, .2, 1); }
.ntn-folha-enter-from, .ntn-folha-leave-to { opacity: 0; }
.ntn-folha-enter-from .ntn__caixa, .ntn-folha-leave-to .ntn__caixa { transform: translateY(100%); }

/* ——— tela inteira (direção 3) ——— */
.ntn--tela .ntn__fundo { display: none; }
.ntn--tela .ntn__caixa { inset: 0; }
.ntn--tela .ntn__topo { height: 64px; padding: 0 12px 0 20px; border-bottom: 1px solid var(--nu-cream-line); }
.ntn--tela .ntn__item { min-height: 60px; font-size: var(--nu-fs-2xl); border-bottom: 1px solid var(--nu-cream-line); }
.ntn--tela .ntn__grupo--aberto .ntn__item--grupo { border-bottom-color: transparent; }
.ntn--tela .ntn__grupo--aberto .ntn__sub-dentro { border-bottom: 1px solid var(--nu-cream-line); padding-bottom: 10px; }
.ntn--tela .ntn__busca { margin-top: 14px; }
.ntn--tela .ntn__mercado { background: transparent; padding: 4px 2px 0; border-radius: 0; }
.ntn--tela .ntn__pe { border-top: 1px solid var(--nu-cream-line); }
.ntn-tela-enter-active, .ntn-tela-leave-active { transition: opacity .22s ease, transform .3s cubic-bezier(.2, .8, .2, 1); }
.ntn-tela-enter-from, .ntn-tela-leave-to { opacity: 0; transform: translateY(12px); }

@media (prefers-reduced-motion: reduce) {
  .ntn__caixa, .ntn__sub, .ntn__chev { transition: none !important; }
  [class*='ntn-'][class*='-active'], [class*='ntn-'][class*='-active'] .ntn__caixa { transition: opacity .01s !important; }
}
</style>
