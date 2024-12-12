<script>
import { mapState, mapActions } from 'pinia'
import apiStore from '@/stores/api.js'
import authStore from '@/stores/auth.js'
export default {
  data() {
    return {
      username: '',
      password: '',
      showPassword: false,
    }
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    async login() {
      const { username, password, apipath } = this
      if (!username || !password) {
        this.$toast.error('請輸入帳號密碼')
        return
      }
      try {
        const response = await fetch(`${apipath}/user/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        })
        const loginResponse = await response.json()
        if (!response.ok) {
          this.$toast.error(loginResponse.message)
          return
        }
        this.auth(loginResponse)
        this.$toast.success(loginResponse.message)
        this.$router.push('/animallist')
        document.cookie = `animalHospitalToken=${loginResponse.token}; expires=${new Date(loginResponse.expired)}`
      } catch (error) {
        this.$toast.error('伺服器忙碌中，請稍後再試。')
        console.error('login', error)
        throw error
      }
    },
    quicklogin() {
      this.username = 'admin'
      this.password = 'admin'
    },
    ...mapActions(authStore, ['auth']),
  },
  computed: {
    ...mapState(apiStore, ['apipath']),
  },
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen p-6 bg-primary-100">
    <div class="w-full max-w-sm min-w-[330px] p-6 bg-white rounded-lg shadow-lg lg:p-8">
      <h2 class="mb-6 text-2xl font-bold text-center text-gray-800">動物健康管理系統</h2>
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label for="username" class="text-gray-700">帳號</label>
          <input type="text" id="username" v-model="username" class="w-full h-8 pl-3 mt-1 border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:border-2 focus:outline-none" placeholder="請輸入帳號" autocomplete="off" />
        </div>
        <div class="mb-4">
          <label for="password" class="text-gray-700">密碼</label>
          <div class="relative flex items-center mt-1">
            <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password" class="w-full h-8 pl-3 pr-10 border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:border-2 focus:outline-none" placeholder="••••••••" />
            <button type="button" tabindex="-1" class="absolute inset-y-0 flex items-center justify-center text-gray-500 right-3 hover:text-primary-600" @click="togglePassword">
              <i v-if="!showPassword" class="fa-solid fa-eye-slash"></i>
              <i v-else class="fa-solid fa-eye"></i>
            </button>
          </div>
        </div>
        <button type="submit" class="w-full px-4 py-2 text-white rounded-md bg-primary-600 hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none" @click="login">登入</button>
        <button type="submit" class="w-full px-4 py-2 my-5 text-white rounded-md bg-primary-600 hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none" @click="quicklogin">快速填入帳號密碼</button>
        <p class="mt-4 text-sm text-center text-gray-600">沒有帳號？<RouterLink to="/register" class="text-primary-600 hover:underline">註冊</RouterLink></p>
      </form>
    </div>
  </div>
</template>
