<template>
  <div class="builder-page min-h-screen overflow-x-hidden bg-[#030305] text-white antialiased" :style="{ fontFamily: `'Inter', system-ui, sans-serif` }">
    <!-- Background orbs (animated float) -->
    <div class="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        class="bld-orb absolute -left-40 -top-40 h-[700px] w-[700px] rounded-full blur-[160px]"
        :style="{ backgroundColor: primaryColor, opacity: phase === 'input' ? 0.12 : 0.2, animationDelay: '0s' }"
      />
      <div class="bld-orb absolute -bottom-60 -right-40 h-[500px] w-[500px] rounded-full bg-blue-600 opacity-10 blur-[140px]" style="animation-delay: -4s" />
      <div class="bld-orb absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full opacity-[0.06] blur-[120px]" :style="{ backgroundColor: primaryColor, animationDelay: '-8s' }" />
      <!-- Noise texture overlay -->
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')" />
    </div>

    <!-- Nav (fade in) -->
    <nav class="bld-fade-in relative z-20 flex items-center justify-between px-6 py-5 md:px-12">
      <NuxtLink to="/" class="flex items-center gap-2 text-white/40 transition hover:text-white/70">
        <UIcon name="i-lucide-arrow-left" class="size-4" />
        <span class="text-sm">Voltar</span>
      </NuxtLink>
      <span class="text-[10px] uppercase tracking-[0.25em] text-white/20">Builder</span>
    </nav>

    <!-- ============================== -->
    <!-- PHASE 1: INPUT                 -->
    <!-- ============================== -->
    <Transition name="phase">
      <section v-if="phase === 'input'" key="input" class="relative z-10 flex min-h-[80vh] flex-col items-center justify-center px-6">
        <div class="w-full max-w-lg text-center">
          <!-- Badge -->
          <div class="bld-reveal mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-5 py-2 text-[11px] uppercase tracking-widest text-white/40">
            <UIcon name="i-lucide-wand-sparkles" class="size-3.5" :style="{ color: primaryColor }" />
            Crie em 30 segundos
          </div>

          <!-- Title -->
          <h1 class="bld-reveal bld-reveal-d1 mb-4 text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl">
            Crie sua plataforma<br />
            <span class="bld-shimmer" :style="{ '--shimmer-color': primaryColor } as any">de investimentos</span>
          </h1>
          <p class="bld-reveal bld-reveal-d2 mx-auto mb-12 max-w-sm text-sm leading-relaxed text-white/35">
            Digite o nome da sua marca, escolha uma cor e veja sua plataforma ganhar vida.
          </p>

          <!-- Brand name input -->
          <div class="bld-reveal bld-reveal-d3 mb-6">
            <input
              ref="nameInput"
              v-model="brandName"
              type="text"
              placeholder="Nome da sua marca"
              class="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 py-5 text-center text-lg font-medium text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-white/15 focus:bg-white/[0.05] focus:shadow-[0_0_40px_rgba(255,255,255,0.03)]"
              @keyup.enter="brandName.trim() && startBuild()"
            />
          </div>

          <!-- Color presets -->
          <div class="bld-reveal bld-reveal-d4 mb-10">
            <p class="mb-4 text-[10px] uppercase tracking-[0.2em] text-white/20">Cor primaria</p>
            <div class="flex flex-wrap items-center justify-center gap-3">
              <button
                v-for="(c, i) in colorPresets"
                :key="c.hex"
                class="group relative h-11 w-11 rounded-full border-2 transition-all duration-300 hover:scale-110"
                :class="primaryColor === c.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:border-white/20'"
                :style="{ backgroundColor: c.hex, boxShadow: primaryColor === c.hex ? `0 0 20px ${c.hex}50` : 'none', transitionDelay: `${i * 30}ms` }"
                :title="c.label"
                @click="primaryColor = c.hex"
              >
                <Transition name="check">
                  <UIcon v-if="primaryColor === c.hex" name="i-lucide-check" class="absolute inset-0 m-auto size-4 text-white drop-shadow-lg" />
                </Transition>
              </button>
              <label class="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-white/10 transition-all duration-300 hover:border-white/25 hover:bg-white/5">
                <UIcon name="i-lucide-pipette" class="size-4 text-white/30" />
                <input type="color" v-model="primaryColor" class="absolute inset-0 cursor-pointer opacity-0" />
              </label>
            </div>
          </div>

          <!-- CTA -->
          <button
            :disabled="!brandName.trim()"
            class="bld-reveal bld-reveal-d4 group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl px-10 py-5 text-base font-semibold text-white transition-all duration-300 hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-20"
            :style="{ backgroundColor: primaryColor }"
            @click="startBuild"
          >
            <!-- Glow -->
            <div class="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" :style="{ boxShadow: `inset 0 0 40px ${primaryColor}60, 0 0 60px ${primaryColor}30` }" />
            <UIcon name="i-lucide-wand-sparkles" class="relative size-5" />
            <span class="relative">Gerar plataforma</span>
            <UIcon name="i-lucide-arrow-right" class="relative size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </section>
    </Transition>

    <!-- ============================== -->
    <!-- PHASE 2: ANALYSIS (terminal)   -->
    <!-- ============================== -->
    <Transition name="phase">
      <section v-if="phase === 'analysis'" key="analysis" class="relative z-10 flex min-h-[80vh] flex-col items-center justify-center px-6">
        <div class="w-full max-w-2xl">
          <!-- Centered brand text above terminal -->
          <div class="mb-8 text-center">
            <p class="bld-fade-in mb-2 text-[10px] uppercase tracking-[0.3em] text-white/25">Analisando</p>
            <h2 class="bld-fade-in text-3xl font-bold" :style="{ color: primaryColor }">{{ brandName }}</h2>
          </div>

          <!-- Terminal window -->
          <div class="bld-fade-in overflow-hidden rounded-2xl border border-white/[0.08] bg-[#08080c] shadow-2xl" :style="{ boxShadow: `0 0 80px ${primaryColor}08` }">
            <!-- Title bar -->
            <div class="flex items-center gap-2 border-b border-white/[0.04] px-5 py-3">
              <span class="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/70" />
              <span class="h-2.5 w-2.5 rounded-full bg-[#febc2e]/70" />
              <span class="h-2.5 w-2.5 rounded-full bg-[#28c840]/70" />
              <span class="ml-auto flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/20">
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-400" style="animation: bld-terminal-pulse 2s ease-in-out infinite" />
                AI Engine v2
              </span>
            </div>
            <!-- Terminal body -->
            <div class="p-6 font-mono text-sm leading-[1.8]">
              <div v-for="(line, i) in visibleTerminalLines" :key="i" class="flex items-start gap-3">
                <span class="shrink-0 select-none text-emerald-500/40">$</span>
                <span :style="{ color: line.color || 'rgba(255,255,255,0.55)' }">
                  {{ line.text }}
                  <span v-if="line.done" class="ml-1.5 text-emerald-400">✓</span>
                </span>
              </div>
              <!-- Progress bar for current operation -->
              <div v-if="terminalTyping" class="mt-3 flex items-center gap-3">
                <span class="shrink-0 select-none text-emerald-500/40">$</span>
                <div class="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div class="h-full rounded-full" :style="{ backgroundColor: primaryColor, animation: 'bld-bar-fill 0.8s cubic-bezier(0.16,1,0.3,1) forwards' }" />
                </div>
              </div>
              <!-- Blinking cursor -->
              <div v-if="terminalTyping" class="mt-1 flex items-start gap-3">
                <span class="shrink-0 select-none text-emerald-500/40">$</span>
                <span class="text-white/30" style="animation: bld-blink 1s step-end infinite">_</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Transition>

    <!-- ============================== -->
    <!-- PHASE 3: BUILD                 -->
    <!-- ============================== -->
    <Transition name="phase">
      <section v-if="phase === 'build'" key="build" class="relative z-10 px-6 py-8 md:px-12">
        <div class="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:gap-16">
          <!-- Left: Step timeline -->
          <div class="w-full shrink-0 lg:w-60">
            <p class="mb-8 text-[10px] uppercase tracking-[0.3em] text-white/20">Construindo plataforma</p>
            <div class="flex flex-row gap-1 overflow-x-auto pb-4 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
              <div
                v-for="(step, i) in buildSteps"
                :key="i"
                class="flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 transition-all duration-700 lg:rounded-none lg:border-l-2 lg:px-0 lg:pl-5"
                :class="[
                  i < currentStep ? 'lg:border-emerald-400/40 bg-emerald-400/5 lg:bg-transparent' : i === currentStep ? 'lg:border-white/60 bg-white/5 lg:bg-transparent' : 'lg:border-white/[0.06]',
                ]"
              >
                <div
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-700"
                  :class="[
                    i < currentStep ? 'bg-emerald-400/10 text-emerald-400' : i === currentStep ? 'text-white' : 'text-white/15',
                  ]"
                  :style="i === currentStep ? { backgroundColor: `${primaryColor}20`, color: primaryColor } : {}"
                >
                  <UIcon v-if="i < currentStep" name="i-lucide-check" class="size-4" />
                  <UIcon v-else :name="step.icon" class="size-4" />
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium transition-colors duration-500" :class="i <= currentStep ? 'text-white' : 'text-white/20'">
                    {{ step.label }}
                  </p>
                  <!-- Progress bar for active step -->
                  <div v-if="i === currentStep" class="mt-1.5 h-0.5 w-24 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      class="h-full rounded-full"
                      :style="{ backgroundColor: primaryColor, animation: `bld-bar-fill ${step.duration}ms linear forwards` }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Live preview -->
          <div class="flex-1">
            <div
              class="overflow-hidden rounded-2xl border border-white/[0.08] transition-all duration-1000"
              :style="{ boxShadow: `0 25px 100px ${primaryColor}10, 0 0 0 1px ${primaryColor}08` }"
            >
              <!-- Browser chrome -->
              <div class="flex items-center gap-2 border-b border-white/[0.04] bg-white/[0.02] px-4 py-2.5">
                <span class="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/40" />
                <span class="h-2.5 w-2.5 rounded-full bg-[#febc2e]/40" />
                <span class="h-2.5 w-2.5 rounded-full bg-[#28c840]/40" />
                <div class="mx-4 flex-1 rounded-lg bg-white/[0.03] px-4 py-1.5 text-center text-[11px] font-mono text-white/20">
                  {{ previewDomain }}
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="h-1.5 w-1.5 rounded-full" :class="currentStep >= 1 ? 'bg-emerald-400' : 'bg-white/10'" style="animation: bld-terminal-pulse 2s ease-in-out infinite" />
                  <span class="text-[9px] uppercase tracking-widest" :class="currentStep >= 1 ? 'text-emerald-400/60' : 'text-white/10'">Live</span>
                </div>
              </div>

              <!-- Preview content -->
              <div
                class="relative min-h-[420px] overflow-hidden p-6 transition-all duration-1000 md:min-h-[520px] md:p-10"
                :style="{
                  backgroundColor: currentStep >= 1 ? brand.colors.background : '#0c0c0e',
                  color: currentStep >= 1 ? brand.colors.text : '#333',
                }"
              >
                <!-- Bloom effect on step 1 -->
                <Transition name="bloom">
                  <div
                    v-if="currentStep >= 1 && currentStep < 3"
                    class="absolute inset-0 opacity-30"
                    :style="{ background: `radial-gradient(circle at 30% 40%, ${primaryColor}25, transparent 60%)` }"
                  />
                </Transition>

                <!-- Nav mockup -->
                <div class="relative mb-10 flex items-center justify-between transition-all duration-700">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white transition-all duration-700"
                      :style="{ backgroundColor: currentStep >= 1 ? brand.colors.primary : '#1a1a1a' }"
                    >
                      <Transition name="check" mode="out-in">
                        <span :key="currentStep >= 3 ? 'letter' : 'q'">{{ currentStep >= 3 && brandName ? brandName.charAt(0).toUpperCase() : '?' }}</span>
                      </Transition>
                    </div>
                    <span
                      class="text-sm font-semibold transition-all duration-700"
                      :style="{
                        fontFamily: currentStep >= 2 ? `'${brand.font.family}', sans-serif` : 'inherit',
                        color: currentStep >= 3 ? brand.colors.text : '#444',
                        filter: currentStep === 2 ? 'blur(0px)' : undefined,
                      }"
                      :class="currentStep >= 2 ? 'bld-text-focus' : ''"
                    >
                      {{ currentStep >= 3 ? brandName : '••••••' }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="h-8 rounded-lg px-4 py-1.5 text-xs font-medium text-white/80 transition-all duration-700" :style="{ backgroundColor: currentStep >= 1 ? brand.colors.primary : '#1a1a1a' }">
                      Comecar
                    </div>
                  </div>
                </div>

                <!-- Hero mockup -->
                <div class="relative mb-10">
                  <div
                    class="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] transition-all duration-700"
                    :style="{
                      borderColor: currentStep >= 1 ? `${brand.colors.primary}30` : '#1a1a1a',
                      color: currentStep >= 1 ? brand.colors.primary : '#333',
                      backgroundColor: currentStep >= 1 ? `${brand.colors.primary}08` : 'transparent',
                    }"
                  >
                    <span class="h-1.5 w-1.5 rounded-full transition-colors duration-500" :class="currentStep >= 4 ? 'animate-pulse' : ''" :style="{ backgroundColor: currentStep >= 1 ? brand.colors.primary : '#333' }" />
                    {{ currentStep >= 4 ? 'Ao Vivo' : 'Status' }}
                  </div>

                  <h2
                    class="mb-3 text-2xl font-extrabold leading-tight tracking-tight transition-all duration-1000 md:text-4xl"
                    :style="{
                      fontFamily: currentStep >= 2 ? `'${brand.font.family}', sans-serif` : 'inherit',
                      color: currentStep >= 3 ? brand.colors.text : '#2a2a2a',
                    }"
                    :class="currentStep >= 2 ? 'bld-text-focus' : ''"
                  >
                    {{ currentStep >= 3 ? `Investir com ${brandName}.` : 'Sua tagline aqui.' }}
                  </h2>
                  <p class="max-w-md text-sm leading-relaxed transition-all duration-700" :style="{ color: currentStep >= 3 ? brand.colors.textMuted : '#222' }">
                    {{ currentStep >= 3 ? `A plataforma de investimentos do ${brandName}. Analise ativos, acompanhe dividendos e invista com inteligencia.` : 'Descricao da sua plataforma personalizada.' }}
                  </p>
                </div>

                <!-- Ticker cards mockup -->
                <div class="relative grid grid-cols-3 gap-3">
                  <div
                    v-for="(ticker, i) in mockTickers"
                    :key="ticker.symbol"
                    class="rounded-xl border p-3.5 transition-all duration-700"
                    :style="{
                      borderColor: currentStep >= 1 ? (brand.colors.border || '#1a1a1a') : '#151515',
                      backgroundColor: currentStep >= 1 ? (brand.colors.surface || '#0a0a0a') : '#0e0e10',
                      transform: currentStep >= 4 ? 'translateY(0)' : 'translateY(4px)',
                      opacity: currentStep >= 4 ? 1 : 0.3,
                      transitionDelay: `${i * 200}ms`,
                    }"
                  >
                    <div class="flex items-center gap-2">
                      <div class="h-7 w-7 rounded-lg transition-colors duration-700" :style="{ backgroundColor: currentStep >= 1 ? `${brand.colors.primary}20` : '#1a1a1a' }" />
                      <p class="text-xs font-semibold">
                        {{ currentStep >= 4 ? ticker.symbol : '----' }}
                      </p>
                    </div>
                    <div class="mt-2.5 flex items-baseline justify-between">
                      <span class="text-sm font-semibold tabular-nums">
                        {{ currentStep >= 4 ? ticker.price : 'R$ --' }}
                      </span>
                      <span
                        class="text-[11px] font-semibold tabular-nums transition-colors duration-500"
                        :style="{
                          color: currentStep >= 4
                            ? (ticker.positive ? (brand.colors.positive || '#4ade80') : (brand.colors.negative || '#ef4444'))
                            : '#333',
                        }"
                      >
                        {{ currentStep >= 4 ? ticker.change : '--' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- AI Chat bubble (slides in at step 5) -->
                <Transition name="chat-bubble">
                  <div
                    v-if="currentStep >= 5"
                    class="absolute bottom-5 right-5 flex items-center gap-3 rounded-2xl border px-5 py-3 shadow-2xl md:bottom-8 md:right-8"
                    :style="{
                      backgroundColor: brand.colors.surface || '#0a0a0a',
                      borderColor: `${brand.colors.primary}20`,
                      boxShadow: `0 8px 40px ${brand.colors.primary}10`,
                    }"
                  >
                    <div class="flex h-9 w-9 items-center justify-center rounded-xl" :style="{ backgroundColor: brand.colors.primary }">
                      <UIcon name="i-lucide-bot" class="size-4 text-white" />
                    </div>
                    <div>
                      <p class="text-xs font-semibold" :style="{ color: brand.colors.text }">Assessor IA</p>
                      <p class="text-[10px]" :style="{ color: brand.colors.textMuted }">Como posso ajudar?</p>
                    </div>
                    <span class="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  </div>
                </Transition>

                <!-- Feature toggles (step 5) -->
                <Transition name="features">
                  <div v-if="currentStep >= 5" class="absolute left-6 bottom-5 flex items-center gap-2 md:left-10 md:bottom-8">
                    <div v-for="(feat, i) in featureIcons" :key="feat.icon" class="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-500" :style="{ backgroundColor: `${brand.colors.primary}15`, transitionDelay: `${i * 100}ms` }">
                      <UIcon :name="feat.icon" class="size-3.5" :style="{ color: brand.colors.primary }" />
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Transition>

    <!-- ============================== -->
    <!-- PHASE 4: REVEAL                -->
    <!-- ============================== -->
    <Transition name="phase">
      <section v-if="phase === 'reveal'" key="reveal" class="relative z-10 flex min-h-[80vh] flex-col items-center justify-center px-6 py-16">
        <div class="w-full max-w-4xl text-center">
          <!-- Success badge -->
          <div class="bld-reveal mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-5 py-2 text-[11px] uppercase tracking-widest text-emerald-400">
            <UIcon name="i-lucide-check-circle" class="size-4" />
            Plataforma gerada
          </div>

          <h2 class="bld-reveal bld-reveal-d1 mb-3 text-4xl font-extrabold tracking-tight md:text-6xl">
            <span :style="{ color: primaryColor }">{{ brandName }}</span> esta pronta.
          </h2>
          <p class="bld-reveal bld-reveal-d2 mx-auto mb-12 max-w-md text-sm text-white/35">
            Sua plataforma de investimentos white-label foi criada. Personalize, publique e comece a monetizar.
          </p>

          <!-- Preview -->
          <div
            class="bld-reveal bld-reveal-d3 mx-auto mb-12 max-w-3xl overflow-hidden rounded-2xl border border-white/[0.08]"
            :style="{ boxShadow: `0 30px 120px ${primaryColor}12, 0 0 0 1px ${primaryColor}06` }"
          >
            <div class="flex items-center gap-2 border-b border-white/[0.04] bg-white/[0.02] px-4 py-2.5">
              <span class="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/40" />
              <span class="h-2.5 w-2.5 rounded-full bg-[#febc2e]/40" />
              <span class="h-2.5 w-2.5 rounded-full bg-[#28c840]/40" />
              <div class="mx-4 flex-1 rounded-lg bg-white/[0.03] px-4 py-1.5 text-center text-[11px] font-mono text-white/20">
                {{ previewDomain }}
              </div>
            </div>
            <div class="p-8 text-left md:p-12" :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }">
              <div class="mb-5 flex items-center gap-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold text-white" :style="{ backgroundColor: brand.colors.primary }">
                  {{ brandName.charAt(0).toUpperCase() }}
                </div>
                <span class="text-lg font-bold" :style="{ fontFamily: `'${brand.font.family}', sans-serif` }">{{ brandName }}</span>
              </div>
              <h3 class="mb-2 text-2xl font-extrabold md:text-3xl" :style="{ fontFamily: `'${brand.font.family}', sans-serif` }">
                Investir com {{ brandName }}.
              </h3>
              <p class="mb-6 text-sm" :style="{ color: brand.colors.textMuted }">
                Analise ativos, acompanhe dividendos e invista com inteligencia.
              </p>
              <div class="flex gap-3">
                <span class="rounded-xl px-6 py-2.5 text-sm font-medium text-white" :style="{ backgroundColor: brand.colors.primary }">Criar conta</span>
                <span class="rounded-xl border px-6 py-2.5 text-sm" :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted }">Saiba mais</span>
              </div>
            </div>
          </div>

          <!-- CTAs -->
          <div class="bld-reveal bld-reveal-d4 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
              class="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl px-10 py-5 text-base font-semibold text-white transition-all duration-300 hover:scale-[1.03]"
              :style="{ backgroundColor: primaryColor }"
              @click="showContactModal = true"
            >
              <div class="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" :style="{ boxShadow: `inset 0 0 40px ${primaryColor}60, 0 0 60px ${primaryColor}30` }" />
              <UIcon name="i-lucide-rocket" class="relative size-5" />
              <span class="relative">Quero essa plataforma</span>
            </button>
            <NuxtLink
              to="/whitelabel"
              class="inline-flex items-center gap-2 rounded-2xl border border-white/[0.06] px-10 py-5 text-sm text-white/40 transition-all duration-300 hover:border-white/15 hover:text-white/60"
            >
              Saiba mais
              <UIcon name="i-lucide-arrow-right" class="size-4" />
            </NuxtLink>
          </div>
        </div>
      </section>
    </Transition>

    <!-- ============================== -->
    <!-- CONTACT MODAL                  -->
    <!-- ============================== -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showContactModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-md" @click.self="showContactModal = false">
          <div class="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#08080c] p-8 shadow-2xl" :style="{ boxShadow: `0 40px 120px ${primaryColor}10` }">
            <div class="mb-8 flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold">Quero minha plataforma</h3>
                <p class="mt-1 text-xs text-white/30">Preencha seus dados e responderemos em 24h.</p>
              </div>
              <button class="flex h-8 w-8 items-center justify-center rounded-lg text-white/20 transition hover:bg-white/5 hover:text-white/50" @click="showContactModal = false">
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </div>
            <div class="flex flex-col gap-3">
              <input v-model="contactForm.name" type="text" placeholder="Seu nome" class="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/15" />
              <input v-model="contactForm.email" type="email" placeholder="Seu melhor email" class="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/15" />
              <input v-model="contactForm.youtube" type="text" placeholder="Canal do YouTube (opcional)" class="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/15" />
              <input v-model="contactForm.whatsapp" type="text" placeholder="WhatsApp (opcional)" class="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/15" />
              <button
                class="mt-3 w-full rounded-xl px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:opacity-90"
                :style="{ backgroundColor: primaryColor }"
                @click="submitContact"
              >
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

