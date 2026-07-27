<script setup>
import { Label } from 'reka-ui'
import { toast } from 'vue-sonner'

const collectionData = ref({
    title: {
        "en-US": ""
    },
    description: {
        "en-US": ""
    },
    trailer: {
        "en-US": ""
    },
    type: ""
})
const errorText = ref("")
const collectionTypes = ["movie", "series"]

async function createNewCollection() {
    try {
        const config = useRuntimeConfig()
        const response = await $fetch(`${config.public.BACKEND_API_URL}/api/collections`, {
            method: "POST",
            credentials: 'include',
            body: collectionData.value
        })
        console.log("Collection created successfully:", response)
        toast.success("Collection created successfully")
        emit('close')
    } catch (error) {
        console.log("Error creating collection:", error.data)
        return errorText.value = error.data?.message || "An error occurred while creating the collection."
    }
}

const emit = defineEmits([
    'close'
])
</script>
<template>
    <ModalWrapper @close="emit('close')" title="Add collection">
        <div @click.stop class="flex flex-col gap-3">
            <div v-if="errorText" class="flex items-center text-red-500">
                <Icon name="material-symbols-light:warning-outline-rounded" class="text-xl mr-1" />
                <p>{{ errorText }}</p>
            </div>
            <div>
                <Label>Title</Label>
                <Input v-model="collectionData.title['en-US']" placeholder="Title" />
            </div>
            <div>
                <Label>Description</Label>
                <Input v-model="collectionData.description['en-US']" placeholder="Description" />
            </div>
            <div>
                <Label>Trailer URL</Label>
                <Input v-model="collectionData.trailer['en-US']" placeholder="Trailer URL" />
            </div>
            <div>
                <Label>Collection type</Label>
                <Select v-model="collectionData.type" class="w-full">
                    <SelectTrigger class="w-full cursor-pointer">
                        <SelectValue placeholder="Collection type" />
                    </SelectTrigger>
                    <SelectContent class="z-90">
                        <SelectGroup>
                            <template v-for="type in collectionTypes">
                                <SelectItem :value="type">
                                    {{ type.charAt(0).toUpperCase() + type.slice(1) }}
                                </SelectItem>
                            </template>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <div class="flex gap-2 justify-between mt-16">
            <Button variant="outline" @click="emit('close')">
                Cancel
            </Button>
            <Button variant="special" @click="createNewCollection">
                Create new collection
            </Button>
        </div>
    </ModalWrapper>
</template>
<style scoped></style>