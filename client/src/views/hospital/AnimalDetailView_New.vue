<template>
  <div>
    <!-- 基本資料區塊 -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <!-- 動物頭像 -->
      <AnimalAvatar :avatar="animal.Info.avatar" :animalName="animal.Info.name" />

      <!-- 基本資料 -->
      <AnimalBasicInfo :animalInfo="animal.Info" />

      <!-- 體重圖表 -->
      <WeightChart :weightData="animal.Info.weight || []" @openWeightManagement="weightModals.weightList.toggle = true" />

      <!-- 血糖平均圖表 -->
      <BloodSugarAverageChart :averageData="averageChart.rawData" :title="averageChart.title" />
    </div>
    <BloodSugarCalendar :animalId="animalId" :user="user" @dateRangeChanged="onDateRangeChanged" @bloodSugarChanged="onBloodSugarChanged" />

    <!-- 血糖曲線控制面板 -->
    <BloodSugarCurvePanel :yearMonthStats="bloodSugarCurveChart.yearMonthStats" :filteredCount="bloodSugarCurveChart.filteredData.length" :totalCount="bloodSugarCurveChart.allData.length" @selectYear="selectYear" @selectMonth="selectMonth" @clearYearMonthSelection="clearYearMonthSelection" />

    <!-- 血糖曲線圖表 -->
    <div v-if="bloodSugarCurveChart.filteredData.length === 0" class="p-8 mt-4 text-center bg-white rounded-lg shadow-lg dark:bg-darkPrimary-700">
      <div class="text-gray-500 dark:text-darkPrimary-400">
        <i class="mb-4 fa-solid fa-chart-line fa-3x"></i>
        <p class="text-lg">目前沒有血糖曲線資料</p>
        <p class="mt-2 text-sm">請點擊右下角的圖表按鈕新增血糖曲線</p>
      </div>
    </div>

    <BloodSugarCurveChart :curveData="bloodSugarCurveChart.filteredData" @editCurve="openEditBloodSugarCurveModal" @deleteCurve="openDeleteConfirmModal" />

    <!-- 血糖日曆 -->

    <!-- 浮動按鈕 -->
    <div class="fixed z-10 space-y-4 lg:right-6 lg:bottom-6 right-3 bottom-6">
      <button type="button" class="flex items-center justify-center w-12 h-12 text-black bg-yellow-300 rounded-full shadow-md dark:bg-amber-300 lg:w-14 lg:h-14" @click="weightModals.weight.toggle = true">
        <i class="fa-solid fa-weight-scale fa-fw"></i>
      </button>
      <button type="button" class="flex items-center justify-center w-12 h-12 text-black bg-pink-300 rounded-full shadow-md dark:bg-rose-300 lg:w-14 lg:h-14" @click="bloodSugarCurveModals.bloodSugarCurve.toggle = true">
        <i class="fa-solid fa-chart-line fa-fw"></i>
      </button>
    </div>

    <!-- 確認刪除模態框 -->
    <ConfirmDeleteModal :visible="deleteConfirmModal.visible" :title="deleteConfirmModal.title" :message="deleteConfirmModal.message" :itemInfo="deleteConfirmModal.itemInfo" :loading="deleteConfirmModal.loading" @confirm="confirmDelete" @cancel="cancelDelete" />

    <!-- 刪除血糖曲線確認對話框 -->
    <div v-show="bloodSugarCurveModals.deleteConfirm.toggle" class="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-70" @mousedown="cancelDeleteBloodSugarCurve">
      <div class="bg-white p-6 rounded-xl shadow-2xl text-center w-[90%] max-w-md dark:bg-darkPrimary-700" @mousedown.stop>
        <div class="mb-4">
          <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900/20">
            <i class="text-xl text-red-600 fa-solid fa-exclamation-triangle dark:text-red-400"></i>
          </div>
          <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-darkPrimary-50">確認刪除血糖曲線</h3>
          <p class="mb-2 text-sm text-gray-600 dark:text-darkPrimary-300">
            您確定要刪除以下血糖曲線嗎？
          </p>
          <p class="text-base font-medium text-primary-600 dark:text-indigo-400">
            {{ bloodSugarCurveModals.deleteConfirm.curveDate }}
          </p>
          <p class="mt-2 text-xs text-red-600 dark:text-red-400">
            ⚠️ 此操作無法復原
          </p>
        </div>
        
        <div class="flex justify-center gap-4">
          <button 
            type="button"
            class="px-4 py-2 text-gray-700 transition-all bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-darkPrimary-600 dark:text-darkPrimary-50 dark:hover:bg-darkPrimary-500"
            @click="cancelDeleteBloodSugarCurve"
          >
            取消
          </button>
          <button 
            v-if="bloodSugarCurveModals.deleteConfirm.loading"
            class="inline-flex items-center justify-center px-4 py-2 text-white bg-red-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled
          >
            <div class="w-4 h-4 border-2 border-white border-solid rounded-full animate-spin border-t-transparent"></div>
            <span class="ml-2">刪除中...</span>
          </button>
          <button 
            v-else
            type="button"
            class="px-4 py-2 text-white transition-all bg-red-600 rounded-lg hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            @click="confirmDeleteBloodSugarCurveWithUpdate"
          >
            確認刪除
          </button>
        </div>
      </div>
    </div>

    <!-- 體重視窗 -->
    <div v-show="weightModals.weight.toggle" class="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-70" @mousedown.stop="weightModals.weight.toggle = false">
      <div class="bg-white p-4 lg:p-8 rounded-xl shadow-2xl text-center w-[90%] max-w-2xl dark:bg-darkPrimary-700" @mousedown.stop>
        <VForm @submit="createWeight">
          <h2 class="mb-2 text-xl font-semibold text-gray-800 dark:text-darkPrimary-50">新增體重紀錄</h2>
          <div class="grid grid-cols-[1fr_1fr] gap-x-4 lg:grid-cols-2 items-center border p-2 rounded-md shadow-md">
            <VField v-model="weightModals.weight.date" name="weightDate" rules="required" type="date" class="w-full h-10 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" />
            <VField v-model="weightModals.weight.value" name="weightValue" rules="required" type="number" placeholder="輸入體重" class="w-full h-10 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
            <div>
              <ErrorMessage name="weightDate" class="mt-1 text-sm text-red-500 dark:text-rose-400" />
            </div>
            <div>
              <ErrorMessage name="weightValue" class="mt-1 text-sm text-red-500 dark:text-rose-400" />
            </div>
          </div>

          <div class="flex justify-between mt-4 space-x-4">
            <button type="button" class="w-1/2 px-6 py-2 text-gray-700 transition-all bg-gray-300 rounded-lg shadow-md lg:w-1/3 dark:bg-darkPrimary-50 hover:dark:bg-darkPrimary-400 hover:bg-gray-400" @click="weightModals.weight.toggle = false">取消</button>
            <button v-if="weightModals.weight.loading" class="inline-flex items-center justify-center w-1/2 px-6 py-2 rounded-md lg:w-1/3 bg-primary-600 dark:bg-indigo-600 text-darkPrimary-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-auto" disabled="">
              <div class="w-4 h-4 border-2 border-white border-solid rounded-full animate-spin border-t-transparent"></div>
              <span class="ml-2">新增中... </span>
            </button>
            <button v-else type="submit" class="w-1/2 px-4 py-2 text-white rounded-md lg:w-1/3 bg-primary-600 dark:bg-indigo-600 hover:dark:bg-indigo-700 hover:bg-primary-700 outline-1 focus:outline-2 focus:outline-primary-500 focus:outline-offset-2 focus:outline-none">新增體重</button>
          </div>
        </VForm>
      </div>
    </div>

    <!-- 體重記錄管理視窗 -->
    <div v-show="weightModals.weightList.toggle" class="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-70" @mousedown="weightModals.weightList.toggle = false">
      <div class="bg-white p-6 rounded-xl shadow-2xl w-[90%] max-w-2xl max-h-[80vh] overflow-hidden dark:bg-darkPrimary-700" @mousedown.stop>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-gray-800 dark:text-darkPrimary-50">體重記錄管理</h3>
          <button 
            type="button"
            class="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-darkPrimary-600"
            @click="weightModals.weightList.toggle = false"
          >
            <i class="text-gray-500 fa-solid fa-x dark:text-darkPrimary-300"></i>
          </button>
        </div>
        
        <div class="overflow-y-auto max-h-[60vh]">
          <div v-if="animal.Info.weight && animal.Info.weight.length > 0" class="space-y-2">
            <div 
              v-for="weightRecord in animal.Info.weight.slice().reverse()" 
              :key="weightRecord._id"
              class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-darkPrimary-600 dark:border-darkPrimary-500"
            >
              <div class="flex-1">
                <div class="font-medium text-primary-900 dark:text-darkPrimary-50">
                  {{ weightRecord.value }} 公斤
                </div>
                <div class="text-sm text-gray-600 dark:text-darkPrimary-300">
                  {{ new Date(weightRecord.date).toISOString().split('T')[0] }}
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="px-3 py-1 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600"
                  @click="openEditWeightModal(weightRecord)"
                >
                  <i class="fa-solid fa-edit fa-fw"></i> 編輯
                </button>
                <button
                  type="button"
                  class="px-3 py-1 text-sm text-white bg-red-500 rounded-md hover:bg-red-600"
                  @click="openDeleteWeightConfirmModal(weightRecord)"
                >
                  <i class="fa-solid fa-trash fa-fw"></i> 刪除
                </button>
              </div>
            </div>
          </div>
          <div v-else class="py-8 text-center text-gray-500 dark:text-darkPrimary-400">
            <i class="mb-4 fa-solid fa-weight-scale fa-3x"></i>
            <p>目前沒有體重記錄</p>
          </div>
        </div>
        
        <div class="pt-4 mt-4 border-t dark:border-darkPrimary-500">
          <button
            type="button"
            class="w-full px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
            @click="weightModals.weightList.toggle = false; weightModals.weight.toggle = true"
          >
            <i class="fa-solid fa-plus fa-fw"></i> 新增體重記錄
          </button>
        </div>
      </div>
    </div>

    <!-- 編輯體重視窗 -->
    <div v-show="weightModals.editWeight.toggle" class="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-70" @mousedown="weightModals.editWeight.toggle = false">
      <div class="bg-white p-6 rounded-xl shadow-2xl text-center w-[90%] max-w-md dark:bg-darkPrimary-700" @mousedown.stop>
        <VForm @submit="updateWeight">
          <h2 class="mb-4 text-xl font-semibold text-gray-800 dark:text-darkPrimary-50">編輯體重記錄</h2>
          
          <div class="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label class="block mb-1 text-sm font-medium text-left dark:text-darkPrimary-50">日期</label>
              <VField v-model="weightModals.editWeight.date" name="editWeightDate" rules="required" type="date" class="w-full h-10 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400" />
              <ErrorMessage name="editWeightDate" class="mt-1 text-sm text-red-500 dark:text-rose-400" />
            </div>
            <div>
              <label class="block mb-1 text-sm font-medium text-left dark:text-darkPrimary-50">體重 (公斤)</label>
              <VField v-model="weightModals.editWeight.value" name="editWeightValue" rules="required" type="number" step="0.1" placeholder="輸入體重" class="w-full h-10 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400" />
              <ErrorMessage name="editWeightValue" class="mt-1 text-sm text-red-500 dark:text-rose-400" />
            </div>
          </div>

          <div class="flex justify-between space-x-4">
            <button type="button" class="w-1/2 px-6 py-2 text-gray-700 transition-all bg-gray-300 rounded-lg shadow-md dark:bg-darkPrimary-50 hover:dark:bg-darkPrimary-400 hover:bg-gray-400" @click="weightModals.editWeight.toggle = false">取消</button>
            <button v-if="weightModals.editWeight.loading" class="inline-flex items-center justify-center w-1/2 px-6 py-2 rounded-md bg-primary-600 dark:bg-indigo-600 text-darkPrimary-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <div class="w-4 h-4 border-2 border-white border-solid rounded-full animate-spin border-t-transparent"></div>
              <span class="ml-2">更新中...</span>
            </button>
            <button v-else type="submit" class="w-1/2 px-4 py-2 text-white rounded-md bg-primary-600 dark:bg-indigo-600 hover:dark:bg-indigo-700 hover:bg-primary-700">更新體重</button>
          </div>
        </VForm>
      </div>
    </div>

    <!-- 刪除體重確認對話框 -->
    <div v-show="weightModals.deleteWeightConfirm.toggle" class="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-70" @mousedown="cancelDeleteWeight">
      <div class="bg-white p-6 rounded-xl shadow-2xl text-center w-[90%] max-w-md dark:bg-darkPrimary-700" @mousedown.stop>
        <div class="mb-4">
          <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900/20">
            <i class="text-xl text-red-600 fa-solid fa-exclamation-triangle dark:text-red-400"></i>
          </div>
          <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-darkPrimary-50">確認刪除體重記錄</h3>
          <p class="mb-2 text-sm text-gray-600 dark:text-darkPrimary-300">
            您確定要刪除以下體重記錄嗎？
          </p>
          <div class="text-base font-medium text-primary-600 dark:text-indigo-400">
            {{ weightModals.deleteWeightConfirm.weightDate }}
          </div>
          <div class="text-lg font-bold text-primary-600 dark:text-indigo-400">
            {{ weightModals.deleteWeightConfirm.weightValue }} 公斤
          </div>
          <p class="mt-2 text-xs text-red-600 dark:text-red-400">
            ⚠️ 此操作無法復原
          </p>
        </div>
        
        <div class="flex justify-center gap-4">
          <button 
            type="button"
            class="px-4 py-2 text-gray-700 transition-all bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-darkPrimary-600 dark:text-darkPrimary-50 dark:hover:bg-darkPrimary-500"
            @click="cancelDeleteWeight"
          >
            取消
          </button>
          <button 
            v-if="weightModals.deleteWeightConfirm.loading"
            class="inline-flex items-center justify-center px-4 py-2 text-white bg-red-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled
          >
            <div class="w-4 h-4 border-2 border-white border-solid rounded-full animate-spin border-t-transparent"></div>
            <span class="ml-2">刪除中...</span>
          </button>
          <button 
            v-else
            type="button"
            class="px-4 py-2 text-white transition-all bg-red-600 rounded-lg hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            @click="confirmDeleteWeight"
          >
            確認刪除
          </button>
        </div>
      </div>
    </div>

    <!-- 血糖曲線視窗 -->
    <div v-show="bloodSugarCurveModals.bloodSugarCurve.toggle" class="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-70" @mousedown="bloodSugarCurveModals.bloodSugarCurve.toggle = false">
      <div class="bg-white p-4 lg:p-8 rounded-xl shadow-2xl text-center w-[90%] max-w-2xl dark:bg-darkPrimary-700" @mousedown.stop>
        <VForm @submit="createBloodSugarCurve">
          <h2 class="mb-2 text-xl font-semibold text-gray-800 dark:text-darkPrimary-50">建立血糖曲線</h2>
          <VField v-model="bloodSugarCurveModals.bloodSugarCurve.date" name="bloodSugarCurveDate" rules="required" type="date" class="w-full h-10 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" />
          <ErrorMessage name="bloodSugarCurveDate" class="mt-1 text-sm text-red-500 dark:text-rose-400" />
          <div v-for="(field, index) in bloodSugarCurveModals.bloodSugarCurve.fields" :key="index" class="my-4 space-y-4">
            <div class="grid grid-cols-[2fr_2fr_0.5fr] gap-4 items-center border p-2 rounded-md shadow-md">
              <input v-model="field.time" type="time" name="sugarCurveTime" class="w-full h-10 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
              <input v-model="field.value" type="number" name="sugarCurveBloodSugar" placeholder="血糖" class="w-full h-10 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
              <button type="button" class="px-2 py-1 font-semibold text-white bg-red-500 rounded-md hover:bg-red-600" @click="bloodSugarCurveModals.bloodSugarCurve.fields.splice(index, 1)">X</button>
            </div>
          </div>
          <div class="flex justify-center my-3">
            <button type="button" class="flex items-center px-6 py-2 font-medium text-white transition-all bg-green-500 rounded-lg shadow-md hover:bg-green-400 dark:bg-lime-600" @click="bloodSugarCurveModals.bloodSugarCurve.fields.push({ time: '', value: '' })"><i class="mr-2 fa-solid fa-plus fa-fw"></i> 新增欄位</button>
          </div>
          <div class="flex justify-between space-x-4">
            <button type="button" class="w-1/2 px-6 py-2 text-gray-700 transition-all bg-gray-300 rounded-lg shadow-md lg:w-1/3 dark:bg-darkPrimary-50 hover:dark:bg-darkPrimary-400 hover:bg-gray-400" @click="bloodSugarCurveModals.bloodSugarCurve.toggle = false">取消</button>
            <button v-if="bloodSugarCurveModals.bloodSugarCurve.loading" class="inline-flex items-center justify-center w-1/2 px-6 py-2 rounded-md lg:w-1/3 bg-primary-600 dark:bg-indigo-600 text-darkPrimary-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-auto" disabled="">
              <div class="w-4 h-4 border-2 border-white border-solid rounded-full animate-spin border-t-transparent"></div>
              <span class="ml-2">新增中... </span>
            </button>
            <button v-else type="submit" class="w-1/2 px-4 py-2 text-white rounded-md lg:w-1/3 bg-primary-600 dark:bg-indigo-600 hover:dark:bg-indigo-700 hover:bg-primary-700 outline-1 focus:outline-2 focus:outline-primary-500 focus:outline-offset-2 focus:outline-none">新增血糖曲線</button>
          </div>
        </VForm>
      </div>
    </div>
    
    <!-- 編輯血糖曲線視窗 -->
    <div v-show="bloodSugarCurveModals.editBloodSugarCurve.toggle" class="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-70" @mousedown="bloodSugarCurveModals.editBloodSugarCurve.toggle = false">
      <div class="bg-white p-4 lg:p-8 rounded-xl shadow-2xl text-center w-[90%] max-w-2xl dark:bg-darkPrimary-700" @mousedown.stop>
        <VForm @submit="updateBloodSugarCurve">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-darkPrimary-50">編輯血糖曲線</h2>
            <button 
              type="button" 
              class="h-10 max-h-[60px] w-10 max-w-[60px] select-none rounded-lg transition-all dark:hover:bg-darkPrimary-600 hover:bg-gray-900/10" 
              @click="openDeleteConfirmModal({ _id: bloodSugarCurveModals.editBloodSugarCurve.id, date: bloodSugarCurveModals.editBloodSugarCurve.date })"
            >
              <i class="text-xl text-red-600 dark:text-rose-400 fa-solid fa-trash fa-fw"></i>
            </button>
          </div>
          
          <VField v-model="bloodSugarCurveModals.editBloodSugarCurve.date" name="editBloodSugarCurveDate" rules="required" type="date" class="w-full h-10 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" />
          <ErrorMessage name="editBloodSugarCurveDate" class="mt-1 text-sm text-red-500 dark:text-rose-400" />
          
          <div v-for="(field, index) in bloodSugarCurveModals.editBloodSugarCurve.fields" :key="index" class="my-4 space-y-4">
            <div class="grid grid-cols-[2fr_2fr_0.5fr] gap-4 items-center border p-2 rounded-md shadow-md">
              <input v-model="field.time" type="time" name="editSugarCurveTime" class="w-full h-10 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
              <input v-model="field.value" type="number" name="editSugarCurveBloodSugar" placeholder="血糖" class="w-full h-10 pl-3 border rounded-md shadow-sm dark:text-darkPrimary-50 dark:bg-darkPrimary-600 text-primary-900 outline-1 outline-primary-100 border-primary-100 dark:border-darkPrimary-500 focus:outline-2 focus:outline-primary-400 dark:placeholder-darkPrimary-400 dark:focus:outline-darkPrimary-400 focus:outline-none" autocomplete="off" />
              <button type="button" class="px-2 py-1 font-semibold text-white bg-red-500 rounded-md hover:bg-red-600" @click="bloodSugarCurveModals.editBloodSugarCurve.fields.splice(index, 1)">X</button>
            </div>
          </div>
          
          <div class="flex justify-center my-3">
            <button type="button" class="flex items-center px-6 py-2 font-medium text-white transition-all bg-green-500 rounded-lg shadow-md hover:bg-green-400 dark:bg-lime-600" @click="bloodSugarCurveModals.editBloodSugarCurve.fields.push({ time: '', value: '' })"><i class="mr-2 fa-solid fa-plus fa-fw"></i> 新增欄位</button>
          </div>
          
          <div class="flex justify-between space-x-4">
            <button type="button" class="w-1/2 px-6 py-2 text-gray-700 transition-all bg-gray-300 rounded-lg shadow-md lg:w-1/3 dark:bg-darkPrimary-50 hover:dark:bg-darkPrimary-400 hover:bg-gray-400" @click="bloodSugarCurveModals.editBloodSugarCurve.toggle = false">取消</button>
            <button v-if="bloodSugarCurveModals.editBloodSugarCurve.loading" class="inline-flex items-center justify-center w-1/2 px-6 py-2 rounded-md lg:w-1/3 bg-primary-600 dark:bg-indigo-600 text-darkPrimary-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-auto" disabled="">
              <div class="w-4 h-4 border-2 border-white border-solid rounded-full animate-spin border-t-transparent"></div>
              <span class="ml-2">更新中... </span>
            </button>
            <button v-else type="submit" class="w-1/2 px-4 py-2 text-white rounded-md lg:w-1/3 bg-primary-600 dark:bg-indigo-600 hover:dark:bg-indigo-700 hover:bg-primary-700 outline-1 focus:outline-2 focus:outline-primary-500 focus:outline-offset-2 focus:outline-none">更新血糖曲線</button>
          </div>
        </VForm>
      </div>
    </div>

    <!-- 載入遮罩 -->
    <VueLoading :active="isLoading" :height="loadingConfig.height" :width="loadingConfig.width" :loader="loadingConfig.loader" :color="loadingConfig.getColor()" :backgroundColor="loadingConfig.backgroundColor()" />
  </div>
