<template>
  <div
    class="treemap-container relative flex h-full w-full flex-col"
    @mouseleave="onMouseLeave"
  >
    <!-- Layout responsivo para grupos -->
    <div
      class="flex h-full w-full flex-col lg:flex-row"
      :style="{ minHeight: `${responsiveHeight}px` }"
    >
      <!-- Grupo Ações -->
      <div
        v-if="groupedData.acoes.length > 0"
        class="group-container flex flex-1 flex-col gap-2"
      >
        <h3 class="text-[12px] font-medium text-white/80">Ações</h3>
        <div class="canvas-container relative min-h-[200px] flex-1">
          <canvas ref="canvasAcoesRef" class="h-full w-full" />
        </div>
      </div>

      <!-- Grupo FIIs -->
      <div
        v-if="groupedData.fiis.length > 0"
        class="group-container flex flex-1 flex-col gap-2"
      >
        <h3 class="text-[12px] font-medium text-white/80">FIIs</h3>
        <div class="canvas-container relative min-h-[200px] flex-1">
          <canvas ref="canvasFiisRef" class="h-full w-full" />
        </div>
      </div>

      <!-- Fallback para dados sem categoria -->
      <div
        v-if="groupedData.outros.length > 0"
        class="group-container flex flex-1 flex-col gap-2"
      >
        <div class="canvas-container relative min-h-[200px] flex-1">
          <canvas ref="canvasOutrosRef" class="h-full w-full" />
        </div>
      </div>
    </div>

    <!-- Tooltip dinâmico responsivo -->
    <div
      v-if="tooltipData"
      class="pointer-events-none fixed z-10 rounded-lg bg-black/30 px-3 py-2 backdrop-blur-md transition-all duration-150"
      :style="{
        left: `${tooltipPosition.x + 10}px`,
        top: `${tooltipPosition.y - 10}px`,
      }"
    >
      <div class="flex flex-col gap-1 text-xs text-white sm:text-sm">
        <div class="flex items-center gap-2">
          <div
            class="h-2 w-2 flex-shrink-0 rounded-sm sm:h-3 sm:w-3"
            :style="{ backgroundColor: tooltipData.color }"
          />
          <span class="truncate text-sm font-bold sm:text-base">{{
            tooltipData.symbol
          }}</span>
        </div>
        <span class="truncate text-xs text-white/80">{{
          tooltipData.name
        }}</span>
        <span class="text-sm font-semibold"
          >R$ {{ tooltipData.price.toFixed(2) }}</span
        >
        <span
          class="text-sm font-bold"
          :class="tooltipData.change >= 0 ? 'text-green-400' : 'text-red-400'"
        >
          {{ tooltipData.change >= 0 ? '+' : ''
          }}{{ tooltipData.change.toFixed(2) }}%
        </span>
        <span class="text-xs text-white/70"
          >Vol: {{ formatVolume(tooltipData.volume) }}</span
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick, watch, onUnmounted } from 'vue'

interface TreemapItem {
  symbol: string
  name: string
  price: number
  change: number
  volume: number
  marketCap?: number
  category?: 'acoes' | 'fiis' // Nova propriedade para categorização
}

interface TooltipData {
  symbol: string
  name: string
  price: number
  change: number
  volume: number
  color: string
}

interface Props {
  data: TreemapItem[]
  height?: number
  showPositive?: boolean
  showNegative?: boolean
}

interface Rectangle {
  x: number
  y: number
  width: number
  height: number
  item: TreemapItem
  color: string
  groupName?: string // Novo campo para identificar o grupo
}

const props = withDefaults(defineProps<Props>(), {
  height: 400,
  showPositive: true,
  showNegative: true,
})

// Altura responsiva baseada no tamanho da tela
const responsiveHeight = computed(() => {
  if (typeof window === 'undefined') return props.height

  // Força re-cálculo quando windowSize muda
  const _ = windowSize.value

  const screenWidth = window.innerWidth
  let baseHeight = props.height

  if (screenWidth < 640)
    baseHeight = Math.max(250, props.height * 0.6) // Mobile
  else if (screenWidth < 768)
    baseHeight = Math.max(300, props.height * 0.75) // Tablet small
  else if (screenWidth < 1024) baseHeight = Math.max(350, props.height * 0.85) // Tablet

  return baseHeight
})

// Estado reativo para forçar re-renderização
const windowSize = ref({ width: 0, height: 0 })

// Atualiza o tamanho da janela
const updateWindowSize = () => {
  if (typeof window !== 'undefined') {
    const newSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    }

    // Só atualiza se houve mudança real
    if (
      newSize.width !== windowSize.value.width ||
      newSize.height !== windowSize.value.height
    ) {
      windowSize.value = newSize
      return true
    }
  }
  return false
}

