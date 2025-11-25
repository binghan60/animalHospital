<template>
  <div v-for="(chart, index) in chartConfigs" :key="chart.date" class="curve-card">
    <!-- 卡片標題區 -->
    <v-card-title class="curve-card-title d-flex justify-space-between align-center">
      <div class="d-flex align-center">
        <v-icon icon="mdi-chart-line" class="mr-2" color="primary" />
        <span class="text-h6 font-weight-semibold"> {{ formatDate(curveData[index]?.date) }} 血糖曲線 </span>
      </div>

      <!-- 編輯按鈕區 - 僅醫院模式可見 -->
      <div v-if="showEditButtons" class="d-flex ga-2">
        <v-tooltip text="編輯曲線">
          <template #activator="{ props }">
            <v-btn icon="mdi-pencil" size="small" color="primary" variant="text" v-bind="props" @click="$emit('editCurve', curveData[index])" />
          </template>
        </v-tooltip>
        <v-tooltip text="刪除曲線">
          <template #activator="{ props }">
            <v-btn icon="mdi-delete" size="small" color="error" variant="text" v-bind="props" @click="$emit('deleteCurve', curveData[index])" />
          </template>
        </v-tooltip>
      </div>
    </v-card-title>

    <v-divider />

    <!-- 圖表統計資訊 -->
    <v-card-text class="py-3">
      <v-row dense>
        <v-col cols="auto">
          <v-chip size="small" color="info" variant="tonal">
            <v-icon icon="mdi-clock" start size="x-small" />
            {{ chart.data?.labels?.length || 0 }} 個時段
          </v-chip>
        </v-col>
        <v-col v-if="chart.data?.datasets?.[0]?.data?.length" cols="auto">
          <v-chip size="small" color="success" variant="tonal">
            <v-icon icon="mdi-trending-up" start size="x-small" />
            平均 {{ Math.round(chart.data.datasets[0].data.reduce((a, b) => a + b, 0) / chart.data.datasets[0].data.length) }} mg/dL
          </v-chip>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- 圖表區域 -->
    <v-card-text class="chart-container">
      <ChartComponent :key="chart.uniqueKey || (isDark.value ? 'dark' : 'light') + '-' + chart.data?.labels?.length" type="line" :chartData="chart.data" :chartOptions="chart.option" />
    </v-card-text>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ChartComponent from '@/components/ChartComponent.vue'
import { useChartConfig } from '../composables/useChartConfig'
import authStore from '@/stores/auth'

const props = defineProps({
  curveData: {
    type: Array,
    required: true,
    default: () => [],
  },
  showEditButtons: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['editCurve', 'deleteCurve'])

// 從 Pinia store 獲取深色模式狀態
const store = authStore()
const isDark = computed(() => store.isDark)

// 使用圖表配置
const { getBloodSugarCurveChartConfig } = useChartConfig(isDark)

// 格式化日期
const formatDate = dateString => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// 計算圖表配置 - 明確依賴 isDark 以觸發重算
const chartConfigs = computed(() => {
  // 強制依賴 isDark 狀態
  const themeKey = isDark.value ? 'dark' : 'light'

  if (!props.curveData || props.curveData.length === 0) {
    return []
  }

  // 確保每次主題切換都重新計算配置
  const configs = getBloodSugarCurveChartConfig(props.curveData)

  // 為每個配置添加主題標識和時間戳，確保重新渲染
  const timestamp = Date.now()
  return configs.map((config, index) => ({
    ...config,
    themeKey,
    uniqueKey: `${themeKey}-${index}-${timestamp}`,
  }))
})
</script>

<style scoped>
.curve-card {
  background-color: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    background-color 0.1s ease,
    border-color 0.1s ease,
    box-shadow 0.2s ease;
  margin-top: 24px;
  overflow: hidden;
}

.curve-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.curve-card-title {
  padding: 20px 24px 16px 24px;
  background-color: rgba(var(--v-theme-primary), 0.04);
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.chart-container {
  padding: 24px;
  min-height: 350px;
}

@media (min-width: 1024px) {
  .chart-container {
    min-height: 400px;
    padding: 32px;
  }
}

/* 深色主題調整 */
.v-theme--dark .curve-card-title {
  background-color: rgba(var(--v-theme-primary), 0.08);
}
</style>
