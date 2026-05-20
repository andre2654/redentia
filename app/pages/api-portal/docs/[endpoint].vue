<template>
  <NuxtLayout name="api-portal">
    <MoleculesDocsShell :toc="toc">
      <article v-if="endpoint" class="max-w-[1100px]">
        <!-- Breadcrumb -->
        <div class="mb-4 flex items-center gap-2 font-mono-tab text-[10px] uppercase tracking-[0.15em]">
          <NuxtLink to="/api-portal/docs" class="transition-colors hover:opacity-70" :style="{ color: 'var(--brand-text-muted)' }">
            Docs
          </NuxtLink>
          <span :style="{ color: 'var(--brand-border)' }">/</span>
          <span :style="{ color: 'var(--brand-primary)' }">{{ categoryLabel }}</span>
        </div>

        <!-- Title -->
        <h1
          class="font-display mb-4 text-4xl leading-[1.1] tracking-tight md:text-5xl"
          :style="{ color: 'var(--brand-text)' }"
        >
          {{ endpoint.title }}
        </h1>

        <!-- Action buttons -->
        <div class="mb-6 flex items-center gap-2">
          <button
            class="inline-flex items-center gap-2 rounded border px-3 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-colors hover:opacity-80"
            :style="{ borderColor: 'var(--brand-border)', color: 'var(--brand-text-muted)', backgroundColor: `${'var(--brand-surface)'}60` }"
          >
            <UIcon name="i-lucide-copy" class="size-3" />
            Copiar Markdown
          </button>
          <button
            class="inline-flex items-center gap-2 rounded border px-3 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-colors hover:opacity-80"
            :style="{ borderColor: 'var(--brand-border)', color: 'var(--brand-text-muted)', backgroundColor: `${'var(--brand-surface)'}60` }"
          >
            <UIcon name="i-lucide-external-link" class="size-3" />
            Abrir
            <UIcon name="i-lucide-chevron-down" class="size-3" />
          </button>
        </div>

        <!-- Description -->
        <p class="mb-4 text-base leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
          {{ endpoint.description }}
        </p>
        <p v-if="endpoint.longDescription" class="mb-8 text-[15px] leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
          {{ endpoint.longDescription }}
        </p>

        <!-- ============ PLAYGROUND ============ -->
        <div class="mb-10 grid gap-6 lg:grid-cols-2">
          <!-- LEFT: Request builder -->
          <div
            id="playground"
            data-toc-heading
            class="overflow-hidden rounded-lg border"
            :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 90%, transparent)' }"
          >
            <!-- Server URL -->
            <div
              class="flex items-center gap-3 border-b px-4 py-3"
              :style="{ borderColor: 'var(--brand-border)' }"
            >
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: 'var(--brand-primary)' }">
                Server URL
              </span>
              <span class="flex-1 truncate font-mono-tab text-[12px]" :style="{ color: 'var(--brand-text)' }">
                https://api.redentia.com.br
              </span>
              <button class="rounded p-1 transition-colors hover:opacity-70" :style="{ color: 'var(--brand-text-muted)' }">
                <UIcon name="i-lucide-pen-square" class="size-3.5" />
              </button>
            </div>

            <!-- Method + path + send -->
            <div
              class="flex items-center gap-2 border-b px-4 py-4"
              :style="{ borderColor: 'var(--brand-border)' }"
            >
              <span
                class="rounded px-2 py-1 font-mono-tab text-[11px] font-bold uppercase tracking-[0.1em]"
                :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-positive) 13%, transparent)', color: 'var(--brand-positive)' }"
              >
                {{ endpoint.method }}
              </span>
              <code
                class="flex-1 truncate font-mono-tab text-[12px]"
                :style="{ color: 'var(--brand-text)' }"
                v-html="highlightedPath"
              />
              <button
                class="inline-flex items-center gap-1.5 rounded border-2 px-3 py-1.5 font-mono-tab text-[10px] font-bold uppercase tracking-[0.15em] transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-0.5"
                :style="{
                  backgroundColor: 'var(--brand-primary)',
                  color: 'var(--brand-background)',
                  borderColor: 'var(--brand-primary)',
                }"
                @click="mockSend"
                :disabled="sending"
              >
                <UIcon v-if="sending" name="i-lucide-loader-2" class="size-3 motion-safe:animate-spin" />
                <UIcon v-else name="i-lucide-send" class="size-3" />
                {{ sending ? 'Sending...' : 'Send' }}
              </button>
            </div>

            <!-- Authorization accordion -->
            <details class="group border-b" :style="{ borderColor: 'var(--brand-border)' }">
              <summary
                class="flex cursor-pointer items-center justify-between px-4 py-3 text-[13px] font-semibold transition-colors hover:opacity-80"
                :style="{ color: 'var(--brand-text)' }"
              >
                <div class="flex items-center gap-2">
                  Authorization
                  <span
                    v-if="endpoint.authorization === 'required'"
                    class="rounded px-1.5 py-0 font-mono-tab text-[9px] uppercase"
                    :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 13%, transparent)', color: 'var(--brand-primary)' }"
                  >
                    Required
                  </span>
                </div>
                <UIcon name="i-lucide-chevron-down" class="size-3.5 transition-transform group-open:rotate-180" :style="{ color: 'var(--brand-text-muted)' }" />
              </summary>
              <div class="border-t px-4 py-3" :style="{ borderColor: 'var(--brand-border)' }">
                <div class="font-mono-tab text-[11px]" :style="{ color: 'var(--brand-text)' }">
                  <span :style="{ color: 'var(--brand-primary)' }">Authorization</span>
                  <span :style="{ color: 'var(--brand-text-muted)' }">  Bearer &lt;token&gt;</span>
                </div>
                <p class="mt-1.5 text-[12px]" :style="{ color: 'var(--brand-text-muted)' }">
                  Token de API obtido no dashboard em
                  <NuxtLink to="/api-portal/dashboard" class="underline" :style="{ color: 'var(--brand-primary)' }">api.redentia.com.br/dashboard</NuxtLink>.
                </p>
                <div class="mt-2 text-[11px]" :style="{ color: 'var(--brand-text-muted)' }">
                  In: <code class="rounded border px-1.5 py-0.5" :style="{ borderColor: 'var(--brand-border)', color: 'var(--brand-text)' }">header</code>
                </div>
              </div>
            </details>

            <!-- Path Parameters -->
            <details
              v-if="endpoint.pathParams && endpoint.pathParams.length > 0"
              class="group border-b"
              open
              :style="{ borderColor: 'var(--brand-border)' }"
            >
              <summary
                class="flex cursor-pointer items-center justify-between px-4 py-3 text-[13px] font-semibold transition-colors hover:opacity-80"
                :style="{ color: 'var(--brand-text)' }"
              >
                Path Parameters
                <UIcon name="i-lucide-chevron-down" class="size-3.5 transition-transform group-open:rotate-180" :style="{ color: 'var(--brand-text-muted)' }" />
              </summary>
              <div class="border-t px-4 py-4" :style="{ borderColor: 'var(--brand-border)' }">
                <div
                  v-for="param in endpoint.pathParams"
                  :key="param.name"
                  class="mb-4 last:mb-0"
                >
                  <div class="flex items-baseline gap-2">
                    <code class="font-mono-tab text-[12px] font-bold" :style="{ color: 'var(--brand-primary)' }">
                      {{ param.name }}<span v-if="param.required">*</span>
                    </code>
                    <span class="font-mono-tab text-[11px]" :style="{ color: 'var(--brand-text-muted)' }">
                      {{ param.type }}
                    </span>
                  </div>
                  <p class="mt-1 text-[12px]" :style="{ color: 'var(--brand-text-muted)' }">
                    {{ param.description }}
                  </p>
                  <input
                    type="text"
                    :placeholder="param.example || `${param.name}...`"
                    class="mt-2 w-full rounded border px-3 py-1.5 font-mono-tab text-[11px] outline-none transition-colors focus:border-2"
                    :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-background)', color: 'var(--brand-text)' }"
                  />
                </div>
              </div>
            </details>

            <!-- Query Parameters -->
            <details
              v-if="endpoint.queryParams && endpoint.queryParams.length > 0"
              class="group"
              :style="{ borderColor: 'var(--brand-border)' }"
            >
              <summary
                class="flex cursor-pointer items-center justify-between px-4 py-3 text-[13px] font-semibold transition-colors hover:opacity-80"
                :style="{ color: 'var(--brand-text)' }"
              >
                Query Parameters
                <UIcon name="i-lucide-chevron-down" class="size-3.5 transition-transform group-open:rotate-180" :style="{ color: 'var(--brand-text-muted)' }" />
              </summary>
              <div class="border-t px-4 py-4" :style="{ borderColor: 'var(--brand-border)' }">
                <div
                  v-for="param in endpoint.queryParams"
                  :key="param.name"
                  class="mb-4 last:mb-0"
                >
                  <div class="flex flex-wrap items-baseline gap-2">
                    <code class="font-mono-tab text-[12px] font-bold" :style="{ color: 'var(--brand-primary)' }">
                      {{ param.name }}<span v-if="param.required">*</span>
                    </code>
                    <span class="font-mono-tab text-[11px]" :style="{ color: 'var(--brand-text-muted)' }">
                      {{ param.type }}
                    </span>
                    <span v-if="param.default" class="rounded border px-1.5 py-0 font-mono-tab text-[10px]" :style="{ borderColor: 'var(--brand-border)', color: 'var(--brand-text-muted)' }">
                      default: {{ param.default }}
                    </span>
                  </div>
                  <p class="mt-1 text-[12px]" :style="{ color: 'var(--brand-text-muted)' }">
                    {{ param.description }}
                  </p>
                  <div v-if="param.enum" class="mt-1.5 flex flex-wrap gap-1">
                    <span
                      v-for="v in param.enum"
                      :key="v"
                      class="rounded border px-1.5 py-0 font-mono-tab text-[10px]"
                      :style="{ borderColor: 'var(--brand-border)', color: 'var(--brand-text)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 50%, transparent)' }"
                    >
                      {{ v }}
                    </span>
                  </div>
                </div>
              </div>
            </details>
          </div>

          <!-- RIGHT: code samples + response -->
          <div class="flex flex-col gap-4">
            <!-- Code samples: tabbed by language -->
            <div
              class="overflow-hidden rounded-lg border"
              :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 90%, transparent)' }"
            >
              <div class="flex overflow-x-auto border-b" :style="{ borderColor: 'var(--brand-border)' }">
                <button
                  v-for="(sample, idx) in endpoint.codeSamples"
                  :key="sample.lang"
                  @click="activeLang = idx"
                  class="shrink-0 border-r px-4 py-2.5 font-mono-tab text-[11px] uppercase tracking-[0.12em] transition-colors"
                  :style="{
                    borderColor: 'var(--brand-border)',
                    color: activeLang === idx ? 'var(--brand-primary)' : 'var(--brand-text-muted)',
                    backgroundColor: activeLang === idx ? `color-mix(in srgb, var(--brand-primary) 6%, transparent)` : 'transparent',
                    borderBottom: activeLang === idx ? `2px solid var(--brand-primary)` : '2px solid transparent',
                  }"
                >
                  {{ sample.label }}
                </button>
              </div>
              <div class="relative">
                <button
                  class="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded border px-2 py-1 font-mono-tab text-[10px] transition-colors hover:opacity-80"
                  :style="{ borderColor: 'var(--brand-border)', color: 'var(--brand-text-muted)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 80%, transparent)' }"
                  @click="copyCode"
                >
                  <UIcon :name="codeCopied ? 'i-lucide-check' : 'i-lucide-copy'" class="size-3" />
                  {{ codeCopied ? 'Copiado' : 'Copiar' }}
                </button>
                <pre class="overflow-x-auto px-5 py-5 pr-24 font-mono-tab text-[11px] leading-relaxed" :style="{ color: 'var(--brand-text)' }"><code v-html="highlightedSample"></code></pre>
              </div>
            </div>

            <!-- Response viewer -->
            <div
              class="overflow-hidden rounded-lg border"
              :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 90%, transparent)' }"
            >
              <div class="flex overflow-x-auto border-b" :style="{ borderColor: 'var(--brand-border)' }">
                <button
                  v-for="(r, idx) in endpoint.responses"
                  :key="r.status"
                  @click="activeResponseIdx = idx"
                  class="shrink-0 border-r px-4 py-2.5 font-mono-tab text-[12px] font-bold uppercase tracking-[0.1em] transition-colors"
                  :style="{
                    borderColor: 'var(--brand-border)',
                    color: activeResponseIdx === idx ? statusColor(r.status) : 'var(--brand-text-muted)',
                    backgroundColor: activeResponseIdx === idx ? `${statusColor(r.status)}10` : 'transparent',
                    borderBottom: activeResponseIdx === idx ? `2px solid ${statusColor(r.status)}` : '2px solid transparent',
                  }"
                >
                  {{ r.status }}
                </button>
              </div>
              <pre class="max-h-[500px] overflow-auto px-5 py-5 font-mono-tab text-[11px] leading-relaxed" :style="{ color: 'var(--brand-text)' }"><code v-html="highlightedResponse"></code></pre>
            </div>
          </div>
        </div>

        <!-- ============ PARAMETER TABLES (below playground) ============ -->
        <section
          v-if="endpoint.pathParams && endpoint.pathParams.length > 0"
          id="path-parameters"
          data-toc-heading
          class="mb-10"
        >
          <h2 class="font-display mb-4 text-2xl font-light tracking-tight" :style="{ color: 'var(--brand-text)', letterSpacing: '-0.5px' }">
            Path Parameters
          </h2>
          <div class="flex flex-col gap-4">
            <div
              v-for="param in endpoint.pathParams"
              :key="param.name"
              class="rounded-lg border p-4"
              :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 25%, transparent)' }"
            >
              <div class="flex items-baseline gap-3">
                <code class="font-mono-tab text-[13px] font-bold" :style="{ color: 'var(--brand-primary)' }">
                  {{ param.name }}<span v-if="param.required" :style="{ color: 'var(--brand-negative)' }">*</span>
                </code>
                <span class="font-mono-tab text-[11px]" :style="{ color: 'var(--brand-text-muted)' }">{{ param.type }}</span>
                <span v-if="param.required" class="rounded bg-red-500/10 px-1.5 py-0 font-mono-tab text-[10px]" :style="{ color: 'var(--brand-negative)' }">required</span>
              </div>
              <p class="mt-2 text-[13px]" :style="{ color: 'var(--brand-text-muted)' }">{{ param.description }}</p>
            </div>
          </div>
        </section>

        <section
          v-if="endpoint.queryParams && endpoint.queryParams.length > 0"
          id="query-parameters"
          data-toc-heading
          class="mb-10"
        >
          <h2 class="font-display mb-4 text-2xl font-light tracking-tight" :style="{ color: 'var(--brand-text)', letterSpacing: '-0.5px' }">
            Query Parameters
          </h2>
          <div class="flex flex-col gap-4">
            <div
              v-for="param in endpoint.queryParams"
              :key="param.name"
              class="rounded-lg border p-4"
              :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 25%, transparent)' }"
            >
              <div class="flex flex-wrap items-baseline gap-3">
                <code class="font-mono-tab text-[13px] font-bold" :style="{ color: 'var(--brand-primary)' }">
                  {{ param.name }}<span v-if="param.required" :style="{ color: 'var(--brand-negative)' }">*</span>
                </code>
                <span class="font-mono-tab text-[11px]" :style="{ color: 'var(--brand-text-muted)' }">{{ param.type }}</span>
                <span v-if="param.default" class="rounded border px-1.5 py-0 font-mono-tab text-[10px]" :style="{ borderColor: 'var(--brand-border)', color: 'var(--brand-text-muted)' }">
                  default: {{ param.default }}
                </span>
              </div>
              <p class="mt-2 text-[13px]" :style="{ color: 'var(--brand-text-muted)' }">{{ param.description }}</p>
              <div v-if="param.enum" class="mt-2 flex flex-wrap gap-1">
                <span
                  v-for="v in param.enum"
                  :key="v"
                  class="rounded border px-2 py-0.5 font-mono-tab text-[10px]"
                  :style="{ borderColor: 'var(--brand-border)', color: 'var(--brand-text)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 50%, transparent)' }"
                >
                  {{ v }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- ============ RESPONSES SECTION ============ -->
        <section id="responses" data-toc-heading class="mb-10">
          <h2 class="font-display mb-4 text-2xl font-light tracking-tight" :style="{ color: 'var(--brand-text)', letterSpacing: '-0.5px' }">
            Responses
          </h2>
          <div class="flex flex-col gap-3">
            <div
              v-for="r in endpoint.responses"
              :key="r.status"
              class="flex items-center gap-4 rounded-lg border p-4"
              :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 25%, transparent)' }"
            >
              <span
                class="rounded px-3 py-1 font-mono-tab text-[13px] font-bold"
                :style="{ backgroundColor: `${statusColor(r.status)}15`, color: statusColor(r.status) }"
              >
                {{ r.status }}
              </span>
              <span class="flex-1 text-[14px]" :style="{ color: 'var(--brand-text)' }">
                {{ r.description }}
              </span>
            </div>
          </div>
        </section>

        <!-- Footer nav -->
        <div
          class="mt-16 flex items-center justify-between border-t pt-8"
          :style="{ borderColor: 'var(--brand-border)' }"
        >
          <NuxtLink
            v-if="prevEndpoint"
            :to="`/api-portal/docs/${prevEndpoint.slug}`"
            class="group inline-flex flex-col items-start gap-1 rounded border px-4 py-3 transition-colors"
            :style="{ borderColor: 'var(--brand-border)', backgroundColor: `${'var(--brand-surface)'}60` }"
          >
            <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: 'var(--brand-text-muted)' }">
              ← Anterior
            </span>
            <span class="font-bold" :style="{ color: 'var(--brand-text)' }">
              {{ prevEndpoint.title }}
            </span>
          </NuxtLink>
          <div v-else />
          <NuxtLink
            v-if="nextEndpoint"
            :to="`/api-portal/docs/${nextEndpoint.slug}`"
            class="group inline-flex flex-col items-end gap-1 rounded border px-4 py-3 transition-colors"
            :style="{ borderColor: 'var(--brand-border)', backgroundColor: `${'var(--brand-surface)'}60` }"
          >
            <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: 'var(--brand-text-muted)' }">
              Próximo →
            </span>
            <span class="font-bold" :style="{ color: 'var(--brand-text)' }">
              {{ nextEndpoint.title }}
            </span>
          </NuxtLink>
        </div>
      </article>

      <!-- 404 fallback -->
      <div v-else class="max-w-xl">
        <h1 class="font-display text-4xl" :style="{ color: 'var(--brand-text)' }">
          Endpoint não encontrado.
        </h1>
        <p class="mt-4 text-[14px]" :style="{ color: 'var(--brand-text-muted)' }">
          O slug <code class="rounded border px-1.5 py-0.5" :style="{ borderColor: 'var(--brand-border)', color: 'var(--brand-primary)' }">{{ route.params.endpoint }}</code> não existe na documentação.
        </p>
        <NuxtLink
          to="/api-portal/docs"
          class="mt-6 inline-flex items-center gap-2 font-mono-tab text-[11px] uppercase tracking-[0.15em]"
          :style="{ color: 'var(--brand-primary)' }"
        >
          ← Voltar pros docs
        </NuxtLink>
      </div>
    </MoleculesDocsShell>
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute()
const brand = useBrand()
const { endpoints, categories, findEndpoint } = useApiDocs()

