<template>
  <v-card class="mt-4 blood-sugar-calendar-card">
    <v-card-text class="pa-4">
      <CalendarControls v-model:calendarDisplay="calendarDisplay" v-model:selectedYear="selectedYear" v-model:selectedMonth="selectedMonth" :years="years" :months="months" @goToFirstWeekOfSelectedMonth="goToFirstWeekOfSelectedMonth" @prevWeek="prevWeek" @nextWeek="nextWeek" @prevMonth="handlePrevMonth" @nextMonth="handleNextMonth" @goToMarkedDiary="goToMarkedDiary" />

      <!-- 月視圖 -->
      <MonthView v-show="calendarDisplay === 'month'" :calendar="calendar" :newtoday="newtoday" :showTooltip="showTooltip" :hoverData="hoverData" :tooltipStyle="tooltipStyle" @showTips="showTips" @hideTooltip="showTooltip = false" @toggleMark="toggleMark" @dayClicked="openDayDetailDialog" />

      <!-- 週視圖 -->
      <WeekView v-show="calendarDisplay === 'week'" :weekData="weekData" :weekRange="weekRange" :user="user" @openTaskModal="openTaskModal" @openEditTaskModal="openEditTaskModal" @toggleMark="toggleMark" />
    </v-card-text>

    <!-- 新增事項 v-dialog -->
    <v-dialog v-model="modals.addNotes.toggle" max-width="480">
      <v-card>
        <v-card-title>新增事項 {{ newRecord.date }}</v-card-title>
        <v-card-text>
          <VForm @submit="createTaskAndEmit">
            <VuTextField v-model="newRecord.time" name="add_time" label="時間" type="time" rules="required" class="mb-3" />
            <VuTextField v-model="newRecord.bloodSugar" name="add_bloodSugar" label="血糖" type="number" rules="atLeastOneFieldRule:@add_insulin,@add_notes" class="mb-3" />
            <VuTextField v-model="newRecord.insulin" name="add_insulin" label="胰島素" type="text" rules="atLeastOneFieldRule:@add_bloodSugar,@add_notes" class="mb-3" />
            <VuTextField v-model="newRecord.notes" name="add_notes" label="備註" type="text" rules="atLeastOneFieldRule:@add_bloodSugar,@add_insulin" class="mb-3" />
            <div class="justify-end mt-2 d-flex">
              <v-btn variant="text" @click="closeTaskModal">取消</v-btn>
              <v-btn :loading="isLoading" type="submit" color="primary" class="ml-2">新增</v-btn>
            </div>
          </VForm>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 編輯事項 v-dialog -->
    <v-dialog v-model="modals.editNotes.toggle" max-width="480">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>編輯事項 {{ editRecord.date }}</span>
          <v-btn icon color="error" @click="deleteTaskAndEmit(editRecord.recordId, editRecord.taskId)"><v-icon icon="mdi-delete" /></v-btn>
        </v-card-title>
        <v-card-text>
          <VForm @submit="editTaskAndEmit">
            <VuTextField v-model="editRecord.task.time" name="time" label="時間" type="time" rules="required" class="mb-3" />
            <VuTextField v-model="editRecord.task.bloodSugar" name="bloodSugar" label="血糖" type="number" rules="atLeastOneFieldRule:@insulin,@notes" class="mb-3" />
            <VuTextField v-model="editRecord.task.insulin" name="insulin" label="胰島素" type="text" rules="atLeastOneFieldRule:@bloodSugar,@notes" class="mb-3" />
            <VuTextField v-model="editRecord.task.notes" name="notes" label="備註" type="text" rules="atLeastOneFieldRule:@bloodSugar,@insulin" class="mb-3" />
            <div class="justify-end mt-2 d-flex">
              <v-btn variant="text" @click="modals.editNotes.toggle = false">取消</v-btn>
              <v-btn :loading="isLoading" type="submit" color="primary" class="ml-2">修改</v-btn>
            </div>
          </VForm>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 新增事項模態框 -->
    <div v-show="false && modals.addNotes.toggle" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" @mousedown="closeTaskModal">
      <div class="p-6 bg-white rounded-md shadow-lg w-96 dark:bg-darkPrimary-700" @mousedown.stop>
        <VForm @submit="createTaskAndEmit">
          <h3 class="mb-4 text-lg font-semibold dark:text-darkPrimary-50">新增事項 {{ newRecord.date }}</h3>

          <div class="mb-4">
            <label class="block mb-1 text-sm font-medium dark:text-darkPrimary-50">時間</label>
            <VField v-model="newRecord.time" rules="required" name="time" type="time" class="w-full h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" />
            <ErrorMessage name="time" class="mt-1 text-sm text-red-500 dark:text-rose-400" />
          </div>

          <div class="mb-4">
            <label class="block mb-1 text-sm font-medium dark:text-darkPrimary-50">血糖</label>
            <VField v-model="newRecord.bloodSugar" name="bloodSugar" rules="atLeastOneFieldRule:@insulin,@notes" type="number" placeholder="輸入血糖(選填)" class="w-full h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
            <ErrorMessage name="bloodSugar" class="mt-1 text-sm text-red-500 dark:text-rose-400" />
          </div>

          <div class="mb-4">
            <label class="block mb-1 text-sm font-medium dark:text-darkPrimary-50">胰島素</label>
            <VField v-model="newRecord.insulin" name="insulin" rules="atLeastOneFieldRule:@bloodSugar,@notes" type="text" placeholder="輸入胰島素(選填)" class="w-full h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
            <ErrorMessage name="insulin" class="mt-1 text-sm text-red-500 dark:text-rose-400" />
          </div>

          <div class="mb-4">
            <label class="block mb-1 text-sm font-medium dark:text-darkPrimary-50">備註</label>
            <VField v-model="newRecord.notes" name="notes" rules="atLeastOneFieldRule:@bloodSugar,@insulin" type="text" placeholder="輸入備註(選填)" class="w-full h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
            <ErrorMessage name="notes" class="mt-1 text-sm text-red-500 dark:text-rose-400" />
          </div>

          <div class="flex justify-between gap-4">
            <button type="button" class="w-[140px] px-6 py-2 text-gray-700 transition-all bg-gray-300 rounded-lg shadow-md dark:bg-darkPrimary-50 hover:dark:bg-darkPrimary-400 hover:bg-gray-400" @click="closeTaskModal">取消</button>
            <button v-if="isLoading" class="w-[140px] inline-flex items-center justify-center px-6 py-2 rounded-md bg-primary-600 dark:bg-indigo-600 text-darkPrimary-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-auto" disabled>
              <div class="w-4 h-4 border-2 border-white border-solid rounded-full animate-spin border-t-transparent"></div>
              <span class="ml-2">新增中... </span>
            </button>
            <button v-else type="submit" class="w-[140px] px-6 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700 dark:bg-indigo-600 dark:hover:bg-indigo-700">新增</button>
          </div>
        </VForm>
      </div>
    </div>

    <!-- 編輯事項模態框 -->
    <div v-show="false && modals.editNotes.toggle" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" @mousedown="modals.editNotes.toggle = false">
      <div class="p-6 bg-white rounded-md shadow-lg w-96 dark:bg-darkPrimary-700" @mousedown.stop>
        <VForm @submit="editTaskAndEmit">
          <div class="flex items-center justify-between mb-4">
            <h3 class="mb-4 text-lg font-semibold dark:text-darkPrimary-50">編輯事項 {{ editRecord.date }}</h3>
            <button type="button" class="h-10 max-h-[60px] w-10 max-w-[60px] select-none rounded-lg transition-all dark:hover:bg-darkPrimary-600 hover:bg-gray-900/10" @click="deleteTaskAndEmit(editRecord.recordId, editRecord.taskId)">
              <i class="text-xl text-red-600 dark:text-rose-400 fa-solid fa-trash fa-fw"></i>
            </button>
          </div>

          <div class="mb-4">
            <label class="block mb-1 text-sm font-medium dark:text-darkPrimary-50">時間</label>
            <VField v-model="editRecord.task.time" rules="required" name="time" type="time" class="w-full h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" />
            <ErrorMessage name="time" class="mt-1 text-sm text-red-500 dark:text-rose-400" />
          </div>

          <div class="mb-4">
            <label class="block mb-1 text-sm font-medium dark:text-darkPrimary-50">血糖</label>
            <VField v-model="editRecord.task.bloodSugar" name="bloodSugar" rules="atLeastOneFieldRule:@insulin,@notes" type="number" placeholder="輸入血糖(選填)" class="w-full h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
            <ErrorMessage name="bloodSugar" class="mt-1 text-sm text-red-500 dark:text-rose-400" />
          </div>

          <div class="mb-4">
            <label class="block mb-1 text-sm font-medium dark:text-darkPrimary-50">胰島素</label>
            <VField v-model="editRecord.task.insulin" name="insulin" rules="atLeastOneFieldRule:@bloodSugar,@notes" type="text" placeholder="輸入胰島素(選填)" class="w-full h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
            <ErrorMessage name="insulin" class="mt-1 text-sm text-red-500 dark:text-rose-400" />
          </div>

          <div class="mb-4">
            <label class="block mb-1 text-sm font-medium dark:text-darkPrimary-50">備註</label>
            <VField v-model="editRecord.task.notes" name="notes" rules="atLeastOneFieldRule:@bloodSugar,@insulin" type="text" placeholder="輸入備註(選填)" class="w-full h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
            <ErrorMessage name="notes" class="mt-1 text-sm text-red-500 dark:text-rose-400" />
          </div>

          <div class="flex justify-between gap-4">
            <button type="button" class="w-[140px] px-6 py-2 text-gray-700 transition-all bg-gray-300 rounded-lg shadow-md dark:bg-darkPrimary-50 hover:dark:bg-darkPrimary-400 hover:bg-gray-400" @click="modals.editNotes.toggle = false">取消</button>
            <button v-if="isLoading" class="w-[140px] inline-flex items-center justify-center px-6 py-2 rounded-md bg-primary-600 dark:bg-indigo-600 text-darkPrimary-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-auto" disabled>
              <div class="w-4 h-4 border-2 border-white border-solid rounded-full animate-spin border-t-transparent"></div>
              <span class="ml-2">修改中... </span>
            </button>
            <button v-else type="submit" class="w-[140px] px-6 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700 dark:bg-indigo-600 dark:hover:bg-indigo-700">修改</button>
          </div>
        </VForm>
      </div>
    </div>

    <!-- 手機版提示 v-dialog -->
    <v-dialog v-model="modals.tips.toggle" max-width="600px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>血糖記錄詳情</span>
          <v-btn icon="mdi-close" @click="modals.tips.toggle = false" />
        </v-card-title>

        <v-card-text>
          <v-table>
            <thead>
              <tr>
                <th>時間</th>
                <th>血糖值</th>
                <th>胰島素</th>
                <th>備註</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="data in hoverData" :key="data.id">
                <td>{{ data?.time }}</td>
                <td>{{ data?.bloodSugar || '無' }}</td>
                <td>{{ data?.insulin || '無' }}</td>
                <td>{{ data?.notes || '無' }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Day Detail Dialog -->
    <v-dialog v-model="dayDetailDialog" max-width="600px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ selectedDayForDetail?.date.split('T')[0] }} 血糖記錄</span>
          <v-btn icon="mdi-close" variant="text" @click="closeDayDetailDialog"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-table>
            <thead>
              <tr>
                <th class="text-left">時間</th>
                <th class="text-left">血糖</th>
                <th class="text-left">胰島素</th>
                <th class="text-left">備註</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in selectedDayForDetail?.records" :key="record._id" :class="[index % 2 === 1 ? (isDark ? 'bg-grey-darken-3' : 'bg-grey-lighten-4') : '']">
                <td>{{ record.time }}</td>
                <td>{{ record.bloodSugar }}</td>
                <td>{{ record.insulin }}</td>
                <td>{{ record.notes }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="closeDayDetailDialog"> 關閉 </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<style scoped>
.blood-sugar-calendar-card {
  min-height: 800px;
  background-color: rgb(var(--v-theme-surface)) !important;
  color: rgb(var(--v-theme-on-surface)) !important;
  transition:
    background-color 0.1s ease,
    color 0.1s ease;
}

@media (min-width: 1024px) {
  .blood-sugar-calendar-card {
    min-height: 1000px;
    background-color: rgb(var(--v-theme-surface)) !important;
    color: rgb(var(--v-theme-on-surface)) !important;
    transition:
      background-color 0.1s ease,
      color 0.1s ease;
  }
}
</style>

<script setup>
import { watch, onMounted, computed } from 'vue'
import authStore from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { Field as VField, Form as VForm, ErrorMessage } from 'vee-validate'
import { useBloodSugarCalendar } from '../composables/useBloodSugarCalendar'
import CalendarControls from './CalendarControls.vue'
import MonthView from './MonthView.vue'
import WeekView from './WeekView.vue'
import VuTextField from '@/components/form/VuTextField.vue'

const router = useRouter()
const store = authStore()
const isDark = computed(() => store.isDark)

const props = defineProps({
  animalId: {
    type: String,
    required: true,
  },
  user: {
    type: Object,
    required: true,
  },
  targetDate: {
    type: String,
    default: null,
  },
  targetView: {
    type: String,
    default: null,
  },
})

// 使用血糖日曆 composable
const {
  // 狀態
  isLoading,
  newtoday,
  calendar,
  weekData,
  weekRange,
  calendarDisplay,
  years,
  months,
  selectedYear,
  selectedMonth,
  modals,
  newRecord,
  editRecord,
  showTooltip,
  hoverData,
  tooltipStyle,
  dayDetailDialog,
  selectedDayForDetail,

  // 方法
  getWeekBloodSugarData,
  createTask,
  editTask,
  deleteTask,
  toggleMark,
  bloodSugarColor,
  showTips,
  openTaskModal,
  closeTaskModal,
  openEditTaskModal,
  updateCalendar,
  updateWeekData,
  prevWeek,
  nextWeek,
  prevMonth,
  nextMonth,
  goToFirstWeekOfSelectedMonth,
  openDayDetailDialog,
  closeDayDetailDialog,
} = useBloodSugarCalendar(
  props.animalId,
  computed(() => props.user),
)

// 監聽日期變化
watch(
  () => newtoday.date,
  () => {
    const date = newtoday.date
    newtoday.year = date.getFullYear()
    newtoday.month = date.getMonth()
    newtoday.day = date.getDate()
    newtoday.lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  },
)

// 監聽週資料變化，當導航到新週時更新資料
watch(
  () => weekRange.value,
  async () => {
    if (calendarDisplay.value === 'week') {
      await getWeekBloodSugarData()
      emitCurrentDateRange()
    }
  },
)

// 移除重複的監聽與初始化，保留下方單一版本

const emit = defineEmits(['bloodSugarChanged', 'dateRangeChanged'])

// 計算目前顯示模式的日期範圍並發出事件
const emitCurrentDateRange = () => {
  if (calendarDisplay.value === 'week') {
    const startDate = weekData.value[0]?.date
    const endDate = weekData.value[6]?.date
    if (startDate && endDate) emit('dateRangeChanged', { type: 'week', startDate, endDate })
  } else if (calendarDisplay.value === 'month') {
    const y = newtoday.year
    const m = newtoday.month + 1
    const startDate = `${y}-${String(m).padStart(2, '0')}-01`
    const endDate = `${y}-${String(m).padStart(2, '0')}-${String(newtoday.lastDay).padStart(2, '0')}`
    emit('dateRangeChanged', { type: 'month', startDate, endDate })
  }
}

// 包裝函式：新增後發出事件
const createTaskAndEmit = async () => {
  await createTask()
  emit('bloodSugarChanged')
  emitCurrentDateRange()
}

// 包裝函式：修改後發出事件
const editTaskAndEmit = async () => {
  await editTask()
  emit('bloodSugarChanged')
  emitCurrentDateRange()
}

// 包裝函式：刪除後發出事件
const deleteTaskAndEmit = async (recordId, taskId) => {
  await deleteTask(recordId, taskId)
  emit('bloodSugarChanged')
  emitCurrentDateRange()
}

// 包裝函式：處理月份導航並發出事件
const handlePrevMonth = async () => {
  await prevMonth()
  emitCurrentDateRange()
}

const handleNextMonth = async () => {
  await nextMonth()
  emitCurrentDateRange()
}

// 跳轉到標記記錄頁面
const goToMarkedDiary = () => {
  const role = store.user.role
  if (role === 'hospital') {
    router.push(`/hospital/animal/${props.animalId}/marked-diary`)
  } else if (role === 'user') {
    router.push(`/user/animal/${props.animalId}/marked-diary`)
  }
}

// 監聽日曆顯示模式變化
watch(
  () => calendarDisplay.value,
  async newMode => {
    if (newMode === 'week') {
      await getWeekBloodSugarData()
    } else if (newMode === 'month') {
      await updateCalendar()
    }
    emitCurrentDateRange()
  },
)

// 輔助函數：獲取週的開始日期（週一）
function getStartOfWeek(date) {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.setDate(diff))
}

// 初始化
onMounted(async () => {
  // 如果有目標日期，跳轉到該日期的週曆
  if (props.targetDate) {
    const targetDateObj = new Date(props.targetDate)
    if (!isNaN(targetDateObj.getTime())) {
      // 設定為週曆模式
      if (props.targetView === 'week') {
        calendarDisplay.value = 'week'
      }

      // 設定目標日期相關的時間
      newtoday.date = targetDateObj
      selectedYear.value = targetDateObj.getFullYear()
      selectedMonth.value = targetDateObj.getMonth()

      // 更新到目標日期所在的週
      const startOfWeek = getStartOfWeek(new Date(targetDateObj))
      updateWeekData(startOfWeek)

      // 清除 URL 參數，避免重複跳轉
      router.replace({ query: {} })

      return
    }
  }

  // 正常初始化流程
  newtoday.date = new Date()
  updateWeekData()
  selectedYear.value = newtoday.date.getFullYear()
  selectedMonth.value = newtoday.date.getMonth()
  calendarDisplay.value = 'week' // 這將觸發 watch 來載入資料
})
</script>
