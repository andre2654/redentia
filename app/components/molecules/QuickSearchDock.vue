<!--
  MoleculesQuickSearchDock — alvo de docking pro QuickSearch global.

  Plante este componente onde quiser que o pill do QuickSearch "se
  encaixe" conforme o usuário rola. Ele:
    1. Reserva o espaço (tem altura/largura próximas do pill idle pra
       evitar layout shift quando o pill morfa pra cá).
    2. Se registra no useQuickSearchDock, que o QuickSearch consulta.
    3. Renderiza um "ghost placeholder" visualmente parecido com o
       pill idle (input + arrow). O ghost faz cross-fade conforme o
       dockProgress sobe: vai sumindo enquanto o pill real chega
       sobreposto, reaparece quando o pill sai.

  Não é interativo — o ghost é só visual. Quando o pill real está
  encaixado aqui, é ELE que recebe os cliques (transforms preservam
  hit-testing).
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { registerDock, unregisterDock, useQuickSearchDock } from '~/composables/useQuickSearchDock'

interface Props {
  /** Texto do ghost placeholder (mostrado quando o pill não está aqui). */
  placeholder?: string
  /** ID opcional pra debug / múltiplos docks. Gerado automaticamente se omitido. */
  id?: string
}
const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Pergunte algo sobre o dia.',
})

const rootEl = ref<HTMLElement | null>(null)
const dockId = ref<string>('')
const { activeDockId, dockProgress } = useQuickSearchDock()

// Cross-fade: o ghost fica 100% opaco quando o pill está longe
// (dockProgress = 0 ou outro dock está ativo), e fade pra 0 conforme
// o pill se aproxima.
const ghostOpacity = computed(() => {
  if (activeDockId.value !== dockId.value) return 1
  return Math.max(0, 1 - dockProgress.value * 1.15) // 1.15: o ghost some
                                                     // antes do progress=1
                                                     // pra não competir
                                                     // visualmente no final
})

const isFullyDocked = computed(
  () => activeDockId.value === dockId.value && dockProgress.value > 0.9,
)

onMounted(() => {
  if (!rootEl.value) return
  dockId.value = registerDock(rootEl.value, props.id)
})

onBeforeUnmount(() => {
  if (dockId.value) unregisterDock(dockId.value)
})
</script>

<template>
  <div
    ref="rootEl"
    :data-qs-dock-id="dockId"
    class="qs-dock"
    :class="{ 'qs-dock--engaged': isFullyDocked }"
    aria-hidden="true"
  >
    <!-- Ghost placeholder — visual stand-in que se dissolve quando o
         pill real chega. aria-hidden porque o real é que responde a
         input/click; o ghost só ocupa o espaço visualmente. -->
    <div
      class="qs-dock-ghost"
      :style="{ opacity: ghostOpacity }"
    >
      <UIcon name="i-lucide-sparkles" class="size-4 qs-dock-ghost-spark" />
      <span class="qs-dock-ghost-text">{{ placeholder }}</span>
      <span class="qs-dock-ghost-send">
        <UIcon name="i-lucide-arrow-up" class="size-4" />
      </span>
    </div>
  </div>
</template>

<style scoped>
/* Reserva o slot — largura igual à do pill idle (max-w-md = 28rem = 448px),
   altura ~56px que é a altura natural do pill quando idle.
   display: flex centra o pill (que vira filho deste container quando
   é teleportado pra cá). Ghost com position:absolute fica independente
   do fluxo flex (não compete com o pill teleportado). */
.qs-dock {
  position: relative;
  width: 100%;
  max-width: 448px;
  height: 56px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Ghost: visualmente parecido com o pill idle do QuickSearch (rounded-full
   pill com border + bg-elevated + ícone search à esquerda + botão arrow
   à direita). Cross-fade controlado via :style="{ opacity }". */
.qs-dock-ghost {
  position: absolute; inset: 0;
  display: flex; align-items: center; gap: 12px;
  padding: 6px 6px 6px 18px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 999px;
  color: var(--text-muted);
  font-size: 14px;
  transition: opacity 220ms cubic-bezier(0.32, 0.72, 0, 1);
  pointer-events: none;
  box-shadow: 0 1px 2px color-mix(in srgb, var(--text-heading) 4%, transparent);
}

.qs-dock-ghost-spark {
  flex-shrink: 0;
  color: var(--brand-primary);
}

.qs-dock-ghost-text {
  flex: 1;
  min-width: 0;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qs-dock-ghost-send {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: var(--text-heading);
  color: var(--bg-base);
  flex-shrink: 0;
}

/* Quando o pill REAL está encaixado aqui, o slot ganha um anel sutil
   pra reforçar a sensação de "ancorado" (visualmente o ghost já sumiu). */
.qs-dock--engaged {
  /* Sem chrome adicional por enquanto — o pill real é que está visível. */
}
</style>
