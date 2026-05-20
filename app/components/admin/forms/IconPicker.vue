<!--
  IconPicker — picker de icone Lucide com grid curado por categoria.

  Por que existe: free-text input do nome do icone (i-lucide-...) e
  ruim — admin nao decora 1500 nomes do Lucide. Aqui temos ~80 icones
  curados que cobrem 95% dos casos de uso em comunicacoes (status,
  acao, navegacao, financeiro, comunicacao, tempo).

  Modo "custom": admin avancado ainda pode digitar qualquer
  i-lucide-* via toggle "Outro icone" no rodape do popover.

  Props:
    - modelValue: string  (ex: 'i-lucide-sparkles' ou '' pra nenhum)
  Emits: update:modelValue
-->
<template>
  <div class="icon-picker" :class="{ 'icon-picker--open': open }">
    <!-- Trigger: botao mostrando icone selecionado -->
    <button
      ref="triggerRef"
      type="button"
      class="icon-picker__trigger"
      :class="{ 'icon-picker__trigger--filled': !!modelValue }"
      :aria-expanded="open"
      :aria-haspopup="true"
      @click="open = !open"
    >
      <span class="icon-picker__trigger-preview">
        <UIcon
          v-if="modelValue"
          :name="modelValue"
          class="size-4"
        />
        <UIcon
          v-else
          name="i-lucide-image-plus"
          class="size-4 icon-picker__trigger-empty"
        />
      </span>
      <span class="icon-picker__trigger-label">
        {{ modelValue || 'Sem ícone' }}
      </span>
      <span v-if="modelValue" class="icon-picker__trigger-clear" @click.stop="clear">
        <UIcon name="i-lucide-x" class="size-3" />
      </span>
      <UIcon
        v-else
        name="i-lucide-chevron-down"
        class="size-3.5 icon-picker__trigger-chevron"
      />
    </button>

    <!-- Popover (teleportado pro body pra escapar overflow:hidden de
         qualquer ancestral; posicionado via fixed coords calculadas
         do trigger). -->
    <Teleport to="body">
      <Transition name="icon-pop">
        <div
          v-if="open"
          ref="popRef"
          class="icon-picker__pop"
          role="dialog"
          :style="{
            top: popPos.top + 'px',
            left: popPos.left + 'px',
            width: popPos.width + 'px',
          }"
        >
          <div class="icon-picker__search-row">
          <UIcon name="i-lucide-search" class="size-4 icon-picker__search-icon" />
          <input
            ref="searchRef"
            v-model="search"
            type="text"
            class="icon-picker__search-input"
            placeholder="Buscar ícone (ex: alert, sparkle, money)"
          />
          <button
            v-if="search"
            type="button"
            class="icon-picker__search-clear"
            @click="search = ''"
          >
            <UIcon name="i-lucide-x" class="size-3" />
          </button>
        </div>

        <div class="icon-picker__body">
          <!-- Empty state busca -->
          <div v-if="filteredCategories.length === 0" class="icon-picker__empty">
            <UIcon name="i-lucide-search-x" class="size-5" />
            <span>Nenhum ícone com "{{ search }}".</span>
            <button type="button" class="icon-picker__custom-toggle" @click="customMode = true">
              Inserir manualmente
            </button>
          </div>

          <!-- Modo custom: input livre pra qualquer i-lucide-* -->
          <div v-else-if="customMode" class="icon-picker__custom">
            <span class="icon-picker__custom-label">Nome completo (Lucide)</span>
            <input
              v-model="customValue"
              type="text"
              class="icon-picker__custom-input"
              placeholder="i-lucide-..."
              @keydown.enter.prevent="confirmCustom"
            />
            <p class="icon-picker__custom-hint">
              Lista completa em <a href="https://lucide.dev/icons/" target="_blank" rel="noopener">lucide.dev</a>.
              Use o nome com prefixo <code>i-lucide-</code>.
            </p>
            <div class="icon-picker__custom-actions">
              <button type="button" class="icon-picker__btn icon-picker__btn--ghost" @click="customMode = false">
                ← Voltar
              </button>
              <button type="button" class="icon-picker__btn icon-picker__btn--primary" @click="confirmCustom">
                Usar este ícone
              </button>
            </div>
            <div v-if="customValue" class="icon-picker__custom-preview">
              <span class="icon-picker__custom-preview-label">Preview:</span>
              <UIcon :name="customValue" class="size-5" />
              <code>{{ customValue }}</code>
            </div>
          </div>

          <!-- Categorias e icones -->
          <template v-else>
            <section
              v-for="cat in filteredCategories"
              :key="cat.label"
              class="icon-picker__cat"
            >
              <header class="icon-picker__cat-head">{{ cat.label }}</header>
              <div class="icon-picker__grid">
                <button
                  v-for="ic in cat.icons"
                  :key="ic.name"
                  type="button"
                  class="icon-picker__cell"
                  :class="{ 'icon-picker__cell--active': modelValue === ic.name }"
                  :title="`${ic.label}, ${ic.name}`"
                  @click="select(ic.name)"
                >
                  <UIcon :name="ic.name" class="size-4" />
                </button>
              </div>
            </section>
          </template>
        </div>

        <footer v-if="!customMode" class="icon-picker__footer">
          <button
            type="button"
            class="icon-picker__custom-toggle"
            @click="customMode = true"
          >
            <UIcon name="i-lucide-pencil" class="size-3" />
            Outro ícone (manual)
          </button>
        </footer>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