// Força re-renderização
const forceRerender = () => {
  nextTick(() => {
    renderTreemap()
  })
}

const canvasAcoesRef = ref<HTMLCanvasElement | null>(null)
const canvasFiisRef = ref<HTMLCanvasElement | null>(null)
const canvasOutrosRef = ref<HTMLCanvasElement | null>(null)
const tooltipData = ref<TooltipData | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })
const rectangles = ref<Rectangle[]>([])

// Agrupa os dados por categoria
const groupedData = computed(() => {
  let filteredData = [...props.data]

  // Filtra por tipo se especificado
  if (props.showPositive && !props.showNegative) {
    filteredData = filteredData.filter((item) => item.change >= 0)
  } else if (props.showNegative && !props.showPositive) {
    filteredData = filteredData.filter((item) => item.change < 0)
  }

  // Ordena por mudança percentual absoluta (maiores variações primeiro)
  filteredData.sort((a, b) => Math.abs(b.change) - Math.abs(a.change))

  // Agrupa por categoria
  const groups = {
    acoes: filteredData.filter((item) => item.category === 'acoes'),
    fiis: filteredData.filter((item) => item.category === 'fiis'),
    outros: filteredData.filter(
      (item) =>
        !item.category ||
        (item.category !== 'acoes' && item.category !== 'fiis')
    ),
  }

  // Número de itens baseado no tamanho da tela para cada grupo
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
  let maxItemsPerGroup = 8

  if (screenWidth < 640)
    maxItemsPerGroup = 4 // Mobile
  else if (screenWidth < 768)
    maxItemsPerGroup = 5 // Tablet small
  else if (screenWidth < 1024)
    maxItemsPerGroup = 6 // Tablet
  else maxItemsPerGroup = 8 // Desktop

  return {
    acoes: groups.acoes.slice(0, maxItemsPerGroup),
    fiis: groups.fiis.slice(0, maxItemsPerGroup),
    outros: groups.outros.slice(0, maxItemsPerGroup * 2), // Mais itens se não há categorização
  }
})

// Função para calcular a cor baseada na mudança percentual
const getColor = (change: number): string => {
  if (change >= 0) {
    // Verde para positivos - mesma cor do gráfico de linha
    const intensity = Math.min(Math.abs(change) / 15, 1) // Normaliza até 15%
    const alpha = 0.05 + intensity * 0.3 // De 20% a 60% de opacidade para o fundo
    return `rgba(4, 206, 0, ${alpha})` // #04CE00 com transparência
  } else {
    // Vermelho para negativos - mesma cor do gráfico de linha
    const intensity = Math.min(Math.abs(change) / 15, 1) // Normaliza até 15%
    const alpha = 0.05 + intensity * 0.3 // De 20% a 60% de opacidade para o fundo
    return `rgba(255, 71, 87, ${alpha})` // #FF4757 com transparência
  }
}

// Função para obter a cor da borda (sem transparência)
const getBorderColor = (change: number): string => {
  if (change >= 0) {
    return '#04CE00' // Verde sólido
  } else {
    return '#FF4757' // Vermelho sólido
  }
}

// Algoritmo de treemap squarified para layout organizado e responsivo
const createTreemap = (
  data: TreemapItem[],
  width: number,
  height: number
): Rectangle[] => {
  if (data.length === 0) return []

  // Calcula valores normalizados baseados na variação percentual
  const values = data.map((item) => Math.abs(item.change) + 1)
  const totalValue = values.reduce((sum, val) => sum + val, 0)

  // Normaliza os valores para a área total
  const normalizedValues = values.map(
    (val) => (val / totalValue) * width * height
  )

  // Cria lista de items com valores normalizados
  const items = data.map((item, index) => ({
    item,
    value: normalizedValues[index],
    color: getColor(item.change),
  }))

  // Ordena por valor (maior para menor) para melhor layout
  items.sort((a, b) => b.value - a.value)

  // Determina a orientação inicial baseada no aspect ratio
  const aspectRatio = width / height
  const initialDirection = aspectRatio > 1.2 ? width : height

  return squarify(items, [], width, height, 0, 0, initialDirection)
}

