import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { getConnection } from "@/app/lib/db/drizzle";
import { students } from "@/app/lib/db/schema";
import { Webhook } from "svix";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET");
  }

  // Get the headers
  const headersList = headers();
  const svix_id = headersList.get("svix-id");
  const svix_timestamp = headersList.get("svix-timestamp");
  const svix_signature = headersList.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the raw body
  const rawBody = await req.text();

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(rawBody, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Parse the raw body as JSON
  const payload = JSON.parse(rawBody);

  // Handle the webhook
  const eventType = evt.type;
  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = payload.data;
    const db = await getConnection();

    try {
      // Create student record without a default role
      await db.insert(students).values({
        userId: id,
        email: email_addresses[0].email_address,
        firstName: first_name || "",
        lastName: last_name || "",
      });
    } catch (error) {
      console.error("Error creating student record:", error);
      return new Response("Error creating record", { status: 500 });
    }
  }

  return new Response("", { status: 200 });
}
