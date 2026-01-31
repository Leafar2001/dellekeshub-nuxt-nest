const config = useRuntimeConfig()
export default defineEventHandler(async (event) => {
    // Check if session cookie is present
    const cookie = getHeader(event, "cookie") || "";
    if (!cookie) throw createError({ statusCode: 401, statusMessage: "No session found" });

    //Get imageId from route params of URL
    const imageId = getRouterParam(event, 'imageId')
    if (!imageId) throw createError({ statusCode: 401, statusMessage: "No imageId found" });

    // Send the imageId to Spring Boot and retreive image
    try {
        const response = await $fetch(`${config.BACKEND_API_URL}/api/v1/image/${imageId}/raw`, {
            method: "GET",
            headers: { cookie: cookie },
            credentials: "include",
        });

        return response;
    } catch (err: any) {
        throw createError({ statusCode: 500 });
    }
})