<script>
import axios from 'axios'
import { Field, Form, ErrorMessage } from 'vee-validate'
import { mapState, mapActions } from 'pinia'
import authStore from '@/stores/auth'

export default {
  inject: ['loadingConfig'],
  components: { VField: Field, VForm: Form, ErrorMessage },
  data() {
    return {
      profile: {
        name: '',
        email: '',
        address: '',
        phone: '',
      },
      activeTab: 'view',
      isLoading: false,
      formattedDate: '',
    }
  },
  computed: {
    ...mapState(authStore, ['user', 'isDark']),
  },
  methods: {
    async getProfile() {
      try {
        this.isLoading = true
        const { role } = this.user
        const { data } = await axios.get(`${import.meta.env.VITE_API_PATH}/${role}/${this.user._id}`, { userId: this.user._id })
        this.profile.name = data.name
        this.profile.email = data.email
        this.profile.address = data.address
        this.profile.phone = data.phone
        const utcDate = new Date(data.createdAt)
        const gmtDate = new Date(utcDate.getTime() + 8 * 60 * 60 * 1000)
        this.formattedDate = gmtDate.toISOString().replace('T', ' ').substring(0, 10)
        this.isLoading = false
      } catch (error) {
        this.$toast.error(error.response.data.message)
        this.isLoading = false
      }
    },
    async updateProfile() {
      try {
        this.isLoading = true
        const { role } = this.user
        const payload = this.profile
        const { data } = await axios.put(`${import.meta.env.VITE_API_PATH}/${role}/${this.user._id}`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        this.$toast.success(data.message)
        this.isLoading = false
        this.auth(data.profile)
        this.activeTab = 'view'
      } catch (error) {
        this.$toast.error(error.response.data.message)
        this.isLoading = false
      }
    },
    switchTab(tab) {
      this.activeTab = tab
    },
    ...mapActions(authStore, ['auth']),
  },
  mounted() {
    this.getProfile()
  },
}
</script>

<template>
  <div>
    <h2 class="mb-4 font-mono text-xl font-semibold text-center text-primary-900 dark:text-darkPrimary-50 lg:text-2xl">會員中心</h2>
    <div class="w-full lg:flex">
      <div class="p-4 bg-gray-100 lg:w-1/4 dark:bg-darkPrimary-700">
        <ul class="space-y-2">
          <li>
            <button :class="['w-full p-2 text-center rounded-md ', activeTab === 'view' ? 'bg-primary-500 text-white dark:bg-indigo-500' : 'bg-primary-200 hover:bg-primary-300 dark:bg-indigo-200 dark:hover:bg-indigo-300']" @click="switchTab('view')">基本資料</button>
          </li>
          <li>
            <button :class="['w-full p-2 text-center rounded-md ', activeTab === 'edit' ? 'bg-primary-500 text-white dark:bg-indigo-500' : 'bg-primary-200 hover:bg-primary-300 dark:bg-indigo-200 dark:hover:bg-indigo-300']" @click="switchTab('edit')">編輯資料</button>
          </li>
        </ul>
      </div>
      <div class="p-4 bg-white lg:w-3/4 dark:bg-darkPrimary-700 lg:p-8">
        <div v-show="activeTab === 'view'" class="space-y-4 font-mono">
          <div class="flex">
            <p class="text-right text-gray-800 lg:text-lg min-w-20 lg:w-32 dark:text-darkPrimary-50">姓名：</p>
            <p class="text-gray-800 lg:text-lg dark:text-darkPrimary-50">{{ profile.name }}</p>
          </div>
          <div class="flex">
            <p class="text-right text-gray-800 lg:text-lg min-w-20 lg:w-32 dark:text-darkPrimary-50">信箱：</p>
            <p class="text-gray-800 lg:text-lg dark:text-darkPrimary-50">{{ profile.email }}</p>
          </div>
          <div class="flex">
            <p class="text-right text-gray-800 lg:text-lg min-w-20 lg:w-32 dark:text-darkPrimary-50">地址：</p>
            <p class="text-gray-800 lg:text-lg dark:text-darkPrimary-50">{{ profile.address }}</p>
          </div>
          <div class="flex">
            <p class="text-right text-gray-800 lg:text-lg min-w-20 lg:w-32 dark:text-darkPrimary-50">電話：</p>
            <p class="text-gray-800 lg:text-lg dark:text-darkPrimary-50">{{ profile.phone }}</p>
          </div>
          <div class="flex">
            <p class="text-right text-gray-800 lg:text-lg min-w-20 lg:w-32 dark:text-darkPrimary-50">註冊日期：</p>
            <p class="text-gray-800 lg:text-lg dark:text-darkPrimary-50">{{ formattedDate }}</p>
          </div>
        </div>
        <VForm v-show="activeTab === 'edit'" @submit="updateProfile">
          <div class="space-y-4">
            <div class="flex items-center">
              <label for="name" class="text-right w-14 lg:w-24 text-primary-700 dark:text-primary-300">姓名：</label>
              <VField id="name" v-model="profile.name" name="name" type="text" placeholder="姓名" class="flex-1 h-10 pl-3 border rounded-md shadow-sm border-primary-300 focus:outline-primary-500" autocomplete="off" />
            </div>
            <ErrorMessage class="text-sm text-center text-red-600" name="name" />

            <div class="flex items-center">
              <label for="email" class="text-right w-14 lg:w-24 text-primary-700 dark:text-primary-300">信箱：</label>
              <VField id="email" v-model="profile.email" name="email" type="email" rules="email" placeholder="信箱" class="flex-1 h-10 pl-3 border rounded-md shadow-sm border-primary-300 focus:outline-primary-500" autocomplete="off" />
            </div>
            <ErrorMessage class="block text-sm text-center text-red-600 dark:text-rose-400" name="email" />

            <div class="flex items-center">
              <label for="address" class="text-right w-14 lg:w-24 text-primary-700 dark:text-primary-300">地址：</label>
              <VField id="address" v-model="profile.address" name="address" type="text" placeholder="請輸入地址" class="flex-1 h-10 pl-3 border rounded-md shadow-sm border-primary-300 focus:outline-primary-500" autocomplete="off" />
            </div>

            <div class="flex items-center">
              <label for="phone" class="text-right w-14 lg:w-24 text-primary-700 dark:text-primary-300">電話：</label>
              <VField id="phone" v-model="profile.phone" name="phone" type="text" placeholder="請輸入電話" class="flex-1 h-10 pl-3 border rounded-md shadow-sm border-primary-300 focus:outline-primary-500" autocomplete="off" />
            </div>
          </div>

          <div class="flex justify-between mt-4 space-x-4 lg:mt-6">
            <button type="button" class="w-full lg:max-w-[200px] px-2 py-2 text-gray-700 transition-all bg-gray-300 rounded-lg shadow-md dark:bg-darkPrimary-50 hover:dark:bg-darkPrimary-400 hover:bg-gray-400" @click="switchTab('view')">取消</button>
            <button v-if="isLoading" class="flex items-center justify-center w-full lg:max-w-[200px] px-2 py-2 rounded-md bg-primary-600 dark:bg-indigo-600 text-darkPrimary-50 disabled:pointer-events-none disabled:opacity-50" disabled="">
              <div class="w-4 h-4 border-2 border-white border-solid rounded-full animate-spin border-t-transparent"></div>
              <span class="ml-2">送出中... </span>
            </button>
            <button v-else type="submit" class="w-full lg:max-w-[200px] px-2 py-2 text-white rounded-md bg-primary-600 dark:bg-indigo-600 hover:bg-primary-700 dark:hover:bg-indigo-700">確定</button>
          </div>
        </VForm>
      </div>
    </div>
    <VueLoading :active="isLoading" :height="loadingConfig.height" :width="loadingConfig.width" :loader="loadingConfig.loader" :color="loadingConfig.getColor()" :backgroundColor="loadingConfig.backgroundColor()" />
  </div>
</template>
