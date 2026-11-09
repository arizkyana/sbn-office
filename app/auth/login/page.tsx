import { Suspense } from "react";
import { Login, RedirectIfAdmin } from "@/containers/auth/login";

export default function LoginPage() {
  return (
    <>
      <Suspense fallback={null}>
        <RedirectIfAdmin />
      </Suspense>
      <Login />
    </>
  );
}
