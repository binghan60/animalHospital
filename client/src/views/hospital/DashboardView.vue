<script>
import { useAppToast } from '@/utils/appToast'

import { getDashboard } from '@/api'
import authStore from '@/stores/auth'
import { mapState } from 'pinia'
import ChartComponent from '@/components/ChartComponent.vue'
export default {
  components: { ChartComponent },
  data() {
    return {
      dashboard: {},
      gender: {
        type: 'pie',
        data: {
          labels: [],
          datasets: [],
        },
      },
      weight: {
        type: 'bar',
        data: {
          labels: [],
          datasets: [],
        },
      },
      age: {
        type: 'bar',
        data: {
          labels: [],
          datasets: [],
        },
      },
      breed: {
        type: 'bar',
        data: {
          labels: [],
          datasets: [],
        },
      },
      sterilized: {
        type: 'doughnut',
        data: {
          labels: [],
          datasets: [],
        },
      },
      bloodType: {
        type: 'bar',
        data: {
          labels: [],
          datasets: [],
        },
      },
      type: {
        type: 'bar',
        data: {
          labels: [],
          datasets: [],
        },
      },
      insulinBrand: {
        type: 'pie',
        data: {
          labels: [],
          datasets: [],
        },
      },
      genderChinese: { male: '男生', female: '女生' },
      typeChinese: { dog: '狗狗', cat: '貓貓', other: '其他' },
      isLoading: false,
      selectedGender: 0,
      selectedType: 0,
    }
  },
  methods: {
    async getDashBoard() {
      try {
        this.isLoading = true
        const params = {
          hospitalId: this.user._id,
          gender: this.selectedGender,
          type: this.selectedType,
        }
        const data = await getDashboard(params)
        this.dashboard = data
      } catch (error) {
        require('@/utils/appToast').useAppToast().error(error, '載入儀表板資料失敗')
      } finally {
        this.isLoading = false
      }
    },
    updateAllChart(isDark) {
      //標題顏色 rgb(229 229 229)
      if (isDark) {
        this.gender.data = {
          labels: this.dashboard.stats.genderStats.map(x => {
            return this.genderChinese[x._id]
          }),
          datasets: [
            {
              data: this.dashboard.stats.genderStats.map(x => x.count),
              backgroundColor: ['#4C9AFF', '#FF8B8B'],
              borderColor: 'rgb(229 229 229)',
            },
          ],
        }
        this.gender.options = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              color: 'rgb(229 229 229)', // 數字的文字顏色
              font: {
                size: 14, // 字體大小
                weight: 'bold', // 字重
              },
              formatter: (value, context) => {
                const data = context.chart.data.datasets[0]?.data || []
                const total = data.reduce((sum, val) => sum + (val || 0), 0)
                if (!total || !value) {
                  return '0%'
                }
                const percentage = ((value / total) * 100).toFixed(1)
                return `${percentage}%`
              },
            },
            legend: {
              display: true,
              position: 'left',
              labels: {
                color: 'rgb(229 229 229)', // 文字顏色
                font: {
                  size: 14, // 文字大小
                },
                padding: 10,
                boxWidth: 30,
                boxHeight: 10,
              },
            },
            title: {
              display: true,
              text: '性別',
              color: 'rgb(229 229 229)',
              font: {
                size: 16,
                weight: 'bold',
              },
              padding: {
                top: 10,
                bottom: 25,
              },
            },
            tooltip: {
              enabled: true,
              callbacks: {
                label: function (item) {
                  return `${item.raw}隻`
                },
                title: function (item) {
                  return item[0].label
                },
              },
            },
          },
        }
        this.weight.data = {
          labels: this.dashboard.stats.weightDistribution.map(x => x.weightRange),
          datasets: [
            {
              label: '數量',
              data: this.dashboard.stats.weightDistribution.map(x => x.count),
              backgroundColor: ['rgb(199 210 254)', 'rgb(165 180 252)', 'rgb(129 140 248)', 'rgb(99 102 241)', 'rgb(79 70 229)', 'rgb(67 56 202)', 'rgb(55 48 163)', 'rgb(49 46 129)', 'rgb(30 27 75)', 'rgb(30 27 75)'],
            },
          ],
        }
        this.weight.options = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              color: 'rgb(229 229 229)',
              font: {
                size: 14,
                weight: 'bold',
              },
              anchor: 'end',
              align: 'top',
              formatter: (value, context) => {
                const data = context.chart.data.datasets[0]?.data || []
                const total = data.reduce((sum, val) => sum + (val || 0), 0)
                if (!total || !value) {
                  return '0%'
                }
                const percentage = ((value / total) * 100).toFixed(1)
                return `${percentage}%`
              },
            },
            legend: { display: false },
            title: {
              display: true,
              text: '體重',
              color: 'rgb(229 229 229)',
              font: {
                size: 16,
                weight: 'bold',
              },
              padding: {
                top: 10,
                bottom: 25,
              },
            },
          },
          scales: {
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
          },
        }
        this.age.data = {
          labels: this.dashboard.stats.ageDistribution.map(x => x.ageRange),
          datasets: [
            {
              label: '數量',
              data: this.dashboard.stats.ageDistribution.map(x => x.count),
              backgroundColor: ['rgb(199 210 254)', 'rgb(165 180 252)', 'rgb(129 140 248)', 'rgb(99 102 241)', 'rgb(79 70 229)', 'rgb(67 56 202)', 'rgb(55 48 163)', 'rgb(49 46 129)', 'rgb(30 27 75)', 'rgb(30 27 75)'],
            },
          ],
        }
        this.age.options = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              color: 'rgb(229 229 229)',
              font: {
                size: 14,
                weight: 'bold',
              },
              anchor: 'end',
              align: 'top',
              formatter: (value, context) => {
                const data = context.chart.data.datasets[0]?.data || []
                const total = data.reduce((sum, val) => sum + (val || 0), 0)
                if (!total || !value) {
                  return '0%'
                }
                const percentage = ((value / total) * 100).toFixed(1)
                return `${percentage}%`
              },
            },
            legend: { display: false },
            title: {
              display: true,
              text: '年齡',
              color: 'rgb(229 229 229)',
              font: {
                size: 16,
                weight: 'bold',
              },
              padding: {
                top: 10,
                bottom: 25,
              },
            },
          },
          scales: {
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
          },
        }
        this.sterilized.data = {
          labels: this.dashboard.stats.sterilizedStats.map(x => {
            if (x._id == true) {
              return '是'
            }
            if (x._id == false) {
              return '否'
            }
          }),
          datasets: [
            {
              label: '數量',
              data: this.dashboard.stats.sterilizedStats.map(x => x.count),
              backgroundColor: ['#4C9AFF', '#FF8B8B'],
              borderColor: 'rgb(229 229 229)',
            },
          ],
        }
        this.sterilized.options = {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              color: 'rgb(229 229 229)', // 數字的文字顏色
              font: {
                size: 14, // 字體大小
                weight: 'bold', // 字重
              },
              formatter: (value, context) => {
                const data = context.chart.data.datasets[0]?.data || []
                const total = data.reduce((sum, val) => sum + (val || 0), 0)
                if (!total || !value) {
                  return '0%'
                }
                const percentage = ((value / total) * 100).toFixed(1)
                return `${percentage}%`
              },
            },
            legend: {
              display: true,
              position: 'left',
              labels: {
                color: 'rgb(229 229 229)', // 文字顏色
                font: {
                  size: 14, // 文字大小
                },
                padding: 10,
                boxWidth: 30,
                boxHeight: 10,
              },
            },
            title: {
              display: true,
              text: '結紮',
              color: 'rgb(229 229 229)',
              font: {
                size: 16,
                weight: 'bold',
              },
              padding: {
                top: 10,
                bottom: 25,
              },
            },
          },
        }
        this.breed.data = {
          labels: this.dashboard.stats.breedStats.map(x => {
            if (x._id === '') {
              return '未輸入品種'
            }
            return x._id
          }),
          datasets: [
            {
              label: '數量',
              data: this.dashboard.stats.breedStats.map(x => x.count),
              backgroundColor: ['#5A9BD5', '#FFAA64', '#8CD979', '#F7A556', '#F087B9', '#9C77E0', '#E24A47', '#B9D636', '#FF9A36', '#797916'],
            },
          ],
        }
        this.breed.options = {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              color: 'rgb(229 229 229)',
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
                  return '0%'
                }
                const percentage = ((value / total) * 100).toFixed(1)
                return `${percentage}%`
              },
            },
            legend: { display: false },
            title: {
              display: true,
              text: '品種',
              color: 'rgb(229 229 229)',
              font: {
                size: 16,
                weight: 'bold',
              },
              padding: {
                top: 10,
                bottom: 25,
              },
            },
          },
          scales: {
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
          },
        }
        this.bloodType.data = {
          labels: this.dashboard.stats.bloodTypeStats.map(x => {
            if (x._id == '') {
              return '未輸入血型'
            }
            return x._id
          }),
          datasets: [
            {
              label: '數量',
              data: this.dashboard.stats.bloodTypeStats.map(x => x.count),
              backgroundColor: ['#FFB6C1', '#87CEEB', '#98FB98', '#FFD700', '#D3D3D3'],
            },
          ],
        }
        this.bloodType.options = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              color: 'rgb(229 229 229)',
              font: {
                size: 14,
                weight: 'bold',
              },
              anchor: 'end',
              align: 'top',
              formatter: (value, context) => {
                const data = context.chart.data.datasets[0]?.data || []
                const total = data.reduce((sum, val) => sum + (val || 0), 0)
                if (!total || !value) {
                  return '0%'
                }
                const percentage = ((value / total) * 100).toFixed(1)
                return `${percentage}%`
              },
            },
            legend: { display: false },
            title: {
              display: true,
              text: '血型',
              color: 'rgb(229 229 229)',
              font: {
                size: 16,
                weight: 'bold',
              },
              padding: {
                top: 10,
                bottom: 25,
              },
            },
          },
          scales: {
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
          },
        }
        this.type.data = {
          labels: this.dashboard.stats.typeStats
            .sort((a, b) => {
              if (a._id === '') return 1 // a 向後移動
              if (b._id === '') return -1 // b 向後移動
              return a._id.localeCompare(b._id)
            })
            .map(x => {
              if (x._id == '') {
                return '未選擇種類'
              }
              return this.typeChinese[x._id]
            }),
          datasets: [
            {
              label: '數量',
              data: this.dashboard.stats.typeStats.map(x => x.count),
              backgroundColor: [
                '#F08080', // 貓
                '#FFA07A', // 狗
                '#FFD700', // 其他
              ],
            },
          ],
        }
        this.type.options = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              color: 'rgb(229 229 229)',
              font: {
                size: 14,
                weight: 'bold',
              },
              anchor: 'end',
              align: 'top',
              formatter: (value, context) => {
                const data = context.chart.data.datasets[0]?.data || []
                const total = data.reduce((sum, val) => sum + (val || 0), 0)
                if (!total || !value) {
                  return '0%'
                }
                const percentage = ((value / total) * 100).toFixed(1)
                return `${percentage}%`
              },
            },
            legend: { display: false },
            title: {
              display: true,
              text: '動物種類',
              color: 'rgb(229 229 229)',
              font: {
                size: 16,
                weight: 'bold',
              },
              padding: {
                top: 10,
                bottom: 25,
              },
            },
          },
          scales: {
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
          },
        }
        this.insulinBrand.data = {
          labels: this.dashboard.stats.insulinBrandStats.map(x => {
            if (x._id === '') {
              return '未輸入胰島素品牌'
            }
            return x._id
          }),
          datasets: [
            {
              data: this.dashboard.stats.insulinBrandStats.map(x => x.count),
              backgroundColor: [
                '#6BB6D1', // 粉藍色系
                '#A298B6', // 薰衣草紫
                '#A1D0A5', // 淺綠色系
                '#F0A5B5', // 淡粉色系
              ],
              borderColor: 'rgb(229 229 229)',
            },
          ],
        }
        this.insulinBrand.options = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              color: 'rgb(229 229 229)',
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
                  return '0%'
                }
                const percentage = ((value / total) * 100).toFixed(1)
                return `${percentage}%`
              },
            },
            legend: {
              display: true,
              position: 'left',
              labels: {
                color: 'rgb(229 229 229)', // 文字顏色
                font: {
                  size: 14, // 文字大小
                },
                padding: 10,
                boxWidth: 30,
                boxHeight: 10,
              },
            },
            title: {
              display: true,
              text: '胰島素品牌',
              color: 'rgb(229 229 229)',
              font: {
                size: 16,
                weight: 'bold',
              },
              padding: {
                top: 10,
                bottom: 25,
              },
            },
            tooltip: {
              enabled: true,
              callbacks: {
                label: function (item) {
                  return `${item.raw}隻`
                },
                title: function (item) {
                  return item[0].label
                },
              },
            },
          },
        }
      } else {
        ////////////////////////////////////////////
        this.gender.data = {
          labels: this.dashboard.stats.genderStats.map(x => {
            return this.genderChinese[x._id]
          }),
          datasets: [
            {
              data: this.dashboard.stats.genderStats.map(x => x.count),
              backgroundColor: ['#A0C4FF', '#FFB3B3'],
              borderColor: '#FFFFFF',
            },
          ],
        }
        this.gender.options = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              font: {
                size: 14,
                weight: 'bold',
              },
              formatter: (value, context) => {
                const data = context.chart.data.datasets[0]?.data || []
                const total = data.reduce((sum, val) => sum + (val || 0), 0)
                if (!total || !value) {
                  return '0%'
                }
                const percentage = ((value / total) * 100).toFixed(1)
                return `${percentage}%`
              },
            },
            legend: {
              display: true,
              position: 'left',
              labels: {
                color: 'black', // 文字顏色
                font: {
                  size: 14, // 文字大小
                },
                padding: 10,
                boxWidth: 30,
                boxHeight: 10,
              },
            },
            title: {
              display: true,
              text: '性別',
              font: {
                size: 16,
                weight: 'bold',
              },
              padding: {
                top: 10,
                bottom: 25,
              },
            },
            tooltip: {
              enabled: true,
              callbacks: {
                label: function (item) {
                  return `${item.raw}隻`
                },
                title: function (item) {
                  return item[0].label
                },
              },
            },
          },
        }
        this.weight.data = {
          labels: this.dashboard.stats.weightDistribution.map(x => x.weightRange),
          datasets: [
            {
              label: '數量',
              data: this.dashboard.stats.weightDistribution.map(x => x.count),
              backgroundColor: ['#A7C6ED', '#86B5EA', '#64A4E6', '#3B82F6', '#2D73D7', '#1F64C1', '#1A56A1', '#17487F', '#153D6B', '#122D56'],
            },
          ],
        }
        this.weight.options = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              font: {
                size: 14,
                weight: 'bold',
              },
              anchor: 'end',
              align: 'top',
              formatter: (value, context) => {
                const data = context.chart.data.datasets[0]?.data || []
                const total = data.reduce((sum, val) => sum + (val || 0), 0)
                if (!total || !value) {
                  return '0%'
                }
                const percentage = ((value / total) * 100).toFixed(1)
                return `${percentage}%`
              },
            },
            legend: { display: false },
            title: {
              display: true,
              text: '體重',
              font: {
                size: 16,
                weight: 'bold',
              },
              padding: {
                top: 10,
                bottom: 25,
              },
            },
          },
          scales: {
            x: { beginAtZero: true },
            y: { beginAtZero: true },
          },
        }
        this.age.data = {
          labels: this.dashboard.stats.ageDistribution.map(x => x.ageRange),
          datasets: [
            {
              label: '數量',
              data: this.dashboard.stats.ageDistribution.map(x => x.count),
              backgroundColor: ['#A7C6ED', '#86B5EA', '#64A4E6', '#3B82F6', '#2D73D7', '#1F64C1', '#1A56A1', '#17487F', '#153D6B', '#122D56'],
            },
          ],
        }
        this.age.options = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              font: {
                size: 14,
                weight: 'bold',
              },
              anchor: 'end',
              align: 'top',
              formatter: (value, context) => {
                const data = context.chart.data.datasets[0]?.data || []
                const total = data.reduce((sum, val) => sum + (val || 0), 0)
                if (!total || !value) {
                  return '0%'
                }
                const percentage = ((value / total) * 100).toFixed(1)
                return `${percentage}%`
              },
            },
            legend: { display: false },
            title: {
              display: true,
              text: '年齡',
              font: {
                size: 16,
                weight: 'bold',
              },
              padding: {
                top: 10,
                bottom: 25,
              },
            },
          },
          scales: {
            x: { beginAtZero: true },
            y: { beginAtZero: true },
          },
        }
        this.sterilized.data = {
          labels: this.dashboard.stats.sterilizedStats.map(x => {
            if (x._id == true) {
              return '是'
            }
            if (x._id == false) {
              return '否'
            }
          }),
          datasets: [
            {
              label: '數量',
              data: this.dashboard.stats.sterilizedStats.map(x => x.count),
              backgroundColor: ['#A0C4FF', '#FFB3B3'],
              borderColor: '#FFFFFF',
            },
          ],
        }
        this.sterilized.options = {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              font: {
                size: 14, // 字體大小
                weight: 'bold', // 字重
              },
              formatter: (value, context) => {
                const data = context.chart.data.datasets[0]?.data || []
                const total = data.reduce((sum, val) => sum + (val || 0), 0)
                if (!total || !value) {
                  return '0%'
                }
                const percentage = ((value / total) * 100).toFixed(1)
                return `${percentage}%`
              },
            },
            legend: {
              display: true,
              position: 'left',
              labels: {
                font: {
                  size: 14, // 文字大小
                },
                padding: 10,
                boxWidth: 30,
                boxHeight: 10,
              },
            },
            title: {
              display: true,
              text: '結紮',
              font: {
                size: 16,
                weight: 'bold',
              },
              padding: {
                top: 10,
                bottom: 25,
              },
            },
          },
        }
        this.breed.data = {
          labels: this.dashboard.stats.breedStats.map(x => {
            if (x._id === '') {
              return '未輸入品種'
            }
            return x._id
          }),
          datasets: [
            {
              label: '數量',
              data: this.dashboard.stats.breedStats.map(x => x.count),
              backgroundColor: ['#A7C7E7', '#FFD7A1', '#D1F7C4', '#FDCB82', '#F5A6D2', '#C2A1F3', '#FF6F61', '#D4E157', '#FFB74D', '#9E9D24'],
            },
          ],
        }
        this.breed.options = {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
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
                  return '0%'
                }
                const percentage = ((value / total) * 100).toFixed(1)
                return `${percentage}%`
              },
            },
            legend: { display: false },
            title: {
              display: true,
              text: '品種',
              font: {
                size: 16,
                weight: 'bold',
              },
              padding: {
                top: 10,
                bottom: 25,
              },
            },
          },
          scales: {
            x: { beginAtZero: true },
            y: { beginAtZero: true },
          },
        }
        this.bloodType.data = {
          labels: this.dashboard.stats.bloodTypeStats.map(x => {
            if (x._id == '') {
              return '未輸入血型'
            }
            return x._id
          }),
          datasets: [
            {
              label: '數量',
              data: this.dashboard.stats.bloodTypeStats.map(x => x.count),
              backgroundColor: ['#FFB6C1', '#87CEEB', '#98FB98', '#FFD700', '#D3D3D3'],
            },
          ],
        }
        this.bloodType.options = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              font: {
                size: 14,
                weight: 'bold',
              },
              anchor: 'end',
              align: 'top',
              formatter: (value, context) => {
                const data = context.chart.data.datasets[0]?.data || []
                const total = data.reduce((sum, val) => sum + (val || 0), 0)
                if (!total || !value) {
                  return '0%'
                }
                const percentage = ((value / total) * 100).toFixed(1)
                return `${percentage}%`
              },
            },
            legend: { display: false },
            title: {
              display: true,
              text: '血型',
              font: {
                size: 16,
                weight: 'bold',
              },
              padding: {
                top: 10,
                bottom: 25,
              },
            },
          },
          scales: {
            x: { beginAtZero: true },
            y: { beginAtZero: true },
          },
        }
        this.type.data = {
          labels: this.dashboard.stats.typeStats
            .sort((a, b) => {
              if (a._id === '') return 1 // a 向後移動
              if (b._id === '') return -1 // b 向後移動
              return a._id.localeCompare(b._id)
            })
            .map(x => {
              if (x._id == '') {
                return '未選擇種類'
              }
              return this.typeChinese[x._id]
            }),
          datasets: [
            {
              label: '數量',
              data: this.dashboard.stats.typeStats.map(x => x.count),
              backgroundColor: [
                '#FFC1C1', // 貓
                '#FFDAB9', // 狗
                '#FFFACD', // 其他
              ],
            },
          ],
        }
        this.type.options = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              font: {
                size: 14,
                weight: 'bold',
              },
              anchor: 'end',
              align: 'top',
              formatter: (value, context) => {
                const data = context.chart.data.datasets[0]?.data || []
                const total = data.reduce((sum, val) => sum + (val || 0), 0)
                if (!total || !value) {
                  return '0%'
                }
                const percentage = ((value / total) * 100).toFixed(1)
                return `${percentage}%`
              },
            },
            legend: { display: false },
            title: {
              display: true,
              text: '動物種類',
              font: {
                size: 16,
                weight: 'bold',
              },
              padding: {
                top: 10,
                bottom: 25,
              },
            },
          },
          scales: {
            x: { beginAtZero: true },
            y: { beginAtZero: true },
          },
        }
        this.insulinBrand.data = {
          labels: this.dashboard.stats.insulinBrandStats.map(x => {
            if (x._id === '') {
              return '未輸入胰島素品牌'
            }
            return x._id
          }),
          datasets: [
            {
              data: this.dashboard.stats.insulinBrandStats.map(x => x.count),
              backgroundColor: ['#A7D8F2', '#D3C4E0', '#D0E8D6', '#F5D0D6'],
            },
          ],
        }
        this.insulinBrand.options = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
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
                  return '0%'
                }
                const percentage = ((value / total) * 100).toFixed(1)
                return `${percentage}%`
              },
            },
            legend: {
              display: true,
              position: 'left',
              labels: {
                color: 'black', // 文字顏色
                font: {
                  size: 14, // 文字大小
                },
                padding: 10,
                boxWidth: 30,
                boxHeight: 10,
              },
            },
            title: {
              display: true,
              text: '胰島素品牌',
              font: {
                size: 16,
                weight: 'bold',
              },
              padding: {
                top: 10,
                bottom: 25,
              },
            },
            tooltip: {
              enabled: true,
              callbacks: {
                label: function (item) {
                  return `${item.raw}隻`
                },
                title: function (item) {
                  return item[0].label
                },
              },
            },
          },
        }
      }
    },
  },
  computed: {
    ...mapState(authStore, ['user', 'isDark']),
  },
  watch: {
    isDark(isDark) {
      this.updateAllChart(isDark)
    },
    async selectedGender() {
      await this.getDashBoard()
      this.updateAllChart(this.isDark)
    },
    async selectedType() {
      await this.getDashBoard()
      this.updateAllChart(this.isDark)
    },
  },
  async mounted() {
    await this.getDashBoard()
    this.updateAllChart(this.isDark)
  },
}
</script>

