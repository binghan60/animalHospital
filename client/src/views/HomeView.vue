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
    <div class="p-4 mx-auto max-w-7xl lg:p-2">
      <RouterView class="mb-32"></RouterView>
    </div>
  </div>
</template>