// Implementação do algoritmo squarified
const squarify = (
  items: Array<{ item: TreemapItem; value: number; color: string }>,
  row: Array<{ item: TreemapItem; value: number; color: string }>,
  w: number,
  h: number,
  x: number,
  y: number,
  dx: number
): Rectangle[] => {
  if (items.length === 0) {
    return layoutRow(row, w, h, x, y, dx)
  }

  const item = items[0]
  const newRow = [...row, item]
  const remainingItems = items.slice(1)

  if (row.length === 0 || worst(row, w) >= worst(newRow, w)) {
    return squarify(remainingItems, newRow, w, h, x, y, dx)
  } else {
    const rects = layoutRow(row, w, h, x, y, dx)
    const rowHeight = row.reduce((sum, r) => sum + r.value, 0) / dx

    if (dx === w) {
      // Layout horizontal
      return [
        ...rects,
        ...squarify(items, [], w, h - rowHeight, x, y + rowHeight, w),
      ]
    } else {
      // Layout vertical
      return [
        ...rects,
        ...squarify(
          items,
          [],
          w - rowHeight,
          h,
          x + rowHeight,
          y,
          w - rowHeight
        ),
      ]
    }
  }
}

// Calcula o pior aspect ratio de uma linha
const worst = (row: Array<{ value: number }>, w: number): number => {
  if (row.length === 0) return Infinity

  const sum = row.reduce((s, r) => s + r.value, 0)
  const min = Math.min(...row.map((r) => r.value))
  const max = Math.max(...row.map((r) => r.value))

  const s2 = sum * sum
  const w2 = w * w

  return Math.max((w2 * max) / s2, s2 / (w2 * min))
}

// Faz o layout de uma linha de retângulos
const layoutRow = (
  row: Array<{ item: TreemapItem; value: number; color: string }>,
  w: number,
  h: number,
  x: number,
  y: number,
  dx: number
): Rectangle[] => {
  if (row.length === 0) return []

  const sum = row.reduce((s, r) => s + r.value, 0)
  const rowHeight = sum / dx

  let currentX = x
  let currentY = y

  return row.map((r) => {
    const rectWidth = dx === w ? r.value / rowHeight : rowHeight
    const rectHeight = dx === w ? rowHeight : r.value / rowHeight

    const rect: Rectangle = {
      x: currentX,
      y: currentY,
      width: rectWidth,
      height: rectHeight,
      item: r.item,
      color: r.color,
    }

    if (dx === w) {
      currentX += rectWidth
    } else {
      currentY += rectHeight
    }

    return rect
  })
}

