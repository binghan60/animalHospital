import { ref, computed } from 'vue'

export function useChartConfig(isDark) {
  // 體重圖表配置
  const getWeightChartConfig = weightData => {
    const data = {
      labels: weightData.map(x => new Date(x.date).toISOString().slice(0, 10)),
      datasets: [
        {
          label: '體重',
          data: weightData.map(x => x.value),
          borderColor: isDark.value ? 'rgb(212 212 212)' : 'rgb(147 197 253)',
          backgroundColor: isDark.value ? 'rgb(115 115 115)' : 'rgb(219 234 254)',
          pointRadius: 6,
          pointHoverRadius: 10,
        },
      ],
    }

    const options = {
      fill: true,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
          position: 'top',
        },
        datalabels: {
          display: true,
          color: isDark.value ? 'rgb(229 229 229)' : '#3b82f6',
          font: {
            weight: 'bold',
            size: 14,
          },
          anchor: 'center',
          align: 'top',
          formatter: value => value.toFixed(1),
        },
      },
      scales: {
        x: {
          ticks: {
            color: isDark.value ? 'rgb(212 212 212)' : 'rgb(0,0,0,0.8)',
          },
          grid: {
            color: isDark.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
        },
        y: {
          ticks: {
            color: isDark.value ? 'rgb(212 212 212)' : 'rgb(0,0,0,0.8)',
          },
          grid: {
            color: isDark.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
    }

    return { data, options }
  }

  // 血糖平均圖表配置
  const getAverageChartConfig = (averageData, title) => {
    const data = {
      labels: ['1~249', '250~399', '400up'],
      datasets: [
        {
          data: [averageData.morningCounts.count_1_249 + averageData.eveningCounts.count_1_249, averageData.morningCounts.count_250_399 + averageData.eveningCounts.count_250_399, averageData.morningCounts.count_400_plus + averageData.eveningCounts.count_400_plus],
          backgroundColor: isDark.value ? ['rgb(163 ,230 ,53 , 0.25)', 'rgb(251 ,191, 36, 0.25)', 'rgb(251, 113, 133, 0.25)'] : ['rgba(220 ,252, 231)', 'rgba(254 ,243, 199)', 'rgba(254 ,226 ,226)'],
          borderColor: isDark.value ? ['rgb(163 ,230 ,53 , 0.25)', 'rgb(251 ,191, 36, 0.25)', 'rgb(251, 113, 133, 0.25)'] : ['rgba(220, 252 ,231)', 'rgba(254 ,243, 199)', 'rgba(254, 226, 226)'],
        },
      ],
    }

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'left',
          labels: {
            color: isDark.value ? 'rgb(212, 212, 212)' : 'rgb(0, 0, 0)',
            font: {
              size: 14,
            },
          },
        },
        datalabels: {
          display: true,
          color: isDark.value ? 'rgb(229 229 229)' : 'rgb(0, 0, 0)',
          font: {
            size: 14,
            weight: 'bold',
          },
          anchor: 'center',
          align: 'center',
          formatter: (value, context) => {
            const data = context.chart.data.datasets[0]?.data || []
            const total = data.reduce((sum, val) => sum + (val || 0), 0)
            if (!total || !value) {
              return ''
            }
            const percentage = ((value / total) * 100).toFixed(1)
            return `${percentage}%`
          },
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              const value = tooltipItem.raw
              return `血糖${tooltipItem.label}: ${value}次`
            },
          },
        },
      },
    }

    return { data, options, title }
  }

  // 血糖曲線圖表配置
  const getBloodSugarCurveChartConfig = curveData => {
    return curveData.map(x => {
      const data = {
        labels: x.records.map(y => y.time),
        datasets: [
          {
            label: '血糖',
            data: x.records.map(y => y.value),
            borderColor: isDark.value ? 'rgb(212 212 212)' : 'rgb(147 197 253)',
            backgroundColor: isDark.value ? 'rgb(115 115 115)' : 'rgb(219 234 254)',
            pointRadius: 6,
            pointHoverRadius: 10,
          },
        ],
      }

      const option = {
        fill: true,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            font: {
              size: 20,
              weight: 'bold',
            },
            color: isDark.value ? 'rgb(229, 229, 229)' : 'rgb(0, 0, 0)',
            display: true,
            text: `${new Date(x.date).toISOString().split('T')[0]}血糖曲線`,
            padding: {
              bottom: 30,
            },
          },
          legend: {
            display: false,
          },
          datalabels: {
            display: true,
            color: isDark.value ? 'rgb(229 229 229)' : '#3b82f6',
            font: {
              weight: 'bold',
              size: 14,
            },
            anchor: 'center',
            align: 'top',
          },
        },
        scales: isDark.value
          ? {
              x: {
                ticks: {
                  color: 'rgb(212 212 212)',
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)',
                },
              },
              y: {
                ticks: {
                  color: 'rgb(212 212 212)',
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)',
                },
              },
            }
          : undefined,
      }

      return { data, option }
    })
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

  return {
    getWeightChartConfig,
    getAverageChartConfig,
    getBloodSugarCurveChartConfig,
    bloodSugarColor,
  }
}
