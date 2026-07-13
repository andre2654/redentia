<script setup lang="ts">
// Barra de filtros da /busca (adição do dono 2026-07-13, na linguagem Nu):
//  - pills de TIPO: Todos · Ações · FIIs · BDRs · Cripto · Tesouro Direto
//    (estado em v-model, refletido em ?tipo= pela página).
//  - "Filtros avançados": dropdown de atalhos pros screeners REAIS (os
//    /ranking/*), porque o /tickers-full não traz DY/fundamentos — screener
//    client-side seria mentira. Fecha com Escape / clique-fora (padrão dos
//    drawers do NuHeader).
import { BUSCA_TIPOS } from '~/composables/useBuscaIndex'
import type { BuscaType } from '~/composables/useBuscaIndex'
import { RANKINGS } from '~/content/rankings/registry'

const props = defineProps<{ modelValue: BuscaType }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: BuscaType): void }>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)

/** rankings fundamentalistas — recebem ?type= quando a classe suporta. */
const FUND = [
  { label: 'Maiores dividend yields', slug: 'maiores-dividend-yield' },
  { label: 'Maior rentabilidade (12m)', slug: 'maiores-altas-12-meses' },
  { label: 'Mais baratas (Graham)', slug: 'mais-baratas-graham' },
  { label: 'Maiores ROE', slug: 'maiores-roe' },
  { label: 'Redentia Score', slug: 'redentia-score' },
] as const

// classe do ranking por tipo (só ações/fiis/bdrs têm ?type=/?classe=)
const CLASSE: Partial<Record<BuscaType, string>> = { acoes: 'acoes', fiis: 'fiis', bdrs: 'bdrs' }

interface AdvItem { label: string; href: string }

// Itens do painel dependem do tipo ativo (cripto/tesouro não têm screener
// fundamentalista — mostramos só o que faz sentido pra cada um).
const advItems = computed<AdvItem[]>(() => {
  const t = props.modelValue
  if (t === 'tesouro') {
    return [
      { label: 'Ranking do Tesouro Direto', href: '/ranking/tesouro-direto' },
      { label: 'Ver todos os títulos', href: '/tesouro' },
    ]
  }
  if (t === 'cripto') {
    return [
      { label: 'Cripto no mercado', href: '/mercado' },
      { label: 'Ver todos os rankings', href: '/rankings' },
    ]
  }
  const classe = CLASSE[t]
  // Só oferece o ranking se ele REALMENTE suporta a classe ativa — senão
  // ?type=fiis/bdrs cairia em 'todos' no /ranking e entregaria ações (falsa
  // affordance). Rankings acoes-only somem quando a pill é FIIs/BDRs; com a
  // pill Ações (ou sem classe) todos passam. O ?type= só entra quando suporta.
  const items = FUND.filter((f) => {
    if (!classe) return true
    return (RANKINGS[f.slug]?.types as string[] | undefined)?.includes(classe) ?? false
  }).map((f) => ({
    label: f.label,
    href: `/ranking/${f.slug}${classe ? `?type=${classe}` : ''}`,
  }))
  return [
    ...items,
    { label: 'Ver todos os rankings', href: classe ? `/rankings?classe=${classe}` : '/rankings' },
  ]
})

// rótulo do botão reflete a classe selecionada (contexto pro dono)
const advLabel = computed(() => {
  const t = props.modelValue
  if (t === 'acoes') return 'Filtros de ações'
  if (t === 'fiis') return 'Filtros de FIIs'
  if (t === 'bdrs') return 'Filtros de BDRs'
  if (t === 'tesouro') return 'Tesouro Direto'
  if (t === 'cripto') return 'Cripto'
  return 'Filtros avançados'
})

function pick(t: BuscaType) {
  emit('update:modelValue', t)
}

function toggle() {
  open.value = !open.value
}
function close() {
  open.value = false
}

function onDocClick(e: MouseEvent) {
  if (open.value && root.value && !root.value.contains(e.target as Node)) close()
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) {
    e.stopPropagation() // consome o Escape antes da cascata da página
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey, true) // capture: vence a cascata
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey, true)
})
</script>

