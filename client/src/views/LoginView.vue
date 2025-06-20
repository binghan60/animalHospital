<script>
import { mapActions, mapState } from 'pinia'
import authStore from '@/stores/auth'
import axios from 'axios'
import { Field, Form, ErrorMessage } from 'vee-validate'
import { setAuthHeader } from '@/axiosConfig.js'
export default {
  inject: ['loadingConfig'],
  components: {
    VField: Field,
    VForm: Form,
    ErrorMessage,
  },
  data() {
    return {
      loginFrom: {
        role: 'hospital',
        account: '',
        password: '',
        showPassword: false,
      },
      isLoading: false,
    }
  },
  methods: {
    togglePassword() {
      this.loginFrom.showPassword = !this.loginFrom.showPassword
    },
    async login() {
      const { account, password, role } = this.loginFrom
      try {
        this.isLoading = true
        const payload = { account, password }
        const { data } = await axios.post(`${import.meta.env.VITE_API_PATH}/${role}/login`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        this.auth(data)
        this.$toast.success(data.message)
        document.cookie = `animalHospitalToken=${data.token}; Path=/; expires=${new Date(data.expiresAt).toUTCString()}`
        document.cookie = `animalHospitalRole=${data.role}; Path=/; expires=${new Date(data.expiresAt).toUTCString()}`
        setAuthHeader(data.token)
        if (role == 'user') {
          this.$router.push('/user/animallist')
        } else {
          this.$router.push('/hospital/animallist')
        }
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        this.$toast.error(error.response.data.message)
      }
    },
    quicklogin() {
      this.loginFrom.account = 'admin'
      this.loginFrom.password = 'adminadmin'
      this.loginFrom.role = 'hospital'
    },
    async userlogin() {
      this.loginFrom.account = '0952123259'
      this.loginFrom.password = 'admin'
      this.loginFrom.role = 'user'
      await this.login()
    },
    ...mapActions(authStore, ['auth']),
  },
  computed: {
    ...mapState(authStore, ['isDark']),
  },
}
</script>
<template>
  <div class="flex items-center justify-center lg:pb-0 pb-[10px]" style="height: calc(100vh - 58px - 4rem)">
    <div class="w-full max-w-sm min-w-[350px] max-h-[800px] p-6 lg:bg-white bg-primary-50 dark:lg:bg-darkPrimary-700 rounded-lg dark:bg-darkPrimary-800 lg:shadow-lg dark:shadow-none lg:p-8">
      <h2 class="mb-6 text-2xl font-bold text-center text-primary-900 dark:text-darkPrimary-50">動物健康管理系統</h2>
      <VForm @submit="login">
        <div class="mb-4">
          <label for="role" class="text-primary-900 dark:text-darkPrimary-50">請選擇登入身份</label>
          <VField id="role" v-model="loginFrom.role" name="role" as="select" rules="required" class="w-full h-8 pl-3 mt-2 rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-500 text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none">
            <option class="dark:bg-darkPrimary-500" value="hospital">醫院</option>
            <option class="dark:bg-darkPrimary-500" value="user">飼主</option>
          </VField>
          <ErrorMessage class="mt-1 text-sm text-red-600 dark:text-rose-400" name="role" />
        </div>
        <div class="mb-4">
          <label for="account" class="text-primary-900 dark:text-darkPrimary-50">帳號</label>
          <VField id="account" v-model="loginFrom.account" name="account" rules="required|length:4,20" type="text" class="w-full h-8 pl-3 mt-2 rounded-md shadow-sm dark:bg-darkPrimary-500 dark:text-darkPrimary-50 text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" placeholder="請輸入帳號" autocomplete="off" />
          <ErrorMessage class="mt-1 text-sm text-red-600 dark:text-rose-400" name="account" />
        </div>
        <div class="mb-4">
          <label for="password" class="text-primary-900 dark:text-darkPrimary-50">密碼</label>
          <div class="relative flex items-center mt-2">
            <VField id="password" v-model="loginFrom.password" name="password" rules="required|length:4,20" :type="loginFrom.showPassword ? 'text' : 'password'" class="w-full h-8 pl-3 rounded-md shadow-sm dark:bg-darkPrimary-500 text-primary-900 dark:text-darkPrimary-50 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" placeholder="••••••••" autocomplete="off" />
            <button type="button" tabindex="-1" class="absolute flex items-center justify-center h-full text-gray-500 right-3 hover:text-primary-600" @click="togglePassword">
              <i v-show="!loginFrom.showPassword" class="fa-solid fa-eye-slash fa-fw dark:text-darkPrimary-400"></i>
              <i v-show="loginFrom.showPassword" class="fa-solid fa-eye text-primary-600 fa-fw dark:text-darkPrimary-50"></i>
            </button>
          </div>
          <ErrorMessage class="mt-1 text-sm text-red-600 dark:text-rose-400" name="password" />
        </div>
        <button v-if="isLoading" class="inline-flex items-center justify-center w-full px-4 py-2 mt-4 rounded-md bg-primary-600 dark:bg-indigo-600 text-darkPrimary-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-auto" disabled="">
          <div class="w-4 h-4 border-2 border-white border-solid rounded-full animate-spin border-t-transparent"></div>
          <span class="ml-2">登入中... </span>
        </button>
        <button v-else type="submit" class="w-full px-4 py-2 mt-4 text-white rounded-md bg-primary-600 dark:bg-indigo-600 hover:dark:bg-indigo-700 hover:bg-primary-700 outline-1 focus:outline-2 focus:outline-primary-500 focus:outline-offset-2 focus:outline-none">登入</button>
        <div class="flex justify-between">
          <p class="mt-4 text-sm text-center text-primary-900 dark:text-darkPrimary-400">沒有帳號？<RouterLink to="/register" class="text-primary-600 hover:underline dark:text-darkPrimary-50">註冊</RouterLink></p>
          <p class="mt-4 text-sm text-center text-primary-900 dark:text-darkPrimary-400"><RouterLink to="/forget-password" class="text-primary-600 hover:underline dark:text-darkPrimary-50">忘記密碼</RouterLink></p>
        </div>
      </VForm>
      <!-- <button type="submit" class="w-full px-4 py-2 my-2 text-white bg-orange-500 rounded-md dark:bg-amber-600 hover:dark:bg-amber-700 hover:bg-orange-600 outline-1 focus:outline-2 focus:outline-amber-500 focus:outline-offset-2 focus:outline-none" @click="quicklogin">醫院DEMO帳號</button> -->
      <button type="submit" class="w-full px-4 py-2 my-2 text-white bg-green-600 rounded-md dark:bg-lime-600 hover:dark:bg-lime-700 hover:bg-green-700 outline-1 focus:outline-2 focus:outline-green-500 focus:outline-offset-2 focus:outline-none" @click="userlogin">牛奶看病專用</button>
    </div>
    <!-- <VueLoading :active="isLoading" :height="loadingConfig.height" :width="loadingConfig.width" :loader="loadingConfig.loader" :color="loadingConfig.getColor()" :backgroundColor="loadingConfig.backgroundColor()" /> -->
  </div>
</template>
