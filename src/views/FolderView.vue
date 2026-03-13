<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { listImages, uploadImages, type ImageInfo } from '@/services/api'
import ImageUpload from '@/components/ImageUpload.vue'
import LightboxView from '@/components/LightboxView.vue'

const route = useRoute()
const router = useRouter()
const folder = route.params.folder as string

const images = ref<ImageInfo[]>([])
const loading = ref(true)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadError = ref('')
const lightboxIndex = ref(-1)
const lightboxRef = ref<InstanceType<typeof LightboxView> | null>(null)

const lightboxImage = ref<ImageInfo | null>(null)

async function loadImages() {
  loading.value = true
  try {
    images.value = await listImages(folder)
  } catch (err: any) {
    if (err?.response?.status === 401) {
      localStorage.removeItem('access_code')
      router.push({ name: 'login' })
    }
  } finally {
    loading.value = false
  }
}

async function handleUpload(files: File[]) {
  uploading.value = true
  uploadProgress.value = 0
  uploadError.value = ''
  try {
    const result = await uploadImages(folder, files, (p) => {
      uploadProgress.value = p
    })
    if (result.errors && result.errors.length > 0) {
      uploadError.value = `${result.errors.length} Datei(en) fehlgeschlagen`
    }
    await loadImages()
  } catch (err: any) {
    uploadError.value = err?.response?.data?.error || 'Upload fehlgeschlagen'
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

function openLightbox(index: number) {
  lightboxIndex.value = index
}

function closeLightbox() {
  lightboxRef.value?.cleanup?.()
  lightboxIndex.value = -1
}

function prevImage() {
  if (lightboxIndex.value > 0) {
    lightboxIndex.value--
  } else {
    lightboxIndex.value = images.value.length - 1
  }
}

function nextImage() {
  if (lightboxIndex.value < images.value.length - 1) {
    lightboxIndex.value++
  } else {
    lightboxIndex.value = 0
  }
}

onMounted(loadImages)

onUnmounted(() => {
  lightboxRef.value?.cleanup?.()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
        <button
          @click="router.push({ name: 'home' })"
          class="text-gray-500 hover:text-gray-700 text-xl"
        >
          ←
        </button>
        <h1 class="text-2xl font-bold text-gray-800 flex-1">📁 {{ folder }}</h1>
        <span class="text-gray-400 text-sm" v-if="!loading">
          {{ images.length }} Bild{{ images.length !== 1 ? 'er' : '' }}
        </span>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <!-- Upload area -->
      <ImageUpload @upload="handleUpload" />

      <!-- Upload progress -->
      <div v-if="uploading" class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              class="bg-rose-500 h-full transition-all duration-300"
              :style="{ width: uploadProgress + '%' }"
            ></div>
          </div>
          <span class="text-sm text-gray-600 w-12 text-right">{{ uploadProgress }}%</span>
        </div>
        <p class="text-sm text-gray-500 mt-2">Bilder werden hochgeladen...</p>
      </div>

      <!-- Upload error -->
      <div
        v-if="uploadError"
        class="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm"
        @click="uploadError = ''"
      >
        {{ uploadError }}
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>

      <!-- Empty state -->
      <div v-else-if="images.length === 0 && !uploading" class="text-center py-16">
        <div class="text-6xl mb-4">📷</div>
        <p class="text-gray-500">Noch keine Bilder in diesem Ordner. Lade welche hoch!</p>
      </div>

      <!-- Image grid -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <div
          v-for="(image, index) in images"
          :key="image.filename"
          @click="openLightbox(index)"
          class="cursor-pointer group"
        >
          <div class="aspect-square rounded-lg overflow-hidden bg-white shadow-sm group-hover:shadow-md transition-all group-hover:scale-[1.02]">
            <img
              :src="image.thumbnail_url"
              :alt="image.filename"
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- Lightbox -->
    <LightboxView
      v-if="lightboxIndex >= 0 && images[lightboxIndex]"
      ref="lightboxRef"
      :image-url="images[lightboxIndex].image_url"
      :filename="images[lightboxIndex].filename"
      @close="closeLightbox"
      @prev="prevImage"
      @next="nextImage"
    />
  </div>
</template>
