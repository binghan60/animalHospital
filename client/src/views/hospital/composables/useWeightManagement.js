import { ref, reactive } from 'vue'
import { useAppToast } from '@/utils/appToast'
import { createWeight as apiCreateWeight, updateWeight as apiUpdateWeight, deleteWeight as apiDeleteWeight } from '@/api'

export function useWeightManagement(animalId, refreshAnimalInfo) {
  const toast = useAppToast()
  const isAuthActive = () => !sessionStorage.getItem('manualLogout')
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

  // 創建體重記錄（支援參數傳入，若未提供則使用內部狀態）
  const createWeight = async (input = null) => {
    try {
      const date = input?.date ?? modals.weight.date
      const value = input?.value ?? modals.weight.value
      const payload = {
        animalId,
        date,
        value: parseFloat(value),
      }

      isLoading.value = true
      modals.weight.loading = true

      if (!isAuthActive()) { isLoading.value = false; modals.weight.loading = false; return }
      const { message } = (await apiCreateWeight(payload)) || {}

      await refreshAnimalInfo?.()
      // 若是透過內部 modal 建立，才需要關閉和重置
      if (!input) {
        modals.weight.toggle = false
        modals.weight.value = ''
      }
      toast.success(message || '體重記錄新增成功')
    } catch (error) {
      toast.error(error, '新增體重失敗')
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

  // 更新體重記錄（支援參數傳入，若未提供則使用內部狀態）
  const updateWeight = async (input = null) => {
    try {
      const id = input?.id ?? modals.editWeight.id
      const value = input?.value ?? modals.editWeight.value
      const date = input?.date ?? modals.editWeight.date
      const payload = { value: parseFloat(value), date }

      isLoading.value = true
      modals.editWeight.loading = true

      if (!isAuthActive()) { isLoading.value = false; modals.editWeight.loading = false; return }
      await apiUpdateWeight(animalId, id, payload)

      await refreshAnimalInfo?.()
      if (!input) {
        modals.editWeight.toggle = false
        modals.editWeight.value = ''
        modals.editWeight.date = ''
        modals.editWeight.id = ''
      }
      toast.success('體重記錄更新成功')
    } catch (error) {
      toast.error(error, '更新體重失敗')
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
  const confirmDeleteWeight = async (inputId = null) => {
    try {
      modals.deleteWeightConfirm.loading = true

      const targetId = inputId ?? modals.deleteWeightConfirm.weightId
      if (!isAuthActive()) { modals.deleteWeightConfirm.loading = false; return }
      await apiDeleteWeight(animalId, targetId)

      await refreshAnimalInfo?.()
      if (!inputId) modals.deleteWeightConfirm.toggle = false
      toast.success('體重記錄刪除成功')
    } catch (error) {
      toast.error(error, '刪除體重失敗')
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
