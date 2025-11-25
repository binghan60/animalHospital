<template>
  <v-card class="animal-basic-info-card">
    <v-card-title class="d-flex align-center">
      <v-icon icon="mdi-paw" class="mr-2" color="primary" />
      <span class="font-weight-bold">基本資料</span>
    </v-card-title>
    <v-divider />
    <v-card-text class="pa-4">
      <v-list density="compact">
        <!-- 姓名 -->
        <v-list-item>
          <template #prepend>
            <v-icon icon="mdi-card-account-details" />
          </template>
          <div class="d-flex align-center w-100">
            <span class="text-caption text-medium-emphasis me-2">姓名:</span>
            <span class="font-weight-medium text-body-1">{{ animalInfo.name }}</span>
          </div>
          <template #append>
            <v-btn icon="mdi-content-copy" size="x-small" variant="text" @click="copyToClipboard(animalInfo.name)" />
          </template>
        </v-list-item>

        <!-- 院內碼 -->
        <v-list-item v-if="animalInfo.hospitalCode">
          <template #prepend>
            <v-icon icon="mdi-barcode" />
          </template>
          <div class="d-flex align-center w-100">
            <span class="text-caption text-medium-emphasis me-2">院內碼:</span>
            <span class="font-weight-medium text-body-1">{{ animalInfo.hospitalCode }}</span>
          </div>
        </v-list-item>

        <!-- 種類 -->
        <v-list-item>
          <template #prepend>
            <v-icon :icon="getVuetifyIcon(animalInfo.type)" />
          </template>
          <div class="d-flex align-center w-100">
            <span class="text-caption text-medium-emphasis me-2">種類:</span>
            <span class="font-weight-medium text-body-1">{{ getTypeText(animalInfo.type) }}</span>
          </div>
        </v-list-item>

        <!-- 生日 -->
        <v-list-item v-if="age.years !== null">
          <template #prepend>
            <v-icon icon="mdi-cake-variant" />
          </template>
          <div class="d-flex align-center w-100">
            <span class="text-caption text-medium-emphasis me-2">生日:</span>
            <span class="font-weight-medium text-body-1">
              {{ formattedBirthday }} ({{ age.years }} 歲 <span v-if="age.months > 0">{{ age.months }} 個月</span>)
            </span>
          </div>
        </v-list-item>

        <!-- 性別 -->
        <v-list-item>
          <template #prepend>
            <v-icon :color="animalInfo.gender === 'male' ? 'blue' : 'pink'" :icon="animalInfo.gender === 'male' ? 'mdi-gender-male' : 'mdi-gender-female'" />
          </template>
          <div class="d-flex align-center w-100">
            <span class="text-caption text-medium-emphasis me-2">性別:</span>
            <span class="font-weight-medium text-body-1">
              {{ animalInfo.gender === 'male' ? '男生' : '女生' }}
            </span>
          </div>
        </v-list-item>

        <!-- 血型 -->
        <v-list-item v-if="animalInfo.bloodType">
          <template #prepend>
            <v-icon icon="mdi-water" />
          </template>
          <div class="d-flex align-center w-100">
            <span class="text-caption text-medium-emphasis me-2">血型:</span>
            <span class="font-weight-medium text-body-1">{{ animalInfo.bloodType }} 型</span>
          </div>
        </v-list-item>

        <!-- 體重 -->
        <v-list-item v-if="weightValue">
          <template #prepend>
            <v-icon icon="mdi-weight" />
          </template>
          <div class="d-flex align-center w-100">
            <span class="text-caption text-medium-emphasis me-2">體重:</span>
            <span class="font-weight-medium text-body-1">{{ weightValue }}</span>
          </div>
        </v-list-item>

        <!-- 品種 -->
        <v-list-item v-if="animalInfo.breed">
          <template #prepend>
            <v-icon icon="mdi-star-four-points" />
          </template>
          <div class="d-flex align-center w-100">
            <span class="text-caption text-medium-emphasis me-2">品種:</span>
            <span class="font-weight-medium text-body-1">{{ animalInfo.breed }}</span>
          </div>
        </v-list-item>

        <!-- 結紮 -->
        <v-list-item>
          <template #prepend>
            <v-icon icon="mdi-medical-bag" />
          </template>
          <div class="d-flex align-center w-100">
            <span class="text-caption text-medium-emphasis me-2">結紮:</span>
            <v-chip :color="animalInfo.sterilized ? 'success' : 'grey'" variant="tonal" size="x-small">
              {{ animalInfo.sterilized ? '已結紮' : '未結紮' }}
            </v-chip>
          </div>
        </v-list-item>

        <!-- 胰島素品牌 -->
        <v-list-item v-if="animalInfo.insulinBrand">
          <template #prepend>
            <v-icon icon="mdi-insulin" />
          </template>
          <div class="d-flex align-center w-100">
            <span class="text-caption text-medium-emphasis me-2">胰島素品牌:</span>
            <span class="font-weight-medium text-body-1">{{ animalInfo.insulinBrand }}</span>
          </div>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useAppToast } from '@/utils/appToast'

