<script setup>

</script>
<template>
  <div class="flex flex-col items-center justify-center w-full h-[90vh]">
    <div class="flex items-center">
      <span class="text-8xl font-bold animate-in fade-in zoom-in duration-500">4</span>
      <span class="text-8xl font-bold animate-in fade-in zoom-in duration-500">0</span>
      <span class="text-8xl font-bold animate-in fade-in zoom-in duration-500">4</span>
    </div>
    <p class="mb-5 animate-in fade-in zoom-in duration-500">Oops! This page could not be found.</p>

    <NuxtLink to="/" class="animate-in fade-in zoom-in duration-500">
      <Button variant="outline">
        Go back
        <Icon name="tabler:arrow-back-up" size="14px" />
      </Button>
    </NuxtLink>

  </div>
</template>

<style scoped></style>
