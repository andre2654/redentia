<script setup lang="ts">
/**
 * A equipe: uma linha por chave, com o uso dela em palavras ("12 perguntas em
 * 30 dias, a última hoje") e o estado à direita. Substitui a tabela de sete
 * colunas (RbKeysTable): o que o dono quer saber de cada pessoa é se ela usa,
 * e isso cabe numa frase.
 *
 * Mesmas props, eventos e exposição da tabela antiga: a lógica da página
 * (revogar armado por 5 s, segredo uma vez, convite) atravessa sem mudar.
 *
 * O SEGREDO continua sendo o único artefato escuro da tela: é o momento mais
 * valioso e o único que não volta.
 */
import type { BusinessAccountStatus, BusinessKeyVM } from '~/composables/useBusinessAccount'

const props = defineProps<{
  conta: BusinessAccountStatus
  janela: number
  plainKey: string | null
  busy: boolean
  erro: string | null
  confirmando: number | null
  renomeando: number | null
  copiado: boolean
  /** O link do convite recém-emitido. Só existe uma vez, como a chave. */
  inviteUrl: string | null
  copiadoConvite: boolean
}>()

const emit = defineEmits<{
  (e: 'copiar'): void
  (e: 'conectar'): void
  (e: 'gerar'): void
  (e: 'revogar', id: number): void
  (e: 'toggle', id: number, enabled: boolean): void
  (e: 'abrirRename', id: number, label: string): void
  (e: 'cancelarRename'): void
  (e: 'salvarRename', id: number): void
  (e: 'convidar'): void
  (e: 'cancelarConvite', id: number): void
  (e: 'copiarConvite'): void
}>()

const rotulo = defineModel<string>('rotulo', { required: true })
const novoRotulo = defineModel<string>('novoRotulo', { required: true })
const nomeConvite = defineModel<string>('nomeConvite', { required: true })

const num = (n: number | null | undefined) => (n ?? 0).toLocaleString('pt-BR')
const restantes = computed(() => props.conta.remaining_keys ?? 0)
const pendentes = computed(() => props.conta.invites ?? [])
/** Vaga de convite = chaves que cabem menos convites já emitidos e ainda não abertos (regra do servidor). */
const vagasConvite = computed(() => restantes.value - pendentes.value.length)
const total = computed(() => props.conta.keys.reduce((s, k) => s + k.calls_period, 0))

/**
 * Ordem: quem mais usa primeiro. Só pelo uso, que não muda com um clique:
 * ordenar por "ativa" fazia a linha pular ao pausar, e o clique seguinte
 * caía na linha de outra chave, às vezes num Revogar.
 */
const chaves = computed(() => [...props.conta.keys].sort((a, b) => b.calls_period - a.calls_period || a.id - b.id))

