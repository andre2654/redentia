<template>
  <NuxtLayout name="static" title="" :show-logo="false">
    <!-- ========== TERMINAL VARIANT (Redentia) ========== -->
    <section
      v-if="variant === 'terminal'"
      class="relative min-h-screen overflow-hidden px-4 pb-16 pt-10"
      :style="{ backgroundColor: brand.colors.background }"
    >
      <!-- Background depth -->
      <div class="pointer-events-none absolute inset-0">
        <div
          class="absolute left-1/2 top-0 h-[540px] w-[900px] -translate-x-1/2 rounded-full blur-3xl opacity-40"
          :style="{ background: `radial-gradient(ellipse at center top, ${brand.colors.primary}33, transparent 60%)` }"
        />
        <div
          class="absolute inset-0 opacity-[0.04]"
          :style="{ backgroundImage: `linear-gradient(${brand.colors.text} 1px, transparent 1px), linear-gradient(90deg, ${brand.colors.text} 1px, transparent 1px)`, backgroundSize: '32px 32px' }"
        />
      </div>

      <div class="relative mx-auto flex max-w-5xl flex-col items-center gap-14 md:flex-row md:items-start md:gap-16">
        <!-- Left: terminal branding -->
        <div class="flex flex-1 flex-col gap-6">
          <h1
            class="font-display"
            :style="{ color: brand.colors.text, fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: '0.95' }"
          >
            Acesso ao <span class="italic" :style="{ color: brand.colors.primary }">terminal.</span>
          </h1>

          <p class="max-w-md text-sm font-mono-tab" :style="{ color: brand.colors.textMuted }">
            {{ brand.auth.loginSubtitle }}
          </p>

          <div
            class="mt-4 overflow-hidden rounded-lg border backdrop-blur-sm"
            :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.surface}E6` }"
          >
            <div
              class="flex items-center justify-between border-b px-4 py-2 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.background, color: brand.colors.textMuted }"
            >
              <div class="flex items-center gap-2">
                <div class="flex gap-1.5">
                  <span class="size-2 rounded-full opacity-60" :style="{ backgroundColor: brand.colors.negative }" />
                  <span class="size-2 rounded-full opacity-60" :style="{ backgroundColor: brand.colors.primary }" />
                  <span class="size-2 rounded-full opacity-60" :style="{ backgroundColor: brand.colors.positive }" />
                </div>
                <span class="ml-2">{{ brand.name.toUpperCase() }}.TERMINAL</span>
              </div>
              <span class="hidden sm:inline">~/auth</span>
            </div>
            <div class="px-5 py-4 font-mono-tab text-xs" :style="{ color: brand.colors.textMuted }">
              <div><span :style="{ color: brand.colors.primary }">&gt;</span> connecting to B3...</div>
              <div><span :style="{ color: brand.colors.positive }">✓</span> session ready</div>
              <div><span :style="{ color: brand.colors.primary }">&gt;</span> auth required_</div>
            </div>
          </div>
        </div>

        <UForm
          :schema="schema"
          :state="state"
          class="flex w-full max-w-md flex-col gap-5 rounded-lg border p-8"
          :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.surface}E6` }"
          @submit="onSubmit"
        >
          <div class="flex items-center justify-end border-b pb-4" :style="{ borderColor: brand.colors.border }">
            <span class="font-mono-tab text-[10px]" :style="{ color: brand.colors.textMuted }">ENC · TLS</span>
          </div>

          <UFormField name="login">
            <template #label>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">&gt; USER_ID / EMAIL</span>
            </template>
            <AtomsFormInput v-model="state.login" type="text" autocomplete="username" spellcheck="false" placeholder="usuário ou e-mail" size="lg" class="w-full" />
          </UFormField>

          <UFormField name="password">
            <template #label>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">&gt; PASSWORD</span>
            </template>
            <AtomsFormInputPassword v-model="state.password" class="w-full" />
          </UFormField>

          <AtomsButton type="submit" color="secondary" size="lg" :loading="submitting" :disabled="submitting || landing" class="mt-2 w-full justify-center font-mono-tab text-xs tracking-[0.15em]">
            Autenticar
          </AtomsButton>

          <div class="flex items-center justify-between border-t pt-4" :style="{ borderColor: brand.colors.border }">
            <NuxtLink to="/auth/register" class="font-mono-tab text-[10px] uppercase tracking-[0.15em] transition hover:opacity-80" :style="{ color: brand.colors.primary }">
              &gt; REGISTER_NEW
            </NuxtLink>
            <NuxtLink to="/auth/forgot-password" class="font-mono-tab text-[10px] uppercase tracking-[0.15em] transition hover:opacity-80" :style="{ color: brand.colors.textMuted }">
              &gt; FORGOT_PWD
            </NuxtLink>
            <span class="font-mono-tab text-[10px]" :style="{ color: brand.colors.textMuted }">{{ sessionTime }}</span>
          </div>
        </UForm>
      </div>
    </section>

    <!-- ========== EDITORIAL VARIANT (Norte Capital) ========== -->
    <section
      v-else-if="variant === 'editorial'"
      class="min-h-screen px-4 pb-16 pt-12"
      :style="{ backgroundColor: brand.colors.background }"
    >
      <div class="mx-auto grid max-w-5xl gap-16 md:grid-cols-12 md:gap-20">
        <div class="md:col-span-6 md:pt-10">
          <span class="font-small-caps text-[11px]" :style="{ color: brand.colors.textMuted }">
            {{ brand.name }} &nbsp;·&nbsp; Portal do investidor
          </span>
          <h1
            class="font-editorial-display mt-4"
            :style="{ color: brand.colors.text, fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: '1.05' }"
          >
            Entre em seu<br />
            <span class="italic" :style="{ color: brand.colors.primary }">gabinete digital.</span>
          </h1>
          <hr class="dashed-rule mt-8 max-w-[6rem]" />
          <p class="font-editorial-body mt-8 max-w-md text-base italic" :style="{ color: brand.colors.textMuted }">
            Estimado investidor, seu portfólio aguarda. Acesse sua carta mais recente, acompanhamento de posições e as análises do mês.
          </p>
          <p class="font-editorial-body mt-6 max-w-md text-sm" :style="{ color: brand.colors.textMuted }">
            {{ brand.auth.loginSubtitle }}
          </p>
        </div>

        <UForm
          :schema="schema"
          :state="state"
          class="flex w-full flex-col gap-6 border px-10 py-12 md:col-span-6"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
          @submit="onSubmit"
        >
          <div>
            <span class="font-small-caps text-[10px]" :style="{ color: brand.colors.textMuted }">Acesso ao portal</span>
            <h2 class="font-editorial-display mt-2 text-2xl" :style="{ color: brand.colors.text }">
              {{ brand.auth.loginTitle }}
            </h2>
          </div>

          <UFormField name="login">
            <template #label>
              <span class="font-small-caps text-[10px]" :style="{ color: brand.colors.textMuted }">Usuário ou e-mail</span>
            </template>
            <AtomsFormInput v-model="state.login" type="text" autocomplete="username" spellcheck="false" placeholder="Usuário ou e-mail" size="lg" class="w-full" />
          </UFormField>

          <UFormField name="password">
            <template #label>
              <span class="font-small-caps text-[10px]" :style="{ color: brand.colors.textMuted }">Senha</span>
            </template>
            <AtomsFormInputPassword v-model="state.password" class="w-full" />
          </UFormField>

          <AtomsButton type="submit" color="secondary" size="lg" :loading="submitting" :disabled="submitting || landing" class="mt-2 w-full justify-center font-small-caps tracking-wide">
            Entrar no portal
          </AtomsButton>

          <hr class="dashed-rule" />

          <div class="flex flex-col gap-2">
            <NuxtLink to="/auth/forgot-password" class="font-editorial-body text-[13px] italic transition hover:opacity-70" :style="{ color: brand.colors.textMuted }">
              Esqueci minha senha <span :style="{ color: brand.colors.primary }">→</span>
            </NuxtLink>
            <NuxtLink to="/auth/register" class="font-editorial-body text-[13px] italic transition hover:opacity-70" :style="{ color: brand.colors.text }">
              Abrir uma nova conta <span :style="{ color: brand.colors.primary }">→</span>
            </NuxtLink>
            <p class="font-editorial-body text-[11px] italic" :style="{ color: brand.colors.textMuted }">
              {{ brand.auth.termsText }}
            </p>
          </div>
        </UForm>
      </div>
    </section>

    <!-- ========== MENTOR VARIANT (Primo Rico) ========== -->
    <section
      v-else-if="variant === 'mentor'"
      class="min-h-screen"
      :style="{ backgroundColor: brand.colors.background }"
    >
      <!-- Top tape -->
      <div
        class="flex items-center gap-4 px-6 py-3 md:px-10"
        :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }"
      >
        <span class="font-mentor-eyebrow">MANUAL DO PRIMO · ACESSO</span>
        <span class="flex-1 border-t" :style="{ borderColor: `${brand.colors.background}40` }" />
        <span class="font-mentor-eyebrow">LOGIN · CAPÍTULO 01</span>
      </div>

      <div class="mx-auto grid max-w-5xl gap-14 px-6 pb-20 pt-16 md:grid-cols-12 md:gap-16 md:px-10 md:pt-20">
        <div class="md:col-span-6">
          <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">
            O AUTOR TE ESPERA
          </span>
          <h1
            class="font-mentor-display mt-5"
            :style="{ color: brand.colors.text, fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)', lineHeight: '0.95' }"
          >
            Continue<br />
            <span class="italic" :style="{ color: brand.colors.primary }">construindo.</span>
          </h1>
          <p class="mt-8 max-w-md text-base leading-relaxed" :style="{ color: `${brand.colors.text}CC` }">
            {{ brand.auth.loginSubtitle }} O capítulo de hoje depende da sua disciplina de ontem. Hora de abrir o manual.
          </p>

          <div
            class="mt-12 border-l-4 pl-6"
            :style="{ borderColor: brand.colors.primary }"
          >
            <p class="font-mentor-display text-lg italic" :style="{ color: brand.colors.text }">
              "{{ brand.hero.founderQuote || 'Patrimônio se constrói com tempo, método e disciplina.' }}"
            </p>
            <p class="font-mentor-eyebrow mt-3" :style="{ color: brand.colors.primary }">
             , {{ brand.founder?.name || 'Thiago Nigro' }}
            </p>
          </div>
        </div>

        <UForm
          :schema="schema"
          :state="state"
          class="flex w-full flex-col gap-5 border-2 p-8 md:col-span-6"
          :style="{ borderColor: brand.colors.text, backgroundColor: brand.colors.surface }"
          @submit="onSubmit"
        >
          <div class="border-b-2 pb-4" :style="{ borderColor: brand.colors.text }">
            <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">FICHA DE ACESSO</span>
            <h2 class="font-mentor-display mt-1 text-3xl" :style="{ color: brand.colors.text }">
              {{ brand.auth.loginTitle }}
            </h2>
          </div>

          <UFormField name="login">
            <template #label>
              <span class="font-mentor-eyebrow" :style="{ color: brand.colors.text }">Usuário ou e-mail</span>
            </template>
            <AtomsFormInput v-model="state.login" type="text" autocomplete="username" spellcheck="false" placeholder="Usuário ou e-mail" size="lg" class="w-full" />
          </UFormField>

          <UFormField name="password">
            <template #label>
              <span class="font-mentor-eyebrow" :style="{ color: brand.colors.text }">Senha</span>
            </template>
            <AtomsFormInputPassword v-model="state.password" class="w-full" />
          </UFormField>

          <AtomsButton type="submit" color="secondary" size="lg" :loading="submitting" :disabled="submitting || landing" class="mt-2 w-full justify-center font-mentor-eyebrow">
            ENTRAR NO MANUAL →
          </AtomsButton>

          <div class="flex flex-col gap-2 border-t-2 pt-4" :style="{ borderColor: brand.colors.text }">
            <NuxtLink to="/auth/forgot-password" class="font-mentor-eyebrow transition hover:opacity-80" :style="{ color: `${brand.colors.text}99` }">
              ESQUECI A SENHA →
            </NuxtLink>
            <NuxtLink to="/auth/register" class="font-mentor-eyebrow transition hover:opacity-80" :style="{ color: brand.colors.primary }">
              AINDA NÃO É LEITOR? COMECE AQUI →
            </NuxtLink>
            <p class="text-[11px] leading-relaxed" :style="{ color: `${brand.colors.text}80` }">
              {{ brand.auth.termsText }}
            </p>
          </div>
        </UForm>
      </div>
    </section>

    <!-- ========== RESEARCH VARIANT (Investidor Sardinha) ========== -->
    <section
      v-else-if="variant === 'research'"
      class="min-h-screen px-4 pb-16 pt-12"
      :style="{ backgroundColor: brand.colors.background }"
    >
      <div class="mx-auto flex max-w-5xl flex-col gap-10">
        <!-- Masthead -->
        <div class="flex items-start justify-between border-b pb-6" :style="{ borderColor: brand.colors.border }">
          <div class="flex flex-col gap-0.5">
            <span class="font-academic-label" :style="{ color: brand.colors.primary }">
              AUVP RESEARCH · ACESSO RESTRITO
            </span>
            <span class="font-academic-body text-[12px] italic" :style="{ color: brand.colors.textMuted }">
              Terminal do investidor · sessão privada
            </span>
          </div>
          <span class="font-academic-mono text-[11px] uppercase tabular-nums" :style="{ color: brand.colors.textMuted }">
            {{ new Date().getFullYear() }}
          </span>
        </div>

        <div class="grid gap-14 md:grid-cols-12 md:gap-16">
          <div class="md:col-span-6">
            <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">
              § · autenticação
            </span>
            <h1
              class="font-academic-display mt-4"
              :style="{ color: brand.colors.text, fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: '1' }"
            >
              Retomar o<br />
              <span class="italic" :style="{ color: brand.colors.primary }">estudo do dia.</span>
            </h1>
            <hr class="dashed-rule mt-8 max-w-[8rem]" />
            <p class="font-academic-body mt-6 max-w-md text-[14px] italic" :style="{ color: brand.colors.textMuted }">
              <span class="red-pen">Nota do professor</span>, o método não funciona pra quem estuda uma vez e desaparece. Acesso diário é premissa, não extra.
            </p>
            <p class="font-academic-body mt-6 max-w-md text-[13px]" :style="{ color: brand.colors.text }">
              {{ brand.auth.loginSubtitle }}
            </p>
          </div>

          <UForm
            :schema="schema"
            :state="state"
            class="flex w-full flex-col gap-5 border p-8 md:col-span-6"
            :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
            @submit="onSubmit"
          >
            <div class="flex items-start justify-between border-b pb-4" :style="{ borderColor: brand.colors.border }">
              <span class="font-academic-label" :style="{ color: brand.colors.primary }">§1 · credenciais</span>
              <span class="font-academic-mono text-[10px] tabular-nums" :style="{ color: brand.colors.textMuted }">
                {{ sessionTime }}
              </span>
            </div>

            <UFormField name="login">
              <template #label>
                <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">Usuário ou e-mail</span>
              </template>
              <AtomsFormInput v-model="state.login" type="text" autocomplete="username" spellcheck="false" placeholder="Usuário ou e-mail" size="lg" class="w-full" />
            </UFormField>

            <UFormField name="password">
              <template #label>
                <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">Senha</span>
              </template>
              <AtomsFormInputPassword v-model="state.password" class="w-full" />
            </UFormField>

            <AtomsButton type="submit" color="secondary" size="lg" :loading="submitting" :disabled="submitting || landing" class="mt-2 w-full justify-center font-academic-label">
              ABRIR O TERMINAL →
            </AtomsButton>

            <hr class="dashed-rule" />

            <div class="flex flex-col gap-2">
              <NuxtLink to="/auth/forgot-password" class="font-academic-body text-[13px] italic transition hover:opacity-70" :style="{ color: brand.colors.textMuted }">
                Esqueci minha senha <span :style="{ color: brand.colors.primary }">→</span>
              </NuxtLink>
              <NuxtLink to="/auth/register" class="font-academic-body text-[13px] italic transition hover:opacity-70" :style="{ color: brand.colors.text }">
                Solicitar acesso de aluno <span :style="{ color: brand.colors.primary }">→</span>
              </NuxtLink>
              <p class="font-academic-body text-[11px] italic" :style="{ color: brand.colors.textMuted }">
                {{ brand.auth.termsText }}
              </p>
            </div>
          </UForm>
        </div>
      </div>
    </section>

    <!-- ========== SHOWTIME VARIANT (Me Poupe!) ========== -->
    <section
      v-else-if="variant === 'showtime'"
      class="relative min-h-screen overflow-hidden px-4 pb-16 pt-12"
      :style="{ backgroundColor: brand.colors.background }"
    >
      <!-- Confetti dots -->
      <div class="pointer-events-none absolute inset-0 opacity-25">
        <div class="absolute left-[8%] top-[12%] size-3 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
        <div class="absolute left-[18%] top-[60%] size-2 rounded-full" :style="{ backgroundColor: brand.colors.secondary }" />
        <div class="absolute right-[12%] top-[20%] size-4 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
        <div class="absolute right-[30%] top-[75%] size-2 rounded-full" :style="{ backgroundColor: brand.colors.positive }" />
      </div>

      <div class="relative mx-auto flex max-w-5xl flex-col items-center gap-14 md:flex-row md:items-start md:gap-16">
        <div class="flex flex-1 flex-col items-center text-center md:items-start md:pt-4 md:text-left">
          <span class="lower-third">AO VIVO · LOGIN DO PROGRAMA</span>
          <h1
            class="font-showtime-display chunky-shadow mt-6"
            :style="{ color: brand.colors.text, fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)' }"
          >
            Volta, volta,<br />
            <span class="highlighter" :style="{ color: brand.colors.primary }">criatura!</span>
          </h1>
          <p class="font-showtime-body mt-8 max-w-md text-base" :style="{ color: `${brand.colors.text}CC` }">
            {{ brand.auth.loginSubtitle }} A Na_th IA tá te esperando pra continuar cuidando do teu dinheiro.
          </p>

          <div class="mt-8 flex items-start gap-3">
            <img src="/brand/mepoupe/margarete.svg" alt="Margarete" class="h-12 shrink-0" />
            <p class="font-showtime-body max-w-xs text-sm italic" :style="{ color: `${brand.colors.text}B3` }">
              "Bora lá, que dinheiro parado não rende nada, só o juro composto, esse filho maravilhoso!"
            </p>
          </div>
        </div>

        <UForm
          :schema="schema"
          :state="state"
          class="showtime-frame showtime-frame--tilt-right relative flex w-full max-w-md flex-col gap-5 rounded-[28px] p-8"
          :style="{ backgroundColor: brand.colors.surface }"
          @submit="onSubmit"
        >
          <div class="washi-tape" />
          <div class="text-center">
            <span class="font-showtime-label" :style="{ color: brand.colors.primary }">
              ENTRAR NO PROGRAMA
            </span>
            <h2 class="font-showtime-display mt-2" :style="{ color: brand.colors.text, fontSize: '1.75rem' }">
              {{ brand.auth.loginTitle }}
            </h2>
          </div>

          <UFormField name="login">
            <template #label>
              <span class="font-showtime-label" :style="{ color: `${brand.colors.text}80` }">USUÁRIO OU E-MAIL</span>
            </template>
            <AtomsFormInput v-model="state.login" type="text" autocomplete="username" spellcheck="false" placeholder="Usuário ou e-mail" size="lg" class="w-full" />
          </UFormField>

          <UFormField name="password">
            <template #label>
              <span class="font-showtime-label" :style="{ color: `${brand.colors.text}80` }">SENHA SECRETA</span>
            </template>
            <AtomsFormInputPassword v-model="state.password" class="w-full" />
          </UFormField>

          <AtomsButton type="submit" color="secondary" size="lg" :loading="submitting" :disabled="submitting || landing" class="mt-3 w-full justify-center font-showtime-label">
            BORA ENTRAR! →
          </AtomsButton>

          <div class="flex flex-col items-center gap-2 text-center">
            <NuxtLink to="/auth/forgot-password" class="font-showtime-label underline underline-offset-4 transition hover:opacity-70" :style="{ color: `${brand.colors.text}90` }">
              ESQUECI A SENHA →
            </NuxtLink>
            <NuxtLink to="/auth/register" class="font-showtime-label underline underline-offset-4 transition hover:opacity-70" :style="{ color: brand.colors.primary }">
              ÉS NOVA POR AQUI? BORA CADASTRAR →
            </NuxtLink>
            <p class="font-showtime-body text-[11px]" :style="{ color: `${brand.colors.text}80` }">
              {{ brand.auth.termsText }}
            </p>
          </div>
        </UForm>
      </div>
    </section>

    <!-- ========== PLAYBOOK VARIANT (Saraiva Invest, calm method + author photo) ========== -->
    <section
      v-else-if="variant === 'playbook'"
      class="relative min-h-screen overflow-hidden px-4 pb-16 pt-12"
      :style="{ backgroundColor: brand.colors.background }"
    >
      <!-- Atmospheric amber glow + dot grid -->
      <div class="pointer-events-none absolute inset-0">
        <div
          class="absolute -top-40 left-1/2 h-[640px] w-[1100px] -translate-x-1/2 rounded-full blur-3xl opacity-25"
          :style="{ background: `radial-gradient(ellipse, ${brand.colors.primary}, transparent 65%)` }"
        />
        <div
          class="absolute inset-0 opacity-[0.04]"
          :style="{
            backgroundImage: `radial-gradient(${brand.colors.text} 1px, transparent 1px)`,
            backgroundSize: '36px 36px',
          }"
        />
      </div>

      <div class="relative mx-auto flex max-w-6xl flex-col items-center gap-12 md:flex-row md:items-center md:gap-16 md:py-12">
        <!-- LEFT: copy + manifesto -->
        <div class="flex flex-1 flex-col items-start text-left">
          <!-- Catchphrase pill -->
          <div
            class="mb-7 inline-flex items-center gap-2.5 rounded-full px-5 py-2"
            :style="{
              backgroundColor: brand.colors.primary,
              color: brand.colors.background,
              boxShadow: `0 8px 30px -8px ${brand.colors.primary}80, 0 0 0 3px ${brand.colors.background}, 0 0 0 5px ${brand.colors.primary}40`,
            }"
          >
            <span class="relative flex size-1.5">
              <span class="absolute inline-flex size-1.5 motion-safe:animate-ping rounded-full opacity-75" :style="{ backgroundColor: brand.colors.background }" />
              <span class="relative inline-flex size-1.5 rounded-full" :style="{ backgroundColor: brand.colors.background }" />
            </span>
            <span class="text-[11px] font-bold uppercase tracking-[0.15em]">CABEÇA FRIA</span>
          </div>

          <h1
            class="leading-[0.92] tracking-tight"
            :style="{
              color: brand.colors.text,
              fontFamily: `'Fredoka', 'Inter', sans-serif`,
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 700,
            }"
          >
            Volta de onde<br />
            <span :style="{ color: brand.colors.primary }">você parou.</span>
          </h1>

          <p class="mt-6 max-w-md text-[16px] leading-relaxed" :style="{ color: `${brand.colors.text}C0` }">
            Seu plano, sua carteira, seus backtests, esperando. Sem hype, sem ansiedade, no seu ritmo.
          </p>

          <!-- Author quote -->
          <div class="mt-10 flex items-start gap-4 border-t pt-6" :style="{ borderColor: `${brand.colors.border}80` }">
            <img
              v-if="brand.hero.image"
              :src="brand.hero.image"
              :alt="brand.founder.name"
              class="size-12 rounded-full object-cover"
              :style="{
                backgroundColor: brand.colors.primary,
                boxShadow: `0 0 0 2px ${brand.colors.background}, 0 0 0 4px ${brand.colors.primary}`,
              }"
            />
            <div class="flex-1">
              <p class="text-[13px] italic leading-snug" :style="{ color: `${brand.colors.text}B0` }">
                "Não é sorte. É método. Juros compostos trabalham enquanto você dorme."
              </p>
              <p class="mt-1 text-[11px] font-bold uppercase tracking-[0.15em]" :style="{ color: brand.colors.primary }">
               , {{ brand.founder.name }}
              </p>
            </div>
          </div>
        </div>

        <!-- RIGHT: form card -->
        <UForm
          :schema="schema"
          :state="state"
          class="relative flex w-full max-w-md flex-col gap-5 rounded-3xl border p-8 md:p-10"
          :style="{
            borderColor: brand.colors.border,
            backgroundColor: brand.colors.surface,
            boxShadow: `0 30px 80px -30px ${brand.colors.primary}30`,
          }"
          @submit="onSubmit"
        >
          <div class="space-y-2">
            <span class="text-[10px] font-bold uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">
             , Acesso
            </span>
            <h2
              class="leading-tight"
              :style="{
                color: brand.colors.text,
                fontFamily: `'Fredoka', sans-serif`,
                fontSize: '1.75rem',
                fontWeight: 700,
              }"
            >
              {{ brand.auth.loginTitle }}
            </h2>
          </div>

          <UFormField name="login">
            <AtomsFormInput v-model="state.login" type="text" autocomplete="username" spellcheck="false" placeholder="Usuário ou e-mail" size="lg" class="w-full" />
          </UFormField>

          <UFormField name="password">
            <AtomsFormInputPassword v-model="state.password" class="w-full" />
          </UFormField>

          <button
            type="submit"
            class="group mt-3 inline-flex w-full items-center justify-center gap-3 rounded-full px-6 py-4 text-[13px] font-bold transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-0.5"
            :style="{
              backgroundColor: brand.colors.primary,
              color: brand.colors.background,
              boxShadow: `0 16px 50px -16px ${brand.colors.primary}A0`,
            }"
          >
            <UIcon name="i-lucide-flask-conical" class="size-4" />
            Entrar no método
            <span class="transition-transform group-hover:translate-x-1">→</span>
          </button>

          <div class="flex flex-col gap-2 pt-2 text-center">
            <NuxtLink to="/auth/forgot-password" class="text-[12px] font-medium underline-offset-4 transition hover:opacity-70" :style="{ color: brand.colors.textMuted }">
              <span class="underline">Esqueci minha senha</span>
            </NuxtLink>
            <NuxtLink to="/auth/register" class="text-[12px] font-bold underline-offset-4 transition hover:opacity-70" :style="{ color: brand.colors.primary }">
              Não tem conta? <span class="underline">Começar agora</span>
            </NuxtLink>
            <p class="text-[10px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
              {{ brand.auth.termsText }}
            </p>
          </div>
        </UForm>
      </div>
    </section>

    <!-- ========== HOLDER VARIANT (sentencious editorial) ========== -->
    <section
      v-else-if="variant === 'holder'"
      class="relative min-h-screen overflow-hidden"
      :style="{ backgroundColor: brand.colors.background }"
    >
      <!-- Top strip -->
      <div class="border-b" :style="{ borderColor: brand.colors.border }">
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-10">
          <div class="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.18em]" style="font-family: 'JetBrains Mono', monospace;">
            <span :style="{ color: brand.colors.primary }">Hold</span>
            <span :style="{ color: brand.colors.textMuted }">ACESSO · {{ brand.founder.name.toUpperCase() }}</span>
          </div>
          <span class="font-mono text-[10px] uppercase tracking-[0.18em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.textMuted }">
            01 / 01
          </span>
        </div>
      </div>

      <div class="mx-auto grid max-w-7xl grid-cols-12 items-stretch gap-0 px-6 py-12 md:px-10 md:py-16 lg:py-20">
        <!-- LEFT: editorial copy -->
        <div class="col-span-12 flex flex-col justify-center border-b pb-10 lg:col-span-7 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-10" :style="{ borderColor: brand.colors.border }">
          <div class="mb-6 text-[10px] font-bold uppercase tracking-[0.22em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.primary }">
            01 · Entrar
          </div>
          <h1
            class="mb-10 leading-[1.1]"
            :style="{
              color: brand.colors.text,
              fontFamily: `'Spectral', 'Georgia', serif`,
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              fontWeight: 400,
            }"
          >
            {{ brand.auth.loginTitle }}.<br />
            <span class="italic" :style="{ color: brand.colors.primary, fontWeight: 500 }">Continue holdando.</span>
          </h1>
          <p
            class="max-w-xl text-[18px] leading-[1.65]"
            :style="{
              color: `${brand.colors.text}C0`,
              fontFamily: `'Spectral', 'Georgia', serif`,
            }"
          >
            {{ brand.auth.loginSubtitle }}
          </p>
          <div class="mt-12 flex items-center gap-4 text-[11px] uppercase tracking-[0.22em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.textMuted }">
            <span class="h-px w-12" :style="{ backgroundColor: brand.colors.border }" />
            <span :style="{ color: brand.colors.primary }">, @holder</span>
          </div>
        </div>

        <!-- RIGHT: form -->
        <div class="col-span-12 flex items-start lg:col-span-5">
          <UForm
            :schema="schema"
            :state="state"
            class="flex w-full flex-col gap-5 border p-7"
            :style="{
              borderColor: brand.colors.border,
              backgroundColor: brand.colors.surface,
            }"
            @submit="onSubmit"
          >
            <div class="border-b pb-5" :style="{ borderColor: brand.colors.border }">
              <span class="text-[10px] font-bold uppercase tracking-[0.22em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.primary }">
                Credenciais
              </span>
            </div>

            <UFormField name="login">
              <template #label>
                <span class="text-[10px] font-bold uppercase tracking-[0.18em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.textMuted }">
                  Usuário ou e-mail
                </span>
              </template>
              <AtomsFormInput v-model="state.login" type="text" autocomplete="username" spellcheck="false" placeholder="Usuário ou e-mail" size="lg" class="w-full" />
            </UFormField>

            <UFormField name="password">
              <template #label>
                <span class="text-[10px] font-bold uppercase tracking-[0.18em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.textMuted }">
                  Senha
                </span>
              </template>
              <AtomsFormInputPassword v-model="state.password" class="w-full" />
            </UFormField>

            <button
              type="submit"
              class="mt-4 inline-flex w-full items-center justify-center gap-3 px-6 py-4 text-[12px] font-bold uppercase tracking-[0.18em] transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-0.5"
              :style="{
                backgroundColor: brand.colors.primary,
                color: brand.colors.text,
              }"
            >
              <UIcon name="i-lucide-anchor" class="size-4" />
              Entrar
              <span>→</span>
            </button>

            <div class="mt-2 flex flex-col gap-3 border-t pt-5" :style="{ borderColor: brand.colors.border }">
              <NuxtLink
                to="/auth/forgot-password"
                class="text-[11px] font-bold uppercase tracking-[0.18em]"
                style="font-family: 'JetBrains Mono', monospace;"
                :style="{ color: brand.colors.textMuted }"
              >
                Esqueci a senha →
              </NuxtLink>
              <NuxtLink
                to="/auth/register"
                class="text-[11px] font-bold uppercase tracking-[0.18em]"
                style="font-family: 'JetBrains Mono', monospace;"
                :style="{ color: brand.colors.primary }"
              >
                Tornar-se holder →
              </NuxtLink>
              <p class="text-[10px] leading-snug italic" style="font-family: 'Spectral', serif;" :style="{ color: brand.colors.textMuted }">
                {{ brand.auth.termsText }}
              </p>
            </div>
          </UForm>
        </div>
      </div>

      <!-- Bottom HOLD. seal -->
      <div class="border-t py-12 text-center" :style="{ borderColor: brand.colors.border }">
        <p
          class="select-none leading-none"
          :style="{
            color: brand.colors.primary,
            fontFamily: `'Anton', 'Bebas Neue', sans-serif`,
            fontWeight: 400,
            fontSize: 'clamp(3rem, 6vw, 5rem)',
            letterSpacing: '0.02em',
          }"
        >
          HOLD.
        </p>
      </div>
    </section>

    <!-- ========== DEFAULT VARIANT (fallback) ========== -->
    <section v-else class="px-4 pb-16 pt-12">
      <div class="mx-auto flex max-w-5xl flex-col items-center gap-14 md:flex-row md:items-start md:gap-20">
        <div class="flex flex-1 flex-col items-center gap-8 text-center md:items-start md:text-left">
          <AtomsAuthHeader class="mt-0 w-full max-w-sm" />
          <p class="text-sm leading-relaxed md:max-w-sm" :style="{ color: brand.colors.textMuted }">
            Faça login para acessar seus dashboards em tempo real, acompanhar ativos favoritos e receber insights personalizados sobre sua carteira.
          </p>
        </div>

        <UForm
          :schema="schema"
          :state="state"
          class="flex w-full max-w-md flex-col gap-5 rounded-[32px] border px-8 py-10 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.5)] backdrop-blur-2xl"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
          @submit="onSubmit"
        >
          <div class="space-y-2 text-center md:text-left">
            <span class="text-xs font-medium uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
              Acesso
            </span>
            <h1 class="text-2xl font-semibold" :style="{ color: brand.colors.text }">
              {{ brand.auth.loginTitle }}
            </h1>
            <p class="text-sm" :style="{ color: brand.colors.textMuted }">
              {{ brand.auth.loginSubtitle }}
            </p>
          </div>

          <UFormField name="login">
            <AtomsFormInput v-model="state.login" type="text" autocomplete="username" spellcheck="false" placeholder="Usuário ou e-mail" size="lg" class="w-full" />
          </UFormField>

          <UFormField name="password">
            <AtomsFormInputPassword v-model="state.password" class="w-full" />
          </UFormField>

          <AtomsButton type="submit" color="secondary" size="lg" :loading="submitting" :disabled="submitting || landing" class="mt-2 w-full justify-center">
            {{ brand.nav.login }}
          </AtomsButton>

          <div class="flex flex-col gap-2 text-center md:text-left">
            <NuxtLink to="/auth/forgot-password" class="text-sm font-medium transition hover:opacity-80" :style="{ color: brand.colors.textMuted }">
              Esqueci minha senha
            </NuxtLink>
            <NuxtLink to="/auth/register" class="text-sm font-medium transition hover:opacity-80" :style="{ color: brand.colors.primary }">
              Ainda não tem conta? Cadastre-se agora
            </NuxtLink>
            <p class="text-[11px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
              {{ brand.auth.termsText }}
            </p>
          </div>
        </UForm>
      </div>
    </section>

    <!--
      Landing overlay — full-screen brand-tinted veil that fades in
      AFTER the auth call succeeds and BEFORE Nuxt finishes routing
      to /. Covers the awkward 100-300ms where the form is disabled
      but the destination page hasn't mounted yet (felt frozen).

      Inert so screen readers + tab order don't get trapped here;
      pointer-events block clicks on the form behind. Animation
      uses the same 200ms ease as the rest of the app's transitions
      (see plugins/brand.ts).
    -->
    <Transition name="landing-fade">
      <div
        v-if="landing"
        class="landing-overlay"
        :style="{
          backgroundColor: `color-mix(in srgb, ${brand.colors.background} 92%, transparent)`,
        }"
        aria-live="polite"
        inert
      >
        <div class="landing-card" :style="landingCardStyle">
          <div class="landing-spinner" :style="{ borderColor: `color-mix(in srgb, ${brand.colors.primary} 25%, transparent)`, borderTopColor: brand.colors.primary }" />
          <div class="flex flex-col items-center gap-1.5">
            <span
              class="font-mono-tab text-[11px] font-medium uppercase"
              :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
            >Conectado</span>
            <p
              class="text-center text-[15px] font-medium"
              :style="{ color: brand.colors.text }"
            >{{ landingMessage }}</p>
            <p
              class="text-center text-[12.5px]"
              :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }"
            >Carregando seu painel…</p>
          </div>
        </div>
      </div>
    </Transition>
  </NuxtLayout>