</template>

<script setup>
import { reactive, onMounted, provide, computed, inject } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import authStore from '@/stores/auth'
import { Field as VField, Form as VForm, ErrorMessage } from 'vee-validate'

// 元件導入
import AnimalAvatar from './components/AnimalAvatar.vue'
import AnimalBasicInfo from './components/AnimalBasicInfo.vue'
import WeightChart from './components/WeightChart.vue'
import BloodSugarAverageChart from './components/BloodSugarAverageChart.vue'
import BloodSugarCurvePanel from './components/BloodSugarCurvePanel.vue'
import BloodSugarCurveChart from './components/BloodSugarCurveChart.vue'
import BloodSugarCalendar from './components/BloodSugarCalendar.vue'
import ConfirmDeleteModal from './components/ConfirmDeleteModal.vue'

// Composables 導入
import { useAnimalData } from './composables/useAnimalData'
import { useWeightManagement } from './composables/useWeightManagement'
import { useBloodSugarCurve } from './composables/useBloodSugarCurve'

const route = useRoute()
const animalId = route.params.id

// 注入依賴
const loadingConfig = inject('loadingConfig')

// 使用 Pinia store
const store = authStore()
const user = computed(() => store.user)
const isDark = computed(() => store.isDark)

// 提供深色模式狀態給子元件
provide('isDark', isDark)

