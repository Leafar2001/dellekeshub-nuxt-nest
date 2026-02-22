<script setup>
const users = await $fetch("/api/user/all")
const actionButtons = [
    { name: "Upload new media", path: "/", icon: "material-symbols-light:drive-folder-upload-outline-rounded" },
    { name: "Download new media", path: "/", icon: "material-symbols-light:cloud-download-outline-rounded" },
    { name: "Search for torrents", path: "/", icon: "material-symbols-light:video-search-rounded" },
]
</script>

<template>
    <div class="animate-in fade-in slide-in-from-bottom-[5%] duration-500">
        <h1 class="text-3xl font-bold mb-1">Actions</h1>
        <div class="flex flex-col md:flex-row gap-3">
            <div v-for="button in actionButtons" :key="button.name"
                class="flex flex-col grow items-center justify-center relative border overflow-hidden p-4 md:h-60 rounded-md text-muted-foreground dark:text-zinc-300 hover:text-black dark:hover:text-white cursor-pointer dark:bg-zinc-950/60 bg-white/60 backdrop-blur-xl">
                <Icon :name="button.icon" size="64px" />
                <span class="font-light">{{ button.name }}</span>
                <div class="absolute bottom-0 w-full h-1 transition-all bg-special blur-3xl"></div>
            </div>
        </div>

        <div class="mt-16">
            <h1 class="text-3xl font-bold mb-1">Users</h1>
            <div
                class="flex gap-2 relative w-full items-center text-muted-foreground hover:text-black dark:hover:text-white">
                <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
                    <Icon v-if="isSearching" name="svg-spinners:180-ring-with-bg" size="16px" />
                    <Icon v-else ref="icon" name="material-symbols:search-rounded" size="16px" />
                </span>
                <Input ref="searchbar" id="search" type="text" placeholder="Search users..."
                    autocomplete="one-time-code"
                    class="pl-7 w-full focus-visible:text-black dark:focus-visible:text-white focus-visible:placeholder:text-black dark:focus-visible:placeholder:text-white bg-transparent dark:bg-transparent"
                    @focus="handleFocus" @blur="handleBlur" @input="handleSearchInput" />
                <Button variant="outline" class="bg-transparent dark:bg-transparent">
                    <Icon name="material-symbols-light:person-add-outline-rounded" size="24px" />
                    New user
                </Button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                <div v-for="user in users" :key="user._id"
                    class="flex gap-4 border rounded-md dark:bg-zinc-950/10 bg-white/10 backdrop-blur-xl text-muted-foreground relative overflow-hidden">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger as-child>
                                <Icon v-if="user.role === 'admin'" name="material-symbols-light:crown-outline-rounded"
                                    size="24px" class="absolute top-2 right-2 text-special" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Admin</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <div class="py-4 pl-4">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger as-child>
                                    <NuxtLink :to="`/profile/${user.username}`">
                                        <Avatar class="h-20 w-20 mb-3 border cursor-pointer m-0">
                                            <AvatarImage :src="'data:image/jpg;base64,' + user.avatarB64" />
                                            <AvatarFallback class="text-2xl">{{ user.username.charAt(0).toUpperCase() }}
                                            </AvatarFallback>
                                        </Avatar>
                                    </NuxtLink>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Go to profile</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div class="py-4 pr-4">
                        <p><strong>{{ user.username }}</strong></p>
                        <p class="text-xs"><strong>Created at:</strong> {{ user.createdAt.split('T')[0] }}</p>
                        <p class="text-xs"><strong>ID:</strong> {{ user._id }}</p>
                    </div>
                    <div class="absolute bottom-0 w-full h-1 transition-all bg-special blur-3xl"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
