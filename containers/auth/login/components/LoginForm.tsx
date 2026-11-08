"use client";

import { Card } from "@/components/ui/card";
import useLogin from "../hooks/useLogin";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginForm() {
  const { handleSubmit, onSubmit, control } = useLogin();
  return (
    <Card className="p-3">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          control={control}
          name="username"
          render={({ field, fieldState: { error } }) => {
            return <Input {...field} placeholder="username" className="mb-5" />;
          }}
        />
        <Controller
          control={control}
          name="password"
          render={({ field, fieldState: { error } }) => {
            return (
              <Input
                {...field}
                type="password"
                placeholder="password"
                className="mb-5"
              />
            );
          }}
        />
        <Button type="submit">Masuk</Button>
      </form>
    </Card>
  );
}
