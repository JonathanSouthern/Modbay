import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUsage } from "@/lib/ratelimit";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const usage = await getUsage(userId);
  return NextResponse.json(usage);
}
