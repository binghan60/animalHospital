<script>
import ChartComponent from '@/components/ChartComponent.vue'
import axios from 'axios'
import { Field, Form, ErrorMessage } from 'vee-validate'
import { mapState } from 'pinia'
import authStore from '@/stores/auth'
export default {
  inject: ['loadingConfig'],
  components: { ChartComponent, VField: Field, VForm: Form, ErrorMessage },
  data() {
    return {
      animal: { Id: this.$route.params.id, Info: {}, diaryBloodSugar: [] },
      weightChart: {
        data: {
          labels: [],
          datasets: [
            {
              label: '體重',
              data: [],
              borderColor: 'rgb(147 197 253)', // blue300
              backgroundColor: 'rgb(219 234 254)', // blue100
              pointRadius: 6,
              pointHoverRadius: 10,
            },
          ],
        },
        options: {
          fill: true,
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: '體重走勢圖',
            },
            legend: {
              display: false,
              position: 'top',
            },
            datalabels: {
              display: true,
              color: '#3b82f6', // blue500
              font: {
                weight: 'bold',
                size: 14,
              },
              anchor: 'center',
              align: 'top',
              formatter: value => value.toFixed(1),
            },
          },
        },
      },
      bloodSugarCurveChart: {
        rawData: [],
        data: [],
        options: [],
      },
      averageChart: {
        title: '',
        averages: [
          {
            combinedAverage: 0,
            morningAverage: 0,
            eveningAverage: 0,
          },
        ],
        rawData: {},
        data: {
          labels: [],
          datasets: [],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'left',
              labels: {
                color: 'rgb(0, 0, 0)',
                font: {
                  size: 14,
                },
              },
            },
            datalabels: {
              display: false,
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
        },
      },
      newtoday: { date: '', year: '', month: '', day: '', lastDay: '' },
      calendarDisplay: '',
      calendar: Array.from({ length: 42 }, () => ({ loading: true })),
      modal: {
        weight: { value: '', date: new Date().toISOString().split('T')[0], toggle: false, loading: false },
        bloodSugarCurve: {
          fields: [{ time: '', value: '' }],
          date: new Date().toISOString().split('T')[0],
          toggle: false,
          loading: false,
        },
        addNotes: { toggle: false, loading: false },
        editNotes: { toggle: false, loading: false },
        tips: { toggle: false },
      },
      weekRange: '',
      weekData: [],
      insulinOption: [
        { value: '', text: '請選擇劑量' },
        { value: 0, text: '0 小格' },
        { value: 0.5, text: '0.5 小格' },
        { value: 1, text: '1 小格' },
        { value: 1.5, text: '1.5 小格' },
      ],
      years: [
        { value: 2023, label: '2023年' },
        { value: 2024, label: '2024年' },
        { value: 2025, label: '2025年' },
      ],
      months: [
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
      ],
      selectedYear: '',
      selectedMonth: '',
      newRecord: { date: '', time: '', bloodSugar: '', insulin: '', notes: '' },
      editRecord: { date: '', recordId: '', taskId: '', task: { time: '', bloodSugar: '', insulin: '', notes: '' }, notes: '' },
      showTooltip: false,
      hoverData: [],
      tooltipStyle: {
        top: '0px',
        left: '0px',
      },
      isLoading: false,
      isDelete: false,
      dataDisplay: 'all',
    }
  },
  methods: {
    async getAnimalInfo() {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_PATH}/animal/detail/${this.animal.Id}`)
        this.animal.Info = data

        this.updateWeightChart(this.isDark)
      } catch (error) {
        this.$toast.error(error.response.data.message)
      }
    },
    async getDiaryBloodSugar() {
      try {
        this.isLoading = true
        const { year, month, lastDay } = this.newtoday
        const { data } = await axios.get(`${import.meta.env.VITE_API_PATH}/bloodSugar/diary`, {
          params: {
            animalId: this.animal.Id,
            startDate: `${year}-${String(month + 1).padStart(2, '0')}-01`,
            endDate: `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`,
          },
        })
        this.animal.diaryBloodSugar = data
        this.isLoading = false
        return data
      } catch (error) {
        this.isLoading = false
        this.$toast.error(error.response.data.message)
      }
    },
    async createWeight() {
      try {
        const { date, value } = this.modal.weight
        const { Id: animalId } = this.animal
        const payload = {
          animalId,
          date,
          value,
        }
        this.isLoading = true
        this.modal.weight.loading = true
        const { data } = await axios.post(`${import.meta.env.VITE_API_PATH}/animal/createWeight`, payload, {
          headers: { 'Content-Type': 'application/json' },
        })
        this.animal.Info.weight = data.weight
        this.updateWeightChart(this.isDark)
        this.modal.weight.toggle = false
        this.modal.weight.value = ''
        this.isLoading = false
        this.modal.weight.loading = false
        this.$toast.success(data.message)
      } catch (error) {
        this.isLoading = false
        this.modal.weight.loading = false
        this.$toast.error(error.response.data.message)
      }
    },
    async createBloodSugarCurve() {
      try {
        this.isLoading = true
        this.modal.bloodSugarCurve.loading = true
        const { date, fields } = this.modal.bloodSugarCurve
        const { Id: animalId } = this.animal
        const payload = {
          animalId,
          date,
          records: fields,
        }
        await axios.post(`${import.meta.env.VITE_API_PATH}/bloodSugar/createCurve`, payload, {
          headers: { 'Content-Type': 'application/json' },
        })
        await this.updateBloodSugarCurveChart(this.isDark)
        this.modal.bloodSugarCurve.toggle = false
        this.modal.bloodSugarCurve.fields = [{ time: '', value: '' }]
        this.isLoading = false
        this.modal.bloodSugarCurve.loading = false
        this.$toast.success('新增血糖曲線成功')
      } catch (error) {
        this.isLoading = false
        this.modal.bloodSugarCurve.loading = false
        this.$toast.error(error.response.data.message)
      }
    },
    async updateBloodSugarCurveChart(isDark) {
      try {
        const { year, month, lastDay } = this.newtoday
        const { data } = await axios.get(`${import.meta.env.VITE_API_PATH}/bloodSugar/getCurve`, {
          params: {
            animalId: this.animal.Id,
            startDate: `${year}-${month + 1}-01`,
            endDate: `${year}-${month + 1}-${lastDay}`,
          },
        })
        this.bloodSugarCurveChart.rawData = data.data
        const bloodSugarCurveSetting = isDark
          ? data.data.map(x => {
              return {
                data: {
                  labels: x.records.map(y => y.time),
                  datasets: [
                    {
                      label: '血糖',
                      data: x.records.map(y => y.value),
                      borderColor: 'rgb(212 212 212)',
                      backgroundColor: 'rgb(115 115 115)',
                      pointRadius: 6,
                      pointHoverRadius: 10,
                    },
                  ],
                },
                option: {
                  fill: true,
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      font: {
                        size: 20,
                        weight: 'bold',
                      },
                      color: 'rgb(229, 229, 229)',
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
                      color: 'rgb(229 229 229)', // blue500
                      font: {
                        weight: 'bold',
                        size: 14,
                      },
                      anchor: 'center',
                      align: 'top',
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
                },
              }
            })
          : data.data.map(x => {
              return {
                data: {
                  labels: x.records.map(y => y.time),
                  datasets: [
                    {
                      label: '血糖',
                      data: x.records.map(y => y.value),
                      borderColor: 'rgb(147 197 253)', // blue300
                      backgroundColor: 'rgb(219 234 254)', // blue100
                      pointRadius: 6,
                      pointHoverRadius: 10,
                    },
                  ],
                },
                option: {
                  fill: true,
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      font: {
                        size: 20,
                        weight: 'bold',
                      },
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
                      color: '#3b82f6', // blue500
                      font: {
                        weight: 'bold',
                        size: 14,
                      },
                      anchor: 'center',
                      align: 'top',
                    },
                  },
                },
              }
            })
        this.bloodSugarCurveChart.chart = bloodSugarCurveSetting
      } catch (error) {
        this.$toast.error(error.response.data.message)
      }
    },
    async createTask() {
      try {
        this.isLoading = true
        const payload = {
          animalId: this.animal.Id,
          date: this.newRecord.date,
          records: [
            {
              time: this.newRecord.time,
              bloodSugar: this.newRecord.bloodSugar,
              insulin: this.newRecord.insulin,
              notes: this.newRecord.notes,
              author: this.user._id,
              authorRole: this.user.role,
            },
          ],
          notes: '',
        }
        const { data } = await axios.post(`${import.meta.env.VITE_API_PATH}/bloodSugar/create`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        await this.getWeekBloodSugarData()
        const range = this.getDateRange('week')
        this.updateAverageChartByRange(range.startDate, range.endDate, range.title)
        this.updateCalendar()
        this.isLoading = false
        this.closeTaskModal()
        this.$toast.success(data.message)
      } catch (error) {
        this.isLoading = false
        this.$toast.error(error.response.data.message)
      }
    },
    async editTask() {
      try {
        this.isLoading = true
        const payload = {
          animalId: this.animal.Id,
          taskId: this.editRecord.taskId,
          task: this.editRecord.task,
          notes: this.editRecord.notes,
        }
        const { data } = await axios.put(`${import.meta.env.VITE_API_PATH}/bloodSugar/update/${this.editRecord.recordId}`, payload)
        await this.getWeekBloodSugarData()
        const range = this.getDateRange('week')
        this.updateAverageChartByRange(range.startDate, range.endDate, range.title)
        this.updateCalendar()
        this.isLoading = false
        this.modal.editNotes.toggle = false
        this.$toast.success(data.message)
      } catch (error) {
        this.isLoading = false
        this.$toast.error(error.response.data.message)
      }
    },
    async deleteTask(dataId, taskId) {
      try {
        this.isDelete = true
        const payload = {
          animalId: this.animal.Id,
          taskId,
        }
        const { data } = await axios.delete(`${import.meta.env.VITE_API_PATH}/bloodSugar/task/${dataId}`, {
          data: payload,
          headers: {
            'content-Type': 'application/json',
          },
        })
        await this.getWeekBloodSugarData()
        const range = this.getDateRange('week')
        this.updateAverageChartByRange(range.startDate, range.endDate, range.title)
        this.updateCalendar()
        this.isDelete = false
        this.modal.editNotes.toggle = false
        this.$toast.success(data.message)
      } catch (error) {
        this.isDelete = false
        this.$toast.error(error.response.data.message)
      }
    },
    async getWeekBloodSugarData() {
      // 混合周資料
      try {
        this.isLoading = true
        const { data } = await axios.get(`${import.meta.env.VITE_API_PATH}/bloodSugar/diary`, {
          params: {
            animalId: this.animal.Id,
            startDate: this.weekData[0].date,
            endDate: this.weekData[6].date,
          },
        })
        this.weekData.map(day => {
          const diaryEntry = data.find(entry => new Date(entry.date).toISOString().slice(0, 10) === day.date)
          if (diaryEntry) {
            day._id = diaryEntry._id
            if (this.dataDisplay === 'all') {
              day.records = diaryEntry.records
            }
            if (this.dataDisplay === 'user') {
              day.records = diaryEntry.records.filter(x => x.author === this.user._id)
            }
            if (this.dataDisplay === 'other') {
              day.records = diaryEntry.records.filter(x => x.author != this.user._id)
            }
          }
          return day
        })
        this.isLoading = false
      } catch (error) {
        this.$toast.error(error.response.data.message)
        this.isLoading = false
      }
    },
    async getAverage(startDate, endDate) {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_PATH}/bloodSugar/average`, {
          params: {
            animalId: this.animal.Id,
            startDate,
            endDate,
          },
        })
        return data
      } catch (error) {
        this.$$toast.error(error.response.data.message)
      }
    },
    convertBirthdayToAge(dateString = new Date()) {
      const today = new Date()
      const birth = new Date(dateString)
      let years = today.getFullYear() - birth.getFullYear()
      let months = today.getMonth() - birth.getMonth()
      if (months < 0) {
        years--
        months += 12
      }
      return { years, months }
    },
    showTips(event, record) {
      const screenWidth = window.innerWidth
      this.hoverData = record
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
        this.tooltipStyle = {
          top: `${top}px`,
          left: `${left}px`,
        }
        this.showTooltip = true
      } else {
        this.modal.tips.toggle = true
      }
    },
    bloodSugarColor(value) {
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
    },
    openTaskModal(date) {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const formattedTime = `${hours}:${minutes}`
      this.newRecord = { date: '', time: formattedTime, bloodSugar: '', insulin: '', notes: '' }
      this.newRecord.date = date
      this.modal.addNotes.toggle = true
    },
    closeTaskModal() {
      this.modal.addNotes.toggle = false
    },
    openEditTaskModal(date, recordId, taskId, time, bloodSugar, insulin, recordNotes, notes) {
      this.editRecord = {
        date,
        recordId,
        taskId,
        task: {
          time,
          bloodSugar,
          insulin,
          notes: recordNotes,
          author: this.user._id,
          authorRole: this.user.role,
        },
        notes,
      }
      this.modal.editNotes.toggle = true
    },
    getDateRange(type) {
      const { year, month, lastDay } = this.newtoday
      if (type === 'month') {
        return {
          startDate: `${year}-${month + 1}-01`,
          endDate: `${year}-${month + 1}-${lastDay}`,
          title: `${month + 1} 月平均血糖`,
        }
      } else if (type === 'week') {
        const startDate = this.weekData[0]?.date || ''
        const endDate = this.weekData[this.weekData.length - 1]?.date || ''
        const title = `${startDate.split('-')[1]}-${startDate.split('-')[2]} ~ ${endDate.split('-')[1]}-${endDate.split('-')[2]} 平均血糖`
        return { startDate, endDate, title }
      }
      return {}
    },
    async updateAverageChartByRange(startDate, endDate, title) {
      this.averageChart.title = title
      const data = await this.getAverage(startDate, endDate)
      this.averageChart.rawData = data
      this.updateAverageChart(this.isDark)
    },
    updateAverageChart(isDark) {
      this.averageChart.averages = this.averageChart.rawData.averages
      if (isDark) {
        this.averageChart.data = {
          labels: ['1~249', '250~399', '400up'],
          datasets: [
            {
              data: [this.averageChart.rawData.morningCounts.count_1_249 + this.averageChart.rawData.eveningCounts.count_1_249, this.averageChart.rawData.morningCounts.count_250_399 + this.averageChart.rawData.eveningCounts.count_250_399, this.averageChart.rawData.morningCounts.count_400_plus + this.averageChart.rawData.eveningCounts.count_400_plus],
              backgroundColor: ['rgb(163 ,230 ,53 , 0.25)', 'rgb(251 ,191, 36, 0.25)', 'rgb(251, 113, 133, 0.25)'],
              borderColor: ['rgb(163 ,230 ,53 , 0.25)', 'rgb(251 ,191, 36, 0.25)', 'rgb(251, 113, 133, 0.25)'],
            },
          ],
        }
        this.averageChart.options = {
          responsive: true,
          plugins: {
            legend: {
              position: 'left',
              labels: {
                color: 'rgb(212, 212, 212)',
                font: {
                  size: 14,
                },
              },
            },
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
      } else {
        this.averageChart.data = {
          labels: ['1~249', '250~399', '400up'],
          datasets: [
            {
              data: [this.averageChart.rawData.morningCounts.count_1_249 + this.averageChart.rawData.eveningCounts.count_1_249, this.averageChart.rawData.morningCounts.count_250_399 + this.averageChart.rawData.eveningCounts.count_250_399, this.averageChart.rawData.morningCounts.count_400_plus + this.averageChart.rawData.eveningCounts.count_400_plus],
              backgroundColor: ['rgba(220 ,252, 231)', 'rgba(254 ,243, 199)', 'rgba(254 ,226 ,226)'],
              borderColor: ['rgba(220, 252 ,231)', 'rgba(254 ,243, 199)', 'rgba(254, 226, 226)'],
            },
          ],
        }
        this.averageChart.options = {
          responsive: true,
          plugins: {
            legend: {
              position: 'left',
              labels: {
                color: 'rgb(0, 0, 0)',
                font: {
                  size: 14,
                },
              },
            },
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
      }
    },
    getIconClass(type) {
      if (type === 'dog') {
        return 'fa-solid fa-dog fa-fw'
      } else if (type === 'cat') {
        return 'fa-solid fa-cat fa-fw'
      } else {
        return 'fa-solid fa-question'
      }
    },
    getGenderIcon(gender) {
      if (gender === 'male') {
        return 'text-primary-600 fa-solid fa-mars fa-fw'
      } else if (gender === 'female') {
        return 'text-pink-600 fa-solid fa-venus fa-fw'
      }
    }, // 日期處理區
    async updateCalendar() {
      const { year, month, lastDay } = this.newtoday
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
      const diaryData = await this.getDiaryBloodSugar()
      const mergedData = container.map(day => {
        const diaryEntry = diaryData.find(diary => diary.date === day.date)
        if (diaryEntry) {
          return Object.assign(day, diaryEntry)
        }
        return day
      })
      const firstDay = new Date(year, month, 1).getDay()
      const spaceDay = (firstDay + 6) % 7
      const totalCells = 42 - (42 - mergedData.length - spaceDay >= 7 ? 7 : 0) // 空白超過7天總長-7
      const allDays = [...Array.from({ length: spaceDay }, () => ({ date: null })), ...mergedData, ...Array.from({ length: totalCells - spaceDay - mergedData.length }, () => ({ date: null }))]
      this.calendar = allDays
    },
    updateWeekData() {
      //取得起、始日
      const startOfWeek = this.getStartOfWeek(this.newtoday.date)
      startOfWeek.setHours(8, 0, 0, 0)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setHours(8, 0, 0, 0)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      this.weekRange = `${startOfWeek.toISOString().split('T')[0]} ~ ${endOfWeek.toISOString().split('T')[0]}`
      this.weekData = this.getWeekData(startOfWeek)
    },
    getStartOfWeek(date) {
      // 取得每周第一天
      const startOfWeek = new Date(date)
      const day = startOfWeek.getDay()
      const diff = startOfWeek.getDate() - (day === 0 ? 6 : day - 1)
      startOfWeek.setDate(diff)
      startOfWeek.setHours(0, 0, 0, 0)
      return startOfWeek
    },
    getWeekData(startOfWeek) {
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
    },
    prevWeek() {
      this.newtoday.date.setDate(this.newtoday.date.getDate() - 7)
      this.newtoday.date = new Date(this.newtoday.date)
      this.updateWeekData()
    },
    nextWeek() {
      this.newtoday.date.setDate(this.newtoday.date.getDate() + 7)
      this.newtoday.date = new Date(this.newtoday.date)
      this.updateWeekData()
    },
    prevMonth() {
      this.newtoday.date.setDate(this.newtoday.date.getDate() - this.newtoday.lastDay)
      this.newtoday.date = new Date(this.newtoday.date)
      this.updateWeekData()
    },
    nextMonth() {
      this.newtoday.date.setDate(this.newtoday.date.getDate() + this.newtoday.lastDay)
      this.newtoday.date = new Date(this.newtoday.date)
      this.updateWeekData()
    },
    goToFirstWeekOfSelectedMonth() {
      this.newtoday.date = new Date(this.selectedYear, this.selectedMonth, 1)
      this.updateWeekData()
    },
    updateWeightChart(isDark) {
      if (isDark) {
        this.weightChart.data = {
          labels: this.animal.Info.weight.map(x => new Date(x.date).toISOString().slice(0, 10)),
          datasets: [
            {
              label: '體重',
              data: this.animal.Info.weight.map(x => x.value),
              borderColor: 'rgb(212 212 212)',
              backgroundColor: 'rgb(115 115 115)',
              pointRadius: 6,
              pointHoverRadius: 10,
            },
          ],
        }
        this.weightChart.options = {
          fill: true,
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: '體重走勢圖',
              color: 'rgb(212 212 212)',
              font: {
                size: 16,
                weight: 'bold',
              },
            },
            legend: {
              display: false,
              position: 'top',
            },
            datalabels: {
              display: true,
              color: 'rgb(229 229 229)', // blue500
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
      } else {
        this.weightChart.data = {
          labels: this.animal.Info.weight.map(x => new Date(x.date).toISOString().slice(0, 10)),
          datasets: [
            {
              label: '體重',
              data: this.animal.Info.weight.map(x => x.value),
              borderColor: 'rgb(147 197 253)', // blue300
              backgroundColor: 'rgb(219 234 254)', // blue100
              pointRadius: 6,
              pointHoverRadius: 10,
            },
          ],
        }
        this.weightChart.options = {
          fill: true,
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: '體重走勢圖',
              font: {
                size: 16,
                weight: 'bold',
              },
            },
            legend: {
              display: false,
              position: 'top',
            },
            datalabels: {
              display: true,
              color: '#3b82f6',
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
                color: 'rgb(0,0,0,0.8)',
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.1)',
              },
            },
            y: {
              ticks: {
                color: 'rgb(0,0,0,0.8)',
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.1)',
              },
            },
          },
        }
      }
    },
  },
  watch: {
    'newtoday.date': {
      handler() {
        const date = this.newtoday.date
        this.newtoday.year = date.getFullYear()
        this.newtoday.month = date.getMonth()
        this.newtoday.day = date.getDate()
        this.newtoday.lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
      },
    },
    'newtoday.month': {
      handler() {
        this.updateCalendar()
        this.updateBloodSugarCurveChart(this.isDark)
        if (this.calendarDisplay == 'month') {
          const range = this.getDateRange('month')
          this.updateAverageChartByRange(range.startDate, range.endDate, range.title)
        }
      },
    },
    isDark(dark) {
      this.updateWeightChart(dark)
      this.updateBloodSugarCurveChart(dark)
      this.updateAverageChart(dark)
    },
    weekData: {
      handler() {
        this.getWeekBloodSugarData()
        if (this.calendarDisplay == 'week') {
          const range = this.getDateRange('week')
          this.updateAverageChartByRange(range.startDate, range.endDate, range.title)
        }
      },
    },
    calendarDisplay(newValue) {
      const range = this.getDateRange(newValue)
      if (range.startDate && range.endDate) {
        this.updateAverageChartByRange(range.startDate, range.endDate, range.title)
      }
    },
    dataDisplay(newValue) {
      this.weekData = this.weekData.map(day => {
        let filteredRecords
        if (newValue === 'all') {
          filteredRecords = day.records
        } else if (newValue === 'user') {
          filteredRecords = day.records.filter(x => x.author === this.user._id)
        } else if (newValue === 'other') {
          filteredRecords = day.records.filter(x => x.author !== this.user._id)
        }
        return {
          ...day,
          records: filteredRecords,
        }
      })
    },
  },
  computed: {
    ...mapState(authStore, ['user', 'isDark']),
    weightValue() {
      const weight = this.animal.Info.weight
      if (weight && weight.length > 0) {
        const lastWeight = weight[weight.length - 1].value
        return lastWeight !== 0 ? lastWeight + ' 公斤' : ''
      }
      return ''
    },
  },
  async mounted() {
    this.newtoday.date = new Date()
    await this.getAnimalInfo()
    this.updateWeekData()
    this.selectedMonth = this.newtoday.date.getMonth()
    this.selectedYear = this.newtoday.date.getFullYear()
    this.calendarDisplay = 'week'
  },
}
</script>
<template>
  <div>
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div class="bg-white rounded-lg shadow-lg dark:bg-darkPrimary-700 min-h-[300px] lg:max-h-[400px] max-h-[480px]">
        <img class="object-cover w-full h-full p-4 lg:p-6" :src="animal.Info.avatar ? animal.Info.avatar : '/image/sampleAvatar.png'" alt="" />
      </div>
      <div class="rounded-lg shadow-md bg-white p-4 lg:p-6 h-full min-h-[300px] lg:max-h-[400px] max-h-[480px] dark:bg-darkPrimary-700">
        <div class="w-full h-full">
          <h5 class="mb-3 text-lg font-semibold text-primary-900 dark:text-darkPrimary-50">基本資料</h5>
          <ul class="grid grid-cols-3 list-none gap-x-4 gap-y-3">
            <li class="text-sm font-medium text-primary-900 dark:text-darkPrimary-50">姓名：</li>
            <li class="col-span-2 text-sm text-gray-800 dark:text-darkPrimary-50">{{ animal.Info.name }}</li>
            <li class="text-sm font-medium text-primary-900 dark:text-darkPrimary-50">種類：</li>
            <li class="col-span-2 text-sm text-gray-800 dark:text-darkPrimary-50">
              <i :class="getIconClass(animal.Info.type)"></i>
            </li>
            <li class="text-sm font-medium text-primary-900 dark:text-darkPrimary-50">生日：</li>
            <li v-if="animal.Info.birthday !== null && animal.Info.birthday !== '1970-01-01T00:00:00.000Z'" class="col-span-2 text-sm text-gray-800 dark:text-darkPrimary-50">{{ animal.Info.birthday ? new Date(animal.Info.birthday).toISOString().slice(0, 10) : '' }} ({{ convertBirthdayToAge(animal.Info.birthday).years }}歲 {{ convertBirthdayToAge(animal.Info.birthday).months > 0 ? convertBirthdayToAge(animal.Info.birthday).months + '個月' : '' }})</li>

            <li v-else class="col-span-2 text-sm text-gray-800 dark:text-darkPrimary-50"></li>

            <li class="text-sm font-medium text-primary-900 dark:text-darkPrimary-50">性別：</li>
            <li class="col-span-2 text-sm text-gray-800 dark:text-darkPrimary-50">
              <i :class="getGenderIcon(animal.Info.gender)"></i>
            </li>
            <li class="text-sm font-medium text-primary-900 dark:text-darkPrimary-50">血型：</li>
            <li class="col-span-2 text-sm text-gray-800 dark:text-darkPrimary-50">{{ animal.Info.bloodType ? animal.Info.bloodType + ' 型' : '' }}</li>
            <li class="text-sm font-medium text-primary-900 dark:text-darkPrimary-50">體重：</li>
            <li class="col-span-2 text-sm text-gray-800 dark:text-darkPrimary-50">{{ weightValue }}</li>
            <li class="text-sm font-medium text-primary-900 dark:text-darkPrimary-50">品種：</li>
            <li class="col-span-2 text-sm text-gray-800 dark:text-darkPrimary-50">{{ animal.Info.breed }}</li>
            <li class="text-sm font-medium text-primary-900 dark:text-darkPrimary-50">結紮：</li>
            <li class="col-span-2 text-sm text-gray-800 dark:text-darkPrimary-50">
              <i v-show="animal.Info.sterilized" class="text-green-500 fa-solid fa-check fa-fw"></i>
              <i v-show="!animal.Info.sterilized" class="text-red-600 fa-solid fa-x fa-fw"></i>
            </li>
            <li class="text-sm font-medium text-primary-900 dark:text-darkPrimary-50">胰島素：</li>
            <li class="col-span-2 text-sm text-gray-800 dark:text-darkPrimary-50">{{ animal.Info.insulinBrand }}</li>
          </ul>
        </div>
      </div>
      <div class="rounded-lg shadow-md bg-white p-4 lg:p-6 h-full min-h-[300px] lg:max-h-[400px] max-h-[480px] dark:bg-darkPrimary-700">
        <ChartComponent type="line" :chartData="weightChart.data" :chartOptions="weightChart.options"></ChartComponent>
      </div>
      <div class="rounded-lg shadow-md bg-white p-4 lg:p-6 h-full min-h-[300px] lg:max-h-[400px] max-h-[480px] dark:bg-darkPrimary-700">
        <ChartComponent type="pie" :chartData="averageChart.data" :chartOptions="averageChart.options"></ChartComponent>
        <div class="grid grid-cols-2 col-span-6 text-center">
          <h2 class="col-span-2 text-primary-900 dark:text-darkPrimary-50">{{ averageChart.title }}</h2>
          <div :class="['col-span-2 p-2 h-[40px] text-lg font-semibold text-primary-600 dark:text-darkPrimary-50', bloodSugarColor(Math.ceil(averageChart.averages[0].combinedAverage))]">{{ Math.ceil(averageChart.averages[0].combinedAverage) }}</div>
          <div :class="['col-span-1 p-2 h-[40px] text-lg font-semibold text-primary-600 dark:text-darkPrimary-50', bloodSugarColor(Math.ceil(averageChart.averages[0].morningAverage))]"><i class="fa-regular fa-sun"></i> {{ Math.ceil(averageChart.averages[0].morningAverage) }}</div>
          <div :class="['col-span-1 p-2 h-[40px] text-lg font-semibold text-primary-600 dark:text-darkPrimary-50', bloodSugarColor(Math.ceil(averageChart.averages[0].eveningAverage))]"><i class="fa-regular fa-moon"></i> {{ Math.ceil(averageChart.averages[0].eveningAverage) }}</div>
        </div>
      </div>
    </div>
    <!-- 日曆 -->
    <div class="rounded-lg shadow-lg bg-white dark:bg-darkPrimary-700 mt-4 p-2 lg:p-4 lg:min-h-[1000px] min-h-[800px]">
      <!-- 切換按鈕 -->
      <div class="grid items-center justify-around grid-cols-5 lg:grid-cols-4">
        <div class="w-full flex items-center justify-center h-[50px] space-x-4 col-span-2 lg:col-span-1">
          <label for="calendarDisplay-day">
            <input id="calendarDisplay-day" v-model="calendarDisplay" type="radio" name="calendar" value="month" class="hidden peer" />
            <span class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 text-primary-800 dark:text-indigo-800 dark:bg-indigo-100 bg-primary-100 dark:peer-checked:bg-indigo-500 peer-checked:bg-primary-500 hover:bg-primary-200 dark:hover:bg-indigo-200 dark:peer-checked:text-darkPrimary-50 peer-checked:text-white"> <i class="fa-solid fa-calendar-days fa-fw"></i> </span>
          </label>
          <label for="calendarDisplay-month">
            <input id="calendarDisplay-month" v-model="calendarDisplay" type="radio" name="calendar" value="week" class="hidden peer" />
            <span class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 text-primary-800 dark:text-indigo-800 dark:bg-indigo-100 bg-primary-100 dark:peer-checked:bg-indigo-500 peer-checked:bg-primary-500 hover:bg-primary-200 dark:hover:bg-indigo-200 dark:peer-checked:text-darkPrimary-50 peer-checked:text-white"> <i class="fa-regular fa-calendar fa-fw"></i> </span>
          </label>
        </div>
        <div class="w-full col-span-3 space-x-2 text-center lg:col-span-1 lg:space-x-6">
          <select v-model="selectedYear" class="h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" @change="goToFirstWeekOfSelectedMonth">
            <option v-for="year in years" :key="year.value" :value="year.value">
              {{ year.label }}
            </option>
          </select>
          <select v-model="selectedMonth" class="h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" @change="goToFirstWeekOfSelectedMonth">
            <option v-for="month in months" :key="month.value" :value="month.value">
              {{ month.label }}
            </option>
          </select>
        </div>
        <div class="w-full flex items-center justify-center h-[50px] space-x-4 col-span-5 lg:col-span-1">
          <label for="dataDisplay-all">
            <input id="dataDisplay-all" v-model="dataDisplay" type="radio" name="dataDisplay" value="all" class="hidden peer" :disabled="calendarDisplay === 'month'" />
            <span :class="{ 'cursor-not-allowed opacity-50 bg-gray-300 text-gray-500': calendarDisplay === 'month' }" class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 text-primary-800 dark:text-indigo-800 dark:bg-indigo-100 bg-primary-100 dark:peer-checked:bg-indigo-500 peer-checked:bg-primary-500 hover:bg-primary-200 dark:hover:bg-indigo-200 dark:peer-checked:text-darkPrimary-50 peer-checked:text-white">
              <i class="fa-solid fa-users fa-fw"></i>
            </span>
          </label>
          <label for="dataDisplay-user">
            <input id="dataDisplay-user" v-model="dataDisplay" type="radio" name="dataDisplay" value="user" class="hidden peer" :disabled="calendarDisplay === 'month'" />
            <span :class="{ 'cursor-not-allowed opacity-50 bg-gray-300 text-gray-500': calendarDisplay === 'month' }" class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 text-primary-800 dark:text-indigo-800 dark:bg-indigo-100 bg-primary-100 dark:peer-checked:bg-indigo-500 peer-checked:bg-primary-500 hover:bg-primary-200 dark:hover:bg-indigo-200 dark:peer-checked:text-darkPrimary-50 peer-checked:text-white">
              <i class="fa-solid fa-user fa-fw"></i>
            </span>
          </label>
          <label for="dataDisplay-other">
            <input id="dataDisplay-other" v-model="dataDisplay" type="radio" name="dataDisplay" value="other" class="hidden peer" :disabled="calendarDisplay === 'month'" />
            <span :class="{ 'cursor-not-allowed opacity-50 bg-gray-300 text-gray-500': calendarDisplay === 'month' }" class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 text-primary-800 dark:text-indigo-800 dark:bg-indigo-100 bg-primary-100 dark:peer-checked:bg-indigo-500 peer-checked:bg-primary-500 hover:bg-primary-200 dark:hover:bg-indigo-200 dark:peer-checked:text-darkPrimary-50 peer-checked:text-white">
              <i class="fa-solid fa-user-slash fa-fw"></i>
            </span>
          </label>
        </div>
        <div v-show="calendarDisplay === 'week'" class="col-span-5 lg:col-span-1 w-full flex items-center justify-center h-[50px] space-x-6">
          <button type="button" class="px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600 dark:bg-indigo-600 dark:hover:bg-indigo-700" @click="prevWeek"><i class="fa-solid fa-circle-left fa-fw"></i> 上週</button>
          <button type="button" class="px-4 py-2 text-white rounded-md bg-primary-500 dark:bg-indigo-600 dark:hover:bg-indigo-700 hover:bg-primary-600" @click="nextWeek">下週 <i class="fa-solid fa-circle-right fa-fw"></i></button>
        </div>
        <div v-show="calendarDisplay === 'month'" class="col-span-5 lg:col-span-1 w-full flex items-center justify-center h-[50px] space-x-6">
          <button type="button" class="px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600 dark:bg-indigo-600 dark:hover:bg-indigo-700" @click="prevMonth"><i class="fa-solid fa-circle-left fa-fw"></i> 前月</button>
          <button type="button" class="px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600 dark:bg-indigo-600 dark:hover:bg-indigo-700" @click="nextMonth">下月 <i class="fa-solid fa-circle-right fa-fw"></i></button>
        </div>
      </div>
      <!-- 日曆格子 -->
      <div v-show="calendarDisplay == 'month'" class="grid grid-cols-2 col-span-7 gap-1 lg:grid-cols-7">
        <div class="col-span-2 py-3 text-2xl font-bold text-center select-none text-primary-900 dark:text-darkPrimary-50 lg:col-span-7">
          <span class="px-4">{{ newtoday.year }} 年 {{ newtoday.month + 1 }} 月 血糖總覽</span>
        </div>
        <div class="hidden grid-cols-7 col-span-7 gap-1 text-2xl font-semibold text-center text-primary-900 lg:grid dark:text-darkPrimary-50">
          <div>一</div>
          <div>二</div>
          <div>三</div>
          <div>四</div>
          <div>五</div>
          <div>六</div>
          <div>日</div>
        </div>
        <template v-for="(day, index) in calendar">
          <div v-if="day.day" :key="day.isoDate" :class="['p-2 m-1 rounded-lg select-none dark:bg-darkPrimary-600 dark:text-darkPrimary-50 bg-primary-200 text-primary-900', { 'bg-primary-400 dark:bg-stone-600': day.isToday, 'cursor-pointer': day.records?.length }]" @click="day.records?.length ? showTips($event, day?.records) : null">
            <div class="font-bold text-center">{{ day.month }} / {{ day.day }} {{ day.records?.length > 2 ? '**' : '' }}</div>
            <!-- 早上 -->
            <div class="p-2 mb-2 rounded-md bg-primary-100 hover:bg-primary-300 dark:bg-darkPrimary-500 dark:hover:bg-darkPrimary-400">
              <div class="text-center text-primary-900 dark:text-darkPrimary-50"><i class="fa-regular fa-sun fa-fw"></i> {{ calendar[index].morning.time }}</div>
              <div :class="['w-full p-1 mt-1 text-sm border border-gray-300 rounded select-none', bloodSugarColor(calendar[index].morning.bloodSugar)]">
                <i class="fa-solid fa-droplet fa-fw"></i> : <span class="">{{ calendar[index].morning.bloodSugar ? calendar[index].morning.bloodSugar : '---' }}</span>
              </div>
              <div class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none dark:bg-darkPrimary-600"><i class="fa-solid fa-syringe fa-fw"></i> : {{ calendar[index].morning.insulin || calendar[index].morning.insulin === 0 ? calendar[index].morning.insulin + ' 小格' : '---' }}</div>
            </div>
            <!-- 晚上 -->
            <div class="p-2 rounded-md bg-primary-100 hover:bg-primary-300 dark:bg-darkPrimary-500 dark:hover:bg-darkPrimary-400">
              <div class="text-center text-primary-900 dark:text-darkPrimary-50"><i class="fa-regular fa-moon fa-fw"></i> {{ calendar[index].evening.time }}</div>
              <div :class="['w-full p-1 mt-1 text-sm border border-gray-300 rounded select-none', bloodSugarColor(calendar[index].evening.bloodSugar)]">
                <i class="fa-solid fa-droplet fa-fw"></i> : <span>{{ calendar[index].evening.bloodSugar ? calendar[index].evening.bloodSugar : '---' }}</span>
              </div>
              <div class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none dark:bg-darkPrimary-600"><i class="fa-solid fa-syringe fa-fw"></i> : {{ calendar[index].evening.insulin || calendar[index].evening.insulin === 0 ? calendar[index].evening.insulin + ' 小格' : '---' }}</div>
            </div>
          </div>
          <div v-else :key="index" :class="['p-2 m-1 rounded-md h-[264px] hidden lg:grid', { lazyLoading: day.loading }]"></div>
        </template>
        <div v-show="showTooltip" class="absolute p-3 bg-white border rounded-lg shadow-lg dark:bg-darkPrimary-700 border-primary-400 dark:border-darkPrimary-400" :style="tooltipStyle">
          <button class="absolute top-2 right-2 group flex h-6 w-6 select-none items-center justify-center rounded-lg bg-white leading-8 text-zinc-950 shadow-[0_-1px_0_0px_#d4d4d8_inset,0_0_0_1px_#f4f4f5_inset,0_0.5px_0_1.5px_#fff_inset] hover:bg-zinc-50 hover:via-zinc-900 hover:to-zinc-800 active:shadow-[-1px_0px_1px_0px_#e4e4e7_inset,1px_0px_1px_0px_#e4e4e7_inset,0px_0.125rem_1px_0px_#d4d4d8_inset]" aria-label="Change language" @click="showTooltip = false">
            <span class="flex items-center group-active:[transform:translate3d(0,1px,0)]"><i class="fa-solid fa-x fa-fw"></i></span>
          </button>
          <div>
            <table class="min-w-full text-sm text-left">
              <thead class="font-semibold border-b bg-primary-100 border-primary-400 dark:border-darkPrimary-100 dark:bg-darkPrimary-600 text-primary-600 dark:text-darkPrimary-50">
                <tr>
                  <th class="px-4 py-2">時間</th>
                  <th class="px-4 py-2">血糖值</th>
                  <th class="px-4 py-2">胰島素</th>
                  <th class="px-4 py-2">備註</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="data in hoverData" :key="data.id" class="border-b border-primary-100 dark:border-darkPrimary-400 dark:bg-darkPrimary-500 dark:text-darkPrimary-50 text-primary-900">
                  <td class="px-4 py-2">{{ data?.time }}</td>
                  <td class="px-4 py-2">{{ data?.bloodSugar || '無' }}</td>
                  <td class="px-4 py-2">{{ data?.insulin || '無' }}</td>
                  <td class="px-4 py-2">{{ data?.notes || '無' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-show="calendarDisplay == 'week'">
        <div class="col-span-2 py-3 text-2xl font-bold text-center select-none text-primary-900 lg:col-span-7 dark:text-darkPrimary-50">{{ weekRange }}</div>
        <div class="overflow-x-auto">
          <div class="flex gap-2 lg:grid lg:grid-cols-7">
            <div v-for="day in weekData" :key="day.date" :class="['p-4 border rounded-lg shadow-sm overflow-hidden h-[900px]', day.isToday ? 'border-primary-500 dark:border-indigo-500 border-2 bg-primary-50 dark:bg-darkPrimary-600' : 'bg-white dark:bg-darkPrimary-600']" class="shrink-0 w-[150px] lg:w-auto">
              <!-- 日期與星期 -->
              <div class="mb-2 text-sm font-semibold text-center text-gray-700 dark:text-darkPrimary-50">{{ day.date }} ({{ day.day }})</div>
              <!-- 新增事項按鈕 -->
              <button type="button" class="w-full px-2 py-1.5 mb-2 text-sm text-white rounded-md bg-primary-600 hover:bg-primary-700 dark:bg-indigo-600 hover:dark:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-primary-300" @click="openTaskModal(day.date)">+ 新增事項</button>
              <!-- 事項清單 -->
              <ul class="h-[800px] space-y-2 overflow-hidden overflow-y-auto scrollbar">
                <li v-for="(task, index) in day.records" :key="index" :class="['p-3 text-sm  border rounded-lg', task.author === this.user._id ? 'bg-gray-100 cursor-pointer hover:bg-primary-100 dark:bg-darkPrimary-600' : 'bg-amber-50 dark:bg-darkPrimary-500 select-none cursor-not-allowed']" @click="task.author === this.user._id ? openEditTaskModal(day.date, day._id, task._id, task.time, task.bloodSugar, task.insulin, task.notes, day.notes) : null">
                  <div class="flex justify-between mb-1 text-gray-800 dark:text-darkPrimary-50">
                    <div>🕒{{ task.time }}</div>
                    <i v-if="task.author === this.user._id" class="fa-solid fa-pen-to-square"></i>
                  </div>
                  <div v-show="task.bloodSugar" class="text-gray-600 dark:text-darkPrimary-50"><i class="fa-solid fa-droplet fa-fw"></i> : {{ task.bloodSugar }}</div>
                  <div v-show="task.insulin" class="text-gray-600 dark:text-darkPrimary-50"><i class="fa-solid fa-syringe fa-fw"></i> : {{ task.insulin }}</div>
                  <div v-show="task.notes" class="text-gray-600 dark:text-darkPrimary-50"><i class="fa-regular fa-comment-dots fa-fw"></i> : {{ task.notes }}</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <!-- 新增事項 -->
      <div v-show="modal.addNotes.toggle" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" @mousedown="closeTaskModal">
        <div class="p-6 bg-white rounded-md shadow-lg w-96 dark:bg-darkPrimary-700" @mousedown.stop>
          <VForm @submit="createTask">
            <h3 class="mb-4 text-lg font-semibold dark:text-darkPrimary-50">新增事項 {{ newRecord.date }}</h3>
            <div class="mb-4">
              <label class="block mb-1 text-sm font-medium dark:text-darkPrimary-50">時間</label>
              <VField v-model="newRecord.time" rules="required" name="time" type="time" class="w-full h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" />
              <ErrorMessage name="time" class="mt-1 text-sm text-red-500 dark:text-rose-400" />
            </div>
            <div class="mb-4">
              <label class="block mb-1 text-sm font-medium dark:text-darkPrimary-50">血糖</label>
              <VField v-model="newRecord.bloodSugar" name="bloodSugar" rules="atLeastOneFieldRule:@insulin,@notes" type="text" placeholder="輸入血糖(選填)" class="w-full h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
              <ErrorMessage name="bloodSugar" class="mt-1 text-sm text-red-500 dark:text-rose-400" />
            </div>
            <div class="mb-4">
              <label class="block mb-1 text-sm font-medium dark:text-darkPrimary-50">胰島素</label>
              <VField v-model="newRecord.insulin" name="insulin" rules="atLeastOneFieldRule:@bloodSugar,@notes" type="text" placeholder="輸入胰島素(選填)" class="w-full h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
              <ErrorMessage name="insulin" class="mt-1 text-sm text-red-500 dark:text-rose-400" />
            </div>
            <div class="mb-4">
              <label class="block mb-1 text-sm font-medium dark:text-darkPrimary-50">備註</label>
              <VField v-model="newRecord.notes" name="notes" rules="atLeastOneFieldRule:@bloodSugar,@insulin" type="text" placeholder="輸入備註(選填)" class="w-full h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
              <ErrorMessage name="notes" class="mt-1 text-sm text-red-500 dark:text-rose-400" />
            </div>
            <div class="flex justify-between gap-4">
              <button type="button" class="w-[140px] px-6 py-2 text-gray-700 transition-all bg-gray-300 rounded-lg shadow-md dark:bg-darkPrimary-50 hover:dark:bg-darkPrimary-400 hover:bg-gray-400" @click="closeTaskModal">取消</button>
              <button v-if="isLoading" class="w-[140px] inline-flex items-center justify-center px-6 py-2 rounded-md bg-primary-600 dark:bg-indigo-600 text-darkPrimary-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-auto" disabled="">
                <div class="w-4 h-4 border-2 border-white border-solid rounded-full animate-spin border-t-transparent"></div>
                <span class="ml-2">新增中... </span>
              </button>
              <button v-else type="submit" class="w-[140px] px-6 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700 dark:bg-indigo-600 dark:hover:bg-indigo-700">新增</button>
            </div>
          </VForm>
        </div>
      </div>
      <div v-show="modal.editNotes.toggle" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" @mousedown="modal.editNotes.toggle = false">
        <div class="p-6 bg-white rounded-md shadow-lg w-96 dark:bg-darkPrimary-700" @mousedown.stop>
          <VForm @submit="editTask">
            <div class="flex items-center justify-between mb-4">
              <h3 class="mb-4 text-lg font-semibold dark:text-darkPrimary-50">編輯事項 {{ editRecord.date }}</h3>
              <button type="button" class="h-10 max-h-[60px] w-10 max-w-[60px] select-none rounded-lg transition-all dark:hover:bg-darkPrimary-600 hover:bg-gray-900/10" @click="deleteTask(editRecord.recordId, editRecord.taskId)">
                <i class="text-xl text-red-600 dark:text-rose-400 fa-solid fa-trash fa-fw"></i>
              </button>
            </div>
            <div class="mb-4">
              <label class="block mb-1 text-sm font-medium dark:text-darkPrimary-50">時間</label>
              <VField v-model="editRecord.task.time" rules="required" name="time" type="time" class="w-full h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" />
              <ErrorMessage name="time" class="mt-1 text-sm text-red-500 dark:text-rose-400" />
            </div>
            <div class="mb-4">
              <label class="block mb-1 text-sm font-medium dark:text-darkPrimary-50">血糖</label>
              <VField v-model="editRecord.task.bloodSugar" name="bloodSugar" rules="atLeastOneFieldRule:@insulin,@notes" type="text" placeholder="輸入血糖(選填)" class="w-full h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
              <ErrorMessage name="bloodSugar" class="mt-1 text-sm text-red-500 dark:text-rose-400" />
            </div>
            <div class="mb-4">
              <label class="block mb-1 text-sm font-medium dark:text-darkPrimary-50">胰島素</label>
              <VField v-model="editRecord.task.insulin" name="insulin" rules="atLeastOneFieldRule:@bloodSugar,@notes" type="text" placeholder="輸入胰島素(選填)" class="w-full h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
              <ErrorMessage name="insulin" class="mt-1 text-sm text-red-500 dark:text-rose-400" />
            </div>
            <div class="mb-4">
              <label class="block mb-1 text-sm font-medium dark:text-darkPrimary-50">備註</label>
              <VField v-model="editRecord.task.notes" name="notes" rules="atLeastOneFieldRule:@bloodSugar,@insulin" type="text" placeholder="輸入備註(選填)" class="w-full h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
              <ErrorMessage name="notes" class="mt-1 text-sm text-red-500 dark:text-rose-400" />
            </div>
            <div class="flex justify-between gap-4">
              <button type="button" class="w-[140px] px-6 py-2 text-gray-700 transition-all bg-gray-300 rounded-lg shadow-md dark:bg-darkPrimary-50 hover:dark:bg-darkPrimary-400 hover:bg-gray-400" @click="modal.editNotes.toggle = false">取消</button>
              <button v-if="isLoading" class="w-[140px] inline-flex items-center justify-center px-6 py-2 rounded-md bg-primary-600 dark:bg-indigo-600 text-darkPrimary-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-auto" disabled="">
                <div class="w-4 h-4 border-2 border-white border-solid rounded-full animate-spin border-t-transparent"></div>
                <span class="ml-2">修改中... </span>
              </button>
              <button v-else type="submit" class="w-[140px] px-6 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700 dark:bg-indigo-600 dark:hover:bg-indigo-700">修改</button>
            </div>
          </VForm>
        </div>
      </div>
    </div>
    <div v-for="chart in bloodSugarCurveChart.chart" :key="chart.date" class="rounded-lg overflow-hidden shadow-lg bg-white mt-6 p-4 h-[350px] w-full dark:bg-darkPrimary-700">
      <ChartComponent type="line" :chartData="chart.data" :chartOptions="chart.option"></ChartComponent>
    </div>
    <!-- 體重視窗 -->
    <div v-show="modal.weight.toggle" class="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-70" @mousedown.stop="modal.weight.toggle = false">
      <div class="bg-white p-4 lg:p-8 rounded-xl shadow-2xl text-center w-[90%] max-w-2xl dark:bg-darkPrimary-700" @mousedown.stop>
        <VForm @submit="createWeight">
          <h2 class="mb-2 text-xl font-semibold text-gray-800 dark:text-darkPrimary-50">新增體重紀錄</h2>
          <div class="grid grid-cols-[1fr_1fr] gap-x-4 lg:grid-cols-2 items-center border p-2 rounded-md shadow-md">
            <VField v-model="modal.weight.date" name="weightDate" rules="required" type="date" class="w-full h-10 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" />
            <VField v-model="modal.weight.value" name="weightValue" rules="required" type="number" placeholder="輸入體重" class="w-full h-10 pl-3 border rounded-md shadow-sm h-1ull0 w-f dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
            <div>
              <ErrorMessage name="weightDate" class="mt-1 text-sm text-red-500 dark:text-rose-400" />
            </div>
            <div>
              <ErrorMessage name="weightValue" class="mt-1 text-sm text-red-500 dark:text-rose-400" />
            </div>
          </div>

          <div class="flex justify-between mt-4 space-x-4">
            <button type="button" class="w-1/2 px-6 py-2 text-gray-700 transition-all bg-gray-300 rounded-lg shadow-md lg:w-1/3 dark:bg-darkPrimary-50 hover:dark:bg-darkPrimary-400 hover:bg-gray-400" @click="modal.weight.toggle = false">取消</button>
            <button v-if="isLoading" class="inline-flex items-center justify-center w-1/2 px-6 py-2 rounded-md lg:w-1/3 bg-primary-600 dark:bg-indigo-600 text-darkPrimary-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-auto" disabled="">
              <div class="w-4 h-4 border-2 border-white border-solid rounded-full animate-spin border-t-transparent"></div>
              <span class="ml-2">新增中... </span>
            </button>
            <button v-else type="submit" class="w-1/2 px-4 py-2 text-white rounded-md lg:w-1/3 bg-primary-600 dark:bg-indigo-600 hover:dark:bg-indigo-700 hover:bg-primary-700 outline-1 focus:outline-2 focus:outline-primary-500 focus:outline-offset-2 focus:outline-none">新增體重</button>
          </div>
        </VForm>
      </div>
    </div>
    <!-- 血糖曲線視窗 -->
    <div v-show="modal.bloodSugarCurve.toggle" class="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-70" @mousedown="modal.bloodSugarCurve.toggle = false">
      <div class="bg-white p-4 lg:p-8 rounded-xl shadow-2xl text-center w-[90%] max-w-2xl dark:bg-darkPrimary-700" @mousedown.stop>
        <VForm @submit="createBloodSugarCurve">
          <h2 class="mb-2 text-xl font-semibold text-gray-800 dark:text-darkPrimary-50">建立血糖曲線</h2>
          <VField v-model="modal.bloodSugarCurve.date" name="bloodSugarCurveDate" rules="required" type="date" class="w-full h-10 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" />
          <ErrorMessage name="bloodSugarCurveDate" class="mt-1 text-sm text-red-500 dark:text-rose-400" />
          <div v-for="(field, index) in modal.bloodSugarCurve.fields" :key="index" class="my-4 space-y-4">
            <div class="grid grid-cols-[2fr_2fr_0.5fr] gap-4 items-center border p-2 rounded-md shadow-md">
              <input v-model="field.time" type="time" name="sugarCurveTime" class="w-full h-10 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
              <input v-model="field.value" type="number" name="sugarCurveBloodSugar" placeholder="血糖" class="w-full h-10 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
              <button type="button" class="px-2 py-1 font-semibold text-white bg-red-500 rounded-md hover:bg-red-600" @click="modal.bloodSugarCurve.fields.splice(index, 1)">X</button>
            </div>
          </div>
          <div class="flex justify-center my-3">
            <button type="button" class="flex items-center px-6 py-2 font-medium text-white transition-all bg-green-500 rounded-lg shadow-md hover:bg-green-400 dark:bg-lime-600" @click="modal.bloodSugarCurve.fields.push({ time: '', value: '' })"><i class="mr-2 fa-solid fa-plus fa-fw"></i> 新增欄位</button>
          </div>
          <div class="flex justify-between space-x-4">
            <button type="button" class="w-1/2 px-6 py-2 text-gray-700 transition-all bg-gray-300 rounded-lg shadow-md lg:w-1/3 dark:bg-darkPrimary-50 hover:dark:bg-darkPrimary-400 hover:bg-gray-400" @click="modal.bloodSugarCurve.toggle = false">取消</button>
            <button v-if="isLoading" class="inline-flex items-center justify-center w-1/2 px-6 py-2 rounded-md lg:w-1/3 bg-primary-600 dark:bg-indigo-600 text-darkPrimary-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-auto" disabled="">
              <div class="w-4 h-4 border-2 border-white border-solid rounded-full animate-spin border-t-transparent"></div>
              <span class="ml-2">新增中... </span>
            </button>
            <button v-else type="submit" class="w-1/2 px-4 py-2 text-white rounded-md lg:w-1/3 bg-primary-600 dark:bg-indigo-600 hover:dark:bg-indigo-700 hover:bg-primary-700 outline-1 focus:outline-2 focus:outline-primary-500 focus:outline-offset-2 focus:outline-none">新增血糖曲線</button>
          </div>
        </VForm>
      </div>
    </div>
    <div v-show="modal.tips.toggle" class="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-70" @mousedown="modal.tips.toggle = false">
      <div class="relative rounded-lg shadow-2xl text-center w-[90%] max-w-2xl" @mousedown.stop>
        <button class="absolute top-0 right-0 group flex h-6 w-6 select-none items-center justify-center rounded-lg bg-white leading-8 text-zinc-950 shadow-[0_-1px_0_0px_#d4d4d8_inset,0_0_0_1px_#f4f4f5_inset,0_0.5px_0_1.5px_#fff_inset] hover:bg-zinc-50 hover:via-zinc-900 hover:to-zinc-800 active:shadow-[-1px_0px_1px_0px_#e4e4e7_inset,1px_0px_1px_0px_#e4e4e7_inset,0px_0.125rem_1px_0px_#d4d4d8_inset]" aria-label="Change language" @click="modal.tips.toggle = false">
          <span class="flex items-center group-active:[transform:translate3d(0,1px,0)]"><i class="fa-solid fa-x fa-fw"></i></span>
        </button>
        <table class="w-full text-sm text-left text-gray-500 bg-white border-collapse rounded-md shadow-lg dark:bg-darkPrimary-500">
          <thead class="font-semibold text-center border-b bg-primary-100 dark:bg-darkPrimary-600 border-primary-200 dark:border-darkPrimary-400 text-primary-600 dark:text-darkPrimary-50">
            <tr>
              <th class="px-2 py-2">時間</th>
              <th class="px-2 py-2">血糖值</th>
              <th class="px-2 py-2">胰島素</th>
              <th class="px-2 py-2">備註</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="data in hoverData" :key="data.id" class="border-b border-primary-200 dark:bg-darkPrimary-500 dark:border-darkPrimary-400 hover:bg-primary-50 text-primary-900 dark:text-darkPrimary-50">
              <td class="px-2 py-4">{{ data?.time }}</td>
              <td class="px-2 py-4">{{ data?.bloodSugar || '無' }}</td>
              <td class="px-2 py-4">{{ data?.insulin || '無' }}</td>
              <td class="px-2 py-4">{{ data?.notes || '無' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="fixed z-10 space-y-4 lg:right-6 lg:bottom-6 right-3 bottom-6">
      <button type="button" class="flex items-center justify-center w-12 h-12 text-black bg-yellow-300 rounded-full shadow-md dark:bg-amber-300 lg:w-14 lg:h-14" @click="modal.weight.toggle = true">
        <i class="fa-solid fa-weight-scale fa-fw"></i>
      </button>
      <button type="button" class="flex items-center justify-center w-12 h-12 text-black bg-pink-300 rounded-full shadow-md dark:bg-rose-300 lg:w-14 lg:h-14" @click="modal.bloodSugarCurve.toggle = true">
        <i class="fa-solid fa-chart-line fa-fw"></i>
      </button>
    </div>
    <VueLoading :active="isLoading || isDelete" :height="loadingConfig.height" :width="loadingConfig.width" :loader="loadingConfig.loader" :color="loadingConfig.getColor()" :backgroundColor="loadingConfig.backgroundColor()" />
  </div>
</template>
