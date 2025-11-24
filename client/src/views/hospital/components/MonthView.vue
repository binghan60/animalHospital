<template>
  <div class="month-view-container">
    <!-- 月份標題 -->
    <div class="month-title">
      <h2 class="text-h4 font-weight-bold text-center">{{ newtoday.year }} 年 {{ newtoday.month + 1 }} 月 血糖總覽</h2>
    </div>

    <!-- 週標題 (桌面版) -->
    <div class="week-headers d-none d-lg-grid">
      <div v-for="day in ['一', '二', '三', '四', '五', '六', '日']" :key="day" class="week-header-cell">
        <div class="text-h6 font-weight-medium">{{ day }}</div>
      </div>
    </div>

    <!-- 日曆格子容器 -->
    <div class="calendar-grid">
      <template v-for="(day, index) in calendar" :key="day.isoDate || index">
        <v-card v-if="day.day" :class="['day-card', { 'today-card': day.isToday, clickable: day.records?.length }]" variant="outlined" @click="day.records?.length ? $emit('dayClicked', day) : null">
          <v-card-title class="day-title">
            <div class="text-body-1 font-weight-bold d-flex align-center justify-space-between">
              <span>
                {{ day.month }}/{{ day.day }}
                <v-chip v-if="day.records?.length > 2" size="x-small" color="warning" variant="tonal" class="ml-1">多筆</v-chip>
              </span>
              <!-- 標記圖示 -->
              <v-btn
                v-if="day._id"
                :prepend-icon="day.is_marked ? 'mdi-bookmark' : 'mdi-bookmark-outline'"
                :color="day.is_marked ? 'success' : 'grey'"
                size="small"
                variant="tonal"
                class="bookmark-btn"
                @click.stop="$emit('toggleMark', day._id, day.is_marked)"
              >
                {{ day.is_marked ? '已標記' : '標記' }}
              </v-btn>
            </div>
          </v-card-title>

          <v-card-text class="pa-2">
            <!-- 早上 -->
            <div class="data-section">
              <div class="time-header">
                <v-icon icon="mdi-weather-sunny" size="small" color="orange-darken-2" />
                <span class="text-body-2 font-weight-medium text-medium-emphasis">{{ calendar[index].morning.time || '---' }}</span>
              </div>
              <div class="chips-group">
                <v-chip :class="getBloodSugarColor(calendar[index].morning.bloodSugar)" size="small" variant="flat" class="data-chip">
                  <v-icon icon="mdi-water-outline" start />
                  {{ calendar[index].morning.bloodSugar || '---' }}
                </v-chip>
                <v-chip size="small" variant="tonal" class="data-chip">
                  <v-icon icon="mdi-needle" start />
                  {{ calendar[index].morning.insulin ?? '---' }}
                </v-chip>
              </div>
            </div>

            <!-- 晚上 -->
            <div class="data-section">
              <div class="time-header">
                <v-icon icon="mdi-weather-night" size="small" color="indigo-darken-2" />
                <span class="text-body-2 font-weight-medium text-medium-emphasis">{{ calendar[index].evening.time || '---' }}</span>
              </div>
              <div class="chips-group">
                <v-chip :class="getBloodSugarColor(calendar[index].evening.bloodSugar)" size="small" variant="flat" class="data-chip">
                  <v-icon icon="mdi-water-outline" start />
                  {{ calendar[index].evening.bloodSugar || '---' }}
                </v-chip>
                <v-chip size="small" variant="tonal" class="data-chip">
                  <v-icon icon="mdi-needle" start />
                  {{ calendar[index].evening.insulin ?? '---' }}
                </v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- 空白日期 -->
        <div v-else class="empty-day d-none d-lg-block"></div>
      </template>
    </div>

    <!-- 提示框 (保持不變) -->
    <div v-show="showTooltip" class="absolute p-3 bg-white border rounded-lg shadow-lg dark:bg-darkPrimary-700 border-primary-400 dark:border-darkPrimary-400" :style="tooltipStyle">
      <!-- ... 提示框內容 ... -->
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  calendar: Array,
  newtoday: Object,
  showTooltip: Boolean,
  hoverData: Array,
  tooltipStyle: Object,
})

// 使用 Vuetify 的顏色名稱，搭配 v-chip 的 tonal variant
const getBloodSugarColor = value => {
  if (!value || value === '---') return 'severity-none'
  if (value >= 400) return 'severity-danger'
  if (value >= 250) return 'severity-warning'
  if (value >= 180) return 'severity-caution'
  if (value >= 70) return 'severity-normal'
  return 'severity-low'
}

const emit = defineEmits(['showTips', 'hideTooltip', 'toggleMark', 'dayClicked'])
</script>

<style scoped>
.month-view-container {
  padding: 16px 0;
}

.month-title {
  padding: 24px 0;
  margin-bottom: 16px;
}

.week-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 16px;
  padding: 0 4px;
}

.week-header-cell {
  text-align: center;
  padding: 12px 8px;
  background-color: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 8px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 8px;
}

@media (min-width: 1024px) {
  .calendar-grid {
    grid-template-columns: repeat(7, 1fr);
  }
}

.filtered-calendar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .filtered-calendar-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

@media (min-width: 1200px) {
  .filtered-calendar-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.day-card {
  min-height: 220px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  background-color: rgb(var(--v-theme-surface)) !important;
  color: rgb(var(--v-theme-on-surface)) !important;
}

.day-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.day-card.today-card {
  border: 2px solid rgb(var(--v-theme-primary));
  box-shadow: 0 0 12px rgba(var(--v-theme-primary), 0.2);
}

.day-title {
  text-align: center;
  padding: 12px 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.day-card .v-card-text {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 8px;
}

.data-section {
  padding: 8px;
  border-radius: 8px;
}

.time-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 8px;
}

.chips-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.data-chip {
  width: 100%;
  justify-content: center;
}

.data-chip .v-icon {
  margin-right: 4px;
}

.empty-day {
  border: 1px dashed rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

.bookmark-btn {
  opacity: 0.8;
  transition: opacity 0.2s ease-in-out;
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
