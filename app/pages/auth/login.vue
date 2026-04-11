<template>
  <NuxtLayout name="static" :title="false" :showLogo="false">
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
          <div class="flex items-center gap-3 font-mono-tab text-[10px] uppercase tracking-[0.18em]">
            <span class="flex items-center gap-1.5" :style="{ color: brand.colors.primary }">
              <span class="relative flex size-1.5">
                <span class="absolute inline-flex size-1.5 animate-ping rounded-full opacity-75" :style="{ backgroundColor: brand.colors.primary }" />
                <span class="relative inline-flex size-1.5 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
              </span>
              [LOGIN.TERMINAL]
            </span>
            <span :style="{ color: brand.colors.border }">·</span>
            <span :style="{ color: brand.colors.textMuted }">{{ brand.name.toUpperCase() }} v2.1</span>
          </div>

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
          <div class="flex items-center justify-between border-b pb-4" :style="{ borderColor: brand.colors.border }">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
              [AUTH.INPUT]
            </span>
            <span class="font-mono-tab text-[10px]" :style="{ color: brand.colors.textMuted }">ENC · TLS</span>
          </div>

          <UFormField name="login">
            <template #label>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">&gt; USER_ID</span>
            </template>
            <AtomsFormInput v-model="state.login" type="text" placeholder="investidor@brasil.b3" size="lg" class="w-full" />
          </UFormField>

          <UFormField name="password">
            <template #label>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">&gt; PASSWORD</span>
            </template>
            <AtomsFormInputPassword v-model="state.password" class="w-full" />
          </UFormField>

          <AtomsButton type="submit" color="secondary" size="lg" class="mt-2 w-full justify-center font-mono-tab text-xs tracking-[0.15em]">
            [ AUTENTICAR ]
          </AtomsButton>

          <div class="flex items-center justify-between border-t pt-4" :style="{ borderColor: brand.colors.border }">
            <NuxtLink to="/auth/register" class="font-mono-tab text-[10px] uppercase tracking-[0.15em] transition hover:opacity-80" :style="{ color: brand.colors.primary }">
              &gt; REGISTER_NEW
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
              <span class="font-small-caps text-[10px]" :style="{ color: brand.colors.textMuted }">Usuário</span>
            </template>
            <AtomsFormInput v-model="state.login" type="text" placeholder="Seu usuário" size="lg" class="w-full" />
          </UFormField>

          <UFormField name="password">
            <template #label>
              <span class="font-small-caps text-[10px]" :style="{ color: brand.colors.textMuted }">Senha</span>
            </template>
            <AtomsFormInputPassword v-model="state.password" class="w-full" />
          </UFormField>

          <AtomsButton type="submit" color="secondary" size="lg" class="mt-2 w-full justify-center font-small-caps tracking-wide">
            Entrar no portal
          </AtomsButton>

          <hr class="dashed-rule" />

          <div class="flex flex-col gap-2">
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
              — {{ brand.founder?.name || 'Thiago Nigro' }}
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
              <span class="font-mentor-eyebrow" :style="{ color: brand.colors.text }">Usuário</span>
            </template>
            <AtomsFormInput v-model="state.login" type="text" placeholder="Como você se identifica" size="lg" class="w-full" />
          </UFormField>

          <UFormField name="password">
            <template #label>
              <span class="font-mentor-eyebrow" :style="{ color: brand.colors.text }">Senha</span>
            </template>
            <AtomsFormInputPassword v-model="state.password" class="w-full" />
          </UFormField>

          <AtomsButton type="submit" color="secondary" size="lg" class="mt-2 w-full justify-center font-mentor-eyebrow">
            ENTRAR NO MANUAL →
          </AtomsButton>

          <div class="flex flex-col gap-2 border-t-2 pt-4" :style="{ borderColor: brand.colors.text }">
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
              <span class="red-pen">Nota do professor</span> — o método não funciona pra quem estuda uma vez e desaparece. Acesso diário é premissa, não extra.
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
                <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">Usuário</span>
              </template>
              <AtomsFormInput v-model="state.login" type="text" placeholder="Seu login de estudo" size="lg" class="w-full" />
            </UFormField>

            <UFormField name="password">
              <template #label>
                <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">Senha</span>
              </template>
              <AtomsFormInputPassword v-model="state.password" class="w-full" />
            </UFormField>

            <AtomsButton type="submit" color="secondary" size="lg" class="mt-2 w-full justify-center font-academic-label">
              ABRIR O TERMINAL →
            </AtomsButton>

            <hr class="dashed-rule" />

            <div class="flex flex-col gap-2">
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
              "Bora lá, que dinheiro parado não rende nada — só o juro composto, esse filho maravilhoso!"
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
              <span class="font-showtime-label" :style="{ color: `${brand.colors.text}80` }">SEU USUÁRIO</span>
            </template>
            <AtomsFormInput v-model="state.login" type="text" placeholder="Como você entrou da última vez" size="lg" class="w-full" />
          </UFormField>

          <UFormField name="password">
            <template #label>
              <span class="font-showtime-label" :style="{ color: `${brand.colors.text}80` }">SENHA SECRETA</span>
            </template>
            <AtomsFormInputPassword v-model="state.password" class="w-full" />
          </UFormField>

          <AtomsButton type="submit" color="secondary" size="lg" class="mt-3 w-full justify-center font-showtime-label">
            BORA ENTRAR! →
          </AtomsButton>

          <div class="flex flex-col items-center gap-2 text-center">
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
            <AtomsFormInput v-model="state.login" type="text" placeholder="Usuário" size="lg" class="w-full" />
          </UFormField>

          <UFormField name="password">
            <AtomsFormInputPassword v-model="state.password" class="w-full" />
          </UFormField>

          <AtomsButton type="submit" color="secondary" size="lg" class="mt-2 w-full justify-center">
            {{ brand.nav.login }}
          </AtomsButton>

          <div class="flex flex-col gap-2 text-center md:text-left">
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
  </NuxtLayout>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const brand = useBrand()
const router = useRouter()
const { login } = useAuthService()
const authStore = useAuthStore()

// Use the hero variant as the single source of truth for auth page styling.
const variant = computed(() => brand.hero?.variant || 'default')

// Displayed session timestamp — for terminal/research variants.
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

async function onSubmit(_: FormSubmitEvent<Schema>) {
  try {
    const resp = await login({ login: state.login, password: state.password })
    if (resp.access_token) {
      authStore.addToken(resp.access_token)
      await authStore.fetchProfile()
      showSuccessNotification('Login efetuado', 'Bem-vindo de volta!')
      router.push('/')
    }
  } catch (e) {
    console.log(e)
    const message =
      e instanceof Error ? e?.data?.message : 'Verifique suas credenciais'
    showErrorNotification('Falha no login', message)
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
