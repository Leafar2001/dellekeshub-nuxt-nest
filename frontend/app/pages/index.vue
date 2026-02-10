<script setup>
const mediaItems = ref([])

for (let index = 0; index < 25; index++) {
    mediaItems.value.push({
        title: "CSGO",
        thumbnailPath: "/videos/csgo.jpg",
        route: "/media/69483b03dacf41264841a876",
        duration: 40,
        watchPercentage: 55
    });
}
</script>

<template>
    <div class="animate-in fade-in slide-in-from-bottom-[5%] duration-500">
        <Searchbar class="md:hidden w-full mb-2" />
        <HeroTrailer />
        <MediaCardContainer title="Continue watching" :amount="mediaItems.length" class="mt-5">
            <template v-for="item in mediaItems">
                <MediaCard :title="item.title" :thumbnail-path="item.thumbnailPath" :route="item.route"
                    :duration="item.duration" :watch-percentage="item.watchPercentage" />
            </template>
        </MediaCardContainer>
        <MediaCardContainer title="What others are watching" :amount="mediaItems.length" class="mt-5">
            <template v-for="item in mediaItems">
                <MediaCard :title="item.title" :thumbnail-path="item.thumbnailPath" :route="item.route"
                    :duration="item.duration" :watch-percentage="item.watchPercentage" />
            </template>
        </MediaCardContainer>
        <MediaCardContainer title="Best rated" :amount="mediaItems.length" class="mt-5">
            <template v-for="item in mediaItems">
                <MediaCard :title="item.title" :thumbnail-path="item.thumbnailPath" :route="item.route"
                    :duration="item.duration" :watch-percentage="item.watchPercentage" />
            </template>
        </MediaCardContainer>
    </div>
</template>

<style scoped></style>
