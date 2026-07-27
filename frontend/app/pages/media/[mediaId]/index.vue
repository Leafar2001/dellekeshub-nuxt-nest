<script setup>
import { toast } from 'vue-sonner'

const route = useRoute()
const config = useRuntimeConfig()
const episodeContainer = ref()

const media = await $fetch(`${config.public.BACKEND_API_URL}/api/collections/${route.params.mediaId}`, {
    credentials: 'include'
})

const progress = await $fetch(`${config.public.BACKEND_API_URL}/api/progress/${route.params.mediaId}`, {
    credentials: 'include'
}).catch(() => null)

const selectedSeasonNumber = ref(media?.seasons?.[0]?.seasonNumber ?? 1)

const season = computed(() => {
    if (!media?.seasons?.length) return { seasonNumber: 1, episodes: [] }
    return media.seasons.find(s => s.seasonNumber === selectedSeasonNumber.value) ?? media.seasons[0]
})

const isMovie = computed(() => !media?.seasons?.length)
const movieVideo = computed(() => media?.videos?.[0]?.video ?? null)

const continueWatchingId = computed(() => {
    if (progress?.episodeId && !progress?.finished) return progress.episodeId
    if (isMovie.value) return movieVideo.value?.id
    return season.value?.episodes?.[0]?.video?.id
})

const episodeProgress = computed(() => {
    if (!progress || progress.finished || !progress.episodeId || !progress.duration) return {}
    return { [progress.episodeId]: Math.min(100, Math.round((progress.currentTime / progress.duration) * 100)) }
})

const inWatchlist = ref(media?.inWatchlist ?? false)
const isFavorite = ref(media?.isFavorite ?? false)

async function toggleWatchlist() {
    const method = inWatchlist.value ? 'DELETE' : 'POST'
    try {
        await $fetch(`${config.public.BACKEND_API_URL}/api/watchlist/${route.params.mediaId}`, {
            method,
            credentials: 'include'
        })
        inWatchlist.value = !inWatchlist.value
        toast.success(inWatchlist.value ? "Added to watchlist" : "Removed from watchlist")
    } catch (error) {
        toast.error("Failed to update watchlist")
    }
}

async function toggleFavorite() {
    const method = isFavorite.value ? 'DELETE' : 'POST'
    try {
        await $fetch(`${config.public.BACKEND_API_URL}/api/favorites/${route.params.mediaId}`, {
            method,
            credentials: 'include'
        })
        isFavorite.value = !isFavorite.value
        toast.success(isFavorite.value ? "Added to favorites" : "Removed from favorites")
    } catch (error) {
        toast.error("Failed to update favorites")
    }
}

function scrollHorizontal(e) {
    e.preventDefault();
    episodeContainer.value.scrollLeft += e.deltaY;
}
</script>

<template>
    <div v-if="media" class="animate-in fade-in slide-in-from-bottom-[5%] duration-500">
        <div class="relative">
            <MediaTrailer :title="pickLocale(media.title)" :trailer="pickLocale(media.trailer)"
                :year="Number(formatDate(media.createdAt).split('-')[0])" :genres="media.genres ?? []"
                :continue-watching-id="continueWatchingId" class="mb-8" />
            <div class="absolute top-2 right-2 flex gap-2 z-20">
                <Button variant="outline" size="icon" @click="toggleWatchlist"
                    :class="inWatchlist ? 'border-special text-special' : ''">
                    <Icon :name="inWatchlist ? 'ic:baseline-remove-red-eye' : 'ic:outline-remove-red-eye'"
                        size="18px" />
                </Button>
                <Button variant="outline" size="icon" @click="toggleFavorite"
                    :class="isFavorite ? 'border-special text-special' : ''">
                    <Icon :name="isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" size="18px" />
                </Button>
            </div>
        </div>

        <p v-if="pickLocale(media.description)" class="text-muted-foreground mb-6 max-w-4xl">
            {{ pickLocale(media.description) }}
        </p>

        <!-- Series layout -->
        <template v-if="!isMovie">
            <Select v-model="selectedSeasonNumber">
                <SelectTrigger class="w-fit mb-3 cursor-pointer">
                    <SelectValue placeholder="Select a season" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem v-for="s in media.seasons" :key="s.id" :value="s.seasonNumber"
                            class="cursor-pointer">
                            Season {{ s.seasonNumber }}
                        </SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
            <div class="flex gap-3 overflow-y-hidden overflow-x-scroll mb-5 pb-3 episode-container"
                @wheel="scrollHorizontal" ref="episodeContainer">
                <template v-for="episode in season.episodes" :key="episode.id">
                    <EpisodeCard :title="pickLocale(episode.video?.title)" :media-id="media.id"
                        :episode-id="episode.id" :image-id="videoThumbnail(episode.video)"
                        :duration="episode.video?.duration ? (episode.video.duration / 60).toFixed(0) : undefined"
                        :watch-percentage="episodeProgress[episode.video?.id] ?? 0"
                        :route="`/media/${route.params.mediaId}/watch/${episode.video?.id}`" />
                </template>
            </div>
        </template>

        <ReviewsSection :media-id="media.id" />
    </div>
    <div v-else class="flex flex-col items-center justify-center text-muted-foreground mt-20">
        <Icon name="ri:movie-2-line" size="48px" />
        <p class="mt-2">This collection could not be found.</p>
    </div>
</template>

<style scoped>
.episode-container::-webkit-scrollbar-track {
    background: transparent;
}
</style>