const slug = computed(() => String(route.params.endpoint || ''))
const endpoint = computed(() => findEndpoint(slug.value))

const categoryLabel = computed(() => {
  if (!endpoint.value) return ''
  return categories.find((c) => c.id === endpoint.value!.category)?.label || ''
})

const currentIdx = computed(() => endpoints.findIndex((e) => e.slug === slug.value))
const prevEndpoint = computed(() => currentIdx.value > 0 ? endpoints[currentIdx.value - 1] : null)
const nextEndpoint = computed(() => currentIdx.value >= 0 && currentIdx.value < endpoints.length - 1 ? endpoints[currentIdx.value + 1] : null)

// Playground state
const activeLang = ref(0)
const activeResponseIdx = ref(0)
const sending = ref(false)
const codeCopied = ref(false)

watch(slug, () => {
  // Reset the playground tabs when navigating between endpoints.
  activeLang.value = 0
  activeResponseIdx.value = 0
})

function mockSend() {
  sending.value = true
  setTimeout(() => { sending.value = false }, 800)
}

async function copyCode() {
  const code = endpoint.value?.codeSamples[activeLang.value]?.code
  if (!code) return
  try {
    await navigator.clipboard.writeText(code)
    codeCopied.value = true
    setTimeout(() => { codeCopied.value = false }, 1500)
  } catch {}
}

