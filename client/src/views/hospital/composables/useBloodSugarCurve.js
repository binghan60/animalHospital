import { ref, reactive, computed } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

export function useBloodSugarCurve(animalId) {
  const toast = useToast()
  const isLoading = ref(false)

  // 血糖曲線資料
  const bloodSugarCurveChart = reactive({
    rawData: [],
    allData: [],
    filteredData: [],
    data: [],
    options: [],
    dateFilter: {
      startDate: '',
      endDate: '',
    },
    yearMonthStats: {
      years: [],
      months: [],
      selectedYear: null,
      selectedMonth: null,
    },
  })

  // 模態框狀態
  const modals = reactive({
    bloodSugarCurve: {
      fields: [{ time: '', value: '' }],
      date: new Date().toISOString().split('T')[0],
      toggle: false,
      loading: false,
    },
    editBloodSugarCurve: {
      id: '',
      fields: [{ time: '', value: '' }],
      date: new Date().toISOString().split('T')[0],
      toggle: false,
      loading: false,
    },
    deleteConfirm: {
      toggle: false,
      curveId: '',
      curveDate: '',
      loading: false,
    },
  })

  // 獲取所有血糖曲線資料
  const getAllBloodSugarCurveData = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_PATH}/bloodSugar/getCurve`, {
        params: { animalId },
      })
      // 將資料按日期從新到舊排序
      bloodSugarCurveChart.allData = data.data.sort((a, b) => new Date(b.date) - new Date(a.date))
      calculateYearMonthStats()
      generateBloodSugarCurveInterface()
    } catch (error) {
      toast.error(error.response?.data?.message || '獲取血糖曲線失敗')
    }
  }

  // 計算年份月份統計
  const calculateYearMonthStats = () => {
    const yearStats = {}
    const monthStats = {}

    // 統計每年和每月的資料筆數
    bloodSugarCurveChart.allData.forEach(item => {
      const date = new Date(item.date)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const yearMonth = `${year}-${String(month).padStart(2, '0')}`

      // 統計年份
      if (!yearStats[year]) {
        yearStats[year] = 0
      }
      yearStats[year]++

      // 統計月份
      if (!monthStats[yearMonth]) {
        monthStats[yearMonth] = 0
      }
      monthStats[yearMonth]++
    })

    // 轉換為陣列格式並排序
    bloodSugarCurveChart.yearMonthStats.years = Object.keys(yearStats)
      .map(year => ({
        year: parseInt(year),
        count: yearStats[year],
      }))
      .sort((a, b) => b.year - a.year) // 最新年份在前

    // 檢查當前年月是否有資料，如果有則預設選中
    checkAndSelectCurrentMonth(monthStats)

    // 如果有選中的年份，計算該年份的月份統計
    if (bloodSugarCurveChart.yearMonthStats.selectedYear) {
      updateMonthStatsForYear(bloodSugarCurveChart.yearMonthStats.selectedYear)
    }
  }

  // 檢查並選中當前月份
  const checkAndSelectCurrentMonth = monthStats => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const currentYearMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}`

    // 檢查當前年月是否有資料
    if (monthStats[currentYearMonth] && monthStats[currentYearMonth] > 0) {
      // 預設選中當前年月
      bloodSugarCurveChart.yearMonthStats.selectedYear = currentYear
      bloodSugarCurveChart.yearMonthStats.selectedMonth = currentMonth
      selectMonth(currentYear, currentMonth)
    }
  }

  // 更新指定年份的月份統計
  const updateMonthStatsForYear = selectedYear => {
    const monthStats = {}

    // 統計選中年份的每月資料
    bloodSugarCurveChart.allData
      .filter(item => new Date(item.date).getFullYear() === selectedYear)
      .forEach(item => {
        const month = new Date(item.date).getMonth() + 1
        if (!monthStats[month]) {
          monthStats[month] = 0
        }
        monthStats[month]++
      })

    // 生成12個月的完整列表
    bloodSugarCurveChart.yearMonthStats.months = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1
      return {
        month,
        monthName: `${month}月`,
        count: monthStats[month] || 0,
      }
    })
  }

  // 選擇年份
  const selectYear = year => {
    bloodSugarCurveChart.yearMonthStats.selectedYear = year
    bloodSugarCurveChart.yearMonthStats.selectedMonth = null
    updateMonthStatsForYear(year)

    // 設定日期篩選為該年份
    bloodSugarCurveChart.dateFilter.startDate = `${year}-01-01`
    bloodSugarCurveChart.dateFilter.endDate = `${year}-12-31`
    filterBloodSugarCurveByDate()
  }

  // 選擇月份
  const selectMonth = (year, month) => {
    bloodSugarCurveChart.yearMonthStats.selectedMonth = month

    // 計算該月的最後一天
    const lastDay = new Date(year, month, 0).getDate()

    // 設定日期篩選為該月份
    bloodSugarCurveChart.dateFilter.startDate = `${year}-${String(month).padStart(2, '0')}-01`
    bloodSugarCurveChart.dateFilter.endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    filterBloodSugarCurveByDate()
  }

  // 清除年月選擇
  const clearYearMonthSelection = () => {
    bloodSugarCurveChart.yearMonthStats.selectedYear = null
    bloodSugarCurveChart.yearMonthStats.selectedMonth = null
    bloodSugarCurveChart.yearMonthStats.months = []
    bloodSugarCurveChart.dateFilter.startDate = ''
    bloodSugarCurveChart.dateFilter.endDate = ''
    filterBloodSugarCurveByDate()
  }

  // 生成血糖曲線介面
  const generateBloodSugarCurveInterface = () => {
    // 預設顯示全部資料
    bloodSugarCurveChart.filteredData = bloodSugarCurveChart.allData
  }

  // 根據日期篩選血糖曲線
  const filterBloodSugarCurveByDate = () => {
    if (!bloodSugarCurveChart.dateFilter.startDate || !bloodSugarCurveChart.dateFilter.endDate) {
      bloodSugarCurveChart.filteredData = bloodSugarCurveChart.allData
    } else {
      const startDate = new Date(bloodSugarCurveChart.dateFilter.startDate)
      const endDate = new Date(bloodSugarCurveChart.dateFilter.endDate)
      bloodSugarCurveChart.filteredData = bloodSugarCurveChart.allData
        .filter(item => {
          const itemDate = new Date(item.date)
          return itemDate >= startDate && itemDate <= endDate
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date)) // 確保篩選後也是最新在前
    }
  }

  // 創建血糖曲線
  const createBloodSugarCurve = async () => {
    try {
      isLoading.value = true
      modals.bloodSugarCurve.loading = true
      const { date, fields } = modals.bloodSugarCurve
      const payload = {
        animalId,
        date,
        records: fields,
      }
      await axios.post(`${import.meta.env.VITE_API_PATH}/bloodSugar/createCurve`, payload, {
        headers: { 'Content-Type': 'application/json' },
      })
      await getAllBloodSugarCurveData()
      modals.bloodSugarCurve.toggle = false
      modals.bloodSugarCurve.fields = [{ time: '', value: '' }]
      toast.success('新增血糖曲線成功')
    } catch (error) {
      toast.error(error.response?.data?.message || '新增血糖曲線失敗')
    } finally {
      isLoading.value = false
      modals.bloodSugarCurve.loading = false
    }
  }

  // 開啟編輯血糖曲線模態框
  const openEditBloodSugarCurveModal = curve => {
    modals.editBloodSugarCurve.id = curve._id
    modals.editBloodSugarCurve.date = new Date(curve.date).toISOString().split('T')[0]
    modals.editBloodSugarCurve.fields = curve.records.map(record => ({
      time: record.time,
      value: record.value,
    }))
    modals.editBloodSugarCurve.toggle = true
  }

  // 更新血糖曲線
  const updateBloodSugarCurve = async () => {
    try {
      isLoading.value = true
      modals.editBloodSugarCurve.loading = true
      const { id, date, fields } = modals.editBloodSugarCurve
      const payload = {
        animalId,
        date,
        records: fields,
      }
      await axios.put(`${import.meta.env.VITE_API_PATH}/bloodSugar/updateCurve/${id}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      })
      await getAllBloodSugarCurveData()
      modals.editBloodSugarCurve.toggle = false
      modals.editBloodSugarCurve.fields = [{ time: '', value: '' }]
      toast.success('血糖曲線更新成功')
    } catch (error) {
      toast.error(error.response?.data?.message || '更新血糖曲線失敗')
    } finally {
      isLoading.value = false
      modals.editBloodSugarCurve.loading = false
    }
  }

  // 開啟刪除確認模態框
  const openDeleteConfirmModal = curve => {
    modals.deleteConfirm.curveId = curve._id
    modals.deleteConfirm.curveDate = new Date(curve.date).toISOString().split('T')[0]
    modals.deleteConfirm.toggle = true
  }

  // 確認刪除血糖曲線
  const confirmDeleteBloodSugarCurve = async () => {
    try {
      modals.deleteConfirm.loading = true
      const payload = { animalId }
      await axios.delete(`${import.meta.env.VITE_API_PATH}/bloodSugar/deleteCurve/${modals.deleteConfirm.curveId}`, {
        data: payload,
        headers: { 'Content-Type': 'application/json' },
      })
      await getAllBloodSugarCurveData()
      modals.editBloodSugarCurve.toggle = false
      modals.deleteConfirm.toggle = false
      toast.success('血糖曲線刪除成功')
    } catch (error) {
      toast.error(error.response?.data?.message || '刪除血糖曲線失敗')
    } finally {
      modals.deleteConfirm.loading = false
    }
  }

  // 取消刪除血糖曲線
  const cancelDeleteBloodSugarCurve = () => {
    modals.deleteConfirm.toggle = false
    modals.deleteConfirm.curveId = ''
    modals.deleteConfirm.curveDate = ''
  }

  return {
    bloodSugarCurveChart,
    modals,
    isLoading,
    getAllBloodSugarCurveData,
    selectYear,
    selectMonth,
    clearYearMonthSelection,
    openEditBloodSugarCurveModal,
    openDeleteConfirmModal,
    confirmDeleteBloodSugarCurve,
    createBloodSugarCurve,
    updateBloodSugarCurve,
    cancelDeleteBloodSugarCurve,
  }
}
