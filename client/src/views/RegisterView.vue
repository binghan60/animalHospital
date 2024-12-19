<script>
import { mapState } from 'pinia'
import apiStore from '@/stores/api'
export default {
  data() {
    return {
      username: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false,
    }
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    toggleConfirmPassword() {
      this.showConfirmPassword = !this.showConfirmPassword
    },
    async register() {
      if (!this.password || !this.password) {
        this.$toast.error('請輸入密碼')
        return
      }
      if (this.password !== this.confirmPassword) {
        this.$toast.error('密碼與確認密碼不一致')
        return
      }
      const { username, password, apipath } = this
      try {
        const response = await fetch(`${apipath}/user/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        })
        const registerResponse = await response.json()
        if (!response.ok) {
          this.$toast.error(registerResponse.message)
          return
        }

        this.$toast.success(registerResponse.message + ', 1秒後自動跳轉登入頁')
        setTimeout(() => {
          this.$router.push('/login')
        }, '1000')
      } catch (error) {
        this.$toast.error('伺服器忙碌中，請稍後再試。')
        console.error('register', error)
        throw error
      }
    },
  },
  computed: {
    ...mapState(apiStore, ['apipath']),
  },
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen p-6">
    <div class="w-full h-full max-w-sm min-w-[330px] p-6 lg:bg-white lg:rounded-lg lg:shadow-lg lg:p-8">
      <h2 class="mb-6 text-2xl font-bold text-center text-primary-900">註冊</h2>
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label for="username" class="text-primary-900">帳號</label>
          <input type="text" id="username" v-model="username" class="w-full h-8 pl-3 mt-2 rounded-md shadow-sm text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 focus:outline-none" placeholder="請輸入帳號" autocomplete="off" />
        </div>
        <div class="mb-4">
          <label for="password" class="text-primary-900">密碼</label>
          <div class="relative flex items-center mt-2">
            <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password" class="w-full h-8 pl-3 rounded-md shadow-sm text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 focus:outline-none" placeholder="••••••••" autocomplete="off" />
            <button type="button" tabindex="-1" class="absolute flex items-center justify-center h-full text-gray-500 right-3 hover:text-primary-600" @click="togglePassword">
              <i v-if="!showPassword" class="fa-solid fa-eye-slash"></i>
              <i v-else class="fa-solid fa-eye text-primary-600"></i>
            </button>
          </div>
        </div>
        <div class="mb-4">
          <label for="confirmPassword" class="text-primary-900">確認密碼</label>
          <div class="relative flex items-center mt-2">
            <input :type="showConfirmPassword ? 'text' : 'password'" id="confirmPassword" v-model="confirmPassword" class="w-full h-8 pl-3 rounded-md shadow-sm text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 focus:outline-none" placeholder="••••••••" autocomplete="off" />
            <button type="button" tabindex="-1" class="absolute flex items-center justify-center h-full text-gray-500 right-3 hover:text-primary-600" @click="toggleConfirmPassword">
              <i v-if="!showConfirmPassword" class="fa-solid fa-eye-slash"></i>
              <i v-else class="fa-solid fa-eye text-primary-600"></i>
            </button>
          </div>
        </div>
        <!-- Submit -->
        <button type="submit" class="w-full px-4 py-2 text-white rounded-md bg-primary-600 hover:bg-primary-700 outline-1 focus:outline-2 focus:outline-primary-500 focus:outline-offset-2 focus:outline-none" @click="register">註冊</button>
        <p class="mt-4 text-sm text-center text-primary-900">已經有帳號？<RouterLink to="/login" class="text-primary-600 hover:underline">登入</RouterLink></p>
      </form>
    </div>
  </div>
</template>