// 使用 composables
const { animal, isLoading: animalLoading, getAnimalInfo } = useAnimalData(animalId)
const { modals: weightModals, isLoading: weightLoading, createWeight, updateWeight, openEditWeightModal, confirmDeleteWeight, cancelDeleteWeight, openDeleteWeightConfirmModal } = useWeightManagement(animalId, getAnimalInfo)

const { bloodSugarCurveChart, modals: bloodSugarCurveModals, isLoading: curveLoading, getAllBloodSugarCurveData, selectYear, selectMonth, clearYearMonthSelection, openEditBloodSugarCurveModal, openDeleteConfirmModal, confirmDeleteBloodSugarCurve, createBloodSugarCurve: originalCreateBloodSugarCurve, updateBloodSugarCurve: originalUpdateBloodSugarCurve, cancelDeleteBloodSugarCurve } = useBloodSugarCurve(animalId)

// 整合載入狀態
const isLoading = computed(() => animalLoading.value || weightLoading.value || curveLoading.value)

// 平均血糖圖表資料
const averageChart = reactive({
  title: '週平均血糖',
  rawData: {
    averages: [{ morningAverage: 0, eveningAverage: 0, combinedAverage: 0 }],
    morningCounts: { count_1_249: 0, count_250_399: 0, count_400_plus: 0 },
    eveningCounts: { count_1_249: 0, count_250_399: 0, count_400_plus: 0 },
  },
})

