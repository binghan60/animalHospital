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
        role: 'hospital',
        account: '',
        name: '',
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
        const { account, name, password, role } = this.registerForm
        const payload = {
          account,
          password,
          name,
        }
        const { data } = await axios.post(`${import.meta.env.VITE_API_PATH}/${role}/register`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        this.$toast.success(data.message + ', 3秒後自動跳轉登入頁')
        setTimeout(() => {
          this.$router.push('/login')
        }, '3000')
      } catch (error) {
        this.$toast.error(error.response.data.message)
      }
    },
  },
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="w-full h-full max-w-sm min-w-[350px] p-6 lg:bg-white lg:rounded-lg lg:shadow-lg lg:p-8 dark:lg:bg-darkPrimary-700 rounded-lg dark:bg-darkPrimary-800">
      <h2 class="mb-6 text-2xl font-bold text-center text-primary-900 dark:text-darkPrimary-50">註冊</h2>
      <VForm @submit="register">
        <div class="mb-4">
          <label for="role" class="text-primary-900 dark:text-darkPrimary-50">請選擇註冊身份*</label>
          <VField id="role" v-model="registerForm.role" name="role" as="select" rules="required" class="w-full h-8 pl-3 mt-2 rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-500 text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none">
            <option value="hospital">醫院</option>
            <option value="user">飼主</option>
          </VField>
          <ErrorMessage class="mt-1 text-sm text-red-600 dark:text-rose-400" name="role" />
        </div>
        <div v-show="registerForm.role == 'hospital'" class="mb-4">
          <label for="account" class="text-primary-900 dark:text-darkPrimary-50">帳號*</label>
          <VField id="account" v-model="registerForm.account" type="text" name="account" rules="required|length:4,20" class="w-full h-8 pl-3 mt-2 rounded-md shadow-sm dark:bg-darkPrimary-500 dark:text-darkPrimary-50 text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" placeholder="請輸入帳號" autocomplete="off" />
          <ErrorMessage class="mt-1 text-sm text-red-600 dark:text-rose-400" name="account" />
        </div>
        <div v-show="registerForm.role == 'user'" class="mb-4">
          <label for="misdn" class="text-primary-900 dark:text-darkPrimary-50">帳號*</label>
          <VField id="misdn" v-model="registerForm.account" type="tel" name="misdn" rules="required|length:4,10" class="w-full h-8 pl-3 mt-2 rounded-md shadow-sm dark:bg-darkPrimary-500 dark:text-darkPrimary-50 text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" placeholder="請輸入帳號(建議使用手機號碼)" autocomplete="off" />
          <ErrorMessage class="mt-1 text-sm text-red-600 dark:text-rose-400" name="misdn" />
        </div>
        <div class="mb-4">
          <label for="password" class="text-primary-900 dark:text-darkPrimary-50">密碼*</label>
          <div class="relative flex items-center mt-2">
            <VField id="password" v-model="registerForm.password" :type="registerForm.showPassword ? 'text' : 'password'" rules="required|length:4,20" name="password" class="w-full h-8 pl-3 rounded-md shadow-sm dark:bg-darkPrimary-500 dark:text-darkPrimary-50 text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" placeholder="••••••••" autocomplete="off" />
            <button type="button" tabindex="-1" class="absolute flex items-center justify-center h-full text-gray-500 right-3 hover:text-primary-600" @click="registerForm.showPassword = !registerForm.showPassword">
              <i v-show="!registerForm.showPassword" class="fa-solid fa-eye-slash fa-fw dark:text-darkPrimary-400"></i>
              <i v-show="registerForm.showPassword" class="fa-solid fa-eye text-primary-600 fa-fw dark:text-darkPrimary-50"></i>
            </button>
          </div>
          <ErrorMessage class="mt-1 text-sm text-red-600 dark:text-rose-400" name="password" />
        </div>
        <div class="mb-4">
          <label for="confirmPassword" class="text-primary-900 dark:text-darkPrimary-50">確認密碼*</label>
          <div class="relative flex items-center mt-2">
            <VField id="confirmPassword" v-model="registerForm.confirmPassword" :type="registerForm.showConfirmPassword ? 'text' : 'password'" rules="required|length:4,20|confirmed:@password" name="confirmPassword" class="w-full h-8 pl-3 rounded-md shadow-sm dark:bg-darkPrimary-500 dark:text-darkPrimary-50 text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" placeholder="••••••••" autocomplete="off" />
            <button type="button" tabindex="-1" class="absolute flex items-center justify-center h-full text-gray-500 right-3 hover:text-primary-600" @click="registerForm.showConfirmPassword = !registerForm.showConfirmPassword">
              <i v-show="!registerForm.showConfirmPassword" class="fa-solid fa-eye-slash fa-fw dark:text-darkPrimary-400"></i>
              <i v-show="registerForm.showConfirmPassword" class="fa-solid fa-eye text-primary-600 fa-fw dark:text-darkPrimary-50"></i>
            </button>
          </div>
          <ErrorMessage class="mt-1 text-sm text-red-600 dark:text-rose-400" name="confirmPassword" />
        </div>
        <div v-show="registerForm.role === 'hospital'" class="mb-4">
          <label for="hospitalName" class="text-primary-900 dark:text-darkPrimary-50">醫院名稱</label>
          <VField id="hospitalName" v-model="registerForm.name" type="text" name="hospitalName" class="w-full h-8 pl-3 mt-2 rounded-md shadow-sm dark:bg-darkPrimary-500 dark:text-darkPrimary-50 text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" placeholder="請輸入醫院名稱" autocomplete="off" />
          <ErrorMessage class="mt-1 text-sm text-red-600 dark:text-rose-400" name="hospitalName" />
        </div>
        <div v-show="registerForm.role === 'user'" class="mb-4">
          <label for="name" class="text-primary-900 dark:text-darkPrimary-50">暱稱</label>
          <VField id="name" v-model="registerForm.name" rules="length:1,20" type="text" name="name" class="w-full h-8 pl-3 mt-2 rounded-md shadow-sm dark:bg-darkPrimary-500 dark:text-darkPrimary-50 text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" placeholder="請輸入暱稱" autocomplete="off" />
          <ErrorMessage class="mt-1 text-sm text-red-600 dark:text-rose-400" name="name" />
        </div>

        <button type="submit" class="w-full px-4 py-2 mt-4 text-white rounded-md bg-primary-600 dark:bg-indigo-600 hover:dark:bg-indigo-700 hover:bg-primary-700 outline-1 focus:outline-2 focus:outline-primary-500 focus:outline-offset-2 focus:outline-none">註冊</button>
        <p class="mt-4 text-sm text-center text-primary-900 dark:text-darkPrimary-400">
          已經有帳號？
          <RouterLink to="/login" class="text-primary-600 hover:underline dark:text-darkPrimary-50">登入</RouterLink>
        </p>
      </VForm>
    </div>
  </div>
</template>
