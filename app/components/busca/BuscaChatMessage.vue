<script setup lang="ts">
// Mensagem do chat — user (bolha bege à direita) e assistant (avatar tile +
// markdown mínimo + chips de fonte + follow-ups SÓ na última msg da IA).
// Contrato de UX: Redentia Busca Nu.dc.html (linhas 164-192).
import type { NuChatCitation, NuChatMsg } from '~/composables/useNuChat'

const props = defineProps<{
  msg: NuChatMsg
  /** follow-ups só aparecem na última msg da IA e fora do streaming */
  showFollowups: boolean
}>()
const emit = defineEmits<{ (e: 'followup', t: string): void }>()

const html = computed(() => chatMarkdown(props.msg.content))

function chipText(c: NuChatCitation): string {
  return [c.publisher, c.title].filter(Boolean).join(' · ')
}

// Fontes: o design mostra poucos chips; sessões reais de deep-search chegam
// com 30+ citações — exibe 6 e o resto atrás de "+N fontes" (toggle).
const SOURCES_CAP = 6
const sourcesOpen = ref(false)
const visibleCitations = computed(() =>
  sourcesOpen.value ? props.msg.citations : props.msg.citations.slice(0, SOURCES_CAP))
const hiddenCitations = computed(() =>
  sourcesOpen.value ? 0 : Math.max(0, props.msg.citations.length - SOURCES_CAP))
</script>

<template>
  <div v-if="props.msg.role === 'user'" class="bcm bcm--user">
    <div class="bcm__bubble">{{ props.msg.content }}</div>
  </div>

  <div v-else class="bcm bcm--ai">
    <span class="bcm__avatar" aria-hidden="true">
      <img src="/logo-branca.svg" alt="" class="bcm__avatar-img">
    </span>
    <div class="bcm__col">
      <!-- eslint-disable-next-line vue/no-v-html — chatMarkdown escapa tudo antes -->
      <div v-if="props.msg.content" class="bcm__body" v-html="html" />

      <div v-if="props.msg.error" class="bcm__error">
        <span>{{ props.msg.error }}</span>
        <NuxtLink v-if="props.msg.authExpired" to="/login?redirect=%2Fbusca%3Fchat%3D1" class="bcm__login">Entrar de novo</NuxtLink>
      </div>

      <div v-if="props.msg.citations.length" class="bcm__sources">
        <template v-for="c in visibleCitations" :key="c.url || c.title">
          <a v-if="c.url" :href="c.url" target="_blank" rel="noopener noreferrer nofollow" class="bcm__source bcm__source--link">{{ chipText(c) }}</a>
          <span v-else class="bcm__source">{{ chipText(c) }}</span>
        </template>
        <button
          v-if="hiddenCitations > 0" type="button" class="bcm__source bcm__source--more"
          @click="sourcesOpen = true"
        >+{{ hiddenCitations }} fontes</button>
      </div>

      <div v-if="props.showFollowups && props.msg.followups.length" class="bcm__follow">
        <button
          v-for="f in props.msg.followups" :key="f" type="button" class="bcm__chip"
          @click="emit('followup', f)"
        >{{ f }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bcm--user { display: flex; justify-content: flex-end; margin: 16px 0; }
.bcm__bubble {
  background: var(--nu-cream); color: var(--nu-navy);
  font-size: 15.5px; font-weight: 700; padding: 13px 20px;
  border-radius: 18px 18px 4px 18px; max-width: min(560px, 86%);
  line-height: 1.5; white-space: pre-wrap; overflow-wrap: break-word;
}

.bcm--ai { display: flex; gap: 12px; margin: 20px 0; animation: nu-fade .3s ease both; }
.bcm__avatar {
  width: 32px; height: 32px; flex-shrink: 0; border-radius: 10px;
  background: var(--nu-blue); display: flex; align-items: center; justify-content: center;
  margin-top: 2px;
}
.bcm__avatar-img { width: 17px; height: 17px; display: block; object-fit: contain; }
.bcm__col { flex: 1; min-width: 0; }

.bcm__body :deep(p) {
  margin: 0 0 12px; color: var(--nu-cream-text-90);
  font-size: 15.5px; font-weight: 500; line-height: 1.7; max-width: 720px;
  overflow-wrap: break-word;
}
.bcm__body :deep(ul),
.bcm__body :deep(ol) {
  margin: 0 0 12px; padding-left: 22px; color: var(--nu-cream-text-90);
  font-size: 15.5px; font-weight: 500; line-height: 1.7; max-width: 720px;
}
.bcm__body :deep(li) { margin: 0 0 4px; }
.bcm__body :deep(strong) { font-weight: 800; color: var(--nu-cream-text); }
.bcm__body :deep(a) { color: var(--nu-blue-soft); text-decoration: underline; text-underline-offset: 2px; }
.bcm__body :deep(.md-table) { overflow-x: auto; margin: 0 0 12px; max-width: 720px; }
.bcm__body :deep(table) { border-collapse: collapse; min-width: 420px; }
.bcm__body :deep(th) {
  text-align: left; color: var(--nu-cream-text-55); font-size: 11.5px; font-weight: 800;
  letter-spacing: .8px; text-transform: uppercase; padding: 8px 16px 8px 0; white-space: nowrap;
}
.bcm__body :deep(td) {
  color: var(--nu-cream-text-90); font-size: 14px; font-weight: 500; line-height: 1.55;
  padding: 8px 16px 8px 0; border-top: 1px solid var(--nu-cream-text-10);
  font-variant-numeric: tabular-nums;
}
.bcm__body :deep(code) {
  background: var(--nu-cream-text-10); border-radius: 6px; padding: 1px 6px;
  font-size: 13.5px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.bcm__error { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 2px 0 10px; color: var(--nu-red-soft); font-size: 13.5px; font-weight: 600; line-height: 1.5; }
.bcm__login {
  display: inline-flex; align-items: center;
  color: var(--nu-cream-text); border: 1.5px solid var(--nu-cream-text-35);
  border-radius: var(--nu-r-pill); padding: 6px 14px;
  font-size: 12.5px; font-weight: 800; transition: background .2s, border-color .2s;
}
.bcm__login:hover { background: var(--nu-cream-text-10); border-color: var(--nu-cream-text-70); color: var(--nu-cream-text); }

.bcm__sources { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 2px; }
.bcm__source {
  display: inline-block;
  background: var(--nu-cream-text-10); color: var(--nu-cream-text-75);
  font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: var(--nu-r-pill);
  max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  border: none;
}
.bcm__source--more { cursor: pointer; color: var(--nu-cream-text); }
.bcm__source--more:hover { background: var(--nu-cream-text-14); }
.bcm__source--link:hover { background: var(--nu-cream-text-12); color: var(--nu-cream-text); }

.bcm__follow { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
.bcm__chip {
  background: transparent; color: var(--nu-cream-text);
  border: 1.5px solid var(--nu-cream-text-35); border-radius: var(--nu-r-pill);
  padding: 8px 15px; font-size: 13px; font-weight: 700; cursor: pointer;
  transition: background .2s, border-color .2s;
}
.bcm__chip:hover { background: var(--nu-cream-text-10); border-color: var(--nu-cream-text-70); }
.bcm__chip:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }
</style>
