<template>
  <div class="rounded-lg shadow-lg bg-white dark:bg-darkPrimary-700 mt-6 p-4">
    <div class="flex flex-col gap-4 mb-4">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h3 class="text-lg font-semibold text-primary-900 dark:text-darkPrimary-50">血糖曲線圖表</h3>
        
        <!-- 資料統計 -->
        <div class="text-sm text-gray-600 dark:text-darkPrimary-300">
          顯示 {{ filteredCount }} / {{ totalCount }} 筆記錄
        </div>
      </div>

      <!-- 年份月份選擇器 -->
      <div v-show="yearMonthStats.years.length > 0" class="border-t pt-4 dark:border-darkPrimary-500">
        <!-- 年份選擇 -->
        <div class="mb-4">
          <h4 class="text-sm font-medium text-primary-900 dark:text-darkPrimary-50 mb-2">選擇年份：</h4>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              :class="[
                'px-3 py-1 text-sm rounded-full border transition-all',
                yearMonthStats.selectedYear === null
                  ? 'bg-primary-500 hover:bg-primary-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white border-primary-500 dark:border-indigo-600'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-darkPrimary-600 dark:hover:bg-darkPrimary-500 text-primary-900 dark:text-darkPrimary-50 border-gray-300 dark:border-darkPrimary-400'
              ]"
              @click="$emit('clearYearMonthSelection')"
            >
              全部年份
            </button>
            <button
              v-for="yearData in yearMonthStats.years"
              :key="yearData.year"
              type="button"
              :class="[
                'relative px-3 py-1 text-sm rounded-full border transition-all',
                yearMonthStats.selectedYear === yearData.year
                  ? 'bg-primary-500 hover:bg-primary-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white border-primary-500 dark:border-indigo-600'
                  : 'bg-white hover:bg-gray-50 dark:bg-darkPrimary-600 dark:hover:bg-darkPrimary-500 text-primary-900 dark:text-darkPrimary-50 border-gray-300 dark:border-darkPrimary-400'
              ]"
              @click="$emit('selectYear', yearData.year)"
            >
              <span>{{ yearData.year }}</span>
              <span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                {{ yearData.count }}
              </span>
            </button>
          </div>
        </div>

        <!-- 月份選擇 -->
        <div v-show="yearMonthStats.selectedYear && yearMonthStats.months.length > 0" class="mb-4">
          <h4 class="text-sm font-medium text-primary-900 dark:text-darkPrimary-50 mb-2">
            選擇月份 ({{ yearMonthStats.selectedYear }}年)：
          </h4>
          <div class="grid grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              v-for="monthData in yearMonthStats.months"
              :key="monthData.month"
              type="button"
              :class="[
                'relative px-3 py-2 text-sm rounded-full border transition-all',
                monthData.count === 0
                  ? 'bg-gray-100 dark:bg-darkPrimary-600 text-gray-400 dark:text-darkPrimary-400 border-gray-200 dark:border-darkPrimary-500 cursor-not-allowed'
                  : yearMonthStats.selectedMonth === monthData.month
                    ? 'bg-primary-500 hover:bg-primary-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white border-primary-500 dark:border-indigo-600'
                    : 'bg-white hover:bg-gray-50 dark:bg-darkPrimary-600 dark:hover:bg-darkPrimary-500 text-primary-900 dark:text-darkPrimary-50 border-gray-300 dark:border-darkPrimary-400'
              ]"
              :disabled="monthData.count === 0"
              @click="monthData.count > 0 ? $emit('selectMonth', yearMonthStats.selectedYear, monthData.month) : null"
            >
              <span>{{ monthData.monthName }}</span>
              <span 
                v-if="monthData.count > 0"
                class="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none"
              >
                {{ monthData.count }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  yearMonthStats: {
    type: Object,
    required: true,
    default: () => ({
      years: [],
      months: [],
      selectedYear: null,
      selectedMonth: null
    })
  },
  filteredCount: {
    type: Number,
    default: 0
  },
  totalCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'selectYear',
  'selectMonth', 
  'clearYearMonthSelection'
])
</script>