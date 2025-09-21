<script setup>
import { Field as VField } from 'vee-validate'

const props = defineProps({
  name: { type: String, required: true },
  label: { type: String, required: true },
  rules: { type: [String, Object, Function, Array], default: '' },
  modelValue: { type: [String, Number], default: '' },
  items: { type: Array, default: () => [] },
  itemTitle: { type: String, default: 'title' },
  itemValue: { type: String, default: 'value' },
  variant: { type: String, default: 'outlined' },
  density: { type: String, default: 'comfortable' },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <VField :name="name" :rules="rules" v-slot="{ errors, handleChange }">
    <v-select
      :label="label"
      :items="items"
      :item-title="itemTitle"
      :item-value="itemValue"
      :model-value="modelValue"
      :error-messages="errors"
      :variant="variant"
      :density="density"
      @update:modelValue="(v) => { emit('update:modelValue', v); handleChange(v) }"
    />
  </VField>
</template>
