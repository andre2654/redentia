<template>
  <div
    class="builder-page relative min-h-screen overflow-hidden bg-[#030305] text-white antialiased"
    :style="{ fontFamily: `'Inter', system-ui, sans-serif` }"
    @mousemove="onMouseMove"
  >
    <!-- ========== BACKGROUND LAYERS ========== -->
    <!-- Dot grid -->
    <div class="pointer-events-none fixed inset-0 bld-grid" />
    <!-- Cursor spotlight -->
    <div
      class="pointer-events-none fixed inset-0 z-[1] transition-opacity duration-700"
      :style="{
        background: `radial-gradient(800px circle at ${mouse.x}px ${mouse.y}px, ${primaryColor}08, transparent 50%)`,
        opacity: phase === 'input' ? 1 : 0.4,
      }"
    />
    <!-- Floating orbs -->
    <div class="pointer-events-none fixed inset-0 overflow-hidden">
      <div class="bld-orb absolute -left-60 -top-60 h-[800px] w-[800px] rounded-full blur-[200px]" :style="{ backgroundColor: primaryColor, opacity: 0.08 }" />
      <div class="bld-orb absolute -bottom-40 -right-60 h-[600px] w-[600px] rounded-full bg-violet-600 opacity-[0.05] blur-[180px]" style="animation-delay:-5s" />
      <div class="bld-orb absolute left-1/3 top-1/4 h-[300px] w-[300px] rounded-full opacity-[0.04] blur-[120px]" :style="{ backgroundColor: primaryColor }" style="animation-delay:-9s" />
    </div>
    <!-- Rising particles -->
    <div class="pointer-events-none fixed inset-0 overflow-hidden">
      <span v-for="n in 12" :key="n" class="bld-particle absolute rounded-full bg-white" :style="particleStyle(n)" />
    </div>
    <!-- Noise -->
    <div class="pointer-events-none fixed inset-0 opacity-[0.025]" style="background-image:url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')" />

    <!-- Light sweep (between phases) -->
    <Transition name="sweep">
      <div v-if="showSweep" class="pointer-events-none fixed inset-0 z-40 bld-sweep" :style="{ '--sweep-color': primaryColor } as any" />
    </Transition>

    <!-- ========== NAV ========== -->
    <nav class="relative z-20 flex items-center justify-between px-6 py-5 md:px-12" style="animation: bld-fade-down 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both">
      <NuxtLink to="/" class="flex items-center gap-2 text-white/30 transition hover:text-white/60">
        <UIcon name="i-lucide-arrow-left" class="size-4" />
        <span class="text-sm">Voltar</span>
      </NuxtLink>
      <div class="flex items-center gap-2">
        <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: primaryColor }" />
        <span class="text-[10px] font-medium uppercase tracking-[0.3em] text-white/20">Builder</span>
      </div>
    </nav>

    <!-- ============================================ -->
    <!-- PHASE 1: INPUT                              -->
    <!-- ============================================ -->
    <Transition name="phase-zoom">
      <section v-if="phase === 'input'" key="input" class="relative z-10 flex min-h-[80vh] flex-col items-center justify-center px-6">
        <div class="w-full max-w-xl text-center">
          <div class="bld-reveal mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-5 py-2">
            <span class="h-1.5 w-1.5 animate-pulse rounded-full" :style="{ backgroundColor: primaryColor }" />
            <span class="text-[10px] font-medium uppercase tracking-[0.25em] text-white/30">IA generativa</span>
          </div>

          <h1 class="bld-reveal bld-d1 mb-5 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
            Crie sua<br />
            <span class="bld-gradient-text" :style="{ '--g-from': primaryColor, '--g-to': '#fff' } as any">plataforma</span>
          </h1>
          <p class="bld-reveal bld-d2 mx-auto mb-14 max-w-sm text-sm leading-relaxed text-white/30">
            Nome da marca + uma cor. A IA constroi o resto em tempo real.
          </p>

          <div class="bld-reveal bld-d3 mb-5">
            <input
              v-model="brandName"
              type="text"
              placeholder="Nome da sua marca"
              class="w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-5 text-center text-xl font-medium text-white outline-none transition-all duration-500 placeholder:text-white/15 focus:border-white/10 focus:bg-white/[0.04]"
              :style="{ boxShadow: brandName ? `0 0 60px ${primaryColor}08` : 'none' }"
              @keyup.enter="brandName.trim() && startBuild()"
            />
          </div>

          <div class="bld-reveal bld-d3 mb-12">
            <div class="flex flex-wrap items-center justify-center gap-2.5">
              <button
                v-for="c in colorPresets"
                :key="c.hex"
                class="group relative h-10 w-10 rounded-full transition-all duration-300 hover:scale-110"
                :class="primaryColor === c.hex ? 'scale-110 ring-2 ring-white/80 ring-offset-2 ring-offset-[#030305]' : ''"
                :style="{ backgroundColor: c.hex }"
                @click="primaryColor = c.hex"
              />
              <label class="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-dashed border-white/10 transition hover:border-white/20">
                <UIcon name="i-lucide-pipette" class="size-3.5 text-white/25" />
                <input type="color" v-model="primaryColor" class="absolute inset-0 cursor-pointer opacity-0" />
              </label>
            </div>
          </div>

          <button
            :disabled="!brandName.trim()"
            class="bld-reveal bld-d4 group relative inline-flex items-center gap-3 rounded-2xl px-12 py-5 text-sm font-semibold uppercase tracking-wider text-white transition-all duration-500 hover:scale-[1.04] disabled:pointer-events-none disabled:opacity-20"
            :style="{ backgroundColor: primaryColor }"
            @click="startBuild"
          >
            <div class="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" :style="{ boxShadow: `0 0 80px ${primaryColor}50, inset 0 0 30px ${primaryColor}30` }" />
            <span class="relative">Gerar plataforma</span>
            <UIcon name="i-lucide-sparkles" class="relative size-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
          </button>
        </div>
      </section>
    </Transition>

    <!-- ============================================ -->
    <!-- PHASE 2: ANALYSIS (typewriter terminal)     -->
    <!-- ============================================ -->
    <Transition name="phase-zoom">
      <section v-if="phase === 'analysis'" key="analysis" class="relative z-10 flex min-h-[80vh] flex-col items-center justify-center px-6">
        <div class="w-full max-w-2xl">
          <p class="mb-2 text-center text-[10px] font-medium uppercase tracking-[0.3em] text-white/15" style="animation: bld-fade-down 0.5s both">Processando</p>
          <h2 class="mb-10 text-center text-3xl font-bold" style="animation: bld-fade-down 0.6s 0.1s both">
            <span :style="{ color: primaryColor }">{{ brandName }}</span>
          </h2>

          <!-- Terminal -->
          <div class="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#060609] shadow-2xl" style="animation: bld-scale-in 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s both" :style="{ boxShadow: `0 40px 120px ${primaryColor}06` }">
            <div class="flex items-center gap-2 border-b border-white/[0.04] px-5 py-3">
              <span class="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/60" />
              <span class="h-2.5 w-2.5 rounded-full bg-[#febc2e]/60" />
              <span class="h-2.5 w-2.5 rounded-full bg-[#28c840]/60" />
              <span class="ml-auto flex items-center gap-2">
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 bld-pulse" />
                <span class="text-[9px] font-medium uppercase tracking-[0.2em] text-white/20">AI Engine</span>
              </span>
            </div>
            <div class="min-h-[220px] p-6 font-mono text-[13px] leading-[2]">
              <div v-for="(line, i) in visibleTerminalLines" :key="i" class="flex gap-3">
                <span class="shrink-0 select-none" :style="{ color: `${primaryColor}60` }">❯</span>
                <span>
                  <span :style="{ color: line.color || 'rgba(255,255,255,0.5)' }">{{ line.displayed }}</span>
                  <span v-if="line.done" class="ml-1 text-emerald-400"> ✓</span>
                </span>
              </div>
              <div v-if="terminalTyping" class="flex gap-3">
                <span class="shrink-0 select-none" :style="{ color: `${primaryColor}60` }">❯</span>
                <span class="bld-cursor text-white/25">_</span>
              </div>
            </div>
            <!-- Bottom progress -->
            <div class="h-0.5 w-full bg-white/[0.03]">
              <div class="h-full rounded-r-full transition-all duration-500 ease-linear" :style="{ width: terminalProgress + '%', backgroundColor: primaryColor }" />
            </div>
          </div>
        </div>
      </section>
    </Transition>

    <!-- ============================================ -->
    <!-- PHASE 3: BUILD                              -->
    <!-- ============================================ -->
    <Transition name="phase-zoom">
      <section v-if="phase === 'build'" key="build" class="relative z-10 px-6 py-10 md:px-12">
        <div class="mx-auto max-w-7xl">
          <!-- Header with progress ring -->
          <div class="mb-10 flex items-center justify-between">
            <div>
              <p class="text-[10px] font-medium uppercase tracking-[0.3em] text-white/15">Construindo</p>
              <h2 class="mt-1 text-2xl font-bold">{{ brandName }}</h2>
            </div>
            <!-- SVG progress ring -->
            <div class="relative h-16 w-16">
              <svg class="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="3" />
                <circle
                  cx="32" cy="32" r="28" fill="none" :stroke="primaryColor" stroke-width="3" stroke-linecap="round"
                  :stroke-dasharray="175.9" :stroke-dashoffset="175.9 - (175.9 * (currentStep + 1) / buildSteps.length)"
                  class="transition-all duration-1000 ease-out"
                />
              </svg>
              <span class="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums" :style="{ color: primaryColor }">
                {{ Math.round(((currentStep + 1) / buildSteps.length) * 100) }}%
              </span>
            </div>
          </div>

          <div class="flex flex-col gap-10 lg:flex-row lg:gap-16">
            <!-- Left: Steps -->
            <div class="w-full shrink-0 lg:w-56">
              <div class="flex flex-row gap-1.5 overflow-x-auto pb-4 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
                <div
                  v-for="(step, i) in buildSteps"
                  :key="i"
                  class="flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 transition-all duration-700 lg:rounded-none lg:border-l-2 lg:px-0 lg:py-4 lg:pl-5"
                  :class="i < currentStep ? 'lg:border-emerald-400/40' : i === currentStep ? 'lg:border-white/50' : 'lg:border-white/[0.04]'"
                >
                  <div
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs transition-all duration-700"
                    :class="i < currentStep ? 'bg-emerald-400/10 text-emerald-400' : i === currentStep ? 'text-white' : 'bg-white/[0.02] text-white/10'"
                    :style="i === currentStep ? { backgroundColor: `${primaryColor}15`, color: primaryColor } : {}"
                  >
                    <UIcon v-if="i < currentStep" name="i-lucide-check" class="size-3.5" />
                    <UIcon v-else :name="step.icon" class="size-3.5" />
                  </div>
                  <div>
                    <p class="text-xs font-medium" :class="i <= currentStep ? 'text-white/80' : 'text-white/15'">{{ step.label }}</p>
                    <div v-if="i === currentStep" class="mt-1.5 h-[2px] w-20 overflow-hidden rounded-full bg-white/[0.04]">
                      <div class="h-full rounded-full" :style="{ backgroundColor: primaryColor, animation: `bld-fill ${step.duration}ms linear forwards` }" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Preview -->
            <div class="flex-1">
              <div class="overflow-hidden rounded-2xl border border-white/[0.06] transition-all duration-1000" :style="{ boxShadow: `0 30px 120px ${primaryColor}08` }">
                <!-- Browser chrome -->
                <div class="flex items-center gap-2 border-b border-white/[0.03] bg-white/[0.015] px-4 py-2.5">
                  <span class="h-2 w-2 rounded-full bg-white/10" />
                  <span class="h-2 w-2 rounded-full bg-white/10" />
                  <span class="h-2 w-2 rounded-full bg-white/10" />
                  <div class="mx-3 flex-1 rounded-md bg-white/[0.03] px-3 py-1 text-center text-[10px] font-mono text-white/15">
                    {{ previewDomain }}
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="h-1.5 w-1.5 rounded-full bld-pulse" :style="{ backgroundColor: currentStep >= 1 ? '#34d399' : 'rgba(255,255,255,0.1)' }" />
                    <span class="text-[8px] uppercase tracking-widest" :class="currentStep >= 1 ? 'text-emerald-400/50' : 'text-white/10'">Live</span>
                  </div>
                </div>

                <!-- Preview body -->
                <div
                  class="relative min-h-[440px] p-6 transition-all duration-1000 md:min-h-[520px] md:p-10"
                  :style="{ backgroundColor: currentStep >= 1 ? brand.colors.background : '#09090b', color: currentStep >= 1 ? brand.colors.text : '#222' }"
                >
                  <!-- Bloom glow -->
                  <div
                    class="absolute inset-0 transition-opacity duration-1500"
                    :style="{ opacity: currentStep >= 1 ? 0.25 : 0, background: `radial-gradient(ellipse at 20% 30%, ${primaryColor}20, transparent 60%)` }"
                  />

                  <!-- Nav -->
                  <div class="relative mb-10 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white transition-all duration-700" :style="{ backgroundColor: currentStep >= 1 ? brand.colors.primary : '#151515' }">
                        {{ currentStep >= 3 && brandName ? brandName.charAt(0).toUpperCase() : '?' }}
                      </div>
                      <span
                        class="text-sm font-semibold transition-all duration-700"
                        :class="currentStep >= 2 ? 'bld-text-focus' : 'opacity-20'"
                        :style="{ fontFamily: currentStep >= 2 ? `'${brand.font.family}', sans-serif` : 'inherit' }"
                      >
                        {{ currentStep >= 3 ? brandName : scrambledName }}
                      </span>
                    </div>
                    <div class="rounded-lg px-4 py-1.5 text-[11px] font-medium text-white transition-all duration-700" :style="{ backgroundColor: currentStep >= 1 ? brand.colors.primary : '#151515' }">
                      Comecar
                    </div>
                  </div>

                  <!-- Hero text -->
                  <div class="relative mb-10">
                    <div class="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[9px] uppercase tracking-[0.2em] transition-all duration-700" :style="{ borderColor: currentStep >= 1 ? `${brand.colors.primary}25` : '#151515', color: currentStep >= 1 ? brand.colors.primary : '#222', backgroundColor: currentStep >= 1 ? `${brand.colors.primary}06` : 'transparent' }">
                      <span class="h-1.5 w-1.5 rounded-full" :class="currentStep >= 4 ? 'animate-pulse' : ''" :style="{ backgroundColor: currentStep >= 1 ? brand.colors.primary : '#222' }" />
                      {{ currentStep >= 4 ? 'Ao Vivo' : '•••' }}
                    </div>
                    <h2
                      class="mb-3 text-2xl font-extrabold leading-tight tracking-tight transition-all duration-1000 md:text-4xl"
                      :class="currentStep >= 2 ? 'bld-text-focus' : ''"
                      :style="{ fontFamily: currentStep >= 2 ? `'${brand.font.family}', sans-serif` : 'inherit', color: currentStep >= 3 ? brand.colors.text : '#1a1a1a' }"
                    >
                      {{ currentStep >= 3 ? `Investir com ${brandName}.` : 'Sua tagline aqui.' }}
                    </h2>
                    <p class="max-w-sm text-sm leading-relaxed transition-all duration-700" :style="{ color: currentStep >= 3 ? brand.colors.textMuted : '#181818' }">
                      {{ currentStep >= 3 ? `Analise ativos, acompanhe dividendos e invista com inteligencia.` : '••••••••••••••••••••••••••' }}
                    </p>
                  </div>

                  <!-- Ticker cards -->
                  <div class="relative grid grid-cols-3 gap-3">
                    <div
                      v-for="(t, i) in mockTickers"
                      :key="t.symbol"
                      class="rounded-xl border p-3.5 transition-all duration-700"
                      :style="{
                        borderColor: currentStep >= 1 ? (brand.colors.border || '#1a1a1a') : '#111',
                        backgroundColor: currentStep >= 1 ? (brand.colors.surface || '#0a0a0a') : '#0b0b0d',
                        transform: currentStep >= 4 ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.97)',
                        opacity: currentStep >= 4 ? 1 : 0.15,
                        transitionDelay: `${i * 150}ms`,
                      }"
                    >
                      <div class="flex items-center gap-2 mb-2">
                        <div class="h-6 w-6 rounded-md transition-colors duration-700" :style="{ backgroundColor: currentStep >= 1 ? `${brand.colors.primary}20` : '#151515' }" />
                        <span class="text-[11px] font-bold">{{ currentStep >= 4 ? t.symbol : '----' }}</span>
                      </div>
                      <div class="flex items-baseline justify-between">
                        <span class="text-sm font-semibold tabular-nums">{{ currentStep >= 4 ? t.price : 'R$ --' }}</span>
                        <span class="text-[10px] font-bold tabular-nums" :style="{ color: currentStep >= 4 ? (t.positive ? '#4ade80' : '#ef4444') : '#222' }">
                          {{ currentStep >= 4 ? t.change : '--' }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- AI bubble -->
                  <Transition name="bubble">
                    <div v-if="currentStep >= 5" class="absolute bottom-5 right-5 flex items-center gap-3 rounded-2xl border px-4 py-2.5 md:bottom-8 md:right-8" :style="{ backgroundColor: brand.colors.surface, borderColor: `${brand.colors.primary}15`, boxShadow: `0 8px 40px ${brand.colors.primary}08` }">
                      <div class="flex h-8 w-8 items-center justify-center rounded-lg" :style="{ backgroundColor: brand.colors.primary }">
                        <UIcon name="i-lucide-bot" class="size-3.5 text-white" />
                      </div>
                      <div>
                        <p class="text-[11px] font-semibold">Assessor IA</p>
                        <p class="text-[9px] text-white/40">Online agora</p>
                      </div>
                      <span class="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                    </div>
                  </Transition>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Transition>

    <!-- ============================================ -->
    <!-- PHASE 4: REVEAL                             -->
    <!-- ============================================ -->
    <Transition name="phase-zoom">
      <section v-if="phase === 'reveal'" key="reveal" class="relative z-10 flex min-h-[80vh] flex-col items-center justify-center px-6 py-16">
        <div class="w-full max-w-4xl text-center">
          <div class="bld-reveal mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/[0.03] px-5 py-2">
            <UIcon name="i-lucide-check-circle" class="size-4 text-emerald-400" />
            <span class="text-[10px] font-medium uppercase tracking-[0.25em] text-emerald-400/80">Plataforma gerada</span>
          </div>

          <h2 class="bld-reveal bld-d1 mb-3 text-4xl font-extrabold tracking-tight md:text-6xl">
            <span class="bld-gradient-text" :style="{ '--g-from': primaryColor, '--g-to': '#fff' } as any">{{ brandName }}</span>
            esta pronta.
          </h2>
          <p class="bld-reveal bld-d2 mx-auto mb-8 max-w-md text-sm text-white/30">
            Sua plataforma white-label foi criada com sucesso.
          </p>

          <!-- Stats counter -->
          <div class="bld-reveal bld-d2 mx-auto mb-12 flex max-w-lg justify-center gap-8 md:gap-14">
            <div v-for="stat in revealStats" :key="stat.label" class="text-center">
              <p class="text-3xl font-extrabold tabular-nums md:text-4xl" :style="{ color: primaryColor }">
                <span ref="counterEls">{{ stat.current }}</span>{{ stat.suffix }}
              </p>
              <p class="mt-1 text-[10px] uppercase tracking-widest text-white/20">{{ stat.label }}</p>
            </div>
          </div>

          <!-- Preview -->
          <div class="bld-reveal bld-d3 mx-auto mb-12 max-w-3xl overflow-hidden rounded-2xl border border-white/[0.06]" :style="{ boxShadow: `0 40px 140px ${primaryColor}10` }">
            <div class="flex items-center gap-2 border-b border-white/[0.03] bg-white/[0.015] px-4 py-2.5">
              <span class="h-2 w-2 rounded-full bg-white/10" /><span class="h-2 w-2 rounded-full bg-white/10" /><span class="h-2 w-2 rounded-full bg-white/10" />
              <div class="mx-3 flex-1 rounded-md bg-white/[0.03] px-3 py-1 text-center text-[10px] font-mono text-white/15">{{ previewDomain }}</div>
            </div>
            <div class="p-8 text-left md:p-12" :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }">
              <div class="mb-5 flex items-center gap-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold text-white" :style="{ backgroundColor: brand.colors.primary }">{{ brandName.charAt(0).toUpperCase() }}</div>
                <span class="text-lg font-bold" :style="{ fontFamily: `'${brand.font.family}', sans-serif` }">{{ brandName }}</span>
              </div>
              <h3 class="mb-2 text-2xl font-extrabold md:text-3xl" :style="{ fontFamily: `'${brand.font.family}', sans-serif` }">Investir com {{ brandName }}.</h3>
              <p class="mb-6 text-sm" :style="{ color: brand.colors.textMuted }">Analise ativos, acompanhe dividendos e invista com inteligencia.</p>
              <div class="flex gap-3">
                <span class="rounded-xl px-6 py-2.5 text-sm font-medium text-white" :style="{ backgroundColor: brand.colors.primary }">Criar conta</span>
                <span class="rounded-xl border px-6 py-2.5 text-sm" :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted }">Saiba mais</span>
              </div>
            </div>
          </div>

          <div class="bld-reveal bld-d4 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button class="group relative inline-flex items-center gap-3 rounded-2xl px-12 py-5 text-sm font-semibold uppercase tracking-wider text-white transition-all duration-500 hover:scale-[1.04]" :style="{ backgroundColor: primaryColor }" @click="showContactModal = true">
              <div class="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" :style="{ boxShadow: `0 0 80px ${primaryColor}50, inset 0 0 30px ${primaryColor}30` }" />
              <UIcon name="i-lucide-rocket" class="relative size-4" />
              <span class="relative">Quero essa plataforma</span>
            </button>
            <NuxtLink to="/whitelabel" class="inline-flex items-center gap-2 rounded-2xl border border-white/[0.06] px-10 py-5 text-sm text-white/30 transition hover:text-white/50">
              Saiba mais <UIcon name="i-lucide-arrow-right" class="size-4" />
            </NuxtLink>
          </div>
        </div>
      </section>
    </Transition>

    <!-- ========== CONTACT MODAL ========== -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showContactModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-lg" @click.self="showContactModal = false">
          <div class="w-full max-w-md rounded-2xl border border-white/[0.06] bg-[#060609] p-8 shadow-2xl" :style="{ boxShadow: `0 40px 120px ${primaryColor}08` }">
            <div class="mb-8 flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold">Quero minha plataforma</h3>
                <p class="mt-1 text-xs text-white/25">Responderemos em 24h.</p>
              </div>
              <button class="flex h-8 w-8 items-center justify-center rounded-lg text-white/15 transition hover:bg-white/5 hover:text-white/40" @click="showContactModal = false">
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </div>
            <div class="flex flex-col gap-3">
              <input v-for="field in contactFields" :key="field.key" v-model="(contactForm as any)[field.key]" :type="field.type" :placeholder="field.placeholder" class="w-full rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/15 focus:border-white/10" />
              <button class="mt-2 w-full rounded-xl py-4 text-sm font-semibold text-white transition hover:opacity-90" :style="{ backgroundColor: primaryColor }" @click="submitContact">
                Enviar
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { brand as defaultBrand } from '~/config/brand'

