<template>
  <div class="bg-white rounded-lg shadow-lg dark:bg-darkPrimary-700 min-h-[300px] lg:max-h-[400px] max-h-[480px]">
    <img 
      class="object-cover w-full h-full p-4 lg:p-6" 
      :src="avatarUrl" 
      :alt="animalName || '動物頭像'"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  avatar: {
    type: String,
    default: ''
  },
  animalName: {
    type: String,
    default: ''
  }
})

const avatarUrl = computed(() => {
  return props.avatar || '/image/sampleAvatar.png'
})
</script>