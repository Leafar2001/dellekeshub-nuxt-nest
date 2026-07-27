<script setup>
definePageMeta({
    layout: 'watch'
})
const route = useRoute()
const config = useRuntimeConfig()

const isPlaying = ref(false)
const showOverlay = ref(false)
const videoElement = ref()
const overlayTimeout = ref()
const overlayElement = ref()
const countdownTimer = ref(0)
const countdownInterval = ref()

const media = ref(null)
const video = ref(null)
let lastProgressReport = 0

const episodes = computed(() => {
    if (!media.value) return []
    if (media.value.seasons?.length) {
        return [...media.value.seasons]
            .sort((a, b) => a.seasonNumber - b.seasonNumber)
            .flatMap(s => [...(s.episodes ?? [])]
                .sort((a, b) => a.episodeNumber - b.episodeNumber)
                .map(e => ({
                    videoId: e.video?.id,
                    title: pickLocale(e.video?.title),
                    seasonNumber: s.seasonNumber,
                    episodeNumber: e.episodeNumber
                })))
            .filter(e => e.videoId)
    }
    return (media.value.videos ?? [])
        .sort((a, b) => a.episodeNumber - b.episodeNumber)
        .map(v => ({
            videoId: v.video?.id,
            title: pickLocale(v.video?.title),
            seasonNumber: null,
            episodeNumber: v.episodeNumber
        }))
        .filter(e => e.videoId)
})

const currentIndex = computed(() => episodes.value.findIndex(e => e.videoId === route.params.videoId))
const previousVideo = computed(() => currentIndex.value > 0 ? episodes.value[currentIndex.value - 1] : undefined)
const nextVideo = computed(() => currentIndex.value >= 0 && currentIndex.value < episodes.value.length - 1 ? episodes.value[currentIndex.value + 1] : undefined)
const currentInfo = computed(() => currentIndex.value >= 0 ? episodes.value[currentIndex.value] : undefined)

media.value = await $fetch(`${config.public.BACKEND_API_URL}/api/collections/${route.params.mediaId}`, {
    credentials: 'include'
}).catch(() => null)

video.value = await $fetch(`${config.public.BACKEND_API_URL}/api/videos/${route.params.videoId}`, {
    credentials: 'include'
}).catch(() => null)

async function reportProgress(currentTime, duration) {
    if (!duration) return
    try {
        await $fetch(`${config.public.BACKEND_API_URL}/api/progress/${route.params.mediaId}/${route.params.videoId}`, {
            method: 'POST',
            credentials: 'include',
            body: { currentTime, duration, mediaType: 'collection' }
        })
    } catch (error) {
        console.error('Failed to report progress:', error)
    }
}

function onTimeUpdate() {
    const el = videoElement.value
    if (!el || !el.duration) return
    const now = Date.now()
    if (now - lastProgressReport > 5000) {
        lastProgressReport = now
        reportProgress(el.currentTime, el.duration)
    }
}

async function onLoadedMetadata() {
    const el = videoElement.value
    if (!el) return
    el.volume = 0.5

    try {
        const progress = await $fetch(`${config.public.BACKEND_API_URL}/api/progress/${route.params.mediaId}`, {
            credentials: 'include'
        })
        if (progress && progress.episodeId === route.params.videoId && !progress.finished && progress.currentTime > 0) {
            el.currentTime = progress.currentTime
        }
    } catch (error) {
        console.error('Failed to load progress:', error)
    }
}

function onEnded() {
    reportProgress(videoElement.value?.currentTime ?? 0, videoElement.value?.duration ?? 0)
    startCountdown()
}

function startCountdown() {
    countdownTimer.value = 10
    countdownInterval.value = setInterval(() => {
        countdownTimer.value--
        if (countdownTimer.value <= 0) {
            const next = nextVideo.value
            cancelCountdown()
            if (next) {
                playVideo(next.videoId)
            } else {
                navigateTo(`/media/${route.params.mediaId}`)
            }
        }
    }, 1000)
}

function cancelCountdown() {
    clearInterval(countdownInterval.value)
    countdownTimer.value = 0
}

function playVideo(videoId) {
    cancelCountdown()
    navigateTo(`/media/${route.params.mediaId}/watch/${videoId}`)
}

watch(() => route.params.videoId, async (newId, oldId) => {
    if (newId && newId !== oldId) {
        lastProgressReport = 0
        video.value = await $fetch(`${config.public.BACKEND_API_URL}/api/videos/${newId}`, {
            credentials: 'include'
        }).catch(() => null)
    }
})