definePageMeta({ layout: false, isPublicRoute: true, hideInstallAppBanner: true })

useHead({
  title: 'Builder — Crie sua plataforma de investimentos',
  meta: [{ name: 'robots', content: 'noindex,nofollow' }],
  link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300..800&family=Montserrat:wght@300..800&family=Poppins:wght@300..800&family=Barlow:wght@300..800&family=Raleway:wght@300..800&display=swap' }],
})

const brand = useBrand()

// State
const phase = ref<'input' | 'analysis' | 'build' | 'reveal'>('input')
const currentStep = ref(0)
const brandName = ref('')
const primaryColor = ref('#FF5900')
const terminalTyping = ref(false)
const terminalProgress = ref(0)
const showSweep = ref(false)
const showContactModal = ref(false)
const mouse = reactive({ x: 0, y: 0 })
const scrambledName = ref('••••••')

const visibleTerminalLines = ref<Array<{ text: string; displayed: string; color?: string; done?: boolean }>>([])
const contactForm = reactive({ name: '', email: '', youtube: '', whatsapp: '' })
const contactFields = [
  { key: 'name', type: 'text', placeholder: 'Seu nome' },
  { key: 'email', type: 'email', placeholder: 'Seu melhor email' },
  { key: 'youtube', type: 'text', placeholder: 'Canal do YouTube (opcional)' },
  { key: 'whatsapp', type: 'text', placeholder: 'WhatsApp (opcional)' },
]

