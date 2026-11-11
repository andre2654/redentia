<script setup lang="ts">
// /institucional/how-works — Como funciona a Aportou (até 11/11/2026, "…a Redentia"; portada VERBATIM de
// Frontend/app/pages/institucional/how-works.vue, cujo texto vinha do config do
// tenant: brand.howWorks.title + brand.howWorks.steps). Placeholders resolvidos:
// brand.name = "Redentia". Path e SEO preservados de propósito (mesma URL).
//
// Página curta: LegalHero (banda creme, par do gabarito legal) + os 4 passos
// numerados no estilo Nu (timeline vertical, número azul, tabular-nums). Título
// de cada passo é <h2> (par da semântica antiga). Header/ticker/footer vêm do
// layout default. Cor só via var(--nu-*).

const steps = [
  { title: 'Crie sua conta grátis', description: 'Cadastro rápido, sem cartão de crédito. Comece em menos de 1 minuto.' },
  { title: 'Explore o mercado', description: 'Acompanhe cotações em tempo real, analise fundamentos e compare ativos.' },
  { title: 'Simule seus investimentos', description: 'Use as calculadoras para planejar aposentadoria, calcular preço teto e mais.' },
  { title: 'Pergunte à IA', description: 'Tire dúvidas com a IA da Aportou, disponível 24/7 com respostas em segundos.' },
]

usePageSeo({
  // SEO igual ao antigo (how-works.vue): brand.name resolvido = "Redentia". O
  // app.vue sufixa "· Redentia" em todo title (house style Nu).
  title: `Como funciona a ${MARCA.nome} | Consolide e analise seus investimentos`,
  description: `Veja passo a passo como a plataforma ${MARCA.nome} conecta corretoras, usa IA para gerar insights e entrega dashboards completos para seus investimentos.`,
  path: '/institucional/how-works',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Como funciona', path: '/institucional/how-works' },
  ],
})

// Title antigo já traz a marca + cauda de SEO — opt-out do sufixo global (igual /login).
useHead({ titleTemplate: null })
</script>

<template>
  <div>
    <LegalHero eyebrow="Institucional" title="Como funciona a Aportou" />

    <section class="hw">
      <ol class="hw__steps">
        <li v-for="(step, i) in steps" :key="i" class="hw__step">
          <div class="hw__num">{{ String(i + 1).padStart(2, '0') }}</div>
          <div class="hw__body">
            <h2 class="hw__title">{{ step.title }}</h2>
            <p class="hw__desc">{{ step.description }}</p>
          </div>
        </li>
      </ol>
    </section>
  </div>
</template>

<style scoped>
/* Os passos no padrão da Aportou (11/11/2026): número gigante cobalto sobre um
   fio carvão de 3px, título em 800. Sobre o creme da página, em cascata. */
.hw {
  background: var(--nu-page);
  padding: clamp(48px, 6vw, 80px) clamp(20px, 5.5vw, 80px) clamp(64px, 8.5vw, 110px);
}
.hw__steps {
  max-width: 1240px; margin: 0; padding: 0; list-style: none;
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));
  gap: clamp(28px, 3.4vw, 44px) clamp(20px, 2.6vw, 36px);
}
.hw__step { display: flex; flex-direction: column; animation: nu-fade .5s ease both; }
.hw__step:nth-child(2) { animation-delay: .06s; }
.hw__step:nth-child(3) { animation-delay: .12s; }
.hw__step:nth-child(4) { animation-delay: .18s; }
.hw__num {
  color: var(--nu-blue); font-size: clamp(64px, 6.4vw, 88px); font-weight: 800;
  letter-spacing: -0.035em; line-height: 1; font-variant-numeric: tabular-nums;
  padding-bottom: 14px; border-bottom: 3px solid var(--nu-ink);
}
.hw__body { padding-top: 20px; }
.hw__title {
  margin: 0; color: var(--nu-ink);
  font-size: clamp(22px, 2.1vw, 26px); font-weight: 800;
  letter-spacing: -0.025em; line-height: 1.1; text-wrap: balance;
}
.hw__desc {
  margin: 10px 0 0; color: var(--nu-gray-3);
  font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5;
}
@media (prefers-reduced-motion: reduce) { .hw__step { animation: none; } }
</style>
