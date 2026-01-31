import { z } from "zod";
import { setCookie } from "h3";
import { loginSchema } from "../../utils/validationSchemas";

const config = useRuntimeConfig()
export default defineEventHandler(async (event) => {
    // Read body from request
    const body = await readBody(event)

    const result = loginSchema.safeParse(body)

    if (!result.success) {
        throw createError({ statusCode: 400, message: 'Login failed.', data: z.treeifyError(result.error), })
    }

    const { username, password } = result.data;

    // Make fetch to extern auth server with session cookie
    const response:any = await $fetch.raw(`${config.BACKEND_API_URL}/auth/login`, {
        method: "POST",
        body: {
            username: username,
            password: password
        },
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include"
    })

    if (!response) {
        throw createError({ statusCode: response.status, message: 'Authentication failed' })
    }

    const cookieHeader = response.headers.get("set-cookie");
    if (cookieHeader) {
        // Pass cookie to the browser
        const [cookieName, cookieValue] = cookieHeader.split(";")[0].split("=");
        setCookie(event, cookieName, cookieValue, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
        });
    }

    return { status: 200, message: "Logged in successfully" };
})