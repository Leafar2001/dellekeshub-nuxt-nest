<script setup>
const props = defineProps({
    title: String
})
const emit = defineEmits([
    'close'
])
</script>
<template>
    <div @click.stop="emit('close')"
        class="flex items-center justify-center fixed top-0 left-0 w-screen h-screen bg-black/50 backdrop-blur-xs z-90">
        <div @click.stop
            class="w-full mx-3 md:w-1/2 lg:w-1/3 max-h-[80vh] border overflow-y-auto overflow-x-hidden bg-white dark:bg-zinc-950 rounded-md p-5 relative animate-in fade-in slide-in-from-bottom-[5%] duration-200">
            <Icon @click.stop="emit('close')" name="material-symbols-light:close-rounded" size="16px"
                class="absolute top-2.5 right-2 min-w-4 min-h-4 cursor-pointer text-muted-foreground hover:text-black dark:hover:text-white" />
            <h2 class="text-2xl font-bold mb-6">{{ props.title }}</h2>
            <slot />
        </div>
    </div>
</template>
<style scoped></style>