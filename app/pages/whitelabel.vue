<template>
  <div class="wl-page min-h-screen bg-[#050505] font-sans text-white selection:bg-blue-400/30 selection:text-white">
    <!-- Noise overlay -->
    <div class="pointer-events-none fixed inset-0 z-[999] opacity-[0.015]" style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E'); background-repeat: repeat; background-size: 128px;" />

    <!-- Nav -->
    <nav class="fixed top-0 z-50 w-full border-b border-white/[0.04] bg-[#050505]/60 backdrop-blur-2xl backdrop-saturate-150">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <NuxtLink to="/" class="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <img src="/brand/logo-full.svg" alt="Redentia" class="h-7" />
        </NuxtLink>
        <a href="#cta" class="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]">
          Comecar agora
        </a>
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
          <div class="wl-reveal mb-8 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 backdrop-blur-sm">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span class="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
            </span>
            <span class="text-xs font-semibold uppercase tracking-widest text-blue-400">Powered by AI</span>
          </div>

          <h1 class="wl-reveal wl-reveal-d1 mb-6 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            Cole seu YouTube.<br />
            <span class="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-[length:200%_100%] bg-clip-text text-transparent wl-gradient-shift">Receba sua plataforma.</span>
          </h1>

          <p class="wl-reveal wl-reveal-d2 mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-white/50 md:text-xl">
            Nossa IA analisa seu canal, extrai sua marca, tom de voz e estilo — e gera uma plataforma de investimentos completa com a sua cara. <span class="text-white/80 font-medium">Em minutos, nao meses.</span>
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
              @click="handleGenerate"
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
          <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-400">Inteligencia artificial</p>
          <h2 class="mb-4 text-3xl font-bold tracking-tight md:text-5xl">A IA entende quem voce e</h2>
          <p class="mx-auto max-w-lg text-base text-white/40">Em segundos, ela analisa seu canal e extrai tudo que precisa para montar sua plataforma.</p>
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
                <span class="text-[10px] text-emerald-400/80 font-mono">Analise completa</span>
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
                    <span class="text-[11px] font-semibold uppercase tracking-widest text-blue-400/70">Paleta extraida</span>
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
                      <span class="text-[10px] text-white/30 w-20 text-right">Didatico</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="h-1 flex-1 rounded-full bg-white/[0.04] overflow-hidden">
                        <div class="h-full w-[40%] rounded-full bg-gradient-to-r from-blue-400/60 to-blue-400/30 ai-bar-fill" style="animation-delay: 0.6s;" />
                      </div>
                      <span class="text-[10px] text-white/30 w-20 text-right">Tecnico</span>
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
                  <p class="mt-3 text-[10px] text-white/15">Baseado no perfil do publico do canal</p>
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
                      <span class="text-white/30 ml-1">Acoes, FIIs e dividendos...</span>
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

            <!-- Terminal footer -->
            <div class="flex items-center justify-between border-t border-white/[0.04] bg-white/[0.01] px-5 py-2.5">
              <div class="flex items-center gap-4 text-[10px] font-mono text-white/15">
                <span>6 modulos extraidos</span>
                <span>tempo: 4.2s</span>
                <span>confianca: 96%</span>
              </div>
              <div class="flex items-center gap-1.5 text-[10px] text-blue-400/40 font-mono">
                <UIcon name="i-lucide-zap" class="h-3 w-3" />
                <span>Powered by Redentia AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== SHOWCASE — CAROUSEL CARDS ========== -->
    <section id="showcase" class="relative border-t border-white/[0.04] py-20 md:py-28 overflow-hidden">
      <div class="pointer-events-none absolute left-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-blue-400/5 blur-[140px]" />

      <div class="relative mx-auto max-w-6xl px-6">
        <div class="wl-reveal mb-16 text-center">
          <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-400">Cases reais</p>
          <h2 class="mb-4 text-3xl font-bold tracking-tight md:text-5xl">Mesmo motor. Marcas unicas.</h2>
          <p class="mx-auto max-w-lg text-base text-white/40">Cada plataforma abaixo e real e esta rodando agora. Clique para explorar.</p>
        </div>
      </div>

      <!-- Carousel container -->
      <div class="relative mx-auto max-w-7xl overflow-hidden" style="perspective: 1200px;">
        <div class="relative flex items-center justify-center" style="height: 480px; height: clamp(380px, 60vw, 580px);">
          <div
            v-for="(s, idx) in showcaseBrands"
            :key="s.slug"
            class="absolute flex flex-col cursor-pointer overflow-hidden rounded-2xl border shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
            :class="[
              idx === activeShowcase
                ? 'z-30 border-white/15 shadow-blue-400/5'
                : 'z-10 border-white/5 md:hover:border-white/10',
              idx !== activeShowcase ? 'hidden md:flex' : 'flex',
            ]"
            :style="getCardStyle(idx)"
            @click="idx !== activeShowcase && (activeShowcase = idx, resetAutoRotate())"
          >
            <!-- Browser chrome -->
            <div class="flex items-center gap-2 sm:gap-3 bg-[#1C1C1E] px-3 sm:px-4 py-2">
              <div class="flex gap-1.5">
                <div class="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#FF5F57]" />
                <div class="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#FEBC2E]" />
                <div class="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#28C840]" />
              </div>
              <div class="flex flex-1 items-center gap-2 rounded-md bg-[#2C2C2E] px-2 sm:px-3 py-1 min-w-0">
                <UIcon name="i-lucide-lock" class="h-2.5 w-2.5 text-[#8E8E93] shrink-0" />
                <span class="text-[9px] sm:text-[10px] text-[#8E8E93] truncate">{{ s.domain }}</span>
              </div>
              <div v-if="idx === activeShowcase" class="hidden items-center gap-1 rounded-full px-2 py-0.5 sm:flex shrink-0" :style="{ backgroundColor: `${s.accent}20` }">
                <UIcon name="i-lucide-wand-2" class="h-2.5 w-2.5" :style="{ color: s.accent }" />
                <span class="text-[8px] font-bold uppercase tracking-wider" :style="{ color: s.accent }">Gerado por IA</span>
              </div>
            </div>

            <!-- Live iframe -->
            <div class="relative flex-1 overflow-hidden" :style="{ backgroundColor: s.bg }">
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="flex flex-col items-center gap-3">
                  <div class="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" :style="{ borderColor: `${s.accent}40`, borderTopColor: 'transparent' }" />
                  <span class="text-[10px]" :style="{ color: `${s.accent}60` }">{{ s.name }}</span>
                </div>
              </div>
              <iframe
                :src="`https://redentia.com.br/?brand=${s.slug}`"
                class="relative h-full w-full border-0"
                :title="`Preview ${s.name}`"
                loading="lazy"
                sandbox="allow-scripts allow-same-origin"
                :style="{ pointerEvents: idx === activeShowcase ? 'auto' : 'none' }"
              />
              <!-- Click overlay only for non-active cards -->
              <div
                v-if="idx !== activeShowcase"
                class="absolute inset-0 bg-black/30 transition-opacity duration-500"
              />
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between bg-[#1C1C1E] px-3 sm:px-4 py-2">
              <div class="flex items-center gap-2">
                <div class="flex gap-1">
                  <div v-for="(color, i) in s.colors" :key="i" class="h-3 w-3 rounded-full ring-1 ring-white/10" :style="{ backgroundColor: color }" />
                </div>
                <span class="text-[10px] font-bold text-white/50">{{ s.name }}</span>
              </div>
              <span class="text-[9px] text-white/25">{{ s.font }} &middot; {{ s.heroVariant }}</span>
            </div>
          </div>
        </div>

        <!-- Navigation with progress bars -->
        <div class="mt-4 sm:mt-6 flex items-center justify-center gap-2 sm:gap-3">
          <button
            v-for="(s, idx) in showcaseBrands"
            :key="`dot-${s.slug}`"
            class="group/dot flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-300"
            :class="idx === activeShowcase ? 'bg-white/10' : 'bg-transparent hover:bg-white/5'"
            @click="activeShowcase = idx; resetAutoRotate()"
          >
            <div class="relative h-2 overflow-hidden rounded-full transition-all duration-500" :style="{ width: idx === activeShowcase ? '32px' : '8px', backgroundColor: idx === activeShowcase ? 'transparent' : 'rgba(255,255,255,0.2)' }">
              <!-- Background track -->
              <div v-if="idx === activeShowcase" class="absolute inset-0 rounded-full" :style="{ backgroundColor: `${s.accent}30` }" />
              <!-- Animated fill -->
              <div
                v-if="idx === activeShowcase"
                class="absolute inset-y-0 left-0 rounded-full wl-progress-fill"
                :style="{ backgroundColor: s.accent, animationDuration: `${CAROUSEL_INTERVAL}ms` }"
              />
            </div>
            <span
              class="text-[11px] font-semibold transition-all duration-300"
              :class="idx === activeShowcase ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'"
              :style="{ color: s.accent }"
            >
              {{ s.name }}
            </span>
          </button>
        </div>
      </div>
    </section>

    <!-- ========== FEATURES — MARQUEE + COUNT ========== -->
    <section class="relative border-t border-white/[0.04] py-20 md:py-28 overflow-hidden">
      <div class="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-400/[0.03] blur-[160px]" />

      <div class="relative mx-auto max-w-5xl px-6">
        <div class="wl-reveal mb-16 text-center">
          <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-400">Funcionalidades</p>
          <h2 class="mb-4 text-3xl font-bold tracking-tight md:text-5xl">Tudo incluso. Zero dev.</h2>
          <p class="mx-auto max-w-lg text-base text-white/40">Mais de 40 funcionalidades prontas para seus seguidores usarem.</p>
        </div>

        <!-- Feature count highlight -->
        <div class="wl-reveal mb-12 flex items-center justify-center gap-8 md:gap-12">
          <div class="text-center">
            <p class="text-4xl font-extrabold text-blue-400 md:text-5xl">40+</p>
            <p class="mt-1 text-[11px] uppercase tracking-widest text-white/25">Features</p>
          </div>
          <div class="h-10 w-px bg-white/[0.06]" />
          <div class="text-center">
            <p class="text-4xl font-extrabold text-white/80 md:text-5xl">800+</p>
            <p class="mt-1 text-[11px] uppercase tracking-widest text-white/25">Ativos</p>
          </div>
          <div class="h-10 w-px bg-white/[0.06]" />
          <div class="text-center">
            <p class="text-4xl font-extrabold text-white/80 md:text-5xl">350+</p>
            <p class="mt-1 text-[11px] uppercase tracking-widest text-white/25">Termos</p>
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
          <h2 class="mb-4 text-3xl font-bold tracking-tight md:text-5xl">A bolsa inteira na palma da mao</h2>
          <p class="mx-auto max-w-lg text-base text-white/40">Cotacoes, indicadores e analise fundamentalista de 800+ ativos brasileiros. <span class="text-white/60">Os dados abaixo sao reais.</span></p>
        </div>

        <!-- Category tabs -->
        <div class="wl-reveal mb-6 flex items-center justify-center gap-1.5">
          <button
            v-for="cat in marketCategories"
            :key="cat.key"
            class="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300"
            :class="activeMarketCat === cat.key
              ? 'bg-blue-400 text-black shadow-lg shadow-blue-400/20'
              : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60'"
            @click="activeMarketCat = cat.key"
          >
            <UIcon :name="cat.icon" class="h-3.5 w-3.5" />
            {{ cat.label }}
            <span class="rounded-full px-1.5 py-0.5 text-[9px] font-bold" :class="activeMarketCat === cat.key ? 'bg-black/20 text-black/60' : 'bg-white/[0.06] text-white/20'">
              {{ cat.count }}
            </span>
          </button>
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
                class="group flex shrink-0 items-center gap-5 border-r border-white/[0.04] px-7 py-5 transition-colors hover:bg-white/[0.02]"
              >
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
                class="group flex shrink-0 items-center gap-5 border-r border-white/[0.04] px-7 py-5 transition-colors hover:bg-white/[0.02]"
              >
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
    <section class="relative border-t border-white/[0.04] px-6 py-20 md:py-28">
      <div class="pointer-events-none absolute left-0 bottom-0 h-[400px] w-[400px] rounded-full bg-blue-400/5 blur-[140px]" />

      <div class="relative mx-auto max-w-5xl">
        <div class="wl-reveal mb-16 text-center">
          <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-400">Carteira & Dividendos</p>
          <h2 class="mb-4 text-3xl font-bold tracking-tight md:text-5xl">Controle total do patrimonio</h2>
          <p class="mx-auto max-w-lg text-base text-white/40">Seus seguidores acompanham a carteira, dividendos e rentabilidade em um so lugar.</p>
        </div>

        <!-- App-like dashboard mockup in a single terminal frame -->
        <div class="wl-reveal relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0f] shadow-2xl shadow-blue-400/5">

          <!-- Window chrome -->
          <div class="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-5 py-3">
            <div class="flex gap-1.5">
              <div class="h-2.5 w-2.5 rounded-full bg-white/10" />
              <div class="h-2.5 w-2.5 rounded-full bg-white/10" />
              <div class="h-2.5 w-2.5 rounded-full bg-white/10" />
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
              <p class="text-[11px] text-white/30 mb-1">Patrimonio total</p>
              <p class="text-2xl font-bold tabular-nums md:text-3xl">R$ {{ portfolioTotal.toLocaleString('pt-BR') }}</p>
            </div>
            <div class="p-5 text-center border-r border-white/[0.04]">
              <p class="text-[11px] text-white/30 mb-1">Dividendos (6m)</p>
              <p class="text-2xl font-bold text-blue-400 tabular-nums md:text-3xl">R$ 2.140</p>
            </div>
            <div class="p-5 text-center">
              <p class="text-[11px] text-white/30 mb-1">Yield medio</p>
              <p class="text-2xl font-bold tabular-nums md:text-3xl">6.8%</p>
            </div>
          </div>

          <!-- Two-column layout: assets + dividends -->
          <div class="flex flex-col lg:flex-row">

            <!-- Left: Asset list -->
            <div class="flex-1 lg:border-r lg:border-white/[0.04]">
              <!-- Column header -->
              <div class="flex items-center gap-3 px-5 py-2.5 border-b border-white/[0.04] bg-white/[0.01]">
                <span class="w-6 text-[9px] font-bold uppercase tracking-widest text-white/15">#</span>
                <span class="flex-1 text-[9px] font-bold uppercase tracking-widest text-white/15">Ativo</span>
                <span class="hidden sm:block w-28 text-right text-[9px] font-bold uppercase tracking-widest text-white/15">Alocacao</span>
                <span class="w-24 text-right text-[9px] font-bold uppercase tracking-widest text-white/15">Valor</span>
              </div>

              <div class="divide-y divide-white/[0.03]">
                <div
                  v-for="(asset, aIdx) in portfolioAssets"
                  :key="asset.ticker"
                  class="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02]"
                >
                  <span class="w-6 text-center text-[10px] font-bold text-white/15 tabular-nums">{{ aIdx + 1 }}</span>

                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold" :class="asset.pct >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'">
                    {{ asset.ticker.slice(0, 2) }}
                  </div>

                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold">{{ asset.ticker }}</p>
                    <p class="text-[10px] text-white/25">{{ asset.shares }} cotas</p>
                  </div>

                  <!-- Allocation bar -->
                  <div class="hidden sm:flex items-center gap-2 w-28">
                    <div class="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
                      <div
                        class="h-full rounded-full"
                        :class="asset.pct >= 0 ? 'bg-blue-400/50' : 'bg-red-400/40'"
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
              <div class="flex items-center gap-2 px-5 py-2.5 border-b border-white/[0.04] bg-white/[0.01]">
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
                  <div class="relative w-full overflow-hidden rounded transition-all duration-300 group-hover/bar:brightness-125" :style="{ height: `${(d.value / 480) * 120}px` }">
                    <div class="absolute inset-0 bg-gradient-to-t from-blue-400/20 to-blue-400/60" />
                  </div>
                  <span class="text-[9px] text-white/25">{{ d.month }}</span>
                </div>
              </div>

              <!-- Bottom stats -->
              <div class="flex border-t border-white/[0.04]">
                <div class="flex-1 p-4 text-center">
                  <p class="text-lg font-bold text-blue-400 tabular-nums">R$ 2.140</p>
                  <p class="text-[9px] text-white/25">Total recebido</p>
                </div>
                <div class="flex-1 border-l border-white/[0.04] p-4 text-center">
                  <p class="text-lg font-bold tabular-nums">12</p>
                  <p class="text-[9px] text-white/25">Pagamentos</p>
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
              <h2 class="mb-5 text-3xl font-bold tracking-tight md:text-5xl leading-[1.1]">Seu clone digital respondendo 24/7</h2>
              <p class="mb-8 text-base leading-relaxed text-white/40">O chatbot fala como voce, conhece seu conteudo e responde duvidas de investimentos no seu tom de voz.</p>
            </div>

            <div class="wl-reveal space-y-4" style="transition-delay: 100ms;">
              <div class="flex items-start gap-3">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-400/10 mt-0.5">
                  <UIcon name="i-lucide-brain" class="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p class="text-sm font-semibold">Treinado com seu conteudo</p>
                  <p class="text-[13px] text-white/30">Analisa seus videos, posts e estilo para responder como voce.</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-400/10 mt-0.5">
                  <UIcon name="i-lucide-bar-chart-3" class="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p class="text-sm font-semibold">Dados fundamentalistas reais</p>
                  <p class="text-[13px] text-white/30">P/L, DY, P/VP e mais — direto da B3 em tempo real.</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-400/10 mt-0.5">
                  <UIcon name="i-lucide-clock" class="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p class="text-sm font-semibold">Disponivel 24 horas</p>
                  <p class="text-[13px] text-white/30">Seus seguidores tiram duvidas a qualquer hora, sem esperar.</p>
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
                      <p class="text-sm font-medium text-black">Qual FII tem o melhor DY neste mes?</p>
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
                          Olha, o <span class="font-semibold text-blue-400">MXRF11</span> ta com DY de 1.08% esse mes, mas olha o
                          <span class="font-semibold text-blue-400">HGLG11</span> que ta pagando 0.95% com muito mais estabilidade.
                        </p>
                        <p class="mt-2 text-[13px] leading-relaxed text-white/50">
                          DY alto sozinho nao e tudo — olha vacancia, P/VP e consistencia.
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
                          Momento interessante. Vamos aos numeros:
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
                          P/L baixo, DY gordo. Mas e ciclica — nunca coloque tudo em uma so.
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

              <!-- Floating glow behind phone -->
              <div class="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-blue-400/[0.03] blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== COMO FUNCIONA ========== -->
    <section class="relative border-t border-white/[0.04] px-6 py-20 md:py-28 overflow-hidden">
      <div class="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-400/[0.03] blur-[160px]" />

      <div class="relative mx-auto max-w-5xl">
        <div class="wl-reveal mb-16 text-center">
          <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-400">Como funciona</p>
          <h2 class="mb-4 text-3xl font-bold tracking-tight md:text-5xl">3 passos. 3 minutos.</h2>
        </div>

        <!-- Horizontal steps with visual previews -->
        <div class="grid gap-4 md:grid-cols-3">

          <!-- Step 1: Cole o link -->
          <div class="wl-reveal group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0f]">
            <!-- Visual preview -->
            <div class="relative border-b border-white/[0.04] p-5">
              <!-- URL input mockup -->
              <div class="mb-4 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
                <UIcon name="i-lucide-youtube" class="h-4 w-4 text-red-400/60" />
                <span class="text-sm text-white/50 font-mono">youtube.com/<span class="text-blue-400">@seucanal</span></span>
              </div>
              <!-- Processing animation mockup -->
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <div class="h-1.5 w-1.5 rounded-full bg-blue-400 ai-terminal-pulse" />
                  <span class="text-[10px] text-white/30 font-mono">Analisando thumbnails...</span>
                  <UIcon name="i-lucide-check" class="h-3 w-3 text-emerald-400/60" />
                </div>
                <div class="flex items-center gap-2">
                  <div class="h-1.5 w-1.5 rounded-full bg-blue-400 ai-terminal-pulse" style="animation-delay: 0.5s;" />
                  <span class="text-[10px] text-white/30 font-mono">Extraindo paleta de cores...</span>
                  <UIcon name="i-lucide-check" class="h-3 w-3 text-emerald-400/60" />
                </div>
                <div class="flex items-center gap-2">
                  <div class="h-1.5 w-1.5 rounded-full bg-blue-400 ai-terminal-pulse" style="animation-delay: 1s;" />
                  <span class="text-[10px] text-white/30 font-mono">Detectando tom de voz...</span>
                  <UIcon name="i-lucide-loader-2" class="h-3 w-3 text-blue-400/40 animate-spin" />
                </div>
              </div>
              <!-- Progress bar -->
              <div class="mt-4 h-1 w-full rounded-full bg-white/[0.04] overflow-hidden">
                <div class="h-full w-[72%] rounded-full bg-gradient-to-r from-blue-400/60 to-blue-400" />
              </div>
            </div>
            <!-- Text content -->
            <div class="p-5">
              <div class="mb-3 flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-400 text-sm font-bold text-black">1</div>
                <h3 class="text-base font-bold">Cole o link</h3>
              </div>
              <p class="text-[13px] leading-relaxed text-white/35">Nossa IA analisa thumbnails, cores, tipografia, bordoes e como voce fala com seu publico.</p>
            </div>
          </div>

          <!-- Step 2: Revisamos juntos -->
          <div class="wl-reveal group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0f]" style="transition-delay: 100ms;">
            <!-- Visual preview -->
            <div class="relative border-b border-white/[0.04] p-5">
              <!-- Config panel mockup -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] text-white/40">Paleta</span>
                  <div class="flex gap-1">
                    <div class="h-5 w-5 rounded-md bg-[#4ADE80] ring-1 ring-white/10" />
                    <div class="h-5 w-5 rounded-md bg-[#0A0A0A] ring-1 ring-white/10" />
                    <div class="h-5 w-5 rounded-md bg-[#FFFFFF] ring-1 ring-white/10" />
                    <UIcon name="i-lucide-pencil" class="h-5 w-5 text-white/15 p-0.5" />
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[11px] text-white/40">Fonte</span>
                  <span class="text-[11px] font-bold text-blue-400">Poppins Black</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[11px] text-white/40">Tom de voz</span>
                  <span class="text-[11px] text-white/50">Motivacional, informal</span>
                </div>
                <div class="h-px bg-white/[0.04]" />
                <div class="flex items-center justify-between">
                  <span class="text-[11px] text-white/40">Calculadoras</span>
                  <div class="h-4 w-8 rounded-full bg-blue-400">
                    <div class="h-4 w-4 translate-x-4 rounded-full bg-white shadow" />
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[11px] text-white/40">Glossario</span>
                  <div class="h-4 w-8 rounded-full bg-blue-400">
                    <div class="h-4 w-4 translate-x-4 rounded-full bg-white shadow" />
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[11px] text-white/40">Simulador</span>
                  <div class="h-4 w-8 rounded-full bg-white/10">
                    <div class="h-4 w-4 rounded-full bg-white/40 shadow" />
                  </div>
                </div>
              </div>
            </div>
            <!-- Text content -->
            <div class="p-5">
              <div class="mb-3 flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-bold text-white/60">2</div>
                <h3 class="text-base font-bold">Revisamos juntos</h3>
              </div>
              <p class="text-[13px] leading-relaxed text-white/35">Paleta, fonte, tom de voz, textos e features gerados pela IA. Voce ajusta o que quiser.</p>
            </div>
          </div>

          <!-- Step 3: Lancamento -->
          <div class="wl-reveal group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0f]" style="transition-delay: 200ms;">
            <!-- Visual preview -->
            <div class="relative border-b border-white/[0.04] p-5">
              <!-- Deploy terminal mockup -->
              <div class="space-y-2 font-mono text-[10px]">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-check-circle" class="h-3 w-3 text-emerald-400/70" />
                  <span class="text-emerald-400/50">Build completo</span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-check-circle" class="h-3 w-3 text-emerald-400/70" />
                  <span class="text-emerald-400/50">PWA configurada</span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-check-circle" class="h-3 w-3 text-emerald-400/70" />
                  <span class="text-emerald-400/50">SEO otimizado</span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-check-circle" class="h-3 w-3 text-emerald-400/70" />
                  <span class="text-emerald-400/50">SSL ativo</span>
                </div>
                <div class="h-px bg-white/[0.04] my-1" />
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-globe" class="h-3 w-3 text-blue-400" />
                  <span class="text-blue-400/70">suaplataforma.com.br</span>
                  <span class="text-emerald-400 ml-auto">LIVE</span>
                </div>
              </div>
              <!-- Confetti-like dots -->
              <div class="mt-4 flex items-center justify-center gap-1">
                <div class="h-1.5 w-1.5 rounded-full bg-blue-400/40" />
                <div class="h-1.5 w-1.5 rounded-full bg-emerald-400/40" />
                <div class="h-1.5 w-1.5 rounded-full bg-violet-400/40" />
                <div class="h-1.5 w-1.5 rounded-full bg-amber-400/40" />
                <div class="h-1.5 w-1.5 rounded-full bg-blue-400/40" />
              </div>
            </div>
            <!-- Text content -->
            <div class="p-5">
              <div class="mb-3 flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-bold text-white/60">3</div>
                <h3 class="text-base font-bold">Lancamento</h3>
              </div>
              <p class="text-[13px] leading-relaxed text-white/35">Deploy com dominio customizado, PWA pronta, SEO configurado. Monetize desde o dia 1.</p>
            </div>
          </div>
        </div>

        <!-- Connecting arrows between cards (desktop only) -->
        <div class="hidden md:flex items-center justify-center gap-0 -mt-[210px] mb-[210px] pointer-events-none relative z-10 px-16">
          <div class="flex-1" />
          <div class="flex items-center gap-0 text-white/10">
            <div class="h-px w-8 bg-gradient-to-r from-transparent to-white/10" />
            <UIcon name="i-lucide-chevron-right" class="h-4 w-4" />
          </div>
          <div class="flex-1" />
          <div class="flex items-center gap-0 text-white/10">
            <div class="h-px w-8 bg-gradient-to-r from-transparent to-white/10" />
            <UIcon name="i-lucide-chevron-right" class="h-4 w-4" />
          </div>
          <div class="flex-1" />
        </div>

        <div class="wl-reveal mt-10 flex items-center justify-center gap-2 rounded-2xl border border-blue-400/10 bg-blue-400/[0.04] px-6 py-4">
          <UIcon name="i-lucide-zap" class="h-5 w-5 text-blue-400" />
          <p class="text-sm font-semibold text-blue-300">Zero trabalho tecnico. A IA faz o trabalho pesado.</p>
        </div>
      </div>
    </section>

    <!-- ========== TECH STACK ========== -->
    <section class="border-t border-white/[0.04] px-6 py-14">
      <div class="mx-auto max-w-4xl text-center">
        <p class="wl-reveal mb-6 text-xs font-semibold uppercase tracking-widest text-white/25">Construido com</p>
        <div class="flex flex-wrap justify-center gap-2">
          <span
            v-for="(tech, tIdx) in techStack"
            :key="tech"
            class="wl-reveal rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-xs font-medium text-white/30 transition-all duration-300 hover:border-white/15 hover:text-white/60 hover:bg-white/[0.05]"
            :style="{ transitionDelay: `${tIdx * 40}ms` }"
          >
            {{ tech }}
          </span>
        </div>
      </div>
    </section>

    <!-- ========== CTA FINAL ========== -->
    <section id="cta" class="relative border-t border-white/[0.04] px-6 py-20 md:py-32">
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div class="wl-orb wl-orb-1 absolute left-1/3 bottom-0 h-[500px] w-[500px] rounded-full bg-blue-400/8 blur-[150px]" />
        <div class="wl-orb wl-orb-2 absolute right-1/3 bottom-1/4 h-[400px] w-[400px] rounded-full bg-blue-300/5 blur-[120px]" />
      </div>

      <div class="relative mx-auto max-w-2xl text-center">
        <h2 class="wl-reveal mb-4 text-3xl font-bold tracking-tight md:text-5xl">Pronto para ver a sua?</h2>
        <p class="wl-reveal mb-10 text-lg text-white/40">Cole seu canal e veja como ficaria em minutos.</p>

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
            @click="handleGenerate"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/20 to-blue-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <UIcon name="i-lucide-wand-2" class="relative h-4 w-4" />
            <span class="relative">Gerar plataforma</span>
          </button>
        </div>

        <p class="wl-reveal mt-8 text-sm text-white/25">
          Ou
          <a href="mailto:contato@redentia.com.br" class="font-semibold text-blue-400 underline underline-offset-4 transition-colors hover:text-blue-300">
            fale com a equipe
          </a>
        </p>
      </div>
    </section>

    <!-- Footer mini -->
    <footer class="border-t border-white/[0.04] px-6 py-8">
      <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-white/20 sm:flex-row">
        <p>&copy; {{ new Date().getFullYear() }} Redentia. Todos os direitos reservados.</p>
        <div class="flex gap-6">
          <NuxtLink to="/institucional/terms" class="transition-colors hover:text-white/50">Termos</NuxtLink>
          <NuxtLink to="/institucional/privacy" class="transition-colors hover:text-white/50">Privacidade</NuxtLink>
          <NuxtLink to="/institucional/contact" class="transition-colors hover:text-white/50">Contato</NuxtLink>
        </div>
      </div>
    </footer>
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

