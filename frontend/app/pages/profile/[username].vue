<script setup>
const route = useRoute()
const config = useRuntimeConfig()

const user = await $fetch(`${config.public.BACKEND_API_URL}/api/users/${route.params.username}`, {
    credentials: 'include'
})

const favorites = ref([])

try {
    const response = await $fetch(`${config.public.BACKEND_API_URL}/api/users/${route.params.username}/favorites`, {
        credentials: 'include'
    })
    favorites.value = response.collections
} catch (error) {
    console.error('Failed to load favorites:', error)
}
</script>

<template>
    <div class="flex w-full justify-center">
        <div
            class="flex flex-col justify-center lg:flex-row animate-in fade-in slide-in-from-bottom-[5%] duration-500 border w-full min-h-[82vh] lg:max-h-[82vh] shadow-special/5 shadow-xl rounded-md bg-white/50 dark:bg-zinc-950/50 overflow-hidden">

            <div
                class="flex flex-col items-center justify-center h-fit lg:h-full p-6 z-10 relative border-b lg:border-b-0 lg:border-r max-h-[600px] lg:max-h-full lg:min-w-[350px] lg:max-w-[350px] overflow-hidden">
                <div
                    class="absolute top-0 left-0 h-full w-full z-0 opacity-20 bg-linear-to-br from-special via-transparent to-transparent">
                </div>
                <Avatar
                    class="h-40 w-40 z-10 max-h-100 max-w-100 lg:h-[15vw] lg:w-[15vw] lg:min-w-60 lg:min-h-60 hover:border-special/30 dark:hover:border-special/30 hover:ring-special/30 dark:hover:ring-special/30 hover:ring-[4px] dark:hover:ring-[4px] cursor-pointer">
                    <AvatarImage v-if="user?.avatarB64" :src="'data:image/jpg;base64,' + user.avatarB64"
                        alt="profile-picture" class="bg-zinc-950/80" />
                    <AvatarFallback class="text-6xl">{{ user?.username?.charAt(0).toUpperCase() }}</AvatarFallback>
                </Avatar>
                <p class="mt-3 font-bold text-2xl text-center z-10">{{ user?.username }}</p>
                <p class="mt-0 text-xs z-10">
                    Joined at:
                    {{ formatDate(user?.createdAt) }}</p>
            </div>

            <div class="flex flex-col grow gap-3 p-6 z-10 overflow-hidden md:overflow-y-auto">
                <ProfileCardContainer v-if="favorites.length > 0" title="Favorite movies" :amount="favorites.length">
                    <MediaCard v-for="collection in favorites" :key="collection.id"
                        :title="pickLocale(collection.title)" :thumbnail-path="collectionThumbnail(collection)"
                        :route="`/media/${collection.id}`" />
                </ProfileCardContainer>
                <div v-else class="flex flex-col items-center justify-center text-muted-foreground h-full">
                    <Icon name="mdi:heart-outline" size="48px" />
                    <p>No favorites yet.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
