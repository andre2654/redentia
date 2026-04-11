<template>
  <!--
    Minimal layout for the Redentia API developer portal.

    The portal lives on api.redentia.com.br (via the subdomain
    middleware) and pages under /api-portal/* here. It has its own
    header rendered by MoleculesDocsShell / AtomsApiPortalHeader —
    so the standard Redentia "Buscar Ativos · Calculadoras · Na_th
    IA · Entrar" chrome would be visually redundant and off-brand
    for a developer-facing product. This layout just passes the
    slot through and sets the brand background so SSR renders
    exactly what the page component wants.
  -->
  <div
    class="min-h-screen"
    :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
const brand = useBrand()
</script>