onUnmounted(() => cancelCountdown())

function showOverlayOnHover() {
    clearTimeout(overlayTimeout.value)
    showOverlay.value = true
    overlayElement.value?.classList.remove('hidden')
    overlayTimeout.value = setTimeout(() => {
        showOverlay.value = false
        overlayElement.value?.classList.add('hidden')
    }, 3000)
}
</script>

<template>
    <div class="bg-black">
        <!-- Video overlay -->
        <div @mouseover="showOverlayOnHover" @touchend="showOverlayOnHover" ref="overlayElement"
            class="absolute hidden w-screen h-screen top-0 left-0 bg-linear-to-t from-black from-10% to-[#00000000] to-50%">
            <!-- Overlay header -->
            <div v-if="showOverlay || !isPlaying" class="flex justify-between p-10 w-full absolute">
                <div v-if="currentInfo" class="flex flex-col">
                    <h1 class="pointer-events-none m-0 font-bold text-xl">{{ currentInfo.title }}</h1>
                    <h2 v-if="currentInfo.seasonNumber" class="m-0 font-light">
                        Season {{ currentInfo.seasonNumber }} · Episode {{ currentInfo.episodeNumber }}
                    </h2>
                    <h2 v-else class="m-0 font-light">{{ pickLocale(media?.title) }}</h2>
                </div>
                <div class="flex items-center">
                    <Button @click="navigateTo(`/media/${route.params.mediaId}`)" variant="outline"
                        class="p-3 h-fit z-10">
                        <Icon name="radix-icons:cross-1" class="m-0 p-0 text-zinc-700 dark:text-zinc-300" size="14px" />
                    </Button>
                </div>
            </div>
            <!-- Previous and Next buttons -->
            <div v-if="(showOverlay || !isPlaying)" class="flex absolute w-full px-10 bottom-1/9">
                <Button v-if="previousVideo" @click="playVideo(previousVideo.videoId)" variant="outline"
                    class="flex-col h-fit z-10 !items-start">
                    <p class="flex items-center gap-2 md:text-lg">
                        <Icon name="mdi:arrow-right-bold" class="rotate-180" />
                        Previous
                    </p>
                    <p class="hidden md:block font-light text-xs">{{ previousVideo.title }}</p>
                </Button>
                <div style="flex-grow: 1;"></div>
                <Button v-if="nextVideo" variant="outline" @click="playVideo(nextVideo.videoId)"
                    class="flex-col h-fit z-10 !items-start">
                    <p class="flex items-center gap-2 md:text-lg">
                        Next
                        <Icon name="mdi:arrow-right-bold" />
                    </p>
                    <p class="hidden md:block font-light text-xs">{{ nextVideo.title }}</p>
                </Button>
            </div>

            <!-- Countdown to next video -->
            <div v-if="countdownTimer > 0" class="flex justify-center items-center w-full h-full">
                <div
                    class="flex flex-col justify-center items-center bg-black/60 fixed p-3 w-full h-full">
                    <template v-if="nextVideo">
                        <h3>Next video:</h3>
                        <h3 class="font-light">{{ nextVideo.title }}</h3>
                    </template>
                    <template v-else>
                        <h3>Returning to:</h3>
                        <h3 class="font-light">{{ pickLocale(media?.title) }}</h3>
                    </template>
                    <h1>{{ countdownTimer }}</h1>
                    <Button variant="outline" class="mt-3" @click="cancelCountdown">Cancel</Button>
                </div>
            </div>
        </div>
        <video :key="route.params.videoId" @play="isPlaying = true" @pause="isPlaying = false" @ended="onEnded"
            @timeupdate="onTimeUpdate" @loadedmetadata="onLoadedMetadata" @mouseover="showOverlayOnHover"
            @mousemove="showOverlayOnHover" @touchend="showOverlayOnHover"
            :src="`${config.public.BACKEND_API_URL}/api/watch/videos/${route.params.videoId}`" autoplay controls
            playsinline poster="/dellekesHub-poster.png" ref="videoElement" crossorigin="use-credentials"
            class="!h-screen !w-screen">
            <track v-for="subtitle in video?.subtitles ?? []" :key="subtitle.id"
                :src="`${config.public.BACKEND_API_URL}/api/static/videos/${route.params.videoId}/subtitles/${subtitle.id}`"
                :label="subtitle.name" :srclang="subtitle.language" kind="subtitles" />
        </video>
    </div>
</template>

<style scoped></style>
