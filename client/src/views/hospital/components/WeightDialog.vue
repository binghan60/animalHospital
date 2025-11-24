<template>
  <v-dialog :model-value="modelValue" max-width="500" persistent @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>{{ isEditMode ? '編輯體重記錄' : '新增體重記錄' }}</span>
        <v-btn icon="mdi-close" variant="text" @click="$emit('update:modelValue', false)" />
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef">
          <v-text-field v-model="localForm.date" label="日期" type="date" variant="outlined" density="compact" :rules="[v => !!v || '日期為必填']" prepend-inner-icon="mdi-calendar" />
          <v-text-field v-model="localForm.value" label="體重" type="number" variant="outlined" density="compact" :rules="[v => !!v || '體重為必填']" suffix="公斤" prepend-inner-icon="mdi-weight-kilogram" />
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

const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref(null)
const localForm = ref({ ...props.form })

const isEditMode = computed(() => props.mode === 'edit')

// 當外部 form 變更時同步
watch(
  () => props.form,
  newForm => {
    localForm.value = { ...newForm }
  },
  { deep: true },
)

// 當對話框關閉時重置表單
watch(
  () => props.modelValue,
  isOpen => {
    if (isOpen) {
      localForm.value = { ...props.form }
    }
  },
)

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (valid) {
    emit('submit', localForm.value)
  }
}
</script>
