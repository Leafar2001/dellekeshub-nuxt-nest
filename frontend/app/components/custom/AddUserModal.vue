<script setup>
import { Label } from 'reka-ui';

const config = useRuntimeConfig()
const roles = ["admin", "user"]
const emit = defineEmits([
    'close'
])


</script>
<template>
    <ModalWrapper @close="emit('close')" title="Add user">
        <div @click.stop class="flex flex-col gap-3">
            <Input placeholder="Username" />
            <Input type="text" placeholder="Password" />
            <Select>
                <SelectTrigger class="w-full cursor-pointer">
                    <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent class="z-90">
                    <SelectGroup>
                        <SelectLabel>Roles</SelectLabel>
                        <template v-for="role in roles">
                            <SelectItem :value="role">
                                {{ role.charAt(0).toUpperCase() + role.slice(1) }}
                            </SelectItem>
                        </template>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
        <div class="flex gap-2 justify-between mt-16">
            <Button variant="outline" @click="emit('close')">
                Cancel
            </Button>
            <Button variant="special">
                Create new user
            </Button>
        </div>
    </ModalWrapper>
</template>
<style scoped></style>