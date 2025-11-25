<template>
  <v-card class="weight-chart-card">
    <v-card-title class="d-flex justify-space-between align-center pb-2 flex-wrap">
      <div class="d-flex align-center">
        <v-icon icon="mdi-chart-line" class="mr-2" color="primary" />
        體重走勢圖
      </div>
      <div class="d-flex ga-2 mt-2 mt-sm-0">
        <v-btn v-if="weightData.length > 7" size="small" variant="tonal" @click="showAll = !showAll">
          {{ toggleButtonText }}
        </v-btn>
        <v-btn v-if="showManagementButton" size="small" color="amber" prepend-icon="mdi-plus" @click="$emit('openAddWeight')"> 新增體重 </v-btn>
        <v-btn v-if="showManagementButton" size="small" color="primary" prepend-icon="mdi-format-list-bulleted" @click="$emit('openWeightManagement')"> 管理記錄 </v-btn>
      </div>
    </v-card-title>

    <v-card-text class="pt-2">
      <div class="chart-container">
        <ChartComponent :key="chartConfig.uniqueKey || (isDark?.value ? 'dark' : 'light') + '-' + chartConfig.data?.labels?.length" type="line" :chartData="chartConfig.data" :chartOptions="chartConfig.options" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import ChartComponent from '@/components/ChartComponent.vue'
import { useChartConfig } from '../composables/useChartConfig'
import authStore from '@/stores/auth'

const props = defineProps({
  weightData: {
    type: Array,
    required: true,
    default: () => [],
  },
  showManagementButton: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['openWeightManagement', 'openAddWeight'])

// 控制顯示全部或部分資料
const showAll = ref(false)

// 切換按鈕的文字
const toggleButtonText = computed(() => {
  return showAll.value ? '顯示最近 10 筆' : '顯示全部'
})

// 根據 showAll 的狀態決定要顯示的資料
const displayedWeightData = computed(() => {
  if (showAll.value || props.weightData.length <= 10) {
    return props.weightData
  }
  // 回傳最新的 7 筆資料
  return props.weightData.slice(-10)
})

// 從 Pinia store 獲取深色模式狀態
const store = authStore()
const isDark = computed(() => store.isDark)

// 使用圖表配置
const { getWeightChartConfig } = useChartConfig(isDark)

// 計算圖表配置
const chartConfig = computed(() => {
  // 讓主題切換觸發重算
  const themeKey = isDark.value ? 'dark' : 'light'
  const timestamp = Date.now()
  const dataToDisplay = displayedWeightData.value

  if (!dataToDisplay || dataToDisplay.length === 0) {
    return {
      data: {
        labels: [],
        datasets: [
          {
            label: '體重',
            data: [],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          datalabels: { display: false },
        },
        scales: {
          x: { ticks: { display: false }, grid: { display: false } },
          y: { ticks: { display: false }, grid: { display: false } },
        },
      },
    }
  }

  const config = getWeightChartConfig(dataToDisplay)
  return {
    ...config,
    uniqueKey: `${themeKey}-${timestamp}`,
  }
})
</script>

<style scoped>
.weight-chart-card {
  height: 380px;
  background-color: rgb(var(--v-theme-surface)) !important;
  color: rgb(var(--v-theme-on-surface)) !important;
  transition:
    background-color 0.1s ease,
    color 0.1s ease;
}

@media (min-width: 1024px) {
  .weight-chart-card {
    height: 420px;
  }
}

.chart-container {
  height: 300px;
}

@media (min-width: 1024px) {
  .chart-container {
    height: 340px;
  }
}
</style>
