<script>
import LineChartComponent from '@/components/LineChartComponent.vue'
import axios from 'axios'
import { Field, Form, ErrorMessage } from 'vee-validate'
export default {
  components: { LineChartComponent, VField: Field, VForm: Form, ErrorMessage },
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
      newtoday: { date: '', year: '', month: '', day: '', lastDay: '' },
      calendarDisplay: 'week',
      calendar: Array.from({ length: 42 }, () => ({ loading: true })),
      insulinOption: [
        { value: '', text: '請選擇劑量' },
        { value: 0, text: '0 小格' },
        { value: 0.5, text: '0.5 小格' },
        { value: 1, text: '1 小格' },
        { value: 1.5, text: '1.5 小格' },
      ],
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
      },
      weekRange: '',
      weekData: [],
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
      editRecord: { recordId: '', taskId: '', task: { time: '', bloodSugar: '', insulin: '', notes: '' }, notes: '' },
      showTooltip: false,
      hoverData: [],
      tooltipStyle: {
        top: '0px',
        left: '0px',
      },
    }
  },
  methods: {
    showTips(event, record) {
      this.hoverData = record
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
    },
    async getAnimalInfo() {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_PATH}/animal/detail/${this.animal.Id}`)
        this.animal.Info = data
        this.weightChart.data.labels = data.weight.map(x => new Date(x.date).toISOString().slice(0, 10))
        this.weightChart.data.datasets[0].data = data.weight.map(x => x.value)
      } catch (error) {
        this.$toast.error(error.response.data.message)
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
    async getDiaryBloodSugar() {
      try {
        const { year, month, lastDay } = this.newtoday
        const { data } = await axios.get(`${import.meta.env.VITE_API_PATH}/bloodSugar/diary`, {
          params: {
            animalId: this.animal.Id,
            startDate: `${year}-${month + 1}-01`,
            endDate: `${year}-${month + 1}-${lastDay}`,
          },
        })
        this.animal.diaryBloodSugar = data
        return data
      } catch (error) {
        this.$toast.error(error.response.data.message)
      }
    },
    async createWeight() {
      const { date, value } = this.modal.weight
      const { Id: animalId } = this.animal
      const payload = {
        animalId,
        date,
        value,
      }
      this.modal.weight.loading = true
      try {
        const { data } = await axios.post(`${import.meta.env.VITE_API_PATH}/animal/createWeight`, payload, {
          headers: { 'Content-Type': 'application/json' },
        })
        this.weightChart.data.labels = data.weight.map(x => new Date(x.date).toISOString().slice(0, 10))
        this.weightChart.data.datasets[0].data = data.weight.map(x => x.value)
        this.$toast.success(data.message)
        this.modal.weight.toggle = false
        this.modal.weight.value = ''
      } catch (error) {
        this.$toast.error(error.response.data.message)
      } finally {
        this.modal.weight.loading = false
      }
    },
    async createBloodSugarCurve() {
      const { date, fields } = this.modal.bloodSugarCurve
      const { Id: animalId } = this.animal
      const payload = {
        animalId,
        date,
        records: fields,
      }
      this.modal.bloodSugarCurve.loading = true
      try {
        await axios.post(`${import.meta.env.VITE_API_PATH}/bloodSugar/createCurve`, payload, {
          headers: { 'Content-Type': 'application/json' },
        })
        this.$toast.success('新增血糖曲線成功')
        await this.updateBloodSugarCurveChart()
        this.modal.bloodSugarCurve.toggle = false
        this.modal.bloodSugarCurve.fields = [{ time: '', value: '' }]
      } catch (error) {
        this.$toast.error(error.response.data.message)
      } finally {
        this.modal.bloodSugarCurve.loading = false
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
    bloodSugarColor(value) {
      if (value === '' || value === null || value === undefined) {
        return 'bg-white'
      }
      if (value >= 0 && value <= 249) {
        return 'bg-green-100'
      }
      if (value >= 250 && value <= 399) {
        return 'bg-yellow-100'
      }
      if (value >= 400) {
        return 'bg-red-100'
      }
    },
    async saveTask() {
      try {
        const payload = {
          animalId: this.animal.Id,
          date: this.newRecord.date,
          records: [
            {
              time: this.newRecord.time,
              bloodSugar: this.newRecord.bloodSugar,
              insulin: this.newRecord.insulin,
              notes: this.newRecord.notes,
            },
          ],
          notes: '',
        }
        const { data } = await axios.post(`${import.meta.env.VITE_API_PATH}/bloodSugar/create`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        this.$toast.success(data.message)
        await this.getWeekBloodSugarData()
        this.updateCalendar()
      } catch (error) {
        this.$toast.error(error.response.data.message)
      } finally {
        this.closeModal()
      }
    },
    closeModal() {
      this.modal.addNotes.toggle = false
      this.newRecord = { date: '', time: '', bloodSugar: '', insulin: '', notes: '' }
    },
    async getWeekBloodSugarData() {
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
    editTask(recordId, taskId, time, bloodSugar, insulin, recordNotes, notes) {
      this.editRecord = {
        recordId,
        taskId,
        task: {
          time,
          bloodSugar,
          insulin,
          notes: recordNotes,
        },
        notes,
      }
      this.modal.editNotes.toggle = true
    },
    async saveEditTask() {
      try {
        const payload = {
          animalId: this.animal.Id,
          taskId: this.editRecord.taskId,
          task: this.editRecord.task,
          notes: this.editRecord.notes,
        }
        const { data } = await axios.put(`${import.meta.env.VITE_API_PATH}/bloodSugar/update/${this.editRecord.recordId}`, payload)
        this.$toast.success(data.message)
        this.updateWeekData()
        this.updateCalendar()
      } catch (error) {
        this.$toast.error(error.response.data.message)
      } finally {
        this.modal.editNotes.toggle = false
      }
    }, // 日期處理區
    async updateCalendar() {
      const { year, month, lastDay } = this.newtoday
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
          isToday: date.split('T')[0] === new Date().toISOString().split('T')[0] ? true : false,
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
      const startOfWeek = this.getStartOfWeek(this.newtoday.date)
      startOfWeek.setDate(startOfWeek.getDate() + 1) //0 ~ 6 +1天
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      this.weekRange = `${startOfWeek.toISOString().split('T')[0]} ~ ${endOfWeek.toISOString().split('T')[0]}`
      this.weekData = this.getWeekData(startOfWeek)
    },
    getStartOfWeek(date) {
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
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        weekData.push({
          date: date.toISOString().split('T')[0],
          day: daysOfWeek[i],
          records: [],
          isToday: date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0],
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
        this.newtoday.year = this.newtoday.date.getFullYear()
        this.newtoday.month = this.newtoday.date.getMonth()
        this.newtoday.day = this.newtoday.date.getDate()
        this.newtoday.lastDay = new Date(this.newtoday.date.getFullYear(), this.newtoday.date.getMonth() + 1, 0).getDate()
        this.updateCalendar()
      },
    },
    weekData: {
      handler() {
        this.getWeekBloodSugarData()
      },
    },
  },
  async mounted() {
    this.newtoday.date = new Date()
    await this.getAnimalInfo()
    this.updateWeekData()
    this.selectedMonth = this.newtoday.date.getMonth()
    this.selectedYear = this.newtoday.date.getFullYear()
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
            <li class="col-span-2 text-sm text-gray-800" v-html="animal.Info.type === 'dog' ? `<i class='fa-solid fa-dog fa-fw'></i>` : `<i class='fa-solid fa-cat fa-fw'></i>`"></li>
            <li class="text-sm font-medium text-primary-900">生日：</li>
            <li v-if="animal.Info.birthday !== '1970-01-01T00:00:00.000Z'" class="col-span-2 text-sm text-gray-800">{{ animal.Info.birthday ? new Date(animal.Info.birthday).toISOString().slice(0, 10) : '' }} ({{ convertBirthdayToAge(animal.Info.birthday).years }}歲 {{ convertBirthdayToAge(animal.Info.birthday).months > 0 ? convertBirthdayToAge(animal.Info.birthday).months + '個月' : '' }})</li>
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
      <div class="grid-cols-1 rounded-lg overflow-hidden shadow-lg bg-white p-4 lg:p-6 h-full min-h-[300px]">
        <LineChartComponent :chartData="weightChart.data" :chartOptions="weightChart.option"></LineChartComponent>
      </div>
    </div>
    <!-- 日曆 -->
    <div class="rounded-lg shadow-lg bg-white mt-4 p-2 lg:p-4 lg:min-h-[1200px] min-h-[800px]">
      <!-- 切換按鈕 -->
      <div class="flex items-center justify-around">
        <div class="w-1/3 flex items-center justify-center h-[50px] space-x-4">
          <label for="calendarDisplay-day" @click="calendarDisplay = 'month'">
            <input id="calendarDisplay-day" type="radio" name="calendar" value="day" class="hidden peer" :checked="calendarDisplay === 'month'" />
            <span class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 text-primary-800 bg-primary-100 peer-checked:bg-primary-500 peer-checked:text-white"> <i class="fa-solid fa-calendar-days fa-fw"></i> </span>
          </label>
          <label for="calendarDisplay-month" @click="calendarDisplay = 'week'">
            <input id="calendarDisplay-month" type="radio" name="calendar" value="month" class="hidden peer" :checked="calendarDisplay === 'week'" />
            <span class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 text-primary-800 bg-primary-100 peer-checked:bg-primary-500 peer-checked:text-white"> <i class="fa-regular fa-calendar fa-fw"></i> </span>
          </label>
        </div>
        <div class="w-1/3 space-x-6 text-center">
          <select v-model="selectedYear" class="p-2 w-[100px] border rounded-lg shadow-sm border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300" @change="goToFirstWeekOfSelectedMonth">
            <option v-for="year in years" :key="year.value" :value="year.value">
              {{ year.label }}
            </option>
          </select>
          <select v-model="selectedMonth" class="p-2 w-[100px] text-center border rounded-lg shadow-sm border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300" @change="goToFirstWeekOfSelectedMonth">
            <option v-for="month in months" :key="month.value" :value="month.value">
              {{ month.label }}
            </option>
          </select>
        </div>
        <div v-if="calendarDisplay === 'week'" class="w-1/3 flex items-center justify-center h-[50px] space-x-4">
          <button class="px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600" @click="prevWeek"><i class="fa-solid fa-circle-left fa-fw"></i> 上週</button>
          <button class="px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600" @click="nextWeek">下週 <i class="fa-solid fa-circle-right fa-fw"></i></button>
        </div>
        <div v-else class="w-1/3 flex items-center justify-center h-[50px] space-x-4">
          <button class="px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600" @click="prevMonth"><i class="fa-solid fa-circle-left fa-fw"></i> 前月</button>
          <button class="px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600" @click="nextMonth">下月 <i class="fa-solid fa-circle-right fa-fw"></i></button>
        </div>
      </div>
      <!-- 日曆格子 -->
      <div v-if="calendarDisplay == 'month'" class="grid grid-cols-2 col-span-7 gap-1 lg:grid-cols-7">
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
          <div v-if="day.day" :key="day.isoDate" :class="['p-2 m-1 rounded-lg select-none bg-primary-200 text-primary-900', { 'bg-primary-400': day.isToday, 'cursor-pointer': day.records?.length > 2 }]" @click="day.records?.length > 2 ? showTips($event, day?.records) : null">
            <div class="font-bold text-center">{{ day.month }} / {{ day.day }} {{ day.records?.length > 2 ? '*' : '' }}</div>
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
        <template v-if="showTooltip">
          <div class="absolute p-4 border rounded-lg shadow-lg border-primary-300 bg-primary-50" :style="tooltipStyle">
            <button class="absolute text-primary-500 top-2 right-2 hover:text-primary-700" @click="showTooltip = false">
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
        </template>
      </div>

      <template v-else>
        <div class="col-span-2 py-3 text-2xl font-bold text-center select-none text-primary-900 lg:col-span-7">{{ weekRange }}</div>
        <div class="grid grid-cols-7 gap-2 p-4 rounded-lg shadow-md bg-gray-50">
          <div v-for="day in weekData" :key="day.date" :class="['p-4 border rounded-lg shadow-sm min-h-[1000px]', day.isToday ? 'border-primary-500' : 'bg-white']">
            <!-- 日期與星期 -->
            <div class="mb-2 text-sm font-semibold text-center text-gray-700">{{ day.date }} ({{ day.day }})</div>
            <!-- 新增事項按鈕 -->
            <button class="w-full px-2 py-1.5 mb-2 text-sm text-white rounded-md bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300" @click="((newRecord.date = day.date), (modal.addNotes.toggle = true))">+ 新增事項</button>
            <!-- 事項清單 -->
            <ul class="space-y-2">
              <li v-for="(task, index) in day.records" :key="index" class="p-3 text-sm bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-primary-100" @click="editTask(day._id, task._id, task.time, task.bloodSugar, task.insulin, task.notes, day.notes)">
                <div class="mb-1 text-center text-gray-800">🕒{{ task.time }}</div>
                <div v-if="task.bloodSugar" class="text-gray-600">
                  <i class="fa-solid fa-droplet fa-fw"></i> :
                  {{ task.bloodSugar }}
                </div>
                <div v-if="task.insulin" class="text-gray-600">
                  <i class="fa-solid fa-syringe fa-fw"></i> :
                  {{ task.insulin }}
                </div>
                <div v-if="task.notes" class="text-gray-600">
                  <i class="fa-regular fa-comment-dots fa-fw"></i> :
                  {{ task.notes }}
                </div>
              </li>
            </ul>
          </div>
        </div>
        <!-- 新增事項 -->
        <div v-if="modal.addNotes.toggle" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div class="p-6 bg-white rounded-md shadow-lg w-96">
            <VForm @submit="saveTask">
              <h3 class="mb-4 text-lg font-semibold">新增事項</h3>
              <div class="mb-4">
                <label class="block mb-1 text-sm font-medium">時間</label>
                <VField v-model="newRecord.time" rules="required" name="time" type="time" class="w-full p-2 border rounded" />
                <ErrorMessage name="time" class="mt-1 text-sm text-red-500" />
              </div>
              <div class="mb-4">
                <label class="block mb-1 text-sm font-medium">血糖</label>
                <VField v-model="newRecord.bloodSugar" name="bloodSugar" rules="atLeastOneFieldRule:@insulin,@notes" type="text" placeholder="輸入血糖(選填)" class="w-full p-2 border rounded" autocomplete="off" />
                <ErrorMessage name="bloodSugar" class="mt-1 text-sm text-red-500" />
              </div>
              <div class="mb-4">
                <label class="block mb-1 text-sm font-medium">胰島素</label>
                <VField v-model="newRecord.insulin" name="insulin" rules="atLeastOneFieldRule:@bloodSugar,@notes" type="text" placeholder="輸入胰島素(選填)" class="w-full p-2 border rounded" autocomplete="off" />
                <ErrorMessage name="insulin" class="mt-1 text-sm text-red-500" />
              </div>
              <div class="mb-4">
                <label class="block mb-1 text-sm font-medium">備註</label>
                <VField v-model="newRecord.notes" name="notes" rules="atLeastOneFieldRule:@bloodSugar,@insulin" type="text" placeholder="輸入備註(選填)" class="w-full p-2 border rounded" autocomplete="off" />
                <ErrorMessage name="notes" class="mt-1 text-sm text-red-500" />
              </div>
              <div class="flex justify-end gap-4">
                <button type="button" class="px-4 py-2 text-gray-700 bg-gray-300 rounded" @click="closeModal">取消</button>
                <button type="submit" class="px-4 py-2 text-white rounded bg-primary-500">新增</button>
              </div>
            </VForm>
          </div>
        </div>
        <div v-if="modal.editNotes.toggle" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div class="p-6 bg-white rounded-md shadow-lg w-96">
            <VForm @submit="saveEditTask">
              <h3 class="mb-4 text-lg font-semibold">編輯事項</h3>
              <div class="mb-4">
                <label class="block mb-1 text-sm font-medium">時間</label>
                <VField v-model="editRecord.task.time" rules="required" name="time" type="time" class="w-full p-2 border rounded" />
                <ErrorMessage name="time" class="mt-1 text-sm text-red-500" />
              </div>
              <div class="mb-4">
                <label class="block mb-1 text-sm font-medium">血糖</label>
                <VField v-model="editRecord.task.bloodSugar" name="bloodSugar" rules="atLeastOneFieldRule:@insulin,@notes" type="text" placeholder="輸入血糖(選填)" class="w-full p-2 border rounded" autocomplete="off" />
                <ErrorMessage name="bloodSugar" class="mt-1 text-sm text-red-500" />
              </div>
              <div class="mb-4">
                <label class="block mb-1 text-sm font-medium">胰島素</label>
                <VField v-model="editRecord.task.insulin" name="insulin" rules="atLeastOneFieldRule:@bloodSugar,@notes" type="text" placeholder="輸入胰島素(選填)" class="w-full p-2 border rounded" autocomplete="off" />
                <ErrorMessage name="insulin" class="mt-1 text-sm text-red-500" />
              </div>
              <div class="mb-4">
                <label class="block mb-1 text-sm font-medium">備註</label>
                <VField v-model="editRecord.task.notes" name="notes" rules="atLeastOneFieldRule:@bloodSugar,@insulin" type="text" placeholder="輸入備註(選填)" class="w-full p-2 border rounded" autocomplete="off" />
                <ErrorMessage name="notes" class="mt-1 text-sm text-red-500" />
              </div>
              <div class="flex justify-end gap-4">
                <button type="button" class="px-4 py-2 text-gray-700 bg-gray-300 rounded" @click="modal.editNotes.toggle = false">取消</button>
                <button type="submit" class="px-4 py-2 text-white rounded bg-primary-500">修改</button>
              </div>
            </VForm>
          </div>
        </div>
      </template>
    </div>
    <div>
      <div v-for="chart in bloodSugarCurveChart" :key="chart.date" class="rounded-lg overflow-hidden shadow-lg bg-white mt-6 p-4 h-[350px] w-full">
        <LineChartComponent :chartData="chart.data" :chartOptions="chart.option"></LineChartComponent>
      </div>
    </div>
    <!-- 體重視窗 -->
    <div v-if="modal.weight.toggle" class="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-70">
      <div class="bg-white p-4 lg:p-8 rounded-xl shadow-2xl text-center w-[90%] max-w-2xl">
        <VForm @submit="createWeight">
          <h2 class="mb-2 text-xl font-semibold text-gray-800">新增體重紀錄</h2>
          <div class="grid grid-cols-[1fr_1fr] gap-x-4 lg:grid-cols-2 items-center border p-2 rounded-md shadow-md">
            <VField v-model="modal.weight.date" name="weightDate" rules="required" type="date" class="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:outline-2 focus:outline-primary-300" />
            <VField v-model="modal.weight.value" name="weightValue" rules="required" type="number" placeholder="輸入體重" class="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:outline-2 focus:outline-primary-300" autocomplete="off" />
            <div>
              <ErrorMessage class="text-sm text-red-600" name="weightDate" />
            </div>
            <div>
              <ErrorMessage class="text-sm text-red-600" name="weightValue" />
            </div>
          </div>

          <div class="flex justify-between mt-4">
            <button type="button" class="w-1/3 px-6 py-2 text-gray-700 transition-all bg-gray-300 rounded-lg shadow-md hover:bg-gray-400" @click="modal.weight.toggle = false">取消</button>
            <button type="submit" :class="['w-1/3 px-6 py-2 text-white transition-all bg-primary-600 rounded-lg shadow-md hover:bg-primary-700', { lazyLoading: modal.weight.loading }]">確定</button>
          </div>
        </VForm>
      </div>
    </div>
    <!-- 血糖曲線視窗 -->
    <div v-if="modal.bloodSugarCurve.toggle" class="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-70">
      <div class="bg-white p-4 lg:p-8 rounded-xl shadow-2xl text-center w-[90%] max-w-2xl">
        <VForm @submit="createBloodSugarCurve">
          <h2 class="mb-2 text-xl font-semibold text-gray-800">建立血糖曲線</h2>
          <VField v-model="modal.bloodSugarCurve.date" name="bloodSugarCurveDate" rules="required" type="date" class="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:outline-2 focus:outline-primary-300" />
          <ErrorMessage class="text-sm text-red-600" name="bloodSugarCurveDate" />
          <div v-for="(field, index) in modal.bloodSugarCurve.fields" :key="index" class="my-4 space-y-4">
            <div class="grid grid-cols-[2fr_2fr_0.5fr] gap-4 items-center border p-2 rounded-md shadow-md">
              <input v-model="field.time" type="time" name="sugarCurveTime" class="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:outline-2 focus:outline-primary-300" autocomplete="off" />
              <input v-model="field.value" type="number" name="sugarCurveBloodSugar" placeholder="血糖" class="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:outline-2 focus:outline-primary-300" autocomplete="off" />
              <button type="button" class="px-2 py-1 font-semibold text-white bg-red-500 rounded-md hover:bg-red-600" @click="modal.bloodSugarCurve.fields.splice(index, 1)">X</button>
            </div>
          </div>
          <div class="flex justify-center mb-6">
            <button type="button" class="flex items-center px-6 py-2 font-medium text-white transition-all bg-green-500 rounded-lg shadow-md hover:bg-green-400" @click="modal.bloodSugarCurve.fields.push({ time: '', value: '' })"><i class="mr-2 fa-solid fa-plus fa-fw"></i> 新增欄位</button>
          </div>
          <div class="flex justify-between">
            <button type="button" class="w-1/3 px-6 py-2 text-gray-700 transition-all bg-gray-300 rounded-lg shadow-md hover:bg-gray-400" @click="modal.bloodSugarCurve.toggle = false">取消</button>
            <button type="submit" :class="['w-1/3 px-6 py-2 text-white transition-all bg-primary-600 rounded-lg shadow-md hover:bg-primary-700', { lazyLoading: modal.bloodSugarCurve.loading }]">確定</button>
          </div>
        </VForm>
      </div>
    </div>
    <div class="fixed z-10 space-y-4 right-6 bottom-6">
      <button type="button" class="flex items-center justify-center text-black bg-yellow-200 rounded-full shadow-md w-14 h-14" @click="modal.weight.toggle = true">
        <i class="fa-solid fa-weight-scale fa-fw"></i>
      </button>
      <button type="button" class="flex items-center justify-center text-black bg-pink-300 rounded-full shadow-md w-14 h-14" @click="modal.bloodSugarCurve.toggle = true">
        <i class="fa-solid fa-chart-line fa-fw"></i>
      </button>
    </div>
  </div>
</template>
