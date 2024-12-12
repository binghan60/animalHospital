<script>
export default {
  data() {
    return {
      animalList: [],
    }
  },
  methods: {},
  mounted() {},
}
</script>

<template>
  <div class="grid grid-cols-1 gap-6 p-8 mx-auto lg:grid-cols-3 md:grid-cols-2 max-w-7xl">
    <div class="max-w-sm overflow-hidden rounded shadow-lg bg-primary-300">
      <img class="object-cover w-full h-48" src="/image/1.jpg" alt="動物圖片" />
      <div class="px-6 py-4">
        <div class="mb-2 text-xl font-bold">動物名稱</div>
        <p class="text-base text-gray-700">這是動物的簡短描述，介紹動物的一些基本資料或健康狀況。</p>
      </div>
      <div class="flex items-center justify-between px-6 py-4">
        <span class="text-xl font-bold text-blue-500">健康狀況: 良好</span>
        <button class="px-4 py-2 text-white transition bg-blue-500 rounded hover:bg-blue-700">查看詳情</button>
      </div>
    </div>
    <div class="max-w-sm overflow-hidden rounded shadow-lg">
      <img class="object-cover w-full h-48" src="/image/2.jpg" alt="動物圖片" />
      <div class="px-6 py-4">
        <div class="mb-2 text-xl font-bold">動物名稱</div>
        <p class="text-base text-gray-700">這是動物的簡短描述，介紹動物的一些基本資料或健康狀況。</p>
      </div>
      <div class="flex items-center justify-between px-6 py-4">
        <span class="text-xl font-bold text-blue-500">健康狀況: 良好</span>
        <button class="px-4 py-2 text-white transition bg-blue-500 rounded hover:bg-blue-700">查看詳情</button>
      </div>
    </div>
    <div class="max-w-sm overflow-hidden rounded shadow-lg">
      <img class="object-cover w-full h-48" src="/image/2.jpg" alt="動物圖片" />
      <div class="px-6 py-4">
        <div class="mb-2 text-xl font-bold">動物名稱</div>
        <p class="text-base text-gray-700">這是動物的簡短描述，介紹動物的一些基本資料或健康狀況。</p>
      </div>
      <div class="flex items-center justify-between px-6 py-4">
        <span class="text-xl font-bold text-blue-500">健康狀況: 良好</span>
        <button class="px-4 py-2 text-white transition bg-blue-500 rounded hover:bg-blue-700">查看詳情</button>
      </div>
    </div>
  </div>
</template>
