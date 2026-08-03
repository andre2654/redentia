<script setup lang="ts">
/**
 * Banda C: as chaves.
 *
 * TABELA DE VERDADE dentro de UM painel branco com elevação, no lugar de cinco
 * linhas flex separadas por fio. O motivo é o que a tela pergunta: "qual chave
 * está queimando a quota" é uma comparação entre linhas, e comparação pede
 * coluna alinhada com número à direita, não frase com bullets.
 *
 * Abaixo de 880px a tabela DEIXA de ser tabela: cada chave vira um sub-card
 * creme dentro do mesmo painel branco. Rolagem horizontal deixaria o Revogar
 * fora da tela, e é o botão que destrói credencial.
 *
 * O SEGREDO ganha o único artefato escuro fora da banda navy. Ele é o momento
 * mais valioso da tela e antes era o mais discreto: creme sobre branco, 13,5px.
 */
import type { BusinessAccountStatus } from '~/composables/useBusinessAccount'

const props = defineProps<{
  conta: BusinessAccountStatus
  janela: number
  plainKey: string | null
  busy: boolean
  erro: string | null
  confirmando: number | null
  renomeando: number | null
  copiado: boolean
}>()

const emit = defineEmits<{
  (e: 'copiar'): void
  (e: 'gerar'): void
  (e: 'revogar', id: number): void
  (e: 'toggle', id: number, enabled: boolean): void
  (e: 'abrirRename', id: number, label: string): void
  (e: 'cancelarRename'): void
  (e: 'salvarRename', id: number): void
}>()

const rotulo = defineModel<string>('rotulo', { required: true })
const novoRotulo = defineModel<string>('novoRotulo', { required: true })

const num = (n: number | null | undefined) => (n ?? 0).toLocaleString('pt-BR')
const restantes = computed(() => props.conta.remaining_keys ?? 0)

/**
 * A COLUNA "PESO" TEM DOIS NÚMEROS DIFERENTES DE PROPÓSITO, e a distinção
 * importa: o PERCENTUAL é fatia do total, o mesmo que o hero mostra na barra
 * empilhada (senão a mesma chave apareceria como 48% em cima e 100% aqui, e o
 * leitor não teria como saber qual está certo). A LARGURA da barrinha é
 * relativa à chave mais usada, porque o que a coluna precisa fazer visualmente
 * é ranquear, e barras de 48%/30%/17% mal se distinguem.
 */
const total = computed(() => props.conta.keys.reduce((s, k) => s + k.calls_period, 0))
const topo = computed(() => Math.max(1, ...props.conta.keys.map(k => k.calls_period)))

function fatia(k: { calls_period: number }) {
  return total.value > 0 ? Math.round((k.calls_period / total.value) * 100) : 0
}
function larguraPeso(k: { calls_period: number }) {
  return Math.round((k.calls_period / topo.value) * 100)
}

function quando(iso: string | null) {
  if (!iso) return 'nunca'
  return new Date(iso).toLocaleDateString('pt-BR')
}

const segredoEl = ref<HTMLElement | null>(null)
const geradorEl = ref<HTMLInputElement | null>(null)

defineExpose({
  focarGerador() {
    geradorEl.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    geradorEl.value?.focus()
  },
  mostrarSegredo() {
    segredoEl.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  },
})
</script>

