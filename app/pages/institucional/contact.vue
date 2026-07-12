<script setup lang="ts">
// /institucional/contact — "Fale com a Redentia" (portada de
// Frontend/app/pages/institucional/contact.vue). Placeholders de brand
// resolvidos: brand.name = "Redentia", e-mail de suporte =
// suporte@redentia.com.br.
//
// PADRÃO Nu (mesmo sistema visual das legais /institucional/privacy): banda
// creme do LegalHero (eyebrow + H1) → banda branca com a coluna de artigo.
// O corpo desta página, porém, é interativo (form + canais + FAQ), então usa
// LegalHero + composição própria em vez do LegalDoc de prosa.
//
// TEXTO VERBATIM (acentos restaurados): o FAQ (3 perguntas/respostas), os
// rótulos/placeholders/opções do form e os textos de botão/sucesso vêm
// literais da página antiga. Ver legal/contact/ContactForm.vue (auto-import
// <ContactForm>) para os textos do form.
//
// brand.contact (title/subtitle/channels) vinha do JSONB do tenant no banco
// (não versionado no repo). Resolvido para a Redentia: título "Fale com a
// Redentia"; canais = e-mail de suporte + horário de atendimento (mantidos
// conforme instrução "mantenha canais/horários").
import type { NuFaqItem } from '~/types/market'

const SUPPORT_EMAIL = 'suporte@redentia.com.br'

// FAQ VERBATIM da página antiga (as 3 perguntas em <details>). O
// NuFaqAccordion emite o JSON-LD FAQPage (rich snippet) — equivalente
// replicado do "FAQ" original.
const faqs: NuFaqItem[] = [
  {
    q: 'Como posso conectar minha corretora?',
    a: 'Você pode conectar sua corretora através do CEI (Canal Eletrônico do Investidor) ou diretamente com as APIs das principais corretoras do mercado.',
  },
  {
    q: 'Meus dados estão seguros?',
    a: 'Sim! Utilizamos criptografia de nível bancário e seguimos todas as diretrizes da LGPD. Seus dados são protegidos com as melhores práticas de segurança do mercado.',
  },
  {
    q: 'Posso cancelar minha assinatura a qualquer momento?',
    a: 'Sim, você pode cancelar sua assinatura a qualquer momento através da plataforma ou entrando em contato conosco.',
  },
]

// Canais alternativos ("Outras formas de contato" da página antiga).
const channels = [
  {
    label: 'E-mail de suporte',
    value: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
    icon: 'mail',
  },
  {
    label: 'Horário de atendimento',
    value: 'Segunda a sexta, das 9h às 18h',
    href: '',
    icon: 'clock',
  },
]

usePageSeo({
  // Título VERBATIM da página antiga ("Fale com a Redentia | Atendimento e
  // suporte"); o app.vue sufixa "· Redentia" (house style Nu).
  title: 'Fale com a Redentia | Atendimento e suporte',
  description:
    'Entre em contato com a equipe Redentia para tirar dúvidas, enviar sugestões ou falar sobre parcerias. Respondemos rapidamente.',
  path: '/institucional/contact',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Contato', path: '/institucional/contact' },
  ],
})

// Title antigo já traz a marca + cauda de SEO — opt-out do sufixo global (igual /login).
useHead({ titleTemplate: null })
</script>

<template>
  <div>
    <LegalHero eyebrow="Contato" title="Fale com a Redentia" />

    <section class="ctc">
      <div class="ctc__inner">
        <p class="ctc__lede">
          Tire suas dúvidas, envie sugestões ou fale sobre parcerias. Nossa equipe
          responde o mais rápido possível.
        </p>

        <ContactForm class="ctc__form" :support-email="SUPPORT_EMAIL" />

        <!-- Outras formas de contato -->
        <h2 class="ctc__h2">Outras formas de contato</h2>
        <div class="ctc__channels">
          <div v-for="c in channels" :key="c.label" class="ctc__channel">
            <div class="ctc__channel-icon" aria-hidden="true">
              <svg v-if="c.icon === 'mail'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
              <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            </div>
            <div class="ctc__channel-label">{{ c.label }}</div>
            <a v-if="c.href" :href="c.href" class="ctc__channel-value ctc__channel-value--link">{{ c.value }}</a>
            <div v-else class="ctc__channel-value">{{ c.value }}</div>
          </div>
        </div>

      </div>
    </section>

    <!-- FAQ — seção padrão das outras telas (mesmo bloco do /mercado) -->
    <section class="cfq">
      <div class="cfq__cols">
        <div class="cfq__left">
          <NuSectionHeading>Ficou com alguma<br>dúvida?</NuSectionHeading>
          <div class="cfq__copy">Respostas para as principais dúvidas sobre a Redentia. Se preferir, pergunte direto à nossa IA.</div>
          <NuxtLink to="/busca" class="cfq__cta">Perguntar à Redentia AI</NuxtLink>
        </div>
        <div class="cfq__right">
          <NuFaqAccordion :items="faqs" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.ctc {
  background: var(--nu-white);
  padding: clamp(44px, 6vw, 76px) clamp(22px, 5.5vw, 80px) clamp(48px, 6vw, 80px);
  animation: nu-fade .5s ease both;
}
.ctc__inner { max-width: 720px; margin: 0 auto; }

.ctc__lede {
  margin: 0; color: var(--nu-gray-2);
  font-size: clamp(17px, 1.5vw, 18px); font-weight: 500; line-height: 1.65;
}
.ctc__form { margin-top: clamp(28px, 3.5vw, 40px); }

.ctc__h2 {
  margin: clamp(44px, 5vw, 60px) 0 0; color: var(--nu-ink);
  font-size: clamp(22px, 2.3vw, 27px); font-weight: 800;
  letter-spacing: -0.03em; line-height: 1.14;
}

.ctc__channels {
  margin-top: 22px; display: grid; gap: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.ctc__channel {
  background: var(--nu-cream); border-radius: var(--nu-r-panel);
  padding: 24px 26px; text-align: center;
}
.ctc__channel-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 46px; height: 46px; border-radius: 50%;
  background: var(--nu-blue-tint); color: var(--nu-blue); margin-bottom: 12px;
}
.ctc__channel-label { color: var(--nu-ink); font-size: 15.5px; font-weight: 800; letter-spacing: -.15px; }
.ctc__channel-value { margin-top: 5px; color: var(--nu-gray-3); font-size: 14.5px; font-weight: 500; line-height: 1.5; }
.ctc__channel-value--link { color: var(--nu-blue); text-decoration: none; transition: color .2s; }
.ctc__channel-value--link:hover { color: var(--nu-blue-hover); text-decoration: underline; text-underline-offset: 2px; }

/* FAQ — seção padrão (mesmo bloco .mfq do /mercado): 2 colunas, título +
   copy + CTA à esquerda, accordion à direita. */
.cfq {
  background: var(--nu-white);
  padding: 0 clamp(22px, 5.5vw, 80px) clamp(64px, 8.5vw, 110px);
  animation: nu-fade .5s ease both;
}
.cfq__cols { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.cfq__left { flex: 1 1 300px; min-width: min(280px, 100%); }
.cfq__copy { color: var(--nu-gray-2); font-size: 17px; font-weight: 500; line-height: 1.6; margin-top: 22px; max-width: 420px; }
.cfq__cta {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 26px; font-size: 16px; font-weight: 700;
  margin-top: 30px; transition: background .2s;
}
.cfq__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.cfq__right { flex: 1.6 1 480px; min-width: min(340px, 100%); }

@media (max-width: 760px) {
  .ctc__channels { grid-template-columns: 1fr; }
}
</style>
