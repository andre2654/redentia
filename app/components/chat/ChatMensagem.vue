<script setup lang="ts">
// Uma mensagem do painel do chat (02/11/2026). A da pessoa: bolha creme à
// direita, com os chips do que ela mostrou da página. A da Redentia: texto
// direto no painel, sem avatar, e as palavras surgindo do desfoque à medida
// que o stream chega (o efeito do herói antigo da home; utils/revelar-palavras.ts).
// Palavra já revelada nunca anima de novo; movimento reduzido = texto puro.
// O markdown é o mesmo do chat da /busca (utils/markdown.ts, escapa antes).
import type { NuChatCitation, NuChatMsg } from '~/composables/useNuChat'
import { agendarPalavras, contarPalavras, cortarPalavraIncompleta, envolverPalavras } from '~/utils/revelar-palavras'

const props = defineProps<{
  msg: NuChatMsg
  /** esta é a resposta que está chegando agora */
  aoVivo: boolean
  /** follow-ups só na última resposta e fora do streaming */
  mostrarFollowups: boolean
  /** volta do login quando a sessão expira */
  loginHref: string
}>()
const emit = defineEmits<{ (e: 'followup', t: string): void }>()

// Só anima a resposta que nasceu no painel: conversa reaberta do histórico
// entra inteira. Decidido uma vez, no setup.
const calmo = import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const animar = props.msg.role === 'assistant' && !props.msg.done && !calmo

const html = computed(() => {
  const terminou = !props.aoVivo || !!props.msg.done || !!props.msg.error
  const base = chatMarkdown(animar ? cortarPalavraIncompleta(props.msg.content, terminou) : props.msg.content)
  if (!animar || import.meta.server) return base
  const agora = performance.now()
  const agenda = agendarPalavras(agendaDe(props.msg.id), contarPalavras(base), agora)
  agendas.set(props.msg.id, agenda)
  return envolverPalavras(base, agenda, agora)
})

function chipFonte(c: NuChatCitation): string {
  return [c.publisher, c.title].filter(Boolean).join(' · ')
}
const LIMITE_FONTES = 4
const fontesAbertas = ref(false)
const fontesVisiveis = computed(() => (fontesAbertas.value ? props.msg.citations : props.msg.citations.slice(0, LIMITE_FONTES)))
const fontesEscondidas = computed(() => (fontesAbertas.value ? 0 : Math.max(0, props.msg.citations.length - LIMITE_FONTES)))
</script>

<script lang="ts">
// a agenda de cada resposta sobrevive ao painel fechar e abrir de novo
const agendas = new Map<string, number[]>()
function agendaDe(id: string): number[] { return agendas.get(id) ?? [] }
</script>

<template>
  <div v-if="msg.role === 'user'" class="cms cms--eu">
    <div v-if="msg.contextos?.length" class="cms__ctxs" aria-label="O que foi mostrado à Redentia">
      <span v-for="c in msg.contextos" :key="c.rotulo" class="cms__ctx">
        <ChatIconeContexto :tipo="c.tipo" />{{ c.rotulo }}
      </span>
    </div>
    <div class="cms__bolha">{{ msg.content }}</div>
  </div>

  <div v-else class="cms cms--ia">
    <!-- eslint-disable-next-line vue/no-v-html — chatMarkdown escapa tudo antes -->
    <div v-if="msg.content" class="cms__corpo" v-html="html" />

    <div v-if="msg.error" class="cms__erro">
      <span>{{ msg.error }}</span>
      <NuxtLink v-if="msg.authExpired" :to="loginHref" class="cms__entrar">Entrar de novo</NuxtLink>
    </div>

    <div v-if="msg.citations.length && (msg.done || !aoVivo)" class="cms__fontes">
      <template v-for="c in fontesVisiveis" :key="c.url || c.title">
        <a v-if="c.url" :href="c.url" target="_blank" rel="noopener noreferrer nofollow" class="cms__fonte cms__fonte--link">{{ chipFonte(c) }}</a>
        <span v-else class="cms__fonte">{{ chipFonte(c) }}</span>
      </template>
      <button v-if="fontesEscondidas > 0" type="button" class="cms__fonte cms__fonte--mais" @click="fontesAbertas = true">+{{ fontesEscondidas }} fontes</button>
    </div>

    <div v-if="mostrarFollowups && msg.followups.length" class="cms__segue">
      <button v-for="f in msg.followups" :key="f" type="button" class="cms__chip" @click="emit('followup', f)">{{ f }}</button>
    </div>
  </div>
