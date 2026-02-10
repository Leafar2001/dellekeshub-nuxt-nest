<script setup>
const router = useRouter()
const userRole = await useAuth().getUserRole()
const navbar = ref()
const navbarItems = ref([
    { name: "Home", route: "/", icon: "material-symbols:home-outline-rounded", auth: ["user", "admin"] },
    { name: "Browse", route: "/browse", icon: "ri:movie-2-line", auth: ["user", "admin"] },
    { name: "Watchlist", route: "/watchlist", icon: "ic:outline-remove-red-eye", auth: ["user", "admin"] },
    { name: "Profile", route: "/profile", icon: "material-symbols:account-box-outline", auth: ["user", "admin"] },
    { name: "Settings", route: "/settings", icon: "fluent:settings-24-regular", auth: ["user", "admin"] },
    { name: "Admin", route: "/admin", icon: "eos-icons:admin-outlined", auth: ["admin"] }
])

onMounted(() => {
    window.addEventListener('scroll', darkenNavbar)
})
onUnmounted(() => {
    window.removeEventListener('scroll', darkenNavbar)
})

async function logoutUser() {
    try {
        const response = await useFetch('/api/auth/logout', {
            method: "POST"
        })
        return navigateTo("/login")
    } catch (err) {
        console.error(err)
    }
}

function darkenNavbar() {
    if (window.scrollY > 50) {
        navbar.value.classList.add("!bg-background/90")
        navbar.value.classList.add("border-b")
    }
    else {
        navbar.value.classList.remove("!bg-background/90")
        navbar.value.classList.remove("border-b")
    }
}
</script>

<template>
    <nav class="flex items-center justify-between w-full h-20 px-4 md:px-10 bg-background/0 sticky top-0 backdrop-blur-xs z-90 transition-colors duration-400 ease-in-out"
        ref="navbar">
        <NuxtLink to="/" class="w-fit h-fit cursor-pointer animate-in fade-in slide-in-from-bottom duration-500">
            <img class="max-h-9 object-contain" src="/icons/dellekes_logo.png" alt="logo">
        </NuxtLink>
        <div class="hidden items-center gap-2 md:flex animate-in fade-in slide-in-from-bottom duration-500">
            <Searchbar class="!w-[50vw]" />
            <div class="flex gap-2">
                <Button variant="outline">
                    <NuxtLink to="/browse" class="flex items-center gap-1">
                        <Icon name="ri:movie-2-line" size="16px" />
                        Browse
                    </NuxtLink>
                </Button>
            </div>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger class="cursor-pointer animate-in fade-in slide-in-from-bottom duration-500">
                <Avatar
                    class="h-9 w-9 hover:border-special/30 dark:hover:border-special/30 hover:ring-special/30 dark:hover:ring-special/30 hover:ring-[4px] dark:hover:ring-[4px]">
                    <AvatarImage src="https://avatars.githubusercontent.com/u/59648771?v=4&size=1048"
                        alt="profile-picture" />
                    <AvatarFallback>ME</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-screen mt-4 lg:w-100 lg:mr-5">
                <template v-for="item in navbarItems">
                    <DropdownMenuItem v-if="item.auth.includes(userRole.role)" asChild>
                        <NuxtLink :to="item.route" class="py-4">
                            <Icon :name="item.icon" size="20px" />
                            {{ item.name }}
                        </NuxtLink>
                    </DropdownMenuItem>
                </template>
                <DropdownMenuItem asChild>
                    <NuxtLink @click="logoutUser" class="py-4">
                        <Icon name="material-symbols:logout-rounded" size="20px" />
                        Logout
                    </NuxtLink>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </nav>
</template>

<style scoped></style>
