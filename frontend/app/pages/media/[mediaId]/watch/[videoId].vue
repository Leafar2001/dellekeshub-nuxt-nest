<script setup>
definePageMeta({
    layout: 'watch'
})
const route = useRoute()
const config = useRuntimeConfig()

const streamBaseSrc = ref('http://localhost:3001')
const isPlaying = ref(false)
const showOverlay = ref(false)
const videoElement = ref()
const overlayTimeout = ref()
const previousVideo = ref(1)
const nextVideo = ref(1)
const overlayElement = ref()
const countdownTimer = ref(0)

const media = await $fetch(`${config.public.NUXT_API_URL}/api/media/${route.params.mediaId}`)

const videoInfo = computed(() => {
    if (!media.videos || media.videos.length === 0) return null
    for (const season of media.videos) {
        for (const episode of season.episodes) {
            if (episode._id === route.params.videoId) return { ...episode, season: season.seasonNumber, mediaTitle: media.title }
        }
    }
    return null
})

onMounted(() => {
    videoElement.value.volume = 0.5
})

function showOverlayOnHover() {
    clearTimeout(overlayTimeout.value)
    showOverlay.value = true
    overlayElement.value.classList.remove('hidden')
    overlayTimeout.value = setTimeout(() => {
        showOverlay.value = false
        overlayElement.value.classList.add('hidden')
    }, 3000)
}
function playNextVideo(mediaId) {

}
</script>

<template>
    <div class="bg-black">
        <!-- Video overlay -->
        <div @mouseover="showOverlayOnHover" @touchend="showOverlayOnHover" ref="overlayElement"
            class="absolute hidden w-screen h-screen top-0 left-0 bg-linear-to-t from-black from-10% to-[#00000000] to-50%">
            <!-- Overlay header -->
            <div v-if="showOverlay || !isPlaying" class="flex justify-between p-10 w-full absolute">
                <div v-if="videoInfo" class="flex flex-col">
                    <h1 class="pointer-events-none m-0 font-bold text-xl">{{ videoInfo.title }}</h1>

                    <h2 class="m-0 font-light">Season {{ videoInfo.season }}</h2>
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
                <Button v-if="previousVideo !== undefined" @click="" variant="outline"
                    class="flex-col h-fit z-10 !items-start">
                    <p class="flex items-center gap-2 md:text-lg">
                        <Icon name="mdi:arrow-right-bold" class="rotate-180" />
                        Previous
                    </p>
                    <!-- <div class="hidden md:flex flex-col !items-start">
                        <p class="font-light text-xs">{{ videoInfo?.information.title }}</p>
                        <p class="font-light text-xs">Season {{ videoInfo?.information.season }}</p>
                    </div> -->
                </Button>
                <div style="flex-grow: 1;"></div>
                <Button v-if="nextVideo !== undefined" variant="outline" @click="playNextVideo(nextVideo.id)"
                    class="flex-col h-fit z-10 !items-start">
                    <p class="flex items-center gap-2 md:text-lg">
                        Next
                        <Icon name="mdi:arrow-right-bold" />
                    </p>
                    <!-- <div class="hidden md:flex flex-col !items-start">
                        <p class="font-light text-xs">{{ videoInfo?.information.title }}</p>
                        <p class="font-light text-xs">Season {{ videoInfo?.information.season }}</p>
                    </div> -->
                </Button>
            </div>

            <!-- Countdown to next video -->
            <div v-if="countdownTimer > 0" class="flex justify-center items-center w-full h-full">
                <div v-if="nextVideo !== undefined"
                    class="flex flex-col justify-center items-center pointer-events-none bg-black/60 fixed p-3 w-full h-full">
                    <h3>Next video:</h3>
                    <h3 style="font-weight: 100;">{{ nextVideo.name }}</h3>
                    <h1>{{ countdownTimer }}</h1>
                </div>
                <div v-else
                    class="flex flex-col justify-center items-center pointer-events-none bg-black/60 fixed p-3 w-full h-full">
                    <h3>Returning to:</h3>
                    <h3 style="font-weight: 100;">{{ media.name }}</h3>
                    <h1>{{ countdownTimer }}</h1>
                </div>
            </div>
        </div>
        <video @play="isPlaying = true" @pause="isPlaying = false" @ended="console.log('play next video function here')"
            @mouseover="showOverlayOnHover" @mousemove="showOverlayOnHover" @touchend="showOverlayOnHover"
            :src="`${streamBaseSrc}/watch/${route.params.mediaId}/${route.params.videoId}`" autoplay controls
            playsinline poster="/dellekesHub-poster.png" ref="videoElement" crossorigin="use-credentials"
            class="!h-screen !w-screen">
            <!-- <track v-for="subtitle in video.subtitles"
                :src="`${config.public.NUXT_API_URL_DEV}/stream/subtitle/${subtitle.id}`" :label="subtitle.label"
                kind="subtitles" :srclang="subtitle.srcLang" :default="subtitle.defaultSub" /> -->
        </video>
    </div>
</template>

<style scoped>
.container-next-video {
    width: 100%;
    display: flex;
    flex-direction: row;
    z-index: 10;
    position: absolute;
    bottom: 70px;
    padding: 30px;
}

.container-next-video-left {
    display: flex;
    flex-direction: row;
    align-items: center;
    left: 0;
    cursor: pointer;
}

.container-next-video-left:hover,
.container-next-video-right:hover {
    color: var(--primary-color-100);
}

.container-next-video-left:hover .prev-btn,
.container-next-video-right:hover .next-btn {
    border: 1px solid var(--primary-color-100);
}

.container-next-video-right {
    display: flex;
    flex-direction: row;
    align-items: center;
    right: 0;
    cursor: pointer;
}

.container-header {
    width: 100%;
    z-index: 10;
    position: absolute;
    display: flex;
    justify-content: space-between;
    padding: 30px;
}

.prev-btn,
.next-btn {
    border: 1px solid white;
    padding: 5px 10px;
    border-radius: 8px;
    font-weight: 300;
}

.title {
    font-size: var(--font-size-2);
    text-transform: capitalize;
}

.container-return:hover {
    cursor: pointer;
}

.container-vertical {
    display: flex;
    flex-direction: column;
}

.hide-on-phone {
    display: flex;
}

.hide-on-desktop {
    display: none;
}

@media screen and (max-width: 992px) {
    .container-vertical span {
        font-size: var(--font-size-4);
        text-transform: capitalize;
    }

    .container-header h3 {
        font-size: 1.2rem;
    }

    .hide-on-phone {
        display: none;
    }

    .container-next-video {
        padding: 30px 15px;
    }

    .hide-on-desktop {
        display: flex;
    }
}
</style>