<script setup lang="ts">
// /institucional/how-works — Como funciona a Redentia (portada VERBATIM de
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
  { title: 'Pergunte à IA', description: 'Tire dúvidas com o Assessor Redentia, disponível 24/7 com respostas em segundos.' },
]

usePageSeo({
  // SEO igual ao antigo (how-works.vue): brand.name resolvido = "Redentia". O
  // app.vue sufixa "· Redentia" em todo title (house style Nu).
  title: 'Como funciona a Redentia | Consolide e analise seus investimentos',
  description: 'Veja passo a passo como a plataforma Redentia conecta corretoras, usa IA para gerar insights e entrega dashboards completos para seus investimentos.',
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
    <LegalHero eyebrow="Institucional" title="Como funciona a Redentia" />

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
.hw {
  background: var(--nu-white);
  padding: clamp(44px, 6vw, 76px) clamp(22px, 5.5vw, 80px) clamp(64px, 8.5vw, 110px);
  animation: nu-fade .5s ease both;
}
.hw__steps {
  max-width: 720px; margin: 0 auto; list-style: none;
  display: flex; flex-direction: column; gap: clamp(24px, 3.2vw, 40px);
}
.hw__step {
  display: flex; align-items: flex-start; gap: clamp(18px, 2.6vw, 28px);
}
.hw__num {
  flex-shrink: 0; width: clamp(44px, 5vw, 54px); height: clamp(44px, 5vw, 54px);
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--nu-r-tile); background: var(--nu-blue-tint);
  color: var(--nu-blue); font-size: clamp(17px, 1.7vw, 20px); font-weight: 800;
  letter-spacing: -0.02em; font-variant-numeric: tabular-nums;
}
.hw__body { flex: 1; min-width: 0; padding-top: 2px; }
.hw__title {
  margin: 0; color: var(--nu-ink);
  font-size: clamp(20px, 2.1vw, 25px); font-weight: 800;
  letter-spacing: -0.03em; line-height: 1.18;
}
.hw__desc {
  margin: 8px 0 0; color: var(--nu-gray-2);
  font-size: 16.5px; font-weight: 500; line-height: 1.65;
}

@media (max-width: 760px) {
  .hw__step { gap: 16px; }
}
</style>
