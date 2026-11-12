<script setup lang="ts">
// O menu do celular e do tablet: a tela inteira, branca, com a lista em tipo
// grande separada por fios (a direção "editorial calmo"). A nav (os grupos
// abrem no lugar), a busca, o mercado (slot) e as chamadas da conta no pé.
// Tab preso e foco de volta no hambúrguer (useModalA11y); Escape fecha.
//
// APORTOU (11/11/2026): no site de investidor o menu veste a marca (classe
// ntn--ap): fundo creme da página, o wordmark no topo, itens em 600 com fios de
// 1,5px, a lista entrando em cascata e, no pé, a chamada em pílula carvão com a
// seta ("Criar conta grátis", a mesma do topo). A variante do produto de
// escritório saiu com o B2B em 12/11/2026.
import type { NavItem } from '~/utils/topo'
import { grupoAtivo, rotaAtiva } from '~/utils/topo'

const props = defineProps<{ aberto: boolean; nav: NavItem[]; logado: boolean }>()
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
    <Transition name="ntn">
      <div v-if="aberto" ref="caixa" class="ntn ntn--ap" role="dialog" aria-modal="true" aria-label="Menu" tabindex="-1">
        <div class="ntn__topo">
          <NuTopoMarca class="ntn__marca" @click="emit('fechar')" />
          <button type="button" class="ntn__fechar" aria-label="Fechar menu" @click="emit('fechar')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
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
            <NuBotaoSeta to="/carteira" variante="carvao" tamanho="m" largo @click="emit('fechar')">Minha carteira</NuBotaoSeta>
            <div class="ntn__linha">
              <NuxtLink to="/conta" class="ntn__cta" @click="emit('fechar')">Configurações</NuxtLink>
              <button type="button" class="ntn__cta ntn__cta--sair" @click="emit('sair')">Sair</button>
            </div>
          </template>
          <template v-else>
            <NuBotaoSeta to="/assinar?quiz=1&de=menu" variante="carvao" tamanho="m" largo @click="emit('fechar')">Criar conta grátis</NuBotaoSeta>
            <NuxtLink to="/login" class="ntn__cta" @click="emit('fechar')">Entrar</NuxtLink>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.ntn {
  position: fixed; inset: 0; z-index: 100; display: flex; flex-direction: column;
  background: var(--nu-white); outline: none;
}
/* o topo do menu tem a altura do header do celular, a marca no mesmo lugar */
.ntn__topo {
  display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
  height: 52px; padding: 0 6px 0 16px; border-bottom: 1px solid var(--nu-cream-line);
}
.ntn__marca { gap: 8px; padding: 10px 6px 10px 2px; }
.ntn__fechar {
  width: 44px; height: 44px; border: 0; border-radius: 50%; background: transparent; color: var(--nu-ink);
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .15s;
}
.ntn__fechar:hover { background: var(--nu-cream); }
.ntn__fechar:focus-visible, .ntn__item:focus-visible, .ntn__subitem:focus-visible, .ntn__cta:focus-visible, .ntn__busca:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.ntn__rolo { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 12px 20px 8px; }
.ntn__busca {
  display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 16px; margin-bottom: 6px;
  border-radius: var(--nu-r-pill); background: var(--nu-cream); color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto);
}
.ntn__lista { display: flex; flex-direction: column; }
.ntn__item {
  display: flex; align-items: center; justify-content: space-between; width: 100%; min-height: 54px; padding: 0 2px;
  border: 0; border-bottom: 1px solid var(--nu-cream-line); background: transparent; font-family: inherit; text-align: left; cursor: pointer;
  color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: var(--nu-w-forte); letter-spacing: -0.02em;
}
.ntn__item--ativo { color: var(--nu-blue-text); }
.ntn__chev { color: var(--nu-gray); transition: transform .28s var(--nu-ease-saida); }
.ntn__grupo--aberto .ntn__chev { transform: rotate(180deg); }
.ntn__grupo--aberto .ntn__item--grupo { border-bottom-color: transparent; }
/* o grupo abre no lugar: a altura anima de 0 ao conteúdo (grid 0fr → 1fr) */
.ntn__sub { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .3s var(--nu-ease-saida); }
.ntn__grupo--aberto .ntn__sub { grid-template-rows: 1fr; }
.ntn__sub-dentro { min-height: 0; overflow: hidden; display: flex; flex-direction: column; }
.ntn__grupo--aberto .ntn__sub-dentro { padding-bottom: 8px; border-bottom: 1px solid var(--nu-cream-line); }
.ntn__subitem {
  display: flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 2px 0 14px;
  color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio);
}
.ntn__subitem--ativo { color: var(--nu-blue-text); }
.ntn__tag {
  padding: 2px 7px; border-radius: var(--nu-r-pill); background: var(--nu-blue-tint); color: var(--nu-blue-text);
  font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); letter-spacing: 0.04em; text-transform: uppercase;
}
.ntn__mercado { margin: 18px 0 6px; }
.ntn__pe {
  flex-shrink: 0; display: flex; flex-direction: column; gap: 10px;
  padding: 12px 20px calc(14px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid var(--nu-cream-line);
}
.ntn__linha { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ntn__cta {
  display: flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 20px;
  border: 0; border-radius: var(--nu-r-pill); background: var(--nu-ink-04); color: var(--nu-ink);
  font-family: inherit; font-size: var(--nu-fs-md); font-weight: var(--nu-w-forte); cursor: pointer;
}
.ntn__cta--sair { color: var(--nu-red-text); }
.ntn-enter-active, .ntn-leave-active { transition: opacity .22s ease, transform .3s var(--nu-ease-saida); }
.ntn-enter-from, .ntn-leave-to { opacity: 0; transform: translateY(10px); }
/* no tablet a marca e o fechar seguem o header de lá */
@media (min-width: 641px) {
  .ntn__topo { height: 72px; padding: 0 clamp(16px, 3vw, 40px); }
  .ntn__rolo, .ntn__pe { padding-left: clamp(16px, 3vw, 40px); padding-right: clamp(16px, 3vw, 40px); }
}
@media (prefers-reduced-motion: reduce) {
  .ntn-enter-active, .ntn-leave-active, .ntn__sub, .ntn__chev { transition: none; }
}

/* ——— Aportou: o menu do site de investidor ———
   Robustez (11/11/2026): a coluna é a do site (--nu-coluna), a marca e o
   fechar no mesmo lugar da marca e do hambúrguer do topo; itens em 500 (o
   tamanho faz a hierarquia); o grupo abre como o acordeão da base (a altura em
   --nu-dur-lenta --nu-ease-troca) com os itens em cascata; tudo em token. */
.ntn--ap { background: var(--nu-page); }
.ntn--ap .ntn__topo { padding: 0 max(8px, calc(var(--nu-coluna) - 12px)) 0 var(--nu-coluna); border-bottom: 1px solid var(--nu-line-2); }
.ntn--ap .ntn__marca { padding: 4px 6px 4px 2px; }
.ntn--ap .ntn__marca :deep(svg) { height: 24px; width: auto; }
.ntn--ap .ntn__fechar { transition: background-color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida); }
.ntn--ap .ntn__fechar:hover { background: var(--nu-band); }
.ntn--ap .ntn__fechar:active { transform: scale(.94); }
@media (min-width: 641px) {
  .ntn--ap .ntn__marca { padding: 6px 6px 6px 2px; }
  .ntn--ap .ntn__marca :deep(svg) { height: 30px; }
}
.ntn--ap .ntn__rolo, .ntn--ap .ntn__pe { padding-left: var(--nu-coluna); padding-right: var(--nu-coluna); }
.ntn--ap .ntn__rolo { padding-top: 16px; }
.ntn--ap :is(.ntn__fechar, .ntn__item, .ntn__subitem, .ntn__cta, .ntn__busca):focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 2px; }
.ntn--ap .ntn__busca {
  height: 48px; margin-bottom: 8px; background: var(--nu-band); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto);
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.ntn--ap .ntn__busca:hover { background: var(--nu-cream-2); color: var(--nu-ink); }
.ntn--ap .ntn__busca:active { transform: scale(.99); }
.ntn--ap .ntn__item {
  min-height: 58px; border-bottom: 1px solid var(--nu-line); -webkit-tap-highlight-color: transparent;
  font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-titulo);
  transition: color var(--nu-dur-media) var(--nu-ease-cor), opacity var(--nu-dur-rapida) var(--nu-ease-cor);
}
@media (hover: hover) { .ntn--ap .ntn__item:hover { color: var(--nu-blue-text); } }
.ntn--ap .ntn__item:active { opacity: .7; }
.ntn--ap .ntn__item--ativo { color: var(--nu-blue-text); }
.ntn--ap .ntn__chev { color: var(--nu-ink); transition: transform var(--nu-dur-lenta) var(--nu-ease-troca); }
.ntn--ap .ntn__sub { transition: grid-template-rows var(--nu-dur-lenta) var(--nu-ease-troca); }
.ntn--ap .ntn__grupo--aberto .ntn__item--grupo { border-bottom-color: transparent; }
.ntn--ap .ntn__grupo--aberto .ntn__sub-dentro { border-bottom: 1px solid var(--nu-line); }
.ntn--ap .ntn__subitem {
  min-height: 46px; color: var(--nu-gray-3); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); -webkit-tap-highlight-color: transparent;
  transition: color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-media) var(--nu-ease-saida);
}
@media (hover: hover) { .ntn--ap .ntn__subitem:hover { color: var(--nu-blue-text); transform: translateX(3px); } }
.ntn--ap .ntn__subitem:active { opacity: .7; }
.ntn--ap .ntn__subitem--ativo { color: var(--nu-blue-text); font-weight: var(--nu-w-medio); }
/* o grupo que abre: os itens chegam em cascata de 60ms */
.ntn--ap .ntn__grupo--aberto .ntn__subitem { animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) both; }
.ntn--ap .ntn__grupo--aberto .ntn__subitem:nth-child(2) { animation-delay: var(--nu-passo-cascata); }
.ntn--ap .ntn__grupo--aberto .ntn__subitem:nth-child(3) { animation-delay: calc(var(--nu-passo-cascata) * 2); }
.ntn--ap .ntn__grupo--aberto .ntn__subitem:nth-child(4) { animation-delay: calc(var(--nu-passo-cascata) * 3); }
.ntn--ap .ntn__grupo--aberto .ntn__subitem:nth-child(n+5) { animation-delay: calc(var(--nu-passo-cascata) * 4); }
.ntn--ap .ntn__tag { border-radius: var(--nu-r-tag-p); background: var(--nu-blue-bg); letter-spacing: 0.06em; }
.ntn--ap .ntn__pe { border-top: 1px solid var(--nu-line-2); background: var(--nu-page); }
.ntn--ap .ntn__cta {
  min-height: 52px; background: transparent; box-shadow: inset 0 0 0 1.5px var(--nu-ink);
  font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); -webkit-tap-highlight-color: transparent;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.ntn--ap .ntn__cta:hover { background: var(--nu-band); color: var(--nu-ink); }
