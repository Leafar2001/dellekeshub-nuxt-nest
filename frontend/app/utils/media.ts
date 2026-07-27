export function pickLocale(localized: any, preferred = 'en-US'): string {
    if (!localized) return ''
    if (typeof localized === 'string') return localized
    return localized[preferred] ?? Object.values(localized)[0] ?? ''
}

export function getImageUrl(imageId?: string | null): string | undefined {
    if (!imageId) return undefined
    const config = useRuntimeConfig()
    return `${config.public.BACKEND_API_URL}/api/static/images/${imageId}`
}

export function collectionThumbnail(collection: any): string | null {
    const images = collection?.images ?? []
    const thumbnail = images.find((i: any) => i.type === 'thumbnail') ?? images[0]
    return thumbnail?.image?.id ?? thumbnail?.imageId ?? null
}

export function videoThumbnail(video: any): string | null {
    const images = video?.images ?? []
    const thumbnail = images.find((i: any) => i.type === 'thumbnail')
        ?? images.find((i: any) => i.type === 'snapshot')
        ?? images[0]
    return thumbnail?.image?.id ?? thumbnail?.imageId ?? null
}

export function formatDate(date?: string): string {
    if (!date) return ''
    return date.split('T')[0]
}
