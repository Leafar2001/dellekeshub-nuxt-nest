<script setup>
</script>

<template>
    <div class="relative min-h-screen">
        <Navbar />
        <div class="absolute top-10 left-0 bg-special/70 w-full h-4 blur-3xl rounded-full -z-1 blob"></div>
        <div class="px-2 md:px-10 pt-5 mb-20">
            <slot />
        </div>
        <!-- <div class="absolute bottom-0 left-0 bg-special w-full h-2 blur-3xl rounded-full -z-1"></div> -->
        <!-- <div class="bottom-blob"></div> -->
    </div>
</template>

<style scoped>
.bottom-blob {
    position: absolute;
    z-index: -1;
    bottom: -80vh;
    left: 0;
    background-color: var(--special);
    width: 100vw;
    height: 10vh;
    filter: blur(500px);
}
</style>