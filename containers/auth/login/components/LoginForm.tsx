"use client";

import Image from "next/image";
import { Loader2Icon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useLogin from "../hooks/useLogin";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginForm() {
  const {
    handleSubmit,
    onSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useLogin();

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center text-center">
        <Image
          src="/logo-sbn.jpg"
          alt="Logo Sobat Baik Nusantara"
          width={72}
          height={72}
          className="mx-auto rounded-full"
          priority
        />
        <CardTitle className="text-lg">SBN Office</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {errors.root && (
            <p role="alert" className="text-sm text-destructive">
              {errors.root.message}
            </p>
          )}
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col gap-1.5">
                <Input
                  {...field}
                  type="email"
                  placeholder="email"
                  autoComplete="email"
                  aria-invalid={!!error}
                />
                {error && (
                  <p className="text-sm text-destructive">{error.message}</p>
                )}
              </div>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col gap-1.5">
                <Input
                  {...field}
                  type="password"
                  placeholder="password"
                  autoComplete="current-password"
                  aria-invalid={!!error}
                />
                {error && (
                  <p className="text-sm text-destructive">{error.message}</p>
                )}
              </div>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2Icon className="animate-spin" />}
            Masuk
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
