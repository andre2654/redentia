<template>
  <NuxtLayout name="static" title="Glossário Financeiro">
    <div class="flex flex-col gap-8 px-6 py-8">
      <!-- Header -->
      <section class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-book-open" class="text-secondary h-8 w-8" />
          <h1 class="text-3xl font-bold md:text-4xl">Glossário Financeiro</h1>
        </div>
        <p class="text-base text-gray-400 md:text-lg">
          Aprenda mais de 200 termos essenciais sobre investimentos, ações, FIIs
          e mercado financeiro. Definições claras e exemplos práticos.
        </p>
      </section>

      <!-- Termo do Dia -->
      <section
        v-if="termoDoDia"
        class="bg-secondary/10 border-secondary rounded-3xl border p-6"
      >
        <div class="mb-3 flex items-center gap-2">
          <UIcon name="i-lucide-star" class="text-secondary h-5 w-5" />
          <h2 class="text-secondary text-lg font-semibold">Termo do Dia</h2>
        </div>
        <NuxtLink
          :to="`/glossario/${termoDoDia.slug}`"
          class="group flex flex-col gap-3"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-2xl font-bold group-hover:text-secondary">
              {{ termoDoDia.nome }}
              <span v-if="termoDoDia.sigla" class="text-gray-400">
                ({{ termoDoDia.sigla }})
              </span>
            </h3>
            <UIcon
              name="i-lucide-arrow-right"
              class="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            />
          </div>
          <p class="text-gray-300">{{ termoDoDia.definicaoResumida }}</p>
          <UButton
            color="secondary"
            variant="soft"
            size="sm"
            class="w-fit"
            icon="i-lucide-book-open"
          >
            Ler definição completa
          </UButton>
        </NuxtLink>
      </section>

      <!-- Busca e Filtros -->
      <section class="flex flex-col gap-4">
        <AtomsFormInput
          v-model="busca"
          placeholder="Buscar termo... (ex: dividend yield, P/L, ROE)"
          size="lg"
          icon="i-lucide-search"
          class="w-full"
        />

        <!-- Filtro por Categoria -->
        <div class="flex flex-wrap gap-2">
          <UButton
            color="neutral"
            :variant="filtroCategoria === 'todos' ? 'soft' : 'ghost'"
            size="sm"
            @click="filtroCategoria = 'todos'"
          >
            Todos ({{ termos.length }})
          </UButton>
          <UButton
            v-for="cat in categorias"
            :key="cat.key"
            color="neutral"
            :variant="filtroCategoria === cat.key ? 'soft' : 'ghost'"
            size="sm"
            :icon="cat.icon"
            @click="filtroCategoria = cat.key"
          >
            {{ cat.label }} ({{ encontrarTermosPorCategoria(cat.key).length }})
          </UButton>
        </div>
      </section>

      <!-- Navegação Alfabética -->
      <section class="flex flex-wrap gap-2">
        <UButton
          v-for="letra in alfabeto"
          :key="letra"
          color="neutral"
          :variant="filtroLetra === letra ? 'soft' : 'ghost'"
          size="sm"
          class="h-10 w-10"
          @click="filtroLetra = filtroLetra === letra ? null : letra"
        >
          {{ letra }}
        </UButton>
      </section>

      <!-- Lista de Termos -->
      <section class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">
            {{ termosFiltrados.length }} termo{{
              termosFiltrados.length !== 1 ? 's' : ''
            }}
            encontrado{{ termosFiltrados.length !== 1 ? 's' : '' }}
          </h2>
        </div>

        <div
          v-if="termosFiltrados.length > 0"
          class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <NuxtLink
            v-for="termo in termosFiltrados"
            :key="termo.slug"
            :to="`/glossario/${termo.slug}`"
            class="group rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-white/20 hover:bg-white/10"
          >
            <div class="flex flex-col gap-3">
              <div class="flex items-start justify-between">
                <div class="flex flex-col gap-1">
                  <h3
                    class="text-lg font-semibold group-hover:text-secondary transition-colors"
                  >
                    {{ termo.nome }}
                  </h3>
                  <span
                    v-if="termo.sigla"
                    class="text-secondary/70 text-sm font-medium"
                  >
                    {{ termo.sigla }}
                  </span>
                </div>
                <UBadge
                  :label="
                    categorias.find((c) => c.key === termo.categoria)?.label ||
                    'Geral'
                  "
                  color="neutral"
                  variant="subtle"
                  size="xs"
                />
              </div>
              <p class="line-clamp-3 text-sm text-gray-400">
                {{ termo.definicaoResumida }}
              </p>
              <div class="flex items-center gap-2 text-secondary text-sm">
                <span>Ler mais</span>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="h-4 w-4 transition-transform group-hover:translate-x-1"
                />
              </div>
            </div>
          </NuxtLink>
        </div>

        <div
          v-else
          class="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-12 text-center"
        >
          <UIcon name="i-lucide-search-x" class="h-12 w-12 text-gray-500" />
          <div>
            <h3 class="text-lg font-semibold text-gray-300">
              Nenhum termo encontrado
            </h3>
            <p class="text-sm text-gray-400">
              Tente ajustar os filtros ou usar outros termos de busca
            </p>
          </div>
          <UButton
            color="secondary"
            variant="soft"
            @click="limparFiltros"
          >
            Limpar filtros
          </UButton>
        </div>
      </section>
     
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { termos, categorias, encontrarTermosPorCategoria } from '~/data/glossario/termos'
import type { CategoriaGlossario } from '~/types/glossario'

