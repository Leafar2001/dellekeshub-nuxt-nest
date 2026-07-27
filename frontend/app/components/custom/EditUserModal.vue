<script setup>
import { Label } from 'reka-ui';
import { toast } from 'vue-sonner'

const config = useRuntimeConfig()
const props = defineProps({
    user: Object
})
const roles = ["admin", "user"]
const emit = defineEmits([
    'close',
    'saved'
])

const username = ref(props.user?.username ?? "")
const selectedRole = ref(props.user?.role ?? "user")
const saving = ref(false)
const deleting = ref(false)
const confirmDelete = ref(false)

async function saveChanges() {
    if (!username.value) {
        return toast.error("Username cannot be empty")
    }

    saving.value = true
    try {
        await $fetch(`${config.public.BACKEND_API_URL}/api/users/id/${props.user.id}`, {
            method: "PATCH",
            credentials: 'include',
            body: {
                username: username.value,
                role: selectedRole.value
            }
        })
        toast.success("User updated")
        emit('saved')
        emit('close')
    } catch (error) {
        toast.error(error.data?.message || "Failed to update user")
    } finally {
        saving.value = false
    }
}

async function deleteUser() {
    if (!confirmDelete.value) {
        confirmDelete.value = true
        setTimeout(() => confirmDelete.value = false, 3000)
        return
    }

    deleting.value = true
    try {
        await $fetch(`${config.public.BACKEND_API_URL}/api/users/id/${props.user.id}`, {
            method: "DELETE",
            credentials: 'include'
        })
        toast.success("User deleted")
        emit('saved')
        emit('close')
    } catch (error) {
        toast.error(error.data?.message || "Failed to delete user")
    } finally {
        deleting.value = false
        confirmDelete.value = false
    }
}
</script>
<template>
    <ModalWrapper @close="emit('close')" title="Edit user">
        <div class="flex flex-col md:flex-row gap-5">
            <div class="flex justify-center">
                <Avatar class="h-40 w-40 md:h-[16vw] md:w-[16vw] mb-3 border m-0">
                    <AvatarImage v-if="props.user.avatarB64" :src="'data:image/jpg;base64,' + props.user.avatarB64" />
                    <AvatarFallback class="text-2xl">{{ props.user.username.charAt(0).toUpperCase() }}
                    </AvatarFallback>
                </Avatar>
            </div>
            <div class="flex flex-col w-full gap-3">
                <div>
                    <Label class="text-sm">Username</Label>
                    <Input v-model="username" placeholder="Username" />
                </div>
                <div>
                    <Label class="text-sm">Role</Label>
                    <Select v-model="selectedRole">
                        <SelectTrigger class="w-full cursor-pointer">
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
            </div>
        </div>
        <div class="flex gap-2 justify-between mt-16">
            <Button variant="outline" class="text-red-500" :disabled="deleting" @click="deleteUser">
                <Icon v-if="deleting" name="svg-spinners:180-ring-with-bg" size="16px" />
                {{ confirmDelete ? 'Confirm delete?' : 'Delete user' }}
            </Button>
            <div class="flex gap-2">
                <Button variant="outline" @click="emit('close')">
                    Cancel
                </Button>
                <Button variant="special" :disabled="saving" @click="saveChanges">
                    <Icon v-if="saving" name="svg-spinners:180-ring-with-bg" size="16px" />
                    Save changes
                </Button>
            </div>
        </div>
    </ModalWrapper>
</template>
<style scoped></style>
