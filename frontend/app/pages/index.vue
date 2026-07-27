<script setup>
const config = useRuntimeConfig()
const opts = { credentials: 'include' }

const [continueWatching, trending, topRated] = await Promise.all([
    $fetch(`${config.public.BACKEND_API_URL}/api/collections/continue-watching`, opts).catch(() => []),
    $fetch(`${config.public.BACKEND_API_URL}/api/collections/trending`, opts).catch(() => []),
    $fetch(`${config.public.BACKEND_API_URL}/api/collections/top-rated`, opts).catch(() => [])
])

const heroItems = trending
    .map(item => item.collection)
    .filter(collection => collection?.trailer && pickLocale(collection.trailer))
    .slice(0, 5)
    .map(collection => ({
        id: collection.id,
        title: pickLocale(collection.title),
        trailer: pickLocale(collection.trailer)
    }))
</script>

<template>
    <div class="animate-in fade-in slide-in-from-bottom-[5%] duration-500">
        <Searchbar class="md:hidden w-full mb-2" />
        <HeroTrailer :items="heroItems" />
        <MediaCardContainer v-if="continueWatching.length > 0" title="Continue watching"
            :amount="continueWatching.length" class="mt-5">
            <template v-for="item in continueWatching" :key="item.collection.id">
                <MediaCard :title="pickLocale(item.collection.title)"
                    :thumbnail-path="collectionThumbnail(item.collection)"
                    :route="item.episodeId ? `/media/${item.collection.id}/watch/${item.episodeId}` : `/media/${item.collection.id}`"
                    :watch-percentage="item.percentage" />
            </template>
        </MediaCardContainer>
        <MediaCardContainer v-if="trending.length > 0" title="What others are watching" :amount="trending.length"
            class="mt-5">
            <template v-for="item in trending" :key="item.collection.id">
                <MediaCard :title="pickLocale(item.collection.title)"
                    :thumbnail-path="collectionThumbnail(item.collection)"
                    :route="`/media/${item.collection.id}`" />
            </template>
        </MediaCardContainer>
        <MediaCardContainer v-if="topRated.length > 0" title="Best rated" :amount="topRated.length" class="mt-5">
            <template v-for="item in topRated" :key="item.collection.id">
                <MediaCard :title="pickLocale(item.collection.title)"
                    :thumbnail-path="collectionThumbnail(item.collection)"
                    :route="`/media/${item.collection.id}`" />
            </template>
        </MediaCardContainer>
        <div v-if="continueWatching.length === 0 && trending.length === 0 && topRated.length === 0"
            class="flex flex-col items-center justify-center text-muted-foreground mt-20">
            <Icon name="ri:movie-2-line" size="48px" />
            <p class="mt-2">Nothing here yet. Start watching something!</p>
        </div>
    </div>
</template>

<style scoped></style>
