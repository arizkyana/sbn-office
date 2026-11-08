import { PropsWithChildren } from "react";

export default function LoginLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex justify-center items-center h-full">{children}</div>
  );
}
