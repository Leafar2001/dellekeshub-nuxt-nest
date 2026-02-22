const config = useRuntimeConfig()
export default defineEventHandler(async (event) => {
    // Check if session cookie is present
    const cookie = getHeader(event, "cookie") || "";
    if (!cookie) throw createError({ statusCode: 401, statusMessage: "No session found" });

    try {
        const response = await $fetch(`${config.BACKEND_API_URL}/users/all`, {
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