definePageMeta({
  layout: false,
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

useHead({
  title: 'Builder — Crie sua plataforma de investimentos',
  meta: [{ name: 'robots', content: 'noindex,nofollow' }],
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
const nameInput = ref<HTMLInputElement>()

const contactForm = reactive({ name: '', email: '', youtube: '', whatsapp: '' })

// ---- Brand snapshot/restore ----
const originalBrand = ref<Record<string, any>>({})
onMounted(() => {
  originalBrand.value = JSON.parse(JSON.stringify(brand))
  // Scroll reveal
  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('bld-visible')
            observer.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1 },
    )
    document.querySelectorAll('.bld-reveal').forEach((el) => observer.observe(el))
  }
})
onUnmounted(() => {
  if (originalBrand.value && Object.keys(originalBrand.value).length) {
    Object.assign(brand, originalBrand.value)
  }
})

// Re-attach observer when phase changes (new elements enter DOM)
watch(phase, () => {
  nextTick(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('bld-visible')
            observer.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1 },
    )
    document.querySelectorAll('.bld-reveal:not(.bld-visible)').forEach((el) => observer.observe(el))
  })
})

// ---- Constants ----
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

const mockTickers = [
  { symbol: 'PETR4', price: 'R$ 38,72', change: '+2.34%', positive: true },
  { symbol: 'VALE3', price: 'R$ 62,15', change: '-0.87%', positive: false },
  { symbol: 'ITUB4', price: 'R$ 33,90', change: '+1.12%', positive: true },
]

