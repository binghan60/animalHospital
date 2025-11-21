<template>
  <v-card class="blood-sugar-chart-card">
    <v-card-title class="pb-2 text-center">
      <v-icon icon="mdi-chart-donut" class="mr-2" color="primary" />
      {{ chartTitle }}
    </v-card-title>

    <v-card-text class="pt-2">
      <div class="chart-container">
        <ChartComponent :key="chartConfig.uniqueKey || ((isDark.value ? 'dark' : 'light') + '-' + chartConfig.data?.labels?.length)" type="pie" :chartData="chartConfig.data" :chartOptions="chartConfig.options" />
      </div>

      <div class="spacer"></div>

      <div class="sugar-values-grid">
        <!-- 總平均 -->
        <v-card :class="['sugar-card', 'combined', bloodSugarColorClass(Math.ceil(averages.combinedAverage))]" variant="flat">
          <v-card-text class="pa-2 text-center">
            <div class="text-h6 font-weight-bold">
              {{ Math.ceil(averages.combinedAverage) }}
            </div>
            <div class="text-caption">總平均</div>
          </v-card-text>
        </v-card>

        <!-- 早上平均 -->
        <v-card :class="['sugar-card', bloodSugarColorClass(Math.ceil(averages.morningAverage))]" variant="flat">
          <v-card-text class="pa-2 text-center">
            <div class="text-body-1 font-weight-bold">
              <v-icon icon="mdi-weather-sunny" size="small" class="mr-1" />
              {{ Math.ceil(averages.morningAverage) }}
            </div>
            <div class="text-caption">早上</div>
          </v-card-text>
        </v-card>

        <!-- 晚上平均 -->
        <v-card :class="['sugar-card', bloodSugarColorClass(Math.ceil(averages.eveningAverage))]" variant="flat">
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
import { computed, inject } from 'vue'
import ChartComponent from '@/components/ChartComponent.vue'
import { useChartConfig } from '../composables/useChartConfig'

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

// 注入深色模式狀態
const isDark = inject('isDark', { value: false })

// 使用圖表配置
const { getAverageChartConfig, bloodSugarColor } = useChartConfig(isDark)

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
  const timestamp = Date.now()
  const config = getAverageChartConfig(props.averageData, props.title)
  return {
    ...config,
    uniqueKey: `${themeKey}-${timestamp}`
  }
})

// 血糖顏色類別（適用於 Vuetify）
const bloodSugarColorClass = value => {
  if (!value || value === '---') return 'severity-none'
  if (value >= 400) return 'severity-danger'
  if (value >= 250) return 'severity-warning'
  if (value >= 180) return 'severity-caution'
  if (value >= 70) return 'severity-normal'
  return 'severity-low'
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
/* 填滿背景的配色方案 */
.severity-none {
  /* 使用不透明的表面文字色作為文字色 */
  color: #555555 !important;
  /* 實色淺灰色作為背景色，模擬 "無" 狀態 */
  background-color: #f0f0f0 !important;
  /* 實色邊框 */
  border-color: #cccccc !important;
}

.severity-low {
  color: #ffffff !important; /* 白色文字 */
  background-color: #5c9ded !important; /* 柔和藍背景 */
  border-color: #a0c4ff !important; /* 淡藍邊框 (保留原邊框色) */
}

.severity-normal {
  color: #ffffff !important; /* 白色文字 */
  background-color: #5fad56 !important; /* 柔和綠背景 */
  border-color: #a3d2a0 !important; /* 淡綠邊框 (保留原邊框色) */
}

.severity-caution {
  color: #333333 !important; /* 深色文字 (與柔和黃對比度高) */
  background-color: #f2c037 !important; /* 柔和黃背景 */
  border-color: #fde28d !important; /* 淡黃邊框 (保留原邊框色) */
}

.severity-warning {
  color: #ffffff !important; /* 白色文字 */
  background-color: #e58c45 !important; /* 柔和橙背景 */
  border-color: #f7c59f !important; /* 淡橙邊框 (保留原邊框色) */
}

.severity-danger {
  color: #ffffff !important; /* 白色文字 */
  background-color: #d9534f !important; /* 柔和紅背景 */
  border-color: #f2a09d !important; /* 淡紅邊框 (保留原邊框色) */
}
</style>
