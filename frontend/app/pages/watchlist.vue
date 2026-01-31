<script setup>

</script>

<template>
    <div class="animate-in fade-in slide-in-from-bottom-[5%] duration-500">
        <div class="flex items-center justify-center gap-4 mb-5">
            <h1 class="text-4xl font-bold">Watchlist</h1>
        </div>
        <div class="flex flex-wrap justify-center gap-2 md:gap-3 w-full">
            <template v-for="card in 25">
                <MediaCard title="Over the garden wall" :route="`/media/54752a4f-edbe-4e7d-97d4-3eb1bdde683b`"
                    :watch-percentage="0" />
            </template>
        </div>
        <!-- <div class="flex justify-center">
            <div
                class="grid grid-cols-[repeat(auto-fit,_minmax(160px,_1fr))] justify-items-start gap-2 md:gap-3 w-full">
                <template v-for="card in 25">
                    <MediaCard title="Over the garden wall" icon="ri:movie-2-line"
                        :route="`/media/54752a4f-edbe-4e7d-97d4-3eb1bdde683b`" :watch-percentage="0"
                        :disable-aspect-ratio="true" class="w-full h-full" />
                </template>
            </div>
        </div> -->
    </div>
</template>

<style scoped></style>
