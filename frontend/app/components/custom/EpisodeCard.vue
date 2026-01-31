<script setup>
const config = useRuntimeConfig()
const props = defineProps({
    title: String,
    mediaId: String,
    episodeId: String,
    duration: String,
    watchPercentage: Number,
    route: String
})
</script>
<template>
    <NuxtLink :to="props.route"
        class="relative aspect-[4/3] min-w-50 max-w-50 xl:min-w-80 xl:w-[14vw] overflow-hidden rounded-md border cursor-pointer hover:border-special transition duration-200 py-1 px-2">
        <div class="absolute w-full h-full bg-black/30 top-0 left-0 z-10"></div>
        <img class="absolute w-full h-full object-cover top-0 left-0"
            :src="`http://localhost:3001/media/${props.mediaId}/${props.episodeId}/thumbnail`">
        <span class="relative z-20 break-after-all text-white text-sm xl:text-base">{{ props.title }}</span>
        <span v-if="props.duration"
            class="flex items-center gap-0.5 absolute text-xs lg:text-sm z-20 bottom-1.5 right-1.5 text-zinc-400">
            <Icon name="mdi:clock-outline" /> {{ props.duration }}m
        </span>
        <div v-if="props.watchPercentage !== 0" class="absolute w-full h-1 bg-zinc-400 dark:bg-zinc-900 bottom-0 z-20">
        </div>
        <div v-if="props.watchPercentage !== 0" class="absolute w-full h-1 bg-special bottom-0 left-0 z-20"
            :style="`width:${props.watchPercentage}%`">
        </div>
    </NuxtLink>
</template>
<style scoped></style>