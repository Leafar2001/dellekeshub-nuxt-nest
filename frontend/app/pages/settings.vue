<script setup>
import { useDebounceFn } from '@vueuse/core'
import { toast } from 'vue-sonner'

const config = useRuntimeConfig()
const { user, fetchUser, setUser } = useAuth()

const name = ref("")
const email = ref("")
const currentPassword = ref("")
const newPassword = ref("")
const savingProfile = ref(false)
const savingPassword = ref(false)
const savingAvatar = ref(false)
const avatarInput = ref()

const activeColor = ref("#303030")
let changeActiveColor = undefined

onMounted(async () => {
    const { specialColor, changeSpecialColor } = useSpecialColor()
    activeColor.value = specialColor.value
    changeActiveColor = useDebounceFn((event) => {
        changeSpecialColor(event)
    }, 50)

    const me = await fetchUser()
    if (me) {
        name.value = me.name ?? ""
        email.value = me.email ?? ""
    }
})

async function saveProfile() {
    savingProfile.value = true
    try {
        const updated = await $fetch(`${config.public.BACKEND_API_URL}/api/users/me`, {
            method: "PATCH",
            credentials: 'include',
            body: {
                name: name.value || undefined,
                email: email.value || null
            }
        })
        setUser({ ...user.value, ...updated })
        toast.success("Profile saved")
    } catch (error) {
        toast.error(error.data?.message || "Failed to save profile")
    } finally {
        savingProfile.value = false
    }
}

async function changePassword() {
    if (!currentPassword.value || !newPassword.value) {
        return toast.error("Please fill in both password fields")
    }
    savingPassword.value = true
    try {
        await $fetch(`${config.public.BACKEND_API_URL}/api/auth/change-password`, {
            method: "POST",
            credentials: 'include',
            body: {
                currentPassword: currentPassword.value,
                newPassword: newPassword.value
            }
        })
        currentPassword.value = ""
        newPassword.value = ""
        toast.success("Password changed")
    } catch (error) {
        toast.error(error.data?.message || "Failed to change password")
    } finally {
        savingPassword.value = false
    }
}

function triggerAvatarUpload() {
    avatarInput.value?.click()
}

async function onAvatarSelected(event) {
    const file = event.target.files?.[0]
    if (!file) return

    savingAvatar.value = true
    try {
        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(file)
        })

        const base64 = dataUrl.split(',')[1]

        const updated = await $fetch(`${config.public.BACKEND_API_URL}/api/users/me`, {
            method: "PATCH",
            credentials: 'include',
            body: { avatarB64: base64 }
        })
        setUser({ ...user.value, ...updated })
        toast.success("Avatar updated")
    } catch (error) {
        toast.error(error.data?.message || "Failed to upload avatar")
    } finally {
        savingAvatar.value = false
        event.target.value = ""
    }
}
</script>

<template>
    <div class="flex w-full justify-center">
        <div
            class="flex flex-col items-center justify-center md:flex-row animate-in fade-in slide-in-from-bottom-[5%] duration-500 border w-full rounded-md bg-white/50 dark:bg-zinc-950/50">
            <div class="flex flex-col items-center justify-center h-full border-r p-6">
                <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="onAvatarSelected">
                <Avatar @click="triggerAvatarUpload"
                    class="h-40 w-40 md:h-[10vw] md:w-[10vw] max-h-100 max-w-100 hover:border-special/30 dark:hover:border-special/30 hover:ring-special/30 dark:hover:ring-special/30 hover:ring-[4px] dark:hover:ring-[4px] cursor-pointer">
                    <AvatarImage v-if="user?.avatarB64" :src="'data:image/jpg;base64,' + user.avatarB64"
                        alt="profile-picture" />
                    <AvatarFallback class="text-6xl">{{ user?.username?.charAt(0).toUpperCase() }}</AvatarFallback>
                </Avatar>
                <p class="mt-3 font-bold">{{ user?.username }}</p>
                <p class="mt-0 text-muted-foreground">Joined at: {{ formatDate(user?.createdAt) }}</p>
            </div>

            <div class="flex flex-col grow p-6">
                <form @submit.prevent="saveProfile" class="mb-6">
                    <div class="mb-2">
                        <label for="name">Name</label>
                        <Input v-model="name" autocomplete="one-time-code" class="w-full" placeholder="Name"
                            name="name" />
                    </div>
                    <div class="mb-2">
                        <label for="email">Email</label>
                        <Input v-model="email" autocomplete="one-time-code" placeholder="Email" name="email" />
                    </div>
                    <Button variant="outline" type="submit" :disabled="savingProfile" class="mt-2">
                        <Icon v-if="savingProfile" name="svg-spinners:180-ring-with-bg" size="16px" />
                        Save profile
                    </Button>
                </form>

                <form @submit.prevent="changePassword" class="mb-6">
                    <div class="mb-2">
                        <label for="current-password">Current password</label>
                        <Input v-model="currentPassword" type="password" autocomplete="one-time-code"
                            placeholder="Current password" name="current-password" />
                    </div>
                    <div class="mb-2">
                        <label for="new-password">New password</label>
                        <Input v-model="newPassword" type="password" autocomplete="one-time-code"
                            placeholder="New password" name="new-password" />
                    </div>
                    <Button variant="outline" type="submit" :disabled="savingPassword" class="mt-2">
                        <Icon v-if="savingPassword" name="svg-spinners:180-ring-with-bg" size="16px" />
                        Change password
                    </Button>
                </form>

                <div class="flex flex-col mb-2">
                    <label for="color">Color</label>
                    <input class="color-picker" type="color" :value="activeColor" @input="changeActiveColor"
                        name="color">
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.color-picker {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 50px;
    height: 50px;
    background-color: transparent;
    border: none;
    cursor: pointer;
}

.color-picker::-webkit-color-swatch {
    border-radius: 8px;
    border: none;
}

.color-picker::-moz-color-swatch {
    border-radius: 8px;
    border: none;
}
</style>
