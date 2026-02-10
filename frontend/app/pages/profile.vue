<script setup>
import { useDebounceFn } from '@vueuse/core'

const activeColor = ref("#303030")
const backgroundGifs = ref([
    "https://i.giphy.com/lSzQjkthGS1gc.webp",
    "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExcm9wZ2dzdjc0dWp1eTVuaWo1cDN6aDZuZ254YTIzOHNiMnN3ODIyZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1yT902UqU5fcFxjLbH/giphy.gif",
    "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdDcyamFycngwemF1cmxwYWZ4c2hmeWw5b3c1NWsyZ2phcTUxYzJyeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JNy7DzgqUnh9p93aru/giphy.gif",
    "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZzZlc2JmNnJiMWlqcXNrODdnNWQ4ODFwbHlmbmkzaHVxbzRweXllcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oKIPovaivfg1vZ6es/giphy.gif",
    "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbTc4c2E5NnFnbDU3bzZkOWJ1aGd6am4wcmowYmd6d2w3MGQxeHMxbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3ohhwucrl3sH0GjGzm/giphy.gif",
    "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmtxaHByYXVoZzZpZGsxc2J0bmJldjlwaXZ4enozcm0yMDJzNHhndCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1yT8T6tlASc5eIeKi1/giphy.gif",
    "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExczA3cW8yeTlzemF3eTJrZzlyMDN0eGdod29yY21sd2g2MGRlN2d4YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/8cj2FcTkeUHn5MVwBF/giphy.gif",
    "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDM3YThtdHd6eGl6MnZ2cTB0NDZ5cW9mazJpN2poa2djaGloYXJ4ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Qw26GnFIC0deEmw1rI/giphy.gif",
    "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdnZjbDlwdmQydGpieGYweHVhZ2pnaXZsY2ZsaGU0dXcyNTlwa3k1ciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/fWqqPvfrXGLMlXtfCw/giphy.gif",
    "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExemhnN3l1aXBxd3AxcWxqMjdpa2RpOGR2bXd1NXg4ejAyd3M2ampiMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/gghfSCTjiOM60Y6xfs/giphy.gif",
    "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExYW1rdWVvZ3VjMWpwbDBla3J4d2V4bjMxdHlnNTdxcHRkcm96NHMwcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l2SqcmBJxk04qUYrC/giphy.gif",
    "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWtwdGFiaTA3aGVieHJqMDhsb2tmNGdqOXYwZnFhYTJ3NXpjamwxZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/icPsylfDFk3MbSPtYl/giphy.gif"

])
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
            class="flex flex-col justify-center lg:flex-row animate-in fade-in slide-in-from-bottom-[5%] duration-500 border w-full min-h-[82vh] lg:max-h-[82vh] shadow-special/5 shadow-xl rounded-md bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl overflow-hidden">
            <div
                class="flex flex-col items-center justify-center h-fit lg:h-full border-b lg:border-r p-6 z-10 relative max-h-[600px] lg:max-h-full lg:min-w-[350px] lg:max-w-[350px] overflow-hidden">
                <img :src="backgroundGifs[7]" alt="background-gif"
                    class="absolute top-0 left-0 h-full w-full aspect-auto object-cover z-0 opacity-50">
                <Avatar
                    class="h-40 w-40 z-10 max-h-100 max-w-100 lg:h-[15vw] lg:w-[15vw] lg:min-w-60 lg:min-h-60 hover:border-special/30 dark:hover:border-special/30 hover:ring-special/30 dark:hover:ring-special/30 hover:ring-[4px] dark:hover:ring-[4px] cursor-pointer">
                    <AvatarImage src="https://avatars.githubusercontent.com/u/59648771?v=4&size=1048"
                        alt="profile-picture" />
                    <AvatarFallback class="text-6xl">RH</AvatarFallback>
                </Avatar>
                <p class="mt-3 font-bold text-2xl text-center z-10">Frederik jan doedelzak de derde</p>
                <p class="mt-0 text-xs z-10">
                    Joined at:
                    14-09-2020</p>
            </div>

            <div class="flex flex-col grow gap-3 p-6 z-10 overflow-hidden md:overflow-y-auto">
                <ProfileCardContainer title="Favorite movies">
                    <MediaCard v-for="i in 10" :key="i" title="Movie title" />
                </ProfileCardContainer>
                <ProfileCardContainer title="Achievements">
                    <MediaCard v-for="i in 10" :key="i" title="CSGO" />
                </ProfileCardContainer>
                <ProfileCardContainer title="Achievements">
                    <MediaCard v-for="i in 10" :key="i" title="CSGO" />
                </ProfileCardContainer>
                <ProfileCardContainer title="Reviews">
                    <ProfileCard></ProfileCard>
                </ProfileCardContainer>
                <!-- <div class="flex flex-col mb-2">
                    <label for="color">Color</label>
                    <input class="color-picker" type="color" :value="activeColor" @input="changeActiveColor"
                        name="color">
                </div> -->
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
