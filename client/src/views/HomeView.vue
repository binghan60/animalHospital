<script>
import { RouterView } from 'vue-router'
import NavbarComponent from '@/components/NavbarComponent.vue'

export default {
  data() {
    return {}
  },
  components: {
    NavbarComponent,
    RouterView,
  },
}
</script>

<template>
  <div>
    <NavbarComponent></NavbarComponent>
    <RouterView></RouterView>
  </div>
</template>
