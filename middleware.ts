import { NextRequest, NextResponse } from "next/server"
import { deriveTenantLookupDomain, normalizeRequestHost } from "@/lib/tenant/host"

export function middleware(request: NextRequest) {
  const host = normalizeRequestHost(request.headers.get("x-forwarded-host") ?? request.headers.get("host"))

  if (!host) {
    return NextResponse.next()
  }

  const domain = deriveTenantLookupDomain(host)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-tenant-host", domain)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
