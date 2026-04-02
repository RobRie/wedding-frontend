<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { listFolders, createFolder, type Folder } from '@/services/api'
import CreateFolderDialog from '@/components/CreateFolderDialog.vue'

const router = useRouter()
const folders = ref<Folder[]>([])
const loading = ref(true)
const showCreateDialog = ref(false)
const createError = ref('')

async function loadFolders() {
  loading.value = true
  try {
    folders.value = await listFolders()
  } catch (err: any) {
    if (err?.response?.status === 401) {
      localStorage.removeItem('access_code')
      router.push({ name: 'login' })
    }
  } finally {
    loading.value = false
  }
}

async function handleCreateFolder(name: string) {
  createError.value = ''
  try {
    await createFolder(name)
    showCreateDialog.value = false
    await loadFolders()
  } catch (err: any) {
    createError.value = err?.response?.data?.error || 'Fehler beim Erstellen'
  }
}

function openFolder(name: string) {
  router.push({ name: 'folder', params: { folder: name } })
}

function logout() {
  localStorage.removeItem('access_code')
  router.push({ name: 'login' })
}

onMounted(loadFolders)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">💍 Hochzeitsbilder</h1>
        <div class="flex gap-3">
          
          <button
            @click="logout"
            class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Abmelden
          </button>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="max-w-6xl mx-auto px-4 py-8">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>

      <!-- Empty state -->
      <div v-else-if="folders.length === 0" class="text-center py-20">
        <div class="text-6xl mb-4">📷</div>
        <h2 class="text-xl font-semibold text-gray-700 mb-2">Noch keine Ordner vorhanden</h2>
        <p class="text-gray-500 mb-6">Erstelle einen neuen Ordner, um Bilder hochzuladen.</p>
        <button
          @click="showCreateDialog = true"
          class="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          Ersten Ordner erstellen
        </button>
      </div>

      <!-- Folder grid -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <button
            @click="showCreateDialog = true"
            class="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            + Neuer Ordner
          </button>
        <div
          v-for="folder in folders"
          :key="folder.name"
          @click="openFolder(folder.name)"
          class="cursor-pointer group"
        >
          <div
            class="aspect-square rounded-xl overflow-hidden bg-white shadow-md group-hover:shadow-lg transition-all group-hover:scale-[1.02]"
          >
            <img
              v-if="folder.cover_url"
              :src="folder.cover_url"
              :alt="folder.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-rose-100">
              <span class="text-5xl">📁</span>
            </div>
          </div>
          <p class="mt-2 text-center font-medium text-gray-700 group-hover:text-rose-600 transition">
            {{ folder.name }}
          </p>
        </div>
      </div>
    </main>

    <!-- Create folder dialog -->
    <CreateFolderDialog
      v-if="showCreateDialog"
      @create="handleCreateFolder"
      @close="showCreateDialog = false"
    />

    <!-- Create error toast -->
    <div
      v-if="createError"
      class="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg"
      @click="createError = ''"
    >
      {{ createError }}
    </div>
  </div>
</template>