const props = defineProps<{ modelValue: string | null }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const open = ref(false)
const search = ref('')
const customMode = ref(false)
const customValue = ref('')

const triggerRef = ref<HTMLButtonElement | null>(null)
const popRef = ref<HTMLDivElement | null>(null)
const searchRef = ref<HTMLInputElement | null>(null)

/**
 * Posicao do popover (fixed coords). Calculada a partir do bounding
 * rect do trigger sempre que abre, faz scroll, ou redimensiona.
 *
 * Por que fixed em vez de absolute: o popover e teleportado pro <body>,
 * entao qualquer overflow:hidden em ancestral do trigger nao afeta.
 * Coords fixed simplificam o calculo (viewport-relative, nao precisa
 * subtrair scroll offsets).
 *
 * Auto flip: se nao cabe abaixo (rect.bottom + max-height ultrapassa
 * viewport), abre acima do trigger.
 */
const popPos = reactive({ top: 0, left: 0, width: 280 })
const POP_MAX_HEIGHT = 360
const POP_MIN_WIDTH = 280
const POP_GAP = 6

function updatePopPos() {
  const t = triggerRef.value
  if (!t) return
  const rect = t.getBoundingClientRect()
  const vh = window.innerHeight
  const spaceBelow = vh - rect.bottom
  const spaceAbove = rect.top
  const width = Math.max(rect.width, POP_MIN_WIDTH)

  // Flip pra cima se nao cabe abaixo mas cabe acima
  const openUp = spaceBelow < POP_MAX_HEIGHT && spaceAbove > spaceBelow
  const top = openUp
    ? Math.max(8, rect.top - POP_GAP - POP_MAX_HEIGHT)
    : rect.bottom + POP_GAP

  popPos.top = top
  popPos.left = rect.left
  popPos.width = width
}

// =================================================================
// Curated icons — agrupados por categoria. Cada item tem keywords
// pt-br pra match na busca.
// =================================================================
interface IconDef { name: string; label: string }
interface CatDef { label: string; icons: IconDef[] }

