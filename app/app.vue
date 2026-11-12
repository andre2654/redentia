<script setup lang="ts">
// JSON-LD Organization site-wide (1× no app, não em layout — padrão do Frontend).
const site = useRuntimeConfig().public.siteUrl
useHead({
  // Sufixo de marca em todo title. Vive AQUI (não no nuxt.config): função de
  // titleTemplate em app.head não serializa e o SSR saía sem sufixo (bug desde
  // o PR0, pego no verify do PR10). /login segue com opt-out via titleTemplate: null.
  titleTemplate: (title?: string | null) =>
    title ? `${title} · ${MARCA.nome}` : MARCA.titulo,
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: MARCA.nome,
      slogan: MARCA.frase,
      parentOrganization: { '@type': 'Organization', name: MARCA.b2b },
      legalName: EMPRESA.razaoSocial,
      taxID: EMPRESA.cnpj,
      url: site,
      logo: `${site}/icone-aportou.svg`,
      description: MARCA.descricao,
    }),
  }],
})

// Sessão adiada pelo HIT anônimo da borda (ver assumirSessaoAdiada). Precisa
// ser o 1º filho do template: o onMounted dele é o 1º da árvore a rodar,
// depois de TODA a hidratação e antes dos onMounted do layout e das páginas.
const AssumirSessao = defineComponent({
  setup() {
    onMounted(assumirSessaoAdiada)
    return () => null
  },
})

const semLayout = computed(() => useRoute().meta.layout === false)

// A barra de progresso de toda navegação (12/11/2026, a abertura do ativo): a
// do Nuxt, em cobalto e 2px no alto da tela, que só aparece passados 200 ms
// (a navegação rápida não pisca). Durante o maximizar do espiar ela se esconde
// (html.nu-maximizando, EspiarAtivo): a capa tem a linha de progresso dela.
// Movimento reduzido: a barra fica parada no meio enquanto carrega, sem andar.
const calmo = import.meta.client ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
/** a mesma curva do Nuxt (rápida no começo, devagar perto do fim); no movimento reduzido, parada */
function progressoEstimado(duracao: number, passou: number): number {
  if (calmo?.matches) return 50
  return (2 / Math.PI) * 100 * Math.atan(((passou / duracao) * 100) / 50)
}
</script>

<template>
  <div>
    <AssumirSessao />
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator color="var(--nu-blue)" error-color="var(--nu-red)" :height="2" :estimated-progress="progressoEstimado" />
    <!-- Páginas sem layout (o login) não têm header pra sentar o aviso
         embaixo. No default ele fica no layout, depois do header, no
         fluxo — não cobre o header nem títulos. -->
    <ConsentBanner v-if="semLayout" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
