<template>
  <v-dialog :model-value="modelValue" max-width="800" persistent scrollable @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>{{ isEditMode ? '編輯血糖曲線' : '新增血糖曲線' }}</span>
        <v-btn icon="mdi-close" variant="text" @click="$emit('update:modelValue', false)" />
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef">
          <v-row class="align-center mb-4">
            <v-col cols="8">
              <v-menu v-model="mainDateMenu" :close-on-content-click="false" location="bottom">
                <template v-slot:activator="{ props }">
                  <v-text-field v-model="localForm.date" label="日期" type="text" variant="outlined" density="compact" :rules="[v => !!v || '日期為必填']" prepend-inner-icon="mdi-calendar" hide-details readonly v-bind="props" />
                </template>
                <v-date-picker v-model="localForm.date" color="primary" @update:model-value="onMainDateSelected"></v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="4">
              <v-menu v-model="dateMenu" :close-on-content-click="false" location="bottom">
                <template v-slot:activator="{ props }">
                  <v-btn color="primary" variant="outlined" v-bind="props">
                    <v-icon start icon="mdi-database-search-outline"></v-icon>
                    載入資料
                  </v-btn>
                </template>
                <v-date-picker v-model="localForm.date" color="primary" @update:model-value="onDateSelectedAndLoad"></v-date-picker>
              </v-menu>
            </v-col>
          </v-row>
          <!-- 動態欄位 -->
          <div class="mb-2 text-subtitle-2 text-medium-emphasis">血糖記錄</div>

          <v-row v-for="(field, index) in localForm.fields" :key="index" class="mb-2 align-center">
            <v-col cols="12" md="3">
              <v-text-field v-model="field.time" label="時間" type="time" variant="outlined" density="compact" prepend-inner-icon="mdi-clock" :rules="[v => !!v || '時間為必填']" hide-details />
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field v-model="field.value" label="血糖值" type="number" variant="outlined" density="compact" prepend-inner-icon="mdi-water" suffix="mg/dL" hide-details />
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field v-model="field.insulin" label="胰島素" type="number" variant="outlined" density="compact" prepend-inner-icon="mdi-needle" suffix="U" hide-details />
            </v-col>

            <v-col cols="12" md="3" class="text-center">
              <v-btn icon="mdi-close" size="small" color="error" variant="text" :disabled="localForm.fields.length === 1" @click="removeField(index)" />
            </v-col>
          </v-row>

          <!-- 新增欄位按鈕 -->
          <v-btn prepend-icon="mdi-plus" variant="outlined" color="primary" class="mt-3" block @click="addField"> 新增血糖記錄 </v-btn>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" variant="text" :disabled="loading" @click="$emit('update:modelValue', false)"> 取消 </v-btn>
        <v-btn color="primary" variant="elevated" :loading="loading" @click="handleSubmit">
          {{ isEditMode ? '更新' : '新增' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { formatDateToYyyyMmDd } from '@/utils/dateFormatter';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  form: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: 'create', // 'create' | 'edit'
    validator: value => ['create', 'edit'].includes(value),
  },
})

const emit = defineEmits(['update:modelValue', 'submit', 'load-data'])

const formRef = ref(null)
const localForm = ref({
  date: props.form.date,
  fields: [...props.form.fields],
})

const dateMenu = ref(false)
const mainDateMenu = ref(false)

const isEditMode = computed(() => props.mode === 'edit')

const onDateSelectedAndLoad = (selectedDate) => {
  const formattedDate = formatDateToYyyyMmDd(selectedDate)
  localForm.value.date = formattedDate
  emit('load-data', formattedDate)
  dateMenu.value = false
}

const onMainDateSelected = (selectedDate) => {
  localForm.value.date = formatDateToYyyyMmDd(selectedDate)
  mainDateMenu.value = false
}

// 當外部 form 變更時同步
watch(
  () => props.form,
  newForm => {
    localForm.value = {
      date: newForm.date,
      fields: [...newForm.fields],
    }
  },
  { deep: true },
)

// 當對話框關閉時重置表單
watch(
  () => props.modelValue,
  isOpen => {
    if (isOpen) {
      localForm.value = {
        date: props.form.date,
        fields: [...props.form.fields],
      }
    }
  },
)

const addField = () => {
  localForm.value.fields.push({ time: '', value: '', insulin: '' })
}

const removeField = index => {
  if (localForm.value.fields.length > 1) {
    localForm.value.fields.splice(index, 1)
  }
}

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (valid) {
    emit('submit', localForm.value)
  }
}
</script>
