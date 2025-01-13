<script>
import authStore from '@/stores/auth'
import { mapState } from 'pinia'
import axios from 'axios'
import { Field, Form, ErrorMessage } from 'vee-validate'
export default {
  components: {
    VField: Field,
    VForm: Form,
    ErrorMessage,
  },
  data() {
    return {
      animalList: [],
      createForm: {
        name: '',
        gender: 'male',
        weight: [{ date: new Date().toISOString().slice(0, 10), value: 0 }],
        birthday: '',
        sterilized: false,
        breed: '',
        bloodType: '',
        type: '',
        insulinBrand: '',
        admissionDate: new Date().toISOString().slice(0, 10),
        sharedWith: [],
      },
      editForm: {
        animalId: '',
        name: '',
        gender: 'male',
        weight: [{ date: new Date().toISOString().slice(0, 10), value: 0 }],
        birthday: '',
        sterilized: false,
        breed: '',
        bloodType: '',
        type: '',
        insulinBrand: '',
        admissionDate: new Date().toISOString().slice(0, 10),
        sharedWith: [],
      },
      createFormToggle: false,
      editFormToggle: false,
      otherField: true,
      searchKeyword: '',
      filterType: '',
      birthdayType: 'date',
    }
  },
  methods: {
    async getUserAnimal() {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_PATH}/animal/${this.user._id}`)
        this.animalList = data
      } catch (error) {
        this.$toast.error(error.response.data.message)
      }
    },
    async creatNewAnimal() {
      try {
        const payload = {
          hospitalId: this.user._id,
          ...this.createForm,
        }
        await axios.post(`${import.meta.env.VITE_API_PATH}/animal/create`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        this.$toast.success('新增成功')
        await this.getUserAnimal()
        this.createFormToggle = false
        this.createForm = {
          name: '',
          gender: 'male',
          weight: [{ date: new Date().toISOString().slice(0, 10), value: 0 }],
          birthday: '',
          sterilized: false,
          breed: '',
          bloodType: '',
          type: '',
          insulinBrand: '',
          admissionDate: new Date().toISOString().slice(0, 10),
          sharedWith: [],
        }
      } catch (error) {
        this.$toast.error(error.response.data.message)
      }
    },
    async editAnimal() {
      const payload = this.editForm
      try {
        await axios.put(`${import.meta.env.VITE_API_PATH}/animal/edit`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        this.$toast.success('修改成功')
        this.editFormToggle = false
        await this.getUserAnimal()
      } catch (error) {
        this.$toast.error(error.response.data.message)
      }
    },
    async deleteAnimal(event, animalId) {
      event.stopPropagation()
      try {
        const { data } = await axios.delete(`${import.meta.env.VITE_API_PATH}/animal/delete/${animalId}`)
        this.$toast.success(data.message)
        await this.getUserAnimal()
      } catch (error) {
        this.$toast.error(error.response.data.message)
      }
    },
    editToggle(event, animalId) {
      event.stopPropagation()
      const animal = this.animalList.find(x => x._id === animalId)
      const { _id, name, gender, weight, birthday, sterilized, breed, bloodType, type, insulinBrand, admissionDate } = animal
      this.editForm = {
        animalId: _id,
        name,
        gender,
        weight: [{ date: new Date().toISOString().slice(0, 10), value: weight }],
        birthday: new Date(birthday).toISOString().split('T')[0],
        sterilized,
        breed,
        bloodType,
        type,
        insulinBrand,
        admissionDate: new Date(admissionDate).toISOString().slice(0, 10),
        sharedWith: [],
      }
      this.editFormToggle = true
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
    animalIcon(type) {
      if (type == 'dog') {
        return 'fa-dog'
      } else if (type == 'cat') {
        return 'fa-cat'
      } else if (type == 'other') {
        return 'fa-question'
      }
    },
    sortBy(attribute) {
      // 先比較當前列表是否已經是升冪排序
      const isAscending = this.animalList.every((item, index, array) => {
        return index === 0 || array[index - 1][attribute] <= item[attribute]
      })
      // 根據當前是否升冪，決定排序方式
      this.animalList.sort((a, b) => {
        if (a[attribute] < b[attribute]) return isAscending ? 1 : -1
        if (a[attribute] > b[attribute]) return isAscending ? -1 : 1
        return 0
      })
    },
  },

  computed: {
    ...mapState(authStore, ['user', 'token']),
    showData() {
      return this.animalList.filter(x => {
        const matchesName = x.name?.toLowerCase().includes(this.searchKeyword?.toLowerCase() || '')
        const matchesType = this.filterType === '' || x.type === this.filterType
        return matchesName && matchesType
      })
    },
  },
  async mounted() {
    await this.getUserAnimal()
    // TODO
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
            <button type="button" class="select-none rounded-lg border border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" @click="((this.searchKeyword = ''), (this.filterType = ''))">清空搜尋條件</button>
            <button type="button" class="flex select-none items-center gap-3 rounded-lg bg-primary-600 py-2 px-4 text-center text-xs font-bold text-white shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-primary-600/20 focus:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" @click="createFormToggle = true">
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
                <li role="tab" class="relative flex items-center justify-center w-full h-full px-2 py-1 text-center cursor-pointer select-none text-primary-900" @click="this.filterType = ''">
                  <div class="z-10">All</div>
                  <div v-show="filterType === ''" class="absolute inset-0 h-full bg-white rounded-md shadow z-5"></div>
                </li>
                <li role="tab" class="relative flex items-center justify-center w-full h-full px-2 py-1 text-center cursor-pointer select-none text-primary-900" @click="this.filterType = 'dog'">
                  <div class="z-10"><i class="fa-solid fa-dog fa-fw"></i></div>
                  <div v-show="filterType === 'dog'" class="absolute inset-0 h-full bg-white rounded-md shadow z-5"></div>
                </li>
                <li role="tab" class="relative flex items-center justify-center w-full h-full px-2 py-1 text-center cursor-pointer select-none text-primary-900" @click="this.filterType = 'cat'">
                  <div class="z-10"><i class="fa-solid fa-cat fa-fw"></i></div>
                  <div v-show="filterType === 'cat'" class="absolute inset-0 h-full bg-white rounded-md shadow z-5"></div>
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
              <input v-model="searchKeyword" class="peer h-full w-full rounded-[7px] border border-primary-200 border-t-transparent bg-transparent px-3 py-2.5 !pr-9 font-sans text-sm font-normal text-primary-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-primary-200 placeholder-shown:border-t-primary-200 focus:border-2 focus:border-gray-900 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-primary-50" placeholder=" " />
              <label class="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none !overflow-visible truncate text-[11px] font-normal leading-tight text-gray-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-primary-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-primary-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-primary-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-gray-900 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-gray-900 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-gray-900 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-primary-500">搜尋 </label>
            </div>
          </div>
        </div>
      </div>
      <div class="p-6 px-0 overflow-auto h-[700px]">
        <table class="w-full mt-4 text-left table-auto min-w-max">
          <thead>
            <tr>
              <th class="p-4 transition-colors cursor-pointer border-y border-primary-100 bg-primary-100/75 hover:bg-primary-200" @click="sortBy('name')">
                <p class="flex items-center justify-between gap-2 font-sans text-sm antialiased text-primary-900 opacity-70">
                  基本資料
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                  </svg>
                </p>
              </th>
              <th class="p-4 transition-colors cursor-pointer border-y border-primary-100 bg-primary-100/75 hover:bg-primary-200" @click="sortBy('weight')">
                <p class="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-primary-900 opacity-70">
                  體重
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                  </svg>
                </p>
              </th>
              <th class="p-4 transition-colors cursor-pointer border-y border-primary-100 bg-primary-100/75 hover:bg-primary-200" @click="sortBy('bloodType')">
                <p class="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-primary-900 opacity-70">
                  血型
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                  </svg>
                </p>
              </th>
              <th class="p-4 transition-colors cursor-pointer border-y border-primary-100 bg-primary-100/75 hover:bg-primary-200" @click="sortBy('breed')">
                <p class="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-primary-900 opacity-70">
                  品種
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                  </svg>
                </p>
              </th>
              <th class="p-4 transition-colors cursor-pointer border-y border-primary-100 bg-primary-100/75 hover:bg-primary-200" @click="sortBy('sterilized')">
                <p class="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-primary-900 opacity-70">
                  結紮
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                  </svg>
                </p>
              </th>
              <th class="p-4 transition-colors cursor-pointer border-y border-primary-100 bg-primary-100/75 hover:bg-primary-200" @click="sortBy('admissionDate')">
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
              <th class="p-4 transition-colors cursor-pointer border-y border-primary-100 bg-primary-100/75 hover:bg-primary-200">
                <p class="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-primary-900 opacity-70"></p>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-if="showData.length > 0">
              <tr v-for="animal in showData" :key="animal._id" class="cursor-pointer hover:bg-primary-100" @click="this.$router.push(`/animal/${animal._id}`)">
                <td class="p-4 border-b border-primary-50">
                  <div class="flex items-center gap-3">
                    <img src="/image/1.jpg" class="relative inline-block h-9 w-9 !rounded-full object-cover object-center" />
                    <div class="flex flex-col">
                      <p class="block font-sans text-sm antialiased font-bold leading-normal text-primary-900"><i :class="animal.gender === 'male' ? 'text-primary-600 fa-solid fa-mars fa-fw' : 'text-pink-600 fa-solid fa-venus fa-fw'"></i> {{ animal.name }}</p>
                      <p v-show="animal.birthday != '1970-01-01T00:00:00.000Z' && animal.birthday != null" class="block font-sans text-sm antialiased font-normal leading-normal text-primary-900 opacity-70"><i :class="['fa-solid fa-fw', animalIcon(animal.type)]"> </i> {{ convertBirthdayToAge(animal.birthday).years }}歲 {{ convertBirthdayToAge(animal.birthday).months > 0 ? convertBirthdayToAge(animal.birthday).months + '個月' : '' }}</p>
                    </div>
                  </div>
                </td>
                <td class="p-4 border-b border-primary-50">
                  <div class="flex flex-col">
                    <p class="block font-sans text-sm antialiased font-normal leading-normal text-primary-900">{{ animal.weight ? animal.weight + ' 公斤' : '' }}</p>
                  </div>
                </td>
                <td class="p-4 border-b border-primary-50">
                  <div class="flex flex-col">
                    <p class="block font-sans text-sm antialiased font-normal leading-normal text-primary-900">{{ animal.bloodType ? animal.bloodType + ' 型' : '' }}</p>
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
                <td class="text-center border-b border-primary-50" @click="editToggle($event, animal._id)">
                  <button class="relative h-12 max-h-[60px] w-12 max-w-[60px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" type="button">
                    <span class="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                      <i class="text-xl text-primary-900 fa-solid fa-pen-to-square fa-fw"></i>
                    </span>
                  </button>
                </td>
                <td class="text-center border-b border-primary-50" @click="deleteAnimal($event, animal._id)">
                  <button class="relative h-12 max-h-[60px] w-12 max-w-[60px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" type="button">
                    <span class="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                      <i class="text-xl text-red-400 fa-solid fa-trash fa-fw"></i>
                    </span>
                  </button>
                </td>
              </tr>
            </template>
            <template v-else>
              <tr>
                <td class="h-[20px] text-center" colspan="7">
                  <img class="w-full max-h-[800px] object-cover" src="/image/empty.jpg" alt="" />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <!-- <div class="flex items-center justify-between p-4 border-t border-primary-50">
        <p class="block font-sans text-sm antialiased font-normal leading-normal text-primary-900">Page 1 of 10</p>
        <div class="flex gap-2">
          <button class="select-none rounded-lg border border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" type="button">上一頁</button>
          <button class="select-none rounded-lg border border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" type="button">下一頁</button>
        </div>
      </div> -->
    </div>
    <div v-show="createFormToggle" class="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-70">
      <div class="w-full max-w-xl bg-primary-50 rounded-xl">
        <VForm class="max-h-[100vh] lg:max-h-[80vh] overflow-y-auto p-4 lg:p-8" @submit="creatNewAnimal">
          <h2 class="mb-4 text-xl font-semibold text-center lg:text-2xl text-primary-900">新增動物資料</h2>
          <div class="space-y-4">
            <div class="grid items-center grid-cols-3">
              <label for="name" class="text-lg text-left text-primary-700">姓名</label>
              <VField id="name" v-model="createForm.name" name="name" type="text" rules="required" placeholder="姓名" class="col-span-2 p-1.5 text-sm border rounded-lg shadow-sm border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300" autocomplete="off" />
              <ErrorMessage class="col-span-3 mt-1 text-sm text-center text-red-600" name="name" />
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="gender" class="text-left text-primary-700">性別</label>
              <select id="gender" v-model="createForm.gender" name="gender" class="col-span-2 p-1.5 text-sm border rounded-lg shadow-sm border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300">
                <option value="male">男生</option>
                <option value="female">女生</option>
              </select>
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="weight" class="text-left text-primary-700">體重 (kg)</label>
              <VField id="weight" v-model="createForm.weight[0].value" name="weight" type="number" placeholder="體重 (kg)" class="col-span-2 p-1.5 text-sm border rounded-lg shadow-sm border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
            <div class="grid items-center grid-cols-3 gap-2">
              <label for="birthday" class="text-left text-primary-700">生日</label>
              <div class="flex items-center col-span-2 gap-2">
                <select v-model="birthdayType" class="p-1.5 text-sm border rounded-lg shadow-sm border-primary-200">
                  <option value="date">日期</option>
                  <option value="text">年齡</option>
                </select>
                <VField v-show="birthdayType === 'date'" id="birthday" v-model="createForm.birthday" name="birthdayDate" type="date" class="flex-grow p-1.5 text-sm border rounded-lg shadow-sm border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300" />
                <VField v-show="birthdayType === 'text'" id="birthday" v-model="createForm.birthday" name="birthdayText" type="number" class="flex-grow p-1.5 text-sm border rounded-lg shadow-sm border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300" placeholder="直接輸入年齡 ex:1.5" />
              </div>
            </div>

            <div class="grid items-center grid-cols-3">
              <label for="neutered" class="text-left text-primary-700">是否結紮</label>
              <select id="neutered" v-model="createForm.sterilized" name="neutered" class="col-span-2 p-1.5 text-sm border rounded-lg shadow-sm border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300">
                <option value="true">已結紮</option>
                <option value="false">未結紮</option>
              </select>
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="breed" class="text-left text-primary-700">品種</label>
              <VField id="breed" v-model="createForm.breed" name="breed" type="text" placeholder="品種" class="col-span-2 p-1.5 text-sm border rounded-lg shadow-sm border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300" autocomplete="off" />
            </div>
            <div class="grid items-center grid-cols-3 h-[34px]">
              <label class="text-left text-primary-700">血型</label>
              <div class="flex justify-between col-span-2">
                <label v-for="bloodType in ['A', 'B', 'AB', 'O']" :key="bloodType" class="rounded-lg">
                  <VField v-model="createForm.bloodType" type="radio" :value="bloodType" name="bloodType" class="hidden peer" />
                  <span class="px-2 py-1.5 transition-all rounded-lg shadow-md cursor-pointer lg:px-3 text-primary-800 bg-primary-100 peer-checked:bg-primary-500 peer-checked:text-white">{{ bloodType }}型</span>
                </label>
              </div>
            </div>
            <div class="grid items-center grid-cols-3 h-[34px]">
              <label class="text-left text-primary-700">種類</label>
              <div class="flex justify-between col-span-2 gap-2">
                <label v-for="type in ['cat', 'dog', 'other']" :key="type" class="min-w-[70px] rounded-lg">
                  <VField v-model="createForm.type" type="radio" :value="type" name="type" class="hidden peer" />
                  <span class="px-2 py-1.5 transition-all rounded-lg shadow-md cursor-pointer lg:px-3 text-primary-800 bg-primary-100 peer-checked:bg-primary-500 peer-checked:text-white"> <i :class="`fa-solid fa-fw ${animalIcon(type)}`"></i> {{ type === 'cat' ? '貓貓' : type === 'dog' ? '狗狗' : '其他' }} </span>
                </label>
              </div>
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="insulinBrand" class="text-left text-primary-700">胰島素品牌</label>
              <VField id="insulinBrand" v-model="createForm.insulinBrand" name="insulinBrand" type="text" placeholder="胰島素品牌" class="col-span-2 p-1.5 text-sm border rounded-lg shadow-sm border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300" autocomplete="off" />
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="admissionDate" class="text-left text-primary-700">入院日期</label>
              <VField id="admissionDate" v-model="createForm.admissionDate" name="admissionDate" type="date" class="col-span-2 p-1.5 text-sm border rounded-lg shadow-sm border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
          </div>
          <div class="flex justify-between mt-4 lg:mt-6">
            <button type="button" class="w-1/3 px-6 py-2 text-gray-700 transition-all bg-gray-300 rounded-lg shadow-md hover:bg-gray-400" @click="createFormToggle = false">取消</button>
            <button type="submit" class="w-1/3 px-6 py-2 text-white transition-all rounded-lg shadow-md bg-primary-500 hover:bg-primary-400">確定</button>
          </div>
        </VForm>
      </div>
    </div>
    <!-- //編輯 -->
    <div v-show="editFormToggle" class="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-70">
      <div class="w-full max-w-xl bg-primary-50 rounded-xl">
        <VForm class="max-h-[100vh] lg:max-h-[80vh] overflow-y-auto p-4 lg:p-8" @submit="editAnimal">
          <h2 class="mb-4 text-xl font-semibold text-center lg:text-2xl text-primary-900">修改動物資料</h2>
          <div class="space-y-4">
            <div class="grid items-center grid-cols-3">
              <label for="editName" class="text-lg text-left text-primary-700">姓名</label>
              <VField id="editName" v-model="editForm.name" name="editName" type="text" rules="required" placeholder="姓名" class="col-span-2 p-1.5 text-sm border rounded-lg shadow-sm border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300" autocomplete="off" />
              <ErrorMessage class="col-span-3 mt-1 text-sm text-center text-red-600" name="editName" />
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="editGender" class="text-left text-primary-700">性別</label>
              <select id="editGender" v-model="editForm.gender" name="editGender" class="col-span-2 p-1.5 text-sm border rounded-lg shadow-sm border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300">
                <option value="male">男生</option>
                <option value="female">女生</option>
              </select>
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="editWeight" class="text-left text-primary-700">體重 (kg)</label>
              <VField id="editWeight" v-model="editForm.weight[0].value" name="editWeight" type="number" placeholder="體重 (kg)" class="col-span-2 p-1.5 text-sm border rounded-lg shadow-sm border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="editBirthday" class="text-left text-primary-700">生日</label>
              <VField id="editBirthday" v-model="editForm.birthday" name="editBirthday" type="date" class="col-span-2 p-1.5 text-sm border rounded-lg shadow-sm border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="editNeutered" class="text-left text-primary-700">是否結紮</label>
              <select id="editNeutered" v-model="editForm.sterilized" name="editNeutered" class="col-span-2 p-1.5 text-sm border rounded-lg shadow-sm border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300">
                <option value="true">已結紮</option>
                <option value="false">未結紮</option>
              </select>
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="editBreed" class="text-left text-primary-700">品種</label>
              <VField id="editBreed" v-model="editForm.breed" name="editBreed" type="text" placeholder="品種" class="col-span-2 p-1.5 text-sm border rounded-lg shadow-sm border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300" autocomplete="off" />
            </div>
            <div class="grid items-center grid-cols-3 h-[34px]">
              <label class="text-left text-primary-700">血型</label>
              <div class="flex justify-between col-span-2">
                <label v-for="bloodType in ['A', 'B', 'AB', 'O']" :key="bloodType" class="rounded-lg">
                  <VField v-model="editForm.bloodType" type="radio" :value="bloodType" name="editBloodType" class="hidden peer" />
                  <span class="px-2 py-1.5 transition-all rounded-lg shadow-md cursor-pointer lg:px-3 text-primary-800 bg-primary-100 peer-checked:bg-primary-500 peer-checked:text-white">{{ bloodType }}型</span>
                </label>
              </div>
            </div>
            <div class="grid items-center grid-cols-3 h-[34px]">
              <label class="text-left text-primary-700">種類</label>
              <div class="flex justify-between col-span-2 gap-2">
                <label v-for="type in ['cat', 'dog', 'other']" :key="type" class="min-w-[70px] rounded-lg">
                  <VField v-model="editForm.type" type="radio" :value="type" name="editType" class="hidden peer" />
                  <span class="px-2 py-1.5 transition-all rounded-lg shadow-md cursor-pointer lg:px-3 text-primary-800 bg-primary-100 peer-checked:bg-primary-500 peer-checked:text-white"> <i :class="`fa-solid fa-fw ${animalIcon(type)}`"></i> {{ type === 'cat' ? '貓貓' : type === 'dog' ? '狗狗' : '其他' }} </span>
                </label>
              </div>
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="editInsulinBrand" class="text-left text-primary-700">胰島素品牌</label>
              <VField id="editInsulinBrand" v-model="editForm.insulinBrand" name="editInsulinBrand" type="text" placeholder="胰島素品牌" class="col-span-2 p-1.5 text-sm border rounded-lg shadow-sm border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300" autocomplete="off" />
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="editAdmissionDate" class="text-left text-primary-700">入院日期</label>
              <VField id="editAdmissionDate" v-model="editForm.admissionDate" name="editAdmissionDate" type="date" class="col-span-2 p-1.5 text-sm border rounded-lg shadow-sm border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
          </div>
          <div class="flex justify-between mt-4 lg:mt-6">
            <button type="button" class="w-1/3 px-6 py-2 text-gray-700 transition-all bg-gray-300 rounded-lg shadow-md hover:bg-gray-400" @click="editFormToggle = false">取消</button>
            <button type="submit" class="w-1/3 px-6 py-2 text-white transition-all rounded-lg shadow-md bg-primary-500 hover:bg-primary-400">確定</button>
          </div>
        </VForm>
      </div>
    </div>
  </div>
</template>
