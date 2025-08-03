<template>
  <section
    ref="draggableContainer"
    class="flex min-h-fit w-full select-none overflow-auto"
    :class="{
      'cursor-grabbing': isDragging,
      'cursor-grab': !isDragging,
    }"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
  >
    <slot />
  </section>
</template>

<script setup lang="ts">
const isDragging = ref(false)
const cursorPos = ref([0, 0])
const draggableContainer = ref(null)

const onMouseDown = (ev: MouseEvent) => {
  cursorPos.value = [ev.pageX, ev.pageY]
  isDragging.value = true

  window.addEventListener('mousemove', onMouseHold)
}

const onMouseUp = () => {
  window.removeEventListener('mousemove', onMouseHold)
  isDragging.value = false
}

const onMouseHold = (ev: MouseEvent) => {
  ev.preventDefault()

  requestAnimationFrame(() => {
    const delta = [ev.pageX - cursorPos.value[0], ev.pageY - cursorPos.value[1]]

    cursorPos.value = [ev.pageX, ev.pageY]

    if (!draggableContainer.value) return
    draggableContainer.value.scrollBy({
      left: -delta[0],
      top: -delta[1],
    })
  })
}

onMounted(() => {
  window.addEventListener('mouseup', onMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mouseup', onMouseUp)
})
</script>
