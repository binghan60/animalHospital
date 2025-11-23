<template>
  <v-card class="mt-6">
    <v-card-text>
      <v-row align="center" justify="space-between" class="flex-wrap">
        <!-- 標題和統計 -->
        <v-col cols="12" md="auto">
          <h3 class="text-h6 font-weight-semibold">血糖曲線圖表</h3>
          <div class="text-body-2 text-medium-emphasis">顯示 {{ filteredCount }} / {{ totalCount }} 筆記錄</div>
        </v-col>

        <!-- 新增按鈕 -->
        <v-col v-if="showAddButton" cols="12" md="auto">
          <v-btn color="pink" prepend-icon="mdi-plus" @click="$emit('openAddCurve')"> 新增血糖曲線 </v-btn>
        </v-col>

        <!-- 篩選器 -->
        <v-col v-if="yearMonthStats.years.length > 0" cols="12" md="auto" class="d-flex flex-wrap ga-2">
          <!-- 年份篩選 -->
          <v-chip :variant="yearMonthStats.selectedYear === null ? 'elevated' : 'outlined'" :color="yearMonthStats.selectedYear === null ? 'primary' : ''" @click="$emit('clearYearMonthSelection')"> 全部 </v-chip>
          <v-badge v-for="yearData in yearMonthStats.years" :key="yearData.year" :content="yearData.count" color="error" offset-x="-2" offset-y="-2">
            <v-chip :variant="yearMonthStats.selectedYear === yearData.year ? 'elevated' : 'outlined'" :color="yearMonthStats.selectedYear === yearData.year ? 'primary' : ''" @click="$emit('selectYear', yearData.year)"> {{ yearData.year }} 年 </v-chip>
          </v-badge>

          <!-- 月份篩選 -->
          <template v-if="yearMonthStats.selectedYear && yearMonthStats.months.length > 0">
            <v-divider vertical class="mx-2" />
            <v-badge v-for="monthData in yearMonthStats.months" :key="monthData.month" :content="monthData.count" color="error" offset-x="-2" offset-y="-2" :model-value="monthData.count > 0">
              <v-chip :variant="yearMonthStats.selectedMonth === monthData.month ? 'elevated' : 'outlined'" :color="yearMonthStats.selectedMonth === monthData.month ? 'primary' : ''" :disabled="monthData.count === 0" @click="monthData.count > 0 ? $emit('selectMonth', yearMonthStats.selectedYear, monthData.month) : null">
                {{ monthData.monthName }}
              </v-chip>
            </v-badge>
          </template>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
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
      selectedMonth: null,
    }),
  },
  filteredCount: {
    type: Number,
    default: 0,
  },
  totalCount: {
    type: Number,
    default: 0,
  },
  showAddButton: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['selectYear', 'selectMonth', 'clearYearMonthSelection', 'openAddCurve'])
</script>
