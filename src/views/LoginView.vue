<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { verifyAccessCode } from '@/services/api'

const router = useRouter()
const code = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  if (!code.value.trim()) {
    error.value = 'Bitte Zugangscode eingeben'
    return
  }
  loading.value = true
  const ok = await verifyAccessCode(code.value.trim())
  loading.value = false
  if (ok) {
    router.push({ name: 'home' })
  } else {
    error.value = 'Ungültiger Zugangscode'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-100">
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
      <div class="text-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-1">💍 Hochzeitsbilder</h1>
        <p class="text-gray-500">Bitte Zugangscode eingeben</p>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <input
          v-model="code"
          type="password"
          placeholder="Zugangscode"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent text-center text-lg"
          autofocus
        />
        <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {{ loading ? 'Prüfe...' : 'Eintreten' }}
        </button>
      </form>
    </div>
  </div>
</template>
