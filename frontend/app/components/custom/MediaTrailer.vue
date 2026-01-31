<script setup>
import YouTubePlayer from 'youtube-player'
const auth = await useAuth().getUserRole()
const props = defineProps({
    title: String,
    year: Number,
    actors: Array,
    trailer: String,
    genres: Array,
    continueWatchingId: String
})
const route = useRoute()
const trailerContainer = ref()
const iframe = ref()
const ytPlayer = ref()
const toggleMuteIcon = ref(false)
const trailerVolume = ref([1])
const trailerIsGrown = ref(false)

onMounted(async () => {
    if (!iframe.value) return
    ytPlayer.value = await YouTubePlayer(iframe.value)
    // Optional: ready event
    ytPlayer.value?.on('click', () => {
        ytPlayer.value?.unMute()
    })
})
onUnmounted(() => {
    ytPlayer.value?.destroy()
})

function parseTrailer(trailer, controls, mute) {
    if (trailer === undefined) return ""

    // const trailerLongId = trailer.split("watch?v=")[1]
    // const trailerId = trailerLongId.split("&t=")[0]
    // const time = trailerLongId.includes("&t=") ? trailerLongId.split("&t=")[1].replace("s", "") : ""
    const time = undefined
    const trailerUrl = `https://youtube.com/embed/${trailer}?playlist=${trailer}&autoplay=1&showinfo=0&controls=${controls ? 1 : 0}&mute=${mute ? 1 : 0}&disablekb&fs=0&loop=1&rel=0&start=${time ?? 0}`
    return trailerUrl
}

function playFromWatchProgress(episodeId) {
    if (!episodeId) return
    navigateTo(`/media/${route.params.mediaId}/watch/${episodeId}`)
}

async function growTrailer() {
    if (trailerIsGrown.value) {
        trailerIsGrown.value = false
        trailerContainer.value.classList.remove("!max-h-[86vh]")
        await ytPlayer.value.mute()
    }
    else {
        trailerIsGrown.value = true
        trailerContainer.value.classList.add("!max-h-[86vh]")
        console.log(trailerContainer)
        await ytPlayer.value.setVolume(1)
        await ytPlayer.value.unMute()
    }
}
function adjustVolume(forceMute) {
    if (forceMute) {
        toggleMuteIcon.value = true
        trailerVolume.value = [0]
        return ytPlayer.value.setVolume(0)
    }
    else {
        toggleMuteIcon.value = false
        if (trailerVolume.value[0] === 0) trailerVolume.value = [1]
        ytPlayer.value.setVolume(trailerVolume.value)
        console.log(trailerVolume.value)
    }
}
</script>
<template>
    <div>
        <div class="overflow-x-hidden">
            <div class="aspect-video transition-all duration-500 ease-in-out max-h-[50vh] border rounded-md relative overflow-hidden w-full pointer-events-none"
                ref="trailerContainer">
                <div class="absolute w-full h-full top-0 left-0 bg-white/0 bg-linear-to-t from-black/100 to-black/0">
                </div>
                <!-- Dark overlay over trailer -->
                <div class="absolute w-full p-7 bottom-0 wrap-anywhere z-10 flex flex-col justify-end">
                    <div class="flex items-baseline text-zinc-200">
                        <h1 class="uppercase font-bold md:text-2xl lg:text-3xl">{{ props.title }}</h1>
                    </div>
                    <div class="mb-5 text-zinc-200 text-xs lg:text-base">
                        <p>
                            <span>{{ props.year }}</span> ·
                            <span v-for="(genre, index) in props.genres">{{ genre }}<span
                                    v-if="props.genres.length !== index + 1">, </span>
                            </span>
                        </p>
                    </div>
                    <div class="flex items-center gap-2 pointer-events-auto">
                        <Button variant="special" @click.stop="playFromWatchProgress(props.continueWatchingId)">
                            <Icon name="mdi:play" size="20px" />
                            <span>Play</span>
                        </Button>
                        <Button variant="outline" @click.stop="growTrailer">
                            <Icon name="mdi:movie-open-play" size="16px" />
                            <span v-if="!trailerIsGrown">Watch trailer</span>
                            <span v-if="trailerIsGrown">Close trailer</span>
                        </Button>
                        <div style="flex-grow: 1;"></div>
                        <div v-if="trailerIsGrown" class="flex items-center gap-2 w-50 pointer-events-auto">
                            <Transition>
                                <Icon v-if="toggleMuteIcon" @click.stop="adjustVolume(false)"
                                    name="material-symbols:volume-mute-rounded" size="32px" class="cursor-pointer" />
                                <Icon v-else @click.stop="adjustVolume(true)"
                                    name="material-symbols:volume-down-rounded" size="32px" class="cursor-pointer" />
                            </Transition>
                            <Slider @click.stop="() => { }" @update:model-value="adjustVolume(false)"
                                v-model="trailerVolume" :step="1" :min="0" :max="100" />
                        </div>
                        <Button v-if="auth.role === 'admin'" variant="outline" @click.stop="console.log('edit btn')">
                            <Icon name="material-symbols-light:ink-pen" size="18px" />
                            <span>Edit</span>
                        </Button>
                    </div>
                </div>
                <div class="overlay"></div>
                <iframe ref="iframe"
                    :src="`https://www.youtube.com/embed/${props.trailer}?autoplay=1&mute=1&loop=1&playlist=${props.trailer}&enablejsapi=1`"
                    allow="autoplay; encrypted-media;"></iframe>
            </div>
        </div>
    </div>
</template>
<style scoped>
iframe {
    pointer-events: none;
    position: absolute;
    height: 300%;
    width: 100%;
    top: -100%;
    border: 0;
    z-index: -1
}

.v-enter-active,
.v-leave-active {
    transition: opacity 0s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}
</style>