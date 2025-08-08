import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  try {
    return NextResponse.json({ currentValueUsd: 0 });
  } catch (error) {
    console.error("Error in portfolio current-value route:", error);
    return NextResponse.json(
      { error: "Failed to load portfolio current value" },
      { status: 500 },
    );
  }
}
