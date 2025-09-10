<template>
  <div>
    <div class="col-span-2 py-3 text-2xl font-bold text-center select-none text-primary-900 lg:col-span-7 dark:text-darkPrimary-50">
      {{ weekRange }}
    </div>
    <div class="overflow-x-auto">
      <div class="flex gap-2 lg:grid lg:grid-cols-7">
        <div 
          v-for="day in weekData" 
          :key="day.date" 
          :class="[
            'p-4 border rounded-lg shadow-sm overflow-hidden h-[900px]', 
            day.isToday 
              ? 'border-primary-500 dark:border-indigo-500 border-2 bg-primary-50 dark:bg-darkPrimary-600' 
              : 'bg-white dark:bg-darkPrimary-600'
          ]" 
          class="shrink-0 w-[150px] lg:w-auto"
        >
          <!-- 日期與星期 -->
          <div class="mb-2 text-sm font-semibold text-center text-gray-700 dark:text-darkPrimary-50">
            {{ day.date }} ({{ day.day }})
          </div>
          
          <!-- 新增事項按鈕 -->
          <button 
            type="button" 
            class="w-full px-2 py-1.5 mb-2 text-sm text-white rounded-md bg-primary-600 hover:bg-primary-700 dark:bg-indigo-600 hover:dark:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-primary-300" 
            @click="$emit('openTaskModal', day.date)"
          >
            + 新增事項
          </button>
          
          <!-- 事項清單 -->
          <ul class="h-[800px] space-y-2 overflow-hidden overflow-y-auto scrollbar">
            <li 
              v-for="(task, index) in day.records" 
              :key="index" 
              :class="[
                'p-3 text-sm border rounded-lg', 
                task.author === user._id 
                  ? 'bg-gray-100 cursor-pointer hover:bg-primary-100 dark:bg-darkPrimary-600' 
                  : 'bg-amber-50 dark:bg-darkPrimary-500 select-none cursor-not-allowed'
              ]" 
              @click="task.author === user._id ? $emit('openEditTaskModal', day.date, day._id, task._id, task.time, task.bloodSugar, task.insulin, task.notes, day.notes) : null"
            >
              <div class="flex justify-between mb-1 text-gray-800 dark:text-darkPrimary-50">
                <div>🕒{{ task.time }}</div>
                <i v-if="task.author === user._id" class="fa-solid fa-pen-to-square"></i>
              </div>
              <div v-show="task.bloodSugar" class="text-gray-600 dark:text-darkPrimary-50">
                <i class="fa-solid fa-droplet fa-fw"></i> : {{ task.bloodSugar }}
              </div>
              <div v-show="task.insulin" class="text-gray-600 dark:text-darkPrimary-50">
                <i class="fa-solid fa-syringe fa-fw"></i> : {{ task.insulin }}
              </div>
              <div v-show="task.notes" class="text-gray-600 dark:text-darkPrimary-50">
                <i class="fa-regular fa-comment-dots fa-fw"></i> : {{ task.notes }}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  weekData: {
    type: Array,
    required: true,
    default: () => []
  },
  weekRange: {
    type: String,
    required: true
  },
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([
  'openTaskModal',
  'openEditTaskModal'
])
</script>

<style scoped>
.scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgb(156 163 175) transparent;
}

.scrollbar::-webkit-scrollbar {
  width: 6px;
}

.scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar::-webkit-scrollbar-thumb {
  background-color: rgb(156 163 175);
  border-radius: 3px;
}

.scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgb(107 114 128);
}
</style>