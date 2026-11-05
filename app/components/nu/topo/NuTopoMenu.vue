<script setup lang="ts">
// O menu do celular e do tablet: a tela inteira, branca, com a lista em tipo
// grande separada por fios (a direção "editorial calmo"). A nav (os grupos
// abrem no lugar), a busca, o mercado (slot) e as chamadas da conta no pé.
// Tab preso e foco de volta no hambúrguer (useModalA11y); Escape fecha.
import type { NavItem } from '~/utils/topo'
import { grupoAtivo, rotaAtiva } from '~/utils/topo'

// `variante="business"` (04/11/2026): a marca For Business, sem a busca de
// ativo, e no pé "Falar com a gente" e "Entrar" (ou "Minha conta") do Business.
// `bizNova` (05/11/2026, só no dev por ?biz=): o pé do print, "Testar com
// carteira demo" (o mesmo cadastro do Entrar) e "Agendar 1 hora" (#contato).
const props = defineProps<{ aberto: boolean; nav: NavItem[]; logado: boolean; variante?: 'business'; bizNova?: boolean }>()
const destinoCadastro = useDestinoCadastroBusiness()
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
      <div v-if="aberto" ref="caixa" class="ntn" role="dialog" aria-modal="true" aria-label="Menu" tabindex="-1">
        <div class="ntn__topo">
          <NuTopoMarca class="ntn__marca" :business="variante === 'business'" @click="emit('fechar')" />
          <button type="button" class="ntn__fechar" aria-label="Fechar menu" @click="emit('fechar')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div class="ntn__rolo">
          <NuxtLink v-if="variante !== 'business'" to="/busca" class="ntn__busca" @click="emit('fechar')">
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

        <div v-if="variante === 'business' && bizNova" class="ntn__pe">
          <NuxtLink :to="logado ? '/business/chaves' : destinoCadastro" class="ntn__cta ntn__cta--cheio" @click="emit('fechar')">{{ logado ? 'Minha conta' : 'Testar com carteira demo' }}</NuxtLink>
          <NuxtLink to="/business#contato" class="ntn__cta" @click="emit('fechar')">Agendar 1 hora</NuxtLink>
        </div>
        <div v-else-if="variante === 'business'" class="ntn__pe">
          <NuxtLink to="/business#contato" class="ntn__cta ntn__cta--cheio" @click="emit('fechar')">Falar com a gente</NuxtLink>
          <NuxtLink :to="logado ? '/business/chaves' : destinoCadastro" class="ntn__cta" @click="emit('fechar')">{{ logado ? 'Minha conta' : 'Entrar' }}</NuxtLink>
        </div>
        <div v-else class="ntn__pe">
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
.ntn__marca :deep(.ntm__marca) { width: 22px; height: 22px; }
.ntn__marca :deep(.ntm__nome) { font-size: var(--nu-fs-md); }
.ntn__fechar {
  width: 44px; height: 44px; border: 0; border-radius: 50%; background: transparent; color: var(--nu-ink);
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .15s;
}
.ntn__fechar:hover { background: var(--nu-cream); }
.ntn__fechar:focus-visible, .ntn__item:focus-visible, .ntn__subitem:focus-visible, .ntn__cta:focus-visible, .ntn__busca:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.ntn__rolo { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 12px 20px 8px; }
.ntn__busca {
  display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 16px; margin-bottom: 6px;
  border-radius: var(--nu-r-pill); background: var(--nu-cream); color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 500;
}
.ntn__lista { display: flex; flex-direction: column; }
.ntn__item {
  display: flex; align-items: center; justify-content: space-between; width: 100%; min-height: 54px; padding: 0 2px;
  border: 0; border-bottom: 1px solid var(--nu-cream-line); background: transparent; font-family: inherit; text-align: left; cursor: pointer;
  color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.02em;
}
.ntn__item--ativo { color: var(--nu-blue-text); }
.ntn__chev { color: var(--nu-gray); transition: transform .28s cubic-bezier(.2, .8, .2, 1); }
.ntn__grupo--aberto .ntn__chev { transform: rotate(180deg); }
.ntn__grupo--aberto .ntn__item--grupo { border-bottom-color: transparent; }
/* o grupo abre no lugar: a altura anima de 0 ao conteúdo (grid 0fr → 1fr) */
.ntn__sub { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .3s cubic-bezier(.2, .8, .2, 1); }
.ntn__grupo--aberto .ntn__sub { grid-template-rows: 1fr; }
.ntn__sub-dentro { min-height: 0; overflow: hidden; display: flex; flex-direction: column; }
.ntn__grupo--aberto .ntn__sub-dentro { padding-bottom: 8px; border-bottom: 1px solid var(--nu-cream-line); }
.ntn__subitem {
  display: flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 2px 0 14px;
  color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 700;
}
.ntn__subitem--ativo { color: var(--nu-blue-text); }
.ntn__tag {
  padding: 2px 7px; border-radius: var(--nu-r-pill); background: var(--nu-blue-tint); color: var(--nu-blue-text);
  font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
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
  font-family: inherit; font-size: var(--nu-fs-md); font-weight: 800; cursor: pointer;
}
.ntn__cta--cheio { background: var(--nu-blue); color: var(--nu-white); }
.ntn__cta--sair { color: var(--nu-red-text); }
.ntn-enter-active, .ntn-leave-active { transition: opacity .22s ease, transform .3s cubic-bezier(.2, .8, .2, 1); }
.ntn-enter-from, .ntn-leave-to { opacity: 0; transform: translateY(10px); }
/* no tablet a marca e o fechar seguem o header de lá */
@media (min-width: 641px) {
  .ntn__topo { height: 72px; padding: 0 clamp(16px, 3vw, 40px); }
  .ntn__marca :deep(.ntm__marca) { width: 26px; height: 26px; }
  .ntn__marca :deep(.ntm__nome) { font-size: var(--nu-fs-lg); }
  .ntn__rolo, .ntn__pe { padding-left: clamp(16px, 3vw, 40px); padding-right: clamp(16px, 3vw, 40px); }
}
@media (prefers-reduced-motion: reduce) {
  .ntn-enter-active, .ntn-leave-active, .ntn__sub, .ntn__chev { transition: none; }
}
</style>
