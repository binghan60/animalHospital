<script>
import axios from 'axios'
import authStore from '@/stores/auth'
import { mapState } from 'pinia'
export default {
  data() {
    return {
      animalList: [],
    }
  },
  methods: {
    async getAnimalList() {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_PATH}/animal/share/${this.user._id}`)
        console.log('A')
        this.animalList = data
      } catch (error) {
        this.$toast.error(error.response.data.message)
      }
    },
  },
  computed: {
    ...mapState(authStore, ['user']),
  },
  async mounted() {
    await this.getAnimalList()
  },
}
</script>
<template>
  <div>
    <h2 class="mb-2 text-4xl text-center">動物列表</h2>
    <div class="grid gap-6 cursor-pointer lg:grid-cols-3">
      <div v-for="animal in animalList" :key="animal._id" class="bg-white w-full h-[300px] rounded-xl shadow-lg overflow-hidden" @click="this.$router.push(`/user/animal/${animal._id}`)">
        <div class="flex items-center justify-center bg-gray-100 h-[85%]">
          <img class="object-cover w-full h-full border-2 rounded-t-xl border-primary-200" :src="animal.avatar ? animal.avatar : '/image/sampleAvatar.png'" />
        </div>
        <div class="flex items-center justify-between px-4 py-3 bg-primary-200 h-[15%]">
          <span class="text-sm font-medium text-gray-600">動物姓名：{{ animal.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
