<script setup>
import { ref } from 'vue'
import { Form as VForm } from 'vee-validate'
import { useAppToast } from '@/utils/appToast'
import { forgetPassword as apiForgetPassword } from '@/api'
import VuTextField from '@/components/form/VuTextField.vue'
import VuSelect from '@/components/form/VuSelect.vue'

const toast = useAppToast()
const form = ref({
  role: 'hospital',
  account: '',
})
const isLoading = ref(false)

const forgetPassword = async () => {
  try {
    isLoading.value = true
    const { role, account } = form.value
    const payload = { role, account }
    const data = await apiForgetPassword(role, payload)
    toast.success(data.message)
    isLoading.value = false
  } catch (error) {
    isLoading.value = false
    toast.error(error, '忘記密碼失敗')
  }
}
</script>
<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card elevation="6">
          <v-card-title class="text-h5 text-center">忘記密碼</v-card-title>
          <v-card-text>
            <VForm @submit="forgetPassword">
              <!-- 角色選擇 -->
              <VuSelect
                v-model="form.role"
                name="role"
                label="請選擇帳號身份"
                rules="required"
                :items="[
                  { title: '醫院', value: 'hospital' },
                  { title: '飼主', value: 'user' },
                ]"
                class="mb-3"
              />

              <!-- 帳號 -->
              <VuTextField
                v-model="form.account"
                name="account"
                label="帳號"
                rules="required|length:4,20"
                autocomplete="off"
                class="mb-3"
              />

              <v-btn type="submit" color="primary" block :loading="isLoading">送出</v-btn>
            </VForm>

            <div class="d-flex justify-center mt-4">
              <RouterLink to="/login">想起密碼了？前往登入</RouterLink>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
