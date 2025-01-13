<script>
import { RouterView } from 'vue-router'
import NavbarComponent from '@/components/NavbarComponent.vue'
import authStore from '@/stores/auth'
import { mapState } from 'pinia'

export default {
  data() {
    return {}
  },
  components: {
    NavbarComponent,
    RouterView,
  },
  computed: {
    ...mapState(authStore, ['user']),
  },
}
</script>

<template>
  <div>
    <NavbarComponent></NavbarComponent>
    <div class="p-4 mx-auto max-w-7xl lg:p-2">
      <RouterView class="mb-16"></RouterView>
    </div>
  </div>
</template>
