<template>
  <div
    class="treemap-container relative flex h-full w-full flex-col"
    @mouseleave="onMouseLeave"
  >
    <!-- Layout responsivo para grupos -->
    <div
      class="flex h-full w-full flex-col gap-5 lg:flex-row"
      :style="{ minHeight: `${responsiveHeight}px` }"
    >
      <!-- Grupo Ações -->
      <div
        v-if="groupedData.acoes.length > 0"
        class="group-container flex flex-1 flex-col gap-2"
      >
        <h3 class="mb-3 px-6 text-[16px] font-bold">AÇÕES</h3>
        <div class="canvas-container relative min-h-[200px] flex-1">
          <canvas ref="canvasAcoesRef" class="h-full w-full" />
        </div>
      </div>

      <!-- Grupo FIIs -->
      <div
        v-if="groupedData.fiis.length > 0"
        class="group-container flex flex-1 flex-col gap-2"
      >
        <h3 class="mb-3 px-6 text-[16px] font-bold">FII</h3>
        <div class="canvas-container relative min-h-[200px] flex-1">
          <canvas ref="canvasFiisRef" class="h-full w-full" />
        </div>
      </div>

      <!-- Fallback para dados sem categoria -->
      <div
        v-if="groupedData.outros.length > 0"
        class="group-container flex flex-1 flex-col gap-2"
      >
        <div class="canvas-container relative min-h-[350px] flex-1">
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
      <div class="flex flex-col gap-1 text-xs sm:text-sm">
        <div class="flex items-center gap-2">
          <div
            class="h-2 w-2 flex-shrink-0 rounded-sm sm:h-3 sm:w-3"
            :style="{ backgroundColor: tooltipData.color }"
          />
          <span class="truncate text-sm font-bold sm:text-base">{{
            tooltipData.symbol
          }}</span>
        </div>
        <span class="truncate text-xs">{{ tooltipData.name }}</span>
        <span class="text-sm font-semibold"
          >R$ {{ tooltipData.price.toFixed(2) }}</span
        >
        <span
          class="text-sm font-bold"
          :class="tooltipData.change >= 0 ? 'text-primary' : 'text-red-400'"
        >
          {{ tooltipData.change >= 0 ? '+' : ''
          }}{{ tooltipData.change.toFixed(2) }}%
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { ChartColors, rgba } from '~/design/chartColors'

interface TreemapItem {
  symbol: string
  name: string
  price: number
  change: number
  marketCap?: number
  category?: 'acoes' | 'fiis' // Nova propriedade para categorização
}

interface TooltipData {
  symbol: string
  name: string
  price: number
  change: number
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
  height: 600,
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

      // Força limpeza de cache de layout
      nextTick(() => {
        // Força recálculo de todos os containers
        const containers = [
          canvasAcoesRef.value?.parentElement,
          canvasFiisRef.value?.parentElement,
          canvasOutrosRef.value?.parentElement,
        ].filter(Boolean)

        containers.forEach((container) => {
          if (container) {
            const display = container.style.display
            container.style.display = 'none'
            void container.offsetHeight
            container.style.display = display || ''
          }
        })
      })

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
const hoveredRectangle = ref<Rectangle | null>(null)

// Estados de animação
const isAnimating = ref(false)
const animationProgress = ref(0)
const animationDuration = 1000 // 1 segundo

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
  let maxItemsPerGroup = 12

  if (screenWidth < 640)
    maxItemsPerGroup = 8 // Mobile
  else if (screenWidth < 768)
    maxItemsPerGroup = 12 // Tablet small
  else if (screenWidth < 1024)
    maxItemsPerGroup = 12 // Tablet
  else maxItemsPerGroup = 12 // Desktop

  return {
    acoes: groups.acoes.slice(0, maxItemsPerGroup),
    fiis: groups.fiis.slice(0, maxItemsPerGroup),
    outros: groups.outros.slice(0, maxItemsPerGroup * 2), // Mais itens se não há categorização
  }
})

