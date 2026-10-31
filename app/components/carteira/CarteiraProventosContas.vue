<script setup lang="ts">
// Proventos e contas (31/10/2026): os dois cartões quietos do fim da
// /carteira. À esquerda, o que está a caminho (a agenda do /dividends/upcoming
// cruzada com as posições) ou, sem agenda, o que entrou no mês. À direita, as
// contas do Open Finance: o patrimônio em cada banco, o dinheiro parado em
// conta e "Conectar outra conta".
//
// Os números são os do useCarteira (buildIncome) e do GET /pluggy/connections
// (useContasConectadas, um fetch por página). Cartão sem dado some; a grade
// fecha sozinha com o que sobrou.
import type { CarteiraIncomeVM } from '~/types/carteira'
import type { PluggyConnection } from '~/types/pluggy'

defineProps<{ income: CarteiraIncomeVM | null }>()
const emit = defineEmits<{ (e: 'connected'): void }>()

const { hidden, mask } = useHiddenValues()
const { connections, loading, ensure, refresh, saldoTotal } = useContasConectadas()
onMounted(ensure)

const { openWidget, opening, registering, error } = usePluggyConnect()
const conectado = ref(false)
function conectar() {
  if (opening.value || registering.value) return
  openWidget({
    onConnected: async () => {
      conectado.value = true
      emit('connected')
      await refresh()
    },
  })
}

const brl0 = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
function totalDa(c: PluggyConnection): string {
  if (hidden.value) return 'R$ ••'
  return brl0((c.bank_balance ?? c.total_balance ?? 0) + (c.positions_value ?? 0))
}
const STATUS: Record<string, string> = {
  UPDATING: 'Atualizando',
  CREATING: 'Sincronizando',
  OUTDATED: 'Desatualizada',
  LOGIN_ERROR: 'Reconectar',
  WAITING_USER_INPUT: 'Reconectar',
  ERROR: 'Reconectar',
  ITEM_NOT_FOUND: 'Reconectar',
}
const rotuloConectar = computed(() => (opening.value || registering.value ? 'Abrindo conexão segura…' : 'Conectar outra conta'))
</script>