const featureIcons = [
  { icon: 'i-lucide-calculator' },
  { icon: 'i-lucide-bar-chart-3' },
  { icon: 'i-lucide-wallet' },
  { icon: 'i-lucide-book-open' },
]

const buildSteps = [
  { label: 'Cores', icon: 'i-lucide-palette', hint: 'Gerando paleta...', duration: 3000 },
  { label: 'Tipografia', icon: 'i-lucide-type', hint: 'Selecionando fonte...', duration: 3000 },
  { label: 'Identidade', icon: 'i-lucide-fingerprint', hint: 'Configurando marca...', duration: 3500 },
  { label: 'Dados', icon: 'i-lucide-trending-up', hint: 'Conectando ao mercado...', duration: 3500 },
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
function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
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
  s /= 100; l /= 100
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
    gradient: { from: primary, via: darkenHex(primary, 0.15), to: darkenHex(primary, 0.3) },
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
  const f = fontOptions[idx]
  return { family: f.family, google: f.google, headingWeight: 'font-extrabold', headingStyle: 'uppercase tracking-wide' }
}

// ---- Terminal ----
async function runTerminalAnimation() {
  const lines = [
    { text: `Analisando marca "${brandName.value}"...` },
    { text: `Paleta de cores: ${primaryColor.value}`, color: primaryColor.value },
    { text: `Tipografia: ${pickFont(brandName.value).family}` },
    { text: 'Configurando 40+ ferramentas...' },
    { text: 'Build completo.', color: '#34D399' },
  ]
  terminalTyping.value = true
  for (const line of lines) {
    await sleep(600)
    visibleTerminalLines.value.push({ ...line, done: false })
    await sleep(500)
    visibleTerminalLines.value[visibleTerminalLines.value.length - 1].done = true
  }
  terminalTyping.value = false
  await sleep(800)
}

