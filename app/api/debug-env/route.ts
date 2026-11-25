import { NextResponse } from "next/server";

export async function GET() {
  // Diagnostics are for local development only; never expose them on the live site.
  if (process.env.NODE_ENV === "production") return new NextResponse("Not found", { status: 404 });

  return NextResponse.json({
    GMAIL_USER: process.env.GMAIL_USER ? "✅ Present" : "❌ Missing",
    GMAIL_PASS: process.env.GMAIL_PASS ? "✅ Present" : "❌ Missing",
    ADMIN_EMAIL: process.env.ADMIN_EMAIL ? "✅ Present" : "❌ Missing",
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "Using default: http://localhost:3000"
  });
}
