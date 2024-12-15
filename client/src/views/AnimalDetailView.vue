<script>
import apiStore from '@/stores/api'
import { mapState } from 'pinia'
import Mychart from '@/components/Mychart.vue'
export default {
  components: { Mychart },
  data() {
    return {
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
      plugins: [],
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
        console.log(this.chartData.labels)
        console.log(this.chartData.datasets[0].data)
      } catch (error) {
        console.error(error.message)
        this.$toast.error('伺服器錯誤')
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
  },
  computed: {
    ...mapState(apiStore, ['apipath']),
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
        <button class="text-blue-500 hover:text-blue-700">
          <i class="text-3xl fa-solid fa-caret-left"></i>
        </button>
        <span class="px-4">2024 年 12 月 血糖表</span>
        <button id="nextMonth" class="text-blue-500 hover:text-blue-700">
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
        <div class="p-2 m-1 rounded-md"></div>
        <div class="p-2 m-1 rounded-md"></div>
        <div class="p-2 m-1 rounded-md"></div>
        <div class="p-2 m-1 rounded-md"></div>
        <div class="p-2 m-1 rounded-md"></div>
        <div class="p-2 m-1 rounded-md"></div>
        <div id="calendar2024-12-01" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">1</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,1)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-green-500">121</span> mg/dl</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,1)"><i class="fa-solid fa-syringe"></i> : 0小格</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,1)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-green-500">125</span> mg/dl</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,1)"><i class="fa-solid fa-syringe"></i> : 1.5小格</div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div class="lazyLoading rounded-lg overflow-hidden shadow-lg bg-white mt-6 p-4 h-[350px] w-full"></div>
    </div>
  </div>
</template>
