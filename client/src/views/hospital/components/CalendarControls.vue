<template>
  <div class="grid items-center justify-around grid-cols-5 lg:grid-cols-4">
    <!-- 日曆顯示模式切換 -->
    <div class="w-full flex items-center justify-center h-[50px] space-x-4 col-span-2 lg:col-span-1">
      <label for="calendarDisplay-day">
        <input id="calendarDisplay-day" v-model="calendarDisplay" type="radio" name="calendar" value="month" class="hidden peer" />
        <span class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 text-primary-800 dark:text-indigo-800 dark:bg-indigo-100 bg-primary-100 dark:peer-checked:bg-indigo-500 peer-checked:bg-primary-500 hover:bg-primary-200 dark:hover:bg-indigo-200 dark:peer-checked:text-darkPrimary-50 peer-checked:text-white">
          <i class="fa-solid fa-calendar-days fa-fw"></i>
        </span>
      </label>
      <label for="calendarDisplay-month">
        <input id="calendarDisplay-month" v-model="calendarDisplay" type="radio" name="calendar" value="week" class="hidden peer" />
        <span class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 text-primary-800 dark:text-indigo-800 dark:bg-indigo-100 bg-primary-100 dark:peer-checked:bg-indigo-500 peer-checked:bg-primary-500 hover:bg-primary-200 dark:hover:bg-indigo-200 dark:peer-checked:text-darkPrimary-50 peer-checked:text-white">
          <i class="fa-regular fa-calendar fa-fw"></i>
        </span>
      </label>
    </div>

    <!-- 年月選擇器 -->
    <div class="w-full col-span-3 space-x-2 text-center lg:col-span-1 lg:space-x-6">
      <select v-model="selectedYear" class="h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" @change="$emit('goToFirstWeekOfSelectedMonth')">
        <option v-for="year in years" :key="year.value" :value="year.value">
          {{ year.label }}
        </option>
      </select>
      <select v-model="selectedMonth" class="h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" @change="$emit('goToFirstWeekOfSelectedMonth')">
        <option v-for="month in months" :key="month.value" :value="month.value">
          {{ month.label }}
        </option>
      </select>
    </div>

    <!-- 資料顯示篩選 -->
    <div class="w-full flex items-center justify-center h-[50px] space-x-4 col-span-5 lg:col-span-1">
      <label for="dataDisplay-all">
        <input id="dataDisplay-all" v-model="dataDisplay" type="radio" name="dataDisplay" value="all" class="hidden peer" :disabled="calendarDisplay === 'month'" />
        <span
          :class="{
            'cursor-not-allowed opacity-50 bg-gray-300 text-gray-500': calendarDisplay === 'month',
          }"
          class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 text-primary-800 dark:text-indigo-800 dark:bg-indigo-100 bg-primary-100 dark:peer-checked:bg-indigo-500 peer-checked:bg-primary-500 hover:bg-primary-200 dark:hover:bg-indigo-200 dark:peer-checked:text-darkPrimary-50 peer-checked:text-white"
        >
          <i class="fa-solid fa-users fa-fw"></i>
        </span>
      </label>
      <label for="dataDisplay-user">
        <input id="dataDisplay-user" v-model="dataDisplay" type="radio" name="dataDisplay" value="user" class="hidden peer" :disabled="calendarDisplay === 'month'" />
        <span
          :class="{
            'cursor-not-allowed opacity-50 bg-gray-300 text-gray-500': calendarDisplay === 'month',
          }"
          class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 text-primary-800 dark:text-indigo-800 dark:bg-indigo-100 bg-primary-100 dark:peer-checked:bg-indigo-500 peer-checked:bg-primary-500 hover:bg-primary-200 dark:hover:bg-indigo-200 dark:peer-checked:text-darkPrimary-50 peer-checked:text-white"
        >
          <i class="fa-solid fa-user fa-fw"></i>
        </span>
      </label>
      <label for="dataDisplay-other">
        <input id="dataDisplay-other" v-model="dataDisplay" type="radio" name="dataDisplay" value="other" class="hidden peer" :disabled="calendarDisplay === 'month'" />
        <span
          :class="{
            'cursor-not-allowed opacity-50 bg-gray-300 text-gray-500': calendarDisplay === 'month',
          }"
          class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 text-primary-800 dark:text-indigo-800 dark:bg-indigo-100 bg-primary-100 dark:peer-checked:bg-indigo-500 peer-checked:bg-primary-500 hover:bg-primary-200 dark:hover:bg-indigo-200 dark:peer-checked:text-darkPrimary-50 peer-checked:text-white"
        >
          <i class="fa-solid fa-user-slash fa-fw"></i>
        </span>
      </label>
    </div>

    <!-- 週視圖導航按鈕 -->
    <div v-show="calendarDisplay === 'week'" class="col-span-5 lg:col-span-1 w-full flex items-center justify-center h-[50px] space-x-6">
      <button type="button" class="px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600 dark:bg-indigo-600 dark:hover:bg-indigo-700" @click="$emit('prevWeek')"><i class="fa-solid fa-circle-left fa-fw"></i> 上週</button>
      <button type="button" class="px-4 py-2 text-white rounded-md bg-primary-500 dark:bg-indigo-600 dark:hover:bg-indigo-700 hover:bg-primary-600" @click="$emit('nextWeek')">下週 <i class="fa-solid fa-circle-right fa-fw"></i></button>
    </div>

    <!-- 月視圖導航按鈕 -->
    <div v-show="calendarDisplay === 'month'" class="col-span-5 lg:col-span-1 w-full flex items-center justify-center h-[50px] space-x-6">
      <button type="button" class="px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600 dark:bg-indigo-600 dark:hover:bg-indigo-700" @click="$emit('prevMonth')"><i class="fa-solid fa-circle-left fa-fw"></i> 前月</button>
      <button type="button" class="px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600 dark:bg-indigo-600 dark:hover:bg-indigo-700" @click="$emit('nextMonth')">下月 <i class="fa-solid fa-circle-right fa-fw"></i></button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  calendarDisplay: {
    type: String,
    required: true,
  },
  dataDisplay: {
    type: String,
    required: true,
  },
  selectedYear: {
    type: [String, Number],
    required: true,
  },
  selectedMonth: {
    type: [String, Number],
    required: true,
  },
  years: {
    type: Array,
    required: true,
  },
  months: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['update:calendarDisplay', 'update:dataDisplay', 'update:selectedYear', 'update:selectedMonth', 'goToFirstWeekOfSelectedMonth', 'prevWeek', 'nextWeek', 'prevMonth', 'nextMonth'])

// 使用 v-model 的計算屬性
const calendarDisplay = computed({
  get: () => props.calendarDisplay,
  set: value => emit('update:calendarDisplay', value),
})

const dataDisplay = computed({
  get: () => props.dataDisplay,
  set: value => emit('update:dataDisplay', value),
})

const selectedYear = computed({
  get: () => props.selectedYear,
  set: value => emit('update:selectedYear', value),
})

const selectedMonth = computed({
  get: () => props.selectedMonth,
  set: value => emit('update:selectedMonth', value),
})
</script>
