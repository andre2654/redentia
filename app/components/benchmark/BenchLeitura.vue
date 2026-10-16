<script setup lang="ts">
// "Leitura da Redentia": a opinião da casa sobre o número da seção, separada do
// dado (o gráfico vem logo abaixo e não muda). Mesma anatomia do card "A
// leitura da IA" das notícias (NuAtlasTake): cartão macio, selo azul com a
// marca, rótulo espaçado e texto em cinza; aqui a superfície acompanha a faixa
// (creme na branca, branca na creme) e a largura é de nota editorial. O texto
// sai de content/benchmark-ia/leituras.ts; `**...**` vira destaque, sem v-html.
const props = defineProps<{ texto: string }>()
const partes = computed(() =>
  props.texto.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)
    .map((p) => (p.startsWith('**') && p.endsWith('**') ? { b: true, t: p.slice(2, -2) } : { b: false, t: p })),
)
</script>

<template>
  <aside class="ble" aria-label="Leitura da Redentia">
    <div class="ble__head">
      <span class="ble__badge" aria-hidden="true"><img src="/logo-branca.svg" alt="" class="ble__logo" width="14" height="14"></span>
      <span class="ble__label">Leitura da Redentia</span>
    </div>
    <p class="ble__txt"><template v-for="(p, i) in partes" :key="i"><strong v-if="p.b">{{ p.t }}</strong><template v-else>{{ p.t }}</template></template></p>
  </aside>
</template>

<style scoped>
.ble {
  max-width: 720px; margin: 0 0 28px; padding: 20px 22px; border-radius: 20px;
  background: var(--b-surface, var(--nu-cream));
}
.ble__head { display: flex; align-items: center; gap: 9px; }
.ble__badge {
  width: 26px; height: 26px; flex-shrink: 0; border-radius: 8px; background: var(--nu-blue);
  display: inline-flex; align-items: center; justify-content: center;
}
.ble__logo { width: 14px; height: 14px; display: block; object-fit: contain; }
.ble__label { color: var(--nu-blue); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; }
.ble__txt { margin: 10px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.65; }
.ble__txt strong { color: var(--nu-ink); font-weight: 700; }
</style>
