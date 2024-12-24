<script>
import Mychart from '@/components/Mychart.vue'
import axios from 'axios'
import { Field, Form, ErrorMessage } from 'vee-validate'
export default {
  components: { Mychart, VField: Field, VForm: Form, ErrorMessage },
  data() {
    return {
      animal: { Id: this.$route.params.id, Info: {}, diaryBloodSugar: [] },
      weightChartData: {
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
      chartOptions: {
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
      sugarCurveChart: [],
      today: new Date(),
      currentDate: this.getToday(),
      calendar: Array.from({ length: 42 }, () => ({ loading: true })),
      calendarDisplay: 'week',
      insulinOption: [
        { value: null, text: '請選擇劑量' },
        { value: 0, text: '0 小格' },
        { value: 0.5, text: '0.5 小格' },
        { value: 1, text: '1 小格' },
        { value: 1.5, text: '1.5 小格' },
      ],
      window: {
        quick: { value: { bloodSugar: '', insulin: null }, toggle: false, loading: false },
        weight: { value: '', date: new Date().toISOString().split('T')[0], toggle: false, loading: false },
        sugarCurve: {
          fields: [{ time: '', value: '' }],
          date: new Date().toISOString().split('T')[0],
          toggle: false,
          loading: false,
        },
      },
      showModal: false,
      weekRange: '',
      selectedMonth: '',
      weekData: [],
      months: [
        { value: 0, label: '2024年1月' },
        { value: 1, label: '2024年2月' },
        { value: 2, label: '2024年3月' },
        { value: 3, label: '2024年4月' },
        { value: 4, label: '2024年5月' },
        { value: 5, label: '2024年6月' },
        { value: 6, label: '2024年7月' },
        { value: 7, label: '2024年8月' },
        { value: 8, label: '2024年9月' },
        { value: 9, label: '2024年10月' },
        { value: 10, label: '2024年11月' },
        { value: 11, label: '2024年12月' },
      ],
      weekBloodSugarData: [],
    }
  },
  methods: {
    async updateCalendar() {
      const { currentDate } = this
      const days = Array.from({ length: currentDate.dayInMonth }, (v, i) => {
        const date = `${currentDate.year}-${currentDate.month}-${String(i + 1).padStart(2, '0')}`
        return {
          year: currentDate.year,
          month: currentDate.month,
          day: i + 1,
          date,
          morning: { time: '', bloodSugar: '', insulin: '', notes: '', isEditing: false, pending: false },
          evening: { time: '', bloodSugar: '', insulin: '', notes: '', isEditing: false, pending: false },
        }
      })
      const diaryData = await this.getDiaryBloodSugar()
      const mergedDays = days.map(day => {
        const diaryEntry = diaryData.find(entry => new Date(entry.date).toISOString().slice(0, 10) === day.date)
        if (diaryEntry) {
          return Object.assign({}, day, diaryEntry, {
            morning: {
              time: diaryEntry.morning.time,
              bloodSugar: diaryEntry.morning.bloodSugar,
              insulin: diaryEntry.morning.insulin,
              notes: diaryEntry.morning.notes,
            },
            evening: {
              time: diaryEntry.evening.time,
              bloodSugar: diaryEntry.evening.bloodSugar,
              insulin: diaryEntry.evening.insulin,
              notes: diaryEntry.evening.notes,
            },
          })
        }
        return day
      })

      const firstDay = new Date(currentDate.year, currentDate.month - 1, 1).getDay()
      const spaceDay = firstDay === 0 ? 6 : firstDay - 1
      const blankDays = Array.from({ length: spaceDay }, () => ({ date: null }))
      const allDays = [...blankDays, ...mergedDays]
      let totalCells = 42
      const backBlank = totalCells - allDays.length
      if (backBlank >= 7) {
        totalCells -= 7
      }
      for (let i = allDays.length; i < totalCells; i++) {
        allDays.push({ date: null })
      }
      this.calendar = allDays
      console.log(allDays)
      await this.updateSugarCurveChart()
    },
    async getAnimalInfo() {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_PATH}/animal/detail/${this.animal.Id}`)
        this.animal.Info = data
        this.weightChartData.labels = data.weight.map(x => new Date(x.date).toISOString().slice(0, 10))
        this.weightChartData.datasets[0].data = data.weight.map(x => x.value)
      } catch (error) {
        this.$toast.error(error.response.data.message)
      }
    },
    async getDiaryBloodSugar() {
      try {
        const { year, month, dayInMonth } = this.currentDate
        const { data } = await axios.get(`${import.meta.env.VITE_API_PATH}/bloodSugar/diary`, {
          params: {
            animalId: this.animal.Id,
            startDate: `${year}-${month}-1`,
            endDate: `${year}-${month}-${dayInMonth}`,
          },
        })
        this.animal.diaryBloodSugar = data
        console.log(data)
        return data
      } catch (error) {
        console.log(error)
        this.$toast.error(error.response.data.message)
      }
    },
    async createDiaryBloodSugar(date, morningBloodSugar, morningInsulin, eveningBloodSugar, eveningInsulin, notes) {
      try {
        const payload = {
          animalId: this.animal.Id,
          date,
          morning: {
            bloodSugar: morningBloodSugar,
            insulin: morningInsulin,
          },
          evening: {
            bloodSugar: eveningBloodSugar,
            insulin: eveningInsulin,
          },
          notes,
        }
        await axios.post(`${import.meta.env.VITE_API_PATH}/bloodSugar/create`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        this.$toast.success('新增成功')
        await this.updateCalendar()
      } catch (error) {
        this.$toast.error(error.response.data.message)
      }
    },
    async createQuick() {
      const { value } = this.window.quick
      if (!value.bloodSugar || !value.insulin) {
        this.$toast.error('請輸入完整資訊')
        return
      }
      const now = new Date()
      const currentHour = now.getHours()
      let quickResponse = ''
      if (currentHour < 14) {
        quickResponse = await this.createDiaryBloodSugar(now.toISOString().split('T')[0], value.bloodSugar, value.insulin, '', '', '')
      } else if (currentHour >= 14) {
        quickResponse = await this.createDiaryBloodSugar(now.toISOString().split('T')[0], '', '', value.bloodSugar, value.insulin, '')
      }
      console.log(quickResponse)
      this.window.quick.toggle = false
      this.updateCalendar()
    },
    async createWeight() {
      const { date, value } = this.window.weight
      const { Id: animalId } = this.animal
      if (!animalId || !value) {
        this.$toast.error('請輸入有效的體重資料！')
        return
      }
      const payload = {
        animalId,
        date,
        value,
      }
      this.window.weight.loading = true
      try {
        const { data } = await axios.post(`${import.meta.env.VITE_API_PATH}/animal/createWeight`, payload, {
          headers: { 'Content-Type': 'application/json' },
        })
        this.weightChartData.labels = data.weight.map(x => new Date(x.date).toISOString().slice(0, 10))
        this.weightChartData.datasets[0].data = data.weight.map(x => x.value)
        this.$toast.success(data.message)
        this.window.weight.toggle = false
        this.window.weight.value = ''
      } catch (error) {
        this.$toast.error(error.response.data.message)
      } finally {
        this.window.weight.loading = false // 確保重置 loading 狀態
      }
    },
    async createSugarCurve() {
      const { date, fields } = this.window.sugarCurve
      const { Id: animalId } = this.animal
      const payload = {
        animalId,
        date,
        records: fields,
      }
      this.window.sugarCurve.loading = true
      try {
        await axios.post(`${import.meta.env.VITE_API_PATH}/bloodSugar/createCurve`, payload, {
          headers: { 'Content-Type': 'application/json' },
        })
        this.$toast.success('新增血糖曲線成功')
        await this.updateSugarCurveChart()
        this.window.sugarCurve.toggle = false
        this.window.sugarCurve.fields = [{ time: '', value: '' }]
      } catch (error) {
        this.$toast.error(error.response.data.message)
      } finally {
        this.window.sugarCurve.loading = false
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
    getToday() {
      const date = new Date()
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      return {
        year,
        month,
        day: date.getDate(),
        dayInMonth: new Date(year, month, 0).getDate(),
      }
    },
    prevMonth() {
      this.currentDate.month -= 1
      if (this.currentDate.month < 1) {
        this.currentDate.month = 12
        this.currentDate.year -= 1
      }
    },
    nextMonth() {
      this.currentDate.month += 1
      if (this.currentDate.month > 12) {
        this.currentDate.month = 1
        this.currentDate.year += 1
      }
    },
    edit(index, timeOfDay, recordType) {
      this.calendar[index][timeOfDay][recordType].isEditing = true
      this.$nextTick(() => {
        const refName = `${timeOfDay}${recordType.charAt(0).toUpperCase() + recordType.slice(1)}`
        if (this.$refs[refName]) {
          this.$refs[refName][0].focus()
          this.$refs[refName][0].click()
        }
      })
    },
    async blur(index, timeOfDay, recordType) {
      if (!this.calendar[index][timeOfDay][recordType].pending == true) {
        this.calendar[index][timeOfDay][recordType].isEditing = false
        this.calendar[index][timeOfDay][recordType].pending = true
        await this.createDiaryBloodSugar(this.calendar[index].date, this.calendar[index].morning.bloodSugar.value, this.calendar[index].morning.insulin.value, this.calendar[index].evening.bloodSugar.value, this.calendar[index].evening.insulin.value, '')
        this.calendar[index][timeOfDay][recordType].pending = false
      }
    },
    handleEnter(event, index, period, type) {
      event.preventDefault() // 阻止默認行為
      this.$refs[`${period}${type.charAt(0).toUpperCase() + type.slice(1)}`].blur() // 直接觸發失焦
    },
    bloodColor(value) {
      if (value == 0 || value === null) {
        return 'bg-white'
      } else if (value <= 250) {
        return 'bg-green-100'
      } else if (value <= 399) {
        return 'bg-yellow-100'
      } else {
        return 'bg-red-100' // 危險
      }
    },
    async updateSugarCurveChart() {
      try {
        const { year, month, dayInMonth } = this.currentDate
        const { data } = await axios.get(`${import.meta.env.VITE_API_PATH}/bloodSugar/getCurve`, {
          params: {
            animalId: this.animal.Id,
            startDate: `${year}-${month}-1`,
            endDate: `${year}-${month}-${dayInMonth}`,
          },
        })
        const sugarCurveObject = data.data.map(x => {
          return {
            chartData: {
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
            chartOption: {
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
        this.sugarCurveChart = sugarCurveObject
      } catch (error) {
        this.$toast.error(error.response.data.message)
      }
    },
    addTask(day) {
      this.currentDay = day
      this.newTask = { time: '', content: '' }
      this.showModal = true
    },
    updateWeekData() {
      const startOfWeek = this.getStartOfWeek(this.today)
      startOfWeek.setDate(startOfWeek.getDate() + 1)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      this.weekRange = `${startOfWeek.toISOString().split('T')[0]} ~ ${endOfWeek.toISOString().split('T')[0]}`
      this.weekData = this.getWeekData(startOfWeek)
    },
    getStartOfWeek(date) {
      const d = new Date(date)
      const day = d.getDay()
      const diff = d.getDate() - (day === 0 ? 6 : day - 1)
      d.setDate(diff)
      d.setHours(0, 0, 0, 0)
      return d
    },
    getWeekData(startOfWeek) {
      const weekData = []
      const daysOfWeek = ['一', '二', '三', '四', '五', '六', '日']
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        weekData.push({
          date: date.toISOString().split('T')[0],
          day: daysOfWeek[i],
          tasks: [],
          isToday: date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0],
        })
      }
      return weekData
    },
    goToPrevWeek() {
      this.today.setDate(this.today.getDate() - 7)
      this.updateWeekData()
    },
    goToNextWeek() {
      this.today.setDate(this.today.getDate() + 7)
      this.updateWeekData()
    },
    goToFirstWeekOfSelectedMonth() {
      const firstDayOfMonth = new Date(new Date().getFullYear(), this.selectedMonth, 1)
      const startOfWeek = this.getStartOfWeek(firstDayOfMonth)
      this.today = startOfWeek
      this.updateWeekData()
    },
    saveTask() {
      if (this.newTask.time && this.newTask.content) {
        this.currentDay.tasks.push({ ...this.newTask })
        this.closeModal()
      }
    },
    closeModal() {
      this.showModal = false
      this.currentDay = null
      this.newTask = { time: '', content: '' }
    },

    async getWeekBloodSugarData() {
      const { data } = await axios.get(`${import.meta.env.VITE_API_PATH}/bloodSugar/diary`, {
        params: {
          animalId: this.animal.Id,
          startDate: this.weekData[0].date,
          endDate: this.weekData[6].date,
        },
      })
      this.weekBloodSugarData = data
      this.weekData.map(day => {
        const diaryEntry = data.find(entry => new Date(entry.date).toISOString().slice(0, 10) === day.date)
        if (diaryEntry) {
          day.tasks = diaryEntry.records
        }
        return day
      })
    },
  },
  watch: {
    'currentDate.month': {
      handler() {
        this.updateCalendar()
      },
    },
    weekData: {
      handler() {
        this.getWeekBloodSugarData()
        console.log('A')
      },
    },
  },
  async mounted() {
    await this.getAnimalInfo()
    await this.updateCalendar()
    this.updateWeekData()
    this.selectedMonth = this.today.getMonth()
    await this.getWeekBloodSugarData()
  },
}
</script>
<template>
  <div>
    <div class="grid gap-4 md:grid-cols-3">
      <div class="h-full overflow-hidden bg-white rounded-lg shadow-lg">
        <!-- <img class="object-cover w-full h-full" src="image/avatar.png" alt="" /> -->
      </div>
      <div class="rounded-lg overflow-hidden shadow-md bg-white p-4 lg:p-6 border border-gray-200 h-full min-h-[300px]">
        <div class="w-full h-full">
          <h5 class="mb-3 text-lg font-semibold text-primary-900">基本資料</h5>
          <ul class="grid grid-cols-3 list-none gap-x-4 gap-y-3">
            <li class="text-sm font-medium text-primary-900">姓名：</li>
            <li class="col-span-2 text-sm text-gray-800">{{ animal.Info.name }}</li>
            <li class="text-sm font-medium text-primary-900">種類：</li>
            <li class="col-span-2 text-sm text-gray-800" v-html="animal.Info.type === 'dog' ? `<i class='fa-solid fa-dog'></i>` : `<i class='fa-solid fa-cat'></i>`"></li>
            <li class="text-sm font-medium text-primary-900">生日：</li>
            <li v-if="animal.Info.birthday !== '1970-01-01T00:00:00.000Z'" class="col-span-2 text-sm text-gray-800">{{ animal.Info.birthday ? new Date(animal.Info.birthday).toISOString().slice(0, 10) : '' }} ({{ convertBirthdayToAge(animal.Info.birthday).years }}歲 {{ convertBirthdayToAge(animal.Info.birthday).months > 0 ? convertBirthdayToAge(animal.Info.birthday).months + '個月' : '' }})</li>
            <li v-else class="col-span-2 text-sm text-gray-800"></li>

            <li class="text-sm font-medium text-primary-900">性別：</li>
            <li class="col-span-2 text-sm text-gray-800" v-html="animal.Info.gender === 'male' ? `<i class='text-primary-600 fa-solid fa-mars'></i>` : `<i class='text-pink-600 fa-solid fa-venus'></i>`"></li>
            <li class="text-sm font-medium text-primary-900">血型：</li>
            <li class="col-span-2 text-sm text-gray-800">{{ animal.Info.bloodType }} 型</li>
            <li class="text-sm font-medium text-primary-900">體重：</li>
            <li class="col-span-2 text-sm text-gray-800">{{ animal.Info.weight ? animal.Info.weight[animal.Info.weight.length - 1].value : '' }} 公斤</li>
            <li class="text-sm font-medium text-primary-900">品種：</li>
            <li class="col-span-2 text-sm text-gray-800">{{ animal.Info.breed }}</li>
            <li class="text-sm font-medium text-primary-900">結紮：</li>
            <li class="col-span-2 text-sm text-gray-800" v-html="animal.Info.sterilized ? `<i class='text-green-500 fa-solid fa-check'></i>` : `<i class='text-red-600 fa-solid fa-x'></i>`"></li>
            <li class="text-sm font-medium text-primary-900">胰島素品牌：</li>
            <li class="col-span-2 text-sm text-gray-800">{{ animal.Info.insulinBrand }}</li>
          </ul>
        </div>
      </div>
      <div class="grid-cols-1 rounded-lg overflow-hidden shadow-lg bg-white p-4 lg:p-6 h-full min-h-[300px]">
        <Mychart :chartData="weightChartData" :chartOptions="chartOptions"></Mychart>
      </div>
    </div>
    <!-- 日曆 -->
    <div class="rounded-lg shadow-lg bg-white mt-4 p-2 lg:p-4 lg:min-h-[1200px] min-h-[800px]">
      <div class="flex justify-center space-x-4">
        <!-- 日曆按鈕 -->
        <label for="calendarDisplay-day" @click="calendarDisplay = 'month'">
          <input id="calendarDisplay-day" type="radio" name="calendar" value="day" class="hidden peer" :checked="calendarDisplay === 'month'" />
          <span class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 text-primary-800 bg-primary-100 peer-checked:bg-primary-500 peer-checked:text-white"> <i class="fa-solid fa-calendar-days"></i> </span>
        </label>
        <!-- 月曆按鈕 -->
        <label for="calendarDisplay-month" @click="calendarDisplay = 'week'">
          <input id="calendarDisplay-month" type="radio" name="calendar" value="month" class="hidden peer" :checked="calendarDisplay === 'week'" />
          <span class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 text-primary-800 bg-primary-100 peer-checked:bg-primary-500 peer-checked:text-white"> <i class="fa-regular fa-calendar"></i> </span>
        </label>
      </div>
      <!-- xx月血糖表 -->

      <!-- 日曆格子 -->
      <div v-if="calendarDisplay == 'month'" class="grid grid-cols-2 col-span-7 gap-1 mt-2 lg:grid-cols-7">
        <div class="flex items-center justify-center col-span-2 py-3 text-2xl font-bold select-none text-primary-900 lg:col-span-7">
          <button type="button" class="text-primary-600 hover:text-primary-700" @click="prevMonth">
            <i class="text-4xl fa-solid fa-caret-left"></i>
          </button>
          <span class="px-4">{{ this.currentDate.year }} 年 {{ this.currentDate.month }} 月 血糖表</span>
          <button type="button" class="text-primary-600 hover:text-primary-700" @click="nextMonth">
            <i class="text-4xl fa-solid fa-caret-right"></i>
          </button>
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
          <div v-if="day.day" :key="day.isoDate" class="p-2 m-1 rounded-lg select-none bg-primary-200 text-primary-900">
            <div class="font-bold text-center">{{ day.month }} / {{ day.day }}{{ day.records?.length > 2 ? '*' : '' }}</div>
            <!-- 早上 -->
            <div class="p-2 mb-2 rounded-md bg-primary-100 hover:bg-primary-300">
              <div class="text-center text-primary-900"><i class="fa-regular fa-sun"></i> {{ calendar[index].morning.time }}</div>
              <div :class="['w-full p-1 mt-1 text-sm border border-gray-300 rounded select-none', bloodColor(calendar[index].morning.bloodSugar)]">
                <i class="fa-solid fa-droplet w-[14px]"></i> : <span class="">{{ calendar[index].morning.bloodSugar ? calendar[index].morning.bloodSugar : '---' }}</span>
              </div>
              <div class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none"><i class="fa-solid fa-syringe"></i> : {{ calendar[index].morning.insulin || calendar[index].morning.insulin === 0 ? calendar[index].morning.insulin + ' 小格' : '---' }}</div>
            </div>
            <!-- 晚上 -->
            <div class="p-2 rounded-md bg-primary-100 hover:bg-primary-300">
              <div class="text-center text-primary-900"><i class="fa-regular fa-moon"></i> {{ calendar[index].evening.time }}</div>
              <div :class="['w-full p-1 mt-1 text-sm border border-gray-300 rounded select-none', bloodColor(calendar[index].evening.bloodSugar)]">
                <i class="fa-solid fa-droplet w-[14px]"></i> : <span>{{ calendar[index].evening.bloodSugar ? calendar[index].evening.bloodSugar : '---' }}</span>
              </div>
              <div class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none'"><i class="fa-solid fa-syringe"></i> : {{ calendar[index].evening.insulin || calendar[index].evening.insulin === 0 ? calendar[index].evening.insulin + ' 小格' : '---' }}</div>
            </div>
          </div>
          <div v-else :key="index" :class="['p-2 m-1 rounded-md h-[264px] hidden lg:grid', { lazyLoading: day.loading }]"></div>
        </template>
      </div>
      <template v-else>
        <div class="mb-4 text-center">
          <select v-model="selectedMonth" class="px-4 py-2 border rounded-md" @change="goToFirstWeekOfSelectedMonth">
            <option v-for="month in months" :key="month.value" :value="month.value">
              {{ month.label }}
            </option>
          </select>
        </div>
        <div class="flex items-center justify-center gap-4 mb-4">
          <button class="px-4 py-2 text-white bg-blue-500 rounded-md" @click="goToPrevWeek">前週</button>
          <div class="text-xl font-bold text-center">本周：{{ weekRange }}</div>
          <button class="px-4 py-2 text-white bg-blue-500 rounded-md" @click="goToNextWeek">下週</button>
        </div>

        <div class="grid grid-cols-7 gap-4 p-4 rounded-lg shadow-md bg-gray-50">
          <div v-for="day in weekData" :key="day.date" :class="['p-4 border rounded-lg shadow-sm', day.isToday ? 'bg-blue-100 border-blue-500' : 'bg-white']">
            <!-- 日期與星期 -->
            <div class="mb-3 text-sm font-semibold text-center text-gray-700">{{ day.date }} ({{ day.day }})</div>
            <!-- 新增事項按鈕 -->
            <button class="w-full px-2 py-2 mb-3 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300" @click="addTask(day)">+ 新增事項</button>
            <!-- 事項清單 -->
            <ul class="space-y-2">
              <li v-for="(task, index) in day.tasks" :key="index" class="p-3 text-sm bg-gray-100 border border-gray-300 rounded-lg">
                <div class="mb-1 text-gray-800">🕒 {{ task.time }}</div>
                <div class="text-gray-600"><span class="font-semibold">血糖：</span> {{ task.bloodSugar }}</div>
                <div class="text-gray-600"><span class="font-semibold">胰島素：</span> {{ task.insulin }}</div>
                <div class="text-gray-600"><span class="font-semibold">備註：</span> {{ task.notes }}</div>
              </li>
            </ul>
          </div>
        </div>

        <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div class="p-6 bg-white rounded-md shadow-lg w-96">
            <h3 class="mb-4 text-lg font-semibold">新增事項</h3>
            <div class="mb-4">
              <label class="block mb-1 text-sm font-medium">時間</label>
              <input v-model="newTask.time" type="time" class="w-full p-2 border rounded" />
            </div>
            <div class="mb-4">
              <label class="block mb-1 text-sm font-medium">內容</label>
              <input v-model="newTask.content" type="text" placeholder="輸入事項內容" class="w-full p-2 border rounded" />
            </div>
            <div class="flex justify-end gap-4">
              <button class="px-4 py-2 text-gray-700 bg-gray-300 rounded" @click="closeModal">取消</button>
              <button class="px-4 py-2 text-white bg-blue-500 rounded" @click="saveTask">儲存</button>
            </div>
          </div>
        </div>
      </template>
    </div>
    <div>
      <div v-for="chart in sugarCurveChart" :key="chart.date" class="rounded-lg overflow-hidden shadow-lg bg-white mt-6 p-4 h-[350px] w-full">
        <Mychart :chartData="chart.chartData" :chartOptions="chart.chartOption"></Mychart>
      </div>
    </div>
    <!-- 快速紀錄 -->
    <div v-if="window.quick.toggle" class="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-70">
      <div class="bg-white p-4 lg:p-8 rounded-xl shadow-2xl text-center w-[90%] max-w-2xl">
        <VForm @submit="createQuick">
          <h2 class="mb-2 text-xl font-bold text-gray-800">快速記錄</h2>
          <div class="grid items-center grid-cols-2 gap-4 p-2 rounded-md shadow-md">
            <VField v-model="window.quick.value.bloodSugar" name="quickBloodSugar" rules="required" placeholder="請輸入血糖值" type="tel" class="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:outline-2 focus:outline-primary-300" autocomplete="off" />
            <select v-model="window.quick.value.insulin" class="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:outline-2 focus:outline-primary-300">
              <option v-for="option in insulinOption" :key="option.value" :value="option.value" :disabled="option.value === null">{{ option.text }}</option>
            </select>
          </div>
          <ErrorMessage class="mt-1 text-sm text-red-600" name="quickBloodSugar" />
          <div class="flex justify-between mt-4">
            <button type="button" class="w-1/3 px-6 py-2 text-gray-700 transition-all bg-gray-300 rounded-lg shadow-md hover:bg-gray-400" @click="window.quick.toggle = false">取消</button>
            <button type="submit" :class="['w-1/3 px-6 py-2 text-white transition-all bg-primary-600 rounded-lg shadow-md hover:bg-primary-700', { lazyLoading: window.quick.loading }]">確定</button>
          </div>
        </VForm>
      </div>
    </div>
    <!-- 體重視窗 -->
    <div v-if="window.weight.toggle" class="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-70">
      <div class="bg-white p-4 lg:p-8 rounded-xl shadow-2xl text-center w-[90%] max-w-2xl">
        <VForm @submit="createWeight">
          <h2 class="mb-2 text-xl font-semibold text-gray-800">新增體重紀錄</h2>
          <div class="grid grid-cols-[1fr_1fr] lg:grid-cols-2 items-center border p-2 rounded-md shadow-md">
            <VField v-model="window.weight.date" name="weightDate" rules="required" type="date" class="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:outline-2 focus:outline-primary-300" />
            <VField v-model="window.weight.value" name="weightValue" rules="required" type="number" placeholder="輸入體重" class="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:outline-2 focus:outline-primary-300" autocomplete="off" />
            <div>
              <ErrorMessage class="text-sm text-red-600" name="weightDate" />
            </div>
            <div>
              <ErrorMessage class="text-sm text-red-600" name="weightValue" />
            </div>
          </div>

          <div class="flex justify-between mt-4">
            <button type="button" class="w-1/3 px-6 py-2 text-gray-700 transition-all bg-gray-300 rounded-lg shadow-md hover:bg-gray-400" @click="window.weight.toggle = false">取消</button>
            <button type="submit" :class="['w-1/3 px-6 py-2 text-white transition-all bg-primary-600 rounded-lg shadow-md hover:bg-primary-700', { lazyLoading: window.weight.loading }]">確定</button>
          </div>
        </VForm>
      </div>
    </div>
    <!-- 血糖曲線視窗 -->
    <div v-if="window.sugarCurve.toggle" class="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-70">
      <div class="bg-white p-4 lg:p-8 rounded-xl shadow-2xl text-center w-[90%] max-w-2xl">
        <h2 class="mb-2 text-xl font-semibold text-gray-800">建立血糖曲線</h2>
        <fieldset class="grid items-center grid-cols-1 gap-4 p-2 mb-5 border rounded-md shadow-md">
          <legend><h2>日期</h2></legend>
          <input ref="sugarCurveDate" v-model="window.sugarCurve.date" type="date" class="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:outline-2 focus:outline-primary-300" @focus="$refs.sugarCurveDate.showPicker()" />
        </fieldset>
        <div v-for="(field, index) in window.sugarCurve.fields" :key="index" class="mb-6 space-y-4">
          <div class="grid grid-cols-[2fr_2fr_0.5fr] gap-4 items-center border p-2 rounded-md shadow-md">
            <input v-model="field.time" type="time" name="sugarCurveTime" class="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:outline-2 focus:outline-primary-300" autocomplete="off" />
            <input v-model="field.value" type="number" name="sugarCurveBloodSugar" placeholder="血糖" class="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:outline-2 focus:outline-primary-300" autocomplete="off" />
            <button type="button" class="px-2 py-1 font-semibold text-white bg-red-500 rounded-md hover:bg-red-600" @click="window.sugarCurve.fields.splice(index, 1)">X</button>
          </div>
        </div>
        <div class="flex justify-center mb-6">
          <button type="button" class="flex items-center px-6 py-2 font-medium text-white transition-all bg-green-500 rounded-lg shadow-md hover:bg-green-400" @click="window.sugarCurve.fields.push({ time: '', value: '' })"><i class="mr-2 fa-solid fa-plus"></i> 新增欄位</button>
        </div>
        <div class="flex justify-between">
          <button type="button" class="w-1/3 px-6 py-2 text-gray-700 transition-all bg-gray-300 rounded-lg shadow-md hover:bg-gray-400" @click="window.sugarCurve.toggle = false">取消</button>
          <button type="submit" :class="['w-1/3 px-6 py-2 text-white transition-all bg-primary-600 rounded-lg shadow-md hover:bg-primary-700', { lazyLoading: window.sugarCurve.loading }]" @click="createSugarCurve">確定</button>
        </div>
      </div>
    </div>
    <div class="fixed z-10 space-y-4 right-6 bottom-6">
      <button type="button" class="flex items-center justify-center text-black bg-green-400 rounded-full shadow-md w-14 h-14" @click="window.quick.toggle = true">
        <i class="fa-solid fa-plus"></i>
      </button>
      <button type="button" class="flex items-center justify-center text-black bg-yellow-200 rounded-full shadow-md w-14 h-14" @click="window.weight.toggle = true">
        <i class="fa-solid fa-weight-scale"></i>
      </button>
      <button type="button" class="flex items-center justify-center text-black bg-pink-300 rounded-full shadow-md w-14 h-14" @click="window.sugarCurve.toggle = true">
        <i class="fa-solid fa-chart-line"></i>
      </button>
    </div>
  </div>
</template>
