<script setup lang="ts">
/**
 * O que o cliente vê quando abre o link do escritório (pages/cliente/convite/
 * [token].vue): o passo "Selecione a instituição" (ClienteConnectInstituicoes),
 * com a busca, as abas e a lista. Recortado em vez de montado: o componente de
 * verdade tem um <h1> e eventos de conexão, e a landing só pode ter um H1.
 * As instituições são as do arquivo de verdade (content/instituicoes.ts), em
 * iniciais, como o hero da página fez desde 15/10/2026 (sem logo de banco na
 * vitrine). `tocar` faz o cliente escolher a XP: a linha acende e o passo do
 * banco aparece, uma vez.
 */
import { INSTITUICOES, iniciaisDe } from '~/content/instituicoes'

withDefaults(defineProps<{ tocar?: boolean }>(), { tocar: false })
const LISTA = ['xp', 'btg', 'nubank', 'itau'].map((s) => INSTITUICOES.find((i) => i.slug === s)!).filter(Boolean)
</script>

<template>
  <div class="bcs" :class="{ 'bcs--tocar': tocar }">
    <p class="bcs__h">Selecione a instituição</p>
    <div class="bcs__busca">Encontre a sua instituição</div>
    <div class="bcs__abas"><span class="bcs__aba--on">Todas</span><span>Bancos</span><span>Corretoras</span></div>
    <ul class="bcs__lista">
      <li v-for="(i, k) in LISTA" :key="i.slug" :class="{ 'bcs__item--escolhido': k === 0 }">
        <span class="bcs__ini">{{ iniciaisDe(i.name) }}</span>
        <span class="bcs__nome">{{ i.name }}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.bcs { padding: 24px 22px 20px; color: var(--nu-ink); }
.bcs__h { margin: 0; font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.03em; }
.bcs__busca { margin-top: 14px; height: 40px; display: flex; align-items: center; padding: 0 14px; border-radius: var(--nu-r-input); background: var(--nu-cream); color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.bcs__abas { display: flex; gap: 6px; margin-top: 12px; }
.bcs__abas span { padding: 6px 12px; border-radius: var(--nu-r-pill); color: var(--nu-gray-2); font-size: var(--nu-fs-dense); font-weight: 700; }
.bcs__abas .bcs__aba--on { background: var(--nu-ink); color: var(--nu-white); }
.bcs__lista { margin: 12px 0 0; padding: 0; list-style: none; }
.bcs__lista li { display: flex; align-items: center; gap: 12px; padding: 11px 10px; border-radius: var(--nu-r-chip); color: var(--nu-gray); }
.bcs__ini { width: 30px; height: 30px; flex-shrink: 0; display: grid; place-items: center; border-radius: 9px; background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-cream-line); color: var(--nu-ink); font-size: var(--nu-fs-xs); font-weight: 800; }
.bcs__nome { flex: 1; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; }
.bcs__lista .bcs__item--escolhido { background: var(--nu-blue-tint); }
.bcs--tocar .bcs__item--escolhido { animation: bcs-acende 1.2s ease backwards .6s; }
@keyframes bcs-acende { from { background: transparent; } }
@media (prefers-reduced-motion: reduce) { .bcs * { animation: none !important; } }
</style>
