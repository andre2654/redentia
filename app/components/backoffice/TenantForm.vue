<template>
  <form @submit.prevent="handleSubmit" class="flex flex-col gap-5 pb-24">
    <!-- Tenant info (top-level) -->
    <BackofficeFormSection title="Identificacao" icon="i-lucide-tag" default-open>
      <div class="grid gap-4 sm:grid-cols-2">
        <BackofficeFormField label="Nome" required :error="errors.name">
          <input
            v-model="form.name"
            type="text"
            class="form-input"
            placeholder="Me Poupe!"
            @blur="validateField('name')"
          />
        </BackofficeFormField>
        <BackofficeFormField label="Slug" required :error="errors.slug" hint="Identificador unico (URL-safe). Gerado automaticamente a partir do nome.">
          <div class="flex gap-2">
            <input
              v-model="form.slug"
              type="text"
              class="form-input flex-1 font-mono"
              placeholder="me-poupe"
              @blur="validateField('slug')"
            />
            <button
              v-if="!initial && form.name && !slugManuallyEdited"
              type="button"
              class="shrink-0 rounded-lg border px-3 text-xs transition hover:opacity-70"
              :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted }"
              title="Regenerar slug a partir do nome"
              @click="regenerateSlug"
            >
              <UIcon name="i-lucide-refresh-cw" class="size-3.5" />
            </button>
          </div>
        </BackofficeFormField>
        <BackofficeFormField label="Dominio" hint="Dominio principal do tenant (ex: www.mepoupe.com)">
          <input v-model="form.domain" type="text" class="form-input" placeholder="www.mepoupe.com" />
        </BackofficeFormField>
        <BackofficeFormField label="Status">
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.is_active" type="checkbox" class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500" />
            <span class="text-sm text-zinc-300">Ativo</span>
          </label>
        </BackofficeFormField>
      </div>
    </BackofficeFormSection>

    <!-- Identidade -->
    <BackofficeFormSection title="Identidade da Marca" icon="i-lucide-sparkles" default-open>
      <div class="grid gap-4 sm:grid-cols-2">
        <BackofficeFormField label="Nome da marca" required :error="errors.configName">
          <input v-model="config.name" type="text" class="form-input" @blur="validateField('configName')" />
        </BackofficeFormField>
        <BackofficeFormField label="Nome curto" hint="Versao abreviada para headers e espacos pequenos">
          <input v-model="config.shortName" type="text" class="form-input" />
        </BackofficeFormField>
        <BackofficeFormField label="Tagline" required :error="errors.tagline" hint="Frase curta que define a marca">
          <input v-model="config.tagline" type="text" class="form-input" @blur="validateField('tagline')" />
        </BackofficeFormField>
        <BackofficeFormField label="Subtitulo" hint="Texto complementar a tagline">
          <input v-model="config.subtitle" type="text" class="form-input" />
        </BackofficeFormField>
        <BackofficeFormField label="Descricao" class="sm:col-span-2" hint="Descricao mais longa da marca para SEO e sobre nos">
          <textarea v-model="config.description" class="form-input min-h-[80px]" />
        </BackofficeFormField>
      </div>
    </BackofficeFormSection>

    <!-- Persona/Founder -->
    <BackofficeFormSection title="Persona do Influenciador" icon="i-lucide-user" hint="Dados do fundador/influenciador que representa a marca">
      <div class="grid gap-4 sm:grid-cols-2">
        <BackofficeFormField label="Nome">
          <input v-model="config.founder.name" type="text" class="form-input" />
        </BackofficeFormField>
        <BackofficeFormField label="Cargo/Titulo" hint="Ex: CEO, Analista, Fundador">
          <input v-model="config.founder.role" type="text" class="form-input" />
        </BackofficeFormField>
        <BackofficeFormField label="Foto (path)" hint="Caminho relativo ao public/ (ex: /brands/mepoupe/founder.jpg)">
          <input v-model="config.founder.photo" type="text" class="form-input font-mono text-xs" />
        </BackofficeFormField>
        <BackofficeFormField label="Frase iconica" hint="Bordao ou frase que o influenciador costuma usar">
          <input v-model="config.founder.signaturePhrase" type="text" class="form-input" />
        </BackofficeFormField>
        <BackofficeFormField label="Bio" class="sm:col-span-2">
          <textarea v-model="config.founder.bio" class="form-input min-h-[60px]" />
        </BackofficeFormField>
      </div>
    </BackofficeFormSection>

    <!-- Tom de Voz -->
    <BackofficeFormSection title="Tom de Voz" icon="i-lucide-megaphone" hint="Define como a IA se comunica: textos de botoes, saudacoes, mensagens de erro">
      <div class="grid gap-4 sm:grid-cols-2">
        <BackofficeFormField label="Estilo" hint="Define a personalidade geral do texto">
          <select v-model="config.voice.style" class="form-input">
            <option value="premium">Premium - Sofisticado e elegante</option>
            <option value="pop">Pop - Descontraido e acessivel</option>
            <option value="tecnico">Tecnico - Formal e preciso</option>
          </select>
        </BackofficeFormField>
        <BackofficeFormField label="Saudacao" hint="Mensagem de boas-vindas ao usuario">
          <input v-model="config.voice.greeting" type="text" class="form-input" />
        </BackofficeFormField>
        <BackofficeFormField label="CTA Primario" hint="Texto do botao principal (ex: Comecar agora)">
          <input v-model="config.voice.ctaPrimary" type="text" class="form-input" />
        </BackofficeFormField>
        <BackofficeFormField label="CTA Secundario" hint="Texto do botao secundario (ex: Saiba mais)">
          <input v-model="config.voice.ctaSecondary" type="text" class="form-input" />
        </BackofficeFormField>
        <BackofficeFormField label="Estado vazio" hint="Mensagem quando nao ha dados para mostrar">
          <input v-model="config.voice.emptyState" type="text" class="form-input" />
        </BackofficeFormField>
        <BackofficeFormField label="Encorajamento" hint="Mensagem motivacional para o usuario">
          <input v-model="config.voice.encouragement" type="text" class="form-input" />
        </BackofficeFormField>
        <BackofficeFormField label="Mensagem de erro" hint="Texto mostrado quando algo deu errado">
          <input v-model="config.voice.error" type="text" class="form-input" />
        </BackofficeFormField>
      </div>
    </BackofficeFormSection>

    <!-- URLs -->
    <BackofficeFormSection title="URLs e Contato" icon="i-lucide-link" hint="Links e emails associados a marca">
      <div class="grid gap-4 sm:grid-cols-2">
        <BackofficeFormField label="URL do site" hint="Endereco completo do site (com https://)">
          <input v-model="config.url" type="text" class="form-input" placeholder="https://www.mepoupe.com" />
        </BackofficeFormField>
        <BackofficeFormField label="Email de contato" :error="errors.email">
          <input v-model="config.email" type="email" class="form-input" @blur="validateField('email')" />
        </BackofficeFormField>
        <BackofficeFormField label="Email de privacidade" :error="errors.privacyEmail" hint="Email para solicitacoes LGPD">
          <input v-model="config.privacyEmail" type="email" class="form-input" @blur="validateField('privacyEmail')" />
        </BackofficeFormField>
      </div>
    </BackofficeFormSection>

    <!-- Cores -->
    <BackofficeFormSection title="Cores" icon="i-lucide-palette" default-open>
      <div class="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <BackofficeColorField v-model="config.colors.primary" label="Primaria" />
        <BackofficeColorField v-model="config.colors.secondary" label="Secundaria" />
        <BackofficeColorField v-model="config.colors.tertiary" label="Terciaria" />
        <BackofficeColorField v-model="config.colors.positive" label="Positivo" />
        <BackofficeColorField v-model="config.colors.negative" label="Negativo" />
        <BackofficeColorField v-model="config.colors.neutral" label="Neutro" />
        <BackofficeColorField v-model="config.colors.background" label="Background" />
        <BackofficeColorField v-model="config.colors.surface" label="Surface" />
        <BackofficeColorField v-model="config.colors.surfaceHover" label="Surface Hover" />
        <BackofficeColorField v-model="config.colors.border" label="Borda" />
        <BackofficeColorField v-model="config.colors.text" label="Texto" />
        <BackofficeColorField v-model="config.colors.textMuted" label="Texto Muted" />
        <BackofficeColorField v-model="config.colors.inputBg" label="Input BG" />
        <BackofficeColorField v-model="config.colors.inputBgHover" label="Input BG Hover" />
        <BackofficeColorField v-model="config.colors.inputBorder" label="Input Borda" />
      </div>
      <div class="mt-4 grid gap-4 sm:grid-cols-3">
        <BackofficeColorField v-model="config.colors.gradient.from" label="Gradient From" />
        <BackofficeColorField v-model="config.colors.gradient.via" label="Gradient Via" />
        <BackofficeColorField v-model="config.colors.gradient.to" label="Gradient To" />
      </div>
    </BackofficeFormSection>

    <!-- Tipografia -->
    <BackofficeFormSection title="Tipografia" icon="i-lucide-type">
      <div class="grid gap-4 sm:grid-cols-2">
        <BackofficeFormField label="Font family" required :error="errors.fontFamily" hint="Nome da fonte (ex: Montserrat, Sora, Inter)">
          <input v-model="config.font.family" type="text" class="form-input" placeholder="Montserrat" @blur="validateField('fontFamily')" />
        </BackofficeFormField>
        <BackofficeFormField label="Google Fonts spec" hint="Especificacao para importar do Google Fonts (ex: Montserrat:wght@300..800)">
          <input v-model="config.font.google" type="text" class="form-input font-mono text-xs" placeholder="Montserrat:wght@300..800" />
        </BackofficeFormField>
        <BackofficeFormField label="Heading weight">
          <select v-model="config.font.headingWeight" class="form-input">
            <option value="font-bold">Bold</option>
            <option value="font-extrabold">Extra Bold</option>
            <option value="font-black">Black</option>
          </select>
        </BackofficeFormField>
        <BackofficeFormField label="Heading style">
          <select v-model="config.font.headingStyle" class="form-input">
            <option value="normal-case">Normal</option>
            <option value="uppercase tracking-wide">Uppercase</option>
            <option value="uppercase tracking-wider">Uppercase Wider</option>
          </select>
        </BackofficeFormField>
      </div>
    </BackofficeFormSection>

    <!-- Tema Visual -->
    <BackofficeFormSection title="Tema Visual" icon="i-lucide-paintbrush">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BackofficeFormField label="Modo" hint="Dark: fundo escuro, Light: fundo claro">
          <select v-model="config.theme.mode" class="form-input">
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="both">Both</option>
          </select>
        </BackofficeFormField>
        <BackofficeFormField label="Border Radius" hint="Arredondamento dos cantos dos elementos">
          <select v-model="config.theme.borderRadius" class="form-input">
            <option value="sharp">Sharp (8px)</option>
            <option value="rounded">Rounded (16px)</option>
            <option value="pill">Pill (24px)</option>
          </select>
        </BackofficeFormField>
        <BackofficeFormField label="Animacao">
          <select v-model="config.theme.animation" class="form-input">
            <option value="none">Nenhuma</option>
            <option value="snappy">Snappy</option>
            <option value="smooth">Smooth</option>
          </select>
        </BackofficeFormField>
        <BackofficeFormField label="Background Pattern">
          <select v-model="config.theme.backgroundPattern" class="form-input">
            <option value="none">Nenhum</option>
            <option value="grid">Grid</option>
            <option value="dots">Dots</option>
            <option value="gradient">Gradient</option>
            <option value="noise">Noise</option>
          </select>
        </BackofficeFormField>
      </div>
    </BackofficeFormSection>

    <!-- Feature Flags -->
    <BackofficeFormSection title="Feature Flags" icon="i-lucide-toggle-left" hint="Ative ou desative funcionalidades especificas para este tenant">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label
          v-for="(value, key) in config.features"
          :key="key"
          class="flex items-center gap-3 cursor-pointer rounded-lg border px-3 py-2.5 transition hover:border-zinc-700"
          :style="{ borderColor: brand.colors.border }"
        >
          <input v-model="config.features[key]" type="checkbox" class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500" />
          <div class="min-w-0">
            <span class="text-sm text-zinc-300">{{ featureFlagLabels[key]?.label || key }}</span>
            <p v-if="featureFlagLabels[key]?.hint" class="text-[11px] leading-tight text-zinc-500">{{ featureFlagLabels[key].hint }}</p>
          </div>
        </label>
      </div>
    </BackofficeFormSection>

    <!-- Logos -->
    <BackofficeFormSection title="Logos e Assets" icon="i-lucide-image">
      <div class="grid gap-4 sm:grid-cols-2">
        <BackofficeFormField label="Logo icon (path)" hint="Icone quadrado da marca (ex: /brands/mepoupe/icon.svg)">
          <input v-model="config.logo.icon" type="text" class="form-input font-mono text-xs" />
        </BackofficeFormField>
        <BackofficeFormField label="Logo full (path)" hint="Logo completo com nome (ex: /brands/mepoupe/full.svg)">
          <input v-model="config.logo.full" type="text" class="form-input font-mono text-xs" />
        </BackofficeFormField>
        <BackofficeFormField label="Favicon" hint="Icone do navegador (ex: /brands/mepoupe/favicon.png)">
          <input v-model="config.logo.favicon" type="text" class="form-input font-mono text-xs" />
        </BackofficeFormField>
        <BackofficeFormField label="OG Image" hint="Imagem para compartilhamento em redes sociais">
          <input v-model="config.logo.og" type="text" class="form-input font-mono text-xs" />
        </BackofficeFormField>
      </div>
    </BackofficeFormSection>

    <!-- SEO -->
    <BackofficeFormSection title="SEO" icon="i-lucide-search">
      <div class="grid gap-4 sm:grid-cols-2">
        <BackofficeFormField label="Titulo SEO" hint="Titulo que aparece no Google e na aba do navegador">
          <input v-model="config.seo.title" type="text" class="form-input" />
        </BackofficeFormField>
        <BackofficeFormField label="Theme Color" hint="Cor da barra do navegador mobile (hex)">
          <input v-model="config.seo.themeColor" type="text" class="form-input" />
        </BackofficeFormField>
        <BackofficeFormField label="Descricao SEO" class="sm:col-span-2" hint="Meta description para mecanismos de busca (max 160 caracteres)">
          <textarea v-model="config.seo.description" class="form-input min-h-[60px]" />
        </BackofficeFormField>
      </div>
    </BackofficeFormSection>

    <!-- Social -->
    <BackofficeFormSection title="Redes Sociais" icon="i-lucide-share-2">
      <div class="grid gap-4 sm:grid-cols-2">
        <BackofficeFormField label="YouTube">
          <input v-model="config.social.youtube" type="url" class="form-input" />
        </BackofficeFormField>
        <BackofficeFormField label="Instagram">
          <input v-model="config.social.instagram" type="url" class="form-input" />
        </BackofficeFormField>
        <BackofficeFormField label="Twitter/X">
          <input v-model="config.social.twitter" type="url" class="form-input" />
        </BackofficeFormField>
        <BackofficeFormField label="TikTok">
          <input v-model="config.social.tiktok" type="url" class="form-input" />
        </BackofficeFormField>
        <BackofficeFormField label="Telegram">
          <input v-model="config.social.telegram" type="url" class="form-input" />
        </BackofficeFormField>
        <BackofficeFormField label="Podcast">
          <input v-model="config.social.podcast" type="url" class="form-input" />
        </BackofficeFormField>
      </div>
    </BackofficeFormSection>

    <!-- Meta / Facebook Pixel -->
    <BackofficeFormSection title="Meta / Facebook Pixel" icon="i-lucide-megaphone" hint="Configure o pixel do Meta (Facebook) para rastreamento de conversoes">
      <div class="grid gap-4 sm:grid-cols-2">
        <BackofficeFormField label="Pixel ID" hint="ID do pixel do Facebook (ex: 945074934545164)">
          <input v-model="metaConfig.pixelId" type="text" class="form-input font-mono" placeholder="945074934545164" />
        </BackofficeFormField>
        <BackofficeFormField label="Access Token (CAPI)" hint="Token de acesso da Conversion API do Meta">
          <input v-model="metaConfig.accessToken" type="text" class="form-input font-mono text-xs" placeholder="EAATLLdXzNtMBR..." />
        </BackofficeFormField>
      </div>
    </BackofficeFormSection>

    <!-- Company -->
    <BackofficeFormSection title="Institucional" icon="i-lucide-building">
      <div class="grid gap-4 sm:grid-cols-2">
        <BackofficeFormField label="Razao Social">
          <input v-model="config.company.legalName" type="text" class="form-input" />
        </BackofficeFormField>
        <BackofficeFormField label="CNPJ">
          <input v-model="config.company.cnpj" type="text" class="form-input" />
        </BackofficeFormField>
        <BackofficeFormField label="Endereco" class="sm:col-span-2">
          <input v-model="config.company.address" type="text" class="form-input" />
        </BackofficeFormField>
      </div>
    </BackofficeFormSection>

    <!-- JSON Editor fallback (advanced) -->
    <BackofficeFormSection title="Editor Avancado (JSON)" icon="i-lucide-code">
      <div class="mb-3 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
        <UIcon name="i-lucide-alert-triangle" class="mt-0.5 size-4 shrink-0 text-amber-400" />
        <p class="text-xs text-amber-300/80">Cuidado: alteracoes aqui sobrescrevem os campos do formulario. Use apenas para campos nao disponiveis acima.</p>
      </div>
      <textarea
        v-model="jsonOverride"
        class="form-input min-h-[300px] font-mono text-xs"
        placeholder="Cole aqui um JSON parcial para mesclar ao config..."
      />
      <p v-if="jsonError" class="mt-1 text-xs text-red-400">{{ jsonError }}</p>
    </BackofficeFormSection>

    <!-- Preview -->
    <BackofficeFormSection title="Preview" icon="i-lucide-eye" default-open>
      <div class="rounded-xl border border-zinc-800 overflow-hidden">
        <div class="p-6" :style="{ backgroundColor: config.colors.background, color: config.colors.text }">
          <div class="flex items-center gap-3 mb-4">
            <div class="h-10 w-10 rounded-lg" :style="{ backgroundColor: config.colors.primary }" />
            <div>
              <h3 class="font-semibold" :style="{ fontFamily: config.font.family + ', sans-serif' }">{{ config.name || 'Nome da marca' }}</h3>
              <p class="text-sm" :style="{ color: config.colors.textMuted }">{{ config.tagline || 'Tagline' }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <span class="rounded-md px-3 py-1.5 text-sm font-medium text-white" :style="{ backgroundColor: config.colors.primary }">
              {{ config.voice.ctaPrimary || 'CTA Primario' }}
            </span>
            <span class="rounded-md border px-3 py-1.5 text-sm" :style="{ borderColor: config.colors.border, color: config.colors.textMuted }">
              {{ config.voice.ctaSecondary || 'CTA Secundario' }}
            </span>
          </div>
          <div class="mt-4 flex gap-3">
            <div class="flex-1 rounded-lg p-3" :style="{ backgroundColor: config.colors.surface }">
              <span class="text-xs" :style="{ color: config.colors.textMuted }">Surface</span>
            </div>
            <div class="flex-1 rounded-lg border p-3" :style="{ borderColor: config.colors.border, backgroundColor: config.colors.surface }">
              <span class="text-xs" :style="{ color: config.colors.positive }">+2.45%</span>
              <span class="ml-2 text-xs" :style="{ color: config.colors.negative }">-1.20%</span>
            </div>
          </div>
        </div>
      </div>
    </BackofficeFormSection>

    <!-- Submit -->
    <div
      class="fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-xl xl:left-[320px]"
      :style="{ borderColor: brand.colors.border, background: brand.colors.background + 'ee' }"
    >
      <div class="flex items-center justify-between gap-3 px-6 py-4">
        <p v-if="isDirty" class="flex items-center gap-1.5 text-xs text-amber-400">
          <UIcon name="i-lucide-circle-dot" class="size-3" />
          Alteracoes nao salvas
        </p>
        <span v-else />
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/backoffice/tenants"
            class="rounded-lg border px-4 py-2.5 text-sm transition hover:opacity-80"
            :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted }"
            @click.prevent="handleCancel"
          >
            Cancelar
          </NuxtLink>
          <button
            type="submit"
            :disabled="saving"
            class="flex items-center gap-2 rounded-lg bg-secondary px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <UIcon v-if="saving" name="i-lucide-loader-2" class="size-4 animate-spin" />
            {{ initial ? 'Salvar alteracoes' : 'Criar tenant' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Unsaved changes modal -->
    <BackofficeConfirmModal
      v-model="showUnsavedModal"
      title="Alteracoes nao salvas"
      message="Voce tem alteracoes que ainda nao foram salvas. Deseja realmente sair?"
      confirm-text="Sair sem salvar"
      cancel-text="Continuar editando"
      variant="warning"
      @confirm="forceNavigate"
    />
  </form>
</template>

<script setup lang="ts">
import type { ITenant, ITenantPayload } from '~/types/tenant'
import { brand as defaultBrand } from '~/config/brand'

const brand = useBrand()
const router = useRouter()

const props = defineProps<{
  initial?: ITenant
  saving?: boolean
}>()

const emit = defineEmits<{
  save: [payload: ITenantPayload]
}>()

const featureFlagLabels: Record<string, { label: string; hint?: string }> = {
  showAIAdvisor: { label: 'Assessor IA', hint: 'Chat com inteligencia artificial' },
  showAppStoreLinks: { label: 'Links App Store', hint: 'Botoes para baixar o app' },
  showCalculators: { label: 'Calculadoras', hint: 'Ferramentas de calculo financeiro' },
  showDividends: { label: 'Dividendos', hint: 'Secao de dividendos por ativo' },
  showNews: { label: 'Noticias', hint: 'Feed de noticias do mercado' },
  showDownloadPage: { label: 'Pagina Download', hint: 'Pagina dedicada para download do app' },
  showFounderPhoto: { label: 'Foto Fundador', hint: 'Exibir foto do influenciador' },
  showEcosystemLinks: { label: 'Links Ecossistema', hint: 'Links para outros produtos da marca' },
  showGlossary: { label: 'Glossario', hint: 'Dicionario de termos financeiros' },
  showGuides: { label: 'Guias', hint: 'Guias e tutoriais educativos' },
}

// Top-level form fields
const form = reactive({
  slug: props.initial?.slug ?? '',
  name: props.initial?.name ?? '',
  domain: props.initial?.domain ?? '',
  is_active: props.initial?.is_active ?? true,
})

// Slug auto-generation
const slugManuallyEdited = ref(!!props.initial)

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function regenerateSlug() {
  form.slug = slugify(form.name)
}

// Auto-gen slug from name for new tenants
watch(() => form.name, (name) => {
  if (!props.initial && !slugManuallyEdited.value) {
    form.slug = slugify(name)
  }
})

// Detect manual slug edits
watch(() => form.slug, (val, oldVal) => {
  if (!props.initial && oldVal !== undefined) {
    const autoSlug = slugify(form.name)
    if (val !== autoSlug) slugManuallyEdited.value = true
  }
})

// Deep clone config from initial or default
function makeConfig() {
  const source = props.initial?.config ?? defaultBrand
  return JSON.parse(JSON.stringify(source))
}

const config = reactive(makeConfig())

// Meta pixel config (nested optional object)
const metaConfig = reactive({
  pixelId: config.meta?.pixelId ?? '',
  accessToken: config.meta?.accessToken ?? '',
})

// Sync domain from form to config.domain
watch(() => form.domain, (d) => {
  config.domain = d
})

const jsonOverride = ref('')
const jsonError = ref('')

// Validate JSON override
watch(jsonOverride, (val) => {
  if (!val.trim()) {
    jsonError.value = ''
    return
  }
  try {
    JSON.parse(val)
    jsonError.value = ''
  } catch {
    jsonError.value = 'JSON invalido'
  }
})

// Validation
const errors = reactive<Record<string, string>>({
  name: '',
  slug: '',
  configName: '',
  tagline: '',
  fontFamily: '',
  email: '',
  privacyEmail: '',
})

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateField(field: string): boolean {
  switch (field) {
    case 'name':
      errors.name = form.name.trim() ? '' : 'Nome e obrigatorio'
      return !errors.name
    case 'slug':
      if (!form.slug.trim()) {
        errors.slug = 'Slug e obrigatorio'
      } else if (!slugRegex.test(form.slug)) {
        errors.slug = 'Apenas letras minusculas, numeros e hifens'
      } else {
        errors.slug = ''
      }
      return !errors.slug
    case 'configName':
      errors.configName = config.name?.trim() ? '' : 'Nome da marca e obrigatorio'
      return !errors.configName
    case 'tagline':
      errors.tagline = config.tagline?.trim() ? '' : 'Tagline e obrigatoria'
      return !errors.tagline
    case 'fontFamily':
      errors.fontFamily = config.font?.family?.trim() ? '' : 'Font family e obrigatoria'
      return !errors.fontFamily
    case 'email':
      if (config.email && !emailRegex.test(config.email)) {
        errors.email = 'Email invalido'
      } else {
        errors.email = ''
      }
      return !errors.email
    case 'privacyEmail':
      if (config.privacyEmail && !emailRegex.test(config.privacyEmail)) {
        errors.privacyEmail = 'Email invalido'
      } else {
        errors.privacyEmail = ''
      }
      return !errors.privacyEmail
    default:
      return true
  }
}

function validateAll(): boolean {
  const fields = ['name', 'slug', 'configName', 'tagline', 'fontFamily', 'email', 'privacyEmail']
  let valid = true
  for (const f of fields) {
    if (!validateField(f)) valid = false
  }
  return valid
}

// Dirty tracking
const initialSnapshot = ref('')
onMounted(() => {
  nextTick(() => {
    initialSnapshot.value = JSON.stringify({ form: { ...form }, config: JSON.parse(JSON.stringify(config)) })
  })
})

const isDirty = computed(() => {
  if (!initialSnapshot.value) return false
  const current = JSON.stringify({ form: { ...form }, config: JSON.parse(JSON.stringify(config)) })
  return current !== initialSnapshot.value
})

// Unsaved changes navigation guard
const showUnsavedModal = ref(false)
const pendingRoute = ref('')

function handleCancel() {
  if (isDirty.value) {
    pendingRoute.value = '/backoffice/tenants'
    showUnsavedModal.value = true
  } else {
    router.push('/backoffice/tenants')
  }
}

function forceNavigate() {
  showUnsavedModal.value = false
  router.push(pendingRoute.value || '/backoffice/tenants')
}

// Mark form as clean after successful save
watch(() => props.saving, (saving, wasSaving) => {
  if (wasSaving && !saving) {
    // After save completes, update snapshot
    nextTick(() => {
      initialSnapshot.value = JSON.stringify({ form: { ...form }, config: JSON.parse(JSON.stringify(config)) })
    })
  }
})

function handleSubmit() {
  if (!validateAll()) {
    showErrorNotification('Erro', 'Corrija os campos destacados antes de salvar')
    return
  }

  let finalConfig = JSON.parse(JSON.stringify(config))

  // Sync slug in config with form slug
  finalConfig.slug = form.slug

  // Sync meta pixel config
  const meta: Record<string, string> = {}
  if (metaConfig.pixelId) meta.pixelId = metaConfig.pixelId
  if (metaConfig.accessToken) meta.accessToken = metaConfig.accessToken
  if (Object.keys(meta).length > 0) {
    finalConfig.meta = meta
  } else {
    delete finalConfig.meta
  }

  // Merge JSON override if valid
  if (jsonOverride.value.trim()) {
    try {
      const override = JSON.parse(jsonOverride.value)
      finalConfig = deepMerge(finalConfig, override)
    } catch {
      showErrorNotification('Erro', 'JSON avancado invalido')
      return
    }
  }

  emit('save', {
    slug: form.slug,
    name: form.name,
    domain: form.domain || undefined,
    is_active: form.is_active,
    config: finalConfig,
  })
}

function deepMerge(target: any, source: any): any {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}
</script>

<style scoped>
.form-input {
  width: 100%;
  border-radius: var(--brand-radius-sm, 0.5rem);
  border: 1px solid var(--brand-input-border, #27272a);
  background-color: var(--brand-input-bg, #18181b);
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: var(--brand-text, #e4e4e7);
  outline: none;
  transition: border-color 0.15s ease;
}
.form-input::placeholder {
  color: var(--brand-text-muted, #71717a);
}
.form-input:focus {
  border-color: var(--brand-primary, #52525b);
}
</style>
