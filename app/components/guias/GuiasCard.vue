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
.gdc {
  border-radius: var(--nu-r-card); overflow: hidden;
  display: flex; flex-direction: column; transition: transform .15s;
}
.gdc--hub { background: var(--nu-cream); }
.gdc--related { background: var(--nu-white); }
.gdc:hover { transform: translateY(-3px); }
.gdc--soon:hover { transform: none; }

.gdc__banner { display: flex; align-items: flex-start; }
.gdc--hub .gdc__banner { height: 120px; padding: 20px; }
.gdc--related .gdc__banner { height: 104px; padding: 18px; }
/* os 3 gradients do design, rotacionados por índice (i % 3) */
.gdc__banner--g1 { background: linear-gradient(200deg, var(--nu-blue-soft) 0%, var(--nu-grad-blue-1) 32%, var(--nu-navy-2) 82%); }
.gdc__banner--g2 { background: linear-gradient(165deg, var(--nu-blue) 0%, var(--nu-blue-deep) 45%, var(--nu-navy) 100%); }
.gdc__banner--g3 { background: linear-gradient(205deg, var(--nu-grad-blue-2) 0%, var(--nu-blue-deep) 55%, var(--nu-navy) 95%); }
.gdc__tag {
  display: inline-flex; align-items: center; background: var(--nu-white-20);
  color: var(--nu-white); font-size: 11.5px; font-weight: 800;
  letter-spacing: .8px; text-transform: uppercase;
  padding: 5px 12px; border-radius: var(--nu-r-pill);
}

.gdc__body { display: flex; flex-direction: column; flex: 1; }
.gdc--hub .gdc__body { padding: 22px 24px 24px; }
.gdc--related .gdc__body { padding: 20px 22px 22px; }
.gdc__title { color: var(--nu-ink); font-weight: 800; letter-spacing: -.3px; line-height: 1.25; }
.gdc--hub .gdc__title { font-size: 20px; }
.gdc--related .gdc__title { font-size: 19px; }
.gdc__desc {
  color: var(--nu-gray); font-size: 14.5px; font-weight: 500;
  line-height: 1.55; margin-top: 8px;
}
.gdc__foot {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  margin-top: auto;
}
.gdc--hub .gdc__foot { padding-top: 20px; }
.gdc--related .gdc__foot { padding-top: 16px; }
.gdc__min { color: var(--nu-gray); font-size: 13px; font-weight: 700; }
.gdc__arrow {
  border-radius: 50%; background: var(--nu-blue); color: var(--nu-white);
  display: flex; align-items: center; justify-content: center;
}
.gdc--hub .gdc__arrow { width: 38px; height: 38px; }
.gdc--related .gdc__arrow { width: 36px; height: 36px; }
.gdc--hub .gdc__arrow svg { width: 14px; height: 14px; }
.gdc--related .gdc__arrow svg { width: 13px; height: 13px; }
/* estado "em breve" (linguagem do design: pill areia como as tags neutras) */
.gdc__soon {
  display: inline-flex; align-items: center; background: var(--nu-sand-2);
  color: var(--nu-gray-tag); font-size: 11.5px; font-weight: 800;
  letter-spacing: .8px; text-transform: uppercase;
  padding: 6px 13px; border-radius: var(--nu-r-pill);
}
</style>
