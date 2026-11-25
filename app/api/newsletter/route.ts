import { adminDb } from "@/lib/firebase-admin";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || email.length > 254 || !emailPattern.test(email)) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }
    // Document id = email so repeat sign-ups are idempotent.
    await adminDb().collection("newsletter").doc(email).set({ email, subscribedAt: new Date() }, { merge: true });
    return Response.json({ success: true });
  } catch (error) {
    console.error("API /api/newsletter error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
