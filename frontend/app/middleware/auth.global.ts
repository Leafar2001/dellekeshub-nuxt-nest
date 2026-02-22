export default defineNuxtRouteMiddleware(async (to, from) => {
    const publicPages = ["/login", "/register"]
    const adminPages = ["/upload", "/edit", "/admin"]
    
    // Login and register routes without checks
    if(publicPages.includes(to.path)) return

    // Get user role if session is present
    const user:any = await useAuth().getUserRole()
    console.log('User Role: ', user?.role)

    // If no user after fetch --> redirect to login
    if (!user) return navigateTo("/login")

    // Check if route requires admin privileges and user is admin.
    if (adminPages.includes(to.path) && user.role !== "admin") {
        return navigateTo("/")
    }
})