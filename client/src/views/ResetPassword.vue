<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Form as VForm } from 'vee-validate'
import { useAppToast } from '@/utils/appToast'
import { resetPassword as apiResetPassword } from '@/api'
import VuTextField from '@/components/form/VuTextField.vue'

const route = useRoute()
const router = useRouter()
const toast = useAppToast()
const resetForm = ref({
  password: '',
  confirmPassword: '',
  showPassword: false,
  showConfirmPassword: false,
})
const token = ref('')
const isLoading = ref(false)

async function resetPassword() {
  try {
    isLoading.value = true
    const payload = {
      token: route.query.token,
      password: resetForm.value.password,
    }
    const data = await apiResetPassword(payload)
    isLoading.value = false
    toast.success(data.message + ', 3秒後自動跳轉登入頁')
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (error) {
    toast.error(error, '重設密碼失敗')
    isLoading.value = false
  }
}

onMounted(() => {
  token.value = route.query.token
})
</script>
<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card elevation="6">
          <v-card-title class="text-h5 text-center">重設密碼</v-card-title>
          <v-card-text>
            <VForm @submit="resetPassword">
              <!-- 新密碼 -->
              <VuTextField
                name="password"
                label="新密碼"
                :type="resetForm.showPassword ? 'text' : 'password'"
                rules="required|length:4,20"
                v-model="resetForm.password"
                :appendInnerIcon="resetForm.showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @clickAppendInner="resetForm.showPassword = !resetForm.showPassword"
                autocomplete="off"
                class="mb-3"
              />

              <!-- 確認密碼 -->
              <VuTextField
                name="confirmPassword"
                label="確認密碼"
                :type="resetForm.showConfirmPassword ? 'text' : 'password'"
                rules="required|length:4,20|confirmed:@password"
                v-model="resetForm.confirmPassword"
                :appendInnerIcon="resetForm.showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @clickAppendInner="resetForm.showConfirmPassword = !resetForm.showConfirmPassword"
                autocomplete="off"
                class="mb-3"
              />

              <v-btn type="submit" color="primary" block :loading="isLoading">重設密碼</v-btn>
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
