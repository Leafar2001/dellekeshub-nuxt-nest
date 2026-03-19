<script setup>
const config = useRuntimeConfig()
const props = defineProps({
    title: String,
    thumbnailPath: String,
    route: String,
    duration: Number,
    watchPercentage: Number,
    disableAspectRatio: Boolean
})
</script>
<template>
    <NuxtLink :to="props.route">
        <div class="relative overflow-hidden rounded-md border cursor-pointer hover:border-special/50 transition duration-200 py-1 px-2 text-white"
            :class="[props.disableAspectRatio ? 'flex grow min-h-64' : 'aspect-[9/12] min-w-50 max-w-50']">
            <div class="absolute w-full h-full dark:bg-black/60 top-0 left-0 z-10"></div>
            <img v-if="props.thumbnailPath" class="absolute w-full h-full object-cover top-0 left-0"
                :src="`${config.public.NUXT_API_URL}/api/image/${props.thumbnailPath}/raw`">
            <span class="relative z-20 break-after-all text-sm lg:text-base">{{ props.title }}</span>
            <div v-if="props.watchPercentage && props.watchPercentage != 0"
                class="absolute w-full h-1 bg-zinc-500 bottom-0 z-20"></div>
            <div v-if="props.watchPercentage && props.watchPercentage != 0"
                class="absolute w-full h-1 bg-special bottom-0 left-0 z-20" :style="`width:${props.watchPercentage}%`">
            </div>
        </div>
    </NuxtLink>
</template>
<style scoped></style>