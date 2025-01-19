<script>
import { mapActions } from 'pinia'
import authStore from '@/stores/auth'
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
      loginFrom: {
        role: '',
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
        axios.defaults.headers.common.Authorization = `Bearer ${data.token}`
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
      this.loginFrom.password = 'Hank!0688'
      this.loginFrom.role = 'hospital'
    },
    userlogin() {
      this.loginFrom.account = 'tianshiang'
      this.loginFrom.password = 'ted810714'
      this.loginFrom.role = 'user'
    },
    ...mapActions(authStore, ['auth']),
  },
  mounted() {},
}
</script>
<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="w-full h-full max-w-sm min-w-[330px] p-6 lg:bg-white lg:rounded-lg lg:shadow-lg lg:p-8">
      <h2 class="mb-6 text-2xl font-bold text-center text-primary-900">動物健康管理系統</h2>
      <VForm @submit="login">
        <div class="mb-4">
          <label for="role" class="text-primary-900">請選擇登入身份*</label>
          <VField id="role" v-model="loginFrom.role" name="role" as="select" rules="required" class="w-full h-8 pl-3 mt-2 rounded-md shadow-sm text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 focus:outline-none">
            <option value="" disabled selected>請選擇</option>
            <option value="user">飼主</option>
            <option value="hospital">醫院</option>
          </VField>
          <ErrorMessage class="mt-1 text-sm text-red-600" name="role" />
        </div>
        <div class="mb-4">
          <label for="account" class="text-primary-900">帳號</label>
          <VField id="account" v-model="loginFrom.account" name="account" rules="required|length:4,20" type="text" class="w-full h-8 pl-3 mt-2 rounded-md shadow-sm text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 focus:outline-none" placeholder="請輸入帳號" autocomplete="off" />
          <ErrorMessage class="mt-1 text-sm text-red-600" name="account" />
        </div>
        <div class="mb-4">
          <label for="password" class="text-primary-900">密碼</label>
          <div class="relative flex items-center mt-2">
            <VField id="password" v-model="loginFrom.password" name="password" rules="required|length:4,20" :type="loginFrom.showPassword ? 'text' : 'password'" class="w-full h-8 pl-3 rounded-md shadow-sm text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 focus:outline-none" placeholder="••••••••" autocomplete="off" />
            <button type="button" tabindex="-1" class="absolute flex items-center justify-center h-full text-gray-500 right-3 hover:text-primary-600" @click="togglePassword">
              <i v-show="!loginFrom.showPassword" class="fa-solid fa-eye-slash fa-fw"></i>
              <i v-show="loginFrom.showPassword" class="fa-solid fa-eye text-primary-600 fa-fw"></i>
            </button>
          </div>
          <ErrorMessage class="mt-1 text-sm text-red-600" name="password" />
        </div>
        <button type="submit" class="w-full px-4 py-2 text-white rounded-md bg-primary-600 hover:bg-primary-700 outline-1 focus:outline-2 focus:outline-primary-500 focus:outline-offset-2 focus:outline-none">登入</button>
        <p class="mt-4 text-sm text-center text-primary-900">沒有帳號？<RouterLink to="/register" class="text-primary-600 hover:underline">註冊</RouterLink></p>
      </VForm>
      <button type="submit" class="w-full px-4 py-2 my-5 text-white bg-orange-600 rounded-md hover:bg-orange-700 outline-1 focus:outline-2 focus:outline-primary-500 focus:outline-offset-2 focus:outline-none" @click="quicklogin">醫院DEMO用帳號密碼</button>
      <button type="submit" class="w-full px-4 py-2 my-5 text-white bg-green-600 rounded-md hover:bg-green-700 outline-1 focus:outline-2 focus:outline-primary-500 focus:outline-offset-2 focus:outline-none" @click="userlogin">飼主DEMO用帳號密碼</button>
    </div>
    <VueLoading :active="isLoading" :height="190" :width="190" loader="dots" color="#007BFF" />
  </div>
</template>
