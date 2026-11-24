<script setup lang="ts">
// Trilha visível no mesmo texto e na mesma ordem do BreadcrumbList da página.
// O último item é a página atual. Quebra a linha no celular, sem sair da coluna.
defineProps<{ crumbs: { name: string; path: string }[] }>()
</script>

<template>
  <nav v-if="crumbs.length" class="ntr" aria-label="Trilha">
    <ol class="ntr__lista">
      <li v-for="(c, i) in crumbs" :key="`${c.path}-${i}`" class="ntr__item">
        <NuxtLink v-if="i < crumbs.length - 1" :to="c.path" class="ntr__link">{{ c.name }}</NuxtLink>
        <span v-else class="ntr__aqui" aria-current="page">{{ c.name }}</span>
        <span v-if="i < crumbs.length - 1" class="ntr__sep" aria-hidden="true">/</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.ntr { max-width: 100%; }
.ntr__lista {
  display: flex; flex-wrap: wrap; align-items: center; gap: 0;
  margin: 0; padding: 0; list-style: none; max-width: 100%;
}
.ntr__item { display: inline-flex; align-items: center; max-width: 100%; min-width: 0; }
.ntr__link, .ntr__aqui {
  display: inline-flex; align-items: center; min-height: 44px;
  color: var(--nu-ink); font-size: 13px; font-weight: var(--nu-w-medio);
  letter-spacing: var(--nu-ls-texto); line-height: 1.3;
}
.ntr__link {
  text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px;
  text-decoration-color: transparent;
  transition: text-decoration-color var(--nu-dur-media) var(--nu-ease-cor);
}
.ntr__link:hover { color: var(--nu-ink); text-decoration-color: currentColor; }
.ntr__link:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; border-radius: 4px; }
.ntr__aqui { overflow-wrap: anywhere; }
.ntr__sep { margin: 0 8px; color: var(--nu-gray); font-size: 13px; }
</style>
