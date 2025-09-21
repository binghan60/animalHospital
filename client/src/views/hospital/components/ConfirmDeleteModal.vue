<template>
  <div v-show="visible" class="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-70" @mousedown="$emit('cancel')">
    <div class="bg-white p-6 rounded-xl shadow-2xl text-center w-[90%] max-w-md dark:bg-darkPrimary-700" @mousedown.stop>
      <div class="mb-4">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <i class="fa-solid fa-exclamation-triangle text-red-600 dark:text-red-400 text-xl"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-darkPrimary-50 mb-2">{{ title }}</h3>
        <p class="text-sm text-gray-600 dark:text-darkPrimary-300 mb-2">{{ message }}</p>

        <!-- 顯示要刪除的項目資訊 -->
        <div v-if="itemInfo" class="my-4">
          <div v-for="(value, key) in itemInfo" :key="key" class="text-base font-medium text-primary-600 dark:text-indigo-400">
            {{ value }}
          </div>
        </div>

        <p class="text-xs text-red-600 dark:text-red-400 mt-2">⚠️ 此操作無法復原</p>
      </div>

      <div class="flex justify-center gap-4">
        <button type="button" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-darkPrimary-600 dark:text-darkPrimary-50 dark:hover:bg-darkPrimary-500 transition-all" @click="$emit('cancel')">取消</button>
        <button v-if="loading" class="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed" disabled>
          <div class="w-4 h-4 border-2 border-white border-solid rounded-full animate-spin border-t-transparent"></div>
          <span class="ml-2">刪除中...</span>
        </button>
        <button v-else type="button" class="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 transition-all" @click="$emit('confirm')">確認刪除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '確認刪除',
  },
  message: {
    type: String,
    default: '您確定要刪除此項目嗎？',
  },
  itemInfo: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['confirm', 'cancel'])
</script>
