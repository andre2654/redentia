<!--
  /admin/social/posts — onboarding pra Postiz (motor de publicacao social).

  Visual: usa o admin design system. 3 passos lado a lado, CTA grande
  amber pra abrir o Postiz, e um card de "conectar automacoes" com
  o snippet de .env.
-->
<template>
  <NuxtLayout name="admin-panel">
    <div class="admin-page admin-page--narrow">
      <header class="admin-page__head">
        <div class="admin-page__head-left">
          <span class="admin-page__eyebrow">
            <UIcon name="i-lucide-image" />
            Social · Posts
          </span>
          <h1 class="admin-page__title">Composer, contas e agendamento.</h1>
          <p class="admin-page__lead">
            Composição e agendamento de posts avulsos vivem no Postiz, nosso motor self-hosted.
            Conecte uma vez, agende daqui, automações recorrentes usam a API por baixo.
          </p>
        </div>
      </header>

      <!-- ============ STEPS ============ -->
      <section class="admin-grid admin-grid--3">
        <article
          v-for="(step, idx) in steps"
          :key="idx"
          class="admin-card posts-step"
        >
          <span class="posts-step__num">
            Passo {{ String(idx + 1).padStart(2, '0') }}
          </span>
          <h3 class="posts-step__title">{{ step.title }}</h3>
          <p class="posts-step__desc">{{ step.description }}</p>
        </article>
      </section>

      <!-- ============ CTA: ABRIR POSTIZ ============ -->
      <a
        :href="postizUrl"
        target="_blank"
        rel="noopener"
        class="posts-cta"
      >
        <div class="posts-cta__copy">
          <span class="posts-cta__eyebrow">Abrir Postiz</span>
          <span class="posts-cta__url">postiz.saraivada.com</span>
          <span class="posts-cta__sub">
            Abre em nova aba · login separado na primeira vez
          </span>
        </div>
        <UIcon name="i-lucide-arrow-up-right" class="posts-cta__arrow size-7" />
      </a>

      <!-- ============ API KEY INSTRUCTIONS ============ -->
      <section class="admin-section">
        <div class="admin-section__head">
          <div class="admin-section__head-left">
            <span class="admin-section__eyebrow">
              <UIcon name="i-lucide-key" />
              Conectar automações
            </span>
            <h2 class="admin-section__title">5 passos pra ligar a API</h2>
          </div>
        </div>

        <ol class="posts-instructions">
          <li>Entre no Postiz, conecte pelo menos uma conta social (Instagram / X / Threads / FB).</li>
          <li>Vá em <strong>Settings → API Keys</strong> e gere uma chave.</li>
          <li>
            No VPS, adicione ao <code>.env</code> do Laravel:
            <pre class="posts-instructions__code">POSTIZ_ENABLED=true
POSTIZ_API_URL=https://postiz.saraivada.com/api
POSTIZ_API_KEY=sua-chave-aqui</pre>
          </li>
          <li>Rode <code>docker exec php-fpm-redentia php artisan config:cache</code>.</li>
          <li>
            Pronto. A partir daí,
            <NuxtLink to="/admin/social/automations" class="posts-instructions__link">automações</NuxtLink>
            agendam de verdade via API do Postiz em vez de só logar.
          </li>
        </ol>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
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
/* ============ STEPS ============ */
.posts-step { gap: 10px; }
.posts-step__num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.posts-step__title {
  margin: 0;
  font-family: var(--brand-font);
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.012em;
  color: var(--brand-text);
}
.posts-step__desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
}

/* ============ CTA ============ */
.posts-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 26px;
  border-radius: 12px;
  background: var(--brand-primary);
  color: var(--text-on-primary);
  text-decoration: none;
  transition: filter 200ms, transform 100ms, box-shadow 200ms;
  box-shadow: 0 18px 40px -16px color-mix(in srgb, var(--brand-primary) 60%, transparent);
}
.posts-cta:hover {
  filter: brightness(0.94);
  transform: translateY(-1px);
}
.posts-cta__copy { display: flex; flex-direction: column; gap: 2px; }
.posts-cta__eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.85;
}
.posts-cta__url {
  font-family: var(--brand-font);
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.012em;
}
.posts-cta__sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.78;
}
.posts-cta__arrow { transition: transform 200ms; }
.posts-cta:hover .posts-cta__arrow { transform: translate(2px, -2px); }

/* ============ INSTRUCTIONS ============ */
.posts-instructions {
  margin: 0;
  padding: 0 0 0 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  list-style: decimal;
  font-size: 13.5px;
  line-height: 1.6;
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
}
.posts-instructions strong {
  font-weight: 600;
  color: var(--brand-text);
}
.posts-instructions code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  color: var(--brand-text);
}
.posts-instructions__code {
  margin: 8px 0 0;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
  background: color-mix(in srgb, var(--brand-text) 3%, transparent);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  line-height: 1.55;
  color: var(--brand-text);
  overflow-x: auto;
}
.posts-instructions__link {
  color: var(--brand-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
  transition: text-decoration-color 150ms;
}
.posts-instructions__link:hover {
  text-decoration-color: var(--brand-primary);
}
</style>
