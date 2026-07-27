<script setup>
import { toast } from 'vue-sonner'

const config = useRuntimeConfig()
const invites = ref([])
const loading = ref(true)
const creating = ref(false)

async function loadInvites() {
    loading.value = true
    try {
        invites.value = await $fetch(`${config.public.BACKEND_API_URL}/api/invites`, {
            credentials: 'include'
        })
    } catch (error) {
        console.error('Failed to load invites:', error)
        toast.error("Failed to load invites")
    } finally {
        loading.value = false
    }
}

async function createInvite() {
    creating.value = true
    try {
        const invite = await $fetch(`${config.public.BACKEND_API_URL}/api/invites`, {
            method: 'POST',
            credentials: 'include'
        })
        invites.value = [invite, ...invites.value]
        await navigator.clipboard.writeText(invite.code).catch(() => { })
        toast.success(`Invite created: ${invite.code} (copied)`)
    } catch (error) {
        toast.error("Failed to create invite")
    } finally {
        creating.value = false
    }
}

async function deleteInvite(invite) {
    try {
        await $fetch(`${config.public.BACKEND_API_URL}/api/invites/${invite.id}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        invites.value = invites.value.filter(i => i.id !== invite.id)
        toast.success("Invite deleted")
    } catch (error) {
        toast.error("Failed to delete invite")
    }
}

async function copyCode(code) {
    await navigator.clipboard.writeText(code).catch(() => { })
    toast.success("Code copied")
}

onMounted(loadInvites)
</script>

<template>
    <div class="mt-16">
        <div class="flex items-center justify-between mb-3">
            <h1 class="text-3xl font-bold">Invite codes</h1>
            <Button variant="outline" :disabled="creating" @click="createInvite">
                <Icon v-if="creating" name="svg-spinners:180-ring-with-bg" size="16px" />
                <Icon v-else name="material-symbols-light:add-rounded" size="20px" />
                New invite
            </Button>
        </div>
        <div v-if="invites.length > 0" class="flex flex-col gap-2">
            <div v-for="invite in invites" :key="invite.id"
                class="flex items-center justify-between border rounded-md px-4 py-2">
                <div class="flex items-center gap-3">
                    <code class="font-mono text-lg tracking-widest cursor-pointer hover:text-special"
                        @click="copyCode(invite.code)">{{ invite.code }}</code>
                    <span v-if="invite.usedAt" class="text-xs text-muted-foreground">
                        Used by {{ invite.usedBy?.username ?? 'unknown' }} on {{ formatDate(invite.usedAt) }}
                    </span>
                    <span v-else class="text-xs text-green-500">Available</span>
                </div>
                <Button v-if="!invite.usedAt" variant="outline" size="icon" class="h-8 w-8"
                    @click="deleteInvite(invite)">
                    <Icon name="material-symbols-light:delete-outline-rounded" size="16px" />
                </Button>
            </div>
        </div>
        <p v-else-if="!loading" class="text-muted-foreground">No invite codes yet.</p>
    </div>
</template>

<style scoped></style>
