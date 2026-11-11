<script setup lang="ts">
// Card de guia do hub e do "Continue lendo." (PR4). NÃO é o NuGuideCard: o do
// /mercado é um poster 450px full-gradient com pill "Leia aqui"; este é OUTRA
// anatomia (banner gradient + corpo claro + rodapé read-time/seta) — por isso
// componente próprio no domínio guias. Valores exatos dos designs:
//  - variant hub     (Redentia Guias Nu):        banner 120px, título 20px,
//                    descrição, card creme sobre faixa branca
//  - variant related (Redentia Guia Open Finance): banner 104px, título 19px,
//                    sem descrição, card branco sobre faixa creme
// `to` ausente = guia sem página escrita → estado "Em breve" (sem link/lift).
import type { GuideTag } from '~/types/guias'

const props = withDefaults(defineProps<{
  title: string
  tag: GuideTag
  minutes: number
  description?: string
  to?: string | null
  gradient: 1 | 2 | 3
  variant?: 'hub' | 'related'
}>(), { variant: 'hub', description: undefined, to: null })

const tagName = computed(() => (props.to ? resolveComponent('NuxtLink') : 'div'))
</script>

<template>
  <component
    :is="tagName" :to="to ?? undefined"
    class="gdc" :class="[`gdc--${variant}`, { 'gdc--soon': !to }]"
  >
    <span class="gdc__banner" :class="`gdc__banner--g${gradient}`">
      <span class="gdc__tag">{{ tag }}</span>
    </span>
    <span class="gdc__body">
      <span class="gdc__title">{{ title }}</span>
      <span v-if="description && variant === 'hub'" class="gdc__desc">{{ description }}</span>
      <span class="gdc__foot">
        <span class="gdc__min">{{ minutes }} min de leitura</span>
        <span v-if="to" class="gdc__arrow">
          <!-- tamanho via CSS (.gdc__arrow svg), não :width/:height — binding
               dinâmico de width em <svg> vira DOM prop na hidratação e
               SVGSVGElement.width é getter-only (warn no console) -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </span>
        <span v-else class="gdc__soon">Em breve</span>
      </span>
    </span>
  </component>
</template>

<style scoped>
/* Na Aportou (11/11/2026) o topo do cartão é uma das três cores da marca
   (cobalto, carvão, sálvia), com o selo de raio 8; o corpo é creme no hub e
   branco sobre a faixa quente do "Continue lendo.". */
.gdc {
  border-radius: var(--nu-r-card); overflow: hidden;
  display: flex; flex-direction: column;
  transition: transform .25s var(--nu-ease-saida), box-shadow .25s var(--nu-ease-saida);
}
.gdc--hub { background: var(--nu-card); box-shadow: var(--nu-shadow-quente); }
.gdc--related { background: var(--nu-white); box-shadow: var(--nu-shadow-branco); }
.gdc:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.gdc--soon:hover { transform: none; }
.gdc--soon.gdc--hub:hover { box-shadow: var(--nu-shadow-quente); }
.gdc--soon.gdc--related:hover { box-shadow: var(--nu-shadow-branco); }

.gdc__banner { display: flex; align-items: flex-start; color: var(--nu-white); }
.gdc--hub .gdc__banner { height: 120px; padding: 20px; }
.gdc--related .gdc__banner { height: 104px; padding: 18px; }
/* as 3 cores da marca, rotacionadas por índice (i % 3) */
.gdc__banner--g1 { background: var(--nu-grad-cobalto); }
.gdc__banner--g2 { background: var(--nu-ink); }
.gdc__banner--g3 { background: var(--nu-sage); color: var(--nu-ink); }
.gdc__tag {
  display: inline-flex; align-items: center; background: var(--nu-white-20);
  color: inherit; font-size: var(--nu-fs-dense); font-weight: var(--nu-w-medio);
  letter-spacing: 0.14em; text-transform: uppercase;
  padding: 6px 10px; border-radius: var(--nu-r-tag);
}
.gdc__banner--g3 .gdc__tag { background: var(--nu-ink-10); }

.gdc__body { display: flex; flex-direction: column; flex: 1; }
.gdc--hub .gdc__body { padding: 22px 24px 24px; }
.gdc--related .gdc__body { padding: 20px 22px 22px; }
.gdc__title { color: var(--nu-ink); font-weight: var(--nu-w-forte); letter-spacing: -0.02em; line-height: 1.2; text-wrap: balance; }
.gdc--hub .gdc__title { font-size: var(--nu-fs-xl); }
.gdc--related .gdc__title { font-size: var(--nu-fs-xl); }
.gdc__desc {
  color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 500;
  line-height: 1.55; margin-top: 8px;
}
.gdc__foot {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  margin-top: auto;
}
.gdc--hub .gdc__foot { padding-top: 20px; }
.gdc--related .gdc__foot { padding-top: 18px; }
.gdc__min { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; }
.gdc__arrow {
  border-radius: 50%; background: var(--nu-ink); color: var(--nu-white);
  display: flex; align-items: center; justify-content: center; transition: background .2s;
}
.gdc__arrow svg { transition: transform .25s var(--nu-ease-saida); }
.gdc:hover .gdc__arrow { background: var(--nu-blue); }
.gdc:hover .gdc__arrow svg { transform: translateX(2px); }
.gdc--hub .gdc__arrow { width: 38px; height: 38px; }
.gdc--related .gdc__arrow { width: 38px; height: 38px; }
.gdc--hub .gdc__arrow svg { width: 14px; height: 14px; }
.gdc--related .gdc__arrow svg { width: 14px; height: 14px; }
/* estado "em breve": selo neutro de raio 8 */
.gdc__soon {
  display: inline-flex; align-items: center; background: var(--nu-cream-2);
  color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-medio);
  letter-spacing: 0.14em; text-transform: uppercase;
  padding: 6px 10px; border-radius: var(--nu-r-tag);
}
@media (prefers-reduced-motion: reduce) { .gdc, .gdc__arrow svg { transition: none; } }
</style>
