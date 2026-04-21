<template>
  <div class="flex flex-col gap-3">
    <!-- Mode selector -->
    <div class="grid grid-cols-2 gap-2 md:grid-cols-5">
      <button
        v-for="m in modes"
        :key="m.value"
        type="button"
        class="rounded-sm border px-3 py-2 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-colors"
        :style="mode === m.value
          ? { borderColor: C.primary, color: C.primary, backgroundColor: `${C.primary}15` }
          : { borderColor: C.border, color: C.textMuted }"
        @click="setMode(m.value)"
      >
        {{ m.label }}
      </button>
    </div>

    <!-- Common: time picker (except 'every-n' and 'cron') -->
    <div v-if="mode === 'daily' || mode === 'weekdays' || mode === 'weekly'" class="grid gap-3 md:grid-cols-2">
      <label class="flex flex-col gap-1.5">
        <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">HORA (BRT)</span>
        <input
          v-model="timeStr"
          type="time"
          class="rounded-sm border bg-transparent px-3 py-2 font-mono-tab text-[12px] outline-none"
          :style="{ borderColor: C.border, color: C.text, colorScheme: 'dark' }"
          @change="emitChange"
        />
      </label>

      <!-- Weekly: pick days -->
      <div v-if="mode === 'weekly'" class="flex flex-col gap-1.5">
        <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">DIAS DA SEMANA</span>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="d in weekdays"
            :key="d.value"
            type="button"
            class="flex-1 rounded-sm border px-1 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.1em] transition-colors"
            :style="selectedDays.includes(d.value)
              ? { borderColor: C.primary, color: C.primary, backgroundColor: `${C.primary}15` }
              : { borderColor: C.border, color: C.textMuted }"
            @click="toggleDay(d.value)"
          >
            {{ d.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Every N minutes -->
    <div v-else-if="mode === 'every-n'" class="flex items-center gap-3">
      <label class="flex flex-col gap-1.5">
        <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">A CADA</span>
        <input
          v-model.number="everyN"
          type="number"
          min="1"
          max="120"
          class="w-24 rounded-sm border bg-transparent px-3 py-2 font-mono-tab text-[12px] outline-none"
          :style="{ borderColor: C.border, color: C.text }"
          @change="emitChange"
        />
      </label>
      <span class="font-mono-tab text-[11px] pt-6" :style="{ color: C.textMuted }">MINUTOS</span>
    </div>

    <!-- Cron raw -->
    <div v-else-if="mode === 'cron'" class="flex flex-col gap-1.5">
      <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">EXPRESSÃO CRON (5 CAMPOS · UTC)</span>
      <input
        v-model="cronRaw"
        type="text"
        placeholder="0 21 * * 1-5"
        class="rounded-sm border bg-transparent px-3 py-2 font-mono-tab text-[12px] outline-none"
        :style="{ borderColor: C.border, color: C.text }"
        @input="emitChange"
      />
      <span class="font-mono-tab text-[10px]" :style="{ color: C.textMuted }">
        O scheduler roda em UTC. Use o conversor mental: 18h BRT = 21h UTC.
      </span>
    </div>

    <!-- Preview -->
    <div class="flex flex-wrap items-center justify-between gap-3 rounded-sm border px-3 py-2.5" :style="{ borderColor: C.border, backgroundColor: C.surface }">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-calendar-clock" class="size-3.5" :style="{ color: C.primary }" />
        <span class="text-[12px]" :style="{ color: C.text }">{{ humanized }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="font-mono-tab text-[10px] uppercase" :style="{ color: C.textMuted }">cron</span>
        <code class="font-mono-tab text-[11px]" :style="{ color: C.primary }">{{ cron || '—' }}</code>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { REDENTIA_COLORS as C } from '~/utils/redentiaCreativeColors'

type Mode = 'daily' | 'weekdays' | 'weekly' | 'every-n' | 'cron'

const props = defineProps<{
  modelValue: string | null // cron string or null
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: string | null): void
}>()

const modes: Array<{ value: Mode; label: string }> = [
  { value: 'daily',    label: 'Todo dia' },
  { value: 'weekdays', label: 'Dias úteis' },
  { value: 'weekly',   label: 'Semanal' },
  { value: 'every-n',  label: 'A cada N min' },
  { value: 'cron',     label: 'Cron bruto' },
]

// Day-of-week: 0=Sunday in cron. Labels in BRT.
const weekdays: Array<{ value: number; label: string }> = [
  { value: 1, label: 'SEG' },
  { value: 2, label: 'TER' },
  { value: 3, label: 'QUA' },
  { value: 4, label: 'QUI' },
  { value: 5, label: 'SEX' },
  { value: 6, label: 'SÁB' },
  { value: 0, label: 'DOM' },
]

const mode = ref<Mode>('daily')
const timeStr = ref('18:00') // BRT
const selectedDays = ref<number[]>([5]) // friday default
const everyN = ref(15)
const cronRaw = ref('')

// Laravel's APP_TIMEZONE is America/Sao_Paulo in production, so the
// Laravel scheduler evaluates cron expressions in BRT — no UTC
// conversion needed here. A previous version converted BRT→UTC at
// cron generation, which made every schedule fire 3 hours late.
function parseTimeStr(timeBrt: string): { hour: number; minute: number } {
  const [h, m] = timeBrt.split(':').map(Number)
  return { hour: h % 24, minute: m || 0 }
}

const cron = computed<string | null>(() => {
  const { hour, minute } = parseTimeStr(timeStr.value)
  switch (mode.value) {
    case 'daily':
      return `${minute} ${hour} * * *`
    case 'weekdays':
      return `${minute} ${hour} * * 1-5`
    case 'weekly':
      if (selectedDays.value.length === 0) return null
      return `${minute} ${hour} * * ${[...selectedDays.value].sort((a, b) => a - b).join(',')}`
    case 'every-n':
      return `*/${Math.max(1, Math.min(120, everyN.value || 1))} * * * *`
    case 'cron':
      return (cronRaw.value || '').trim() || null
  }
})

const humanized = computed(() => {
  switch (mode.value) {
    case 'daily':    return `Todo dia às ${timeStr.value} BRT`
    case 'weekdays': return `Dias úteis (seg–sex) às ${timeStr.value} BRT`
    case 'weekly':   {
      if (selectedDays.value.length === 0) return 'Selecione ao menos um dia'
      const lbl = [...selectedDays.value]
        .sort((a, b) => a - b)
        .map(d => weekdays.find(w => w.value === d)?.label)
        .join(' · ')
      return `${lbl} às ${timeStr.value} BRT`
    }
    case 'every-n':  return `A cada ${everyN.value} minuto${everyN.value === 1 ? '' : 's'}`
    case 'cron':     return cronRaw.value ? `Cron custom: ${cronRaw.value}` : '—'
  }
})

function setMode(m: Mode) {
  mode.value = m
  emitChange()
}

function toggleDay(d: number) {
  const i = selectedDays.value.indexOf(d)
  if (i >= 0) selectedDays.value.splice(i, 1)
  else selectedDays.value.push(d)
  emitChange()
}

function emitChange() {
  emit('update:modelValue', cron.value)
}

// Parse incoming cron → reverse-engineer the mode + controls.
// Best-effort: unknown shapes fall through to "cron" mode so the admin
// can still edit them without losing the expression.
function parseIncoming(c: string | null) {
  if (!c || !c.trim()) {
    mode.value = 'daily'
    return
  }
  const parts = c.trim().split(/\s+/)
  if (parts.length !== 5) { mode.value = 'cron'; cronRaw.value = c; return }
  const [mm, hh, dom, mon, dow] = parts

  const everyMatch = mm.match(/^\*\/(\d+)$/)
  if (everyMatch && hh === '*' && dom === '*' && mon === '*' && dow === '*') {
    mode.value = 'every-n'
    everyN.value = Number(everyMatch[1])
    return
  }

  const minuteN = Number(mm)
  const hourN = Number(hh)
  const validTime = !Number.isNaN(minuteN) && !Number.isNaN(hourN) && dom === '*' && mon === '*'
  if (validTime) {
    // Cron is already in BRT (Laravel's APP_TIMEZONE), no conversion.
    timeStr.value = `${String(hourN).padStart(2, '0')}:${String(minuteN).padStart(2, '0')}`
    if (dow === '*') {
      mode.value = 'daily'; return
    }
    if (dow === '1-5') {
      mode.value = 'weekdays'; return
    }
    // Could be a list like 1,3,5
    if (/^[0-6](,[0-6])*$/.test(dow)) {
      mode.value = 'weekly'
      selectedDays.value = dow.split(',').map(Number)
      return
    }
  }

  mode.value = 'cron'
  cronRaw.value = c
}

// Seed from incoming prop on mount + any later external changes.
watch(() => props.modelValue, (v) => parseIncoming(v ?? null), { immediate: true })
</script>
