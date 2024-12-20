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
        username: '',
        password: '',
        showPassword: false,
      },
    }
  },
  methods: {
    togglePassword() {
      this.loginFrom.showPassword = !this.loginFrom.showPassword
    },
    async login() {
      const { username, password } = this.loginFrom
      try {
        const payload = { username, password }
        const { data } = await axios.post(`${import.meta.env.VITE_API_PATH}/user/login`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        this.auth(data)
        this.$toast.success(data.message)
        document.cookie = `animalHospitalToken=${data.token}; expires=${new Date(data.expired)}`
        axios.defaults.headers.common.Authorization = `Bearer ${data.token}`
        this.$router.push('/animallist')
      } catch (error) {
        this.$toast.error(error.response.data.message)
      }
    },
    quicklogin() {
      this.loginFrom.username = 'admin'
      this.loginFrom.password = 'admin'
      console.log('A')
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
          <label for="username" class="text-primary-900">帳號</label>
          <VField id="username" v-model="loginFrom.username" name="username" rules="required|length:4,20" type="text" class="w-full h-8 pl-3 mt-2 rounded-md shadow-sm text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 focus:outline-none" placeholder="請輸入帳號" autocomplete="off" />
          <ErrorMessage class="mt-1 text-sm text-red-600" name="username" />
        </div>
        <div class="mb-4">
          <label for="password" class="text-primary-900">密碼</label>
          <div class="relative flex items-center mt-2">
            <VField id="password" v-model="loginFrom.password" name="password" rules="required|length:4,20" :type="loginFrom.showPassword ? 'text' : 'password'" class="w-full h-8 pl-3 rounded-md shadow-sm text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 focus:outline-none" placeholder="••••••••" autocomplete="off" />
            <button type="button" tabindex="-1" class="absolute flex items-center justify-center h-full text-gray-500 right-3 hover:text-primary-600" @click="togglePassword">
              <i v-if="!loginFrom.showPassword" class="fa-solid fa-eye-slash"></i>
              <i v-else class="fa-solid fa-eye text-primary-600"></i>
            </button>
          </div>
          <ErrorMessage class="mt-1 text-sm text-red-600" name="password" />
        </div>
        <button type="submit" class="w-full px-4 py-2 text-white rounded-md bg-primary-600 hover:bg-primary-700 outline-1 focus:outline-2 focus:outline-primary-500 focus:outline-offset-2 focus:outline-none">登入</button>
        <p class="mt-4 text-sm text-center text-primary-900">沒有帳號？<RouterLink to="/register" class="text-primary-600 hover:underline">註冊</RouterLink></p>
      </VForm>
      <button type="submit" class="w-full px-4 py-2 my-5 text-white bg-orange-600 rounded-md hover:bg-orange-700 outline-1 focus:outline-2 focus:outline-primary-500 focus:outline-offset-2 focus:outline-none" @click="quicklogin">DEMO用帳號密碼</button>
    </div>
  </div>
</template>