function dataCurta(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  const hoje = new Date()
  const ontem = new Date(Date.now() - 86_400_000)
  if (d.toDateString() === hoje.toDateString()) return 'hoje'
  if (d.toDateString() === ontem.toDateString()) return 'ontem'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

/** O uso em uma frase. `last_used_at` só aparece com uso real no período. */
function uso(k: BusinessKeyVM) {
  if (!k.calls_period) return k.created_at ? `Sem perguntas em ${props.janela} dias · criada em ${dataCurta(k.created_at)}` : `Sem perguntas em ${props.janela} dias`
  const n = `${num(k.calls_period)} ${k.calls_period === 1 ? 'pergunta' : 'perguntas'} em ${props.janela} dias`
  return k.calls_today ? `${n} · ${num(k.calls_today)} hoje` : n
}

function selo(k: BusinessKeyVM): { texto: string, tom: 'azul' | 'neutro' | 'aviso' } {
  if (!k.enabled) return { texto: 'Pausada', tom: 'neutro' }
  if (!k.calls_period) return { texto: 'Sem uso', tom: 'aviso' }
  return { texto: `${total.value ? Math.round((k.calls_period / total.value) * 100) : 0}% do uso`, tom: 'azul' }
}

function quando(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString('pt-BR') : ''
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
  <RbPainelSecao
    id="equipe"
    tom="creme"
    eyebrow="Equipe"
    titulo="Quem usa a Redentia."
    :dek="`Uma chave por pessoa ou por mesa, até ${conta.max_keys}. O nome da chave é o que faz este painel dizer quem usa.`"
  >
    <div class="rbpe">
      <div class="rbpe__col">
        <!-- o segredo, só no instante em que existe -->
        <div v-if="plainKey" ref="segredoEl" class="rbpe__segredo" role="status">
          <span class="rbpe__segredo-l">Chave nova</span>
          <strong class="rbpe__segredo-t">Copie agora. Ela não aparece de novo.</strong>
          <code class="rbpe__code" data-clarity-mask="true">{{ plainKey }}</code>
          <div class="rbpe__segredo-acoes">
            <button type="button" class="rbpe__segredo-btn" @click="emit('copiar')">{{ copiado ? 'Copiada' : 'Copiar a chave' }}</button>
            <button type="button" class="rbpe__segredo-link" @click="emit('conectar')">Como conectar</button>
          </div>
        </div>

        <div class="rbpe__painel">
          <p v-if="!conta.keys.length" class="rbpe__vazio">Nenhuma chave ainda. Gere a primeira ao lado, com o nome de quem vai usar.</p>

          <div v-for="k in chaves" :key="k.id" class="rbpe__item" :class="{ 'rbpe__item--off': !k.enabled }">
            <form v-if="renomeando === k.id" class="rbpe__form" @submit.prevent="emit('salvarRename', k.id)">
              <label :for="`rbpe-rn-${k.id}`" class="rbp-sr">Novo nome da chave</label>
              <input :id="`rbpe-rn-${k.id}`" v-model="novoRotulo" type="text" maxlength="40" data-clarity-mask="true">
              <button type="submit" class="rbpe__btn" :disabled="busy || novoRotulo.trim().length < 2">Salvar</button>
              <button type="button" class="rbpe__acao" @click="emit('cancelarRename')">Cancelar</button>
            </form>
            <template v-else>
              <div class="rbpe__linha">
                <div class="rbpe__esq">
                  <strong :id="`rbpe-nm-${k.id}`" class="rbpe__nome" data-clarity-mask="true">{{ k.label }}</strong>
                  <span class="rbpe__uso">{{ uso(k) }}</span>
                </div>
                <span class="rbpe__selo" :class="`rbpe__selo--${selo(k).tom}`">{{ selo(k).texto }}</span>
              </div>
              <div class="rbpe__acoes">
                <code class="rbpe__mascara">{{ k.masked }}</code>
                <button type="button" class="rbpe__acao" :disabled="busy" @click="emit('abrirRename', k.id, k.label)">Renomear</button>
                <button type="button" class="rbpe__acao" :disabled="busy" @click="emit('toggle', k.id, !k.enabled)">
                  {{ k.enabled ? 'Pausar' : 'Reativar' }}
                </button>
                <button
                  type="button"
                  class="rbpe__acao rbpe__acao--perigo"
                  :class="{ 'rbpe__acao--armado': confirmando === k.id }"
                  :disabled="busy"
                  @click="emit('revogar', k.id)"
                >
                  {{ confirmando === k.id ? 'Toque de novo para revogar' : 'Revogar' }}
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div class="rbpe__painel rbpe__lado">
        <h3 class="rbpe__h3">Chamar mais alguém</h3>
        <p class="rbpe__sub">{{ restantes > 0 ? `${restantes} de ${conta.max_keys} chaves livres.` : `As ${conta.max_keys} chaves estão em uso.` }}</p>

        <div class="rbpe__item">
          <form v-if="restantes > 0" class="rbpe__form" @submit.prevent="emit('gerar')">
            <label for="rbpe-rotulo" class="rbp-sr">Nome da chave nova</label>
            <input
              id="rbpe-rotulo"
              ref="geradorEl"
              v-model="rotulo"
              type="text"
              maxlength="40"
              data-clarity-mask="true"
              placeholder="Nome de quem vai usar, ou da mesa"
            >
            <button type="submit" class="rbpe__btn" :disabled="busy || rotulo.trim().length < 2">{{ busy ? 'Gerando…' : 'Gerar chave' }}</button>
          </form>
          <p v-else class="rbpe__nota">Revogue uma para gerar outra, ou fale com a gente se a casa precisa de mais.</p>
        </div>

        <div class="rbpe__item">
          <p class="rbpe__nota">Ou mande um convite: um link de uso único, que vale 7 dias. Quem abre dá o nome e sai com a própria chave, sem conta e sem o segredo passar pelo chat.</p>
          <form v-if="vagasConvite > 0" class="rbpe__form rbpe__form--convite" @submit.prevent="emit('convidar')">
            <label for="rbpe-convite" class="rbp-sr">Nome de quem recebe o convite</label>
            <input id="rbpe-convite" v-model="nomeConvite" type="text" maxlength="40" data-clarity-mask="true" placeholder="Nome de quem recebe (opcional)">
            <button type="submit" class="rbpe__btn rbpe__btn--claro" :disabled="busy">{{ busy ? 'Gerando…' : 'Gerar convite' }}</button>
          </form>
          <p v-else class="rbpe__nota rbpe__nota--forte">Sem vaga para convite: cada convite pendente reserva uma chave.</p>

          <div v-if="inviteUrl" class="rbpe__convite" role="status">
            <code class="rbpe__link-code" data-clarity-mask="true">{{ inviteUrl }}</code>
            <button type="button" class="rbpe__btn" @click="emit('copiarConvite')">{{ copiadoConvite ? 'Copiado' : 'Copiar link' }}</button>
            <small>O link aparece uma vez. Mande direto para a pessoa.</small>
          </div>
        </div>

        <div v-for="i in pendentes" :key="i.id" class="rbpe__item">
          <div class="rbpe__linha">
            <div class="rbpe__esq">
              <strong class="rbpe__nome" data-clarity-mask="true">{{ i.label ?? 'Convite sem nome' }}</strong>
              <span class="rbpe__uso">Aguardando · vale até {{ quando(i.expires_at) }}</span>
            </div>
            <button type="button" class="rbpe__acao" :disabled="busy" @click="emit('cancelarConvite', i.id)">Cancelar</button>
          </div>
        </div>

        <p v-if="erro" class="rbpe__erro" role="alert">{{ erro }}</p>
      </div>
    </div>
  </RbPainelSecao>
</template>

<style scoped>
.rbpe { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr); gap: 20px; align-items: start; }
@media (max-width: 900px) { .rbpe { grid-template-columns: 1fr; } }
.rbpe__painel { background: var(--rbp-painel); border-radius: var(--nu-r-card); box-shadow: var(--nu-shadow-card); padding: 8px 28px; }
.rbpe__lado { padding-top: 26px; }
.rbpe__h3 { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -.02em; }
.rbpe__lado .rbpe__sub { margin: 4px 0 0; }
.rbpe__lado .rbpe__item:first-of-type { margin-top: 10px; }
.rbpe__form--convite { margin-top: 2px; }
.rbpe__nota--forte { margin-top: 0; color: var(--nu-gray-2); }
@media (max-width: 560px) { .rbpe__painel { padding: 4px 18px; } .rbpe__lado { padding-top: 20px; } }
.rbpe__item { padding: 18px 0; border-top: 1px solid var(--rbp-linha); }
.rbpe__item:first-child, .rbpe__segredo + .rbpe__item, .rbpe__vazio + .rbpe__item { border-top: 0; }
.rbpe__item--off .rbpe__nome, .rbpe__item--off .rbpe__uso { opacity: .55; }
.rbpe__linha { display: flex; align-items: center; gap: 16px; }
.rbpe__esq { flex: 1; min-width: 0; display: grid; gap: 2px; }
.rbpe__nome { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 700; letter-spacing: -.01em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rbpe__uso { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; font-variant-numeric: tabular-nums; }
.rbpe__selo { flex: none; padding: 6px 12px; border-radius: var(--nu-r-pill); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.rbpe__selo--azul { background: var(--nu-blue-tint); color: var(--nu-blue); }
.rbpe__selo--neutro { background: var(--rbp-neutro); color: var(--nu-gray-2); }
.rbpe__selo--aviso { background: var(--rbp-neutro); color: var(--nu-gray-3); }

.rbpe__acoes { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 16px; margin-top: 10px; }
.rbpe__mascara { margin-right: auto; color: var(--nu-gray); font-size: var(--nu-fs-xs); }
.rbpe__acao { min-height: 32px; padding: 0; border: 0; background: none; cursor: pointer; color: var(--nu-blue); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700; }
.rbpe__acao:hover:not(:disabled) { color: var(--nu-blue-hover); }
.rbpe__acao--perigo { color: var(--nu-red); }
.rbpe__acao--perigo:hover:not(:disabled) { color: var(--nu-red-2); }
.rbpe__acao--armado { padding: 0 12px; border-radius: var(--nu-r-pill); background: var(--nu-red); color: var(--nu-white); }
.rbpe__acao--armado:hover:not(:disabled) { color: var(--nu-white); background: var(--nu-red-2); }
.rbpe__acao:disabled { opacity: .5; cursor: default; }

.rbpe__form { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.rbpe__form input {
  flex: 1 1 200px; min-height: 46px; padding: 0 16px; border: 1px solid var(--nu-sand-2); border-radius: var(--nu-r-input);
  background: var(--nu-cream); color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-md); font-weight: 500;
}
.rbpe__form input:focus { outline: none; border-color: var(--nu-blue); box-shadow: 0 0 0 3px var(--nu-blue-tint); }
.rbpe__btn {
  min-height: 46px; padding: 0 22px; border: 0; border-radius: var(--nu-r-pill); cursor: pointer;
  background: var(--nu-blue); color: var(--nu-white); font: inherit; font-size: var(--nu-fs-md); font-weight: 700;
}
.rbpe__btn:hover:not(:disabled) { background: var(--nu-blue-hover); }
.rbpe__btn--claro { background: var(--nu-blue-tint); color: var(--nu-blue); }
.rbpe__btn--claro:hover:not(:disabled) { background: var(--nu-blue-30); }
.rbpe__btn:disabled { opacity: .5; cursor: default; }
.rbpe__sub, .rbpe__nota { margin: 0 0 12px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; }
.rbpe__nota { margin: 0; }
.rbpe__vazio { margin: 0; padding: 22px 0; color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 500; }

.rbpe__segredo {
  margin: 0 0 16px; padding: 22px; border-radius: var(--nu-r-panel); background: var(--nu-navy); color: var(--nu-cream-text);
  display: grid; gap: 10px;
}
.rbpe__segredo-l { color: var(--nu-blue-soft); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.rbpe__segredo-t { font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -.02em; }
.rbpe__code { display: block; padding: 14px 16px; border-radius: var(--nu-r-input); background: var(--nu-navy-2); font-size: var(--nu-fs-sm); word-break: break-all; }
.rbpe__segredo-acoes { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
.rbpe__segredo-btn { min-height: 44px; padding: 0 20px; border: 0; border-radius: var(--nu-r-pill); cursor: pointer; background: var(--nu-white); color: var(--nu-navy); font: inherit; font-size: var(--nu-fs-md); font-weight: 700; }
.rbpe__segredo-link { min-height: 44px; border: 0; background: none; cursor: pointer; color: var(--nu-blue-soft); font: inherit; font-size: var(--nu-fs-md); font-weight: 700; }

.rbpe__convite { display: grid; gap: 10px; margin-top: 14px; padding: 16px; border-radius: var(--nu-r-tile); background: var(--nu-cream); }
.rbpe__convite code { font-size: var(--nu-fs-sm); word-break: break-all; color: var(--nu-ink); }
.rbpe__convite small { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; }
.rbpe__convite .rbpe__btn { justify-self: start; }
.rbpe__erro { margin: 0; padding: 14px 0; color: var(--nu-red); font-size: var(--nu-fs-sm); font-weight: 700; border-top: 1px solid var(--rbp-linha); }

button:focus-visible { outline: 3px solid var(--nu-blue-30); outline-offset: 2px; }
.rbp-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
</style>
