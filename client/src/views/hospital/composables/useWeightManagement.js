import { ref, reactive } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

export function useWeightManagement(animalId, refreshAnimalInfo) {
  const toast = useToast()
  const isLoading = ref(false)

  // 模態框狀態
  const modals = reactive({
    weight: {
      value: '',
      date: new Date().toISOString().split('T')[0],
      toggle: false,
      loading: false,
    },
    editWeight: {
      id: '',
      value: '',
      date: '',
      toggle: false,
      loading: false,
    },
    deleteWeightConfirm: {
      toggle: false,
      weightId: '',
      weightDate: '',
      weightValue: '',
      loading: false,
    },
    weightList: {
      toggle: false,
    },
  })

  // 創建體重記錄
  const createWeight = async () => {
    try {
      const { date, value } = modals.weight
      const payload = {
        animalId,
        date,
        value: parseFloat(value),
      }

      isLoading.value = true
      modals.weight.loading = true

      const { data } = await axios.post(`${import.meta.env.VITE_API_PATH}/animal/createWeight`, payload, {
        headers: { 'Content-Type': 'application/json' },
      })

      await refreshAnimalInfo()
      modals.weight.toggle = false
      modals.weight.value = ''
      toast.success(data.message)
    } catch (error) {
      toast.error(error.response?.data?.message || '新增體重失敗')
    } finally {
      isLoading.value = false
      modals.weight.loading = false
    }
  }

  // 開啟編輯體重模態框
  const openEditWeightModal = weightRecord => {
    modals.editWeight.id = weightRecord._id
    modals.editWeight.value = weightRecord.value
    modals.editWeight.date = new Date(weightRecord.date).toISOString().split('T')[0]
    modals.editWeight.toggle = true
  }

  // 更新體重記錄
  const updateWeight = async () => {
    try {
      const { id, value, date } = modals.editWeight
      const payload = { value: parseFloat(value), date }

      isLoading.value = true
      modals.editWeight.loading = true

      await axios.put(`${import.meta.env.VITE_API_PATH}/animal/updateWeight/${animalId}/${id}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      })

      await refreshAnimalInfo()
      modals.editWeight.toggle = false
      modals.editWeight.value = ''
      modals.editWeight.date = ''
      modals.editWeight.id = ''
      toast.success('體重記錄更新成功')
    } catch (error) {
      toast.error(error.response?.data?.message || '更新體重失敗')
    } finally {
      isLoading.value = false
      modals.editWeight.loading = false
    }
  }

  // 開啟刪除確認模態框
  const openDeleteWeightConfirmModal = weightRecord => {
    modals.deleteWeightConfirm.weightId = weightRecord._id
    modals.deleteWeightConfirm.weightDate = new Date(weightRecord.date).toISOString().split('T')[0]
    modals.deleteWeightConfirm.weightValue = weightRecord.value
    modals.deleteWeightConfirm.toggle = true
  }

  // 確認刪除體重記錄
  const confirmDeleteWeight = async () => {
    try {
      modals.deleteWeightConfirm.loading = true

      await axios.delete(`${import.meta.env.VITE_API_PATH}/animal/deleteWeight/${animalId}/${modals.deleteWeightConfirm.weightId}`, {
        headers: { 'Content-Type': 'application/json' },
      })

      await refreshAnimalInfo()
      modals.deleteWeightConfirm.toggle = false
      toast.success('體重記錄刪除成功')
    } catch (error) {
      toast.error(error.response?.data?.message || '刪除體重失敗')
    } finally {
      modals.deleteWeightConfirm.loading = false
    }
  }

  // 取消刪除體重記錄
  const cancelDeleteWeight = () => {
    modals.deleteWeightConfirm.toggle = false
    modals.deleteWeightConfirm.weightId = ''
    modals.deleteWeightConfirm.weightDate = ''
    modals.deleteWeightConfirm.weightValue = ''
  }

  return {
    modals,
    isLoading,
    createWeight,
    updateWeight,
    openEditWeightModal,
    confirmDeleteWeight,
    cancelDeleteWeight,
    openDeleteWeightConfirmModal,
  }
}
