<script setup>
import { useDebounceFn } from '@vueuse/core'

const activeColor = ref("#303030")
let changeActiveColor = undefined

onMounted(() => {
    const { specialColor, changeSpecialColor } = useSpecialColor()
    activeColor.value = specialColor.value
    changeActiveColor = useDebounceFn((event) => {
        changeSpecialColor(event)
    }, 50)
})
</script>

<template>
    <div class="flex w-full justify-center">
        <div
            class="flex flex-col items-center justify-center md:flex-row animate-in fade-in slide-in-from-bottom-[5%] duration-500 border w-full rounded-md bg-white/50 dark:bg-zinc-950/50">
            <div class="flex flex-col items-center justify-center h-full border-r p-6">
                <Avatar
                    class="h-40 w-40 md:h-[10vw] md:w-[10vw] max-h-100 max-w-100 hover:border-special/30 dark:hover:border-special/30 hover:ring-special/30 dark:hover:ring-special/30 hover:ring-[4px] dark:hover:ring-[4px] cursor-pointer">
                    <AvatarImage src="https://avatars.githubusercontent.com/u/59648771?v=4&size=1048"
                        alt="profile-picture" />
                    <AvatarFallback class="text-6xl">RH</AvatarFallback>
                </Avatar>
                <p class="mt-3 font-bold">Leafar</p>
                <p class="mt-0 text-muted-foreground">Joined at: 14-09-2020</p>
            </div>

            <div class="flex flex-col grow p-6">
                <div class="mb-2">
                    <label for="name">Name</label>
                    <Input autocomplete="one-time-code" class="w-full" placeholder="Leafar" name="name" />
                </div>
                <div class="mb-2">
                    <label for="email">Email</label>
                    <Input autocomplete="one-time-code" placeholder="dellekeshub@gmail.com" name="email" />
                </div>
                <div class="mb-2">
                    <label for="password">Password</label>
                    <Input type="password" autocomplete="one-time-code" placeholder="Password" name="password" />
                </div>
                <!-- <div class="mb-2">
                <label for="theme">Theme</label>
                <Select v-model="$colorMode.preference" name="theme">
                    <SelectTrigger>
                        <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="system">
                                System
                            </SelectItem>
                            <SelectItem value="dark">
                                Dark
                            </SelectItem>
                            <SelectItem value="light">
                                Light
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div> -->
                <div class="flex flex-col mb-2">
                    <label for="color">Color</label>
                    <input class="color-picker" type="color" :value="activeColor" @input="changeActiveColor"
                        name="color">
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.color-picker {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 50px;
    height: 50px;
    background-color: transparent;
    border: none;
    cursor: pointer;
}

.color-picker::-webkit-color-swatch {
    border-radius: 8px;
    border: none;
}

.color-picker::-moz-color-swatch {
    border-radius: 8px;
    border: none;
}
</style>
