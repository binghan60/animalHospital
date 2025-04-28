<script setup></script>

<template>
  <div class="flex flex-col items-center justify-center text-center" style="height: calc(100vh - 58px - 4rem)">
    <h1 class="text-6xl font-bold text-primary-900 dark:text-darkPrimary-50">404</h1>
    <p class="mt-4 text-xl text-primary-900 dark:text-darkPrimary-50">Oops! 這個頁面找不到了...</p>
    <router-link to="/" class="px-4 py-2 mt-6 text-white rounded bg-primary-500 hover:bg-primary-600 dark:bg-indigo-500 dark:hover:bg-indigo-600"> 回到首頁 </router-link>
  </div>
</template>
