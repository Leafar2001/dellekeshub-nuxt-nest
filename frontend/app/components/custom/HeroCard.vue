<script setup>
const props = defineProps({
    title: String,
    icon: String,
    route: String
})
</script>
<template>
    <NuxtLink :to="props.route">
        <div
            class="flex items-center justify-center text-6xl transition duration-500 ease-in-out border rounded-md h-[34vh] w-full overflow-hidden bg-background/50 hover:border-special hover:text-shadow-special">
            <Icon :name="props.icon" size="inherit" class="mr-2" />
            {{ props.title }}
        </div>
    </NuxtLink>
</template>
<style scoped></style>