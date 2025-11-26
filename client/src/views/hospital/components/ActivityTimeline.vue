<template>
  <v-card class="activity-timeline-card">
    <v-card-title class="pb-2 d-flex align-center justify-space-between clickable-header" @click="toggleExpand">
      <div class="d-flex align-center">
        <v-icon icon="mdi-timeline-clock" class="mr-2" color="primary" />
        每日作息時間表
        <v-chip v-if="activities.length > 0" size="small" class="ml-2">{{ activities.length }}</v-chip>
      </div>
      <div class="d-flex align-center ga-2">
        <!-- 方向切換按鈕 -->
        <v-btn-toggle v-if="activities.length > 0" v-model="timelineDirection" mandatory density="compact" @click.stop>
          <v-btn value="vertical" size="small" icon="mdi-view-agenda" />
          <v-btn value="horizontal" size="small" icon="mdi-view-week" />
        </v-btn-toggle>

        <!-- 展開/收合按鈕 -->
        <v-icon v-if="activities.length > 0" :icon="isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
      </div>
    </v-card-title>

    <v-divider />

    <v-expand-transition>
      <v-card-text v-show="isExpanded" class="pa-4">
        <!-- 新增活動按鈕 - 僅醫院模式 -->
        <v-btn v-if="showAddButton" color="primary" prepend-icon="mdi-plus" block class="mb-4" @click="openAddDialog"> 新增作息項目 </v-btn>

        <!-- 時間軸列表 - 動態方向 -->
        <div v-if="activities.length > 0" :class="timelineDirection === 'horizontal' ? 'timeline-container-horizontal' : 'timeline-container-vertical'">
          <v-timeline :direction="timelineDirection === 'horizontal' ? 'horizontal' : undefined" :side="timelineDirection === 'vertical' ? 'end' : undefined" :align="timelineDirection === 'horizontal' ? 'center' : 'start'" density="compact">
            <v-timeline-item v-for="activity in activities" :key="activity._id" :dot-color="getActivityColor(activity.activityType)" size="large">
              <template #icon>
                <v-icon :icon="getActivityIcon(activity.activityType)" size="large" />
              </template>

              <v-card :color="getActivityColor(activity.activityType)" variant="tonal" :class="timelineDirection === 'horizontal' ? 'activity-card-horizontal' : 'activity-card-vertical'">
                <v-card-text class="pa-3">
                  <div class="d-flex justify-space-between align-start mb-2">
                    <div class="flex-grow-1">
                      <div class="text-h6 font-weight-bold">
                        {{ activity.time }}
                      </div>
                      <div class="text-body-2 text-medium-emphasis">
                        {{ getActivityLabel(activity.activityType) }}
                      </div>
                    </div>
                    <div v-if="showAddButton" class="d-flex ga-1 flex-shrink-0">
                      <v-btn icon="mdi-pencil" size="x-small" variant="text" @click="openEditDialog(activity)" />
                      <v-btn icon="mdi-delete" size="x-small" variant="text" color="error" @click="openDeleteDialog(activity)" />
                    </div>
                  </div>

                  <div v-if="activity.description" class="mb-2">
                    <strong>{{ activity.description }}</strong>
                  </div>

                  <div v-if="activity.value" class="mb-1 d-flex align-center">
                    <span class="text-body-2">{{ activity.value }}</span>
                  </div>

                  <div v-if="activity.notes" class="text-body-2" style="white-space: pre-wrap">
                    {{ activity.notes }}
                  </div>
                </v-card-text>
              </v-card>
            </v-timeline-item>
          </v-timeline>
        </div>

        <!-- 空狀態 -->
        <v-alert v-else type="info" variant="tonal" class="text-center">
          <v-icon icon="mdi-timeline-clock" size="large" class="mb-2" />
          <div>尚未設定作息時間表</div>
          <div v-if="showAddButton" class="text-body-2 mt-2">點擊上方按鈕新增作息項目</div>
        </v-alert>
      </v-card-text>
    </v-expand-transition>
  </v-card>

  <!-- 新增/編輯活動 Dialog -->
  <v-dialog v-model="activityDialog" max-width="600px" persistent>
    <v-card>
      <v-card-title class="text-h5 pa-6">
        <v-icon :icon="isEditing ? 'mdi-pencil' : 'mdi-plus'" class="mr-2" color="primary" />
        {{ isEditing ? '編輯作息項目' : '新增作息項目' }}
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <v-form ref="activityFormRef">
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="activityForm.time" label="時間" type="time" variant="outlined" density="compact" prepend-inner-icon="mdi-clock" :rules="[v => !!v || '請選擇時間']" />
            </v-col>

            <v-col cols="12">
              <v-select v-model="activityForm.activityType" :items="activityTypes" item-title="label" item-value="value" label="活動類型" variant="outlined" density="compact" prepend-inner-icon="mdi-tag" :rules="[v => !!v || '請選擇活動類型']">
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-icon :icon="item.raw.icon" :color="item.raw.color" />
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <v-col cols="12">
              <v-text-field v-model="activityForm.description" label="描述" variant="outlined" density="compact" prepend-inner-icon="mdi-text" placeholder="例如：早餐、胰島素注射..." />
            </v-col>

            <v-col cols="12">
              <v-text-field v-model="activityForm.value" label="數值（可選）" variant="outlined" density="compact" prepend-inner-icon="mdi-numeric" placeholder="例如：120 mg/dL, 5.2 kg..." />
            </v-col>

            <v-col cols="12">
              <v-textarea v-model="activityForm.notes" label="備註" variant="outlined" density="compact" prepend-inner-icon="mdi-note-text" rows="3" placeholder="其他需要記錄的資訊..." />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn variant="outlined" :disabled="isSubmitting" @click="closeDialog"> 取消 </v-btn>
        <v-btn color="primary" :loading="isSubmitting" @click="submitActivity">
          {{ isEditing ? '更新' : '新增' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 刪除確認 Dialog -->
  <v-dialog v-model="deleteDialog" max-width="500px" persistent>
    <v-card>
      <v-card-title class="text-h5 pa-6 text-center">
        <div class="d-flex flex-column align-center">
          <v-avatar color="error" size="64" class="mb-4">
            <v-icon icon="mdi-delete-alert" size="32" color="white" />
          </v-avatar>
          <span class="text-h6">確認刪除作息項目</span>
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6 text-center">
        <p class="text-h6 mb-4">您確定要刪除此作息項目嗎？</p>

        <v-card variant="tonal" color="error" class="mb-4">
          <v-card-text>
            <div class="text-h6 font-weight-bold">{{ deleteItem.time }} - {{ getActivityLabel(deleteItem.activityType) }}</div>
            <div v-if="deleteItem.description" class="text-body-2 mt-2">{{ deleteItem.description }}</div>
          </v-card-text>
        </v-card>

        <v-alert type="warning" variant="tonal" class="text-left">
          <p class="font-weight-bold mb-2">⚠️ 警告：此操作無法復原</p>
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn variant="outlined" :disabled="isDeleting" @click="deleteDialog = false"> 取消 </v-btn>
        <v-btn color="error" variant="elevated" :loading="isDeleting" @click="confirmDelete">
          <v-icon icon="mdi-delete" start />
          確認刪除
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getActivityTimeline, addActivityItem, updateActivityItem, deleteActivityItem } from '@/api'
import { useAppToast } from '@/utils/appToast'

const props = defineProps({
  animalId: {
    type: String,
    required: true,
  },
  showAddButton: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['activityChanged'])

const toast = useAppToast()

// 活動類型定義
const activityTypes = [
  { label: '用餐', value: 'meal', icon: 'mdi-food', color: 'orange' },
  { label: '測血糖', value: 'bloodSugar', icon: 'mdi-water', color: 'red' },
  { label: '點心', value: 'snack', icon: 'mdi-cookie', color: 'amber' },
  { label: '藥物', value: 'medicine', icon: 'mdi-pill', color: 'blue' },
  { label: '胰島素', value: 'insulin', icon: 'mdi-needle', color: 'purple' },
  { label: '運動', value: 'exercise', icon: 'mdi-run', color: 'green' },
  { label: '量體重', value: 'weight', icon: 'mdi-scale', color: 'teal' },
  { label: '其他', value: 'other', icon: 'mdi-dots-horizontal', color: 'grey' },
]

// 狀態
const activities = ref([])
const activityDialog = ref(false)
const deleteDialog = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const activityFormRef = ref(null)
const isExpanded = ref(true) // 預設展開
const timelineDirection = ref('horizontal') // 'vertical' 或 'horizontal'

// 表單
const activityForm = reactive({
  id: '',
  time: new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes().toString().padStart(2, '0'),
  activityType: '',
  description: '',
  value: '',
  notes: '',
})

const deleteItem = reactive({
  id: '',
  time: '',
  activityType: '',
  description: '',
})

// 載入作息時間表
const loadActivities = async () => {
  try {
    const response = await getActivityTimeline(props.animalId)
    if (response.success) {
      // 按時間排序
      activities.value = (response.data.activities || []).sort((a, b) => {
        return a.time.localeCompare(b.time)
      })
    }
  } catch (error) {
    console.error('載入作息時間表失敗:', error)
    toast.error('載入作息時間表失敗')
  }
}

// 獲取活動圖示
const getActivityIcon = type => {
  const activity = activityTypes.find(a => a.value === type)
  return activity ? activity.icon : 'mdi-circle'
}

// 獲取活動顏色
const getActivityColor = type => {
  const activity = activityTypes.find(a => a.value === type)
  return activity ? activity.color : 'grey'
}

// 獲取活動標籤
const getActivityLabel = type => {
  const activity = activityTypes.find(a => a.value === type)
  return activity ? activity.label : type
}

// 切換展開/收合
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 對話框操作
const openAddDialog = () => {
  isEditing.value = false
  activityForm.id = ''
  const now = new Date()
  activityForm.time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')
  activityForm.activityType = ''
  activityForm.description = ''
  activityForm.value = ''
  activityForm.notes = ''
  activityDialog.value = true
}

const openEditDialog = activity => {
  isEditing.value = true
  activityForm.id = activity._id
  activityForm.time = activity.time
  activityForm.activityType = activity.activityType
  activityForm.description = activity.description
  activityForm.value = activity.value
  activityForm.notes = activity.notes
  activityDialog.value = true
}

const closeDialog = () => {
  activityDialog.value = false
}

const openDeleteDialog = activity => {
  deleteItem.id = activity._id
  deleteItem.time = activity.time
  deleteItem.activityType = activity.activityType
  deleteItem.description = activity.description
  deleteDialog.value = true
}

// 提交活動
const submitActivity = async () => {
  if (!activityForm.time || !activityForm.activityType) {
    toast.error('請填寫必要欄位')
    return
  }

  isSubmitting.value = true
  try {
    const payload = {
      time: activityForm.time,
      activityType: activityForm.activityType,
      description: activityForm.description,
      value: activityForm.value,
      notes: activityForm.notes,
    }

    if (isEditing.value) {
      await updateActivityItem(props.animalId, activityForm.id, payload)
      toast.success('作息項目已更新')
    } else {
      await addActivityItem(props.animalId, payload)
      toast.success('作息項目已新增')
    }

    closeDialog()
    await loadActivities()
    emit('activityChanged')
  } catch (error) {
    console.error('提交作息項目失敗:', error)
    toast.error('操作失敗')
  } finally {
    isSubmitting.value = false
  }
}

// 確認刪除
const confirmDelete = async () => {
  isDeleting.value = true
  try {
    await deleteActivityItem(props.animalId, deleteItem.id)
    toast.success('作息項目已刪除')
    deleteDialog.value = false
    await loadActivities()
    emit('activityChanged')
  } catch (error) {
    console.error('刪除作息項目失敗:', error)
    toast.error('刪除失敗')
  } finally {
    isDeleting.value = false
  }
}

// 初始化
onMounted(() => {
  loadActivities()
})
</script>

<style scoped>
.activity-timeline-card {
  height: 100%;
}

/* 可點擊的標題列 */
.clickable-header {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable-header:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

/* 垂直時間軸容器 */
.timeline-container-vertical {
  max-height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex; /* Enable flexbox for centering content */
  justify-content: center; /* Center horizontally */
  /* Add max-width to the container to ensure the flex item (v-timeline) can be centered */
  margin: 0 auto; /* Center the container itself */
}

/* 水平時間軸容器 */
.timeline-container-horizontal {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 20px 0;
}

/* 垂直卡片 */
.activity-card-vertical {
  width: 250px; /* Fixed width */
  height: 150px; /* Fixed height */
  flex-shrink: 0; /* Prevent shrinking in flex containers */
}

/* 水平卡片 */
.activity-card-horizontal {
  width: 200px; /* Fixed width */
  height: 180px; /* Fixed height */
  flex-shrink: 0; /* Prevent shrinking in flex containers */
}

/* 讓 v-card-text 在固定高度的卡片中可滾動 */
.activity-card-vertical .v-card-text,
.activity-card-horizontal .v-card-text {
  height: 100%; /* Ensure v-card-text fills the card height */
  overflow-y: auto; /* Enable vertical scrolling */
}

/* 自定義垂直滾動條 */
.timeline-container-vertical::-webkit-scrollbar {
  width: 8px;
}

.timeline-container-vertical::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.timeline-container-vertical::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.timeline-container-vertical::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 自定義水平滾動條 */
.timeline-container-horizontal::-webkit-scrollbar {
  height: 8px;
}

.timeline-container-horizontal::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.timeline-container-horizontal::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.timeline-container-horizontal::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 水平時間軸的卡片對齊 */
:deep(.v-timeline--horizontal .v-timeline-item__body) {
  padding-top: 16px !important;
}
</style>
