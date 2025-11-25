<template>
  <v-card class="blood-sugar-chart-card">
    <v-card-title class="pb-2 text-center">
      <v-icon icon="mdi-chart-donut" class="mr-2" color="primary" />
      {{ chartTitle }}
    </v-card-title>

    <v-card-text class="pt-2">
      <div class="chart-container">
        <ChartComponent :key="chartConfig.uniqueKey" type="pie" :chartData="chartConfig.data" :chartOptions="chartConfig.options" />
      </div>

      <div class="spacer"></div>

      <div class="sugar-values-grid">
        <!-- 總平均 -->
        <v-card :color="bloodSugarColor(Math.ceil(averages.combinedAverage))" class="sugar-card combined" variant="flat">
          <v-card-text class="pa-2 text-center">
            <div class="text-h6 font-weight-bold">
              {{ Math.ceil(averages.combinedAverage) }}
            </div>
            <div class="text-caption">總平均</div>
          </v-card-text>
        </v-card>

        <!-- 早上平均 -->
        <v-card :color="bloodSugarColor(Math.ceil(averages.morningAverage))" class="sugar-card" variant="flat">
          <v-card-text class="pa-2 text-center">
            <div class="text-body-1 font-weight-bold">
              <v-icon icon="mdi-weather-sunny" size="small" class="mr-1" />
              {{ Math.ceil(averages.morningAverage) }}
            </div>
            <div class="text-caption">早上</div>
          </v-card-text>
        </v-card>

        <!-- 晚上平均 -->
        <v-card :color="bloodSugarColor(Math.ceil(averages.eveningAverage))" class="sugar-card" variant="flat">
          <v-card-text class="pa-2 text-center">
            <div class="text-body-1 font-weight-bold">
              <v-icon icon="mdi-weather-night" size="small" class="mr-1" />
              {{ Math.ceil(averages.eveningAverage) }}
            </div>
            <div class="text-caption">晚上</div>
          </v-card-text>
        </v-card>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import ChartComponent from '@/components/ChartComponent.vue'
import { useChartConfig } from '../composables/useChartConfig'
import authStore from '@/stores/auth'

const props = defineProps({
  averageData: {
    type: Object,
    required: true,
    default: () => ({
      averages: [{ morningAverage: 0, eveningAverage: 0, combinedAverage: 0 }],
      morningCounts: { count_1_249: 0, count_250_399: 0, count_400_plus: 0 },
      eveningCounts: { count_1_249: 0, count_250_399: 0, count_400_plus: 0 },
    }),
  },
  title: {
    type: String,
    default: '平均血糖',
  },
})

// 從 Pinia store 獲取深色模式狀態
const store = authStore()
const isDark = computed(() => store.isDark)

// 使用圖表配置
const { getAverageChartConfig } = useChartConfig(isDark)

// 計算平均值
const averages = computed(() => {
  return (
    props.averageData.averages?.[0] || {
      morningAverage: 0,
      eveningAverage: 0,
      combinedAverage: 0,
    }
  )
})

// 計算圖表標題
const chartTitle = computed(() => {
  return props.title
})

// 計算圖表配置
const chartConfig = computed(() => {
  // 讓主題切換觸發重算
  const themeKey = isDark.value ? 'dark' : 'light'
  const config = getAverageChartConfig(props.averageData, props.title)
  return {
    ...config,
    uniqueKey: `${themeKey}-${JSON.stringify(props.averageData)}`
  }
})

// 血糖顏色（適用於 Vuetify）
const bloodSugarColor = value => {
  if (!value || value === '---') return undefined
  if (value >= 400) return 'error'
  if (value >= 250) return 'warning'
  if (value >= 180) return 'orange'
  if (value >= 70) return 'success'
  return 'info'
}
</script>

<style scoped>
.blood-sugar-chart-card {
  height: 380px;
  display: flex;
  flex-direction: column;
}

@media (min-width: 1024px) {
  .blood-sugar-chart-card {
    height: 420px;
    background-color: rgb(var(--v-theme-surface)) !important;
    color: rgb(var(--v-theme-on-surface)) !important;
    transition: background-color 0.1s ease, color 0.1s ease;
  }
}

.blood-sugar-chart-card .v-card-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chart-container {
  height: 160px;
  flex-shrink: 0;
}

@media (min-width: 1024px) {
  .chart-container {
    height: 180px;
  }
}

.spacer {
  height: 16px;
  flex-shrink: 0;
}

@media (min-width: 1024px) {
  .spacer {
    height: 20px;
  }
}

.sugar-values-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  flex-shrink: 0;
}

.sugar-card.combined {
  grid-column: 1 / -1;
}

.sugar-card {
  min-height: 50px;
}

@media (min-width: 1024px) {
  .sugar-card {
    min-height: 60px;
  }
}
</style>
