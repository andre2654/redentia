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
            Recuperar <span class="italic" :style="{ color: brand.colors.primary }">acesso.</span>
          </h1>

          <p class="max-w-md text-sm font-mono-tab" :style="{ color: brand.colors.textMuted }">
            Enviamos um link para o e-mail cadastrado. Em até 60 minutos, você define uma nova senha.
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
                <span class="ml-2">{{ brand.name.toUpperCase() }}.RECOVER</span>
              </div>
              <span class="hidden sm:inline">~/auth/forgot</span>
            </div>
            <div class="px-5 py-4 font-mono-tab text-xs" :style="{ color: brand.colors.textMuted }">
              <div><span :style="{ color: brand.colors.primary }">&gt;</span> dispatching reset token...</div>
              <div><span :style="{ color: brand.colors.positive }">✓</span> mailer ready</div>
              <div><span :style="{ color: brand.colors.primary }">&gt;</span> waiting for email_</div>
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
            <span class="font-mono-tab text-[10px]" :style="{ color: brand.colors.textMuted }">RECOVER · TLS</span>
          </div>

          <UFormField name="email">
            <template #label>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">&gt; EMAIL</span>
            </template>
            <AtomsFormInput v-model="state.email" type="email" autocomplete="email" spellcheck="false" placeholder="seu@email.com" size="lg" class="w-full" :disabled="sent" />
          </UFormField>

          <AtomsButton type="submit" color="secondary" size="lg" :loading="submitting" :disabled="submitting || sent" class="mt-2 w-full justify-center font-mono-tab text-xs tracking-[0.15em]">
            {{ sent ? 'LINK ENVIADO' : 'ENVIAR LINK' }}
          </AtomsButton>

          <div v-if="sent" class="rounded-sm border p-3 font-mono-tab text-[11px]" :style="{ borderColor: `${brand.colors.positive}66`, color: brand.colors.text, backgroundColor: `${brand.colors.positive}10` }">
            <div :style="{ color: brand.colors.positive }">✓ link dispatched</div>
            <div class="mt-1" :style="{ color: brand.colors.textMuted }">Verifique sua caixa de entrada e a pasta de spam.</div>
          </div>

          <div class="flex items-center justify-between border-t pt-4" :style="{ borderColor: brand.colors.border }">
            <NuxtLink to="/auth/login" class="font-mono-tab text-[10px] uppercase tracking-[0.15em] transition hover:opacity-80" :style="{ color: brand.colors.primary }">
              &gt; BACK_TO_LOGIN
            </NuxtLink>
            <NuxtLink to="/auth/register" class="font-mono-tab text-[10px] uppercase tracking-[0.15em] transition hover:opacity-80" :style="{ color: brand.colors.textMuted }">
              &gt; REGISTER_NEW
            </NuxtLink>
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
            {{ brand.name }} &nbsp;·&nbsp; Recuperação de acesso
          </span>
          <h1
            class="font-editorial-display mt-4"
            :style="{ color: brand.colors.text, fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: '1.05' }"
          >
            Esqueceu a<br />
            <span class="italic" :style="{ color: brand.colors.primary }">credencial?</span>
          </h1>
          <hr class="dashed-rule mt-8 max-w-[6rem]" />
          <p class="font-editorial-body mt-8 max-w-md text-base italic" :style="{ color: brand.colors.textMuted }">
            Estimado investidor, a tranquilidade do seu acesso é prioridade. Informe o e-mail do cadastro e enviaremos um caminho para retomar sua sessão.
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
            <span class="font-small-caps text-[10px]" :style="{ color: brand.colors.textMuted }">Recuperação</span>
            <h2 class="font-editorial-display mt-2 text-2xl" :style="{ color: brand.colors.text }">
              Solicitar novo acesso
            </h2>
          </div>

          <UFormField name="email">
            <template #label>
              <span class="font-small-caps text-[10px]" :style="{ color: brand.colors.textMuted }">E-mail</span>
            </template>
            <AtomsFormInput v-model="state.email" type="email" autocomplete="email" spellcheck="false" placeholder="seu@email.com" size="lg" class="w-full" :disabled="sent" />
          </UFormField>

          <AtomsButton type="submit" color="secondary" size="lg" :loading="submitting" :disabled="submitting || sent" class="mt-2 w-full justify-center font-small-caps tracking-wide">
            {{ sent ? 'Carta enviada' : 'Enviar carta de acesso' }}
          </AtomsButton>

          <div v-if="sent" class="border p-4 font-editorial-body text-[12px] italic" :style="{ borderColor: `${brand.colors.positive}66`, color: brand.colors.text, backgroundColor: `${brand.colors.positive}10` }">
            Sua correspondência seguiu. Verifique a caixa de entrada — o link expira em 60 minutos.
          </div>

          <hr class="dashed-rule" />

          <div class="flex flex-col gap-2">
            <NuxtLink to="/auth/login" class="font-editorial-body text-[13px] italic transition hover:opacity-70" :style="{ color: brand.colors.text }">
              Voltar ao portal <span :style="{ color: brand.colors.primary }">→</span>
            </NuxtLink>
            <NuxtLink to="/auth/register" class="font-editorial-body text-[13px] italic transition hover:opacity-70" :style="{ color: brand.colors.textMuted }">
              Abrir uma nova conta <span :style="{ color: brand.colors.primary }">→</span>
            </NuxtLink>
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
        <span class="font-mentor-eyebrow">MANUAL DO PRIMO · RECUPERAÇÃO</span>
        <span class="flex-1 border-t" :style="{ borderColor: `${brand.colors.background}40` }" />
        <span class="font-mentor-eyebrow">SENHA · CAPÍTULO 02</span>
      </div>

      <div class="mx-auto grid max-w-5xl gap-14 px-6 pb-20 pt-16 md:grid-cols-12 md:gap-16 md:px-10 md:pt-20">
        <div class="md:col-span-6">
          <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">
            UM TROPEÇO ACONTECE
          </span>
          <h1
            class="font-mentor-display mt-5"
            :style="{ color: brand.colors.text, fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)', lineHeight: '0.95' }"
          >
            Esqueceu<br />
            <span class="italic" :style="{ color: brand.colors.primary }">a senha?</span>
          </h1>
          <p class="mt-8 max-w-md text-base leading-relaxed" :style="{ color: `${brand.colors.text}CC` }">
            Acontece. Diga seu e-mail, eu mando um caminho para você criar uma nova e voltar pra disciplina de hoje.
          </p>

          <div
            class="mt-12 border-l-4 pl-6"
            :style="{ borderColor: brand.colors.primary }"
          >
            <p class="font-mentor-display text-lg italic" :style="{ color: brand.colors.text }">
              "Tropeçar não é fracassar. Fracassar é não voltar."
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
            <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">RECUPERAR ACESSO</span>
            <h2 class="font-mentor-display mt-1 text-3xl" :style="{ color: brand.colors.text }">
              Mande o link
            </h2>
          </div>

          <UFormField name="email">
            <template #label>
              <span class="font-mentor-eyebrow" :style="{ color: brand.colors.text }">E-mail</span>
            </template>
            <AtomsFormInput v-model="state.email" type="email" autocomplete="email" spellcheck="false" placeholder="seu@email.com" size="lg" class="w-full" :disabled="sent" />
          </UFormField>

          <AtomsButton type="submit" color="secondary" size="lg" :loading="submitting" :disabled="submitting || sent" class="mt-2 w-full justify-center font-mentor-eyebrow">
            {{ sent ? 'LINK ENVIADO ✓' : 'ENVIAR LINK →' }}
          </AtomsButton>

          <div v-if="sent" class="border-2 p-3 text-[12px]" :style="{ borderColor: brand.colors.primary, color: brand.colors.text }">
            <strong class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">PRÓXIMO PASSO →</strong>
            <p class="mt-1">Confira o e-mail. Link expira em 60 minutos.</p>
          </div>

          <div class="flex flex-col gap-2 border-t-2 pt-4" :style="{ borderColor: brand.colors.text }">
            <NuxtLink to="/auth/login" class="font-mentor-eyebrow transition hover:opacity-80" :style="{ color: brand.colors.primary }">
              ← VOLTAR PRO LOGIN
            </NuxtLink>
            <NuxtLink to="/auth/register" class="font-mentor-eyebrow transition hover:opacity-80" :style="{ color: `${brand.colors.text}99` }">
              AINDA NÃO É LEITOR? COMECE AQUI →
            </NuxtLink>
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
              AUVP RESEARCH · RECUPERAÇÃO
            </span>
            <span class="font-academic-body text-[12px] italic" :style="{ color: brand.colors.textMuted }">
              Reposição de credencial · sessão protegida
            </span>
          </div>
          <span class="font-academic-mono text-[11px] uppercase tabular-nums" :style="{ color: brand.colors.textMuted }">
            {{ new Date().getFullYear() }}
          </span>
        </div>

        <div class="grid gap-14 md:grid-cols-12 md:gap-16">
          <div class="md:col-span-6">
            <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">
              § · recuperação
            </span>
            <h1
              class="font-academic-display mt-4"
              :style="{ color: brand.colors.text, fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: '1' }"
            >
              Repor a<br />
              <span class="italic" :style="{ color: brand.colors.primary }">credencial.</span>
            </h1>
            <hr class="dashed-rule mt-8 max-w-[8rem]" />
            <p class="font-academic-body mt-6 max-w-md text-[14px] italic" :style="{ color: brand.colors.textMuted }">
              <span class="red-pen">Nota do professor</span>, esquecer a senha não anula o método. Informe o e-mail do cadastro e enviaremos um endereço para criar uma nova.
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
              <span class="font-academic-label" :style="{ color: brand.colors.primary }">§1 · solicitação</span>
              <span class="font-academic-mono text-[10px] tabular-nums" :style="{ color: brand.colors.textMuted }">
                {{ sessionTime }}
              </span>
            </div>

            <UFormField name="email">
              <template #label>
                <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">E-mail</span>
              </template>
              <AtomsFormInput v-model="state.email" type="email" autocomplete="email" spellcheck="false" placeholder="seu@email.com" size="lg" class="w-full" :disabled="sent" />
            </UFormField>

            <AtomsButton type="submit" color="secondary" size="lg" :loading="submitting" :disabled="submitting || sent" class="mt-2 w-full justify-center font-academic-label">
              {{ sent ? 'SOLICITAÇÃO REGISTRADA →' : 'SOLICITAR LINK →' }}
            </AtomsButton>

            <div v-if="sent" class="border p-3 font-academic-body text-[12px] italic" :style="{ borderColor: `${brand.colors.positive}66`, color: brand.colors.text, backgroundColor: `${brand.colors.positive}10` }">
              Verifique a caixa de entrada do e-mail informado. O link expira em 60 minutos.
            </div>

            <hr class="dashed-rule" />

            <div class="flex flex-col gap-2">
              <NuxtLink to="/auth/login" class="font-academic-body text-[13px] italic transition hover:opacity-70" :style="{ color: brand.colors.text }">
                Voltar para o terminal <span :style="{ color: brand.colors.primary }">→</span>
              </NuxtLink>
              <NuxtLink to="/auth/register" class="font-academic-body text-[13px] italic transition hover:opacity-70" :style="{ color: brand.colors.textMuted }">
                Solicitar acesso de aluno <span :style="{ color: brand.colors.primary }">→</span>
              </NuxtLink>
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
          <span class="lower-third">PAUSA · ESQUECEU A SENHA</span>
          <h1
            class="font-showtime-display chunky-shadow mt-6"
            :style="{ color: brand.colors.text, fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)' }"
          >
            Calma,<br />
            <span class="highlighter" :style="{ color: brand.colors.primary }">criatura!</span>
          </h1>
          <p class="font-showtime-body mt-8 max-w-md text-base" :style="{ color: `${brand.colors.text}CC` }">
            Esquecer senha é normal. Coloca aqui teu e-mail que eu mando o caminho pra criar uma nova, ó.
          </p>

          <div class="mt-8 flex items-start gap-3">
            <img src="/brand/mepoupe/margarete.svg" alt="Margarete" class="h-12 shrink-0" />
            <p class="font-showtime-body max-w-xs text-sm italic" :style="{ color: `${brand.colors.text}B3` }">
              "Sabe o que é pior que esquecer a senha? Nem ter conta pra esquecer. Bora!"
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
              RECUPERAR ACESSO
            </span>
            <h2 class="font-showtime-display mt-2" :style="{ color: brand.colors.text, fontSize: '1.75rem' }">
              Manda o link aí
            </h2>
          </div>

          <UFormField name="email">
            <template #label>
              <span class="font-showtime-label" :style="{ color: `${brand.colors.text}80` }">SEU E-MAIL</span>
            </template>
            <AtomsFormInput v-model="state.email" type="email" autocomplete="email" spellcheck="false" placeholder="seu@email.com" size="lg" class="w-full" :disabled="sent" />
          </UFormField>

          <AtomsButton type="submit" color="secondary" size="lg" :loading="submitting" :disabled="submitting || sent" class="mt-3 w-full justify-center font-showtime-label">
            {{ sent ? 'TÁ A CAMINHO!' : 'BORA! ENVIAR →' }}
          </AtomsButton>

          <div v-if="sent" class="rounded-2xl border-2 p-3 text-center font-showtime-body text-[12px]" :style="{ borderColor: brand.colors.primary, color: brand.colors.text }">
            ✨ <strong>Link enviado!</strong> Olha o teu e-mail.
          </div>

          <div class="flex flex-col items-center gap-2 text-center">
            <NuxtLink to="/auth/login" class="font-showtime-label underline underline-offset-4 transition hover:opacity-70" :style="{ color: brand.colors.primary }">
              ← VOLTAR PRO LOGIN
            </NuxtLink>
            <NuxtLink to="/auth/register" class="font-showtime-label underline underline-offset-4 transition hover:opacity-70" :style="{ color: `${brand.colors.text}90` }">
              ÉS NOVA POR AQUI? BORA CADASTRAR →
            </NuxtLink>
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
            <span class="relative flex size-1.5">
              <span class="absolute inline-flex size-1.5 motion-safe:animate-ping rounded-full opacity-75" :style="{ backgroundColor: brand.colors.background }" />
              <span class="relative inline-flex size-1.5 rounded-full" :style="{ backgroundColor: brand.colors.background }" />
            </span>
            <span class="text-[11px] font-bold uppercase tracking-[0.15em]">RECUPERAR ACESSO</span>
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
            Volta pro<br />
            <span :style="{ color: brand.colors.primary }">método.</span>
          </h1>

          <p class="mt-6 max-w-md text-[16px] leading-relaxed" :style="{ color: `${brand.colors.text}C0` }">
            Informe o e-mail do cadastro. Em até 60 minutos você cria uma nova senha e retoma o plano sem ansiedade.
          </p>
        </div>

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
              , Recuperação
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
              Solicitar novo acesso
            </h2>
          </div>

          <UFormField name="email">
            <AtomsFormInput v-model="state.email" type="email" autocomplete="email" spellcheck="false" placeholder="seu@email.com" size="lg" class="w-full" :disabled="sent" />
          </UFormField>

          <button
            type="submit"
            :disabled="submitting || sent"
            class="group mt-3 inline-flex w-full items-center justify-center gap-3 rounded-full px-6 py-4 text-[13px] font-bold transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            :style="{
              backgroundColor: brand.colors.primary,
              color: brand.colors.background,
              boxShadow: `0 16px 50px -16px ${brand.colors.primary}A0`,
            }"
          >
            <UIcon :name="sent ? 'i-lucide-mail-check' : 'i-lucide-mail'" class="size-4" />
            {{ sent ? 'Link enviado' : 'Enviar link de redefinição' }}
            <span v-if="!sent" class="transition-transform group-hover:translate-x-1">→</span>
          </button>

          <div v-if="sent" class="rounded-2xl border p-4" :style="{ borderColor: `${brand.colors.positive}66`, backgroundColor: `${brand.colors.positive}10` }">
            <div class="flex items-start gap-2">
              <UIcon name="i-lucide-mail-check" class="mt-0.5 size-4 shrink-0" :style="{ color: brand.colors.positive }" />
              <p class="text-[12px] leading-relaxed" :style="{ color: brand.colors.text }">
                <strong>Link enviado.</strong> Confira a caixa de entrada (e o spam). Expira em 60 min.
              </p>
            </div>
          </div>

          <div class="flex flex-col gap-2 pt-2 text-center">
            <NuxtLink to="/auth/login" class="text-[12px] font-bold underline-offset-4 transition hover:opacity-70" :style="{ color: brand.colors.primary }">
              <span class="underline">Voltar para o login</span>
            </NuxtLink>
            <NuxtLink to="/auth/register" class="text-[12px] font-medium underline-offset-4 transition hover:opacity-70" :style="{ color: brand.colors.textMuted }">
              <span class="underline">Não tem conta? Começar agora</span>
            </NuxtLink>
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
          <div class="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.18em]" style="font-family: 'JetBrains Mono', monospace;">
            <span :style="{ color: brand.colors.primary }">Hold</span>
            <span :style="{ color: brand.colors.textMuted }">RECUPERAÇÃO · {{ brand.founder.name.toUpperCase() }}</span>
          </div>
          <span class="font-mono text-[10px] uppercase tracking-[0.18em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.textMuted }">
            01 / 02
          </span>
        </div>
      </div>

      <div class="mx-auto grid max-w-7xl grid-cols-12 items-stretch gap-0 px-6 py-12 md:px-10 md:py-16 lg:py-20">
        <div class="col-span-12 flex flex-col justify-center border-b pb-10 lg:col-span-7 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-10" :style="{ borderColor: brand.colors.border }">
          <div class="mb-6 text-[10px] font-bold uppercase tracking-[0.22em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.primary }">
            01 · Recuperar
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
            Repor o acesso.<br />
            <span class="italic" :style="{ color: brand.colors.primary, fontWeight: 500 }">Continue holdando.</span>
          </h1>
          <p
            class="max-w-xl text-[18px] leading-[1.65]"
            :style="{
              color: `${brand.colors.text}C0`,
              fontFamily: `'Spectral', 'Georgia', serif`,
            }"
          >
            Enviaremos para seu e-mail um link com validade de 60 minutos para criar uma nova senha. Sem pressa, sem ruído.
          </p>
        </div>

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
                Solicitar link
              </span>
            </div>

            <UFormField name="email">
              <template #label>
                <span class="text-[10px] font-bold uppercase tracking-[0.18em]" style="font-family: 'JetBrains Mono', monospace;" :style="{ color: brand.colors.textMuted }">
                  E-mail
                </span>
              </template>
              <AtomsFormInput v-model="state.email" type="email" autocomplete="email" spellcheck="false" placeholder="seu@email.com" size="lg" class="w-full" :disabled="sent" />
            </UFormField>

            <button
              type="submit"
              :disabled="submitting || sent"
              class="mt-4 inline-flex w-full items-center justify-center gap-3 px-6 py-4 text-[12px] font-bold uppercase tracking-[0.18em] transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
              :style="{
                backgroundColor: brand.colors.primary,
                color: brand.colors.text,
              }"
            >
              <UIcon :name="sent ? 'i-lucide-mail-check' : 'i-lucide-mail'" class="size-4" />
              {{ sent ? 'Link enviado' : 'Enviar link' }}
              <span v-if="!sent">→</span>
            </button>

            <div v-if="sent" class="border p-3 text-[11px] leading-snug" style="font-family: 'Spectral', serif;" :style="{ borderColor: `${brand.colors.positive}66`, color: brand.colors.text, backgroundColor: `${brand.colors.positive}10` }">
              Link enviado para o e-mail informado. Confira a caixa de entrada e o spam.
            </div>

            <div class="mt-2 flex flex-col gap-3 border-t pt-5" :style="{ borderColor: brand.colors.border }">
              <NuxtLink
                to="/auth/login"
                class="text-[11px] font-bold uppercase tracking-[0.18em]"
                style="font-family: 'JetBrains Mono', monospace;"
                :style="{ color: brand.colors.primary }"
              >
                ← Voltar para o login
              </NuxtLink>
              <NuxtLink
                to="/auth/register"
                class="text-[11px] font-bold uppercase tracking-[0.18em]"
                style="font-family: 'JetBrains Mono', monospace;"
                :style="{ color: brand.colors.textMuted }"
              >
                Tornar-se holder →
              </NuxtLink>
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
            Esqueceu a senha? Sem stress. Informe o e-mail do cadastro e enviaremos um link para criar uma nova em até 60 minutos.
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
              Recuperação
            </span>
            <h1 class="text-2xl font-semibold" :style="{ color: brand.colors.text }">
              Esqueceu sua senha?
            </h1>
            <p class="text-sm" :style="{ color: brand.colors.textMuted }">
              Digite seu e-mail. Se ele estiver cadastrado, você receberá um link de redefinição.
            </p>
          </div>

          <UFormField name="email">
            <AtomsFormInput v-model="state.email" type="email" autocomplete="email" spellcheck="false" placeholder="seu@email.com" size="lg" class="w-full" :disabled="sent" />
          </UFormField>

          <AtomsButton type="submit" color="secondary" size="lg" :loading="submitting" :disabled="submitting || sent" class="mt-2 w-full justify-center">
            {{ sent ? 'Link enviado' : 'Enviar link de redefinição' }}
          </AtomsButton>

          <div v-if="sent" class="rounded-xl border p-3 text-[12px]" :style="{ borderColor: `${brand.colors.positive}66`, color: brand.colors.text, backgroundColor: `${brand.colors.positive}10` }">
            <strong :style="{ color: brand.colors.positive }">Link enviado.</strong>
            Confira a caixa de entrada e a pasta de spam. Expira em 60 minutos.
          </div>

          <div class="flex flex-col gap-2 text-center md:text-left">
            <NuxtLink to="/auth/login" class="text-sm font-medium transition hover:opacity-80" :style="{ color: brand.colors.primary }">
              ← Voltar para o login
            </NuxtLink>
            <NuxtLink to="/auth/register" class="text-sm font-medium transition hover:opacity-80" :style="{ color: brand.colors.textMuted }">
              Ainda não tem conta? Cadastre-se agora
            </NuxtLink>
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
const { forgotPassword } = useAuthService()

