<template>
  <v-container fluid>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="mdi-bookmark-multiple" class="mr-2" color="primary" />
          <span class="text-h5 font-weight-bold">醒目標記記錄</span>
        </div>
        <v-btn icon="mdi-arrow-left" variant="text" @click="$router.go(-1)" />
      </v-card-title>

      <v-divider />

      <v-card-text>
        <!-- 載入狀態 -->
        <div v-if="isLoading" class="text-center py-16">
          <v-progress-circular indeterminate color="primary" size="64" />
          <p class="mt-4 text-body-1">載入標記記錄中...</p>
        </div>

        <!-- 無資料狀態 -->
        <div v-else-if="!markedData.length" class="text-center py-16">
          <v-icon icon="mdi-bookmark-outline" size="96" color="grey-lighten-2" class="mb-4" />
          <h3 class="text-h5 text-medium-emphasis mb-2">尚無標記記錄</h3>
          <p class="text-body-1 text-medium-emphasis mb-6">當您標記重要的血糖記錄時，它們會顯示在這裡</p>
          <v-btn color="primary" variant="elevated" @click="$router.push(`/hospital/animal/${animalId}`)">
            <v-icon icon="mdi-calendar" class="mr-2" />
            前往血糖日記
          </v-btn>
        </div>

        <!-- 標記資料時間軸 -->
        <div v-else>
          <v-alert variant="tonal" color="info" class="mb-6">
            總共有
            <strong class="mx-1">{{ markedData.length }}</strong>
            筆標記記錄。點擊卡片可跳轉至該日期的日曆。
          </v-alert>

          <v-timeline align="start" side="end" density="compact">
            <v-timeline-item v-for="item in markedData" :key="item._id" :dot-color="getTimelineDotColor(item)" size="large" fill-dot>
              <template #icon>
                <v-icon :icon="getTimelineIcon(item)" color="white" />
              </template>

              <v-card class="clickable-card" variant="outlined" @click="goToWeekCalendar(item.date)">
                <v-card-text class="pa-4">
                  <div class="d-flex justify-space-between align-center mb-3">
                    <div class="text-subtitle-1 font-weight-bold d-flex align-center">
                      <v-icon icon="mdi-calendar" class="mr-2" color="primary"></v-icon>
                      {{ formatDateFull(item.date) }}
                    </div>
                    <div class="text-caption text-medium-emphasis">{{ formatDateDisplay(item.date) }}</div>
                  </div>
                  <v-divider class="mb-4"></v-divider>
                  <div v-for="record in item.records" :key="record._id" class="mb-4">
                    <div class="d-flex justify-space-between align-center mb-2">
                      <div class="d-flex align-center">
                        <v-icon :icon="getTimeIcon(record.time)" :color="getTimeColor(record.time)" class="mr-2" />
                        <span class="text-h6 font-weight-bold">
                          {{ record.time || '未記錄時間' }}
                        </span>
                      </div>
                      <v-chip size="small" :color="getAuthorColor(record.authorRole)" variant="tonal">
                        {{ record.authorRole === 'hospital' ? '醫院' : '飼主' }}
                      </v-chip>
                    </div>

                    <div class="d-flex flex-wrap align-center ga-2 mb-2">
                      <v-icon icon="mdi-water-outline" />
                      <span class="text-caption text-medium-emphasis">血糖:</span>
                      <span class="font-weight-bold text-body-1" :class="`text-${getBloodSugarColor(record.bloodSugar)}`">
                        {{ record.bloodSugar || '---' }} <span v-if="record.bloodSugar" class="text-caption">mg/dL</span>
                      </span>

                      <v-icon icon="mdi-needle" class="ml-4" />
                      <span class="text-caption text-medium-emphasis">胰島素:</span>
                      <span class="font-weight-bold text-body-1">
                        {{ record.insulin ?? '---' }} <span v-if="record.insulin !== null && record.insulin !== ''" class="text-caption">單位</span>
                      </span>
                    </div>

                    <v-alert v-if="record.notes" variant="outlined" color="info" density="compact" class="mt-2">
                      {{ record.notes }}
                    </v-alert>
                  </div>

                  <div v-if="item.notes" class="mt-4 pt-3 border-t">
                    <v-alert variant="outlined" color="primary" density="compact" icon="mdi-notebook">
                      <strong>日記備註：</strong>{{ item.notes }}
                    </v-alert>
                  </div>
                </v-card-text>

              </v-card>
            </v-timeline-item>
          </v-timeline>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMarkedDiary, updateBloodSugarMark } from '@/api'
