<script>
import axios from 'axios'
import authStore from '@/stores/auth'
import { mapState } from 'pinia'
import ChartComponent from '@/components/ChartComponent.vue'
export default {
  inject: ['loadingConfig'],
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
        const { data } = await axios.get(`${import.meta.env.VITE_API_PATH}/dashboard`, {
          params,
        })
        this.dashboard = data
      } catch (error) {
        this.$toast.error(error.response.data.message)
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
  <div class="grid grid-cols-3 gap-4 text-center">
    <div class="col-span-3 p-6 bg-white border border-gray-200 rounded-lg shadow-lg dark:border-darkPrimary-400 dark:bg-darkPrimary-600">
      <h2 class="mb-4 text-xl font-semibold text-gray-800 dark:text-darkPrimary-50">篩選選項</h2>
      <div class="flex justify-center mb-8 space-x-4">
        <label class="rounded-lg">
          <input v-model="selectedGender" type="radio" class="hidden peer" name="gender" value="0" />
          <span class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 lg:py-2 text-primary-800 dark:text-darkPrimary-50 dark:bg-darkPrimary-500 bg-primary-100 peer-checked:bg-primary-500 dark:peer-checked:bg-darkPrimary-200 peer-checked:text-white dark:hover:bg-darkPrimary-500 dark:peer-checked:text-darkPrimary-600"><i class="fa-solid fa-mars fa-fw"></i>所有性別</span>
        </label>
        <label class="rounded-lg">
          <input v-model="selectedGender" type="radio" class="hidden peer" name="gender" value="male" />
          <span class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 lg:py-2 text-primary-800 dark:text-darkPrimary-50 dark:bg-darkPrimary-500 bg-primary-100 peer-checked:bg-primary-500 dark:peer-checked:bg-darkPrimary-200 peer-checked:text-white dark:hover:bg-darkPrimary-500 dark:peer-checked:text-darkPrimary-600"><i class="fa-solid fa-mars fa-fw"></i> 男</span>
        </label>
        <label class="rounded-lg">
          <input v-model="selectedGender" type="radio" class="hidden peer" name="gender" value="female" />
          <span class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 lg:py-2 text-primary-800 dark:text-darkPrimary-50 dark:bg-darkPrimary-500 bg-primary-100 peer-checked:bg-primary-500 dark:peer-checked:bg-darkPrimary-200 peer-checked:text-white dark:hover:bg-darkPrimary-500 dark:peer-checked:text-darkPrimary-600"><i class="fa-solid fa-venus fa-fw"></i> 女</span>
        </label>
      </div>
      <div class="flex flex-wrap justify-center mb-0 space-x-4 lg:mb-4">
        <label class="mb-6 rounded-lg lg:mb-0">
          <input v-model="selectedType" type="radio" class="hidden peer" name="type" value="0" />
          <span class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 lg:py-2 text-primary-800 dark:text-darkPrimary-50 dark:bg-darkPrimary-500 bg-primary-100 peer-checked:bg-primary-500 dark:peer-checked:bg-darkPrimary-200 peer-checked:text-white dark:hover:bg-darkPrimary-500 dark:peer-checked:text-darkPrimary-600">所有種類</span>
        </label>
        <label class="mb-6 rounded-lg lg:mb-0">
          <input v-model="selectedType" type="radio" class="hidden peer" name="type" value="cat" />
          <span class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 lg:py-2 text-primary-800 dark:text-darkPrimary-50 dark:bg-darkPrimary-500 bg-primary-100 peer-checked:bg-primary-500 dark:peer-checked:bg-darkPrimary-200 peer-checked:text-white dark:hover:bg-darkPrimary-500 dark:peer-checked:text-darkPrimary-600"><i class="fa-solid fa-cat fa-fw"></i> 貓咪</span>
        </label>
        <label class="mb-6 rounded-lg lg:mb-0">
          <input v-model="selectedType" type="radio" class="hidden peer" name="type" value="dog" />
          <span class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 lg:py-2 text-primary-800 dark:text-darkPrimary-50 dark:bg-darkPrimary-500 bg-primary-100 peer-checked:bg-primary-500 dark:peer-checked:bg-darkPrimary-200 peer-checked:text-white dark:hover:bg-darkPrimary-500 dark:peer-checked:text-darkPrimary-600"><i class="fa-solid fa-dog fa-fw"></i> 狗狗</span>
        </label>
        <label class="mb-6 rounded-lg lg:mb-0">
          <input v-model="selectedType" type="radio" class="hidden peer" name="type" value="other" />
          <span class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 lg:py-2 text-primary-800 dark:text-darkPrimary-50 dark:bg-darkPrimary-500 bg-primary-100 peer-checked:bg-primary-500 dark:peer-checked:bg-darkPrimary-200 peer-checked:text-white dark:hover:bg-darkPrimary-500 dark:peer-checked:text-darkPrimary-600"><i class="fa-solid fa-question fa-fw"></i> 其他</span>
        </label>
        <label class="mb-6 rounded-lg lg:mb-0">
          <input v-model="selectedType" type="radio" class="hidden peer" name="type" value="" />
          <span class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 lg:py-2 text-primary-800 dark:text-darkPrimary-50 dark:bg-darkPrimary-500 bg-primary-100 peer-checked:bg-primary-500 dark:peer-checked:bg-darkPrimary-200 peer-checked:text-white dark:hover:bg-darkPrimary-500 dark:peer-checked:text-darkPrimary-600"><i class="fa-solid fa-question fa-fw"></i> 未選擇種類</span>
        </label>
      </div>
    </div>
    <div class="col-span-3 dark:text-darkPrimary-50 text-primary-900">
      <div class="text-4xl">{{ dashboard.stats?.total ? dashboard.stats?.total : '--' }}隻</div>
      <div>目前院內動物數量</div>
    </div>
    <div class="bg-white lg:col-span-1 col-span-3 p-2 h-[300px] border border-gray-50 rounded-lg shadow-lg dark:bg-darkPrimary-700 dark:border-darkPrimary-600">
      <ChartComponent :type="gender.type" :chartData="gender.data" :chartOptions="gender.options"></ChartComponent>
    </div>
    <div class="bg-white lg:col-span-1 col-span-3 p-2 h-[300px] border border-gray-50 rounded-lg shadow-lg dark:bg-darkPrimary-700 dark:border-darkPrimary-600">
      <ChartComponent :type="weight.type" :chartData="weight.data" :chartOptions="weight.options"></ChartComponent>
    </div>
    <div class="bg-white lg:col-span-1 col-span-3 p-2 h-[300px] border border-gray-50 rounded-lg shadow-lg dark:bg-darkPrimary-700 dark:border-darkPrimary-600">
      <ChartComponent :type="age.type" :chartData="age.data" :chartOptions="age.options"></ChartComponent>
    </div>
    <div class="bg-white lg:col-span-1 col-span-3 p-2 h-[300px] border border-gray-50 rounded-lg shadow-lg dark:bg-darkPrimary-700 dark:border-darkPrimary-600">
      <ChartComponent :type="sterilized.type" :chartData="sterilized.data" :chartOptions="sterilized.options"></ChartComponent>
    </div>
    <div class="bg-white lg:col-span-1 col-span-3 p-2 h-[300px] border border-gray-50 rounded-lg shadow-lg dark:bg-darkPrimary-700 dark:border-darkPrimary-600">
      <ChartComponent :type="breed.type" :chartData="breed.data" :chartOptions="breed.options"></ChartComponent>
    </div>
    <div class="bg-white lg:col-span-1 col-span-3 p-2 h-[300px] border border-gray-50 rounded-lg shadow-lg dark:bg-darkPrimary-700 dark:border-darkPrimary-600">
      <ChartComponent :type="bloodType.type" :chartData="bloodType.data" :chartOptions="bloodType.options"></ChartComponent>
    </div>
    <div class="bg-white lg:col-span-1 col-span-3 p-2 h-[300px] border border-gray-50 rounded-lg shadow-lg dark:bg-darkPrimary-700 dark:border-darkPrimary-600">
      <ChartComponent :type="type.type" :chartData="type.data" :chartOptions="type.options"></ChartComponent>
    </div>
    <div class="bg-white lg:col-span-1 col-span-3 p-2 h-[300px] border border-gray-50 rounded-lg shadow-lg dark:bg-darkPrimary-700 dark:border-darkPrimary-600">
      <ChartComponent :type="insulinBrand.type" :chartData="insulinBrand.data" :chartOptions="insulinBrand.options"></ChartComponent>
    </div>
    <VueLoading :active="isLoading" :height="loadingConfig.height" :width="loadingConfig.width" :loader="loadingConfig.loader" :color="loadingConfig.getColor()" :backgroundColor="loadingConfig.backgroundColor()" />
  </div>
</template>
