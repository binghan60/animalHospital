<script>
import axios from 'axios'
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
    }
  },
  methods: {
    async getDashBoard() {
      try {
        const params = {
          hospitalId: this.user._id,
        }
        const { data } = await axios.get(`${import.meta.env.VITE_API_PATH}/dashboard`, {
          params,
        })
        this.dashboard = data
      } catch (error) {
        this.$toast.error(error.response.data.message)
      }
    },
  },
  computed: {
    ...mapState(authStore, ['user']),
  },
  async mounted() {
    await this.getDashBoard()
    this.gender.data = {
      labels: this.dashboard.stats.genderStats.map(x => {
        return this.genderChinese[x._id]
      }),
      datasets: [
        {
          data: this.dashboard.stats.genderStats.map(x => x.count),
          backgroundColor: ['#A0C4FF', '#FFB3B3'],
        },
      ],
    }
    this.gender.options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
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
        title: { display: true, text: '性別' },
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
        legend: { display: false },
        title: { display: true, text: '體重' },
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
        legend: { display: false },
        title: { display: true, text: '年齡' },
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
        },
      ],
    }
    this.sterilized.options = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
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
        title: { display: true, text: '結紮' },
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
        legend: { display: false },
        title: { display: true, text: '品種' },
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
        legend: { display: false },
        title: { display: true, text: '血型' },
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
            '#F1D0C1', // 貓
            '#F4B7B0', // 狗
            '#D8A8D6', // 其他
          ],
        },
      ],
    }
    this.type.options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: true, text: '動物種類' },
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
          backgroundColor: ['#F1C6B8', '#F9D9A6', '#D1E8D2', '#E7C3F1', '#F2D1C9'],
        },
      ],
    }
    this.insulinBrand.options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
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
        title: { display: true, text: '胰島素品牌' },
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

    // 種類 胰島素品牌
  },
}
</script>

<template>
  <div class="grid grid-cols-3 gap-4 text-center">
    <div class="col-span-3">
      <div class="text-4xl">{{ dashboard.stats?.total }}隻</div>
      <div>目前院內動物數量</div>
    </div>
    <div class="bg-white lg:col-span-1 col-span-3 p-2 h-[300px] border border-gray-50 rounded-lg shadow-lg">
      <ChartComponent :type="gender.type" :chartData="gender.data" :chartOptions="gender.options"></ChartComponent>
    </div>
    <div class="bg-white lg:col-span-1 col-span-3 p-2 h-[300px] border border-gray-50 rounded-lg shadow-lg">
      <ChartComponent :type="weight.type" :chartData="weight.data" :chartOptions="weight.options"></ChartComponent>
    </div>
    <div class="bg-white lg:col-span-1 col-span-3 p-2 h-[300px] border border-gray-50 rounded-lg shadow-lg">
      <ChartComponent :type="age.type" :chartData="age.data" :chartOptions="age.options"></ChartComponent>
    </div>
    <div class="bg-white lg:col-span-1 col-span-3 p-2 h-[300px] border border-gray-50 rounded-lg shadow-lg">
      <ChartComponent :type="sterilized.type" :chartData="sterilized.data" :chartOptions="sterilized.options"></ChartComponent>
    </div>
    <div class="bg-white lg:col-span-1 col-span-3 p-2 h-[300px] border border-gray-50 rounded-lg shadow-lg">
      <ChartComponent :type="breed.type" :chartData="breed.data" :chartOptions="breed.options"></ChartComponent>
    </div>
    <div class="bg-white lg:col-span-1 col-span-3 p-2 h-[300px] border border-gray-50 rounded-lg shadow-lg">
      <ChartComponent :type="bloodType.type" :chartData="bloodType.data" :chartOptions="bloodType.options"></ChartComponent>
    </div>
    <div class="bg-white lg:col-span-1 col-span-3 p-2 h-[300px] border border-gray-50 rounded-lg shadow-lg">
      <ChartComponent :type="type.type" :chartData="type.data" :chartOptions="type.options"></ChartComponent>
    </div>
    <div class="bg-white lg:col-span-1 col-span-3 p-2 h-[300px] border border-gray-50 rounded-lg shadow-lg">
      <ChartComponent :type="insulinBrand.type" :chartData="insulinBrand.data" :chartOptions="insulinBrand.options"></ChartComponent>
    </div>
  </div>
</template>
