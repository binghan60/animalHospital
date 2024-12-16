<script>
import apiStore from '@/stores/api'
import { mapState } from 'pinia'
import Mychart from '@/components/Mychart.vue'
export default {
  components: { Mychart },
  data() {
    return {
      diaryBloodSugar: [],
      animalId: this.$route.params.id,
      animalInfo: {},
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
      today: this.getToday(),
      currentDate: this.getToday(),
      calendar: [],
      insulinOption: [
        { value: '', text: '請選擇劑量' },
        { value: 0, text: '0 小格' },
        { value: 0.5, text: '0.5 小格' },
        { value: 1, text: '1 小格' },
        { value: 1.5, text: '1.5 小格' },
      ],
    }
  },
  methods: {
    async getAnimalInfo() {
      try {
        const response = await fetch(`${this.apipath}/animal/detail/${this.animalId}`, {
          method: 'GET',
        })
        if (!response.ok) {
          this.$toast.error(response.message)
          return
        }
        const data = await response.json()
        this.animalInfo = data
        this.chartData.labels = data.weight.map(x => new Date(x.date).toISOString().slice(0, 10))
        this.chartData.datasets[0].data = data.weight.map(x => x.value)
      } catch (error) {
        console.error(error.message)
        this.$toast.error('伺服器錯誤')
      }
    },
    async getDiaryBloodSugar() {
      try {
        const response = await fetch(`${this.apipath}/bloodSugar/diary?animalId=${this.animalId}&year=${this.currentDate.year}&month=${this.currentDate.month}&dayInMonth=${this.currentDate.dayInMonth}`, {
          method: 'GET',
        })
        if (!response.ok) {
          this.$toast.error(response.message)
          return
        }
        const data = await response.json()
        this.diaryBloodSugar = data
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
            animalId: this.animalId,
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
      } catch (error) {
        this.$toast.error('伺服器忙碌中，請稍後再試。')
        console.error('login', error)
        throw error
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
      const response = await this.createDiaryBloodSugar(this.calendar[index].date, this.calendar[index].morning.bloodSugar.value, this.calendar[index].morning.insulin.value, this.calendar[index].evening.bloodSugar.value, this.calendar[index].evening.insulin.value, '')
      console.log(response)
      this.calendar[index][timeOfDay][recordType].isEditing = false
    },
  },
  computed: {
    ...mapState(apiStore, ['apipath']),
  },
  watch: {
    'currentDate.month': {
      handler(newValue) {
        const { currentDate } = this
        const days = Array.from({ length: currentDate.dayInMonth }, (v, i) => {
          const date = `${currentDate.year}-${newValue}-${String(i + 1).padStart(2, '0')}`
          return {
            year: currentDate.year,
            month: newValue,
            day: i + 1,
            date,
            morning: { bloodSugar: { value: '', isEditing: false }, insulin: { value: '', isEditing: false } },
            evening: { bloodSugar: { value: '', isEditing: false }, insulin: { value: '', isEditing: false } },
          }
        })
        const fetchDiaryData = async () => {
          const diaryData = await this.getDiaryBloodSugar()
          const mergedDays = days.map(day => {
            const diaryEntry = diaryData.find(entry => new Date(entry.date).toISOString().slice(0, 10) === day.date)
            if (diaryEntry) {
              return Object.assign({}, day, {
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
          const firstDay = new Date(currentDate.year, newValue - 1, 1).getDay()
          const spaceDay = firstDay === 0 ? 6 : firstDay - 1
          const blankDays = Array.from({ length: spaceDay }, () => ({ date: null })) //補前空格
          const allDays = [...blankDays, ...mergedDays]
          const totalCells = 42
          for (let i = allDays.length; i < totalCells; i++) {
            allDays.push({ date: null })
          } //補後空格
          this.calendar = allDays
          console.log(allDays)
        }
        fetchDiaryData()
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
            <li class="col-span-2 text-sm text-gray-800">{{ animalInfo.name }}</li>
            <li class="text-sm font-medium text-gray-600">種類：</li>
            <li class="col-span-2 text-sm text-gray-800" v-html="animalInfo.type === 'dog' ? `<i class='fa-solid fa-dog'></i>` : `<i class='fa-solid fa-cat'></i>`"></li>
            <li class="text-sm font-medium text-gray-600">生日：</li>
            <li class="col-span-2 text-sm text-gray-800">{{ animalInfo.birthday ? new Date(animalInfo.birthday).toISOString().slice(0, 10) : '' }} ({{ convertBirthdayToAge(animalInfo.birthday).years }}歲 {{ convertBirthdayToAge(animalInfo.birthday).months > 0 ? convertBirthdayToAge(animalInfo.birthday).months + '個月' : '' }})</li>
            <li class="text-sm font-medium text-gray-600">性別：</li>
            <li class="col-span-2 text-sm text-gray-800" v-html="animalId.gender === 'male' ? `<i class='text-blue-600 fa-solid fa-mars'></i>` : `<i class='text-blue-600 fa-solid fa-venus'></i>`"></li>
            <li class="text-sm font-medium text-gray-600">血型：</li>
            <li class="col-span-2 text-sm text-gray-800">{{ animalInfo.bloodType }} 型</li>
            <li class="text-sm font-medium text-gray-600">體重：</li>
            <li class="col-span-2 text-sm text-gray-800">{{ animalInfo.weight ? animalInfo.weight[animalInfo.weight.length - 1].value : '' }} 公斤</li>
            <li class="text-sm font-medium text-gray-600">品種：</li>
            <li class="col-span-2 text-sm text-gray-800">{{ animalInfo.breed }}</li>
            <li class="text-sm font-medium text-gray-600">結紮：</li>
            <li class="col-span-2 text-sm text-gray-800" v-html="animalInfo.sterilized ? `<i class='text-green-500 fa-solid fa-check'></i>` : `<i class='text-red-500 fa-solid fa-x'></i>`"></li>
            <li class="text-sm font-medium text-gray-600">胰島素品牌：</li>
            <li class="col-span-2 text-sm text-gray-800">{{ animalInfo.insulinBrand }}</li>
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
              <div v-if="!calendar[index].morning.bloodSugar.isEditing" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none" @click="edit(index, 'morning', 'bloodSugar')">
                <i class="fa-solid fa-droplet w-[14px]"></i> : <span class="">{{ calendar[index].morning.bloodSugar.value ? calendar[index].morning.bloodSugar.value : '---' }}</span>
              </div>
              <input v-else type="tel" v-model="calendar[index].morning.bloodSugar.value" ref="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none" value="" @blur="blur(index, 'morning', 'bloodSugar')" />
              <div v-if="!calendar[index].morning.insulin.isEditing" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none" @click="edit(index, 'morning', 'insulin')"><i class="fa-solid fa-syringe"></i> : {{ calendar[index].morning.insulin.value || calendar[index].morning.insulin.value === 0 ? calendar[index].morning.insulin.value + ' 小格' : '---' }}</div>
              <select v-else v-model="calendar[index].morning.insulin.value" ref="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none" @blur="blur(index, 'morning', 'insulin')">
                <option v-for="option in insulinOption" :key="option.value" :value="option.value" :selected="calendar[index].morning.insulin.value === option.value">{{ option.text }}</option>
              </select>
            </div>
            <!-- 晚上 -->
            <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
              <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
              <div v-if="!calendar[index].evening.bloodSugar.isEditing" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none" @click="edit(index, 'evening', 'bloodSugar')">
                <i class="fa-solid fa-droplet w-[14px]"></i> : <span class="">{{ calendar[index].evening.bloodSugar.value ? calendar[index].evening.bloodSugar.value : '---' }}</span>
              </div>
              <input v-else type="tel" v-model="calendar[index].evening.bloodSugar.value" ref="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none" value="" @blur="blur(index, 'evening', 'bloodSugar')" />
              <div v-if="!calendar[index].evening.insulin.isEditing" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none" @click="edit(index, 'evening', 'insulin')"><i class="fa-solid fa-syringe"></i> : {{ calendar[index].evening.insulin.value || calendar[index].evening.insulin.value === 0 ? calendar[index].evening.insulin.value + ' 小格' : '---' }}</div>
              <select v-else ref="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none" @blur="blur(index, 'evening', 'insulin')">
                <option v-for="option in insulinOption" :key="option.value" :value="option.value" :selected="calendar[index].evening.insulin.value === option.value">{{ option.text }}</option>
              </select>
            </div>
          </div>
          <div v-else :key="index" class="p-2 m-1 rounded-md"></div>
        </template>
      </div>
    </div>
    <div>
      <div class="lazyLoading rounded-lg overflow-hidden shadow-lg bg-white mt-6 p-4 h-[350px] w-full"></div>
    </div>
  </div>
</template>
