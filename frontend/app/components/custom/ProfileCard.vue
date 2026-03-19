<script setup>
const config = useRuntimeConfig()
const props = defineProps({
    title: String,
    thumbnailPath: String
})
</script>
<template>
    <div
        class="relative overflow-hidden rounded-md border hover:border-special/50 transition duration-200 py-1 px-2 text-white 'aspect-[9/12] min-w-50 max-w-50'">
        {{ title }}
    </div>
</template>
<style scoped></style>