// Renderiza um treemap específico para um grupo
const renderTreemapForGroup = (
  canvas: HTMLCanvasElement,
  data: TreemapItem[],
  groupName: string
) => {
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Força o canvas a recalcular suas dimensões
  const container = canvas.parentElement
  if (!container) return

  // Aguarda um momento para garantir que o container tem dimensões corretas
  setTimeout(() => {
    const containerRect = container.getBoundingClientRect()

    // Se o container não tem tamanho válido, não renderiza
    if (containerRect.width <= 0 || containerRect.height <= 0) return

    // Ajusta o canvas para o tamanho do container
    const dpr = window.devicePixelRatio || 1

    // Garante dimensões mínimas
    const width = Math.max(200, containerRect.width)
    const height = Math.max(150, containerRect.height)

    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'

    ctx.scale(dpr, dpr)

    // Limpa o canvas
    ctx.clearRect(0, 0, width, height)

    // Se não há dados, não renderiza
    if (data.length === 0) return

    // Cria os retângulos do treemap
    const rects = createTreemap(data, width, height)

    // Remove retângulos antigos deste grupo e adiciona os novos
    rectangles.value = [
      ...rectangles.value.filter(
        (r) => !r.groupName || r.groupName !== groupName
      ),
      ...rects.map((r) => ({ ...r, groupName })),
    ]

    // Calcula escala responsiva baseada no tamanho do container
    const baseScale = Math.min(width / 400, height / 300)
    const fontScale = Math.max(0.7, Math.min(1.4, baseScale))

    // Renderiza cada retângulo com texto proporcional ao tamanho
    rects.forEach((rectItem) => {
      // Desenha o retângulo com cantos arredondados responsivos
      const borderRadius = 0

      // Preenche com a cor de fundo (com transparência)
      ctx.fillStyle = rectItem.color
      ctx.beginPath()
      ctx.roundRect(
        rectItem.x,
        rectItem.y,
        rectItem.width,
        rectItem.height,
        borderRadius
      )
      ctx.fill()

      // Desenha a borda com cor sólida (sem transparência)
      ctx.strokeStyle = getBorderColor(rectItem.item.change)
      ctx.lineWidth = Math.max(1, 2 * fontScale)
      ctx.stroke()

      // Calcula o tamanho da fonte baseado na área do retângulo (inspirado no mapa de criptos)
      const area = rectItem.width * rectItem.height
      const areaFactor = Math.sqrt(area) / 100 // Fator baseado na raiz quadrada da área

      // Tamanho base proporcional à área (como no mapa de criptos)
      const symbolFontSize = Math.max(
        10,
        Math.min(32, areaFactor * 8 * fontScale)
      )
      const changeFontSize = Math.max(8, symbolFontSize * 0.75)
      const priceFontSize = Math.max(7, symbolFontSize * 0.6)

      // Requisitos mínimos para mostrar texto
      const minWidth = 35
      const minHeight = 20
      const minAreaForPrice = 4000
      const minAreaForSymbol = 1000

      const centerX = rectItem.x + rectItem.width / 2
      const centerY = rectItem.y + rectItem.height / 2

      // Mostra texto apenas se o retângulo for grande o suficiente
      if (
        rectItem.width > minWidth &&
        rectItem.height > minHeight &&
        area > minAreaForSymbol
      ) {
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // Sombra do texto para melhor legibilidade
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'

        // Symbol com sombra (maior destaque como no mapa de criptos)
        ctx.font = `bold ${symbolFontSize}px Inter, -apple-system, sans-serif`
        ctx.fillText(
          rectItem.item.symbol,
          centerX + 1,
          centerY - changeFontSize / 2 + 1
        )

        // Change percentage com sombra
        ctx.font = `600 ${changeFontSize}px Inter, -apple-system, sans-serif`
        const changeText = `${rectItem.item.change >= 0 ? '+' : ''}${rectItem.item.change.toFixed(1)}%`
        ctx.fillText(changeText, centerX + 1, centerY + symbolFontSize / 2 + 1)

        // Texto principal branco
        ctx.fillStyle = 'white'

        // Symbol (texto principal maior)
        ctx.font = `bold ${symbolFontSize}px Inter, -apple-system, sans-serif`
        ctx.fillText(rectItem.item.symbol, centerX, centerY - changeFontSize / 2)

        // Change percentage
        ctx.font = `600 ${changeFontSize}px Inter, -apple-system, sans-serif`
        ctx.fillText(changeText, centerX, centerY + symbolFontSize / 2)

        // Preço apenas em retângulos maiores
        if (area > minAreaForPrice && rectItem.height > 60) {
          ctx.font = `500 ${priceFontSize}px Inter, -apple-system, sans-serif`
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
          ctx.fillText(
            `R$ ${rectItem.item.price.toFixed(2)}`,
            centerX,
            centerY + symbolFontSize / 2 + changeFontSize + 4
          )
        }
      }
    })
  }, 10) // Small delay to ensure container is properly sized
}

// Renderiza todos os treemaps
const renderTreemap = () => {
  // Aguarda um tick para garantir que os elementos estão prontos
  nextTick(() => {
    // Limpa os retângulos anteriores
    rectangles.value = []

    // Renderiza cada grupo se existir e tiver dados
    if (canvasAcoesRef.value && groupedData.value.acoes.length > 0) {
      renderTreemapForGroup(
        canvasAcoesRef.value,
        groupedData.value.acoes,
        'acoes'
      )
    }

    if (canvasFiisRef.value && groupedData.value.fiis.length > 0) {
      renderTreemapForGroup(canvasFiisRef.value, groupedData.value.fiis, 'fiis')
    }

    if (canvasOutrosRef.value && groupedData.value.outros.length > 0) {
      renderTreemapForGroup(
        canvasOutrosRef.value,
        groupedData.value.outros,
        'outros'
      )
    }
  })
}

