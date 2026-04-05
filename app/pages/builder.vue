<template>
  <div class="builder-page min-h-screen overflow-x-hidden bg-[#050505] text-white antialiased" :style="{ fontFamily: `'Inter', system-ui, sans-serif` }">
    <!-- Background orbs -->
    <div class="pointer-events-none fixed inset-0 overflow-hidden">
      <div class="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-20 blur-[120px]" :style="{ backgroundColor: primaryColor }" />
      <div class="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-500/15 blur-[120px]" />
    </div>

    <!-- Nav -->
    <nav class="relative z-20 flex items-center justify-between px-6 py-5 md:px-12">
      <NuxtLink to="/" class="flex items-center gap-2 text-white/60 transition hover:text-white">
        <UIcon name="i-lucide-arrow-left" class="size-4" />
        <span class="text-sm">Voltar</span>
      </NuxtLink>
      <span class="text-xs uppercase tracking-widest text-white/30">Builder</span>
    </nav>

    <!-- ============================== -->
    <!-- PHASE 1: INPUT                 -->
    <!-- ============================== -->
    <section v-if="phase === 'input'" class="relative z-10 flex min-h-[80vh] flex-col items-center justify-center px-6">
      <div class="w-full max-w-lg text-center">
        <div class="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/50">
          <UIcon name="i-lucide-wand-sparkles" class="size-3.5" />
          Crie em 30 segundos
        </div>

        <h1 class="mb-4 text-4xl font-extrabold leading-tight md:text-5xl">
          Crie sua plataforma de<br />
          <span :style="{ color: primaryColor }">investimentos</span>
        </h1>
        <p class="mb-10 text-base text-white/40">
          Digite o nome da sua marca, escolha uma cor e veja sua plataforma ganhar vida.
        </p>

        <!-- Brand name input -->
        <div class="mb-6">
          <input
            v-model="brandName"
            type="text"
            placeholder="Nome da sua marca"
            class="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-center text-lg font-medium text-white outline-none transition placeholder:text-white/25 focus:border-white/25 focus:bg-white/8"
            @keyup.enter="brandName.trim() && startBuild()"
          />
        </div>

        <!-- Color presets -->
        <div class="mb-8">
          <p class="mb-3 text-xs uppercase tracking-widest text-white/30">Cor primaria</p>
          <div class="flex flex-wrap items-center justify-center gap-3">
            <button
              v-for="c in colorPresets"
              :key="c.hex"
              class="group relative h-10 w-10 rounded-full border-2 transition-all hover:scale-110"
              :class="primaryColor === c.hex ? 'border-white scale-110' : 'border-transparent'"
              :style="{ backgroundColor: c.hex }"
              :title="c.label"
              @click="primaryColor = c.hex"
            >
              <UIcon v-if="primaryColor === c.hex" name="i-lucide-check" class="absolute inset-0 m-auto size-4 text-white drop-shadow-md" />
            </button>
            <label class="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-white/20 transition hover:border-white/40">
              <UIcon name="i-lucide-pipette" class="size-4 text-white/40" />
              <input type="color" v-model="primaryColor" class="absolute inset-0 cursor-pointer opacity-0" />
            </label>
          </div>
        </div>

        <!-- CTA -->
        <button
          :disabled="!brandName.trim()"
          class="group inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-white transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-30"
          :style="{ backgroundColor: primaryColor, boxShadow: `0 0 40px ${primaryColor}40` }"
          @click="startBuild"
        >
          <UIcon name="i-lucide-wand-sparkles" class="size-5" />
          Gerar plataforma
          <UIcon name="i-lucide-arrow-right" class="size-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </section>

    <!-- ============================== -->
    <!-- PHASE 2: ANALYSIS (terminal)   -->
    <!-- ============================== -->
    <section v-if="phase === 'analysis'" class="relative z-10 flex min-h-[80vh] flex-col items-center justify-center px-6">
      <div class="w-full max-w-2xl">
        <!-- Terminal window -->
        <div class="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0f]">
          <!-- Title bar -->
          <div class="flex items-center gap-2 border-b border-white/5 px-4 py-3">
            <span class="h-3 w-3 rounded-full bg-red-500/60" />
            <span class="h-3 w-3 rounded-full bg-yellow-500/60" />
            <span class="h-3 w-3 rounded-full bg-green-500/60" />
            <span class="ml-auto flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/30">
              <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              AI Engine
            </span>
          </div>
          <!-- Terminal body -->
          <div class="p-6 font-mono text-sm leading-relaxed">
            <div v-for="(line, i) in visibleTerminalLines" :key="i" class="mb-2 flex items-start gap-2">
              <span class="text-emerald-400/60">></span>
              <span class="terminal-typing" :style="{ color: line.color || 'rgba(255,255,255,0.7)' }">
                {{ line.text }}
                <span v-if="line.done" class="ml-1 text-emerald-400">✓</span>
              </span>
            </div>
            <!-- Blinking cursor -->
            <div v-if="terminalTyping" class="flex items-start gap-2">
              <span class="text-emerald-400/60">></span>
              <span class="animate-pulse text-white/40">_</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================== -->
    <!-- PHASE 3: BUILD                 -->
    <!-- ============================== -->
    <section v-if="phase === 'build'" class="relative z-10 px-6 py-8 md:px-12">
      <div class="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:gap-12">
        <!-- Left: Step timeline -->
        <div class="w-full shrink-0 md:w-64">
          <p class="mb-6 text-xs uppercase tracking-widest text-white/30">Construindo</p>
          <div class="flex flex-row gap-2 overflow-x-auto md:flex-col md:gap-0 md:overflow-visible">
            <div
              v-for="(step, i) in buildSteps"
              :key="i"
              class="flex shrink-0 items-center gap-3 md:border-l-2 md:py-4 md:pl-5"
              :class="[
                i < currentStep ? 'md:border-emerald-400/50' : i === currentStep ? 'md:border-white/80' : 'md:border-white/10',
              ]"
            >
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-500"
                :class="[
                  i < currentStep ? 'bg-emerald-400/15 text-emerald-400' : i === currentStep ? 'bg-white/15 text-white' : 'bg-white/5 text-white/20',
                ]"
              >
                <UIcon v-if="i < currentStep" name="i-lucide-check" class="size-4" />
                <UIcon v-else :name="step.icon" class="size-4" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium" :class="i <= currentStep ? 'text-white' : 'text-white/30'">
                  {{ step.label }}
                </p>
                <p v-if="i === currentStep" class="mt-0.5 text-[11px] text-white/40">
                  {{ step.hint }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Live preview -->
        <div class="flex-1">
          <div class="overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-all duration-700" :style="{ boxShadow: `0 0 80px ${primaryColor}10` }">
            <!-- Browser chrome -->
            <div class="flex items-center gap-2 border-b border-white/5 bg-white/3 px-4 py-2.5">
              <span class="h-2.5 w-2.5 rounded-full bg-red-500/50" />
              <span class="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
              <span class="h-2.5 w-2.5 rounded-full bg-green-500/50" />
              <div class="mx-4 flex-1 rounded-md bg-white/5 px-3 py-1 text-center text-[11px] text-white/25 font-mono">
                {{ previewDomain }}
              </div>
            </div>

            <!-- Preview content -->
            <div
              class="relative min-h-[400px] p-6 transition-all duration-700 md:min-h-[500px] md:p-10"
              :style="{
                backgroundColor: currentStep >= 1 ? brand.colors.background : '#111',
                color: currentStep >= 1 ? brand.colors.text : '#555',
              }"
            >
              <!-- Nav mockup -->
              <div class="mb-8 flex items-center justify-between transition-all duration-500">
                <div class="flex items-center gap-2">
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white transition-all duration-500"
                    :style="{ backgroundColor: currentStep >= 1 ? brand.colors.primary : '#333' }"
                  >
                    {{ (currentStep >= 3 && brandName) ? brandName.charAt(0).toUpperCase() : '?' }}
                  </div>
                  <span
                    class="text-sm font-semibold transition-all duration-500"
                    :class="currentStep >= 2 ? 'builder-text-visible' : 'opacity-30'"
                    :style="{
                      fontFamily: currentStep >= 2 ? `'${brand.font.family}', sans-serif` : 'inherit',
                      color: currentStep >= 3 ? brand.colors.text : '#555',
                    }"
                  >
                    {{ currentStep >= 3 ? brandName : 'Sua Marca' }}
                  </span>
                </div>
                <div
                  class="rounded-lg px-4 py-1.5 text-xs font-medium text-white transition-all duration-500"
                  :style="{ backgroundColor: currentStep >= 1 ? brand.colors.primary : '#333' }"
                >
                  Comecar
                </div>
              </div>

              <!-- Hero mockup -->
              <div class="mb-8">
                <div
                  class="mb-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] uppercase tracking-widest transition-all duration-500"
                  :style="{
                    borderColor: currentStep >= 1 ? `${brand.colors.primary}33` : '#333',
                    color: currentStep >= 1 ? brand.colors.primary : '#555',
                  }"
                >
                  <span class="h-1.5 w-1.5 rounded-full" :class="currentStep >= 4 ? 'animate-pulse' : ''" :style="{ backgroundColor: currentStep >= 1 ? brand.colors.primary : '#555' }" />
                  {{ currentStep >= 4 ? 'Ao Vivo' : 'Status' }}
                </div>

                <h2
                  class="mb-2 text-2xl font-extrabold leading-tight transition-all duration-700 md:text-4xl"
                  :style="{
                    fontFamily: currentStep >= 2 ? `'${brand.font.family}', sans-serif` : 'inherit',
                    color: currentStep >= 3 ? brand.colors.text : '#444',
                  }"
                >
                  {{ currentStep >= 3 ? `Investir com ${brandName}.` : 'Sua tagline aqui.' }}
                </h2>
                <p
                  class="text-sm transition-all duration-500"
                  :style="{ color: currentStep >= 1 ? brand.colors.textMuted || '#666' : '#333' }"
                >
                  {{ currentStep >= 3 ? `A plataforma de investimentos do ${brandName}. Analise ativos, acompanhe dividendos e invista com inteligencia.` : 'Descricao da sua plataforma de investimentos personalizada.' }}
                </p>
              </div>

              <!-- Ticker cards mockup -->
              <div class="mb-6 grid grid-cols-3 gap-3">
                <div
                  v-for="(ticker, i) in mockTickers"
                  :key="ticker.symbol"
                  class="rounded-xl border p-3 transition-all duration-500"
                  :style="{
                    borderColor: currentStep >= 1 ? brand.colors.border || '#1f1f1f' : '#222',
                    backgroundColor: currentStep >= 1 ? brand.colors.surface || '#0a0a0a' : '#151515',
                    transitionDelay: `${i * 150}ms`,
                  }"
                >
                  <div class="flex items-center gap-2">
                    <div class="h-6 w-6 rounded-md" :style="{ backgroundColor: currentStep >= 1 ? brand.colors.primary + '30' : '#333' }" />
                    <div>
                      <p class="text-xs font-semibold" :class="currentStep >= 4 ? '' : 'opacity-30'">
                        {{ currentStep >= 4 ? ticker.symbol : '----' }}
                      </p>
                    </div>
                  </div>
                  <div class="mt-2 flex items-baseline justify-between">
                    <span class="text-sm font-semibold tabular-nums" :class="currentStep >= 4 ? '' : 'opacity-20'">
                      {{ currentStep >= 4 ? ticker.price : 'R$ --' }}
                    </span>
                    <span
                      class="text-xs font-medium tabular-nums"
                      :style="{
                        color: currentStep >= 4
                          ? (ticker.positive ? (brand.colors.positive || '#4ade80') : (brand.colors.negative || '#ef4444'))
                          : '#444',
                      }"
                    >
                      {{ currentStep >= 4 ? ticker.change : '--' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- AI Chat bubble -->
              <Transition name="slide-up">
                <div
                  v-if="currentStep >= 5"
                  class="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl border px-4 py-2.5 shadow-xl md:bottom-6 md:right-6"
                  :style="{
                    backgroundColor: brand.colors.surface || '#0a0a0a',
                    borderColor: brand.colors.border || '#1f1f1f',
                  }"
                >
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg" :style="{ backgroundColor: brand.colors.primary }">
                    <UIcon name="i-lucide-bot" class="size-4 text-white" />
                  </div>
                  <div>
                    <p class="text-xs font-medium" :style="{ color: brand.colors.text }">Assessor IA</p>
                    <p class="text-[10px]" :style="{ color: brand.colors.textMuted }">Como posso ajudar?</p>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================== -->
    <!-- PHASE 4: REVEAL                -->
    <!-- ============================== -->
    <section v-if="phase === 'reveal'" class="relative z-10 flex min-h-[80vh] flex-col items-center justify-center px-6 py-12">
      <div class="w-full max-w-4xl text-center">
        <!-- Success badge -->
        <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-1.5 text-xs text-emerald-400">
          <UIcon name="i-lucide-check-circle" class="size-3.5" />
          Plataforma gerada com sucesso
        </div>

        <h2 class="mb-2 text-3xl font-extrabold md:text-5xl">
          <span :style="{ color: primaryColor }">{{ brandName }}</span> esta pronta.
        </h2>
        <p class="mb-10 text-base text-white/40">
          Sua plataforma de investimentos white-label foi criada. Personalize, publique e comece a monetizar.
        </p>

        <!-- Mini preview -->
        <div class="mx-auto mb-10 max-w-3xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl" :style="{ boxShadow: `0 0 80px ${primaryColor}15` }">
          <div class="flex items-center gap-2 border-b border-white/5 bg-white/3 px-4 py-2.5">
            <span class="h-2.5 w-2.5 rounded-full bg-red-500/50" />
            <span class="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
            <span class="h-2.5 w-2.5 rounded-full bg-green-500/50" />
            <div class="mx-4 flex-1 rounded-md bg-white/5 px-3 py-1 text-center text-[11px] text-white/25 font-mono">
              {{ previewDomain }}
            </div>
          </div>
          <div
            class="p-8 text-left md:p-12"
            :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
          >
            <div class="mb-4 flex items-center gap-2">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-white" :style="{ backgroundColor: brand.colors.primary }">
                {{ brandName.charAt(0).toUpperCase() }}
              </div>
              <span class="text-lg font-semibold" :style="{ fontFamily: `'${brand.font.family}', sans-serif` }">{{ brandName }}</span>
            </div>
            <h3 class="mb-2 text-2xl font-extrabold md:text-3xl" :style="{ fontFamily: `'${brand.font.family}', sans-serif` }">
              Investir com {{ brandName }}.
            </h3>
            <p class="mb-6 text-sm" :style="{ color: brand.colors.textMuted }">
              A plataforma de investimentos do {{ brandName }}. Analise ativos, acompanhe dividendos e invista com inteligencia.
            </p>
            <div class="flex gap-3">
              <span class="rounded-lg px-5 py-2 text-sm font-medium text-white" :style="{ backgroundColor: brand.colors.primary }">
                Criar conta
              </span>
              <span class="rounded-lg border px-5 py-2 text-sm" :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted }">
                Saiba mais
              </span>
            </div>
          </div>
        </div>

        <!-- CTAs -->
        <div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            class="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-white transition hover:scale-105 hover:shadow-xl"
            :style="{ backgroundColor: primaryColor, boxShadow: `0 0 40px ${primaryColor}40` }"
            @click="showContactModal = true"
          >
            <UIcon name="i-lucide-rocket" class="size-5" />
            Quero essa plataforma
          </button>
          <NuxtLink
            to="/whitelabel"
            class="inline-flex items-center gap-2 rounded-xl border border-white/10 px-8 py-4 text-base font-medium text-white/60 transition hover:border-white/20 hover:text-white"
          >
            Saiba mais
            <UIcon name="i-lucide-arrow-right" class="size-4" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============================== -->
    <!-- CONTACT MODAL                  -->
    <!-- ============================== -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showContactModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" @click.self="showContactModal = false">
          <div class="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a0f] p-8">
            <div class="mb-6 flex items-center justify-between">
              <h3 class="text-lg font-bold">Quero minha plataforma</h3>
              <button class="text-white/30 transition hover:text-white" @click="showContactModal = false">
                <UIcon name="i-lucide-x" class="size-5" />
              </button>
            </div>
            <div class="flex flex-col gap-4">
              <input v-model="contactForm.name" type="text" placeholder="Seu nome" class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/25" />
              <input v-model="contactForm.email" type="email" placeholder="Seu melhor email" class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/25" />
              <input v-model="contactForm.youtube" type="text" placeholder="Canal do YouTube (opcional)" class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/25" />
              <input v-model="contactForm.whatsapp" type="text" placeholder="WhatsApp (opcional)" class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/25" />
              <button
                class="mt-2 w-full rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
                :style="{ backgroundColor: primaryColor }"
                @click="submitContact"
              >
                Enviar
              </button>
            </div>
            <p class="mt-4 text-center text-[11px] text-white/25">
              Responderemos em ate 24h com uma demo personalizada.
            </p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { brand as defaultBrand } from '~/config/brand'