// ---- Build sequence ----
async function runStep(stepIndex: number, mutation: () => void) {
  currentStep.value = stepIndex
  await sleep(400)
  mutation()
  await sleep(buildSteps[stepIndex].duration)
}

async function startBuild() {
  if (!brandName.value.trim()) return

  phase.value = 'analysis'
  await runTerminalAnimation()

  phase.value = 'build'

  await runStep(0, () => { Object.assign(brand, { colors: derivePalette(primaryColor.value) }) })
  await runStep(1, () => { Object.assign(brand, { font: pickFont(brandName.value) }) })
  await runStep(2, () => { Object.assign(brand, { name: brandName.value, shortName: brandName.value, tagline: `Investir com ${brandName.value}.` }) })
  await runStep(3, () => { /* visual-only: tickers populate */ })
  await runStep(4, () => {
    Object.assign(brand, {
      features: { showAIAdvisor: true, showCalculators: true, showDividends: true, showNews: true, showAppStoreLinks: true, showDownloadPage: true, showFounderPhoto: false, showEcosystemLinks: false, showGlossary: true, showGuides: true },
    })
  })

  await sleep(600)
  phase.value = 'reveal'
}

// ---- Contact ----
function submitContact() {
  showContactModal.value = false
  showSuccessNotification('Enviado!', 'Entraremos em contato em ate 24h.')
}
</script>

