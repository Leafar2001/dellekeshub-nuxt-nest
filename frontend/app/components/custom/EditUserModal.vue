<script setup>
const config = useRuntimeConfig()
const props = defineProps({
    user: Object
})
const roles = ["admin", "user"]
const emit = defineEmits([
    'close'
])


</script>
<template>
    <ModalWrapper @close="emit('close')" title="Edit user">
        <div class="flex flex-col gap-2">
            <div class="flex justify-center">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger as-child>
                            <NuxtLink :to="`/profile/${props.user.username}`">
                                <Avatar class="h-20 w-20 md:h-[16vw] md:w-[16vw] mb-3 border cursor-pointer m-0">
                                    <AvatarImage :src="'data:image/jpg;base64,' + props.user.avatarB64" />
                                    <AvatarFallback class="text-2xl">{{ props.user.username.charAt(0).toUpperCase() }}
                                    </AvatarFallback>
                                </Avatar>
                            </NuxtLink>
                        </TooltipTrigger>
                        <TooltipContent class="z-90">
                            <p>Change profile picture</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <div class="flex gap-1 mt-4">
                <Input placeholder="Username" :model-value="props.user.username" />
                <Select :default-value="props.user.role">
                    <SelectTrigger class="w-[180px] cursor-pointer">
                        <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent class="z-90">
                        <SelectGroup>
                            <SelectLabel>Roles</SelectLabel>
                            <template v-for="role in roles">
                                <SelectItem :value="role">
                                    {{ role.charAt(0).toUpperCase() + role.slice(1) }}
                                </SelectItem>
                            </template>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div class="flex gap-2 justify-between mt-16">
                <Button variant="outline" @click="emit('close')">
                    Cancel
                </Button>
                <Button variant="special">
                    Save changes
                </Button>
            </div>
        </div>
    </ModalWrapper>
</template>
<style scoped></style>