<template>
  <v-container fluid class="pa-0">
    <v-row align="center" justify="space-around" no-gutters>
      <!-- 日曆顯示模式切換 -->
      <v-col cols="12" md="3" class="justify-center py-2 d-flex">
        <v-btn-toggle v-model="calendarDisplayProxy" mandatory density="comfortable">
          <v-btn :value="'month'" icon><v-icon icon="mdi-calendar-month-outline" /></v-btn>
          <v-btn :value="'week'" icon><v-icon icon="mdi-calendar-week-outline" /></v-btn>
        </v-btn-toggle>
      </v-col>

      <!-- 年月選擇器 -->
      <v-col cols="12" md="5" class="justify-center py-2 d-flex">
        <v-select
          class="mr-2"
          style="max-width: 200px"
          density="comfortable"
          variant="outlined"
          label="年份"
          :items="years"
          item-title="label"
          item-value="value"
          :model-value="selectedYearProxy"
          @update:modelValue="
            v => {
              selectedYearProxy = v
              $emit('goToFirstWeekOfSelectedMonth')
            }
          "
        />
        <v-select
          style="max-width: 200px"
          density="comfortable"
          variant="outlined"
          label="月份"
          :items="months"
          item-title="label"
          item-value="value"
          :model-value="selectedMonthProxy"
          @update:modelValue="
            v => {
              selectedMonthProxy = v
              $emit('goToFirstWeekOfSelectedMonth')
            }
          "
        />
      </v-col>

      <!-- 週視圖導航按鈕 -->
      <v-col v-if="calendarDisplayProxy === 'week'" cols="12" md="4" class="justify-center py-2 d-flex">
        <v-btn color="primary" class="mr-3" prepend-icon="mdi-chevron-left-circle" @click="$emit('prevWeek')">上週</v-btn>
        <v-btn color="primary" append-icon="mdi-chevron-right-circle" @click="$emit('nextWeek')">下週</v-btn>
      </v-col>

      <!-- 月視圖導航按鈕 -->
      <v-col v-else cols="12" md="4" class="justify-center py-2 d-flex">
        <v-btn color="primary" class="mr-3" prepend-icon="mdi-chevron-left-circle" @click="$emit('prevMonth')">前月</v-btn>
        <v-btn color="primary" append-icon="mdi-chevron-right-circle" @click="$emit('nextMonth')">下月</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  calendarDisplay: { type: String, required: true },
  selectedYear: { type: [String, Number], required: true },
  selectedMonth: { type: [String, Number], required: true },
  years: { type: Array, required: true },
  months: { type: Array, required: true },
})

const emit = defineEmits(['update:calendarDisplay', 'update:selectedYear', 'update:selectedMonth', 'goToFirstWeekOfSelectedMonth', 'prevWeek', 'nextWeek', 'prevMonth', 'nextMonth'])

const calendarDisplayProxy = computed({
  get: () => props.calendarDisplay,
  set: v => emit('update:calendarDisplay', v),
})
const selectedYearProxy = computed({
  get: () => props.selectedYear,
  set: v => emit('update:selectedYear', v),
})
const selectedMonthProxy = computed({
  get: () => props.selectedMonth,
  set: v => emit('update:selectedMonth', v),
})
</script>
