"use client";

import Image, { type ImageProps } from "next/image";
import { createContext, useContext, type PropsWithChildren } from "react";
import { DEFAULT_LOGO_SRC } from "@/lib/logo";

const LogoContext = createContext(DEFAULT_LOGO_SRC);

/**
 * Menyediakan URL logo dari root layout (`getLogoSrc()`), agar `SiteLogo` bisa
 * dipakai di server maupun client component tanpa meneruskan props.
 */
export function LogoProvider({
  src,
  children,
}: PropsWithChildren<{ src: string }>) {
  return <LogoContext value={src}>{children}</LogoContext>;
}

type SiteLogoProps = Omit<ImageProps, "src" | "width" | "height"> & {
  /** Lebar dan tinggi dalam px; logo selalu persegi. */
  size: number;
};

/** Logo utama dari pengaturan, atau logo bawaan bila belum diganti. */
export function SiteLogo({ size, alt, ...props }: SiteLogoProps) {
  const src = useContext(LogoContext);
  return <Image src={src} alt={alt} width={size} height={size} {...props} />;
}
