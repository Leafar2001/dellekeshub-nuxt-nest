const config = useRuntimeConfig()
export default defineEventHandler(async (event) => {
    // Check if session cookie is present
    const cookie = getHeader(event, "cookie") || "";
    if (!cookie) throw createError({ statusCode: 401, statusMessage: "No session found" });

    // Check if query is present
    const mediaName = getQuery(event).title
    if(!mediaName) throw createError({ statusCode: 401, statusMessage: "No search query found" });

    // Send the media search query to backend
    try {
        const response = await $fetch(`${config.BACKEND_API_URL}/media/search?q=${mediaName}`, {
            method: "GET",
            headers: { cookie: cookie },
            credentials: "include",
        });

        return response;
    } catch (err: any) {
        // Forward backend status code
        throw createError({ statusCode: err.response?.status || 500, statusMessage: err.message });
    }
})