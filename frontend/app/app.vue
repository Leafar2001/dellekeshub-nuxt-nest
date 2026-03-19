<script setup>
import 'vue-sonner/style.css'
import { Toaster } from '@/components/ui/sonner'

onBeforeMount(() => {
  useSpecialColor()
})
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster position="top-center" theme="dark" richColors />
  </div>
</template>

<style scoped></style>
