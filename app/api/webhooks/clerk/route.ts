import { headers } from "next/headers"
import { Webhook } from "svix"
import type { WebhookEvent } from "@clerk/nextjs/server"
import { query } from "@/lib/db"

export const runtime = "nodejs"

function getPrimaryEmail(event: WebhookEvent): string | null {
  if (!("data" in event) || typeof event.data !== "object" || !event.data) {
    return null
  }

  const emailAddresses = "email_addresses" in event.data ? event.data.email_addresses : undefined
  const primaryEmailId = "primary_email_address_id" in event.data ? event.data.primary_email_address_id : undefined

  if (!Array.isArray(emailAddresses)) {
    return null
  }

  const primaryEmail = emailAddresses.find((entry) => entry.id === primaryEmailId)
  return primaryEmail?.email_address ?? emailAddresses[0]?.email_address ?? null
}

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET

  if (!webhookSecret) {
    return new Response("Webhook signing secret is not configured", { status: 500 })
  }

  const headerPayload = headers()
  const svixId = headerPayload.get("svix-id")
  const svixTimestamp = headerPayload.get("svix-timestamp")
  const svixSignature = headerPayload.get("svix-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing required webhook headers", { status: 400 })
  }

  const payload = await req.text()

  let event: WebhookEvent
  try {
    const wh = new Webhook(webhookSecret)
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent
  } catch (error) {
    console.error("Invalid Clerk webhook signature", error)
    return new Response("Invalid signature", { status: 400 })
  }

  const eventId = svixId

  await query("BEGIN")

  try {
    const dedupeResult = await query(
      `INSERT INTO clerk_webhook_events (clerk_event_id, event_type)
       VALUES ($1, $2)
       ON CONFLICT (clerk_event_id) DO NOTHING
       RETURNING id`,
      [eventId, event.type],
    )

    if (dedupeResult.rows.length === 0) {
      await query("COMMIT")
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    }

    if (event.type === "user.created" || event.type === "user.updated") {
      const email = getPrimaryEmail(event)
      const userData = event.data

      await query(
        `INSERT INTO app_users (clerk_user_id, email, first_name, last_name, image_url, last_webhook_event_id, deleted_at)
         VALUES ($1, $2, $3, $4, $5, $6, NULL)
         ON CONFLICT (clerk_user_id)
         DO UPDATE SET
           email = EXCLUDED.email,
           first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           image_url = EXCLUDED.image_url,
           last_webhook_event_id = EXCLUDED.last_webhook_event_id,
           deleted_at = NULL,
           updated_at = NOW()`,
        [userData.id, email, userData.first_name, userData.last_name, userData.image_url, eventId],
      )
    }

    if (event.type === "user.deleted") {
      const userData = event.data
      if (userData.id) {
        await query(
          `UPDATE app_users
           SET deleted_at = NOW(),
               last_webhook_event_id = $2,
               updated_at = NOW()
           WHERE clerk_user_id = $1`,
          [userData.id, eventId],
        )
      }
    }

    await query(
      `UPDATE clerk_webhook_events
       SET status = 'processed', processed_at = NOW()
       WHERE clerk_event_id = $1`,
      [eventId],
    )

    await query("COMMIT")
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  } catch (error) {
    await query("ROLLBACK")
    console.error("Failed to process Clerk webhook", error)
    return new Response("Webhook processing failed", { status: 500 })
  }
}
