<template>
  <div class="flex flex-col gap-2">
    <div v-if="loading" class="flex items-center gap-2 rounded-sm border px-3 py-2.5" :style="{ borderColor: C.border, color: C.textMuted }">
      <UIcon name="i-lucide-loader-2" class="size-3.5 motion-safe:animate-spin" />
      <span class="font-mono-tab text-[11px]">Buscando integrações do Postiz…</span>
    </div>

    <div
      v-else-if="!live"
      class="rounded-sm border px-3 py-2.5"
      :style="{ borderColor: C.negative, color: C.negative }"
    >
      <div class="font-mono-tab text-[10px] uppercase tracking-[0.15em]">Postiz não configurado</div>
      <div class="mt-1 text-[12px]" :style="{ color: C.text }">
        Defina <code>POSTIZ_ENABLED=true</code>, <code>POSTIZ_API_URL</code> e <code>POSTIZ_API_KEY</code> no <code>.env</code> do backend.
        Enquanto isso, a automação vai rodar em modo stub (não publica de verdade).
      </div>
    </div>

    <div v-else-if="!integrations.length" class="rounded-sm border px-3 py-2.5 text-[12px]" :style="{ borderColor: C.border, color: C.textMuted }">
      Nenhuma conta conectada no Postiz ainda. Abra <a href="https://postiz.redentia.com.br" target="_blank" rel="noopener" class="underline" :style="{ color: C.primary }">postiz.redentia.com.br</a> e conecte Instagram, X, etc.
    </div>

    <!-- List -->
    <div v-else class="flex flex-col gap-1.5">
      <label
        v-for="i in integrations"
        :key="i.id"
        class="flex cursor-pointer items-center gap-3 rounded-sm border px-3 py-2 transition-colors hover:brightness-110"
        :style="isSelected(i.id)
          ? { borderColor: C.primary, backgroundColor: `${C.primary}10` }
          : { borderColor: C.border }"
      >
        <input
          type="checkbox"
          class="size-4 accent-orange-500"
          :checked="isSelected(i.id)"
          @change="toggle(i.id)"
        />
        <img
          v-if="i.picture"
          :src="i.picture"
          :alt="i.name"
          class="size-7 rounded-full object-cover"
          :style="{ border: `1px solid ${C.border}` }"
        />
        <div
          v-else
          class="flex size-7 items-center justify-center rounded-full font-mono-tab text-[10px]"
          :style="{ backgroundColor: C.surface, color: C.textMuted, border: `1px solid ${C.border}` }"
        >
          {{ initials(i.name) }}
        </div>
        <div class="flex-1">
          <div class="text-[13px] leading-tight" :style="{ color: C.text }">{{ i.name }}</div>
          <div v-if="i.identifier" class="font-mono-tab text-[10px] uppercase tracking-[0.1em]" :style="{ color: C.textMuted }">
            {{ i.identifier }}
          </div>
        </div>
        <span
          v-if="i.disabled"
          class="rounded-sm border px-1.5 py-0.5 font-mono-tab text-[9px] uppercase tracking-[0.1em]"
          :style="{ borderColor: C.negative, color: C.negative }"
        >desativada</span>
      </label>
    </div>

    <!-- Refresh -->
    <div class="flex items-center justify-between gap-2 pt-1">
      <span class="font-mono-tab text-[10px]" :style="{ color: C.textMuted }">
        {{ modelValue.length }} selecionada{{ modelValue.length === 1 ? '' : 's' }} · cache 5 min
      </span>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-opacity hover:opacity-70"
        :style="{ color: C.textMuted }"
        @click="refresh(true)"
      >
        <UIcon name="i-lucide-refresh-cw" class="size-3" :class="refreshing ? 'motion-safe:animate-spin' : ''" />
        ATUALIZAR
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { REDENTIA_COLORS as C } from '~/utils/redentiaCreativeColors'

interface Integration {
  id: string
  name: string
  identifier: string | null
  picture: string | null
  disabled: boolean
}

const props = defineProps<{
  modelValue: string[]
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: string[]): void
}>()

const config = useRuntimeConfig()
const { authFetch } = useCustomFetch()

const integrations = ref<Integration[]>([])
const live = ref(true)
const loading = ref(true)
const refreshing = ref(false)

function isSelected(id: string): boolean {
  return props.modelValue.includes(id)
}

function toggle(id: string) {
  const next = props.modelValue.includes(id)
    ? props.modelValue.filter(x => x !== id)
    : [...props.modelValue, id]
  emit('update:modelValue', next)
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase() || '')
    .join('') || '?'
}

async function refresh(force = false) {
  const flag = force ? refreshing : loading
  flag.value = true
  try {
    const url = `${config.public.apiBaseUrl as string}/admin/postiz/integrations${force ? '?refresh=1' : ''}`
    const r = await authFetch<{ live: boolean; integrations: Integration[] }>(url, { method: 'GET' }) as any
    const payload = r?.data ?? r
    live.value = !!payload?.live
    integrations.value = payload?.integrations ?? []
  } catch (e) {
    // Silently fall back — the caller still sees 0 integrations and can retry.
    live.value = false
    integrations.value = []
  } finally {
    flag.value = false
  }
}

onMounted(() => refresh(false))
</script>