<template>
  <div ref="root" class="btf">
    <div class="btf__pills" role="tablist" aria-label="Filtrar por tipo de ativo">
      <button
        v-for="t in BUSCA_TIPOS" :key="t.key" type="button" role="tab"
        class="btf__pill" :class="{ 'btf__pill--active': t.key === props.modelValue }"
        :aria-selected="t.key === props.modelValue"
        @click="pick(t.key)"
      >{{ t.label }}</button>
    </div>

    <div class="btf__adv">
      <button
        type="button" class="btf__adv-btn" :class="{ 'btf__adv-btn--open': open }"
        :aria-expanded="open" aria-haspopup="menu"
        @click="toggle"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
        {{ advLabel }}
        <svg class="btf__caret" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      </button>

      <div v-if="open" class="btf__panel" role="menu">
        <div class="btf__panel-label">Screeners da Redentia</div>
        <NuxtLink
          v-for="it in advItems" :key="it.href" :to="it.href" class="btf__panel-item"
          role="menuitem" @click="close"
        >
          <span>{{ it.label }}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btf {
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
  flex-wrap: wrap;
  background: var(--nu-white);
  padding: clamp(20px, 3vw, 30px) clamp(22px, 5.5vw, 80px) 0;
  animation: nu-fade .5s ease both;
}
.btf__pills { display: flex; gap: 8px; flex-wrap: wrap; }
.btf__pill {
  padding: 9px 16px; border-radius: var(--nu-r-pill); font-size: 14px; font-weight: 700;
  cursor: pointer; border: 2px solid var(--nu-sand-border); background: var(--nu-white);
  color: var(--nu-gray-2); transition: all .2s; white-space: nowrap;
}
.btf__pill:hover { border-color: var(--nu-ink); color: var(--nu-ink); }
.btf__pill:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.btf__pill--active {
  border-color: var(--nu-ink); background: var(--nu-ink);
  color: var(--nu-white); font-weight: 800;
}

/* Filtros avançados */
.btf__adv { position: relative; }
.btf__adv-btn {
  display: inline-flex; align-items: center; gap: 8px;
  background: transparent; color: var(--nu-blue);
  border: 2px solid var(--nu-blue); border-radius: var(--nu-r-pill);
  padding: 9px 16px; font-size: 14px; font-weight: 800; cursor: pointer;
  white-space: nowrap; transition: background .2s;
}
.btf__adv-btn:hover, .btf__adv-btn--open { background: var(--nu-blue-tint-2); }
.btf__adv-btn:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.btf__caret { transition: transform .2s; }
.btf__adv-btn--open .btf__caret { transform: rotate(180deg); }

.btf__panel {
  position: absolute; top: calc(100% + 8px); right: 0; z-index: 30;
  min-width: 268px; background: var(--nu-white);
  border: 1.5px solid var(--nu-cream-3); border-radius: var(--nu-r-panel);
  box-shadow: var(--nu-shadow-drawer); padding: 8px;
  animation: nu-fade .18s ease both;
}
.btf__panel-label {
  color: var(--nu-gray); font-size: 11px; font-weight: 800;
  letter-spacing: 1.1px; text-transform: uppercase; padding: 8px 12px 6px;
}
.btf__panel-item {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 11px 12px; border-radius: 12px;
  color: var(--nu-ink); font-size: 14px; font-weight: 700;
  transition: background .15s;
}
.btf__panel-item svg { color: var(--nu-sand); flex-shrink: 0; }
.btf__panel-item:hover { background: var(--nu-cream); }
.btf__panel-item:hover svg { color: var(--nu-blue); }
.btf__panel-item:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: -2px; }

@media (max-width: 760px) {
  .btf { gap: 12px; }
  .btf__adv { width: 100%; }
  .btf__adv-btn { width: 100%; justify-content: center; }
  .btf__panel { left: 0; right: 0; min-width: 0; }
}
</style>