const ICONS: CatDef[] = [
  {
    label: 'Status & Avisos',
    icons: [
      { name: 'i-lucide-info', label: 'info' },
      { name: 'i-lucide-alert-triangle', label: 'alerta atenção' },
      { name: 'i-lucide-alert-circle', label: 'alerta erro' },
      { name: 'i-lucide-check-circle-2', label: 'check sucesso ok' },
      { name: 'i-lucide-x-circle', label: 'erro bloqueio' },
      { name: 'i-lucide-ban', label: 'banido proibido' },
      { name: 'i-lucide-shield-alert', label: 'segurança alerta' },
      { name: 'i-lucide-shield-check', label: 'segurança ok protegido' },
      { name: 'i-lucide-circle-help', label: 'ajuda dúvida' },
      { name: 'i-lucide-clock-alert', label: 'tempo alerta urgente' },
    ],
  },
  {
    label: 'Destaque & Acionamento',
    icons: [
      { name: 'i-lucide-sparkles', label: 'novidade brilho destaque' },
      { name: 'i-lucide-zap', label: 'rápido raio energia' },
      { name: 'i-lucide-rocket', label: 'lançamento foguete' },
      { name: 'i-lucide-flame', label: 'fogo hot trending' },
      { name: 'i-lucide-trophy', label: 'prêmio conquista trofeu' },
      { name: 'i-lucide-crown', label: 'premium coroa' },
      { name: 'i-lucide-gift', label: 'presente bonus' },
      { name: 'i-lucide-star', label: 'estrela favorito destaque' },
      { name: 'i-lucide-heart', label: 'favorito coração' },
      { name: 'i-lucide-thumbs-up', label: 'curtir aprovado' },
    ],
  },
  {
    label: 'Comunicação',
    icons: [
      { name: 'i-lucide-megaphone', label: 'megafone anúncio comunicado' },
      { name: 'i-lucide-bell', label: 'sino notificação' },
      { name: 'i-lucide-bell-ring', label: 'sino tocando notificar' },
      { name: 'i-lucide-mail', label: 'email mensagem carta' },
      { name: 'i-lucide-message-circle', label: 'chat mensagem' },
      { name: 'i-lucide-message-square', label: 'mensagem comentário' },
      { name: 'i-lucide-send', label: 'enviar mandar' },
      { name: 'i-lucide-volume-2', label: 'som alto volume' },
      { name: 'i-lucide-newspaper', label: 'notícia jornal' },
    ],
  },
  {
    label: 'Financeiro',
    icons: [
      { name: 'i-lucide-trending-up', label: 'alta crescimento subir' },
      { name: 'i-lucide-trending-down', label: 'queda baixar descer' },
      { name: 'i-lucide-bar-chart-3', label: 'gráfico barras' },
      { name: 'i-lucide-line-chart', label: 'gráfico linha' },
      { name: 'i-lucide-pie-chart', label: 'gráfico pizza' },
      { name: 'i-lucide-coins', label: 'moedas dinheiro' },
      { name: 'i-lucide-banknote', label: 'cédula real reais' },
      { name: 'i-lucide-wallet', label: 'carteira' },
      { name: 'i-lucide-credit-card', label: 'cartão crédito' },
      { name: 'i-lucide-dollar-sign', label: 'cifrão dinheiro' },
      { name: 'i-lucide-piggy-bank', label: 'cofre poupança' },
      { name: 'i-lucide-receipt', label: 'recibo nota' },
    ],
  },
  {
    label: 'Tempo & Programação',
    icons: [
      { name: 'i-lucide-clock', label: 'relógio tempo hora' },
      { name: 'i-lucide-timer', label: 'cronômetro contagem' },
      { name: 'i-lucide-calendar', label: 'calendário data' },
      { name: 'i-lucide-calendar-clock', label: 'agendamento data hora' },
      { name: 'i-lucide-hourglass', label: 'ampulheta espera' },
      { name: 'i-lucide-history', label: 'histórico passado' },
    ],
  },
  {
    label: 'Navegação & Ação',
    icons: [
      { name: 'i-lucide-arrow-right', label: 'seta direita avançar' },
      { name: 'i-lucide-arrow-up-right', label: 'seta diagonal externo' },
      { name: 'i-lucide-external-link', label: 'link externo' },
      { name: 'i-lucide-plus', label: 'adicionar mais' },
      { name: 'i-lucide-plus-circle', label: 'adicionar mais círculo' },
      { name: 'i-lucide-download', label: 'baixar download' },
      { name: 'i-lucide-upload', label: 'subir upload' },
      { name: 'i-lucide-refresh-cw', label: 'atualizar refresh' },
      { name: 'i-lucide-link', label: 'corrente link' },
      { name: 'i-lucide-mouse-pointer-click', label: 'clique cursor' },
    ],
  },
  {
    label: 'Usuário & Perfil',
    icons: [
      { name: 'i-lucide-user', label: 'usuário pessoa' },
      { name: 'i-lucide-user-check', label: 'usuário verificado' },
      { name: 'i-lucide-user-plus', label: 'novo usuário cadastro' },
      { name: 'i-lucide-users', label: 'grupo pessoas' },
      { name: 'i-lucide-briefcase', label: 'pasta trabalho assessor' },
      { name: 'i-lucide-shield', label: 'escudo admin proteção' },
      { name: 'i-lucide-key', label: 'chave acesso' },
      { name: 'i-lucide-lock', label: 'cadeado segurança' },
      { name: 'i-lucide-target', label: 'alvo audiência específica' },
    ],
  },
  {
    label: 'Sistema & Operação',
    icons: [
      { name: 'i-lucide-settings', label: 'configuração engrenagem' },
      { name: 'i-lucide-wrench', label: 'manutenção ferramenta' },
      { name: 'i-lucide-server', label: 'servidor sistema' },
      { name: 'i-lucide-database', label: 'banco dados' },
      { name: 'i-lucide-cloud', label: 'nuvem cloud' },
      { name: 'i-lucide-cloud-off', label: 'offline desconectado' },
      { name: 'i-lucide-power', label: 'energia liga desliga' },
      { name: 'i-lucide-bug', label: 'bug erro' },
      { name: 'i-lucide-flag', label: 'bandeira marcador banner' },
      { name: 'i-lucide-bookmark', label: 'marcador bookmark' },
    ],
  },
]

