<script setup lang="ts">
/**
 * Os estados de LINK do widget, no mesmo cartão do fluxo:
 *  - carregando: a forma do passo de boas-vindas, em skeleton (nunca spinner);
 *  - invalido: link usado, vencido, cancelado, recurso desligado, modo
 *    indisponível (frase completa em português, vinda da página);
 *  - cancelado: a pessoa fechou o widget antes de conectar; pode reabrir.
 */
defineProps<{
  variante: 'carregando' | 'invalido' | 'cancelado'
  titulo?: string
  texto?: string
}>()
const emit = defineEmits<{ reabrir: [] }>()
</script>

<template>
  <section class="cce" :class="`cce--${variante}`">
    <template v-if="variante === 'carregando'">
      <span class="cce__sr" role="status">Abrindo o convite.</span>
      <div class="cce__skel" aria-hidden="true">
        <NuSkeleton variant="block" width="52px" height="52px" radius="tile" class="cce__skel-glifo" />
        <NuSkeleton variant="text" :lines="2" last-width="70%" />
        <NuSkeleton variant="text" :lines="1" last-width="55%" />
        <div class="cce__skel-blocos">
          <NuSkeleton variant="text" :lines="2" last-width="88%" />
          <NuSkeleton variant="text" :lines="2" last-width="76%" />
          <NuSkeleton variant="text" :lines="2" last-width="82%" />
        </div>
        <div class="cce__skel-foot">
          <NuSkeleton variant="line" height="12px" width="70%" />
          <NuSkeleton variant="block" height="50px" radius="12px" />
        </div>
      </div>
    </template>

    <template v-else>
      <div class="cce__glifo" :class="{ 'cce__glifo--alerta': variante === 'invalido' }" aria-hidden="true">
        <svg v-if="variante === 'invalido'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </div>
      <h1 data-cc-titulo tabindex="-1" class="cce__h1">{{ titulo }}</h1>
      <p class="cce__p" role="alert">{{ texto }}</p>
      <footer v-if="variante === 'cancelado'" class="cce__foot">
        <ClienteConnectButton @click="emit('reabrir')">Reabrir</ClienteConnectButton>
      </footer>
    </template>
  </section>
</template>

<style scoped>
.cce { flex: 1 1 auto; display: flex; flex-direction: column; }
.cce__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.cce__skel { flex: 1 1 auto; display: flex; flex-direction: column; gap: 14px; }
.cce__skel-glifo { margin: 2px auto 6px; }
.cce__skel-blocos { margin-top: 10px; display: flex; flex-direction: column; gap: 16px; }
.cce__skel-foot { margin-top: auto; padding-top: 22px; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.cce__skel-foot > * { width: 100%; }

.cce__glifo {
  width: 52px; height: 52px; margin: 26px auto 0; border-radius: 16px;
  background: var(--nu-cream); color: var(--nu-gray-2);
  display: flex; align-items: center; justify-content: center;
}
.cce__glifo--alerta { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
.cce__h1 { margin: 18px 0 0; text-align: center; color: var(--nu-ink); font-size: 20px; font-weight: 800; letter-spacing: -.03em; line-height: 1.22; text-wrap: balance; outline: none; }
.cce__p { margin: 10px 0 0; text-align: center; color: var(--nu-gray-2); font-size: 14px; font-weight: 500; line-height: 1.55; }
.cce__foot { margin-top: auto; padding-top: 22px; }
</style>
