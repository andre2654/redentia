<template>
  <NuxtLayout name="static" :title="termo?.nome || 'Glossário'">
    <div v-if="termo" class="flex flex-col gap-8 px-6 py-8">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-sm" :style="{ color: brand.colors.textMuted }">
        <NuxtLink to="/" class="transition-colors hover:text-secondary">
          Home
        </NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="h-4 w-4" />
        <NuxtLink to="/glossario" class="transition-colors hover:text-secondary">
          Glossário
        </NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="h-4 w-4" />
        <span :style="{ color: brand.colors.text }">{{ termo.nome }}</span>
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
        <h1 class="text-3xl md:text-5xl" :class="[brand.font.headingWeight, brand.font.headingStyle]">
          O que é {{ termo.nome }}?
        </h1>
      </section>

      <!-- Definição Resumida (Featured Snippet) -->
      <section
        class="from-secondary/10 to-secondary/5 brand-card bg-gradient-to-br p-6 md:p-8"
      >
        <div class="flex items-start gap-4">
          <div
            class="bg-secondary/20 rounded-full p-3 max-md:hidden"
          >
            <UIcon name="i-lucide-lightbulb" class="text-secondary h-6 w-6" />
          </div>
          <div class="flex flex-col gap-3">
            <h2 class="text-[18px] font-medium" :style="{ color: brand.colors.text, letterSpacing: '-0.22px' }">Definição</h2>
            <p class="text-lg leading-relaxed" :style="{ color: brand.colors.textMuted }">
              {{ termo.definicaoResumida }}
            </p>
          </div>
        </div>
      </section>

      <!-- Conteúdo Completo -->
      <section class="prose max-w-none" :style="{ color: brand.colors.text }">
        <div class="whitespace-pre-line text-base leading-relaxed" :style="{ color: brand.colors.textMuted }">
          {{ termo.definicaoCompleta }}
        </div>
      </section>

      <!-- Fórmula -->
      <section
        v-if="termo.formula"
        class="brand-card border p-6"
        :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
      >
        <div class="flex items-start gap-4">
          <div class="bg-tertiary/20 rounded-full p-3 max-md:hidden">
            <UIcon name="i-lucide-sigma" class="text-tertiary h-6 w-6" />
          </div>
          <div class="flex flex-col gap-3">
            <h2 class="text-[18px] font-medium" :style="{ color: brand.colors.text, letterSpacing: '-0.22px' }">Como Calcular</h2>
            <div
              class="bg-tertiary/10 brand-card-md border border-tertiary/20 p-4 font-mono text-lg"
            >
              {{ termo.formula }}
            </div>
          </div>
        </div>
      </section>

      <!-- Exemplo Prático -->
      <section
        v-if="termo.exemplo"
        class="brand-card border p-6"
        :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
      >
        <div class="flex items-start gap-4">
          <div class="bg-primary/20 rounded-full p-3 max-md:hidden">
            <UIcon name="i-lucide-sparkles" class="text-primary h-6 w-6" />
          </div>
          <div class="flex flex-col gap-3">
            <h2 class="text-[18px] font-medium" :style="{ color: brand.colors.text, letterSpacing: '-0.22px' }">Exemplo Prático</h2>
            <p class="leading-relaxed" :style="{ color: brand.colors.textMuted }">{{ termo.exemplo }}</p>
          </div>
        </div>
      </section>

      <!-- Como Usar -->
      <section
        v-if="termo.comoUsar"
        class="brand-card border p-6"
        :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
      >
        <div class="flex items-start gap-4">
          <div class="bg-blue-500/20 rounded-full p-3 max-md:hidden">
            <UIcon name="i-lucide-compass" class="h-6 w-6 text-blue-400" />
          </div>
          <div class="flex flex-col gap-3">
            <h2 class="text-[18px] font-medium" :style="{ color: brand.colors.text, letterSpacing: '-0.22px' }">Como Usar na Prática</h2>
            <p class="leading-relaxed" :style="{ color: brand.colors.textMuted }">{{ termo.comoUsar }}</p>
          </div>
        </div>
      </section>

      <!-- Atenção -->
      <section
        v-if="termo.atencao"
        class="brand-card border border-yellow-500/20 bg-yellow-500/10 p-6"
      >
        <div class="flex items-start gap-4">
          <div class="rounded-full bg-yellow-500/20 p-3 max-md:hidden">
            <UIcon
              name="i-lucide-alert-triangle"
              class="h-6 w-6"
              :style="{ color: brand.colors.warning }"
            />
          </div>
          <div class="flex flex-col gap-3">
            <h2 class="text-[18px] font-medium" :style="{ color: brand.colors.warning, letterSpacing: '-0.22px' }">
              Pontos de Atenção
            </h2>
            <p class="leading-relaxed" :style="{ color: brand.colors.textMuted }">{{ termo.atencao }}</p>
          </div>
        </div>
      </section>

      <!-- Termos Relacionados -->
      <section
        v-if="termosRelacionados.length > 0"
        class="flex flex-col gap-4"
      >
        <h2 class="text-[18px] font-medium" :style="{ color: brand.colors.text, letterSpacing: '-0.22px' }">Termos Relacionados</h2>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="relacionado in termosRelacionados"
            :key="relacionado.slug"
            :to="`/glossario/${relacionado.slug}`"
            class="group flex items-center justify-between brand-card-md border p-4 transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:opacity-80"
            :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
          >
            <div class="flex flex-col gap-1">
              <span class="font-medium group-hover:text-secondary" :style="{ color: brand.colors.text }">
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

      <!-- Navegação (Anterior/Próximo) -->
      <section class="flex items-center justify-between border-t pt-6" :style="{ borderColor: brand.colors.border }">
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
            <span class="text-xs" :style="{ color: brand.colors.textMuted }">Anterior</span>
            <span class="font-medium" :style="{ color: brand.colors.text }">{{ termoAnterior.nome }}</span>
          </div>
        </NuxtLink>
        <div v-else />
        
        <NuxtLink
          v-if="termoProximo"
          :to="`/glossario/${termoProximo.slug}`"
          class="group flex items-center gap-2 hover:text-secondary"
        >
          <div class="flex flex-col items-end">
            <span class="text-xs" :style="{ color: brand.colors.textMuted }">Próximo</span>
            <span class="font-medium" :style="{ color: brand.colors.text }">{{ termoProximo.nome }}</span>
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
      <UIcon name="i-lucide-search-x" class="h-20 w-20" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }" />
      <div class="text-center">
        <h1 class="mb-2 font-light" :style="{ color: brand.colors.text, fontSize: 'clamp(22px, 3vw, 28px)', lineHeight: 1.15, letterSpacing: '-0.4px' }">Termo não encontrado</h1>
        <p :style="{ color: brand.colors.textMuted }">
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

const brand = useBrand()
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
    `O que é ${termo.value?.nome}${termo.value?.sigla ? ` (${termo.value.sigla})` : ''}? Definição e Como Usar | ${brand.name}`,
  description: () => termo.value?.definicaoResumida || '',
  path: `/glossario/${termoSlug}`,
  structuredData: () => [
    {
      '@context': 'https://schema.org',
      '@type': 'DefinedTerm',
      name: termo.value?.nome,
      description: termo.value?.definicaoResumida,
      inDefinedTermSet: `${brand.url}/glossario`,
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
          item: brand.url,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Glossário',
          item: `${brand.url}/glossario`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: termo.value?.nome,
          item: `${brand.url}/glossario/${termoSlug}`,
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
