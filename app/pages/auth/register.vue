<template>
  <NuxtLayout name="static" title="" :show-logo="false">
    <!-- ========== TERMINAL VARIANT (Redentia) ========== -->
    <section
      v-if="variant === 'terminal'"
      class="relative min-h-screen overflow-hidden px-4 pb-16 pt-10"
      :style="{ backgroundColor: brand.colors.background }"
    >
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
        <div class="flex flex-1 flex-col gap-6">
          <h1
            class="font-display"
            :style="{ color: brand.colors.text, fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: '0.95' }"
          >
            Crie sua <span class="italic" :style="{ color: brand.colors.primary }">conta.</span>
          </h1>

          <p class="max-w-md text-sm font-mono-tab" :style="{ color: brand.colors.textMuted }">
            {{ brand.auth.registerSubtitle }}
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
                <span class="ml-2">{{ brand.name.toUpperCase() }}.INIT</span>
              </div>
              <span class="hidden sm:inline">~/register</span>
            </div>
            <div class="px-5 py-4 font-mono-tab text-xs" :style="{ color: brand.colors.textMuted }">
              <div><span :style="{ color: brand.colors.primary }">&gt;</span> provisioning session...</div>
              <div><span :style="{ color: brand.colors.positive }">✓</span> welcome package ready</div>
              <div><span :style="{ color: brand.colors.primary }">&gt;</span> awaiting credentials_</div>
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
            <span class="font-mono-tab text-[10px]" :style="{ color: brand.colors.textMuted }">v2.1 · INIT</span>
          </div>

          <UFormField name="name">
            <template #label>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">&gt; FULL_NAME</span>
            </template>
            <AtomsFormInput v-model="state.name" type="text" placeholder="Seu nome completo" size="lg" class="w-full" />
          </UFormField>

          <UFormField name="login">
            <template #label>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">&gt; USER_ID</span>
            </template>
            <AtomsFormInput v-model="state.login" type="text" placeholder="investidor123" size="lg" class="w-full" />
          </UFormField>

          <UFormField name="celular">
            <template #label>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">&gt; PHONE</span>
            </template>
            <AtomsFormInput
              v-model="state.celular"
              v-maska="'+55 (##) # ####-####'"
              type="tel"
              autocomplete="tel"
              inputmode="tel"
              placeholder="+55 (11) 9 9999-9999"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <UFormField name="email">
            <template #label>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">&gt; EMAIL</span>
            </template>
            <AtomsFormInput v-model="state.email" type="email" autocomplete="email" inputmode="email" spellcheck="false" placeholder="voce@exemplo.com" size="lg" class="w-full" />
          </UFormField>

          <UFormField name="password">
            <template #label>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">&gt; PASSWORD</span>
            </template>
            <AtomsFormInputPassword v-model="state.password" :aria-invalid="score < 4" class="w-full" />
          </UFormField>

          <UFormField name="password_confirmation">
            <template #label>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">&gt; PASSWORD_CONFIRM</span>
            </template>
            <AtomsFormInputPassword v-model="state.password_confirmation" placeholder="Confirme a senha" class="w-full" />
          </UFormField>

          <p
            class="flex items-center gap-1 text-[10px] leading-tight transition-colors"
            :style="{ color: score >= 1 ? brand.colors.positive : brand.colors.textMuted }"
            aria-live="polite"
          >
            <UIcon
              :name="score >= 1 ? 'i-lucide-circle-check' : 'i-lucide-circle'"
              class="size-3 shrink-0"
              aria-hidden="true"
            />
            <span>A senha deve ter pelo menos 8 caracteres</span>
          </p>

          <AtomsButton type="submit" color="secondary" size="lg" :loading="submitting" :disabled="submitting || landing" class="w-full justify-center font-mono-tab text-xs tracking-[0.15em]">
            Criar sessão
          </AtomsButton>

          <div class="flex items-center justify-between border-t pt-4" :style="{ borderColor: brand.colors.border }">
            <NuxtLink to="/auth/login" class="font-mono-tab text-[10px] uppercase tracking-[0.15em] transition hover:opacity-80" :style="{ color: brand.colors.primary }">
              &gt; LOGIN
            </NuxtLink>
            <span class="font-mono-tab text-[10px]" :style="{ color: brand.colors.textMuted }">ENC · TLS</span>
          </div>
          <p class="font-mono-tab text-[10px]" :style="{ color: brand.colors.textMuted }">
            {{ brand.auth.termsText }}
          </p>
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
            {{ brand.name }} &nbsp;·&nbsp; Nova conta
          </span>
          <h1
            class="font-editorial-display mt-4"
            :style="{ color: brand.colors.text, fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: '1.05' }"
          >
            Abra sua<br />
            <span class="italic" :style="{ color: brand.colors.primary }">gestão patrimonial.</span>
          </h1>
          <hr class="dashed-rule mt-8 max-w-[6rem]" />
          <p class="font-editorial-body mt-8 max-w-md text-base italic" :style="{ color: brand.colors.textMuted }">
            Prezado futuro cliente, em poucos minutos abrimos seu perfil no portal. A partir daí, seu assessor envia as cartas mensais, acompanha o portfólio e está disponível para suas dúvidas.
          </p>
          <p class="font-editorial-body mt-6 max-w-md text-sm" :style="{ color: brand.colors.textMuted }">
            {{ brand.auth.registerSubtitle }}
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
            <span class="font-small-caps text-[10px]" :style="{ color: brand.colors.textMuted }">Ficha de abertura</span>
            <h2 class="font-editorial-display mt-2 text-2xl" :style="{ color: brand.colors.text }">
              {{ brand.auth.registerTitle }}
            </h2>
          </div>

          <UFormField name="name">
            <template #label>
              <span class="font-small-caps text-[10px]" :style="{ color: brand.colors.textMuted }">Nome completo</span>
            </template>
            <AtomsFormInput v-model="state.name" type="text" placeholder="Seu nome" size="lg" class="w-full" />
          </UFormField>

          <UFormField name="login">
            <template #label>
              <span class="font-small-caps text-[10px]" :style="{ color: brand.colors.textMuted }">Usuário</span>
            </template>
            <AtomsFormInput v-model="state.login" type="text" placeholder="Seu usuário" size="lg" class="w-full" />
          </UFormField>

          <UFormField name="celular">
            <template #label>
              <span class="font-small-caps text-[10px]" :style="{ color: brand.colors.textMuted }">Telefone</span>
            </template>
            <AtomsFormInput
              v-model="state.celular"
              v-maska="'+55 (##) # ####-####'"
              type="tel"
              autocomplete="tel"
              inputmode="tel"
              placeholder="+55 (11) 9 9999-9999"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <UFormField name="email">
            <template #label>
              <span class="font-small-caps text-[10px]" :style="{ color: brand.colors.textMuted }">E-mail</span>
            </template>
            <AtomsFormInput v-model="state.email" type="email" autocomplete="email" inputmode="email" spellcheck="false" placeholder="voce@exemplo.com" size="lg" class="w-full" />
          </UFormField>

          <UFormField name="password">
            <template #label>
              <span class="font-small-caps text-[10px]" :style="{ color: brand.colors.textMuted }">Senha</span>
            </template>
            <AtomsFormInputPassword v-model="state.password" :aria-invalid="score < 4" class="w-full" />
          </UFormField>

          <UFormField name="password_confirmation">
            <template #label>
              <span class="font-small-caps text-[10px]" :style="{ color: brand.colors.textMuted }">Confirme a senha</span>
            </template>
            <AtomsFormInputPassword v-model="state.password_confirmation" placeholder="Confirme a senha" class="w-full" />
          </UFormField>

          <p
            class="flex items-center gap-1 text-[10px] leading-tight transition-colors"
            :style="{ color: score >= 1 ? brand.colors.positive : brand.colors.textMuted }"
            aria-live="polite"
          >
            <UIcon
              :name="score >= 1 ? 'i-lucide-circle-check' : 'i-lucide-circle'"
              class="size-3 shrink-0"
              aria-hidden="true"
            />
            <span>A senha deve ter pelo menos 8 caracteres</span>
          </p>

          <AtomsButton type="submit" color="secondary" size="lg" :loading="submitting" :disabled="submitting || landing" class="mt-2 w-full justify-center font-small-caps tracking-wide">
            Abrir conta
          </AtomsButton>

          <hr class="dashed-rule" />

          <div class="flex flex-col gap-2">
            <NuxtLink to="/auth/login" class="font-editorial-body text-[13px] italic transition hover:opacity-70" :style="{ color: brand.colors.text }">
              Já é cliente? Entre no portal <span :style="{ color: brand.colors.primary }">→</span>
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
      <div
        class="flex items-center gap-4 px-6 py-3 md:px-10"
        :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }"
      >
        <span class="font-mentor-eyebrow">MANUAL DO PRIMO · INSCRIÇÃO</span>
        <span class="flex-1 border-t" :style="{ borderColor: `${brand.colors.background}40` }" />
        <span class="font-mentor-eyebrow">REGISTRO · CAPÍTULO 00</span>
      </div>

      <div class="mx-auto grid max-w-5xl gap-14 px-6 pb-20 pt-16 md:grid-cols-12 md:gap-16 md:px-10 md:pt-20">
        <div class="md:col-span-6">
          <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">
            CAPÍTULO ZERO
          </span>
          <h1
            class="font-mentor-display mt-5"
            :style="{ color: brand.colors.text, fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)', lineHeight: '0.95' }"
          >
            Comece a sua<br />
            <span class="italic" :style="{ color: brand.colors.primary }">construção.</span>
          </h1>
          <p class="mt-8 max-w-md text-base leading-relaxed" :style="{ color: `${brand.colors.text}CC` }">
            {{ brand.auth.registerSubtitle }} O Método ARCA funciona quando você faz o básico bem feito, todo mês, por muitos anos.
          </p>

          <div
            class="mt-12 border-l-4 pl-6"
            :style="{ borderColor: brand.colors.primary }"
          >
            <p class="font-mentor-display text-lg italic" :style="{ color: brand.colors.text }">
              "{{ brand.hero.founderQuote || 'Não existe atalho pra liberdade financeira. Só o caminho certo, feito com paciência.' }}"
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
            <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">INSCRIÇÃO</span>
            <h2 class="font-mentor-display mt-1 text-3xl" :style="{ color: brand.colors.text }">
              {{ brand.auth.registerTitle }}
            </h2>
          </div>

          <UFormField name="name">
            <template #label>
              <span class="font-mentor-eyebrow" :style="{ color: brand.colors.text }">Nome completo</span>
            </template>
            <AtomsFormInput v-model="state.name" type="text" placeholder="Seu nome" size="lg" class="w-full" />
          </UFormField>

          <UFormField name="login">
            <template #label>
              <span class="font-mentor-eyebrow" :style="{ color: brand.colors.text }">Usuário</span>
            </template>
            <AtomsFormInput v-model="state.login" type="text" placeholder="Seu usuário" size="lg" class="w-full" />
          </UFormField>

          <UFormField name="celular">
            <template #label>
              <span class="font-mentor-eyebrow" :style="{ color: brand.colors.text }">Celular</span>
            </template>
            <AtomsFormInput
              v-model="state.celular"
              v-maska="'+55 (##) # ####-####'"
              type="tel"
              autocomplete="tel"
              inputmode="tel"
              placeholder="+55 (11) 9 9999-9999"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <UFormField name="email">
            <template #label>
              <span class="font-mentor-eyebrow" :style="{ color: brand.colors.text }">E-mail</span>
            </template>
            <AtomsFormInput v-model="state.email" type="email" autocomplete="email" inputmode="email" spellcheck="false" placeholder="voce@exemplo.com" size="lg" class="w-full" />
          </UFormField>

          <UFormField name="password">
            <template #label>
              <span class="font-mentor-eyebrow" :style="{ color: brand.colors.text }">Senha</span>
            </template>
            <AtomsFormInputPassword v-model="state.password" :aria-invalid="score < 4" class="w-full" />
          </UFormField>

          <UFormField name="password_confirmation">
            <template #label>
              <span class="font-mentor-eyebrow" :style="{ color: brand.colors.text }">Confirme a senha</span>
            </template>
            <AtomsFormInputPassword v-model="state.password_confirmation" placeholder="Confirme a senha" class="w-full" />
          </UFormField>

          <p
            class="flex items-center gap-1 text-[10px] leading-tight transition-colors"
            :style="{ color: score >= 1 ? brand.colors.positive : brand.colors.textMuted }"
            aria-live="polite"
          >
            <UIcon
              :name="score >= 1 ? 'i-lucide-circle-check' : 'i-lucide-circle'"
              class="size-3 shrink-0"
              aria-hidden="true"
            />
            <span>A senha deve ter pelo menos 8 caracteres</span>
          </p>

          <AtomsButton type="submit" color="secondary" size="lg" :loading="submitting" :disabled="submitting || landing" class="mt-2 w-full justify-center font-mentor-eyebrow">
            COMEÇAR A CONSTRUIR →
          </AtomsButton>

          <div class="flex flex-col gap-2 border-t-2 pt-4" :style="{ borderColor: brand.colors.text }">
            <NuxtLink to="/auth/login" class="font-mentor-eyebrow transition hover:opacity-80" :style="{ color: brand.colors.primary }">
              JÁ É LEITOR? ENTRE NO MANUAL →
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
        <div class="flex items-start justify-between border-b pb-6" :style="{ borderColor: brand.colors.border }">
          <div class="flex flex-col gap-0.5">
            <span class="font-academic-label" :style="{ color: brand.colors.primary }">
              AUVP RESEARCH · NOVA MATRÍCULA
            </span>
            <span class="font-academic-body text-[12px] italic" :style="{ color: brand.colors.textMuted }">
              Protocolo de cadastro · aluno iniciante
            </span>
          </div>
          <span class="font-academic-mono text-[11px] uppercase tabular-nums" :style="{ color: brand.colors.textMuted }">
            {{ new Date().getFullYear() }}
          </span>
        </div>

        <div class="grid gap-14 md:grid-cols-12 md:gap-16">
          <div class="md:col-span-6">
            <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">
              § · matrícula
            </span>
            <h1
              class="font-academic-display mt-4"
              :style="{ color: brand.colors.text, fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: '1' }"
            >
              Abra o<br />
              <span class="italic" :style="{ color: brand.colors.primary }">caderno de estudo.</span>
            </h1>
            <hr class="dashed-rule mt-8 max-w-[8rem]" />
            <p class="font-academic-body mt-6 max-w-md text-[14px] italic" :style="{ color: brand.colors.textMuted }">
              <span class="red-pen">Nota do professor</span>, o cadastro é de graça, o esforço é cobrado em horas de estudo. Compareça. O método só funciona pra quem aparece.
            </p>
            <p class="font-academic-body mt-6 max-w-md text-[13px]" :style="{ color: brand.colors.text }">
              {{ brand.auth.registerSubtitle }}
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
              <span class="font-academic-label" :style="{ color: brand.colors.primary }">§1 · dados pessoais</span>
              <span class="font-academic-mono text-[10px] tabular-nums" :style="{ color: brand.colors.textMuted }">
                {{ sessionTime }}
              </span>
            </div>

            <UFormField name="name">
              <template #label>
                <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">Nome completo</span>
              </template>
              <AtomsFormInput v-model="state.name" type="text" placeholder="Como consta no seu documento" size="lg" class="w-full" />
            </UFormField>

            <UFormField name="login">
              <template #label>
                <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">Usuário</span>
              </template>
              <AtomsFormInput v-model="state.login" type="text" placeholder="Seu login" size="lg" class="w-full" />
            </UFormField>

            <UFormField name="celular">
              <template #label>
                <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">Celular</span>
              </template>
              <AtomsFormInput
                v-model="state.celular"
                v-maska="'+55 (##) # ####-####'"
                type="tel"
                autocomplete="tel"
                inputmode="tel"
                placeholder="+55 (11) 9 9999-9999"
                size="lg"
                class="w-full"
              />
            </UFormField>

            <UFormField name="email">
              <template #label>
                <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">E-mail</span>
              </template>
              <AtomsFormInput v-model="state.email" type="email" autocomplete="email" inputmode="email" spellcheck="false" placeholder="voce@exemplo.com" size="lg" class="w-full" />
            </UFormField>

            <UFormField name="password">
              <template #label>
                <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">Senha</span>
              </template>
              <AtomsFormInputPassword v-model="state.password" :aria-invalid="score < 4" class="w-full" />
            </UFormField>

            <UFormField name="password_confirmation">
              <template #label>
                <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">Confirme a senha</span>
              </template>
              <AtomsFormInputPassword v-model="state.password_confirmation" placeholder="Confirme a senha" class="w-full" />
            </UFormField>

            <p
            class="flex items-center gap-1 text-[10px] leading-tight transition-colors"
            :style="{ color: score >= 1 ? brand.colors.positive : brand.colors.textMuted }"
            aria-live="polite"
          >
            <UIcon
              :name="score >= 1 ? 'i-lucide-circle-check' : 'i-lucide-circle'"
              class="size-3 shrink-0"
              aria-hidden="true"
            />
            <span>A senha deve ter pelo menos 8 caracteres</span>
          </p>

            <AtomsButton type="submit" color="secondary" size="lg" :loading="submitting" :disabled="submitting || landing" class="mt-2 w-full justify-center font-academic-label">
              MATRICULAR-SE →
            </AtomsButton>

            <hr class="dashed-rule" />

            <div class="flex flex-col gap-2">
              <NuxtLink to="/auth/login" class="font-academic-body text-[13px] italic transition hover:opacity-70" :style="{ color: brand.colors.text }">
                Já sou aluno · entrar no terminal <span :style="{ color: brand.colors.primary }">→</span>
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
      <div class="pointer-events-none absolute inset-0 opacity-25">
        <div class="absolute left-[8%] top-[12%] size-3 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
        <div class="absolute left-[18%] top-[60%] size-2 rounded-full" :style="{ backgroundColor: brand.colors.secondary }" />
        <div class="absolute right-[12%] top-[20%] size-4 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
        <div class="absolute right-[30%] top-[75%] size-2 rounded-full" :style="{ backgroundColor: brand.colors.positive }" />
      </div>

      <div class="relative mx-auto flex max-w-5xl flex-col items-center gap-14 md:flex-row md:items-start md:gap-16">
        <div class="flex flex-1 flex-col items-center text-center md:items-start md:pt-4 md:text-left">
          <span class="lower-third">NOVO NO PROGRAMA · BEM-VINDA!</span>
          <h1
            class="font-showtime-display chunky-shadow mt-6"
            :style="{ color: brand.colors.text, fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)' }"
          >
            Bora entrar pra<br />
            <span class="highlighter" :style="{ color: brand.colors.primary }">família, criatura!</span>
          </h1>
          <p class="font-showtime-body mt-8 max-w-md text-base" :style="{ color: `${brand.colors.text}CC` }">
            {{ brand.auth.registerSubtitle }} Sem Sidnelson, sem pegadinha, sem frescura, só você, seu bolso e a Nath.
          </p>

          <div class="mt-8 flex items-start gap-3">
            <img src="/brand/mepoupe/margarete.svg" alt="Margarete" class="h-12 shrink-0" />
            <p class="font-showtime-body max-w-xs text-sm italic" :style="{ color: `${brand.colors.text}B3` }">
              "Abre essa conta e bora pro primeiro aporte, ai que festa, criatura!"
            </p>
          </div>

          <div class="mt-10 flex flex-wrap gap-3">
            <div
              class="inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 font-showtime-label text-[10px]"
              :style="{ borderColor: `${brand.colors.primary}70`, backgroundColor: `${brand.colors.primary}15`, color: brand.colors.text }"
            >
              💛 100% GRÁTIS
            </div>
            <div
              class="inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 font-showtime-label text-[10px]"
              :style="{ borderColor: `${brand.colors.primary}70`, backgroundColor: `${brand.colors.primary}15`, color: brand.colors.text }"
            >
              ⚡ EM 2 MINUTOS
            </div>
            <div
              class="inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 font-showtime-label text-[10px]"
              :style="{ borderColor: `${brand.colors.primary}70`, backgroundColor: `${brand.colors.primary}15`, color: brand.colors.text }"
            >
              🚫 SEM CARTÃO
            </div>
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
              MINHA FICHA DE INSCRIÇÃO
            </span>
            <h2 class="font-showtime-display mt-2" :style="{ color: brand.colors.text, fontSize: '1.75rem' }">
              {{ brand.auth.registerTitle }}
            </h2>
          </div>

          <UFormField name="name">
            <template #label>
              <span class="font-showtime-label" :style="{ color: `${brand.colors.text}80` }">SEU NOME</span>
            </template>
            <AtomsFormInput v-model="state.name" type="text" placeholder="Como a gente te chama?" size="lg" class="w-full" />
          </UFormField>

          <UFormField name="login">
            <template #label>
              <span class="font-showtime-label" :style="{ color: `${brand.colors.text}80` }">USUÁRIO</span>
            </template>
            <AtomsFormInput v-model="state.login" type="text" placeholder="Escolha um apelido" size="lg" class="w-full" />
          </UFormField>

          <UFormField name="celular">
            <template #label>
              <span class="font-showtime-label" :style="{ color: `${brand.colors.text}80` }">CELULAR</span>
            </template>
            <AtomsFormInput
              v-model="state.celular"
              v-maska="'+55 (##) # ####-####'"
              type="tel"
              autocomplete="tel"
              inputmode="tel"
              placeholder="+55 (11) 9 9999-9999"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <UFormField name="email">
            <template #label>
              <span class="font-showtime-label" :style="{ color: `${brand.colors.text}80` }">E-MAIL</span>
            </template>
            <AtomsFormInput v-model="state.email" type="email" autocomplete="email" inputmode="email" spellcheck="false" placeholder="voce@exemplo.com" size="lg" class="w-full" />
          </UFormField>

          <UFormField name="password">
            <template #label>
              <span class="font-showtime-label" :style="{ color: `${brand.colors.text}80` }">SENHA SECRETA</span>
            </template>
            <AtomsFormInputPassword v-model="state.password" :aria-invalid="score < 4" class="w-full" />
          </UFormField>

          <UFormField name="password_confirmation">
            <template #label>
              <span class="font-showtime-label" :style="{ color: `${brand.colors.text}80` }">REPETE A SENHA</span>
            </template>
            <AtomsFormInputPassword v-model="state.password_confirmation" placeholder="Confirme a senha" class="w-full" />
          </UFormField>

          <p
            class="flex items-center gap-1 text-[10px] leading-tight transition-colors"
            :style="{ color: score >= 1 ? brand.colors.positive : brand.colors.textMuted }"
            aria-live="polite"
          >
            <UIcon
              :name="score >= 1 ? 'i-lucide-circle-check' : 'i-lucide-circle'"
              class="size-3 shrink-0"
              aria-hidden="true"
            />
            <span>A senha deve ter pelo menos 8 caracteres</span>
          </p>

          <AtomsButton type="submit" color="secondary" size="lg" :loading="submitting" :disabled="submitting || landing" class="mt-3 w-full justify-center font-showtime-label">
            BORA COMEÇAR, CRIATURA! →
          </AtomsButton>

          <div class="flex flex-col items-center gap-2 text-center">
            <NuxtLink to="/auth/login" class="font-showtime-label underline underline-offset-4 transition hover:opacity-70" :style="{ color: brand.colors.primary }">
              JÁ SOU DA FAMÍLIA · ENTRAR →
            </NuxtLink>
            <p class="font-showtime-body text-[11px]" :style="{ color: `${brand.colors.text}80` }">
              {{ brand.auth.termsText }}
            </p>
          </div>
        </UForm>
      </div>
    </section>

    <!-- ========== PLAYBOOK VARIANT (Saraiva Invest) ========== -->
    <section
      v-else-if="variant === 'playbook'"
      class="relative min-h-screen overflow-hidden px-4 pb-16 pt-12"
      :style="{ backgroundColor: brand.colors.background }"
    >
      <div class="pointer-events-none absolute inset-0">
        <div
          class="absolute -top-40 left-1/2 h-[640px] w-[1100px] -translate-x-1/2 rounded-full blur-3xl opacity-25"
          :style="{ background: `radial-gradient(ellipse, ${brand.colors.primary}, transparent 65%)` }"
        />
        <div
          class="absolute inset-0 opacity-[0.04]"
          :style="{ backgroundImage: `radial-gradient(${brand.colors.text} 1px, transparent 1px)`, backgroundSize: '36px 36px' }"
        />
      </div>

      <div class="relative mx-auto flex max-w-6xl flex-col items-start gap-12 md:flex-row md:gap-16 md:py-12">
        <div class="flex flex-1 flex-col items-start text-left md:sticky md:top-12">
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
            Comece o<br />
            <span :style="{ color: brand.colors.primary }">método.</span>
          </h1>
          <p class="mt-6 max-w-md text-[16px] leading-relaxed" :style="{ color: `${brand.colors.text}C0` }">
            {{ brand.auth.registerSubtitle }}
          </p>

          <ul class="mt-10 flex flex-col gap-3 border-t pt-6" :style="{ borderColor: `${brand.colors.border}80` }">
            <li v-for="t in ['Backtests reais', 'Zero guru', 'Método publicado', 'Sem FOMO']" :key="t" class="flex items-center gap-3 text-[13px]" :style="{ color: brand.colors.text }">
              <UIcon name="i-lucide-check-circle-2" class="size-4" :style="{ color: brand.colors.primary }" />
              {{ t }}
            </li>
          </ul>
        </div>

        <UForm
          :schema="schema"
          :state="state"
          class="flex w-full max-w-md flex-col gap-5 rounded-3xl border p-8 md:p-10"
          :style="{
            borderColor: brand.colors.border,
            backgroundColor: brand.colors.surface,
            boxShadow: `0 30px 80px -30px ${brand.colors.primary}30`,
          }"
          @submit="onSubmit"
        >
          <div class="space-y-2">
            <span class="text-[10px] font-bold uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">
             , Cadastro
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
              {{ brand.auth.registerTitle }}
            </h2>
          </div>

          <UFormField name="name">
            <AtomsFormInput v-model="state.name" type="text" placeholder="Nome completo" size="lg" class="w-full" />
          </UFormField>
          <UFormField name="login">
            <AtomsFormInput v-model="state.login" type="text" placeholder="Usuário" size="lg" class="w-full" />
          </UFormField>
          <UFormField name="celular">
            <AtomsFormInput v-model="state.celular" v-maska="'+55 (##) # ####-####'" type="tel" autocomplete="tel" inputmode="tel" placeholder="Celular" size="lg" class="w-full" />
          </UFormField>
          <UFormField name="email">
            <AtomsFormInput v-model="state.email" type="email" autocomplete="email" inputmode="email" spellcheck="false" placeholder="E-mail" size="lg" class="w-full" />
          </UFormField>
          <UFormField name="password">
            <AtomsFormInputPassword v-model="state.password" :aria-invalid="score < 4" class="w-full" />
          </UFormField>
          <UFormField name="password_confirmation">
            <AtomsFormInputPassword v-model="state.password_confirmation" placeholder="Confirme a senha" class="w-full" />
          </UFormField>
          <p
            class="flex items-center gap-1 text-[10px] leading-tight transition-colors"
            :style="{ color: score >= 1 ? brand.colors.positive : brand.colors.textMuted }"
            aria-live="polite"
          >
            <UIcon
              :name="score >= 1 ? 'i-lucide-circle-check' : 'i-lucide-circle'"
              class="size-3 shrink-0"
              aria-hidden="true"
            />
            <span>A senha deve ter pelo menos 8 caracteres</span>
          </p>

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
            Começar o método
            <span class="transition-transform group-hover:translate-x-1">→</span>
          </button>

          <div class="flex flex-col gap-2 pt-2 text-center">
            <NuxtLink to="/auth/login" class="text-[12px] font-bold underline-offset-4 transition hover:opacity-70" :style="{ color: brand.colors.primary }">
              Já tem conta? <span class="underline">Entrar</span>
            </NuxtLink>
            <p class="text-[10px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
              {{ brand.auth.termsText }}
            </p>
          </div>
        </UForm>
      </div>
    </section>

    <!-- ========== HOLDER VARIANT ========== -->
    <section
      v-else-if="variant === 'holder'"
      class="relative min-h-screen overflow-hidden"
      :style="{ backgroundColor: brand.colors.background }"
    >
      <div class="border-b" :style="{ borderColor: brand.colors.border }">
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-10">
          <div class="flex items-center gap-4 text-[10px] uppercase tracking-[0.18em]" style="font-family: 'JetBrains Mono', monospace;">
            <span :style="{ color: brand.colors.primary }">Hold</span>
            <span :style="{ color: brand.colors.textMuted }">CADASTRO · NOVO HOLDER</span>
          </div>
          <span class="text-[10px] uppercase tracking-[0.18em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.textMuted }">
            01 / 01
          </span>
        </div>
      </div>

      <div class="mx-auto grid max-w-7xl grid-cols-12 items-stretch gap-0 px-6 py-12 md:px-10 md:py-16 lg:py-20">
        <div class="col-span-12 flex flex-col justify-center border-b pb-10 lg:col-span-7 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-10" :style="{ borderColor: brand.colors.border }">
          <div class="mb-6 text-[10px] font-bold uppercase tracking-[0.22em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.primary }">
            01 · Tornar-se holder
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
            {{ brand.auth.registerTitle }}.<br />
            <span class="italic" :style="{ color: brand.colors.primary, fontWeight: 500 }">Sem trial. Sem cartão.</span>
          </h1>
          <p
            class="max-w-xl text-[18px] leading-[1.65]"
            :style="{
              color: `${brand.colors.text}C0`,
              fontFamily: `'Spectral', 'Georgia', serif`,
            }"
          >
            {{ brand.auth.registerSubtitle }}
          </p>

          <ul class="mt-12 flex flex-col gap-3" style="font-family: 'Spectral', serif;">
            <li v-for="(t, i) in ['Sem trial. Sem cartão. Grátis.', 'Acesso completo ao Manifesto mensal.', 'Calculadoras + IA treinada nas cartas.', 'Dados B3 em tempo real.']" :key="i" class="flex items-baseline gap-3 text-[15px]" :style="{ color: brand.colors.text }">
              <span class="text-[10px] tabular-nums" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.primary }">
                {{ String(i + 1).padStart(2, '0') }}
              </span>
              <span class="italic">{{ t }}</span>
            </li>
          </ul>

          <div class="mt-12 flex items-center gap-4 text-[11px] uppercase tracking-[0.22em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.textMuted }">
            <span class="h-px w-12" :style="{ backgroundColor: brand.colors.border }" />
            <span :style="{ color: brand.colors.primary }">, @holder</span>
          </div>
        </div>

        <div class="col-span-12 flex items-start lg:col-span-5">
          <UForm
            :schema="schema"
            :state="state"
            class="flex w-full flex-col gap-4 border p-7"
            :style="{
              borderColor: brand.colors.border,
              backgroundColor: brand.colors.surface,
            }"
            @submit="onSubmit"
          >
            <div class="border-b pb-5" :style="{ borderColor: brand.colors.border }">
              <span class="text-[10px] font-bold uppercase tracking-[0.22em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.primary }">
                Dados de cadastro
              </span>
            </div>

            <UFormField name="name">
              <template #label>
                <span class="text-[10px] font-bold uppercase tracking-[0.18em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.textMuted }">Nome</span>
              </template>
              <AtomsFormInput v-model="state.name" type="text" placeholder="Nome completo" size="lg" class="w-full" />
            </UFormField>
            <UFormField name="login">
              <template #label>
                <span class="text-[10px] font-bold uppercase tracking-[0.18em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.textMuted }">Usuário</span>
              </template>
              <AtomsFormInput v-model="state.login" type="text" placeholder="Usuário" size="lg" class="w-full" />
            </UFormField>
            <UFormField name="celular">
              <template #label>
                <span class="text-[10px] font-bold uppercase tracking-[0.18em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.textMuted }">Celular</span>
              </template>
              <AtomsFormInput v-model="state.celular" v-maska="'+55 (##) # ####-####'" type="tel" autocomplete="tel" inputmode="tel" placeholder="+55 (00) 0 0000-0000" size="lg" class="w-full" />
            </UFormField>
            <UFormField name="email">
              <template #label>
                <span class="text-[10px] font-bold uppercase tracking-[0.18em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.textMuted }">E-mail</span>
              </template>
              <AtomsFormInput v-model="state.email" type="email" autocomplete="email" inputmode="email" spellcheck="false" placeholder="seu@email.com" size="lg" class="w-full" />
            </UFormField>
            <UFormField name="password">
              <template #label>
                <span class="text-[10px] font-bold uppercase tracking-[0.18em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.textMuted }">Senha</span>
              </template>
              <AtomsFormInputPassword v-model="state.password" :aria-invalid="score < 4" class="w-full" />
            </UFormField>
            <UFormField name="password_confirmation">
              <template #label>
                <span class="text-[10px] font-bold uppercase tracking-[0.18em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.textMuted }">Confirmar senha</span>
              </template>
              <AtomsFormInputPassword v-model="state.password_confirmation" placeholder="Confirme a senha" class="w-full" />
            </UFormField>
            <p
            class="flex items-center gap-1 text-[10px] leading-tight transition-colors"
            :style="{ color: score >= 1 ? brand.colors.positive : brand.colors.textMuted }"
            aria-live="polite"
          >
            <UIcon
              :name="score >= 1 ? 'i-lucide-circle-check' : 'i-lucide-circle'"
              class="size-3 shrink-0"
              aria-hidden="true"
            />
            <span>A senha deve ter pelo menos 8 caracteres</span>
          </p>

            <button
              type="submit"
              class="mt-4 inline-flex w-full items-center justify-center gap-3 px-6 py-4 text-[12px] font-bold uppercase tracking-[0.18em] transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-0.5"
              :style="{
                backgroundColor: brand.colors.primary,
                color: brand.colors.text,
              }"
            >
              <UIcon name="i-lucide-anchor" class="size-4" />
              Tornar-se holder
              <span>→</span>
            </button>

            <div class="mt-2 flex flex-col gap-3 border-t pt-5" :style="{ borderColor: brand.colors.border }">
              <NuxtLink to="/auth/login" class="text-[11px] font-bold uppercase tracking-[0.18em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.primary }">
                Já sou holder · entrar →
              </NuxtLink>
              <p class="text-[10px] leading-snug italic" style="font-family: 'Spectral', serif;" :style="{ color: brand.colors.textMuted }">
                {{ brand.auth.termsText }}
              </p>
            </div>
          </UForm>
        </div>
      </div>

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
            Crie sua conta para acessar carteiras inteligentes, simuladores de investimentos e recursos personalizados que aceleram seus resultados.
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
              Cadastro
            </span>
            <h1 class="text-2xl font-semibold" :style="{ color: brand.colors.text }">{{ brand.auth.registerTitle }}</h1>
            <p class="text-sm" :style="{ color: brand.colors.textMuted }">
              {{ brand.auth.registerSubtitle }}
            </p>
          </div>

          <!-- Cadastro reduzido — Redentia v3: nome completo + email +
               senha. Os campos `login` e `celular` foram removidos pra
               cortar fricao no funil. login agora = email (auto-set no
               submit), celular fica pra coleta posterior em /settings
               (sera obrigatorio antes de acessar wallet/chat numa proxima
               iteracao). advisor_code tambem foi cortado — o codigo do
               assessor passa a ser indicado depois via convite/profile. -->
          <UFormField name="name">
            <AtomsFormInput v-model="state.name" type="text" autocomplete="name" placeholder="Nome completo" size="lg" class="w-full" />
          </UFormField>

          <UFormField name="email">
            <AtomsFormInput v-model="state.email" type="email" autocomplete="email" inputmode="email" spellcheck="false" placeholder="E-mail" size="lg" class="w-full" />
          </UFormField>

          <UFormField name="password">
            <AtomsFormInputPassword v-model="state.password" autocomplete="new-password" :aria-invalid="score < 4" class="w-full" />
          </UFormField>

          <UFormField name="password_confirmation">
            <AtomsFormInputPassword v-model="state.password_confirmation" autocomplete="new-password" placeholder="Confirme a senha" class="w-full" />
          </UFormField>

          <p
            class="flex items-center gap-1 text-[10px] leading-tight transition-colors"
            :style="{ color: score >= 1 ? brand.colors.positive : brand.colors.textMuted }"
            aria-live="polite"
          >
            <UIcon
              :name="score >= 1 ? 'i-lucide-circle-check' : 'i-lucide-circle'"
              class="size-3 shrink-0"
              aria-hidden="true"
            />
            <span>A senha deve ter pelo menos 8 caracteres</span>
          </p>

          <!-- Submit unificado (variant default → Redentia + tenants sem
               variant proprio). bg var(--brand-primary) + texto branco. -->
          <button
            type="submit"
            :disabled="submitting || landing"
            class="inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 text-[15px] font-semibold transition-[filter,box-shadow] duration-200 disabled:cursor-not-allowed disabled:opacity-60"
            :style="{ backgroundColor: 'var(--brand-primary)', color: '#fff' }"
            @mouseenter="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.94)'"
            @mouseleave="($event.currentTarget as HTMLElement).style.filter = 'brightness(1)'"
          >
            <UIcon v-if="submitting" name="i-lucide-loader-2" class="size-4 animate-spin" aria-hidden="true" />
            <span>{{ brand.nav.register }}</span>
          </button>

          <div class="flex flex-col gap-2 text-center md:text-left">
            <NuxtLink to="/auth/login" class="text-sm font-medium transition hover:opacity-80" :style="{ color: brand.colors.primary }">
              Já tem uma conta? Faça login
            </NuxtLink>
            <p class="text-[11px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
              {{ brand.auth.termsText }}
            </p>
          </div>
        </UForm>
      </div>
    </section>

    <!--
      Landing overlay (registration) — same component pattern as the
      one in /auth/login. Fades in after the register call resolves
      and stays up until the redirect lands. Brand-tinted spinner +
      personalised greeting using the name the user just typed.
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
          <div
            class="landing-spinner"
            :style="{ borderColor: `color-mix(in srgb, ${brand.colors.primary} 25%, transparent)`, borderTopColor: brand.colors.primary }"
          />
          <div class="flex flex-col items-center gap-1.5">
            <span
              class="font-mono-tab text-[11px] font-medium uppercase"
              :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
            >Cadastro concluído</span>
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
  to { transform: rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  .landing-spinner { animation: none; }
}
.landing-fade-enter-active,
.landing-fade-leave-active {
  transition: opacity 200ms ease-out;
}
.landing-fade-enter-from,
.landing-fade-leave-to { opacity: 0; }
</style>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { vMaska } from 'maska/vue'

