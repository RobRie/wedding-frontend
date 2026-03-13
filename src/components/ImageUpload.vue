<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'upload', files: File[]): void
}>()

const dragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function onDrop(event: DragEvent) {
  dragging.value = false
  const files = Array.from(event.dataTransfer?.files || [])
  const imageFiles = files.filter((f) => f.type.startsWith('image/'))
  if (imageFiles.length > 0) {
    emit('upload', imageFiles)
  }
}

function onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (files.length > 0) {
    emit('upload', files)
  }
  input.value = ''
}

function triggerFileInput() {
  fileInput.value?.click()
}
</script>

<template>
  <div
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop"
    @click="triggerFileInput"
    :class="[
      'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
      dragging
        ? 'border-rose-400 bg-rose-50 scale-[1.01]'
        : 'border-gray-300 hover:border-rose-300 hover:bg-rose-50/50',
    ]"
  >
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="onFileSelect"
    />
    <div class="text-4xl mb-2">📸</div>
    <p class="text-gray-600 font-medium">
      Bilder hierher ziehen oder <span class="text-rose-500 underline">auswählen</span>
    </p>
    <p class="text-gray-400 text-sm mt-1">JPG, PNG, GIF, WebP · max. 20 MB pro Bild</p>
  </div>
</template>
