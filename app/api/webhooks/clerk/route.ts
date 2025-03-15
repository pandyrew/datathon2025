import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/app/lib/db/supabase";
import { Webhook } from "svix";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Missing CLERK_WEBHOOK_SECRET also yes here is a random change so i can push"
    );
  }

  // Get the headers
  const headersList = await headers();
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
    console.log("creating student", id, email_addresses, first_name, last_name);

    try {
      // Create student record without a default role
      const { error } = await supabaseAdmin.from("students").insert({
        id: uuidv4(),
        user_id: id,
        email: email_addresses[0].email_address,
        first_name: first_name || "",
        last_name: last_name || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error creating student record:", error.message);
        return new Response("Error creating record", { status: 500 });
      }
    } catch (error) {
      console.error("Error creating student record:", error);
      return new Response("Error creating record", { status: 500 });
    }
  }

  return new Response("", { status: 200 });
}
