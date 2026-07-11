<script setup lang="ts">
// Faixa azul full-bleed de captura de e-mail: headline 2 linhas à esquerda,
// input-pílula branco com botão azul embutido à direita. Valores exatos do
// design (Redentia Guias Nu.dc.html). Sem backend de newsletter (contrato do
// PR4): submit → /login?email=<valor> — o mesmo handoff do hero do /mercado.
defineProps<{ subtitle: string; placeholder: string; cta: string }>()

const email = ref('')
function submit() {
  const v = email.value.trim()
  navigateTo(v ? `/login?email=${encodeURIComponent(v)}` : '/login')
}
</script>

<template>
  <section class="nnb">
    <div class="nnb__cols">
      <div class="nnb__left">
        <h2 class="nnb__title"><slot name="title" /></h2>
        <div class="nnb__sub">{{ subtitle }}</div>
      </div>
      <div class="nnb__right">
        <form class="nnb__pill" @submit.prevent="submit">
          <input v-model="email" type="email" :placeholder="placeholder" class="nnb__input" autocomplete="email">
          <button type="submit" class="nnb__cta">{{ cta }}</button>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.nnb {
  background: var(--nu-blue);
  padding: clamp(56px, 7.5vw, 96px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.nnb__cols { display: flex; gap: clamp(28px, 5vw, 72px); align-items: center; flex-wrap: wrap; }
.nnb__left { flex: 1.4 1 380px; min-width: min(300px, 100%); }
.nnb__title {
  margin: 0; color: var(--nu-cream-text);
  font-size: clamp(34px, 4.2vw, 56px); font-weight: 800;
  letter-spacing: -0.04em; line-height: 1.05;
}
.nnb__sub { color: var(--nu-cream-text-70); font-size: 17px; font-weight: 600; margin-top: 16px; }
.nnb__right { flex: 1 1 340px; min-width: min(300px, 100%); }
.nnb__pill {
  display: flex; gap: 10px; background: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 7px 7px 7px 24px; align-items: center;
}
.nnb__input {
  flex: 1; min-width: 0; background: transparent; border: none; outline: none;
  color: var(--nu-ink); font-size: 16px; font-weight: 600; padding: 10px 0;
}
.nnb__cta {
  background: var(--nu-blue); color: var(--nu-white); border: none;
  border-radius: var(--nu-r-pill); padding: 13px 24px; font-size: 15px; font-weight: 800;
  cursor: pointer; white-space: nowrap; transition: background .2s;
}
.nnb__cta:hover { background: var(--nu-blue-hover); }
</style>