<template>
  <v-container fluid>
    <!-- 篩選選項 -->
    <v-card class="mb-6">
      <v-card-title class="text-center">
        <h2 class="text-h5 font-weight-bold">篩選選項</h2>
      </v-card-title>
      <v-card-text>
        <!-- 性別篩選 -->
        <div class="text-center mb-6">
          <v-chip-group v-model="selectedGender" selected-class="text-white" color="primary" mandatory>
            <v-chip value="0">
              <v-icon icon="mdi-gender-male-female" start />
              所有性別
            </v-chip>
            <v-chip value="male">
              <v-icon icon="mdi-gender-male" start />
              男
            </v-chip>
            <v-chip value="female">
              <v-icon icon="mdi-gender-female" start />
              女
            </v-chip>
          </v-chip-group>
        </div>
        <!-- 動物種類篩選 -->
        <div class="text-center">
          <v-chip-group v-model="selectedType" selected-class="text-white" color="secondary" mandatory>
            <v-chip value="0">所有種類</v-chip>
            <v-chip value="cat">
              <v-icon icon="mdi-cat" start />
              貓咪
            </v-chip>
            <v-chip value="dog">
              <v-icon icon="mdi-dog" start />
              狗狗
            </v-chip>
            <v-chip value="other">
              <v-icon icon="mdi-help-circle" start />
              其他
            </v-chip>
            <v-chip value="">
              <v-icon icon="mdi-help-circle-outline" start />
              未選擇種類
            </v-chip>
          </v-chip-group>
        </div>
      </v-card-text>
    </v-card>
    <!-- 統計顯示 -->
    <v-card class="text-center mb-6">
      <v-card-text>
        <div class="text-h2 font-weight-bold mb-2">{{ dashboard.stats?.total ? dashboard.stats?.total : '--' }}隻</div>
        <div class="text-h6">目前院內動物數量</div>
      </v-card-text>
    </v-card>
    <!-- 圖表網格 -->
    <v-row>
      <v-col cols="12" lg="4">
        <v-card elevation="2" height="350">
          <v-card-text class="pa-2">
            <ChartComponent :type="gender.type" :chartData="gender.data" :chartOptions="gender.options"></ChartComponent>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card elevation="2" height="350">
          <v-card-text class="pa-2">
            <ChartComponent :type="weight.type" :chartData="weight.data" :chartOptions="weight.options"></ChartComponent>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card elevation="2" height="350">
          <v-card-text class="pa-2">
            <ChartComponent :type="age.type" :chartData="age.data" :chartOptions="age.options"></ChartComponent>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card elevation="2" height="350">
          <v-card-text class="pa-2">
            <ChartComponent :type="sterilized.type" :chartData="sterilized.data" :chartOptions="sterilized.options"></ChartComponent>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card elevation="2" height="350">
          <v-card-text class="pa-2">
            <ChartComponent :type="breed.type" :chartData="breed.data" :chartOptions="breed.options"></ChartComponent>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card elevation="2" height="350">
          <v-card-text class="pa-2">
            <ChartComponent :type="bloodType.type" :chartData="bloodType.data" :chartOptions="bloodType.options"></ChartComponent>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card elevation="2" height="350">
          <v-card-text class="pa-2">
            <ChartComponent :type="type.type" :chartData="type.data" :chartOptions="type.options"></ChartComponent>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card elevation="2" height="350">
          <v-card-text class="pa-2">
            <ChartComponent :type="insulinBrand.type" :chartData="insulinBrand.data" :chartOptions="insulinBrand.options"></ChartComponent>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading overlay -->
    <v-overlay :model-value="isLoading" class="align-center justify-center">
      <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-container>
</template>
