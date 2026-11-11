<script setup lang="ts">
// Uma mensagem do painel do chat (02/11/2026; vestida de Aportou em 11/11/2026).
// A da pessoa: balão cobalto à direita, com os chips do que ela mostrou da
// página. A da IA: o avatar carvão com o corte e o balão branco com fio, e as
// palavras surgindo do desfoque à medida que o stream chega
// (utils/revelar-palavras.ts). As fontes ficam dentro do balão, em chips de
// contorno; as perguntas de continuação, embaixo dele.
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
    <div v-if="msg.contextos?.length" class="cms__ctxs" aria-label="O que foi mostrado à IA">
      <span v-for="c in msg.contextos" :key="c.rotulo" class="cms__ctx">
        <ChatIconeContexto :tipo="c.tipo" />{{ c.rotulo }}
      </span>
    </div>
    <div class="cms__bolha">{{ msg.content }}</div>
  </div>

  <div v-else class="cms cms--ia">
    <div class="cms__linha">
      <span class="cms__avatar" aria-hidden="true"><MarcaCorte :largura="16" cor="var(--nu-blue-on-dark)" /></span>
      <div class="cms__balao">
        <!-- eslint-disable-next-line vue/no-v-html — chatMarkdown escapa tudo antes -->
        <div v-if="msg.content" class="cms__corpo" v-html="html" />

        <div v-if="msg.error" class="cms__erro">
          <span>{{ msg.error }}</span>
          <NuxtLink v-if="msg.authExpired" :to="loginHref" class="cms__entrar">Entrar de novo</NuxtLink>
        </div>

        <div v-if="msg.citations.length && (msg.done || !aoVivo)" class="cms__fontes" aria-label="Fontes">
          <template v-for="c in fontesVisiveis" :key="c.url || c.title">
            <a v-if="c.url" :href="c.url" target="_blank" rel="noopener noreferrer nofollow" class="cms__fonte cms__fonte--link">{{ chipFonte(c) }}</a>
            <span v-else class="cms__fonte">{{ chipFonte(c) }}</span>
          </template>
          <button v-if="fontesEscondidas > 0" type="button" class="cms__fonte cms__fonte--mais" @click="fontesAbertas = true">+{{ fontesEscondidas }} fontes</button>
        </div>
      </div>
    </div>

    <div v-if="mostrarFollowups && msg.followups.length" class="cms__segue">
      <button v-for="(f, k) in msg.followups" :key="f" type="button" class="cms__chip" :style="{ '--k': k }" @click="emit('followup', f)">{{ f }}</button>
    </div>
  </div>
</template>

<style scoped>
/* a mensagem entra subindo (nu-fade) */
.cms { animation: nu-fade .32s cubic-bezier(.2, .8, .2, 1) both; }

.cms--eu { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; margin: 16px 0 12px; }
.cms__ctxs { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; max-width: 92%; }
.cms__ctx {
  display: inline-flex; align-items: center; gap: 6px; max-width: 240px;
  padding: 5px 11px 5px 8px; border-radius: var(--nu-r-pill);
  background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-line-2);
  color: var(--nu-gray-3); font-size: var(--nu-fs-dense); font-weight: 700;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
/* o balão da pessoa: cobalto, com a ponta embaixo à direita */
.cms__bolha {
  background: var(--nu-blue); color: var(--nu-white);
  font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5;
  padding: 11px 16px; border-radius: 20px 20px 5px 20px; max-width: 84%;
  white-space: pre-wrap; overflow-wrap: break-word;
}

