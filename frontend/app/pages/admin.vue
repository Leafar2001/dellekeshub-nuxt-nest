<script setup>
import { toast } from 'vue-sonner'
const { data: users, error, pending } = await useFetch("/api/user/all")

const editUserModal = ref({ show: false, user: undefined })
const addUserModal = ref({ show: false })
const isSearching = ref(false)
const refreshingUserList = ref({ loading: false, done: false })
const actionButtons = [
    { name: "Create media", path: "/", icon: "material-symbols-light:create-new-folder-outline-rounded" },
    { name: "Server Folder Structure", path: "/", icon: "material-symbols-light:folder-open-outline-rounded" },
    { name: "Search torrents", path: "/", icon: "material-symbols-light:video-search-rounded" },
]

function showEditUserModal(user) {
    editUserModal.value = { show: true, user }
    console.log("Show edit user modal for user:", user)
}

async function refreshUserList() {
    refreshingUserList.value = { loading: true, done: false }
    try {
        users.value = await $fetch("/api/user/all")

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
        <EditUserModal v-if="editUserModal.show" @close="editUserModal.show = false" :user="editUserModal.user" />
        <AddUserModal v-if="addUserModal.show" @close="addUserModal.show = false" />
        <h1 class="text-3xl font-bold mb-1">Actions</h1>
        <div class="flex flex-col md:flex-row gap-3">
            <div v-for="button in actionButtons" :key="button.name"
                class="flex flex-col grow items-center justify-center relative border hover:border-special overflow-hidden blob-parent p-4 md:h-40 rounded-md text-muted-foreground dark:text-zinc-300 hover:text-black dark:hover:text-white cursor-pointer dark:bg-zinc-950/20 bg-white/20 transition-all ease">
                <Icon :name="button.icon" size="64px" />
                <span class="font-light">{{ button.name }}</span>
                <!-- <div class="blob absolute bottom-0 w-full h-1 transition-all bg-special blur-3xl"></div> -->
            </div>
        </div>

        <div class="mt-16">
            <h1 class="text-3xl font-bold mb-1">Users</h1>
            <div
                class="flex gap-2 relative w-full items-center text-muted-foreground hover:text-black dark:hover:text-white">
                <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
                    <Icon v-if="isSearching" name="svg-spinners:180-ring-with-bg" size="16px" />
                    <Icon v-else ref="icon" name="material-symbols:search-rounded" size="16px" />
                </span>
                <Input ref="searchbar" id="search" type="text" placeholder="Search users..."
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
                <template v-for="item in 20">
                    <template v-for="user in users" :key="user._id">
                        <AdminUserCard :user="user" @click="showEditUserModal(user)" />
                    </template>
                </template>

            </div>
        </div>
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