// Mirror the login page: hero variant doubles as the layout switch so
// every tenant gets a consistent look across login → register →
// forgot → reset. Adding a new tenant only means picking a variant.
const variant = computed(() => brand.hero?.variant || 'default')

const sessionTime = computed(() => {
  try {
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
})

const schema = z.object({
  email: z.string().email('Informe um e-mail válido'),
})
type Schema = z.infer<typeof schema>

const state = reactive({ email: '' })
const submitting = ref(false)
const sent = ref(false)

async function onSubmit(_: FormSubmitEvent<Schema>) {
  if (submitting.value) return
  submitting.value = true
  try {
    const resp = await forgotPassword({ email: state.email })
    sent.value = true
    showSuccessNotification('Link enviado', resp.message)
  } catch (e) {
    const message =
      (e as { data?: { message?: string } })?.data?.message
        ?? (e instanceof Error ? e.message : 'Não foi possível enviar agora. Tente novamente em instantes.')
    showErrorNotification('Falha ao enviar', message)
  } finally {
    submitting.value = false
  }
}

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title: `Recuperar senha | ${brand.name}`,
  description: `Solicite um link para redefinir a senha da sua conta na ${brand.name}.`,
  path: '/auth/forgot-password',
  robots: 'noindex,nofollow',
})
</script>