.ntn--ap .ntn__cta:active { transform: scale(.98); }
.ntn--ap .ntn__cta--sair { box-shadow: inset 0 0 0 1px var(--nu-line); }
.ntn--ap .ntn__cta--sair:hover { background: var(--nu-red-bg); color: var(--nu-red-text); }
/* a entrada: o fundo surge, a lista sobe em cascata de 60ms e o pé sobe por último; sair é mais rápido */
.ntn--ap.ntn-enter-active { transition: opacity var(--nu-dur-media) var(--nu-ease-cor); }
.ntn--ap.ntn-enter-from { transform: none; }
.ntn--ap.ntn-leave-active { transition: opacity var(--nu-dur-rapida) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-cor); }
.ntn--ap.ntn-leave-to { transform: translateY(6px); }
.ntn--ap .ntn__busca, .ntn--ap .ntn__lista > *, .ntn--ap .ntn__mercado { animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) both; }
.ntn--ap .ntn__lista > :nth-child(1) { animation-delay: var(--nu-passo-cascata); }
.ntn--ap .ntn__lista > :nth-child(2) { animation-delay: calc(var(--nu-passo-cascata) * 2); }
.ntn--ap .ntn__lista > :nth-child(3) { animation-delay: calc(var(--nu-passo-cascata) * 3); }
.ntn--ap .ntn__lista > :nth-child(4) { animation-delay: calc(var(--nu-passo-cascata) * 4); }
.ntn--ap .ntn__lista > :nth-child(5) { animation-delay: calc(var(--nu-passo-cascata) * 5); }
.ntn--ap .ntn__lista > :nth-child(n+6) { animation-delay: calc(var(--nu-passo-cascata) * 6); }
.ntn--ap .ntn__mercado { animation-delay: calc(var(--nu-passo-cascata) * 7); }
.ntn--ap .ntn__pe { animation: nu-subir var(--nu-dur-lenta) var(--nu-ease-saida) calc(var(--nu-passo-cascata) * 2) both; }
@media (prefers-reduced-motion: reduce) {
  .ntn--ap .ntn__busca, .ntn--ap .ntn__lista > *, .ntn--ap .ntn__mercado, .ntn--ap .ntn__pe, .ntn--ap .ntn__grupo--aberto .ntn__subitem { animation: none; }
}
</style>
