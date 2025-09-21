<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Form as VForm } from 'vee-validate'
import { useAppToast } from '@/utils/appToast'
import { register as apiRegister } from '@/api'
import VuTextField from '@/components/form/VuTextField.vue'
import VuSelect from '@/components/form/VuSelect.vue'

const router = useRouter()
const toast = useAppToast()

const registerForm = ref({
  role: 'hospital',
  account: '',
  name: '',
  password: '',
  confirmPassword: '',
  showPassword: false,
  showConfirmPassword: false,
})

const isLoading = ref(false)

async function register() {
  try {
    isLoading.value = true
    const { account, name, password, role } = registerForm.value
    const payload = { account, password, name }
    const data = await apiRegister(role, payload)
    toast.success(data.message + ', 3秒後自動跳轉登入頁')
    setTimeout(() => {
      router.push('/login')
    }, 3000)
    isLoading.value = false
  } catch (error) {
    toast.error(error, '註冊失敗')
    isLoading.value = false
  }
}
</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5">
        <v-card elevation="6">
          <v-card-title class="text-h5 text-center">註冊</v-card-title>
          <v-card-text>
            <VForm @submit="register">
              <!-- 角色選擇 -->
              <VuSelect
                name="role"
                label="請選擇註冊身份"
                rules="required"
                v-model="registerForm.role"
                :items="[
                  { title: '醫院', value: 'hospital' },
                  { title: '飼主', value: 'user' },
                ]"
                class="mb-3"
              />

              <!-- 帳號（醫院）-->
              <template v-if="registerForm.role === 'hospital'">
                <VuTextField
                  name="account"
                  label="帳號"
                  rules="required|length:4,20"
                  v-model="registerForm.account"
                  autocomplete="off"
                  class="mb-3"
                />
              </template>
              <!-- 帳號（飼主，建議手機號碼）-->
              <template v-else>
                <VuTextField
                  name="misdn"
                  label="帳號（建議使用手機號碼）"
                  rules="required|length:4,10"
                  v-model="registerForm.account"
                  autocomplete="off"
                  class="mb-3"
                />
              </template>

              <!-- 密碼 -->
              <VuTextField
                name="password"
                label="密碼"
                :type="registerForm.showPassword ? 'text' : 'password'"
                rules="required|length:4,20"
                v-model="registerForm.password"
                :appendInnerIcon="registerForm.showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @clickAppendInner="registerForm.showPassword = !registerForm.showPassword"
                autocomplete="off"
                class="mb-3"
              />

              <!-- 確認密碼 -->
              <VuTextField
                name="confirmPassword"
                label="確認密碼"
                :type="registerForm.showConfirmPassword ? 'text' : 'password'"
                rules="required|length:4,20|confirmed:@password"
                v-model="registerForm.confirmPassword"
                :appendInnerIcon="registerForm.showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @clickAppendInner="registerForm.showConfirmPassword = !registerForm.showConfirmPassword"
                autocomplete="off"
                class="mb-3"
              />

              <!-- 額外資訊（醫院/飼主）-->
              <template v-if="registerForm.role === 'hospital'">
                <VuTextField
                  name="hospitalName"
                  label="醫院名稱"
                  v-model="registerForm.name"
                  autocomplete="off"
                  class="mb-3"
                />
              </template>
              <template v-else>
                <VuTextField
                  name="name"
                  label="暱稱"
                  rules="length:1,20"
                  v-model="registerForm.name"
                  autocomplete="off"
                  class="mb-3"
                />
              </template>

              <v-btn type="submit" color="primary" block :loading="isLoading">註冊</v-btn>
            </VForm>

            <div class="d-flex justify-center mt-4">
              <RouterLink to="/login">已經有帳號？前往登入</RouterLink>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
