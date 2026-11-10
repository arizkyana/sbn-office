import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResetOnHide } from "@/hooks/use-reset-on-hide";
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
  const resetOnHide = useResetOnHide();

  const onSubmit = async (values: LoginInput) => {
    // Login berhasil berarti redirect dan halaman login disembunyikan. Form
    // dikosongkan saat itu, agar email dan password tidak muncul lagi setelah logout.
    resetOnHide.schedule(() => form.reset());
    const result = await login(values);
    // Login berhasil: action melakukan redirect, tidak ada hasil yang perlu ditangani.
    if (!result || result.success) return;

    resetOnHide.cancel();

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
