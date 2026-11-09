import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "../actions";
import { loginSchema, type LoginInput } from "../Login.types";

export default function useLogin() {
  const form = useForm<LoginInput>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginInput) => {
    const result = await login(values);
    // Login berhasil: action melakukan redirect, tidak ada hasil yang perlu ditangani.
    if (!result || result.success) return;

    Object.entries(result.fieldErrors ?? {}).forEach(([field, messages]) => {
      form.setError(field as keyof LoginInput, { message: messages[0] });
    });
    form.setError("root", { message: result.message });
  };

  return {
    ...form,
    onSubmit,
  };
}
