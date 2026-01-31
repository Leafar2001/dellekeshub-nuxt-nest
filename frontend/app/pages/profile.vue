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
    <div
        class="flex flex-col items-center gap-4 md:flex-row md:gap-8 animate-in fade-in slide-in-from-bottom-[5%] duration-500">
        <div class="sticky top-25 flex flex-col items-center">
            <Avatar
                class="h-40 w-40 md:h-[15vw] md:w-[15vw] max-h-100 max-w-100 hover:border-special/30 dark:hover:border-special/30 hover:ring-special/30 dark:hover:ring-special/30 hover:ring-[4px] dark:hover:ring-[4px] cursor-pointer">
                <AvatarImage src="https://avatars.githubusercontent.com/u/59648771?v=4&size=1048"
                    alt="profile-picture" />
                <AvatarFallback class="text-6xl">RH</AvatarFallback>
            </Avatar>
            <p class="mt-3 font-bold">Leafar</p>
            <p class="mt-0 text-muted-foreground">Joined at: 14-09-2020</p>
        </div>
        <div class="w-[1px] bg-accent"></div>
        <div class="flex flex-col grow">
            <h1 class="hidden md:flex text-5xl font-bold mb-3">Profile</h1>
            <div class="mb-2">
                <label for="name">Name</label>
                <Input autocomplete="one-time-code" class="w-full" placeholder="Leafar" name="name" />
            </div>
            <div class="mb-2">
                <label for="email">Email</label>
                <Input autocomplete="one-time-code" placeholder="raafie.vdheijden@gmail.com" name="email" />
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
                <input class="color-picker" type="color" :value="activeColor" @input="changeActiveColor" name="color">
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