// 獲取平均血糖資料
const getAverage = async (startDate, endDate) => {
  try {


    const { data } = await axios.get(`${import.meta.env.VITE_API_PATH}/bloodSugar/average`, {
      params: {
        animalId,
        startDate,
        endDate,
      },
    })

    return data
  } catch (error) {
    console.error('❌ 獲取平均血糖失敗:', error)
    return {
      averages: [{ morningAverage: 0, eveningAverage: 0, combinedAverage: 0 }],
      morningCounts: { count_1_249: 0, count_250_399: 0, count_400_plus: 0 },
      eveningCounts: { count_1_249: 0, count_250_399: 0, count_400_plus: 0 },
    }
  }
}

// 更新平均血糖圖表（可依自訂日期範圍）
const updateAverageChart = async (customRange) => {
  try {

    // 若自訂日期範圍存在，直接使用；否則預設取當週
    let startDate, endDate, title
    if (customRange?.startDate && customRange?.endDate) {
      startDate = customRange.startDate
      endDate = customRange.endDate
      title = customRange.type === 'month'
        ? `${startDate.split('-')[1]}月平均血糖`
        : `${startDate.split('-')[1]}-${startDate.split('-')[2]} ~ ${endDate.split('-')[1]}-${endDate.split('-')[2]} 平均血糖`
    } else {
      const today = new Date()
      const startOfWeek = new Date(today)
      const day = startOfWeek.getDay()
      const diff = startOfWeek.getDate() - (day === 0 ? 6 : day - 1)
      startOfWeek.setDate(diff)
      startOfWeek.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)

      startDate = startOfWeek.toISOString().split('T')[0]
      endDate = endOfWeek.toISOString().split('T')[0]
      title = `${startDate.split('-')[1]}-${startDate.split('-')[2]} ~ ${endDate.split('-')[1]}-${endDate.split('-')[2]} 平均血糖`
    }

    averageChart.title = title

    const data = await getAverage(startDate, endDate)
    averageChart.rawData = data

  } catch (error) {
    console.error('❌ 更新平均血糖圖表失敗:', error)
  }
}

