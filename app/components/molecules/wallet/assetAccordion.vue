<template>
  <div class="flex flex-col">
    <button
      class="flex w-full items-center gap-6 rounded-md px-6 hover:bg-black/5 max-md:py-3 md:h-[55px] hover:dark:bg-white/5"
      :class="{ 'rounded-b-none bg-black/5 dark:bg-white/5': opened }"
      @click="opened = !opened"
    >
      <UIcon
        name="ic-round-arrow-forward-ios"
        class="transition-transform"
        :class="{
          'rotate-90': opened,
        }"
      />
      <div class="flex min-w-fit flex-col justify-center">
        <b class="text-[15px] font-medium"> Ações </b>
        <span class="redentia-amount text-[11px]">R$ 20.200,00</span>
      </div>
      <div class="flex min-w-fit items-center gap-3 px-4">
        <IconArrowFinanceUp class="w-4 fill-green-500" />
        <span class="text-[12px] font-medium text-green-500"
          >+21.01% <b class="redentia-amount max-sm:hidden">(R$ 300,00) hoje</b>
        </span>
      </div>
    </button>

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
        root: 'max-h-[400px] no-scrollbar',
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
    accessorKey: 'totalAmountInvested',
    header: ({ column }) => {
      return getHeader(column, 'Valor investido')
    },
    cell: ({ row }) => {
      return h(
        'span',
        { class: 'text-[14px]' },
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
        { class: 'text-[14px]' },
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(row.original.totalAmount)
      )
    },
    footer: () => {
      return h(
        'span',
        { class: 'text-[14px]' },
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
      return h('span', { class: 'text-[14px]' }, `${totalChange}% hoje`)
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
