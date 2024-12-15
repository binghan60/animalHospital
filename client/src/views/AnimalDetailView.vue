<template>
  <div>
    <div class="grid md:grid-cols-3 gap-4 lg:h-[350px]">
      <div class="h-full overflow-hidden bg-white rounded-lg shadow-lg">
        <!-- <img class="object-cover w-full h-full" src="image/avatar.png" alt="" /> -->
      </div>
      <div class="rounded-lg overflow-hidden shadow-md bg-white p-2 lg:p-4 border border-gray-200 h-full min-h-[300px]">
        <div id="profileCard" class="w-full h-full">
          <h5 class="mb-3 text-lg font-semibold text-blue-500">基本資料</h5>
          <ul class="grid grid-cols-4 list-none gap-x-4 gap-y-3">
            <li class="text-sm font-medium text-gray-600">姓名：</li>
            <li class="col-span-3 text-sm text-gray-800">牛奶</li>
            <li class="text-sm font-medium text-gray-600">種類：</li>
            <li class="col-span-3 text-sm text-gray-800"><i class="fa-solid fa-cat"></i></li>
            <li class="text-sm font-medium text-gray-600">生日：</li>
            <li class="col-span-3 text-sm text-gray-800">2012/8/8 (12歲 4個月)</li>
            <li class="text-sm font-medium text-gray-600">性別：</li>
            <li class="col-span-3 text-sm text-gray-800"><i class="text-blue-600 fa-solid fa-mars"></i></li>
            <li class="text-sm font-medium text-gray-600">血型：</li>
            <li class="col-span-3 text-sm text-gray-800">A 型</li>
            <li class="text-sm font-medium text-gray-600">體重：</li>
            <li class="col-span-3 text-sm text-gray-800">5.5 公斤</li>
            <li class="text-sm font-medium text-gray-600">品種：</li>
            <li class="col-span-3 text-sm text-gray-800">米克斯</li>
            <li class="text-sm font-medium text-gray-600">結紮：</li>
            <li class="col-span-3 text-sm text-gray-800"><i class="text-green-500 fa-solid fa-check"></i></li>
          </ul>
        </div>
      </div>

      <div class="grid-cols-1 rounded-lg overflow-hidden shadow-lg bg-white p-2 lg:p-4 h-full min-h-[300px]">
        <div id="weightChart" class="w-full h-full"><canvas width="573" height="397" style="display: block; box-sizing: border-box; height: 318px; width: 458px"></canvas></div>
      </div>
    </div>
    <!-- 日曆 -->
    <div class="rounded-lg overflow-hidden shadow-lg bg-white mt-6 p-2 lg:p-4 lg:min-h-[1200px] min-h-[800px]">
      <h1 class="py-3 text-2xl font-bold text-center text-blue-600 select-none">
        <button id="prevMonth" class="text-blue-500 hover:text-blue-700">
          <i class="text-3xl fa-solid fa-caret-left"></i>
        </button>
        <span id="calendarTitle" class="px-4">2024 年 12 月 血糖表</span>
        <button id="nextMonth" class="text-blue-500 hover:text-blue-700">
          <i class="text-3xl fa-solid fa-caret-right"></i>
        </button>
      </h1>
      <!-- 日曆格子 -->
      <div class="hidden grid-cols-7 gap-1 text-2xl font-semibold text-center text-blue-700 lg:grid">
        <div>一</div>
        <div>二</div>
        <div>三</div>
        <div>四</div>
        <div>五</div>
        <div>六</div>
        <div>日</div>
      </div>
      <div id="calendarGrid" class="grid grid-cols-2 gap-1 mt-2 lg:grid-cols-7">
        <div class="p-2 m-1 rounded-md"></div>
        <div class="p-2 m-1 rounded-md"></div>
        <div class="p-2 m-1 rounded-md"></div>
        <div class="p-2 m-1 rounded-md"></div>
        <div class="p-2 m-1 rounded-md"></div>
        <div class="p-2 m-1 rounded-md"></div>
        <div id="calendar2024-12-01" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">1</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,1)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-green-500">121</span> mg/dl</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,1)"><i class="fa-solid fa-syringe"></i> : 0小格</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,1)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-green-500">125</span> mg/dl</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,1)"><i class="fa-solid fa-syringe"></i> : 1.5小格</div>
          </div>
        </div>
        <div id="calendar2024-12-02" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">2</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,2)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-amber-500">350</span> mg/dl</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,2)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,2)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-green-500">120</span> mg/dl</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,2)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
        </div>
        <div id="calendar2024-12-03" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">3</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,3)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-green-500">12</span> mg/dl</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,3)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,3)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-green-500">123</span> mg/dl</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,3)"><i class="fa-solid fa-syringe"></i> : 1.5小格</div>
          </div>
        </div>
        <div id="calendar2024-12-04" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">4</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,4)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-green-500">233</span> mg/dl</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,4)"><i class="fa-solid fa-syringe"></i> : 1.5小格</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,4)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-green-500">123</span> mg/dl</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,4)"><i class="fa-solid fa-syringe"></i> : 0小格</div>
          </div>
        </div>
        <div id="calendar2024-12-05" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">5</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,5)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-green-500">123</span> mg/dl</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,5)"><i class="fa-solid fa-syringe"></i> : 0小格</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,5)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-green-500">56</span> mg/dl</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,5)"><i class="fa-solid fa-syringe"></i> : 0小格</div>
          </div>
        </div>
        <div id="calendar2024-12-06" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">6</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,6)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-green-500">134</span> mg/dl</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,6)"><i class="fa-solid fa-syringe"></i> : 0小格</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,6)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-green-500">232</span> mg/dl</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,6)"><i class="fa-solid fa-syringe"></i> : 2小格</div>
          </div>
        </div>
        <div id="calendar2024-12-07" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">7</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,7)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-red-500">1800</span> mg/dl</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,7)"><i class="fa-solid fa-syringe"></i> : 1.5小格</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,7)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-green-500">2</span> mg/dl</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,7)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
        </div>
        <div id="calendar2024-12-08" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">8</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,8)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-green-500">123</span> mg/dl</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,8)"><i class="fa-solid fa-syringe"></i> : 0小格</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,8)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,8)"><i class="fa-solid fa-syringe"></i> : 0小格</div>
          </div>
        </div>
        <div id="calendar2024-12-09" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">9</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,9)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,9)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,9)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-amber-500">280</span> mg/dl</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,9)"><i class="fa-solid fa-syringe"></i> : 1小格</div>
          </div>
        </div>
        <div id="calendar2024-12-10" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">10</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,10)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-red-500">405</span> mg/dl</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,10)"><i class="fa-solid fa-syringe"></i> : 1小格</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,10)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-red-600">401</span> mg/dl</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,10)"><i class="fa-solid fa-syringe"></i> : 0小格</div>
          </div>
        </div>
        <div id="calendar2024-12-11" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">11</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,11)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-red-500">450</span> mg/dl</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,11)"><i class="fa-solid fa-syringe"></i> : 1小格</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,11)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-red-600">888</span> mg/dl</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,11)"><i class="fa-solid fa-syringe"></i> : 1.5小格</div>
          </div>
        </div>
        <div id="calendar2024-12-12" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">12</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,12)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-green-500">12</span> mg/dl</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,12)"><i class="fa-solid fa-syringe"></i> : 0小格</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,12)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-amber-500">390</span> mg/dl</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,12)"><i class="fa-solid fa-syringe"></i> : 1小格</div>
          </div>
        </div>
        <div id="calendar2024-12-13" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">13</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,13)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-green-500">21</span> mg/dl</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,13)"><i class="fa-solid fa-syringe"></i> : 0.5小格</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,13)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,13)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
        </div>
        <div id="calendar2024-12-14" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">14</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,14)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,14)"><i class="fa-solid fa-syringe"></i> : 0小格</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,14)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,14)"><i class="fa-solid fa-syringe"></i> : 0小格</div>
          </div>
        </div>
        <div id="calendar2024-12-15" class="p-2 m-1 text-blue-900 rounded-md cursor-pointer bg-sky-300 hover:bg-blue-300">
          <div class="text-xl font-bold text-center">15</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,15)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,15)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,15)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,15)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
        </div>
        <div id="calendar2024-12-16" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">16</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,16)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,16)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,16)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,16)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
        </div>
        <div id="calendar2024-12-17" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">17</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,17)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,17)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,17)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,17)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
        </div>
        <div id="calendar2024-12-18" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">18</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,18)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,18)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,18)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,18)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
        </div>
        <div id="calendar2024-12-19" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">19</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,19)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-green-500">233</span> mg/dl</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,19)"><i class="fa-solid fa-syringe"></i> : 2小格</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,19)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,19)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
        </div>
        <div id="calendar2024-12-20" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">20</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,20)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-amber-500">299</span> mg/dl</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,20)"><i class="fa-solid fa-syringe"></i> : 1小格</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,20)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,20)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
        </div>
        <div id="calendar2024-12-21" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">21</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,21)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,21)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,21)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,21)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
        </div>
        <div id="calendar2024-12-22" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">22</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,22)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,22)"><i class="fa-solid fa-syringe"></i> : 0小格</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,22)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,22)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
        </div>
        <div id="calendar2024-12-23" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">23</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,23)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,23)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,23)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,23)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
        </div>
        <div id="calendar2024-12-24" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">24</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,24)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,24)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,24)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,24)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
        </div>
        <div id="calendar2024-12-25" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">25</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,25)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,25)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,25)"><i class="fa-solid fa-droplet w-[14px]"></i> : <span class="text-green-500">12</span> mg/dl</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,25)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
        </div>
        <div id="calendar2024-12-26" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">26</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,26)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,26)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,26)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,26)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
        </div>
        <div id="calendar2024-12-27" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">27</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,27)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,27)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,27)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,27)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
        </div>
        <div id="calendar2024-12-28" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">28</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,28)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,28)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,28)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,28)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
        </div>
        <div id="calendar2024-12-29" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">29</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,29)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,29)"><i class="fa-solid fa-syringe"></i> : 0小格</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,29)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,29)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
        </div>
        <div id="calendar2024-12-30" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">30</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,30)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,30)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,30)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,30)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
        </div>
        <div id="calendar2024-12-31" class="p-2 m-1 text-blue-900 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300">
          <div class="text-xl font-bold text-center">31</div>
          <!-- 早上 -->
          <div class="p-2 mb-2 bg-orange-100 rounded-md hover:bg-orange-200">
            <div class="font-semibold text-center text-orange-500"><i class="fa-regular fa-sun"></i></div>
            <div data-type="morningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,31)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="morningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,31)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
          <!-- 晚上 -->
          <div class="p-2 bg-purple-100 rounded-md hover:bg-purple-200">
            <div class="font-semibold text-center text-purple-500"><i class="fa-regular fa-moon"></i></div>
            <div data-type="eveningBloodSugar" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,31)"><i class="fa-solid fa-droplet w-[14px]"></i> : --</div>
            <div data-type="eveningInsulin" class="w-full p-1 mt-1 text-sm bg-white border border-gray-300 rounded select-none editable" onclick="cellClick(event,2024,12,31)"><i class="fa-solid fa-syringe"></i> : --</div>
          </div>
        </div>
        <div class="p-2 m-1 rounded-md"></div>
        <div class="p-2 m-1 rounded-md"></div>
        <div class="p-2 m-1 rounded-md"></div>
        <div class="p-2 m-1 rounded-md"></div>
        <div class="p-2 m-1 rounded-md"></div>
      </div>
    </div>
    <div id="monthChart">
      <div class="lazyLoading rounded-lg overflow-hidden shadow-lg bg-white mt-6 p-4 h-[350px] w-full"></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      animalId: this.$route.params.id, // 獲取路由中的 id 參數
    }
  },
  watch: {
    $route(to) {
      this.animalId = to.params.id // 當路由變化時更新 id
    },
  },
  mounted() {
    console.log(this.animalId)
  },
}
</script>
