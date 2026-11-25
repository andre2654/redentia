<script setup lang="ts">
// As contas da carteira, no trilho (24/11/2026, o dono: "as contas devem ficar
// na sidebar"). Moravam no pé do cartão do gráfico: de quando é cada conexão,
// o "Reconectar" da que parou e o "Adicionar conta". Aqui são as mesmas regras
// (todo dado diz a data; a conexão que nunca sincronizou diz isso) e o mesmo
// fluxo do widget do agregador, com o aviso de falha e a ajuda pelo WhatsApp.
import type { ConexaoVisao } from '~/types/carteiraVisao'
import { quandoAtualizou } from '~/utils/carteiraVisao'

const props = defineProps<{ conexoes: ConexaoVisao[] }>()
const emit = defineEmits<{ (e: 'connected'): void }>()

const FONTE: Record<string, string> = { posicoes: 'posições', transacoes: 'transações', proventos: 'proventos', cartao: 'cartão' }
const contas = computed(() => props.conexoes.map((c) => {
  const quando = c.atualizadaEm ? quandoAtualizou(c.atualizadaEm) : null
  return {
    ...c,
    quando: !quando ? 'ainda sem sincronizar' : c.estado === 'ok' ? `atualizado ${quando}` : `parado desde ${quando}`,
    traz: c.fontes.length ? c.fontes.map((f) => FONTE[f] ?? f).join(', ') : null,
  }
}))

const { openWidget, opening, registering, error: erro, falha, pedirContato } = usePluggyConnect()
const conectou = ref(false)
const abrindo = computed(() => opening.value || registering.value)
function adicionar() {
  if (abrindo.value) return
  openWidget({ onConnected: () => { conectou.value = true; emit('connected') } })
}
</script>

<template>
  <div class="cct">
    <p class="cct__rotulo">Contas</p>
    <ul v-if="contas.length" class="cct__lista">
      <li v-for="c in contas" :key="c.id" class="cct__conta" :title="c.traz ? `Traz ${c.traz}` : undefined">
        <i class="cct__ponto" :class="`cct__ponto--${c.estado}`" aria-hidden="true" />
        <span class="cct__txt">
          <span class="cct__nome">{{ c.instituicao }}</span>
          <span class="cct__quando">{{ c.quando }}</span>
        </span>
        <NuxtLink v-if="c.estado !== 'ok'" to="/conta#open-finance" class="cct__reconectar">Reconectar</NuxtLink>
      </li>
    </ul>
    <button type="button" class="cct__mais" :disabled="abrindo" :aria-busy="abrindo || undefined" @click="adicionar">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      {{ abrindo ? 'Abrindo…' : 'Adicionar conta' }}
    </button>
    <p v-if="conectou" class="cct__aviso" role="status">Conta conectada. As posições dela chegam aqui em alguns minutos.</p>
    <p v-else-if="erro" class="cct__aviso cct__aviso--erro" role="alert">{{ erro }}</p>
    <CarteiraAjudaConexao v-if="!conectou" :falha="falha" :pedir="pedirContato" />
  </div>
</template>

<style scoped>
.cct { display: flex; flex-direction: column; padding-top: 22px; border-top: 1px solid var(--nu-line-2); }
.cct__rotulo { margin: 0; min-height: 28px; color: var(--nu-gray); font-size: 15px; }
.cct__lista { margin: 4px 0 0; padding: 0; list-style: none; }
.cct__conta { display: flex; align-items: flex-start; gap: 10px; min-height: 44px; padding: 4px 0; }
.cct__ponto { flex: none; width: 7px; height: 7px; margin-top: 8px; border-radius: 50%; background: var(--nu-green); }
.cct__ponto:not(.cct__ponto--ok) { background: var(--nu-amber-fill); }
.cct__txt { display: flex; flex-direction: column; flex: 1; min-width: 0; line-height: 1.3; }
.cct__nome { overflow: hidden; color: var(--nu-ink); font-size: 15px; text-overflow: ellipsis; white-space: nowrap; }
.cct__quando { color: var(--nu-gray); font-size: 13px; }
.cct__reconectar { flex: none; display: inline-flex; align-items: center; min-height: 44px; margin: -6px 0; color: var(--nu-blue-text); font-size: 14px; text-underline-offset: 3px; }
.cct__mais { display: inline-flex; align-items: center; gap: 8px; align-self: flex-start; min-height: 44px; padding: 0; border: 0; background: transparent; color: var(--nu-gray-3); font: inherit; font-size: 15px; cursor: pointer; transition: color var(--nu-dur-rapida, .15s) var(--nu-ease-saida, ease); }
.cct__mais:hover:not(:disabled) { color: var(--nu-ink); text-decoration: underline; text-underline-offset: 4px; }
.cct__mais:disabled { opacity: .6; cursor: progress; }
.cct__mais:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 2px; border-radius: 6px; }
.cct__aviso { margin: 6px 0 0; color: var(--nu-gray-3); font-size: 13.5px; line-height: 1.45; }
.cct__aviso--erro { color: var(--nu-red-text); }
</style>
