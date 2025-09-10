<template>
  <div class="rounded-lg shadow-md bg-white p-4 lg:p-6 h-full min-h-[300px] lg:max-h-[400px] max-h-[480px] dark:bg-darkPrimary-700">
    <div class="flex items-center justify-between mb-4">
      <h4 class="text-lg font-semibold text-primary-900 dark:text-darkPrimary-50">體重走勢圖</h4>
      <button type="button" class="px-3 py-1 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700" @click="$emit('openWeightManagement')"><i class="fa-solid fa-list fa-fw"></i> 管理記錄</button>
    </div>
    <div class="h-[250px]">
      <ChartComponent type="line" :chartData="chartConfig.data" :chartOptions="chartConfig.options" />
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import ChartComponent from '@/components/ChartComponent.vue'
import { useChartConfig } from '../composables/useChartConfig'

const props = defineProps({
  weightData: {
    type: Array,
    required: true,
    default: () => [],
  },
})

const emit = defineEmits(['openWeightManagement'])

// 注入深色模式狀態
const isDark = inject('isDark', { value: false })

// 使用圖表配置
const { getWeightChartConfig } = useChartConfig(isDark)

// 計算圖表配置
const chartConfig = computed(() => {
  if (!props.weightData || props.weightData.length === 0) {
    return {
      data: {
        labels: [],
        datasets: [
          {
            label: '體重',
            data: [],
            borderColor: isDark.value ? 'rgb(212 212 212)' : 'rgb(147 197 253)',
            backgroundColor: isDark.value ? 'rgb(115 115 115)' : 'rgb(219 234 254)',
            pointRadius: 6,
            pointHoverRadius: 10,
          },
        ],
      },
      options: {
        fill: true,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    }
  }

  return getWeightChartConfig(props.weightData)
})
</script>
