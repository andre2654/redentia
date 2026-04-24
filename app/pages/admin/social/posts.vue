<template>
  <NuxtLayout name="admin-panel">
    <div class="mx-auto flex max-w-5xl flex-col gap-6">
      <header>
        <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
          Social · Posts
        </span>
        <h1 class="mt-2 text-[28px] leading-tight md:text-[36px]" :style="{ color: C.text, fontFamily: F.display }">
          Composer, contas e agendamento.
        </h1>
        <p class="mt-3 max-w-2xl text-[14px] leading-[1.6]" :style="{ color: C.textMuted }">
          A composição e agendamento de posts avulsos acontece dentro do Postiz,
          nosso motor de publicação self-hosted. Conecte suas contas do Instagram,
          Facebook, Threads e X uma vez, e depois agende daqui. As automações
          recorrentes (carrossel diário, auto-reply, etc) usam a API do Postiz por baixo.
        </p>
      </header>

      <!-- Integration steps -->
      <section class="grid gap-4 md:grid-cols-3">
        <div
          v-for="(step, idx) in steps"
          :key="idx"
          class="flex flex-col gap-3 rounded-sm border p-5"
          :style="{ borderColor: C.border, backgroundColor: C.surface }"
        >
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
            PASSO {{ String(idx + 1).padStart(2, '0') }}
          </span>
          <h3 class="text-[16px] font-semibold" :style="{ color: C.text }">{{ step.title }}</h3>
          <p class="text-[13px]" :style="{ color: C.textMuted }">{{ step.description }}</p>
        </div>
      </section>

      <!-- CTA primary -->
      <a
        :href="postizUrl"
        target="_blank"
        rel="noopener"
        class="group flex items-center justify-between gap-4 rounded-sm p-6 transition-opacity hover:opacity-90"
        :style="{ backgroundColor: C.primary, color: C.background }"
      >
        <div class="flex flex-col gap-1">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]">Abrir Postiz</span>
          <span class="text-[20px] font-semibold">postiz.saraivada.com</span>
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em] opacity-70">
            ABRE EM NOVA ABA · LOGIN SEPARADO NA PRIMEIRA VEZ
          </span>
        </div>
        <UIcon name="i-lucide-arrow-up-right" class="size-8 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
      </a>

      <!-- API key instructions -->
      <section class="rounded-sm border p-5" :style="{ borderColor: C.border, backgroundColor: C.surface }">
        <h2 class="mb-3 font-mono-tab text-[11px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
          Conectar automações
        </h2>
        <ol class="flex list-decimal flex-col gap-2 pl-5 text-[13px]" :style="{ color: C.textMuted }">
          <li>Entre no Postiz, conecte pelo menos uma conta social (Instagram / X / Threads / FB).</li>
          <li>Vá em Settings → API Keys e gere uma chave.</li>
          <li>
            No VPS, adicione ao <code :style="{ color: C.text }">.env</code> do Laravel:
            <pre class="mt-2 overflow-x-auto rounded-sm border px-3 py-2 font-mono-tab text-[11px]" :style="{ borderColor: C.border, backgroundColor: C.background, color: C.text }">POSTIZ_ENABLED=true
POSTIZ_API_URL=https://postiz.saraivada.com/api
POSTIZ_API_KEY=sua-chave-aqui</pre>
          </li>
          <li>Rode <code :style="{ color: C.text }">docker exec php-fpm-redentia php artisan config:cache</code>.</li>
          <li>
            Pronto. A partir daí, <NuxtLink to="/admin/social/automations" class="underline" :style="{ color: C.primary }">automações</NuxtLink>
            agendam de verdade via API do Postiz em vez de só logar.
          </li>
        </ol>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { REDENTIA_COLORS as C, REDENTIA_FONTS as F } from '~/utils/redentiaCreativeColors'

definePageMeta({ middleware: ['admin-panel'] })

const postizUrl = computed(() => {
  if (import.meta.server) return 'https://postiz.saraivada.com'
  return window.location.hostname.includes('localhost') ? 'http://localhost:4007' : 'https://postiz.saraivada.com'
})

const steps = [
  {
    title: 'Conectar contas',
    description: 'No Postiz, faça login e conecte Instagram, Facebook, Threads e X via OAuth. Cada plataforma pede Meta Business Portfolio / Dev app (free). X cobra US$ 100/mês na tier Basic pra postar mídia.',
  },
  {
    title: 'Agendar posts',
    description: 'Suba imagens ou vídeos do creative.redentia.com.br, escreva a legenda, escolha a data e hora. O Postiz cuida do upload e respeito aos rate limits de cada plataforma.',
  },
  {
    title: 'Automatizar recorrência',
    description: 'Automações diárias (ex: altas e baixas às 18h) são configuradas em Admin → Social → Automações. Elas chamam a API do Postiz usando a sua API key.',
  },
]
</script>

<style scoped>
.font-mono-tab { font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace; font-feature-settings: 'tnum' 1; }
</style>