// Função para calcular a cor baseada na mudança percentual
const getColor = (change: number): string => {
  if (change >= 0) {
    // Verde para positivos
    const intensity = Math.min(Math.abs(change) / 15, 1) // Normaliza até 15%
    const alpha = 0.05 + intensity * 0.3 // De 20% a 60% de opacidade para o fundo
    return rgba(ChartColors.positive, alpha)
  } else {
    // Vermelho para negativos
    const intensity = Math.min(Math.abs(change) / 15, 1) // Normaliza até 15%
    const alpha = 0.05 + intensity * 0.3 // De 20% a 60% de opacidade para o fundo
    return rgba(ChartColors.negative, alpha)
  }
}

// Função para obter a cor da borda (sem transparência)
const getBorderColor = (change: number): string => {
  if (change >= 0) {
    return ChartColors.positive
  } else {
    return ChartColors.negative
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
    value: normalizedValues[index] || 0,
    color: getColor(item.change),
  }))

  // Ordena por valor (maior para menor) para melhor layout
  items.sort((a, b) => (b.value || 0) - (a.value || 0))

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
  if (!item) return layoutRow(row, w, h, x, y, dx)

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

// Função de easing para animações suaves
const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3)
}

// Função para animar os retângulos
const animateRectangles = (
  ctx: CanvasRenderingContext2D,
  rects: Rectangle[],
  width: number,
  height: number,
  fontScale: number,
  progress: number
) => {
  rects.forEach((rectItem, index) => {
    // Delay escalonado para cada retângulo
    const delay = index * 0.05
    const adjustedProgress = Math.max(
      0,
      Math.min(1, (progress - delay) / (1 - delay))
    )
    const itemProgress = easeOutCubic(adjustedProgress)

    if (adjustedProgress <= 0) return

    // Para a animação, mantemos as posições originais e apenas animamos a escala
    const scaleProgress = itemProgress
    let opacity = itemProgress

    // Aplica efeito de hover - reduz opacidade se outro retângulo está sendo hovered
    if (hoveredRectangle.value && hoveredRectangle.value !== rectItem) {
      opacity *= 0.3 // Reduz para 30% da opacidade normal
    }

    if (rectItem.width > 0 && rectItem.height > 0) {
      // Salva o estado do contexto
      ctx.save()

      // Desenha o retângulo mantendo a posição original
      const borderRadius = 0

      // Preenche com a cor de fundo (com transparência animada)
      const originalColor = rectItem.color
      const rgbaMatch = originalColor.match(/rgba?\(([^)]+)\)/)

      if (rgbaMatch && rgbaMatch[1]) {
        const values = rgbaMatch[1].split(',').map((v) => v.trim())
        if (values.length >= 3) {
          const alphaValue = values[3]
          const alpha =
            values.length === 4 && alphaValue
              ? parseFloat(alphaValue) * opacity
              : opacity
          ctx.fillStyle = `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${alpha})`
        }
      } else {
        ctx.fillStyle = originalColor
        ctx.globalAlpha = opacity
      }

      // Aplica transformação de escala no centro do retângulo
      const centerX = rectItem.x + rectItem.width / 2
      const centerY = rectItem.y + rectItem.height / 2

      ctx.translate(centerX, centerY)
      ctx.scale(scaleProgress, scaleProgress)
      ctx.translate(-centerX, -centerY)

      ctx.beginPath()
      ctx.roundRect(
        rectItem.x,
        rectItem.y,
        rectItem.width,
        rectItem.height,
        borderRadius
      )
      ctx.fill()

      // Desenha a borda com cor sólida
      const borderColor = getBorderColor(rectItem.item.change)
      ctx.strokeStyle = borderColor
      ctx.globalAlpha = opacity
      ctx.stroke()

      // Renderiza texto sempre (sem animação de opacidade)
      // Calcula o tamanho da fonte baseado na área do retângulo
      const area = rectItem.width * rectItem.height
      const areaFactor = Math.sqrt(area) / 100

      const symbolFontSize = Math.max(
        10,
        Math.min(32, areaFactor * 8 * fontScale)
      )
      const changeFontSize = Math.max(8, symbolFontSize * 0.75)
      const priceFontSize = Math.max(7, symbolFontSize * 0.6)

      const minWidth = 35
      const minHeight = 20
      const minAreaForPrice = 4000
      const minAreaForSymbol = 1000

      const textCenterX = rectItem.x + rectItem.width / 2
      const textCenterY = rectItem.y + rectItem.height / 2

      // Mostra texto apenas se o retângulo for grande o suficiente
      if (
        rectItem.width > minWidth &&
        rectItem.height > minHeight &&
        area > minAreaForSymbol
      ) {
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // Sombra do texto para melhor legibilidade (com opacidade ajustada pelo hover)
        ctx.globalAlpha = 0.5 * opacity
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'

        // Symbol com sombra
        ctx.font = `bold ${symbolFontSize}px Inter, -apple-system, sans-serif`
        ctx.fillText(
          rectItem.item.symbol,
          textCenterX + 1,
          textCenterY - changeFontSize / 2 + 1
        )

        // Change percentage com sombra
        ctx.font = `600 ${changeFontSize}px Inter, -apple-system, sans-serif`
        const changeText = `${rectItem.item.change >= 0 ? '+' : ''}${rectItem.item.change.toFixed(1)}%`
        ctx.fillText(
          changeText,
          textCenterX + 1,
          textCenterY + symbolFontSize / 2 + 1
        )

        // Texto principal branco (com opacidade ajustada pelo hover)
        ctx.globalAlpha = opacity
        ctx.fillStyle = 'white'

        // Symbol (texto principal maior)
        ctx.font = `bold ${symbolFontSize}px Inter, -apple-system, sans-serif`
        ctx.fillText(
          rectItem.item.symbol,
          textCenterX,
          textCenterY - changeFontSize / 2
        )

        // Change percentage
        ctx.font = `600 ${changeFontSize}px Inter, -apple-system, sans-serif`
        ctx.fillText(changeText, textCenterX, textCenterY + symbolFontSize / 2)

        // Preço apenas em retângulos maiores (com opacidade ajustada pelo hover)
        if (area > minAreaForPrice && rectItem.height > 60) {
          ctx.font = `500 ${priceFontSize}px Inter, -apple-system, sans-serif`
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
          ctx.globalAlpha = 0.8 * opacity
          ctx.fillText(
            `R$ ${rectItem.item.price.toFixed(2)}`,
            textCenterX,
            textCenterY + symbolFontSize / 2 + changeFontSize + 4
          )
        }
      }

      // Restaura o estado do contexto
      ctx.restore()
    }
  })
}

