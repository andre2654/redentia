<script setup lang="ts">
// /institucional/about — Sobre a Aportou (até 11/11/2026, "Sobre a Redentia"; portada VERBATIM de
// Frontend/app/pages/institucional/about.vue, cujo texto vinha do config do
// tenant: brand.about.title + brand.about.paragraphs). Placeholders resolvidos:
// brand.name = "Redentia". Path e SEO preservados de propósito (mesma URL).
//
// Segue o GABARITO das páginas legais Nu (institucional/privacy.vue): conteúdo é
// uma árvore tipada (LegalDocData); LegalHero renderiza a banda creme e LegalDoc
// a coluna de artigo em branco. Página curta = só os 4 parágrafos como lede
// (intro), sem seções. Header/ticker/footer vêm do layout default.
import type { LegalDocData } from '~/types/legal'

const doc: LegalDocData = {
  eyebrow: 'Institucional',
  title: 'Sobre a Aportou',
  intro: [
    { kind: 'p', text: 'A Aportou é uma plataforma de investimentos que combina tecnologia de ponta com inteligência artificial para democratizar o acesso à informação financeira de qualidade.' },
    { kind: 'p', text: 'Oferecemos cotações em tempo real, análises fundamentalistas, calculadoras financeiras e assessoria com IA, tudo em um único lugar, gratuito e acessível.' },
    { kind: 'p', text: 'Nossa missão é empoderar investidores de todos os níveis com ferramentas profissionais e dados confiáveis para tomadas de decisão mais inteligentes.' },
    { kind: 'p', text: 'Comprometidos com transparência, segurança e inovação, transformamos a experiência de investir no Brasil.' },
    // a casa (11/11/2026): a Aportou é a marca de investidor; a Redentia fica com os escritórios
    { kind: 'p', text: 'A Aportou é uma empresa Redentia, que faz tecnologia de dados para escritórios de investimento.' },
  ],
  sections: [],
}

usePageSeo({
  // SEO igual ao antigo (about.vue): brand.name resolvido = "Redentia". O app.vue
  // sufixa "· Redentia" em todo title (house style Nu).
  title: `Sobre a ${MARCA.nome} | Plataforma inteligente de investimentos`,
  description: `Entenda a missão da ${MARCA.nome} e como combinamos consolidação de carteira e inteligência artificial para simplificar a vida do investidor brasileiro.`,
  path: '/institucional/about',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Sobre', path: '/institucional/about' },
  ],
})

// Title antigo já traz a marca + cauda de SEO — opt-out do sufixo global (igual /login).
useHead({ titleTemplate: null })

// as páginas irmãs (os mesmos rótulos e destinos do rodapé, coluna "Empresa")
const MAIS = [
  { rotulo: 'Como funciona', to: '/institucional/how-works' },
  { rotulo: 'Metodologia', to: '/metodologia' },
  { rotulo: 'Contato', to: '/institucional/contact' },
]
</script>

<template>
  <div>
    <LegalHero :eyebrow="doc.eyebrow" :title="doc.title" />

    <!-- a marca de um lado, o texto do outro: a frase e a assinatura vêm de
         MARCA (as mesmas do rodapé); os parágrafos são os do documento -->
    <section class="sob">
      <div class="sob__marca">
        <MarcaCorte :largura="52" />
        <p class="sob__frase">{{ MARCA.frase }}</p>
        <p class="sob__casa">{{ MARCA.assinatura }}</p>
      </div>
      <div class="sob__texto">
        <LegalBlocks :blocks="doc.intro ?? []" lede />
      </div>
    </section>

    <!-- o posicionamento da marca: o mesmo bloco da home, com os mesmos fatos -->
    <HomeOQueNaoE v-revelar />

    <nav v-revelar="{ alvo: 'filhos' }" class="sob__mais" aria-label="Mais sobre a Aportou">
      <NuxtLink v-for="l in MAIS" :key="l.to" :to="l.to" class="sob__link">
        <span>{{ l.rotulo }}</span>
        <span class="sob__seta" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
      </NuxtLink>
    </nav>
  </div>
</template>

<style scoped>
/* Sobre, na narrativa da marca (11/11/2026, 2ª rodada): a frase da Aportou em
   800 com o corte e a assinatura "Uma empresa Redentia" numa linha, ao lado do
   texto de sempre; depois "O que a Aportou não é" (o bloco da home) e os
   atalhos das páginas irmãs. Nenhum fato, número ou data novos.
   Robustez (11/11/2026): a coluna do site, a entrada em token, o que vem abaixo
   da dobra entra ao chegar (v-revelar) e os atalhos com apertado e foco. */
.sob {
  --lado: var(--nu-coluna);
  display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); column-gap: clamp(40px, 6vw, 96px); align-items: start;
  background: var(--nu-page); padding: clamp(44px, 6vw, 84px) var(--lado) clamp(72px, 8vw, 128px);
}
.sob__marca { position: sticky; top: calc(var(--nuh-h, 72px) + 64px); animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) both; }
.sob__frase {
  margin: 22px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: var(--nu-w-display);
  letter-spacing: var(--nu-ls-display); line-height: 1.02; text-wrap: balance; max-width: 9em;
}
.sob__casa {
  display: inline-block; margin: 26px 0 0; padding-top: 16px; border-top: 1px solid var(--nu-line);
  color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto);
}
.sob__texto { max-width: 720px; animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) var(--nu-passo-cascata) both; }
.sob__texto :deep(.lgb__p:first-child) { margin-top: 0; color: var(--nu-ink); font-size: clamp(20px, 1.9vw, 25px); font-weight: var(--nu-w-medio); line-height: 1.4; letter-spacing: var(--nu-ls-titulo); }
.sob__texto :deep(.lgb__p + .lgb__p) { margin-top: 20px; }

.sob__mais {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr)); gap: clamp(12px, 1.6vw, 20px);
  background: var(--nu-page);
  padding: clamp(48px, 6vw, 80px) var(--nu-coluna) clamp(72px, 8vw, 128px);
}
.sob__link {
  display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 84px; padding: 18px 20px 18px 26px;
  border-radius: var(--nu-r-panel); background: var(--nu-card); box-shadow: var(--nu-shadow-quente);
  color: var(--nu-ink); font-size: clamp(19px, 1.7vw, 22px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); line-height: 1.15;
  -webkit-tap-highlight-color: transparent;
  transition: transform var(--nu-dur-media) var(--nu-ease-saida), box-shadow var(--nu-dur-media) var(--nu-ease-saida);
}
@media (hover: hover) { .sob__link:hover { color: var(--nu-ink); transform: translateY(-2px); box-shadow: var(--nu-shadow-card); } }
.sob__link:active { transform: scale(.99); transition-duration: var(--nu-dur-rapida); }
.sob__link:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.sob__seta {
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; width: 44px; height: 44px;
  border-radius: 50%; background: var(--nu-ink); color: var(--nu-white);
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-media) var(--nu-ease-saida);
}
.sob__seta svg { width: 18px; height: 18px; transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
.sob__link:hover .sob__seta { background: var(--nu-blue); transform: scale(1.04); }
.sob__link:hover .sob__seta svg { transform: translateX(3px); }

@media (max-width: 900px) {
  .sob { grid-template-columns: 1fr; row-gap: clamp(32px, 7vw, 44px); }
  .sob__marca { position: static; }
  .sob__frase { margin-top: 18px; }
}
@media (prefers-reduced-motion: reduce) {
  .sob__marca, .sob__texto { animation: none; }
  .sob__link, .sob__seta, .sob__seta svg { transition: none; }
}
</style>
