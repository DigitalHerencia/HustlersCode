import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isProtectedRoute = createRouteMatcher([
  "/((?!sign-in(?:/.*)?$|sign-up(?:/.*)?$|api/webhooks/clerk$).*)",
])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId, redirectToSignIn } = auth()

    if (!userId) {
      return redirectToSignIn()
    }
  }
})

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
}
