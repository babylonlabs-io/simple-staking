import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const xrpAddress = searchParams.get("address");

  if (!xrpAddress) {
    return NextResponse.json(
      { error: "XRP address is required" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `https://api.doppler.finance/v1/xrpfi/staking-info/user/${xrpAddress}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error fetching staking info:", error);
    return NextResponse.json(
      { error: "Failed to fetch staking info" },
      { status: 500 },
    );
  }
}
