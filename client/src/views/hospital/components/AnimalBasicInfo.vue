<template>
  <div class="rounded-lg shadow-md bg-white p-4 lg:p-6 h-full min-h-[300px] lg:max-h-[400px] max-h-[480px] dark:bg-darkPrimary-700">
    <div class="w-full h-full">
      <h5 class="mb-3 text-lg font-semibold text-primary-900 dark:text-darkPrimary-50">基本資料</h5>
      <ul class="grid grid-cols-3 list-none gap-x-4 gap-y-3">
        <li class="text-sm font-medium text-primary-900 dark:text-darkPrimary-50">姓名：</li>
        <li class="col-span-2 text-sm text-gray-800 dark:text-darkPrimary-50">{{ animalInfo.name }}</li>
        
        <li class="text-sm font-medium text-primary-900 dark:text-darkPrimary-50">種類：</li>
        <li class="col-span-2 text-sm text-gray-800 dark:text-darkPrimary-50">
          <i :class="getIconClass(animalInfo.type)"></i>
        </li>
        
        <li class="text-sm font-medium text-primary-900 dark:text-darkPrimary-50">生日：</li>
        <li 
          v-if="animalInfo.birthday !== null && animalInfo.birthday !== '1970-01-01T00:00:00.000Z'" 
          class="col-span-2 text-sm text-gray-800 dark:text-darkPrimary-50"
        >
          {{ animalInfo.birthday ? new Date(animalInfo.birthday).toISOString().slice(0, 10) : '' }} 
          ({{ convertBirthdayToAge(animalInfo.birthday).years }}歲 
          {{ convertBirthdayToAge(animalInfo.birthday).months > 0 ? convertBirthdayToAge(animalInfo.birthday).months + '個月' : '' }})
        </li>
        <li v-else class="col-span-2 text-sm text-gray-800 dark:text-darkPrimary-50"></li>

        <li class="text-sm font-medium text-primary-900 dark:text-darkPrimary-50">性別：</li>
        <li class="col-span-2 text-sm text-gray-800 dark:text-darkPrimary-50">
          <i :class="getGenderIcon(animalInfo.gender)"></i>
        </li>
        
        <li class="text-sm font-medium text-primary-900 dark:text-darkPrimary-50">血型：</li>
        <li class="col-span-2 text-sm text-gray-800 dark:text-darkPrimary-50">
          {{ animalInfo.bloodType ? animalInfo.bloodType + ' 型' : '' }}
        </li>
        
        <li class="text-sm font-medium text-primary-900 dark:text-darkPrimary-50">體重：</li>
        <li class="col-span-2 text-sm text-gray-800 dark:text-darkPrimary-50">{{ weightValue }}</li>
        
        <li class="text-sm font-medium text-primary-900 dark:text-darkPrimary-50">品種：</li>
        <li class="col-span-2 text-sm text-gray-800 dark:text-darkPrimary-50">{{ animalInfo.breed }}</li>
        
        <li class="text-sm font-medium text-primary-900 dark:text-darkPrimary-50">結紮：</li>
        <li class="col-span-2 text-sm text-gray-800 dark:text-darkPrimary-50">
          <i v-show="animalInfo.sterilized" class="text-green-500 fa-solid fa-check fa-fw"></i>
          <i v-show="!animalInfo.sterilized" class="text-red-600 fa-solid fa-x fa-fw"></i>
        </li>
        
        <li class="text-sm font-medium text-primary-900 dark:text-darkPrimary-50">胰島素：</li>
        <li class="col-span-2 text-sm text-gray-800 dark:text-darkPrimary-50">{{ animalInfo.insulinBrand }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  animalInfo: {
    type: Object,
    required: true,
    default: () => ({})
  }
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

// 獲取圖示類別
const getIconClass = (type) => {
  if (type === 'dog') {
    return 'fa-solid fa-dog fa-fw'
  } else if (type === 'cat') {
    return 'fa-solid fa-cat fa-fw'
  } else {
    return 'fa-solid fa-question'
  }
}

// 獲取性別圖示
const getGenderIcon = (gender) => {
  if (gender === 'male') {
    return 'text-primary-600 fa-solid fa-mars fa-fw'
  } else if (gender === 'female') {
    return 'text-pink-600 fa-solid fa-venus fa-fw'
  }
}
</script>