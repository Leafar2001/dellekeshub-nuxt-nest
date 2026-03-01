import { z } from "zod";
import { registerSchema } from "../../utils/validationSchemas";

const config = useRuntimeConfig()
export default defineEventHandler(async (event) => {
    const cookie = getHeader(event, "cookie") || "";

    console.log("Received registration request with cookie:", cookie)

    // Read body from request
    const body = await readBody(event)

    const result = registerSchema.safeParse(body)

    if (!result.success) {
        throw createError({ statusCode: 400, message: 'Registration failed.', data: z.treeifyError(result.error), })
    }

    const { username, password, role } = result.data;

    console.log("Received registration request:", { username, password, role })

    try {
        // Make fetch to extern auth server with session cookie
        const response:any = await $fetch(`${config.BACKEND_API_URL}/auth/register`, {
            method: "POST",
            body: {
                username: username,
                password: password,
                role: role
            },
            headers: {
                "Content-Type": "application/json",
                cookie: cookie
            },
            credentials: "include"
        })

        console.log('REPONSE', response.data)
    } catch (error:any) {
        throw createError({ statusCode: error.status, message: `[${error.data.message[0].path[0]}] ${error.data.message[0].message}` })
    }

    return { status: 200, message: "Registered successfully" };
})