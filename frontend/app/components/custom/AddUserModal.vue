<script setup>
import { toast } from 'vue-sonner'

const config = useRuntimeConfig()
const username = ref("")
const password = ref("")
const errorText = ref("")
const selectedRole = ref("user")
const roles = ["user", "admin"]

async function createNewUser() {
    if (!username.value || !password.value) {
        return errorText.value = "Please fill in all fields."
    }
    try {
        const response = await $fetch('/api/auth/register', {
            method: "POST",
            body: {
                username: username.value,
                password: password.value,
                role: selectedRole.value
            },
        })

        console.log("User created successfully:", response)

        toast.success("User created successfully")
        emit('close')
    } catch (error) {
        console.log("Error creating user:", error.data)
        return errorText.value = error.data?.message || "An error occurred while creating the user."
    }
}

const emit = defineEmits([
    'close'
])
</script>
<template>
    <ModalWrapper @close="emit('close')" title="Add user">
        <div @click.stop class="flex flex-col gap-3">
            <div v-if="errorText" class="flex items-center text-red-500">
                <Icon name="material-symbols-light:warning-outline-rounded" class="text-xl mr-1" />
                <p>{{ errorText }}</p>
            </div>
            <Input v-model="username" placeholder="Username" />
            <Input v-model="password" type="text" placeholder="Password" />
            <Select v-model="selectedRole" class="w-full">
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
        <div class="flex gap-2 justify-between mt-16">
            <Button variant="outline" @click="toast.success('User created successfully')">
                Cancel
            </Button>
            <Button variant="special" @click="createNewUser">
                Create new user
            </Button>
        </div>
    </ModalWrapper>
</template>
<style scoped></style>