import { ref, reactive, onUnmounted } from 'vue'
import { useAppToast } from '@/utils/appToast'
import { getDiary, createBloodSugar, updateBloodSugar, deleteBloodSugarTask } from '@/api'

export function useBloodSugarCalendar(animalId, user) {
  const toast = useAppToast()
  let destroyed = false
  onUnmounted(() => { destroyed = true })
  const isAuthActive = () => !sessionStorage.getItem('manualLogout') && !!(user?.value?.isLogin)
  const isLoading = ref(false)
  const isDelete = ref(false)

  // 日期相關狀態
  const newtoday = reactive({
    date: new Date(),
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    day: new Date().getDate(),
    lastDay: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(),
  })

  // 日曆資料
  const calendar = ref(Array.from({ length: 42 }, () => ({ loading: true })))
  const weekData = ref([])
  const weekRange = ref('')
  const calendarDisplay = ref('week')
  // 年份月份選擇
  const years = ref([
    { value: 2023, label: '2023年' },
    { value: 2024, label: '2024年' },
    { value: 2025, label: '2025年' },
  ])

  const months = ref([
    { value: 0, label: '1月' },
    { value: 1, label: '2月' },
    { value: 2, label: '3月' },
    { value: 3, label: '4月' },
    { value: 4, label: '5月' },
    { value: 5, label: '6月' },
    { value: 6, label: '7月' },
    { value: 7, label: '8月' },
    { value: 8, label: '9月' },
    { value: 9, label: '10月' },
    { value: 10, label: '11月' },
    { value: 11, label: '12月' },
  ])

  const selectedYear = ref('')
  const selectedMonth = ref('')

  // 模態框狀態
  const modals = reactive({
    addNotes: { toggle: false, loading: false },
    editNotes: { toggle: false, loading: false },
    tips: { toggle: false },
  })

  // 記錄相關
  const newRecord = reactive({
    date: '',
    time: '',
    bloodSugar: '',
    insulin: '',
    notes: '',
  })

  const editRecord = reactive({
    date: '',
    recordId: '',
    taskId: '',
    task: { time: '', bloodSugar: '', insulin: '', notes: '' },
    notes: '',
  })

  // 提示相關
  const showTooltip = ref(false)
  const hoverData = ref([])
  const tooltipStyle = ref({ top: '0px', left: '0px' })

  // 胰島素選項
  const insulinOption = ref([
    { value: '', text: '請選擇劑量' },
    { value: 0, text: '0 小格' },
    { value: 0.5, text: '0.5 小格' },
    { value: 1, text: '1 小格' },
    { value: 1.5, text: '1.5 小格' },
  ])

  // 獲取血糖日記資料
  const getDiaryBloodSugar = async () => {
    try {
      isLoading.value = true
      if (!isAuthActive() || destroyed) { isLoading.value = false; return [] }
      const { year, month, lastDay } = newtoday
      const data = await getDiary({
        animalId,
        startDate: `${year}-${String(month + 1).padStart(2, '0')}-01`,
        endDate: `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`,
      })
      if (destroyed) return []
      isLoading.value = false
      return data
    } catch (error) {
      isLoading.value = false
      toast.error(error, '獲取血糖日記失敗')
      return []
    }
  }

  // 獲取週血糖資料
  const getWeekBloodSugarData = async () => {
    try {
      isLoading.value = true
      if (!isAuthActive() || destroyed) { isLoading.value = false; return }
      const data = await getDiary({
        animalId,
        startDate: weekData.value[0]?.date,
        endDate: weekData.value[6]?.date,
      })

      if (destroyed) return
      // 創建新的週資料陣列，避免直接修改響應式資料
      const updatedWeekData = weekData.value.map(day => {
        const diaryEntry = data.find(entry => new Date(entry.date).toISOString().slice(0, 10) === day.date)
        if (diaryEntry) {
          const filteredRecords = diaryEntry.records
          return {
            ...day,
            _id: diaryEntry._id,
            records: filteredRecords,
          }
        }
        return { ...day, records: [] }
      })

      // 一次性更新整個週資料
      weekData.value = updatedWeekData
      isLoading.value = false
    } catch (error) {
      toast.error(error, '獲取週血糖資料失敗')
      isLoading.value = false
    }
  }

  // 創建血糖任務
  const createTask = async () => {
    try {
      isLoading.value = true
      const payload = {
        animalId,
        date: newRecord.date,
        records: [
          {
            time: newRecord.time,
            bloodSugar: newRecord.bloodSugar,
            insulin: newRecord.insulin,
            notes: newRecord.notes,
            author: user.value._id,
            authorRole: user.value.role,
          },
        ],
        notes: '',
      }

      if (!isAuthActive() || destroyed) { isLoading.value = false; return }
      const data = await createBloodSugar(payload)

      await getWeekBloodSugarData()
      updateCalendar()
      closeTaskModal()
      toast.success(data.message)
    } catch (error) {
      toast.error(error, '創建血糖任務失敗')
    } finally {
      isLoading.value = false
    }
  }

  // 編輯血糖任務
  const editTask = async () => {
    try {
      isLoading.value = true
      const payload = {
        animalId,
        taskId: editRecord.taskId,
        task: editRecord.task,
        notes: editRecord.notes,
      }

      if (!isAuthActive() || destroyed) { isLoading.value = false; return }
      const data = await updateBloodSugar(editRecord.recordId, payload)

      await getWeekBloodSugarData()
      updateCalendar()
      modals.editNotes.toggle = false
      toast.success(data.message)
    } catch (error) {
      toast.error(error, '編輯血糖任務失敗')
    } finally {
      isLoading.value = false
    }
  }

  // 刪除血糖任務
  const deleteTask = async (dataId, taskId) => {
    try {
      isDelete.value = true
      const payload = { animalId, taskId }

      if (!isAuthActive() || destroyed) { isDelete.value = false; return }
      const data = await deleteBloodSugarTask(dataId, payload)

      await getWeekBloodSugarData()
      updateCalendar()
      modals.editNotes.toggle = false
      toast.success(data.message)
    } catch (error) {
      toast.error(error, '刪除血糖任務失敗')
    } finally {
      isDelete.value = false
    }
  }

  // 血糖顏色判斷
  const bloodSugarColor = value => {
    if (value === '') {
      return 'bg-white dark:bg-darkPrimary-600'
    }
    if (value === null || value === undefined || value == 0) {
      return 'bg-gray-200 dark:bg-darkPrimary-600'
    }
    if (value > 0 && value <= 249) {
      return 'bg-green-100 dark:bg-lime-300/40'
    }
    if (value >= 250 && value <= 399) {
      return 'bg-yellow-100 dark:bg-yellow-300/40'
    }
    if (value >= 400) {
      return 'bg-red-100 dark:bg-rose-300/40'
    }
  }

  // 顯示提示
  const showTips = (event, record) => {
    const screenWidth = window.innerWidth
    hoverData.value = record
    if (screenWidth >= 1024) {
      const offset = 15
      const tooltipWidth = 200
      const tooltipHeight = 100
      let left = event.clientX + window.scrollX + offset
      let top = event.clientY + window.scrollY + offset
      if (left + tooltipWidth > window.innerWidth + window.scrollX) {
        left = window.innerWidth + window.scrollX - tooltipWidth - offset
      }
      if (top + tooltipHeight > window.innerHeight + window.scrollY) {
        top = window.innerHeight + window.scrollY - tooltipHeight - offset
      }
      tooltipStyle.value = {
        top: `${top}px`,
        left: `${left}px`,
      }
      showTooltip.value = true
    } else {
      modals.tips.toggle = true
    }
  }

  // 開啟任務模態框
  const openTaskModal = date => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const formattedTime = `${hours}:${minutes}`

    Object.assign(newRecord, {
      date,
      time: formattedTime,
      bloodSugar: '',
      insulin: '',
      notes: '',
    })
    modals.addNotes.toggle = true
  }

  // 關閉任務模態框
  const closeTaskModal = () => {
    modals.addNotes.toggle = false
  }

  // 開啟編輯任務模態框
  const openEditTaskModal = (date, recordId, taskId, time, bloodSugar, insulin, recordNotes, notes) => {
    Object.assign(editRecord, {
      date,
      recordId,
      taskId,
      task: {
        time,
        bloodSugar,
        insulin,
        notes: recordNotes,
        author: user.value._id,
        authorRole: user.value.role,
      },
      notes,
    })
    modals.editNotes.toggle = true
  }

  // 更新日曆
  const updateCalendar = async () => {
    const { year, month, lastDay } = newtoday
    const now = new Date()
    now.setHours(8, 0, 0, 0)

    const container = Array.from({ length: lastDay }, (v, i) => {
      const date = new Date(`${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`).toISOString()
      return {
        year,
        month: month + 1,
        day: i + 1,
        date,
        morning: { time: '', bloodSugar: '', insulin: '', notes: '' },
        evening: { time: '', bloodSugar: '', insulin: '', notes: '' },
        record: [{ time: '', bloodSugar: '', insulin: '', notes: '' }],
        isToday: date === now.toISOString() ? true : false,
      }
    })

    const diaryData = await getDiaryBloodSugar()
    const mergedData = container.map(day => {
      const diaryEntry = diaryData.find(diary => diary.date === day.date)
      if (diaryEntry) {
        return Object.assign(day, diaryEntry)
      }
      return day
    })

    const firstDay = new Date(year, month, 1).getDay()
    const spaceDay = (firstDay + 6) % 7
    const totalCells = 42 - (42 - mergedData.length - spaceDay >= 7 ? 7 : 0)
    const allDays = [...Array.from({ length: spaceDay }, () => ({ date: null })), ...mergedData, ...Array.from({ length: totalCells - spaceDay - mergedData.length }, () => ({ date: null }))]

    calendar.value = allDays
  }

  // 更新週資料
  const updateWeekData = () => {
    const startOfWeek = getStartOfWeek(newtoday.date)
    startOfWeek.setHours(8, 0, 0, 0)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setHours(8, 0, 0, 0)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    weekRange.value = `${startOfWeek.toISOString().split('T')[0]} ~ ${endOfWeek.toISOString().split('T')[0]}`
    weekData.value = getWeekData(startOfWeek)
  }

  // 獲取週開始日期
  const getStartOfWeek = date => {
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - (day === 0 ? 6 : day - 1)
    startOfWeek.setDate(diff)
    startOfWeek.setHours(0, 0, 0, 0)
    return startOfWeek
  }

  // 獲取週資料
  const getWeekData = startOfWeek => {
    const weekData = []
    const daysOfWeek = ['一', '二', '三', '四', '五', '六', '日']
    const now = new Date()
    now.setHours(8, 0, 0, 0)

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      date.setHours(8, 0, 0, 0)
      weekData.push({
        date: date.toISOString().split('T')[0],
        day: daysOfWeek[i],
        records: [],
        isToday: date.toISOString() === now.toISOString(),
        notes: '',
      })
    }
    return weekData
  }

  // 週月導航
  const prevWeek = async () => {
    newtoday.date.setDate(newtoday.date.getDate() - 7)
    newtoday.date = new Date(newtoday.date)
    updateWeekData()
    // 觸發資料載入
    await getWeekBloodSugarData()
  }

  const nextWeek = async () => {
    newtoday.date.setDate(newtoday.date.getDate() + 7)
    newtoday.date = new Date(newtoday.date)
    updateWeekData()
    // 觸發資料載入
    await getWeekBloodSugarData()
  }

  const prevMonth = async () => {
    newtoday.date.setDate(newtoday.date.getDate() - newtoday.lastDay)
    newtoday.date = new Date(newtoday.date)
    // 更新月份相關資料
    newtoday.year = newtoday.date.getFullYear()
    newtoday.month = newtoday.date.getMonth()
    newtoday.lastDay = new Date(newtoday.year, newtoday.month + 1, 0).getDate()
    updateWeekData()
    // 根據當前顯示模式載入資料
    if (calendarDisplay.value === 'week') {
      await getWeekBloodSugarData()
    } else {
      await updateCalendar()
    }
  }

  const nextMonth = async () => {
    newtoday.date.setDate(newtoday.date.getDate() + newtoday.lastDay)
    newtoday.date = new Date(newtoday.date)
    // 更新月份相關資料
    newtoday.year = newtoday.date.getFullYear()
    newtoday.month = newtoday.date.getMonth()
    newtoday.lastDay = new Date(newtoday.year, newtoday.month + 1, 0).getDate()
    updateWeekData()
    // 根據當前顯示模式載入資料
    if (calendarDisplay.value === 'week') {
      await getWeekBloodSugarData()
    } else {
      await updateCalendar()
    }
  }

  const goToFirstWeekOfSelectedMonth = async () => {
    newtoday.date = new Date(selectedYear.value, selectedMonth.value, 1)
    // 更新月份相關資料
    newtoday.year = newtoday.date.getFullYear()
    newtoday.month = newtoday.date.getMonth()
    newtoday.lastDay = new Date(newtoday.year, newtoday.month + 1, 0).getDate()
    updateWeekData()
    // 根據當前顯示模式載入資料
    if (calendarDisplay.value === 'week') {
      await getWeekBloodSugarData()
    } else {
      await updateCalendar()
    }
  }

  return {
    // 狀態
    isLoading,
    newtoday,
    calendar,
    weekData,
    weekRange,
    calendarDisplay,
    years,
    months,
    selectedYear,
    selectedMonth,
    modals,
    newRecord,
    editRecord,
    showTooltip,
    hoverData,
    tooltipStyle,

    // 方法
    getWeekBloodSugarData,
    createTask,
    editTask,
    deleteTask,
    bloodSugarColor,
    showTips,
    openTaskModal,
    closeTaskModal,
    openEditTaskModal,
    updateCalendar,
    updateWeekData,
    prevWeek,
    nextWeek,
    prevMonth,
    nextMonth,
    goToFirstWeekOfSelectedMonth,
  }
}