// Renderiza um treemap específico para um grupo (versão estática para hover)
const renderTreemapForGroupStatic = (
  canvas: HTMLCanvasElement,
  data: TreemapItem[],
  groupName: string
) => {
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const container = canvas.parentElement
  if (!container) return

  const containerRect = container.getBoundingClientRect()
  if (containerRect.width <= 0 || containerRect.height <= 0) return

  const width = Math.floor(containerRect.width)
  const height = Math.floor(containerRect.height)

  if (width <= 0 || height <= 0) return

  // Usa as dimensões já configuradas do canvas
  ctx.clearRect(0, 0, width, height)

  if (data.length === 0) return

  // Busca os retângulos já criados para este grupo
  const groupRects = rectangles.value.filter((r) => r.groupName === groupName)
  if (groupRects.length === 0) return

  // Calcula escala responsiva
  const baseScale = Math.min(width / 400, height / 300)
  const fontScale = Math.max(0.7, Math.min(1.4, baseScale))

  // Renderiza sem animação (progress = 1)
  animateRectangles(ctx, groupRects, width, height, fontScale, 1)
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

  // Força o recálculo das dimensões do container
  const forceReflow = () => {
    // Limpa estilos inline que podem estar interferindo
    canvas.style.width = ''
    canvas.style.height = ''
    container.style.display = 'none'
    void container.offsetHeight // Força reflow
    container.style.display = ''
  }

  // Para resize aumentando, força um reflow
  forceReflow()

  // Aguarda um momento para garantir que o container tem dimensões corretas
  requestAnimationFrame(() => {
    // Aguarda mais um frame para garantir estabilidade
    requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect()

      // Se o container não tem tamanho válido, tenta novamente após um delay
      if (containerRect.width <= 0 || containerRect.height <= 0) {
        setTimeout(() => renderTreemapForGroup(canvas, data, groupName), 100)
        return
      }

      // Ajusta o canvas para o tamanho do container com margem de segurança
      const dpr = window.devicePixelRatio || 1

      // Usa as dimensões exatas do container (sem adicionar dimensões mínimas)
      const width = Math.floor(containerRect.width)
      const height = Math.floor(containerRect.height)

      // Garante que as dimensões são válidas
      if (width <= 0 || height <= 0) return

      // Limpa qualquer transformação anterior
      ctx.setTransform(1, 0, 0, 1, 0, 0)

      // Define as dimensões do canvas
      canvas.width = width * dpr
      canvas.height = height * dpr

      // IMPORTANTE: Define o tamanho CSS do canvas para corresponder exatamente ao container
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'

      // Aplica a escala para dispositivos de alta densidade
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

      // Inicia animação
      isAnimating.value = true
      animationProgress.value = 0

      // Limpa tooltip durante animação
      tooltipData.value = null

      const startTime = Date.now()

      const renderFrame = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / animationDuration, 1)

        animationProgress.value = progress

        // Limpa o canvas
        ctx.clearRect(0, 0, width, height)

        if (progress < 1) {
          // Renderiza com animação
          animateRectangles(ctx, rects, width, height, fontScale, progress)
          requestAnimationFrame(renderFrame)
        } else {
          // Renderização final sem animação
          isAnimating.value = false
          animationProgress.value = 1
          animateRectangles(ctx, rects, width, height, fontScale, 1)
        }
      }

      // Inicia a animação
      renderFrame()
    })
  })
}

