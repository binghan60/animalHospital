<template>
  <div class="grid grid-cols-2 col-span-7 gap-1 lg:grid-cols-7">
    <div class="col-span-2 py-3 text-2xl font-bold text-center select-none text-primary-900 dark:text-darkPrimary-50 lg:col-span-7">
      <span class="px-4">{{ newtoday.year }} 年 {{ newtoday.month + 1 }} 月 血糖總覽</span>
    </div>
    
    <!-- 週標題 -->
    <div class="hidden grid-cols-7 col-span-7 gap-1 text-2xl font-semibold text-center text-primary-900 lg:grid dark:text-darkPrimary-50">
      <div>一</div>
      <div>二</div>
      <div>三</div>
      <div>四</div>
      <div>五</div>
      <div>六</div>
      <div>日</div>
    </div>
    
    <!-- 日曆格子 -->
    <template v-for="(day, index) in calendar" :key="day.isoDate || index">
      <div 
        v-if="day.day" 
        :class="[
          'p-2 m-1 rounded-lg select-none dark:bg-darkPrimary-600 dark:text-darkPrimary-50 bg-primary-200 text-primary-900', 
          { 
            'bg-primary-400 dark:bg-stone-600': day.isToday, 
            'cursor-pointer': day.records?.length 
          }
        ]" 
        @click="day.records?.length ? $emit('showTips', $event, day?.records) : null"
      >
        <div class="font-bold text-center">
          {{ day.month }} / {{ day.day }} {{ day.records?.length > 2 ? '**' : '' }}
        </div>
        
        <!-- 早上 -->
        <div class="p-2 mb-2 rounded-md bg-primary-100 hover:bg-primary-300 dark:bg-darkPrimary-500 dark:hover:bg-darkPrimary-400">
          <div class="text-center text-primary-900 dark:text-darkPrimary-50">
            <i class="fa-regular fa-sun fa-fw"></i> {{ calendar[index].morning.time }}
          </div>
          <div 
            :class="[
              'w-full p-1 mt-1 text-sm border border-gray-300 rounded select-none', 
              bloodSugarColor(calendar[index].morning.bloodSugar)
            ]"
          >
            <i class="fa-solid fa-droplet fa-fw"></i> : 
            <span>{{ calendar[index].morning.bloodSugar ? calendar[index].morning.bloodSugar : '---' }}</span>
          </div>
          <div class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none dark:bg-darkPrimary-600">
            <i class="fa-solid fa-syringe fa-fw"></i> : 
            {{ calendar[index].morning.insulin || calendar[index].morning.insulin === 0 ? calendar[index].morning.insulin + ' 小格' : '---' }}
          </div>
        </div>
        
        <!-- 晚上 -->
        <div class="p-2 rounded-md bg-primary-100 hover:bg-primary-300 dark:bg-darkPrimary-500 dark:hover:bg-darkPrimary-400">
          <div class="text-center text-primary-900 dark:text-darkPrimary-50">
            <i class="fa-regular fa-moon fa-fw"></i> {{ calendar[index].evening.time }}
          </div>
          <div 
            :class="[
              'w-full p-1 mt-1 text-sm border border-gray-300 rounded select-none', 
              bloodSugarColor(calendar[index].evening.bloodSugar)
            ]"
          >
            <i class="fa-solid fa-droplet fa-fw"></i> : 
            <span>{{ calendar[index].evening.bloodSugar ? calendar[index].evening.bloodSugar : '---' }}</span>
          </div>
          <div class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none dark:bg-darkPrimary-600">
            <i class="fa-solid fa-syringe fa-fw"></i> : 
            {{ calendar[index].evening.insulin || calendar[index].evening.insulin === 0 ? calendar[index].evening.insulin + ' 小格' : '---' }}
          </div>
        </div>
      </div>
      
      <!-- 空白日期 -->
      <div 
        v-else 
        :class="[
          'p-2 m-1 rounded-md h-[264px] hidden lg:grid', 
          { lazyLoading: day.loading }
        ]"
      ></div>
    </template>

    <!-- 提示框 -->
    <div 
      v-show="showTooltip" 
      class="absolute p-3 bg-white border rounded-lg shadow-lg dark:bg-darkPrimary-700 border-primary-400 dark:border-darkPrimary-400" 
      :style="tooltipStyle"
    >
      <button 
        class="absolute top-2 right-2 group flex h-6 w-6 select-none items-center justify-center rounded-lg bg-white leading-8 text-zinc-950 shadow-[0_-1px_0_0px_#d4d4d8_inset,0_0_0_1px_#f4f4f5_inset,0_0.5px_0_1.5px_#fff_inset] hover:bg-zinc-50 hover:via-zinc-900 hover:to-zinc-800 active:shadow-[-1px_0px_1px_0px_#e4e4e7_inset,1px_0px_1px_0px_#e4e4e7_inset,0px_0.125rem_1px_0px_#d4d4d8_inset]" 
        aria-label="Close tooltip" 
        @click="$emit('hideTooltip')"
      >
        <span class="flex items-center group-active:[transform:translate3d(0,1px,0)]">
          <i class="fa-solid fa-x fa-fw"></i>
        </span>
      </button>
      <div>
        <table class="min-w-full text-sm text-left">
          <thead class="font-semibold border-b bg-primary-100 border-primary-400 dark:border-darkPrimary-100 dark:bg-darkPrimary-600 text-primary-600 dark:text-darkPrimary-50">
            <tr>
              <th class="px-4 py-2">時間</th>
              <th class="px-4 py-2">血糖值</th>
              <th class="px-4 py-2">胰島素</th>
              <th class="px-4 py-2">備註</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="data in hoverData" 
              :key="data.id" 
              class="border-b border-primary-100 dark:border-darkPrimary-400 dark:bg-darkPrimary-500 dark:text-darkPrimary-50 text-primary-900"
            >
              <td class="px-4 py-2">{{ data?.time }}</td>
              <td class="px-4 py-2">{{ data?.bloodSugar || '無' }}</td>
              <td class="px-4 py-2">{{ data?.insulin || '無' }}</td>
              <td class="px-4 py-2">{{ data?.notes || '無' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  calendar: {
    type: Array,
    required: true,
    default: () => []
  },
  newtoday: {
    type: Object,
    required: true
  },
  bloodSugarColor: {
    type: Function,
    required: true
  },
  showTooltip: {
    type: Boolean,
    default: false
  },
  hoverData: {
    type: Array,
    default: () => []
  },
  tooltipStyle: {
    type: Object,
    default: () => ({ top: '0px', left: '0px' })
  }
})

const emit = defineEmits([
  'showTips',
  'hideTooltip'
])
</script>

<style scoped>
.lazyLoading {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>