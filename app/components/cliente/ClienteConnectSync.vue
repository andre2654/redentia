<script setup lang="ts">
/**
 * Passo 6 — conectando / sincronizando: a lista de etapas que o Pluggy roda
 * depois da autorização (o item sai de UPDATING para UPDATED enquanto o
 * conector busca os dados). Cada etapa vai do ponto ao giro e do giro ao
 * check; a última só fecha quando o POST de consentimento volta. Erro vira
 * frase completa com "Tentar de novo" (ou "Recarregar", quando o termo
 * mudou), nunca spinner eterno.
 */
import type { Instituicao } from '~/content/instituicoes'
import type { EtapaSync } from '~/composables/useClienteConexao'

defineProps<{
  inst: Instituicao
  etapas: EtapaSync[]
  erro: string | null
  recarregar: boolean
}>()
const emit = defineEmits<{ tentar: [], recarregar: [], inicio: [] }>()
</script>

<template>
  <section class="ccs">
    <h1 data-cc-titulo tabindex="-1" class="ccs__h1">{{ erro ? 'Não deu para concluir a conexão' : `Conectando ao ${inst.name}` }}</h1>
    <p v-if="!erro" class="ccs__p">Isso leva alguns segundos. Não feche esta tela.</p>

    <ol class="ccs__etapas" aria-live="polite" aria-busy="true">
      <li v-for="(e, i) in etapas" :key="i" class="ccs__e" :class="`ccs__e--${e.status}`">
        <span class="ccs__ico" aria-hidden="true">
          <svg v-if="e.status === 'feito'" class="ccs__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          <span v-else-if="e.status === 'andamento'" class="ccs__giro" />
          <span v-else class="ccs__ponto" />
        </span>
        <span class="ccs__label">{{ e.label }}</span>
        <span class="ccs__sr">{{ e.status === 'feito' ? 'concluído' : e.status === 'andamento' ? 'em andamento' : 'pendente' }}</span>
      </li>
    </ol>

    <p v-if="erro" class="ccs__erro" role="alert">{{ erro }}</p>

    <footer v-if="erro" class="ccs__foot">
      <ClienteConnectButton v-if="recarregar" @click="emit('recarregar')">Recarregar a página</ClienteConnectButton>
      <ClienteConnectButton v-else @click="emit('tentar')">Tentar de novo</ClienteConnectButton>
      <button type="button" class="ccs__inicio" @click="emit('inicio')">Voltar ao início</button>
    </footer>
  </section>
</template>

<style scoped>
.ccs { flex: 1 1 auto; display: flex; flex-direction: column; }
.ccs__h1 { margin: 0; color: var(--nu-ink); font-size: 18px; font-weight: 800; letter-spacing: -.025em; line-height: 1.28; outline: none; }
.ccs__p { margin: 8px 0 0; color: var(--nu-gray-2); font-size: 13.5px; font-weight: 500; line-height: 1.5; }

.ccs__etapas { list-style: none; margin: 24px 0 0; padding: 0; display: flex; flex-direction: column; }
.ccs__e { display: flex; align-items: center; gap: 14px; min-height: 48px; color: var(--nu-gray); font-size: 14.5px; font-weight: 600; transition: color .25s; }
.ccs__e + .ccs__e { border-top: 1px solid var(--nu-cream-2); }
.ccs__e--andamento { color: var(--nu-ink); font-weight: 700; }
.ccs__e--feito { color: var(--nu-ink); }
.ccs__ico { width: 26px; height: 26px; flex-shrink: 0; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; }
.ccs__ponto { width: 8px; height: 8px; border-radius: 50%; background: var(--nu-cream-2); }
.ccs__giro {
  width: 18px; height: 18px; border-radius: 50%; border: 2.5px solid var(--nu-cream-2); border-top-color: var(--nu-blue);
  animation: ccs-gira .7s linear infinite;
}
@keyframes ccs-gira { to { transform: rotate(360deg); } }
.ccs__e--feito .ccs__ico { background: var(--nu-green-bg); color: var(--nu-green-2); animation: ccs-pop .25s ease both; }
.ccs__check path { stroke-dasharray: 24; stroke-dashoffset: 24; animation: ccs-traco .3s ease-out .05s forwards; }
@keyframes ccs-traco { to { stroke-dashoffset: 0; } }
@keyframes ccs-pop { from { transform: scale(.7); } to { transform: scale(1); } }
.ccs__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

.ccs__erro { margin: 18px 0 0; padding: 12px 14px; border-radius: 10px; background: var(--nu-red-tint); color: var(--nu-ink); font-size: 13.5px; font-weight: 600; line-height: 1.5; }
.ccs__foot { margin-top: auto; padding-top: 22px; display: flex; flex-direction: column; gap: 10px; align-items: center; }
.ccs__inicio { padding: 8px 12px; border: none; background: none; color: var(--nu-gray); font-family: inherit; font-size: 13.5px; font-weight: 700; cursor: pointer; }
.ccs__inicio:hover { color: var(--nu-ink); }
.ccs__inicio:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; border-radius: 6px; }
</style>
