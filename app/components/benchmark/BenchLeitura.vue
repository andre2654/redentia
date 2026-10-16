<script setup lang="ts">
// "Leitura da Redentia": a opinião da casa sobre o número da seção, separada do
// dado (o gráfico vem logo abaixo e não muda). Tipografia de editorial, como a
// prosa de "A tese" (TeseEditorial): sem cartão nem borda, frase em tamanho de
// lead e cinza, número no destaque azul da casa (o mesmo .tse-hi: fundo azul
// .16, tinta, peso 800) e a assinatura embaixo, com o selo da marca. O texto
// sai de content/benchmark-ia/leituras.ts; `**...**` vira destaque, sem v-html.
const props = defineProps<{ texto: string }>()
const partes = computed(() =>
  props.texto.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)
    .map((p) => (p.startsWith('**') && p.endsWith('**') ? { b: true, t: p.slice(2, -2) } : { b: false, t: p })),
)
</script>

<template>
  <figure class="ble">
    <blockquote class="ble__txt"><template v-for="(p, i) in partes" :key="i"><mark v-if="p.b" class="ble__hi">{{ p.t }}</mark><template v-else>{{ p.t }}</template></template></blockquote>
    <figcaption class="ble__sign">
      <span class="ble__badge" aria-hidden="true"><img src="/logo-branca.svg" alt="" class="ble__logo" width="12" height="12"></span>
      Leitura da Redentia
    </figcaption>
  </figure>
</template>

<style scoped>
.ble { max-width: 760px; margin: 0 0 clamp(28px, 3vw, 40px); }
.ble__txt {
  margin: 0; color: var(--nu-gray-3);
  font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.7;
}
.ble__hi {
  background: var(--nu-blue-16); color: var(--nu-ink); font-weight: 800;
  padding: 1px 6px; border-radius: 4px;
  -webkit-box-decoration-break: clone; box-decoration-break: clone;
}
.ble__sign {
  display: flex; align-items: center; gap: 8px; margin-top: 14px;
  color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 700;
}
.ble__badge {
  width: 22px; height: 22px; flex-shrink: 0; border-radius: 7px; background: var(--nu-blue);
  display: inline-flex; align-items: center; justify-content: center;
}
.ble__logo { width: 12px; height: 12px; display: block; object-fit: contain; }
</style>