const TOTAL_COUNT = ICONS.reduce((s, c) => s + c.icons.length, 0)

const filteredCategories = computed<CatDef[]>(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return ICONS
  return ICONS
    .map((cat) => ({
      label: cat.label,
      icons: cat.icons.filter(
        (ic) =>
          ic.name.toLowerCase().includes(q) ||
          ic.label.toLowerCase().includes(q),
      ),
    }))
    .filter((cat) => cat.icons.length > 0)
})

function select(name: string) {
  emit('update:modelValue', name)
  open.value = false
  search.value = ''
}

function clear() {
  emit('update:modelValue', '')
  open.value = false
}

function confirmCustom() {
  const v = (customValue.value || '').trim()
  if (!v) return
  // Normaliza prefixo se admin esquecer
  const normalized = v.startsWith('i-') ? v : `i-lucide-${v}`
  emit('update:modelValue', normalized)
  customMode.value = false
  customValue.value = ''
  open.value = false
}

// Click fora fecha. Como o popover esta teleportado pro body, precisa
// verificar tanto o wrapper (trigger + estado) quanto o proprio popover
// — caso contrario clicks dentro do popover fechariam ele.
function onClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.icon-picker') && !target.closest('.icon-picker__pop')) {
    open.value = false
    customMode.value = false
  }
}

// Esc fecha
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) {
    open.value = false
    customMode.value = false
  }
}

// Foco automatico no search ao abrir + recalcula posicao
watch(open, (v) => {
  if (v) {
    customMode.value = false
    search.value = ''
    updatePopPos()
    nextTick(() => {
      updatePopPos() // segunda passada apos o teleport montar
      searchRef.value?.focus()
    })
    // Listeners de reposicao enquanto aberto. Capture: true em scroll
    // pra pegar scrolls em ancestrais (caso do .editor__body que
    // rola dentro do shell admin).
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
  } else {
    window.removeEventListener('scroll', onScrollOrResize, true)
    window.removeEventListener('resize', onScrollOrResize)
  }
})

function onScrollOrResize() {
  updatePopPos()
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('scroll', onScrollOrResize, true)
  window.removeEventListener('resize', onScrollOrResize)
})
</script>

<style scoped>
.icon-picker { position: relative; }

