<template>
  <NuxtLayout name="static" :title="termo?.nome || 'Glossário'">
    <div v-if="termo" class="flex flex-col gap-8 px-6 py-8">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-sm text-gray-400">
        <NuxtLink to="/" class="hover:text-white transition-colors">
          Home
        </NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="h-4 w-4" />
        <NuxtLink to="/glossario" class="hover:text-white transition-colors">
          Glossário
        </NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="h-4 w-4" />
        <span class="text-white">{{ termo.nome }}</span>
      </nav>

      <!-- Header -->
      <section class="flex flex-col gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <UBadge
            :label="categoriaNome"
            color="secondary"
            variant="soft"
            size="lg"
          />
          <UBadge
            v-if="termo.sigla"
            :label="termo.sigla"
            color="neutral"
            variant="subtle"
            size="lg"
          />
        </div>
        <h1 class="text-3xl font-bold md:text-5xl">
          O que é {{ termo.nome }}?
        </h1>
      </section>

      <!-- Definição Resumida (Featured Snippet) -->
      <section
        class="from-secondary/10 to-secondary/5 rounded-3xl bg-gradient-to-br p-6 md:p-8"
      >
        <div class="flex items-start gap-4">
          <div
            class="bg-secondary/20 rounded-full p-3 max-md:hidden"
          >
            <UIcon name="i-lucide-lightbulb" class="text-secondary h-6 w-6" />
          </div>
          <div class="flex flex-col gap-3">
            <h2 class="text-xl font-semibold">Definição</h2>
            <p class="text-lg leading-relaxed text-gray-200">
              {{ termo.definicaoResumida }}
            </p>
          </div>
        </div>
      </section>

      <!-- Conteúdo Completo -->
      <section class="prose prose-invert max-w-none">
        <div class="whitespace-pre-line text-base leading-relaxed text-gray-300">
          {{ termo.definicaoCompleta }}
        </div>
      </section>

      <!-- Fórmula -->
      <section
        v-if="termo.formula"
        class="rounded-2xl border border-white/10 bg-white/5 p-6"
      >
        <div class="flex items-start gap-4">
          <div class="bg-tertiary/20 rounded-full p-3 max-md:hidden">
            <UIcon name="i-lucide-sigma" class="text-tertiary h-6 w-6" />
          </div>
          <div class="flex flex-col gap-3">
            <h2 class="text-xl font-semibold">Como Calcular</h2>
            <div
              class="bg-tertiary/10 rounded-xl border border-tertiary/20 p-4 font-mono text-lg"
            >
              {{ termo.formula }}
            </div>
          </div>
        </div>
      </section>

      <!-- Exemplo Prático -->
      <section
        v-if="termo.exemplo"
        class="rounded-2xl border border-white/10 bg-white/5 p-6"
      >
        <div class="flex items-start gap-4">
          <div class="bg-primary/20 rounded-full p-3 max-md:hidden">
            <UIcon name="i-lucide-sparkles" class="text-primary h-6 w-6" />
          </div>
          <div class="flex flex-col gap-3">
            <h2 class="text-xl font-semibold">Exemplo Prático</h2>
            <p class="leading-relaxed text-gray-300">{{ termo.exemplo }}</p>
          </div>
        </div>
      </section>

      <!-- Como Usar -->
      <section
        v-if="termo.comoUsar"
        class="rounded-2xl border border-white/10 bg-white/5 p-6"
      >
        <div class="flex items-start gap-4">
          <div class="bg-blue-500/20 rounded-full p-3 max-md:hidden">
            <UIcon name="i-lucide-compass" class="h-6 w-6 text-blue-400" />
          </div>
          <div class="flex flex-col gap-3">
            <h2 class="text-xl font-semibold">Como Usar na Prática</h2>
            <p class="leading-relaxed text-gray-300">{{ termo.comoUsar }}</p>
          </div>
        </div>
      </section>

      <!-- Atenção -->
      <section
        v-if="termo.atencao"
        class="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-6"
      >
        <div class="flex items-start gap-4">
          <div class="rounded-full bg-yellow-500/20 p-3 max-md:hidden">
            <UIcon
              name="i-lucide-alert-triangle"
              class="h-6 w-6 text-yellow-400"
            />
          </div>
          <div class="flex flex-col gap-3">
            <h2 class="text-xl font-semibold text-yellow-400">
              Pontos de Atenção
            </h2>
            <p class="leading-relaxed text-gray-300">{{ termo.atencao }}</p>
          </div>
        </div>
      </section>

      <!-- Termos Relacionados -->
      <section
        v-if="termosRelacionados.length > 0"
        class="flex flex-col gap-4"
      >
        <h2 class="text-xl font-semibold">Termos Relacionados</h2>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="relacionado in termosRelacionados"
            :key="relacionado.slug"
            :to="`/glossario/${relacionado.slug}`"
            class="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20 hover:bg-white/10"
          >
            <div class="flex flex-col gap-1">
              <span class="font-semibold group-hover:text-secondary">
                {{ relacionado.nome }}
              </span>
              <span
                v-if="relacionado.sigla"
                class="text-secondary/70 text-xs"
              >
                {{ relacionado.sigla }}
              </span>
            </div>
            <UIcon
              name="i-lucide-arrow-right"
              class="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100"
            />
          </NuxtLink>
        </div>
      </section>

      <!-- CTA -->
      <section
        class="from-secondary/20 flex flex-col gap-4 rounded-3xl bg-gradient-to-br to-transparent p-8 text-center"
      >
        <h2 class="text-2xl font-bold">
          Encontre os melhores ativos com a Redentia
        </h2>
        <p class="text-gray-300">
          Use filtros avançados, indicadores em tempo real e análises com IA
          para tomar decisões de investimento.
        </p>
        <div class="flex flex-wrap items-center justify-center gap-3">
          <UButton
            to="/search"
            color="secondary"
            size="lg"
            icon="i-lucide-search"
          >
            Buscar Ativos
          </UButton>
          <UButton
            to="/calculadora"
            color="white"
            variant="outline"
            size="lg"
            icon="i-lucide-calculator"
          >
            Calculadoras
          </UButton>
        </div>
      </section>

      <!-- Navegação (Anterior/Próximo) -->
      <section class="flex items-center justify-between border-t border-white/10 pt-6">
        <NuxtLink
          v-if="termoAnterior"
          :to="`/glossario/${termoAnterior.slug}`"
          class="group flex items-center gap-2 hover:text-secondary"
        >
          <UIcon
            name="i-lucide-chevron-left"
            class="h-5 w-5 transition-transform group-hover:-translate-x-1"
          />
          <div class="flex flex-col items-start">
            <span class="text-xs text-gray-400">Anterior</span>
            <span class="font-semibold">{{ termoAnterior.nome }}</span>
          </div>
        </NuxtLink>
        <div v-else />
        
        <NuxtLink
          v-if="termoProximo"
          :to="`/glossario/${termoProximo.slug}`"
          class="group flex items-center gap-2 hover:text-secondary"
        >
          <div class="flex flex-col items-end">
            <span class="text-xs text-gray-400">Próximo</span>
            <span class="font-semibold">{{ termoProximo.nome }}</span>
          </div>
          <UIcon
            name="i-lucide-chevron-right"
            class="h-5 w-5 transition-transform group-hover:translate-x-1"
          />
        </NuxtLink>
        <div v-else />
      </section>

      <!-- Voltar ao Glossário -->
      <section class="flex justify-center">
        <UButton
          to="/glossario"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
        >
          Voltar ao Glossário
        </UButton>
      </section>
    </div>

    <!-- Erro 404 -->
    <div v-else class="flex flex-col items-center gap-6 px-6 py-20">
      <UIcon name="i-lucide-search-x" class="h-20 w-20 text-gray-500" />
      <div class="text-center">
        <h1 class="mb-2 text-3xl font-bold">Termo não encontrado</h1>
        <p class="text-gray-400">
          O termo que você procura não existe ou foi removido.
        </p>
      </div>
      <UButton to="/glossario" color="secondary" icon="i-lucide-book-open">
        Ver todos os termos
      </UButton>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { termos, categorias, encontrarTermo } from '~/data/glossario/termos'

