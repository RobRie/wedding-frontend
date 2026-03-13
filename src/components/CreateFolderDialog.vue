<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'create', name: string): void
  (e: 'close'): void
}>()

const name = ref('')
const error = ref('')

function submit() {
  const trimmed = name.value.trim()
  if (!trimmed) {
    error.value = 'Bitte einen Namen eingeben'
    return
  }
  if (trimmed.length > 60) {
    error.value = 'Name darf maximal 60 Zeichen lang sein'
    return
  }
  emit('create', trimmed)
}
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="emit('close')">
    <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
      <h2 class="text-xl font-bold text-gray-800 mb-4">📁 Neuer Ordner</h2>
      <form @submit.prevent="submit" class="space-y-4">
        <input
          v-model="name"
          type="text"
          placeholder="z.B. Robin und Lisa"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
          autofocus
        />
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <div class="flex gap-3">
          <button
            type="button"
            @click="emit('close')"
            class="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            class="flex-1 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold transition"
          >
            Erstellen
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
