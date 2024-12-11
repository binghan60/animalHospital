<script>
export default {
  data() {
    return {
      account: '',
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
    handleSubmit() {
      if (this.password !== this.confirmPassword) {
        alert('密碼與確認密碼不一致')
        return
      }
      console.log('Account:', this.account)
      console.log('Password:', this.password)
    },
  },
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen p-6 bg-primary-100">
    <div class="w-full max-w-sm min-w-[330px] p-6 bg-white rounded-lg shadow-lg lg:p-8">
      <h2 class="mb-6 text-2xl font-bold text-center text-gray-800">註冊</h2>
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label for="account" class="text-gray-700">帳號</label>
          <input type="text" id="account" v-model="account" class="w-full h-8 pl-3 mt-1 border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:border-2 focus:outline-none" placeholder="請輸入帳號" autocomplete="off" />
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
        <div class="mb-4">
          <label for="confirmPassword" class="text-gray-700">確認密碼</label>
          <div class="relative flex items-center mt-1">
            <input :type="showConfirmPassword ? 'text' : 'password'" id="confirmPassword" v-model="confirmPassword" class="w-full h-8 pl-3 pr-10 border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:border-2 focus:outline-none" placeholder="••••••••" />
            <button type="button" tabindex="-1" class="absolute inset-y-0 flex items-center justify-center text-gray-500 right-3 hover:text-primary-600" @click="toggleConfirmPassword">
              <i v-if="!showConfirmPassword" class="fa-solid fa-eye-slash"></i>
              <i v-else class="fa-solid fa-eye"></i>
            </button>
          </div>
        </div>
        <!-- Submit -->
        <button type="submit" class="w-full px-4 py-2 text-white rounded-md bg-primary-600 hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none">註冊</button>
        <p class="mt-4 text-sm text-center text-gray-600">已經有帳號？<RouterLink to="/login" class="text-primary-600 hover:underline">登入</RouterLink></p>
      </form>
    </div>
  </div>
</template>