// Status code → color helper
function statusColor(status: number): string {
  if (status >= 200 && status < 300) return 'var(--brand-positive)'
  if (status === 401 || status === 403) return 'var(--brand-primary)'
  return 'var(--brand-negative)'
}

// ----- Syntax highlighting helpers -----
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function highlightJson(json: string): string {
  let code = esc(json)
  // Strings
  code = code.replace(/("(?:[^"\\]|\\.)*")(\s*:)/g, `<span style="color:var(--brand-primary)">$1</span>$2`)
  code = code.replace(/:\s*("(?:[^"\\]|\\.)*")/g, `: <span style="color:var(--brand-positive)">$1</span>`)
  // Numbers
  code = code.replace(/(:\s*)(-?\d+(?:\.\d+)?)/g, `$1<span style="color:var(--brand-text)">$2</span>`)
  // Booleans + null
  code = code.replace(/(:\s*)(true|false|null)/g, `$1<span style="color:var(--brand-primary)">$2</span>`)
  return code
}

function highlightCode(code: string, lang: string): string {
  let out = esc(code)
  // Comments (# for bash, // for others)
  out = out.replace(/(^|\n)(\s*(?:#|\/\/)[^\n]*)/g, `$1<span style="color:var(--brand-text-muted)">$2</span>`)
  // Strings
  out = out.replace(/("(?:[^"\\]|\\.)*")/g, `<span style="color:var(--brand-positive)">$1</span>`)
  out = out.replace(/('(?:[^'\\]|\\.)*')/g, `<span style="color:var(--brand-positive)">$1</span>`)
  // Keywords (bash/curl)
  if (lang === 'curl') {
    out = out.replace(/\b(curl|GET|POST|PUT|DELETE)\b/g, `<span style="color:var(--brand-primary);font-weight:600">$1</span>`)
    out = out.replace(/(\s)(-X|--request|--url|--header|-H)/g, `$1<span style="color:var(--brand-primary)">$2</span>`)
  } else if (lang === 'python') {
    out = out.replace(/\b(import|from|def|return|print|if|else|for|in|class)\b/g, `<span style="color:var(--brand-primary);font-weight:600">$1</span>`)
  } else if (lang === 'javascript') {
    out = out.replace(/\b(const|let|var|async|await|function|return|import|from|export|if|else|console)\b/g, `<span style="color:var(--brand-primary);font-weight:600">$1</span>`)
  } else if (lang === 'go') {
    out = out.replace(/\b(package|import|func|return|defer|var|if|else|for|string|error)\b/g, `<span style="color:var(--brand-primary);font-weight:600">$1</span>`)
  } else if (lang === 'java') {
    out = out.replace(/\b(import|class|public|private|static|void|String|new|return|if|else)\b/g, `<span style="color:var(--brand-primary);font-weight:600">$1</span>`)
  } else if (lang === 'csharp') {
    out = out.replace(/\b(using|var|async|await|public|private|static|void|string|new|return|if|else)\b/g, `<span style="color:var(--brand-primary);font-weight:600">$1</span>`)
  }
  return out
}

const highlightedSample = computed(() => {
  const s = endpoint.value?.codeSamples[activeLang.value]
  if (!s) return ''
  return highlightCode(s.code, s.lang)
})

const highlightedResponse = computed(() => {
  const r = endpoint.value?.responses[activeResponseIdx.value]
  if (!r) return ''
  const body = r.bodyJson || r.errorJson || ''
  return highlightJson(body)
})

const highlightedPath = computed(() => {
  if (!endpoint.value) return ''
  const path = esc(endpoint.value.path)
  return path.replace(/\{([^}]+)\}/g, `<span style="color:var(--brand-primary);font-weight:600">{$1}</span>`)
})

const toc = computed(() => {
  const items: { id: string; text: string; level: number }[] = [
    { id: 'playground', text: 'Playground', level: 2 },
  ]
  if (endpoint.value?.pathParams && endpoint.value.pathParams.length > 0) {
    items.push({ id: 'path-parameters', text: 'Path Parameters', level: 2 })
  }
  if (endpoint.value?.queryParams && endpoint.value.queryParams.length > 0) {
    items.push({ id: 'query-parameters', text: 'Query Parameters', level: 2 })
  }
  items.push({ id: 'responses', text: 'Responses', level: 2 })
  return items
})

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title: computed(() => endpoint.value ? `${endpoint.value.title} · Redentia API` : 'Endpoint · Redentia API').value,
  description: computed(() => endpoint.value?.description || 'Documentação do endpoint da Redentia API.').value,
  path: `/api-portal/docs/${slug.value}`,
  robots: 'noindex',
})
</script>
