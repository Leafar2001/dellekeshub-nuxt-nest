<script setup>
import { toast } from 'vue-sonner'
const config = useRuntimeConfig()
const { data: users } = await useFetch(`${config.public.BACKEND_API_URL}/api/users/all`, {
    credentials: 'include'
})

const editUserModal = ref({ show: false, user: undefined })
const addUserModal = ref({ show: false })
const addCollectionModal = ref({ show: false })
const searchQuery = ref("")
const refreshingUserList = ref({ loading: false, done: false })
const actionButtons = [
    { name: "Create collection", path: "/", icon: "material-symbols-light:create-new-folder-outline-rounded", action: () => addCollectionModal.value.show = true },
    { name: "Server Folder Structure", path: "/", icon: "material-symbols-light:folder-open-outline-rounded" },
    { name: "Search torrents", path: "/", icon: "material-symbols-light:video-search-rounded" },
]

const filteredUsers = computed(() => {
    if (!searchQuery.value) return users.value ?? []
    const query = searchQuery.value.toLowerCase()
    return (users.value ?? []).filter(user =>
        user.username?.toLowerCase().includes(query)
    )
})

function showEditUserModal(user) {
    editUserModal.value = { show: true, user }
}

async function refreshUserList() {
    refreshingUserList.value = { loading: true, done: false }
    try {
        users.value = await $fetch(`${config.public.BACKEND_API_URL}/api/users/all`, {
            credentials: 'include'
        })

        refreshingUserList.value = { loading: false, done: true }
        setTimeout(() => {
            refreshingUserList.value = { loading: false, done: false }
        }, 2000)
    } catch (error) {
        refreshingUserList.value = { loading: false, done: false }
        toast.error("Failed to refresh user list")
    }
}
</script>

<template>
    <div class="animate-in fade-in slide-in-from-bottom-[5%] duration-500">
        <AddCollectionModal v-if="addCollectionModal.show" @close="addCollectionModal.show = false" />
        <EditUserModal v-if="editUserModal.show" @close="editUserModal.show = false" :user="editUserModal.user"
            @saved="refreshUserList" />
        <AddUserModal v-if="addUserModal.show" @close="addUserModal.show = false" />
        <h1 class="text-3xl font-bold mb-1">Actions</h1>
        <div class="flex flex-col md:flex-row gap-3">
            <div v-for="button in actionButtons" :key="button.name" @click="button.action"
                class="flex flex-col grow items-center justify-center relative border hover:border-special overflow-hidden blob-parent p-4 md:h-40 rounded-md text-muted-foreground dark:text-zinc-300 hover:text-black dark:hover:text-white cursor-pointer dark:bg-zinc-950/20 bg-white/20 transition-all ease">
                <Icon :name="button.icon" size="64px" />
                <span class="font-light">{{ button.name }}</span>
            </div>
        </div>

        <div class="mt-16">
            <h1 class="text-3xl font-bold mb-1">Users</h1>
            <div
                class="flex gap-2 relative w-full items-center text-muted-foreground hover:text-black dark:hover:text-white">
                <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
                    <Icon ref="icon" name="material-symbols:search-rounded" size="16px" />
                </span>
                <Input v-model="searchQuery" id="search" type="text" placeholder="Search users..."
                    autocomplete="one-time-code"
                    class="pl-7 w-full focus-visible:text-black dark:focus-visible:text-white focus-visible:placeholder:text-black dark:focus-visible:placeholder:text-white bg-transparent dark:bg-transparent" />
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger as-child>
                            <Button variant="outline" :disabled="refreshingUserList.loading"
                                class="bg-transparent dark:bg-transparent p-2" @click="refreshUserList">
                                <div class="flex items-center justify-center"
                                    :class="refreshingUserList.loading ? 'animate-spin' : ''">
                                    <Icon v-if="refreshingUserList.done" name="material-symbols-light:check-rounded"
                                        size="24px" />
                                    <Icon v-else name="material-symbols-light:sync-rounded" class="scale-x-[-1]"
                                        size="24px" />
                                </div>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Refresh users</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <Button variant="outline" class="bg-transparent dark:bg-transparent" @click="addUserModal.show = true">
                    <Icon name="material-symbols-light:person-add-outline-rounded" size="24px" />
                    New user
                </Button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                <template v-for="user in filteredUsers" :key="user.id">
                    <AdminUserCard :user="user" @click="showEditUserModal(user)" />
                </template>
            </div>
            <p v-if="filteredUsers.length === 0" class="text-muted-foreground mt-3">No users found.</p>
        </div>

        <InviteSection />
    </div>
</template>

<style scoped>
.blob {
    transition: all .2s ease-in-out;
}

.blob-parent:hover .blob {
    background-color: var(--special) !important;
    width: 100% !important;
}
</style>
