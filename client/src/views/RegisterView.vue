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
        role: '',
        account: '',
        nickname: '',
        password: '',
        confirmPassword: '',
        showPassword: false,
        showConfirmPassword: false,
      },
    }
  },
  methods: {
    async register() {
      try {
        const { account, nickname, password, role } = this.registerForm
        const payload = {
          account,
          password,
          nickname,
        }
        const { data } = await axios.post(`${import.meta.env.VITE_API_PATH}/${role}/register`, payload, {
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
  },
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen p-6">
    <div class="w-full h-full max-w-sm min-w-[330px] p-6 lg:bg-white lg:rounded-lg lg:shadow-lg lg:p-8">
      <h2 class="mb-6 text-2xl font-bold text-center text-primary-900">註冊</h2>
      <VForm @submit="register">
        <div class="mb-4">
          <label for="role" class="text-primary-900">請選擇註冊身份*</label>
          <VField id="role" v-model="registerForm.role" name="role" as="select" rules="required" class="w-full h-8 pl-3 mt-2 rounded-md shadow-sm text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 focus:outline-none">
            <option value="" disabled selected>請選擇</option>
            <option value="user">飼主</option>
            <option value="hospital">醫院</option>
          </VField>
          <ErrorMessage class="mt-1 text-sm text-red-600" name="role" />
        </div>
        <div class="mb-4">
          <label for="account" class="text-primary-900">帳號*</label>
          <VField id="account" v-model="registerForm.account" type="text" name="account" rules="required|length:4,20" class="w-full h-8 pl-3 mt-2 rounded-md shadow-sm text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 focus:outline-none" placeholder="請輸入帳號" autocomplete="off" />
          <ErrorMessage class="mt-1 text-sm text-red-600" name="account" />
        </div>
        <div class="mb-4">
          <label for="password" class="text-primary-900">密碼*</label>
          <div class="relative flex items-center mt-2">
            <VField id="password" v-model="registerForm.password" :type="registerForm.showPassword ? 'text' : 'password'" rules="required|length:4,20" name="password" class="w-full h-8 pl-3 rounded-md shadow-sm text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 focus:outline-none" placeholder="••••••••" autocomplete="off" />
            <button type="button" tabindex="-1" class="absolute flex items-center justify-center h-full text-gray-500 right-3 hover:text-primary-600" @click="registerForm.showPassword = !registerForm.showPassword">
              <i v-show="!registerForm.showPassword" class="fa-solid fa-eye-slash fa-fw"></i>
              <i v-show="registerForm.showPassword" class="fa-solid fa-eye text-primary-600 fa-fw"></i>
            </button>
          </div>
          <ErrorMessage class="mt-1 text-sm text-red-600" name="password" />
        </div>
        <div class="mb-4">
          <label for="confirmPassword" class="text-primary-900">確認密碼*</label>
          <div class="relative flex items-center mt-2">
            <VField id="confirmPassword" v-model="registerForm.confirmPassword" :type="registerForm.showConfirmPassword ? 'text' : 'password'" rules="required|length:4,20|confirmed:@password" name="confirmPassword" class="w-full h-8 pl-3 rounded-md shadow-sm text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 focus:outline-none" placeholder="••••••••" autocomplete="off" />
            <button type="button" tabindex="-1" class="absolute flex items-center justify-center h-full text-gray-500 right-3 hover:text-primary-600" @click="registerForm.showConfirmPassword = !registerForm.showConfirmPassword">
              <i v-show="!registerForm.showConfirmPassword" class="fa-solid fa-eye-slash fa-fw"></i>
              <i v-show="registerForm.showConfirmPassword" class="fa-solid fa-eye text-primary-600 fa-fw"></i>
            </button>
          </div>
          <ErrorMessage class="mt-1 text-sm text-red-600" name="confirmPassword" />
        </div>

        <div v-show="registerForm.role === 'user'" class="mb-4">
          <label for="nickname" class="text-primary-900">暱稱*</label>
          <VField id="nickname" v-model="registerForm.nickname" rules="required|length:1,20" type="text" name="nickname" class="w-full h-8 pl-3 mt-2 rounded-md shadow-sm text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 focus:outline-none" placeholder="請輸入暱稱" autocomplete="off" />
          <ErrorMessage class="mt-1 text-sm text-red-600" name="nickname" />
        </div>
        <div v-show="registerForm.role === 'hospital'" class="mb-4">
          <label for="hospitalName" class="text-primary-900">醫院名稱</label>
          <VField id="hospitalName" v-model="registerForm.hospitalName" type="text" name="hospitalName" class="w-full h-8 pl-3 mt-2 rounded-md shadow-sm text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 focus:outline-none" placeholder="請輸入醫院名稱" autocomplete="off" />
          <ErrorMessage class="mt-1 text-sm text-red-600" name="hospitalName" />
        </div>
        <!-- 提交按鈕 -->
        <button type="submit" class="w-full px-4 py-2 text-white rounded-md bg-primary-600 hover:bg-primary-700 outline-1 focus:outline-2 focus:outline-primary-500 focus:outline-offset-2 focus:outline-none">註冊</button>
        <p class="mt-4 text-sm text-center text-primary-900">
          已經有帳號？
          <RouterLink to="/login" class="text-primary-600 hover:underline">登入</RouterLink>
        </p>
      </VForm>
    </div>
  </div>
</template>
