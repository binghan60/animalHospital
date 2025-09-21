<template>
  <v-container class="my-8">
    <!-- 頁面標題 -->
    <div class="page-title-container">
      <h1 class="text-h4 font-weight-bold text-grey-darken-3">我的寵物們</h1>
      <p class="text-body-1 text-grey-darken-1 mt-2">點擊卡片查看每位家庭成員的詳細健康記錄。</p>
    </div>

    <!-- 動物卡片網格 -->
    <v-row class="mt-8">
      <!-- 現有動物卡片 -->
      <v-col v-for="animal in animalList" :key="animal._id" cols="12" sm="6" md="4">
        <v-card class="animal-card fill-height" hover @click="navigateToAnimal(animal._id)">
          <v-card-text class="text-center pa-6">
            <v-avatar size="200" class="mb-4 elevation-2">
              <v-img :src="animal.avatar || '/image/sampleAvatar.png'" :alt="animal.name" cover />
            </v-avatar>

            <h2 class="text-h5 font-weight-bold">{{ animal.name }}</h2>
            <p class="text-body-1 text-medium-emphasis">{{ animal.breed }}</p>

            <div class="my-4">
              <v-chip v-if="animal.sterilized" color="success" variant="tonal" size="small" prepend-icon="mdi-check-decagram"> 已結紮 </v-chip>
              <v-chip v-else color="warning" variant="tonal" size="small" prepend-icon="mdi-alert-circle-outline"> 未結紮 </v-chip>
            </div>
          </v-card-text>

          <v-divider />

          <v-card-actions class="justify-center pa-4">
            <v-btn color="primary" variant="text" @click.stop="navigateToAnimal(animal._id)"> 查看檔案 </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useAppToast } from '@/utils/appToast'
import { getSharedAnimals } from '@/api'

const router = useRouter()
const authStore = useAuthStore()
const toast = useAppToast()
const animalList = ref([])

const { user } = storeToRefs(authStore)

async function getAnimalList() {
  try {
    const data = await getSharedAnimals(user.value._id)
    animalList.value = data
  } catch (error) {
    toast.error(error, '無法獲取動物列表')
  }
}

function navigateToAnimal(animalId) {
  router.push(`/user/animal/${animalId}`)
}

onMounted(getAnimalList)
</script>

<style scoped>
.page-title-container {
  text-align: center;
  margin-bottom: 2rem;
}

.animal-card {
  transition:
    transform 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
  border-radius: 16px !important;
}

.animal-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.add-animal-card {
  border: 2px dashed #d0d0d0;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background-color: #f9f9f9;
  border-radius: 16px !important;
}

.add-animal-card:hover {
  border-color: var(--v-theme-primary);
  background-color: #fff;
}

.add-animal-card:hover .v-icon {
  color: var(--v-theme-primary) !important;
}

.add-animal-card:hover .v-card-title {
  color: var(--v-theme-primary) !important;
}
</style>
