<template>
  <v-card class="animal-basic-info-card" :class="{ 'theme-surface': true }">
    <v-card-title class="pb-2 flex-shrink-0">
      <v-icon icon="mdi-information" class="mr-2" color="primary" />
      基本資料
    </v-card-title>

    <v-card-text class="pt-2 overflow-y-auto flex-grow-1">
      <v-list density="compact" class="pa-0">
        <v-list-item class="px-0 py-1">
          <v-list-item-title class="info-label">姓名：</v-list-item-title>
          <v-list-item-subtitle class="info-value">{{ animalInfo.name }}</v-list-item-subtitle>
        </v-list-item>

        <v-list-item class="px-0 py-1">
          <v-list-item-title class="info-label">種類：</v-list-item-title>
          <v-list-item-subtitle class="info-value">
            <v-icon :icon="getVuetifyIcon(animalInfo.type)" class="mr-1" />
            {{ getTypeText(animalInfo.type) }}
          </v-list-item-subtitle>
        </v-list-item>

        <v-list-item v-if="animalInfo.birthday !== null && animalInfo.birthday !== '1970-01-01T00:00:00.000Z'" class="px-0 py-1">
          <v-list-item-title class="info-label">生日：</v-list-item-title>
          <v-list-item-subtitle class="info-value">
            {{ animalInfo.birthday ? new Date(animalInfo.birthday).toISOString().slice(0, 10) : '' }}
            ({{ convertBirthdayToAge(animalInfo.birthday).years }}歲 {{ convertBirthdayToAge(animalInfo.birthday).months > 0 ? convertBirthdayToAge(animalInfo.birthday).months + '個月' : '' }})
          </v-list-item-subtitle>
        </v-list-item>

        <v-list-item class="px-0 py-1">
          <v-list-item-title class="info-label">性別：</v-list-item-title>
          <v-list-item-subtitle class="info-value">
            <v-icon :icon="animalInfo.gender === 'male' ? 'mdi-gender-male' : 'mdi-gender-female'" :color="animalInfo.gender === 'male' ? 'blue' : 'pink'" class="mr-1" />
            {{ animalInfo.gender === 'male' ? '男生' : '女生' }}
          </v-list-item-subtitle>
        </v-list-item>

        <v-list-item class="px-0 py-1">
          <v-list-item-title class="info-label">血型：</v-list-item-title>
          <v-list-item-subtitle class="info-value">
            {{ animalInfo.bloodType ? animalInfo.bloodType + ' 型' : '-' }}
          </v-list-item-subtitle>
        </v-list-item>

        <v-list-item class="px-0 py-1">
          <v-list-item-title class="info-label">體重：</v-list-item-title>
          <v-list-item-subtitle class="info-value">{{ weightValue || '-' }}</v-list-item-subtitle>
        </v-list-item>

        <v-list-item class="px-0 py-1">
          <v-list-item-title class="info-label">品種：</v-list-item-title>
          <v-list-item-subtitle class="info-value">{{ animalInfo.breed || '-' }}</v-list-item-subtitle>
        </v-list-item>

        <v-list-item class="px-0 py-1">
          <v-list-item-title class="info-label">結紮：</v-list-item-title>
          <v-list-item-subtitle class="info-value">
            <v-chip :color="animalInfo.sterilized ? 'success' : 'error'" variant="tonal" size="small">
              {{ animalInfo.sterilized ? '是' : '否' }}
            </v-chip>
          </v-list-item-subtitle>
        </v-list-item>

        <v-list-item class="px-0 py-1">
          <v-list-item-title class="info-label">胰島素：</v-list-item-title>
          <v-list-item-subtitle class="info-value">{{ animalInfo.insulinBrand || '-' }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  animalInfo: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})

// 計算動物年齡
const convertBirthdayToAge = (dateString = new Date()) => {
  const today = new Date()
  const birth = new Date(dateString)
  let years = today.getFullYear() - birth.getFullYear()
  let months = today.getMonth() - birth.getMonth()
  if (months < 0) {
    years--
    months += 12
  }
  return { years, months }
}

// 計算體重值顯示
const weightValue = computed(() => {
  const weight = props.animalInfo.weight
  if (weight && weight.length > 0) {
    const lastWeight = weight[weight.length - 1].value
    return lastWeight !== 0 ? lastWeight + ' 公斤' : ''
  }
  return ''
})

// 獲取 Vuetify 圖示
const getVuetifyIcon = type => {
  if (type === 'dog') {
    return 'mdi-dog'
  } else if (type === 'cat') {
    return 'mdi-cat'
  } else {
    return 'mdi-help-circle'
  }
}

// 獲取類型文字
const getTypeText = type => {
  if (type === 'dog') {
    return '狗狗'
  } else if (type === 'cat') {
    return '貓咪'
  } else {
    return '其他'
  }
}
</script>

<style scoped>
.animal-basic-info-card {
  height: 380px;
  display: flex;
  flex-direction: column;
  background-color: rgb(var(--v-theme-surface)) !important;
  color: rgb(var(--v-theme-on-surface)) !important;
  transition: background-color 0.1s ease, color 0.1s ease;
}

@media (min-width: 1024px) {
  .animal-basic-info-card {
    height: 420px;
    background-color: rgb(var(--v-theme-surface)) !important;
    color: rgb(var(--v-theme-on-surface)) !important;
    transition: background-color 0.1s ease, color 0.1s ease;
  }
}

.animal-basic-info-card .v-card-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 500;
  width: 70px;
  flex-shrink: 0;
}

.info-value {
  font-size: 0.875rem;
  margin-left: 8px;
  word-break: break-word;
}

.v-list-item {
  min-height: 24px !important;
  align-items: flex-start !important;
}

.v-list-item .v-list-item-title,
.v-list-item .v-list-item-subtitle {
  line-height: 1.2 !important;
  white-space: normal !important;
}

.v-list {
  overflow-y: auto;
  max-height: 100%;
  background-color: transparent !important;
}

/* 強制基本資料卡片使用主題變數 */
.animal-basic-info-card.v-card {
  background-color: rgb(var(--v-theme-surface)) !important;
  color: rgb(var(--v-theme-on-surface)) !important;
  transition: background-color 0.1s ease, color 0.1s ease !important;
}

.animal-basic-info-card .v-list-item-title,
.animal-basic-info-card .v-list-item-subtitle {
  color: rgb(var(--v-theme-on-surface)) !important;
}
</style>