// SEO
usePageSeo({
  title: 'Glossário de Investimentos: +200 Termos Explicados | Redentia',
  description:
    'Aprenda termos essenciais sobre ações, FIIs, indicadores financeiros e mercado de capitais. Definições claras, exemplos práticos e fórmulas. Glossário completo de investimentos.',
  path: '/glossario',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: termos.slice(0, 10).map((termo) => ({
        '@type': 'Question',
        name: `O que é ${termo.nome}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: termo.definicaoResumida,
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Glossário de Investimentos',
      description:
        'Glossário completo com mais de 200 termos de finanças e investimentos',
      breadcrumb: {
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
        ],
      },
    },
  ],
})

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

// Estado
const route = useRoute()
const busca = ref('')
const filtroCategoria = ref<CategoriaGlossario | 'todos'>('todos')
const filtroLetra = ref<string | null>(null)

const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

// Aplicar filtro de letra da URL se existir
onMounted(() => {
  const letraUrl = route.query.letra as string | undefined
  if (letraUrl && alfabeto.includes(letraUrl.toUpperCase())) {
    filtroLetra.value = letraUrl.toUpperCase()
  }
})

// Termo do dia (rotativo baseado no dia do ano)
const termoDoDia = computed(() => {
  const hoje = new Date()
  const inicioDoDia = new Date(hoje.getFullYear(), 0, 0)
  const diff = hoje.getTime() - inicioDoDia.getTime()
  const umDia = 1000 * 60 * 60 * 24
  const diaDoAno = Math.floor(diff / umDia)
  const indice = diaDoAno % termos.length
  return termos[indice]
})

// Filtros
const termosFiltrados = computed(() => {
  let resultado = [...termos]

  // Filtro por busca
  if (busca.value.trim()) {
    const query = busca.value.toLowerCase()
    resultado = resultado.filter(
      (t) =>
        t.nome.toLowerCase().includes(query) ||
        t.slug.includes(query) ||
        t.palavrasChave.some((p) => p.includes(query)) ||
        (t.sigla && t.sigla.toLowerCase().includes(query))
    )
  }

  // Filtro por categoria
  if (filtroCategoria.value !== 'todos') {
    resultado = resultado.filter((t) => t.categoria === filtroCategoria.value)
  }

  // Filtro por letra
  if (filtroLetra.value) {
    resultado = resultado.filter((t) =>
      t.nome.toUpperCase().startsWith(filtroLetra.value!)
    )
  }

  // Ordenar alfabeticamente
  return resultado.sort((a, b) => a.nome.localeCompare(b.nome))
})

function limparFiltros() {
  busca.value = ''
  filtroCategoria.value = 'todos'
  filtroLetra.value = null
}
</script>
