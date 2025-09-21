<script setup>
import { ref, reactive, computed, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { getAnimalsForHospital, createAnimal as apiCreateAnimal, editAnimal as apiEditAnimal, deleteAnimal as apiDeleteAnimal, getAllUsers } from '@/api'
import VuTextField from '@/components/form/VuTextField.vue'
import VuSelect from '@/components/form/VuSelect.vue'

// Composables and dependencies
const loadingConfig = inject('loadingConfig')
const router = useRouter()
const toast = useToast()
const auth = useAuthStore()
const { user } = storeToRefs(auth)

// Reactive state
const animalList = ref([])
const userList = ref([])
const searchKeyword = ref('')
const filterType = ref('')
const isLoading = ref(false)

// Modal states
const createDialog = ref(false)
const editDialog = ref(false)
const deleteDialog = ref(false)

// Form states
const createForm = reactive({
  avatar: null,
  avatarUrl: '',
  name: '',
  gender: 'male',
  weight: 0,
  birthday: '',
  sterilized: false,
  breed: '',
  bloodType: '',
  type: '',
  insulinBrand: '',
  admissionDate: new Date().toISOString().slice(0, 10),
  sharedWith: [],
  searchText: '',
})

const editForm = reactive({
  avatar: null,
  avatarUrl: '',
  animalId: '',
  name: '',
  gender: 'male',
  weight: 0,
  birthday: '',
  sterilized: false,
  breed: '',
  bloodType: '',
  type: '',
  insulinBrand: '',
  admissionDate: new Date().toISOString().slice(0, 10),
  sharedWith: [],
  searchText: '',
})

const deleteForm = reactive({
  _id: '',
  name: '',
})

// File upload refs
const createFileInput = ref(null)
const editFileInput = ref(null)

// Constants
const headers = [
  { title: '基本資料', key: 'name', sortable: true },
  { title: '體重', key: 'weight', sortable: true },
  { title: '血型', key: 'bloodType', sortable: true },
  { title: '品種', key: 'breed', sortable: true },
  { title: '結紮', key: 'sterilized', sortable: true },
  { title: '新增日期', key: 'admissionDate', sortable: true },
  { title: '操作', key: 'actions', sortable: false, width: '120' },
]

const genderOptions = [
  { title: '男生', value: 'male' },
  { title: '女生', value: 'female' },
]

const sterilizedOptions = [
  { title: '已結紮', value: true },
  { title: '未結紮', value: false },
]

const bloodTypeOptions = [
  { title: 'A型', value: 'A' },
  { title: 'B型', value: 'B' },
  { title: 'AB型', value: 'AB' },
  { title: 'O型', value: 'O' },
]

const animalTypeOptions = [
  { title: '狗狗', value: 'dog' },
  { title: '貓咪', value: 'cat' },
  { title: '其他', value: 'other' },
]

// Computed
const showData = computed(() =>
  animalList.value.filter(animal => {
    const matchesName = animal?.name?.toLowerCase().includes((searchKeyword.value || '').toLowerCase())
    const matchesType = filterType.value === '' || animal.type === filterType.value
    return matchesName && matchesType
  }),
)

const filteredUsers = computed(() => {
  const searchText = createDialog.value ? createForm.searchText : editForm.searchText
  if (!searchText) return userList.value
  return userList.value.filter(user => user.account?.toLowerCase().includes(searchText.toLowerCase()))
})

// Utility functions
function resetCreateForm() {
  Object.assign(createForm, {
    avatar: null,
    avatarUrl: '',
    name: '',
    gender: 'male',
    weight: 0,
    birthday: '',
    sterilized: false,
    breed: '',
    bloodType: '',
    type: '',
    insulinBrand: '',
    admissionDate: new Date().toISOString().slice(0, 10),
    sharedWith: [],
    searchText: '',
  })
}

function convertBirthdayToAge(dateString) {
  if (!dateString || dateString === '1970-01-01T00:00:00.000Z') return ''
  const birth = new Date(dateString)
  if (isNaN(birth.getTime())) return ''
  const today = new Date()
  let years = today.getFullYear() - birth.getFullYear()
  let months = today.getMonth() - birth.getMonth()
  if (months < 0) {
    years--
    months += 12
  }
  return months > 0 ? `${years}歲 ${months}個月` : `${years}歲`
}

function getAnimalIcon(type) {
  const icons = {
    dog: 'mdi-dog',
    cat: 'mdi-cat',
    other: 'mdi-help-circle',
  }
  return icons[type] || 'mdi-help-circle'
}

// File upload handlers
function openFileUpload(type) {
  if (type === 'create') {
    createFileInput.value?.click()
  } else {
    editFileInput.value?.click()
  }
}

function handleFileChange(type, event) {
  const form = type === 'create' ? createForm : editForm
  const file = event.target.files[0]

  if (file) {
    form.avatar = file
    form.avatarUrl = URL.createObjectURL(file)
  }
}

// User sharing functions
function selectUser(type, user) {
  const form = type === 'create' ? createForm : editForm

  if (!form.sharedWith.some(u => u._id === user._id)) {
    form.sharedWith.push(user)
  }
  form.searchText = ''
}

function removeUser(type, userId) {
  const form = type === 'create' ? createForm : editForm
  const index = form.sharedWith.findIndex(u => u._id === userId)
  if (index !== -1) {
    form.sharedWith.splice(index, 1)
  }
}

// API functions
async function fetchAnimals() {
  try {
    isLoading.value = true
    const data = await getAnimalsForHospital(user.value._id)
    animalList.value = data
  } catch (error) {
    toast.error(error, '取得動物列表失敗')
  } finally {
    isLoading.value = false
  }
}

async function fetchUsers() {
  try {
    const data = await getAllUsers()
    userList.value = data
  } catch (error) {
    toast.error(error, '取得用戶列表失敗')
  }
}

// CRUD operations
async function createAnimal() {
  try {
    isLoading.value = true
    const formData = new FormData()
    formData.append('hospitalId', user.value._id)

    Object.keys(createForm).forEach(key => {
      if (key === 'sharedWith') {
        formData.append(key, JSON.stringify(createForm[key]))
      } else if (key === 'weight') {
        formData.append(
          key,
          JSON.stringify([
            {
              date: new Date().toISOString().slice(0, 10),
              value: createForm[key],
            },
          ]),
        )
      } else {
        formData.append(key, createForm[key])
      }
    })

    await apiCreateAnimal(formData)
    await fetchAnimals()
    createDialog.value = false
    resetCreateForm()
    toast.success('動物新增成功')
  } catch (error) {
    toast.error(error, '新增失敗')
  } finally {
    isLoading.value = false
  }
}

async function updateAnimal() {
  try {
    isLoading.value = true
    const formData = new FormData()

    Object.keys(editForm).forEach(key => {
      if (key === 'sharedWith') {
        formData.append(key, JSON.stringify(editForm[key]))
      } else if (key === 'weight') {
        formData.append(
          key,
          JSON.stringify([
            {
              date: new Date().toISOString().slice(0, 10),
              value: editForm[key],
            },
          ]),
        )
      } else {
        formData.append(key, editForm[key])
      }
    })

    await apiEditAnimal(formData)
    await fetchAnimals()
    editDialog.value = false
    toast.success('動物資料更新成功')
  } catch (error) {
    toast.error(error, '更新失敗')
  } finally {
    isLoading.value = false
  }
}

async function removeAnimal() {
  try {
    isLoading.value = true
    const result = await apiDeleteAnimal(deleteForm._id)
    await fetchAnimals()
    deleteDialog.value = false
    toast.success(result.message || '刪除成功')
  } catch (error) {
    toast.error(error, '刪除失敗')
  } finally {
    isLoading.value = false
  }
}

// Modal handlers
function openCreateDialog() {
  resetCreateForm()
  createDialog.value = true
}

function openEditDialog(animal) {
  const { _id, name, gender, weight, birthday, sterilized, breed, bloodType, type, insulinBrand, sharedWith, admissionDate } = animal

  Object.assign(editForm, {
    animalId: _id,
    avatarUrl: animal.avatar || '',
    name,
    gender,
    weight: weight || 0,
    birthday: birthday ? new Date(birthday).toISOString().split('T')[0] : '',
    sterilized,
    breed: breed || '',
    bloodType: bloodType || '',
    type: type || '',
    insulinBrand: insulinBrand || '',
    admissionDate: new Date(admissionDate).toISOString().slice(0, 10),
    sharedWith: [...(sharedWith || [])],
    searchText: '',
  })

  editDialog.value = true
}

function openDeleteDialog(animal) {
  Object.assign(deleteForm, {
    _id: animal._id,
    name: animal.name,
  })
  deleteDialog.value = true
}

function navigateToAnimal(animalId) {
  router.push(`/hospital/animal/${animalId}`)
}

function clearFilters() {
  searchKeyword.value = ''
  filterType.value = ''
}

// Lifecycle
onMounted(async () => {
  await Promise.all([fetchAnimals(), fetchUsers()])
})
</script>

<template>
  <v-container fluid>
    <!-- 主要卡片容器 -->
    <v-card>
      <!-- 頁面標題和操作按鈕 -->
      <v-card-title>
        <v-row align="center" justify="space-between" class="w-100">
          <v-col>
            <h2 class="text-h4 font-weight-bold">動物列表</h2>
          </v-col>
          <v-col cols="auto">
            <v-btn variant="outlined" class="mr-2" @click="clearFilters"> 清空搜尋條件 </v-btn>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog"> 新增動物 </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <!-- 篩選和搜尋區域 -->
      <v-card-text>
        <v-row align="center" justify="space-between">
          <v-col cols="12" md="6">
            <v-chip-group v-model="filterType" selected-class="text-white" color="primary" mandatory>
              <v-chip value="">全部</v-chip>
              <v-chip value="dog">
                <v-icon icon="mdi-dog" start />
                狗狗
              </v-chip>
              <v-chip value="cat">
                <v-icon icon="mdi-cat" start />
                貓咪
              </v-chip>
              <v-chip value="other">
                <v-icon icon="mdi-help-circle" start />
                其他
              </v-chip>
            </v-chip-group>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="searchKeyword" prepend-inner-icon="mdi-magnify" label="搜尋動物名稱" variant="outlined" hide-details density="compact" clearable />
          </v-col>
        </v-row>
      </v-card-text>

      <!-- 動物列表表格 -->
      <v-data-table :headers="headers" :items="showData" :loading="isLoading" height="700" class="elevation-1" @click:row="(event, { item }) => navigateToAnimal(item._id)">
        <!-- 基本資料欄位 -->
        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="40" class="mr-3">
              <v-img :src="item.avatar || '/image/sampleAvatar.png'" alt="動物頭像" />
            </v-avatar>
            <div>
              <div class="font-weight-bold d-flex align-center">
                <v-icon :icon="item.gender === 'male' ? 'mdi-gender-male' : 'mdi-gender-female'" :color="item.gender === 'male' ? 'blue' : 'pink'" size="small" class="mr-1" />
                {{ item.name }}
              </div>
              <div class="text-caption text-medium-emphasis d-flex align-center">
                <v-icon :icon="getAnimalIcon(item.type)" size="small" class="mr-1" />
                <span v-if="convertBirthdayToAge(item.birthday)">
                  {{ convertBirthdayToAge(item.birthday) }}
                </span>
              </div>
            </div>
          </div>
        </template>

        <!-- 體重欄位 -->
        <template v-slot:item.weight="{ item }">
          {{ item.weight ? `${item.weight} 公斤` : '-' }}
        </template>

        <!-- 血型欄位 -->
        <template v-slot:item.bloodType="{ item }">
          {{ item.bloodType ? `${item.bloodType} 型` : '-' }}
        </template>

        <!-- 結紮狀態欄位 -->
        <template v-slot:item.sterilized="{ item }">
          <v-chip :color="item.sterilized ? 'success' : 'error'" variant="tonal" size="small">
            {{ item.sterilized ? '是' : '否' }}
          </v-chip>
        </template>

        <!-- 新增日期欄位 -->
        <template v-slot:item.admissionDate="{ item }">
          {{ new Date(item.admissionDate).toLocaleDateString('zh-TW') }}
        </template>

        <!-- 操作按鈕欄位 -->
        <template v-slot:item.actions="{ item }">
          <v-btn icon="mdi-pencil" size="small" color="primary" variant="text" @click.stop="openEditDialog(item)" />
          <v-btn icon="mdi-delete" size="small" color="error" variant="text" @click.stop="openDeleteDialog(item)" />
        </template>

        <!-- 無資料狀態 -->
        <template v-slot:no-data>
          <div class="text-center pa-8">
            <v-icon icon="mdi-database-off" size="64" color="grey-lighten-1" class="mb-4" />
            <p class="text-h6 text-medium-emphasis">查無動物資料</p>
            <p class="text-body-2 text-medium-emphasis">請嘗試調整搜尋條件或新增動物</p>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>

  <!-- 新增動物 Modal -->
  <v-dialog v-model="createDialog" max-width="800px" persistent>
    <v-card>
      <v-card-title class="text-h5 pa-6">
        <v-icon icon="mdi-plus-circle" class="mr-2" color="primary" />
        新增動物資料
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <v-form @submit.prevent="createAnimal">
          <v-row>
            <!-- 動物頭像 -->
            <v-col cols="12" class="text-center">
              <v-avatar size="120" class="mb-4" @click="openFileUpload('create')">
                <v-img :src="createForm.avatarUrl || '/image/sampleAvatar.png'" alt="動物頭像" class="cursor-pointer" />
                <v-overlay :model-value="true" contained class="align-center justify-center cursor-pointer" opacity="0.3">
                  <v-icon icon="mdi-camera" size="24" />
                </v-overlay>
              </v-avatar>
              <input ref="createFileInput" type="file" accept="image/*" class="d-none" @change="handleFileChange('create', $event)" />
              <p class="text-caption text-medium-emphasis">點擊更換頭像</p>
            </v-col>

            <!-- 基本資料 -->
            <v-col cols="12" md="6">
              <VuTextField v-model="createForm.name" name="name" label="動物名稱" rules="required" prepend-inner-icon="mdi-tag" />
            </v-col>

            <v-col cols="12" md="6">
              <VuSelect v-model="createForm.gender" name="gender" label="性別" :items="genderOptions" prepend-inner-icon="mdi-gender-male-female" />
            </v-col>

            <v-col cols="12" md="6">
              <VuTextField v-model="createForm.weight" name="weight" label="體重 (公斤)" type="number" step="0.1" prepend-inner-icon="mdi-scale" />
            </v-col>

            <v-col cols="12" md="6">
              <VuTextField v-model="createForm.birthday" name="birthday" label="生日" type="date" prepend-inner-icon="mdi-calendar" />
            </v-col>

            <v-col cols="12" md="6">
              <VuSelect v-model="createForm.sterilized" name="sterilized" label="結紮狀態" :items="sterilizedOptions" prepend-inner-icon="mdi-medical-bag" />
            </v-col>

            <v-col cols="12" md="6">
              <VuTextField v-model="createForm.breed" name="breed" label="品種" prepend-inner-icon="mdi-dog" />
            </v-col>

            <!-- 血型選擇 -->
            <v-col cols="12">
              <v-label class="text-subtitle-2 mb-2">血型</v-label>
              <v-radio-group v-model="createForm.bloodType" row hide-details>
                <v-radio v-for="option in bloodTypeOptions" :key="option.value" :label="option.title" :value="option.value" />
              </v-radio-group>
            </v-col>

            <!-- 動物種類選擇 -->
            <v-col cols="12">
              <v-label class="text-subtitle-2 mb-2">動物種類</v-label>
              <v-radio-group v-model="createForm.type" row hide-details>
                <v-radio v-for="option in animalTypeOptions" :key="option.value" :label="option.title" :value="option.value">
                  <template v-slot:label>
                    <div class="d-flex align-center">
                      <v-icon :icon="getAnimalIcon(option.value)" class="mr-2" />
                      {{ option.title }}
                    </div>
                  </template>
                </v-radio>
              </v-radio-group>
            </v-col>

            <v-col cols="12" md="6">
              <VuTextField v-model="createForm.insulinBrand" name="insulinBrand" label="胰島素品牌" prepend-inner-icon="mdi-needle" />
            </v-col>

            <v-col cols="12" md="6">
              <VuTextField v-model="createForm.admissionDate" name="admissionDate" label="新增日期" type="date" prepend-inner-icon="mdi-calendar-plus" />
            </v-col>

            <!-- 資料共享 -->
            <v-col cols="12">
              <v-autocomplete v-model="createForm.sharedWith" :items="userList" item-title="account" item-value="_id" label="資料共享用戶" chips multiple closable-chips prepend-inner-icon="mdi-share-variant" :search-input.sync="createForm.searchText" hide-details>
                <template v-slot:chip="{ props, item }">
                  <v-chip v-bind="props" :text="item.raw.account" />
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn variant="outlined" @click="createDialog = false" :disabled="isLoading"> 取消 </v-btn>
        <v-btn color="primary" :loading="isLoading" @click="createAnimal"> 新增動物 </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 編輯動物 Modal -->
  <v-dialog v-model="editDialog" max-width="800px" persistent>
    <v-card>
      <v-card-title class="text-h5 pa-6">
        <v-icon icon="mdi-pencil-circle" class="mr-2" color="primary" />
        編輯動物資料
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <v-form @submit.prevent="updateAnimal">
          <v-row>
            <!-- 動物頭像 -->
            <v-col cols="12" class="text-center">
              <v-avatar size="120" class="mb-4" @click="openFileUpload('edit')">
                <v-img :src="editForm.avatarUrl || '/image/sampleAvatar.png'" alt="動物頭像" class="cursor-pointer" />
                <v-overlay :model-value="true" contained class="align-center justify-center cursor-pointer" opacity="0.3">
                  <v-icon icon="mdi-camera" size="24" />
                </v-overlay>
              </v-avatar>
              <input ref="editFileInput" type="file" accept="image/*" class="d-none" @change="handleFileChange('edit', $event)" />
              <p class="text-caption text-medium-emphasis">點擊更換頭像</p>
            </v-col>

            <!-- 基本資料 -->
            <v-col cols="12" md="6">
              <VuTextField v-model="editForm.name" name="editName" label="動物名稱" rules="required" prepend-inner-icon="mdi-tag" />
            </v-col>

            <v-col cols="12" md="6">
              <VuSelect v-model="editForm.gender" name="editGender" label="性別" :items="genderOptions" prepend-inner-icon="mdi-gender-male-female" />
            </v-col>

            <v-col cols="12" md="6">
              <VuTextField v-model="editForm.weight" name="editWeight" label="體重 (公斤)" type="number" step="0.1" prepend-inner-icon="mdi-scale" />
            </v-col>

            <v-col cols="12" md="6">
              <VuTextField v-model="editForm.birthday" name="editBirthday" label="生日" type="date" prepend-inner-icon="mdi-calendar" />
            </v-col>

            <v-col cols="12" md="6">
              <VuSelect v-model="editForm.sterilized" name="editSterilized" label="結紮狀態" :items="sterilizedOptions" prepend-inner-icon="mdi-medical-bag" />
            </v-col>

            <v-col cols="12" md="6">
              <VuTextField v-model="editForm.breed" name="editBreed" label="品種" prepend-inner-icon="mdi-dog" />
            </v-col>

            <!-- 血型選擇 -->
            <v-col cols="12">
              <v-label class="text-subtitle-2 mb-2">血型</v-label>
              <v-radio-group v-model="editForm.bloodType" row hide-details>
                <v-radio v-for="option in bloodTypeOptions" :key="option.value" :label="option.title" :value="option.value" />
              </v-radio-group>
            </v-col>

            <!-- 動物種類選擇 -->
            <v-col cols="12">
              <v-label class="text-subtitle-2 mb-2">動物種類</v-label>
              <v-radio-group v-model="editForm.type" row hide-details>
                <v-radio v-for="option in animalTypeOptions" :key="option.value" :label="option.title" :value="option.value">
                  <template v-slot:label>
                    <div class="d-flex align-center">
                      <v-icon :icon="getAnimalIcon(option.value)" class="mr-2" />
                      {{ option.title }}
                    </div>
                  </template>
                </v-radio>
              </v-radio-group>
            </v-col>

            <v-col cols="12" md="6">
              <VuTextField v-model="editForm.insulinBrand" name="editInsulinBrand" label="胰島素品牌" prepend-inner-icon="mdi-needle" />
            </v-col>

            <v-col cols="12" md="6">
              <VuTextField v-model="editForm.admissionDate" name="editAdmissionDate" label="新增日期" type="date" prepend-inner-icon="mdi-calendar-plus" />
            </v-col>

            <!-- 資料共享 -->
            <v-col cols="12">
              <v-autocomplete v-model="editForm.sharedWith" :items="userList" item-title="account" item-value="_id" label="資料共享用戶" chips multiple closable-chips prepend-inner-icon="mdi-share-variant" :search-input.sync="editForm.searchText" hide-details>
                <template v-slot:chip="{ props, item }">
                  <v-chip v-bind="props" :text="item.raw.account" />
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn variant="outlined" @click="editDialog = false" :disabled="isLoading"> 取消 </v-btn>
        <v-btn color="primary" :loading="isLoading" @click="updateAnimal"> 更新資料 </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 刪除確認 Modal -->
  <v-dialog v-model="deleteDialog" max-width="500px" persistent>
    <v-card>
      <v-card-title class="text-h5 pa-6 text-center">
        <div class="d-flex flex-column align-center">
          <v-avatar color="error" size="64" class="mb-4">
            <v-icon icon="mdi-delete-alert" size="32" color="white" />
          </v-avatar>
          <span class="text-h6">確認刪除動物</span>
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6 text-center">
        <p class="text-h6 mb-4">
          您確定要刪除
          <span class="font-weight-bold text-error">{{ deleteForm.name }}</span>
          的資料嗎？
        </p>

        <v-alert type="warning" variant="tonal" class="mb-4" prominent>
          <template v-slot:prepend>
            <v-icon icon="mdi-alert-triangle" />
          </template>
          <div class="text-left">
            <p class="font-weight-bold mb-2">⚠️ 警告：此操作無法復原</p>
            <ul class="text-body-2">
              <li>所有血糖記錄將被永久刪除</li>
              <li>所有血糖曲線資料將被永久刪除</li>
              <li>相關的醫療記錄將被永久刪除</li>
            </ul>
          </div>
        </v-alert>

        <p class="text-body-2 text-medium-emphasis">如果您只是想要暫時隱藏此動物，請考慮使用編輯功能而非刪除。</p>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn variant="outlined" @click="deleteDialog = false" :disabled="isLoading"> 取消 </v-btn>
        <v-btn color="error" variant="elevated" :loading="isLoading" @click="removeAnimal">
          <v-icon icon="mdi-delete" start />
          確認刪除
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