// Reveal counter stats
const revealStats = reactive([
  { current: 0, target: 40, suffix: '+', label: 'Ferramentas' },
  { current: 0, target: 800, suffix: '+', label: 'Ativos' },
  { current: 0, target: 24, suffix: '/7', label: 'Disponivel' },
])

// Brand snapshot
const originalBrand = ref<Record<string, any>>({})
onMounted(() => {
  originalBrand.value = JSON.parse(JSON.stringify(brand))
  initRevealObserver()
})
onUnmounted(() => {
  if (Object.keys(originalBrand.value).length) Object.assign(brand, originalBrand.value)
})

// Mouse tracking
function onMouseMove(e: MouseEvent) {
  mouse.x = e.clientX
  mouse.y = e.clientY
}

// Particle styles
function particleStyle(n: number) {
  const size = 1 + (n % 3)
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${(n * 8.3) % 100}%`,
    bottom: '-4px',
    opacity: 0.15 + (n % 4) * 0.05,
    animation: `bld-rise ${12 + n * 2}s linear infinite`,
    animationDelay: `${n * 1.1}s`,
  }
}

// Scroll reveal observer
function initRevealObserver() {
  if (typeof IntersectionObserver === 'undefined') return
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('bld-visible'); obs.unobserve(e.target) } })
  }, { threshold: 0.1 })
  document.querySelectorAll('.bld-reveal').forEach((el) => obs.observe(el))
}

watch(phase, () => { nextTick(() => initRevealObserver()) })

// Constants
const colorPresets = [
  { hex: '#FF5900', label: 'Laranja' }, { hex: '#FACC15', label: 'Amarelo' },
  { hex: '#DC2626', label: 'Vermelho' }, { hex: '#4ADE80', label: 'Verde' },
  { hex: '#3B82F6', label: 'Azul' }, { hex: '#8B5CF6', label: 'Roxo' },
  { hex: '#EC4899', label: 'Rosa' }, { hex: '#14B8A6', label: 'Teal' },
]

const mockTickers = [
  { symbol: 'PETR4', price: 'R$ 38,72', change: '+2.34%', positive: true },
  { symbol: 'VALE3', price: 'R$ 62,15', change: '-0.87%', positive: false },
  { symbol: 'ITUB4', price: 'R$ 33,90', change: '+1.12%', positive: true },
]

const buildSteps = [
  { label: 'Cores', icon: 'i-lucide-palette', duration: 3000 },
  { label: 'Tipografia', icon: 'i-lucide-type', duration: 3000 },
  { label: 'Identidade', icon: 'i-lucide-fingerprint', duration: 3500 },
  { label: 'Dados', icon: 'i-lucide-trending-up', duration: 3500 },
  { label: 'Features', icon: 'i-lucide-puzzle', duration: 3000 },
]

const previewDomain = computed(() => {
  const slug = brandName.value ? brandName.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : 'sua-marca'
  return `invest.${slug}.com.br`
})

// Helpers
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0; const l = (max + min) / 2
  if (max !== min) { const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min); if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6; else if (max === g) h = ((b - r) / d + 2) / 6; else h = ((r - g) / d + 4) / 6 }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}
function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100; const a = s * Math.min(l, 1 - l)
  const f = (n: number) => { const k = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1))).toString(16).padStart(2, '0') }
  return `#${f(0)}${f(8)}${f(4)}`
}
function darkenHex(hex: string, factor: number) { const [h, s, l] = hexToHsl(hex); return hslToHex(h, s, Math.max(0, Math.round(l * (1 - factor)))) }