// 包裝血糖曲線函數以更新平均圖表
const createBloodSugarCurve = async () => {
  await originalCreateBloodSugarCurve()
  await updateAverageChart(currentRange.value)
}

const updateBloodSugarCurve = async () => {
  await originalUpdateBloodSugarCurve()
  await updateAverageChart(currentRange.value)
}

// 包裝刪除血糖曲線函數以更新平均圖表
const confirmDeleteBloodSugarCurveWithUpdate = async () => {
  await confirmDeleteBloodSugarCurve()
  await updateAverageChart(currentRange.value)
}

// 統一的刪除確認模態框
const deleteConfirmModal = reactive({
  visible: false,
  title: '',
  message: '',
  itemInfo: null,
  loading: false,
  type: '', // 'weight' | 'curve'
  data: null,
})


// 確認刪除
const confirmDelete = async () => {
  if (deleteConfirmModal.type === 'curve') {
    deleteConfirmModal.loading = true
    try {
      await confirmDeleteBloodSugarCurveWithUpdate()
      deleteConfirmModal.visible = false
    } finally {
      deleteConfirmModal.loading = false
    }
  }
}

// 取消刪除
const cancelDelete = () => {
  deleteConfirmModal.visible = false
  deleteConfirmModal.type = ''
  deleteConfirmModal.data = null
  deleteConfirmModal.itemInfo = null
}

// 目前日期範圍（週或月）
const currentRange = reactive({ type: 'week', startDate: '', endDate: '' })

const onDateRangeChanged = ({ type, startDate, endDate }) => {
  currentRange.type = type
  currentRange.startDate = startDate
  currentRange.endDate = endDate
  updateAverageChart(currentRange)
}

const onBloodSugarChanged = async () => {
  await updateAverageChart(currentRange)
}

// 初始化
onMounted(async () => {
  await getAnimalInfo()
  await getAllBloodSugarCurveData()
  await updateAverageChart() // 初次載入沿用週視圖
})
</script>
