<script>
import apiStore from '@/stores/api'
import { mapState } from 'pinia'
import Mychart from '@/components/Mychart.vue'
export default {
  components: { Mychart },
  data() {
    return {
      animal: { Id: this.$route.params.id, Info: {}, diaryBloodSugar: [] },
      chartData: {
        labels: [],
        datasets: [
          {
            label: '體重',
            data: [],
            borderColor: 'rgb(147, 197, 253)',
            backgroundColor: 'rgba(147, 197, 253, 0.6)',
            tension: 0,
            pointRadius: 8,
            pointHoverRadius: 15,
          },
        ],
      },
      chartOptions: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `體重走勢圖`,
          },
          legend: {
            display: false,
            position: 'top',
          },
          datalabels: {
            display: true,
            color: '#0080FF',
            font: {
              weight: 'bold',
              size: 16,
            },
            align: 'top',
            formatter: value => value.toFixed(1),
          },
        },
      },
      chartType: 'line',
      today: new Date(),
      currentDate: this.getToday(),
      calendar: Array.from({ length: 42 }, () => ({ loading: true })),
      insulinOption: [
        { value: null, text: '請選擇劑量' },
        { value: 0, text: '0 小格' },
        { value: 0.5, text: '0.5 小格' },
        { value: 1, text: '1 小格' },
        { value: 1.5, text: '1.5 小格' },
      ],
      window: {
        quick: { value: { bloodSugar: '', insulin: '' }, toggle: false, loading: false },
        weight: { value: '', date: new Date().toISOString().split('T')[0], toggle: false, loading: false },
        sugarCurve: {
          fields: [{ time: '', value: '' }],
          date: new Date().toISOString().split('T')[0],
          toggle: false,
          loading: false,
        },
      },
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
          morning: { bloodSugar: { value: '', isEditing: false, pending: false }, insulin: { value: '', isEditing: false, pending: false } },
          evening: { bloodSugar: { value: '', isEditing: false, pending: false }, insulin: { value: '', isEditing: false, pending: false } },
        }
      })
      const diaryData = await this.getDiaryBloodSugar()
      const mergedDays = days.map(day => {
        const diaryEntry = diaryData.find(entry => new Date(entry.date).toISOString().slice(0, 10) === day.date)
        if (diaryEntry) {
          return Object.assign({}, day, diaryEntry, {
            morning: {
              bloodSugar: {
                value: diaryEntry.morning.bloodSugar,
                isEditing: false,
              },
              insulin: {
                value: diaryEntry.morning.insulin,
                isEditing: false,
              },
            },
            evening: {
              bloodSugar: {
                value: diaryEntry.evening.bloodSugar,
                isEditing: false,
              },
              insulin: {
                value: diaryEntry.evening.insulin,
                isEditing: false,
              },
            },
          })
        }
        return day
      })

      const firstDay = new Date(currentDate.year, currentDate.month - 1, 1).getDay()
      const spaceDay = firstDay === 0 ? 6 : firstDay - 1
      const blankDays = Array.from({ length: spaceDay }, () => ({ date: null })) //補前空格
      const allDays = [...blankDays, ...mergedDays]
      const totalCells = 42
      for (let i = allDays.length; i < totalCells; i++) {
        allDays.push({ date: null })
      } //補後空格

      this.calendar = allDays
      console.log(allDays)
    },
    async getAnimalInfo() {
      try {
        const response = await fetch(`${this.apipath}/animal/detail/${this.animal.Id}`, {
          method: 'GET',
        })
        if (!response.ok) {
          this.$toast.error(response.message)
          return
        }
        const data = await response.json()
        this.animal.Info = data
        this.chartData.labels = data.weight.map(x => new Date(x.date).toISOString().slice(0, 10))
        this.chartData.datasets[0].data = data.weight.map(x => x.value)
      } catch (error) {
        console.error(error.message)
        this.$toast.error('伺服器錯誤')
      }
    },
    async getDiaryBloodSugar() {
      try {
        const response = await fetch(`${this.apipath}/bloodSugar/diary?animalId=${this.animal.Id}&year=${this.currentDate.year}&month=${this.currentDate.month}&dayInMonth=${this.currentDate.dayInMonth}`, {
          method: 'GET',
        })
        if (!response.ok) {
          this.$toast.error(response.message)
          return
        }
        const data = await response.json()
        this.animal.diaryBloodSugar = data
        return data
      } catch (error) {
        console.error(error.message)
        this.$toast.error('伺服器錯誤')
      }
    },
    async createDiaryBloodSugar(date, morningBloodSugar, morningInsulin, eveningBloodSugar, eveningInsulin, notes) {
      try {
        const response = await fetch(`${this.apipath}/bloodSugar/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
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
          }),
        })
        const createResponse = await response.json()
        if (!response.ok) {
          this.$toast.error(createResponse.message)
          return
        }
        this.$toast.success('新增成功')
        await this.updateCalendar()
        return createResponse
      } catch (error) {
        console.error(error)
        this.$toast.error('伺服器錯誤。')
      }
    },
    async createQuick() {
      const { value } = this.window.quick
      console.log(value)
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
        const response = await fetch(`${this.apipath}/animal/createWeight`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const createResponse = await response.json()
        if (!response.ok) {
          this.$toast.error(createResponse.message || '新增失敗')
          return
        }
        this.$toast.success('新增體重成功')
        this.window.weight.toggle = false
      } catch (error) {
        this.$toast.error('伺服器忙碌中，請稍後再試。')
        console.error('createWeight error:', error)
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
      console.log(payload)

      this.window.sugarCurve.loading = true
      try {
        const response = await fetch(`${this.apipath}/bloodSugar/createCurve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const createResponse = await response.json()
        if (!response.ok) {
          this.$toast.error(createResponse.message || '新增失敗')
          return
        }
        this.$toast.success('新增血糖曲線成功')
        this.window.sugarCurve.toggle = false
      } catch (error) {
        this.$toast.error('伺服器忙碌中，請稍後再試。')
        console.error('sugarCurve error:', error)
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
  },
  computed: {
    ...mapState(apiStore, ['apipath']),
  },
  watch: {
    'currentDate.month': {
      handler() {
        this.updateCalendar()
      },
      immediate: true,
    },
  },

  async mounted() {
    await this.getAnimalInfo()
  },
}
</script>

<template>
  <div>
    <div class="grid md:grid-cols-3 gap-4 lg:h-[350px]">
      <div class="h-full overflow-hidden bg-white rounded-lg shadow-lg">
        <!-- <img class="object-cover w-full h-full" src="image/avatar.png" alt="" /> -->
      </div>
      <div class="rounded-lg overflow-hidden shadow-md bg-white p-2 lg:p-4 border border-gray-200 h-full min-h-[300px]">
        <div id="profileCard" class="w-full h-full">
          <h5 class="mb-3 text-lg font-semibold text-blue-500">基本資料</h5>
          <ul class="grid grid-cols-3 list-none gap-x-4 gap-y-3">
            <li class="text-sm font-medium text-gray-600">姓名：</li>
            <li class="col-span-2 text-sm text-gray-800">{{ animal.Info.name }}</li>
            <li class="text-sm font-medium text-gray-600">種類：</li>
            <li class="col-span-2 text-sm text-gray-800" v-html="animal.Info.type === 'dog' ? `<i class='fa-solid fa-dog'></i>` : `<i class='fa-solid fa-cat'></i>`"></li>
            <li class="text-sm font-medium text-gray-600">生日：</li>
            <li class="col-span-2 text-sm text-gray-800">{{ animal.Info.birthday ? new Date(animal.Info.birthday).toISOString().slice(0, 10) : '' }} ({{ convertBirthdayToAge(animal.Info.birthday).years }}歲 {{ convertBirthdayToAge(animal.Info.birthday).months > 0 ? convertBirthdayToAge(animal.Info.birthday).months + '個月' : '' }})</li>
            <li class="text-sm font-medium text-gray-600">性別：</li>
            <li class="col-span-2 text-sm text-gray-800" v-html="animal.Info.gender === 'male' ? `<i class='text-blue-600 fa-solid fa-mars'></i>` : `<i class='text-blue-600 fa-solid fa-venus'></i>`"></li>
            <li class="text-sm font-medium text-gray-600">血型：</li>
            <li class="col-span-2 text-sm text-gray-800">{{ animal.Info.bloodType }} 型</li>
            <li class="text-sm font-medium text-gray-600">體重：</li>
            <li class="col-span-2 text-sm text-gray-800">{{ animal.Info.weight ? animal.Info.weight[animal.Info.weight.length - 1].value : '' }} 公斤</li>
            <li class="text-sm font-medium text-gray-600">品種：</li>
            <li class="col-span-2 text-sm text-gray-800">{{ animal.Info.breed }}</li>
            <li class="text-sm font-medium text-gray-600">結紮：</li>
            <li class="col-span-2 text-sm text-gray-800" v-html="animal.Info.sterilized ? `<i class='text-green-500 fa-solid fa-check'></i>` : `<i class='text-red-500 fa-solid fa-x'></i>`"></li>
            <li class="text-sm font-medium text-gray-600">胰島素品牌：</li>
            <li class="col-span-2 text-sm text-gray-800">{{ animal.Info.insulinBrand }}</li>
          </ul>
        </div>
      </div>
      <div class="grid-cols-1 rounded-lg overflow-hidden shadow-lg bg-white p-2 lg:p-4 h-full min-h-[300px]">
        <Mychart v-if="chartData && chartData.labels.length > 0" :chartType="chartType" :chartData="chartData" :chartOptions="chartOptions"></Mychart>
      </div>
    </div>
    <!-- 日曆 -->
    <div class="rounded-lg overflow-hidden shadow-lg bg-white mt-6 p-2 lg:p-4 lg:min-h-[1200px] min-h-[800px]">
      <h1 class="py-3 text-2xl font-bold text-center text-blue-600 select-none">
        <button class="text-blue-500 hover:text-blue-700" @click="prevMonth">
          <i class="text-3xl fa-solid fa-caret-left"></i>
        </button>
        <span class="px-4">{{ this.currentDate.year }} 年 {{ this.currentDate.month }} 月 血糖表</span>
        <button id="nextMonth" class="text-blue-500 hover:text-blue-700" @click="nextMonth">
          <i class="text-3xl fa-solid fa-caret-right"></i>
        </button>
      </h1>
      <!-- 日曆格子 -->
      <div class="hidden grid-cols-7 gap-1 text-2xl font-semibold text-center text-blue-700 lg:grid">
        <div>一</div>
        <div>二</div>
        <div>三</div>
        <div>四</div>
        <div>五</div>
        <div>六</div>
        <div>日</div>
      </div>
      <div class="grid grid-cols-2 gap-1 mt-2 lg:grid-cols-7">
        <template v-for="(day, index) in calendar">
          <div v-if="day.day" :key="day.isoDate" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
            <div class="font-bold text-center">{{ day.month }}/{{ day.day }}</div>
            <!-- 早上 -->
            <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
              <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
              <div v-if="!calendar[index].morning.bloodSugar.isEditing" :class="{ lazyLoading: calendar[index].morning.bloodSugar.pending }" :style="{ pointerEvents: calendar[index].morning.bloodSugar.pending ? 'none' : 'auto' }" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none" @click="edit(index, 'morning', 'bloodSugar')">
                <i class="fa-solid fa-droplet w-[14px]"></i> : <span class="">{{ calendar[index].morning.bloodSugar.value ? calendar[index].morning.bloodSugar.value : '---' }}</span>
              </div>
              <input v-else type="number" v-model="calendar[index].morning.bloodSugar.value" ref="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none" value="" @blur="blur(index, 'morning', 'bloodSugar')" @keydown.enter="blur(index, 'morning', 'bloodSugar')" />
              <div v-if="!calendar[index].morning.insulin.isEditing" :class="{ lazyLoading: calendar[index].morning.insulin.pending }" :style="{ pointerEvents: calendar[index].morning.insulin.pending ? 'none' : 'auto' }" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none" @click="edit(index, 'morning', 'insulin')"><i class="fa-solid fa-syringe"></i> : {{ calendar[index].morning.insulin.value || calendar[index].morning.insulin.value === 0 ? calendar[index].morning.insulin.value + ' 小格' : '---' }}</div>
              <select v-else v-model="calendar[index].morning.insulin.value" ref="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none" @blur="blur(index, 'morning', 'insulin')" @keydown.enter="blur(index, 'morning', 'insulin')">
                <option v-for="option in insulinOption" :key="option.value" :value="option.value" :selected="calendar[index].morning.insulin.value === option.value">{{ option.text }}</option>
              </select>
            </div>
            <!-- 晚上 -->
            <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
              <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
              <div v-if="!calendar[index].evening.bloodSugar.isEditing" :class="{ lazyLoading: calendar[index].evening.bloodSugar.pending }" :style="{ pointerEvents: calendar[index].evening.bloodSugar.pending ? 'none' : 'auto' }" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none" @click="edit(index, 'evening', 'bloodSugar')">
                <i class="fa-solid fa-droplet w-[14px]"></i> : <span class="">{{ calendar[index].evening.bloodSugar.value ? calendar[index].evening.bloodSugar.value : '---' }}</span>
              </div>
              <input v-else type="number" v-model="calendar[index].evening.bloodSugar.value" ref="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none" value="" @blur="blur(index, 'evening', 'bloodSugar')" @keydown.enter="blur(index, 'evening', 'bloodSugar')" />
              <div v-if="!calendar[index].evening.insulin.isEditing" :class="{ lazyLoading: calendar[index].evening.insulin.pending }" :style="{ pointerEvents: calendar[index].evening.insulin.pending ? 'none' : 'auto' }" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none" @click="edit(index, 'evening', 'insulin')"><i class="fa-solid fa-syringe"></i> : {{ calendar[index].evening.insulin.value || calendar[index].evening.insulin.value === 0 ? calendar[index].evening.insulin.value + ' 小格' : '---' }}</div>
              <select v-else v-model="calendar[index].evening.insulin.value" ref="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none" @blur="blur(index, 'evening', 'insulin')" @keydown.enter="blur(index, 'evening', 'insulin')">
                <option v-for="option in insulinOption" :key="option.value" :value="option.value" :selected="calendar[index].evening.insulin.value === option.value">{{ option.text }}</option>
              </select>
            </div>
          </div>
          <div v-else :key="index" class="p-2 m-1 rounded-md h-[264px] hidden lg:grid" :class="{ lazyLoading: day.loading }"></div>
        </template>
      </div>
    </div>
    <div>
      <div class="lazyLoading rounded-lg overflow-hidden shadow-lg bg-white mt-6 p-4 h-[350px] w-full"></div>
    </div>
    <!-- 快速紀錄 -->
    <div v-if="window.quick.toggle" class="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-70">
      <div class="bg-white p-4 lg:p-8 rounded-xl shadow-2xl text-center w-[80%] max-w-2xl">
        <h2 class="mb-2 text-xl font-semibold text-gray-800">快速記錄</h2>
        <div class="mb-6 space-y-4">
          <div class="grid items-center grid-cols-2 gap-4 p-2 border rounded-md shadow-md">
            <input v-model="window.quick.value.bloodSugar" placeholder="請輸入血糖值" type="tel" class="block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300" autocomplete="off" />
            <select v-model="window.quick.value.insulin" class="block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
              <option v-for="option in insulinOption" :value="option.value" :key="option.value">{{ option.text }}</option>
            </select>
          </div>
        </div>
        <div class="flex justify-between">
          <button class="w-1/3 px-6 py-2 text-gray-700 transition-all bg-gray-300 rounded-lg shadow-md hover:bg-gray-400" @click="window.quick.toggle = false">取消</button>
          <button :class="['w-1/3 px-6 py-2 text-white transition-all bg-blue-500 rounded-lg shadow-md hover:bg-blue-400', { lazyLoading: window.quick.loading }]" @click="createQuick">確定</button>
        </div>
      </div>
    </div>
    <!-- 體重視窗 -->
    <div v-if="window.weight.toggle" class="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-70">
      <div class="bg-white p-4 lg:p-8 rounded-xl shadow-2xl text-center w-[80%] max-w-2xl">
        <h2 class="mb-2 text-xl font-semibold text-gray-800">新增體重紀錄</h2>
        <div class="mb-6 space-y-4">
          <div class="grid grid-cols-[2fr_1fr] lg:grid-cols-2 gap-4 items-center border p-2 rounded-md shadow-md">
            <input v-model="window.weight.date" type="date" class="block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            <input v-model="window.weight.value" type="number" placeholder="輸入體重" class="block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300" autocomplete="off" />
          </div>
        </div>
        <div class="flex justify-between">
          <button class="w-1/3 px-6 py-2 text-gray-700 transition-all bg-gray-300 rounded-lg shadow-md hover:bg-gray-400" @click="window.weight.toggle = false">取消</button>
          <button :class="['w-1/3 px-6 py-2 text-white transition-all bg-blue-500 rounded-lg shadow-md hover:bg-blue-400', { lazyLoading: window.weight.loading }]" @click="createWeight">確定</button>
        </div>
      </div>
    </div>
    <!-- 血糖曲線視窗 -->
    <div v-if="window.sugarCurve.toggle" class="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-70">
      <div class="bg-white p-4 lg:p-8 rounded-xl shadow-2xl text-center w-[80%] max-w-2xl">
        <h2 class="mb-2 text-xl font-semibold text-gray-800">建立血糖曲線</h2>
        <fieldset class="grid items-center grid-cols-1 gap-4 p-2 mb-5 border rounded-md shadow-md">
          <legend><h2>日期</h2></legend>
          <input type="date" class="block w-full p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300" v-model="window.sugarCurve.date" />
        </fieldset>
        <div class="mb-6 space-y-4" v-for="(field, index) in window.sugarCurve.fields" :key="index">
          <div class="grid grid-cols-[2fr_2fr_0.5fr] gap-4 items-center border p-2 rounded-md shadow-md">
            <input v-model="field.time" type="time" name="sugarCurveTime" class="block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300" autocomplete="off" />
            <input v-model="field.value" type="number" name="sugarCurveBloodSugar" placeholder="血糖" class="block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300" autocomplete="off" />
            <button class="px-2 py-1 font-semibold text-white bg-red-500 rounded-md hover:bg-red-600" @click="window.sugarCurve.fields.splice(index, 1)">X</button>
          </div>
        </div>
        <div class="flex justify-center mb-6">
          <button class="flex items-center px-6 py-2 font-medium text-white transition-all bg-green-500 rounded-lg shadow-md hover:bg-green-400" @click="window.sugarCurve.fields.push({ time: '', value: '' })"><i class="mr-2 fa-solid fa-plus"></i> 新增欄位</button>
        </div>
        <div id="sugarCurveBtn" class="flex justify-between">
          <button class="w-1/3 px-6 py-2 text-gray-700 transition-all bg-gray-300 rounded-lg shadow-md hover:bg-gray-400" @click="window.sugarCurve.toggle = false">取消</button>
          <button :class="['w-1/3 px-6 py-2 text-white transition-all bg-blue-500 rounded-lg shadow-md hover:bg-blue-400', { lazyLoading: window.sugarCurve.loading }]" @click="createSugarCurve">確定</button>
        </div>
      </div>
    </div>
    <div class="fixed z-10 space-y-4 right-6 bottom-6">
      <button class="flex items-center justify-center text-black bg-green-400 rounded-full shadow-md w-14 h-14" @click="window.quick.toggle = true">
        <i class="fa-solid fa-plus"></i>
      </button>
      <button class="flex items-center justify-center text-black bg-yellow-200 rounded-full shadow-md w-14 h-14" @click="window.weight.toggle = true">
        <i class="fa-solid fa-weight-scale"></i>
      </button>
      <button class="flex items-center justify-center text-black bg-pink-300 rounded-full shadow-md w-14 h-14" @click="window.sugarCurve.toggle = true">
        <i class="fa-solid fa-chart-line"></i>
      </button>
    </div>
  </div>
</template>
