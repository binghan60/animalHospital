<script setup>
import { reactive, onMounted, provide, computed, inject, ref } from 'vue'
import { useRoute } from 'vue-router'

// 禁用自動繼承 attributes，因為有多個根節點
defineOptions({
  inheritAttrs: false
})
import { getAverage as getAverageApi } from '@/api'
import authStore from '@/stores/auth'
import { useAppToast } from '@/utils/appToast'

// 元件導入
import AnimalAvatar from './components/AnimalAvatar.vue'
import AnimalBasicInfo from './components/AnimalBasicInfo.vue'
import WeightChart from './components/WeightChart.vue'
import BloodSugarAverageChart from './components/BloodSugarAverageChart.vue'
import BloodSugarCurvePanel from './components/BloodSugarCurvePanel.vue'
import BloodSugarCurveChart from './components/BloodSugarCurveChart.vue'
import BloodSugarCalendar from './components/BloodSugarCalendar.vue'
import ActivityTimeline from './components/ActivityTimeline.vue'

// 表單組件
import VuTextField from '@/components/form/VuTextField.vue'

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

// 注入依賴
const loadingConfig = inject('loadingConfig')

// 使用 Pinia store
const store = authStore()
const user = computed(() => store.user)
const isDark = computed(() => store.isDark)

// 提供深色模式狀態給子元件
provide('isDark', isDark)

// Modal 狀態管理
const weightDialog = ref(false)
const weightListDialog = ref(false)
const editWeightDialog = ref(false)
const deleteWeightDialog = ref(false)
const bloodSugarCurveDialog = ref(false)
const editBloodSugarCurveDialog = ref(false)
const deleteBloodSugarCurveDialog = ref(false)

// 表單數據
const weightForm = reactive({
  date: new Date().toISOString().slice(0, 10),
  value: '',
})

const editWeightForm = reactive({
  id: '',
  date: '',
  value: '',
})

const bloodSugarCurveForm = reactive({
  date: new Date().toISOString().slice(0, 10),
  fields: [{ time: '', value: '' }],
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
  modals: weightModals, 
  isLoading: weightLoading, 
  createWeight: originalCreateWeight, 
  updateWeight: originalUpdateWeight,
  confirmDeleteWeight: originalDeleteWeight
} = useWeightManagement(animalId, getAnimalInfo)

const { 
  bloodSugarCurveChart, 
  modals: bloodSugarCurveModals, 
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
  weightForm.date = new Date().toISOString().slice(0, 10)
  weightForm.value = ''
}

function resetBloodSugarCurveForm() {
  bloodSugarCurveForm.date = new Date().toISOString().slice(0, 10)
  bloodSugarCurveForm.fields = [{ time: '', value: '' }]
}

function addBloodSugarField() {
  bloodSugarCurveForm.fields.push({ time: '', value: '' })
}

function removeBloodSugarField(index) {
  if (bloodSugarCurveForm.fields.length > 1) {
    bloodSugarCurveForm.fields.splice(index, 1)
  }
}

function addEditBloodSugarField() {
  editBloodSugarCurveForm.fields.push({ time: '', value: '' })
}

function removeEditBloodSugarField(index) {
  if (editBloodSugarCurveForm.fields.length > 1) {
    editBloodSugarCurveForm.fields.splice(index, 1)
  }
}

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
    toast.error(null, '獲取平均血糖失敗')
    return {
      averages: [{ morningAverage: 0, eveningAverage: 0, combinedAverage: 0 }],
      morningCounts: { count_1_249: 0, count_250_399: 0, count_400_plus: 0 },
      eveningCounts: { count_1_249: 0, count_250_399: 0, count_400_plus: 0 },
    }
  }
}

// 更新平均血糖圖表
const updateAverageChart = async (customRange) => {
  try {
    let startDate, endDate, title
    if (customRange?.startDate && customRange?.endDate) {
      startDate = customRange.startDate
      endDate = customRange.endDate
      title = customRange.type === 'month'
        ? `${startDate.split('-')[1]}月平均血糖`
        : `${startDate.split('-')[1]}-${startDate.split('-')[2]} ~ ${endDate.split('-')[1]}-${endDate.split('-')[2]} 平均血糖`
    } else {
      const today = new Date()
      const startOfWeek = new Date(today)
      const day = startOfWeek.getDay()
      const diff = startOfWeek.getDate() - (day === 0 ? 6 : day - 1)
      startOfWeek.setDate(diff)
      startOfWeek.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)

      startDate = startOfWeek.toISOString().split('T')[0]
      endDate = endOfWeek.toISOString().split('T')[0]
      title = `${startDate.split('-')[1]}-${startDate.split('-')[2]} ~ ${endDate.split('-')[1]}-${endDate.split('-')[2]} 平均血糖`
    }

    averageChart.title = title
    const data = await getAverageLocal(startDate, endDate)
    averageChart.rawData = data
  } catch (error) {
    console.error('❌ 更新平均血糖圖表失敗:', error)
  }
}

