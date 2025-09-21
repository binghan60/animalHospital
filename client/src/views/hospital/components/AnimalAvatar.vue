<template>
  <v-card class="animal-avatar-card">
    <div class="avatar-container">
      <v-img :src="avatarUrl" :alt="animalName || '動物頭像'" cover class="avatar-image" />
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  avatar: {
    type: String,
    default: '',
  },
  animalName: {
    type: String,
    default: '',
  },
})

const avatarUrl = computed(() => {
  return props.avatar || '/image/sampleAvatar.png'
})
</script>

<style scoped>
.animal-avatar-card {
  height: 380px;
  background-color: rgb(var(--v-theme-surface)) !important;
  color: rgb(var(--v-theme-on-surface)) !important;
  transition: background-color 0.1s ease, color 0.1s ease;
}

@media (min-width: 1024px) {
  .animal-avatar-card {
    height: 420px;
    background-color: rgb(var(--v-theme-surface)) !important;
    color: rgb(var(--v-theme-on-surface)) !important;
    transition: background-color 0.1s ease, color 0.1s ease;
  }
}

.avatar-container {
  width: 100%;
  height: 100%;
  padding: 16px;
}

@media (min-width: 1024px) {
  .avatar-container {
    padding: 24px;
  }
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}
</style>
