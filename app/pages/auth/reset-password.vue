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
            Nova <span class="italic" :style="{ color: brand.colors.primary }">credencial.</span>
          </h1>

          <p class="max-w-md text-sm font-mono-tab" :style="{ color: brand.colors.textMuted }">
            Defina uma senha com pelo menos 8 caracteres. Todas as sessões abertas serão encerradas.
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
                <span class="ml-2">{{ brand.name.toUpperCase() }}.RESET</span>
              </div>
              <span class="hidden sm:inline">~/auth/reset</span>
            </div>
            <div class="px-5 py-4 font-mono-tab text-xs" :style="{ color: brand.colors.textMuted }">
              <div><span :style="{ color: brand.colors.primary }">&gt;</span> validating token...</div>
              <div><span :style="{ color: tokenOK ? brand.colors.positive : brand.colors.negative }">{{ tokenOK ? '✓' : '✗' }}</span> {{ tokenOK ? 'token accepted' : 'token missing' }}</div>
              <div><span :style="{ color: brand.colors.primary }">&gt;</span> awaiting new password_</div>
            </div>
          </div>
        </div>

        <UForm
          v-if="tokenOK && !completed"
          :schema="schema"
          :state="state"
          class="flex w-full max-w-md flex-col gap-5 rounded-lg border p-8"
          :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.surface}E6` }"
          @submit="onSubmit"
        >
          <div class="flex items-center justify-between border-b pb-4" :style="{ borderColor: brand.colors.border }">
            <span class="font-mono-tab text-[10px]" :style="{ color: brand.colors.textMuted }">USER:</span>
            <span class="font-mono-tab text-[10px] truncate" :style="{ color: brand.colors.text }">{{ email }}</span>
          </div>

          <UFormField name="password">
            <template #label>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">&gt; NEW_PASSWORD</span>
            </template>
            <AtomsFormInputPassword v-model="state.password" class="w-full" />
          </UFormField>

          <UFormField name="password_confirmation">
            <template #label>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">&gt; CONFIRM</span>
            </template>
            <AtomsFormInputPassword v-model="state.password_confirmation" class="w-full" />
          </UFormField>

          <AtomsButton type="submit" color="secondary" size="lg" :loading="submitting" :disabled="submitting" class="mt-2 w-full justify-center font-mono-tab text-xs tracking-[0.15em]">
            COMMIT NEW PASSWORD
          </AtomsButton>

          <div class="flex items-center justify-end border-t pt-4" :style="{ borderColor: brand.colors.border }">
            <NuxtLink to="/auth/login" class="font-mono-tab text-[10px] uppercase tracking-[0.15em] transition hover:opacity-80" :style="{ color: brand.colors.primary }">
              &gt; BACK_TO_LOGIN
            </NuxtLink>
          </div>
        </UForm>

        <div
          v-else
          class="flex w-full max-w-md flex-col gap-4 rounded-lg border p-8"
          :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.surface}E6` }"
        >
          <div class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: completed ? brand.colors.positive : brand.colors.negative }">
            {{ completed ? '✓ PASSWORD UPDATED' : '✗ INVALID OR EXPIRED LINK' }}
          </div>
          <p class="font-mono-tab text-xs" :style="{ color: brand.colors.textMuted }">
            {{ completed ? 'Redirecionando para o login...' : 'Solicite um novo link de redefinição.' }}
          </p>
          <NuxtLink :to="completed ? '/auth/login' : '/auth/forgot-password'" class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.primary }">
            &gt; {{ completed ? 'IR PARA LOGIN' : 'NEW_RECOVERY_LINK' }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ========== EDITORIAL VARIANT ========== -->
    <section
      v-else-if="variant === 'editorial'"
      class="min-h-screen px-4 pb-16 pt-12"
      :style="{ backgroundColor: brand.colors.background }"
    >
      <div class="mx-auto grid max-w-5xl gap-16 md:grid-cols-12 md:gap-20">
        <div class="md:col-span-6 md:pt-10">
          <span class="font-small-caps text-[11px]" :style="{ color: brand.colors.textMuted }">
            {{ brand.name }} &nbsp;·&nbsp; Nova senha
          </span>
          <h1
            class="font-editorial-display mt-4"
            :style="{ color: brand.colors.text, fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: '1.05' }"
          >
            Defina uma<br />
            <span class="italic" :style="{ color: brand.colors.primary }">credencial nova.</span>
          </h1>
          <hr class="dashed-rule mt-8 max-w-[6rem]" />
          <p class="font-editorial-body mt-8 max-w-md text-base italic" :style="{ color: brand.colors.textMuted }">
            Ao confirmar, todas as sessões anteriores serão encerradas. Você precisará entrar de novo em cada dispositivo.
          </p>
        </div>

        <UForm
          v-if="tokenOK && !completed"
          :schema="schema"
          :state="state"
          class="flex w-full flex-col gap-6 border px-10 py-12 md:col-span-6"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
          @submit="onSubmit"
        >
          <div>
            <span class="font-small-caps text-[10px]" :style="{ color: brand.colors.textMuted }">Nova senha para</span>
            <h2 class="font-editorial-display mt-2 truncate text-2xl" :style="{ color: brand.colors.text }">
              {{ email }}
            </h2>
          </div>

          <UFormField name="password">
            <template #label>
              <span class="font-small-caps text-[10px]" :style="{ color: brand.colors.textMuted }">Nova senha</span>
            </template>
            <AtomsFormInputPassword v-model="state.password" class="w-full" />
          </UFormField>

          <UFormField name="password_confirmation">
            <template #label>
              <span class="font-small-caps text-[10px]" :style="{ color: brand.colors.textMuted }">Confirmar senha</span>
            </template>
            <AtomsFormInputPassword v-model="state.password_confirmation" class="w-full" />
          </UFormField>

          <AtomsButton type="submit" color="secondary" size="lg" :loading="submitting" :disabled="submitting" class="mt-2 w-full justify-center font-small-caps tracking-wide">
            Salvar nova senha
          </AtomsButton>

          <hr class="dashed-rule" />

          <NuxtLink to="/auth/login" class="font-editorial-body text-[13px] italic transition hover:opacity-70" :style="{ color: brand.colors.text }">
            Voltar ao portal <span :style="{ color: brand.colors.primary }">→</span>
          </NuxtLink>
        </UForm>

        <div
          v-else
          class="flex w-full flex-col gap-4 border px-10 py-12 md:col-span-6"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
        >
          <span class="font-small-caps text-[10px]" :style="{ color: completed ? brand.colors.positive : brand.colors.negative }">
            {{ completed ? 'Senha atualizada' : 'Link inválido' }}
          </span>
          <p class="font-editorial-body text-base italic" :style="{ color: brand.colors.text }">
            {{ completed ? 'Estamos te levando ao portal em instantes...' : 'Este endereço só funciona quando aberto pelo e-mail enviado após uma solicitação.' }}
          </p>
          <NuxtLink :to="completed ? '/auth/login' : '/auth/forgot-password'" class="font-editorial-body text-[13px] italic transition hover:opacity-70" :style="{ color: brand.colors.primary }">
            {{ completed ? 'Ir ao portal' : 'Solicitar novo link' }} →
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ========== MENTOR VARIANT ========== -->
    <section
      v-else-if="variant === 'mentor'"
      class="min-h-screen"
      :style="{ backgroundColor: brand.colors.background }"
    >
      <div
        class="flex items-center gap-4 px-6 py-3 md:px-10"
        :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }"
      >
        <span class="font-mentor-eyebrow">MANUAL DO PRIMO · NOVA SENHA</span>
        <span class="flex-1 border-t" :style="{ borderColor: `${brand.colors.background}40` }" />
        <span class="font-mentor-eyebrow">SENHA · CAPÍTULO 03</span>
      </div>

      <div class="mx-auto grid max-w-5xl gap-14 px-6 pb-20 pt-16 md:grid-cols-12 md:gap-16 md:px-10 md:pt-20">
        <div class="md:col-span-6">
          <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">
            DEFINIR UMA NOVA
          </span>
          <h1
            class="font-mentor-display mt-5"
            :style="{ color: brand.colors.text, fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)', lineHeight: '0.95' }"
          >
            Sua nova<br />
            <span class="italic" :style="{ color: brand.colors.primary }">disciplina.</span>
          </h1>
          <p class="mt-8 max-w-md text-base leading-relaxed" :style="{ color: `${brand.colors.text}CC` }">
            Mínimo 8 caracteres. Anota num lugar seguro — método é construir hábito, e hábito começa por não esquecer.
          </p>

          <div
            class="mt-12 border-l-4 pl-6"
            :style="{ borderColor: brand.colors.primary }"
          >
            <p class="font-mentor-display text-lg italic" :style="{ color: brand.colors.text }">
              "Disciplina é fazer hoje o que amanhã agradece."
            </p>
            <p class="font-mentor-eyebrow mt-3" :style="{ color: brand.colors.primary }">
              , {{ brand.founder?.name || 'Thiago Nigro' }}
            </p>
          </div>
        </div>

        <UForm
          v-if="tokenOK && !completed"
          :schema="schema"
          :state="state"
          class="flex w-full flex-col gap-5 border-2 p-8 md:col-span-6"
          :style="{ borderColor: brand.colors.text, backgroundColor: brand.colors.surface }"
          @submit="onSubmit"
        >
          <div class="border-b-2 pb-4" :style="{ borderColor: brand.colors.text }">
            <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">REDEFINIR PARA</span>
            <h2 class="font-mentor-display mt-1 truncate text-2xl" :style="{ color: brand.colors.text }">
              {{ email }}
            </h2>
          </div>

          <UFormField name="password">
            <template #label>
              <span class="font-mentor-eyebrow" :style="{ color: brand.colors.text }">Nova senha</span>
            </template>
            <AtomsFormInputPassword v-model="state.password" class="w-full" />
          </UFormField>

          <UFormField name="password_confirmation">
            <template #label>
              <span class="font-mentor-eyebrow" :style="{ color: brand.colors.text }">Confirmar</span>
            </template>
            <AtomsFormInputPassword v-model="state.password_confirmation" class="w-full" />
          </UFormField>

          <AtomsButton type="submit" color="secondary" size="lg" :loading="submitting" :disabled="submitting" class="mt-2 w-full justify-center font-mentor-eyebrow">
            SALVAR E ENTRAR →
          </AtomsButton>

          <NuxtLink to="/auth/login" class="font-mentor-eyebrow border-t-2 pt-4 transition hover:opacity-80" :style="{ borderColor: brand.colors.text, color: brand.colors.primary }">
            ← VOLTAR PRO LOGIN
          </NuxtLink>
        </UForm>

        <div
          v-else
          class="flex w-full flex-col gap-5 border-2 p-8 md:col-span-6"
          :style="{ borderColor: brand.colors.text, backgroundColor: brand.colors.surface }"
        >
          <div class="border-b-2 pb-4" :style="{ borderColor: brand.colors.text }">
            <span class="font-mentor-eyebrow" :style="{ color: completed ? brand.colors.positive : brand.colors.negative }">
              {{ completed ? 'SENHA REDEFINIDA ✓' : 'LINK INVÁLIDO ✗' }}
            </span>
          </div>
          <p class="text-[14px]" :style="{ color: brand.colors.text }">
            {{ completed ? 'Próximo passo: entrar com a nova senha. Te levando lá agora...' : 'Esse caminho só funciona quando aberto pelo e-mail. Solicita um novo.' }}
          </p>
          <NuxtLink :to="completed ? '/auth/login' : '/auth/forgot-password'" class="font-mentor-eyebrow transition hover:opacity-80" :style="{ color: brand.colors.primary }">
            {{ completed ? 'IR PRO LOGIN' : 'SOLICITAR NOVO LINK' }} →
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ========== RESEARCH VARIANT ========== -->
    <section
      v-else-if="variant === 'research'"
      class="min-h-screen px-4 pb-16 pt-12"
      :style="{ backgroundColor: brand.colors.background }"
    >
      <div class="mx-auto flex max-w-5xl flex-col gap-10">
        <div class="flex items-start justify-between border-b pb-6" :style="{ borderColor: brand.colors.border }">
          <div class="flex flex-col gap-0.5">
            <span class="font-academic-label" :style="{ color: brand.colors.primary }">
              AUVP RESEARCH · NOVA SENHA
            </span>
            <span class="font-academic-body text-[12px] italic" :style="{ color: brand.colors.textMuted }">
              Reposição de credencial · etapa final
            </span>
          </div>
          <span class="font-academic-mono text-[11px] uppercase tabular-nums" :style="{ color: brand.colors.textMuted }">
            {{ new Date().getFullYear() }}
          </span>
        </div>

        <div class="grid gap-14 md:grid-cols-12 md:gap-16">
          <div class="md:col-span-6">
            <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">
              § · nova senha
            </span>
            <h1
              class="font-academic-display mt-4"
              :style="{ color: brand.colors.text, fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: '1' }"
            >
              Repor a<br />
              <span class="italic" :style="{ color: brand.colors.primary }">senha do estudo.</span>
            </h1>
            <hr class="dashed-rule mt-8 max-w-[8rem]" />
            <p class="font-academic-body mt-6 max-w-md text-[14px] italic" :style="{ color: brand.colors.textMuted }">
              <span class="red-pen">Anota aí</span>: senha forte é como tese de tese — clara, única e revisada periodicamente.
            </p>
          </div>

          <UForm
            v-if="tokenOK && !completed"
            :schema="schema"
            :state="state"
            class="flex w-full flex-col gap-5 border p-8 md:col-span-6"
            :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
            @submit="onSubmit"
          >
            <div class="flex items-start justify-between border-b pb-4" :style="{ borderColor: brand.colors.border }">
              <span class="font-academic-label" :style="{ color: brand.colors.primary }">§2 · cadastrar nova</span>
              <span class="font-academic-mono text-[10px] tabular-nums truncate max-w-[180px]" :style="{ color: brand.colors.textMuted }">
                {{ email }}
              </span>
            </div>

            <UFormField name="password">
              <template #label>
                <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">Nova senha</span>
              </template>
              <AtomsFormInputPassword v-model="state.password" class="w-full" />
            </UFormField>

            <UFormField name="password_confirmation">
              <template #label>
                <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">Confirmar senha</span>
              </template>
              <AtomsFormInputPassword v-model="state.password_confirmation" class="w-full" />
            </UFormField>

            <AtomsButton type="submit" color="secondary" size="lg" :loading="submitting" :disabled="submitting" class="mt-2 w-full justify-center font-academic-label">
              REDEFINIR E VOLTAR →
            </AtomsButton>

            <hr class="dashed-rule" />

            <NuxtLink to="/auth/login" class="font-academic-body text-[13px] italic transition hover:opacity-70" :style="{ color: brand.colors.text }">
              ← Voltar para o terminal
            </NuxtLink>
          </UForm>

          <div
            v-else
            class="flex w-full flex-col gap-4 border p-8 md:col-span-6"
            :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
          >
            <span class="font-academic-label" :style="{ color: completed ? brand.colors.positive : brand.colors.negative }">
              {{ completed ? '✓ senha redefinida' : '✗ link inválido' }}
            </span>
            <p class="font-academic-body text-[13px] italic" :style="{ color: brand.colors.text }">
              {{ completed ? 'Encaminhando ao terminal de estudo...' : 'Solicite um novo link de redefinição para reabrir o caminho.' }}
            </p>
            <NuxtLink :to="completed ? '/auth/login' : '/auth/forgot-password'" class="font-academic-body text-[13px] italic transition hover:opacity-70" :style="{ color: brand.colors.primary }">
              {{ completed ? 'Acessar terminal' : 'Solicitar novo link' }} →
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== SHOWTIME VARIANT ========== -->
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
          <span class="lower-third">SENHA NOVA · QUASE LÁ</span>
          <h1
            class="font-showtime-display chunky-shadow mt-6"
            :style="{ color: brand.colors.text, fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)' }"
          >
            Bora criar<br />
            <span class="highlighter" :style="{ color: brand.colors.primary }">uma nova!</span>
          </h1>
          <p class="font-showtime-body mt-8 max-w-md text-base" :style="{ color: `${brand.colors.text}CC` }">
            Mínimo 8 caracteres, e dessa vez anota em algum lugar, criatura. A Na_th IA tá esperando.
          </p>

          <div class="mt-8 flex items-start gap-3">
            <img src="/brand/mepoupe/margarete.svg" alt="Margarete" class="h-12 shrink-0" />
            <p class="font-showtime-body max-w-xs text-sm italic" :style="{ color: `${brand.colors.text}B3` }">
              "Senha boa é tipo poupança rendendo, criatura: cresce devagar mas tem que ser segura!"
            </p>
          </div>
        </div>

        <UForm
          v-if="tokenOK && !completed"
          :schema="schema"
          :state="state"
          class="showtime-frame showtime-frame--tilt-right relative flex w-full max-w-md flex-col gap-5 rounded-[28px] p-8"
          :style="{ backgroundColor: brand.colors.surface }"
          @submit="onSubmit"
        >
          <div class="washi-tape" />
          <div class="text-center">
            <span class="font-showtime-label" :style="{ color: brand.colors.primary }">
              REDEFINIR PARA
            </span>
            <h2 class="font-showtime-display mt-2 truncate" :style="{ color: brand.colors.text, fontSize: '1.25rem' }">
              {{ email }}
            </h2>
          </div>

          <UFormField name="password">
            <template #label>
              <span class="font-showtime-label" :style="{ color: `${brand.colors.text}80` }">NOVA SENHA</span>
            </template>
            <AtomsFormInputPassword v-model="state.password" class="w-full" />
          </UFormField>

          <UFormField name="password_confirmation">
            <template #label>
              <span class="font-showtime-label" :style="{ color: `${brand.colors.text}80` }">CONFIRMAR</span>
            </template>
            <AtomsFormInputPassword v-model="state.password_confirmation" class="w-full" />
          </UFormField>

          <AtomsButton type="submit" color="secondary" size="lg" :loading="submitting" :disabled="submitting" class="mt-3 w-full justify-center font-showtime-label">
            BORA SALVAR! →
          </AtomsButton>

          <NuxtLink to="/auth/login" class="text-center font-showtime-label underline underline-offset-4 transition hover:opacity-70" :style="{ color: brand.colors.primary }">
            ← VOLTAR PRO LOGIN
          </NuxtLink>
        </UForm>

        <div
          v-else
          class="showtime-frame relative flex w-full max-w-md flex-col items-center gap-4 rounded-[28px] p-8 text-center"
          :style="{ backgroundColor: brand.colors.surface }"
        >
          <div class="washi-tape" />
          <span class="font-showtime-label" :style="{ color: completed ? brand.colors.positive : brand.colors.negative }">
            {{ completed ? '✨ SENHA NOVA SALVA' : '⚠️ LINK NÃO VALIDOU' }}
          </span>
          <p class="font-showtime-body text-sm" :style="{ color: brand.colors.text }">
            {{ completed ? 'Bora entrar agora! Te levando pro login...' : 'Manda novo link no e-mail e tenta de novo, criatura.' }}
          </p>
          <NuxtLink :to="completed ? '/auth/login' : '/auth/forgot-password'" class="font-showtime-label underline underline-offset-4 transition hover:opacity-70" :style="{ color: brand.colors.primary }">
            {{ completed ? 'IR PRO LOGIN' : 'PEDIR NOVO LINK' }} →
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ========== PLAYBOOK VARIANT ========== -->
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
          :style="{
            backgroundImage: `radial-gradient(${brand.colors.text} 1px, transparent 1px)`,
            backgroundSize: '36px 36px',
          }"
        />
      </div>

      <div class="relative mx-auto flex max-w-6xl flex-col items-center gap-12 md:flex-row md:items-center md:gap-16 md:py-12">
        <div class="flex flex-1 flex-col items-start text-left">
          <div
            class="mb-7 inline-flex items-center gap-2.5 rounded-full px-5 py-2"
            :style="{
              backgroundColor: brand.colors.primary,
              color: brand.colors.background,
              boxShadow: `0 8px 30px -8px ${brand.colors.primary}80, 0 0 0 3px ${brand.colors.background}, 0 0 0 5px ${brand.colors.primary}40`,
            }"
          >
            <span class="text-[11px] font-bold uppercase tracking-[0.15em]">DEFINIR NOVA SENHA</span>
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
            Senha nova,<br />
            <span :style="{ color: brand.colors.primary }">cabeça fria.</span>
          </h1>

          <p class="mt-6 max-w-md text-[16px] leading-relaxed" :style="{ color: `${brand.colors.text}C0` }">
            Após salvar, suas sessões abertas vão ser encerradas e você precisará entrar de novo. Sem hype, sem ansiedade.
          </p>
        </div>

        <UForm
          v-if="tokenOK && !completed"
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
              , Conta
            </span>
            <h2
              class="truncate leading-tight"
              :style="{
                color: brand.colors.text,
                fontFamily: `'Fredoka', sans-serif`,
                fontSize: '1.5rem',
                fontWeight: 700,
              }"
            >
              {{ email }}
            </h2>
          </div>

          <UFormField name="password">
            <AtomsFormInputPassword v-model="state.password" class="w-full" />
          </UFormField>

          <UFormField name="password_confirmation">
            <AtomsFormInputPassword v-model="state.password_confirmation" class="w-full" />
          </UFormField>

          <button
            type="submit"
            :disabled="submitting"
            class="group mt-3 inline-flex w-full items-center justify-center gap-3 rounded-full px-6 py-4 text-[13px] font-bold transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            :style="{
              backgroundColor: brand.colors.primary,
              color: brand.colors.background,
              boxShadow: `0 16px 50px -16px ${brand.colors.primary}A0`,
            }"
          >
            <UIcon name="i-lucide-key-round" class="size-4" />
            Salvar nova senha
            <span class="transition-transform group-hover:translate-x-1">→</span>
          </button>

          <NuxtLink to="/auth/login" class="pt-2 text-center text-[12px] font-bold underline-offset-4 transition hover:opacity-70" :style="{ color: brand.colors.primary }">
            <span class="underline">← Voltar para o login</span>
          </NuxtLink>
        </UForm>

        <div
          v-else
          class="relative flex w-full max-w-md flex-col gap-4 rounded-3xl border p-8 md:p-10"
          :style="{
            borderColor: brand.colors.border,
            backgroundColor: brand.colors.surface,
            boxShadow: `0 30px 80px -30px ${brand.colors.primary}30`,
          }"
        >
          <UIcon :name="completed ? 'i-lucide-circle-check-big' : 'i-lucide-link-2-off'" class="size-8" :style="{ color: completed ? brand.colors.positive : brand.colors.negative }" />
          <h3 class="text-lg font-bold" style="font-family: 'Fredoka', sans-serif;" :style="{ color: brand.colors.text }">
            {{ completed ? 'Senha redefinida' : 'Link inválido ou expirado' }}
          </h3>
          <p class="text-sm leading-relaxed" :style="{ color: `${brand.colors.text}C0` }">
            {{ completed ? 'Te levando ao login com a nova senha em instantes.' : 'O link só funciona quando aberto direto pelo e-mail. Solicite um novo.' }}
          </p>
          <NuxtLink :to="completed ? '/auth/login' : '/auth/forgot-password'" class="text-[13px] font-bold underline underline-offset-4" :style="{ color: brand.colors.primary }">
            {{ completed ? 'Ir ao login' : 'Solicitar novo link' }} →
          </NuxtLink>
        </div>
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
          <div class="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.18em]" style="font-family: 'JetBrains Mono', monospace;">
            <span :style="{ color: brand.colors.primary }">Hold</span>
            <span :style="{ color: brand.colors.textMuted }">NOVA SENHA · {{ brand.founder.name.toUpperCase() }}</span>
          </div>
          <span class="font-mono text-[10px] uppercase tracking-[0.18em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.textMuted }">
            02 / 02
          </span>
        </div>
      </div>

      <div class="mx-auto grid max-w-7xl grid-cols-12 items-stretch gap-0 px-6 py-12 md:px-10 md:py-16 lg:py-20">
        <div class="col-span-12 flex flex-col justify-center border-b pb-10 lg:col-span-7 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-10" :style="{ borderColor: brand.colors.border }">
          <div class="mb-6 text-[10px] font-bold uppercase tracking-[0.22em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.primary }">
            02 · Definir nova
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
            Nova senha.<br />
            <span class="italic" :style="{ color: brand.colors.primary, fontWeight: 500 }">Mesmo princípio.</span>
          </h1>
          <p
            class="max-w-xl text-[18px] leading-[1.65]"
            :style="{
              color: `${brand.colors.text}C0`,
              fontFamily: `'Spectral', 'Georgia', serif`,
            }"
          >
            Ao confirmar, todas as sessões em outros dispositivos são encerradas. Continue holdando, agora com credencial nova.
          </p>
        </div>

        <div class="col-span-12 flex items-start lg:col-span-5">
          <UForm
            v-if="tokenOK && !completed"
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
                Conta
              </span>
              <p class="mt-1 truncate text-[13px]" :style="{ color: brand.colors.text }">{{ email }}</p>
            </div>

            <UFormField name="password">
              <template #label>
                <span class="text-[10px] font-bold uppercase tracking-[0.18em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.textMuted }">
                  Nova senha
                </span>
              </template>
              <AtomsFormInputPassword v-model="state.password" class="w-full" />
            </UFormField>

            <UFormField name="password_confirmation">
              <template #label>
                <span class="text-[10px] font-bold uppercase tracking-[0.18em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.textMuted }">
                  Confirmar
                </span>
              </template>
              <AtomsFormInputPassword v-model="state.password_confirmation" class="w-full" />
            </UFormField>

            <button
              type="submit"
              :disabled="submitting"
              class="mt-4 inline-flex w-full items-center justify-center gap-3 px-6 py-4 text-[12px] font-bold uppercase tracking-[0.18em] transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
              :style="{
                backgroundColor: brand.colors.primary,
                color: brand.colors.text,
              }"
            >
              <UIcon name="i-lucide-key-round" class="size-4" />
              Salvar
              <span>→</span>
            </button>

            <NuxtLink
              to="/auth/login"
              class="mt-2 border-t pt-5 text-[11px] font-bold uppercase tracking-[0.18em]"
              style="font-family: 'JetBrains Mono', monospace;"
              :style="{ borderColor: brand.colors.border, color: brand.colors.primary }"
            >
              ← Voltar para o login
            </NuxtLink>
          </UForm>

          <div
            v-else
            class="flex w-full flex-col gap-4 border p-7"
            :style="{
              borderColor: brand.colors.border,
              backgroundColor: brand.colors.surface,
            }"
          >
            <span class="text-[10px] font-bold uppercase tracking-[0.22em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: completed ? brand.colors.positive : brand.colors.negative }">
              {{ completed ? '✓ Senha salva' : '✗ Link inválido' }}
            </span>
            <p class="text-[15px] leading-relaxed" style="font-family: 'Spectral', serif;" :style="{ color: brand.colors.text }">
              {{ completed ? 'Estamos te levando ao login agora.' : 'Esse link só funciona quando aberto direto do e-mail. Solicite um novo.' }}
            </p>
            <NuxtLink :to="completed ? '/auth/login' : '/auth/forgot-password'" class="text-[11px] font-bold uppercase tracking-[0.18em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.primary }">
              {{ completed ? 'Ir ao login' : 'Solicitar novo link' }} →
            </NuxtLink>
          </div>
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
            Defina uma nova senha com pelo menos 8 caracteres. Após salvar, todas as sessões abertas serão encerradas.
          </p>
        </div>

        <UForm
          v-if="tokenOK && !completed"
          :schema="schema"
          :state="state"
          class="flex w-full max-w-md flex-col gap-5 rounded-[32px] border px-8 py-10 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.5)] backdrop-blur-2xl"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
          @submit="onSubmit"
        >
          <div class="space-y-2 text-center md:text-left">
            <span class="text-xs font-medium uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
              Nova senha para
            </span>
            <h1 class="truncate text-xl font-semibold" :style="{ color: brand.colors.text }">
              {{ email }}
            </h1>
          </div>

          <UFormField name="password">
            <AtomsFormInputPassword v-model="state.password" class="w-full" />
          </UFormField>

          <UFormField name="password_confirmation">
            <AtomsFormInputPassword v-model="state.password_confirmation" class="w-full" />
          </UFormField>

          <button
            type="submit"
            :disabled="submitting"
            class="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 text-[15px] font-semibold transition-[filter,box-shadow] duration-200 disabled:cursor-not-allowed disabled:opacity-60"
            :style="{ backgroundColor: 'var(--brand-primary)', color: '#fff' }"
            @mouseenter="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.94)'"
            @mouseleave="($event.currentTarget as HTMLElement).style.filter = 'brightness(1)'"
          >
            <UIcon v-if="submitting" name="i-lucide-loader-2" class="size-4 animate-spin" aria-hidden="true" />
            <span>Salvar nova senha</span>
          </button>

          <NuxtLink to="/auth/login" class="text-center text-sm font-medium transition hover:opacity-80" :style="{ color: brand.colors.primary }">
            ← Voltar para o login
          </NuxtLink>
        </UForm>

        <div
          v-else
          class="flex w-full max-w-md flex-col gap-4 rounded-[32px] border px-8 py-10"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
        >
          <UIcon :name="completed ? 'i-lucide-circle-check-big' : 'i-lucide-link-2-off'" class="size-8" :style="{ color: completed ? brand.colors.positive : brand.colors.negative }" />
          <h2 class="text-lg font-semibold" :style="{ color: brand.colors.text }">
            {{ completed ? 'Senha redefinida' : 'Link inválido ou expirado' }}
          </h2>
          <p class="text-sm leading-relaxed" :style="{ color: brand.colors.textMuted }">
            {{ completed ? 'Estamos te levando para o login em instantes...' : 'Este link só funciona quando aberto pelo e-mail. Solicite um novo abaixo.' }}
          </p>
          <NuxtLink :to="completed ? '/auth/login' : '/auth/forgot-password'" class="text-sm font-medium transition hover:opacity-80" :style="{ color: brand.colors.primary }">
            {{ completed ? 'Ir ao login' : 'Solicitar novo link' }} →
          </NuxtLink>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const brand = useBrand()
