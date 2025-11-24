<template>
  <v-dialog :model-value="modelValue" max-width="400" persistent @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon :color="iconColor" class="mr-2">{{ icon }}</v-icon>
        <span>{{ title }}</span>
      </v-card-title>

      <v-card-text>
        <div class="text-body-1 mb-3">{{ message }}</div>

        <v-card v-if="details" variant="outlined" class="pa-3">
          <div v-for="(value, key) in details" :key="key" class="d-flex justify-space-between mb-1">
            <span class="text-medium-emphasis">{{ key }}:</span>
            <span class="font-weight-medium">{{ value }}</span>
          </div>
        </v-card>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn :color="cancelColor" variant="text" :disabled="loading" @click="$emit('update:modelValue', false)">
          {{ cancelText }}
        </v-btn>
        <v-btn :color="confirmColor" variant="elevated" :loading="loading" @click="$emit('confirm')">
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '確認操作',
  },
  message: {
    type: String,
    required: true,
  },
  details: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'warning', // 'warning' | 'danger' | 'info'
    validator: value => ['warning', 'danger', 'info'].includes(value),
  },
  confirmText: {
    type: String,
    default: '確認',
  },
  cancelText: {
    type: String,
    default: '取消',
  },
})

defineEmits(['update:modelValue', 'confirm'])

const icon = computed(() => {
  const iconMap = {
    warning: 'mdi-alert',
    danger: 'mdi-alert-circle',
    info: 'mdi-information',
  }
  return iconMap[props.type] || 'mdi-help-circle'
})

const iconColor = computed(() => {
  const colorMap = {
    warning: 'warning',
    danger: 'error',
    info: 'info',
  }
  return colorMap[props.type] || 'grey'
})

const confirmColor = computed(() => {
  const colorMap = {
    warning: 'warning',
    danger: 'error',
    info: 'primary',
  }
  return colorMap[props.type] || 'primary'
})

const cancelColor = computed(() => 'grey')
</script>
