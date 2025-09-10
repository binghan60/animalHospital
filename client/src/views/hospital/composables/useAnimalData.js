import { ref, computed } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

export function useAnimalData(animalId) {
  const toast = useToast()
  const animal = ref({
    Id: animalId,
    Info: {},
    diaryBloodSugar: []
  })
  const isLoading = ref(false)

  // 獲取動物基本資訊
  const getAnimalInfo = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_PATH}/animal/detail/${animal.value.Id}`)
      animal.value.Info = data
      return data
    } catch (error) {
      toast.error(error.response?.data?.message || '獲取動物資訊失敗')
      throw error
    }
  }

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
    const weight = animal.value.Info.weight
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

  return {
    animal,
    isLoading,
    getAnimalInfo
  }
}