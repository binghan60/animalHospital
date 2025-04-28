<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { Field, Form, ErrorMessage } from 'vee-validate'
import { useToast } from 'vue-toastification'
const toast = useToast()
const VField = Field
const VForm = Form
const form = ref({
  role: 'hospital',
  account: '',
})
const isLoading = ref(false)
// 方法
const forgetPassword = async () => {
  try {
    isLoading.value = true
    const { role, account } = form.value
    const payload = { role, account }
    const { data } = await axios.post(`${import.meta.env.VITE_API_PATH}/${role}/forgetPassword`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    toast.success(data.message)
    isLoading.value = false
  } catch (error) {
    isLoading.value = false
    toast.warning(error.response.data.message)
  }
}
</script>
<template>
  <div class="flex items-center justify-center p-6" style="height: calc(100vh - 58px - 4rem)">
    <div class="w-full max-w-sm min-w-[350px] max-h-[800px] p-6 lg:bg-white lg:rounded-lg lg:shadow-lg lg:p-8 dark:lg:bg-darkPrimary-700 rounded-lg dark:bg-darkPrimary-800">
      <h2 class="mb-6 text-2xl font-bold text-center text-primary-900 dark:text-darkPrimary-50">忘記密碼</h2>
      <VForm @submit="forgetPassword">
        <div class="mb-4">
          <label for="role" class="text-primary-900 dark:text-darkPrimary-50">請選擇帳號身份</label>
          <VField id="role" v-model="form.role" name="role" as="select" rules="required" class="w-full h-8 pl-3 mt-2 rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-500 text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none">
            <option value="hospital">醫院</option>
            <option value="user">飼主</option>
          </VField>
          <ErrorMessage class="mt-1 text-sm text-red-600 dark:text-rose-400" name="role" />
        </div>
        <div class="mb-4">
          <label for="account" class="text-primary-900 dark:text-darkPrimary-50">帳號</label>
          <VField id="account" v-model="form.account" type="text" name="account" rules="required|length:4,20" class="w-full h-8 pl-3 mt-2 rounded-md shadow-sm dark:bg-darkPrimary-500 dark:text-darkPrimary-50 text-primary-900 outline-1 outline-primary-100 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" placeholder="請輸入帳號" autocomplete="off" />
          <ErrorMessage class="mt-1 text-sm text-red-600 dark:text-rose-400" name="account" />
        </div>

        <button v-if="isLoading" class="inline-flex items-center justify-center w-full px-4 py-2 mt-4 rounded-md bg-primary-600 dark:bg-indigo-600 text-darkPrimary-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-auto" disabled="">
          <div class="w-4 h-4 border-2 border-white border-solid rounded-full animate-spin border-t-transparent"></div>
          <span class="ml-2">送出中... </span>
        </button>

        <button v-else type="submit" class="w-full px-4 py-2 mt-4 text-white rounded-md bg-primary-600 dark:bg-indigo-600 hover:dark:bg-indigo-700 hover:bg-primary-700 outline-1 focus:outline-2 focus:outline-primary-500 focus:outline-offset-2 focus:outline-none">送出</button>

        <p class="mt-4 text-sm text-center text-primary-900 dark:text-darkPrimary-400">
          想起密碼了？
          <RouterLink to="/login" class="text-primary-600 hover:underline dark:text-darkPrimary-50">登入</RouterLink>
        </p>
      </VForm>
    </div>
  </div>
</template>
