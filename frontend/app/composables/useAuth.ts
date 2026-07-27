export const useAuth = () => {
    const config = useRuntimeConfig()
    const user = useState<any | null>('auth-user', () => null)
    const fetched = useState<boolean>('auth-user-fetched', () => false)

    const fetchUser = async (force = false) => {
        if (fetched.value && !force) return user.value

        try {
            const data: any = await $fetch(`${config.public.BACKEND_API_URL}/api/auth/get-session`, {
                credentials: 'include'
            })
            user.value = data?.user ?? null
        } catch {
            user.value = null
        }

        fetched.value = true
        return user.value
    }

    const setUser = (value: any) => {
        user.value = value
        fetched.value = true
    }

    const clearUser = () => {
        user.value = null
        fetched.value = false
    }

    return {
        user,
        fetchUser,
        getUserRole: fetchUser,
        setUser,
        clearUser
    }
}
