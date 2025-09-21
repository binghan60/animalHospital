<script setup>
import { Field as VField } from 'vee-validate'

const props = defineProps({
  name: { type: String, required: true },
  label: { type: String, required: true },
  rules: { type: [String, Object, Function, Array], default: '' },
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  variant: { type: String, default: 'outlined' },
  density: { type: String, default: 'comfortable' },
  autocomplete: { type: String, default: 'off' },
  appendInnerIcon: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'clickAppendInner'])
</script>

<template>
  <VField :name="name" :rules="rules" :model-value="modelValue" v-slot="{ errors, field }">
    <v-text-field
      :label="label"
      :type="type"
      :name="name"
      :model-value="field.value"
      :error-messages="errors"
      :variant="variant"
      :density="density"
      :autocomplete="autocomplete"
      :append-inner-icon="appendInnerIcon || undefined"
      @click:append-inner="emit('clickAppendInner')"
      @update:modelValue="(v) => { emit('update:modelValue', v); field.onInput(v) }"
      @blur="field.onBlur"
    />
  </VField>
</template>
