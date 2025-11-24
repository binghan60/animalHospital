<script setup>
import { reactive, onMounted, provide, computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

// 禁用自動繼承 attributes，因為有多個根節點
defineOptions({
  inheritAttrs: false
})
import { getAverage as getAverageApi, getDiary } from '@/api'
import authStore from '@/stores/auth'
import { useAppToast } from '@/utils/appToast'
import { 
  formatDateToYyyyMmDd, 
  formatDateToLocale,
  getCurrentWeekRange,
  formatDateRangeTitle,
  getTodayFormatted
} from '@/utils/dateFormatter'

// 元件導入
import AnimalAvatar from './components/AnimalAvatar.vue'
import AnimalBasicInfo from './components/AnimalBasicInfo.vue'
import WeightChart from './components/WeightChart.vue'
import BloodSugarAverageChart from './components/BloodSugarAverageChart.vue'
import BloodSugarCurvePanel from './components/BloodSugarCurvePanel.vue'
import BloodSugarCurveChart from './components/BloodSugarCurveChart.vue'
import BloodSugarCalendar from './components/BloodSugarCalendar.vue'
import ActivityTimeline from './components/ActivityTimeline.vue'

// 可重用對話框元件
import WeightDialog from './components/WeightDialog.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import BloodSugarCurveDialog from './components/BloodSugarCurveDialog.vue'

// Composables 導入
import { useAnimalData } from './composables/useAnimalData'
import { useWeightManagement } from './composables/useWeightManagement'
import { useBloodSugarCurve } from './composables/useBloodSugarCurve'

const route = useRoute()
const animalId = route.params.id
const toast = useAppToast()

// 處理從標記頁面傳來的日期參數
const targetDate = route.query.date
const targetView = route.query.view

// 使用 Pinia store
const store = authStore()
const user = computed(() => store.user)
const isDark = computed(() => store.isDark)

// 提供深色模式狀態給子元件
provide('isDark', isDark)

// 整合模態框狀態管理
const modals = reactive({
  weight: false,
  weightList: false,
  editWeight: false,
  deleteWeight: false,
  bloodSugarCurve: false,
  editBloodSugarCurve: false,
  deleteBloodSugarCurve: false,
})

// 為了保持向後相容，保留舊的 ref（映射到新的 reactive 物件）
const weightDialog = computed({
  get: () => modals.weight,
  set: (val) => { modals.weight = val }
})
const weightListDialog = computed({
  get: () => modals.weightList,
  set: (val) => { modals.weightList = val }
})
const editWeightDialog = computed({
  get: () => modals.editWeight,
  set: (val) => { modals.editWeight = val }
})
const deleteWeightDialog = computed({
  get: () => modals.deleteWeight,
  set: (val) => { modals.deleteWeight = val }
})
const bloodSugarCurveDialog = computed({
  get: () => modals.bloodSugarCurve,
  set: (val) => { modals.bloodSugarCurve = val }
})
const editBloodSugarCurveDialog = computed({
  get: () => modals.editBloodSugarCurve,
  set: (val) => { modals.editBloodSugarCurve = val }
})
const deleteBloodSugarCurveDialog = computed({
  get: () => modals.deleteBloodSugarCurve,
  set: (val) => { modals.deleteBloodSugarCurve = val }
})

// 表單數據
const weightForm = reactive({
  date: getTodayFormatted(),
  value: '',
})

const editWeightForm = reactive({
  id: '',
  date: '',
  value: '',
})

const bloodSugarCurveForm = reactive({
  date: getTodayFormatted(),
  fields: [{ time: '', value: '', insulin: '' }],
})

const editBloodSugarCurveForm = reactive({
  id: '',
  date: '',
  fields: [],
})

const deleteItem = reactive({
  type: '', // 'weight' | 'bloodSugarCurve'
  id: '',
  name: '',
  date: '',
  value: '',
})

// 載入狀態
const isCreatingWeight = ref(false)
const isUpdatingWeight = ref(false)
const isDeletingWeight = ref(false)
const isCreatingCurve = ref(false)
const isUpdatingCurve = ref(false)
const isDeletingCurve = ref(false)

// 使用 composables
const { animal, isLoading: animalLoading, getAnimalInfo } = useAnimalData(animalId)
const { 
  isLoading: weightLoading, 
  createWeight: originalCreateWeight, 
  updateWeight: originalUpdateWeight,
  confirmDeleteWeight: originalDeleteWeight
} = useWeightManagement(animalId, getAnimalInfo)

const { 
  bloodSugarCurveChart, 
  isLoading: curveLoading, 
  getAllBloodSugarCurveData, 
  selectYear, 
  selectMonth, 
  clearYearMonthSelection,
  createBloodSugarCurve: originalCreateBloodSugarCurve, 
  updateBloodSugarCurve: originalUpdateBloodSugarCurve,
  deleteBloodSugarCurve: originalDeleteBloodSugarCurve
} = useBloodSugarCurve(animalId)

// 整合載入狀態
const isLoading = computed(() => 
  animalLoading.value || 
  weightLoading.value || 
  curveLoading.value ||
  isCreatingWeight.value ||
  isUpdatingWeight.value ||
  isDeletingWeight.value ||
  isCreatingCurve.value ||
  isUpdatingCurve.value ||
  isDeletingCurve.value
)

// 平均血糖圖表資料
const averageChart = reactive({
  title: '週平均血糖',
  rawData: {
    averages: [{ morningAverage: 0, eveningAverage: 0, combinedAverage: 0 }],
    morningCounts: { count_1_249: 0, count_250_399: 0, count_400_plus: 0 },
    eveningCounts: { count_1_249: 0, count_250_399: 0, count_400_plus: 0 },
  },
})

// 目前日期範圍（週或月）
const currentRange = reactive({ type: 'week', startDate: '', endDate: '' })

// 工具函數
function resetWeightForm() {
  weightForm.date = getTodayFormatted()
  weightForm.value = ''
}

function resetBloodSugarCurveForm() {
  bloodSugarCurveForm.date = getTodayFormatted()
  bloodSugarCurveForm.fields = [{ time: '', value: '', insulin: '' }] // 初始化為至少一個空欄位
}

// 血糖欄位管理函數已移至 BloodSugarCurveDialog 元件內部處理

// 預設血糖資料結構
const getDefaultAverageData = () => ({
  averages: [{ morningAverage: 0, eveningAverage: 0, combinedAverage: 0 }],
  morningCounts: { count_1_249: 0, count_250_399: 0, count_400_plus: 0 },
  eveningCounts: { count_1_249: 0, count_250_399: 0, count_400_plus: 0 },
})

// 獲取平均血糖資料
const getAverageLocal = async (startDate, endDate) => {
  try {
    const data = await getAverageApi({
      animalId,
      startDate,
      endDate,
    })
    return data
  } catch (error) {
    console.error('❌ 獲取平均血糖失敗:', error)
    toast.error('獲取平均血糖失敗', error.message || '請稍後再試')
    return getDefaultAverageData()
  }
}

// 更新平均血糖圖表
const updateAverageChart = async (customRange) => {
  try {
    let startDate, endDate, title
    
    if (customRange?.startDate && customRange?.endDate) {
      startDate = customRange.startDate
      endDate = customRange.endDate
      title = formatDateRangeTitle(startDate, endDate, customRange.type)
    } else {
      const weekRange = getCurrentWeekRange()
      startDate = weekRange.startDate
      endDate = weekRange.endDate
      title = formatDateRangeTitle(startDate, endDate, 'week')
    }

    averageChart.title = title
    const data = await getAverageLocal(startDate, endDate)
    averageChart.rawData = data
  } catch (error) {
    console.error('❌ 更新平均血糖圖表失敗:', error)
    toast.error('更新平均血糖圖表失敗', error.message || '請稍後再試')
    averageChart.rawData = getDefaultAverageData()
  }
}

// 體重相關操作
async function createWeight(formData) {
  try {
    isCreatingWeight.value = true
    await originalCreateWeight({
      date: formData.date,
      value: parseFloat(formData.value)
    })
    modals.weight = false
    resetWeightForm()
    // toast 已由 useWeightManagement 內部呼叫，無需重複顯示
    // getAnimalInfo 已由 useWeightManagement 內部呼叫，無需重複呼叫
  } catch (error) {
    console.error('❌ 新增體重記錄失敗:', error)
    // 錯誤 toast 已由 useWeightManagement 處理，這裡不需要再次顯示
  } finally {
    isCreatingWeight.value = false
  }
}

function openEditWeightDialog(weightRecord) {
  editWeightForm.id = weightRecord._id
  editWeightForm.date = formatDateToYyyyMmDd(weightRecord.date)
  editWeightForm.value = weightRecord.value
  modals.editWeight = true
}

async function updateWeight(formData) {
  try {
    isUpdatingWeight.value = true
    await originalUpdateWeight({
      id: editWeightForm.id,
      date: formData.date,
      value: parseFloat(formData.value)
    })
    modals.editWeight = false
    // toast 已由 useWeightManagement 內部呼叫，無需重複顯示
  } catch (error) {
    console.error('❌ 更新體重記錄失敗:', error)
    // 錯誤 toast 已由 useWeightManagement 處理，這裡不需要再次顯示
  } finally {
    isUpdatingWeight.value = false
  }
}

function openDeleteWeightDialog(weightRecord) {
  deleteItem.type = 'weight'
  deleteItem.id = weightRecord._id
  deleteItem.date = formatDateToLocale(weightRecord.date)
  deleteItem.value = `${weightRecord.value} 公斤`
  modals.deleteWeight = true
}

async function deleteWeight() {
  try {
    isDeletingWeight.value = true
    await originalDeleteWeight(deleteItem.id)
    modals.deleteWeight = false
    // toast 已由 useWeightManagement 內部呼叫，無需重複顯示
  } catch (error) {
    console.error('❌ 刪除體重記錄失敗:', error)
    // 錯誤 toast 已由 useWeightManagement 處理，這裡不需要再次顯示
  } finally {
    isDeletingWeight.value = false
  }
}

// 自動載入血糖資料以建立曲線
const loadBloodSugarForCurve = async (date) => {
  if (!date) {
    bloodSugarCurveForm.fields = [{ time: '', value: '', insulin: '' }]
    return
  }
  
  try {
    const diaryData = await getDiary({
      animalId: animalId,
      startDate: date,
      endDate: date,
    })

    if (diaryData && diaryData.length > 0 && diaryData[0].records && diaryData[0].records.length > 0) {
      const records = diaryData[0].records
      bloodSugarCurveForm.fields = records.map(rec => ({
        time: rec.time,
        value: rec.bloodSugar || '',
        insulin: rec.insulin || '',
      }))
    } else {
      bloodSugarCurveForm.fields = [{ time: '', value: '', insulin: '' }]
    }
  } catch (error) {
    console.error('❌ 為血糖曲線載入血糖資料失敗:', error)
    toast.error('載入血糖資料失敗', error.message || '請稍後再試')
    bloodSugarCurveForm.fields = [{ time: '', value: '', insulin: '' }]
  }
}

// 監聽血糖曲線表單的日期變化
watch(() => bloodSugarCurveForm.date, (newDate, oldDate) => {
  if (bloodSugarCurveDialog.value && newDate !== oldDate) {
    loadBloodSugarForCurve(newDate)
  }
})

const openAddBloodSugarCurveDialog = async () => {
  resetBloodSugarCurveForm()
  await loadBloodSugarForCurve(bloodSugarCurveForm.date)
  bloodSugarCurveDialog.value = true
}

// 血糖曲線相關操作
async function createBloodSugarCurve(formData) {
  const validFields = formData.fields.filter(field => field.time && field.value)
  if (validFields.length === 0) {
    toast.error('請至少填寫一筆血糖數據', '需要至少一筆包含時間和血糖值的記錄')
    return
  }

  try {
    isCreatingCurve.value = true
    await originalCreateBloodSugarCurve({
      date: formData.date,
      fields: validFields.map(field => ({
        time: field.time,
        value: parseFloat(field.value),
        insulin: field.insulin ? parseFloat(field.insulin) : 0
      }))
    })
    modals.bloodSugarCurve = false
    resetBloodSugarCurveForm()
    await getAllBloodSugarCurveData()
    await updateAverageChart(currentRange)
    // toast 已由 useBloodSugarCurve 內部呼叫，無需重複顯示
  } catch (error) {
    console.error('❌ 新增血糖曲線失敗:', error)
    // 錯誤 toast 已由 useBloodSugarCurve 處理，這裡不需要再次顯示
  } finally {
    isCreatingCurve.value = false
  }
}

function openEditBloodSugarCurveDialog(curveData) {
  editBloodSugarCurveForm.id = curveData._id
  editBloodSugarCurveForm.date = formatDateToYyyyMmDd(curveData.date)
  editBloodSugarCurveForm.fields = (curveData.records || curveData.fields || []).map(field => ({
    time: field.time,
    value: field.value,
    insulin: field.insulin
  }))
  editBloodSugarCurveDialog.value = true
}

async function updateBloodSugarCurve(formData) {
  const validFields = formData.fields.filter(field => field.time && field.value)
  if (validFields.length === 0) {
    toast.error('請至少填寫一筆血糖數據', '需要至少一筆包含時間和血糖值的記錄')
    return
  }

  try {
    isUpdatingCurve.value = true
    await originalUpdateBloodSugarCurve({
      id: editBloodSugarCurveForm.id,
      date: formData.date,
      fields: validFields.map(field => ({
        time: field.time,
        value: parseFloat(field.value),
        insulin: field.insulin ? parseFloat(field.insulin) : 0
      }))
    })
    modals.editBloodSugarCurve = false
    await getAllBloodSugarCurveData()
    await updateAverageChart(currentRange)
    // toast 已由 useBloodSugarCurve 內部呼叫，無需重複顯示
  } catch (error) {
    console.error('❌ 更新血糖曲線失敗:', error)
    // 錯誤 toast 已由 useBloodSugarCurve 處理，這裡不需要再次顯示
  } finally {
    isUpdatingCurve.value = false
  }
}

function openDeleteBloodSugarCurveDialog(curveData) {
  deleteItem.type = 'bloodSugarCurve'
  deleteItem.id = curveData._id
  deleteItem.date = formatDateToLocale(curveData.date)
  deleteBloodSugarCurveDialog.value = true
}

async function deleteBloodSugarCurve() {
  try {
    isDeletingCurve.value = true
    await originalDeleteBloodSugarCurve(deleteItem.id)
    modals.deleteBloodSugarCurve = false
    await getAllBloodSugarCurveData()
    await updateAverageChart(currentRange)
    // toast 已由 useBloodSugarCurve 內部呼叫，無需重複顯示
  } catch (error) {
    console.error('❌ 刪除血糖曲線失敗:', error)
    // 錯誤 toast 已由 useBloodSugarCurve 處理，這裡不需要再次顯示
  } finally {
    isDeletingCurve.value = false
  }
}

// 事件處理
const onDateRangeChanged = ({ type, startDate, endDate }) => {
  currentRange.type = type
  currentRange.startDate = startDate
  currentRange.endDate = endDate
  updateAverageChart(currentRange)
}

const onBloodSugarChanged = async () => {
    await updateAverageChart(currentRange)
}

const onActivityChanged = () => {
  // 當活動記錄變更時的回調函數（預留給未來擴展使用）
}

// 初始化
onMounted(async () => {
  await getAnimalInfo()
  await getAllBloodSugarCurveData()
  await updateAverageChart()
})
</script>

<template>
  <v-container fluid>

    <!-- 基本資料區塊 -->
    <v-row class="mb-6">
      <v-col cols="12" md="6" lg="3">
        <AnimalAvatar :avatar="animal.Info.avatar" :animalName="animal.Info.name" />
      </v-col>
      
      <v-col cols="12" md="6" lg="3">
        <AnimalBasicInfo :animalInfo="animal.Info" />
      </v-col>
      
      <v-col cols="12" md="6" lg="3">
        <WeightChart 
          :weightData="animal.Info.weight || []" 
          :showManagementButton="user.role === 'hospital'"
          @openWeightManagement="weightListDialog = true"
          @openAddWeight="weightDialog = true"
        />
      </v-col>
      
      <v-col cols="12" md="6" lg="3">
        <BloodSugarAverageChart 
          :averageData="averageChart.rawData" 
          :title="averageChart.title" 
        />
      </v-col>
    </v-row>

    <!-- 作息時間軸區塊 -->
    <v-row class="mb-6">
      <v-col cols="12">
        <ActivityTimeline 
          :animalId="animalId" 
          :showAddButton="user.role === 'hospital'"
          @activityChanged="onActivityChanged"
        />
      </v-col>
    </v-row>
    <!-- 血糖日曆 -->
    <BloodSugarCalendar 
      :animalId="animalId" 
      :user="user"
      :targetDate="targetDate"
      :targetView="targetView"
      @dateRangeChanged="onDateRangeChanged" 
      @bloodSugarChanged="onBloodSugarChanged" 
    />

    <!-- 血糖曲線控制面板 -->
    <BloodSugarCurvePanel 
      :yearMonthStats="bloodSugarCurveChart.yearMonthStats" 
      :filteredCount="bloodSugarCurveChart.filteredData.length" 
      :totalCount="bloodSugarCurveChart.allData.length"
      :showAddButton="user.role === 'hospital'"
      @selectYear="selectYear" 
      @selectMonth="selectMonth" 
      @clearYearMonthSelection="clearYearMonthSelection"
      @openAddCurve="openAddBloodSugarCurveDialog"
    />

    <!-- 血糖曲線圖表 -->
    <v-card v-if="bloodSugarCurveChart.filteredData.length === 0" class="mt-4">
      <v-card-text class="text-center pa-8">
        <v-icon icon="mdi-chart-line" size="64" color="grey-lighten-1" class="mb-4" />
        <p class="text-h6 text-medium-emphasis mb-2">目前沒有血糖曲線資料</p>
        <p class="text-body-2 text-medium-emphasis">請點擊右下角的圖表按鈕新增血糖曲線</p>
      </v-card-text>
    </v-card>

    <BloodSugarCurveChart 
      :curveData="bloodSugarCurveChart.filteredData" 
      :showEditButtons="user.role === 'hospital'"
      @editCurve="openEditBloodSugarCurveDialog" 
      @deleteCurve="openDeleteBloodSugarCurveDialog" 
    />

  </v-container>


  <!-- 新增體重 Modal -->
  <WeightDialog
    v-model="weightDialog"
    :form="weightForm"
    :loading="isCreatingWeight"
    mode="create"
    @submit="createWeight"
  />

  <!-- 體重管理 Modal -->
  <v-dialog v-model="weightListDialog" max-width="700px" persistent>
    <v-card>
      <v-card-title class="text-h5 pa-6">
        <v-icon icon="mdi-format-list-bulleted" class="mr-2" color="primary" />
        體重記錄管理
      </v-card-title>
      
      <v-divider />
      
      <v-card-text class="pa-6" style="max-height: 60vh; overflow-y: auto;">
        <v-list v-if="animal.Info.weight && animal.Info.weight.length > 0" lines="two">
          <v-list-item
            v-for="weightRecord in animal.Info.weight.slice().reverse()"
            :key="weightRecord._id"
            class="mb-2"
          >
            <template v-slot:prepend>
              <v-avatar color="amber" variant="tonal">
                <v-icon icon="mdi-scale" />
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-bold">
              {{ weightRecord.value }} 公斤
            </v-list-item-title>
            
            <v-list-item-subtitle>
              {{ formatDateToLocale(weightRecord.date) }}
            </v-list-item-subtitle>

            <template v-slot:append>
              <div class="d-flex gap-2">
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  color="primary"
                  variant="text"
                  @click="openEditWeightDialog(weightRecord)"
                />
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  color="error"
                  variant="text"
                  @click="openDeleteWeightDialog(weightRecord)"
                />
              </div>
            </template>
          </v-list-item>
        </v-list>
        
        <v-empty-state
          v-else
          icon="mdi-scale-off"
          title="目前沒有體重記錄"
          text="開始記錄您的寵物體重變化"
        />
      </v-card-text>

      <v-divider />
      
      <v-card-actions class="pa-6">
        <v-btn 
          color="primary" 
          prepend-icon="mdi-plus"
          @click="weightListDialog = false; weightDialog = true"
        >
          新增體重記錄
        </v-btn>
        <v-spacer />
        <v-btn 
          variant="outlined" 
          @click="weightListDialog = false"
        >
          關閉
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 編輯體重 Modal -->
  <WeightDialog
    v-model="editWeightDialog"
    :form="editWeightForm"
    :loading="isUpdatingWeight"
    mode="edit"
    @submit="updateWeight"
  />

  <!-- 刪除體重確認 Modal -->
  <ConfirmDialog
    v-model="deleteWeightDialog"
    title="確認刪除體重記錄"
    message="您確定要刪除以下體重記錄嗎？此操作無法復原。"
    :details="{ 日期: deleteItem.date, 體重: deleteItem.value }"
    :loading="isDeletingWeight"
    type="danger"
    confirm-text="確認刪除"
    @confirm="deleteWeight"
  />

  <!-- 新增血糖曲線 Modal -->
  <BloodSugarCurveDialog
    v-model="bloodSugarCurveDialog"
    :form="bloodSugarCurveForm"
    :loading="isCreatingCurve"
    mode="create"
    @submit="createBloodSugarCurve"
    @date-change="loadBloodSugarForCurve"
  />

  <!-- 編輯血糖曲線 Modal -->
  <BloodSugarCurveDialog
    v-model="editBloodSugarCurveDialog"
    :form="editBloodSugarCurveForm"
    :loading="isUpdatingCurve"
    mode="edit"
    @submit="updateBloodSugarCurve"
  />
  
  <!-- 刪除血糖曲線確認 Modal -->
  <ConfirmDialog
    v-model="deleteBloodSugarCurveDialog"
    title="確認刪除血糖曲線"
    message="您確定要刪除此血糖曲線嗎？刪除後將無法恢復此血糖曲線及其所有數據。"
    :details="{ 日期: deleteItem.date }"
    :loading="isDeletingCurve"
    type="danger"
    confirm-text="確認刪除"
    @confirm="deleteBloodSugarCurve"
  />

  <!-- 載入指示器 -->
  <v-overlay 
    :model-value="isLoading" 
    class="align-center justify-center"
    persistent
  >
    <v-progress-circular
      color="primary"
      indeterminate
      size="64"
    />
  </v-overlay>
</template>