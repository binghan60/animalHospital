<script setup></script>

<template>
  <div class="dark:text-darkPrimary-50">
    <div class="w-full p-4 mx-auto bg-white shadow-lg lg:p-8 dark:bg-darkPrimary-700 rounded-2xl">
      <h1 class="mb-4 text-3xl text-center">README</h1>

      <h1 class="my-2 text-2xl font-bold text-primary-900 dark:text-darkPrimary-50">網站說明</h1>
      <div class="col-span-2 p-4 rounded-lg lg:mr-2 dark:bg-darkPrimary-500 lg:col-span-1 bg-primary-100">
        <p class="text-xl text-primary-900 dark:text-darkPrimary-50">動物健康管理系統，專為動物醫院打造，方便記錄病患資訊與追蹤治療紀錄。內建血糖監測、圖表分析及動物資料共享功能，讓醫生與飼主更輕鬆掌握病況。</p>
      </div>
      <div class="mt-6">
        <h2 class="my-2 text-2xl font-bold text-primary-900 dark:text-darkPrimary-50">🛠 使用技術</h2>
        <div class="grid grid-cols-2 space-y-4 lg:space-y-0">
          <div class="col-span-2 p-4 rounded-lg lg:mr-2 dark:bg-darkPrimary-500 lg:col-span-1 bg-primary-100">
            <h3 class="text-2xl">前端</h3>
            <ul class="pl-2 mt-2 space-y-2 text-primary-900 dark:text-darkPrimary-50">
              <li class="flex items-center p-4 py-2 rounded-lg dark:hover:bg-darkPrimary-400 hover:bg-primary-200">
                <img class="w-10 mr-2" src="/image/VueLogo.png" alt="" />
                <p class="text-xl">Vue3 option API</p>
              </li>
              <li class="flex items-center p-4 py-2 rounded-lg dark:hover:bg-darkPrimary-400 hover:bg-primary-200">
                <img class="w-10 mr-2" src="/image/PiniaLogo.png" alt="" />
                <p class="text-xl">Pinia</p>
              </li>
              <li class="flex items-center p-4 py-2 rounded-lg dark:hover:bg-darkPrimary-400 hover:bg-primary-200">
                <img class="w-10 mr-2" src="/image/TailwindLogo.png" alt="" />
                <p class="text-xl">Tailwind CSS</p>
              </li>
              <li class="flex items-center p-4 py-2 rounded-lg dark:hover:bg-darkPrimary-400 hover:bg-primary-200">
                <img class="w-10 mr-2" src="/image/ChartjsLogo.png" alt="" />
                <p class="text-xl">Chart.js</p>
              </li>
              <li class="flex items-center p-4 py-2 rounded-lg dark:hover:bg-darkPrimary-400 hover:bg-primary-200">
                <img class="object-cover w-10 mr-2" src="/image/AxiosLogo.svg" alt="" />
                <p class="text-xl">Axios</p>
              </li>
            </ul>
          </div>
          <div class="col-span-2 p-4 rounded-lg lg:ml-2 dark:bg-darkPrimary-500 lg:col-span-1 bg-primary-100">
            <h3 class="text-2xl">後端</h3>
            <ul class="pl-2 mt-2 space-y-2 text-primary-900 dark:text-darkPrimary-50">
              <li class="flex items-center p-4 py-2 rounded-lg dark:hover:bg-darkPrimary-400 hover:bg-primary-200">
                <img class="w-10 mr-2" src="/image/NodejsLogo.png" alt="" />
                <p class="text-xl">Nodejs express</p>
              </li>

              <li class="flex items-center p-4 py-2 rounded-lg dark:hover:bg-darkPrimary-400 hover:bg-primary-200">
                <img class="w-10 mr-2" src="/image/MongoDBLogo.png" alt="" />
                <p class="text-xl">MongoDB</p>
              </li>
              <li class="flex items-center p-4 py-2 rounded-lg dark:hover:bg-darkPrimary-400 hover:bg-primary-200">
                <img class="w-10 mr-2" src="/image/CloudinaryLogo.png" alt="" />
                <p class="text-xl">Cloudinary</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="mt-6">
        <h2 class="my-2 text-2xl font-bold text-primary-900 dark:text-darkPrimary-50">✨ 功能介紹</h2>
        <div class="grid grid-cols-2 space-y-4 lg:space-y-0">
          <div class="col-span-2 p-4 mb-0 rounded-lg lg:mb-4 lg:mr-2 dark:bg-darkPrimary-500 bg-primary-100">
            <h3 class="text-2xl">通用功能</h3>
            <ul class="grid grid-cols-2 pl-2 mt-2 space-y-2 text-primary-900 dark:text-darkPrimary-50">
              <li class="flex items-center col-span-2 p-4 py-2 rounded-lg dark:hover:bg-darkPrimary-400 lg:col-span-1 hover:bg-primary-200">
                <p class="text-xl">會員註冊、登入、Jwt登入</p>
              </li>
              <li class="flex items-center col-span-2 p-4 py-2 rounded-lg dark:hover:bg-darkPrimary-400 lg:col-span-1 hover:bg-primary-200">
                <p class="text-xl">忘記密碼</p>
              </li>
              <li class="flex items-center col-span-2 p-4 py-2 rounded-lg dark:hover:bg-darkPrimary-400 lg:col-span-1 hover:bg-primary-200">
                <p class="text-xl">全響應式設計(RWD)</p>
              </li>
              <li class="flex items-center col-span-2 p-4 py-2 rounded-lg dark:hover:bg-darkPrimary-400 lg:col-span-1 hover:bg-primary-200">
                <p class="text-xl">資料共享</p>
              </li>
              <li class="flex items-center col-span-2 p-4 py-2 rounded-lg dark:hover:bg-darkPrimary-400 lg:col-span-1 hover:bg-primary-200">
                <p class="text-xl">暗色模式</p>
              </li>
            </ul>
          </div>
          <div class="col-span-2 p-4 rounded-lg lg:mr-2 dark:bg-darkPrimary-500 bg-primary-100 lg:col-span-1">
            <h3 class="text-2xl">🏥 醫院身分</h3>
            <ul class="pl-2 mt-2 space-y-2 text-primary-900 dark:text-darkPrimary-50">
              <li class="flex items-center p-4 py-2 rounded-lg dark:hover:bg-darkPrimary-400 hover:bg-primary-200">
                <p class="text-xl">新增、編輯病患資料</p>
              </li>
              <li class="flex items-center p-4 py-2 rounded-lg dark:hover:bg-darkPrimary-400 hover:bg-primary-200">
                <p class="text-xl">記錄與管理診療紀錄</p>
              </li>
              <li class="flex items-center p-4 py-2 rounded-lg dark:hover:bg-darkPrimary-400 hover:bg-primary-200">
                <p class="text-xl">醫院動物統計圖表</p>
              </li>
              <li class="flex items-center p-4 py-2 rounded-lg dark:hover:bg-darkPrimary-400 hover:bg-primary-200">
                <p class="text-xl">授權飼主存取動物資料權限</p>
              </li>
            </ul>
          </div>
          <div class="col-span-2 p-4 rounded-lg lg:ml-2 dark:bg-darkPrimary-500 bg-primary-100 lg:col-span-1">
            <h3 class="text-2xl">🐾 飼主身分</h3>
            <ul class="pl-2 mt-2 space-y-2 text-primary-900 dark:text-darkPrimary-50">
              <li class="flex items-center p-4 py-2 rounded-lg dark:hover:bg-darkPrimary-400 hover:bg-primary-200">
                <p class="text-xl">查看寵物病歷</p>
              </li>

              <li class="flex items-center p-4 py-2 rounded-lg cursor-pointer dark:hover:bg-darkPrimary-400 hover:bg-primary-200">
                <p class="text-xl">記錄血糖與體重變化</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="text-center">
        <router-link to="/login">
          <button type="submit" class="w-full px-4 py-2 my-6 text-white rounded-md lg:w-1/2 bg-primary-600 dark:bg-indigo-600 hover:dark:bg-indigo-700 hover:bg-primary-700 outline-1 focus:outline-2 focus:outline-primary-500 focus:outline-offset-2 focus:outline-none">立即體驗</button>
        </router-link>
        <div class="flex justify-center mt-4">
          <a href="https://github.com/binghan60/animalHospital" target="_blank" class="flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full shadow-lg dark:bg-darkPrimary-200">
            <img class="w-20" src="/image/GithubLogo.png" alt="GitHub" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