<style scoped>
/* ---- Phase transitions ---- */
.phase-enter-active { transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
.phase-leave-active { transition: opacity 0.3s ease; position: absolute; width: 100%; }
.phase-enter-from { opacity: 0; transform: translateY(30px); }
.phase-leave-to { opacity: 0; }

/* ---- Scroll reveal ---- */
.bld-reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
.bld-reveal.bld-visible { opacity: 1; transform: translateY(0); }
.bld-reveal-d1 { transition-delay: 100ms; }
.bld-reveal-d2 { transition-delay: 200ms; }
.bld-reveal-d3 { transition-delay: 300ms; }
.bld-reveal-d4 { transition-delay: 400ms; }

/* ---- Floating orbs ---- */
.bld-orb { animation: bld-float 14s ease-in-out infinite; transition: opacity 2s ease; }
@keyframes bld-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(40px, -30px) scale(1.08); }
  66% { transform: translate(-25px, 20px) scale(0.94); }
}

/* ---- Text shimmer ---- */
.bld-shimmer {
  background: linear-gradient(90deg, var(--shimmer-color), #fff, var(--shimmer-color));
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: bld-shimmer 3s ease-in-out infinite;
}
@keyframes bld-shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* ---- Fade in (non-scroll) ---- */
.bld-fade-in { animation: bld-fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }
@keyframes bld-fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ---- Terminal ---- */
@keyframes bld-terminal-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}
@keyframes bld-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
@keyframes bld-bar-fill {
  from { width: 0; }
  to { width: 100%; }
}

