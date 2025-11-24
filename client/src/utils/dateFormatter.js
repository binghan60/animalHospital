/**
 * 日期格式化工具函數
 */

/**
 * 將日期格式化為 YYYY-MM-DD
 * @param {Date|string} date - 日期物件或字串
 * @returns {string} 格式化後的日期字串
 */
export const formatDateToYyyyMmDd = date => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 將日期格式化為本地化字串（繁體中文）
 * @param {Date|string} date - 日期物件或字串
 * @returns {string} 格式化後的日期字串（例如：2024/01/15）
 */
export const formatDateToLocale = date => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-TW')
}

/**
 * 取得當週的開始和結束日期
 * @returns {{ startDate: string, endDate: string }} 開始和結束日期（YYYY-MM-DD 格式）
 */
export const getCurrentWeekRange = () => {
  const today = new Date()
  const startOfWeek = new Date(today)
  const day = startOfWeek.getDay()
  const diff = startOfWeek.getDate() - (day === 0 ? 6 : day - 1)
  startOfWeek.setDate(diff)
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  return {
    startDate: formatDateToYyyyMmDd(startOfWeek),
    endDate: formatDateToYyyyMmDd(endOfWeek),
  }
}

/**
 * 格式化日期範圍標題
 * @param {string} startDate - 開始日期（YYYY-MM-DD）
 * @param {string} endDate - 結束日期（YYYY-MM-DD）
 * @param {string} type - 類型（'week' | 'month'）
 * @returns {string} 格式化後的標題
 */
export const formatDateRangeTitle = (startDate, endDate, type = 'week') => {
  if (!startDate || !endDate) return ''

  const [startYear, startMonth, startDay] = startDate.split('-')
  const [endYear, endMonth, endDay] = endDate.split('-')

  if (type === 'month') {
    return `${startMonth}月平均血糖`
  }

  // 週範圍
  return `${startMonth}-${startDay} ~ ${endMonth}-${endDay} 平均血糖`
}

/**
 * 取得當前日期的 YYYY-MM-DD 格式
 * @returns {string} 當前日期
 */
export const getTodayFormatted = () => {
  return formatDateToYyyyMmDd(new Date())
}
