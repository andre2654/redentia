<template>
  <NuxtLayout name="static" title="Sobre nós">
    <section class="flex flex-col gap-3 px-10">
      <h1><strong>Sobre nós</strong></h1>
      <p>
        A <strong>Redentia</strong> é uma empresa brasileira inovadora,
        especializada na consolidação de carteiras de investimentos. Nosso
        objetivo é simplificar a gestão de investimentos para pessoas físicas e
        jurídicas, oferecendo uma plataforma moderna, intuitiva e totalmente
        conectada à inteligência artificial.
      </p>
      <p>
        Utilizando tecnologia de ponta, a Redentia integra diferentes
        instituições financeiras em um único ambiente digital, proporcionando
        uma visão completa e centralizada dos seus ativos. Nossa solução permite
        que investidores acompanhem, analisem e otimizem suas carteiras de forma
        prática, segura e eficiente.
      </p>
      <p>
        A inteligência artificial está no centro da nossa plataforma, auxiliando
        na análise de dados, identificação de oportunidades e recomendações
        personalizadas para cada perfil de investidor. Dessa forma, promovemos
        decisões mais informadas e alinhadas aos objetivos de nossos clientes.
      </p>
      <p>
        Comprometida com a transparência, segurança e inovação, a Redentia busca
        transformar a experiência de investimento no Brasil, tornando o acesso à
        gestão profissional de carteiras mais acessível e inteligente para
        todos.
      </p>
    </section>
  </NuxtLayout>
</template>

<script lang="ts" setup>
definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title: 'Sobre a Redentia | Plataforma inteligente de investimentos',
  description:
    'Entenda a missão da Redentia e como combinamos consolidação de carteira e inteligência artificial para simplificar a vida do investidor brasileiro.',
  path: '/redentia/about',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Sobre', path: '/redentia/about' },
  ],
})
</script>
