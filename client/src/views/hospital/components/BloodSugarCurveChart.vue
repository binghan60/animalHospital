<template>
  <div 
    v-for="(chart, index) in chartConfigs" 
    :key="chart.date" 
    class="rounded-lg overflow-hidden shadow-lg bg-white mt-4 p-4 w-full dark:bg-darkPrimary-700"
  >
    <!-- 圖表標題和編輯按鈕 -->
    <div class="flex justify-between items-center mb-4">
      <h4 class="text-lg font-semibold text-primary-900 dark:text-darkPrimary-50">
        {{ new Date(curveData[index].date).toISOString().split('T')[0] }} 血糖曲線
      </h4>
      <div class="flex gap-2">
        <button
          type="button"
          class="px-3 py-1 text-sm text-white rounded-md bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          @click="$emit('editCurve', curveData[index])"
        >
          <i class="fa-solid fa-edit fa-fw"></i> 編輯
        </button>
        <button
          type="button"
          class="px-3 py-1 text-sm text-white rounded-md bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
          @click="$emit('deleteCurve', curveData[index])"
        >
          <i class="fa-solid fa-trash fa-fw"></i> 刪除
        </button>
      </div>
    </div>
    <!-- 圖表區域 -->
    <div class="h-[300px]">
      <ChartComponent 
        type="line" 
        :chartData="chart.data" 
        :chartOptions="chart.option"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import ChartComponent from '@/components/ChartComponent.vue'
import { useChartConfig } from '../composables/useChartConfig'

const props = defineProps({
  curveData: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['editCurve', 'deleteCurve'])

// 注入深色模式狀態
const isDark = inject('isDark', { value: false })

// 使用圖表配置
const { getBloodSugarCurveChartConfig } = useChartConfig(isDark)

// 計算圖表配置
const chartConfigs = computed(() => {
  if (!props.curveData || props.curveData.length === 0) {
    return []
  }
  
  return getBloodSugarCurveChartConfig(props.curveData)
})
</script>