const route = useRoute()
const termoSlug = route.params.termo as string

// Encontrar o termo
const termo = computed(() => encontrarTermo(termoSlug))

// Se não encontrar, retornar 404
if (!termo.value) {
  throw createError({ statusCode: 404, statusMessage: 'Termo não encontrado' })
}

// Categoria nome
const categoriaNome = computed(() => {
  const cat = categorias.find((c) => c.key === termo.value?.categoria)
  return cat?.label || 'Geral'
})

// Termos relacionados
const termosRelacionados = computed(() => {
  if (!termo.value) return []
  return termo.value.relacionados
    .map((slug) => encontrarTermo(slug))
    .filter((t) => t !== undefined)
})

// Navegação (anterior/próximo)
const termosOrdenados = computed(() => {
  return [...termos].sort((a, b) => a.nome.localeCompare(b.nome))
})

const indiceAtual = computed(() => {
  return termosOrdenados.value.findIndex((t) => t.slug === termoSlug)
})

const termoAnterior = computed(() => {
  if (indiceAtual.value > 0) {
    return termosOrdenados.value[indiceAtual.value - 1]
  }
  return null
})

const termoProximo = computed(() => {
  if (indiceAtual.value < termosOrdenados.value.length - 1) {
    return termosOrdenados.value[indiceAtual.value + 1]
  }
  return null
})

// SEO
usePageSeo({
  title: () =>
    `O que é ${termo.value?.nome}${termo.value?.sigla ? ` (${termo.value.sigla})` : ''}? Definição e Como Usar | Redentia`,
  description: () => termo.value?.definicaoResumida || '',
  path: `/glossario/${termoSlug}`,
  structuredData: () => [
    {
      '@context': 'https://schema.org',
      '@type': 'DefinedTerm',
      name: termo.value?.nome,
      description: termo.value?.definicaoResumida,
      inDefinedTermSet: 'https://www.redentia.com.br/glossario',
      ...(termo.value?.sigla && { termCode: termo.value.sigla }),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `O que é ${termo.value?.nome}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: termo.value?.definicaoCompleta,
          },
        },
        ...(termo.value?.formula
          ? [
              {
                '@type': 'Question',
                name: `Como calcular ${termo.value?.nome}?`,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: `${termo.value?.nome} é calculado usando a fórmula: ${termo.value?.formula}`,
                },
              },
            ]
          : []),
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://www.redentia.com.br',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Glossário',
          item: 'https://www.redentia.com.br/glossario',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: termo.value?.nome,
          item: `https://www.redentia.com.br/glossario/${termoSlug}`,
        },
      ],
    },
  ],
})

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})
</script>
