<script setup>
useHead({ title: "Register" })
definePageMeta({
    layout: false,
});
const config = useRuntimeConfig()
const username = ref()
const password = ref()
const inviteCode = ref()
const errorText = ref("")
const successText = ref("")
const loading = ref(false)

async function registerUser() {
    errorText.value = ""
    successText.value = ""
    loading.value = true
    try {
        await $fetch(`${config.public.BACKEND_API_URL}/api/users/register`, {
            method: "POST",
            credentials: 'include',
            body: {
                username: username.value,
                password: password.value,
                inviteCode: inviteCode.value
            }
        })
        successText.value = "Account created! Redirecting to login..."
        setTimeout(() => navigateTo('/login'), 1500)
    } catch (error) {
        errorText.value = error.data?.message || "Registration failed. Please check your invite code."
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="flex flex-col items-center justify-center w-screen min-h-screen">
        <img class="w-30 mb-3" src="/icons/dellekes_logo.png" alt="logo">
        <form @submit.prevent="registerUser">
            <div class="flex flex-col">
                <span class="text-center mb-2 text-muted-foreground">Register your account with an invite code.</span>
                <div v-if="errorText" class="flex items-center justify-center text-red-500 mb-2 text-sm">
                    <Icon name="material-symbols-light:warning-outline-rounded" class="text-xl mr-1" />
                    <p>{{ errorText }}</p>
                </div>
                <div v-if="successText" class="flex items-center justify-center text-green-500 mb-2 text-sm">
                    <Icon name="material-symbols-light:check-circle-outline-rounded" class="text-xl mr-1" />
                    <p>{{ successText }}</p>
                </div>
                <div class="flex flex-col gap-2 mb-2">
                    <Input v-model="username" class="min-w-30" type="text" placeholder="Username"
                        autocomplete="one-time-code" required />
                    <Input v-model="password" type="password" placeholder="Password" autocomplete="one-time-code"
                        required />
                    <Input v-model="inviteCode" type="text" placeholder="Invite code" autocomplete="one-time-code"
                        required />
                </div>
                <Button variant="outline" class="mt-3 mb-2" type="submit" :disabled="loading">
                    <Icon v-if="loading" name="svg-spinners:180-ring-with-bg" size="16px" />
                    Sign up
                </button>
                <p class="text-sm flex justify-center gap-1 text-muted-foreground">Back to <NuxtLink
                        class="text-special hover:underline" to="/login">
                        login
                    </NuxtLink>
                </p>
            </div>
        </form>
    </div>
</template>

<style scoped></style>
