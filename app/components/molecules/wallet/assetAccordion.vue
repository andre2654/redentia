<template>
  <div class="flex flex-col">
    <div
      class="flex h-[55px] w-full border-b"
      :class="{ 'light-border bg-[#535353]': opened }"
    >
      <div class="flex w-[150px] flex-col justify-center border-r px-4">
        <b class="text-[15px] font-medium"> Ações </b>
        <span class="redentia-amount text-[11px]">R$ 20.200,00</span>
      </div>
      <div class="flex items-center gap-3 px-4">
        <IconArrowFinanceUp class="w-4 fill-green-500" />
        <span class="text-[12px] font-medium text-green-500"
          >+21.01% <b class="redentia-amount">(R$ 300,00)</b> hoje</span
        >
      </div>
      <button
        class="ml-auto border-l px-6 hover:opacity-50"
        @click="opened = !opened"
      >
        <span v-if="!opened" class="text-[20px]">+</span>
        <span v-else class="text-[20px]">-</span>
      </button>
    </div>

    <UTable
      v-show="opened"
      ref="table"
      v-model:sorting="sorting"
      v-model:column-visibility="columnVisibility"
      v-model:expanded="expanded"
      v-model:global-filter="globalFilter"
      :data="data"
      :columns="columns"
      :ui="{
        root: 'bg-white/10 max-h-[400px]',
        td: 'py-3',
        th: 'whitespace-nowrap min-w-max',
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
  </div>
</template>

<script setup lang="ts">
import { resolveComponent } from 'vue'

const IconArrowFinanceUp = resolveComponent('IconArrowFinanceUp')
const IconAI = resolveComponent('IconAi')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const globalFilter = ref('petr')
const opened = ref(false)
const table = useTemplateRef('table')
const sorting = ref([
  {
    id: 'id',
    desc: false,
  },
])
const columnVisibility = ref({})
const expanded = ref({ 1: false })

