<script setup>
useHead({ title: "Login" })
definePageMeta({
    layout: false,
});
const config = useRuntimeConfig()
const username = ref()
const password = ref()
const inviteCode = ref()

async function loginUser(username, password) {
    const baseUrl = config.public.NUXT_API_URL_DEV
    const response = await $fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    if (response.message === "Successfully logged in.") navigateTo('/')
}
</script>

<template>
    <div class="flex flex-col items-center justify-center w-screen min-h-screen">
        <img class="w-30 mb-3" src="/icons/dellekes_logo.png" alt="logo">
        <form @submit.prevent="loginUser(username, password)">
            <div class="flex flex-col">
                <!-- <header>Login</header> -->
                <span class="text-center mb-2 text-muted-foreground">Register your account with an invite code.</span>
                <div class="flex flex-col gap-2 mb-2">
                    <Input v-model="username" class="min-w-30" type="text" placeholder="Username"
                        autocomplete="one-time-code" required />
                    <Input v-model="password" type="password" placeholder="Password" autocomplete="one-time-code"
                        required />
                    <Input v-model="inviteCode" type="text" placeholder="Invite code" autocomplete="one-time-code"
                        required />
                </div>
                <Button variant="outline" class="mb-2" type="submit">Sign up</button>
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