// 體重相關操作
async function createWeight() {
  if (!weightForm.date || !weightForm.value) {
    toast.error(null, '請填寫完整的體重資料')
    return
  }

  try {
    isCreatingWeight.value = true
    await originalCreateWeight({
      date: weightForm.date,
      value: parseFloat(weightForm.value)
    })
    weightDialog.value = false
    resetWeightForm()
    
    await getAnimalInfo()
  } catch (error) {
    toast.error('新增體重記錄失敗')
  } finally {
    isCreatingWeight.value = false
  }
}

function openEditWeightDialog(weightRecord) {
  editWeightForm.id = weightRecord._id
  editWeightForm.date = new Date(weightRecord.date).toISOString().split('T')[0]
  editWeightForm.value = weightRecord.value
  editWeightDialog.value = true
}

async function updateWeight() {
  if (!editWeightForm.date || !editWeightForm.value) {
    toast.error(null, '請填寫完整的體重資料')
    return
  }

  try {
    isUpdatingWeight.value = true
    await originalUpdateWeight({
      id: editWeightForm.id,
      date: editWeightForm.date,
      value: parseFloat(editWeightForm.value)
    })
    editWeightDialog.value = false
    
    await getAnimalInfo()
  } catch (error) {
    toast.error('更新體重記錄失敗')
  } finally {
    isUpdatingWeight.value = false
  }
}

function openDeleteWeightDialog(weightRecord) {
  deleteItem.type = 'weight'
  deleteItem.id = weightRecord._id
  deleteItem.date = new Date(weightRecord.date).toLocaleDateString('zh-TW')
  deleteItem.value = `${weightRecord.value} 公斤`
  deleteWeightDialog.value = true
}

async function deleteWeight() {
  try {
    isDeletingWeight.value = true
    // 呼叫 composable 的 confirmDeleteWeight 以確保 API 被調用
    await originalDeleteWeight(deleteItem.id)
    deleteWeightDialog.value = false
    await getAnimalInfo()
  } catch (error) {
    toast.error('刪除體重記錄失敗')
  } finally {
    isDeletingWeight.value = false
  }
}

// 血糖曲線相關操作
async function createBloodSugarCurve() {
  if (!bloodSugarCurveForm.date) {
    toast.error('請選擇日期')
    return
  }

  const validFields = bloodSugarCurveForm.fields.filter(field => field.time && field.value)
  if (validFields.length === 0) {
    toast.error('請至少填寫一筆血糖數據')
    return
  }

  try {
    isCreatingCurve.value = true
    await originalCreateBloodSugarCurve({
      date: bloodSugarCurveForm.date,
      fields: validFields.map(field => ({
        time: field.time,
        value: parseFloat(field.value)
      }))
    })
    bloodSugarCurveDialog.value = false
    resetBloodSugarCurveForm()
    await getAllBloodSugarCurveData()
    await updateAverageChart(currentRange)
  } catch (error) {
    toast.error('新增血糖曲線失敗')
  } finally {
    isCreatingCurve.value = false
  }
}

function openEditBloodSugarCurveDialog(curveData) {
  editBloodSugarCurveForm.id = curveData._id
  editBloodSugarCurveForm.date = new Date(curveData.date).toISOString().split('T')[0]
  editBloodSugarCurveForm.fields = (curveData.records || curveData.fields || []).map(field => ({
    time: field.time,
    value: field.value
  }))
  editBloodSugarCurveDialog.value = true
}

