<template>
  <div class="rounded-lg shadow-md bg-white p-4 lg:p-6 h-full min-h-[300px] lg:max-h-[400px] max-h-[480px] dark:bg-darkPrimary-700">
    <ChartComponent 
      type="pie" 
      :chartData="chartConfig.data" 
      :chartOptions="chartConfig.options"
    />
    <div class="grid grid-cols-2 col-span-6 text-center">
      <h2 class="col-span-2 text-primary-900 dark:text-darkPrimary-50">{{ chartTitle }}</h2>
      <div 
        :class="[
          'col-span-2 p-2 h-[40px] text-lg font-semibold text-primary-600 dark:text-darkPrimary-50', 
          bloodSugarColor(Math.ceil(averages.combinedAverage))
        ]"
      >
        {{ Math.ceil(averages.combinedAverage) }}
      </div>
      <div 
        :class="[
          'col-span-1 p-2 h-[40px] text-lg font-semibold text-primary-600 dark:text-darkPrimary-50', 
          bloodSugarColor(Math.ceil(averages.morningAverage))
        ]"
      >
        <i class="fa-regular fa-sun"></i> {{ Math.ceil(averages.morningAverage) }}
      </div>
      <div 
        :class="[
          'col-span-1 p-2 h-[40px] text-lg font-semibold text-primary-600 dark:text-darkPrimary-50', 
          bloodSugarColor(Math.ceil(averages.eveningAverage))
        ]"
      >
        <i class="fa-regular fa-moon"></i> {{ Math.ceil(averages.eveningAverage) }}
      </div>
    </div>
  </div>
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
      eveningCounts: { count_1_249: 0, count_250_399: 0, count_400_plus: 0 }
    })
  },
  title: {
    type: String,
    default: '平均血糖'
  }
})

// 注入深色模式狀態
const isDark = inject('isDark', { value: false })

// 使用圖表配置
const { getAverageChartConfig, bloodSugarColor } = useChartConfig(isDark)

// 計算平均值
const averages = computed(() => {
  return props.averageData.averages?.[0] || { 
    morningAverage: 0, 
    eveningAverage: 0, 
    combinedAverage: 0 
  }
})

// 計算圖表標題
const chartTitle = computed(() => {
  return props.title
})

// 計算圖表配置
const chartConfig = computed(() => {
  return getAverageChartConfig(props.averageData, props.title)
})
</script>