// Renderiza todos os treemaps
const renderTreemap = () => {
  // Aguarda um tick para garantir que os elementos estão prontos
  nextTick(() => {
    // Limpa os retângulos anteriores
    rectangles.value = []

    // Aguarda mais um frame para garantir que o layout foi atualizado
    requestAnimationFrame(() => {
      // Renderiza cada grupo se existir e tiver dados
      if (canvasAcoesRef.value && groupedData.value.acoes.length > 0) {
        renderTreemapForGroup(
          canvasAcoesRef.value,
          groupedData.value.acoes,
          'acoes'
        )
      }

      if (canvasFiisRef.value && groupedData.value.fiis.length > 0) {
        renderTreemapForGroup(
          canvasFiisRef.value,
          groupedData.value.fiis,
          'fiis'
        )
      }

      if (canvasOutrosRef.value && groupedData.value.outros.length > 0) {
        renderTreemapForGroup(
          canvasOutrosRef.value,
          groupedData.value.outros,
          'outros'
        )
      }
    })
  })
}

// Event handlers para múltiplos canvas
const handleMouseMove = (event: MouseEvent) => {
  // Se está animando, não processa hover para evitar bugs de posicionamento
  if (isAnimating.value) return

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
      x >= r.x &&
      x <= r.x + r.width &&
      y >= r.y &&
      y <= r.y + r.height
  )

  // Atualiza o estado do hover
  const prevHoveredRect = hoveredRectangle.value
  hoveredRectangle.value = hoveredRect || null

  // Se mudou o hover, força re-renderização de todos os grupos
  if (prevHoveredRect !== hoveredRectangle.value) {
    requestAnimationFrame(() => {
      // Re-renderiza todos os grupos para aplicar o efeito de hover globalmente
      if (canvasAcoesRef.value && groupedData.value.acoes.length > 0) {
        renderTreemapForGroupStatic(
          canvasAcoesRef.value,
          groupedData.value.acoes,
          'acoes'
        )
      }
      if (canvasFiisRef.value && groupedData.value.fiis.length > 0) {
        renderTreemapForGroupStatic(
          canvasFiisRef.value,
          groupedData.value.fiis,
          'fiis'
        )
      }
      if (canvasOutrosRef.value && groupedData.value.outros.length > 0) {
        renderTreemapForGroupStatic(
          canvasOutrosRef.value,
          groupedData.value.outros,
          'outros'
        )
      }
    })
  }

  if (hoveredRect) {
    tooltipData.value = {
      symbol: hoveredRect.item.symbol,
      name: hoveredRect.item.name,
      price: hoveredRect.item.price,
      change: hoveredRect.item.change,
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

const onMouseLeave = () => {
  tooltipData.value = null
  hoveredRectangle.value = null

  // Re-renderiza todos os grupos para remover o efeito de hover
  requestAnimationFrame(() => {
    if (canvasAcoesRef.value && groupedData.value.acoes.length > 0) {
      renderTreemapForGroupStatic(
        canvasAcoesRef.value,
        groupedData.value.acoes,
        'acoes'
      )
    }
    if (canvasFiisRef.value && groupedData.value.fiis.length > 0) {
      renderTreemapForGroupStatic(
        canvasFiisRef.value,
        groupedData.value.fiis,
        'fiis'
      )
    }
    if (canvasOutrosRef.value && groupedData.value.outros.length > 0) {
      renderTreemapForGroupStatic(
        canvasOutrosRef.value,
        groupedData.value.outros,
        'outros'
      )
    }
  })
}

// Handler para scroll - oculta tooltip durante scroll
const onScroll = () => {
  tooltipData.value = null
}

// Handler melhorado para mouse leave que funciona com múltiplos canvas
const handleCanvasMouseLeave = (event: MouseEvent) => {
  // Verifica se o mouse realmente saiu do canvas e não foi para outro elemento filho
  const relatedTarget = event.relatedTarget as HTMLElement

  // Se o mouse foi para outro canvas, não limpa o tooltip
  if (
    relatedTarget &&
    (relatedTarget === canvasAcoesRef.value ||
      relatedTarget === canvasFiisRef.value ||
      relatedTarget === canvasOutrosRef.value)
  ) {
    return
  }

  tooltipData.value = null
  hoveredRectangle.value = null

  // Re-renderiza todos os grupos para remover o efeito de hover
  requestAnimationFrame(() => {
    if (canvasAcoesRef.value && groupedData.value.acoes.length > 0) {
      renderTreemapForGroupStatic(
        canvasAcoesRef.value,
        groupedData.value.acoes,
        'acoes'
      )
    }
    if (canvasFiisRef.value && groupedData.value.fiis.length > 0) {
      renderTreemapForGroupStatic(
        canvasFiisRef.value,
        groupedData.value.fiis,
        'fiis'
      )
    }
    if (canvasOutrosRef.value && groupedData.value.outros.length > 0) {
      renderTreemapForGroupStatic(
        canvasOutrosRef.value,
        groupedData.value.outros,
        'outros'
      )
    }
  })
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

  // Adiciona listener de scroll para ocultar tooltip
  window.addEventListener('scroll', onScroll, { passive: true })

  // Inicializa o tamanho da janela
  updateWindowSize()

  // Renderiza inicialmente
  renderTreemap()

  // Sistema de resize melhorado e mais robusto
  let resizeTimeout: NodeJS.Timeout | null = null

  const handleResize = () => {
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
        }, 50)
      }
    }, 200) // Debounce time otimizado para responsividade
  }

  // Observer para mudanças de tamanho dos containers
  let resizeObserver: ResizeObserver | null = null

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver((entries) => {
      // Verifica se alguma entrada teve mudança real de tamanho
      const hasRealChange = entries.some((entry) => {
        const { width, height } = entry.contentRect
        return width > 0 && height > 0
      })

      if (hasRealChange) {
        handleResize()
      }
    })

    // Observa todos os containers de canvas
    const containers = [
      canvasAcoesRef.value?.parentElement,
      canvasFiisRef.value?.parentElement,
      canvasOutrosRef.value?.parentElement,
    ].filter(Boolean) as Element[]

    containers.forEach((container) => {
      if (resizeObserver) {
        resizeObserver.observe(container)
      }
    })
  }

  // Listeners de window como fallback
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

    if (resizeObserver) {
      resizeObserver.disconnect()
    }

    window.removeEventListener('resize', handleResize)
    window.removeEventListener('orientationchange', handleResize)
    window.removeEventListener('scroll', onScroll)

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
  /* Garante que o canvas não extrapole o container */
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.canvas-container {
  overflow: hidden;
  position: relative;
}

.group-container {
  /* Garante que cada grupo respeite seus limites */
  overflow: hidden;
  min-width: 0;
  min-height: 0;
}

/* Animações de entrada */
.canvas-container {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Layout responsivo para grupos */
@media (max-width: 1023px) {
  .treemap-container .flex-row {
    flex-direction: column;
  }
}
</style>