definePageMeta({
  layout: false,
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

useHead({
  title: 'Builder — Crie sua plataforma de investimentos',
  meta: [
    { name: 'robots', content: 'noindex,nofollow' },
  ],
  link: [
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300..800&family=Montserrat:wght@300..800&family=Poppins:wght@300..800&family=Barlow:wght@300..800&family=Raleway:wght@300..800&display=swap' },
  ],
})

const brand = useBrand()

// ---- State ----
const phase = ref<'input' | 'analysis' | 'build' | 'reveal'>('input')
const currentStep = ref(0)
const brandName = ref('')
const primaryColor = ref('#FF5900')
const terminalTyping = ref(false)
const visibleTerminalLines = ref<Array<{ text: string; color?: string; done?: boolean }>>([])
const showContactModal = ref(false)

const contactForm = reactive({
  name: '',
  email: '',
  youtube: '',
  whatsapp: '',
})

// ---- Brand snapshot/restore ----
const originalBrand = ref<Record<string, any>>({})

onMounted(() => {
  originalBrand.value = JSON.parse(JSON.stringify(brand))
})

onUnmounted(() => {
  if (originalBrand.value && Object.keys(originalBrand.value).length) {
    Object.assign(brand, originalBrand.value)
  }
})

// ---- Color presets ----
const colorPresets = [
  { hex: '#FF5900', label: 'Laranja' },
  { hex: '#FACC15', label: 'Amarelo' },
  { hex: '#DC2626', label: 'Vermelho' },
  { hex: '#4ADE80', label: 'Verde' },
  { hex: '#3B82F6', label: 'Azul' },
  { hex: '#8B5CF6', label: 'Roxo' },
  { hex: '#EC4899', label: 'Rosa' },
  { hex: '#14B8A6', label: 'Teal' },
]

// ---- Mock data ----
const mockTickers = [
  { symbol: 'PETR4', price: 'R$ 38,72', change: '+2.34%', positive: true },
  { symbol: 'VALE3', price: 'R$ 62,15', change: '-0.87%', positive: false },
  { symbol: 'ITUB4', price: 'R$ 33,90', change: '+1.12%', positive: true },
]

// ---- Build steps ----
const buildSteps = [
  { label: 'Cores', icon: 'i-lucide-palette', hint: 'Gerando paleta de cores...', duration: 3000 },
  { label: 'Tipografia', icon: 'i-lucide-type', hint: 'Selecionando fonte ideal...', duration: 3000 },
  { label: 'Identidade', icon: 'i-lucide-fingerprint', hint: 'Configurando marca...', duration: 3500 },
  { label: 'Dados de mercado', icon: 'i-lucide-trending-up', hint: 'Populando dados ao vivo...', duration: 3500 },
  { label: 'Features', icon: 'i-lucide-puzzle', hint: 'Ativando ferramentas...', duration: 3000 },
]

// ---- Computed ----
const previewDomain = computed(() => {
  const slug = brandName.value
    ? brandName.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    : 'sua-marca'
  return `invest.${slug}.com.br`
})

// ---- Helpers ----
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function darkenHex(hex: string, factor: number): string {
  const [h, s, l] = hexToHsl(hex)
  return hslToHex(h, s, Math.max(0, Math.round(l * (1 - factor))))
}

function derivePalette(primary: string) {
  return {
    primary,
    secondary: darkenHex(primary, 0.15),
    tertiary: '#0A0A0A',
    positive: '#4ADE80',
    negative: '#EF4444',
    neutral: '#6B7280',
    background: '#000000',
    surface: '#0A0A0A',
    surfaceHover: '#131313',
    border: '#1F1F1F',
    text: '#FFFFFF',
    textMuted: '#9CA3AF',
    inputBg: '#05070b',
    inputBgHover: '#070b12',
    inputBorder: '#1f2937',
    gradient: {
      from: primary,
      via: darkenHex(primary, 0.15),
      to: darkenHex(primary, 0.3),
    },
  }
}

const fontOptions = [
  { family: 'Montserrat', google: 'Montserrat:wght@300..800' },
  { family: 'Poppins', google: 'Poppins:wght@300..800' },
  { family: 'Barlow', google: 'Barlow:wght@300..800' },
  { family: 'Raleway', google: 'Raleway:wght@300..800' },
  { family: 'Inter', google: 'Inter:wght@300..800' },
]

function pickFont(name: string) {
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % fontOptions.length
  const font = fontOptions[idx]
  return {
    family: font.family,
    google: font.google,
    headingWeight: 'font-extrabold',
    headingStyle: 'uppercase tracking-wide',
  }
}

// ---- Terminal animation ----
async function runTerminalAnimation() {
  const lines = [
    { text: `Analisando marca "${brandName.value}"...` },
    { text: `Gerando paleta de cores a partir de ${primaryColor.value}`, color: primaryColor.value },
    { text: 'Selecionando tipografia ideal...' },
    { text: 'Configurando 40+ ferramentas...' },
    { text: 'Build completo.', color: '#34D399' },
  ]

  terminalTyping.value = true
  for (const line of lines) {
    await sleep(500)
    visibleTerminalLines.value.push({ ...line, done: false })
    await sleep(400)
    visibleTerminalLines.value[visibleTerminalLines.value.length - 1].done = true
  }
  terminalTyping.value = false
  await sleep(600)
}

// ---- Build sequence ----
async function runStep(stepIndex: number, mutation: () => void) {
  currentStep.value = stepIndex
  await sleep(300)
  mutation()
  await sleep(buildSteps[stepIndex].duration)
}

async function startBuild() {
  if (!brandName.value.trim()) return

  // Phase 2: Analysis
  phase.value = 'analysis'
  await runTerminalAnimation()

  // Phase 3: Build
  phase.value = 'build'

  await runStep(0, () => {
    Object.assign(brand, { colors: derivePalette(primaryColor.value) })
  })

  await runStep(1, () => {
    Object.assign(brand, { font: pickFont(brandName.value) })
  })

  await runStep(2, () => {
    Object.assign(brand, {
      name: brandName.value,
      shortName: brandName.value,
      tagline: `Investir com ${brandName.value}.`,
    })
  })

  await runStep(3, () => {
    // Visual-only step - ticker data "populates"
  })

  await runStep(4, () => {
    Object.assign(brand, {
      features: {
        showAIAdvisor: true,
        showCalculators: true,
        showDividends: true,
        showNews: true,
        showAppStoreLinks: true,
        showDownloadPage: true,
        showFounderPhoto: false,
        showEcosystemLinks: false,
        showGlossary: true,
        showGuides: true,
      },
    })
  })

  await sleep(500)

  // Phase 4: Reveal
  phase.value = 'reveal'
}

// ---- Contact submit ----
function submitContact() {
  // TODO: integrate with API or form service
  showContactModal.value = false
  showSuccessNotification('Enviado!', 'Entraremos em contato em ate 24h.')
}
</script>

<style scoped>
/* Slide-up transition for AI chat bubble */
.slide-up-enter-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Modal transition */
.modal-enter-active {
  transition: all 0.3s ease;
}
.modal-leave-active {
  transition: all 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from > div {
  transform: scale(0.95) translateY(10px);
}

/* Text visibility transition */
.builder-text-visible {
  animation: builder-text-focus 0.6s ease-out both;
}

@keyframes builder-text-focus {
  0% {
    filter: blur(4px);
    opacity: 0.3;
  }
  100% {
    filter: blur(0);
    opacity: 1;
  }
}
</style>
