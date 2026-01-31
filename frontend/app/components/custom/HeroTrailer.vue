<script setup>
const router = useRouter()
const activeMediaIndex = ref(0)
const nextMediaInSeconds = ref(10)
const growBarInterval = ref(10)
const media = ref([
    { id: "54752a4f-edbe-4e7d-97d4-3eb1bdde683b", title: "Over the garden wall", trailer: "https://www.youtube.com/embed/36mAsVSH_-s?autoplay=1&mute=1" },
    { id: "54752a4f-edbe-4e7d-97d4-3eb1bdde683b", title: "Over the garden wall2", trailer: "https://www.youtube.com/embed/36mAsVSH_-s?autoplay=1&mute=1" },
    { id: "54752a4f-edbe-4e7d-97d4-3eb1bdde683b", title: "Over the garden wall3", trailer: "https://www.youtube.com/embed/36mAsVSH_-s?autoplay=1&mute=1" },
    { id: "54752a4f-edbe-4e7d-97d4-3eb1bdde683b", title: "Over the garden wall4", trailer: "https://www.youtube.com/embed/36mAsVSH_-s?autoplay=1&mute=1" },
    { id: "54752a4f-edbe-4e7d-97d4-3eb1bdde683b", title: "Over the garden wall5", trailer: "https://www.youtube.com/embed/36mAsVSH_-s?autoplay=1&mute=1" }
])

onMounted(() => {
    growBarInterval.value = setInterval(() => {
        if (activeMediaIndex.value + 1 >= media.value.length) {
            activeMediaIndex.value = 0
        } else {
            activeMediaIndex.value++
            console.log(activeMediaIndex.value)
        }
    }, 1000 * nextMediaInSeconds.value)
})
onUnmounted(() => {
    clearInterval(growBarInterval.value)
})

function navigateToActiveMediaItem() {
    navigateTo(`/media/${media.value[activeMediaIndex.value].id}`)
}
function setActiveMediaIndex(index) {
    activeMediaIndex.value = index
    clearInterval(growBarInterval.value)
    growBarInterval.value = setInterval(() => {
        if (activeMediaIndex.value + 1 >= media.value.length) {
            activeMediaIndex.value = 0
        } else {
            activeMediaIndex.value++
            console.log(activeMediaIndex.value)
        }
    }, 1000 * nextMediaInSeconds.value)
}
</script>
<template>
    <div @click="navigateToActiveMediaItem"
        class="aspect-video w-full transition duration-500 ease-in-out border rounded-md lg:h-[50vh] relative overflow-hidden cursor-pointer hover:border-special/50">
        <!-- Dark overlay over trailer -->
        <div class="absolute w-full h-full top-0 left-0 dark:bg-black/60"></div>
        <div class="w-full absolute bottom-1 px-3 md:px-10 z-10 text-zinc-200">
            <div class="flex flex-col">
                <div>
                    <span class="sm:text-lg md:text-2xl font-bold">NOW AVAILABLE</span>
                </div>
                <div>
                    <span class="sm:text-lg md:text-3xl font-bold">
                        {{ media[activeMediaIndex].title.toUpperCase() }}
                    </span>
                    <span class="sm:text-lg md:text-3xl px-2">|</span>
                    <span class="sm:text-lg md:text-3xl font-light">WATCH NOW</span>
                </div>
            </div>
            <div class="flex justify-center items-center z-10">
                <template v-for="(item, i) in media">
                    <div @click.stop="setActiveMediaIndex(i)" class="w-10 mx-1 my-1.5 py-1.5 relative">
                        <div class="h-1 absolute rounded-2xl bg-special cursor-pointer hover:bg-special z-10 pointer-events-none"
                            :class="[activeMediaIndex == i ? 'grow-trailer-bar' : activeMediaIndex > i ? 'w-full' : 'w-0']">
                        </div>
                        <div class="h-1 relative rounded-2xl bg-zinc-500 w-full cursor-pointer hover:bg-special">
                        </div>
                    </div>
                </template>
            </div>
        </div>
        <iframe ref="iframe" src="https://www.youtube.com/embed/36mAsVSH_-s?autoplay=1&mute=1" name="Trailer"
            autoplay="true" allow="autoplay; encrypted-media;"></iframe>
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

.grow-trailer-bar {
    animation: grow-width 10s linear;
}

@keyframes grow-width {
    0% {
        width: 0%;
    }

    100% {
        width: 100%
    }
}
</style>