const brand = useBrand()
const { register } = useAuthService()
const authStore = useAuthStore()
const { track } = useMetaPixel()

const variant = computed(() => brand.hero?.variant || 'default')

const sessionTime = computed(() => {
  try {
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
})

// Requisitos de senha simplificados — antes exigiamos 4 (8 chars + numero
// + minuscula + maiuscula). Agora so 8 caracteres minimo, em linha com
// o NIST SP 800-63B revisado que recomenda comprimento sobre composicao
// (composicao forcada gera senhas previsiveis tipo Senha123). Reduz
// fricao no funil sem comprometer segurança real.
const passwordRequirements = [
  { regex: /.{8,}/, text: 'Pelo menos 8 caracteres' },
]

/**
 * Deriva um username valido a partir do email do usuario.
 *
 * Backend valida `login` como `[a-z0-9]+` (sem pontos, sem @, sem
 * underscore). Email tipico (`andre.victor29@hotmail.com`) tem
 * caracteres invalidos no local-part, entao se mandassemos o email
 * inteiro o cadastro quebraria com "O login deve conter apenas letras
 * e numeros".
 *
 * Estrategia: pega o local-part (antes do @), lowercases e remove
 * tudo que nao for letra/digito. Se ficar curto (< 4 chars, alguns
 * tenants exigem min length), padda com sufixo time-based pra
 * garantir unicidade entre cadastros simultaneos.
 *
 * Exemplos:
 *   andre.victor29@hotmail.com  → andrevictor29
 *   ana@redentia.com.br         → ana<sufixo>     (caso tenha min 4)
 *   joao+spam@gmail.com         → joaospam
 */
function deriveLoginFromEmail(email: string): string {
  const local = (email.split('@')[0] ?? '').toLowerCase()
  const sanitized = local.replace(/[^a-z0-9]/g, '')
  if (sanitized.length >= 4) return sanitized
  // Padding determinístico-ish baseado em timestamp curto (base36).
  // Nao usamos Math.random pra ficar mais reproducivel em testes.
  return sanitized + Date.now().toString(36).slice(-4)
}

const schema = z
  .object({
    name: z.string().min(2, 'Nome obrigatório'),
    // login e celular ficaram OPCIONAIS na schema porque o variant
    // default da Redentia removeu esses campos do form. Outros variants
    // (mentor, holder, showtime, etc.) ainda renderizam e o usuario
    // preenche; nesse caso vai pra payload normalmente. Quando vazio,
    // o submit usa o email como login e omite celular.
    login: z.string().optional(),
    email: z.string().email('Email inválido'),
    celular: z.string().optional(),
    password: z
      .string()
      .refine(
        (value) => passwordRequirements.every((req) => req.regex.test(value)),
        {
          message: 'A senha não atende a todos os requisitos',
        }
      ),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'As senhas devem ser iguais',
    path: ['password_confirmation'],
  })

type Schema = z.infer<typeof schema>

const state = reactive({
  name: '',
  login: '',
  email: '',
  celular: '',
  password: '',
  password_confirmation: '',
})

const requirements = computed(() =>
  passwordRequirements.map((req) => ({
    ...req,
    met: req.regex.test(state.password ?? ''),
  }))
)

// Score binario agora (so 1 requisito: 8 chars). Usado no ticker
// inline (icone de check verde quando score >= 1) e tambem no
// canSubmitPassword (na tela de settings) — aqui no register o submit
// e bloqueado pela schema do zod, score so alimenta o ticker visual.
const score = computed(() => requirements.value.filter((r) => r.met).length)

const router = useRouter()

// Two-phase loading. `submitting` keeps the form disabled + button
// in spinner state during the network round-trip; `landing` swaps
// in the brand-tinted overlay while we settle the auth + redirect.
// Splitting them removes the awkward 200-300ms gap where the form
// looked frozen but no visual feedback was happening.
const submitting = ref(false)
const landing = ref(false)

const landingCardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 92%, ${brand.colors.background})`,
  borderColor: `color-mix(in srgb, ${brand.colors.primary} 22%, transparent)`,
  boxShadow: `0 24px 60px -32px color-mix(in srgb, ${brand.colors.primary} 35%, transparent), 0 8px 16px -10px rgba(0,0,0,0.18)`,
}))

/** Friendly first name from `state.name`; capitalised. Used in both
 *  the success toast and the landing overlay. Falls back to a
 *  generic greeting when the user typed something we can't parse. */
function welcomeName(): string {
  const raw = (state.name || '').trim()
  if (!raw) return ''
  const first = raw.split(/\s+/)[0] ?? ''
  if (!first) return ''
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
}

const landingMessage = computed(() => {
  const n = welcomeName()
  return n ? `Bem-vindo, ${n}` : 'Bem-vindo'
})

async function onSubmit(_: FormSubmitEvent<Schema>) {
  if (submitting.value) return
  submitting.value = true
  try {
    const payload: Parameters<typeof register>[0] = {
      name: state.name,
      email: state.email,
      // login = derivado do email (alphanumeric only) por default.
      // Outros variants antigos ainda renderizam o input proprio de
      // login; se o usuario digitou algo, respeitamos.
      // Backend valida `[a-z0-9]+`, entao mandar o email cru
      // (`andre.victor29@hotmail.com`) quebrava com "login deve conter
      // apenas letras e numeros".
      login: state.login?.trim() || deriveLoginFromEmail(state.email),
      password: state.password,
      password_confirmation: state.password_confirmation,
    }
    // Celular agora opcional. So manda se o usuario preencheu (nos
    // variants antigos). E.164: '+5511999999999' a partir do mascarado.
    const cleanedCelular = state.celular?.replace(/\D/g, '') ?? ''
    if (cleanedCelular.length >= 10) {
      payload.celular = '+' + cleanedCelular
    }
    // advisor_code foi removido do cadastro inicial. Quem tem codigo
    // de assessor agora vincula depois em /settings via
    // <MoleculesSettingsAttachAdvisor> (que ja existia na pagina).
    const resp = (await register(payload)) as {
      access_token?: string
      token?: string
      user?: unknown
    }
    const token = resp?.access_token ?? resp?.token
    const name = welcomeName()

    if (token) {
      authStore.addToken(token)
      await authStore.fetchProfile()
      track('CompleteRegistration', {
        content_name: 'User Registration',
        status: true,
      })
      showSuccessNotification(
        name ? `Cadastro concluído, ${name}` : 'Cadastro concluído',
        'Carregando seu painel…',
      )
      // Hand off to the landing overlay so the post-auth redirect
      // happens with a polished transition instead of a frozen form.
      landing.value = true
      setTimeout(() => router.push('/'), 280)
    } else {
      track('CompleteRegistration', {
        content_name: 'User Registration',
        status: true,
      })
      showSuccessNotification(
        'Cadastro concluído',
        'Agora você pode fazer login.',
      )
      // Same overlay flow, just routed at /auth/login since the
      // backend didn't auto-issue a token. Keeps the UX consistent.
      landing.value = true
      setTimeout(() => router.push('/auth/login'), 280)
    }
  } catch (e) {
    const message =
      (e as { data?: { message?: string } })?.data?.message
        ?? (e instanceof Error ? e.message : 'Verifique os dados informados')
    showErrorNotification('Falha no cadastro', message)
  } finally {
    submitting.value = false
  }
}

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title: `Criar conta | ${brand.name}`,
  description:
    `Crie sua conta na ${brand.name} para acompanhar ações, FIIs e receber análises e insights com inteligência artificial.`,
  path: '/auth/register',
  robots: 'noindex,nofollow',
})
</script>
