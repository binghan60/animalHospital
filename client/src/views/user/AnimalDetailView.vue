<script>
import ChartComponent from '@/components/ChartComponent.vue'
import axios from 'axios'
export default {
  components: { ChartComponent },
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
        option: {
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
      bloodSugarCurveChart: [],
      averageChart: {
        title: '',
        averages: {
          combinedAverage: '',
          morning: '',
          evening: '',
        },
        data: {
          labels: [],
          datasets: [],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'left',
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
    }
  },
  methods: {
    async getAnimalInfo() {
      try {
        this.isLoading = true
        const { data } = await axios.get(`${import.meta.env.VITE_API_PATH}/animal/detail/${this.animal.Id}`)
        this.animal.Info = data
        this.weightChart.data.labels = data.weight.map(x => new Date(x.date).toISOString().slice(0, 10))
        this.weightChart.data.datasets[0].data = data.weight.map(x => x.value)
      } catch (error) {
        this.$toast.error(error.response.data.message)
      } finally {
        this.isLoading = false
      }
    },
    async getDiaryBloodSugar() {
      try {
        const { year, month, lastDay } = this.newtoday
        const { data } = await axios.get(`${import.meta.env.VITE_API_PATH}/bloodSugar/diary`, {
          params: {
            animalId: this.animal.Id,
            startDate: `${year}-${String(month + 1).padStart(2, '0')}-01`,
            endDate: `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`,
          },
        })
        this.animal.diaryBloodSugar = data
        return data
      } catch (error) {
        this.$toast.error(error.response.data.message)
      }
    },
    async updateBloodSugarCurveChart() {
      try {
        const { year, month, lastDay } = this.newtoday
        const { data } = await axios.get(`${import.meta.env.VITE_API_PATH}/bloodSugar/getCurve`, {
          params: {
            animalId: this.animal.Id,
            startDate: `${year}-${month + 1}-01`,
            endDate: `${year}-${month + 1}-${lastDay}`,
          },
        })
        const bloodSugarCurveSetting = data.data.map(x => {
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
        this.bloodSugarCurveChart = bloodSugarCurveSetting
      } catch (error) {
        this.$toast.error(error.response.data.message)
      }
    },
    async getWeekBloodSugarData() {
      // 混合周資料
      try {
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
            day.records = diaryEntry.records
          }
          return day
        })
      } catch (error) {
        this.$toast.error(error.response.data.message)
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
    convertBirthdayToAge(dateString) {
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
      if (value === '' || value === null || value === undefined || value == 0) {
        return 'bg-gray-200'
      }
      if (value > 0 && value <= 249) {
        return 'bg-green-100'
      }
      if (value >= 250 && value <= 399) {
        return 'bg-yellow-100'
      }
      if (value >= 400) {
        return 'bg-red-100'
      }
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
      this.updateAverageChart(data)
    },
    updateAverageChart(data) {
      this.averageChart.averages = data.averages
      this.averageChart.data = {
        labels: ['1~249', '250~399', '400up'],
        datasets: [
          {
            data: [data.morningCounts.count_1_249 + data.eveningCounts.count_1_249, data.morningCounts.count_250_399 + data.eveningCounts.count_250_399, data.morningCounts.count_400_plus + data.eveningCounts.count_400_plus],
            backgroundColor: ['rgba(220 ,252, 231)', 'rgba(254 ,243, 199)', 'rgba(254 ,226 ,226)'],
            borderColor: ['rgba(220, 252 ,231)', 'rgba(254 ,243, 199)', 'rgba(254, 226, 226)'],
          },
        ],
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
      await this.updateBloodSugarCurveChart()
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
        if (this.calendarDisplay == 'month') {
          const range = this.getDateRange('month')
          this.updateAverageChartByRange(range.startDate, range.endDate, range.title)
        }
      },
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
      <div class="h-full bg-white rounded-lg shadow-lg">
        <img class="object-cover w-full h-full p-4 lg:p-6" :src="animal.Info.avatar ? animal.Info.avatar : '/image/sampleAvatar.png'" alt="" />
      </div>
      <div class="rounded-lg shadow-md bg-white p-4 lg:p-6 border border-gray-200 h-full min-h-[300px]">
        <div class="w-full h-full">
          <h5 class="mb-3 text-lg font-semibold text-primary-900">基本資料</h5>
          <ul class="grid grid-cols-3 list-none gap-x-4 gap-y-3">
            <li class="text-sm font-medium text-primary-900">姓名：</li>
            <li class="col-span-2 text-sm text-gray-800">{{ animal.Info.name }}</li>
            <li class="text-sm font-medium text-primary-900">種類：</li>
            <li class="col-span-2 text-sm text-gray-800" v-html="animal.Info.type === 'dog' ? `<i class='fa-solid fa-dog fa-fw'></i>` : `<i class='fa-solid fa-cat fa-fw'></i>`"></li>
            <li class="text-sm font-medium text-primary-900">生日：</li>
            <li v-if="animal.Info.birthday !== null && animal.Info.birthday !== '1970-01-01T00:00:00.000Z'" class="col-span-2 text-sm text-gray-800">{{ animal.Info.birthday ? new Date(animal.Info.birthday).toISOString().slice(0, 10) : '' }} ({{ convertBirthdayToAge(animal.Info.birthday).years }}歲 {{ convertBirthdayToAge(animal.Info.birthday).months > 0 ? convertBirthdayToAge(animal.Info.birthday).months + '個月' : '' }})</li>
            <li v-else class="col-span-2 text-sm text-gray-800"></li>
            <li class="text-sm font-medium text-primary-900">性別：</li>
            <li class="col-span-2 text-sm text-gray-800" v-html="animal.Info.gender === 'male' ? `<i class='text-primary-600 fa-solid fa-mars fa-fw'></i>` : `<i class='text-pink-600 fa-solid fa-venus fa-fw'></i>`"></li>
            <li class="text-sm font-medium text-primary-900">血型：</li>
            <li class="col-span-2 text-sm text-gray-800">{{ animal.Info.bloodType }} 型</li>
            <li class="text-sm font-medium text-primary-900">體重：</li>
            <li class="col-span-2 text-sm text-gray-800">{{ animal.Info.weight ? animal.Info.weight[animal.Info.weight.length - 1].value : '' }} 公斤</li>
            <li class="text-sm font-medium text-primary-900">品種：</li>
            <li class="col-span-2 text-sm text-gray-800">{{ animal.Info.breed }}</li>
            <li class="text-sm font-medium text-primary-900">結紮：</li>
            <li class="col-span-2 text-sm text-gray-800" v-html="animal.Info.sterilized ? `<i class='text-green-500 fa-solid fa-check fa-fw'></i>` : `<i class='text-red-600 fa-solid fa-x fa-fw'></i>`"></li>
            <li class="text-sm font-medium text-primary-900">胰島素品牌：</li>
            <li class="col-span-2 text-sm text-gray-800">{{ animal.Info.insulinBrand }}</li>
          </ul>
        </div>
      </div>
      <div class="rounded-lg shadow-md bg-white p-4 lg:p-6 border border-gray-200 h-full min-h-[300px]">
        <ChartComponent type="line" :chartData="weightChart.data" :chartOptions="weightChart.option"></ChartComponent>
      </div>
      <div class="rounded-lg shadow-md bg-white p-4 lg:p-6 border border-gray-200 h-full min-h-[300px]">
        <ChartComponent type="pie" :chartData="averageChart.data" :chartOptions="averageChart.options"></ChartComponent>
        <div class="grid grid-cols-2 col-span-6 text-center">
          <h2 class="col-span-2 text-primary-900">{{ averageChart.title }}</h2>
          <div :class="['col-span-2 p-2 h-[40px] text-lg font-semibold text-blue-600', bloodSugarColor(Math.ceil(averageChart.averages.combinedAverage))]">{{ Math.ceil(averageChart.averages.combinedAverage) }}</div>
          <div :class="['col-span-1 p-2 h-[40px] text-lg font-semibold text-blue-600', bloodSugarColor(Math.ceil(averageChart.averages.morningAverage))]"><i class="fa-regular fa-sun"></i> {{ Math.ceil(averageChart.averages.morningAverage) }}</div>
          <div :class="['col-span-1 p-2 h-[40px] text-lg font-semibold text-blue-600', bloodSugarColor(Math.ceil(averageChart.averages.eveningAverage))]"><i class="fa-regular fa-moon"></i> {{ Math.ceil(averageChart.averages.eveningAverage) }}</div>
        </div>
      </div>
    </div>
    <!-- 日曆 -->
    <div class="rounded-lg shadow-lg bg-white mt-4 p-2 lg:p-4 lg:min-h-[1200px] min-h-[800px]">
      <!-- 切換按鈕 -->
      <div class="grid items-center justify-around grid-cols-3">
        <div class="w-full flex items-center justify-center h-[50px] space-x-4 col-span-1">
          <label for="calendarDisplay-day" @click="calendarDisplay = 'month'">
            <input id="calendarDisplay-day" type="radio" name="calendar" value="day" class="hidden peer" :checked="calendarDisplay === 'month'" />
            <span class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 text-primary-800 bg-primary-100 peer-checked:bg-primary-500 peer-checked:text-white"> <i class="fa-solid fa-calendar-days fa-fw"></i> </span>
          </label>
          <label for="calendarDisplay-month" @click="calendarDisplay = 'week'">
            <input id="calendarDisplay-month" type="radio" name="calendar" value="month" class="hidden peer" :checked="calendarDisplay === 'week'" />
            <span class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 text-primary-800 bg-primary-100 peer-checked:bg-primary-500 peer-checked:text-white"> <i class="fa-regular fa-calendar fa-fw"></i> </span>
          </label>
        </div>
        <div class="w-full col-span-2 space-x-2 text-center lg:col-span-1 lg:space-x-6">
          <select v-model="selectedYear" class="lg:p-2 lg:w-[100px] w-[100px] p-2 border rounded-lg shadow-sm border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300" @change="goToFirstWeekOfSelectedMonth">
            <option v-for="year in years" :key="year.value" :value="year.value">
              {{ year.label }}
            </option>
          </select>
          <select v-model="selectedMonth" class="lg:p-2 lg:w-[100px] w-[100px] p-2 text-center border rounded-lg shadow-sm border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300" @change="goToFirstWeekOfSelectedMonth">
            <option v-for="month in months" :key="month.value" :value="month.value">
              {{ month.label }}
            </option>
          </select>
        </div>
        <div v-show="calendarDisplay === 'week'" class="col-span-3 lg:col-span-1 w-full flex items-center justify-center h-[50px] space-x-6">
          <button type="button" class="px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600" @click="prevWeek"><i class="fa-solid fa-circle-left fa-fw"></i> 上週</button>
          <button type="button" class="px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600" @click="nextWeek">下週 <i class="fa-solid fa-circle-right fa-fw"></i></button>
        </div>
        <div v-show="calendarDisplay === 'month'" class="col-span-3 lg:col-span-1 w-full flex items-center justify-center h-[50px] space-x-6">
          <button type="button" class="px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600" @click="prevMonth"><i class="fa-solid fa-circle-left fa-fw"></i> 前月</button>
          <button type="button" class="px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600" @click="nextMonth">下月 <i class="fa-solid fa-circle-right fa-fw"></i></button>
        </div>
      </div>
      <!-- 日曆格子 -->
      <div v-show="calendarDisplay == 'month'" class="grid grid-cols-2 col-span-7 gap-1 lg:grid-cols-7">
        <div class="col-span-2 py-3 text-2xl font-bold text-center select-none text-primary-900 lg:col-span-7">
          <span class="px-4">{{ newtoday.year }} 年 {{ newtoday.month + 1 }} 月 血糖總覽</span>
        </div>
        <div class="hidden grid-cols-7 col-span-7 gap-1 text-2xl font-semibold text-center text-primary-900 lg:grid">
          <div>一</div>
          <div>二</div>
          <div>三</div>
          <div>四</div>
          <div>五</div>
          <div>六</div>
          <div>日</div>
        </div>
        <template v-for="(day, index) in calendar">
          <div v-if="day.day" :key="day.isoDate" :class="['p-2 m-1 rounded-lg select-none bg-primary-200 text-primary-900', { 'bg-primary-400': day.isToday, 'cursor-pointer': day.records?.length }]" @click="day.records?.length ? showTips($event, day?.records) : null">
            <div class="font-bold text-center">{{ day.month }} / {{ day.day }} {{ day.records?.length > 2 ? '**' : '' }}</div>
            <!-- 早上 -->
            <div class="p-2 mb-2 rounded-md bg-primary-100 hover:bg-primary-300">
              <div class="text-center text-primary-900"><i class="fa-regular fa-sun fa-fw"></i> {{ calendar[index].morning.time }}</div>
              <div :class="['w-full p-1 mt-1 text-sm border border-gray-300 rounded select-none', bloodSugarColor(calendar[index].morning.bloodSugar)]">
                <i class="fa-solid fa-droplet fa-fw"></i> : <span class="">{{ calendar[index].morning.bloodSugar ? calendar[index].morning.bloodSugar : '---' }}</span>
              </div>
              <div class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none"><i class="fa-solid fa-syringe fa-fw"></i> : {{ calendar[index].morning.insulin || calendar[index].morning.insulin === 0 ? calendar[index].morning.insulin + ' 小格' : '---' }}</div>
            </div>
            <!-- 晚上 -->
            <div class="p-2 rounded-md bg-primary-100 hover:bg-primary-300">
              <div class="text-center text-primary-900"><i class="fa-regular fa-moon fa-fw"></i> {{ calendar[index].evening.time }}</div>
              <div :class="['w-full p-1 mt-1 text-sm border border-gray-300 rounded select-none', bloodSugarColor(calendar[index].evening.bloodSugar)]">
                <i class="fa-solid fa-droplet fa-fw"></i> : <span>{{ calendar[index].evening.bloodSugar ? calendar[index].evening.bloodSugar : '---' }}</span>
              </div>
              <div class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none'"><i class="fa-solid fa-syringe fa-fw"></i> : {{ calendar[index].evening.insulin || calendar[index].evening.insulin === 0 ? calendar[index].evening.insulin + ' 小格' : '---' }}</div>
            </div>
          </div>
          <div v-else :key="index" :class="['p-2 m-1 rounded-md h-[264px] hidden lg:grid', { lazyLoading: day.loading }]"></div>
        </template>
        <div v-show="showTooltip" class="absolute p-4 border rounded-lg shadow-lg border-primary-300 bg-primary-50" :style="tooltipStyle">
          <button type="button" class="absolute text-primary-500 top-2 right-2 hover:text-primary-700" @click="showTooltip = false">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div>
            <table class="min-w-full text-sm text-left text-gray-500">
              <thead class="bg-primary-100">
                <tr>
                  <th class="px-4 py-2 font-semibold text-primary-600">時間</th>
                  <th class="px-4 py-2 font-semibold text-primary-600">血糖值</th>
                  <th class="px-4 py-2 font-semibold text-primary-600">胰島素</th>
                  <th class="px-4 py-2 font-semibold text-primary-600">備註</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="data in hoverData" :key="data.id" class="border-b border-primary-200">
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
        <div class="col-span-2 py-3 text-2xl font-bold text-center select-none text-primary-900 lg:col-span-7">{{ weekRange }}</div>
        <div class="p-4 overflow-x-auto">
          <div class="flex gap-2 lg:grid lg:grid-cols-7">
            <div v-for="day in weekData" :key="day.date" :class="['p-4 border rounded-lg shadow-sm min-h-[1000px]', day.isToday ? 'border-primary-500 border-2' : 'bg-white']" class="shrink-0 w-[150px] lg:w-auto">
              <!-- 日期與星期 -->
              <div class="mb-2 text-sm font-semibold text-center text-gray-700">{{ day.date }} ({{ day.day }})</div>
              <ul class="space-y-2">
                <li v-for="(task, index) in day.records" :key="index" class="p-3 text-sm bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-primary-100">
                  <div class="mb-1 text-center text-gray-800">🕒{{ task.time }}</div>
                  <div v-show="task.bloodSugar" class="text-gray-600"><i class="fa-solid fa-droplet fa-fw"></i> : {{ task.bloodSugar }}</div>
                  <div v-show="task.insulin" class="text-gray-600"><i class="fa-solid fa-syringe fa-fw"></i> : {{ task.insulin }}</div>
                  <div v-show="task.notes" class="text-gray-600"><i class="fa-regular fa-comment-dots fa-fw"></i> : {{ task.notes }}</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-for="chart in bloodSugarCurveChart" :key="chart.date" class="rounded-lg overflow-hidden shadow-lg bg-white mt-6 p-4 h-[350px] w-full">
      <ChartComponent type="line" :chartData="chart.data" :chartOptions="chart.option"></ChartComponent>
    </div>
    <VueLoading :active="isLoading" :height="190" :width="190" loader="dots" color="#007BFF" />
  </div>
</template>