.cms--ia { margin: 0 0 16px; }
.cms__linha { display: flex; align-items: flex-start; gap: 10px; }
/* o avatar da IA: o corte do "t" no círculo carvão */
.cms__avatar {
  flex: none; width: 30px; height: 30px; border-radius: 50%; background: var(--nu-ink);
  display: grid; place-items: center;
}
/* o balão da IA: branco com fio, com a ponta em cima à esquerda */
.cms__balao {
  flex: 1; min-width: 0; padding: 14px 16px; border-radius: 5px 20px 20px 20px;
  background: var(--nu-white); box-shadow: 0 0 0 1px var(--nu-line-2);
  display: flex; flex-direction: column; gap: 12px;
}
.cms__corpo { color: var(--nu-ink); min-width: 0; }
.cms__corpo :deep(p) { margin: 0 0 12px; font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; overflow-wrap: break-word; }
.cms__corpo :deep(ul), .cms__corpo :deep(ol) { margin: 0 0 12px; padding-left: 20px; font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; }
.cms__corpo :deep(li) { margin: 0 0 6px; padding-left: 2px; }
.cms__corpo :deep(ul > li::marker) { color: var(--nu-blue); }
.cms__corpo :deep(ol > li::marker) { color: var(--nu-blue-text); font-weight: 700; }
.cms__corpo :deep(strong) { font-weight: 700; }
.cms__corpo :deep(a) { color: var(--nu-blue-text); font-weight: 600; text-decoration: underline; text-underline-offset: 2px; }
/* a tabela do markdown: cabeçalho em caixa alta sobre um fio, linhas com fio leve */
.cms__corpo :deep(.md-table) { overflow-x: auto; margin: 0 0 12px; }
.cms__corpo :deep(table) { border-collapse: collapse; min-width: 100%; }
.cms__corpo :deep(th) {
  text-align: left; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase; padding: 4px 14px 8px 0; white-space: nowrap;
  border-bottom: 1.5px solid var(--nu-line);
}
.cms__corpo :deep(td) {
  font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.45; padding: 9px 14px 9px 0;
  border-top: 1px solid var(--nu-line-2); font-variant-numeric: tabular-nums; vertical-align: top;
}
.cms__corpo :deep(tbody tr:first-child td) { border-top: 0; }
.cms__corpo :deep(th:last-child), .cms__corpo :deep(td:last-child) { padding-right: 0; }
.cms__corpo :deep(code) { background: var(--nu-cream); border-radius: 6px; padding: 1px 6px; font-size: var(--nu-fs-sm); }
.cms__corpo :deep(:last-child) { margin-bottom: 0; }

/* a palavra surgindo do desfoque (a keyframe está em base.css) */
.cms__corpo :deep(.rp) { display: inline-block; animation: nu-palavra .52s cubic-bezier(.22, 1, .36, 1) backwards; }
.cms__corpo :deep(.rp--ja) { animation: none; }

.cms__erro {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  padding: 10px 12px; border-radius: var(--nu-r-chip); background: var(--nu-red-bg);
  color: var(--nu-red-text); font-size: var(--nu-fs-sm); font-weight: 600; line-height: 1.45;
}
.cms__entrar {
  display: inline-flex; align-items: center; min-height: 36px; padding: 0 14px; border-radius: var(--nu-r-pill);
  background: var(--nu-ink); color: var(--nu-white); font-size: var(--nu-fs-dense); font-weight: 700;
  transition: background .2s;
}
.cms__entrar:hover { background: var(--nu-gray-3); color: var(--nu-white); }

/* as fontes: chips de contorno, dentro do balão */
.cms__fontes { display: flex; flex-wrap: wrap; gap: 6px; animation: nu-fade .4s ease both; }
.cms__fonte {
  display: inline-block; max-width: 100%; padding: 4px 10px; border-radius: var(--nu-r-pill); border: 0;
  background: transparent; box-shadow: inset 0 0 0 1px var(--nu-line);
  color: var(--nu-gray); font: inherit; font-size: var(--nu-fs-xs); font-weight: 600; line-height: 1.5;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  transition: box-shadow .2s ease, color .2s ease, background .2s ease;
}
.cms__fonte--link:hover, .cms__fonte--mais:hover { box-shadow: inset 0 0 0 1.5px var(--nu-ink); color: var(--nu-ink); }
.cms__fonte--mais { cursor: pointer; color: var(--nu-ink); font-weight: 700; }

/* as perguntas de continuação: chips creme de 44px, alinhados ao balão */
.cms__segue { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; padding-left: 40px; }
.cms__chip {
  min-height: 44px; max-width: 100%; text-align: left; padding: 8px 16px; border: 0; border-radius: 22px;
  background: var(--nu-cream-2); cursor: pointer;
  color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-sm); font-weight: 600; line-height: 1.35;
  animation: nu-fade .32s cubic-bezier(.2, .8, .2, 1) both; animation-delay: calc(var(--k) * 60ms);
  transition: background .2s ease, color .2s ease;
}
.cms__chip:hover { background: var(--nu-ink); color: var(--nu-white); }
.cms__chip:active { transform: scale(.98); }

@media (max-width: 760px) {
  .cms__linha { gap: 8px; }
  .cms__avatar { width: 26px; height: 26px; }
  .cms__balao { padding: 12px 14px; }
  .cms__segue { padding-left: 34px; }
}
</style>