<template>
  <section class="rbkc">
    <div class="rbkc__in">
      <NuSectionHeading eyebrow="Chaves">
        {{ conta.max_keys }} chaves,<br>uma conta.
        <template #dek>
          Cada chave leva o nome de quem usa, ou da mesa. É o rótulo que faz o painel
          de uso servir para alguma coisa quando a casa inteira está conectada.
        </template>
      </NuSectionHeading>

      <!-- o segredo, só no instante em que existe -->
      <div v-if="plainKey" ref="segredoEl" class="rbkc__secret" role="status">
        <span class="rbkc__secret-l">Chave nova</span>
        <h3 class="rbkc__secret-t">Copie agora.</h3>
        <code class="rbkc__code">{{ plainKey }}</code>
        <button type="button" class="rbkc__copy" @click="emit('copiar')">
          {{ copiado ? 'Copiada' : 'Copiar' }}
        </button>
        <p class="rbkc__warn">Ela não aparece de novo. Se perder, revogue essa e gere outra.</p>
      </div>

      <div class="rbkc__panel">
        <p v-if="!conta.keys.length" class="rbkc__vazio">
          Nenhuma chave ainda. Gere a primeira com o nome de quem vai usar, ou da mesa.
        </p>

        <div class="rbkc__tblwrap">
          <table class="rbkc__tbl">
            <thead v-if="conta.keys.length">
              <tr>
                <th>Chave</th>
                <th class="num">Hoje</th>
                <th class="num">{{ janela }} dias</th>
                <th>Peso</th>
                <th>Último uso</th>
                <th>Ativa</th>
                <th><span class="rbk-sr">Ações</span></th>
              </tr>
            </thead>

            <tbody v-if="conta.keys.length">
              <tr v-for="k in conta.keys" :key="k.id" :class="{ 'rbkc__row--off': !k.enabled }">
                <td>
                  <form v-if="renomeando === k.id" class="rbkc__rename" @submit.prevent="emit('salvarRename', k.id)">
                    <label :for="`rbk-rn-${k.id}`" class="rbk-sr">Novo nome da chave</label>
                    <input :id="`rbk-rn-${k.id}`" v-model="novoRotulo" type="text" maxlength="40">
                    <button type="submit" class="rbk-act" :disabled="busy || novoRotulo.trim().length < 2">Salvar</button>
                    <button type="button" class="rbk-act" @click="emit('cancelarRename')">Cancelar</button>
                  </form>
                  <template v-else>
                    <strong class="rbkc__name">{{ k.label }}</strong>
                    <code class="rbkc__mask">{{ k.masked }}</code>
                  </template>
                </td>
                <td class="num" data-l="Hoje">
                  <span class="rbkc__n" :class="{ 'rbkc__n--zero': !k.calls_today }">{{ num(k.calls_today) }}</span>
                </td>
                <td class="num" :data-l="`${janela} dias`">
                  <span class="rbkc__n" :class="{ 'rbkc__n--zero': !k.calls_period }">{{ num(k.calls_period) }}</span>
                </td>
                <td class="peso" data-l="Peso">
                  <span class="rbkc__peso">
                    <span class="rbkc__peso-v">{{ fatia(k) }}%</span>
                    <span class="rbkc__peso-track">
                      <span class="rbkc__peso-fill" :style="{ width: `${larguraPeso(k)}%` }" />
                    </span>
                  </span>
                </td>
                <td data-l="Último uso"><span class="rbkc__quando">{{ quando(k.last_used_at) }}</span></td>
                <td data-l="Ativa">
                  <NuToggle
                    :model-value="k.enabled"
                    :disabled="busy"
                    :aria-label="k.enabled ? `Desativar a chave ${k.label}` : `Ativar a chave ${k.label}`"
                    @update:model-value="v => emit('toggle', k.id, v)"
                  />
                </td>
                <td>
                  <div class="rbkc__acoes">
                    <button type="button" class="rbk-act" :disabled="busy" @click="emit('abrirRename', k.id, k.label)">
                      Renomear
                    </button>
                    <button
                      type="button"
                      class="rbk-act"
                      :class="{ 'rbk-act--armado': confirmando === k.id }"
                      :disabled="busy"
                      @click="emit('revogar', k.id)"
                    >
                      {{ confirmando === k.id ? 'Confirmar' : 'Revogar' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>

            <tfoot>
              <tr>
                <td :colspan="conta.keys.length ? 7 : 1">
                  <form v-if="restantes > 0" class="rbkc__nova" @submit.prevent="emit('gerar')">
                    <label for="rbk-rotulo" class="rbk-sr">Nome da chave nova</label>
                    <input
                      id="rbk-rotulo"
                      ref="geradorEl"
                      v-model="rotulo"
                      type="text"
                      maxlength="40"
                      placeholder="Mesa, Análise, nome de quem vai usar"
                    >
                    <button type="submit" :disabled="busy || rotulo.trim().length < 2">
                      {{ busy ? 'Gerando…' : 'Gerar chave' }}
                    </button>
                    <span class="rbkc__resta">{{ restantes }} de {{ conta.max_keys }} disponíveis</span>
                  </form>
                  <p v-else class="rbkc__lotada">
                    O escritório está com as {{ conta.max_keys }} chaves em uso. Revogue uma para
                    gerar outra, ou fale com a gente se a casa precisa de mais.
                  </p>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p v-if="erro" class="rbkc__erro" role="alert">{{ erro }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rbkc { background: var(--nu-cream); padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.rbkc__in { max-width: 1120px; }

/* ——— o segredo ——— */
.rbkc__secret {
  margin-top: clamp(28px, 3.5vw, 40px);
  background: var(--nu-navy); border-radius: var(--nu-r-card-lg); padding: clamp(24px, 3vw, 34px);
  box-shadow: var(--nu-shadow-card); animation: nu-fade .45s ease both;
}
.rbkc__secret-l { display: block; color: var(--nu-cream-text-50); font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; }
.rbkc__secret-t { margin: 12px 0 0; color: var(--nu-cream-text); font-size: clamp(22px, 2.4vw, 28px); font-weight: 800; letter-spacing: -.03em; }
.rbkc__code {
  display: block; margin-top: 18px;
  background: var(--nu-navy-2); border: 1px solid var(--nu-cream-text-12); border-radius: var(--nu-r-input);
  padding: 16px 18px; color: var(--nu-cream-text);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13.5px; line-height: 1.5; word-break: break-all;
}
.rbkc__copy {
  margin-top: 14px; min-height: 44px; padding: 0 22px; border: none; cursor: pointer;
  background: var(--nu-blue); color: var(--nu-white); border-radius: var(--nu-r-pill);
  font-size: 14px; font-weight: 800; font-family: inherit; transition: background .2s;
}
.rbkc__copy:hover { background: var(--nu-blue-hover); }
.rbkc__copy:focus-visible { outline: 2px solid var(--nu-cream-text); outline-offset: 2px; }
.rbkc__warn { margin: 14px 0 0; color: var(--nu-cream-text-70); font-size: 13.5px; font-weight: 600; line-height: 1.55; }

/* ——— o painel ——— */
.rbkc__panel {
  margin-top: clamp(28px, 3.5vw, 40px);
  background: var(--nu-white); border-radius: var(--nu-r-card-lg);
  box-shadow: var(--nu-shadow-card);
  padding: clamp(18px, 2.2vw, 26px) clamp(20px, 2.6vw, 30px) clamp(22px, 2.6vw, 30px);
}
.rbkc__vazio { margin: 6px 0 0; color: var(--nu-gray-2); font-size: 15.5px; font-weight: 600; line-height: 1.6; max-width: 52ch; }
.rbkc__tblwrap { overflow-x: auto; }
.rbkc__tbl { width: 100%; border-collapse: collapse; min-width: 860px; }
.rbkc__tbl th {
  text-align: left; padding: 4px 18px 12px 0; white-space: nowrap;
  color: var(--nu-gray); font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px;
  border-bottom: 1.5px solid var(--nu-cream-2);
}
.rbkc__tbl td { padding: 15px 18px 15px 0; vertical-align: middle; border-bottom: 1px solid var(--nu-cream-line); }
.rbkc__tbl tbody tr:last-child td { border-bottom: none; }
.rbkc__tbl th.num, .rbkc__tbl td.num { text-align: right; padding-right: 22px; }

.rbkc__name { display: block; color: var(--nu-ink); font-size: 16px; font-weight: 800; letter-spacing: -.02em; }
.rbkc__mask { display: block; margin-top: 3px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12.5px; color: var(--nu-gray); letter-spacing: .02em; }
.rbkc__n { color: var(--nu-ink); font-size: 15.5px; font-weight: 800; font-variant-numeric: tabular-nums; }
/* zero em sand: presente, mas sem competir com quem tem número */
.rbkc__n--zero { color: var(--nu-sand); }
.rbkc__quando { color: var(--nu-gray-2); font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums; }
.rbkc__row--off .rbkc__name { color: var(--nu-gray-2); }

.rbkc__tbl td.peso { width: 132px; }
.rbkc__peso-v { display: block; color: var(--nu-gray-2); font-size: 13px; font-weight: 800; font-variant-numeric: tabular-nums; }
.rbkc__peso-track { display: block; margin-top: 6px; height: 6px; border-radius: var(--nu-r-pill); background: var(--nu-cream-2); overflow: hidden; }
.rbkc__peso-fill { display: block; height: 100%; background: var(--nu-blue); }

.rbkc__acoes { display: flex; gap: 8px; justify-content: flex-end; white-space: nowrap; }
.rbk-act {
  min-height: 44px; padding: 0 16px; border: none; cursor: pointer;
  background: var(--nu-cream); color: var(--nu-ink); border-radius: var(--nu-r-pill);
  font-size: 13px; font-weight: 800; font-family: inherit; transition: background .18s, color .18s, opacity .18s;
}
.rbk-act:hover { background: var(--nu-cream-4); }
.rbk-act:disabled { opacity: .5; cursor: default; }
/* o segundo clique é o que revoga: o botão muda de cara antes de fazer */
.rbk-act--armado { background: var(--nu-ink); color: var(--nu-white); }
.rbk-act:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

.rbkc__rename { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.rbkc__rename input {
  flex: 1 1 180px; min-width: min(160px, 100%); min-height: 44px;
  background: var(--nu-cream); border: none; border-radius: var(--nu-r-input);
  padding: 10px 14px; color: var(--nu-ink); font-size: 15px; font-weight: 700; font-family: inherit;
}
.rbkc__rename input:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 1px; }

/* o gerador É a última linha da tabela */
.rbkc__tbl tfoot td { padding: 20px 0 0; border-top: 1.5px solid var(--nu-cream-2); border-bottom: none; }
.rbkc__nova { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.rbkc__nova input {
  flex: 1 1 280px; min-width: min(260px, 100%); min-height: 44px;
  background: var(--nu-cream); border: none; border-radius: var(--nu-r-input);
  padding: 12px 16px; color: var(--nu-ink); font-size: 16px; font-weight: 700; font-family: inherit;
}
.rbkc__nova input::placeholder { color: var(--nu-gray); font-weight: 500; }
.rbkc__nova input:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 1px; }
.rbkc__nova button {
  min-height: 44px; padding: 0 24px; border: none; cursor: pointer;
  background: var(--nu-blue); color: var(--nu-white); border-radius: var(--nu-r-pill);
  font-size: 14.5px; font-weight: 800; font-family: inherit; transition: background .2s, opacity .2s;
}
.rbkc__nova button:hover:not(:disabled) { background: var(--nu-blue-hover); }
.rbkc__nova button:disabled { opacity: .5; cursor: default; }
.rbkc__nova button:focus-visible { outline: 2px solid var(--nu-ink); outline-offset: 2px; }
.rbkc__resta { color: var(--nu-gray); font-size: 13px; font-weight: 700; font-variant-numeric: tabular-nums; }
.rbkc__lotada { margin: 0; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 600; line-height: 1.6; max-width: 60ch; }
.rbkc__erro { margin: 18px 0 0; color: var(--nu-ink); font-size: 14px; font-weight: 700; line-height: 1.55; }

.rbk-sr {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}

/* ——— abaixo de 880px a tabela deixa de ser tabela ———
   rolagem horizontal deixaria o Revogar fora da tela, e é o botão que
   destrói credencial. Cada chave vira sub-card creme dentro do painel branco,
   que é a inversão de superfície que a casa usa pra construir camada. */
@media (max-width: 880px) {
  .rbkc__tblwrap { overflow-x: visible; }
  .rbkc__tbl, .rbkc__tbl tbody, .rbkc__tbl tfoot, .rbkc__tbl tr, .rbkc__tbl td { display: block; width: auto; min-width: 0; }
  .rbkc__tbl thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .rbkc__tbl tbody tr {
    background: var(--nu-cream); border-radius: var(--nu-r-card); padding: 20px 22px; margin-top: 12px;
    display: grid; grid-template-columns: 1fr auto; gap: 14px 18px; align-items: center;
  }
  .rbkc__tbl tbody td { border: none; padding: 0; }
  .rbkc__tbl tbody tr td:first-child { grid-column: 1 / -1; }
  .rbkc__tbl td[data-l] { grid-column: 1 / -1; display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
  .rbkc__tbl td[data-l]::before {
    content: attr(data-l); color: var(--nu-gray);
    font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px;
  }
  .rbkc__tbl td.num { text-align: right; padding-right: 0; }
  .rbkc__tbl td.peso { width: auto; }
  .rbkc__peso { display: flex; align-items: center; gap: 10px; flex: 1; justify-content: flex-end; }
  .rbkc__peso-track { margin-top: 0; width: 90px; flex-shrink: 0; }
  .rbkc__acoes { grid-column: 1 / -1; justify-content: stretch; }
  .rbkc__acoes .rbk-act { flex: 1 1 0; }
  .rbkc__tbl tfoot td { padding-top: 22px; margin-top: 18px; border-top: 1.5px solid var(--nu-cream-2); }
  .rbkc__tbl tbody tr td[data-l="Ativa"] { justify-content: space-between; }
}
</style>