const data = ref([
  {
    id: 1,
    ticker: 'PETR4',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/BB-logo1.jpg',
    name: 'Petrobras',
    quantity: 100,
    price: 30.5,
    averagePrice: 28.0,
    percentageChangeToday: 5.0,
    totalAmount: 3050.0,
    totalAmountInvested: 2800.0,
    mdi: ['jan', 'mar'],
  },
  {
    id: 1,
    ticker: 'PETR4',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/BB-logo1.jpg',
    name: 'Petrobras',
    quantity: 100,
    price: 30.5,
    averagePrice: 28.0,
    percentageChangeToday: 5.0,
    totalAmount: 3050.0,
    totalAmountInvested: 2800.0,
    mdi: ['jan', 'mar'],
  },
  {
    id: 1,
    ticker: 'PETR4',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/BB-logo1.jpg',
    name: 'Petrobras',
    quantity: 100,
    price: 30.5,
    averagePrice: 28.0,
    percentageChangeToday: 5.0,
    totalAmount: 3050.0,
    totalAmountInvested: 2800.0,
    mdi: ['jan', 'mar'],
  },
  {
    id: 1,
    ticker: 'PETR4',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/BB-logo1.jpg',
    name: 'Petrobras',
    quantity: 100,
    price: 30.5,
    averagePrice: 28.0,
    percentageChangeToday: 5.0,
    totalAmount: 3050.0,
    totalAmountInvested: 2800.0,
    mdi: ['jan', 'mar'],
  },
  {
    id: 1,
    ticker: 'PETR4',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/BB-logo1.jpg',
    name: 'Petrobras',
    quantity: 100,
    price: 30.5,
    averagePrice: 28.0,
    percentageChangeToday: 5.0,
    totalAmount: 3050.0,
    totalAmountInvested: 2800.0,
    mdi: ['jan', 'mar'],
  },
  {
    id: 1,
    ticker: 'PETR4',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/BB-logo1.jpg',
    name: 'Petrobras',
    quantity: 100,
    price: 30.5,
    averagePrice: 28.0,
    percentageChangeToday: 5.0,
    totalAmount: 3050.0,
    totalAmountInvested: 2800.0,
    mdi: ['jan', 'mar'],
  },
  {
    id: 1,
    ticker: 'PETR4',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/BB-logo1.jpg',
    name: 'Petrobras',
    quantity: 100,
    price: 30.5,
    averagePrice: 28.0,
    percentageChangeToday: 5.0,
    totalAmount: 3050.0,
    totalAmountInvested: 2800.0,
    mdi: ['jan', 'mar'],
  },
  {
    id: 1,
    ticker: 'PETR4',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/BB-logo1.jpg',
    name: 'Petrobras',
    quantity: 100,
    price: 30.5,
    averagePrice: 28.0,
    percentageChangeToday: 5.0,
    totalAmount: 3050.0,
    totalAmountInvested: 2800.0,
    mdi: ['jan', 'mar'],
  },
  {
    id: 1,
    ticker: 'PETR4',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/BB-logo1.jpg',
    name: 'Petrobras',
    quantity: 100,
    price: 30.5,
    averagePrice: 28.0,
    percentageChangeToday: 5.0,
    totalAmount: 3050.0,
    totalAmountInvested: 2800.0,
    mdi: ['jan', 'mar'],
  },
  {
    id: 1,
    ticker: 'PETR4',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/BB-logo1.jpg',
    name: 'Petrobras',
    quantity: 100,
    price: 30.5,
    averagePrice: 28.0,
    percentageChangeToday: 5.0,
    totalAmount: 3050.0,
    totalAmountInvested: 2800.0,
    mdi: ['jan', 'mar'],
  },
  {
    id: 1,
    ticker: 'PETR4',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/BB-logo1.jpg',
    name: 'Petrobras',
    quantity: 100,
    price: 30.5,
    averagePrice: 28.0,
    percentageChangeToday: 5.0,
    totalAmount: 3050.0,
    totalAmountInvested: 2800.0,
    mdi: ['jan', 'mar'],
  },
  {
    id: 1,
    ticker: 'PETR4',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/BB-logo1.jpg',
    name: 'Petrobras',
    quantity: 100,
    price: 30.5,
    averagePrice: 28.0,
    percentageChangeToday: 5.0,
    totalAmount: 3050.0,
    totalAmountInvested: 2800.0,
    mdi: ['jan', 'mar'],
  },
])

function getHeader(column: Column<Payment>, label: string) {
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
        h(
          'span',
          { class: 'text-[14px] font-medium text-white' },
          row.original.ticker
        ),
      ])
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return getHeader(column, 'Nome')
    },
    cell: ({ row }) => {
      return h(
        'span',
        { class: 'text-[12px] text-white/70' },
        row.original.name
      )
    },
  },
  {
    accessorKey: 'totalAmountInvested',
    header: ({ column }) => {
      return getHeader(column, 'Valor investido')
    },
    cell: ({ row }) => {
      return h(
        'span',
        { class: 'text-[14px] text-white' },
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(row.original.totalAmountInvested)
      )
    },
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => {
      return getHeader(column, 'Patrimônio total')
    },
    cell: ({ row }) => {
      return h(
        'span',
        { class: 'text-[14px] text-white' },
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(row.original.totalAmount)
      )
    },
    footer: () => {
      return h(
        'span',
        { class: 'text-[14px] text-white' },
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(data.value.reduce((acc, item) => acc + item.totalAmount, 0))
      )
    },
  },
  {
    accessorKey: 'percentageChangeToday',
    header: ({ column }) => {
      return getHeader(column, 'Variação')
    },
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-2' }, [
        h(IconArrowFinanceUp, {
          class: 'w-4 fill-green-500',
        }),
        h(
          'span',
          {
            class: 'text-[14px] font-medium text-green-500',
          },
          `${row.original.percentageChangeToday}% hoje`
        ),
      ])
    },
    footer: () => {
      const totalChange = data.value.reduce(
        (acc, item) => acc + item.percentageChangeToday,
        0
      )
      return h(
        'span',
        { class: 'text-[14px] text-white' },
        `${totalChange}% hoje`
      )
    },
  },
  {
    accessorKey: 'mdi',
    header: 'MDI',
    cell: ({ row }) => {
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