const route = useRoute()
const router = useRouter()
const { resetPassword } = useAuthService()

const variant = computed(() => brand.hero?.variant || 'default')

// Token + email arrive via the URL the email-link points at
// (`/auth/reset-password?token=…&email=…`). They're untrusted input
// — we only forward to the backend, which validates them against
// `password_reset_tokens` before flipping the password.
const token = computed(() => {
  const v = route.query.token
  return typeof v === 'string' ? v : ''
})
const email = computed(() => {
  const v = route.query.email
  return typeof v === 'string' ? v : ''
})
const tokenOK = computed(() => !!token.value && !!email.value)

const schema = z
  .object({
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    password_confirmation: z.string().min(8, 'Mínimo 8 caracteres'),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'As senhas não coincidem',
    path: ['password_confirmation'],
  })
type Schema = z.infer<typeof schema>

const state = reactive({
  password: '',
  password_confirmation: '',
})
const submitting = ref(false)
const completed = ref(false)

async function onSubmit(_: FormSubmitEvent<Schema>) {
  if (submitting.value) return
  submitting.value = true
  try {
    const resp = await resetPassword({
      token: token.value,
      email: email.value,
      password: state.password,
      password_confirmation: state.password_confirmation,
    })
    completed.value = true
    showSuccessNotification('Senha atualizada', resp.message)
    // Beat to let the success state paint before swap.
    setTimeout(() => router.push('/auth/login'), 1800)
  } catch (e) {
    const message =
      (e as { data?: { message?: string } })?.data?.message
        ?? (e instanceof Error ? e.message : 'Não foi possível redefinir agora. Tente novamente.')
    showErrorNotification('Falha ao redefinir', message)
  } finally {
    submitting.value = false
  }
}

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title: `Redefinir senha | ${brand.name}`,
  description: `Defina uma nova senha para sua conta na ${brand.name}.`,
  path: '/auth/reset-password',
  robots: 'noindex,nofollow',
})
</script>
