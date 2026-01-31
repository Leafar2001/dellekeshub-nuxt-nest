<script setup>
import { useDebounceFn } from '@vueuse/core'
const icon = useTemplateRef('icon')
const searchQuery = ref('')
const mediaItems = ref([])
const isSearching = ref(false)
const showSearchItems = ref(false)
const searchbar = ref()

// API-call to search media
async function fetchSearchResults(query) {
    if (!query) return
    try {
        isSearching.value = true
        const response = await $fetch('/api/media/search', {
            method: 'GET',
            params: { title: query }
        })
        console.log("search response", response)
        mediaItems.value = response
        isSearching.value = false
        console.log("search items", mediaItems.value)
    } catch (err) {
        console.error('Search failed:', err)
    }
}

// Debounce so we dont send to many requests
const debouncedSearch = useDebounceFn(fetchSearchResults, 200) // 200ms delay

async function handleSearchInput(e) {
    searchQuery.value = e.target.value
    showSearchItems.value = true
    await debouncedSearch(searchQuery.value)
}
function handleFocus() {
    icon.value?.$el?.classList.add('text-black', 'dark:text-white')
    if (searchQuery.value) showSearchItems.value = true
}
function handleBlur() {
    icon.value?.$el?.classList.remove('text-black', 'dark:text-white')
    showSearchItems.value = false
    searchQuery.value = ""
    searchbar.value.$el.value = ""
}
function navigateToMedia(mediaId) {
    navigateTo(`/media/${mediaId}`)
    showSearchItems.value = false
    searchQuery.value = ""
    searchbar.value.$el.value = ""
}

</script>
<template>
    <div class="relative w-full text-muted-foreground">
        <div class="relative w-full items-center text-muted-foreground hover:text-black dark:hover:text-white">
            <Input ref="searchbar" id="search" type="text" placeholder="Search..." autocomplete="one-time-code"
                class="pl-7 w-full focus-visible:text-black dark:focus-visible:text-white focus-visible:placeholder:text-black dark:focus-visible:placeholder:text-white"
                @focus="handleFocus" @blur="handleBlur" @input="handleSearchInput" />
            <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
                <Icon v-if="isSearching" name="svg-spinners:180-ring-with-bg" size="16px" />
                <Icon v-else ref="icon" name="material-symbols:search-rounded" size="16px" />
            </span>
        </div>
        <div v-if="showSearchItems"
            class="absolute top-11 p-1 w-full h-fit border rounded-md bg-white dark:bg-zinc-950 z-40">
            <template v-if="mediaItems.length > 0" v-for="media in mediaItems">
                <div class="flex gap-3 px-2 py-2 cursor-pointer rounded-sm hover:bg-zinc-100 hover:dark:bg-zinc-900 hover:text-black dark:hover:text-white"
                    @pointerdown.prevent="navigateToMedia(media._id)">
                    <img class="w-12 aspect-[2/3] object-cover rounded-sm"
                        :src="`http://localhost:3001/media/${media._id}/thumbnail`" alt="">
                    <div class="flex flex-col">
                        <span class="text-xl font-medium">{{ media.title }}</span>
                        <span class="text-sm font-light">{{ media.year }}</span>
                        <span>{{ media.thumbnailPath }}</span>
                    </div>
                </div>
            </template>
            <template v-if="mediaItems.length == 0">
                <div class="flex items-center gap-2 px-2 py-2 rounded-sm">
                    <Icon name="gridicons:cross-circle" size="16px" />
                    No records can be found...
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped></style>