function handleGenerate() {
  const url = youtubeUrl.value || youtubeUrlBottom.value
  if (url) {
    navigateTo(`/institucional/contact?youtube=${encodeURIComponent(url)}`)
  } else {
    navigateTo('/institucional/contact')
  }
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

function getCardStyle(idx: number) {
  const diff = idx - activeShowcase.value
  const isActive = diff === 0

  if (isActive) {
    return {
      width: '720px',
      maxWidth: '92vw',
      height: 'clamp(340px, 55vw, 540px)',
      transform: 'translateX(0) scale(1) rotateY(0deg)',
      opacity: '1',
      filter: 'brightness(1)',
    }
  }

  const side = diff < 0 ? -1 : 1
  const wrappedSide = Math.abs(diff) === 2 ? -side : side

  return {
    width: '600px',
    maxWidth: '75vw',
    height: '480px',
    transform: `translateX(${wrappedSide * 72}%) scale(0.82) rotateY(${wrappedSide * -8}deg)`,
    opacity: '0.5',
    filter: 'brightness(0.6)',
  }
}

const aiToggleFeatures = [
  { label: 'Calculadoras', on: true },
  { label: 'Analise fundamentalista', on: true },
  { label: 'Carteira', on: true },
  { label: 'Simulador aposentadoria', on: false },
  { label: 'Glossario', on: true },
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
    domain: 'redentia.com.br/?brand=primo-rico',
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
    domain: 'redentia.com.br/?brand=me-poupe',
  },
  {
    name: 'Investidor Sardinha',
    slug: 'investidor-sardinha',
    font: 'Barlow',
    style: 'Bold • Tecnico',
    heroVariant: 'Minimal',
    bg: '#FFFFFF',
    accent: '#DC2626',
    colors: ['#DC2626', '#B91C1C', '#F9FAFB'],
    domain: 'redentia.com.br/?brand=investidor-sardinha',
  },
]

