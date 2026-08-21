<script setup lang="ts">
// Termos do glossário citados por uma calculadora (20/08/2026).
//
// POR QUE EXISTE: o glossário são 80 URLs no sitemap com backlink de SAÍDA
// obrigatório (ver app/content/glossario/grupo-1.ts) e ZERO link de ENTRADA.
// Medido no Search Console (92 dias até 03/08): 13 páginas de /glossario/*
// com impressão, 1.914 impressões, posição média 19,6 e **zero clique**.
// Página órfã não recebe sinal de nenhuma das URLs que fazem 73% dos cliques
// do site, e é exatamente o perfil que vira "Rastreada, mas não indexada".
//
// Os slugs são passados a dedo por cada calculadora, não gerados: link
// interno só vale quando o termo é de fato usado no cálculo daquela página.
// Slug inexistente é ignorado em silêncio (getTerm devolve null) — o registry
// é a fonte única e um termo removido não pode derrubar a página.
import { getTerm } from '~/content/glossario'

const props = defineProps<{ slugs: string[] }>()

const terms = computed(() =>
  props.slugs.map((s) => getTerm(s)).filter((t): t is NonNullable<typeof t> => t !== null),
)
</script>

<template>
  <div v-if="terms.length" class="cgl">
    <NuxtLink v-for="t in terms" :key="t.slug" :to="`/glossario/${t.slug}`" class="cgl__item">
      <span class="cgl__term">{{ t.term }}</span>
      <span class="cgl__short">{{ t.short }}</span>
    </NuxtLink>
  </div>
</template>

<style scoped>
.cgl {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(268px, 1fr));
  gap: 14px;
}
.cgl__item {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 20px 22px;
  background: var(--nu-white);
  border: 2px solid var(--nu-sand-border);
  border-radius: var(--nu-r-card, 18px);
  text-decoration: none;
  transition: border-color .2s, transform .2s;
}
.cgl__item:hover {
  border-color: var(--nu-ink);
  transform: translateY(-2px);
}
.cgl__term {
  color: var(--nu-blue);
  font-size: 15.5px;
  font-weight: 800;
  letter-spacing: -.2px;
}
.cgl__short {
  color: var(--nu-gray-2);
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.5;
}
</style>
