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

const downloading = ref(false)

async function downloadImage() {
  if (downloading.value) return
  downloading.value = true
  try {
    const response = await fetch(props.imageUrl, { mode: 'cors' })
    if (!response.ok) throw new Error('Download fehlgeschlagen')
    const blob = await response.blob()

    // Ensure we have a sensible filename with extension
    let name = props.filename || 'bild.jpg'
    if (!/\.[a-z0-9]+$/i.test(name)) {
      const ext = (blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg')
      name = `${name}.${ext}`
    }

    const file = new File([blob], name, { type: blob.type || 'image/jpeg' })

    // On mobile (iOS/Android): use Web Share API so user can save to gallery/photos
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: name })
        return
      } catch (err) {
        // User cancelled or share failed - fall through to classic download
        if ((err as DOMException)?.name === 'AbortError') return
      }
    }

    // Desktop / fallback: trigger a regular download
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (e) {
    console.error(e)
    // Last-resort: open the image in a new tab
    window.open(props.imageUrl, '_blank')
  } finally {
    downloading.value = false
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
    v-if="folder !== 'photobox'"
      :src="imageUrl"
      :alt="filename"
      class="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    />
     <img
    v-if="folder === 'photobox'"
      :src="imageUrl"
      :alt="filename"
      class="max-w-[90vw] object-contain rounded-lg shadow-2xl"
      style="transform: scale(2)"
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

    <!-- Filename + Download -->
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
      <button
        @click.stop="downloadImage"
        :disabled="downloading"
        class="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 active:bg-white/30 disabled:opacity-50 text-white rounded-full backdrop-blur-sm transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 11l5 5 5-5M12 4v12" />
        </svg>
        <span class="text-sm">{{ downloading ? 'Lädt…' : 'Bild speichern' }}</span>
      </button>
      <div class="text-white/60 text-sm">
        {{ filename }}
      </div>
    </div>
  </div>
</template>
