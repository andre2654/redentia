<script setup lang="ts">
// Renderiza uma lista de LegalBlock (p / list / subsection) com a prosa
// jurídica em tokens Nu. Recursivo: 'subsection' emite h3 + <LegalBlocks> dos
// próprios blocos; listas aninham 1 nível (children do item). `lede` engorda os
// parágrafos de abertura. Componente de apresentação puro — sem estado.
import type { LegalBlock } from '~/types/legal'

withDefaults(defineProps<{
  blocks: LegalBlock[]
  /** parágrafos de abertura (um pouco maiores/mais claros). */
  lede?: boolean
}>(), { lede: false })
</script>

<template>
  <template v-for="(b, i) in blocks" :key="i">
    <p v-if="b.kind === 'p'" class="lgb__p" :class="{ 'lgb__p--lede': lede }">
      <LegalText :value="b.text" />
    </p>

    <component
      :is="b.ordered === false ? 'ul' : 'ol'"
      v-else-if="b.kind === 'list'"
      class="lgb__list"
      :class="{ 'lgb__list--ul': b.ordered === false }"
    >
      <li v-for="(it, j) in b.items" :key="j" class="lgb__li">
        <LegalText :value="it.text" />
        <ol v-if="it.children?.length" class="lgb__list lgb__list--nested">
          <li v-for="(c, k) in it.children" :key="k" class="lgb__li">
            <LegalText :value="c.text" />
          </li>
        </ol>
      </li>
    </component>

    <div v-else-if="b.kind === 'subsection'" class="lgb__sub">
      <h3 :id="b.id" class="lgb__h3">{{ b.title }}</h3>
      <LegalBlocks :blocks="b.blocks" />
    </div>
  </template>
</template>

<style scoped>
.lgb__p {
  margin: 16px 0 0; color: var(--nu-gray-3);
  font-size: 16.5px; font-weight: 500; line-height: 1.7;
}
.lgb__p--lede {
  color: var(--nu-gray-2); font-size: clamp(17px, 1.5vw, 18px); line-height: 1.65;
}

.lgb__list {
  margin: 16px 0 0; padding-left: 24px; list-style: decimal;
  display: flex; flex-direction: column; gap: 10px;
}
.lgb__list--ul { list-style: disc; }
.lgb__list--nested {
  margin: 12px 0 4px; list-style: lower-alpha; gap: 8px;
}
.lgb__li {
  color: var(--nu-gray-3); font-size: 16.5px; font-weight: 500; line-height: 1.7;
  padding-left: 4px;
}
.lgb__li::marker { color: var(--nu-gray); font-weight: 700; }

.lgb__sub { margin-top: 4px; }
.lgb__h3 {
  margin: clamp(24px, 2.6vw, 32px) 0 0; color: var(--nu-ink);
  font-size: clamp(18px, 1.7vw, 21px); font-weight: 800;
  letter-spacing: -0.02em; line-height: 1.25;
  scroll-margin-top: 88px;
}
</style>
