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

    <!-- o fecho: a frase da marca (MARCA.frase) no painel azul e a mesma
         chamada do topo, que é o passo 01 -->
    <section v-revelar class="hwf">
      <div class="hwf__painel">
        <MarcaCorte class="hwf__corte nu-corte-fundo" :largura="620" cor="var(--nu-white)" />
        <NuEyebrow como="p" sobre="azul">{{ MARCA.nome }}</NuEyebrow>
        <p class="hwf__frase">{{ MARCA.frase }}</p>
        <NuBotaoSeta to="/assinar?quiz=1&de=como-funciona" variante="creme" class="hwf__cta">Criar conta grátis</NuBotaoSeta>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Os passos no padrão da Aportou (11/11/2026): número gigante cobalto sobre um
   fio carvão de 3px, título em 800. Sobre o creme da página, em cascata.
   Robustez (11/11/2026): a coluna do site, a cascata em token (520ms, 60ms
   entre um passo e outro) e o fecho que entra ao chegar (v-revelar). */
.hw {
  background: var(--nu-page);
  padding: clamp(48px, 6vw, 80px) var(--nu-coluna) clamp(40px, 5vw, 64px);
}
.hw__steps {
  max-width: 1240px; margin: 0; padding: 0; list-style: none;
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));
  gap: clamp(28px, 3.4vw, 44px) clamp(20px, 2.6vw, 36px);
}
.hw__step { display: flex; flex-direction: column; animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) both; }
.hw__step:nth-child(2) { animation-delay: var(--nu-passo-cascata); }
.hw__step:nth-child(3) { animation-delay: calc(var(--nu-passo-cascata) * 2); }
.hw__step:nth-child(4) { animation-delay: calc(var(--nu-passo-cascata) * 3); }
.hw__num {
  color: var(--nu-blue); font-size: clamp(64px, 6.4vw, 88px); font-weight: var(--nu-w-display);
  letter-spacing: var(--nu-ls-display); line-height: 1; font-variant-numeric: tabular-nums;
  padding-bottom: 14px; border-bottom: 3px solid var(--nu-ink);
}
.hw__body { padding-top: 24px; }
.hw__title {
  margin: 0; color: var(--nu-ink);
  font-size: clamp(22px, 2.1vw, 26px); font-weight: var(--nu-w-forte);
  letter-spacing: var(--nu-ls-titulo); line-height: 1.12; text-wrap: balance;
}
.hw__desc {
  margin: 12px 0 0; color: var(--nu-gray-3);
  font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto); line-height: 1.55; max-width: 34ch;
}

/* ——— o fecho em painel azul (o gradiente cobalto, raio 40, o corte gigante a 8%) ——— */
.hwf { background: var(--nu-page); padding: 0 var(--nu-coluna) clamp(72px, 8vw, 128px); }
.hwf__painel {
  position: relative; isolation: isolate; overflow: hidden;
  display: flex; flex-direction: column; align-items: flex-start;
  padding: clamp(36px, 5.4vw, 76px) clamp(24px, 5vw, 64px);
  border-radius: var(--nu-r-secao); background: var(--nu-grad-cobalto); color: var(--nu-white);
}
/* posição e tamanho são da classe global .nu-corte-fundo (sempre no canto de cima à esquerda) */
.hwf__corte { z-index: -1; opacity: .08; }
.hwf__frase {
  margin: 18px 0 0; color: var(--nu-white); font-size: var(--nu-fs-h2); font-weight: var(--nu-w-display);
  letter-spacing: var(--nu-ls-display); line-height: 1.02; text-wrap: balance;
}
.hwf__cta { margin-top: clamp(26px, 3vw, 36px); }
@media (max-width: 760px) { .hwf__painel { border-radius: var(--nu-r-card); } }
@media (prefers-reduced-motion: reduce) { .hw__step { animation: none; } }
</style>
