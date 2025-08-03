<template>
  <div
    class="treemap-container relative flex h-full w-full flex-col"
    @mouseleave="onMouseLeave"
  >
    <div
      :style="{ height: `${responsiveHeight}px` }"
      class="min-h-[200px] w-full"
    >
      <canvas ref="canvasRef" class="h-full w-full" />
    </div>

    <!-- Tooltip dinâmico responsivo -->
    <div
      v-if="tooltipData"
      class="pointer-events-none fixed z-50 max-w-xs rounded-lg border border-white/20 bg-black/90 px-3 py-2 backdrop-blur-md transition-all duration-150"
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

const canvasRef = ref<HTMLCanvasElement | null>(null)
const tooltipData = ref<TooltipData | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })
const rectangles = ref<Rectangle[]>([])

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

// Processa e filtra os dados
const processedData = computed(() => {
  let filteredData = [...props.data]

  // Filtra por tipo se especificado
  if (props.showPositive && !props.showNegative) {
    filteredData = filteredData.filter((item) => item.change >= 0)
  } else if (props.showNegative && !props.showPositive) {
    filteredData = filteredData.filter((item) => item.change < 0)
  }

  // Ordena por mudança percentual absoluta (maiores variações primeiro)
  filteredData.sort((a, b) => Math.abs(b.change) - Math.abs(a.change))

  // Número de itens baseado no tamanho da tela
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
  let maxItems = 15

  if (screenWidth < 640)
    maxItems = 8 // Mobile
  else if (screenWidth < 768)
    maxItems = 10 // Tablet small
  else if (screenWidth < 1024)
    maxItems = 12 // Tablet
  else maxItems = 15 // Desktop

  return filteredData.slice(0, maxItems)
})

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

// Renderiza o treemap no canvas de forma responsiva
const renderTreemap = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Força o canvas a recalcular suas dimensões
  const container = canvas.parentElement
  if (!container) return

  const containerRect = container.getBoundingClientRect()

  // Se o container não tem tamanho válido, não renderiza
  if (containerRect.width === 0 || containerRect.height === 0) return

  // Ajusta o canvas para o tamanho do container
  const dpr = window.devicePixelRatio || 1

  canvas.width = containerRect.width * dpr
  canvas.height = containerRect.height * dpr
  canvas.style.width = containerRect.width + 'px'
  canvas.style.height = containerRect.height + 'px'

  ctx.scale(dpr, dpr)

  // Limpa o canvas
  ctx.clearRect(0, 0, containerRect.width, containerRect.height)

  // Se não há dados, não renderiza
  if (processedData.value.length === 0) return

  // Cria os retângulos do treemap
  const rects = createTreemap(
    processedData.value,
    containerRect.width,
    containerRect.height
  )
  rectangles.value = rects

  // Calcula escala responsiva baseada no tamanho do container
  const baseScale = Math.min(
    containerRect.width / 800,
    containerRect.height / 400
  )
  const fontScale = Math.max(0.6, Math.min(1.2, baseScale))

  // Renderiza cada retângulo
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
    ctx.lineWidth = Math.max(1, 1.5 * fontScale)
    ctx.stroke()

    // Desenha o texto se o retângulo for grande o suficiente
    const centerX = rectItem.x + rectItem.width / 2
    const centerY = rectItem.y + rectItem.height / 2

    // Determina o tamanho da fonte baseado no tamanho do retângulo e responsividade
    const area = rectItem.width * rectItem.height
    let baseFontSize = 12
    if (area < 1500) baseFontSize = 8
    else if (area < 3000) baseFontSize = 9
    else if (area < 5000) baseFontSize = 10
    else if (area < 8000) baseFontSize = 11
    else if (area > 15000) baseFontSize = 14

    const fontSize = Math.max(8, baseFontSize * fontScale)
    const minWidth = 40 * fontScale
    const minHeight = 25 * fontScale

    if (rectItem.width > minWidth && rectItem.height > minHeight) {
      // Sombra do texto para melhor legibilidade
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.font = `bold ${fontSize}px Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Symbol com sombra
      ctx.fillText(
        rectItem.item.symbol,
        centerX + 1,
        centerY - fontSize / 2 + 1
      )

      // Change percentage com sombra
      ctx.font = `${fontSize - 2}px Inter, sans-serif`
      const changeText = `${rectItem.item.change >= 0 ? '+' : ''}${rectItem.item.change.toFixed(1)}%`
      ctx.fillText(changeText, centerX + 1, centerY + fontSize / 2 + 1)

      // Texto principal branco
      ctx.fillStyle = 'white'
      ctx.font = `bold ${fontSize}px Inter, sans-serif`

      // Symbol
      ctx.fillText(rectItem.item.symbol, centerX, centerY - fontSize / 2)

      // Change percentage
      ctx.font = `${fontSize - 2}px Inter, sans-serif`
      ctx.fillText(changeText, centerX, centerY + fontSize / 2)

      // Preço se houver espaço suficiente
      const minHeightForPrice = 50 * fontScale
      if (
        rectItem.height > minHeightForPrice &&
        rectItem.width > 60 * fontScale
      ) {
        ctx.font = `${fontSize - 3}px Inter, sans-serif`
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.fillText(
          `R$ ${rectItem.item.price.toFixed(2)}`,
          centerX,
          centerY + fontSize + 5
        )
      }
    }
  })
}

// Event handlers
const handleMouseMove = (event: MouseEvent) => {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // Encontra o retângulo sob o mouse
  const hoveredRect = rectangles.value.find(
    (r) => x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height
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

// Lifecycle
onMounted(async () => {
  await nextTick()

  const canvas = canvasRef.value
  if (canvas) {
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', onMouseLeave)
  }

  // Inicializa o tamanho da janela
  updateWindowSize()

  // Renderiza inicialmente
  renderTreemap()

  // Sistema de resize simplificado e eficaz
  let resizeTimeout: NodeJS.Timeout | null = null

  const handleResize = () => {
    // Cancela timeout anterior se existir
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }

    // Agenda nova renderização
    resizeTimeout = setTimeout(() => {
      if (updateWindowSize()) {
        renderTreemap()
      }
    }, 250)
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
    if (canvas) {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', onMouseLeave)
    }
  })
})

// Observa mudanças nos dados
watch(
  () => processedData.value,
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
</style>
