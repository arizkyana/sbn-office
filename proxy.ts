import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

function isAuthPath(pathname: string) {
  return pathname.startsWith("/auth/");
}

// Redirect optimistis: hanya cek ada/tidaknya session. Pengecekan role ADMIN
// dilakukan di server lewat requireAdmin().
export async function proxy(request: NextRequest) {
  const { response, claims } = await updateSession(request);

  if (!claims && !isAuthPath(request.nextUrl.pathname)) {
    const redirectResponse = NextResponse.redirect(
      new URL("/auth/login", request.url),
    );
    response.cookies
      .getAll()
      .forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
