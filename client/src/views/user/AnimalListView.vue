<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const animalList = ref([])

const { user } = storeToRefs(authStore)

async function getAnimalList() {
  try {
    const { data } = await axios.get(`${import.meta.env.VITE_API_PATH}/animal/share/${user.value._id}`)
    animalList.value = data
  } catch (error) {
    toast.error(error.response.data.message)
  }
}
function navigateToAnimal(animalId) {
  router.push(`/user/animal/${animalId}`)
}
onMounted(async () => {
  await getAnimalList()
})
</script>
<template>
  <div>
    <h2 class="mb-8 text-4xl text-center dark:text-darkPrimary-50">動物列表</h2>
    <div class="grid gap-6 cursor-pointer lg:grid-cols-3">
      <div v-for="animal in animalList" :key="animal._id" class="bg-white dark:bg-darkPrimary-800 w-full h-[300px] rounded-xl shadow-lg overflow-hidden" @click="navigateToAnimal(animal._id)">
        <div class="flex items-center justify-center h-[85%]">
          <img class="object-cover w-full h-full border-2 rounded-t-xl border-primary-200 dark:border-darkPrimary-600" :src="animal.avatar ? animal.avatar : '/image/sampleAvatar.png'" />
        </div>
        <div class="flex items-center justify-between px-4 py-3 bg-primary-200 dark:bg-darkPrimary-600 h-[15%]">
          <span class="text-sm font-medium text-gray-600 dark:text-darkPrimary-50">動物姓名：{{ animal.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
