import { type NextRequest, NextResponse } from "next/server";

// Next.js 14 Route Handler: request.headers is synchronous
export function GET(request: NextRequest) {
  const token = request.headers.get("x-auth-token");
  return NextResponse.json({ status: "ok", authenticated: Boolean(token) });
}
