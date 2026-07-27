<script setup>
const config = useRuntimeConfig()
const genres = ref([])
const activeGenre = ref('')
const collections = ref([])
const nextKey = ref(undefined)
const loading = ref(false)

async function loadCollections(reset = true) {
    loading.value = true
    try {
        const params = { limit: 24 }
        if (activeGenre.value) params.genre = activeGenre.value
        if (!reset && nextKey.value) params.lastKey = nextKey.value

        const response = await $fetch(`${config.public.BACKEND_API_URL}/api/collections/all`, {
            credentials: 'include',
            params
        })
        collections.value = reset ? response.collections : [...collections.value, ...response.collections]
        nextKey.value = response.nextKey
    } catch (error) {
        console.error('Failed to load collections:', error)
    } finally {
        loading.value = false
    }
}

async function selectGenre(genre) {
    activeGenre.value = genre === activeGenre.value ? '' : genre
    await loadCollections(true)
}

onMounted(async () => {
    loadCollections(true)
    try {
        genres.value = await $fetch(`${config.public.BACKEND_API_URL}/api/collections/genres`, {
            credentials: 'include'
        })
    } catch (error) {
        console.error('Failed to load genres:', error)
    }
})
</script>

<template>
    <div class="animate-in fade-in slide-in-from-bottom-[5%] duration-500">
        <div class="flex items-center justify-center gap-4 mb-5">
            <h1 class="text-4xl font-bold">Browse</h1>
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <Button variant="outline" class="select-none">
                        {{ activeGenre || 'Filter' }}
                        <Icon name="mdi:filter" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="max-h-[50vh]">
                    <DropdownMenuItem class="cursor-pointer" @select="selectGenre('')">
                        All genres
                    </DropdownMenuItem>
                    <DropdownMenuItem v-for="genre in genres" :key="genre" class="cursor-pointer"
                        @select="selectGenre(genre)">
                        <Icon v-if="activeGenre === genre" name="material-symbols:check-rounded" size="16px" />
                        {{ genre }}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div v-if="collections.length > 0" class="flex flex-wrap justify-center gap-2 md:gap-3 w-full">
            <template v-for="collection in collections" :key="collection.id">
                <MediaCard :title="pickLocale(collection.title)" :thumbnail-path="collectionThumbnail(collection)"
                    :route="`/media/${collection.id}`" :watch-percentage="0" />
            </template>
        </div>
        <div v-else-if="!loading" class="flex flex-col items-center justify-center text-muted-foreground mt-20">
            <Icon name="ri:movie-2-line" size="48px" />
            <p class="mt-2">No collections found.</p>
        </div>
        <div v-if="nextKey" class="flex justify-center mt-5">
            <Button variant="outline" :disabled="loading" @click="loadCollections(false)">
                <Icon v-if="loading" name="svg-spinners:180-ring-with-bg" size="16px" />
                Load more
            </Button>
        </div>
    </div>
</template>

<style scoped></style>
