<script setup lang="ts">
// STUB /rankings/[classe] — a tela de rankings reativa a params (direção do
// dono 2026-07-13: 1 tela só, o link do header já chega "buscado") será
// implementada num PR próprio. Backend: 18 endpoints /rankings/* existem
// (⚠️ equity-only hoje; FIIs/BDRs aceitam ?type=, Renda Fixa = derivar do
// /tesouro). Este stub valida a classe (404 pra slug inválido) e apresenta
// a rota na linguagem Nu até a tela real entrar.
const route = useRoute()

const CLASSES: Record<string, { label: string; desc: string }> = {
  'acoes': { label: 'Rankings de Ações', desc: 'As melhores ações da B3 por dividend yield, valuation, rentabilidade, Graham, Bazin e mais.' },
  'fiis': { label: 'Rankings de FIIs', desc: 'Os fundos imobiliários ranqueados por dividend yield, P/VP e consistência de renda.' },
  'bdrs': { label: 'Rankings de BDRs', desc: 'As empresas globais negociadas na B3, ranqueadas por fundamentos.' },
  'renda-fixa': { label: 'Ranking de Renda Fixa', desc: 'Os títulos do Tesouro Direto ordenados pelas melhores taxas de hoje.' },
}

const classe = computed(() => String(route.params.classe ?? ''))
const meta = CLASSES[classe.value]
if (!meta) {
  throw createError({ statusCode: 404, statusMessage: 'Ranking não encontrado', fatal: true })
}

usePageSeo({
  title: meta.label,
  description: meta.desc,
  path: `/rankings/${classe.value}`,
  robots: 'noindex, follow', // vira indexável quando a tela real entrar
})
</script>

<template>
  <div>
    <NuPageHero eyebrow="Rankings" :subtitle="meta.desc">
      {{ meta.label }}.
    </NuPageHero>
    <section class="rkg">
      <div class="rkg__card">
        <div class="rkg__title">Em breve</div>
        <div class="rkg__desc">
          Estamos montando esta tela. Enquanto isso, explore o mercado ou
          pergunte à Redentia AI qual ativo encaixa na sua estratégia.
        </div>
        <div class="rkg__ctas">
          <NuxtLink to="/mercado" class="rkg__cta">Explorar o mercado</NuxtLink>
          <NuxtLink to="/busca" class="rkg__cta-outline">Perguntar à Redentia AI</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.rkg { background: var(--nu-white); padding: clamp(48px, 6vw, 80px) clamp(22px, 5.5vw, 80px) clamp(64px, 8.5vw, 110px); animation: nu-fade .5s ease both; }
.rkg__card { background: var(--nu-cream); border-radius: var(--nu-r-card-lg); padding: clamp(28px, 3.5vw, 44px); max-width: 720px; }
.rkg__title { color: var(--nu-ink); font-size: clamp(22px, 2.2vw, 28px); font-weight: 800; letter-spacing: -.3px; }
.rkg__desc { color: var(--nu-gray-2); font-size: 16.5px; font-weight: 500; line-height: 1.6; margin-top: 12px; max-width: 520px; }
.rkg__ctas { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 24px; }
.rkg__cta {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 14px 26px; font-size: 15.5px; font-weight: 800;
  transition: background .2s;
}
.rkg__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.rkg__cta-outline {
  display: inline-flex; align-items: center; background: transparent; color: var(--nu-blue);
  border: 2px solid var(--nu-blue); border-radius: var(--nu-r-pill); padding: 12px 24px;
  font-size: 15.5px; font-weight: 800; transition: background .2s;
}
.rkg__cta-outline:hover { background: var(--nu-blue-tint-2); color: var(--nu-blue); }
</style>
