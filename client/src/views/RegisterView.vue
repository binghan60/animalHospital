<script>
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
      registerForm: {
        username: '',
        password: '',
        confirmPassword: '',
        showPassword: false,
        showConfirmPassword: false,
      },
    }
  },
  methods: {
    async register() {
      if (!this.registerForm.password || !this.registerForm.password) {
        this.$toast.error('請輸入密碼')
        return
      }
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.$toast.error('密碼與確認密碼不一致')
        return
      }
      try {
        const { username, password } = this.registerForm
        const payload = {
          username,
          password,
        }
        const { data } = await axios.post(`${import.meta.env.VITE_API_PATH}/user/register`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        this.$toast.success(data.message + ', 1秒後自動跳轉登入頁')
        setTimeout(() => {
          this.$router.push('/login')
        }, '1000')
      } catch (error) {
        this.$toast.error(error.response.data.message)
      }
    },
    validateUsername(value) {
      if (!value) {
        return '此欄位為必填'
      }
      return true
    },
    onSubmit(values) {
      console.log(values)
    },
  },
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen p-6">
    <div class="w-full h-full max-w-sm min-w-[330px] p-6 lg:bg-white lg:rounded-lg lg:shadow-lg lg:p-8">
      <h2 class="mb-6 text-2xl font-bold text-center text-primary-hfs900">註冊</h2>
      <VForm @submit="onSubmit">
        <div class="mb-4">
          <label for="username" class="text-primary-900">帳號</label>
          <VField id="username" v-model="registerForm.username" type="text" name="username" rules="required|length:6,20" class="w-full h-8 pl-3 mt-2 rounded-md shadow-sm text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 focus:outline-none" placeholder="請輸入帳號" autocomplete="off" />
          <ErrorMessage class="mt-1 text-sm text-red-600" name="username" />
        </div>
        <div class="mb-4">
          <label for="password" class="text-primary-900">密碼</label>
          <div class="relative flex items-center mt-2">
            <VField id="password" v-model="registerForm.password" :type="registerForm.showPassword ? 'text' : 'password'" rules="required|length:6,20" name="password" class="w-full h-8 pl-3 rounded-md shadow-sm text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 focus:outline-none" placeholder="••••••••" autocomplete="off" />
            <button type="button" tabindex="-1" class="absolute flex items-center justify-center h-full text-gray-500 right-3 hover:text-primary-600" @click="registerForm.showPassword = !registerForm.showPassword">
              <i v-if="!registerForm.showPassword" class="fa-solid fa-eye-slash"></i>
              <i v-else class="fa-solid fa-eye text-primary-600"></i>
            </button>
          </div>
          <ErrorMessage class="mt-1 text-sm text-red-600" name="password" />
        </div>
        <div class="mb-4">
          <label for="confirmPassword" class="text-primary-900">確認密碼</label>
          <div class="relative flex items-center mt-2">
            <VField id="confirmPassword" v-model="registerForm.confirmPassword" :type="registerForm.showConfirmPassword ? 'text' : 'password'" rules="required|length:6,20|confirmed:@password" name="confirmPassword" class="w-full h-8 pl-3 rounded-md shadow-sm text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 focus:outline-none" placeholder="••••••••" autocomplete="off" />
            <button type="button" tabindex="-1" class="absolute flex items-center justify-center h-full text-gray-500 right-3 hover:text-primary-600" @click="registerForm.showConfirmPassword = !registerForm.showConfirmPassword">
              <i v-if="!registerForm.showConfirmPassword" class="fa-solid fa-eye-slash"></i>
              <i v-else class="fa-solid fa-eye text-primary-600"></i>
            </button>
          </div>
          <ErrorMessage class="mt-1 text-sm text-red-600" name="confirmPassword" />
        </div>
        <!-- Submit -->
        <button type="submit" class="w-full px-4 py-2 text-white rounded-md bg-primary-600 hover:bg-primary-700 outline-1 focus:outline-2 focus:outline-primary-500 focus:outline-offset-2 focus:outline-none">註冊</button>
        <p class="mt-4 text-sm text-center text-primary-900">已經有帳號？<RouterLink to="/login" class="text-primary-600 hover:underline">登入</RouterLink></p>
      </VForm>
    </div>
  </div>
</template>
