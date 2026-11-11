<script setup lang="ts">
// /institucional/contact — "Fale com a Aportou" (até 11/11/2026, "…a Redentia"; portada de
// Frontend/app/pages/institucional/contact.vue). Placeholders de brand
// resolvidos: brand.name = "Redentia", e-mail de suporte =
// relacionamento@redentia.com.br.
//
// PADRÃO Nu (mesmo sistema visual das legais /institucional/privacy): banda
// creme do LegalHero (eyebrow + H1) → banda branca com a coluna de artigo.
// O corpo desta página, porém, é interativo (form + canais + FAQ), então usa
// LegalHero + composição própria em vez do LegalDoc de prosa.
//
// TEXTO VERBATIM (acentos restaurados): as 3 perguntas do FAQ, as respostas 2
// e 3, e os rótulos/placeholders/opções do form vêm literais da página antiga.
// A 1ª resposta descreve a conexão pelo Open Finance, no app da instituição. O botão e o painel
// pós-clique do form (ContactForm.vue) não afirmam envio.
//
// brand.contact (title/subtitle/channels) vinha do JSONB do tenant no banco
// (não versionado no repo). Resolvido para a Redentia: título "Fale com a
// Redentia"; canais = e-mail de suporte + horário de atendimento (mantidos
// conforme instrução "mantenha canais/horários").
import type { NuFaqItem } from '~/types/market'

const SUPPORT_EMAIL = 'relacionamento@redentia.com.br'

// FAQ VERBATIM da página antiga (as 3 perguntas em <details>). O
// NuFaqAccordion emite o JSON-LD FAQPage (rich snippet) — equivalente
// replicado do "FAQ" original.
const faqs: NuFaqItem[] = [
  {
    q: 'Como posso conectar minha corretora?',
    a: 'Você pode conectar seus bancos e corretoras pelo Open Finance, autorizando o compartilhamento no aplicativo da própria instituição.',
  },
  {
    q: 'Meus dados estão seguros?',
    a: 'Sim. Utilizamos criptografia de nível bancário e seguimos todas as diretrizes da LGPD. Seus dados são protegidos com as melhores práticas de segurança do mercado.',
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
  title: `Fale com a ${MARCA.nome} | Atendimento e suporte`,
  description:
    `Entre em contato com a equipe ${MARCA.nome} para tirar dúvidas, enviar sugestões ou falar sobre parcerias. Respondemos rapidamente.`,
  path: '/institucional/contact',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Contato', path: '/institucional/contact' },
  ],
})

// Title antigo já traz a marca + cauda de SEO — opt-out do sufixo global (igual /login).
useHead({ titleTemplate: null })

// "Perguntar à IA" abre o painel do chat aqui mesmo (11/11/2026): a pergunta
// mora no painel desde 02/11, e a /busca não é mais onde se conversa.
const painel = useChatPainel()
</script>

<template>
  <div>
    <LegalHero eyebrow="Contato" title="Fale com a Aportou" />

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
          <NuSectionHeading eyebrow="Dúvidas">Ficou com alguma<br>dúvida?</NuSectionHeading>
          <div class="cfq__copy">Respostas para as principais dúvidas sobre a Aportou. Se preferir, pergunte direto à nossa IA.</div>
          <NuBotaoSeta variante="carvao" tamanho="m" class="cfq__cta" @click="painel.abrir()">Perguntar à IA</NuBotaoSeta>
        </div>
        <div class="cfq__right">
          <NuFaqAccordion :items="faqs" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Contato na personalidade da Aportou (11/11/2026): creme da página, o
   formulário num cartão creme, os canais em cartões com a sombra quente e a
   faixa quente do FAQ. Conteúdo, canais e horários iguais. */
.ctc {
  background: var(--nu-page);
  padding: clamp(44px, 6vw, 76px) max(clamp(20px, 5.5vw, 80px), calc((100% - 1240px) / 2)) clamp(56px, 7vw, 96px);
  animation: nu-fade .5s ease .06s both;
}
.ctc__inner { max-width: 760px; }

.ctc__lede {
  margin: 0; color: var(--nu-gray-3);
  font-size: clamp(18px, 1.5vw, 21px); font-weight: 500; line-height: 1.45;
}
.ctc__form { margin-top: clamp(28px, 3.5vw, 40px); }

.ctc__h2 {
  margin: clamp(48px, 5.5vw, 68px) 0 0; color: var(--nu-ink);
  font-size: var(--nu-fs-h3); font-weight: var(--nu-w-display);
  letter-spacing: -0.025em; line-height: 1.05;
}

.ctc__channels {
  margin-top: 24px; display: grid; gap: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.ctc__channel {
  background: var(--nu-card); border-radius: var(--nu-r-panel); box-shadow: var(--nu-shadow-quente);
  padding: 24px 26px;
}
.ctc__channel-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--nu-ink); color: var(--nu-white); margin-bottom: 16px;
}
.ctc__channel-label { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-medio); letter-spacing: 0.14em; text-transform: uppercase; }
.ctc__channel-value { margin-top: 8px; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-medio); line-height: 1.35; overflow-wrap: anywhere; }
.ctc__channel-value--link { display: inline-block; color: var(--nu-blue-text); text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1.5px; transition: color .2s; }
.ctc__channel-value--link:hover { color: var(--nu-blue-hover); }

/* FAQ — seção padrão: 2 colunas, título + texto + chamada à esquerda,
   accordion à direita, sobre a faixa quente */
.cfq {
  background: var(--nu-band);
  padding: clamp(64px, 7vw, 100px) max(clamp(20px, 5.5vw, 80px), calc((100% - 1240px) / 2));
}
.cfq__cols { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; max-width: 1240px; margin: 0 auto; }
.cfq__left { flex: 1 1 300px; min-width: min(280px, 100%); }
.cfq__copy { color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.5; margin-top: 22px; max-width: 420px; }
.cfq__cta { margin-top: 30px; }
.cfq__right { flex: 1.6 1 480px; min-width: min(340px, 100%); }

/* ——— computador: a conversa de um lado (a frase e os canais), o formulário
   do outro, na coluna da página. A ordem no HTML é a de sempre. ——— */
@media (min-width: 1000px) {
  .ctc__inner {
    max-width: none; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 640px);
    grid-template-rows: auto auto 1fr; column-gap: clamp(48px, 6vw, 96px); align-items: start;
  }
  .ctc__lede { grid-column: 1; grid-row: 1; color: var(--nu-ink); font-size: clamp(22px, 2vw, 27px); font-weight: 600; letter-spacing: -0.012em; line-height: 1.35; text-wrap: pretty; }
  .ctc__form { grid-column: 2; grid-row: 1 / span 3; margin-top: 0; }
  .ctc__h2 { grid-column: 1; grid-row: 2; margin-top: clamp(40px, 4.4vw, 56px); font-size: var(--nu-fs-marca); font-weight: var(--nu-w-medio); letter-spacing: 0.16em; text-transform: uppercase; line-height: 1.3; }
  .ctc__channels { grid-column: 1; grid-row: 3; grid-template-columns: 1fr; margin-top: 16px; gap: 12px; }
  .ctc__channel { display: grid; grid-template-columns: 44px minmax(0, 1fr); column-gap: 16px; align-items: center; padding: 20px 22px; }
  .ctc__channel-icon { grid-row: 1 / span 2; margin-bottom: 0; }
  .ctc__channel-value { margin-top: 4px; }
}
@media (max-width: 760px) {
  .ctc__channels { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) { .ctc { animation: none; } }
</style>
