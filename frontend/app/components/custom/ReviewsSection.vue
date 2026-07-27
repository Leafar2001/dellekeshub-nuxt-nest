<script setup>
import { toast } from 'vue-sonner'

const props = defineProps({
    mediaId: {
        type: String,
        required: true
    }
})

const config = useRuntimeConfig()
const reviews = ref([])
const summary = ref({ average: 0, count: 0, myReview: null })
const rating = ref(undefined)
const comment = ref("")
const submitting = ref(false)

async function loadReviews() {
    try {
        const [reviewsResponse, summaryResponse] = await Promise.all([
            $fetch(`${config.public.BACKEND_API_URL}/api/reviews/${props.mediaId}`, { credentials: 'include' }),
            $fetch(`${config.public.BACKEND_API_URL}/api/reviews/${props.mediaId}/summary`, { credentials: 'include' })
        ])
        reviews.value = reviewsResponse
        summary.value = summaryResponse
    } catch (error) {
        console.error('Failed to load reviews:', error)
    }
}

async function submitReview() {
    if (!rating.value) {
        return toast.error("Please select a rating")
    }

    submitting.value = true
    try {
        await $fetch(`${config.public.BACKEND_API_URL}/api/reviews/${props.mediaId}/create`, {
            method: 'POST',
            credentials: 'include',
            body: {
                rating: Number(rating.value),
                comment: comment.value || undefined,
                mediaType: 'collection'
            }
        })
        toast.success("Review submitted")
        comment.value = ""
        rating.value = undefined
        await loadReviews()
    } catch (error) {
        toast.error(error.data?.message || "Failed to submit review")
    } finally {
        submitting.value = false
    }
}

onMounted(loadReviews)
</script>

<template>
    <div class="mt-8">
        <div class="flex items-center gap-3 mb-4">
            <h2 class="text-2xl font-bold">Reviews</h2>
            <div v-if="summary.count > 0" class="flex items-center gap-1 text-muted-foreground">
                <Icon name="material-symbols:star-rounded" class="text-special" size="20px" />
                <span class="font-medium">{{ summary.average.toFixed(1) }}</span>
                <span>({{ summary.count }} {{ summary.count === 1 ? 'review' : 'reviews' }})</span>
            </div>
        </div>

        <div v-if="summary.myReview" class="border rounded-md p-4 mb-4 bg-white/50 dark:bg-zinc-950/50">
            <div class="flex items-center gap-2 mb-1">
                <span class="font-medium">Your review</span>
                <span class="flex items-center">
                    <Icon v-for="star in 5" :key="star" name="material-symbols:star-rounded" size="16px"
                        :class="star <= summary.myReview.rating ? 'text-special' : 'text-zinc-600'" />
                </span>
            </div>
            <p v-if="summary.myReview.comment" class="text-sm text-muted-foreground">{{ summary.myReview.comment }}</p>
        </div>

        <form v-else @submit.prevent="submitReview" class="border rounded-md p-4 mb-4 bg-white/50 dark:bg-zinc-950/50">
            <div class="flex flex-col md:flex-row gap-3 md:items-center">
                <Select v-model="rating">
                    <SelectTrigger class="w-full md:w-40 cursor-pointer">
                        <SelectValue placeholder="Your rating" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem v-for="value in [5, 4, 3, 2, 1]" :key="value" :value="value">
                                {{ value }} {{ value === 1 ? 'star' : 'stars' }}
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Input v-model="comment" placeholder="Write a comment (optional)" class="grow" />
                <Button variant="special" type="submit" :disabled="submitting" class="shrink-0">
                    <Icon v-if="submitting" name="svg-spinners:180-ring-with-bg" size="16px" />
                    Submit
                </Button>
            </div>
        </form>

        <div v-if="reviews.length > 0" class="flex flex-col gap-3">
            <div v-for="review in reviews" :key="review.id" class="border rounded-md p-4">
                <div class="flex items-center gap-2 mb-1">
                    <NuxtLink :to="`/profile/${review.user?.username}`"
                        class="font-medium hover:text-special hover:underline">
                        {{ review.user?.username ?? 'Unknown user' }}
                    </NuxtLink>
                    <span class="flex items-center">
                        <Icon v-for="star in 5" :key="star" name="material-symbols:star-rounded" size="16px"
                            :class="star <= review.rating ? 'text-special' : 'text-zinc-600'" />
                    </span>
                    <span class="text-xs text-muted-foreground">{{ formatDate(review.createdAt) }}</span>
                </div>
                <p v-if="review.comment" class="text-sm text-muted-foreground">{{ review.comment }}</p>
            </div>
        </div>
        <p v-else class="text-muted-foreground">No reviews yet. Be the first to review!</p>
    </div>
</template>

<style scoped></style>