function derivePalette(primary: string) {
  return { primary, secondary: darkenHex(primary, 0.15), tertiary: '#0A0A0A', positive: '#4ADE80', negative: '#EF4444', neutral: '#6B7280', background: '#000000', surface: '#0A0A0A', surfaceHover: '#131313', border: '#1F1F1F', text: '#FFFFFF', textMuted: '#9CA3AF', inputBg: '#05070b', inputBgHover: '#070b12', inputBorder: '#1f2937', gradient: { from: primary, via: darkenHex(primary, 0.15), to: darkenHex(primary, 0.3) } }
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
  const f = fontOptions[idx]
  return { family: f.family, google: f.google, headingWeight: 'font-extrabold', headingStyle: 'uppercase tracking-wide' }
}

// Text scramble effect
async function scrambleText(target: string, duration: number = 600) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*'
  const steps = 12
  const stepDuration = duration / steps
  for (let i = 0; i <= steps; i++) {
    const resolved = Math.floor((i / steps) * target.length)
    let result = target.slice(0, resolved)
    for (let j = resolved; j < target.length; j++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
    scrambledName.value = result
    await sleep(stepDuration)
  }
  scrambledName.value = target
}

// Typewriter terminal
async function typewriteLine(text: string, color?: string) {
  const line = reactive({ text, displayed: '', color, done: false })
  visibleTerminalLines.value.push(line)
  for (let i = 0; i <= text.length; i++) {
    line.displayed = text.slice(0, i)
    await sleep(18 + Math.random() * 12)
  }
  line.done = true
  await sleep(200)
}

