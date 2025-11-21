<template>
  <div class="week-view-container">
    <!-- 週範圍標題 -->
    <div class="week-title">
      <h2 class="text-h4 font-weight-bold text-center">
        {{ weekRange }}
      </h2>
    </div>

    <!-- 週曆格子容器 -->
    <div class="week-calendar-wrapper">
      <div class="week-calendar-grid">
        <v-card v-for="day in weekData" :key="day.date" :class="['day-column', { 'today-column': day.isToday }]" :color="day.isToday ? 'primary' : 'surface'" :variant="day.isToday ? 'tonal' : 'outlined'">
          <!-- 日期標題 -->
          <v-card-title class="text-center pa-3">
            <div class="d-flex flex-column align-center">
              <div class="text-body-1 font-weight-bold">{{ day.date }}</div>
              <div class="text-caption">({{ day.day }})</div>
            </div>
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-2">
            <!-- 新增事項按鈕 -->
            <v-btn color="primary" variant="elevated" block size="small" prepend-icon="mdi-plus" class="mb-2" @click="$emit('openTaskModal', day.date)"> 新增事項 </v-btn>
            
            <!-- 標記按鈕 -->
            <v-btn 
              v-if="day._id"
              :color="day.is_marked ? 'success' : 'grey'"
              :variant="day.is_marked ? 'elevated' : 'outlined'"
              block 
              size="small" 
              :prepend-icon="day.is_marked ? 'mdi-bookmark' : 'mdi-bookmark-outline'"
              class="mb-3" 
              @click="$emit('toggleMark', day._id, day.is_marked)"
            > 
              {{ day.is_marked ? '已標記' : '標記' }} 
            </v-btn>

            <!-- 事項清單 -->
            <div class="records-container">
              <v-card
                v-for="(task, index) in day.records"
                :key="index"
                :class="[
                  'task-item mb-2',
                  {
                    'own-task': task.author === user._id,
                    'shared-task': task.author !== user._id,
                  },
                ]"
                :color="task.author === user._id ? 'surface' : 'amber-lighten-5'"
                variant="outlined"
                @click="task.author === user._id ? $emit('openEditTaskModal', day.date, day._id, task._id, task.time, task.bloodSugar, task.insulin, task.notes, day.notes) : null"
              >
                <v-card-text class="pa-3">
                  <!-- 時間和編輯圖標 -->
                  <div class="d-flex justify-space-between align-center mb-2">
                    <v-chip size="small" color="primary" variant="tonal">
                      <v-icon icon="mdi-clock" size="x-small" class="mr-1" />
                      {{ task.time }}
                    </v-chip>
                    <v-icon v-if="task.author === user._id" icon="mdi-pencil" size="small" color="primary" />
                  </div>

                  <!-- 血糖值 -->
                  <div v-if="task.bloodSugar" class="mb-1">
                    <v-chip size="small" :color="'surface'" variant="outlined" :class="getBloodSugarSeverity(task.bloodSugar)" class="mr-1">
                      <v-icon icon="mdi-water" size="x-small" class="mr-1" />
                      {{ task.bloodSugar }}
                    </v-chip>
                  </div>

                  <!-- 胰島素 -->
                  <div v-if="task.insulin" class="mb-1">
                    <v-chip size="small" color="blue-grey-lighten-3" variant="flat">
                      <v-icon icon="mdi-needle" size="x-small" class="mr-1" />
                      {{ task.insulin }}
                    </v-chip>
                  </div>

                  <!-- 備註 -->
                  <div v-if="task.notes" class="text-body-2 mt-2">
                    <v-icon icon="mdi-comment-text" size="small" class="mr-1" />
                    <span>{{ task.notes }}</span>
                  </div>
                </v-card-text>
              </v-card>

              <!-- 無事項狀態 -->
              <v-card v-if="day.records.length === 0" variant="outlined" class="text-center pa-4">
                <v-icon icon="mdi-calendar-blank" size="48" color="grey-lighten-2" class="mb-2" />
                <p class="text-body-2 text-medium-emphasis">尚無記錄</p>
              </v-card>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  weekData: {
    type: Array,
    required: true,
    default: () => [],
  },
  weekRange: {
    type: String,
    required: true,
  },
  user: {
    type: Object,
    required: true,
  },
})

// 血糖顏色映射函數
// 輕量化配色：用邊框和文字顏色表達嚴重度，降低飽和度
const getBloodSugarSeverity = value => {
  if (!value || value === '---') return 'severity-none'
  if (value >= 400) return 'severity-danger'
  if (value >= 250) return 'severity-warning'
  if (value >= 180) return 'severity-caution'
  if (value >= 70) return 'severity-normal'
  return 'severity-low'
}

const emit = defineEmits(['openTaskModal', 'openEditTaskModal', 'toggleMark'])
</script>

<style scoped>
.week-view-container {
  padding: 16px 0;
}

.week-title {
  padding: 24px 0;
  margin-bottom: 16px;
}

.week-calendar-wrapper {
  overflow-x: auto;
  padding-bottom: 16px;
}

.week-calendar-grid {
  display: flex;
  gap: 12px;
  min-width: 100%;
}

@media (min-width: 1024px) {
  .week-calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 12px;
  }
}

.day-column {
  min-width: 200px;
  height: 700px;
  display: flex;
  flex-direction: column;
  background-color: rgb(var(--v-theme-surface)) !important;
  color: rgb(var(--v-theme-on-surface)) !important;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
  transition: background-color 0.1s ease, color 0.1s ease, border-color 0.1s ease;
}

.day-column .v-card-title {
  color: rgba(var(--v-theme-on-surface), 0.87);
}

@media (max-width: 1023px) {
  .day-column {
    flex-shrink: 0;
    width: 200px;
  }
}

.day-column.today-column {
  border: 2px solid rgb(var(--v-theme-primary)) !important;
  box-shadow: 0 4px 8px rgba(var(--v-theme-primary), 0.2);
}

.records-container {
  height: 580px;
  overflow-y: auto;
  padding-right: 4px;
}

.task-item {
  transition: all 0.2s ease;
  background-color: rgb(var(--v-theme-surface)) !important;
  color: rgb(var(--v-theme-on-surface)) !important;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}

.task-item.own-task {
  cursor: pointer;
}

.task-item.own-task:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.task-item.shared-task {
  cursor: not-allowed;
  opacity: 0.8;
}

.task-item .text-body-2 {
  color: rgba(var(--v-theme-on-surface), 0.75) !important;
}

/* 自定義滾動條樣式 */
.records-container::-webkit-scrollbar {
  width: 6px;
}

.records-container::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.records-container::-webkit-scrollbar-thumb {
  background-color: rgba(var(--v-theme-on-surface), 0.2);
  border-radius: 3px;
}

.records-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.3);
}

/* Firefox 滾動條樣式 */
.records-container {
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-on-surface), 0.2) transparent;
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