</template>

<style scoped>
.landing-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.landing-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding: 36px 44px;
  border-radius: 16px;
  border: 1px solid;
  min-width: 260px;
}
.landing-spinner {
  width: 38px;
  height: 38px;
  border: 3px solid;
  border-radius: 50%;
  animation: landing-spin 800ms linear infinite;
}
@keyframes landing-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .landing-spinner {
    animation: none;
  }
}

.landing-fade-enter-active,
.landing-fade-leave-active {
  transition: opacity 200ms ease-out;
}
.landing-fade-enter-from,
.landing-fade-leave-to {
  opacity: 0;
}
</style>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const brand = useBrand()
const router = useRouter()
const { login } = useAuthService()
const authStore = useAuthStore()

// Use the hero variant as the single source of truth for auth page styling.
const variant = computed(() => brand.hero?.variant || 'default')

// Displayed session timestamp, for terminal/research variants.
const sessionTime = computed(() => {
  try {
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
})

const schema = z.object({
  login: z.string().min(3, 'Login obrigatório'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
})

type Schema = z.infer<typeof schema>

const state = reactive({
  login: '',
  password: '',
})

// Two-phase loading flag so the submit button can show a spinner
// (`submitting`) and the post-login overlay can take over while the
// router transitions (`landing`). Splitting them avoids the brief
// flash where the button stops spinning but the redirect hasn't
// happened yet, which made the form look frozen.
const submitting = ref(false)
const landing = ref(false)

const landingCardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 92%, ${brand.colors.background})`,
  borderColor: `color-mix(in srgb, ${brand.colors.primary} 22%, transparent)`,
  boxShadow: `0 24px 60px -32px color-mix(in srgb, ${brand.colors.primary} 35%, transparent), 0 8px 16px -10px rgba(0,0,0,0.18)`,
}))

const landingMessage = computed(() => {
  const me = authStore.me as { name?: string; displayName?: string } | null
  const raw = me?.displayName?.trim() || me?.name?.trim() || ''
  if (!raw) return 'Bem-vindo de volta'
  const first = raw.split(/\s+/)[0] ?? ''
  if (!first) return 'Bem-vindo de volta'
  const cap = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
  return `Bem-vindo de volta, ${cap}`
})

/**
 * Pull a friendly first name from the auth store profile. We try
 * `displayName` first (some tenants set it explicitly), fall back to
 * the first word of `name`, then to a generic greeting if neither is
 * available. Capitalises the first letter so even uppercase profile
 * names ("ANDRE") read naturally in the toast ("André" / "Andre").
 */
function welcomeName(): string {
  const me = authStore.me as { name?: string; displayName?: string } | null
  const raw = me?.displayName?.trim() || me?.name?.trim() || ''
  if (!raw) return ''
  const first = raw.split(/\s+/)[0] ?? ''
  if (!first) return ''
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
}

async function onSubmit(_: FormSubmitEvent<Schema>) {
  if (submitting.value) return
  submitting.value = true
  try {
    const resp = await login({ login: state.login, password: state.password })
    if (!resp.access_token) {
      showErrorNotification('Falha no login', 'Token não recebido. Tente novamente.')
      return
    }
    authStore.addToken(resp.access_token)
    await authStore.fetchProfile()
    const name = welcomeName()
    showSuccessNotification(
      name ? `Bem-vindo de volta, ${name}` : 'Login efetuado',
      'Carregando seu painel…',
    )
    // Hand the form over to the full-screen landing overlay so the
    // navigation happens with a polished transition instead of an
    // abrupt redirect on top of a half-disabled form.
    landing.value = true
    // Small delay lets the overlay animate in (200ms enter) before
    // we kick the route change — Nuxt's default page transition then
    // dovetails with our own fade.
    setTimeout(() => router.push('/'), 280)
  } catch (e) {
    const message =
      (e as { data?: { message?: string } })?.data?.message
        ?? (e instanceof Error ? e.message : 'Verifique suas credenciais')
    showErrorNotification('Falha no login', message)
  } finally {
    submitting.value = false
  }
}

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title: `Entrar | ${brand.name}`,
  description:
    `Faça login na ${brand.name} para acessar dashboards em tempo real, acompanhar ativos e receber insights personalizados com IA.`,
  path: '/auth/login',
  robots: 'noindex,nofollow',
})
</script>
