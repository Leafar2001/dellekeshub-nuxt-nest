export const useAuth = () => {

    const getUserRole = async() => {
        const response = await useFetch('/api/auth/me')
        if(!response) return null
        return response.data.value
    }

    return {
        getUserRole
    }
}