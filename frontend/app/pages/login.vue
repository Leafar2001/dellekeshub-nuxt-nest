<script setup>
useHead({ title: "Login" })
definePageMeta({
    layout: false,
});
const config = useRuntimeConfig()
const username = ref()
const password = ref()
const errorText = ref("")
const loading = ref(false)

async function loginUser() {
    errorText.value = ""
    loading.value = true
    try {
        const response = await $fetch(`${config.public.BACKEND_API_URL}/api/auth/sign-in/username`, {
            method: "POST",
            credentials: 'include',
            body: {
                username: username.value,
                password: password.value
            }
        })
        if (response.user) {
            useAuth().setUser(response.user)
            return navigateTo('/')
        }
        errorText.value = "Login failed. Please try again."
    } catch (error) {
        errorText.value = error.data?.message || "Invalid username or password."
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="flex flex-col items-center justify-center w-screen min-h-screen">
        <img class="w-30 mb-3" src="/icons/dellekes_logo.png" alt="logo">
        <form @submit.prevent="loginUser">
            <div class="flex flex-col">
                <span class="text-center mb-2 text-muted-foreground">Please enter your username and
                    password</span>
                <div v-if="errorText" class="flex items-center justify-center text-red-500 mb-2 text-sm">
                    <Icon name="material-symbols-light:warning-outline-rounded" class="text-xl mr-1" />
                    <p>{{ errorText }}</p>
                </div>
                <div class="flex flex-col gap-2 mb-2">
                    <Input v-model="username" class="min-w-30" type="text" placeholder="Username"
                        autocomplete="one-time-code" required />
                    <Input v-model="password" type="password" placeholder="Password" autocomplete="one-time-code"
                        required />
                </div>
                <Button variant="outline" class="mt-3 mb-2" type="submit" :disabled="loading">
                    <Icon v-if="loading" name="svg-spinners:180-ring-with-bg" size="16px" />
                    Login
                </button>
                <p class="text-sm flex justify-center gap-1 text-muted-foreground">Got a token? <NuxtLink
                        class="text-special hover:underline" to="/register">
                        Signup
                    </NuxtLink>
                </p>
            </div>
        </form>
        <div class="absolute top-0 left-0 bg-special w-full h-2 blur-3xl rounded-full -z-1"></div>
    </div>
</template>

<style scoped></style>