/* ---- Text focus (font swap) ---- */
.bld-text-focus { animation: bld-text-focus 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
@keyframes bld-text-focus {
  0% { filter: blur(6px); opacity: 0.3; }
  100% { filter: blur(0); opacity: 1; }
}

/* ---- Bloom (color radial) ---- */
.bloom-enter-active { transition: opacity 1.5s ease; }
.bloom-leave-active { transition: opacity 0.8s ease; }
.bloom-enter-from, .bloom-leave-to { opacity: 0; }

/* ---- Chat bubble slide ---- */
.chat-bubble-enter-active { transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
.chat-bubble-leave-active { transition: all 0.3s ease; }
.chat-bubble-enter-from { opacity: 0; transform: translateY(30px) scale(0.9); }
.chat-bubble-leave-to { opacity: 0; transform: translateY(10px); }

/* ---- Features icons slide ---- */
.features-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.features-enter-from { opacity: 0; transform: translateX(-20px); }

/* ---- Check icon ---- */
.check-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.check-leave-active { transition: all 0.15s ease; }
.check-enter-from { opacity: 0; transform: scale(0); }
.check-leave-to { opacity: 0; transform: scale(0.5); }

/* ---- Modal ---- */
.modal-enter-active { transition: all 0.3s ease; }
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from > :last-child { transform: scale(0.95) translateY(10px); opacity: 0; }
.modal-enter-active > :last-child { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
</style>
