const config = useRuntimeConfig()
export default defineEventHandler(async (event) => {
    // Check if session cookie is present
    const cookie = getHeader(event, "cookie") || "";
    if (!cookie) throw createError({ statusCode: 401, statusMessage: "No session found" });
    console.log(cookie)

    // Send the cookie to NestJS for verification
    try {
        const response = await $fetch(`${config.BACKEND_API_URL}/auth/me`, {
            method: "GET",
            headers: { cookie: cookie },
            credentials: "include",
        });
        
        return response;
    } catch (err: any) {
        // Forward NestJS status code
        throw createError({ statusCode: err.response?.status || 500, statusMessage: err.message });
    }
})