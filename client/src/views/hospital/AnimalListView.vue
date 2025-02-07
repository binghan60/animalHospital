<script>
import authStore from '@/stores/auth'
import { mapState } from 'pinia'
import axios from 'axios'
import { Field, Form, ErrorMessage } from 'vee-validate'
export default {
  inject: ['loadingConfig'],
  components: {
    VField: Field,
    VForm: Form,
    ErrorMessage,
  },
  data() {
    return {
      animalList: [],
      createForm: {
        avatar: '',
        avatarUrl: '',
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
        searchText: '',
      },
      editForm: {
        avatar: '',
        avatarUrl: '',
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
        searchText: '',
      },
      deleteForm: {
        animalId: '',
      },
      createFormToggle: false,
      editFormToggle: false,
      deleteFormToggle: false,
      deleteName: '',
      otherField: true,
      searchKeyword: '',
      filterType: '',
      birthdayType: 'date',
      isLoading: false,
      userList: [{ name: 'test' }, { name: 'test1' }, { name: 'example' }, { name: 'apple' }],
    }
  },
  methods: {
    async getUserAnimal() {
      try {
        this.isLoading = true
        const { data } = await axios.get(`${import.meta.env.VITE_API_PATH}/animal/${this.user._id}`)
        this.animalList = data
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        this.$toast.error(error.response.data.message)
      }
    },
    async createNewAnimal() {
      try {
        this.isLoading = true
        const formData = new FormData()
        formData.append('hospitalId', this.user._id)
        Object.keys(this.createForm).forEach(key => {
          if (key === 'weight' || key === 'sharedWith') {
            formData.append(key, JSON.stringify(this.createForm[key])) // 序列化陣列或物件
          } else {
            formData.append(key, this.createForm[key])
          }
        })
        await axios.post(`${import.meta.env.VITE_API_PATH}/animal/create`, formData)
        await this.getUserAnimal()
        this.createFormToggle = false
        this.createForm = {
          avatar: '',
          avatarUrl: '',
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
        this.isLoading = false
        this.$toast.success('新增成功')
      } catch (error) {
        this.isLoading = false
        this.$toast.error(error.response?.data?.message || '新增失敗')
      }
    },
    async editAnimal() {
      try {
        this.isLoading = true
        const formData = new FormData()
        Object.keys(this.editForm).forEach(key => {
          if (key === 'weight' || key === 'sharedWith') {
            formData.append(key, JSON.stringify(this.editForm[key])) // 序列化陣列或物件
          } else {
            formData.append(key, this.editForm[key])
          }
        })
        await axios.put(`${import.meta.env.VITE_API_PATH}/animal/edit`, formData)
        await this.getUserAnimal()
        this.editFormToggle = false
        this.isLoading = false
        this.$toast.success('修改成功')
      } catch (error) {
        this.isLoading = false
        this.$toast.error(error.response?.data?.message || '編輯失敗')
      }
    },
    async deleteAnimal() {
      if (this.deleteFormToggle) {
        try {
          this.isLoading = true
          const { data } = await axios.delete(`${import.meta.env.VITE_API_PATH}/animal/delete/${this.deleteForm._id}`)
          await this.getUserAnimal()
          this.isLoading = false
          this.$toast.success(data.message)
          this.deleteFormToggle = false
          this.deleteName = ''
        } catch (error) {
          this.isLoading = false
          this.$toast.error(error.response?.data?.message || '刪除失敗')
          this.deleteFormToggle = false
        }
      }
    },
    async getUserList() {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_PATH}/user/allUser`)
        this.userList = data
      } catch (error) {
        this.$toast.error(error.response.data.message)
      }
    },
    editToggle(event, animalId) {
      event.stopPropagation()
      const animal = this.animalList.find(x => x._id === animalId)
      const { _id, name, gender, weight, birthday, sterilized, breed, bloodType, type, insulinBrand, sharedWith, admissionDate } = animal
      this.editForm = {
        animalId: _id,
        avatarUrl: animal.avatar,
        name,
        gender,
        weight: [{ date: new Date().toISOString().slice(0, 10), value: weight ? weight : '' }],
        birthday: birthday ? new Date(birthday).toISOString().split('T')[0] : '',
        sterilized,
        breed,
        bloodType,
        type,
        insulinBrand,
        admissionDate: new Date(admissionDate).toISOString().slice(0, 10),
        sharedWith: [...sharedWith],
        searchText: '',
      }
      this.editFormToggle = true
    },
    deleteToggle(event, animal) {
      event.stopPropagation()
      this.deleteForm = animal
      this.deleteFormToggle = true
    },
    convertBirthdayToAge(dateString) {
      if (!dateString) {
        return ''
      }
      const birth = new Date(dateString)
      if (isNaN(birth.getTime())) {
        return ''
      }
      const today = new Date()
      let years = today.getFullYear() - birth.getFullYear()
      let months = today.getMonth() - birth.getMonth()
      if (months < 0) {
        years--
        months += 12
      }

      return months > 0 ? `${years}歲 ${months}個月` : `${years}歲`
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
    fileChange(type, event) {
      const form = type === 'create' ? this.createForm : this.editForm
      const file = event.target.files[0]
      form.avatar = file
      if (file) {
        form.avatarUrl = URL.createObjectURL(file)
      }
    },
    selectUser(type, item) {
      const form = type === 'create' ? this.createForm : this.editForm
      if (form.sharedWith.some(user => user._id === item._id)) {
        form.searchText = ''
      } else {
        form.sharedWith.push(item)
        form.searchText = ''
      }
    },
    removeUser(type, id) {
      const form = type === 'create' ? this.createForm : this.editForm
      const index = form.sharedWith.findIndex(user => user._id === id)
      if (index !== -1) {
        form.sharedWith.splice(index, 1)
      }
    },
  },

  computed: {
    ...mapState(authStore, ['user', 'token']),
    showData() {
      return this.animalList.filter(x => {
        const matchesName = x?.name?.toLowerCase().includes(this.searchKeyword?.toLowerCase() || '')
        const matchesType = this.filterType === '' || x.type === this.filterType
        return matchesName && matchesType
      })
    },
    filteredData() {
      if (this.createForm.searchText == '') {
        return this.userList
      } else {
        return this.userList.filter(item => item.account?.toLowerCase().includes(this.createForm.searchText?.toLowerCase()))
      }
    },
    editUserData() {
      if (this.editForm.searchText == '') {
        return this.userList
      } else {
        return this.userList.filter(item => item.account.toLowerCase().includes(this.editForm.searchText.toLowerCase()))
      }
    },
  },
  async mounted() {
    await this.getUserAnimal()
    await this.getUserList()
  },
}
</script>

<template>
  <div>
    <div class="relative flex flex-col w-full h-full text-gray-700 bg-white shadow-md dark:bg-darkPrimary-700 rounded-xl bg-clip-border">
      <div class="relative mx-4 mt-4 overflow-hidden text-gray-700 rounded-none bg-clip-border">
        <div class="flex items-center justify-between gap-8 mb-8">
          <div>
            <h5 class="block font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-primary-900 dark:text-darkPrimary-50">動物列表</h5>
          </div>
          <div class="flex flex-col gap-2 shrink-0 sm:flex-row">
            <button type="button" class="px-4 py-2 text-xs font-bold text-center text-gray-900 align-middle transition-all border border-gray-900 rounded-lg select-none dark:border-darkPrimary-300 dark:text-darkPrimary-50 dark:bg-darkPrimary-500 dark:hover:bg-darkPrimary-600" @click="((this.searchKeyword = ''), (this.filterType = ''))">清空搜尋條件</button>
            <button type="button" class="flex items-center gap-3 px-4 py-2 text-xs font-bold text-center text-white rounded-lg select-none bg-primary-600 dark:bg-indigo-600 hover:dark:bg-indigo-700 hover:bg-primary-700" @click="createFormToggle = true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" stroke-width="2" class="w-4 h-4">
                <path d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM19.75 7.5a.75.75 0 00-1.5 0v2.25H16a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H22a.75.75 0 000-1.5h-2.25V7.5z"></path>
              </svg>
              新增動物
            </button>
          </div>
        </div>
        <div class="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div class="w-full md:w-max">
            <ul role="tablist" class="relative flex flex-row p-1 min-w-[300px] rounded-lg bg-primary-100 dark:bg-darkPrimary-500 space-x-1">
              <li role="tab" class="relative flex items-center justify-center w-full h-full px-2 py-1 text-center rounded-md cursor-pointer select-none hover:bg-primary-200 hover:dark:bg-darkPrimary-600 text-primary-900" @click="this.filterType = ''">
                <div class="z-10 dark:text-darkPrimary-50">All</div>
                <div v-show="filterType === ''" class="absolute inset-0 h-full rounded-md shadow bg-primary-200 dark:bg-darkPrimary-700 z-5"></div>
              </li>
              <li role="tab" class="relative flex items-center justify-center w-full h-full px-2 py-1 text-center rounded-md cursor-pointer select-none hover:bg-primary-200 text-primary-900 hover:dark:bg-darkPrimary-600" @click="this.filterType = 'dog'">
                <div class="z-10 dark:text-darkPrimary-50"><i class="fa-solid fa-dog fa-fw"></i></div>
                <div v-show="filterType === 'dog'" class="absolute inset-0 h-full rounded-md shadow bg-primary-200 dark:bg-darkPrimary-700 z-5"></div>
              </li>
              <li role="tab" class="relative flex items-center justify-center w-full h-full px-2 py-1 text-center rounded-md cursor-pointer select-none hover:bg-primary-200 text-primary-900 hover:dark:bg-darkPrimary-600" @click="this.filterType = 'cat'">
                <div class="z-10 dark:text-darkPrimary-50"><i class="fa-solid fa-cat fa-fw"></i></div>
                <div v-show="filterType === 'cat'" class="absolute inset-0 h-full rounded-md shadow bg-primary-200 dark:bg-darkPrimary-700 z-5"></div>
              </li>
            </ul>
          </div>
          <div class="w-full max-w-xs">
            <input v-model="searchKeyword" type="text" class="w-full px-4 py-2 text-sm border rounded-md placeholder-primary-500 border-primary-200 focus:outline-none focus:ring-1 focus:ring-primary-400 dark:focus:ring-darkPrimary-400 dark:border-darkPrimary-200 dark:bg-darkPrimary-600 dark:text-darkPrimary-50 dark:placeholder-darkPrimary-400" placeholder="搜尋" />
          </div>
        </div>
      </div>
      <div class="p-6 px-0 overflow-auto h-[700px]">
        <table class="w-full mt-4 text-left table-auto min-w-max">
          <thead>
            <tr>
              <th class="p-4 transition-colors cursor-pointer border-y border-primary-100 bg-primary-100 hover:bg-primary-200 dark:bg-darkPrimary-500 hover:dark:bg-darkPrimary-600" @click="sortBy('name')">
                <p class="flex items-center justify-between gap-2 font-sans text-sm antialiased text-primary-900 dark:text-darkPrimary-50">
                  基本資料
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                  </svg>
                </p>
              </th>
              <th class="p-4 transition-colors cursor-pointer border-y border-primary-100 bg-primary-100 hover:bg-primary-200 dark:bg-darkPrimary-500 hover:dark:bg-darkPrimary-600" @click="sortBy('weight')">
                <p class="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-primary-900 dark:text-darkPrimary-50">
                  體重
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                  </svg>
                </p>
              </th>
              <th class="p-4 transition-colors cursor-pointer border-y border-primary-100 bg-primary-100 hover:bg-primary-200 dark:bg-darkPrimary-500 hover:dark:bg-darkPrimary-600" @click="sortBy('bloodType')">
                <p class="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-primary-900 dark:text-darkPrimary-50">
                  血型
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                  </svg>
                </p>
              </th>
              <th class="p-4 transition-colors cursor-pointer border-y border-primary-100 bg-primary-100 hover:bg-primary-200 dark:bg-darkPrimary-500 hover:dark:bg-darkPrimary-600" @click="sortBy('breed')">
                <p class="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-primary-900 dark:text-darkPrimary-50">
                  品種
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                  </svg>
                </p>
              </th>
              <th class="p-4 transition-colors cursor-pointer border-y border-primary-100 bg-primary-100 hover:bg-primary-200 dark:bg-darkPrimary-500 hover:dark:bg-darkPrimary-600" @click="sortBy('sterilized')">
                <p class="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-primary-900 dark:text-darkPrimary-50">
                  結紮
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                  </svg>
                </p>
              </th>
              <th class="p-4 transition-colors cursor-pointer border-y border-primary-100 bg-primary-100 hover:bg-primary-200 dark:bg-darkPrimary-500 hover:dark:bg-darkPrimary-600" @click="sortBy('admissionDate')">
                <p class="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-primary-900 dark:text-darkPrimary-50">
                  新增日期
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                  </svg>
                </p>
              </th>
              <th class="p-4 transition-colors border-y border-primary-100 bg-primary-100 dark:bg-darkPrimary-500">
                <p class="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-primary-900 dark:text-darkPrimary-50"></p>
              </th>
              <th class="p-4 transition-colors border-y border-primary-100 bg-primary-100 dark:bg-darkPrimary-500">
                <p class="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-primary-900 dark:text-darkPrimary-50"></p>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="animal in showData" :key="animal._id" class="cursor-pointer hover:bg-primary-50 dark:hover:bg-darkPrimary-600" @click="this.$router.push(`/hospital/animal/${animal._id}`)">
              <td class="p-4 border-b border-primary-50">
                <div class="flex items-center gap-3">
                  <img :src="animal.avatar ? animal.avatar : '/image/sampleAvatar.png'" class="relative inline-block h-9 w-9 !rounded-full object-cover object-center" />
                  <div class="flex flex-col">
                    <p class="block font-sans text-sm antialiased font-bold leading-normal text-primary-900 dark:text-darkPrimary-50"><i :class="animal.gender === 'male' ? 'text-primary-600 fa-solid fa-mars fa-fw' : 'text-pink-600 fa-solid fa-venus fa-fw'"></i> {{ animal.name }}</p>
                    <p v-show="animal.birthday != '1970-01-01T00:00:00.000Z' && animal.birthday != null" class="block font-sans text-sm antialiased font-normal leading-normal dark:text-darkPrimary-50 text-primary-900 opacity-70"><i :class="['fa-solid fa-fw', animalIcon(animal.type)]"></i> {{ convertBirthdayToAge(animal.birthday) }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4 border-b border-primary-50">
                <div class="flex flex-col">
                  <p class="block font-sans text-sm antialiased font-normal leading-normal text-primary-900 dark:text-darkPrimary-50">{{ animal.weight ? animal.weight + ' 公斤' : '' }}</p>
                </div>
              </td>
              <td class="p-4 border-b border-primary-50">
                <div class="flex flex-col">
                  <p class="block font-sans text-sm antialiased font-normal leading-normal text-primary-900 dark:text-darkPrimary-50">{{ animal.bloodType ? animal.bloodType + ' 型' : '' }}</p>
                </div>
              </td>
              <td class="p-4 border-b border-primary-50">
                <div class="flex flex-col">
                  <p class="block font-sans text-sm antialiased font-normal leading-normal text-primary-900 dark:text-darkPrimary-50">{{ animal.breed }}</p>
                </div>
              </td>
              <td class="p-4 border-b border-primary-50">
                <div class="w-max">
                  <div :class="[animal.sterilized ? 'text-green-900' : 'text-red-900', animal.sterilized ? 'bg-green-700/20 dark:bg-green-700/50' : 'bg-red-500/20 dark:bg-red-500/50']" class="relative grid items-center px-2 py-1 font-sans text-xs font-bold uppercase rounded-md select-none whitespace-nowrap dark:text-darkPrimary-50">
                    <span>{{ animal.sterilized ? '是' : '否' }}</span>
                  </div>
                </div>
              </td>
              <td class="p-4 border-b border-primary-50">
                <p class="block font-sans text-sm antialiased font-normal leading-normal text-primary-900 dark:text-darkPrimary-50">{{ new Date(animal.admissionDate).toISOString().slice(0, 10) }}</p>
              </td>
              <td class="text-center border-b border-primary-50" @click="editToggle($event, animal._id)">
                <button class="relative h-12 max-h-[60px] w-12 max-w-[60px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" type="button">
                  <span class="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                    <i class="text-xl text-primary-900 fa-solid fa-pen-to-square fa-fw dark:text-darkPrimary-50"></i>
                  </span>
                </button>
              </td>
              <td class="text-center border-b border-primary-50" @click="deleteToggle($event, animal)">
                <button class="relative h-12 max-h-[60px] w-12 max-w-[60px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" type="button">
                  <span class="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                    <i class="text-xl text-red-400 fa-solid fa-trash fa-fw"></i>
                  </span>
                </button>
              </td>
            </tr>
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
    <div v-show="createFormToggle" class="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-70" @mousedown="createFormToggle = false">
      <div class="w-full max-w-xl bg-white lg:rounded-xl dark:bg-darkPrimary-700" @mousedown.stop>
        <VForm class="max-h-[100vh] lg:max-h-[80vh] overflow-y-auto p-4 lg:p-8" @submit="createNewAnimal">
          <h2 class="mb-4 text-xl font-semibold text-center lg:text-2xl text-primary-900 dark:text-darkPrimary-50">新增動物資料</h2>
          <div class="space-y-4">
            <div class="w-full h-[200px] lg:h-[300px] bg-gray-200 rounded-lg cursor-pointer" @click="this.$refs.createFile.click()">
              <input ref="createFile" class="hidden" type="file" accept="image/png, image/jpeg" @change="fileChange('create', $event)" />
              <img class="object-cover w-full h-full rounded-lg" :src="createForm.avatar ? createForm.avatarUrl : '/image/sampleAvatar.png'" />
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="name" class="text-left text-primary-700 dark:text-darkPrimary-50">姓名</label>
              <VField id="name" v-model="createForm.name" name="name" type="text" rules="required" placeholder="姓名" class="h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
              <ErrorMessage class="col-span-3 mt-1 text-sm text-center text-red-600 dark:text-rose-400" name="name" />
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="gender" class="text-left text-primary-700 dark:text-darkPrimary-50">性別</label>
              <select id="gender" v-model="createForm.gender" name="gender" class="h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none">
                <option value="male">男生</option>
                <option value="female">女生</option>
              </select>
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="weight" class="text-left text-primary-700 dark:text-darkPrimary-50">體重 (kg)</label>
              <VField id="weight" v-model="createForm.weight[0].value" name="weight" type="number" placeholder="體重 (kg)" class="h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" />
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="birthday" class="text-left text-primary-700 dark:text-darkPrimary-50">生日</label>
              <div class="flex items-center col-span-2 gap-2">
                <select v-model="birthdayType" class="p-1.5 text-sm border rounded-lg shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none">
                  <option value="date">日期</option>
                  <option value="text">年齡</option>
                </select>
                <VField v-show="birthdayType === 'date'" id="birthday" v-model="createForm.birthday" name="birthdayDate" type="date" class="flex-grow p-1.5 text-sm border rounded-lg shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" />
                <VField v-show="birthdayType === 'text'" id="birthday" v-model="createForm.birthday" name="birthdayText" type="number" class="flex-grow p-1.5 text-sm border rounded-lg shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-500 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-300 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" placeholder="直接輸入年齡 ex:1.5" />
              </div>
            </div>

            <div class="grid items-center grid-cols-3">
              <label for="neutered" class="text-left text-primary-700 dark:text-darkPrimary-50">是否結紮</label>
              <select id="neutered" v-model="createForm.sterilized" name="neutered" class="h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none">
                <option value="true">已結紮</option>
                <option value="false">未結紮</option>
              </select>
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="breed" class="text-left text-primary-700 dark:text-darkPrimary-50">品種</label>
              <VField id="breed" v-model="createForm.breed" name="breed" type="text" placeholder="品種" class="h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
            </div>
            <div class="grid items-center grid-cols-3 h-[34px]">
              <label class="text-left text-primary-700 dark:text-darkPrimary-50">血型</label>
              <div class="flex justify-between col-span-2">
                <label v-for="bloodType in ['A', 'B', 'AB', 'O']" :key="bloodType" class="rounded-lg">
                  <VField v-model="createForm.bloodType" type="radio" :value="bloodType" name="bloodType" class="hidden peer" />
                  <span class="px-1.5 py-1.5 transition-all rounded-lg shadow-md cursor-pointer lg:px-3 text-primary-800 dark:text-darkPrimary-50 dark:bg-darkPrimary-600 bg-primary-100 peer-checked:bg-primary-500 dark:peer-checked:bg-darkPrimary-200 peer-checked:text-white dark:hover:bg-darkPrimary-500 dark:peer-checked:text-darkPrimary-600">{{ bloodType }}型</span>
                </label>
              </div>
            </div>
            <div class="grid items-center grid-cols-3 h-[34px]">
              <label class="text-left text-primary-700 dark:text-darkPrimary-50">種類</label>
              <div class="flex justify-between col-span-2 gap-2">
                <label v-for="type in ['cat', 'dog', 'other']" :key="type" class="min-w-[70px] rounded-lg">
                  <VField v-model="createForm.type" type="radio" :value="type" name="type" class="hidden peer" />
                  <span class="px-1.5 py-1.5 transition-all rounded-lg shadow-md cursor-pointer lg:px-3 text-primary-800 dark:text-darkPrimary-50 dark:bg-darkPrimary-600 bg-primary-100 peer-checked:bg-primary-500 dark:peer-checked:bg-darkPrimary-200 peer-checked:text-white dark:hover:bg-darkPrimary-500 dark:peer-checked:text-darkPrimary-600"> <i :class="`fa-solid fa-fw ${animalIcon(type)}`"></i> {{ type === 'cat' ? '貓貓' : type === 'dog' ? '狗狗' : '其他' }} </span>
                </label>
              </div>
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="insulinBrand" class="text-left text-primary-700 dark:text-darkPrimary-50">胰島素品牌</label>
              <VField id="insulinBrand" v-model="createForm.insulinBrand" name="insulinBrand" type="text" placeholder="胰島素品牌" class="h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
            </div>
            <div class="relative grid items-center grid-cols-3">
              <label for="shareWith" class="text-left text-primary-700 dark:text-darkPrimary-50">資料共享</label>
              <VField id="shareWith" v-model="createForm.searchText" name="shareWith" type="text" placeholder="請輸入用戶帳號(手機號碼)" class="h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
              <!-- 顯示過濾結果 -->
              <div v-if="filteredData.length && createForm.searchText" class="absolute left-0 right-0 z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg top-full">
                <ul class="overflow-y-auto max-h-48">
                  <li v-for="item in filteredData" :key="item._id" class="px-4 py-2 cursor-pointer hover:bg-gray-100" @click="selectUser('create', item)">
                    {{ item.account }}
                  </li>
                </ul>
              </div>
            </div>
            <div class="grid col-span-3 gap-2 lg:grid-cols-2">
              <span v-for="user in createForm.sharedWith" :key="user._id" class="block col-span-1 px-1 py-2 transition-all rounded-lg shadow-md cursor-pointer hover:bg-primary-200 dark:hover:bg-darkPrimary-500 dark:bg-darkPrimary-600 lg:px-3 dark:text-darkPrimary-50 text-primary-800 bg-primary-100">
                <i class="w-6 h-6 text-base rounded-full fa-solid fa-x fa-fw hover:bg-primary-400 bg-primary-200" @click="removeUser('create', user._id)"></i>
                {{ user.account }}
              </span>
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="admissionDate" class="text-left text-primary-700 dark:text-darkPrimary-50">新增日期</label>
              <VField id="admissionDate" v-model="createForm.admissionDate" name="admissionDate" type="date" class="h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" />
            </div>
          </div>
          <div class="flex justify-between mt-4 lg:mt-6">
            <button type="button" class="w-1/3 px-6 py-2 text-gray-700 transition-all bg-gray-300 rounded-lg shadow-md dark:bg-darkPrimary-50 hover:dark:bg-darkPrimary-400 hover:bg-gray-400" @click="createFormToggle = false">取消</button>
            <button v-if="isLoading" class="inline-flex items-center justify-center w-1/3 px-6 py-2 rounded-md bg-primary-600 dark:bg-indigo-600 text-darkPrimary-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-auto" disabled="">
              <div class="w-4 h-4 border-2 border-white border-solid rounded-full animate-spin border-t-transparent"></div>
              <span class="ml-2">新增中... </span>
            </button>
            <button v-else type="submit" class="w-1/3 px-4 py-2 text-white rounded-md bg-primary-600 dark:bg-indigo-600 hover:dark:bg-indigo-700 hover:bg-primary-700 outline-1 focus:outline-2 focus:outline-primary-500 focus:outline-offset-2 focus:outline-none">新增</button>
          </div>
        </VForm>
      </div>
    </div>
    <!-- //編輯 -->
    <div v-show="editFormToggle" class="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-70" @mousedown="editFormToggle = false">
      <div class="w-full max-w-xl bg-white lg:rounded-xl dark:bg-darkPrimary-700" @mousedown.stop>
        <VForm class="max-h-[100vh] lg:max-h-[80vh] overflow-y-auto p-4 lg:p-8" @submit="editAnimal">
          <h2 class="mb-4 text-xl font-semibold text-center lg:text-2xl text-primary-900 dark:text-darkPrimary-50">修改動物資料</h2>
          <div class="space-y-4">
            <div class="w-full h-[200px] lg:h-[300px] bg-gray-200 cursor-pointer rounded-lg" @click="this.$refs.editFile.click()">
              <input ref="editFile" class="hidden" type="file" accept="image/png, image/jpeg" @change="fileChange('edit', $event)" />
              <img class="object-cover w-full h-full rounded-lg" :src="editForm.avatarUrl ? editForm.avatarUrl : '/image/sampleAvatar.png'" />
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="editName" class="text-lg text-left text-primary-700 dark:text-darkPrimary-50">姓名</label>
              <VField id="editName" v-model="editForm.name" name="editName" type="text" rules="required" placeholder="姓名" class="h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
              <ErrorMessage class="col-span-3 mt-1 text-sm text-center text-red-600 dark:text-rose-400" name="editName" />
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="editGender" class="text-left text-primary-700 dark:text-darkPrimary-50">性別</label>
              <select id="editGender" v-model="editForm.gender" name="editGender" class="h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none">
                <option value="male">男生</option>
                <option value="female">女生</option>
              </select>
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="editWeight" class="text-left text-primary-700 dark:text-darkPrimary-50">體重 (kg)</label>
              <VField id="editWeight" v-model="editForm.weight[0].value" name="editWeight" type="number" placeholder="體重 (kg)" class="h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" />
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="editBirthday" class="text-left text-primary-700 dark:text-darkPrimary-50">生日</label>
              <VField id="editBirthday" v-model="editForm.birthday" name="editBirthday" type="date" class="h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" />
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="editNeutered" class="text-left text-primary-700 dark:text-darkPrimary-50">是否結紮</label>
              <select id="editNeutered" v-model="editForm.sterilized" name="editNeutered" class="h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none">
                <option value="true">已結紮</option>
                <option value="false">未結紮</option>
              </select>
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="editBreed" class="text-left text-primary-700 dark:text-darkPrimary-50">品種</label>
              <VField id="editBreed" v-model="editForm.breed" name="editBreed" type="text" placeholder="品種" class="h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
            </div>
            <div class="grid items-center grid-cols-3 h-[34px]">
              <label class="text-left text-primary-700 dark:text-darkPrimary-50">血型</label>
              <div class="flex justify-between col-span-2">
                <label v-for="bloodType in ['A', 'B', 'AB', 'O']" :key="bloodType" class="rounded-lg">
                  <VField v-model="editForm.bloodType" type="radio" :value="bloodType" name="editBloodType" class="hidden peer" />
                  <span class="px-1.5 py-1.5 transition-all rounded-lg shadow-md cursor-pointer lg:px-3 text-primary-800 dark:text-darkPrimary-50 dark:bg-darkPrimary-600 bg-primary-100 peer-checked:bg-primary-500 dark:peer-checked:bg-darkPrimary-200 dark:hover:bg-darkPrimary-500 peer-checked:text-white dark:peer-checked:text-darkPrimary-600">{{ bloodType }}型</span>
                </label>
              </div>
            </div>
            <div class="grid items-center grid-cols-3 h-[34px]">
              <label class="text-left text-primary-700 dark:text-darkPrimary-50">種類</label>
              <div class="flex justify-between col-span-2 gap-2">
                <label v-for="type in ['cat', 'dog', 'other']" :key="type" class="min-w-[70px] rounded-lg">
                  <VField v-model="editForm.type" type="radio" :value="type" name="editType" class="hidden peer" />
                  <span class="px-1.5 py-1.5 transition-all rounded-lg shadow-md cursor-pointer lg:px-3 text-primary-800 dark:text-darkPrimary-50 dark:bg-darkPrimary-600 bg-primary-100 peer-checked:bg-primary-500 dark:peer-checked:bg-darkPrimary-200 peer-checked:text-white dark:hover:bg-darkPrimary-500 dark:peer-checked:text-darkPrimary-600"> <i :class="`fa-solid fa-fw ${animalIcon(type)}`"></i> {{ type === 'cat' ? '貓貓' : type === 'dog' ? '狗狗' : '其他' }} </span>
                </label>
              </div>
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="editInsulinBrand" class="text-left text-primary-700 dark:text-darkPrimary-50">胰島素品牌</label>
              <VField id="editInsulinBrand" v-model="editForm.insulinBrand" name="editInsulinBrand" type="text" placeholder="胰島素品牌" class="h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
            </div>
            <div class="relative grid items-center grid-cols-3">
              <label for="editShareWith" class="text-left text-primary-700 dark:text-darkPrimary-50">資料共享</label>
              <VField id="editShareWith" v-model="editForm.searchText" name="editShareWith" type="text" placeholder="請輸入用戶暱稱" class="h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
              <!-- 顯示過濾結果 -->
              <div v-if="editUserData.length && editForm.searchText" class="absolute left-0 right-0 z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg top-full">
                <ul class="overflow-y-auto max-h-48">
                  <li v-for="item in editUserData" :key="item._id" class="px-4 py-2 cursor-pointer hover:bg-gray-100" @click="selectUser('edit', item)">
                    {{ item.account }}
                  </li>
                </ul>
              </div>
            </div>
            <div class="grid col-span-3 gap-2 lg:grid-cols-2">
              <span v-for="user in editForm.sharedWith" :key="user._id" class="block col-span-1 px-1 py-2 transition-all rounded-lg shadow-md cursor-pointer hover:bg-primary-200 dark:hover:bg-darkPrimary-500 dark:bg-darkPrimary-600 lg:px-3 dark:text-darkPrimary-50 text-primary-800 bg-primary-100" @click="removeUser('edit', user._id)">
                <i class="w-6 h-6 text-base rounded-full fa-solid fa-x fa-fw"></i>
                {{ user.account }}
              </span>
            </div>
            <div class="grid items-center grid-cols-3">
              <label for="editAdmissionDate" class="text-left text-primary-700 dark:text-darkPrimary-50">新增日期</label>
              <VField id="editAdmissionDate" v-model="editForm.admissionDate" name="editAdmissionDate" type="date" class="h-8 col-span-2 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" />
            </div>
          </div>
          <div class="flex justify-between mt-4 lg:mt-6">
            <button type="button" class="w-1/3 px-6 py-2 text-gray-700 transition-all bg-gray-300 rounded-lg shadow-md dark:bg-darkPrimary-50 hover:dark:bg-darkPrimary-400 hover:bg-gray-400" @click="editFormToggle = false">取消</button>
            <button v-if="isLoading" class="inline-flex items-center justify-center w-1/3 px-6 py-2 rounded-md bg-primary-600 dark:bg-indigo-600 text-darkPrimary-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-auto" disabled="">
              <div class="w-4 h-4 border-2 border-white border-solid rounded-full animate-spin border-t-transparent"></div>
              <span class="ml-2">修改中... </span>
            </button>
            <button v-else type="submit" class="w-1/3 px-4 py-2 text-white rounded-md bg-primary-600 dark:bg-indigo-600 hover:dark:bg-indigo-700 hover:bg-primary-700 outline-1 focus:outline-2 focus:outline-primary-500 focus:outline-offset-2 focus:outline-none">修改</button>
          </div>
        </VForm>
      </div>
    </div>
    <div v-show="deleteFormToggle" class="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-70" @mousedown="deleteFormToggle = false">
      <div class="w-full max-w-xl bg-white lg:rounded-xl dark:bg-darkPrimary-700" @mousedown.stop>
        <VForm class="max-h-[100vh] lg:max-h-[80vh] overflow-y-auto p-4 lg:p-8" @submit="deleteAnimal">
          <h2 class="mb-4 text-xl font-semibold text-center lg:text-2xl text-primary-900 dark:text-darkPrimary-50">
            是否要刪除
            <span class="text-red-600 dark:text-rose-500">{{ deleteForm.name }}</span>
            資料
          </h2>
          <h6 class="p-2 mb-4 text-xl text-center text-yellow-800 bg-yellow-400 border-2 border-yellow-500 rounded-lg dark:text-amber-600 dark:bg-yellow-300"><i class="mr-2 text-2xl fa-solid fa-triangle-exclamation"></i> 注意！所有血糖紀錄及血糖曲線都將被刪除。</h6>
          <div class="space-y-4">
            <div class="grid items-center grid-cols-3">
              <VField id="deleteName" v-model="deleteName" name="deleteName" type="text" rules="required|deleteConfirmed:@deleteConfirm" placeholder="請輸入欲刪除動物名稱" class="h-8 col-span-3 pl-3 mb-4 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
              <VField id="deleteConfirm" v-model="deleteForm.name" name="deleteConfirm" type="text" placeholder="" class="hidden" autocomplete="off" />
              <ErrorMessage class="col-span-3 mt-1 text-sm text-center text-red-600 dark:text-rose-400" name="deleteName" />
            </div>
          </div>
          <div class="flex justify-between mt-4 lg:mt-6">
            <button type="button" class="w-1/3 px-6 py-2 text-gray-700 transition-all bg-gray-300 rounded-lg shadow-md dark:bg-darkPrimary-50 hover:dark:bg-darkPrimary-400 hover:bg-gray-400" @click="deleteFormToggle = false">取消</button>
            <button v-if="isLoading" class="inline-flex items-center justify-center w-1/3 px-6 py-2 rounded-md bg-primary-600 dark:bg-indigo-600 text-darkPrimary-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-auto" disabled="">
              <div class="w-4 h-4 border-2 border-white border-solid rounded-full animate-spin border-t-transparent"></div>
              <span class="ml-2">刪除中... </span>
            </button>
            <button v-else type="submit" class="w-1/3 px-4 py-2 text-white rounded-md bg-primary-600 dark:bg-indigo-600 hover:dark:bg-indigo-700 hover:bg-primary-700 outline-1 focus:outline-2 focus:outline-primary-500 focus:outline-offset-2 focus:outline-none">刪除</button>
          </div>
        </VForm>
      </div>
    </div>
    <VueLoading :active="isLoading" :height="loadingConfig.height" :width="loadingConfig.width" :loader="loadingConfig.loader" :color="loadingConfig.getColor()" :backgroundColor="loadingConfig.backgroundColor()" />
  </div>
</template>
