<template>
  <div
    class="treemap-container relative flex h-full w-full flex-col"
    @mouseleave="onMouseLeave"
  >
    <div :style="{ height: `${height}px` }" class="w-full">
      <canvas ref="canvasRef" class="h-full w-full rounded-lg" />
    </div>

    <!-- Tooltip dinâmico -->
    <div
      v-if="tooltipData"
      class="pointer-events-none fixed z-10 rounded-lg border border-white/20 bg-black/90 px-3 py-2 backdrop-blur-md transition-all duration-150"
      :style="{
        left: `${tooltipPosition.x + 10}px`,
        top: `${tooltipPosition.y - 10}px`,
      }"
    >
      <div class="flex flex-col gap-1 text-white">
        <div class="flex items-center gap-2">
          <div
            class="h-3 w-3 rounded-sm"
            :style="{ backgroundColor: tooltipData.color }"
          />
          <span class="text-sm font-bold">{{ tooltipData.symbol }}</span>
        </div>
        <span class="text-xs text-white/80">{{ tooltipData.name }}</span>
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
import { computed, ref, onMounted, nextTick, watch } from 'vue'

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

const canvasRef = ref<HTMLCanvasElement | null>(null)
const tooltipData = ref<TooltipData | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })
const rectangles = ref<Rectangle[]>([])

// Função para calcular a cor baseada na mudança percentual
const getColor = (change: number): string => {
  if (change >= 0) {
    // Verde para positivos - mais intenso quanto maior a alta
    const intensity = Math.min(Math.abs(change) / 15, 1) // Normaliza até 15%
    const alpha = 0.7 + intensity * 0.3 // De 70% a 100% de opacidade
    return `rgba(34, 197, 94, ${alpha})`
  } else {
    // Vermelho para negativos - mais intenso quanto maior a queda
    const intensity = Math.min(Math.abs(change) / 15, 1) // Normaliza até 15%
    const alpha = 0.7 + intensity * 0.3 // De 70% a 100% de opacidade
    return `rgba(239, 68, 68, ${alpha})`
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

  // Pega os 15 mais relevantes para melhor visualização
  return filteredData.slice(0, 15)
})

// Algoritmo de treemap squarified para layout organizado
const createTreemap = (
  data: TreemapItem[],
  width: number,
  height: number
): Rectangle[] => {
  if (data.length === 0) return []

  // Calcula valores normalizados baseados na variação percentual
  const values = data.map(item => Math.abs(item.change) + 1)
  const totalValue = values.reduce((sum, val) => sum + val, 0)
  
  // Normaliza os valores para a área total
  const normalizedValues = values.map(val => (val / totalValue) * width * height)
  
  // Cria lista de items com valores normalizados
  const items = data.map((item, index) => ({
    item,
    value: normalizedValues[index],
    color: getColor(item.change)
  }))

  // Ordena por valor (maior para menor) para melhor layout
  items.sort((a, b) => b.value - a.value)

  return squarify(items, [], width, height, 0, 0, width)
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
        ...squarify(items, [], w, h - rowHeight, x, y + rowHeight, w)
      ]
    } else {
      // Layout vertical
      return [
        ...rects,
        ...squarify(items, [], w - rowHeight, h, x + rowHeight, y, w - rowHeight)
      ]
    }
  }
}

// Calcula o pior aspect ratio de uma linha
const worst = (
  row: Array<{ value: number }>,
  w: number
): number => {
  if (row.length === 0) return Infinity
  
  const sum = row.reduce((s, r) => s + r.value, 0)
  const min = Math.min(...row.map(r => r.value))
  const max = Math.max(...row.map(r => r.value))
  
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
  
  return row.map(r => {
    const rectWidth = dx === w ? r.value / rowHeight : rowHeight
    const rectHeight = dx === w ? rowHeight : r.value / rowHeight
    
    const rect: Rectangle = {
      x: currentX,
      y: currentY,
      width: rectWidth,
      height: rectHeight,
      item: r.item,
      color: r.color
    }
    
    if (dx === w) {
      currentX += rectWidth
    } else {
      currentY += rectHeight
    }
    
    return rect
  })
}

// Renderiza o treemap no canvas
const renderTreemap = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Ajusta o canvas para DPI
  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1

  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  canvas.style.width = rect.width + 'px'
  canvas.style.height = rect.height + 'px'

  ctx.scale(dpr, dpr)

  // Limpa o canvas
  ctx.clearRect(0, 0, rect.width, rect.height)

  // Cria os retângulos do treemap
  const rects = createTreemap(processedData.value, rect.width, rect.height)
  rectangles.value = rects

  // Renderiza cada retângulo
  rects.forEach((rectItem) => {
    // Desenha o retângulo com cantos arredondados
    ctx.fillStyle = rectItem.color
    ctx.beginPath()
    ctx.roundRect(rectItem.x, rectItem.y, rectItem.width, rectItem.height, 4)
    ctx.fill()

    // Desenha a borda
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Desenha o texto se o retângulo for grande o suficiente
    const centerX = rectItem.x + rectItem.width / 2
    const centerY = rectItem.y + rectItem.height / 2
    
    // Determina o tamanho da fonte baseado no tamanho do retângulo
    const area = rectItem.width * rectItem.height
    let fontSize = 12
    if (area < 2000) fontSize = 8
    else if (area < 5000) fontSize = 10
    else if (area > 15000) fontSize = 14

    if (rectItem.width > 50 && rectItem.height > 30) {
      // Sombra do texto para melhor legibilidade
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.font = `bold ${fontSize}px Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Symbol com sombra
      ctx.fillText(rectItem.item.symbol, centerX + 1, centerY - fontSize/2 + 1)
      
      // Change percentage com sombra
      ctx.font = `${fontSize - 2}px Inter, sans-serif`
      const changeText = `${rectItem.item.change >= 0 ? '+' : ''}${rectItem.item.change.toFixed(1)}%`
      ctx.fillText(changeText, centerX + 1, centerY + fontSize/2 + 1)

      // Texto principal branco
      ctx.fillStyle = 'white'
      ctx.font = `bold ${fontSize}px Inter, sans-serif`
      
      // Symbol
      ctx.fillText(rectItem.item.symbol, centerX, centerY - fontSize/2)
      
      // Change percentage
      ctx.font = `${fontSize - 2}px Inter, sans-serif`
      ctx.fillText(changeText, centerX, centerY + fontSize/2)
      
      // Preço se houver espaço
      if (rectItem.height > 60) {
        ctx.font = `${fontSize - 3}px Inter, sans-serif`
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.fillText(`R$ ${rectItem.item.price.toFixed(2)}`, centerX, centerY + fontSize + 5)
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
      color: hoveredRect.color,
    }

    tooltipPosition.value = {
      x: event.clientX,
      y: event.clientY,
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

  // Renderiza inicialmente
  renderTreemap()

  // Re-renderiza quando os dados mudam
  const resizeObserver = new ResizeObserver(() => {
    renderTreemap()
  })

  if (canvas) {
    resizeObserver.observe(canvas)
  }
})

// Observa mudanças nos dados
watch(
  () => processedData.value,
  () => {
    renderTreemap()
  },
  { deep: true }
)
</script>

<style scoped>
.treemap-container canvas {
  cursor: pointer;
  border-radius: 8px;
}
</style>
