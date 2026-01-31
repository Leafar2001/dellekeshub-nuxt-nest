<script setup>
const mediaItems = ref([])

for (let index = 0; index < 25; index++) {
    mediaItems.value.push({
        title: "Over the garden wall",
        thumbnailId: "290d14e2-7c88-4066-98f9-e5eee7be6875",
        route: "/media/54752a4f-edbe-4e7d-97d4-3eb1bdde683b",
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
                <MediaCard :title="item.title" :thumbnail-id="item.thumbnailId"
                    :route="`/media/54752a4f-edbe-4e7d-97d4-3eb1bdde683b`" :duration="item.duration"
                    :watch-percentage="item.watchPercentage" />
            </template>
        </MediaCardContainer>
        <MediaCardContainer title="What others are watching" :amount="mediaItems.length" class="mt-5">
            <template v-for="item in mediaItems">
                <MediaCard :title="item.title" :thumbnail-id="item.thumbnailId"
                    :route="`/media/54752a4f-edbe-4e7d-97d4-3eb1bdde683b`" :duration="item.duration"
                    :watch-percentage="item.watchPercentage" />
            </template>
        </MediaCardContainer>
        <MediaCardContainer title="Best rated" :amount="mediaItems.length" class="mt-5">
            <template v-for="item in mediaItems">
                <MediaCard :title="item.title" :thumbnail-id="item.thumbnailId"
                    :route="`/media/54752a4f-edbe-4e7d-97d4-3eb1bdde683b`" :duration="item.duration"
                    :watch-percentage="item.watchPercentage" />
            </template>
        </MediaCardContainer>
    </div>
</template>

<style scoped></style>