const platformFeatures = [
  { icon: 'i-lucide-trending-up', title: 'Cotacoes em tempo real', description: 'Acoes, FIIs, ETFs, BDRs e Small Caps atualizados.' },
  { icon: 'i-lucide-bot', title: 'Assessor IA personalizado', description: 'Chatbot treinado com tom de voz do criador.' },
  { icon: 'i-lucide-calculator', title: '8 calculadoras financeiras', description: 'Juros compostos, preco teto, aposentadoria e mais.' },
  { icon: 'i-lucide-briefcase', title: 'Carteira inteligente', description: 'Importacao Excel, rentabilidade e rebalanceamento.' },
  { icon: 'i-lucide-coins', title: 'Dividendos', description: 'Calendario, historico e projecoes de proventos.' },
  { icon: 'i-lucide-book-open', title: 'Glossario com 350+ termos', description: 'Conteudo SEO que gera trafego organico.' },
  { icon: 'i-lucide-graduation-cap', title: 'Guias educacionais', description: 'Artigos completos otimizados para Google.' },
  { icon: 'i-lucide-smartphone', title: 'PWA nativa', description: 'Funciona como app sem precisar de App Store.' },
  { icon: 'i-lucide-bar-chart-3', title: 'Dashboard de mercado', description: 'Ibovespa, cambio, crypto e indicadores ao vivo.' },
]

