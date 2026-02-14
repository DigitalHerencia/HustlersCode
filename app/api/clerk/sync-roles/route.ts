import { NextResponse } from "next/server"
import { syncClerkRoleClaims } from "@/lib/authz/sync"

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export async function POST(req: Request) {
  const expectedSecret = process.env.CLERK_ROLE_SYNC_SECRET
  if (!expectedSecret) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
  }

  const secret = req.headers.get("x-role-sync-secret")
  if (!secret || secret !== expectedSecret) {
    return unauthorized()
  }

  const payload = await req.json()
  await syncClerkRoleClaims(payload)

  return NextResponse.json({ success: true })
}
