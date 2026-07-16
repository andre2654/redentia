<script setup lang="ts">
// Pills das contas conectadas no hero da carteira (pedido do dono 2026-07-16):
// uma pill por conexão Open Finance com logo da instituição, patrimônio NA
// instituição (saldo em conta BANK + total investido, campos bank_balance/
// positions_value do GET /pluggy/connections) e quantidade de ativos; mais
// uma pill PONTILHADA que abre o widget do Pluggy pra conectar outra conta
// (mesmo fluxo do CarteiraConnect via usePluggyConnect).
//
// Pill de conexão navega pra /conta#open-finance (gerenciar/reconectar). Os
// valores respeitam o botão-olho (useHiddenValues). Fetch client-side no
// mounted (a página é auth-gated); erro degrada pra só a pill de conectar —
// nunca quebra o hero.
import type { PluggyConnection } from '~/types/pluggy'

const emit = defineEmits<{ (e: 'connected'): void }>()

const pluggy = usePluggy()
const { openWidget, opening, registering } = usePluggyConnect()
const { hidden } = useHiddenValues()

const connections = ref<PluggyConnection[]>([])
const loading = ref(true)

async function load() {
  try {
    connections.value = await pluggy.listConnections()
  }
  catch { /* hero segue sem pills; a de conectar fica */ }
  finally {
    loading.value = false
  }
}
onMounted(() => void load())

function connect() {
  if (opening.value || registering.value) return
  openWidget({
    onConnected: async () => {
      emit('connected')
      await load()
    },
  })
}

// patrimônio NA instituição = saldo bancário + investido (sem fatura de cartão)
function pillTotal(c: PluggyConnection): string {
  if (hidden.value) return 'R$ ••'
  const total = (c.bank_balance ?? c.total_balance ?? 0) + (c.positions_value ?? 0)
  return total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function pillAtivos(c: PluggyConnection): string {
  return `${c.positions_count} ${c.positions_count === 1 ? 'ativo' : 'ativos'}`
}

const connectLabel = computed(() =>
  opening.value || registering.value ? 'Abrindo…' : 'Conectar conta')
</script>

<template>
  <div class="ccp" aria-label="Contas conectadas">
    <template v-if="loading">
      <NuSkeleton variant="line" width="172px" height="44px" radius="pill" />
      <NuSkeleton variant="line" width="144px" height="44px" radius="pill" />
    </template>

    <template v-else>
      <NuxtLink
        v-for="c in connections" :key="c.id"
        to="/conta#open-finance"
        class="ccp__pill"
        :aria-label="`${c.institution_name}: ${pillTotal(c)}, ${pillAtivos(c)}. Gerenciar conexões.`"
      >
        <span class="ccp__logo" aria-hidden="true">
          <img v-if="c.institution_logo" :src="c.institution_logo" alt="" class="ccp__logo-img" loading="lazy" width="26" height="26">
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M6 21V7l6-4 6 4v14" /></svg>
        </span>
        <span class="ccp__total">{{ pillTotal(c) }}</span>
        <span class="ccp__ativos">· {{ pillAtivos(c) }}</span>
      </NuxtLink>

      <button
        type="button"
        class="ccp__pill ccp__pill--add"
        :disabled="opening || registering"
        @click="connect"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
        {{ connectLabel }}
      </button>
    </template>
  </div>
</template>

<style scoped>
.ccp { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 26px; }

.ccp__pill {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--nu-white); border: 1.5px solid transparent;
  border-radius: var(--nu-r-pill); padding: 8px 16px 8px 9px;
  box-shadow: var(--nu-shadow-card);
  transition: border-color .18s, transform .15s, box-shadow .18s;
}
a.ccp__pill:hover { border-color: var(--nu-sand-border); transform: translateY(-1px); }
a.ccp__pill:focus-visible, button.ccp__pill:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

.ccp__logo {
  width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0; overflow: hidden;
  background: var(--nu-cream); color: var(--nu-gray);
  display: inline-flex; align-items: center; justify-content: center;
}
.ccp__logo-img { width: 100%; height: 100%; object-fit: contain; display: block; }

.ccp__total { color: var(--nu-ink); font-size: 14.5px; font-weight: 800; font-variant-numeric: tabular-nums; }
.ccp__ativos { color: var(--nu-gray); font-size: 13px; font-weight: 600; white-space: nowrap; }

/* pill pontilhada de conectar: quieta, vira convite no hover */
.ccp__pill--add {
  gap: 7px; padding: 8px 16px; cursor: pointer;
  background: transparent; box-shadow: none;
  border: 1.5px dashed var(--nu-sand-border);
  color: var(--nu-gray-2); font-family: inherit; font-size: 13.5px; font-weight: 700;
  transition: border-color .18s, color .18s, background .18s;
}
.ccp__pill--add:hover:not(:disabled) { border-color: var(--nu-blue); color: var(--nu-blue); background: var(--nu-blue-tint-2); }
.ccp__pill--add:disabled { opacity: .6; cursor: default; }
</style>
