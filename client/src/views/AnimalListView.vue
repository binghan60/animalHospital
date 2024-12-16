<script>
import apiStore from '@/stores/api'
import authStore from '@/stores/auth'
import { mapState } from 'pinia'
export default {
  data() {
    return {
      animalList: [],
      createForm: {
        name: '',
        gender: 'male',
        weight: '',
        birthday: '',
        sterilized: false,
        breed: '',
        bloodType: '',
        type: ' ',
        insulinBrand: '',
        admissionDate: new Date().toISOString().slice(0, 10),
      },
      iscreateFormOpen: false,
      otherField: true,
      searchKeyword: '',
    }
  },
  methods: {
    async creatNewAnimal() {
      try {
        const response = await fetch(`${this.apipath}/animal/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: this.user._id,
            name: this.createForm.name,
            gender: this.createForm.gender,
            weight: [{ date: new Date('2024-12-08').toISOString().slice(0, 10), value: this.createForm.weight }],
            birthday: this.createForm.birthday,
            sterilized: this.createForm.sterilized,
            breed: this.createForm.breed,
            bloodType: this.createForm.bloodType,
            type: this.createForm.type,
            insulinBrand: this.createForm.insulinBrand,
            admissionDate: this.createForm.admissionDate,
          }),
        })
        if (!response.ok) {
          this.$toast.error(response.message)
          return
        }
        this.$toast.success('新增成功')
        await this.getUserAnimal()
        this.iscreateFormOpen = false
      } catch (error) {
        this.$toast.error('伺服器忙碌中，請稍後再試。')
        throw error
      }
    },
    async getUserAnimal() {
      try {
        const response = await fetch(`${this.apipath}/animal/${this.user._id}?searchKeyword=${this.searchKeyword}`, {
          method: 'GET',
        })
        const animalList = await response.json()
        if (!response.ok) {
          this.$toast.error(animalList.message)
          return
        }
        this.animalList = animalList
        console.log(animalList)
      } catch (error) {
        this.$toast.error('伺服器忙碌中，請稍後再試。')
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
    async handleSearchBlur() {
      if (this.searchKeyword.trim() === '') {
        return
      }
      await this.getUserAnimal()
    },
    async handleViewAll() {
      this.searchKeyword = ''
      await this.getUserAnimal()
    },
  },
  computed: {
    ...mapState(apiStore, ['apipath']),
    ...mapState(authStore, ['user']),
  },
  async mounted() {
    await this.getUserAnimal()
    // TODO 表單驗證
    // 照片上傳
    // API按鈕防呆
    // 出院住院紀錄
  },
}
</script>

<template>
  <div>
    <div class="relative flex flex-col w-full h-full text-gray-700 bg-white shadow-md rounded-xl bg-clip-border">
      <div class="relative mx-4 mt-4 overflow-hidden text-gray-700 bg-white rounded-none bg-clip-border">
        <div class="flex items-center justify-between gap-8 mb-8">
          <div>
            <h5 class="block font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-primary-900">動物列表</h5>
            <p class="block mt-1 font-sans text-base antialiased font-normal leading-relaxed text-gray-700"></p>
          </div>
          <div class="flex flex-col gap-2 shrink-0 sm:flex-row">
            <button class="select-none rounded-lg border border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" type="button" @click="handleViewAll">view all</button>
            <button @click="iscreateFormOpen = true" class="flex select-none items-center gap-3 rounded-lg bg-primary-600 py-2 px-4 text-center text-xs font-bold text-white shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-primary-600/20 focus:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" stroke-width="2" class="w-4 h-4">
                <path d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM19.75 7.5a.75.75 0 00-1.5 0v2.25H16a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H22a.75.75 0 000-1.5h-2.25V7.5z"></path>
              </svg>
              新增動物
            </button>
          </div>
        </div>
        <div class="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div class="w-full md:w-max">
            <nav>
              <ul role="tablist" class="relative flex flex-row p-1 min-w-[300px] rounded-lg bg-primary-100 bg-opacity-60">
                <li role="tab" class="relative flex items-center justify-center w-full h-full px-2 py-1 text-center cursor-pointer select-none text-primary-900">
                  <div class="z-10">&nbsp;&nbsp;All&nbsp;&nbsp;</div>
                  <div class="absolute inset-0 h-full bg-white rounded-md shadow z-5"></div>
                </li>
                <li role="tab" class="relative flex items-center justify-center w-full h-full px-2 py-1 text-center cursor-pointer select-none text-primary-900">
                  <div class="z-10">&nbsp;&nbsp;住院&nbsp;&nbsp;</div>
                </li>
                <li role="tab" class="relative flex items-center justify-center w-full h-full px-2 py-1 text-center cursor-pointer select-none text-primary-900">
                  <div class="z-10">&nbsp;&nbsp;出院&nbsp;&nbsp;</div>
                </li>
              </ul>
            </nav>
          </div>
          <div class="w-full md:w-72">
            <div class="relative h-10 w-full min-w-[200px]">
              <div class="absolute grid w-5 h-5 top-2/4 right-3 -translate-y-2/4 place-items-center text-primary-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path>
                </svg>
              </div>
              <input class="peer h-full w-full rounded-[7px] border border-primary-200 border-t-transparent bg-transparent px-3 py-2.5 !pr-9 font-sans text-sm font-normal text-primary-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-primary-200 placeholder-shown:border-t-primary-200 focus:border-2 focus:border-gray-900 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-primary-50" placeholder=" " v-model="searchKeyword" @blur="handleSearchBlur" />
              <label class="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none !overflow-visible truncate text-[11px] font-normal leading-tight text-gray-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-primary-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-primary-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-primary-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-gray-900 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-gray-900 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-gray-900 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-primary-500">搜尋 </label>
            </div>
          </div>
        </div>
      </div>
      <div class="p-6 px-0 overflow-scroll min-h-[600px]">
        <table class="w-full mt-4 text-left table-auto min-w-max">
          <thead>
            <tr>
              <th class="p-4 transition-colors cursor-pointer border-y border-primary-100 bg-primary-100/75 hover:bg-primary-200">
                <p class="flex items-center justify-between gap-2 font-sans text-sm antialiased text-primary-900 opacity-70">
                  姓名
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                  </svg>
                </p>
              </th>
              <th class="p-4 transition-colors cursor-pointer border-y border-primary-100 bg-primary-100/75 hover:bg-primary-200">
                <p class="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-primary-900 opacity-70">
                  體重
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                  </svg>
                </p>
              </th>
              <th class="p-4 transition-colors cursor-pointer border-y border-primary-100 bg-primary-100/75 hover:bg-primary-200">
                <p class="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-primary-900 opacity-70">
                  血型
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                  </svg>
                </p>
              </th>
              <th class="p-4 transition-colors cursor-pointer border-y border-primary-100 bg-primary-100/75 hover:bg-primary-200">
                <p class="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-primary-900 opacity-70">
                  品種
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                  </svg>
                </p>
              </th>
              <th class="p-4 transition-colors cursor-pointer border-y border-primary-100 bg-primary-100/75 hover:bg-primary-200">
                <p class="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-primary-900 opacity-70">
                  結紮
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                  </svg>
                </p>
              </th>
              <th class="p-4 transition-colors cursor-pointer border-y border-primary-100 bg-primary-100/75 hover:bg-primary-200">
                <p class="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-primary-900 opacity-70">
                  入院日期
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                  </svg>
                </p>
              </th>
              <th class="p-4 transition-colors cursor-pointer border-y border-primary-100 bg-primary-100/75 hover:bg-primary-200">
                <p class="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-primary-900 opacity-70"></p>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr class="hover:bg-primary-100" v-for="animal in animalList" :key="animal._id" @click="this.$router.push(`/animal/${animal._id}`)">
              <td class="p-4 border-b border-primary-50">
                <div class="flex items-center gap-3">
                  <img src="/image/1.jpg" alt="John Michael" class="relative inline-block h-9 w-9 !rounded-full object-cover object-center" />
                  <div class="flex flex-col">
                    <p class="block font-sans text-sm antialiased font-bold leading-normal text-primary-900">{{ animal.name }}</p>
                    <p class="block font-sans text-sm antialiased font-normal leading-normal text-primary-900 opacity-70">{{ animal.type == 'dog' ? '狗狗' : '貓貓' }} {{ convertBirthdayToAge(animal.birthday).years }}歲 {{ convertBirthdayToAge(animal.birthday).months > 0 ? convertBirthdayToAge(animal.birthday).months + '個月' : '' }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4 border-b border-primary-50">
                <div class="flex flex-col">
                  <p class="block font-sans text-sm antialiased font-normal leading-normal text-primary-900">{{ animal.weight[0].value }} 公斤</p>
                </div>
              </td>
              <td class="p-4 border-b border-primary-50">
                <div class="flex flex-col">
                  <p class="block font-sans text-sm antialiased font-normal leading-normal text-primary-900">{{ animal.bloodType }} 型</p>
                </div>
              </td>
              <td class="p-4 border-b border-primary-50">
                <div class="flex flex-col">
                  <p class="block font-sans text-sm antialiased font-normal leading-normal text-primary-900">{{ animal.breed }}</p>
                </div>
              </td>
              <td class="p-4 border-b border-primary-50">
                <div class="w-max">
                  <div :class="[animal.sterilized ? 'text-green-900' : 'text-red-900', animal.sterilized ? 'bg-green-500/20' : 'bg-red-500/20']" class="relative grid items-center px-2 py-1 font-sans text-xs font-bold uppercase rounded-md select-none whitespace-nowrap">
                    <span>{{ animal.sterilized ? '是' : '否' }}</span>
                  </div>
                </div>
              </td>
              <td class="p-4 border-b border-primary-50">
                <p class="block font-sans text-sm antialiased font-normal leading-normal text-primary-900">{{ new Date(animal.admissionDate).toISOString().slice(0, 10) }}</p>
              </td>
              <td class="p-4 border-b border-primary-50">
                <button class="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" type="button">
                  <span class="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                    <i class="text-xl text-primary-900 fa-solid fa-pen-to-square"></i>
                  </span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex items-center justify-between p-4 border-t border-primary-50">
        <p class="block font-sans text-sm antialiased font-normal leading-normal text-primary-900">Page 1 of 10</p>
        <div class="flex gap-2">
          <button class="select-none rounded-lg border border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" type="button">上一頁</button>
          <button class="select-none rounded-lg border border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" type="button">下一頁</button>
        </div>
      </div>
    </div>
    <div v-if="iscreateFormOpen" class="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-70">
      <div class="bg-primary-50 p-4 lg:p-8 rounded-xl text-center w-[100%] max-w-2xl">
        <h2 class="mb-4 text-xl font-semibold text-primary-900">新增動物資料</h2>
        <div class="mb-6">
          <div class="space-y-4">
            <div class="flex items-center">
              <label for="name" class="w-1/3 text-left text-primary-700">姓名</label>
              <input id="name" type="text" placeholder="姓名" class="w-full p-2 border rounded-lg shadow-sm border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300" v-model="createForm.name" />
            </div>
            <div class="flex items-center">
              <label for="gender" class="w-1/3 text-left text-primary-700">性別</label>
              <select id="gender" class="block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300" v-model="createForm.gender">
                <option value="male">男生</option>
                <option value="female">女生</option>
              </select>
            </div>
            <div class="flex items-center">
              <label for="weight" class="w-1/3 text-left text-primary-700">體重 (kg)</label>
              <input id="weight" type="number" placeholder="體重 (kg)" class="w-full p-2 border rounded-lg shadow-sm border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300" v-model="createForm.weight" />
            </div>
            <div class="flex items-center">
              <label for="birthday" class="w-1/3 text-left text-primary-700">生日</label>
              <input id="birthday" ref="birthday" type="date" class="block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300" @focus="$refs.birthday.showPicker()" v-model="createForm.birthday" />
            </div>
            <div class="flex items-center">
              <label class="w-1/3 text-left text-primary-700">是否結紮</label>
              <div class="flex justify-around w-full">
                <select id="neutered" class="block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300" v-model="createForm.sterilized">
                  <option value="true">已結紮</option>
                  <option value="false">未結紮</option>
                </select>
              </div>
            </div>
            <div class="flex items-center">
              <label for="breed" class="w-1/3 text-left text-primary-700">品種</label>
              <input id="breed" type="text" placeholder="品種" class="block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300" v-model="createForm.breed" />
            </div>

            <div class="flex items-center">
              <label class="w-1/3 text-left text-primary-700">血型</label>
              <div class="flex justify-between w-full">
                <label class="rounded-lg">
                  <input type="radio" name="bloodType" value="A" class="hidden peer" v-model="createForm.bloodType" />
                  <span class="px-2 py-2 rounded-lg shadow-md cursor-pointer bg-primary-100 lg:px-4 text-primary-800 peer-checked:bg-primary-500 peer-checked:text-white"><i class="fa-solid fa-a"></i> 型</span>
                </label>
                <label class="rounded-l">
                  <input type="radio" name="bloodType" value="B" class="hidden peer" v-model="createForm.bloodType" />
                  <span class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 text-primary-800 bg-primary-100 peer-checked:bg-primary-500 peer-checked:text-white"><i class="fa-solid fa-b"></i> 型</span>
                </label>
                <label class="rounded-l">
                  <input type="radio" name="bloodType" value="AB" class="hidden peer" v-model="createForm.bloodType" />
                  <span class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 text-primary-800 bg-primary-100 peer-checked:bg-primary-500 peer-checked:text-white"><i class="fa-solid fa-a"></i><i class="fa-solid fa-b"></i> 型</span>
                </label>
                <label class="rounded-l">
                  <input type="radio" name="bloodType" value="O" class="hidden peer" v-model="createForm.bloodType" />
                  <span class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-4 text-primary-800 bg-primary-100 peer-checked:bg-primary-500 peer-checked:text-white"><i class="fa-solid fa-o"></i> 型</span>
                </label>
              </div>
            </div>

            <div class="flex items-center">
              <label for="species" class="w-1/3 text-left text-primary-700">種類</label>
              <div class="flex items-center justify-between w-full gap-2">
                <label class="min-w-[70px] h-full rounded-lg">
                  <input type="radio" name="type" value="cat" class="hidden peer" v-model="createForm.type" />
                  <span class="px-2 py-2 rounded-lg shadow-md cursor-pointer bg-primary-100 text-primary-800 peer-checked:bg-primary-500 peer-checked:text-white"><i class="fa-solid fa-cat"></i> 貓貓 </span>
                </label>
                <label class="min-w-[70px] rounded-l">
                  <input type="radio" name="type" value="dog" class="hidden peer" v-model="createForm.type" />
                  <span class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-2 text-primary-800 bg-primary-100 peer-checked:bg-primary-500 peer-checked:text-white"><i class="fa-solid fa-dog"></i> 狗狗 </span>
                </label>
                <label class="min-w-[48px] rounded-l">
                  <input type="radio" name="type" value="other" class="hidden peer" v-model="createForm.type" />
                  <span class="px-2 py-2 transition-all rounded-lg shadow-md cursor-pointer lg:px-2 text-primary-800 bg-primary-100 peer-checked:bg-primary-500 peer-checked:text-white">其他 </span>
                </label>
                <!-- <label class="rounded-l">
                  <input type="text" placeholder="其他" class="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </label> -->
              </div>
            </div>

            <div class="flex items-center">
              <label for="insulinBrand" class="w-1/3 text-left text-primary-700">胰島素品牌</label>
              <input id="insulinBrand" type="text" placeholder="胰島素品牌" class="block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300" v-model="createForm.insulinBrand" />
            </div>
            <div class="flex items-center">
              <label for="admissionDate" class="w-1/3 text-left text-primary-700">入院日期</label>
              <input ref="admissionDate" type="date" class="block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300" @focus="$refs.admissionDate.showPicker()" v-model="createForm.admissionDate" />
            </div>
          </div>
        </div>
        <div class="flex justify-between">
          <button class="w-1/3 px-6 py-2 text-gray-700 transition-all bg-gray-300 rounded-lg shadow-md hover:bg-gray-400" @click="iscreateFormOpen = false">取消</button>
          <button class="w-1/3 px-6 py-2 text-white transition-all rounded-lg shadow-md bg-primary-500 hover:bg-primary-400" @click="creatNewAnimal">確定</button>
        </div>
      </div>
    </div>
  </div>
</template>
