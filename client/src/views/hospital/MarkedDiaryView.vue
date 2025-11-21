<template>
  <v-container fluid class="pa-4">
    <!-- 頁面標題 -->
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-6">
          <v-btn icon="mdi-arrow-left" variant="text" size="large" class="mr-4" @click="$router.go(-1)" />
          <div>
            <h1 class="text-h4 font-weight-bold text-primary">
              <v-icon icon="mdi-bookmark-multiple" class="mr-2" />
              醒目標記記錄
            </h1>
            <p class="text-body-1 text-medium-emphasis mt-2">查看所有重要的血糖記錄標記</p>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- 載入狀態 -->
    <v-row v-if="isLoading">
      <v-col cols="12" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="mt-4 text-body-1">載入標記記錄中...</p>
      </v-col>
    </v-row>

    <!-- 無資料狀態 -->
    <v-row v-else-if="!markedData.length">
      <v-col cols="12" class="text-center py-12">
        <v-icon icon="mdi-bookmark-outline" size="96" color="grey-lighten-2" class="mb-4" />
        <h3 class="text-h5 text-medium-emphasis mb-2">尚無標記記錄</h3>
        <p class="text-body-1 text-medium-emphasis mb-6">當您標記重要的血糖記錄時，它們會顯示在這裡</p>
        <v-btn color="primary" variant="elevated" @click="$router.push(`/hospital/animal/${animalId}`)">
          <v-icon icon="mdi-calendar" class="mr-2" />
          前往血糖日記
        </v-btn>
      </v-col>
    </v-row>

    <!-- 標記資料時間軸 -->
    <v-row v-else>
      <v-col cols="12">
        <!-- 統計卡片 -->
        <v-card class="mb-6" variant="tonal" color="success">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between">
              <div>
                <h3 class="text-h6 font-weight-bold">總共 {{ markedData.length }} 筆標記記錄</h3>
                <p class="text-body-2 text-medium-emphasis mt-1">最近標記：{{ latestMarkedDate }}</p>
              </div>
              <v-icon icon="mdi-chart-line" size="48" color="success" />
            </div>
          </v-card-text>
        </v-card>

        <!-- 時間軸展示 -->
        <v-timeline align="start" side="end" class="ml-4">
          <v-timeline-item v-for="(item, index) in markedData" :key="item._id" :dot-color="getTimelineDotColor(item)" size="large" class="mb-8">
            <template v-slot:icon>
              <v-icon :icon="getTimelineIcon(item)" color="white" size="20" />
            </template>

            <template v-slot:opposite>
              <div class="text-caption text-medium-emphasis">
                {{ formatDateDisplay(item.date) }}
              </div>
            </template>

            <v-card class="marked-record-card clickable-card" elevation="2" @click="goToWeekCalendar(item.date)">
              <v-card-title class="d-flex align-center justify-space-between pa-4">
                <div>
                  <h4 class="text-h6 font-weight-bold">
                    {{ formatDateFull(item.date) }}
                  </h4>
                  <div class="d-flex align-center mt-1">
                    <v-chip size="small" color="warning" variant="tonal" prepend-icon="mdi-bookmark"> 重要標記 </v-chip>
                    <v-chip v-if="item.records?.length > 1" size="small" color="info" variant="tonal" class="ml-2"> {{ item.records.length }} 筆記錄 </v-chip>
                  </div>
                </div>
                <v-btn icon="mdi-bookmark-remove" size="small" color="error" variant="text" @click="toggleMark(item._id, true)"> </v-btn>
              </v-card-title>

              <v-card-text class="pt-0 pb-4">
                <!-- 血糖記錄 -->
                <div v-for="record in item.records" :key="record._id" class="mb-4">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div class="d-flex align-center">
                      <v-icon :icon="getTimeIcon(record.time)" :color="getTimeColor(record.time)" size="20" class="mr-2" />
                      <span class="text-subtitle-2 font-weight-medium">
                        {{ record.time || '未記錄時間' }}
                      </span>
                    </div>
                    <v-chip size="small" :color="getAuthorColor(record.authorRole)" variant="tonal">
                      {{ record.authorRole === 'hospital' ? '醫院' : '飼主' }}
                    </v-chip>
                  </div>

                  <v-row class="ma-0">
                    <v-col cols="6" class="pa-1">
                      <v-card variant="tonal" :color="getBloodSugarColor(record.bloodSugar)">
                        <v-card-text class="pa-3 text-center">
                          <v-icon icon="mdi-water-outline" class="mb-1" />
                          <div class="text-caption text-medium-emphasis">血糖值</div>
                          <div class="text-h6 font-weight-bold">
                            {{ record.bloodSugar || '---' }}
                            <span v-if="record.bloodSugar" class="text-caption">mg/dL</span>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                    <v-col cols="6" class="pa-1">
                      <v-card variant="tonal" color="blue-grey">
                        <v-card-text class="pa-3 text-center">
                          <v-icon icon="mdi-needle" class="mb-1" />
                          <div class="text-caption text-medium-emphasis">胰島素</div>
                          <div class="text-h6 font-weight-bold">
                            {{ record.insulin ?? '---' }}
                            <span v-if="record.insulin !== null && record.insulin !== ''" class="text-caption">單位</span>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>

                  <!-- 備註 -->
                  <div v-if="record.notes" class="mt-3">
                    <v-alert variant="tonal" color="info" density="compact" icon="mdi-note-text">
                      {{ record.notes }}
                    </v-alert>
                  </div>
                </div>

                <!-- 日記備註 -->
                <div v-if="item.notes" class="mt-4 pt-3 border-t">
                  <v-alert variant="tonal" color="primary" density="compact" icon="mdi-notebook"> <strong>日記備註：</strong>{{ item.notes }} </v-alert>
                </div>
              </v-card-text>
            </v-card>
          </v-timeline-item>
        </v-timeline>
      </v-col>
    </v-row>
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

