const config = useRuntimeConfig()
export default defineEventHandler(async (event) => {
    const cookie = getHeader(event, "cookie") || "";

    try {
        // Make fetch to extern auth server with session cookie
        const response:any = await $fetch(`${config.BACKEND_API_URL}/auth/logout`, {
            method: "POST",
            headers: { cookie: cookie },
        })
        console.log("Logout response from backend:", response)

        if (!response) {
            throw createError({ statusCode: response.status, message: 'Logout failed' })
        }
        
        deleteCookie(event, "sid", {
            path: "/"
        })

        return { status: 200, message: "Logged out successfully" };
    } catch (error) {
        throw createError({status: 500, message: "Something went wrong while trying to logout"})
    }
});
