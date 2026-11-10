"use client";

import Image from "next/image";
import { Loader2Icon } from "lucide-react";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import useLogin from "../hooks/useLogin";

export default function LoginForm() {
  const {
    handleSubmit,
    onSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useLogin();

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center gap-2 text-center">
        <Image
          src="/logo-sbn.jpg"
          alt="Logo Sobat Baik Nusantara"
          width={48}
          height={48}
          className="mx-auto size-12 rounded-full"
          preload
        />
        <CardTitle className="text-xl font-bold">SBN Office</CardTitle>
        <CardDescription>
          Masuk untuk mengelola campaign dan donasi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
          noValidate
        >
          {errors.root && (
            <p role="alert" className="text-sm text-destructive">
              {errors.root.message}
            </p>
          )}
          <FieldGroup>
            <Controller
              control={control}
              name="email"
              render={({ field, fieldState: { error } }) => (
                <Field data-invalid={!!error}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={!!error}
                  />
                  <FieldError errors={[error]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field, fieldState: { error } }) => (
                <Field data-invalid={!!error}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    {...field}
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={!!error}
                  />
                  <FieldError errors={[error]} />
                </Field>
              )}
            />
          </FieldGroup>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2Icon className="animate-spin" />}
            Masuk
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