</template>

<style scoped>
.cms--eu { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; margin: 22px 0 18px; }
.cms__ctxs { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; max-width: 92%; }
.cms__ctx {
  display: inline-flex; align-items: center; gap: 6px; max-width: 240px;
  padding: 5px 10px 5px 8px; border-radius: var(--nu-r-pill);
  background: var(--nu-white); box-shadow: 0 0 0 1px var(--nu-navy-07);
  color: var(--nu-gray-2); font-size: var(--nu-fs-xs); font-weight: 700;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.cms__bolha {
  background: var(--nu-cream); color: var(--nu-ink);
  font-size: var(--nu-fs-md); font-weight: 600; line-height: 1.5;
  padding: 11px 16px; border-radius: 20px 20px 6px 20px; max-width: 88%;
  white-space: pre-wrap; overflow-wrap: break-word;
}

.cms--ia { margin: 4px 0 22px; }
.cms__corpo { color: var(--nu-ink); }
.cms__corpo :deep(p) { margin: 0 0 14px; font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.65; overflow-wrap: break-word; }
.cms__corpo :deep(p:first-child) { font-size: var(--nu-fs-lg); font-weight: 700; letter-spacing: -0.01em; line-height: 1.5; }
.cms__corpo :deep(ul), .cms__corpo :deep(ol) { margin: 0 0 14px; padding-left: 20px; font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.65; }
.cms__corpo :deep(li) { margin: 0 0 6px; }
.cms__corpo :deep(li::marker) { color: var(--nu-gray); }
.cms__corpo :deep(strong) { font-weight: 800; }
.cms__corpo :deep(a) { color: var(--nu-blue-text); text-decoration: underline; text-underline-offset: 2px; }
.cms__corpo :deep(.md-table) { overflow-x: auto; margin: 0 0 14px; }
.cms__corpo :deep(table) { border-collapse: collapse; min-width: 100%; }
.cms__corpo :deep(th) {
  text-align: left; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700;
  letter-spacing: .06em; text-transform: uppercase; padding: 8px 14px 8px 0; white-space: nowrap;
}
.cms__corpo :deep(td) {
  font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; padding: 8px 14px 8px 0;
  border-top: 1px solid var(--nu-navy-07); font-variant-numeric: tabular-nums;
}
.cms__corpo :deep(code) { background: var(--nu-cream); border-radius: 6px; padding: 1px 6px; font-size: var(--nu-fs-sm); }
.cms__corpo :deep(:last-child) { margin-bottom: 0; }

/* a palavra surgindo do desfoque (o herói antigo da home) */
.cms__corpo :deep(.rp) { display: inline-block; animation: cms-palavra .52s cubic-bezier(.22, 1, .36, 1) backwards; }
.cms__corpo :deep(.rp--ja) { animation: none; }
@keyframes cms-palavra { from { opacity: 0; filter: blur(8px); transform: translateY(6px); } }

.cms__erro { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 4px; color: var(--nu-red-text); font-size: var(--nu-fs-sm); font-weight: 600; line-height: 1.5; }
.cms__entrar {
  display: inline-flex; align-items: center; padding: 6px 14px; border-radius: var(--nu-r-pill);
  border: 1.5px solid var(--nu-ink); color: var(--nu-ink); font-size: var(--nu-fs-dense); font-weight: 700;
  transition: background .2s;
}
.cms__entrar:hover { background: var(--nu-cream); color: var(--nu-ink); }

.cms__fontes { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; animation: nu-fade .4s ease both; }
.cms__fonte {
  display: inline-block; max-width: 100%; padding: 5px 11px; border-radius: var(--nu-r-pill); border: 0;
  background: var(--nu-cream); color: var(--nu-gray-2); font: inherit; font-size: var(--nu-fs-xs); font-weight: 700;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.cms__fonte--link:hover, .cms__fonte--mais:hover { background: var(--nu-cream-2); color: var(--nu-ink); }
.cms__fonte--mais { cursor: pointer; color: var(--nu-ink); }

.cms__segue { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; margin-top: 18px; animation: nu-fade .4s ease both; }
.cms__chip {
  max-width: 100%; text-align: left; padding: 9px 14px; border-radius: 16px;
  border: 1.5px solid var(--nu-cream-2); background: var(--nu-white); cursor: pointer;
  color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-sm); font-weight: 600; line-height: 1.4;
  transition: background .2s, border-color .2s;
}
.cms__chip:hover { background: var(--nu-cream); border-color: var(--nu-cream); }
.cms__chip:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
</style>
