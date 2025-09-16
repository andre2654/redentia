<template>
  <NuxtLayout title="Visão geral" hide-search-bar>
    <div class="flex h-full flex-col pb-8 pt-6">
      <div class="flex flex-col px-6">
        <h2 class="text-[18px] font-bold">Ações e fundos imobiliarios</h2>
        <p class="text-[13px] font-extralight">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
          vulputate erat non massa tristique.
        </p>
      </div>
      <MoleculesSearchAssets class="mt-4 rounded-none border-y py-4" />
      <UTable
        ref="table"
        v-model:sorting="sorting"
        v-model:column-visibility="columnVisibility"
        v-model:expanded="expanded"
        v-model:global-filter="globalFilter"
        v-model:pagination="pagination"
        :data="data"
        :columns="columns"
        :pagination-options="{
          getPaginationRowModel: getPaginationRowModel(),
        }"
        :ui="{
          root: 'max-h-full no-scrollbar',
          td: 'py-3',
          separator: 'bg-transparent',
          tbody: 'divide-none ',
          thead: 'bg-transparent',
          tfoot: 'bg-transparent',
          th: 'whitespace-nowrap min-w-max bg-black/5 dark:bg-white/5',
        }"
        sticky
      >
        <template #expanded="{ row }">
          <pre>{{ row.original }}</pre>
        </template>
        <template #expand-header>
          <div>
            <UDropdownMenu
              :items="
                table?.tableApi
                  ?.getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => ({
                    label: column.id,
                    type: 'checkbox' as const,
                    checked: column.getIsVisible(),
                    onUpdateChecked(checked: boolean) {
                      table?.tableApi
                        ?.getColumn(column.id)
                        ?.toggleVisibility(!!checked)
                    },
                    onSelect(e?: Event) {
                      e?.preventDefault()
                    },
                  }))
              "
              :content="{ align: 'end' }"
            >
              <UButton
                color="neutral"
                variant="link"
                trailing-icon="i-lucide-ellipsis-vertical"
              />
            </UDropdownMenu>
            <UPopover>
              <UButton
                color="neutral"
                variant="link"
                trailing-icon="i-lucide-search"
              />
              <template #content>
                <AtomsFormInput
                  v-model="globalFilter"
                  placeholder="Search..."
                  class="w-[200px]"
                />
              </template>
            </UPopover>
          </div>
        </template>
      </UTable>

      <!-- Paginação -->
      <div
        v-if="data.length > 0"
        class="border-default mt-6 flex justify-center border-t pt-4"
      >
        <UPagination
          :default-page="
            (table?.tableApi?.getState().pagination.pageIndex || 0) + 1
          "
          :items-per-page="table?.tableApi?.getState().pagination.pageSize"
          :total="table?.tableApi?.getFilteredRowModel().rows.length"
          @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { IAsset } from '~/types/asset'
import { getPaginationRowModel } from '@tanstack/vue-table'
import { resolveComponent } from 'vue'

const { getAssets } = useAssetsService()

const allAssets = ref<IAsset[]>([])
const data = ref<(IAsset & { mdi: string[] })[]>([])

const IconArrowFinanceUp = resolveComponent('IconArrowFinanceUp')
const IconAI = resolveComponent('IconAi')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const globalFilter = ref('')
const table = useTemplateRef('table')
const sorting = ref([
  {
    id: 'ticker',
    desc: false,
  },
])
const columnVisibility = ref({})
const expanded = ref({})

// Paginação usando TanStack Table
const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
})

onMounted(async () => {
  allAssets.value = await getAssets()
  // Adiciona o campo mdi mockado em cada asset
  data.value = allAssets.value.map((asset) => ({
    ...asset,
    mdi: ['jan', 'mar'], // mock
  }))

  // Força uma atualização da paginação após carregar os dados
  await nextTick()
  if (table.value?.tableApi) {
    table.value.tableApi.setPageIndex(0)
  }
})

function getHeader(column: any, label: string) {
  const isSorted = column.getIsSorted()

  return h(
    UDropdownMenu,
    {
      content: {
        align: 'start',
      },
      'aria-label': 'Actions dropdown',
      items: [
        {
          label: 'Asc',
          type: 'checkbox',
          icon: 'i-lucide-arrow-up-narrow-wide',
          checked: isSorted === 'asc',
          onSelect: () => {
            if (isSorted === 'asc') {
              column.clearSorting()
            } else {
              column.toggleSorting(false)
            }
          },
        },
        {
          label: 'Desc',
          icon: 'i-lucide-arrow-down-wide-narrow',
          type: 'checkbox',
          checked: isSorted === 'desc',
          onSelect: () => {
            if (isSorted === 'desc') {
              column.clearSorting()
            } else {
              column.toggleSorting(true)
            }
          },
        },
      ],
    },
    () =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label,
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5 data-[state=open]:bg-elevated',
        'aria-label': `Sort by ${isSorted === 'asc' ? 'descending' : 'ascending'}`,
      })
  )
}

const columns = ref([
  {
    id: 'expand',
    cell: ({ row }) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        icon: 'i-lucide-chevron-down',
        square: true,
        'aria-label': 'Expand',
        ui: {
          leadingIcon: [
            'transition-transform',
            row.getIsExpanded() ? 'duration-200 rotate-180' : '',
          ],
        },
        onClick: () => row.toggleExpanded(),
      }),
  },
  {
    accessorKey: 'ticker',
    header: ({ column }) => {
      return getHeader(column, 'Ticker')
    },
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-2' }, [
        h('img', {
          src: row.original.logo,
          class: 'pointer-events-none h-6 w-6 select-none rounded object-cover',
        }),
        h('span', { class: 'text-[14px] font-medium' }, row.original.ticker),
      ])
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return getHeader(column, 'Nome')
    },
    cell: ({ row }) => {
      return h('span', { class: 'text-[12px] opacity-70' }, row.original.name)
    },
  },
  {
    accessorKey: 'market_cap',
    header: ({ column }) => {
      return getHeader(column, 'Market Cap')
    },
    cell: ({ row }) => {
      return h(
        'span',
        { class: 'text-[14px]' },
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          maximumFractionDigits: 0,
        }).format(row.original.market_cap)
      )
    },
  },
  {
    accessorKey: 'market_price',
    header: ({ column }) => {
      return getHeader(column, 'Preço')
    },
    cell: ({ row }) => {
      return h(
        'span',
        { class: 'text-[14px]' },
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(row.original.market_price)
      )
    },
  },
  {
    accessorKey: 'change_percent',
    header: ({ column }) => {
      return getHeader(column, 'Variação')
    },
    cell: ({ row }) => {
      const change_percent = row.original.change_percent
      return h('div', { class: 'flex items-center gap-2' }, [
        h(IconArrowFinanceUp, {
          class: `w-4 ${change_percent >= 0 ? 'fill-primary' : 'fill-red-500 rotate-180'}`,
        }),
        h(
          'span',
          {
            class: `text-[14px] font-medium ${change_percent >= 0 ? 'text-primary' : 'text-red-500'}`,
          },
          `${change_percent >= 0 ? '+' : ''}${change_percent?.toFixed(2)}% hoje`
        ),
      ])
    },
  },
  {
    accessorKey: 'mdi',
    header: 'MDI',
    cell: ({ row: _row }) => {
      return h(
        'div',
        {
          class: 'flex items-center gap-2',
        },
        [
          h(IconAI, {
            class: 'h-auto w-5 fill-secondary',
          }),
          h(
            'span',
            {
              class: 'text-[13px] text-secondary',
            },
            'Próximo mês'
          ),
        ]
      )
    },
  },
])
</script>
