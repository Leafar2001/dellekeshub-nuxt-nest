<script setup>
import { toast } from 'vue-sonner'

const config = useRuntimeConfig()
const collections = ref([])
const loading = ref(true)

async function loadWatchlist() {
    loading.value = true
    try {
        const response = await $fetch(`${config.public.BACKEND_API_URL}/api/watchlist`, {
            credentials: 'include'
        })
        collections.value = response.collections
    } catch (error) {
        console.error('Failed to load watchlist:', error)
    } finally {
        loading.value = false
    }
}

async function removeFromWatchlist(collectionId) {
    try {
        await $fetch(`${config.public.BACKEND_API_URL}/api/watchlist/${collectionId}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        collections.value = collections.value.filter(c => c.id !== collectionId)
        toast.success("Removed from watchlist")
    } catch (error) {
        toast.error("Failed to remove from watchlist")
    }
}

onMounted(loadWatchlist)
</script>

<template>
    <div class="animate-in fade-in slide-in-from-bottom-[5%] duration-500">
        <div class="flex items-center justify-center gap-4 mb-5">
            <h1 class="text-4xl font-bold">Watchlist</h1>
        </div>
        <div v-if="collections.length > 0" class="flex flex-wrap justify-center gap-2 md:gap-3 w-full">
            <div v-for="collection in collections" :key="collection.id" class="relative group">
                <MediaCard :title="pickLocale(collection.title)" :thumbnail-path="collectionThumbnail(collection)"
                    :route="`/media/${collection.id}`" :watch-percentage="0" />
                <Button variant="outline" size="icon"
                    class="absolute top-2 right-2 z-30 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80"
                    @click.prevent="removeFromWatchlist(collection.id)">
                    <Icon name="radix-icons:cross-1" size="14px" />
                </Button>
            </div>
        </div>
        <div v-else-if="!loading" class="flex flex-col items-center justify-center text-muted-foreground mt-20">
            <Icon name="ic:outline-remove-red-eye" size="48px" />
            <p class="mt-2">Your watchlist is empty. Add collections from their detail page.</p>
        </div>
    </div>
</template>

<style scoped></style>
