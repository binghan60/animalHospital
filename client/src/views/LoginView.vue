<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authStore from '@/stores/auth'
import { Field as VField, Form as VForm } from 'vee-validate'
import { setAuthHeader } from '@/axiosConfig.js'
import { useAppToast } from '@/utils/appToast'
import { login as apiLogin } from '@/api'

const router = useRouter()

const toast = useAppToast()
const store = authStore()
const { auth } = store
const loginFrom = ref({
  role: 'hospital',
  account: '',
  password: '',
  showPassword: false,
})

const isLoading = ref(false)
// 方法定義
const togglePassword = () => {
  loginFrom.value.showPassword = !loginFrom.value.showPassword
}
const login = async () => {
  const { account, password, role } = loginFrom.value
  try {
    isLoading.value = true
    const payload = { account, password }
    const data = await apiLogin(role, payload)
    auth(data)
    toast.success(data.message)
    document.cookie = `animalHospitalToken=${data.token}; Path=/; expires=${new Date(data.expiresAt).toUTCString()}`
    document.cookie = `animalHospitalRole=${data.role}; Path=/; expires=${new Date(data.expiresAt).toUTCString()}`
    setAuthHeader(data.token)
    if (role == 'user') {
      router.push('/user/animallist')
    } else {
      router.push('/hospital/animallist')
    }
    isLoading.value = false
  } catch (error) {
    isLoading.value = false
    toast.error(error, '登入失敗')
  }
}
const quicklogin = () => {
  loginFrom.value.account = 'admin'
  loginFrom.value.password = 'adminadmin'
  loginFrom.value.role = 'hospital'
}
const userlogin = () => {
  loginFrom.value.account = '0952123259'
  loginFrom.value.password = 'admin'
  loginFrom.value.role = 'user'
  login()
}
</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card elevation="6">
          <v-card-title class="text-center text-h5">動物健康管理系統</v-card-title>
          <v-card-text>
            <VForm @submit="login">
              <VField name="role" rules="required" :model-value="loginFrom.role" v-slot="{ errors, field }">
                <v-select
                  :model-value="field.value"
                  :items="[
                    { title: '醫院', value: 'hospital' },
                    { title: '飼主', value: 'user' },
                  ]"
                  label="請選擇登入身份"
                  :error-messages="errors"
                  variant="outlined"
                  density="comfortable"
                  class="mb-3"
                  @update:modelValue="
                    v => {
                      loginFrom.role = v
                      field.onInput(v)
                    }
                  "
                  @blur="field.onBlur"
                />
              </VField>

              <VField name="account" rules="required|length:4,20" v-slot="{ errors, handleChange }">
                <v-text-field v-model="loginFrom.account" label="帳號" autocomplete="off" :error-messages="errors" variant="outlined" density="comfortable" class="mb-3" @update:modelValue="handleChange" />
              </VField>

              <VField name="password" rules="required|length:4,20" v-slot="{ errors, handleChange }">
                <v-text-field v-model="loginFrom.password" :type="loginFrom.showPassword ? 'text' : 'password'" label="密碼" autocomplete="off" :append-inner-icon="loginFrom.showPassword ? 'mdi-eye' : 'mdi-eye-off'" :error-messages="errors" variant="outlined" density="comfortable" class="mb-3" @click:append-inner="togglePassword" @update:modelValue="handleChange" />
              </VField>

              <v-btn type="submit" color="primary" block class="mt-2" :loading="isLoading">登入</v-btn>
            </VForm>

            <div class="mt-4 d-flex justify-space-between">
              <RouterLink to="/register">註冊</RouterLink>
              <RouterLink to="/forget-password">忘記密碼</RouterLink>
            </div>

            <v-btn variant="tonal" color="success" class="mt-4" block @click="userlogin">牛奶看病專用</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
