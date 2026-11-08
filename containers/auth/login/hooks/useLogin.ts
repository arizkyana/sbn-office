import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

const schema = z.object({
  password: z.string().nonempty(),
  username: z.string().nonempty(),
});

export type LoginForm = z.infer<typeof schema>;

export default function useLogin() {
  const form = useForm({
    defaultValues: {
      password: "",
      username: "",
    },
    resolver: zodResolver(schema),
  });

  const onSubmit = (values: LoginForm) => {
    console.log(values);
  };

  return {
    ...form,
    onSubmit,
  };
}