async function runTerminalAnimation() {
  terminalTyping.value = true
  terminalProgress.value = 0
  const lines = [
    { text: `Analisando marca "${brandName.value}"...` },
    { text: `Extraindo paleta: ${primaryColor.value}`, color: primaryColor.value },
    { text: `Tipografia selecionada: ${pickFont(brandName.value).family}` },
    { text: 'Configurando 40+ ferramentas de investimento...' },
    { text: 'Compilando plataforma...', color: '#FACC15' },
    { text: 'Deploy completo.', color: '#34D399' },
  ]
  for (let i = 0; i < lines.length; i++) {
    terminalProgress.value = ((i + 1) / lines.length) * 100
    await typewriteLine(lines[i].text, lines[i].color)
    await sleep(250)
  }
  terminalTyping.value = false
  await sleep(600)
}

// Light sweep transition
async function sweep() {
  showSweep.value = true
  await sleep(500)
  showSweep.value = false
}

// Build sequence
async function runStep(idx: number, mutation: () => void) {
  currentStep.value = idx
  await sleep(500)
  mutation()
  await sleep(buildSteps[idx].duration)
}

// Counter animation
function animateCounters() {
  revealStats.forEach((stat) => {
    const duration = 1500
    const start = performance.now()
    const step = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      stat.current = Math.round(eased * stat.target)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  })
}

