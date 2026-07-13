<script setup lang="ts">
// Split-screen de autenticação (contrato: Redentia Login Nu.dc.html):
// coluna do form (flex 1.15 1 520px, logo block flush no topo, miolo
// centralizado com paddings fluidos) + painel dark com a orbe (flex 1 1
// 460px, some <=1020px via NuAuthAsidePanel). Sem header/nav/footer — quem
// usa este layout declara `definePageMeta({ layout: false })`.
withDefaults(defineProps<{ logoTo?: string }>(), { logoTo: '/' })
</script>

<template>
  <div class="nal">
    <div class="nal__col">
      <div><NuLogoBlock :to="logoTo" /></div>
      <div class="nal__center">
        <div class="nal__form">
          <slot />
        </div>
      </div>
    </div>
    <NuAuthAsidePanel>
      <slot name="aside">Todos os seus investimentos.<br>Uma IA do seu lado.</slot>
    </NuAuthAsidePanel>
  </div>
</template>

<style scoped>
.nal { min-height: 100vh; background: var(--nu-white); overflow-x: clip; display: flex; }
.nal__col { flex: 1.15 1 520px; min-width: 0; display: flex; flex-direction: column; }
.nal__center {
  flex: 1; display: flex; align-items: center;
  padding: clamp(28px, 4vw, 48px) clamp(24px, 6vw, 96px);
}
/* qfade do design (opacity 0→1 + translateY 10px→0) = keyframe nu-fade global */
.nal__form { width: 100%; max-width: 440px; animation: nu-fade .5s ease both; }
</style>
