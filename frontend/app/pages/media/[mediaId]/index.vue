<script setup>
const route = useRoute()
const config = useRuntimeConfig()
const episodeContainer = ref()

const media = await $fetch(`${config.public.NUXT_API_URL}/api/media/${route.params.mediaId}`)

function scrollHorizontal(e) {
    e.preventDefault();
    episodeContainer.value.scrollLeft += e.deltaY;
}

const season = computed(() => {
    if (!media.videos || media.videos.length === 0) return { seasonNumber: 1, episodes: [] }
    return media.videos[0]
})

onMounted(() => {
    console.log(media)

})
</script>

<template>
    <!-- <h1>{{ media }}</h1> -->
    <div v-if="media?.videos && media.videos.length > 0"
        class="animate-in fade-in slide-in-from-bottom-[5%] duration-500">
        <MediaTrailer :title="media.title" :trailer="media.trailerUrl" :year="media.year" :genres="media.genres"
            :continue-watching-id="season.episodes[0]?._id" class="mb-8" />

        <Select v-model:model-value="season">
            <SelectTrigger class="w-fit mb-3 cursor-pointer">
                <SelectValue placeholder="Select a season" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectItem v-for="season in media.videos" :value="season" @click="console.log(season)"
                        class="cursor-pointer">
                        Season {{ season.seasonNumber }}
                    </SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
        <div class="flex gap-3 overflow-y-hidden overflow-x-scroll mb-5 pb-3 episode-container"
            @wheel="scrollHorizontal" ref="episodeContainer">
            <template v-for="(episode, index) in season.episodes">
                <EpisodeCard :title="episode.title" :media-id="media._id" :episode-id="episode._id"
                    :duration="(episode.durationSeconds / 60).toFixed(0)" :watch-percentage="20"
                    :route="`/media/${route.params.mediaId}/watch/${episode._id}`" />
            </template>
        </div>
    </div>
</template>

<style scoped>
.episode-container::-webkit-scrollbar-track {
    background: transparent;
}
</style>