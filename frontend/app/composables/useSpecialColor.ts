import { useStorage } from "@vueuse/core"

const specialColor = useStorage('special-color-preference', '#FFFFFF')

export const useSpecialColor = () => {

    const changeSpecialColor = (event: Event) => {
        if(!event) return "Accent color cannot be changed. No event has been found."

        specialColor.value = (event.target as HTMLInputElement).value
        document.documentElement.style.setProperty('--special', specialColor.value) // Update CSS variable immediately (even on first load)
        useStorage('special-color-preference', specialColor.value)
        return specialColor.value
    }

    // Update CSS variable immediately (even on first load)
    document.documentElement.style.setProperty('--special', specialColor.value)

    return {
        specialColor,
        changeSpecialColor,
    }
}