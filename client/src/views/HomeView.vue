<script setup></script>

<template>
  <v-container>
    <v-card elevation="4">
      <v-card-text class="pa-6">
        <h1 class="text-h3 text-center mb-6">README</h1>

        <h2 class="text-h4 font-weight-bold mb-4">網站說明</h2>
        <v-card color="primary" variant="tonal" class="mb-6">
          <v-card-text>
            <p class="text-h6">動物健康管理系統，專為動物醫院打造，方便記錄病患資訊與追蹤治療紀錄。內建血糖監測、圖表分析及動物資料共享功能，讓醫生與飼主更輕鬆掌握病況。</p>
          </v-card-text>
        </v-card>
        <h2 class="text-h4 font-weight-bold mb-4">🛠 使用技術</h2>
        <v-row class="mb-6">
          <v-col cols="12" lg="6">
            <v-card color="primary" variant="tonal">
              <v-card-title class="text-h5">前端</v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item>
                    <template #prepend>
                      <v-avatar>
                        <img src="/image/VueLogo.png" alt="Vue3" />
                      </v-avatar>
                    </template>
                    <v-list-item-title class="text-h6">Vue3</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <template #prepend>
                      <v-avatar>
                        <img src="/image/PiniaLogo.png" alt="Pinia" />
                      </v-avatar>
                    </template>
                    <v-list-item-title class="text-h6">Pinia</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <template #prepend>
                      <v-avatar>
                        <v-icon icon="mdi-palette" />
                      </v-avatar>
                    </template>
                    <v-list-item-title class="text-h6">Vuetify</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <template #prepend>
                      <v-avatar>
                        <img src="/image/ChartjsLogo.png" alt="Chart.js" />
                      </v-avatar>
                    </template>
                    <v-list-item-title class="text-h6">Chart.js</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <template #prepend>
                      <v-avatar>
                        <img src="/image/AxiosLogo.svg" alt="Axios" />
                      </v-avatar>
                    </template>
                    <v-list-item-title class="text-h6">Axios</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" lg="6">
            <v-card color="primary" variant="tonal">
              <v-card-title class="text-h5">後端</v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item>
                    <template #prepend>
                      <v-avatar>
                        <img src="/image/NodejsLogo.png" alt="Node.js" />
                      </v-avatar>
                    </template>
                    <v-list-item-title class="text-h6">Node.js Express</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <template #prepend>
                      <v-avatar>
                        <img src="/image/MongoDBLogo.png" alt="MongoDB" />
                      </v-avatar>
                    </template>
                    <v-list-item-title class="text-h6">MongoDB</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <template #prepend>
                      <v-avatar>
                        <img src="/image/CloudinaryLogo.png" alt="Cloudinary" />
                      </v-avatar>
                    </template>
                    <v-list-item-title class="text-h6">Cloudinary</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <h2 class="text-h4 font-weight-bold mb-4">✨ 功能介紹</h2>
        
        <!-- 通用功能 -->
        <v-card color="info" variant="tonal" class="mb-4">
          <v-card-title class="text-h5">通用功能</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="4" v-for="feature in generalFeatures" :key="feature">
                <v-chip color="info" variant="outlined" class="ma-1">{{ feature }}</v-chip>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-row class="mb-6">
          <!-- 醫院功能 -->
          <v-col cols="12" lg="6">
            <v-card color="success" variant="tonal">
              <v-card-title class="text-h5">🏥 醫院身分</v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item v-for="feature in hospitalFeatures" :key="feature">
                    <template #prepend>
                      <v-icon icon="mdi-check-circle" color="success" />
                    </template>
                    <v-list-item-title>{{ feature }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
          
          <!-- 飼主功能 -->
          <v-col cols="12" lg="6">
            <v-card color="warning" variant="tonal">
              <v-card-title class="text-h5">🐾 飼主身分</v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item v-for="feature in ownerFeatures" :key="feature">
                    <template #prepend>
                      <v-icon icon="mdi-check-circle" color="warning" />
                    </template>
                    <v-list-item-title>{{ feature }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- 行動呼籲 -->
        <div class="text-center">
          <v-btn
            color="primary"
            size="x-large"
            class="my-6"
            to="/login"
          >
            立即體驗
          </v-btn>
          
          <div class="d-flex justify-center mt-4">
            <v-btn
              icon
              size="large"
              href="https://github.com/binghan60/animalHospital"
              target="_blank"
              color="grey-darken-1"
            >
              <v-avatar size="48">
                <img src="/image/GithubLogo.png" alt="GitHub" />
              </v-avatar>
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      generalFeatures: [
        '會員註冊、登入、JWT登入',
        '忘記密碼',
        '全響應式設計(RWD)',
        '資料共享',
        '暗色模式'
      ],
      hospitalFeatures: [
        '新增、編輯病患資料',
        '記錄與管理診療紀錄',
        '醫院動物統計圖表',
        '授權飼主存取動物資料權限'
      ],
      ownerFeatures: [
        '查看寵物病歷',
        '記錄血糖與體重變化'
      ]
    }
  }
}
</script>
