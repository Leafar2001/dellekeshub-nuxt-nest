<script setup>
const filter = ref('Filter')
const filterList = ref([])

function addFilterToList(filter) {
    if (filterList.value.includes(filter)) {
        const index = filterList.value.indexOf(filter)
        filterList.value.splice(index, 1)
    }
    else {
        filterList.value.push(filter)
    }
    console.log(filterList.value)
}
</script>

<template>
    <div class="animate-in fade-in slide-in-from-bottom-[5%] duration-500">
        <div class="flex items-center justify-center gap-4 mb-5">
            <h1 class="text-4xl font-bold">Browse</h1>
            <DropdownMenu v-model:model-value="filter">
                <DropdownMenuTrigger as-child>
                    <Button variant="outline" class="select-none">
                        Filter
                        <Icon name="mdi:filter" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="max-h-[50vh]">
                    <DropdownMenuCheckboxItem v-for="genre in ['Action', 'Adventure', 'Comedy', 'Thriller', 'Romance']"
                        class="cursor-pointer" :value="genre" :model-value="filterList.includes(genre)"
                        :prevent-close="true" @select.prevent="addFilterToList(genre)">
                        {{ genre }}
                    </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>
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
