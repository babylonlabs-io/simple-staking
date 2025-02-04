import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Headers that could enable cache poisoning attacks if exposed
 */
const UNSAFE_HEADERS = new Set([
  "rsc", // Prevents RSC payload poisoning
  "x-middleware-prefetch", // Prevents prefetch cache poisoning
  "x-invoke-status", // Prevents status code override attacks
  "next-router-state-tree", // Additional Next.js internal headers
  "next-router-prefetch",
]);

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Remove potentially dangerous headers
  Array.from(response.headers.keys()).forEach((key) => {
    if (UNSAFE_HEADERS.has(key.toLowerCase())) {
      response.headers.delete(key);
    }
  });

  return response;
}

// Apply middleware to all routes except static assets and API
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