import { useAppToast } from '@/utils/appToast'

const route = useRoute()
const router = useRouter()
const toast = useAppToast()

const animalId = route.params.animalId
const isLoading = ref(true)
const markedData = ref([])

const loadMarkedData = async () => {
  try {
    isLoading.value = true
    const data = await getMarkedDiary(animalId)
    markedData.value = data
  } catch (error) {
    toast.error(error, '載入標記資料失敗')
  } finally {
    isLoading.value = false
  }
}

const toggleMark = async (recordId, currentStatus) => {
  try {
    const payload = {
      animalId,
      is_marked: !currentStatus
    }
    await updateBloodSugarMark(recordId, payload)
    markedData.value = markedData.value.filter(item => item._id !== recordId)
    toast.success('標記已移除')
  } catch (error) {
    toast.error(error, '移除標記失敗')
  }
}

const goToWeekCalendar = targetDate => {
  const params = new URLSearchParams({
    date: targetDate,
    view: 'week'
  })
  const detailUrl = `/hospital/animal/${animalId}?${params.toString()}`
  router.push(detailUrl)
}

const formatDateDisplay = dateString => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now - date
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays} 天前`
  return ''
}

const formatDateFull = dateString => {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const getTimelineDotColor = item => {
  const hasHighBloodSugar = item.records?.some(record => record.bloodSugar >= 400)
  if (hasHighBloodSugar) return 'error'

  const hasModerateBloodSugar = item.records?.some(record => record.bloodSugar >= 250)
  if (hasModerateBloodSugar) return 'warning'

  return 'success'
}

const getTimelineIcon = item => {
  const hasHighBloodSugar = item.records?.some(record => record.bloodSugar >= 400)
  if (hasHighBloodSugar) return 'mdi-alert'

  const hasModerateBloodSugar = item.records?.some(record => record.bloodSugar >= 250)
  if (hasModerateBloodSugar) return 'mdi-alert-outline'

  return 'mdi-check'
}

const getBloodSugarColor = value => {
  if (!value || value === '---' || value < 70) return 'info'
  if (value >= 400) return 'error'
  if (value >= 250) return 'warning'
  return 'success'
}

const getTimeIcon = time => {
  if (!time) return 'mdi-clock-outline'
  const hour = parseInt(time.split(':')[0])
  if (hour >= 6 && hour < 12) return 'mdi-weather-sunny'
  if (hour >= 12 && hour < 18) return 'mdi-weather-partly-cloudy'
  return 'mdi-weather-night'
}

const getTimeColor = time => {
  if (!time) return 'grey'
  const hour = parseInt(time.split(':')[0])
  if (hour >= 6 && hour < 12) return 'orange'
  if (hour >= 12 && hour < 18) return 'light-blue'
  return 'indigo'
}

const getAuthorColor = role => {
  return role === 'hospital' ? 'green' : 'primary'
}

onMounted(() => {
  loadMarkedData()
})
</script>

<style scoped>
.clickable-card {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.clickable-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.6);
  background-color: rgba(var(--v-theme-primary), 0.04);
}

:deep(.v-timeline-item__body) {
  width: 100%;
}

.remove-mark-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(var(--v-theme-surface), 0.5);
}
</style>
