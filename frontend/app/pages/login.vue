<script setup>
useHead({ title: "Login" })
definePageMeta({
    layout: false,
});
const config = useRuntimeConfig()
const username = ref()
const password = ref()

async function loginUser(username, password) {
    const response = await $fetch(`${config.public.NUXT_API_URL}/api/auth/login`, {
        method: "POST",
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    if (response.status == 200) navigateTo('/')
}
</script>

<template>
    <div class="flex flex-col items-center justify-center w-screen min-h-screen">
        <img class="w-30 mb-3" src="/icons/dellekes_logo.png" alt="logo">
        <form @submit.prevent="loginUser(username, password)">
            <div class="flex flex-col">
                <!-- <header>Login</header> -->
                <span class="text-center mb-2 text-muted-foreground">Please enter your username and
                    password</span>
                <div class="flex flex-col gap-2 mb-2">
                    <Input v-model="username" class="min-w-30" type="text" placeholder="Username"
                        autocomplete="one-time-code" required />
                    <Input v-model="password" type="password" placeholder="Password" autocomplete="one-time-code"
                        required />
                </div>
                <Button variant="outline" class="mt-3 mb-2" type="submit">Login</button>
                <p class="text-sm flex justify-center gap-1 text-muted-foreground">Got a token? <NuxtLink
                        class="text-special hover:underline" to="/register">
                        Signup
                    </NuxtLink>
                </p>
            </div>
        </form>
        <div class="absolute top-0 left-0 bg-special w-full h-2 blur-3xl rounded-full -z-1"></div>
        <!-- <div class="absolute bottom-0 left-0 bg-special w-full h-2 blur-3xl rounded-full -z-1"></div> -->
    </div>
</template>

<style scoped></style>