<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const folder = route.params.folder as string
const props = defineProps<{
  imageUrl: string
  filename: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'prev'): void
  (e: 'next'): void
}>()

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
  if (event.key === 'ArrowLeft') emit('prev')
  if (event.key === 'ArrowRight') emit('next')
}

// Listen for keyboard events
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', onKeydown)
}

function cleanup() {
  window.removeEventListener('keydown', onKeydown)
}

// Swipe detection
const touchStartX = ref(0)
const touchStartY = ref(0)
const SWIPE_THRESHOLD = 50

function onTouchStart(event: TouchEvent) {
  if(event.touches[0]) {
  touchStartX.value = event.touches[0].clientX
  touchStartY.value = event.touches[0].clientY
  }
}

function onTouchEnd(event: TouchEvent) {
  if(event.changedTouches[0]) {
  const deltaX = event.changedTouches[0].clientX - touchStartX.value
  const deltaY = event.changedTouches[0].clientY - touchStartY.value


  // Only trigger if horizontal swipe is dominant
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
    if (deltaX > 0) {
      emit('prev')
    } else {
      emit('next')
    }
  }
}
}

defineExpose({ cleanup })
</script>

<template>
  <div class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" @click.self="emit('close')">
    <!-- Close button -->
    <button
      @click="emit('close')"
      class="absolute top-4 right-4 text-white/70 hover:text-white text-3xl z-10 w-10 h-10 flex items-center justify-center"
    >
      ✕
    </button>

    <!-- Previous button -->
    <button
      @click="emit('prev')"
      class="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl z-10 w-12 h-12 flex items-center justify-center"
    >
      ‹
    </button>

    <!-- Image -->
    <img
      :src="imageUrl"
      :alt="filename"
      class="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    />
    

    <!-- Next button -->
    <button
      @click="emit('next')"
      class="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl z-10 w-12 h-12 flex items-center justify-center"
    >
      ›
    </button>

    <!-- Filename -->
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
      {{ filename }}
    </div>
  </div>
</template>