const steps = [
  { title: 'Cole o link do seu YouTube', description: 'Nossa IA assiste seus videos, analisa thumbnails, cores, tipografia, bordoes e como voce fala com seu publico. Em segundos ela entende sua marca.' },
  { title: 'Revisamos juntos', description: 'A IA gera: paleta de cores, fonte, tom de voz do chatbot, textos do site e quais features fazem sentido pro seu publico. Voce ajusta o que quiser.' },
  { title: 'Lancamento', description: 'Deploy com seu dominio customizado, PWA pronta, SEO configurado. Seus seguidores acessam e voce monetiza desde o dia 1.' },
]

const techStack = ['Nuxt 3', 'Vue 3', 'TypeScript', 'Tailwind v4', 'SSR + PWA', 'SEO otimizado', 'Laravel API', 'PostgreSQL', 'Docker', 'CI/CD']

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
  { symbol: 'PETR4', name: 'Petrobras PN', price: 38.72, change: 2.34 },
  { symbol: 'VALE3', name: 'Vale ON', price: 61.45, change: -1.18 },
  { symbol: 'ITUB4', name: 'Itau Unibanco PN', price: 32.90, change: 0.85 },
  { symbol: 'WEGE3', name: 'WEG ON', price: 44.15, change: 3.12 },
  { symbol: 'BBAS3', name: 'Banco do Brasil ON', price: 28.33, change: 1.47 },
  { symbol: 'ABEV3', name: 'Ambev ON', price: 13.22, change: -0.45 },
  { symbol: 'RENT3', name: 'Localiza ON', price: 55.80, change: 2.08 },
  { symbol: 'MGLU3', name: 'Magazine Luiza ON', price: 12.65, change: -3.22 },
  { symbol: 'BBDC4', name: 'Bradesco PN', price: 15.48, change: 0.92 },
  { symbol: 'SUZB3', name: 'Suzano ON', price: 52.30, change: 1.65 },
]
const fallbackFIIs = [
  { symbol: 'MXRF11', name: 'Maxi Renda', price: 10.89, change: 0.42 },
  { symbol: 'HGLG11', name: 'CSHG Logistica', price: 158.20, change: -0.31 },
  { symbol: 'XPLG11', name: 'XP Log', price: 95.40, change: 1.15 },
  { symbol: 'KNRI11', name: 'Kinea Renda', price: 133.50, change: 0.28 },
  { symbol: 'VISC11', name: 'Vinci Shopping', price: 105.80, change: -0.67 },
  { symbol: 'HGBS11', name: 'Hedge Brasil Shopping', price: 198.30, change: 0.55 },
  { symbol: 'BTLG11', name: 'BTG Logistico', price: 92.10, change: 1.22 },
  { symbol: 'PVBI11', name: 'VBI Prime', price: 78.60, change: -0.18 },
]
const fallbackETFs = [
  { symbol: 'BOVA11', name: 'iShares Ibovespa', price: 118.45, change: 1.08 },
  { symbol: 'IVVB11', name: 'iShares S&P 500', price: 302.80, change: 2.15 },
  { symbol: 'SMAL11', name: 'iShares Small Cap', price: 98.30, change: -1.42 },
  { symbol: 'HASH11', name: 'Hashdex Crypto', price: 45.60, change: 4.33 },
  { symbol: 'XFIX11', name: 'XP IFIX', price: 9.85, change: 0.22 },
  { symbol: 'NASD11', name: 'Trend Nasdaq', price: 15.20, change: 1.87 },
  { symbol: 'GOLD11', name: 'Trend Ouro', price: 12.40, change: 0.95 },
  { symbol: 'DIVO11', name: 'It Now Dividendos', price: 72.30, change: -0.38 },
]
const fallbackBDRs = [
  { symbol: 'AAPL34', name: 'Apple', price: 52.80, change: 1.45 },
  { symbol: 'MSFT34', name: 'Microsoft', price: 78.30, change: 0.92 },
  { symbol: 'AMZO34', name: 'Amazon', price: 45.10, change: -0.68 },
  { symbol: 'GOGL34', name: 'Alphabet', price: 62.40, change: 2.13 },
  { symbol: 'NVDC34', name: 'NVIDIA', price: 38.90, change: 3.55 },
  { symbol: 'TSLA34', name: 'Tesla', price: 28.70, change: -2.10 },
  { symbol: 'META34', name: 'Meta', price: 41.20, change: 1.78 },
  { symbol: 'NFLX34', name: 'Netflix', price: 22.50, change: 0.65 },
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
    label: 'Acoes',
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
</style>