const props = defineProps({
  animalInfo: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})

const toast = useAppToast()

// 計算動物年齡
const convertBirthdayToAge = (dateString = new Date()) => {
  const today = new Date()
  const birth = new Date(dateString)
  let years = today.getFullYear() - birth.getFullYear()
  let months = today.getMonth() - birth.getMonth()
  if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
    years--
    months = (months + 12) % 12
  }
  return { years, months }
}

const age = computed(() => {
  if (!props.animalInfo.birthday || props.animalInfo.birthday === '1970-01-01T00:00:00.000Z') {
    return { years: null, months: null }
  }
  return convertBirthdayToAge(props.animalInfo.birthday)
})

// 格式化生日
const formattedBirthday = computed(() => {
  if (!props.animalInfo.birthday || props.animalInfo.birthday === '1970-01-01T00:00:00.000Z') {
    return '未提供'
  }
  return new Date(props.animalInfo.birthday).toISOString().slice(0, 10)
})

// 計算體重值顯示
const weightValue = computed(() => {
  const weight = props.animalInfo.weight
  if (weight && weight.length > 0) {
    const lastWeight = weight[weight.length - 1].value
    return lastWeight !== 0 ? lastWeight + ' 公斤' : ''
  }
  return ''
})

// 動物住院狀態 (保留)
const statusInfo = computed(() => {
  switch (props.animalInfo.status) {
    case 'in_hospital':
      return { text: '住院中', color: 'success' }
    case 'discharged':
      return { text: '已出院', color: 'grey' }
    case 'deceased':
      return { text: '離世', color: 'blue-grey' }
    default:
      return { text: '未知', color: 'secondary' }
  }
})

// 獲取 Vuetify 圖示 (恢復原始邏輯)
const getVuetifyIcon = type => {
  if (type === 'dog') {
    return 'mdi-dog'
  } else if (type === 'cat') {
    return 'mdi-cat'
  } else {
    return 'mdi-help-circle'
  }
}

// 獲取類型文字 (恢復原始邏輯)
const getTypeText = type => {
  if (type === 'dog') {
    return '狗狗'
  } else if (type === 'cat') {
    return '貓咪'
  } else {
    return '其他'
  }
}

// 複製到剪貼簿 (保留，並應用到名稱)
const copyToClipboard = async text => {
  if (!navigator.clipboard) {
    toast.error('您的瀏覽器不支援剪貼簿功能')
    return
  }
  try {
    await navigator.clipboard.writeText(text)
    toast.success(`「${text}」已成功複製到剪貼簿`)
  } catch (err) {
    toast.error('複製失敗', err.message)
  }
}
</script>

<style scoped>
.animal-basic-info-card {
  height: 380px;
  background-color: rgb(var(--v-theme-surface)) !important;
  color: rgb(var(--v-theme-on-surface)) !important;
  transition:
    background-color 0.1s ease,
    color 0.1s ease;
}

@media (min-width: 1024px) {
  .animal-basic-info-card {
    height: 420px;
    background-color: rgb(var(--v-theme-surface)) !important;
    color: rgb(var(--v-theme-on-surface)) !important;
    transition:
      background-color 0.1s ease,
      color 0.1s ease;
  }
}
</style>