async function updateBloodSugarCurve() {
  if (!editBloodSugarCurveForm.date) {
    toast.error('請選擇日期')
    return
  }

  const validFields = editBloodSugarCurveForm.fields.filter(field => field.time && field.value)
  if (validFields.length === 0) {
    toast.error('請至少填寫一筆血糖數據')
    return
  }

  try {
    isUpdatingCurve.value = true
    await originalUpdateBloodSugarCurve({
      id: editBloodSugarCurveForm.id,
      date: editBloodSugarCurveForm.date,
      fields: validFields.map(field => ({
        time: field.time,
        value: parseFloat(field.value)
      }))
    })
    editBloodSugarCurveDialog.value = false
    await getAllBloodSugarCurveData()
    await updateAverageChart(currentRange)
  } catch (error) {
    toast.error('更新血糖曲線失敗')
  } finally {
    isUpdatingCurve.value = false
  }
}

function openDeleteBloodSugarCurveDialog(curveData) {
  deleteItem.type = 'bloodSugarCurve'
  deleteItem.id = curveData._id
  deleteItem.date = new Date(curveData.date).toLocaleDateString('zh-TW')
  deleteBloodSugarCurveDialog.value = true
}

async function deleteBloodSugarCurve() {
  try {
    isDeletingCurve.value = true
    await originalDeleteBloodSugarCurve(deleteItem.id)
    deleteBloodSugarCurveDialog.value = false
    await getAllBloodSugarCurveData()
    await updateAverageChart(currentRange)
  } catch (error) {
    toast.error('刪除血糖曲線失敗')
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
  // 當活動記錄變更時，可以觸發其他更新（如重新載入圖表等）
  console.log('Activity timeline updated')
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
    <!-- 操作按鈕區塊 - 僅醫院模式可見 -->
    <v-card v-if="user.role === 'hospital'" class="mb-6">
      <v-card-text class="pa-4">
        <v-row align="center" justify="space-between">
          <v-col cols="12" md="auto">
            <h3 class="text-h6 font-weight-semibold">快速操作</h3>
            <div class="text-body-2 text-medium-emphasis">新增體重記錄或血糖曲線</div>
          </v-col>
          
          <v-col cols="12" md="auto" class="d-flex flex-wrap ga-3">
            <v-btn
              color="amber"
              variant="elevated"
              prepend-icon="mdi-scale"
              :theme="isDark ? 'dark' : 'light'"
              @click="weightDialog = true"
            >
              新增體重記錄
            </v-btn>
            
            <v-btn
              color="pink"
              variant="elevated"
              prepend-icon="mdi-chart-line"
              :theme="isDark ? 'dark' : 'light'"
              @click="bloodSugarCurveDialog = true"
            >
              建立血糖曲線
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

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
      @selectYear="selectYear" 
      @selectMonth="selectMonth" 
      @clearYearMonthSelection="clearYearMonthSelection" 
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
  <v-dialog v-model="weightDialog" max-width="500px" persistent>
    <v-card>
      <v-card-title class="text-h5 pa-6">
        <v-icon icon="mdi-scale" class="mr-2" color="amber" />
        新增體重記錄
      </v-card-title>
      
      <v-divider />
      
      <v-card-text class="pa-6">
        <v-form @submit.prevent="createWeight">
          <v-row>
            <v-col cols="12" md="6">
              <VuTextField
                v-model="weightForm.date"
                name="weightDate"
                label="日期"
                type="date"
                rules="required"
                prepend-inner-icon="mdi-calendar"
              />
            </v-col>
            
            <v-col cols="12" md="6">
              <VuTextField
                v-model="weightForm.value"
                name="weightValue"
                label="體重 (公斤)"
                type="number"
                step="0.1"
                rules="required"
                prepend-inner-icon="mdi-scale"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider />
      
      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn 
          variant="outlined" 
          :disabled="isCreatingWeight"
          @click="weightDialog = false"
        >
          取消
        </v-btn>
        <v-btn 
          color="amber" 
          :loading="isCreatingWeight"
          @click="createWeight"
        >
          新增體重
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

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
              {{ new Date(weightRecord.date).toLocaleDateString('zh-TW') }}
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
  <v-dialog v-model="editWeightDialog" max-width="500px" persistent>
    <v-card>
      <v-card-title class="text-h5 pa-6">
        <v-icon icon="mdi-pencil" class="mr-2" color="primary" />
        編輯體重記錄
      </v-card-title>
      
      <v-divider />
      
      <v-card-text class="pa-6">
        <v-form @submit.prevent="updateWeight">
          <v-row>
            <v-col cols="12" md="6">
              <VuTextField
                v-model="editWeightForm.date"
                name="editWeightDate"
                label="日期"
                type="date"
                rules="required"
                prepend-inner-icon="mdi-calendar"
              />
            </v-col>
            
            <v-col cols="12" md="6">
              <VuTextField
                v-model="editWeightForm.value"
                name="editWeightValue"
                label="體重 (公斤)"
                type="number"
                step="0.1"
                rules="required"
                prepend-inner-icon="mdi-scale"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider />
      
      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn 
          variant="outlined" 
          :disabled="isUpdatingWeight"
          @click="editWeightDialog = false"
        >
          取消
        </v-btn>
        <v-btn 
          color="primary" 
          :loading="isUpdatingWeight"
          @click="updateWeight"
        >
          更新體重
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 刪除體重確認 Modal -->
  <v-dialog v-model="deleteWeightDialog" max-width="500px" persistent>
    <v-card>
      <v-card-title class="text-h5 pa-6 text-center">
        <div class="d-flex flex-column align-center">
          <v-avatar color="error" size="64" class="mb-4">
            <v-icon icon="mdi-delete-alert" size="32" color="white" />
          </v-avatar>
          <span class="text-h6">確認刪除體重記錄</span>
        </div>
      </v-card-title>
      
      <v-divider />
      
      <v-card-text class="pa-6 text-center">
        <p class="text-h6 mb-4">
          您確定要刪除以下體重記錄嗎？
        </p>
        
        <v-card variant="tonal" color="error" class="mb-4">
          <v-card-text>
            <div class="text-h6 font-weight-bold">{{ deleteItem.value }}</div>
            <div class="text-body-1">{{ deleteItem.date }}</div>
          </v-card-text>
        </v-card>
        
        <v-alert type="warning" variant="tonal" class="text-left">
          <p class="font-weight-bold mb-2">⚠️ 警告：此操作無法復原</p>
          <p class="text-body-2">刪除後將無法恢復此體重記錄</p>
        </v-alert>
      </v-card-text>

      <v-divider />
      
      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn 
          variant="outlined" 
          :disabled="isDeletingWeight"
          @click="deleteWeightDialog = false"
        >
          取消
        </v-btn>
        <v-btn 
          color="error" 
          variant="elevated"
          :loading="isDeletingWeight"
          @click="deleteWeight"
        >
          <v-icon icon="mdi-delete" start />
          確認刪除
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 新增血糖曲線 Modal -->
  <v-dialog v-model="bloodSugarCurveDialog" max-width="800px" persistent>
    <v-card>
      <v-card-title class="text-h5 pa-6">
        <v-icon icon="mdi-chart-line" class="mr-2" color="pink" />
        建立血糖曲線
      </v-card-title>
      
      <v-divider />
      
      <v-card-text class="pa-6">
        <v-form @submit.prevent="createBloodSugarCurve">
          <v-row class="mb-4">
            <v-col cols="12" md="6">
              <VuTextField
                v-model="bloodSugarCurveForm.date"
                name="bloodSugarCurveDate"
                label="日期"
                type="date"
                rules="required"
                prepend-inner-icon="mdi-calendar"
              />
            </v-col>
          </v-row>

          <v-divider class="mb-4" />
          
          <h3 class="text-h6 mb-4">血糖數據</h3>
          
          <v-row 
            v-for="(field, index) in bloodSugarCurveForm.fields" 
            :key="index"
            class="mb-2"
          >
            <v-col cols="12" md="5">
              <v-text-field
                v-model="field.time"
                label="時間"
                type="time"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-clock"
              />
            </v-col>
            
            <v-col cols="12" md="5">
              <v-text-field
                v-model="field.value"
                label="血糖值"
                type="number"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-water"
                suffix="mg/dL"
              />
            </v-col>
            
            <v-col cols="12" md="2" class="d-flex align-center">
              <v-btn
                icon="mdi-close"
                size="small"
                color="error"
                variant="text"
                :disabled="bloodSugarCurveForm.fields.length === 1"
                @click="removeBloodSugarField(index)"
              />
            </v-col>
          </v-row>

          <div class="text-center mb-4">
            <v-btn
              color="success"
              prepend-icon="mdi-plus"
              @click="addBloodSugarField"
            >
              新增血糖數據
            </v-btn>
          </div>
        </v-form>
      </v-card-text>

      <v-divider />
      
      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn 
          variant="outlined" 
          :disabled="isCreatingCurve"
          @click="bloodSugarCurveDialog = false"
        >
          取消
        </v-btn>
        <v-btn 
          color="pink" 
          :loading="isCreatingCurve"
          @click="createBloodSugarCurve"
        >
          建立血糖曲線
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 編輯血糖曲線 Modal -->
  <v-dialog v-model="editBloodSugarCurveDialog" max-width="800px" persistent>
    <v-card>
      <v-card-title class="text-h5 pa-6">
        <v-icon icon="mdi-pencil" class="mr-2" color="primary" />
        編輯血糖曲線
        <v-spacer />
        <v-btn
          icon="mdi-delete"
          color="error"
          variant="text"
          @click="openDeleteBloodSugarCurveDialog({ _id: editBloodSugarCurveForm.id, date: editBloodSugarCurveForm.date })"
        />
      </v-card-title>
      
      <v-divider />
      
      <v-card-text class="pa-6">
        <v-form @submit.prevent="updateBloodSugarCurve">
          <v-row class="mb-4">
            <v-col cols="12" md="6">
              <VuTextField
                v-model="editBloodSugarCurveForm.date"
                name="editBloodSugarCurveDate"
                label="日期"
                type="date"
                rules="required"
                prepend-inner-icon="mdi-calendar"
              />
            </v-col>
          </v-row>

          <v-divider class="mb-4" />
          
          <h3 class="text-h6 mb-4">血糖數據</h3>
          
          <v-row 
            v-for="(field, index) in editBloodSugarCurveForm.fields" 
            :key="index"
            class="mb-2"
          >
            <v-col cols="12" md="5">
              <v-text-field
                v-model="field.time"
                label="時間"
                type="time"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-clock"
              />
            </v-col>
            
            <v-col cols="12" md="5">
              <v-text-field
                v-model="field.value"
                label="血糖值"
                type="number"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-water"
                suffix="mg/dL"
              />
            </v-col>
            
            <v-col cols="12" md="2" class="d-flex align-center">
              <v-btn
                icon="mdi-close"
                size="small"
                color="error"
                variant="text"
                :disabled="editBloodSugarCurveForm.fields.length === 1"
                @click="removeEditBloodSugarField(index)"
              />
            </v-col>
          </v-row>

          <div class="text-center mb-4">
            <v-btn
              color="success"
              prepend-icon="mdi-plus"
              @click="addEditBloodSugarField"
            >
              新增血糖數據
            </v-btn>
          </div>
        </v-form>
      </v-card-text>

      <v-divider />
      
      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn 
          variant="outlined" 
          :disabled="isUpdatingCurve"
          @click="editBloodSugarCurveDialog = false"
        >
          取消
        </v-btn>
        <v-btn 
          color="primary" 
          :loading="isUpdatingCurve"
          @click="updateBloodSugarCurve"
        >
          更新血糖曲線
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 刪除血糖曲線確認 Modal -->
  <v-dialog v-model="deleteBloodSugarCurveDialog" max-width="500px" persistent>
    <v-card>
      <v-card-title class="text-h5 pa-6 text-center">
        <div class="d-flex flex-column align-center">
          <v-avatar color="error" size="64" class="mb-4">
            <v-icon icon="mdi-delete-alert" size="32" color="white" />
          </v-avatar>
          <span class="text-h6">確認刪除血糖曲線</span>
        </div>
      </v-card-title>
      
      <v-divider />
      
      <v-card-text class="pa-6 text-center">
        <p class="text-h6 mb-4">
          您確定要刪除以下血糖曲線嗎？
        </p>
        
        <v-card variant="tonal" color="error" class="mb-4">
          <v-card-text>
            <div class="text-h6 font-weight-bold">{{ deleteItem.date }}</div>
          </v-card-text>
        </v-card>
        
        <v-alert type="warning" variant="tonal" class="text-left">
          <p class="font-weight-bold mb-2">⚠️ 警告：此操作無法復原</p>
          <p class="text-body-2">刪除後將無法恢復此血糖曲線及其所有數據</p>
        </v-alert>
      </v-card-text>

      <v-divider />
      
      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn 
          variant="outlined" 
          :disabled="isDeletingCurve"
          @click="deleteBloodSugarCurveDialog = false"
        >
          取消
        </v-btn>
        <v-btn 
          color="error" 
          variant="elevated"
          :loading="isDeletingCurve"
          @click="deleteBloodSugarCurve"
        >
          <v-icon icon="mdi-delete" start />
          確認刪除
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

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