/* TRIGGER */
.icon-picker__trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px 8px 8px;
  border-radius: 7px;
  border: 1px solid color-mix(in srgb, var(--brand-text, #fff) 12%, transparent);
  background: color-mix(in srgb, var(--brand-text, #fff) 4%, transparent);
  color: color-mix(in srgb, var(--brand-text, #fff) 75%, transparent);
  font-family: var(--brand-font);
  font-size: 13px;
  cursor: pointer;
  transition: border-color 150ms, background 150ms;
}
.icon-picker__trigger:hover {
  border-color: color-mix(in srgb, var(--brand-text, #fff) 20%, transparent);
  background: color-mix(in srgb, var(--brand-text, #fff) 6%, transparent);
}
.icon-picker--open .icon-picker__trigger {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 18%, transparent);
}
.icon-picker__trigger--filled {
  color: var(--brand-text, #fff);
}
.icon-picker__trigger-preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
  flex-shrink: 0;
}
.icon-picker__trigger-empty {
  color: color-mix(in srgb, var(--brand-text, #fff) 45%, transparent);
}
.icon-picker__trigger--filled .icon-picker__trigger-preview {
  background: color-mix(in srgb, var(--brand-primary) 18%, transparent);
}
.icon-picker__trigger-label {
  flex: 1;
  text-align: left;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.icon-picker__trigger-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 5px;
  color: color-mix(in srgb, var(--brand-text, #fff) 50%, transparent);
  cursor: pointer;
  transition: background 150ms, color 150ms;
}
.icon-picker__trigger-clear:hover {
  background: color-mix(in srgb, var(--brand-negative, #ef4444) 14%, transparent);
  color: var(--brand-negative, #ef4444);
}
.icon-picker__trigger-chevron {
  color: color-mix(in srgb, var(--brand-text, #fff) 45%, transparent);
  flex-shrink: 0;
}

/* POP — teleportado pro body, posicionado via fixed coords */
.icon-picker__pop {
  position: fixed;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  max-height: 360px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--brand-text, #fff) 14%, transparent);
  background: var(--brand-surface, #1a1a1a);
  box-shadow: 0 18px 40px -16px var(--shadow-amber-near);
  overflow: hidden;
}

/* Search */
.icon-picker__search-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-text, #fff) 8%, transparent);
}
.icon-picker__search-icon {
  color: color-mix(in srgb, var(--brand-text, #fff) 50%, transparent);
}
.icon-picker__search-input {
  flex: 1;
  border: 0;
  background: transparent;
  color: var(--brand-text, #fff);
  font-family: var(--brand-font);
  font-size: 13px;
  outline: none;
}
.icon-picker__search-input::placeholder {
  color: color-mix(in srgb, var(--brand-text, #fff) 40%, transparent);
}
.icon-picker__search-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 0;
  background: transparent;
  color: color-mix(in srgb, var(--brand-text, #fff) 50%, transparent);
  cursor: pointer;
}
.icon-picker__search-clear:hover {
  background: color-mix(in srgb, var(--brand-text, #fff) 8%, transparent);
}

/* Body */
.icon-picker__body {
  flex: 1;
  overflow-y: auto;
  padding: 6px 8px 4px;
}
.icon-picker__cat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 0 8px;
}
.icon-picker__cat-head {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text, #fff) 45%, transparent);
  padding: 0 4px 2px;
}
.icon-picker__grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
}
.icon-picker__cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  border-radius: 5px;
  border: 1px solid transparent;
  background: transparent;
  color: color-mix(in srgb, var(--brand-text, #fff) 75%, transparent);
  cursor: pointer;
  transition: background 120ms, color 120ms, border-color 120ms;
}
.icon-picker__cell:hover {
  background: color-mix(in srgb, var(--brand-text, #fff) 6%, transparent);
  color: var(--brand-text, #fff);
}
.icon-picker__cell--active {
  background: color-mix(in srgb, var(--brand-primary) 18%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
  color: var(--brand-primary);
}

/* Empty / custom */
.icon-picker__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 16px;
  color: color-mix(in srgb, var(--brand-text, #fff) 55%, transparent);
  font-size: 12px;
  text-align: center;
}
.icon-picker__custom-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 4px auto 0;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
  color: var(--brand-primary);
  font-size: 11.5px;
  font-weight: 500;
  cursor: pointer;
}
.icon-picker__custom-toggle:hover {
  filter: brightness(1.1);
}

.icon-picker__custom {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 12px;
}
.icon-picker__custom-label {
  font-size: 11px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text, #fff) 70%, transparent);
}
.icon-picker__custom-input {
  padding: 9px 12px;
  border-radius: 7px;
  border: 1px solid color-mix(in srgb, var(--brand-text, #fff) 14%, transparent);
  background: color-mix(in srgb, var(--brand-text, #fff) 4%, transparent);
  color: var(--brand-text, #fff);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12.5px;
  outline: none;
}
.icon-picker__custom-input:focus {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 18%, transparent);
}
.icon-picker__custom-hint {
  margin: 0;
  font-size: 11px;
  color: color-mix(in srgb, var(--brand-text, #fff) 55%, transparent);
}
.icon-picker__custom-hint a {
  color: var(--brand-primary);
  text-decoration: underline;
}
.icon-picker__custom-hint code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  padding: 1px 4px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--brand-text, #fff) 6%, transparent);
}
.icon-picker__custom-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 4px;
}
.icon-picker__custom-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 22%, transparent);
}
.icon-picker__custom-preview-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.icon-picker__custom-preview code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--brand-text, #fff);
}

.icon-picker__btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid transparent;
  cursor: pointer;
  transition: filter 150ms, background 150ms;
}
.icon-picker__btn--ghost {
  background: transparent;
  color: color-mix(in srgb, var(--brand-text, #fff) 70%, transparent);
}
.icon-picker__btn--ghost:hover {
  background: color-mix(in srgb, var(--brand-text, #fff) 6%, transparent);
}
.icon-picker__btn--primary {
  background: var(--brand-primary);
  color: var(--text-on-primary, var(--text-heading));
  border-color: var(--brand-primary);
}
.icon-picker__btn--primary:hover { filter: brightness(1.05); }

/* Footer */
.icon-picker__footer {
  display: flex;
  justify-content: center;
  padding: 8px 10px;
  border-top: 1px solid color-mix(in srgb, var(--brand-text, #fff) 8%, transparent);
}

/* Transitions */
.icon-pop-enter-active, .icon-pop-leave-active { transition: opacity 160ms ease, transform 160ms ease; }
.icon-pop-enter-from, .icon-pop-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
