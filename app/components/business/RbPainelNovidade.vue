<script setup lang="ts">
/**
 * A novidade de 24/10/2026, para quem já usa: o assistente passou a mostrar
 * telas e a montar o relatório sozinho, e as skills deixaram de ser
 * necessárias. Some ao fechar, e a escolha fica no navegador (só conveniência:
 * sem armazenamento, ela volta, e nada quebra).
 */
const CHAVE = 'rbp:novidade:telas-2026-10'
const visivel = ref(false)

onMounted(() => {
  try { visivel.value = localStorage.getItem(CHAVE) !== '1' }
  catch { visivel.value = true }
})

function fechar() {
  visivel.value = false
  try { localStorage.setItem(CHAVE, '1') }
  catch { /* sem armazenamento: some só nesta visita */ }
}

defineEmits<{ (e: 'ver'): void }>()
</script>

<template>
  <Transition name="rbpn">
    <aside v-if="visivel" class="rbpn" aria-label="Novidade">
      <div class="rbpn__in">
        <span class="rbpn__selo">Novo</span>
        <p class="rbpn__t">
          O assistente agora mostra telas prontas e monta o relatório do cliente sozinho. As skills não são mais necessárias.
        </p>
        <a href="#comece" class="rbpn__link" @click="$emit('ver')">Ver as frases</a>
        <button type="button" class="rbpn__x" aria-label="Fechar a novidade" @click="fechar">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
        </button>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.rbpn { background: var(--nu-navy); color: var(--nu-cream-text); padding: 12px clamp(22px, 5.5vw, 80px); }
.rbpn__in { max-width: 1120px; margin: 0 auto; display: flex; align-items: center; gap: 14px; }
.rbpn__selo { flex: none; padding: 4px 10px; border-radius: var(--nu-r-pill); background: var(--nu-blue); color: var(--nu-white); font-size: var(--nu-fs-xs); font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }
.rbpn__t { flex: 1; margin: 0; font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; color: var(--nu-cream-text-85); }
.rbpn__link { flex: none; color: var(--nu-blue-soft); font-size: var(--nu-fs-sm); font-weight: 800; text-decoration: none; border-bottom: 1px solid transparent; transition: border-color .2s, color .2s; }
.rbpn__link:hover { color: var(--nu-white); border-bottom-color: currentColor; }
.rbpn__x {
  flex: none; display: grid; place-items: center; width: 36px; height: 36px; border: 0; border-radius: 50%; cursor: pointer;
  background: transparent; color: var(--nu-cream-text-70); transition: background .2s, color .2s;
}
.rbpn__x svg { width: 14px; height: 14px; }
.rbpn__x:hover { background: var(--nu-cream-text-12); color: var(--nu-white); }
.rbpn__link:focus-visible, .rbpn__x:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; border-radius: 8px; }
.rbpn-leave-active { transition: opacity .2s ease, max-height .3s ease; max-height: 120px; overflow: hidden; }
.rbpn-leave-to { opacity: 0; max-height: 0; }
@media (max-width: 640px) {
  .rbpn__in { flex-wrap: wrap; gap: 8px 12px; }
  .rbpn__t { flex-basis: calc(100% - 60px); order: 2; }
  .rbpn__selo { order: 1; }
  .rbpn__x { order: 1; margin-left: auto; }
  .rbpn__link { order: 3; }
}
</style>