// Props
const animalId = route.params.animalId

// State
const isLoading = ref(true)
const markedData = ref([])

// Computed
const latestMarkedDate = computed(() => {
  if (!markedData.value.length) return '無'
  const latest = markedData.value[0]
  return formatDateDisplay(latest.date)
})

// Methods
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
      is_marked: !currentStatus,
    }
    await updateBloodSugarMark(recordId, payload)

    // 移除該項目從列表中
    markedData.value = markedData.value.filter(item => item._id !== recordId)
    toast.success('標記已移除')
  } catch (error) {
    toast.error(error, '移除標記失敗')
  }
}

const goToWeekCalendar = targetDate => {
  // 構建查詢參數，指定目標日期
  const params = new URLSearchParams({
    date: targetDate,
    view: 'week',
  })

  // 跳轉到動物詳細頁面的週曆，帶上日期參數
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
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 週前`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} 個月前`
  return `${Math.floor(diffDays / 365)} 年前`
}

const formatDateFull = dateString => {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
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
  if (!value) return 'grey'
  if (value >= 400) return 'error'
  if (value >= 250) return 'warning'
  if (value >= 70) return 'success'
  return 'info'
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
  if (hour >= 12 && hour < 18) return 'blue'
  return 'indigo'
}

const getAuthorColor = role => {
  return role === 'hospital' ? 'success' : 'primary'
}

// Lifecycle
onMounted(() => {
  loadMarkedData()
})
</script>

<style scoped>
.marked-record-card {
  border-left: 4px solid rgb(var(--v-theme-warning));
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.clickable-card {
  cursor: pointer;
}

.clickable-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.clickable-card:active {
  transform: translateY(0px);
}

.v-timeline {
  padding-left: 0;
}

:deep(.v-timeline-item__body) {
  padding-bottom: 2rem;
}

:deep(.v-timeline-item__opposite) {
  flex: 0 0 auto;
  width: 120px;
}
</style>
