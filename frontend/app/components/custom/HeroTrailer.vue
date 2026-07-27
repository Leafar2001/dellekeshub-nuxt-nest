<script setup>
const props = defineProps({
    items: {
        type: Array,
        default: () => []
    }
})
const activeMediaIndex = ref(0)
const nextMediaInSeconds = ref(10)
const growBarInterval = ref(undefined)

const activeItem = computed(() => props.items[activeMediaIndex.value])

function rotateToNext() {
    if (props.items.length === 0) return
    if (activeMediaIndex.value + 1 >= props.items.length) {
        activeMediaIndex.value = 0
    } else {
        activeMediaIndex.value++
    }
}

function startInterval() {
    clearInterval(growBarInterval.value)
    growBarInterval.value = setInterval(rotateToNext, 1000 * nextMediaInSeconds.value)
}

onMounted(() => {
    startInterval()
})
onUnmounted(() => {
    clearInterval(growBarInterval.value)
})

function navigateToActiveMediaItem() {
    if (!activeItem.value) return
    navigateTo(`/media/${activeItem.value.id}`)
}
function setActiveMediaIndex(index) {
    activeMediaIndex.value = index
    startInterval()
}
</script>
<template>
    <div v-if="items.length > 0 && activeItem" @click="navigateToActiveMediaItem"
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
                        {{ activeItem.title.toUpperCase() }}
                    </span>
                    <span class="sm:text-lg md:text-3xl px-2">|</span>
                    <span class="sm:text-lg md:text-3xl font-light">WATCH NOW</span>
                </div>
            </div>
            <div class="flex justify-center items-center z-10">
                <template v-for="(item, i) in items" :key="item.id">
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
        <iframe :key="activeItem.trailer" :src="`https://www.youtube.com/embed/${activeItem.trailer}?autoplay=1&mute=1`"
            name="Trailer" allow="autoplay; encrypted-media;"></iframe>
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
