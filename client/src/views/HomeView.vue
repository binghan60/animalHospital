<script>
import { RouterView } from 'vue-router'
import NavbarComponent from '@/components/NavbarComponent.vue'

export default {
  data() {
    return {}
  },
  components: {
    NavbarComponent,
    RouterView, // 正確的組件名稱
  },
}
</script>

<template>
  <div>
    <NavbarComponent></NavbarComponent>
    <RouterView></RouterView>
  </div>
</template>