async function startBuild() {
  if (!brandName.value.trim()) return

  // Scramble name in preview during build
  scrambleText(brandName.value, 800)

  await sweep()
  phase.value = 'analysis'
  await runTerminalAnimation()

  await sweep()
  phase.value = 'build'

  await runStep(0, () => { Object.assign(brand, { colors: derivePalette(primaryColor.value) }) })
  await runStep(1, () => { Object.assign(brand, { font: pickFont(brandName.value) }) })
  await runStep(2, () => { Object.assign(brand, { name: brandName.value, shortName: brandName.value, tagline: `Investir com ${brandName.value}.` }) })
  await runStep(3, () => { /* tickers populate visually */ })
  await runStep(4, () => { Object.assign(brand, { features: { showAIAdvisor: true, showCalculators: true, showDividends: true, showNews: true, showAppStoreLinks: true, showDownloadPage: true, showFounderPhoto: false, showEcosystemLinks: false, showGlossary: true, showGuides: true } }) })

  await sweep()
  phase.value = 'reveal'
  await sleep(400)
  animateCounters()
}

function submitContact() {
  showContactModal.value = false
  showSuccessNotification('Enviado!', 'Entraremos em contato em ate 24h.')
}
</script>

<style scoped>
/* ---- Phase zoom transitions ---- */
.phase-zoom-enter-active { transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1), filter 0.7s ease; }
.phase-zoom-leave-active { transition: opacity 0.4s ease, transform 0.4s ease, filter 0.4s ease; position: absolute; width: 100%; }
.phase-zoom-enter-from { opacity: 0; transform: scale(0.96) translateY(20px); filter: blur(8px); }
.phase-zoom-leave-to { opacity: 0; transform: scale(1.02); filter: blur(4px); }