// Event handlers para múltiplos canvas
const handleMouseMove = (event: MouseEvent) => {
  const target = event.target as HTMLCanvasElement
  if (!target) return

  const rect = target.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // Identifica qual canvas está sendo usado
  let targetGroupName = ''
  if (target === canvasAcoesRef.value) targetGroupName = 'acoes'
  else if (target === canvasFiisRef.value) targetGroupName = 'fiis'
  else if (target === canvasOutrosRef.value) targetGroupName = 'outros'

  // Encontra o retângulo sob o mouse APENAS no grupo correto
  const hoveredRect = rectangles.value.find(
    (r) => 
      r.groupName === targetGroupName &&
      x >= r.x && x <= r.x + r.width && 
      y >= r.y && y <= r.y + r.height
  )

  if (hoveredRect) {
    tooltipData.value = {
      symbol: hoveredRect.item.symbol,
      name: hoveredRect.item.name,
      price: hoveredRect.item.price,
      change: hoveredRect.item.change,
      volume: hoveredRect.item.volume,
      color: getBorderColor(hoveredRect.item.change), // Usa a cor sólida da borda
    }

    // Posicionamento responsivo do tooltip
    const tooltipWidth = 200 // Largura estimada do tooltip
    const tooltipHeight = 120 // Altura estimada do tooltip
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let tooltipX = event.clientX + 10
    let tooltipY = event.clientY - 10

    // Ajusta se o tooltip sair da tela à direita
    if (tooltipX + tooltipWidth > viewportWidth) {
      tooltipX = event.clientX - tooltipWidth - 10
    }

    // Ajusta se o tooltip sair da tela embaixo
    if (tooltipY + tooltipHeight > viewportHeight) {
      tooltipY = event.clientY - tooltipHeight - 10
    }

    // Ajusta se o tooltip sair da tela em cima
    if (tooltipY < 0) {
      tooltipY = event.clientY + 10
    }

    // Ajusta se o tooltip sair da tela à esquerda
    if (tooltipX < 0) {
      tooltipX = 10
    }

    tooltipPosition.value = {
      x: tooltipX,
      y: tooltipY,
    }
  } else {
    tooltipData.value = null
  }
}

const formatVolume = (volume: number): string => {
  if (volume >= 1000000000) {
    return `${(volume / 1000000000).toFixed(1)}B`
  } else if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`
  }
  return volume.toString()
}

const onMouseLeave = () => {
  tooltipData.value = null
}

// Handler melhorado para mouse leave que funciona com múltiplos canvas
const handleCanvasMouseLeave = (event: MouseEvent) => {
  // Verifica se o mouse realmente saiu do canvas e não foi para outro elemento filho
  const target = event.target as HTMLCanvasElement
  const relatedTarget = event.relatedTarget as HTMLElement
  
  // Se o mouse foi para outro canvas, não limpa o tooltip
  if (relatedTarget && (
    relatedTarget === canvasAcoesRef.value || 
    relatedTarget === canvasFiisRef.value || 
    relatedTarget === canvasOutrosRef.value
  )) {
    return
  }
  
  tooltipData.value = null
}

// Lifecycle
onMounted(async () => {
  await nextTick()

  // Adiciona event listeners para todos os canvas
  const canvases = [
    canvasAcoesRef.value,
    canvasFiisRef.value,
    canvasOutrosRef.value,
  ].filter(Boolean)

  canvases.forEach((canvas) => {
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove)
      canvas.addEventListener('mouseleave', handleCanvasMouseLeave)
    }
  })

  // Inicializa o tamanho da janela
  updateWindowSize()

  // Renderiza inicialmente
  renderTreemap()

  // Sistema de resize melhorado e mais robusto
  let resizeTimeout: NodeJS.Timeout | null = null
  let isResizing = false

  const handleResize = () => {
    // Marca que está redimensionando
    isResizing = true
    
    // Cancela timeout anterior se existir
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }

    // Agenda nova renderização com debounce
    resizeTimeout = setTimeout(() => {
      if (updateWindowSize()) {
        // Limpa tooltips durante resize
        tooltipData.value = null
        
        // Re-renderiza após um pequeno delay para garantir estabilidade
        setTimeout(() => {
          renderTreemap()
          isResizing = false
        }, 50)
      } else {
        isResizing = false
      }
    }, 300) // Increased debounce time for better stability
  }

  // Só precisa do listener principal de resize
  window.addEventListener('resize', handleResize)

  // Para dispositivos móveis
  window.addEventListener('orientationchange', () => {
    setTimeout(handleResize, 100)
  })

  // Cleanup
  onUnmounted(() => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('orientationchange', handleResize)

    canvases.forEach((canvas) => {
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove)
        canvas.removeEventListener('mouseleave', handleCanvasMouseLeave)
      }
    })
  })
})

// Observa mudanças nos dados
watch(
  () => groupedData.value,
  () => {
    nextTick(() => renderTreemap())
  },
  { deep: true }
)

// Observa mudanças no tamanho da janela para forçar re-cálculo
watch(
  () => windowSize.value,
  () => {
    nextTick(() => renderTreemap())
  },
  { deep: true }
)

// Expõe métodos para uso externo
defineExpose({
  renderTreemap: forceRerender,
  updateSize: () => {
    updateWindowSize()
    forceRerender()
  },
})
</script>

<style scoped>
.treemap-container canvas {
  cursor: pointer;
}

.canvas-container {
  border-radius: 0.375rem;
  background-color: rgba(0, 0, 0, 0.1);
}

/* Layout responsivo para grupos */
@media (max-width: 1023px) {
  .treemap-container .flex-row {
    flex-direction: column;
  }
}
</style>
