<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6">
    <header class="flex items-center justify-between gap-4">
      <div>
        <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
          [{{ isNew ? 'NOVO TENANT' : 'EDITAR TENANT' }}]
        </span>
        <h1 class="mt-2 text-[28px] leading-tight md:text-[36px]" :style="{ color: C.text, fontFamily: F.display }">
          {{ form.name || form.slug || 'Tenant sem nome' }}
        </h1>
      </div>
      <NuxtLink
        to="/admin/tenants"
        class="font-mono-tab text-[10px] uppercase tracking-[0.15em]"
        :style="{ color: C.textMuted }"
      >← VOLTAR</NuxtLink>
    </header>

    <form class="flex flex-col gap-5" @submit.prevent="handleSubmit">
      <!-- Main fields -->
      <div class="grid gap-4 md:grid-cols-2">
        <label class="flex flex-col gap-2">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">&gt; SLUG *</span>
          <input
            v-model="form.slug"
            type="text"
            required
            pattern="[a-z0-9-]+"
            maxlength="60"
            :disabled="!isNew"
            class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none disabled:opacity-60"
            :style="{ borderColor: C.border, color: C.text }"
          />
          <span v-if="!isNew" class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">
            SLUG IMUTÁVEL APÓS CRIAÇÃO
          </span>
        </label>
        <label class="flex flex-col gap-2">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">&gt; NOME *</span>
          <input
            v-model="form.name"
            type="text"
            required
            maxlength="120"
            class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none"
            :style="{ borderColor: C.border, color: C.text }"
          />
        </label>
        <label class="flex flex-col gap-2 md:col-span-2">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">&gt; DOMÍNIO CUSTOM (opcional)</span>
          <input
            v-model="form.domain"
            type="text"
            placeholder="exemplo.com.br"
            class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none"
            :style="{ borderColor: C.border, color: C.text }"
          />
        </label>
        <label class="flex items-center gap-2 md:col-span-2">
          <input v-model="form.is_active" type="checkbox" class="size-4" />
          <span class="text-[13px]" :style="{ color: C.text }">Tenant ativo</span>
        </label>
      </div>

      <!-- Config JSON -->
      <div class="flex flex-col gap-2">
        <div class="flex items-baseline justify-between">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
            &gt; CONFIG (JSON)
          </span>
          <span v-if="configError" class="font-mono-tab text-[10px]" :style="{ color: C.negative }">
            {{ configError }}
          </span>
          <span v-else-if="configValidAt" class="font-mono-tab text-[10px]" :style="{ color: C.positive }">
            ✓ JSON VÁLIDO
          </span>
        </div>
        <textarea
          v-model="configText"
          rows="20"
          class="rounded-sm border bg-transparent px-3 py-2 font-mono-tab text-[12px] outline-none"
          :style="{
            borderColor: configError ? C.negative : C.border,
            color: C.text,
            backgroundColor: C.surface,
          }"
          spellcheck="false"
          @input="validateConfig"
        />
        <p class="font-mono-tab text-[10px] uppercase leading-[1.5] tracking-[0.12em]" :style="{ color: C.textMuted }">
          &gt; CAMPOS OBRIGATÓRIOS: COLORS.PRIMARY, COLORS.BACKGROUND, COLORS.TEXT, FONT.FAMILY. DEMAIS SÃO OPCIONAIS.
        </p>
      </div>

      <!-- Error box -->
      <div v-if="error" class="rounded-sm border px-4 py-3 text-[13px]" :style="{ borderColor: C.negative, color: C.negative }">
        {{ error }}
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3">
        <button
          type="submit"
          :disabled="submitting || !!configError"
          class="inline-flex items-center gap-2 rounded-sm px-5 py-2.5 font-mono-tab text-[11px] font-bold uppercase tracking-[0.15em] transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          :style="{ backgroundColor: C.primary, color: C.background }"
        >
          <UIcon v-if="submitting" name="i-lucide-loader-2" class="size-4 animate-spin" />
          <UIcon v-else :name="isNew ? 'i-lucide-plus' : 'i-lucide-save'" class="size-4" />
          {{ isNew ? '[CRIAR TENANT]' : '[SALVAR ALTERAÇÕES]' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { REDENTIA_COLORS as C, REDENTIA_FONTS as F } from '~/utils/redentiaCreativeColors'

const props = defineProps<{ initial: any; isNew: boolean }>()
const emit = defineEmits<{ (e: 'saved', tenant: any): void }>()

const tenantsService = useTenantsService()

const form = reactive({
  slug: props.initial.slug || '',
  name: props.initial.name || '',
  domain: props.initial.domain || '',
  is_active: props.initial.is_active ?? true,
})

const configText = ref(JSON.stringify(props.initial.config || {}, null, 2))
const configError = ref<string | null>(null)
const configValidAt = ref<number | null>(Date.now())
const submitting = ref(false)
const error = ref<string | null>(null)

function validateConfig() {
  try {
    JSON.parse(configText.value)
    configError.value = null
    configValidAt.value = Date.now()
  } catch (e: any) {
    configError.value = e.message?.replace(/^\w+ SyntaxError: /i, '') || 'JSON inválido'
    configValidAt.value = null
  }
}

async function handleSubmit() {
  validateConfig()
  if (configError.value) return
  submitting.value = true
  error.value = null

  try {
    const body: any = {
      slug: form.slug,
      name: form.name,
      domain: form.domain || null,
      is_active: form.is_active,
      config: JSON.parse(configText.value),
    }
    // slug is immutable on update per backend rule
    if (!props.isNew) delete body.slug

    const resp = props.isNew
      ? await tenantsService.create(body)
      : await tenantsService.update(props.initial.id, body)

    const saved = (resp as any)?.data || resp
    emit('saved', saved)
  } catch (e: any) {
    const messages = e?.data?.errors
      ? Object.values(e.data.errors).flat().join(' · ')
      : (e?.data?.message || e?.message || 'Erro ao salvar tenant.')
    error.value = messages
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.font-mono-tab { font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace; font-feature-settings: 'tnum' 1; }
textarea:focus { outline: none !important; }
</style>
