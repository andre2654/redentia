<script setup lang="ts">
// Hero bege da busca — H1 + "Abrir o chat" + pill de busca + chips de
// sugestão + conversas recentes (só se há histórico).
// Contrato de UX: Redentia Busca Nu.dc.html (linhas 57-93).
const props = defineProps<{
  modelValue: string
  sugestoes: readonly string[]
  recents: { id: string; title: string; time: string }[]
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'ask'): void
  (e: 'open-chat'): void
  (e: 'suggest', t: string): void
  (e: 'open-recent', id: string): void
  (e: 'activate'): void
}>()

const bar = ref<{ focus: () => void } | null>(null)

defineExpose({
  focusInput: () => bar.value?.focus(),
})
</script>

<template>
  <section class="bsh">
    <div class="bsh__top">
      <h1 class="bsh__title">O que você quer saber?</h1>
      <button type="button" class="bsh__open" @click="emit('open-chat')">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H6l-3 3V11.5A8.5 8.5 0 0 1 11.5 3h1A8.5 8.5 0 0 1 21 11.5z" /></svg>
        Abrir o chat
      </button>
    </div>

    <BuscaSearchBar
      ref="bar"
      :model-value="props.modelValue"
      @update:model-value="emit('update:modelValue', $event)"
      @ask="emit('ask')"
      @activate="emit('activate')"
    />

    <div class="bsh__sugs">
      <span class="bsh__sugs-label">Pergunte, por exemplo:</span>
      <button
        v-for="s in props.sugestoes" :key="s" type="button" class="bsh__chip"
        @click="emit('suggest', s)"
      >{{ s }}</button>
    </div>

    <div v-if="props.recents.length" class="bsh__recents">
      <div class="bsh__recents-label">Conversas recentes</div>
      <div class="bsh__recents-row">
        <button
          v-for="c in props.recents" :key="c.id" type="button" class="bsh__recent"
          @click="emit('open-recent', c.id)"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--nu-blue)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H6l-3 3V11.5A8.5 8.5 0 0 1 11.5 3h1A8.5 8.5 0 0 1 21 11.5z" /></svg>
          <span class="bsh__recent-title">{{ c.title }}</span>
          <span class="bsh__recent-time">{{ c.time }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.bsh {
  background: var(--nu-cream);
  padding: clamp(48px, 6.5vw, 88px) clamp(22px, 5.5vw, 80px) clamp(40px, 5vw, 64px);
  animation: nu-fade .5s ease both;
}
.bsh__top { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; flex-wrap: wrap; }
.bsh__title {
  margin: 0; color: var(--nu-ink);
  font-size: clamp(36px, 4.6vw, 64px); font-weight: 800;
  letter-spacing: -0.04em; line-height: 1.03;
}
.bsh__open {
  display: inline-flex; align-items: center; gap: 9px;
  background: transparent; color: var(--nu-blue);
  border: 2px solid var(--nu-blue); border-radius: var(--nu-r-pill);
  padding: 12px 22px; font-size: 15px; font-weight: 800; cursor: pointer;
  white-space: nowrap; transition: background .2s;
}
.bsh__open:hover { background: var(--nu-blue-tint-2); }
.bsh__open:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

.bsh__sugs { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 20px; }
.bsh__sugs-label { color: var(--nu-gray); font-size: 13.5px; font-weight: 700; margin-right: 4px; }
.bsh__chip {
  background: var(--nu-white); color: var(--nu-gray-2);
  border: 1.5px solid var(--nu-cream-3); border-radius: var(--nu-r-pill);
  padding: 9px 16px; font-size: 13.5px; font-weight: 700; cursor: pointer;
  transition: border-color .2s, color .2s;
}
.bsh__chip:hover { border-color: var(--nu-blue); color: var(--nu-blue); }
.bsh__chip:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

.bsh__recents { margin-top: 30px; }
.bsh__recents-label {
  color: var(--nu-gray); font-size: 12.5px; font-weight: 800;
  letter-spacing: 1.2px; text-transform: uppercase;
}
.bsh__recents-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
.bsh__recent {
  display: inline-flex; align-items: center; gap: 10px;
  background: var(--nu-white); border: none; border-radius: var(--nu-r-pill);
  padding: 11px 18px; cursor: pointer; transition: transform .15s;
}
.bsh__recent:hover { transform: translateY(-1px); }
.bsh__recent:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.bsh__recent-title {
  color: var(--nu-ink); font-size: 14px; font-weight: 700; max-width: 320px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.bsh__recent-time { color: var(--nu-gray); font-size: 12px; font-weight: 700; white-space: nowrap; }
</style>
