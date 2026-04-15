import { NextResponse } from "next/server";
import { getAppSnapshot } from "@/lib/db";

export async function GET() {
  const snapshot = await getAppSnapshot();
  return NextResponse.json(snapshot.meetings);
}
