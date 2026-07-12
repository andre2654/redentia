<script setup lang="ts">
// /institucional/about — Sobre a Redentia (portada VERBATIM de
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
  title: 'Sobre a Redentia',
  intro: [
    { kind: 'p', text: 'A Redentia é uma plataforma de investimentos que combina tecnologia de ponta com inteligência artificial para democratizar o acesso à informação financeira de qualidade.' },
    { kind: 'p', text: 'Oferecemos cotações em tempo real, análises fundamentalistas, calculadoras financeiras e assessoria com IA, tudo em um único lugar, gratuito e acessível.' },
    { kind: 'p', text: 'Nossa missão é empoderar investidores de todos os níveis com ferramentas profissionais e dados confiáveis para tomadas de decisão mais inteligentes.' },
    { kind: 'p', text: 'Comprometidos com transparência, segurança e inovação, transformamos a experiência de investir no Brasil.' },
  ],
  sections: [],
}

usePageSeo({
  // SEO igual ao antigo (about.vue): brand.name resolvido = "Redentia". O app.vue
  // sufixa "· Redentia" em todo title (house style Nu).
  title: 'Sobre a Redentia | Plataforma inteligente de investimentos',
  description: 'Entenda a missão da Redentia e como combinamos consolidação de carteira e inteligência artificial para simplificar a vida do investidor brasileiro.',
  path: '/institucional/about',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Sobre', path: '/institucional/about' },
  ],
})

// Title antigo já traz a marca + cauda de SEO — opt-out do sufixo global (igual /login).
useHead({ titleTemplate: null })
</script>

<template>
  <div>
    <LegalHero :eyebrow="doc.eyebrow" :title="doc.title" />
    <LegalDoc :intro="doc.intro" :sections="doc.sections" />
  </div>
</template>