/* ---- Scroll reveal ---- */
.bld-reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1); }
.bld-reveal.bld-visible { opacity: 1; transform: translateY(0); }
.bld-d1 { transition-delay: 120ms; } .bld-d2 { transition-delay: 240ms; } .bld-d3 { transition-delay: 360ms; } .bld-d4 { transition-delay: 480ms; }

/* ---- Dot grid background ---- */
.bld-grid {
  background-image: radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse at 50% 50%, black 30%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse at 50% 50%, black 30%, transparent 70%);
}

/* ---- Floating orbs ---- */
.bld-orb { animation: bld-float 16s ease-in-out infinite; }
@keyframes bld-float {
  0%, 100% { transform: translate(0,0) scale(1); }
  33% { transform: translate(50px,-35px) scale(1.1); }
  66% { transform: translate(-30px,25px) scale(0.92); }
}

/* ---- Rising particles ---- */
@keyframes bld-rise {
  0% { transform: translateY(0) scale(1); opacity: 0; }
  10% { opacity: 0.2; }
  90% { opacity: 0.05; }
  100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
}

/* ---- Gradient text ---- */
.bld-gradient-text {
  background: linear-gradient(135deg, var(--g-from), var(--g-to));
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}

/* ---- Light sweep ---- */
.bld-sweep {
  background: linear-gradient(90deg, transparent 0%, var(--sweep-color) 50%, transparent 100%);
  opacity: 0.15;
  animation: bld-sweep-move 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
}
@keyframes bld-sweep-move {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.sweep-enter-active { transition: opacity 0.1s; }
.sweep-leave-active { transition: opacity 0.3s 0.3s; }
.sweep-enter-from, .sweep-leave-to { opacity: 0; }

/* ---- Terminal ---- */
.bld-pulse { animation: bld-pulse-kf 2s ease-in-out infinite; }
@keyframes bld-pulse-kf { 0%,100% { opacity:1; } 50% { opacity:0.15; } }
.bld-cursor { animation: bld-blink 1s step-end infinite; }
@keyframes bld-blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
@keyframes bld-fill { from { width:0; } to { width:100%; } }

/* ---- Text focus ---- */
.bld-text-focus { animation: bld-focus 0.9s cubic-bezier(0.16,1,0.3,1) both; }
@keyframes bld-focus { 0% { filter:blur(8px); opacity:0.2; } 100% { filter:blur(0); opacity:1; } }

/* ---- Scale in ---- */
@keyframes bld-scale-in { from { opacity:0; transform:scale(0.94) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }

/* ---- Fade down ---- */
@keyframes bld-fade-down { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }

/* ---- Bubble ---- */
.bubble-enter-active { transition: all 0.7s cubic-bezier(0.16,1,0.3,1); }
.bubble-leave-active { transition: all 0.3s ease; }
.bubble-enter-from { opacity:0; transform: translateY(40px) scale(0.85); }
.bubble-leave-to { opacity:0; transform: translateY(10px); }

/* ---- Modal ---- */
.modal-enter-active { transition: all 0.35s ease; }
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity:0; }
.modal-enter-from > :last-child { transform: scale(0.94) translateY(12px); opacity:0; }
.modal-enter-active > :last-child { transition: all 0.35s cubic-bezier(0.16,1,0.3,1); }
</style>
