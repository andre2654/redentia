<script setup lang="ts">
// A faixa azul do fim das calculadoras, de ponta a ponta da tela (dono,
// 21/10/2026: "nas telas da calculadora deixe esse card ocupando toda a
// largura"). Antes era um cartão de 1080 px dentro da última faixa de texto,
// repetido em cada página com o próprio CSS; agora fica logo depois dela,
// antes do rodapé. A preço-teto segue com o cartão dela (veto do dono).
defineProps<{
  titulo: string
  texto: string
  /** o botão claro, o principal */
  primario: { label: string; to: string }
  /** o botão de contorno */
  secundario: { label: string; to: string }
}>()
</script>

<template>
  <section class="cft">
    <h2 class="cft__titulo">{{ titulo }}</h2>
    <p class="cft__texto">{{ texto }}</p>
    <div class="cft__acoes">
      <NuxtLink :to="primario.to" class="cft__pill cft__pill--claro">{{ primario.label }}</NuxtLink>
      <NuxtLink :to="secundario.to" class="cft__pill cft__pill--contorno">{{ secundario.label }}</NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.cft {
  background: var(--nu-blue); text-align: center;
  padding: clamp(56px, 7vw, 96px) clamp(22px, 5.5vw, 80px);
}
.cft__titulo {
  margin: 0 auto; max-width: 900px; color: var(--nu-white);
  font-size: var(--nu-fs-h2-sm); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; text-wrap: balance;
}
.cft__texto { margin: 14px auto 0; max-width: 560px; color: var(--nu-white-75); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.6; }
.cft__acoes { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 26px; }
.cft__pill {
  display: inline-flex; align-items: center; padding: 15px 26px; border-radius: var(--nu-r-pill);
  font-size: var(--nu-fs-md); font-weight: 700; transition: background .2s, color .2s;
}
.cft__pill--claro { background: var(--nu-cream); color: var(--nu-blue); }
.cft__pill--claro:hover { background: var(--nu-white); color: var(--nu-blue-hover); }
.cft__pill--contorno { background: transparent; border: 2px solid var(--nu-white-35); color: var(--nu-white); }
.cft__pill--contorno:hover { background: var(--nu-white-14); color: var(--nu-white); }
</style>
