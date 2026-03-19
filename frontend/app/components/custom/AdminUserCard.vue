<script setup>
const props = defineProps({
    user: Object,
    route: String
})
</script>
<template>
    <div
        class="flex gap-4 border hover:border-special rounded-md dark:bg-zinc-950/10 bg-white/10 text-muted-foreground relative overflow-hidden cursor-pointer">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger as-child>
                    <Icon v-if="props.user.role === 'admin'" name="material-symbols-light:crown-outline-rounded"
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
                        <NuxtLink @click.stop :to="`/profile/${props.user.username}`">
                            <Avatar class="h-20 w-20 mb-3 border cursor-pointer m-0">
                                <AvatarImage :src="'data:image/jpg;base64,' + props.user.avatarB64" />
                                <AvatarFallback class="text-2xl">{{ props.user.username.charAt(0).toUpperCase() }}
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
            <p class="text-black dark:text-white"><strong>{{ props.user.username }}</strong></p>
            <p class="text-xs"><strong>Created at:</strong> {{ props.user.createdAt.split('T')[0] }}</p>
            <p class="text-xs"><strong>ID:</strong> {{ props.user._id }}</p>
        </div>
        <!-- <div class="blob absolute bottom-0 w-full h-1 transition-all bg-white/50 hover:bg-special blur-3xl">
                    </div> -->
    </div>
</template>
<style scoped></style>