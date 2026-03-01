<script setup>
const profileContainer = useTemplateRef('profileContainer')
const scrollLeftPosition = ref(0)
const isScrolledToRight = ref(false)

const props = defineProps({
    title: String,
})

function scrollRight() {
    profileContainer.value?.scrollBy({
        left: window.innerWidth, // 100vw
        behavior: 'smooth'
    })
}
function scrollLeft() {
    profileContainer.value?.scrollBy({
        left: -window.innerWidth,
        behavior: 'smooth'
    })
}
function updateScrollLeft() {
    scrollLeftPosition.value = profileContainer.value.scrollLeft
    isScrolledToRight.value = profileContainer.value.scrollLeft + profileContainer.value.clientWidth >= profileContainer.value.scrollWidth - 1 // -1 voorkomt afrondings problemen bij browsers
}

onMounted(() => {
    profileContainer.value.addEventListener('scroll', updateScrollLeft)
    updateScrollLeft(profileContainer.value.scrollLeft) // initialize
})
onBeforeUnmount(() => {
    profileContainer.value.removeEventListener('scroll', updateScrollLeft)
})
</script>
<template>
    <div class="relative">
        <div class="flex items-center gap-2 text-zinc-900 dark:text-zinc-200">
            <h1 class="text-lg lg:text-2xl font-bold mb-2 ">{{ props.title }}</h1>
            <span class="text-zinc-700 dark:text-zinc-400">{{ props.amount }}</span>
        </div>
        <Button v-if="scrollLeftPosition > 0" @click="scrollLeft" variant="outline"
            class="absolute top-45/100 -left-4 z-20 p-4 h-fit bg-background/100 dark:bg-background/100 hover:bg-background/100 dark:hover:bg-background/100 shadow-xl">
            <Icon name="material-symbols:chevron-left-rounded" size="18px" />
        </Button>
        <Button v-if="!isScrolledToRight" @click="scrollRight" variant="outline"
            class="absolute top-45/100 -right-4 z-20 p-4 h-fit bg-background/100 dark:bg-background/100 hover:bg-background/100 dark:hover:bg-background/100 shadow-xl">
            <Icon name="material-symbols:chevron-right-rounded" size="18px" />
        </Button>
        <div ref="profileContainer" class="flex gap-2 overflow-y-hidden overflow-x-scroll lg:overflow-x-hidden pb-2">
            <slot />
        </div>
    </div>
</template>
<style scoped></style>