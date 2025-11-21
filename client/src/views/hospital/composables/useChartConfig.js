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
      low: isDark.value ? 'rgba(92, 141, 237, 0.5)' : 'rgba(92, 141, 237, 0.2)',
      normal: isDark.value ? 'rgba(95, 173, 86, 0.5)' : 'rgba(95, 173, 86, 0.2)',
      caution: isDark.value ? 'rgba(242, 192, 55, 0.5)' : 'rgba(242, 192, 55, 0.2)',
      warning: isDark.value ? 'rgba(229, 140, 69, 0.5)' : 'rgba(229, 140, 69, 0.2)',
      danger: isDark.value ? 'rgba(217, 83, 79, 0.5)' : 'rgba(217, 83, 79, 0.2)',
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
      labels: ['過低 (<70)', '正常 (70-179)', '注意 (180-249)', '偏高 (250-399)', '高危 (400+)'],
      datasets: [
        {
          data: [
            averageData.morningCounts.count_low + averageData.eveningCounts.count_low,
            averageData.morningCounts.count_normal + averageData.eveningCounts.count_normal,
            averageData.morningCounts.count_caution + averageData.eveningCounts.count_caution,
            averageData.morningCounts.count_warning + averageData.eveningCounts.count_warning,
            averageData.morningCounts.count_danger + averageData.eveningCounts.count_danger
          ],
          backgroundColor: [
            colors.value.pie.low,
            colors.value.pie.normal,
            colors.value.pie.caution,
            colors.value.pie.warning,
            colors.value.pie.danger
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

  return {
    getWeightChartConfig,
    getAverageChartConfig,
    getBloodSugarCurveChartConfig
  }
}
