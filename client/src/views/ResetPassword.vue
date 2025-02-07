<script>
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
      resetForm: {
        password: '',
        showPassword: false,
        showConfirmPassword: false,
      },
      token: '',
      isLoading: false,
    }
  },
  methods: {
    async resetPassword() {
      try {
        this.isLoading = true
        const payload = {
          token: this.$route.query.token,
          password: this.resetForm.password,
        }
        const { data } = await axios.post(`${import.meta.env.VITE_API_PATH}/reset-password`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        this.isLoading = false
        this.$toast.success(data.message + ', 3秒後自動跳轉登入頁')
        setTimeout(() => {
          this.$router.push('/login')
        }, '3000')
      } catch (error) {
        console.log(error)
        this.$toast.error(error.response.data.message)
        this.isLoading = false
      }
    },
  },
  mounted() {
    this.token = this.$route.query.token
  },
}
</script>
<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="w-full h-full max-w-sm min-w-[350px] p-6 lg:bg-white lg:rounded-lg lg:shadow-lg lg:p-8 dark:lg:bg-darkPrimary-700 rounded-lg dark:bg-darkPrimary-800">
      <h2 class="mb-6 text-2xl font-bold text-center text-primary-900 dark:text-darkPrimary-50">重設密碼</h2>
      <VForm @submit="resetPassword">
        <div class="mb-4">
          <label for="password" class="text-primary-900 dark:text-darkPrimary-50">新密碼*</label>
          <div class="relative flex items-center mt-2">
            <VField id="password" v-model="resetForm.password" :type="resetForm.showPassword ? 'text' : 'password'" rules="required|length:4,20" name="password" class="w-full h-8 pl-3 rounded-md shadow-sm dark:bg-darkPrimary-500 dark:text-darkPrimary-50 text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" placeholder="••••••••" autocomplete="off" />
            <button type="button" tabindex="-1" class="absolute flex items-center justify-center h-full text-gray-500 right-3 hover:text-primary-600" @click="resetForm.showPassword = !resetForm.showPassword">
              <i v-show="!resetForm.showPassword" class="fa-solid fa-eye-slash fa-fw dark:text-darkPrimary-400"></i>
              <i v-show="resetForm.showPassword" class="fa-solid fa-eye text-primary-600 fa-fw dark:text-darkPrimary-50"></i>
            </button>
          </div>
          <ErrorMessage class="mt-1 text-sm text-red-600 dark:text-rose-400" name="password" />
        </div>
        <div class="mb-4">
          <label for="confirmPassword" class="text-primary-900 dark:text-darkPrimary-50">確認密碼*</label>
          <div class="relative flex items-center mt-2">
            <VField id="confirmPassword" :type="resetForm.showConfirmPassword ? 'text' : 'password'" rules="required|length:4,20|confirmed:@password" name="confirmPassword" class="w-full h-8 pl-3 rounded-md shadow-sm dark:bg-darkPrimary-500 dark:text-darkPrimary-50 text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" placeholder="••••••••" autocomplete="off" />
            <button type="button" tabindex="-1" class="absolute flex items-center justify-center h-full text-gray-500 right-3 hover:text-primary-600" @click="resetForm.showConfirmPassword = !resetForm.showConfirmPassword">
              <i v-show="!resetForm.showConfirmPassword" class="fa-solid fa-eye-slash fa-fw dark:text-darkPrimary-400"></i>
              <i v-show="resetForm.showConfirmPassword" class="fa-solid fa-eye text-primary-600 fa-fw dark:text-darkPrimary-50"></i>
            </button>
          </div>
          <ErrorMessage class="mt-1 text-sm text-red-600 dark:text-rose-400" name="confirmPassword" />
        </div>

        <button type="submit" class="w-full px-4 py-2 mt-4 text-white rounded-md bg-primary-600 dark:bg-indigo-600 hover:dark:bg-indigo-700 hover:bg-primary-700 outline-1 focus:outline-2 focus:outline-primary-500 focus:outline-offset-2 focus:outline-none">重設密碼</button>
        <p class="mt-4 text-sm text-center text-primary-900 dark:text-darkPrimary-400">
          已經有帳號？
          <RouterLink to="/login" class="text-primary-600 hover:underline dark:text-darkPrimary-50">登入</RouterLink>
        </p>
      </VForm>
    </div>
    <VueLoading :active="isLoading" :height="loadingConfig.height" :width="loadingConfig.width" :loader="loadingConfig.loader" :color="loadingConfig.getColor()" :backgroundColor="loadingConfig.backgroundColor()" />
  </div>
</template>
