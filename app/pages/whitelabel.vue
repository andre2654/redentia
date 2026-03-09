<template>
  <div class="wl-page min-h-screen overflow-x-hidden bg-[#050505] font-sans text-white selection:bg-blue-400/30 selection:text-white">
    <!-- Noise overlay -->
    <div class="pointer-events-none fixed inset-0 z-[999] opacity-[0.015]" style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E'); background-repeat: repeat; background-size: 128px;" />

    <!-- Nav -->
    <nav class="fixed top-0 z-50 w-full border-b border-white/[0.04] bg-[#050505]/60 backdrop-blur-2xl backdrop-saturate-150">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <NuxtLink to="/" class="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <img src="/brand/logo-full.svg" alt="Redentia" class="h-7" />
        </NuxtLink>
        <button class="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]" @click="openContactModal">
          Começar agora
        </button>
      </div>
    </nav>

    <!-- ========== HERO ========== -->
    <section class="relative overflow-hidden px-6 pb-20 pt-32 md:pb-32 md:pt-44">
      <!-- Animated gradient orbs -->
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div class="wl-orb wl-orb-1 absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-blue-400/10 blur-[120px]" />
        <div class="wl-orb wl-orb-2 absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-blue-300/8 blur-[100px]" />
        <div class="wl-orb wl-orb-3 absolute left-1/2 top-1/2 h-[300px] w-[300px] rounded-full bg-violet-500/5 blur-[100px]" />
      </div>

      <!-- Grid pattern -->
      <div class="pointer-events-none absolute inset-0 opacity-[0.03]" style="background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 64px 64px;" />

      <div class="relative mx-auto max-w-4xl text-center">

        <!-- Orbiting tickers -->
        <div class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[900px] w-[900px] hidden md:block">

          <!-- Outer orbit ring + dots -->
          <div class="absolute inset-0 rounded-full border border-white/[0.03]" />
          <div v-for="d in 5" :key="`dot-o-${d}`" class="wl-orbit-dot absolute left-1/2 top-1/2" :style="{ transform: `rotate(${d * 72}deg) translateX(420px)`, animationDelay: `${d * 0.8}s` }" />

          <!-- Outer orbit tickers -->
          <div
            v-for="(ot, oIdx) in orbitTickersOuter"
            :key="`orbit-o-${oIdx}`"
            class="wl-orbit-outer absolute left-1/2 top-1/2"
            :style="{
              '--orbit-duration': `${50 + oIdx * 5}s`,
              '--orbit-delay': `${oIdx * -(50 / orbitTickersOuter.length)}s`,
            }"
          >
            <div class="flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#0a0a0f]/80 px-3 py-1.5 backdrop-blur-md" :class="ot.change >= 0 ? 'shadow-[0_0_12px_rgba(52,211,153,0.15)]' : 'shadow-[0_0_12px_rgba(248,113,113,0.15)]'">
              <img v-if="ot.logo" :src="ot.logo" :alt="ot.symbol" class="h-4 w-4 rounded-full" />
              <span class="text-[11px] font-bold text-white/80">{{ ot.symbol }}</span>
              <span class="text-[10px] font-bold tabular-nums" :class="ot.change >= 0 ? 'text-emerald-400' : 'text-red-400'">
                {{ ot.change >= 0 ? '+' : '' }}{{ ot.change.toFixed(1) }}%
              </span>
            </div>
          </div>

          <!-- Inner orbit ring + dots -->
          <div class="absolute inset-[18%] rounded-full border border-white/[0.04]" />
          <div v-for="d in 4" :key="`dot-i-${d}`" class="wl-orbit-dot absolute left-1/2 top-1/2" :style="{ transform: `rotate(${d * 90 + 45}deg) translateX(260px)`, animationDelay: `${d * 1.1}s` }" />

          <!-- Inner orbit tickers -->
          <div
            v-for="(it, iIdx) in orbitTickersInner"
            :key="`orbit-i-${iIdx}`"
            class="wl-orbit-inner absolute left-1/2 top-1/2"
            :style="{
              '--orbit-duration': `${40 + iIdx * 4}s`,
              '--orbit-delay': `${iIdx * -(40 / orbitTickersInner.length)}s`,
            }"
          >
            <div class="flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#0a0a0f]/80 px-3 py-1.5 backdrop-blur-md" :class="it.change >= 0 ? 'shadow-[0_0_12px_rgba(52,211,153,0.15)]' : 'shadow-[0_0_12px_rgba(248,113,113,0.15)]'">
              <img v-if="it.logo" :src="it.logo" :alt="it.symbol" class="h-4 w-4 rounded-full" />
              <span class="text-[11px] font-bold text-white/80">{{ it.symbol }}</span>
              <span class="text-[10px] font-bold tabular-nums" :class="it.change >= 0 ? 'text-emerald-400' : 'text-red-400'">
                R$ {{ it.price.toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- Micro orbit ring + dots -->
          <div class="absolute inset-[36%] rounded-full border border-white/[0.02]" />
          <div v-for="d in 3" :key="`dot-m-${d}`" class="wl-orbit-dot absolute left-1/2 top-1/2" :style="{ transform: `rotate(${d * 120}deg) translateX(150px)`, animationDelay: `${d * 1.5}s` }" />

          <!-- Micro orbit tickers -->
          <div
            v-for="(mt, mIdx) in orbitTickersMicro"
            :key="`orbit-m-${mIdx}`"
            class="wl-orbit-micro absolute left-1/2 top-1/2"
            :style="{
              '--orbit-duration': `${25 + mIdx * 3}s`,
              '--orbit-delay': `${mIdx * -(25 / orbitTickersMicro.length)}s`,
            }"
          >
            <div class="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-[#0a0a0f]/60 px-2.5 py-1 backdrop-blur-md">
              <img v-if="mt.logo" :src="mt.logo" :alt="mt.symbol" class="h-3 w-3 rounded-full" />
              <span class="text-[10px] font-bold text-white/60">{{ mt.symbol }}</span>
            </div>
          </div>

        </div>

        <div class="relative">
          <div class="wl-reveal mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 backdrop-blur-sm">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span class="text-xs font-semibold uppercase tracking-widest text-emerald-400">Criadores já monetizando</span>
          </div>

          <h1 class="wl-reveal wl-reveal-d1 mb-6 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            Sua audiência já vale dinheiro.<br />
            <span class="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-[length:200%_100%] bg-clip-text text-transparent wl-gradient-shift">Você só precisa cobrar.</span>
          </h1>

          <p class="wl-reveal wl-reveal-d2 mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-white/50 md:text-xl">
            A IA analisa seu canal, cria uma plataforma de investimentos com a sua marca e tom de voz — e seus seguidores pagam para usar. <span class="text-white/80 font-medium">Receita recorrente desde o dia 1.</span>
          </p>

          <!-- CTA Input -->
          <div class="wl-reveal wl-reveal-d3 mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
            <div class="relative flex-1">
              <UIcon name="i-lucide-youtube" class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/25" />
              <input
                v-model="youtubeUrl"
                type="text"
                placeholder="youtube.com/@seucanal"
                class="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/30 transition-all duration-300 focus:border-blue-400/50 focus:bg-white/8 focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:shadow-[0_0_40px_rgba(96,165,250,0.08)]"
              />
            </div>
            <button
              class="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-blue-400 px-7 py-4 text-sm font-bold text-black transition-all hover:bg-blue-300 hover:shadow-[0_0_40px_rgba(96,165,250,0.3)] hover:scale-[1.02] active:scale-[0.98]"
              @click="openContactModal"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/20 to-blue-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <UIcon name="i-lucide-wand-2" class="relative h-4 w-4" />
              <span class="relative">Gerar plataforma</span>
            </button>
          </div>

          <p class="wl-reveal wl-reveal-d4 mt-5 text-sm text-white/30">
            <button class="transition-colors hover:text-white/60" @click="scrollTo('showcase')">Ver exemplos reais ↓</button>
          </p>
        </div>
      </div>
    </section>

    <!-- ========== O QUE A IA EXTRAI ========== -->
    <section class="relative border-t border-white/[0.04] px-6 py-20 md:py-28 overflow-hidden">
      <div class="pointer-events-none absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-blue-400/5 blur-[140px]" />

      <div class="relative mx-auto max-w-6xl">
        <div class="wl-reveal mb-16 text-center">
          <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-400">Inteligência artificial</p>
          <h2 class="mb-4 text-3xl font-bold tracking-tight md:text-5xl">Ela substitui uma equipe inteira</h2>
          <p class="mx-auto max-w-lg text-base text-white/40">Designer, copywriter, dev e branding — a IA faz em minutos o que custaria meses e dezenas de milhares de reais.</p>
        </div>

        <!-- AI Analysis Terminal — single unified interface -->
        <div class="wl-reveal relative mx-auto max-w-5xl">
          <!-- Terminal window frame -->
          <div class="relative rounded-2xl border border-white/[0.08] bg-[#0a0a0f] overflow-hidden shadow-2xl shadow-blue-400/5">

            <!-- Terminal header bar -->
            <div class="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-5 py-3">
              <div class="flex gap-1.5">
                <div class="h-2.5 w-2.5 rounded-full bg-white/10" />
                <div class="h-2.5 w-2.5 rounded-full bg-white/10" />
                <div class="h-2.5 w-2.5 rounded-full bg-white/10" />
              </div>
              <div class="flex flex-1 items-center justify-center gap-2">
                <UIcon name="i-lucide-sparkles" class="h-3 w-3 text-blue-400" />
                <span class="text-[11px] font-medium text-white/40">Redentia AI — Brand Analyzer</span>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="h-1.5 w-1.5 rounded-full bg-blue-400 ai-terminal-pulse" />
                <span class="text-[10px] text-blue-400/60 font-mono">LIVE</span>
              </div>
            </div>

            <!-- URL input row -->
            <div class="flex items-center gap-3 border-b border-white/[0.04] px-5 py-3 bg-white/[0.01]">
              <UIcon name="i-lucide-link" class="h-3.5 w-3.5 text-white/20" />
              <span class="font-mono text-sm text-white/60">youtube.com/<span class="text-blue-400">@primorico</span></span>
              <div class="ml-auto flex items-center gap-2">
                <span class="text-[10px] text-emerald-400/80 font-mono">Análise completa</span>
                <UIcon name="i-lucide-check-circle" class="h-3.5 w-3.5 text-emerald-400/80" />
              </div>
            </div>

            <!-- Main analysis content — flowing pipeline layout -->
            <div class="relative p-6 md:p-8">

              <!-- Connecting lines SVG background -->
              <svg class="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="rgba(96,165,250,0.15)" />
                    <stop offset="50%" stop-color="rgba(96,165,250,0.06)" />
                    <stop offset="100%" stop-color="rgba(96,165,250,0.15)" />
                  </linearGradient>
                </defs>
                <!-- Horizontal flow lines -->
                <line x1="0" y1="33%" x2="100%" y2="33%" stroke="url(#line-grad)" stroke-width="1" stroke-dasharray="4 6" class="ai-line-flow" />
                <line x1="0" y1="66%" x2="100%" y2="66%" stroke="url(#line-grad)" stroke-width="1" stroke-dasharray="4 6" class="ai-line-flow" style="animation-delay: 2s;" />
              </svg>

              <!-- Row 1: Colors + Typography — side by side, no card borders -->
              <div class="relative mb-10 flex flex-col gap-8 md:flex-row md:gap-12">

                <!-- Colors extraction -->
                <div class="flex-1">
                  <div class="mb-3 flex items-center gap-2">
                    <div class="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-400/10">
                      <UIcon name="i-lucide-palette" class="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <span class="text-[11px] font-semibold uppercase tracking-widest text-blue-400/70">Paleta extraída</span>
                  </div>

                  <div class="flex items-center gap-3">
                    <!-- Source thumbnails -->
                    <div class="flex -space-x-1.5">
                      <div class="h-10 w-14 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 ring-2 ring-[#0a0a0f] transition-transform hover:scale-105 hover:z-10" />
                      <div class="h-10 w-14 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 ring-2 ring-[#0a0a0f] transition-transform hover:scale-105 hover:z-10" />
                      <div class="h-10 w-14 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 ring-2 ring-[#0a0a0f] transition-transform hover:scale-105 hover:z-10" />
                    </div>

                    <UIcon name="i-lucide-arrow-right" class="h-4 w-4 text-white/10 shrink-0" />

                    <!-- Extracted colors as a horizontal bar -->
                    <div class="flex h-10 flex-1 overflow-hidden rounded-xl">
                      <div class="flex-1 bg-[#4ADE80] transition-all hover:flex-[2]" />
                      <div class="flex-1 bg-[#0A0A0A] transition-all hover:flex-[2]" />
                      <div class="flex-1 bg-[#FFFFFF] transition-all hover:flex-[2]" />
                      <div class="flex-1 bg-[#1A1A2E] transition-all hover:flex-[2]" />
                    </div>
                  </div>
                  <div class="mt-2 flex justify-end gap-3">
                    <span class="font-mono text-[9px] text-white/20">#4ADE80</span>
                    <span class="font-mono text-[9px] text-white/20">#0A0A0A</span>
                    <span class="font-mono text-[9px] text-white/20">#FFFFFF</span>
                    <span class="font-mono text-[9px] text-white/20">#1A1A2E</span>
                  </div>
                </div>

                <!-- Divider -->
                <div class="hidden md:block w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />

                <!-- Typography match -->
                <div class="flex-1">
                  <div class="mb-3 flex items-center gap-2">
                    <div class="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-400/10">
                      <UIcon name="i-lucide-type" class="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <span class="text-[11px] font-semibold uppercase tracking-widest text-blue-400/70">Tipografia ideal</span>
                  </div>

                  <div class="flex items-end gap-6">
                    <div class="opacity-30 transition-opacity hover:opacity-60">
                      <p class="text-3xl font-extrabold uppercase tracking-tight" style="font-family: Montserrat, sans-serif;">Aa</p>
                      <p class="text-[10px] text-white/30">Montserrat</p>
                    </div>
                    <div class="relative">
                      <div class="absolute -inset-3 rounded-xl bg-blue-400/[0.06] border border-blue-400/10" />
                      <div class="relative">
                        <p class="text-3xl font-black" style="font-family: Poppins, sans-serif;">Aa</p>
                        <p class="text-[10px] text-blue-400">Poppins <span class="text-blue-400/40">— 96% match</span></p>
                      </div>
                    </div>
                    <div class="opacity-30 transition-opacity hover:opacity-60">
                      <p class="text-3xl font-bold uppercase" style="font-family: Barlow, sans-serif;">Aa</p>
                      <p class="text-[10px] text-white/30">Barlow</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Row 2: Voice + Features + Generated copy — horizontal flow -->
              <div class="relative mb-10 flex flex-col gap-8 md:flex-row md:items-start md:gap-12">

                <!-- Voice analysis -->
                <div class="md:w-1/3">
                  <div class="mb-3 flex items-center gap-2">
                    <div class="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-400/10">
                      <UIcon name="i-lucide-mic" class="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <span class="text-[11px] font-semibold uppercase tracking-widest text-blue-400/70">Tom de voz</span>
                  </div>

                  <div class="space-y-2">
                    <div class="flex items-center gap-2">
                      <div class="h-1 flex-1 rounded-full bg-white/[0.04] overflow-hidden">
                        <div class="h-full w-[85%] rounded-full bg-gradient-to-r from-blue-400/60 to-blue-400/30 ai-bar-fill" />
                      </div>
                      <span class="text-[10px] text-white/30 w-20 text-right">Motivacional</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="h-1 flex-1 rounded-full bg-white/[0.04] overflow-hidden">
                        <div class="h-full w-[60%] rounded-full bg-gradient-to-r from-blue-400/60 to-blue-400/30 ai-bar-fill" style="animation-delay: 0.3s;" />
                      </div>
                      <span class="text-[10px] text-white/30 w-20 text-right">Didático</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="h-1 flex-1 rounded-full bg-white/[0.04] overflow-hidden">
                        <div class="h-full w-[40%] rounded-full bg-gradient-to-r from-blue-400/60 to-blue-400/30 ai-bar-fill" style="animation-delay: 0.6s;" />
                      </div>
                      <span class="text-[10px] text-white/30 w-20 text-right">Técnico</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="h-1 flex-1 rounded-full bg-white/[0.04] overflow-hidden">
                        <div class="h-full w-[70%] rounded-full bg-gradient-to-r from-blue-400/60 to-blue-400/30 ai-bar-fill" style="animation-delay: 0.9s;" />
                      </div>
                      <span class="text-[10px] text-white/30 w-20 text-right">Informal</span>
                    </div>
                  </div>
                  <p class="mt-3 text-xs italic text-white/20">"Fala, sardinha! Bora falar de FIIs?"</p>
                </div>

                <!-- Divider -->
                <div class="hidden md:block w-px self-stretch bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />

                <!-- Smart features -->
                <div class="md:w-1/3">
                  <div class="mb-3 flex items-center gap-2">
                    <div class="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-400/10">
                      <UIcon name="i-lucide-sliders-horizontal" class="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <span class="text-[11px] font-semibold uppercase tracking-widest text-blue-400/70">Features</span>
                  </div>

                  <div class="flex flex-wrap gap-1.5">
                    <span v-for="feat in aiToggleFeatures" :key="feat.label"
                      class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all"
                      :class="feat.on
                        ? 'bg-blue-400/10 text-blue-400/80 ring-1 ring-blue-400/20'
                        : 'bg-white/[0.03] text-white/20 ring-1 ring-white/[0.04]'"
                    >
                      <UIcon :name="feat.on ? 'i-lucide-check' : 'i-lucide-x'" class="h-2.5 w-2.5" />
                      {{ feat.label }}
                    </span>
                  </div>
                  <p class="mt-3 text-[10px] text-white/15">Baseado no perfil do público do canal</p>
                </div>

                <!-- Divider -->
                <div class="hidden md:block w-px self-stretch bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />

                <!-- Generated copy -->
                <div class="md:w-1/3">
                  <div class="mb-3 flex items-center gap-2">
                    <div class="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-400/10">
                      <UIcon name="i-lucide-file-text" class="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <span class="text-[11px] font-semibold uppercase tracking-widest text-blue-400/70">Textos gerados</span>
                  </div>

                  <div class="space-y-2 font-mono text-[11px]">
                    <div>
                      <span class="text-white/15">headline:</span>
                      <span class="text-white/50 ml-1">Invista como gente grande.</span>
                    </div>
                    <div>
                      <span class="text-white/15">cta:</span>
                      <span class="text-blue-400/60 ml-1">Comecar agora</span>
                    </div>
                    <div>
                      <span class="text-white/15">desc:</span>
                      <span class="text-white/30 ml-1">Ações, FIIs e dividendos...</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Row 3: AI Assessor output — full width, inline -->
              <div class="relative">
                <div class="mb-3 flex items-center gap-2">
                  <div class="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-400/10">
                    <UIcon name="i-lucide-bot" class="h-3.5 w-3.5 text-blue-400" />
                  </div>
                  <span class="text-[11px] font-semibold uppercase tracking-widest text-blue-400/70">Assessor IA personalizado</span>
                  <div class="ml-2 h-1.5 w-1.5 rounded-full bg-blue-400 ai-terminal-pulse" />
                </div>

                <div class="flex items-start gap-4 ml-8">
                  <div class="flex flex-col gap-2 text-sm max-w-xl">
                    <div class="flex items-start gap-2">
                      <span class="text-white/15 font-mono text-xs mt-0.5 shrink-0">user:</span>
                      <span class="text-white/40">PETR4 ta cara?</span>
                    </div>
                    <div class="flex items-start gap-2">
                      <span class="text-blue-400/40 font-mono text-xs mt-0.5 shrink-0">bot:</span>
                      <span class="text-white/30">Olha o P/L de 4.2... ta barata sim! Mas lembra: <span class="text-blue-400/50">nunca coloque tudo em uma so acao</span>, diversifica sardinha!</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <!-- Terminal footer — business metrics -->
            <div class="grid grid-cols-2 sm:grid-cols-4 border-t border-white/[0.04]">
              <div class="flex flex-col items-center gap-1 border-r border-white/[0.04] px-4 py-3">
                <span class="text-base font-extrabold text-emerald-400">R$ 0</span>
                <span class="text-[9px] text-white/25 uppercase tracking-wider">Custo de equipe</span>
              </div>
              <div class="flex flex-col items-center gap-1 sm:border-r border-white/[0.04] px-4 py-3">
                <span class="text-base font-extrabold text-blue-400">4 min</span>
                <span class="text-[9px] text-white/25 uppercase tracking-wider">vs 3 meses manual</span>
              </div>
              <div class="flex flex-col items-center gap-1 border-r border-white/[0.04] px-4 py-3">
                <span class="text-base font-extrabold text-amber-400">5 profissionais</span>
                <span class="text-[9px] text-white/25 uppercase tracking-wider">Substituídos pela IA</span>
              </div>
              <div class="flex flex-col items-center gap-1 px-4 py-3">
                <span class="text-base font-extrabold text-white/80">~ R$ 40k</span>
                <span class="text-[9px] text-white/25 uppercase tracking-wider">Economia estimada</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== SHOWCASE — CAROUSEL CARDS ========== -->
    <section id="showcase" class="relative border-t border-white/[0.04] py-24 md:py-36 overflow-hidden">
      <div class="pointer-events-none absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-blue-400/[0.04] blur-[200px]" />

      <div class="relative mx-auto max-w-7xl px-6">
        <div class="wl-reveal mb-12 md:mb-20 text-center">
          <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-400">Cases reais</p>
          <h2 class="mb-4 text-4xl font-bold tracking-tight md:text-6xl">Mesmo motor.<br class="md:hidden" /> Marcas únicas.</h2>
          <p class="mx-auto max-w-xl text-base md:text-lg text-white/40">Cada plataforma abaixo é real e está rodando agora — gerada por IA em minutos.</p>
        </div>

        <!-- Brand selector tabs -->
        <div class="wl-reveal mb-10 md:mb-14 flex items-stretch justify-center gap-3 md:gap-4">
          <button
            v-for="(s, idx) in showcaseBrands"
            :key="`tab-${s.slug}`"
            class="group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border px-5 py-4 md:px-8 md:py-5 transition-all duration-500 cursor-pointer"
            :class="idx === activeShowcase ? 'bg-white/[0.06]' : 'border-transparent bg-white/[0.02] hover:bg-white/[0.04]'"
            :style="idx === activeShowcase ? { borderColor: `${s.accent}30`, boxShadow: `0 0 40px ${s.accent}10` } : {}"
            @click="activeShowcase = idx; resetAutoRotate()"
          >
            <!-- Color dots -->
            <div class="flex gap-1.5 mb-1">
              <div v-for="(color, ci) in s.colors" :key="ci" class="h-3 w-3 md:h-3.5 md:w-3.5 rounded-full ring-1 ring-white/10 transition-all duration-300" :class="idx === activeShowcase ? 'scale-110' : 'scale-90 opacity-50'" :style="{ backgroundColor: color }" />
            </div>
            <!-- Brand name -->
            <span class="text-xs md:text-sm font-bold tracking-wide transition-colors duration-300" :style="{ color: idx === activeShowcase ? s.accent : 'rgba(255,255,255,0.3)' }">{{ s.name }}</span>
            <!-- Progress bar bottom -->
            <div v-if="idx === activeShowcase" class="absolute bottom-0 left-0 h-[2px] wl-progress-fill" :style="{ backgroundColor: s.accent, animationDuration: `${CAROUSEL_INTERVAL}ms` }" />
          </button>
        </div>

        <!-- Main showcase card -->
        <div class="wl-reveal relative mx-auto max-w-5xl">
          <div
            v-for="(s, idx) in showcaseBrands"
            :key="`card-${s.slug}`"
            class="transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
            :class="idx === activeShowcase ? 'relative opacity-100' : 'absolute inset-0 opacity-0 pointer-events-none'"
            :style="{ transform: idx === activeShowcase ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.98)' }"
          >
            <!-- Glow behind card -->
            <div class="absolute -inset-4 rounded-3xl blur-2xl opacity-20 transition-opacity duration-700" :style="{ backgroundColor: s.accent }" />

            <!-- Browser frame -->
            <div class="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl" :style="{ boxShadow: `0 25px 80px -20px ${s.accent}15` }">
              <!-- Browser chrome -->
              <div class="flex items-center gap-3 bg-[#1C1C1E] px-4 py-2.5 md:px-5 md:py-3">
                <div class="flex gap-1.5">
                  <div class="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-[#FF5F57]" />
                  <div class="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-[#FEBC2E]" />
                  <div class="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-[#28C840]" />
                </div>
                <div class="flex flex-1 items-center gap-2 rounded-lg bg-[#2C2C2E] px-3 py-1.5 min-w-0">
                  <UIcon name="i-lucide-lock" class="h-3 w-3 text-[#8E8E93] shrink-0" />
                  <span class="text-[10px] md:text-xs text-[#8E8E93] truncate">{{ s.domain }}</span>
                </div>
                <div class="hidden items-center gap-1.5 rounded-full px-3 py-1 sm:flex shrink-0" :style="{ backgroundColor: `${s.accent}15` }">
                  <UIcon name="i-lucide-sparkles" class="h-3 w-3" :style="{ color: s.accent }" />
                  <span class="text-[9px] font-bold uppercase tracking-wider" :style="{ color: s.accent }">Gerado por IA</span>
                </div>
              </div>

              <!-- Live iframe -->
              <div class="relative overflow-hidden" style="height: clamp(320px, 50vw, 600px);" :style="{ backgroundColor: s.bg }">
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="flex flex-col items-center gap-3">
                    <div class="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" :style="{ borderColor: `${s.accent}40`, borderTopColor: 'transparent' }" />
                    <span class="text-[10px]" :style="{ color: `${s.accent}60` }">Carregando {{ s.name }}...</span>
                  </div>
                </div>
                <iframe
                  :src="`https://redentia.com.br/?brand=${s.slug}`"
                  class="relative h-full w-full border-0"
                  :title="`Preview ${s.name}`"
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin"
                />
                <!-- Bottom fade gradient (always visible) -->
                <div class="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>

              <!-- Explore button below iframe -->
              <div class="flex justify-center border-t border-white/[0.06] bg-[#1C1C1E] py-3">
                <a
                  :href="`https://redentia.com.br/?brand=${s.slug}`"
                  target="_blank"
                  class="flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold text-white transition-all duration-300 hover:scale-105" :style="{ backgroundColor: `${s.accent}CC` }"
                >
                  <UIcon name="i-lucide-external-link" class="h-3.5 w-3.5" />
                  Explorar {{ s.name }}
                </a>
              </div>
            </div>

            <!-- Brand info below card -->
            <div class="mt-6 flex flex-col items-center gap-4 md:flex-row md:justify-between md:items-start md:gap-8 px-2">
              <div class="flex items-center gap-4">
                <div class="flex gap-1.5">
                  <div v-for="(color, ci) in s.colors" :key="ci" class="h-5 w-5 rounded-full ring-1 ring-white/10" :style="{ backgroundColor: color }" />
                </div>
                <div>
                  <p class="text-sm font-bold text-white/80">{{ s.name }}</p>
                  <p class="text-xs text-white/30">{{ s.font }} · {{ s.style }}</p>
                </div>
              </div>
              <div class="flex items-center gap-6 text-center md:text-right">
                <div>
                  <p class="text-lg font-bold" :style="{ color: s.accent }">100%</p>
                  <p class="text-[10px] text-white/30 uppercase tracking-wider">Customizado</p>
                </div>
                <div class="h-8 w-px bg-white/10" />
                <div>
                  <p class="text-lg font-bold" :style="{ color: s.accent }">&lt; 5min</p>
                  <p class="text-[10px] text-white/30 uppercase tracking-wider">Setup por IA</p>
                </div>
                <div class="h-8 w-px bg-white/10" />
                <div>
                  <p class="text-lg font-bold" :style="{ color: s.accent }">PWA</p>
                  <p class="text-[10px] text-white/30 uppercase tracking-wider">App nativo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== FEATURES — MARQUEE + COUNT ========== -->
    <section class="relative border-t border-white/[0.04] py-20 md:py-28 overflow-hidden">
      <div class="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-400/[0.03] blur-[160px]" />

      <div class="relative mx-auto max-w-5xl px-6">
        <div class="wl-reveal mb-16 text-center">
          <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-400">Tudo pronto pra usar</p>
          <h2 class="mb-4 text-3xl font-bold tracking-tight md:text-5xl">40+ ferramentas que mantem<br />seus seguidores engajados</h2>
          <p class="mx-auto max-w-lg text-base text-white/40">Cotações, carteira, calculadoras, glossário, chat IA — tudo com a sua marca, sem você precisar construir nada.</p>
        </div>

        <!-- Impact metrics -->
        <div class="wl-reveal mb-12 flex items-center justify-center gap-8 md:gap-12">
          <div class="text-center">
            <p class="text-4xl font-extrabold text-blue-400 md:text-5xl">40+</p>
            <p class="mt-1 text-[11px] uppercase tracking-widest text-white/25">Ferramentas prontas</p>
          </div>
          <div class="h-10 w-px bg-white/[0.06]" />
          <div class="text-center">
            <p class="text-4xl font-extrabold text-white/80 md:text-5xl">800+</p>
            <p class="mt-1 text-[11px] uppercase tracking-widest text-white/25">Ativos cobertos</p>
          </div>
          <div class="h-10 w-px bg-white/[0.06]" />
          <div class="text-center">
            <p class="text-4xl font-extrabold text-white/80 md:text-5xl">24/7</p>
            <p class="mt-1 text-[11px] uppercase tracking-widest text-white/25">Disponível sempre</p>
          </div>
        </div>
      </div>

      <!-- Scrolling marquee rows -->
      <div class="wl-reveal flex flex-col gap-3">
        <!-- Row 1 — scrolls left -->
        <div class="relative">
          <div class="absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-[#050505] to-transparent" />
          <div class="absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-[#050505] to-transparent" />
          <div class="wl-marquee flex gap-3">
            <div v-for="n in 2" :key="`r1-${n}`" class="flex shrink-0 gap-3 wl-marquee-track">
              <div
                v-for="f in platformFeatures.slice(0, 5)"
                :key="`${n}-${f.title}`"
                class="group flex shrink-0 items-center gap-3 rounded-full border border-white/[0.06] bg-white/[0.02] py-3 pl-3 pr-5 transition-all duration-300 hover:border-blue-400/20 hover:bg-blue-400/[0.04]"
              >
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-400/10 transition-colors group-hover:bg-blue-400/20">
                  <UIcon :name="f.icon" class="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p class="text-sm font-semibold whitespace-nowrap">{{ f.title }}</p>
                  <p class="text-[11px] text-white/30 whitespace-nowrap">{{ f.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 2 — scrolls right -->
        <div class="relative">
          <div class="absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-[#050505] to-transparent" />
          <div class="absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-[#050505] to-transparent" />
          <div class="wl-marquee wl-marquee-reverse flex gap-3">
            <div v-for="n in 2" :key="`r2-${n}`" class="flex shrink-0 gap-3 wl-marquee-track-reverse">
              <div
                v-for="f in platformFeatures.slice(5, 9)"
                :key="`${n}-${f.title}`"
                class="group flex shrink-0 items-center gap-3 rounded-full border border-white/[0.06] bg-white/[0.02] py-3 pl-3 pr-5 transition-all duration-300 hover:border-blue-400/20 hover:bg-blue-400/[0.04]"
              >
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-400/10 transition-colors group-hover:bg-blue-400/20">
                  <UIcon :name="f.icon" class="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p class="text-sm font-semibold whitespace-nowrap">{{ f.title }}</p>
                  <p class="text-[11px] text-white/30 whitespace-nowrap">{{ f.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== LIVE MARKET DATA ========== -->
    <section class="relative border-t border-white/[0.04] py-20 md:py-28 overflow-hidden">
      <div class="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-blue-400/5 blur-[140px]" />

      <div class="relative mx-auto max-w-6xl px-6">
        <div class="wl-reveal mb-10 text-center">
          <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-400">Dados em tempo real</p>
          <h2 class="mb-4 text-3xl font-bold tracking-tight md:text-5xl">Seus seguidores confiam porque<br />os dados são reais</h2>
          <p class="mx-auto max-w-lg text-base text-white/40">800+ ativos brasileiros com cotações ao vivo, indicadores fundamentalistas e análise completa. <span class="text-white/60">Tudo abaixo é real — não mockup.</span></p>
        </div>

        <!-- Category tabs — desktop buttons -->
        <div class="wl-reveal mb-8 hidden md:flex items-center justify-center gap-3">
          <button
            v-for="cat in marketCategories"
            :key="cat.key"
            class="flex items-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-bold transition-all duration-300"
            :class="activeMarketCat === cat.key
              ? 'bg-blue-400 text-black shadow-lg shadow-blue-400/20'
              : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60'"
            @click="activeMarketCat = cat.key"
          >
            <UIcon :name="cat.icon" class="h-4 w-4" />
            {{ cat.label }}
            <span class="rounded-full px-2 py-0.5 text-[10px] font-bold" :class="activeMarketCat === cat.key ? 'bg-black/20 text-black/60' : 'bg-white/[0.06] text-white/20'">
              {{ cat.count }}
            </span>
          </button>
        </div>

        <!-- Category select — mobile -->
        <div class="wl-reveal mb-8 flex md:hidden justify-center">
          <div class="relative">
            <select
              :value="activeMarketCat"
              class="appearance-none rounded-xl border border-white/[0.08] bg-white/[0.04] pl-4 pr-10 py-3 text-sm font-bold text-white/80 outline-none focus:border-blue-400/40 focus:ring-1 focus:ring-blue-400/20 transition-all"
              @change="activeMarketCat = ($event.target as HTMLSelectElement).value"
            >
              <option v-for="cat in marketCategories" :key="cat.key" :value="cat.key" class="bg-[#0a0a0f] text-white">
                {{ cat.label }} ({{ cat.count }})
              </option>
            </select>
            <UIcon name="i-lucide-chevron-down" class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          </div>
        </div>
      </div>

      <!-- Ticker rows per category — stacked, full bleed -->
      <div v-for="cat in marketCategories" :key="`tape-${cat.key}`" :class="activeMarketCat === cat.key ? 'block' : 'hidden'">
        <!-- Row 1 — top movers scroll left -->
        <div class="relative mb-3">
          <div class="absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-[#050505] to-transparent" />
          <div class="absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-[#050505] to-transparent" />
          <div class="wl-marquee flex">
            <div v-for="n in 2" :key="`${cat.key}-top-${n}`" class="flex shrink-0 wl-marquee-track" style="animation-duration: 45s;">
              <div
                v-for="ticker in cat.topTickers.value"
                :key="`${n}-${ticker.symbol}`"
                class="group flex shrink-0 items-center gap-4 border-r border-white/[0.04] px-7 py-5 transition-colors hover:bg-white/[0.02]"
              >
                <img v-if="ticker.logo" :src="ticker.logo" :alt="ticker.symbol" class="h-11 w-11 rounded-xl ring-1 ring-white/[0.06] bg-white/[0.03] p-1.5 shrink-0" />
                <div class="flex flex-col gap-0.5">
                  <div class="flex items-center gap-2.5">
                    <span class="text-base font-bold text-white/90">{{ ticker.symbol }}</span>
                    <span
                      class="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold"
                      :class="ticker.change >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'"
                    >
                      <UIcon :name="ticker.change >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'" class="h-3.5 w-3.5" />
                      {{ (ticker.change ?? 0) >= 0 ? '+' : '' }}{{ (ticker.change ?? 0).toFixed(2) }}%
                    </span>
                  </div>
                  <span class="text-xl font-bold tabular-nums text-white/70">R$ {{ (ticker.price ?? 0).toFixed(2) }}</span>
                  <span class="text-[11px] text-white/25 max-w-[180px] truncate">{{ ticker.name }}</span>
                </div>
                <!-- Mini sparkline -->
                <div class="flex h-10 items-end gap-0.5">
                  <div v-for="i in 10" :key="i" class="w-1.5 rounded-sm" :class="ticker.change >= 0 ? 'bg-emerald-400/30 group-hover:bg-emerald-400/50' : 'bg-red-400/30 group-hover:bg-red-400/50'" :style="{ height: `${8 + Math.sin(i * ticker.price) * 16 + 16}px` }" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 2 — bottom movers scroll right -->
        <div class="relative">
          <div class="absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-[#050505] to-transparent" />
          <div class="absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-[#050505] to-transparent" />
          <div class="wl-marquee flex">
            <div v-for="n in 2" :key="`${cat.key}-bot-${n}`" class="flex shrink-0 wl-marquee-track-reverse" style="animation-duration: 40s;">
              <div
                v-for="ticker in cat.bottomTickers.value"
                :key="`${n}-${ticker.symbol}`"
                class="group flex shrink-0 items-center gap-4 border-r border-white/[0.04] px-7 py-5 transition-colors hover:bg-white/[0.02]"
              >
                <img v-if="ticker.logo" :src="ticker.logo" :alt="ticker.symbol" class="h-11 w-11 rounded-xl ring-1 ring-white/[0.06] bg-white/[0.03] p-1.5 shrink-0" />
                <div class="flex flex-col gap-0.5">
                  <div class="flex items-center gap-2.5">
                    <span class="text-base font-bold text-white/90">{{ ticker.symbol }}</span>
                    <span
                      class="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold"
                      :class="ticker.change >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'"
                    >
                      <UIcon :name="ticker.change >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'" class="h-3.5 w-3.5" />
                      {{ (ticker.change ?? 0) >= 0 ? '+' : '' }}{{ (ticker.change ?? 0).toFixed(2) }}%
                    </span>
                  </div>
                  <span class="text-xl font-bold tabular-nums text-white/70">R$ {{ (ticker.price ?? 0).toFixed(2) }}</span>
                  <span class="text-[11px] text-white/25 max-w-[180px] truncate">{{ ticker.name }}</span>
                </div>
                <!-- Mini sparkline -->
                <div class="flex h-10 items-end gap-0.5">
                  <div v-for="i in 10" :key="i" class="w-1.5 rounded-sm" :class="ticker.change >= 0 ? 'bg-emerald-400/30 group-hover:bg-emerald-400/50' : 'bg-red-400/30 group-hover:bg-red-400/50'" :style="{ height: `${8 + Math.cos(i * ticker.price) * 16 + 16}px` }" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Live badge -->
      <div class="mt-8 flex items-center justify-center gap-2">
        <span class="relative flex h-2 w-2">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
          <span class="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
        </span>
        <span class="text-[11px] font-semibold uppercase tracking-widest text-blue-400/60">Dados ao vivo da B3</span>
      </div>
    </section>

    <!-- ========== PORTFOLIO & DIVIDENDOS ========== -->
    <section class="relative border-t border-white/[0.04] px-6 py-24 md:py-32">
      <!-- Dual ambient glows -->
      <div class="pointer-events-none absolute left-0 bottom-0 h-[500px] w-[500px] rounded-full bg-blue-400/[0.06] blur-[180px]" />
      <div class="pointer-events-none absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-emerald-400/[0.03] blur-[160px]" />

      <div class="relative mx-auto max-w-5xl">
        <!-- Header -->
        <div class="wl-reveal mb-16 text-center">
          <div class="mb-5 inline-flex items-center gap-3 rounded-full border border-blue-400/15 bg-blue-400/[0.06] px-4 py-2">
            <UIcon name="i-lucide-briefcase" class="h-3.5 w-3.5 text-blue-400" />
            <span class="text-xs font-bold uppercase tracking-widest text-blue-400">Carteira & Dividendos</span>
          </div>
          <h2 class="mb-5 text-3xl font-bold tracking-tight md:text-5xl">Seus seguidores veem<br /><span class="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">o patrimônio crescer</span></h2>
          <p class="mx-auto max-w-lg text-base md:text-lg text-white/40">Carteira, dividendos e rentabilidade atualizados em tempo real — tudo na sua marca.</p>
        </div>

        <!-- App-like dashboard mockup -->
        <div class="wl-reveal relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0f]" style="box-shadow: 0 0 80px rgba(96,165,250,0.06), 0 25px 50px rgba(0,0,0,0.4);">

          <!-- Window chrome -->
          <div class="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-5 py-3">
            <div class="flex gap-1.5">
              <div class="h-2.5 w-2.5 rounded-full bg-red-400/40" />
              <div class="h-2.5 w-2.5 rounded-full bg-amber-400/40" />
              <div class="h-2.5 w-2.5 rounded-full bg-emerald-400/40" />
            </div>
            <div class="flex flex-1 items-center justify-center gap-2">
              <UIcon name="i-lucide-briefcase" class="h-3 w-3 text-blue-400" />
              <span class="text-[11px] font-medium text-white/40">Minha Carteira</span>
            </div>
            <span class="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">+18.4% ano</span>
          </div>

          <!-- Top stats row -->
          <div class="grid grid-cols-3 border-b border-white/[0.04]">
            <div class="p-5 text-center border-r border-white/[0.04]">
              <p class="text-[10px] text-white/25 mb-1.5 uppercase tracking-wider">Patrimônio total</p>
              <p class="text-xl font-extrabold tabular-nums md:text-3xl">R$ {{ portfolioTotal.toLocaleString('pt-BR') }}</p>
            </div>
            <div class="p-5 text-center border-r border-white/[0.04]">
              <p class="text-[10px] text-white/25 mb-1.5 uppercase tracking-wider">Dividendos (6m)</p>
              <p class="text-xl font-extrabold text-blue-400 tabular-nums md:text-3xl">R$ 2.140</p>
            </div>
            <div class="p-5 text-center">
              <p class="text-[10px] text-white/25 mb-1.5 uppercase tracking-wider">Yield médio</p>
              <p class="text-xl font-extrabold tabular-nums md:text-3xl">6.8%</p>
            </div>
          </div>

          <!-- Two-column layout: assets + dividends -->
          <div class="flex flex-col lg:flex-row">

            <!-- Left: Asset list -->
            <div class="flex-1 lg:border-r lg:border-white/[0.04]">
              <!-- Column header -->
              <div class="flex items-center gap-3 px-5 py-2.5 border-b border-white/[0.04] bg-white/[0.015]">
                <span class="w-6 text-[9px] font-bold uppercase tracking-widest text-white/15">#</span>
                <span class="flex-1 text-[9px] font-bold uppercase tracking-widest text-white/15">Ativo</span>
                <span class="hidden sm:block w-28 text-right text-[9px] font-bold uppercase tracking-widest text-white/15">Alocação</span>
                <span class="w-24 text-right text-[9px] font-bold uppercase tracking-widest text-white/15">Valor</span>
              </div>

              <div class="divide-y !divide-white/[0.1]">
                <div
                  v-for="(asset, aIdx) in portfolioAssets"
                  :key="asset.ticker"
                  class="group flex items-center gap-3 px-5 py-3.5 transition-all duration-200 hover:bg-white/[0.025]"
                >
                  <span class="w-6 text-center text-[10px] font-bold text-white/15 tabular-nums">{{ aIdx + 1 }}</span>

                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold ring-1 transition-all duration-200" :class="asset.pct >= 0 ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-400/10 group-hover:ring-emerald-400/20' : 'bg-red-500/10 text-red-400 ring-red-400/10 group-hover:ring-red-400/20'">
                    {{ asset.ticker.slice(0, 2) }}
                  </div>

                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold">{{ asset.ticker }}</p>
                    <p class="text-[10px] text-white/25">{{ asset.shares }} cotas</p>
                  </div>

                  <!-- Allocation bar -->
                  <div class="hidden sm:flex items-center gap-2 w-28">
                    <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
                      <div
                        class="h-full rounded-full transition-all duration-500"
                        :class="asset.pct >= 0 ? 'bg-gradient-to-r from-blue-400/30 to-blue-400/60' : 'bg-gradient-to-r from-red-400/30 to-red-400/50'"
                        :style="{ width: `${Math.min(Math.abs(asset.pct ?? 0) * 4, 100)}%` }"
                      />
                    </div>
                    <span class="text-[9px] text-white/20 tabular-nums w-10 text-right">{{ ((asset.value / portfolioTotal) * 100).toFixed(1) }}%</span>
                  </div>

                  <div class="w-24 text-right">
                    <p class="text-sm font-semibold tabular-nums">R$ {{ asset.value.toLocaleString('pt-BR') }}</p>
                    <p class="text-[10px] font-bold tabular-nums" :class="asset.pct >= 0 ? 'text-emerald-400' : 'text-red-400'">
                      {{ (asset.pct ?? 0) >= 0 ? '+' : '' }}{{ (asset.pct ?? 0).toFixed(1) }}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Dividend chart -->
            <div class="lg:w-[320px] flex flex-col">
              <!-- Chart header -->
              <div class="flex items-center gap-2 px-5 py-2.5 border-b border-white/[0.04] bg-white/[0.015]">
                <UIcon name="i-lucide-coins" class="h-3.5 w-3.5 text-blue-400" />
                <span class="text-[9px] font-bold uppercase tracking-widest text-white/15">Dividendos mensais</span>
              </div>

              <!-- Chart area -->
              <div class="flex flex-1 items-end gap-1.5 px-5 pt-6 pb-2">
                <div
                  v-for="d in dividendMonths"
                  :key="d.month"
                  class="group/bar flex flex-1 flex-col items-center gap-1"
                >
                  <span class="text-[8px] font-bold text-blue-400/70 tabular-nums opacity-0 transition-opacity group-hover/bar:opacity-100">{{ d.value }}</span>
                  <div class="relative w-full overflow-hidden rounded-sm transition-all duration-300 group-hover/bar:brightness-125" :style="{ height: `${(d.value / 480) * 120}px` }">
                    <div class="absolute inset-0 bg-gradient-to-t from-blue-400/15 to-blue-400/50 group-hover/bar:from-blue-400/25 group-hover/bar:to-blue-400/70 transition-all duration-300" />
                  </div>
                  <span class="text-[9px] text-white/25">{{ d.month }}</span>
                </div>
              </div>

              <!-- Bottom stats -->
              <div class="flex border-t border-white/[0.04]">
                <div class="flex-1 p-4 text-center">
                  <p class="text-lg font-extrabold text-blue-400 tabular-nums">R$ 2.140</p>
                  <p class="text-[9px] text-white/25">Total recebido</p>
                </div>
                <div class="flex-1 border-l border-white/[0.04] p-4 text-center">
                  <p class="text-lg font-extrabold tabular-nums">12</p>
                  <p class="text-[9px] text-white/25">Pagamentos</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Open Finance — integrated as bottom extension of the dashboard -->
          <div class="relative border-t border-dashed border-emerald-400/15">
            <!-- Subtle emerald glow line -->
            <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />

            <div class="flex flex-col md:flex-row md:items-center gap-5 px-6 py-5">
              <!-- Badge + text -->
              <div class="flex items-center gap-4 flex-1 min-w-0">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 ring-1 ring-emerald-400/15">
                  <UIcon name="i-lucide-landmark" class="h-4.5 w-4.5 text-emerald-400" />
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2.5 mb-1">
                    <p class="text-sm font-bold">Open Finance</p>
                    <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-0.5">
                      <span class="relative flex h-1.5 w-1.5">
                        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      </span>
                      <span class="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Em breve</span>
                    </span>
                  </div>
                  <p class="text-[11px] text-white/30">Consolide bancos, cartões e corretoras — seus seguidores nunca mais saem</p>
                </div>
              </div>

              <!-- Bank avatars -->
              <div class="flex items-center gap-4 shrink-0">
                <div class="flex -space-x-2.5">
                  <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#820ad1]/20 text-[9px] font-black text-[#820ad1] ring-2 ring-[#0a0a0f] z-30">NU</div>
                  <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 text-[9px] font-black text-blue-400 ring-2 ring-[#0a0a0f] z-20">XP</div>
                  <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-[9px] font-black text-amber-400 ring-2 ring-[#0a0a0f] z-10">BB</div>
                  <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-[9px] font-black text-emerald-400 ring-2 ring-[#0a0a0f]">+8</div>
                </div>
                <div class="hidden lg:block h-8 w-px bg-white/[0.06]" />
                <div class="hidden lg:flex flex-col gap-0.5">
                  <span class="text-[10px] font-bold text-emerald-400 tabular-nums">+340%</span>
                  <span class="text-[9px] text-white/20">retenção estimada</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== AI CHAT MOCK ========== -->
    <section class="relative border-t border-white/[0.04] px-6 py-20 md:py-28 overflow-hidden">
      <div class="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/[0.04] blur-[160px]" />

      <div class="relative mx-auto max-w-6xl">
        <!-- Split layout: text left, chat right -->
        <div class="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">

          <!-- Left: copy + features -->
          <div class="lg:w-2/5">
            <div class="wl-reveal">
              <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-400">Assessor IA</p>
              <h2 class="mb-5 text-3xl font-bold tracking-tight md:text-5xl leading-[1.1]">Você dorme. Seu clone atende 10.000.</h2>
              <p class="mb-8 text-base leading-relaxed text-white/40">A IA fala como você, conhece seu conteúdo e responde com dados reais da B3 — escalando sua entrega sem escalar seu tempo.</p>
            </div>

            <!-- Economy comparison -->
            <div class="wl-reveal mb-6 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]" style="transition-delay: 80ms;">
              <div class="grid grid-cols-2 divide-x divide-white/[0.06]">
                <div class="p-4 text-center">
                  <p class="text-[10px] uppercase tracking-widest text-white/25 mb-1">Assessor humano</p>
                  <p class="text-xl font-extrabold text-red-400/70 line-through decoration-red-400/40">R$ 8k<span class="text-xs font-bold text-white/20 no-underline">/mes</span></p>
                  <p class="text-[10px] text-white/20 mt-1">1 pessoa, horário comercial</p>
                </div>
                <div class="p-4 text-center bg-emerald-400/[0.03]">
                  <p class="text-[10px] uppercase tracking-widest text-emerald-400/50 mb-1">Sua IA</p>
                  <p class="text-xl font-extrabold text-emerald-400">R$ 0<span class="text-xs font-bold text-emerald-400/40">/adicional</span></p>
                  <p class="text-[10px] text-white/20 mt-1">Ilimitado, 24/7, seu tom de voz</p>
                </div>
              </div>
            </div>

            <div class="wl-reveal space-y-4" style="transition-delay: 150ms;">
              <div class="flex items-start gap-3">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-400/10 mt-0.5">
                  <UIcon name="i-lucide-brain" class="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p class="text-sm font-semibold">Treinado com seus videos</p>
                  <p class="text-[13px] text-white/30">Extrai bordões, exemplos e jeito de explicar direto do seu canal.</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 mt-0.5">
                  <UIcon name="i-lucide-users" class="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p class="text-sm font-semibold">10.000 conversas simultâneas</p>
                  <p class="text-[13px] text-white/30">Escala infinita sem contratar ninguém. Cada seguidor tem atendimento individual.</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 mt-0.5">
                  <UIcon name="i-lucide-bell-ring" class="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <p class="text-sm font-semibold">Alerta que salva dinheiro</p>
                  <p class="text-[13px] text-white/30">PETR4 caiu 8% e o seguidor vendeu a tempo. Queda, alta, dividendo — alerta instantâneo.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: chat mockup as phone frame -->
          <div class="wl-reveal lg:w-3/5" style="transition-delay: 150ms;">
            <div class="relative mx-auto max-w-md lg:max-w-none">
              <!-- Phone frame -->
              <div class="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0a0a0f] shadow-2xl shadow-blue-400/5">

                <!-- Status bar -->
                <div class="flex items-center justify-between px-5 py-2 bg-white/[0.02]">
                  <span class="text-[10px] font-semibold text-white/30">9:41</span>
                  <div class="flex items-center gap-1.5">
                    <UIcon name="i-lucide-signal" class="h-3 w-3 text-white/30" />
                    <UIcon name="i-lucide-wifi" class="h-3 w-3 text-white/30" />
                    <UIcon name="i-lucide-battery-full" class="h-3 w-3 text-white/30" />
                  </div>
                </div>

                <!-- Push notification banner — slides in -->
                <div class="mx-3 mt-1.5 mb-1 animate-[wl-slide-down_0.5s_ease-out_1.5s_both] rounded-2xl bg-white/[0.08] backdrop-blur-xl p-3 ring-1 ring-white/[0.06]">
                  <div class="flex items-start gap-2.5">
                    <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-500/20">
                      <UIcon name="i-lucide-trending-down" class="h-4 w-4 text-red-400" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between">
                        <p class="text-[11px] font-bold text-white/70">Alerta de Preço</p>
                        <span class="text-[9px] text-white/25">agora</span>
                      </div>
                      <p class="text-[11px] text-white/50 mt-0.5">
                        <span class="font-semibold text-red-400">PETR4 caiu 3.2%</span> — abaixo do seu alerta de R$ 37.00
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Chat header -->
                <div class="flex items-center gap-3 border-b border-white/[0.06] px-5 py-3">
                  <UIcon name="i-lucide-chevron-left" class="h-5 w-5 text-blue-400" />
                  <div class="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-500">
                    <img src="/brand/logo-icon.svg" alt="Redentia" class="h-5 w-5" />
                    <div class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0a0a0f] bg-emerald-400" />
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-bold">Redentia IA</p>
                    <p class="text-[10px] text-emerald-400">Online agora</p>
                  </div>
                  <UIcon name="i-lucide-phone" class="h-4 w-4 text-white/20" />
                  <UIcon name="i-lucide-more-vertical" class="h-4 w-4 text-white/20" />
                </div>

                <!-- Messages -->
                <div class="flex flex-col gap-3 px-4 py-5" style="min-height: 420px;">
                  <!-- Timestamp -->
                  <div class="text-center">
                    <span class="text-[10px] text-white/15">Hoje, 14:32</span>
                  </div>

                  <!-- User message 1 -->
                  <div class="flex justify-end">
                    <div class="max-w-[75%] rounded-2xl rounded-br-sm bg-blue-400 px-4 py-2.5">
                      <p class="text-sm font-medium text-black">Qual FII tem o melhor DY neste mês?</p>
                    </div>
                  </div>

                  <!-- Bot reply 1 -->
                  <div class="flex gap-2.5">
                    <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-400/15 mt-1">
                      <img src="/brand/logo-icon.svg" alt="R" class="h-3.5 w-3.5" />
                    </div>
                    <div class="max-w-[80%] flex flex-col gap-2">
                      <div class="rounded-2xl rounded-tl-sm bg-white/[0.06] px-4 py-3">
                        <p class="text-[13px] leading-relaxed text-white/80">
                          Olha, o <span class="font-semibold text-blue-400">MXRF11</span> tá com DY de 1.08% esse mês, mas olha o
                          <span class="font-semibold text-blue-400">HGLG11</span> que tá pagando 0.95% com muito mais estabilidade.
                        </p>
                        <p class="mt-2 text-[13px] leading-relaxed text-white/50">
                          DY alto sozinho não é tudo — olha vacância, P/VP e consistência.
                        </p>
                      </div>
                      <!-- Inline data cards -->
                      <div class="flex gap-1.5 overflow-x-auto pb-1">
                        <div class="shrink-0 rounded-xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/[0.06]">
                          <p class="text-[10px] text-white/30">MXRF11</p>
                          <p class="text-sm font-bold text-blue-400 tabular-nums">1.08%</p>
                        </div>
                        <div class="shrink-0 rounded-xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/[0.06]">
                          <p class="text-[10px] text-white/30">HGLG11</p>
                          <p class="text-sm font-bold text-blue-400 tabular-nums">0.95%</p>
                        </div>
                        <div class="shrink-0 rounded-xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/[0.06]">
                          <p class="text-[10px] text-white/30">XPML11</p>
                          <p class="text-sm font-bold text-blue-400 tabular-nums">0.87%</p>
                        </div>
                      </div>
                      <span class="text-[10px] text-white/15">14:32</span>
                    </div>
                  </div>

                  <!-- User message 2 -->
                  <div class="flex justify-end">
                    <div class="max-w-[75%] rounded-2xl rounded-br-sm bg-blue-400 px-4 py-2.5">
                      <p class="text-sm font-medium text-black">E PETR4, vale a pena?</p>
                    </div>
                  </div>

                  <!-- Bot reply 2 -->
                  <div class="flex gap-2.5">
                    <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-400/15 mt-1">
                      <img src="/brand/logo-icon.svg" alt="R" class="h-3.5 w-3.5" />
                    </div>
                    <div class="max-w-[80%] flex flex-col gap-2">
                      <div class="rounded-2xl rounded-tl-sm bg-white/[0.06] px-4 py-3">
                        <p class="text-[13px] leading-relaxed text-white/80">
                          Momento interessante. Vamos aos números:
                        </p>
                        <!-- Ticker card inline -->
                        <div class="mt-3 rounded-lg bg-white/[0.04] p-3 ring-1 ring-white/[0.06]">
                          <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center gap-2">
                              <div class="h-6 w-6 rounded-md bg-emerald-500/15 flex items-center justify-center">
                                <span class="text-[8px] font-bold text-emerald-400">PE</span>
                              </div>
                              <span class="text-xs font-bold">PETR4</span>
                            </div>
                            <span class="text-xs font-bold text-emerald-400">R$ 38.72</span>
                          </div>
                          <div class="grid grid-cols-3 gap-2">
                            <div class="rounded-md bg-white/[0.03] p-1.5 text-center">
                              <p class="text-[8px] text-white/25">P/L</p>
                              <p class="text-[11px] font-bold tabular-nums">4.2</p>
                            </div>
                            <div class="rounded-md bg-blue-400/[0.06] p-1.5 text-center">
                              <p class="text-[8px] text-blue-400/50">DY</p>
                              <p class="text-[11px] font-bold text-blue-400 tabular-nums">14.8%</p>
                            </div>
                            <div class="rounded-md bg-white/[0.03] p-1.5 text-center">
                              <p class="text-[8px] text-white/25">P/VP</p>
                              <p class="text-[11px] font-bold tabular-nums">1.3</p>
                            </div>
                          </div>
                        </div>
                        <p class="mt-2 text-[13px] leading-relaxed text-white/50">
                          P/L baixo, DY gordo. Mas é cíclica — nunca coloque tudo em uma só.
                        </p>
                      </div>
                      <span class="text-[10px] text-white/15">14:33</span>
                    </div>
                  </div>
                </div>

                <!-- Input bar -->
                <div class="border-t border-white/[0.06] px-4 py-3 bg-white/[0.02]">
                  <div class="flex items-center gap-3">
                    <UIcon name="i-lucide-plus-circle" class="h-5 w-5 text-white/15 shrink-0" />
                    <div class="flex-1 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-2.5">
                      <span class="text-sm text-white/20">Pergunte sobre qualquer ativo...</span>
                    </div>
                    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-400">
                      <UIcon name="i-lucide-arrow-up" class="h-4 w-4 text-black" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Floating alert cards — desktop only -->
              <div class="hidden lg:flex absolute bottom-24 -left-16 items-center gap-2.5 rounded-2xl bg-white/[0.05] backdrop-blur-xl px-3.5 py-2.5 ring-1 ring-white/[0.08] shadow-xl -rotate-2 animate-[wl-notif-float_7s_ease-in-out_infinite_2s] z-20">
                <div class="h-8 w-8 shrink-0 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <UIcon name="i-lucide-trending-up" class="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div>
                  <p class="text-[11px] font-bold text-emerald-400">VALE3 +5.1%</p>
                  <p class="text-[10px] text-white/30">Meta de R$ 68.50 atingida</p>
                </div>
              </div>

              <div class="hidden lg:flex absolute top-28 -left-12 items-center gap-2.5 rounded-2xl bg-white/[0.05] backdrop-blur-xl px-3.5 py-2.5 ring-1 ring-white/[0.08] shadow-xl -rotate-1 animate-[wl-notif-float_5s_ease-in-out_infinite_1s] z-20">
                <div class="h-8 w-8 shrink-0 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <UIcon name="i-lucide-coins" class="h-3.5 w-3.5 text-blue-400" />
                </div>
                <div>
                  <p class="text-[11px] font-bold text-blue-400">MXRF11</p>
                  <p class="text-[10px] text-white/30">Dividendo R$ 0.10 creditado</p>
                </div>
              </div>

              <!-- Floating glow behind phone -->
              <div class="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-blue-400/[0.03] blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== COMO FUNCIONA ========== -->
    <section class="relative border-t border-white/[0.04] px-6 py-24 md:py-32 overflow-hidden">
      <div class="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-400/[0.03] blur-[160px]" />

      <div class="relative mx-auto max-w-4xl">
        <div class="wl-reveal mb-20 text-center">
          <div class="mb-5 inline-flex items-center gap-3 rounded-full border border-blue-400/15 bg-blue-400/[0.06] px-4 py-2">
            <UIcon name="i-lucide-sparkles" class="h-3.5 w-3.5 text-blue-400" />
            <span class="text-xs font-bold uppercase tracking-widest text-blue-400">Como funciona</span>
          </div>
          <h2 class="mb-5 text-3xl font-bold tracking-tight md:text-5xl">Do link do YouTube<br /><span class="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">ao primeiro faturamento</span></h2>
          <p class="mx-auto max-w-md text-base text-white/40">3 minutos. Zero código. A IA faz tudo.</p>
        </div>

        <!-- Vertical timeline -->
        <div class="relative">
          <!-- Timeline line -->
          <div class="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-400/30 via-blue-400/15 to-emerald-400/30 md:-translate-x-px" />

          <!-- Step 1 -->
          <div class="wl-reveal relative flex flex-col md:flex-row md:items-center gap-6 md:gap-12 mb-16 md:mb-20">
            <!-- Timeline dot -->
            <div class="absolute left-6 md:left-1/2 top-0 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-10">
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-400 text-lg font-black text-black shadow-lg shadow-blue-400/20">1</div>
            </div>

            <!-- Left: text -->
            <div class="pl-16 md:pl-0 md:w-1/2 md:pr-16 md:text-right">
              <h3 class="text-xl font-bold mb-2">Cole o link do YouTube</h3>
              <p class="text-sm text-white/35 leading-relaxed">A IA assiste seus vídeos, extrai seu tom de voz, identifica cores e estilo — e gera sua plataforma completa em minutos.</p>
            </div>

            <!-- Right: visual -->
            <div class="pl-16 md:pl-16 md:w-1/2">
              <div class="rounded-2xl border border-white/[0.06] bg-[#0a0a0f] p-5 max-w-xs" style="box-shadow: 0 0 40px rgba(96,165,250,0.04);">
                <div class="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3 mb-4">
                  <UIcon name="i-lucide-youtube" class="h-5 w-5 text-red-400" />
                  <span class="text-sm text-white/40">youtube.com/<span class="text-white/70 font-medium">@seucanal</span></span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="h-1.5 flex-1 rounded-full bg-white/[0.04] overflow-hidden">
                    <div class="h-full w-[85%] rounded-full bg-gradient-to-r from-blue-400/50 to-blue-400 animate-pulse" />
                  </div>
                  <span class="text-[10px] font-bold text-blue-400 tabular-nums">85%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="wl-reveal relative flex flex-col md:flex-row-reverse md:items-center gap-6 md:gap-12 mb-16 md:mb-20">
            <!-- Timeline dot -->
            <div class="absolute left-6 md:left-1/2 top-0 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-10">
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white/15 bg-white/[0.05] text-lg font-black text-white/60">2</div>
            </div>

            <!-- Right (reversed): text -->
            <div class="pl-16 md:pl-0 md:w-1/2 md:pl-16">
              <h3 class="text-xl font-bold mb-2">Ajuste o que quiser</h3>
              <p class="text-sm text-white/35 leading-relaxed">Revise cores, fonte, funcionalidades e conteúdo. Quando estiver perfeito, manda lançar.</p>
            </div>

            <!-- Left (reversed): visual -->
            <div class="pl-16 md:pl-0 md:w-1/2 md:pr-16 md:flex md:justify-end">
              <div class="rounded-2xl border border-white/[0.06] bg-[#0a0a0f] p-5 max-w-xs" style="box-shadow: 0 0 40px rgba(96,165,250,0.04);">
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] text-white/35">Cores</span>
                    <div class="flex gap-1.5">
                      <div class="h-6 w-6 rounded-lg bg-[#4ADE80] ring-1 ring-white/10" />
                      <div class="h-6 w-6 rounded-lg bg-[#0a0a0f] ring-1 ring-white/10" />
                      <div class="h-6 w-6 rounded-lg bg-white ring-1 ring-white/10" />
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] text-white/35">Fonte</span>
                    <span class="text-[11px] font-bold text-white/60">Montserrat Bold</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] text-white/35">Tom</span>
                    <span class="text-[11px] text-white/45">Direto, motivacional</span>
                  </div>
                </div>
                <div class="mt-4 flex gap-2">
                  <div class="flex-1 rounded-lg bg-white/[0.04] py-2 text-center text-[10px] text-white/30">Editar</div>
                  <div class="flex-1 rounded-lg bg-blue-400 py-2 text-center text-[10px] font-bold text-black">Lançar</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="wl-reveal relative flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
            <!-- Timeline dot -->
            <div class="absolute left-6 md:left-1/2 top-0 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-10">
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-lg font-black text-black shadow-lg shadow-emerald-400/20">3</div>
            </div>

            <!-- Left: text -->
            <div class="pl-16 md:pl-0 md:w-1/2 md:pr-16 md:text-right">
              <h3 class="text-xl font-bold mb-2">Fature</h3>
              <p class="text-sm text-white/35 leading-relaxed">Sua plataforma no ar, com seu domínio. Seguidores assinam e a receita cai direto na sua conta.</p>
            </div>

            <!-- Right: visual -->
            <div class="pl-16 md:pl-16 md:w-1/2">
              <div class="rounded-2xl border border-emerald-400/10 bg-[#0a0a0f] p-5 max-w-xs" style="box-shadow: 0 0 40px rgba(52,211,153,0.06);">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-[10px] text-white/25 uppercase tracking-wider">Receita do mês</span>
                  <span class="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                    <span class="relative flex h-1.5 w-1.5"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" /></span>
                    LIVE
                  </span>
                </div>
                <p class="text-3xl font-black text-emerald-400 tabular-nums mb-1">R$ 39.800</p>
                <p class="text-[11px] text-white/30">+2.000 assinantes ativos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== PRICING ========== -->
    <section class="relative border-t border-white/[0.04] px-6 py-20 md:py-28 overflow-hidden">
      <div class="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-400/[0.04] blur-[200px]" />

      <div class="relative mx-auto max-w-5xl">
        <div class="wl-reveal mb-14 text-center">
          <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span class="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
            </span>
            <span class="text-xs font-bold uppercase tracking-widest text-amber-400">{{ earlyAdopterSpots }} vagas com preço de lançamento</span>
          </div>
          <h2 class="mb-4 text-3xl font-bold tracking-tight md:text-5xl">Escolha seu plano</h2>
          <p class="mx-auto max-w-md text-base text-white/40">100k seguidores × 2% conversão × R$ 19,90 = <span class="font-bold text-emerald-400">R$ 39.800/mês</span></p>
        </div>

        <div class="wl-reveal grid gap-5 md:grid-cols-3 items-start">
          <!-- Starter -->
          <div class="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0f] p-7 transition-all duration-300 hover:border-white/10">
            <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">Starter</p>
            <div class="mb-1 flex items-baseline gap-2">
              <span class="text-base text-white/25 line-through">R$ 3.497</span>
              <span class="text-4xl font-extrabold">R$ 2.497</span>
              <span class="text-sm text-white/30">/mês</span>
            </div>
            <p class="mb-6 text-xs text-white/30">~ R$ 83/dia</p>
            <ul class="mb-8 space-y-3">
              <li v-for="f in pricingPlans[0].features" :key="f" class="flex items-start gap-2.5 text-sm text-white/50">
                <UIcon name="i-lucide-check" class="mt-0.5 h-4 w-4 shrink-0 text-blue-400/60" />
                <span>{{ f }}</span>
              </li>
            </ul>
            <button class="block w-full rounded-xl border border-white/10 bg-white/5 py-3.5 text-center text-sm font-semibold text-white/70 transition-all hover:bg-white/10 hover:text-white cursor-pointer" @click="openContactModal">
              Começar agora
            </button>
          </div>

          <!-- Pro (highlighted) -->
          <div class="relative overflow-hidden rounded-2xl border border-blue-400/30 bg-[#0a0a0f] p-7 shadow-lg shadow-blue-400/5 md:-mt-3 md:mb-[-12px]">
            <div class="absolute right-4 top-4 rounded-full bg-blue-400 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black">Mais escolhido</div>
            <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-400">Pro</p>
            <div class="mb-1 flex items-baseline gap-2">
              <span class="text-base text-white/25 line-through">R$ 7.497</span>
              <span class="text-4xl font-extrabold">R$ 4.997</span>
              <span class="text-sm text-white/30">/mês</span>
            </div>
            <p class="mb-6 text-xs text-emerald-400 font-bold">ROI de 7x no primeiro mês</p>
            <ul class="mb-8 space-y-3">
              <li v-for="f in pricingPlans[1].features" :key="f" class="flex items-start gap-2.5 text-sm text-white/60">
                <UIcon name="i-lucide-check" class="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                <span>{{ f }}</span>
              </li>
            </ul>
            <button class="block w-full rounded-xl bg-blue-400 py-3.5 text-center text-sm font-bold text-black transition-all hover:bg-blue-300 hover:shadow-[0_0_30px_rgba(96,165,250,0.2)] cursor-pointer" @click="openContactModal">
              Começar agora
            </button>
          </div>

          <!-- Enterprise -->
          <div class="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0f] p-7 transition-all duration-300 hover:border-white/10">
            <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">Enterprise</p>
            <div class="mb-1 flex items-baseline gap-1">
              <span class="text-4xl font-extrabold">Custom</span>
            </div>
            <p class="mb-6 text-xs text-white/30">Para operações de grande escala</p>
            <ul class="mb-8 space-y-3">
              <li v-for="f in pricingPlans[2].features" :key="f" class="flex items-start gap-2.5 text-sm text-white/50">
                <UIcon name="i-lucide-check" class="mt-0.5 h-4 w-4 shrink-0 text-blue-400/60" />
                <span>{{ f }}</span>
              </li>
            </ul>
            <button class="block w-full rounded-xl border border-white/10 bg-white/5 py-3.5 text-center text-sm font-semibold text-white/70 transition-all hover:bg-white/10 hover:text-white cursor-pointer" @click="openContactModal">
              Falar com a equipe
            </button>
          </div>
        </div>

        <div class="wl-reveal mt-8 text-center">
          <p class="text-xs text-white/30">Após as {{ earlyAdopterSpots }} vagas, os preços sobem para a tabela cheia.</p>
        </div>
      </div>
    </section>

    <!-- ========== FAQ ========== -->
    <section class="relative border-t border-white/[0.04] px-6 py-20 md:py-28">
      <div class="pointer-events-none absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-blue-400/5 blur-[140px]" />

      <div class="relative mx-auto max-w-3xl">
        <div class="wl-reveal mb-12 text-center">
          <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-400">Dúvidas frequentes</p>
          <h2 class="mb-4 text-3xl font-bold tracking-tight md:text-5xl">Perguntas & Respostas</h2>
        </div>

        <div class="wl-reveal space-y-3">
          <div
            v-for="(faq, fIdx) in faqs"
            :key="fIdx"
            class="group overflow-hidden rounded-2xl border transition-all duration-300"
            :class="openFaq === fIdx ? 'border-blue-400/20 bg-blue-400/[0.03]' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10'"
          >
            <button
              class="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              @click="openFaq = openFaq === fIdx ? -1 : fIdx"
            >
              <span class="text-sm font-semibold md:text-base" :class="openFaq === fIdx ? 'text-white' : 'text-white/70'">{{ faq.q }}</span>
              <UIcon
                name="i-lucide-chevron-down"
                class="h-5 w-5 shrink-0 transition-transform duration-300"
                :class="openFaq === fIdx ? 'rotate-180 text-blue-400' : 'text-white/20'"
              />
            </button>
            <div
              class="grid transition-all duration-300"
              :style="{ gridTemplateRows: openFaq === fIdx ? '1fr' : '0fr' }"
            >
              <div class="overflow-hidden">
                <p class="px-6 pb-5 text-sm leading-relaxed text-white/40">{{ faq.a }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== CTA FINAL ========== -->
    <section id="cta" class="relative border-t border-white/[0.04] px-6 py-24 md:py-36">
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div class="wl-orb wl-orb-1 absolute left-1/3 bottom-0 h-[500px] w-[500px] rounded-full bg-blue-400/8 blur-[150px]" />
        <div class="wl-orb wl-orb-2 absolute right-1/3 bottom-1/4 h-[400px] w-[400px] rounded-full bg-blue-300/5 blur-[120px]" />
      </div>

      <div class="relative mx-auto max-w-3xl text-center">
        <div class="wl-reveal mb-8 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2">
          <UIcon name="i-lucide-zap" class="h-4 w-4 text-blue-400" />
          <span class="text-xs font-semibold text-blue-400">Setup em minutos, não meses</span>
        </div>

        <h2 class="wl-reveal mb-5 text-4xl font-bold tracking-tight md:text-6xl">Seus seguidores merecem<br /><span class="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">uma plataforma à sua altura</span></h2>
        <p class="wl-reveal mb-6 text-lg text-white/40 max-w-xl mx-auto">Enquanto você cria conteúdo, sua plataforma gera receita recorrente, fortalece sua marca e educa seu público.</p>

        <!-- Value props -->
        <div class="wl-reveal mb-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/50">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-trending-up" class="h-4 w-4 text-emerald-400" />
            <span>Receita recorrente</span>
          </div>
          <div class="h-4 w-px bg-white/10" />
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-shield-check" class="h-4 w-4 text-blue-400" />
            <span>Sua marca, seu domínio</span>
          </div>
          <div class="h-4 w-px bg-white/10" />
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-clock" class="h-4 w-4 text-amber-400" />
            <span>Zero trabalho técnico</span>
          </div>
        </div>

        <div class="wl-reveal mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
          <div class="relative flex-1">
            <UIcon name="i-lucide-youtube" class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/25" />
            <input
              v-model="youtubeUrlBottom"
              type="text"
              placeholder="youtube.com/@seucanal"
              class="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/30 transition-all duration-300 focus:border-blue-400/50 focus:bg-white/8 focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:shadow-[0_0_40px_rgba(96,165,250,0.08)]"
            />
          </div>
          <button
            class="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-blue-400 px-7 py-4 text-sm font-bold text-black transition-all hover:bg-blue-300 hover:shadow-[0_0_40px_rgba(96,165,250,0.3)] hover:scale-[1.02] active:scale-[0.98]"
            @click="openContactModal"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/20 to-blue-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <UIcon name="i-lucide-wand-2" class="relative h-4 w-4" />
            <span class="relative">Gerar minha plataforma</span>
          </button>
        </div>

        <p class="wl-reveal mt-6 text-xs text-white/20">Sem cartão de crédito. Sem compromisso. Veja o resultado antes de pagar.</p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-white/[0.04] px-6 py-12 md:py-16">
      <div class="mx-auto max-w-6xl">
        <div class="grid gap-10 sm:grid-cols-2 md:grid-cols-4 mb-12">
          <!-- Brand -->
          <div class="sm:col-span-2 md:col-span-1">
            <img src="/brand/logo-full.svg" alt="Redentia" class="mb-4 h-6 opacity-60" />
            <p class="text-sm text-white/25 leading-relaxed max-w-xs">A plataforma white-label de investimentos para criadores de conteúdo.</p>
          </div>

          <!-- Produto -->
          <div>
            <p class="mb-4 text-xs font-semibold uppercase tracking-widest text-white/30">Produto</p>
            <ul class="space-y-2.5">
              <li><button class="text-sm text-white/25 transition-colors hover:text-white/60" @click="scrollTo('showcase')">Cases reais</button></li>
              <li><button class="text-sm text-white/25 transition-colors hover:text-white/60" @click="openContactModal">Gerar plataforma</button></li>
              <li><button class="text-sm text-white/25 transition-colors hover:text-white/60" @click="openContactModal">Fale conosco</button></li>
            </ul>
          </div>

          <!-- Legal -->
          <div>
            <p class="mb-4 text-xs font-semibold uppercase tracking-widest text-white/30">Legal</p>
            <ul class="space-y-2.5">
              <li><NuxtLink to="/institucional/terms" class="text-sm text-white/25 transition-colors hover:text-white/60">Termos de Uso</NuxtLink></li>
              <li><NuxtLink to="/institucional/privacy" class="text-sm text-white/25 transition-colors hover:text-white/60">Privacidade</NuxtLink></li>
            </ul>
          </div>

          <!-- Contato -->
          <div>
            <p class="mb-4 text-xs font-semibold uppercase tracking-widest text-white/30">Contato</p>
            <ul class="space-y-2.5">
              <li><button class="text-sm text-white/25 transition-colors hover:text-white/60" @click="openContactModal">contato@redentia.com.br</button></li>
              <li>
                <div class="flex items-center gap-3 mt-3">
                  <a href="https://instagram.com/redentia" target="_blank" class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-white/25 transition-all hover:bg-white/[0.08] hover:text-white/60">
                    <UIcon name="i-lucide-instagram" class="h-4 w-4" />
                  </a>
                  <a href="https://linkedin.com/company/redentia" target="_blank" class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-white/25 transition-all hover:bg-white/[0.08] hover:text-white/60">
                    <UIcon name="i-lucide-linkedin" class="h-4 w-4" />
                  </a>
                  <a href="https://twitter.com/redentia" target="_blank" class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-white/25 transition-all hover:bg-white/[0.08] hover:text-white/60">
                    <UIcon name="i-lucide-twitter" class="h-4 w-4" />
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom bar -->
        <div class="flex flex-col items-center justify-between gap-4 border-t border-white/[0.04] pt-8 sm:flex-row">
          <p class="text-xs text-white/15">&copy; {{ new Date().getFullYear() }} Redentia. Todos os direitos reservados.</p>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5">
              <UIcon name="i-lucide-shield-check" class="h-3 w-3 text-emerald-400/60" />
              <span class="text-[10px] text-white/25">SSL Seguro</span>
            </div>
            <div class="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5">
              <UIcon name="i-lucide-lock" class="h-3 w-3 text-blue-400/60" />
              <span class="text-[10px] text-white/25">LGPD Compliance</span>
            </div>
          </div>
        </div>
      </div>
    </footer>

    <!-- ========== CONTACT MODAL ========== -->
    <Teleport to="body">
      <Transition name="wl-modal">
        <div v-if="showContactModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/80 backdrop-blur-md" @click="showContactModal = false" />

          <!-- Modal -->
          <div class="relative w-full max-w-[560px] overflow-hidden rounded-3xl border border-white/[0.08] bg-[#08080d]">
            <!-- Ambient glow -->
            <div class="pointer-events-none absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-400/[0.07] blur-[100px]" />
            <div class="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-b from-blue-400/15 via-transparent to-transparent" />

            <!-- Close -->
            <button class="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-white/50 transition-all hover:bg-white/10 hover:text-white" @click="showContactModal = false">
              <UIcon name="i-lucide-x" class="h-4 w-4" />
            </button>

            <!-- Step 1: Value prop + YouTube (hero input) -->
            <div v-if="modalStep === 0" class="relative">
              <!-- Header with outcome focus -->
              <div class="px-8 pt-10 pb-2 text-center">
                <div class="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-400/10 ring-1 ring-blue-400/15">
                  <UIcon name="i-lucide-rocket" class="h-6 w-6 text-blue-400" />
                </div>
                <h3 class="text-2xl font-extrabold tracking-tight">Transforme seguidores em receita</h3>
                <p class="mt-2 text-sm text-white/50 max-w-xs mx-auto">Cole seu canal. A IA faz o resto. Você vê o resultado antes de pagar.</p>
              </div>

              <!-- What they get — ROI focus (Primo thinks in numbers) -->
              <div class="mx-8 mt-5 grid grid-cols-3 gap-3">
                <div class="rounded-xl bg-white/[0.03] p-3 text-center ring-1 ring-white/[0.04]">
                  <p class="text-lg font-extrabold text-blue-400">5 min</p>
                  <p class="text-[10px] text-white/40 mt-0.5">Para ficar pronta</p>
                </div>
                <div class="rounded-xl bg-white/[0.03] p-3 text-center ring-1 ring-white/[0.04]">
                  <p class="text-lg font-extrabold text-emerald-400">R$ 0</p>
                  <p class="text-[10px] text-white/40 mt-0.5">Custo de dev</p>
                </div>
                <div class="rounded-xl bg-white/[0.03] p-3 text-center ring-1 ring-white/[0.04]">
                  <p class="text-lg font-extrabold text-amber-400">100%</p>
                  <p class="text-[10px] text-white/40 mt-0.5">Sua marca</p>
                </div>
              </div>

              <!-- YouTube input — THE hero -->
              <div class="px-8 mt-6">
                <div class="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] transition-all duration-300 focus-within:border-red-400/30 focus-within:bg-white/[0.05] focus-within:shadow-[0_0_30px_rgba(248,113,113,0.06)]">
                  <div class="flex items-center gap-3 px-5 py-4">
                    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 ring-1 ring-red-400/10">
                      <UIcon name="i-lucide-youtube" class="h-5 w-5 text-red-400/60" />
                    </div>
                    <input v-model="contactForm.youtube" type="text" placeholder="youtube.com/@seucanal" class="w-full bg-transparent text-[15px] text-white placeholder:text-white/30 focus:outline-none" />
                  </div>
                </div>
              </div>

              <!-- CTA -->
              <div class="px-8 mt-4 pb-8">
                <button
                  class="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-blue-400 py-4 text-sm font-bold text-black transition-all hover:bg-blue-300 hover:shadow-[0_0_40px_rgba(96,165,250,0.25)] hover:scale-[1.01] active:scale-[0.99]"
                  @click="modalStep = 1"
                >
                  <div class="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/25 to-blue-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span class="relative">Continuar</span>
                  <UIcon name="i-lucide-arrow-right" class="relative h-4 w-4" />
                </button>
                <p class="mt-3 text-center text-[11px] text-white/30">Sem cartão. Sem compromisso.</p>
              </div>
            </div>

            <!-- Step 2: Contact details (minimal friction) -->
            <div v-else class="relative">
              <div class="px-8 pt-8 pb-2">
                <!-- Back button + progress -->
                <div class="relative flex items-center mb-6">
                  <button class="flex items-center gap-1.5 text-xs text-white/50 transition-colors hover:text-white/80" @click="modalStep = 0">
                    <UIcon name="i-lucide-arrow-left" class="h-3.5 w-3.5" />
                    Voltar
                  </button>
                  <div class="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    <div class="h-1 w-6 rounded-full bg-blue-400" />
                    <div class="h-1 w-6 rounded-full bg-blue-400" />
                  </div>
                </div>

                <h3 class="relative text-xl font-extrabold tracking-tight text-white">Quase lá. Onde te encontramos?</h3>
                <p class="mt-1 text-sm text-white/45">Só precisamos do básico para agendar sua demo.</p>
              </div>

              <div class="space-y-3 px-8 pt-4 pb-8">
                <!-- Name -->
                <div class="group">
                  <div class="relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] transition-all duration-300 focus-within:border-blue-400/30 focus-within:bg-white/[0.05]">
                    <div class="flex items-center gap-3 px-4 py-3.5">
                      <UIcon name="i-lucide-user" class="h-4 w-4 shrink-0 text-white/30 transition-colors group-focus-within:text-blue-400/60" />
                      <input v-model="contactForm.name" type="text" placeholder="Seu nome" class="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none" />
                    </div>
                  </div>
                </div>

                <!-- Email -->
                <div class="group">
                  <div class="relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] transition-all duration-300 focus-within:border-blue-400/30 focus-within:bg-white/[0.05]">
                    <div class="flex items-center gap-3 px-4 py-3.5">
                      <UIcon name="i-lucide-mail" class="h-4 w-4 shrink-0 text-white/30 transition-colors group-focus-within:text-blue-400/60" />
                      <input v-model="contactForm.email" type="email" placeholder="seu@email.com" class="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none" />
                    </div>
                  </div>
                </div>

                <!-- WhatsApp (Primo values speed — WhatsApp > email for closing) -->
                <div class="group">
                  <div class="relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] transition-all duration-300 focus-within:border-emerald-400/30 focus-within:bg-white/[0.05]">
                    <div class="flex items-center gap-3 px-4 py-3.5">
                      <UIcon name="i-lucide-phone" class="h-4 w-4 shrink-0 text-white/30 transition-colors group-focus-within:text-emerald-400/60" />
                      <input v-model="contactForm.whatsapp" type="tel" placeholder="WhatsApp (11) 99999-9999" class="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none" />
                    </div>
                  </div>
                </div>

                <!-- Audience size (qualifies the lead — Primo thinks in scale) -->
                <div class="group">
                  <div class="relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] transition-all duration-300 focus-within:border-blue-400/30 focus-within:bg-white/[0.05]">
                    <div class="flex items-center gap-3 px-4 py-3.5">
                      <UIcon name="i-lucide-users" class="h-4 w-4 shrink-0 text-white/30 transition-colors group-focus-within:text-blue-400/60" />
                      <select v-model="contactForm.audience" class="w-full appearance-none bg-transparent text-sm text-white/70 focus:outline-none [&>option]:bg-[#0a0a0f] [&>option]:text-white">
                        <option value="" disabled class="text-white/30">Tamanho da sua audiência</option>
                        <option value="< 50k">&lt; 50 mil seguidores</option>
                        <option value="50k-200k">50 mil — 200 mil</option>
                        <option value="200k-1M">200 mil — 1 milhão</option>
                        <option value="1M+">1 milhão+</option>
                      </select>
                      <UIcon name="i-lucide-chevron-down" class="h-3.5 w-3.5 shrink-0 text-white/30" />
                    </div>
                  </div>
                </div>

                <!-- Submit -->
                <button
                  class="group relative mt-2 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-blue-400 py-4 text-sm font-bold text-black transition-all hover:bg-blue-300 hover:shadow-[0_0_40px_rgba(96,165,250,0.25)] hover:scale-[1.01] active:scale-[0.99]"
                  @click="submitContact"
                >
                  <div class="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/25 to-blue-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <UIcon name="i-lucide-wand-2" class="relative h-4 w-4" />
                  <span class="relative">Gerar minha plataforma</span>
                </button>

                <!-- Trust — results-oriented (not "we're nice") -->
                <div class="flex items-center justify-center gap-5 pt-2">
                  <div class="flex items-center gap-1.5">
                    <UIcon name="i-lucide-zap" class="h-3 w-3 text-amber-400/60" />
                    <span class="text-[10px] text-white/35">Demo em 24h</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <UIcon name="i-lucide-lock" class="h-3 w-3 text-blue-400/50" />
                    <span class="text-[10px] text-white/35">Sem compromisso</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <UIcon name="i-lucide-trending-up" class="h-3 w-3 text-emerald-400/50" />
                    <span class="text-[10px] text-white/35">ROI do dia 1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const youtubeUrl = ref('')
const youtubeUrlBottom = ref('')

definePageMeta({
  layout: false,
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

useHead({
  title: 'Redentia — Cole seu YouTube, receba sua plataforma de investimentos',
  meta: [
    { name: 'description', content: 'Nossa IA analisa seu canal do YouTube e gera uma plataforma de investimentos completa com sua marca, tom de voz e features personalizadas. Em minutos.' },
  ],
  link: [
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' },
  ],
  htmlAttrs: { class: 'dark' },
  bodyAttrs: { style: 'font-family: Inter, sans-serif;' },
})

const showContactModal = ref(false)
const modalStep = ref(0)
const contactForm = reactive({ name: '', email: '', youtube: '', whatsapp: '', audience: '' })

function openContactModal() {
  const url = youtubeUrl.value || youtubeUrlBottom.value
  if (url) contactForm.youtube = url
  modalStep.value = 0
  showContactModal.value = true
}

function submitContact() {
  // TODO: integrate with API
  showContactModal.value = false
  modalStep.value = 0
  contactForm.name = ''
  contactForm.email = ''
  contactForm.youtube = ''
  contactForm.whatsapp = ''
  contactForm.audience = ''
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

// ── Scroll reveal with IntersectionObserver ──
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('wl-visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  )

  document.querySelectorAll('.wl-reveal').forEach((el) => observer.observe(el))
})

// ── Showcase carousel with auto-rotation ──
const CAROUSEL_INTERVAL = 6000
const activeShowcase = ref(0)
let autoRotateTimer: ReturnType<typeof setInterval> | null = null

function startAutoRotate() {
  stopAutoRotate()
  autoRotateTimer = setInterval(() => {
    activeShowcase.value = (activeShowcase.value + 1) % showcaseBrands.length
  }, CAROUSEL_INTERVAL)
}

function stopAutoRotate() {
  if (autoRotateTimer) {
    clearInterval(autoRotateTimer)
    autoRotateTimer = null
  }
}

function resetAutoRotate() {
  startAutoRotate()
}

onMounted(() => {
  startAutoRotate()
})

onUnmounted(() => {
  stopAutoRotate()
})

const aiToggleFeatures = [
  { label: 'Calculadoras', on: true },
  { label: 'Análise fundamentalista', on: true },
  { label: 'Carteira', on: true },
  { label: 'Simulador aposentadoria', on: false },
  { label: 'Glossário', on: true },
]

const showcaseBrands = [
  {
    name: 'Primo Rico',
    slug: 'primo-rico',
    font: 'Montserrat',
    style: 'Extrabold • Uppercase',
    heroVariant: 'Centered',
    bg: '#000000',
    accent: '#FF5900',
    colors: ['#FF5900', '#E55000', '#0A0A0A'],
    domain: 'invest.primorico.com.br',
  },
  {
    name: 'Me Poupe!',
    slug: 'me-poupe',
    font: 'Poppins',
    style: 'Black • Pop',
    heroVariant: 'Split',
    bg: '#1A0A2E',
    accent: '#FACC15',
    colors: ['#FACC15', '#EAB308', '#1A0A2E'],
    domain: 'app.mepoupe.com',
  },
  {
    name: 'Investidor Sardinha',
    slug: 'investidor-sardinha',
    font: 'Barlow',
    style: 'Bold • Técnico',
    heroVariant: 'Minimal',
    bg: '#FFFFFF',
    accent: '#DC2626',
    colors: ['#DC2626', '#B91C1C', '#F9FAFB'],
    domain: 'mercado.investidorsardinha.com.br',
  },
]

const platformFeatures = [
  { icon: 'i-lucide-trending-up', title: 'Cotações em tempo real', description: 'Ações, FIIs, ETFs, BDRs e Small Caps atualizados.' },
  { icon: 'i-lucide-bot', title: 'Assessor IA personalizado', description: 'Chatbot treinado com tom de voz do criador.' },
  { icon: 'i-lucide-calculator', title: '8 calculadoras financeiras', description: 'Juros compostos, preço teto, aposentadoria e mais.' },
  { icon: 'i-lucide-briefcase', title: 'Carteira inteligente', description: 'Importação Excel, rentabilidade e rebalanceamento.' },
  { icon: 'i-lucide-coins', title: 'Dividendos', description: 'Calendário, histórico e projeções de proventos.' },
  { icon: 'i-lucide-book-open', title: 'Glossário com 350+ termos', description: 'Conteúdo SEO que gera tráfego orgânico.' },
  { icon: 'i-lucide-graduation-cap', title: 'Guias educacionais', description: 'Artigos completos otimizados para Google.' },
  { icon: 'i-lucide-smartphone', title: 'PWA nativa', description: 'Funciona como app sem precisar de App Store.' },
  { icon: 'i-lucide-bar-chart-3', title: 'Dashboard de mercado', description: 'Ibovespa, câmbio, crypto e indicadores ao vivo.' },
]

const steps = [
  { title: 'Cole o link do seu YouTube', description: 'Nossa IA assiste seus vídeos, analisa thumbnails, cores, tipografia, bordões e como você fala com seu público. Em segundos ela entende sua marca.' },
  { title: 'Revisamos juntos', description: 'A IA gera: paleta de cores, fonte, tom de voz do chatbot, textos do site e quais features fazem sentido pro seu público. Você ajusta o que quiser.' },
  { title: 'Lançamento', description: 'Deploy com seu domínio customizado, PWA pronta, SEO configurado. Seus seguidores acessam e você monetiza desde o dia 1.' },
]

const openFaq = ref(0)

const faqs = [
  { q: 'Preciso saber programar?', a: 'Não. A IA faz todo o trabalho técnico — desde a análise do seu canal até o deploy da plataforma. Você só precisa colar o link do seu YouTube e revisar o resultado.' },
  { q: 'Quanto tempo leva para ficar pronta?', a: 'A IA gera a primeira versão em menos de 5 minutos. Após sua revisão e ajustes, o deploy é feito em segundos. Do zero ao ar em menos de uma hora.' },
  { q: 'Posso usar meu próprio domínio?', a: 'Sim. Nos planos Pro e Enterprise você conecta seu domínio customizado (ex: invest.seucanal.com.br) com SSL gratuito configurado automaticamente.' },
  { q: 'Como funciona a IA de assessoria?', a: 'O chatbot é treinado com seus vídeos, estilo de comunicação e tom de voz. Ele responde dúvidas de investimentos usando dados fundamentalistas reais da B3, sempre no seu jeito de falar.' },
  { q: 'Quais dados de mercado estão inclusos?', a: 'Cotações em tempo real de 800+ ativos: ações, FIIs, ETFs, BDRs e Small Caps. Além de indicadores fundamentalistas como P/L, DY, P/VP, margem líquida e mais.' },
  { q: 'Posso cancelar a qualquer momento?', a: 'Sim. Não existe fidelidade ou multa. Você pode cancelar seu plano a qualquer momento e sua plataforma fica no ar até o fim do período pago.' },
  { q: 'Meus seguidores precisam pagar para usar?', a: 'Você decide. A plataforma pode ser 100% gratuita para seus seguidores ou você pode ativar um modelo freemium com funcionalidades premium pagas — a receita vai direto para você.' },
]

const earlyAdopterSpots = ref(7)

const pricingPlans = [
  {
    features: [
      'Plataforma com sua marca',
      'Até 5.000 usuários',
      'Cotações em tempo real',
      'Chatbot IA básico',
    ],
  },
  {
    features: [
      'Tudo do Starter',
      'Usuários ilimitados',
      'Seu domínio + SSL',
      'IA com seu tom de voz',
      'Carteira + Dividendos',
      'Suporte prioritário',
    ],
  },
  {
    features: [
      'Tudo do Pro',
      'Features sob medida',
      'SLA dedicado',
      'Onboarding personalizado',
      'Gerente de conta exclusivo',
    ],
  },
]

// ── Real market data from API ──
const API = 'https://redentia-api.saraivada.com/api'

interface ApiAsset {
  ticker: string
  name: string
  market_price: number
  change_percent: number
  volume?: number
  market_cap?: number
  logo?: string
}

function unwrapApi<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload
  if (payload?.data && Array.isArray(payload.data)) return payload.data
  return []
}

// ── Fallback tickers per category ──
const fallbackStocks = [
  { symbol: 'PETR4', name: 'Petrobras PN', price: 38.72, change: 2.34, logo: 'https://icons.brapi.dev/icons/PETR4.svg' },
  { symbol: 'VALE3', name: 'Vale ON', price: 61.45, change: -1.18, logo: 'https://icons.brapi.dev/icons/VALE3.svg' },
  { symbol: 'ITUB4', name: 'Itaú Unibanco PN', price: 32.90, change: 0.85, logo: 'https://icons.brapi.dev/icons/ITUB4.svg' },
  { symbol: 'WEGE3', name: 'WEG ON', price: 44.15, change: 3.12, logo: 'https://icons.brapi.dev/icons/WEGE3.svg' },
  { symbol: 'BBAS3', name: 'Banco do Brasil ON', price: 28.33, change: 1.47, logo: 'https://icons.brapi.dev/icons/BBAS3.svg' },
  { symbol: 'ABEV3', name: 'Ambev ON', price: 13.22, change: -0.45, logo: 'https://icons.brapi.dev/icons/ABEV3.svg' },
  { symbol: 'RENT3', name: 'Localiza ON', price: 55.80, change: 2.08, logo: 'https://icons.brapi.dev/icons/RENT3.svg' },
  { symbol: 'MGLU3', name: 'Magazine Luiza ON', price: 12.65, change: -3.22, logo: 'https://icons.brapi.dev/icons/MGLU3.svg' },
  { symbol: 'BBDC4', name: 'Bradesco PN', price: 15.48, change: 0.92, logo: 'https://icons.brapi.dev/icons/BBDC4.svg' },
  { symbol: 'SUZB3', name: 'Suzano ON', price: 52.30, change: 1.65, logo: 'https://icons.brapi.dev/icons/SUZB3.svg' },
]
const fallbackFIIs = [
  { symbol: 'MXRF11', name: 'Maxi Renda', price: 10.89, change: 0.42, logo: 'https://icons.brapi.dev/icons/MXRF11.svg' },
  { symbol: 'HGLG11', name: 'CSHG Logística', price: 158.20, change: -0.31, logo: 'https://icons.brapi.dev/icons/HGLG11.svg' },
  { symbol: 'XPLG11', name: 'XP Log', price: 95.40, change: 1.15, logo: 'https://icons.brapi.dev/icons/XPLG11.svg' },
  { symbol: 'KNRI11', name: 'Kinea Renda', price: 133.50, change: 0.28, logo: 'https://icons.brapi.dev/icons/KNRI11.svg' },
  { symbol: 'VISC11', name: 'Vinci Shopping', price: 105.80, change: -0.67, logo: 'https://icons.brapi.dev/icons/VISC11.svg' },
  { symbol: 'HGBS11', name: 'Hedge Brasil Shopping', price: 198.30, change: 0.55, logo: 'https://icons.brapi.dev/icons/HGBS11.svg' },
  { symbol: 'BTLG11', name: 'BTG Logístico', price: 92.10, change: 1.22, logo: 'https://icons.brapi.dev/icons/BTLG11.svg' },
  { symbol: 'PVBI11', name: 'VBI Prime', price: 78.60, change: -0.18, logo: 'https://icons.brapi.dev/icons/PVBI11.svg' },
]
const fallbackETFs = [
  { symbol: 'BOVA11', name: 'iShares Ibovespa', price: 118.45, change: 1.08, logo: 'https://icons.brapi.dev/icons/BOVA11.svg' },
  { symbol: 'IVVB11', name: 'iShares S&P 500', price: 302.80, change: 2.15, logo: 'https://icons.brapi.dev/icons/IVVB11.svg' },
  { symbol: 'SMAL11', name: 'iShares Small Cap', price: 98.30, change: -1.42, logo: 'https://icons.brapi.dev/icons/SMAL11.svg' },
  { symbol: 'HASH11', name: 'Hashdex Crypto', price: 45.60, change: 4.33, logo: 'https://icons.brapi.dev/icons/HASH11.svg' },
  { symbol: 'XFIX11', name: 'XP IFIX', price: 9.85, change: 0.22, logo: 'https://icons.brapi.dev/icons/XFIX11.svg' },
  { symbol: 'NASD11', name: 'Trend Nasdaq', price: 15.20, change: 1.87, logo: 'https://icons.brapi.dev/icons/NASD11.svg' },
  { symbol: 'GOLD11', name: 'Trend Ouro', price: 12.40, change: 0.95, logo: 'https://icons.brapi.dev/icons/GOLD11.svg' },
  { symbol: 'DIVO11', name: 'It Now Dividendos', price: 72.30, change: -0.38, logo: 'https://icons.brapi.dev/icons/DIVO11.svg' },
]
const fallbackBDRs = [
  { symbol: 'AAPL34', name: 'Apple', price: 52.80, change: 1.45, logo: 'https://icons.brapi.dev/icons/AAPL34.svg' },
  { symbol: 'MSFT34', name: 'Microsoft', price: 78.30, change: 0.92, logo: 'https://icons.brapi.dev/icons/MSFT34.svg' },
  { symbol: 'AMZO34', name: 'Amazon', price: 45.10, change: -0.68, logo: 'https://icons.brapi.dev/icons/AMZO34.svg' },
  { symbol: 'GOGL34', name: 'Alphabet', price: 62.40, change: 2.13, logo: 'https://icons.brapi.dev/icons/GOGL34.svg' },
  { symbol: 'NVDC34', name: 'NVIDIA', price: 38.90, change: 3.55, logo: 'https://icons.brapi.dev/icons/NVDC34.svg' },
  { symbol: 'TSLA34', name: 'Tesla', price: 28.70, change: -2.10, logo: 'https://icons.brapi.dev/icons/TSLA34.svg' },
  { symbol: 'META34', name: 'Meta', price: 41.20, change: 1.78, logo: 'https://icons.brapi.dev/icons/META34.svg' },
  { symbol: 'NFLX34', name: 'Netflix', price: 22.50, change: 0.65, logo: 'https://icons.brapi.dev/icons/NFLX34.svg' },
]

// ── Fetch all categories ──
const { data: stocksTop } = await useAsyncData('wl-stocks-top', () =>
  $fetch<ApiAsset[]>(`${API}/top-stocks?side=top&volume=1000000`).catch(() => []),
  { server: true }
)
const { data: stocksBot } = await useAsyncData('wl-stocks-bot', () =>
  $fetch<ApiAsset[]>(`${API}/top-stocks?side=bottom&volume=1000000`).catch(() => []),
  { server: true }
)
const { data: fiisTop } = await useAsyncData('wl-fiis-top', () =>
  $fetch<ApiAsset[]>(`${API}/top-reits?side=top&volume=100000`).catch(() => []),
  { server: true }
)
const { data: fiisBot } = await useAsyncData('wl-fiis-bot', () =>
  $fetch<ApiAsset[]>(`${API}/top-reits?side=bottom&volume=100000`).catch(() => []),
  { server: true }
)
const { data: etfsTop } = await useAsyncData('wl-etfs-top', () =>
  $fetch<ApiAsset[]>(`${API}/top-etfs?side=top&volume=100000`).catch(() => []),
  { server: true }
)
const { data: etfsBot } = await useAsyncData('wl-etfs-bot', () =>
  $fetch<ApiAsset[]>(`${API}/top-etfs?side=bottom&volume=100000`).catch(() => []),
  { server: true }
)
const { data: bdrsTop } = await useAsyncData('wl-bdrs-top', () =>
  $fetch<ApiAsset[]>(`${API}/top-bdrs?side=top&volume=100000`).catch(() => []),
  { server: true }
)
const { data: bdrsBot } = await useAsyncData('wl-bdrs-bot', () =>
  $fetch<ApiAsset[]>(`${API}/top-bdrs?side=bottom&volume=100000`).catch(() => []),
  { server: true }
)

function mapApiTickers(data: Ref<ApiAsset[] | null>, fallback: typeof fallbackStocks) {
  return computed(() => {
    const items = unwrapApi<ApiAsset>(data.value).slice(0, 10)
    if (items.length < 3) return fallback
    return items.map(a => ({
      symbol: a.ticker ?? '—',
      name: a.name ?? '',
      price: a.market_price ?? 0,
      change: a.change_percent ?? 0,
      logo: a.logo || `https://icons.brapi.dev/icons/${a.ticker}.svg`,
    }))
  })
}

// ── Orbit tickers for hero ──
const orbitFallbackOuter = [
  { symbol: 'PETR4', price: 38.72, change: 2.34, logo: 'https://icons.brapi.dev/icons/PETR4.svg' },
  { symbol: 'VALE3', price: 61.45, change: -1.18, logo: 'https://icons.brapi.dev/icons/VALE3.svg' },
  { symbol: 'ITUB4', price: 32.90, change: 0.85, logo: 'https://icons.brapi.dev/icons/ITUB4.svg' },
  { symbol: 'WEGE3', price: 44.15, change: 3.12, logo: 'https://icons.brapi.dev/icons/WEGE3.svg' },
  { symbol: 'BBAS3', price: 28.33, change: 1.47, logo: 'https://icons.brapi.dev/icons/BBAS3.svg' },
  { symbol: 'MXRF11', price: 10.89, change: 0.42, logo: 'https://icons.brapi.dev/icons/MXRF11.svg' },
]
const orbitFallbackInner = [
  { symbol: 'BOVA11', price: 118.45, change: 1.08, logo: 'https://icons.brapi.dev/icons/BOVA11.svg' },
  { symbol: 'IVVB11', price: 302.80, change: 2.15, logo: 'https://icons.brapi.dev/icons/IVVB11.svg' },
  { symbol: 'AAPL34', price: 52.80, change: 1.45, logo: 'https://icons.brapi.dev/icons/AAPL34.svg' },
  { symbol: 'HGLG11', price: 158.20, change: -0.31, logo: 'https://icons.brapi.dev/icons/HGLG11.svg' },
]

const orbitTickersOuter = computed(() => {
  const stocks = unwrapApi<ApiAsset>(stocksTop.value).slice(0, 4)
  const fiis = unwrapApi<ApiAsset>(fiisTop.value).slice(0, 2)
  const combined = [...stocks, ...fiis]
  if (combined.length < 4) return orbitFallbackOuter
  return combined.map(a => ({ symbol: a.ticker ?? '—', price: a.market_price ?? 0, change: a.change_percent ?? 0, logo: a.logo }))
})
const orbitTickersInner = computed(() => {
  const etfs = unwrapApi<ApiAsset>(etfsTop.value).slice(0, 2)
  const bdrs = unwrapApi<ApiAsset>(bdrsTop.value).slice(0, 2)
  const combined = [...etfs, ...bdrs]
  if (combined.length < 3) return orbitFallbackInner
  return combined.map(a => ({ symbol: a.ticker ?? '—', price: a.market_price ?? 0, change: a.change_percent ?? 0, logo: a.logo }))
})

const orbitFallbackMicro = [
  { symbol: 'PETR4', logo: 'https://icons.brapi.dev/icons/PETR4.svg' },
  { symbol: 'MXRF11', logo: 'https://icons.brapi.dev/icons/MXRF11.svg' },
  { symbol: 'BOVA11', logo: 'https://icons.brapi.dev/icons/BOVA11.svg' },
]
const orbitTickersMicro = computed(() => {
  const s = unwrapApi<ApiAsset>(stocksTop.value).slice(0, 1)
  const f = unwrapApi<ApiAsset>(fiisTop.value).slice(0, 1)
  const e = unwrapApi<ApiAsset>(etfsTop.value).slice(0, 1)
  const combined = [...s, ...f, ...e]
  if (combined.length < 2) return orbitFallbackMicro
  return combined.map(a => ({ symbol: a.ticker ?? '—', logo: a.logo }))
})

const activeMarketCat = ref('stocks')

const marketCategories = [
  {
    key: 'stocks',
    label: 'Ações',
    icon: 'i-lucide-trending-up',
    count: '400+',
    topTickers: mapApiTickers(stocksTop, fallbackStocks),
    bottomTickers: mapApiTickers(stocksBot, fallbackStocks.slice().reverse()),
  },
  {
    key: 'fiis',
    label: 'FIIs',
    icon: 'i-lucide-building-2',
    count: '200+',
    topTickers: mapApiTickers(fiisTop, fallbackFIIs),
    bottomTickers: mapApiTickers(fiisBot, fallbackFIIs.slice().reverse()),
  },
  {
    key: 'etfs',
    label: 'ETFs',
    icon: 'i-lucide-bar-chart-3',
    count: '100+',
    topTickers: mapApiTickers(etfsTop, fallbackETFs),
    bottomTickers: mapApiTickers(etfsBot, fallbackETFs.slice().reverse()),
  },
  {
    key: 'bdrs',
    label: 'BDRs',
    icon: 'i-lucide-globe',
    count: '100+',
    topTickers: mapApiTickers(bdrsTop, fallbackBDRs),
    bottomTickers: mapApiTickers(bdrsBot, fallbackBDRs.slice().reverse()),
  },
]


const portfolioAssets = computed(() => {
  const assets = unwrapApi<ApiAsset>(stocksTop.value).slice(0, 6)
  if (assets.length < 4) {
    return [
      { ticker: 'PETR4', shares: 200, value: 7744, pct: 12.3 },
      { ticker: 'VALE3', shares: 150, value: 9218, pct: -4.2 },
      { ticker: 'MXRF11', shares: 500, value: 5450, pct: 8.7 },
      { ticker: 'ITUB4', shares: 300, value: 9870, pct: 15.1 },
      { ticker: 'WEGE3', shares: 100, value: 4415, pct: 22.8 },
      { ticker: 'HGLG11', shares: 80, value: 12640, pct: 6.4 },
    ]
  }
  const shareCounts = [200, 150, 500, 300, 100, 80]
  return assets.map((a, i) => ({
    ticker: a.ticker ?? '—',
    shares: shareCounts[i] ?? 100,
    value: Math.round((a.market_price ?? 0) * (shareCounts[i] ?? 100)),
    pct: a.change_percent ?? 0,
  }))
})

const portfolioTotal = computed(() =>
  portfolioAssets.value.reduce((sum, a) => sum + a.value, 0)
)

const dividendMonths = [
  { month: 'Set', value: 280 },
  { month: 'Out', value: 340 },
  { month: 'Nov', value: 310 },
  { month: 'Dez', value: 480 },
  { month: 'Jan', value: 390 },
  { month: 'Fev', value: 340 },
]
</script>

<style scoped>
/* Scroll reveal animations */
.wl-reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.wl-reveal.wl-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Hero stagger delays */
.wl-reveal-d1 { transition-delay: 100ms; }
.wl-reveal-d2 { transition-delay: 200ms; }
.wl-reveal-d3 { transition-delay: 300ms; }
.wl-reveal-d4 { transition-delay: 400ms; }

/* Animated gradient orbs */
.wl-orb {
  animation: wl-float 12s ease-in-out infinite;
}
.wl-orb-1 { animation-delay: 0s; }
.wl-orb-2 { animation-delay: -4s; }
.wl-orb-3 { animation-delay: -8s; }

@keyframes wl-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.05); }
  66% { transform: translate(-20px, 15px) scale(0.95); }
}

@keyframes wl-notif-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

@keyframes wl-slide-down {
  from { opacity: 0; transform: translateY(-100%); }
  to { opacity: 1; transform: translateY(0); }
}

/* Gradient text shimmer */
.wl-gradient-shift {
  animation: wl-shimmer 4s ease-in-out infinite;
}

@keyframes wl-shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Carousel progress bar fill */
.wl-progress-fill {
  animation: wl-fill linear forwards;
}

@keyframes wl-fill {
  from { width: 0; }
  to { width: 100%; }
}

/* Vertical progress bar for desktop showcase tabs */
.wl-progress-fill-vertical {
  animation: wl-fill-vertical linear forwards;
}

@keyframes wl-fill-vertical {
  from { height: 0; }
  to { height: 100%; }
}

/* Marquee scrolling rows */
.wl-marquee {
  overflow: hidden;
}

.wl-marquee-track {
  animation: wl-scroll-left 35s linear infinite;
}

.wl-marquee-track-reverse {
  animation: wl-scroll-right 30s linear infinite;
}

@keyframes wl-scroll-left {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}

@keyframes wl-scroll-right {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.wl-marquee:hover .wl-marquee-track,
.wl-marquee:hover .wl-marquee-track-reverse {
  animation-play-state: paused;
}

/* Orbit animations for hero tickers */
.wl-orbit-outer,
.wl-orbit-inner,
.wl-orbit-micro {
  transform-origin: 0 0;
}

.wl-orbit-outer {
  animation: wl-orbit var(--orbit-duration, 50s) linear infinite;
  animation-delay: var(--orbit-delay, 0s);
}

.wl-orbit-inner {
  animation: wl-orbit-reverse var(--orbit-duration, 40s) linear infinite;
  animation-delay: var(--orbit-delay, 0s);
}

.wl-orbit-micro {
  animation: wl-orbit-micro var(--orbit-duration, 25s) linear infinite;
  animation-delay: var(--orbit-delay, 0s);
}

/* Outer orbit: clockwise, radius 420px, subtle opacity breathing */
@keyframes wl-orbit {
  0%   { transform: rotate(0deg)   translateX(420px) rotate(0deg);   opacity: 0.3; }
  25%  { transform: rotate(90deg)  translateX(420px) rotate(-90deg);  opacity: 0.5; }
  50%  { transform: rotate(180deg) translateX(420px) rotate(-180deg); opacity: 0.3; }
  75%  { transform: rotate(270deg) translateX(420px) rotate(-270deg); opacity: 0.5; }
  100% { transform: rotate(360deg) translateX(420px) rotate(-360deg); opacity: 0.3; }
}

/* Inner orbit: counter-clockwise, radius 260px */
@keyframes wl-orbit-reverse {
  0%   { transform: rotate(0deg)    translateX(260px) rotate(0deg);    opacity: 0.2; }
  25%  { transform: rotate(-90deg)  translateX(260px) rotate(90deg);   opacity: 0.4; }
  50%  { transform: rotate(-180deg) translateX(260px) rotate(180deg);  opacity: 0.2; }
  75%  { transform: rotate(-270deg) translateX(260px) rotate(270deg);  opacity: 0.4; }
  100% { transform: rotate(-360deg) translateX(260px) rotate(360deg);  opacity: 0.2; }
}

/* Micro orbit: clockwise fast, radius 150px */
@keyframes wl-orbit-micro {
  0%   { transform: rotate(0deg)   translateX(150px) rotate(0deg);   opacity: 0.12; }
  25%  { transform: rotate(90deg)  translateX(150px) rotate(-90deg);  opacity: 0.25; }
  50%  { transform: rotate(180deg) translateX(150px) rotate(-180deg); opacity: 0.12; }
  75%  { transform: rotate(270deg) translateX(150px) rotate(-270deg); opacity: 0.25; }
  100% { transform: rotate(360deg) translateX(150px) rotate(-360deg); opacity: 0.12; }
}

/* Pulsing dots on orbit tracks */
.wl-orbit-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(96, 165, 250, 0.4);
  transform-origin: 0 0;
  animation: wl-dot-pulse 3s ease-in-out infinite;
}

@keyframes wl-dot-pulse {
  0%, 100% { opacity: 0.2; box-shadow: 0 0 4px rgba(96, 165, 250, 0.3); }
  50% { opacity: 0.7; box-shadow: 0 0 8px rgba(96, 165, 250, 0.6); }
}

/* AI Terminal animations */
.ai-terminal-pulse {
  animation: ai-pulse 2s ease-in-out infinite;
}

@keyframes ai-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.ai-line-flow {
  animation: ai-dash 8s linear infinite;
}

@keyframes ai-dash {
  to { stroke-dashoffset: -100; }
}

.ai-bar-fill {
  animation: ai-grow 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transform-origin: left;
}

@keyframes ai-grow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* Contact modal transitions */
.wl-modal-enter-active,
.wl-modal-leave-active {
  transition: opacity 0.3s ease;
}
.wl-modal-enter-active > :last-child,
.wl-modal-leave-active > :last-child {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.wl-modal-enter-from,
.wl-modal-leave-to {
  opacity: 0;
}
.wl-modal-enter-from > :last-child {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
.wl-modal-leave-to > :last-child {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
</style>
