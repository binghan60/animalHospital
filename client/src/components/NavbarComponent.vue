<script>
export default {
  data() {
    return {}
  },
}
</script>

<template>
  <nav class="p-4 bg-blue-600">
    <div class="flex items-center justify-between mx-auto max-w-7xl">
      <!-- Logo -->
      <a href="#" class="text-2xl font-bold text-white">MyLogo</a>

      <!-- Navigation Links -->
      <div class="hidden space-x-6 md:flex">
        <a href="#" class="text-white hover:text-blue-300">Home</a>
        <a href="#" class="text-white hover:text-blue-300">About</a>
        <a href="#" class="text-white hover:text-blue-300">Services</a>
        <a href="#" class="text-white hover:text-blue-300">Contact</a>
      </div>

      <!-- Mobile Menu Button -->
      <div class="md:hidden">
        <button class="text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    </div>
  </nav>
</template>
