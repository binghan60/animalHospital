<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Form as VForm } from 'vee-validate'
import { useAuthStore } from '@/stores/auth'
import { getProfile as apiGetProfile, updateProfile as apiUpdateProfile } from '@/api'
import { useAppToast } from '@/utils/appToast'
import VuTextField from '@/components/form/VuTextField.vue'

const toast = useAppToast()
const authStore = useAuthStore()
const profile = reactive({
  name: '',
  email: '',
  address: '',
  phone: '',
})
const editableProfile = reactive({
  name: '',
  email: '',
  address: '',
  phone: '',
})

const activeTab = ref('view')
const isLoading = ref(false)
const formattedDate = ref('')
const user = computed(() => authStore.user)
async function getProfile() {
  try {
    isLoading.value = true
    const { role, _id } = user.value
    const data = await apiGetProfile(role, _id)
    // 更新原始資料
    profile.name = data.name
    profile.email = data.email
    profile.address = data.address
    profile.phone = data.phone
    const utcDate = new Date(data.createdAt)
    const gmtDate = new Date(utcDate.getTime() + 8 * 60 * 60 * 1000)
    formattedDate.value = gmtDate.toISOString().replace('T', ' ').substring(0, 10)
  } catch (error) {
    toast.error(error, '無法取得個人資料')
  } finally {
    isLoading.value = false
  }
}
// 切換到編輯模式時，複製資料到 editableProfile
function prepareEditableData() {
  editableProfile.name = profile.name
  editableProfile.email = profile.email
  editableProfile.address = profile.address
  editableProfile.phone = profile.phone
}
async function updateProfile() {
  try {
    isLoading.value = true
    const { role, _id } = user.value
    const payload = { ...editableProfile }
    const data = await apiUpdateProfile(role, _id, payload)
    profile.name = editableProfile.name
    profile.email = editableProfile.email
    profile.address = editableProfile.address
    profile.phone = editableProfile.phone
    toast.success(data.message)
    authStore.auth(data.profile)
    activeTab.value = 'view'
  } catch (error) {
    toast.error(error, '更新個人資料失敗')
  } finally {
    isLoading.value = false
  }
}
function switchTab(tab) {
  if (tab === 'edit') {
    prepareEditableData()
  } else if (tab === 'view' && activeTab.value === 'edit') {
    // 當從編輯模式返回檢視模式不儲存時，不需要做額外操作
    // 因為 editableProfile 的變更不會影響 profile
  }
  activeTab.value = tab
}
onMounted(() => {
  getProfile()
})
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h2 class="text-h4 text-center mb-6">會員中心</h2>
      </v-col>
    </v-row>
    
    <v-row>
      <!-- 側邊選單 -->
      <v-col cols="12" lg="3">
        <v-card>
          <v-list>
            <v-list-item 
              :active="activeTab === 'view'"
              @click="switchTab('view')"
            >
              <v-list-item-title>基本資料</v-list-item-title>
            </v-list-item>
            <v-list-item 
              :active="activeTab === 'edit'"
              @click="switchTab('edit')"
            >
              <v-list-item-title>編輯資料</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <!-- 主要內容 -->
      <v-col cols="12" lg="9">
        <v-card>
          <v-card-text>
            <!-- 檢視模式 -->
            <div v-show="activeTab === 'view'">
              <v-row>
                <v-col cols="4" sm="3" class="text-right">
                  <strong>姓名：</strong>
                </v-col>
                <v-col cols="8" sm="9">
                  {{ profile.name }}
                </v-col>
              </v-row>
              <v-divider class="my-3"></v-divider>
              
              <v-row>
                <v-col cols="4" sm="3" class="text-right">
                  <strong>信箱：</strong>
                </v-col>
                <v-col cols="8" sm="9">
                  {{ profile.email }}
                </v-col>
              </v-row>
              <v-divider class="my-3"></v-divider>
              
              <v-row>
                <v-col cols="4" sm="3" class="text-right">
                  <strong>地址：</strong>
                </v-col>
                <v-col cols="8" sm="9">
                  {{ profile.address }}
                </v-col>
              </v-row>
              <v-divider class="my-3"></v-divider>
              
              <v-row>
                <v-col cols="4" sm="3" class="text-right">
                  <strong>電話：</strong>
                </v-col>
                <v-col cols="8" sm="9">
                  {{ profile.phone }}
                </v-col>
              </v-row>
              <v-divider class="my-3"></v-divider>
              
              <v-row>
                <v-col cols="4" sm="3" class="text-right">
                  <strong>註冊日期：</strong>
                </v-col>
                <v-col cols="8" sm="9">
                  {{ formattedDate }}
                </v-col>
              </v-row>
            </div>
            <!-- 編輯模式 -->
            <VForm v-show="activeTab === 'edit'" @submit="updateProfile">
              <VuTextField
                name="name"
                label="姓名"
                v-model="editableProfile.name"
                autocomplete="off"
                class="mb-4"
              />

              <VuTextField
                name="email"
                label="信箱"
                type="email"
                rules="email"
                v-model="editableProfile.email"
                autocomplete="off"
                class="mb-4"
              />

              <VuTextField
                name="address"
                label="地址"
                v-model="editableProfile.address"
                autocomplete="off"
                class="mb-4"
              />

              <VuTextField
                name="phone"
                label="電話"
                v-model="editableProfile.phone"
                autocomplete="off"
                class="mb-4"
              />

              <v-row class="mt-6">
                <v-col cols="6">
                  <v-btn
                    variant="outlined"
                    color="grey"
                    block
                    @click="switchTab('view')"
                  >
                    取消
                  </v-btn>
                </v-col>
                <v-col cols="6">
                  <v-btn
                    type="submit"
                    color="primary"
                    block
                    :loading="isLoading"
                  >
                    確定
                  </v-btn>
                </v-col>
              </v-row>
            </VForm>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
