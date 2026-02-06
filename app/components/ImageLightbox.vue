<script setup lang="ts">
interface Props {
  photos: readonly {
    readonly key: string
    readonly url: string
    readonly lastModified: string
    readonly size: number
    readonly etag: string
  }[]
  currentIndex: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  navigate: [index: number]
}>()

// State
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const startTranslateX = ref(0)
const startTranslateY = ref(0)

const currentPhoto = computed(() => props.photos[props.currentIndex])
const hasPrevious = computed(() => props.currentIndex > 0)
const hasNext = computed(() => props.currentIndex < props.photos.length - 1)

// Reset transform when photo changes
watch(() => props.currentIndex, () => {
  resetTransform()
})

function resetTransform() {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

function zoomIn() {
  scale.value = Math.min(scale.value + 0.5, 5)
}

function zoomOut() {
  scale.value = Math.max(scale.value - 0.5, 0.5)
  // Reset pan if zoomed out to original size
  if (scale.value === 1) {
    translateX.value = 0
    translateY.value = 0
  }
}

function previous() {
  if (hasPrevious.value) {
    emit('navigate', props.currentIndex - 1)
  }
}

function next() {
  if (hasNext.value) {
    emit('navigate', props.currentIndex + 1)
  }
}

function close() {
  emit('close')
}

// Drag to pan
function startDrag(e: MouseEvent | TouchEvent) {
  if (scale.value <= 1) return // Only allow pan when zoomed in
  
  isDragging.value = true
  
  if (e instanceof MouseEvent) {
    dragStartX.value = e.clientX
    dragStartY.value = e.clientY
  } else {
    dragStartX.value = e.touches[0].clientX
    dragStartY.value = e.touches[0].clientY
  }
  
  startTranslateX.value = translateX.value
  startTranslateY.value = translateY.value
}

function drag(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return
  
  e.preventDefault()
  
  let clientX: number, clientY: number
  
  if (e instanceof MouseEvent) {
    clientX = e.clientX
    clientY = e.clientY
  } else {
    clientX = e.touches[0].clientX
    clientY = e.touches[0].clientY
  }
  
  const deltaX = clientX - dragStartX.value
  const deltaY = clientY - dragStartY.value
  
  translateX.value = startTranslateX.value + deltaX
  translateY.value = startTranslateY.value + deltaY
}

function endDrag() {
  isDragging.value = false
}

// Keyboard shortcuts
function handleKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'Escape':
      close()
      break
    case 'ArrowLeft':
      previous()
      break
    case 'ArrowRight':
      next()
      break
    case '+':
    case '=':
      zoomIn()
      break
    case '-':
    case '_':
      zoomOut()
      break
    case '0':
      resetTransform()
      break
  }
}

// Mouse wheel zoom
function handleWheel(e: WheelEvent) {
  e.preventDefault()
  if (e.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

// Setup keyboard listeners
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.body.style.overflow = 'hidden' // Prevent scrolling
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = '' // Restore scrolling
})
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      @click.self="close"
    >
      <!-- Close Button -->
      <button
        @click="close"
        class="absolute top-4 right-4 z-10 w-12 h-12 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
        aria-label="Close"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Photo Info -->
      <div class="absolute top-4 left-4 z-10 text-white">
        <p class="text-sm font-light">{{ currentPhoto.key }}</p>
        <p class="text-xs text-white/60">{{ currentIndex + 1 }} / {{ photos.length }}</p>
      </div>

      <!-- Zoom Controls -->
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
        <button
          @click="zoomOut"
          class="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Zoom out"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>
        
        <span class="text-white text-sm font-mono px-2">{{ Math.round(scale * 100) }}%</span>
        
        <button
          @click="zoomIn"
          class="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Zoom in"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </button>
        
        <button
          @click="resetTransform"
          class="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors ml-2"
          aria-label="Reset zoom"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <!-- Navigation: Previous -->
      <button
        v-if="hasPrevious"
        @click="previous"
        class="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
        aria-label="Previous photo"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Navigation: Next -->
      <button
        v-if="hasNext"
        @click="next"
        class="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
        aria-label="Next photo"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Image Container -->
      <div
        class="relative w-full h-full flex items-center justify-center overflow-hidden"
        @wheel.prevent="handleWheel"
      >
        <img
          :src="currentPhoto.url"
          :alt="currentPhoto.key"
          class="max-w-full max-h-full object-contain select-none transition-transform"
          :class="{ 'cursor-grab': scale > 1 && !isDragging, 'cursor-grabbing': isDragging }"
          :style="{
            transform: `scale(${scale}) translate(${translateX / scale}px, ${translateY / scale}px)`,
            transformOrigin: 'center center'
          }"
          draggable="false"
          @mousedown="startDrag"
          @mousemove="drag"
          @mouseup="endDrag"
          @mouseleave="endDrag"
          @touchstart="startDrag"
          @touchmove="drag"
          @touchend="endDrag"
        />
      </div>

      <!-- Keyboard Hints -->
      <div class="absolute bottom-4 right-4 z-10 text-white/50 text-xs font-light hidden lg:block">
        <p>← → Navigate | + - Zoom | 0 Reset | ESC Close</p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Prevent text selection during drag */
.select-none {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
</style>
