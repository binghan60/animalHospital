import { computed } from 'vue'

export function useChartConfig(isDark) {
  // 動態主題色彩（依據 isDark.value 即時切換）
  const colors = computed(() => ({
    line: {
      // 線條/填色隨主題調整（亮色藍、暗色青）
      borderColor: isDark.value ? 'rgba(56, 189, 248, 0.9)' : 'rgba(37, 99, 235, 0.9)', // dark: cyan-400, light: blue-600
      backgroundColor: 'transparent',
      pointColor: isDark.value ? 'rgba(56, 189, 248, 1)' : 'rgba(37, 99, 235, 1)',
      labelColor: isDark.value ? 'rgba(255, 255, 255, 0.92)' : 'rgba(30, 41, 59, 0.92)'},
    
    pie: {
      success: isDark.value ? 'rgba(76, 175, 80, 0.5)' : 'rgba(76, 175, 80, 0.2)',
      warning: isDark.value ? 'rgba(255, 152, 0, 0.5)' : 'rgba(255, 152, 0, 0.2)',
      error: isDark.value ? 'rgba(244, 67, 54, 0.5)' : 'rgba(244, 67, 54, 0.2)',
      border: isDark.value ? 'rgba(45, 51, 73, 1)' : 'rgba(255, 255, 255, 1)'
    },
    grid: isDark.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    ticks: isDark.value ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.8)',
    labels: isDark.value ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'
  }))

  // 體重圖表配置
  const getWeightChartConfig = (weightData) => {
    const data = {
      labels: weightData.map(x => new Date(x.date).toISOString().slice(0, 10)),
      datasets: [
        {
          label: '體重',
          data: weightData.map(x => x.value),
          borderColor: colors.value.line.borderColor,
          backgroundColor: colors.value.line.backgroundColor,
          pointRadius: 6,
          pointHoverRadius: 10
        }
      ]
    }

    const options = {
      fill: false,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        datalabels: {
          display: true,
          color: colors.value.line.labelColor,
          font: { weight: 'bold', size: 14 },
          anchor: 'center',
          align: 'top',
          formatter: value => value.toFixed(1)
        }
      },
      scales: {
        x: { ticks: { color: colors.value.ticks }, grid: { color: colors.value.grid } },
        y: { ticks: { color: colors.value.ticks }, grid: { color: colors.value.grid } }
      }
    }

    return { data, options }
  }

  // 血糖平均圖表配置
  const getAverageChartConfig = (averageData, title) => {
    const data = {
      labels: ['正常 (70-179)', '偏高 (180-399)', '高危 (400+)'],
      datasets: [
        {
          data: [
            averageData.morningCounts.count_1_249 + averageData.eveningCounts.count_1_249,
            averageData.morningCounts.count_250_399 + averageData.eveningCounts.count_250_399,
            averageData.morningCounts.count_400_plus + averageData.eveningCounts.count_400_plus
          ],
          backgroundColor: [
            colors.value.pie.success,
            colors.value.pie.warning,
            colors.value.pie.error
          ],
          borderColor: colors.value.pie.border,
          borderWidth: 2
        }
      ]
    }

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'left',
          labels: { color: colors.value.labels, font: { size: 14 } }
        },
        datalabels: {
          display: true,
          color: colors.value.labels,
          font: { size: 14, weight: 'bold' },
          formatter: (value, context) => {
            const total = context.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0)
            if (!total || !value) return ''
            const percentage = ((value / total) * 100).toFixed(1)
            return `${percentage}%`
          }
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem) => ` ${tooltipItem.label}: ${tooltipItem.raw} 次`
          }
        }
      }
    }

    return { data, options, title }
  }

  // 血糖曲線圖表配置
  const getBloodSugarCurveChartConfig = (curveData) => {
    return curveData.map(x => {
      const data = {
        labels: x.records.map(y => y.time),
        datasets: [
          {
            label: '血糖',
            data: x.records.map(y => y.value),
            borderColor: colors.value.line.borderColor,
            backgroundColor: 'transparent',
            pointRadius: 6,
            pointHoverRadius: 10
          }
        ]
      }

      const option = {
        fill: false,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            font: { size: 20, weight: 'bold' },
            color: colors.value.labels,
            display: true,
            text: `${new Date(x.date).toISOString().split('T')[0]} 血糖曲線`,
            padding: { bottom: 30 }
          },
          legend: { display: false },
          datalabels: {
            display: true,
            color: colors.value.line.labelColor,
            font: { weight: 'bold', size: 14 },
            anchor: 'center',
            align: 'top'
          }
        },
        scales: {
          x: { ticks: { color: colors.value.ticks }, grid: { color: colors.value.grid } },
          y: { ticks: { color: colors.value.ticks }, grid: { color: colors.value.grid } }
        }
      }

      return { data, option }
    })
  }

  // 血糖顏色判斷 (此函數未使用於圖表，保留給其他可能的 UI 元件)
  const bloodSugarColor = (value) => {
    if (value === null || value === undefined || value === 0) return 'bg-gray-200 dark:bg-darkPrimary-600'
    if (value > 0 && value < 70) return 'bg-blue-100'
    if (value >= 70 && value < 180) return 'bg-green-100'
    if (value >= 180 && value < 400) return 'bg-yellow-100'
    if (value >= 400) return 'bg-red-100'
    return 'bg-white'
  }

  return {
    getWeightChartConfig,
    getAverageChartConfig,
    getBloodSugarCurveChartConfig,
    bloodSugarColor
  }
}