<template>
  <section class="cpc" aria-label="Proventos e contas" data-clarity-mask="true">
    <div class="cpc__grade">
      <article v-if="income && (income.agenda || income.month)" id="renda-passiva" class="cpc__card">
        <header class="cpc__head">
          <h2 class="cpc__titulo">Proventos</h2>
          <span class="cpc__conta">{{ income.agenda ? income.agenda.footLabel : income.month?.subLabel }}</span>
        </header>

        <template v-if="income.agenda">
          <div class="cpc__destaque">
            <span class="cpc__destaque-val">{{ hidden ? '+R$ ••' : income.agenda.footVal }}</span>
            <span class="cpc__destaque-txt">a caminho</span>
          </div>
          <ul class="cpc__lista">
            <li v-for="r in income.agenda.rows" :key="`${r.ticker}-${r.d}-${r.m}`" class="cpc__linha">
              <span class="cpc__data"><strong>{{ r.d }}</strong>{{ r.m.toLowerCase() }}</span>
              <span class="cpc__nome"><strong>{{ r.ticker }}</strong><span>{{ r.tipo }}</span></span>
              <span class="cpc__val">{{ hidden ? '+R$ ••' : r.val }}</span>
            </li>
          </ul>
        </template>

        <template v-else-if="income.month">
          <div class="cpc__destaque">
            <span class="cpc__destaque-val">{{ hidden ? '+R$ ••' : income.month.total }}</span>
            <span class="cpc__destaque-txt">{{ income.month.label.toLowerCase() }}</span>
          </div>
          <ul class="cpc__lista">
            <li v-for="p in income.month.payments" :key="`${p.ticker}-${p.d}`" class="cpc__linha">
              <span class="cpc__data"><strong>{{ p.d }}</strong>{{ income.month.label.slice(0, 3).toLowerCase() }}</span>
              <span class="cpc__nome"><strong>{{ p.ticker }}</strong><span>{{ p.tipo }}</span></span>
              <span class="cpc__val">{{ hidden ? '+R$ ••' : p.val }}</span>
            </li>
          </ul>
        </template>

        <p class="cpc__pe">{{ hidden ? 'R$ •• nos últimos 12 meses' : income.sub }}</p>
      </article>

      <article id="contas" class="cpc__card">
        <header class="cpc__head">
          <h2 class="cpc__titulo">Suas contas</h2>
          <NuxtLink to="/conta#open-finance" class="cpc__gerenciar">Gerenciar</NuxtLink>
        </header>

        <div v-if="loading" class="cpc__esq" aria-busy="true">
          <div v-for="i in 2" :key="i" class="cpc__esq-linha">
            <NuSkeleton variant="circle" width="40px" />
            <NuSkeleton width="50%" height="16px" radius="chip" />
            <NuSkeleton width="72px" height="16px" radius="chip" />
          </div>
        </div>

        <ul v-else-if="connections.length" class="cpc__lista">
          <li v-for="c in connections" :key="c.id" class="cpc__linha cpc__linha--conta">
            <span class="cpc__logo" aria-hidden="true">
              <img v-if="c.institution_logo" :src="c.institution_logo" alt="" width="40" height="40" loading="lazy">
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M6 21V7l6-4 6 4v14" /></svg>
            </span>
            <span class="cpc__nome">
              <strong>{{ c.institution_name }}</strong>
              <span>
                {{ c.positions_count }} {{ c.positions_count === 1 ? 'ativo' : 'ativos' }}
                <template v-if="STATUS[c.status]"> · <em class="cpc__status">{{ STATUS[c.status] }}</em></template>
              </span>
            </span>
            <span class="cpc__val cpc__val--ink">{{ totalDa(c) }}</span>
          </li>
        </ul>

        <p v-if="!loading && saldoTotal > 0" class="cpc__saldo">
          <span>Parado em conta corrente</span>
          <strong>{{ hidden ? 'R$ ••' : brl0(saldoTotal) }}</strong>
        </p>

        <span class="cpc__respiro" aria-hidden="true" />
        <button type="button" class="cpc__conectar" :disabled="opening || registering" @click="conectar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          {{ rotuloConectar }}
        </button>
        <p v-if="conectado" class="cpc__ok" role="status">Conta conectada. As posições dela chegam aqui em alguns minutos.</p>
        <p v-else-if="error" class="cpc__erro" role="alert">{{ error }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.cpc {
  background: var(--nu-cream);
  padding: clamp(56px, 7.5vw, 96px) clamp(22px, 5.5vw, 80px);
}
.cpc__grade { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(380px, 100%), 1fr)); gap: clamp(16px, 2vw, 24px); align-items: stretch; }
/* os dois cartões com a mesma altura; o "Conectar outra conta" desce para o pé */
.cpc__card {
  background: var(--nu-white); border-radius: var(--nu-r-card); padding: clamp(22px, 3vw, 32px); box-shadow: var(--nu-shadow-card);
  display: flex; flex-direction: column; scroll-margin-top: calc(var(--nuh-h, 76px) + 56px);
}
.cpc__head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.cpc__titulo { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.02em; }
.cpc__conta { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.cpc__gerenciar { color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 700; }
.cpc__gerenciar:hover { color: var(--nu-blue-hover); }

.cpc__destaque {
  display: inline-flex; align-items: baseline; gap: 10px; margin-top: 18px; align-self: flex-start;
  background: var(--nu-green-bg); color: var(--nu-green-2);
  border-radius: var(--nu-r-input); padding: 10px 16px;
}
.cpc__destaque-val { font-size: clamp(26px, 3vw, 34px); font-weight: 800; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.cpc__destaque-txt { font-size: var(--nu-fs-xs); font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }

.cpc__lista { list-style: none; margin: 14px 0; padding: 0; }
.cpc__linha { display: flex; align-items: center; gap: 14px; padding: 13px 0; border-bottom: 1px solid var(--nu-cream-2); }
.cpc__linha:last-child { border-bottom: none; }
.cpc__data { display: flex; flex-direction: column; align-items: center; width: 34px; flex-shrink: 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; line-height: 1.1; }
.cpc__data strong { color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; font-variant-numeric: tabular-nums; }
.cpc__nome { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.cpc__nome strong { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cpc__nome span { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cpc__status { font-style: normal; color: var(--nu-amber-text); font-weight: 700; }
.cpc__val { color: var(--nu-green-text); font-size: var(--nu-fs-md); font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap; }
.cpc__val--ink { color: var(--nu-ink); }
.cpc__pe { margin: auto 0 0; padding-top: 14px; border-top: 1px solid var(--nu-cream-2); color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; font-variant-numeric: tabular-nums; }

.cpc__logo {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; overflow: hidden;
  background: var(--nu-cream); color: var(--nu-gray);
  display: inline-flex; align-items: center; justify-content: center;
}
.cpc__logo img { width: 100%; height: 100%; object-fit: contain; display: block; }

.cpc__esq { margin-top: 14px; display: flex; flex-direction: column; gap: 4px; }
.cpc__esq-linha { display: flex; align-items: center; gap: 14px; padding: 12px 0; }

.cpc__saldo {
  display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
  margin: 6px 0 0; padding: 12px 14px; border-radius: var(--nu-r-chip); background: var(--nu-cream);
  color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500;
}
.cpc__saldo strong { color: var(--nu-ink); font-weight: 800; font-variant-numeric: tabular-nums; }

.cpc__conectar {
  margin-top: auto; width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  background: transparent; border: 1.5px dashed var(--nu-sand-border); border-radius: var(--nu-r-pill);
  padding: 13px 18px; cursor: pointer; font-family: inherit;
  color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 700;
  transition: border-color .18s, color .18s, background .18s;
}
.cpc__respiro { display: block; min-height: 18px; flex: 0 0 18px; }
.cpc__conectar:hover:not(:disabled) { border-color: var(--nu-blue); color: var(--nu-blue-text); background: var(--nu-blue-tint-2); }
.cpc__conectar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.cpc__conectar:disabled { opacity: .6; cursor: default; }
.cpc__ok { margin: 12px 0 0; color: var(--nu-green-text); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.cpc__erro { margin: 12px 0 0; color: var(--nu-red-text); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
</style>
