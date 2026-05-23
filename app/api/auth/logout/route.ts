import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieJar = await cookies();
  cookieJar.delete("token");

  return NextResponse.json({ message: "Logged out successfully" });
}
